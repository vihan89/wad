const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const url = "mongodb://localhost:27017";
const dbName = "bookstore";
const collectionName = "books";

app.use(express.json());
app.use(express.static(__dirname + "/public"));

async function withCollection(fn) {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection(collectionName);
  const result = await fn(col, db);
  await client.close();
  return result;
}

app.get("/api/books", async (req, res) => {
  const docs = await withCollection((col) => col.find({}).toArray());
  res.json(docs);
});

app.post("/api/books", async (req, res) => {
  const doc = req.body;
  await withCollection((col) => col.insertOne(doc));
  res.json({ ok: true });
});

app.put("/api/books/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  await withCollection((col) => col.updateOne({ _id: id }, { $set: req.body }));
  res.json({ ok: true });
});

app.delete("/api/books/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  await withCollection((col) => col.deleteOne({ _id: id }));
  res.json({ ok: true });
});

app.listen(3007, () => {
  console.log("Server running at http://localhost:3007");
});
