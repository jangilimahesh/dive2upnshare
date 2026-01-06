require("dotenv").config();
const startBot = require("./src/bot");
require("./src/worker");

startBot(process.env);
console.log("✅ Bot started");