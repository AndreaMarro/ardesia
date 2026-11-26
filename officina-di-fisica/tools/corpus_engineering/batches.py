"""Versioned batch registry; each bounded family retains its own independent oracle."""
import importlib
import json
import re
from pathlib import Path

from jsonschema import Draft202012Validator,ValidationError

from .pipeline import canonical,digest,sha
from .integration import exercise
from .runtime_fingerprint import runtime_fingerprint
from .review_contract import exact_choice_identity
from .acceptance_withdrawals import load_ledger,acceptance_audit,assert_unchanged_acceptance

APP=Path(__file__).resolve().parents[2]


def report_differences(saved, fresh, limit=12):
    """Bound diagnostic output without changing strict evidence acceptance."""
    differences=[]
    missing=object()
    def summary(value):
        if value is missing:return '<missing>'
        if isinstance(value,(dict,list)):
            return {'type':type(value).__name__,'length':len(value)}
        return repr(value)[:240]
    def walk(left,right,path):
        if len(differences)>=limit or left==right:return
        if isinstance(left,dict) and isinstance(right,dict):
            for key in sorted(set(left)|set(right)):
                walk(left.get(key,missing),right.get(key,missing),path+'.'+str(key))
        elif isinstance(left,list) and isinstance(right,list) and len(left)==len(right):
            for index,(a,b) in enumerate(zip(left,right)):walk(a,b,path+'['+str(index)+']')
        else:differences.append({'path':path,'saved':summary(left),'fresh':summary(right)})
    walk(saved,fresh,'$')
    return differences


def assert_record_identity(records,expected_ids,package,bindings):
    ids=[r.get("id") for r in records]
    binding_ids=[b["id"] for b in bindings]
    if len(ids)!=len(expected_ids) or set(ids)!=expected_ids or len(binding_ids)!=len(expected_ids) or set(binding_ids)!=expected_ids:
        raise ValueError("Scientific output or bindings differ from registered unique IDs")
    candidates={r["id"]:r for r in package["records"]};sources={r["id"]:r for r in bindings}
    for result in records:
        key=result["id"]
        if (result.get("candidateSha256")!=digest(candidates[key]) or result.get("sourceSha256")!=sources[key]["sourceSha256"]
            or result.get("ok") is not True or result.get("verificationMode") not in ("EXACT_ORACLE","AI_CONCEPTUAL")
            or result.get("humanApproval")!="NOT_RUN" or result.get("publication")!="DRAFT"):
            raise ValueError("Scientific result has stale identity or invalid approval state")


def assert_browser_identity(browser,package_file,test_sha,runtime):
    if (browser.get("packageFileSha256")!=sha(package_file.read_bytes()) or browser.get("testSha256")!=test_sha
            or browser.get("runtimeFingerprint")!=runtime):
        raise ValueError("Browser package, instrument or runtime changed")


def load_registry(file=None):
    file=file or APP/"editorial/batches/registry.json"
    registry=json.loads(file.read_text())
    schema=json.loads((APP/"contracts/corpus-batches-v1.schema.json").read_text())
    try:Draft202012Validator(schema).validate(registry)
    except ValidationError as error:raise ValueError("Invalid batch registry: "+error.message) from error
    # The optional ledger is rooted at the application containing this registry.
    ledger_app=file.parent.parent.parent if file.name=="registry.json" and file.parent.name=="batches" and file.parent.parent.name=="editorial" else APP
    load_ledger(ledger_app,registry)
    seen_ids=set();seen_batches=set()
    for batch in registry["batches"]:
        if batch["id"] in seen_batches or seen_ids.intersection(batch["questionIds"]):
            raise ValueError("Duplicate batch or question identity")
        seen_batches.add(batch["id"]);seen_ids.update(batch["questionIds"])
    seen_activities=set()
    for batch in registry.get("activityBatches",[]):
        if batch["id"] in seen_batches or seen_activities.intersection(batch["activityIds"]):
            raise ValueError("Duplicate activity batch or activity identity")
        seen_batches.add(batch["id"]);seen_activities.update(batch["activityIds"])
    return registry["batches"]


def load_activity_registry(file=None):
    file=file or APP/"editorial/batches/registry.json"
    load_registry(file)
    return json.loads(file.read_text()).get("activityBatches",[])


