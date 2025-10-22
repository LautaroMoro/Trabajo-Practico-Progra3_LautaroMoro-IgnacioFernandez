document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total");
  const btnVaciar = document.getElementById("vaciarCarrito");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function actualizarCarrito() {
    contenedor.innerHTML = "";
    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
      totalSpan.textContent = "0.00";
      return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
      total += item.price * item.cantidad;

      const div = document.createElement("div");
      div.classList.add("item-carrito");
      div.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.title}">
        <h3>${item.title}</h3>
        <div class="controles">
          <button onclick="cambiarCantidad(${index}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>
        <p>$${(item.price * item.cantidad).toFixed(2)}</p>
        <button class="btn-eliminar" onclick="eliminarProducto(${index})">X</button>
      `;
      contenedor.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  window.cambiarCantidad = (index, cambio) => {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    actualizarCarrito();
  };

  window.eliminarProducto = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
  };

  btnVaciar.addEventListener("click", () => {
    carrito = [];
    actualizarCarrito();
  });

  actualizarCarrito();
});
//vuelve a la pagina de inicio cuando se toca el nombre
  document.getElementById("logoBtn").addEventListener("click", function () {
    window.location.href = "productos.html";
  });
