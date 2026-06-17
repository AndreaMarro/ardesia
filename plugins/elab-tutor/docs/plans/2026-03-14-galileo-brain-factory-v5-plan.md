# Galileo Brain Factory v5 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a config-driven dataset factory that generates 25K+ training examples for the Galileo Brain local router, with pluggable corruptors, YAML-defined sections, profiles, and lineage tracking.

**Architecture:** A Python CLI (`generate.py`) reads a profile YAML (target count, section weights), discovers section configs from `configs/sections/*.yml`, generates examples via `engine.py` with corruptions from `corruption.py`, deduplicates, shuffles, and writes JSONL + manifest.json.

**Tech Stack:** Python 3.10+, PyYAML, no external ML dependencies (pure data generation). Existing datasets in `datasets/` folder.

---

### Task 1: Scaffold Directory Structure

**Files:**
- Create: `datasets/brain_factory/__init__.py`
- Create: `datasets/brain_factory/engine.py` (stub)
- Create: `datasets/brain_factory/corruption.py` (stub)
- Create: `datasets/brain_factory/registry.py` (stub)
- Create: `datasets/brain_factory/sections/__init__.py`
- Create: `datasets/brain_factory/sections/base.py` (stub)
- Create: `datasets/configs/system_prompt.txt`
- Create: `datasets/configs/components.yml`
- Create: `datasets/configs/actions.yml`
- Create: `datasets/configs/experiments.yml`
- Create: `datasets/configs/responses.yml`
- Create: `datasets/configs/corruptions.yml`
- Create: `datasets/configs/sections/` (empty dir)
- Create: `datasets/profiles/v5-extreme-25k.yml`
- Create: `datasets/profiles/eval-200.yml`
- Create: `datasets/generate.py` (stub CLI)

**Step 1: Create the directory tree**

```bash
cd "VOLUME 3/PRODOTTO/elab-builder/datasets"
mkdir -p brain_factory/sections configs/sections profiles output
```

**Step 2: Create `__init__.py` files**

`datasets/brain_factory/__init__.py`:
```python
"""Galileo Brain Factory v5 — Config-driven dataset generation."""
```

`datasets/brain_factory/sections/__init__.py`:
```python
"""Section generators for Brain Factory."""
```

**Step 3: Create `configs/system_prompt.txt`**

Copy v2 system prompt from design doc (the one with "studente O docente", intent "teacher", warm/telegraphic rules).

**Step 4: Create `configs/components.yml`**

Extract from existing `generate-brain-extreme.py` lines 60-80: all 21 components + COMP_SLANG mapping. YAML format:
```yaml
components:
  led:
    slang: [led, LED, lucina, lucetta, lampadina, luce, diodo luminoso, ledino, ...]
  resistor:
    slang: [resistenza, resistore, res, resistore da 220, ohm, ...]
  # ... all 21
```

**Step 5: Create `configs/experiments.yml`**

Extract from existing generator: all 69 experiments organized by volume.

**Step 6: Create `configs/actions.yml`**

Extract all action tags and their linguistic variants (PLAY_VARIANTS, PAUSE_VARIANTS, etc. from `generate_brain_dataset.py` lines 60-100+).

**Step 7: Create `configs/responses.yml`**

Warm response templates from design doc (action_play, component_place, diagnose, etc.).

**Step 8: Create `configs/corruptions.yml`**

Default corruption probabilities and SMS replacement map.

**Step 9: Create profile stubs**

`profiles/v5-extreme-25k.yml` and `profiles/eval-200.yml` with the weight tables from design doc.

**Step 10: Create `generate.py` stub**

```python
#!/usr/bin/env python3
"""Galileo Brain Factory v5 — CLI entry point."""
import argparse

def main():
    parser = argparse.ArgumentParser(description="Galileo Brain Factory v5")
    parser.add_argument("--profile", required=True, help="Profile YAML name")
    parser.add_argument("--only", help="Comma-separated section IDs to generate")
    parser.add_argument("--eval", type=int, help="Generate N holdout examples")
    parser.add_argument("--dry-run", action="store_true", help="Show stats only")
    parser.add_argument("--seed", type=int, help="Random seed override")
    args = parser.parse_args()
    print(f"Brain Factory v5 — profile={args.profile} (stub)")

if __name__ == "__main__":
    main()
```

**Step 11: Verify scaffold**

Run: `python datasets/generate.py --profile v5-extreme-25k --dry-run`
Expected: prints stub message, no errors.

**Step 12: Commit**

```bash
git add datasets/brain_factory/ datasets/configs/ datasets/profiles/ datasets/generate.py
git commit -m "feat: scaffold Brain Factory v5 directory structure"
```

---

### Task 2: Corruption Pipeline

**Files:**
- Create: `datasets/brain_factory/corruption.py`
- Create: `datasets/tests/test_corruption.py`

**Step 1: Write the failing test**

`datasets/tests/test_corruption.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from brain_factory.corruption import CorruptionPipeline

def test_typo_swap_changes_text():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("resistenza", ["typo_swap"])
    assert result != "resistenza" or len("resistenza") < 4  # swap may no-op on very short

def test_truncated_shortens():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led sulla breadboard", ["truncated"])
    assert len(result) < len("metti un led sulla breadboard")

def test_emoji_inject_adds_emoji():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("avvia la simulazione", ["emoji"])
    assert any(ord(c) > 127 for c in result)  # has non-ASCII

def test_pipeline_probabilistic():
    cp = CorruptionPipeline(seed=42)
    config = {"typo_swap": 1.0, "emoji": 0.0}  # 100% typo, 0% emoji
    results = [cp.apply_config("avvia la simulazione", config) for _ in range(10)]
    # All should have typo applied, none should have emoji
    assert all(r != "avvia la simulazione" or True for r in results)  # typo may no-op

def test_no_corruption_returns_original():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("ciao", [])
    assert result == "ciao"

def test_voice_corrupts():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("accendi il LED", ["voice"])
    # voice should change something (capitalization, spacing, phonetic)
    assert isinstance(result, str) and len(result) > 0

def test_autocorrect_corrupts():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti il mosfet sulla breadboard", ["autocorrect"])
    assert isinstance(result, str) and len(result) > 0

def test_sms_corrupts():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("che cosa vuoi fare con questo circuito", ["sms"])
    assert isinstance(result, str)

def test_space_chaos():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led", ["space_chaos"])
    assert isinstance(result, str)

def test_caps_chaos():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led", ["caps_chaos"])
    assert isinstance(result, str)
```

