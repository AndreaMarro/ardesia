#!/usr/bin/env python3
"""Fail when active governance drifts from the ratified ADR-0004."""
from __future__ import annotations

import hashlib
import html
import os
import posixpath
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from governance_markdown import (
    CANONICAL_LINK_PATTERN,
    SAFE_URI_SCHEMES,
    has_noncanonical_link_syntax,
    has_noncanonical_governance_syntax,
    has_forbidden_bare_uri,
    normalized_operational_text,
    parse_front_matter,
    strip_non_operational_markdown,
    validate_front_matter,
)
ADR_NAME = "ADR-0004-ai-native-evidence-authority.md"
ADR_PATH = Path("docs/adr") / ADR_NAME
CANON_PATH = Path("docs/CANON-INDEX.md")
ROOT_MAP_PATH = Path("ARDESIA-MAP.md")
VAULT_MAP_PATH = Path("docs/vault/ARDESIA-MAP.md")

NORTH_STAR = (
    "Ardesia è AI-native nell'esperienza, evidence-authoritative nella verità "
    "e deterministica nell'autorità."
)
RATIFIED_ADR_LF_SHA256 = "4c8309db6f200521dc8a82cf4edd73b00ab101da20b6d99958dc52911e44a0cb"
CANON_RECEIPT_BLOCK = (
    "## Gate automatico e ricevuta di ratifica",
    "",
    "governance_receipt_version: 1",
    "north_star_adr_policy: immutable",
    "governance_gate_ci: enabled",
    f"north_star: {NORTH_STAR}",
)
CANON_RECEIPT_KEYS = tuple(line.split(":", 1)[0] for line in CANON_RECEIPT_BLOCK[2:])
ADR_PREAMBLE = (
    "# ADR-0004 — Ardesia AI-native con verità fondata sulle evidenze e autorità deterministica",
    "",
    "- **Stato**: ACCEPTED",
    "- **Data**: 2026-07-14",
    "- **Ratifica**: Andrea Marro",
    "- **Sostituisce**: ogni uso normativo di `ZERO-LLM in prodotto`",
    "",
    "## Contesto",
)

BASE_AGENT_PATHS = (
    Path("AGENTS.md"),
    Path("apps/studio/AGENTS.md"),
    Path("packages/engine/AGENTS.md"),
    Path("plugins/elab-tutor/AGENTS.md"),
    Path("plugins/elab-tutor/.codex/AGENTS.md"),
)
REQUIRED_INSTRUCTION_PATHS = (
    Path("apps/studio/CLAUDE.md"), Path("packages/engine/CLAUDE.md"),
    Path("plugins/elab-tutor/CLAUDE.md"), Path("plugins/elab-tutor/AUTOPILOT.md"),
    Path("plugins/elab-tutor/docs/GOVERNANCE.md"),
    Path("plugins/elab-tutor/docs/dev/CODEX-WORKFLOW.md"),
)
INSTRUCTION_BASENAMES = frozenset(
    {"AGENTS.md", "CLAUDE.md", "AUTOPILOT.md", "GOVERNANCE.md", "CODEX-WORKFLOW.md"}
)
STATIC_REQUIRED_LINKS = {
    ROOT_MAP_PATH: (ADR_PATH, CANON_PATH),
    CANON_PATH: (ADR_PATH,),
    VAULT_MAP_PATH: (ADR_PATH, CANON_PATH),
}
IGNORED_AGENT_DIRECTORIES = frozenset({".git", ".venv", "build", "coverage", "dist", "node_modules"})

FORBIDDEN_OPERATIONAL_TEXT = (
    ("obsolete authority declaration", "Documento UNICO per orientarsi"),
    ("obsolete infrastructure map", "## 1. Le due macchine"),
    ("obsolete branch policy", "Branch — REGOLA D'ORO"),
    ("external vault pointer", "ardesia-vault/ARDESIA-MAP.md"),
    ("obsolete model policy", "ZERO-LLM in prodotto"),
    ("obsolete broad ADR policy", "accepted_adr_policy"),
    ("obsolete monorepo prohibition", "NON studiare i subtree"),
    ("model authority contradiction", "model governs identity"),
    ("model authority contradiction", "model governs scope"),
    ("model authority contradiction", "model governs consent"),
    ("model authority contradiction", "model governs persistence"),
    ("unauthorized model publication", "publish without teacher review"),
    ("model authority contradiction", "il modello governa identità"),
    ("model authority contradiction", "il modello governa scope"),
    ("model authority contradiction", "il modello governa consenso"),
    ("model authority contradiction", "il modello governa persistenza"),
    ("unauthorized model publication", "pubblica senza revisione docente"),
)

