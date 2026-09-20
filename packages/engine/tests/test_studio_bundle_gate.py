"""Cross-boundary gate: Studio-produced bundle bytes -> Engine ingest.

The text fixtures under ``fixtures/studio_lesson_a/`` are the exact entry
payloads produced by production ``exportLesson()`` (Studio unit lane,
manifest + sha256 intact). This test rebuilds the container in-memory and
proves the Engine accepts the real producer output: manifest identity,
entry integrity, journal segments, and the identity-scoped digest with
open/corrected errors and EvidenceRef provenance.

No binaries are committed (text entries only; the container carries no
semantics). No network, no LLM, deterministic.
"""

from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

from lessonos.ingest.bundle import journal_to_segments, read_bundle
from lessonos.ingest.lessonos_snapshot import project_lessonos_study_digest

FIX = Path(__file__).parent / "fixtures" / "studio_lesson_a"
LESSON = "studio-proof-a"


def _rebuild_bundle() -> bytes:
    """Reassemble the container from Studio's entry payloads.

    Manifest sha256 covers entry payloads (not container metadata), so a
    rebuilt container validates identically to the Studio-produced bytes.
    """
    manifest = json.loads((FIX / "manifest.json").read_text(encoding="utf-8"))
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("manifest.json", (FIX / "manifest.json").read_bytes())
        for entry in manifest["files"]:
            name = entry["path"]
            zf.writestr(name, (FIX / name.replace("/", "__")).read_bytes())
    return buf.getvalue()


def _write_tmp(tmp_path: Path) -> str:
    p = tmp_path / "studio-a.lesson"
    p.write_bytes(_rebuild_bundle())
    return str(p)


class TestStudioBundleGate:
    def test_manifest_identity_and_entry_integrity(self, tmp_path: Path) -> None:
        contents = read_bundle(_write_tmp(tmp_path))
        assert contents.manifest is not None
        assert contents.manifest["lessonId"] == LESSON
        assert contents.manifest["bundleVersion"] == 1
        assert contents.lessonos_events_jsonl is not None

    def test_journal_segments_verbatim(self, tmp_path: Path) -> None:
        contents = read_bundle(_write_tmp(tmp_path))
        segments = journal_to_segments(contents.events_jsonl, LESSON)
        texts = [s.text for s in segments]
        assert "La corrente \u00e8 uguale in serie." in texts
        assert "Legge di Ohm: $V = R I$." in texts
        assert all(s.seg_id.startswith(f"{LESSON}#s") for s in segments)

    def test_digest_open_corrected_and_provenance(self, tmp_path: Path) -> None:
        contents = read_bundle(_write_tmp(tmp_path))
        assert contents.lessonos_events_jsonl is not None
        digest = project_lessonos_study_digest(contents.lessonos_events_jsonl, LESSON)
        assert digest.lesson_id == LESSON
        by_id = {e.id: e for e in digest.errors}
        assert by_id["err:open"].corrected is False
        assert by_id["err:shut"].corrected is True
        assert "manual:vol1:p30" in str(digest.concepts) + str(digest.errors)
        assert any(c.id == "ck:serie" for c in digest.concepts)

    def test_no_foreign_lesson_rows(self, tmp_path: Path) -> None:
        contents = read_bundle(_write_tmp(tmp_path))
        assert contents.lessonos_events_jsonl is not None
        for line in contents.lessonos_events_jsonl.splitlines():
            if line.strip():
                assert json.loads(line)["lessonId"] == LESSON
        assert "studio-proof-b" not in contents.events_jsonl
