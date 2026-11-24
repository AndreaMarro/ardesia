"""Recovered technical checks must remain in the full editorial revision backlog."""
from pathlib import Path
import unittest
from tools.corpus_engineering.pipeline import load_checkpoint

APP=Path(__file__).resolve().parents[2]

class FullRevisionBacklog(unittest.TestCase):
    def assert_consistent_backlog(self,questions,metadata):
        expected=sorted(row['id'] for row in questions if row['state']!='REVISED_DRAFT')
        self.assertEqual(metadata['pendingFullQuestionRevisionIds'],expected)
        self.assertEqual(len(expected),len(questions)-metadata['revisedDraftCount'])
        recovered={row['id'] for row in questions if row['state']!='REVISED_DRAFT'
          and any(proof['kind']=='recovered_upstream_technical_verification' for proof in row['evidence'])}
        # This set legitimately becomes empty once every recovered ID is fully revised.
        self.assertTrue(recovered.issubset(set(metadata['pendingFullQuestionRevisionIds'])))
        # Preserve the older, narrower queue for consumers tracking independent solving.
        self.assertEqual(set(metadata['pendingQuestionIds']),
          {row['id'] for row in questions if row['review']['independentSolution']=='NOT_RUN'})

    def test_every_unrevised_record_is_explicitly_pending_even_after_partial_checks(self):
        questions,_,metadata=load_checkpoint(APP/'editorial/corpus')
        self.assert_consistent_backlog(questions,metadata)

    def test_a_completed_bookkeeping_fixture_can_have_no_partial_recoveries(self):
        # Synthetic bookkeeping only; no scientific verdict, database or approval is created.
        row={'id':'fixture-completed','state':'REVISED_DRAFT',
             'review':{'independentSolution':'PASS_AUTO'},'evidence':[{'kind':'reviewed_draft'}]}
        metadata={'revisedDraftCount':1,'pendingFullQuestionRevisionIds':[],'pendingQuestionIds':[]}
        self.assert_consistent_backlog([row],metadata)
