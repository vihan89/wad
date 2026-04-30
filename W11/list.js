const table = document.getElementById("userTable");
const users = JSON.parse(localStorage.getItem("users") || "[]");

users.forEach((u) => {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.mobile}</td><td>${u.city}</td>`;
  table.appendChild(row);
});
