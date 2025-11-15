import express from "express";
const router = express.Router();

// Mostrar el login
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// Procesar el formulario de login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Credenciales fijas de administrador
  if (email === "admin@empresa.com" && password === "admin123") {
    // Redirige al dashboard
    return res.redirect("/admin/dashboard");
  } else {
    // Vuelve al login con mensaje de error
    return res.render("admin/login", { error: "Credenciales incorrectas" });
  }
});

// Dashboard
router.get("/dashboard", (req, res) => {
  // Podés simular productos de prueba:
  const products = [
    { id: 1, nombre: "Remera azul", tipo: "ropa", precio: 25.5, activo: true, imagenPath: "images/remera.jpg" },
    { id: 2, nombre: "Zapatillas negras", tipo: "calzado", precio: 75.0, activo: false, imagenPath: "images/zapatillas.jpg" },
  ];

  res.render("admin/dashboard", {
    products,
    page: 1,
    totalPages: 1,
    flash: null
  });
});

export default router;
