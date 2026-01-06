import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
UPNSHARE_API_KEY = os.getenv("UPNSHARE_API_KEY")
LOG_CHANNEL_ID = int(os.getenv("LOG_CHANNEL_ID"))

ADMIN_IDS = {int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x}

MONGODB_URI = os.getenv("MONGODB_URI")
BASE_URL = os.getenv("BASE_URL")