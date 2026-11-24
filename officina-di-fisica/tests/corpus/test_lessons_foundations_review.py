"""Whole-lesson reading integrity and precise scope of two original findings."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering import lessons_foundations_activity_verifier as review
from tools.corpus_engineering.pipeline import canonical,digest
from tools.corpus_engineering.batches import assert_activity_identity


class FoundationsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((review.APP/'content/C1.json').read_text())
                     if r['id'] in review.READ_SOURCE_SHA256}
        cls.package=json.loads((review.APP/'editorial/batches/lessons-foundations-revisions-054.json').read_text())
        cls.bindings=json.loads((review.APP/'editorial/batches/lessons-foundations-revisions-054-bindings.json').read_text())

    def test_original_findings_do_not_claim_false_motion_or_failed_formulas(self):
        report=review.report(self.sources)
        self.assertEqual(report,review.report(self.sources))
        self.assertEqual(report,json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'],report['failedCount']),(2,2))
        self.assertEqual(sum(len(r['checks']) for r in report['records']),60)
        byid={r['id']:r for r in report['records']}
        self.assertEqual(byid['C1-L002']['publishedEditionIssue']['priority'],'P2')
        self.assertEqual(byid['C1-L003']['publishedEditionIssue']['priority'],'P3')
        for key in ('C1-L002','C1-L003'):
            self.assertEqual(sum(not c['ok'] for c in byid[key]['checks']),1)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)
        for row in report['records']:
            self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publicationAction'],'NONE')
            self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])

    def test_each_whole_lesson_change_invalidates_its_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources=deepcopy(self.sources)
                sources[key]['blocks'][0]['text']+=' changed scientific claim'
                row=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(row['ok'])
                self.assertIn('Lesson differs from independently read original',row['errors'])

    def test_each_missing_lesson_is_rejected(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources=dict(self.sources);del sources[key]
                with self.assertRaises(ValueError):review.verify(sources)

    def test_each_of_six_historical_figures_is_required_byte_exact(self):
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for name in review.READ_ASSETS:shutil.copyfile(review.APP/'static/figures'/name,root/name)
            for key,names in review.FIGURES_BY_ID.items():
                for name in names:
                    with self.subTest(key=key,figure=name):
                        file=root/name;raw=file.read_bytes()
                        for replacement in (None,raw+b'\n'):
                            if replacement is None:file.unlink()
                            else:file.write_bytes(replacement)
                            row=next(r for r in review.verify(self.sources,asset_root=root) if r['id']==key)
                            self.assertFalse(row['ok'])
                            self.assertIn('Historical lesson figure changed or missing',row['errors'])
                            file.write_bytes(raw)

    def test_mixed_lessons_keep_separate_historical_findings(self):
        report=review.report(self.sources,self.package,self.bindings)
        self.assertEqual((report['acceptedCount'],report['failedCount'],report['draftReviewedCount']),(4,0,2))
        self.assertEqual(sum(len(r['checks']) for r in report['records']),75)
        self.assertEqual(report,review.report(self.sources,self.package,self.bindings))
        self.assertEqual(report,json.loads(canonical(report)))
        assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources,
            {r['id']:r for r in self.package['records']},{b['id']:b for b in self.bindings})
        originals={r['id']:r for r in review.verify_originals(self.sources)}
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            if row['id'] in review.REVISION_IDS:
                self.assertEqual(row['publishedEditionReview'],originals[row['id']])
                self.assertFalse(row['publishedEditionReview']['ok'])
                self.assertTrue(row['failedPublishedEdition'])
                self.assertEqual((row['candidateVersion'],row['baseVersion'],row['publicationAction']),(2,1,'DRAFT'))

    def test_each_rebound_new_lesson_requires_fresh_reading(self):
        for key in review.REVISION_IDS:
            with self.subTest(key=key):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row=next(r for r in package['records'] if r['id']==key)
                row['blocks'][0]['text']+=' changed scientific condition'
                next(b for b in bindings if b['id']==key)['candidateSha256']=digest(row)
                result=next(r for r in review.verify(self.sources,package,bindings) if r['id']==key)
                self.assertFalse(result['ok'])
                self.assertIn('Independent reviewed signature mismatch',result['errors'])

    def test_source_and_edition_guards_survive_test_only_retoken(self):
        for key in review.REVISION_IDS:
            for field in ('sourceSha256','sourceRef','baseVersion','version','kind','answer'):
                with self.subTest(key=key,field=field):
                    package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                    row=next(r for r in package['records'] if r['id']==key)
                    binding=next(b for b in bindings if b['id']==key)
                    if field=='sourceRef':binding[field]='0'*40
                    elif field=='sourceSha256':binding[field]='0'*64
                    elif field=='kind':row[field]='example'
                    elif field=='answer':row[field]={'type':'numeric','value':1}
                    else:row[field]+=1
                    binding['candidateSha256']=digest(row)
                    token=digest({'record':row,'assets':binding['assetChecksums'],
                        'source':{'id':binding['sourceId'],'ref':binding['sourceRef'],'sha256':binding['sourceSha256']}})
                    with patch.dict(review.REVIEWED_REVISIONS,{key:token}):
                        result=next(r for r in review.verify(self.sources,package,bindings) if r['id']==key)
                    self.assertFalse(result['ok'])
                    self.assertNotIn('Independent reviewed signature mismatch',result['errors'])

    def test_all_four_new_package_assets_and_unique_identity_are_required(self):
        with self.assertRaises(ValueError):review.verify(self.sources,{'records':[],'assets':[]},[])
        package=deepcopy(self.package);package['records']+=package['records'][:1]
        with self.assertRaises(ValueError):review.verify(self.sources,package,self.bindings)
        with self.assertRaises(ValueError):review.verify(self.sources,self.package)
        self.assertEqual(len(self.package['assets']),4)
        for index in range(4):
            with self.subTest(asset=index):
                package=deepcopy(self.package)
                package['assets'][index]['data']='d3JvbmcgYXNzZXQ='
                with self.assertRaises(ValueError):review.verify(self.sources,package,self.bindings)


if __name__=='__main__':unittest.main()
