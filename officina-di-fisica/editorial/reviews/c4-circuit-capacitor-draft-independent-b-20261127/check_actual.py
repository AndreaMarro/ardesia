from pathlib import Path
from decimal import Decimal
import json,hashlib
from independent_math import exact,value,SPECS,verify_record
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());E=lambda p:json.loads(p.read_text(),parse_float=Decimal);H=lambda b:hashlib.sha256(b).hexdigest()
assert H((D/'primary-before-blocks.md').read_bytes())=='8acd982398a3596bf0b825f0e9aac5db071d45b9cb64f8d5c692d16395d0ef99'
for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
pack=J(D/'package.json');originals={r['id']:r for r in E(D/'consumer/content/esperienze-C4.json')};rawOriginals={r['id']:r for r in J(D/'consumer/content/esperienze-C4.json')};bindings={b['id']:b for b in J(D/'package-bindings.json')};canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
for r in pack['records']:
 b=bindings[r['id']];assert H(canonical(r))==b['candidateSha256'];assert H(canonical(rawOriginals[r['id']]))==b['sourceSha256'];assert r['section']==rawOriginals[r['id']]['section']and r['skill']==rawOriginals[r['id']]['skill']
for r in E(D/'package.json')['records']:verify_record(r)
a=E(D/'actual-code.json');rows=[];total=0;stimuli={r['id']:r for r in J(D/'stimuli-prompt-data-only.json')['records']}
for r in a['results']:
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step));assert len(r['states'])==int((hi-lo)/step)+1;states=[]
 def ieee(x):
  # Keep exact nominal arithmetic distinct from IEEE evaluation of the given
  # rounded decimal coefficient; strict equality, never an epsilon test.
  return float(exact('88.54'))/float(x)if ident=='SIM-C4-L07-01'else float(value(ident,x))
 for i,c in enumerate(r['states']):
  x=exact(c['x']);assert float(x)==float(lo)+i*float(step);want=value(ident,x,True);observed=c['solve']['y'];assert float(observed)==ieee(x)
  states.append({'gridIndex':i,'input':str(x),'nominalExactGivenData':str(want),'actualOutputLexeme':str(observed),'strictIEEERepresentationMatches':True})
 if r['variant']=='draft':
  selected=list(points);exactAnswers=list(answers)
  for q,x,y in zip(r['questions'],points,answers):assert exact(q['value'])==value(ident,x,True)==exact(y)and q['unit']==unit
  s=stimuli[ident];assert list(map(exact,s['proposedPointsOnly']))==list(map(exact,points))
  fmt=lambda x:str(x)+(' '+s['control']['unit']if s['control']['unit']!='1'else'')
  actual=[q['prompt']for q in r['questions']];expected=['Imposta «'+s['control']['label']+'» su '+fmt(s['proposedPointsOnly'][0])+'. Quale valore ottieni per «'+s['measure']['label']+'»?',s['transferPrompt'].replace('{x}',fmt(s['proposedPointsOnly'][1]))]
  assert actual==expected,(ident,actual,expected)
 else:
  source=originals[ident];xs=[lo+i*step for i in range(int((hi-lo)/step)+1)];refs=[exact(t[0])for t in source['references']];extra=[x for x in xs if x not in refs];selected=[str(refs[1]),str(extra[len(extra)//2]if extra else refs[0])];exactAnswers=[str(value(ident,x,True))for x in selected]
  for q,x in zip(r['questions'],selected):assert float(q['value'])==ieee(exact(x))and q['unit']==unit
 assert len(r['questions'])==2
 rows.append({'id':ident,'variant':r['variant'],'manualPoints':selected,'manualNominalExactAnswers':exactAnswers,'sourceUnit':unit,'states':states,'actualQuestions':r['questions'],'actualQuestionDisplays':r['questionDisplays'],'literalPromptsMatchFrozenData':r['variant']=='draft'});total+=len(states)
assert len(rows)==14 and total==176
(D/'actual-comparison.json').write_text(json.dumps({'phase':'NEW_POST_REBOOT_CPU_SCIENTIFIC_COMPARISON','candidateCommit':'6ec47222918635ae3ee38a11f4f5b3cbc9ccd5fa','states':total,'records':rows,'epsilon0':'Author-prescribed approximate8.854e-12F/m; exact nominal arithmetic is not exact physical constant.','capacityIEEE':'Given88.54 divided by actual x, strict equality; nominal rational tracked separately.','bindingIdentity':'ALL7_SOURCE_AND_CANDIDATE_CANONICAL_HASHES_MATCH','actualDraftManualTasks':14,'literalServedPromptsMatched':14,'originalAndDraftStates':'IDENTICAL_ASSERTED_BY_PRODUCER','Chrome':'NOT_RUN','canonicalDBImport':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0},ensure_ascii=False,indent=2,default=str)+'\n');print('Fresh post-reboot7drafts/14manualtasks/176states; no browser')