ROOT_MAP_FRONT_MATTER = {
    "document_status": "current-navigation",
    "authority": "navigation-only",
    "decision": f"docs/adr/{ADR_NAME}",
}
VAULT_MAP_FRONT_MATTER = {
    "document_status": "archived",
    "authority": "none",
    "superseded_by": "../CANON-INDEX.md",
    "decision": f"../adr/{ADR_NAME}",
    "archived_at": "2026-07-14",
}
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FORBIDDEN_LOCAL_TARGET_MARKERS = ("ardesia-vault/ardesia-map.md",)


def valid_iso_date(value: str) -> bool:
    try:
        return bool(ISO_DATE.fullmatch(value) and date.fromisoformat(value))
    except ValueError:
        return False


def has_forbidden_local_target(target: str) -> bool:
    normalized = posixpath.normpath(unicodedata.normalize("NFKC", target)).casefold()
    return any(marker in normalized for marker in FORBIDDEN_LOCAL_TARGET_MARKERS)


def has_readable_link_label(label: str) -> bool:
    return any(character.isalnum() for character in normalized_operational_text(label))


def reject_link(errors: list[str], relative_path: Path, reason: str) -> None:
    errors.append(f"{relative_path}: {reason}")


def discover_instruction_paths(root: Path) -> tuple[Path, ...]:
    """Find every active instruction basename without descending into generated trees."""
    discovered = set(BASE_AGENT_PATHS).union(REQUIRED_INSTRUCTION_PATHS)
    for directory, child_directories, filenames in os.walk(root):
        child_directories[:] = sorted(
            name for name in child_directories if name not in IGNORED_AGENT_DIRECTORIES
        )
        directory_path = Path(directory)
        for filename in sorted(INSTRUCTION_BASENAMES.intersection(filenames)):
            discovered.add((directory_path / filename).relative_to(root))
    return tuple(sorted(discovered, key=lambda path: path.as_posix()))


def governance_entrypoints(root: Path) -> dict[Path, tuple[Path, ...]]:
    links = dict(STATIC_REQUIRED_LINKS)
    for instruction_path in discover_instruction_paths(root):
        links[instruction_path] = (
            (ADR_PATH, CANON_PATH) if instruction_path.name == "AGENTS.md" else ()
        )
    return links


def required_links(root: Path) -> dict[Path, tuple[Path, ...]]:
    return {path: targets for path, targets in governance_entrypoints(root).items() if targets}


def read_required(root: Path, relative_path: Path, errors: list[str]) -> str:
    path = root / relative_path
    try:
        if path.is_symlink() or any(root.resolve().joinpath(*relative_path.parts[:index]).is_symlink()
                                    for index in range(1, len(relative_path.parts) + 1)):
            errors.append(f"{relative_path}: symbolic governance files are forbidden")
            return ""
        resolved = path.resolve(strict=True)
        resolved.relative_to(root.resolve())
        if not resolved.is_file():
            errors.append(f"{relative_path}: governance path must be a regular file")
            return ""
        return resolved.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        errors.append(f"{relative_path}: governance file must be valid UTF-8")
    except ValueError:
        errors.append(f"{relative_path}: governance file resolves outside repository")
    except (OSError, RuntimeError):
        errors.append(f"{relative_path}: missing or unreadable governance file")
    return ""