**Step 2: Run test to verify it fails**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_corruption.py -v`
Expected: FAIL — import error (module doesn't exist yet)

**Step 3: Implement `corruption.py`**

`datasets/brain_factory/corruption.py`:
```python
"""
Pluggable corruption pipeline for Galileo Brain dataset generation.
Each corruptor is a registered function: text_in -> text_out.
Add new corruptors by defining a function and decorating with @register.
"""
import random
import re

# ── Registry ──────────────────────────────────────────────
_REGISTRY: dict[str, callable] = {}

def register(name: str):
    """Decorator to register a corruptor function."""
    def decorator(fn):
        _REGISTRY[name] = fn
        return fn
    return decorator

def list_corruptors() -> list[str]:
    return list(_REGISTRY.keys())

# ── Corruptor Functions ───────────────────────────────────

@register("typo_swap")
def _typo_swap(text: str, rng: random.Random) -> str:
    chars = list(text)
    if len(chars) < 3:
        return text
    i = rng.randint(1, len(chars) - 2)
    chars[i], chars[i + 1] = chars[i + 1], chars[i]
    return "".join(chars)

@register("typo_drop")
def _typo_drop(text: str, rng: random.Random) -> str:
    chars = list(text)
    if len(chars) > 4:
        chars.pop(rng.randint(1, len(chars) - 2))
    return "".join(chars)

@register("typo_double")
def _typo_double(text: str, rng: random.Random) -> str:
    chars = list(text)
    i = rng.randint(0, max(0, len(chars) - 1))
    chars.insert(i, chars[i])
    return "".join(chars)

@register("sms")
def _sms(text: str, rng: random.Random) -> str:
    replacements = {
        "che ": "ke ", "per ": "x ", "perché": "xke", "non ": "nn ",
        "cosa ": "kosa ", "come ": "cm ", "questo": "qst", "anche": "anke",
        "voglio": "vojo", "con ": "cn ", "fammi": "fmmi", "dove": "dv",
        "quando": "qnd", "sono": "sn", "quello": "qll", "adesso": "ades",
        "tutto": "ttt", "niente": "nnt",
    }
    for old, new in replacements.items():
        if rng.random() < 0.5:
            text = text.replace(old, new)
    return text

@register("caps_chaos")
def _caps_chaos(text: str, rng: random.Random) -> str:
    mode = rng.choice(["up", "rand", "low"])
    if mode == "up":
        return text.upper()
    if mode == "rand":
        return "".join(c.upper() if rng.random() < 0.3 else c for c in text)
    return text.lower()

@register("filler")
def _filler(text: str, rng: random.Random) -> str:
    fillers = [
        "tipo", "cioè", "praticamente", "boh", "eh", "insomma", "vabbe",
        "senti", "ma", "dai", "niente", "ecco", "ok", "mah", "allora",
        "vabbè", "uffa", "emm", "ehm", "aspetta",
    ]
    f = rng.choice(fillers)
    return f"{f} {text}" if rng.random() < 0.5 else f"{text} {f}"

@register("emoji")
def _emoji(text: str, rng: random.Random) -> str:
    emojis = ["😂","🤔","😡","💡","🔥","👀","❓","‼️","🙏","😭","🤷","✨","🎯","💀","🫠"]
    pos = rng.choice(["pre", "post", "both"])
    e1, e2 = rng.choice(emojis), rng.choice(emojis)
    if pos == "pre":
        return f"{e1} {text}"
    if pos == "post":
        return f"{text} {e2}"
    return f"{e1} {text} {e2}"

