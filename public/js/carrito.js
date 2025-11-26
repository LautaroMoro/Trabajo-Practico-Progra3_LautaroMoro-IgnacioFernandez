document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total");
  const btnVaciar = document.getElementById("vaciarCarrito");
  const modal = document.getElementById("modal-pago");
  const inputNota = document.getElementById("inputNota");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const finalizarBtn = document.getElementById("finalizarCompra");
  const logoBtn = document.getElementById("logoBtn");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // =========================
  // VOLVER A PRODUCTOS
  // =========================
  if (logoBtn) {
    logoBtn.addEventListener("click", () => {
      window.location.href = "productos.html";
    });
  }

  // =========================
  // MOSTRAR CARRITO
  // =========================
  function actualizarCarrito() {
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
      totalSpan.textContent = "0.00";
      localStorage.setItem("carrito", JSON.stringify([]));
      return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
      total += item.price * item.cantidad;

      const div = document.createElement("div");
      div.classList.add("item-carrito");

      div.innerHTML = `
        <img src="${item.thumbnail}">
        <h3>${item.title}</h3>

        <div class="controles">
          <button class="btn-cant" data-index="${index}" data-change="-1">-</button>
          <span>${item.cantidad}</span>
          <button class="btn-cant" data-index="${index}" data-change="1">+</button>
        </div>

        <p>$${(item.price * item.cantidad).toFixed(2)}</p>

        <button class="btn-eliminar" data-index="${index}">X</button>
      `;

      contenedor.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // =========================
  // BOTONES + - y ELIMINAR
  // =========================
  contenedor.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-cant")) {
      const index = parseInt(e.target.dataset.index);
      const change = parseInt(e.target.dataset.change);

      carrito[index].cantidad += change;

      if (carrito[index].cantidad < 1) {
        carrito.splice(index, 1);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarCarrito();
    }

    if (e.target.classList.contains("btn-eliminar")) {
      const index = parseInt(e.target.dataset.index);

      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarCarrito();
    }
  });

  // =========================
  // VACIAR CARRITO
  // =========================
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
        localStorage.setItem("carrito", JSON.stringify([]));
        actualizarCarrito();
        Swal.fire("Listo", "El carrito fue vaciado.", "success");
      }
    });
  });

  // =========================
  // FINALIZAR COMPRA (ABRE MODAL)
  // =========================
  finalizarBtn.addEventListener("click", () => {
    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agregá productos antes de finalizar la compra.", "info");
      return;
    }

    modal.classList.remove("oculto");
    inputNota.value = "";
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // =========================
  // CONFIRMAR COMPRA (BACKEND + DESCUENTO STOCK)
  // =========================
  btnConfirmar.addEventListener("click", async () => {
    const valor = parseInt(inputNota.value);

    if (isNaN(valor) || valor < 1 || valor > 10) {
      Swal.fire("Error", "Ingresá un número entre 1 y 10.", "error");
      return;
    }

    if (valor < 6) {
      Swal.fire("Fondos insuficientes", "No se pudo realizar la compra.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/comprar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ carrito })
    });


      const nombre = localStorage.getItem("username") || "Cliente";

const ticket = {
  cliente: nombre,
  fecha: new Date().toLocaleString(),
  productos: carrito,
  total: carrito.reduce((acc, p) => acc + (p.price * p.cantidad), 0)
};

// ✅ Guardamos el ticket ANTES de borrar el carrito
localStorage.setItem("ticket", JSON.stringify(ticket));

Swal.fire("Compra aprobada", "COMPRASTE UN BUEN PAPOI 🛒", "success")
  .then(() => {
    localStorage.removeItem("carrito");
    window.location.href = "ticket.html";
  });


    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    }

    modal.classList.add("oculto");
  });

  actualizarCarrito();
});
