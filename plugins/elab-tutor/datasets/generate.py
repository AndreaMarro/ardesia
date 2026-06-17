#!/usr/bin/env python3
"""
Galileo Brain Factory v5 — CLI Entry Point

Usage:
    python generate.py --profile v5-extreme-25k              # Full generation
    python generate.py --profile v5-extreme-25k --dry-run    # Stats only
    python generate.py --profile v5-extreme-25k --only teacher,teacher_clueless
    python generate.py --profile eval-200                    # Evaluation holdout
    python generate.py --profile v5-extreme-25k --seed 42
"""
import argparse
import json
import sys
import os
import yaml
from pathlib import Path

# Ensure brain_factory is importable
sys.path.insert(0, os.path.dirname(__file__))
from brain_factory.engine import BrainEngine


def load_profile(profile_name: str) -> dict:
    """Load a profile YAML from profiles/ directory."""
    profiles_dir = Path(__file__).parent / "profiles"
    for ext in [".yml", ".yaml"]:
        path = profiles_dir / f"{profile_name}{ext}"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
    raise FileNotFoundError(f"Profile '{profile_name}' not found in {profiles_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Galileo Brain Factory v5 — Dataset Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate.py --profile v5-extreme-25k --dry-run
  python generate.py --profile v5-extreme-25k
  python generate.py --profile v5-extreme-25k --only teacher,teacher_clueless
  python generate.py --profile eval-200 --seed 9999
        """,
    )
    parser.add_argument("--profile", required=True,
                        help="Profile name (e.g., v5-extreme-25k)")
    parser.add_argument("--only",
                        help="Comma-separated section IDs to generate")
    parser.add_argument("--eval", type=int,
                        help="Override target count for evaluation holdout")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show predicted stats without generating")
    parser.add_argument("--seed", type=int,
                        help="Random seed override")
    args = parser.parse_args()

    # Load profile
    try:
        profile = load_profile(args.profile)
    except FileNotFoundError as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    # Apply overrides
    if args.seed is not None:
        profile["seed"] = args.seed
    if args.eval:
        profile["target"] = args.eval
        base = profile["output"].replace(".jsonl", "")
        profile["output"] = f"{base}-eval-{args.eval}.jsonl"

    # Parse --only
    only = args.only.split(",") if args.only else None

    # Setup engine
    configs_dir = str(Path(__file__).parent / "configs")
    output_dir = str(Path(__file__).parent / "output")

    engine = BrainEngine(configs_dir=configs_dir, output_dir=output_dir)

    # Header
    print(f"\n{'='*60}")
    print(f"  Galileo Brain Factory v5")
    print(f"  Profile: {args.profile}")
    print(f"  Target:  {profile['target']} examples")
    print(f"  Seed:    {profile.get('seed', 42)}")
    if only:
        print(f"  Only:    {', '.join(only)}")
    if args.dry_run:
        print(f"  Mode:    DRY RUN")
    print(f"{'='*60}\n")

    # Generate
    result = engine.generate(profile, only=only, dry_run=args.dry_run)

    if args.dry_run:
        print("  DRY RUN — Predicted distribution:\n")
        total_predicted = 0
        for sid, count in sorted(result.get("section_targets", {}).items(),
                                  key=lambda x: -x[1]):
            pct = count / max(profile["target"], 1) * 100
            bar = "\u2588" * int(pct / 2)
            print(f"    {sid:25s} {count:6d}  ({pct:5.1f}%)  {bar}")
            total_predicted += count
        print(f"\n    {'TOTAL':25s} {total_predicted:6d}")
        found = result.get("sections_found", [])
        missing = [s for s in result.get("section_targets", {}) if s not in found and s != "combos"]
        if missing:
            print(f"\n  \u26a0 Sections in profile but no YAML found: {', '.join(missing)}")
    else:
        print(f"  \u2705 Generated: {result['total']} unique examples")
        print(f"     Removed:   {result['duplicates_removed']} duplicates")
        print(f"\n  Sections:")
        for sid, count in sorted(result.get("sections", {}).items(),
                                  key=lambda x: -x[1]):
            print(f"    {sid:25s} \u2192 {count:6d}")
        print(f"\n  Intents:")
        for intent, count in sorted(result.get("intents", {}).items(),
                                     key=lambda x: -x[1]):
            pct = count / max(result["total"], 1) * 100
            print(f"    {intent:15s} \u2192 {count:6d} ({pct:.1f}%)")
        print(f"\n  needs_llm: {result['needs_llm_pct']}%")
        print(f"\n  Output:   output/{profile['output']}")
        manifest_name = profile['output'].replace('.jsonl', '.manifest.json')
        print(f"  Manifest: output/{manifest_name}")

    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
