"""Tests for lessonos.style — StyleProfile derivation helpers (M1-4).

The core functions tested here are pure (no store dependency):
  * ``_register_from_segments`` — heuristic register detection
  * ``_extract_tics`` — n-gram frequency extraction

End-to-end ``derive_style_profile`` is tested via the LIVE run in Phase F.
"""

from __future__ import annotations

from lessonos.style import _extract_tics, _register_from_segments


# ── _register_from_segments  ──────────────────────────────────────────


class TestRegisterFromSegments:
    def test_colloquiale(self) -> None:
        """High filler density → colloquiale."""
        texts = [
            "Allora, diciamo che un attimino il segnale è praticamente una grandezza fisica.",
            "Ecco, insomma, un attimino diciamo che varia nel tempo.",
            "Praticamente, un attimino diciamo che l'energia è l'integrale.",
        ]
        assert _register_from_segments(texts) == "colloquiale"

    def test_formale(self) -> None:
        """High formal marker density → formale."""
        texts = [
            "Il segnale è pertanto una grandezza fisica. Dunque varia nel tempo.",
            "Conseguentemente, l'energia è definita come l'integrale del modulo quadro.",
            "Tuttavia, la potenza media richiede un approccio differente. Inoltre, il teorema stabilisce che.",
        ]
        assert _register_from_segments(texts) == "formale"

    def test_misto(self) -> None:
        """Balanced filler/formal → misto."""
        texts = [
            "Allora, il segnale è pertanto una grandezza fisica.",
            "Dunque, un attimino, l'energia è l'integrale. Inoltre, la potenza.",
            "Ecco, diciamo che tuttavia il teorema vale.",
        ]
        assert _register_from_segments(texts) == "misto"

    def test_empty_texts(self) -> None:
        """Empty texts → misto (no data to decide)."""
        assert _register_from_segments([]) == "misto"

    def test_empty_strings(self) -> None:
        """All empty strings → misto."""
        assert _register_from_segments(["", "  "]) == "misto"


# ── _extract_tics  ────────────────────────────────────────────────────


class TestExtractTics:
    def test_basic_extraction(self) -> None:
        """Frequent n-grams surface as tics."""
        texts = [
            "un attimino vediamo questo segnale un attimino",
            "prendiamo un attimino l'integrale un attimino",
            "calcoliamo un attimino l'energia un attimino",
            "un attimino definiamo la trasformata un attimino",
        ]
        tics = _extract_tics(texts, min_occurrences=3)
        assert "un attimino" in tics or "attimino" in tics

    def test_min_occurrences_filter(self) -> None:
        """Expressions below threshold are excluded."""
        texts = [
            "una sola volta questa espressione rara",
            "altre cose normali",
            "ancora testo normale",
        ]
        tics = _extract_tics(texts, min_occurrences=3)
        assert len(tics) == 0

    def test_stopwords_excluded(self) -> None:
        """Common stopwords are not returned as tics."""
        texts = [
            "il segnale e la potenza il segnale e la potenza il segnale e la potenza",
        ]
        tics = _extract_tics(texts, min_occurrences=2, max_tics=10)
        for bad in ("il", "e", "la"):
            assert bad not in tics

    def test_max_tics_limit(self) -> None:
        """At most max_tics items returned."""
        texts = [
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
        ]
        tics = _extract_tics(texts, min_occurrences=2, max_tics=3)
        assert len(tics) <= 3

    def test_empty_texts(self) -> None:
        """Empty input → empty tuple."""
        assert _extract_tics([]) == ()


# ── M2-2: Written-style metrics  ──────────────────────────────────────


SAMPLE_DISPENSA_TEXT = """
ENERGIA

L'energia media di un segnale (semplicemente energia) si basa sulla valutazione del seguente
integrale (se esiste)

E = integrale di s(t) dt quadro (operazione non lineare)

Condizione necessaria e sufficiente: l'energia e ben definita se il segnale non coincide
o non contiene impulsi di Dirac o sue derivate.

Segnale a energia finita: s(t) in L quadro (i segnali a energia finita sono modellati
mediante funzioni a quadrato sommabili). Pertanto, l'energia e finita se l'integrale
converge. Dunque, per segnali localmente limitati, la condizione e soddisfatta.

• Segnale localmente a energia finita
• Segnale a energia finita in un intorno di piu infinito
• Segnale a energia finita in un intorno di meno infinito

Criterio: un segnale non oscillante necessariamente per essere a energia finita
in un intorno di piu infinito deve essere infinitesimo per t che tende a infinito.

limite di s(t) per t che tende a infinito = 0 (condizione necessaria)
""".strip()


