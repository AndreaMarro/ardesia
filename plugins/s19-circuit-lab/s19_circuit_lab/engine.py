"""Verifica la dipendenza installata prima di attribuirle il pin S19."""

from functools import lru_cache
from importlib.metadata import distribution
from pathlib import Path
import json
import subprocess
from urllib.parse import unquote, urlparse
from .frozen_imports import install_frozen_imports

SOURCE_SHA = "b35a8b5da0616f00a7764397bda0e6b95aca3c95"


def validate_checkout(root: Path, expected=SOURCE_SHA):
    try:
        sha = subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"], text=True, timeout=10
        ).strip()
        dirty = subprocess.check_output(
            [
                "git",
                "-C",
                str(root),
                "status",
                "--porcelain",
                "--",
                "src/kirchhoff",
                "pyproject.toml",
                "hatch_build.py",
            ],
            text=True,
            timeout=10,
        ).strip()
    except (OSError, subprocess.SubprocessError) as exc:
        raise ValueError(
            "Checkout Kirchhoff non disponibile: conserva gli input e ripristina la dipendenza fissata."
        ) from exc
    if sha != expected or dirty:
        raise ValueError(
            "La dipendenza Kirchhoff deve essere pulita alla revisione S19 fissata."
        )


@lru_cache(maxsize=1)
def assert_engine():
    meta = distribution("kirchhoff")
    source = json.loads(meta.read_text("direct_url.json") or "{}")
    if (
        meta.version != "0.1.0"
        or source.get("dir_info", {}).get("editable") is not True
    ):
        raise ValueError(
            "Installa Kirchhoff con lo script S19 e il relativo pin verificato."
        )
    parsed = urlparse(source.get("url", ""))
    if parsed.scheme != "file":
        raise ValueError("Serve il checkout sorgente S19 installato e fissato.")
    root = Path(unquote(parsed.path)).resolve()
    validate_checkout(root)
    try:
        revision = install_frozen_imports(root, SOURCE_SHA)
        import kirchhoff
        from kirchhoff.runtime_identity import SNAPSHOT
    except (OSError, ImportError, subprocess.SubprocessError) as exc:
        raise ValueError(
            "Caricamento del motore fissato non disponibile: gli input restano nel Core."
        ) from exc

    if SNAPSHOT.package_revision != revision:
        raise ValueError(
            "Lo snapshot sul disco non coincide con i byte Python caricati e fissati."
        )
