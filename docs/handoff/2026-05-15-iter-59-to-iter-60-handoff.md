# iter 59 → iter 60 handoff — Blockly Phase 1 execute

> iter 59 entrance close. Score ONESTO G45 = **8.5/10** (10 docs + Codex workflow refined + Andrea pivot codified).
> iter 60 entrance = Andrea ratify queue 10 voci (~30-45 min) + Phase 1 execute (R1-R6 board selector + cross-compile).

---

## §1 Activation string iter 60 (paste-ready)

```
Continua ELAB Tutor iter 60. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix, HEAD <commit-iter59-entrance>.

━━ PRIMA AZIONE ━━
1. CoV entrance: npx vitest run = 13118/0, node scripts/epic1/validate-lesson-paths.mjs = 94/94/0/0/0, npm run build exit 0 (heavy ~14min — gate).
2. Leggi docs/audits/2026-05-15-iter-59-entrance-audit.md + docs/handoff/2026-05-15-iter-59-to-iter-60-handoff.md.
3. Leggi PRD docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md INTERO (~270 LOC, 3 fasi + acceptance criteria + 7 open questions).
4. Andrea ratify queue 10 voci (§3 handoff) — chiedi decisioni a/b/c per ogni voce PRIMA di toccare codice. Ratify ~30-45 min.
5. Andrea trigger /ultrareview iter 59 entrance commits (USER-TRIGGERED only, Claude NON può).

━━ MANDATO ANDREA iter 59 (verbatim) ━━
"postilla non usare mblock → fa sì che elab tutor possa fare cross compilation su nanoR4 tramite c++ e blockly, rendi blockly più facile da usare e autoesplicativo".

━━ LAVORO iter 60 (post Andrea ratify Q1-Q3) ━━
P0 Phase 1 (R1-R6 PRD, ~6-8h):
- R1 board selector UI radio "Nano classic AVR" / "Nano R4" near compile button (ScratchEditor.jsx + localStorage persist)
- R2 ALLOWED_COMPILE_BOARDS extend api.js:61 — add arduino:renesas_uno:unor4wifi + arduino:renesas_uno:minima
- R3 Andrea verify n8n server arduino-cli core install arduino:renesas_uno (SSH PREREQ)
- R4 docs/api/n8n-compile-openapi.yaml validate via swagger-cli + refine post ratify
- R5 docs/api/n8n-compile-api.md update post Andrea Q1-Q3 answers
- R6 anti-regression preserved: 13118 vitest + 94/94 validator + AVR Nano classic 13 Vol3 esperimenti compile + simulate

━━ CODEX (mandate iter 59 reaffirmed) ━━
Pattern C-V default OGNI commit. Templates iter 59 entrance scaffolded scripts/dev/codex-prompts/ (verify-anti-regression + verify-morfismo-compliance + verify-codegen-output + verify-lesson-path-edit). 
NEW failure mode documented iter 59: `\|` regex BRE syntax in Codex prompt arg → stdin stuck. Use `(a|b|c)` ERE syntax invece.

━━ /ultrathink:ultrathink (post Andrea ratify) ━━
Spawn Coordinator + 4-agent (Architect + Research + Coder + Tester) per Phase 1 execute:
"/ultrathink Implement iter 60 Phase 1 R1-R6 of PRD per Andrea-ratified Q1=<X>, Q2=<Y>, Q3=<Z>"

━━ ANTI-REGRESSIONE FERREO ━━
Baseline 13118. 4-gate per ogni commit (vitest + build + validator + Codex). MAI --no-verify, MAI push main, MAI git stash, MAI git add -A. Re-baseline test count SOLO con prova aritmetica.

━━ NON COMPIACERE ━━
iter 60 score target 8.7/10 ONESTO post Phase 1 R1-R6 complete + Codex Pattern C-V × N commits + Andrea ratify Phase 2 entry. iter 61 score target 9.0/10 post Phase 2 UX overhaul (R7-R13).
```

---

## §2 iter 59 entrance state

10 deliverables shipped (see iter 59 entrance audit §"Deliverables"). Zero src/ modifications iter 59 entrance — pure docs + scripts/dev/codex-prompts/ scaffold.

CoV iter 59 entrance:
- vitest 13118 PASS preserved (no src changes)
- validator 94/94 preserved (no lesson-paths/capitoli changes)
- Codex Pattern C-V × 3 runs: 2 PASS + 1 FAILED (stdin failure mode documented)

---

