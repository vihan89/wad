const products = [
  {
    name: "Wireless Headphones",
    price: "₹7,999",
    desc: "Noise-cancelling over-ear headphones.",
    image: "https://via.placeholder.com/80?text=HP"
  },
  {
    name: "Smartwatch",
    price: "₹12,999",
    desc: "Fitness tracking smartwatch.",
    image: "https://via.placeholder.com/80?text=SW"
  },
  {
    name: "Gaming Mouse",
    price: "₹2,499",
    desc: "Ergonomic gaming mouse.",
    image: "https://via.placeholder.com/80?text=GM"
  },
  {
    name: "Laptop Stand",
    price: "₹1,999",
    desc: "Adjustable aluminium stand.",
    image: "https://via.placeholder.com/80?text=LS"
  },
  { name: "Bluetooth Speaker", price: "₹3,499", desc: "Portable speaker.", image: "https://via.placeholder.com/80?text=BS" },
  { name: "USB-C Hub", price: "₹1,299", desc: "Multiport adapter.", image: "https://via.placeholder.com/80?text=UB" },
  { name: "Webcam", price: "₹2,199", desc: "Full HD webcam.", image: "https://via.placeholder.com/80?text=WC" },
  { name: "Mechanical Keyboard", price: "₹4,999", desc: "Tactile keys.", image: "https://via.placeholder.com/80?text=MK" },
  { name: "Power Bank", price: "₹1,899", desc: "10000mAh backup.", image: "https://via.placeholder.com/80?text=PB" },
  { name: "Tablet Stand", price: "₹899", desc: "Desk stand.", image: "https://via.placeholder.com/80?text=TS" },
  { name: "Wireless Charger", price: "₹1,599", desc: "Fast charge pad.", image: "https://via.placeholder.com/80?text=WC" },
  { name: "Noise Cancelling Earbuds", price: "₹5,499", desc: "Compact earbuds.", image: "https://via.placeholder.com/80?text=NE" }
];

const pageSize = 10;
let currentPage = 1;

const tbody = document.getElementById("product-rows");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function render() {
  tbody.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageItems = products.slice(start, start + pageSize);

  pageItems.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img class="thumb" src="${p.image}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.desc}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalPages = Math.ceil(products.length / pageSize);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(products.length / pageSize);
  if (currentPage < totalPages) {
    currentPage += 1;
    render();
  }
});

render();
