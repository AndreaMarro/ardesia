# ELAB Tutor — iter 58 → iter 59 handoff

> iter 58 close = Phase 1 of A4.1e (3 surgical edits) + 50 inspiration links delivered + mBlock Workstream C recon delivered + Codex feasibility verdict (skip live-terminal, use codex-bg.sh). Score ONESTO G45 = **8.0/10**.
> iter 59 entrance = Andrea ratify queue 8 items + Phase 2 execute + Workstream B start.

---

## §1 Activation string iter 59 (paste-ready)

```
Continua ELAB Tutor iter 59. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix, HEAD <commit-iter58-close>.

━━ PRIMA AZIONE ━━
1. CoV entrance: npx vitest run = 13118/0, node scripts/epic1/validate-lesson-paths.mjs = 94/94/0/0/0, npm run build exit 0.
2. Leggi docs/audits/2026-05-15-iter-58-PHASE1-close-audit.md + docs/handoff/2026-05-15-iter-58-to-iter-59-handoff.md.
3. Andrea ratify queue 8 voci (§3 handoff) — chiedi decisioni a/b/c per ogni voce PRIMA di toccare codice.

━━ MANDATO ANDREA (verbatim) ━━
"Esperimenti su arco narrativo continuo, NON spezzettati card flat scollegate. Parità totale volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Morfismo Sense 2 = moat non copiabile."
"Segui il libro e rendi il programma più fruibile e semplice possibile."

━━ LAVORO iter 59 (post Andrea ratify) ━━
P0. Phase 2 execute ratified items (queue §3): v3-cap9 orphan + capitoli titles align + v3-cap6 pages + Vol2 Cap.11 + narrative-map.json design.
P1. Workstream B start — linguaggio codemod 200 violations singolare→plurale (Sprint U Cycle 1 already audited 73 lesson-paths + 91 teacher_messages, ready to execute).
P1. Workstream B item 5 — 92 esperimenti Playwright UNO PER UNO entry (broken count REAL anti-G45 evidence). Use elab-harness-real-runner skill.
P2. Workstream C mBlock — Andrea ratify Path A/B/C (recon delivered iter 58 in docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md, recommended Path C Hybrid 3-5 FTE-weeks).
P2. Workstream D plan refinement — Mission Runner Phase 1 implementation scope (PLAN-unlim-prof-pilot-chatgpt.md Phase 1+2).

━━ ANTI-REGRESSIONE FERREO ━━
Baseline 13118. 4-gate per ogni commit (vitest + build + validator + Codex). MAI --no-verify, MAI push main, MAI git stash, MAI git add -A. Re-baseline test count SOLO con prova aritmetica.

━━ CODEX (mandate) ━━
scripts/dev/codex-bg.sh <task> --profile verify "<prompt 4-elementi: GOAL / CONTEXT @file / CONSTRAINTS (read-only, NO heredoc, NO read SKILL.md, path stretti) / DONE>". Pattern C-V ad ogni commit. Live-terminal SKIP (iter 58 Codex verdict: codex-bg.sh sufficient, auditable, reproducible).

━━ NON COMPIACERE ━━
Onestà sopra comodità. Niente score gonfiati. iter 58 Phase 1 = 3/7 sub-items A4.1e (4 deferred Andrea ratify). iter 59 score target 8.5/10 ONESTO post Phase 2 execute + Workstream B start.
```

---

## §2 iter 58 close state (authoritative)

