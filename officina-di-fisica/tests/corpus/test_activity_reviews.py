from copy import deepcopy
from pathlib import Path
import json
import tempfile
import unittest

from tools.corpus_engineering.batches import load_activity_registry, load_registry, assert_activity_identity
from tools.corpus_engineering.pipeline import git_bytes,digest
from tools.corpus_engineering.method_activity_verifier import verify

APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'


class ActivityReviews(unittest.TestCase):
    def test_activity_revision_cannot_forge_source_candidate_version_or_approval(self):
        key='C1-E-test';source={'id':key,'kind':'example','version':1}
        candidate={**source,'version':2,'baseVersion':1}
        binding={'id':key,'sourceId':key,'sourceSha256':digest(source),'candidateSha256':digest(candidate)}
        result={'id':key,'sourceSha256':digest(source),'candidateSha256':digest(candidate),'ok':True,
                'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'DRAFT',
                'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':'Fixture only',
                'physicalAssumptions':'Fixture only','pedagogicalReview':'Fixture only','reviewedSignature':'c'*64,
                'candidateVersion':2,'baseVersion':1,'failedPublishedEdition':True,
                'publishedEditionReview':{'sourceSha256':digest(source),'ok':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}}
        assert_activity_identity([result],{key},{key:source},{key:candidate},{key:binding})
        for field,value in [('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','APPROVED'),('publicationAction','PUBLISHED')]:
            bad={**result,field:value}
            with self.assertRaises(ValueError):assert_activity_identity([bad],{key},{key:source},{key:candidate},{key:binding})
        with self.assertRaises(ValueError):assert_activity_identity([result],{key},{key:source},{key:candidate},{})
        bad={**candidate,'version':1,'baseVersion':0}
        with self.assertRaises(ValueError):assert_activity_identity([result],{key},{key:source},{key:bad},{key:binding})
        with self.assertRaises(ValueError):assert_activity_identity([{**result,'publishedEditionReview':None}],{key},{key:source},{key:candidate},{key:binding})
        contradictory={**result,'publicationAction':'NONE','failedPublishedEdition':True}
        with self.assertRaises(ValueError):assert_activity_identity([contradictory],{key},{key:source})

    def sources(self):
        return {r['id']:r for file in ('catalog.json','metodo.json')
                for r in json.loads(git_bytes(APP.parent,REF,'officina-di-fisica/content/'+file))}

    def test_each_existing_method_has_independent_exact_steps_and_manual_path(self):
        report=verify(self.sources())
        self.assertEqual(len(report),16)
        self.assertTrue(all(r['ok'] for r in report))
        self.assertTrue(all(r['manualArithmetic'] and r['humanApproval']=='NOT_RUN' for r in report))
        self.assertEqual(sum(r['calculationScope']=='NO_STUDENT_CALCULATION' for r in report),6)

    def test_source_change_cannot_inherit_review_even_if_key_is_unchanged(self):
        rows=self.sources();rows['C4-M-formula']['prompt']+=' La corrente cambia.'
        result=next(r for r in verify(rows) if r['id']=='C4-M-formula')
        self.assertFalse(result['ok'])
        self.assertIn('Source differs from independently read edition',result['errors'])

    def test_wrong_numeric_and_symbolic_steps_are_rejected_independently(self):
        for key,step,answer in [('C1-M-formula',3,5),('C3-M-formula',3,'p*V*n*R'),('C4-M-graph',2,2)]:
            rows=deepcopy(self.sources());rows[key]['steps'][step]['answer']=answer
            result=next(r for r in verify(rows) if r['id']==key)
            self.assertFalse(result['ok'])
            self.assertTrue(any('Independent step' in error for error in result['errors']))

    def test_duplicate_activity_ownership_is_rejected(self):
        value={'schemaVersion':'1.0.0','batches':[{'id':'questions-001','verifier':'units_verifier','questionIds':['AR-one']}],
               'activityBatches':[{'id':'method-001','verifier':'method_activity_verifier','activityIds':['C1']},
                                  {'id':'method-002','verifier':'method_activity_verifier','activityIds':['C1']}]}
        with tempfile.TemporaryDirectory() as home:
            file=Path(home)/'registry.json';file.write_text(json.dumps(value))
            with self.assertRaises(ValueError):load_registry(file)
            with self.assertRaises(ValueError):load_activity_registry(file)
