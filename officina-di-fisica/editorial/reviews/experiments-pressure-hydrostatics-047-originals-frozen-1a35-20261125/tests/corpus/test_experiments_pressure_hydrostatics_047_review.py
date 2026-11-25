"""Independent original047 source/math/manual/actual-UI negative preservation."""
from pathlib import Path
from copy import deepcopy
from unittest.mock import patch
import json,subprocess,unittest
import sympy as sp
from tools.corpus_engineering import experiments_pressure_hydrostatics_047_verifier as r
from tools.corpus_engineering.pipeline import sha,digest
class Original047Review(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',r.SOURCE_REF+':'+r.SOURCE_PATH],cwd=r.APP);cls.sources={v['id']:v for v in json.loads(cls.raw) if v['id'] in r.SPECS};cls.actual=r.runtime_values(cls.sources)
    def test_complete_exact_science_and_real_grid(self):
        self.assertEqual(sha(self.raw),r.SOURCE_FILE_SHA256);self.assertEqual({k:digest(v) for k,v in self.sources.items()},r.READ_SOURCE_SHA256)
        checks=r.independent_checks();bad=[(k,c['scope']) for k,v in checks.items() for c in v if not c['ok']];self.assertEqual(bad,[('SIM-C2-L002-01','SOURCE_CONTRACT_CONFLICT_EXPECTED_FAIL')])
        compare=r.compare_runtime(self.actual);self.assertTrue(all(v['ok'] for v in compare.values()));self.assertEqual(sum(v['caseCount'] for v in compare.values()),140);self.assertTrue(all(v['clockSampleCount']==0 for v in compare.values()))
        self.assertEqual([k for k,v in compare.items() if not v['requestedTaskAgreement']],['SIM-C2-L002-01'])
    def test_fresh_report_preserves_source_failure_and_material_visual_negatives(self):
        with patch.object(r,'runtime_values',wraps=r.runtime_values) as execute:a=r.report(self.sources);b=r.report(self.sources)
        self.assertEqual(execute.call_count,2);self.assertEqual(a,b);self.assertEqual((a['acceptedCount'],a['failedCount'],a['draftReviewedCount']),(5,5,0));self.assertEqual(a['sourceManualityIssueIds'],['SIM-C2-L002-01'])
        self.assertEqual(set(a['failedPublishedEditionIds']),set(r.VISUAL_ISSUES));self.assertTrue(r.consumer_evidence()['ok'])
        for v in a['records']:self.assertEqual(v['publicationAction'],'NONE');self.assertEqual(v['humanApproval'],'NOT_RUN');self.assertTrue(v['originalEditionRetained'])
        self.assertEqual(self.sources['SIM-C2-L002-01']['version'],1);self.assertEqual(self.sources['SIM-C2-L002-04']['version'],2)
    def test_every_scalar_graph_grid_and_rebound_task_unit_is_independent(self):
        for key in r.SPECS:
            for mode in ('scalar','graph','task','unit','partial'):
                x=deepcopy(self.actual)
                if mode=='scalar':x[key]['cases'][0]['output']['y']+=1
                elif mode=='graph':x[key]['cases'][0]['graphs'][0]['series'][0]['points'][0][1]+=1
                elif mode=='task':x[key]['assessment'][0]['value']+=1;x[key]['formatRoundtrip'][0]={'display':str(x[key]['assessment'][0]['value']),'parsed':x[key]['assessment'][0]['value']}
                elif mode=='unit':x[key]['assessment'][0]['unit']='WRONG'
                else:x[key]['cases'].pop()
                self.assertFalse(r.compare_runtime(x)[key]['ok'],(key,mode))
    def test_unreviewed_source_and_unknown_runtime_never_execute(self):
        for key in r.SPECS:
            s=deepcopy(self.sources);s[key]['interpretation']+=' changed assumption'
            with patch.object(r,'runtime_values',side_effect=AssertionError('unreviewed source executed')):self.assertEqual(r.report(s)['acceptedCount'],0)
        with patch.object(r,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(r,'runtime_values') as run:self.assertEqual(r.report(self.sources)['acceptedCount'],0);run.assert_not_called()
        with self.assertRaises(ValueError):r.report({})
    def test_explicit_g10_transfer_conflict_reproduces_actual_grader(self):
        key='SIM-C2-L002-01';self.assertEqual(r.assigned_value(key,1),15);self.assertEqual(r.exact_value(key,1.5),sp.Rational(2943,200));self.assertGreater(abs(sp.Rational(2943,200)-15),sp.Rational(2943,200)/200)
        proof=json.loads((r.APP/'editorial/reviews/experiments-pressure-hydrostatics-047-1a35-20261125/gravity-prompt-supplement.json').read_text());rows=[v for v in proof['cases'] if v.get('kind')=='activity' and v['id']==key];self.assertEqual(len(rows),4)
        for v in rows:
            task=v['assessments'][1];self.assertIn('g = 10',task['prompt']);self.assertFalse(task['status'].startswith('Corretto'));self.assertTrue(task['wrongPhysicalKeyStatus'].startswith('Corretto'))
    def test_actual_plate_and_sprite_negatives_are_not_whole_cone_inventions(self):
        folder=r.APP/'editorial/reviews/experiments-pressure-hydrostatics-047-1a35-20261125';geo=json.loads((folder/'opaque-census.json').read_text());self.assertEqual(geo['frames'],140);self.assertEqual(len(geo['failedFrames']),8);self.assertTrue(all(v['id']=='SIM-C2-L001-02' for v in geo['failedFrames']))
        p=json.loads((folder/'label-projection.json').read_text());s=next(v for v in p['candidates'] if v['id']=='SIM-C2-L001-05' and v['input']==80 and v['width']==320);self.assertTrue(s['markers'][0]['entireProjectedCircleInsideLabel']);self.assertTrue(s['arrows'][0]['coveringLabelBoxes']);self.assertGreater(.0812,.07)
        self.assertNotIn('SIM-C2-L002-04',r.VISUAL_ISSUES)
    def test_changed_proof_protocol_or_png_manifest_cannot_inherit_current_review(self):
        for name in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256','READ_VISUAL_MANIFEST_SHA256'):
            with patch.object(r,name,'0'*64):self.assertFalse(r.consumer_evidence()['ok']);self.assertEqual(r.report(self.sources)['acceptedCount'],0)
    def test_hydrostatic_sign_and_geometric_profile_mutations_are_rejected(self):
        for key,change in [('SIM-C2-L001-02','velocity'),('SIM-C2-L002-04','level'),('SIM-C2-L003-01','area')]:
            a=deepcopy(self.actual);c=next(v for v in a[key]['cases'] if v['x']==(6 if change=='velocity' else 2))
            if change=='velocity':next(v for v in c['elements'] if v['kind']=='arrow')['b'][0]+=1
            elif change=='level':next(v for v in c['elements'] if v['kind']=='rod' and r.near(v.get('r'),.135))['b'][1]+=1
            else:next(v for v in c['elements'] if v['kind']=='rod' and v.get('c')==0x726d81 and r.near(v.get('r'),.58))['r']=.29
            self.assertFalse(r.compare_runtime(a)[key]['ok'])
if __name__=='__main__':unittest.main()
