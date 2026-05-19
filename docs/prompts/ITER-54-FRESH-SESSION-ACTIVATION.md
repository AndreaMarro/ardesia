# ITER 54 — Fresh Session Activation (NO regressioni + Tea + Arco narrativo + Parità triplet)

**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
**Carry-over**: iter 46-53 closed (Edge v80 LIVE + Vercel `index-CDu63a_0.js` LIVE prod stable)
**Skill applied to this prompt**: `/llm-application-dev:prompt-optimize` (meta-ottimizzazione strutturale)

---

## 0. STRINGA DI ATTIVAZIONE (paste-ready)

Copy-paste questo blocco intero come primo messaggio sessione iter 54 fresca:

```
Apri Claude Code in /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder branch feat/iter-41-sprint-u-cycle-2-real-user-fix.

ITER 54 mandate Andrea (priorità ordine MANDATORY):

1. NO REGRESSIONI — pre-flight CoV (vitest 14342+ baseline preservato + build PASS + Edge smoke prod Ragazzi+Vol/pag + Vercel index-CDu63a_0.js LIVE) MANDATORIO entrance gate. Score 6.5/10 iter 53 close (honest). NON toccare Edge v80 o Vercel bundle senza Andrea ratify esplicito.

2. PARTI DAL LAVORO DI TEA. Leggi PRIMA di tutto i documenti in /Users/andreamarro/VOLUME 3/TEA/ + /Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/. Priority A (Nuovo lavoro tea iter 53):
   - standard_experiment_schema.json (16 KB) — schema CANONICO unificato 94 esperimenti
   - narrative_map.json (56 KB) — grafo arco narrativo 94 nodi + edges cliffhanger
   - narrative_metadata_94.json (98 KB) — metadati per-esperimento + cliffhanger
   - cliffhanger_table.json (30 KB) — transizioni inter-esperimento
   - punto2_audit_dettagliato.json (41 KB) — gap report Tea
   - punto2_mapping_narrativo.pdf (104 KB) — audit mapping volumi→software
   - album_studente_spec.pdf + spec.html + mockup.html — UX album sessione
   - bibbia_stilistica.pdf (65 KB) — tone-of-voice canonico ELAB
   - standard_experiment_v1-cap6-esp1.json + v3-cap7-mini.json — campioni schema applicato
   - fumetto_schema.json + fumetto_payload_esempio.json + fumetto_pilota.pdf
   - mascotte_unlim_canonica.md + mascotte_unlim.svg
   Priority B (Tea iter 13 context): analisi_complessita_esperimenti_2026-04-13.pdf + riepilogo_correzioni_github_2026-04-13.pdf + schema_ux_semplificato_2026-04-13.docx + 10_idee_miglioramento_2026-04-13.docx.

3. INVOCA /mem-search per recuperare ELAB 446k tokens claude-mem history. Query mirate:
   - search(query="narrative arc 92 esperimenti audit Tea iter 53", limit=20, project="elab-builder")
   - search(query="Morfismo Sense 2 triplet volumi kit elabtutor parità", limit=20)
   - search(query="lesson-paths capitoli volumi ADR-027 narrative refactor Davide", limit=20)
   - search(query="Andrea iter 21 mandate 92 esperimenti Playwright audit broken", limit=20)
   - search(query="DrawingOverlay architecture redesign 3 agents iter 53", limit=15)
   - search(query="linguaggio plurale Ragazzi singolare violations 200 codemod", limit=15)
   - search(query="UNLIM Onniscenza Vol mismatch citation hallucinated", limit=15)
   - search(query="Vol3 ground truth lesson-paths 92 to 140 refactor", limit=10)
   Poi timeline(anchor=<top_id>, depth_before=3, depth_after=3). Poi get_observations(ids=[...]) batch fetch.

4. MANDATO RICORRENTE ANDREA (ripetuto MOLTE VOLTE, P0 ASSOLUTO non negoziabile):
   GLI ESPERIMENTI SONO SU UN ARCO NARRATIVO CONTINUO come nei volumi fisici.
   NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor).
   DEVE ESSERCI PARITÀ TRIPLET: Volumi cartacei (Davide) ↔ Kit fisici Omaric ↔ elabtutor software.
   Stessa narrativa. Stesso ordine. Stessi nomi. Stesse pagine. Stesse cliffhanger transitions inter-esperimento.
   Questo è Morfismo Sense 2 — il differenziatore competitivo NON copiabile da LLM-generated copycat 2026+.
   Tea narrative_map + standard_schema sono il blueprint canonico per chiudere questo gap iter 54.

5. INVOCA /llm-application-dev:prompt-optimize sul system-prompt UNLIM v3.1→v3.2 + su ogni sub-task prompt LLM prima exec. Meta-ottimizzazione strutturale: clarity, role, constraints, examples, anti-pattern callouts.

6. Skill chain mandatory (in ordine invocation):
   /mem-search → /llm-application-dev:prompt-optimize → /ultrathink → /code-architect →
   /accessibility-compliance:wcag-audit-patterns → /architecture-patterns →
   /comp-analysis → /code-refactoring:tech-debt → /codebase-cleanup:tech-debt →
   /systematic-debugging → /document-sync → /quality-audit

7. Connettori MCP obbligatori (Andrea iter 41 mandate "USA TUTTI"):
   - Live: Claude_in_Chrome MCP (browser_batch + javascript_tool + read_network_requests)
   - Browser: Control_Chrome MCP (direct tab manipulation)
   - Mac: Macos MCP + computer-use MCP (screenshots Vercel/Supabase dashboard)
   - Code: serena (symbol-level) + context7 (live docs) + claude-mem
   - Codex CLI Pattern C: ~/.npm-global/bin/codex exec --skip-git-repo-check --sandbox workspace-write per cross-check verify pre-deploy (file:line citations, regex sanity, dead code) — NON per prose synthesis (anti-pattern iter 41).

8. Workflow Pattern S r3 (race-cond fix VALIDATED 18 iter consecutive iter 5+6+8+11+12+19+36+37+38+43+46+47+48+49+50+51+52+53):
   planner-opus → architect+gen-app+gen-test+webdesigner Phase 1 PARALLEL rigid file ownership →
   scribe Phase 2 SEQUENTIAL post 4/4 completion msgs filesystem barrier automa/team-state/messages/.

9. Anti-inflation G45 cap (MANDATORY): NO auto-score >7.5 senza Opus indipendente review (multi-reviewer-patterns). NO claim "fixed" senza verify prod Chrome MCP screenshot evidence. NO push main, NO --no-verify, NO bypass pre-push hook (FERREO anti-regressione). Test count cite SOLO da vitest output appena visto. Score cite SOLO da node scripts/benchmark.cjs --write.

10. Goal iter 54 5 EPIC P0:
    EPIC 1 — Narrative arc refactor (Tea standard_schema adoption 94 esperimenti) — Andrea CORE mandate
    EPIC 2 — DrawingOverlay redesign 5 atoms iter 53 cascade
    EPIC 3 — 5 real-user bugs LIVE prod (Onniscenza Vol mismatch + citation hallucinated + pre-LLM eliminate + LLM action gate + TTS Voxtral frontend)
    EPIC 4 — Codex carryover 5H+3M iter 51-52 findings
    EPIC 5 — Iter 21 mandate 32-iter pending (audit-only + dispatch Mac Mini post Tailscale reactivation)

Inizia: (a) Read Tea 12+ docs Priority A+B, (b) /mem-search 8 query, (c) pre-flight CoV vitest+build+Edge+Vercel smoke, (d) piano 5 EPIC con file ownership matrix planner-opus, (e) execute Pattern S r3.
```

