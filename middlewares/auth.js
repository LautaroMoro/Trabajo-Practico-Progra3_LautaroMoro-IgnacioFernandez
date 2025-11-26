<<<<<<< HEAD
import jwt from 'jsonwebtoken';

export const validarAdmin = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};


/* 
module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) return next();
    req.flash('error', 'Debe iniciar sesión para acceder');
    return res.redirect('/admin/login');
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.session || !req.session.user) return next();
    return res.redirect('/admin/dashboard');
  }
};
*/
=======
import jwt from 'jsonwebtoken';

export const validarAdmin = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.log("JWT invalido:", error);
    return res.redirect("/admin/login");
  }
};
>>>>>>> lautaro-dev
