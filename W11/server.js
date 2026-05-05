const http = require("http");
const fs = require("fs");
const path = require("path");

function readBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    try {
      callback(JSON.parse(body || "[]"));
    } catch {
      callback([]);
    }
  });
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, file) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  });
}

function renderTable(users) {
  const rows = users.map((u) => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.mobile}</td>
      <td>${u.city}</td>
    </tr>
  `).join("");

  return `
    <h1>Registered Users</h1>
    <table border="1" cellpadding="6">
      <tr><th>Name</th><th>Email</th><th>Mobile</th><th>City</th></tr>
      ${rows}
    </table>
  `;
}

const server = http.createServer((req, res) => {
  if (req.url === "/output" && req.method === "POST") {
    return readBody(req, (users) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(renderTable(users));
    });
  }

  const filePath = req.url === "/" ? "index.html" : req.url.slice(1);
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath);
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  const contentType = types[ext] || "text/plain";

  serveFile(res, fullPath, contentType);
});

server.listen(3011, () => {
  console.log("Server running at http://localhost:3011");
});
