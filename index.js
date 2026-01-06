require("dotenv").config();
require("./server");          // 👈 REQUIRED for Render
require("./src/worker");

const startBot = require("./src/bot");
startBot(process.env);

console.log("✅ Bot started");