"""Tests for ASR segment coalescing (T6R anti-coriandoli, adapter.py).

Aggressive VAD fragments real lectures into tiny segments (seconda: avg 11
chars). A verbatim excerpt can never exceed its segment, so citation quality is
capped at the adapter. ``min_chars`` merges consecutive speech segments into
sentence-sized units; ``min_chars=0`` (default) is byte-identical to legacy.
"""

from __future__ import annotations

import json

import pytest

from lessonos.asr.adapter import asr_jsonl_to_segments

L = "lc"


def _jsonl(tmp_path, rows):
    p = tmp_path / "asr.jsonl"
    p.write_text("\n".join(json.dumps(r) for r in rows), encoding="utf-8")
    return str(p)


def _row(start, end, text):
    return {"start": start, "end": end, "text": text}


class TestLegacyPathUnchanged:
    def test_min_chars_zero_one_to_one(self, tmp_path) -> None:
        p = _jsonl(tmp_path, [
            _row(0.0, 2.0, "uno"), _row(2.0, 4.0, "due"), _row(4.0, 6.0, "tre"),
        ])
        segs = asr_jsonl_to_segments(p, L)  # default min_chars=0
        assert [s.text for s in segs] == ["uno", "due", "tre"]
        assert [s.seg_id for s in segs] == [f"{L}#s1", f"{L}#s2", f"{L}#s3"]


class TestCoalescing:
    def test_merges_until_sentence_end_and_min_chars(self, tmp_path) -> None:
        p = _jsonl(tmp_path, [
            _row(0.0, 2.0, "Il supporto per definizione"),
            _row(2.0, 4.0, "è la chiusura degli istanti."),
            _row(4.0, 6.0, "Nuovo argomento adesso, la durata di un segnale."),
        ])
        segs = asr_jsonl_to_segments(p, L, min_chars=40)
        # first two merge (sentence closes after >=40 chars), third stands alone
        assert len(segs) == 2
        assert segs[0].text == (
            "Il supporto per definizione è la chiusura degli istanti."
        )
        assert segs[0].seg_id == f"{L}#s1"
        assert (segs[0].start, segs[0].end) == (0, 4)
        assert segs[1].text == "Nuovo argomento adesso, la durata di un segnale."

    def test_short_unterminated_pieces_keep_merging(self, tmp_path) -> None:
        # no sentence end → merges continue until hard cap (3*min_chars)
        rows = [_row(i * 1.0, i * 1.0 + 1.0, f"pezzo{i:02d}") for i in range(20)]
        p = _jsonl(tmp_path, rows)
        segs = asr_jsonl_to_segments(p, L, min_chars=30)
        assert len(segs) < 20  # actually coalesced
        for s in segs[:-1]:
            assert len(s.text) >= 30  # at least min_chars per flushed unit

    def test_gap_flushes_early(self, tmp_path) -> None:
        p = _jsonl(tmp_path, [
            _row(0.0, 1.0, "prima frase senza punto"),
            _row(10.0, 11.0, "dopo lunga pausa."),  # gap 9s > 5s
        ])
        segs = asr_jsonl_to_segments(p, L, min_chars=100)
        assert len(segs) == 2  # gap split despite min_chars not reached
        assert segs[0].text == "prima frase senza punto"
        assert segs[1].start == 10

    def test_seg_ids_1indexed_on_output(self, tmp_path) -> None:
        p = _jsonl(tmp_path, [
            _row(0.0, 1.0, "a."), _row(1.0, 2.0, "b."), _row(2.0, 3.0, "c."),
        ])
        segs = asr_jsonl_to_segments(p, L, min_chars=1)
        assert segs[0].seg_id == f"{L}#s1"
        assert all(
            s.seg_id == f"{L}#s{i}" for i, s in enumerate(segs, start=1)
        )

    def test_max_segments_applies_to_output(self, tmp_path) -> None:
        rows = [_row(i, i + 1, f"frase {i}.") for i in range(10)]
        p = _jsonl(tmp_path, rows)
        segs = asr_jsonl_to_segments(p, L, min_chars=1, max_segments=4)
        assert len(segs) == 4

    def test_empty_speech_skipped(self, tmp_path) -> None:
        p = _jsonl(tmp_path, [
            _row(0.0, 1.0, "   "), _row(1.0, 2.0, "vera frase."),
        ])
        segs = asr_jsonl_to_segments(p, L, min_chars=5)
        assert [s.text for s in segs] == ["vera frase."]

    def test_whisper_loop_hallucination_collapsed(self, tmp_path) -> None:
        """Consecutive identical texts (whisper repetition loop on noise —
        'per un attimino' x17 measured on seconda) collapse to ONE occurrence
        instead of concatenating into a garbage mega-segment."""
        rows = [_row(i * 1.0, i * 1.0 + 1.0, "per un attimino") for i in range(17)]
        rows.append(_row(17.0, 19.0, "poi la lezione riprende davvero."))
        p = _jsonl(tmp_path, rows)
        segs = asr_jsonl_to_segments(p, L, min_chars=30)
        joined = " | ".join(s.text for s in segs)
        assert joined.count("per un attimino") == 1
        assert "poi la lezione riprende davvero." in joined
