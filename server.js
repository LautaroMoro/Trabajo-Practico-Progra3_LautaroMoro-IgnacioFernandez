import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import multer from "multer";

const app = express();
const PORT = 3000;

// --- CONFIGURACIÓN ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Variables globales accesibles en todas las vistas EJS
app.locals.siteData = {
  siteName: "Mi Tienda Online",
  logo: "/images/logo-principal.png",
  adminLogo: "/images/logo-admin.png",
  favicon: "/images/favicon.png",
};

// --- Configurar almacenamiento de imágenes con Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// --- PRODUCTOS LOCALES (editables) ---
let localProducts = [
  {
    id: 1,
    nombre: "Remera Negra",
    tipo: "mens-shirts",
    precio: 29.99,
    activo: true,
    imagenPath: "images/remera.jpg",
  },
  {
    id: 2,
    nombre: "Zapatillas Deportivas",
    tipo: "mens-shoes",
    precio: 59.99,
    activo: false,
    imagenPath: "images/zapatillas.jpg",
  },
  {
    id: 3,
    nombre: "Ropa Mujer",
    tipo: "womens-dresses",
    precio: 49.99,
    activo: true,
    imagenPath: "images/vestido.jpg",
  },
];

// --- API COMBINADA ---
app.get("/api/products", async (req, res) => {
  try {
    const URLS = [
      "https://dummyjson.com/products/category/mens-shirts",
      "https://dummyjson.com/products/category/womens-dresses",
      "https://dummyjson.com/products/category/mens-shoes",
    ];

    const [remeras, vestidos, zapatillas] = await Promise.all(
      URLS.map((url) => axios.get(url))
    );

    const apiProducts = [
      ...remeras.data.products,
      ...vestidos.data.products,
      ...zapatillas.data.products,
    ].map((p) => ({
      id: p.id,
      nombre: p.title,
      tipo: p.category,
      precio: p.price,
      activo: true,
      imagenPath: p.thumbnail,
      origen: "api",
    }));

    res.json([...localProducts, ...apiProducts]);
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// --- LOGIN ---
app.get("/admin/login", (req, res) => {
  res.render("admin/login", { error: null, siteData: app.locals.siteData });
});

app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@empresa.com" && password === "admin123") {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin/login", {
    error: "Credenciales incorrectas",
    siteData: app.locals.siteData,
  });
});

// --- DASHBOARD ---
app.get("/admin/dashboard", async (req, res) => {
  const URLS = [
    "https://dummyjson.com/products/category/mens-shirts",
    "https://dummyjson.com/products/category/womens-dresses",
    "https://dummyjson.com/products/category/mens-shoes",
  ];
  const [remeras, vestidos, zapatillas] = await Promise.all(
    URLS.map((url) => axios.get(url))
  );
  const apiProducts = [
    ...remeras.data.products,
    ...vestidos.data.products,
    ...zapatillas.data.products,
  ].map((p) => ({
    id: p.id,
    nombre: p.title,
    tipo: p.category,
    precio: p.price,
    activo: true,
    imagenPath: p.thumbnail,
    origen: "api",
  }));

  const products = [...localProducts, ...apiProducts];

  res.render("admin/dashboard", {
    products,
    flash: "Panel de administración activo ",
    page: 1,
    totalPages: 1,
    siteData: app.locals.siteData,
  });
});

// --- NUEVO PRODUCTO ---
app.get("/admin/product/new", (req, res) => {
  res.render("admin/product_form", { product: null, siteData: app.locals.siteData });
});

app.post("/admin/product", upload.single("imagen"), (req, res) => {
  const { nombre, tipo, precio, activo } = req.body;

  const newProduct = {
    id: localProducts.length + 1,
    nombre,
    tipo,
    precio: parseFloat(precio),
    activo: activo === "on",
    imagenPath: req.file
      ? "images/" + req.file.filename
      : "images/placeholder.png",
  };

  localProducts.push(newProduct);
  res.redirect("/admin/dashboard");
});

// --- EDITAR PRODUCTO ---
app.get("/admin/product/:id/edit", (req, res) => {
  const id = parseInt(req.params.id);
  const product = localProducts.find((p) => p.id === id);
  if (!product)
    return res
      .status(404)
      .send("Producto no encontrado (solo editables locales)");
  res.render("admin/product_form", { product, siteData: app.locals.siteData });
});

app.put("/admin/product/:id", upload.single("imagen"), (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, tipo, precio, activo } = req.body;

  localProducts = localProducts.map((p) =>
    p.id === id
      ? {
          ...p,
          nombre,
          tipo,
          precio: parseFloat(precio),
          activo: activo === "on",
          imagenPath: req.file ? "images/" + req.file.filename : p.imagenPath,
        }
      : p
  );

  res.redirect("/admin/dashboard");
});

// --- ELIMINAR PRODUCTO ---
app.delete("/admin/product/:id", (req, res) => {
  const id = parseInt(req.params.id);
  localProducts = localProducts.filter((p) => p.id !== id);
  res.redirect("/admin/dashboard");
});

// --- TOGGLE ACTIVO ---
app.post("/admin/product/:id/toggle", (req, res) => {
  const id = parseInt(req.params.id);
  localProducts = localProducts.map((p) =>
    p.id === id ? { ...p, activo: !p.activo } : p
  );
  res.redirect("/admin/dashboard");
});

// --- INICIO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
