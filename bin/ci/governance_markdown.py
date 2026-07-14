#!/usr/bin/env python3
"""Conservative Markdown subset used by the governance-canon gate."""
from __future__ import annotations

import html
import re
import unicodedata
from pathlib import Path


CANONICAL_LINK_PATTERN = re.compile(
    r"(?<!!)(?<!\\)\[(?P<label>(?=[^\]\r\n]*[^\s\]])[^\]\r\n]+)\]"
    r"\((?P<target>[^\s()<>\r\n]+)\)"
)
AUTOLINK_PATTERN = re.compile(
    r"<(?:[A-Za-z][A-Za-z0-9+.-]*:[^<>\r\n]+|[^ <>\r\n]+@[^ <>\r\n]+)>"
)
SAFE_URI_SCHEMES = frozenset({"http", "https", "mailto"})
BARE_HIERARCHICAL_URI = re.compile(
    r"(?i)(?<![A-Za-z0-9+./-])(?P<scheme>[A-Za-z][A-Za-z0-9+.-]*):/{2}"
)
FORBIDDEN_OPAQUE_URI = re.compile(
    r"(?i)(?<![A-Za-z0-9+./-])"
    r"(?:blob|data|filesystem|javascript|obsidian|vscode):(?=\S)"
)
FORBIDDEN_FILE_URI = re.compile(r"(?i)(?<![A-Za-z0-9+./-])file:(?=(?:\S*[/\\]|\.\.?))")
GFM_WRAPPED_LINK = re.compile(
    r"(?i)(?:https?://|ftp://|www\.)[^\s<>\r\n]*"
    r"\[[^\]\r\n]+\]\([^\s()<>\r\n]+\)"
)
FENCE_START = re.compile(r"^(`{3,}|~{3,})([^\r\n]*)$")
CONTAINER_PREFIX = re.compile(
    r"^ {0,3}(?:> ?|(?:[-+*]|\d{1,9}[.)]) {1,4}(?=\S))"
)
FRONT_MATTER = re.compile(
    r"\A---[ \t]*\r?\n.*?^---[ \t]*(?:\r?\n|\Z)", re.MULTILINE | re.DOTALL
)
FRONT_MATTER_OPEN = re.compile(r"\A---[ \t]*(?:\r?\n|\Z)")
HTML_COMMENT = re.compile(r"<!--(?!>|->)(?:(?!--).)*?-->", re.DOTALL)
KNOWN_CONTEXT_BLOCK = re.compile(
    r"(?ms)^(?P<open><claude-mem-context>[ \t]*\n)"
    r"(?P<body>.*?)"
    r"(?P<close>^</claude-mem-context>[ \t]*(?:\n|\Z))"
)
RAW_HTML_MARKER = re.compile(
    r"<(?:/?[A-Za-z][A-Za-z0-9-]*(?:[ \t\r\n>/]|\Z)|!|\?)"
)
OBSIDIAN_COMMENT = re.compile(r"%%.*?%%", re.DOTALL)
AMBIGUOUS_LIST_PREFIX = re.compile(
    r"(?m)^ {0,3}(?:> ?)*(?:[-+*]|\d{1,9}[.)])(?: {5,}| *\t)"
)
INDENTED_LINK = re.compile(
    r"(?m)^(?: {0,3}> ?)*(?: {4,}| {0,3}\t)[^\r\n]*\]\("
)
INDENTED_FENCE = re.compile(
    r"(?m)^(?: {0,3}> ?)*(?: +|\t+)(?:`{3,}|~{3,})"
)
HTML_ENTITY = re.compile(r"&(?:#[0-9]+|#[xX][0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]+);")
INLINE_CODE = re.compile(r"(?<!`)(`+)(?!`)([^\r\n]*?)(?<!`)\1(?!`)")
INLINE_STRUCTURAL_TOKENS = (
    "<!--", "-->", "%%", "<claude-mem-context>", "</claude-mem-context>"
)
COMMONMARK_ESCAPE = re.compile(
    r"\\([!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])"
)
APOSTROPHE_TRANSLATION = str.maketrans(
    {character: "'" for character in "\u02bc\u2018\u2019\u201b\u2032\uff07"}
)
DEFAULT_IGNORABLE_RANGES = (
    (0x115F, 0x1160),
    (0x17B4, 0x17B5),
    (0x180B, 0x180F),
    (0x2065, 0x2065),
    (0x3164, 0x3164),
    (0xFE00, 0xFE0F),
    (0xFFA0, 0xFFA0),
    (0xFFF0, 0xFFF8),
    (0x1BCA0, 0x1BCA3),
    (0x1D173, 0x1D17A),
    (0xE0000, 0xE0FFF),
)


