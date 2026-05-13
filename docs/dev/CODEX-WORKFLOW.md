# Codex Workflow — Parallel Offline Code Analysis Layer

**Data**: 2026-05-13 | **Trigger**: Andrea mandate "Imposta un workflow con codex"
**Versione**: 1.0

## Filosofia

Codex CLI 0.128.0 runs as **parallel verification layer** alongside Claude main thread.
Sandbox `workspace-write` mode: filesystem read/write OK, NO network (DNS block).
Use for code path verification, NOT prose synthesis.

## Pattern Standard (Pattern C — Codex Verify)

```
Claude main thread → execute core task
    ↓ parallel
Codex bg → verify independently (file paths, symbol references, regex sanity)
    ↓
Claude → read /tmp/codex-<task>.txt
    ↓
Cross-check + synth manuale
    ↓
Commit + push only if both Claude+Codex agree
```

## Use Cases (✓ good)

1. **File path verify**: "find file X in dir Y" → returns absolute path
2. **Symbol search**: "list functions calling isVertexEUEnabled" → returns refs
3. **Regex sanity**: "test regex /\b(volume)\s*([123])\b/i against examples" → match results
4. **Dead code detection**: "find imports of LLM_ROUTING_WEIGHTS in supabase/functions" → caller list
5. **Compile check**: "tsc --noEmit on file W" → errors list
6. **Migration audit**: "list .sql files in supabase/migrations sorted by date" → ordered list
7. **Alternative impl**: "suggest 2 alternative impl of function Q" → code variants
8. **Test scope**: "list test files importing module M" → impact estimate

## Anti-Patterns (✗ avoid)

1. **Prose synthesis**: "write report on architecture" → returns file dumps NOT analytical
2. **Open-ended analysis**: "analyze hot paths" → too vague, returns code listing
3. **Decision making**: "should we use X or Y" → no judgment, returns options dump
4. **Long-form docs**: "write README for module" → may hallucinate context

Proven iter 41 bench: 3 Codex jobs asked for "Output: tabella path | wall-time | hot-path" — all 3 returned `nl -ba <file> | sed -n` source dumps. NO analytical table generated.

## Invocation

### Method 1: wrapper script (standard)

```bash
scripts/dev/codex-bg.sh verify-vertex \
  "find isVertexEUEnabled callers in supabase/functions, list file:line refs"
# → /tmp/codex-verify-vertex.txt
```

### Method 2: inline (one-off)

```bash
~/.npm-global/bin/codex exec \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --cd "/path/to/project" \
  "task description" > /tmp/codex-<task>.txt 2>&1
```

### Method 3: parallel batch (multi-task)

```bash
scripts/dev/codex-bg.sh task1 "..." &
scripts/dev/codex-bg.sh task2 "..." &
scripts/dev/codex-bg.sh task3 "..." &
wait
# All 3 done → aggregate /tmp/codex-task{1,2,3}.txt
```

## Cross-Check Protocol

After Claude executes + Codex verifies, compare results:

| Outcome | Action |
|---------|--------|
| Both agree | ✅ Commit + push |
| Codex finds NEW evidence | Re-investigate, update Claude work |
| Claude finds NEW evidence | Re-run Codex with refined query |
| Disagree on file:line | Verify with `Read` tool ground truth |
| Codex returns dump only | Synth manually + flag as "Codex verify limitation" |

## Anti-Inflation G45 Compliance

- Codex output included in audit doc raw OR summary with citation
- NO claim "Codex verified X" without showing actual Codex output excerpt
- Score impact: +0.1 for each independent Codex verification confirming Claude finding
- Cap: NO inflation > 9.0 even with Codex cross-check (Opus indipendente still required)

## Files

- Script: `scripts/dev/codex-bg.sh` (bash wrapper)
- Doc: `docs/dev/CODEX-WORKFLOW.md` (this file)
- Output convention: `/tmp/codex-<task>.txt`
- Aggregation: Claude reads + synth manuale (until Codex prose synth improves)

## Reference

- Codex CLI: https://github.com/openai/codex-plugin-cc
- Codex version: 0.128.0 (installed `~/.npm-global/bin/codex`)
- Mandate origin: Andrea 2026-05-13 "Imposta un workflow con codex"

## Examples iter 42

### Verify pending commit unlocked

```bash
scripts/dev/codex-bg.sh verify-commit-precommit \
  "check tests/unit/studentAlbumMigration.test.js for it.todo replacement of failing it()"
```

### Verify dead code removal

```bash
scripts/dev/codex-bg.sh verify-dead-routing \
  "find references to LLM_ROUTING_WEIGHTS in supabase/functions/ and src/services/"
```

### Verify DrawingOverlay branch

```bash
scripts/dev/codex-bg.sh verify-drawing-readonly \
  "show DrawingOverlay.jsx render branch when !drawingEnabled, locate line range"
```
