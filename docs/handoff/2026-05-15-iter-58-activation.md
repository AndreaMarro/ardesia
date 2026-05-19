# ELAB Tutor — iter 58 activation prompt

> Continuation hand-off from iter 57. Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> iter 57 closed: **A4.1d DONE** (5 commits `9bbb5bdc..b3dd9496`, all gates green, pushed). iter 58 starts the broader iter-21+ Andrea mandate cleanup — A4.1e (regenerate narrative structure) is **one** slice of a much larger work surface. Paste the **Activation string** (bottom of this file) into a fresh Claude Code session, or paste this whole file.

---

## Role

You are continuing autonomous work on **ELAB Tutor** — an educational electronics platform for kids 8-14 (kit fisici Omaric + 3 volumi cartacei Davide + software). iter 57 finished EPIC 1 A4.1d: the Vol3 narrative arc is now book-faithful (parità stretta), the validator has reference-integrity + acyclicity guards, gate is 0 fail. iter 58 widens scope — there are at least **9 named workstreams** in Andrea's iter-21+ mandate, plus the new **mBlock pivot** Riccardo opened (14-15 May). You will start from `/Users/andreamarro/VOLUME 3/TEA/` and the printed volumes; you will use Codex as a constant interactive partner, not an afterthought; you will brief Tea + Matteo with concrete sub-tasks; and you will close the session with another honest audit + push.

---

## §0 — Entrance sequence (do these FIRST, in this exact order — do not skip, do not reorder)

1. **Confirm working dir + branch + Codex.** `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`, `git branch --show-current` → must be `feat/iter-41-sprint-u-cycle-2-real-user-fix`. `git log --oneline -8` → HEAD = `b3dd9496` (iter-57 close audit) on top of `ebc5b620 842dd8ae 42392b31 9bbb5bdc 9cb7e24f`. **Verify Codex**: `ls ~/.npm-global/bin/codex && ~/.npm-global/bin/codex --version` → `codex-cli 0.128.0`. `which codex` may say "not found" — that's a PATH issue only; `scripts/dev/codex-bg.sh` hardcodes `$HOME/.npm-global/bin/codex` and works regardless. If the binary is genuinely missing → restoring it is sub-task #1.
2. **`git status`.** Clean tree expected EXCEPT loop-owned files (`AGENTS.md`, `automa/state/heartbeat`, `automa/state/iter-19-harness-2.0-results.json`, `automa/state/parallel-research.json`) — NEVER stage those. Large unexpected diff in `src/` or `tests/` → autonomous loop is mid-task; investigate provenance before touching anything. Do NOT `git stash` (loop modifies `automa/state/*` underneath, pop conflicts; iter 56 hit this).
3. **Pre-flight CoV (entrance gate, MANDATORY).** `npx vitest run` → **13118 passed / 0 failed** (15 skip + 12 todo). `npm run build` → exit 0. `node scripts/epic1/validate-lesson-paths.mjs` → **94 checked · 94 pass · 0 fail · 0 unresolved refs · 0 cyclic capitoli graphs**. If any is red → STOP and report. Do not "fix" by touching tests.
4. **Read the TEA folder — START HERE.** `ls "/Users/andreamarro/VOLUME 3/TEA/"`. Andrea inserted in TEA the **per-page OCR markdown of all 3 printed volumes**:
   - `MANUALE VOLUME 1 ITALIANO.pdf/pages/page-N/markdown.md` (114 pages) — plus 2 OCR re-runs `MANUALE VOLUME 1 ITALIANO 2.pdf/`, `3.pdf/`
   - `MANUALE VOLUME 2 ITALIANO.pdf/pages/page-N/markdown.md` (116 pages) + 2 re-runs
   - `Manuale vol 3 versione 0.13.pdf/pages/page-N/markdown.md` (172 pages) + 1 re-run
   - **`PLAN-unlim-prof-pilot-chatgpt.md`** (top-level, 2026-05-12) — Andrea-authored 10-phase mega-plan: Mission Runner Dual-View (regia+LIM) + Supabase Realtime + Claude Vision breadboard validator + ChatGPT canali (Custom GPT, Apps SDK/MCP, ChatKit) + Anthropic Managed Agents Memory + Dreams. **Read it in full before deciding scope.**
   - `elab-tutor-battlecard-2026-05.html` — competitive battlecard (HTML).
   - 6 `ocr-playground-download-*.zip` (May 12 OCR variants).
   - `Nuovo lavoro tea/` — Tea's work: `narrative_map.json`, `narrative_metadata_94.json`, `cliffhanger_table.json`, `standard_experiment_schema.json`, `standard_experiment_v1-cap6-esp1.json`, `standard_experiment_v3-cap7-mini.json`, `bibbia_stilistica.pdf`, `fumetto_pilota.pdf`, `fumetto_schema.json`, `mascotte_unlim.svg`, `mascotte_unlim_canonica.md`, `album_studente_*`. Per the iter-54 A3 verdict: Tea's **7-step schema** is canon; her **`bookText`/`success_citation`/`analogy` metadata is canon for Vol 1+2 only**; her `narrative_map` chapter titles + `nextId` chains are **unreliable** (16/22 wrong); her **Vol 3 `bookText` is fabricated** (0/29 verbatim) — do not use it. The physical volumes (now in TEA per-page MDs) are the **sole source of truth**.
   - The previously-used `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/{vol1,vol2,vol3-v0.8.1}.txt` extracts remain valid as a flat-text alternative. Cross-check against TEA per-page MDs when uncertain (multiple OCR variants exist).
5. **`/mem-search` to re-anchor on the §1 mandate.** Run claude-mem `search` with: `"EPIC 1 narrative arc parità volumi kit elabtutor"`, `"Morfismo Sense 2 triplet"`, `"Principio Zero V3 Sense 1.5"`, `"esperimenti spezzettati card flat scollegate"`. Background only — the authoritative state is the files in §3.
6. **Read iter-57 close state.** `docs/audits/2026-05-14-iter-57-close-audit.md` — the 5 exit criteria, the 5 honest deferred items, the Codex-final 5-CONFIRM-1-REFUTE breakdown. The 1 REFUTE = 5 pre-existing Vol2 capitalization drifts (`v2-cap9-esp2`, `v2-cap10-esp1/2/3/4`) the validator's `norm()` passes but exact-string compare flags — these are pre-iter-57 and out of A4.1d scope.

