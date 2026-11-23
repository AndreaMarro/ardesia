"""Publish a complete, validated dependency graph at one transaction boundary."""
from typing import Protocol
from ..domain.errors import require
from ..domain.pathway import prerequisites, unique_experiments


class PublicationRepository(Protocol):
    def published(self) -> list[dict]: ...
    def draft(self, key: str, version: int) -> dict: ...
    def validate(self, record: dict, graph: dict) -> None: ...
    def promote(self, key: str, version: int, author: str) -> None: ...


def publish(repo: PublicationRepository, author: str, targets: dict) -> dict:
    require(isinstance(targets, dict) and targets, "Seleziona almeno una bozza.")
    graph = {r["id"]: r for r in repo.published()}
    for key, version in targets.items():
        graph[key] = repo.draft(key, version)
    for key in targets:
        repo.validate(graph[key], graph)
    prerequisites(graph)
    prerequisites(graph, "course")
    unique_experiments(graph)
    for key, version in targets.items():
        repo.promote(key, version, author)
    return {"count": len(targets)}
