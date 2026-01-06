require("dotenv").config();
require("./server");

const startBot = require("./src/bot");
startBot(process.env);

console.log("✅ Bot started");