---

## §1 — The recurring Andrea mandate (verbatim — repeated across MANY sessions)

> **Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Ci deve essere parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger inter-esperimento. Questo è Morfismo Sense 2 — il differenziatore competitivo non copiabile.**

> **"Segui il libro e rendi il programma più fruibile e semplice possibile."** (Andrea, iter 57)

Operating rules ratified across iter 21..57:
- **Parità stretta** — software experiment inventory must exactly equal the *current* printed volume inventory. Nothing ships that is not in the printed volume; what the volume has and the software lacks gets added; over-splits/duplicates collapse to 1:1.
- **Principio Zero** — il docente è il tramite, gli studenti vedono solo la LIM, UNLIM cita verbatim dai volumi (mai parafrasa), il kit fisico è sempre protagonista, chiunque deve poter usare ELAB senza conoscenze pregresse.
- **Fruibile e semplice** — UI titles must be book-faithful AND clean (no code fragments, no English audit-notes, no editorial parentheticals). iter 57 set this precedent for the 30 experiment titles; same lens applies to all UI strings going forward.
- **Run `/mem-search` for `"EPIC 1 narrative arc parità volumi kit elabtutor"` at the start to re-anchor — Andrea has stated this many times.**

---

## §2 — Anti-regression (HARD CONSTRAINTS — non-negotiable, FERREO)

- `npx vitest run` must end **0-failed** before AND after every change. Entrance baseline = **13118**. A test that *fails* is a regression → REVERT. A test that legitimately *disappears* re-baselines only with an arithmetic proof (the iter-57 method: exactly-N-changed + 0-failed + all-test-files-collected + no `.skip`/`.todo` added).
- `npm run build` exit 0 before every commit.
- The **pre-commit hook** (`.githooks/pre-commit` → `scripts/quick-regression-check.sh`, reads `.test-count-baseline.json` `total`) — NEVER bypass, NEVER `--no-verify`, NEVER push to `main`. Stay on `feat/iter-41-sprint-u-cycle-2-real-user-fix` (or open a new feat branch for a clearly separate work-stream).
- The **pre-push hook** runs the same regression check — the push hangs if vitest is slow under load; that is normal, wait it out.
- NEVER `git add -A` — concurrent autonomous loop modifies `AGENTS.md` + `automa/state/*`; stage specific files, check `git diff --cached --stat` before every commit.
- **A concurrent autonomous loop is active in this repo.** It commits on its own and modifies the working tree. Treat the working tree as shared — verify provenance before committing anything you did not author. Do NOT `git stash`.
- Score/test-count/claim statements: cite ONLY numbers you just saw in `vitest`/`build`/`Codex` output — never from memory. **No score > 7.5, no "done", no "verified" without the recursive loops in §5 closing.**
- The validator's `norm()` is whitespace + case insensitive — it can pass entries Codex's exact-string compare flags. Both are correct under their definitions; document which check you are citing.

---

## §3 — iter-57 state hand-off (authoritative — read these files)

### A4.1d — DONE (5 iter-57 commits `9bbb5bdc..b3dd9496`, all pushed):
| commit | what |
|---|---|
| `9bbb5bdc` | A4.1d Phase 1 — fix `v3-cap6.json` `semaforo↔morse` 2-cycle (delete transitions 5+6 → linear `esp1→esp2→morse→esp4→semaforo`); add `v3-cap6-morse` forward link to `v3-cap6-esp4`; contract `nextId` lockstep |
| `42392b31` | A4.1d Phase 2 — re-thread Vol3 to book page-order (Andrea-ratified): Ch7 `esp1→esp3→esp6→esp2`, Ch8 `esp3→esp1→esp2→null`. 15 dangling-ref units cleared. Capitoli `narrative_flow` re-threaded. Contract `nextId` lockstep across 79 keep/correct entries |
| `842dd8ae` | A4.1d Phase 3 — 30 clean book-faithful titles (Andrea: "fruibile e semplice"); stripped 2 contract `bookFaithfulTitle` editorial artifacts (`(duplicate of …)`); gate 30 fail → 0 |
| `ebc5b620` | A4.1d Phase 4 — 13 coupled `next_experiment.title` re-aligned + 11 stale `next_experiment.preview` re-authored; validator extended with `checkReferenceIntegrity` + `transitionsCycleNode` + `checkNarrativeAcyclic` + 12 new tests; `.test-count-baseline.json` `commit` `a1d0a98→bee5e627`, `total` 13106→13118 (arithmetic proof) |
| `b3dd9496` | iter-57 close audit |

### iter-57 close state (CoV — independently verified):
- `npx vitest run` = **13118 passed / 0 failed** (15 skip + 12 todo).
- `npm run build` = exit 0.
- `validate-lesson-paths.mjs` = **94 pass · 0 fail · 0 unresolved refs · 0 cyclic capitoli graphs**.
- `git grep` of all 15 removed/consolidated ids in `src/` (excluding tests + `v3-cap9.json` self-definition) = **EMPTY**.
- Vol3 chain trace (acyclic, book-canonical):
  `v3-cap5-esp1 → v3-cap5-esp2 → v3-cap6-esp1 → v3-cap6-esp2 → v3-cap6-morse → v3-cap6-esp4 → v3-cap6-semaforo → v3-cap7-esp1 → v3-cap7-esp3 → v3-cap7-esp6 → v3-cap7-esp2 → v3-cap8-esp3 → v3-cap8-esp1 → v3-cap8-esp2 → null`
- Codex final cumulative audit (`/tmp/codex-iter57-final-audit.txt`): **5 CONFIRM, 1 REFUTE**. The REFUTE = 5 pre-existing Vol2 title capitalization drifts (`v2-cap9-esp2`, `v2-cap10-esp1/2/3/4`) — validator's `norm()` passes them; Codex did exact-string compare. Pre-iter-57, untouched, low-severity.

