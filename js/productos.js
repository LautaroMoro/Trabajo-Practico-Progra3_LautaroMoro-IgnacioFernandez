document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "<p>Cargando productos...</p>";

  const productos = await obtenerProductos();

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
    return;
  }

  contenedor.innerHTML = "";

  productos.forEach(prod => {
    const card = document.createElement("div");
    card.classList.add("producto-card");

    card.innerHTML = `
      <img src="${prod.thumbnail}" alt="${prod.title}">
      <h3>${prod.title}</h3>
      <p class="categoria">${prod.category}</p>
      <p class="precio">$${prod.price.toFixed(2)}</p>
      <button class="btn-agregar">Agregar al carrito</button>
    `;

    contenedor.appendChild(card);
  });
});
