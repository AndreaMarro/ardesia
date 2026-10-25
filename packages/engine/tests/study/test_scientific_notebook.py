"""State is an immutable revision; presentation geometry never grants access."""
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from io import BytesIO
from threading import Barrier
import sqlite3

import pytest

from lessonos.study.assets import upload_asset
from lessonos.study.models import StudyError
from lessonos.study.operations import erase_student, backup_data, restore_data, _existing_database
from lessonos.study.schema_contract import CURRENT_SCHEMA
from lessonos.study.scientific_notebook import save_notebook, validate_state
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def draft(label="Volume costante"):
    return {"v": 1, "title": "Appunti di fisica", "annotations": [
        {"id": "formula", "kind": "formula", "page": 1,
         "rect": [0.1, 0.1, 0.5, 0.1], "content": label},
    ]}


def seed(path):
    PdfWriter = pytest.importorskip("pypdf").PdfWriter
    store, tutor, owner, peer, other = setup_store(path)
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=400)
    out = BytesIO()
    writer.write(out)
    asset = upload_asset(store, owner, "fluidi", out.getvalue(), "application/pdf", path / "blobs", key="upload")
    return store, tutor, owner, peer, other, asset


def save(store, owner, asset, value=None, key="create", resource=None, expected=None):
    return save_notebook(store, owner, "fluidi", asset["id"], asset["sha256"], value or draft(),
                         key, store.path.parent / "blobs", resource_id=resource, expected_revision=expected)


def test_receipt_failure_rolls_back_resource_binding_snapshot_and_event(tmp_path, monkeypatch):
    from lessonos.study import transactions
    store, _, owner, *_, asset = seed(tmp_path)
    before = {name: store.connection.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
              for name in ("study_resources", "study_revisions", "study_notebook_bindings",
                           "study_notebook_snapshots", "study_events", "study_receipts")}
    def fail(*_args):
        raise RuntimeError("lost receipt")
    monkeypatch.setattr(transactions, "record_receipt", fail)
    with pytest.raises(RuntimeError, match="lost receipt"):
        save(store, owner, asset)
    assert {name: store.connection.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0] for name in before} == before
    store.close()


def test_two_concurrent_revisions_have_one_winner_and_preserve_old_snapshot(tmp_path):
    store, _, owner, *_, asset = seed(tmp_path)
    first = save(store, owner, asset)
    gate = Barrier(2)
    def edit(number):
        local = StudyStore(store.path, initialize=False)
        try:
            gate.wait()
            return save(local, owner, asset, draft(str(number)), str(number), first["id"], first["revisionId"])
        except StudyError as error:
            return error.code
        finally:
            local.close()
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(edit, (1, 2)))
    assert len([r for r in results if isinstance(r, dict)]) == 1
    assert "stale_revision" in results
    assert store.get_resource_revision(owner, first["id"], first["revisionId"])["notebook"] == first["notebook"]
    assert store.connection.execute("SELECT COUNT(*) FROM study_notebook_snapshots").fetchone()[0] == 2
    store.close()


def test_binding_is_not_fingerprint_or_client_edition_and_cannot_be_replaced(tmp_path):
    store, tutor, owner, peer, _, asset = seed(tmp_path)
    first = save(store, owner, asset)
    # Identical bytes still have distinct upload identity. Neither identity is a PDF fingerprint.
    data = (tmp_path / "blobs" / asset["id"]).read_bytes()
    second = upload_asset(store, owner, "fluidi", data, "application/pdf", tmp_path / "blobs", key="other-upload")
    with pytest.raises(StudyError, match="immutable_notebook_binding"):
        save(store, owner, second, draft("changed"), "change-source", first["id"], first["revisionId"])
    store.create_edition(tutor, "different")
    store.add_test_member(tutor, "different", owner.id)
    with pytest.raises(StudyError, match="forbidden"):
        save_notebook(store, owner, "different", asset["id"], asset["sha256"], draft(), "cross", tmp_path / "blobs")
    with pytest.raises(StudyError, match="forbidden"):
        save(store, peer, asset)
    # A lost-response retry still rechecks membership and original integrity.
    with store.transaction() as c:
        c.execute("DELETE FROM study_members WHERE edition_id='fluidi' AND student_id=?", (owner.id,))
    with pytest.raises(StudyError, match="forbidden"):
        save(store, owner, asset)
    store.close()


