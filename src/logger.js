const axios = require("axios");

module.exports = async function log(token, chatId, text) {
  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  });
};