"""Build a second subject without touching the canonical Core or copying templates."""
import json
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
import build


def make_fixture(output):
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory).resolve()
        composition = {
            'id': 'synthetic-mathematics', 'version': 1, 'bankRef': {},
            'paths': [
                {'id': 'analisi', 'title': 'Analisi: limiti e derivate', 'unitIds': ['A1']},
                {'id': 'algebra', 'title': 'Algebra e sistemi lineari', 'unitIds': ['A2']},
            ],
        }
        (root / 'composition.json').write_text(json.dumps(composition))
        catalog = {
            'schemaVersion': 1, 'subject': 'Matematica', 'academicYear': '2027/28',
            'examLabel': 'Prova di Matematica', 'examAuthority': 'Ente sintetico',
            'teacherId': 'andrea-marro', 'composition': 'composition.json',
            'availability': 'Gruppi di Matematica in formazione.', 'audience': 'Esempio sintetico di una seconda materia.',
            'reference': {'url': 'https://example.com/matematica', 'label': 'Programma sintetico di Matematica'},
            'contact': {'name': 'Andrea Marro', 'whatsapp': '393461653930', 'display': '346 165 3930', 'email': 'fixture@example.com'},
            'courses': {value['id']: {'intro': 'Esempio sintetico', 'fit': 'Un percorso di prova.', 'topics': ['Tema di Matematica'], 'outcomes': ['Obiettivo di Matematica']} for value in composition['paths']},
        }
        config = root / 'catalog.json'
        config.write_text(json.dumps(catalog))
        with patch.object(build, 'ROOT', root):
            build.build(Path(output), catalog=config)


if __name__ == '__main__':
    make_fixture(sys.argv[1])