### iter-57 documented-deferred items (close audit §"Honest gaps"):
1. **Vol1/Vol2 coupled-title cascade — 33 `next_experiment.title` drifts** (0 in Vol3). ~16 caused by Phase 3's required Vol1/Vol2 title edits (predecessors of the retitled experiments) + ~17 pre-existing. Low severity (stale label, not wrong-content). Out of A4.1d Vol3 narrative scope. Reproducible via:
   ```
   node -e 'const fs=require("fs"),p="src/data/lesson-paths/";const lp={};for(const f of fs.readdirSync(p).filter(x=>x.endsWith(".json"))){const j=JSON.parse(fs.readFileSync(p+f,"utf8"));if(j.experiment_id)lp[j.experiment_id]=j;}for(const[id,j]of Object.entries(lp)){const ne=j.next_experiment;if(!ne||ne.id==null)continue;const t=lp[ne.id];if(t&&ne.title!==t.title)console.log(id,"->",ne.id,JSON.stringify(ne.title),"!=",JSON.stringify(t.title));}'
   ```
2. **Deeper free-prose** — `session_save.resume_message`, phase `next_preview`, `v3-cap6/7/8.json` transition `text_classe`/`text_docente_action`, `v3-cap8.json` `closing_text` ("display LCD" — references removed `v3-extra-lcd-hello`). Editorial, ungated.
3. **`v3-cap9.json` capitoli orphan** — defines a `v3-cap9-esp1` experiment but no lesson-path + no contract entry. Andrea ratified Vol3 terminus = `null` (Ch8 ends the lesson-path layer). Flag for A4.1e.
4. **`v3-cap7.json` `intro_text`** = "Il mondo continuo: i pin analogici" (Ch8 topic). Pre-existing content bug.
5. **`num` fields** — `v3-cap6-morse` num 8, `v3-cap6-semaforo` num 9 (book-canonical 3 and 5). Cosmetic, ungated.
6. **`.test-count-baseline.json` `commit` field** still `bee5e627`. The Phase-4 commit `ebc5b620` is now itself a baseline-changing commit; bump opportunistically.

### iter-21+ Andrea mandate carryover (NOT done iter 57 — explicit list):
- Linguaggio codemod 200 violations singolare → plurale (`Premi Play` ×~50, `fai/clicca/monta/collega` ×~23) — see `feedback_iter21_mandate_critical.md` + Sprint U Cycle 1.
- 92 esperimenti Playwright UNO PER UNO sweep (real prod evidence, kit fisico mismatch).
- Grafica overhaul (`/colorize` `/typeset` `/arrange` skills) + Modalità Percorso UX.
- Vol3 narrative refactor schema (ADR-027, Davide co-author) — Sprint U deferred.
- Modalità Passo Passo — `feedback_passo_passo_regression_06may2026.md` P0 Andrea.
- HomePage prod regression + Glossario Tea integration in main app — `feedback_homepage_old_version_regression.md` + `feedback_glossario_external_url.md`.

---

## §4 — iter 58 work (decomposed)

### Workstream A — A4.1e (handoff P1 carryover from iter 57)
Regenerate the narrative structure from the corrected contract + the volumes:
- `src/data/narrative-map.json` (or wherever Tea's `narrative_map.json` lands in src/) — 22 corrected chapter titles, full chain, no stale Vol3 titles.
- `src/data/chapter-map.js` — chapter↔experiment registry (currently has `CAP6_INPUT_IDS` etc; recon §B noted `num` field staleness; check for other stale arrays).
- `src/data/lesson-groups.js` — 27 Lezioni grouping; align with the re-threaded chain.
- Decide the **Vol2 Cap.11 theory-node** question (A3 master verdict Open decision 6).
- Decide handling of the `v3-cap9.json` orphan (regenerate properly, or delete).
- Fix `v3-cap7.json` `intro_text` content bug.
- Optionally renumber capitoli `num` fields to book-canonical order.
- Per ADR-047 + the A4 spec R3.

**Inputs ready**: corrected `a3-corrections.json`, `docs/audits/2026-05-14-epic1-a4-1d-recon.md` §A (book-canonical chapter/experiment order per volume + line cites), `docs/audits/2026-05-14-epic1-a4-1d-clean-titles.md` (30 clean titles traced to volumes), Tea's `narrative_map.json` + `narrative_metadata_94.json` in `Nuovo lavoro tea/` (use cliffhanger_table for transitions, but cross-verify all against the volumes per the iter-54 A3 verdict).

### Workstream B — Andrea mandate cleanup (the long todo from iter-21+, prioritized)
1. **Allineamento esperimenti elabtutor ↔ libri** — narrative + actual things to do. Visit each single experiment, check each component (breadboard holes), Arduino + Blockly behaviour. Use the TEA per-page MDs as the spec.
2. **Modalità Percorso perfetta + adattativa** (Morfismo Sense 1 + Principio Zero V3). Per `PLAN-unlim-prof-pilot-chatgpt.md` Phase 3 (Mission Runner Dual-View regia+LIM, Supabase Realtime).
3. **Modalità Passo Passo per OGNI esperimento** + Passo Passo per Blockly e Arduino. Carryover P0 from `feedback_passo_passo_regression_06may2026.md`.
4. **UX/UI overhaul** — Claude design skills (`/impeccable:critique`, `/impeccable:colorize`, `/impeccable:typeset`, `/impeccable:arrange`, `/impeccable:polish`); Fusion 360 connector for the 3D mockups.
5. **Mappare ogni percorso/pulsante/attività + debug** — Playwright + Control Chrome MCP. Real prod evidence anti-G45.
6. **API per piattaforme esterne** — ChatGPT (Custom GPT + Apps SDK + MCP per `PLAN` Phase 6/7/8), Google Classroom, MS Teams.

### Workstream C — mBlock pivot (Riccardo iter 14-15 May)
Riccardo's WhatsApp (verbatim quoted in the iter-58 user prompt that triggered this handoff): he wants to rewrite Vol4 with **mBlock** instead of Arduino IDE. mBlock doesn't natively support Arduino Nano R4 (Renesas RA4M1 Cortex-M4 vs old AVR Nano). Path: build an mBlock Extension via Extension Builder (`ext.mblock.cc`) — new Device "Arduino Nano R4", id `arduino_nano_r4`, Arduino C/C++ transcoding, didactic blocks (LED, digital/analog pins, PWM, servo, I2C/Qwiic, serial). Schools are asking for mBlock by name → market need.

Andrea decision (verbatim): "elimino blockly e adatto. Intanto sto cercando di mettere in ordine il più possibile il resto. Se è richiesto è la cosa migliore." → ELAB Tutor's current Blockly integration must be **migrated to mBlock**. Do NOT just bolt mBlock alongside; replace.

Tasks:
- C1. Inventory current Blockly usage in elab-builder (`grep -r blockly src/`) — components, services, lesson-paths that load Blockly programs.
- C2. mBlock Extension Builder spike — create the `arduino_nano_r4` device, define the minimum block set, generate Arduino C, test compile via Arduino IDE/CLI.
- C3. Decide migration path: (a) mBlock as separate desktop tool (lose elab-builder integration but match school workflow); (b) embed mBlock-generated `.mext` block packages and translate to elab-builder's existing simulator; (c) hybrid (mBlock for Vol4 standalone, Blockly stays for Vol3). **Andrea ratification needed before implementation.**
- C4. Extend Workstream B item 1 (alignment) to cover Vol4 once mBlock path is clear.

### Workstream D — Continuation of `PLAN-unlim-prof-pilot-chatgpt.md` (Andrea-authored 2026-05-12, 10 phases)
This is a **separate parallel mega-plan** — read it in full from TEA. It covers UNLIM Prof Pilot Mode (regia+LIM dual-view), Supabase Realtime mission state, Claude Vision breadboard validator (Opus 4.7 only — high-res 2576px), ChatGPT Custom GPT + Apps SDK + MCP + ChatKit, Anthropic Managed Agents Memory (workspace-scoped 100kB stores) + Claude Dreams (nightly memory consolidation). Open decisions in the plan need closure with Andrea before execution.

**Decision for iter 58**: don't try to execute all of A+B+C+D. Pick ONE primary workstream (recommend A: A4.1e — it's the iter-57 carryover, well-scoped, inputs ready) + ONE secondary (recommend C: mBlock spike — Riccardo asked, market signal, can be a 30-min recon-only investigation while A executes). B + D = multi-iter, plan in this iter, execute later iters.

