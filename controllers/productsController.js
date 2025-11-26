// src/routes/products.js
import { prisma } from "../db.js";


// Crear producto
export async function crearProducto(req, res, next) {
   
        try {
        const { descripcion, precio, activo = true } = req.body;
        const product = await prisma.product.create({
            data: {
            descripcion,
            precio,
            activo,
            },
        });
        res.status(201).json(product);
        } catch (err) {
        next(err);
        }
}


// Listar productos
export async function listarProductos(req, res, next) {
    try {
      const { activos } = req.query;
      const where = activos === undefined ? {} : { activo: activos };
      const products = await prisma.product.findMany({ where, orderBy: { id: "asc" } });
      res.json(products);
    } catch (err) {
    next(err);
    }
}


// Actualizar producto
export async function actualizarProducto(req, res, next) {

  try {
      const id = req.params.id;
      const data = {};
      if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion;
      if (req.body.precio !== undefined) data.precio = req.body.precio;
      if (req.body.activo !== undefined) data.activo = req.body.activo;
      if(req.body.cantidad !== undefined) data.cantidad = req.body.cantidad;

      const updated = await prisma.product.update({ where: { id: Number(id) }, data });
      res.json(updated);
  } catch (err) {
      next(err);
      }
}

// "Eliminar" producto (soft delete -> activo=false)
export async function eliminarProducto(req, res, next) {
  async (req, res, next) => {
      try {
          const id = Number(req.params.id);
          const updated = await prisma.product.update({
          where: { id },
          data: { activo: false },
          });
          res.json(updated);
      } catch (err) {
          next(err);
      }
  }
}

// Upsert masivo para compatibilidad con productos de una API externa filtrada
export async function sincronizarProductos(req, res, next) {
      try {
        const payload = req.body;
        const results = [];
        for (const p of payload) {
          const { id, descripcion, precio, activo = true } = p;
          if (id) {
            const up = await prisma.product.upsert({
              where: { id },
              update: { descripcion, precio, activo },
              create: { id, descripcion, precio, activo },
            });
            results.push(up);
          } else {
            const created = await prisma.product.create({ data: { descripcion, precio, activo } });
            results.push(created);
          }
        }
        res.json({ count: results.length, products: results });
      } catch (err) {
        next(err);
      }
}
