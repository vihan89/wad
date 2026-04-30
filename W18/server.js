const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const url = "mongodb://localhost:27017";
const dbName = "music";
const collectionName = "song details";

const songs = [
  { Songname: "Zara", Film: "Star", Music_director: "A R Rahman", Singer: "Sonu" },
  { Songname: "Naina", Film: "Moon", Music_director: "A R Rahman", Singer: "Shreya" },
  { Songname: "Dil", Film: "Sky", Music_director: "Pritam", Singer: "Arijit" },
  { Songname: "Rang", Film: "Fire", Music_director: "Pritam", Singer: "Shreya" },
  { Songname: "Jiya", Film: "Wave", Music_director: "A R Rahman", Singer: "Arijit" }
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
      <td>${d.Songname || ""}</td>
      <td>${d.Film || ""}</td>
      <td>${d.Music_director || ""}</td>
      <td>${d.Singer || ""}</td>
      <td>${d.Actor || ""}</td>
      <td>${d.Actress || ""}</td>
    </tr>
  `).join("");

  return `
    <table border="1" cellpadding="6">
      <tr><th>Song Name</th><th>Film Name</th><th>Music Director</th><th>Singer</th><th>Actor</th><th>Actress</th></tr>
      ${rows}
    </table>
  `;
}

app.get("/", (req, res) => {
  res.send(`
    <h2>Music DB Tasks</h2>
    <ul>
      <li><a href="/setup">Setup (insert 5 songs)</a></li>
      <li><a href="/all">Count + All Songs</a></li>
      <li><a href="/director/A%20R%20Rahman">Songs by Music Director</a></li>
      <li><a href="/director/A%20R%20Rahman/singer/Arijit">Director + Singer</a></li>
      <li><a href="/delete/Zara">Delete Song (Zara)</a></li>
      <li><a href="/add?song=NewSong&film=NewFilm&director=Pritam&singer=Sonu">Add Song</a></li>
      <li><a href="/film/Star/singer/Sonu">Singer from Film</a></li>
      <li><a href="/update-actor?song=Dil&actor=Ranveer&actress=Alia">Update Actor/Actress</a></li>
      <li><a href="/table">Table View</a></li>
    </ul>
  `);
});

app.get("/setup", async (req, res) => {
  await withCollection((col) => col.insertMany(songs));
  res.send("Inserted 5 songs.");
});

app.get("/all", async (req, res) => {
  const docs = await withCollection((col) => col.find({}).toArray());
  res.send(`<p>Total: ${docs.length}</p>${toTable(docs)}`);
});

app.get("/director/:name", async (req, res) => {
  const docs = await withCollection((col) => col.find({ Music_director: req.params.name }).toArray());
  res.send(toTable(docs));
});

app.get("/director/:name/singer/:singer", async (req, res) => {
  const docs = await withCollection((col) => col.find({ Music_director: req.params.name, Singer: req.params.singer }).toArray());
  res.send(toTable(docs));
});

app.get("/delete/:song", async (req, res) => {
  await withCollection((col) => col.deleteOne({ Songname: req.params.song }));
  res.send("Deleted song.");
});

app.get("/add", async (req, res) => {
  const doc = {
    Songname: req.query.song,
    Film: req.query.film,
    Music_director: req.query.director,
    Singer: req.query.singer
  };
  await withCollection((col) => col.insertOne(doc));
  res.send("Added song.");
});

app.get("/film/:film/singer/:singer", async (req, res) => {
  const docs = await withCollection((col) => col.find({ Film: req.params.film, Singer: req.params.singer }).toArray());
  res.send(toTable(docs));
});

app.get("/update-actor", async (req, res) => {
  await withCollection((col) => col.updateMany(
    { Songname: req.query.song },
    { $set: { Actor: req.query.actor, Actress: req.query.actress } }
  ));
  res.send("Updated actor/actress.");
});

app.get("/table", async (req, res) => {
  const docs = await withCollection((col) => col.find({}).toArray());
  res.send(toTable(docs));
});

app.listen(3004, () => {
  console.log("Server running at http://localhost:3004");
});
