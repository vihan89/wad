const http = require("http");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? "index.html" : req.url.slice(1);
  const fullPath = path.join(publicDir, filePath);
  const ext = path.extname(fullPath);
  const types = { ".html": "text/html", ".css": "text/css" };
  const contentType = types[ext] || "text/plain";

  serveFile(res, fullPath, contentType);
});

server.listen(3002, () => {
  console.log("Server running at http://localhost:3002");
});
