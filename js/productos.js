// Espera a que todo el contenido del DOM se cargue
document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "<p>Cargando productos...</p>";

  // Obtenemos los productos de la API (función importada desde api.js)
  const productos = await obtenerProductos();

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
    return;
  }

  contenedor.innerHTML = "";

  // Recorremos los productos y creamos las tarjetas
  function renderizarProductos(productos){
    productos.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("producto-card");

      card.innerHTML = `
        <img src="${prod.thumbnail}" alt="${prod.title}">
        <h3>${prod.title}</h3>
        <p class="categoria">Categoría: ${prod.category}</p>
        <p class="precio">$${prod.price.toFixed(2)}</p>
        <button class="btn-agregar" data-id="${prod.id}">Agregar al carrito</button>
      `;

      contenedor.appendChild(card);
    });
  }


  function filtrarPorCategoria() {
    const filtro = document.querySelector(".dropdown");

    filtro.addEventListener("change", () => {
      let categoriaElegida =  filtro.value;
      if(categoriaElegida === "products"){
        contenedor.innerHTML = "";
        renderizarProductos(productos);
        return productos; 
      }
      let filtrados = productos.filter(prod => prod.category === categoriaElegida);
      contenedor.innerHTML = "";
      renderizarProductos(filtrados);
      return filtrados; 
      
    });
  }



  // Evento para manejar el clic en los botones de agregar al carrito
  contenedor.addEventListener("click", e => {
    if (e.target.classList.contains("btn-agregar")) {
      const id = e.target.getAttribute("data-id");
      const producto = productos.find(p => p.id == id);
      agregarAlCarrito(producto);
    }
  });
  renderizarProductos(productos);
  filtrarPorCategoria();
});

// -------------------------------
// FUNCIONES AUXILIARES
// -------------------------------

// Agrega productos al carrito en localStorage
function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existente = carrito.find(p => p.id === producto.id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`✅ ${producto.title} agregado al carrito.`);
}
//vuelve a la pagina de inicio cuando se toca el nombre
  document.getElementById("logoBtn").addEventListener("click", function () {
    window.location.href = "index.html";
  });
