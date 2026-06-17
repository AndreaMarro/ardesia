"""P1 eval su raw: run end-to-end LessonOS pipeline on raw transcript text.

Takes arbitrary prose (lecture transcript), chunks it with the rule-based
chunker (ZERO-LLM), persists the chunks as Segments, then runs the full
LessonOS pipeline (segmentation -> extraction -> assembly) with a real or
mock LLM. Measures groundedness + citation-excerpt-accuracy + quality
metrics — produces an honest report of failure modes.

Design (COORDINATION.md §18 — Andrea via Claude M7 P1):
- No PII (fixture data only)
- No new deps (stdlib + existing chunker)
- Zero-LLM for chunking; LLM only for segmentation/extraction
- Fails fast on invalid input (ValueError)
- Mock tests = free and deterministic
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path as FsPath
from typing import Any

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.eval.metrics import (
    build_citation_excerpt_accuracy_metric,
    build_groundedness_metric,
)
from lessonos.eval.realtime import _parse_score
from lessonos.ingest.chunker import ChunkResult, ChunkResultItem, chunk_raw_text
from lessonos.llm.cost_ledger import CostLedger
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.kimi import KimiProvider
from lessonos.llm.router import LLMResponse, Router
from lessonos.models.entities import Segment
from lessonos.store.sqlite import SQLiteStore


@dataclass(frozen=True)
class RawTranscriptEvalReport:
    """Result of a raw-transcript eval run.

    Extends RealtimeEvalReport with raw-specific quality indicators:
    segmentation quality (number of chunks, topics per chunk ratio)
    and failure mode documentation.

    Attributes:
        lesson_id: The lesson that was processed.
        groundedness_score: Fraction of citations with valid seg_ids (0.0-1.0).
        groundedness_passed: True if ALL citations are grounded.
        excerpt_accuracy_score: Fraction of excerpts matching source text (0.0-1.0).
        excerpt_accuracy_passed: True if ALL checked excerpts match.
        total_citations: Total citations found in the capsule.
        capsule: The assembled LessonCapsule (useful for further analysis).
        total_cost_usd: Estimated USD cost for all LLM calls in this run.
        total_tokens: Total tokens (prompt + completion) consumed.
        llm_calls: Number of LLM calls made.
        error: Error message if the run failed, None otherwise.
        # Raw-specific fields
        num_chunks: Number of chunks produced by the rule-based chunker.
        num_topics: Number of topics identified by LLM segmentation.
        num_concepts: Number of concepts extracted.
        chunks_with_topics: If chunker produced N chunks and LLM grouped
            them into M topics, high M/N ratio suggests over-segmentation.
            Near 1.0 may mean the LLM mapped each chunk to its own topic
            (low abstraction = possible failure mode).
        source_type: Source type of the raw input ("raw", "vtt", "srt").
        failure_modes: Documentation of observed failure modes.
    """

    lesson_id: str
    groundedness_score: float
    groundedness_passed: bool
    excerpt_accuracy_score: float
    excerpt_accuracy_passed: bool
    total_citations: int
    capsule: LessonCapsule | None
    total_cost_usd: float
    total_tokens: int
    llm_calls: int
    error: str | None = None
    # Raw-specific
    num_chunks: int = 0
    num_topics: int = 0
    num_concepts: int = 0
    chunks_with_topics: float = 0.0
    source_type: str = "raw"
    failure_modes: tuple[str, ...] = ()

    def summary(self) -> str:
        """One-line summary of the eval result."""
        if self.error:
            return f"[ERROR] {self.lesson_id}: {self.error}"
        parts = [
            f"groundedness={self.groundedness_score:.2f} "
            f"({'PASS' if self.groundedness_passed else 'FAIL'})",
            f"excerpt={self.excerpt_accuracy_score:.2f} "
            f"({'PASS' if self.excerpt_accuracy_passed else 'FAIL'})",
            f"citations={self.total_citations}",
            f"chunks={self.num_chunks}",
            f"topics={self.num_topics}",
            f"concepts={self.num_concepts}",
            f"chunks/topics={self.chunks_with_topics:.2f}",
            f"cost=${self.total_cost_usd:.6f}",
            f"tokens={self.total_tokens}",
            f"llm_calls={self.llm_calls}",
        ]
        return f"[RAW-EVAL] {self.lesson_id}: {' | '.join(parts)}"


# ---------------------------------------------------------------------------
# Ingest raw chunks into the store as Segments
# ---------------------------------------------------------------------------


def _ingest_chunk_result(
    store: SQLiteStore,
    lesson_id: str,
    chunk_result: ChunkResult,
) -> list[Segment]:
    """Convert a ChunkResult into persisted Segments.

    For raw text (no timestamps) we assign character-offset positions.
    For VTT/SRT we use the actual start/end seconds from cues.

    Returns the list of Segments (for backward inspection).
    """
    segments: list[Segment] = []
    for item in chunk_result.items:
        if item.start is not None and item.end is not None:
            # Timestamped chunk (VTT/SRT)
            start_pos = item.start
            end_pos = item.end
        else:
            # Raw text chunk — use 0 as position (no timestamps)
            start_pos = 0
            end_pos = 0

        seg = Segment(
            seg_id=item.seg_id,
            lesson_id=lesson_id,
            start=start_pos,
            end=end_pos,
            text=item.text,
        )
        store.save_segment(seg)
        segments.append(seg)

    return segments


# ---------------------------------------------------------------------------
# Core function
# ---------------------------------------------------------------------------


def run_raw_transcript_eval(
    raw_text: str,
    *,
    lesson_id: str = "raw_lesson",
    source_id: str = "raw_lesson",
    source_type: str = "raw",
    router: Router | None = None,
    model: str = "deepseek-chat",
    defensive: bool = False,
) -> RawTranscriptEvalReport:
    """Run the full LessonOS pipeline on raw transcript text.

    Steps:
    1. Chunk raw text -> ChunkResult (rule-based, ZERO-LLM)
    2. Ingest chunks as Segments
    3. Assemble Lesson Capsule via LLM (or mock)
    4. Measure groundedness + excerpt-accuracy
    5. Collect quality metrics + failure modes

    Parameters
    ----------
    raw_text : str
        Raw prose to process.  Can be plain text or VTT/SRT.
    lesson_id : str
        Lesson identifier for store operations (default ``"raw_lesson"``).
    source_id : str
        Prefix for generated segment ids (default ``"raw_lesson"``).
    source_type : str
        Source type passed to chunker: ``"raw"``, ``"vtt"``, or ``"srt"``.
    router : Router | None
        LLM router. If None, tries DeepSeek from env then Kimi.
    model : str
        Model name (default ``"deepseek-chat"``).
    defensive : bool
        When True (FM4), malformed single items from the LLM (fabricated
        seg_ids, missing/None fields) are dropped and recorded in
        ``capsule.dropped`` instead of failing the run. The eval then ALWAYS
        returns a capsule with ``error=None`` on a real transcript. Default
        False preserves strict grounding (fabricated seg_id ⇒ error report).

    Returns
    -------
    RawTranscriptEvalReport
        Quality metrics + cost + failure modes.
    """
    store = SQLiteStore(":memory:")

    # --- Phase 1: Chunk raw text ---
    raw_text = raw_text.strip()
    if not raw_text:
        return RawTranscriptEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
            error="Empty raw text input",
        )

    if source_type == "vtt":
        chunk_result = chunk_vtt(raw_text, source_id=source_id)
    elif source_type == "srt":
        chunk_result = chunk_srt(raw_text, source_id=source_id)
    else:
        chunk_result = chunk_raw_text(raw_text, source_id=source_id)

    if not chunk_result.items:
        return RawTranscriptEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
            error=f"Chunking produced 0 items (source_type={source_type})",
        )

    # --- Phase 2: Ingest chunks as Segments ---
    _ingest_chunk_result(store, lesson_id, chunk_result)

    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        return RawTranscriptEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
            error="No segments after chunk ingestion",
        )

    # --- Phase 3: Build or use provided router ---
    import os

    ledger = CostLedger()

    if router is None:
        # Try DeepSeek first (primary brain per POLICY CERVELLO), then Kimi.
        api_key = os.environ.get("DEEPSEEK_API_KEY")
        deepseek_provider = None
        if api_key:
            deepseek_provider = DeepSeekProvider(
                api_key=api_key, model=model
            )
        else:
            # Fallback: try .env file in project root
            try:
                deepseek_provider = DeepSeekProvider(model=model)
            except RuntimeError:
                pass

        if deepseek_provider is not None:
            router = Router()
            router.register(deepseek_provider)
        else:
            api_key = os.environ.get("KIMI_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "No router provided and neither DEEPSEEK_API_KEY nor "
                    "KIMI_API_KEY are set. "
                    "Provide a mock Router for tests, or export one of the keys."
                )
            kimi = KimiProvider(
                api_key=api_key, model=model or "kimi-k2-0905-preview"
            )
            router = Router()
            router.register(kimi)

    # Wrap router to track costs through the ledger
    original_complete = router.complete

    def _tracked_complete(
        prompt: str, *, provider: str, model: str | None = None
    ) -> LLMResponse:
        response = original_complete(prompt, provider=provider, model=model)
        ledger.add_from_response(
            response,
            lesson_id=lesson_id,
            label=f"raw_eval_{provider}",
        )
        return response

    router.complete = _tracked_complete  # type: ignore[method-assign]

    # --- Phase 4: Assemble capsule ---
    if router.has_provider("deepseek"):
        provider_name = "deepseek"
    elif router.has_provider("kimi"):
        provider_name = "kimi"
    else:
        provider_name = "mock"

    try:
        capsule = assemble_lesson_capsule(
            store, lesson_id, router, provider=provider_name,
            defensive=defensive,
        )
    except Exception as exc:
        cost = ledger.total_cost()
        tokens = sum(
            e.prompt_tokens + e.completion_tokens for e in ledger.entries
        )
        return RawTranscriptEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=cost,
            total_tokens=tokens,
            llm_calls=len(ledger.entries),
            error=f"Assembly failed: {type(exc).__name__}: {exc}",
            num_chunks=len(chunk_result.items),
            source_type=chunk_result.source_type,
        )

    # --- Phase 5: Measure quality ---
    g_metric = build_groundedness_metric(store)
    e_metric = build_citation_excerpt_accuracy_metric(store)

    try:
        grounded_passed, grounded_detail = g_metric.check(capsule)
    except Exception as exc:
        grounded_passed, grounded_detail = False, f"metric raised: {exc}"

    try:
        excerpt_passed, excerpt_detail = e_metric.check(capsule)
    except Exception as exc:
        excerpt_passed, excerpt_detail = False, f"metric raised: {exc}"

    grounded_score = _parse_score(grounded_detail)
    excerpt_score = _parse_score(excerpt_detail)

    from lessonos.eval.metrics import _collect_citations

    all_citations = _collect_citations(capsule)

    # --- Phase 6: Compute quality metrics ---
    num_chunks = len(chunk_result.items)
    num_topics = len(capsule.timeline)
    num_concepts = len(capsule.content.concepts)
    chunks_with_topics = num_chunks / max(num_topics, 1)

    # Collect failure modes
    failure_modes: list[str] = []
    if num_topics > num_chunks:
        failure_modes.append(
            "LLM produced more topics than chunks — likely over-splitting "
            f"({num_topics} topics from {num_chunks} chunks)"
        )
    if num_topics == num_chunks and num_chunks > 1:
        failure_modes.append(
            "Each chunk got its own topic — LLM may not be abstracting, "
            f"just re-labeling chunks ({num_topics} topics = {num_chunks} chunks)"
        )
    if num_concepts >= num_chunks * 2 and num_chunks > 1:
        failure_modes.append(
            "Very high concept extraction rate — possible over-extraction "
            f"({num_concepts} concepts from {num_chunks} chunks)"
        )

    total_cost = ledger.total_cost()
    total_tokens = sum(
        e.prompt_tokens + e.completion_tokens for e in ledger.entries
    )

    return RawTranscriptEvalReport(
        lesson_id=lesson_id,
        groundedness_score=grounded_score,
        groundedness_passed=grounded_passed,
        excerpt_accuracy_score=excerpt_score,
        excerpt_accuracy_passed=excerpt_passed,
        total_citations=len(all_citations),
        capsule=capsule,
        total_cost_usd=total_cost,
        total_tokens=total_tokens,
        llm_calls=len(ledger.entries),
        num_chunks=num_chunks,
        num_topics=num_topics,
        num_concepts=num_concepts,
        chunks_with_topics=chunks_with_topics,
        source_type=chunk_result.source_type,
        failure_modes=tuple(failure_modes),
    )


# Re-export for convenience
from lessonos.ingest.chunker import chunk_srt, chunk_vtt  # noqa: E402, F811