### Done iter 58:
| # | Deliverable | File:line | Verifier |
|---|---|---|---|
| 1 | `v3-cap7.json` intro_text fix (Ch7 verbatim title) | `src/data/capitoli/v3-cap7.json:688` | Codex CONFIRM `/tmp/codex-iter58-phase1-verify.txt` |
| 2 | `v3-cap6.json` morse num 8→3 (book-canonical ESP3) | `src/data/capitoli/v3-cap6.json:503` | Codex CONFIRM + side effect: `percorsoGenerator.js:127` orders by num → display book-canonical |
| 3 | `v3-cap6.json` semaforo num 9→5 (book-canonical ESP5) | `src/data/capitoli/v3-cap6.json:679` | Codex CONFIRM |
| 4 | 50 inspiration links 10 categorie × 5 (Andrea handoff §7) | `docs/research/2026-05-15-iter-58-inspiration-50.md` | Subagent verified all 50 URLs via WebSearch (May 2026), 3 standout: ProgrammaIlFuturo.it / Khanmigo / Ink-Inkle |
| 5 | mBlock Workstream C recon (Andrea iter-58 pivot directive) | `docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md` | Subagent — Path C Hybrid 3-5 FTE-weeks raccomandato; 9 Blockly files + 23 blocks + 48 codegen entries; mBlock Web Editor NOT compatible with .mext (desktop only) |
| 6 | Codex feasibility recon live Claude↔Codex | `/tmp/codex-iter58-feasibility-claude-codex-live.txt` | Codex verdict: SKIP live-terminal, codex-bg.sh sufficient + auditable + reproducible |
| 7 | iter 58 Phase 1 close audit | `docs/audits/2026-05-15-iter-58-PHASE1-close-audit.md` | Self-authored (this iter), Andrea ratify queue documented |
| 8 | iter 58 → iter 59 handoff (this file) | `docs/handoff/2026-05-15-iter-58-to-iter-59-handoff.md` | Self-authored (this iter) |

### CoV iter 58 close:
- `npx vitest run` = **13118 PASS / 0 failed** (15 skip + 12 todo) — **ZERO regression** vs iter-57 entrance baseline 13118 ✔
- `node scripts/epic1/validate-lesson-paths.mjs` = **94 pass · 0 fail · 0 unresolved refs · 0 cyclic** ✔
- `npm run build` NOT re-run iter 58 Phase 1 (~14min heavy, defer iter 59 entrance pre-commit gate)
- Codex Phase 1 verify diff: **3/3 CONFIRM**, NO material regression risk

### Pattern S race-cond fix iter 58:
N/A iter 58 — single Claude autonomous + 3 BG subagent (general-purpose × 2 + codex-bg.sh × 1). No multi-agent write conflict. File ownership rigid (Claude: src/data/capitoli/ + docs/, subagent 1: docs/research/inspiration, subagent 2: docs/research/mblock). Pattern C-V (Claude leads + Codex verifies) validated × 2 (feasibility recon + Phase 1 diff verify).

---

## §3 Andrea ratify queue — 8 voci (iter 59 entrance ~15-30 min)

Numerated from iter 58 close audit §"Honest gaps". Format: voce → decisione richiesta → impatto.

### Voce 1 — `v3-cap9.json` orphan: DELETE vs PRESERVE vs MOVE-to-Bonus
**Decisione**: a) DELETE v3-cap9.json + update 7 consumers (poe-challenges.js + 4 test files + migration script + capitoli/v3-cap9.json) + accetta perdita Simon Says game UI; b) PRESERVE v3-cap9.json + flag come "Extras non in book canon" (current state); c) MOVE Simon Says a "v3-bonus-*" capitoli outside Vol3 narrative chain (preserva game UI, rinomina honest).
**Impatto**: (a) -1 game UI, -7 file edits ~30min; (b) tech debt orphan persists; (c) +1 file edit + 7 consumer updates ~45min, preserva game.
**Andrea raccomandato**: c) MOVE-to-Bonus (preserve game UX + honest naming).

### Voce 2 — `v3-cap6.json` morse + semaforo `volume_ref.page_start`/`page_end`
**Decisione**: applica fix pages morse `5,10` → `57,57` (ESP3 p.57); semaforo `5,10` → `58,58` (ESP5 p.58). Cosmetic ma Morfismo fidelity (UNLIM cita Vol/pag verbatim).
**Impatto**: 2 line edits, vitest preserved, UNLIM citation accuracy +.
**Andrea raccomandato**: APPLY iter 59 Phase 2.

### Voce 3 — `v3-cap6.json` morse + semaforo `title_classe`/`title_docente` align con lesson-path
**Decisione**: applica titoli clean book-faithful (a3-corrections): morse `"SOS in codice Morse"` → `"Esperimento 3: fai un SOS in codice Morse"`; semaforo `"Semaforo 3 LED"` → `"Esperimento 5: il semaforo"`. Allinea con lesson-path top-level title già fissato iter 57.
**Impatto**: 4 line edits (title_classe + title_docente × 2 esperimenti), UI display change minor.
**Andrea raccomandato**: APPLY iter 59 Phase 2.

