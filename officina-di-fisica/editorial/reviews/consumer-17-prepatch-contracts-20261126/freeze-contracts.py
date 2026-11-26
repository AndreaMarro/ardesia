"""Freeze existing1a evidence and future test conditions; no fresh model/UI run."""
from pathlib import Path
from fractions import Fraction
import hashlib,json,subprocess,sys,fcntl,shutil
BASE=Path(__file__).resolve().parent;APP=BASE.parents[2];sys.path.insert(0,str(APP));sys.dont_write_bytecode=True
from tests.corpus.consumer_glyph_contract import arrow_geometry
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,x):
 raw=(json.dumps(x,sort_keys=True,ensure_ascii=False,indent=2)+'\n').encode();p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_bytes()==raw,('Frozen drift',p)
 else:p.write_bytes(raw)
 return sha(raw)
def main():
 assert shutil.disk_usage(APP).free>=2*1024**3
 invp=APP/'editorial/reviews/partial-experiments-139-archive-followup-20261125/inventory.json';inv=json.loads(invp.read_bytes())
 issues={r['id']:r for r in inv['records']if r['consumerCodeGeometryFailure']or r['consumerObservedUiFailure']};assert len(issues)==17
 contractp=APP/'editorial/reviews/experiment-corrections-author-worklist-20261125/worklist.json';contracts={r['id']:r for r in json.loads(contractp.read_bytes())['records']}
 legacy='editorial/reviews/experiments-pressure-hydrostatics-047-originals-frozen-1a35-20261125/editorial/reviews/experiments-pressure-hydrostatics-047-1a35-20261125/actual-runtime.json'
 data={};pins={str(invp.relative_to(APP)):sha(invp.read_bytes()),str(contractp.relative_to(APP)):sha(contractp.read_bytes())}
 for file in sorted((APP/'editorial/reviews').glob('*-installed-code-1a35-20261125.json')):
  doc=json.loads(file.read_bytes())
  for r in doc.get('records',[]):
   if r.get('id')in issues:
    data[r['id']]=(r,str(file.relative_to(APP)));pins[str(file.relative_to(APP))]=sha(file.read_bytes())
 old=json.loads((APP/legacy).read_bytes());pins[legacy]=sha((APP/legacy).read_bytes())
 for key,r in old.items():
  if key in issues:data[key]=(r,legacy)
 assert set(data)==set(issues)
 summaries=[]
 for key,original in sorted(issues.items()):
  row,path=data[key];contexts=[]
  for ci,c in enumerate(row['cases']):
   entries=[(None,c)]+[(f.get('time'),f)for f in c.get('clockSamples',[])]
   for fi,(time,f)in enumerate(entries):
    elements=f.get('elements',[])
    contexts.append({'originalCaseIndex':ci,'originalFrameIndex':fi,'control':c['x'],'time':time,
     'physicalOutput':f.get('solve',f.get('output',c.get('solve',c.get('output')))),
     'readings':f.get('readings',[]),'sourceElements':elements,
     'completeNativeArrowGeometry':[{'sourceElementIndex':i,'color':e.get('c'),**arrow_geometry(e)}for i,e in enumerate(elements)if e['kind']=='arrow'],
     'opaqueAndTransparentPrimitives':[e for e in elements if e['kind']not in('arrow','label')],
     'labelAnchorsNotPixelBounds':[e for e in elements if e['kind']=='label'],
     'projectionVisibility':'NOT_RECOMPUTED; no acquired UI from code geometry'})
  c=contracts[key]
  fixture={'phase':'PREPATCH_FROZEN1A_NEGATIVE_AND_CONTROL_DATA_NOT_NEW_REVIEW','id':key,'runtimeSha256':RUNTIME,
   'sourceVersion':original['sourceVersion'],'sourceSha256':original['sourceSha256'],'sourceProof':path,'sourceProofSha256':pins[path],
   'acquiredFailureClass':'OBSERVED_UI'if original['consumerObservedUiFailure']else'CODE_GEOMETRY_ONLY',
   'negativeAndPositiveScope':c['frozenNegativeProfileAndLimits'],'physicalInvariant':c['physicalUnitSignAndScaleContract'],
   'requiredFullGlyphAndCameraReplay':c['positiveAndAdversarialReplayContract'],
   'originalFindingsPreserved':original['findingsAndLimits'],'oldCameraSpecOrDrawingSpec':row.get('spec'),
   'contexts':contexts,'newRuntimeAcceptance':False,'newUiCases':0,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  h=write(BASE/'fixtures'/(key+'.json'),fixture);summaries.append({'id':key,'path':str((BASE/'fixtures'/(key+'.json')).relative_to(APP)),'sha256':h,'contexts':len(contexts),'glyphs':sum(len(x['completeNativeArrowGeometry'])for x in contexts)})
 plans=[]
 for course in ('C2','C3','C4','C5','C6'):
  path='officina-di-fisica/content/esperienze-'+course+'.json';raw=subprocess.check_output(['git','show',inv['sourceRef']+':'+path],cwd=APP)
  for r in json.loads(raw):
   a=r['control'];lo,hi,step=[Fraction(str(a[k]))for k in ('min','max','step')]
   grid=[str(lo+i*step)for i in range(int((hi-lo)/step)+1)]
   plans.append({'id':r['id'],'version':r['version'],'controlGridExact':grid,'sourceRef':inv['sourceRef'],'sourcePath':path,
    'sourceRecordSha256':next(x['sourceSha256']for x in inv['records']if x['id']==r['id']),
    'clockReplay':'Reuse all frozen source clock samples with exact id/input/time keys, plus contact/turning/emission/reflection endpoints appropriate to each original clock; actual new-run frames required.',
    'manualQuestions':'Both ACTUAL producer questions; preserve original FAIL/gap. Applicable separately reviewed v2 must also be imported/owner-fetched and tested, never replace the historical original.'})
 assert len(plans)==139 and len({x['id']for x in plans})==139
 profiles=[{'width':w,'mode':mode,'camera':cam}for w in (320,1280)for mode,cams in [('native',('orbit','side','top')),('fallback',('fixed_projection',))]for cam in cams]
 plan={'phase':'FUTURE_REPLAY_PLAN_NOT_EXECUTED','profiles':profiles,'records':plans,
  'allLegalGridPoints':sum(len(x['controlGridExact'])for x in plans),'staticGridProfileFramesPlanned':sum(len(x['controlGridExact'])for x in plans)*len(profiles),
  'cameraBound':'Use actual supported orbit/side/top native presets at zoom1, target=spec.target and eye distance14; persist matrices and viewport. Fallback has fixed projection, not a fictional3Dcamera. Keyboard±0.12orbit probes at17negative/extreme states are supplemental named bounded views, not all-continuum proof.',
  'edgeOnRule':'Legitimate projection foreshortening is not occlusion; require explicit vector association plus alternate view. No arbitrary minimum vectors, opacity cheats, clipping or raised zeroepsilon.',
  'glyphRule':'Test tail cap, whole shaft, joint, cone base rim/facets and entire tip against all actual opaque/transparent materials and pixel label/layout overlays. Tip-outside alone is insufficient; circle-envelope intersection alone is not proof of native mesh occlusion.',
  'materialRule':'Record actual renderer depthTest/depthWrite/opacity/DoubleSide and primitive transforms. Do not infer visibility from one coordinate or hide objects to pass.',
  'globalInvalidation':'Any runtime change invalidates dependent current UI evidence, existing C1closures035/036/039/040/048/049/118/119/140 and registered package previews. Preserve historical epochs; use existing fingerprint/persistence/registry gates and real rerenders. No retag or new pipeline/ledger.',
  'acceptance':'Defaultdeny until a distinct author patch is read, exact laws/units/directions/zero/domains checked, new actual UI native/fallback evidence complete and independent reading recorded. These fixtures never close a finding.',
  'newUiCases':0,'newPasses':0,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 write(BASE/'replay-plan-139.json',plan)
 material=['static/js/banchi/scena.js','static/js/banchi/etichette.js','static/js/banchi/voci/geometria.js','static/js/banchi/tavola.js','static/vendor/three-r180/three.module.min.js']
 renderer_archives={}
 for p in material:
  raw=subprocess.check_output(['git','show','eb51d0e9bdc3f992e9ae0ae76810098376e2ab79:officina-di-fisica/'+p],cwd=APP)
  target=BASE/'renderer-1a-source'/p;target.parent.mkdir(parents=True,exist_ok=True)
  if target.exists():assert target.read_bytes()==raw
  else:target.write_bytes(raw)
  pins[p]=sha(raw);renderer_archives[p]=str(target.relative_to(APP))
 result={'phase':'INDEPENDENT_PREPATCH_ACCEPTANCE_CONDITIONS_NO_NEW_PASS','disclosure':'Prior139source/math/code and10historicalUI reviews already exposed. This reuses frozen1a evidence, not a fictitious fresh independent review or future patch approval.',
  'runtimeSha256':RUNTIME,'inputPins':pins,'rendererSourceArchives':renderer_archives,'rendererArchiveSourceCommit':'eb51d0e9bdc3f992e9ae0ae76810098376e2ab79','records':summaries,'recordCount':17,'observedUiFailures':5,'codeOnlyFailures':12,
  'geometryScope':'Full native arrow32facet reconstruction of archived draw commands; includes tails/shaft/caps/cone rims. No fresh model, camera, renderer or browser execution.',
  'originalFailuresRetained':True,'newPasses':0,'newUiCases':0,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 write(BASE/'conditions.json',result);print('records',17,'contexts',sum(x['contexts']for x in summaries),'glyphs',sum(x['glyphs']for x in summaries),'grid',plan['allLegalGridPoints'],'plannedframes',plan['staticGridProfileFramesPlanned'])
if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as l:
  fcntl.flock(l,fcntl.LOCK_EX);main()
