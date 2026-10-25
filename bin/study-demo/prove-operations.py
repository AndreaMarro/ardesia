#!/usr/bin/env python3
"""Actual cold HTTP restore and anti-resurrection on disposable synthetic copies."""
import argparse,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path[:0]=[str(ROOT/'packages/engine'),str(ROOT/'services/study-api')]
from lessonos.study.store import StudyStore
from lessonos.study.operations import backup_data,restore_data,erase_student,check_data
import httpx
parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('output',type=Path);parser.add_argument('--port',type=int,default=5231);args=parser.parse_args()
os.umask(0o077);args.output.mkdir(parents=True,exist_ok=False)
backup=args.source.with_name(args.source.name+'-m2-backup');restored=args.source.with_name(args.source.name+'-m2-restored');after=args.source.with_name(args.source.name+'-erased-restored')
report={'synthetic':True,'apiSpendUsd':0,'originalDataUnchanged':True}
report['backup']=backup_data(args.source,backup)
report['restore']=restore_data(backup,restored,args.source/'erasure-ledger.json')
store=StudyStore(restored/'study.sqlite')
assert store.connection.execute('SELECT COUNT(*) FROM study_sessions').fetchone()[0]==0
principal=store.connection.execute("SELECT id FROM study_principals WHERE role='student' AND id='student-02'").fetchone()
assert principal
from lessonos.study.models import Principal
student=Principal(principal[0],'student')
new_token=store.issue_session(student)
expected=store.connection.execute('SELECT COUNT(*) FROM study_submissions WHERE student_id=?',(student.id,)).fetchone()[0]
review=store.connection.execute('SELECT context_id FROM study_observations WHERE student_id=?',(student.id,)).fetchone()
assert expected>=2 and review
assets=store.connection.execute('SELECT id,sha256 FROM study_assets WHERE owner_id=?',(student.id,)).fetchall()
assert assets
with (args.output/'restored-server.log').open('w') as log:
 process=subprocess.Popen([sys.executable,str(ROOT/'bin/study-demo/serve.py'),'--data-dir',str(restored),'--port',str(args.port),'--no-seed'],cwd=ROOT,stdout=log,stderr=log)
 try:
  base=f'http://127.0.0.1:{args.port}'
  with httpx.Client(base_url=base,timeout=5) as client:
   for attempt in range(100):
    try:
     health=client.get('/study/health').json()
     if health.get('processId')==process.pid:break
    except httpx.HTTPError:pass
    time.sleep(.05)
   else:raise RuntimeError('restored_server_not_ready')
   assert client.post('/study/session',json={'token':new_token}).status_code==200
   workspace=client.get('/study/workspace',params={'editionId':'fluidi'}).json()
   assert len(workspace['submissions'])==expected
   packet=client.get('/study/context/'+review[0]).json()
   assert packet['observations']
   from lessonos.study.store import digest
   for asset in assets:assert digest(client.get('/study/assets/'+asset['id']).content)==asset['sha256']
   report['coldHTTP']={'processId':process.pid,'submissions':expected,'groundedObservations':len(packet['observations']),'verifiedAssets':len(assets),'sessionsReissuedAfterRestore':True}
 finally:
  process.terminate();process.wait(timeout=10)
store.close()
# Erase only a disposable restored copy, never the accepted journey database.
report['erasure']=erase_student(restored,student.id,apply=True)
report['oldBackupReplay']=restore_data(backup,after,restored/'erasure-ledger.json')
verified=StudyStore(after/'study.sqlite')
assert verified.connection.execute('SELECT COUNT(*) FROM study_submissions WHERE student_id=?',(student.id,)).fetchone()[0]==0
assert verified.connection.execute('SELECT COUNT(*) FROM study_assets WHERE owner_id=?',(student.id,)).fetchone()[0]==0
assert verified.connection.execute('SELECT COUNT(*) FROM study_observations WHERE student_id=?',(student.id,)).fetchone()[0]==0
assert verified.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==9
verified.close()
assert check_data(after)['ok']
report|={'passed':True,'restoredDir':str(restored),'erasedRestoreDir':str(after),'backupDir':str(backup),'humanPilot':'NOT_RUN'}
(args.output/'report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'report':str(args.output/'report.json')}))