class TestCleanDispensaText:
    def test_strips_control_chars(self) -> None:
        """Control chars are removed, content preserved."""
        from lessonos.style import _clean_dispensa_text

        dirty = "Hello\x00World\x1fTest\nNewline"
        cleaned = _clean_dispensa_text(dirty)
        assert "Hello" in cleaned
        assert "World" in cleaned
        assert "Test" in cleaned
        assert "Newline" in cleaned

    def test_page_breaks_to_paragraphs(self) -> None:
        """Form feeds become paragraph breaks."""
        from lessonos.style import _clean_dispensa_text

        cleaned = _clean_dispensa_text("Page1\fPage2")
        assert "Page1" in cleaned
        assert "Page2" in cleaned
        assert "\n\n" in cleaned

    def test_empty_input(self) -> None:
        """Empty input → empty string."""
        from lessonos.style import _clean_dispensa_text

        assert _clean_dispensa_text("") == ""
        assert _clean_dispensa_text("   ") == ""
        assert _clean_dispensa_text("\x00\x01\x02") == ""


class TestAvgSentenceLength:
    def test_normal_sentences(self) -> None:
        from lessonos.style import _avg_sentence_length

        text = "Questa e una frase. Anche questa. E anche questa terza frase."
        length = _avg_sentence_length(text)
        assert length > 0
        assert length < 10  # all short

    def test_single_sentence(self) -> None:
        from lessonos.style import _avg_sentence_length

        assert _avg_sentence_length("Una sola frase.") > 0

    def test_empty(self) -> None:
        from lessonos.style import _avg_sentence_length

        assert _avg_sentence_length("") == 0.0
        assert _avg_sentence_length("   ") == 0.0


class TestFormalDensity:
    def test_high_formal(self) -> None:
        from lessonos.style import _formal_density

        text = "condizione necessaria e sufficiente teorema criterio pertanto dimostrazione"
        density = _formal_density(text)
        assert density > 0

    def test_no_formal(self) -> None:
        from lessonos.style import _formal_density

        text = "il gatto mangia il topo che corre nel prato"
        assert _formal_density(text) == 0.0

    def test_empty(self) -> None:
        from lessonos.style import _formal_density

        assert _formal_density("") == 0.0


class TestSectionCount:
    def test_all_caps_headings(self) -> None:
        from lessonos.style import _section_count

        text = "ENERGIA\ncontent\nENERGIA LOCALE\nmore content"
        assert _section_count(text) == 2

    def test_numbered_headings(self) -> None:
        from lessonos.style import _section_count

        text = "1. Introduzione\ncontent\n2. Metodo\nmore\n3. Risultati"
        assert _section_count(text) == 3

    def test_no_headings(self) -> None:
        from lessonos.style import _section_count

        text = "solo testo normale senza titoli in ogni sua parte"
        assert _section_count(text) == 0

    def test_empty(self) -> None:
        from lessonos.style import _section_count

        assert _section_count("") == 0


class TestBulletDensity:
    def test_with_bullets(self) -> None:
        from lessonos.style import _bullet_density

        text = "- item one - item two - item three other text here"
        density = _bullet_density(text)
        assert density > 0

    def test_no_bullets(self) -> None:
        from lessonos.style import _bullet_density

        text = "solo testo normale senza marcatori"
        assert _bullet_density(text) == 0.0

    def test_empty(self) -> None:
        from lessonos.style import _bullet_density

        assert _bullet_density("") == 0.0


