import sys
import os
import json
import yaml
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def test_registry_discovers_sections(tmp_path):
    from brain_factory.registry import discover_sections

    section_dir = tmp_path / "sections"
    section_dir.mkdir()
    (section_dir / "01_test.yml").write_text(yaml.dump({
        "id": "test",
        "name": "Test",
        "intent": "action",
        "needs_llm": False,
        "templates": [{"input": "avvia", "response": "Avviato.", "actions": ["[AZIONE:play]"], "entities": []}],
    }))

    sections = discover_sections(str(section_dir))
    assert "test" in sections
    assert sections["test"]["name"] == "Test"


def test_registry_empty_dir(tmp_path):
    from brain_factory.registry import discover_sections

    section_dir = tmp_path / "empty"
    section_dir.mkdir()
    sections = discover_sections(str(section_dir))
    assert sections == {}


def test_registry_nonexistent_dir():
    from brain_factory.registry import discover_sections

    sections = discover_sections("/nonexistent/path")
    assert sections == {}


def test_engine_generates_dataset(tmp_path):
    from brain_factory.engine import BrainEngine

    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Test system prompt.")
    (configs_dir / "responses.yml").write_text(yaml.dump({"action_play": ["Avviato."]}))
    (sections_dir / "01_test.yml").write_text(yaml.dump({
        "id": "test",
        "name": "Test",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {"input": "avvia", "response": "Avviato.", "actions": ["[AZIONE:play]"], "entities": []},
            {"input": "pausa", "response": "In pausa.", "actions": ["[AZIONE:pause]"], "entities": []},
            {"input": "reset", "response": "Reset.", "actions": ["[AZIONE:reset]"], "entities": []},
        ],
        "corruptions": {"typo_swap": 0.5},
    }))

    profile = {
        "target": 20,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "test-output.jsonl",
        "sections": {"test": {"weight": 100}},
    }

    output_dir = str(tmp_path / "output")
    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=output_dir)
    result = engine.generate(profile)

    assert result["total"] > 0
    assert (tmp_path / "output" / "test-output.jsonl").exists()
    assert (tmp_path / "output" / "test-output.manifest.json").exists()

    # Check manifest
    manifest = json.loads((tmp_path / "output" / "test-output.manifest.json").read_text())
    assert "generated_at" in manifest
    assert "git_hash" in manifest
    assert manifest["total"] == result["total"]


def test_engine_deduplicates(tmp_path):
    from brain_factory.engine import BrainEngine

    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Prompt.")
    (sections_dir / "01_dup.yml").write_text(yaml.dump({
        "id": "dup",
        "name": "Dup Test",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {"input": "avvia", "response": "Go.", "actions": [], "entities": []},
        ],
        "corruptions": {},  # No corruption = all identical
    }))

    profile = {
        "target": 100,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "dup-test.jsonl",
        "sections": {"dup": {"weight": 100}},
    }

    output_dir = str(tmp_path / "output")
    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=output_dir)
    result = engine.generate(profile)

    # Without corruption, all inputs are "avvia" — section-level dedup yields 1
    # Engine-level dedup may see 0 duplicates (section already handles it)
    assert result["total"] == 1


def test_engine_dry_run(tmp_path):
    from brain_factory.engine import BrainEngine

    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Prompt.")
    (sections_dir / "01_a.yml").write_text(yaml.dump({
        "id": "a", "name": "A", "intent": "action", "templates": [],
    }))
    (sections_dir / "02_b.yml").write_text(yaml.dump({
        "id": "b", "name": "B", "intent": "tutor", "templates": [],
    }))

    profile = {
        "target": 1000,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "dry.jsonl",
        "sections": {"a": {"weight": 60}, "b": {"weight": 40}},
    }

    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=str(tmp_path / "output"))
    result = engine.generate(profile, dry_run=True)

    assert result["dry_run"] is True
    assert result["section_targets"]["a"] == 600
    assert result["section_targets"]["b"] == 400
    # No file should be written
    assert not (tmp_path / "output" / "dry.jsonl").exists()


def test_engine_only_filter(tmp_path):
    from brain_factory.engine import BrainEngine

    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Prompt.")
    (sections_dir / "01_a.yml").write_text(yaml.dump({
        "id": "a", "name": "A", "intent": "action", "needs_llm": False,
        "templates": [{"input": "avvia", "response": "Go.", "actions": [], "entities": []}],
        "corruptions": {"typo_swap": 0.5},
    }))
    (sections_dir / "02_b.yml").write_text(yaml.dump({
        "id": "b", "name": "B", "intent": "tutor", "needs_llm": True,
        "templates": [{"input": "cos'è un LED?", "llm_hint": "Teoria LED", "actions": [], "entities": []}],
        "corruptions": {"typo_swap": 0.3},
    }))

    profile = {
        "target": 50,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "only-test.jsonl",
        "sections": {"a": {"weight": 50}, "b": {"weight": 50}},
    }

    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=str(tmp_path / "output"))
    result = engine.generate(profile, only=["a"])

    # Only section "a" should be generated
    assert "a" in result["sections"]
    assert "b" not in result["sections"]


def test_engine_jsonl_valid(tmp_path):
    from brain_factory.engine import BrainEngine

    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Prompt.")
    (sections_dir / "01_test.yml").write_text(yaml.dump({
        "id": "test", "name": "Test", "intent": "action", "needs_llm": False,
        "templates": [
            {"input": "avvia", "response": "Go.", "actions": ["[AZIONE:play]"], "entities": []},
            {"input": "pausa", "response": "Stop.", "actions": ["[AZIONE:pause]"], "entities": []},
        ],
        "corruptions": {"typo_swap": 0.3},
    }))

    profile = {
        "target": 30,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "valid-test.jsonl",
        "sections": {"test": {"weight": 100}},
    }

    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=str(tmp_path / "output"))
    engine.generate(profile)

    # Every line must be valid JSON
    jsonl_path = tmp_path / "output" / "valid-test.jsonl"
    with open(jsonl_path) as f:
        for line in f:
            ex = json.loads(line)
            assert "messages" in ex
            assert len(ex["messages"]) == 3
            # No internal keys leaked
            assert "_clean_input" not in ex