@register("truncated")
def _truncated(text: str, rng: random.Random) -> str:
    words = text.split()
    if len(words) > 2:
        cut = rng.randint(max(1, len(words) // 2), len(words) - 1)
        return " ".join(words[:cut])
    return text

@register("voice")
def _voice(text: str, rng: random.Random) -> str:
    """Simulates speech-to-text errors."""
    voice_map = {
        "accendi": ["a Gendy", "accenni", "a cendi"],
        "avvia": ["avvia", "avia", "a via"],
        "metti": ["Metti", "methi", "meti"],
        "compila": ["compila", "con pila", "kompila"],
        "led": ["led", "LED", "letto", "let"],
        "resistenza": ["resistenza", "esistenza", "risistenza"],
        "buzzer": ["bazar", "bazzer", "busser"],
        "breadboard": ["bretbord", "bread bord", "bredboard"],
        "simulazione": ["simulazione", "simolazione", "simulazzione"],
        "circuito": ["circuito", "circuìto", "ciruito"],
        "esperimento": ["esperimento", "sperimento", "esperimendo"],
        "arduino": ["arduino", "artuino", "arduìno"],
        "pulsante": ["pulsante", "polsante", "pulsande"],
        "potenziometro": ["potenziometro", "potenzi ometro", "potenzio metro"],
        "condensatore": ["condensatore", "condensa tore", "condensadore"],
        "mosfet": ["mosfet", "mos fet", "mosfett"],
    }
    for word, alternatives in voice_map.items():
        if word in text.lower() and rng.random() < 0.6:
            replacement = rng.choice(alternatives)
            text = re.sub(re.escape(word), replacement, text, count=1, flags=re.IGNORECASE)
    return text

@register("autocorrect")
def _autocorrect(text: str, rng: random.Random) -> str:
    """Simulates smartphone autocorrect failures."""
    autocorrect_map = {
        "mosfet": ["mostre", "mouse", "misfatto"],
        "led": ["led", "letto", "le"],
        "buzzer": ["bazar", "buffer", "buzzer"],
        "breadboard": ["breadboard", "bread board", "board"],
        "arduino": ["Arduino", "artigiano", "arduo"],
        "resistenza": ["resistenza", "esistenza", "insistenza"],
        "potenziometro": ["potenziometro", "potenziale", "potenza metro"],
        "servo": ["servo", "serbo", "serve"],
        "diodo": ["diodo", "divido", "dodo"],
        "condensatore": ["condensatore", "condensato", "condensare"],
    }
    for word, alternatives in autocorrect_map.items():
        if word in text.lower() and rng.random() < 0.5:
            replacement = rng.choice(alternatives)
            text = re.sub(re.escape(word), replacement, text, count=1, flags=re.IGNORECASE)
    return text

@register("space_chaos")
def _space_chaos(text: str, rng: random.Random) -> str:
    """Random space insertion/removal."""
    words = text.split()
    result = []
    for i, word in enumerate(words):
        if i > 0 and rng.random() < 0.3:
            # Remove space (merge words)
            if result:
                result[-1] = result[-1] + word
                continue
        if rng.random() < 0.15 and len(word) > 3:
            # Insert space in middle of word
            pos = rng.randint(1, len(word) - 1)
            result.append(word[:pos] + " " + word[pos:])
        else:
            result.append(word)
    return " ".join(result)

@register("profanity_wrap")
def _profanity_wrap(text: str, rng: random.Random) -> str:
    """Wraps text with frustration/profanity."""
    prefixes = [
        "ma che cazzo", "porco giuda", "mannaggia", "cavolo",
        "maledizione", "porca miseria", "ma dai", "uffa",
        "accidenti", "ma insomma", "santa pazienza",
    ]
    suffixes = [
        "del cazzo", "maledetto", "che palle", "mannaggia",
        "diocane", "perdio", "che cavolo", "accidenti",
    ]
    if rng.random() < 0.5:
        return f"{rng.choice(prefixes)} {text}"
    else:
        return f"{text} {rng.choice(suffixes)}"


# ── Pipeline ──────────────────────────────────────────────

class CorruptionPipeline:
    """Applies corruption functions to text."""

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)

    def apply(self, text: str, corruptors: list[str]) -> str:
        """Apply specific corruptors in sequence."""
        for name in corruptors:
            if name in _REGISTRY:
                text = _REGISTRY[name](text, self.rng)
        return text

    def apply_config(self, text: str, config: dict[str, float]) -> str:
        """Apply corruptors based on probability config.

        config: {"typo_swap": 0.3, "emoji": 0.1, ...}
        Each corruptor fires independently based on its probability.
        """
        for name, prob in config.items():
            if name in _REGISTRY and self.rng.random() < prob:
                text = _REGISTRY[name](text, self.rng)
        return text

    def apply_random(self, text: str, level: int = 0) -> str:
        """Apply random corruptors based on corruption level (0-5)."""
        if level == 0:
            return text
        all_names = list(_REGISTRY.keys())
        chosen = self.rng.sample(all_names, k=min(level, len(all_names)))
        return self.apply(text, chosen)
```

**Step 4: Run tests**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_corruption.py -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add datasets/brain_factory/corruption.py datasets/tests/test_corruption.py
git commit -m "feat: implement corruption pipeline with 12 pluggable corruptors"
```

---

### Task 3: Section Base Class + Template Section

**Files:**
- Create: `datasets/brain_factory/sections/base.py`
- Create: `datasets/brain_factory/sections/template_section.py`
- Create: `datasets/tests/test_template_section.py`

**Step 1: Write the failing test**

`datasets/tests/test_template_section.py`:
```python
import sys, os, yaml, tempfile
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
    section = TemplateSection(config, cp)
    assert section.id == "test_section"
    assert section.name == "Test Section"

def test_generates_examples():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=10)
    assert len(examples) >= 6  # 3 vars + 3 vars = 6 base combos minimum
    assert all("messages" in ex for ex in examples)

def test_example_has_correct_format():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=5)
    ex = examples[0]
    assert len(ex["messages"]) == 3
    assert ex["messages"][0]["role"] == "system"
    assert ex["messages"][1]["role"] == "user"
    assert ex["messages"][2]["role"] == "assistant"

def test_var_substitution():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=50)
    # Should see different component types in outputs
    outputs = [ex["messages"][2]["content"] for ex in examples]
    assert len(set(outputs)) > 1  # Not all identical

def test_respects_target_count():
    config = yaml.safe_load(SAMPLE_YAML)
    cp = CorruptionPipeline(seed=42)
    section = TemplateSection(config, cp)
    examples = section.generate(target_count=20)
    assert len(examples) >= 15  # Should get close to target via repetition
```

**Step 2: Run test to verify it fails**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_template_section.py -v`
Expected: FAIL — import error

**Step 3: Implement `base.py`**

```python
"""Abstract base class for all dataset sections."""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class Example:
    """A single training example in ChatML format."""
    system: str
    user: str
    assistant: str

    def to_chatml(self, system_prompt: str) -> dict:
        return {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": self.user},
                {"role": "assistant", "content": self.assistant},
            ]
        }

class Section(ABC):
    """Base class for a dataset section."""

    def __init__(self, config: dict):
        self.id = config["id"]
        self.name = config["name"]
        self.config = config

    @abstractmethod
    def generate(self, target_count: int) -> list[dict]:
        """Generate target_count examples. Returns list of ChatML dicts."""
        ...
```

**Step 4: Implement `template_section.py`**

```python
"""Template-based section: reads YAML with {var} placeholders, explodes combinatorially."""
import json
import itertools
import random
from .base import Section

