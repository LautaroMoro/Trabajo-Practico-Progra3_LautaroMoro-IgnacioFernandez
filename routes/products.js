import { Router } from "express";
<<<<<<< HEAD
import { validarProducto, validarId, validarSync } from "../middlewares/validacionesProducto.js";
import * as productsController from "../controllers/productsController.js";

const router = Router();

router.post("/", validarProducto, productsController.crearProductos);
router.get("/", productsController.listarProductos);
router.put("/:id", validarId, validarProducto, productsController.actualizarProducto);
router.delete("/:id", validarId, validarProducto, productsController.eliminarProducto);
router.post("/sync", validarSync, productsController.sincronizarProductos);

export default router;
=======
import { body, param, query, validationResult } from "express-validator";
import { prisma } from "../db.js";

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Crear producto
router.post(
  "/",
  body("descripcion").isString().isLength({ min: 1, max: 120 }),
  body("precio").isFloat({ gt: 0 }),
  body("activo").optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const { descripcion, precio, activo = true } = req.body;
      const product = await prisma.product.create({
        data: {
          descripcion,
          precio,
          activo,
        },
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// Listar productos
router.get(
  "/",
  query("activos").optional().isBoolean().toBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const { activos } = req.query;
      const where = activos === undefined ? {} : { activo: activos };
      const products = await prisma.product.findMany({ where, orderBy: { id: "asc" } });
      res.json(products);
    } catch (err) {
      next(err);
    }
  }
);

// Actualizar producto
router.put(
    "/:id",
    param("id").isInt().toInt(),
    body("descripcion").optional().isString().isLength({ min: 1, max: 120 }),
    body("precio").optional().isFloat({ gt: 0 }),
    body("activo").optional().isBoolean(),
    validate,
    async (req, res, next) => {
try {
    const id = req.params.id;
    const data = {};
    if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion;
    if (req.body.precio !== undefined) data.precio = req.body.precio;
    if (req.body.activo !== undefined) data.activo = req.body.activo;

    const updated = await prisma.product.update({ where: { id: Number(id) }, data });
    res.json(updated);
} catch (err) {
    next(err);
    }
}   
);

// "Eliminar" producto (soft delete -> activo=false)
router.delete(
"/:id",
param("id").isInt().toInt(),
validate,
async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const updated = await prisma.product.update({
        where: { id },
        data: { activo: false },
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
}
);

// Upsert masivo para compatibilidad con productos de una API externa filtrada
router.post(
  "/sync",
  body().isArray({ min: 1 }),
  body("*.id").optional().isInt(),
  body("*.descripcion").isString().isLength({ min: 1, max: 120 }),
  body("*.precio").isFloat({ gt: 0 }),
  body("*.activo").optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const payload = req.body;
      const results = [];
      for (const p of payload) {
        const { id, descripcion, precio, activo = true } = p;
        if (id) {
          const up = await prisma.product.upsert({
            where: { id },
            update: { descripcion, precio, activo },
            create: { id, descripcion, precio, activo },
          });
          results.push(up);
        } else {
          const created = await prisma.product.create({ data: { descripcion, precio, activo } });
          results.push(created);
        }
      }
      res.json({ count: results.length, products: results });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
>>>>>>> Agus-dev
