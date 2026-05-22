# Prompt Codex Desktop - Continuare Percorso Morfico Runtime

Usa questo prompt in Codex Desktop per continuare il lavoro senza perdere contesto.

```text
Lavora in /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter83-percorso-morfica.

OBIETTIVO
Continuare il lavoro sul pannello Percorso morfico runtime. Il pannello deve restare fedele al percorso canonico dei volumi ELAB ma adattare in tempo reale regia, quantita di testo corretto, numero di slide/schermate, micro-step e suggerimento operativo in base a docente, classe, stato-sessione e segnali live.

PRINCIPIO ZERO v3
- Il docente guida sempre.
- L'AI non sostituisce il docente.
- Frasi classe con "Ragazzi,".
- Kit fisico ELAB protagonista.
- Riferimenti Vol.X pag.Y sempre canonici.
- Non inventare sequenze o componenti fuori manuale/kit.
- Non trasformare Percorso in chat generica.

STATO ATTUALE
Commit applicativo: 90eb2519 feat(lavagna): make Percorso panel realtime morphic.
Deploy produzione: https://www.elabtutor.school.
Production deployment: https://elab-tutor-7ea1od4dl-andreas-projects-6d4e9791.vercel.app.
Audit: docs/audits/2026-05-20-percorso-morfico-runtime-cov-deploy.md.
Piano: docs/superpowers/plans/2026-05-20-percorso-morfico-runtime-next.md.

COMANDI GIA PASSATI
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx -> 12/12 PASS.
npx vitest run tests/unit/lavagna -> 31 files, 248 tests PASS.
npx vitest run --coverage --coverage.include=src/components/lavagna/PercorsoCapitoloView.jsx tests/unit/lavagna/PercorsoCapitoloView.test.jsx -> PercorsoCapitoloView.jsx 85.25% statements/lines, 60.97% branches, 92.3% functions.
npx vite build -> PASS con warning noti CSS/chunk.
ELAB_BASE_URL=https://www.elabtutor.school npx playwright test --config tests/e2e/playwright.config.js tests/e2e/10-deploy-verify.spec.js -> 4/4 PASS.

FILE APPLICATIVI MODIFICATI
- src/components/lavagna/PercorsoCapitoloView.jsx
- src/components/lavagna/PercorsoCapitoloView.module.css
- tests/unit/lavagna/PercorsoCapitoloView.test.jsx

CONTRATTO LIVE ATTUALE DEL PANNELLO
Evento per cambio contesto:
- elab:percorso-morphic-context-changed

Evento per segnali aula:
- elab:percorso-live-signal

Fonti supportate:
- text, writing, message -> scrittura
- action -> azione
- mounting, circuit -> montaggio
- latency -> latenza / latenza alta
- screenshot -> screenshot
- audio, voice -> audio
- past_lesson, lesson_memory, memory -> lezioni passate

Storage supportato:
- elab-percorso-live-signals:<capitoloId>
- elab-percorso-live-signals
- elab-percorso-written-message
- elab-percorso-action-state
- elab-percorso-mounting-state
- elab-percorso-latency-ms
- elab-percorso-screenshot-state
- elab-percorso-audio-state
- elab-percorso-past-lesson-memory

PROSSIMO LAVORO CONSIGLIATO
Segui docs/superpowers/plans/2026-05-20-percorso-morfico-runtime-next.md con TDD.
Prima estrai src/services/percorsoLiveSignalBus.js.
Poi collega producer reali se e solo se il vincolo "solo pannello Percorso" viene rilassato:
1. GalileoAdapter Percorso chat -> source text.
2. useGalileoChat -> source latency.
3. simulator-api / breadboard state -> source action/mounting.
4. voiceService -> source audio.
5. eventuale screenshot/OCR -> source screenshot.
6. memoria sessioni/Supabase -> source past_lesson.

SE IL VINCOLO RESTA "SOLO PANNELLO"
Non toccare producer esterni. Migliora solo PercorsoCapitoloView e test: lettura storage, normalizzazione segnali, budget, layout, coverage, E2E che inietta segnali da pagina.

DOCUMENTI/FILE DI CONTESTO DA LEGGERE
- AGENTS.md
- .codex/AGENTS.md
- CLAUDE.md
- docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md
- docs/adrs/ADR-046-percorso-lezione-personalizzata-onniscenza-mistral.md
- docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md
- docs/adrs/ADR-049-sense-1.6-morfismo-extended-runtime-context.md
- docs/tea/TEA-QUICKSTART.md
- docs/tea/ONBOARDING-TEA-COMPLETO.md
- docs/tea/2026-04-26-tea-claude-brief.md
- src/components/lavagna/PercorsoCapitoloView.jsx
- src/components/lavagna/PercorsoCapitoloView.module.css
- tests/unit/lavagna/PercorsoCapitoloView.test.jsx
- src/services/percorsoMorphicAdapter.js
- tests/unit/services/percorsoMorphicAdapter.test.js
- src/components/lavagna/GalileoAdapter.jsx
- src/components/lavagna/useGalileoChat.js
- src/services/simulator-api.js
- src/services/voiceService.js

MATERIALI TEA FUORI REPO
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_metadata_94.json
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_schema.json
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_v1-cap6-esp1.json
- /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/bibbia_stilistica.pdf
- /Users/andreamarro/VOLUME 3/TEA/MANUALE VOLUME 1 ITALIANO.pdf/markdown.md
- /Users/andreamarro/VOLUME 3/TEA/MANUALE VOLUME 2 ITALIANO.pdf/markdown.md
- /Users/andreamarro/VOLUME 3/TEA/Manuale vol 3 versione 0.13.pdf/markdown.md

REGOLE DI SICUREZZA
- Non scrivere chiavi/API token in repo.
- Non toccare cliffhanger-table/narrative-map/lesson-paths salvo richiesta esplicita.
- Non cambiare LavagnaShell o ModalitaSwitch senza nuovo mandato.
- Non pushare senza richiesta.
- Ogni cambiamento deve avere test prima, poi implementazione.

VERIFICA MINIMA PRIMA DI DIRE FATTO
npx vitest run tests/unit/lavagna/PercorsoCapitoloView.test.jsx
npx vitest run tests/unit/lavagna
npx vitest run --coverage --coverage.include=src/components/lavagna/PercorsoCapitoloView.jsx tests/unit/lavagna/PercorsoCapitoloView.test.jsx
npx vite build
git diff --check
```

## Prompt Breve per Claude in Chrome

```text
Agisci come documentatore tecnico e product reviewer per ELAB Tutor. Leggi il documento docs/audits/2026-05-20-percorso-morfico-runtime-cov-deploy.md e il piano docs/superpowers/plans/2026-05-20-percorso-morfico-runtime-next.md. Produci una sintesi onesta in italiano: cosa e' stato realizzato, cosa non e' ancora reale end-to-end, quali rischi didattici ci sono, quali file sono fondamentali, quali test validano il lavoro e quale sarebbe il prossimo passo piu professionale. Mantieni Principio Zero v3: docente guida, "Ragazzi,", kit fisico ELAB, Vol/pag canonici, niente AI invasiva.
```
