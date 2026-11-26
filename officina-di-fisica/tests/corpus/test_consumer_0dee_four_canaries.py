"""Actual corrected four-ID canaries preserve the new Echo mask failure."""
from pathlib import Path
import hashlib
import json
import math
import unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-0dee-canaries-20261126'

class FourCanaries(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root=BASE/'actual-ui-120';cls.report=json.loads((cls.root/'report.json').read_bytes());cls.plan=json.loads((cls.root/'prepared.json').read_bytes())
        cls.cases=[json.loads((cls.root/c['file']).read_bytes())for c in cls.report['cases']];cls.grids=[c for c in cls.cases if c.get('interaction',{}).get('kind')=='grid']

    def test_exact_120_observed_profile_states_are_new_0dee_epoch(self):
        self.assertEqual(len(self.cases),120);self.assertEqual({c['caseKey']for c in self.cases},set(self.plan['expectedCaseKeys']));self.assertEqual(len(self.grids),88)
        counts={key:sum(c['id']==key for c in self.grids)for key in ('SIM-C2-L005-05','SIM-C4-L02-01','SIM-C4-L09-02','SIM-C6-L01-01')}
        self.assertEqual(list(counts.values()),[8,24,40,16]);self.assertTrue(all(c['technicalOk']for c in self.cases))
        r=json.loads((self.root/'terminal-receipt.json').read_bytes());self.assertEqual(r['observedExitCode'],0)
        self.assertEqual(r['candidateRef'],'47984189654c7e3ce62e22265a1e54f5b4af8ad7');self.assertEqual(r['runtimeSha256'],'0dee1aae03c52966051a7fe41347a1ea937f257127c0b402568677b4c7f779a8')
        self.assertEqual(hashlib.sha256((BASE/'experiment_visibility_ui.mjs').read_bytes()).hexdigest(),r['protocolSha256'])

    def test_network_incoming_equals_branch_lengths_and_node_labels_are_html(self):
        for c in self.grids:
            if c['id']!='SIM-C2-L005-05':continue
            arrows=[e for e in c['elements']if e['kind']=='arrow'];length=lambda e:math.dist(e['a'],e['b'])
            incoming=next(e for e in arrows if e['c']==0xd49332);branches=[e for e in arrows if e['c']in (0x7350b0,0x147979)]
            self.assertAlmostEqual(length(incoming),1.1);self.assertAlmostEqual(length(incoming),sum(map(length,branches)));self.assertEqual(c['model']['y'],4)
            self.assertFalse(any(e['kind']=='label'and e['text']in ('Nodo A','Nodo B')for e in c['elements']))
            self.assertIn('nodo A',c['legend']);self.assertIn('nodo B',c['legend']);self.assertIn('ocra',c['legend'])

    def test_field_original_unclamped_and_zoom_exactly_ten_with_distinct_plane(self):
        for c in self.grids:
            if c['id']!='SIM-C4-L02-01':continue
            x=c['interaction']['x'];self.assertEqual(c['model']['y'],90/x**2)
            arrows=[e for e in c['elements']if e['kind']=='arrow'];original=next(e for e in arrows if e['c']==0x7350b0);delta=original['b'][0]-original['a'][0]
            self.assertAlmostEqual(delta,90/65/x**2);self.assertEqual(original['a'][2],.3)
            if x>1:
                zoom=next(e for e in arrows if e['c']==0xd49332);self.assertAlmostEqual(zoom['b'][0]-zoom['a'][0],10*delta);self.assertEqual(zoom['a'][2],.95)
            self.assertFalse(any(e['kind']=='label'and e['text']in ('P','E ×10')for e in c['elements']))
            self.assertIn('E ×10',c['legend']);self.assertIn('ocra',c['legend'])

    def test_lorentz_zero_small_values_and_cross_product_are_preserved(self):
        for c in self.grids:
            if c['id']!='SIM-C4-L09-02':continue
            x=c['interaction']['x'];arrows=[e for e in c['elements']if e['kind']=='arrow'];v=next(e for e in arrows if e['c']==0x147979);self.assertAlmostEqual(math.dist(v['a'],v['b']),1.4)
            force=[e for e in arrows if e['c']==0x7350b0]
            if x in (0,180):self.assertEqual(c['model']['y'],0);self.assertEqual(force,[])
            else:
                self.assertAlmostEqual(c['model']['y'],6*math.sin(math.radians(x)));self.assertEqual(len(force),1)
                f=force[0];self.assertLess(f['b'][1]-f['a'][1],0);self.assertAlmostEqual(f['a'][1]-f['b'][1],.95*c['model']['y']/6)
            self.assertFalse(any(e['kind']=='label'and e['text']in ('v','B')for e in c['elements']));self.assertIn('tre frecce grigie',c['legend'])

    def test_echo_equal_paths_lateral_offset_and_new_three_tip_masks(self):
        hits=[]
        for c in self.grids:
            if c['id']!='SIM-C6-L01-01':continue
            x=c['interaction']['x'];self.assertEqual(c['sourceReplayedClockTime'],0);self.assertAlmostEqual(c['model']['y'],.17*x)
            arrows=[e for e in c['elements']if e['kind']=='arrow'];forward=next(e for e in arrows if e['c']==0x147979);back=next(e for e in arrows if e['c']==0x7350b0)
            self.assertEqual(back['a'][2],.85);self.assertEqual(back['b'][2],.85);self.assertAlmostEqual(math.dist(forward['a'],forward['b']),math.dist(back['a'],back['b']))
            for g in c.get('nativeGlyphs',[]):
                for label in g['tipInsideOpaqueLabel']:
                    self.assertEqual(label['text'],'Impulso');hits.append((c['profile']['width'],c['profile']['view'],x))
        self.assertEqual(set(hits),{(320,'orbit',1),(320,'side',1),(1280,'orbit',1)});self.assertEqual(len(hits),3)

    def test_32_facet_projection_claim_has_explicit_limits(self):
        r=json.loads((BASE/'echo-impulse-facet-observations.json').read_bytes());self.assertEqual(len(r['cases']),3)
        self.assertEqual(sum(x['allConeVerticesInsideOpaqueLabelBox']for x in r['cases']),2)
        for c in r['cases']:
            self.assertEqual(c['actualProjectedConeFacetVertices'],34)
            actual=next(x for x in self.grids if x['caseKey']==c['caseKey']);glyph=next(g for g in actual['nativeGlyphs']if g['tipPixels']==c['tip'])
            camera=actual['sourceDerivedCamera'];m=camera['matrixWorld'];projection=camera['projectionMatrix'];width=actual['canvas']['width'];height=actual['canvas']['height'];pixels=[]
            for vertex in glyph['parts'][1]['vertices']:
                offset=[vertex[i]-m[12+i]for i in range(3)];view=[sum(offset[j]*m[4*i+j]for j in range(3))for i in range(3)]+[1]
                clip=[sum(projection[4*j+i]*view[j]for j in range(4))for i in range(4)];pixels.append(((1+clip[0]/clip[3])*width/2,(1-clip[1]/clip[3])*height/2))
            actual_bounds=[min(v[0]for v in pixels),max(v[0]for v in pixels),min(v[1]for v in pixels),max(v[1]for v in pixels)]
            bounds=c['coneBounds'];b=c['label']['box']
            for a,bound in zip(actual_bounds,bounds):self.assertAlmostEqual(a,bound,places=10)
            inside=bounds[0]>b['x']-b['w']/2 and bounds[1]<b['x']+b['w']/2 and bounds[2]>b['y']-b['h']/2 and bounds[3]<b['y']+b['h']/2
            self.assertEqual(inside,c['allConeVerticesInsideOpaqueLabelBox'])

    def test_all_case_and_pixel_bytes_bound_no_activity_acceptance(self):
        for item,c in zip(self.report['cases'],self.cases):
            self.assertEqual(hashlib.sha256((self.root/item['file']).read_bytes()).hexdigest(),item['sha256']);self.assertFalse(c['scientificApproval']);self.assertEqual(c['activityCredit'],0)
            for image in c['screenshots']:self.assertEqual(hashlib.sha256((self.root/image['file']).read_bytes()).hexdigest(),image['sha256'])
        self.assertEqual(self.report['canonicalImport']['publishedCount'],991);self.assertEqual(self.report['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403')
        self.assertEqual(self.report['activityCredit'],0);self.assertEqual(self.report['humanApproval'],'NOT_RUN')

if __name__=='__main__':unittest.main()
