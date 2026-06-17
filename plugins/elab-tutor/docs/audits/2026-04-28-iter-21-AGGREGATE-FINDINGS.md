# ITER 21 AGGREGATE FINDINGS — 6 agent + 2 bench (HONEST G45)

**Date**: 2026-04-28 21:30 CEST  
**Branch**: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` HEAD `09d47a5`  
**Tot agent runs**: 6 (5 done, 1 in_progress = Esperimenti REAL Playwright)  
**Score recalibrato iter 21 entrance ONESTO**: **5.8-7.0/10** (vs claim iter 18-20 `8.5-8.8/10`)  

---

## 0. Score reality check vs claim

| Dimensione | Claim iter 18-20 | Misura iter 21 onesta | Δ |
|------------|-------------------|------------------------|---|
| Score complessivo | 8.5-8.8/10 | **5.8/10** (Fotografia PROD) | -3.0 |
| Principio Zero V3 lingua | 9.30/10 (R5 bench) | **2.5/10** (200 violations 330 file) | -6.8 |
| Morfismo Sense 2 triplet | 0.70 baseline ADR-027 | **0.72/1.0** (Vol3 problematico 0.55) | =0.0 |
| Grafica Morfismo coerenza | n/a (claim "glassmorphism positivo") | **6.0/10** (794 hex hardcoded, Anti-pattern) | n/a |
| Harness 2.0 bench | 94/94 PASS | **FALSE POSITIVE** (static JSON checks) | -94 |
| Vol/pag VERBATIM prod | implicato by R5 91.80% | **0/3** prod unlim-chat reale | -91.8 |

**Conclusione**: G45 anti-inflation mandate validato — score realistico iter 21 = **5.8-7.0/10**, NON 8.5-8.8/10.

---

## 1. Agent 1 Fotografia PROD readonly — score 5.8/10

File: `docs/audits/2026-04-28-iter-21-FOTOGRAFIA-PROD-readonly.md`

P0 findings:
1. ~~Compile-proxy CORS BLOCKED~~ → **VERIFICATO orchestrator**: compile-proxy HTTP 200 return `{success:false, errors:"Errore di compilazione"}` con `code` field. Edge Fn UP. Agent 1 saw stale cache.
2. **UNLIM ChatOverlay HTTP 400** → **VERIFICATO orchestrator**: bug guest flow (sessionId UUID required, anonymous user does NOT generate). Frontend P0 fix.
3. **License key hardcoded `ELAB2026`** in `WelcomePage.jsx:107` — bypass triviale client-side. **CONFIRMED** P0.
4. **Vol/pag VERBATIM 0/12** + **kit fisico 0/12** in 12 sample UNLIM responses — viola PZ V3 rule 2/9/12. **VERIFICATO orchestrator** prod unlim-chat 0/3 Vol/pag verbatim 5 prompt bench iter 21 (Agent finding ROBUST).
5. **91/92 esperimenti untested live** — Andrea mandate "MOLTI ESPERIMENTI NON FUNZIONANO" remains unverified pending Agent 4 in_progress.

P1 findings:
- Modalità UI mostra 3 (Già Montato/Passo Passo/Libero) vs mandate 4 (manca Percorso, no Guida-da-errore) → ADR-025 PROPOSED implementation pending iter 22
- Libero mode ibrido (NO empty NO auto-Percorso) → mandate iter 18 PM violato
- Edge Fn cold-start 503 first call → fixable with keep-warm cron

API surface verified: `window.__ELAB_API` espone 62 funcs + `unlim` namespace 17 funcs (composite handler, speakTTS, listenSTT, captureScreenshot, mountExperiment, ecc).

---

## 2. Agent 2 Volumi narrative MINUTA — score 0.72 (ADR-027 baseline 0.70 ✓)

File: `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (406 LOC)

Per-volume findings:
- **Vol1 esemplare** narrative continuum (0.85) — 38/38 lesson-paths 1:1 mapping libro
- **Vol2 black hole cap11** (0.78) — Glossario PDF cita 5 termini diodi protezione, ZERO esp pratici libro+digitale
- **Vol3 PROBLEMATICO** (0.55) — alias duplicati cap6/cap8, esp7 PWM/fade/toggle/contatore/debounce sono pezzi staccati cap8 messi cap7, cap9-12 incomplete (libro V0.8.1), 3 extra esp solo-software anti-Morfismo