def validate_browser_preview(batch,package_file,package,record_ids,app=APP):
    file=app/'editorial/reviews'/(batch+'-browser.json');browser=json.loads(file.read_text())
    assert_browser_identity(browser,package_file,sha((app/'tests/corpus/browser-drafts.mjs').read_bytes()),runtime_fingerprint(app))
    cases=browser['records'];expected={(key,width) for key in record_ids for width in (1440,768,320)}
    if len(cases)!=len(expected) or {(r['id'],r['width']) for r in cases}!=expected:
        raise ValueError('Incomplete browser cases: '+batch)
    blocks={row['id']:[*row.get('blocks',[]),*row.get('promptBlocks',[])] for row in package['records']}
    for case in cases:
        authored=blocks[case['id']]
        if (len(case['formulas'])<sum(b['type']=='formula' for b in authored)
            or case.get('figureCount',0)<sum(b['type']=='figure' for b in authored)):
            raise ValueError('Authored formula or figure omitted from private preview: '+case['id'])
    if set(browser['protectedAssets'])!={asset['id'] for asset in package.get('assets',[])}:
        raise ValueError('Draft assets were not checked for guest denial')
    if any(r['violations'] or r['overflow']>1 or any(f['scroll']>f['width']+1 or f['typeset']>f['width']+1 for f in r['formulas']) for r in cases):
        raise ValueError('Browser acceptance failed: '+batch)
    return file,len(cases)


def validate_batch(spec,app=APP):
    rule=json.loads((APP/"contracts/corpus-batches-v1.schema.json").read_text())["properties"]["batches"]["items"]
    try:Draft202012Validator(rule).validate(spec)
    except ValidationError as error:raise ValueError("Invalid batch specification") from error
    batch=spec["id"]
    acceptance=acceptance_audit(spec,set(spec["questionIds"]),app)
    package_file=app/"editorial/batches"/(batch+".json")
    binding_file=app/"editorial/batches"/(batch+"-bindings.json")
    package=json.loads(package_file.read_text());bindings=json.loads(binding_file.read_text())
    ids=[r["id"] for r in package["records"]]
    if len(ids)!=len(spec["questionIds"]) or set(ids)!=set(spec["questionIds"]):raise ValueError("Batch differs from registered IDs")
    for row in package['records']:
        if row['answer']['type']=='choice':
            quantities=[value for option in row['answer']['options'] if (value:=exact_choice_identity(option)) is not None]
            if len(quantities)!=len(set(quantities)):raise ValueError('Equivalent exact numeric choices: '+row['id'])
    module=importlib.import_module("."+spec["verifier"],__package__)
    scientific=app/"editorial/reviews"/(batch+".json")
    report=json.loads(scientific.read_text())
    current=module.verify(package,bindings)
    assert_record_identity(current,set(spec["questionIds"]),package,bindings)
    if not current or not all(r["ok"] for r in current) or current!=report["records"]:
        raise ValueError("Scientific evidence failed or stale: "+batch)
    if report["verifierSha256"]!=sha(Path(module.__file__).read_bytes()):raise ValueError("Verifier changed: "+batch)
    if "contractSha256" in report and report["contractSha256"]!=sha(Path(__file__).with_name("review_contract.py").read_bytes()):
        raise ValueError("Review contract changed: "+batch)
    integrated=exercise(batch)
    integration=app/"editorial/reviews"/(batch+"-integration.json")
    if integrated!=json.loads(integration.read_text()) or integrated["packageSha256"]!=digest(package):
        raise ValueError("Integration evidence changed: "+batch)
    browser_file,browser_count=validate_browser_preview(batch,package_file,package,spec['questionIds'],app)
    files={"package":package_file,"bindings":binding_file,"science":scientific,"integration":integration,"browser":browser_file}
    assert_unchanged_acceptance(acceptance,spec,set(spec["questionIds"]),app)
    audit={"acceptanceWithdrawals":acceptance} if acceptance else {}
    return {**audit,"spec":spec,"package":package,"bindings":bindings,"records":current,"browserCases":browser_count,
            "paths":{key:file.relative_to(app).as_posix() for key,file in files.items()},
            "checksums":{key:sha(file.read_bytes()) for key,file in files.items()}}


