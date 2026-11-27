from pathlib import Path
import unittest,json,xml.etree.ElementTree as E,hashlib,math
F=Path(__file__).parent
class ActualFallbackNegative(unittest.TestCase):
 def test_actual_two_painter_order_and_covered_disk_witnesses(self):
  for width in[320,1280]:
   r=json.loads((F/f'negative-steel-{width}-fallback-t30.json').read_bytes());es=list(E.fromstring(r['svg']));circles=[(i,e)for i,e in enumerate(es)if e.tag.endswith('circle')and e.attrib.get('fill')=='#7350b0'];self.assertEqual(len(circles),1);ci,c=circles[0];cx,cy,radius=[float(c.attrib[k])for k in['cx','cy','r']];polygons=[(i,e)for i,e in enumerate(es)if e.tag.endswith('polygon')and e.attrib.get('fill')=='#726d81'];pi,p=polygons[-1];pts=[[float(v)for v in pair.split(',')]for pair in p.attrib['points'].split()];loX,hiX=min(v[0]for v in pts),max(v[0]for v in pts);loY,hiY=min(v[1]for v in pts),max(v[1]for v in pts);self.assertGreater(pi,ci);self.assertLess(loX,cx-radius);self.assertLess(loY,cy-radius);self.assertGreater(hiY,cy+radius);a=(hiX-cx)/radius;self.assertTrue(-1<a<1);covered=.5+(math.asin(a)+a*math.sqrt(1-a*a))/math.pi;self.assertGreater(covered,.63);self.assertLess(covered,.64)
 def test_two_actual_negative_png_bytes(self):
  for name in['6ea5120c2dbd863c1ddbac873ee0108b16b4d02a2a9f56746f805b761d7aa19a','0171f6b33fc1674dfb368176ad134ddf2d897b745c17fbc932dec1c72bfc1746']:self.assertEqual(hashlib.sha256((F/(name+'.png')).read_bytes()).hexdigest(),name)
 def test_distinct_technical_terminal_and_visual_failure(self):
  j=json.loads((F/'independent-judgment.json').read_bytes());self.assertEqual(j['sourceProducerTerminal']['observedExitCode'],0);self.assertEqual(j['boundedVisualDecision'],'FAIL_RESIDUAL_AT_RECEIVER_FALLBACK_T30');self.assertFalse(j['overallActivityAcceptance']);self.assertEqual(j['DopplerL05_03'],'NOT_REVIEWED_BY_THIS_REPORT')
if __name__=='__main__':unittest.main(verbosity=2)
