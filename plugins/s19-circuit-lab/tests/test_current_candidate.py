"""The HTTP/scientific gate must never repair production sources for itself."""
from importlib import import_module
from pathlib import Path
import runpy
import sys
from types import SimpleNamespace

import pytest

from current_candidate import ROOT, SOURCE_MODULES


def test_core_and_factory_are_loaded_from_the_actual_checkout():
    for name, relative in SOURCE_MODULES.items():
        assert Path(import_module(name).__file__).resolve() == (ROOT / relative).resolve()


@pytest.mark.parametrize("name", SOURCE_MODULES)
def test_a_temporary_patched_module_cannot_satisfy_the_actual_source_gate(name, monkeypatch, tmp_path):
    replacement = tmp_path / "patched.py"
    replacement.write_text("# unrelated candidate copy\n")
    monkeypatch.setitem(sys.modules, name, SimpleNamespace(__file__=str(replacement)))
    with pytest.raises(RuntimeError, match="actual checkout module"):
        runpy.run_path(str(ROOT / "plugins/s19-circuit-lab/scripts/current_candidate.py"))
