"""Tests for excerpt repair / FM1 guard (_repair_excerpt + integration)."""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.extraction import _negation_preserved, _repair_excerpt
from lessonos.models.entities import Segment


# ── _repair_excerpt: direct unit tests ──────────────────────────────


class TestRepairExcerptDirect:
    """Direct unit tests for the _repair_excerpt helper (3-tier strategy)."""

    def test_verbatim_substring_returned_as_is(self):
        """Tier 1: verbatim substring returned as-is."""
        result = _repair_excerpt(
            "derivata formale", "definizione di derivata formale in analisi"
        )
        assert result == "derivata formale"

    def test_longest_common_substring_tier2(self):
        """Tier 2: paraphrased excerpt matched via longest common substring."""
        result = _repair_excerpt(
            "velocità istantanea di variazione",
            "la velocità istantanea (derivata) misura la variazione",
        )
        # LCS of "velocità istantanea di variazione" (27 chars) vs segment text
        # Expected: "velocità istantanea " (19 chars, includes trailing space before '(')
        # Threshold: max(8, int(27*0.4)) = max(8, 10) = 10. 19 >= 10 → tier2 passes
        assert result is not None
        assert "velocità istantanea" in result
        assert len(result) >= 10

    def test_tier2_returns_verbatim_span_from_segment(self):
        """Tier 2 returns the ACTUAL text from segment (original casing)."""
        result = _repair_excerpt(
            "rapporto incrementale",
            "Il RAPPORTO INCREMENTALE è il fondamento del calcolo differenziale",
        )
        assert result == "RAPPORTO INCREMENTALE"

    def test_tier2_short_excerpt_under_threshold_falls_to_tier3(self):
        """Tier 2 threshold rejects short matches, falls to tier 3."""
        # "xyz" — not verbatim in segment, tier2 LCS < 8 chars, falls to tier3
        # tier3 also no match (no common words)
        result = _repair_excerpt("xyz", "funzione derivata")
        assert result is None

    def test_tier3_word_by_word_greedy(self):
        """Tier 3 (bug-hunt #3): un frammento di 1 parola corta NON e' prova.

        Prima ritornava "vett" (4 char, 50% dell'excerpt — e nemmeno a confine
        di parola: 'vett' sta dentro 'vettori') e il gate lo contava VERIFIED:
        la porta d'ingresso delle citazioni allucinate. Ora: None.
        """
        result = _repair_excerpt(
            "vett xyz",
            "una lista di vettori",
        )
        assert result is None

    def test_tier3_preserves_segment_casing(self):
        """Tier 3 returns substring from segment preserving original casing."""
        # Ensure tier2 doesn't match well, so tier3 is tested
        # "derivata prima" vs "La DERIVATA PRIMA della funzione"
        # Tier2 LCS = "DERIVATA PRIMA" (15 chars >= 8+40%) — tier2 wins, returns segment text
        result = _repair_excerpt(
            "derivata prima",
            "La DERIVATA PRIMA della funzione misura la pendenza",
        )
        assert result == "DERIVATA PRIMA"

    def test_no_match_returns_none(self):
        """No match across all 3 tiers → None."""
        result = _repair_excerpt(
            "completamente diverso",
            "il calcolo delle derivate",
        )
        assert result is None

    def test_empty_excerpt_returns_none(self):
        """Empty excerpt → None."""
        assert _repair_excerpt("", "some text") is None

    def test_empty_segment_text_returns_none(self):
        """Empty segment text → None."""
        assert _repair_excerpt("some text", "") is None

    def test_word_prefix_matching_full_prefix(self):
        """Tier 3 matches longest PREFIX of excerpt words (not arbitrary subset)."""
        # "derivata e integrale sono concetti fondamentali"
        # Segment: "la derivata e integrale nel calcolo"
        # Tier2: "derivata e integrale" — 20 chars verbatim? Yes! "derivata e integrale" IS in segment.
        # So tier1/2 wins. Let's rephrase:
        # "integrale e derivata sono concetti" vs "la derivata e integrale nel calcolo"
        # No verbatim. Tier2: "integrale e d" might hit short. Let's check.
        result = _repair_excerpt(
            "integrale e derivata sono concetti",
            "la derivata e integrale nel calcolo",
        )
        # Bug-hunt #3: questo e' una PARAFRASI (ordine parole diverso), non un
        # near-miss verbatim. Ripararla a un frammento qualsiasi significava
        # contare VERIFIED una citazione che non esiste. Ora: None.
        assert result is None


