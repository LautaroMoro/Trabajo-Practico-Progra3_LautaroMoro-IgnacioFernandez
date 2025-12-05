document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  const categoriaSelect = document.getElementById("categoriaSelect");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const temaBtn = document.getElementById("temaBtn");

  // Variables
  let todosProductos = [];
  let productosFiltrados = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  // 1️⃣ Obtener productos de la API
  try {
    todosProductos = await obtenerProductos();

    if (todosProductos.length === 0) {
      contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
      return;
    }
  } catch (error) {
    contenedor.innerHTML = "<p>Error al cargar los productos</p>";
    console.error(error);
    return;
  }

  // 2️⃣ Mostrar productos
  function mostrarProductos() {
    contenedor.innerHTML = "";

    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = productosFiltrados.slice(start, end);

    if (pageItems.length === 0) {
      contenedor.innerHTML = "<p>No hay productos para mostrar</p>";
      return;
    }

    pageItems.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("producto-card");

      const imagen =
        p.thumbnail ||
        (p.images && p.images.length > 0 ? p.images[0] : null) ||
        "/img/default.png";

      card.innerHTML = `
        <img src="${imagen}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="categoria">${p.category || "Sin categoría"}</p>
        <p class="precio">$${Number(p.price).toFixed(2)}</p>
        <button class="btn-agregar" data-id="${p.id}">Agregar</button>
      `;

      contenedor.appendChild(card);
    });

    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1; //Preguntar
    nextBtn.disabled = currentPage === totalPages; // Preguntar
  }

  // 3️⃣ Filtrar productos
  function filtrarProductos() {
    const cat = categoriaSelect.value;
    currentPage = 1;

    if (cat === "all") {
      productosFiltrados = [...todosProductos]; // Preguntarr
    } else {
      productosFiltrados = todosProductos.filter(p => p.category === cat);
    }

    mostrarProductos();
  }

  // 4️⃣ Eventos
  categoriaSelect.addEventListener("change", filtrarProductos);

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      mostrarProductos();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      mostrarProductos();
    }
  });

  // 5️⃣ Agregar al carrito
  contenedor.addEventListener("click", e => {
    if (e.target.classList.contains("btn-agregar")) {
      const id = parseInt(e.target.dataset.id);
      const producto = todosProductos.find(p => p.id === id);
      agregarAlCarrito(producto);
    }
  });

  // 6️⃣ Inicializar filtros
  filtrarProductos();

  // 7️⃣ Volver al inicio
  const logoBtn = document.getElementById("logoBtn");
  if (logoBtn) {
    logoBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});

// 8️⃣ Agregar al carrito
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
