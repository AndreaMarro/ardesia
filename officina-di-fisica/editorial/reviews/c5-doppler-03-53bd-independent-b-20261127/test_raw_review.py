from pathlib import Path
import json,hashlib,unittest,re
from decimal import Decimal
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());H=lambda b:hashlib.sha256(b).hexdigest()
class RawReview(unittest.TestCase):
 def setUp(self):self.report=J(D/'raw/report.json');self.cases=[J(D/'raw'/r['file'])for r in self.report['cases']]
 def test_all_case_and_png_hashes(self):
  for e,c in zip(self.report['cases'],self.cases):
   self.assertEqual(H((D/'raw'/e['file']).read_bytes()),e['sha256'])
   for s in c['screenshots']:self.assertEqual(H((D/'raw'/s['file']).read_bytes()),s['sha256'])
 def test_actual_terminal_and_plan(self):
  self.assertEqual(J(D/'terminal.json')['observedExitCode'],0);self.assertFalse(J(D/'terminal.json')['timeoutTriggered'])
  self.assertEqual(set(J(D/'prepared.json')['expectedCaseKeys']),{c['caseKey']for c in self.cases});self.assertEqual(len(self.cases),64)
 def test_exact_consumer_scope(self):
  self.assertEqual(self.report['runtimeFingerprint']['sha256'],'53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a')
  for c in self.cases:self.assertEqual(c['id'],'SIM-C5-L05-03');self.assertEqual(c['variant'],'draft')
 def test_eight_profiles_and_required_clock_states(self):
  profiles={(c['profile']['width'],c['profile']['view'])for c in self.cases};self.assertEqual(len(profiles),8)
  for w,v in profiles:
   clocks=[c for c in self.cases if c['profile']['width']==w and c['profile']['view']==v and c.get('interaction',{}).get('kind')=='clock'];self.assertEqual({(c['requestedX'],c['requestedTime'])for c in clocks},{(-20,5),(-20,15),(40,20)})
 def test_sixteen_actual_manual_replies(self):
  setup=[c for c in self.cases if c['caseKey'].endswith('setup')];self.assertEqual(sum(len(c['questions'])for c in setup),16)
  for c in setup:
   for q in c['questions']:self.assertEqual(q['actualPrompt'],q['prompt']);self.assertTrue(q['status'].startswith('Corretto.'))
 def test_fallback_head_is_contained_in_shaft_negative(self):
  failures=[c for c in self.cases if c['profile']['fallback']and c.get('requestedX')==-20];self.assertEqual(len(failures),6)
  for c in failures:
   svg=c['svg'];path=re.search(r'<path d="M([^\"]+)" fill="none" stroke="#b94f48" stroke-width="([\d.]+)"',svg);self.assertIsNotNone(path);head=re.search(r'<polygon points="([^\"]+)" fill="#b94f48"',svg);self.assertIsNotNone(head)
   pts=[tuple(map(Decimal,p.split(',')))for p in head[1].split()];headWidth=max(y for x,y in pts)-min(y for x,y in pts);self.assertLess(headWidth,Decimal(path[2]));self.assertEqual(headWidth,Decimal('2.4064'))
 def test_legend_omits_pressure_arrow_negative(self):
  samples=[c for c in self.cases if 'legend'in c];self.assertEqual(len(samples),56)
  for c in samples:self.assertNotIn('pression',c['legend'].lower());self.assertIn('Punto viola',c['legend'])
 def test_no_sampling_extends_to_published_or_other_ID(self):
  self.assertTrue(all(c['variant']=='draft'and c['id']=='SIM-C5-L05-03'for c in self.cases));self.assertEqual(self.report['errors'],[])
if __name__=='__main__':unittest.main()
