"""Frozen independent real worksheet CSS evidence, not whole-corpus approval."""
from pathlib import Path
import hashlib,json,unittest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/independent-method-css-748-20261126'
def load(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

class MethodCssPeer(unittest.TestCase):
    def test_real_terminal_exact_twenty_sequences_and_ninety_eight_steps(self):
        report=load(BASE/'actual-ui-20/report.json');receipt=load(BASE/'actual-ui-20/terminal-receipt.json');blueprint=load(BASE/'independent-input-blueprint.json')
        original=load(BASE/'source-math-blueprint-927.json')
        self.assertEqual(blueprint['records'],original['records']);self.assertEqual(blueprint['sourceMathematicalBlueprintReusedFromSha256'],sha(BASE/'source-math-blueprint-927.json'))
        self.assertEqual(receipt['observedExitCode'],0);self.assertIsNone(receipt['error']);self.assertEqual(receipt['before'],receipt['after'])
        self.assertEqual(receipt['before']['sha256'],'748b31decc821162f9631e619747cf8d273202b35ebe9ca993e7e0b2a0e2ebc4')
        self.assertEqual(report['protocolSha256'],sha(BASE/'browser-worksheets-peer.mjs'));self.assertEqual(report['blueprintSha256'],sha(BASE/'independent-input-blueprint.json'))
        self.assertEqual(len(report['records']),20);self.assertEqual({(r['id'],r['width'])for r in report['records']},{(r['id'],w)for r in blueprint['records']for w in[320,1280]})
        self.assertEqual(sum(len(r['steps'])for r in report['records']),98)
        expected={r['id']:r['sourceSteps']for r in blueprint['records']}
        for r in report['records']:
            self.assertTrue(r['sequenceComplete']and r['technicalOk']and r['switchSheetProgressPreserved']and r['resetToFirstStep']);self.assertFalse(r.get('layoutFailures'));self.assertEqual(r['axe'],[])
            for step,want in zip(r['steps'],expected[r['id']]):
                self.assertEqual(step['independentInput'],want['independentInput']);self.assertTrue(step['accepted'].startswith('Corretto. '));self.assertTrue(step['rejected'].startswith('Riprova. '));self.assertEqual(step['activeAxe'],[])
                self.assertTrue(all(v['ok']for v in step['dynamicMath']))

    def test_whole_formula_boxes_and_every_referenced_image_are_retained(self):
        report=load(BASE/'actual-ui-20/report.json');count=0
        for r in report['records']:
            self.assertEqual(len(r['staticFormulaLayout']),5)
            for f in r['staticFormulaLayout']:
                self.assertTrue(f['ok']);self.assertEqual(f['scrollWidth'],f['clientWidth']);self.assertEqual(f['glyphCount'],len(f['glyphBounds']));count+=f['glyphCount']
                for g in f['glyphBounds']:
                    self.assertGreater(g['width'],0);self.assertGreater(g['height'],0);self.assertGreaterEqual(g['left'],f['contentLeft']-1);self.assertLessEqual(g['right'],f['contentRight']+1)
            image_keys=['screenshotSha256','staticMathScreenshotSha256']+(['expressionScreenshotSha256']if 'expressionScreenshotSha256'in r else[])
            for key in image_keys:self.assertEqual(sha(BASE/'actual-ui-20'/(r[key]+'.png')),r[key])
            for h in r.get('diagramStageScreenshots',{}).values():self.assertEqual(sha(BASE/'actual-ui-20'/(h+'.png')),h)
            for h in r.get('diagramStages',{}).values():self.assertEqual(sha(BASE/'actual-ui-20'/(h+'.svg.txt')),h)
        self.assertEqual(count,1944);self.assertEqual(len(load(BASE/'images-read.json')),7)
        self.assertEqual(load(BASE/'summary.json')['activityCredit'],0)

if __name__=='__main__':unittest.main()
