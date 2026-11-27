from pathlib import Path
from fractions import Fraction as F
import hashlib,json,subprocess,time
D=Path(__file__).resolve().parent
A=Path('/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica')
start=time.monotonic()
p=subprocess.run(['node',str(D/'collect-tasks.mjs'),str(A)],capture_output=True)
(D/'tasks.stdout.txt').write_bytes(p.stdout);(D/'tasks.stderr.txt').write_bytes(p.stderr);p.check_returncode()
rows=json.loads(p.stdout)
# Independent quantities were derived before these new manual paragraphs.
expected=[[(6,'1'),(4,'1')],[(10,'µN'),(F(45,8),'µN')],[(10,'kN/C'),(F(18,5),'kN/C')],[(0,'kN/C'),(F(45,2),'kN/C')],[(F(9,2),'mm'),(2,'mm')],[(F(9,2),'µJ'),(F(9,5),'µJ')],[(-6,'V'),(0,'V')],[(15,'µJ'),(12,'µJ')]]
verdict=[]
for row,values in zip(rows,expected,strict=True):
 for task,(value,unit)in zip(row['assessment'],values,strict=True):
  assert task['value']==float(value)
  assert task['unit']==('numero puro'if unit=='1'else unit)
 verdict.append({'id':row['id'],'textAndManualArithmetic':'PASS','independentExactTasks':[str(F(v))for v,u in values],'units':[u for v,u in values],'visualAcceptance':'NOT_IN_THIS_REVIEW'})
assert F(9*10**9)*F(1,10**18)/F(1,10**4)*10**6==90 # µN coefficient
assert F(9*10**9)*F(1,10**9)/F(1,10**4)/1000==90 # kN/C coefficient
assert F(9*10**9)*F(1,10**18)/F(1,100)*10**6==F(9,10) # pair energy µJ
assert F(1000)*F(3,1000)**2/2*1000==F(9,2)
report={'schemaVersion':'1.0.0','role':'INDEPENDENT_TEXT_AND_MANUAL_REVIEW','author':'Root','reviewer':'B','manualSha256':hashlib.sha256((D/'manual-actually-read.md').read_bytes()).hexdigest(),'compiledConsumerCommit':'b9994b9116e87478905191d85cca8037d17ae4bd','actualNodeExitCode':p.returncode,'perId':verdict,'conversionChecks':4,'actualTasks':16,'elapsedSeconds':time.monotonic()-start,'findings':[],'visualRoleDisclosure':'B authored C4 labels forL02-03/L03-02/L03-03 and is recused from their UI acceptance. Root authored this separate new manual; this review is text/math only for all eight IDs.','UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'independent-review.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps(report))
