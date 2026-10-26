"""Local-only real Core composition with synthetic fixtures; no product login."""

import argparse
from pathlib import Path
import json
import compose_candidate  # applies exact owner patch to disposable module copies
from lessonos.study.store import StudyStore
from study_api.app import create_app
import uvicorn

parser = argparse.ArgumentParser()
parser.add_argument("--data", type=Path, required=True)
parser.add_argument("--port", type=int, default=5198)
args = parser.parse_args()
args.data.mkdir(parents=True, exist_ok=True)
store = StudyStore(args.data / "study.sqlite")
tutor = store.create_principal("s19-tutor", "teacher")
student = store.create_principal("s19-student", "student")
peer = store.create_principal("s19-peer", "student")
touch = store.create_principal("s19-touch", "student")
try:
    store.get_edition("s19-dc")
except ValueError:
    store.create_edition(
        tutor, "s19-dc", course_id="elettrotecnica-dc", pack_id="s19-circuit-dc-v1"
    )
for person in (student, peer, touch):
    store.add_test_member(tutor, "s19-dc", person.id)
seed = args.data / "synthetic-sessions.json"
seed.write_text(
    json.dumps(
        {
            "desktop": store.issue_session(student),
            "touch": store.issue_session(touch),
            "peer": store.issue_session(peer),
            "teacher": store.issue_session(tutor),
        }
    )
)
seed.chmod(0o600)
app = create_app(store.path, demo=True)
store.close()
uvicorn.run(app, host="127.0.0.1", port=args.port, access_log=False)
