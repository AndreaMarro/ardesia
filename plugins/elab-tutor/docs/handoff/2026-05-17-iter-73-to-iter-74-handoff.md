# Iter 73 → 74 handoff — Andrea direttiva massima autonomia 2026-05-17 PM

## Iter 73 close state

- **Score ONESTO G45 cap**: 9.0/10
- **6 commits batch pushed origin** (cdb37734→5ae782ad range): STEP 5 + 5b + housekeeping + CC-2 + F1+F2+F3 + Phase 4 close
- **Vitest baseline**: 14358 PASS preserved + synced `automa/baseline-tests.txt` 13517 → 14358
- **Disk MacBook**: 6.1Gi stable
- **Matrix prod**: 996/1000 99.6% offtopic ZERO fail (iter 70 PHASE 9 baseline preserved)

## Iter 74 mandate Andrea verbatim

> "in iter 74 lavora ancora su cross compilazione e in parallelo:
> 1. Components transition cliffhanger CTA wire ScratchCompileBar + CompileUploadButton + AlbumStudente
> 2. cliffhanger-table audit runtime usage decide format
> 3. BuildModeGuide passo-passo iter 36 PM regression fix
> 4. Vol1/Vol2 coupled-title 33 drifts cleanup script
> 5. Tea T1-T5 review status check (Andrea ping Tea OR Mac Mini delegate)
> 6. USB Web Serial port detection NewElabSimulator
> 
> + in parallelo usare plugin impeccable per migliore ui e ux generale di tutto il sito
> + finito tutto questo mappare il sito in ogni sua componente e in ogni sua dimensione e fare fix e debug
> + Documenta tutto e usa /mem-search per orientarti
> + Usa tutte le risorse disponibili e orchestrale al meglio
> + Controlla che funzionino, interagiscano, si correggano e non abbiano conflitti
> + usare macmini codex macbook
> + usa /skill-creator /skill-creator-doctor /writing-skills per creare/migliorare skill o plugin
> + NON COMPIACENZA, MASSIMA SCIENTIFICITà, NON MENTIRE, NON SALTARE NESSUN PASSAGGIO
> + LAVORA IN COMPLETA AUTONOMIA RICORDA I CONNETTORI CONTROL CHROME CLAUDE IN CHROME CONTROL DESKTOP MACOS CONTROL MAC GIT HUB VERCEL
> + DOCUMENTA TUTTO, IMPARA DAGLI ERRORI: NO REGRESSIONI. NO REGRESSIONI.
> 
> FINITO ITER 74 CREA ITER 75 e fai tutto in completa autonomia basandoti sulle esigenze. NO DEBITO TECNICO, MASSIMO ORDINE."

## TRACK A — Cross-compile follow-up (Codex MED gaps + hardware UAT prep)

| Atom | Scope | Effort | Approach |
|---|---|---|---|
| A1 | Move install script `/scripts/setup-elab-compile-agent.sh` → `public/scripts/` OR replace with `/setup-elab-agent` route | ~30min | Inline |
| A2 | Footer link a11y outline restore `outline:2px solid currentColor` | ~10min | Inline |
| A3 | ScratchCompileBar emoji status → SVG ElabIcons SuccessIcon/ErrorIcon/PlayIcon | ~1h | Inline |
| A4 | Real hardware UAT prep docs (Andrea/Tea/Riccardo guide refresh) | ~30min | Inline |
| A5 | R5 banner real Chrome verify + ELAB Agent bind 0.0.0.0 audit | ~30min | Inline + control_chrome connector |

## TRACK B — Narrative-first 6 atoms (Andrea principio + iter 72.5 CORRECTION)

| Atom | Scope | Effort | Approach |
|---|---|---|---|
| B1 | Components transition cliffhanger CTA wire ScratchCompileBar + CompileUploadButton + AlbumStudente (compile/upload/save success → "Ragazzi pronto per [next]?") | ~2h | BG subagent frontend-developer worktree isolato OR inline |
| B2 | cliffhanger-table audit runtime usage decide format (deprecate dead service OR wire transitions) | ~30min | Inline |
| B3 | BuildModeGuide passo-passo iter 36 PM regression fix | ~2h | BG subagent OR inline |
| B4 | Vol1/Vol2 coupled-title 33 drifts cleanup script (Mac Mini drift list ready /tmp/mm-vol12-drifts.json) | ~30min | Mac Mini delegate OR inline script |
| B5 | Tea T1-T5 review status check | ~5min Andrea | Andrea direct OR Mac Mini SSH ping Tea |
| B6 | USB Web Serial port detection NewElabSimulator (iter 72 BG-A7 port=null follow-up) | ~2h | BG subagent OR inline |

## TRACK C — UI/UX impeccable plugin parallel

**Skills suite** Andrea mandate:
- `/clarify /critique /impersonatore-utente /react-state-management`
- `/ui-design:design-review /ui-design:create-component /ui-design:accessibility-audit /ui-design:design-system-setup`
- `/adapt /animate /arrange /bolder /clarify /colorize /delight /distill /extract /normalize /onboard /optimize /polish /quieter /typeset elab style`