# ── _repair_excerpt: edge tier3 cases ──────────────────────────────


class TestRepairExcerptTier3Edge:
    """Edge cases specifically for tier3 (word-by-word greedy)."""

    def test_tier3_matches_longest_prefix(self):
        """Tier 3: longest prefix of excerpt words, not arbitrary subset."""
        # "derivata e limite di f" vs "limite della derivata di una funzione"
        # Tier2: no long LCS (different order)
        # Tier3: first word "derivata" appears? "derivata" IS in segment.
        # So "derivata" should match.
        result = _repair_excerpt(
            "derivata e limite di f",
            "limite della derivata di una funzione",
        )
        assert result is not None
        assert "derivata" in result

    def test_tier3_single_word_match(self):
        """Tier 3: single word match returns that word from segment."""
        result = _repair_excerpt(
            "velocità cambiamento",
            "la derivata è la velocità istantanea",
        )
        # "velocità" is in segment. Tier2: "velocità" = 8 chars exactly. >=8 + >=40% of 20 = 8.
        # So either tier2 or tier3, we should get a match.
        assert result is not None
        assert result in "la derivata è la velocità istantanea"

    def test_tier3_capitalization_insensitive_match(self):
        """Tier 3: case-insensitive matching returns segment text with original casing."""
        result = _repair_excerpt(
            "DERIVATA",
            "la derivata di una funzione",
        )
        # Tier1: not verbatim (case mismatch). Tier2: "derivata" (8 chars) — should match.
        assert result is not None
        assert result == "derivata"


# ── Integration: excerpt guard in extract_lesson_content ─────────────


def _make_extraction_router(response_json: dict):
    """Build a router (mock) that returns the given JSON dict."""
    from lessonos.llm.router import Router, LLMResponse

    class _MockRouter(Router):
        def complete(self, prompt, **kw):
            return LLMResponse(text=json.dumps(response_json), provider="mock", model="mock-model")

    return _MockRouter()


def _make_simple_store(segment_text, *, seg_id="l1s1", lesson_id="l1"):
    """Build a minimal store mock with one segment."""
    from lessonos.store.base import Store

    segments_list = [
        Segment(seg_id=seg_id, lesson_id=lesson_id, start=0.0, end=50.0, text=segment_text)
    ]

    class _SimpleStore(Store):
        def segments_for_lesson(self, lid):
            return tuple(s for s in segments_list if s.lesson_id == lid)
        def close(self): ...
        def save_segment(self, *a, **kw): ...
        def get_segment(self, *a, **kw): ...
        def save_capsule(self, *a, **kw): ...
        def get_capsule(self, *a, **kw): ...
        def save_ledger_entry(self, *a, **kw): ...
        def get_ledger_entries(self, *a, **kw): ...
        def get_ledger_for_lesson(self, *a, **kw): ...
        def save_moment(self, *a, **kw): ...
        def get_moment(self, *a, **kw): ...
        def moments_for_lesson(self, *a, **kw): ...
        def save_lesson(self, *a, **kw): ...
        def get_lesson(self, *a, **kw): ...
        def lesson_ids(self, *a, **kw): ...
        def save_path(self, *a, **kw): ...
        def get_path(self, *a, **kw): ...
        def paths_for_teacher(self, *a, **kw): ...
        def lessons_for_path(self, *a, **kw): ...
        def save_source(self, *a, **kw): ...
        def get_source(self, *a, **kw): ...

        # Graph tables (T5)
        def save_graph_node(self, *a, **kw): ...
        def get_graph_nodes_for_lesson(self, *a, **kw): ...
        def save_graph_edge(self, *a, **kw): ...
        def get_graph_edges_for_lesson(self, *a, **kw): ...
        def save_evidence(self, *a, **kw): ...
        def get_evidence_for_edge(self, *a, **kw): ...
        def get_all_evidence_for_lesson(self, *a, **kw): ...
        def delete_graph_for_lesson(self, *a, **kw): ...

        def begin_transaction(self): ...
        def commit_transaction(self): ...
        def rollback_transaction(self): ...

        def delete_capsule(self, lesson_id: str) -> bool: ...
        def purge_lesson(self, lesson_id: str) -> int: return 0

    return _SimpleStore()


SEG_TEXT = "La derivata formale di una funzione f e il limite del rapporto incrementale."


