"""Shared authored-family assembly; no verification, alternative ETL or publication."""
import base64
from copy import deepcopy
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps

SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json"


def assemble_family(repo, source_ref, family, tasks, choices, units, asset_name, figures, order, *,
                    unit="u1", source_path=SOURCE_PATH, skill="C1-L002", course="C1",
                    prerequisites=None, section="Vettori e componenti", coverage=None, overrides=None,
                    source_origin="ardesia", source_ids=None):
    # Existing Cric questions are new editions of stable IDs, not AR additions.
    # Keep the original Ardesia assembly/output contract byte-equivalent.
    if source_origin not in ("ardesia", "cric"):
        raise ValueError("Unknown authored source origin")
    if source_origin == "cric":
        if (not isinstance(source_ids, (list, tuple)) or not 1 <= len(source_ids) <= 100
            or len(source_ids) != len(tasks) or any(not isinstance(key, str) for key in source_ids)
            or len(set(source_ids)) != len(source_ids)):
            raise ValueError("Cric editions need 1–100 explicit unique source IDs, one per task")
    elif source_ids is not None:
        raise ValueError("Explicit source IDs require the Cric edition mode")
    originals = {r["id"]: r for r in json.loads(git_bytes(repo, source_ref, source_path))}
    if source_origin == "cric":
        for key in source_ids:
            original = originals.get(key)
            if (original is None or original.get("kind") != "question"
                or type(original.get("version")) is not int or original["version"] < 1):
                raise ValueError("Cric source must be an existing versioned question: " + key)
    path = Path(__file__).resolve().parents[2] / "editorial/assets" / asset_name
    raw = path.read_bytes()
    asset = {"id": sha(raw), "name": path.name, "mime": "image/svg+xml", "data": base64.b64encode(raw).decode()}
    records, bindings = [], []
    for n, (title, prompt, answer, before, law, after, hint) in enumerate(tasks, 1):
        source_id = source_ids[n - 1] if source_origin == "cric" else f"{unit}-{family}-{n:02}"
        original = originals[source_id]
        target = ({"type": "choice", "options": answer, "value": answer[choices[n]]}
                  if isinstance(answer, list) else
                  {"type": "numeric", "value": answer, "unit": units.get(n, "1"), "tolerance": 0})
        row = {"id": "AR-" + source_id, "kind": "question", "course": course, "section": section,
               "order": order + n, "title": title, "version": 1, "baseVersion": 0,
               "skill": skill, "prerequisites": prerequisites if prerequisites is not None else ["C1-L001", "C1-L002"], "reuse": ["C6"],
               "family": family, "difficulty": 1 if n <= 4 else 2 if n <= 12 else 3,
               "prompt": prompt, "answer": target, "blocks": [text(before), *law_steps(law), text(after)],
               "hints": [hint, "Controlla il risultato nella relazione iniziale, con segni e unità coerenti."],
               "error": {"category": "unità" if n == 2 else "concetto" if n in (3, 4, 16) else "algebra", "message": after, "target": skill},
               "coverage": coverage if coverage is not None else ["Vettori", "Prodotti e componenti", "Rapporti e proporzionalità"],
               "review": "DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN"}
        if source_origin == "cric":
            metadata = deepcopy(original)
            # Prompt supplements belong to the previous text. A new supplement
            # can be authored explicitly without retaining contradictory prose.
            metadata.pop("promptBlocks", None)
            row = {**metadata, **row, "id": source_id, "kind": original["kind"],
                   "course": original["course"], "skill": original["skill"], "order": original["order"],
                   "baseVersion": original["version"], "version": original["version"] + 1,
                   "prerequisites": deepcopy(original.get("prerequisites", [])) if prerequisites is None else prerequisites}
        row.update((overrides or {}).get(n, {}))
        if source_origin == "cric":
            identity = {"id": source_id, "kind": original["kind"], "course": original["course"],
                        "skill": original["skill"], "baseVersion": original["version"],
                        "version": original["version"] + 1, "exam": original.get("exam")}
            if any(row.get(key) != value or type(row.get(key)) is not type(value)
                   for key, value in identity.items()):
                raise ValueError("A Cric edition cannot rebind identity, version or protected exam: " + source_id)
        row["error"]["target"] = row["skill"]
        assets = {}
        if n in figures:
            row["blocks"].insert(1, {"type": "figure", "src": "/asset/" + asset["id"], "text": figures[n]})
            assets[path.name] = asset["id"]
        provenance = {"sourceRef": source_ref, "sourcePath": source_path, "sourceId": source_id,
                      "sourceProvenance": original.get("provenance"),
                      "sourceReasoningTask": (original["descriptors"]["reasoningTask"] if source_origin == "ardesia"
                                              else "Existing Cric question; original edition preserved"),
                      "authoringModule": f"tools.corpus_engineering.{family.replace('-', '_')}_authoring",
                      "status": "DRAFT", "independentReview": "NOT_RUN", "humanApproval": "NOT_RUN"}
        if source_origin == "cric":
            provenance.update(sourceOrigin="cric", sourceVersion=original["version"])
        bindings.append({"id": row["id"], "sourceId": source_id, "sourceSha256": digest(original),
                         "candidateSha256": digest(row), "assetChecksums": assets, "sourceRef": source_ref,
                         "provenance": provenance, "provenanceSha256": digest(provenance)})
        records.append(row)
    expected_count = len(source_ids) if source_origin == "cric" else 16
    if len(records) != expected_count or len({r["id"] for r in records}) != expected_count:
        raise ValueError("An authored family must contain exactly sixteen distinct records")
    return {"schema": "astra/1", "records": records, "assets": [asset]}, bindings


def write_family(assemble, batch_name):
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--source-ref", required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    package, bindings = assemble(args.repo, args.source_ref)
    args.destination.mkdir(parents=True, exist_ok=True)
    (args.destination / (batch_name + ".json")).write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
    (args.destination / (batch_name + "-bindings.json")).write_text(canonical(bindings) + "\n")
    print(canonical({"batch": batch_name, "questions": len(package["records"]), "status": "DRAFT", "independentReview": "NOT_RUN", "humanApproval": "NOT_RUN"}))
