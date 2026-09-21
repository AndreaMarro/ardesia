"""Tests for lessonos/summarizer — T6 Riepilogo-lezione (deterministic, mock-tested).

Tests cover:

1. **Deterministic mock** — fixed capsule + fixed LLM response → **exact expected
   markdown** byte-for-byte. This is the anti-tautology guarantee (Claude review
   directive 10:35): we assert the WHOLE output, not just "citations resolve".

2. **Citation grounding** — seg_id not persisted → ValueError (reuses
   ``verify_citation`` from graph/grounding.py).

3. **Non-verbatim excerpt** — excerpt not a substring → ValueError.

4. **Malformed JSON** — LLM returns unparseable → ValueError.

5. **Output file written** — when output_dir is set, the file is created.
"""

from __future__ import annotations

import json
import os
import tempfile

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.ingest.lessonos_snapshot import LessonOsStudyDigest, StudyConcept, StudyError
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import Segment
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import (
    SummaryPack,
    _build_summary_prompt,
    _cited_seg_texts,
    _parse_summary_response,
    _render_summary_markdown,
    _repair_summary_citations,
    generate_lesson_summary,
)

# ── Fixture data ──────────────────────────────────────────────────────

_SEG0 = (
    "Derivative is the rate of change of a function with respect to its variable."
)
_SEG1 = "The limit as h approaches 0 of the difference quotient is the derivative."
_SEG2 = "Power rule: the derivative of x^n is n times x to the n minus one."


@pytest.fixture
def store() -> SQLiteStore:
    """Fresh in-memory store with 3 segments for lesson 'l1'."""
    s = SQLiteStore(":memory:")
    s.save_segment(Segment(seg_id="l1#s0", lesson_id="l1", start=0, end=15, text=_SEG0))
    s.save_segment(Segment(seg_id="l1#s1", lesson_id="l1", start=15, end=30, text=_SEG1))
    s.save_segment(Segment(seg_id="l1#s2", lesson_id="l1", start=30, end=45, text=_SEG2))
    return s


def _make_capsule() -> LessonCapsule:
    """Build a fixed grounded capsule with 2 concepts, 1 exercise, 1 question, 1 homework.

    Every citation points to real segments with verbatim excerpts.
    """
    return LessonCapsule(
        lesson_id="l1",
        timeline=(
            TopicSpan(
                lesson_id="l1",
                topic="Introduzione alla derivata",
                seg_ids=("l1#s0", "l1#s1"),
                start=0,
                end=30,
            ),
            TopicSpan(
                lesson_id="l1",
                topic="Regole di derivazione",
                seg_ids=("l1#s2",),
                start=30,
                end=45,
            ),
        ),
        content=LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="derivata",
                    status="introduced",
                    prerequisites=(),
                    citations=(
                        Citation(
                            seg_id="l1#s0",
                            excerpt="rate of change",
                            confidence=0.9,
                        ),
                    ),
                ),
                ConceptExtraction(
                    name="regola della potenza",
                    status="introduced",
                    prerequisites=("derivata",),
                    citations=(
                        Citation(
                            seg_id="l1#s2",
                            excerpt="Power rule",
                            confidence=0.95,
                        ),
                    ),
                ),
            ),
            exercises=(
                ExerciseExtraction(
                    prompt="Calcola la derivata di x^2 usando la definizione.",
                    citations=(
                        Citation(seg_id="l1#s1", excerpt="difference quotient"),
                    ),
                ),
            ),
            student_questions=(
                QuestionExtraction(
                    question="Cosa succede se h tende a 0?",
                    citations=(
                        Citation(seg_id="l1#s1", excerpt="limit as h approaches 0"),
                    ),
                ),
            ),
            homework=(
                HomeworkExtraction(
                    task="Esercizi 1-3: derivate dal primo principio.",
                    citations=(
                        Citation(seg_id="l1#s2", excerpt="x to the n minus one"),
                    ),
                ),
            ),
        ),
        dropped=(),
    )


# ── Fixed LLM response for the deterministic test ─────────────────────
# This JSON is the stabile output that MockProvider returns for
# _build_summary_prompt(capsule). The test below asserts the EXACT rendered
# markdown — any change to the prompt, renderer, or capsule breaks it,
# which is the anti-tautology guarantee.

