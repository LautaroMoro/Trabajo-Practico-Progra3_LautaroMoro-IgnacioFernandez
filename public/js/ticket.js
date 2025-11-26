document.addEventListener("DOMContentLoaded", () => {

  // === Recuperar ticket guardado ===
  const ticket = JSON.parse(localStorage.getItem("ticket"));

  if (!ticket) {
    alert("No hay datos de compra");
    window.location.href = "productos.html";
    return;
  }

  // === Mostrar datos ===
  document.getElementById("nombre").textContent = ticket.cliente;
  document.getElementById("fecha").textContent = ticket.fecha;

  const lista = document.getElementById("lista-productos");
  const totalEl = document.getElementById("total");

  let total = 0;

  ticket.productos.forEach(prod => {
    const li = document.createElement("li");
    const subtotal = prod.price * prod.cantidad;
    total += subtotal;
    li.textContent = `${prod.title} x${prod.cantidad} - $${subtotal.toFixed(2)}`;
    lista.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2);

  // === Descargar Ticket en PDF ===
  document.getElementById("descargar").addEventListener("click", () => {

    const contenidoPDF = `
      <div style="font-family: Arial; text-align: center; padding: 20px;">
        <h2>🧾 Comprobante de Compra</h2>
        <p><strong>Cliente:</strong> ${ticket.cliente}</p>
        <p><strong>Fecha:</strong> ${ticket.fecha}</p>
        <hr>
        <h3>Productos</h3>
        <ul style="list-style:none; padding:0;">
          ${ticket.productos.map(p => `
            <li>${p.title} x${p.cantidad} - $${(p.price * p.cantidad).toFixed(2)}</li>
          `).join("")}
        </ul>
        <hr>
        <h3>Total: $${ticket.total.toFixed(2)}</h3>
        <p>¡Gracias por su compra!</p>
      </div>
    `;

    html2pdf().from(contenidoPDF).save("ticket.pdf");
  });

});
