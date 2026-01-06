const TelegramBot = require("node-telegram-bot-api");
const queue = require("./queue");
const { listFolder } = require("./driveFolder");
const { remoteUpload } = require("./upnshare");
const db = require("./database");
const log = require("./logger");
const { isAdmin } = require("./auth");

module.exports = async function startBot(cfg) {
  const admins = (cfg.ADMIN_IDS || "").split(",");
  await db.init(cfg.MONGODB_URI);

  const bot = new TelegramBot(cfg.BOT_TOKEN, { polling: true });

  bot.onText(/\/upload (.+)/, async (msg, match) => {
    if (!isAdmin(msg, admins)) return;

    const chatId = msg.chat.id;
    const input = match[1];

    const files = input.includes("/folders/")
      ? await listFolder(input)
      : [{
          id: input.match(/[-\w]{25,}/)?.[0],
          link: `https://drive.google.com/uc?id=${input.match(/[-\w]{25,}/)[0]}&export=download`
        }];

    for (const f of files) {
      if (await db.exists(f.id)) continue;

      queue.add(async () => {
        let m = await bot.sendMessage(chatId, "⬆️ Upload queued");

        const url = await remoteUpload(
          f.link,
          cfg.UPNSHARE_API_KEY,
          async (p, status) => {
            await bot.editMessageText(
              `⬆️ ${status || "processing"} ${p ? `(${p}%)` : ""}`,
              { chat_id: chatId, message_id: m.message_id }
            );
          }
        );

        await db.save({ fileId: f.id, status: "done", url });

        await log(
          cfg.BOT_TOKEN,
          cfg.LOG_CHANNEL_ID,
          `✅ Uploaded\nDrive: ${f.link}\nUpnshare: ${url}`
        );

        bot.editMessageText(`✅ Done\n${url}`, {
          chat_id: chatId,
          message_id: m.message_id
        });
      });
    }
  });

  bot.onText(/\/stats/, async msg => {
    if (!isAdmin(msg, admins)) return;
    bot.sendMessage(msg.chat.id, `📊 Uploaded: ${await db.count()}`);
  });

  bot.onText(/\/status/, msg => {
    if (!isAdmin(msg, admins)) return;
    bot.sendMessage(msg.chat.id, "🟢 Bot alive");
  });
};