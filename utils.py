from telegram import Bot
from config import BOT_TOKEN, LOG_CHANNEL_ID

bot = Bot(BOT_TOKEN)

async def log_channel(text: str):
    await bot.send_message(LOG_CHANNEL_ID, text)

def progress_bar(done, total):
    pct = int(done / total * 100)
    bars = int(pct / 10)
    return f"[{'▓'*bars}{'░'*(10-bars)}] {pct}% ({done}/{total})"