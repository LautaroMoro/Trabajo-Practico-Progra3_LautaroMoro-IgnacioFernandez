import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";

export async function loguearUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
<<<<<<< HEAD
    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
        const passwordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
    next(err);
    }    
=======
    if (!email || !password) {
      return res.render("login", {error: "Por favor, complete todos los campos.", success: ""});
    }
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

>>>>>>> lautaro-dev
    
}

export async function logOutUsuario(req, res, next) {
<<<<<<< HEAD
  try {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
} catch (err) {
  next(err);
}
=======
  res.clearCookie("jwt");
  return res.redirect("/admin/login?success=Sesión+cerrada+correctamente");
>>>>>>> lautaro-dev
}
