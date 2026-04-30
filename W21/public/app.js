const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const priceInput = document.getElementById("price");
const genreInput = document.getElementById("genre");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

async function load() {
  const res = await fetch("/api/books");
  const data = await res.json();
  list.innerHTML = "";

  data.forEach((b) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${b.title} | ${b.author} | ${b.price} | ${b.genre}</span>
      <span>
        <button data-edit="${b._id}">Edit</button>
        <button data-del="${b._id}">Delete</button>
      </span>
    `;
    list.appendChild(li);
  });
}

addBtn.addEventListener("click", async () => {
  const doc = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    price: priceInput.value.trim(),
    genre: genreInput.value.trim()
  };
  await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc)
  });
  load();
});

list.addEventListener("click", async (e) => {
  const id = e.target.dataset.edit || e.target.dataset.del;
  if (!id) return;

  if (e.target.dataset.edit) {
    const title = prompt("Title");
    const author = prompt("Author");
    const price = prompt("Price");
    const genre = prompt("Genre");

    await fetch(`/api/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, price, genre })
    });
  }

  if (e.target.dataset.del) {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
  }

  load();
});

load();
