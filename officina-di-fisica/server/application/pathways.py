"""Read use case. A session-scoped adapter supplies only the learner's accessible records."""
from typing import Protocol
from ..domain.pathway import pathway


class LearningRepository(Protocol):
    def objects(self, course: str) -> list[dict]: ...
    def observations(self) -> dict: ...


def learning_path(repository: LearningRepository, course: str) -> dict:
    return {"apiVersion": "1.0.0", "course": course,
            "lessons": pathway(repository.objects(course), repository.observations())}
