"""Independent exact/consumer/integrity counterprobes for118/119/140.
No fixture edits original physics, draft candidate, publication or approval state.
"""
from copy import deepcopy
import importlib
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering import experiments_revision_review as contract
APP=Path(__file__).resolve().parents[2]


class IndependentExperimentRevisions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw=subprocess.check_output(['git','show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C1.json'],cwd=APP)
        cls.source_bytes=raw;cls.sources={r['id']:r for r in json.loads(raw)};cls.families=[]
        for group in ('foundations','vectors','forces'):
            module=importlib.import_module('tools.corpus_engineering.experiments_'+group+'_revision_verifier')
            package=json.loads((APP/'editorial/batches'/(module.PACKAGE_NAME+'.json')).read_text())
            bindings=json.loads((APP/'editorial/batches'/(module.PACKAGE_NAME+'-bindings.json')).read_text())
            selected={k:cls.sources[k] for k in module.SPECS};effective=dict(selected);effective[module.REVISION_ID]=package['records'][0]
            actual=module.runtime_values(effective)
            cls.families.append((module,package,bindings,selected,actual))

    def test_complete_pinned_source_and_exact_models_match_all_reachable_inputs(self):
        ids=set();grid=0
        for module,package,bindings,sources,actual in self.families:
            self.assertEqual(sha(self.source_bytes),module.SOURCE_FILE_SHA256)
            for key,pin in module.READ_SOURCE_SHA256.items():self.assertEqual(digest(sources[key]),pin)
            mathematical=module.independent_checks();self.assertEqual(set(mathematical),set(sources))
            for key,checks in mathematical.items():self.assertTrue(checks);self.assertTrue(all(c['ok'] for c in checks),key)
            comparisons=module.compare_runtime(actual);self.assertEqual(set(comparisons),set(sources))
            for key,row in comparisons.items():self.assertTrue(row['ok'],(key,row));grid+=row['caseCount']
            ids.update(sources)
        self.assertEqual(ids,set(contract.ALL_IDS));self.assertEqual(grid,271)

    def test_terminal_observed_evidence_and_individual_draft_identity(self):
        self.assertTrue(contract.consumer_evidence(APP)['ok'])
        for module,package,bindings,sources,actual in self.families:
            # Fresh report executes the installed adapter again; no cached scientific PASS.
            result=module.report(sources,package,bindings)
            self.assertEqual(result['acceptedCount'],len(sources));self.assertEqual(result['failedCount'],0);self.assertEqual(result['draftReviewedCount'],1)
            assert_activity_identity(result['records'],set(sources),sources,{r['id']:r for r in package['records']},{b['id']:b for b in bindings})
            original=next(r for r in result['records'] if r['id']==module.REVISION_ID)['publishedEditionReview']
            self.assertFalse(original['ok']);self.assertEqual(original['publicationAction'],'NONE');self.assertEqual(original['humanApproval'],'NOT_RUN')

    def test_every_scalar_and_rebound_assessment_mutation_is_rejected_by_independent_law(self):
        for module,package,bindings,sources,actual in self.families:
            for key in sources:
                with self.subTest(id=key):
                    broken=deepcopy(actual);broken[key]['cases'][0]['output']['y']+=1
                    self.assertFalse(module.compare_runtime(broken)[key]['ok'])
                    broken=deepcopy(actual);broken[key]['assessment'][0]['value']+=1
                    # Rebinding the display to that same wrong answer must not make it valid.
                    broken[key]['formatRoundtrip'][0]={'display':str(broken[key]['assessment'][0]['value']),'parsed':broken[key]['assessment'][0]['value']}
                    self.assertFalse(module.compare_runtime(broken)[key]['ok'])

    def test_unreviewed_source_never_executes_engine(self):
        for module,package,bindings,sources,actual in self.families:
            for key in sources:
                changed=deepcopy(sources);changed[key]['control']['max']+=1
                with patch.object(module,'runtime_values',side_effect=AssertionError('Unreviewed source reached engine')):
                    result=module.report(changed,package,bindings)
                self.assertEqual(result['acceptedCount'],0)

    def test_rebound_candidate_and_unsupported_manual_selection_are_rejected_before_engine(self):
        for module,package,bindings,sources,actual in self.families:
            for mutation in ('selection','physics','version','source'):
                p,b=deepcopy(package),deepcopy(bindings)
                if mutation=='selection':p['records'][0]['assessmentSelection']['points'][1]=95 if '005' not in module.REVISION_ID else 40
                if mutation=='physics':p['records'][0]['references'][0][1]+=1
                if mutation=='version':p['records'][0]['baseVersion']+=1
                if mutation=='source':b[0]['sourceRef']='0'*40
                b[0]['candidateSha256']=digest(p['records'][0])
                with patch.object(module,'runtime_values',side_effect=AssertionError('Unreviewed candidate reached engine')):
                    self.assertEqual(module.report(sources,p,b)['acceptedCount'],0)

    def test_missing_duplicate_asset_and_asset_rebinding_cannot_pass(self):
        for module,package,bindings,sources,actual in self.families:
            p=deepcopy(package);p['records']=[]
            with self.assertRaises(ValueError):module.report(sources,p,bindings)
            p=deepcopy(package);p['records']*=2
            with self.assertRaises(ValueError):module.report(sources,p,bindings)
            if package['assets']:
                p=deepcopy(package);p['assets'][0]['data']='AA=='
                with self.assertRaises(ValueError):module.report(sources,p,bindings)

    def test_exact_quadrant_zeros_and_common_force_gains_have_strict_counterprobes(self):
        module,_,_,_,actual=self.families[1]
        for key,x in [('SIM-C1-L002-01',90),('SIM-C1-L002-04',180)]:
            broken=deepcopy(actual);case=next(c for c in broken[key]['cases'] if c['x']==x);case['readings'][2][1]=1e-16
            self.assertFalse(module.compare_runtime(broken)[key]['ok'])
        module,_,_,_,actual=self.families[2]
        for key in ('SIM-C1-L005-05','SIM-C1-L005-06'):
            broken=deepcopy(actual);case=next(c for c in broken[key]['cases'] if c['x']==0)
            arrow=next(e for e in case['elements'] if e.get('kind')=='arrow' and e.get('c')==0x147979)
            arrow['b']=[a+1.1*(b-a) for a,b in zip(arrow['a'],arrow['b'])]
            self.assertFalse(module.compare_runtime(broken)[key]['ok'])

    def test_changed_current_runtime_never_inherits_consumer_approval(self):
        for module,package,bindings,sources,actual in self.families:
            with patch.object(contract,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(module,'runtime_values',side_effect=AssertionError('Changed runtime executed')):
                self.assertEqual(module.report(sources,package,bindings)['acceptedCount'],0)

if __name__=='__main__':unittest.main()
