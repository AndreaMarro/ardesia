from pathlib import Path
from fractions import Fraction as F
import hashlib,json,shutil
from PIL import Image,ImageDraw
D=Path(__file__).resolve().parent;SRC=Path('/private/tmp/cric-c4-composed-448-20261127')
IDS=['SIM-C4-L01-01','SIM-C4-L01-02','SIM-C4-L02-01','SIM-C4-L02-02','SIM-C4-L03-01']
REF='b9994b9116e87478905191d85cca8037d17ae4bd';FP='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6';PROTO='e24c46b4c11403821b026c304875f68edc76b679aa6928b1716bd597c5d15e55'
H=lambda b:hashlib.sha256(b).hexdigest();rows=[];reports=[]
for i in range(4):
 parent=SRC/f'profiles-{i}/attempt-01';A=parent/'actual'
 for name in ['terminal.json','plan.json']:
  raw=(parent/name).read_bytes();(D/f'slice-{i}-{name}').write_bytes(raw)
 report=json.loads((A/'report.json').read_bytes());reports.append({'slice':i,'sha256':H((A/'report.json').read_bytes()),'cases':len(report['cases'])});(D/f'slice-{i}-report.json').write_bytes((A/'report.json').read_bytes())
 assert len(report['cases'])==112 and not report['errors']
 assert report['sourceCommit']==REF and report['protocolSha256']==PROTO and report['runtimeFingerprint']['sha256']==FP
 assert all(c['technicalOk']for c in report['cases'])
 for e in report['cases']:
  assert H((A/e['file']).read_bytes())==e['sha256'];r=json.loads((A/e['file']).read_bytes())
  if r['id']not in IDS:continue
  assert r['sourceCommit']==REF and r['runtimeSha256']==FP and r['protocolSha256']==PROTO and r['technicalOk']
  assert r['variant']=='published'
  if r.get('model'):
   x=F(str(r['model']['x']));id=r['id'];exact=x if id.endswith('L01-01')else F(90)/(x*x)if id in IDS[1:3]else F(45,2)*(1-x)if id.endswith('L02-02')else F(9,10)*(1+2*x)
   assert r['model']['y']==float(exact),(id,x,exact,r['model'])
  copied=[]
  for s in r['screenshots']:
   p=A/s['file'];b=p.read_bytes();assert H(b)==s['sha256']
   target=D/'screens'/p.name;target.parent.mkdir(exist_ok=True)
   if target.exists():assert target.read_bytes()==b
   else:target.write_bytes(b)
   with Image.open(target)as im:size=list(im.size)
   copied.append({'path':'screens/'+target.name,'sha256':s['sha256'],'size':size})
  case=D/'cases'/Path(e['file']).name;case.parent.mkdir(exist_ok=True);case.write_bytes((A/e['file']).read_bytes())
  rows.append({'caseKey':e['caseKey'],'id':r['id'],'caseFile':'cases/'+case.name,'caseSha256':e['sha256'],'profile':r['profile'],'interaction':r.get('interaction'),'model':r.get('model'),'screenshots':copied,'legend':r.get('legend'),'fullFrameRead':False})
assert len(rows)==280 and len({r['caseKey']for r in rows})==280
(D/'verified-case-index.json').write_text(json.dumps({'reports':reports,'records':rows,'scopedIds':IDS,'excludedAuthoredIds':['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03'],'runtime':FP,'sourceDirectoryUnmodified':True},indent=2,ensure_ascii=False)+'\n')
# No image is rescaled or cropped. Each original frame is wholly visible in a labelled panel.
sheets=[]
for id in IDS:
 for width in [320,1280]:
  selected=[(r,s)for r in rows if r['id']==id and r['profile']['width']==width for s in r['screenshots']]
  selected.sort(key=lambda v:(v[0]['caseKey'].endswith('|setup'),v[0]['profile']['view'],v[0]['caseKey']))
  batchsize=4;cols=2
  for k in range(0,len(selected),batchsize):
   batch=selected[k:k+batchsize];cw=max(s['size'][0]for _,s in batch);ch=max(s['size'][1]for _,s in batch)+38
   image=Image.new('RGB',(cols*cw,((len(batch)+cols-1)//cols)*ch),'white');draw=ImageDraw.Draw(image)
   entries=[]
   for j,(r,s)in enumerate(batch):
    x=j%cols*cw;y=j//cols*ch;image.paste(Image.open(D/s['path']).convert('RGB'),(x,y+38));draw.text((x+4,y+3),r['caseKey'].replace('SIM-C4-',''),fill='black');draw.text((x+4,y+18),str(r['model']or 'setup'),fill='black');entries.append({'caseKey':r['caseKey'],'sourcePng':s['path'],'sha256':s['sha256']})
   name=f'{id}-{width}-{k//batchsize:02d}.png';path=D/'contact-sheets'/name;path.parent.mkdir(exist_ok=True);image.save(path);sheets.append({'file':'contact-sheets/'+name,'sha256':H(path.read_bytes()),'fullNativeScale':True,'read':False,'entries':entries})
(D/'contact-sheet-index.json').write_text(json.dumps(sheets,indent=2)+'\n');print(json.dumps({'caseCount':len(rows),'sourceUniquePNGs':len({s['sha256']for r in rows for s in r['screenshots']}),'sheets':len(sheets),'byId':{id:len([r for r in rows if r['id']==id])for id in IDS}}))