def is_default_ignorable(character: str) -> bool:
    codepoint = ord(character)
    return (
        unicodedata.category(character) == "Cf"
        or codepoint == 0x034F
        or any(start <= codepoint <= end for start, end in DEFAULT_IGNORABLE_RANGES)
    )


def parse_front_matter(
    relative_path: Path,
    content: str,
    errors: list[str],
) -> dict[str, str]:
    lines = content.splitlines()
    if not lines or lines[0] != "---":
        errors.append(f"{relative_path}: missing front matter")
        return {}
    try:
        closing_index = lines.index("---", 1)
    except ValueError:
        errors.append(f"{relative_path}: unterminated front matter")
        return {}

    metadata: dict[str, str] = {}
    for line_number, line in enumerate(lines[1:closing_index], start=2):
        if not line.strip():
            continue
        if ":" not in line:
            errors.append(f"{relative_path}:{line_number}: malformed front matter entry")
            continue
        key, value = (part.strip() for part in line.split(":", 1))
        if not key or not value:
            errors.append(f"{relative_path}:{line_number}: empty front matter key or value")
            continue
        if key in metadata:
            errors.append(f"{relative_path}:{line_number}: duplicate front matter key `{key}`")
            continue
        metadata[key] = value
    return metadata


def validate_front_matter(
    relative_path: Path,
    metadata: dict[str, str],
    expected: dict[str, str],
    errors: list[str],
    allowed_additional: tuple[str, ...] = (),
) -> None:
    for key, expected_value in expected.items():
        if metadata.get(key) != expected_value:
            errors.append(f"{relative_path}: front matter `{key}` must be `{expected_value}`")
    allowed_keys = set(expected).union(allowed_additional)
    for key in sorted(set(metadata).difference(allowed_keys)):
        errors.append(f"{relative_path}: unexpected front matter key `{key}`")


def has_container_fence(content: str) -> bool:
    """Reject fences whose lifetime depends on a blockquote/list container."""
    for line in content.splitlines():
        structural_line = line
        container_removed = False
        while True:
            unwrapped = CONTAINER_PREFIX.sub("", structural_line, count=1)
            if unwrapped == structural_line:
                break
            container_removed = True
            structural_line = unwrapped
        if container_removed and FENCE_START.fullmatch(structural_line):
            return True
    return False


def normalized_operational_text(value: str) -> str:
    """Approximate rendered policy text without granting Markdown authority."""
    value = html.unescape(value)
    value = re.sub(r"\[([^\]\r\n]*)\]\([^\)\r\n]*\)", r"\1", value)
    value = re.sub(r"\[([^\]\r\n]*)\]\[[^\]\r\n]*\]", r"\1", value)
    value = COMMONMARK_ESCAPE.sub(r"\1", value)
    value = re.sub(r"<[^>\r\n]*>", "", value)
    normalized = unicodedata.normalize("NFKC", value)
    normalized = "".join(
        "-" if unicodedata.category(c) == "Pd" or c == "\u2212" else c
        for c in normalized
        if not is_default_ignorable(c)
    ).translate(APOSTROPHE_TRANSLATION)
    normalized = normalized.translate(str.maketrans("", "", "*_~"))
    return " ".join(normalized.casefold().split())


def code_span_placeholder(match: re.Match[str]) -> str:
    normalized = normalized_operational_text(match.group(2))
    return "x" if any(character.isalnum() for character in normalized) else "."


