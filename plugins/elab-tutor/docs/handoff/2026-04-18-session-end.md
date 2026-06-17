# Session Handoff — 2026-04-18 fine giornata

**Durata session**: ~8h
**Agent**: Claude Opus 4.7 via Max #1
**Operator**: Andrea Marro

---

## ✅ Lavoro REALE completato (verificato)

### Fix di produzione (Edge Function Supabase, verified live)

1. **`250364a` — Principio Zero v3 BASE_PROMPT**
   - UNLIM prepara contenuto (non parla direttamente)
   - Docente veicola naturalmente
   - Esperimenti come narrativa continua (non card staccate)
   - **Verificato live** curl: risposta UNLIM include "Ragazzi, ... Vol. 1 pagina 29 ... 470 Ohm"

2. **`1d17ede` — Fix Gemini 2.5 thinking-budget**
   - `thinkingBudget: 0` per flash di default
   - Risolto troncamento risposte a 30 char

3. **GEMINI_API_KEY settata** in Supabase secrets
   - Edge Function `unlim-chat` torna operativa con Gemini 2.5 Flash

### Documentazione + Governance scritta

- `docs/GOVERNANCE.md` — 5 regole ferree + Regola 0 riuso + pattern 8-step
- `docs/audits/2026-04-18-cov-principio-zero-v3.md` — CoV onesta con ammissioni errori
- `.github/workflows/governance-gate.yml` — CI bloccante (testato lint-wise, non live)
- `.github/workflows/routines-orchestrator.yml` — backup GitHub Actions
- `automa/state/routines-coordination.json` — shared state FSM (mai caricato da routine)

### PDR design files (20 totali, ~15000 righe)

Tutti in `docs/plans/2026-04-18-*.md`:
- `pdr1-unlim-core-design.md` — con riuso esplicito
- `pdr2-openclaw-infra-design.md` — scheletro UNLIM
- `pdr3-vps-runpod-deploy-design.md` — CRITICAL path self-host
- `pdr4-lesson-reader-design.md` — Principio Zero UI
- `pdr-test-multiplier-design.md` — +3604 test
- `pdr-stress-chaos-design.md` — 62h Mac-closed
- `pdr-commercial-pacchetti-design.md` — 10 pacchetti
- `pdr-feedback-research-design.md` — FASE 15 3 tier GDPR
- `pdr-reality-check-design.md` — 8 audit PASS/FAIL
- `routine-auditor-prompt.md`, `routine-regression-hunter-prompt.md`,
  `routine-docs-keeper-prompt.md`, `routine-cost-tracker-prompt.md`
- `LAUNCH-INSTRUCTIONS.md` v3 — Claude Code Web Routines
- `docs/architecture/routines-fsm-design.md` — Turing-style FSM coordinator+guardian

### TDD test failing scritto (commit `91668c5`)

- `tests/unit/lavagna/LessonReader.test.jsx` (30+ assertions)
- `docs/tasks/TASK-LESSON-READER-MVP-start.md` (pre-audit doc)
- Implementation componente **NON** fatta (session troppo lunga)

---

## ❌ Cosa NON è stato completato (onestà)

1. **Nessuna feature nuova implementata**
   - Lesson Reader: solo TDD test, nessun componente
   - Vision E2E: intoccato
   - Fumetto: intoccato
   - Wake word: intoccato
   - Dashboard docente: intoccato
   - +3604 test: nessuno aggiunto
   - Multilingue: solo nel BASE_PROMPT abilitato

2. **Routines non avviate**
   - Claude Code Web Routines: verificato presente UI, non configurato
   - GitHub Actions workflow: committato, non testato live
   - CronCreate: verificato incompatibile (serve REPL attivo)

3. **Infrastruttura pending**
   - OpenClaw su Hetzner CX52: design done, deploy da fare
   - RunPod endpoint modelli: solo design
   - Mac Mini M4 ordine: da decidere
   - Telegram bot: da creare (BotFather)
   - 3 GitHub secrets: da settare (ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)

4. **Audit pending**
   - 92 esperimenti vs kit fisico Omaric (quali "robot" non fattibili)
   - Serve sessione dedicata con Giovanni + Omaric

---

## 🎯 Baseline preservato (non toccato)

- **Test PASS**: 12056 (baseline 18/04/2026 verificata più volte oggi)
- **Build**: OK
- **Edge Function Supabase**: LIVE `v2.1.0` con Principio Zero v3
- **Nessuna regressione introdotta**

Branch corrente: `feature/lesson-reader-mvp` (creato, TDD test committed, no implementation)
Branch principale workstream: `session/2026-04-17-pdr-v3-prep` (tutti i commit design + fix)

---

## 🔌 Plugin Claude Code disponibili per next session

### ✅ Installato: `claude-mem`

