fetch("/api/employees")
  .then((res) => res.json())
  .then((data) => {
    const grid = document.getElementById("grid");
    data.forEach((e) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${e.image}" alt="${e.name}">
        <h3>${e.name}</h3>
        <p>${e.designation}</p>
        <p>${e.department}</p>
        <p>INR ${e.salary}</p>
      `;
      grid.appendChild(card);
    });
  });
