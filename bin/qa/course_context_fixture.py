"""Disposable synthetic identities; unchanged production factory and catalogue."""
import json
import os
from pathlib import Path

from lessonos.study.store import StudyStore
from study_api.app import create_app

state = Path(os.environ['ARDESIA_COURSE_CONTEXT_STATE'])
state.mkdir(parents=True, exist_ok=True)
identity_path = state / 'identity.json'
if not identity_path.exists():
    store = StudyStore(state / 'study.sqlite')
    teacher = store.create_principal('context-teacher', 'teacher')
    student = store.create_principal('context-student', 'student')
    peer = store.create_principal('context-peer', 'student')
    store.create_edition(teacher, 'mechanics', course_id='strumenti-meccanica',
                         pack_id='sf-strumenti-meccanica-v1', pack_version=1)
    for actor in (student, peer):
        store.add_test_member(teacher, 'mechanics', actor.id)
    identity_path.write_text(json.dumps({name: {'id': actor.id, 'token': store.issue_session(actor)}
                                        for name, actor in [('teacher', teacher), ('student', student), ('peer', peer)]}))
    identity_path.chmod(0o600)
    store.close()

app = create_app(state / 'study.sqlite', demo=True,
                 frontend=Path(os.environ['ARDESIA_COURSE_CONTEXT_FRONTEND']))
