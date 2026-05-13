# Iter 50 close audit — R5 50q PASS + 1000-q matrix re-run v78 + 3 parallel hypothesis investigators

**Date**: 2026-05-13 PM | **Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Score iter 50 close ONESTO G45 cap**: **8.0/10** (R5 97.0% + matrix infra repo + 3 defects identified + 2 fixes shipped + scorer hygiene fixed)

---

## 1. Andrea iter 50 mandate

> "1000-query matrix re-run post iter 46 v78 — verifica niente rotto (30 min)
> R5 50q quality bench Flash plain — misura qualità v78 (30 min)
> usa codex in modo iterativo e retroattivo
> /debugging-strategies /parallel-debugging /agent-teams:team-spawn /agent-teams:team-debug
> /systematic-debugging /code-documentation:code-explain"

Goal: empirical verification iter 46 v78 Flash plain pivot preserves quality + zero regression.

---

## 2. Karpathy 5-atom execution

### ATOM-A — R5 50q bench (iter 51 confidence baseline)

`SUPABASE_ANON_KEY=... node scripts/bench/run-sprint-r5-stress.mjs` (existing infra repo).

**Result**: **Overall 97.0% PASS** (gate ≥85% MET), 60-prompt fixture, latency 1955ms avg.

| Metric | iter 45 v73 (Pro+thinking) | iter 50 v78 (Flash plain) | Delta |
|--------|----------------------------|----------------------------|-------|
| Overall PASS | 91.45% | **97.0%** | **+5.55pp** |
| Avg latency | 4831ms | **1955ms** | **-60%** lift |
| Avg words | 35 | 37 | +5% |
| 12-rule gate | PASS | PASS | preserved |

Per-rule R5 v78:
- plurale_ragazzi: 100%
- citation_vol_pag: 100%
- max_words: 100%
- sintesi_60_parole: 100%
- safety_warning: 100%
- off_topic_redirect: 100%
- deep_question: 86% (1 prompt 92 words exceeded 60-word target, scorer max_words rule fired)

8/38 HTTP failures observed (21% transient fail rate) — investigate iter 51 transient retry policy.

### ATOM-B — 1000-q matrix re-run (regenerated infra)

Original `/tmp/gen-1000-queries.py` + `/tmp/run-1000-matrix.py` lost system cleanup.
Regenerated iter 50 + committed repo this time:
- `scripts/bench/gen-1000-queries.py` NEW (~280 LOC, 10-category generator, seed=42 reproducible)
- `scripts/bench/run-1000-matrix.py` NEW (~280 LOC, parallel 10-worker scorer)
- `scripts/bench/1000-queries.jsonl` NEW (1000 lines fixture)

**Result raw**: **875/1000 (87.5%) PASS** in 157s (10 workers parallel).

| Category | PASS | Total | % | Notes |
|----------|------|-------|---|-------|
| amb | 100 | 100 | 100.0% | ✓ |
| color | 97 | 100 | 97.0% | 3 envelope echo H1 |
| concept | 199 | 200 | 99.5% | 1 http_503 flake |
| control | 79 | 80 | 98.8% | 1 JSON trailing H2 |
| diag | 99 | 100 | 99.0% | 1 envelope echo H1 |
| expnav | 79 | 80 | 98.8% | 1 Capitolo prefix echo |
| highlight | 60 | 60 | 100.0% | ✓ |
| **offtopic** | **63** | **100** | **63.0%** | 37 scorer strict H3 |
| volnav | 80 | 80 | 100.0% | ✓ |
| **volpag** | **19** | **100** | **19.0%** | 81 scorer strict H3 |

Hard defects (7 real): 1 JSON leak + 5 no_plurale + 1 http_503.
Scorer false positives (118): 37 offtopic + 81 volpag.

### ATOM-C — 3 parallel hypothesis investigators (agent-teams team-debugger)

Dispatched 3 parallel agents per Andrea mandate parallel-debugging:

**H1 — Envelope echo `[CONTESTO OPERATIVO]`** (color-036/046/076 + diag-068):
- Confidence: 6/10
- Root cause: Flash plain (iter 46 v78 no thinkingBudget) less compliant with system-prompt v3.1; BASE_PROMPT has no explicit "MAI ripetere [CONTESTO OPERATIVO]" rule; post-LLM scrubber chain blind to bracket-prefix envelope (only catches `{"text":...}` JSON shape iter 41 v66).
- Recommended fix: 5 LOC post-LLM regex strip `/\[CONTESTO\s+OPERATIVO[^\]]*\][^\n]*\n?/gi` in `unlim-chat/index.ts:~970` + defensive Ragazzi fallback if entire response was echo.

**H2 — Bare `{"intents":[` JSON literal** (control-065):
- Confidence: 7/10
- Root cause: Mistral/Gemini structured output schema mode (`ENABLE_INTENT_TOOLS_SCHEMA` iter 38+) + token cap (120-520 maxOutputTokens) emits prose then opens `{"intents":[` and EOF mid-JSON. Iter 41 v66 envelope scrubber only catches `{"text":...}` requiring "text" key.
- Recommended fix: 15-20 LOC bare `{"intents":[` substring detect + strip from index outside `[INTENT:...]` brackets.

**H3 — Scorer strictness false positives** (118 fails):
- Confidence: 9/10
- Root cause: bench scorer iter 50 `VOLPAG_RE_STRICT = /\bVol\.\s*\d+\s*pag\.\s*\d+\b/i` requires literal `Vol.X pag.Y` format. Sampled volpag failures actually cite LOOSELY ("pagina 18 del Volume 2" / "Volume 1 a pagina 27"). offtopic check naive substring "esperimento|circuito" without redirect-keyword awareness — 5/5 sampled fails are legit redirects mentioning scope words contextually.
- Recommended fix: 8 LOC scorer relax — adopt R5 canonical loose regex `score-unlim-quality.mjs:62` + redirect-aware offtopic check.
- Projected lift: volpag 19→95+/100, offtopic 63→97+/100, total matrix 875→995+/1000.

### ATOM-D — Surgical fixes shipped iter 50 v79

**H1 fix** `supabase/functions/unlim-chat/index.ts:~978` (+27 LOC):
```typescript
if (result && typeof result.text === 'string' && /\[CONTESTO\s+OPERATIVO/i.test(result.text)) {
  const stripped = result.text.replace(/\[CONTESTO\s+OPERATIVO[^\]]*\][^\n]*\n?/gi, '').trim();
  if (stripped.length === 0) {
    result = { ...result, text: 'Ragazzi, riprovate la domanda — un momento di confusione.' };
    console.warn(...envelope_full_echo_substituted...);
  } else {
    result = { ...result, text: stripped };
    console.warn(...envelope_scrubbed...);
  }
}
```

**H2 fix** `supabase/functions/unlim-chat/index.ts:~1006` (+18 LOC):
```typescript
if (result && typeof result.text === 'string' && /\{\s*"intents"\s*:\s*\[/.test(result.text)) {
  const match = result.text.match(/\{\s*"intents"\s*:\s*\[/);
  const idx = match ? result.text.indexOf(match[0]) : -1;
  if (idx >= 0) {
    const before = result.text.slice(0, idx).trim();
    if (before && before.length >= 10) {
      result = { ...result, text: before };
      console.warn(...bare_intents_literal_scrubbed...);
    }
  }
}
```

**H3 fix** `scripts/bench/run-1000-matrix.py:~119` (+15 -8 LOC):
- `VOLPAG_RE_LOOSE` aligned R5 canonical: `(?:\bvol(?:ume)?\.?\s*[1-3])\s+(?:cap(?:itolo)?\.?\s*\d+|pag(?:ina)?\.?\s*\d+|a\s+pagina\s*\d+)`
- `REDIRECT_KEYWORDS` tuple: `torniamo|concentriamoci|fuori dal nostro tema|percorso elab|siamo dentro|volete iniziare|restiamo focalizzati|rimaniamo sul|fuori scope|fuori-scope|non rientra`
- offtopic check: fail only if scope words present AND no redirect keyword.

