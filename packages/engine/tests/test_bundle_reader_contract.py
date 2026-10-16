"""Reader coherence, identity and bounded reads; no narrative/LLM claim."""
import hashlib
import json
import zipfile

import pytest

from lessonos.ingest import bundle
from tests.test_bundle_extensions import baseline, write_bundle
from tests.test_bundle_resource_limits import limits


class NoEffects:
    def __getattr__(self, name):
        pytest.fail(f'rejected bundle reached authoritative effect {name}')


@pytest.mark.parametrize('mutation', ['hash', 'inventory', 'duplicate', 'bytes_bool', 'schema_float', 'foreign_lesson', 'foreign_journal'])
def test_incoherent_bundle_rejected_before_effects(tmp_path, mutation):
    m, files = baseline()
    if mutation == 'hash': m['files'][0]['sha256'] = '0' * 64
    elif mutation == 'inventory': m['files'].pop()
    elif mutation == 'duplicate': m['files'].append(dict(m['files'][0]))
    elif mutation == 'bytes_bool': m['files'][0]['bytes'] = True
    elif mutation == 'schema_float': m['schemaVersion'] = 2.0
    elif mutation == 'foreign_lesson': m['lessonId'] = 'foreign'
    elif mutation == 'foreign_journal':
        data = files['raw/events.jsonl'].replace(b'd2-lesson-a', b'd2-lesson-b')
        files['raw/events.jsonl'] = data
        entry = next(e for e in m['files'] if e['path'] == 'raw/events.jsonl')
        entry.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    with pytest.raises(ValueError):
        bundle.ingest_bundle(write_bundle(tmp_path, m, files), NoEffects(), 'd2-lesson-a', router=NoEffects())


def test_manifest_budget_is_checked_before_payload_open(tmp_path, monkeypatch):
    m, files = baseline()
    path = write_bundle(tmp_path, m, files)
    limits(monkeypatch, max_manifest_bytes=4)
    monkeypatch.setattr(zipfile.ZipFile, 'open', lambda *a, **k: pytest.fail('oversize manifest was read'))
    with pytest.raises(ValueError, match='budget'):
        bundle.read_bundle(path)


def test_manifest_and_payloads_are_read_once_and_hash_checked(tmp_path, monkeypatch):
    m, files = baseline()
    path = write_bundle(tmp_path, m, files)
    calls = []
    original = zipfile.ZipFile.open
    def track(zf, info, *args, **kwargs):
        calls.append(info.filename)
        return original(zf, info, *args, **kwargs)
    monkeypatch.setattr(zipfile.ZipFile, 'open', track)
    monkeypatch.setattr(zipfile.ZipFile, 'read', lambda *a, **k: pytest.fail('unbounded/repeated read'))
    assert bundle.read_bundle(path).events_jsonl.encode() == files['raw/events.jsonl']
    assert sorted(calls) == sorted(['manifest.json', *files])


@pytest.mark.parametrize('snapshot', [None, b'', b'{opaque-corrupt-json}'])
def test_snapshot_presence_is_distinct_from_payload_validity(tmp_path, snapshot):
    m, files = baseline()
    path = 'raw/lessonos-events.jsonl'
    m['files'] = [e for e in m['files'] if e['path'] != path]
    files.pop(path)
    if snapshot is not None:
        files[path] = snapshot
        m['files'].append(dict(path=path, bytes=len(snapshot), sha256=hashlib.sha256(snapshot).hexdigest(), required=False))
    m['lessonOs']['status'] = 'missing' if snapshot is None else 'included'
    result = bundle.read_bundle(write_bundle(tmp_path, m, files))
    assert result.lessonos_events_jsonl == (snapshot.decode() if snapshot is not None else None)


def test_v2_journal_version_is_an_integer_not_a_float():
    _, files = baseline()
    rows = [json.loads(line) for line in files['raw/events.jsonl'].splitlines()]
    rows[0]['schemaVersion'] = 2.0
    with pytest.raises(ValueError, match='schemaVersion'):
        bundle.journal_to_segments('\n'.join(map(json.dumps, rows)), 'd2-lesson-a')
