"""All registered drafts coexist privately and exercise the existing study domain."""
from pathlib import Path
import json
import unittest
import tempfile
from types import SimpleNamespace
from unittest.mock import patch
from tools.corpus_engineering.integration import exercise_registry

APP=Path(__file__).resolve().parents[2]

class RegistryCoexistence(unittest.TestCase):
    def test_all_batches_share_one_disposable_database_without_publication(self):
        registry=json.loads((APP/'editorial/batches/registry.json').read_text())
        expected={key for batch in registry['batches'] for key in batch['questionIds']}
        result=exercise_registry()
        self.assertEqual({row['id'] for row in result['records']},expected)
        self.assertEqual(result['firstImportSaved'],result['candidateCount'])
        self.assertEqual(result['repeatedImportSaved'],0)
        self.assertEqual(result['repeatedImportUnchanged'],result['candidateCount'])
        self.assertEqual(result['beforePublishedSha256'],result['afterPublishedSha256'])
        self.assertEqual(result['beforePublishedCount'],result['afterPublishedCount'])
        self.assertEqual(result['learnerAttemptsBefore'],result['learnerAttemptsAfter'])
        self.assertEqual(result['newPublications'],0)
        self.assertEqual(result['humanApproval'],'NOT_RUN')
        self.assertEqual(result['learningEvidence'],'synthetic_private_fixtures_only')
        self.assertTrue(all(row['grading'] and row['graphReferences'] and row['repetitionIsNotTransfer']
          and row['assistanceIsNotAutonomy'] and row['delayedDistinctTransfer'] for row in result['records']))

    def test_a_changed_package_or_registry_cannot_inherit_the_completed_run(self):
        from tools.corpus_engineering import integration,batches,runtime_fingerprint
        for changed in ('package','registry'):
            with self.subTest(changed=changed),tempfile.TemporaryDirectory() as home:
                app=Path(home);folder=app/'editorial/batches';folder.mkdir(parents=True)
                package=folder/'fixture.json';registry=folder/'registry.json'
                package.write_text('{}');registry.write_text('{}')
                def child(*args,**kwargs):
                    (package if changed=='package' else registry).write_text('{"changed":true}')
                    return SimpleNamespace(returncode=0,stdout='{}')
                with patch.object(integration,'APP',app),patch.object(integration,'assert_bundled_runtime'),patch.object(batches,'load_registry',return_value=[{'id':'fixture'}]),patch.object(batches,'load_activity_registry',return_value=[]),patch.object(runtime_fingerprint,'runtime_fingerprint',return_value={}),patch.object(integration.subprocess,'run',side_effect=child):
                    with self.assertRaisesRegex(ValueError,'changed during'):
                        integration.exercise_registry()

    def test_discovery_cannot_bind_old_names_to_a_new_registry_digest(self):
        from tools.corpus_engineering import integration,batches,runtime_fingerprint
        with tempfile.TemporaryDirectory() as home:
            app=Path(home);folder=app/'editorial/batches';folder.mkdir(parents=True)
            (folder/'fixture.json').write_text('{}');registry=folder/'registry.json'
            registry.write_text('{"batches":[{"id":"fixture"}]}')
            def discover(*args):
                registry.write_text('{"batches":[{"id":"fixture"},{"id":"not-exercised"}]}')
                return [{'id':'fixture'}]
            with patch.object(integration,'APP',app),patch.object(integration,'assert_bundled_runtime'),patch.object(batches,'load_registry',side_effect=discover),patch.object(batches,'load_activity_registry',return_value=[]),patch.object(runtime_fingerprint,'runtime_fingerprint',return_value={}),patch.object(integration.subprocess,'run',return_value=SimpleNamespace(returncode=0,stdout='{}')):
                with self.assertRaisesRegex(ValueError,'changed during'):
                    integration.exercise_registry()
