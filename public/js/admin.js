// public/js/admin.js

document.addEventListener("DOMContentLoaded", () => {

    // ======== LOGIN PAGE ======== //
    const quickBtn = document.getElementById("quick-fill");
    if (quickBtn) {
        quickBtn.addEventListener("click", () => {
            document.getElementById("email").value = "admin@empresa.com";
            document.getElementById("password").value = "admin123";
        });
    }

    // ======== DASHBOARD ======== //
    const modal = document.getElementById("confirm-modal");
    const confirmYes = document.getElementById("confirm-yes");
    const confirmNo = document.getElementById("confirm-no");
    const confirmText = document.getElementById("confirm-text");
    let currentAction = null;
    let currentProductId = null;

    // Acciones (activar, desactivar, eliminar)
    document.querySelectorAll(".actions button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;

            currentProductId = id;
            currentAction = action;

            if (action === "delete") {
                confirmText.textContent = "¿Seguro que deseas eliminar este producto definitivamente?";
            } else if (action === "deactivate") {
                confirmText.textContent = "¿Seguro que deseas desactivar este producto?";
            } else if (action === "activate") {
                confirmText.textContent = "¿Seguro que deseas activar este producto?";
            }

            modal.classList.remove("hidden");
        });
    });

    // Confirmar acción
    confirmYes?.addEventListener("click", async () => {
        if (!currentAction || !currentProductId) return;

        let endpoint = "";
        let method = "PATCH";

        switch (currentAction) {
            case "delete":
                endpoint = `/api/products/${currentProductId}`;
                method = "DELETE";
                break;
            case "deactivate":
                endpoint = `/api/products/${currentProductId}/deactivate`;
                break;
            case "activate":
                endpoint = `/api/products/${currentProductId}/activate`;
                break;
        }

        try {
            const res = await fetch(endpoint, { method });
            if (!res.ok) throw new Error("Error en la acción");
            location.reload();
        } catch (err) {
            alert("❌ Ocurrió un error al procesar la acción.");
            console.error(err);
        }
    });

    // Cancelar acción
    confirmNo?.addEventListener("click", () => {
        modal.classList.add("hidden");
        currentAction = null;
        currentProductId = null;
    });
});
