# Roadmap 30 giorni — ELAB Tutor iter 63 → iter 90

> Provenance: 2026-05-15 iter 62 close. Per Andrea mandate "ROADMAP concreta: oggi, 48 ore, 7 giorni, 30 giorni".
> Anti-inflation: NO claim, ONLY targets verifiable + dependencies espliciti + Andrea ratify gates.

## OGGI (iter 62 close DONE)

✅ Iter 62 commit `d2428e9d` push origin
✅ Q-CODEMOD-2 teacher_message + teacher_response codemod 10 viol Vol1 → 0 STRICT case-sensitive
✅ Tests 91/91 PASS sprint-u-codemod (79 iter 61 + 12 NEW iter 62 B1.5)
✅ Anti-regression 4-gate FERREO ALL PASS (vitest 13209 + build 4m53s + validator 94/94 + Codex C-V CONFIRM)
✅ `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` shipped
✅ `docs/handoff/2026-05-15-iter-62-to-iter-63-handoff.md` shipped
✅ `SESSION-NEXT-ACTIVATION.md` paste-ready iter 63 (Andrea verbatim)
✅ `docs/audits/2026-05-15-TEA-FOLDER-AUDIT.md` (30+ files inventoried)
✅ `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` ADR draft (Andrea specs Nano R4)
✅ `TASKS-RECOVERED.md` (deduped backlog P0-P4)
✅ `PARKING-LOT.md` (anti-inflation deferred ideas)
✅ `ROADMAP-30-DAYS.md` (this file)

## 48 ORE (iter 63 — entrance + first vertical slice)

### Entrance (~30 min Andrea + 10 min Claude)
- Andrea git pull + paste `SESSION-NEXT-ACTIVATION.md`
- Andrea ratify queue 10 voci (verb-map-v2 + A4.1e + Q4-Q7 + Q2 SSH + Q3.5 + Compile Agent license + GPT-5.5 + Mac Mini + repos + Impeccable)
- Andrea decide channels strategy Prof Pilot Mode (Custom GPT vs Apps SDK vs both)
- Andrea ssh ping Mac Mini Tailscale `100.124.198.59` decide reactivate/decommission

### Iter 63 P0 work (~16-20h aggregate)
- **P0.1** Vitest baseline sync 13106 → 13209 separate commit chore (5 min)
- **P0.2** Read full `iter-58-brief-tea.md` T3-T8 + relay Andrea (10 min)
- **P0.3** ELAB Compile/Upload Agent vertical slice MVP (~15-20h):
  - BoardProfile JSON `src/boards/arduino-nano-r4.json`
  - SketchBuilder sezioni includes/globals/setup/loop/functions
  - Local Agent server `/health` + `/boards` + `/compile` Blink only
  - 15+ unit tests + 1 integration test (real arduino-cli compile Blink)
  - Forbidden AVR patterns test (10 patterns)
  - Docente-friendly error mapping JSON
- **P0.4** verb-map-v2 expand IF Andrea ratify (~30-50 viol catch, ~2-3h)
- **P0.5** B3 HomePage test guard 4 DOM-text + Playwright toHaveScreenshot baseline (~4-6h)

### Anti-regression mandate iter 63
- vitest 13209+ PRESERVED + new tests added
- npm run build PASS exit 0
- validator 94/94 PASS
- Codex C-V CONFIRM per claim
- Pre-commit + pre-push hook NEVER bypass

## 7 GIORNI (iter 63 close + iter 64-65 entry)

### Iter 64 (target ~24-32h aggregate)
- **B2 92 esperimenti Playwright UNO PER UNO entry 5-10 esp**
  - skill `elab-harness-real-runner` activate
  - per-exp Codex C-V verify + screenshot evidence prod
  - Goal: 5-10 esp PASS prod live audit (multi-iter completion expected 184-276h totale)
- **ELAB Compile/Upload Agent**:
  - `/compile` extension: ogni esperimento ELAB Vol1 (10-15 lesson-paths Blockly compatibili)
  - Real upload Blink Nano R4 hardware Andrea UAT (AND verifica USB permissions Mac)
  - `/compile-and-upload` endpoint
- **Tea iter 58 brief response** (Tea T1+T2 due): Vol3 narrative arc review + Cap.8 refactor draft
- **Glossario Tea integration main app route #glossario** (~4-6h clone external → internal)
- **`cliffhanger_table.json` wire-up Modalità Percorso transitions** (~4h)

### Iter 65 (target ~24-32h aggregate)
- B2 92 esperimenti continuation 10-20 esp
- ELAB Compile Agent: Electron/Tauri packaging skeleton (defer if MVP not stabile)
- AGENTS.md + CLAUDE.md restructure (Shakacode pattern, ≤150 LOC AGENTS.md operativo)
- `bibbia_stilistica.pdf` design tokens extract → `.impeccable.md`
- Repo evaluation 13 GitHub URLs (~6.5h evaluation phase, decide install per-repo)

### Anti-inflation gate iter 65 close
- Score iter 65 ONESTO ≤9.0/10 G45 cap (NO claim 9.0+ senza Opus indipendente review)
- Compile Agent claim "MVP LIVE" ONLY se Andrea Nano R4 reale upload PASS

