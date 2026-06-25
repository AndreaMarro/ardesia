"""Drift guard: imported engine files must match their canonical lessonos source.

Background (F0 finding P0-2)
----------------------------
``packages/engine/lessonos/`` in the ardesia monorepo is a byte-for-byte IMPORT
of the canonical ``lessonos/`` package living in the separate ``lessonos`` repo.
There is NO submodule, symlink, or subtree wiring it together — the copy is kept
in sync only by periodic manual commits ("import packages/engine from
lessonos@auto/main"). Because nothing enforces the equality, the two trees can
silently DRIFT: a fix landed in the canonical repo never reaches the monorepo
(or vice-versa) and no test notices.

This guard makes that drift LOUD. :func:`find_drift` hashes every file under the
imported engine root and compares it against its canonical counterpart in the
lessonos repo. Any file whose canonical counterpart EXISTS but DIFFERS is
reported. Files with no canonical counterpart (monorepo-only additions) are
ignored — the guard only asserts that what was imported still matches source.

Degradation
-----------
The integration test resolves the canonical repo via the ``LESSONOS_REPO`` env
var, defaulting to the sibling checkout ``<ardesia_root>/../lessonos``. When that
path is absent (e.g. CI without a sibling checkout) the integration test SKIPS
rather than fails — there is nothing to compare against. The unit test for
:func:`find_drift` has no repo dependency and always runs; it is the core proof
that the comparator catches divergence.
"""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

import pytest

# ── Path anchors ────────────────────────────────────────────────────────────
# This file:  <ardesia_root>/packages/engine/tests/test_engine_sync_guard.py
#   parents[1] -> packages/engine        (the imported engine package home)
#   parents[3] -> <ardesia_root>         (monorepo root)
_THIS = Path(__file__).resolve()
ENGINE_PKG_DIR = _THIS.parents[1]                     # packages/engine
ARDESIA_ENGINE_ROOT = ENGINE_PKG_DIR / "lessonos"     # packages/engine/lessonos
ARDESIA_ROOT = _THIS.parents[3]                       # monorepo root

# Re-sync instruction surfaced in the failure message.
RESYNC_HINT = (
    "Re-run the monorepo import of packages/engine from lessonos@auto/main "
    "(copy the canonical lessonos/ tree over packages/engine/lessonos/) so the "
    "imported engine matches its canonical source again."
)


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def find_drift(
    ardesia_engine_root: Path,
    lessonos_root: Path,
) -> list[tuple[str, str, str]]:
    """Return files that drifted between the imported engine and canonical source.

    For every file under ``ardesia_engine_root`` (the imported
    ``packages/engine/lessonos/`` tree), the canonical counterpart is expected at
    ``lessonos_root / <relpath>`` — where ``lessonos_root`` is the ``lessonos``
    PACKAGE directory inside the canonical repo (i.e. ``<repo>/lessonos``), so a
    relpath like ``asr/pipeline.py`` maps to ``<repo>/lessonos/asr/pipeline.py``.

    A file is reported as drifted when its canonical counterpart EXISTS and its
    content DIFFERS. Files with no canonical counterpart are skipped (monorepo
    may legitimately carry extra files). ``__pycache__`` and ``*.pyc`` are
    ignored.

    Returns a sorted list of ``(relpath, ardesia_sha256, lessonos_sha256)``.
    Empty list == in sync.
    """
    ardesia_engine_root = Path(ardesia_engine_root)
    lessonos_root = Path(lessonos_root)
    drift: list[tuple[str, str, str]] = []

    for ardesia_file in sorted(ardesia_engine_root.rglob("*")):
        if not ardesia_file.is_file():
            continue
        if "__pycache__" in ardesia_file.parts or ardesia_file.suffix == ".pyc":
            continue
        rel = ardesia_file.relative_to(ardesia_engine_root)
        canonical_file = lessonos_root / rel
        if not canonical_file.is_file():
            # No canonical counterpart -> not an imported-and-drifted file.
            continue
        a_sha = _sha256(ardesia_file)
        l_sha = _sha256(canonical_file)
        if a_sha != l_sha:
            drift.append((str(rel), a_sha, l_sha))

    return sorted(drift)


def _resolve_lessonos_root() -> Path | None:
    """Resolve the canonical lessonos PACKAGE dir, or None if unavailable.

    Honours ``LESSONOS_REPO`` (path to the canonical repo root) and falls back to
    the sibling checkout ``<ardesia_root>/../lessonos``. Returns the inner
    ``lessonos`` package directory (``<repo>/lessonos``) which mirrors the layout
    of ``packages/engine/lessonos``. Returns None when nothing usable exists.
    """
    env = os.environ.get("LESSONOS_REPO")
    repo_root = Path(env) if env else (ARDESIA_ROOT.parent / "lessonos")
    if not repo_root.exists():
        return None
    pkg = repo_root / "lessonos"
    if not pkg.is_dir():
        return None
    return pkg


# ── Unit test: the core-value proof (no repo dependency) ────────────────────