class TestMathDensity:
    def test_math_notation(self) -> None:
        from lessonos.style import _math_density

        text = "integrale di s(t) dt limite per t tende a t0 E = integrale di s quadro dt"
        density = _math_density(text)
        assert density > 0

    def test_greek_letters(self) -> None:
        from lessonos.style import _math_density

        text = "α β γ δ στο άπειρο ∫ s(t) dt"  # actual Greek unicode + integral sign
        density = _math_density(text)
        assert density > 0

    def test_no_math(self) -> None:
        from lessonos.style import _math_density

        text = "solo testo normale senza formule"
        assert _math_density(text) == 0.0

    def test_empty(self) -> None:
        from lessonos.style import _math_density

        assert _math_density("") == 0.0


class TestAvgParagraphLength:
    def test_multiple_paragraphs(self) -> None:
        from lessonos.style import _avg_paragraph_length

        text = "Primo paragrafo con alcune parole.\n\nSecondo paragrafo anche piu lungo di testo.\n\nTerzo breve."
        length = _avg_paragraph_length(text)
        assert length > 0

    def test_single_paragraph(self) -> None:
        from lessonos.style import _avg_paragraph_length

        assert _avg_paragraph_length("Solo un paragrafo con alcune parole.") > 0

    def test_empty(self) -> None:
        from lessonos.style import _avg_paragraph_length

        assert _avg_paragraph_length("") == 0.0


class TestWrittenStyleHint:
    def test_no_corpus_returns_empty(self) -> None:
        from lessonos.dispensa import _written_style_hint
        from lessonos.style import WrittenStyleProfile

        ws = WrittenStyleProfile(
            avg_sentence_length=0.0, formal_density=0.0, section_count=0,
            bullet_density=0.0, math_density=0.0, avg_paragraph_length=0.0,
            dispense_processed=0,
        )
        assert _written_style_hint(ws) == ""

    def test_with_data_returns_hint(self) -> None:
        from lessonos.dispensa import _written_style_hint
        from lessonos.style import WrittenStyleProfile

        ws = WrittenStyleProfile(
            avg_sentence_length=18.5, formal_density=2.5, section_count=8,
            bullet_density=0.5, math_density=3.0, avg_paragraph_length=40.0,
            dispense_processed=6,
        )
        hint = _written_style_hint(ws)
        assert "Nello stile SCRITTO" in hint
        assert "frasi di media lunghezza" in hint or "frasi articolate" in hint
        assert "formale" in hint or "accademici" in hint

    def test_deterministic(self) -> None:
        from lessonos.dispensa import _written_style_hint
        from lessonos.style import WrittenStyleProfile

        ws = WrittenStyleProfile(
            avg_sentence_length=10.0, formal_density=0.5, section_count=3,
            bullet_density=0.0, math_density=0.0, avg_paragraph_length=15.0,
            dispense_processed=1,
        )
        h1 = _written_style_hint(ws)
        h2 = _written_style_hint(ws)
        assert h1 == h2


class TestDeriveWrittenStyle:
    def test_no_directory_returns_zeroed(self) -> None:
        from lessonos.style import derive_written_style

        ws = derive_written_style(dispense_dir="/tmp/nonexistent-dir-xyz-123")
        assert ws.dispense_processed == 0
        assert ws.avg_sentence_length == 0.0

    def test_on_real_corpus(self) -> None:
        """Integration test on the actual dispense corpus. Tests that the
        real Andreas notes produce measurable, non-zero written-style metrics."""
        from lessonos.style import derive_written_style

        real_dir = "/Users/progettibelli/maestro-data/teoria-segnali-2021/derived/dispense"
        ws = derive_written_style(dispense_dir=real_dir)
        # At minimum Energia and Sommabilit should be there
        assert ws.dispense_processed >= 2, f"expected >=2 dispense, got {ws.dispense_processed}"
        # Real values (will evolve as corpus grows)
        assert ws.section_count > 0
        assert ws.avg_sentence_length > 0
        print(f"\n[INTEGRATION] WrittenStyleProfile from {real_dir}:")
        print(f"  dispense_processed = {ws.dispense_processed}")
        print(f"  avg_sentence_length = {ws.avg_sentence_length}")
        print(f"  formal_density = {ws.formal_density}")
        print(f"  section_count = {ws.section_count}")
        print(f"  bullet_density = {ws.bullet_density}")
        print(f"  math_density = {ws.math_density}")
        print(f"  avg_paragraph_length = {ws.avg_paragraph_length}")
