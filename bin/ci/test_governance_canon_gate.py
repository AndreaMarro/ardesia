#!/usr/bin/env python3
"""Focused tests for the Ardesia governance-canon gate."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("governance_canon_gate.py")
SPEC = importlib.util.spec_from_file_location("governance_canon_gate", SCRIPT)
assert SPEC and SPEC.loader
governance_gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(governance_gate)

ADR_NAME = "ADR-0004-ai-native-evidence-authority.md"
ACCEPTED_ADR = (SCRIPT.parents[2] / "docs" / "adr" / ADR_NAME).read_text(encoding="utf-8")
NORTH_STAR = (
    "Ardesia è AI-native nell'esperienza, evidence-authoritative nella verità "
    "e deterministica nell'autorità."
)
REFERENCE_BYPASSES = (
    "[foo bar]\n\n[foo\nbar]: ../outside.md", "> [x]: ../outside.md\n\n[x]", "- [x]: ../outside.md\n\n[x]", "1. [x]: ../outside.md\n\n[x]",
    "[foo\\]]: ../outside.md\n\n[foo\\]]", "[foo\\]]: ../outside.png\n\n![foo\\]]", "> [foo\nbar]: ../outside.md\n\n[foo\nbar]", "Open file:../../.ssh/id_rsa", "Open file:C:\\Users\\secret", "```md\ncode\n  ```\n[x][r]\n[r]: ../../outside.md",
)
def agent_links(prefix: str) -> str:
    return f"[ADR]({prefix}docs/adr/{ADR_NAME})\n[Canon]({prefix}docs/CANON-INDEX.md)\n"


def valid_documents() -> dict[str, str]:
    return {
        "AGENTS.md": (
            f"-    [`ADR`](docs/adr/{ADR_NAME})\n-    [Canon](docs/CANON-INDEX.md)\n`!`[Extra](docs/CANON-INDEX.md)\n"
        ),
        "ARDESIA-MAP.md": (
            "---\ndocument_status: current-navigation\n"
            "authority: navigation-only\nupdated_at: 2026-07-14\n"
            f"decision: docs/adr/{ADR_NAME}\n"
            "---\n" + agent_links("")
        ),
        "apps/studio/AGENTS.md": agent_links("../../"),
        "packages/engine/AGENTS.md": agent_links("../../"),
        "plugins/elab-tutor/AGENTS.md": agent_links("../../"),
        "plugins/elab-tutor/.codex/AGENTS.md": agent_links("../../../"),
        "docs/CANON-INDEX.md": (
            f"[ADR](adr/{ADR_NAME})\n"
            f"{NORTH_STAR}\n"
            "## Gate automatico e ricevuta di ratifica\n\n"
            "governance_receipt_version: 1\nnorth_star_adr_policy: immutable\n"
            "governance_gate_ci: enabled\n"
            f"north_star: {NORTH_STAR}\n"
        ),
        "docs/vault/ARDESIA-MAP.md": (
            "---\ndocument_status: archived\nauthority: none\n"
            "superseded_by: ../CANON-INDEX.md\n"
            f"decision: ../adr/{ADR_NAME}\n"
            "archived_at: 2026-07-14\n---\n"
            f"[ADR](../adr/{ADR_NAME})\n[Canon](../CANON-INDEX.md)\n"
        ),
        **{path.as_posix(): "AGENTS.md governs.\n" for path in governance_gate.REQUIRED_INSTRUCTION_PATHS},
        f"docs/adr/{ADR_NAME}": ACCEPTED_ADR,
    }


def materialize(root: Path, documents: dict[str, str]) -> None:
    for relative_path, content in documents.items():
        path = root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def validate_documents(documents: dict[str, str]) -> list[str]:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        materialize(root, documents)
        return governance_gate.validate_repository(root)


class GovernanceCanonGateTest(unittest.TestCase):
    def test_accepts_minimal_coherent_tree(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            materialize(root, valid_documents())
            self.assertEqual(governance_gate.validate_repository(root), [])
            adr = root / "docs" / "adr" / ADR_NAME
            adr.write_bytes(ACCEPTED_ADR.replace("\n", "\r\n").encode("utf-8"))
            self.assertEqual(governance_gate.validate_repository(root), [])

    def test_rejects_missing_file_and_invalid_utf8(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            documents = valid_documents()
            del documents["packages/engine/AGENTS.md"]
            materialize(root, documents)
            (root / "apps/studio/AGENTS.md").write_bytes(b"\xff\xfe")
            errors = governance_gate.validate_repository(root)
        self.assertTrue(any("packages/engine/AGENTS.md" in error for error in errors))
        self.assertTrue(any("UTF-8" in error for error in errors))

    def test_rejects_unaccepted_or_incomplete_adr(self) -> None:
        documents = valid_documents()
        documents[f"docs/adr/{ADR_NAME}"] = (
            "- **Stato**: PROPOSED\n"
            "- **Data**: 2026-07-13\n"
            "`accept` `attest` `save` `apply`\n"
        )
        errors = validate_documents(documents)
        for expected in ("operative preamble", "LF-normalized"):
            self.assertTrue(any(expected in error for error in errors), expected)

    def test_rejects_spoofed_or_duplicate_adr_metadata(self) -> None:
        documents = valid_documents()
        adr_path = f"docs/adr/{ADR_NAME}"
        documents[adr_path] = documents[adr_path].replace(
            "- **Stato**: ACCEPTED",
            "- **Stato**: PROPOSED\n"
            "Nota storica: **Stato**: ACCEPTED\n"
            "- **Stato**: SUPERSEDED",
        )
        errors = validate_documents(documents)
        self.assertTrue(any("operative preamble" in error for error in errors))
        self.assertTrue(any("LF-normalized" in error for error in errors))

    def test_rejects_missing_link_and_path_traversal(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            documents = valid_documents()
            documents.update(
                {
                    "ardesia-vault/ARDESIA-MAP.md": "legacy\n",
                    ".git/config": "local\n",
                }
            )
            documents["AGENTS.md"] = (
                documents["AGENTS.md"]
                + ("\n" * 25)
                + "[Outside](../outside.md)\n"
                + "[Alias](alias/../docs/CANON-INDEX.md)\n"
                + "[Legacy](ardesia-vault/ARDESIA-MAP.md)\n"
                + "[Git](.git/config)\n"
            )
            materialize(root, documents)
            (root / "alias").symlink_to("apps/studio", target_is_directory=True)
            (root / "apps/studio").rename(root / ".git/studio")
            (root / "apps/studio").symlink_to("../.git/studio", target_is_directory=True)
            (root / "new-boundary").mkdir()
            (root / "new-boundary/CLAUDE.md").symlink_to("/etc/hosts")
            errors = governance_gate.validate_repository(root)
        for expected in (
            "escapes repository",
            "legacy governance target",
            "ignored repository path", "symbolic local link targets",
            "symbolic governance files",
        ):
            self.assertTrue(any(expected in error for error in errors), expected)
    def test_rejects_noncanonical_and_unsafe_late_links(self) -> None:
        cases = (
            "[bad](%2e%2e/outside.md)", "[bad](file:///etc/passwd)", "[bad](<../outside.md>)",
            "[bad](../outside.md \"title\")", "[bad][ref]\n[ref]: ../outside.md", '<a href="../outside.md">bad</a>',
            "<file:///etc/passwd>", "`\n\n[bad](../outside.md)\n\n`", "x ```<file:///etc/passwd>\\`", "x ```[bad](../outside.md)\\`",
            "<span>[bad](../outside.md)</span>", "[outer [inner]](../outside.md)", "[bad](../outside.md\n\"title\")", "[bad](&period;&period;&sol;outside.md)",
            "[bad](javascript:alert)", "[bad](data:text/html,bad)", "[bad](vscode://file/x)", "[bad](http://[)",
            "[bad](http://@)", "[bad](http://example.test:bad)", "[bad](mailto:)", "[bad](#section)",
            "Open file:///etc/passwd", "obsidian://open?vault=legacy", "vscode://file/etc/passwd", "javascript:alert(1)",
            "ftp://example.test/file", "ssh://host/path", "sftp://host/path", "blob:https://example.test/id",
            "filesystem:https://example.test/id", "[bad](obsidian://open)", "\\\\[bad](../outside.md)",
            "[bad](//outside.test/x)", "[[../outside]]",
            "```foo`bar\n[bad](javascript:alert)", "\t```bad\n[bad](javascript:alert)", "`<!--` [bad](javascript:alert)", "`%%` [bad](javascript:alert)",
            "> ```md\n[bad](javascript:alert)", "- ```md\n[bad](javascript:alert)", ">    - ```md\n[bad](javascript:alert)", ">   > ```md\n[bad](javascript:alert)",
            "<claude-mem-context>\n[bad](javascript:alert)\n</claude-mem-context>", "%%\n[bad](javascript:alert)",
            "`start\n# [bad](javascript:alert)\nend`", "`start\n===\n[bad](javascript:alert)\nend`", "[\u0301](docs/CANON-INDEX.md)",
            "`start\n| A |\n| --- |\n| [bad](javascript:alert) |\nend`", "[legacy](ardesia-vault/ARDESIA-MAP.md)",
            "[missing](docs/missing.md)", "[\u034f](docs/CANON-INDEX.md)", "[\ufe0f](docs/CANON-INDEX.md)",
            "[\u2800](docs/CANON-INDEX.md)", "text <!--> [bad](javascript:alert)", "text <!---> [bad](javascript:alert)",
            "text <!--> [bad](javascript:alert) -->",
            "text <!---> [bad](javascript:alert) -->",
            "text <!--bad---> [bad](javascript:alert)",
            *REFERENCE_BYPASSES,
        )
        for content in cases:
            with self.subTest(content=content):
                documents = valid_documents()
                documents["AGENTS.md"] += ("\n" * 25) + content
                self.assertTrue(validate_documents(documents))
    def test_rejects_unicode_line_separator_before_required_links(self) -> None:
        documents = valid_documents()
        documents["AGENTS.md"] = ("\u2028" * 24) + documents["AGENTS.md"]
        self.assertTrue(any("UNICODE_CONTROL" in error for error in validate_documents(documents)))

    def test_ignores_links_in_comments_fences_and_images(self) -> None:
        documents = valid_documents()
        documents["AGENTS.md"] = (
            f"<!-- [ADR](docs/adr/{ADR_NAME}) -->\n"
            "```markdown\n[Canon](docs/CANON-INDEX.md)\n```\n"
            f"![ADR](docs/adr/{ADR_NAME})\n"
            "![Canon](docs/CANON-INDEX.md)\n"
        )
        errors = validate_documents(documents)
        self.assertTrue(any("docs/adr" in error for error in errors))
        self.assertTrue(any("docs/CANON-INDEX.md" in error for error in errors))

    def test_rejects_markdown_and_unicode_obfuscation(self) -> None:
        cases = (
            "zero‑llm   IN\nPRODOTTO", "ZERO-**LLM** in prodotto",
            "ZERO-LLM in pro\u200bdotto", "ZERO\u2212LLM in prodotto",
            "ZERO-[**LLM**](docs/example.md) in prodotto",
            "Use ZERO-`LLM` in prodotto",
            "Use `ZERO-LLM in prodotto`",
            "ZERO\\-LLM in prodotto",
            "ZERO-[LLM][old] in prodotto\n[old]: docs/example.md",
            "ZERO&minus;LLM in prodotto",
            "ZERO-LL\u034fM in prodotto",
            "ZERO-\ufe0fLLM in prodotto",
            "ZERO-\u202eLLM in prodotto",
            "Branch — REGOLA D’ORO",
            "Branch — REGOLA D\\'ORO",
            "ardesia-vault\\/ARDESIA-MAP.md",
            "paragraph\n    ZERO-LLM in prodotto",
            *(
                f"ZERO-{chr(code)}LLM in prodotto"
                for code in (0x115F, 0x1160, 0x17B4, 0x17B5, 0x3164, 0xFFA0, 0xFFF0)
            ),
        )
        for marker in cases:
            with self.subTest(marker=marker):
                documents = valid_documents()
                documents["plugins/elab-tutor/AGENTS.md"] += f"\n{marker}\n"
            self.assertTrue(validate_documents(documents), marker)

    def test_rejects_non_operational_or_malformed_canonical_links(self) -> None:
        adr_target = f"docs/adr/{ADR_NAME}"
        canon_target = "docs/CANON-INDEX.md"
        cases = (
            f"`[ADR]({adr_target})`\n[Canon]({canon_target})\n", f"[]({adr_target})\n[]({canon_target})\n",
            f"`start\n[ADR]({adr_target})\nend`\n[Canon]({canon_target})\n",
            f"    [ADR]({adr_target})\n[Canon]({canon_target})\n", f"[   ]({adr_target})\n[ ]({canon_target})\n",
            f" \t[ADR]({adr_target})\n[Canon]({canon_target})\n", f"\\[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"  \t[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"   \t[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"<pre>[ADR]({adr_target})</pre>\n[Canon]({canon_target})\n",
            f"<%* [ADR]({adr_target}) %>\n[Canon]({canon_target})\n", f"[ADR]({adr_target}\n[Canon]({canon_target}\n",
            f"<pre>[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"<code>[ADR]({adr_target})</code>\n[Canon]({canon_target})\n",
            f"<textarea>[ADR]({adr_target})</textarea>\n[Canon]({canon_target})\n",
            f"<div hidden>[ADR]({adr_target})\n[Canon]({canon_target})</div>\n",
            f"<div hidden>\n[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"<div\nhidden>\n[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"<![CDATA[\n[ADR]({adr_target})\n[Canon]({canon_target})\n]]>\n",
            f"<?gate\n[ADR]({adr_target})\n[Canon]({canon_target})\n?>\n",
            f"> ```md\n> [ADR]({adr_target})\n> ```\n[Canon]({canon_target})\n",
            f"- ```md\n  [ADR]({adr_target})\n  ```\n[Canon]({canon_target})\n",
            f"1. ```md\n   [ADR]({adr_target})\n   ```\n[Canon]({canon_target})\n",
            f"-     [ADR]({adr_target})\n-     [Canon]({canon_target})\n",
            f"- \t[ADR]({adr_target})\n1. \t[Canon]({canon_target})\n",
            f"- item\n    ~~~\n[ADR]({adr_target})\n[Canon]({canon_target})\n    ~~~\n",
            f"- item\n  ```\n[ADR]({adr_target})\n[Canon]({canon_target})\n  ```\n",
            f"<claude-mem-context>\n[ADR]({adr_target})\n[Canon]({canon_target})\n</claude-mem-context>\n",
            f"%%\n[ADR]({adr_target})\n[Canon]({canon_target})\n%%\n",
            f"---\nadr: '[ADR]({adr_target})'\ncanon: '[Canon]({canon_target})'\n---\n# none\n",
            f"[ADR]({adr_target} \"unterminated)\n[Canon]({canon_target})\n",
            f"[ADR]({adr_target} \"title\")\n[Canon]({canon_target})\n",
            f"[ADR]({adr_target}?x=1)\n[Canon]({canon_target})\n",
            f"[`\u2800`]({adr_target})\n[`\u0301`]({canon_target})\n",
            f"https://example.test/[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"www.example.test/[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"ftp://example.test/[ADR]({adr_target})\n[Canon]({canon_target})\n",
            f"$[ADR]({adr_target})$\n$[Canon]({canon_target})$\n",
            f"$$\n[ADR]({adr_target})\n[Canon]({canon_target})\n$$\n",
            ("\n" * 24) + f"[ADR]({adr_target})\n[Canon]({canon_target})\n",
        )
        for content in cases:
            with self.subTest(content=content):
                documents = valid_documents()
                documents["AGENTS.md"] = content
                errors = validate_documents(documents)
            self.assertTrue(any("MISSING_CANONICAL_LINK" in e for e in errors))

    def test_rejects_adr_hidden_in_fence_or_historical_section(self) -> None:
        adr_path = f"docs/adr/{ADR_NAME}"
        cases = (
            lambda adr: f"```markdown\n{adr}\n```\n",
            lambda adr: "# Current policy\nStatus: PROPOSED\n## Historical example\n" + adr,
        )
        for mutate in cases:
            with self.subTest():
                documents = valid_documents()
                documents[adr_path] = mutate(documents[adr_path])
            self.assertTrue(validate_documents(documents))

    def test_rejects_unratified_adr_and_contradictory_canon_amendments(self) -> None:
        cases = (
            (
                f"docs/adr/{ADR_NAME}",
                "\n## Current amendment\nThe model governs identity and scope.\n",
            ),
            (
                "docs/CANON-INDEX.md",
                "\n## Current amendment\n"
                "The model governs identity, scope, consent and persistence, "
                "and may publish without teacher review.\n",
            ),
        )
        for path, amendment in cases:
            with self.subTest(path=path):
                documents = valid_documents()
                documents[path] += amendment
            self.assertTrue(validate_documents(documents))

    def test_rejects_canon_without_ci_and_ratification_receipt(self) -> None:
        base = valid_documents()["docs/CANON-INDEX.md"]
        receipt = "\n".join(governance_gate.CANON_RECEIPT_BLOCK)
        cases = (
            f"[ADR](adr/{ADR_NAME})\n",
            base + "\nnorth_star_adr_policy: mutable\n",
            base + "\nnorth_star_adr_policy : mutable\n",
            base + "\ngovernance_gate_ci\t:\tdisabled\n",
            base + "\ngovernance_gate_ci: disabled\n",
            base + "\nThe statement north_star_adr_policy: immutable is false.\n",
            base + "\nnorth_star\\_adr_policy: mutable\n",
            base + "\nnorth_star_`adr`_policy: mutable\n",
            base + "\ngovernance_gate&#95;ci: disabled\n",
            base + "\nnorth_star_adr\u034f_policy: mutable\n",
            base + "\naccepted_adr_policy: immutable\n",
            base.replace("## Gate automatico", "<template>\n## Gate automatico")
            + "</template>\n",
            base.replace("## Gate automatico", "> ## Gate automatico"),
            base.replace("governance_receipt_version: 1", "`\ngovernance_receipt_version: 1") + "`\n",
            "<div hidden>\n" + base,
            "<![CDATA[\n" + base + "]]>\n",
            "$$\n" + base + "$$\n",
            "---\n" + receipt + "\n---\n" + f"[ADR](adr/{ADR_NAME})\n",
            "%%\n" + receipt + "\n%%\n" + f"[ADR](adr/{ADR_NAME})\n",
            "%%\n" + receipt,
        )
        for canon in cases:
            with self.subTest():
                documents = valid_documents()
                documents["docs/CANON-INDEX.md"] = canon
                self.assertTrue(validate_documents(documents))

    def test_discovers_every_instruction_basename(self) -> None:
        discovered = {
            "new-boundary/AGENTS.md": "ZERO-LLM in prodotto\n",
            "new-boundary/CLAUDE.md": "[x][r]\n[r]: ../../outside.md\n",
            "new-boundary/AUTOPILOT.md": '<a href="../../outside.md">x</a>\n',
            "new-boundary/GOVERNANCE.md": "[x](<../../outside.md>)\n",
            "new-boundary/CODEX-WORKFLOW.md": '[x](../../outside.md "title")\n',
        }
        documents = valid_documents()
        documents.update(discovered)
        documents["node_modules/CLAUDE.md"] = "ZERO-LLM in prodotto\n"
        errors = validate_documents(documents)
        for path in discovered:
            self.assertTrue(any(path in error for error in errors), path)
        self.assertFalse(any("node_modules/CLAUDE.md" in error for error in errors))

    def test_rejects_reference_bypasses_in_discovered_instructions(self) -> None:
        for content in REFERENCE_BYPASSES:
            documents = valid_documents()
            documents["new-boundary/CLAUDE.md"] = content
            self.assertTrue(validate_documents(documents), content)

    def test_rejects_stale_vault_authority_and_external_pointer(self) -> None:
        documents = valid_documents()
        documents["docs/vault/ARDESIA-MAP.md"] = (
            "---\n"
            "document_status: active\n"
            "authority: source-of-truth\n"
            "authority: duplicate\n"
            "source_of_truth: true\n"
            "---\n"
            "Documento UNICO per orientarsi.\n"
            "Read ~/ardesia-vault/ARDESIA-MAP.md.\n"
            "ZERO-LLM in prodotto.\n"
        )
        errors = validate_documents(documents)
        for expected in (
            "duplicate front matter key",
            "unexpected front matter key",
            "document_status",
            "authority",
            "obsolete authority",
            "external vault",
            "ZERO-LLM in prodotto",
        ):
            self.assertTrue(any(expected in error for error in errors), expected)

    def test_repository_tree_is_conformant(self) -> None:
        self.assertEqual(governance_gate.validate_repository(Path(__file__).resolve().parents[2]), [])

    def test_rejects_impossible_front_matter_date(self) -> None:
        documents = valid_documents()
        documents["ARDESIA-MAP.md"] = documents["ARDESIA-MAP.md"].replace(
            "updated_at: 2026-07-14", "updated_at: 2026-99-99"
        )
        self.assertTrue(any("valid ISO date" in error for error in validate_documents(documents)))
if __name__ == "__main__":
    unittest.main()
