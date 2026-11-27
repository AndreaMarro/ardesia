from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json
for family,batch,cases in [('mechanics-fluids','035',120)]:
 b=Path('editorial/reviews')/f'renewal-bench-{family}-{batch}-3ed5-20261127';out=b/f'actual-ui-{cases}';d=json.loads((out/'consumer.json').read_bytes());layout=[]
 def sheet(name,rows):
  im=Image.new('RGB',(2000,((len(rows)+3)//4)*350),'#ddd');draw=ImageDraw.Draw(im)
  for i,(key,path,width)in enumerate(rows):
   src=Image.open(out/Path(path).name).convert('RGB');box=(0,0,320,600)if width==320 else(35,293,876,790);part=ImageOps.contain(src.crop(box),(496,320));x=(i%4)*500+(500-part.width)//2;y=(i//4)*350+26;im.paste(part,(x,y));draw.text(((i%4)*500+4,(i//4)*350+5),key,fill='black');layout.append({'sheet':name,'source':Path(path).name,'case':key,'crop':box})
  im.save(b/name)
 for ident in sorted({r['id']for r in d['cases']}):
  rows=[(f'{ident} {r["width"]} {r["view"]} b{r["boundary"]}',r['screenshot'],r['width'])for r in d['cases']if r['id']==ident and'boundary'in r];sheet('boundary-'+ident+'.png',rows)
 for ident in sorted({r['id']for r in d['clockObservations']}):
  rows=[(f'{ident} {r["width"]} {r["view"]} t{x["time"]}',x['image'],r['width'])for r in d['clockObservations']if r['id']==ident for x in r['observations']];sheet('clock-'+ident+'.png',rows)
 (b/'supplementary-contact-layout.json').write_text(json.dumps(layout,indent=2)+'\n')
