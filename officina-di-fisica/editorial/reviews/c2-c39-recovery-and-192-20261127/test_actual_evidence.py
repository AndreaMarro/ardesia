"""Evidence consistency and physical boundary tests; no author modules imported."""
from pathlib import Path
import unittest,json,hashlib
F=Path(__file__).parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(name):
 d=F/name;p=json.loads((d/'prepared.json').read_bytes());r=json.loads((d/'actual/report.json').read_bytes());rows=[]
 for i in map(json.loads,(d/'actual/completed-cases.jsonl').read_text().splitlines()):
  raw=(d/'actual'/i['file']).read_bytes();assert sha(raw)==i['sha256'];row=json.loads(raw)
  for s in row['screenshots']:assert sha((d/'actual'/s['file']).read_bytes())==s['sha256']
  rows.append(row)
 return p,r,rows
class ActualC2Evidence(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.groups=[load(n)for n in['bernoulli-120','continuity-32','branches-40']]
 def test_complete_unique_actual_case_identity_and_all_leaf_bytes(self):
  self.assertEqual([len(g[2])for g in self.groups],[120,32,40]);keys=[]
  for p,r,rows in self.groups:
   self.assertEqual({x['caseKey']for x in rows},set(p['expectedCaseKeys']));self.assertTrue(all(x['technicalOk']for x in rows));self.assertEqual(r['errors'],[]);keys.extend(x['caseKey']for x in rows)
  self.assertEqual(len(keys),len(set(keys)))
 def test_real_terminal_and_immutable_runtime_source(self):
  for name,(p,r,rows)in zip(['bernoulli-120','continuity-32','branches-40'],self.groups):
   terminal=json.loads((F/name/'actual-terminal.json').read_bytes());self.assertEqual(terminal['exitCode'],0);self.assertFalse(terminal['timeoutTriggered']);self.assertEqual(terminal['fingerprintBefore'],p['runtimeFingerprint']['sha256']);self.assertEqual(r['runtimeFingerprint'],p['runtimeFingerprint']);self.assertEqual(r['sourceCommit'],'cbf7792f872caf575d58acd28cc7ace1ada14169')
 def test_actual_manual_entries_all_96_accepted_and_prompts_bound(self):
  questions=[q for _,_,rows in self.groups for row in rows for q in row.get('questions',[])];self.assertEqual(len(questions),96)
  for q in questions:self.assertTrue(q['status'].startswith('Corretto. '));self.assertEqual(q['actualPrompt'],q['prompt'])
 def test_equal_area_equal_speed_and_column_boundary(self):
  rows=self.groups[0][2];selected=[r for r in rows if r['id']=='SIM-C2-L006-03'and r.get('requestedX')==1];self.assertEqual(len(selected),8)
  for r in selected:
   self.assertEqual(r['model']['y'],2);columns=[e for e in r['elements']if e['kind']=='rod'and e.get('r')==.062];self.assertEqual(len(columns),2);self.assertEqual(columns[0]['b'][1],columns[1]['b'][1])
 def test_branch_zero_is_absence_not_minimum_and_assigned_law(self):
  rows=self.groups[2][2]
  for r in rows:
   if 'requestedX'not in r:continue
   x=r['requestedX'];self.assertEqual(r['model']['y'],12-x);arrows=[e for e in r['elements']if e['kind']=='arrow'];colors={e['c']for e in arrows}
   self.assertIn(13931314,colors)
   if x==0:self.assertEqual(colors,{13931314,1341817})
   elif x==12:self.assertEqual(colors,{13931314,7557296})
   else:self.assertEqual(len(arrows),3)
if __name__=='__main__':unittest.main(verbosity=2)
