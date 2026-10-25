"""Versioned page annotations bound to one immutable, authorized PDF.

Resources/revisions remain the canonical identities. These tables extend those
identities; they do not store another original or create another journal.
"""
from io import BytesIO
import json
import re

from .assets import read_original_asset
from .models import StudyError
from .store import canonical, digest, identifier
from .transactions import execute_command

KIND = "scientific-notebook"
COORDINATES = "pdf-normalized-unrotated-top-left-v1"
MAX_STATE_BYTES = 160 * 1024
NOTEBOOK_COLUMNS = {
    "study_notebook_bindings": frozenset(("resource_id", "asset_id", "asset_sha256", "page_count")),
    "study_notebook_snapshots": frozenset(("revision_id", "state", "sha256")),
}


def validate_state(value, page_count):
    if (not isinstance(value, dict) or set(value) != {"v", "title", "annotations"}
            or type(value["v"]) is not int or value["v"] != 1
            or not isinstance(value["title"], str) or not 1 <= len(value["title"]) <= 200
            or not value["title"].strip() or "\x00" in value["title"]
            or not isinstance(value["annotations"], list) or len(value["annotations"]) > 200):
        raise StudyError("invalid_notebook_state")
    seen = set()
    for item in value["annotations"]:
        if not isinstance(item, dict) or set(item) != {"id", "page", "rect", "kind", "content"}:
            raise StudyError("invalid_notebook_state")
        if (not isinstance(item["id"], str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", item["id"])
                or item["id"] in seen or type(item["page"]) is not int or not 1 <= item["page"] <= page_count
                or item["kind"] not in ("note", "formula", "highlight")
                or not isinstance(item["content"], str) or len(item["content"]) > 5000 or "\x00" in item["content"]):
            raise StudyError("invalid_notebook_state")
        if item["kind"] != "highlight" and not item["content"].strip():
            raise StudyError("invalid_notebook_state")
        seen.add(item["id"])
        rect = item["rect"]
        if (not isinstance(rect, list) or len(rect) != 4
                or any(type(n) not in (int, float) or not 0 <= n <= 1 for n in rect)):
            raise StudyError("invalid_notebook_state")
        x, y, width, height = rect
        if not (0 <= x < 1 and 0 <= y < 1 and 0 < width <= 1 and 0 < height <= 1
                and x + width <= 1 and y + height <= 1):
            raise StudyError("invalid_notebook_state")
    try:
        encoded = canonical(value)
        byte_count = len(encoded.encode())
    except (TypeError, ValueError, UnicodeError):
        raise StudyError("invalid_notebook_state") from None
    if byte_count > MAX_STATE_BYTES:
        raise StudyError("notebook_state_too_large", 413)
    text = value["title"] + "".join(
        f"\n[p. {item['page']}] {item['content']}" for item in value["annotations"]
    )
    if len(text) > 20_000:
        raise StudyError("notebook_text_too_large", 413)
    return encoded, text


def source_view(binding):
    return {"assetId": binding["asset_id"], "sha256": binding["asset_sha256"],
            "pageCount": binding["page_count"], "coordinates": COORDINATES}


def snapshot_view(source, state):
    body = {"v": 1, "source": source, "state": state}
    return {**body, "sha256": digest(canonical(body))}


def inspect_snapshot(value, text, assets=None):
    """Internal integrity of an unsigned export, never an access grant."""
    if not isinstance(value, dict) or set(value) != {"v", "source", "state", "sha256"} or type(value["v"]) is not int or value["v"] != 1:
        raise StudyError("notebook_snapshot_integrity_failure")
    source = value["source"]
    if (not isinstance(source, dict) or set(source) != {"assetId", "sha256", "pageCount", "coordinates"}
            or not isinstance(source["assetId"], str) or not re.fullmatch(r"[a-f0-9]{32}", source["assetId"])
            or not isinstance(source["sha256"], str) or not re.fullmatch(r"[a-f0-9]{64}", source["sha256"])
            or type(source["pageCount"]) is not int or not 1 <= source["pageCount"] <= 20
            or source["coordinates"] != COORDINATES):
        raise StudyError("notebook_snapshot_integrity_failure")
    _, derived = validate_state(value["state"], source["pageCount"])
    if derived != text or snapshot_view(source, value["state"]) != value:
        raise StudyError("notebook_snapshot_integrity_failure")
    if assets is not None:
        asset = assets.get(source["assetId"])
        if not asset or asset.get("sha256") != source["sha256"] or asset.get("mime") != "application/pdf":
            raise StudyError("notebook_original_integrity_failure")
    return source


def read_snapshot(store, resource):
    row = store.connection.execute("""SELECT b.*,s.state,s.sha256 FROM study_notebook_bindings b
        JOIN study_revisions v ON v.resource_id=b.resource_id
        JOIN study_notebook_snapshots s ON s.revision_id=v.id
        WHERE b.resource_id=? AND s.revision_id=?""", (resource["id"], resource["revisionId"])).fetchone()
    if row is None:
        raise StudyError("notebook_snapshot_unavailable", 503)
    asset = store.connection.execute("SELECT * FROM study_assets WHERE id=? AND deleted=0", (row["asset_id"],)).fetchone()
    if asset is None:
        raise StudyError("not_found", 404)
    if (asset["edition_id"] != resource["editionId"] or asset["owner_id"] != resource["ownerId"]
            or asset["sha256"] != row["asset_sha256"] or asset["mime"] != "application/pdf"):
        raise StudyError("notebook_snapshot_unavailable", 503)
    try:
        result = {"v": 1, "source": source_view(row), "state": json.loads(row["state"]), "sha256": row["sha256"]}
        inspect_snapshot(result, resource["text"])
    except (StudyError, ValueError, TypeError):
        raise StudyError("notebook_snapshot_unavailable", 503) from None
    return result


def _original(store, principal, edition_id, asset_id, expected_sha, blob_dir):
    store._edition_access(principal, edition_id)
    row = store.connection.execute("SELECT * FROM study_assets WHERE id=? AND deleted=0", (asset_id,)).fetchone()
    if row is None or row["owner_id"] != principal.id or row["edition_id"] != edition_id:
        raise StudyError("forbidden", 403)
    data, descriptor = read_original_asset(store, principal, asset_id, blob_dir)
    if descriptor["sha256"] != expected_sha:
        raise StudyError("stale_original", 409)
    if descriptor["mime"] != "application/pdf":
        raise StudyError("notebook_pdf_required")
    from pypdf import PdfReader
    try:
        count = len(PdfReader(BytesIO(data), strict=True).pages)
        if not 1 <= count <= 20:
            raise ValueError()
    except Exception:
        raise StudyError("asset_integrity_failure", 503) from None
    return count


def save_notebook(store, principal, edition_id, asset_id, asset_sha256, state, key, blob_dir,
                  *, resource_id=None, expected_revision=None):
    identities = (edition_id, asset_id, asset_sha256)
    if resource_id is not None:
        identities += (resource_id, expected_revision)
    if not all(isinstance(v, str) and v and "\x00" not in v for v in identities):
        raise StudyError("invalid_notebook_binding")
    try:
        for value in identities:
            value.encode("utf-8")
    except UnicodeError:
        raise StudyError("invalid_notebook_binding") from None
    operation = "notebook.revised" if resource_id is not None else "notebook.created"
    payload = {"editionId": edition_id, "assetId": asset_id, "assetSha256": asset_sha256,
               "state": state, "resourceId": resource_id, "expectedRevision": expected_revision}
    # Validate and copy caller input before command hashing; bounded state has no live aliases.
    encoded, _ = validate_state(state, 20)
    state = json.loads(encoded)
    payload["state"] = state
    page_count = None

    def authorize(c):
        nonlocal page_count
        if resource_id is not None:
            store.lock_aggregate(c, "resource", resource_id)
            existing = store.get_resource(principal, resource_id)
            if existing["ownerId"] != principal.id or existing["kind"] != KIND:
                raise StudyError("forbidden", 403)
            binding = existing["notebook"]["source"]
            if (existing["editionId"] != edition_id or binding["assetId"] != asset_id
                    or binding["sha256"] != asset_sha256):
                raise StudyError("immutable_notebook_binding", 409)
        page_count = _original(store, principal, edition_id, asset_id, asset_sha256, blob_dir)

    def apply(c):
        assert page_count is not None
        encoded_state, text = validate_state(state, page_count)
        rid, revision = resource_id or identifier(), identifier()
        if resource_id is not None:
            current = c.execute("SELECT current_revision FROM study_resources WHERE id=? AND deleted=0", (rid,)).fetchone()
            if not current or current[0] != expected_revision:
                raise StudyError("stale_revision", 409)
        else:
            c.execute("INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)",
                      (rid, edition_id, principal.id, KIND, "private", identifier(), revision))
            c.execute("INSERT INTO study_notebook_bindings VALUES(?,?,?,?)", (rid, asset_id, asset_sha256, page_count))
        c.execute("INSERT INTO study_revisions VALUES(?,?,?,?,?)", (revision, rid, text, digest(text), store.clock()))
        source = {"assetId": asset_id, "sha256": asset_sha256, "pageCount": page_count, "coordinates": COORDINATES}
        snapshot = snapshot_view(source, state)
        c.execute("INSERT INTO study_notebook_snapshots VALUES(?,?,?)", (revision, encoded_state, snapshot["sha256"]))
        if resource_id is not None:
            updated = c.execute("UPDATE study_resources SET current_revision=? WHERE id=? AND current_revision=? AND deleted=0",
                                (revision, rid, expected_revision))
            if updated.rowcount != 1:
                raise StudyError("stale_revision", 409)
            from .context import _invalidate_projection
            _invalidate_projection(c, rid)
        store._event(c, principal, operation, rid, {"revisionId": revision})
        return store.get_resource_revision(principal, rid, revision)

    result = execute_command(store, principal, operation, key, payload, apply, before_lookup=authorize)
    # A previously committed receipt is not authority after deletion/revocation.
    store.get_resource_revision(principal, result["id"], result["revisionId"])
    return result