def validated_local_target(
    repository_root: Path,
    relative_path: Path,
    raw_target: str,
    errors: list[str],
) -> str | None:
    if not raw_target:
        return None
    if raw_target.startswith("#"):
        return reject_link(errors, relative_path, "governance link fragments are forbidden")
    if "\\" in raw_target:
        return reject_link(errors, relative_path, "non-canonical governance link is forbidden")
    if "%" in raw_target or html.unescape(raw_target) != raw_target:
        return reject_link(errors, relative_path, "encoded governance link is forbidden")
    try:
        parsed = urlsplit(raw_target)
        hostname = parsed.hostname
        _ = parsed.port
    except ValueError:
        return reject_link(errors, relative_path, "malformed governance URI is forbidden")
    if parsed.query or parsed.fragment:
        return reject_link(errors, relative_path, "non-canonical governance link is forbidden")
    scheme = parsed.scheme.casefold()
    if scheme:
        if scheme not in SAFE_URI_SCHEMES:
            return reject_link(errors, relative_path, f"URI scheme `{scheme}` is forbidden")
        elif scheme in {"http", "https"} and not hostname:
            return reject_link(errors, relative_path, "external governance link requires a host")
        elif scheme == "mailto" and (parsed.netloc or not parsed.path):
            return reject_link(errors, relative_path, "mailto governance link requires a recipient")
        return None
    if parsed.netloc:
        return reject_link(errors, relative_path, "protocol-relative governance link is forbidden")
    if not parsed.path:
        return None
    if has_forbidden_local_target(parsed.path):
        return reject_link(errors, relative_path, "forbidden legacy governance target")
    try:
        lexical_target = relative_path.parent / parsed.path
        if any((repository_root.joinpath(*lexical_target.parts[:index])).is_symlink() for index in range(1, len(lexical_target.parts) + 1)):
            return reject_link(errors, relative_path, "symbolic local link targets are forbidden")
        candidate = (repository_root / lexical_target).resolve()
        repository_target = candidate.relative_to(repository_root)
    except ValueError:
        return reject_link(errors, relative_path, "local Markdown link escapes repository")
    except (OSError, RuntimeError):
        return reject_link(errors, relative_path, "local governance link cannot be resolved")
    if has_forbidden_local_target(repository_target.as_posix()):
        return reject_link(errors, relative_path, "forbidden legacy governance target")
    if any(part in IGNORED_AGENT_DIRECTORIES for part in repository_target.parts):
        return reject_link(errors, relative_path, "local link uses an ignored repository path")
    if not candidate.is_file():
        return reject_link(errors, relative_path, "local governance link target is not a file")
    return raw_target


def resolved_local_links(
    root: Path,
    relative_path: Path,
    content: str,
    errors: list[str],
    *,
    enforce_canonical_syntax: bool = True,
) -> set[str]:
    repository_root = root.resolve()
    resolved: set[str] = set()
    if has_noncanonical_link_syntax(content):
        errors.append(f"{relative_path}: NON_CANONICAL_LINK syntax is forbidden")
        return resolved
    if enforce_canonical_syntax and has_noncanonical_governance_syntax(content):
        errors.append(f"{relative_path}: NON_CANONICAL_GOVERNANCE syntax is forbidden")
        return resolved
    safety_content = strip_non_operational_markdown(content, preserve_context=True)
    safe_local_targets: set[str] = set()
    for match in CANONICAL_LINK_PATTERN.finditer(safety_content):
        if not has_readable_link_label(match.group("label")):
            errors.append(f"{relative_path}: governance link label has no visible text")
            continue
        target = validated_local_target(
            repository_root, relative_path, match.group("target"), errors
        )
        if target:
            safe_local_targets.add(target)
    visible_content = strip_non_operational_markdown(content)
    for match in CANONICAL_LINK_PATTERN.finditer(visible_content):
        raw_target = match.group("target")
        if (
            has_readable_link_label(match.group("label"))
            and raw_target in safe_local_targets
            and visible_content.count("\n", 0, match.start()) < 24
        ):
            resolved.add(raw_target)
    return resolved


