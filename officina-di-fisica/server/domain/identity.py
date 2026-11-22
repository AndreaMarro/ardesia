"""Principal, stable IDs and canonical release serialization."""
import hashlib
import json
import re
from .errors import require


def encode(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()


def need_user(user):
    require(user, "Accedi per salvare il tuo lavoro.", 401)


def need_author(user):
    need_user(user)
    require(user["role"] == "autore", "Operazione riservata all’autore.", 403)


def safe_key(v):
    return isinstance(v, str) and bool(
        re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_.-]{0,95}", v)
    )
