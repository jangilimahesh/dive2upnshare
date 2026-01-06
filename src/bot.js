const TelegramBot = require("node-telegram-bot-api");
const queue = require("./queue");
const { downloadFile } = require("./drive");
const { listFolder } = require("./driveFolder");
const { uploadToUpnshare } = require("./uploader");
const { bar } = require("./progress");
const state = require("./state");
const log = require("./logger");
const fs = require("fs");

module.exports = function startBot(cfg) {
  const bot = new TelegramBot(cfg.BOT_TOKEN, { polling: true });

  bot.onText(/\/upload (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];

    const files = link.includes("/folders/")
      ? await listFolder(link)
      : [{ id: link.match(/[-\w]{25,}/)[0], link }];

    for (const f of files) {
      if (state.exists(f.id)) continue;

      queue.add(async () => {
        let m = await bot.sendMessage(chatId, "⬇️ Downloading...");
        const file = await downloadFile(f.link, "temp", p =>
          bot.editMessageText(`⬇️ ${bar(p)} ${p}%`, {
            chat_id: chatId,
            message_id: m.message_id
          })
        );

        m = await bot.sendMessage(chatId, "⬆️ Uploading...");
        const url = await uploadToUpnshare(
          file,
          cfg.UPNSHARE_API_KEY,
          p => bot.editMessageText(`⬆️ ${bar(p)} ${p}%`, {
            chat_id: chatId,
            message_id: m.message_id
          })
        );

        state.save({ fileId: f.id, status: "uploaded", url });

        await log(cfg.BOT_TOKEN, cfg.LOG_CHANNEL_ID,
          `✅ Uploaded\nOriginal: ${f.link}\nUpnshare: ${url}`
        );

        fs.unlinkSync(file);
        bot.sendMessage(chatId, `✅ Done\n${url}`);
      });
    }
  });

  bot.onText(/\/pause/, m => {
    queue.paused = true;
    bot.sendMessage(m.chat.id, "⏸ Queue paused");
  });

  bot.onText(/\/resume/, m => {
    queue.paused = false;
    queue.run();
    bot.sendMessage(m.chat.id, "▶️ Queue resumed");
  });

  bot.onText(/\/queue/, m =>
    bot.sendMessage(m.chat.id, `🧾 Pending: ${queue.tasks.length}`)
  );

  bot.onText(/\/stats/, m => {
    const s = state.stats();
    bot.sendMessage(
      m.chat.id,
      `📊 Stats\nUploaded: ${s.uploaded}\nTracked: ${s.total}`
    );
  });

  bot.onText(/\/status/, m =>
    bot.sendMessage(m.chat.id, "🟢 Bot is alive")
  );
};