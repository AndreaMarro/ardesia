"""Tests for lessonos/ingest/chunker.py — raw text → Segment chunking (M7 P0).

Chunking is rule-based (ZERO-LLM). Tests verify:
- Paragraph, sentence, and window-based splitting for raw text
- VTT/SRT timed text parsing
- Edge cases: empty input, single word, very long runs, HTML in VTT
"""
import pytest

from lessonos.ingest.chunker import (
    ChunkResult,
    ChunkResultItem,
    _chunk_paragraph,
    _hard_split,
    _split_paragraphs,
    _split_sentences,
    chunk_raw_text,
    chunk_srt,
    chunk_vtt,
)


# ---------------------------------------------------------------------------
# Unit: _split_paragraphs
# ---------------------------------------------------------------------------


class TestSplitParagraphs:
    def test_single_paragraph(self):
        text = "Questa è una singola riga di testo continuo."
        assert _split_paragraphs(text) == [text]

    def test_double_newline_separator(self):
        text = "Primo paragrafo.\n\nSecondo paragrafo con più contenuto."
        result = _split_paragraphs(text)
        assert result == [
            "Primo paragrafo.",
            "Secondo paragrafo con più contenuto.",
        ]

    def test_multiple_blanks(self):
        text = "A.\n\n\n\nB."
        result = _split_paragraphs(text)
        assert result == ["A.", "B."]

    def test_empty_returns_empty(self):
        assert _split_paragraphs("") == []
        assert _split_paragraphs("   \n\n  ") == []

    def test_leading_trailing_whitespace(self):
        text = "\n\n\nCiao.\n\nBoh.\n\n\n"
        result = _split_paragraphs(text)
        assert result == ["Ciao.", "Boh."]


# ---------------------------------------------------------------------------
# Unit: _split_sentences
# ---------------------------------------------------------------------------


class TestSplitSentences:
    def test_single_sentence(self):
        text = "Questa è una frase sola."
        assert _split_sentences(text) == [text]

    def test_multiple_sentences(self):
        text = "Prima frase. Seconda frase. Terza frase."
        result = _split_sentences(text)
        assert result == ["Prima frase.", "Seconda frase.", "Terza frase."]

    def test_exclamation_and_question(self):
        text = "Attenzione! Come stai? Bene."
        result = _split_sentences(text)
        assert result == ["Attenzione!", "Come stai?", "Bene."]

    def test_sentence_ending_variants(self):
        text = "Dott. Rossi ha detto: ecco. Il sig. Bianchi? Sì."
        result = _split_sentences(text)
        # NOTE: _split_sentences has no abbreviation guard, so it currently
        # splits after "Dott." and "sig." (treating them as boundaries). This
        # pins the CURRENT behavior; adding abbreviation handling would change it.
        assert result == ["Dott.", "Rossi ha detto: ecco.", "Il sig.", "Bianchi?", "Sì."]

    def test_no_sentence_boundary_returns_single(self):
        text = "questo è tutto minuscolo senza punti"
        assert _split_sentences(text) == [text]

    def test_ellipsis_does_not_split(self):
        text = "Aspetta... è complicato. Davvero."
        result = _split_sentences(text)
        # "..." is not a sentence terminator for our regex
        assert result == ["Aspetta... è complicato.", "Davvero."]


# ---------------------------------------------------------------------------
# Unit: _hard_split
# ---------------------------------------------------------------------------


class TestHardSplit:
    def test_short_text_unchanged(self):
        assert _hard_split("breve", max_chars=100) == ["breve"]

    def test_splits_at_word_boundary(self):
        text = "uno due tre quattro"
        result = _hard_split(text, max_chars=100)
        assert result == ["uno due tre quattro"]

    def test_no_space_splits_at_char_boundary(self):
        text = "aaabbbcccddd"
        result = _hard_split(text, max_chars=6)
        assert result == ["aaabbb", "cccddd"]

    def test_hard_split_small_words(self):
        """Split words at word boundary when possible."""
        text = "abc def ghi jkl mno"
        # Each "word space word..." = 8+ chars > 7 → recursive split at each word boundary
        result = _hard_split(text, max_chars=7)
        assert result == ["abc", "def", "ghi", "jkl mno"]

    def test_no_space_force_splits(self):
        # A very long word (or run of chars) — no spaces to split at
        text = "a" * 20
        result = _hard_split(text, max_chars=5)
        assert all(len(chunk) <= 5 for chunk in result)
        assert "".join(result) == text

    def test_max_chars_exact(self):
        text = "abc de"
        result = _hard_split(text, max_chars=6)
        assert result == ["abc de"]


# ---------------------------------------------------------------------------
# Unit: _chunk_paragraph
# ---------------------------------------------------------------------------


