const API_URL = "https://dummyjson.com/products";

// Función para obtener productos de tres categorías
async function obtenerProductos() {
  try {
    const [remerasRes, vestidoRes, zapatillasRes] = await Promise.all([
      fetch(`${API_URL}/category/mens-shirts`),
      fetch(`${API_URL}/category/womens-dresses`),
      fetch(`${API_URL}/category/mens-shoes`)
    ]);

    if (!remerasRes.ok || !vestidoRes.ok || !zapatillasRes.ok)
      throw new Error("Error al obtener productos");

    const [remeras, vestidos, zapatillas] = await Promise.all([
      remerasRes.json(),
      vestidoRes.json(),
      zapatillasRes.json()
    ]);

    const ropaCombinada = [...remeras.products, ...vestidos.products, ...zapatillas.products];
    return ropaCombinada;

  } catch (error) {
    console.error("Error al conectar con la API:", error);
    return [];
  }
}
