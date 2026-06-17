# Ralph Loop Iter 3 Close → Iter 4 Handoff (Final iter without deploy)

**Data**: 2026-05-10 ~04:34 GMT+2
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Commits**: 2 (`347b9397` + `c77fd07d`)
**vitest**: 13936 PASS / 0 fail / 15 skip / 17 todo / 13968 totali
**build**: PASS 27s (31 precache entries, max chunk 1.91 MB react-pdf)
**Push origin**: NOT done (Andrea OK gate)
**Deploy**: NOT done (Andrea OK gate)
**Bench R5 prod**: NOT run (Andrea credentials gate)

## Ralph loop deliverables totali (iter 1-3)

### Commit 1: `347b9397` (iter 2)
- A1 L2 template router threshold 999 disable (clawbot-template-router.ts)
- A2 Pixtral hasImages gate (unlim-ai-profiles.ts:382-388)
- A3 direct-operational knowledge query bypass (operational-response.ts)
- A6 LIVE_CHAT_RAG_BYPASS removal + hybridRetrieve restore (unlim-chat/index.ts)
- vitest mock virtual:pwa-register
- TRES JOLIE alignment audit doc
- R5 fixture 50→60 prompts edge cases
- Andrea parallel-agent stash NEW files (unlim-ai-profiles.ts, operational-response.ts)
- 11 file modificati, +1585 / -122

### Commit 2: `c77fd07d` (iter 3)
- B5 Vol3 Cap.5 title fix ("Il nostro primo programma (Blink)")
- B6 Vol2/Vol3 KNOWLEDGE_PACK numerare capitoli (allineamento V1)
- system-prompt.ts BASE_PROMPT few-shot remove forced "Vol.1 cap.2/cap.4" stale refs
- 3 file, +187 / -28

## CoV finale

- **vitest 13936 PASS / 0 fail / 13968 totali** (vs branch base main 13473 = +463 net Andrea + miei tests)
- **build PASS 27s** (PWA generateSW 31 precache OK)
- ZERO regressioni reali
- Pre-commit hook hooked entrambi i commit

## Bug TRES JOLIE NON FIXATI (Andrea+Tea coord required iter 4)

1. **v2-cap12-esp1 bookPage discrepanza**: TRES JOLIE PDF dice Cap.12 inizia p.109 (p.103 = Cap.11 "Diodi"). Tea narrative_metadata_94.json (`/elab-fumetti-consegna-v2/`) ha bookPage:103. Test `teaFumettiPackageAudit` enforce equality. Reverted mio fix per non rompere test. **Andrea+Tea decide fonte verità**.

2. **3 esperimenti `v3-extra-*`** (lcd-hello, servo-sweep, simon) NON nei volumi cartacei. Andrea decision: rimuovi lesson-paths OR aggiungi a volumi prossima edizione. **Morfismo Sense 2 violazione finché orfani**.

3. **Vol3 PDF mancante** (solo ODT). Tea/Andrea verify ground truth Vol3 cap.8-9 (incompleto in ODT).

4. **11 capitoli teorici Vol1+2+3 NON nel software** (cap.1-5 V1, cap.1-2 V2, cap.1-4 V3). Decisione: aggiungere lesson-paths teorici OR documentare scope (software = pratica, libro = teoria + pratica).

## Iter 4 atomic plan (post Andrea OK)

### Andrea actions (5-10 min)

- **C0.1** `git push -u origin feat/unlim-parallel-agent-deploy-2026-05-10`
- **C0.2** PR create OR direct merge (decisione)
- **C0.3** Deploy unlim-chat: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
- **C0.4** Set secret: `npx supabase secrets set ENABLE_ONNISCENZA=true --linked`
- **C0.5** Decisione 173 file Andrea iter 38+ wip: commit separato OR merge in feat branch
- **C0.6** Decisione TRES JOLIE 4 bug critici (1-4 sopra)

### Iter 4 code (post deploy)

- **C1** Live prod 7-probe re-run + bench R5 50-prompt + R5 60-prompt edge cases
- **C2** Streaming SSE Edge Function design + scaffold (Vercel AI SDK pattern)
- **C3** PostHog LLM telemetry plugin wire-up
- **C4** Mistral embeddings re-ingest (mistral-embed text + codestral-embed code)
- **C5** RAG metadata NULL backfill iter 14 (chapter/page/section_title)
- **C6** R7 200-prompt INTENT canonical bench
- **C7** Canary rollout 5%→25%→100%
- **C8** Render decommission decision post-30-day

## Stato repo iter 3 close

- Branch: `feat/unlim-parallel-agent-deploy-2026-05-10` 2 commit ahead main
- Working tree: 73 mod + 90 untracked (Andrea iter 38+ wip non committato da me)
- 1 stash totali (no stash@{0})
- Tag: `backup/opzione-a-rejected-20260510-iter1`
- Build artifacts: `dist/` 31 precache PWA OK

## Ralph loop summary onesto

**Cosa ho fatto in 4 iter**:
1. Audit 5 sub-agent paralleli + lettura 7 doc architettura + audit prod 5+7 probe
2. Annullato OPZIONE A (decisione errata mia confessata)
3. Restore lavoro Andrea 2026-05-09 stash (200/230/30 PASS preservati)
4. 4 fix ortogonali (L2 router, vision gate, direct-op knowledge, RAG restore)
5. 2 fix dati TRES JOLIE alignment (Vol3 cap.5 title, Vol2/3 pack numbering)
6. R5 fixture 50→60 edge cases non-triviali
7. vitest mock vite-pwa virtual module (sblocca wakeWord test)
8. 2 commit clean + pre-commit hook PASS entrambi
9. Build PASS verify iter 4

**Cosa NON ho fatto**:
- NO push origin (Andrea OK gate)
- NO deploy Edge Function (Andrea OK + credentials)
- NO secret ENABLE_ONNISCENZA (Andrea action)
- NO R5 prod bench (richiede deploy)
- NO commit lavoro Andrea iter 38+ (rispetto autonomy)
- NO fix Tea/Andrea-coord required (4 bug TRES JOLIE)
- NO streaming SSE / PostHog / Mistral re-ingest (iter 5+ post deploy)

**Honest score**: NON posso dichiarare "benchmark perfetti" senza prod bench live. Iter 1-3 hanno preparato il terreno (code + tests + data fix + audit) ma il claim "qualità prod ≥85%" richiede:
1. Andrea deploy
2. R5 + R6 + R7 bench prod
3. Live prod 7-probe re-run

Ralph loop deve fermarsi finché Andrea non sblocca deploy gate OR fornisce credenziali env per bench staging.

**Iter 4 entrance soft block**: il loop riprenderà solo se Andrea conferma o fornisce gate.
