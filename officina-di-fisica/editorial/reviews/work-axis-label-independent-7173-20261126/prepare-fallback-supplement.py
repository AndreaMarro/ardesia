from pathlib import Path
import json,hashlib,shutil
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');B=A/'editorial/reviews/work-axis-label-independent-7173-20261126';O=A/'output/playwright/work-axis-independent-7173-20261126';S=B/'fallback-control-supplement';S.mkdir();T=Path('/private/tmp/cric-work-axis-independent-a-ui-app');D=O/'fallback-control-supplement';D.mkdir()
sha=lambda x:hashlib.sha256(x).hexdigest();can=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()+b'\n'
s=(B/'collector-c1-derived.mjs').read_text();needle='legend:legend.textContent,legendLayout:';assert s.count(needle)==1
s=s.replace(needle,"actualViewControls:[...document.querySelectorAll('[data-view]')].map(e=>({view:e.dataset.view,text:e.textContent,disabled:e.disabled,hidden:e.hidden,ariaPressed:e.getAttribute('aria-pressed')})), actualHelp:document.querySelector('[data-help]').textContent, legend:legend.textContent,legendLayout:")
(S/'collector-c1-derived.mjs').write_text(s);(T/'collector-fallback-supplement-a.mjs').write_text(s)
shutil.copy2(B/'independent-primary.json',S/'independent-primary.json')
p=json.loads((O/'prepared.json').read_bytes());p['profiles']=[x for x in p['profiles'] if x['fallback']];p['records'][0]['grid']=[90];p['records'][0]['expectedValues']=[0];p['scope']='SUPPLEMENT_ONLY4_ACTUAL_FALLBACK_CONTROLS; DOES_NOT_REPLACE_CANONICAL40';p['course']='INDEPENDENT_FALLBACK_CONTROLS';p['expectedCaseKeys']=[]
for x in p['profiles']:
 stem='|'.join([p['records'][0]['id'],'published',str(x['width']),x['view']]);p['expectedCaseKeys']+=[stem+'|setup',stem+'|grid|0']
r=json.loads((B/'review-request.json').read_bytes());r['collectorSha256']=sha(s.encode());r['scope']=p['scope'];(S/'review-request.json').write_bytes(can(r));p['requestFile']=str(S/'review-request.json');p['requestSha256']=sha((S/'review-request.json').read_bytes());(D/'prepared.json').write_bytes(can(p));info={'candidateApp':str(T),'prepared':str(D/'prepared.json'),'output':str(D)};(D/'prepared-info.json').write_bytes(can(info))
r=(B/'run-independent-40.py').read_text().replace("/'collector-c1-derived.mjs'),sys.argv[1]]","/'collector-fallback-supplement-a.mjs'),sys.argv[1]]");(S/'run-supplement.py').write_text(r)
print(S/'run-supplement.py')
