# AGENTS.md — MAESTRO-Studio (regole per Hermes)

## 1. Identità e missione
MAESTRO-Studio = la superficie di CATTURA del progetto MAESTRO: **la lavagna che registra**.
Stack: React 19 + TypeScript + Vite 8, Excalidraw 0.18 (MIT), MathLive (MIT), pdfjs (Apache).
Milestone M0, task in ordine VINCOLANTE: **T0 WorkspaceStore → T1 JournalRecorder (KILL-TEST replay deterministico) → T2 Audio Mode A → T3 bundle `.lesson`**.
Gli ORDINI con i criteri di accettazione = `~/lessonos/COORDINATION.md` § CLAUDE-SAYS (UNICA fonte di verità). NON inventare task fuori ordine.

## 2. Pipeline iterazione (UNA task per iterazione)
ORIENT (STATUS.md + ordini + codice) → PLAN (la PRIMA task M0 non completata; UNA ipotesi) → BUILD (codice + test vitest NON tautologici) → REVIEW (`./bin/review.sh`, applica i fix VERI) → GATE `bash eval/gate.sh` VERDE → COMMIT + append STATUS.md + append log.jsonl.

## 3. Regole tecniche (gotcha REALI già pagati — non ri-sbattere)
- tsconfig è STRICT (`noUnusedLocals`/`noUnusedParameters`): import/variabili inutilizzati FALLISCONO il gate (TS6133) — pulisci prima di consegnare.
- jsdom di vitest NON fornisce un localStorage completo: nei test stub esplicito (`Object.defineProperty(globalThis, 'localStorage', …)`) in beforeEach/setup — niente try/catch silenziosi che mascherano il guasto.
- Blob binari (audio/immagini): MAI `data.text()` per serializzare — corrompe i byte; usa arrayBuffer → base64.
- React duplicato: `resolve.dedupe ['react','react-dom']` già in vite.config — NON rimuovere.
- Nuova dipendenza → `npm install` aggiorna package.json + package-lock.json: COMMITTALI entrambi. I test girano headless (vitest), niente dev server nel loop.
- DOM nei test: devDep `jsdom` (già installata) + `// @vitest-environment jsdom` in testa al file di test.
- `mathjax-full` npm = CJS rotto → MathJax via CDN (latexToImage.ts) — non toccare.
- Eventi journal: `events.jsonl` APPEND-ONLY, timestamp epoch ms, replay deterministico (nessun `Math.random`/`Date.now` nel percorso di REPLAY).
- localStorage = CACHE, mai fonte di verità (la verità = cartella FSA / export bundle).
- Playwright è installato sul Mini: per il replay-test T1 "a schermo" usalo headless (chromium). MAI dichiarare "verificato" senza un test che gira.

## 4. Vincoli duri (violarli = REVERT)
- `eval/gate.sh` INTOCCABILE; mai indebolire/skippare test per far passare il gate.
- ZERO codice/brand ELAB. ZERO "Numeria". Niente video embed (Meet esterno). Niente cloud/Supabase in M0. Niente dipendenze pesanti senza giustificazione scritta in STATUS.md.
- GDPR Mode A strutturale: audio SOLO microfono docente, default OFF, consenso registrato in session.yaml. MAI voci di studenti.
- Formati aperti e longevi: JSONL / Markdown / SVG / zip. Schema dati versionato (campo `v`).

## 5. Quando sei bloccato
2 tentativi falliti sulla stessa task → scrivi una voce in `~/lessonos/COORDINATION.md` § NEEDS-CLAUDE e fermati. NON grindare.

## ARCHITECT-CURRENT.md (design opus pre-build)
Se nella root del repo esiste `ARCHITECT-CURRENT.md` e il suo PIN-SIG corrisponde alla task pinnata corrente, e il DESIGN autoredatto da opus PRIMA del build: leggilo PER PRIMO (dopo questo AGENTS.md) e seguilo; migliora solo motivando in STATUS.md. Se PIN-SIG non corrisponde al pin attuale e stantio: ignoralo.
