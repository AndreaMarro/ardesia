from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
p=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews/C4-L02-01-f357-independent-b-20261127');a=json.loads((p/'actual/report.json').read_text());rows=[];H=lambda b:hashlib.sha256(b).hexdigest()
for e in a['cases']:
 f=p/'actual'/e['file'];c=json.loads(f.read_text());assert H(f.read_bytes())==e['sha256'];state=c.get('interaction');selected=state is None or state.get('x')in[2.5,3,8]
 for s in c['screenshots']:assert H((p/'actual'/s['file']).read_bytes())==s['sha256']
 rows.append({'caseKey':c['caseKey'],'model':c.get('model'),'profile':c['profile'],'caseFile':str(f.relative_to(p)),'caseSha256':e['sha256'],'screenshots':[str((p/'actual'/s['file']).relative_to(p))for s in c['screenshots']],'selected':selected,'read':False})
out=p/'native-panels';out.mkdir(exist_ok=True);idx=[]
for w in[320,1280]:
 rr=[r for r in rows if r['selected']and r['profile']['width']==w];step=4 if w==320 else 2
 for k in range(0,len(rr),step):
  batch=rr[k:k+step];imgs=[Image.open(p/r['screenshots'][0]).convert('RGB')for r in batch];cw=max(i.width for i in imgs);ch=max(i.height for i in imgs)+32;sheet=Image.new('RGB',(cw*2,ch*((len(batch)+1)//2)),'white');dr=ImageDraw.Draw(sheet)
  for j,(r,i)in enumerate(zip(batch,imgs)):
   x=j%2*cw;y=j//2*ch;sheet.paste(i,(x,y+32));dr.text((x,y),r['caseKey'],fill='black')
  f=out/(str(w)+'-'+str(k)+'.png');sheet.save(f);idx.append({'panel':str(f.relative_to(p)),'cases':[r['caseKey']for r in batch],'resized':False,'cropped':False,'opened':False})
(p/'case-index.json').write_text(json.dumps(rows,indent=2)+'\n');(p/'panels-index.json').write_text(json.dumps(idx,indent=2)+'\n');print(len(rows),sum(r['selected']for r in rows),[r['panel']for r in idx])
