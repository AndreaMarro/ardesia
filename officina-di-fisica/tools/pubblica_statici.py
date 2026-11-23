"""Publish the public frontend only. Figures and downloads pass through server.web."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
shutil.copytree(root / "static", root / "public", dirs_exist_ok=True,
                ignore=lambda directory, names: {"figures"} if Path(directory) == root / "static" else set())
