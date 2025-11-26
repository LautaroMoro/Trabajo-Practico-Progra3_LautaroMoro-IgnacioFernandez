import validate from "./validacionesProducto.js";
import {param, body, query} from "express-validator";


export const validarId = [param("id").isInt().toInt(), validate()];


export const validarTicket = [
    body("nombreCliente").isString().isLength({ min: 1, max: 120 }),
    body("items").isArray({ min: 1 }),
    body("items.*.productId").isInt(),
    body("items.*.cantidad").isInt({ min: 1 }),
    validate()
];