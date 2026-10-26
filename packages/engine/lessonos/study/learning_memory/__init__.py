"""Private, rebuildable notebook over the canonical Study event ledger.

Notes are manual statements, never competency diagnoses. Exact source reads and
all derived views recheck Core access; command receipts contain identifiers only.
"""
import json
from ..models import StudyError
from ..store import canonical, digest, identifier
from ..transactions import execute_command

CLASSIFICATIONS = frozenset(('idea', 'annotation', 'observation', 'hypothesis',
    'correction', 'undetermined', 'not_understood'))
FORMAT = 'ardesia-learning-memory/1'
MAX_NOTES = 500
MAX_ARCHIVE_BYTES = 240_000  # Fits the existing HTTP body budget, including its wrapper.
FIELDS = frozenset(('title', 'text', 'classification', 'concepts', 'sourceRefs', 'links'))


def _raw(store, principal, note_id=None, *, history=False):
    store._principal(principal)
    sql = "SELECT kind,payload,created_at FROM study_events WHERE actor_id=? AND kind IN ('memory.note.saved.v1','memory.note.deleted.v1','memory.note.head.v1')"
    params = [principal.id]
    if note_id is not None:
        sql += " AND json_extract(payload,'$.note.id')=?"
        params.append(note_id)
    latest, versions, heads = {}, [], {}
    for row in store.connection.execute(sql + ' ORDER BY seq', params):
        note = {**json.loads(row['payload'])['note'], 'updatedAt': row['created_at']}
        if row['kind'] == 'memory.note.head.v1':
            heads[note['id']] = note
            continue
        latest[note['id']] = note
        versions.append(note)
    for key, head in heads.items():
        if head.get('deleted') or latest.get(key, {}).get('version') != head['version']:
            # Source erasure may remove a snapshot from another actor's note.
            # Its content-free version marker must prevent promotion of an old
            # classification or resurrection of a deleted aggregate.
            latest[key] = {**head, 'unavailable': True, 'title': '', 'text': '',
                'classification': 'undetermined', 'sourceRefs': [], 'links': [], 'concepts': []}
    return versions if history else latest


def _owned(store, principal, note_id):
    note = _raw(store, principal, note_id).get(note_id)
    if not note or note.get('deleted'):
        raise StudyError('not_found', 404)
    return note


def _source(store, principal, ref):
    resource = store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])
    head = store.connection.execute('SELECT current_revision FROM study_resources WHERE id=?', (resource['id'],)).fetchone()
    return resource, 'CURRENT' if head[0] == resource['revisionId'] else 'HISTORICAL'


def _visible(store, principal, note):
    state = 'CURRENT'
    if note.get('unavailable'):
        return {'id': note['id'], 'version': note['version'], 'updatedAt': note['updatedAt'],
            'title': 'Fonte non disponibile', 'text': '', 'classification': 'undetermined',
            'concepts': [], 'sourceRefs': [], 'links': [], 'sourceState': 'UNAVAILABLE'}
    for ref in note['sourceRefs']:
        try:
            _, source_state = _source(store, principal, ref)
            if source_state == 'HISTORICAL': state = source_state
        except StudyError:
            # Content may quote the withdrawn source. Do not leak it via titles,
            # search, history, receipts, tags, links or downloaded artifacts.
            return {'id': note['id'], 'version': note['version'], 'updatedAt': note['updatedAt'],
                'title': 'Fonte non disponibile', 'text': '', 'classification': 'undetermined',
                'concepts': [], 'sourceRefs': [], 'links': [], 'sourceState': 'UNAVAILABLE'}
    return {**note, 'sourceState': state}


def get_note(store, principal, note_id):
    note = _visible(store, principal, _owned(store, principal, note_id))
    note['backlinks'] = [n['id'] for n in _raw(store, principal).values()
        if not n.get('deleted') and note_id in n['links'] and
        _visible(store, principal, n)['sourceState'] != 'UNAVAILABLE'] if note['sourceState'] != 'UNAVAILABLE' else []
    return note


def get_history(store, principal, note_id):
    current = _owned(store, principal, note_id)
    if current.get('unavailable'): return [_visible(store, principal, current)]
    return [_visible(store, principal, note) for note in _raw(store, principal, note_id, history=True)]


def _text(value, limit, *, empty=False):
    if not isinstance(value, str) or len(value) > limit or (not empty and not value.strip()):
        raise StudyError('invalid_memory_note')
    return value


