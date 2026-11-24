"""Encoded URL aliases must retain the authorization of their canonical resource."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

APP=Path(__file__).resolve().parents[1]
CODE='''
import hashlib,http.client,json,secrets,subprocess,sys,time
from server import store
store.initialize()
ticket=secrets.token_urlsafe(24)
with store.connect() as db:db.execute('INSERT INTO tickets VALUES(?,?)',(hashlib.sha256(ticket.encode()).hexdigest(),int(time.time())+120))
boot="from server.web import Handler,ThreadingHTTPServer;s=ThreadingHTTPServer(('127.0.0.1',0),Handler);print(s.server_port,flush=True);s.serve_forever()"
p=subprocess.Popen([sys.executable,'-uc',boot],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
try:
 port=int(p.stdout.readline())
 def get(path,cookie=None):
  c=http.client.HTTPConnection('127.0.0.1',port,timeout=10)
  c.request('GET',path,headers={'Cookie':cookie} if cookie else {})
  r=c.getresponse();status=r.status;body=r.read();c.close();return status,body
 aliases=['/figures/C6-impulso.svg','/%2e/figures/C6-impulso.svg','/%2ffigures/C6-impulso.svg','/unused/%2e%2e/figures/C6-impulso.svg','/FIGURES/C6-impulso.svg','/Figures/C6-impulso.svg']
 for path in aliases:assert get(path)[0]==403,(path,get(path)[0])
 for path in ['/figures./C6-impulso.svg','/figures%20/C6-impulso.svg']:
  assert get(path)[0] in (400,403,404),(path,get(path)[0])
 for path in ['/figures%5cC6-impulso.svg','/C%3a/figures/C6-impulso.svg']:
  assert get(path)[0]==400,path
 for path in ['/','/js/app.js','/api/state']:assert get(path)[0]==200,path
 c=http.client.HTTPConnection('127.0.0.1',port,timeout=10)
 c.request('POST','/api/owner',json.dumps({'ticket':ticket}),{'Content-Type':'application/json','X-Astra-Request':'1'})
 r=c.getresponse();assert r.status==200;r.read();cookie=r.getheader('Set-Cookie').split(';',1)[0];c.close()
 bodies=[get(path,cookie) for path in aliases]
 assert all(status==200 for status,_ in bodies)
 assert len({body for _,body in bodies})==1
 print('Guest aliases denied; authorized aliases identical; public presentation remains readable')
finally:p.terminate();p.wait(timeout=10)
'''


class ProtectedPaths(unittest.TestCase):
    def test_encoded_aliases_cannot_bypass_exam_figure_permissions(self):
        with tempfile.TemporaryDirectory(prefix='cric-protected-paths-') as home:
            run=subprocess.run([sys.executable,'-c',CODE],cwd=APP,
                env={**os.environ,'ASTRA_DATA':home,'ASTRA_HOSTED':'0','ASTRA_HTTPS':'0'},capture_output=True,text=True,timeout=40)
        self.assertEqual(run.returncode,0,run.stdout+run.stderr)


if __name__=='__main__':unittest.main()
