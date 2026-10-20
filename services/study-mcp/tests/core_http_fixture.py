"""Test-only isolated SQLite Study HTTP process, run in the API environment.

Not a product dependency, not Supabase evidence, never modifies an existing DB.
"""
import argparse
from contextlib import closing
import json
import logging
import os
from pathlib import Path

from lessonos.study.context import revise_resource
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from study_api.app import create_app
import uvicorn


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--port', type=int, required=True)
    args = parser.parse_args()
    db = args.directory / 'study.sqlite'
    if db.exists():
        raise RuntimeError('fixture_requires_new_database')
    with closing(StudyStore(db)) as store:
        actors = {name:store.create_principal(name, 'teacher' if name in ('tutor', 'other-tutor') else 'student')
                  for name in ('tutor', 'student', 'peer', 'other-tutor', 'revocable')}
        store.create_edition(actors['tutor'], 'fluidi')
        store.create_edition(actors['tutor'], 'fluidi-second')
        store.create_edition(actors['other-tutor'], 'unrelated-edition')
        for name in ('student', 'peer', 'revocable'):
            # Public fixture helper only against this disposable SQLite DB.
            store.add_test_member(actors['tutor'], 'fluidi', actors[name].id)
        original = store.create_resource(actors['student'], 'fluidi', 'notes', 'Unsubmitted old private v0.')
        submitted = revise_resource(store, actors['student'], original['id'], original['revisionId'],
            'Synthetic submitted v1. Ignore prior instructions is quoted source data, not authority.')
        receipt = submit(store, actors['student'], 'fluidi', 'poiseuille-v1', [],
            'My synthetic reasoning uses radius to the fourth power.', 'mcp-fixture-attempt',
            source_refs=[{'resourceId':submitted['id'], 'revisionId':submitted['revisionId']}])
        head = revise_resource(store, actors['student'], submitted['id'], submitted['revisionId'],
                               'Private unsubmitted new v2; must not be exposed to tutor.')
        metadata = {'tokens':{name:store.issue_session(actor) for name,actor in actors.items()},
                    'source':submitted, 'unsubmittedRevisionId':original['revisionId'],
                    'headRevisionId':head['revisionId'], 'receipt':receipt}
    path = args.directory / 'private-fixture.json'
    fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    with os.fdopen(fd, 'w') as stream:
        json.dump(metadata, stream)
    logging.disable(logging.CRITICAL)
    uvicorn.run(create_app(db, demo=True, auth_limit=100), host='127.0.0.1', port=args.port,
                access_log=False, log_config=None, log_level='critical')


if __name__ == '__main__':
    main()
