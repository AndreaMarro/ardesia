"""
Core engine: orchestrates section generation, dedup, stats, JSONL output, manifest.

The engine reads a profile (target count, section weights), discovers section configs,
generates examples via TemplateSection/ComboSection, deduplicates, shuffles,
and writes JSONL + manifest.json.
"""
import json
import hashlib
import random
import os
import subprocess
import yaml
from datetime import datetime, timezone
from pathlib import Path

from .corruption import CorruptionPipeline
from .registry import discover_sections
from .sections.template_section import TemplateSection
from .sections.combo_section import ComboSection


class BrainEngine:
    """Orchestrate dataset generation from profiles and section configs."""

    def __init__(self, configs_dir: str, output_dir: str):
        self.configs_dir = configs_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _load_system_prompt(self, filename: str) -> str:
        path = os.path.join(self.configs_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def _load_yaml_config(self, filename: str) -> dict:
        path = os.path.join(self.configs_dir, filename)
        if not os.path.exists(path):
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def _get_git_hash(self) -> str:
        try:
            return subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"],
                stderr=subprocess.DEVNULL,
            ).decode().strip()
        except Exception:
            return "unknown"

    def _create_section(self, sid: str, config: dict, cp: CorruptionPipeline,
                        system_prompt: str, profile_section: dict) -> TemplateSection | ComboSection | None:
        """Create the appropriate section generator."""
        # Merge profile-level corruption overrides
        profile_corruptions = profile_section.get("corruptions")
        if profile_corruptions is not None:
            config = {**config, "corruptions": profile_corruptions}

        # Load responses config — prefer v8 if available
        responses_v8 = self._load_yaml_config("responses_v8.yml")
        responses_config = responses_v8 if responses_v8 else self._load_yaml_config("responses.yml")

        # ComboSection is special — needs component data
        if sid == "combos":
            components_config = self._load_yaml_config("components.yml")
            components = components_config.get("components", {})
            verbs = []
            for v_list in components_config.get("action_verbs", {}).values():
                verbs.extend(v_list)
            conjunctions = components_config.get("conjunctions", [])
            return ComboSection(
                components=components,
                action_verbs=verbs or ["metti", "aggiungi", "piazza"],
                conjunctions=conjunctions or ["e", "con"],
                corruption_pipeline=cp,
                system_prompt=system_prompt,
                corruptions=config.get("corruptions", {}),
            )

        # Default: TemplateSection
        return TemplateSection(
            config=config,
            corruption_pipeline=cp,
            system_prompt=system_prompt,
            responses_config=responses_config,
        )

    def generate(self, profile: dict, only: list[str] = None,
                 dry_run: bool = False) -> dict:
        """Generate dataset from profile config.

        Args:
            profile: Profile dict with target, seed, sections, etc.
            only: If set, only generate these section IDs.
            dry_run: If True, return stats without writing files.

        Returns:
            Manifest dict with generation stats.
        """
        seed = profile.get("seed", 42)
        target = profile["target"]
        system_prompt = self._load_system_prompt(profile["system_prompt"])
        output_file = profile["output"]

        cp = CorruptionPipeline(seed=seed)
        rng = random.Random(seed)

        # Discover sections from configs/sections/
        sections_dir = os.path.join(self.configs_dir, "sections")
        all_section_configs = discover_sections(sections_dir)

        # Filter to profile sections
        profile_sections = profile.get("sections", {})
        active_ids = only if only else list(profile_sections.keys())

        # Calculate per-section targets from weights
        total_weight = sum(
            profile_sections.get(sid, {}).get("weight", 0)
            for sid in active_ids
            if sid in all_section_configs or sid == "combos"
        )

        section_targets = {}
        for sid in active_ids:
            if sid not in all_section_configs and sid != "combos":
                continue
            weight = profile_sections.get(sid, {}).get("weight", 0)
            section_targets[sid] = round(target * weight / max(total_weight, 1))

        if dry_run:
            return {
                "profile": output_file,
                "target": target,
                "section_targets": section_targets,
                "total_weight": total_weight,
                "sections_found": list(all_section_configs.keys()),
                "dry_run": True,
            }

        # Generate from each section
        all_examples = []
        section_counts = {}

        for sid, sec_target in section_targets.items():
            if sec_target == 0:
                continue

            config = all_section_configs.get(sid, {"id": sid, "name": sid})
            profile_section = profile_sections.get(sid, {})

            section = self._create_section(sid, config, cp, system_prompt, profile_section)
            if section is None:
                continue

            examples = section.generate(target_count=sec_target)
            section_counts[sid] = len(examples)
            all_examples.extend(examples)

        # Deduplicate by user message content (MD5 hash)
        seen = set()
        unique = []
        for ex in all_examples:
            user_content = ex["messages"][1]["content"]
            h = hashlib.md5(user_content.encode()).hexdigest()
            if h not in seen:
                seen.add(h)
                unique.append(ex)

        duplicates_removed = len(all_examples) - len(unique)

        # Shuffle
        rng.shuffle(unique)

        # Remove internal tracking keys
        for ex in unique:
            ex.pop("_clean_input", None)

        # Write JSONL
        output_path = Path(self.output_dir) / output_file
        with open(output_path, "w", encoding="utf-8") as f:
            for ex in unique:
                f.write(json.dumps(ex, ensure_ascii=False) + "\n")

        # Compute stats
        intents = {}
        needs_llm_count = 0
        for ex in unique:
            try:
                out = json.loads(ex["messages"][2]["content"])
                intent = out.get("intent", "unknown")
                intents[intent] = intents.get(intent, 0) + 1
                if out.get("needs_llm"):
                    needs_llm_count += 1
            except json.JSONDecodeError:
                pass

        manifest = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "profile": output_file,
            "git_hash": self._get_git_hash(),
            "seed": seed,
            "target": target,
            "total": len(unique),
            "duplicates_removed": duplicates_removed,
            "sections": section_counts,
            "intents": intents,
            "needs_llm_pct": round(needs_llm_count / max(len(unique), 1) * 100, 1),
        }

        # Write manifest
        manifest_path = Path(self.output_dir) / output_file.replace(".jsonl", ".manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

        return manifest
