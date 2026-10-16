"""Validate additive Studio v2/v3 archives without inventing session history.

The text-ingestion pipeline keeps its existing journal authority. Session files
and original PDFs are opaque artifacts here, verified by inventory and hash;
this module does not promote their contents into Engine facts.
"""
import re

_UUID = r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
_SESSION = re.compile(rf'raw/sessions/({_UUID})/session\.yaml')
_PDF = re.compile(r'raw/documents/([0-9a-f]{64})\.pdf')
_REQUIRED = ['raw/board.excalidraw', 'raw/events.jsonl', 'raw/session.yaml']
_OPTIONAL = ['raw/lessonos-events.jsonl', 'raw/audio/*', 'raw/sessions/*/session.yaml']
MAX_PDF_BYTES = 20 * 1024 * 1024
MAX_PDFS = 32
MAX_TOTAL_PDF_BYTES = 100 * 1024 * 1024


def _fail(reason):
    raise ValueError(f'unsupported manifest extension: {reason}')


def validate_extensions(manifest, sizes):
    """Check extension inventory against bounded, hashed payload sizes.

    Physical PDF quotas are also enforced by bundle_resources before reads;
    this validates the declared schema/session/content-addressed contract.
    """
    version = manifest['schemaVersion']
    if version == 1:
        return set()
    ids = manifest.get('sessionIds')
    if (not isinstance(ids, list) or
        any(not isinstance(i, str) or not re.fullmatch(_UUID, i) for i in ids) or
        ids != sorted(set(ids))):
        _fail('sessionIds must be sorted, unique canonical UUIDs')
    optional = _OPTIONAL + (['raw/documents/*.pdf'] if version == 3 else [])
    if manifest.get('requiredArtifacts') != _REQUIRED or manifest.get('optionalArtifacts') != optional:
        _fail('artifact contract differs')
    compatibility = manifest.get('compatibility')
    if (not isinstance(compatibility, dict) or
        type(compatibility.get('minimumReaderSchemaVersion')) is not int or
        compatibility['minimumReaderSchemaVersion'] != version or
        not isinstance(compatibility.get('migrations'), list) or
        any(not isinstance(m, str) for m in compatibility['migrations'])):
        _fail('reader compatibility differs')
    included, pdfs, total = [], set(), 0
    for entry in manifest['files']:
        path = entry['path']
        if (type(entry.get('bytes')) is not int or entry['bytes'] < 0 or
            not isinstance(entry.get('sha256'), str) or
            not re.fullmatch(r'[0-9a-f]{64}', entry['sha256']) or
            entry.get('bytes') != sizes[path] or
            type(entry.get('required')) is not bool or entry['required'] != (path in _REQUIRED)):
            _fail('invalid file inventory')
        session, pdf = _SESSION.fullmatch(path), _PDF.fullmatch(path)
        if session:
            if session[1] not in ids:
                _fail('session outside declared scope')
            included.append(session[1])
        elif pdf:
            if version != 3 or pdf[1] != entry['sha256']:
                _fail('PDF schema or content-addressed path differs')
            if not 0 < entry['bytes'] <= MAX_PDF_BYTES:
                _fail('PDF exceeds 20 MiB')
            total += entry['bytes']
            pdfs.add(path)
        elif path not in _REQUIRED + ['raw/lessonos-events.jsonl'] and not re.fullmatch(r'raw/audio/[^/\\]+', path):
            _fail('path outside portable contract')
    if len(pdfs) > MAX_PDFS or total > MAX_TOTAL_PDF_BYTES or (version == 3 and not pdfs):
        _fail('PDF inventory missing or exceeds quota')
    sessions = manifest.get('sessions')
    if (not isinstance(sessions, dict) or sessions.get('includedSessionIds') != sorted(included) or
        sessions.get('missingSessionIds') != [i for i in ids if i not in included]):
        _fail('session inventory differs')
    lesson_os = manifest.get('lessonOs')
    if (not isinstance(lesson_os, dict) or
        lesson_os.get('status') != ('included' if 'raw/lessonos-events.jsonl' in sizes else 'missing') or
        not isinstance(lesson_os.get('warnings'), list) or
        any(not isinstance(w, str) for w in lesson_os['warnings'])):
        _fail('LessonOS inventory differs')
    return pdfs