def test_schema5_upgrade_preserves_data_and_http_open_never_migrates(tmp_path):
    store, _, owner, *_, asset = seed(tmp_path)
    source = store.create_resource(owner, "fluidi", "notes", "Appunto preesistente")
    store.close()
    with sqlite3.connect(tmp_path / "study.sqlite") as raw:
        raw.execute("DROP TABLE study_notebook_snapshots")
        raw.execute("DROP TABLE study_notebook_bindings")
        raw.execute("UPDATE study_schema SET version=5")
    before = (tmp_path / "study.sqlite").read_bytes()
    with pytest.raises(StudyError, match="database_schema_not_ready"):
        StudyStore(tmp_path / "study.sqlite", initialize=False)
    assert (tmp_path / "study.sqlite").read_bytes() == before
    legacy = _existing_database(tmp_path)
    legacy.close()
    upgraded = StudyStore(tmp_path / "study.sqlite")
    assert upgraded.get_resource(owner, source["id"]) == source
    assert upgraded.connection.execute("SELECT version FROM study_schema").fetchone()[0] == CURRENT_SCHEMA
    assert save(upgraded, owner, asset)["notebook"]["state"] == draft()
    upgraded.close()
    with sqlite3.connect(tmp_path / "study.sqlite") as raw:
        raw.execute("ALTER TABLE study_notebook_snapshots DROP COLUMN sha256")
    before = (tmp_path / "study.sqlite").read_bytes()
    with pytest.raises(StudyError, match="database_integrity_failure"):
        StudyStore(tmp_path / "study.sqlite")
    assert (tmp_path / "study.sqlite").read_bytes() == before


def test_reserved_kind_in_legacy_schema_requires_explicit_migration_review(tmp_path):
    store, _, owner, *_, _asset = seed(tmp_path)
    resource = store.create_resource(owner, "fluidi", "notes", "Legacy source unchanged")
    store.close()
    with sqlite3.connect(tmp_path / "study.sqlite") as raw:
        raw.execute("DROP TABLE study_notebook_snapshots")
        raw.execute("DROP TABLE study_notebook_bindings")
        raw.execute("UPDATE study_schema SET version=5")
        raw.execute("UPDATE study_resources SET kind='scientific-notebook' WHERE id=?", (resource["id"],))
    with pytest.raises(StudyError, match="notebook_kind_migration_conflict"):
        StudyStore(tmp_path / "study.sqlite")
    with sqlite3.connect(tmp_path / "study.sqlite") as raw:
        assert raw.execute("SELECT version FROM study_schema").fetchone()[0] == 5
        assert raw.execute("SELECT text FROM study_revisions WHERE id=?", (resource["revisionId"],)).fetchone()[0] == resource["text"]
        assert not raw.execute("SELECT 1 FROM sqlite_master WHERE name='study_notebook_snapshots'").fetchone()


def test_erasure_cascades_notebook_and_restore_does_not_resurrect_it(tmp_path):
    path = tmp_path / "data"
    store, _, owner, *_, asset = seed(path)
    save(store, owner, asset)
    store.close()
    backup_data(path, tmp_path / "backup")
    assert erase_student(path, owner.id, apply=True)["applied"]
    restore_data(tmp_path / "backup", tmp_path / "restored", path / "erasure-ledger.json")
    for directory in (path, tmp_path / "restored"):
        restored = StudyStore(directory / "study.sqlite", initialize=False)
        for table in ("study_notebook_bindings", "study_notebook_snapshots"):
            assert restored.connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] == 0
        assert not (directory / "blobs" / asset["id"]).exists()
        restored.close()


@pytest.mark.parametrize("mutation", [
    lambda s: s.update(title="\x00"),
    lambda s: s.update(title=" " * 201),
    lambda s: s["annotations"][0].update(content="\x00"),
    lambda s: s["annotations"][0].update(rect=[0, float("nan"), .1, .1]),
    lambda s: s["annotations"][0].update(rect=[False, 0, .1, .1]),
    lambda s: s["annotations"][0].update(content="\ud800"),
])
def test_invalid_payload_fails_before_dialect_specific_storage(mutation):
    value = deepcopy(draft())
    mutation(value)
    with pytest.raises(StudyError):
        validate_state(value, 1)
