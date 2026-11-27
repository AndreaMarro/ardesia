from pathlib import Path
import json
from PIL import Image,ImageOps,ImageDraw
base=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica/editorial/reviews/independent-flight-gravity-0fdcc-20261127');out=Path('/private/tmp/cric-flight-gravity0fdcc-canary70');ui=json.loads((out/'report.json').read_bytes());layouts=[]
def sheet(name,groups,cols):
 image=Image.new('RGB',(cols*350,len(groups)*365),'#ddd');draw=ImageDraw.Draw(image);panels=[]
 for line,rows in enumerate(groups):
  for col,row in enumerate(rows):
   vp=row['glyphViewport'];box=(int(vp['x']),int(vp['y']),int(vp['x']+vp['width']+1),int(vp['y']+vp['height']+1));crop=ImageOps.contain(Image.open(out/row['png']).convert('RGB').crop(box),(346,330));x=col*350+(350-crop.width)//2;y=line*365+30;image.paste(crop,(x,y));draw.text((col*350+3,y-24),row['key'],fill='black');panels.append({'case':row['key'],'original':row['png'],'crop':box})
 image.save(base/name);layouts.append({'file':name,'panels':panels,'purpose':'Inspection crops only; all original PNG unchanged.'})
for view in['orbit','side','top','diagram']:
 groups=[[r for r in ui['records']if r['view']==view and r['width']==w and 'phase'not in r]for w in[320,1280]];sheet('contact-main-'+view+'.png',groups,6)
for view in['orbit','side','top']:
 groups=[[r for r in ui['records']if r['key'].startswith('stage2-')and r['view']==view and r['width']==w]for w in[320,1280]];sheet('contact-stage2-'+view+'.png',groups,3)
groups=[[r for r in ui['records']if r['key'].startswith('axis-x-risk')and r['actualPhase']==phase]for phase in[2,3]];sheet('contact-adversarial-x.png',groups,2)
(base/'contact-sheet-layout.json').write_text(json.dumps(layouts,indent=2)+'\n')
