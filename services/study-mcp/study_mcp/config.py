"""Operator configuration, never derived from tool arguments or clientInfo."""
from dataclasses import dataclass, field
import os
import re
from urllib.parse import urlsplit


@dataclass(frozen=True)
class Settings:
    origin: str
    session: str = field(repr=False)

    def __post_init__(self):
        try:
            parsed = urlsplit(self.origin)
            valid = (parsed.scheme == 'http' and parsed.hostname in ('127.0.0.1', 'localhost')
                     and parsed.port is not None and 1 <= parsed.port <= 65535
                     and not parsed.username and not parsed.password
                     and parsed.path in ('', '/') and not parsed.query and not parsed.fragment
                     and not re.search(r'[\s\\]', self.origin))
        except (ValueError, TypeError):
            valid = False
        if not valid:
            raise ValueError('invalid_trusted_origin')
        if not isinstance(self.session, str) or not re.fullmatch(r'[A-Za-z0-9._~-]{1,8192}', self.session):
            raise ValueError('invalid_private_session')
        # localhost is pinned to the loopback literal, independent of DNS/proxies.
        object.__setattr__(self, 'origin', f'http://127.0.0.1:{parsed.port}')

    @classmethod
    def from_environment(cls):
        return cls(os.environ.get('ARDESIA_STUDY_ORIGIN', 'http://127.0.0.1:5323'),
                   os.environ.get('ARDESIA_STUDY_SESSION', ''))
