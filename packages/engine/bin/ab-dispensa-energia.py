#!/usr/bin/env python3
"""M2-2b A/B: Compare spoken-only (v1) vs spoken+written (v2) dispensa,
then compare BOTH against the real Energia dispensa by Andrea.

Strategy:
  - V1 (spoken-only): uses the existing andrea.md from M1-6 (Prima lezione, spoken-only)
  - V2 (spoken+written): generates fresh with top 8 concepts + written-style
  - Comparison: style.py metrics against the REAL Energia.raw.txt

Usage:
    uv run python bin/ab-dispensa-energia.py
"""

from __future__ import annotations

import json
import os
import re
import sys


def _avg_sentence_length(text: str) -> float:
    sentences = [s.strip() for s in re.split(r'[.!?;]\s+', text) if s.strip()]
    if not sentences:
        return 0.0
    return sum(len(s.split()) for s in sentences) / len(sentences)


def _formal_density(text: str) -> float:
    FORMAL = frozenset({
        "pertanto", "dunque", "quindi", "ovvero", "ossia", "nonché",
        "conseguentemente", "tuttavia", "inoltre", "difatti",
        "condizione", "teorema", "criterio", "necessaria", "sufficiente",
        "definizione", "dimostrazione", "corollario", "lemma",
    })
    tokens = text.lower().split()
    if not tokens:
        return 0.0
    count = sum(1 for t in tokens if t.strip(".,!?;:()[]\"\"''") in FORMAL)
    return count / len(tokens) * 1000


def _math_density(text: str) -> float:
    tokens = text.split()
    if not tokens:
        return 0.0
    MATH_WORDS = frozenset({"integrale", "derivata", "funzione", "dominio",
                            "spazio", "norma", "prodotto", "scalare", "vettore",
                            "matrice", "teorema", "dimostrazione", "lemma",
                            "corollario", "energia", "potenza", "sommabilità",
                            "quadrato", "infinito", "convergenza", "criterio"})
    count = sum(1 for t in tokens if t.lower().strip(".,!?;:()[]\"\"''") in MATH_WORDS)
    return count / len(tokens) * 1000


def _section_count(text: str) -> int:
    return len(re.findall(r'^#{2,3}\s+\S', text, re.MULTILINE))


def _bullet_density(text: str) -> float:
    tokens = text.split()
    if not tokens:
        return 0.0
    bullets = len(re.findall(r'^[\s]*[-*]\s', text, re.MULTILINE))
    return bullets / len(tokens) * 1000


def analyze_text(text: str) -> dict:
    return {
        "avg_sentence_length": _avg_sentence_length(text),
        "formal_density": _formal_density(text),
        "math_density": _math_density(text),
        "section_count": _section_count(text),
        "bullet_density": _bullet_density(text),
        "char_count": len(text),
        "word_count": len(text.split()),
    }


_VERDE = "\033[32m"
_GIALLO = "\033[33m"
_ROSSO = "\033[31m"
_RESET = "\033[0m"


def _colorize(val: float, real: float | None, fmt: str = ".2f") -> str:
    if real is None or real <= 0:
        return f"{val:{fmt}}"
    diff = abs(val - real) / max(real, 0.01)
    if diff < 0.15:
        return f"{_VERDE}{val:{fmt}}{_RESET}"
    elif diff < 0.50:
        return f"{_GIALLO}{val:{fmt}}{_RESET}"
    else:
        return f"{_ROSSO}{val:{fmt}}{_RESET}"


def load_v1() -> str:
    """V1 is the existing spoken-only dispensa from M1-6."""
    path = os.path.expanduser(
        "~/maestro-data/teoria-segnali-2021/derived/dispense/andrea.md"
    )
    if not os.path.exists(path):
        raise FileNotFoundError(f"V1 not at {path}")
    with open(path, encoding="utf-8") as f:
        return f.read()


def load_real_energia() -> str | None:
    path = os.path.expanduser(
        "~/maestro-data/teoria-segnali-2021/derived/dispense/Energia.raw.txt"
    )
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return f.read()


