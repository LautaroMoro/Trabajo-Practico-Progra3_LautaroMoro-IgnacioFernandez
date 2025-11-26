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
