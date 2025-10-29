document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total");
  const btnVaciar = document.getElementById("vaciarCarrito");
  const modal = document.getElementById("modal-pago");
  const inputNota = document.getElementById("inputNota");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const finalizarBtn = document.getElementById("finalizarCompra");
  const temaBtn = document.getElementById("temaBtn");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // === Cambio de tema (oscuro / claro) con persistencia ===
  const temaGuardado = localStorage.getItem("tema") || "claro";
  document.body.classList.toggle("oscuro", temaGuardado === "oscuro");
  temaBtn.textContent = temaGuardado === "oscuro" ? "☀️" : "🌙";

  temaBtn.addEventListener("click", () => {
    const oscuro = document.body.classList.toggle("oscuro");
    localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
    temaBtn.textContent = oscuro ? "☀️" : "🌙";
  });

  // === Actualizar carrito ===
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

  // === Control de cantidad ===
  window.cambiarCantidad = (index, cambio) => {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    actualizarCarrito();
  };

  // === Eliminar producto ===
  window.eliminarProducto = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
  };

  // === Vaciar carrito ===
  btnVaciar.addEventListener("click", () => {
    Swal.fire({
      title: "¿Vaciar carrito?",
      text: "Se eliminarán todos los productos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        carrito = [];
        actualizarCarrito();
        Swal.fire("Listo", "El carrito fue vaciado.", "success");
      }
    });
  });

  // === Inicializar ===
  actualizarCarrito();

  // === Logo: volver a productos ===
  document.getElementById("logoBtn").addEventListener("click", () => {
    window.location.href = "productos.html";
  });

  // === Abrir el modal de pago ===
  finalizarBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agregá productos antes de finalizar la compra.", "info");
      return;
    }

    modal.classList.remove("oculto");
    inputNota.value = "";
    inputNota.focus();
  });

  // === Cancelar compra ===
  btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // === Confirmar pago ===
  btnConfirmar.addEventListener("click", () => {
    const valor = parseInt(inputNota.value);

    if (isNaN(valor) || valor < 1 || valor > 10) {
      Swal.fire("Error", "Por favor, ingresá un número válido entre 1 y 10.", "error");
      return;
    }

    if (valor >= 6) {
      Swal.fire({
        icon: "success",
        title: "Compra aprobada 🎉",
        text: "¡Gracias por su compra!",
        confirmButtonText: "Ver Ticket",
      }).then(() => {
        modal.classList.add("oculto");
        localStorage.removeItem("carrito");
        window.location.href = "ticket.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Fondos insuficientes",
        text: "No se pudo realizar la compra.",
      });
      modal.classList.add("oculto");
    }
  });
});
