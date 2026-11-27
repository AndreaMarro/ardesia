from pathlib import Path
import json
from PIL import Image,ImageOps,ImageDraw
b=Path(__file__).resolve().parent;r=json.loads((b/'actual-ui-16/consumer.json').read_bytes());layout=[]
for width in[320,1280]:
 rows=[x for x in r['cases']if x['width']==width];im=Image.new('RGB',(2000,1400),'#ddd');d=ImageDraw.Draw(im)
 for i,row in enumerate(rows):
  src=Image.open(b/'actual-ui-16'/row['image']).convert('RGB');part=ImageOps.contain(src,(490,650));x=(i%4)*500+(500-part.width)//2;y=(i//4)*700+30;im.paste(part,(x,y));d.text(((i%4)*500+4,(i//4)*700+7),f'{width} {row["view"]} h={row["h"]}',fill='black');layout.append({'sheet':f'contact-{width}.png','source':row['image'],'view':row['view'],'h':row['h'],'entireElementPreserved':True})
 im.save(b/f'contact-{width}.png')
(b/'contact-layout.json').write_text(json.dumps(layout,indent=2)+'\n')
