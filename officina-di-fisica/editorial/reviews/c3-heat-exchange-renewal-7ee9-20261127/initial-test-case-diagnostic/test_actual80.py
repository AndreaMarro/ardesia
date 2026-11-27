from pathlib import Path
import json,hashlib,unittest
F=Path(__file__).resolve().parent;D=F/'convection-radiation-80';A=D/'actual';plan=json.loads((D/'prepared.json').read_bytes());report=json.loads((A/'report.json').read_bytes());terminal=json.loads((D/'actual-terminal.json').read_bytes());rows={i['caseKey']:json.loads((A/i['file']).read_bytes())for i in report['cases']};old=F.parent/'c3-heat-exchange-bounded-ui-53bd-20261127/controls-112/actual';oldreport=json.loads((old/'report.json').read_bytes());oldrows={i['caseKey']:json.loads((old/i['file']).read_bytes())for i in oldreport['cases']};sha=lambda b:hashlib.sha256(b).hexdigest()
class Actual80Independent(unittest.TestCase):
 def test_real_terminal_complete80_and_privacy(self):
  self.assertEqual(terminal['exitCode'],0);self.assertFalse(terminal['timeoutTriggered']);self.assertEqual(len(rows),80);self.assertEqual(set(rows),set(plan['expectedCaseKeys']));self.assertTrue(all(r['technicalOk']for r in rows.values()));self.assertEqual(report['errors'],[]);self.assertEqual(report['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403');self.assertEqual(report['canonicalImport']['publishedCount'],991)
 def test_every_actual_byte_and_32_accepted_number_inputs(self):
  for index in report['cases']:
   raw=(A/index['file']).read_bytes();self.assertEqual(sha(raw),index['sha256'])
   for image in rows[index['caseKey']]['screenshots']:self.assertEqual(sha((A/image['file']).read_bytes()),image['sha256'])
  qs=[q for r in rows.values()for q in r.get('questions',[])];self.assertEqual(len(qs),32)
  for q in qs:self.assertTrue(q['status'].startswith('Corretto. '))
 def test_source_replay_model_and_all_nonlabel_primitives_equal_old_epoch(self):
  for key,row in rows.items():
   if 'sourceReplayedX'not in row:continue
   previous=oldrows[key];self.assertEqual(row['model'],previous['model']);self.assertEqual(row['sourceReplayedX'],previous['sourceReplayedX']);self.assertEqual(row['sourceReplayedClockTime'],previous['sourceReplayedClockTime']);self.assertEqual(row['elements'],[e for e in previous['elements']if not(e['kind']=='label'and e['text']in['Ritorno','Ambiente'])])
 def test_exact_old_confirmed_tips_have_no_old_masking_labels(self):
  for key,name in [('SIM-C3-L05-02|draft|320|side|grid|2','Ritorno'),('SIM-C3-L05-02|draft|1280|orbit|grid|3','Ritorno'),('SIM-C3-L05-03|draft|320|top|grid|3','Ambiente')]:
   row=rows[key];self.assertFalse(any(e['kind']=='label'and e['text']==name for e in row['elements']));self.assertIn('La freccia'if name=='Ritorno'else'L’ambiente',row['legend'])
 def test_remaining_tail_mask_is_distinct_from_apex(self):
  w=json.loads((D/'confirmed-system-tail-negative.json').read_bytes());b=w['opaqueLabel']['box'];p=w['tailSourceProjection'];self.assertLess(abs(p['x']-b['x']),b['w']/2);self.assertLess(abs(p['y']-b['y']),b['h']/2);self.assertGreater(w['projectedLeadingShaftPixelsUnderLabel'],4.9);self.assertFalse(w['glyph']['tipInsideOpaqueLabel']);self.assertEqual(sha((A/w['actualPNG']['file']).read_bytes()),w['actualPNG']['sha256'])
if __name__=='__main__':unittest.main(verbosity=2)
