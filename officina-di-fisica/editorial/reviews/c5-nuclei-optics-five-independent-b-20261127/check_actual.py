from pathlib import Path
from decimal import Decimal
import json,hashlib
from independent_math import exact,value,SPECS,verify_record
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());E=lambda p:json.loads(p.read_text(),parse_float=Decimal);H=lambda b:hashlib.sha256(b).hexdigest()
assert H((D/'primary-before-blocks.md').read_bytes())=='370619a05ffe1319adebb9ffb4ad27d9a6fea3d7f4aa4b07ec14b26ed6298359'
assert H((D/'independent-model-before-blocks.mjs').read_bytes())=='2e7be93733fbe41854cf5713b1a156742ddf788c647014d6fb7dce7fd82686c8'
for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
pack=J(D/'package.json');assert len(pack['records'])==5
rawOriginals={r['id']:r for r in J(D/'consumer/content/esperienze-C5.json')};bindings={b['id']:b for b in J(D/'package-bindings.json')};canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
for r in pack['records']:
 b=bindings[r['id']];assert H(canonical(r))==b['candidateSha256'];assert H(canonical(rawOriginals[r['id']]))==b['sourceSha256'];assert r['section']==rawOriginals[r['id']]['section']and r['skill']==rawOriginals[r['id']]['skill'];assert r['baseVersion']==rawOriginals[r['id']]['version']
for r in E(D/'package.json')['records']:verify_record(r)
prekey={r['id']:r for r in E(D/'pre-key-model.json')['records']};a=E(D/'actual-code.json');rows=[];total=0;stimuli={r['id']:r for r in E(D/'stimuli-prompt-data-only.json')['records']}
for r in a['results']:
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step));assert len(r['states'])==int((hi-lo)/step)+1;states=[]
 def ieee(x):return next(s['independentIEEE']for s in prekey[ident]['states']if exact(s['x'])==exact(x))
 for i,c in enumerate(r['states']):
  x=exact(c['x']);assert x==lo+i*step;want=value(ident,x,True);observed=c['solve']['y'];assert observed==ieee(x),(ident,x,observed,ieee(x))
  states.append({'gridIndex':i,'input':str(x),'nominalExactGivenData':str(want),'actualOutputLexeme':str(observed),'strictPrekeyIEEERepresentationMatches':True})
 if r['variant']=='draft':
  selected=list(points);exactAnswers=list(answers)
  for q,x,y in zip(r['questions'],points,answers):assert q['value']==ieee(exact(x))and value(ident,x,True)==exact(y)and q['unit']==('numero puro'if unit=='1'else unit)
  s=stimuli[ident];assert list(map(exact,s['proposedPointsOnly']))==list(map(exact,points))
  candidate=next(v for v in E(D/'package.json')['records']if v['id']==ident)
  def formatted(x):
   if 'choices'in candidate['control']:return candidate['control']['choices'][int(exact(x))-int(exact(candidate['control']['min']))]
   numeric=format(Decimal(str(x)),'f')
   if '.'in numeric:numeric=numeric.rstrip('0').rstrip('.')
   return numeric.replace('.',',')+(' '+candidate['control']['unit']if candidate['control']['unit']!='1'else'')
  actual=[q['prompt']for q in r['questions']];expected=['Imposta «'+candidate['control']['label']+'» su '+formatted(s['proposedPointsOnly'][0])+'. Quale valore ottieni per «'+candidate['measure']['label']+'»?',candidate['transferPrompt'].replace('{x}',formatted(s['proposedPointsOnly'][1]))]
  assert actual==expected,(ident,actual,expected)
 else:
  source=rawOriginals[ident];xs=[lo+i*step for i in range(int((hi-lo)/step)+1)];refs=[exact(str(t[0]))for t in source['references']];extra=[x for x in xs if x not in refs];selected=[str(refs[1]),str(extra[len(extra)//2]if extra else refs[0])];exactAnswers=[str(value(ident,x,True))for x in selected]
  for q,x in zip(r['questions'],selected):assert q['value']==ieee(exact(x))and q['unit']==('numero puro'if unit=='1'else unit)
 assert len(r['questions'])==2
 rows.append({'id':ident,'variant':r['variant'],'manualPoints':selected,'manualNominalExactAnswers':exactAnswers,'sourceUnit':unit,'states':states,'actualQuestions':r['questions'],'actualQuestionDisplays':r['questionDisplays'],'literalPromptsMatchFrozenData':r['variant']=='draft'});total+=len(states)
assert len(rows)==10 and total==118
(D/'actual-comparison.json').write_text(json.dumps({'phase':'FIVE_C5_CPU_SCIENTIFIC_COMPARISON','candidateCommit':'4291f9ee053dbd40d7f7e66349e2955473161799','consumerCommit':'1b72b71a68a6023ab1c9fa189733947b03029914','states':total,'records':rows,'numericIsolation':'Frozen reference from fresh pre-key Node process without any consumer imports; strict Decimal lexeme comparison; no epsilon.','representation':'Exact rational manual calculations retained separately from actual IEEE outputs; isolated reference table and no epsilon.','clockParity':'Each legal input duration and five clock frames compared across editions; initial-reference duration excluded from metadata because references can change.','bindingIdentity':'ALL5_SOURCE_AND_CANDIDATE_CANONICAL_HASHES_MATCH','actualDraftManualTasks':10,'literalServedPromptsMatched':10,'originalAndDraftStates':'IDENTICAL_ASSERTED_BY_PRODUCER','Chrome':'NOT_RUN','canonicalDBImport':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0},ensure_ascii=False,indent=2,default=str)+'\n');print('Fresh five drafts / 10 manual tasks / 118 states; no browser')
