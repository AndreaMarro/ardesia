"""Independent geometricoptics originaljudgments with two sourceprecision findings."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp

from tools.corpus_engineering import examples_optics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class OpticsExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_original_judgments_preserve_two_failures_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(17,21)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 2, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 29)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertEqual(all(c['ok'] for c in row['checks']),row['id'] not in review.SOURCE_ISSUES)
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_three_assets_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'example'},
                         {f'C5-E{i:03}' for i in range(1,21)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_missing_and_empty_reviews_cannot_inherit_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed electrical condition'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok'])
                self.assertTrue(any('differs from independently read' in error for error in changed['errors']))
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)
            for replacement in ([], [{'ok': False, 'claim': 'failed independent check', 'dimension': {}}]):
                models = review.independent_checks()
                models[key] = replacement
                with patch.object(review, 'independent_checks', return_value=models):
                    result=next(r for r in review.verify(self.sources) if r['id']==key)
                    self.assertFalse(result['ok'])
                    self.assertIn('Independent example mathematics failed',result['errors'])

    def test_each_original_figure_requires_exact_bytes(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            for name in review.READ_ASSETS:
                shutil.copyfile(review.APP/'static/figures'/name, root/name)
            for key, names in review.FIGURES_BY_ID.items():
                for name in names:
                    file = root/name
                    raw = file.read_bytes()
                    for replacement in (None, raw+b'\n'):
                        with self.subTest(key=key, asset=name, missing=replacement is None):
                            if replacement is None:
                                file.unlink()
                            else:
                                file.write_bytes(replacement)
                            changed=next(r for r in review.verify(self.sources,asset_root=root) if r['id']==key)
                            self.assertFalse(changed['ok'])
                            self.assertIn('Historical example figure changed or missing',changed['errors'])
                            file.write_bytes(raw)

    def test_two_failures_are_different_exact_chain_and_optional_rounding(self):
        records={r['id']:r for r in review.verify(self.sources)}
        checkmap=lambda key:{c['claim']:c for c in records[key]['checks']}
        bad17=checkmap('C5-E017')['source exactthetaequalsasinrounded471 wouldrequirezerosquaredsinegap']
        self.assertFalse(bad17['ok'])
        self.assertEqual(sp.Rational(bad17['residual']),sp.Rational(3431,9000000))
        self.assertGreater(sp.Rational(2,9)-sp.Rational(471,1000)**2,0)
        checks18=checkmap('C5-E018')
        self.assertTrue(checks18['actual40deg transmittedangle above58point65']['ok'])
        self.assertTrue(checks18['actual40deg transmittedangle below58point75']['ok'])
        self.assertTrue(checks18['critical48point8 nearesttenth valid']['ok'])
        self.assertFalse(checks18['source58point8 nearesttenth wouldrequireangleatleast58point75']['ok'])
        self.assertTrue(checks18['independent directround58point7 interval holds']['ok'])
        report=review.report(self.sources)
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E017','C5-E018'])
        for key in ('C5-E017','C5-E018'):
            self.assertTrue(records[key]['failedPublishedEdition'])
            self.assertEqual(records[key]['manualFeasibility'],'FAIL_ORIGINAL_EDITION')

    def test_valid_lenses_and_physical_classification_are_retained(self):
        groups=review.independent_checks()
        get=lambda key,claim:next(c for c in groups[key] if c['claim']==claim)
        self.assertEqual(get('C5-E019','actual realimage distance15cm')['independentExact'],'15')
        self.assertEqual(get('C5-E019','actual imageheightnegative1point5cm')['independentExact'],'-3/2')
        self.assertEqual(get('C5-E020','actual virtualimage distance minus12cm')['independentExact'],'-12')
        self.assertEqual(get('C5-E020','actual uprightmagnificationplus2')['independentExact'],'2')
        self.assertTrue(get('C5-E018','40degree Snell upperbound belowone')['ok'])
        self.assertTrue(get('C5-E018','55degree Snell lowerbound aboveone')['ok'])
        q=lambda f,p:sp.Rational(f*p,p-f)
        self.assertEqual((q(10,30),-q(10,30)/30*3),(15,-sp.Rational(3,2)))
        self.assertEqual((q(12,6),-q(12,6)/6),(-12,2))
        self.assertFalse(sp.asin(sp.sqrt(2)/3).atoms(sp.Float))


if __name__ == '__main__':
    unittest.main()