## 30 GIORNI (iter 66 → iter 90, ~5-8 iter)

### Sprint U close target (iter 70)
- 92 esperimenti audit complete (multi-iter, ~30-50% covered iter 65-70)
- Vol3 narrative refactor in progress (Davide co-author)
- ELAB Compile/Upload Agent beta scuole ready (Electron/Tauri packaging)
- Lighthouse perf optim ChatbotOnly + EasterModal (perf ≥90 target)
- Onniscenza canary 5%→25%→100% rollout

### Sprint V open (iter 71+)
- Full mBlock-style features (post Riccardo decisione finale Blockly vs mBlock)
- A.7 Onnipotenza Deno port 62-tool subset (post Andrea ratify)
- Vol3 narrative refactor 92→140 lesson-paths (Davide consegna v0.14)
- Mobile app docente companion evaluation (post pilot scuole feedback)

### Pilot scuole iter 75-90
- 5+ scuole production deployment (Giovanni outreach)
- UAT real classe sessions
- Cronologia sessioni Google-style + UNLIM-generated description
- Multi-classe Dashboard (post 5+ scuole)
- License decision Arduino CLI redistribution (commerciale OR docente install)

## Dependencies grafo

```
Andrea ratify queue 10 voci ─┬─→ verb-map-v2 (P0.4)
                              ├─→ A4.1e Vol3 carryover (Davide co-author)
                              ├─→ Q2 SSH PREREQ (BLOCKING Phase 1 Blockly)
                              ├─→ Q3.5 nanor4 FQBN (gate Q2)
                              ├─→ Compile Agent license (BLOCKING distribution)
                              ├─→ GPT-5.5 Pro setup (Codex CLI verify)
                              ├─→ Mac Mini reactivation (BLOCKING autonomous loop)
                              ├─→ Repo evaluation (per-repo decide install)
                              └─→ Impeccable plugin (quality gate)

Tea iter 58 T1-T8 response ───→ Vol3 narrative refactor + Cap.8 draft
Davide Vol3 v0.14 ───────────→ ADR-027 narrative refactor 92→140 lesson-paths
Mac Mini reactivation ───────→ autonomous Ralph Loop + 8-agent overnight
Pilot scuole feedback ───────→ Multi-classe Dashboard + Mobile app
```

## Risk register iter 63-90

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Mac Mini physical broken (post 23-day uptime fail) | MEDIA | MEDIO | Andrea Strambino visit OR commit termination + alternative orchestration Mac Andrea |
| Davide Vol3 v0.14 delay | ALTA | ALTO | Tea iter 58 brief Tea T1 review baseline iter 57 work as interim |
| Arduino CLI license commercial cost prohibitive | BASSA | ALTO | Distribute installer separate (NO bundled, NO redistribution issue) |
| Andrea ratify queue paralysis (10+ voci) | MEDIA | MEDIO | Batch ratify session ~30 min iter 63 entrance, group voci by theme |
| 92 esperimenti audit reveal massive broken (kit fisico mismatch) | MEDIA | ALTO | Per-exp Codex C-V triage + Andrea decisione fix vs deprecate per-exp |
| Codex CLI GPT-5.5 model not available | MEDIA | BASSO | Fallback gpt-5 + dichiarazione fallback usage (NO inflation) |
| Repo install bloat (13 repos) | ALTA | MEDIO | Per-repo eval + selective install (only repos riducono debito tecnico) |

## Score progression target ONESTO

| Iter | Date target | Score target | Conditional |
|---|---|---|---|
| iter 62 | 2026-05-15 ✅ | **8.9/10** | DONE (4-gate FERREO + honesty delta surfaced) |
| iter 63 | 2026-05-16+ | **9.0/10** | conditional B3 HomePage guard + verb-map-v2 + Compile Agent skeleton |
| iter 65 | 2026-05-22+ | **9.1/10** | conditional 10 esp B2 audit + Tea T1+T2 response + Glossario integration |
| iter 70 | 2026-06-05+ | **9.2/10** | conditional 30+ esp B2 audit + Compile Agent beta + Lighthouse perf |
| iter 80 | 2026-06-25+ | **9.3/10** | conditional 60+ esp + Vol3 refactor in progress + 1 pilot scuola live |

**G45 mandate**: NO claim 9.5+ senza Opus indipendente review. Cap rigoroso ZERO override.

## Anti-debito tecnico cumulativo

Per ogni iter 63-90:
- Test count NEVER scendere baseline canonical
- Build PASS pre-commit hook gate
- Codex Pattern C-V mandate per claim
- Single source of truth principle (NO duplicates: design = `.impeccable.md`, sprint history = CLAUDE.md, board profile = JSON canonical, narrative arc = `cliffhanger_table.json`)
- Surgical change only (NO refactor "già che ci sei")
- Honesty delta surface upfront (NO claim inflation post-fact)

## Cross-link

- `SESSION-NEXT-ACTIVATION.md` (paste activation iter 63)
- `TASKS-RECOVERED.md` (active backlog P0-P4)
- `PARKING-LOT.md` (deferred ideas)
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` (Compile Agent ADR)
- `docs/audits/2026-05-15-TEA-FOLDER-AUDIT.md` (Tea inventory)
- `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` (iter 62 close 8.9/10)
