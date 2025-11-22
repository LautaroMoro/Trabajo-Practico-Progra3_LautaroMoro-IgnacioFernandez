document.addEventListener("DOMContentLoaded", () => {

  // === BOTÓN DE TEMA (oscuro / claro) ===
  const temaBtn = document.getElementById("temaBtn");

  const temaGuardado = localStorage.getItem("tema") || "claro";
  document.body.classList.toggle("oscuro", temaGuardado === "oscuro");
  if (temaBtn) temaBtn.textContent = temaGuardado === "oscuro" ? "☀️" : "🌙";

  if (temaBtn) {
    temaBtn.addEventListener("click", () => {
      const oscuro = document.body.classList.toggle("oscuro");
      localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
      temaBtn.textContent = oscuro ? "☀️" : "🌙";
    });
  }

  // === Recuperar datos del cliente y carrito ===
  const nombre = localStorage.getItem("username") || "Cliente";
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Mostrar datos en pantalla
  document.getElementById("nombre").textContent = nombre;
  document.getElementById("fecha").textContent = new Date().toLocaleDateString();

  const lista = document.getElementById("lista-productos");
  const totalEl = document.getElementById("total");

  let total = 0;
  carrito.forEach(prod => {
    const li = document.createElement("li");
    lista.appendChild(li);
    total += prod.price * prod.cantidad;
    li.textContent = `${prod.title} x${prod.cantidad} - ${(prod.price * prod.cantidad).toFixed(2)}`;
  });

  totalEl.textContent = total.toFixed(2);

  // === Descargar ticket como PDF limpio ===
  document.getElementById("descargar").addEventListener("click", () => {
    const fechaActual = new Date().toLocaleString();

    const contenidoPDF = `
      <div style="
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
        line-height: 1.6;
        background-color: #ffffff;
        color: #000000;
      ">
        <h2 style="margin-bottom: 10px;">🧾 Comprobante de Compra</h2>
        <p><strong>Cliente:</strong> ${nombre}</p>
        <p><strong>Fecha:</strong> ${fechaActual}</p>
        <hr style="margin: 10px 0; border: 1px solid #000;">
        <h3 style="margin-bottom: 5px;">Productos:</h3>

        <ul style="
          list-style: none;
          padding: 0;
          text-align: left;
          display: inline-block;
        ">
          ${carrito.map(p => `
            <li>${p.title} x${p.cantidad} - $${(p.price * p.cantidad).toFixed(2)}</li>
          `).join('')}
        </ul>

        <hr style="margin: 10px 0; border: 1px solid #000;">
        <h3>Total: $${total.toFixed(2)}</h3>
        <p style="margin-top: 15px;">¡Gracias por su compra!</p>
      </div>
    `;

    const opciones = {
      margin: 10,
      filename: "ticket.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opciones).from(contenidoPDF).save();
  });
});
