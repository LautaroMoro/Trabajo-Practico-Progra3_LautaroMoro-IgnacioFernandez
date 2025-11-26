import { prisma } from "../db.js";

export async function consultarTickets(req, res, next) {
     try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: Number(req.params.id) },
        include: { items: { include: { product: true } } },
      });
      if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
      res.json(ticket);
    } catch (err) {
      next(err);
    }
}


export async function crearTicket(req, res, next) {
    const { nombreCliente, items } = req.body;
    try {
      // Traer productos activos y armar líneas con precio actual
      const productIds = [...new Set(items.map(i => Number(i.productId)))];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, activo: true },
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({ message: "Algún productId no existe o está inactivo" });
      }

      // Map rápido por id
      const map = new Map(products.map(p => [p.id, p]));

      let total = 0;
      const lineas = items.map(({ productId, cantidad }) => {
        const p = map.get(Number(productId));
        const precioUnitario = Number(p.precio);
        const subtotal = Number((precioUnitario * cantidad).toFixed(2));
        total += subtotal;
        return {
          productId: Number(productId),
          cantidad: Number(cantidad),
          precioUnitario,
          subtotal,
        };
      });

      total = Number(total.toFixed(2));

      const created = await prisma.ticket.create({
        data: {
          nombreCliente,
          importe: total,
          items: {
            create: lineas,
          },
        },
        include: { items: { include: { product: true } } },
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
}