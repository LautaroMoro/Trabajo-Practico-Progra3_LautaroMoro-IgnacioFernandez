import jwt from "jsonwebtoken";


export function forwardIfLogged(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next();
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/admin/dashboard");

    } catch (error) {
      return next();
    }
}