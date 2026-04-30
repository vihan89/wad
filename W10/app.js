const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

function serverGet() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = JSON.parse(localStorage.getItem("tasks") || "[]");
      resolve(data);
    }, 200);
  });
}

function serverSave(tasks) {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      resolve(true);
    }, 200);
  });
}

async function render() {
  const tasks = await serverGet();
  taskList.innerHTML = "";

  tasks.forEach((t, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t}</span>
      <span>
        <button data-edit="${index}">Edit</button>
        <button data-del="${index}">Delete</button>
      </span>
    `;
    taskList.appendChild(li);
  });
}

addBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = await serverGet();
  tasks.push(text);
  await serverSave(tasks);
  taskInput.value = "";
  render();
});

taskList.addEventListener("click", async (e) => {
  const editIndex = e.target.dataset.edit;
  const delIndex = e.target.dataset.del;

  if (editIndex !== undefined) {
    const tasks = await serverGet();
    const newText = prompt("Update task", tasks[editIndex]);
    if (newText) {
      tasks[editIndex] = newText;
      await serverSave(tasks);
      render();
    }
  }

  if (delIndex !== undefined) {
    const tasks = await serverGet();
    tasks.splice(delIndex, 1);
    await serverSave(tasks);
    render();
  }
});

render();
