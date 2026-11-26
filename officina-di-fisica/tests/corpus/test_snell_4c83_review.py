"""Independent actual Snell correction scope, full glyphs and retained limits."""
from pathlib import Path
import importlib.util
import json
import math
import shutil
import tempfile
import unittest
from tools.corpus_engineering import experiment_visibility_request as v

APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/independent-snell-4c83-20261126'
spec=importlib.util.spec_from_file_location('independent_snell_geometry',BASE/'analyze-geometry.py');geometry=importlib.util.module_from_spec(spec);spec.loader.exec_module(geometry)

class SnellCorrection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root=BASE/'actual-ui-16';cls.plan=v.load(cls.root/'prepared.json');cls.receipt=v.load(cls.root/'terminal-receipt.json');cls.report=v.load(cls.root/'report.json')
        cls.cases=[v.load(cls.root/i['file'])for i in cls.report['cases']];cls.grids=[c for c in cls.cases if c.get('interaction',{}).get('kind')=='grid']

    def test_sixteen_real_states_and_eight_setup_are_new_4c83(self):
        self.assertEqual(len(self.grids),16);self.assertEqual(len(self.cases),24);self.assertEqual(self.receipt['observedExitCode'],0)
        self.assertEqual(self.receipt['candidateRef'],'64aef05bef5ca7ebff8491060762dd4cac0cbb34');self.assertEqual(self.receipt['runtimeSha256'],'4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907')
        self.assertEqual({(c['profile']['width'],c['profile']['view'],c['interaction']['x'])for c in self.grids},{(w,view,a)for w in (320,1280)for view in ('orbit','side','top','fixed_projection')for a in (30,45)})
        v.verify_report(self.root,self.plan,self.receipt['protocolSha256'])

    def test_exact_snell_relation_direction_and_schematic_length(self):
        for c in self.grids:
            a=c['interaction']['x'];arrows=[e for e in c['elements']if e['kind']=='arrow'];incoming=arrows[0];outgoing=arrows[1]
            self.assertEqual(incoming['b'],outgoing['a']);self.assertEqual(incoming['b'],[0,1.27,0])
            di=[incoming['b'][i]-incoming['a'][i]for i in range(3)];dr=[outgoing['b'][i]-outgoing['a'][i]for i in range(3)]
            self.assertAlmostEqual(math.hypot(*di),1);self.assertAlmostEqual(math.hypot(*dr),1);self.assertLess(di[1],0);self.assertLess(dr[1],0)
            self.assertAlmostEqual(di[0],1.5*dr[0]);self.assertAlmostEqual(di[0],math.sin(math.radians(a)))
            if a==30:self.assertAlmostEqual(dr[0],1/3)
            else:self.assertAlmostEqual(dr[0],math.sqrt(2)/3)
            self.assertAlmostEqual(c['model']['y'],math.degrees(math.asin(dr[0])))

    def test_full_native_parts_and_remaining_label_separation(self):
        result=geometry.analyze(self.root);self.assertEqual(sum(len(c['fullNativeParts'])for c in result['cases']),48)
        for c in result['cases']:
            for p in c['fullNativeParts']:
                self.assertTrue(p['labels']);self.assertTrue(all(l['separatingAxisGapPixels']>0 for l in p['labels']))

    def test_shaft_only_overlay_is_rejected_even_when_tip_is_clear(self):
        with tempfile.TemporaryDirectory()as tmp:
            copy=Path(tmp)/'copy';shutil.copytree(self.root,copy)
            item=next(i for i in self.report['cases']if i['caseKey'].endswith('|320|top|grid|0'));c=v.load(copy/item['file']);g=c['nativeGlyphs'][0]
            projected=[geometry.project(p,c)for p in g['parts'][0]['vertices']];center=[sum(p[j]for p in projected)/len(projected)for j in range(2)]
            c['labels']=[{'text':'adversarial shaft overlay','box':{'x':center[0],'y':center[1],'w':2,'h':2}}]
            self.assertGreater(abs(g['tipPixels']['x']-center[0]),1)
            (copy/item['file']).write_text(json.dumps(c))
            with self.assertRaises(AssertionError):geometry.analyze(copy)

    def test_normal_identity_and_edge_on_instruction_are_actual_rendered_legend(self):
        for c in self.grids:
            self.assertFalse(any(e['kind']=='label'and e['text']=='Normale'for e in c['elements']))
            self.assertTrue(any(e['kind']=='line'and e.get('dash')for e in c['elements']))
            for word in ('linea grigia tratteggiata','perpendicolare','asse ottico','Obliqua o Laterale','di taglio','lunghezza schematica'):self.assertIn(word,c['legend'])
            self.assertIn('°',c['readings'])
        row=self.plan['records'][0]['record'];self.assertEqual(row['control']['unit'],'°');self.assertEqual(row['measure']['unit'],'°')

    def test_original_manual_failure_and_zero_activity_credit_are_retained(self):
        for c in self.grids:self.assertTrue(c['originalJudgment']['sourceManualityFailure']);self.assertEqual(c['activityCredit'],0);self.assertFalse(c['scientificApproval'])
        self.assertEqual(self.report['activityCredit'],0);self.assertEqual(self.report['humanApproval'],'NOT_RUN')
        self.assertEqual(len(self.report['fullOwnerRecordIdentity']['records']),9)

if __name__=='__main__':unittest.main()
