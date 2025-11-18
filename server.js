import express from "express";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import multer from "multer";
import { body, validationResult } from "express-validator";
import fs from "fs";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SQLiteStore = SQLiteStoreFactory(session);

// ------------- MIDDLEWARES -------------
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------- SESSIONS -------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// ------------- MULTER (upload) -------------
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// ------------- AUTH MIDDLEWARE -------------
function requireAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect("/admin/login");
  next();
}
function forwardIfLogged(req, res, next) {
  if (req.session.adminId) return res.redirect("/admin/dashboard");
  next();
}

// ------------- LOGIN VIEWS & AUTH -------------
app.get("/admin/login", forwardIfLogged, (req, res) => {
  res.render("login", {
    appName: "Panel Admin",
    students: "Agustín González",
    error: req.session.flashError || "",
    success: req.session.flashSuccess || "",
  });

  req.session.flashError = null;
  req.session.flashSuccess = null;
});

// Process login
app.post(
  "/admin/login",
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Ingresar contraseña"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.flashError = errors.array().map(e => e.msg).join(" - ");
      return res.redirect("/admin/login");
    }
    const { email, password } = req.body;

    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        req.session.flashError = "Usuario o contraseña inválidos";
        return res.redirect("/admin/login");
      }

      const ok = await bcrypt.compare(password, admin.password);
      if (!ok) {
        req.session.flashError = "Usuario o contraseña inválidos";
        return res.redirect("/admin/login");
      }

      req.session.adminId = admin.id;
      req.session.flashSuccess = "Bienvenido";
      return res.redirect("/admin/dashboard");

    } catch (err) {
      console.error(err);
      req.session.flashError = "Error del servidor";
      return res.redirect("/admin/login");
    }
  }
);

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// ------------- API: crear admin -------------
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

// ------------- DASHBOARD (CORREGIDO) -------------
app.get("/admin/dashboard", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = 8;
  const skip = (page - 1) * perPage;

  const [total, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { id: "asc" },
      skip,
      take: perPage,
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});

  // ✅ FLASH VARIABLES AQUÍ (corrección)
  const flashError = req.session.flashError || "";
  const flashSuccess = req.session.flashSuccess || "";

  req.session.flashError = null;
  req.session.flashSuccess = null;

  res.render("dashboard", {
    appName: "Panel Admin",
    students: "Agustín González",
    products,
    byCategory,
    page,
    totalPages,
    flashError,
    flashSuccess,
    adminId: req.session.adminId,
  });
});

// ------------- VISTA ALTA PRODUCTO -------------
app.get("/admin/products/new", requireAdmin, (req, res) => {
  res.render("product-form", {
    appName: "Panel Admin",
    students: "Agustín González",
    product: null,
    action: "/admin/products",
    method: "POST",
  });
});

// ------------- CREAR PRODUCTO -------------
app.post(
  "/admin/products",
  requireAdmin,
  upload.single("thumbnail"),
  body("title").notEmpty().withMessage("Title requerido"),
  body("price").isFloat({ gt: 0 }).withMessage("Price debe ser mayor a 0"),
  body("stock").isInt({ min: 0 }).withMessage("Stock inválido"),
  body("category").notEmpty().withMessage("Category requerido"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.flashError = errors.array().map(e => e.msg).join(" - ");
      return res.redirect("/admin/products/new");
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

      req.session.flashSuccess = "Producto creado";
      return res.redirect("/admin/dashboard");

    } catch (err) {
      console.error(err);
      req.session.flashError = "Error al crear producto";
      return res.redirect("/admin/products/new");
    }
  }
);

// ------------- EDITAR PRODUCTO VIEW -------------
app.get("/admin/products/:id/edit", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    req.session.flashError = "Producto no encontrado";
    return res.redirect("/admin/dashboard");
  }

  res.render("product-form", {
    appName: "Panel Admin",
    students: "Agustín González",
    product,
    action: `/admin/products/${id}`,
    method: "POST",
  });
});

// ------------- EDITAR PRODUCTO (POST) -------------
app.post(
  "/admin/products/:id",
  requireAdmin,
  upload.single("thumbnail"),
  body("title").notEmpty(),
  body("price").isFloat({ gt: 0 }),
  body("stock").isInt({ min: 0 }),
  body("category").notEmpty(),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.flashError = errors.array().map(e => e.msg).join(" - ");
      return res.redirect(`/admin/products/${id}/edit`);
    }

    try {
      const { title, description, price, stock, category, activo } = req.body;

      const data = {
        title,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        activo: activo === "on" ? true : true,
      };

      if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;

      await prisma.product.update({ where: { id }, data });

      req.session.flashSuccess = "Producto modificado";
      return res.redirect("/admin/dashboard");

    } catch (err) {
      console.error(err);
      req.session.flashError = "Error al editar producto";
      return res.redirect(`/admin/products/${id}/edit`);
    }
  }
);

// ------------- TOGGLE ACTIVO -------------
app.post("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      req.session.flashError = "Producto no encontrado";
      return res.redirect("/admin/dashboard");
    }

    await prisma.product.update({
      where: { id },
      data: { activo: !product.activo }
    });

    req.session.flashSuccess = product.activo
      ? "Producto desactivado"
      : "Producto activado";

    return res.redirect("/admin/dashboard");

  } catch (err) {
    console.error(err);
    req.session.flashError = "Error al cambiar estado";
    return res.redirect("/admin/dashboard");
  }
});

// ------------- API PRODUCTS -------------
app.get("/api/products", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * perPage;

  const [total, products] = await Promise.all([
    prisma.product.count({ where: { activo: true } }),
    prisma.product.findMany({
      where: { activo: true },
      skip,
      take: perPage,
      orderBy: { id: "asc" },
    }),
  ]);

  res.json({
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
    products,
  });
});

app.get("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product);
});

app.post("/api/products", requireAdmin, upload.single("thumbnail"), async (req, res) => {
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

app.put("/api/products/:id", requireAdmin, upload.single("thumbnail"), async (req, res) => {
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

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
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
  if (req.session.adminId) return res.redirect("/admin/dashboard");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START SERVER
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
