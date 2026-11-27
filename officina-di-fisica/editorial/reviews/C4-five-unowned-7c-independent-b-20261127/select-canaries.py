from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw
D=Path(__file__).resolve().parent;rows=json.loads((D/'verified-case-index.json').read_text())['records'];ids=list(dict.fromkeys(r['id']for r in rows))
wide={i:{'all':[0,6],'four':[8]}for i in ids}
wide.update({'SIM-C4-L01-02':{'all':[6],'four':[1,2,3,4]},'SIM-C4-L02-01':{'all':[8],'four':[1,3,5]},'SIM-C4-L02-02':{'all':[1],'four':[-3,.5,1.5,3]},'SIM-C4-L03-01':{'all':[2],'four':[-2,-.5,.5,3]}})
selected=[]
for r in rows:
 p=r['profile'];m=r.get('model');id=r['id']
 if r['caseKey'].endswith('|setup'):
  take=p['view']=='top'
 else:
  x=m['x'];take=x in wide[id]['all']or(x in wide[id]['four']and p['view']in('top','fixed_projection'))
 if take:selected.append(r)
sheets=[]
for id in ids:
 groups=[]
 groups.append([r for r in selected if r['id']==id and r['caseKey'].endswith('|setup')])
 for width in [320,1280]:groups.append(sorted([r for r in selected if r['id']==id and not r['caseKey'].endswith('|setup')and r['profile']['width']==width],key=lambda r:(r['model']['x'],r['profile']['view'])))
 for g,group in enumerate(groups):
  batchsize=2 if g==0 else 6; cols=2 if g!=1 else 3
  for k in range(0,len(group),batchsize):
   batch=group[k:k+batchsize];cw=max(r['screenshots'][0]['size'][0]for r in batch);ch=max(r['screenshots'][0]['size'][1]for r in batch)+38
   im=Image.new('RGB',(cols*cw,((len(batch)+cols-1)//cols)*ch),'white');draw=ImageDraw.Draw(im);entries=[]
   for j,r in enumerate(batch):
    s=r['screenshots'][0];x=j%cols*cw;y=j//cols*ch
    im.paste(Image.open(D/s['path']).convert('RGB'),(x,y+38));draw.text((x+4,y+3),r['caseKey'].replace('SIM-C4-',''),fill='black');draw.text((x+4,y+18),str(r['model']or'setup'),fill='black');entries.append({'caseKey':r['caseKey'],'png':s['path'],'sha256':s['sha256']})
   name=f'{id}-group{g}-{k//batchsize}.png';p=D/'selected-sheets'/name;p.parent.mkdir(exist_ok=True);im.save(p);sheets.append({'file':'selected-sheets/'+name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'entries':entries,'read':False,'nativeFrameRescale':False,'cropping':False})
(D/'selected-canaries.json').write_text(json.dumps({'caseKeys':[r['caseKey']for r in selected],'count':len(selected),'sheets':sheets,'scope':'Selected raster canaries, not visual certification of every one of280 states'},indent=2)+'\n');print(json.dumps({'selected':len(selected),'sheets':len(sheets),'perId':{id:len([r for r in selected if r['id']==id])for id in ids}}))
