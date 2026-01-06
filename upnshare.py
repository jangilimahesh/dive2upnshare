import aiohttp
import json
from config import UPNSHARE_API_KEY

ADVANCE_UPLOAD_URL = "https://upnshare.com/api/v1/video/advance-upload"
VIDEO_STATUS_URL = "https://upnshare.com/api/v1/video"

class UpnshareError(Exception):
    pass

async def advance_upload(file_url: str, name: str):
    headers = {
        "api-token": UPNSHARE_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "url": file_url,
        "name": name
    }

    async with aiohttp.ClientSession() as s:
        async with s.post(ADVANCE_UPLOAD_URL, headers=headers, json=payload) as r:
            raw = await r.text()
            if r.status != 200:
                raise UpnshareError(raw)

            data = json.loads(raw)
            if "id" not in data:
                raise UpnshareError(data)

            return data["id"]

async def get_video(video_id: str):
    headers = {"api-token": UPNSHARE_API_KEY}
    async with aiohttp.ClientSession() as s:
        async with s.get(f"{VIDEO_STATUS_URL}/{video_id}", headers=headers) as r:
            return await r.json()