# Iter 100 — Deep Audit & Debug: Compila onesta live parity

Data: 2026-05-20
Repo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
Branch locale audit: `fix/iter-99-compila-onesta`
Commit locale audit: `a7cd406e4513f529644031082c8979d664564c21`
Live auditata: `https://www.elabtutor.school/#compile-home`

Regola applicata: massima onesta, zero compiacenza. Nessun fix implementato in questa sessione. Nessun merge. Nessun push.

## Executive summary

La live `www.elabtutor.school` NON contiene il fix locale `a7cd406e` della "Compila onesta".

Evidenze forti:

1. `origin/main` e' ancora `5e2573fa`, mentre `a7cd406e` esiste solo su `fix/iter-99-compila-onesta`.
2. `git merge-base --is-ancestor a7cd406e origin/main` ritorna exit `1`: il fix non e' in main.
3. Il chunk live `HomeCompileEntry-CWnsJPY7.js` non contiene le stringhe `verified-legacy`, `n8n-avr-legacy`, `Codice verificato`.
4. Lo stesso chunk live contiene ancora il vecchio copy `Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB.`
5. La traccia rete live mostra `/api/compile/nanor4` -> `503 cloud_compile_not_configured`, poi fallback `compile-proxy` Supabase -> `200 success:true` con output AVR (`Maximum is 30720 bytes`), e la UI mostra `Compilato — 589 byte / 256.0 KB (0%)`.

Quindi il comportamento P0 visto nello Sprint 100.0 e' spiegato: non e' una regressione del commit `a7cd406e` verificata localmente; e' live/main ancora senza quel commit, piu' una catena fallback AVR storica ancora attiva sulla produzione corrente.

## Stato git verificato

Comandi:

```bash
git rev-parse HEAD
git log -1 --oneline
git rev-parse origin/main
git log -1 --oneline origin/main
git branch --contains a7cd406e --all
git merge-base --is-ancestor a7cd406e origin/main; echo $?
git diff --name-only origin/main...HEAD
```

Risultati:

- `HEAD`: `a7cd406e fix(iter-99): rendi Compila onesta sul fallback legacy`
- `origin/main`: `5e2573fa fix(iter-94 A2): PuzzleIcon redesign — remove rotational asymmetry (#118)`
- Branch contenenti `a7cd406e`: solo `fix/iter-99-compila-onesta` e `origin/fix/iter-99-compila-onesta`.
- `a7cd406e` NON e' in `origin/main`.
- Diff branch vs main: 8 file, tutti coerenti con PR #131:
  - `src/components/home/HomeCompileEntry.jsx`
  - `src/components/home/UnlimCompileHelper.jsx`
  - `src/components/simulator/panels/ScratchCompileBar.jsx`
  - `src/services/api.js`
  - `tests/unit/api.test.js`
  - `tests/unit/components/home/HomeCompileEntry-tabs.test.jsx`
  - `tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx`
  - `tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx`

Nota: `gh pr view 131` non e' stato possibile per `HTTP 401: Bad credentials`. Stato PR non verificato via GitHub API in questa sessione.

## Live bundle audit

URL HTML live:

```text
https://www.elabtutor.school/
```

Asset caricati su `#compile-home`:

```text
https://www.elabtutor.school/assets/HomeCompileEntry-CWnsJPY7.js
https://www.elabtutor.school/assets/ScratchCompileBar-BN2bLmIv.js
https://www.elabtutor.school/assets/ScratchEditor-Dw_27u_5.js
https://www.elabtutor.school/assets/WebUsbBanner-I0Rskd-0.js
```

Header live osservati:

- `last-modified`: `Wed, 20 May 2026 18:26:40 GMT` per HTML, `18:26:43 GMT` per HomeCompileEntry chunk.
- `x-vercel-cache: HIT`
- CSP `connect-src` NON include `https://elab-cloud-compile.onrender.com`.

String search sul chunk live `HomeCompileEntry-CWnsJPY7.js`:

- `verified-legacy`: assente.
- `n8n-avr-legacy`: assente.
- `Codice verificato`: assente.
- `cloud-renesas`: assente.
- `artifactSizeBytes`: assente.
- `Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB.`: presente.

Conclusione: live bundle e' pre-fix PR #131.

## Network trace del click Compila live

Setup audit: Playwright Chromium, viewport desktop 1440x900, localStorage usato solo per sbloccare onboarding e consenso, non per alterare codice.

Richieste rilevanti:

1. `POST https://www.elabtutor.school/api/compile/nanor4`

Body:

```json
{
  "sketchCode": "void setup() {\n}\n\nvoid loop() {\n}",
  "fqbn": "arduino:renesas_uno:nanor4"
}
```

Risposta:

```json
{
  "ok": false,
  "error": "cloud_compile_not_configured",
  "message": "Servizio Cloud Compile non ancora configurato. Deploy infra/cloud-compile su Render + imposta ELAB_CLOUD_COMPILE_URL nelle variabili ambiente Vercel."
}
```

2. `POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy`

Body:

```json
{
  "code": "void setup() {\n}\n\nvoid loop() {\n}",
  "board": "arduino:renesas_uno:nanor4"
}
```

Risposta:

```json
{
  "success": true,
  "hex": ":100000000C943400...",
  "errors": null,
  "output": "Sketch uses 444 bytes (1%) of program storage space. Maximum is 30720 bytes.\nGlobal variables use 9 bytes (0%) of dynamic memory, leaving 2039 bytes for local variables. Maximum is 2048 bytes."
}
```

Interpretazione:

- `Maximum is 30720 bytes` e `2048 bytes RAM` sono valori AVR/ATmega328, NON Nano R4 Renesas RA4M1.
- La UI live mostra invece `589 byte / 256.0 KB (0%)`, quindi prende un artifact AVR e lo presenta contro il totale flash Nano R4.
- Questo e' esattamente il bug #19 storico: compile reale per scheda sbagliata, non stub, presentato come successo Nano R4.

## Confronto con commit locale `a7cd406e`

Il commit locale introduce tre guardrail corretti:

1. `src/services/api.js`
   - `tryCompile(..., provider)` propaga `provider`.
   - `/api/compile/nanor4` e direct cloud sono `cloud-renesas`.
   - `compile-proxy` Supabase e webhook legacy sono `n8n-avr-legacy`.

2. `src/components/home/HomeCompileEntry.jsx`
   - Se `result.provider !== 'cloud-renesas'`, imposta `compileStatus='verified-legacy'`.
   - Non calcola `compileSize` per provider legacy.

3. `src/components/home/UnlimCompileHelper.jsx` + `ScratchCompileBar.jsx`
   - `verified-legacy` mostra copy onesto: verifica sintassi legacy, Nano R4 non attivo.
   - Non mostra `Compilato`.
   - Non invita a caricare sul kit fisico.

Test mirati eseguiti:

```bash
npx vitest run \
  tests/unit/api.test.js \
  tests/unit/components/home/HomeCompileEntry-tabs.test.jsx \
  tests/unit/components/home/UnlimCompileHelper-honesty.test.jsx \
  tests/unit/components/simulator/panels/ScratchCompileBar-honest-provider.test.jsx
```

Risultato:

- 4 test files passed.
- 19 tests passed.

Verdetto: localmente il fix PR #131 copre il path HomeCompileEntry -> compileCode -> legacy provider -> UI onesta. La live non lo sta usando.

## Secondo problema: direct cloud path ancora presente nel bundle live

Il chunk live `ScratchCompileBar-BN2bLmIv.js`, che include `CompileUploadButton`, contiene configurazione `VITE_ELAB_CLOUD_COMPILE_URL` e un path diretto verso `https://elab-cloud-compile.onrender.com/compile`.

Osservazione CSP:

- CSP live non consente `connect-src https://elab-cloud-compile.onrender.com`.
- Quindi il browser blocca quel path diretto.

Classificazione:

- Questo e' un P0/P1 architetturale separato dal bottone `Compila`.
- Target iter-100 dice che produzione browser deve usare `/api/compile/nanor4` o proxy server-to-server sicuro.
- Un path browser diretto cloud + key/client env e' contrario al target finale. Anche se la CSP oggi lo blocca, non va considerato "risolto": e' solo rotto in modo rumoroso.

Nota sicurezza:

- Il bundle live contiene anche una chiave `VITE_ELAB_API_KEY` come literal client-side. Non riporto il valore.
- Se quella chiave era intesa come segreto, va ruotata. Se e' volutamente client-public, va rinominata/documentata come public gate, non come secret.

## Root cause

Root cause primaria:

`a7cd406e` non e' merge/deployato su main/live. La live usa ancora una build pre-fix.

Root cause secondaria:

Il design storico di fallback permette ancora, su main live, di trattare un `success:true` da `compile-proxy` AVR come successo del flusso Nano R4.

Root cause architetturale residua:

La codebase ha due famiglie di compile path:

1. `compileCode()` in `src/services/api.js`, ora corretto su branch `a7cd406e`.
2. `CompileUploadButton` demo/upload path, che puo' puntare a cloud diretto o localhost agent.