---

## 1. NO REGRESSIONI — Pre-flight CoV (entrance gate MANDATORIO)

**Prima di QUALSIASI modifica codice iter 54**:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

# 1. Verify branch + commit base
git status --short                                  # working tree clean expected
git log --oneline -5                                # HEAD = 472818bc iter 53 close

# 2. Vitest baseline pre-iter-54
npx vitest run --reporter=default 2>&1 | tail -20   # MUST: 14342+ PASS (baseline iter 53)
cat automa/baseline-tests.txt                       # sync truth source

# 3. Build full pre-iter-54
npm run build 2>&1 | tail -10                       # MUST: PASS (~10-14 min)

# 4. Edge Function smoke prod LIVE verify
ANON=$(grep VITE_SUPABASE_ANON_KEY /tmp/vercel.env | cut -d= -f2 | tr -d '"')
ELAB=$(grep VITE_ELAB_API_KEY /tmp/vercel.env | cut -d= -f2 | tr -d '"')
curl -sS -X POST 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ANON" \
  -H "x-elab-api-key: $ELAB" \
  -d '{"message":"Ciao Ragazzi","experimentId":"v1-cap6-esp1","studentId":"smoke-iter54"}' \
  | jq '{text, source}' | head -10
# MUST: text starts with "Ragazzi," + source contains "vertex-gemini-2.5-flash"

