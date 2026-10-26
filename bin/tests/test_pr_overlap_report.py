"""Run: python3 -m unittest discover -s bin/tests -p test_pr_overlap_report.py"""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

SRC = Path(__file__).parents[1] / 'ci' / 'pr_overlap_report.py'
spec = importlib.util.spec_from_file_location('pr_overlap_report', SRC)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

class OverlapTest(unittest.TestCase):
    def test_root_collision_and_independent_file(self):
        result = audit.summarize({'status': 'MEASURED', 'pullRequests': [
            {'number': 315, 'files': ['apps/web/src/components/Shell.tsx', 'apps/web/src/App.tsx']},
            {'number': 316, 'files': ['apps/web/src/components/Shell.tsx']},
            {'number': 309, 'files': ['apps/web/src/features/independent-study/IndependentStudy.tsx']} ]})
        self.assertEqual(result['openPrs'], 3)
        self.assertEqual(result['overlaps'], [{'path': 'apps/web/src/components/Shell.tsx',
                                               'prs': [315, 316], 'kind': 'INTEGRATION_SEAM'}])
        self.assertIn('not proof of Git conflicts', ' '.join(result['limits']))

    def test_fail_closed_on_incomplete_inventory(self):
        with self.assertRaises(ValueError):
            audit.summarize({'pullRequests': [{'number': 1}]})
        with self.assertRaises(ValueError):
            audit.summarize({'pullRequests': [{'number': 1, 'files': []}, {'number': 1, 'files': []}]})

    def test_pages_and_live_base_epoch(self):
        original = {'base': {'ref': 'main'}, 'head': {'sha': 'h'}, 'number': 12, 'draft': True}
        def fake(path, pages=False):
            if '/branches/' in path: return {'commit': {'sha': 'base'}}
            if 'pulls?state=' in path: return [original]
            return [{'filename': 'apps/studio/src/Room.tsx'}]
        with patch.object(audit, 'gh', side_effect=fake):
            result = audit.live('AndreaMarro/ardesia', 'main')
        self.assertEqual(result['status'], 'MEASURED')
        self.assertEqual(result['pullRequests'][0]['headSha'], 'h')

if __name__ == '__main__': unittest.main()
