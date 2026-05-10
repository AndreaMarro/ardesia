# Ralph Loop Iter 1 Close → Iter 2 Handoff

**Data**: 2026-05-10 ~03:35 GMT+2
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Stash dropped**: `f787cd8e30dcf5dd675ae61b3761548ecace47c2` (era stash@{0})
**Backup tag**: `backup/opzione-a-rejected-20260510-iter1`

## Iter 1 deliverables

1. **OPZIONE A annullata**. Branch `fix/nanobot-render-primary-and-lang-120w-2026-05-10` deletato. Mistake honest: avevo proposto Render primary che è 13-17s warm, peggio di Edge.

2. **Restore stash Andrea 2026-05-09 parallel agent system** su nuovo branch:
   - 80 file modificati
   - 93 file untracked (subset originale 273 — alcuni docs CoV/screenshot persi durante apply parziale precedente, recoverable da git-restore commit checkpoint Andrea ha probably)
   - Architettura confermata: `unlim-ai-profiles.ts` (425 LOC) + `unlimSharedStateStore.js` (143 LOC) + `executeActionTagsVerified` in `useGalileoChat.js` (1379 LOC)

3. **CoV vitest baseline preserved**: **13927 PASS / 1 fail / 15 skip / 17 todo / 13960 totali / 306 file PASS / 1 fail (wakeWord off-pref localStorage edge — pre-existing flake) / 2 file skip**.
   Vs baseline iter 38 13474 = **+453 nuovi tests Andrea** (200 Nanobot-inspired + 8 AI profiles + altri). 0 regressioni reali.

4. **Live prod baseline 5 probes** (vs probe stamane 7):
   - P1 Cita Vol.1 LED: `flash-lite volume1_fast` 2.81s, format `[Volume 1, pagina 27]` con virgolette dirette (no "Ragazzi,", no Vol.X pag.Y format)
   - P2 Multimetro Vol.2: `flash volume2_fast` 1.91s, risposta tecnica + analogia acqua tubo (no Ragazzi, no Vol/pag)
   - P3 Vision empty array: `pixtral_total` 1.63s, **ALLUCINA "Vedo un LED rosso..."** (BUG confermato)
   - P4 pinMode Vol.3: `direct-operational-arduino` 0.35s, **non risponde domanda, apre editor** (design issue)
   - P5 Ciao: `flash-lite general_purpose_compact` 1.54s, OK
   - **Constato**: AI profiles wirati e funzionano. Plurale "Ragazzi," non più forzato (decisione Andrea 2026-05-09 doc — citazioni come ancora). L2 template router ancora threshold=2 in code ma 5/5 probe iter 1 non hanno triggerato.

