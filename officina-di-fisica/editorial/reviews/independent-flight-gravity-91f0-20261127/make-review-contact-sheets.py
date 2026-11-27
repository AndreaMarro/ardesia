from pathlib import Path
import json
from PIL import Image,ImageOps,ImageDraw
base=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica/editorial/reviews/independent-flight-gravity-91f0-20261127');out=Path('/private/tmp/cric-flight-gravity91f-canary48');r=json.loads((out/'report.json').read_bytes());layout=[]
for view in ['orbit','side','top','diagram']:
 rows=[x for x in r['records']if x['view']==view];sheet=Image.new('RGB',(2100,730),'#ddd');draw=ImageDraw.Draw(sheet);panels=[]
 for width in [320,1280]:
  subset=[x for x in rows if x['width']==width]
  for col,row in enumerate(subset):
   vp=row['glyphViewport'];box=(int(vp['x']),int(vp['y']),int(vp['x']+vp['width']+1),int(vp['y']+vp['height']+1));image=ImageOps.contain(Image.open(out/row['png']).convert('RGB').crop(box),(346,330));x=col*350+(350-image.width)//2;y=(0 if width==320 else 365)+30;sheet.paste(image,(x,y));draw.text((col*350+4,y-24),row['key'],fill='black');panels.append({'case':row['key'],'original':row['png'],'crop':box})
 name='contact-'+view+'.png';sheet.save(base/name);layout.append({'file':name,'panels':panels,'purpose':'Inspection crops only; all original PNG unchanged.'})
(base/'contact-sheet-layout.json').write_text(json.dumps(layout,indent=2)+'\n')