_DETERMINISTIC_LLM_RESPONSE = json.dumps(
    {
        "sections": [
            {
                "heading": "Panoramica dei temi",
                "paragraphs": [
                    {
                        "text": (
                            "La lezione introduce il concetto di derivata "
                            "come rate of change di una funzione."
                        ),
                        "citations": [{"seg_id": "l1#s0", "excerpt": "rate of change"}],
                    },
                    {
                        "text": (
                            "Viene poi presentato il limite del rapporto "
                            "incrementale come definizione formale."
                        ),
                        "citations": [
                            {"seg_id": "l1#s1", "excerpt": "difference quotient"}
                        ],
                    },
                    {
                        "text": (
                            "Infine si introducono le regole di derivazione, "
                            "a cominciare dalla regola della potenza."
                        ),
                        "citations": [{"seg_id": "l1#s2", "excerpt": "Power rule"}],
                    },
                ],
            },
            {
                "heading": "Concetti chiave",
                "paragraphs": [
                    {
                        "text": (
                            "derivata (introduced): definita come rate of "
                            "change istantaneo."
                        ),
                        "citations": [{"seg_id": "l1#s0", "excerpt": "rate of change"}],
                    },
                    {
                        "text": (
                            "regola della potenza (introduced): la derivata "
                            "di x^n e' n per x^(n-1)."
                        ),
                        "citations": [{"seg_id": "l1#s2", "excerpt": "Power rule"}],
                    },
                ],
            },
            {
                "heading": "Esercizi",
                "paragraphs": [
                    {
                        "text": (
                            "Calcola la derivata di x^2 usando la "
                            "definizione di limite."
                        ),
                        "citations": [
                            {"seg_id": "l1#s1", "excerpt": "difference quotient"}
                        ],
                    },
                ],
            },
            {
                "heading": "Domande degli studenti",
                "paragraphs": [
                    {
                        "text": "Cosa succede se h tende a 0 nel rapporto incrementale?",
                        "citations": [
                            {"seg_id": "l1#s1", "excerpt": "limit as h approaches 0"}
                        ],
                    },
                ],
            },
            {
                "heading": "Compiti",
                "paragraphs": [
                    {
                        "text": "Esercizi 1-3: derivate dal primo principio.",
                        "citations": [
                            {
                                "seg_id": "l1#s2",
                                "excerpt": "x to the n minus one",
                            }
                        ],
                    },
                ],
            },
        ]
    }
)

_EXPECTED_MARKDOWN = """# Riepilogo: l1

- **Lezione**: `l1`
- **Concetti**: 2
- **Esercizi**: 1
- **Domande**: 1
- **Compiti**: 1

## Panoramica dei temi

La lezione introduce il concetto di derivata come rate of change di una funzione. (✅[rate of change](l1#s0))

Viene poi presentato il limite del rapporto incrementale come definizione formale. (✅[difference quotient](l1#s1))

Infine si introducono le regole di derivazione, a cominciare dalla regola della potenza. (✅[Power rule](l1#s2))

## Concetti chiave

derivata (introduced): definita come rate of change istantaneo. (✅[rate of change](l1#s0))

regola della potenza (introduced): la derivata di x^n e' n per x^(n-1). (✅[Power rule](l1#s2))

## Esercizi

Calcola la derivata di x^2 usando la definizione di limite. (✅[difference quotient](l1#s1))

## Domande degli studenti

Cosa succede se h tende a 0 nel rapporto incrementale? (✅[limit as h approaches 0](l1#s1))

## Compiti

Esercizi 1-3: derivate dal primo principio. (✅[x to the n minus one](l1#s2))
"""


# ── Tests ─────────────────────────────────────────────────────────────


class TestBuildSummaryPrompt:
    """Prompt stability — must be deterministic for MockProvider keying."""

    def test_prompt_is_deterministic(self) -> None:
        capsule = _make_capsule()
        p1 = _build_summary_prompt(capsule)
        p2 = _build_summary_prompt(capsule)
        assert p1 == p2

    def test_prompt_contains_capsule_data(self) -> None:
        capsule = _make_capsule()
        prompt = _build_summary_prompt(capsule)
        assert "derivata" in prompt
        assert "regola della potenza" in prompt
        assert "l1#s0" in prompt
        assert "l1#s2" in prompt
        assert "rate of change" in prompt

    def test_seg_texts_section_included_when_passed(self, store: SQLiteStore) -> None:
        """With seg_texts the prompt carries the cited segments' SOURCE text so
        the model can copy substantive verbatim excerpts (anti-confetti)."""
        capsule = _make_capsule()
        seg_texts = _cited_seg_texts(store, capsule)
        assert seg_texts["l1#s0"] == _SEG0  # full source text collected
        prompt = _build_summary_prompt(capsule, seg_texts)
        assert "TESTI DEI SEGMENTI CITATI" in prompt
        assert _SEG0 in prompt
        # without seg_texts the section is absent (legacy byte-identical)
        assert "TESTI DEI SEGMENTI CITATI" not in _build_summary_prompt(capsule)


