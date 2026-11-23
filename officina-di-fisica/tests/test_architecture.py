"""Domain, persistence, publication, measurement and editorial transport acceptance."""
import ast
import json
import os
import random
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from copy import deepcopy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from server import editor, learning, store
from server.adapters.contracts import schema
from server.adapters.editorial_mcp import check_proposal
from server.adapters.engines import bind_releases, checkpoints, load_registry, validate_experiment
from server.adapters.migrations import migrate
from server.adapters.providers import ChatCompletions, Ollama
from server.application.pathways import learning_path
from server.domain.errors import Problem
from server.domain.pathway import prerequisites
from server.domain.science import measurement
from server.editorial.service import EditorialWorkspace

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / 'examples'
META = json.loads((EXAMPLES / 'extensions/area-rettangolo/1.0.0/manifest.json').read_text())
PACKAGE = json.loads((EXAMPLES / 'geometria.json').read_text())


class Architecture(unittest.TestCase):
    def test_dependency_direction(self):
        denied = {'sqlite3', 'http', 'urllib', 'pathlib', 'subprocess', 'os', 'store', 'web',
                  'editor', 'commerce', 'adapters'}
        for folder in ['domain', 'application', 'editorial']:
            for file in (ROOT / 'server' / folder).glob('*.py'):
                for node in ast.walk(ast.parse(file.read_text())):
                    if isinstance(node, ast.ImportFrom):
                        paths = [node.module or ''] + [n.name for n in node.names]
                    elif isinstance(node, ast.Import):
                        paths = [n.name for n in node.names]
                    else:
                        continue
                    for name in paths:
                        self.assertTrue(denied.isdisjoint(name.split('.')), (file.name, name))

    def test_dimensional_laws_and_domain(self):
        rng = random.Random(339)
        for _ in range(200):
            length = rng.uniform(0, 40)
            self.assertAlmostEqual(measurement(META, length), 3 * length)
            metric = dict(META, outputUnit='m²')
            self.assertAlmostEqual(measurement(metric, length), .0003 * length)
        for law in [{'op': 'add', 'left': {'input': True}, 'right': {'value': 2, 'unit': 's'}},
                    {'op': 'divide', 'left': {'input': True}, 'right': {'value': 0, 'unit': '1'}},
                    {'value': 2, 'unit': []}]:
            with self.assertRaises(Problem):
                measurement(dict(META, law=law), 4)
        with patch.dict(os.environ, ASTRA_EXTENSIONS=str(EXAMPLES / 'extensions')):
            specimen = PACKAGE['records'][-1]
            validate_experiment(specimen)
            self.assertEqual([round(y, 12) for _, y in checkpoints(META, specimen['control'])],
                             [3, 6, 9, 12, 15, 18, 21, 24])
            for field, value in [('references', [[2, 6], [3, 8]]), ('control', dict(specimen['control'], step=0)),
                                 ('engine', {'id': 'area-rettangolo', 'version': '1.0.1'})]:
                with self.assertRaises(Problem):
                    validate_experiment(dict(specimen, **{field: value}))

    def test_installed_script_integrity(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp) / META['id'] / META['version']
            d.mkdir(parents=True)
            (d / 'manifest.json').write_text(json.dumps(META))
            (d / 'engine.js').write_text('export const measure = () => 0;')
            with self.assertRaisesRegex(Problem, 'Impronta'):
                load_registry(Path(tmp))

    def test_engine_version_is_immutable_across_restarts(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(store, 'DATA', Path(tmp)), patch.dict(
                os.environ, ASTRA_EXTENSIONS=str(EXAMPLES / 'extensions')):
            store.initialize()
            with store.connect() as db:
                altered = dict(META, legend='Legenda modificata')
                with patch('server.adapters.engines.registry', return_value={
                        (META['id'], META['version']):(altered, b'')}), self.assertRaisesRegex(Problem, 'nuova versione'):
                    bind_releases(db)

    def test_custom_assessment_retains_original_grading(self):
        profile = dict(title='Misura la superficie', papers=1, choices=1, completions=0, options=2,
                       minutes=[5], wrongPenalty=.25, medicalScale=False)
        pack = deepcopy(PACKAGE)
        pack['records'][0]['assessmentProfile'] = profile
        question = dict(kind='question', id='GEO-Q1', course='GEO', title='Area di una tessera', order=1,
                        section='Misure geometriche', skill='GEO-L01', family='tessere', prerequisites=['GEO-L01'],
                        difficulty=1, prompt='Base 4 cm, altezza 3 cm. Qual è l’area?', exam=1,
                        blocks=[dict(type='text', text='Moltiplica 4 per 3. Ottieni 12 centimetri quadrati.')],
                        hints=['Conta le tre file.'], error=dict(category='unità',message='Controlla le due dimensioni.',
                        target='GEO-L01'), answer=dict(type='choice',value='12 cm²',options=['12 cm²','7 cm²']))
        pack['records'].append(question)
        with tempfile.TemporaryDirectory() as tmp, patch.object(store, 'DATA', Path(tmp)), patch.dict(
                os.environ, ASTRA_EXTENSIONS=str(EXAMPLES / 'extensions')):
            store.initialize()
            user = dict(id='owner',role='autore')
            with store.connect() as db:
                result = editor.imported(db,user,pack,True)
                self.assertEqual(result['errors'], [])
                editor.publish(db,user,{r['id']:1 for r in pack['records']})
                rows = store.published(db)
                rid = learning.start(db,user,rows,dict(course='GEO',mode='exam',exam=1,requestId='esame-1'))['id']
                view = learning.details(db,user,rows,rid)
                self.assertEqual(len(view['items']),1)
                self.assertIn(view['deadline']-view['serverTime'], range(296,301))
                learning.details(db,user,rows,rid,dict(action='answer',idx=0,value='7 cm²'))
                course = store.record(db,'GEO',1)
                course['assessmentProfile'] = dict(profile, wrongPenalty=1)
                editor.write_draft(db,user,course,1)
                editor.publish(db,user,{'GEO':2})
                final = learning.details(db,user,store.published(db),rid,dict(action='finish'))
                self.assertEqual(final['assessmentProfile']['wrongPenalty'],.25)
                self.assertEqual(final['result']['score'],-.25)

    def test_prerequisites_and_evidence(self):
        rows = [dict(id='a', kind='lesson', version=2, title='Prima'), dict(id='b', kind='lesson', version=1,
                title='Dopo', prerequisites=['a'], coverage=['misura']), dict(kind='experiment', id='x', skill='b')]
        for parents in [['b'], ['ghost']]:
            with self.assertRaises(Problem):
                prerequisites({r['id']: r for r in [dict(rows[0], prerequisites=parents), rows[1]]})
        class Repo:
            def objects(self, course):
                return rows
            def observations(self):
                return {'a': {'state': 'da consolidare', 'families': 2}}
        result = learning_path(Repo(), 'GEO')
        self.assertEqual(result['lessons'][1]['next']['id'], 'a')
        self.assertEqual(result['lessons'][1]['resources']['experiment'], ['x'])

    def test_migrations_preserve_rollback_and_serialize(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'db'
            def upgrade(scripts):
                with closing(sqlite3.connect(path, timeout=8)) as db, db:
                    db.execute('BEGIN IMMEDIATE')
                    migrate(db, scripts)
            first = 'CREATE TABLE IF NOT EXISTS memory(id INTEGER PRIMARY KEY);'
            with closing(sqlite3.connect(path)) as db, db:
                db.execute(first)
                db.execute('INSERT INTO memory VALUES(339)')
            with self.assertRaises(sqlite3.OperationalError):
                upgrade([first, 'CREATE TABLE later(x); SELECT missing FROM memory;'])
            with closing(sqlite3.connect(path)) as db, db:
                self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 0)
                self.assertFalse(db.execute("SELECT 1 FROM sqlite_master WHERE name='later'").fetchone())
            with ThreadPoolExecutor(max_workers=4) as executor:
                list(executor.map(lambda _: upgrade([first, 'CREATE TABLE later(x);']), range(4)))
            with closing(sqlite3.connect(path)) as db, db:
                self.assertEqual(db.execute('SELECT * FROM memory').fetchall(), [(339,)])
                self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 2)
            with self.assertRaises(RuntimeError):
                upgrade([first])

    def test_stdio_service_denies_file_and_network_after_loading(self):
        trial = """import socket
from server.adapters.editorial_sandbox import confine_stdio
confine_stdio()
for op in (lambda: open('README.md', 'rb'), socket.socket):
    try:
        op()
    except PermissionError:
        continue
    raise AssertionError('capacità inattesa')
print('stdio disponibile')"""
        proof = subprocess.run([sys.executable, '-c', trial], cwd=ROOT, capture_output=True, text=True, check=True)
        self.assertEqual(proof.stdout.strip(), 'stdio disponibile')

    def test_editorial_scope_provider_protocols_and_deterministic_review(self):
        rows = store.catalog_seed()
        ws = EditorialWorkspace(rows, {'C6'}, json.loads((EXAMPLES/'authoring/concepts.json').read_text()),
                                {'search','read','propose'})
        key = ws.search('rimbalzo del suono')[0]['id']
        self.assertEqual(key, 'C6-L01')
        with self.assertRaises(Problem):
            ws.read('C1-L001')
        with self.assertRaises(Problem):
            EditorialWorkspace(rows, {'C6'}, {}, {'search'}).read(key)
        src = ws.read(key)
        proposal = dict(objectId=key, version=src['version'], passage=0, strategy='segui-un-esempio')
        for bad in [dict(proposal, passage=8), dict(proposal, version=50), dict(proposal, freeText='xxx')]:
            with self.assertRaises(Problem):
                ws.validate_proposal(bad, check_proposal)
        requests = []
        class Wire(BaseHTTPRequestHandler):
            def log_message(self, *_): pass
            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                requests.append((self.path, body))
                msg = {'content': json.dumps(proposal)}
                payload = {'message': msg} if self.path == '/api/chat' else {'choices':[{'message':msg}]}
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(payload).encode())
        with ThreadingHTTPServer(('127.0.0.1',0),Wire) as server:
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            try:
                for adapter, path in [(Ollama, '/api/chat'), (ChatCompletions,'/v1/chat/completions')]:
                    provider = adapter(f'http://127.0.0.1:{server.server_port}{path}', 'model-test')
                    result = ws.suggest(key, provider, schema('proposal-v1'), check_proposal)
                    self.assertEqual(result['citation'], src['passages'][0])
            finally:
                server.shutdown()
                worker.join()
        for index, (_, body) in enumerate(requests):
            self.assertEqual(json.loads(body['messages'][1]['content']), src)
            contract = body['format'] if index == 0 else body['response_format']['json_schema']['schema']
            self.assertEqual(contract, schema('proposal-v1'))

    def test_publication_rejects_cycles_atomically_and_scaffold_needs_two_steps(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(store, 'DATA', Path(tmp)), patch.dict(
                os.environ, ASTRA_EXTENSIONS=str(EXAMPLES/'extensions')):
            store.initialize()
            with store.connect() as db:
                user = {'id':'owner', 'role':'autore'}
                bad = deepcopy(PACKAGE)
                bad['records'][1]['prerequisites'] = ['GEO-L01']
                self.assertTrue(editor.imported(db, user, bad, True)['errors'])
                self.assertIsNone(db.execute("SELECT id FROM heads WHERE id='GEO'").fetchone())
                self.assertTrue(editor.imported(db, user, PACKAGE, True)['saved'])
                editor.publish(db, user, {r['id']:1 for r in PACKAGE['records']})
                proposal = dict(objectId='GEO-L01', version=1, passage=0, strategy='confronta-le-misure')
                before = editor.review_scaffold(db, user, proposal)
                self.assertNotIn('draftVersion', before)
                saved = editor.review_scaffold(db, user, proposal, True)
                self.assertEqual(saved['draftVersion'], 2)
                self.assertNotIn('scaffold', store.record(db,'GEO-L01',1))
                with self.assertRaises(Problem):
                    editor.review_scaffold(db, user, proposal, True)
                editor.publish(db, user, {'GEO-L01':2})
                self.assertEqual(store.record(db,'GEO-L01',2)['scaffold']['citation'], before['citation'])
