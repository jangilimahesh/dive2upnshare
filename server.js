const http = require("http");
const PORT = process.env.PORT || 3000;

http.createServer((_, res) => {
  res.end("Bot is running");
}).listen(PORT, () => {
  console.log("🌐 Server listening on", PORT);
});