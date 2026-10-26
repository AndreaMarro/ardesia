"""Bind scientific and HTTP checks to the actual integrated checkout.

The historical owner patch remains an acquisition artifact. Once integrated,
testing a patched temporary copy can hide a missing mount in the real factory.
This module performs no source transformation or application monkeypatching.
"""
from importlib import import_module
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[3]
sys.path[:0] = [
    str(ROOT / "packages/engine"),
    str(ROOT / "services/study-api"),
    str(ROOT / "plugins/s19-circuit-lab"),
]

SOURCE_MODULES = {
    "lessonos.study.catalog": "packages/engine/lessonos/study/catalog.py",
    "lessonos.study.context": "packages/engine/lessonos/study/context.py",
    "study_api.app": "services/study-api/study_api/app.py",
}
for name, relative in SOURCE_MODULES.items():
    module = import_module(name)
    if Path(module.__file__).resolve() != (ROOT / relative).resolve():
        raise RuntimeError("S19 checks require the actual checkout module: " + name)
