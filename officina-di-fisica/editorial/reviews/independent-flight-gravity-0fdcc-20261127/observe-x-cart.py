from pathlib import Path
import struct,zlib,gzip,json
def rgb_png(path):
 data=Path(path).read_bytes()
 if data[:8]!=b"\x89PNG\r\n\x1a\n":raise ValueError("Not original PNG")
 offset=8;payload=[];header=None
 while offset<len(data):
  size=struct.unpack(">I",data[offset:offset+4])[0];kind=data[offset+4:offset+8];chunk=data[offset+8:offset+8+size];crc=struct.unpack(">I",data[offset+8+size:offset+12+size])[0]
  if zlib.crc32(kind+chunk)&0xffffffff!=crc:raise ValueError("PNG CRC differs")
  if kind==b"IHDR":header=struct.unpack(">IIBBBBB",chunk)
  if kind==b"IDAT":payload.append(chunk)
  offset+=12+size
  if kind==b"IEND":break
 if header is None or header[2:]!=(8,2,0,0,0):raise ValueError("Requires original noninterlaced8bitRGB Chrome PNG")
 width,height=header[:2];raw=zlib.decompress(b"".join(payload));stride=width*3
 if len(raw)!=(stride+1)*height:raise ValueError("PNG row data differs")
 rows=[];prior=bytearray(stride)
 for y in range(height):
  start=y*(stride+1);f=raw[start];row=bytearray(raw[start+1:start+1+stride])
  if f not in range(5):raise ValueError("Unknown PNG filter")
  for i in range(stride):
   a=row[i-3]if i>=3 else 0;b=prior[i];c=prior[i-3]if i>=3 else 0
   if f==1:predict=a
   elif f==2:predict=b
   elif f==3:predict=(a+b)//2
   elif f==4:
    p=a+b-c;pa,pb,pc=abs(p-a),abs(p-b),abs(p-c);predict=a if pa<=pb and pa<=pc else b if pb<=pc else c
   else:predict=0
   row[i]=(row[i]+predict)&255
  rows.append(row);prior=row
 return width,height,rows

BASE=Path(__file__).resolve().parent

def observe(base=BASE,ui_root=Path('/private/tmp/cric-flight-gravity0fdcc-canary70')):
 base=Path(base);ui=json.loads((ui_root/'report.json').read_bytes());geometry=json.loads(gzip.decompress((base/'actual-full-glyph-geometry.json.gz').read_bytes()));results=[]
 for width in[320,1280]:
  for phase in[2,3]:
   key=f'axis-x-risk69-stage{phase}-{width}-side';row=next(x for x in ui['records']if x['key']==key);world=next(x for x in geometry['results']if x['case']==key);vp=row['glyphViewport'];W,H=vp['width'],vp['height'];span=max(4.9,8.5/(W/H));factor=H/span;label=next(x for x in world['labels']if x['text']=='x');lx,ly,lz=label['position'];cx=vp['x']+W/2+lx*factor;cy=vp['y']+H/2-(ly-.9)*factor
   imageW,imageH,pixels=rgb_png(ui_root/(key+'.png'));points=[(x,y)for y in range(int(cy-19),int(cy+20))for x in range(int(cx-19),int(cx+20))if tuple(pixels[y][3*x:3*x+3])==(255,252,239)]
   rect=[min(x for x,y in points),min(y for x,y in points),max(x for x,y in points)+1,max(y for x,y in points)+1]
   def screen(point):return{'x':vp['x']+(1+point[0])*W/2,'y':vp['y']+(1-point[1])*H/2}
   core=[rect[0]+1,rect[1]+1,rect[2]-1,rect[3]-1]
   def inside(point,box=rect):return box[0]<=point['x']<box[2]and box[1]<=point['y']<box[3]
   cone=[p for p in world['samples']if p['kind']=='cone'];projections=[screen(p['projected'])for p in cone];tip=screen(next(p for p in cone if p['axial']==0)['projected']);bounds=[min(p['x']for p in projections),min(p['y']for p in projections),max(p['x']for p in projections),max(p['y']for p in projections)]
   results.append({'case':key,'actualParameters':row['actualParameters'],'requestedTime':row['requestedTime'],'actualPhase':row['actualPhase'],'measuredOpaquePixelEnvelope':rect,'conservativeOpaqueCore':core,'actualFloat32TipProjection':tip,'tipInsidePixelEnvelope':inside(tip),'tipInsideConservativeOpaqueCore':inside(tip,core),'coneProjectedBounds':bounds,'coneGeneratorSamples':len(cone),'coneSamplesInsidePixelEnvelope':sum(inside(p)for p in projections),'coneSamplesInsideConservativeOpaqueCore':sum(inside(p,core)for p in projections),'wholeConeProjectionInsidePixelEnvelope':all(inside(p)for p in projections),'actualAnnotationPolicy':world['materialPolicy']})
 return{'results':results,'method':'Actual original PNG opaque background bounds around source-projected xanchor. Orthographic projection of actual Float32 cone generators (all32end-ringvertices plus apex) bounds the convex cone projection. The integer pixel envelope is not an exact continuous sprite-quad boundary. Definitive tip-mask claims use its1pixel-eroded opaque core. At1280 the tip near the edge is not certified; only partial head masking is acquired. All cone projections in an integer envelope at320 do not certify every GPUraster pixel or3Dsolid containment. Original captures independently show lost head/tip at320. Counts are duplicate samples, not distinct UIcases.','activityCredit':0}
if __name__=='__main__':print(json.dumps(observe(),indent=2))
