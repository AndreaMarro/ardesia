#!/usr/bin/env python3
"""
ELAB i18n locale parity gate.
Verifies src/locales/it.json and en.json have:
  1. Identical key paths (set equality)
  2. Identical interpolation placeholders ({{var}}) per key
  3. Valid JSON

Exit code 0 = parity OK, 1 = broken.

Usage:
  python3 scripts/check-locale-parity.py
  # or via pre-commit hook
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
IT_PATH = REPO / "src" / "locales" / "it.json"
EN_PATH = REPO / "src" / "locales" / "en.json"

INTERP_RE = re.compile(r"\{\{(\w+)\}\}")


def flatten(obj, prefix: str = "") -> dict[str, object]:
    """Walk nested dict, return {dot.path: leaf_value} (lists treated as leaves)."""
    out: dict[str, object] = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                out.update(flatten(v, full))
            else:
                out[full] = v
    return out


def placeholders(value: object) -> tuple[str, ...]:
    if isinstance(value, str):
        return tuple(sorted(set(INTERP_RE.findall(value))))
    return ()


def main() -> int:
    try:
        it = json.loads(IT_PATH.read_text(encoding="utf-8"))
        en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        print(f"FAIL: missing locale file: {exc}", file=sys.stderr)
        return 1
    except json.JSONDecodeError as exc:
        print(f"FAIL: invalid JSON: {exc}", file=sys.stderr)
        return 1

    it_flat = flatten(it)
    en_flat = flatten(en)
    it_keys = set(it_flat)
    en_keys = set(en_flat)

    errors: list[str] = []

    if it_keys != en_keys:
        only_it = sorted(it_keys - en_keys)
        only_en = sorted(en_keys - it_keys)
        if only_it:
            errors.append(f"IT-only keys ({len(only_it)}): {only_it[:10]}")
        if only_en:
            errors.append(f"EN-only keys ({len(only_en)}): {only_en[:10]}")

    # Placeholder parity per shared key
    for k in it_keys & en_keys:
        ip = placeholders(it_flat[k])
        ep = placeholders(en_flat[k])
        if ip != ep:
            errors.append(
                f"Placeholder mismatch at '{k}': IT={ip} EN={ep}"
            )

    if errors:
        print("FAIL: locale parity broken", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print(f"OK: locale parity verified ({len(it_keys)} keys, "
          f"{sum(1 for k in it_keys & en_keys if placeholders(it_flat[k]))} with interpolation)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
