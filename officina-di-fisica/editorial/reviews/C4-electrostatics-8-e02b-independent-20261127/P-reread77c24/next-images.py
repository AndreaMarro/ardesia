from pathlib import Path
import json,sys
D=Path(__file__).resolve().parent
p=D/'raster-read-log.json'
log=json.loads(p.read_text())if p.exists()else{'actuallyOpened':[],'pending':[]}
if '--confirm-previous'in sys.argv:
    log['actuallyOpened']+=log['pending'];log['pending']=[]
assert not log['pending']
seen={x['imageSha256']for x in log['actuallyOpened']}
rows=json.loads((D/'selected-index.json').read_text());width=int(sys.argv[1]);limit=int(sys.argv[2]);out=[]
rows.sort(key=lambda x:(0 if '|orbit|'in x['caseKey']else 1 if '|top|'in x['caseKey']else 2,x['caseKey']))
for row in rows:
    if int(row['caseKey'].split('|')[2])!=width:continue
    for s in row['screenshots']:
        if s['sha256']in seen:continue
        seen.add(s['sha256']);out.append({'key':row['caseKey'],'imageSha256':s['sha256'],'path':str(D/'actual-browser'/s['file'])})
        if len(out)==limit:break
    if len(out)==limit:break
log['pending']=out;p.write_text(json.dumps(log,indent=2)+'\n');print(json.dumps(out))
