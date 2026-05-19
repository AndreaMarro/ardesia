# Handoff - UNLIM Superlativo Tea/Fumetti

Data: 2026-05-09

## Fatto in questa sessione

- Audit Tea/repo/fumetti ripetibile via `node scripts/tea-fumetti-package-audit.mjs`.
- Template Leonardo AI per fumetti con screenshot sessione, cronologia, contesto, memoria UNLIM e materiale Tea.
- Metadata fumetti collegati a `narrative_map_id`.
- Migration Supabase per `student_album`, `comic_assets`, `badges_catalog`, `student_badges` e trigger badge server-side.
- Shared state store caldo UNLIM con snapshot, eventi immediati e `AgentDecision` JSON seed.
- Integrazione del seed nel contesto inviato a UNLIM.
- Nanobot rivalutato: utile per policy/router, non per catalogo esperimenti.
- Addendum hard-mode: test severi aggiunti per risposte operative UNLIM, verifier tag, AgentDecision, runtime Playwright.
- Addendum Nanobot/Galileo: 200 test nuovi su frasi operative vaghe, circuiti, Scratch/Arduino, report/fumetto, vision/schermo e verifier; ciclo rosso 189/200 -> verde 200/200.
- Decisione Mistral embeddings: usare `mistral-embed` per knowledge Tea/volumi/sessioni e `codestral-embed` per codice, con retrieval ibrido e ingest server-side.
- Tool executor async: introdotto `executeActionTagsVerified`, usato dal flusso chat per non dichiarare azioni riuscite prima di Promise/verifica. Primo RED 2 fail, poi 13/13 bridge, 230/230 regressione e Playwright hard-mode 30/30.
- CORS/CSP compile sistemato e testato post-deploy preview: performance benchmark severo PASS su preview `https://elab-tutor-7qahic9er-andreas-projects-6d4e9791.vercel.app`.
- Voxtral/voce:
  - aggiunto `/api/voxtral`;
  - `voiceService` usa Voxtral clone come TTS primario;
  - `/api/tts` usa Voxtral come primario e non aspetta piu' il VPS legacy lento;
  - voice id clone osservato negli header: `9234f1b6-766a-485f-acc4-e2cf6dc42327`.
  - Benchmark voce endpoint pulito, ma FAIL formale per assenza di log hardware reale.

## File principali

- `src/services/unlimSharedStateStore.js`
- `src/services/comicPromptTemplate.js`
- `scripts/tea-fumetti-package-audit.mjs`
- `supabase/migrations/20260509010000_student_album_narrative_comics.sql`
- `tests/unit/unlimSharedStateStore.test.js`
- `tests/unit/comicPromptTemplate.test.js`
- `tests/unit/teaFumettiPackageAudit.test.js`
- `tests/unit/studentAlbumMigration.test.js`
- `tests/unit/unlimHardModeAdversarial.test.js`
- `tests/unit/unlimAgentDecisionHardMode.test.js`
- `tests/unit/unlimNanobotInspired200Hard.test.js`
- `tests/unit/lavagna/unlimActionExecution.regression.test.js`
- `tests/e2e/100-unlim-hard-mode.spec.js`
- `docs/audits/2026-05-09-unlim-hard-tests/`
- `docs/decisions/2026-05-09-mistral-embeddings-unlim-rag.md`
- `api/voxtral.js`
- `api/tts.js`
- `tests/e2e/101-unlim-performance-benchmark.spec.js`
- `tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js`
- `tests/unit/apiVoxtralProxy.test.js`
- `tests/unit/apiTtsFallback.test.js`
- `tests/unit/voiceServiceVoxtralPrimary.test.js`
- `docs/audits/2026-05-09-unlim-performance-benchmark/`
- `docs/audits/2026-05-09-unlim-voice-benchmark/`

## Prossima sessione consigliata

1. Portare `AgentDecision` da seed prompt a contratto server-side validato con schema.
2. Eseguire rami paralleli veri: diagnosis, rag, memory, vision-needed, tool plan.
3. Convertire i tag legacy rimanenti in tool calls typed con verifier obbligatorio e stato osservabile.
4. Applicare migration Supabase in ambiente controllato e testare RLS reali.
5. Collegare UI Album Studente: timeline, vista volume, vista capitolo, dettaglio fumetto, condivisione docente.
6. Costruire pipeline admin Leonardo AI con storage upload e record `comic_assets`.
7. Estendere l'executor async a tutti i tool: oggi copre i tag principali, ma alcuni fallback legacy restano best-effort.
8. Implementare ingest Mistral reale: chunker, cache hash, `MISTRAL_API_KEY`, pgvector text/code separati, benchmark recall prima di sostituire o affiancare l'indice esistente.
9. Implementare ramo Pixtral reale: screenshot sessione -> vision summary -> verifica con stato DOM/simulatore, senza mandare immagini quando lo stato strutturato basta.
10. Fare test hardware voce reale: microfono -> STT -> chat UNLIM -> Voxtral clone -> speaker, con log browser e valutazione uditiva della somiglianza.
11. Ridurre ulteriormente latenza voce: streaming/chunking TTS, risposte piu' corte, warm path Supabase/Mistral, cache frasi frequenti.
12. Continuare fumetto e Leonardo.ai come richiesto dall'utente: pipeline admin, prompt con screenshot sessione, cronologia, memoria UNLIM e materiale Tea.
13. Creare benchmark severissimo Leonardo/fumetto nella prossima sessione: tempo generazione, coerenza personaggi, copertura 94 esperimenti, qualita' prompt, continuita' narrativa, naming asset, metadata storage, retry/fallback e costo.
14. Stabilizzare performance generale: il fast path operativo e' sotto 1-2s sui casi noti, ma il benchmark performance severo resta FAIL per long task oltre 750 ms nei rerun preview.
15. Ripetere test post-production dopo ogni deploy su sito principale: fast active, voce/Voxtral, performance, console/network, no `[object Object]`, no white screen, no autoplay, iPad overflow.

## Non dichiarare

- Non dichiarare UNLIM "superlativo": manca ancora orchestrazione tool-native completa.
- Non dichiarare hardware reale PASS senza log hardware.
- Non dichiarare deploy production non eseguito: a fine sessione e' stato eseguito su `https://www.elabtutor.school`.
- Non dichiarare Mistral/Pixtral live PASS: in questa sessione sono stati progettati e coperti nel contratto/test, non eseguiti contro API reali.
- Non dichiarare tool executor completo al 100%: e' iniziato il passaggio vero, ma serve typed contract server-side per tutti i tool.
- Non dichiarare voce clone Andrea percettivamente validata: header e MP3 provano provider/voice id, non somiglianza umana.
- Non dichiarare performance severo PASS dopo i rerun fast-active finche' i long task non rientrano sotto 750 ms in modo stabile.
- Non fare benchmark Leonardo/fumetto in questa sessione: e' stato esplicitamente rinviato alla sessione successiva.

## Stato production finale

- Sito principale deployato: `https://www.elabtutor.school`.
- Deployment finale: `dpl_2NVVZ6yVYf2mBkHinTDBrCSxobN2`.
- CORS/CSP compile production: primo test fallito, poi fixato con Supabase `compile-proxy`; fast-active production PASS dopo fix.
- Performance severa production: FAIL. Prossima sessione deve trattare seriamente lazy loading/boot path/API readiness/long task/compile p95.
- Voce production: FAIL formale. `/api/tts` Voxtral e' veloce nel run, ma API ready lenta e nessuna prova hardware reale.
- Leonardo/fumetto: non benchmarkato in questa sessione per richiesta esplicita; aprire da qui nella prossima.
