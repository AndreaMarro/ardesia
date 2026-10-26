"""Original Study API + synthetic private fixture; no success backend or monkeypatch."""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]
from lessonos.study.store import StudyStore
from study_api.app import create_app

private = Path(os.environ['S20_PRIVATE_DIR'])
private.mkdir(parents=True, exist_ok=True)
db = private / 'study.sqlite'
if not db.exists():
    store = StudyStore(db)
    teacher = store.create_principal('s20-synthetic-tutor', 'teacher')
    student = store.create_principal('s20-synthetic-student', 'student')
    peer = store.create_principal('s20-synthetic-peer', 'student')
    store.create_edition(teacher, 'fluidi')
    store.add_test_member(teacher, 'fluidi', student.id)
    store.add_test_member(teacher, 'fluidi', peer.id)
    source = store.create_resource(teacher, 'fluidi', 'material',
        'Il vincolo nella legge di Poiseuille\n\nConfronta tubi della stessa lunghezza e lo stesso fluido. '
        'Con differenza di pressione costante, la portata è proporzionale alla quarta potenza del raggio. '
        'Con portata costante, isola Δp nella relazione Q = π r⁴ Δp / (8 η L). '
        'Valido per moto laminare, fluido newtoniano incomprimibile e tubo cilindrico rigido.', 'group')
    access = { 'teacher': store.issue_session(teacher), 'student': store.issue_session(student),
        'peer': store.issue_session(peer), 'studentId': student.id, 'source': source }
    path = private / 'access.json'
    path.write_text(json.dumps(access)); path.chmod(0o600)
    store.close()

app = create_app(db, demo=True, frontend=Path(os.environ['S20_FRONTEND']))
