// src/routes/tickets.js

import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import ticketsController from "../controllers/ticketsController.js";
import  { validarTicket, validarId }  from "../middlewares/validacionesTickets.js";

const router = Router();

// Crear ticket con items. El precio se congela al valor del producto en el momento de la compra.
router.post("/tickets", validarTicket, ticketsController.crearTicket());

// Consultar tickets
router.get("/tickets", validarTicket , ticketsController.consultarTickets());

// Consultar ticket por ID
router.get("/tickets:id", validarTicket, validarId, ticketsController.consultarTickets());


export default router;