class TestChunkParagraph:
    def test_short_para_whole(self):
        assert _chunk_paragraph("Corto.", max_chars=100) == ["Corto."]

    def test_long_para_split_by_sentence(self):
        # Build a paragraph that exceeds max_chars but has sentence boundaries
        para = "Prima frase. " * 5 + "Seconda lunghissima frase di test per vedere se si rompe bene. " * 3
        chunks = _chunk_paragraph(para, max_chars=80)
        assert len(chunks) == 4
        # Every chunk should be bounded
        for chunk in chunks:
            assert len(chunk) <= 80 + 5  # slight overflow from word-alignment

    def test_single_long_sentence_hard_split(self):
        para = "Parola " * 100  # ~700 chars, exceeds 200 max_chars
        chunks = _chunk_paragraph(para, max_chars=200)
        assert len(chunks) == 4
        for chunk in chunks:
            assert len(chunk) <= 210


# ---------------------------------------------------------------------------
# Integration: chunk_raw_text
# ---------------------------------------------------------------------------


class TestChunkRawText:
    def test_empty_text(self):
        result = chunk_raw_text("")
        assert result.items == ()
        assert result.source_type == "raw"

    def test_single_paragraph_short(self):
        text = "Questa è una breve introduzione al calcolo differenziale."
        result = chunk_raw_text(text)
        assert len(result.items) == 1
        assert result.items[0].seg_id == "raw_lesson_s0"
        assert result.items[0].text == text
        assert result.items[0].start is None
        assert result.items[0].end is None

    def test_two_paragraphs(self):
        text = "Primo paragrafo.\n\nSecondo paragrafo con più testo per vedere se funziona."
        result = chunk_raw_text(text)
        assert len(result.items) == 2
        assert result.items[0].seg_id == "raw_lesson_s0"
        assert "Primo" in result.items[0].text
        assert result.items[1].seg_id == "raw_lesson_s1"
        assert "Secondo" in result.items[1].text

    def test_custom_source_id(self):
        result = chunk_raw_text("Ciao.", source_id="mio_path")
        assert result.items[0].seg_id == "mio_path_s0"

    def test_long_text_chunks_into_multiple(self):
        # Build ~2000 chars of text — should produce multiple chunks
        paragraphs = "\n\n".join([f"Paragrafo numero {i}. " * 15 for i in range(5)])
        result = chunk_raw_text(paragraphs)
        assert len(result.items) == 5  # 5 paragraphs

    def test_whitespace_only(self):
        result = chunk_raw_text("   \n\n  \t  ")
        assert result.items == ()

    def test_monotonic_seg_ids(self):
        text = "A.\n\nB.\n\nC.\n\nD.\n\nE."
        result = chunk_raw_text(text)
        seg_ids = [item.seg_id for item in result.items]
        expected = [f"raw_lesson_s{i}" for i in range(5)]
        assert seg_ids == expected

    def test_realistic_lecture(self):
        """Test with the PLACEHOLDER fixture text."""
        import pathlib

        fixture_path = (
            pathlib.Path(__file__).resolve().parents[1]
            / "fixtures"
            / "raw_transcript"
            / "lesson_derivatives.txt"
        )
        text = fixture_path.read_text()
        result = chunk_raw_text(text)
        assert len(result.items) == 9  # deterministic: fixture yields 9 paragraphs
        assert result.source_type == "raw"
        # Verify chunks preserve content order
        all_text = " ".join(item.text for item in result.items)
        assert "derivata" in all_text
        assert "rapporto incrementale" in all_text
        assert "pendenza" in all_text

    def test_source_type_is_raw(self):
        result = chunk_raw_text("Ciao.")
        assert result.source_type == "raw"


# ---------------------------------------------------------------------------
# Integration: chunk_vtt
# ---------------------------------------------------------------------------


class TestChunkVtt:
    VTT_SAMPLE = """\
WEBVTT

00:00.000 --> 00:05.000
Oggi introduciamo la derivata.

00:05.000 --> 00:12.000
Partiamo da un esempio: la velocità sul tachimetro.

00:12.000 --> 00:18.000
Definiamo il rapporto incrementale.
"""

    def test_parses_cues(self):
        result = chunk_vtt(self.VTT_SAMPLE)
        assert len(result.items) == 3
        assert result.source_type == "vtt"

    def test_timestamps_seconds(self):
        result = chunk_vtt(self.VTT_SAMPLE)
        assert result.items[0].start == 0
        assert result.items[0].end == 5
        assert result.items[1].start == 5
        assert result.items[1].end == 12
        assert result.items[2].start == 12
        assert result.items[2].end == 18

    def test_seg_id_generated(self):
        result = chunk_vtt(self.VTT_SAMPLE)
        assert result.items[0].seg_id == "vtt_lesson_s0"
        assert result.items[1].seg_id == "vtt_lesson_s1"

    def test_custom_source_id(self):
        result = chunk_vtt(self.VTT_SAMPLE, source_id="my_vtt")
        assert result.items[0].seg_id == "my_vtt_s0"

    def test_empty_vtt(self):
        result = chunk_vtt("WEBVTT\n\n")
        assert result.items == ()

    def test_strips_html_tags(self):
        vtt = "WEBVTT\n\n00:00.000 --> 00:03.000\n<b>Grasso</b> testo con <i>tag</i>."
        result = chunk_vtt(vtt)
        assert "<b>" not in result.items[0].text
        assert "<i>" not in result.items[0].text
        assert "Grasso testo con tag." in result.items[0].text or "testo con tag" in result.items[0].text

    def test_multi_line_cue(self):
        """VTT cues can span multiple lines."""
        vtt = "WEBVTT\n\n00:00.000 --> 00:06.000\nPrima riga.\nSeconda riga.\nTerza riga."
        result = chunk_vtt(vtt)
        assert len(result.items) == 1
        assert "Prima" in result.items[0].text
        assert "Terza" in result.items[0].text

    def test_realistic_vtt_fixture(self):
        """Test with the PLACEHOLDER VTT fixture."""
        import pathlib

        fixture_path = (
            pathlib.Path(__file__).resolve().parents[1]
            / "fixtures"
            / "raw_transcript"
            / "lesson_derivatives.vtt"
        )
        text = fixture_path.read_text()
        result = chunk_vtt(text)
        assert len(result.items) == 5  # deterministic: 5 distinct cues, no dedup on fixture
        assert result.source_type == "vtt"
        # Verify all have timestamps
        for item in result.items:
            assert item.start is not None
            assert item.end is not None
            assert item.start < item.end


