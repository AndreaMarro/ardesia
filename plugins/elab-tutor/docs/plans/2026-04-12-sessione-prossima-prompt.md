# PROMPT PROSSIMA SESSIONE — 12 aprile 2026

> Copia TUTTO questo come primo messaggio della prossima sessione Claude Code Terminal.
> Per Claude Web: copia la sezione CLAUDE WEB in fondo.

---

## CONTESTO IMMEDIATO

Riunione LUNEDÌ con **Omaric Elettronica** e **Giovanni Fagherazzi** (ex Arduino Global Sales Director).
Il prodotto DEVE funzionare DAVVERO. NO DEMO. NO DATI FINTI.

## PRINCIPIO ZERO

"Rendere facilissimo per CHIUNQUE spiegare i concetti dei manuali ELAB e spiegarne gli esperimenti SENZA ALCUNA CONOSCENZA PREGRESSA. Arrivi e magicamente insegni."

ELAB Tutor e UNLIM sono gli STRUMENTI con cui l'insegnante diventa immediatamente in grado di spiegare, divertendosi. Il docente è il protagonista, non UNLIM.

## STATO ATTUALE (audit 11/04/2026)

```
Test: 2488 pass, 97 file, 0 fail
Build: PASS (1m 2s, 2991 KiB precache)
Deploy: LIVE su elabtutor.school (200 OK)
CI: E2E GREEN, CI/CD fail solo per security/deploy config
BuildSteps: 92/92 (100%) — Vol1 38, Vol2 27, Vol3 27
ScratchXml: 31 (Vol3 96%)
Lesson Paths: 94 (100%+2 bonus)
RAG chunks: 639 (espansi da 246)
Voice commands: 41
Bentornati flow: INTEGRATO e LIVE
Chapter-map UI: INTEGRATO (titoli Tea visibili)
Simulable labels: 14 esperimenti etichettati
"area di lavoro": ZERO residui
Nanobot: DeepSeek primario (DA CAMBIARE A GEMINI)
```

## 3 TASK CRITICI PER QUESTA SESSIONE

### TASK 1: Switch Nanobot a Gemini (P0)

Andrea ha detto: **SOLO Gemini, NO DeepSeek, NO Kimi.**

Il Nanobot Render (elab-galileo.onrender.com) usa DeepSeek come primario.
Il Nanobot Supabase Edge usa già Gemini (70/25/5 Flash-Lite/Flash/Pro).

**Azioni**:
1. Identifica dove è configurato il provider primario nel server Render
2. Il repo Render potrebbe essere su GitHub: cerca `elab-galileo` o simile
3. Cambia primary da `deepseek` a `gemini`
4. Rimuovi `deepseek` e `kimi` dalla lista provider
5. Verifica con `curl /health` che il primary sia `gemini`
6. Testa con 10 domande che le risposte siano corrette