La prossima sessione deve verificare e chiudere entrambe, non solo HomeCompileEntry.

## Bug / rischi prioritizzati

### P0 — Live non onesta per Nano R4

Sintomo:
- `Compilato — 589 byte / 256.0 KB (0%)`
- "Compilazione riuscita ragazzi! Ora potete caricare..."

Causa:
- live non contiene `a7cd406e`; fallback AVR trattato come successo.

Fix candidate:
- Portare `a7cd406e` su main via PR/merge controllato, poi verificare live.
- Aggiungere e2e/smoke che fallisce se compare `Compilato — <1KB / 256 KB` dopo fallback legacy.

### P0 — Cloud compile non configurato

Sintomo:
- `/api/compile/nanor4` ritorna `503 cloud_compile_not_configured`.

Causa:
- `ELAB_CLOUD_COMPILE_URL` server-side Vercel non configurata o Render non deployato.

Fix candidate:
- Azione Andrea/infra: deploy Render `infra/cloud-compile`, set env Vercel server-side, redeploy.
- Fino ad allora UI deve restare onesta: "compilatore Nano R4 non ancora attivo".

### P0/P1 — Browser direct cloud path

Sintomo:
- Live bundle contiene path diretto cloud; CSP lo blocca.

Causa:
- `CompileUploadButton` usa `VITE_ELAB_CLOUD_COMPILE_URL` e `resolveCompileEndpoint()`.

Fix candidate:
- Per produzione, `CompileUploadButton` deve usare `/api/compile/nanor4` per compile-only cloud.
- Nessun `VITE_ELAB_CLOUD_COMPILE_URL` richiesto nel browser per Nano R4.

### P1 — Onboarding concorrenti bloccano test e azione docente

Sintomo:
- GDPR age banner + Scratch onboarding + HomeCompile onboarding possono sovrapporsi.

Causa:
- overlay separati senza coda unica per `#compile-home`.

Fix candidate:
- Per atomo successivo non toccare subito UX; ma aggiungere nello smoke una procedura di bypass esplicita e poi pianificare un singolo overlay sequenziato.

### P1 — Copy product troppo forte

Sintomo:
- "Compila & Carica pronto su Nano R4", "Nessun download necessario", "caricate sul kit" anche mentre cloud e upload reale non sono verificati.

Fix candidate:
- Copy condizionato a provider/stato reale.
- Senza cloud Renesas: "Verifica sintassi disponibile, compilatore Nano R4 in attivazione".

### P2 — Unit test environment-sensitive stampa token

Sintomo:
- Full `npx vitest run` fallisce su `pixtral-vision-bench.test.js` quando credenziali reali sono presenti e stampa header nel failure.

Fix candidate:
- Rendere il test hermetic: ignorare env reali nel test unit o forzare mock mode.
- Redigere header/token negli error snapshot.

## CoV

Full run precedente Sprint 100.0:

- `npx vitest run`: 1 failed, 397 passed, 2 skipped files; 14805 passed, 1 failed, 15 skipped, 11 todo.
- Failure: `tests/unit/scripts/pixtral-vision-bench.test.js`, environment-sensitive con credenziali reali.
- Re-run isolato senza env credenziali: 14/14 passed.

Targeted CoV di questo audit:

- Test PR #131 mirati: 19/19 passed.

Build:

- Non eseguita in questa sessione perche' non ho modificato codice runtime. Per una PR successiva che tocchi codice, `npm run build` e full `npx vitest run` restano obbligatori.

## Decisione raccomandata

Non iniziare mBlock/Blockly polish finche' non e' chiusa la live parity della Compila onesta.

Prossimo atomo consigliato:

**Iter 101 — Live parity Compila onesta + secure compile path**

Obiettivo minimo:

1. Portare il fix `a7cd406e` su una PR/main deployabile senza perdere nulla.
2. Verificare live che fallback AVR diventi `verified-legacy`, non `success`.
3. Eliminare o disabilitare in produzione il path browser diretto `VITE_ELAB_CLOUD_COMPILE_URL` dentro `CompileUploadButton`, sostituendolo con `/api/compile/nanor4`.
4. Aggiungere smoke test/documentazione che impedisce il ritorno del falso successo Nano R4.

Exit criteria:

- Live `#compile-home` con cloud non configurato mostra messaggio onesto, non `Compilato`.
- `compile-proxy` AVR puo' ancora esistere solo come "verifica sintassi legacy".
- Nessun claim "caricato" senza `FLASH_SUCCESS_REAL`.
- Nessun path browser diretto cloud richiesto per produzione.
