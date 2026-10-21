"""Independent acceptance probe: execute the real bank/API, synthetic SQLite only.

Usage:
  ARDESIA_REPO_ROOT=/path/to/checkout python -m pytest -q -s this_file.py
No product files or bank records are changed. A red gate is an actual failure.
"""
from collections import Counter
import json
import os
from pathlib import Path
import resource
import subprocess
import sys
import time

import pytest

REPO = Path(os.environ["ARDESIA_REPO_ROOT"]).resolve()
sys.path[:0] = [str(REPO / "packages/engine"), str(REPO / "services/study-api")]

from fastapi.testclient import TestClient
from lessonos.study.question_bank import clear_bank_cache, load_bank
from lessonos.study.store import StudyStore
from study_api.app import create_app

OUTPUT = Path(os.environ.get("ARDESIA_PROBE_OUTPUT", Path(__file__).parent))
BASE = "/study/editions/probe-physics/question-banks/physics-semestre-2026"


@pytest.fixture(scope="module")
def observation(tmp_path_factory):
    clear_bank_cache()
    start = time.monotonic()
    bank = load_bank()
    cold_load = time.monotonic() - start
    path = tmp_path_factory.mktemp("bank-api") / "study.sqlite"
    store = StudyStore(path)
    teacher = store.create_principal("probe-teacher-001", "teacher")
    student = store.create_principal("probe-student-001", "student")
    outsider = store.create_principal("probe-student-002", "student")
    store.create_edition(teacher, "probe-physics")
    store.add_test_member(teacher, "probe-physics", student.id)
    tokens = {"student": store.issue_session(student), "outsider": store.issue_session(outsider)}

    def persistence_counts():
        tables = {row[0] for row in store.connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        return {table: store.connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                if table in tables else None
                for table in ("study_submissions", "study_receipts", "study_exam_attempts")}

    with TestClient(create_app(path, demo=True)) as client:
        anonymous = client.get(BASE + "/questions").status_code
        assert client.post("/study/session", json={"token": tokens["outsider"]}).status_code == 200
        outsider_status = client.get(BASE + "/questions").status_code
        assert client.post("/study/session", json={"token": tokens["student"]}).status_code == 200
        page = client.get(BASE + "/questions", params={"limit": 2})
        assert page.status_code == 200, page.text
        page_json = page.json()
        before = persistence_counts()
        exam = client.post(BASE + "/exams", json={"seed": "independent-contract-probe", "bankSha256": bank.sha256})
        assert exam.status_code == 200, exam.text
        exam_json = exam.json()
        first_question = exam_json["questions"][0]
        feedback = client.post(BASE + "/attempts", json={
            "questionId": first_question["id"], "response": "", "bankSha256": bank.sha256})
        assert feedback.status_code == 200, feedback.text
        feedback_json = feedback.json()
        after = persistence_counts()
        changed_pin = client.post(BASE + "/attempts", json={
            "questionId": first_question["id"], "response": "", "bankSha256": "0" * 64}).status_code
        filtered = client.get(BASE + "/questions", params={"unitId": "U6", "difficulty": "difficile", "format": "completion", "limit": 10})
        assert filtered.status_code == 200, filtered.text

        # Verify declared completion aliases against the actual deterministic grader.
        # This checks the runtime contract, not independent scientific correctness.
        rejected_aliases = []
        for question in bank._questions:
            if question["format"] != "completion":
                continue
            for alias in question["answer"]["accepted"]:
                if bank.attempt(question["id"], alias)["outcome"] != "correct":
                    rejected_aliases.append({"id": question["id"], "revision": question["version"], "alias": alias})

        result = {
            "sourceSha": subprocess.check_output(["git", "-C", str(REPO), "rev-parse", "HEAD"], text=True).strip(),
            "environment": "FastAPI TestClient/ASGI real handlers, real QuestionBank records, synthetic SQLite; no browser or PostgreSQL",
            "bankSha256": bank.sha256,
            "bankRecordCount": len(bank._questions),
            "statusCounts": dict(Counter(q["status"] for q in bank._questions)),
            "coldLoadSeconds": round(cold_load, 4),
            "processPeakRssKiB": resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
            "access": {"anonymousStatus": anonymous, "outsiderStatus": outsider_status,
                       "studentPageStatus": page.status_code, "changedPinStatus": changed_pin},
            "studentPage": {"total": page_json["total"], "ids": [q["id"] for q in page_json["items"]],
                            "statuses": [q["status"] for q in page_json["items"]],
                            "hasAnswerOrSolution": any(key in q for q in page_json["items"] for key in ("answer", "solution", "solutionSteps"))},
            "exam": {"keys": sorted(exam_json), "questionCount": len(exam_json["questions"]),
                     "formatCounts": dict(Counter(q["format"] for q in exam_json["questions"])),
                     "optionCounts": sorted({len(q["options"]) for q in exam_json["questions"] if q["format"] == "multiple_choice"}),
                     "durationSeconds": exam_json["durationSeconds"]},
            "feedbackBeforeAnyDurableSubmission": {"questionId": first_question["id"], "response": "",
                "statusCode": feedback.status_code, "outcome": feedback_json["outcome"],
                "hasAnswer": "answer" in feedback_json, "hasSolution": bool(feedback_json.get("solution")),
                "persisted": feedback_json.get("persisted")},
            "persistenceBefore": before, "persistenceAfter": after,
            "rejectedDeclaredCompletionAliases": rejected_aliases,
            "filteredQuestions": [{"unit": q["taxonomy"]["unitId"], "difficulty": q["difficulty"]["level"], "format": q["format"]}
                                  for q in filtered.json()["items"]],
        }
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / "bank-contract-observed.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        yield result
    store.close()
    clear_bank_cache()


def test_students_cannot_receive_unapproved_drafts(observation):
    assert observation["studentPage"]["statuses"] == [], (
        "Publication gate violated: a synthetic student received unapproved DRAFT questions "
        f"{observation['studentPage']['ids']} before any human scientific/editorial approval.")


def test_access_projection_and_version_controls(observation):
    assert observation["access"] == {"anonymousStatus": 401, "outsiderStatus": 403,
                                     "studentPageStatus": 200, "changedPinStatus": 409}
    assert observation["studentPage"]["hasAnswerOrSolution"] is False
    assert observation["exam"]["formatCounts"] == {"multiple_choice": 21, "completion": 10}
    assert observation["exam"]["optionCounts"] == [5]
    assert observation["exam"]["durationSeconds"] == 3000
    assert observation["filteredQuestions"] and all(
        q == {"unit": "U6", "difficulty": "difficile", "format": "completion"}
        for q in observation["filteredQuestions"])


def test_declared_completion_aliases_are_accepted(observation):
    assert observation["rejectedDeclaredCompletionAliases"] == []
