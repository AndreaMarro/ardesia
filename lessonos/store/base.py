"""Abstract persistence layer for LessonOS (PLAN §14, "astrai il layer DB").

The engine talks to ``Store``, never to a concrete backend. v0 ships a SQLite
implementation; prod target is Postgres+pgvector — swapping it must not touch
callers. This base file fixes the contract; concrete backends live alongside.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from lessonos.models.entities import Lesson, Path, Segment, Source


class Store(ABC):
    """Persistence contract for the domain entities (round-trip, no I/O leak)."""

    @abstractmethod
    def save_path(self, path: Path) -> None: ...

    @abstractmethod
    def get_path(self, path_id: str) -> Path | None: ...

    @abstractmethod
    def save_lesson(self, lesson: Lesson) -> None: ...

    @abstractmethod
    def get_lesson(self, lesson_id: str) -> Lesson | None: ...

    @abstractmethod
    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]: ...

    @abstractmethod
    def save_source(self, source: Source) -> None: ...

    @abstractmethod
    def get_source(self, source_id: str) -> Source | None: ...

    @abstractmethod
    def save_segment(self, segment: Segment) -> None: ...

    @abstractmethod
    def get_segment(self, seg_id: str) -> Segment | None: ...

    @abstractmethod
    def segments_for_lesson(self, lesson_id: str) -> tuple[Segment, ...]: ...

    @abstractmethod
    def close(self) -> None: ...
