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

const PORT = 3005;
const MONGO_URL = "mongodb://127.0.0.1:27017/student";

const studentSchema = new mongoose.Schema({
  Name: String,
  Roll_No: Number,
  WAD_Marks: Number,
  CC_Marks: Number,
  DSBDA_Marks: Number,
  CNS_Marks: Number,
  AI_marks: Number
});

const Student = mongoose.model("studentmarks", studentSchema, "studentmarks");

const seedStudents = [
  { Name: "Asha", Roll_No: 101, WAD_Marks: 22, CC_Marks: 25, DSBDA_Marks: 24, CNS_Marks: 26, AI_marks: 28 },
  { Name: "Bala", Roll_No: 102, WAD_Marks: 30, CC_Marks: 28, DSBDA_Marks: 29, CNS_Marks: 27, AI_marks: 30 },
  { Name: "Chirag", Roll_No: 103, WAD_Marks: 18, CC_Marks: 21, DSBDA_Marks: 19, CNS_Marks: 20, AI_marks: 22 },
  { Name: "Diya", Roll_No: 104, WAD_Marks: 26, CC_Marks: 27, DSBDA_Marks: 21, CNS_Marks: 23, AI_marks: 24 }
];

async function seedIfEmpty() {
  if (await Student.countDocuments() === 0) {
    await Student.insertMany(seedStudents);
    console.log("Seed data inserted");
  }
}

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
      <td>${d.Name}</td>
      <td>${d.Roll_No}</td>
      <td>${d.WAD_Marks}</td>
      <td>${d.DSBDA_Marks}</td>
      <td>${d.CNS_Marks}</td>
      <td>${d.CC_Marks}</td>
      <td>${d.AI_marks}</td>
      <td>
        <a href="/update/${encodeURIComponent(String(d.Roll_No))}">Update</a>
        <a href="/delete/${encodeURIComponent(String(d.Roll_No))}">Delete</a>
      </td>
    </tr>
  `).join("");

  return `<table>
    <tr><th>Name</th><th>Roll No</th><th>WAD</th><th>DSBDA</th><th>CNS</th><th>CC</th><th>AI</th><th>Action</th></tr>
    ${rows}
  </table>`;
}

app.get("/", (req, res) => {
  res.send(page("Student DB", `
    <a href="/setup">Setup</a>
    <a href="/all">All Students</a>
    <a href="/count">Count</a>
    <a href="/dsbda">DSBDA > 20</a>
    <a href="/all-above-25">All Subjects > 25</a>
    <a href="/low-math-science">WAD & CNS < 40</a>
    <a href="/table">Table View</a>

    <h3>Update Marks (+10)</h3>
    <form action="/update" method="GET">
      <input name="roll" placeholder="Roll No" required>
      <button>Update</button>
    </form>

    <h3>Delete Student</h3>
    <form action="/delete" method="GET">
      <input name="roll" placeholder="Roll No" required>
      <button>Delete</button>
    </form>
  `));
});

app.get("/setup", async (req, res) => {
  await Student.deleteMany({});
  await Student.insertMany(seedStudents);
  res.send(page("Setup", "<p style=\"color:green\">Reset and inserted student documents.</p>"));
});

app.get("/all", async (req, res) => {
  const docs = await Student.find().lean();
  res.send(page("All Students", `<p>Total: ${docs.length}</p>${table(docs)}`));
});

app.get("/count", async (req, res) => {
  const count = await Student.countDocuments();
  res.send(page("Count", `<h2>Total Students: ${count}</h2>`));
});

app.get("/dsbda", async (req, res) => {
  const docs = await Student.find({ DSBDA_Marks: { $gt: 20 } }).lean();
  res.send(page("DSBDA > 20", table(docs)));
});

app.get("/update", async (req, res) => {
  const roll = Number(req.query.roll);
  if (!roll) {
    res.send(page("Update", "<p>Roll No is required.</p>"));
    return;
  }
  await Student.updateOne(
    { Roll_No: roll },
    { $inc: { WAD_Marks: 10, CC_Marks: 10, DSBDA_Marks: 10, CNS_Marks: 10, AI_marks: 10 } }
  );
  res.send(page("Updated", `<p style=\"color:green\">Updated roll ${roll}.</p>`));
});

app.get("/update/:roll", async (req, res) => {
  const roll = Number(req.params.roll);
  await Student.updateOne(
    { Roll_No: roll },
    { $inc: { WAD_Marks: 10, CC_Marks: 10, DSBDA_Marks: 10, CNS_Marks: 10, AI_marks: 10 } }
  );
  res.send(page("Updated", `<p style=\"color:green\">Updated roll ${roll}.</p>`));
});

app.get("/all-above-25", async (req, res) => {
  const docs = await Student.find({
    WAD_Marks: { $gt: 25 },
    CC_Marks: { $gt: 25 },
    DSBDA_Marks: { $gt: 25 },
    CNS_Marks: { $gt: 25 },
    AI_marks: { $gt: 25 }
  }).lean();
  res.send(page("All Subjects > 25", table(docs)));
});

app.get("/low-math-science", async (req, res) => {
  const docs = await Student.find({ WAD_Marks: { $lt: 40 }, CNS_Marks: { $lt: 40 } }).lean();
  res.send(page("WAD & CNS < 40", table(docs)));
});

app.get("/delete", async (req, res) => {
  const roll = Number(req.query.roll);
  if (!roll) {
    res.send(page("Delete", "<p>Roll No is required.</p>"));
    return;
  }
  await Student.deleteOne({ Roll_No: roll });
  res.send(page("Deleted", `<p style=\"color:green\">Deleted roll ${roll}.</p>`));
});

app.get("/delete/:roll", async (req, res) => {
  const roll = Number(req.params.roll);
  await Student.deleteOne({ Roll_No: roll });
  res.send(page("Deleted", `<p style=\"color:green\">Deleted roll ${roll}.</p>`));
});

app.get("/table", async (req, res) => {
  const docs = await Student.find().lean();
  res.send(page("Table View", table(docs)));
});

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
