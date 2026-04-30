fetch("/api/users")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("list");
    data.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.name} - ${u.email}`;
      list.appendChild(li);
    });
  });
