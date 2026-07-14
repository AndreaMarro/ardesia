#!/usr/bin/env python3
"""Focused tests for immutable GitHub Actions references."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("action_pin_gate.py")
SPEC = importlib.util.spec_from_file_location("action_pin_gate", SCRIPT)
assert SPEC and SPEC.loader
action_pin_gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(action_pin_gate)


class ActionPinGateTest(unittest.TestCase):
    def write_workflow(self, root: Path, name: str, body: str) -> None:
        workflow_dir = root / ".github" / "workflows"
        workflow_dir.mkdir(parents=True, exist_ok=True)
        (workflow_dir / name).write_text(body, encoding="utf-8")

    def write_local_action(self, root: Path, body: str) -> None:
        action_dir = root / ".github" / "actions" / "local"
        action_dir.mkdir(parents=True, exist_ok=True)
        (action_dir / "action.yml").write_text(body, encoding="utf-8")

    def test_accepts_commit_local_and_docker_digest_references(self) -> None:
        commit = "a" * 40
        digest = "b" * 64
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_local_action(
                root,
                "\n".join(
                    [
                        "runs:",
                        "  using: composite",
                        f"  steps:\n    - uses: owner/nested@{commit}",
                    ]
                ),
            )
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(
                    [
                        f"      - uses: actions/checkout@{commit} # v4",
                        "      - uses: ./.github/actions/local",
                        f'      - uses: "docker://example.test/tool@sha256:{digest}"',
                        f"  steps: [uses: owner/bracket@{commit}]",
                        f"  steps: [? uses : owner/explicit-flow@{commit}]",
                        "      - ? uses",
                        f"        : owner/explicit@{commit}",
                    ]
                ),
            )

            self.assertEqual(action_pin_gate.check_workflows(root), [])

    def test_rejects_tag_branch_expression_and_docker_tag(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yaml",
                "\n".join(
                    [
                        "      - uses: actions/checkout@v4",
                        "      - uses: owner/action@main",
                        "      - uses: ${{ matrix.action }}",
                        "      - uses: docker://example.test/tool:latest",
                    ]
                ),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 4)
        self.assertTrue(all("immutable" in error for error in errors))

    def test_rejects_quoted_and_flow_mapping_bypasses(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(
                    [
                        '      - "uses": owner/quoted@v1',
                        "      - { name: flow, uses: owner/flow@main }",
                        "  reusable: { uses: owner/workflow@stable }",
                        "      - !!map { uses: owner/tagged@v1 }",
                        "      - !!str uses: owner/tagged@v2",
                    ]
                ),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 5)
        self.assertTrue(all("immutable" in error for error in errors))

    def test_rejects_nested_flow_and_expression_bypasses(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(
                    [
                        "      - { uses: owner/nested@v4, with: { token: value } }",
                        '  steps: [{ uses: "${{ matrix.action }}", with: { token: value } }]',
                        "  steps: [uses: owner/bracket@v3]",
                        "  steps: [? uses : owner/explicit-flow@v4]",
                        "  steps: [{ ? uses : owner/explicit-nested@v4 }]",
                        "      - ? uses",
                        "        : owner/explicit@v4",
                    ]
                ),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 6)
        self.assertTrue(any("immutable" in error for error in errors))
        self.assertTrue(any("missing action reference" in error for error in errors))

    def test_scans_local_composite_actions_recursively(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_local_action(
                root,
                "runs:\n  using: composite\n  steps:\n    - uses: owner/nested@v2\n",
            )
            self.write_workflow(
                root, "ci.yml", "      - uses: ./.github/actions/local\n"
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 1)
        self.assertIn(".github/actions/local/action.yml:4", errors[0])

    def test_rejects_semantic_key_escape_and_alias(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(
                    [
                        r'      - "\u0075ses": owner/escaped@v4',
                        r'  steps: ["\u0075ses": owner/flow-escaped@v4]',
                        "name: &action_key uses",
                        "steps:",
                        "  - ? *action_key",
                        "    : owner/alias@v4",
                        "paths: [&flow_action_key uses]",
                        "steps: [{ *flow_action_key: owner/flow-alias@v4 }]",
                        "steps:",
                        "  - ? |-",
                        "      uses",
                        "    : owner/block-key@v4",
                        "  - ? |2-",
                        "      uses",
                        "    : owner/indented-block-key@v4",
                        '  - ? "u\\',
                        '      ses"',
                        "    : owner/continued-key@v4",
                        'steps: [? "u\\',
                        '  ses" : owner/flow-continued-key@v4]',
                        'steps: [{ ? "u\\',
                        '  ses" : owner/nested-flow-continued-key@v4 }]',
                        'steps: [? "\\u0075\\',
                        '  ses" : owner/escaped-continued-key@v4]',
                    ]
                ),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertTrue(any("escaped mapping keys" in error for error in errors))
        self.assertTrue(any("mapping-key anchors" in error for error in errors))
        self.assertTrue(any("flow anchors" in error for error in errors))
        self.assertTrue(any("block-scalar" in error for error in errors))
        self.assertTrue(any("continued quoted" in error for error in errors))

    def test_rejects_missing_or_escaping_local_action(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(
                    [
                        "      - uses: ./.github/actions/missing",
                        "      - uses: ./../outside",
                    ]
                ),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 2)
        self.assertTrue(any("missing" in error for error in errors))
        self.assertTrue(any("outside repository" in error for error in errors))

    def test_ignores_comments_but_rejects_missing_value(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_workflow(
                root,
                "ci.yml",
                "\n".join(["# - uses: action@v1", "      - uses: # missing"]),
            )

            errors = action_pin_gate.check_workflows(root)

        self.assertEqual(len(errors), 1)
        self.assertIn("missing action reference", errors[0])

    def test_fails_closed_when_workflow_directory_is_empty(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            errors = action_pin_gate.check_workflows(Path(tmp))

        self.assertEqual(errors, ["no root GitHub Actions workflows found"])


if __name__ == "__main__":
    unittest.main()
