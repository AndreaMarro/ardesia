# Codex Prompts Library

Reusable parametric Codex prompts for ELAB Tutor Pattern C-V workflow.

Scaffolded iter 59 entrance per Andrea mandate "affina il workflow con codex". See [`docs/dev/CODEX-WORKFLOW.md`](../../../docs/dev/CODEX-WORKFLOW.md) iter 59 addendum for full pattern catalog.

## Usage pattern

```bash
PROMPT=$(sed "s/\$VAR_NAME/value/g" scripts/dev/codex-prompts/<template>.txt)
bash scripts/dev/codex-bg.sh <task-name> --profile verify "$PROMPT"
```

Output → `/tmp/codex-<task-name>.txt`. Pattern C-V default: Claude leads, Codex verifies.

## Templates

| Template | Purpose | Parametric vars |
|---|---|---|
| [`verify-anti-regression.txt`](./verify-anti-regression.txt) | post-commit pre-push 4-gate check | `$COMMIT_HASH`, `$BASELINE_COUNT` |
| [`verify-morfismo-compliance.txt`](./verify-morfismo-compliance.txt) | palette + ToolSpec + lesson-paths Morfismo Sense 2 audit | `$SCOPE_FILES` |
| [`verify-codegen-output.txt`](./verify-codegen-output.txt) | scratchGenerator.js determinism AVR vs Renesas | `$BLOCK_TYPE`, `$BOARD_FQBN` |
| [`verify-lesson-path-edit.txt`](./verify-lesson-path-edit.txt) | post-edit lesson-path/*.json chain integrity | `$LESSON_PATH_ID` |

## 4-element prompt mandate

Every template follows GOAL / CONTEXT / CONSTRAINTS / DONE structure per [CODEX-WORKFLOW.md §2](../../../docs/dev/CODEX-WORKFLOW.md). Anti-failure guards baked: no SKILL.md reads, no heredoc, explicit `EXACTLY these commands` paths, output cap.

## Adding a new template

1. Copy an existing template as starting structure.
2. Define `$VAR_NAME` parametric placeholders for caller substitution.
3. Test with `bash scripts/dev/codex-bg.sh test-{template} --profile verify "<sed-substituted>"`.
4. Append entry to this README table + CODEX-WORKFLOW.md iter addendum.