def generate_v2() -> tuple[str, dict]:
    """Generate v2 (spoken+written) with top 8 concepts."""
    from lessonos.store.sqlite import SQLiteStore
    from lessonos.llm.deepseek import DeepSeekProvider, estimate_deepseek_api_cost
    from lessonos.llm.router import Router
    from lessonos.dispensa import (
        build_dispensa_prompt, _resolve_concepts_from_capsules,
        _parse_dispensa_response, render_dispensa_md, verify_and_clean_dispensa,
        DispensaDoc, DispensaSection, DispensaParagraph, DispensaClaim,
    )
    from lessonos.style import derive_written_style, derive_style_profile
    from lessonos.teacher_book import build_teacher_book
    from lessonos.capsule.assembly import load_capsule
    from lessonos.graph.resolution import load_resolution

    DATA_ROOT = os.path.expanduser("~/maestro-data/teoria-segnali-2021")
    DB_PATH = os.path.join(DATA_ROOT, "derived/db/lessonos.db")
    DISPENSE_DIR = os.path.join(DATA_ROOT, "derived/dispense")
    GLOBAL_RES = os.path.join(DATA_ROOT, "derived/global_resolution/andrea.json")

    store = SQLiteStore(DB_PATH)
    resolution = load_resolution(GLOBAL_RES) if os.path.exists(GLOBAL_RES) else None
    book = build_teacher_book(store, "andrea", resolution=resolution)
    style = derive_style_profile(store, "andrea")
    written = derive_written_style(dispense_dir=DISPENSE_DIR)

    # Top 8 fundamental concepts (keeps prompt + response within token limits)
    top_concepts = book.fundamental_concepts[:8]

    paths = store.paths_for_teacher("andrea")
    capsules_map = {}
    for pth in paths:
        for lid in pth.lesson_ids:
            cap = load_capsule(store, lid)
            if cap is not None and cap.content:
                capsules_map[lid] = {
                    ext.name.lower().strip(): ext
                    for ext in cap.content.concepts
                }
    resolved = _resolve_concepts_from_capsules(top_concepts, capsules_map)

    prompt = build_dispensa_prompt("andrea", style, resolved, written_style=written)
    print(f"  Prompt: {len(prompt)} chars, ~{len(prompt.split())} tokens")

    provider = DeepSeekProvider(model="deepseek-chat")
    resp = provider.complete(prompt)
    usage = resp.usage or {}
    print(f"  Response: {len(resp.text)} chars, ~{len(resp.text.split())} tokens")

    sections = _parse_dispensa_response(resp.text)
    doc = DispensaDoc(
        teacher_id="andrea",
        title="Dispensa di Andrea (con stile scritto)",
        sections=sections,
        style_profile=style,
    )

    cleaned, report = verify_and_clean_dispensa(doc, store)
    md = render_dispensa_md(cleaned, report)

    # Estimate cost
    cost = estimate_deepseek_api_cost(usage, model="deepseek-chat")

    v2_path = os.path.join(DISPENSE_DIR, "andrea.v2.md")
    with open(v2_path, "w", encoding="utf-8") as f:
        f.write(md + "\n")
    print(f"  V2 saved: {v2_path}")

    stats = {
        "total_claims": report.total_claims,
        "verified": report.verified,
        "dropped": report.dropped,
        "cost": cost,
        "prompt_tokens": len(prompt.split()),
        "response_tokens": len(resp.text.split()),
    }
    return md, stats


