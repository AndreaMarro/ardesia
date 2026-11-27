from pathlib import Path
from fractions import Fraction as F
from PIL import Image,ImageDraw
import json,hashlib
p=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews/c2-flow-continuity-browser719-actual-b-20261127');rows=[];H=lambda b:hashlib.sha256(b).hexdigest()
for key in ['03-320','03-1280']:
 d=p/key/'actual';a=json.loads((d/'report.json').read_text())
 for e in a['cases']:
  c=json.loads((d/e['file']).read_text());assert H((d/e['file']).read_bytes())==e['sha256'];r={'caseKey':c['caseKey'],'model':c.get('model'),'profile':c['profile'],'variant':c['variant'],'caseFile':str((d/e['file']).relative_to(p)),'screenshots':[]}
  for s in c['screenshots']:
   f=d/s['file'];assert H(f.read_bytes())==s['sha256'];r['screenshots'].append(str(f.relative_to(p)))
  if c.get('interaction'):
   x=F(str(c['interaction']['x']));want=F(24)/x;assert c['model']['y']==float(want);r['independentExact']=str(want)
  rows.append(r)
out=p/'03-native-panels';out.mkdir(exist_ok=True);seen=set();groups={}
for r in rows:
 f=p/r['screenshots'][0];h=H(f.read_bytes())
 if h in seen:continue
 seen.add(h);w=r['profile']['width'];groups.setdefault(w,[]).append(r)
idx=[]
for w,rr in groups.items():
 step=4 if w==320 else 2
 for k in range(0,len(rr),step):
  batch=rr[k:k+step];imgs=[Image.open(p/r['screenshots'][0]).convert('RGB')for r in batch];cw=max(i.width for i in imgs);ch=max(i.height for i in imgs)+30;sheet=Image.new('RGB',(cw*2,ch*((len(batch)+1)//2)),'white');dr=ImageDraw.Draw(sheet)
  for j,(r,i)in enumerate(zip(batch,imgs)):
   x=j%2*cw;y=j//2*ch;sheet.paste(i,(x,y+30));dr.text((x,y),r['caseKey'],fill='black')
  f=out/(str(w)+'-'+str(k)+'.png');sheet.save(f);idx.append({'panel':str(f.relative_to(p)),'cases':[r['caseKey']for r in batch],'sourceImages':[r['screenshots'][0]for r in batch],'opened':False,'cropped':False,'resized':False})
(p/'03-case-index.json').write_text(json.dumps(rows,indent=2)+'\n');(p/'03-panels-index.json').write_text(json.dumps(idx,indent=2)+'\n');print('cases',len(rows),'uniquePNG',len(seen),'panels',len(idx));print([i['panel']for i in idx])
