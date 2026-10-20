#!/usr/bin/env python3
"""Reports pending human gates, without performing any side effects."""
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.coursepack import load_coursepack,review_manifest
from lessonos.study.readiness import assess_readiness
parser=argparse.ArgumentParser();parser.add_argument('--proofs',type=Path);args=parser.parse_args()
decisions=json.loads((ROOT/'docs/study/m2-decisions.json').read_text())
proofs=json.loads(args.proofs.read_text()) if args.proofs else {}
result=assess_readiness(review_manifest(load_coursepack()),decisions,proofs)
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(0 if result['launchAllowed'] else 2)
