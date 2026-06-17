# Codex Workflow v2.0 — Parallel Implementer + Verifier + Reviewer

**Data**: 2026-05-14 (v2.0) · v1.0 2026-05-13 · **Codex CLI**: 0.128.0 · **Model**: gpt-5.5
**Trigger**: Andrea iter 54 "crea il workflow ottimale con Codex GPT-5.5"
**Companion**: `.codex/AGENTS.md` (repo guidance Codex reads) · `scripts/dev/codex-bg.sh` (wrapper)

---

## Cosa cambia da v1.0

v1.0 trattava Codex come **verify-only** ("prose synthesis → file dumps", "NO network").
La causa reale dei "file dumps" iter 41 NON era un limite del modello — erano **prompt
a riga singola senza struttura**. OpenAI è esplicito: i prompt Codex devono avere 4
elementi (goal / context / constraints / completion criteria). Con GPT-5.5 + AGENTS.md +
prompt strutturati, Codex è un **implementer + verifier + reviewer** parallelo, non solo
un verificatore.

| | v1.0 | v2.0 |
|---|---|---|
| Ruolo Codex | verify-only | implementer + verifier + reviewer |
| Prompt | riga singola | 4-element (goal/context/constraints/done) |
| Network | "DNS bloccato" | abilitabile via `-c sandbox_workspace_write.network_access=true` |
| AGENTS.md | assente | `.codex/AGENTS.md` repo-level ✓ |
| Profili | nessuno | 4 profili in `~/.codex/config.toml` |
| Review | manuale | `codex exec review` built-in |
| Reasoning effort | `high` fisso globale | per-task: medium default / high agentic / xhigh hard |
| Parallelismo | bg jobs stesso dir | git worktree isolati (no collisione) |

---

## Principio guida: coordination-first

La frontiera del multi-agent non è "lancia più agenti", è **evitare che collidano**.
Regola: Claude (orchestratore) e Codex non scrivono mai sugli stessi file
contemporaneamente. Codex implementa in **git worktree dedicato**; Codex verifica/
revisiona in **sandbox read-only**. File ownership rigido come Pattern S r3.

---

## I 3 pattern

### Pattern V — Codex Verify (parallelo, read-only)

Claude esegue il task core; Codex verifica in parallelo, sandbox read-only.

```bash
scripts/dev/codex-bg.sh verify --profile verify \
  "GOAL: verify isVertexEUEnabled has no dead callers.
   CONTEXT: @supabase/functions/_shared/llm-client.ts
   CONSTRAINTS: read-only, cite file:line for every reference.
   DONE: a list of file:line callers, or 'zero callers found'."
# → /tmp/codex-verify.txt
```
Buono per: file/symbol search, regex sanity, dead-code, compile-check, migration audit,
test-scope impact. Cross-check protocollo sotto.

### Pattern R — Codex Review (pre-commit / pre-PR)

```bash
~/.npm-global/bin/codex exec review --cd "$PWD"          # vs base branch
~/.npm-global/bin/codex exec review --cd "$PWD" -- --uncommitted   # uncommitted only
```
Built-in code review. Usalo come gate prima di `git commit` su lavoro non-triviale,
in aggiunta al pre-commit hook. Codex segue le convenzioni in `.codex/AGENTS.md`.

### Pattern I — Codex Implement (worktree isolato)

Per task ben specificati che Claude può delegare interamente.

```bash
git worktree add ../elab-builder-codex-<task> -b codex/<task>
scripts/dev/codex-bg.sh impl-<task> --profile implement --cd ../elab-builder-codex-<task> \
  "GOAL: <one sentence>.
   CONTEXT: @<files>. Repo conventions in .codex/AGENTS.md.
   CONSTRAINTS: touch only <files>; npx vitest run must stay >= baseline; npm run build must pass.
   DONE: tests added + green, build green, git diff scoped to <files>."
# Claude reviews the worktree diff, then merges or discards.
```
Codex esegue il loop completo (implementa → scrive test → run vitest → run build →
conferma). Claude rivede il diff del worktree prima del merge.

---

## Prompt structure — OBBLIGATORIO (4 elementi)

Ogni invocazione Codex DEVE avere:

1. **GOAL** — una frase, cosa deve essere vero alla fine.
2. **CONTEXT** — `@file` mentions + "conventions in .codex/AGENTS.md".
3. **CONSTRAINTS** — sandbox, file ownership, anti-regression (vitest >= baseline,
   build pass), cosa NON toccare.
