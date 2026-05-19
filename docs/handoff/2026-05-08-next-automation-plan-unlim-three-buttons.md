# Handoff automazioni — UNLIM, tre pulsanti, no regressioni

Data: 2026-05-08

## Prima regola della prossima sessione

Prima di fare nuove modifiche, ricontrollare il lavoro Codex del 2026-05-08 in prodotto live con Playwright e screenshot. Non fidarsi del racconto, non fidarsi dei test vecchi, non compiacere Andrea.

URL da verificare:

- Preview: https://elab-tutor-q4tz0gw95-andreas-projects-6d4e9791.vercel.app
- Alias: https://elab-tutor-andreamarro-andreas-projects-6d4e9791.vercel.app

File CoV da leggere:

- `docs/CoV/2026-05-08-speed-deploy-home-lavagna-three-buttons-cov.md`
- `docs/audits/2026-05-08-speed-deploy-smoke-final/playwright-smoke-result.json`

File implementativi da leggere:

- `vite.config.js`
- `index.html`
- `.vercelignore`
- `src/main.jsx`
- `src/App.jsx`
- `src/components/HomePage.jsx`
- `src/components/common/UpdatePrompt.jsx`
- `src/components/lavagna/AppHeader.jsx`
- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/GalileoAdapter.jsx`
- `src/components/lavagna/ModalitaSwitch.jsx`
- `src/components/lavagna/ModalitaSwitch.module.css`
- `src/components/lavagna/VideoFloat.jsx`
- `src/components/lavagna/VideoFloat.module.css`
- `src/data/local-tiktok-videos.js`
- `src/data/video-courses.js`

Test da rilanciare subito:

```bash
npx vitest run tests/unit/navigation.test.js tests/unit/components/HomePage.test.jsx tests/unit/lavagna/AppHeader.test.jsx tests/unit/lavagna/VideoFloat-local-videos.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx tests/unit/videoCourses.test.js tests/unit/lavagna/ModalitaSwitch-iter26-4modes.test.jsx tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx tests/unit/components/lavagna/LavagnaShell-modalita.test.jsx tests/unit/pwa-stale-precache-hotfix.test.js
```

## Analisi Claude adattata: cosa considerare vero e cosa ricontrollare

Non importare i numeri Claude come verità. Usarli come ipotesi da misurare.

Cose buone da preservare:

- Architettura UNLIM con difese client/server e fallback multiprovider.
- Lesson-path, riferimenti volume, RAG e schema didattico già presenti.
- `window.__ELAB_API` ricca: base per Onnipotenza UNLIM.
- Governance anti-regressione con test e CoV.
- I tre pulsanti ora sono wire-up reali su preview: `sandbox`, `guided`, `complete`.
- `#lavagna-solo` ora è scope duro: lavagna + UNLIM, niente circuiti.

Cose cattive da verificare con numeri aggiornati:

- PR/branch non mergiati: verificare su GitHub, non assumere “263 commit”.
- Edge Functions AI orfane: verificare TTS, Vision, STT e chiamate frontend reali.
- L2 template catch-all: misurare quante query esperimento-specifiche tornano contenuto LED generico.
- PRINCIPIO ZERO: rieseguire audit, non usare il numero “834” senza script.
- Citazioni `Vol./pag.`: rieseguire coverage reale, non usare “5/91” senza script.
- Numero esperimenti: chiarire 91/92/94 con fonte codice e volumi.
- `useGalileoChat` / intent parser drift / require ESM: audit da rifare sul codice attuale.
- Latenza UNLIM: misurare p50/p95 live, non riportare valori storici.
- RAG recall: misurare recall@5, soglia, corpus usato.
- Fumetto/report cronologia: verificare se incrocia davvero sessione, screenshot, messaggi, immagini.

## Piano sessioni automazione

### Sessione 1 — Recheck Codex + smoke live

Obiettivo: ricontrollare le modifiche appena deployate.

Deve produrre:

- `docs/CoV/YYYY-MM-DD-sessione1-cov.md`
- `docs/audits/YYYY-MM-DD-sessione1-audit.md`
- `docs/debug/YYYY-MM-DD-sessione1-debug.md`
- `docs/handoff/YYYY-MM-DD-sessione1-handoff.md`
- screenshot Playwright desktop + iPad.

Gate:

- Home senza Glossario.
- Video dentro card esistente.
- Header senza Capitoli.
- `#lavagna-solo` senza circuiti.
- Tre pulsanti con comportamento corretto.
- Niente errori CSP PWA/Supabase websocket.

