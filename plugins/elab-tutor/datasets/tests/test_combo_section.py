import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from brain_factory.sections.combo_section import ComboSection
from brain_factory.corruption import CorruptionPipeline

COMPONENTS_DATA = {
    "led": {"slang": ["led", "lucina", "lampadina"]},
    "resistor": {"slang": ["resistenza", "resistore"]},
    "buzzer-piezo": {"slang": ["buzzer", "cicalino"]},
    "capacitor": {"slang": ["condensatore", "cap"]},
    "potentiometer": {"slang": ["potenziometro", "manopola"]},
}

ACTION_VERBS = ["metti", "aggiungi", "piazza", "mettimi", "voglio"]
CONJUNCTIONS = ["e", "con", "più", ",", "e anche"]


def test_combo_generates_correct_count():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=50)
    assert len(examples) == 50


def test_combo_has_multi_component_entities():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=50)
    multi = [
        ex for ex in examples
        if len(json.loads(ex["messages"][2]["content"])["entities"]) > 1
    ]
    assert len(multi) == 50  # All should be multi-component


def test_combo_intent_is_circuit():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=20)
    for ex in examples:
        output = json.loads(ex["messages"][2]["content"])
        assert output["intent"] == "circuit"
        assert len(output["actions"]) > 0
        assert output["needs_llm"] is False


def test_combo_has_place_and_wire_action():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=10)
    for ex in examples:
        output = json.loads(ex["messages"][2]["content"])
        action_str = output["actions"][0]
        assert "[INTENT:" in action_str
        intent_json = json.loads(action_str.replace("[INTENT:", "").rstrip("]"))
        assert intent_json["action"] == "place_and_wire"
        assert len(intent_json["components"]) >= 2


def test_combo_uses_slang_names():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
        corruptions={},  # No corruption to check raw phrases
    )
    examples = section.generate(target_count=100)
    all_inputs = " ".join(ex["messages"][1]["content"] for ex in examples)
    # Should see slang names, not just IDs
    assert "lucina" in all_inputs or "lampadina" in all_inputs or "led" in all_inputs


def test_combo_variety():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=50)
    inputs = [ex["messages"][1]["content"] for ex in examples]
    unique = set(inputs)
    # With random sampling, almost all should be unique
    assert len(unique) > 40


def test_combo_chatml_format():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
        system_prompt="Test prompt",
    )
    examples = section.generate(target_count=5)
    for ex in examples:
        assert len(ex["messages"]) == 3
        assert ex["messages"][0]["role"] == "system"
        assert ex["messages"][0]["content"] == "Test prompt"
        assert ex["messages"][1]["role"] == "user"
        assert ex["messages"][2]["role"] == "assistant"
