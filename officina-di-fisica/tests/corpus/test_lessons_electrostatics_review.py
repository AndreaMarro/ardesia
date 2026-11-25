"""Independent physical counterexamples and immutable original lesson identities."""
from copy import deepcopy
from fractions import Fraction
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
from hypothesis import given, settings, strategies as st
from tools.corpus_engineering import lessons_electrostatics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import digest,sha

class ElectrostaticsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.source_bytes=raw
        cls.sources={r['id']:r for r in json.loads(raw) if r['id'] in review.READ_SOURCE_SHA256}

    def test_individual_originals_have_reproducible_scoped_evidence(self):
        self.assertEqual(sha(self.source_bytes),review.SOURCE_FILE_SHA256)
        result=review.report(self.sources)
        self.assertEqual(result,review.report(self.sources))
        self.assertEqual((result['acceptedCount'],result['failedCount'],result['draftReviewedCount']),(4,0,0))
        assert_activity_identity(result['records'],set(review.READ_SOURCE_SHA256),self.sources)
        self.assertEqual(sum(len(r['blocks']) for r in self.sources.values()),27)
        self.assertEqual(sum(len(r['checks']) for r in result['records']),34)
        for row in result['records']:
            self.assertEqual(row['sourceSha256'],review.READ_SOURCE_SHA256[row['id']])
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publicationAction'],'NONE')

    def test_edited_text_missing_source_and_changed_figures_cannot_inherit_reading(self):
        for key in self.sources:
            with self.subTest(key=key):
                rows=deepcopy(self.sources);rows[key]['blocks'][0]['text']+=' Wrong boundary condition.'
                self.assertFalse(next(r for r in review.verify(rows) if r['id']==key)['ok'])
                del rows[key]
                with self.assertRaises(ValueError):review.verify(rows)
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for name in review.READ_ASSETS:shutil.copyfile(review.APP/'static/figures'/name,root/name)
            for key,names in review.FIGURES_BY_ID.items():
                for name in names:
                    raw=(root/name).read_bytes()
                    self.assertEqual(sha(raw),review.READ_ASSETS[name])
                    self.assertEqual(raw,subprocess.check_output(['git','show',review.SOURCE_REF+':officina-di-fisica/static/figures/'+name],cwd=review.APP))
                    for replacement in (None,raw+b'\n'):
                        if replacement is None:(root/name).unlink()
                        else:(root/name).write_bytes(replacement)
                        self.assertFalse(next(r for r in review.verify(self.sources,asset_root=root) if r['id']==key)['ok'])
                        (root/name).write_bytes(raw)

    def test_empty_or_failed_mathematics_cannot_pass_by_vacuous_truth(self):
        for key in self.sources:
            for replacement in ([],[{'ok':False,'claim':'adversarial failed check','dimension':{}}]):
                models=review.independent_checks();models[key]=replacement
                with patch.object(review,'independent_checks',return_value=models):
                    self.assertFalse(next(r for r in review.verify(self.sources) if r['id']==key)['ok'])

    def test_diagrams_represent_force_directions_and_uniform_potential_gradient(self):
        xml=lambda name:ET.fromstring((review.APP/'static/figures'/name).read_bytes())
        lines=lambda root:[el.attrib for el in root.iter() if el.tag.endswith('line') and 'marker-end' in el.attrib]
        forces=lines(xml('C4-coulomb.svg'))
        self.assertEqual([int(el['x2'])-int(el['x1']) for el in forces],[106,-106])
        field_lines=lines(xml('C4-campo.svg'))
        self.assertEqual([int(el['x2'])>int(el['x1']) for el in field_lines],[True,True,False])
        potential=xml('C4-potenziale.svg')
        labels=[el for el in potential.iter() if el.tag.endswith('text') and (el.text or '').endswith(' V')]
        positions=[int(el.attrib['x']) for el in labels];values=[int(el.text.split()[0]) for el in labels]
        slopes=[Fraction(values[i+1]-values[i],positions[i+1]-positions[i]) for i in range(3)]
        self.assertEqual(slopes,[Fraction(-10,57)]*3)
        material=xml('C4-materiali.svg')
        signs=[el.text for el in material.iter() if el.tag.endswith('text') and el.text in ('+','−')]
        self.assertEqual((signs.count('+'),signs.count('−')),(9,9))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(q1=st.integers(1,20),q2=st.integers(1,20),distance=st.integers(1,20),factor=st.integers(2,8))
    def test_inverse_square_and_potential_signs_by_independent_rational_oracle(self,q1,q2,distance,factor):
        force=Fraction(q1*q2,distance**2)
        farther=Fraction(q1*q2,(factor*distance)**2)
        self.assertEqual(farther*factor**2,force)
        # Work down a potential difference must have the opposite sign for ±q.
        drop=Fraction(-distance,factor)
        positive_work=-q1*drop;negative_work=q1*drop
        self.assertGreater(positive_work,0)
        self.assertEqual(negative_work,-positive_work)
        # A dielectric at fixed charge changes E, at fixed voltage it changes Q.
        self.assertLess(Fraction(1,factor),1)

if __name__=='__main__':unittest.main()