class TestExcerptRepairIntegration:
    """Integration: excerpt guard in extract_lesson_content with mock LLM."""

    def test_verbatim_excerpt_accepted_as_is(self):
        """Verbatim excerpt passes through unchanged (excerpt_repaired=False)."""
        from lessonos.capsule.extraction import extract_lesson_content

        store = _make_simple_store(SEG_TEXT)
        router = _make_extraction_router({
            "concepts": [{
                "name": "Derivata formale",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1", "excerpt": "derivata formale di una funzione"}],
            }],
            "exercises": [], "student_questions": [], "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        c = content.concepts[0]
        assert c.citations[0].excerpt == "derivata formale di una funzione"
        assert c.citations[0].excerpt_repaired is False

    def test_paraphrased_excerpt_repaired_and_flagged(self):
        """Paraphrased excerpt gets repaired (excerpt_repaired=True)."""
        from lessonos.capsule.extraction import extract_lesson_content

        store = _make_simple_store(SEG_TEXT)
        router = _make_extraction_router({
            "concepts": [{
                "name": "Derivata formale",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1", "excerpt": "il limite incrementale del rapporto"}],
            }],
            "exercises": [], "student_questions": [], "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        c = content.concepts[0]
        assert c.citations[0].excerpt_repaired is True
        if c.citations[0].excerpt is not None:
            assert c.citations[0].excerpt in SEG_TEXT

    def test_completely_unmatched_excerpt_dropped(self):
        """Excerpt with no match is dropped (excerpt=None) + flagged."""
        from lessonos.capsule.extraction import extract_lesson_content

        store = _make_simple_store(SEG_TEXT)
        router = _make_extraction_router({
            "concepts": [{
                "name": "Derivata formale",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1", "excerpt": "completamente inventato senza corrispondenza"}],
            }],
            "exercises": [], "student_questions": [], "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        c = content.concepts[0]
        assert c.citations[0].excerpt is None
        assert c.citations[0].excerpt_repaired is True

    def test_excerpt_none_passes_through_unflagged(self):
        """Excerpt=None in LLM response: no repair, not flagged."""
        from lessonos.capsule.extraction import extract_lesson_content

        store = _make_simple_store(SEG_TEXT)
        router = _make_extraction_router({
            "concepts": [{
                "name": "Derivata formale",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1", "excerpt": None}],
            }],
            "exercises": [], "student_questions": [], "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        c = content.concepts[0]
        assert c.citations[0].excerpt is None
        assert c.citations[0].excerpt_repaired is False

    def test_mixed_citations_some_repaired(self):
        """Mixed: one verbatim citation, one paraphrased."""
        from lessonos.capsule.extraction import extract_lesson_content

        store = _make_simple_store(SEG_TEXT)
        router = _make_extraction_router({
            "concepts": [{
                "name": "Derivata formale",
                "status": "introduced",
                "citations": [
                    {"seg_id": "l1s1", "excerpt": "derivata formale di una funzione"},
                    {"seg_id": "l1s1", "excerpt": "rapporto incrementale totalmente inventato"},
                ],
            }],
            "exercises": [], "student_questions": [], "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        c = content.concepts[0]
        assert len(c.citations) == 2
        assert c.citations[0].excerpt_repaired is False
        assert c.citations[1].excerpt_repaired is True


class TestExcerptGuardAllContentTypes:
    """Excerpt guard applies to all 4 content types (concepts, exercises, questions, homework)."""

    def test_exercise_citation_repaired(self):
        from lessonos.capsule.extraction import extract_lesson_content

        seg_text = "Calcolare la derivata di x^2."
        store = _make_simple_store(seg_text)
        router = _make_extraction_router({
            "concepts": [],
            "exercises": [{
                "prompt": "Calcola la derivata",
                "citations": [{"seg_id": "l1s1", "excerpt": "derivata di x al quadrato"}],
            }],
            "student_questions": [],
            "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        assert content.exercises[0].citations[0].excerpt_repaired is True

    def test_question_citation_repaired(self):
        from lessonos.capsule.extraction import extract_lesson_content

        seg_text = "La derivata e la velocità istantanea."
        store = _make_simple_store(seg_text)
        router = _make_extraction_router({
            "concepts": [],
            "exercises": [],
            "student_questions": [{
                "question": "Cosa è la derivata?",
                "citations": [{"seg_id": "l1s1", "excerpt": "velocità e derivata"}],
            }],
            "homework": [],
        })

        content = extract_lesson_content(store, "l1", router)
        assert content.student_questions[0].citations[0].excerpt_repaired is True

    def test_homework_citation_repaired(self):
        from lessonos.capsule.extraction import extract_lesson_content

        seg_text = "Esercizi sulle derivate fondamentali."
        store = _make_simple_store(seg_text)
        router = _make_extraction_router({
            "concepts": [],
            "exercises": [],
            "student_questions": [],
            "homework": [{
                "task": "Fai gli esercizi",
                "citations": [{"seg_id": "l1s1", "excerpt": "esercizi derivata"}],
            }],
        })

        content = extract_lesson_content(store, "l1", router)
        assert content.homework[0].citations[0].excerpt_repaired is True


# ── Edge: unicode, punctuation, longer-excerpt ──────────────────────


class TestRepairExcerptEdge:
    """Edge cases: unicode, punctuation, excerpt longer than segment."""

    def test_unicode_characters_preserved(self):
        """Unicode characters preserved through repair."""
        result = _repair_excerpt(
            "funzione continua e derivabile",
            "La funzione è continua e derivabile su tutto ℝ",
        )
        assert result is not None
        # Should match "funzione" (tier3: first word in excerpt that resembles segment)
        # Actually "funzione" is verbatim (lowercase match in "funzione" from segment)
        # But segment has "La funzione" — "funzione" is verbatim
        assert result in "La funzione è continua e derivabile su tutto ℝ"

    def test_punctuation_difference(self):
        """Punctuation differences do not block matching."""
        # "calcolo differenziale: derivate" vs "calcolo differenziale, derivate e integrali"
        # Tier2/3 should handle this
        result = _repair_excerpt(
            "calcolo differenziale: derivate",
            "calcolo differenziale, derivate e integrali",
        )
        assert result is not None
        assert result in "calcolo differenziale, derivate e integrali"

    def test_excerpt_longer_than_segment(self):
        """Excerpt longer than segment text — should still try to match."""
        result = _repair_excerpt(
            "il calcolo delle derivate è molto importante per l'analisi matematica e le applicazioni",
            "il calcolo delle derivate",
        )
        # Tier1: excerpt starts with "il calcolo delle derivate" which IS verbatim
        assert result == "il calcolo delle derivate"

    def test_multiple_spaces_in_excerpt(self):
        """Extra whitespace in excerpt handled gracefully."""
        # Note: actual _repair_excerpt uses split() which normalizes whitespace
        result = _repair_excerpt(
            "derivata   di   una   funzione",
            "La derivata di una funzione è",
        )
        # Split-based matching: individual words still match
        assert result is not None
        assert result in "La derivata di una funzione è"


# ── M1-4c test #5: repair adversarial ──────────────────────────────────


class TestRepairExcerptAdversarial:
    """Bug-hunt §4 test #5: adversarial cases for _repair_excerpt.

    Covers bug-hunt #3 (tier-3 floor: totally hallucinated excerpt with
    article word → None) and M1-5 #4 (negation — guard active on tier 2 & 3).
    """

    # ── bug-hunt #4: negation awareness (KNOWN LIMITATION, deferred to M1-5) ──

    def test_negation_stripping_known_limitation(self):
        """Negation-aware repair is NOT yet implemented (M1-5).

        'non è continua' vs 'la funzione non è continua in zero' is
        VERBATIM (tier 1 wins) so it passes through unmodified. This
        test documents the known limitation — the negation-semantic
        guard will be added in M1-5 (#4 part b).

        The test asserts CURRENT behavior so any future change is
        deliberate.
        """
        result = _repair_excerpt(
            "non è continua",
            "la funzione non è continua in zero",
        )
        # Tier 1: verbatim match → returned as-is
        assert result == "non è continua"

    def test_negation_stripping_lcs_guard(self):
        """Negation guard rejects LCS-repaired span that dropped negation.

        If the excerpt is 'non è continua in zero' but the segment is
        'la funzione è continua in zero, è derivabile', the LCS finds
        ' è continua in zero' — stripping the negation. The negation
        guard detects 'non' is missing from the repaired span and
        returns None (M1-5 fix).
        """
        result = _repair_excerpt(
            "non è continua in zero",
            "la funzione è continua in zero, è derivabile",
        )
        # Tier 2: LCS finds ' è continua in zero' — negation guard rejects
        assert result is None

    # ── bug-hunt #3: tier-3 floor ──────────────────────────────────────

    def test_hallucinated_excerpt_with_article_returns_none(self):
        """Tier-3 floor rejects excerpt reduced to 1-2 short words.

        'la trasformata di Fourier' vs 'il calcolo delle derivate':
        - Tier 1/2 fail (no common substring beyond 'la' vs 'il' + 'di')
        - Tier 3 word-by-word: 'la' not verbatim, 'trasformata' not in seg,
          so best_end=0 → None.
        The bug-hunt #3 fix prevents an allucinated excerpt from being
        reduced to a single short word and counted VERIFIED.
        """
        result = _repair_excerpt(
            "la trasformata di Fourier",
            "il calcolo delle derivate",
        )
        assert result is None

    def test_article_first_word_plus_verbatim_rest_passes(self):
        """Tier-3 floor still allows genuine matches even when first
        word is an article (common in Italian)."""
        result = _repair_excerpt(
            "la derivata di una funzione",
            "La derivata di una funzione misura la pendenza",
        )
        assert result is not None
        assert "derivata di una funzione" in result

    def test_word_boundary_guard(self):
        """Bug-hunt #3 word-boundary guard (defense-in-depth with floor).

        ``_repair_excerpt('abc la', 'della funzione')``:
        - Tier 1: 'abc la' NOT in 'della funzione' → fails
        - Tier 2: LCS 'la' (2 chars) < threshold max(8, 6*0.4)=8 → fails
        - Tier 3: first-prefix 'abc' not in seg → best_end=0, None returned.
          The word-boundary guard (regex ``(?<!\\w)``) is defense-in-depth
          alongside the length floor (``len < 6``). The fix that matters
          is the combined floor+boundary; neither alone is sufficient.
        """
        result = _repair_excerpt(
            "abc la",
            "della funzione",
        )
        assert result is None

    # ── repaired flag vs is_verified_excerpt ───────────────────────────

    def test_repaired_excerpt_verified_by_is_verified(self):
        """``is_verified_excerpt`` returns True for repaired excerpts
        (current behavior — the function does not check the repair flag).

        This documents the policy: a repaired excerpt that passes the
        floor and produces a genuine segment substring IS counted as
        verified. The repair flag is metadata for the renderer to
        disclose, not a gate criterion.
        """
        from lessonos.graph.grounding import is_verified_excerpt

        assert is_verified_excerpt("derivata") is True
        assert is_verified_excerpt("non è continua") is True

    def test_none_excerpt_not_verified(self):
        """``is_verified_excerpt`` returns False for None/empty excerpts."""
        from lessonos.graph.grounding import is_verified_excerpt

        assert is_verified_excerpt(None) is False
        assert is_verified_excerpt("") is False


class TestNegationGuardWordBoundary:
    """Retro-review MAJOR (M1-5.3b): the negation guard must tokenise to
    words. Substring matching had two failure modes:
    (a) bypass — "non" ⊂ "nonostante" satisfied the guard with the actual
        negation stripped (semantic inversion passes);
    (b) over-rejection — "no" ⊂ "sono"/"nota" made the guard fire on nearly
        every Italian excerpt, collapsing tier-2/3 repair recall.
    """

    def test_nonostante_does_not_satisfy_required_non(self):
        """Bypass closed: 'nonostante' in the repair is NOT the word 'non'."""
        assert _negation_preserved(
            "non è lineare", "nonostante sia lineare"
        ) is False

    def test_no_inside_sono_does_not_trigger_guard(self):
        """Over-rejection fixed: 'no' ⊂ 'sono' is not a negation word."""
        assert _negation_preserved(
            "i valori sono finiti", "valori finiti"
        ) is True

    def test_real_negation_word_preserved_passes(self):
        assert _negation_preserved(
            "non converge", "la serie non converge mai"
        ) is True

    def test_real_negation_word_dropped_rejects(self):
        assert _negation_preserved(
            "non converge", "la serie converge"
        ) is False

    def test_tier2_rejects_candidate_whose_non_is_only_nonostante(self):
        """E2E: LCS repair drops 'non' but keeps 'nonostante' → reject.

        excerpt 'non è continua nonostante tutto' vs segment 'la funzione è
        continua nonostante tutto': tier 2 finds ' è continua nonostante
        tutto' — the negation 'non' is gone, but the substring guard was
        satisfied by 'nonostante'. The word guard must return None.
        """
        result = _repair_excerpt(
            "non è continua nonostante tutto",
            "la funzione è continua nonostante tutto",
        )
        assert result is None

    def test_tier2_repair_recall_restored_for_sono(self):
        """E2E: excerpt with 'sono' (substring 'no') repairs fine when the
        candidate carries no negation — the old guard rejected this."""
        result = _repair_excerpt(
            "i valori sono limitati e finiti",
            "tutti i valori limitati e finiti qui",
        )
        assert result is not None
        assert "limitati e finiti" in result
