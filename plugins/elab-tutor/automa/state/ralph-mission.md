# Ralph Loop Mission — PDR v3 DEFINITIVO

**Read-only per builder e auditor.** Questo file definisce l'obiettivo letterale.

## Obiettivo (testo originale del comando /ralph-loop:ralph-loop)

> PDR v3 DEFINITIVO: allinea 3 Vol3 al libro + UNLIM onnisciente-onnipotente con Kokoro TTS e Porcupine wake word + fix bug lavagna e toolbar + E2E Playwright/Control Chrome + ricerca web TTS/LLM 2026 + valutazione OpenClaw + useUnlimNudge integrato + dashboard dati reali Supabase. Leggi docs/plans/2026-04-17-session-summary.md + docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md + docs/strategia/2026-04-17-unlim-jarvis-architecture.md + docs/strategia/2026-04-17-stack-tts-llm-slm.md. Principio Zero, CoV ogni 3 task, zero regressioni. Baseline 11983 test PASS. MCP OBBLIGATORI: WebSearch + Playwright + Control Chrome. --max-iterations 100

## Decomposizione operativa in 8 deliverable

D1 — **Allineamento Vol3 al libro** (TASK 3, 4, 5 del PDR)
  - v3-cap6-esp1 → libro p.56 (LED + digitalWrite(13) + 470Ω)
  - v3-cap7-esp1 → libro p.65 (pulsante + digitalRead + if/else)
  - v3-cap7-esp5 → libro p.77 (analogRead + Serial Monitor)

D2 — **UNLIM onnisciente e onnipotente**
  - bookCitation attivo su ogni risposta con experimentId (✓ commit 8293e3f)
  - useUnlimNudge integrato (✓ commit 62c9702)
  - Vision E2E verificato live (TASK 8)
  - Voice E2E verificato live (TASK 9)

D3 — **Kokoro TTS in produzione**
  - Proxy /api/tts attivo (✓ commit 927cdbd)
  - Kokoro deploy su VPS (FUORI SCOPE RALPH — richiede deploy Andrea)

D4 — **Porcupine wake word**
  - VALUTAZIONE completata in docs/strategia/2026-04-18-ricerca-web-validata.md: Porcupine NON adatto a produzione (free tier 1 MAU, enterprise €6000+/anno) → usare Web Speech API o openWakeWord
  - Stato: REJECTED-WITH-ALTERNATIVE

D5 — **Bug lavagna e toolbar**
  - Drawing persistence per experimentId (✓ commit 59e8fce)
  - FloatingToolbar drag (✓ commit 62c9702)

D6 — **E2E Playwright/Control Chrome** (TASK 8, 9)
  - Richiedono pre-approval tool Andrea

D7 — **Ricerca web TTS/LLM 2026** (TASK 11b)
  - docs/strategia/2026-04-18-ricerca-web-validata.md (✓ commit 59e8fce)
  - Numeri validati: Gemini Flash $0.30/$2.50, Flash-Lite $0.10/$0.40, Porcupine 1 MAU, Kokoro #1 TTS Arena

D8 — **Valutazione OpenClaw** (TASK 11a)
  - docs/strategia/2026-04-18-openclaw-valutazione.md (DA FARE)

D9 — **Dashboard docente dati reali Supabase** (TASK 11)
  - Richiede credenziali + schema — ESCALATE

## Principi operativi (citazione letterale comando)

1. **Principio Zero** — "CHIUNQUE accendendo ELAB Tutor deve essere in grado, SENZA conoscenze pregresse, di spiegare ai ragazzi" (CLAUDE.md). Ogni TASK deve avvicinare il prodotto a questa regola.
2. **CoV ogni 3 task** — dopo ogni 3 commit del builder, auditor esegue verifica estesa (git log -6, npx vitest run full, npm run build, lettura diff) e scrive audit consolidato.
3. **Zero regressioni** — test count non deve mai scendere dal massimo storico registrato in ralph-metrics.json
4. **Baseline 11983** — baseline originale del PDR v3. Baseline corrente >=12039 dopo le 4 commit della sessione interactive. La nuova baseline è il massimo storico.
5. **MCP obbligatori** — per TASK E2E: WebSearch (disponibile), Playwright (disponibile ma richiede approval Andrea), Control Chrome (disponibile ma richiede approval Andrea).

## --max-iterations 100

100 run builder + 100 run auditor massimo. Contatore in ralph-metrics.json. Al raggiungimento: auto-ESCALATE per review Andrea.

## Fonti di verita' (read-only)

- docs/plans/2026-04-17-session-summary.md
- docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md
- docs/strategia/2026-04-17-unlim-jarvis-architecture.md
- docs/strategia/2026-04-17-stack-tts-llm-slm.md
- docs/strategia/2026-04-18-ricerca-web-validata.md (numeri 2026 verificati)
- CLAUDE.md
- automa/state/commercial-readiness.json (score obiettivo 30 criteri)

## Definizione operativa di "successo mission"

La mission e' considerata COMPLETATA solo quando TUTTE queste sono vere, verificate da auditor con comando:

- [ ] D1: 3 esperimenti Vol3 allineati (git grep "pag.*56|pag.*65|pag.*77" in experiments-vol3.js + test parity passing)
- [ ] D2: vision + voice E2E test passano in CI (richiede Andrea approval tool)
- [x] D3 parziale: proxy /api/tts deployato (test manuale curl)
- [x] D4: valutazione Porcupine documentata
- [x] D5: bug fixati (drag + persistence)
- [ ] D6: E2E in CI
- [x] D7: ricerca web completata
- [ ] D8: OpenClaw doc creato
- [ ] D9: dashboard reale (richiede Andrea)

Status attuale mission: **6/9 deliverable parziali o completi, 3 bloccati su Andrea**.

## Escalation path

Qualsiasi task che richieda:
- Credenziali Supabase / deploy / tool approvals
- Modifiche package.json / npm install
- Touch su file critici (CircuitSolver, AVRBridge, SimulatorCanvas, api.js core)
- Decisioni strategiche (pricing, legal, partnership)

→ Non procedere. Scrivi ESCALATE in ralph-next-task.md + log "awaiting Andrea: <motivo>".
