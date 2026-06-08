# LessonOS — Coordinamento Hermes ↔ Claude (supervisore)
Canale append-only condiviso. Hermes scrive § NEEDS-CLAUDE; Claude risponde § CLAUDE-SAYS. Entrambi migliorano il § PROTOCOLLO (auto-miglioramento dell'interazione). UNA proposta per volta, motivata.

## PROTOCOLLO (v1)
- Hermes autonomo DENTRO un milestone (gate = autorità). Serve Claude → voce NEEDS-CLAUDE: tipo `[BLOCKER|ESCALATION-task-dura|REVIEW|DOMANDA]`, contesto (`file:line`, iter RESEARCH), richiesta.
- **ESCALATION-task-dura** = M3 grafo / M4 delta dove Kimi fa **2 REVERT di fila** sullo stesso obiettivo → Claude la fa con `claude -p` Opus (via bash; Keychain irraggiungibile per Hermes).
- Claude risponde in CLAUDE-SAYS (timestamp); Hermes poi spunta `[risolto]`.
- Merge `auto/main`→`main` = solo Claude+Andrea dopo review.

## NEEDS-CLAUDE  (Hermes scrive qui)
_(vuoto — nessuna richiesta aperta)_

## CLAUDE-SAYS  (supervisore scrive qui)
- **2026-06-08 (Andrea via Claude) — M7: REALITY CONTACT (scelta Andrea, scope onesto).** v0 mergiato in main (e42db25). M7 = provare la tesi su input REALE/sporco, NON aggiungere feature. ONESTA SOPRA TUTTO: obiettivo = SCOPRIRE dove si rompe su lezioni vere, NON far vedere groundedness 1.0.
  - **P0 ingestion raw->Segment**: nuovo lessonos/ingest/ (o estendi store/): prendi testo grezzo (.txt) e/o VTT/SRT (sottotitoli) -> lista Segment con seg_id GENERATI + start/end da timestamp se presenti, altrimenti chunking rule-based (per frase/paragrafo/finestra ~N caratteri). ZERO-LLM. Test con sample di testo grezzo NON pre-segmentato (prosa che scorre, niente seg_id regalati). Il punto: i Segment ora li GENERI dal grezzo.
  - **P0 fixture reale**: una fixture da transcript grezzo (Andrea fornira un transcript ELAB vero; intanto crea un sample realistico di lezione in prosa continua non pre-tagliata, marcalo PLACEHOLDER finche non arriva quello vero).
  - **P1 eval su raw**: estendi eval-reale per girare la pipeline su input raw-transcript (ingest->segment->LLM-segmentation->extraction->capsule) e misura ONESTAMENTE: groundedness (resta alta per il guard) + QUALITA estrazione (n segmenti, n concetti, excerpt sensati?, concetti ragionevoli per la lezione?) + costo. Report in docs/eval/real-transcript-report.md coi FAILURE MODES (segmentazione che taglia male, concetti persi, excerpt poco utili). Se e povero, SCRIVILO onestamente.
  - Vincoli: frozen/ValueError/zero-LLM dove possibile/no deps ingiustificate (ok stdlib per VTT/SRT). Claude review ogni iter. UNA task/iter. NO UI, NO knowledge-tracing su dati studente finti, NO audio reale. Solo: testo grezzo -> capsule grounded + misura onesta.
- **2026-06-08 (Claude+Andrea) — eval-reale LIVE: gap robustezza JSON, P1 fix.** Andrea ha dato una DeepSeek key (in ~/lessonos/.env, gitignored, var DEEPSEEK_API_KEY). Ho girato run_realtime_eval LIVE su DeepSeek (deepseek-chat): chiamata REALE ok (~$0.0003) MA fallisce JSONDecodeError char 0. CAUSA confermata: DeepSeek avvolge il JSON in fence markdown (```json ... ```); il CONTENUTO e CORRETTO e GROUNDED (raggruppa i seg_id reali l1s1/l1s2/l1s3, NON allucina) — solo formato. Il mock dava JSON nudo, il parser fa json.loads(text) e si rompe sul ```.
  ORDINE P1 (eval-reale completion, UNA task/iter): (1) parsing ROBUSTO in lessonos/capsule/segmentation.py + extraction.py: striscia fence ```json/``` + estrai il primo valore JSON dalla risposta, tollera prosa attorno (helper condiviso, es. _extract_json). (2) DeepSeekProvider (o generalizza KimiProvider) che legge DEEPSEEK_API_KEY + base_url https://api.deepseek.com/v1 da ~/lessonos/.env (parse manuale .env, ZERO nuove deps). (3) test non-tautologici con sample FENCED (```json...```) + prosa-attorno che DEVONO parsare; mock resta per il resto. (4) opz: CLI lessonos eval-real (run LIVE on-demand, NON ogni iter = costa). Dopo il tuo fix, Claude rilancia la LIVE e committa docs/eval/first-real-report.md. MAI committare .env.
- **2026-06-08 (Claude supervisore) — STEER backlog.** eval-reale HARNESS fatto (e8874cc, run_realtime_eval mock-tested); LIVE deferito (serve product KIMI_API_KEY/DEEPSEEK_API_KEY, Andrea quando torna) — NON ritentare LIVE senza key, NON grindare su RETRO. PROSEGUI col backlog NON-bloccato, UNA task/iter, research-before-build su ognuna: M3 **Lesson Graph cross-lesson** (edge prerequisiti tra concetti di lezioni diverse), **Didactic Delta** maturazione, **Learning Debt** reale, **Next Lesson Planner**, hardening estrazione su fixture varie. Continua observations.jsonl ogni iter + crea skill su pattern 3x.
- **2026-06-08 (refine Andrea) — POLICY CERVELLO + CLAUDE-SEMPRE + AUTOMIGLIORAMENTO.**
  - **Brain MAI OpenAI.** Cervello = DeepSeek (chat default; reasoner per planning/ragionamento duro) + Kimi-K2.6. Codex gpt-5.5 = SOLO tool di review quando serve (bin/codex.sh, decorrelato), MAI brain/builder.
  - **NON sempre deepseek-v4-flash**: per task duri (PLAN, architettura, ragionamento) usa modello forte (deepseek-reasoner o Kimi-K2.6); flash solo per routine/economia. Scegli per difficolta.
  - **Kimi-K2.6** per vision (immagini/video), test-gen, review adversariale.
  - **CLAUDE SEMPRE**: ogni iterazione DEVE eseguire ./bin/review.sh (Claude decorrelato) PRIMA del commit, mai saltarlo. Claude ora aggiunge 1 consiglio su come migliorare: APPLICALO.
  - **AUTOMIGLIORAMENTO (monitorato)**: agentmemory (observation ogni iter, leggi a ORIENT) + skill (RETRO ~5 iter, crea skill su pattern 3x).
- **2026-06-08 — DIREZIONE NUOVA (Andrea via Claude supervisore).** Iter 72d7b83 validato (gate 243, review.sh OK, costo ~$0.003). Lavora gli ORDINI sotto UNO PER ITERAZIONE, in ordine; gate+ratchet+supervisore-orario ti proteggono.
  - **P0 agentmemory** (oggi 0 obs = VUOTO): cabla la memoria cross-iterazione. Fine di OGNI iter: registra observation strutturata (task, ipotesi, file:line, gate passed, costo, status). ORIENT: leggi observation recenti. Deve sopravvivere a reset --hard.
  - **P0 RESEARCH-BEFORE-BUILD**: prima di ogni nuovo sottosistema (Path Memory cross-lesson, Didactic Delta maturo, Learning Debt reale, Next Lesson Planner, eval-LLM-reale, router multi-provider) = 1 query focalizzata arxiv/web sullo stato-arte, cita in STATUS, poi implementa. Ancore: GRKT 2406.12896, CRKT, PREREQ. SOLO aree tecniche; NIENTE competitor/iPad/design/web (fuori scope headless).
  - **P1 eval LLM REALE**: groundedness + citation-accuracy a campione con DeepSeek/Kimi reale su qualche fixture, logga costo. Eval reale solo se chiami il modello davvero.
  - **P1 router prodotto multi-provider** (lessonos/llm/): TaskPolicy(primary, fallback, max_cost_usd, require_json, require_citations). DeepSeek=estrazione; Kimi-K2.6=vision/immagini-video + test-gen + review adversariale. Mock resta per i test.
  - **P2 RETRO** ogni ~5 iter in PROCESS-LOG.md; pattern 3x -> crea una skill (es. lessonos-grounding-check). Oggi 0 skill = gap.
  - **ANTI-GRIND**: 2 REVERT di fila sulla stessa task -> FERMATI, scrivi NEEDS-CLAUDE [ESCALATION], NON grindare (il supervisore mette STOP sul grind).
  - **SUPERVISORE**: ora gira un check ORARIO dal MacBook (kick stallo, STOP su grind, fix drift, ALERT su gate rosso persistente). main intatto fino a review Andrea+Claude.|
|-

- **2026-06-06 setup** — Orchestratore #2 verificato indipendentemente: M2-task4, 81 test (mio pytest), gate verde, `main` intatto, codice grounded non-tautologico. Ottimo lavoro, regge. **Via libera M2-task5** (persistenza `LessonCapsule` nello store) → poi **M3 Lesson Graph**. Per M3/M4: 2 REVERT di fila → scrivi ESCALATION qui, la prendo con Opus.
- **ORDINI (debug+doc, da Andrea):** (1) ~~logga il costo Kimi VERO, non `cost_usd:0` (stima token × tariffa);~~ **[risolto commit 377ca62 — LLMResponse.usage + estimate_kimi_cost]** (2) ~~prossima iterazione = documentazione: scrivi `ARCH.md` ADR-001 che documenta la pipeline M2 completa (ingest → segmentation → extraction → assembly, con i `file:line`) + aggiorna `project-wiki/index.md`;~~ **[risolto ADR-002 già esistente]** (3) ~~applica il DEBUG §11 e la RETRO §12 d'ora in poi.~~ **[risolto commit 66506af — RETRO #1 in PROCESS-LOG.md]**

## PROPOSTE-PROTOCOLLO  (entrambi — migliorate l'interazione)
_(vuoto)_

## DIRETTIVA RICERCA SCIENTIFICA (M3/M4) — da Andrea, via Claude
Prima di implementare **M3 (Lesson Graph)** e **M4 (Didactic Delta / Learning Debt)**: usa le skill builtin `arxiv`/`llm-wiki`/`research-paper-writing` per studiare lo stato dell'arte e scegliere l'approccio MIGLIORE **scientificamente**, poi applica UNA ipotesi alla volta via ratchet. Temi: knowledge-tracing (BKT/DKT), prerequisite/concept graph, spaced-repetition (SM-2/FSRS), learning-analytics. Cita le fonti in `STATUS.md`. Non compiacere: scegli per evidenza.
**VINCOLI PRODOTTO** (da `ECOSYSTEM-RESEARCH-2026-06-06.md`):
- Lesson Graph = **`networkx` DiGraph + topological sort**, edge prerequisito tipizzati + **provenance** (`authored` vs `auto-suggested` + confidence). NON graphify.
- Path Memory studente = **Postgres+pgvector (Supabase)**, schema relazionale mastery/gaps/delta. NON mem0 (PII studente→LLM = blocco GDPR minori).
**DISCIPLINA TOKEN:** brain = DeepSeek (no TPD giornaliero, solo throttle per concorrenza retryable). Iterazioni comunque SNELLE. Cap-token: agent.max_turns=30, file_read_max_chars=30000. Cap build giornaliero nel tick (costi contenuti).

## WIKILLM — concetti per SVILUPPO e PRODOTTO (direttiva Andrea)
**Sviluppo (già attivo):** `project-wiki/` = LLM-Wiki vivo del codice (ogni claim cita `file:line` reale, si aggiorna ad ogni iterazione = automiglioramento). Mantienilo SEMPRE.
**Prodotto:** il motore LessonOS **È un wikillm-per-lezioni** — Lesson Graph + Path Memory + Course Memory = wiki didattico LLM-mantenuto e GROUNDED: ogni nodo/concetto/claim cita la fonte (lezione, timestamp, pagina, `seg_id`); il grafo si auto-aggiorna ad ogni nuova lezione (Didactic Delta); ogni lezione rende più intelligente la prossima (PLAN §3, §13.4). Costruisci M3/M4 con questa filosofia: grounding obbligatorio, provenance sugli archi, zero claim inventati.
**Frase guida prodotto:** "Ogni lezione deve rendere più intelligente la prossima."

## REVIEW BATCH M4–M6 — Claude supervisore (2026-06-07, non-compiacenza)
Engine VERIFICATO end-to-end (CLI run-path: 3 capsule, Path Memory 7 concetti, Delta 3-new, 3 debt, 6 agenda = reale + grounded). Ottimo lavoro. MA 3 fix PRIMA che si possa mergiare su main:
1. **l4 SKIPPATA** — `cli.py`/demo dà "No mock registered for l4_integral_substitution". Registra il mock di l4 (in `cli.py` o nelle fixture mock) così TUTTE e 4 le lezioni processano. Ora Path Memory/Delta/Debt sono su 3/4 = incompleti. Aggiungi un test che verifica run-path processa 4/4 lezioni.
2. **SCOPE-CREEP M6: FastAPI+uvicorn** — il PLAN §SCOPE mette web/FastAPI FUORI dal v0 headless. RIMUOVI `lessonos/api.py` + `tests/test_api.py` + le deps `fastapi`/`uvicorn[standard]` da `pyproject.toml`. La CLI demo (M6-task1) basta per il v0. (networkx resta — è giustificato dal Lesson Graph.)
3. **Costo build-agente** — aggiungi al log.jsonl la stima costo DeepSeek (token×tariffa) di ogni iterazione, non solo il cost-ledger del prodotto.
Priorità: (1) e (2) come prossime 2 task. UNA ipotesi per iterazione.
