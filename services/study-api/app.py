"""Vercel FastAPI entry for the explicit synthetic acceptance preview."""
from pathlib import Path
import sys

_SERVICE_ROOT = Path(__file__).resolve().parent
_REPOSITORY_ROOT = _SERVICE_ROOT.parents[1]
sys.path[:0] = [str(_SERVICE_ROOT / '_core'),
                str(_REPOSITORY_ROOT / 'packages' / 'engine'), str(_SERVICE_ROOT)]

from study_api.remote import app_from_env

app = app_from_env()
