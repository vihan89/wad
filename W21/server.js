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

const PORT = 3007;
const MONGO_URL = "mongodb://127.0.0.1:27017/bookstore";

const bookSchema = new mongoose.Schema({}, { strict: false });
const Book = mongoose.model("books", bookSchema, "books");

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
      <td>${d.title || ""}</td>
      <td>${d.author || ""}</td>
      <td>${d.price || ""}</td>
      <td>${d.genre || ""}</td>
      <td>
        <a href="/update/${d._id}">Update</a>
        <a href="/delete/${d._id}">Delete</a>
      </td>
    </tr>`).join("");

  return `<table>
    <tr><th>Title</th><th>Author</th><th>Price</th><th>Genre</th><th>Action</th></tr>
    ${rows}
  </table>`;
}

app.get("/", (req, res) => {
  res.send(page("Bookstore", `
    <a href="/books">All Books</a>
    <a href="/add">Add Book</a>
  `));
});

app.get("/books", async (req, res) => {
  const docs = await Book.find().lean();
  res.send(page("All Books", table(docs)));
});

app.get("/add", (req, res) => {
  res.send(page("Add Book", `
    <form method="POST" action="/add">
      <input name="title" placeholder="Title" required><br>
      <input name="author" placeholder="Author" required><br>
      <input name="price" placeholder="Price" required><br>
      <input name="genre" placeholder="Genre" required><br>
      <button>Add Book</button>
    </form>`));
});

app.post("/add", async (req, res) => {
  await Book.create(req.body);
  res.send(page("Done", "<p style=\"color:green\">Book added</p>"));
});

app.get("/update/:id", (req, res) => {
  res.send(page("Update Book", `
    <form method="POST" action="/update/${req.params.id}">
      <input name="title" placeholder="Title"><br>
      <input name="author" placeholder="Author"><br>
      <input name="price" placeholder="Price"><br>
      <input name="genre" placeholder="Genre"><br>
      <button>Update</button>
    </form>`));
});

app.post("/update/:id", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, { $set: req.body });
  res.send(page("Done", "<p style=\"color:green\">Book updated</p>"));
});

app.get("/delete/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.send(page("Done", "<p style=\"color:green\">Book deleted</p>"));
});

app.get("/api/books", async (req, res) => {
  const docs = await Book.find().lean();
  res.json(docs);
});

app.post("/api/books", async (req, res) => {
  await Book.create(req.body);
  res.json({ ok: true });
});

app.put("/api/books/:id", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, { $set: req.body });
  res.json({ ok: true });
});

app.delete("/api/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
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
