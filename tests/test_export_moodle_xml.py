"""Tests for P1: Moodle XML Quiz Exporter (COORDINATION.md §18).

Test categories:
  1. export_moodle_xml basic structure (XML root, question category)
  2. Quiz question atom types → Moodle question types
  3. Multiple choice question export (single + multiple answer)
  4. Short answer question export
  5. Essay question export
  6. Output to disk (write real files)
  7. Edge cases: no quiz atoms, empty modules ValueError, AI-only excluded
  8. Formatting helpers: _escape_xml, _question_type
"""

from __future__ import annotations

import os
import xml.etree.ElementTree as ET

import pytest

from lessonos.capsule.extraction import Citation
from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint
from lessonos.export.moodle_xml import (
    MoodleXMLQuizPack,
    export_moodle_xml,
    _escape_xml,
    _question_type,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def simple_blueprint() -> CourseBlueprint:
    """Blueprint con 2 moduli, nessun atomo."""
    return CourseBlueprint(
        title="Analisi Matematica",
        modules=(
            ModuleBlueprint(
                title="Derivate",
                lesson_ids=("l1_intro_derivatives", "l2_derivative_rules"),
            ),
            ModuleBlueprint(
                title="Integrali",
                lesson_ids=("l3_integrals",),
            ),
        ),
        audience="Studenti universitari",
        level="intermediate",
        source_lessons=(
            "l1_intro_derivatives",
            "l2_derivative_rules",
            "l3_integrals",
        ),
    )


def _make_atom(
    atom_id: str = "l1/quiz_question/0",
    *,
    body: str = "What is the derivative of x^2?",
    atom_type: str = "quiz_question",
    lesson_id: str = "l1",
    source_refs: tuple = (),
    choices: tuple[str, ...] | None = None,
    correct_choice: int | None = None,
    multiple_answer: bool = False,
    is_essay: bool = False,
) -> ContentAtom:
    if not source_refs:
        source_refs = (Citation(seg_id="l1s1", excerpt="derivative"),)
    body_meta = body
    if choices is not None:
        body_meta += "\n__choices__:" + ";".join(choices)
    if correct_choice is not None:
        body_meta += "\n__correct__:" + str(correct_choice)
    if multiple_answer:
        body_meta += "\n__multiple__:1"
    if is_essay:
        body_meta += "\n__correct__:-2"
    return ContentAtom(
        atom_id=atom_id,
        atom_type=atom_type,
        lesson_id=lesson_id,
        body=body_meta,
        source_refs=source_refs,
    )


@pytest.fixture
def quiz_atoms() -> dict[str, tuple[ContentAtom, ...]]:
    """Atoms with quiz questions across 2 lessons."""
    return {
        "l1_intro_derivatives": (
            _make_atom(
                atom_id="l1/quiz_question/0",
                body="What is the derivative of x^2?",
                choices=("2x", "x", "2"),
                correct_choice=0,
                lesson_id="l1_intro_derivatives",
            ),
            _make_atom(
                atom_id="l1/quiz_question/1",
                body="Define a limit.",
                lesson_id="l1_intro_derivatives",
            ),
        ),
        "l3_integrals": (
            _make_atom(
                atom_id="l3/quiz_question/0",
                body="What is the integral of 2x?",
                choices=("x^2+C", "2", "x^2"),
                correct_choice=0,
                lesson_id="l3_integrals",
            ),
            _make_atom(
                atom_id="l3/quiz_question/1",
                body="Explain the Fundamental Theorem of Calculus.",
                lesson_id="l3_integrals",
            ),
        ),
    }


# ── Helper: parse XML safely ───────────────────────────────────────────────


def _parse_xml(content: str) -> ET.Element:
    """Parse XML string into ElementTree root."""
    return ET.fromstring(content)


# ── Tests ─────────────────────────────────────────────────────────────────────


class TestP1MoodleXMLExporter:
    """P1: Moodle XML Quiz Exporter — formato standard quiz/question."""

    def test_export_basic_structure(self, simple_blueprint):
        """Un blueprint vuoto (nessun atomo) restituisce un pack con XML radice vuoto."""
        pack = export_moodle_xml(simple_blueprint)
        assert isinstance(pack, MoodleXMLQuizPack)
        # Con atomi=None e nessun quiz, produce un file quiz.xml radice
        assert "quiz.xml" in pack.files
        root = _parse_xml(pack.files["quiz.xml"])
        assert root.tag == "quiz"

    def test_export_quiz_atoms(self, simple_blueprint, quiz_atoms):
        """Quiz questions esportate come XML question/category."""
        pack = export_moodle_xml(simple_blueprint, atoms=quiz_atoms)
        assert "quiz.xml" in pack.files
        root = _parse_xml(pack.files["quiz.xml"])

        # Dovrebbe avere 2 categorie (Derivate, Integrali) + domande
        categories = root.findall(".//question[@type='category']")
        assert len(categories) == 2, (
            f"Expected 2 category questions, got {len(categories)}"
        )

        # Domande non-category
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]
        assert len(questions) == 4, (
            f"Expected 4 quiz questions, got {len(questions)}"
        )

    def test_multiple_choice_single(self, simple_blueprint):
        """Quiz_question atom with choices → multichoice single."""
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="What is 2+2?",
                    choices=("3", "4", "5"),
                    correct_choice=1,
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]

        assert len(questions) == 1
        q = questions[0]
        assert q.get("type") == "multichoice"

        # Verifica singola risposta (single=True)
        single_elem = q.find(".//single")
        assert single_elem is not None
        assert single_elem.text == "true"

        # Verifica 3 answer elements
        answers = q.findall(".//answer")
        assert len(answers) == 3

        # La risposta corretta (index 1 = "4") ha fraction=100
        correct_answer = answers[1]
        assert correct_answer.get("fraction") == "100"
        assert correct_answer.find("text").text == "4"

        # Le altre hanno fraction=0
        assert answers[0].get("fraction") == "0"
        assert answers[2].get("fraction") == "0"

    def test_short_answer(self, simple_blueprint):
        """Quiz_question without choices → shortanswer."""
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="What is the derivative of x^2?",
                    lesson_id="l1",
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]

        assert len(questions) == 1
        q = questions[0]
        assert q.get("type") == "shortanswer", (
            f"Expected shortanswer, got {q.get('type')}"
        )

        # Il body della domanda
        name_text = q.find(".//name/text")
        assert name_text is not None
        assert "derivative" in name_text.text.lower()

    def test_essay_question(self, simple_blueprint):
        """Quiz_question with empty choices and multiple_answer=2 → essay."""
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="Explain the concept of a limit.",
                    lesson_id="l1",
                    is_essay=True,
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]

        assert len(questions) == 1
        q = questions[0]
        assert q.get("type") == "essay", (
            f"Expected essay, got {q.get('type')}"
        )

    def test_multiple_choice_multiple(self, simple_blueprint):
        """Quiz_question with choices and multiple_answer → multichoice single=false."""
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="Which are even numbers?",
                    choices=("2", "3", "4", "5"),
                    correct_choice=0,
                    multiple_answer=True,
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]

        assert len(questions) == 1
        q = questions[0]
        assert q.get("type") == "multichoice"

        # single=false per multiple answer
        single_elem = q.find(".//single")
        assert single_elem is not None
        assert single_elem.text == "false"

    def test_orphan_atoms_to_other_category(self, simple_blueprint):
        """Quiz atoms con lesson_id non associato a nessun modulo → categoria 'Other'."""
        atoms = {
            "orphan_lesson": (
                _make_atom(
                    atom_id="orphan/quiz_question/0",
                    body="Orphan question",
                    choices=("A", "B"),
                    correct_choice=0,
                    lesson_id="orphan_lesson",
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])

        # Dovrebbe avere 3 categorie: Derivate, Integrali, Other
        categories = root.findall(".//question[@type='category']")
        assert len(categories) == 3, (
            f"Expected 3 categories (2 modules + 1 Other), got {len(categories)}"
        )
        category_texts = []
        for cat in categories:
            text_elem = cat.find(".//category/text")
            if text_elem is not None:
                category_texts.append(text_elem.text)

        assert any("Other" in c for c in category_texts), (
            f"Expected 'Other' category, got {category_texts}"
        )

        # La domanda orfana è esportata
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]
        assert len(questions) == 1

    def test_output_to_disk(self, simple_blueprint, quiz_atoms, tmp_path):
        """Export scrive file XML su disco."""
        out_dir = str(tmp_path)
        pack = export_moodle_xml(simple_blueprint, atoms=quiz_atoms, output_dir=out_dir)

        assert "quiz.xml" in pack.files
        xml_path = os.path.join(out_dir, "quiz.xml")
        assert os.path.isfile(xml_path)

        # Verifica che sia XML valido
        with open(xml_path) as f:
            root = _parse_xml(f.read())
        assert root.tag == "quiz"

    def test_no_quiz_atoms_no_categories(self, simple_blueprint):
        """Blueprint con atomi ma nessun quiz_question → solo category vuota."""
        atoms = {
            "l1": (
                ContentAtom(
                    atom_id="l1/exercise/0",
                    atom_type="exercise",
                    lesson_id="l1",
                    body="Do this exercise",
                    source_refs=(Citation(seg_id="l1s1", excerpt="exercise"),),
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])

        # Solo categorie, nessuna domanda quiz
        categories = root.findall(".//question[@type='category']")
        assert len(categories) == 2
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]
        assert len(questions) == 0

    def test_empty_modules_raises(self):
        """Blueprint senza moduli → ValueError."""
        blueprint = CourseBlueprint(
            title="Vuoto",
            modules=(),
            source_lessons=(),
        )
        with pytest.raises(ValueError, match="no modules"):
            export_moodle_xml(blueprint)

    def test_ai_only_atoms_excluded(self, simple_blueprint):
        """Atomi con explicit_ai_inference=True sono esclusi salvo flag."""
        atoms = {
            "l1": (
                ContentAtom(
                    atom_id="l1/quiz_question/0",
                    atom_type="quiz_question",
                    lesson_id="l1",
                    body="AI inferred question?",
                    source_refs=(),
                    explicit_ai_inference=True,
                ),
                _make_atom(
                    atom_id="l1/quiz_question/1",
                    body="Real question?\n__choices__:Yes;No\n__correct__:0",
                ),
            ),
        }
        # Default: AI atoms excluded
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]
        assert len(questions) == 1, (
            f"Expected 1 real question, got {len(questions)}"
        )

        # Con include_ai_atoms=True: include tutto
        pack2 = export_moodle_xml(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        root2 = _parse_xml(pack2.files["quiz.xml"])
        questions2 = [q for q in root2.findall(".//question") if q.get("type") != "category"]
        assert len(questions2) == 2

    def test_category_names_from_modules(self, simple_blueprint, quiz_atoms):
        """Categorie Moodle XML usano i titoli dei moduli."""
        pack = export_moodle_xml(simple_blueprint, atoms=quiz_atoms)
        root = _parse_xml(pack.files["quiz.xml"])

        categories = root.findall(".//question[@type='category']")
        category_texts = []
        for cat in categories:
            text_elem = cat.find(".//category/text")
            if text_elem is not None:
                category_texts.append(text_elem.text)

        assert any("Derivate" in c for c in category_texts), (
            f"Expected 'Derivate' category, got {category_texts}"
        )
        assert any("Integrali" in c for c in category_texts), (
            f"Expected 'Integrali' category, got {category_texts}"
        )

    def test_special_chars_not_double_escaped(self, simple_blueprint):
        """I caratteri XML speciali (< > &) round-trippano intatti.

        Regressione: il body veniva escapato a mano e poi di nuovo da
        ElementTree, producendo `&amp;lt;` invece di `&lt;` — Moodle
        mostrava letteralmente le entity allo studente. Il body sotto
        contiene `<`, `>`, `&` sia nel testo della domanda sia in una
        choice; dopo il parse il testo deve essere esattamente l'originale.
        """
        atoms = {
            "l1_intro_derivatives": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="Risolvi x < 5 & y > 3",
                    choices=("a < b", "c & d", "normale"),
                    correct_choice=0,
                    lesson_id="l1_intro_derivatives",
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])

        question_text = root.find(".//questiontext/text")
        assert question_text is not None
        assert question_text.text == "Risolvi x < 5 & y > 3"

        answer_texts = [
            a.text for a in root.findall(".//answer/text")
        ]
        assert "a < b" in answer_texts
        assert "c & d" in answer_texts

    def test_question_name_and_text(self, simple_blueprint):
        """Ogni domanda ha name/text e questiontext."""
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/quiz_question/0",
                    body="What is 2+2?",
                    choices=("3", "4", "5"),
                    correct_choice=1,
                    lesson_id="l1",
                ),
            ),
        }
        pack = export_moodle_xml(simple_blueprint, atoms=atoms)
        root = _parse_xml(pack.files["quiz.xml"])
        questions = [q for q in root.findall(".//question") if q.get("type") != "category"]

        assert len(questions) == 1
        q = questions[0]

        name_text = q.find(".//name/text")
        assert name_text is not None and name_text.text
        assert "2+2" in name_text.text

        question_text = q.find(".//questiontext/text")
        assert question_text is not None and question_text.text
        assert "2+2" in question_text.text


# ── Helper tests ─────────────────────────────────────────────────────────────


class TestHelpers:
    """Test helper functions."""

    def test_question_type_multichoice(self):
        """_question_type returns multichoice per domande con choices."""
        assert _question_type(True, 1) == "multichoice"

    def test_question_type_shortanswer(self):
        """_question_type returns shortanswer per domande aperte semplici."""
        assert _question_type(False, -1) == "shortanswer"

    def test_question_type_essay(self):
        """_question_type returns essay per domande aperte con flag essay."""
        assert _question_type(False, -2) == "essay"
