"""Build-time ETL. Immutable manifests, existing Astra publication, no runtime side effects."""
import ast
from collections import defaultdict
from copy import deepcopy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import unicodedata

import sympy as sp

VERSION = "1.0.0"
STAGES = ("independentSolution", "dimensions", "physicalAssumptions", "manualArithmetic",
          "pedagogy", "distractors", "integration", "humanApproval")
SYMBOLS = {name: sp.Symbol(name, positive=True) for name in ("x", "z", "y", "alpha", "beta", "t")}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(canonical(value).encode())


def exact(expression, bindings=None):
    """Parse a small mathematical language. Never pass source text to eval/sympify."""
    text = str(expression)
    if len(text) > 1500:
        raise ValueError("Expression too long")
    try:
        tree = ast.parse(text, mode="eval")
    except (SyntaxError, RecursionError) as exc:
        raise ValueError("Invalid expression") from exc
    if sum(1 for _ in ast.walk(tree)) > 180:
        raise ValueError("Expression too complex")

    names = SYMBOLS | {"pi": sp.pi, "E": sp.E} | (bindings or {})
    def read(node, depth=0):
        if depth > 25:
            raise ValueError("Expression too deep")
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            literal = ast.get_source_segment(text, node)
            exponent = re.search(r"[eE]([+-]?\d+)$", literal)
            if "_" in literal or len(literal) > 80 or exponent and abs(int(exponent[1])) > 100:
                raise ValueError("Constant too large")
            return sp.Rational(literal)
        if isinstance(node, ast.Name) and node.id in names:
            return names[node.id]
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
            a = read(node.operand, depth + 1)
            return a if isinstance(node.op, ast.UAdd) else -a
        if isinstance(node, ast.BinOp):
            a, b = read(node.left, depth + 1), read(node.right, depth + 1)
            if isinstance(node.op, ast.Add): return a + b
            if isinstance(node.op, ast.Sub): return a - b
            if isinstance(node.op, ast.Mult): return a * b
            if isinstance(node.op, ast.Div) and b != 0: return a / b
            if isinstance(node.op, ast.Pow) and b.is_Rational and abs(b) <= 100:
                if a.is_number and len(str(a)) > 200: raise ValueError("Power too large")
                return a ** b
        functions = {"sqrt": sp.sqrt, "log": sp.log, "exp": sp.exp,
                     "sin": sp.sin, "cos": sp.cos, "Abs": sp.Abs}
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                and node.func.id == "diff" and len(node.args) == 3 and not node.keywords):
            expr, variable, order = [read(arg, depth + 1) for arg in node.args]
            if isinstance(variable, sp.Symbol) and order.is_Integer and 0 <= order <= 4:
                return sp.diff(expr, variable, order)
            raise ValueError("Derivative outside bounded language")
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                and node.func.id in ("Rational", "log") and len(node.args) == 2 and not node.keywords):
            a, b = [read(arg, depth + 1) for arg in node.args]
            if node.func.id == "Rational" and a.is_Integer and b.is_Integer and b != 0:
                return sp.Rational(a, b)
            if node.func.id == "log" and b.is_number and b > 0 and b != 1:
                return sp.log(a, b)
            raise ValueError("Invalid mathematical arguments")
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                and node.func.id in functions and len(node.args) == 1 and not node.keywords):
            value = read(node.args[0], depth + 1)
            if node.func.id == "exp" and value.is_number and abs(value) > 100:
                raise ValueError("Exponential too large")
            return functions[node.func.id](value)
        raise ValueError("Unsupported mathematical syntax")
    return read(tree.body)


def arithmetic(row):
    """Recompute supported checks; a stored residual of zero is never a proof."""
    evidence = []
    for check in row.get("verification", {}).get("automaticChecks", []):
        try:
            kind = check.get("kind")
            if "expected" in check and "expression" in check:
                lhs, rhs = exact(check["expression"]), exact(check["expected"])
            elif kind == "substitution":
                values = {k: exact(v) for k, v in check["values"].items() if k in SYMBOLS}
                lhs = exact(check["expression"], values)
                rhs = exact(check["values"]["y"])
                if sp.simplify(lhs - exact(row["answer"]["exact"])) != 0:
                    evidence.append({"kind": "direct_answer", "status": "FAIL", "reason": "Answer differs from recomputed result"})
            elif kind == "ratio":
                lhs = exact(check["numerator"]) / exact(check["denominator"])
                rhs = exact(row["answer"]["exact"])
            else:
                continue
            residual = sp.simplify(lhs - rhs)
            if residual.free_symbols:
                raise ValueError("Unbound symbols")
            evidence.append({"kind": kind or "expected_expression", "residual": str(residual),
                             "status": "PASS" if residual == 0 else "FAIL"})
        except (ValueError, KeyError, TypeError, ZeroDivisionError) as exc:
            evidence.append({"kind": check.get("kind", "expression"), "status": "FAIL", "reason": str(exc)})
    return {"status": ("FAIL" if any(x["status"] == "FAIL" for x in evidence)
                       else "PASS" if evidence else "NOT_RUN"), "checks": evidence,
            "scope": "recomputed_source_assertions_not_independent_physics"}


def build_entry(origin, row, provenance, verifier, previous=None):
    content_hash = digest(row)
    key = row["id"] if origin == "cric" else "AR-" + row["id"]
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,95}", key):
        raise ValueError("Invalid canonical ID: " + key)
    if (previous and previous["sourceSha256"] == content_hash
            and previous["verifierSha256"] == verifier and previous["provenance"] == provenance):
        return deepcopy(previous)
    return {"schemaVersion": VERSION, "id": key, "origin": origin, "sourceId": row["id"],
            "sourceVersion": row.get("version", 1), "sourceSha256": content_hash,
            "provenance": provenance, "verifierSha256": verifier,
            "visibility": "protected_exam" if row.get("exam") else "draft" if origin == "ardesia" else "existing_published",
            "family": row.get("familyId", row.get("family", "")),
            "competency": row.get("skill", ""),
            "state": "ACCOUNTED", "automatic": {"sourceArithmetic": arithmetic(row)},
            "review": dict.fromkeys(STAGES, "NOT_RUN"), "evidence": [], "blocked": []}


