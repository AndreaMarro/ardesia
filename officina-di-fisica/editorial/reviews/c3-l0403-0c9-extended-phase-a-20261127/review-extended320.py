from pathlib import Path
from fractions import Fraction as F
import importlib.util,json,hashlib,sys,copy,unittest
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP));D=Path(__file__).resolve().parent;G=D/'320'
helper=APP/'editorial/reviews/c3-l0403-0c9-current-temperature-peer-a-20261127/review-current.py';spec=importlib.util.spec_from_file_location('current_phase_distinct',helper);phase=importlib.util.module_from_spec(spec);spec.loader.exec_module(phase)
# Bind exact current source through the same immutable actual guard, leaving old globals untouched.
oldD=phase.D;phase.D=D
cases=phase.actual(320);phase.D=oldD
require=phase.require;cpu=phase.legacy.cpu
GRID=(0,1,2,19,28,36,54);TIMES=(F(1,8),F(1,4),1,F(19,2),18,27)
require(len(cases)==56,'Complete first56 required')
DISPLAY={F(-10):'-10',F(-35,4):'-8,75',F(-15,2):'-7,5',F(0):'0',F(300,7):'42,86'}
FINAL={0:'0',1:'0',2:'0',19:'50',28:'76,47',36:'100',54:'100'}
def physics(c):
 interaction=c['interaction'];index=interaction['index'];require(type(index)is int,'Typed state index')
 if interaction['kind']=='grid':q=GRID[index];t=F(0);want=dict(kind='grid',index=index,x=q)
 else:q=54;t=TIMES[index];want=dict(kind='clock',index=index,x=q,time=float(t))
 require(interaction==want,'Exact frozen planned interaction');cpu.roundoff_only(c['sourceReplayedX'],q);cpu.roundoff_only(c['sourceReplayedClockTime'],t);require(F(c['clockReadout'])==t,'Actual displayed clock')
 energy,mass,temp=phase.thermodynamic_state(q,t);final=cpu.primary.law(phase.ID,q);cpu.roundoff_only(c['model']['y'],final)
 require('Temperatura del campione'+DISPLAY[F(temp)]+' °C'in c['readings'],'Current temperature text differs from exact law');require('Massa fusa (a fine prova)'+FINAL[q]+' g'in c['readings']and'Massa già fusa'+str(mass)+' g'in c['readings'],'Final/current mass readings changed')
 f=float(mass)/100;liquid=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.87];solid=[e for e in c['elements']if e['kind']=='box'];thermo=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.047]
 require(len(liquid)==(1 if mass>0 else 0)and len(solid)==(1 if mass<100 else 0)and len(thermo)==1,'Missing or persistent phase at endpoint')
 for got,v in zip(thermo[0]['b'],[F(7,5),F(22,25)+F(13,500)*temp,0],strict=True):cpu.roundoff_only(got,v)
 if liquid:
  for got,v in zip(liquid[0]['b'],[0,.16+.99*f,0],strict=True):cpu.roundoff_only(got,v)
 if solid:
  side=.95*(1-f)**(1/3)
  for got,v in zip(solid[0]['size'],[side]*3,strict=True):cpu.roundoff_only(got,v)
 return dict(caseKey=c['caseKey'],energyKJExact=str(energy),massGExact=str(mass),temperatureCExact=str(temp),physicalReview='POSITIVE_WITHIN_EXACT_BRANCH_ASSUMPTIONS')
rows=[physics(c)for c in cases if'interaction'in c];require(len(rows)==52,'Foursetup+52states')
findings=[];READ=[]
for c in cases:
 p=G/'actual'/c['screenshots'][0]['file'];image=dict(caseKey=c['caseKey'],profile=c['profile'],path=str(p.relative_to(APP)),sha256=hashlib.sha256(p.read_bytes()).hexdigest());READ.append(image)
 for glyph in c.get('nativeGlyphs',[]):
  if glyph['tipInsideOpaqueLabel']:
   findings.append(dict(caseKey=c['caseKey'],profile=c['profile'],selectedEnergyKJ=c['sourceReplayedX'],time=c['sourceReplayedClockTime'],opaqueLabels=glyph['tipInsideOpaqueLabel'],tipPixels=glyph['tipPixels'],fullProjectedMeshBounds=glyph['vertexViewportBounds'],readPngSha256=image['sha256'],rawFile=next(e['file']for e in json.loads((G/'actual/report.json').read_bytes())['cases']if e['caseKey']==c['caseKey']),finding='PRIMARY_ENERGY_ARROW_TIP_MASKED_BY_PHASE_LABEL',visualRaster='CONFIRMED_IN_WHOLE_NATIVE_IMAGE'))
require(len(findings)==9,'Exact observed nine native tip mask witnesses')
result=dict(id=phase.ID,sourceCommit=phase.SOURCE,runtimeSha256=phase.RUNTIME,candidateCommit=phase.CANDIDATE,actualCases=56,readRasterCases=56,physicalStateChecks=52,physicalStates=rows,mathematicalReview='POSITIVE_IN_READ_FROZEN_MODEL',visualReview='FAIL_OPEN_PHASE_LABEL_ARROW_MASK',nativeFindings=findings,fallbackContact='At same9.5/18/27 instants primary red arrow overlaps Liquido text; fallback is plain text/ink, not certified opaque sprite masking',readFiles=READ,secondWidth1280='NOT_RUN_SUSPENDED_BY_ROOT',activityCredit=0,humanApproval='NOT_RUN')
(D/'independent-extended320-review.json').write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
class Boundary(unittest.TestCase):
 def test_all_exact_states(self):self.assertEqual(len(rows),52)
 def test_nine_mask_witnesses(self):self.assertEqual({x['profile']['view']for x in findings},{'orbit','side','top'});self.assertEqual({x['time']for x in findings},{9.5,18,27})
 def test_wrong_temperature_and_mass_rejected(self):
  base=next(c for c in cases if c.get('interaction')==dict(kind='clock',index=5,x=54,time=27))
  for key in ['readout','model','phase']:
   c=copy.deepcopy(base)
   if key=='readout':c['readings']=c['readings'].replace('42,86','0')
   elif key=='model':c['model']['y']=50
   else:c['elements'].append(dict(kind='box',size=[1,1,1]))
   with self.assertRaises(ValueError):physics(c)
 def test_no_automatic_credit(self):self.assertEqual(result['activityCredit'],0);self.assertEqual(result['visualReview'],'FAIL_OPEN_PHASE_LABEL_ARROW_MASK');self.assertEqual(result['secondWidth1280'],'NOT_RUN_SUSPENDED_BY_ROOT')
 def test_explicit_input_predictions(self):
  p=json.loads((G/'prepared.json').read_bytes());self.assertEqual(p['records'][0]['sourcePrediction'],2);self.assertEqual(p['records'][0]['record']['assessmentSelection']['points'],[19,28])
r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Boundary));raise SystemExit(not r.wasSuccessful())
