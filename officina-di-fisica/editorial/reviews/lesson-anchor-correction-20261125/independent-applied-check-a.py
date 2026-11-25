"""Verify actual applied lesson bytes and rerun original independent oracles.

No package, registry, asset, test or runtime mutation. Only saves the reviewed
reports and this reproducible applied-edition evidence after actual execution.
"""
import ast
import hashlib
import importlib
import json
from pathlib import Path
import subprocess
import sys

APP=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(APP))
from tools.corpus_engineering.batches import assert_activity_identity,load_activity_registry
from tools.corpus_engineering.pipeline import digest
from tests.corpus.test_lesson_experiment_anchor_compatibility import source_catalog,missing_anchors


def run():
    folder=Path(__file__).resolve().parent
    snap=folder/'independent-before-applied-pins'
    modules=[('lessons_foundations_activity_verifier','lessons-foundations-011','lessons-foundations-revisions-054','C1-L002',(2,2)),('lessons_viscous_capillary_activity_verifier','lessons-viscous-capillary-015','lessons-viscous-revisions-073','C2-L007',(3,1))]
    packages=[APP/'editorial/batches'/(batch+suffix) for _,_,batch,_,_ in modules for suffix in ['.json','-bindings.json']]
    packages += [APP/'editorial/batches/registry.json']
    before={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest() for p in packages}
    results=[]
    for name,batch,revision,changed_id,original_counts in modules:
        module=importlib.import_module('tools.corpus_engineering.'+name)
        for suffix in ['.json','-bindings.json']:
            assert (APP/'editorial/batches'/(revision+suffix)).read_bytes()==(folder/(revision+suffix)).read_bytes()
        old=(snap/(name+'.py')).read_text();new=Path(module.__file__).read_text()
        old_tree=ast.parse(old);new_tree=ast.parse(new)
        funcs=lambda tree,text:{n.name:ast.get_source_segment(text,n) for n in tree.body if isinstance(n,ast.FunctionDef)}
        assert funcs(old_tree,old)==funcs(new_tree,new)
        old_pins=next(ast.literal_eval(n.value) for n in old_tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='REVIEWED_REVISIONS' for t in n.targets))
        assert [key for key in old_pins if old_pins[key]!=module.REVIEWED_REVISIONS[key]]==[changed_id]
        source_raw=subprocess.check_output(['git','show',module.SOURCE_REF+':'+module.SOURCE_PATH],cwd=APP)
        assert hashlib.sha256(source_raw).hexdigest()==module.SOURCE_FILE_SHA256
        sources={r['id']:r for r in json.loads(source_raw) if r['id'] in module.READ_SOURCE_SHA256}
        assert len(sources)==4
        package=json.loads((APP/'editorial/batches'/f'{revision}.json').read_text())
        bindings=json.loads((APP/'editorial/batches'/f'{revision}-bindings.json').read_text())
        original=module.report(sources)
        mixed=module.report(sources,package,bindings)
        assert (original['acceptedCount'],original['failedCount'])==original_counts
        assert mixed['acceptedCount']==4 and mixed['failedCount']==0
        assert_activity_identity(mixed['records'],set(module.READ_SOURCE_SHA256),sources,{r['id']:r for r in package['records']},{r['id']:r for r in bindings})
        old_original=json.loads((snap/(batch+'-originals.json')).read_text())
        assert original['records']==old_original['records']
        old_mixed=json.loads((snap/(batch+'.json')).read_text())
        altered=[]
        for previous,current in zip(old_mixed['records'],mixed['records']):
            assert previous['id']==current['id']
            diff=[k for k in previous if previous[k]!=current[k]]
            if diff:
                assert current['id']==changed_id
                assert set(diff)=={'candidateSha256','reviewedSignature'}
                altered.append(current['id'])
        assert altered==[changed_id]
        for suffix,report in [('-originals',original),('',mixed)]:
            path=APP/'editorial/reviews'/(batch+suffix+'.json')
            path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
            assert json.loads(path.read_text())==report
        fresh=module.report(sources,package,bindings)
        assert fresh==json.loads((APP/'editorial/reviews'/(batch+'.json')).read_text())
        assert_activity_identity(fresh['records'],set(module.READ_SOURCE_SHA256),sources,{r['id']:r for r in package['records']},{r['id']:r for r in bindings})
        results.append({'batch':batch,'revisedSignatureId':changed_id,'acceptedCount':mixed['acceptedCount'],'failedCount':mixed['failedCount'],'checks':sum(len(r['checks']) for r in mixed['records']),'retainedOriginalAcceptedFailed':list(original_counts),'originalRecordsByteEquivalent':True,'allOracleAndGuardFunctionBodiesByteIdentical':True,'freshSavedEqual':True,'verifierSha256':mixed['verifierSha256'],'sourceFileSha256':module.SOURCE_FILE_SHA256})
    catalog=source_catalog();experiments=[r for r in catalog.values() if r.get('kind')=='experiment'];effective=dict(catalog)
    for spec in load_activity_registry():
        if spec.get('revisionPackage'):
            p=json.loads((APP/'editorial/batches'/(spec['revisionPackage']+'.json')).read_text())
            for r in p['records']:effective[r['id']]=r
    assert len(catalog)==991 and len(experiments)==181 and missing_anchors(effective,experiments)==[]
    after={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest() for p in packages};assert before==after
    result={'schemaVersion':'1.0.0','reviewer':'independent_A_not_ROOT_author','proposalReviewProofSha256':hashlib.sha256((folder/'independent-proof-a.json').read_bytes()).hexdigest(),'actualAppliedFourFilesEqualToReadProposal':True,'reviewedResults':results,'all181OriginalExperimentEntryPointsPresentInActualRegisteredCohort':True,'registeredFilesPrePostSha256':before,'oracleAndGuardChanges':0,'testChanges':0,'newCompletedIdCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (folder/'independent-applied-proof-a.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'reviewedRecords':8,'checks':sum(r['checks'] for r in results),'changedSignatures':2,'originalFailuresRetained':3,'all181AnchorsPresent':True,'freshSavedEqual':True,'newCompletedIdCredit':0}))


if __name__=='__main__':run()