def validate_repository(root: Path) -> list[str]:
    """Return deterministic diagnostics without printing document contents."""
    errors: list[str] = []
    links_by_entrypoint = governance_entrypoints(root)
    required_files = (*links_by_entrypoint, ADR_PATH)
    contents = {
        relative_path: read_required(root, relative_path, errors)
        for relative_path in required_files
    }
    for relative_path, content in contents.items():
        forbidden_control = any(
            unicodedata.category(c) in {"Cf", "Zl", "Zp"}
            or (unicodedata.category(c) == "Cc" and c not in "\n\r\t")
            for c in content
        )
        if forbidden_control:
            errors.append(f"{relative_path}: UNICODE_CONTROL is forbidden")

    for relative_path, required_targets in links_by_entrypoint.items():
        content = contents[relative_path]
        links = resolved_local_links(
            root,
            relative_path,
            content,
            errors,
            enforce_canonical_syntax=bool(required_targets),
        )
        if required_targets:
            for target in required_targets:
                parent = relative_path.parent.as_posix()
                expected = posixpath.relpath(target.as_posix(), parent)
                if expected not in links:
                    errors.append(f"{relative_path}: MISSING_CANONICAL_LINK to {target}")
        operational_text = normalized_operational_text(
            strip_non_operational_markdown(content, preserve_inline_text=True)
        )
        safety_text = html.unescape(
            strip_non_operational_markdown(content, preserve_context=True)
        )
        if has_forbidden_bare_uri(safety_text):
            errors.append(f"{relative_path}: dangerous bare URI scheme is forbidden")
        for label, marker in FORBIDDEN_OPERATIONAL_TEXT:
            if normalized_operational_text(marker) in operational_text:
                errors.append(f"{relative_path}: {label} is forbidden ({marker})")

    adr = contents[ADR_PATH]
    actual_preamble = tuple(adr.splitlines()[: len(ADR_PREAMBLE)])
    if actual_preamble != ADR_PREAMBLE:
        errors.append(f"{ADR_PATH}: ADR_PREAMBLE_INVALID operative preamble")
    adr_sha256 = hashlib.sha256(adr.encode("utf-8")).hexdigest()
    if adr_sha256 != RATIFIED_ADR_LF_SHA256:
        errors.append(f"{ADR_PATH}: ADR_DIGEST_MISMATCH LF-normalized decision")

    canon_operational = strip_non_operational_markdown(contents[CANON_PATH])
    canon_lines = canon_operational.splitlines()
    receipt_size = len(CANON_RECEIPT_BLOCK)
    receipt_count = sum(
        tuple(canon_lines[index : index + receipt_size]) == CANON_RECEIPT_BLOCK
        for index in range(len(canon_lines))
    )
    canon_policy = strip_non_operational_markdown(
        contents[CANON_PATH], preserve_inline_text=True
    )
    normalized_lines = [
        re.sub(r"\s+:", ":", normalized_operational_text(line))
        for line in canon_policy.splitlines()
    ]
    key_counts = {
        key: sum(
            f"{normalized_operational_text(key)}:" in line
            for line in normalized_lines
        )
        for key in CANON_RECEIPT_KEYS
    }
    if receipt_count != 1 or any(count != 1 for count in key_counts.values()):
        errors.append(f"{CANON_PATH}: CANON_RECEIPT_INVALID must be exact and unique")

    root_map_metadata = parse_front_matter(ROOT_MAP_PATH, contents[ROOT_MAP_PATH], errors)
    validate_front_matter(
        ROOT_MAP_PATH,
        root_map_metadata,
        ROOT_MAP_FRONT_MATTER,
        errors,
        allowed_additional=("updated_at",),
    )
    updated_at = root_map_metadata.get("updated_at", "")
    if not valid_iso_date(updated_at):
        errors.append(
            f"{ROOT_MAP_PATH}: front matter `updated_at` must be a valid ISO date "
            "(YYYY-MM-DD)"
        )

    vault_map_metadata = parse_front_matter(VAULT_MAP_PATH, contents[VAULT_MAP_PATH], errors)
    validate_front_matter(
        VAULT_MAP_PATH, vault_map_metadata, VAULT_MAP_FRONT_MATTER, errors
    )

    return sorted(set(errors))


def main() -> int:
    repository_root = Path(__file__).resolve().parents[2]
    errors = validate_repository(repository_root)
    if errors:
        print("governance_canon_gate: FAILED", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    instructions = discover_instruction_paths(repository_root)
    print(
        "governance_canon_gate: OK "
        f"({len(required_links(repository_root))} canonical entrypoints; "
        f"{len(instructions)} instruction documents scanned; {ADR_NAME})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
