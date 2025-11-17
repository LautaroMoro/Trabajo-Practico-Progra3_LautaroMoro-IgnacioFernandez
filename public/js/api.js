const API_URL = "/api/products";

async function obtenerProductos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    return data.products || [];  // 👈 SOLO devuelve array
  } catch (error) {
    console.error("Error al conectar con backend:", error);
    return [];
  }
}