def has_forbidden_bare_uri(content: str) -> bool:
    return bool(
        FORBIDDEN_OPAQUE_URI.search(content)
        or FORBIDDEN_FILE_URI.search(content)
        or any(
            match.group("scheme").casefold() not in {"http", "https"}
            for match in BARE_HIERARCHICAL_URI.finditer(content)
        )
    )


def strip_non_operational_markdown(
    content: str,
    *,
    preserve_inline_text: bool = False,
    preserve_context: bool = False,
) -> str:
    """Mask code/comments while preserving physical line positions."""
    front_matter = FRONT_MATTER.match(content)
    if front_matter:
        content = "\n" * front_matter.group(0).count("\n") + content[front_matter.end() :]
    visible_lines: list[str] = []
    fence_character = ""
    fence_length = 0
    for line in content.splitlines(keepends=True):
        structural_line = line.rstrip("\r\n")
        if not fence_character:
            opening = FENCE_START.fullmatch(structural_line)
            if opening and not (opening.group(1)[0] == "`" and "`" in opening.group(2)):
                fence_character = opening.group(1)[0]
                fence_length = len(opening.group(1))
                visible_lines.append("\n" * line.count("\n"))
                continue
            visible_lines.append(line)
            continue
        closing = re.match(
            rf"^ {{0,3}}{re.escape(fence_character)}{{{fence_length},}}[ \t]*$",
            structural_line,
        )
        if closing:
            fence_character = ""
            fence_length = 0
        visible_lines.append("\n" * line.count("\n"))

    def mask(match: re.Match[str]) -> str:
        return "\n" * match.group(0).count("\n")

    visible = HTML_COMMENT.sub(mask, "".join(visible_lines))
    if preserve_context:
        visible = KNOWN_CONTEXT_BLOCK.sub(
            lambda match: "\n" * match.group("open").count("\n")
            + match.group("body")
            + "\n" * match.group("close").count("\n"),
            visible,
        )
    else:
        visible = KNOWN_CONTEXT_BLOCK.sub(mask, visible)
    visible = OBSIDIAN_COMMENT.sub(mask, visible)
    if preserve_inline_text:
        return INLINE_CODE.sub(lambda match: match.group(2), visible)
    return INLINE_CODE.sub(code_span_placeholder, visible)


def has_noncanonical_link_syntax(content: str) -> bool:
    """Reject renderable link forms whose destination cannot be validated safely."""
    visible = strip_non_operational_markdown(content, preserve_context=True)
    canonical_spans = tuple(
        match.span() for match in CANONICAL_LINK_PATTERN.finditer(visible)
    )
    return bool(
        any(
            not any(start <= match.start() < end for start, end in canonical_spans)
            for match in re.finditer(r"\]\(", visible)
        )
        or "[[" in visible
        or "]]" in visible
        or "]:" in visible
        or AUTOLINK_PATTERN.search(visible)
        or RAW_HTML_MARKER.search(visible)
        or GFM_WRAPPED_LINK.search(visible)
    )


def has_noncanonical_governance_syntax(content: str) -> bool:
    """Reject ambiguous links, raw HTML and escapes outside the strict subset."""
    ambiguous_inline = any(
        any(token in match.group(2) for token in INLINE_STRUCTURAL_TOKENS)
        for match in INLINE_CODE.finditer(content)
    )
    visible = strip_non_operational_markdown(content, preserve_context=True)
    return bool(
        (
            FRONT_MATTER_OPEN.match(content) is not None
            and FRONT_MATTER.match(content) is None
        )
        or ambiguous_inline
        or has_container_fence(content)
        or INDENTED_FENCE.search(content)
        or "\\" in visible
        or "`" in visible
        or "$" in visible
        or "<" in visible
        or "<!--" in visible
        or "-->" in visible
        or "%%" in visible
        or HTML_ENTITY.search(visible)
        or AMBIGUOUS_LIST_PREFIX.search(visible)
        or INDENTED_LINK.search(visible)
        or has_noncanonical_link_syntax(content)
        or has_forbidden_bare_uri(visible)
    )
