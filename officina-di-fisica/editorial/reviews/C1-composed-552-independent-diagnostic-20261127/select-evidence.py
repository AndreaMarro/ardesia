import hashlib,json,pathlib,zipfile,shutil
D=pathlib.Path(__file__).resolve().parent
N=pathlib.Path('/private/tmp/cric-composed-c1-552-observation-20261127')
O=pathlib.Path('/private/tmp/cric-resident-integrator/officina-di-fisica/editorial/reviews/c1-foundation-work-current-audit-20261127')
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(p.read_bytes())
save=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
r=load(N/'report.json');p=load(N/'prepared.json');t=load(N/'terminal-receipt.json')
assert t['observedExitCode']==0 and len(r['cases'])==552 and r['errors']==[]
assert sha((N/'report.json').read_bytes())==t['reportSha256']
assert sha((N/'prepared.json').read_bytes())==t['preparedSha256']
assert set(p['expectedCaseKeys'])=={x['caseKey'] for x in r['cases']}
assert len({x['caseKey'] for x in r['cases']})==552
cs={}
for e in r['cases']:
 b=(N/e['file']).read_bytes();assert sha(b)==e['sha256'];c=json.loads(b);assert c['caseKey']==e['caseKey'] and c['technicalOk']
 assert c['runtimeSha256']==t['runtimeSha256']
 for s in c['screenshots']:assert sha((N/s['file']).read_bytes())==s['sha256']
 cs[e['caseKey']]=(e,c)
ids=['SIM-C1-L006-03','SIM-C1-L007-01','SIM-C1-L007-02','SIM-C1-L007-03']
keys=set()
for x in p['records']:
 variant='draft' if x['candidateSha256'] else 'published'
 for v in ['top','fixed_projection']:keys.add(f"{x['id']}|{variant}|320|{v}|grid|0")
for k,(e,c) in cs.items():
 if c['id'] in ids and c['profile']['width']==320 and c['profile']['view'] in ['top','fixed_projection'] and c.get('interaction',{}).get('kind') in ['grid','clock']:keys.add(k)
for ident,indexes in zip(ids,[[0],[0,1],[0,1],[0,1]]):
 for i in indexes:
  for v in ['top','fixed_projection']:keys.add(f'{ident}|published|1280|{v}|grid|{i}')
assert len(keys)==72
for epoch in ['current','before']:(D/epoch/'cases').mkdir(parents=True,exist_ok=True);(D/epoch/'screens').mkdir(exist_ok=True)
rows=[]
for k in sorted(keys):
 e,c=cs[k];shutil.copyfile(N/e['file'],D/'current'/e['file'])
 for s in c['screenshots']:shutil.copyfile(N/s['file'],D/'current'/s['file'])
 rows.append({'epoch':'current','key':k,'file':e['file'],'sha256':e['sha256'],'screenshots':c['screenshots']})
zpath=O/'actual-ui-552.zip';zsha=sha(zpath.read_bytes());assert zsha=='e1658f324c99c92a6a3ec6fb14f23b4d61def6e22020357d78ec6c0fd23731e3'
with zipfile.ZipFile(zpath) as z:
 assert len(set(z.namelist()))==len(z.namelist())
 assert all(not pathlib.PurePosixPath(n).is_absolute() and '..' not in pathlib.PurePosixPath(n).parts for n in z.namelist())
 ix=load(O/'actual-ui-552-index.json');index={x['file']:x['sha256'] for x in ix['files']}
 old=json.loads(z.read('report.json'));ob={x['caseKey']:x for x in old['cases']}
 oldkeys={k for k in keys if k.split('|')[0] in ids and '|320|' in k}
 for k in sorted(oldkeys):
  e=ob[k];b=z.read(e['file']);assert sha(b)==e['sha256']==index[e['file']];c=json.loads(b);assert c['caseKey']==k
  assert c['sourceSha256']==cs[k][1]['sourceSha256']
  (D/'before'/e['file']).write_bytes(b)
  for s in c['screenshots']:
   b=z.read(s['file']);assert sha(b)==s['sha256']==index[s['file']];(D/'before'/s['file']).write_bytes(b)
  rows.append({'epoch':'before','key':k,'file':e['file'],'sha256':e['sha256'],'screenshots':c['screenshots']})
 oldRuntime=old['runtimeFingerprint'].get('sha256')
for name in ['terminal-receipt.json','report.json','prepared.json','request.json','info.json']:shutil.copyfile(N/name,D/('current-'+name))
for name in ['actual-geometry-screen.json','actual-selected-image-read.json','actual-ui-552-index.json']:shutil.copyfile(O/name,D/('before-'+name))
save(D/'selected-index.json',rows)
save(D/'integrity.json',{'schemaVersion':'1.0.0','scope':'INITIAL_DIAGNOSTIC_NOT_ACTIVITY_ACCEPTANCE','newCasesMetadataAndHashesVerified':552,'selectedCurrent':len(keys),'selectedBefore':len(oldkeys),'archiveSha256':zsha,'currentRuntime':t['runtimeSha256'],'sourceRecordIdentityForOldPairs':True,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
print(json.dumps({'current':len(keys),'before':len(oldkeys),'uniquePNGs':len({(x['epoch'],s['sha256']) for x in rows for s in x['screenshots']})}))
