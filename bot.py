import asyncio
from telegram.ext import Application, CommandHandler
from config import BOT_TOKEN, BASE_URL
from models import UploadTask
from worker import task_queue, worker_loop

async def start(update, ctx):
    await update.message.reply_text(
        "/addlink <gdrive_link>\n/status <task_id>\n/last"
    )

async def addlink(update, ctx):
    if not ctx.args:
        await update.message.reply_text("Usage: /addlink <gdrive_link>")
        return

    link = ctx.args[0]
    task = UploadTask(
        user_id=update.effective_user.id,
        gdrive_link=link
    )
    await task_queue.put(task)
    await update.message.reply_text(f"🧾 Task queued: {task.task_id}")

async def on_startup(app: Application):
    # ✅ PTB-safe background task
    app.create_task(worker_loop())

def main():
    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .post_init(on_startup)  # 👈 correct hook
        .build()
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("addlink", addlink))

    app.run_webhook(
        listen="0.0.0.0",
        port=3000,
        url_path=BOT_TOKEN,
        webhook_url=f"{BASE_URL}/{BOT_TOKEN}",
    )

if __name__ == "__main__":
    main()