**Approach**: spawn BG subagent ui-designer with full skill suite mandate. Worktree isolato. Focus systematic site overhaul.

## TRACK D — Mac Mini parallel tasks bash-native

Mac Mini PID 88901 launchctl daemon. JSONL queue `.command` field. NO codex (not installed Mac Mini).

Iter 74 candidate tasks:
- Vol3 narrative chain verify all 14 esperimenti
- Lighthouse perf audit each route (~5min each)
- Playwright spec discovery audit (~10min)
- 92 esperimenti broken Playwright audit (~8-10h subagent OR Mac Mini delegate Andrea iter 21 carryover)
- Fumetto schema canonical Tea materials verify (`/VOLUME 3/TEA/Nuovo lavoro tea/fumetto_schema.json`)

## TRACK E — Codex BG Pattern V/C verify each major change

GPT-5.5 high single sequential dispatch (CLAUDE.md iter 70 PHASE 4 lesson). 4 profiles:
- verify (medium read-only)
- review (high read-only) 
- implement (high workspace-write)
- research (high network + workspace-write)

Pattern V: read-only audit pre-merge
Pattern C: cross-check verify+impl convergence
Pattern R: review pre-PR

## TRACK F — Site mapping comprehensive + debug systematic

**Skills suite**:
- `/debug /debugging-strategies /debugging-toolkit:smart-debug /parallel-debugging /systematic-debugging`

**Approach**: post-execution tracks A-E. Comprehensive route audit + component audit + dimension audit + interaction audit + fix cascade.

## TRACK G — Skill/plugin creator + eval new skills ELAB workflow

**Skills suite**:
- `/skill-creator /skill-creator-doctor /writing-skills /plugin-creator /plugin-settings /plugin-eval:eval`

**Candidate new skills ELAB-specific**:
1. `elab-cross-compile-verify` — automate compile chain test Nano R4 software-side
2. `elab-narrative-arc-audit` — verify lesson-paths next_experiment consistency
3. `elab-codex-pattern-c` — orchestrate Codex BG verify post-commit auto
4. `elab-mac-mini-dispatch` — bash-native task queue helper
5. `elab-impeccable-site-overhaul` — UI/UX systematic skill chaining

## Connettori usare Andrea mandate

- Control Chrome (mcp__Control_Chrome) — local Chrome navigate + click + JS exec
- Claude in Chrome (mcp__Claude_in_Chrome) — full browser MCP suite
- Control Desktop / Control your Mac (mcp__computer-use, mcp__Macos, mcp__Control_your_Mac) — desktop apps automation
- GitHub MCP — PR + issue + checks (auth pending)
- Vercel MCP (mcp__vercel) — deploy + env + logs

## Iter 75 auto-create mandate Andrea

"FINITO ITER 74 CREA ITER 75 e fai tutto in completa autonomia basandoti sulle esigenze."

Iter 75 atom plan auto-generation based:
- Iter 74 deliverables outcomes
- Codex Pattern V verify findings iter 74
- Mac Mini parallel findings iter 74
- UI/UX impeccable findings iter 74
- Site mapping findings iter 74
- Open carryover from iter 73 (94 esperimenti audit + narrative wire complete + ...)

## Score targets iter 74 + 75

- Iter 74 close target: **9.2-9.4/10 ONESTO** conditional all tracks + Codex verify + zero regressions
- Iter 75 close target: **9.5-9.7/10 ONESTO** conditional iter 74 + site mapping + skill creator + ITER 75 autonomous Andrea audit
- Sprint U close projection iter 76+: 9.7+/10 conditional Vol3 Davide co-author + 94 esperimenti audit + Opus indipendente review G45

## Activation iter 74

```
Iter 74 entrance ELAB Tutor Andrea direttiva massima autonomia.
6 commits iter 73 batch pushed origin HEAD 5ae782ad.

Mandate: NO COMPIACENZA + MASSIMA SCIENTIFICITà + NON MENTIRE + 
NON SALTARE PASSAGGI + AUTONOMIA COMPLETA + CONNETTORI tutti + 
DOCUMENTA TUTTO + IMPARA DAGLI ERRORI + NO REGRESSIONI + 
NO DEBITO TECNICO + MASSIMO ORDINE.

7 TRACKS parallel orchestrate:
- TRACK A cross-compile follow-up MED gaps + hardware UAT prep
- TRACK B 6 narrative atoms 1+2+3+4+5+6 Andrea direttiva
- TRACK C UI/UX impeccable plugin suite
- TRACK D Mac Mini parallel tasks bash-native
- TRACK E Codex BG Pattern V/C verify each major change
- TRACK F site mapping comprehensive + debug systematic
- TRACK G skill/plugin creator + eval new ELAB skills

Resources: orchestrator inline + BG subagents (frontend-developer, 
ui-designer, test-automator) + Mac Mini SSH + Codex GPT-5.5 high.

Pattern S r3 race-cond fix file ownership rigid + filesystem barrier 
+ Codex Pattern C cross-check.

ITER 75 auto-start post iter 74 close Andrea autonomy mandate.
```
