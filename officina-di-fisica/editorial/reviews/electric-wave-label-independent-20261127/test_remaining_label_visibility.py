"""Actual saved canary expectations. Failure is retained; no acceptance credit."""
from pathlib import Path
import hashlib,json,os,unittest
OUT=Path(os.environ.get('C4C5_CANARY_EVIDENCE',Path(__file__).resolve().parent))
def load(path):return json.loads(path.read_bytes())

class CurrentCanaryBoundaries(unittest.TestCase):
    def test_exact_runtime_and_actual_terminal(self):
        r=load(OUT/'actual-browser/report.json');t=load(OUT/'actual-browser-terminal.json')
        self.assertEqual(t['observedExit'],0);self.assertIsNone(t['signal'])
        self.assertEqual(hashlib.sha256((OUT/'actual-browser/report.json').read_bytes()).hexdigest(),t['reportSha256'])
        self.assertEqual(r['runtimeFingerprint']['sha256'],'440d86b5a3d265139477abfc79276ecf979ea6f210f0e07bebc4a76473a47334')

    def test_exact_plan_and_opened_images(self):
        plan=load(OUT/'bounded-plan.json');r=load(OUT/'actual-browser/report.json');read=load(OUT/'raster-read-log.json')
        self.assertEqual(len(plan['cases']),74);self.assertEqual(len(r['cases']),74)
        self.assertEqual({c['key']for c in plan['cases']},{c['key']for c in r['cases']})
        self.assertFalse(read['pending']);seen={c['imageSha256']for c in read['actuallyOpened']}
        self.assertEqual(len(seen),74)
        for c in r['cases']:
            raw=(OUT/'actual-browser'/c['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),c['sha256'])
            actual=json.loads(raw);self.assertIn(actual['imageSha256'],seen)
            self.assertEqual(hashlib.sha256((OUT/'actual-browser'/(actual['imageSha256']+'.png')).read_bytes()).hexdigest(),actual['imageSha256'])

    def test_unchanged_56_sources_and_owned_scope(self):
        result=load(OUT/'actual-independent-comparison.json')
        self.assertEqual(len(result['records']),56);self.assertEqual(result['controls'],868);self.assertEqual(result['scenes'],2018)
        affected=[r for r in result['records']if r['removedNames']]
        self.assertEqual(len(affected),15);self.assertTrue(all(r['id'].startswith(('SIM-C4-','SIM-C5-'))for r in affected))
        self.assertTrue(all(r['allNonLabelAndNonTransferredLabelsIdentical']and r['modelAndGuideUnchanged']for r in result['records']))

    def test_nondegenerate_arrowheads_not_covered_by_remaining_text(self):
        census=load(OUT/'actual-source-projected-label-census.json');unexpected=[];degenerate=[]
        for case in census['headOrTipCandidates']:
            # The red vertical current is seen end-on in Top, before and after
            # this patch. It is distinct from the tangential magnetic-field cue.
            if case['id']=='SIM-C4-L09-01'and case['view']=='top'and case['label']=='Filo':
                degenerate.append(case);continue
            if case['headStrictlyInside']:unexpected.append(case)
        self.assertEqual(len(degenerate),2)
        self.assertEqual(unexpected,[],[(c['key'],c['label'],c['parts'])for c in unexpected])

if __name__=='__main__':unittest.main(verbosity=2)
