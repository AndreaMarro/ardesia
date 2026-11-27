from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
D=Path(__file__).resolve().parent;index=[]
for width in (320,1280):
 G=D/str(width);r=json.loads((G/'actual/report.json').read_bytes());rows=[]
 for entry in r['cases']:
  c=json.loads((G/'actual'/entry['file']).read_bytes());p=c['screenshots'][0];path=G/'actual'/p['file'];raw=path.read_bytes();assert hashlib.sha256(raw).hexdigest()==p['sha256'];im=Image.open(path);rows.append((c['caseKey'],im.copy(),p['sha256'],str(path)))
 perpage=12 if width==320 else 6;columns=4 if width==320 else 2
 for start in range(0,len(rows),perpage):
  chunk=rows[start:start+perpage];cw=max(im.width for _,im,_,_ in chunk);ch=max(im.height for _,im,_,_ in chunk);out=Image.new('RGB',(cw*columns,(ch+26)*((len(chunk)+columns-1)//columns)),'white');draw=ImageDraw.Draw(out);page=[]
  for i,(key,im,h,path)in enumerate(chunk):
   x=(i%columns)*cw;y=(i//columns)*(ch+26);out.paste(im,(x,y+26));draw.text((x+2,y+2),key.split('|',2)[2],fill='black');page.append(dict(caseKey=key,sha256=h,path=path,sourceSize=list(im.size),paste=[x,y+26],crop=False,resize=False))
  name='read-'+str(width)+'-'+str(start//perpage+1)+'.png';out.save(D/name);index.append(dict(page=name,sha256=hashlib.sha256((D/name).read_bytes()).hexdigest(),sources=page))
(D/'visual-page-index.json').write_text(json.dumps(index,indent=2)+'\n');print(len(index),'pages;all80 whole fresh raster cases, no crops/resizes')