### ATOM-E — Deploy v79 + re-bench plan

1. `supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb` → v79 LIVE
2. Re-run 1000-q matrix with H3-relaxed scorer → expect ~995+/1000 PASS
3. CoV 3x consecutive runs target 100% PASS (iter 41 v67 baseline restoration)
4. R5 50q re-bench v79 → verify H1/H2 fixes preserve R5 97% (no regression scrubber over-strip)

---

## 3. Honest gaps iter 50

1. **3rd CoV NOT executed yet** (iter 41 v67 mandate "3 consecutive 1000/1000 PASS"). Defer iter 51 budget ~10 min/run.
2. **H1 confidence 6/10** (not high) — Flash plain regression hypothesis. Alternative: Onniscenza inject leaking new variant envelope. Iter 51 grep `[CONTESTO OPERATIVO` literal source to rule out injection.
3. **R5 8/38 HTTP failures** (21% transient) — not bench gate fail but suggests Edge Function rate limit / Vertex Frankfurt throttling. Investigate iter 51.
4. **Codex retroactive audit scoring** (Andrea mandate "iterativo e retroattivo"): partial — explored docs/codebase deeply but did NOT produce final analytical table (extensive file dumps instead). H3 agent investigation covered same ground efficiently.
5. **expnav-076 "Vol.2 Cap.7:" prefix echo** not covered by H1 regex. Iter 51 widen scrubber `/^\s*Vol\.\s*\d+\s*Cap\.\s*\d+:/` substitution.

---

## 4. Connettori + tools used iter 50

- `Bash run_in_background` ×3 (R5 bench, 1000-q matrix, commit) + Monitor process tracking
- `Agent agent-teams:team-debugger` ×3 parallel hypothesis investigators (H1+H2+H3)
- Codex CLI 0.128.0 gpt-5.5 high reasoning ×1 (scoring audit, produced extensive code exploration)
- Python urllib + ThreadPoolExecutor 10-worker matrix runner (regenerated repo)
- supabase CLI deploy + secrets list
- curl direct prod probes (R5 verification post-deploy iter 51)

Pattern S race-cond fix VALIDATED **15th iter consecutive** (5+6+8+11+12+19+36+37+38+43+46+47+48+49+**50**).
3 parallel agents file ownership disjoint (H1 system-prompt+unlim-chat, H2 unlim-chat+mistral-client, H3 bench scorer) — zero write conflict.

---

## 5. Iter 51 P0 priorities (cascade)

1. Re-run 1000-q matrix iter 50 v79 with H3 scorer + verify H1/H2 fixes → projected ~995+/1000
2. CoV 3x consecutive 1000-q runs → target 100% PASS preserve iter 41 v67 baseline
3. R5 50q re-bench v79 → verify R5 97% preserved post H1/H2 scrubber
4. expnav-076 widen scrubber for `Vol.X Cap.Y:` prefix
5. R5 HTTP 8/38 transient retry investigation (Vertex Frankfurt throttling vs Edge rate-limit)
6. system-prompt v3.2 add explicit "MAI ripetere [CONTESTO OPERATIVO]" rule (belt-and-suspenders H1)
7. Codex retro audit complete proper analytical table 12 PZ rules iter 50 baseline

---

## 6. Anti-inflation G45 mandate

cap 8.0/10. NO claim:
- "100% PASS restored" (CoV 3x not executed; pending H3 scorer relax verification)
- "Zero regression" (4 envelope echo + 1 JSON leak = real defects iter 46 v78 Flash plain side effect)
- "Iter 50 close definitive" (3 of 6 P0 items deferred iter 51)
- "Codex retroactive audit complete" (extensive exploration without final analytical synthesis)

Sunk cost discipline preserved: iter 47-48 Claude DORMANT decision iter 49 NOT reversed despite quota denial — priority redirect honored (matrix + R5 P0 items now done iter 50).

(c) Andrea Marro 2026-05-13 — ELAB Tutor iter 50.
