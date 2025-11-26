import { Router } from "express";
import { validarProducto, validarId, validarSync } from "../middlewares/validacionesProducto.js";
import * as productsController from "../controllers/productsController.js";

const router = Router();

router.post("/products", validarProducto, productsController.crearProducto());
router.get("/products", productsController.listarProductos());
router.put("/products:id", validarId, validarProducto, productsController.actualizarProducto());
router.delete("/products:id", validarId, validarProducto, productsController.eliminarProducto());
router.post("/sync", validarSync, productsController.sincronizarProductos());

export default router;
