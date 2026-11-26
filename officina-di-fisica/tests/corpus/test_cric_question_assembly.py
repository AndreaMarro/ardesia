"""Edition identity and protected exams through the existing family assembler."""
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest

from tools.corpus_engineering.pipeline import git_bytes, digest
from tools.corpus_engineering.vector_geometry_authoring import assemble_family
from tools.corpus_engineering.integration import exercise_package

APP = Path(__file__).resolve().parents[2]
REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
ASSET = 'wavelength-in-medium-progressive.svg'
TASK = ('Edition fixture', 'Qual è la somma di uno e uno?', ['2', '3'],
        'Sommiamo due unità.', '1+1=2', 'Tre contiene una unità in più.',
        'Conta due unità.')


def sources(course):
    return json.loads(git_bytes(APP.parent, REF, f'officina-di-fisica/content/{course}.json'))


def build(ids, course='C1', overrides=None):
    return assemble_family(APP.parent, REF, 'edition-fixture', [TASK] * len(ids),
                           {i: 0 for i in range(1, len(ids) + 1)}, {}, ASSET, {}, 0,
                           source_path=f'officina-di-fisica/content/{course}.json',
                           source_origin='cric', source_ids=ids, overrides=overrides)


class CricQuestionAssembly(unittest.TestCase):
    def test_mixed_original_editions_keep_ids_metadata_and_exact_bindings(self):
        originals = {r['id']: r for r in sources('C1')}
        ids = ['C1-Q001', 'C1-Q002']
        self.assertEqual([originals[k]['version'] for k in ids], [1, 2])
        package, bindings = build(ids)
        for row, binding, key in zip(package['records'], bindings, ids, strict=True):
            old = originals[key]
            self.assertEqual(row['id'], key)
            self.assertEqual((row['baseVersion'], row['version']), (old['version'], old['version'] + 1))
            for field in ['course', 'skill', 'order', 'prerequisites', 'family', 'difficulty']:
                self.assertEqual(row[field], old[field])
            self.assertEqual(binding['sourceId'], key)
            self.assertEqual(binding['sourceSha256'], digest(old))
            self.assertEqual(binding['candidateSha256'], digest(row))
            self.assertEqual(binding['provenance']['sourceOrigin'], 'cric')
            self.assertEqual(binding['provenance']['sourceVersion'], old['version'])
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'edition-fixture.json'
            path.write_text(json.dumps(package))
            result = exercise_package(path)
        self.assertEqual(result['firstImport']['saved'], 2)
        self.assertEqual(result['repeatedImport']['saved'], 0)
        self.assertEqual(result['repeatedImport']['unchanged'], 2)
        self.assertEqual(result['preservedLiveHeads'], 2)
        self.assertEqual(result['beforePublishedSha256'], result['afterPublishedSha256'])
        self.assertEqual(result['beforePublishedCount'], 991)

    def test_protected_exam_cannot_be_removed_or_rebound_by_overrides(self):
        old = next(r for r in sources('C6') if r.get('exam'))
        package, _ = build([old['id']], 'C6')
        self.assertEqual(package['records'][0]['exam'], old['exam'])
        for change in [{'exam': None}, {'exam': {'id': 'other'}}, {'id': 'C6-Q999'},
                       {'version': 999}, {'baseVersion': 0}, {'kind': 'lesson'},
                       {'course': 'C1'}, {'skill': 'C1-L001'}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                build([old['id']], 'C6', {1: change})

    def test_invalid_or_unbounded_source_selection_is_rejected(self):
        for ids in [[], ['C1-Q001', 'C1-Q001'], ['C1-Q999'], ['C1-L001'], ['C1-Q001'] * 101]:
            with self.subTest(ids=ids[:2]), self.assertRaises(ValueError):
                build(ids)

    def test_existing_ardesia_output_is_byte_equivalent(self):
        from tools.corpus_engineering.wavelength_in_medium_authoring import assemble
        package, bindings = assemble(APP.parent, '5cfbdcb055ba3ba136f97fb56e997f06e6cf3605')
        self.assertEqual(package, json.loads((APP / 'editorial/batches/wavelength-in-medium-240.json').read_bytes()))
        self.assertEqual(bindings, json.loads((APP / 'editorial/batches/wavelength-in-medium-240-bindings.json').read_bytes()))
