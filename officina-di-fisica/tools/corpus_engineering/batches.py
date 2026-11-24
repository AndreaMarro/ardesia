"""Versioned batch registry; each bounded family retains its own independent oracle."""
import importlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator,ValidationError

from .pipeline import canonical,digest,sha
from .integration import exercise
from .runtime_fingerprint import runtime_fingerprint

APP=Path(__file__).resolve().parents[2]


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


def validate_batch(spec,app=APP):
    rule=json.loads((APP/"contracts/corpus-batches-v1.schema.json").read_text())["properties"]["batches"]["items"]
    try:Draft202012Validator(rule).validate(spec)
    except ValidationError as error:raise ValueError("Invalid batch specification") from error
    batch=spec["id"]
    package_file=app/"editorial/batches"/(batch+".json")
    binding_file=app/"editorial/batches"/(batch+"-bindings.json")
    package=json.loads(package_file.read_text());bindings=json.loads(binding_file.read_text())
    ids=[r["id"] for r in package["records"]]
    if len(ids)!=len(spec["questionIds"]) or set(ids)!=set(spec["questionIds"]):raise ValueError("Batch differs from registered IDs")
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
    browser_file=app/"editorial/reviews"/(batch+"-browser.json")
    browser=json.loads(browser_file.read_text())
    assert_browser_identity(browser,package_file,sha((app/"tests/corpus/browser-drafts.mjs").read_bytes()),runtime_fingerprint(app))
    cases=browser["records"]
    expected={(key,width) for key in spec["questionIds"] for width in (1440,768,320)}
    if len(cases)!=len(expected) or {(r["id"],r["width"]) for r in cases}!=expected:raise ValueError("Incomplete browser cases: "+batch)
    if set(browser["protectedAssets"])!={a["id"] for a in package.get("assets",[])}:
        raise ValueError("Draft assets were not checked for guest denial")
    if any(r["violations"] or r["overflow"]>1 or any(f["scroll"]>f["width"]+1 or f["typeset"]>f["width"]+1 for f in r["formulas"]) for r in cases):
        raise ValueError("Browser acceptance failed: "+batch)
    files={"package":package_file,"bindings":binding_file,"science":scientific,"integration":integration,"browser":browser_file}
    return {"spec":spec,"package":package,"bindings":bindings,"records":current,"browserCases":len(cases),
            "paths":{key:file.relative_to(app).as_posix() for key,file in files.items()},
            "checksums":{key:sha(file.read_bytes()) for key,file in files.items()}}


def validate_activity_batch(spec,sources,app=APP):
    rule=json.loads((APP/"contracts/corpus-batches-v1.schema.json").read_text())["properties"]["activityBatches"]["items"]
    try:Draft202012Validator(rule).validate(spec)
    except ValidationError as error:raise ValueError("Invalid activity batch specification") from error
    expected=set(spec['activityIds'])
    if not expected.issubset(sources):raise ValueError('Activity source identity missing')
    module=importlib.import_module('.'+spec['verifier'],__package__)
    file=app/'editorial/reviews'/(spec['id']+'.json')
    saved=json.loads(file.read_text());current=module.report(sources)
    records=current['records'];ids=[r['id'] for r in records]
    if len(ids)!=len(expected) or set(ids)!=expected:raise ValueError('Activity proof has incomplete or duplicate IDs')
    if saved!=current or saved['verifierSha256']!=sha(Path(module.__file__).read_bytes()):
        raise ValueError('Activity evidence changed: '+spec['id'])
    for result in records:
        if (result.get('ok') is not True or result.get('sourceSha256')!=digest(sources[result['id']])
            or result.get('humanApproval')!='NOT_RUN' or result.get('publicationAction')!='NONE'
            or result.get('originalEditionRetained') is not True
            or result.get('calculationScope') not in ('NO_STUDENT_CALCULATION','EXACT_MANUAL_CALCULATION')
            or not all(result.get(key) for key in ('manualArithmetic','physicalAssumptions','pedagogicalReview'))):
            raise ValueError('Invalid individual activity evidence: '+result['id'])
    return {'spec':spec,'records':records,'path':file.relative_to(app).as_posix(),'sha256':sha(file.read_bytes())}


if __name__=="__main__":
    batches=load_registry();validated=[validate_batch(spec) for spec in batches]
    print(canonical({"batches":len(validated),"revisedDrafts":sum(len(b["records"]) for b in validated),
        "browserCases":sum(b["browserCases"] for b in validated),"humanApproval":"NOT_RUN","newlyPublished":0}))
