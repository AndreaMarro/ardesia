"""Per-width independent current-temperature peer; never mutate historical verifier globals."""
from pathlib import Path
from fractions import Fraction as F
from types import FunctionType,SimpleNamespace
import copy,hashlib,json,sys,unittest
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c3_draft_bounded_browser_review_a as legacy
D=Path(__file__).resolve().parent;ID='SIM-C3-L04-03';SOURCE='a57cb90252bd9cee71b754ca68f5921efae0f900';RUNTIME='0c9d80d28945a62b6e125dd97f55b08de1ac17eabd75e5ff86e05b0a17e0c576';CANDIDATE='0867e0fae8f1556e2a74a91ff7e198de4ee9ccdf';PIN='663fa627184358c24bd1766b13c352d2a8bc06355197c5c2d814824bcdaf038d'
def require(ok,text):
 if not ok:raise ValueError(text)
def actual(width):
 pins={**legacy.cpu.REVIEWED_PINS,ID:PIN};cpu=SimpleNamespace(**vars(legacy.cpu));cpu.SOURCE=SOURCE;cpu.RUNTIME=RUNTIME;cpu.CANDIDATE=CANDIDATE;cpu.REVIEWED_PINS=pins
 f=FunctionType(legacy.actual.__code__,{**legacy.actual.__globals__,'cpu':cpu},'actual_current_0c9',legacy.actual.__defaults__)
 return f(D/str(width),ID)
def thermodynamic_state(q,t):
 q=legacy.cpu.primary.exact(q);t=legacy.cpu.primary.exact(t)
 require(0<=q<=54 and 0<=t<=27,'Exact legal energy/time required')
 energy=min(q,2*t);mass=legacy.cpu.primary.law(ID,energy)
 temperature=-10+5*energy if energy<2 else 0 if energy<=36 else (energy-36)*F(50,21)
 return energy,mass,temperature
DISPLAY={F(-10):'-10',F(-35,4):'-8,75',F(-15,2):'-7,5',F(-25,4):'-6,25'}
def verify(c):
 state=c['interaction'];i=state['index'];require(type(i)is int,'Exact interaction index')
 t=F(0)if state['kind']=='grid'else(F(1,8),F(1,4),F(3,8))[i]
 require(state==(dict(kind='grid',index=0,x=1)if state['kind']=='grid'else dict(kind='clock',index=i,x=1,time=float(t))),'Frozen tiny-energy plan')
 legacy.cpu.roundoff_only(c['sourceReplayedX'],1);legacy.cpu.roundoff_only(c['sourceReplayedClockTime'],t)
 require(F(c['clockReadout'])==t,'Observed requested clock')
 energy,mass,temp=thermodynamic_state(1,t);rods=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.047];require(len(rods)==1,'Thermometer missing')
 for got,want in zip(rods[0]['b'],[F(7,5),F(22,25)+F(13,500)*temp,0],strict=True):legacy.cpu.roundoff_only(got,want)
 require('Temperatura del campione'+DISPLAY[F(temp)]+' °C'in c['readings'],'Current numeric temperature not synchronized with exact current energy')
 require('Massa fusa (a fine prova)0 g'in c['readings']and'Massa già fusa0 g'in c['readings'],'Final/current mass distinction lost')
 arrows=[e for e in c['elements']if e['kind']=='arrow'];require(len(arrows)==(1 if energy>0 else 0),'Only nonzero detail retained')
 if arrows:
  arrow=arrows[0];tip=(-1.71-.85)+128*((-1.71+.85*float(energy)/54)-(-1.71));require(arrow.get('dettaglio')is True and arrow['a']==[-2.56,2.35,1.05]and arrow['b']==[tip,2.35,1.05],'Exact staged128x detail changed')
  require('128 volte'in c['legend']and'in ocra'in c['legend'],'Actual scale legend')
 return dict(caseKey=c['caseKey'],currentEnergyKJExact=str(energy),currentMassGExact=str(mass),currentTemperatureCExact=str(temp),readings=c['readings'],thermometerTipY=rods[0]['b'][1],consistency='PASS_WITHIN_OBSERVED_STATE')
if __name__=='__main__':
 width=int(sys.argv[1]);cases=actual(width);rows=[verify(c)for c in cases if'interaction'in c];require(len(cases)==20 and len(rows)==16,'Complete single20 canary tranche')
 result=dict(id=ID,width=width,sourceCommit=SOURCE,runtimeSha256=RUNTIME,candidateCommit=CANDIDATE,candidateSha256=PIN,cases=20,setup=4,states=rows,scope='ACTUAL_CANARY_MATH_AND_DOM_ONLY_RASTER_REVIEW_SEPARATE',activityCredit=0,humanApproval='NOT_RUN');(D/str(width)/'independent-current-review.json').write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
 class Boundaries(unittest.TestCase):
  def test_current_states(self):self.assertEqual(len(rows),16)
  def test_previous_final_readout_rejected(self):
   c=copy.deepcopy(next(c for c in cases if c.get('interaction',{}).get('kind')=='clock'));c['readings']=c['readings'].replace('-8,75 °C','-5 °C')
   with self.assertRaises(ValueError):verify(c)
  def test_exact_transitions_and_water(self):
   for energy,temp,mass in [(0,-10,0),(2,0,0),(19,0,50),(36,0,100),(43,F(50,3),100),(54,F(300,7),100)]:
    e,m,T=thermodynamic_state(energy,F(27));self.assertEqual((e,m,T),(energy,mass,temp))
   self.assertEqual(thermodynamic_state(54,1)[1:],(0,0));self.assertEqual(thermodynamic_state(54,18)[1:],(100,0))
  def test_invalid_domain(self):
   for q,t in [(True,0),(1,.125),(55,1),(1,-1),(1,float('inf'))]:
    with self.assertRaises(ValueError):thermodynamic_state(q,t)
  def test_legacy_globals_preserved(self):
   self.assertNotEqual(legacy.cpu.RUNTIME,RUNTIME);self.assertEqual(legacy.cpu.REVIEWED_PINS[ID],'be490f8a7639097f1c52cf5645274c05d33cb5e6d2cef879ccec762959f836d6')
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Boundaries));raise SystemExit(not r.wasSuccessful())
