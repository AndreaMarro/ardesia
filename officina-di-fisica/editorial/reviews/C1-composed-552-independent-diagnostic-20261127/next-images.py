import json,pathlib,sys
D=pathlib.Path(__file__).resolve().parent
idx=json.loads((D/'selected-index.json').read_text());L=D/'raster-read-log.json';log=json.loads(L.read_text()) if L.exists() else {'actuallyOpened':[],'pending':[]}
if '--confirm-previous' in sys.argv:log['actuallyOpened']+=log['pending'];log['pending']=[]
assert not log['pending'],'Confirm only images actually opened'
epoch=sys.argv[1];width=int(sys.argv[2]);limit=int(sys.argv[3]);seen={(x['epoch'],x['imageSha256']) for x in log['actuallyOpened']};out=[]
for x in idx:
 if x['epoch']!=epoch or int(x['key'].split('|')[2])!=width:continue
 for s in x['screenshots']:
  key=(epoch,s['sha256'])
  if key in seen:continue
  seen.add(key);out.append({'epoch':epoch,'key':x['key'],'imageSha256':s['sha256'],'path':str(D/epoch/s['file'])})
  if len(out)==limit:break
 if len(out)==limit:break
log['pending']=out;L.write_text(json.dumps(log,indent=2)+'\n');print(json.dumps(out))
