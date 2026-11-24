"""Independent reviewer checks, no candidate-authoring imports or hidden key oracle."""
import ast
import importlib
import json
from pathlib import Path
import unittest
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
class IndependentImpulseCollisionsRecoil(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.families=[]
        for name in ('impulse','momentum','inelastic_rest','inelastic_opposed','recoil'):
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
                self.assertTrue(report['source']['path'].endswith('U2-05.json'))
                self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
                for row in report['records']:
                    self.assertTrue(row['manualArithmetic'] and row['distractors'] and row['physicalAssumptions'])
                    self.assertEqual(row['humanApproval'],'NOT_RUN')
    def test_rebound_keys_units_provenance_and_svg_scale_cannot_replace_review(self):
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
    def test_physical_branches_means_and_laboratory_reference(self):
        impulse,momentum,rest,opposed,recoil=(family[0].oracle() for family in self.families)
        self.assertEqual([str(a[11]) for a in (impulse,momentum,rest,opposed,recoil)],['10','10','11/6','7/4','5'])
        self.assertEqual(str(impulse[2]),'4')  # equal impulse6N×2s=4N×3s
        self.assertEqual(str(opposed[6]),'2/3')  # stronger leftward incoming speed reduces V
        self.assertEqual(str(rest[10]),'8/3')
        self.assertEqual([str(a[14]) for a in (impulse,momentum,rest,opposed,recoil)],['4','4','4','6','4'])
        self.assertEqual([str(a[15]) for a in (impulse,momentum,rest,opposed,recoil)],['2','2','2','1','2'])
        m,M,v,w=sp.symbols('m M v w',positive=True)
        lab=m*v/M;relative=m*w/(M+m)
        self.assertEqual(lab.subs({m:2,M:2,v:2}),2)
        self.assertEqual(relative.subs({m:2,M:2,w:4}),2)
        self.assertNotEqual(relative.subs({m:2,M:2,w:2}),2)
        # No zero external impulse => zero kinetic loss inference.
        V=m*v/(m+M);loss=sp.factor(m*v*v/2-(m+M)*V*V/2)
        self.assertTrue(loss.is_positive);self.assertEqual(loss.subs({m:2,M:2,v:2}),2)
    def test_no_authoring_imports(self):
        for module,_,_ in self.families:
            for node in ast.walk(ast.parse(Path(module.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
if __name__=='__main__':unittest.main()
