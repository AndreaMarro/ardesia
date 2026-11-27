from pathlib import Path
import json,sys,hashlib
from PIL import Image,ImageDraw
folder=Path(__file__).parent;d=folder/sys.argv[1];a=d/'actual';sha=lambda b:hashlib.sha256(b).hexdigest();plan=json.loads((d/'prepared.json').read_bytes());terminal=json.loads((d/'actual-terminal.json').read_bytes());report=json.loads((a/'report.json').read_bytes());index=[json.loads(s)for s in(a/'completed-cases.jsonl').read_text().splitlines()];rows=[]
assert len(index)==len(plan['expectedCaseKeys']);assert set(r['caseKey']for r in index)==set(plan['expectedCaseKeys']);assert len(set(r['caseKey']for r in index))==len(index)
for i in index:
 raw=(a/i['file']).read_bytes();assert sha(raw)==i['sha256'];row=json.loads(raw);assert row['caseKey']==i['caseKey'];assert row['runtimeSha256']==plan['runtimeFingerprint']['sha256']
 for s in row['screenshots']:assert sha((a/s['file']).read_bytes())==s['sha256']
 rows.append(row)
assert len(report['cases'])==len(rows);sheets=[]
for profile in plan['profiles']:
 key=f"{profile['width']}-{profile['view']}";group=[r for r in rows if r['profile']==profile];cw,ch=430,370;cols=3;out=Image.new('RGB',(cols*cw,((len(group)+cols-1)//cols)*ch),'white');draw=ImageDraw.Draw(out)
 for j,row in enumerate(group):
  x=j%cols*cw;y=j//cols*ch;draw.text((x+4,y+2),row['caseKey'].replace('SIM-C2-',''),fill='black')
  if row['screenshots']:
   im=Image.open(a/row['screenshots'][0]['file']).convert('RGB');im.thumbnail((cw-8,ch-30));out.paste(im,(x+(cw-im.width)//2,y+26))
  else:draw.text((x+10,y+80),row.get('error','NO SCREENSHOT')[:160],fill='red')
 p=d/f'contact-{key}.png';out.save(p);sheets.append({'file':p.name,'sha256':sha(p.read_bytes()),'cases':len(group)})
summary={'phase':'ACTUAL_UI_TECHNICAL_RESULTS_VISUAL_READING_SEPARATE','runtimeSha256':plan['runtimeFingerprint']['sha256'],'collectorSha256':report['protocolSha256'],'expectedCases':len(index),'actualCases':len(rows),'technicalPass':sum(r['technicalOk']for r in rows),'technicalFailures':[{'caseKey':r['caseKey'],'error':r.get('error')}for r in rows if not r['technicalOk']],'processExitCode':terminal['exitCode'],'timeoutTriggered':terminal.get('timeoutTriggered'),'javascriptErrors':report['errors'],'setupQuestions':sum(len(r.get('questions',[]))for r in rows),'uniqueScreenshots':len({s['sha256']for r in rows for s in r['screenshots']}),'contactSheets':sheets,'activityCredit':0,'publicationAction':'NONE','humanApproval':'NOT_RUN','visualJudgment':'PENDING_INDEPENDENT_RASTER_READING'};(d/'technical-summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n');print(json.dumps(summary,ensure_ascii=False))
