"""Vercel entry point for the same authorized routes used by the desktop launcher."""
import ipaddress
import os
from pathlib import Path
import tempfile

os.environ.update(ASTRA_HOSTED="1", ASTRA_HTTPS="1", ASTRA_DATA=str(Path(tempfile.gettempdir()) / "officina"))
from server.web import Handler


class handler(Handler):
    def client_ip(self):
        # Vercel sets this header at ingress independently of a caller's X-Forwarded-For.
        forwarded = self.headers.get("X-Vercel-Forwarded-For", "").split(",")[0].strip()
        try:
            return str(ipaddress.ip_address(forwarded))
        except ValueError:
            return super().client_ip()