**Andrea iter 18 PM mandate "esperimenti volumi variazioni vs ELAB pezzi staccati" VALIDATO oggettivamente**:
- Vol1 = variazioni stesso tema OK
- Vol3 = pezzi staccati confermato

Refactor pending (ADR-027 iter 22-25):
- Schema flat 95 file → grouped ~27 file per-capitolo
- 7 esperimenti SUPERFLUI da rimuovere (alias morse/semaforo/mini/serial + 3 lcd/servo/simon)
- 6-8 esperimenti MISSING (V2 cap11 diodi protezione, V3 cap9-12 motore/diodi/robot Arduino)

5 decisioni Davide queue iter 22:
1. Completare libro Vol3 V0.9 cap9-12
2. Vol2 cap11 → libro continuum O ELAB only?
3. Naming alias V3 (rimuovere O ribattezzare?)
4. Schema lesson-paths-narrative grouped struct ratify
5. UAT iter 25 close per refactor

---

## 3. Agent 3 Linguaggio audit — score 2.5/10 (gap -6.8 vs claim 9.30)

File: `docs/audits/2026-04-28-iter-21-LINGUAGGIO-AUDIT.md` (337 LOC)

Numbers:
- ~330 file scanned (154 components + 37 services + 94 lesson-paths + 21 supabase + 25 data)
- ~150-200 imperative singolare violations cumulato
- "Ragazzi," coverage <2% messaggi user-facing (~25-50 / 1410 messaggi)
- ~80-100 mention `Volume N` o `Capitolo N` SENZA pagina specifica (parafrasi violation)
- 60-word rule encoded LIVE (`system-prompt.ts`, `principio-zero-validator.ts`, `api.js BREVITY_RULE`) + R5 91.80% PASS Edge Fn
- Analogia 483+ hit positive (concept-graph, curriculumData, knowledge-base)

Top 10 worst files iter 22+ codemod priority:
1. `PrivacyPolicy.jsx` 15 violations
2. `StudentDashboard.jsx` 13 violations
3. `TeacherDashboard.jsx` 12 violations
4. `LavagnaShell.jsx:308` + `useGalileoChat.js:19,700` singular leak
5. `experiments-vol2.js` + `experiments-vol3.js` build steps "Collega"/"Inserisci" singular ~20 hit
6. `lesson-paths/v2-cap8-esp1.json` 9 violations
7. `lesson-paths/v1-cap11-esp2.json` 8 violations
8. `lesson-paths/v3-cap7-mini.json` 7 violations
9-10. ...

Recommendation iter 22:
- Codemod `scripts/codemod-linguaggio-plurale.mjs` + dry-run + manual review
- Schema `book_quote: {vol, pag, text_verbatim}` lesson-paths add
- ESLint custom rule `lint-principio-zero.mjs` UI auto-check

---

## 4. Agent 5 Persona simulation — 2 pilot scores 4.0-6.5/10

File: `docs/audits/2026-04-28-iter-21-PERSONA-SIM.md` (170 LOC)

Critical: Persona agent vide HTTP 400 prod unlim-chat → fallback offline RAG ("Risposta dalla guida locale").

Pilot personas:
- **Primaria nuova**: 6.5/10 — analogia "porta girevole" decente, 53 parole, MA NO "Ragazzi," NO Vol/pag verbatim, non risponde alla didattica (parla del LED, non come spiegarlo)
- **Impaziente**: 4.0/10 — 48 parole (NOT "30 sec"), analogia infantile "piatto/forchetta" cringe per adulto, citation Vol.1 pag.29 random apparsa solo qui

Cross-persona patterns:
1. Stessa analogia "porta girevole" servita a personas opposte → fallback NON discrimina contesto
2. "Ragazzi," opening 0/2
3. Citation Vol/pag inconsistente (1/2 random)
4. Tono mismatch persona impaziente

Recommendation Morfismo Sense 1.5: classify (esperienza docente, vincolo tempo, bisogno) client-side prima Edge Fn, fallback offline RAG che rispetta stessi flag.

**HONEST**: backend `unlim-chat` non era down — era guest flow gap (sessionId required). Agent 5 finding revisited.

---

## 5. Agent 6 Grafica audit — score 6.0/10

File: `docs/audits/2026-04-28-iter-21-GRAFICA-AUDIT.md` (270 LOC) + `iter-21-grafica-{homepage,lavagna}.png`

