# G33 — TEST E2E CON PLAYWRIGHT

**Sprint F** — Terza sessione (post G32 GDPR encryption + auth)
**Deadline PNRR**: 30/06/2026 (90 giorni)
**Riferimento piano**: `docs/prompts/SPRINT-F-MASTER-PLAN.md`

---

## CONTESTO RAPIDO
- G32: HMAC auth server-side, localStorage encryption AES-256-GCM, audit UI, DPIA v1
- Server NON ancora deployato su Render (Andrea deve creare il servizio — vedi `server-data/DEPLOY.md`)
- Se il server è stato deployato tra G32 e G33: verificare health + CORS + HMAC
- Score composito: 8.5/10 (target Sprint F: ≥ 9.0/10)
- 940/940 test frontend, 26/26 test server, build 34s, 62 lesson paths
- **Collo di bottiglia**: zero test E2E con browser reale, CI non configurata

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
I test E2E devono usare il browser reale (Chromium). Nessun mock dei componenti.

---

## SKILL DA USARE (SE DISPONIBILI)

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-arsenal:quality-gate` | Baseline pre-session | `npm run build && npx vitest run` |
| IMPL | `plugin:playwright` | MCP Playwright per esecuzione diretta | `npx playwright test` |
| RESEARCH | `/elab-arsenal:ricerca-strumenti` | Playwright vs Cypress confronto | Usare Playwright direttamente |
| TEST | `/elab-arsenal:test-e2e-integrazione` | Design test journey | Definizione manuale |
| TEST | `/elab-arsenal:usabilita-docente` | Test Prof.ssa Rossi journey | Manuale |
| TEST | `/elab-arsenal:usabilita-studente` | Test Marco journey | Manuale |
| FINE | `/elab-arsenal:quality-gate` | Score card post | `npm run build && npx vitest run` |
| FINE | `/elab-arsenal:session-manager` | Handoff G33 → G34 | Aggiorna handoff a mano |

---

## TASK

### 1. Quality Gate Pre-Session (10min)
```
/elab-arsenal:quality-gate pre
```
Verificare anche:
- Se server Render è stato deployato → testare `/api/health`
- Se HMAC funziona in produzione → testare con token reale

### 2. Setup Playwright (30min)

1. `npm install -D @playwright/test`
2. `npx playwright install chromium` (solo chromium per velocità)
3. Creare `playwright.config.js` con:
   - baseURL: `http://localhost:5173`
   - webServer: `npm run dev` (auto-start)
   - Timeout: 30s per test
   - Screenshot on failure: on
   - Output: `test-results/`
4. Aggiungere a `.gitignore`: `test-results/`, `playwright-report/`
5. Aggiungere script in `package.json`: `"test:e2e": "npx playwright test"`

### 3. Test E2E — 5 Journey (2.5h)

**Test 1: Homepage → Simulatore (30min)**
- Naviga a `/`
- Verifica che il titolo contenga "ELAB"
- Click su "Prova Subito" o equivalente
- Verifica che il canvas SVG sia presente
- Verifica che la breadboard sia visibile

**Test 2: Esperimento Volume 1 (30min)**
- Seleziona un esperimento dal Volume 1 (es. Cap.6 LED)
- Verifica che i componenti appaiano nel canvas
- Verifica che la guida esperimento sia visibile
- Verifica che il code editor contenga codice di default

**Test 3: UNLIM Chat (30min)**
- Naviga al simulatore
- Apri UNLIM (chat AI)
- Verifica che l'input bar sia presente
- Invia "Ciao" (nota: potrebbe richiedere server AI attivo)
- Se server non disponibile: verifica che l'errore sia gestito gracefully

**Test 4: Teacher Dashboard (30min)**
- Naviga a `/#teacher`
- Verifica che la griglia progressi sia presente
- Verifica che le tab siano cliccabili
- Click su "Report" → verifica che la sezione report sia visibile
- Se presente: test export CSV (click pulsante, verifica download)

**Test 5: Login Flow (30min)**
- Naviga alla pagina login
- Verifica che il form sia presente (email + password)
- Inserisci credenziali invalide
- Verifica messaggio di errore
- Verifica che il rate limiting sia visibile dopo multipli tentativi

### 4. GitHub Action CI (30min)

Creare `.github/workflows/e2e.yml`:
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npx vitest run
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 5. Quality Gate Post-Session (15min)
```
/elab-arsenal:quality-gate post
/elab-arsenal:session-manager "handoff G33 → G34"
```

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 940+ test, 0 fail
- `npx playwright test` — 5 test, 0 fail (dopo setup)

### CoV 2: PRE-MERGE
- Tutti i test E2E passano in headless mode
- Screenshot di fallimento generati automaticamente
- GitHub Action template pronto

### CoV 3: POST-SESSION
1. 5 test E2E funzionanti
2. CI template pronto
3. Handoff aggiornato
4. Prompt G34 scritto basandosi su risultati reali

---

## REGOLE
- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + vitest + playwright dopo OGNI modifica
- Non toccare engine/ — MAI
- 62 lesson paths INTOCCABILI
- Budget ≤ €50/mese

---

## DELIVERABLE ATTESI G33

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | Playwright configurato | `npx playwright test` eseguibile |
| 2 | Test 1: Homepage → Simulatore | SVG canvas presente |
| 3 | Test 2: Esperimento Vol.1 | Componenti nel canvas |
| 4 | Test 3: UNLIM Chat | Input bar presente, errore gestito |
| 5 | Test 4: Teacher Dashboard | Griglia + tab funzionanti |
| 6 | Test 5: Login Flow | Form + error handling |
| 7 | GitHub Action template | File .yml pronto |
| 8 | Score card G33 | Test coverage ≥ 8/10 |

---

## SCORE TARGET

| Area | G32 | Target G33 | Come |
|------|-----|-----------|------|
| Build/Test | 10/10 | **10/10** | +5 E2E test |
| Teacher Dashboard | 8.5/10 | **8.5/10** | Mantenere |
| GDPR | 8.5/10 | **8.5/10** | Mantenere (deploy dipende da Andrea) |
| Test E2E | 0/10 | **8/10** | 5 test + CI template |
| **COMPOSITO** | **8.5/10** | **8.8/10** | E2E sblocca la qualità complessiva |
