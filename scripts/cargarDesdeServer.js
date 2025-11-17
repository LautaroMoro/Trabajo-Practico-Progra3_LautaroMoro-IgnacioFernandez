import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cargarProductosDesdeServer() {
  try {
    console.log("🌐 Obteniendo productos desde tu servidor local...");

    // 1️⃣ Llamamos a tu backend local
    const response = await axios.get("http://localhost:3000/api/products");
    const products = response.data;

    console.log(`📦 Se recibieron ${products.length} productos.`);

    let nuevos = 0;
    let existentes = 0;

    // 2️⃣ Recorremos los productos uno a uno
    for (const p of products) {
      // Buscamos si ya existe un producto con el mismo título
      const existente = await prisma.product.findFirst({
        where: { title: p.title },
      });

      if (existente) {
        existentes++;
        continue; // si ya existe, lo salteamos
      }

      // Si no existe, lo creamos
      await prisma.product.create({
        data: {
          title: p.title,
          description: p.description || "Sin descripción",
          price: p.price ?? 0,
          stock: p.stock ?? 100,
          category: p.category || "Sin categoría",
          thumbnail: p.thumbnail || "",
        },
      });
      nuevos++;
    }

    console.log(`✅ ${nuevos} productos nuevos agregados.`);
    console.log(`ℹ️ ${existentes} ya existían en la base de datos.`);

  } catch (error) {
    console.error("❌ Error al cargar productos desde el backend:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cargarProductosDesdeServer();
