fetch("/api/products")
  .then((res) => res.json())
  .then((data) => {
    const grid = document.getElementById("grid");
    data.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.price}</p>
      `;
      grid.appendChild(card);
    });
  });
