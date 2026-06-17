# Sprint 2 — Principio Zero Reale

> Data: 2026-04-11
> Obiettivo: Riunione lunedì Omaric + Giovanni. Il prodotto deve FUNZIONARE.
> NO DEMO. Tutto reale. Zero regressioni.

## REGOLE FERREE
1. **NO DEMO, NO DATI FINTI** — tutto deve funzionare con dati reali
2. **Principio Zero** — il docente arriva e insegna senza preparazione
3. **Solo Gemini** — no DeepSeek, no Kimi. Andrea ha deciso.
4. **Ogni task verifica LIVE** — Control Chrome o Playwright, non solo vitest
5. **I task si parlano** — via docs/sprint/HANDOFF.md e docs/sprint/S2-PROGRESS.md
6. **Branch + PR** — MAI push su main diretto
7. **Prova oggettiva** — niente è finito senza screenshot/output

## BASELINE (11 aprile 2026)
- Test: 2110 pass, 64 file
- Build: PASS (56s, 3005KB precache)
- Deploy: LIVE su elabtutor.school
- CI: test+build+e2e GREEN

---

## 10 TASK — 1 Orchestratore, 3 Auditor, 3 Worker, 2 Debugger, 1 Designer

### TASK 1: ORCHESTRATORE
**Ruolo**: Legge tutti i report, decide priorità, blocca se quality gate fallisce.
**Ogni ora**: leggi docs/sprint/S2-PROGRESS.md, valuta tutti i task, scrivi report.
**Quality gate**: npx vitest run (>=2110), npm run build (PASS), gh run list (GREEN).
**Se un gate fallisce**: FERMA TUTTO finché non è fixato.

### TASK 2: AUDITOR-PARITA (verifica volumi ↔ simulatore)
**Ruolo**: Legge i volumi in "ELAB - TRES JOLIE" e confronta con experiments-vol*.js
**File volumi**: /Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/, .../2 ELAB VOLUME DUE/, .../3 ELAB VOLUME TRE/
**Per ogni esperimento**: verifica che titolo, componenti, istruzioni montaggio, concetti corrispondano al volume cartaceo.
**Output**: docs/sprint/AUDIT-PARITA-VOL{N}.md con lista discrepanze specifiche.

### TASK 3: AUDITOR-UNLIM (verifica onniscienza)
**Ruolo**: Testa UNLIM su ogni esperimento — sa rispondere? Sa guidare?
**Come**: curl POST al nanobot con domande specifiche per esperimento.
**Verifica**: UNLIM conosce OGNI componente, OGNI concetto, OGNI analogia del volume.
**Output**: docs/sprint/AUDIT-UNLIM-ONNISCIENZA.md

### TASK 4: AUDITOR-UX (testa su Chrome reale)
**Ruolo**: Apre elabtutor.school su Chrome e testa il flusso docente.
**Usa**: Control Chrome MCP o Playwright.
**Flusso da testare**:
1. Apri sito → cosa vede il docente?
2. Scegli esperimento Vol1 Cap 6 Esp 1 → funziona?
3. "Monta passo passo" → i buildSteps funzionano?
4. Scratch → si apre? I blocchi sono corretti?
5. Voce → "compila" funziona?
6. Report → si genera?
**Output**: docs/sprint/AUDIT-UX-CHROME.md con screenshot

### TASK 5: WORKER-GEMINI (switch a Gemini, elimina DeepSeek/Kimi)
**Ruolo**: Configura il Nanobot Render per usare SOLO Gemini.
**File**: Il server Render è su GitHub (elab-galileo). Serve modificare la config dei provider.
**Verifica**: curl /health mostra primary: gemini, nessun deepseek/kimi.
**ATTENZIONE**: Questo richiede accesso al repo Render o alle env vars.

### TASK 6: WORKER-RAG (potenzia embeddings con contenuto volumi)
**Ruolo**: Legge i volumi da "ELAB - TRES JOLIE", estrae OGNI dettaglio, crea chunk per RAG.
**File volumi**: PDF/DOCX nella cartella TRES JOLIE.
**Output**: Chunk JSON con embeddings per Supabase pgvector.
**Obiettivo**: Da 246 chunk a 1000+ chunk. UNLIM deve conoscere ogni virgola dei volumi.
**Usa skill**: elab-rag-builder