---

## §5 — Codex workflow (mandatory, not optional — Claude and Codex must interact and confront each other)

Codex GPT-5.5 via `scripts/dev/codex-bg.sh <task> --profile verify "<prompt>"` is the **anti-inflation + anti-regression backbone**. Use it CONSTANTLY, in PARALLEL with your own work, on EVERY non-trivial step.

### Prompt structure (4 elements, MANDATORY — single-line prompts return useless file dumps):
- **GOAL** — one sentence, what must be true at the end.
- **CONTEXT** — `@file` mentions + key conventions.
- **CONSTRAINTS** — read-only, cite file:line, no heredocs (sandbox blocks temp files), no skill-file reads, narrow path restrictions.
- **DONE** — concrete verifiable completion criterion.

### When to invoke Codex (PARALLEL to your work):
- After every recon — re-derive the same fact independently.
- After every plan — sanity-check the plan against the codebase.
- After every subagent task — verify the subagent's claims against the actual diff.
- Before every commit — diff-review verdict CONFIRM/REFUTE.
- After every claim/score/count — re-derive, intersection wins (more skeptical wins on divergence).
- For broad "verify X is exhaustive" prompts — Codex returns grep-dumps; cross-check the dump manually.

### Codex known failure modes (iter 57 evidence):
- **Sandbox heredoc block** — `node ... <<'NODE'` errors with `can't create temp file for here document`. Use `node -e "..."` one-liners instead.
- **Skill-file ceremony** — Codex can burn its run reading SKILL.md files (e.g. `verification-before-completion`, `using-superpowers`) and never reach the verdict. **Constraint your prompt: "Do NOT read any SKILL.md or skill files."**
- **Path discretion** — Codex may ignore your path restrictions and grep wider than asked. Constrain explicitly: "Run EXACTLY this one command: rg -n PATTERN PATH1 PATH2".
- **Wait-loop false positives** — `until grep CONFIRM` matches the prompt echo. Use a more specific anchor like `tokens used` or `^Verdict$`.

### Recursive anti-inflation loop — every claim, every score
No claim — "done", "verified", "N tests pass", "score X", "Δ accounted for", "no regression" — is ever Claude's self-assessment alone.
1. Claude states the claim + evidence.
2. Codex independently re-derives the SAME claim from the actual code/output — NOT from Claude's report.
3. If Codex disagrees → Claude INVESTIGATES (does NOT dismiss) → revises → **GOTO 2** until convergence.
4. Accepted value = Claude ∩ Codex intersection — when they differ, the **more skeptical** value wins.
5. Codex's output is copied into the close audit (`/tmp/codex-*.txt` artifacts cited).

iter 57 proof: Codex caught a 15th dangling ref the recon undercounted (`v3-cap8-esp3.json:71` coupled title). Codex final audit caught 5 pre-existing Vol2 capitalization drifts the validator's `norm()` masks. Without Codex these would have stayed hidden.

### Recursive anti-regression loop — every change, every commit
Every change is gated by ALL FOUR: (a) `npx vitest run` 0-failed, (b) `npm run build` exit 0, (c) `node scripts/epic1/validate-lesson-paths.mjs` (94/94/0/0/0), (d) Codex diff-review CONFIRM. **Recursive** = if ANY gate fails, fix → re-run ALL FOUR (a fix can introduce a regression elsewhere). Re-baseline test count ONLY with arithmetic proof. NEVER `--no-verify`, NEVER bypass pre-commit hook, NEVER push to `main`.