### Sessione 2 — Speed reale build/deploy

Obiettivo: ridurre davvero tempi, non cosmetica.

Task:

- Spostare `public/volumes` fuori dal deploy Vercel verso Cloudflare R2/Supabase Storage.
- Spostare `public/videos` fuori dal deploy Vercel, lasciando URL versionati.
- Misurare `du -sh public dist .vercel/output`.
- Misurare `npm run build`, `vercel build`, `vercel deploy --prebuilt`.

Gate:

- Upload deploy sotto soglia documentata.
- Nessun media rotto in home/video.
- PDF volumi ancora raggiungibili.

### Sessione 3 — UNLIM frontend/backend gap

Obiettivo: verificare e chiudere funzioni AI orfane.

Task:

- GitHub: controllare PR/branch storici citati da Claude.
- Supabase: verificare Edge Functions vive e chiamate effettive.
- TTS: frontend deve chiamare router corretto, non endpoint morto.
- Vision: `analyzeImage` deve usare funzione vision corretta.
- STT: verificare webkit-only vs CF Whisper/Mistral.
- Conversazione lunga con UNLIM: domande vaghe, non banali, richieste multi-step.

Gate:

- log chiamate reali;
- screenshot UI;
- latenza p50/p95;
- CoV con “fatto / parziale / falso”.

### Sessione 4 — Principio Zero V3 + Morfismo

Obiettivo: misurare e correggere, volume per volume.

Task:

- Audit imperativi singolari e comandi non adatti.
- Audit `Vol./pag.` per ogni esperimento.
- Confronto libro fisico vs codice, un volume alla volta.
- Generare JSON task per mismatch.

Gate:

- numeri generati da script;
- esempi prima/dopo;
- nessun claim globale senza campione + coverage.

### Sessione 5 — Fumetto/report cronologia multimodale

Obiettivo: fumetto/report devono usare tutta la storia, non fallback.

Task:

- Incrociare cronologia sessione, screenshot, messaggi UNLIM, immagini, esperimento, volume.
- Leonardo.ai: nessun plugin nativo disponibile; usare API via Cloudflare Worker o backend proxy, mai chiave client-side.
- Cloudflare R2 per asset generati/cache.
- Playwright con sessione reale e screenshot.

Gate:

- report riproducibile da sessione reale;
- immagini coerenti;
- niente dati sensibili esposti.

## Skill/plugin/connettori da usare

- Superpowers: `using-superpowers`, `systematic-debugging`, `verification-before-completion`, `writing-plans`, `executing-plans`.
- Playwright / Browser: smoke live, screenshot desktop/iPad.
- Vercel: build, deploy prebuilt, inspect, alias/promote solo dopo verifica.
- GitHub: PR, branch, CI, eventuale CodeRabbit.
- Supabase: Edge Functions, RAG, pgvector, memoria UNLIM.
- Cloudflare: R2/Worker per video, volumi, Leonardo.ai proxy.
- Documents/PDF: lettura volumi.
- Security best practices: non stampare token, non committare segreti, usare solo env locali.

## Prompt per avviare la prossima sessione

```text
Usa /using-superpowers, systematic-debugging e verification-before-completion.

Prima di modificare qualunque file, rileggi:
- docs/CoV/2026-05-08-speed-deploy-home-lavagna-three-buttons-cov.md
- docs/handoff/2026-05-08-next-automation-plan-unlim-three-buttons.md
- docs/audits/2026-05-08-speed-deploy-smoke-final/playwright-smoke-result.json

Obiettivo sessione: ricontrollare in prodotto live il lavoro Codex del 2026-05-08, senza compiacere Andrea e senza saltare passaggi.

Esegui:
1. git status --short
2. test mirati indicati nel piano
3. Playwright desktop + iPad su preview e alias:
   - home senza Glossario
   - video dentro card esistente
   - #lavagna-solo solo lavagna + UNLIM
   - header senza Capitoli
   - Percorso = sandbox vuoto + UNLIM percorso
   - Passo Passo = guided + drawer con Avanti
   - Già Montato = complete + LED acceso + diagnosi UNLIM
4. documenta screenshot, console, network, tempi.

Poi apri solo i fix P0 verificati. Ogni sessione deve finire con:
- CoV
- audit
- debug
- handoff
- deploy se e solo se ci sono modifiche a codice/config/data e i gate passano.
```

