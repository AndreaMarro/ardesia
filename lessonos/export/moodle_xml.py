"""Moodle XML Quiz Exporter — render CourseBlueprint + Quiz ContentAtoms → Moodle XML (P1).

Moodle XML format (https://docs.moodle.org/en/Moodle_XML_format) is the standard
format for importing quiz questions into Moodle. Supports:

  - Category questions (course/module categories)
  - multichoice (single & multiple answers)
  - shortanswer
  - essay

Quiz question atoms embed choices and correct answers in the body as metadata
lines (__choices__:, __correct__:, __multiple__:) to separate body from options
without changing the ContentAtom schema.

COORDINATION.md §18: P1 — Moodle XML quiz export, deterministic, no-LLM.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Dict, Tuple
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape as _escape_xml

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint

# Moodle question types
_QUESTION_TYPE_MULTICHOICE = "multichoice"
_QUESTION_TYPE_SHORTANSWER = "shortanswer"
_QUESTION_TYPE_ESSAY = "essay"

# Metadata prefixes parsed from atom body
_META_CHOICES = "__choices__:"
_META_CORRECT = "__correct__:"
_META_MULTIPLE = "__multiple__:"


def _question_type(has_choices: bool, correct_index: int) -> str:
    """Determina il tipo Moodle in base ai metadati.

    Args:
        has_choices: Se la domanda ha choices definite.
        correct_index: Indice della risposta corretta (-1 = aperta).
            - Valori speciali: -2 = essay, -1 = shortanswer.

    Returns:
        Uno dei tipi: multichoice, shortanswer, essay.
    """
    if has_choices:
        return _QUESTION_TYPE_MULTICHOICE
    if correct_index == -2:
        return _QUESTION_TYPE_ESSAY
    return _QUESTION_TYPE_SHORTANSWER


def _parse_quiz_body(body: str) -> tuple[str, list[str], int, bool]:
    """Parsa il body di un quiz_question atom in corpo + metadati.

    Formato body:
        <question text>
        __choices__:opt1;opt2;opt3
        __correct__:<0-based index or -1 for open>
        __multiple__:1 (optional, per multichoice multiple answer)

    I metadata DEVE essere su linee separate, dopo il testo della
    domanda. Il corpo della domanda non deve contenere __choices__:
    come parte del testo naturale.

    Returns:
        Tuple (question_text, choices, correct_index, multiple_answer).
    """
    lines = body.split("\n")
    question_lines: list[str] = []
    choices: list[str] = []
    correct_index = -1
    multiple_answer = False

    for line in lines:
        if line.startswith(_META_CHOICES):
            raw = line[len(_META_CHOICES):]
            if raw.strip():
                choices = [c.strip() for c in raw.split(";") if c.strip()]
        elif line.startswith(_META_CORRECT):
            try:
                correct_index = int(line[len(_META_CORRECT):].strip())
            except ValueError:
                correct_index = -1
        elif line.startswith(_META_MULTIPLE):
            multiple_answer = line[len(_META_MULTIPLE):].strip() == "1"
        else:
            question_lines.append(line)

    return "\n".join(question_lines).strip(), choices, correct_index, multiple_answer


def _build_category_xml(category_path: str, parent: str = "/") -> ET.Element:
    """Costruisce un elemento XML 'question type="category"'.

    Args:
        category_path: Percorso categoria Moodle (es. ``$course$/Modulo A``).
        parent: Moodle parent category path (default: ``/``).

    Returns:
        Elemento XML question con sub-element category.
    """
    q = ET.Element("question", type="category")
    cat = ET.SubElement(q, "category")
    text = ET.SubElement(cat, "text")
    text.text = f"$course$/{category_path.lstrip('/')}"
    info = ET.SubElement(q, "info", format="html")
    info_text = ET.SubElement(info, "text")
    info_text.text = f"Questions for module: {category_path}"
    return q


def _build_multichoice_xml(
    question_text: str,
    choices: list[str],
    correct_index: int,
    multiple_answer: bool,
) -> ET.Element:
    """Costruisce elemento XML per domanda multichoice Moodle.

    Args:
        question_text: Testo della domanda.
        choices: Lista opzioni. DEVE avere almeno 1 elemento.
        correct_index: Indice 0-based dell'opzione corretta.
            DEVE essere in range [0, len(choices)).
        multiple_answer: Se True, domanda a risposta multipla.

    Returns:
        Elemento XML question type='multichoice'.

    Raises:
        ValueError: Se choices e vuota o correct_index e fuori range.
    """
    if not choices:
        raise ValueError("multichoice question must have at least 1 choice")
    if correct_index < 0 or correct_index >= len(choices):
        raise ValueError(
            f"correct_index {correct_index} out of range "
            f"for {len(choices)} choices"
        )

    q = ET.Element("question", type="multichoice")

    # Name
    name = ET.SubElement(q, "name")
    name_text = ET.SubElement(name, "text")
    # Tronca a 80 caratteri per Moodle
    name_text.text = question_text[:80]

    # Question text
    qt = ET.SubElement(q, "questiontext", format="html")
    qt_text = ET.SubElement(qt, "text")
    qt_text.text = question_text

    # Default grade
    defaultgrade = ET.SubElement(q, "defaultgrade")
    defaultgrade.text = "1"
    penalty = ET.SubElement(q, "penalty")
    penalty.text = "0.3333333"
    hidden = ET.SubElement(q, "hidden")
    hidden.text = "0"
    idnumber = ET.SubElement(q, "idnumber")
    idnumber.text = ""

    # Single / Multiple
    single = ET.SubElement(q, "single")
    single.text = "false" if multiple_answer else "true"

    # Shuffle answers
    shuffle = ET.SubElement(q, "shuffleanswers")
    shuffle.text = "true"

    # Answer numbering
    answernumbering = ET.SubElement(q, "answernumbering")
    answernumbering.text = "abc"

    # Show standard instruction
    showstandard = ET.SubElement(q, "showstandardinstruction")
    showstandard.text = "0"

    # Answers
    for i, choice in enumerate(choices):
        fraction = "100" if i == correct_index else "0"
        ans = ET.SubElement(q, "answer", fraction=fraction, format="html")
        ans_text = ET.SubElement(ans, "text")
        ans_text.text = choice
        # Feedback vuoto
        fb = ET.SubElement(ans, "feedback", format="html")
        fb_text = ET.SubElement(fb, "text")
        fb_text.text = ""

    return q


def _build_shortanswer_xml(question_text: str) -> ET.Element:
    """Costruisce elemento XML per domanda shortanswer Moodle.

    Args:
        question_text: Testo della domanda.

    Returns:
        Elemento XML question type='shortanswer'.
    """
    q = ET.Element("question", type="shortanswer")

    # Name
    name = ET.SubElement(q, "name")
    name_text = ET.SubElement(name, "text")
    name_text.text = question_text[:80]

    # Question text
    qt = ET.SubElement(q, "questiontext", format="html")
    qt_text = ET.SubElement(qt, "text")
    qt_text.text = question_text

    # Default grade
    defaultgrade = ET.SubElement(q, "defaultgrade")
    defaultgrade.text = "1"
    penalty = ET.SubElement(q, "penalty")
    penalty.text = "0.3333333"
    hidden = ET.SubElement(q, "hidden")
    hidden.text = "0"
    idnumber = ET.SubElement(q, "idnumber")
    idnumber.text = ""

    # Usecase
    usecase = ET.SubElement(q, "usecase")
    usecase.text = "1"

    # Wildcard answer placeholder
    ans = ET.SubElement(q, "answer", fraction="100", format="plain_text")
    ans_text = ET.SubElement(ans, "text")
    ans_text.text = "*"

    return q


def _build_essay_xml(question_text: str) -> ET.Element:
    """Costruisce elemento XML per domanda essay Moodle.

    Args:
        question_text: Testo della domanda.

    Returns:
        Elemento XML question type='essay'.
    """
    q = ET.Element("question", type="essay")

    # Name
    name = ET.SubElement(q, "name")
    name_text = ET.SubElement(name, "text")
    name_text.text = question_text[:80]

    # Question text
    qt = ET.SubElement(q, "questiontext", format="html")
    qt_text = ET.SubElement(qt, "text")
    qt_text.text = question_text

    # Default grade
    defaultgrade = ET.SubElement(q, "defaultgrade")
    defaultgrade.text = "1"
    penalty = ET.SubElement(q, "penalty")
    penalty.text = "0.3333333"
    hidden = ET.SubElement(q, "hidden")
    hidden.text = "0"
    idnumber = ET.SubElement(q, "idnumber")
    idnumber.text = ""

    # Response format
    responseformat = ET.SubElement(q, "responseformat")
    responseformat.text = "editor"
    responserequired = ET.SubElement(q, "responserequired")
    responserequired.text = "1"
    responsefieldlines = ET.SubElement(q, "responsefieldlines")
    responsefieldlines.text = "10"
    minwordlimit = ET.SubElement(q, "minwordlimit")
    minwordlimit.text = ""
    maxwordlimit = ET.SubElement(q, "maxwordlimit")
    maxwordlimit.text = ""
    attachments = ET.SubElement(q, "attachments")
    attachments.text = "0"
    attachmentsrequired = ET.SubElement(q, "attachmentsrequired")
    attachmentsrequired.text = "0"
    maxbytes = ET.SubElement(q, "maxbytes")
    maxbytes.text = ""

    # Grader info (empty feedback placeholder)
    graderinfo = ET.SubElement(q, "graderinfo", format="html")
    graderinfo_text = ET.SubElement(graderinfo, "text")
    graderinfo_text.text = ""

    # Response template
    responsetemplate = ET.SubElement(q, "responsetemplate", format="html")
    responsetemplate_text = ET.SubElement(responsetemplate, "text")
    responsetemplate_text.text = ""

    return q


# ── Public API ────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class MoodleXMLQuizPack:
    """Risultato dell'esportazione Moodle XML — mappa file_path → contenuto.

    Prodotto un singolo file quiz.xml con tutte le domande e categorie.
    Per i test: si puo ispezionare senza scrivere su disco.
    """

    files: Dict[str, str] = field(default_factory=dict)
    """Mappa file_path relativo → contenuto XML."""


def export_moodle_xml(
    blueprint: CourseBlueprint,
    atoms: Dict[str, Tuple[ContentAtom, ...]] | None = None,
    *,
    output_dir: str = "",
    include_ai_atoms: bool = False,
) -> MoodleXMLQuizPack:
    """Esporta quiz_question atoms da un CourseBlueprint in formato Moodle XML.

    Prodotto un file quiz.xml con:
      - Categorie Moodle per ogni modulo del corso
      - Domande quiz organizzate per modulo
      - Tipi supportati: multichoice, shortanswer, essay

    Args:
        blueprint: CourseBlueprint da esportare.
        atoms: Opzionale. Mappa lesson_id → tuple di ContentAtom.
            Solo quiz_question atoms vengono esportati.
        output_dir: Directory di output. Se vuota (default), restituisce
            solo il pack in memoria (utile per test).
        include_ai_atoms: Se True, include atomi con explicit_ai_inference=True.
            Default False.

    Returns:
        MoodleXMLQuizPack con il file quiz.xml.

    Raises:
        ValueError: Se blueprint non ha moduli.
        ValueError: Se multichoice ha choices vuote o correct_index fuori range.

    ZERO-LLM, deterministico, pura trasformazione dati. Stdlib only.
    """
    if not blueprint.modules:
        raise ValueError("no modules in blueprint -- nothing to export")

    # Radice XML
    quiz = ET.Element("quiz")

    # Raccogli tutti i quiz_question atoms
    all_quiz_atoms: list[ContentAtom] = []
    if atoms:
        for lesson_atoms in atoms.values():
            for atom in lesson_atoms:
                if atom.atom_type != "quiz_question":
                    continue
                if not include_ai_atoms and atom.explicit_ai_inference:
                    continue
                all_quiz_atoms.append(atom)

    # Organizza per modulo: mappa lesson_id → modulo
    lesson_to_module: dict[str, ModuleBlueprint] = {}
    for mod in blueprint.modules:
        for lid in mod.lesson_ids:
            # La prima lezione che matcha vince (di solito 1:1)
            if lid not in lesson_to_module:
                lesson_to_module[lid] = mod

    # Categorie per modulo gia viste (per ordine)
    seen_modules: list[str] = []
    module_atoms: dict[str, list[ContentAtom]] = {}

    for atom in all_quiz_atoms:
        mod = lesson_to_module.get(atom.lesson_id)
        if mod is not None:
            if mod.title not in seen_modules:
                seen_modules.append(mod.title)
            module_atoms.setdefault(mod.title, []).append(atom)
        else:
            # Atomo senza modulo associato → categoria "Other"
            if "Other" not in seen_modules:
                seen_modules.append("Other")
            module_atoms.setdefault("Other", []).append(atom)

    # Categorie: una per modulo (sempre, anche se vuote)
    for mod in blueprint.modules:
        if mod.title not in seen_modules:
            seen_modules.append(mod.title)

    # Costruisci XML
    for module_title in seen_modules:
        # Category element
        cat_elem = _build_category_xml(module_title)
        quiz.append(cat_elem)

        for atom in module_atoms.get(module_title, []):
            question_text, choices, correct_index, multiple_answer = _parse_quiz_body(
                atom.body
            )
            qtype = _question_type(bool(choices), correct_index)

            if qtype == _QUESTION_TYPE_MULTICHOICE:
                q_elem = _build_multichoice_xml(
                    question_text, choices, correct_index, multiple_answer
                )
            elif qtype == _QUESTION_TYPE_ESSAY:
                q_elem = _build_essay_xml(question_text)
            else:
                q_elem = _build_shortanswer_xml(question_text)

            quiz.append(q_elem)

    # Serialize
    xml_str = ET.tostring(quiz, encoding="unicode", xml_declaration=True)
    xml_str = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str.split("?>", 1)[-1]

    files: Dict[str, str] = {"quiz.xml": xml_str}

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        xml_path = os.path.join(output_dir, "quiz.xml")
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write(xml_str)

    return MoodleXMLQuizPack(files=files)
