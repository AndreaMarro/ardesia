from pathlib import Path
import subprocess,sys,time,datetime,json,hashlib
batch,label,*cmd=sys.argv[1:];app=Path.cwd();t=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat();
try:
 r=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=60 if label=='structural' else 180);raw=r.stdout
except subprocess.TimeoutExpired as error:
 raw=(error.stdout or b'')+b'\nTimeoutExpired: canonical operation budget retained\n';r=subprocess.CompletedProcess(cmd,124,stdout=raw)

p=app/'editorial/author-notes'/('cric-author-'+batch+'-evidence');p.mkdir(exist_ok=True)
receipt={'scope':'author_technical_operation_only_not_independent_SCI_or_product_UI','batch':batch,'label':label,'cwd':str(app),'command':cmd,'startedAt':started,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'exitCode':r.returncode,'signal':-r.returncode if r.returncode<0 else None,'rawSha256':hashlib.sha256(raw).hexdigest(),'raw':raw.decode(),'scientificReview':'NOT_RUN','humanApproval':'NOT_RUN','publication':'DRAFT'}
(p/(label+'.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(raw.decode(),flush=True);r.check_returncode()
