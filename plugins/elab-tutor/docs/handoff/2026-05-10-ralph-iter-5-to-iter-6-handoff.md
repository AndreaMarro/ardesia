# Ralph Loop Iter 5 Close → Iter 6 Handoff

**Data**: 2026-05-10 ~19:30 GMT+2
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Commits iter 5**: `56d32518` (RAG 2s timeout fix + R5 bench evidence)
**Total branch commits ahead main**: 4
**Edge Function deployed**: v51 → v52 LIVE (Onniscenza enabled secret)
**Push origin**: DONE
**vitest**: 13936 PASS / 0 fail preserved

## Iter 5 deliverables

### Deploy

- **v51 deploy** post iter 1-4 commits (23 file uploaded incluso unlim-ai-profiles.ts NEW + operational-response.ts NEW + unlim-chat/index.ts modified + tutti _shared)
- **ENABLE_ONNISCENZA secret** verified set on prod project `euqpdueopmlllqjmqnyb` (matches `true` hash)
- **v52 deploy** post B1 RAG timeout fix
- Branch pushed origin (pre-push 13936 PASS)

### Bug fixes confermati LIVE prod

| # | Bug | Pre-deploy | Post v52 |
|---|---|---|---|
| 1 | L2 template wrong-fire (Vol.2 multimetro → celebrate-end-volume) | catastrofico | flash volume2_fast 1.98s con "(Vol.2, pag.18)" |
| 2 | Vision empty `images:[]` allucinazione "Vedo LED rosso" | 100% riprod | flash-lite general_purpose_compact 2.59s NO Pixtral |
| 3 | direct-operational pinMode "apre editor" no answer | direct-op | flash-lite volume3_fast 8.20s spiega + analogia "cancello" |
| 4 | Knowledge Vol/pag verbatim missing | static pack | LIVE RAG retrieval Vol.X pag.Y citations |
| 5 | RAG metadata NULL | invariato | invariato (iter 14 backfill ancora pending) |
| 6 | P4 503 RAG timeout overflow | 503 11.84s | 5.03s con cit Vol.3 pag.82 |
| 7 | Plurale "Ragazzi," opener forced | NO | NO (Andrea decision 2026-05-09) |

### R5 60-prompt PROD bench v52 objective

- **Score: 80.70% WARN** (target 85% soft, 90% hard — gate NOT MET)
- **Latency avg: 2793ms** (vs iter 32 baseline 6800ms = **-59% lift**)
- **Successful: 59/60** (1 transient failure tolerated, threshold 8 max)
- **R5 fixture**: 60 prompts (50 originali + 10 iter 2 edge cases)

Failure breakdown HIGH:
- `plurale_ragazzi` HIGH FAIL: opener "Ragazzi," not forced — Andrea decision 2026-05-09 (naturale tutor vivo). Conflict vs PRINCIPIO ZERO V3 invariant Andrea iter 21 mandate. **Andrea ratify queue iter 6 voce 1**.
- `citation_vol_pag` MEDIUM FAIL: Vol/pag verbatim missing — RAG metadata NULL gap iter 14 backfill (chapter/page/section_title 100% NULL post-Voyage ingest). **Iter 6 P0 atom B-NEW backfill**.

### Stack Edge Function v52 LIVE

```
unlim-chat v52
├── classifyPrompt (regex 6 categorie)
├── hybridRetrieve(safeMessage, topK 2-3) [Promise.race 2s timeout]
├── aggregateOnniscenza 7-layer [opt-in ENABLE_ONNISCENZA=true ON]
├── selectUnlimAiProfile (10 profili)
├── buildSystemPrompt (BASE v3.1 + capitolo + circuit + RAG context)
├── direct-operational (skip se knowledge query)
├── L2 template router DISABLED (threshold 999)
├── callLLM Promise.race 8s [Mistral 70/20/10 + Gemini fallback]
├── INTENT parser surface-to-browser [intents_parsed array]
├── PZ V3 validator post-LLM
└── capWordsPreservingControlTags (max ~120 parole)
```

## Iter 6 atomic plan

### Andrea actions (5-15 min)

- **C1** Andrea ratify plurale "Ragazzi," opener policy:
  - **Path α** (PZ V3 invariant iter 21 mandate): re-add forced "Ragazzi," in BASE_PROMPT v3.2 → R5 plurale_ragazzi 100%
  - **Path β** (decision 2026-05-09 naturale): documenta in CLAUDE.md exception, cap R5 score 80% accept WARN
  - Decisione iter 6 entrance
- **C2** PR create OR direct merge feat/unlim-parallel-agent-deploy → main
- **C3** Vercel deploy verify prod frontend (post commit `56d32518` push)

### Iter 6 code (no Andrea blocked)

- **D1** RAG metadata backfill iter 14: script `scripts/backfill/rag-metadata-backfill.mjs` (NUOVO o riusare se esistente). 1881 rag_chunks → fuzzy match Vol/pag da PDF/ODT. Costo: 0 (offline batch). Effetto: citation_vol_pag MEDIUM → PASS post-deploy.
- **D2** Path leak check approfondito: P7 v52 emit `[ACTION:openeditor]` (English uppercase) invece `[AZIONE:...]` italiano. INTENT parser whitelist case-sensitive — verifica + fix se necessario.
- **D3** R6 100-prompt fixture build (Tester author 2-3h)
- **D4** R7 200-prompt INTENT canonical bench (richiede Mistral function calling deploy ENABLE_INTENT_JSON_SCHEMA=true)
- **D5** Streaming SSE design + scaffold (Vercel AI SDK pattern, first-token <500ms target)

### Iter 7+ (post Andrea)

- **E1** PR merge to main
- **E2** Canary rollout 5%→25%→100% (Mistral function calling)
- **E3** Lighthouse perf optim ChatbotOnly + EasterModal (perf 26+23 FAIL → ≥90)
- **E4** Linguaggio codemod 200 violations singolare→plurale (Andrea iter 21 mandate)
- **E5** 94 esperimenti audit Playwright UNO PER UNO
- **E6** Vol3 narrative refactor (ADR-027 Davide co-author)
- **E7** Render decommission decision post-30-day stable

## Honest claims iter 5

| Claim | Verified |
|---|---|
| Branch pushed origin | ✅ origin/feat/unlim-parallel-agent-deploy-2026-05-10 |
| Edge Function v52 deployed | ✅ supabase deploy success |
| 4/7 prod probes fix | ✅ live verified |
| RAG live retrieval restored | ✅ probe Vol/pag citations present |
| P4 503 timeout fix | ✅ post v52 5.03s OK |
| Path leak `docs/unlim-wiki/` fixed | ✅ post v52 P7 no leak |
| R5 score 80.70% WARN measured | ✅ official scorer 60 prompts |
| Latency -59% vs iter 32 | ✅ 2793ms vs 6800ms |
| ZERO regressioni vitest | ✅ 13936 PASS preserved |

| NOT achieved iter 5 |
|---|
| R5 ≥85% soft gate | 80.70% (FAIL plurale + Vol/pag verbatim) |
| RAG metadata backfill | iter 14 still pending → iter 6 D1 |
| Format AZIONE drift fix | P7 ACTION uppercase EN ancora presente |
| Streaming SSE | iter 6 D5 deferred |
| PR merge to main | Andrea decisione |

## Iter 6 entrance

Atomi pronti C1+C2+C3 (Andrea) + D1+D2 (autonomous code).

R5 80.70% baseline. Target iter 6: ≥85% post D1 backfill + Andrea C1 plurale decision.
