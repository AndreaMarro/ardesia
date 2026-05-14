# Ralph Loop Iter 2 Close → Iter 3 Handoff

**Data**: 2026-05-10 ~04:15 GMT+2
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Commit**: `347b9397` (13 file, +1585 / -122)
**Pre-commit**: PASS vitest 13936 PASS / 0 fail
**Push origin**: NOT done (Andrea OK gate)
**Deploy**: NOT done (Andrea OK gate)

## Iter 2 deliverables

### Code (4 fix ortogonali + 1 test infra)

1. **A1** `clawbot-template-router.ts:121` threshold 2→999. Bug L2 wrong-fire prod (Vol.2 multimetro → celebrate-end-volume) eliminato.

2. **A2** `unlim-ai-profiles.ts:382-388` Pixtral gate `mode === 'vision' && hasImages`. Bug allucinazione `images:[]` empty eliminato.

3. **A3** `operational-response.ts:288` direct-operational skip per knowledge queries (cosa fa, spiegami, descrivi, definisci, come funziona, cos'è). Bug "Cosa fa pinMode" → "apre editor" eliminato.

4. **A6** `unlim-chat/index.ts:285-322` LIVE_CHAT_RAG_BYPASS removed + `hybridRetrieve` restore gated by classifier topK 2-3 (chit_chat skip). Defensive try/catch fall-through.

5. **vitest mock** `vitest.config.js` + `tests/mocks/virtual-pwa-register.js` per UpdatePrompt.jsx (Andrea iter 38 stash). Fix 1 fail wakeWord-integration.

### Audit (sub-agent dispatch)

6. **A5 TRES JOLIE alignment** `docs/audits/2026-05-10-tres-jolie-vs-software-alignment.md`:
   - 11 cap teorici volumi NON nel software (Vol1 cap.1-5, Vol2 cap.1-2, Vol3 cap.1-4)
   - system-prompt.ts:171,193 cita "Vol.1 cap.2" (Ohm) e "Vol.1 cap.4" (breadboard) — capitoli inesistenti
   - Vol2 Cap.11 "I diodi" (p.103) saltato (4 esperimenti PDF, 0 file)
   - `volume-references.js:858` Cap.12 V2 mappato bookPage:103 ma PDF dice p.109 (= Cap.11)
   - `volume-references.js:879` Cap.5 V3 titolo sbagliato vs ODT
   - Vol3 manca PDF, solo ODT
   - 3 esperimenti `v3-extra-*` (lcd-hello, servo-sweep, simon) non nei volumi → Morfismo Sense 2 violazione
   - `UNLIM_VOLUME_2_KNOWLEDGE_PACK:101` cita "Relè" come capitolo autonomo: non esiste PDF
   - V2/V3 pack non numerano capitoli (incoerenza interna)

### Bench fixture extension

7. **R5 fixture 50→60 prompts** `scripts/bench/r5-fixture.jsonl`:
   - r5-051 code injection (`[AZIONE:dropTable]`) — security rejection
   - r5-052 off-topic ("come si fa pizza") — redirect
   - r5-053 safety high-voltage ("toccare 220V") — refuse + warn
   - r5-054 ambiguous ("quella cosa lì") — clarify
   - r5-055 multilingual mix EN/IT
   - r5-056 unicode unit (Ω vs ohm)
   - r5-057 volume confusion mid-experiment
   - r5-058 plurale femminile ("Ragazze")
   - r5-059 whitespace empty input
   - r5-060 focus drift emotional chitchat

## CoV iter 2

- vitest **13936 PASS / 0 fail / 15 skip / 17 todo / 13968 totali / 307 file PASS / 2 skip**
- vs iter 1 baseline 13927 = **+9 net** (0 regressioni reali, 1 wakeWord pre-existing flake fixato)
- Build NOT run (defer iter 3 entrance gate, ~14min heavy)

## Iter 3 atomic plan

### Andrea actions (5-10 min, deploy gate)

- **B0.1** Andrea OK push origin: `git push -u origin feat/unlim-parallel-agent-deploy-2026-05-10`
- **B0.2** Andrea PR create OR direct merge to main (decisione)
- **B0.3** Andrea deploy unlim-chat: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
- **B0.4** Andrea set secret: `npx supabase secrets set ENABLE_ONNISCENZA=true --linked`
- **B0.5** Andrea decisione su 173 file uncommitted Andrea iter 38+ wip (decide commit separato OR merge in feat branch)

### Iter 3 code (post deploy)

- **B1** Live prod 7-probe re-run + categorize residual bugs
- **B2** R5 50-prompt prod bench post-deploy `node scripts/bench/run-sprint-r5-stress.mjs --target prod` — gate ≥85% PZ V3 PASS
- **B3** R5 60-prompt edge cases bench (10 nuovi non-triviali + 50 originali) — gate ≥85%
- **B4** Build PASS verification (~14min) — pre-commit gate iter 4
- **B5** Volume references fix:
  - `src/data/volume-references.js:858` Vol2 Cap.12 bookPage 103→109
  - `src/data/volume-references.js:879` Vol3 Cap.5 titolo correzione
  - `system-prompt.ts:171,193` rimuovere refs Vol.1 cap.2/cap.4 inesistenti OR aggiungere lesson-paths corrispondenti
- **B6** UNLIM_VOLUME_2/3_KNOWLEDGE_PACK numerare capitoli (allineamento V1)
- **B7** Decisione 3 esperimenti `v3-extra-*` (rimuovere lesson-paths OR aggiungere a volumi cartacei prossimo edition)

### Iter 4+ stretched

- **C1** Streaming SSE Edge Function (Vercel AI SDK pattern, first-token <500ms)
- **C2** PostHog LLM telemetry wire-up (`/posthog:llm-analytics` plugin)
- **C3** Mistral embeddings re-ingest (mistral-embed text + codestral-embed code)
- **C4** RAG metadata NULL backfill iter 14 (chapter/page/section_title)
- **C5** R7 200-prompt INTENT canonical bench post Mistral function calling deploy
- **C6** Canary rollout 5%→25%→100%
- **C7** Render decommission decision post-30-day stable

## Stato repo iter 2 close

- Branch `feat/unlim-parallel-agent-deploy-2026-05-10` ahead of main: 1 commit (`347b9397`)
- Working tree: 76 file modificati + 90 untracked (lavoro Andrea iter 38+ wip — NOT committato da me)
- Stash list: 35 stash items, stash@{0} dropped (era iter 1 backup)
- Tag: `backup/opzione-a-rejected-20260510-iter1`

## Honesty caveats iter 2

1. **Build NOT run** — pre-commit hook usa solo vitest baseline check, non build. Andrea decide build manual prima push.
2. **Live RAG retrieval restored ma RAG metadata NULL ancora pending iter 14 backfill** — citazioni Vol/pag verbatim limitate al testo chunk, no anchoring page-precise.
3. **Lavoro Andrea iter 38+ uncommitted** rimane fuori dal mio commit per evitare overwrite intent. Andrea decide separato.
4. **TRES JOLIE audit findings = data bugs**, non logica. Richiedono fix dati (lesson-paths JSON + volume-references.js + knowledge pack textual) iter 3 P0.
5. **R5 60-prompt fixture** = solo aggiunta seed JSON, NON eseguita live (richiede deploy + Andrea credenziali env).
6. **vitest mock virtual:pwa-register** è stub no-op. Coverage UpdatePrompt funzionalità SW reale = 0%. Aggiungere E2E Playwright iter 4+ se serve.
7. **Pre-commit hook** ha bloccato primo tentativo commit (1 fail wakeWord). Fix mock + retry succeeded. Hook funziona — anti-regressione attiva.

## Iter 3 entry: aspetto Andrea OK

Posso procedere autonomous solo se Andrea conferma:
- (a) push origin = OK
- (b) deploy = OK + credentials available
- (c) secret ENABLE_ONNISCENZA = OK
- (d) bench R5 prod = OK (richiede SUPABASE_ANON_KEY + ELAB_API_KEY env)

Senza credenziali deploy, iter 3 può fare solo:
- B5+B6+B7 fix dati TRES JOLIE alignment (data files + tests)
- Build PASS gate locale
- Documentazione + plan iter 4

Caveman terse. NO compiacenza. ZERO claim deploy senza prove.