# 5. Vercel smoke prod LIVE verify
curl -sI https://www.elabtutor.school 2>&1 | head -3                  # MUST: HTTP 200
curl -s https://www.elabtutor.school | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1
# MUST: index-CDu63a_0.js (iter 51 bundle stable prod)
```

**Acceptance gate iter 54 entrance**:
- vitest ≥14342 PASS (no -1 regression accepted)
- build PASS no errors
- Edge smoke `Ragazzi,` + `vertex-gemini-2.5-flash-lite` source verified
- Vercel `index-CDu63a_0.js` prod stable

**Se UNO FALLISCE → STOP, indaga root cause prima di proseguire. NO `--no-verify` bypass.**

---

## 2. FASE 0 — Tea Foundation Reading (P0 ASSOLUTO before code)

Andrea direttiva: "Partire dal lavoro di Tea". Tea iter 53 ha consegnato struttura ARCO NARRATIVO blueprint canonico.

**Read order obbligatorio** (use `Read` tool, NOT Bash `cat`):

### Tea iter 53 Nuovo lavoro (priority A — blueprint)

1. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_schema.json`** (16 KB)
   - Schema CANONICO unificato 94 esperimenti
   - Fields attesi: `id`, `title`, `capitolo_ref`, `vol_ref`, `pag_start`, `pag_end`, `narrative_arc_index`, `cliffhanger_prev`, `cliffhanger_next`, `components_kit_omaric_id`, `prerequisite_experiment_ids`, `learning_objectives`, `fumetto_panels`, `mascotte_state_initial`
   - ADOTTARE come single source of truth migration target `src/data/experiments-vN.js`

2. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json`** (56 KB)
   - Grafo arco narrativo 94 nodi + edges cliffhanger
   - Identifica catene narrative coerenti (esempio Vol1 cap6: LED → resistenza → potenziometro → semaforo → ...)
   - Cross-link a kit Omaric componenti per-capitolo

3. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_metadata_94.json`** (98 KB)
   - Metadati per-esperimento: hook narrativo, "ricorda che..." callback, "nel prossimo episodio..." cliffhanger
   - Tone-of-voice canonico per fase narrativa

4. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json`** (30 KB)
   - Tabella transizioni inter-esperimento (`esp_N.cliffhanger_next == esp_M.cliffhanger_prev`)
   - Verifica coerenza grafo (no orfani, no cicli, no salti narrativi)

5. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/punto2_audit_dettagliato.json`** (41 KB)
   - Gap report Tea: quali dei 94 esperimenti attuali `src/data/experiments-vN.js` sono ALLINEATI vs SCOLLEGATI vs MANCANTI dal grafo narrativo libro fisico
   - Iter 54 P0 fix list (EPIC 1 atoms input)

6. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/punto2_mapping_narrativo.pdf`** (104 KB)
   - Audit Tea PDF: per-esperimento checklist morfismo Sense 2 (titolo libro = titolo software? pag = pag? ordine = ordine?)

7. **`/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_v1-cap6-esp1.json`** + **`v3-cap7-mini.json`**
   - Campioni schema applicato — usare come template migration

### Tea iter 53 Album studente (priority B — UX)

8. **`album_studente_spec.pdf`** (54 KB) + **`album_studente_mockup.html`** (38 KB) + **`album_studente_spec.html`** (28 KB)
   - UX album sessione studente Tea design
   - Defer integration iter 55+ post EPIC 1 narrative arc lock

9. **`bibbia_stilistica.pdf`** (65 KB)
   - Tone-of-voice canonico ELAB
   - Use as system-prompt v3.2 reference (Fase 2 /llm-application-dev:prompt-optimize input)

10. **`mascotte_unlim_canonica.md`** + **`mascotte_unlim.svg`**
    - Mascotte stati canonici Morfismo Sense 1.5

### Tea iter 53 Fumetto (priority C — defer iter 55)

11. **`fumetto_schema.json`** + **`fumetto_payload_esempio.json`** + **`fumetto_pilota.pdf`**
    - Fumetto report MVP merge candidate iter 55+

### Tea iter 13 doc storici (priority C — context)

12. **`/Users/andreamarro/VOLUME 3/TEA/analisi_complessita_esperimenti_2026-04-13.pdf`** (303 KB)
    - Tea 92 esperimenti analysis (MOSFET problematico + 4 capstone)

13. **`/Users/andreamarro/VOLUME 3/TEA/riepilogo_correzioni_github_2026-04-13.pdf`** (215 KB)
    - PR #73 merged history

14. **`/Users/andreamarro/VOLUME 3/TEA/schema_ux_semplificato_2026-04-13.docx`** + **`/Users/andreamarro/VOLUME 3/TEA/10_idee_miglioramento_2026-04-13.docx`**
    - UX context iter 7

**Output Fase 0**: `docs/audits/2026-05-14-iter-54-tea-foundation-read.md` con:
- Sintesi 94 esperimenti narrative_map (catene narrative identificate)
- Gap delta (current `src/data/experiments-vN.js` vs Tea `standard_schema`)
- Migration plan (numero file da toccare + LOC delta atteso + atomicità)
- Cross-reference con ADR-027 Vol3 narrative refactor (Davide co-author iter 33+ deferred)

---

## 3. FASE 1 — /mem-search ELAB 446k tokens

Invoke skill `/mem-search` (plugin claude-mem) con query mirate (vedi stringa attivazione §3 sopra).

**Output Fase 1**: `docs/audits/2026-05-14-iter-54-mem-context.md` con:
- Top 10 observation IDs prior context iter 1-53
- Decisioni precedenti pertinenti (ADR-027 Vol3 refactor, ADR-028 §14 surface-to-browser, iter 21 mandates 32-iter pending)
- Anti-pattern ricorrenti identificati (race-cond, score inflation, dichiarazioni FIXED senza verify Chrome MCP)

---

## 4. FASE 2 — /llm-application-dev:prompt-optimize (meta-skill)

Andrea direttiva: invocare `/llm-application-dev:prompt-optimize` skill.

**Application primaria**: ottimizzare system prompt UNLIM v3.1 → v3.2 incorporando Tea bibbia_stilistica + arco narrativo callback.

**File target**:
- `supabase/functions/_shared/system-prompt.ts` (current BASE_PROMPT v3.1)
- `supabase/functions/_shared/capitoli-loader.ts` (current `buildCapitoloPromptFragment` iter 7)
- `supabase/functions/_shared/onniscenza-classifier.ts` (current 6 categorie regex)

**Optimization vectors**:

1. **Narrative continuity injection**: post-classifier, prima di LLM call, inject blocco:
   ```
   ARCO NARRATIVO:
   - Esperimento precedente: <prev.title> (Vol.X pag.Y)
   - Cliffhanger episodio precedente: <cliffhanger_prev>
   - In questo episodio i ragazzi devono: <hook>
   - Prossimo episodio: <next.title> (preview hook)
   ```
   Dati da `narrative_metadata_94.json` per-experimentId lookup.

2. **Vol/pag verbatim enforcement**: passa `pag_start` + `pag_end` dallo schema canonico Tea (NOT inferenza LLM). Post-LLM validator strict range check.

3. **Plurale "Ragazzi" + few-shot 5→8**: aggiungi 3 esempi narrativa-aware:
   - Esempio cliffhanger callback: "Ragazzi, ricordate l'esperimento del LED? Oggi aggiungiamo la resistenza per..."
   - Esempio prerequisite reference: "Ragazzi, avete già montato il pulsante. Ora vediamo come..."
   - Esempio next-hook tease: "...e nel prossimo esperimento programmiamo il semaforo intero!"

4. **Anti-broken-card pattern**: explicit instruction "MAI presentare esperimento come isolato; collega SEMPRE all'esperimento precedente e prepara il prossimo".

**Output Fase 2**: `docs/adrs/ADR-034-system-prompt-v3.2-narrative-aware.md` PROPOSED (defer ratify Andrea iter 54 close, deploy iter 55+ post Tea schema adoption EPIC 1).

---

## 5. FASE 3 — 5 EPIC iter 54 P0 (file ownership matrix Pattern S r3)

### EPIC 1 — Narrative Arc Refactor (Andrea CORE mandate)

**Goal**: `src/data/experiments-vN.js` migrate verso Tea `standard_experiment_schema.json`. 94 esperimenti continuous arc.

**Atoms**:

- **A1.1**: Generator script `scripts/migrate/tea-schema-adopt.mjs` (NEW ~250 LOC) — input Tea `narrative_map.json` + `narrative_metadata_94.json`, output `src/data/experiments-v{1,2,3}-narrative.js` con campi schema canonico
- **A1.2**: Update `src/data/lesson-groups.js` (250 LOC) — 27 Lezioni recompute per `narrative_arc_index` (NOT capitolo flat)
- **A1.3**: Update `src/data/volume-references.js` (1280 LOC) — Vol/pag verbatim dal Tea schema (NOT inferenza)
- **A1.4**: Update `src/data/lesson-paths/*.json` (94 files) — add `cliffhanger_prev`/`next` + `prerequisite_ids`
- **A1.5**: Integration test `tests/integration/narrative-arc-continuity.test.js` (NEW ~150 LOC) — verifica grafo no orfani no cicli + cliffhanger reciprocity

**File ownership**: agent `gen-app-1` esclusivo `src/data/**`. Zero conflict.

**Anti-regressione**: A1 step-by-step con 3x vitest CoV per atom. NO push se vitest scende.

### EPIC 2 — DrawingOverlay Architecture Redesign (iter 53 audit P0)

Execute iter 53 cascade 5 atoms documented `docs/audits/2026-05-13-iter-53-drawing-overlay-architecture-redesign.md`:

- **Atom 1**: `src/utils/strokeGeometry.js` NEW ~80 LOC
- **Atom 2**: `src/hooks/useDrawingStore.js` NEW ~120 LOC React Context
- **Atom 3**: `src/components/drawing/DrawingLayer.jsx` NEW ~250 LOC FloatingPenToolbar ≥48×48px WCAG AAA
- **Atom 4**: Mount `LavagnaShell.jsx` behind `ENABLE_GLOBAL_DRAWING_LAYER` feature flag (default false)
- **Atom 5**: VolumeViewer cleanup + DrawingOverlay shim (BREAKING — defer iter 55 after Andrea verify Atom 4)

**File ownership**: agent `gen-app-2` esclusivo `src/utils/strokeGeometry.js` + `src/hooks/useDrawingStore.js` + `src/components/drawing/**`. Zero overlap EPIC 1.

### EPIC 3 — 5 Real-User Bugs LIVE prod

1. **Onniscenza Vol mismatch** — `onniscenza-classifier.ts` `citation_vol_pag` topK:2 selects WRONG chunk per query (cap6 query returns cap8 chunk). Fix: filter retrieve by `experimentId.capitolo` first.

2. **Citation hallucinated** — LLM emits `Vol.1 pag.42` ma chunk reale è pag.38. Fix: post-LLM validator strict pag match against Tea schema `pag_start`/`pag_end` range.

3. **Pre-LLM eliminate detector** — false-positive `operational-response.ts` matches "elimina led1" anche quando user dice "non eliminare". Fix: negation regex `\b(non|mai)\s+(elimina|cancella)\b` exclude.

4. **LLM action gate inverted** — `intent-parser.ts` whitelist 12 actions includes `setComponentValue` ma frontend `intentsDispatcher.js:48` chiama `api.setComponentValue` (Andrea ratify iter 38 §14 surface-to-browser pivot). Verify cross-check.

5. **TTS Voxtral frontend wire** — Andrea screenshot "unlim non risponde parlando". Verify `src/services/api.js:783` envelope builder NON corrompe TTS endpoint call + `unlim-tts/index.ts` Voxtral primary path live.

**File ownership**: agent `gen-app-3` esclusivo `supabase/functions/_shared/onniscenza-classifier.ts` + `principio-zero-validator.ts` + `operational-response.ts` + `intent-parser.ts` + `src/services/api.js:783-820` (envelope only).

### EPIC 4 — Codex Carryover 5H + 3M (iter 51-52 findings)

5 HIGH: type safety gaps + error handling + dead imports + race-cond patches + missing eraser fix VolumeViewer (resolved EPIC 2 Atom 5 iter 55).

3 MEDIUM: stale localStorage key migration + WCAG aria-live announcer + WCAG forced-colors media query.

**File ownership**: agent `gen-test` esclusivo `tests/**` (regression coverage) + agent `webdesigner` esclusivo CSS/aria-only mods (no logic).

### EPIC 5 — Iter 21 Carryover 32-iter pending (Andrea mandate)

- **E5.1** 92 esperimenti Playwright UNO PER UNO sweep (3h scope, gate iter 54 close defer iter 55+)
- **E5.2** Linguaggio codemod 200 violations singolare→plurale Ragazzi (4h scope, defer iter 55+)
- **E5.3** Vol3 narrative refactor Davide co-author 92→140 lesson-paths (8h scope, ADR-027 ratify iter 55+)

**Iter 54 cap**: EPIC 5 audit-only + plan dispatch Mac Mini fresh (post Tailscale reactivation Andrea action). Implementation defer.

---

## 6. FASE 4 — Verify + Deploy (NO regressioni)

### Pre-commit gate (per atom EPIC 1-4):

```bash
npx vitest run                                       # MUST PASS 14342+
npm run build                                        # MUST PASS
git diff --stat                                      # review changes surgical
```

### Pre-deploy gate (per Edge Function changes):

```bash
# Codex Pattern C cross-check
~/.npm-global/bin/codex exec --skip-git-repo-check --sandbox workspace-write \
  --cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" \
  "verify changes <file> for regressions vs commit 472818bc baseline"

# Local Deno smoke (Edge Function)
SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN ~/.elab-credentials/sprint-s-tokens.env | cut -d= -f2) \
  npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt

# Smoke prod 5 queries
for q in "Ciao Ragazzi" "Vol.1 pag.42" "accendi led" "compila il codice" "spiegami il pulsante"; do
  curl -sS -X POST '<EDGE_URL>' -H 'auth headers' -d "{\"message\":\"$q\",\"experimentId\":\"v1-cap6-esp1\"}" | jq '.text' | head -2
done
# MUST: 5/5 Ragazzi + Vol/pag + ≤120 parole + zero JSON leak
```

### Vercel deploy (post EPIC 2 atoms):

```bash
npm run build && npx vercel --prod --force --yes
# Verify bundle hash changes + LIVE smoke Chrome MCP
```

### Chrome MCP live verify (Andrea screenshot 10 scenari):

```
mcp__Claude_in_Chrome__navigate https://www.elabtutor.school
mcp__Claude_in_Chrome__javascript_tool window.location.hash='#lavagna'
mcp__Claude_in_Chrome__screenshot                    # DrawingOverlay toolbar bottom-center ≥48px
mcp__Claude_in_Chrome__form_input + javascript_tool  # 10 query reali Andrea
mcp__Claude_in_Chrome__read_network_requests         # verify Edge response Ragazzi + Vol/pag + intents_parsed
```

---

## 7. EXIT CRITERIA iter 54

**Score target onesto G45 cap**: **7.5/10** (NO inflation senza Opus indipendente).

**Mandatory**:
- Tea standard_schema adottato `src/data/experiments-vN-narrative.js` (94/94 esperimenti)
- Narrative continuity tests `tests/integration/narrative-arc-continuity.test.js` 100% PASS
- DrawingOverlay redesign 4/5 atoms shipped (Atom 5 defer iter 55)
- 5 real-user bugs prod: 3/5 fixed + 2/5 documented defer iter 55+
- Pre-flight CoV 3x consecutive vitest ≥14342 PASS no regression
- Build PASS + Edge v81 deploy LIVE + Vercel new bundle LIVE
- Chrome MCP 10 query Andrea scenari PASS visivo
- Audit + handoff docs shipped + commits pushed origin (NO `--no-verify`, NO main push)
- ADR-034 system-prompt v3.2 narrative-aware PROPOSED Andrea ratify queue

**Defer iter 55+ acknowledged explicit**:
- DrawingOverlay Atom 5 cleanup (BREAKING)
- E5.1 92 esperimenti Playwright sweep
- E5.2 Linguaggio codemod 200 violations
- E5.3 Vol3 refactor Davide co-author
- Tea fumetto MVP merge candidate
- Mac Mini reactivation post Tailscale fix

---

## 8. Anti-inflation G45 mandate iter 54

- NO claim "narrative arc 100%" senza verify 94/94 esperimenti integration test PASS
- NO claim "5 bugs fixed" se 2/5 deferiti
- NO score ≥8 senza Opus indipendente review (multi-reviewer-patterns)
- NO push main, NO `--no-verify`, NO bypass pre-push hook
- NO `git add -A` senza `git diff` review prima
- Test count cite SOLO da vitest output appena visto (NOT memoria)
- Score cite SOLO da `node scripts/benchmark.cjs --write` (NOT self-claim)
- Pattern S race-cond fix VALIDATED 19th iter consecutive (5+6+8+11+12+19+36+37+38+43+46+47+48+49+50+51+52+53+**54**)

---

## 9. Skill chain riepilogo (invocation order)

1. `/mem-search` — ELAB 446k history Fase 1
2. `/llm-application-dev:prompt-optimize` — system-prompt v3.2 Fase 2 + meta-optimize iter 54 sub-prompts
3. `/ultrathink` — multi-perspective architect+research+coder+tester per EPIC planning
4. `/code-architect` — file ownership matrix + atom decomposition
5. `/accessibility-compliance:wcag-audit-patterns` — DrawingOverlay ≥48px verify
6. `/architecture-patterns` — narrative continuity injection pattern
7. `/systematic-debugging` — 5 real-user bugs hypothesis-driven
8. `/code-refactoring:tech-debt` — 8 stacked useEffect cleanup
9. `/codebase-cleanup:tech-debt` — dead imports + stale localStorage migration
10. `/comp-analysis` — competitive validate (Excalidraw/tldraw/SMART/OpenBoard)
11. `/document-sync` — CLAUDE.md + ADRs + audits alignment
12. `/quality-audit` — orchestrator end-of-iter G45 review

---

## 10. Connettori MCP (TUTTI — Andrea iter 41 mandate)

**Live testing**: `mcp__Claude_in_Chrome__*` (browser_batch + javascript_tool + read_network_requests) + `mcp__Control_Chrome__*` + `mcp__Macos__*` + `mcp__computer-use__*`

**Code nav**: `mcp__plugin_serena_serena__*` (symbol-level) + `mcp__plugin_context7_context7__*` (live docs)

**Memory**: `mcp__claude-mem__*` (search + timeline + get_observations) + `mcp__plugin_claude-mem_mcp-search__*`

**Deploy**: Supabase CLI direct (SUPABASE_ACCESS_TOKEN env) + Vercel CLI direct (npx vercel)

**Codex Pattern C**: `~/.npm-global/bin/codex exec --skip-git-repo-check --sandbox workspace-write` per cross-check verify pre-deploy (file:line citations, regex sanity, dead code) — NON per prose synthesis (anti-pattern iter 41 documented).

---

## 11. Files referenziati iter 54 entrance (paths assoluti)

**Tea (READ FIRST — Fase 0)**:
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_schema.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_map.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/narrative_metadata_94.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/punto2_audit_dettagliato.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/punto2_mapping_narrativo.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_spec.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/bibbia_stilistica.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_v1-cap6-esp1.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/standard_experiment_v3-cap7-mini.json`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/mascotte_unlim_canonica.md`
- `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/fumetto_schema.json`

**Iter 53 close audit (carry-over context)**:
- `docs/audits/2026-05-13-iter-53-drawing-overlay-architecture-redesign.md`
- `docs/audits/2026-05-13-SESSION-FINAL-SUMMARY-iter46-53.md`
- `docs/audits/2026-05-13-SESSION-TOOLS-WORKFLOW-RESEARCH-FORENSIC.md`

**Edge Function critical (Fase 2 + EPIC 3)**:
- `supabase/functions/_shared/system-prompt.ts`
- `supabase/functions/_shared/onniscenza-classifier.ts`
- `supabase/functions/_shared/principio-zero-validator.ts`
- `supabase/functions/_shared/operational-response.ts`
- `supabase/functions/_shared/intent-parser.ts`
- `supabase/functions/_shared/capitoli-loader.ts`
- `supabase/functions/unlim-chat/index.ts`

**Frontend critical (EPIC 2 + EPIC 3)**:
- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/VolumeViewer.jsx`
- `src/components/simulator/canvas/DrawingOverlay.jsx`
- `src/components/lavagna/useGalileoChat.js`
- `src/components/lavagna/intentsDispatcher.js`
- `src/services/api.js` (line 783 envelope builder)

**Data critical (EPIC 1)**:
- `src/data/experiments-v1.js` + `v2.js` + `v3.js`
- `src/data/lesson-groups.js`
- `src/data/volume-references.js`
- `src/data/lesson-paths/*.json` (94 files)

**Credentials**:
- `~/.elab-credentials/sprint-s-tokens.env` (SUPABASE_ACCESS_TOKEN)
- `/tmp/vercel.env` (VITE_ELAB_API_KEY + VITE_SUPABASE_ANON_KEY — refresh: `npx vercel env pull /tmp/vercel.env --environment=production --yes`)

---

## 12. Honest gaps iter 53 carryover (NOT fixed prod — input EPIC iter 54)

1. Off-topic template iter 52 fix v80 LIVE — verify Chrome MCP iter 54 entrance (real-user UAT)
2. DrawingOverlay toolbar cramped + drawing scope limited (Andrea screenshot iter 53) — EPIC 2 fix
3. VolumeViewer eraser missing iter 42 — defer iter 55 Atom 5 BREAKING
4. 5 real-user bugs LIVE prod — EPIC 3 fix
5. 5 HIGH + 3 MEDIUM Codex carryover iter 51-52 — EPIC 4 fix
6. Iter 21 mandates 32 iter pending (92 esperimenti audit + linguaggio codemod + Vol3 refactor) — EPIC 5 audit + defer iter 55+
7. Andrea recurring mandate (ripetuto MOLTE VOLTE): arco narrativo continuo + parità triplet volumi↔kit↔elabtutor — EPIC 1 CORE iter 54

---

## 13. Meta-optimization applied (/llm-application-dev:prompt-optimize self-application)

Questo prompt è stato auto-ottimizzato seguendo principi prompt-engineering 2026:

- **Clarity** §0 stringa attivazione paste-ready prima di context (utente single-paste path)
- **Role** Claude Code agent + Pattern S r3 multi-agent OPUS workflow esplicito
- **Constraints** sezioni numerate priority order + acceptance gate per fase
- **Examples** code blocks bash + curl + Chrome MCP invocations concrete
- **Anti-pattern callouts** §8 G45 + §12 honest gaps + caveat "Codex NOT prose"
- **Verifiable success criteria** §7 exit criteria con bullet measurable
- **Defer transparency** §7 + §12 explicit "defer iter 55+" list (no implicit promises)

Mantenere principi se prompt ulteriormente esteso iter 55+ activation.

---

(c) Andrea Marro 2026-05-13 — ELAB Tutor iter 54 fresh session activation prompt v2 (Tea + narrative arc + parità triplet + /mem-search + /llm-application-dev:prompt-optimize + NO regressioni).