def _strings(values, maximum, length):
    if not isinstance(values, list) or len(values) > maximum:
        raise StudyError('invalid_memory_note')
    result = [_text(value, length) for value in values]
    if len(set(result)) != len(result): raise StudyError('invalid_memory_note')
    return result


def _validate(store, principal, body, *, imported_ids=None):
    if not isinstance(body, dict) or set(body) != FIELDS:
        raise StudyError('invalid_memory_note')
    title, text = _text(body['title'], 160), _text(body['text'], 4000)
    classification = body['classification']
    if not isinstance(classification, str) or classification not in CLASSIFICATIONS:
        raise StudyError('invalid_memory_classification')
    concepts = _strings(body['concepts'], 12, 64)
    links = _strings(body['links'], 20, 128)
    for link in links:
        if imported_ids is not None and link in imported_ids: continue
        if _visible(store, principal, _owned(store, principal, link))['sourceState'] == 'UNAVAILABLE':
            raise StudyError('source_unavailable', 403)
    if not isinstance(body['sourceRefs'], list) or len(body['sourceRefs']) > 8:
        raise StudyError('invalid_source_refs')
    refs, pairs = [], set()
    for ref in body['sourceRefs']:
        if not isinstance(ref, dict) or not {'resourceId', 'revisionId'} <= set(ref) or set(ref) - {
            'resourceId', 'revisionId', 'sha256', 'start', 'end', 'quote'}:
            raise StudyError('invalid_source_refs')
        for name in ('resourceId', 'revisionId'): _text(ref[name], 128)
        pair = (ref['resourceId'], ref['revisionId'])
        if pair in pairs: raise StudyError('invalid_source_refs')
        pairs.add(pair)
        resource, _ = _source(store, principal, ref)
        result = {'resourceId': resource['id'], 'revisionId': resource['revisionId'], 'sha256': resource['sha256']}
        if 'sha256' in ref and ref['sha256'] != resource['sha256']:
            raise StudyError('anchor_quote_mismatch')
        if set(ref) & {'start', 'end', 'quote'}:
            start, end = ref.get('start'), ref.get('end')
            if type(start) is not int or type(end) is not int or not 0 <= start < end <= len(resource['text']):
                raise StudyError('invalid_anchor')
            if resource['text'][start:end] != ref.get('quote'):
                raise StudyError('anchor_quote_mismatch')
            result.update(start=start, end=end, quote=ref['quote'])
        refs.append(result)
    return {'title': title, 'text': text, 'classification': classification, 'concepts': concepts,
            'sourceRefs': refs, 'links': links}


def _write(store, connection, principal, note, *, deleted=False):
    store._event(connection, principal, 'memory.note.deleted.v1' if deleted else 'memory.note.saved.v1',
        None, {'note': {'id': note['id'], 'version': note['version'], 'deleted': True} if deleted else note})
    store._event(connection, principal, 'memory.note.head.v1', None,
        {'note': {'id': note['id'], 'version': note['version'], 'deleted': deleted}})


def save_note(store, principal, body, key, *, note_id=None, expected_version=None):
    def apply(c):
        store.lock_aggregate(c, 'memory.actor', principal.id)
        if note_id is not None:
            previous = _owned(store, principal, note_id)
            if type(expected_version) is not int or previous['version'] != expected_version:
                raise StudyError('stale_revision', 409)
        elif sum(not n.get('deleted') for n in _raw(store, principal).values()) >= MAX_NOTES:
            raise StudyError('memory_limit', 409)
        note = {**_validate(store, principal, body), 'id': note_id or identifier(),
            'version': expected_version + 1 if note_id is not None else 1}
        if note['id'] in note['links']: raise StudyError('invalid_memory_links')
        _write(store, c, principal, note)
        return {'noteId': note['id']}
    receipt = execute_command(store, principal, 'memory.save.v1', key,
        {'noteId': note_id, 'expectedVersion': expected_version, 'body': body}, apply)
    return get_note(store, principal, receipt['noteId'])


def delete_note(store, principal, note_id, expected_version, key):
    def apply(c):
        store.lock_aggregate(c, 'memory.actor', principal.id)
        note = _owned(store, principal, note_id)
        if type(expected_version) is not int or note['version'] != expected_version:
            raise StudyError('stale_revision', 409)
        _write(store, c, principal, {**note, 'version': note['version'] + 1, 'deleted': True}, deleted=True)
        return {'noteId': note_id, 'deleted': True}
    return execute_command(store, principal, 'memory.delete.v1', key,
        {'noteId': note_id, 'expectedVersion': expected_version}, apply)


