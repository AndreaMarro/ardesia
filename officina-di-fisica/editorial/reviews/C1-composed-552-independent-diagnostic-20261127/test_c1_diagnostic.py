import hashlib,json,math,pathlib,re,unittest,xml.etree.ElementTree as ET
D=pathlib.Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
class C1Diagnostic(unittest.TestCase):
 def setUp(self):self.rows=load(D/'selected-index.json')
 def cases(self,epoch='current'):
  return [(r,load(D/epoch/r['file'])) for r in self.rows if r['epoch']==epoch]
 def test_actual_terminal_and_all_selected_identity(self):
  t=load(D/'current-terminal-receipt.json');self.assertEqual(t['observedExitCode'],0);self.assertEqual(t['runtimeSha256'],'4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b')
  self.assertEqual(sha((D/'current-report.json').read_bytes()),t['reportSha256'])
  for r in self.rows:
   self.assertEqual(sha((D/r['epoch']/r['file']).read_bytes()),r['sha256'])
   for s in r['screenshots']:self.assertEqual(sha((D/r['epoch']/s['file']).read_bytes()),s['sha256'])
 def test_raster_read_is_explicit_and_covers_selected_images(self):
  log=load(D/'raster-read-log.json');self.assertEqual(log['pending'],[])
  expected={(r['epoch'],s['sha256']) for r in self.rows for s in r['screenshots']}
  self.assertEqual(expected,{(r['epoch'],r['imageSha256']) for r in log['actuallyOpened']})
 def test_four_id_before_after_nonlabel_invariants(self):
  current={r['key']:c for r,c in self.cases()}
  for r,old in self.cases('before'):
   c=current[r['key']];self.assertEqual(old['sourceSha256'],c['sourceSha256']);self.assertEqual(old['model'],c['model'])
   self.assertEqual([e for e in old['elements'] if e['kind']!='label'],[e for e in c['elements'] if e['kind']!='label'])
   if c['id']=='SIM-C1-L007-01':self.assertEqual(old['screenshots'],c['screenshots'])
 def test_physical_zeros_are_not_omissions(self):
  checked=0
  for r,c in self.cases():
   if c['id'] in ['SIM-C1-L007-02','SIM-C1-L007-03'] and c['sourceReplayedX']==0:
    self.assertEqual(c['model']['y'],0);self.assertEqual([e for e in c['elements'] if e['kind']=='arrow'],[]);checked+=1
   if c['id']=='SIM-C1-L007-01' and c['sourceReplayedX']==90:
    arrows=[e for e in c['elements'] if e['kind']=='arrow'];self.assertEqual(len(arrows),2)
    for e in arrows:self.assertGreater(math.dist(e['a'],e['b']),0)
  self.assertEqual(checked,8)
 def test_nonzero_fallback_direction_has_exposed_head(self):
  # Deliberately RED for current actual cases. Presence of a polygon is insufficient:
  # it must add visible shape outside the shaft or have a separately declared cue.
  for r,c in self.cases():
   if not c['profile']['fallback'] or c['id'] not in ['SIM-C1-L006-03','SIM-C1-L007-01','SIM-C1-L007-02','SIM-C1-L007-03']:continue
   es=list(ET.fromstring(c['svg']))
   for i,e in enumerate(es):
    if not e.tag.endswith('polygon') or not i or not es[i-1].tag.endswith('path'):continue
    p=es[i-1];ax,ay,bx,by=map(float,re.findall(r'-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?',p.attrib['d']));L=math.hypot(bx-ax,by-ay);half=float(p.attrib['stroke-width'])/2
    pts=[list(map(float,q.split(','))) for q in e.attrib['points'].split()]
    projection=[((px-ax)*(bx-ax)+(py-ay)*(by-ay))/L for px,py in pts]
    perpendicular=[abs((px-ax)*(by-ay)-(py-ay)*(bx-ax))/L for px,py in pts]
    buried=all(0<=v<=L+1e-8 for v in projection) and max(perpendicular)<=half
    with self.subTest(caseKey=r['key'],polygon=i):self.assertFalse(buried,{'axisLength':L,'headHalfWidth':max(perpendicular),'shaftHalfWidth':half})
if __name__=='__main__':unittest.main(verbosity=2)
