from pathlib import Path
import hashlib,json,math,re,unittest,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
def cases():
 r=load(D/'actual-browser/report.json');return[load(D/'actual-browser'/e['file'])for e in r['cases']]
def svgheads(svg,color):
 out=[]
 for parent in ET.fromstring(svg).iter():
  es=list(parent)
  for i,p in enumerate(es[:-1]):
   if p.tag.rsplit('}',1)[-1]!='path'or p.get('stroke')!=color or p.get('stroke-width')!='2.7':continue
   q=es[i+1]
   if q.tag.rsplit('}',1)[-1]!='polygon':continue
   a,b,c,d=map(float,re.findall(r'-?\d+(?:\.\d+)?',p.get('d')));L=math.hypot(c-a,d-b)
   pts=[tuple(map(float,v.split(',')))for v in q.get('points').split()]
   width=max(abs((x-c)*(d-b)-(y-d)*(c-a))/L for x,y in pts)
   out.append({'axisLength':L,'headHalfWidth':width,'headExposesOutsideShaft':width>1.35})
 return out
class ComposedFocus(unittest.TestCase):
 def test_actual_identity_and_explicit_image_read(self):
  r=load(D/'actual-browser/report.json');t=load(D/'actual-browser-terminal.json');log=load(D/'raster-read-log.json')
  self.assertEqual(t['observedExit'],0);self.assertIsNone(t['signal']);self.assertEqual(r['runtimeFingerprint']['sha256'],'91f08d7f0e253778ebf36d8c2241b644e7809ee43884ca9b87d8a854aba650cf');self.assertEqual(len(r['cases']),110)
  self.assertEqual(t['reportSha256'],sha((D/'actual-browser/report.json').read_bytes()));self.assertEqual(log['pending'],[])
  seen={x['imageSha256']for x in log['actuallyOpened']}
  expected=set()
  for e in r['cases']:
   b=(D/'actual-browser'/e['file']).read_bytes();self.assertEqual(sha(b),e['sha256']);c=json.loads(b);self.assertTrue(c['technicalOk']);s=c['imageSha256'];expected.add(s);self.assertEqual(sha((D/'actual-browser'/(s+'.png')).read_bytes()),s)
  self.assertEqual(seen,expected)
 def test_source_math_primary_geometry_and_exact_details(self):
  c=load(D/'actual-independent-comparison.json');self.assertEqual((len(c['records']),c['controls'],c['scenes'],c['details']),(7,133,303,38));self.assertTrue(c['comparisonC4C5ConsumerModulesIdenticalTo0184'])
  for row in c['records']:self.assertTrue(row['originalPrimitivesAndMathematicalOutputsIdentical'])
 def test_all_nonzero_focus_fallback_has_exposed_primary_or_declared_detail(self):
  colors={'SIM-C1-L006-03':'#147979','SIM-C1-L007-02':'#7350b0','SIM-C4-L01-02':'#7350b0','SIM-C5-L07-03':'#147979'}
  for c in cases():
   if not c['profile']['fallback']or c['id']not in colors:continue
   primary=svgheads(c['observed']['svg'],colors[c['id']]);detail=svgheads(c['observed']['svg'],'#d49332')
   if not primary:self.assertEqual(detail,[]);continue
   with self.subTest(key=c['key']):self.assertTrue(all(x['headExposesOutsideShaft']for x in primary)or bool(detail)and all(x['headExposesOutsideShaft']for x in detail)and'dettaglio'in c['legendText'].lower(),{'primary':primary,'detail':detail})
 def test_zeros_thresholds_detail_boundaries_and_legend(self):
  for c in cases():
   es=c['observed']['elements'];detail=[e for e in es if e.get('dettaglio')];x=c['observed'].get('sourceReplayedX',c['input'])
   if c['id']=='SIM-C1-L007-02':
    self.assertEqual(len(detail),1 if 0<x<.18*3/.65 else 0);self.assertIn('sei volte',c['legendText'])
    if x==0:self.assertEqual([e for e in es if e['kind']=='arrow'],[])
   elif c['id']=='SIM-C1-L006-03':self.assertEqual(len(detail),2 if .85/x**2<.18 else 0);self.assertIn('sei volte',c['legendText'])
   elif c['id']=='SIM-C4-L01-02':self.assertEqual(len(detail),2 if .62*((90/x**2)/60)<.16 else 0);self.assertIn('otto volte',c['legendText'])
   elif c['id']=='SIM-C5-L07-03':
    self.assertEqual(len(detail),1 if 14<x<=17 else 0);self.assertIn('quattro volte',c['legendText'])
    if x<=14:self.assertEqual([e for e in es if e['kind']=='arrow'],[])
 def test_remaining_native_label_mask_census(self):
  r=load(D/'actual-source-projected-label-census.json');self.assertEqual(r['verifiedCases'],110);self.assertEqual(r['wholeGlyphContainmentCandidates'],[]);self.assertEqual(r['headOrTipCandidates'],[])
if __name__=='__main__':unittest.main(verbosity=2)
