"""Independent diagnostic: a successful acquisition does not close a scientific UI finding."""
from pathlib import Path
from fractions import Fraction
import copy,hashlib,json,sys,unittest
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c3_l0401_53bd_browser_a as boundary
D=Path(__file__).resolve().parent;ID='SIM-C3-L04-03';actual,_=boundary.bind()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,message):
 if not ok:raise ValueError(message)
def instantaneous(q,t):
 q=boundary.legacy.cpu.primary.exact(q);t=boundary.legacy.cpu.primary.exact(t)
 require(0<=q<=54 and 0<=t<=27,'Finite exact legal energy/time required')
 e=min(q,2*t)
 require(e<=2,'This diagnostic derives only the initial solid warming branch')
 return e,-10+5*e

def state(c):
 i=c['interaction'];k=i['kind'];index=i['index'];require(type(index)is int,'Typed index')
 t=Fraction(0)if k=='grid'else(Fraction(1,8),Fraction(1,4),Fraction(3,8))[index]
 require(i==dict(kind='grid',index=0,x=1)if k=='grid'else i==dict(kind='clock',index=index,x=1,time=float(t)),'Exact requested interaction')
 boundary.legacy.cpu.roundoff_only(c['sourceReplayedX'],1);boundary.legacy.cpu.roundoff_only(c['sourceReplayedClockTime'],t)
 require(Fraction(c['clockReadout'])==t,'Actual clock differs')
 energy,temp=instantaneous(1,t)
 rods=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.047];require(len(rods)==1,'Actual thermometer required')
 require(rods[0]['a']==[1.4,.38,0],'Thermometer datum moved')
 for got,want in zip(rods[0]['b'],[Fraction(7,5),Fraction(22,25)+Fraction(13,500)*temp,0],strict=True):boundary.legacy.cpu.roundoff_only(got,want)
 arrows=[e for e in c['elements']if e['kind']=='arrow'];require(len(arrows)==(1 if energy>0 else 0),'Only nonzero detail should remain at this tiny energy')
 if arrows:
  a=arrows[0];require(a.get('dettaglio')is True and a['a']==[-2.56,2.35,1.05],'Actual detail origin/identity')
  length=Fraction(272,135)*energy
  # Preserve binary arithmetic stages: tiny delta subtraction precedes the 128x detail. No tolerance expansion.
  primary_tip=-1.71+(0.85*float(energy))/54
  actual_stage_tip=(-1.71-0.85)+128*(primary_tip-(-1.71))
  require(a['b']==[actual_stage_tip,2.35,1.05],'Exact staged detail endpoint changed')
  require('128 volte'in c['legend']and'in ocra'in c['legend'],'Actual scale/colour legend required')
  if not c['profile']['fallback']:
   require(len(c['nativeGlyphs'])==1,'Actual retained native detail mesh required')
   g=c['nativeGlyphs'][0];require(len(g['parts'])==2 and not g['tipInsideOpaqueLabel'],'Shaft/cone or tip lost')
   b=g['vertexViewportBounds'];require(0<=b['minX']<=b['maxX']<=c['canvas']['width']and 0<=b['minY']<=b['maxY']<=c['canvas']['height'],'Full projected detail outside observed canvas')
 # A failing consistency oracle is recorded below; this guard preserves exactly what the old runtime did.
 require('Temperatura del campione-5 °C'in c['readings'],'Frozen observed final-temperature readout changed')
 return dict(caseKey=c['caseKey'],profile=c['profile'],timeExact=str(t),currentEnergyKJExact=str(energy),currentTemperatureCExact=str(temp),displayedTemperatureCExact='-5',thermometerTipY=rods[0]['b'][1],readoutQualifiedAsFinal=False,consistency='FAIL',detailVisibleWithinReadRaster=True,rawSha256=sha(D/str(c['profile']['width'])/'actual/cases'/next(e['file'].split('/')[-1]for e in REPORTS[c['profile']['width']]['cases']if e['caseKey']==c['caseKey'])),readPngSha256=[p['sha256']for p in c['screenshots']])

