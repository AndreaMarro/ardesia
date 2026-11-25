"""Source-bound independent cross-domain calculations, not approval fixtures."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import examples_cross_domain_activity_verifier as review
from tools.corpus_engineering.pipeline import digest,sha,canonical
from tools.corpus_engineering.batches import assert_activity_identity


class CrossDomainExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.raw=raw
        cls.sources={r['id']:r for r in json.loads(raw) if r.get('id') in review.READ_SOURCE_SHA256}

    def test_real_six_examples_and_known_two_failures_are_not_silent_passes(self):
        report=review.report(self.sources)
        self.assertEqual(set(self.sources),{f'C6-E{i:03}' for i in range(1,7)})
        self.assertEqual(report,review.report(self.sources))
        self.assertEqual(report,json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'],report['failedCount'],report['draftReviewedCount']),(4,2,0))
        self.assertEqual(report['failedPublishedEditionIds'],['C6-E003','C6-E004'])
        self.assertEqual(sum(len(r['checks']) for r in report['records']),46)
        for row in report['records']:
            self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publicationAction'],'NONE')
            self.assertTrue(row['originalEditionRetained'])
            self.assertEqual(row['ok'],row['id'] not in review.SOURCE_ISSUES)
            failed=[c for c in row['checks'] if not c['ok']]
            self.assertEqual(len(failed),1 if row['id']=='C6-E003' else 0)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)

    def test_pins_match_source_and_asset_actual_git_bytes(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256)
        self.assertEqual((review.APP/'content/C6.json').read_bytes(),self.raw)
        self.assertEqual(sum(len(r['blocks']) for r in self.sources.values()),31)
        self.assertEqual({k:digest(r) for k,r in self.sources.items()},review.READ_SOURCE_SHA256)
        for name,expected in review.READ_ASSETS.items():
            raw=subprocess.check_output(['git','show',review.SOURCE_REF+':officina-di-fisica/static/figures/'+name],cwd=review.APP)
            self.assertEqual(sha(raw),expected)
            self.assertEqual((review.APP/'static/figures'/name).read_bytes(),raw)

    def test_each_missing_changed_source_and_empty_failed_model_rejects(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources=deepcopy(self.sources);sources[key]['prompt']+=' changed condition'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok'])
                self.assertIn('Example differs from independently read original',changed['errors'])
                del sources[key]
                with self.assertRaises(ValueError):review.verify(sources)
                for replacement in ([],[{'ok':False,'claim':'failed model','dimension':{}}]):
                    models=review.independent_checks();models[key]=replacement
                    with patch.object(review,'independent_checks',return_value=models):
                        changed=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(changed['ok'])
                        self.assertIn('Independent example mathematics failed',changed['errors'])

    def test_pump_figure_bytes_and_reference_required(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);file=root/'C6-pompa.svg';raw=(review.APP/'static/figures/C6-pompa.svg').read_bytes()
            for replacement in (None,raw+b'\n'):
                if replacement is not None:file.write_bytes(replacement)
                row=next(r for r in review.verify(self.sources,asset_root=root) if r['id']=='C6-E002')
                self.assertFalse(row['ok']);self.assertIn('Historical example figure changed or missing',row['errors'])
            file.write_bytes(raw)
            self.assertTrue(next(r for r in review.verify(self.sources,asset_root=root) if r['id']=='C6-E002')['ok'])
        sources=deepcopy(self.sources);sources['C6-E002']['blocks'][0]['src']='/figures/else.svg'
        row=next(r for r in review.verify(sources) if r['id']=='C6-E002')
        self.assertIn('Example figures differ from read original',row['errors'])

    def test_all_assigned_exact_quantities_units_and_balances(self):
        groups=review.independent_checks()
        claims={c['claim']:c for checks in groups.values() for c in checks}
        for key,want in {'actual one-way signal speed2e8':'200000000',
                         'actual doublepath echo6nanoseconds':'6',
                         'actual usefulpotential energy24joules':'24',
                         'actual dimensionless efficiency one third':'1/3',
                         'independent temperatureincrease6over7kelvin':'6/7',
                         'intended combined ratio3over20':'3/20',
                         'actual positive gaswork60joules':'60',
                         'actual firstlaw gain25joules':'25',
                         'actual temperatureincrease onehalfkelvin':'1/2'}.items():
            self.assertEqual(claims[key]['independentExact'],want)
        self.assertEqual(claims['actual Joule power2watt']['dimension'],{'[mass]':'1','[length]':'2','[time]':'-3'})
        self.assertEqual(claims['actual dimensionless efficiency one third']['dimension'],{})
        self.assertEqual(claims['actual firstlaw gain25joules']['dimension'],{'[mass]':'1','[length]':'2','[time]':'-2'})
        for checks in groups.values():
            for c in checks:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))

    def test_false_equality_and_detector_counterexample_are_distinct(self):
        exact=sp.Rational(180,210);printed=sp.Rational('0.86')
        self.assertEqual(exact,sp.Rational(6,7));self.assertNotEqual(exact,printed)
        self.assertEqual(exact-printed,-sp.Rational(1,350))
        self.assertTrue(sp.Rational('.855')<exact<sp.Rational('.865'))
        original=self.sources['C6-E003']
        self.assertFalse(any('arrotond' in b.get('text','').casefold() or 'simeq' in b.get('text','') or 'approx' in b.get('text','') for b in original['blocks']))
        # Projected-area detector satisfies source distances/filter, unless the
        # solution-only unchanged orientation is also made a prompt condition.
        intensityratio=sp.Rational(3,5)*sp.Rational(1,2)**2
        self.assertEqual(intensityratio,sp.Rational(3,20))
        rotated=intensityratio*sp.cos(sp.pi/3)
        self.assertEqual(rotated,sp.Rational(3,40));self.assertNotEqual(rotated,intensityratio)
        self.assertNotIn('orientazione',self.sources['C6-E004']['prompt'])
        self.assertIn('orientazione',self.sources['C6-E004']['blocks'][0]['text'])
        records=review.verify(self.sources)
        self.assertFalse(next(r for r in records if r['id']=='C6-E003')['ok'])
        self.assertFalse(next(r for r in records if r['id']=='C6-E004')['ok'])

if __name__=='__main__':unittest.main()