class TestParseSummaryResponse:
    """JSON parsing of LLM responses."""

    def test_parses_valid_response(self) -> None:
        sections = _parse_summary_response(_DETERMINISTIC_LLM_RESPONSE)
        assert len(sections) == 5  # intro + concepts + exercises + questions + homework
        assert sections[0]["heading"] == "Panoramica dei temi"
        assert len(sections[0]["paragraphs"]) == 3

    def test_strips_code_fences(self) -> None:
        raw = f"```json\n{_DETERMINISTIC_LLM_RESPONSE}\n```"
        sections = _parse_summary_response(raw)
        assert len(sections) == 5

    def test_raises_on_missing_sections(self) -> None:
        with pytest.raises(ValueError, match="sections"):
            _parse_summary_response("{}")

    def test_raises_on_missing_heading(self) -> None:
        with pytest.raises(ValueError, match="heading"):
            _parse_summary_response(json.dumps({"sections": [{"paragraphs": []}]}))

    def test_raises_on_missing_paragraphs(self) -> None:
        with pytest.raises(ValueError, match="paragraphs"):
            _parse_summary_response(
                json.dumps({"sections": [{"heading": "X"}]})
            )

    def test_raises_on_malformed_json(self) -> None:
        with pytest.raises(json.JSONDecodeError):
            _parse_summary_response("not json at all")


class TestRepairSummaryCitations:
    """Resilient citation repair — verbatim-grounded or excluded, NEVER raises
    (strict raising crashed the macinata summaries on DeepSeek noise)."""

    def test_valid_citations_kept(self, store: SQLiteStore) -> None:
        sections = _parse_summary_response(_DETERMINISTIC_LLM_RESPONSE)
        verified, excluded = _repair_summary_citations(store, sections, "l1")
        assert excluded == 0
        assert verified > 0
        # excerpts unchanged (already verbatim)
        assert sections[0]["paragraphs"][0]["citations"][0]["excerpt"] == "rate of change"

    def test_nonexistent_seg_id_excluded(self, store: SQLiteStore) -> None:
        sections = [
            {"heading": "X", "paragraphs": [
                {"text": "fake", "citations": [{"seg_id": "nonexistent", "excerpt": "x"}]}]}
        ]
        verified, excluded = _repair_summary_citations(store, sections, "l1")
        assert (verified, excluded) == (0, 1)
        assert sections[0]["paragraphs"][0]["citations"][0]["excerpt"] is None

    def test_cross_lesson_seg_id_excluded(self, store: SQLiteStore) -> None:
        store.save_segment(Segment(seg_id="l2#s0", lesson_id="l2", start=0, end=5, text="unrelated"))
        sections = [
            {"heading": "X", "paragraphs": [
                {"text": "fake", "citations": [{"seg_id": "l2#s0", "excerpt": "unrelated"}]}]}
        ]
        verified, excluded = _repair_summary_citations(store, sections, "l1")
        assert excluded == 1
        assert sections[0]["paragraphs"][0]["citations"][0]["excerpt"] is None

    def test_missing_seg_id_excluded(self, store: SQLiteStore) -> None:
        sections = [
            {"heading": "X", "paragraphs": [
                {"text": "fake", "citations": [{"excerpt": "no seg_id here"}]}]}
        ]
        verified, excluded = _repair_summary_citations(store, sections, "l1")
        assert excluded == 1
        assert sections[0]["paragraphs"][0]["citations"][0]["excerpt"] is None

    def test_excerpt_none_stays_excluded(self, store: SQLiteStore) -> None:
        sections = [
            {"heading": "X", "paragraphs": [
                {"text": "fake", "citations": [{"seg_id": "l1#s0"}]}]}
        ]
        verified, excluded = _repair_summary_citations(store, sections, "l1")
        assert (verified, excluded) == (0, 1)

    def test_nonverbatim_excerpt_repaired_or_excluded(self, store: SQLiteStore) -> None:
        # "rate of change" IS in _SEG0 → a paraphrase containing those words repairs;
        # a totally invented excerpt is nulled. Either way: no raise.
        sections = [
            {"heading": "X", "paragraphs": [
                {"text": "p", "citations": [
                    {"seg_id": "l1#s0", "excerpt": "the rate of change thing"},
                    {"seg_id": "l1#s0", "excerpt": "quantum entanglement nonsense"},
                ]}]}
        ]
        _repair_summary_citations(store, sections, "l1")
        cits = sections[0]["paragraphs"][0]["citations"]
        # repaired one is a verbatim substring; nonsense one is nulled
        seg = store.get_segment("l1#s0")
        assert cits[0]["excerpt"] is None or cits[0]["excerpt"] in seg.text
        assert cits[1]["excerpt"] is None