class TestFindDriftUnit:
    """Synthetic two-tree comparison — runs everywhere, proves both directions."""

    def _write(self, root: Path, rel: str, content: bytes) -> None:
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(content)

    def test_identical_trees_no_drift(self, tmp_path: Path) -> None:
        ardesia = tmp_path / "ardesia_engine"
        lessonos = tmp_path / "lessonos_pkg"
        for rel, content in [
            ("pipeline.py", b"print('hi')\n"),
            ("asr/pipeline.py", b"X = 1\n"),
            ("sub/deep/mod.py", b"def f():\n    return 42\n"),
        ]:
            self._write(ardesia, rel, content)
            self._write(lessonos, rel, content)

        assert find_drift(ardesia, lessonos) == []

    def test_modified_file_is_caught(self, tmp_path: Path) -> None:
        ardesia = tmp_path / "ardesia_engine"
        lessonos = tmp_path / "lessonos_pkg"
        same = b"shared = True\n"
        self._write(ardesia, "pipeline.py", same)
        self._write(lessonos, "pipeline.py", same)
        # asr/pipeline.py diverges between the two trees.
        self._write(ardesia, "asr/pipeline.py", b"VERSION = 'monorepo-edit'\n")
        self._write(lessonos, "asr/pipeline.py", b"VERSION = 'canonical'\n")

        drift = find_drift(ardesia, lessonos)

        assert len(drift) == 1, drift
        rel, a_sha, l_sha = drift[0]
        assert rel == "asr/pipeline.py"
        assert a_sha != l_sha
        assert a_sha == hashlib.sha256(b"VERSION = 'monorepo-edit'\n").hexdigest()
        assert l_sha == hashlib.sha256(b"VERSION = 'canonical'\n").hexdigest()

    def test_monorepo_only_file_is_ignored(self, tmp_path: Path) -> None:
        ardesia = tmp_path / "ardesia_engine"
        lessonos = tmp_path / "lessonos_pkg"
        self._write(ardesia, "pipeline.py", b"x = 1\n")
        self._write(lessonos, "pipeline.py", b"x = 1\n")
        # Present only in the monorepo -> no canonical counterpart -> ignored.
        self._write(ardesia, "monorepo_only.py", b"local = True\n")

        assert find_drift(ardesia, lessonos) == []

    def test_pyc_and_pycache_ignored(self, tmp_path: Path) -> None:
        ardesia = tmp_path / "ardesia_engine"
        lessonos = tmp_path / "lessonos_pkg"
        self._write(ardesia, "pipeline.py", b"x = 1\n")
        self._write(lessonos, "pipeline.py", b"x = 1\n")
        # Divergent compiled artifacts must NOT be reported as drift.
        self._write(ardesia, "__pycache__/pipeline.cpython-312.pyc", b"AAAA")
        self._write(lessonos, "__pycache__/pipeline.cpython-312.pyc", b"BBBB")

        assert find_drift(ardesia, lessonos) == []


# ── Integration test: real imported engine vs real canonical repo ───────────
#
# Reality (2026-06-25): the last monorepo import landed lessonos@3049c62 (commit
# c4327c31, 2026-06-18) while canonical lessonos has since moved on (schema v10
# -> v12, FTS index, libSQL backend, ...). The full imported engine tree is
# therefore CURRENTLY drifted in 22 files — exactly the silent staleness this
# guard exists to surface. We split the integration check so the guard is both
# HARD where the import contract is tight, and SURFACING (not blocking) on the
# pre-existing backlog:
#
#   * CONTRACT pairs (pipeline.py, asr/pipeline.py) are kept byte-identical by
#     the import process (F0) — if THEY drift, fail hard immediately.
#   * The WHOLE-TREE check is xfail(strict=False): it documents the known
#     divergence count without blocking CI on pre-existing debt, and FLIPS to a
#     loud XPASS the moment a fresh re-import brings the tree fully back in sync
#     (prompting removal of the xfail). New drift in *contract* files is never
#     masked by this.

# Files the import process is expected to keep byte-identical at all times.
CONTRACT_FILES = ("pipeline.py", "asr/pipeline.py")


def _format_drift(drift: list[tuple[str, str, str]]) -> str:
    return "\n".join(
        f"  - {rel}\n"
        f"      packages/engine/lessonos sha256: {a_sha}\n"
        f"      canonical lessonos sha256:       {l_sha}"
        for rel, a_sha, l_sha in drift
    )


class TestEngineImportInSync:
    """The real ``packages/engine/lessonos`` vs the canonical lessonos package."""

    def test_contract_files_match_canonical(self) -> None:
        """Hard gate: the tightly-imported contract files must never drift."""
        lessonos_root = _resolve_lessonos_root()
        if lessonos_root is None:
            pytest.skip(
                "Canonical lessonos repo not found "
                "(set LESSONOS_REPO or provide a sibling '../lessonos' checkout) "
                "— skipping drift integration check."
            )

        drift = find_drift(ARDESIA_ENGINE_ROOT, lessonos_root)
        contract_drift = [d for d in drift if d[0] in CONTRACT_FILES]

        if contract_drift:
            pytest.fail(
                "Contract engine file(s) DRIFTED from canonical lessonos.\n"
                f"{_format_drift(contract_drift)}\n\n"
                f"FIX: {RESYNC_HINT}"
            )

    @pytest.mark.xfail(
        reason=(
            "Imported engine tree is behind canonical lessonos (last import "
            "lessonos@3049c62 / 2026-06-18). xfail(strict=False) so the backlog "
            "is surfaced without blocking; flips to XPASS once a re-import fully "
            "re-syncs the tree — then delete this xfail."
        ),
        strict=False,
    )
    def test_whole_engine_tree_matches_canonical(self) -> None:
        """Surfacing check: the ENTIRE imported tree should match canonical."""
        lessonos_root = _resolve_lessonos_root()
        if lessonos_root is None:
            pytest.skip(
                "Canonical lessonos repo not found "
                "(set LESSONOS_REPO or provide a sibling '../lessonos' checkout) "
                "— skipping drift integration check."
            )

        drift = find_drift(ARDESIA_ENGINE_ROOT, lessonos_root)

        assert not drift, (
            f"Imported engine has DRIFTED from canonical lessonos in "
            f"{len(drift)} file(s):\n{_format_drift(drift)}\n\n"
            f"FIX: {RESYNC_HINT}"
        )
