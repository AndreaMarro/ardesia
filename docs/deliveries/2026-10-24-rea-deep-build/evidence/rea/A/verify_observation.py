#!/usr/bin/env python3
"""Verify the locally retained original REA receipt without publishing donor assets."""
import argparse
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('receipt', type=Path)
args = parser.parse_args()
d = json.loads(args.receipt.read_text())
assert d['evidence_id'] == 'ev_cf24663a946455796a7c2ef7f1a088f52cbd3df5b7fdb296d17bc7af95251d69'
assert hashlib.sha256(args.receipt.read_bytes()).hexdigest() == '76531dd26cc80b8e85a753d6cbc5712168d60003fa0eec2545ded1a79b29f038'
n = d['normalized_result']; steps = n['steps']
assert all(s['status'] == 'completed' for s in steps)
assert [s['step_id'] for s in steps[1:5]] == ['ready', 'settled', 'continue-keyboard', 'reveal-keyboard']
before = steps[2]['artifacts']['accessibility']['value']['text']
after = steps[-1]['artifacts']['accessibility']['value']['text']
assert 'Next up: Degrees and Radians' not in before
assert 'Next up: Degrees and Radians' in after
assert steps[2]['artifacts']['screenshot']['value']['sha256'] != steps[-1]['artifacts']['screenshot']['value']['sha256']
assert n['completeness']['status'] == 'incomplete'
assert 'events' in n['completeness']['missing_sections']
print(json.dumps({'observedKeyboardActions': 2, 'checks': 'PASS', 'evidenceCompleteness': n['completeness'],
                  'boundary': 'progression and explicit reveal observed; mathematical learning and unseen later network events unknown'}, indent=2))
