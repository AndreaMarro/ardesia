# ARDESIA - context packets

## Packet 6 - Sprint ARDESIA gate-first recovery

Scopo:

- continue from the 2026-07-02 Codex sprint without re-opening broad analysis.
- finish LessonOS verification first, then only update product/demo work if gates are clean.

Repo/host:

- local monorepo: `/Users/andreamarro/VOLUME 3/ardesia`;
- Mini engine runtime: `ssh macmini`, repo `~/lessonos`.

Preconditions:

- do not touch `eval/gate.sh`;
- do not deploy;
- do not restart/enable schedulers;
- do not overwrite factory-owned dirty files in `~/lessonos`;
- do not start another full gate while manual PID `31601` or any successor `pytest -q --lf -x --no-header` is active.

Evidence already verified:

- `tests/test_adversarial_kimi.py` passes: `2 passed`.
- `tests/test_api_unlocked_path_package_review_spaced_due_anki.py` passes: `10 passed, 1 warning`.
- `uv run pytest -q --lf -x --no-header` exited green: `4587 passed, 4 skipped, 20 warnings in 1023.49s (0:17:03)`.
- Codex app automation remains paused.
- Headroom healthy; AgentMemory degraded/timeouts.
- `ardesia-lavagna` HTTP 200; API health HTTP 200; ELAB production HTTP 401.

Next commands:

- `ssh macmini 'ps aux | grep -iE "uv run pytest -q --lf|pytest -q --lf" | grep -v grep || true'` only to confirm no leftover test process.
- Do not rerun `--lf` unless there is a new code change or a later factory log contradicts this green result.
- `git diff --check`
- update `FACTORY-LIVE-STATUS.md` with the final `--lf` outcome.

Acceptance:

- Current full last-failed check is green from this session.
- Blocker if `--lf` fails with exact failing test and traceback.
- Incomplete if it is still running after the bounded window; record PID, elapsed time, CPU, and do not claim green.

Headroom:

- Use this packet only; no repo dump.
- Opus escalation only if `--lf` fails in a non-obvious way and the failure is reduced to file/line ranges.

## Packet 7 - Simulation Plugin / ELAB Vol.1 cap.6 esp.1 next slice

Scopo:

- turn the existing Simulation Plugin slice into a cleaner adapter/context packet before more code.

Relevant files:

- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/src/toolhost/simulationBreadboard.ts`
- `apps/studio/src/__tests__/ToolCanvasEmbeddable.test.tsx`
- `apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png`
- `apps/studio/public/elab/manuals/vol1/page-031-esercizio-6-1.png`
- ELAB source: `/Users/andreamarro/VOLUME 3/elab-builder/src/data/experiments-vol1.js`
- ELAB source: `/Users/andreamarro/VOLUME 3/elab-builder/src/data/lesson-paths/v1-cap6-esp1.json`
- ELAB source: `/Users/andreamarro/VOLUME 3/elab-builder/src/data/volume-references.js`

Known truth:

- The current default scene is Vol.1 `v1-cap6-esp1`, first LED, battery-only.
- Real manual page assets are mounted.
- Source drift exists: `experiments-vol1.js` and `lesson-paths/v1-cap6-esp1.json` disagree on wiring; the lesson-path explicit-hole data is currently treated as less-drift source.
- `bookLayout.status` must remain `draft` until crop/coordinate evidence is reviewed.

Next micro-slice options:

- adapter: read ELAB lesson-path/manual data into the ARDESIA scene model instead of hand-copying constants;
- verifier: produce a small `bookLayout` coordinate/crop packet for Vol.1 p.30/p.31;
- mobile detail: add a zoom/detail interaction for the embeddable without changing the physics claim.

Tests:

- `npm --prefix apps/studio test -- ToolCanvasEmbeddable.test.tsx`
- `npm --prefix apps/studio run typecheck`
- `npm --prefix apps/studio run build`
- `bash apps/studio/eval/gate.sh`
- `bash apps/studio/eval/replay-check.sh`
- `git diff --check`

Do not:

- claim Nano R4 emulation for a battery-only Vol.1 circuit;
- invent missing manual coordinates;
- use fake/demo circuit data as if book-verified;
- edit ELABTutor source unless the task is explicitly a plugin-source migration.

Data: 2026-07-01
Tipo: pacchetti brevi per Codex/Opus/Hermes/MiniMax

## Packet 1 - demo Vercel touchable, current truth

Scopo:

- consolidare una demo toccabile senza mentire sullo stato.

Repo:

- canon docs: `AndreaMarro/ardesia`;
- demo candidate: `AndreaMarro/ardesia-lavagna`.

File rilevanti:

- `docs/ops/VERCEL-MAP.md`;
- `ardesia-lavagna/src/App.tsx`;
- `ardesia-lavagna/src/lib/lessonFormat.ts`;
- `ardesia-lavagna/src/lib/plugins.ts`;
- `ardesia-lavagna/src/components/PluginTile.tsx`;
- `ardesia-lavagna/vercel.json`, `package.json`.

Simboli:

- `exportLesson`, `exportStudentLesson`, `importLesson`;
- `choosePlugin`, `addPlugin`;
- `PluginTile`, `ToolHostSession`;
- `serializeLesson`, `parseLesson`, `toStudentParts`.

Test/gate:

- `npm run typecheck`;
- `npm test -- --run`;
- `npm run build`;
- `curl -I -L https://ardesia-lavagna.vercel.app`;
- browser check Chrome headless.

