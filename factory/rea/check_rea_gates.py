#!/usr/bin/env python3
"""Checks receipt structure and artifact hashes; DOES NOT execute or attest REA.

Run inside Codex source repo with real evidence artifacts available:
  python factory/rea/check_rea_gates.py --gate G0 --sha <40_HEX_COMMIT>
The handoff packet starts NOT_RUN; this script MUST fail until actual REA runs.
"""
from __future__ import annotations
import argparse,hashlib,json,re,sys,tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOWED_STEPS = {'capture_browser_scenario','inspect_web_page'}
DEEP_STEPS = {'analyze_javascript_application','analyze_web_bundle','trace_application_feature','trace_javascript_semantics','reconcile_javascript_runtime','compare_application_versions','compare_source_to_bundle','export_web_scripts'}
HEX40=re.compile(r'^[0-9a-f]{40}$'); HEX64=re.compile(r'^[0-9a-f]{64}$')

def sha256_file(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for buf in iter(lambda:f.read(1048576),b''):h.update(buf)
    return h.hexdigest()

def load_json(path:Path):
    return json.loads(path.read_text(encoding='utf-8'))

def reject_missing(root:Path, rel:str)->str|None:
    p=(root/rel).resolve()
    if not p.is_relative_to(root.resolve()):return f'unsafe path outside repository: {rel}'
    if not p.is_file():return f'file missing: {rel}'
    return None

def check_receipt(root:Path,mission:str,product_sha:str, external:bool)->list[str]:
    errors=[]
    file=root/'state/rea-receipts'/f'{mission}.json'
    if not file.is_file():return [f'{mission}: receipt missing: {file.relative_to(root)}']
    try:r=load_json(file)
    except Exception as e:return [f'{mission}: invalid JSON: {e}']
    if r.get('schema')!='ardesia.rea-execution-receipt/4':errors.append('schema mismatch')
    if r.get('mission_id')!=mission:errors.append('wrong mission_id')
    if r.get('status')!='PASS':errors.append(f"status={r.get('status')} (must be PASS)")
    if r.get('synthetic') is not False:errors.append('synthetic/mock receipt cannot count as execution')
    if r.get('product_commit')!=product_sha:errors.append('receipt not tested on requested product commit')
    if not r.get('rea_version') or not isinstance(r.get('rea_version'),str):errors.append('REA version missing')
    if external and r.get('target_kind') not in ('EXTERNAL_OPEN_SOURCE','THIRD_PARTY_AUTHORIZED'):errors.append('required external target has not been observed')
    if not external and r.get('target_kind') not in ('OWN_ARDESIA','EXTERNAL_OPEN_SOURCE','THIRD_PARTY_AUTHORIZED'):errors.append('unrecognized target kind')
    if not isinstance(r.get('authorization_basis'),str) or len(r['authorization_basis'])<8:errors.append('authorization basis missing')
    operations=set(r.get('rea_operations',[]) or [])
    if not operations.intersection(ALLOWED_STEPS):errors.append('no actual REA browser observation tool')
    if not operations.intersection(DEEP_STEPS):errors.append('no REA deep structure/trace/compare tool')
    if mission=='R6' and not operations.intersection({'compare_web_captures','compare_application_versions','compare_source_to_bundle','trace_application_feature'}):errors.append('R6 missing comparative REA step')
    items=r.get('evidence')
    if not isinstance(items,list):items=[];errors.append('evidence list missing')
    kinds={x.get('kind') for x in items if isinstance(x,dict)}
    required={'browser','structure','contract','test'} | ({'comparison'} if mission=='R6' else set())
    for missing in sorted(required-kinds):errors.append(f'missing artifact kind {missing}')
    for x in items:
        if not isinstance(x,dict):errors.append('malformed artifact');continue
        rel=x.get('path','')
        if not isinstance(rel,str) or not rel or rel.startswith('/'):errors.append('artifact path must be relative');continue
        problem=reject_missing(root,rel)
        if problem:errors.append(problem);continue
        digest=x.get('sha256','')
        if not isinstance(digest,str) or not HEX64.fullmatch(digest):errors.append(f'invalid sha256: {rel}')
        elif sha256_file(root/rel)!=digest:errors.append(f'sha256 mismatch: {rel}')
        elif x.get('kind') in ('browser','structure','comparison'):
            try:
                evidence_doc=load_json(root/rel)
                evid_id=evidence_doc.get('evidence_id')
                operation=evidence_doc.get('operation')
                if not isinstance(evid_id,str) or not evid_id:errors.append(f'REA evidence_id missing: {rel}')
                if not isinstance(evidence_doc.get('normalized_result'),dict):errors.append(f'REA normalized_result missing: {rel}')
                if not isinstance(operation,str) or operation not in operations:errors.append(f'REA operation missing or does not match receipt: {rel}')
            except Exception as exc:
                errors.append(f'REA structured Evidence is not readable: {rel}: {exc}')
    impl=r.get('implementation') or {}
    if impl.get('decision') not in ('REUSE','ADAPT','REPLACE','DEFER'):errors.append('decision missing')
    if impl.get('test_outcome')!='PASS':errors.append('product test not marked PASS')
    if not impl.get('test_names'):errors.append('names of executed product tests missing')
    for rel in impl.get('source_files',[]) or []:
        problem=reject_missing(root,rel)
        if problem:errors.append('implementation source: '+problem)
    if not impl.get('source_files'):errors.append('implementation source files missing')
    if r.get('coverage') not in ('COMPLETE_FOR_SCOPED_FEATURE','PARTIAL_WITH_DECLARED_UNKNOWN'):errors.append('coverage unclear')
    if r.get('coverage')=='PARTIAL_WITH_DECLARED_UNKNOWN' and not r.get('unknowns'):errors.append('partial coverage without unknown list')
    if mission!='R0' and not r.get('target_ids'):errors.append('source target IDs missing')
    try:
        mission_plan=load_json(root/'contracts/REA_MISSIONS.json')['missions']
        permitted=set(next(x['targets'] for x in mission_plan if x['id']==mission))
        chosen=set(r.get('target_ids',[]) or [])
        if not chosen.intersection(permitted) and len(r.get('alternative_justification',''))<25:
            errors.append('alternate target outside mission list without a substantial functional justification')
        registry={x['id'] for x in load_json(root/'registry/TARGETS.json')['targets']}
        if not chosen.issubset(registry):errors.append('target_id absent from research registry')
    except Exception as e:errors.append('cannot validate mission/target provenance: '+str(e))
    return [f'{mission}: {e}' for e in errors]

def check_gate(root:Path,gate:str,product_sha:str)->list[str]:
    policy=load_json(root/'factory/rea/REA_GATES.json')
    if not HEX40.fullmatch(product_sha):return ['product SHA must be 40 lower-case hexadecimal characters']
    missions=list(policy['G0']['required_missions'])
    if gate=='G1': missions+=policy['G1']['additional_required_missions']
    if gate=='P2_KIRCHHOFF':missions=policy['P2_KIRCHHOFF']['required_missions']
    errors=[]
    for mission in missions:
        errors+=check_receipt(root,mission,product_sha,mission in policy['G0']['external_missions'])
    return errors

def selftest(root:Path)->None:
    fake='a'*40
    with tempfile.TemporaryDirectory(prefix='ardesia-rea-gate-check-') as temp:
        r=Path(temp)
        (r/'factory/rea').mkdir(parents=True)
        (r/'state/rea-receipts').mkdir(parents=True)
        (r/'factory/rea/REA_GATES.json').write_bytes((root/'factory/rea/REA_GATES.json').read_bytes())
        errs=check_gate(r,'G0',fake)
        assert any('receipt missing' in e for e in errs),errs
        (r/'state/rea-receipts/R0.json').write_text(json.dumps({'mission_id':'R0','status':'PASS','synthetic':True,'product_commit':fake}),encoding='utf-8')
        errs=check_gate(r,'G0',fake)
        assert any('synthetic/mock' in e for e in errs),errs
        assert any('missing artifact kind browser' in e for e in errs),errs
    print('SELFTEST_OK — missing and synthetic receipts correctly rejected. NOT a REA or product test.')

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root',type=Path,default=ROOT)
    p.add_argument('--gate',choices=['G0','G1','P2_KIRCHHOFF'])
    p.add_argument('--sha',help='candidate Ardesia source commit SHA, required for gate check')
    p.add_argument('--report',action='store_true',help='report current state without declaring PASS')
    p.add_argument('--selftest',action='store_true')
    a=p.parse_args()
    if a.selftest:selftest(a.root);return 0
    if not a.gate: p.error('--gate G0|G1|P2_KIRCHHOFF required (unless --selftest)')
    if not a.sha:
        print('NOT_RUN — supply --sha from the actual candidate repository, not a synthetic hash.')
        return 0 if a.report else 2
    errs=check_gate(a.root,a.gate,a.sha)
    print(json.dumps({'gate':a.gate,'product_commit':a.sha,'status':'PASS' if not errs else 'NOT_SATISFIED','problems':errs},ensure_ascii=False,indent=2))
    return 0 if a.report or not errs else 1
if __name__=='__main__':sys.exit(main())
