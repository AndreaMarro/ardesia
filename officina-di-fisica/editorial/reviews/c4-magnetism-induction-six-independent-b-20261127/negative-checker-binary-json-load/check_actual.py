from pathlib import Path
from decimal import Decimal
import json,hashlib
from independent_math import exact,value,SPECS,verify_record
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());E=lambda p:json.loads(p.read_text(),parse_float=Decimal);H=lambda b:hashlib.sha256(b).hexdigest()
assert H((D/'primary-before-blocks.md').read_bytes())=='c039d58631fc38fd2984530169cdaeaace4e21930ac0ad7c2fef53acfd048499'
assert H((D/'independent-model-before-blocks.mjs').read_bytes())=='7a1e9a1aad911493c4c5b5d2f61653e076c7426c8a47f17c33a4ff19ce496959'
for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
pack=J(D/'package.json');author=J(D/'author-package.json');authorRows={r['id']:r for r in author['records']};assert len(authorRows)==7 and len(pack['records'])==6 and 'SIM-C4-L09-02'not in[r['id']for r in pack['records']]
rawOriginals={r['id']:r for r in J(D/'consumer/content/esperienze-C4.json')};bindings={b['id']:b for b in J(D/'package-bindings.json')};canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
for r in pack['records']:
 b=bindings[r['id']];assert r==authorRows[r['id']];assert H(canonical(r))==b['candidateSha256'];assert H(canonical(rawOriginals[r['id']]))==b['sourceSha256'];assert r['section']==rawOriginals[r['id']]['section']and r['skill']==rawOriginals[r['id']]['skill'];assert r['baseVersion']==rawOriginals[r['id']]['version']
for r in E(D/'package.json')['records']:verify_record(r)
prekey={r['id']:r for r in E(D/'pre-key-model.json')['records']};a=E(D/'actual-code.json');rows=[];total=0;stimuli={r['id']:r for r in J(D/'stimuli-prompt-data-only.json')['records']}
for r in a['results']:
 ident=r['id'];lo,hi,step,points,answers,unit,base=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step));assert len(r['states'])==int((hi-lo)/step)+1;states=[]
 def ieee(x):return next(s['independentIEEE']for s in prekey[ident]['states']if exact(s['x'])==exact(x))
 for i,c in enumerate(r['states']):
  x=exact(c['x']);assert x==lo+i*step;want=value(ident,x,True);observed=c['solve']['y'];assert observed==ieee(x),(ident,x,observed,ieee(x))
  states.append({'gridIndex':i,'input':str(x),'nominalExactGivenData':str(want),'actualOutputLexeme':str(observed),'strictPrekeyIEEERepresentationMatches':True})
 if r['variant']=='draft':
  selected=list(points);exactAnswers=list(answers)
  for q,x,y in zip(r['questions'],points,answers):assert q['value']==ieee(exact(x))and value(ident,x,True)==exact(y)and q['unit']==unit
  s=stimuli[ident];assert list(map(exact,s['proposedPointsOnly']))==list(map(exact,points))
  fmt=lambda x:format(Decimal(str(x)),'f').rstrip('0').rstrip('.')if '.'in str(x)else str(x)
  def formatted(x):return fmt(x).replace('.',',')+' '+s['control']['unit']
  actual=[q['prompt']for q in r['questions']];expected=['Imposta «'+s['control']['label']+'» su '+formatted(s['proposedPointsOnly'][0])+'. Quale valore ottieni per «'+s['measure']['label']+'»?',s['transferPrompt'].replace('{x}',formatted(s['proposedPointsOnly'][1]))]
  assert actual==expected,(ident,actual,expected)
 else:
  source=rawOriginals[ident];xs=[lo+i*step for i in range(int((hi-lo)/step)+1)];refs=[exact(str(t[0]))for t in source['references']];extra=[x for x in xs if x not in refs];selected=[str(refs[1]),str(extra[len(extra)//2]if extra else refs[0])];exactAnswers=[str(value(ident,x,True))for x in selected]
  for q,x in zip(r['questions'],selected):assert q['value']==ieee(exact(x))and q['unit']==unit
 assert len(r['questions'])==2
 rows.append({'id':ident,'variant':r['variant'],'manualPoints':selected,'manualNominalExactAnswers':exactAnswers,'sourceUnit':unit,'states':states,'actualQuestions':r['questions'],'actualQuestionDisplays':r['questionDisplays'],'literalPromptsMatchFrozenData':r['variant']=='draft'});total+=len(states)
assert len(rows)==12 and total==246
(D/'actual-comparison.json').write_text(json.dumps({'phase':'SIX_ID_CPU_SCIENTIFIC_COMPARISON','candidateCommit':'43083298dea4d10c37bc8940069e98ba66c464ce','states':total,'records':rows,'numericIsolation':'Frozen reference from fresh pre-key Node process without any consumer imports; strict Decimal lexeme comparison; no epsilon.','flux':'Manual cos120=-1/2/cos60=1/2 exact; actual V8 representation distinct and checked against isolated pre-key table.','clockParity':'Each legal input duration and five clock frames compared across editions; initial-reference duration excluded from metadata because references can change.','bindingIdentity':'ALL6_SOURCE_AND_CANDIDATE_CANONICAL_HASHES_MATCH','actualDraftManualTasks':12,'literalServedPromptsMatched':12,'originalAndDraftStates':'IDENTICAL_ASSERTED_BY_PRODUCER','excludedID':'SIM-C4-L09-02','Chrome':'NOT_RUN','canonicalDBImport':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0},ensure_ascii=False,indent=2,default=str)+'\n');print('Fresh six drafts / 12 manual tasks / 246 states; no browser')
