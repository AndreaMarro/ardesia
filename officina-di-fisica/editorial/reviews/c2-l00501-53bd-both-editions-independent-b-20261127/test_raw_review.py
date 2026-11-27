from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
import json, hashlib, unittest, re

D = Path(__file__).resolve().parent
J = lambda p: json.loads(p.read_text())
H = lambda b: hashlib.sha256(b).hexdigest()
class Review(unittest.TestCase):
    def setUp(self):
        self.index = J(D/'verified-raw-index.json')
        self.rows = self.index['cases']
        self.cases = [J(D/r['caseFile']) for r in self.rows]
    def test_four_real_terminals_separate(self):
        self.assertEqual(len(self.index['groups']),4)
        for group in self.index['groups']:
            self.assertEqual(group['cases'],40)
            self.assertEqual(group['terminal']['observedExitCode'],0)
            self.assertFalse(group['terminal']['timeoutTriggered'])
            root=D/'raw'/group['group']
            self.assertEqual(H((root/'actual/report.json').read_bytes()),group['rawReportSha256'])
            self.assertEqual(H((root/'prepared.json').read_bytes()),group['preparedSha256'])
            self.assertEqual(set(J(root/'prepared.json')['expectedCaseKeys']),{c['caseKey'] for c in self.cases if c['variant']==group['variant'] and c['profile']['width']==group['width']})
    def test_all_case_and_image_hashes(self):
        self.assertEqual(len(self.cases),160)
        for row,c in zip(self.rows,self.cases):
            self.assertEqual(H((D/row['caseFile']).read_bytes()),row['caseSha256'])
            for s in c['screenshots']:
                self.assertEqual(H((D/'raw'/row['group']/'actual'/s['file']).read_bytes()),s['sha256'])
    def test_primary_anchor_and_current_identities(self):
        self.assertEqual(H((D/'historical/primary-continuity-prompt-only.md').read_bytes()),'fa50a2ceeb39798796e28345c82631c669b8aad88f9f7a8dddfcddc8441b2907')
        for c in self.cases:
            self.assertEqual(c['id'],'SIM-C2-L005-01')
            self.assertEqual(c['runtimeSha256'],'53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a')
            self.assertEqual(c['sourceSha256'],'2c1385b566f8fc10f826b0885738205ac0e1c02bc1e4d56265169433bfde8d06')
            self.assertEqual(c['candidateSha256'],'06eb0924b44574ea48b9e2211fa87c7ba6126c8905884184ae5c929ecf40ae9f' if c['variant']=='draft' else None)
    def test_both_editions_exact_image_and_physics_identity(self):
        lookup={c['caseKey']:c for c in self.cases}
        for c in self.cases:
            if c['variant']!='draft':continue
            other=lookup[c['caseKey'].replace('|draft|','|published|')]
            self.assertEqual(c['screenshots'],other['screenshots'])
            for key in ['requestedX','requestedTime','model','actualDOMControls','sourceReplayedClockTime','actualRenderer','readings','legend','clockReadout']:
                self.assertEqual(c.get(key),other.get(key))
        self.assertEqual(len(self.index['uniqueScreenshots']),64)
    def test_eight_profiles_times_two_editions(self):
        combos={(c['profile']['width'],c['profile']['view'],c['variant'])for c in self.cases}
        self.assertEqual(len(combos),16)
        for width,view,variant in combos:
            chosen=[c for c in self.cases if c['profile']['width']==width and c['profile']['view']==view and c['variant']==variant]
            self.assertEqual(len(chosen),10)
            self.assertEqual({(c['requestedX'],c['requestedTime'])for c in chosen if c.get('interaction',{}).get('kind')=='clock'},{(0,6),(1,3),(7,3),(12,6)})
    def test_32_real_manual_replies(self):
        setup=[c for c in self.cases if c['caseKey'].endswith('setup')]
        self.assertEqual(len(setup),16)
        for c in setup:
            self.assertEqual([q['input']for q in c['questions']],['24','28'])
            for q in c['questions']:
                self.assertEqual(q['actualPrompt'],q['prompt'])
                self.assertTrue(q['status'].startswith('Corretto.'))
    def test_zero_flow_and_no_velocity_arrows(self):
        zero=[c for c in self.cases if c.get('requestedX')==0]
        self.assertEqual(len(zero),32)
        for c in zero:
            self.assertEqual(c['model']['y'],0)
            self.assertFalse(any(e['kind']=='arrow'for e in c['elements']))
            self.assertIn('Distanza alla velocità media0 cm',c['readings'])
    def test_fallback_small_head_is_inside_shaft_negative(self):
        small=[c for c in self.cases if c['profile']['fallback'] and c.get('requestedX')==1]
        self.assertEqual(len(small),8)
        for c in small:
            for color in ['#147979','#7350b0']:
                path=re.search(r'<path d="M([^\"]+)" fill="none" stroke="'+color+r'" stroke-width="([\d.]+)"',c['svg'])
                head=re.search(r'<polygon points="([^\"]+)" fill="'+color+r'"',c['svg'])
                self.assertIsNotNone(path);self.assertIsNotNone(head)
                pts=[tuple(map(Decimal,p.split(',')))for p in head[1].split()]
                width=max(y for x,y in pts)-min(y for x,y in pts)
                self.assertLess(width,Decimal(path[2]))
                self.assertTrue(Decimal('1.5039999999999')<width<Decimal('1.5040000000001'))
    def test_side_tip_occlusion_witnesses(self):
        rows=J(D/'projected-tip-occlusions.json')['rows']
        for width in [320,1280]:
            for variant in ['draft','published']:
                for suffix,color in [('grid|2','0x147979'),('clock|2','0x7350b0')]:
                    key=f'SIM-C2-L005-01|{variant}|{width}|side|{suffix}'
                    self.assertTrue(any(r['caseKey']==key and r['arrowColor']==color and not r['pointInside3DBall']for r in rows))
    def test_144_current_arithmetic_interactions(self):
        rows=J(D/'independent-current-raw-arithmetic.json')['rows'];self.assertEqual(len(rows),144)
        for r in rows:
            x=F(r['meanSpeedCmS']);time=F(r['timeS'])
            self.assertEqual(F(r['exactFlowMlS']),4*x)
            self.assertEqual(F(r['exactDistanceCm']),x*time)
    def test_old_mixed_kill_excluded(self):
        self.assertEqual(self.index['mixed80SIGKILL'],'EXCLUDED_DIAGNOSTIC_NOT_USED')
        self.assertTrue(all(g['cases']==40 for g in self.index['groups']))
if __name__=='__main__':unittest.main()
