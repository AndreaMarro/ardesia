"""Compose exact integration patch; shared sources remain untouched."""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import compose_candidate

from s19_circuit_lab.engine import assert_engine

assert_engine()
