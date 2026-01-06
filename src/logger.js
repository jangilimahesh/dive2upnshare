const axios = require("axios");

module.exports = async function log(botToken, channelId, text) {
  await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: channelId,
    text,
    disable_web_page_preview: true
  });
};