document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total");
  const btnVaciar = document.getElementById("vaciarCarrito");
  const modal = document.getElementById("modal-pago");
  const inputNota = document.getElementById("inputNota");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const finalizarBtn = document.getElementById("finalizarCompra");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // === Mostrar productos ===
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
  
contenedor.addEventListener("click", async (e) => {
  const index = parseInt(e.target.dataset.index);
  const change = parseInt(e.target.dataset.change);

  // --- MODIFICAR CANTIDAD ---
  if (e.target.classList.contains("btn-cant")) {
    carrito[index].cantidad += change;

    // Si baja a 0, eliminar
    if (carrito[index].cantidad <= 0) {
      const id = carrito[index].id;

      try {
        await fetch(`/products/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Error al eliminar producto", err);
      }

      carrito.splice(index, 1);
    } else {
      // Si sigue existiendo: actualizar en la API
      try {
        await fetch(`/products/${carrito[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad: carrito[index].cantidad })
        });
      } catch (err) {
        console.error("Error al actualizar cantidad", err);
      }
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
  }

  // --- ELIMINAR DIRECTO ---
  if (e.target.classList.contains("btn-eliminar")) {
    const id = carrito[index].id;

    try {
      await fetch(`/products/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error al eliminar producto", err);
    }

    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
  }
});

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

  // === Ir a productos ===
  document.getElementById("logoBtn").addEventListener("click", () => {
    window.location.href = "productos.html";
  });

  // === Finalizar compra ===
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

  btnConfirmar.addEventListener("click", () => {
    const valor = parseInt(inputNota.value);

    if (isNaN(valor) || valor < 1 || valor > 10) {
      Swal.fire("Error", "Ingresá un número entre 1 y 10.", "error");
      return;
    }

    if (valor >= 6) {
      Swal.fire("Compra aprobada", "COMPRASTE UN BUEN PAPOI 🛒", "success")
        .then(() => (window.location.href = "ticket.html"));
    } else {
      Swal.fire("Fondos insuficientes", "No se pudo realizar la compra.", "error");
    }

    modal.classList.add("oculto");
  });

  actualizarCarrito();

});