REPORTS={w:json.loads((D/str(w)/'actual/report.json').read_bytes())for w in(320,1280)}
GROUPS={w:actual(D/str(w),ID)for w in(320,1280)}
CASES=[c for g in GROUPS.values()for c in g];require(len(CASES)==40,'Forty actual cases required')
FINDINGS=[state(c)for c in CASES if'interaction'in c]
READ=[]
for c in CASES:
 image=c['screenshots'][0];p=D/str(c['profile']['width'])/'actual'/image['file']
 READ.append(dict(caseKey=c['caseKey'],width=c['profile']['width'],view=c['profile']['view'],path=str(p.relative_to(APP)),sha256=sha(p),scope='Whole original raster read, pasted without crop/resize in indexed page'))
result=dict(schemaVersion='1.0.0',id=ID,sourceCommit=boundary.SOURCE,runtimeSha256=boundary.RUNTIME,candidateCommit='6ae3c2a177bcde74b2bebf8f22c1fa50850b0413',acquisitionStatus='TWO_REAL_UNDISTURBED_TERMINALS_0',caseCount=40,readRasterCases=40,profiles=8,detailArrowReview='POSITIVE_WITHIN_THREE_INSTANTS_READ_AT_EIGHT_PROFILES',scientificUIReview='FAIL_CURRENT_THERMOMETER_VS_UNQUALIFIED_FINAL_TEMPERATURE',findingStatus='OPEN_AUTHOR_CORRECTION_REQUIRED',full112='NOT_RUN_SUSPENDED_AFTER_CANARY_FINDING',limits='No arbitrary-camera/GPU occlusion assertion; Top is axial and cannot quantify thermometer height. Mesh source replay is distinct from raster observation. Original edition not newly replayed.',findings=FINDINGS,readFiles=READ,activityCredit=0,humanApproval='NOT_RUN')
(D/'independent-canary-review.json').write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
class Adversarial(unittest.TestCase):
 def test_all_actual_states_and_profiles(self):
  self.assertEqual(len(FINDINGS),32);self.assertEqual(len({(x['profile']['width'],x['profile']['view'])for x in FINDINGS}),8)
 def test_exact_temperatures(self):
  self.assertEqual([instantaneous(1,t)[1]for t in[0,Fraction(1,8),Fraction(1,4),Fraction(3,8)]],[-10,Fraction(-35,4),Fraction(-15,2),Fraction(-25,4)])
 def test_known_ui_contradiction_is_not_approved(self):
  for f in FINDINGS:self.assertNotEqual(Fraction(f['currentTemperatureCExact']),Fraction(f['displayedTemperatureCExact']))
  self.assertEqual(result['activityCredit'],0);self.assertEqual(result['scientificUIReview'],'FAIL_CURRENT_THERMOMETER_VS_UNQUALIFIED_FINAL_TEMPERATURE')
 def test_wrong_branch_and_invalid_inputs_rejected(self):
  for q,t in[(3,2),(-1,0),(True,0),(1,0.125),(1,float('inf')),(1,-1)]:
   with self.assertRaises(ValueError):instantaneous(q,t)
 def test_detail_scale_endpoint_and_temperature_mutations_rejected(self):
  base=next(c for c in CASES if c.get('interaction',{}).get('kind')=='clock'and c['profile']['view']=='side')
  for field in('detail','thermometer','legend'):
   c=copy.deepcopy(base)
   if field=='detail':next(e for e in c['elements']if e['kind']=='arrow')['b'][0]+=.1
   elif field=='thermometer':next(e for e in c['elements']if e['kind']=='rod'and e.get('r')==.047)['b'][1]=.75
   else:c['legend']=c['legend'].replace('128 volte','64 volte')
   with self.assertRaises(ValueError):state(c)
 def test_zero_has_no_false_heat_arrow(self):
  for c in CASES:
   if c.get('interaction',{}).get('kind')=='grid':self.assertFalse(any(e['kind']=='arrow'for e in c['elements']))
 def test_current_and_final_temperature_distinction(self):
  self.assertEqual(instantaneous(1,Fraction(1,2))[1],-5)
  for t in(Fraction(1,8),Fraction(1,4),Fraction(3,8)):self.assertNotEqual(instantaneous(1,t)[1],-5)
run=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Adversarial));raise SystemExit(not run.wasSuccessful())
