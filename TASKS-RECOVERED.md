# Tasks Recovered — Backlog deduped iter 53-62 → iter 63 entrance

> Provenance: 2026-05-15. mem-search ultime 10 sessioni + 46 atoms `automa/tasks/pending/` + handoff carryover iter 53-62 + 11-voci ratify queue iter 62 close.
> Format: ID — Origin — Owner — Status — Risk — Next step — Done criterion.

## CATEGORIA P0 — PRIORITÀ MASSIMA (Sprint T close gate iter 63+)

### P0.1 — Q-CODEMOD-2 teacher_messages → DONE iter 62 close commit `d2428e9d` ✅

(Already shipped iter 62 — moved to "completed" log)

### P0.2 — verb-map-v2 expand carryover B1.5
- **Origin**: iter 62 ratify queue dismissed
- **Owner**: Claude iter 63 (post Andrea ratify)
- **Status**: Andrea ratify pending
- **Risk**: BASSO (esistente codemod STRICT mode catches)
- **Estimate**: ~30-50 viol catch potential (ripeti/segna/gira/conta/leggi/scrivi/ascolta/calcola/aspetta)
- **Next**: Andrea ratify estensione VERB_MAP +9 verbi → TDD RED→GREEN → dry-run → Codex C-V → apply
- **Done criterion**: vitest 13209+ PRESERVED + scope-report nuova baseline 0 viol

### P0.3 — B2 92 esperimenti Playwright UNO PER UNO audit
- **Origin**: Andrea iter 21+ mandate Sprint T close gate
- **Owner**: Tester-1 (skill `elab-harness-real-runner`)
- **Status**: NOT started (entry 5-10 esp suggested iter 63)
- **Risk**: ALTO (audit espone TUTTI esperimenti broken con kit fisico mismatch)
- **Estimate**: 2-3h per esp × 92 = 184-276h totale (multi-sprint)
- **Next**: Iter 63 P0 entry 5-10 esp con per-exp Codex C-V
- **Done criterion**: 92/92 esp Playwright PASS prod live + screenshot evidence

### P0.4 — B3 HomePage test guard 4 DOM-text + Playwright toHaveScreenshot baseline
- **Origin**: feedback iter 41 PM (homepage_old_version_regression.md) anti-regression mandate
- **Owner**: Tester-2 (skill test-automator)
- **Status**: NOT started
- **Risk**: ALTO (regressione homepage prod ricorrente, Andrea "non deve accadere")
- **Estimate**: ~4-6h impl + baseline capture
- **Next**: Iter 63 P0 implement + integrate CI
- **Done criterion**: 4 DOM-text guard test + Playwright toHaveScreenshot baseline locked + CI integration

### P0.5 — ELAB Compile/Upload Agent MVP iter 63 vertical slice
- **Origin**: Andrea mandate verbatim 2026-05-15 PM (NEW iter 62 → iter 63)
- **Owner**: Codex iter 63 (impl) + Claude review
- **Status**: ADR draft shipped iter 62 close (`docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`)
- **Risk**: MEDIO (decisione architettura giusta, Arduino CLI già installato Mac Andrea v1.4.1)
- **Estimate**: ~15-20h MVP (BoardProfile + SketchBuilder + agent /health + /boards + /compile Blink + tests)
- **Next**: Iter 63 entry — Codex implementa BoardProfile + SketchBuilder + Blink compile golden test
- **Done criterion**: `arduino-cli compile --fqbn arduino:renesas_uno:nanor4` Blink PASS exit 0 + 15+ unit tests + 1 integration test

### P0.6 — Q2 SSH PREREQ ratify Phase 1 R1-R6 Blockly cross-compile
- **Origin**: iter 60-62 ratify queue dismissed
- **Owner**: Andrea ratify + Codex iter 63 impl
- **Status**: Andrea ratify pending (BLOCKING Phase 1)
- **Risk**: MEDIO (n8n SSH install + ALLOWED_COMPILE_BOARDS Set extension)
- **Estimate**: ~6-8h post Andrea SSH PREREQ + ratify
- **Next**: Andrea ratify Q2 + Q3.5 (nanor4 3rd FQBN inclusion) + ssh n8n → Codex implementa R1-R6 + 10 BoardSelector tests SAME PR
- **Done criterion**: BoardSelector wire `unor4wifi` enabled prod + 4-gate anti-regression PASS

### P0.7 — Mac Mini reactivation OR decommission decision
- **Origin**: iter 32 + 41-43 Mac Mini Tailscale 100% packet loss confirmed dead
- **Owner**: Andrea action fisica (Strambino location)
- **Status**: Stale 23+ days uptime, autonomous loop dead
- **Risk**: MEDIO (Tea co-dev alternative, ma Mac Mini valore orchestration H24)
- **Estimate**: ~30 min Andrea reboot SSH OR archive decision
- **Next**: Andrea ssh Mac Mini physical reset OR commit termination ATOM iter 63
- **Done criterion**: Tailscale ping `100.124.198.59` PASS OR ATOM termination shipped

