import pathlib,json,hashlib,math,unittest
D=pathlib.Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
class WorkObservation(unittest.TestCase):
 def setUp(self):self.rows=load(D/'selected-index.json')
 def cases(self):return [(x,load(D/x['file'])) for x in self.rows]
 def test_actual_epoch_and_per_case_identity(self):
  t=load(D/'terminal-receipt.json');r=load(D/'report.json');self.assertEqual(t['observedExitCode'],0);self.assertEqual(sha((D/'report.json').read_bytes()),'a20523cec5f7cf6b38ce251c4d9498958ea1062f123fbe81fd9d29457ec3fa40');self.assertEqual(t['runtimeSha256'],'0818bc9e4051c7533a27688f784c46fa283928209f37b80870086fa4b20dc440');self.assertEqual(len(self.rows),40)
  for x,c in self.cases():
   self.assertEqual(sha((D/x['file']).read_bytes()),x['sha256']);self.assertTrue(c['technicalOk']);self.assertEqual(c['sourceSha256'],'f85003b40a9ad21a9aebb9d5568a2bbc15664d957dddf4dd47473d4e9182ad5c')
   for s in c['screenshots']:self.assertEqual(sha((D/s['file']).read_bytes()),s['sha256'])
 def test_forty_actual_images_explicitly_read(self):
  log=load(D/'raster-read-log.json');self.assertEqual(log['pending'],[])
  self.assertEqual({s['sha256']for x in self.rows for s in x['screenshots']},{x['imageSha256']for x in log['actuallyOpened']})
 def test_all_grid_states_have_x_without_y_overlay(self):
  n=0
  for x,c in self.cases():
   if 'elements'not in c:continue
   self.assertEqual([e['text']for e in c['elements']if e['kind']=='label'],['x']);self.assertIn('in una vista 3D di taglio può apparire come un punto',c['legend']);n+=1
  self.assertEqual(n,32)
 def test_zero_work_does_not_remove_nonzero_vectors_and_signs(self):
  for x,c in self.cases():
   if 'elements'not in c:continue
   angle=c['sourceReplayedX'];arrows=[e for e in c['elements']if e['kind']=='arrow'];self.assertEqual(len(arrows),2)
   for e in arrows:self.assertGreater(math.dist(e['a'],e['b']),0)
   y=c['model']['y'];self.assertTrue(math.isfinite(y))
   if angle==90:self.assertEqual(y,0)
   elif angle==0:self.assertEqual(y,12)
   elif angle==180:self.assertEqual(y,-12)
   elif angle==120:self.assertLess(y,0);self.assertIn('Lavoro della forza-6',c['readings'])
   else:self.fail('Unplanned angle')
if __name__=='__main__':unittest.main(verbosity=2)
