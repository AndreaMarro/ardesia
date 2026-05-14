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
