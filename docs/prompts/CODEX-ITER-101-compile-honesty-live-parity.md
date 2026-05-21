# CODEX ITER-101 — Live parity Compila onesta + secure compile path

Lingua: italiano. Termini tecnici in inglese ok.

Ruolo richiesto:
Principal Product Engineer + Debugger + Frontend/Backend integration engineer + QA lead.

Postura obbligatoria:
massima onesta, zero compiacenza, zero demo finta, zero dati mock spacciati per reali. Se qualcosa non e' verificato empiricamente, scrivilo come NON VERIFICATO. Se il lavoro si ingarbuglia, fermati con checkpoint onesto. Non fare merge. Non pushare su main. Non usare `--no-verify`.

## Repo

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
```

## Context recovery obbligatorio

Leggi prima, in ordine:

1. `.codex/AGENTS.md`
2. `CLAUDE.md`
3. `docs/prompts/CODEX-ITER-100-mblock-next-stage.md`
4. `docs/handoff/2026-05-20-iter-99-handoff.md`
5. `docs/audits/2026-05-20-iter-99-consolidation-session-audit.md`
6. `docs/audits/2026-05-20-iter-100-live-mblock-audit.md`
7. `docs/audits/2026-05-20-iter-100-compile-honesty-debug-deep-audit.md`
8. `docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md`
9. `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`

## Stato verificato da cui ripartire

Branch locale al momento dell'audit:

- `fix/iter-99-compila-onesta`
- HEAD: `a7cd406e fix(iter-99): rendi Compila onesta sul fallback legacy`

Main remoto al momento dell'audit:

- `origin/main`: `5e2573fa fix(iter-94 A2): PuzzleIcon redesign — remove rotational asymmetry (#118)`
- `a7cd406e` NON e' antenato di `origin/main`.
- Branch contenenti `a7cd406e`: `fix/iter-99-compila-onesta`, `origin/fix/iter-99-compila-onesta`.

GitHub CLI:

- `gh pr view 131` ha fallito con `HTTP 401: Bad credentials`.
- Non assumere stato PR #131 da GitHub senza riautenticare/verificare.

Live `https://www.elabtutor.school/#compile-home`:

- Live bundle osservato: `HomeCompileEntry-CWnsJPY7.js`.
- Il chunk live NON contiene `verified-legacy`, `n8n-avr-legacy`, `Codice verificato`.
- Il chunk live contiene ancora `Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB.`
- Click live `Compila`:
  - `/api/compile/nanor4` -> `503 cloud_compile_not_configured`.
  - fallback `compile-proxy` Supabase -> `200 success:true` con output AVR:
    - `Maximum is 30720 bytes`
    - `Global variables ... Maximum is 2048 bytes`
  - UI live mostra `Compilato — 589 byte / 256.0 KB (0%)`.

Conclusione:

- La live non contiene il fix `a7cd406e`.
- Il bug live e' ancora P0: compile AVR legacy presentata come successo Nano R4.

## File rilevanti

Compila onesta PR #131:

- `src/services/api.js`
- `src/components/home/HomeCompileEntry.jsx`
- `src/components/simulator/panels/ScratchCompileBar.jsx`
- `src/components/home/UnlimCompileHelper.jsx`
- `tests/unit/api.test.js`
- `tests/unit/components/home/HomeCompileEntry-tabs.test.jsx`
- `tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx`
- `tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx`

Compile/upload direct cloud path da auditare:

- `src/components/lavagna/CompileUploadButton.jsx`
- `tests/unit/components/lavagna/CompileUploadButton.test.jsx`
- `api/compile/nanor4.js`
- `infra/cloud-compile/server.js`
- `infra/cloud-compile/render.yaml`
- `supabase/functions/compile-proxy/index.ts`

## Obiettivo Iter 101

Chiudere la live parity della "Compila onesta" prima di qualsiasi feature mBlock/Blockly.

### Goal minimo

1. Verificare stato PR/branch e scegliere il path corretto:
   - Se `a7cd406e` non e' in main: preparare PR o aggiornare PR esistente, senza merge automatico.
   - Se PR esiste ma non mergeata: non duplicare branch inutilmente.
   - Se serve nuovo branch, crearne uno da `origin/main` e cherry-pick/applicare solo il fix necessario.

2. Garantire che `#compile-home` non possa presentare legacy AVR come Nano R4:
   - provider `cloud-renesas` = unico successo "Compilato per Nano R4".
   - provider `n8n-avr-legacy` = solo "Codice verificato / compilatore Nano R4 non attivo".
   - provider `none` o `cloud_compile_not_configured` = errore/attesa infrastrutturale onesta.

3. Audit/fix del secondo path:
   - `CompileUploadButton` non deve usare in produzione `VITE_ELAB_CLOUD_COMPILE_URL` per chiamare direttamente Render dal browser.
   - Target produzione: `/api/compile/nanor4` same-origin proxy.
   - Nessuna chiave Render/API segreta nel bundle browser.

4. Aggiungere regression/smoke:
   - Test che simula `/api/compile/nanor4` 503 + `compile-proxy` AVR success.
   - Deve fallire se UI mostra `Compilato`, `589 byte / 256 KB`, `Compilazione riuscita`, o invita a caricare sul kit.
   - Deve passare solo con `verified-legacy`/copy onesto.

## Non-goal

- Non implementare mBlock/Blockly polish.
- Non implementare upload reale DFU.
- Non dichiarare Cloud Compile funzionante finche' `/api/compile/nanor4` non ritorna artifact Renesas reale.
- Non dichiarare "caricato" senza `FLASH_SUCCESS_REAL`.
- Non fare merge.
- Non pushare su main.

## CoV obbligatorio

Prima di modificare codice:

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
npx vitest run tests/unit/api.test.js tests/unit/components/home/HomeCompileEntry-tabs.test.jsx tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx
```

Dopo modifiche:

```bash
npx vitest run tests/unit/api.test.js tests/unit/components/home/HomeCompileEntry-tabs.test.jsx tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx tests/unit/components/lavagna/CompileUploadButton.test.jsx
npx vitest run
npm run build
```

Nota CoV:

- Il full run del 2026-05-20 ha fallito 1 test environment-sensitive: `tests/unit/scripts/pixtral-vision-bench.test.js` quando credenziali reali sono presenti.
- Non ignorarlo automaticamente: se ricompare, documenta se e' identico e re-run isolato con env credenziali rimosse. Non mascherare nuove regressioni.

## Test live obbligatorio post-deploy/preview

Usa Playwright/browser reale su preview o live disponibile:

1. Apri `/#compile-home`.
2. Sblocca onboarding/consenso solo per test, dichiarando il metodo.
3. Click `Compila`.
4. Cattura screenshot e network trace.
5. Esito accettabile se cloud non configurato:
   - `Codice verificato — compilatore Nano R4 non ancora attivo`, oppure errore infrastrutturale onesto.
   - Non deve apparire `Compilato — <1KB / 256.0 KB`.
   - Non deve apparire `Compilazione riuscita ragazzi`.
   - Non deve invitare a caricare sul kit.

## Prompt operativo breve per l'agente

Esegui Iter 101 come singolo atomo controllato: live parity della Compila onesta. Prima dimostra con git e live bundle se il fix `a7cd406e` e' o non e' in main/deploy. Poi porta il fix sul branch corretto senza duplicare lavoro, chiudi il path `CompileUploadButton` che usa cloud diretto browser in produzione, aggiungi regression test, esegui CoV, documenta screenshot/network trace. Non implementare altro. Non mergeare. Non pushare main. Se non puoi verificare live o PR per auth, dichiaralo.

## Stringa di attivazione

```text
CONTINUA_ELAB_ITER_101_COMPILA_ONESTA_LIVE_PARITY
```
