#!/usr/bin/env python3
"""Cross-check Vol1 lesson-path JSON components vs experiments-vol1.js"""
import json, glob, re

# Parse experiments-vol1.js
with open('src/data/experiments-vol1.js') as f:
    content = f.read()

# Find experiment blocks by { ... id: "v1-..." pattern
pattern = re.compile(r'\{\s*(?:type:\s*"[^"]+",\s*)?id:\s*"(v1-[^"]+)"')
id_positions = [(m.group(1), m.start()) for m in pattern.finditer(content)]

# Also try single quotes
pattern2 = re.compile(r"\{\s*(?:type:\s*'[^']+',\s*)?id:\s*'(v1-cap[^']+)'")
for m in pattern2.finditer(content):
    id_positions.append((m.group(1), m.start()))

# Deduplicate and sort by position
id_positions = sorted(set(id_positions), key=lambda x: x[1])

# For each experiment, find its components section
experiments = {}
for i, (exp_id, pos) in enumerate(id_positions):
    # Only process experiment-level IDs (v1-capX-espY), not component IDs
    if not re.match(r'v1-cap\d+-esp\d+$', exp_id):
        continue

    # Get block from this position to next experiment
    end = id_positions[i+1][1] if i+1 < len(id_positions) else len(content)
    block = content[pos:end]

    # Find components array
    comp_match = re.search(r'components:\s*\[', block)
    if comp_match:
        # Extract from components: [ to matching ]
        comp_start = comp_match.end()
        bracket_depth = 1
        j = comp_start
        while j < len(block) and bracket_depth > 0:
            if block[j] == '[': bracket_depth += 1
            elif block[j] == ']': bracket_depth -= 1
            j += 1
        comp_section = block[comp_start:j-1]

        # Extract component IDs from this section
        comp_ids = set(re.findall(r'id:\s*"([^"]+)"', comp_section))
        comp_ids.update(re.findall(r"id:\s*'([^']+)'", comp_section))
        experiments[exp_id] = comp_ids
    else:
        experiments[exp_id] = set()

print(f"Parsed {len(experiments)} experiments from experiments-vol1.js")

# Compare with JSON files
json_files = sorted(glob.glob('src/data/lesson-paths/v1-*.json'))
mismatches = []
checked = 0

for jf in json_files:
    d = json.load(open(jf))
    eid = d['experiment_id']
    fname = jf.split('/')[-1]

    if eid not in experiments:
        mismatches.append(f"{fname}: experiment {eid} NOT FOUND in experiments-vol1.js")
        continue

    checked += 1

    # Get JSON components
    phases = d.get('phases', [])
    json_comps = set()
    if len(phases) >= 2:
        bc = phases[1].get('build_circuit', {}).get('intent', {})
        json_comps = {c.get('id', '') for c in bc.get('components', [])}

    # Get JS components
    js_comps = experiments[eid]

    # Compare
    only_json = json_comps - js_comps
    only_js = js_comps - json_comps

    if only_json or only_js:
        mismatches.append(f"{fname}: JSON_ONLY={only_json}, JS_ONLY={only_js}")

print(f"JSON files checked: {len(json_files)}")
print(f"Matched to JS: {checked}")
print(f"Mismatches: {len(mismatches)}")
for m in mismatches:
    print(f"  {m}")
if not mismatches:
    print("✅ ALL Vol1 components MATCH")
