import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";

export async function loguearUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      return res.render("login", {error: "Credenciales inválidas.", success: ""});
    }
    
    const validacion = await bcrypt.compare(password, user.password);
    if (!validacion) {
      return res.status(401).json({ message: "/admin/login?error=Credenciales+inválidas" });
    }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "4h"
        }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 4 * 60 * 60 * 1000,
      });

      return res.redirect("/admin/dashboard");



    } catch (err) {
    next(err);
    }

    
}

export async function logOutUsuario(req, res, next) {
  res.clearCookie("jwt");
  return res.redirect("/admin/login?success=Sesión+cerrada+correctamente");
}
