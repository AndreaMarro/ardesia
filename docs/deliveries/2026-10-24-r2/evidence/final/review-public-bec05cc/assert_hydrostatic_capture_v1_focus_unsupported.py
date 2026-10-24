"""Read retained public UI observations; expectations are literal independent SI cases."""
import json,sys,base64,hashlib
from pathlib import Path
p=Path(sys.argv[1]);d=json.loads(p.read_text());n=d['normalized_result'];steps={s['step_id']:s for s in n['steps']};checks=[]
def a11y(name):return steps[name]['artifacts']['accessibility']['value']['text']
def dom(name):return steps[name]['artifacts']['dom']['value']['text']
def require(name,ok):
 checks.append({'check':name,'pass':bool(ok)})
for name in ('open-hydrostatic','invalid-overflow-prediction','change-absolute-clears-result','depth-home-zero','first-transfer','second-transfer-different'):
 require(name+'-solution-hidden','data-testid="hydrostatic-result"' not in dom(name) and 'data-testid="hydrostatic-graph"' not in dom(name))
require('overflow-prediction-not-submittable','button "Confronta la pressione" [disabled]' in a11y('invalid-overflow-prediction'))
for name,expected in [('reveal-wrong-gauge','19.620 Pa'),('reveal-absolute','120.945 Pa'),('reveal-absolute-at-surface','101.325 Pa'),('reveal-first-transfer','23.544 Pa'),('reveal-second-transfer','116.040 Pa')]:
 require(name+'-SI-oracle',expected in a11y(name))
require('wrong-prediction-preserved','textbox "Pressione prevista in Pa": "0"' in a11y('reveal-wrong-gauge') and 'La previsione differisce' in a11y('reveal-wrong-gauge'))
require('first-transfer-800-3-gauge',all(t in a11y('first-transfer') for t in ('slider "Profondità della sonda": "3"','option "800 kg/m³" [selected]','option "Relativa alla superficie" [selected]')))
require('second-transfer-1000-1.5-absolute',all(t in a11y('second-transfer-different') for t in ('slider "Profondità della sonda": "1.5"','option "1000 kg/m³" [selected]','option "Assoluta" [selected]')))
require('second-transfer-focused-empty-prediction','textbox "Pressione prevista in Pa" [active]' in a11y('second-transfer-different'))
require('final-hint-focus-preserved',any('button "Un altro indizio"' in line and '[active]' in line for line in a11y('second-hint').splitlines()))
require('human-review-limit-visible','Revisione scientifica umana da completare.' in a11y('open-assumptions'))
require('not-autonomy-claim','non è una consegna o una misura di autonomia' in a11y('open-assumptions'))
events=n.get('events',{}).get('items',[])
require('no-study-or-external-requests',all(not e.get('url',{}).get('url','').startswith('http') or e['url']['url'].startswith('http://127.0.0.1:5442/') and '/study/' not in e['url']['url'] for e in events if e.get('kind')=='request'))
require('no-failed-requests',not any(e.get('kind')=='request-failed' for e in events))
require('all-declared-gestures-completed',all(s['status']=='completed' for s in n['steps']))
report={'evidenceId':d.get('evidence_id'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'completeness':n.get('completeness'),'checks':checks,'pass':all(c['pass'] for c in checks)}
out=p.with_name(p.name.replace('-evidence.json','-assertions.json'));out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
for name in ('open-hydrostatic','reveal-second-transfer'):
 shot=steps[name]['artifacts']['screenshot']['value'];p.with_name(p.name.replace('-evidence.json','-'+name+'.png')).write_bytes(base64.b64decode(shot['data_base64']))
print(json.dumps({'evidenceId':report['evidenceId'],'checks':len(checks),'pass':report['pass'],'failed':[c['check'] for c in checks if not c['pass']]},indent=2))
if not report['pass']:raise SystemExit(1)
