"""Regression candidate for S00; source copies only, no running checkout edits.

Run with ARDESIA_S01_ENGINE_ROOT pointing to the engine being evaluated.
The broken production behavior is a snapshot tagged with on-disk code that
the current Python process has never loaded. No model, store or auth is mocked.
"""
import hashlib
import json
import os
from pathlib import Path
import py_compile
import shutil
import subprocess
import sys
import tempfile
import unittest


def fresh_process(engine):
    sys.path.insert(0, str(engine))
    from lessonos.study.models import StudyError
    from lessonos.study.science_library import models, resources
    from lessonos.study.store import StudyStore

    payload = json.load(sys.stdin)
    result = {
        'value': models.evaluate('point-charge-v1', {})['value'],
        'snapshotHash': resources.new_snapshot('point-charge-v1', {})['implementationSha256'],
    }
    if payload:
        store = StudyStore(payload['db'])
        try:
            principal = store.principal_for_session(payload['session'])
            saved = resources.read(store, principal, payload['resourceId'], payload['revisionId'])
            result.update(supported=saved['supported'], note=saved['snapshot']['note'],
                          revealedResult='result' in saved)
            try:
                resources.compare(store, principal, payload['resourceId'], payload['revisionId'], '100')
            except StudyError as error:
                result['compareError'] = {'code': error.code, 'status': error.status}
        finally:
            store.close()
    print(json.dumps(result))


def live_process(engine, stage):
    sys.path.insert(0, str(engine))
    from lessonos.study.science_library import models

    model_path = engine / 'lessonos/study/science_library/models.py'
    before = model_path.read_bytes()
    loaded_hash = hashlib.sha256(before).hexdigest()
    before_value = models.evaluate('point-charge-v1', {})['value']
    payload = {}
    store = None
    if stage == 'after_resources':
        from lessonos.study.science_library import resources
        from lessonos.study.store import StudyStore
        store = StudyStore(engine.parent / 'synthetic.sqlite')
        teacher = store.create_principal('runtime-proof-tutor', 'teacher')
        student = store.create_principal('runtime-proof-student', 'student')
        store.create_edition(teacher, 'fluidi')
        store.add_test_member(teacher, 'fluidi', student.id)
        original = resources.new_snapshot('point-charge-v1', {}, note='Ragionamento sintetico conservato')
        saved = resources.save(store, student, 'fluidi', original, 'runtime-proof-save')
        payload = {'db': str(store.path), 'session': store.issue_session(student),
                   'resourceId': saved['resource']['id'], 'revisionId': saved['resource']['revisionId']}
    assert before.count(b'k = 9e9') == 1, 'Counterexample fixture no longer matches the pinned source'
    model_path.write_bytes(before.replace(b'k = 9e9', b'k = 8e9'))
    from lessonos.study.science_library import resources
    snapshot = resources.new_snapshot('point-charge-v1', {})
    report = {
        'stage': stage, 'loadedHash': loaded_hash,
        'diskHash': hashlib.sha256(model_path.read_bytes()).hexdigest(),
        'snapshotHash': snapshot['implementationSha256'],
        'beforeValue': before_value, 'loadedValue': models.evaluate('point-charge-v1', {})['value'],
    }
    try:
        if store is not None:
            current = resources.read(store, student, payload['resourceId'], payload['revisionId'])
            report['liveSavedSupported'] = current['supported']
            if current['supported']:
                report['liveComparedValue'] = resources.compare(
                    store, student, payload['resourceId'], payload['revisionId'], '100')['result']['value']
        fresh = subprocess.run(
            [sys.executable, '-I', '-B', __file__, '--fresh', str(engine)],
            input=json.dumps(payload), capture_output=True, text=True, timeout=15, check=True)
        report['fresh'] = json.loads(fresh.stdout)
    finally:
        if store is not None:
            store.close()
    print(json.dumps(report))


