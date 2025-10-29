const API_URL = "https://dummyjson.com/products";

// Función para obtener los productos de la API
async function obtenerProductos() {
  try {
    const response = await fetch(`${API_URL}?limit=15`); //limite de productos a mostrar
    if (!response.ok) throw new Error("Error al obtener productos");

    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    return [];
  }
}