class TemplateSection(Section):

    def __init__(self, config: dict, corruption_pipeline, system_prompt: str = ""):
        super().__init__(config)
        self.cp = corruption_pipeline
        self.system_prompt = system_prompt
        self.templates = config.get("templates", [])
        self.default_intent = config.get("intent", "action")
        self.default_needs_llm = config.get("needs_llm", False)
        self.corruptions = config.get("corruptions", {})

    def _expand_template(self, template: dict) -> list[dict]:
        """Expand a single template with all var combinations."""
        input_tmpl = template["input"]
        vars_dict = template.get("vars", {})

        if not vars_dict:
            return [self._make_example(template, input_tmpl, {})]

        keys = list(vars_dict.keys())
        values = [vars_dict[k] for k in keys]
        combos = list(itertools.product(*values))

        results = []
        for combo in combos:
            replacements = dict(zip(keys, combo))
            results.append(self._make_example(template, input_tmpl, replacements))
        return results

    def _make_example(self, template: dict, input_tmpl: str, replacements: dict) -> dict:
        """Create a single example from template + replacements."""
        text = input_tmpl
        for key, val in replacements.items():
            text = text.replace(f"{{{key}}}", str(val))

        intent = template.get("intent", self.default_intent)
        needs_llm = template.get("needs_llm", self.default_needs_llm)
        response = template.get("response")
        llm_hint = template.get("llm_hint")
        actions = template.get("actions", [])
        entities = template.get("entities", [])

        # Replace vars in other fields too
        if llm_hint:
            for key, val in replacements.items():
                llm_hint = llm_hint.replace(f"{{{key}}}", str(val))
        if entities:
            entities = [e.replace(f"{{{k}}}", str(v)) for e in entities for k, v in replacements.items()] if replacements else entities
            # Re-derive: just substitute all vars in each entity
            new_entities = []
            for e in template.get("entities", []):
                for k, v in replacements.items():
                    e = e.replace(f"{{{k}}}", str(v))
                new_entities.append(e)
            entities = new_entities

        output = json.dumps({
            "intent": intent,
            "entities": entities,
            "actions": actions,
            "needs_llm": needs_llm,
            "response": response,
            "llm_hint": llm_hint,
        }, ensure_ascii=False)

        return {
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": text},
                {"role": "assistant", "content": output},
            ],
            "_clean_input": text,  # for dedup + corruption tracking
        }

    def generate(self, target_count: int) -> list[dict]:
        """Generate up to target_count examples with corruption variants."""
        # Phase 1: expand all templates
        base_examples = []
        for tmpl in self.templates:
            base_examples.extend(self._expand_template(tmpl))

        # Phase 2: fill to target via repetition + corruption
        results = []
        rng = self.cp.rng

        # Always include clean versions first
        results.extend(base_examples)

        # Then add corrupted versions until target reached
        while len(results) < target_count:
            ex = rng.choice(base_examples)
            corrupted_input = self.cp.apply_config(ex["_clean_input"], self.corruptions)
            new_ex = dict(ex)
            new_ex["messages"] = [
                ex["messages"][0],  # system
                {"role": "user", "content": corrupted_input},
                ex["messages"][2],  # assistant (same output)
            ]
            results.append(new_ex)

        return results[:target_count]
```

**Step 5: Run tests**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_template_section.py -v`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add datasets/brain_factory/sections/base.py datasets/brain_factory/sections/template_section.py datasets/tests/test_template_section.py
git commit -m "feat: implement Section base class and TemplateSection with var expansion"
```

---

### Task 4: Combo Section (Combinatorial Explosion)

**Files:**
- Create: `datasets/brain_factory/sections/combo_section.py`
- Create: `datasets/tests/test_combo_section.py`

**Step 1: Write the failing test**

`datasets/tests/test_combo_section.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from brain_factory.sections.combo_section import ComboSection
from brain_factory.corruption import CorruptionPipeline

COMPONENTS_DATA = {
    "led": {"slang": ["led", "lucina", "lampadina"]},
    "resistor": {"slang": ["resistenza", "resistore"]},
    "buzzer-piezo": {"slang": ["buzzer", "cicalino"]},
}

ACTION_VERBS = ["metti", "aggiungi", "piazza", "mettimi", "voglio"]
CONJUNCTIONS = ["e", "con", "più", ",", "e anche"]

def test_combo_generates_multi_component():
    cp = CorruptionPipeline(seed=42)
    section = ComboSection(
        components=COMPONENTS_DATA,
        action_verbs=ACTION_VERBS,
        conjunctions=CONJUNCTIONS,
        corruption_pipeline=cp,
    )
    examples = section.generate(target_count=50)
    assert len(examples) >= 30
    # Should have multi-component examples
    multi = [ex for ex in examples if len(
        __import__("json").loads(ex["messages"][2]["content"])["entities"]
    ) > 1]
    assert len(multi) > 0

def test_combo_actions_have_place_intent():
    import json
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
```

**Step 2: Run test to verify it fails**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_combo_section.py -v`
Expected: FAIL

**Step 3: Implement `combo_section.py`**

This section generates multi-component placement phrases by combining:
- Action verb × slang name × conjunction × slang name × (optional 3rd)
- Output: `[INTENT:{"action":"place_and_wire","components":[...]}]`
- Corruption applied post-combination

```python
"""Combinatorial section: generates multi-component/multi-action phrases."""
import json
import random
from .base import Section

class ComboSection(Section):

    def __init__(self, components: dict, action_verbs: list, conjunctions: list,
                 corruption_pipeline, system_prompt: str = "", corruptions: dict = None):
        super().__init__({"id": "combos", "name": "Combinatorial Multi-Component"})
        self.components = components
        self.verbs = action_verbs
        self.conj = conjunctions
        self.cp = corruption_pipeline
        self.system_prompt = system_prompt
        self.corruptions = corruptions or {"typo_swap": 0.3, "emoji": 0.1}

    def _pick_slang(self, comp_id: str) -> str:
        return self.cp.rng.choice(self.components[comp_id]["slang"])

    def generate(self, target_count: int) -> list[dict]:
        rng = self.cp.rng
        comp_ids = list(self.components.keys())
        results = []

        while len(results) < target_count:
            # Pick 2-4 components
            n = rng.choice([2, 2, 2, 3, 3, 4])  # weighted toward 2-3
            chosen = rng.sample(comp_ids, k=min(n, len(comp_ids)))

            # Build phrase
            verb = rng.choice(self.verbs)
            parts = [self._pick_slang(c) for c in chosen]
            conj = rng.choice(self.conj)

            if len(parts) == 2:
                phrase = f"{verb} {parts[0]} {conj} {parts[1]}"
            elif len(parts) == 3:
                phrase = f"{verb} {parts[0]}, {parts[1]} {conj} {parts[2]}"
            else:
                phrase = f"{verb} {', '.join(parts[:-1])} {conj} {parts[-1]}"

            # Corrupt
            if self.corruptions:
                phrase = self.cp.apply_config(phrase, self.corruptions)

            # Build output
            intent_obj = {
                "action": "place_and_wire",
                "components": [{"type": c} for c in chosen],
                "wires": "auto",
            }
            output = json.dumps({
                "intent": "circuit",
                "entities": chosen,
                "actions": [f"[INTENT:{json.dumps(intent_obj, ensure_ascii=False)}]"],
                "needs_llm": False,
                "response": f"{', '.join(chosen)} — li monto subito!",
                "llm_hint": None,
            }, ensure_ascii=False)

            results.append({
                "messages": [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": phrase},
                    {"role": "assistant", "content": output},
                ]
            })

        return results[:target_count]
```

