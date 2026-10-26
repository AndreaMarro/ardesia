"""Synthetic navigation acceptance. Composes the real S05/Core HTTP server."""
import json
import sys
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import synthetic_server as original
from lessonos.study.store import StudyStore

app=original.app
target=original.ROOT/'s05-demo-fixture.json'
fixture=json.loads(target.read_text())
if 'teacherAlone' not in fixture:
    store=StudyStore(original.DB)
    actor=store.create_principal('tutor-s05-alone-navigation','teacher')
    fixture['teacherAlone']=actor.id
    fixture['tokens'][actor.id]=store.issue_session(actor,ttl=14400)
    store.close()
    target.write_text(json.dumps(fixture))
    target.chmod(0o600)
