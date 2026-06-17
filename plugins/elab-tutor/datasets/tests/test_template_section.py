import sys
import os
import json
import yaml

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from brain_factory.sections.template_section import TemplateSection
from brain_factory.corruption import CorruptionPipeline

SAMPLE_YAML = """
id: test_section
name: "Test Section"
intent: action
needs_llm: false

templates:
  - input: "avvia {cosa}"
    response: "Avviato."
    actions: ["[AZIONE:play]"]
    entities: []
    vars:
      cosa: ["la simulazione", "il circuito", "tutto"]

  - input: "metti un {componente}"
    response: null
    needs_llm: true
    llm_hint: "Piazzamento {componente}"
    intent: circuit
    actions: []
    entities: ["{componente}"]
    vars:
      componente: [led, resistor, buzzer-piezo]

corruptions:
  typo_swap: 0.3
  emoji: 0.1
"""


def test_template_section_loads():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    assert section.id == "test_section"
    assert section.name == "Test Section"


def test_generates_examples():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=10)
    assert len(examples) >= 6  # 3 + 3 base combos
    assert all("messages" in ex for ex in examples)


def test_example_has_correct_chatml_format():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=5)
    for ex in examples[:3]:
        assert len(ex["messages"]) == 3
        assert ex["messages"][0]["role"] == "system"
        assert ex["messages"][1]["role"] == "user"
        assert ex["messages"][2]["role"] == "assistant"
        # Assistant content must be valid JSON
        parsed = json.loads(ex["messages"][2]["content"])
        assert "intent" in parsed
        assert "needs_llm" in parsed


def test_var_substitution_in_entities():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=50)
    # Find circuit examples with entities
    circuit_examples = [
        json.loads(ex["messages"][2]["content"])
        for ex in examples
        if json.loads(ex["messages"][2]["content"])["intent"] == "circuit"
    ]
    assert len(circuit_examples) > 0
    entities_seen = set()
    for out in circuit_examples:
        for e in out["entities"]:
            entities_seen.add(e)
    # Should see different components
    assert len(entities_seen) > 1


def test_var_substitution_in_llm_hint():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=10)
    circuit_examples = [
        json.loads(ex["messages"][2]["content"])
        for ex in examples
        if json.loads(ex["messages"][2]["content"])["intent"] == "circuit"
    ]
    for out in circuit_examples:
        assert "{componente}" not in (out["llm_hint"] or ""), "Unresolved {var} in llm_hint"


def test_respects_target_count():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=20)
    assert len(examples) == 20


def test_corruptions_produce_variants():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp, system_prompt="Test prompt")
    examples = section.generate(target_count=50)
    inputs = [ex["messages"][1]["content"] for ex in examples]
    # With corruption, we should see more unique inputs than base combos (6)
    unique_inputs = set(inputs)
    assert len(unique_inputs) > 6


def test_empty_templates():
    config = {"id": "empty", "name": "Empty", "templates": []}
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=10)
    assert examples == []


def test_template_without_vars():
    config = yaml.safe_load("""
id: no_vars
name: "No Vars"
intent: action
needs_llm: false
templates:
  - input: "avvia"
    response: "Avviato."
    actions: ["[AZIONE:play]"]
    entities: []
corruptions: {}
""")
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=5)
    # With no corruption, only 1 unique output is possible (section-level dedup)
    assert len(examples) == 1
    assert examples[0]["messages"][1]["content"] == "avvia"
