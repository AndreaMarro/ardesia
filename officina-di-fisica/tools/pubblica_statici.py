"""Publish the public frontend only. Figures and downloads pass through server.web."""
from pathlib import Path
import shutil
import sys

root = Path(__file__).resolve().parents[1]
shutil.copytree(root / "static", root / "public", dirs_exist_ok=True,
                ignore=lambda directory, names: {"figures"} if Path(directory) == root / "static" else set())


# Preserve the signed Physics entry at /index.html and mount the Cric shell separately.
sys.path.insert(0, str(root))
from multidiscipline.frontend import PUBLIC_ASSETS, public_asset

for name in PUBLIC_ASSETS:
    target = root / "public" / "multidiscipline" / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(public_asset(name))