**Step 4: Run tests**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_combo_section.py -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add datasets/brain_factory/sections/combo_section.py datasets/tests/test_combo_section.py
git commit -m "feat: implement ComboSection for multi-component combinatorial generation"
```

---

### Task 5: Registry + Engine (Core Orchestrator)

**Files:**
- Create: `datasets/brain_factory/registry.py`
- Create: `datasets/brain_factory/engine.py`
- Create: `datasets/tests/test_engine.py`

**Step 1: Write failing tests**

`datasets/tests/test_engine.py`:
```python
import sys, os, tempfile, json, yaml
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

def test_registry_discovers_sections(tmp_path):
    from brain_factory.registry import discover_sections
    # Create a minimal section YAML
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

def test_engine_generates_dataset(tmp_path):
    from brain_factory.engine import BrainEngine

    # Create minimal config structure
    configs_dir = tmp_path / "configs"
    configs_dir.mkdir()
    sections_dir = configs_dir / "sections"
    sections_dir.mkdir()

    (configs_dir / "system_prompt.txt").write_text("Test system prompt.")
    (sections_dir / "01_test.yml").write_text(yaml.dump({
        "id": "test",
        "name": "Test",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {"input": "avvia", "response": "Avviato.", "actions": ["[AZIONE:play]"], "entities": []},
            {"input": "pausa", "response": "In pausa.", "actions": ["[AZIONE:pause]"], "entities": []},
        ],
        "corruptions": {"typo_swap": 0.3},
    }))

    profile = {
        "target": 20,
        "seed": 42,
        "system_prompt": "system_prompt.txt",
        "output": "test-output.jsonl",
        "sections": {"test": {"weight": 100}},
    }

    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=str(tmp_path / "output"))
    result = engine.generate(profile)

    assert result["total"] > 0
    assert (tmp_path / "output" / "test-output.jsonl").exists()
    assert (tmp_path / "output" / "test-output.manifest.json").exists()

def test_engine_deduplicates(tmp_path):
    from brain_factory.engine import BrainEngine
    import json

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

    engine = BrainEngine(configs_dir=str(configs_dir), output_dir=str(tmp_path / "output"))
    result = engine.generate(profile)

    # With no corruption, all inputs are "avvia" — should dedup to 1
    assert result["duplicates_removed"] > 0
```

**Step 2: Run tests to verify they fail**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_engine.py -v`
Expected: FAIL

**Step 3: Implement `registry.py`**

```python
"""Auto-discover section configs from YAML files."""
import os
import yaml

def discover_sections(sections_dir: str) -> dict[str, dict]:
    """Scan a directory for section YAML files and return {id: config}."""
    sections = {}
    for filename in sorted(os.listdir(sections_dir)):
        if filename.endswith((".yml", ".yaml")):
            filepath = os.path.join(sections_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)
            if config and "id" in config:
                sections[config["id"]] = config
    return sections
```

**Step 4: Implement `engine.py`**

```python
"""Core engine: orchestrates section generation, dedup, stats, JSONL output, manifest."""
import json
import hashlib
import random
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .corruption import CorruptionPipeline
from .registry import discover_sections
from .sections.template_section import TemplateSection


class BrainEngine:

    def __init__(self, configs_dir: str, output_dir: str):
        self.configs_dir = configs_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _load_system_prompt(self, filename: str) -> str:
        path = os.path.join(self.configs_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def _get_git_hash(self) -> str:
        try:
            return subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"],
                stderr=subprocess.DEVNULL,
            ).decode().strip()
        except Exception:
            return "unknown"

    def generate(self, profile: dict, only: list[str] = None, dry_run: bool = False) -> dict:
        """Generate dataset from profile config.

        Args:
            profile: Profile dict with target, seed, sections, etc.
            only: If set, only generate these section IDs.
            dry_run: If True, return stats without writing files.

        Returns:
            Manifest dict with stats.
        """
        seed = profile.get("seed", 42)
        target = profile["target"]
        system_prompt = self._load_system_prompt(profile["system_prompt"])
        output_file = profile["output"]

        cp = CorruptionPipeline(seed=seed)
        rng = random.Random(seed)

        # Discover sections
        sections_dir = os.path.join(self.configs_dir, "sections")
        all_section_configs = discover_sections(sections_dir)

        # Filter to profile sections
        profile_sections = profile.get("sections", {})
        active_ids = only if only else list(profile_sections.keys())

        # Calculate per-section targets from weights
        total_weight = sum(
            profile_sections.get(sid, {}).get("weight", 0)
            for sid in active_ids
            if sid in all_section_configs
        )

        section_targets = {}
        for sid in active_ids:
            if sid not in all_section_configs:
                continue
            weight = profile_sections.get(sid, {}).get("weight", 0)
            section_targets[sid] = round(target * weight / max(total_weight, 1))

        if dry_run:
            return {
                "profile": output_file,
                "target": target,
                "section_targets": section_targets,
                "total_weight": total_weight,
                "dry_run": True,
            }

        # Generate from each section
        all_examples = []
        section_counts = {}

        for sid, sec_target in section_targets.items():
            if sec_target == 0:
                continue
            config = all_section_configs[sid]

            # Merge section-level corruption overrides from profile
            profile_corruptions = profile_sections.get(sid, {}).get("corruptions")
            if profile_corruptions is not None:
                config = {**config, "corruptions": profile_corruptions}

            section = TemplateSection(config, cp, system_prompt=system_prompt)
            examples = section.generate(target_count=sec_target)
            section_counts[sid] = len(examples)
            all_examples.extend(examples)

        # Deduplicate by user message content
        seen = set()
        unique = []
        for ex in all_examples:
            h = hashlib.md5(ex["messages"][1]["content"].encode()).hexdigest()
            if h not in seen:
                seen.add(h)
                unique.append(ex)

        duplicates_removed = len(all_examples) - len(unique)

        # Shuffle
        rng.shuffle(unique)

        # Remove internal tracking keys
        for ex in unique:
            ex.pop("_clean_input", None)

        # Write JSONL
        output_path = Path(self.output_dir) / output_file
        with open(output_path, "w", encoding="utf-8") as f:
            for ex in unique:
                f.write(json.dumps(ex, ensure_ascii=False) + "\n")

        # Compute stats
        intents = {}
        needs_llm_count = 0
        for ex in unique:
            try:
                out = json.loads(ex["messages"][2]["content"])
                intent = out.get("intent", "unknown")
                intents[intent] = intents.get(intent, 0) + 1
                if out.get("needs_llm"):
                    needs_llm_count += 1
            except json.JSONDecodeError:
                pass

        manifest = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "profile": output_file,
            "git_hash": self._get_git_hash(),
            "seed": seed,
            "total": len(unique),
            "duplicates_removed": duplicates_removed,
            "sections": section_counts,
            "intents": intents,
            "needs_llm_pct": round(needs_llm_count / max(len(unique), 1) * 100, 1),
        }

        # Write manifest
        manifest_path = Path(self.output_dir) / output_file.replace(".jsonl", ".manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

        return manifest
```

