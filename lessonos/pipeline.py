"""Reusable pipeline orchestrator for LessonOS Core Engine.

``run_pipeline()`` loads a fixture path, processes all lessons (ingest →
segmentation → extraction → assembly), computes PathMemory → DidacticDelta
→ LearningDebt → NextLessonPlan, and returns a structured ``PipelineResult``
with all intermediate objects plus estimated cost.

This is the **product-level API** that the CLI wraps. Import and reuse:

    from lessonos.pipeline import run_pipeline, PipelineResult

    result = run_pipeline(fixture_root=Path("fixtures/sample_path"))
    print(result.summary)
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from lessonos.models.entities import GraphEdge, GraphNode

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.graph.builder import build_path_graph
from lessonos.graph.didactic_delta import DidacticDelta, compute_didactic_delta
from lessonos.graph.learning_debt import LearningDebtLedger, compute_learning_debt
from lessonos.graph.next_lesson_planner import NextLessonPlan, compute_next_lesson_plan
from lessonos.graph.path_memory import (
    PathMemory,
    apply_review_feedback,
    build_path_memory,
)
from lessonos.graph.writer import write_capsule_graph
from lessonos.llm.router import MockProvider, Router
from lessonos.store.base import Store
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_moments,
    ingest_lesson_segments,
    load_sample_path,
)
from lessonos.store.sqlite import SQLiteStore


# ---------------------------------------------------------------------------
# Mock payload definitions — one per lesson, keyed by lesson_id.
# Each entry is (seg_payload, ext_payload) matching the schema from
# build_segmentation_prompt / build_extraction_prompt.
# ---------------------------------------------------------------------------

LESSON_MOCKS: dict[str, tuple[list[dict], dict]] = {
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
    # ------------------------------------------------------------------ #
    # Spaced Path (2 lessons): spaced_repetition domain (SM-2, FSRS)
    # ------------------------------------------------------------------ #
    "l1_sm2_intro": (
        # seg_payload
        [
            {"topic": "Ripetizione spaziata e SM-2", "seg_ids": ["l1s1", "l1s2"]},
            {"topic": "Formula SM-2 e intervalli", "seg_ids": ["l1s3"]},
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "spaced repetition",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s1",
                            "excerpt": "ripetizione spaziata come tecnica di apprendimento",
                        }
                    ],
                },
                {
                    "name": "SM-2",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s2",
                            "excerpt": "SM-2 di SuperMemo con sei livelli",
                        }
                    ],
                },
                {
                    "name": "fattore di facilita",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s3",
                            "excerpt": "EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Calcola il prossimo intervallo SM-2 dato EF=2.5 e qualita=4.",
                    "citations": [{"seg_id": "l1s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Qual e il significato del fattore di facilita inferiore a 1.3?",
                    "citations": [{"seg_id": "l1s3"}],
                }
            ],
            "homework": [
                {
                    "task": "Implementa la funzione SM-2 in Python: aggiornamento EF e intervallo.",
                    "citations": [{"seg_id": "l1s3"}],
                }
            ],
        },
    ),
    "l2_fsrs_advanced": (
        # seg_payload
        [
            {"topic": "FSRS e parametri base", "seg_ids": ["l2s1"]},
            {"topic": "Funzione di ritenzione e aggiornamento", "seg_ids": ["l2s2"]},
            {"topic": "Ottimizzazione FSRS su dataset", "seg_ids": ["l2s3"]},
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
                            "excerpt": "FSRS con tre parametri: stabilita, difficolta, retrievability",
                        }
                    ],
                },
                {
                    "name": "stabilita del ricordo",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s1",
                            "excerpt": "stabilita S del ricordo",
                        }
                    ],
                },
                {
                    "name": "funzione di ritenzione",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s2",
                            "excerpt": "R(t) = exp(-t/S)",
                        }
                    ],
                },
                {
                    "name": "ottimizzazione cross-entropia",
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
                    "prompt": "Calcola la retrievability dopo 7 giorni con stabilita S=14.",
                    "citations": [{"seg_id": "l2s2"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Come differisce FSRS da SM-2 nella gestione della difficolta?",
                    "citations": [{"seg_id": "l2s1"}],
                }
            ],
            "homework": [
                {
                    "task": "Implementa la funzione di ritenzione R(t) e un passo di aggiornamento di S dopo una risposta.",
                    "citations": [{"seg_id": "l2s2"}],
                }
            ],
        },
    ),
    # ------------------------------------------------------------------ #
    # Bio Path (2 lessons): fotosintesi domain (biologia)
    # ------------------------------------------------------------------ #
    "l1_fotosintesi_intro": (
        # seg_payload
        [
            {
                "topic": "Fotosintesi clorofilliana",
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
                            "excerpt": "convertono l'energia luminosa in energia chimica",
                        }
                    ],
                },
                {
                    "name": "cloroplasto",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l1s2",
                            "excerpt": "cloroplasti, organelli che contengono clorofilla",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Bilancia la reazione di fotosintesi e identifica i reagenti e i prodotti.",
                    "citations": [{"seg_id": "l1s3"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche le foglie appaiono verdi se la clorofilla assorbe blu e rosso?",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
            "homework": [
                {
                    "task": "Disegna un diagramma del cloroplasto e etichetta tilacoidi e stroma.",
                    "citations": [{"seg_id": "l1s2"}],
                }
            ],
        },
    ),
    "l2_reazioni_luce": (
        # seg_payload
        [
            {
                "topic": "Reazioni luminose nei tilacoidi",
                "seg_ids": ["l2s1"],
            },
            {
                "topic": "Catena di trasporto elettronico e ATP",
                "seg_ids": ["l2s2"],
            },
            {
                "topic": "Riduzione di NADP+ e ciclo di Calvin",
                "seg_ids": ["l2s3"],
            },
        ],
        # ext_payload
        {
            "concepts": [
                {
                    "name": "tilacoide",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s1",
                            "excerpt": "tilacoidi dei cloroplasti",
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
                    "name": "ciclo di Calvin",
                    "status": "introduced",
                    "citations": [
                        {
                            "seg_id": "l2s3",
                            "excerpt": "ciclo di Calvin per la fissazione della CO2",
                        }
                    ],
                },
            ],
            "exercises": [
                {
                    "prompt": "Descrivi il percorso degli elettroni eccitati dalla clorofilla al NADPH.",
                    "citations": [{"seg_id": "l2s2"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Perche l'ossigeno prodotto nella fotosintesi deriva dall'acqua e non dalla CO2?",
                    "citations": [{"seg_id": "l2s3"}],
                }
            ],
            "homework": [
                {
                    "task": "Confronta fase luminosa e ciclo di Calvin in una tabella: input, output, localizzazione.",
                    "citations": [{"seg_id": "l2s1"}, {"seg_id": "l2s3"}],
                }
            ],
        },
    ),
}


# ---------------------------------------------------------------------------
# Public API — PipelineResult and run_pipeline
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class PipelineResult:
    """Result of a full pipeline run.

    Contains all intermediate objects so callers can inspect any stage without
    re-running.
    """

    path_id: str
    capsules: tuple[LessonCapsule, ...]
    memory: PathMemory
    delta: DidacticDelta
    debt: LearningDebtLedger
    plan: NextLessonPlan
    store: Any  # SQLiteStore; typed as Any to avoid import coupling
    graph_nodes: tuple[GraphNode, ...] = ()
    graph_edges: tuple[GraphEdge, ...] = ()
    elapsed_seconds: float = 0.0
    total_cost_usd: float = 0.0
    total_llm_calls: int = 0

    @property
    def summary(self) -> str:
        """One-line summary of the pipeline result."""
        return (
            f"Pipeline[{self.path_id}]: "
            f"{len(self.capsules)} capsules, "
            f"{self.memory.total_concepts} concepts, "
            f"{len(self.delta.new_concepts)} new-delta, "
            f"{self.debt.total_items} debt, "
            f"{self.plan.total_agenda_items} agenda, "
            f"{len(self.graph_nodes)} graph-nodes, "
            f"{len(self.graph_edges)} graph-edges, "
            f"${self.total_cost_usd:.4f} cost, "
            f"{self.elapsed_seconds:.1f}s"
        )


def _build_router_for_lesson(store: Store, lesson_id: str) -> Router | None:
    """Build a mock router with payloads for *lesson_id*. Returns None if unmocked."""
    mock_data = LESSON_MOCKS.get(lesson_id)
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


def run_pipeline(
    fixture_root: Path = DEFAULT_FIXTURE_ROOT,
    *,
    store: Store | None = None,
    review_feedback: dict[str, int] | None = None,
) -> PipelineResult:
    """Run the full LessonOS pipeline on a fixture path.

    Parameters
    ----------
    fixture_root : Path
        Directory containing ``path.json``, ``lessons/``, ``sources/``.
        Defaults to ``fixtures/sample_path`` relative to the project root.
    store : Store, optional
        An existing Store instance. If ``None``, creates an in-memory
        ``SQLiteStore``.
    review_feedback : dict[str, int], optional
        SM-2 quality scores (0–5) per concept name for post-lezione review
        feedback. If provided, ``apply_review_feedback`` is called after
        PathMemory build, updating difficulty values. The updated memory
        feeds into Delta, Debt, and Plan computation.

    Returns
    -------
    PipelineResult
        Structured result with all pipeline stages.
    """
    start_ts = time.monotonic()

    # Resolve and validate fixture root
    fixture_root = Path(fixture_root)
    if not fixture_root.exists():
        raise ValueError(
            f"Fixture path not found: {fixture_root}. "
            "Provide a path containing path.json, lessons/, and sources/."
        )
    if not (fixture_root / "path.json").exists():
        raise ValueError(
            f"No path.json in {fixture_root}. "
            "Fixture must contain a path.json manifest."
        )

    if store is None:
        store = SQLiteStore(":memory:")

    _store: Store = store  # for type narrowing

    # --- Phase 1: Load fixture ---
    path = load_sample_path(_store, fixture_root)
    lesson_ids = path.lesson_ids

    # --- Phase 2: Ingest segments + moments for each lesson ---
    for lid in lesson_ids:
        ingest_lesson_segments(_store, lid, fixture_root)
        ingest_lesson_moments(_store, lid, fixture_root)

    # --- Phase 3: Assemble capsules ---
    capsules: list[LessonCapsule] = []
    for lid in lesson_ids:
        router = _build_router_for_lesson(_store, lid)
        if router is None:
            continue
        capsule = assemble_lesson_capsule(_store, lid, router)
        capsules.append(capsule)

    final_capsules: list[LessonCapsule] = capsules

    # --- Phase 4: Lesson Graph (cross-lesson) ---
    g_nodes, g_edges = build_path_graph(final_capsules)

    # --- Phase 5: Path Memory ---
    memory = build_path_memory(final_capsules, path_title=path.title)

    # --- Phase 5b: Apply review feedback (optional hook) ---
    if review_feedback:
        memory = apply_review_feedback(memory, review_feedback)

    # --- Phase 6: Didactic Delta (first N-1 vs all N) ---
    if len(final_capsules) >= 2:
        old_memory = build_path_memory(final_capsules[:-1], path_title=path.title)
        delta = compute_didactic_delta(old_memory, memory)
    else:
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

    # --- Phase 7: Learning Debt ---
    debt = compute_learning_debt(memory, delta, path_id=path.path_id)

    # --- Phase 8: Next Lesson Plan ---
    plan = compute_next_lesson_plan(memory, delta, debt, path_id=path.path_id)

    elapsed = time.monotonic() - start_ts

    # Mock calls don't cost anything, but count them
    total_calls = len(lesson_ids) * 2  # each lesson = segmentation + extraction

    return PipelineResult(
        path_id=path.path_id,
        capsules=tuple(final_capsules),
        graph_nodes=tuple(g_nodes),
        graph_edges=tuple(g_edges),
        memory=memory,
        delta=delta,
        debt=debt,
        plan=plan,
        store=_store,
        elapsed_seconds=elapsed,
        total_cost_usd=0.0,
        total_llm_calls=total_calls,
    )


# ---------------------------------------------------------------------------
# M1-5.4: single-lesson ingest pipeline
# ---------------------------------------------------------------------------


def run_ingest(
    store: Store,
    lesson_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
) -> LessonCapsule:
    """Run the full ingest pipeline for a single lesson.

    Steps:
    1. ``store.delete_capsule`` + ``store.delete_graph_for_lesson`` — wipe
       the DERIVED data for this lesson. NOT ``purge_lesson``: segments are
       the source of the re-ingest and must survive (purge would erase them).
    2. ``assemble_lesson_capsule(store, lesson_id, router, *, save=True)`` —
       run the segmentation+extraction+assembly pipeline, persist the capsule.
    3. ``write_capsule_graph(store, capsule)`` — persist graph nodes, edges,
       and evidence for this lesson.

    Returns the assembled LessonCapsule.

    Raises:
        ValueError: If the lesson has no segments in the store.
    """
    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        raise ValueError(
            f"lesson {lesson_id!r} has no segments — cannot ingest"
        )

    # Step 1: purge derived data (capsule + graph) for this lesson.
    # Segments are SOURCE data, not derived — they must survive.
    store.delete_capsule(lesson_id)
    store.delete_graph_for_lesson(lesson_id)

    # Step 2: assemble and persist the capsule
    capsule = assemble_lesson_capsule(
        store, lesson_id, router, provider=provider, model=model, save=True
    )

    # Step 3: write the capsule graph
    write_capsule_graph(store, capsule)

    return capsule


def erase_lesson(
    store: Store,
    lesson_id: str,
    *,
    wiki_dir: str | Path | None = None,
) -> int:
    """GDPR erasure entry point: purge every trace of *lesson_id*.

    Calls ``store.purge_lesson`` (all DB tables, transactional) and, when
    *wiki_dir* is given, also unlinks the derived summary file
    ``<wiki_dir>/<lesson_id>.md``. Returns the total number of deleted
    rows/items (the wiki file counts as 1).

    Idempotent: erasing an already-erased lesson returns 0.
    """
    total = store.purge_lesson(lesson_id)
    if wiki_dir is not None:
        wiki_file = Path(wiki_dir) / f"{lesson_id}.md"
        if wiki_file.exists():
            wiki_file.unlink()
            total += 1
    return total
