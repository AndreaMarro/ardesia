"""Attach only fresh, source-bound evidence; never grant human approval or publication."""
import json
from pathlib import Path

from .pipeline import digest, sha, git_bytes
from .recovery import recover
from .batches import load_registry,validate_batch,load_activity_registry,validate_activity_batch


def apply_activity_evidence(repo,app,activities):
    """Extend the same checkpoint with unchanged-edition reviews; no publication."""
    sources={};files={};by_id={r['id']:r for r in activities}
    specs=load_activity_registry(app/'editorial/batches/registry.json')
    for spec in specs:
        for key in spec['activityIds']:
            if key not in by_id:raise ValueError('Registered ID is not a source activity: '+key)
            entry=by_id[key];provenance=entry['provenance'];identity=(provenance['commit'],provenance['path'])
            if identity not in files:
                raw=git_bytes(repo,*identity)
                if sha(raw)!=provenance['fileSha256']:raise ValueError('Activity source file checksum mismatch')
                files[identity]={r['id']:r for r in json.loads(raw)}
            sources[key]=files[identity][key]
            if digest(sources[key])!=entry['sourceSha256']:raise ValueError('Activity source digest mismatch')
    batches=[validate_activity_batch(spec,sources,app) for spec in specs]
    for batch in batches:
        for result in batch['records']:
            entry=by_id[result['id']]
            entry.update(state='REVIEWED_EXISTING_EDITION',calculatorFreeReview='PASS_AI',
              humanApproval='NOT_RUN',calculationScope=result['calculationScope'],
              evidence=[{'kind':'independent_unchanged_activity_review','batchId':batch['spec']['id'],
                         'path':batch['path'],'sha256':batch['sha256'],'sourceSha256':result['sourceSha256']}])
    return {'reviewedActivityCount':sum(len(b['records']) for b in batches),
            'completedActivityBatchIds':[b['spec']['id'] for b in batches],
            'pendingActivityIds':[r['id'] for r in sorted(activities,key=lambda row:row['id']) if r['calculatorFreeReview']=='NOT_RUN']}


def apply_evidence(repo, app, source_ref, entries, questions):
    by_id = {r["id"]: r for r in entries}
    sources = {r["id"]: r for origin, r, _ in questions if origin == "ardesia"}
    recovery_file = app / "editorial/recovery/selection-199.json"
    recovered = recover(repo, source_ref)
    if digest(recovered) != digest(json.loads(recovery_file.read_text())):
        raise ValueError("Recovered proof differs; rerun and inspect the upstream verification")
    for result in recovered["report"]["records"]:
        original = sources[result["id"]]
        source_hash = digest({k: v for k, v in original.items() if k not in {"status", "reviewer"}})
        if result["status"] != "VALIDATED_TECHNICALLY" or result["contentSha256"] != source_hash:
            raise ValueError("Recovered proof source mismatch")
        entry = by_id["AR-" + result["id"]]
        entry["review"]["independentSolution"] = "PASS_AI" if result["method"] == "individually_reviewed_concept" else "PASS_AUTO"
        entry["evidence"] = [{"kind": "recovered_upstream_technical_verification",
            "path": "editorial/recovery/selection-199.json", "sha256": sha(recovery_file.read_bytes()),
            "method": result["method"], "limits": "Numeric probes or AI conceptual review; remaining chain NOT_RUN"}]
    batches=[validate_batch(spec,app) for spec in load_registry(app/"editorial/batches/registry.json")]
    revisions={}
    for batch in batches:
        candidates={r["id"]:r for r in batch["package"]["records"]}
        revisions.update(candidates)
        bindings={r["id"]:r for r in batch["bindings"]}
        for result in batch["records"]:
            entry=by_id[result["id"]];binding=bindings[result["id"]]
            if (result["sourceSha256"]!=entry["sourceSha256"] or binding["sourceRef"]!=entry["provenance"]["commit"]
                    or binding["sourceId"]!=entry["sourceId"]):raise ValueError("Candidate source binding differs from ledger")
            entry["state"]="REVISED_DRAFT"
            entry["competency"]=candidates[entry["id"]]["skill"]
            entry["family"]=candidates[entry["id"]]["family"]
            entry["review"].update(independentSolution="PASS_AI" if result["verificationMode"]=="AI_CONCEPTUAL" else "PASS_AUTO",
                dimensions="PASS_AUTO",physicalAssumptions="PASS_AI",manualArithmetic="PASS_AI",pedagogy="PASS_AI",
                distractors="PASS_AI",integration="PASS_AUTO",humanApproval="NOT_RUN")
            paths=batch["paths"];sums=batch["checksums"]
            entry["evidence"]=[{"kind":"reviewed_draft","batchId":batch["spec"]["id"],"path":paths["package"],
                "candidateSha256":result["candidateSha256"],"reviewedSignature":result["reviewedSignature"],
                "sciencePath":paths["science"],"scienceSha256":sums["science"],"integrationPath":paths["integration"],
                "integrationSha256":sums["integration"],"browserPath":paths["browser"],"browserSha256":sums["browser"],
                "assetChecksums":result["assetChecksums"]}]
    return {"recoveredTechnicalQuestionCount":199,"revisedDraftCount":sum(len(b["records"]) for b in batches),
        "recoveredRequestedPro100":"NOT_IDENTIFIED","newlyPublishedQuestionCount":0,
        "completedBatchIds":[b["spec"]["id"] for b in batches],
        "batchRegistrySha256":sha((app/"editorial/batches/registry.json").read_bytes()),
        "privateAuthorPreviewCases":sum(b["browserCases"] for b in batches)},revisions
