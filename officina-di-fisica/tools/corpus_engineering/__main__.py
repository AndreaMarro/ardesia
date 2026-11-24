"""python -m tools.corpus_engineering --source-ref <sha> --cric-ref <sha>."""
import argparse
from collections import Counter
import json
from pathlib import Path
import subprocess

from jsonschema import Draft202012Validator

from .pipeline import VERSION, build_entry, canonical, checkpoint, digest, duplicate_candidates, git_bytes, sha, load_checkpoint
from .evidence import apply_evidence,apply_activity_evidence
from sympy import __version__ as sympy_version

BANK = "packages/engine/lessonos/study/content/physics-semestre-2026-bank"
APP = Path(__file__).resolve().parents[2]
REPO = APP.parent


def load_sources(repo, source_ref, cric_ref):
    manifest = json.loads(git_bytes(repo, source_ref, BANK + "/manifest.json"))
    validator = Draft202012Validator(json.loads(git_bytes(repo, source_ref, BANK + "/question.schema.json")))
    questions, activities, catalog = [], [], {}
    for shard in manifest["shards"]:
        path = BANK + "/" + shard["path"]
        raw = git_bytes(repo, source_ref, path)
        if sha(raw) != shard["sha256"]:
            raise ValueError("Source shard checksum mismatch: " + path)
        rows = json.loads(raw)
        if len(rows) != shard["count"]: raise ValueError("Source shard count mismatch")
        for row in rows:
            validator.validate(row)
            questions.append(("ardesia", row, {"commit": source_ref, "path": path, "fileSha256": sha(raw)}))
    paths = subprocess.check_output(["git", "-C", str(repo), "ls-tree", "-r", "--name-only", cric_ref,
        "officina-di-fisica/content"], text=True).splitlines()
    for path in sorted(p for p in paths if p.endswith(".json")):
        raw = git_bytes(repo, cric_ref, path)
        for row in json.loads(raw):
            if row["id"] in catalog: raise ValueError("Duplicate Cric source ID")
            catalog[row["id"]] = row
            provenance = {"commit": cric_ref, "path": path, "fileSha256": sha(raw)}
            if row.get("kind") == "question": questions.append(("cric", row, provenance))
            else:
                activities.append({"id": row["id"], "kind": row.get("kind", "course"),
                    "sourceSha256": digest(row), "provenance": provenance,
                    "calculatorFreeReview": "NOT_RUN", "state": "ACCOUNTED"})
    for row in catalog.values():
        for key in ("skill", "course"):
            if row.get(key) and row[key] not in catalog: raise ValueError("Unresolved " + key + ": " + row["id"])
        for key in ("prerequisites", "includes", "reuse"):
            if any(ref not in catalog for ref in row.get(key, [])): raise ValueError("Unresolved " + key)
        for block in row.get("blocks", []) + row.get("promptBlocks", []):
            if block.get("ref") and block["ref"] not in catalog: raise ValueError("Unresolved block reference")
    counts = Counter(origin for origin, _, _ in questions)
    if counts != {"ardesia": 4000, "cric": 606}: raise ValueError("Expected 4000 + 606 questions: " + str(counts))
    return questions, activities


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--source-ref", required=True)
    parser.add_argument("--cric-ref", required=True)
    parser.add_argument("--destination", type=Path, default=APP / "editorial/corpus")
    args = parser.parse_args()
    questions, activities = load_sources(REPO, args.source_ref, args.cric_ref)
    # Source-assertion caching depends on its actual evaluator and schema.
    # Family judgments are always revalidated by their own pinned report/verifier.
    own_files = [Path(__file__).with_name("pipeline.py"), Path(__file__).with_name("requirements.txt"), APP / "contracts/corpus-entry-v1.schema.json"]
    verifier = digest({"files":{p.name: sha(p.read_bytes()) for p in own_files},"sympyVersion":sympy_version})
    old = {}
    pointer = args.destination / "checkpoint.json"
    if pointer.exists():
        for row in load_checkpoint(args.destination)[0]: old[row["id"]] = row
    entries = []
    rule = Draft202012Validator(json.loads((APP / "contracts/corpus-entry-v1.schema.json").read_text()))
    for origin, row, provenance in questions:
        key = row["id"] if origin == "cric" else "AR-" + row["id"]
        entry = build_entry(origin, row, provenance, verifier, old.get(key))
        rule.validate(entry)
        entries.append(entry)
    evidence_counts,revisions = apply_evidence(REPO, APP, args.source_ref, entries, questions)
    activity_counts=apply_activity_evidence(REPO,APP,activities)
    for entry in entries: rule.validate(entry)
    source_candidates = duplicate_candidates([(o, r) for o, r, _ in questions])
    effective=[]
    for origin,row,_ in questions:
        key=row["id"] if origin=="cric" else "AR-"+row["id"]
        current=revisions.get(key)
        effective.append((origin,{**row,"prompt":current["prompt"]} if current else row))
    candidates=duplicate_candidates(effective)
    metadata = {"schemaVersion": VERSION, **evidence_counts, **activity_counts, "sourceRefs": {"ardesia": args.source_ref, "cric": args.cric_ref},
        "verifierSha256": verifier, "semanticCandidateCount": len(candidates),
        "semanticDeduplication": "candidate_groups_only_no_automatic_removal",
        "semanticCandidateScope":"reviewed_drafts_and_unrevised_sources",
        "automaticArithmetic": dict(Counter(r["automatic"]["sourceArithmetic"]["status"] for r in entries)),
        "pendingQuestionIds": [r["id"] for r in entries if r["review"]["independentSolution"] == "NOT_RUN"],
        # Recovered technical checks do not complete the full editorial chain.
        "pendingFullQuestionRevisionIds": sorted(r["id"] for r in entries if r["state"] != "REVISED_DRAFT"),
        "limits": ["Human scientific approval NOT_RUN", "Full scientific/pedagogical revision remains open",
                   "Calculator-free feasibility is not inferred from source flags or exact answers"]}
    approval_queue=[{'id':row['id'],'batchId':row['evidence'][0]['batchId'],
                     'candidateSha256':row['evidence'][0]['candidateSha256'],
                     'packagePath':row['evidence'][0]['path'],'sciencePath':row['evidence'][0]['sciencePath'],
                     'humanApproval':'NOT_RUN','publication':'DRAFT'}
                    for row in sorted(entries,key=lambda item:item['id']) if row['state']=='REVISED_DRAFT']
    activity_queue=[{'id':row['id'],'sourceSha256':row['sourceSha256'],
                     'sciencePath':row['evidence'][0]['path'],'humanApproval':'NOT_RUN',
                     'publicationAction':'DRAFT' if row['state']=='REVISED_ACTIVITY_DRAFT' else 'NONE',
                     'candidateSha256':row['evidence'][0].get('candidateSha256'),
                     'revision':row['evidence'][0].get('revision'),
                     'publishedEditionCalculatorFreeReview':row['publishedEditionCalculatorFreeReview']}
                    for row in sorted(activities,key=lambda item:item['id']) if row['state'] in ('REVIEWED_EXISTING_EDITION','REVISED_ACTIVITY_DRAFT')]
    result = checkpoint(args.destination, entries, sorted(activities, key=lambda x: x["id"]), metadata,
                        {"semantic-candidates.json": candidates,"source-semantic-candidates.json":source_candidates,
                         'human-approval-queue.json':approval_queue,'human-activity-review-queue.json':activity_queue})
    print(canonical({**result, "activities": len(activities), "automaticArithmetic": metadata["automaticArithmetic"]}))


if __name__ == "__main__": main()