## CATEGORIA P1 — IMPORTANTE (Sprint U close gate iter 65+)

### P1.1 — A4.1e carryover Vol3 narrative refactor (3 sub-voci)
- **Origin**: iter 58 ratify queue dismissed iter 61+62
- **Owner**: Claude iter 63+ + Davide co-author
- **Status**: Andrea ratify pending
- **Sub-voci**:
  - **a)** v3-cap9 MOVE-to-Bonus (esp out-of-scope volume struttura)
  - **b)** morse + semaforo pages 57+58 fix (lesson-paths reference align Vol3)
  - **c)** titles align Vol3 canonical Davide ground truth
- **Risk**: ALTO (Davide co-author dependency, Vol3 v0.13 still WIP)
- **Estimate**: ~3-5h per sub-voce
- **Next**: Andrea ratify + Tea iter 58 brief T1 review Vol3 canonical reference baseline
- **Done criterion**: 3 sub-voci shipped + Tea T1 brief response confirmed

### P1.2 — Q4-Q7 Phase 2 UX overhaul Blockly
- **Origin**: iter 59-62 ratify queue dismissed
- **Owner**: WebDesigner-1 + Tea iter 65+
- **Status**: Defer iter 66+ post pilot Q8 raccomandato
- **Sub-voci**:
  - Q4 label canon a3-corrections
  - Q5 ElabIcons (no emoji)
  - Q6 filter strict per-experiment
  - Q7 walkthrough IT+icons
- **Estimate**: ~8-12h totale
- **Next**: Defer iter 66+ post pilot validation Q8 (>30% lezioni Blockly/week soglia)

### P1.3 — Tea iter 58 brief T1-T8 task assignment
- **Origin**: 2026-05-15 Claude brief Tea (`TEA/iter-58-brief-tea.md`)
- **Owner**: Tea
- **Status**: Awaiting Tea response
- **Sub-voci known**:
  - **T1 ALTA** ~60 min Vol3 narrative arc review (audit iter 57 lavoro 30 esp + 4 chain capitoli)
  - **T2 MEDIA** ~90 min Cap.8 narrative refactor draft
  - T3-T8 dettaglio non letto (read iter 63 P0)
- **Next**: Iter 63 P0 read full T3-T8 + Andrea relay Tea

### P1.4 — UNLIM Prof Pilot Mode + ChatGPT Apps SDK + Vision breadboard
- **Origin**: 2026-05-12 Tea PLAN-unlim-prof-pilot-chatgpt.md (35.9 KB make-plan)
- **Owner**: Andrea decision + Claude+Codex implement iter 64+
- **Status**: Brainstorm/spec stage — Phase 0 documentation discovery DONE
- **Decision pending Andrea**:
  - Channels: Custom GPT vs Apps SDK vs ChatKit embedded vs all-three
  - Residency EU GDPR: Bedrock Frankfurt vs Vertex EU vs API direct US (managed memory non GA EU)
  - Vision validator ground truth eval set: build 50-100 foto breadboard
- **Estimate**: ~40-60h impl post Andrea decision
- **Next**: Andrea ratify channel strategy + Vision Opus 4.7 budget approval

### P1.5 — `cliffhanger_table.json` wire-up Modalità Percorso transitions
- **Origin**: Tea consegna `Nuovo lavoro tea/cliffhanger_table.json` (30 KB)
- **Owner**: Codex iter 63+ impl + Tea ratify content
- **Status**: NOT wired ELAB Tutor codebase
- **Risk**: BASSO (data ready, integration superficie limitata)
- **Estimate**: ~4h wire-up + UI integration
- **Next**: Iter 63 P0 implementation Modalità Percorso narrative transitions
- **Done criterion**: Esperimenti Modalità Percorso mostrano cliffhanger Tea-authored narrative continuity

### P1.6 — `standard_experiment_schema.json` validator codebase enforcement
- **Origin**: Tea consegna 7-step canonical schema
- **Owner**: Codex iter 63+ BG
- **Status**: Schema esistente, validator NOT integrato
- **Risk**: BASSO (additive validator, no breaking change esistenti esperimenti)
- **Estimate**: ~2h impl + lesson-paths audit
- **Next**: Codex implementa validator + audit current 79 lesson-paths conformity
- **Done criterion**: Validator script + 79/79 lesson-paths conformi OR exceptions explicitly documented

