"""Shared authored-family assembly; no verification, alternative ETL or publication."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps

SOURCE_PATH = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json"


def assemble_family(repo, source_ref, family, tasks, choices, units, asset_name, figures, order, *,
                    unit="u1", source_path=SOURCE_PATH, skill="C1-L002",
                    prerequisites=None, section="Vettori e componenti", coverage=None, overrides=None):
    originals = {r["id"]: r for r in json.loads(git_bytes(repo, source_ref, source_path))}
    path = Path(__file__).resolve().parents[2] / "editorial/assets" / asset_name
    raw = path.read_bytes()
    asset = {"id": sha(raw), "name": path.name, "mime": "image/svg+xml", "data": base64.b64encode(raw).decode()}
    records, bindings = [], []
    for n, (title, prompt, answer, before, law, after, hint) in enumerate(tasks, 1):
        source_id = f"{unit}-{family}-{n:02}"
        original = originals[source_id]
        target = ({"type": "choice", "options": answer, "value": answer[choices[n]]}
                  if isinstance(answer, list) else
                  {"type": "numeric", "value": answer, "unit": units.get(n, "1"), "tolerance": 0})
        row = {"id": "AR-" + source_id, "kind": "question", "course": "C1", "section": section,
               "order": order + n, "title": title, "version": 1, "baseVersion": 0,
               "skill": skill, "prerequisites": prerequisites if prerequisites is not None else ["C1-L001", "C1-L002"], "reuse": ["C6"],
               "family": family, "difficulty": 1 if n <= 4 else 2 if n <= 12 else 3,
               "prompt": prompt, "answer": target, "blocks": [text(before), *law_steps(law), text(after)],
               "hints": [hint, "Controlla il risultato nella relazione iniziale, con segni e unità coerenti."],
               "error": {"category": "unità" if n == 2 else "concetto" if n in (3, 4, 16) else "algebra", "message": after, "target": skill},
               "coverage": coverage if coverage is not None else ["Vettori", "Prodotti e componenti", "Rapporti e proporzionalità"],
               "review": "DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN"}
        row.update((overrides or {}).get(n, {}))
        row["error"]["target"] = row["skill"]
        assets = {}
        if n in figures:
            row["blocks"].insert(1, {"type": "figure", "src": "/asset/" + asset["id"], "text": figures[n]})
            assets[path.name] = asset["id"]
        provenance = {"sourceRef": source_ref, "sourcePath": source_path, "sourceId": source_id,
                      "sourceProvenance": original.get("provenance"),
                      "sourceReasoningTask": original["descriptors"]["reasoningTask"],
                      "authoringModule": f"tools.corpus_engineering.{family.replace('-', '_')}_authoring",
                      "status": "DRAFT", "independentReview": "NOT_RUN", "humanApproval": "NOT_RUN"}
        bindings.append({"id": row["id"], "sourceId": source_id, "sourceSha256": digest(original),
                         "candidateSha256": digest(row), "assetChecksums": assets, "sourceRef": source_ref,
                         "provenance": provenance, "provenanceSha256": digest(provenance)})
        records.append(row)
    if len(records) != 16 or len({r["id"] for r in records}) != 16:
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
