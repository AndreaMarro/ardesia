from fractions import Fraction as F
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');OUT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
appendix=OUT/'appendix-as-reviewed.md'
assert sha(appendix)=='9892804c57c0798c83656e3de5eef2a46550a54e2b3aaed73417c91509b8539e'
paths=['content/esperienze-C6.json','static/js/banchi/voci/modelli/C6.js','static/js/banchi/voci/esperimento.js','static/js/banchi/voci/assessment-selection.js','static/js/banchi/banco.js']
before={p:sha(ROOT/p)for p in paths}
assert (ROOT/paths[0]).read_bytes()==(OUT/'frozen-source-C6.json').read_bytes()
run=subprocess.run(['node',str(OUT/'actual-tasks.mjs')],capture_output=True,text=True,check=True)
(OUT/'actual-generated-tasks.json').write_text(run.stdout)
assert {p:sha(ROOT/p)for p in paths}==before
data=json.loads(run.stdout);sources=json.loads((OUT/'frozen-source-C6.json').read_bytes())
laws={'SIM-C6-L01-01':lambda x:F(17,100)*x,'SIM-C6-L02-01':lambda x:x/8,
 'SIM-C6-L03-01':lambda x:x/50,'SIM-C6-L04-01':lambda x:F(120,2**int(x)),
 'SIM-C6-L05-01':lambda x:2*x if x<=2 else 6-x,'SIM-C6-L06-01':lambda x:1-1/x}
literals={'SIM-C6-L01-01':['1.7','1.87'],'SIM-C6-L02-01':['3','2.5'],'SIM-C6-L03-01':['1.6','1'],
 'SIM-C6-L04-01':['15','7.5'],'SIM-C6-L05-01':['2','3.5'],'SIM-C6-L06-01':['0.5','0.4286']}
rows=[]
for source in sources:
 ident=source['id'];c=source['control'];low,high,step=(F(str(c[k]))for k in ('min','max','step'))
 grid=[low+i*step for i in range(int((high-low)/step)+1)];reference=[F(str(p[0]))for p in source['references']]
 extra=[x for x in grid if x not in reference];points=[reference[1],extra[len(extra)//2]]
 actual=next(r for r in data['records']if r['id']==ident)['assessment'];assert len(actual)==2
 tasks=[]
 for x,task,literal in zip(points,actual,literals[ident]):
  exact=laws[ident](x);assert float(exact)==task['value']or abs(float(exact)-task['value'])<=4*2**-52*max(1,abs(float(exact)))
  answer=F(literal);error=abs(answer-exact);bound=max(F(1,1000000),abs(exact)*F(5,1000));assert error<=bound
  assert abs(float(answer)-task['value'])<=max(.000001,abs(task['value'])*.005)
  assert task['unit']==source['measure']['unit']
  tasks.append({'inputExact':str(x),'expectedExact':str(exact),'manualLiteral':literal,'unit':task['unit'],'actualPrompt':task['prompt'],'actualValue':task['value'],'acceptedByUnchangedNumericRule':True})
 rows.append({'id':ident,'tasks':tasks,'textArithmeticAndUnits':'CORRECT','assumptions':'Read against the frozen assigned model; no new physical law inferred from geometry'})
assert len(rows)==6 and sum(len(r['tasks'])for r in rows)==12
# Literal long division, independently reconstructed rather than decimal approximation.
remainder=3;digits=[];remainders=[]
for _ in range(4):
 digit,remainder=divmod(10*remainder,7);digits.append(digit);remainders.append(remainder)
assert digits==[4,2,8,5]and remainders==[2,6,4,5]
assert F(3,7)-F(4285,10000)==F(5,7)*F(1,10000)
assert F(5,7)>F(1,2)
assert F(4286,10000)-F(3,7)==F(1,35000)
# Clarified inverse on return: elapsed time is not the absolute stopwatch time.
local=(F(2)-F(4))/F(-1);assert local==2 and 2+local==4
assert F(340,1000)/2==F(17,100)
assert F(24)/(F(1)*4*2)==3 and F(20)/(F(1)*4*2)==F(5,2)
assert F(4,5)*5*2==8 and F(8,400)==F(1,50)
assert sum([F(4),F(-2)])==2 and abs(F(4))+abs(F(-2))==6
result={'schemaVersion':'1.0.0','role':'INDEPENDENT_APPENDIX_CONTENT_REVIEW_ONLY','author':'root','reviewer':'author_vectors_b','appendixSha256':sha(appendix),'rootAppendixWasUntrackedAtRead':True,'rootContextHeadAtRead':'3097ddea36bdd0c8de4b20dd904302ee6940ff78','independentPrimarySha256':sha(OUT/'frozen-independent-primary.json'),'actualInputFilePins':before,'records':rows,'divisionBySeven':{'fourDigits':digits,'remainders':remainders,'residualAfter4285':'5/7 times10^-4','rounded':'0.4286','roundedErrorExact':'1/35000','correct':True},'cartInverseClarification':{'previousTextClarificationRequested':True,'currentTextRead':True,'localElapsedSeconds':2,'globalStopwatchSeconds':4,'noResidualFinding':True},'reviewResult':'NO_RESIDUAL_SCIENTIFIC_OR_DIDACTIC_FINDING_IN_REVIEWED_APPENDIX','UI_C6':'NOT_REVIEWED_AUTHOR_RECUSED_FROM_OWN_OVERLAY_ACCEPTANCE','acceptanceOfActivityOrSourceEditionGranted':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'independent-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('12 actual tasks, exact conversions, long division and local/global cart inverse checked; no residual finding in appendix; no C6 UI approval')
