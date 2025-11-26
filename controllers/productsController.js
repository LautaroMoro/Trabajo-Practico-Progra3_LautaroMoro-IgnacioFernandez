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
