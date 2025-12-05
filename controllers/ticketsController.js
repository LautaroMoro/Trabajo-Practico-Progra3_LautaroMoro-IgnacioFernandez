import { prisma } from "../db.js";

// ================================
// CONSULTAR TICKET POR ID
// ================================
export async function consultarTickets(req, res, next) {
  try {
    const id = Number(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

// ================================
// CREAR TICKET + ITEMS + DESCUENTO STOCK ✅
// ================================
export async function crearTicket(req, res, next) {
  const { nombreCliente, carrito } = req.body;

  try {
    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ message: "Carrito vacío" });
    }

    const productIds = carrito.map(i => Number(i.id));

    const productos = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        activo: true
      }
    });

    if (productos.length !== productIds.length) {
      return res.status(400).json({
        message: "Algún producto no existe o está inactivo"
      });
    }

    // Mapeo por id
    const map = new Map(productos.map(p => [p.id, p]));

    let total = 0;

    const lineas = carrito.map(item => {
      const producto = map.get(Number(item.id));

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.title}`);
      }

      const precioUnitario = producto.price;
      const subtotal = precioUnitario * item.cantidad;
      total += subtotal;

      return {
        productId: producto.id,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal
      };
    });

    // =========================
    // TRANSACCIÓN COMPLETA
    // =========================
    const ticket = await prisma.$transaction(async (tx) => {

      const nuevoTicket = await tx.ticket.create({
        data: {
          nombreCliente,
          importe: total,
          fecha: new Date()   // ✅ FECHA CORRECTA
        }
      });

      for (const linea of lineas) {
        await tx.ticketItem.create({
          data: {
            ticketId: nuevoTicket.id,
            productId: linea.productId,
            cantidad: linea.cantidad,
            precioUnitario: linea.precioUnitario,
            subtotal: linea.subtotal
          }
        });

        await tx.product.update({
          where: { id: linea.productId },
          data: {
            stock: { decrement: linea.cantidad }
          }
        });
      }

      return nuevoTicket;
    });

    res.status(201).json({
      success: true,
      ticketId: ticket.id,
      importe: total
    });

  } catch (err) {
    console.error("❌ Error creando ticket:", err.message);
    res.status(500).json({ error: err.message });
  }
}
