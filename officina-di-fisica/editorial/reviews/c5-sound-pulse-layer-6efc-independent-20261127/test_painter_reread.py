from pathlib import Path
import unittest,json,xml.etree.ElementTree as E
F=Path(__file__).parent
class RereadSound(unittest.TestCase):
 def test_new_four_endpoint_svg_markers_follow_both_opaque_objects(self):
  for width in[320,1280]:
   for index in[0,2]:
    r=json.loads((F/f'actual-producer-{width}-clock{index}.json').read_bytes());elements=list(E.fromstring(r['svg']));pulse=next(i for i,e in enumerate(elements)if e.tag.endswith('circle')and e.attrib.get('fill')=='#7350b0');source=next(i for i,e in enumerate(elements)if e.tag.endswith('circle')and e.attrib.get('fill')=='#d49332');rod=next(i for i,e in enumerate(elements)if e.tag.endswith('polygon')and e.attrib.get('fill')=='#726d81');self.assertGreater(pulse,source);self.assertGreater(pulse,rod)
 def test_all64_actual_control_and_quantity_pairs_and_camera(self):
  p=json.loads((F/'actual-parity-and-painter-order.json').read_bytes());self.assertEqual(len(p['comparisons64']),64);self.assertTrue(all(c['allSelectedPhysicalAndControlFieldsEqual']for c in p['comparisons64']));r=json.loads((F/'actual-raster-parity.json').read_bytes());self.assertTrue(r['cameraRendererCanvasAll64Equal']);self.assertEqual(len(r['sameCaseRasters']),50);self.assertEqual(len(r['changedCaseRasters']),14)
 def test_actual_producer_exited_without_timeout(self):
  r=json.loads((F/'producer-terminal-verbatim.json').read_bytes());self.assertEqual(r['observedExitCode'],0);self.assertFalse(r['timeoutTriggered'])
if __name__=='__main__':unittest.main(verbosity=2)