def _evidence_graph(store, principal, sources, nodes, edges):
    """Only committed attempts and published reviews in existing Core scope."""
    from ..feedback import submission_for_actor
    query = 'SELECT id,source_refs FROM study_submissions WHERE student_id=?'
    if principal.role == 'teacher':
        query = 'SELECT id,source_refs FROM study_submissions WHERE edition_id IN (SELECT id FROM study_editions WHERE teacher_id=?)'
    for row in store.connection.execute(query + ' ORDER BY created_at,id', (principal.id,)):
        refs = json.loads(row['source_refs'])
        matches = [sources[(r['resourceId'], r['revisionId'])] for r in refs if (r['resourceId'], r['revisionId']) in sources]
        if not matches: continue
        try:
            submission = submission_for_actor(store, principal, row['id'])
            states = [_source(store, principal, ref)[1] for ref in refs]
        except StudyError: continue
        attempt_id = 'attempt:' + row['id']
        nodes[attempt_id] = {'id': attempt_id, 'kind': 'attempt', 'label': 'Tentativo consegnato',
            'text': submission['text'], 'sourceState': 'HISTORICAL' if 'HISTORICAL' in states else 'CURRENT',
            'reference': refs[0] if refs else None}
        for source_id in matches: edges.append({'source': source_id, 'target': attempt_id, 'relation': 'attempt_of'})
        for review in store.connection.execute("SELECT r.id,r.text FROM study_reviews r JOIN study_feedback f ON f.id=r.candidate_id WHERE f.submission_id=? AND r.decision='returned'", (row['id'],)):
            review_id = 'review:' + review['id']
            nodes[review_id] = {'id': review_id, 'kind': 'review', 'label': 'Review pubblicata',
                'text': review['text'], 'reference': refs[0] if refs else None}
            edges.append({'source': attempt_id, 'target': review_id, 'relation': 'reviewed_by'})
    from ..diary import get_diary
    editions = {store.get_resource_revision(principal, r, v)['editionId'] for r, v in sources}
    diaries = [get_diary(store, principal)] if principal.role == 'student' else [get_diary(store, principal, e) for e in sorted(editions)]
    for diary in diaries:
        for thread in diary['threads']:
            ref = thread.get('source')
            if not ref or (ref['resourceId'], ref['revisionId']) not in sources: continue
            node_id = 'observation:' + thread['threadId']
            nodes[node_id] = {'id': node_id, 'kind': 'observation', 'label': thread['conceptId'],
                'text': thread.get('feedback', {}).get('explanation', '') if thread.get('feedback') else '',
                'status': thread['status'], 'contested': thread['contested'], 'reference': ref}
            edges.append({'source': sources[(ref['resourceId'], ref['revisionId'])], 'target': node_id, 'relation': 'observed_on'})
            original_attempt = 'attempt:' + thread['submissionId']
            if original_attempt in nodes:
                edges.append({'source': original_attempt, 'target': node_id, 'relation': 'observed_on'})
            if thread.get('feedback'):
                review_id = 'diary-review:' + thread['threadId']
                nodes[review_id] = {'id': review_id, 'kind': 'review', 'label': 'Review dell’osservazione',
                    'text': thread['feedback']['explanation'], 'reference': ref, 'provenance': 'diary'}
                edges.append({'source': node_id, 'target': review_id, 'relation': 'reviewed_by'})
                for attempt in thread['attempts']:
                    if attempt.get('procedure') is None or not attempt.get('sourceRefs'): continue
                    try:
                        submission_for_actor(store, principal, attempt['submissionId'])
                        for source_ref in attempt['sourceRefs']: _source(store, principal, source_ref)
                    except StudyError: continue
                    attempt_id = 'attempt:' + attempt['submissionId']
                    nodes[attempt_id] = {'id': attempt_id, 'kind': 'attempt', 'label': 'Nuova prova consegnata',
                        'text': attempt['procedure'], 'reference': attempt['sourceRefs'][0], 'status': thread['status']}
                    edges.append({'source': review_id, 'target': attempt_id, 'relation': 'new_attempt'})


