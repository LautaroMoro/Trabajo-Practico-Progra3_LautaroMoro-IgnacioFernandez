<<<<<<< HEAD
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

export default router;
=======
import { prisma } from "../db.js";

// ================================
// CRUD ORIGINAL (NO LOS BORRES)
// ================================

export const crearProducto = async (req, res) => {
  try {
    const data = req.body;
    const producto = await prisma.product.create({ data });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
};

export const listarProductos = async (req, res) => {
  const productos = await prisma.product.findMany();
  res.json(productos);
};

export const actualizarProducto = async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;

  const actualizado = await prisma.product.update({
    where: { id },
    data
  });

  res.json(actualizado);
};

export const eliminarProducto = async (req, res) => {
  const id = Number(req.params.id);

  await prisma.product.delete({
    where: { id }
  });

  res.json({ success: true });
};

export const sincronizarProductos = async (req, res) => {
  res.json({ success: true });
};

// ================================
// ✅ NUEVA FUNCIÓN DE COMPRA
// ================================

export const procesarCompra = async (req, res) => {
  try {
    const { carrito, nombreCliente = "Cliente Final" } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    for (const item of carrito) {
      const producto = await prisma.product.findUnique({
        where: { id: item.id }
      });

      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.id} no existe` });
      }

      if (!producto.activo) {
        return res.status(400).json({
          error: `El producto ${producto.title} no está activo`
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${producto.title}`
        });
      }
    }

    const importeTotal = carrito.reduce(
      (acc, item) => acc + item.price * item.cantidad,
      0
    );

    const ticket = await prisma.$transaction(async (tx) => {
      const nuevoTicket = await tx.ticket.create({
        data: {
          nombreCliente,
          importe: importeTotal
        }
      });

      for (const item of carrito) {
        const producto = await tx.product.findUnique({
          where: { id: item.id }
        });

        await tx.ticketItem.create({
          data: {
            ticketId: nuevoTicket.id,
            productId: item.id,
            cantidad: item.cantidad,
            precioUnitario: producto.price,
            subtotal: producto.price * item.cantidad
          }
        });

        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.cantidad }
          }
        });
      }

      return nuevoTicket;
    });

    res.json({ success: true, ticketId: ticket.id });

  } catch (error) {
    console.error("❌ Error compra:", error);
    res.status(500).json({ error: "Error al procesar compra" });
  }
};
>>>>>>> lautaro-dev
