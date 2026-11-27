from pathlib import Path
import json,hashlib
D=Path(__file__).resolve().parent;S=D/'actual-browser';H=lambda b:hashlib.sha256(b).hexdigest();J=lambda p:json.loads(p.read_bytes())
r=J(S/'report.json');t=J(D/'terminal-receipt.json');assert t['observedExitCode']==0 and t['observedSignal']is None;assert H((S/'report.json').read_bytes())==t['reportSha256']
rows=[]
for e in r['cases']:
 b=(S/e['file']).read_bytes();assert H(b)==e['sha256'];c=json.loads(b);assert c['technicalOk']
 for i in c['screenshots']:assert H((S/i['file']).read_bytes())==i['sha256']
 rows.append({**e,'file':'actual-browser/'+e['file'],'screenshots':[{**i,'file':'actual-browser/'+i['file']}for i in c['screenshots']]})
assert len(rows)==296
(D/'selected-index.json').write_text(json.dumps(rows,indent=2)+'\n')
prior=J(D/'prior-raster-read-log.json');assert not prior['pending'];seen={i['imageSha256']for i in prior['actuallyOpened']}
allsha={i['sha256']for row in rows for i in row['screenshots']};reuse=allsha&seen
priority={'SIM-C1-L006-03':'grid|2','SIM-C1-L007-01':'grid|1','SIM-C1-L007-02':'clock|0','SIM-C1-L007-03':'grid|2','SIM-C1-L006-01':'grid|2','SIM-C1-L006-02':'grid|2'}
chosen=[row for row in rows if row['caseKey'].endswith('|'+priority[row['caseKey'].split('|')[0]])]
chosen.sort(key=lambda row:(list(priority).index(row['caseKey'].split('|')[0]),row['caseKey']))
assert len(chosen)==48
# Every changed raster would also have to be opened; never silently reuse differing bytes.
for row in rows:
 if any(i['sha256']not in seen for i in row['screenshots'])and row not in chosen:chosen.append(row)
(D/'priority-raster-index.json').write_text(json.dumps(chosen,indent=2)+'\n')
(D/'raster-identity-reuse.json').write_text(json.dumps({'schemaVersion':'1.0.0','currentReportSha256':t['reportSha256'],'currentUniqueImageCount':len(allsha),'reusedImageSha256':sorted(reuse),'changedRasterCount':len(allsha-seen),'freshPriorityCasesToOpen':len(chosen),'priorEvidenceCommit':'a3235d2fd2bed3779c67bc4d97fa9d7e9bd51162','priorReadLogSha256':H((D/'prior-raster-read-log.json').read_bytes()),'meaning':'Verbatim raster identity reuse only; no old report/signature retag. Four reopened IDs are opened first in the current priority pass. All changed PNG would require a new opening.'},indent=2)+'\n')
print('Actual cases',len(rows),'uniquePNG',len(allsha),'verbatim prior read',len(reuse),'changed',len(allsha-seen),'priority',len(chosen))