Criteri di accettazione:

- URL accessibile;
- plugin montabile;
- interazione plugin osservata;
- export/import lezione provato;
- student-pack dichiarato solo se presente sul live/preview testato.

Rischi:

- live deploy del 2026-06-28 non equivale al branch locale del 2026-06-30;
- deploy preview richiede conferma;
- non confondere prototipo con monorepo canonico.

Cosa NON leggere:

- `plugins/elab-tutor/src/**`;
- `packages/engine/**`;
- ELAB dirty checkout.

Headroom:

- basta Codex locale; Opus non necessario.

## Packet 2 - future preview deploy of latest lavagna branch

Scopo:

- creare preview Vercel aggiornata che includa student-pack/passo-passo, se Andrea conferma deploy esterno.

Precondizione:

- conferma esplicita Andrea: "ok preview deploy ardesia-lavagna".

Repo:

- `/Users/andreamarro/VOLUME 3/ardesia-lavagna`, branch `feat/lavagna-p0-20260628`.

File rilevanti:

- `src/App.tsx`;
- `src/lib/lessonFormat.ts`;
- `vercel.json`;
- `package.json`;
- `dist/` solo output locale, non fonte.

Test/gate:

- typecheck/test/build pass prima del deploy;
- `vercel deploy` preview, non production;
- browser check sul preview URL;
- aggiornare `docs/ops/VERCEL-MAP.md` con URL e commit.

Cosa NON fare:

- `vercel --prod`;
- alias production;
- cambiare dominio;
- installare nuove dipendenze.

Headroom:

- Codex sufficiente;
- Opus solo se build/test falliscono in modo non banale.

## Packet 3 - monorepo cutover readability

Scopo:

- evitare che `AndreaMarro/ardesia` diventi indice morto.

Repo:

- `/Users/andreamarro/VOLUME 3/ardesia`.

File rilevanti:

- `README.md`;
- `ARDESIA-MAP.md`;
- `docs/CANON-INDEX.md`;
- `docs/ops/*.md`;
- `ops/knowledge/*.md` se serve stato storico.

Test/gate:

- docs-only: `git diff --check`;
- link/file existence via `test -f`;
- nessun build necessario salvo edit runtime.

Criteri:

- ogni repo/deploy ha classe;
- ogni demo ha source repo + status + verified path;
- ogni "future integration" resta desiderio se non costruito.

Cosa NON leggere:

- tutto `docs/vault/**` senza domanda governance;
- codice engine/studio intero.

Headroom:

- MiniMax/Hermes utile per audit lungo solo se canale sano;
- Codex basta per patch docs.

## Packet 4 - factory health audit

Scopo:

- capire se Mac mini e' vivo, sano, bloccato o in quota.

Host:

- `ssh macmini`, repo `/Users/progettibelli/lessonos`.

File/log rilevanti:

- `hourly.log`;
- `driver.log`;
- `DIGEST-latest.md`;
- `STATUS.md`;
- `ARCHITECT-CURRENT.md`;
- `COORDINATION.md`.

Comandi:

- `agentmemory status`;
- `launchctl list | egrep ...`;
- `ps aux | egrep ...`;
- `git status --short`, `git log -1`.

Criteri:

- distinguere processi vivi da loop sano;
- quote/cap registrati con timestamp;
- fallback Hermes verificato con output reale;
- nessun restart senza richiesta.

Cosa NON fare:

- kill/restart;
- edit driver;
- reset;
- stash/drop;
- arming gate.

Headroom:

- leggere tail log, non file interi;
- Opus solo per gate rosso ripetuto o architettura di loop.

## Packet 5 - Headroom adoption dry-run

Scopo:

- valutare Headroom come tool, non installarlo.

Fonti:

- `docs/ops/HEADROOM-RESEARCH.md`;
- `https://github.com/headroomlabs-ai/headroom`;
- `https://headroom-docs.vercel.app/llms.txt`.

Accettazione:

- URL, owner, licenza, scopo verificati;
- compatibilita' ARDESIA scritta;
- nessuna copia codice;
- nessun wrapper su agenti live.

Escalation:

- Opus non necessario per ricerca;
- sicurezza/ops senior necessaria prima di proxy/wrap nel loop live.

## Chain of verification

- Questi packet sono input brevi, non piani esaustivi.
- Ogni task deve crearne o selezionarne uno prima del fanout.
- Ogni output deve dire file letti, file esclusi, gate e claim non verificati.
