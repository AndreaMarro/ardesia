import pathlib,json,sys
D=pathlib.Path(__file__).resolve().parent;S=pathlib.Path('/private/tmp/cric-c1-two-families-980-552-20261127');p=D/'raster-read-log.json';log=json.loads(p.read_text())if p.exists()else{'actuallyOpened':[],'pending':[]}
if '--confirm-previous'in sys.argv:log['actuallyOpened']+=log['pending'];log['pending']=[]
assert not log['pending'];seen={x['imageSha256']for x in log['actuallyOpened']};rows=json.loads((D/'selected-index.json').read_text());out=[];width=int(sys.argv[1]);limit=int(sys.argv[2])
rows.sort(key=lambda x:x['caseKey'])
for r in rows:
 if int(r['caseKey'].split('|')[2])!=width:continue
 for s in r['screenshots']:
  if s['sha256']in seen:continue
  seen.add(s['sha256']);out.append({'key':r['caseKey'],'imageSha256':s['sha256'],'path':str(S/s['file'])})
  if len(out)==limit:break
 if len(out)==limit:break
log['pending']=out;p.write_text(json.dumps(log,indent=2)+'\n');print(json.dumps(out))
