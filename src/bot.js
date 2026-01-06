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

  bot.onText(/\/upload (.+)/, async (msg, m) => {
    const chat = msg.chat.id;
    const link = m[1];

    const files = link.includes("/folders/")
      ? await listFolder(link)
      : [{ id: link, link }];

    for (const f of files) {
      if (state.exists(f.id)) continue;

      queue.add(async () => {
        let mid = await bot.sendMessage(chat, "⬇️ Downloading");
        const file = await downloadFile(f.link, "temp", p =>
          bot.editMessageText(`⬇️ ${bar(p)} ${p}%`, {
            chat_id: chat,
            message_id: mid.message_id
          })
        );

        mid = await bot.sendMessage(chat, "⬆️ Uploading");
        const url = await uploadToUpnshare(
          file,
          cfg.UPNSHARE_API_KEY,
          p => bot.editMessageText(`⬆️ ${bar(p)} ${p}%`, {
            chat_id: chat,
            message_id: mid.message_id
          })
        );

        state.save({ fileId: f.id, status: "uploaded", url });
        await log(cfg.BOT_TOKEN, cfg.LOG_CHANNEL_ID,
          `✅ Uploaded\nOriginal: ${f.link}\nUpnshare: ${url}`
        );

        fs.unlinkSync(file);
        bot.sendMessage(chat, `✅ Done\n${url}`);
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

  bot.onText(/\/stats/, m => {
    const s = state.stats();
    bot.sendMessage(m.chat.id,
      `📊 Stats\nUploaded: ${s.uploaded}\nTotal tracked: ${s.total}`
    );
  });

  bot.onText(/\/queue/, m =>
    bot.sendMessage(m.chat.id, `🧾 Pending: ${queue.tasks.length}`)
  );
};