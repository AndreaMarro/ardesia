"""Only synthetic actors and an original PDF; all learning writes use product UI."""
import json
import os
from pathlib import Path
from io import BytesIO

from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject
from lessonos.study.store import StudyStore
from study_api.app import create_app

root = Path(os.environ['ARDESIA_G0_STATE'])
root.mkdir(parents=True, exist_ok=True)
db = root / 'study.sqlite'
if not db.exists():
    store = StudyStore(db)
    teacher = store.create_principal('g0-synthetic-teacher', 'teacher')
    student = store.create_principal('g0-synthetic-student', 'student')
    peer = store.create_principal('g0-synthetic-peer', 'student')
    store.create_edition(teacher, 'fluidi')
    for actor in [student, peer]:
        store.add_test_member(teacher, 'fluidi', actor.id)
    identity = {name: {'id': actor.id, 'token': store.issue_session(actor)}
                for name, actor in [('teacher', teacher), ('student', student), ('peer', peer)]}
    (root / 'identity.json').write_text(json.dumps(identity))
    (root / 'identity.json').chmod(0o600)
    store.close()

    writer = PdfWriter()
    font = writer._add_object(DictionaryObject({NameObject('/Type'): NameObject('/Font'),
        NameObject('/Subtype'): NameObject('/Type1'), NameObject('/BaseFont'): NameObject('/Helvetica')}))
    page = writer.add_blank_page(width=540, height=720)
    page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/F1'): font})})
    lines = [
        'Poiseuille: prima scegli il vincolo',
        'Q = pi r^4 Dp / (8 eta L)',
        'Moto laminare; fluido newtoniano incomprimibile.',
        'Tubo cilindrico rigido; stessa lunghezza e viscosita.',
        'A Dp costante, r/r0 = 2 implica Q/Q0 = 16.',
        'A Q costante, r/r0 = 2 implica Dp/Dp0 = 1/16.',
        'Il risultato dipende dalla grandezza mantenuta fissa.',
        'Spiega il procedimento prima di usare un numero.',
        'Documento originale Ardesia G0, solo dati sintetici.',
    ]
    def escape(value):
        return value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    operations = ['BT /F1 21 Tf 34 660 Td (' + escape(lines[0]) + ') Tj /F1 13 Tf']
    for line in lines[1:]:
        operations.append('0 -41 Td (' + escape(line) + ') Tj')
    operations.extend(['ET', '0.15 0.4 0.55 RG 3 w 80 120 m 450 120 l S 80 180 m 450 180 l S'])
    stream = DecodedStreamObject()
    stream.set_data('\n'.join(operations).encode())
    page[NameObject('/Contents')] = writer._add_object(stream)
    writer.add_outline_item('Il vincolo di Poiseuille', 0)
    output = BytesIO()
    writer.write(output)
    (root / 'poiseuille-originale.pdf').write_bytes(output.getvalue())

app = create_app(db, demo=True, frontend=Path(os.environ['ARDESIA_G0_WEB']),
                 studio_frontend=Path(os.environ['ARDESIA_G0_STUDIO']), auth_limit=1000)
