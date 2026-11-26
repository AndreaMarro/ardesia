"""Fresh installed Node calculations only; no historical UI judgment is copied."""
from pathlib import Path
import ast,fcntl,hashlib,importlib,json,os,shutil,sys,types
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
BASE=Path(__file__).resolve().parent
CURRENT=Path('/private/tmp/cric-c1-five-927-review-app')
RUNTIME='9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d'
PLAN=APP/'editorial/reviews/renewal-240-927-inventory-20261126/plan.json'
RECUSED={'SIM-C1-L001-06','SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04','SIM-C1-L007-01'}
ALREADY={'SIM-C1-L004-02','SIM-C1-L004-04','SIM-C1-L005-05','SIM-C1-L006-02','SIM-C1-L008-03'}

def bind(fn,**overrides):
    fn=getattr(fn,'__wrapped__',fn)
    return types.FunctionType(fn.__code__,{**fn.__globals__,**overrides},fn.__name__,fn.__defaults__,fn.__closure__)

def dependencies(file,seen=None):
    seen=seen if seen is not None else set();file=Path(file)
    if file in seen:return seen
    seen.add(file)
    for node in ast.walk(ast.parse(file.read_text())):
        if isinstance(node,ast.ImportFrom)and node.level==1:
            for name in [node.module]if node.module else[n.name for n in node.names]:
                p=file.parent/(name.replace('.','/')+'.py')
                if p.is_file():dependencies(p,seen)
    return seen

def main():
    before=runtime_fingerprint(CURRENT);assert before['sha256']==RUNTIME
    plan=json.loads(PLAN.read_bytes());groups=[g for g in plan['groups']if g['class']in('RUNTIME_CONSUMER_FRESH_REQUIRED','INTERACTIVE_LAB_2D_FRESH_CONSUMER_REQUIRED')]
    records=[];failures=[]
    for group in groups:
        ids=set(group['ownActivityIds'])-ALREADY
        if not ids:continue
        assert not ids&RECUSED
        m=importlib.import_module('tools.corpus_engineering.'+group['verifier'])
        raw=(CURRENT/m.SOURCE_PATH.removeprefix('officina-di-fisica/')).read_bytes();assert sha(raw)==m.SOURCE_FILE_SHA256
        sources={r['id']:r for r in json.loads(raw)}
        pins=getattr(m,'READ_SOURCE_SHA256',getattr(m,'REVIEWED_SOURCES',{}))
        assert all(digest(sources[k])==pins[k]for k in ids)
        extras={};oracles={}
        if group['verifier']=='lab_activity_verifier':
            checks,oracles=m.independent_models();dimensions=m.dimensional_checks()
            for key in ids:checks[key]+=dimensions[key]
            actual=bind(m.runtime_values,APP=CURRENT)();expected=m.runtime_expected();comparison={}
            for key in ids:
                cases=actual[key];items=[]
                assert len(cases)==len(expected[key])
                for i,(case,wants)in enumerate(zip(cases,expected[key])):
                    for field,want in wants.items():items.append({'case':i,'field':field,'actual':case['output'].get(field),'independentExact':str(want),'ok':m.compare_value(case['output'].get(field),want)})
                comparison[key]={'ok':all(v['ok']for v in items),'checks':items,'caseCount':len(cases)}
        elif group['verifier']=='bench_mechanics_fluids_activity_verifier':
            checks=m.exact_checks();actual=bind(m.runtime_values,APP=CURRENT)()
            comparison={k:{'ok':all(x['ok']for x in v),'checks':v,'caseCount':len(v)}for k,v in bind(m.runtime_checks,runtime_values=lambda:actual)().items()}
        elif group['verifier']=='bench_fields_optics_activity_verifier':
            checks=m.independent_checks();actual=m.runtime_values(CURRENT);comparison=m.compare_runtime(actual)
        else:
            # The inherited pure model routine may construct an unselected check;
            # only these independent IDs are compared, serialized or judged here.
            checks=m.independent_checks();specs={k:v for k,v in m.SPECS.items()if k in ids}
            actual=bind(m.runtime_values,APP=CURRENT,SPECS=specs)({k:sources[k]for k in ids})
            assert set(actual)==ids
            comparison=bind(m.compare_runtime,SPECS=specs)(actual)
            if hasattr(m,'corrected_scene_checks'):extras=bind(m.corrected_scene_checks,SPECS=specs)(actual)
            elif hasattr(m,'force_diagram_checks'):extras=m.force_diagram_checks(actual)
        deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in dependencies(m.__file__)}
        deps[str(Path(__file__).relative_to(APP))]=sha(Path(__file__).read_bytes());dep=digest(deps)
        selected=[]
        for key in sorted(ids):
            physical=checks[key]+extras.get(key,[]);engine=comparison[key]
            passed=bool(physical)and all(c['ok']for c in physical)and engine['ok']
            row={'id':key,'sourceSha256':digest(sources[key]),'sourceRef':m.SOURCE_REF,'sourcePath':m.SOURCE_PATH,'sourceFileSha256':m.SOURCE_FILE_SHA256,
                 'sourceMathAndNodeChecksOk':passed,'ok':False,'overallAcceptance':'NOT_GRANTED','checks':physical,'runtimeComparison':engine,
                 'manualArithmetic':m.MANUAL[key],'physicalAssumptions':m.ASSUMPTIONS[key],'pedagogicalReview':getattr(m,'PEDAGOGY',{}).get(key,'Existing source/assigned-task review reused; no new student usability evidence.'),
                 'runtimeSha256':RUNTIME,'reviewDependencySha256':dep,'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
            if key in oracles:row['independentExactOracles']=oracles[key]
            if not passed:failures.append({'id':key,'mathOrEngineChecksFailed':True})
            selected.append(row);records.append(row)
        out={'batch':group['batchId'],'selectedRecords':selected,'rawFreshInstalledNode':actual,'dependencies':deps,
             'scope':'Unchanged exact/manual models and fresh installed Node source/clock/readout checks only; no native/fallback/layout acceptance','runtimeSha256':RUNTIME,
             'priorExposure':'Previously reviewed source models reused, not a new blind derivation. Six authored native-vector IDs excluded from comparison and all recorded judgments.',
             'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0}
        (BASE/(group['batchId']+'-math-engine-partial.json')).write_text(canonical(out)+'\n')
        print(group['batchId'],len(ids),'sourceMathNodeOk',sum(x['sourceMathAndNodeChecksOk']for x in selected),flush=True)
    assert len(records)==46 and len({r['id']for r in records})==46 and not({r['id']for r in records}&(RECUSED|ALREADY))
    assert runtime_fingerprint(CURRENT)==before
    summary={'recordCount':46,'uniqueIds':sorted(r['id']for r in records),'sourceMathNodeOkCount':sum(r['sourceMathAndNodeChecksOk']for r in records),
             'failures':failures,'runtimeFingerprintBeforeAndAfter':before,'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0,'overallAcceptance':'NOT_GRANTED'}
    (BASE/'summary.json').write_text(canonical(summary)+'\n')
    if failures:raise ValueError('Partial model checks failed; preserved, no acceptance')

if __name__=='__main__':
    with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Need2GiB free')
        main()