def duplicate_candidates(rows):
    """Non-destructive index: repeated reasoning is a review queue, not an equivalence proof."""
    groups = defaultdict(list)
    for origin, row in rows:
        key = row["id"] if origin == "cric" else "AR-" + row["id"]
        text = unicodedata.normalize("NFKC", row.get("prompt", "")).casefold()
        normal = " ".join(re.findall(r"\w+", text))
        if normal:
            groups[("exact_prompt", sha(normal.encode()))].append(key)
            skeleton = re.sub(r"\d+(?:[.,]\d+)?", "#", normal)
            groups[("numeric_skeleton", sha(skeleton.encode()))].append(key)
        if row.get("lawFamily"):
            task = row.get("descriptors", {}).get("reasoningTask", "")
            groups[("law_and_reasoning_task", row["lawFamily"] + ":" + task)].append(key)
    return [{"method": method, "signature": signature, "ids": sorted(ids), "decision": "REVIEW_REQUIRED"}
            for (method, signature), ids in sorted(groups.items()) if len(ids) > 1]


def write_immutable(path, raw):
    if path.exists():
        if path.read_bytes() != raw:
            raise ValueError("Immutable checkpoint differs: " + str(path))
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_bytes(raw)
        os.replace(temporary, path)


def checkpoint(destination, entries, activities, metadata, artifacts=None):
    entries = sorted(entries, key=lambda row: row["id"])
    if len({r["id"] for r in entries}) != len(entries):
        raise ValueError("Duplicate canonical ID")
    artifacts = artifacts or {}
    if any(Path(name).name != name for name in artifacts): raise ValueError("Invalid artifact name")
    identity = digest({"questions": entries, "activities": activities, "metadata": metadata, "artifacts": artifacts})
    generation = Path("generations") / identity
    directory = destination / generation
    files = {}
    for start in range(0, len(entries), 100):
        files[f"questions-{start // 100 + 1:03}.json"] = entries[start:start + 100]
    files["activities.json"] = activities
    files["inputs.json"] = metadata
    files.update(artifacts)
    files["manifest.json"] = {**metadata, "schemaVersion": VERSION, "questionCount": len(entries),
        "activityCount": len(activities), "countsByOrigin": {o: sum(r["origin"] == o for r in entries) for o in ("ardesia", "cric")},
        "independentReviewedCount": sum(r["review"]["independentSolution"] in ("PASS_AI", "PASS_AUTO") for r in entries),
        "humanApprovedCount": sum(r["review"]["humanApproval"] == "APPROVED" for r in entries),
        "blockedCount": sum(bool(r["blocked"]) for r in entries)}
    sums = []
    for name, value in sorted(files.items()):
        raw = (canonical(value) + "\n").encode()
        write_immutable(directory / name, raw)
        sums.append(sha(raw) + "  " + name)
    write_immutable(directory / "SHA256SUMS", ("\n".join(sums) + "\n").encode())
    pointer = {"schemaVersion": VERSION, "generation": generation.as_posix(), "questionCount": len(entries),
               "manifestSha256": sha((directory / "manifest.json").read_bytes())}
    destination.mkdir(parents=True, exist_ok=True)
    temporary = destination / "checkpoint.json.tmp"
    temporary.write_text(canonical(pointer) + "\n")
    os.replace(temporary, destination / "checkpoint.json")
    return pointer


def load_checkpoint(destination):
    """Validate every byte and the content address before trusting cached review state."""
    pointer = json.loads((destination / "checkpoint.json").read_text())
    if not re.fullmatch(r"generations/[a-f0-9]{64}", pointer["generation"]):
        raise ValueError("Invalid generation path")
    directory = destination / pointer["generation"]
    sums = (directory / "SHA256SUMS").read_text().splitlines()
    names = set()
    for line in sums:
        checksum, name = line.split("  ", 1)
        if Path(name).name != name or name in names or not re.fullmatch(r"[a-f0-9]{64}", checksum):
            raise ValueError("Invalid checksum index")
        names.add(name)
        if sha((directory / name).read_bytes()) != checksum: raise ValueError("Corrupt cached artifact: " + name)
    if {p.name for p in directory.iterdir()} != names | {"SHA256SUMS"}:
        raise ValueError("Incomplete or unexpected cached artifacts")
    if sha((directory / "manifest.json").read_bytes()) != pointer["manifestSha256"]:
        raise ValueError("Manifest checksum differs from checkpoint")
    entries = [r for name in sorted(names) if name.startswith("questions-")
               for r in json.loads((directory / name).read_text())]
    activities = json.loads((directory / "activities.json").read_text())
    metadata = json.loads((directory / "inputs.json").read_text())
    artifacts = {n: json.loads((directory / n).read_text()) for n in names
                 if not n.startswith("questions-") and n not in {"activities.json", "inputs.json", "manifest.json"}}
    identity = digest({"questions": entries, "activities": activities, "metadata": metadata, "artifacts": artifacts})
    if directory.name != identity or len(entries) != pointer["questionCount"]:
        raise ValueError("Checkpoint content address mismatch")
    return entries, activities, metadata


def git_bytes(repo, commit, path):
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Pin an immutable Git SHA")
    return subprocess.check_output(["git", "-C", str(repo), "show", commit + ":" + path])
