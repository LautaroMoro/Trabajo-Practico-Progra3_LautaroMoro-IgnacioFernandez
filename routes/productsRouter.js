import { Router } from "express";
import { validarProducto, validarId, validarSync } from "../middlewares/validacionesProducto.js";
import * as productsController from "../controllers/productsController.js";

const router = Router();

// CRUD
router.post("/", validarProducto, productsController.crearProducto);
router.get("/", productsController.listarProductos);
router.put("/:id", validarId, validarProducto, productsController.actualizarProducto);
router.delete("/:id", validarId, validarProducto, productsController.eliminarProducto);
router.post("/sync", validarSync, productsController.sincronizarProductos);

// ✅ COMPRA Y DESCUENTO DE STOCK
router.post("/comprar", productsController.procesarCompra);

export default router;
