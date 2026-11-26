"""Freeze original-source input projection, never inspect new author candidates."""
from pathlib import Path
import fcntl,hashlib,json,shutil,subprocess
BASE=Path(__file__).resolve().parent
APP=BASE.parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
POINTS={'SIM-C3-L07-05':['2.25','4'],'SIM-C4-L09-02':['30','90'],
'SIM-C5-L01-01':['0.5','1'],'SIM-C5-L02-03':['0.25','0.75'],
'SIM-C5-L03-02':['0.5','1'],'SIM-C5-L07-02':['2','3'],
'SIM-C5-L08-02':['2','4'],'SIM-C5-L09-02':['30','45']}
ALLOW=('id','kind','course','skill','version','title','summary','apparatus','control','measure','formula')
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()
def main():
 assert shutil.disk_usage(APP).free>=2*1024**3
 records=[];source_files={}
 for course in ('C3','C4','C5'):
  path='officina-di-fisica/content/esperienze-'+course+'.json'
  raw=subprocess.check_output(['git','show',REF+':'+path],cwd=APP)
  source_files[path]=sha(raw)
  for row in json.loads(raw):
   if row['id']in POINTS:
    records.append({'originalInputProjection':{k:row[k]for k in ALLOW},'selectedAssessmentInputs':POINTS[row['id']],
    'originalRecordSha256':sha(canonical(row)),'sourcePath':path,'sourceRef':REF})
 assert len(records)==8 and {r['originalInputProjection']['id']for r in records}==set(POINTS)
 out={'phase':'ORIGINAL_INPUT_PROJECTION_BEFORE_NEW_CANDIDATE_READING',
 'disclosure':'Reviewer previously solved/read the 139 original partial activities, including original models and generated tasks; this is not blind to originals. Only the eight selected input pairs were newly supplied by the separate author. No new Root candidate text, SVG, authoring module or answer has been read.',
 'allowlist':ALLOW,'excludedOriginalFields':['blocks','substitution','transferPrompt','references','interpretation'],
 'sourceFileSha256':source_files,'records':sorted(records,key=lambda r:r['originalInputProjection']['id']),
 'newCandidateExposure':'NONE','newCandidateWritten':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 blob=(json.dumps(out,sort_keys=True,ensure_ascii=False,indent=2)+'\n').encode();p=BASE/'input-projection.json'
 if p.exists():assert p.read_bytes()==blob,'Frozen input projection changed'
 else:p.write_bytes(blob)
 print('INPUT_PROJECTION',sha(blob))
if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);main()