class RuntimeIdentityTests(unittest.TestCase):
    def test_timestamp_bytecode_cache_cannot_mislabel_the_executed_source(self):
        engine = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory(prefix='science-pyc-') as temporary:
            copy = Path(temporary) / 'engine'
            shutil.copytree(engine / 'lessonos', copy / 'lessonos', ignore=shutil.ignore_patterns('__pycache__'))
            path = copy / 'lessonos/study/science_library/models.py'
            original = path.read_bytes()
            py_compile.compile(str(path), doraise=True,
                               invalidation_mode=py_compile.PycInvalidationMode.TIMESTAMP)
            stat = path.stat()
            changed = original.replace(b'k = 9e9', b'k = 8e9')
            self.assertNotEqual(changed, original)
            self.assertEqual(len(changed), len(original))
            path.write_bytes(changed)
            os.utime(path, ns=(stat.st_atime_ns, stat.st_mtime_ns))
            fresh = subprocess.run([sys.executable, '-I', '-B', __file__, '--fresh', str(copy)],
                                   input='{}', capture_output=True, text=True, timeout=15, check=True)
            actual = json.loads(fresh.stdout)
        self.assertEqual(actual['snapshotHash'], hashlib.sha256(changed).hexdigest())
        self.assertAlmostEqual(actual['value'], 88.88888888888889)

    def probe(self, stage):
        engine = Path(os.environ.get('ARDESIA_S01_ENGINE_ROOT', str(Path(__file__).resolve().parents[2])))
        self.assertTrue((engine / 'lessonos/study/science_library/models.py').is_file())
        with tempfile.TemporaryDirectory(prefix='s01-identity-') as temporary:
            copy = Path(temporary) / 'engine'
            shutil.copytree(engine / 'lessonos', copy / 'lessonos', ignore=shutil.ignore_patterns('__pycache__'))
            process = subprocess.run(
                [sys.executable, '-I', '-B', __file__, '--probe', str(copy), stage],
                capture_output=True, text=True, timeout=15, check=True)
            report = json.loads(process.stdout)
        output = os.environ.get('ARDESIA_S01_PROBE_OUTPUT')
        if output:
            target = Path(output) / (self._testMethodName + '.json')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps(report, indent=2) + '\n')
        self.assertNotEqual(report['loadedHash'], report['diskHash'])
        self.assertEqual(report['beforeValue'], 100)
        self.assertEqual(report['loadedValue'], 100)
        self.assertEqual(report['fresh']['snapshotHash'], report['diskHash'])
        self.assertAlmostEqual(report['fresh']['value'], 88.88888888888889)
        return report

    def test_snapshot_after_disk_edit_identifies_the_code_actually_loaded(self):
        report = self.probe('after_resources')
        self.assertEqual(report['snapshotHash'], report['loadedHash'])

    def test_late_resources_import_keeps_the_previously_loaded_model_identity(self):
        report = self.probe('before_resources')
        self.assertEqual(report['snapshotHash'], report['loadedHash'])

    def test_saved_revision_remains_comparable_in_the_original_process(self):
        report = self.probe('after_resources')
        self.assertTrue(report['liveSavedSupported'])
        self.assertEqual(report['liveComparedValue'], 100)

    def test_new_process_reopens_note_and_refuses_the_old_implementation(self):
        report = self.probe('after_resources')
        self.assertFalse(report['fresh']['supported'])
        self.assertEqual(report['fresh']['note'], 'Ragionamento sintetico conservato')
        self.assertFalse(report['fresh']['revealedResult'])
        self.assertEqual(report['fresh']['compareError'],
                         {'code': 'capability_version_unavailable', 'status': 409})


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--probe':
        live_process(Path(sys.argv[2]), sys.argv[3])
    elif len(sys.argv) > 1 and sys.argv[1] == '--fresh':
        fresh_process(Path(sys.argv[2]))
    else:
        unittest.main()
