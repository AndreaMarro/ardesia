"""Independent exact physics, edition boundaries and constrained physical domains."""
import ast
import importlib
import json
from pathlib import Path
import unittest
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
class IndependentCoupleGravityDescent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.families=[]
        for name in ('force_couple','gravity_ratio','circular_orbit','descent_with_loss'):
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            package=json.loads((APP/'editorial/batches'/(module.BATCH+'.json')).read_text())
            bindings=json.loads((APP/'editorial/batches'/(module.BATCH+'-bindings.json')).read_text())
            cls.families.append((module,package,bindings))
    def test_complete_read_editions_and_reproducible_metadata(self):
        for module,package,bindings in self.families:
            with self.subTest(batch=module.BATCH):
                report=module.report(package,bindings)
                self.assertEqual(len(report['records']),16)
                self.assertEqual({r['id'] for r in report['records']},module.EXPECTED_IDS)
                self.assertTrue(all(r['ok'] for r in report['records']))
                self.assertEqual(report['packageSha256'],module.REVIEWED_PACKAGE_SHA256)
                self.assertEqual(report['bindingsSha256'],module.REVIEWED_BINDINGS_SHA256)
                self.assertEqual(report['contractSha256'],sha(Path(module.__file__).with_name('review_contract.py').read_bytes()))
                self.assertEqual(report['verifierSha256'],sha(Path(module.__file__).read_bytes()))
                self.assertEqual(len(report['reviewedCandidateCommit']),40)
                self.assertTrue(report['source']['path'].endswith('U2-06.json'))
                self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
                for row in report['records']:self.assertTrue(row['manualArithmetic'] and row['distractors'] and row['physicalAssumptions'])
    def test_rebound_retokenized_keys_units_sources_literals_and_svg(self):
        for module,package,bindings in self.families:
            with self.subTest(batch=module.BATCH):
                before=(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256)
                audit=module.mutation_audit(package,bindings,APP/'editorial/assets')
                self.assertEqual(audit['caseCount'],25);self.assertTrue(audit['allRejected'])
                self.assertEqual(sum(c['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for c in audit['cases']),16)
                self.assertIn('false_source_shard_provenance_rehashed_and_retokenized',{c['case'] for c in audit['cases']})
                self.assertIn('equivalent_literal_distractor_rebound_and_retokenized',{c['case'] for c in audit['cases']})
                self.assertEqual(before,(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256))
                self.assertTrue(all(r['ok'] for r in module.verify(package,bindings)))
    def test_couple_origin_invariance_and_exact_radical_identifiability(self):
        couple,gravity,orbit,descent=(row[0].oracle() for row in self.families)
        self.assertEqual(couple[2],'0 N; 10 N·m')
        self.assertEqual(str(gravity[6]),'1/4');self.assertEqual(str(gravity[11]),'3/8')
        self.assertEqual(sp.simplify(orbit[10]-sp.sqrt(2)/4),0)
        self.assertEqual(sp.simplify(orbit[11]-(1+sp.sqrt(2)/4)),0)
        self.assertEqual(orbit[15],'Infinite')
        self.assertEqual([str(x[14]) for x in (couple,gravity,orbit,descent)],['4','4','16','2'])
        F,d,x,y=sp.symbols('F d x y',real=True)
        fl=sp.Matrix([0,-F,0]);fr=-fl
        tau=sp.Matrix([-d/2-x,-y,0]).cross(fl)+sp.Matrix([d/2-x,-y,0]).cross(fr)
        self.assertEqual(sp.simplify(tau[2]),F*d)
        self.assertEqual(fl+fr,sp.zeros(3,1))
    def test_descent_start_geometry_and_allowed_vertical_inverse(self):
        module=self.families[3][0]
        self.assertEqual(module.physical_speed(1,2),4)
        self.assertEqual(module.physical_speed(1,8),2)
        self.assertEqual(module.physical_speed(2,2),6)  # prescribed resistance, not mu N
        for h,L in ((3,2),(1,10),(1,11),(0,2),(-1,2)):
            with self.subTest(h=h,L=L):
                with self.assertRaises(ValueError):module.physical_speed(h,L)
        reconstructed_h=(sp.Integer(7)**2+2*1*2)/(2*10)
        self.assertGreater(reconstructed_h,2)
        with self.assertRaises(ValueError):module.physical_speed(reconstructed_h,2)
        self.assertEqual(str(module.oracle()[12]),'4')
    def test_read_radical_literals_do_not_evaluate_arbitrary_input(self):
        module=self.families[2][0]
        self.assertEqual(module.parse_literal('√2/4'),sp.sqrt(2)/4)
        self.assertEqual(module.parse_literal('(4+√2)/4'),1+sp.sqrt(2)/4)
        self.assertEqual(module.parse_literal('√(5/3)'),sp.sqrt(15)/3)
        for raw in ('sqrt(2)/4','x+1','__import__("os")','2**99999999'):
            with self.subTest(raw=raw):
                with self.assertRaises((TypeError,ValueError)):module.parse_literal(raw)
    def test_no_candidate_authoring_imports(self):
        for module,_,_ in self.families:
            for node in ast.walk(ast.parse(Path(module.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
if __name__=='__main__':unittest.main()