### Workflow Claude ↔ Codex — interactive (Andrea's idea: alternate leadership, possibly via control_mac/MCP)
Design pattern (PROPOSE for iter 58 to PROTOTYPE):
- **Pattern C-V** (Claude leads, Codex verifies, default): Claude does work; Codex via `codex-bg.sh` audits in background. Already standard.
- **Pattern V-C** (Codex leads, Claude executes): Codex generates the recon/plan; Claude writes the code. Useful when Codex's grep-dump tendency is actually wanted (exhaustive enumeration).
- **Pattern C-C-V** (Claude proposes, Claude self-critiques, Codex arbitrates): for high-stakes design decisions where Claude debates itself first.
- **NEW: live conversation via control_mac / MCP** — Andrea's idea. Investigate `mcp__computer-use__*` (loaded via ToolSearch) + the `claude-code-guide` plugin to see if a Codex CLI session can be driven from Claude Code via an open Terminal window. If feasible, alternating leadership: Claude posts a question to Codex's terminal, Codex responds, Claude responds, etc. **Recon this in iter 58 — feasibility yes/no, demo if yes, document if no.**

---

## §6 — Tea + Matteo briefs (parallel work, dispatched at session start)

### Tea — increased responsibility
Andrea's framing: Tea uses Claude Code like Andrea, is co-dev + tester + creative + UAT. Per CLAUDE.md "Team — ruoli aggiornati 2026-04-28 PM". She has documents in `/Users/andreamarro/VOLUME 3/TEA/` (analisi complessità esperimenti, riepilogo correzioni GitHub, schema UX, 10 idee miglioramento, Glossario Vol1/2/3, fumetto pilota, narrative_map, etc.). She delivered the canonical 7-step schema + Vol1/Vol2 metadata.

**Iter-58 brief for Tea** (max 2-3 days, 2-3h/day, dispatched as a separate doc Andrea can hand to Tea):
- **T1 (priority)**: review the Vol3 re-threaded narrative arc landing in iter 57 — read `docs/audits/2026-05-14-epic1-a4-1d-recon.md` §A (book-canonical Ch6/7/8 order) + `docs/audits/2026-05-14-epic1-a4-1d-clean-titles.md` (the 30 clean titles), cross-check against the printed Vol3 OCR MDs in TEA (`Manuale vol 3 versione 0.13.pdf/pages/`). If she finds a title that doesn't match the printed page, file a `.md` note in `TEA/Nuovo lavoro tea/iter-58-vol3-tea-review.md`.
- **T2**: Vol3 narrative refactor schema (ADR-027) — Davide co-author originally. Tea proposes a draft refactor for ONE chapter (recommend Ch8 since iter 57 Ch8-split was ambiguous), file in `TEA/Nuovo lavoro tea/`.
- **T3** (creative): pick 5 worst experiments from the 30 retitled in iter 57 (her judgment) + propose UI/UX improvements based on her schema_ux_semplificato — short note, drawings OK.
- **T4** (test): Playwright real-user smoke on the Vol3 chain in prod after iter-58 deploys — does the new chain navigate correctly LIM-side?

### Matteo — new collaborator onboarding (2 days × 30 min)
Andrea: brief simple consultation tasks for new collaborator Matteo, build vision shared with him.

**Day 1 (30 min)** — orientation + tooling:
- Read `CLAUDE.md` top sections: "DUE PAROLE D'ORDINE" (Principio Zero + Morfismo) and "Stack tecnico". This is the project's North Star.
- Install Claude Code (`claude.ai/download`). Open the elab-builder repo. Run `npx vitest run` and confirm 13118 pass.
- Open the live site `https://www.elabtutor.school` — navigate to ONE experiment (e.g. v3-cap6-esp1 "Esperimento 1: accendi il primo LED sulla breadboard"). Note: which UI elements feel obvious, which feel confusing? File a 5-bullet note in `TEA/matteo-day-1-orientation.md`.
- Andrea-led 15-min call: project vision (the 3 volumi + kit + software triplet, the moat).

**Day 2 (30 min)** — first concrete contribution:
- Pick ONE typo / cosmetic bug from `TEA/matteo-day-1-orientation.md`. Fix it via Claude Code (`/git-pr-workflows:git-workflow` skill or just `git checkout -b fix/matteo-day-2-...`). Run vitest + build. Open a PR with a short description. Andrea reviews + merges.
- Read `feedback_iter21_mandate_critical.md` + `feedback_priorities_09apr2026.md` to understand the priorities.

### Where Andrea may need expert consultation (assess in iter 58, document in `TEA/expert-consult-needs.md`):
- Anthropic Managed Agents Memory + Dreams — EU residency strategy (Bedrock Frankfurt vs Vertex europe-west1 — both not GA for Managed Agents as of May 2026 per `PLAN`).
- ChatGPT Apps SDK + MCP — distribution strategy (Custom GPT vs ChatKit embed vs full Apps SDK).
- mBlock Extension Builder — JS/Scratch-block expertise for the `arduino_nano_r4` device.
- Pedagogy — formal validation of Modalità Percorso + Passo Passo against IT scuola pubblica curriculum.
- Legal/GDPR — minor data, classroom data residency, consent flow.

---

## §7 — Inspiration links (target 50) + Comic AI alternatives

### 50 inspiration links — task: at session start, dispatch a parallel research subagent to gather these
Andrea wants 50 links to visit for inspiration. Categories (split evenly, 5 links each):
1. **Educational electronics for kids** — competitor + non-competitor (Arduino Education, Tinkercad Circuits, Wokwi, Microbit, LittleBits, Snap Circuits, Hummingbird Robotics, Sphero, …).
2. **EdTech UI/UX excellence** — Khan Academy, Brilliant.org, Duolingo, Scratch, BSD Education, Sololearn, …
3. **LIM-first / classroom dual-view tools** — ClassDojo, Nearpod, Pear Deck, Mentimeter, Padlet — lessons from teacher-facing UI.
4. **Comic / illustrated educational content** — exemplars (Manga Guide series, Larry Gonick comics, EdComix, sketchnote movements, …).
5. **AI image generation for educational content** — Leonardo.ai showcases, Midjourney edu use cases, Adobe Firefly for school, …
6. **Italian K-14 STEM curriculum + scuola pubblica** — MIUR resources, INDIRE, AICA, CodeMOOC.it, programmaIlFuturo.it, …
7. **Hardware/maker community** — Arduino Project Hub, Hackaday Education, Adafruit Learning System, SparkFun curriculum, …
8. **Storytelling + narrative arc design** — Pixar storytelling rules, Save the Cat beat sheet, hero's journey applied to learning, John Hattie visible learning, …
9. **Voice + multimodal AI in education** — Khanmigo, Synthesis Tutor, Curipod, Magic School AI, Eduaide, …
10. **Open-source narrative game engines** (lessons for the Mission Runner arc) — Twine, Inkjam, Ren'Py, Chapbook, Ren'Py, …

