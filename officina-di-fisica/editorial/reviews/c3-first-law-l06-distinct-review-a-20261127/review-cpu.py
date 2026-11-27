from pathlib import Path
import copy,hashlib,json,sys,unittest
from decimal import Decimal
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c3_first_law_l06_primary_models_a as m
D=Path(__file__).resolve().parent
MODEL_SHA='48ac8b6244cb13b09d52836c89d8dd747f6964b51fa54e193f9dfab647f15bda'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def require(ok,message):
 if not ok:raise ValueError(message)
pkg=json.loads((D/'candidate.verbatim.json').read_bytes());bindings=json.loads((D/'bindings.verbatim.json').read_bytes())
originals={r['id']:r for r in json.loads((APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/original-source.verbatim.json').read_bytes())if r['id']in m.IDS}
PINS={'SIM-C3-L06-01': '987bd8a2cdc841187b5d408f6253ee2a9368986af9799bc65c0acd0292067524', 'SIM-C3-L06-02': '2b01180a530de7284204eff0877637b517b6849cca0264fb337e318b0e5f0104', 'SIM-C3-L06-03': '30897565781c4f915f3fca86122e35e43b75fa29af21fa6195494ca66f7b32ca', 'SIM-C3-L06-04': 'f25406a7835eb509eb5ab0c0adbed906bec2b869ae35edd5968139b20c0f8217'}
# This initial pin table is frozen with the report after complete manual candidate reading, never used as the mathematical oracle.
POINTS={m.IDS[0]:[30,-5],m.IDS[1]:[20,-10],m.IDS[2]:[20,-20],m.IDS[3]:[Decimal('1.5'),Decimal('-0.75')]}
ANSWERS={m.IDS[0]:[20,-15],m.IDS[1]:[240,-120],m.IDS[2]:[30,-10],m.IDS[3]:[150,-75]}
raw=(D/'actual-consumer-observations.json').read_bytes();obs=json.loads(raw,parse_float=Decimal)
def candidate_guard(p,b):
 require(sha((APP/'tools/corpus_engineering/c3_first_law_l06_primary_models_a.py').read_bytes())==MODEL_SHA,'Frozen pre-key model dependency')
 require(p['schema']=='astra/1'and p['assets']==[]and len(p['records'])==len(b)==4,'Four scoped assetless records')
 for r,link in zip(p['records'],b,strict=True):
  identifier=r['id'];require(identifier in m.IDS and sha(canonical(r))==PINS[identifier],'New text/selection/key requires new reading')
  source=originals[identifier];require(type(r['version'])is int and type(r['baseVersion'])is int and r['baseVersion']==source['version']and r['version']==source['version']+1,'Consecutive exact edition')
  for k in ['id','kind','course','section','order','skill','title','topic','summary','control','measure','apparatus','references']:
   require(r.get(k)==source.get(k),'Stable original field changed: '+k)
  require(link['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d'and link['sourceSha256']==sha(canonical(source))and link['candidateSha256']==sha(canonical(r))and link['assetChecksums']=={},'Canonical source/record binding')
  require(r['prerequisites']==['C3-L06'],'Actual lesson mapping')
 return True
def math_guard(node):
 require(node['sourceCommit']=='1b72b71a68a6023ab1c9fa189733947b03029914'and node['runtimeSha256']=='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'and node['candidateCommit']=='270d212b4f45151a8dc010a192a65fb13acfa24b','Explicit unchanged acquisition epoch')
 require({r['id']for r in node['rows']}==set(m.IDS),'All four independent IDs')
 for r in node['rows']:
  identifier=r['id'];require(len(r['assessment'])==2 and r['clock']is None,'Two actual compiled tasks, no manufactured clock')
  for j,q in enumerate(r['assessment']):
   require(m.exact(q['value'])==ANSWERS[identifier][j]==m.law(identifier,POINTS[identifier][j])and q['unit']=='J','Compiled actual task disagrees with independent exact result')
  for state in r['states']:
   require(m.exact(state['model']['x'])==m.exact(state['x'])and m.exact(state['model']['y'])==m.law(identifier,state['x']),'Actual consumer state differs from exact law')
 return True
candidate_guard(pkg,bindings);math_guard(obs)
manual={m.IDS[0]:'Gas system, closed boundary; Q in and W by gas, W10J. Actual30→20 and−5→−15; inverse and zero independently derived.',m.IDS[1]:'Fixed ideal gas with constant nCv12J/K. Actual20→240 and−10→−120; increments in K, no absolute-temperature claim; fixed piston means zero volume work.',m.IDS[2]:'Fixed ΔU10J. ActualW20→Q30 andW−20→Q−10; negative heat exits while compression work enters. Alternative10−W fails the first law.',m.IDS[3]:'Quasistatic100kPa isobar. ActualΔV1.5→150 and−.75→−75J; kPa L=J; oriented integral differs from unsigned geometric area.'}
result=dict(schemaVersion='1.0.0',candidateCommit='270d212b4f45151a8dc010a192a65fb13acfa24b',primaryCommit='9f3ae65969819f6476a812a120aba1c2bb9da625',primaryModelSha256=MODEL_SHA,sourceCommit=obs['sourceCommit'],runtimeSha256=obs['runtimeSha256'],rawConsumerObservationSha256=sha(raw),scope='INDEPENDENT_CPU_AND_MANUAL_ONLY',records=[dict(id=i,candidateSha256=PINS[i],sourceSha256=sha(canonical(originals[i])),compiledTaskAnswersExact=list(map(str,ANSWERS[i])),manual=manual[i],mathematicalReview='POSITIVE_WITHIN_FROZEN_MODEL',draftTextReview='READ_COMPLETE_NO_MATHEMATICAL_FINDING',geometry='NOT_YET_VISUALLY_REVIEWED',browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')for i in m.IDS],potentialPresentationRisk='L06-04 has one long combined integral/unit-conversion TeX block; test actual320 before any UI finding or approval. L06-03 combined formula also requires actual fit check.',browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
(D/'independent-cpu-review.json').write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
class Boundary(unittest.TestCase):
 def test_actual_four(self):self.assertTrue(math_guard(obs));self.assertTrue(candidate_guard(pkg,bindings))
 def test_eight_wrong_answers(self):
  for i in range(4):
   for j in range(2):
    n=copy.deepcopy(obs);n['rows'][i]['assessment'][j]['value']+=1
    with self.assertRaises(ValueError):math_guard(n)
 def test_bad_state_sign_in_each_family(self):
  for i in range(4):
   n=copy.deepcopy(obs);n['rows'][i]['states'][0]['model']['y']=-n['rows'][i]['states'][0]['model']['y']
   with self.assertRaises(ValueError):math_guard(n)
 def test_retokenized_text_key_source_or_edition_rejected(self):
  for field,value in [('title','changed'),('version',3),('baseVersion',0),('formula','wrong'),('assessmentSelection',dict(schemaVersion='1.0.0',points=[0,0]))]:
   p=copy.deepcopy(pkg);b=copy.deepcopy(bindings);p['records'][0][field]=value;b[0]['candidateSha256']=sha(canonical(p['records'][0]))
   with self.assertRaises(ValueError):candidate_guard(p,b)
 def test_finite_exact_invalid_observed_result_rejected(self):
  for v in [True,float('inf'),Decimal('NaN'),'20',20.0]:
   n=copy.deepcopy(obs);n['rows'][0]['assessment'][0]['value']=v
   with self.assertRaises(ValueError):math_guard(n)
 def test_inverse_and_pv_counterexamples(self):
  self.assertEqual(m.inverse(m.IDS[0],-15),-5);self.assertEqual(m.inverse(m.IDS[1],-120),-10);self.assertEqual(m.inverse(m.IDS[2],-10),-20);self.assertEqual(m.inverse(m.IDS[3],-75),-s.Rational(3,4))
import sympy as s
r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Boundary));raise SystemExit(not r.wasSuccessful())