### P1.7 — `bibbia_stilistica.pdf` design tokens extract → `.impeccable.md`
- **Origin**: Tea consegna 2026-05-13 (65 KB style bible)
- **Owner**: Claude iter 63+ + WebDesigner-1
- **Status**: NOT extracted to design system
- **Risk**: MEDIO (potential conflict palette/font esistenti)
- **Estimate**: ~1h read + extract + harmonize `.impeccable.md`
- **Next**: Iter 63 P1 read PDF + extract design tokens + propose harmonization

## CATEGORIA P2 — IMPORTANTE MA NON BLOCKING (Sprint V iter 70+)

### P2.1 — Onniscenza canary 5%→25%→100% rollout (ADR-028 §7)
- **Origin**: iter 38 carryover
- **Owner**: Andrea ratify + Codex impl
- **Status**: Onniscenza wired prod opt-in iter 31, canary rollout pending
- **Estimate**: ~2-3h impl flag rollout + monitoring

### P2.2 — Lighthouse perf optim ChatbotOnly + EasterModal (26+23 FAIL ≥90 target)
- **Origin**: iter 38 P0 deferred iter 39+
- **Owner**: WebDesigner-1
- **Status**: a11y 100/SEO 100 PASS, perf FAIL
- **Estimate**: ~4h optim (lazy mount + chunk split + image opt + font preload)

### P2.3 — A14 Linguaggio codemod 200 violations Andrea iter 21 mandate (verb-map-v2 expand)
- **Origin**: iter 38 carryover Maker-3 ZERO deliverables
- **Owner**: Codex iter 63+ (post-ratify P0.2 above)
- **Status**: Defer post P0.2 ratify
- **Estimate**: see P0.2 above

### P2.4 — Vol3 narrative refactor 92→140 lesson-paths (Davide co-author iter 33+ deferred)
- **Origin**: ADR-027 PROPOSED iter 19+
- **Owner**: Davide + Claude + Tea
- **Status**: Davide volumi v0.13 in evolution
- **Estimate**: ~30-50h Davide + 20-30h Claude integration

### P2.5 — Mascotte UNLIM canonical enforcement audit
- **Origin**: Tea consegna `mascotte_unlim_canonica.md`
- **Owner**: Codex iter 63 BG
- **Status**: Possibili mascotte alternative drift in produzione
- **Estimate**: ~30 min audit grep cross-codebase

### P2.6 — Glossario Tea integration main app route #glossario
- **Origin**: feedback iter 41 PM Andrea (external URL deve essere internal)
- **Owner**: WebDesigner-1
- **Status**: External URL `elab-tutor-glossario.vercel.app/glossario` deve essere clonato IDENTICAL inside main app
- **Estimate**: ~4-6h clone+integrate (Tea folder GLOSSARIO PDFs disponibili)

### P2.7 — Cronologia sessioni Google-style + UNLIM-generated description
- **Origin**: iter 36+ A6 ChatbotOnly partial scope
- **Owner**: WebDesigner-1
- **Status**: ChatbotOnly 4-buckets sidebar exists, full Cronologia separato pending
- **Estimate**: ~4h impl

### P2.8 — Tres Jolie volumi audit parallelismo (~600 LOC table per cap)
- **Origin**: iter 32+ feedback Andrea triplet coerenza Sense 2
- **Owner**: Claude + Davide
- **Status**: Audit non started
- **Estimate**: ~10-15h audit + reporting

### P2.9 — STT CF Whisper format deeper debug (try WAV/OGG)
- **Origin**: iter 32 Andrea Whisper rejected MP3 from Voxtral
- **Owner**: Codex iter 63+
- **Status**: 3-shape input handler shipped iter 38, smoke deferred
- **Estimate**: ~2h debug + integration test

### P2.10 — Wake word "Ehi UNLIM" mic permission debug
- **Origin**: iter 32+ Andrea reported issue
- **Owner**: Codex
- **Status**: MicPermissionNudge shipped iter 38, smoke pending
- **Estimate**: ~1h debug

### P2.11 — Voice clone Davide narratore alternative (Morfismo Sense 2)
- **Origin**: iter 31+ Voxtral primary Andrea voice clone LIVE; Davide alternative pending
- **Owner**: Andrea audio capture + Codex integration
- **Estimate**: ~30 min audio + 1h integration

## CATEGORIA P3 — INFRASTRUCTURE (workflow, NOT app feature)

### P3.1 — Codex CLI workflow potenziamento (Andrea mandate "più proattivo")
- **Origin**: 2026-05-15 PM Andrea
- **Owner**: Andrea decision + Claude config
- **Status**: codex 0.128.0 + 5 templates `scripts/dev/codex-prompts/` esistenti
- **Need**: Codex pre-edit verification + cross-file consistency + auto-spawn rouge claim detection
- **Estimate**: ~2-3h workflow doc + new templates

