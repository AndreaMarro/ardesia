#!/bin/bash
# Verify ASR transcription: exists, monotonic timestamps, spot-check, confidence
# Usage: bin/verify-transcription.sh <jsonl-path>
# Python-only (no bc/jq deps), guards for short files, honest verdict.
# Path is passed as sys.argv[1] (NOT shell-interpolated into Python code)
set -euo pipefail

JSONL="${1:?Usage: $0 <jsonl-path>}"
[ -f "$JSONL" ] || { echo "[FAIL] JSONL not found: $JSONL"; exit 1; }

echo "=== File info ==="
wc -l "$JSONL"
ls -lh "$JSONL"

echo ""
echo "=== Timestamp monotonicity check ==="
# All numeric comparisons in Python to avoid bc dependency
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    lines = [json.loads(l.strip()) for l in f if l.strip()]
total = len(lines)
overlaps = 0
inverted = 0
for i in range(1, total):
    prev_end = lines[i-1]['end']
    start = lines[i]['start']
    end = lines[i]['end']
    if start < prev_end:
        print(f'  [OVERLAP] line {i+1}: prev_end={prev_end}s > start={start}s')
        overlaps += 1
    if start > end:
        print(f'  [INVERTED] line {i+1}: start={start}s > end={end}s')
        inverted += 1
if total == 0:
    print('  [WARN] No segments to check')
elif overlaps == 0 and inverted == 0:
    print(f'  All {total} segments monotonic ✓')
else:
    print(f'  {overlaps} overlap(s) + {inverted} inverted found')
print(f'TOTAL_SEGMENTS={total}')
print(f'OVERLAPS={overlaps}', flush=True)
" "$JSONL" 2>&1

# Extract metrics from Python output
total_seg=$(python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    print(sum(1 for l in f if l.strip()))
" "$JSONL")

echo ""
echo "=== Duration ==="
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    segs = [json.loads(l.strip()) for l in f if l.strip()]
if segs:
    first = segs[0]['start']
    last = segs[-1]['end']
    total = last - first
    print(f'  First start: {first}s, Last end: {last}s, Total: {total}s ({total/60:.1f} min)')
else:
    print('  [WARN] No segments')
" "$JSONL"

echo ""
echo "=== Spot-check: first 3 segments (actual content) ==="
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    segs = [json.loads(l.strip()) for l in f if l.strip()]
n = min(3, len(segs))
for i in range(n):
    s = segs[i]
    print(f'  Segment {i+1} [{s[\"start\"]}s-{s[\"end\"]}s] conf={s[\"confidence\"]}: \"{s[\"text\"]}\"')
if n < 3:
    print(f'  (only {n} segments available)')
" "$JSONL"

echo ""
echo "=== Spot-check: last 2 segments ==="
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    segs = [json.loads(l.strip()) for l in f if l.strip()]
n = len(segs)
if n >= 2:
    for i in [n-2, n-1]:
        s = segs[i]
        print(f'  Segment {i+1} [{s[\"start\"]}s-{s[\"end\"]}s] conf={s[\"confidence\"]}: \"{s[\"text\"]}\"')
elif n == 1:
    s = segs[0]
    print(f'  Segment 1 [{s[\"start\"]}s-{s[\"end\"]}s] conf={s[\"confidence\"]}: \"{s[\"text\"]}\"')
else:
    print('  (no segments)')
" "$JSONL"

echo ""
echo "=== Confidence summary ==="
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    segs = [json.loads(l.strip()) for l in f if l.strip()]
if segs:
    confs = [s['confidence'] for s in segs]
    print(f'  Mean: {sum(confs)/len(confs):.4f}')
    print(f'  Min:  {min(confs):.4f}')
    print(f'  Max:  {max(confs):.4f}')
    low = [c for c in confs if c < 0.3]
    print(f'  Low-confidence (<0.3): {len(low)}/{len(confs)} ({len(low)/len(confs)*100:.1f}%)')
" "$JSONL"

echo ""
echo "=== VERDETTO ==="
python3 -c "
import json
import sys

path = sys.argv[1]
with open(path) as f:
    segs = [json.loads(l.strip()) for l in f if l.strip()]
if not segs:
    print('[FAIL] Empty transcription')
    exit(1)
# Check 1: monotonic timestamps
overlaps = sum(1 for i in range(1, len(segs)) if segs[i]['start'] < segs[i-1]['end'])
inverted = sum(1 for s in segs if s['start'] > s['end'])
# Check 2: confidence threshold (at least 50% segments >= 0.5)
good_conf = sum(1 for s in segs if s['confidence'] >= 0.5)
conf_ok = good_conf >= len(segs) / 2
# Check 3: has meaningful text (at least 10 segments with >10 chars)
meaningful = sum(1 for s in segs if len(s['text']) > 10)
text_ok = meaningful >= 10

passed = True
if overlaps > 0 or inverted > 0:
    print(f'[{overlaps+inverted} timestamp issue(s)]')
    passed = False
if not conf_ok:
    print(f'[LOW CONFIDENCE] only {good_conf}/{len(segs)} segs >= 0.5 conf')
    passed = False
if not text_ok:
    print(f'[INSUFFICIENT CONTENT] only {meaningful} segs with >10 chars (need >=10)')
    passed = False

if passed:
    print(f'✓ PASS — {len(segs)} segments, timestamps monotonic, conf ok, content present')
else:
    print(f'⚠  ISSUES FOUND — see above')
" "$JSONL" 2>&1