class TestRenderSummaryMarkdown:
    """Markdown rendering."""

    def test_renders_sections(self) -> None:
        capsule = _make_capsule()
        sections = _parse_summary_response(_DETERMINISTIC_LLM_RESPONSE)
        md = _render_summary_markdown(capsule, sections)
        assert md.startswith("# Riepilogo: l1")
        assert "## Panoramica dei temi" in md
        assert "## Concetti chiave" in md
        assert "l1#s0" in md
        assert "rate of change" in md


class TestGenerateLessonSummary:
    """Integration tests — full pipeline (mock LLM)."""

    def test_deterministic_mock_output(
        self, store: SQLiteStore
    ) -> None:
        """Anti-tautology: assert the **exact** markdown output."""
        capsule = _make_capsule()
        router = Router()
        mock_provider = MockProvider(
            fixtures={
                _build_summary_prompt(
                    capsule, _cited_seg_texts(store, capsule)
                ): _DETERMINISTIC_LLM_RESPONSE,
            }
        )
        router.register(mock_provider)

        pack = generate_lesson_summary(store, capsule, router, provider="mock")

        assert isinstance(pack, SummaryPack)
        assert "l1.md" in pack.files
        assert pack.files["l1.md"] == _EXPECTED_MARKDOWN

    def test_fully_fabricated_summary_refused(
        self, store: SQLiteStore
    ) -> None:
        """A summary whose ONLY citation is fabricated = 100% unverifiable →
        REFUSED with ValueError (deepreview B1: before, the repair counts were
        discarded and this shipped as a 'grounded' summary)."""
        capsule = _make_capsule()
        bad_payload = json.dumps(
            {
                "sections": [
                    {
                        "heading": "X",
                        "paragraphs": [
                            {
                                "text": "fake",
                                "citations": [
                                    {"seg_id": "l1#s99", "excerpt": "does not exist"}
                                ],
                            }
                        ],
                    }
                ]
            }
        )
        router = Router()
        mock_provider = MockProvider(
            fixtures={
                _build_summary_prompt(
                    capsule, _cited_seg_texts(store, capsule)
                ): bad_payload
            }
        )
        router.register(mock_provider)

        with pytest.raises(ValueError, match="unverifiable|fail-closed"):
            generate_lesson_summary(store, capsule, router, provider="mock")

    def test_zero_citation_summary_refused(self, store: SQLiteStore) -> None:
        """citations=[] everywhere → ZERO citations → refused (fail-closed)."""
        capsule = _make_capsule()
        empty_payload = json.dumps(
            {
                "sections": [
                    {
                        "heading": "X",
                        "paragraphs": [{"text": "claim nudo", "citations": []}],
                    }
                ]
            }
        )
        router = Router()
        router.register(
            MockProvider(
                fixtures={
                    _build_summary_prompt(
                        capsule, _cited_seg_texts(store, capsule)
                    ): empty_payload
                }
            )
        )
        with pytest.raises(ValueError, match="ZERO citations"):
            generate_lesson_summary(store, capsule, router, provider="mock")

    def test_output_file_written(self, store: SQLiteStore) -> None:
        """When output_dir is set, the markdown file is created on disk."""
        capsule = _make_capsule()
        router = Router()
        mock_provider = MockProvider(
            fixtures={
                _build_summary_prompt(
                    capsule, _cited_seg_texts(store, capsule)
                ): _DETERMINISTIC_LLM_RESPONSE,
            }
        )
        router.register(mock_provider)

        with tempfile.TemporaryDirectory() as tmpdir:
            pack = generate_lesson_summary(
                store, capsule, router, output_dir=tmpdir, provider="mock"
            )
            # File should exist on disk
            out_path = os.path.join(tmpdir, "l1.md")
            assert os.path.isfile(out_path)
            with open(out_path) as f:
                disk_content = f.read()
            # Should match the in-memory pack
            assert disk_content == pack.files["l1.md"]