### Voce 4 — Vol1/Vol2 33 coupled-title cascade (iter-57 deferred)
**Decisione**: schedule dedicated pass iter 59+. Reproducible via node script (iter-57 close §"Honest gaps" item 1). All Vol1/Vol2; zero Vol3. Severity low.
**Impatto**: 33 line edits ~1h, no functional regression (stale label only).
**Andrea raccomandato**: SCHEDULE iter 60 (post Phase 2 Vol3 cleanup completion).

### Voce 5 — Vol2 Cap.11 theory-node (A3 master verdict Open decision 6)
**Decisione**: `src/data/capitoli/v2-cap11.json` exists ma NOT in `CHAPTER_MAP` (chapter-map.js). Sembra theory-only chapter senza lesson-paths. a) MANTIENI theory-only (status quo, defer iter 70+); b) CONVERTI a lesson-paths (richiede a3-corrections entries + lesson-path JSON files).
**Impatto**: (a) zero cost; (b) ~2-3h scope iter 59+.
**Andrea raccomandato**: a) MANTIENI theory-only iter 59. Re-evaluate iter 70+ post Vol3 complete.

### Voce 6 — Transition prose `text_classe`/`text_docente_action` cleanup (iter-57 deferred item 2)
**Decisione**: applica prose pass su `v3-cap6.json`+`v3-cap7.json`+`v3-cap8.json` transitions per re-author old chain order text. Could be Tea task T2 (gia in iter-58-brief-tea.md per Ch8 refactor draft).
**Impatto**: ~6-10 transition entries edit ~1-2h. Editorial, ungated.
**Andrea raccomandato**: ASSIGN to Tea iter 59 (T2 estesa) + Claude iter 60 entry post Tea draft.

### Voce 7 — `narrative-map.json` schema design + wire-up
**Decisione**: iter 58 Phase 1 found NO `src/data/narrative-map.json` runtime consumer. Generare dead file = NO value. Decisione: a) DEFINE UI component che lo consumi (Mission Runner narrative arc viewer per PLAN-unlim Phase 3) PRIMA di generare; b) SKIP narrative-map.json + rely su lesson-paths/capitoli + chapter-map.js (current state).
**Impatto**: (a) richiede design ADR + ~4-6h impl iter 59+; (b) zero cost ma `narrative_map_id` field in `comicPromptTemplate.js` resta string identifier only.
**Andrea raccomandato**: b) SKIP iter 59 (zero-cost) — revisita post PLAN-unlim Phase 3 Mission Runner Dual-View design (iter 60-70+).

### Voce 8 — `.test-count-baseline.json` `commit` field hygiene
**Decisione**: bump opportunistico se iter 58 commit changes baseline. iter 58 Phase 1 NOT baseline-changing (13118 preserved). Lascia `commit: bee5e627` invariato OR bump al commit iter 58 close per cleanliness.
**Impatto**: hygiene only.
**Andrea raccomandato**: bump commit field al iter 58 close commit hash post-push.

---

## §4 iter-21+ Andrea mandate carryover (Workstream B/C/D — NOT addressed iter 58 by design)

### Workstream B (iter-21+ mandate critical, multi-iter):
1. **Linguaggio codemod 200 violations singolare→plurale** (`feedback_iter21_mandate_critical.md` + Sprint U Cycle 1 audited 73 lesson-paths + 91 teacher_messages missing "Ragazzi,"). **Inputs ready** Sprint U Cycle 1 audit `docs/audits/sprint-u-cycle1-iter1-audit-vol1-vol2.md` + `sprint-u-cycle1-iter1-audit-vol3.md`. **Estimated**: 4-6h regex codemod + manual review + Codex CONFIRM. **iter 59 P1**.
2. **92 esperimenti Playwright UNO PER UNO** (broken count REALE anti-G45 evidence). Use `elab-harness-real-runner` skill. **Estimated**: ~3-4h initial setup + ~10-20min per esperimento × 92 = ~20h total (multi-iter). **iter 59 P1 entry** (5-10 esperimenti).
3. **Modalità Percorso adattativa + Modalità Passo Passo per OGNI esperimento** (PZ V3 + `feedback_passo_passo_regression_06may2026.md`). Multi-iter. **iter 60+**.
4. **UX/UI overhaul** (impeccable skills + Fusion 360 connector). Multi-iter. **iter 60+**.
5. **Mappare ogni percorso/pulsante + debug** Playwright + Control Chrome MCP. Real prod evidence. **iter 60+**.
6. **API esterne** (ChatGPT Custom GPT + Apps SDK + MCP + Classroom + Teams) per PLAN-unlim Phase 6-8. Multi-iter Workstream D. **iter 70+**.

