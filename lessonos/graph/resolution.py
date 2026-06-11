"""Global per-teacher concept resolution (M1-1c).

POST-extraction pass: collects every concept mention (name + per-lesson
canonical + one line of context) across ONE teacher's lessons, asks an LLM
(behind the substitutable ``Router`` interface) which mentions denote the
SAME concept, and produces an open, auditable, regenerable JSON mapping to
be written under ``derived/`` (never in ``raw/``, never committed).

The aggregator (``lessonos/graph/aggregator.py``) CONSUMES the mapping and
stays ZERO-LLM: resolution is the only step that talks to a model, and it is
a separate, re-runnable pass.

Conservative by construction:
- Only same-concept merges are accepted ("related" is explicitly forbidden
  in the prompt, and the validator drops anything it cannot verify).
- Group members are referenced by index; indexes that do not exist, appear
  twice, or arrive malformed are dropped and recorded in ``dropped`` for
  audit (never silently invented).
- Original labels are preserved as aliases; per-mention evidence is never
  touched.
- Mentions are collected from ONE teacher's paths only, and the mapping
  carries its ``teacher_id`` which the aggregator validates (no
  cross-teacher contamination).
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from lessonos.capsule.assembly import load_capsule
from lessonos.llm.router import Router
from lessonos.store.base import Store

RESOLUTION_SCHEMA_VERSION = 1

_CONTEXT_MAX_CHARS = 160

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _normalize_name(name: str) -> str:
    """Normalise a concept name: lowercase, strip whitespace (same rule as the aggregator)."""
    return name.strip().lower()


@dataclass(frozen=True)
class ConceptMention:
    """A single concept mention inside one lesson capsule."""

    lesson_id: str
    name: str
    canonical: str
    status: str
    context: str
    evidence_count: int


@dataclass(frozen=True)
class ResolutionAlias:
    """One original per-lesson label folded under a global canonical."""

    lesson_id: str
    original_name: str
    original_canonical: str
    evidence_count: int


@dataclass(frozen=True)
class ResolutionEntry:
    """A global canonical concept and all per-lesson aliases it covers."""

    canonical: str
    aliases: tuple[ResolutionAlias, ...]

    @property
    def lesson_count(self) -> int:
        return len({a.lesson_id for a in self.aliases})


@dataclass(frozen=True)
class GlobalResolution:
    """The per-teacher global concept mapping (the derived/ artifact).

    ``entries`` covers EVERY input mention: merged groups plus singletons,
    so the aggregator can key every concept through the mapping. ``dropped``
    records group members the validator refused (audit trail).
    """

    teacher_id: str
    entries: tuple[ResolutionEntry, ...] = ()
    provider: str = ""
    model: str = ""
    generated_at: str = ""
    dropped: tuple[str, ...] = ()
    usage: dict | None = None
    schema_version: int = RESOLUTION_SCHEMA_VERSION

    def alias_lookup(self) -> dict[tuple[str, str], str]:
        """Build ``{(lesson_id, normalized_name) -> global_canonical}``.

        This is the ZERO-LLM consumption surface for the aggregator.
        """
        lookup: dict[tuple[str, str], str] = {}
        for entry in self.entries:
            for alias in entry.aliases:
                lookup[(alias.lesson_id, _normalize_name(alias.original_name))] = (
                    entry.canonical
                )
        return lookup

    def merged_entries(self) -> tuple[ResolutionEntry, ...]:
        """Entries that actually unify more than one alias (the merge list)."""
        return tuple(e for e in self.entries if len(e.aliases) > 1)


def collect_concept_mentions(
    store: Store,
    teacher_id: str,
) -> tuple[ConceptMention, ...]:
    """Collect all concept mentions across ONE teacher's lessons.

    Only paths whose ``teacher_id`` matches are read, so the resolution input
    cannot contain another teacher's concepts.

    Raises:
        ValueError: If the teacher has no paths in the store.
    """
    paths = store.paths_for_teacher(teacher_id)
    if not paths:
        raise ValueError(f"teacher {teacher_id!r} has no paths in the store")

    mentions: list[ConceptMention] = []
    seen_lessons: set[str] = set()
    for path in paths:
        for lesson_id in path.lesson_ids:
            if lesson_id in seen_lessons:
                continue
            seen_lessons.add(lesson_id)
            capsule = load_capsule(store, lesson_id)
            if capsule is None:
                continue
            for concept in capsule.content.concepts:
                context = ""
                for cite in concept.citations:
                    if cite.excerpt:
                        context = " ".join(cite.excerpt.split())
                        break
                mentions.append(
                    ConceptMention(
                        lesson_id=lesson_id,
                        name=concept.name,
                        canonical=concept.canonical,
                        status=concept.status,
                        context=context[:_CONTEXT_MAX_CHARS],
                        evidence_count=len(concept.citations),
                    )
                )
    return tuple(mentions)


def build_resolution_prompt(mentions: tuple[ConceptMention, ...]) -> str:
    """Deterministic prompt for global concept resolution (stable -> mock-keyable)."""
    lines = [
        "Risoluzione concetti GLOBALE per le lezioni di UN docente.",
        "Sotto trovi le menzioni di concetti estratte dalle sue lezioni, una per riga:",
        "indice | lesson_id | nome | canonical-per-lezione | contesto",
        "",
        "Unifica SOLO menzioni che denotano LO STESSO concetto con nomi diversi",
        "(es. 'Definizione di segnale' e 'Il segnale come grandezza fisica').",
        "MAI unificare concetti soltanto correlati, in relazione prerequisito,",
        "o uno caso particolare dell'altro. In dubbio NON unificare (conservativo).",
        "",
        "NON unificare (esempi di errori da evitare):",
        "- un concetto e il suo opposto o la sua negazione",
        "  (es. 'limitato' vs 'non limitato');",
        "- oggetti distinti della stessa teoria (es. 'misura di Lebesgue' vs",
        "  'integrale di Lebesgue' vs 'sommabilità': tre concetti diversi);",
        "- varianti o sottocasi enumerati (es. 'primo criterio' vs 'secondo",
        "  criterio'; 'segnale analogico' vs 'segnale digitale');",
        "- una funzione/esempio specifico con la teoria che illustra",
        "  (es. 'funzione di Dirichlet' vs 'integrale di Lebesgue');",
        "- definizioni di quantità diverse (es. 'energia' vs 'potenza').",
        "Unifica solo se i due nomi sono riformulazioni dello STESSO identico",
        "concetto e un docente li userebbe in modo intercambiabile.",
        "",
        'Rispondi SOLO con JSON: {"groups": [{"canonical": "<nome breve normalizzato>",',
        '"members": [{"i": <indice intero>, "name": "<nome ESATTO della riga>"}]}]}.',
        "Il campo name deve copiare ESATTAMENTE il nome della riga indicata da i",
        "(verifica anti-errore: i membri con name non corrispondente vengono scartati).",
        "Includi solo gruppi con almeno 2 menzioni. Ogni indice in al massimo un gruppo.",
        "",
    ]
    for idx, m in enumerate(mentions):
        lines.append(
            f"{idx} | {m.lesson_id} | {m.name} | {m.canonical} | {m.context}"
        )
    return "\n".join(lines)


def _parse_groups(
    raw_text: str,
    mentions: tuple[ConceptMention, ...],
) -> tuple[list[tuple[str, list[int]]], list[str]]:
    """Parse and conservatively validate the LLM groups.

    Returns ``(groups, dropped)`` where each group is ``(canonical, member
    indexes)``. Anything malformed is dropped and described in ``dropped``;
    a member index can belong to at most one group (first wins). Groups left
    with fewer than 2 members are discarded (their mentions stay singletons).

    Each member must echo the EXACT mention name next to its index — a
    member whose echoed name does not match ``mentions[i].name`` is dropped
    (this catches LLM off-by-one/hallucinated indexes deterministically).

    Raises:
        ValueError: If the response is not parseable JSON with a ``groups``
            list (better an honest failure than an empty silent mapping).
    """
    n_mentions = len(mentions)
    text = _CODE_FENCE_RE.sub("", raw_text.strip()).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"resolution LLM response is not valid JSON: {exc}"
        ) from exc
    if not isinstance(data, dict) or not isinstance(data.get("groups"), list):
        raise ValueError(
            "resolution LLM response missing 'groups' list"
        )

    groups: list[tuple[str, list[int]]] = []
    dropped: list[str] = []
    assigned: set[int] = set()

    for gi, group in enumerate(data["groups"]):
        if not isinstance(group, dict):
            dropped.append(f"group[{gi}]: not an object")
            continue
        canonical = group.get("canonical")
        if not isinstance(canonical, str) or not canonical.strip():
            dropped.append(f"group[{gi}]: missing/empty canonical")
            continue
        canonical = _normalize_name(canonical)
        members_raw = group.get("members")
        if not isinstance(members_raw, list):
            dropped.append(f"group[{gi}] ({canonical}): members not a list")
            continue
        members: list[int] = []
        for m in members_raw:
            if not isinstance(m, dict):
                dropped.append(f"group[{gi}] ({canonical}): member not an object {m!r}")
                continue
            idx = m.get("i")
            if not isinstance(idx, int) or isinstance(idx, bool):
                dropped.append(f"group[{gi}] ({canonical}): non-int index {idx!r}")
                continue
            if not (0 <= idx < n_mentions):
                dropped.append(
                    f"group[{gi}] ({canonical}): index {idx} out of range"
                )
                continue
            echoed = m.get("name")
            if not isinstance(echoed, str) or (
                _normalize_name(echoed) != _normalize_name(mentions[idx].name)
            ):
                dropped.append(
                    f"group[{gi}] ({canonical}): name mismatch at index {idx} "
                    f"(echoed {echoed!r}, actual {mentions[idx].name!r})"
                )
                continue
            if idx in assigned:
                dropped.append(
                    f"group[{gi}] ({canonical}): index {idx} already in another group"
                )
                continue
            if idx in members:
                continue
            members.append(idx)
        if len(members) < 2:
            if members:
                dropped.append(
                    f"group[{gi}] ({canonical}): fewer than 2 valid members, discarded"
                )
            continue
        assigned.update(members)
        groups.append((canonical, members))

    return groups, dropped


def build_verification_prompt(
    mentions: tuple[ConceptMention, ...],
    pairs: tuple[tuple[int, int], ...],
) -> str:
    """Deterministic prompt for the pairwise verification pass.

    Each candidate pair from the grouping pass is re-judged in isolation —
    binary same/different decisions are far more reliable than one-shot
    global grouping. A pair not explicitly confirmed is dropped
    (conservative default).
    """
    lines = [
        "Sei il revisore di un glossario di concetti di un corso universitario.",
        "Per ogni coppia sotto, decidi se i due nomi denotano LO STESSO",
        "concetto didattico (stessa voce del glossario), anche se formulati",
        "con livello di dettaglio diverso (es. 'Definizione di segnale' e",
        "'Il segnale come grandezza fisica' sono SAME).",
        "",
        "Rispondi DIFFERENT se: uno è un caso particolare, un esempio o una",
        "variante dell'altro; sono opposti; sono oggetti distinti della stessa",
        "teoria; sono soltanto correlati o in relazione prerequisito.",
        "",
        'Rispondi SOLO con JSON: {"verdicts": [{"pair": <indice coppia>,',
        '"same": true|false}]}. Un verdetto per OGNI coppia.',
        "",
    ]
    for pi, (a, b) in enumerate(pairs):
        ma, mb = mentions[a], mentions[b]
        lines.append(f"coppia {pi}:")
        lines.append(f"  A: [{ma.lesson_id}] {ma.name} | {ma.context}")
        lines.append(f"  B: [{mb.lesson_id}] {mb.name} | {mb.context}")
    return "\n".join(lines)


def _parse_verdicts(raw_text: str, n_pairs: int) -> set[int]:
    """Parse the verification response; return the set of CONFIRMED pair indexes.

    Anything missing, malformed or not exactly ``same: true`` counts as NOT
    confirmed (conservative). Raises ValueError only if the response is not
    JSON with a ``verdicts`` list (honest failure).
    """
    text = _CODE_FENCE_RE.sub("", raw_text.strip()).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"verification LLM response is not valid JSON: {exc}"
        ) from exc
    if not isinstance(data, dict) or not isinstance(data.get("verdicts"), list):
        raise ValueError("verification LLM response missing 'verdicts' list")

    confirmed: set[int] = set()
    for v in data["verdicts"]:
        if not isinstance(v, dict):
            continue
        pi = v.get("pair")
        if not isinstance(pi, int) or isinstance(pi, bool):
            continue
        if not (0 <= pi < n_pairs):
            continue
        if v.get("same") is True:
            confirmed.add(pi)
    return confirmed


def _sum_usage(*usages: dict | None) -> dict | None:
    """Sum token counts across LLM calls (for the cost ledger)."""
    keys = ("prompt_tokens", "completion_tokens", "total_tokens")
    present = [u for u in usages if u]
    if not present:
        return None
    return {k: sum(int(u.get(k, 0)) for u in present) for k in keys}


def resolve_concepts_globally(
    store: Store,
    teacher_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
) -> GlobalResolution:
    """Run the global concept-resolution pass for ONE teacher.

    Two LLM calls behind the substitutable Router:
      1. grouping — candidate same-concept groups over all mentions;
      2. verification — every candidate pair re-judged in isolation; a pair
         not explicitly confirmed is dropped (conservative).

    Returns the complete mapping (merged groups + singletons). The caller
    persists it with :func:`save_resolution`.
    """
    mentions = collect_concept_mentions(store, teacher_id)
    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    if not mentions:
        return GlobalResolution(
            teacher_id=teacher_id,
            provider=provider,
            model=model or "",
            generated_at=generated_at,
        )

    prompt = build_resolution_prompt(mentions)
    response = router.complete(prompt, provider=provider, model=model)
    groups, dropped = _parse_groups(response.text, mentions)

    # Verification pass: anchor-based pairs per group, judged in isolation.
    verify_usage: dict | None = None
    if groups:
        pairs: list[tuple[int, int]] = []
        pair_origin: list[tuple[int, int]] = []  # (group_index, member_idx)
        for gi, (_, members) in enumerate(groups):
            anchor = members[0]
            for other in members[1:]:
                pairs.append((anchor, other))
                pair_origin.append((gi, other))

        v_prompt = build_verification_prompt(mentions, tuple(pairs))
        v_response = router.complete(v_prompt, provider=provider, model=model)
        verify_usage = v_response.usage
        confirmed = _parse_verdicts(v_response.text, len(pairs))

        kept: list[tuple[str, list[int]]] = []
        for gi, (canonical, members) in enumerate(groups):
            anchor = members[0]
            confirmed_members = [anchor]
            for pi, (origin_gi, member_idx) in enumerate(pair_origin):
                if origin_gi != gi:
                    continue
                if pi in confirmed:
                    confirmed_members.append(member_idx)
                else:
                    dropped.append(
                        f"group ({canonical}): {mentions[member_idx].name!r} "
                        f"not confirmed by verification pass, removed"
                    )
            if len(confirmed_members) >= 2:
                kept.append((canonical, confirmed_members))
            elif members:
                dropped.append(
                    f"group ({canonical}): fewer than 2 members after "
                    f"verification, discarded"
                )
        groups = kept

    def _alias(idx: int) -> ResolutionAlias:
        m = mentions[idx]
        return ResolutionAlias(
            lesson_id=m.lesson_id,
            original_name=m.name,
            original_canonical=m.canonical,
            evidence_count=m.evidence_count,
        )

    # Coalesce by canonical key: two groups (or a group and singletons) that
    # share the same canonical ARE the same global concept.
    by_canonical: dict[str, list[ResolutionAlias]] = {}
    grouped_idx: set[int] = set()
    for canonical, members in groups:
        by_canonical.setdefault(canonical, []).extend(
            _alias(i) for i in members
        )
        grouped_idx.update(members)

    for idx, m in enumerate(mentions):
        if idx in grouped_idx:
            continue
        canonical = m.canonical if m.canonical else _normalize_name(m.name)
        by_canonical.setdefault(canonical, []).append(_alias(idx))

    entries = tuple(
        ResolutionEntry(canonical=c, aliases=tuple(aliases))
        for c, aliases in by_canonical.items()
    )
    return GlobalResolution(
        teacher_id=teacher_id,
        entries=entries,
        provider=response.provider,
        model=response.model,
        generated_at=generated_at,
        dropped=tuple(dropped),
        usage=_sum_usage(response.usage, verify_usage),
    )


def save_resolution(resolution: GlobalResolution, path: str | Path) -> None:
    """Write the mapping as open, human-auditable JSON (a derived/ artifact)."""
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps(asdict(resolution), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def load_resolution(path: str | Path) -> GlobalResolution:
    """Load a previously saved mapping.

    Raises:
        ValueError: If the file is malformed (missing teacher_id/entries).
    """
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    teacher_id = data.get("teacher_id")
    if not isinstance(teacher_id, str) or not teacher_id:
        raise ValueError(f"resolution file {path}: missing teacher_id")
    raw_entries = data.get("entries")
    if not isinstance(raw_entries, list):
        raise ValueError(f"resolution file {path}: missing entries list")
    entries = []
    for e in raw_entries:
        aliases = tuple(
            ResolutionAlias(
                lesson_id=a["lesson_id"],
                original_name=a["original_name"],
                original_canonical=a.get("original_canonical", ""),
                evidence_count=int(a.get("evidence_count", 0)),
            )
            for a in e.get("aliases", [])
        )
        entries.append(
            ResolutionEntry(canonical=e["canonical"], aliases=aliases)
        )
    return GlobalResolution(
        teacher_id=teacher_id,
        entries=tuple(entries),
        provider=data.get("provider", ""),
        model=data.get("model", ""),
        generated_at=data.get("generated_at", ""),
        dropped=tuple(data.get("dropped", ())),
        usage=data.get("usage"),
        schema_version=int(data.get("schema_version", RESOLUTION_SCHEMA_VERSION)),
    )
