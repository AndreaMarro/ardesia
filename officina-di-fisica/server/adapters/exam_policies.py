from functools import lru_cache
import json
from pathlib import Path
from .contracts import schema, validate
from ..domain.errors import require


@lru_cache
def bundled():
    return json.loads((Path(__file__).resolve().parents[2] / "policies/exams.json").read_text())


def exam_policy(course):
    policy = course.get("assessmentProfile", bundled().get(course["id"]))
    if policy is not None:
        validate(policy, schema("exam-v1"))
        require(len(set(policy["minutes"])) == len(policy["minutes"]) and policy["choices"] + policy["completions"] > 0,
                "Durate o numero di domande non validi.")
    return policy