# ---------------------------------------------------------------------------
# Integration: chunk_srt
# ---------------------------------------------------------------------------


class TestChunkSrt:
    SRT_SAMPLE = """\
1
00:00,000 --> 00:05,000
Oggi introduciamo la derivata.

2
00:05,000 --> 00:12,000
Partiamo da un esempio: la velocità sul tachimetro.
"""

    def test_parses_cues(self):
        result = chunk_srt(self.SRT_SAMPLE)
        assert len(result.items) == 2
        assert result.source_type == "srt"

    def test_timestamps_seconds_srt(self):
        result = chunk_srt(self.SRT_SAMPLE)
        assert result.items[0].start == 0
        assert result.items[0].end == 5
        assert result.items[1].start == 5
        assert result.items[1].end == 12

    def test_seg_id_generated(self):
        result = chunk_srt(self.SRT_SAMPLE)
        assert result.items[0].seg_id == "srt_lesson_s0"

    def test_empty_srt(self):
        result = chunk_srt("")
        assert result.items == ()

    def test_hour_format(self):
        srt = "1\n01:00,000 --> 01:30,000\nOra lunga."
        result = chunk_srt(srt)
        assert result.items[0].start == 60
        assert result.items[0].end == 90


# ---------------------------------------------------------------------------
# Edge Cases
# ---------------------------------------------------------------------------


class TestEdgeCases:
    def test_single_word(self):
        result = chunk_raw_text("Ciao.")
        assert len(result.items) == 1
        assert result.items[0].text == "Ciao."

    def test_really_long_paragraph_no_sentence_boundary(self):
        """Very long text without sentence breaks."""
        text = "parola " * 500  # ~3000 chars
        result = chunk_raw_text(text, max_chars=400)
        assert len(result.items) == 9  # word-aligned hard-split: 7-char tokens don't divide 400 evenly
        for item in result.items:
            assert len(item.text) <= 410  # slight overflow from word-alignment OK

    def test_vtt_with_only_header(self):
        result = chunk_vtt("WEBVTT\n\n")
        assert result.items == ()

    def test_srt_with_only_number(self):
        result = chunk_srt("1\n00:00,000 --> 00:01,000\n")
        assert result.items == ()  # no text content

    def test_source_type_vtt(self):
        result = chunk_vtt("WEBVTT\n\n00:00.000 --> 00:01.000\nCiao.")
        assert result.source_type == "vtt"

    def test_source_type_srt(self):
        result = chunk_srt("1\n00:00,000 --> 00:01,000\nCiao.")
        assert result.source_type == "srt"

    def test_chunkresult_frozen(self):
        result = chunk_raw_text("Test.")
        with pytest.raises(Exception):
            result.items = ()  # type: ignore


# ---------------------------------------------------------------------------
# Store → Segment integration (conceptual)
# ---------------------------------------------------------------------------


class TestChunkToSegmentConversion:
    """Verifies ChunkResultItem fields can map 1:1 to Segment dataclass.

    We don't import Segment here to avoid circular coupling; we just verify
    that the fields are compatible by construction.
    """

    def test_fields_match_segment_requirements(self):
        """ChunkResultItem has all fields needed to build a Segment."""
        item = ChunkResultItem(seg_id="test_s0", text="Ciao.", start=0, end=10)
        assert item.seg_id == "test_s0"
        assert item.text == "Ciao."
        assert item.start == 0
        assert item.end == 10

    def test_null_timestamps_for_raw_text(self):
        item = ChunkResultItem(seg_id="raw_s0", text="Solo testo.")
        assert item.start is None
        assert item.end is None

    def test_chunkresultitem_frozen(self):
        item = ChunkResultItem(seg_id="x", text="y")
        with pytest.raises(Exception):
            item.text = "z"  # type: ignore