### P3.2 — GPT-5.5 Pro esteso setup verify
- **Origin**: 2026-05-15 PM Andrea mandate
- **Owner**: Andrea config Codex CLI
- **Status**: codex 0.128.0 supports model flag, GPT-5.5 availability NOT verified
- **Risk**: MEDIO (model name might be `gpt-5.5-pro-extended` or different — needs verify)
- **Estimate**: ~30 min verify + config + smoke test

### P3.3 — Repo install/evaluation 13 GitHub URLs
- **Origin**: 2026-05-15 PM Andrea
- **Owner**: Codex iter 63+ BG (per-repo evaluation)
- **Status**: NONE installed yet
- **Sub-task per repo** (analyze README + license + utility + risk):
  - `gsd-build` + `gsd-2` + `get-shit-done/USER-GUIDE.md` (context engineering)
  - `topics/claude-code-communication` (workflow patterns)
  - `fcakyon/claude-codex-settings` (ispirazione)
  - `openai/codex-plugin-cc` (Codex inside Claude Code)
  - `karpathy` + `multica-ai/andrej-karpathy-skills/karpathy-guidelines/SKILL.md` (anti-bloat philosophy)
  - `lucasastorian/llmwiki` (knowledge base local)
  - `ching-kuo/claude-codex` + `catlog22/Claude-Code-Workflow` (orchestration patterns)
  - `shakacode/claude-code-commands-skills-agents/docs/claude-code-with-codex.md` (official integration docs)
  - `pnnl/agile-workflows` (workflow inspiration)
- **Estimate**: ~30 min × 13 repo = 6.5h evaluation + selective install ~4h

### P3.4 — AGENTS.md + CLAUDE.md restructure (Shakacode pattern)
- **Origin**: 2026-05-15 PM Andrea
- **Owner**: Claude iter 63
- **Status**: CLAUDE.md project massivo (4000+ righe Sprint history), AGENTS.md NON esistente
- **Need**: AGENTS.md ≤150 righe operativo + CLAUDE.md slim rimando AGENTS.md
- **Estimate**: ~2-3h refactor

### P3.5 — Impeccable plugin install + quality gate finale
- **Origin**: 2026-05-15 PM Andrea
- **Owner**: Andrea install + Claude config
- **Status**: NOT installed (per Andrea check)
- **Estimate**: ~30 min install + config

### P3.6 — Mac Mini reactivation (overlap P0.7)
- vedi P0.7 sopra

## CATEGORIA P4 — KNOWLEDGE BASE (lavoro consolidato non blocking)

### P4.1 — automa/tasks/pending/ 46 atoms cleanup
- **Origin**: Sprint S iter 2-8 atoms tutti pending dir, ma maggior parte DONE per CLAUDE.md history
- **Owner**: Claude iter 63 BG
- **Status**: 46 atoms (S2 11 + S3 11 + S6 9 + S8 12 + others)
- **Risk**: BASSO (cleanup organizzativo)
- **Estimate**: ~30 min audit + move done → `automa/tasks/done/`

### P4.2 — `automa/baseline-tests.txt` 13106 → 13209 sync chore
- **Origin**: iter 62 P0.3 carryover
- **Owner**: Claude iter 63 separate commit chore(iter-63)
- **Estimate**: 5 min

### P4.3 — `AGENTS.md + automa/state/*` 4 file uncommitted carryover decide
- **Origin**: pre-iter-61 carryover
- **Owner**: Andrea decide commit/discard
- **Files**: `AGENTS.md`, `automa/state/heartbeat`, `automa/state/iter-19-harness-2.0-results.json`, `automa/state/parallel-research.json`
- **Estimate**: 10 min review + decide

## Statistics summary

- **Tasks recovered**: ~30 deduped (vs 100+ raw across 10 sessions + 46 pending atoms)
- **P0 blocking iter 63**: 7 tasks (Q-CODEMOD-2 done + 6 active)
- **P1 important iter 63-65**: 7 tasks
- **P2 not blocking**: 11 tasks
- **P3 infrastructure**: 6 tasks
- **P4 knowledge base**: 3 tasks
- **Multi-iter completion expected**: B2 92 esperimenti (multi-sprint), Vol3 refactor (Davide co-author), Lighthouse perf
- **Andrea ratify queue iter 63**: 10+ voci (verb-map-v2 + A4.1e + Q4-Q7 + Q2 SSH + Q3.5 + Compile Agent license + GPT-5.5 setup + Mac Mini decision + repos selection + Impeccable install)

## Cross-link

- `SESSION-NEXT-ACTIVATION.md` (paste-ready iter 63)
- `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` (iter 62 close 8.9/10)
- `docs/handoff/2026-05-15-iter-62-to-iter-63-handoff.md` (handoff base)
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` (NEW iter 62 close, P0.5 spec)
- `docs/audits/2026-05-15-TEA-FOLDER-AUDIT.md` (NEW iter 62 close, Tea inventory)
- `PARKING-LOT.md` (anti-inflation deferred ideas)