4. **DONE** — criterio di completamento concreto e verificabile (non "fai del tuo
   meglio" — "una tabella file:line", "test verdi + build verde + diff scoped").

Prompt a riga singola = output a file-dump. Questo è il bug v1.0, non un limite GPT-5.5.

---

## Reasoning effort — per task, non globale

| Effort | Quando |
|---|---|
| `low` | check banali, scoped (un file, una regex) |
| `medium` | **default OpenAI** — balanced, la maggior parte dei verify |
| `high` | task agentici complessi, refactor multi-file, review |
| `xhigh` | task asincroni più duri, audit complessi, eval |

Override per-task: `-c model_reasoning_effort=xhigh`. Il default globale in
`~/.codex/config.toml` è `high` — per uso ELAB va bene tenerlo, ma i profili sotto
lo regolano per tipo di task.

---

## config.toml — profili raccomandati

Da aggiungere in `~/.codex/config.toml` (additivo, non cambia i default globali):

```toml
[profiles.verify]
model_reasoning_effort = "medium"
sandbox_mode = "read-only"

[profiles.review]
model_reasoning_effort = "high"
sandbox_mode = "read-only"

[profiles.implement]
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"

[profiles.research]
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
[profiles.research.sandbox_workspace_write]
network_access = true
```

Uso: `codex exec -p verify "..."` / `codex exec -p implement "..."` etc.

---

## Sandbox modes

| Mode | Cosa permette | Profilo |
|---|---|---|
| `read-only` | legge file, comandi read-only. NO write. | verify, review |
| `workspace-write` | scrive nel project dir, comandi read-only. **Default.** | implement |
| `workspace-write` + `network_access=true` | come sopra + rete (per research) | research |
| `danger-full-access` / `--yolo` | nessun limite. **MAI** fuori da runner isolato. | — |

---

## Cross-check protocol (Pattern V)

Dopo Claude esegue + Codex verifica, confronta:

| Esito | Azione |
|---|---|
| Concordano | ✅ procedi al commit |
| Codex trova evidenza NUOVA | re-investiga, aggiorna il lavoro di Claude |
| Claude trova evidenza NUOVA | re-run Codex con query raffinata |
| Disaccordo su file:line | verità a terra con `Read` tool |
| Codex ritorna solo dump | il prompt non aveva i 4 elementi — riformula, non concludere |

---

## Anti-inflation G45

- Output Codex incluso nell'audit doc raw o summary CON citazione.
- NO claim "Codex verified X" senza mostrare l'estratto reale dell'output Codex.
- `codex exec review` NON sostituisce la review Opus indipendente per score > 7.5.
- Score: +0.1 per ogni verifica Codex indipendente che conferma un finding Claude.

---

## Skills (roadmap)

Task ELAB ripetitivi → `.agents/skills/<nome>/SKILL.md` (repo) o `~/.agents/skills/`
(personale). Candidato #1: `elab-regression-check` (run vitest + build, report delta
vs `automa/baseline-tests.txt`). Da creare quando il pattern si ripete.

---

## Invocazione — riferimento rapido

```bash
# Pattern V — verify (read-only, parallelo)
scripts/dev/codex-bg.sh <task> --profile verify "GOAL:... CONTEXT:... CONSTRAINTS:... DONE:..."

# Pattern R — review (pre-commit gate)
~/.npm-global/bin/codex exec review --cd "$PWD"

# Pattern I — implement (worktree isolato)
git worktree add ../elab-builder-codex-<task> -b codex/<task>
scripts/dev/codex-bg.sh impl-<task> --profile implement --cd ../elab-builder-codex-<task> "GOAL:..."

# Batch parallelo
scripts/dev/codex-bg.sh t1 --profile verify "..." &
scripts/dev/codex-bg.sh t2 --profile verify "..." &
wait

# One-off inline con override
~/.npm-global/bin/codex exec -p research -c model_reasoning_effort=xhigh \
  --cd "$PWD" "GOAL:... CONTEXT:... CONSTRAINTS:... DONE:..." > /tmp/codex-<task>.txt 2>&1
```

---

## Known issue

Il file `AGENTS.md` nella root del repo è un dump auto-generato da claude-mem (non
guidance Codex). Codex legge sia `AGENTS.md` root sia `.codex/AGENTS.md` — quest'ultimo
(creato in v2.0) porta il segnale reale. Non eliminare il root `AGENTS.md`: è gestito
da claude-mem. Se in futuro confonde Codex, valutare un `.codexignore` o spostare il
dump claude-mem altrove.

---

## Files

- `.codex/AGENTS.md` — guidance repo-level (Codex la legge automaticamente)
- `scripts/dev/codex-bg.sh` — wrapper v2.0 (profile-aware, 4-element prompt enforce)
- `docs/dev/CODEX-WORKFLOW.md` — questo file
- Output convention: `/tmp/codex-<task>.txt`

## Reference

- Best practices: https://developers.openai.com/codex/learn/best-practices
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- CLI reference: https://developers.openai.com/codex/cli/reference
- Sandbox: https://developers.openai.com/codex/concepts/sandboxing
- GPT-5.5: https://openai.com/index/introducing-gpt-5-5/

---

## iter 59 addendum — Andrea mandate "affina il workflow con codex" (2026-05-15)

iter 59 entrance reaffirmed Pattern C-V default + codified reusable templates. Concrete deltas vs v2.0:

### Reusable prompts library scaffold

Directory `scripts/dev/codex-prompts/` created iter 59 entrance with parametric templates:

| Template | Purpose | Parametric vars |
|---|---|---|
| `verify-anti-regression.txt` | post-commit pre-push 4-gate check | `$COMMIT_HASH`, `$BASELINE_COUNT` |
| `verify-morfismo-compliance.txt` | palette + ToolSpec + lesson-paths Morfismo Sense 2 audit | `$SCOPE_FILES` |
| `verify-codegen-output.txt` | scratchGenerator.js determinism AVR vs Renesas | `$BLOCK_TYPE`, `$BOARD_FQBN` |
| `verify-lesson-path-edit.txt` | post-edit lesson-path/*.json chain integrity | `$LESSON_PATH_ID` |

Pattern: `sed "s/\$VAR/value/g" template.txt | xargs -I{} bash codex-bg.sh task --profile verify "{}"`. Templates iterate iter 60+ as patterns emerge.

### iter 58+iter 59 Codex track record

| iter | Codex runs | All-PASS | Notable wins | Notable misses |
|---|---|---|---|---|
| 57 | 6 | 4/6 (2 reworked) | Caught 15th dangling ref; 5 Vol2 cap drifts validator masked | Sandbox heredoc block (run #1); ignored path restriction (run #2) — both reworked |
| 58 | 2 | 2/2 | Cross-compile feasibility verdict + Phase 1 diff 3/3 CONFIRM zero regression | None |
| 59 | 3 (so far) | 3/3 | Blockly cross-compile recon (CONFIRM keep generic Arduino C++) + iter 58 feasibility (SKIP live-terminal verdict) + UX blockers BG | Codex honestly noted §4 UX blockers couldn't answer under constraint — flagged, NOT fabricated |

### Pattern C-V at every claim mandate (Andrea iter 59)

- Every "done" / "verified" / "N tests pass" / "score X" claim is Pattern C-V verified.
- Phase 1 commit b5d21c5b iter 58: Codex 3/3 CONFIRM cited file:line. Score 8.0/10 ONESTO not inflated.
- iter 59 entrance commit (coming): will be Pattern C-V verified pre-push.

### "NO live-terminal" decision codified

iter 58 Codex feasibility BG `/tmp/codex-iter58-feasibility-claude-codex-live.txt` verdict:
- Live-terminal feasible BUT high risk (focus stealing + OCR ambiguity + scrollback loss + no structured state).
- `codex-bg.sh` already structured + auditable + reproducible — equivalent capability without fragility.
- **Recommendation**: SKIP live-terminal, stick with `codex-bg.sh`. Reserve live-terminal only for macOS UI automation testing goal.

### iter-aware task naming convention enforced

Pattern: `iter{N}-{subsystem}-{action}-{optional-discriminator}`. Examples iter 58-59:
- `iter58-feasibility-claude-codex-live`
- `iter58-phase1-verify`
- `iter59-blockly-cross-compile-recon`
- `iter59-blockly-ux-blockers`

Audit trail per iter = grep `/tmp/codex-iter58-*.txt` + `/tmp/codex-iter59-*.txt`.

### Failure mode log update iter 59

- Run #1 (cross-compile recon): PASS — Codex honest about UX blockers gap under constraint (didn't fabricate). New positive pattern: Codex flags "cannot answer under EXACTLY these commands" rather than confabulate.
- Run #2 (Phase 1 verify): PASS — caught no regression but flagged intended side effect `percorsoGenerator.js:127` num ordering = Morfismo Sense 2 aligned, not regression.
- Run #3 (UX blockers BG): **STUCK on stdin** — Codex CLI 0.128.0 read prompt arg as 39 bytes only then waited for stdin input. Likely cause: prompt contained `\|` escaped-pipe regex alternation in `grep -n 'aria-label\|tooltip\|title='` — parser may have interpreted as line continuation or escaped pipe input mode. **Mitigation iter 60+**: avoid `\|` in inline regex args within Codex prompts; use multi-grep on separate lines OR `grep -E '(a|b|c)'` ERE syntax OR pre-build pattern in env var. Killed via `pkill -f 'iter59-blockly-ux-blockers'`.

### NEW failure mode added iter 59 (codex-cli prompt arg parsing)

| Failure | Mitigation |
|---|---|
| Codex CLI 0.128.0 stuck on stdin reading 39 bytes of prompt arg when prompt contains `\\|` regex alternation | Use `grep -E '(pattern1|pattern2)'` ERE syntax in prompt, NOT `grep 'pattern1\|pattern2'` BRE syntax. Or split into separate grep commands. |

### iter 60+ Codex roadmap

- P0: complete `codex-prompts/` 5 templates (4 scaffolded + 1 cov-cycle pending).
- P1: add `verify-spec-compliance.txt` (re-derive PRD acceptance criteria from code post-Phase implementation).
- P2: add `verify-openapi-drift.txt` (n8n compile contract drift detection).
- P2: integrate Codex per-gate in pre-push hook via 4-gate template (currently manual Pattern C-V).

