import {body, param, query, validationResult} from "express-validator";


function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const validarProducto = [
  body("descripcion").isString().isLength({ min: 1, max: 120 }),
  body("precio").isFloat({ gt: 0 }),
  body("activo").optional().isBoolean(),
  validate
];


export const validarId = [param("id").isInt().toInt(), validate];


export const validarSync = [
    body.isArray({min: 1}),
    body("*.descripcion").isString(),
    body("*.precio").isFloat({gt: 0}),
    body("*.activo").optional().isBoolean(), validate
];