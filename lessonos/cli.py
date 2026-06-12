"""CLI for the LessonOS Core Engine (M6, PLAN §8.2).

Provides the ``run-path`` command: load a fixture path, build all Lesson
Capsules (mock LLM), compute Path Memory → Didactic Delta → Learning Debt
→ Next Lesson Plan, and print the result to stdout.

Usage
-----
    lessonos run-path [--fixture PATH]

Without ``--fixture`` defaults to ``fixtures/sample_path`` relative to the
project root.
"""

from __future__ import annotations

import argparse
import json
import sys
import re
from dataclasses import asdict
from pathlib import Path as FsPath
from typing import Any

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.observations import JSONL_PATH, load_recent_observations
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.graph.didactic_delta import compute_didactic_delta
from lessonos.graph.learning_debt import compute_learning_debt
from lessonos.graph.next_lesson_planner import compute_next_lesson_plan
from lessonos.graph.path_memory import PathMemory, build_path_memory
from lessonos.llm.router import MockProvider, Router
from lessonos.eval.realtime import (
    run_realtime_eval,
    run_realtime_eval_n_runs,
)
from lessonos.store.base import Store
from lessonos.export.obsidian_vault import export_vault
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_moments,
    ingest_lesson_segments,
    load_sample_path,
)
from lessonos.store.sqlite import SQLiteStore
from lessonos.course.folder_loader import load_course_folder
from lessonos.course.planner import plan_course
from lessonos.export.markdown_course import MarkdownCoursePack, export_course_markdown
from lessonos.export.liascript import LiaScriptCoursePack, export_liascript
from lessonos.export.moodle_xml import MoodleXMLQuizPack, export_moodle_xml
from lessonos.export.quarto import QuartoCoursePack, QuartoSlidesPack, export_quarto, export_quarto_slides
from lessonos.course.teacher_review import (
    TeacherReviewSet,
    make_empty_review_set,
    make_review_note,
    is_course_approved,
)

# ---------------------------------------------------------------------------
# Mock payload definitions — one per lesson, keyed by lesson_id.
# Each entry is (seg_payload, ext_payload) matching the schema from
# build_segmentation_prompt / build_extraction_prompt.
# ---------------------------------------------------------------------------

