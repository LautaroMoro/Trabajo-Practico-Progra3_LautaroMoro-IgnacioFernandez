import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import multer from "multer";
import { body, validationResult } from "express-validator";
import fs from "fs";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import { validarAdmin } from "./middlewares/auth.js";
import productsRouter from "./routes/productsRouter.js";
import ticketsRouter from "./routes/ticketsRouter.js";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------- MIDDLEWARES GENERALES ----------------
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ---------------- MULTER ----------------
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });


// ---------------- AUTH ROUTES ----------------
app.use("/admin", authRouter);
// ---------------- API ROUTES ----------------(manejo CRUD de productos)
app.use("/products", productsRouter);
app.use("/tickets", ticketsRouter);


// ---------------- API: CREAR ADMIN ----------------
app.post(
  "/api/admin/create",
  body("email").isEmail(),
  body("password").isLength({ min: 4 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const exists = await prisma.admin.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: "Admin ya existe" });

      const hashed = await bcrypt.hash(password, 10);

      const admin = await prisma.admin.create({
        data: { email, password: hashed }
      });

      return res.status(201).json({ ok: true, admin: { id: admin.id, email: admin.email } });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);


// ---------------- PRODUCT VIEWS (SIN SESIONES) ----------------
// Alta producto
app.get("/admin/products/new", validarAdmin, (req, res) => {
  res.render("product-form", {
    appName: "Panel Admin",
    product: null,
    action: "/admin/products",
    method: "POST",
    error: req.query.error,
    success: req.query.success
  });
});

// Crear producto
app.post(
  "/admin/products",
  validarAdmin,
  upload.single("thumbnail"),
  body("title").notEmpty(),
  body("price").isFloat({ gt: 0 }),
  body("stock").isInt({ min: 0 }),
  body("category").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map(e => e.msg).join(" - ");
      return res.redirect("/admin/products/new?error=" + msg);
    }

    try {
      const { title, description, price, stock, category } = req.body;
      const thumbnail = req.file ? `/uploads/${req.file.filename}` : "";

      await prisma.product.create({
        data: {
          title,
          description: description || "",
          price: parseFloat(price),
          stock: parseInt(stock),
          category,
          thumbnail,
          activo: true,
        },
      });

      return res.redirect("/admin/dashboard?success=Producto+creado");
    } catch (err) {
      console.error(err);
      return res.redirect("/admin/products/new?error=Error+al+crear");
    }
  }
);


// Editar producto VIEW
app.get("/admin/products/:id/edit",
  validarAdmin, 
  async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.redirect("/admin/dashboard?error=Producto+no+encontrado");
    }

    res.render("product-form", {
      appName: "Panel Admin",
      product,
      action: `/admin/products/${id}`,
      method: "POST",
      error: req.query.error,
      success: req.query.success
    });
});


// Editar producto POST
app.post(
  "/admin/products/:id",
  validarAdmin,
  upload.single("thumbnail"),
  body("title").notEmpty(),
  body("price").isFloat({ gt: 0 }),
  body("stock").isInt({ min: 0 }),
  body("category").notEmpty(),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const msg = errors.array().map(e => e.msg).join(" - ");
      return res.redirect(`/admin/products/${id}/edit?error=${msg}`);
    }

    try {
      const { title, description, price, stock, category, activo } = req.body;

      const data = {
        title,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        activo: activo === "on"
      };

      if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;

      await prisma.product.update({ where: { id }, data });

      return res.redirect("/admin/dashboard?success=Producto+modificado");

    } catch (err) {
      console.error(err);
      return res.redirect(`/admin/products/${id}/edit?error=Error+al+editar`);
    }
  }
);


// Toggle activo
app.post("/admin/products/:id/toggle", validarAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.redirect("/admin/dashboard?error=Producto+no+encontrado");

    await prisma.product.update({
      where: { id },
      data: { activo: !product.activo }
    });

    return res.redirect("/admin/dashboard?success=Estado+actualizado");

  } catch (err) {
    console.error(err);
    return res.redirect("/admin/dashboard?error=Error+de+toggle");
  }
});


// ---------------- API PRODUCTS ----------------
app.get("/api/products", async (req, res) => {
  // Paginación
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.max(1, Math.min(50, parseInt(req.query.limit) || 15));
    const skip = (page - 1) * perPage;
    // Verificamos si hay productos en la base de datos
    const total = await prisma.product.count({ where: { activo: true } });
    // <----------CASO 1: PRODUCTOS EN BDD LOCAL ---------->
    if (total > 0) {
      const products = await prisma.product.findMany({
        where: { activo: true },
        skip,
        take: perPage,
        orderBy: { id: "asc" }
      });

      return res.json({
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        products
      });
    }

    // <----------CASO 2: NO HAY PRODUCTOS EN BDD LOCAL -> TRAEMOS DE API EXTERNA ---------->
    // Definimos las URLs de las categorías a obtener
    // Documentacion axios: https://axios-http.com/docs/intro

    const URLS = [
      "https://dummyjson.com/products/category/mens-shirts",
      "https://dummyjson.com/products/category/womens-dresses",
      "https://dummyjson.com/products/category/mens-shoes"
    ];
    // Hacemos las peticiones en paralelo usando Promise.all para mayor eficiencia
    const [remeras, vestidos, zapatillas] = await Promise.all(
      URLS.map((url) => axios.get(url)));
    // Combinamos los productos en un solo array usando spread operator
    // documentacion: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

    const ropaCombinada = [
      ...remeras.data.products,
      ...vestidos.data.products,
      ...zapatillas.data.products
    ];
    // Guardamos los productos en la base de datos
    await prisma.product.createMany({
      data: ropaCombinada.map((p) => ({
        title: p.title,
        price: p.price,
        stock: p.stock,
        category: p.category,
        description: p.description,
        thumbnail: p.thumbnail,
        activo: true
      }))
    });

    // Devolvemos los productos combinados como respuesta
    return res.json({
      page: 1,
      perPage: ropaCombinada.length,
      total: ropaCombinada.length,
      totalPages: 1,
      products: ropaCombinada
    });
    // Fin de la lógica de si no hay productos
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


// GET product by id
app.get("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product);
});


// Crear product API
app.post("/api/products", validarAdmin,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { title, description = "", price, stock, category } = req.body;
      const thumbnail = req.file ? `/uploads/${req.file.filename}` : "";

      const product = await prisma.product.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          category,
          thumbnail,
          activo: true,
        },
      });

      res.status(201).json(product);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
});


// Actualizar producto
app.put("/api/products/:id", validarAdmin, upload.single("thumbnail"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, price, stock, category, activo } = req.body;

    const data = {
      title,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      activo: activo === "true",
    };

    if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;

    const product = await prisma.product.update({ where: { id }, data });

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Eliminar producto (soft delete)
app.delete("/api/products/:id", validarAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.update({ where: { id }, data: { activo: false } });

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ROOT ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START SERVER
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