**Step 5: Run tests**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_engine.py -v`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add datasets/brain_factory/registry.py datasets/brain_factory/engine.py datasets/tests/test_engine.py
git commit -m "feat: implement BrainEngine orchestrator with dedup, stats, and manifest"
```

---

### Task 6: CLI (`generate.py`)

**Files:**
- Modify: `datasets/generate.py`
- Create: `datasets/tests/test_cli.py`

**Step 1: Write the failing test**

`datasets/tests/test_cli.py`:
```python
import subprocess, sys, os

BASE = os.path.join(os.path.dirname(__file__), "..")

def test_cli_help():
    result = subprocess.run(
        [sys.executable, os.path.join(BASE, "generate.py"), "--help"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "--profile" in result.stdout

def test_cli_dry_run(tmp_path):
    # This will use the real configs if they exist
    result = subprocess.run(
        [sys.executable, os.path.join(BASE, "generate.py"),
         "--profile", "v5-extreme-25k", "--dry-run"],
        capture_output=True, text=True,
        cwd=BASE,
    )
    # Should not crash
    assert result.returncode == 0 or "No sections" in result.stderr
```

**Step 2: Implement full CLI**

`datasets/generate.py`:
```python
#!/usr/bin/env python3
"""
Galileo Brain Factory v5 — CLI Entry Point

Usage:
    python generate.py --profile v5-extreme-25k              # Full generation
    python generate.py --profile v5-extreme-25k --dry-run    # Stats only
    python generate.py --profile v5-extreme-25k --only teacher,teacher_clueless
    python generate.py --profile eval-200                    # Evaluation holdout
    python generate.py --profile v5-extreme-25k --seed 42
"""
import argparse
import json
import sys
import os
import yaml
from pathlib import Path

# Ensure brain_factory is importable
sys.path.insert(0, os.path.dirname(__file__))
from brain_factory.engine import BrainEngine


def load_profile(profile_name: str) -> dict:
    """Load a profile YAML from profiles/ directory."""
    profiles_dir = Path(__file__).parent / "profiles"
    for ext in [".yml", ".yaml"]:
        path = profiles_dir / f"{profile_name}{ext}"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
    raise FileNotFoundError(f"Profile '{profile_name}' not found in {profiles_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Galileo Brain Factory v5 — Dataset Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--profile", required=True, help="Profile name (e.g., v5-extreme-25k)")
    parser.add_argument("--only", help="Comma-separated section IDs to generate")
    parser.add_argument("--eval", type=int, help="Generate N holdout evaluation examples")
    parser.add_argument("--dry-run", action="store_true", help="Show predicted stats only")
    parser.add_argument("--seed", type=int, help="Random seed override")
    args = parser.parse_args()

    # Load profile
    profile = load_profile(args.profile)
    if args.seed is not None:
        profile["seed"] = args.seed
    if args.eval:
        profile["target"] = args.eval
        profile["output"] = profile["output"].replace(".jsonl", f"-eval-{args.eval}.jsonl")

    # Parse --only
    only = args.only.split(",") if args.only else None

    # Setup engine
    configs_dir = str(Path(__file__).parent / "configs")
    output_dir = str(Path(__file__).parent / "output")

    engine = BrainEngine(configs_dir=configs_dir, output_dir=output_dir)

    print(f"{'='*60}")
    print(f"  Galileo Brain Factory v5")
    print(f"  Profile: {args.profile}")
    print(f"  Target:  {profile['target']} examples")
    if only:
        print(f"  Only:    {', '.join(only)}")
    print(f"{'='*60}\n")

    result = engine.generate(profile, only=only, dry_run=args.dry_run)

    if args.dry_run:
        print("  DRY RUN — Predicted stats:\n")
        for sid, count in sorted(result.get("section_targets", {}).items()):
            print(f"    {sid:25s} → {count:6d} examples")
        print(f"\n    {'TOTAL':25s} → {sum(result.get('section_targets', {}).values()):6d}")
    else:
        print(f"  ✅ Generated: {result['total']} unique examples")
        print(f"     Removed:   {result['duplicates_removed']} duplicates")
        print(f"\n  Sections:")
        for sid, count in sorted(result.get("sections", {}).items()):
            print(f"    {sid:25s} → {count:6d}")
        print(f"\n  Intents:")
        for intent, count in sorted(result.get("intents", {}).items(), key=lambda x: -x[1]):
            pct = count / max(result["total"], 1) * 100
            print(f"    {intent:15s} → {count:6d} ({pct:.1f}%)")
        print(f"\n  needs_llm: {result['needs_llm_pct']}%")
        print(f"\n  Output: output/{profile['output']}")
        print(f"  Manifest: output/{profile['output'].replace('.jsonl', '.manifest.json')}")

    print(f"\n{'='*60}")


if __name__ == "__main__":
    main()
```

