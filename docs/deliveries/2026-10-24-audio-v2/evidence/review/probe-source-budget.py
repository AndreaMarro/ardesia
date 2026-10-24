"""Synthetic regression probe: legal submission input remains exportable."""
import json
from pathlib import Path
import sys
import tempfile

repo = Path(__file__).resolve().parents[5]
sys.path[:0] = [str(repo / "packages/engine"), str(repo / "packages/engine/tests/study")]
from test_identity_store import setup_store
from lessonos.study.submissions import submit, list_submissions
from lessonos.study.portable import export_notebook
from lessonos.study.models import StudyError

with tempfile.TemporaryDirectory(prefix="source-budget-independent-", dir=repo.parent) as tmp:
    store, tutor, student, *_ = setup_store(Path(tmp))
    refs = []
    for i in range(5):
        resource = store.create_resource(tutor, "fluidi", "notes", f"Synthetic source {i}", "group")
        refs.append({key: resource[key] for key in ("resourceId", "revisionId")} if "resourceId" in resource else
                    {"resourceId": resource["id"], "revisionId": resource["revisionId"]})
    evidence = {"schemaVersion": 1, "experienceId": "poiseuille-boundary-v1", "stepId": "fixed-flow",
                "prediction": {"ratio": 0.0625, "fixedQuantity": "flow"}, "supportUsed": []}
    try:
        submit(store, student, "fluidi", "poiseuille-v1", [], "Synthetic five sources", "independent-budget-five",
            source_refs=refs, activity_parameters={"radiusRatio": 2, "boundary": "flow"}, activity_evidence=evidence)
    except StudyError as error:
        assert error.code == "invalid_source_refs"
    else:
        raise AssertionError("Five inputs must be refused before adding the original")
    assert store.connection.execute("SELECT COUNT(*) FROM study_submissions").fetchone()[0] == 0
    receipt = submit(store, student, "fluidi", "poiseuille-v1", [], "Synthetic prediction with four source references", "independent-budget-four",
        source_refs=refs[:4], activity_parameters={"radiusRatio": 2, "boundary": "flow"}, activity_evidence=evidence)
    row = list_submissions(store, student, "fluidi")[0]
    print(json.dumps({"submissionAccepted": receipt["submissionId"] is not None, "storedSourceCount": len(row["source_refs"])}))
    export_notebook(store, student, "fluidi", Path(tmp) / "blobs")
    print("EXPORT_SUCCESS")
