"""D2-J3A — LessonOS snapshot → engine pedagogical facts.

Pure deterministic projector over canonical EventEnvelope v2 rows from
``raw/lessonos-events.jsonl``. Semantics mirror Studio
``buildLessonStudyDigest`` (materializer + studyDigest) for the needed
subset: concepts, errors, error→concept relation, corrected state,
EvidenceRef provenance, lesson identity.

This is a VIEW, regenerable from the snapshot — not a source of truth,
not a LessonDocument. In particular:

* ``EvidenceRef`` (``manual:…``, ``board:…``, ``lesson:…``) are preserved
  verbatim; they are NEVER converted to ``Citation(seg_id=…)`` (different
  provenance domains: segments vs didactic facts).
* No timestamps are invented; ordering follows ``seq`` (log order), and
  the final concepts/errors lists follow the Studio digest ordering
  (sorted by id).
* ``studentId`` is never propagated (PII minimisation).
* Unknown/advisory kinds are ignored exactly like Studio
  (``toLegacyLessonOsEvent`` → null): they produce no facts.
* Zero LLM, zero clock, zero I/O: input is snapshot text + lesson
  identity, output is facts.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass

# Mirror of Studio EVIDENCE_RE (eventlog.ts): namespace:payload.
_EVIDENCE_RE = re.compile(r"^[a-z][a-z0-9-]*:.+$")

# Digest-relevant factual kinds (mirror of the Studio materializer cases
# that can create concetto/errore nodes). All other known kinds
# (lesson.started/ended, plugin.mounted, quiz.attempted, studentpack.*,
# journal.* …) are ignored for this projection — exactly like Studio,
# whose digest only reads concetto/errore nodes.
_CONCEPT_YIELDING = frozenset({
    "concept.introduced",
    "material.cited",
    "error.observed",
    "simulation.error.observed",
    "exercise.completed",
    "simulation.step.completed",
    "simulation.circuit.solved",
    "circuit.trace.assessed",
})
_ERROR_YIELDING = frozenset({
    "error.observed",
    "simulation.error.observed",
})


@dataclass(frozen=True)
class StudyConcept:
    """Studio StudyDigestConcept equivalent: id, label, evidence refs."""

    id: str
    label: str
    evidence_refs: tuple[str, ...] = ()


@dataclass(frozen=True)
class StudyError:
    """Studio StudyDigestError equivalent: id, label, concept relation,
    corrected state, evidence refs. No student identity, ever."""

    id: str
    label: str
    concept_id: str | None
    corrected: bool
    evidence_refs: tuple[str, ...] = ()


@dataclass(frozen=True)
class LessonOsStudyDigest:
    """Studio StudyDigest equivalent, identity-scoped to one lesson."""

    lesson_id: str
    concepts: tuple[StudyConcept, ...] = ()
    errors: tuple[StudyError, ...] = ()


# Hint keys canoniche EventEnvelope v2 (stesso mirror di Studio
# looksLikeJournalEnvelopeV2 usato dal journal adapter: ne basta UNA).
# Una riga riconoscibile come v2 ma malformata non deve mai ricadere nel
# trattamento legacy: fail closed.
_V2_HINT_KEYS = frozenset({
    "schemaVersion",
    "eventId",
    "lessonId",
    "sessionId",
    "kind",
    "occurredAt",
    "actor",
    "producer",
    "causationId",
    "idempotencyKey",
    "evidence",
    "payload",
})


def _looks_like_v2_envelope(obj: object) -> bool:
    return isinstance(obj, dict) and any(key in obj for key in _V2_HINT_KEYS)


def _fail(line_no: int, reason: str) -> ValueError:
    return ValueError(f"lessonos snapshot line {line_no}: {reason}")


def _require_str(mapping: dict, key: str, line_no: int, what: str) -> str:
    value = mapping.get(key)
    if not isinstance(value, str) or not value:
        raise _fail(line_no, f"malformed {what} (missing {key!r})")
    return value


def _evidence_refs(obj: dict, line_no: int) -> list[str]:
    evidence = obj.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        raise _fail(line_no, "malformed evidence (must be a non-empty list)")
    refs: list[str] = []
    for item in evidence:
        ref = item.get("ref") if isinstance(item, dict) else None
        if not isinstance(ref, str) or not _EVIDENCE_RE.match(ref):
            raise _fail(line_no, f"malformed evidence ref {ref!r}")
        refs.append(ref)
    return refs


def _labels(payload: dict, line_no: int) -> dict:
    # Mirror di Studio assertLegacyPayloadField(labels): object con valori
    # tutti stringa (misurato: {it: 123} rejected). {} ammesso → fallback id.
    labels = payload.get("labels")
    if not isinstance(labels, dict) or any(
        not isinstance(value, str) for value in labels.values()
    ):
        raise _fail(line_no, "malformed labels (must be a string map)")
    return labels


def _label_of(node_id: str, labels: dict) -> str:
    """Mirror esatto di Studio labelOf: labels.it (ANCHE "" — ?? salta solo
    null/undefined), poi primo valore disponibile, poi id."""
    it_label = labels.get("it")
    if isinstance(it_label, str):
        return it_label
    for value in labels.values():
        if isinstance(value, str) and value:
            return value
    return node_id


def project_lessonos_study_digest(
    snapshot_jsonl: str, lesson_id: str
) -> LessonOsStudyDigest:
    """Project canonical v2 snapshot rows to pedagogical facts for ONE lesson.

    Raises ``ValueError`` on a recognisable factual row that is malformed,
    or on a factual row from another lesson (never silently renamed).
    Unknown/advisory kinds and legacy non-envelope rows are ignored.
    Deterministic: same input → same digest.
    """
    # Node state mirrors the Studio materializer merge rules: first event
    # fixes identity, older labels win per key, evidence merges ordered and
    # deduped, first correction marks corrected, first deriva-da wins.
    concept_labels: dict[str, dict] = {}
    concept_evidence: dict[str, list[str]] = {}
    error_labels: dict[str, dict] = {}
    error_evidence: dict[str, list[str]] = {}
    error_concept: dict[str, str] = {}
    error_corrected: set[str] = set()
    # Global node identity across digest-adjacent roles (mirror di Studio
    # upsertNode: stesso id + kind diverso → throw). Traccia
    # concetto/errore/esercizio/materiale: sono i ruoli che interagiscono
    # con digest e correzioni. lesson:/plugin: vivono in namespace con
    # prefisso disgiunti per costruzione (lesson:<room>, plugin:<id>#<n>)
    # e non entrano nel digest: fuori da questo confine.
    node_roles: dict[str, str] = {}

    def claim_role(node_id: str, role: str, line_no: int) -> None:
        existing = node_roles.get(node_id)
        if existing is not None and existing != role:
            raise _fail(
                line_no,
                f"id {node_id!r} reused with different role ({existing} vs {role})",
            )
        node_roles[node_id] = role

    def merge_labels(current: dict, incoming: dict) -> dict:
        return {**incoming, **current}

    def merge_evidence(current: list[str], incoming: list[str]) -> None:
        for ref in incoming:
            if ref not in current:
                current.append(ref)

    def ensure_concept(cid: str, labels: dict, refs: list[str], line_no: int) -> None:
        # Singolo punto di creazione/merge concetto: il ruolo e' reclamato
        # QUI per ogni origine (introdotto o derivato), mai ai callsites —
        # altrimenti un concetto implicito sfugge all'invariante globale.
        claim_role(cid, "concetto", line_no)
        if cid in concept_labels:
            concept_labels[cid] = merge_labels(concept_labels[cid], labels)
            merge_evidence(concept_evidence[cid], refs)
        else:
            concept_labels[cid] = dict(labels)
            concept_evidence[cid] = list(refs)

    rows: list[tuple[int, dict]] = []
    for line_no, line in enumerate(snapshot_jsonl.splitlines(), start=1):
        stripped = line.strip()
        if not stripped:
            continue
        try:
            parsed = json.loads(stripped)
        except json.JSONDecodeError as exc:
            # Riga non vuota e non JSON: snapshot canonico corrotto. Non
            # esiste skip fail-soft qui (a differenza del journal legacy):
            # tacere produrrebbe un digest apparentemente valido e vuoto.
            raise _fail(line_no, f"malformed JSON line ({exc})") from exc
        if not isinstance(parsed, dict):
            raise _fail(line_no, "not a JSON object")
        if "schemaVersion" not in parsed:
            if _looks_like_v2_envelope(parsed):
                raise _fail(
                    line_no,
                    "v2-like row without schemaVersion "
                    "(recognisable canonical row, never legacy)",
                )
            # Legacy non-envelope row: modern snapshots are v2-only;
            # skipped by design (never misread as something else).
            continue
        if parsed.get("schemaVersion") != 2:
            raise _fail(
                line_no,
                f"unsupported schemaVersion {parsed.get('schemaVersion')!r}",
            )
        kind = parsed.get("kind")
        if kind not in _CONCEPT_YIELDING:
            # Advisory/unknown or digest-irrelevant factual kind: ignored
            # exactly like Studio (toLegacy → null / no concetto node).
            continue
        row_lesson = parsed.get("lessonId")
        if row_lesson != lesson_id:
            raise _fail(
                line_no,
                f"lessonId {row_lesson!r} does not match bundle lesson {lesson_id!r}",
            )
        seq = parsed.get("seq")
        # Type-strict come Studio (Number.isInteger(true) === false):
        # bool non e' un sequence number valido.
        if type(seq) is not int or seq < 1:
            raise _fail(line_no, "malformed seq (canonical order required)")
        rows.append((seq, parsed))

    rows.sort(key=lambda item: item[0])
    for _seq, obj in rows:
        # Post-sort, errors reference seq (stable log identity), not file line.
        line_no = _seq
        kind = obj["kind"]
        payload = obj.get("payload")
        if not isinstance(payload, dict):
            raise _fail(line_no, f"malformed payload for {kind}")
        refs = _evidence_refs(obj, line_no)
        labels = _labels(payload, line_no)

        if kind == "concept.introduced":
            cid = _require_str(payload, "conceptId", line_no, kind)
            ensure_concept(cid, labels, refs, line_no)
        elif kind == "material.cited":
            mid = _require_str(payload, "materialId", line_no, kind)
            claim_role(mid, "materiale", line_no)
            concept_id = payload.get("conceptId")
            if isinstance(concept_id, str) and concept_id:
                # Come Studio (materializer): il nodo concetto derivato nasce
                # con labels VUOTE (le labels del material restano al nodo
                # materiale, fuori digest); l'evidence invece si unisce.
                ensure_concept(concept_id, {}, refs, line_no)
        elif kind in _ERROR_YIELDING:
            eid = _require_str(payload, "errorId", line_no, kind)
            cid = _require_str(payload, "conceptId", line_no, kind)
            claim_role(eid, "errore", line_no)
            if eid not in error_labels:
                error_labels[eid] = dict(labels)
                error_evidence[eid] = list(refs)
                error_concept[eid] = cid
            else:
                error_labels[eid] = merge_labels(error_labels[eid], labels)
                merge_evidence(error_evidence[eid], refs)
            ensure_concept(cid, {}, refs, line_no)
        elif kind == "exercise.completed":
            exid = _require_str(payload, "exerciseId", line_no, kind)
            # Prima della logica di correzione: un exerciseId riusato come
            # errorId non deve mai diventare corrected=true.
            claim_role(exid, "esercizio", line_no)
            concept_id = payload.get("conceptId")
            if isinstance(concept_id, str) and concept_id:
                # Come Studio: labels {} (quelle dell'exercise restano al
                # nodo esercizio, fuori digest).
                ensure_concept(concept_id, {}, refs, line_no)
            corrects = payload.get("correctsErrorId")
            if isinstance(corrects, str) and corrects and corrects in error_labels:
                # First correction wins (correctedAt semantics); orphan
                # correctsErrorId invents nothing — Studio evidence-first.
                error_corrected.add(corrects)
        elif kind == "simulation.step.completed":
            stepid = _require_str(payload, "stepId", line_no, kind)
            claim_role(stepid, "esercizio", line_no)
            concept_id = payload.get("conceptId")
            if isinstance(concept_id, str) and concept_id:
                ensure_concept(concept_id, {}, refs, line_no)
        elif kind == "simulation.circuit.solved":
            expid = _require_str(payload, "experimentId", line_no, kind)
            claim_role(expid, "esercizio", line_no)
            concept_id = payload.get("conceptId")
            if isinstance(concept_id, str) and concept_id:
                ensure_concept(concept_id, {}, refs, line_no)
        elif kind == "circuit.trace.assessed":
            attempt_id = _require_str(payload, "attemptId", line_no, kind)
            _require_str(payload, "exerciseId", line_no, kind)
            claim_role(attempt_id, "esercizio", line_no)
            semantic = {"errorId", "conceptId", "conceptLabels"} & payload.keys()
            if semantic:
                step = payload.get("firstInvalidStep")
                if (len(semantic) != 3 or payload.get("outcome") != "first_invalid"
                        or type(step) is not int or step < 1):
                    raise _fail(line_no, "malformed CircuitCheck first-invalid-step evidence")
                error_id = _require_str(payload, "errorId", line_no, kind)
                concept_id = _require_str(payload, "conceptId", line_no, kind)
                method_labels = payload["conceptLabels"]
                if not isinstance(method_labels, dict) or any(
                    not isinstance(value, str) for value in method_labels.values()
                ):
                    raise _fail(line_no, "malformed CircuitCheck conceptLabels")
                claim_role(error_id, "errore", line_no)
                if error_id not in error_labels:
                    error_labels[error_id] = dict(labels)
                    error_evidence[error_id] = list(refs)
                    error_concept[error_id] = concept_id
                else:
                    error_labels[error_id] = merge_labels(error_labels[error_id], labels)
                    merge_evidence(error_evidence[error_id], refs)
                ensure_concept(concept_id, method_labels, refs, line_no)

    concepts = tuple(
        StudyConcept(
            id=cid,
            label=_label_of(cid, concept_labels[cid]),
            evidence_refs=tuple(concept_evidence[cid]),
        )
        for cid in sorted(concept_labels)
    )
    errors = tuple(
        StudyError(
            id=eid,
            label=_label_of(eid, error_labels[eid]),
            concept_id=error_concept[eid],
            corrected=eid in error_corrected,
            evidence_refs=tuple(error_evidence[eid]),
        )
        for eid in sorted(error_labels)
    )
    return LessonOsStudyDigest(lesson_id=lesson_id, concepts=concepts, errors=errors)
