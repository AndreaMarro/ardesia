"""Verify persisted V2 evidence and fail closed on broken context bindings."""
import shutil
import tempfile
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

from tools.corpus_engineering import experiment_visibility_request as visibility


APP = Path(__file__).resolve().parents[2]
EVIDENCE = APP / 'editorial/reviews/isolated-baseline-root-20261127/actual-opt-in11'


class IsolatedBaselineReportTests(unittest.TestCase):
    def setUp(self):
        self.plan = visibility.load(EVIDENCE / 'prepared.json')
        self.protocol_sha = visibility.load(EVIDENCE / 'terminal-receipt.json')['protocolSha256']

    def copy_evidence(self):
        directory = Path(self.enterContext(tempfile.TemporaryDirectory())) / 'report'
        return shutil.copytree(EVIDENCE, directory)

    def mutate_case(self, directory, mutate):
        report_file = directory / 'report.json'
        report = visibility.load(report_file)
        item = next(case for case in report['cases'] if '|clock|' in case['caseKey'])
        path = directory / item['file']
        case = visibility.load(path)
        mutate(case['baselineReference'])
        raw = visibility.canonical(case) + b'\n'
        path.write_bytes(raw)
        item['sha256'] = visibility.sha(raw)
        report_file.write_bytes(visibility.canonical(report) + b'\n')

    def test_actual_v2_report_binds_all_seven_interactions(self):
        report = visibility.verify_report(EVIDENCE, self.plan, self.protocol_sha)
        self.assertEqual(len(report['cases']), 11)
        self.assertEqual(sum(not row['caseKey'].endswith('|setup') for row in report['cases']), 7)
        self.assertEqual(report['activityCredit'], 0)

    def test_rehashed_case_cannot_claim_another_realm(self):
        directory = self.copy_evidence()
        self.mutate_case(directory, lambda row: row.update(realmId='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'))
        with self.assertRaisesRegex(ValueError, 'realm differs'):
            visibility.verify_report(directory, self.plan, self.protocol_sha)

    def test_rehashed_case_cannot_omit_reference_clock_input(self):
        directory = self.copy_evidence()
        self.mutate_case(directory, lambda row: row.pop('clockTime'))
        with self.assertRaisesRegex(ValueError, 'clock input differs'):
            visibility.verify_report(directory, self.plan, self.protocol_sha)

    def test_historical_reference_kind_is_retired_for_new_runs(self):
        schema = Draft202012Validator(visibility.load(visibility.SCHEMA))
        request = visibility.load(EVIDENCE / 'executed-request.json')
        schema.validate(request)
        request['numericalReference']['kind'] = visibility.HISTORICAL_REFERENCE_KIND
        self.assertFalse(schema.is_valid(request))
        del request['numericalReference']
        del request['protocolFiles'][visibility.BASELINE_HELPER]
        schema.validate(request)