**Credenziali**:
- Render dashboard: Andrea deve dare accesso o env vars
- Supabase Edge: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
- Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...FDBSCTOajfu0C3wWWfAQoM8qLQcmodxI5k6H_pkJOhQ`

### TASK 2: RAG Upload — Embeddings + Supabase (P0)

639 chunk pronti in `data/rag/all-chunks-expanded.json`. Servono embeddings + upload.

**Azioni**:
1. Usa skill `elab-rag-builder`
2. Genera embeddings con `gemini-embedding-001` (3072 dim)
3. Upload a Supabase pgvector (progetto euqpdueopmlllqjmqnyb)
4. Verifica: `SELECT count(*) FROM volume_chunks` deve essere >= 639
5. Testa RAG search con 5 query

**Credenziali**:
- Gemini API key: serve GOOGLE_API_KEY (chiedere ad Andrea o usare la chiave nel .env)
- Supabase service key: `sbp_86f...` (nel MEMORY.md, chiedere ad Andrea per il completo)
- Script: `scripts/upload-rag-supabase.py`

### TASK 3: E2E Playwright — Test Piattaforma Reale (P1)

3 spec Playwright esistono ma MAI eseguiti:
- `e2e/09-chapter-map-navigation.spec.js`
- `e2e/10-scratch-blockly.spec.js`
- `e2e/11-teacher-full-journey.spec.js`

**Azioni**:
1. `npx playwright install chromium --with-deps`
2. `npx playwright test` — esegui i 3 spec
3. Se falliscono: documenta COSA fallisce, fixa se possibile
4. Se passano: screenshot come prova

## PDR (Piano Di Rientro) — Metodologia

Segui questo ciclo per OGNI task:

```
1. LEGGI: docs/sprint/S2-PROGRESS.md + HANDOFF.md
2. BRANCH: git checkout -b sprint/s3-[nome-task]
3. IMPLEMENTA: modifica minima, test dopo ogni step
4. VERIFICA: npx vitest run (>= 2488), npm run build (PASS)
5. COV: documenta metriche in docs/sprint/S3-COV-[task].md
6. AUDIT: confronta con gold standard (Vol1 buildSteps)
7. COMMIT: messaggio descrittivo con metriche
8. PUSH: git push origin sprint/s3-[nome-task]
9. PR: gh pr create con test plan
10. MERGE: solo dopo CI verde
11. DEPLOY: npx vercel --prod --yes
12. VERIFY LIVE: curl elabtutor.school + test Chrome
```

## OBIETTIVI AGGIUNTIVI

### Parità Volumi ↔ Simulatore
- Leggi `docs/sprint/AUDIT-PARITA.md` — 349 righe di discrepanze
- Leggi volumi da `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/`
- I testi estratti sono in `docs/volumi-originali/VOLUME-{1,2,3}-TESTO.txt`
- Priorità: Cap 6 Vol1 (primo esperimento che vedrà Giovanni)

### UNLIM Onniscienza via RAG
- Dopo upload RAG, testa 30 domande su esperimenti diversi
- UNLIM deve usare LE STESSE PAROLE dei volumi (non inventare)
- Linguaggio 10-14 anni, analogie quotidiane
- "Non lo so" quando non sa — MAI inventare

### Test — Verso 3000+
- Ogni task produce 50+ test
- COV report dopo ogni blocco
- Stress test: 10 domande al nanobot in parallelo
- E2E: flusso completo docente su Chrome

## REGOLE FERREE

1. **SE UNA COSA SEMBRA FINITA, NON LO È** — verificala
2. **NO push su main** — sempre branch + PR
3. **CI deve essere verde** prima di merge
4. **Prova oggettiva** per ogni task (screenshot, output, count)
5. **Controlla Claude Web** ogni 20 minuti
6. **MAI auto-celebrarsi** — brutale onestà
7. **NO REGRESSIONI** — test >= 2488 sempre

## FILE CRITICI DA LEGGERE

```
CLAUDE.md                                    — regole tecniche
docs/sprint/DIRETTIVE-CLAUDE-WEB.md          — regole ferree
docs/sprint/HANDOFF.md                       — stato corrente
docs/sprint/S2-PROGRESS.md                   — progress tracker
docs/sprint/AUDIT-PARITA.md                  — parità volumi (349 righe)
docs/plans/2026-04-11-sprint-2-principio-zero.md — piano sprint 2
docs/plans/2026-04-11-claude-web-workplan.md — workplan Claude Web
automa/learned-lessons.md                    — errori da non ripetere
automa/context/UNLIM-VISION-COMPLETE.md      — visione UNLIM
src/data/chapter-map.js                      — alias mapping Tea
```

## COMANDI UTILI

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
npx vitest run                    # Test (>= 2488)
npm run build                     # Build
npx vercel --prod --yes           # Deploy
gh run list --limit 4             # CI status
curl -s "https://elab-galileo.onrender.com/health" | python3 -c "import sys,json;print(json.load(sys.stdin)['primary'])"
```

---

## SEZIONE CLAUDE WEB

Per Claude Code Web, incolla questo:

> `git fetch origin main && git merge origin/main --no-edit` — FALLO SUBITO. I file workplan/direttive/volumi sono su main ma il tuo branch è partito prima. Dopo il merge leggi `docs/plans/2026-04-11-claude-web-workplan.md` e `docs/sprint/DIRETTIVE-CLAUDE-WEB.md`. I tuoi task: (1) testa UNLIM con 30 domande via curl, (2) testa scratchXml su Chrome, (3) audit UX completo su Chrome, (4) scrivi 200+ test. Aggiorna `docs/sprint/S2-PROGRESS.md`. NON toccare ExperimentPicker.jsx o VetrinaSimulatore.jsx. Riunione lunedì. NO DEMO.