## §3 Andrea ratify queue iter 60 entrance — 10 voci dettaglio

### Phase 1 entry blockers (Q1-Q3, ~10-15 min):

| Voce | Question | Options | Andrea raccomandato | Impact iter 60 |
|---|---|---|---|---|
| Q1 | Default board iter 59 R1 | a) `Nano R4` (new direction); b) `Nano classic AVR` (backward compat 13 Vol3) | b) AVR preserve compat — iter 60 Phase 1 add R4 toggle | UI default + 13 Vol3 esperimenti compile path |
| Q2 | n8n server Renesas core install (R3 PREREQ) | a) Andrea verify SSH `arduino-cli core list \| grep renesas`; b) Andrea installs `arduino-cli core install arduino:renesas_uno` | a→b if missing — Andrea must SSH | Phase 1 entire blocker if missing |
| Q3 | UNO R4 variant default kit | a) `arduino:renesas_uno:unor4wifi`; b) `arduino:renesas_uno:minima`; c) both available | Andrea + Riccardo Omaric decide kit hardware | FQBN choice — affects R2 + R4 |

### Phase 2 entry blockers (Q4-Q6, ~10-15 min):

| Voce | Question | Options | Andrea raccomandato | Impact iter 61 |
|---|---|---|---|---|
| Q4 | Block label canon source | a) Vol3 OCR txt; b) a3-corrections `bookFaithfulTitle`; c) Davide direct | b) a3-corrections (already canonical iter 57) | Italian labels source-of-truth |
| Q5 | Block icons | a) emoji (fast); b) SVG ElabIcons (Morfismo) | b) ElabIcons (CLAUDE.md rule 11) | Icon design effort |
| Q6 | Per-experiment block filter | a) strict (5 blocks per esperimento); b) full (23 with relevant highlighted) | a) strict (less overwhelm kids 8-14) | Toolbox UX behavior |

### Phase 3 entry blockers (Q7, ~5 min):

| Voce | Question | Options | Andrea raccomandato |
|---|---|---|---|
| Q7 | Walkthrough first-time language | a) Italian only; b) Italian + icons fallback | b) icons fallback (kids 8-14 non-readers) |

### Carryover iter 58 A4.1e Phase 2 (10-30 min Andrea ratify):

| Voce | Question | Options | Andrea raccomandato |
|---|---|---|---|
| iter58-Q1 | `v3-cap9.json` orphan | a) DELETE; b) PRESERVE; c) MOVE-to-Bonus | c) MOVE-to-Bonus (preserve Simon Says + honest naming) |
| iter58-Q2 | morse+semaforo pages | apply `page_start/end` book-canonical 57+58 | APPLY iter 60 Phase 2 |
| iter58-Q3 | morse+semaforo titles align lesson-path | apply clean book-faithful titles | APPLY iter 60 Phase 2 |

---

## §4 Phase 1 R1-R6 execute plan (iter 60 ~6-8h post ratify)

### R1 — Board selector UI (~1-2h)

File: `src/components/simulator/panels/ScratchEditor.jsx` (21692 bytes, current 12 toolbox cat + plain Blockly default theme).

Edit pattern: add radio group component near compile button. State `selectedBoard` from localStorage `elab-compile-board` (default = Andrea Q1 ratified). Pass to `compileCode()` invocation.

```jsx
<div className={styles.boardSelector}>
  <label>
    <input type="radio" name="board" value="arduino:avr:nano:cpu=atmega328old"
      checked={selectedBoard === 'arduino:avr:nano:cpu=atmega328old'}
      onChange={handleBoardChange}
      style={{ minWidth: '44px', minHeight: '44px' }} />
    Nano classic AVR
  </label>
  <label>
    <input type="radio" name="board" value="arduino:renesas_uno:unor4wifi"
      checked={selectedBoard === 'arduino:renesas_uno:unor4wifi'}
      onChange={handleBoardChange}
      style={{ minWidth: '44px', minHeight: '44px' }} />
    Nano R4
  </label>
</div>
```

Acceptance: touch ≥44px (CLAUDE.md rule 9), keyboard accessible, state persists localStorage.

### R2 — ALLOWED_COMPILE_BOARDS extend (~15 min)

File: `src/services/api.js:61`. Edit:
```js
const ALLOWED_COMPILE_BOARDS = new Set([
  'arduino:avr:nano:cpu=atmega328old',
  'arduino:avr:uno',
  'arduino:renesas_uno:unor4wifi',  // iter 60 R2 NEW
  'arduino:renesas_uno:minima',     // iter 60 R2 NEW
]);
```