### TASK 7: WORKER-CHAPTER-MAP-UI (integra chapter-map nella UI)
**Ruolo**: Integra src/data/chapter-map.js nei componenti React.
**File da modificare**: 
- src/components/lavagna/ExperimentPicker.jsx — mostra titoli Tea
- src/components/VetrinaSimulatore.jsx — mostra capitoli rinumerati
**Il docente deve vedere**: "Cap 2 — Cos'è il Diodo LED?" NON "Cap 6"
**Test**: Playwright/Chrome verifica che i titoli sono corretti

### TASK 8: DEBUGGER-REGRESSION (CI + test continui)
**Ruolo**: Dopo ogni merge, verifica zero regressioni.
**Esegue**: npx vitest run, npm run build, gh run list, conta metriche.
**Se fallisce**: BLOCCA e fixa prima di procedere.
**Aggiorna**: docs/sprint/S2-PROGRESS.md con metriche dopo ogni merge.

### TASK 9: DEBUGGER-LIVE (Playwright test piattaforma reale)
**Ruolo**: Esegue i 3 E2E Playwright spec recuperati da Claude Web.
**File**: e2e/09-chapter-map-navigation.spec.js, e2e/10-scratch-blockly.spec.js, e2e/11-teacher-full-journey.spec.js
**Verifica**: I test E2E passano sulla piattaforma reale.
**Se falliscono**: documenta COSA fallisce e perché.

### TASK 10: DESIGNER (Principio Zero flusso completo)
**Ruolo**: Implementa il flusso "docente arriva e insegna".
**Il flusso mancante**:
1. Docente apre ELAB → UNLIM dice "Bentornati! Oggi facciamo [prossimo esperimento]"
2. UNLIM propone la lezione basata su lesson-path + contesto passato
3. Docente dice "monta passo passo" → buildSteps partono
4. Fine lezione → "Crea il report" → PDF fumetto
**Questo è IL task più importante per lunedì.**

---

## ANTI-CONFLITTO (partizione file)

| Task | File ESCLUSIVI |
|------|---------------|
| Worker-Gemini | Server Render config |
| Worker-RAG | automa/knowledge/, Supabase pgvector |
| Worker-Chapter-Map-UI | src/components/lavagna/ExperimentPicker.jsx, VetrinaSimulatore.jsx |
| Designer | src/components/lavagna/LavagnaShell.jsx (flusso bentornati) |
| Auditor-* | docs/sprint/ (solo report) |
| Debugger-* | nessun file src/ (solo verifica) |

## COMUNICAZIONE TRA TASK

Ogni task scrive in `docs/sprint/S2-PROGRESS.md`:
```
## [TASK_NAME] — [ORA]
- Stato: [IN_PROGRESS/DONE/BLOCKED]
- Metriche: [test count, build, ecc.]
- Problemi trovati: [lista]
- Prossimo step: [cosa]
```

L'Orchestratore legge questo file e decide priorità.

## VERSIONE CLAUDE WEB

Per Claude Code Web, i task sono gli stessi ma eseguiti sequenzialmente:
1. Leggi DIRETTIVE-CLAUDE-WEB.md
2. Leggi questo piano
3. Esegui task 7 (chapter-map UI) — il più visibile per lunedì
4. Esegui task 10 (flusso Principio Zero)
5. Esegui task 4 (audit UX Chrome)
6. Verifica con task 8 (regression)

## METRICHE TARGET FINE SPRINT

| Metrica | Ora | Target |
|---------|-----|--------|
| Test | 2110 | >= 3000 |
| Chapter-map integrato | NO | SI |
| Nanobot Gemini only | NO | SI |
| RAG chunk | 246 | 1000+ |
| Flusso "bentornati" | NO | SI |
| E2E Playwright pass | 0 | 3 |
| BuildSteps fedeli volumi | ~50% | 80%+ |
| Principio Zero score | 3/10 | 6/10 |
