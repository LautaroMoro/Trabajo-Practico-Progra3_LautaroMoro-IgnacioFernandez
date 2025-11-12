// src/middlewares/error.js
export function errorHandler(err, req, res, next) {
  // Prisma error básica
  const status = err.status || 500;
  const payload = {
  message: err.message || "Error interno del servidor",
  };
  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }
res.status(status).json(payload);
}