Codex Pattern C-V verify: `bash scripts/dev/codex-bg.sh iter60-R2-allowlist-verify --profile verify "$(cat scripts/dev/codex-prompts/verify-anti-regression.txt | sed s/...)"`.

### R3 — Andrea SSH verify n8n core install (Andrea action ~5 min)

Andrea verify:
```bash
ssh n8n-server "arduino-cli core list | grep renesas"
# If missing:
ssh n8n-server "arduino-cli core install arduino:renesas_uno"
```

NO claude action — Andrea owns server access.

### R4 — OpenAPI yaml validate + refine (~30 min)

```bash
npx @apidevtools/swagger-cli validate docs/api/n8n-compile-openapi.yaml
```

Refine spec post Andrea Q1-Q3 answers (default board enum + variant choice).

### R5 — API docs update (~30 min)

Update `docs/api/n8n-compile-api.md` §7 board allowlist + §8 examples per Andrea Q1-Q3 answers.

### R6 — Anti-regression preserved (~30 min)

CoV gate iter 60 Phase 1 close:
- vitest 13118 PRESERVED
- validator 94/94 PRESERVED
- 13/13 Vol3 esperimenti AVR compile + simulate (no change)
- 13/13 Vol3 esperimenti Nano R4 compile success (post Andrea Q2 PREREQ)
- Codex Pattern C-V verify-anti-regression.txt template invocation post commit

---

## §5 /ultrathink:ultrathink spawn iter 60 (post Andrea ratify Q1-Q7)

Suggested prompt:

```
/ultrathink Implement iter 60 Phase 1 R1-R6 of docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md.

Andrea-ratified: Q1=<board default>, Q2=<n8n core verified>, Q3=<UNO R4 variant>.

Architect: codegen architecture (extend api.js scratchGenerator unchanged + board param routing in compileCode) + UI placement R1 (board selector near compile button or in lavagna toolbar).

Research: arduino-cli Renesas core compat verify + Blockly v12 Theme docs via context7 MCP query "blockly v12 theme custom color category".

Coder: R1 ScratchEditor.jsx board selector + R2 api.js ALLOWED_COMPILE_BOARDS extend + R4 openapi.yaml refine.

Tester: Phase 1 acceptance — 13/13 Vol3 esperimenti compile success on both AVR + Nano R4 paths + vitest 13118 PRESERVED + validator 94/94 + Codex Pattern C-V CONFIRM diff via scripts/dev/codex-prompts/verify-anti-regression.txt template.

Constraint: 4-gate per commit, MAI --no-verify, MAI push main.
```

---

## §6 /ultrareview gate (Andrea action)

`/ultrareview` user-triggered + billed. Claude CANNOT launch.

Andrea recommended runs:
- **NOW** iter 59 entrance close: `/ultrareview` (no arg) — current branch local diff covers 10 docs + 5 codex templates + CODEX-WORKFLOW.md addendum.
- **iter 60 Phase 1 close**: `/ultrareview` post R1-R6 commits.
- **iter 61 Phase 2 mid**: `/ultrareview` post UX overhaul 5-7h.
- **iter 62 Phase 3 close**: `/ultrareview` cumulative + pre-merge main.

---

## §7 Score iter 60 cascade target

| Iter | Phase | Effort | Score target ONESTO G45 |
|---|---|---|---|
| iter 60 | Phase 1 (R1-R6) | 6-8h | 8.7/10 |
| iter 61 | Phase 2 (R7-R13) | 10-16h | 9.0/10 |
| iter 62 | Phase 3 (R14-R19) | 6-10h | 9.3/10 |

Total: 22-34h across 3 iterations. NO inflation, Codex Pattern C-V + 4-gate cascade enforce.

---

## §8 NON COMPIACERE — iter 59 entrance honest

- iter 59 entrance shipped DOCS + CONFIG, NO src/ code yet.
- Andrea ratify queue 10 voci OPEN — iter 60 entrance MUST close PRIMA Phase 1 execute.
- Codex Pattern C-V × 3: 2 PASS + 1 FAILED (stdin failure mode iter 59 NEW, documented + mitigated).
- /ultrathink intentional defer iter 60 (open questions block Coder).
- /ultrareview Andrea-only — Claude CANNOT launch.
- Score 8.5/10 cap G45 ONESTO (raw 9.0, capped per documented penalties iter 59 audit §Score).
