"""Independent readout/geometry check of existing canonical collector artifacts.
No browser/ETL/registry mutation; raster reading remains separate evidence.
API verify_case(case, config) is parameterized by immutable consumer/record IDs.
"""
from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
import json,hashlib,re,collections
from .c2_continuity_exact_readout_b import expected_readout
D=Path(__file__).resolve().parent
H=lambda b:hashlib.sha256(b).hexdigest()
def load(path):return json.loads(path.read_text(),parse_float=Decimal)
def number(x):
 if type(x)not in [int,Decimal]:raise ValueError('Typed finite JSON number required')
 if type(x)is Decimal and not x.is_finite():raise ValueError('Nonfinite JSON number')
 return F(x)
def require(condition,message):
 if not condition:raise ValueError(message)
def fallback_head(svg,color):
 p=re.search(r'<path d="M([^\"]+)" fill="none" stroke="'+color+r'" stroke-width="([\d.]+)"',svg)
 h=re.search(r'<polygon points="([^\"]+)" fill="'+color+r'"',svg)
 require(p is not None and h is not None,'Missing SVG velocity shaft/head')
 ends=re.fullmatch(r'([\-\d.eE]+) ([\-\d.eE]+) L([\-\d.eE]+) ([\-\d.eE]+)',p[1]);require(ends is not None,'Unexpected shaft path')
 a,b=tuple(map(F,ends.groups()[:2])),tuple(map(F,ends.groups()[2:]));pts=[tuple(map(F,s.split(',')))for s in h[1].split()]
 require(len(pts)==3 and pts[0]==b,'Head tip must coincide with physical shaft end')
 across=max(y for x,y in pts)-min(y for x,y in pts);stroke=F(p[2]);require(across>stroke,'Head contained in shaft')
 require(b[0]>a[0]and b[1]==a[1]and all(p[0]<b[0]for p in pts[1:]),'Velocity head must point downstream')
 return {'headTransverseWidth':str(across),'shaftStroke':str(stroke),'tail':list(map(str,a)),'tip':list(map(str,b))}
def projected_tracer_tests(case):
 camera=case.get('sourceDerivedCamera');require(camera is not None,'Native camera metadata required')
 n=[number(camera['matrixWorld'][i])for i in[8,9,10]];n2=sum(v*v for v in n);require(n2>0,'Invalid camera basis')
 result=[]
 for arrow in[e for e in case['elements']if e['kind']=='arrow']:
  tip=list(map(number,arrow['b']))
  for ball in[e for e in case['elements']if e['kind']=='ball'and e.get('alpha',1)==1]:
   off=[number(a)-b for a,b in zip(ball['p'],tip)];dot=sum(a*b for a,b in zip(off,n));length2=sum(a*a for a in off);r2=number(ball['r'])**2;perp2=length2-dot*dot/n2
   overlap=perp2<r2;forward=dot>0 and overlap
   result.append({'arrowColor':hex(arrow['c']),'ballColor':hex(ball['c']),'tip':list(map(str,tip)),'ballCenter':list(map(str,ball['p'])),'projectedOverlap':overlap,'ballInFront':dot>0,'rayOcclusion':forward,'rayDot':str(dot),'projectedDistanceSquared':str(perp2),'ballRadiusSquared':str(r2)})
 return result

