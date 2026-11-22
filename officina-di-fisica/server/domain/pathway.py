"""The published prerequisite graph and the learning decision do not access I/O."""
from collections import defaultdict
from graphlib import CycleError, TopologicalSorter

from .errors import Problem, require


def prerequisites(objects: dict, kind: str = "lesson") -> None:
    field = "prerequisites" if kind == "lesson" else "includes"
    edges = {key: tuple(row.get(field, ())) for key, row in objects.items() if row["kind"] == kind}
    for key, dependencies in edges.items():
        require(all(isinstance(k, str) and k in edges for k in dependencies),
                f"Prerequisito o inclusione assente per {key}.")
        require(len(set(dependencies)) == len(dependencies), f"Collegamento duplicato in {key}.")
    try:
        tuple(TopologicalSorter(edges).static_order())
    except CycleError as error:
        raise Problem("Ciclo di " + field + ": " + " → ".join(error.args[1])) from error


def pathway(objects: list, observations: dict) -> list:
    lessons = {r["id"]: r for r in objects if r["kind"] == "lesson"}
    resources = defaultdict(lambda: defaultdict(list))
    for row in objects:
        if row.get("skill") in lessons and row["kind"] in ("example", "experiment", "question"):
            resources[row["skill"]][row["kind"]].append(row["id"])
    result = []
    for key, lesson in lessons.items():
        prior = [p for p in lesson.get("prerequisites", []) if p in lessons]
        evidence = observations.get(key, {})
        state = evidence.get("state", "da esplorare")
        weak = next((p for p in prior if observations.get(p, {}).get("state") == "da consolidare"), None)
        options = resources[key]
        if weak:
            action = ("lesson", weak, "Riprendi il prerequisito prima di applicarlo.")
        elif state == "da consolidare" and options["example"]:
            action = ("example", options["example"][0], "Segui un esempio svolto, poi riprova in autonomia.")
        elif state == "risultati stabili" and options["question"]:
            action = ("practice", key, "Controlla il trasferimento su un problema della stessa competenza.")
        elif evidence.get("families") and options["experiment"]:
            action = ("experiment", options["experiment"][0], "Prevedi la misura e controllala nel laboratorio.")
        else:
            action = ("lesson", key, "Studia la spiegazione e individua la grandezza da osservare.")
        result.append({"id": key, "title": lesson["title"], "version": lesson["version"],
                       "competencies": lesson.get("coverage", []), "prerequisites": prior,
                       "mastery": state, "independentFamilies": evidence.get("families", 0),
                       "resources": dict(options), "next": dict(zip(("kind", "id", "reason"), action))})
    return result