def get_memory(store, principal, query=''):
    _text(query, 200, empty=True)
    visible = [_visible(store, principal, n) for n in _raw(store, principal).values() if not n.get('deleted')]
    terms = query.casefold().split()
    notes, source_text = [], {}
    for note in visible:
        originals = []
        for ref in note['sourceRefs']:
            pair = (ref['resourceId'], ref['revisionId'])
            if pair not in source_text: source_text[pair] = _source(store, principal, ref)[0]['text']
            originals.append(source_text[pair])
        haystack = ' '.join([note['title'], note['text'], *note['concepts'], *originals]).casefold()
        if not terms or note['sourceState'] != 'UNAVAILABLE' and all(term in haystack for term in terms): notes.append(note)
    nodes, edges, sources = {}, [], {}
    ids = {n['id'] for n in notes}
    for note in notes:
        nodes[note['id']] = {'id': note['id'], 'kind': 'note', 'label': note['title'],
            'classification': note['classification'], 'sourceState': note['sourceState']}
        for concept in note['concepts']:
            concept_id = 'concept:' + concept
            nodes[concept_id] = {'id': concept_id, 'kind': 'concept', 'label': concept}
            edges.append({'source': concept_id, 'target': note['id'], 'relation': 'tagged'})
        for link in note['links']:
            if link in ids: edges.append({'source': note['id'], 'target': link, 'relation': 'links_to'})
        for ref in note['sourceRefs']:
            pair = (ref['resourceId'], ref['revisionId'])
            source_id = 'source:' + ':'.join(pair)
            sources[pair] = source_id
            resource, source_state = _source(store, principal, ref)
            label = 'Passaggio della lezione' if resource['kind'] == 'lesson-passage' else resource['text'].splitlines()[0][:85]
            nodes[source_id] = {'id': source_id, 'kind': 'source', 'label': label,
                'reference': {'resourceId': ref['resourceId'], 'revisionId': ref['revisionId']},
                'sourceState': source_state}
            edges.append({'source': note['id'], 'target': source_id, 'relation': 'cites'})
    _evidence_graph(store, principal, sources, nodes, edges)
    from .view import read_view
    return {'notes': notes, 'nodes': list(nodes.values()), 'edges': edges,'view':read_view(store,principal,set(nodes)),
        'limits': ['Classificazioni manuali e correggibili; nessuna diagnosi di competenza.',
            'Collegamenti ricalcolati con i permessi attuali. Le revisioni storiche restano esplicite.']}


def export_memory(store, principal):
    notes = [{**{key: note[key] for key in FIELDS}, 'id': note['id']}
        for note in get_memory(store, principal)['notes'] if note['sourceState'] != 'UNAVAILABLE']
    ids = {n['id'] for n in notes}
    for note in notes: note['links'] = [link for link in note['links'] if link in ids]
    archive = {'format': FORMAT, 'notes': notes}
    archive = {**archive, 'sha256': digest(canonical(archive))}
    if len(canonical(archive).encode()) > MAX_ARCHIVE_BYTES: raise StudyError('memory_archive_too_large', 413)
    return archive


def import_memory(store, principal, archive, key):
    if not isinstance(archive, dict) or set(archive) != {'format', 'notes', 'sha256'} or archive['format'] != FORMAT:
        raise StudyError('invalid_memory_archive')
    content = {key: archive[key] for key in ('format', 'notes')}
    if len(canonical(archive).encode()) > MAX_ARCHIVE_BYTES: raise StudyError('memory_archive_too_large', 413)
    if digest(canonical(content)) != archive['sha256'] or not isinstance(archive['notes'], list) or len(archive['notes']) > MAX_NOTES:
        raise StudyError('invalid_memory_archive')
    def apply(c):
        store.lock_aggregate(c, 'memory.actor', principal.id)
        if sum(not n.get('deleted') for n in _raw(store, principal).values()) + len(archive['notes']) > MAX_NOTES:
            raise StudyError('memory_limit', 409)
        mapping = {}
        for note in archive['notes']:
            if not isinstance(note, dict) or set(note) != FIELDS | {'id'}:
                raise StudyError('invalid_memory_archive')
            original_id = _text(note['id'], 128)
            if original_id in mapping: raise StudyError('invalid_memory_archive')
            mapping[original_id] = identifier()
        validated = []
        for note in archive['notes']:
            if not isinstance(note['links'], list) or any(not isinstance(link, str) or link not in mapping for link in note['links']):
                raise StudyError('invalid_memory_links')
            body = _validate(store, principal, {key: note[key] for key in FIELDS}, imported_ids=mapping)
            body['links'] = [mapping[link] for link in body['links']]
            body.update(id=mapping[note['id']], version=1)
            if body['id'] in body['links']: raise StudyError('invalid_memory_links')
            validated.append(body)
        for note in validated: _write(store, c, principal, note)
        return {'importedCount': len(validated), 'noteIds': list(mapping.values())}
    return execute_command(store, principal, 'memory.import.v1', key, archive, apply)


from .view import get_view, save_view
