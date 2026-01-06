import asyncio
from models import UploadTask, FileTask
from gdrive import resolve_gdrive
from upnshare import advance_upload, get_video
from utils import log_channel, progress_bar

task_queue = asyncio.Queue()
paused = False

async def worker_loop():
    while True:
        task: UploadTask = await task_queue.get()
        await log_channel(f"▶️ Task {task.task_id} started")

        files = await resolve_gdrive(task.gdrive_link)
        task.files = [FileTask(f["name"], f["url"]) for f in files]

        total = len(task.files)

        for i, f in enumerate(task.files, 1):
            f.status = "uploading"
            await log_channel(progress_bar(i - 1, total))

            try:
                f.video_id = await advance_upload(f.source_url, f.name)
                f.status = "processing"

                # Poll status
                while True:
                    data = await get_video(f.video_id)
                    state = data.get("status")

                    if state == "completed":
                        f.upnshare_url = data["url"]
                        f.status = "done"
                        break

                    if state == "failed":
                        f.status = "failed"
                        break

                    await asyncio.sleep(10)

            except Exception as e:
                f.status = "failed"
                await log_channel(f"❌ {f.name}: {e}")

            await log_channel(progress_bar(i, total))

        await log_channel(f"✅ Task {task.task_id} completed")
        task_queue.task_done()

async def worker_loop():
    try:
        while True:
            task = await task_queue.get()
            ...
            task_queue.task_done()
    except asyncio.CancelledError:
        # Render shutdown / redeploy safety
        return