const nameInput = document.getElementById("name");
const deptInput = document.getElementById("dept");
const desigInput = document.getElementById("desig");
const salaryInput = document.getElementById("salary");
const dateInput = document.getElementById("date");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

async function load() {
  const res = await fetch("/api/employees");
  const data = await res.json();
  list.innerHTML = "";

  data.forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${e.name} | ${e.department} | ${e.designation} | ${e.salary} | ${e.joiningDate}</span>
      <span>
        <button data-edit="${e._id}">Edit</button>
        <button data-del="${e._id}">Delete</button>
      </span>
    `;
    list.appendChild(li);
  });
}

addBtn.addEventListener("click", async () => {
  const doc = {
    name: nameInput.value.trim(),
    department: deptInput.value.trim(),
    designation: desigInput.value.trim(),
    salary: salaryInput.value.trim(),
    joiningDate: dateInput.value.trim()
  };
  await fetch("/api/employees", {
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
    const name = prompt("Name");
    const department = prompt("Department");
    const designation = prompt("Designation");
    const salary = prompt("Salary");
    const joiningDate = prompt("Joining Date");

    await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department, designation, salary, joiningDate })
    });
  }

  if (e.target.dataset.del) {
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
  }

  load();
});

load();
