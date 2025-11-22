import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";

export async function loguearUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
        const passwordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
    next(err);
    }    
    
}

export async function logOutUsuario(req, res, next) {
  try {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
} catch (err) {
  next(err);
}
}