5. **TRES JOLIE volumi cartella localizzata**: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/`
   - Vol1: `MANUALE VOLUME 1 ITALIANO.pdf`
   - Vol2: dir `2 MANUALE VOLUME  2`
   - Vol3: dir `2 MANUALE VOLUME 3`
   - + FOTO complessive, FUSTELLE scatole, BOM componenti, SKETCH manuale Vol3, DOCUMENTAZIONE BREAKOUT NANO ELAB
   - **Audit alignment lesson-paths software vs PDF manuali = task iter 2 atom dedicato**

6. **Architettura confermata** (lettura codice):
   - `selectUnlimAiProfile()` line 217 unlim-chat — 10+ profili, dispatch su prompt+context
   - `aggregateOnniscenza()` line 331 — 7-layer aggregator opt-in `ENABLE_ONNISCENZA=true`
   - `LIVE_CHAT_RAG_BYPASS` line 276 ANCORA ATTIVO — comment iter 2026-05-09 dice "no live RAG wait"
   - `buildAgentDecisionSeed()` `unlimSharedStateStore.js:93` — 7-branch decision JSON (reply|act|diagnose|vision|rag|album|comic|clarify)
   - `executeActionTagsVerified()` `useGalileoChat.js:136` — verified tool executor con expected/observed records

## Bug residui categorizzati (post-Andrea-arch)

| Bug | File | Severity | Categoria |
|---|---|---|---|
| L2 template router threshold=2 wrong-fires | `clawbot-template-router.ts:126` | HIGH | Pre-LLM short-circuit indipendente |
| Vision empty `images:[]` hallucination | `unlim-chat/index.ts` (vision branch) | HIGH | Gate logic |
| direct-operational pinMode non risponde | `operational-response.ts` | MEDIUM | Design (apre editor sempre) |
| Plurale "Ragazzi," non più forzato | `system-prompt.ts` | MEDIUM | Andrea decision 2026-05-09 ma vs PRINCIPIO ZERO V3 mandato Andrea iter 21 — chiarire |
| Vol/pag verbatim mancante 3/5 probe | `system-prompt.ts` knowledge pack | MEDIUM | RAG metadata NULL gap iter 14 + Andrea decision "ancora non risposta" |
| L2 template router non parte parallel agent | `unlim-chat/index.ts` flow | MEDIUM | Decisione Andrea: rimpiazzare con AgentDecision intent classifier |
| LIVE_CHAT_RAG_BYPASS bypassa retrieval live | `unlim-chat/index.ts:276` | HIGH | Volume knowledge solo statico; Andrea piano: ramo `rag` parallelo non ancora wired |

## Iter 2 atomic plan (proposto)

### A1 — Fix L2 template router (threshold 999)
- File: `supabase/functions/_shared/clawbot-template-router.ts:126`
- Test: `tests/unit/clawbot-template-router.test.js` add "default 999 returns null" test + passa `threshold:2` esplicito ai 6 test esistenti
- ETA: 30 min
- Gate: vitest 13927+ baseline preserve

### A2 — Fix vision empty array gate
- File: `supabase/functions/unlim-chat/index.ts` cerca `hasImages` o vision branch entry
- Test: `tests/integration/unlim-chat-empty-images.test.js` NEW — 2 test (empty array no vision; non-empty triggers vision)
- ETA: 45 min
- Gate: probe live P3 deve restituire risposta non-vision

### A3 — Fix direct-operational pinMode response
- File: `supabase/functions/_shared/operational-response.ts` (cerca pinMode/openeditor logic)
- Decisione: pinMode è domanda CONOSCENZA, non operativa. Direct-operational dovrebbe skip + passare a LLM con `volume3_deep` profile.
- ETA: 1h
- Gate: P4 deve restituire spiegazione testuale + opzionalmente azione

### A4 — Decisione Plurale "Ragazzi," (Andrea ratify)
- Andrea ratify queue: invariante PRINCIPIO ZERO V3 mandate iter 21 vs decision parallel agent 2026-05-09 "naturale tutor vivo no Ragazzi forzato"
- Se PZ V3 invariante: re-add forced opening in `system-prompt.ts` BASE_PROMPT
- Se Andrea cambia: doc decision in CLAUDE.md
- ETA: 5 min Andrea

### A5 — TRES JOLIE volumi alignment audit
- Compare: PDF Vol1+Vol2+Vol3 manuali vs `src/data/lesson-paths/v{N}-cap{X}-esp{Y}.json` vs `src/data/volume-references.js` (94 enriched) vs system-prompt.ts knowledge pack vol1/2/3
- Output: `docs/audits/2026-05-10-tres-jolie-vs-software-alignment.md`
- ETA: 3-4h sub-agent dispatch (Explore agent)
- Gate: list discrepanze flagged + suggerimenti correzione

### A6 — RAG live retrieval restore (LIVE_CHAT_RAG_BYPASS removal)
- File: `unlim-chat/index.ts:276-285`
- Replace: `ragContext = ''` con `ragContext = await formatHybridContext(await hybridRetrieve(safeMessage, classifier.topK))`
- Skip se `classifier.skipRAG` (chit_chat)
- Gate: NO regressione 13927 + R5 50-prompt prod ≥85% PZ V3 PASS post-fix
- ETA: 1.5h code + 1h R5 bench
- **Rischio**: RAG metadata NULL → chunks corretti ma citazioni Vol/pag limitate. Mitigazione: classifier topK=2 stretto.

### A7 — ENABLE_ONNISCENZA env activation (Andrea action)
- Andrea: `npx supabase secrets set ENABLE_ONNISCENZA=true --linked`
- ETA: 5 min Andrea
- Effect: aggregatore 7-layer attivo prod (RAG + Wiki + Glossario + Sessione + Vision + LLM-knowledge + Analogia)

### A8 — R5 50-prompt prod bench post-fixes
- Run: `node scripts/bench/run-sprint-r5-stress.mjs --target prod --fixture scripts/bench/r5-fixture.jsonl`
- Score: `node scripts/bench/score-unlim-quality.mjs --input scripts/bench/output/r5-stress-*.jsonl`
- Gate: ≥85% PZ V3 PASS (era 91.45% iter 32)
- ETA: 1h

### Stretched iter 3+
- Streaming SSE Edge Function (Vercel AI SDK pattern, first-token <500ms)
- PostHog LLM telemetry plugin wire-up
- Mistral embeddings re-ingest (text + codestral) + RAG metadata backfill iter 14
- Canary rollout 5%→25%→100%
- 200-prompt R7 INTENT canonical bench
- Render decommission decision

## STOP gate iter 2 entrance

Andrea decide:
- **A1+A2 oggi/domani** (fix tecnici 1-2h totale, no deploy senza OK)
- **A4 ratify** plurale Ragazzi (5 min)
- **A5 TRES JOLIE audit** sub-agent dispatch 3-4h read-only
- **A6+A7+A8 deploy gate** post Andrea OK

Iter 2 entry: dispatch atomi A1+A2+A5 in parallelo (3 agent), A3+A6 sequenziali post A1, A7+A8 sequenziali post A6 deploy.

## File toccati iter 1

Code: ZERO (solo branch operations + read).
Doc: questo handoff + plan precedente `2026-05-10-unlim-parallel-agent-deploy-and-modernize.md`.

## CoV iter 1

- vitest: 13927 PASS / 1 fail (orthogonal pre-existing) / 0 regression
- build: NOT run (defer iter 2 entrance — heavy 14min)
- live prod probe: 5/5 HTTP 200, AI profiles wirati, 3 bug residui categorizzati

## Honesty caveats

1. Iter 1 = audit + setup. NO deploy. NO code change.
2. Restore stash parziale (93/273 untracked) — alcuni docs/screenshot Andrea persi. Recoverable da commit Andrea precedente se serve.
3. L2 template router non triggerato in 5 probe iter 1 ma esiste ancora bug (visto stamane probe 1+2+5 catastrofico).
4. Plurale "Ragazzi," NON forzato in prod = parte di Andrea decisione 2026-05-09. Possibile conflict vs iter 21 mandate. Andrea ratify required.
5. RAG metadata NULL iter 14 backfill ancora pending — anche con LIVE_CHAT_RAG_BYPASS removed, citazioni Vol/pag verbatim limitate finché backfill non shippato.
6. Build NOT run iter 1 — deferred iter 2 entrance pre-commit gate.
