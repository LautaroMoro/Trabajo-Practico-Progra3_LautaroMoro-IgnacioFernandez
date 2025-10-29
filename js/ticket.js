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
  const ticket = document.querySelector(".ticket");
  const opciones = {
    margin: 10,
    filename: "ticket.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };
  html2pdf().set(opciones).from(ticket).save();
});
});
