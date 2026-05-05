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

const PORT = 3004;
const MONGO_URL = "mongodb://127.0.0.1:27017/music";

// Schema
const Song = mongoose.model("songdetails", new mongoose.Schema({
  Songname: String,
  Film: String,
  Music_director: String,
  Singer: String,
  Actor: String,
  Actress: String
}));

// Seed data
async function seed() {
  if (await Song.countDocuments() === 0) {
    await Song.insertMany([
      { Songname: "Channa Mereya", Film: "Ae Dil Hai Mushkil", Music_director: "Pritam", Singer: "Arijit Singh", Actor: "Ranbir Kapoor", Actress: "Anushka Sharma" },
      { Songname: "Kesariya", Film: "Brahmastra", Music_director: "Pritam", Singer: "Arijit Singh", Actor: "Ranbir Kapoor", Actress: "Alia Bhatt" },
      { Songname: "Raabta", Film: "Agent", Music_director: "Pritam", Singer: "Arijit Singh", Actor: "Sushant Singh Rajput", Actress: "Kriti Sanon" },
      { Songname: "Tum Hi Ho", Film: "Aashiqui 2", Music_director: "Mithoon", Singer: "Arijit Singh", Actor: "", Actress: "" },
      { Songname: "Kal Ho Naa Ho", Film: "KHNH", Music_director: "Shankar", Singer: "Sonu Nigam", Actor: "SRK", Actress: "Preity Zinta" }
    ]);
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

function table(data) {
  if (!data.length) return "<p>No data found</p>";
  const rows = data.map((s) => `
    <tr>
      <td>${s.Songname}</td><td>${s.Film}</td>
      <td>${s.Music_director}</td><td>${s.Singer}</td>
      <td>${s.Actor || "-"}</td><td>${s.Actress || "-"}</td>
      <td>
        <a href="/delete/${encodeURIComponent(s.Songname)}">Delete</a>
        <a href="/update/${encodeURIComponent(s.Songname)}">Update</a>
      </td>
    </tr>`).join("");

  return `<table>
    <tr><th>Song</th><th>Film</th><th>Director</th><th>Singer</th>
        <th>Actor</th><th>Actress</th><th>Action</th></tr>
    ${rows}
  </table>`;
}

app.get("/", (req, res) => {
  res.send(page("Music DB", `
    <a href="/songs">All Songs</a>
    <a href="/add">Add Song</a>
    <a href="/count">Count</a>

    <h3>Search by Director</h3>
    <form action="/director" method="GET">
      <input name="name" placeholder="Music Director">
      <button>Search</button>
    </form>

    <h3>Filter by Director + Singer</h3>
    <form action="/filter" method="GET">
      <input name="director" placeholder="Director">
      <input name="singer" placeholder="Singer">
      <button>Filter</button>
    </form>

    <h3>Search by Film + Singer</h3>
    <form action="/film" method="GET">
      <input name="film" placeholder="Film">
      <input name="singer" placeholder="Singer">
      <button>Search</button>
    </form>
  `));
});

app.get("/songs", async (req, res) => {
  const data = await Song.find();
  res.send(page("All Songs", table(data)));
});

app.get("/count", async (req, res) => {
  const count = await Song.countDocuments();
  res.send(page("Count", `<h2>Total Songs: ${count}</h2>`));
});

app.get("/delete/:name", async (req, res) => {
  await Song.deleteOne({ Songname: req.params.name });
  res.send(page("Done", "<p style=\"color:green\">Deleted</p>"));
});

app.get("/director", async (req, res) => {
  const name = (req.query.name || "").trim();
  const data = await Song.find({ Music_director: { $regex: name, $options: "i" } });
  res.send(page("Director Songs", table(data)));
});

app.get("/filter", async (req, res) => {
  const director = (req.query.director || "").trim();
  const singer = (req.query.singer || "").trim();
  const data = await Song.find({
    Music_director: { $regex: director, $options: "i" },
    Singer: { $regex: singer, $options: "i" }
  });
  res.send(page("Filter Result", table(data)));
});

app.get("/film", async (req, res) => {
  const film = (req.query.film || "").trim();
  const singer = (req.query.singer || "").trim();
  const data = await Song.find({
    Film: { $regex: film, $options: "i" },
    Singer: { $regex: singer, $options: "i" }
  });
  res.send(page("Film + Singer", table(data)));
});

app.get("/add", (req, res) => {
  res.send(page("Add Song", `
    <form method="POST" action="/add">
      <input name="Songname" placeholder="Song Name" required><br>
      <input name="Film" placeholder="Film" required><br>
      <input name="Music_director" placeholder="Director" required><br>
      <input name="Singer" placeholder="Singer" required><br>
      <input name="Actor" placeholder="Actor" required><br>
      <input name="Actress" placeholder="Actress" required><br>
      <button>Add Song</button>
    </form>`));
});

app.post("/add", async (req, res) => {
  await Song.create(req.body);
  res.send(page("Done", "<p style=\"color:green\">Song added</p>"));
});

app.get("/update/:name", (req, res) => {
  res.send(page("Update Song", `
    <form method="POST" action="/update/${req.params.name}">
      <input name="Actor" placeholder="Actor" required>
      <input name="Actress" placeholder="Actress" required>
      <button>Update</button>
    </form>`));
});

app.post("/update/:name", async (req, res) => {
  await Song.updateOne({ Songname: req.params.name }, { $set: req.body });
  res.send(page("Done", "<p style=\"color:green\">Updated</p>"));
});

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seed();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
