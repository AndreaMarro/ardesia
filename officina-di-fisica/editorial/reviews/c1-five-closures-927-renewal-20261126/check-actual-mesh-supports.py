"""Exact supports of reconstructed Float32-buffer/CPU-world convex meshes.

This extends nominal-primitive certificates only to reconstructed source mesh
vertices/triangles. It does not assert GPU matrix-upload/shader arithmetic or
rasterization equivalence. All accepting comparisons are strict Fractions.
"""
from pathlib import Path
from fractions import Fraction as F
import json,hashlib,math,sys

def rat(x):return F.from_float(x)if isinstance(x,float)else F(x)
def v(xs):return tuple(map(rat,xs))
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def support(vertices,u,maximum):
    values=[dot(v(p),u)for p in vertices]
    return max(values)if maximum else min(values)
def analyze(folder,prior):
    folder=Path(folder);prior=Path(prior);receipt=json.loads((folder/'reconstruction-receipt.json').read_bytes());data=(folder/'actual-float32-meshes.jsonl').read_bytes()
    if hashlib.sha256(data).hexdigest()!=receipt['nativeMeshJsonlSha256']:raise ValueError('Reconstructed mesh bytes drift')
    old=json.loads((prior/'complete-convex-certificates.json').read_bytes());planes={(p['caseKey'],p['elementIndex'],p['partIndex']):p for p in old['parts']};results=[];unresolved=[];minimum=math.inf
    for line in data.splitlines():
        frame=json.loads(line);ray=v([frame['sourceDerivedCamera']['matrixWorld'][i]for i in [8,9,10]]);physical={m['elementIndex']:m for m in frame['physicalMeshes']}
        for glyph in frame['glyphs']:
            for index,part in enumerate(glyph['parts']):
                key=(frame['caseKey'],glyph['elementIndex'],index);oldplane=planes[key];checks=[]
                for cert in oldplane['certificates']:
                    u=tuple(F(s)for s in cert['exactPlaneNormal']);target=physical[cert['opaqueElementIndex']];gap=support(part['vertices'],u,False)-support(target['vertices'],u,True);direction=dot(u,ray);ok=gap>0 and direction>=0
                    normalized=float(gap)/math.sqrt(float(dot(u,u)));minimum=min(minimum,normalized)
                    checks.append({'opaqueElementIndex':cert['opaqueElementIndex'],'strictExactSupportGap':str(gap),'exactViewerDot':str(direction),'normalizedSupportGapWorldUnits':normalized,'ok':ok})
                    if not ok:unresolved.append({'caseKey':key[0],'elementIndex':key[1],'partIndex':key[2],**checks[-1]})
                # Actual reconstructed base and four feet, including their real
                # Float32 cylinder buffers, replace the nominal y=.006 bound.
                u=(F(0),F(1),F(0));minY=support(part['vertices'],u,False);base=[]
                for i,mesh in enumerate(frame['baseMeshes']):
                    gap=minY-support(mesh['vertices'],u,True);ok=gap>0 and ray[1]>=0;base.append({'actualBaseMeshIndex':i,'strictExactGap':str(gap),'ok':ok})
                    if not ok:unresolved.append({'caseKey':key[0],'elementIndex':key[1],'partIndex':key[2],'baseMeshIndex':i})
                results.append({'caseKey':key[0],'elementIndex':key[1],'partIndex':key[2],'sourcePositionBufferType':part['positionStorageType'],'actualBufferSha256':part['localBufferByteSha256'],'physicalMeshSupportChecks':checks,'actualBaseSupportChecks':base})
    if len(results)!=1332:raise ValueError('Incomplete exact source-mesh part set')
    return{'scope':'Strict exact separating supports of real production Float32 position buffers transformed with actual reconstructed Three CPU matrixWorld, for whole convex triangle meshes and ideal recorded orthographic rays. No GPU matrix-upload/shader arithmetic or rasterization guarantee. Nominal supersets are not asserted for the stored Float32 buffers.','sourceRuntimeSha256':receipt['sourceRuntime'],'sourceRecordedNativeStates':receipt['actualRecordedNativeStates'],'sourceMeshPartCount':len(results),'physicalSupportComparisonCount':sum(len(p['physicalMeshSupportChecks'])for p in results),'actualBaseSupportComparisonCount':sum(len(p['actualBaseSupportChecks'])for p in results),'minimumActualSourceMeshNormalizedSupportGapWorldUnits':minimum,'parts':results,'unresolved':unresolved,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':
    r=analyze(sys.argv[1],sys.argv[2]);Path(sys.argv[3]).write_text(json.dumps(r,separators=(',',':'))+'\n');print({k:r[k]for k in ['sourceMeshPartCount','physicalSupportComparisonCount','actualBaseSupportComparisonCount','minimumActualSourceMeshNormalizedSupportGapWorldUnits']},'unresolved',len(r['unresolved']))
