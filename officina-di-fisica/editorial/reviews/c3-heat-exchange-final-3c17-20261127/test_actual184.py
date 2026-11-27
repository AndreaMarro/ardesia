from pathlib import Path
from fractions import Fraction as Q
from decimal import Decimal,ROUND_HALF_UP
import json,hashlib,re,unittest
F=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();datasets={}
for name in ['controls-112','convection-clock-72']:
 d=F/name;a=d/'actual';p=json.loads((d/'prepared.json').read_bytes());report=json.loads((a/'report.json').read_bytes());rows={r['caseKey']:json.loads((a/r['file']).read_bytes())for r in report['cases']};datasets[name]=(d,a,p,report,rows)
def model(key,x):
 i=int(key[-2:]);x=Q(str(x));return 20/x if i==1 else 42*x if i==2 else Q(567,10**10)*(x**4-300**4)
def installed(key,x):return float(Q.from_float(5.67e-8)*(Q(str(x))**4-300**4))if key.endswith('03')else float(model(key,x))
def read_decimal(text,label,unit):
 m=re.search(re.escape(label)+r'([-−]?[0-9.,]+)\s'+re.escape(unit),text);assert m,(text,label,unit);return Decimal(m[1].replace(',','.').replace('−','-'))
def display4(value):
 d=Decimal(str(value));return d.quantize(Decimal(1).scaleb(d.adjusted()-3),rounding=ROUND_HALF_UP)if d else Decimal(0)
class ActualThermal184(unittest.TestCase):
 def test_all184_actual_records_complete_unique_per_slice_zero_exit(self):
  self.assertEqual(sum(len(v[4])for v in datasets.values()),184)
  for name,(d,a,p,r,rows)in datasets.items():
   t=json.loads((d/'actual-terminal.json').read_bytes());self.assertEqual(t['exitCode'],0);self.assertFalse(t['timeoutTriggered']);self.assertEqual(set(rows),set(p['expectedCaseKeys']));self.assertEqual(len(rows),len(r['cases']));self.assertTrue(all(q['technicalOk']for q in rows.values()));self.assertEqual(r['errors'],[]);self.assertEqual(r['runtimeFingerprint'],p['runtimeFingerprint']);self.assertEqual(r['runtimeFingerprint']['sha256'],'3c174677e6b7fc585903dbb6a5bc6b9fa078b435375f9333a6a81897f1027dc2')
 def test_all_case_raster_bytes_and_private_owner_import(self):
  for d,a,p,r,rows in datasets.values():
   self.assertEqual(r['preparedSha256'],sha((d/'prepared.json').read_bytes()));self.assertEqual(r['canonicalImport']['publishedCount'],991);self.assertEqual(r['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403');self.assertEqual(len(r['fullOwnerRecordIdentity']['records']),3)
   for i in r['cases']:
    self.assertEqual(sha((a/i['file']).read_bytes()),i['sha256'])
    for im in rows[i['caseKey']]['screenshots']:self.assertEqual(sha((a/im['file']).read_bytes()),im['sha256'])
 def test_sixtyfour_actual_number_submissions_match_independent_exact_answers(self):
  expected={'SIM-C3-L05-01':[Q(10),Q(5,2)],'SIM-C3-L05-02':[Q(84),Q(147)],'SIM-C3-L05-03':[Q(-7371,20),Q(3969,4)]};count=0
  for d,a,p,r,rows in datasets.values():
   for row in rows.values():
    if 'questions'not in row:continue
    self.assertEqual(row['axe'],[]);self.assertEqual(len(row['questions']),2)
    for actual,answer in zip(row['questions'],expected[row['id']],strict=True):self.assertEqual(Q(actual['input']),answer);self.assertTrue(actual['status'].startswith('Corretto. '));count+=1
  self.assertEqual(count,64)
 def test_neutral_grid_physics_and_separate_four_significant_digit_readout(self):
  for d,a,p,r,rows in datasets.values():
   for row in rows.values():
    if 'sourceReplayedX'not in row:continue
    value=installed(row['id'],row['sourceReplayedX']);self.assertEqual(row['model']['y'],value);entry=next(q for q in p['records']if q['id']==row['id']);self.assertEqual(read_decimal(row['readings'],entry['record']['measure']['label'],entry['record']['measure']['unit']),display4(value))
 def test_radiation_sign_zero_and_label_clearance_in_exact_old_failure(self):
  rows=datasets['controls-112'][4]
  for row in rows.values():
   if row['id']!='SIM-C3-L05-03'or'sourceReplayedX'not in row:continue
   x=row['sourceReplayedX'];arrows=[e for e in row['elements']if e['kind']=='arrow'];self.assertFalse(any(e['kind']=='label'and e['text']in['Sistema','Ambiente']for e in row['elements']))
   if x==300:self.assertEqual(arrows,[])
   else:
    self.assertEqual(len(arrows),3)
    for e in arrows:self.assertEqual((e['b'][0]>e['a'][0])-(e['b'][0]<e['a'][0]),(x>300)-(x<300))
  focus=rows['SIM-C3-L05-03|draft|320|top|grid|3'];self.assertEqual(focus['labels'],[]);self.assertEqual(len(focus['nativeGlyphs']),3)
 def test_clock_actual_dom_time_mass_and_repeatable_marked_loop_phase(self):
  rows=datasets['convection-clock-72'][4];states=[r for r in rows.values()if'sourceReplayedX'in r];self.assertEqual(len(states),64)
  for r in states:
   x=Q(str(r['sourceReplayedX']));t=Q(str(r['sourceReplayedClockTime']));self.assertEqual(Q(r['clockReadout']),t);self.assertEqual(read_decimal(r['readings'],'Massa passata alla sezione','g'),Decimal(str(float(x*t))));self.assertEqual(r['model']['y'],float(42*x))
  for profile in datasets['convection-clock-72'][2]['profiles']:
   group=[r for r in states if r['profile']==profile]
   marker=lambda kind,index:next(e for r in group if r['interaction']['kind']==kind and r['interaction']['index']==index for e in r['elements']if e['kind']=='ball')['p']
   self.assertEqual(marker('grid',0),marker('clock',1));self.assertEqual(marker('grid',0),marker('clock',2));self.assertEqual(marker('clock',0),marker('clock',5));self.assertNotEqual(marker('grid',0),marker('clock',0))
if __name__=='__main__':unittest.main(verbosity=2)
