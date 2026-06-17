# PDR Settimana 1 — Stabilize + Tea Autoflow + 6 Prod Bugs T1

**Periodo**: lunedì 21/04/2026 → domenica 27/04/2026 (7 giorni)
**Owner**: Andrea Marro (lead) + Tea Lea Babbalea (da merc 23/04)
**Goal Settimanale**: Sistema stabilizzato + Tea autoflow attivo + 6 bug T1 prod risolti + Vol 3 P0 parity + 92 foto TRES JOLIE importate. **Score benchmark target fine settimana**: 6.0/10 (da 2.77/10 attuale).

---

## NOVITÀ PARADIGMA — TEAM AGENTI (peer) non subagent

User direttiva 20/04: **team agenti orchestrato, non subagent**. Significa:
- Ogni agente = ruolo persistente (PM, Architect, Dev, Tester, Reviewer)
- Tutti **Opus tier** (potenza max, no haiku/sonnet sotto-tier)
- Coordinazione **peer-to-peer** via state files (`automa/team-state/`)
- Cross-team handoff **strutturato** (non gerarchico)
- Pattern Anthropic "Managed Agents scaling" + "Multi-Agent research +90.2%"

Vedi `MULTI_AGENT_ORCHESTRATION.md` per dettaglio team composition.

---

## Indice