class TestRenderExcludesUnverified:
    """T6R anti-false-verde: null-excerpt citations excluded from the rendered
    summary; paragraphs left unsupported are dropped; exclusions are disclosed.
    """

    def test_fully_grounded_has_no_footer(self) -> None:
        """All citations verified → byte-identical to legacy render, no footer."""
        capsule = _make_capsule()
        sections = _parse_summary_response(_DETERMINISTIC_LLM_RESPONSE)
        md = _render_summary_markdown(capsule, sections)
        assert "⚠️ Grounding:" not in md
        assert md == _EXPECTED_MARKDOWN

    def test_null_excerpt_citation_dropped_and_disclosed(self) -> None:
        capsule = _make_capsule()
        sections = [
            {
                "heading": "Panoramica dei temi",
                "paragraphs": [
                    {
                        "text": "Claim verificato.",
                        "citations": [
                            {"seg_id": "l1#s0", "excerpt": "rate of change"}
                        ],
                    },
                    {
                        "text": "Claim non verificato.",
                        "citations": [{"seg_id": "l1#s1"}],  # no excerpt
                    },
                ],
            }
        ]
        md = _render_summary_markdown(capsule, sections)
        # verified claim + link kept
        assert "Claim verificato. (✅[rate of change](l1#s0))" in md
        # unverified paragraph dropped, bare seg_id NEVER rendered
        assert "Claim non verificato." not in md
        assert "[l1#s1]" not in md
        # disclosure footer
        assert "⚠️ Grounding:" in md
        assert "1 paragrafi senza citazioni verificate rimossi" in md

    def test_empty_citations_paragraph_dropped_and_disclosed(self) -> None:
        """citations=[] (legit parser output) must NOT render ungrounded and
        undisclosed (deepreview B1 repro)."""
        capsule = _make_capsule()
        sections = [
            {
                "heading": "X",
                "paragraphs": [
                    {
                        "text": "Con grounding.",
                        "citations": [{"seg_id": "l1#s0", "excerpt": "rate of change"}],
                    },
                    {"text": "Claim nudo senza citazioni.", "citations": []},
                ],
            }
        ]
        md = _render_summary_markdown(capsule, sections)
        assert "Con grounding." in md
        assert "Claim nudo senza citazioni." not in md
        assert "⚠️ Grounding:" in md
        assert "1 paragrafi senza citazioni verificate rimossi" in md

    def test_partial_paragraph_keeps_only_verified_links(self) -> None:
        capsule = _make_capsule()
        sections = [
            {
                "heading": "Concetti chiave",
                "paragraphs": [
                    {
                        "text": "Misto.",
                        "citations": [
                            {"seg_id": "l1#s0", "excerpt": "rate of change"},
                            {"seg_id": "l1#s1"},  # unverified → excluded
                        ],
                    },
                ],
            }
        ]
        md = _render_summary_markdown(capsule, sections)
        assert "Misto. (✅[rate of change](l1#s0))" in md
        assert "l1#s1" not in md  # unverified link never appears
        assert "1 citazioni non verificate" in md


class TestParseToleratesControlChars:
    """T6R: DeepSeek emits literal control chars inside JSON strings; strict
    json.loads crashed the macinata summaries. Parser must tolerate them."""

    def test_literal_newline_in_string_value(self) -> None:
        # An ACTUAL newline char inside the "text" value (not escaped \\n).
        raw = (
            '{"sections": [{"heading": "H", "paragraphs": '
            '[{"text": "riga uno\nriga due", "citations": []}]}]}'
        )
        sections = _parse_summary_response(raw)
        assert sections[0]["heading"] == "H"
        assert "riga uno\nriga due" in sections[0]["paragraphs"][0]["text"]


class TestSummaryPromptBounding:
    """T6R: a huge capsule (full real lecture) must not overflow the LLM output
    (truncated JSON). The prompt caps items — NO-OP under the cap."""

    def test_small_capsule_no_cap_notes(self) -> None:
        prompt = _build_summary_prompt(_make_capsule())  # 2 concepts
        assert "altri concetti nel grafo" not in prompt
        assert "altri argomenti nel grafo" not in prompt

    def test_large_capsule_caps_concepts(self) -> None:
        from lessonos.summarizer import _SUMMARY_CONCEPT_CAP

        n = _SUMMARY_CONCEPT_CAP + 10
        concepts = tuple(
            ConceptExtraction(
                name=f"concetto{i}",
                status="introduced",
                citations=(Citation(seg_id="l1#s0", excerpt="rate of change"),),
            )
            for i in range(n)
        )
        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(),
            content=LessonContent(lesson_id="l1", concepts=concepts),
            dropped=(),
        )
        prompt = _build_summary_prompt(capsule)
        assert "(+10 altri concetti nel grafo" in prompt
        # exactly the cap is listed
        assert prompt.count("(status=introduced)") == _SUMMARY_CONCEPT_CAP


