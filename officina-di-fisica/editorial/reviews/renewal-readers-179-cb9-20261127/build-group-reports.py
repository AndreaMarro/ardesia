"""Fresh twice per canonical group; UI failures are results, not omissions."""
from pathlib import Path
import sys,json,fcntl,shutil
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import readers_renewal_cb9_verifier as review
from tools.corpus_engineering.pipeline import canonical,sha
BASE=Path(__file__).resolve().parent
CURRENT=Path('/private/tmp/cric-method-css-748-independent-app')
def main():
    blueprint=json.loads((BASE/'reader-blueprint.json').read_bytes());source={r['id']:r['source']['record']for r in blueprint['records']}
    source.update({r['id']:r for r in json.loads((CURRENT/'content/metodo.json').read_bytes())})
    groups=[r for r in json.loads((APP/'editorial/reviews/renewal-240-927-inventory-20261126/plan.json').read_bytes())['groups']if r['class']=='IMMUTABLE_MATH_SOURCE_PLUS_ACTUAL_READER_RENEWAL_PLAN']
    out=BASE/'group-reports';out.mkdir(exist_ok=True);all_rows=[];identities=[]
    for group in groups:
        sources={k:source[k]for k in group['activityIds']};name=group.get('revisionPackage');args=[]
        if name:args=[json.loads((BASE/'canonical-package-inputs'/(name+suffix)).read_bytes())for suffix in['.json','-bindings.json']]
        first=review.report(sources,*args,app=CURRENT);second=review.report(sources,*args,app=CURRENT)
        a=canonical(first);b=canonical(second)
        if a!=b:raise ValueError('Fresh/saved strict identity differs: '+group['batchId'])
        file=out/(group['batchId']+'-renewal-cb9.json');file.write_text(a+'\n');all_rows.extend(first['records']);identities.append({'batch':group['batchId'],'freshCalls':2,'identical':True,'reportSha256':sha(file.read_bytes()),'records':len(first['records'])})
        print(group['batchId'],len(first['records']),'sourceMath',first.get('sourceMathOkCount',16),'allChecksOk',sum(r['ok']for r in first['records']),flush=True)
    if len(all_rows)!=189 or len({r['id']for r in all_rows})!=189:raise ValueError('Exactly179 readers plus10 worksheets required')
    summary={'canonicalGroups':len(groups),'uniqueRecords':189,'readerCatalogRecords':179,'worksheetRecords':10,'positiveCurrentIndividualResults':sum(r['ok']for r in all_rows),'failedCurrentIndividualResults':sum(not r['ok']for r in all_rows),'sourceMathAllCoherent':all(r.get('sourceMathChecksOk',r['ok'])for r in all_rows),'failedPublishedEditionJudgmentsRetained':sum(bool(r.get('failedPublishedEdition'))for r in all_rows),'activityCredit':0,'registryOrLedgerAction':'NONE','humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (BASE/'all-groups-fresh-saved-identity.json').write_text(canonical(identities)+'\n');(BASE/'canonical-group-summary.json').write_text(canonical(summary)+'\n');print(summary)
if __name__=='__main__':
    with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Need2GiB free')
        main()
