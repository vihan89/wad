const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

async function serverGet() {
  const res = await fetch("/api/tasks");
  return res.json();
}

async function serverAdd(text) {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
}

async function serverUpdate(id, text) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
}

async function serverToggle(id, done) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
}

async function serverDelete(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
}

async function render() {
  const tasks = await serverGet();
  taskList.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = t.done ? "task-done" : "";
    li.innerHTML = `
      <span>${t.text}</span>
      <span class="actions">
        <button data-toggle="${t.id}">${t.done ? "Undo" : "Complete"}</button>
        <button data-edit="${t.id}">Update</button>
        <button data-del="${t.id}">Delete</button>
      </span>
    `;
    taskList.appendChild(li);
  });
}

addBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  await serverAdd(text);
  taskInput.value = "";
  render();
});

taskList.addEventListener("click", async (e) => {
  const editIndex = e.target.dataset.edit;
  const delIndex = e.target.dataset.del;
  const toggleIndex = e.target.dataset.toggle;

  if (editIndex !== undefined) {
    const currentText = e.target.closest("li").querySelector("span").textContent;
    const newText = prompt("Update task", currentText);
    if (newText) {
      await serverUpdate(editIndex, newText);
      render();
    }
  }

  if (toggleIndex !== undefined) {
    const isDone = e.target.textContent === "Undo";
    await serverToggle(toggleIndex, !isDone);
    render();
  }

  if (delIndex !== undefined) {
    await serverDelete(delIndex);
    render();
  }
});

render();
