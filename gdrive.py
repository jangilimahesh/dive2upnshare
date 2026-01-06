import re
import aiohttp

FILE_RE = re.compile(r"/d/([a-zA-Z0-9_-]+)")
FOLDER_RE = re.compile(r"folders/([a-zA-Z0-9_-]+)")

async def resolve_gdrive(link: str):
    if FOLDER_RE.search(link):
        return await list_folder(FOLDER_RE.search(link).group(1))

    if FILE_RE.search(link):
        fid = FILE_RE.search(link).group(1)
        return [{
            "name": fid,
            "url": f"https://drive.google.com/uc?id={fid}&export=download"
        }]

    raise ValueError("Invalid Google Drive link")

async def list_folder(folder_id: str):
    url = f"https://drive.google.com/embeddedfolderview?id={folder_id}#list"
    async with aiohttp.ClientSession() as s:
        html = await (await s.get(url)).text()

    files = []
    for fid in re.findall(r"/file/d/([^/]+)", html):
        files.append({
            "name": fid,
            "url": f"https://drive.google.com/uc?id={fid}&export=download"
        })
    return files