def assert_activity_identity(records,expected,sources,candidates=None,bindings=None):
    candidates=candidates or {};bindings=bindings or {}
    ids=[row['id'] for row in records]
    if len(ids)!=len(expected) or set(ids)!=set(expected):raise ValueError('Activity proof has incomplete or duplicate IDs')
    if set(candidates)!=set(bindings) or not set(candidates).issubset(expected):raise ValueError('Activity revision identity mismatch')
    for result in records:
        key=result['id'];action='DRAFT' if key in candidates else 'NONE'
        if (result.get('ok') is not True or result.get('sourceSha256')!=digest(sources[key])
            or result.get('humanApproval')!='NOT_RUN' or result.get('publicationAction')!=action
            or result.get('originalEditionRetained') is not True
            or result.get('calculationScope') not in ('NO_STUDENT_CALCULATION','EXACT_MANUAL_CALCULATION')
            or not all(result.get(name) for name in ('manualArithmetic','physicalAssumptions','pedagogicalReview'))):
            raise ValueError('Invalid individual activity evidence: '+key)
        if action=='NONE' and result.get('failedPublishedEdition',False) is not False:
            raise ValueError('An unchanged published edition cannot inherit a draft-only PASS: '+key)
        if key in candidates:
            row=candidates[key];binding=bindings[key]
            published=result.get('publishedEditionReview')
            if (not isinstance(published,dict) or published.get('sourceSha256')!=digest(sources[key])
                or type(published.get('ok')) is not bool or result.get('failedPublishedEdition') is not (not published['ok'])
                or published.get('humanApproval')!='NOT_RUN' or published.get('publicationAction')!='NONE'):
                raise ValueError('Activity draft must retain a separate source-edition judgment: '+key)
            if (result.get('candidateSha256')!=digest(row) or binding.get('candidateSha256')!=digest(row)
                or binding.get('sourceId')!=key or binding.get('sourceSha256')!=digest(sources[key])
                or row.get('kind')!=sources[key].get('kind','course')
                or type(row.get('baseVersion')) is not int or row['baseVersion']<sources[key].get('version',1)
                or type(row.get('version')) is not int or row['version']!=row['baseVersion']+1
                or result.get('candidateVersion')!=row['version'] or result.get('baseVersion')!=row['baseVersion']
                or not re.fullmatch('[a-f0-9]{64}',result.get('reviewedSignature',''))):
                raise ValueError('Activity draft source, version or candidate binding mismatch: '+key)


def validate_activity_batch(spec,sources,app=APP):
    rule=json.loads((APP/"contracts/corpus-batches-v1.schema.json").read_text())["properties"]["activityBatches"]["items"]
    try:Draft202012Validator(rule).validate(spec)
    except ValidationError as error:raise ValueError("Invalid activity batch specification") from error
    expected=set(spec['activityIds'])
    acceptance=acceptance_audit(spec,expected,app)
    if not expected.issubset(sources):raise ValueError('Activity source identity missing')
    selected={key:sources[key] for key in expected}
    module=importlib.import_module('.'+spec['verifier'],__package__)
    file=app/'editorial/reviews'/(spec['id']+'.json')
    revision=spec.get('revisionPackage');edition=None;candidates={};bindings={}
    if revision:
        package_file=app/'editorial/batches'/(revision+'.json');binding_file=app/'editorial/batches'/(revision+'-bindings.json')
        package=json.loads(package_file.read_text());binding_rows=json.loads(binding_file.read_text())
        candidates={r['id']:r for r in package['records']};bindings={r['id']:r for r in binding_rows}
        if len(candidates)!=len(package['records']) or len(bindings)!=len(binding_rows) or not 1<=len(candidates)<=100:
            raise ValueError('Activity revision batch must contain unique bounded IDs')
        current=module.report(selected,package,binding_rows)
    else:current=module.report(selected)
    saved=json.loads(file.read_text());records=current['records']
    assert_activity_identity(records,expected,selected,candidates,bindings)
    if saved!=current or saved['verifierSha256']!=sha(Path(module.__file__).read_bytes()):
        raise ValueError('Activity evidence changed: '+spec['id']+'; differences='+canonical(report_differences(saved,current)))
    if revision:
        integration=app/'editorial/reviews'/(revision+'-integration.json');integrated=exercise(revision)
        if integrated!=json.loads(integration.read_text()) or integrated['packageSha256']!=digest(package):
            raise ValueError('Activity draft integration evidence changed')
        browser,count=validate_browser_preview(revision,package_file,package,set(candidates),app)
        files={'package':package_file,'bindings':binding_file,'integration':integration,'browser':browser}
        edition={'paths':{k:p.relative_to(app).as_posix() for k,p in files.items()},
                 'checksums':{k:sha(p.read_bytes()) for k,p in files.items()},'browserCases':count}
    assert_unchanged_acceptance(acceptance,spec,expected,app)
    audit={'acceptanceWithdrawals':acceptance} if acceptance else {}
    return {**audit,'spec':spec,'records':records,'path':file.relative_to(app).as_posix(),'sha256':sha(file.read_bytes()),
            'revision':edition,'bindings':bindings}


if __name__=="__main__":
    batches=load_registry();validated=[validate_batch(spec) for spec in batches]
    print(canonical({"batches":len(validated),"revisedDrafts":sum(len(b["records"]) for b in validated),
        "browserCases":sum(b["browserCases"] for b in validated),"humanApproval":"NOT_RUN","newlyPublished":0}))
