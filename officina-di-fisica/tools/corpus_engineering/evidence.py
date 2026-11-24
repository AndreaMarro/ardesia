"""Attach only fresh, source-bound evidence; never grant human approval or publication."""
import json
from pathlib import Path

from .pipeline import digest, sha
from .recovery import recover
from .units_verifier import verify
from . import units_verifier
from .integration import exercise


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
    package = json.loads((app / "editorial/batches/units-001.json").read_text())
    bindings = json.loads((app / "editorial/batches/units-001-bindings.json").read_text())
    scientific = app / "editorial/reviews/units-001.json"
    report = json.loads(scientific.read_text())
    current = verify(package, bindings)
    if current != report["records"] or report["verifierSha256"] != sha(Path(units_verifier.__file__).read_bytes()):
        raise ValueError("Scientific evidence stale")
    integration = app / "editorial/reviews/units-001-integration.json"
    integrated = exercise()
    if integrated != json.loads(integration.read_text()): raise ValueError("Integration evidence changed")
    if integrated["packageSha256"] != digest(package): raise ValueError("Integrated package differs")
    browser_file = app / "editorial/reviews/units-001-browser.json"
    browser = json.loads(browser_file.read_text())
    if browser["packageSha256"] != digest(package) or browser["testSha256"] != sha((app / "tests/corpus/browser-drafts.mjs").read_bytes()):
        raise ValueError("Browser evidence stale")
    cases = browser["records"]
    expected_cases = {(r["id"], width) for r in package["records"] for width in (1440, 768, 320)}
    if len(cases) != 96 or {(r["id"], r["width"]) for r in cases} != expected_cases:
        raise ValueError("Browser evidence incomplete")
    if any(r["violations"] or r["overflow"] > 1 or any(f["scroll"] > f["width"]+1 or f["typeset"] > f["width"]+1 for f in r["formulas"]) for r in cases):
        raise ValueError("Browser acceptance failed")
    candidates = {r["id"]: r for r in package["records"]}
    for result in current:
        entry = by_id[result["id"]]
        if not result["ok"] or result["sourceSha256"] != entry["sourceSha256"]:
            raise ValueError("Candidate verification failed or source changed")
        entry["state"] = "REVISED_DRAFT"
        entry["competency"] = candidates[entry["id"]]["skill"]
        entry["family"] = candidates[entry["id"]]["family"]
        entry["review"].update(independentSolution="PASS_AUTO", dimensions="PASS_AUTO", physicalAssumptions="PASS_AI",
            manualArithmetic="PASS_AI", pedagogy="PASS_AI", distractors="PASS_AI", integration="PASS_AUTO", humanApproval="NOT_RUN")
        entry["evidence"] = [{"kind": "reviewed_draft", "path": "editorial/batches/units-001.json",
            "candidateSha256": result["candidateSha256"], "reviewedSignature": result["reviewedSignature"],
            "sciencePath": "editorial/reviews/units-001.json", "scienceSha256": sha(scientific.read_bytes()),
            "integrationPath": "editorial/reviews/units-001-integration.json", "integrationSha256": sha(integration.read_bytes()),
            "browserPath": "editorial/reviews/units-001-browser.json", "browserSha256": sha(browser_file.read_bytes()),
            "assetChecksums": result["assetChecksums"]}]
    return {"recoveredTechnicalQuestionCount": 199, "revisedDraftCount": 32,
            "recoveredRequestedPro100": "NOT_IDENTIFIED", "newlyPublishedQuestionCount": 0, "privateAuthorPreviewCases": 96}
