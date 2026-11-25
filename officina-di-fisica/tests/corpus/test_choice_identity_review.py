"""Independent grading audit, including private pinned drafts over real HTTP.

The HTTP fixture never publishes a candidate and never touches an existing DB.
Its attempts are technical test data, not scientific/student-performance proof.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from server.domain.assessment import matches

APP = Path(__file__).resolve().parents[2]
HTTP_PROBE = r'''
import hashlib,http.cookiejar,json,secrets,threading,time
from pathlib import Path
from urllib import request,error
from server import store
from server.adapters.study_repository import SQLiteStudy
from server.web import Handler,ThreadingHTTPServer
from tools.corpus_engineering.draft_import import import_drafts

store.initialize()
ticket=secrets.token_urlsafe(32)
questions=[]
with store.connect() as db:
 before=[tuple(row) for row in db.execute('SELECT id,live FROM heads WHERE live IS NOT NULL ORDER BY id')]
 for batch,key in [('inelastic-rest-057','AR-u2-inelastic-rest-09'),('recoil-059','AR-u2-recoil-03')]:
  package=json.loads((Path('editorial/batches')/(batch+'.json')).read_text())
  import_drafts(db,{'id':'owner','role':'autore'},package)
  question=next(row for row in package['records'] if row['id']==key)
  draft=db.execute('SELECT draft,live FROM heads WHERE id=?',(key,)).fetchone()
  assert draft['live'] is None
  questions.append(store.record(db,key,draft['draft']))
 repo=SQLiteStudy(db)
 cases=[]
 for question in questions:
  for option in question['answer']['options']:
   rid=secrets.token_hex(12)
   item={'id':question['id'],'v':question['version'],'answer':None,'sent':False,'hints':0,'aided':False,'changes':0,'blank':False}
   repo.create_run(rid,'owner',question['course'],'practice',store.NOW(),None,[item],rid,None)
   cases.append((rid,question['id'],option,option==question['answer']['value']))
 db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+120))

server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
client=request.build_opener(request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
base='http://127.0.0.1:'+str(server.server_port)
def post(path,body):
 req=request.Request(base+path,json.dumps(body).encode(),headers={'Content-Type':'application/json','X-Astra-Request':'1'})
 with client.open(req,timeout=15) as response:
  assert response.status==200
  return json.loads(response.read())
try:
 post('/api/owner',{'ticket':ticket})
 for rid,key,value,expected in cases:
  response=post('/api/run/'+rid,{'action':'answer','idx':0,'value':value})
  actual=response['items'][0]['correct']
  assert actual is expected,(key,value,actual,expected)
 with store.connect() as db:
  after=[tuple(row) for row in db.execute('SELECT id,live FROM heads WHERE live IS NOT NULL ORDER BY id')]
  assert after==before
  attempts=db.execute('SELECT count(*),sum(correct) FROM attempts').fetchone()
  assert tuple(attempts)==(10,2),tuple(attempts)
  for question in questions:
   assert db.execute('SELECT live FROM heads WHERE id=?',(question['id'],)).fetchone()[0] is None
 print(json.dumps({'httpCases':len(cases),'correctChoices':2,'incorrectChoices':8,'attemptsPersisted':10,
                   'publishedHeadsUnchanged':len(before),'candidatePublication':'DRAFT_ONLY'}))
finally:
 server.shutdown();server.server_close();thread.join(timeout=5)
'''


class ChoiceIdentityIndependentReview(unittest.TestCase):
    def test_all_registered_and_original_choice_buttons_are_graded_by_identity(self):
        answers = []
        for path in (APP/'content').glob('*.json'):
            data = json.loads(path.read_text())
            if isinstance(data, list):
                answers.extend((row['id'], row['answer']) for row in data
                               if row.get('answer', {}).get('type') == 'choice')
        registry = json.loads((APP/'editorial/batches/registry.json').read_text())
        for spec in registry['batches']:
            package = json.loads((APP/'editorial/batches'/(spec['id']+'.json')).read_text())
            answers.extend((row['id'], row['answer']) for row in package['records']
                           if row.get('answer', {}).get('type') == 'choice')
        self.assertTrue({'AR-u2-inelastic-rest-09', 'AR-u2-recoil-03'} <= {key for key, _ in answers})
        for key, answer in answers:
            self.assertIn(answer['value'], answer['options'], key)
            for option in answer['options']:
                with self.subTest(key=key, option=option):
                    self.assertEqual(matches(answer, option), option == answer['value'])

    def test_normalization_is_compatible_only_without_option_ambiguity(self):
        ambiguous = {'type': 'choice', 'value': 'x²', 'options': ['x²', 'x2']}
        self.assertTrue(matches(ambiguous, 'x²'))
        self.assertFalse(matches(ambiguous, 'x2'))
        self.assertFalse(matches(ambiguous, ' X2 '))
        text = {'type': 'choice', 'value': 'L’energia è costante',
                'options': ['L’energia è costante', 'Diminuisce'], 'aliases': ['Invariata']}
        for value in [" L'ENERGIA E\u0300 COSTANTE ", 'invariata']:
            self.assertTrue(matches(text, value))
        self.assertFalse(matches(text, ' DIMINUISCE '))
        self.assertTrue(matches({'type': 'text', 'value': 'La forza'}, 'LA FORZA'))
        self.assertTrue(matches({'type': 'numeric', 'value': '-0.1'}, '−0,10'))
        self.assertFalse(matches({'type': 'numeric', 'value': '-0.1'}, 'Infinity'))

    def test_real_http_run_grades_and_persists_each_option_without_publication(self):
        with tempfile.TemporaryDirectory(prefix='cric-choice-identity-review-') as data:
            result = subprocess.run([sys.executable, '-c', HTTP_PROBE], cwd=APP,
                env={**os.environ, 'ASTRA_DATA': data, 'ASTRA_HOSTED': '0', 'ASTRA_HTTPS': '0',
                     'ASTRA_EXTENSIONS': str(APP/'extensions')}, text=True, capture_output=True, timeout=60)
        self.assertEqual(result.returncode, 0, result.stdout+result.stderr)
        proof = json.loads(result.stdout.splitlines()[-1])
        self.assertEqual((proof['httpCases'], proof['attemptsPersisted']), (10, 10))
        self.assertEqual((proof['correctChoices'], proof['incorrectChoices']), (2, 8))
        self.assertEqual(proof['candidatePublication'], 'DRAFT_ONLY')


if __name__ == '__main__':
    unittest.main()
