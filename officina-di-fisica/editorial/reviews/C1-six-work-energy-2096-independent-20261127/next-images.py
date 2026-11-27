from pathlib import Path
import json,sys
D=Path(__file__).resolve().parent;p=D/'raster-read-log.json';log=json.loads(p.read_text())if p.exists()else{'actuallyOpened':[],'pending':[]}
if '--confirm-previous'in sys.argv:log['actuallyOpened']+=log['pending'];log['pending']=[]
assert not log['pending'];seen={r['imageSha256']for r in log['actuallyOpened']};out=[]
for row in json.loads((D/'priority-raster-index.json').read_text()):
 for i in row['screenshots']:
  if i['sha256']in seen:continue
  seen.add(i['sha256']);out.append({'key':row['caseKey'],'imageSha256':i['sha256'],'path':str(D/i['file'])})
  if len(out)==int(sys.argv[1]):break
 if len(out)==int(sys.argv[1]):break
log['pending']=out;p.write_text(json.dumps(log,indent=2)+'\n');print(json.dumps(out))
