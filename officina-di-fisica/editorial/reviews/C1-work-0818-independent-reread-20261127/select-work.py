import pathlib,json,hashlib
D=pathlib.Path(__file__).resolve().parent;S=pathlib.Path('/private/tmp/cric-c1-two-families-0818-552-20261127')
sha=lambda b:hashlib.sha256(b).hexdigest()
r=json.loads((S/'report.json').read_bytes());t=json.loads((S/'terminal-receipt.json').read_bytes());p=json.loads((S/'prepared.json').read_bytes())
assert t['observedExitCode']==0 and sha((S/'report.json').read_bytes())==t['reportSha256']=='a20523cec5f7cf6b38ce251c4d9498958ea1062f123fbe81fd9d29457ec3fa40'
assert sha((S/'prepared.json').read_bytes())==t['preparedSha256']
assert r['runtimeFingerprint']['sha256']=='0818bc9e4051c7533a27688f784c46fa283928209f37b80870086fa4b20dc440'
assert r['sourceCommit']=='ad00ccac9e1d0839c45bd1880cb344b9334f2ae1'
rows=[]
for e in r['cases']:
 if not e['caseKey'].startswith('SIM-C1-L007-01|'):continue
 b=(S/e['file']).read_bytes();assert sha(b)==e['sha256'];c=json.loads(b);assert c['technicalOk'] and c['sourceSha256']=='f85003b40a9ad21a9aebb9d5568a2bbc15664d957dddf4dd47473d4e9182ad5c'
 for img in c['screenshots']:
  assert sha((S/img['file']).read_bytes())==img['sha256']
 rows.append({**e,'screenshots':c['screenshots'],'absoluteCasePath':str(S/e['file'])})
assert len(rows)==40
(D/'selected-index.json').write_text(json.dumps(rows,indent=2)+'\n')
(D/'external-observation.json').write_text(json.dumps({'sourceDirectory':str(S),'sourceCommit':r['sourceCommit'],'runtimeSha256':t['runtimeSha256'],'reportSha256':t['reportSha256'],'preparedSha256':t['preparedSha256'],'observedExitCode':0,'observedCasesWholeCampaign':552,'selectedCases':40,'uniqueSelectedPNG':len({s['sha256']for x in rows for s in x['screenshots']}),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
print('Selected',len(rows),'UniquePNG',len({s['sha256']for x in rows for s in x['screenshots']}))