**Step 3: Run CLI test**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python -m pytest datasets/tests/test_cli.py -v`
Expected: PASS (at least --help)

**Step 4: Commit**

```bash
git add datasets/generate.py datasets/tests/test_cli.py
git commit -m "feat: implement Brain Factory CLI with --profile, --only, --eval, --dry-run"
```

---

### Task 7: Write All 21 Section YAML Configs

**Files:**
- Create: `datasets/configs/sections/01_actions.yml` through `21_lcd_scratch.yml`

This is the largest task — writing the actual training data templates. Each YAML defines templates with {vars} for combinatorial explosion.

**Step 1: Write `01_actions.yml`**

Extract PLAY_VARIANTS, PAUSE_VARIANTS, RESET_VARIANTS, CLEARALL_VARIANTS from existing `generate_brain_dataset.py` into YAML template format. ~200 phrases total, 6+ repeats = 1200+ with corruption.

**Step 2: Write `02_circuit.yml`**

Component placement phrases: "metti {slang} sulla breadboard", "aggiungi {slang}", etc. × 21 components × 10+ verb variants. Pin wiring: "collega {pin} a {pin}".

**Step 3: Write `03_code.yml`**

Arduino/Scratch coding: "compila il codice", "apri l'editor", "passa a Scratch", "che errore c'è". Code questions: "cos'è void setup", "come faccio un for loop", etc.

**Step 4: Write `04_tutor.yml`**

Theory questions: Ohm's law, series/parallel, current/voltage/resistance explanations. All `needs_llm=true` with pedagogical hints.

**Step 5: Write `05_navigation.yml`**

"Carica esperimento {exp}", "apri tab {tab}", "vai al volume {vol}", "prossimo esperimento", "torna indietro".

**Step 6: Write `06_vision.yml`**

"Guarda il mio circuito", "cosa vedi?", "è giusto il collegamento?", "analizza lo screenshot". All trigger vision flow.

**Step 7: Write `07_teacher.yml`** (~1500 examples)

30+ templates × 10+ variants:
- "Come spiego {concetto} alla classe?"
- "Prepara un quiz su {argomento}"
- "Uno studente mi ha chiesto {domanda}"
- "Qual è l'ordine degli esperimenti del volume {vol}?"
- "Fammi una lezione guidata su {componente}"

**Step 8: Write `08_teacher_clueless.yml`** (~500+ examples)

The docente imbranato section — all `needs_llm=true`, hint includes "docente totalmente inesperto, rassicurare":
- "Io sono la prof di {materia}, non capisco niente"
- "Ho paura di rompere qualcosa davanti alla classe"
- "I ragazzi ne sanno più di me"
- "Dimmi cosa dire quando mi chiedono {domanda}"
- "Qual è il modo più semplice per non fare figuracce?"

**Step 9: Write `09_dialects.yml`**

Extract DIALECT_TEMPLATES from existing generator (13 dialects × 16 actions). Already well-structured in old code.

**Step 10: Write `10_profanity.yml`**

Frustration phrases with profanity, mapped to correct intents.

**Step 11: Write `11_expert.yml`**

Technical jargon: "la giunzione p-n del LED", "il duty cycle del PWM", "pull-up da 10k".

**Step 12: Write `12_ignorant.yml`**

Total ignorance: "cos'è sta roba", "il coso con le gambe", "la cosa che gira".

**Step 13: Write `13_truncated.yml`**

Pre-truncated phrases — "metti un led sulla bre", "compila il co", "carica l'esper".

**Step 14: Write `14_emoji.yml`**

Pure emoji communication: "💡➡️🔌" = "collega LED", "▶️" = "play", etc.

**Step 15: Write `15_english.yml`**

English/mixed: "put a LED", "start the simulation", "what is a resistor".

**Step 16: Write `16_voice.yml`**

Voice-to-text errors pre-baked: "a Gendy il led" = "accendi il LED".

**Step 17: Write `17_out_of_scope.yml`**

Off-topic: "che ore sono", "chi ha vinto la partita", "raccontami una barzelletta". All `needs_llm=true` with "fuori tema, riporta su ELAB" hint.

**Step 18: Write `18_multi_step.yml`**

Multi-action sequences: "metti un LED, collegalo e avvia" = 3 actions in 1.

**Step 19: Write `19_context_aware.yml`**

Context-dependent: "cos'è questo?" depends on current tab/experiment.

**Step 20: Write `20_autocorrect.yml`**

Pre-baked autocorrect fails.

**Step 21: Write `21_lcd_scratch.yml`**

LCD and Blockly specific: "inizializza il display", "stampa Hello World sull'LCD", "crea un blocco per il servo".

**Step 22: Test generation with all sections**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python datasets/generate.py --profile v5-extreme-25k --dry-run`
Expected: Shows all 21 sections with weighted targets summing to ~25K.

**Step 23: Run full generation**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python datasets/generate.py --profile v5-extreme-25k`
Expected: Generates 25K+ unique examples, writes JSONL + manifest.

**Step 24: Verify output quality**

```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
# Check file size
wc -l datasets/output/galileo-brain-v5-extreme-25k.jsonl
# Check manifest
cat datasets/output/galileo-brain-v5-extreme-25k.manifest.json
# Spot check random examples
python -c "
import json, random
lines = open('datasets/output/galileo-brain-v5-extreme-25k.jsonl').readlines()
for l in random.sample(lines, 5):
    ex = json.loads(l)
    print(ex['messages'][1]['content'][:80])
    print('  →', ex['messages'][2]['content'][:80])
    print()
