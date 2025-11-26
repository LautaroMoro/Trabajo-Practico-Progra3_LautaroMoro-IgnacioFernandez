//routes/tickets.js
import { Router } from "express";
import { validarTicket, validarId } from "../middlewares/validacionesTickets.js";
import * as ticketsController from "../controllers/ticketsController.js";

const router = Router();

// Crear ticket con items. El precio se congela al valor del producto en el momento de la compra.
router.post("/tickets", validarTicket, ticketsController.crearTicket());

// Consultar tickets
router.get("/tickets", validarTicket , ticketsController.consultarTickets());

// Consultar ticket por ID
router.get("/tickets:id", validarTicket, validarId, ticketsController.consultarTickets());



export default router;
