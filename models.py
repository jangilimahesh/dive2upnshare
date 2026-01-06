from dataclasses import dataclass, field
import uuid, time
from typing import List, Optional

@dataclass
class FileTask:
    name: str
    source_url: str
    video_id: Optional[str] = None
    upnshare_url: Optional[str] = None
    status: str = "pending"

@dataclass
class UploadTask:
    task_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    user_id: int = 0
    gdrive_link: str = ""
    files: List[FileTask] = field(default_factory=list)
    status: str = "queued"
    created_at: float = field(default_factory=time.time)