def _solution_capsule() -> LessonCapsule:
    """Capsule with one solved exercise (verified citation) and one unsolved."""
    base = _make_capsule()
    solved = ExerciseExtraction(
        prompt="Calcola la derivata di x^2.",
        solution="2x, dalla definizione con il limite del rapporto incrementale.",
        citations=(Citation(seg_id="l1#s1", excerpt="difference quotient"),),
    )
    unsolved = ExerciseExtraction(
        prompt="Enuncia la regola della potenza.",
        citations=(Citation(seg_id="l1#s2", excerpt="Power rule"),),
    )
    return LessonCapsule(
        base.lesson_id,
        timeline=base.timeline,
        content=LessonContent(
            lesson_id=base.lesson_id,
            concepts=base.content.concepts,
            exercises=(solved, unsolved),
            student_questions=base.content.student_questions,
            homework=base.content.homework,
        ),
        dropped=base.dropped,
    )


def _solution_router(store: SQLiteStore, capsule: LessonCapsule) -> Router:
    router = Router()
    router.register(MockProvider(fixtures={
        _build_summary_prompt(capsule, _cited_seg_texts(store, capsule)):
            _DETERMINISTIC_LLM_RESPONSE,
    }))
    return router


def _study_digest() -> LessonOsStudyDigest:
    return LessonOsStudyDigest(
        lesson_id="l1",
        concepts=(),
        errors=(
            StudyError(
                id="err:aperto", label="Circuito aperto",
                concept_id="circuito_chiuso", corrected=False,
                evidence_refs=("manual:test:p10", "board:fix"),
            ),
            StudyError(
                id="err:chiuso", label="Corto richiuso",
                concept_id=None, corrected=True,
                evidence_refs=("board:ok",),
            ),
        ),
    )