Findings:
- Design system robusto (235+ CSS vars) MA **794 hex hardcoded brand bypassano i token** = drift severe
- 132 hex fills SVG simulator alcune kit-faithful (Navy #1E4D8C, Lime #4A7A25), altre **GENERIC flat-UI (#3498db, #3570C0) — Anti-pattern Morfismo VIOLATO**
- `FloatingToolbar.jsx:24-62` 6 inline SVG generic, NON importa `ElabIcons` (solo 9 file su decine)
- Iconografia ElabIcons 30 icone Feather/Lucide-style stroke 2 — **NON derivate volumi cartacei** (mandate iter 18 PM violato)
- 1 console error live: `unlim-chat` Edge Fn HTTP 400 al boot (sessionId fix)
- 1 touch target <44px (H1 esperimento 37px)
- Header pills "Manuale/Video/Fumetto" font Arial 13.3px (Open Sans NON applicato)
- Morfismo Sense 1.5 NON visibile runtime — layout statico per tutti
- NO MUI / tailwind / bootstrap (triplet tecnico OK)

Top 10 fix iter 22+:
- P0: codemod 794 hex → tokens, sostituzione hex generic simulator, VolumeIllustrationIcon set, Morfismo runtime stub
- P1: FloatingToolbar → ElabIcons, header font fix, touch H1 fix, mascotte SVG, fix Edge 400
- P2: kit-vs-svg matrix audit fisico

Mockup Direzione A "Volume Vivente" raccomandata: mascotte SVG handcrafted + iconografia hand-drawn ink + photo-kit blend NanoR4 = differenziatore vs Tinkercad/Wokwi/LabsLand.

---

## 6. Together Llama 3.3 70B benchmark gold-set 5 prompts

File: `automa/state/iter-21-llama-bench-results.json`

Score Llama 3.3 70B Turbo:
- 4/5 prompts PASS (1 timeout single instance)
- Ragazzi 4/4 ✓
- Vol/pag VERBATIM 4/4 ✓ ← HUGE WIN vs prod 0/3
- Analogia 4/4 ✓
- Kit fisico 4/4 ✓
- Word count avg 41 (37-44 range, all ≤60)

Cost: ~$0.00015/response → $7-10/mo @ 1000 classes 5 lessons (vs Scaleway VPS GPU $400+/mo).

**RECOMMENDATION iter 22 ratify**: switch UNLIM main LLM Gemini Pro → Llama 3.3 70B Turbo Together (serverless, no infra mgmt). Fallback chain Llama 3.3 70B Together → Gemini Flash → Gemini Flash-Lite. RunPod self-host SOLO se volume >50K req/giorno.

---

## 7. Bench prod unlim-chat current vs Llama 3.3 70B side-by-side

| Metric | Prod unlim-chat (Gemini Flash 25%) | Together Llama 3.3 70B Turbo |
|--------|-------------------------------------|-------------------------------|
| Sample n | 5 | 5 |
| Successful parse | 3/5 (2 JSON parse errors — control chars unescaped) | 4/5 (1 timeout) |
| Ragazzi present | 3/3 (100%) | 4/4 (100%) |
| **Vol/pag VERBATIM** | **0/3 (0%)** | **4/4 (100%)** |
| Analogia | 3/3 (100%) | 4/4 (100%) |
| Kit fisico breadboard | 1/3 (33%) | 4/4 (100%) |
| Word count avg | 44 | 41 |

**P0 iter 22 fix priority**: `unlim-chat` Edge Fn returns malformed JSON 40% calls (control chars not escaped). Server-side fix needed.

---

## 8. RunPod state honest

Pod `elab-iter18-a6000` RTX A6000:
- Status RUNNING uptime 6h+, balance $11.15 (–$2.50 from $13.63)
- Bootstrap V1 partial: Ollama Qwen2.5 7B + Qwen2.5-VL 7B downloaded ✓, Whisper Turbo alive port 9000 ✓
- BGE-M3 embed BROKEN: torch CVE-2025-32434 requires torch>=2.6 upgrade
- Coqui XTTS BROKEN: pip blinker uninstall fail
- FLUX + ClawBot dispatcher: NEVER STARTED (set -e killed script)
- Bootstrap V2 vLLM scritto `scripts/runpod-bootstrap-v2-vllm.sh` per iter 22 retry

GPU memory used: 1964 MiB / 49140 MiB (4%) — vastly underutilized.

**Iter 22 action**: torch upgrade + retry V2 vLLM bootstrap (target Llama 3.1 8B AWQ + Qwen2.5-VL + BGE-M3 + FLUX + Whisper + XTTS + ClawBot all alive 8 services).

---

## 9. Mac Mini state honest

- SSH `progettibelli@100.124.198.59` working (Tailscale)
- Repo synced HEAD `09d47a5`
- Launchctl `com.elab.mac-mini-autonomous-loop` ALIVE pid=23944
- 4 cron alive (stress 6h + wiki 22:30 daily + volumi-diff Sun 03:00 + heartbeat 30min)
- Loop logic stub: HEARTBEAT every 5min + watch `~/.elab-trigger` for manual dispatch
- D2 Wiki Glossario Tea ingest dispatched iter 21 (`~/.elab-trigger` 279 bytes)

**Iter 22 action**: promote loop from heartbeat-only to proactive task generation (read `~/.elab-task-queue`, dispatch concrete work).

---

## 10. Andrea ratify queue iter 21 entrance status

| # | Voce | Iter 18-20 status | Iter 21 verify |
|---|------|---------------------|----------------|
| 1 | Modalità 4 simplification ADR-025 | PROPOSED | PROPOSED, Andrea ratify pending |
| 2 | Libero auto-Percorso UX | PROPOSED | PROPOSED |
| 3 | Già Montato implementation | PROPOSED | PROPOSED |
| 4 | ClawBot consapevolezza onniscenza-bridge | PROPOSED | PROPOSED |
| 5 | Content safety guard 10 rules ADR-026 | PROPOSED | PROPOSED |
| 6 | Volumi narrative refactor ADR-027 | PROPOSED | PROPOSED + agent 2 audit DONE |
| 7 | RunPod $13 stessi modelli | Andrea OK iter 18 | ✅ EXECUTING bootstrap pod, $11.15 left |
| 8 | Vercel env compile-proxy URL switch | PENDING | ✅ DONE silenziosamente Andrea 57m ago |
| 9 | Mistral PAYG signup | PENDING | PENDING |
| 10 | Tea co-founder equity 25% | PENDING | PENDING |
| 11 (NEW) | UNLIM main LLM migration Gemini → Llama 3.3 70B Turbo | n/a | **PROPOSED iter 21** based on bench |

Open: 9 voci.

---

## 11. P0/P1 fix list iter 22

**P0** (block iter 22 close):
1. **UNLIM Edge Fn JSON malformed control chars** — 40% calls fail JSON parse client-side
2. **UNLIM guest flow sessionId** — frontend genera UUID per anonymous OR redirect login
3. **UNLIM Vol/pag verbatim 0/3 prod** — switch to Llama 3.3 70B Turbo OR Gemini Pro tuning
4. **License key hardcoded** `WelcomePage.jsx:107` ELAB2026 — server-side validation
5. **Modalità Percorso missing UI** — implement ADR-025 4-mode

**P1** (block iter 22 quality):
6. Lingua codemod 200 imperative singolare violations top 20 file
7. Volumi Vol3 alias duplicati ribattezzare
8. Grafica 794 hex tokens migration
9. ElabIcons importer wide adoption (`FloatingToolbar.jsx` first)
10. Harness 2.0 → REAL Playwright (Agent 4 in_progress shipping spec)
11. Mac Mini autonomous loop promote to task gen
12. RunPod V2 vLLM bootstrap retry torch>=2.6

---

## 12. Sprint T iter 22 entrance plan

P0 entrance:
1. Andrea ratify 9 voci queue (modalità + safety guard + Volumi narrative + Mistral + Tea + Llama migration)
2. CoV pre-flight: vitest + build + Vercel + Edge Fn + Mac Mini + RunPod V2
3. Sync RunPod V2 vLLM bootstrap (torch upgrade + retry)
4. Aggregate Agent 4 Esperimenti REAL Playwright real broken count

P0 spawn 5-agent OPUS Pattern S iter 22:
- planner-opus: 16 ATOM-S22 (P0 6 fix + P1 6 fix + 4 ratify implement)
- architect-opus: ADR-028 UNLIM Llama migration + ADR-029 guest flow sessionId
- gen-app-opus: codemod linguaggio + content safety guard 10 rules deploy + JSON escape fix Edge Fn
- gen-test-opus: harness REAL Playwright wire-up + linguaggio ESLint rule + 92 esp regression
- scribe-opus: audit + handoff iter 22→23 + CLAUDE.md update

**Score progression target**: iter 21 5.8-7.0 → iter 22 7.0-7.5 conditional 5 P0 closed.

---

**END AGGREGATE iter 21 entrance findings**.
