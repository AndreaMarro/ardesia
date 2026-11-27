from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
p=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews/C4-two-fallback-1209-independent-b-20261127');a=json.loads((p/'case-index.json').read_text());out=p/'native-panels';out.mkdir(exist_ok=True);idx=[]
for id in ['SIM-C4-L02-01','SIM-C4-L02-02']:
 for width in [320,1280]:
  rows=[r for r in a['records']if r['selected']and r['id']==id and r['profile']['width']==width]
  for start in range(0,len(rows),4 if width==320 else 2):
   rr=rows[start:start+(4 if width==320 else 2)];imgs=[Image.open(p/r['screenshots'][0]['file']).convert('RGB')for r in rr];cw=max(i.width for i in imgs);ch=max(i.height for i in imgs)+32;cols=2;sheet=Image.new('RGB',(cw*cols,ch*((len(rr)+1)//2)), 'white');d=ImageDraw.Draw(sheet)
   for j,(r,i)in enumerate(zip(rr,imgs)):
    x=(j%2)*cw;y=(j//2)*ch;sheet.paste(i,(x,y+32));d.text((x+3,y+3),r['caseKey'],fill='black')
   f=out/(id+'-'+str(width)+'-'+str(start)+'.png');sheet.save(f);idx.append({'panel':str(f.relative_to(p)),'cases':[r['caseKey']for r in rr],'sourceImages':[r['screenshots'][0]['file']for r in rr],'resized':False,'cropped':False,'opened':False})
(p/'native-panels-index.json').write_text(json.dumps(idx,indent=2)+'\n');print([(i['panel'],len(i['cases']))for i in idx])
