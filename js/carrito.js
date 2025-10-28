document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total");
  const btnVaciar = document.getElementById("vaciarCarrito");
  const modal = document.getElementById("modal-pago");
  const inputNota = document.getElementById("inputNota");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const finalizarBtn = document.querySelector('nav button');

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

  // volver a productos
  document.getElementById("logoBtn").addEventListener("click", function () {
    window.location.href = "productos.html";
  });

  // abrir el modal de pago
  finalizarBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      alert("Tu carrito está vacío. Agregá productos antes de finalizar la compra.");
      return;
    }

    modal.classList.remove("oculto");
    inputNota.value = "";
    inputNota.focus();
  });

  // cancelar compra
  btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // confirmar pago
  btnConfirmar.addEventListener("click", () => {
    const valor = parseInt(inputNota.value);

    if (isNaN(valor) || valor < 1 || valor > 10) {
      alert("Por favor, ingrese un número válido entre 1 y 10.");
      return;
    }

    if (valor >= 6) {
      alert("✅ Compra aprobada. ¡Gracias por su compra!");
      modal.classList.add("oculto");
      window.location.href = "ticket.html";
    } else {
      alert("❌ Fondos insuficientes. No se pudo realizar la compra.");
      modal.classList.add("oculto");
    }
  });
});
