from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
import json,hashlib
from independent_math import exact,value,inverse,SPECS,verify_record
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());E=lambda p:json.loads(p.read_text(),parse_float=Decimal);H=lambda b:hashlib.sha256(b).hexdigest();canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
assert H((D/'primary-before-blocks.md').read_bytes())=='256b640265c090bdbccfe96c3b9ce76876024217d29bf049a043019fe59ea5c8';assert H((D/'independent_math.py').read_bytes())=='94e31a308b16775b32d69f4b146a35f6b7c5e2f0af9b4b3cb6a1bee6286dd715'
for e in J(D/'git-inputs.json')['inputs']:assert H((D/e['snapshot']).read_bytes())==e['sha256']
pack=J(D/'package.json');orig={r['id']:r for r in J(D/'consumer/content/esperienze-C2.json')};bind={b['id']:b for b in J(D/'package-bindings.json')};results=E(D/'actual-code.json')['results'];rows=[]
for r in pack['records']:
 b=bind[r['id']];assert H(canonical(r))==b['candidateSha256'];assert H(canonical(orig[r['id']]))==b['sourceSha256'];assert r['section']==orig[r['id']]['section']and r['skill']==orig[r['id']]['skill']and r['baseVersion']==orig[r['id']]['version']
for r in E(D/'package.json')['records']:verify_record(r)
for a in results:
 ident=a['id'];lo,hi,step,points,answers,unit=SPECS[ident];assert len(a['states'])==8;states=[]
 for i,s in enumerate(a['states']):
  x=F(i+1);want=value(ident,x,True);expectedIEEE=Decimal(repr(float(want)));assert s['x']==x;assert s['solve']['y']==expectedIEEE,(ident,x,s['solve']['y'],expectedIEEE);states.append({'x':str(x),'exact':str(want),'observedOutputLexeme':str(s['solve']['y']),'correctlyRoundedRationalComparison':True})
 if a['variant']=='draft':selected=list(map(exact,points))
 else:
  refs=[exact(str(t[0]))for t in orig[ident]['references']];extra=[F(i)for i in range(1,9)if F(i)not in refs];selected=[refs[1],extra[len(extra)//2]if extra else refs[0]]
 assert len(a['questions'])==2
 for q,x in zip(a['questions'],selected):assert q['value']==Decimal(repr(float(value(ident,x,True))))and q['unit']==unit
 if a['variant']=='draft':
  r=next(v for v in pack['records']if v['id']==ident);fmt=lambda x:str(x).replace('.',',')+' '+r['control']['unit'];expected=['Imposta «'+r['control']['label']+'» su '+fmt(points[0])+'. Quale valore ottieni per «'+r['measure']['label']+'»?',r['transferPrompt'].replace('{x}',fmt(points[1]))];assert [q['prompt']for q in a['questions']]==expected
 rows.append({'id':ident,'variant':a['variant'],'states':states,'manualPoints':list(map(str,selected)),'manualExactAnswers':[str(value(ident,x,True))for x in selected],'actualQuestions':a['questions'],'literalDraftPromptVerified':a['variant']=='draft','unit':unit,'clock':a['clock']})
assert len(rows)==6
(D/'actual-comparison.json').write_text(json.dumps({'phase':'THREE_NETWORKS_CPU_COMPARISON','consumerCommit':'1b72b71a68a6023ab1c9fa189733947b03029914','runtimeSha256':'53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a','candidateCommit':'6d814834668d6370094800f2d72ed2fe768903c9','records':rows,'states':48,'actualDraftTasks':6,'literalServedDraftPromptsMatched':6,'comparison':'Independent exact Fraction laws; JSON output lexemes compared strictly with correctly rounded rational. No epsilon. All control inputs are exactly representable integers.','editionSceneParity':'States/params/spec/clock strictly equal across original and draft, asserted in actual collector.','Chrome':'NOT_RUN','DBImport':'NOT_RUN','activityCredit':0},ensure_ascii=False,indent=2,default=str)+'\n');print('6 editions /48 exact-law states /6 draft tasks and original tasks; no browser')
