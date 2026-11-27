"""Measure the actual opaque sprite background in original PNG; never retouch the PNG."""
from pathlib import Path
import json
import struct,zlib

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

def observe(base=BASE):
 base=Path(base);d=json.loads((base/'flight-label-framing-geometry.json').read_bytes());results=[]
 for row in d['results']:
  width,height,pixels=rgb_png(base/'actual-ui-22'/(row['case']+'.png'));a=row['labelAnchor'];vp=row['viewport']
  x0=max(int(vp['x']),int(a['x']-80));x1=min(width,int(a['x']+80));y0=max(int(vp['y']),int(a['y']-30));y1=min(int(vp['y']+vp['height']),int(a['y']+45))
  pts=[(x,y)for y in range(y0,y1)for x in range(x0,x1)if tuple(pixels[y][x*3:x*3+3])==(255,252,239)]
  if not pts:raise ValueError('No actual opaque cart background')
  box=[min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts)+1,max(y for x,y in pts)+1]
  inside=lambda p:box[0]<=p['x']<box[2]and box[1]<=p['y']<box[3]
  result={'case':row['case'],'pngOpaqueCulmineRectangle':box,'actualCanvas':vp,'sourceSample':d['sample'],'vectors':[]}
  for vector in row['vectors']:
   vertices=vector['vertices'];tip=vector['tip']
   result['vectors'].append({'kind':vector['kind'],'sourceVisible':vector['visible'],'lengthFactor':vector['lengthFactor'],'tip':tip,'tipUnderMeasuredCartRectangle':inside(tip),'projectedVerticesInsideCart':sum(inside(v['projected'])for v in vertices),'outsideViewport':vector['outsideViewport'],'vertexCount':vector['vertexCount'],'xRange':[min(v['projected']['x']for v in vertices),max(v['projected']['x']for v in vertices)],'yRange':[min(v['projected']['y']for v in vertices),max(v['projected']['y']for v in vertices)]})
  results.append(result)
 return {'actualPngPixelColour':[255,252,239],'measurementMethod':'Bounds of opaque cart-background pixels in source-projected culmine neighbourhood, actual original PNG. No theoretical font box substituted. Counts include duplicated mesh vertices, not distinct observations.','results':results,'activityCredit':0}
if __name__=='__main__':print(json.dumps(observe(),indent=2))
