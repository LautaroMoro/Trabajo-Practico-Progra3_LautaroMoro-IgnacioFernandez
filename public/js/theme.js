document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle") || document.getElementById("temaBtn");
  const body = document.body;

  // === 1. Cargar tema guardado ===
  const temaGuardado = localStorage.getItem("tema") || "oscuro";
  body.classList.add(temaGuardado);

  if (btn) {
    btn.textContent = temaGuardado === "oscuro" ? "☀️" : "🌙";

    btn.addEventListener("click", () => {
      body.classList.toggle("oscuro");
      body.classList.toggle("claro");

      const temaActual = body.classList.contains("oscuro") ? "oscuro" : "claro";

      localStorage.setItem("tema", temaActual);
      btn.textContent = temaActual === "oscuro" ? "☀️" : "🌙";
    });
  }
});
