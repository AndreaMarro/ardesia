"""Tests for the FastAPI minimale (M6-task2)."""

from __future__ import annotations

from fastapi.testclient import TestClient
from lessonos.api import app

client = TestClient(app)


class TestHealth:
    """``GET /health`` — health check."""

    def test_health_returns_200(self) -> None:
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_has_status_and_version(self) -> None:
        resp = client.get("/health")
        data = resp.json()
        assert data["status"] == "ok"
        assert data["version"] == "0.1.0"


class TestDemoPipeline:
    """``POST /paths/demo`` — full demo pipeline."""

    def test_demo_returns_200(self) -> None:
        resp = client.post("/paths/demo")
        assert resp.status_code == 200

    def test_demo_has_all_sections(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        expected_keys = {"path", "capsules", "memory", "delta", "debt", "plan"}
        assert set(data.keys()) == expected_keys

    def test_demo_capsules_is_list_of_4(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        capsules = data["capsules"]
        assert isinstance(capsules, list)
        assert len(capsules) == 4  # 4 lessons in sample_path (L1+L2+L3+L4)

    def test_demo_capsule_grounded_citations(self) -> None:
        """Every citation has non-empty seg_id AND non-empty excerpt."""
        resp = client.post("/paths/demo")
        data = resp.json()
        for capsule in data["capsules"]:
            content = capsule["content"]
            for concept in content["concepts"]:
                for cit in concept["citations"]:
                    assert cit["seg_id"]
                    assert cit.get("excerpt"), f"missing excerpt for {cit['seg_id']}"
            for exercise in content["exercises"]:
                for cit in exercise["citations"]:
                    assert cit["seg_id"]
            for question in content["student_questions"]:
                for cit in question["citations"]:
                    assert cit["seg_id"]
            for hw in content["homework"]:
                for cit in hw["citations"]:
                    assert cit["seg_id"]

    def test_demo_memory_has_expected_content(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        memory = data["memory"]
        assert isinstance(memory["current_state"], str)
        assert memory["total_lessons"] == 4
        # 8 canonical concepts from 4 lessons: derivata, rapporto_incrementale,
        # regola_della_potenza, regola_della_catena, integrale, antiderivata,
        # teorema_fondamentale_del_calcolo, sostituzione
        assert memory["total_concepts"] == 8

    def test_demo_delta_has_expected_values(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        delta = data["delta"]
        # L1+L2+L3+L4 introduces 1 new concept (sostituzione) vs L1+L2+L3
        assert delta["total_new_concepts"] == 1
        assert delta["total_clarified"] == 0
        assert delta["total_still_open"] == 0

    def test_demo_debt_has_items(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        debt = data["debt"]
        assert isinstance(debt["items"], list)
        assert debt["total_items"] >= 0

    def test_demo_plan_has_agenda(self) -> None:
        resp = client.post("/paths/demo")
        data = resp.json()
        plan = data["plan"]
        assert isinstance(plan["prerequisite_gaps"], list)
        assert isinstance(plan["review_items"], list)
        assert isinstance(plan["new_material_items"], list)
        assert plan["total_agenda_items"] >= 0

    def test_demo_capsule_topics_are_grounded(self) -> None:
        """TopicSpan entries have non-empty seg_ids list and valid timestamps."""
        resp = client.post("/paths/demo")
        data = resp.json()
        for capsule in data["capsules"]:
            for topic in capsule["timeline"]:
                assert len(topic["seg_ids"]) > 0
                assert isinstance(topic["start"], (int, float))
                assert topic["start"] >= 0
                assert topic["end"] > topic["start"]
