"""Real Studio entry payloads plus adversarial additive archive metadata."""
import hashlib
import json
from pathlib import Path
import zipfile

import pytest

from lessonos.ingest.bundle import read_bundle, journal_to_segments

FIX = Path(__file__).parent / 'fixtures' / 'studio_lesson_a'
SID = 'aaaaaaaa-1111-4111-8111-111111111111'


def baseline():
    manifest = json.loads((FIX / 'manifest.json').read_bytes())
    files = {e['path']: (FIX / e['path'].replace('/', '__')).read_bytes() for e in manifest['files']}
    return manifest, files


def write_bundle(tmp_path, manifest, files):
    path = tmp_path / 'test.lesson'
    with zipfile.ZipFile(path, 'w') as zf:
        zf.writestr('manifest.json', json.dumps(manifest))
        for name, value in files.items():
            zf.writestr(name, value)
    return str(path)


def add(manifest, files, path, data):
    files[path] = data
    manifest['files'].append({'path': path, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'required': False})
    manifest['files'].sort(key=lambda e: e['path'])


def pdf_archive():
    manifest, files = baseline()
    manifest['schemaVersion'] = 3
    manifest['compatibility']['minimumReaderSchemaVersion'] = 3
    manifest['optionalArtifacts'].append('raw/documents/*.pdf')
    # Header-only bytes test the archive contract, not PDF rendering.
    data = b'%PDF-1.7\ncontract fixture\n%%EOF\n'
    path = 'raw/documents/' + hashlib.sha256(data).hexdigest() + '.pdf'
    add(manifest, files, path, data)
    return manifest, files, path


@pytest.mark.parametrize('version', [1, 2, 3])
def test_versioned_archive_preserves_real_journal_and_missing_history(tmp_path, version):
    manifest, files = baseline()
    if version == 1:
        manifest = json.loads((FIX.parent / 'studio_lesson_a_v1_manifest.json').read_bytes())
    elif version == 3:
        manifest, files, _ = pdf_archive()
    result = read_bundle(write_bundle(tmp_path, manifest, files))
    assert result.manifest['schemaVersion'] == version
    assert result.events_jsonl.encode() == files['raw/events.jsonl']
    assert [s.text for s in journal_to_segments(result.events_jsonl, 'd2-lesson-a')] == [
        'La corrente è uguale in serie.', 'Legge di Ohm: $V = R I$.']
    if version >= 2:
        assert result.manifest['sessions'] == {'includedSessionIds': [], 'missingSessionIds': [SID]}


def test_included_session_is_hash_checked_without_becoming_journal(tmp_path):
    m, files = baseline()
    path = f'raw/sessions/{SID}/session.yaml'
    add(m, files, path, b'opaque session bytes\n')
    m['sessions'] = {'includedSessionIds': [SID], 'missingSessionIds': []}
    assert read_bundle(write_bundle(tmp_path, m, files)).events_jsonl.encode() == files['raw/events.jsonl']
    files[path] = b'tampered session bytes'
    with pytest.raises(ValueError):
        read_bundle(write_bundle(tmp_path, m, files))


@pytest.mark.parametrize('mutation', ['session_missing','session_foreign','session_duplicate','included_lie','compatibility','schema','lesson_os','pdf_hash','pdf_bytes','pdf_zero','pdf_wrong_schema','pdf_header','pdf_path'])
def test_rejects_inconsistent_extensions(tmp_path, mutation):
    m, files, pdf = pdf_archive()
    if mutation == 'session_missing': m.pop('sessions')
    elif mutation == 'session_foreign': m['sessionIds'] = []
    elif mutation == 'session_duplicate': m['sessionIds'].append(SID)
    elif mutation == 'included_lie': m['sessions'] = {'includedSessionIds': [SID], 'missingSessionIds': []}
    elif mutation == 'compatibility': m['compatibility']['minimumReaderSchemaVersion'] = 1
    elif mutation == 'schema': m['schemaVersion'] = 4
    elif mutation == 'lesson_os': m['lessonOs']['status'] = 'missing'
    elif mutation == 'pdf_hash': next(e for e in m['files'] if e['path'] == pdf)['sha256'] = '0' * 64
    elif mutation == 'pdf_bytes': next(e for e in m['files'] if e['path'] == pdf)['bytes'] = 21 * 1024 * 1024
    elif mutation == 'pdf_zero': next(e for e in m['files'] if e['path'] == pdf)['bytes'] = 0
    elif mutation == 'pdf_wrong_schema': m['schemaVersion'] = 2
    elif mutation in ['pdf_header','pdf_path']:
        data = b'not a PDF' if mutation == 'pdf_header' else files[pdf]
        new = 'raw/documents/' + hashlib.sha256(data).hexdigest() + ('.pdf' if mutation == 'pdf_header' else '/file.pdf')
        files.pop(pdf);m['files'] = [e for e in m['files'] if e['path'] != pdf]
        add(m, files, new, data)
    with pytest.raises(ValueError): read_bundle(write_bundle(tmp_path, m, files))
