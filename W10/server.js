const http = require("http");
const fs = require("fs");
const path = require("path");

const data = [];

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    try {
      callback(JSON.parse(body || "{}"));
    } catch {
      callback({});
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

const server = http.createServer((req, res) => {
  if (req.url === "/api/tasks" && req.method === "GET") {
    return sendJson(res, 200, data);
  }

  if (req.url === "/api/tasks" && req.method === "POST") {
    return readBody(req, (body) => {
      const task = { id: Date.now().toString(), text: body.text || "", done: false };
      data.push(task);
      sendJson(res, 200, task);
    });
  }

  if (req.url.startsWith("/api/tasks/") && req.method === "PUT") {
    const id = req.url.split("/").pop();
    return readBody(req, (body) => {
      const task = data.find((t) => t.id === id);
      if (task) {
        if (typeof body.text === "string") task.text = body.text || task.text;
        if (typeof body.done === "boolean") task.done = body.done;
      }
      sendJson(res, 200, { ok: true });
    });
  }

  if (req.url.startsWith("/api/tasks/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    const index = data.findIndex((t) => t.id === id);
    if (index >= 0) data.splice(index, 1);
    return sendJson(res, 200, { ok: true });
  }

  const filePath = req.url === "/" ? "index.html" : req.url.slice(1);
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath);
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  const contentType = types[ext] || "text/plain";

  serveFile(res, fullPath, contentType);
});

server.listen(3008, () => {
  console.log("Server running at http://localhost:3008");
});
