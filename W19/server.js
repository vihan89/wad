const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const url = "mongodb://localhost:27017";
const dbName = "student";
const collectionName = "studentmarks";

const students = [
  { Name: "Asha", Roll_No: 101, WAD_Marks: 22, CC_Marks: 25, DSBDA_Marks: 24, CNS_Marks: 26, AI_marks: 28 },
  { Name: "Bala", Roll_No: 102, WAD_Marks: 30, CC_Marks: 28, DSBDA_Marks: 29, CNS_Marks: 27, AI_marks: 30 },
  { Name: "Chirag", Roll_No: 103, WAD_Marks: 18, CC_Marks: 21, DSBDA_Marks: 19, CNS_Marks: 20, AI_marks: 22 },
  { Name: "Diya", Roll_No: 104, WAD_Marks: 26, CC_Marks: 27, DSBDA_Marks: 21, CNS_Marks: 23, AI_marks: 24 }
];

async function withCollection(fn) {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection(collectionName);
  const result = await fn(col, db);
  await client.close();
  return result;
}

function toTable(docs) {
  const rows = docs.map((d) => `
    <tr>
      <td>${d.Name}</td>
      <td>${d.Roll_No}</td>
      <td>${d.WAD_Marks}</td>
      <td>${d.DSBDA_Marks}</td>
      <td>${d.CNS_Marks}</td>
      <td>${d.CC_Marks}</td>
      <td>${d.AI_marks}</td>
    </tr>
  `).join("");

  return `
    <table border="1" cellpadding="6">
      <tr><th>Name</th><th>Roll No</th><th>WAD</th><th>DSBDA</th><th>CNS</th><th>CC</th><th>AI</th></tr>
      ${rows}
    </table>
  `;
}

function toNameList(docs) {
  const items = docs.map((d) => `<li>${d.Name}</li>`).join("");
  return `<ul>${items}</ul>`;
}

app.get("/", (req, res) => {
  res.send(`
    <h2>Student DB Tasks</h2>
    <ul>
      <li><a href="/setup">Setup (insert docs)</a></li>
      <li><a href="/all">Count + All Students</a></li>
      <li><a href="/dsbda">DSBDA > 20</a></li>
      <li><a href="/update/102">Update marks by +10 (Roll 102)</a></li>
      <li><a href="/all-above-25">All subjects > 25</a></li>
      <li><a href="/low-math-science">Less than 40 in Maths & Science</a></li>
      <li><a href="/delete/103">Delete Roll 103</a></li>
      <li><a href="/table">Table View</a></li>
    </ul>
  `);
});

app.get("/setup", async (req, res) => {
  await withCollection(async (col) => {
    await col.deleteMany({});
    await col.insertMany(students);
  });
  res.send("Reset and inserted student documents.");
});

app.get("/all", async (req, res) => {
  const docs = await withCollection((col) => col.find({}).toArray());
  res.send(`<p>Total: ${docs.length}</p>${toTable(docs)}`);
});

app.get("/dsbda", async (req, res) => {
  const docs = await withCollection((col) => col.find({ DSBDA_Marks: { $gt: 20 } }).toArray());
  res.send(toNameList(docs));
});

app.get("/update/:roll", async (req, res) => {
  const roll = Number(req.params.roll);
  await withCollection((col) => col.updateOne(
    { Roll_No: roll },
    { $inc: { WAD_Marks: 10, CC_Marks: 10, DSBDA_Marks: 10, CNS_Marks: 10, AI_marks: 10 } }
  ));
  res.send("Marks updated.");
});

app.get("/all-above-25", async (req, res) => {
  const docs = await withCollection((col) => col.find({
    WAD_Marks: { $gt: 25 },
    CC_Marks: { $gt: 25 },
    DSBDA_Marks: { $gt: 25 },
    CNS_Marks: { $gt: 25 },
    AI_marks: { $gt: 25 }
  }).toArray());
  res.send(toNameList(docs));
});

app.get("/low-math-science", async (req, res) => {
  const docs = await withCollection((col) => col.find({ WAD_Marks: { $lt: 40 }, CNS_Marks: { $lt: 40 } }).toArray());
  res.send(toNameList(docs));
});

app.get("/delete/:roll", async (req, res) => {
  const roll = Number(req.params.roll);
  await withCollection((col) => col.deleteOne({ Roll_No: roll }));
  res.send("Deleted student.");
});

app.get("/table", async (req, res) => {
  const docs = await withCollection((col) => col.find({}).toArray());
  res.send(toTable(docs));
});

app.listen(3005, () => {
  console.log("Server running at http://localhost:3005");
});
