document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  const categoriaSelect = document.getElementById("categoriaSelect");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const toggleThemeBtn = document.getElementById("toggleThemeBtn");
  const adminLoginBtn = document.getElementById("adminLoginBtn");

  // Tema persistente
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme) body.classList.add(savedTheme);

  toggleThemeBtn.addEventListener("click", () => {
    if(body.classList.contains('dark-theme')){
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('theme','light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme','dark-theme');
    }
  });

  // Login admin
  adminLoginBtn.addEventListener("click", () => {
    window.location.href = "admin/login.html";
  });

  // Variables
  let todosProductos = [];
  let productosFiltrados = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  // Obtener productos de la API
  todosProductos = await obtenerProductos();

  if (todosProductos.length === 0) {
    contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
    return;
  }

  // Función para mostrar productos según página y filtro
  function mostrarProductos() {
    contenedor.innerHTML = "";

    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = productosFiltrados.slice(start, end);

    if (pageItems.length === 0) {
      contenedor.innerHTML = "<p>No hay productos para mostrar</p>";
    }

    pageItems.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("producto-card");
      card.innerHTML = `
        <img src="${p.thumbnail || p.imagen}" alt="${p.title || p.nombre}">
        <h3>${p.title || p.nombre}</h3>
        <p class="categoria">${p.category || p.categoria}</p>
        <p class="precio">$${(p.price || p.precio).toFixed(2)}</p>
        <button class="btn-agregar" data-id="${p.id}">Agregar</button>
      `;
      contenedor.appendChild(card);
    });

    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Función para filtrar productos por categoría
  function filtrarProductos() {
    const cat = categoriaSelect.value;
    currentPage = 1; // reinicia página al cambiar categoría
    if (cat === "all") {
      productosFiltrados = todosProductos.filter(p => p.activo !== false);
    } else {
      productosFiltrados = todosProductos.filter(p => 
        (p.categoria === cat || p.category === cat) && p.activo !== false
      );
    }
    mostrarProductos();
  }

  // Eventos
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

  contenedor.addEventListener("click", e => {
    if (e.target.classList.contains("btn-agregar")) {
      const id = e.target.dataset.id;
      const producto = todosProductos.find(p => p.id == id);
      agregarAlCarrito(producto);
    }
  });

  // Inicial
  filtrarProductos();

  // Volver al inicio con logo
  document.getElementById("logoBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});

// Función agregar al carrito
function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existente = carrito.find(p => p.id === producto.id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`✅ ${producto.title || producto.nombre} agregado al carrito.`);
}