### Workstream C (mBlock pivot — Andrea ratify path A/B/C required):
- Recon DELIVERED iter 58: `docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md` (240 lines, Path C Hybrid recommended).
- 10 ratify questions D1-D10 for Andrea (recon §C5).
- **CRITICAL risk flagged**: `AVRBridge.js` 1242 LOC emulates ATmega328p only — simulator NOT executing Nano R4 binaries regardless of mBlock decision (12-20 FTE-weeks Cortex-M4 emulator unrelated work).
- **iter 59 entrance**: Andrea ratify Path A/B/C.
- **iter 60+ execute** (post Andrea ratify).

### Workstream D (PLAN-unlim-prof-pilot-chatgpt.md 10 phases):
- Plan-only iter 58 (read full, no execute).
- Phase 1 — Naming + IA + Principio Zero compliance: `~/ELAB/elab-builder/docs/MODALITA-LEZIONE-GUIDATA.md` design doc. **iter 60+**.
- Phase 2-10: Supabase missions data model, Mission Runner Dual-View, Vision breadboard validator (Opus 4.7 only), ChatGPT canali (Custom GPT + Apps SDK + ChatKit), Anthropic Managed Agents Memory + Dreams. **Multi-iter iter 70-100+**.
- **EU residency GAP**: Managed Agents Memory + Dreams NOT GA on Bedrock Frankfurt/Vertex europe-west1 (as of May 2026). **Decision**: prototype US residency beta interna, wait Bedrock EU for school production.

---

## §5 Failure modes iter 58 — riconosci + correggi iter 59

- **Pattern S session resume kill** (iter 12+ mitigation): use filesystem barrier `automa/team-state/messages/` + checkpoint markers se Pattern S multi-agent (NOT needed iter 58 single-Claude).
- **Codex sandbox heredoc block**: usa `node -e "..."` one-liners, MAI `<<'NODE'`.
- **Codex burns run reading SKILL.md**: constrain prompt "Do NOT read any SKILL.md or skill files" (iter 58 enforced ✔).
- **Pre-commit hook check baseline**: iter 58 13118 preserved → no baseline change → hook passa senza re-baseline arithmetic proof.
- **`git stash` blocked** (loop autonomous modifies automa/state/* underneath): NEVER `git stash`. Use surgical stage instead.
- **TEA narrative_map.json unreliable Vol3** (iter-54 verdict): 16/22 chapter title wrong + bookText Vol3 fabricated. iter 58 confirmed Tea narrative_map ALSO unreliable Vol2 chapter titles (Tea Vol2 Cap.9 = "AND" ma reale = "Fototransistor"). **Authoritative source = `scripts/epic1/a3-corrections.json` + recon §A book-canonical** (physical volumes ground truth).
- **Edit fails "File has not been read yet"** (iter 58 hit on v3-cap7.json): Read file PRIMA Edit in same conversation.

---

## §6 NON COMPIACERE — iter 58 onesto

- iter 58 score G45 cap **8.0/10** (raw 8.5 capped — A4.1e Workstream A only 3/7 sub-items done; 4 deferred Andrea ratify queue; Workstream B/D NOT addressed plan-only iter 58).
- NO claim "A4.1e COMPLETE" — A4.1e è **PARTIAL**, 4 sub-items deferred iter 59 Phase 2.
- NO claim "narrative-map.json regenerated" — file NOT generated (dead file iter 58, requires UI consumer design Andrea ratify).
- NO claim "iter-21+ mandate cleanup" — Workstream B 6 items NON started (linguaggio codemod + 92 esperimenti + UX/UI + 4 sub).
- NO claim "Vol2 Cap.11 resolved" — A3 Open decision 6 still open, ratify queue voce 5.
- NO claim "build PASS" — build NOT re-run iter 58 Phase 1 (~14min heavy, defer iter 59 entrance gate).
- Pattern S NOT validated iter 58 (single-Claude + 3 BG subagent, no multi-agent write conflict risk).
- Codex Pattern C-V validated × 2 (feasibility + Phase 1 diff CONFIRM × 3) — iter 58 cita evidenze.

Andrea decisione critica iter 59 entrance: Andrea ratify queue 8 voci (~15-30 min) PRIMA di toccare codice Phase 2. iter 59 score target 8.5/10 ONESTO post ratify + Phase 2 execute + Workstream B item 1 start.