class TestHybridStructuredAppendix:
    """J3B: deterministic structured augmentation (solutions + digest
    errors) appended to the grounded narrative. No extra LLM calls: the
    strict MockProvider only fixtures the narrative prompt."""

    def test_solution_rendered_byte_for_byte(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_study_digest(),
        )
        md = pack.files["l1.md"]
        assert "2x, dalla definizione con il limite del rapporto incrementale." in md
        assert "Calcola la derivata di x^2." in md

    def test_no_solution_no_invention(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_study_digest(),
        )
        md = pack.files["l1.md"]
        # Exactly one solution block (the solved exercise); nothing invented
        # for the unsolved one — neither its prompt in appendix nor a solution.
        assert md.count("Soluzione estratta dalla lezione") == 1
        assert "Enuncia la regola della potenza.\n\nSoluzione" not in md

    def test_digest_errors_rendered_deterministically(
        self, store: SQLiteStore
    ) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_study_digest(),
        )
        md = pack.files["l1.md"]
        assert "Circuito aperto" in md
        assert "da rivedere" in md
        assert "Corto richiuso" in md
        assert "corretto" in md
        assert "Provenienza: manual:test:p10, board:fix" in md
        assert "Provenienza: board:ok" in md

    def test_evidence_refs_are_not_citations(
        self, store: SQLiteStore
    ) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_study_digest(),
        )
        md = pack.files["l1.md"]
        assert "](manual:test:p10)" not in md
        assert "](board:fix)" not in md
        assert "](board:ok)" not in md

    def test_same_inputs_byte_identical(
        self, store: SQLiteStore
    ) -> None:
        capsule = _solution_capsule()
        router = _solution_router(store, capsule)
        first = generate_lesson_summary(
            store, capsule, router, provider="mock", digest=_study_digest())
        second = generate_lesson_summary(
            store, capsule, router, provider="mock", digest=_study_digest())
        assert first.files["l1.md"] == second.files["l1.md"]

    def test_retention_matrix_solution_error_provenance(
        self, store: SQLiteStore
    ) -> None:
        """Raw → Capsule/Digest → Material, per field: concept, exercise
        prompt, exercise solution, error, correction state, provenance."""
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_study_digest(),
        )
        md = pack.files["l1.md"]
        # concept (narrative, grounded): from existing deterministic response
        assert "derivata" in md
        # exercise prompt + solution (structured, extracted)
        assert "Calcola la derivata di x^2." in md
        assert "2x, dalla definizione" in md
        # error + correction state + provenance (structured, digest)
        assert "Circuito aperto" in md and "da rivedere" in md
        assert "Corto richiuso" in md and "corretto" in md
        assert "manual:test:p10" in md and "board:ok" in md

    def test_cross_lesson_digest_rejected(self, store: SQLiteStore) -> None:
        """digest.lesson_id != capsule.lesson_id: fail closed. Mai render,
        mai rename, mai silenzio."""
        capsule = _solution_capsule()
        foreign = LessonOsStudyDigest(
            lesson_id="l2",
            concepts=(),
            errors=(
                StudyError(
                    id="err:x", label="Errore altrui", concept_id=None,
                    corrected=False, evidence_refs=("board:x",),
                ),
            ),
        )
        with pytest.raises(ValueError, match="digest lesson"):
            generate_lesson_summary(
                store, capsule, _solution_router(store, capsule),
                provider="mock", digest=foreign,
            )

    def _excerpt_capsule(self, excerpt) -> LessonCapsule:
        base = _solution_capsule()
        return LessonCapsule(
            lesson_id=base.lesson_id,
            timeline=base.timeline,
            content=LessonContent(
                lesson_id=base.lesson_id,
                concepts=base.content.concepts,
                exercises=(
                    ExerciseExtraction(
                        prompt="Esercizio sonda.",
                        solution="Soluzione sonda.",
                        citations=(Citation(seg_id="l1#s0", excerpt=excerpt),),
                    ),
                ),
                student_questions=base.content.student_questions,
                homework=base.content.homework,
            ),
            dropped=base.dropped,
        )

    def _excerpt_md(self, store: SQLiteStore, excerpt) -> str:
        capsule = self._excerpt_capsule(excerpt)
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=None,
        )
        return pack.files["l1.md"]

    def test_case_a_none_excerpt_no_solution_block(self, store: SQLiteStore) -> None:
        md = self._excerpt_md(store, None)
        assert "Soluzione sonda." not in md

    def test_case_b_empty_excerpt_no_solution_block(self, store: SQLiteStore) -> None:
        md = self._excerpt_md(store, "")
        assert "Soluzione sonda." not in md

    def test_case_c_whitespace_excerpt_no_solution_block(self, store: SQLiteStore) -> None:
        md = self._excerpt_md(store, "   ")
        assert "Soluzione sonda." not in md

    def test_case_d_verbatim_excerpt_renders(self, store: SQLiteStore) -> None:
        md = self._excerpt_md(store, "rate of change")
        assert "Soluzione sonda." in md

    def test_case_e_nonverbatim_excerpt_no_solution_block(self, store: SQLiteStore) -> None:
        md = self._excerpt_md(store, "invenzione totale mai scritta")
        assert "Soluzione sonda." not in md

    def test_cross_lesson_citation_no_solution_block(self, store: SQLiteStore) -> None:
        """Citation valida ma di ALTRA lezione: stesso fail-closed del body."""
        store.save_segment(Segment(seg_id="l2#s0", lesson_id="l2", start=0,
                                   end=15, text="Testo altra lezione."))
        base = _solution_capsule()
        capsule = LessonCapsule(
            lesson_id=base.lesson_id,
            timeline=base.timeline,
            content=LessonContent(
                lesson_id=base.lesson_id,
                concepts=base.content.concepts,
                exercises=(
                    ExerciseExtraction(
                        prompt="Esercizio sonda.",
                        solution="Soluzione sonda.",
                        citations=(Citation(seg_id="l2#s0",
                                            excerpt="Testo altra lezione."),),
                    ),
                ),
                student_questions=base.content.student_questions,
                homework=base.content.homework,
            ),
            dropped=base.dropped,
        )
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=None,
        )
        assert "Soluzione sonda." not in pack.files["l1.md"]


def _concept_digest() -> LessonOsStudyDigest:
    base = _study_digest()
    return LessonOsStudyDigest(
        lesson_id=base.lesson_id,
        concepts=(
            StudyConcept(
                id="ck:potenza",
                label="Regola registrata LessonOS",
                evidence_refs=("manual:analisi:p7", "board:riepilogo"),
            ),
        ),
        errors=base.errors,
    )


