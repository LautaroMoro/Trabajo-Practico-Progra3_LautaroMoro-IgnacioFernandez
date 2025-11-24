import { Router } from "express";
import { validarAdmin } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";
import { forwardIfLogged } from "../middlewares/forwardIfLogged.js";
import { prisma } from "../db.js";

const router = Router();

// Login view
router.get("/login", forwardIfLogged, (req, res) => {
  res.render("login", {
    error: req.query.error || "",
    success: req.query.success || ""
  });
});

// Dashboard con paginación
router.get("/dashboard", validarAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            skip,
            take: limit,
            orderBy: { id: "asc" }
        }),
        prisma.product.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render("dashboard", {
        products,
        page,
        totalPages
    });
});

// Acciones
router.post("/login", authController.loguearUsuario);
router.post("/logout", validarAdmin, authController.logOutUsuario);

export default router;
