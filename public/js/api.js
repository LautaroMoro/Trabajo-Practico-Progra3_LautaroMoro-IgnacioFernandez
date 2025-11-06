const API_URL = "/api/products";

// Función para obtener productos de tres categorías
async function obtenerProductos() {
  try {
    const res = await fetch(API_URL);
    const productos = await res.json();
    return productos;

  } catch (error) {
    console.error("Error al conectar con backend:", error);
    return [];
  }
}