1. [Obiettivi misurabili settimana](#obiettivi-misurabili-settimana)
2. [Team Agenti Opus — composition](#team-agenti-opus--composition)
3. [Programmatic Tool Calling — primi use case](#programmatic-tool-calling--primi-use-case)
4. [Harness pattern applicato](#harness-pattern-applicato)
5. [Task breakdown 7 giorni](#task-breakdown-7-giorni)
6. [Test strategy + CoV settimana 1](#test-strategy--cov-settimana-1)
7. [Definition of Done settimana](#definition-of-done-settimana)
8. [Rischi settimana + mitigazione](#rischi-settimana--mitigazione)
9. [Deliverable end-of-week](#deliverable-end-of-week)

---

## Obiettivi misurabili settimana

| Obiettivo | Metrica | Baseline | Target sett 1 | Verifica |
|-----------|---------|----------|---------------|----------|
| Build CI green | `npm run build` exit 0 | sì | sì | git log + GH Actions |
| Test baseline mantenuta | `npx vitest run` PASS count | 12056 | ≥12056 | output vitest 3x CoV |
| Score benchmark | `node scripts/benchmark.cjs --write` | 2.77/10 | ≥6.0/10 | `automa/state/benchmark.json` |
| Bug prod T1 risolti | conteggio issue chiuse | 0/6 | 6/6 | GH issues `T1-*` closed |
| Tea autoflow attivo | CODEOWNERS + auto-merge GH Action verde | no | sì | PR Tea merged auto verde |
| Vol 3 esperimenti P0 parity | `volume-references.js` bookText vol3 cap 6-8 | parziale | 100% cap 6-8 | grep bookText vol3 |
| 92 foto TRES JOLIE importate | conteggio file `/public/tres-jolie/` | 0 | 92 | `ls public/tres-jolie/ \| wc -l` |
| UX bug lavagna 19/04 fixati | bug 1 (vuota selezionabile) + bug 2 (persistenza Esci) | aperti | chiusi | test live Andrea + Tea |
| Team agenti Opus attivo | `.claude/agents/` 5+ Opus dispatch ≥5 volte | 0 | ≥5 | log session handoff docs/ |
| claude-mem corpus PDR | `list_corpora` mostra `pdr-ambizioso` | no | sì | MCP query |
| Documentazione handoff completa | file `docs/handoff/2026-04-27-end-sett1.md` | no | sì | git log |

**Score complessivo settimana**: deve coprire ≥10/11 metriche per essere considerata GREEN. Se <8/11 → settimana RED, retro obbligatoria con Tea.

---

## Team Agenti Opus — composition

### 5 agenti peer (tutti Opus 4)

```
            ┌──────────────────────────────────────────┐
            │     SHARED STATE (automa/team-state/)    │
            │  - tasks-board.json (Kanban)             │
            │  - decisions-log.md (decisioni team)     │
            │  - daily-standup.md (sync giornaliero)   │
            │  - blockers.md (impedimenti aperti)      │
            └──────────────────────────────────────────┘
                            ▲
                            │ peer read/write
        ┌───────────┬───────┼───────┬───────────┐
        │           │       │       │           │
        ▼           ▼       ▼       ▼           ▼
    ┌──────┐  ┌──────────┐ ┌─────┐ ┌──────┐ ┌─────────┐
    │ TPM  │  │ARCHITECT │ │ DEV │ │TESTER│ │REVIEWER │
    │ Opus │  │  Opus    │ │Opus │ │ Opus │ │  Opus   │
    └──────┘  └──────────┘ └─────┘ └──────┘ └─────────┘
```

### Ruoli + responsabilità

#### Agente 1: TPM (Technical Project Manager) — Opus
**File**: `.claude/agents/team-tpm.md`
**Ruolo**:
- Pianifica sprint settimanali e daily standup
- Manda task in `tasks-board.json` colonna `todo`
- Verifica completion criteria di ogni task
- Aggiorna `decisions-log.md` decisioni team
- **Non scrive codice** (decision/coordination only)

**Quando dispatch**: inizio settimana (pianificazione), inizio giorno (standup), fine giorno (verifica)

#### Agente 2: ARCHITECT — Opus
**File**: `.claude/agents/team-architect.md`
**Ruolo**:
- Disegna architettura feature complessa (Dashboard, RAG, multi-agent)
- Decide pattern (state machine, observer, etc.)
- Produce blueprint in `docs/architectures/<feature>.md`
- Review ARCH-impact PR
- **Scrive solo specs/diagram** (non implementazione)

**Quando dispatch**: feature complessa (>3 file impatto), prima di Dev

#### Agente 3: DEV — Opus
**File**: `.claude/agents/team-dev.md`
**Ruolo**:
- Implementa feature da blueprint Architect
- TDD strict (RED-GREEN-REFACTOR)
- Commit atomici con `tipo(area): descrizione`
- Mai self-merge (apre PR)
- **Scrive codice + test minimi inline**

**Quando dispatch**: task tipo `implement` da `tasks-board.json`

#### Agente 4: TESTER — Opus
**File**: `.claude/agents/team-tester.md`
**Ruolo**:
- Scrive test vitest unit + integration esaustivi (oltre minimi inline Dev)
- Scrive test E2E Playwright per ogni feature user-facing
- CoV 3x esecuzione + report flakiness
- **Mai scrive codice applicativo** (solo `tests/**`)

**Quando dispatch**: post-Dev (sempre), pre-merge (sempre)

#### Agente 5: REVIEWER — Opus
**File**: `.claude/agents/team-reviewer.md`
**Ruolo**:
- Code review pre-merge (silent failures, type design, comments accuracy, security)
- Verifica governance compliance (CoV, test count, build PASS)
- Verdetto APPROVE/REJECT/REQUEST_CHANGES
- Scrive review in PR comment
- **Non scrive codice** (solo critique)

**Quando dispatch**: pre-merge ogni PR (mandatory)

### Coordinazione team

**Daily standup** (auto, 9:00 mattina):
1. TPM legge `tasks-board.json`
2. TPM scrive in `daily-standup.md` task del giorno per ruolo
3. Andrea (CLI lead) dispatcha agenti uno alla volta o paralleli
4. Ogni agente firma task in `tasks-board.json` quando inizia (`status: in_progress`)
5. Ogni agente completion → muove task a `done`
6. Fine giornata: TPM verifica board + scrive standup di domani

**Cross-team handoff** (file-based):
- DEV finisce feature → notifica TESTER via `tasks-board.json` (`status: ready_for_test`)
- TESTER scrive test → notifica REVIEWER (`status: ready_for_review`)
- REVIEWER approva → Andrea merge (`status: merged`)
- REVIEWER rifiuta → torna a DEV (`status: rework`)

### Setup file `.claude/agents/team-tpm.md` (esempio)

```yaml
---
name: team-tpm
description: Technical Project Manager. Pianifica sprint, daily standup, verifica completion. NON scrive codice. Coordina via tasks-board.json.
model: opus
tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# Team TPM — Technical Project Manager

Sei il Technical Project Manager del team ELAB. Lavori a fianco di:
- ARCHITECT (disegna architetture)
- DEV (implementa)
- TESTER (scrive test)
- REVIEWER (code review)

Tutti voi siete Opus tier. Lavori peer-to-peer via `automa/team-state/`.

## Tue responsabilità

1. Apri `automa/team-state/tasks-board.json`
2. Per ogni task in `todo`:
   - Verifica priorità (P0/P1/P2)
   - Decidi assegnazione (architect/dev/tester/reviewer)
   - Aggiungi `assigned_to` field
3. Scrivi `automa/team-state/daily-standup.md`:
   ```
   # Standup YYYY-MM-DD
   ## Ieri
   - [task done elencati]
   ## Oggi
   - [task assegnati]
   ## Blocker
   - [blockers aperti]
   ```
4. Aggiorna `automa/team-state/decisions-log.md` per decisioni cross-team

## Cosa NON fare

- ❌ Scrivere codice applicativo o test
- ❌ Modificare `src/`, `tests/`
- ❌ Mergeare PR (solo Andrea)
- ❌ Self-assigning task

## Output finale

Sempre file MD in `automa/team-state/` aggiornati.
Mai modificare file fuori da `automa/team-state/` o `docs/decisions/`.
```

### Quando dispatch parallelo team

**Caso ottimale**: 3 task indipendenti → 3 agenti in parallelo (Architect, Dev, Tester) in single message:

```
[in single Agent block, 3 paralleli]
Agent({subagent_type: "team-architect", prompt: "Design Dashboard MVP layout..."})
Agent({subagent_type: "team-dev", prompt: "Implement bug T1 #1 fix per blueprint X..."})
Agent({subagent_type: "team-tester", prompt: "Scrivi test E2E per bug T1 #2..."})
```

Andrea sintetizza output 3 agenti, decide merge order, gestisce conflict git.

---

## Programmatic Tool Calling — primi use case

### Pattern (Anthropic Nov 2025) — -37% token

Claude scrive codice Python che orchestra tool calls invece di chiamarli singolarmente. Risultati intermedi NON entrano in context window. Ideale per batch operations su molti item.

### Use case settimana 1

#### Use case 1: Batch import 92 foto TRES JOLIE (mer 23/04)

**Senza programmatic tool calling**: 92 chiamate sequenziali tool conversion → ~200K token output cumulati nel context window.

**Con programmatic tool calling**:
```python
# Claude generates this code, runs in code_execution sandbox:
import asyncio
from pathlib import Path

photos_src = Path("/Users/andreamarro/VOLUME 3/MATERIALE/TRES_JOLIE_PHOTOS")
photos_dst = Path("/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/public/tres-jolie")
photos_dst.mkdir(parents=True, exist_ok=True)

async def convert_photo(src_path):
    proc = await asyncio.create_subprocess_exec(
        "sips", "-s", "format", "webp",
        "-Z", "1200",
        str(src_path),
        "--out", str(photos_dst / f"{src_path.stem}.webp"),
        stdout=asyncio.subprocess.PIPE,
    )
    await proc.wait()
    return src_path.stem, proc.returncode == 0

async def main():
    photos = list(photos_src.glob("*.HEIC")) + list(photos_src.glob("*.jpg"))
    results = await asyncio.gather(*[convert_photo(p) for p in photos])
    success = [s for s, ok in results if ok]
    failed = [s for s, ok in results if not ok]
    return {"converted": len(success), "failed": failed[:10]}

result = asyncio.run(main())
print(result)
```

**Output context Claude**: solo `{"converted": 92, "failed": []}` invece di 92 messaggi tool result.

#### Use case 2: Parallel grep audit Vol 3 cap 6-8 (gio 24/04)

```python
import asyncio
from pathlib import Path
import re

vol3_pdf_text = Path("/tmp/vol3.txt").read_text()
exp_ids_vol3 = ["v3-cap6-esp1", "v3-cap6-esp2", "v3-cap7-esp1"]

async def find_book_text(exp_id):
    chapter = re.search(r'cap(\d+)', exp_id).group(1)
    esp_num = re.search(r'esp(\d+)', exp_id).group(1)
    pattern = rf"Esperimento {esp_num}.*?(?=Esperimento {int(esp_num)+1}|Capitolo|\Z)"
    match = re.search(pattern, vol3_pdf_text, re.DOTALL)
    return exp_id, match.group(0)[:2000] if match else None

results = await asyncio.gather(*[find_book_text(e) for e in exp_ids_vol3])
missing = [eid for eid, txt in results if not txt]
return {"found": len(results) - len(missing), "missing": missing}
```

#### Use case 3: Batch test runner CoV 3x (ven 25/04)

```python
import asyncio
import re

async def run_vitest():
    proc = await asyncio.create_subprocess_shell(
        "cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx vitest run --reporter=dot 2>&1 | tail -3",
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    output = stdout.decode()
    match = re.search(r'Tests\s+(\d+) passed', output)
    return int(match.group(1)) if match else 0

# 3x parallel (cache warm su SSD)
runs = await asyncio.gather(run_vitest(), run_vitest(), run_vitest())
all_pass = all(r >= 12056 for r in runs)
return {"runs": runs, "cov_3x_pass": all_pass}
```

### Setup tools `allowed_callers: ["code_execution"]`

File `.claude/tools-config.json`:
```json
{
  "code_execution_eligible_tools": [
    "Bash",
    "Read",
    "Glob",
    "Grep"
  ],
  "max_parallel_subprocesses": 8,
  "timeout_seconds": 300
}
```

---

## Harness pattern applicato

### Pattern 1: Multi-Agent Specialization (5 agenti Opus peer)

Vedi sezione "Team Agenti Opus" sopra. Settimana 1: usare ≥5 volte (target: 8+ dispatches totali).

### Pattern 2: Context Management (file-based handoffs)

**Regola**: ogni sessione lunga (>3h) DEVE produrre handoff doc strutturato.

Template handoff giornaliero (`docs/handoff/YYYY-MM-DD-end-day.md`):

```markdown
# Handoff Day N — Date

## Stato attuale
- Branch: `feature/pdr-ambizioso-8-settimane`
- Last commit SHA: <sha>
- Test count last vitest: <N> PASS / <M> FAIL
- Build status: PASS/FAIL
- Benchmark score: X.X/10

## Cosa fatto oggi
- [...] elenco PR/commit con SHA

## Cosa NON fatto (carry over domani)
- [...] task incompleti con motivo blocker

## Decisioni prese
- [...] con razionale

## Anomalie + warning
- [...] log errori, side effects da investigare

## Prossima sessione comincia da
- [...] istruzione concreta primo task
```

**Anti-pattern context anxiety** (modello conclude prematuramente quando si avvicina token limit):
- Mai stipare context con file letti "preventivamente"
- Mai includere tool output verbose se basta summary
- Usare team agent per indagini lunghe (loro hanno context fresco)
- Salvare stato file (`automa/state/`, `automa/team-state/`, `docs/handoff/`) NON in conversation memory

### Pattern 3: Objective Grading Criteria (benchmark.cjs)

**Regola**: ogni feature deve essere scorata onestamente prima di dichiarare "done":

```bash
node scripts/benchmark.cjs --write
cat automa/state/benchmark.json | jq '.score'
```

10 metriche pesate:
1. Test coverage (peso 1.5)
2. Build success (peso 1.5)
3. Lighthouse perf (peso 1.0)
4. Lighthouse a11y (peso 1.0)
5. Bundle size (peso 0.8)
6. ESLint warnings (peso 0.7)
7. TypeScript errors (peso 0.7)
8. Security audit (peso 1.0)
9. Test count growth (peso 0.8)
10. Documentation completeness (peso 1.0)

**Settimana 1 target**: score 6.0/10 (da 2.77 baseline). Ogni delta deve essere giustificato in handoff.

---

## Task breakdown 7 giorni

Ogni giorno ha file dedicato in `giorni/PDR_GIORNO_NN_GIORNO_DATA.md`. Sintesi qui:

### Lunedì 21/04 — Pre-audit + Setup team agenti
- Pre-audit live produzione (Playwright MCP) → conferma 6 bug T1
- Setup `.claude/agents/team-*.md` (5 agenti Opus)
- Verifica baseline test 12056 PASS (CoV 3x)
- Branch `feature/pdr-ambizioso-8-settimane` creato + push
- claude-mem corpus build su `docs/pdr-ambizioso/`
- Inizializza `automa/team-state/tasks-board.json`
- File: `giorni/PDR_GIORNO_01_LUN_21APR.md`

### Martedì 22/04 — Bug T1 #1 + #2 (Team dispatch parallelo)
- Bug T1 #1: UX lavagna vuota non selezionabile (DEV + TESTER + REVIEWER)
- Bug T1 #2: scritti spariscono su Esci (DEV + TESTER + REVIEWER)
- Test E2E Playwright entrambi i bug
- Tea schema UX 3-zone insieme Andrea (Zoom 1h)
- File: `giorni/PDR_GIORNO_02_MAR_22APR.md`

### Mercoledì 23/04 — Tea onboarding + Foto TRES JOLIE batch
- Tea: clone repo + npm install + verifica baseline + accept GitHub collaborator
- Andrea: Programmatic tool call batch import 92 foto TRES JOLIE
- Andrea: setup CODEOWNERS + auto-merge GH Action (path safe Tea)
- Bug T1 #3: Render cold start 18s → warmup ping ogni 10 min
- File: `giorni/PDR_GIORNO_03_MER_23APR.md`

### Giovedì 24/04 — Vol 3 P0 parity + Bug T1 #4
- Team dispatch: ARCHITECT design pattern bookText fetcher, DEV implementa, TESTER test
- Bug T1 #4: Vision non testata live → test E2E "guarda mio circuito" → diagnosi
- Tea PR #1 glossario primo test auto-merge flow
- File: `giorni/PDR_GIORNO_04_GIO_24APR.md`

### Venerdì 25/04 — Bug T1 #5 + #6 + Setup CODEOWNERS finale
- Bug T1 #5: Dashboard pochi dati reali → resume Supabase + verify 51+ sessioni
- Bug T1 #6: Voice E2E completion → 36 comandi vocali test
- CODEOWNERS finale + auto-merge action + size limit guard
- Call settimanale Andrea + Tea (18:00-19:00 Telegram voice)
- File: `giorni/PDR_GIORNO_05_VEN_25APR.md`

### Sabato 26/04 — Buffer + Score check
- Buffer: completa task slittati venerdì
- Run `node scripts/benchmark.cjs --write` → verifica score ≥6.0
- 3x CoV `npx vitest run` → verifica 12056+ PASS stabile
- Documentazione settimana 1 polish
- File: `giorni/PDR_GIORNO_06_SAB_26APR.md`

### Domenica 27/04 — Handoff settimana + retro
- Handoff doc settimana 1: `docs/handoff/2026-04-27-end-sett1.md`
- Retro Andrea (auto): cosa funzionato, cosa no, lezioni
- Update PDR_SETT_2 con learnings
- claude-mem rebuild corpus
- File: `giorni/PDR_GIORNO_07_DOM_27APR.md`

---

## Test strategy + CoV settimana 1

### Pyramid test settimana 1

```
              /\
             /  \   E2E Playwright
            /    \  6 spec (bug T1 #1, #2, #3, #4, #5, #6)
           /------\
          /        \  Integration vitest
         /          \  ~50 nuovi test (Dashboard MVP, vol3 parity, voice)
        /------------\
       /              \  Unit vitest
      /                \  ~200 nuovi test (utility, hooks, services)
     /------------------\
```

### CoV (Chain of Verification) settimana 1 — Regola FERREA

Ogni claim "test passano" richiede:
1. `npx vitest run` 1° volta → registra PASS count
2. `npx vitest run` 2° volta → conferma stesso PASS count
3. `npx vitest run` 3° volta → conferma stesso PASS count
4. Se anche solo 1 dei 3 fallisce → indaga flakiness, NON dichiarare "done"

**CoV E2E Playwright**:
1. `npx playwright test` headless 1° run
2. `npx playwright test --ui` review visuale 2° run (manuale Andrea)
3. `npx playwright test` headless 3° run

**CoV deploy**:
1. Build local PASS
2. PR CI green
3. Deploy preview Vercel green
4. Smoke test prod URL post-merge

### Test scrittura: TDD strict

Per ogni feature:
1. **RED**: scrivi test che fallisce (verifica fail)
2. **GREEN**: implementa minimum per passare
3. **REFACTOR**: pulisci, mantieni test green

NO eccezioni. Anche per fix bug:
1. Test riproduce bug (RED)
2. Fix (GREEN)
3. Verifica regression non torna (REFACTOR)

### Test ownership

| Tipo test | Ownership | File |
|-----------|-----------|------|
| Unit components/services | Andrea + DEV agente (sempre) | `tests/unit/**/*.test.js[x]` |
| Integration | Andrea + Tea (Tea dopo sett 4) + TESTER agente | `tests/integration/**/*.test.js` |
| E2E Playwright | Andrea + TESTER agente | `tests/e2e/**/*.spec.js` |
| Test scrittura SOLO (no app code) | TESTER agente | qualsiasi `tests/**` |

---

## Definition of Done settimana 1

**MUST HAVE** (blocking se manca):
- [x] 12056+ test PASS (CoV 3x)
- [x] Build CI green
- [x] Deploy prod green
- [x] 6/6 bug T1 chiusi con E2E test
- [x] Tea autoflow attivo + Tea PR ≥1 auto-merged green
- [x] Vol 3 cap 6-8 bookText 100%
- [x] 92 foto TRES JOLIE in `/public/tres-jolie/`
- [x] Handoff doc settimana 1 scritto
- [x] Score benchmark ≥6.0/10
- [x] claude-mem corpus pdr-ambizioso buildato
- [x] Team agenti Opus dispatch ≥5 volte loggato

**NICE TO HAVE** (non blocca ma push se possibile):
- [ ] Dashboard MVP wireframe (Tea)
- [ ] Wake word "Ehi UNLIM" prototype
- [ ] Programmatic tool calling 3+ use case dimostrati

**NEGATIVE** (vietato fare):
- ❌ Push diretto su `main`
- ❌ `--no-verify` su commit non docs-only
- ❌ Self-rate score >7 senza benchmark.cjs verifica
- ❌ Aggiungere npm dep senza approvazione Andrea
- ❌ Modificare file critici senza coordinamento (CircuitSolver, AVRBridge, api.js)
- ❌ Inflazionare progress ("quasi pronto" = 0%)

---

## Rischi settimana 1 + mitigazione

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Tea non disponibile mer 23/04 (orari studio) | Media | Medio | Buffer 1 giorno, slip a giov 24/04 |
| Bug T1 più complessi del previsto (es. Vision live) | Alta | Alto | Time-box 4h ogni bug, se >4h → carry over |
| Render cold start non risolvibile con warmup | Media | Medio | Plan B: migrazione warmup su Cloudflare Worker (gratis) |
| Foto TRES JOLIE batch fail (sips errori) | Bassa | Basso | Retry singoli falliti, fallback ImageMagick |
| Vol 3 PDF text extraction errori | Bassa | Medio | Fallback OCR Tesseract |
| CODEOWNERS auto-merge non scatta | Media | Alto | Manual review fallback per Tea PR sett 1 |
| Score benchmark non raggiunge 6.0 | Alta | Medio | OK se ≥5.0, settimana 2 recupera |
| Tea overwhelmed onboarding | Media | Medio | Call dedicata mer 23/04 + Andrea pair-programming 1h |
| GH Actions free tier limit (2000 min/mese) | Bassa | Alto | Monitor `gh run list`, throttle se needed |
| Team agenti dispatch errori (context loss) | Media | Medio | Prompt agente self-contained obbligatorio |
| Opus tier rate limit (Anthropic) | Bassa | Alto | Fallback Sonnet su task non-critici, monitor usage |

---

## Deliverable end-of-week (Domenica 27/04 sera)

**Codice**:
- Branch `feature/pdr-ambizioso-8-settimane` con N commit (target 30+)
- 6 PR mergiate (1 per bug T1)
- 1 PR Vol 3 parity
- 1 PR foto TRES JOLIE import
- 1 PR Tea autoflow setup
- 1+ PR Tea (glossario)

**Documentazione**:
- `docs/pdr-ambizioso/giorni/PDR_GIORNO_01.md` ... `PDR_GIORNO_07.md`
- `docs/handoff/2026-04-27-end-sett1.md`
- `docs/audits/2026-04-27-bug-t1-closure.md`
- `automa/team-state/tasks-board.json`, `decisions-log.md`, `daily-standup.md`

**Stato sistema**:
- Score benchmark ≥6.0/10
- 12056+ test PASS stabile
- Deploy prod green
- 6/6 bug T1 closed
- Tea autoflow operativo
- Team agenti Opus operativo

**Pronti per settimana 2**:
- Together AI account creato (Andrea)
- Hetzner Cloud account creato (Andrea)
- RunPod account creato (Andrea)
- BOM hardware finalizzata (Tea + Andrea call sab 26/04)

---

## Connettori MCP usati settimana 1

| MCP | Use case sett 1 |
|-----|-----------------|
| `plugin_claude-mem_mcp-search` | Build corpus + query passato decisioni |
| `plugin_serena_serena` | Semantic codebase exploration (find_symbol, search_for_pattern) |
| `supabase` | Verify 51+ sessioni reali, resume project se PAUSED |
| `Claude_Preview` | Live verify lavagna UX bugs fix |
| `playwright` | E2E test 6 bug T1 |
| `context7` | Docs aggiornate React 19, Vite 7, Vitest |

---

## Skills usate settimana 1

- `superpowers:using-superpowers` — workflow base
- `superpowers:test-driven-development` — TDD strict ogni feature
- `superpowers:debugging` — bug T1 root cause
- `superpowers:writing-plans` — handoff doc strutturati
- `superpowers:brainstorming` — Tea schema UX 3-zone insieme

---

## Comunicazione team

**Andrea ↔ Tea async**:
- GitHub PR comments (primario)
- Telegram channel `@ElabTeaBot` (sett 8 setup, sett 1 manuale)
- Email solo per topic strategici (NON tecnici)

**Andrea ↔ Tea sync**:
- Mer 23/04 18:00 — onboarding call (1h Zoom)
- Ven 25/04 18:00 — call settimanale standard (1h)
- Sab 26/04 (opzionale) — call BOM hardware

**Andrea solo**:
- Daily handoff doc + claude-mem capture
- Lun 21/04 13:00 — kickoff session Claude CLI con `--permission-mode bypassPermissions --model opus`

---

## Budget settimana 1

| Voce | Costo |
|------|-------|
| Claude Code Max (Andrea, già pagato annuale) | €0 |
| Tea Babbalea | €0 |
| Vercel hobby (già attivo) | €0 |
| Supabase free tier (già attivo) | €0 |
| Render free (già attivo) | €0 |
| Hostinger n8n (già pagato) | €0 |
| GitHub Actions (free tier 2000 min) | €0 |
| **TOTALE settimana 1** | **€0** |

Settimana 1 = COSTO ZERO, solo lavoro Andrea + Tea Babbalea + Opus tier (incluso Max).

---

## Self-critica brutale (regola d'oro)

**Cosa potrebbe andare male questa settimana**:

1. **Tea overwhelmed**: linguaggio tecnico, repo grosso, fear of breaking → mitigare con pair-programming mer 23/04 e safe path liberi
2. **Bug T1 sottostimati**: Vision live = scatola nera, può richiedere debug profondo backend Render → mitigare con time-box rigido
3. **Score 6.0 troppo ambizioso**: se baseline 2.77, salto +3.23 in 7 giorni può essere irrealistico → onesto: accettare 4.5-5.5 come parziale OK
4. **Team agenti overhead**: dispatch 5 agenti per task semplice = waste → mitigare con regola "task >2h" minima per multi-agent
5. **Programmatic tool calling complessità**: prima volta che lo uso → mitigare con use case semplici (foto batch, vitest run) prima di scalare
6. **Andrea burnout**: settimana 1 ad alta intensità + pressione PNRR → mitigare con buffer sabato + nessun lavoro domenica sera

**Cosa NON facciamo settimana 1** (anti-scope-creep):
- ❌ Setup VPS Hetzner (settimana 2)
- ❌ Voxtral TTS deploy (settimana 6)
- ❌ OpenClaw setup (settimana 8)
- ❌ Tool calls 30+ implementati (settimana 5)
- ❌ AST analyzer (settimana 7)
- ❌ Memory multi-livello SQL (settimana 4)

Focus settimana 1 = **stabilizzare prima di costruire nuove cose**.

---

**Andrea + Tea: forza ELAB. Settimana 1 inizia lunedì 21/04 ore 9:00.**