def verify_case(case,config):
 """Return exact instrument facts; throws ValueError for any failed invariant.
 Config identity is frozen separately by Root; accepting this return grants no UI credit.
 """
 require(case.get('id')==config['id'],'Wrong activity ID');require(case.get('sourceCommit')==config['sourceCommit'],'Wrong consumer commit');require(case.get('runtimeSha256')==config['runtimeSha256'],'Stale runtime');require(case.get('sourceSha256')==config['sourceSha256'],'Wrong source identity');require(case.get('technicalOk')is True,'Producer technical failure')
 variant=case.get('variant');require(variant in['draft','published'],'Wrong edition');require(case.get('candidateSha256')==(config['candidateSha256']if variant=='draft'else None),'Wrong draft identity')
 profile=case['profile'];require(type(profile['width'])is int and profile['width']in[320,1280],'Wrong width');require(profile['view']in['orbit','side','top','fixed_projection'],'Wrong view');require(type(profile['fallback'])is bool and profile['fallback']==(profile['view']=='fixed_projection'),'Wrong renderer profile')
 if case['caseKey'].endswith('setup'):
  require(len(case['questions'])==2,'Two manual replies required')
  require([q['input']for q in case['questions']]==['24','28'],'Wrong manual entries')
  for q in case['questions']:require(q['actualPrompt']==q['prompt']and q['status'].startswith('Corretto.'),'Manual reply not actually observed correct')
  return {'caseKey':case['caseKey'],'kind':'setup','manualReplies':2}
 interaction=case.get('interaction');require(type(interaction)is dict,'Missing interaction')
 x=number(case['requestedX']);t=number(case['requestedTime'])if case['requestedTime']is not None else F(0)
 if interaction['kind']=='grid':require(x in[0,1,6,7,12]and t==0,'Outside frozen grid')
 elif interaction['kind']=='clock':require((x,t)in[(0,6),(1,3),(7,3),(12,6)],'Outside frozen clock matrix')
 else:raise ValueError('Unknown interaction')
 want=expected_readout(x,t);require(number(case['model']['y'])==want['Q_mL_s'],'Wrong volumetric flow');require(number(case['model']['x'])==x,'Wrong solved input');require(number(case['sourceReplayedX'])==x and number(case['sourceReplayedClockTime'])==t,'Replayed input/clock differs')
 require('Portata volumetrica'+str(want['Q_mL_s'])+' mL/s'in case['readings'],'Wrong actual flow readout');require('Distanza alla velocità media'+str(want['distance_cm'])+' cm'in case['readings'],'Wrong actual distance readout')
 arrows=[e for e in case['elements']if e['kind']=='arrow'];require(len(arrows)==(0 if x==0 else 2),'Wrong zero/directional-arrow semantics')
 for arrow in arrows:
  require(arrow['c']in[1341817,7557296],'Wrong velocity color');require(number(arrow['b'][0])>number(arrow['a'][0]),'Wrong flow direction');require(arrow.get('dettaglio')is True,'Visible head detail missing');require(number(arrow['a'][2])==F(2,5)and number(arrow['b'][2])==F(2,5),'Velocity depth changed')
 require('spostate di lato'in case['legend']and'Il verso e la scala'in case['legend'],'Missing physical offset legend')
 facts={'caseKey':case['caseKey'],'kind':interaction['kind'],'inputCmS':str(x),'timeS':str(t),'exactQmLS':str(want['Q_mL_s']),'exactDistanceCm':str(want['distance_cm']),'derivedIntegratedVolumeMl':str(want['volume_mL']),'integratedVolumeIsDerivedNotDOM':True}
 if profile['fallback']and x>0:facts['fallbackHeads']={c:fallback_head(case['svg'],c)for c in['#147979','#7350b0']}
 elif not profile['fallback']:
  rays=projected_tracer_tests(case);require(not any(r['rayOcclusion']for r in rays),'Opaque tracer in front of tip');facts['projectedTracerTests']=rays
 return facts

def verify_dataset(folder=D):
 config=load(folder/'verifier-input.json');index=load(folder/'verified-raw-index.json');require(H((folder/'verification-plan-before-current-raw.json').read_bytes())==config['planSha256'],'Frozen plan changed');require(len(index['cases'])==160,'Incomplete dataset');keys=[];rows=[]
 for group in index['groups']:
  root=folder/'raw'/group['group'];report=load(root/'actual/report.json');terminal=load(root/'terminal.json');require(type(terminal['observedExitCode'])is int and terminal['observedExitCode']==0 and terminal['timeoutTriggered']is False,'Nonfinal producer terminal');require(H((root/'actual/report.json').read_bytes())==group['rawReportSha256'],'Report bytes changed');require(H((root/'prepared.json').read_bytes())==report['preparedSha256'],'Prepared identity changed');require(report['errors']==[],'Producer errors');require(set(load(root/'prepared.json')['expectedCaseKeys'])=={r['caseKey']for r in report['cases']},'Planned case coverage differs')
 for item in index['cases']:
  path=folder/item['caseFile'];require(H(path.read_bytes())==item['caseSha256'],'Raw case bytes changed');case=load(path);keys.append(case['caseKey'])
  for shot in case['screenshots']:require(H((folder/'raw'/item['group']/'actual'/shot['file']).read_bytes())==shot['sha256'],'Raw PNG bytes changed')
  rows.append(verify_case(case,config))
 require(len(set(keys))==160,'Repeated case key');profiles=collections.Counter('|'.join(k.split('|')[1:4])for k in keys);require(len(profiles)==16 and all(n==10 for n in profiles.values()),'Profile coverage incomplete');require(sum(r.get('manualReplies',0)for r in rows)==32,'Manual reply coverage incomplete')
 return {'phase':'INDEPENDENT_EXACT_INSTRUMENT_AND_TRACER_CHECK','id':config['id'],'sourceCommit':config['sourceCommit'],'runtimeSha256':config['runtimeSha256'],'caseCount':160,'strictArithmeticInteractions':144,'manualReplies':32,'rows':rows,'rasterReadingIsSeparate':'Pinned reader receipt,66wholePNG/10sheets+12criticaldirect, not inferred from geometry screen.','newChrome':'NOT_RUN','activityCredit':0}

if __name__=='__main__':
 result=verify_dataset();(D/'independent-current-raw-arithmetic-geometry.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'cases':result['caseCount'],'arithmetic':result['strictArithmeticInteractions'],'manualReplies':result['manualReplies'],'projectedTipOcclusions':sum(q['rayOcclusion']for r in result['rows']for q in r.get('projectedTracerTests',[]))}))