def main():
    print("=" * 70)
    print("M2-2b A/B: Andrea Dispensa — spoken-only (v1) vs spoken+written (v2)")
    print("=" * 70)
    print()

    # V1: load existing spoken-only
    print("Loading V1 (spoken-only, from M1-6)...")
    v1_text = load_v1()
    v1m = analyze_text(v1_text)
    print(f"  {v1m['char_count']} chars, {v1m['word_count']:.0f} words, "
          f"{v1m['section_count']} sections")
    print()

    # V2: generate with spoken+written
    print("Generating V2 (spoken+written, 8 concepts)...")
    v2_text, v2_stats = generate_v2()
    v2m = analyze_text(v2_text)
    print(f"  {v2m['char_count']} chars, {v2m['word_count']:.0f} words, "
          f"{v2m['section_count']} sections")
    print()

    # Real Energia reference
    real_text = load_real_energia()
    if real_text:
        rm = analyze_text(real_text)
        print(f"REAL Energia.pdf: {rm['char_count']} chars, "
              f"{rm['word_count']:.0f} words, {rm['section_count']} sections")
    else:
        rm = None
        print("WARNING: Energia.raw.txt not found — skipping real comparison")
    print()

    # --- Comparison table ---
    METRICS = [
        ("avg_sentence_length", "avg frase (tok)"),
        ("formal_density", "formali/1000t"),
        ("math_density", "math/1000t"),
        ("section_count", "sezioni"),
        ("bullet_density", "bullet/1000t"),
        ("char_count", "caratteri"),
        ("word_count", "parole"),
    ]

    def diff_tag(v, r):
        if r is None or r <= 0:
            return " —"
        d = abs(v - r) / max(r, 0.01)
        if d < 0.15:
            return " ✅"
        elif d < 0.50:
            return " 🔶"
        else:
            return " ✗"

    print("-" * 95)
    print(f"{'Metrica':<25} {'V1 spoken':>15} {'V2 +written':>15} {'REAL':>15}  {'V1→REAL':>9} {'V2→REAL':>9}")
    print("-" * 95)
    for key, display in METRICS:
        rv = rm[key] if rm else None
        v1s = _colorize(v1m[key], rv)
        v2s = _colorize(v2m[key], rv)
        rs = f"{rv:.2f}" if isinstance(rv, float) else (str(rv) if rv else "N/A")
        print(f"{display:<25} {v1s:>15} {v2s:>15} {rs:>15}  "
              f"{diff_tag(v1m[key], rv):>9} {diff_tag(v2m[key], rv):>9}")
    print("-" * 95)

    # --- Verdict ---
    print()
    print("=" * 70)
    print("VERDETTO")
    print("=" * 70)

    if rm:
        v1_diff = v2_diff = 0.0
        count = 0
        for key in ["avg_sentence_length", "formal_density", "math_density",
                     "section_count", "bullet_density"]:
            rv = rm[key]
            if rv > 0:
                v1_diff += abs(v1m[key] - rv) / max(rv, 0.01)
                v2_diff += abs(v2m[key] - rv) / max(rv, 0.01)
                count += 1
        v1_diff /= max(count, 1)
        v2_diff /= max(count, 1)

        print(f"  V1 (spoken-only) diff medio dal reale:  {v1_diff:.2%}")
        print(f"  V2 (spoken+written) diff medio dal reale: {v2_diff:.2%}")
        print()
        if v2_diff < v1_diff * 0.95:
            print("  => V2 (spoken+written) piu vicino allo stile SCRITTO reale ✅")
        elif v1_diff < v2_diff * 0.95:
            print("  => V1 (spoken-only) piu vicino allo stile SCRITTO reale\n"
                  "     (il parlato di Andrea e gia simile al suo scritto)")
        else:
            print("  => Parita — nessuna differenza misurabile significativa")
        print()

    print(f"  V1 claims: existing (M1-6, 23/23 verified)")
    print(f"  V2 claims: {v2_stats['verified']}/{v2_stats['total_claims']} verified, "
          f"{v2_stats['dropped']} dropped")
    print(f"  V2 cost: ${v2_stats['cost']:.6f}")
    print(f"  V2 prompt: {v2_stats['prompt_tokens']} tok → "
          f"{v2_stats['response_tokens']} tok response")
    print()

    OUT_DIR = os.path.expanduser("~/maestro-data/teoria-segnali-2021/derived/dispense")
    print(f"  V1 file: {OUT_DIR}/andrea.md")
    print(f"  V2 file: {OUT_DIR}/andrea.v2.md")


if __name__ == "__main__":
    main()
