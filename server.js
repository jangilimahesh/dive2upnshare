const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Telegram bot is running");
}).listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});