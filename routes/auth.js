import { Router } from "express";
import { validarAdmin } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";



const router = Router();

router.post("/", validarAdmin, authController.loguearUsuario);
router.post("/", authController.logOutUsuario);


export default router;
