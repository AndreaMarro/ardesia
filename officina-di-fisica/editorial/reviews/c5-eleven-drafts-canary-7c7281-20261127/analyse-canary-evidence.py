from pathlib import Path
import json,hashlib,math
from PIL import Image,ImageOps,ImageDraw
F=Path(__file__).resolve().parent;OUT=F/'actual-ui-264';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report=json.loads((OUT/'report.json').read_text());plan=json.loads((F/'prepared.json').read_text());terminal=json.loads((F/'actual-ui-terminal.json').read_text())
assert terminal['actualExitCode']==0 and not terminal['timeout']
assert report['technicalStatus']=='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED' and report['errors']==[]
assert report['runtimeFingerprint']==plan['runtimeFingerprint'] and report['preparedSha256']==sha(F/'prepared.json') and report['requestSha256']==sha(F/'request.json')
assert len(report['cases'])==len(set(c['caseKey']for c in report['cases']))==264 and{c['caseKey']for c in report['cases']}==set(plan['expectedCaseKeys'])
cases=[];screens={}
for ref in report['cases']:
 p=OUT/ref['file'];assert sha(p)==ref['sha256'];row=json.loads(p.read_text());assert row['technicalOk']
 assert row['protocolSha256']=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
 assert row['runtimeSha256']==plan['runtimeFingerprint']['sha256'] and row['activityCredit']==0 and row['humanApproval']=='NOT_RUN'
 if row['caseKey'].endswith('setup'):
  assert row['axe']==[] and len(row['questions'])==2
  assert all(f['scroll']<=f['width']+1 for f in row['reading']['formulas'])
 else:
  assert row['legendLayout']['visible'] and row['legendLayout']['scrollWidth']<=row['legendLayout']['width']+1
 for screen in row['screenshots']:
  p=OUT/screen['file'];assert sha(p)==screen['sha256'];screens[screen['file']]=screen['sha256']
 cases.append(row)
contact=F/'contact-sheets';contact.mkdir(exist_ok=True);sheets=[]
for profile in plan['profiles']:
 for kind in ['setup','grid']:
  rows=[r for r in cases if r['profile']==profile and ('|setup'in r['caseKey'])==(kind=='setup')]
  assert len(rows)==(11 if kind=='setup' else 22)
  w,h=320,235;cols=4;canvas=Image.new('RGB',(cols*w,math.ceil(len(rows)/cols)*h),'white');draw=ImageDraw.Draw(canvas)
  for i,r in enumerate(rows):
   im=Image.open(OUT/r['screenshots'][0]['file']).convert('RGB');im.thumbnail((w-8,h-40));x=(i%cols)*w;y=(i//cols)*h
   canvas.paste(im,(x+(w-im.width)//2,y+35));draw.text((x+3,y+3),r['id']+' '+r['caseKey'].split('|')[-1],fill='black');draw.text((x+3,y+18),str(r.get('interaction',{}).get('x','setup'))+' '+str(profile['width'])+' '+profile['view'],fill='black')
  name=str(profile['width'])+'-'+profile['view']+'-'+kind+'.jpg';canvas.save(contact/name,quality=86);sheets.append({'file':'contact-sheets/'+name,'sha256':sha(contact/name),'cases':len(rows)})
summary={'actualExitCode':terminal['actualExitCode'],'actualElapsedSeconds':terminal['elapsedSeconds'],'cases':len(cases),'setupCases':sum(c['caseKey'].endswith('setup')for c in cases),'gradedAnswerChecks':sum(len(c.get('questions',[]))for c in cases),'selectedStateCases':176,'uniqueScreens':len(screens),'allCaseAndScreenshotHashesVerified':True,'allOwnerRecordsChecked':len(report['fullOwnerRecordIdentity']['records']),'browserVersion':report['browserVersion'],'guestIsolation':report['guestIsolation'],'newAssets':0,'asset403Scope':'No new assets: no nonempty draft asset403 cases. Existing source exam protection not separately probed here.','originalsCount':report['canonicalImport']['publishedCount'],'importResults':report['canonicalImport']['imports'],'runtimeCommit':plan['sourceCommit'],'draftCandidateCommit':plan['draftCandidateCommit'],'runtimeSha256':plan['runtimeFingerprint']['sha256'],'screenReading':'PENDING_INDEPENDENT_IMAGE_READING','contactSheets':sheets,'UIEvidenceScope':'11DRAFTreading/22assignedvalues/8profiles;notfull139orallclock/fullcontrolgrid','scientificApproval':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(F/'actual-evidence-analysis.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({k:v for k,v in summary.items()if k!='contactSheets'}))
