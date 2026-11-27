import json,os,re
from pathlib import Path
from datetime import datetime,timezone
from tools.corpus_engineering import batches
from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
p=Path('editorial/reviews/wavelength-24015-cb9-renewal-20261127');r=Path('editorial/reviews');batch='wavelength-in-medium-240';record='AR-u7-wavelength-in-medium-15';parse=lambda f:json.loads(f.read_bytes())
def dump(data):return (json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
def write(file,raw):
 tmp=file.with_name(file.name+'.cb9-tmp');tmp.write_bytes(raw);os.replace(tmp,file)
reg=Path('editorial/batches/registry.json');ledger=Path('editorial/acceptance/withdrawals-v1.json');reg_before,ledger_before=reg.read_bytes(),ledger.read_bytes();regobj=json.loads(reg_before);led=json.loads(ledger_before)
spec=next(s for s in regobj['batches']if s['id']==batch)
try:acceptance_audit(spec,{record},Path.cwd())
except ValueError as exc:assert str(exc)=='Acceptance closure runtime is stale'
else:raise AssertionError('Stale closure unexpectedly accepted')
review=(p/'actual-review-tests.txt').read_text();match=re.search(r'Ran ([1-9][0-9]*) tests? in ([\d.]+)s',review);assert match and review.rstrip().endswith('OK')
browser=p/'actual-browser/report.json';preview=parse(browser);assert len(preview['records'])==48 and parse(p/'browser-receipt.json')['actualExit']==0
fp=runtime_fingerprint(Path.cwd())['sha256'];assert fp==preview['runtimeFingerprint']['sha256']
canonical_browser=r/(batch+'-browser.json');assert not canonical_browser.exists();canonical_browser.write_bytes(browser.read_bytes())
row=next(row for row in led['withdrawals']if row['recordId']==record);prior=row['closure'];(p/'prior-closure.json').write_bytes(dump(prior));(p/'prior-ledger.json').write_bytes(ledger_before);(p/'prior-registry.json').write_bytes(reg_before)
updated={**prior,'closedAt':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),'runtimeSha256':fp,'reason':'Renewed on the cb9 runtime after the distinct scientific and pedagogical tests and 48 owner draft previews were repeated. Candidate, original source and keys unchanged. Prior closure retained. No additional question credit.'};row['closure']=updated
ledraw=dump(led);regobj['acceptanceWithdrawals']['sha256']=batches.sha(ledraw);regraw=dump(regobj)
try:
 write(ledger,ledraw);write(reg,regraw);batches.load_registry(reg);out=batches.validate_batch(spec);assert len(out['records'])==16 and out['browserCases']==48
except BaseException:
 write(ledger,ledger_before);write(reg,reg_before);canonical_browser.unlink();raise
work=r/'full-corpus-work-status-20261126.json';v=parse(work);v['registrySha256']=batches.sha(regraw);write(work,dump(v))
(p/'receipt.json').write_bytes(dump({'recordId':record,'batch':batch,'runtimeSha256':fp,'scientificReportSha256':updated['scientificReport']['sha256'],'browserReportSha256':batches.sha(browser.read_bytes()),'ownerPreviewCases':48,'individualScientificRecordsVerifiedFresh':16,'independentReviewTests':int(match[1]),'canonicalBatchValidator':'PASS','previousClosureArchived':True,'additionalQuestionCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}));print('Fresh 16-record validator PASS, 48 current previews. Exact closure renewed with zero question credit.')
