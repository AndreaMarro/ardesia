import json, glob, re, sys

files = sorted(glob.glob('src/data/lesson-paths/v*.json'))
issues = []

for f in files:
    fname = f.split('/')[-1]
    data = json.load(open(f))

    # L1: Schema
    required = {'_meta','experiment_id','volume','chapter','title','chapter_title',
                'difficulty','duration_minutes','target_age','objective',
                'components_needed','vocabulary','prerequisites','next_experiment',
                'phases','assessment_invisible','session_save'}
    missing = required - set(data.keys())
    if missing: issues.append(f"L1_SCHEMA: {fname} missing {missing}")
    phases = data.get('phases', [])
    if len(phases) != 5: issues.append(f"L1_PHASES: {fname} has {len(phases)}")

    # L2: Vocab (ALL sections)
    forbidden = data.get('vocabulary', {}).get('forbidden', [])
    full = json.dumps(data, ensure_ascii=False).lower()
    voc = json.dumps(data.get('vocabulary', {}), ensure_ascii=False).lower()
    check = full.replace(voc, '')
    for w in forbidden:
        if len(w) >= 3 and w.lower() in check:
            issues.append(f"L2_VOCAB: {fname} — '{w}'")

    # L4: Sequencing
    # (check broken links — need all_ids first)

    # L5: Durations
    for p in phases:
        dur = p.get('duration_minutes', 0)
        pname = p.get('name', '')
        if dur < 3 or dur > 20:
            issues.append(f"L5_DURATION: {fname} {pname}={dur}min (unusual)")

    # L5: Action tags
    if len(phases) >= 2:
        mostra = phases[1]
        tags = mostra.get('action_tags', [])
        exp_id = data.get('experiment_id', '')
        expected_tag = f"[AZIONE:loadexp:{exp_id}]"
        if expected_tag not in tags:
            issues.append(f"L5_LOADEXP: {fname} MOSTRA missing {expected_tag}")

    if len(phases) >= 4:
        osserva = phases[3]
        tags = osserva.get('action_tags', [])
        if not any('play' in t for t in tags):
            issues.append(f"L5_PLAY: {fname} OSSERVA missing [AZIONE:play]")
        if not any('highlight' in t for t in tags):
            issues.append(f"L5_HIGHLIGHT: {fname} OSSERVA missing highlights")

    # Content quality
    if len(phases) >= 4:
        if len(phases[3].get('analogies', [])) < 2:
            issues.append(f"CONTENT: {fname} <2 analogies")
    if len(phases) >= 3:
        if len(phases[2].get('common_mistakes', [])) < 2:
            issues.append(f"CONTENT: {fname} <2 common_mistakes")
    if len(phases) >= 2:
        bc = phases[1].get('build_circuit', {}).get('intent', {})
        if not bc.get('components'): issues.append(f"L3_EMPTY_COMP: {fname}")
        if not bc.get('wires'): issues.append(f"L3_EMPTY_WIRE: {fname}")

# L4: Broken links
all_ids = set()
for f in files:
    data = json.load(open(f))
    all_ids.add(data.get('experiment_id', ''))

for f in files:
    data = json.load(open(f))
    fname = f.split('/')[-1]
    ne = data.get('next_experiment')
    if ne and isinstance(ne, dict):
        nid = ne.get('id', '')
        if nid and nid not in all_ids:
            issues.append(f"L4_BROKEN: {fname} → {nid}")

print(f"Files: {len(files)}")
print(f"Issues: {len(issues)}")
for i in sorted(issues):
    print(f"  {i}")
if not issues:
    print("✅ ALL CLEAR")
sys.exit(1 if issues else 0)