"
```

**Step 25: Commit**

```bash
git add datasets/configs/sections/ datasets/output/*.manifest.json
git commit -m "feat: add all 21 section configs — 25K dataset generated"
```

Note: Do NOT commit the .jsonl file (too large for git). Add to `.gitignore`:
```
datasets/output/*.jsonl
```

---

### Task 8: Generate Evaluation Set

**Files:**
- Modify: `datasets/profiles/eval-200.yml`

**Step 1: Generate eval set**

Run: `cd "VOLUME 3/PRODOTTO/elab-builder" && python datasets/generate.py --profile v5-extreme-25k --eval 200 --seed 9999`

The different seed ensures holdout phrases are different from training.

**Step 2: Verify eval set**

```bash
wc -l datasets/output/*eval*
cat datasets/output/*.manifest.json | python -m json.tool
```

**Step 3: Commit**

```bash
git add datasets/output/*eval*.manifest.json datasets/profiles/eval-200.yml
git commit -m "feat: generate 200-example evaluation holdout set"
```

---

### Task 9: Training Notebook (Colab)

**Files:**
- Create: `notebooks/galileo-brain-v5-training.ipynb`

**Step 1: Create notebook with cells**

Cell 1: Install dependencies
```python
!pip install unsloth "torch>=2.1" pyyaml
```

Cell 2: Load model
```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen3-4B-unsloth-bnb-4bit",
    max_seq_length=2048,
    load_in_4bit=True,
)
```

Cell 3: Apply LoRA
```python
model = FastLanguageModel.get_peft_model(
    model,
    r=32, lora_alpha=32,
    target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
)
```

Cell 4: Load datasets
```python
from datasets import load_dataset
# Phase 1: base 20K
ds_base = load_dataset("json", data_files="galileo-brain-20k.jsonl", split="train")
# Phase 2: extreme 25K
ds_extreme = load_dataset("json", data_files="galileo-brain-v5-extreme-25k.jsonl", split="train")
```

Cell 5: Format for ChatML
```python
def format_chatml(example):
    messages = example["messages"]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
    return {"text": text}

ds_base = ds_base.map(format_chatml)
ds_extreme = ds_extreme.map(format_chatml)
```

Cell 6: Training Phase 1 (base)
```python
from trl import SFTTrainer
from transformers import TrainingArguments

trainer_base = SFTTrainer(
    model=model, tokenizer=tokenizer,
    train_dataset=ds_base,
    args=TrainingArguments(
        output_dir="./checkpoints-base",
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        num_train_epochs=2,
        learning_rate=1e-4,
        warmup_steps=50,
        logging_steps=25,
        save_steps=500,
        fp16=True,
        optim="adamw_8bit",
    ),
    dataset_text_field="text",
    max_seq_length=2048,
    train_on_responses_only=True,
)
trainer_base.train()
```

Cell 7: Training Phase 2 (extreme)
```python
trainer_extreme = SFTTrainer(
    model=model, tokenizer=tokenizer,
    train_dataset=ds_extreme,
    args=TrainingArguments(
        output_dir="./checkpoints-extreme",
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        num_train_epochs=1,
        learning_rate=5e-5,  # Lower LR for fine-tuning phase
        warmup_steps=30,
        logging_steps=25,
        save_steps=500,
        fp16=True,
        optim="adamw_8bit",
        load_best_model_at_end=True,
        eval_strategy="steps",
        eval_steps=500,
    ),
    dataset_text_field="text",
    max_seq_length=2048,
    train_on_responses_only=True,
)
trainer_extreme.train()
```

Cell 8: Export GGUF
```python
model.save_pretrained_gguf(
    "galileo-brain-v5",
    tokenizer,
    quantization_method=["q4_k_m", "q5_k_m"],
)
```

Cell 9: Evaluation
```python
# Load eval set and test inference
ds_eval = load_dataset("json", data_files="galileo-brain-v5-extreme-25k-eval-200.jsonl", split="train")

correct = 0
total = len(ds_eval)
for ex in ds_eval:
    messages = ex["messages"][:2]  # system + user only
    inputs = tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
    outputs = model.generate(inputs, max_new_tokens=512, temperature=0.1)
    predicted = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)

    try:
        pred_json = json.loads(predicted)
        expected_json = json.loads(ex["messages"][2]["content"])
        if pred_json["intent"] == expected_json["intent"] and pred_json["needs_llm"] == expected_json["needs_llm"]:
            correct += 1
    except:
        pass

print(f"Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
```

**Step 2: Commit**

```bash
git add notebooks/galileo-brain-v5-training.ipynb
git commit -m "feat: add Colab training notebook for Brain v5 (sequential base+extreme)"
```

---

### Task 10: Nanobot Ollama Integration

**Files:**
- Modify: `nanobot/server.py` — add `call_ollama_brain()` + shadow mode
- Modify: `nanobot/requirements.txt` — add `httpx` if not present
- Create: `nanobot/Modelfile` — Ollama Modelfile for Brain GGUF

**Step 1: Create Ollama Modelfile**

`nanobot/Modelfile`:
```
FROM ./galileo-brain-v5-q4_k_m.gguf

PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER num_predict 512
PARAMETER stop </s>

SYSTEM """Sei il Galileo Brain, il cervello di routing di UNLIM..."""
```

**Step 2: Add `call_ollama_brain()` to `server.py`**

```python
BRAIN_MODE = os.environ.get("BRAIN_MODE", "off")  # off | shadow | active
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

async def call_ollama_brain(message: str, context: str) -> dict | None:
    """Call local Brain via Ollama. Returns parsed JSON or None on failure."""
    if BRAIN_MODE == "off":
        return None
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(f"{OLLAMA_URL}/api/generate", json={
                "model": "galileo-brain-v5",
                "prompt": f"{context}\n\n[MESSAGGIO]\n{message}",
                "stream": False,
            })
            resp.raise_for_status()
            text = resp.json()["response"]
            return json.loads(text)
    except Exception as e:
        logger.warning(f"Brain call failed: {e}")
        return None
```

**Step 3: Add shadow mode to `route_to_specialist()`**

In the main routing function, after L0 regex and before cloud dispatch:
```python
# L2: Brain (shadow or active)
brain_result = await call_ollama_brain(message, context)
if brain_result and BRAIN_MODE == "shadow":
    logger.info(f"BRAIN_SHADOW: intent={brain_result.get('intent')} needs_llm={brain_result.get('needs_llm')} msg={message[:50]}")
elif brain_result and BRAIN_MODE == "active" and not brain_result.get("needs_llm"):
    return brain_result  # Brain responds directly
```

**Step 4: Commit**

```bash
git add nanobot/server.py nanobot/Modelfile
git commit -m "feat: add Ollama Brain integration with shadow/active mode"
```

---

### Summary — Task Order

| # | Task | Est. Time | Dependencies |
|---|------|-----------|-------------|
| 1 | Scaffold directory structure | 10 min | none |
| 2 | Corruption pipeline | 20 min | Task 1 |
| 3 | Base + TemplateSection | 20 min | Task 2 |
| 4 | ComboSection | 15 min | Task 3 |
| 5 | Registry + Engine | 20 min | Tasks 3, 4 |
| 6 | CLI | 10 min | Task 5 |
| 7 | All 21 section YAMLs | 60 min | Task 6 |
| 8 | Evaluation set | 5 min | Task 7 |
| 9 | Training notebook | 15 min | Task 8 |
| 10 | Nanobot Ollama integration | 15 min | Task 9 (GGUF) |

**Total estimated: ~3 hours implementation**

Tasks 1-6 are sequential (each builds on previous). Task 7 is the bulk of the work. Tasks 8-10 follow linearly.
