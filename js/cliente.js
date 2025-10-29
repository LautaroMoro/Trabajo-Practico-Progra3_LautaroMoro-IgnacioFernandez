// Productos hardcodeados
const products = [
  {id:1,name:"Producto A1",category:"Categoría 1",price:100,img:"producto1.jpg",active:true},
  {id:2,name:"Producto A2",category:"Categoría 1",price:120,img:"producto2.jpg",active:true},
  {id:3,name:"Producto B1",category:"Categoría 2",price:200,img:"producto3.jpg",active:true},
  {id:4,name:"Producto B2",category:"Categoría 2",price:250,img:"producto4.jpg",active:true},
  {id:5,name:"Producto Inactivo",category:"Categoría 1",price:150,img:"producto5.jpg",active:false},
  // agregar más productos si se quiere
];

let cart = [];
let currentPage = 1;
const productsPerPage = 6;

// Bienvenida
const startBtn = document.getElementById("startBtn");
const usernameInput = document.getElementById("usernameInput");
let username = "";

startBtn.addEventListener("click", () => {
  if(usernameInput.value.trim() === ""){
    alert("Ingrese su nombre para continuar");
    return;
  }
  username = usernameInput.value.trim();
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("productosSection").style.display = "block";
  renderProducts(getActiveProducts());
});

// Obtener productos activos
function getActiveProducts(){
  return products.filter(p => p.active);
}

// Renderizar productos con paginación
function renderProducts(productList){
  const start = (currentPage -1)*productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = productList.slice(start,end);

  const container = document.getElementById("productosGrid");
  container.innerHTML = "";

  paginatedProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="categoria">${product.category}</p>
      <p class="precio">$${product.price}</p>
      <button class="btn-agregar" data-id="${product.id}">Agregar</button>
    `;
    container.appendChild(card);
  });

  // Agregar eventos a botones de agregar
  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", ()=> addToCart(parseInt(btn.dataset.id)));
  });
}

// Paginación
document.getElementById("prevPage").addEventListener("click",()=>{
  if(currentPage>1){
    currentPage--;
    renderProducts(getActiveProducts());
    document.getElementById("pageNum").innerText=currentPage;
  }
});
document.getElementById("nextPage").addEventListener("click",()=>{
  if(currentPage<Math.ceil(getActiveProducts().length/productsPerPage)){
    currentPage++;
    renderProducts(getActiveProducts());
    document.getElementById("pageNum").innerText=currentPage;
  }
});

// Carrito
function addToCart(productId){
  const prod = products.find(p=>p.id===productId);
  const existing = cart.find(c=>c.id===productId);
  if(existing){
    existing.quantity++;
  }else{
    cart.push({...prod,quantity:1});
  }
  alert(`${prod.name} agregado al carrito`);
}

document.getElementById("viewCartBtn").addEventListener("click",()=>{
  showCart();
  document.getElementById("productosSection").style.display="none";
  document.getElementById("carritoSection").style.display="block";
});

document.getElementById("volverProductosBtn").addEventListener("click",()=>{
  document.getElementById("carritoSection").style.display="none";
  document.getElementById("productosSection").style.display="block";
  renderProducts(getActiveProducts());
});

function showCart(){
  const container = document.getElementById("carritoContainer");
  container.innerHTML="";
  let total = 0;
  cart.forEach(item=>{
    total += item.price*item.quantity;
    const div = document.createElement("div");
    div.classList.add("item-carrito");
    div.innerHTML=`
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>$${item.price}</p>
      <div class="controles">
        <button class="btn-sumar">+</button>
        <span>${item.quantity}</span>
        <button class="btn-restar">-</button>
        <button class="btn-eliminar">Eliminar</button>
      </div>
    `;
    container.appendChild(div);

    div.querySelector(".btn-sumar").addEventListener("click",()=>{
      item.quantity++;
      showCart();
    });
    div.querySelector(".btn-restar").addEventListener("click",()=>{
      if(item.quantity>1) item.quantity--;
      else cart = cart.filter(c=>c.id!==item.id);
      showCart();
    });
    div.querySelector(".btn-eliminar").addEventListener("click",()=>{
      cart = cart.filter(c=>c.id!==item.id);
      showCart();
    });
  });
  document.getElementById("totalSection").innerText = `Total: $${total}`;
}

// Modal de confirmación
const confirmModal = document.getElementById("confirmModal");
document.getElementById("finalizarCompraBtn").addEventListener("click",()=>{
  if(cart.length===0){alert("Carrito vacío");return;}
  confirmModal.classList.remove("oculto");
});
document.getElementById("btnCancelar").addEventListener("click",()=>{
  confirmModal.classList.add("oculto");
});
document.getElementById("btnConfirmar").addEventListener("click",()=>{
  confirmModal.classList.add("oculto");
  showTicket();
});

// Ticket
function showTicket(){
  document.getElementById("carritoSection").style.display="none";
  document.getElementById("ticketSection").style.display="block";

  const ticketItems = document.getElementById("ticketItems");
  ticketItems.innerHTML="";
  let total = 0;
  cart.forEach(item=>{
    total += item.price*item.quantity;
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.quantity} - $${item.price*item.quantity}`;
    ticketItems.appendChild(li);
  });
  document.getElementById("ticketTotal").textContent = `Total: $${total}`;
  document.getElementById("ticketUser").textContent = `Cliente: ${username}`;
  document.getElementById("ticketDate").textContent = `Fecha: ${new Date().toLocaleDateString()}`;
}

document.getElementById("restartBtn").addEventListener("click",()=>{
  cart=[];
  document.getElementById("ticketSection").style.display="none";
  document.getElementById("mainContent").style.display="block";
  usernameInput.value="";
});

// Descargar PDF
document.getElementById("downloadPDFBtn").addEventListener("click",()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Ticket de Compra",20,20);
  let y=30;
  cart.forEach(item=>{
    doc.text(`${item.name} x${item.quantity} - $${item.price*item.quantity}`,20,y);
    y+=10;
  });
  doc.text(`Total: $${cart.reduce((acc,c)=>acc+c.price*c.quantity,0)}`,20,y+10);
  doc.save("ticket.pdf");
});

// Cambiar tema
const toggleThemeBtn = document.getElementById("themeToggle");
toggleThemeBtn.addEventListener("click",()=>{
  document.body.classList.toggle("theme-light");
  localStorage.setItem("theme", document.body.classList.contains("theme-light")?"light":"dark");
});
if(localStorage.getItem("theme")==="light") document.body.classList.add("theme-light");

// Login administrador
document.getElementById("adminLogin").addEventListener("click",()=>{
  window.location.href="admin/login.html";
});
