"""Independent circuit-domain and provenance checks for four original lessons."""
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

from tools.corpus_engineering import lessons_circuits_basics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class CircuitsBasicsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C4.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_original_circuit_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C4-L05', 'C4-L06', 'C4-L07', 'C4-L08'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 48)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_four_assets_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'lesson'},
                         {f'C4-L{i:02}' for i in range(1, 11)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_missing_and_empty_reviews_cannot_inherit_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed electrical condition'
                self.assertFalse(next(r for r in review.verify(sources) if r['id'] == key)['ok'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)
            for replacement in ([], [{'ok': False, 'claim': 'failed independent check', 'dimension': {}}]):
                models = review.independent_checks()
                models[key] = replacement
                with patch.object(review, 'independent_checks', return_value=models):
                    self.assertFalse(next(r for r in review.verify(self.sources) if r['id'] == key)['ok'])

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
                            self.assertFalse(next(r for r in review.verify(self.sources, asset_root=root) if r['id'] == key)['ok'])
                            file.write_bytes(raw)

    def test_passive_power_and_capacitor_constraints_have_distinct_outcomes(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['average current preserves charge sign']['independentExact'], '-2')
        self.assertEqual(checks['toy dielectricfactor2 fixedQ halves9J']['independentExact'], '9/2')
        self.assertEqual(checks['toy dielectricfactor2 fixedV doubles9J']['independentExact'], '18')
        self.assertEqual(checks['variable power needs time integral not arbitrary constant']['independentExact'], '9')
        self.assertEqual(checks['opposite charged equal capacitors cancel voltage']['independentExact'], '0')
        # Additional probes deliberately choose domains excluded from a naive shortcut.
        r = sp.Symbol('r', positive=True)
        power = 36*r/(r+2)**2  # fixed6V source and another2ohm series member
        self.assertEqual(power.subs(r, 2), sp.Rational(9, 2))
        self.assertEqual(power.subs(r, 8), sp.Rational(72, 25))
        self.assertLess(power.subs(r,8),power.subs(r,2))
        # Charged floating middle: C1=C2=1F, VA=3V, VB=0, Qmiddle=1C.
        vm=sp.solve(sp.Eq((r-3)+r,1),r)[0]
        self.assertEqual(vm,2)
        self.assertEqual((3-vm,vm),(1,2))
        self.assertNotEqual(3-vm,vm)
        # Signed charge and energy in joining1F at+3V to1F at-1V.
        vf=sp.Rational(3-1,2)
        self.assertEqual(vf,1)
        self.assertEqual(sp.Rational(3**2+1,2)-vf**2,4)

    def test_diagrams_show_positive_slope_field_direction_and_open_capacitor_gaps(self):
        def lines(name):
            root=ET.fromstring((review.APP/'static/figures'/name).read_bytes())
            return [e.attrib for e in root.iter() if e.tag.endswith('line')]
        ohm=lines('C4-ohm.svg')
        law=next(e for e in ohm if e.get('stroke-width')=='3.2')
        self.assertEqual((law['x1'],law['y1']),('85','199'))
        self.assertGreater(int(law['x2']),int(law['x1']))
        self.assertLess(int(law['y2']),int(law['y1']))
        fields=[e for e in lines('C4-condensatore.svg') if 'marker-end' in e]
        self.assertEqual(len(fields),5)
        for e in fields:
            self.assertEqual(e['x1'],e['x2'])
            self.assertGreater(int(e['y2']),int(e['y1']))
        wires=lines('C4-reti-c.svg')
        horizontal=[e for e in wires if e['y1']==e['y2']]
        for gap,y in [((98,106),117),((209,217),117),((467,475),71),((467,475),160)]:
            self.assertFalse(any(int(e['y1'])==y and min(int(e['x1']),int(e['x2']))<=gap[0]
                                 and max(int(e['x1']),int(e['x2']))>=gap[1] for e in horizontal))


if __name__ == '__main__':
    unittest.main()
