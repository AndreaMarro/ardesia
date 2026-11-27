from pathlib import Path
import json
from PIL import Image,ImageOps,ImageDraw
base=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica/editorial/reviews/renewal-bench-fields-optics-036-20964-20261127');out=base/'actual-ui-148';report=json.loads((out/'consumer.json').read_bytes());views=['orbit','side','top','diagram'];images=[]
for ident in sorted({r['id']for r in report['cases']}):
 sheet=Image.new('RGB',(2000,1320),'#ddd');draw=ImageDraw.Draw(sheet);panels=[]
 for row in[r for r in report['cases']if r['id']==ident and 'boundary'not in r]:
  col=views.index(row['view']);line=0 if row['width']==320 else 1;original=Image.open(out/Path(row['screenshot']).name).convert('RGB');crop=(0,0,320,650)if row['width']==320 else(35,293,876,790);image=ImageOps.contain(original.crop(crop),(496,620));x=col*500+(500-image.width)//2;y=line*660+30;sheet.paste(image,(x,y));draw.text((col*500+8,line*660+8),f'{ident} {row["width"]} {row["view"]}',fill='black');panels.append({'source':Path(row['screenshot']).name,'crop':crop,'case':[ident,row['width'],row['view']]})
 name='contact-'+ident+'.png';sheet.save(base/name);images.append({'file':name,'panels':panels,'purpose':'Review-only original PNG crops, not replacement evidence.'})
(base/'contact-sheet-layout.json').write_text(json.dumps(images,indent=2)+'\n')
