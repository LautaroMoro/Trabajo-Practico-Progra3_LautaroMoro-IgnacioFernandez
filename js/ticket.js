document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("username") || "Cliente";
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  document.getElementById("nombre").textContent = nombre;
  document.getElementById("fecha").textContent = new Date().toLocaleDateString();

  const lista = document.getElementById("lista-productos");
  const totalEl = document.getElementById("total");

  let total = 0;
  carrito.forEach(prod => {
    const li = document.createElement("li");
    li.textContent = `${prod.title} x${prod.cantidad} - $${(prod.price * prod.cantidad).toFixed(2)}`;
    lista.appendChild(li);
    total += prod.price * prod.cantidad;
  });

  totalEl.textContent = total.toFixed(2);

  // Descargar ticket como texto txt
  document.getElementById("descargar").addEventListener("click", () => {
    let contenido = `=== Comprobante de Compra ===\n`;
    contenido += `Cliente: ${nombre}\nFecha: ${new Date().toLocaleString()}\n\nProductos:\n`;
    carrito.forEach(p => {
      contenido += `- ${p.title} x${p.cantidad} - $${(p.price * p.cantidad).toFixed(2)}\n`;
    });
    contenido += `\nTotal: $${total.toFixed(2)}\nGracias por su compra!\n`;

    const blob = new Blob([contenido], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ticket.txt";
    link.click();
  });
});