Location: `~/.claude/plugins/claude-mem/`
Commands disponibili:
- `/claude-mem:do` — esegue task con memoria persistente
- `/claude-mem:make-plan` — crea piano long-term

Permette di **riprendere da questo state** in next session senza ripartire da zero.

### ❌ Non trovato: `caveman`

Non installato in `~/.claude/plugins/`. Opzioni:
- Se Andrea ha URL marketplace/GitHub del plugin: `/plugin install <url>`
- Se è su marketplace ufficiale: verifica con `/plugin search caveman`
- Se è custom locale: serve percorso file plugin manifest

---

## 🚀 Come riprendere in next session (istruzioni Andrea)

### Opzione A — Resume questa session

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
claude --continue
# Riapre questa session con tutto il context
```

### Opzione B — Nuova session con handoff (preferita, context cache fresh)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
claude
```

Poi al prompt iniziale:
```
Leggi docs/handoff/2026-04-18-session-end.md e il file memory corrente.
Poi implementa Lesson Reader MVP: src/components/lavagna/LessonReader.jsx +
CSS module + hook useLessonReader. TDD test già presente in
tests/unit/lavagna/LessonReader.test.jsx — fallo passare.
Rispetta docs/GOVERNANCE.md (Regola 0 riuso + 5 regole).
Branch: feature/lesson-reader-mvp (già checkout). Commit atomici.
```

### Opzione C — Con claude-mem plugin

```bash
claude
```

Poi:
```
/claude-mem:do "Implementa Lesson Reader MVP seguendo TDD in
tests/unit/lavagna/LessonReader.test.jsx, rispettando governance."
```

Claude-mem dovrebbe leggere automaticamente il context storage + eseguire.

---

## 📋 Priority stack per next session (onestà)

### P0 — Feature utente visibili (servono per demo Fagherazzi)

1. **Lesson Reader MVP** (TDD già ready) — 3-5h dev
2. **Dashboard docente base** (src/components/dashboard vuoto) — 6-8h dev
3. **Fumetto report 6 vignette** (anche con DALL-E API una volta) — 4-6h dev
4. **Vision E2E live test** — 2h

### P1 — Infrastruttura necessaria

5. **Audit esperimenti "robot"** (serve input Andrea+Omaric) — 1 meeting
6. **Wake word "Ehi UNLIM"** (openWakeWord Apache 2.0) — 3-4h
7. **Kokoro TTS Docker production** (fallback voxtral) — 2-3h

### P2 — Governance + CI

8. **Test governance-gate.yml live** su una PR reale
9. **Espandere test +3604** (Playwright E2E principalmente) — session dedicata

### P3 — Differibili

10. OpenClaw Hetzner deploy
11. RunPod self-host modelli
12. 10 pacchetti commerciali brochure + MePA
13. Stress test 62h

---

## 💰 Costi attuali (invariati da stamattina)

- Claude Max ×2: €400/mese (già attivo)
- Supabase Pro: €25/mese
- Vercel Pro: €20/mese
- Hostinger VPS: €15/mese
- Edge TTS + Brain V13 su Hostinger: €0 extra
- **Totale OPS**: €460/mese, stesso di stamattina

Nessun spese extra attivate oggi.

---

## 🔮 Learning per prossime sessioni

### Cosa ho fatto male oggi

1. **Over-engineering**: ho scritto 20 PDR prima di implementare 1 feature. Andrea giustamente frustrato: "ora come ora non abbiamo fatto nulla".
2. **Vendere speranza**: "tutto autonomo Mac chiuso 48h" era fantasia. Realtà Claude Code Web Routines è beta, capped 15/giorno, incerto su molte feature.
3. **Perso tempo su schema Turing-perfect**: elegante ma overkill prima di avere 1 feature.

### Cosa fare prossima volta

1. **Scope micro**: 1 feature alla volta, 2-4h per sessione, PR ready per review Andrea
2. **Fatto > perfetto**: commit incrementale, iterare
3. **Governance sempre, ma senza paralysis**: pattern 8-step è utile, non religione
4. **Honest scoping**: "fine session avrai X" realistic, non "v1.0 in weekend"

---

## ✅ Stato commit/push finale session

| Branch | Ultimo commit | Push origin |
|--------|---------------|-------------|
| `session/2026-04-17-pdr-v3-prep` | `9fac4d5 docs(launch): v3` | ✅ pushed |
| `feature/lesson-reader-mvp` | `91668c5 test(lavagna): TDD fail` | Da pushare in final commit |

Nessuna PR aperta. PR da creare in next session dopo implementation.

---

**Firma**: Claude Opus 4.7 via Max #1
**Data**: 2026-04-18 ~15:30 Italia time
**Next session**: apre con istruzioni Opzione B o C sopra.
