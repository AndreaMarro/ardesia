from pathlib import Path
import json,sys
OUT=Path(__file__).resolve().parent
log=OUT/'raster-read-log.json';state=json.loads(log.read_bytes())
if '--confirm-previous' in sys.argv:
    state['actuallyOpened']+=state['pending'];state['pending']=[]
assert not state['pending'],'Previous images must be read before confirmation'
width=int(sys.argv[1]);limit=int(sys.argv[2]);seen={r['imageSha256']for r in state['actuallyOpened']}
report=json.loads((OUT/'actual-browser/report.json').read_bytes());chosen=[]
for row in report['cases']:
    c=json.loads((OUT/'actual-browser'/row['file']).read_bytes())
    if c['width']!=width or c['imageSha256']in seen:continue
    chosen.append({'key':c['key'],'imageSha256':c['imageSha256'],'path':str(OUT/'actual-browser'/(c['imageSha256']+'.png'))});seen.add(c['imageSha256'])
    if len(chosen)==limit:break
state['pending']=[{k:v for k,v in c.items()if k!='path'}for c in chosen]
log.write_text(json.dumps(state,indent=2)+'\n');print(json.dumps(chosen))
