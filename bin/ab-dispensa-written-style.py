#!/usr/bin/env python3
"""M2-2 A/B test: Compare dispensa prompt with v1-only vs v1+v2 (written-style).

Usage:
    uv run python3 bin/ab-dispensa-written-style.py

Shows the structural diff between the two prompt variants.
Also verifies that the written-style section is present in v2 and absent in v1.
"""

from lessonos.style import WrittenStyleProfile, derive_written_style
from lessonos.dispensa import build_dispensa_prompt, _written_style_hint

# Build a mock style profile (simulating spoken style — similar to andrea's)
from lessonos.style import StyleProfile

spoken = StyleProfile(
    teacher_id="andrea",
    exercise_density=0.05,
    question_density=0.08,
    prereq_explicitness=0.1,
    concept_granularity=8.5,
    registro="misto",
    tics=("diciamo", "praticamente", "allora"),
)

# Empty concepts list triggers the ValueError — use a stub concept instead
from dataclasses import dataclass, field
from lessonos.capsule.extraction import ConceptExtraction

# Minimal stub concept with a citation
stub_concept = ConceptExtraction(
    name="Energia del segnale",
    canonical="energia",
    status="introduced",
    citations=(
        type("", (), {"seg_id": "prima_lezione#s1", "excerpt": "l'energia e definita come"})(),
    ),
)

concepts = (stub_concept,)

# --- V1-only: no written style ---
prompt_v1 = build_dispensa_prompt("andrea", spoken, concepts)

# --- V2: with written style from real corpus ---
written = derive_written_style(
    dispense_dir="/Users/progettibelli/maestro-data/teoria-segnali-2021/derived/dispense/"
)
prompt_v2 = build_dispensa_prompt(
    "andrea", spoken, concepts,
    written_style=written,
)

# --- Diff ---
print("=" * 60)
print("M2-2 A/B COMPARISON: v1-only vs v1+v2 (written-style)")
print("=" * 60)
print()

print("WRITTEN STYLE METRICS (from Andrea's real dispense corpus):")
print(f"  dispense_processed = {written.dispense_processed}")
print(f"  avg_sentence_length = {written.avg_sentence_length}")
print(f"  formal_density = {written.formal_density}")
print(f"  section_count = {written.section_count}")
print(f"  bullet_density = {written.bullet_density}")
print(f"  math_density = {written.math_density}")
print(f"  avg_paragraph_length = {written.avg_paragraph_length}")
print()

# Show the written-style hint
hint = _written_style_hint(written)
print("WRITTEN STYLE HINT (injected into v2 prompt):")
print(hint)
print()

# Verify v2 has written-style section, v1 does not
has_written_v1 = "Stile SCRITTO del docente" in prompt_v1
has_written_v2 = "Stile SCRITTO del docente" in prompt_v2
print(f"  V1-only has written-style section: {has_written_v1}  (expected: False)")
print(f"  V1+v2 has written-style section:   {has_written_v2}  (expected: True)")
print()

# Count lines in each prompt section
for label, prompt in [("V1-only", prompt_v1), ("V1+v2", prompt_v2)]:
    lines = prompt.split("\n")
    print(f"{label}: {len(lines)} lines, {len(prompt)} chars")

print()
print("DIFF SUMMARY (key sections where V1 and V2 differ):")
v1_lines = prompt_v1.split("\n")
v2_lines = prompt_v2.split("\n")
for i, (l1, l2) in enumerate(zip(v1_lines, v2_lines)):
    if l1 != l2:
        print(f"  Line {i}: [{i}] V1: {l1[:80]}")
        print(f"           [{i}] V2: {l2[:80]}")
        print()

# Also show any extra lines in V2
if len(v2_lines) > len(v1_lines):
    print("EXTRA LINES IN V2:")
    for i in range(len(v1_lines), len(v2_lines)):
        print(f"  [+{i}] {v2_lines[i][:100]}")
