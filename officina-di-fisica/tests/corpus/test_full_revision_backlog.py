"""Recovered technical checks must remain in the full editorial revision backlog."""
from pathlib import Path
import unittest
from tools.corpus_engineering.pipeline import load_checkpoint

APP=Path(__file__).resolve().parents[2]

class FullRevisionBacklog(unittest.TestCase):
    def test_every_unrevised_record_is_explicitly_pending_even_after_partial_checks(self):
        questions,_,metadata=load_checkpoint(APP/'editorial/corpus')
        expected=sorted(row['id'] for row in questions if row['state']!='REVISED_DRAFT')
        self.assertEqual(metadata['pendingFullQuestionRevisionIds'],expected)
        self.assertEqual(len(expected),len(questions)-metadata['revisedDraftCount'])
        recovered={row['id'] for row in questions if row['state']!='REVISED_DRAFT'
          and any(proof['kind']=='recovered_upstream_technical_verification' for proof in row['evidence'])}
        self.assertTrue(recovered,'Fixture must exercise the recovered partial-check distinction')
        self.assertTrue(recovered.issubset(set(metadata['pendingFullQuestionRevisionIds'])))
        # Preserve the older, narrower queue for consumers tracking independent solving.
        self.assertEqual(set(metadata['pendingQuestionIds']),
          {row['id'] for row in questions if row['review']['independentSolution']=='NOT_RUN'})
