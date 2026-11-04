"""Vercel ASGI entry point and public route handling."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.main import app as fastapi_app


class PublicEntry:
    """Send first-time visitors to authentication; expose the home page at /home."""

    def __init__(self, application):
        self.application = application

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "/")
            if path == "/":
                body = b""
                await send({
                    "type": "http.response.start",
                    "status": 303,
                    "headers": [(b"location", b"/login"), (b"content-length", b"0")],
                })
                await send({"type": "http.response.body", "body": body})
                return
            if path == "/home":
                scope = dict(scope)
                scope["path"] = "/"
                scope["raw_path"] = b"/"
        await self.application(scope, receive, send)


app = PublicEntry(fastapi_app)
