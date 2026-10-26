"""Local-only real Core composition with synthetic fixtures; no product login."""

import argparse
from pathlib import Path
import json
import os
import sys

ROOT = Path(__file__).resolve().parents[3]
PRODUCT = os.environ.get("S19_PRODUCT") == "1"
if PRODUCT:
    # Final consumer proof imports the real factory, without the owner-patch shim.
    sys.path[:0] = [str(ROOT / p) for p in (
        "packages/engine", "services/study-api", "plugins/s19-circuit-lab"
    )]
else:
    import compose_candidate  # exact owner patch in disposable module copies
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
revoke_desktop = store.create_principal("s19-revoke-desktop", "student")
revoke_touch = store.create_principal("s19-revoke-touch", "student")
try:
    store.get_edition("s19-dc")
except ValueError:
    store.create_edition(
        tutor, "s19-dc", course_id="elettrotecnica-dc", pack_id="s19-circuit-dc-v1"
    )
for person in (student, peer, touch, revoke_desktop, revoke_touch):
    store.add_test_member(tutor, "s19-dc", person.id)
seed = args.data / "synthetic-sessions.json"
seed.write_text(
    json.dumps(
        {
            "desktop": store.issue_session(student),
            "touch": store.issue_session(touch),
            "peer": store.issue_session(peer),
            "teacher": store.issue_session(tutor),
            "revocation-desktop": store.issue_session(revoke_desktop),
            "revocation-touch": store.issue_session(revoke_touch),
        }
    )
)
seed.chmod(0o600)
app = create_app(store.path, demo=True, frontend=ROOT / "apps/web/dist" if PRODUCT else None)
store.close()
uvicorn.run(app, host="127.0.0.1", port=args.port, access_log=False)
