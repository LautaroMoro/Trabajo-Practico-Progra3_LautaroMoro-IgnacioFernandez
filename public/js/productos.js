document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  const categoriaSelect = document.getElementById("categoriaSelect");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  let todosProductos = [];
  let productosFiltrados = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  // 1️⃣ Obtener productos (API + locales de admin)
  try {
    const [productosApi, productosLocales] = await Promise.all([
      obtenerProductos(), 
      fetch("/admin/products").then(res => res.json()).catch(() => [])
    ]);

    todosProductos = [...productosApi, ...productosLocales];
    console.log("Productos combinados:", todosProductos);

    if (todosProductos.length === 0) {
      contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
      return;
    }
  } catch (error) {
    contenedor.innerHTML = "<p>Error al cargar los productos</p>";
    return;
  }

  // 2️⃣ Mostrar productos según página
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
      const nombre = p.title || p.nombre || "Sin nombre";
      const categoria = p.category || p.tipo || "Sin categoría";
      const precio = p.price || p.precio || 0;

      const imagen =
        p.thumbnail ||
        (p.images && p.images[0]) ||
        p.imagenPath ||
        "images/placeholder.png";

      const card = document.createElement("div");
      card.classList.add("producto-card");

      card.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <h3>${nombre}</h3>
        <p class="categoria">${categoria}</p>
        <p class="precio">$${precio.toFixed(2)}</p>
        <button class="btn-agregar" data-id="${p.id}">Agregar</button>
      `;

      contenedor.appendChild(card);
    });

    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  // 3️⃣ Filtrar productos por categoría
  function filtrarProductos() {
    const cat = categoriaSelect.value;
    currentPage = 1;

    if (cat === "all") {
      productosFiltrados = [...todosProductos];
    } else {
      productosFiltrados = todosProductos.filter(p => {
        const categoria = p.category || p.tipo;
        return categoria === cat;
      });
    }

    mostrarProductos();
  }

  // 4️⃣ Listeners
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

  // ** Listener único **
  contenedor.addEventListener("click", e => {
    if (e.target.classList.contains("btn-agregar")) {
      const id = parseInt(e.target.dataset.id);
      const producto = todosProductos.find(p => p.id === id);
      agregarAlCarrito(producto);
    }
  });

  // 5️⃣ Inicialización
  productosFiltrados = [...todosProductos];
  mostrarProductos();

  // 6️⃣ Click en logo
  document.getElementById("logoBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});


// 7️⃣ Función para agregar al carrito (SIN DUPLICADOS)
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const productoNormalizado = {
    id: producto.id,
    title: producto.title || producto.nombre || "Sin nombre",
    price: producto.price || producto.precio || 0,
    thumbnail: producto.thumbnail || producto.imagenPath || "images/placeholder.png",
    cantidad: 1
  };

  const index = carrito.findIndex(p => p.id === productoNormalizado.id);

  if (index !== -1) {
    carrito[index].cantidad++;
  } else {
    carrito.push(productoNormalizado);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  Swal.fire({
    icon: "success",
    title: "Producto agregado",
    text: productoNormalizado.title + " fue añadido al carrito",
    timer: 1200,
    showConfirmButton: false
  });
}
