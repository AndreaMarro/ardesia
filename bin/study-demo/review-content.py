#!/usr/bin/env python3
"""Export a hashed, UNAPPROVED review packet. Never creates a human signature."""
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.coursepack import load_coursepack,review_manifest
parser=argparse.ArgumentParser();parser.add_argument('destination',type=Path);args=parser.parse_args()
args.destination.mkdir(parents=True,exist_ok=False)
pack=load_coursepack();manifest=review_manifest(pack)
(args.destination/'review-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(args.destination/'coursepack.json').write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
lines=['# Revisione scientifica — DRAFT',f"Contenuto: {manifest['coursepack']} · SHA256: {manifest['sha256']}",'',pack['scope'],'','Reviewer umano: DA COMPILARE','Decisione: DA COMPILARE','Data/prova tutor: DA COMPILARE','', 'Nessuna approvazione viene emessa da questo comando.']
for activity in pack['activities']:lines+=['',f"## {activity['title']}",activity['model'],activity['domain']]
for item in pack['exercises']+[item for group in pack['transferTests'] for item in group['items']]:
 lines+=['',f"### {item['id']}",item['prompt'],'',item.get('solution',''),f"Proposta numerica: {item['answer']['value']} {item['answer']['unit']}",'Ipotesi, unità, soluzione, accessibilità, originalità: [ ] da verificare','Decisione/commento umano: ____________________']
(args.destination/'review-worksheet.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(manifest))
if not manifest['numericalValidation']['ok']:raise SystemExit(1)
