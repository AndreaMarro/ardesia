"""
Auto-discover section configs from YAML files.
Adding a new section = dropping a YAML in configs/sections/.
"""
import os
import yaml


def discover_sections(sections_dir: str) -> dict[str, dict]:
    """Scan a directory for section YAML files.

    Returns:
        Dict of {section_id: config_dict}, sorted by filename.
    """
    sections = {}
    if not os.path.isdir(sections_dir):
        return sections

    for filename in sorted(os.listdir(sections_dir)):
        if not filename.endswith((".yml", ".yaml")):
            continue
        filepath = os.path.join(sections_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        if config and "id" in config:
            sections[config["id"]] = config
    return sections
