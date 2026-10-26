"""Controprove sul package installato; solo cache temporanee, sorgenti intatti."""

import importlib.util
from importlib import _bootstrap_external
from importlib.metadata import distribution
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import unquote, urlparse


def test_installed_engine_ignores_stale_timestamp_bytecode_even_with_B():
    root = Path(
        unquote(
            urlparse(
                json.loads(distribution("kirchhoff").read_text("direct_url.json"))[
                    "url"
                ]
            ).path
        )
    )
    source = root / "src/kirchhoff/config.py"
    content = source.read_bytes()
    stat = source.stat()
    cache = Path(importlib.util.cache_from_source(str(source)))
    previous = cache.read_bytes() if cache.exists() else None
    cache.parent.mkdir(parents=True, exist_ok=True)
    malicious = compile("S19_STALE_BYTECODE = True\n", str(source), "exec")
    cache.write_bytes(
        _bootstrap_external._code_to_timestamp_pyc(
            malicious, int(stat.st_mtime), stat.st_size
        )
    )
    try:
        baseline = "import json; import kirchhoff.config as c; from kirchhoff.runtime_identity import assert_runtime_current; assert_runtime_current(); print(json.dumps({'stale':getattr(c,'S19_STALE_BYTECODE',False),'snapshot_accepts':True}))"
        seen = json.loads(
            subprocess.check_output([sys.executable, "-B", "-c", baseline], text=True)
        )
        assert seen == {"stale": True, "snapshot_accepts": True}
        controlled = """import json
from s19_circuit_lab.engine import assert_engine
assert_engine()
import kirchhoff.config as c
from s19_circuit_lab.adapter import DEFAULT_DOCUMENT,solve
stale=getattr(c,'S19_STALE_BYTECODE',False)
answer=None if stale else solve(DEFAULT_DOCUMENT)['lesson']['answer']['exact']
print(json.dumps({'stale':stale,'answer':answer}))
"""
        protected = json.loads(
            subprocess.check_output([sys.executable, "-B", "-c", controlled], text=True)
        )
        assert protected == {"stale": False, "answer": "8"}
        assert source.read_bytes() == content
    finally:
        if previous is None:
            cache.unlink(missing_ok=True)
        else:
            cache.write_bytes(previous)


def test_existing_uncontrolled_import_is_rejected_in_fresh_process():
    code = """import kirchhoff
from s19_circuit_lab.engine import assert_engine
try:
    assert_engine()
except ValueError:
    print('rejected')
else:
    print('unsafe')
"""
    assert (
        subprocess.check_output([sys.executable, "-B", "-c", code], text=True).strip()
        == "rejected"
    )