_LESSON_MOCKS: dict[str, tuple[list[dict], dict]] = {
    "l1_derivative_definition": (
        # seg_payload
        [
            {
                "topic": "Definizione di derivata",
                "seg_ids": ["l1s1", "l1s2"],
            },
            {
                "topic": "Limite e notazione",
                "seg_ids": ["l1s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s1",
                            "excerpt": "derivata come velocita istantanea",
                        }
                    ],
                },
                {
                    "name": "rapporto incrementale",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s2",
                            "excerpt": "rapporto incrementale",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Calcola f'(x) per f(x) = x^2 usando la definizione di derivata.",
                    "citations": [{"seg_id": "l1s3"}],
                },
                {
                    "prompt": "Verifica che la derivata di f(x) = 3x + 2 sia 3.",
                    "citations": [{"seg_id": "l1s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Cosa succede al rapporto incrementale se h = 0?",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Esercizi 1-3: calcola derivate per f(x)=x^2, f(x)=2x+1, f(x)=x^3 dal primo principio.",
                    "citations": [{"seg_id": "l1s3"}],
                }
            ],
        },
    ),
    "l2_derivative_rules": (
        # seg_payload
        [
            {
                "topic": "Ripasso definizione di derivata",
                "seg_ids": ["l2s1"],
            },
            {
                "topic": "Regola della potenza",
                "seg_ids": ["l2s2"],
            },
            {
                "topic": "Regola del prodotto e della catena",
                "seg_ids": ["l2s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "reinforced",
                    "citations": [
                        {
                            "seg_id": "l2s1",
                            "excerpt": "Richiamiamo la definizione di derivata",
                        }
                    ],
                },
                {
                    "name": "regola della potenza",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s2",
                            "excerpt": "Regola della potenza",
                        }
                    ],
                },
                {
                    "name": "regola della catena",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s3",
                            "excerpt": "regola della catena",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Deriva x^3, x^5 e x^(-2) usando la regola della potenza.",
                    "citations": [{"seg_id": "l2s2"}],
                },
                {
                    "prompt": "Applica la regola del prodotto a (x^2+1)(x-1) e la regola della catena a sin(3x+1).",
                    "citations": [{"seg_id": "l2s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Come si applica la regola della catena a funzioni composte multiple?",
                    "citations": [{"seg_id": "l2s3"}],
                }
            ],
            "homework": [
                {
                    "task": "Esercizi derivate 1-5: derivate con regola potenza, prodotto, catena.",
                    "citations": [{"seg_id": "l2s2"}, {"seg_id": "l2s3"}],
                }
            ],
        },
    ),
    "l3_integral_intro": (
        # seg_payload
        [
            {
                "topic": "Integrale come operazione inversa",
                "seg_ids": ["l3s1"],
            },
            {
                "topic": "Antiderivata",
                "seg_ids": ["l3s2"],
            },
            {
                "topic": "Teorema fondamentale del calcolo",
                "seg_ids": ["l3s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "integrale",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l3s1",
                            "excerpt": "integrale come operazione inversa",
                        }
                    ],
                },
                {
                    "name": "antiderivata",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l3s2",
                            "excerpt": "antiderivata",
                        }
                    ],
                },
                {
                    "name": "teorema fondamentale del calcolo",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l3s3",
                            "excerpt": "teorema fondamentale del calcolo",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Trova l'antiderivata di x^2 e verifica derivando.",
                    "citations": [{"seg_id": "l3s2"}],
                },
                {
                    "prompt": "Calcola l'integrale definito di x da 0 a 1 usando il teorema fondamentale.",
                    "citations": [{"seg_id": "l3s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche l'integrale definito F(b)-F(a) non dipende dalla costante C?",
                    "citations": [{"seg_id": "l3s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Esercizi integrali 1-4: antiderivate e integrali definiti.",
                    "citations": [{"seg_id": "l3s3"}],
                }
            ],
        },
    ),
    "l4_integral_substitution": (
        # seg_payload
        [
            {
                "topic": "Introduzione all'integrazione per sostituzione",
                "seg_ids": ["l4s1", "l4s2"],
            },
            {
                "topic": "Esempio pratico di sostituzione",
                "seg_ids": ["l4s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "sostituzione",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l4s2",
                            "excerpt": "La regola e: integrale di f(g(x))*g'(x) dx = integrale di f(u) du",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Applica la sostituzione u=sin(x) per calcolare integrale di cos(x)*e^(sin(x)) dx.",
                    "citations": [{"seg_id": "l4s2"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Come si sceglie la sostituzione appropriata u=g(x)?",
                    "citations": [{"seg_id": "l4s1"}],
                }
            ],
            "homework": [
                {
                    "task": "Esercizi sostituzione 1-3: integra funzioni composte con sostituzione.",
                    "citations": [{"seg_id": "l4s3"}],
                }
            ],
        },
    ),

    # --- spaced_path (Learning Science -- Spaced Repetition) ---

    "l1_sm2_intro": (
        # seg_payload
        [
            {
                "topic": "Introduzione alla ripetizione spaziata",
                "seg_ids": ["l1s1", "l1s2"],
            },
            {
                "topic": "Formula SM-2 e qualita di risposta",
                "seg_ids": ["l1s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "ripetizione spaziata",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s1",
                            "excerpt": "ripetizione spaziata e una tecnica di apprendimento",
                        }
                    ],
                },
                {
                    "name": "SM-2",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s2",
                            "excerpt": "SM-2 di SuperMemo utilizza sei livelli di qualita",
                        }
                    ],
                },
                {
                    "name": "EF formula",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s3",
                            "excerpt": "formula SM-2 calcola EF",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Calcola l intervallo dopo una risposta di qualita 5 con EF=2.5.",
                    "citations": [{"seg_id": "l1s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche il sistema SM-2 usa 6 livelli e non una scala continua?",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Implementa un simulatore SM-2 in Python: date le qualita di risposta, calcola EF e intervalli.",
                    "citations": [{"seg_id": "l1s3"}],
                }
            ],
        },
    ),

    "l2_fsrs_advanced": (
        # seg_payload
        [
            {
                "topic": "FSRS: Free Spaced Repetition Scheduler",
                "seg_ids": ["l2s1", "l2s2"],
            },
            {
                "topic": "Ottimizzazione FSRS e cross-entropia",
                "seg_ids": ["l2s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "FSRS",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s1",
                            "excerpt": "FSRS e un algoritmo moderno",
                        }
                    ],
                },
                {
                    "name": "funzione di ritenzione",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s2",
                            "excerpt": "funzione di ritenzione R(t) = exp",
                        }
                    ],
                },
                {
                    "name": "cross-entropia",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s3",
                            "excerpt": "minimizzazione della cross-entropia",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Confronta SM-2 e FSRS: quali parametri FSRS rendono l algoritmo piu flessibile?",
                    "citations": [{"seg_id": "l2s1"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Come viene ottimizzata la cross-entropia in FSRS su larga scala?",
                    "citations": [{"seg_id": "l2s3"}],
                }
            ],
            "homework": [
                {
                    "task": "Implementa la formula R(t)=exp(-t/S) in Python. Calcola R per t=1,2,7 con S=3,5,10.",
                    "citations": [{"seg_id": "l2s2"}],
                }
            ],
        },
    ),

    # --- bio_path (Biologia -- Fotosintesi Clorofilliana) ---

    "l1_fotosintesi_intro": (
        # seg_payload
        [
            {
                "topic": "Introduzione alla fotosintesi",
                "seg_ids": ["l1s1", "l1s2"],
            },
            {
                "topic": "Reazione complessiva",
                "seg_ids": ["l1s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "fotosintesi clorofilliana",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s1",
                            "excerpt": "fotosintesi clorofilliana e il processo",
                        }
                    ],
                },
                {
                    "name": "cloroplasti",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s2",
                            "excerpt": "cloroplasti, organelli che contengono clorofilla",
                        }
                    ],
                },
                {
                    "name": "equazione della fotosintesi",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s3",
                            "excerpt": "6 CO2 + 6 H2O + luce -> C6H12O6 + 6 O2",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Bilancia l equazione della fotosintesi e identifica i reagenti e i prodotti.",
                    "citations": [{"seg_id": "l1s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche i cloroplasti hanno una doppia membrana?",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Disegna uno schema del cloroplasto e descrivi il ruolo di tilacoidi e stroma.",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
        },
    ),

    "l2_reazioni_luce": (
        # seg_payload
        [
            {
                "topic": "Reazioni luminose e catena di trasporto",
                "seg_ids": ["l2s1", "l2s2"],
            },
            {
                "topic": "NADPH e ATP",
                "seg_ids": ["l2s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "fotosintesi clorofilliana",
                    "status": "reinforced",
                    "citations": [
                        {
                            "seg_id": "l2s1",
                            "excerpt": "reazioni luminose avvengono nei tilacoidi",
                        }
                    ],
                },
                {
                    "name": "catena di trasporto elettronico",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s2",
                            "excerpt": "catena di trasporto elettronico",
                        }
                    ],
                },
                {
                    "name": "NADPH",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s3",
                            "excerpt": "NADP+ viene ridotto a NADPH",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Segui il percorso di un elettrone dalla clorofilla al NADP+. Quante molecole di ATP vengono prodotte?",
                    "citations": [{"seg_id": "l2s2"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche il gradiente protonico e necessario per la sintesi di ATP?",
                    "citations": [{"seg_id": "l2s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Confronta il numero di molecole di ATP e NADPH prodotte per ogni molecola di glucosio.",
                    "citations": [{"seg_id": "l2s3"}],
                }
            ],
        },
    ),
}


def _find_project_root() -> FsPath:
    """Walk up from this file to find the project root (where pyproject.toml lives)."""
    here = FsPath(__file__).resolve()
    for parent in here.parents:
        if (parent / "pyproject.toml").exists():
            return parent
    return here.parents[1]  # fallback


def _build_router(
    store: Store, lesson_id: str
) -> Router | None:
    """Build a mock router with payloads for ``lesson_id``.

    Returns ``None`` if no mock is registered for this lesson.
    """
    mock_data = _LESSON_MOCKS.get(lesson_id)
    if mock_data is None:
        return None

    seg_payload, ext_payload = mock_data
    segments = store.segments_for_lesson(lesson_id)
    seg_prompt = build_segmentation_prompt(segments)
    ext_prompt = build_extraction_prompt(segments)

    router = Router()
    router.register(
        MockProvider(
            {
                seg_prompt: json.dumps(seg_payload),
                ext_prompt: json.dumps(ext_payload),
            }
        )
    )
    return router


# ---------------------------------------------------------------------------
# Formatting helpers
# ---------------------------------------------------------------------------


def _fmt_bool(v: bool) -> str:
    return "✓" if v else "✗"


def _fmt_header(text: str, char: str = "=", width: int = 72) -> str:
    return f"\n{text}\n{char * width}"


def _fmt_subheader(text: str) -> str:
    return f"\n  {text}\n  {'─' * (len(text) + 2)}"


def _capsule_summary(capsule: LessonCapsule) -> str:
    lines: list[str] = []
    lines.append(f"  Lesson: {capsule.lesson_id}")
    lines.append(
        f"  Topics ({len(capsule.timeline)}):"
    )
    for i, span in enumerate(capsule.timeline, 1):
        lines.append(
            f"    {i}. {span.topic} ({span.start}s - {span.end}s)"
        )
    cc = capsule.content
    lines.append(
        f"  Concepts: {len(cc.concepts)}  |  "
        f"Exercises: {len(cc.exercises)}  |  "
        f"Questions: {len(cc.student_questions)}  |  "
        f"Homework: {len(cc.homework)}"
    )
    if cc.concepts:
        lines.append("  Concepts detail:")
        for c in cc.concepts:
            prereqs = (
                f"  prereqs: {', '.join(c.prerequisites)}"
                if c.prerequisites
                else ""
            )
            lines.append(f"    - {c.name} ({c.status}){prereqs}")
    return "\n".join(lines)


def _path_memory_summary(memory: PathMemory) -> str:
    lines: list[str] = []
    lines.append(
        f"  State: {memory.current_state}  |  "
        f"Lessons: {memory.total_lessons}  |  "
        f"Concepts: {memory.total_concepts}  |  "
        f"Exercises: {memory.total_exercises}"
    )
    lines.append(f"  Title: {memory.path_title or '(no title)'}")
    lines.append(f"\n  Lesson Index ({len(memory.lesson_index)}):")
    for entry in memory.lesson_index:
        new_str = f"({len(entry.new_concepts)} new, {len(entry.reinforced_concepts)} reinforced)"
        lines.append(
            f"    {entry.lesson_id}: {entry.title} — "
            f"{len(entry.topics)} topics, "
            f"{entry.concept_count} concepts {new_str}"
        )
    if memory.recurring_misconceptions:
        lines.append(f"\n  Recurring misconceptions ({len(memory.recurring_misconceptions)}):")
        for m in memory.recurring_misconceptions:
            lines.append(f"    - {m}")
    if memory.exercise_bank:
        lines.append(f"\n  Exercise bank: {len(memory.exercise_bank)} exercises")
    return "\n".join(lines)


def _delta_summary(delta: Any, path_id: str) -> str:
    lines: list[str] = []
    lines.append(f"  Path: {path_id}")
    lines.append(f"  New concepts:       {len(delta.new_concepts)}")
    lines.append(f"  Clarified concepts:  {len(delta.clarified_concepts)}")
    lines.append(f"  Still-open concepts: {len(delta.still_open_concepts)}")
    lines.append(f"  Over-repeated:       {len(delta.over_repeated_concepts)}")
    lines.append(f"  Under-practiced:     {len(delta.under_practiced_concepts)}")
    lines.append(f"  New misconceptions:  {len(delta.new_misconceptions)}")
    lines.append(f"  Resolved:            {len(delta.resolved_misconceptions)}")
    if delta.new_concepts:
        names = ", ".join(c.name for c in delta.new_concepts)
        lines.append(f"\n  New concepts: {names}")
    if delta.clarified_concepts:
        names = ", ".join(c.name for c in delta.clarified_concepts)
        lines.append(f"  Clarified: {names}")
    if delta.still_open_concepts:
        names = ", ".join(c.name for c in delta.still_open_concepts)
        lines.append(f"  Still open: {names}")
    return "\n".join(lines)


def _debt_summary(ledger: Any) -> str:
    lines: list[str] = []
    lines.append(f"  Total items: {ledger.total_items}")
    lines.append(f"  By kind: {dict(ledger.by_kind)}")
    if ledger.items:
        lines.append("")
        for item in ledger.items[:10]:  # show first 10
            status = "🔴" if not item.resolved else "🟢"
            lines.append(f"  {status} [{item.kind}] {item.description[:80]}")
    if ledger.total_items > 10:
        lines.append(f"  ... and {ledger.total_items - 10} more items")
    return "\n".join(lines)


def _plan_summary(plan: Any, memory: Any = None) -> str:
    lines: list[str] = []
    lines.append(f"  Total agenda items: {plan.total_agenda_items}")

    # Build FSRS lookup from memory if available (for recommended_review_day + difficulty)
    _concept_info: dict[str, dict] = {}
    if memory is not None and hasattr(memory, "concept_graph"):
        for cpe in memory.concept_graph:
            _concept_info[cpe.name.lower()] = {
                "name": cpe.name,
                "difficulty": cpe.difficulty,
                "retention": cpe.estimated_retention,
                "repetitions": cpe.repetition_count,
            }

    def _fsrs_suffix(description: str, review_day: int | None) -> str:
        parts: list[str] = []
        if review_day is not None:
            parts.append(f"review day={review_day}")
        # Try to extract concept name for lookup
        m_name = re.search(r'[Cc]oncept "([^"]+)"', description)
        if m_name:
            key = m_name.group(1).lower()
            info = _concept_info.get(key)
            if info:
                if info["difficulty"] != 5.0:  # only show if non-default
                    parts.append(f"D={info['difficulty']:.1f}")
                if info["retention"] is not None:
                    parts.append(f"R={info['retention']:.0%}")
                if info["repetitions"] > 1:
                    parts.append(f"reps={info['repetitions']}")
        return " [" + ", ".join(parts) + "]" if parts else ""

    if plan.prerequisite_gaps:
        lines.append(f"\n  Prerequisite gaps ({len(plan.prerequisite_gaps)}):")
        for item in plan.prerequisite_gaps:
            s = _fsrs_suffix(item.description, item.recommended_review_day)
            lines.append(f"    🔴 {item.description[:80]}{s}")
    if plan.review_items:
        lines.append(f"\n  Review items ({len(plan.review_items)}):")
        for item in plan.review_items:
            s = _fsrs_suffix(item.description, item.recommended_review_day)
            lines.append(f"    📝 {item.description[:80]}{s}")
    if plan.open_doubt_items:
        lines.append(f"\n  Open doubts ({len(plan.open_doubt_items)}):")
        for item in plan.open_doubt_items:
            lines.append(f"    ❓ {item.description[:80]}")
    if plan.practice_items:
        lines.append(f"\n  Practice items ({len(plan.practice_items)}):")
        for item in plan.practice_items:
            lines.append(f"    ✏️  {item.description[:80]}")
    if plan.new_material_items:
        lines.append(f"\n  New material ({len(plan.new_material_items)}):")
        for item in plan.new_material_items:
            lines.append(f"    🌱 {item.description[:80]}")
    lines.append(f"\n  Suggested topics ({len(plan.suggested_topics)}):")
    for i, topic in enumerate(plan.suggested_topics, 1):
        lines.append(f"    {i}. {topic}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------


def run_path(
    fixture_root: FsPath,
    *,
    out=sys.stdout,
) -> dict[str, Any]:
    """Run the full LessonOS pipeline on a fixture path and print results.

    Parameters
    ----------
    fixture_root : Path
        Directory containing ``path.json``, ``lessons/``, ``sources/``.
    out : IO, optional
        Output stream (defaults to stdout).

    Returns
    -------
    dict
        Summary dict with keys: path, capsules, memory, delta, debt, plan.
    """
    store = SQLiteStore(":memory:")

    # --- Phase 1: Load fixture ---
    path = load_sample_path(store, fixture_root)
    lesson_ids = path.lesson_ids

    print(_fmt_header("LessonOS Core Engine — End-to-End Demo"), file=out)
    print(file=out)
    print(f"  Path: {path.title} ({path.path_id})", file=out)
    print(f"  Subject: {path.subject}  |  Lessons: {len(lesson_ids)}", file=out)
    print(file=out)

    # --- Phase 2: Ingest segments + moments for each lesson ---
    print("  [1/5] Ingesting fixture segments and moments...", file=out)
    for lid in lesson_ids:
        ingest_lesson_segments(store, lid, fixture_root)
        ingest_lesson_moments(store, lid, fixture_root)
    print(f"  Done: {len(lesson_ids)} lessons ingested.", file=out)

    # --- Phase 3: Assemble mock capsules ---
    print(f"\n  [2/5] Assembling Lesson Capsules (mock LLM)...", file=out)
    capsules: list[LessonCapsule] = []
    for lid in lesson_ids:
        router = _build_router(store, lid)
        if router is None:
            print(f"  ⚠ No mock registered for {lid}, skipping.", file=out)
            continue
        capsule = assemble_lesson_capsule(store, lid, router)
        capsules.append(capsule)
        n_topics = len(capsule.timeline)
        n_concepts = len(capsule.content.concepts)
        print(
            f"  ✓ {lid}: {n_topics} topics, {n_concepts} concepts, "
            f"{len(capsule.content.exercises)} exercises",
            file=out,
        )

    # --- Print individual capsules ---
    print(_fmt_header("Lesson Capsules", "─"), file=out)
    for capsule in capsules:
        print(_capsule_summary(capsule), file=out)
        print(file=out)

    # --- Phase 4: Path Memory ---
    print(_fmt_header("Path Memory", "─"), file=out)
    memory = build_path_memory(capsules, path_title=path.title)
    print(_path_memory_summary(memory), file=out)

    # --- Phase 5: Didactic Delta (L1+L2+L3 vs L1+L2+L3+L4) ---
    print(_fmt_header("Didactic Delta (L1+L2+L3 vs L1+L2+L3+L4)", "─"), file=out)
    if len(capsules) >= 2:
        old_memory = build_path_memory(capsules[:-1], path_title=path.title)
        delta = compute_didactic_delta(old_memory, memory)
        print(_delta_summary(delta, path.path_id), file=out)
    else:
        print("  (need ≥2 capsules for a meaningful delta)", file=out)
        from lessonos.graph.didactic_delta import DidacticDelta

        delta = DidacticDelta(
            new_concepts=(),
            clarified_concepts=(),
            still_open_concepts=(),
            over_repeated_concepts=(),
            under_practiced_concepts=(),
            new_misconceptions=(),
            resolved_misconceptions=(),
            total_new_concepts=0,
            total_clarified=0,
            total_still_open=0,
            total_over_repeated=0,
            total_under_practiced=0,
            total_new_misconceptions=0,
            total_resolved_misconceptions=0,
        )

    # --- Phase 6: Learning Debt ---
    print(_fmt_header("Learning Debt Ledger", "─"), file=out)
    ledger = compute_learning_debt(memory, delta, path_id=path.path_id)
    print(_debt_summary(ledger), file=out)

    # --- Phase 7: Next Lesson Plan ---
    print(_fmt_header("Next Lesson Plan", "─"), file=out)
    plan = compute_next_lesson_plan(
        memory, delta, ledger, path_id=path.path_id
    )
    print(_plan_summary(plan, memory=memory), file=out)

    print(file=out)
    print(_fmt_header("End of Demo", "="), file=out)

    return {
        "path_id": path.path_id,
        "capsules": len(capsules),
        "memory": memory.total_concepts,
        "delta_new": len(delta.new_concepts),
        "debt_items": ledger.total_items,
        "agenda_items": plan.total_agenda_items,
    }


# ---------------------------------------------------------------------------
# Observations CLI
# ---------------------------------------------------------------------------


def _observations_summary(
    store_path: str | None = None,
    *,
    limit: int = 10,
) -> str:
    """Format recent observations for CLI display.

    Parameters
    ----------
    store_path : str or None
        Path to observations.jsonl. If None, uses the default path.
    limit : int
        Max observations to show (default 10).

    Returns
    -------
    str
        Formatted multi-line summary, or empty string if no observations.
    """
    if limit <= 0:
        raise ValueError(f"limit must be positive, got {limit}")
    obs_path = store_path if store_path is not None else JSONL_PATH
    obs = load_recent_observations(n=limit, store_path=obs_path)
    if not obs:
        return ""

    lines: list[str] = []
    for i, o in enumerate(obs, 1):
        lines.append(
            f"  {i}. [{o.ts[:10]}] {o.task}  "
            f"(gate={o.gate_passed}, status={o.status}, "
            f"cost=${o.cost_usd:.4f}, commit={o.commit})"
        )
        if o.note:
            lines.append(f"       {o.note[:80]}")
    return "\n".join(lines)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="LessonOS Core Engine — demo CLI",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    run_parser = sub.add_parser(
        "run-path", help="Run the full pipeline on a fixture path"
    )
    run_parser.add_argument(
        "--fixture",
        type=str,
        default=None,
        help="Path to fixture directory (default: fixtures/sample_path)",
    )

    obs_parser = sub.add_parser(
        "observations", help="Show recent cross-iteration observations"
    )
    obs_parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Max observations to show (default: 10)",
    )

    eval_parser = sub.add_parser(
        "eval-real", help="Run realtime eval on a fixture lesson (mock in test)"
    )
    eval_parser.add_argument(
        "--fixture",
        type=str,
        default=None,
        help="Path to fixture directory (default: fixtures/sample_path)",
    )
    eval_parser.add_argument(
        "--lesson",
        type=str,
        default="l1_derivative_definition",
        help="Lesson ID to evaluate (default: l1_derivative_definition)",
    )
    eval_parser.add_argument(
        "--n-runs",
        type=int,
        default=1,
        help="Number of eval runs (default: 1, use >1 for distribution)",
    )
    eval_parser.add_argument(
        "--live",
        action="store_true",
        default=False,
        help="Run with a real LLM (DeepSeek/Kimi) instead of mock. Requires DEEPSEEK_API_KEY.",
    )
    eval_parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="LLM model name for --live (default: deepseek-chat for DeepSeek, auto-detect per provider)",
    )

    cc_parser = sub.add_parser(
        "compile-course", help="Compile a course folder into export format"
    )
    cc_parser.add_argument(
        "folder",
        type=str,
        help="Path to course folder containing course.json",
    )
    cc_parser.add_argument(
        "--target",
        type=str,
        default="markdown",
        choices=["markdown", "liascript", "quarto", "quarto-slides", "moodle-xml", "all"],
        help="Export target format (default: markdown)",
    )
    cc_parser.add_argument(
        "--output",
        type=str,
        default="",
        help="Output directory (default: <course_folder>/_build/<target>)",
    )
    cc_parser.add_argument(
        "--include-ai-atoms",
        action="store_true",
        default=False,
        help="Include AI-inferred atoms in output (default: False)",
    )
    cc_parser.add_argument(
        "--review",
        action="store_true",
        default=False,
        help="Print teacher review status for the compiled course (creates empty review set)",
    )
    cc_parser.add_argument(
        "--approve",
        action="store_true",
        default=False,
        help="Auto-approve the course after compilation (sets APPROVE at COURSE scope)",
    )
    cc_parser.add_argument(
        "--theme",
        type=str,
        default="simple",
        help="revealjs theme for --target quarto-slides (default: simple). "
        "Valid themes: simple, beige, black, blood, league, moon, night, serif, sky, solarized, white",
    )

    # --- export-vault ---
    vault_parser = sub.add_parser(
        "export-vault", help="Export Obsidian vault (read-only projection of derived/)"
    )
    vault_parser.add_argument(
        "--teacher",
        type=str,
        default="andrea",
        help="Teacher identifier (default: andrea)",
    )
    vault_parser.add_argument(
        "--out",
        type=str,
        required=True,
        help="Output vault directory (e.g. derived/vault/andrea/)",
    )
    vault_parser.add_argument(
        "--db",
        type=str,
        default="",
        help="Path to lessonos.db (default: auto-detect from ~/maestro-data/)",
    )
    vault_parser.add_argument(
        "--derived",
        type=str,
        default="",
        help="Root of derived/ directory (default: auto-detect from --out)",
    )
    vault_parser.add_argument(
        "--canvas",
        action="store_true",
        default=False,
        help="Generate JSON Canvas 1.0 graph file",
    )

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Entry point for ``lessonos`` CLI.

    Returns exit code (0 = success).
    """
    args = _parse_args(argv)

    if args.command == "run-path":
        if args.fixture:
            fixture_root = FsPath(args.fixture).resolve()
        else:
            project_root = _find_project_root()
            fixture_root = project_root / "fixtures" / "sample_path"

        if not fixture_root.exists():
            print(
                f"Error: fixture path not found: {fixture_root}",
                file=sys.stderr,
            )
            return 1
        if not (fixture_root / "path.json").exists():
            print(
                f"Error: no path.json in {fixture_root}",
                file=sys.stderr,
            )
            return 1

        result = run_path(fixture_root)
        # Summary line
        print(
            f"\nSummary: {result['capsules']} capsules, "
            f"{result['memory']} concepts in Path Memory, "
            f"{result['delta_new']} new concepts in Delta, "
            f"{result['debt_items']} debt items, "
            f"{result['agenda_items']} agenda items",
        )
        return 0

    if args.command == "observations":
        summary = _observations_summary(limit=args.limit)
        if summary:
            print("Recent observations:")
            print(summary)
        else:
            print("No observations found.")
        return 0

    if args.command == "compile-course":
        folder_path = FsPath(args.folder).resolve()
        if not folder_path.exists():
            print(
                f"Error: course folder not found: {folder_path}",
                file=sys.stderr,
            )
            return 1
        if not (folder_path / "course.json").exists():
            print(
                f"Error: no course.json in {folder_path}",
                file=sys.stderr,
            )
            return 1

        # Plan course (load + blueprint + materials)
        try:
            result = plan_course(str(folder_path))
        except ValueError as e:
            print(f"Error planning course: {e}", file=sys.stderr)
            return 1

        blueprint = result.blueprint

        # Determine output dir
        output_dir = args.output or str(
            folder_path / "_build" / args.target
        )

        # Route to target exporter
        try:
            # Convert PlannerMaterial dict to SourceMaterialPack for exporters
            from lessonos.export.source_extractor import SourceMaterial, SourceMaterialPack

            mat_pack = SourceMaterialPack(
                materials={
                    sid: SourceMaterial(
                        source_id=sid,
                        filename=pm.filename,
                        source_type=pm.source_type,
                        content=pm.content,
                        lesson_id=pm.lesson_id,
                    )
                    for sid, pm in result.materials.items()
                    if pm.content
                },
            )

            targets = (
                [t for t in ("markdown", "liascript", "quarto", "quarto-slides", "moodle-xml")]
                if args.target == "all"
                else [args.target]
            )

            for target in targets:
                if args.output:
                    target_output_dir = (
                        str(FsPath(args.output) / target)
                        if args.target == "all"
                        else args.output
                    )
                else:
                    target_output_dir = str(folder_path / "_build" / target)

                if target == "markdown":
                    pack = export_course_markdown(
                        blueprint,
                        output_dir=target_output_dir,
                        include_ai_atoms=args.include_ai_atoms,
                        materials=mat_pack,
                    )
                elif target == "liascript":
                    pack = export_liascript(
                        blueprint,
                        output_dir=target_output_dir,
                        include_ai_atoms=args.include_ai_atoms,
                        materials=mat_pack,
                    )
                elif target == "quarto":
                    pack = export_quarto(
                        blueprint,
                        output_dir=target_output_dir,
                        include_ai_atoms=args.include_ai_atoms,
                        materials=mat_pack,
                    )
                elif target == "moodle-xml":
                    pack = export_moodle_xml(
                        blueprint,
                        output_dir=target_output_dir,
                        include_ai_atoms=args.include_ai_atoms,
                    )
                elif target == "quarto-slides":
                    pack = export_quarto_slides(
                        blueprint,
                        output_dir=target_output_dir,
                        include_ai_atoms=args.include_ai_atoms,
                        materials=mat_pack,
                        theme=args.theme,
                    )

                n_files = len(pack.files)
                n_materials = len(result.materials)
                if len(targets) == 1:
                    print(
                        f"Course compiled ({target}): {len(blueprint.modules)} modules, "
                        f"{len(blueprint.source_lessons)} lessons, "
                        f"{n_materials} source materials, "
                        f"{n_files} files written to {target_output_dir}/"
                    )
                else:
                    print(
                        f"{target}: {len(blueprint.modules)} modules, "
                        f"{len(blueprint.source_lessons)} lessons, "
                        f"{n_materials} source materials, "
                        f"{n_files} files written to {target_output_dir}/"
                    )

                # Teacher review integration (only for the first target when --target all)
                if (args.review or args.approve) and target == targets[0]:
                    review_set = make_empty_review_set(result.blueprint.title)

                    if args.approve:
                        from datetime import datetime, timezone

                        note_id = f"auto-approve-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}"
                        note = make_review_note(
                            note_id=note_id,
                            action="approve",
                            scope="course",
                            target_id=result.blueprint.title,
                            comment="Auto-approved via CLI --approve flag.",
                            reviewer="CLI",
                        )
                        review_set = review_set.add_note(note)
                        print(f"  ✅ Course approved: {result.blueprint.title}")

                    # Serialize review_set to output dir for persistence
                    review_path = FsPath(target_output_dir) / "review.json"
                    review_path.parent.mkdir(parents=True, exist_ok=True)
                    import dataclasses

                    def _serialize_note(n):
                        d = dataclasses.asdict(n)
                        d["action"] = d["action"].value if hasattr(d["action"], "value") else d["action"]
                        d["scope"] = d["scope"].value if hasattr(d["scope"], "value") else d["scope"]
                        return d

                    review_data = {
                        "course_id": review_set.course_id,
                        "notes": [_serialize_note(n) for n in review_set.notes],
                    }
                    review_path.write_text(json.dumps(review_data, indent=2))
                    print(f"  💾 Review notes saved: {review_path}")
                    print(
                        f"  📋 Review status: {len(review_set)} note(s), "
                        f"approved={is_course_approved(review_set)}"
                    )
        except ValueError as e:
            print(f"Error during export: {e}", file=sys.stderr)
            return 1

        return 0

    if args.command == "export-vault":
        # Determine DB path
        db_path = args.db
        if not db_path:
            # Auto-detect: ~/maestro-data/teoria-segnali-2021/derived/db/lessonos.db
            candidate = FsPath.home() / "maestro-data" / "teoria-segnali-2021" / "derived" / "db" / "lessonos.db"
            if candidate.exists():
                db_path = str(candidate)
            else:
                print("Error: no DB auto-detected. Use --db to specify.", file=sys.stderr)
                return 1

        if not FsPath(db_path).exists():
            print(f"Error: DB not found: {db_path}", file=sys.stderr)
            return 1

        store = SQLiteStore(db_path)

        try:
            result = export_vault(
                store=store,
                teacher_id=args.teacher,
                output_dir=args.out,
                derived_root=args.derived or None,
                canvas=args.canvas,
            )
        except ValueError as e:
            print(f"Error exporting vault: {e}", file=sys.stderr)
            return 1

        print(
            f"Vault exported: {result['concepts']} concepts, "
            f"{result['lessons']} lessons, "
            f"{result['edges']} prerequisite edges, "
            f"{result['wiki_files']} wiki files, "
            f"{result['dispense_files']} dispense files"
        )
        if result["canvas"]:
            print("  + JSON Canvas 1.0 (grafo-prerequisiti.canvas)")
        print(f"  Output: {args.out}/")
        return 0

    if args.command == "eval-real":
        project_root = _find_project_root()
        if args.fixture:
            fixture_root = FsPath(args.fixture).resolve()
        else:
            fixture_root = project_root / "fixtures" / "sample_path"

        if not fixture_root.exists():
            print(
                f"Error: fixture path not found: {fixture_root}",
                file=sys.stderr,
            )
            return 1
        if not (fixture_root / "path.json").exists():
            print(
                f"Error: no path.json in {fixture_root}",
                file=sys.stderr,
            )
            return 1

        store = SQLiteStore(":memory:")
        from lessonos.store.fixture_loader import load_sample_path, ingest_lesson_segments

        path_obj = load_sample_path(store, fixture_root)
        if args.lesson not in path_obj.lesson_ids:
            print(
                f"Error: lesson '{args.lesson}' not found in fixture "
                f"(available: {', '.join(path_obj.lesson_ids)})",
                file=sys.stderr,
            )
            return 1

        # Ingest segments so _build_router can build prompts
        ingest_lesson_segments(store, args.lesson, fixture_root)

        if args.live:
            router = None  # run_realtime_eval will build a live DeepSeek/Kimi provider
        else:
            # Build mock router using the same _LESSON_MOCKS pattern
            router = _build_router(store, args.lesson)
            if router is None:
                print(
                    f"Error: no mock registered for lesson '{args.lesson}'",
                    file=sys.stderr,
                )
                return 1

        if args.n_runs > 1:
            report = run_realtime_eval_n_runs(
                lesson_id=args.lesson,
                fixture_root=fixture_root,
                router=router,
                n=args.n_runs,
                model=args.model or "deepseek-chat",
            )
        else:
            report = run_realtime_eval(
                lesson_id=args.lesson,
                fixture_root=fixture_root,
                router=router,
                model=args.model or "deepseek-chat",
            )

        print(report.summary())
        return 0

    print(f"Unknown command: {args.command!r}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