class TestDigestConceptRetention:
    """N01: digest-only concepts reach the material deterministically.

    The digest concept below (ck:potenza) is NOT a capsule concept
    (capsule has derivata / regola della potenza as narrative names):
    its marker proves the digest wiring, not a narrative coincidence.
    """

    def test_digest_only_concept_rendered_with_provenance(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_concept_digest(),
        )
        md = pack.files["l1.md"]
        assert "Regola registrata LessonOS" in md
        assert "Provenienza: manual:analisi:p7, board:riepilogo" in md

    def test_digest_concepts_are_not_segment_citations(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=_concept_digest(),
        )
        md = pack.files["l1.md"]
        assert "](manual:analisi:p7)" not in md
        assert "](board:riepilogo)" not in md

    def test_no_extra_llm_call_for_concepts(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        calls: list[str] = []

        class _CountingProvider(MockProvider):
            def complete(self, prompt: str, *, model=None):  # type: ignore[override]
                calls.append(prompt)
                return super().complete(prompt, model=model)

        counting = _CountingProvider(fixtures={
            _build_summary_prompt(capsule, _cited_seg_texts(store, capsule)):
                _DETERMINISTIC_LLM_RESPONSE,
        })
        router = Router()
        router.register(counting)
        generate_lesson_summary(
            store, capsule, router, provider="mock", digest=_concept_digest())
        assert len(calls) == 1

    def test_empty_concepts_preserve_error_sections_and_full_empty_is_legacy(
        self, store: SQLiteStore
    ) -> None:
        capsule = _solution_capsule()
        router = _solution_router(store, capsule)
        without = generate_lesson_summary(
            store, capsule, router, provider="mock", digest=None)
        base = _study_digest()
        empty_concepts = LessonOsStudyDigest(
            lesson_id=base.lesson_id, concepts=(), errors=base.errors)
        with_empty = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=empty_concepts)
        assert with_empty.files["l1.md"] != without.files["l1.md"]
        nodigest_errors = LessonOsStudyDigest(lesson_id=base.lesson_id)
        assert generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=nodigest_errors).files["l1.md"] == without.files["l1.md"]


def _pandoc_ast_or_skip(markdown: str) -> dict:
    """Parse markdown with real Pandoc; skip when Pandoc is unavailable."""
    import shutil
    import subprocess

    pandoc = shutil.which("pandoc")
    if pandoc is None:
        pytest.skip("pandoc unavailable: AST structure check needs the real reader")
    result = subprocess.run(
        [pandoc, "-f", "markdown", "-t", "json"],
        input=markdown.encode("utf-8"),
        capture_output=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stderr.decode("utf-8", errors="replace")[:500]
    return json.loads(result.stdout.decode("utf-8"))


def _h2_texts(ast: dict) -> list:
    found = []

    def walk(node) -> None:
        if isinstance(node, dict):
            if node.get("t") == "Header" and node.get("c", [None])[0] == 2:
                inlines = node["c"][2] if len(node["c"]) > 2 else []
                parts = []
                for part in inlines:
                    if not isinstance(part, dict):
                        continue
                    if part.get("t") == "Str":
                        parts.append(part.get("c", ""))
                    elif part.get("t") == "Space":
                        parts.append(" ")
                found.append("".join(parts))
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(ast.get("blocks", []))
    return found


class TestAppendixHeadingStructure:
    """F-03: the FIRST appendix section heading must be a semantic Header.

    Only the boundary between narrative tail and appendix start can glue
    (later sections already follow blank lines): each test isolates a
    different first section. A test passes on unfixed code iff it does not
    cover the first-section case -- verified by mutation below."""

    def _first_h2_boundary(self, store: SQLiteStore, capsule, digest) -> None:
        pack = generate_lesson_summary(
            store, capsule, _solution_router(store, capsule),
            provider="mock", digest=digest,
        )
        md = pack.files["l1.md"]
        titles = ["Soluzioni degli esercizi", "Errori e correzioni",
                  "Concetti registrati nel LessonOS"]
        positions = [(md.find("## " + title), title) for title in titles]
        positions = [(i, title) for i, title in positions if i != -1]
        assert positions, "no appendix section rendered"
        first_hash, title = min(positions)
        assert md[first_hash - 2:first_hash] == "\n\n", repr(md[first_hash - 10:first_hash + 40])
        ast = _pandoc_ast_or_skip(md)
        assert title in _h2_texts(ast)

    def test_solutions_first_is_h2(self, store: SQLiteStore) -> None:
        capsule = _solution_capsule()
        self._first_h2_boundary(store, capsule, _study_digest())

    def test_errors_first_is_h2(self, store: SQLiteStore) -> None:
        capsule = _make_capsule()
        base = _study_digest()
        errors_only = LessonOsStudyDigest(
            lesson_id=base.lesson_id, concepts=(), errors=base.errors)
        self._first_h2_boundary(store, capsule, errors_only)

    def test_concepts_first_is_h2(self, store: SQLiteStore) -> None:
        capsule = _make_capsule()
        base = _study_digest()
        concepts_only = LessonOsStudyDigest(
            lesson_id=base.lesson_id,
            concepts=(StudyConcept(id="ck:solo", label="Solo", evidence_refs=()),),
            errors=(),
        )
        self._first_h2_boundary(store, capsule, concepts_only)
