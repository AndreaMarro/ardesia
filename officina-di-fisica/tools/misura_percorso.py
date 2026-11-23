"""Bounded read benchmark of the normal learner endpoint on an isolated local archive."""
import json
import os
import platform
import statistics
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from http.client import HTTPConnection
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOT = ('from server.store import initialize,connect;from server.web import Handler,ThreadingHTTPServer;'
        'initialize();db=connect();n=db.execute("SELECT count(*) FROM heads WHERE live IS NOT NULL").fetchone()[0];db.close();s=ThreadingHTTPServer(("127.0.0.1",0),Handler);print(s.server_port,n,flush=True);s.serve_forever()')


def request(port, method, path, cookie=''):
    connection = HTTPConnection('127.0.0.1', port, timeout=10)
    headers = {'Cookie': cookie}
    body = None
    if method == 'POST':
        headers.update({'Content-Type':'application/json','X-Astra-Request':'1'})
        body = '{}'
    try:
        connection.request(method, path, body, headers)
        response = connection.getresponse()
        assert response.status == 200, response.status
        return json.loads(response.read()), (response.getheader('Set-Cookie') or '').split(';')[0]
    finally:
        connection.close()


def run(port, records):
    measurements = []
    cookies = [request(port,'POST','/api/demo')[1] for _ in range(4)]
    route = '/api/v1/courses/C6/learning-path'
    def read(index):
        start = time.perf_counter()
        result, _ = request(port,'GET',route,cookies[index % len(cookies)])
        elapsed = 1000 * (time.perf_counter() - start)
        assert len(result['lessons']) == 56 and all(row['independentFamilies'] == 0 for row in result['lessons'])
        return elapsed
    read(0)
    for workers in (1,4):
        start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=workers) as pool:
            durations = sorted(pool.map(read,range(40)))
        elapsed = time.perf_counter() - start
        measurements.append({'clientConcorrenti':workers, 'letture':len(durations),
            'p50ms':round(statistics.median(durations),1),'p95ms':round(durations[37],1),
            'lettureAlSecondo':round(len(durations)/elapsed,1)})
    assert all(item['p95ms'] < 2000 for item in measurements), measurements
    return {'endpoint':route,'lezioni':56,'oggettiInArchivio':records,'python':platform.python_version(),
            'sistema':platform.system(), 'architettura':platform.machine(),'misure':measurements}


if __name__ == '__main__':
    with tempfile.TemporaryDirectory() as temp:
        env = {**os.environ,'ASTRA_DATA':temp,'ASTRA_EXTENSIONS':str(Path(temp)/'plugins'),'ASTRA_LOG':'0'}
        with subprocess.Popen([sys.executable,'-uc',BOOT],cwd=ROOT,env=env,stdout=subprocess.PIPE,text=True) as proc:
            try:
                port, records = map(int, proc.stdout.readline().split())
                print(json.dumps(run(port, records),indent=2))
            finally:
                proc.terminate()
