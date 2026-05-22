# 2026-05-20 - Percorso Morfico Runtime Audit, CoV, Deploy

## Executive Summary

Commit applicativo auditato: `90eb2519 feat(lavagna): make Percorso panel realtime morphic`.

Deploy production Vercel completato:

- Production URL: `https://elab-tutor-7ea1od4dl-andreas-projects-6d4e9791.vercel.app`
- Alias production: `https://www.elabtutor.school`
- Inspect URL: `https://vercel.com/andreas-projects-6d4e9791/elab-tutor/G6Brhy3uTWwdfCy2XDvhAnL1VrfB`

Esito sintetico: PASS con caveat. Il pannello Percorso e' ora morfico in runtime sul lato consumer: reagisce a cambio docente/classe/sessione, segnali live, riapertura pannello e budget quantitativo testo/slide. Non e' ancora un sistema end-to-end completo di percezione audio/vision/montaggio: consuma segnali se ELABTutor li emette o li persiste nei canali previsti.

## Scope Reale

Lavoro applicativo limitato al pannello aperto cliccando Percorso:

- `src/components/lavagna/PercorsoCapitoloView.jsx`
- `src/components/lavagna/PercorsoCapitoloView.module.css`
- `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`

Nessuna modifica a:

- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/ModalitaSwitch.jsx`
- dati canonici `src/data/lesson-paths/*`
- `src/data/narrative-map-94.json`
- `src/data/cliffhanger-table.json`
- pipeline Supabase/migrations

## Cosa Funziona Bene

1. Runtime context reactive
   - Il pannello rilegge contesto docente/classe/sessione quando cambiano storage o evento custom.
   - Evento supportato: `elab:percorso-morphic-context-changed`.
   - Polling same-tab: 750 ms, utile per cambi `localStorage.setItem` che non generano `storage` event nello stesso documento.

2. Regia live del pannello
   - Evento supportato: `elab:percorso-live-signal`.
   - Fonti normalizzate: `text`, `writing`, `message`, `action`, `mounting`, `circuit`, `latency`, `screenshot`, `audio`, `voice`, `past_lesson`, `lesson_memory`, `memory`.
   - Canali storage supportati:
     - `elab-percorso-live-signals:<capitoloId>`
     - `elab-percorso-live-signals`
     - `elab-percorso-written-message`
     - `elab-percorso-action-state`
     - `elab-percorso-mounting-state`
     - `elab-percorso-latency-ms`
     - `elab-percorso-screenshot-state`
     - `elab-percorso-audio-state`
     - `elab-percorso-past-lesson-memory`

3. Irrorazione morfica di apertura
   - Ogni apertura del pannello genera `data-morphic-instance` diverso.
   - Ogni apertura sceglie una micro-regia diversa mantenendo il canone.

4. Quantita morfica
   - Il pannello non cambia solo parole: cambia anche budget di output.
   - Output visibili:
     - `percorso-writing-budget`: numero frasi corrette da scrivere.
     - `percorso-slide-budget`: numero slide/schermate.
   - Regole attuali:
     - docente esperto + verifica: comprime;
     - docente primo anno + classe giovane + intro: espande;
     - latenza alta: riduce;
     - memoria lezioni passate: puo aumentare richiamo;
     - montaggio/screenshot: puo aumentare slide/schermate visive.

5. Principio Zero v3 preservato
   - Frasi classe partono da `Ragazzi,`.
   - Il kit fisico ELAB resta protagonista.
   - Riferimento `Vol.X pag.Y` resta esplicito.
   - Il docente resta guida: il pannello suggerisce regia, non sostituisce il docente.

## Cosa Non Va Ancora / Caveat Onesti

1. Non e' ancora percezione reale end-to-end.
   - Il pannello consuma segnali live, ma non cattura direttamente audio, screenshot o montaggio fisico.
   - Mancano producer cablati da chat, voice pipeline, simulator/breadboard state, OCR/vision e memoria Supabase verso `elab:percorso-live-signal`.

2. La morficita e' deterministica/curata, non generativa illimitata.
   - Le micro-regie di apertura sono una lista curata e ciclica con identita univoca.
   - E' adatta a controllo professionale e sicurezza didattica, ma non e' ancora generazione infinita di copy.

3. Coverage globale non misura Percorso.
   - La config `vitest.config.js` include coverage solo per engine/auth/GDPR/crypto.
   - Il primo run coverage standard sul test Percorso produce 0% globale perche' `PercorsoCapitoloView.jsx` non e' incluso.
   - Per questo audit e' stato eseguito un coverage locale con override CLI.

4. Deploy verify non attraversa il pannello Percorso in produzione.
   - Playwright deploy smoke controlla load/meta/CSS/JS su prod.
   - Non c'e' ancora un E2E production affidabile che apre Lavagna, seleziona Percorso, entra nel capitolo e spara segnali live, per via di gating auth/licenza/flow.

5. Build continua a emettere warning noti.
   - Warning CSS minify: proprieta `file` non riconosciuta e commento con slash inatteso.
   - Warning chunk size > 1000 kB.
   - Non sono regressioni introdotte dal pannello Percorso, ma restano debito tecnico.

6. `npm run build` esegue `prebuild` che firma file CSS fuori scope.
   - Durante il lavoro sono state generate firme in 4 CSS non pertinenti; sono state rimosse prima del commit.
   - Per verifiche senza churn fuori scope e' stato usato anche `npx vite build`.

## Comandi Eseguiti

Unit Percorso:

```bash
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
```

Risultato:

```text
12 tests passed
```

Lavagna sweep:

```bash
npx vitest run tests/unit/lavagna
```

Risultato:

```text
31 test files passed
248 tests passed
```

Coverage locale pannello:

```bash
npx vitest run --coverage --coverage.include=src/components/lavagna/PercorsoCapitoloView.jsx tests/unit/lavagna/PercorsoCapitoloView.test.jsx
```

Risultato:

```text
PercorsoCapitoloView.jsx
Statements: 85.25%
Branches: 60.97%
Functions: 92.3%
Lines: 85.25%
```

Build locale:

```bash
npx vite build
```

Risultato:

```text
built successfully
```

Deploy production:

```bash
VERCEL_ORG_ID=team_23uD0RgdInaTaOPEL0EGltup VERCEL_PROJECT_ID=prj_Sm9JGt80Ivec3sMFAQ8abfz4UdnV npx vercel --prod --yes
```

Risultato:

```text
Production: https://elab-tutor-7ea1od4dl-andreas-projects-6d4e9791.vercel.app
Aliased: https://www.elabtutor.school
```

HTTP smoke:

```bash
curl -I -L https://www.elabtutor.school/#lavagna
```

Risultato:

```text
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-vercel-cache: HIT
```

Playwright deploy verify:

```bash
ELAB_BASE_URL=https://www.elabtutor.school npx playwright test --config tests/e2e/playwright.config.js tests/e2e/10-deploy-verify.spec.js
```

Risultato:

```text
4 passed
```

## File e Linee Chiave

- `src/components/lavagna/PercorsoCapitoloView.jsx`
  - runtime events e signal mapping: linee 46-79
  - storage live signal readers: linee 218-238
  - signature runtime reattiva: linee 240-269
  - next action Principio Zero: linee 280-300
  - budget testo/slide: linee 306-334
  - UI cue/regia/budget: linee 591-632

- `src/components/lavagna/PercorsoCapitoloView.module.css`
  - UI regia live e budget: `liveRegiaPanel`, `liveRegiaBudget`, `liveBudgetItem`.

- `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`
  - realtime docente/classe/sessione: linee 229-258
  - segnali live: linee 260-318
  - riapertura irripetibile: linee 320-340
  - quantita testo/slide: linee 342-357

## Documenti di Contesto da Allegare al Prossimo Passaggio

Repo/worktree:

- `AGENTS.md`
- `.codex/AGENTS.md`
- `CLAUDE.md`
- `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md`
- `docs/adrs/ADR-046-percorso-lezione-personalizzata-onniscenza-mistral.md`
- `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md`
- `docs/adrs/ADR-049-sense-1.6-morfismo-extended-runtime-context.md`
- `docs/tea/TEA-QUICKSTART.md`
- `docs/tea/ONBOARDING-TEA-COMPLETO.md`
- `docs/tea/2026-04-26-tea-claude-brief.md`
- `src/components/lavagna/PercorsoCapitoloView.jsx`
- `src/components/lavagna/PercorsoCapitoloView.module.css`
- `tests/unit/lavagna/PercorsoCapitoloView.test.jsx`
- `src/services/percorsoMorphicAdapter.js`
- `tests/unit/services/percorsoMorphicAdapter.test.js`
- `src/components/lavagna/GalileoAdapter.jsx`
- `src/components/lavagna/useGalileoChat.js`
- `src/services/simulator-api.js`
- `src/services/voiceService.js`

Materiali TEA esterni in Volume 3:

- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_metadata_94.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_schema.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_v1-cap6-esp1.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/bibbia_stilistica.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/MANUALE VOLUME 1 ITALIANO.pdf/markdown.md`
- `/Users/andreamarro/VOLUME 3/TEA/MANUALE VOLUME 2 ITALIANO.pdf/markdown.md`
- `/Users/andreamarro/VOLUME 3/TEA/Manuale vol 3 versione 0.13.pdf/markdown.md`

## Raccomandazione Next

Il prossimo passo non deve ampliare il pannello con altra UI fine a se stessa. Deve collegare producer reali ai segnali live gia supportati:

1. chat Percorso -> `source: text`;
2. azioni simulatore / API -> `source: action`;
3. stato breadboard/montaggio -> `source: mounting`;
4. latenza API/chat -> `source: latency`;
5. screenshot/OCR -> `source: screenshot`;
6. voice pipeline -> `source: audio`;
7. memoria Supabase/session tracker -> `source: past_lesson`.

Se resta vincolo "solo pannello Percorso", allora il prossimo lavoro deve limitarsi a migliorare lettura storage/canali gia esistenti e testare l'integrazione senza toccare producer esterni.