Use a `general-purpose` opus subagent + WebSearch, output to `docs/research/2026-05-15-iter-58-inspiration-50.md`. Each link with 1-line note ("why it inspires").

### Leonardo AI alternatives for comics (iter-58 use the chosen tool for `fumetto_pilota.pdf` + future fumetti)
Andrea: per i fumetti usare Leonardo AI o le altre alternative. List:

| Tool | Strength for ELAB comics | Cost |
|---|---|---|
| **Leonardo AI** (Andrea's first choice) | Italian-friendly UI, "Real-Time Canvas", broad LoRA library, illustrated/comic styles | Free tier + paid |
| **Midjourney** v7 | Highest aesthetic quality, panel coherence, character consistency via `--cref` | $10–60/month, no free |
| **Stable Diffusion** (SDXL, Flux 1.1 Pro/Schnell, SD3 Large) | Local/offline (Krita+SD), full control, free; pair with ControlNet for panel layout | Free local; cloud paid |
| **DALL-E 3** (ChatGPT or Bing Image Creator) | Instruction-following best-in-class, free via Bing | Free (Bing) / ChatGPT Plus |
| **Adobe Firefly** | Commercial-safe, vector export, integrates Illustrator | Adobe sub |
| **Ideogram** v2 | **Best text-in-image** rendering (essential for didactic captions in Italian) | Free tier + paid |
| **Niji Journey** | Anime/manga style, kid-friendly | Bundled with Midjourney |
| **AI Comic Factory** (HuggingFace Spaces) | Comic-specialised, free, multi-panel layout out of the box | Free |
| **Comix.AI** | Comic panel generator, character library | Freemium |
| **Recraft v3** | Best for vector + illustration, text-in-image good | Free tier + paid |
| **Magnific AI** | Upscale + relight (post-process) | Paid |
| **OpenArt** | Multi-model (Flux, SD3, DALL-E), comic-style presets | Freemium |
| **Civitai** | Catalog of LoRAs/checkpoints (find "kid-friendly comic" LoRAs) | Free |
| **Krita + Stable Diffusion plugin** | Free, offline, full pen-tablet workflow + SD inpainting | Free |
| **Bing Image Creator** | Free DALL-E 3 access, Microsoft account only | Free |
| **HeyComic** | Auto-comic from script | Freemium |
| **Pixlr AI Image Generator** | Browser-based, simple | Free tier |
| **StarryAI** | Mobile-first, comic styles | Free tier + paid |

For animated comics / video panels (future): **Runway Gen-3 Turbo**, **Kling AI**, **Luma Dream Machine**, **Sora** (when GA).

---

## §8 — mBlock pivot (Riccardo iter 14-15 May, full WhatsApp context preserved)

The user prompt that triggered this iter-58 handoff contains the full WhatsApp conversation between Andrea and Riccardo (08:06 15/05, etc.). Key facts (do not re-litigate, just execute):
- Riccardo is rewriting Vol4 in mBlock instead of Arduino IDE because schools ask for mBlock by name.
- mBlock natively supports Arduino UNO, Mega, "Nano" (AVR Nano classic) — NOT Nano R4 (Renesas RA4M1 Cortex-M4). Source: makeblock direct connection + Arduino Nano R4 datasheet.
- Path: mBlock Extension Builder at `ext.mblock.cc` → My Device → Add device. Define new `arduino_nano_r4` device, language Arduino C/C++, blocks for LED / digital pins / analog pins / PWM / servo / I2C-Qwiic / serial. For each block emit Arduino C (`pinMode(13,OUTPUT); digitalWrite(13,HIGH);`).
- Test compile: try mBlock direct upload first; if it fails (likely for Nano R4 core), fallback = mBlock generates the code, user uploads via Arduino IDE/CLI with proper Renesas core.
- Andrea decision (verbatim in his message to Riccardo, 14/05 23:03): **"allora lo adatto"** + 23:07 **"elimino blockly e adatto"** — ELAB Tutor migrates from Blockly to mBlock. Same kit components.
- Riccardo (08:12 15/05): "se in questo momento non c'è nulla su mBlock sarebbe un kit unico sul mercato, almeno fino a che non lo copiano". Strategic argument — first-mover.

iter-58 mBlock spike: ONE-day recon, deliverables = (a) feasibility verdict on mBlock Extension Builder for Nano R4, (b) inventory of current Blockly usage in elab-builder, (c) migration plan A/B/C, (d) Andrea ratification request. Do NOT start the migration in iter 58 without Andrea's choice on A/B/C.

---

## §9 — Failure modes from iter 57 — recognise + correct so

- **Subagent declares git state ("HEAD is X", "asserts 94")** → NEVER trust, verify with `git log`/`reflog`/grep yourself before acting (iter 56: 2 subagents mis-read).
- **Recon greps id literals instead of tracing chains** → misses cycles + emergent issues. The recon MUST trace.
- **Codex CONFIRM on a narrow claim does NOT cover adjacent claims** → verify WHAT Codex actually confirmed.
- **Pre-commit hook blocks on count drop** → fix is re-baseline WITH arithmetic proof, NOT `--no-verify`.
- **Codex burns its run reading SKILL.md files** → constrain prompt: "Do NOT read any SKILL.md or skill files".
- **Codex sandbox blocks heredoc temp files** → use `node -e "..."` one-liners; never `<<'NODE'`.
- **Wait-loop false positives** → don't grep for "CONFIRM/REFUTE" because the prompt echo matches; anchor on `tokens used` or a structural marker.
- **Edit fails "File has not been read yet"** → Read the file first this conversation; bulk-grep doesn't count as Read.
- **Validator `norm()` is whitespace + case insensitive** → can pass entries Codex's exact-string compare flags; both correct under their definitions.
- **Multiple OCR variants in TEA** (`MANUALE VOLUME 1 ITALIANO.pdf`, `… 2.pdf`, `… 3.pdf`) → cross-check; treat the PRINTED PDF as ground truth, not any single OCR.
- **Push hangs in pre-push hook** → wait it out (vitest under load is slow); check `git status -sb` afterward to confirm `0 0` sync.
- **Background commit-push chained command** → `git push` output may be empty in the captured file even if the push succeeded. Re-verify with `git rev-list --left-right --count HEAD...origin/<branch>`.

---

## §10 — NON COMPIACERE

Honesty over comfort. No inflated scores. Name what is not proven and what is not done. iter 57 close audit named 5 deferred items + a Codex-final REFUTE — that honesty is the standard. If Codex or a gate contradicts you, it is a gift, not an obstacle.

---

## Activation string (paste-ready, prompt-optimized)

```
Continua ELAB Tutor iter 58. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix, HEAD b3dd9496 (iter-57 close).

━━ TL;DR ━━
COSA: A4.1e (regenerate narrative_map/chapter-map/lesson-groups from corrected contract + volumes) + mBlock spike (Riccardo pivot Blockly→mBlock per Nano R4) + parallel TEA folder review + Tea/Matteo briefs + 50 inspiration links + Codex-heavy interactive workflow. PERCHÉ: EPIC 1 parità stretta volumi↔kit↔software (Morfismo Sense 2) + Andrea iter-21+ mandate cleanup + Riccardo mBlock market signal. PRIMA AZIONE: §0 entrance sequence sotto, in ordine, zero skip. REGOLA D'ORO: ogni claim passa il loop Codex; ogni modifica passa i 4 gate. MAI --no-verify, MAI push su main, MAI git stash, MAI git add -A.

━━ §0 ENTRANCE SEQUENCE (in ordine, no skip) ━━
1. Leggi docs/handoff/2026-05-15-iter-58-activation.md INTERO (questo file ne è l'estratto).
2. Branch + Codex: git branch --show-current = feat/iter-41-sprint-u-cycle-2-real-user-fix; git log --oneline -8 → HEAD b3dd9496 su 9bbb5bdc..ebc5b620; ls ~/.npm-global/bin/codex && ~/.npm-global/bin/codex --version = codex-cli 0.128.0.
3. git status: pulito tranne AGENTS.md + automa/state/* (loop autonomo). Diff grosso inatteso → indaga. MAI git stash.
4. Pre-flight CoV (gate ingresso, OBBLIGATORIO): npx vitest run = 13118 passed / 0 failed; npm run build exit 0; node scripts/epic1/validate-lesson-paths.mjs = 94 pass · 0 fail · 0 unresolved · 0 cyclic. Se uno è rosso → STOP e riporta, NON aggiustare toccando i test.
5. Leggi cartella TEA: /Users/andreamarro/VOLUME 3/TEA/ — Vol1/2/3 OCR per-page MDs (Manuale vol 3 versione 0.13.pdf/pages/, MANUALE VOLUME 1 ITALIANO.pdf/pages/, MANUALE VOLUME 2 ITALIANO.pdf/pages/), PLAN-unlim-prof-pilot-chatgpt.md (Andrea 10-phase mega-plan), elab-tutor-battlecard-2026-05.html, Nuovo lavoro tea/ (Tea narrative_map, fumetto, mascotte, schema). VOLUMI FISICI = unica fonte di verità (Tea narrative_map + Vol3 bookText INAFFIDABILI per iter-54 A3 verdict).
6. /mem-search per ri-ancorarti: "EPIC 1 narrative arc parità volumi kit elabtutor", "Morfismo Sense 2 triplet", "Principio Zero V3 Sense 1.5", "esperimenti spezzettati card flat scollegate".
7. Leggi stato iter-57: docs/audits/2026-05-14-iter-57-close-audit.md (5 exit criteria met, 5 deferred items, Codex 5-CONFIRM-1-REFUTE).

━━ MANDATO ANDREA (il PERCHÉ, ripetuto molte volte) ━━
Esperimenti su arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Parità totale volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor — stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger. Morfismo Sense 2 = moat non copiabile. Andrea iter 57: "segui il libro e rendi il programma più fruibile e semplice possibile."

━━ LAVORO iter 58 (4 workstream, scegli A primario + C secondario) ━━
A. A4.1e — regenerate narrative_map/chapter-map.js/lesson-groups.js dai volumi + a3-corrections.json corretto (22 chapter title corretti, 30 clean experiment titles, chain re-threaded). Decidi nodo-teoria Vol2 Cap.11 (A3 Open decision 6), v3-cap9.json orphan, v3-cap7.json intro_text bug, num-fields renumbering.
B. Andrea iter-21+ mandate cleanup — allineamento esperimenti, Modalità Percorso adattativa (Morfismo+PZ), Modalità Passo Passo per ogni esperimento, UX/UI overhaul (skill /impeccable:* + Fusion 360 connector), mappa+debug ogni percorso/pulsante (Playwright + Control Chrome MCP), API esterne (ChatGPT Custom GPT + Apps SDK + MCP, Classroom, Teams).
C. mBlock pivot (Riccardo 14-15 May) — recon-only spike: feasibility mBlock Extension Builder per Nano R4 (Renesas RA4M1, NON AVR Nano classic), inventory Blockly usage in elab-builder, migration plan A/B/C, Andrea ratify. Andrea decisione: "elimino blockly e adatto" — schools ask mBlock by name. NON iniziare migration senza Andrea ratify A/B/C.
D. PLAN-unlim-prof-pilot-chatgpt.md (Andrea 2026-05-12, 10 fasi: Mission Runner Dual-View + Vision breadboard validator + ChatGPT canali + Anthropic Managed Agents Memory + Dreams) — separato, multi-iter, plan in iter 58 (non execute).

━━ USA CODEX TANTISSIMO — mandate, non opzionale. Claude e Codex DEVONO interagire e confrontarsi ━━
Strumento: scripts/dev/codex-bg.sh <task> --profile verify "<prompt 4-elementi: GOAL / CONTEXT (@file) / CONSTRAINTS (read-only, cita file:line, NO heredoc, NO read SKILL.md, path stretti) / DONE>". Prompt monoriga = file-dump inutile.
QUANDO: in PARALLELO, su OGNI step non banale — dopo recon, dopo plan, dopo subagent, prima di OGNI commit, dopo OGNI claim/score/count.
DEBOLEZZE NOTE (iter 57): (1) sandbox blocca heredoc → usa node -e one-liner; (2) Codex burns run leggendo SKILL.md → "Do NOT read SKILL.md"; (3) ignora restrizioni path → "Run EXACTLY this one command: rg -n PATTERN PATH"; (4) wait-loop false positive su "CONFIRM" che matcha l'echo del prompt → ancora su "tokens used" o marker strutturale.

LOOP RICORSIVO ANTI-INFLAZIONE:
1) Claude dichiara claim + evidenza. 2) Codex re-deriva STESSO claim dal codice/output reale (NON dal report Claude). 3) Codex dissente → Claude INDAGA (non liquida) → rivede → GOTO 2. 4) Valore = intersezione Claude∩Codex; vince PIÙ SCETTICO. 5) Output Codex in /tmp/codex-*.txt citato in close audit.

LOOP RICORSIVO ANTI-REGRESSIONE:
Gate su TUTTI E QUATTRO: (a) npx vitest run 0-failed (baseline 13118), (b) npm run build exit 0, (c) node scripts/epic1/validate-lesson-paths.mjs (94/94/0/0/0), (d) Codex diff-review CONFIRM. RICORSIVO = se UN gate fallisce → fix → ri-esegui TUTTI E QUATTRO. Re-baseline conteggio test SOLO con prova aritmetica.

WORKFLOW Claude↔Codex INTERATTIVO (Andrea idea — alternare leadership, possibilmente via control_mac/MCP):
- Pattern C-V (Claude leads, Codex verifies, default).
- Pattern V-C (Codex leads recon/enumeration, Claude executes).
- Pattern C-C-V (Claude propone + autocritica + Codex arbitra).
- NEW Pattern: live conversation via control_mac/mcp__computer-use__*. Recon feasibility iter 58. Demo se sì, documenta se no.

━━ LAVORO PARALLELO INIZIO SESSIONE (dispatcha tutti in primo turno) ━━
1. mem-search re-anchor + lettura TEA folder (book MDs + PLAN-unlim-prof-pilot-chatgpt.md + Tea narrative work).
2. 50 inspiration links subagent (general-purpose opus + WebSearch, output docs/research/2026-05-15-iter-58-inspiration-50.md, 10 categorie × 5 link, 1-line note ciascuno).
3. Tea brief draft (TEA/iter-58-brief-tea.md) — T1 Vol3 review, T2 Ch8 refactor draft, T3 5 worst experiments UX, T4 Playwright real-user smoke.
4. Matteo onboarding brief (TEA/iter-58-brief-matteo.md) — Day 1 (30 min orientation), Day 2 (30 min first PR).
5. Expert consult needs assessment (TEA/expert-consult-needs.md) — Anthropic EU residency, ChatGPT Apps SDK, mBlock Extension Builder, pedagogy, GDPR.
6. Codex feasibility recon for live Claude↔Codex via control_mac/MCP (background, low priority).
7. mBlock Workstream C recon (read Riccardo WhatsApp context, inventory Blockly, draft A/B/C migration paths).

━━ FAILURE MODE iter 57 — riconoscile + correggi ━━
- Subagent dichiara git state → verifica con git log/reflog tu stesso.
- Recon grep id literal invece di tracciare catene → manca cicli/dangling.
- Codex CONFIRM su claim ristretta NON copre claim adiacenti → verifica COSA Codex ha confermato.
- Validator norm() whitespace+case insensitive → può passare quello che Codex exact-string flagga; entrambe corrette nelle loro definizioni.
- Multiple OCR variants TEA → cross-check; PDF stampato = ground truth.
- Push hangs in pre-push hook → aspetta; verifica con git rev-list --left-right --count HEAD...origin/<branch>.
- Background chained git push: output può essere vuoto anche se push success → re-verifica.
- Edit fails "File has not been read yet" → Read prima nella conversazione corrente.

━━ NON COMPIACERE ━━
Onestà sopra comodità. Niente score gonfiati. Nomina ciò che non è dimostrato + ciò che non è fatto. iter 57 close audit nomina 5 deferred items + Codex-final REFUTE — quella onestà è standard. Codex/gate ti contraddice → regalo, non ostacolo.
```

---

## Optimization notes (applied via `/llm-application-dev:prompt-optimize` style)

Applied prompt-engineering patterns:
- **TL;DR header front-load** — cosa/perché/prima-azione/regola-d'oro in 4 lines so the session orients before detail.
- **Numbered §0 with inline rationale** — each entrance step carries its *why* + the failure it prevents.
- **Codex section restructured** — STRUMENTO / QUANDO / DEBOLEZZE NOTE / loops as explicit numbered procedures (not prose).
- **Failure-mode block** (constitutional-AI self-check) — concrete failure modes iter 57 actually hit + corrective action. Highest-value pre-loaded guardrails.
- **Workstream decomposition with chosen-default** — A4.1e primary + mBlock secondary; B/D plan-only iter 58. Avoids scope explosion.
- **Parallel-work block** — explicit "dispatch all in first turn" list so iter-58 starts fan-out, not serial.
- **Tea + Matteo briefs as deliverable artifacts** — concrete files (`TEA/iter-58-brief-*.md`) Andrea can hand to them; not abstract.
- Kept paste-ready single fenced activation string. Token cost ~+30% vs minimal but materially higher compliance + parallelism + handoff completeness.
