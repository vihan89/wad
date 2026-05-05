const express = require("express");
const mongoose = require("mongoose");
const nodeCrypto = require("crypto");

// Ensure Web Crypto is available for drivers that expect globalThis.crypto.
if (!globalThis.crypto && nodeCrypto.webcrypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const PORT = 3006;
const MONGO_URL = "mongodb://127.0.0.1:27017/company";

const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model("employees", employeeSchema, "employees");

function page(title, body) {
  return `<html><head><title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; }
    a,button { padding: 8px 12px; margin: 5px; background: #222; color: white;
               text-decoration: none; border-radius: 5px; border: none; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th,td { padding: 10px; border: 1px solid #ddd; text-align: center; }
    th { background: #333; color: white; }
    input { padding: 8px; margin: 5px; width: 200px; }
  </style></head>
  <body><h1>${title}</h1><a href="/">Home</a><br><br>${body}</body></html>`;
}

function table(docs) {
  if (!docs.length) return "<p>No data found</p>";
  const rows = docs.map((d) => `
    <tr>
      <td>${d.name || ""}</td>
      <td>${d.department || ""}</td>
      <td>${d.designation || ""}</td>
      <td>${d.salary || ""}</td>
      <td>${d.joiningDate || ""}</td>
      <td>
        <a href="/update/${d._id}">Update</a>
        <a href="/delete/${d._id}">Delete</a>
      </td>
    </tr>`).join("");

  return `<table>
    <tr><th>Name</th><th>Department</th><th>Designation</th><th>Salary</th><th>Joining Date</th><th>Action</th></tr>
    ${rows}
  </table>`;
}

app.get("/", (req, res) => {
  res.send(page("Employee Manager", `
    <a href="/employees">All Employees</a>
    <a href="/add">Add Employee</a>
  `));
});

app.get("/employees", async (req, res) => {
  const docs = await Employee.find().lean();
  res.send(page("All Employees", table(docs)));
});

app.get("/add", (req, res) => {
  res.send(page("Add Employee", `
    <form method="POST" action="/add">
      <input name="name" placeholder="Name" required><br>
      <input name="department" placeholder="Department" required><br>
      <input name="designation" placeholder="Designation" required><br>
      <input name="salary" placeholder="Salary" required><br>
      <input name="joiningDate" placeholder="Joining Date" required><br>
      <button>Add Employee</button>
    </form>`));
});

app.post("/add", async (req, res) => {
  await Employee.create(req.body);
  res.send(page("Done", "<p style=\"color:green\">Employee added</p>"));
});

app.get("/update/:id", (req, res) => {
  res.send(page("Update Employee", `
    <form method="POST" action="/update/${req.params.id}">
      <input name="name" placeholder="Name"><br>
      <input name="department" placeholder="Department"><br>
      <input name="designation" placeholder="Designation"><br>
      <input name="salary" placeholder="Salary"><br>
      <input name="joiningDate" placeholder="Joining Date"><br>
      <button>Update</button>
    </form>`));
});

app.post("/update/:id", async (req, res) => {
  await Employee.findByIdAndUpdate(req.params.id, { $set: req.body });
  res.send(page("Done", "<p style=\"color:green\">Employee updated</p>"));
});

app.get("/delete/:id", async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.send(page("Done", "<p style=\"color:green\">Employee deleted</p>"));
});

app.get("/api/employees", async (req, res) => {
  const docs = await Employee.find().lean();
  res.json(docs);
});

app.post("/api/employees", async (req, res) => {
  await Employee.create(req.body);
  res.json({ ok: true });
});

app.put("/api/employees/:id", async (req, res) => {
  await Employee.findByIdAndUpdate(req.params.id, { $set: req.body });
  res.json({ ok: true });
});

app.delete("/api/employees/:id", async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
