"""Private loopback proof of the exact proposed owner composition patch.

No shared file is edited. Auth/session/store/body admission are the actual
Study API. The two install lines are inserted into an in-memory module copy.
This is evidence for the proposed patch, never a claim it is merged/deployed.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path[:0] = [str(ROOT/'packages/engine'), str(ROOT/'services/study-api')]
from lessonos.study.store import StudyStore
from study_api import app as upstream


def create_candidate(db):
    path = Path(upstream.__file__)
    source = path.read_text()
    marker = '    if studio_frontend:\n'
    if source.count(marker) != 1:
        raise RuntimeError('composition_marker_changed')
    patch = ('    from lessonos.study.science_library.routes import install_science_library_routes\n'
             '    install_science_library_routes(app, store_dependency, authenticate)\n\n')
    namespace = dict(vars(upstream))
    exec(compile(source.replace(marker, patch+marker), str(path), 'exec'), namespace)
    return namespace['create_app'](db, demo=True), hashlib.sha256(source.encode()).hexdigest()


def seed(directory):
    directory.mkdir(parents=True, exist_ok=True)
    db = directory/'science.sqlite'
    if db.exists():
        raise RuntimeError('refuse_to_replace_existing_fixture_database')
    store = StudyStore(db)
    try:
        tutor = store.create_principal('s01-tutor', 'teacher')
        student = store.create_principal('s01-student', 'student')
        peer = store.create_principal('s01-peer', 'student')
        outsider = store.create_principal('s01-outsider', 'teacher')
        store.create_edition(tutor, 'science-s01')
        for actor in (student, peer):
            store.add_test_member(tutor, 'science-s01', actor.id)
        fixture = {'editionId': 'science-s01', 'actors': {p.id: {'id': p.id, 'token': store.issue_session(p)}
                   for p in (tutor, student, peer, outsider)}}
        path = directory/'fixture-private.json'
        path.write_text(json.dumps(fixture))
        os.chmod(path, 0o600)
    finally:
        store.close()
    return db


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--seed-only', action='store_true')
    args = parser.parse_args()
    db = args.directory/'science.sqlite'
    if not db.exists():
        seed(args.directory)
    app, source_hash = create_candidate(db)
    (args.directory/'composition.json').write_text(json.dumps({'upstreamAppSha256': source_hash,
        'composition': 'in-memory two-line proposed owner patch; shared file untouched'}, indent=2)+'\n')
    if not args.seed_only:
        import uvicorn
        uvicorn.run(app, host='127.0.0.1', port=55511, access_log=False)
