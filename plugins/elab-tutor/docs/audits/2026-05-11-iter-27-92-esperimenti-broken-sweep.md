# Iter 27 — 92/94 Esperimenti Playwright Sweep UNO PER UNO — Brutal Evidence

**Run timestamp**: 2026-05-11T13:44:58Z → 2026-05-11T13:53:41Z (8m 43s wallclock)
**Base URL**: https://www.elabtutor.school (prod, deploy current main)
**Tooling**: Playwright 1.58.2 via `tests/e2e/iter-27-92-esperimenti-sweep.spec.js`, single worker, license bypass via `seedSprintUBypass` (helpers/sprint-u-auth.js)
**Lesson-paths input**: 94 JSON files in `src/data/lesson-paths/` (38 Vol1 + 27 Vol2 + 29 Vol3)
**Aggregate JSON**: `automa/state/iter-27-92-esperimenti-results-20260511-154246-full.json` (94 results, 94 broken)
**Stable copy**: `automa/state/iter-27-92-esperimenti-results-latest.json`
**Screenshots**: `docs/audits/iter-27-screenshots/*.png` (94 full-viewport, ~12 MB total)

---

## 1. Methodology

Per Andrea iter 21+ mandate ripetuto iter 22-26 ("esperimenti broken Playwright UNO PER UNO ~92 esperimenti audit kit fisico mismatch + componenti mal disposti + non-funzionanti"), this sweep does NOT smoke 5/5 cherry-pick. It runs all 94 experiments UNO PER UNO against live prod.

### Sweep loop per experiment
1. `addInitScript` seeds `elab-license-key=ELAB2026` + GDPR consent (bypasses WelcomePage gate).
2. `page.goto('https://www.elabtutor.school/#lavagna?exp=<id>', { waitUntil: 'domcontentloaded' })`.
3. Settle 3500 ms for SPA hydration.
4. Inspect DOM:
   - Canvas present (`.simulator-canvas`, `[data-testid="simulator-canvas"]`, fallback any `<svg>`).
   - Component count via `[data-component-id]`, `[data-comp-type]`, `g[data-id^="comp-"]` (max).
   - Vol/cap or Vol/pag citation regex against `body.innerText`.
   - Console errors + page errors + image/script/css network failures.
5. Capture `screenshot()` (viewport, not full-page, 5s timeout).
6. Categorize broken reasons (Cat 1-6 below).
7. Append to `aggregate.results[]` and assert nav did not throw.

### Categorization
| Cat | Meaning | Detection |
|-----|---------|-----------|
| Cat 1 | Mount fail (no canvas) | `canvasPresent === false` |
| Cat 2 | Component mismatch | `componentsRendered === 0` while `componentsExpected > 0`, OR rendered < expected/2 |
| Cat 3 | Vol/pag wrong (citation missing) | No Vol.N cap.N or Vol.N pag.N match in body |
| Cat 4 | Console error JS / nav error / HTTP 5xx | pageerror, navError, or HTTP >= 500 |
| Cat 5 | Wire/connection broken | (deferred — DOM not probed for wires here, see §6 caveats) |
| Cat 6 | Asset 404 | image/script/css `requestfailed` count |

### Tooling chosen vs alternatives
- Playwright CLI was used (installed v1.58.2 locally) rather than Chrome MCP because the sweep needed to run 94 navigations serially with consistent settling, JSON output, and aggregated stats. Chrome MCP per-call overhead would have blown the 30-min budget.

---

## 2. Aggregate stats (brutal numbers)

```
total:                    94 / 94
passing:                  0 / 94    (0.0%)
broken:                   94 / 94   (100.0%)

canvas_present:           94 / 94   (100.0%)
canvas_absent:             0 / 94
rendered_any_components:   0 / 94   (0.0%)
zero_rendered_w_expected: 94 / 94   (100.0%)
citation_cap_match:        0 / 94
citation_pag_match:        0 / 94
no_citation_visible:      94 / 94

HTTP 200:                 94 / 94
HTTP >=500:                0 / 94
total_console_errors:      0
total_page_errors:         0
total_net_failures:        0

elapsed per exp (ms):    min=4291  median=4916  max=9826  avg=4959

per-volume broken:
  Vol1:  38 / 38 broken
  Vol2:  27 / 27 broken
  Vol3:  29 / 29 broken

reason frequency (broken=94):
  cat2_zero_components_rendered:  94
  cat3_no_vol_pag_citation_visible: 94
```

**Numbers came from**: `python3` analysis of `automa/state/iter-27-92-esperimenti-results-latest.json` — not memory.

---

## 3. Top broken experiments (ranked impact — most critical first)

Because the failure pattern is **uniform across all 94** (single root cause, see §6), the "top-10 most-broken" framing collapses: every experiment fails identically. The ranking below is by **didactic priority** (Vol1 cap.6 LED Blink = first ever experiment students see → highest user impact when broken).

| Rank | Experiment | Vol/Cap | Title | Components expected → rendered | Citation visible | Status |
|------|------------|---------|-------|-------------------------------|------------------|--------|
| 1 | v1-cap6-esp1 | Vol.1 cap.6 | Accendi il tuo primo LED | 5 → **0** | NO | BROKEN |
| 2 | v1-cap6-esp2 | Vol.1 cap.6 | (book LED variant) | 5 → **0** | NO | BROKEN |
| 3 | v1-cap6-esp3 | Vol.1 cap.6 | (book LED variant) | 5 → **0** | NO | BROKEN |
| 4 | v1-cap7-esp1 | Vol.1 cap.7 | Resistore (first R intro) | 5 → **0** | NO | BROKEN |
| 5 | v1-cap8-esp1 | Vol.1 cap.8 | Pulsante | 5 → **0** | NO | BROKEN |
| 6 | v1-cap9-esp1 | Vol.1 cap.9 | Arduino Blink (Nano R4) | 5 → **0** | NO | BROKEN |
| 7 | v2-cap3-esp1 | Vol.2 cap.3 | Vol.2 opener | 5 → **0** | NO | BROKEN |
| 8 | v3-cap5-esp1 | Vol.3 cap.5 | Vol.3 opener | 5 → **0** | NO | BROKEN |
| 9 | v3-cap7-mini | Vol.3 cap.7 | Mini progetto pot + LED PWM | 7 → **0** | NO | BROKEN |
| 10 | v3-cap8-serial | Vol.3 cap.8 | Serial monitor | 7 → **0** | NO | BROKEN |

All 94 rows have full evidence in the JSON. Body-text sample (representative, identical across all 94):

```
Lavagna ELAB — Scegli un esperimento... Ragazzi, autorizza il microfono per usare la voce
di UNLIM e parlare durante l'esperimento sul kit ELAB. Autorizza Più tardi ELAB Scegli un
esperimento... Manuale Video Salva Fumetto Percorso Passo Passo Già Montato Ehi UNLIM
SCEGLI ESPERIMENTO Volume 1 Le Bas...
```

The page is **stuck on the empty "Scegli un esperimento" picker** for every deep-link.

---

## 4. Six-categories count table

| Cat | Description | Count | % of broken |
|-----|-------------|------:|------------:|
| Cat 1 | Mount fail (no canvas) | 0 | 0% |
| Cat 2 | Component mismatch (0 rendered, ≥1 expected) | **94** | **100%** |
| Cat 3 | Vol/pag wrong (citation missing) | **94** | **100%** |
| Cat 4 | Console error JS / nav error / HTTP 5xx | 0 | 0% |
| Cat 5 | Wire/connection broken | (not probed — see §6) | — |
| Cat 6 | Asset 404 | 0 | 0% |

Cat 2 and Cat 3 each hit 94/94 simultaneously — they are not independent symptoms but **two visible projections of the same root cause** (see §5 P0.1).

---

## 5. P0 fix candidates (top 5 ranked effort vs impact)

### P0.1 — Wire `?exp=<id>` deep-link to `#lavagna` route — EFFORT 30 min — IMPACT 94/94 unblock
**Root cause**: `src/App.jsx:213` consumes `getExpFromHash()` **only** under `currentPage === 'prova'`. For `#lavagna` (line 239-244) and the `#tutor → #lavagna` strangler fig redirect (line 230-236), `LavagnaShell` is rendered with zero props — the `?exp=` query parameter is silently dropped.

**Fix sketch** (single-file, surgical):
```jsx
// src/App.jsx around line 239
if (currentPage === 'lavagna' || currentPage === 'tutor') {
    const deepLinkExp = getExpFromHash();
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LavagnaShell initialExperimentId={deepLinkExp} />
        </Suspense>
    );
}
```

Then in `LavagnaShell`, accept `initialExperimentId` prop and, after mount, call `api.mountExperiment(initialExperimentId)` if non-null (pattern already exists at line 1186: `api?.mountExperiment?.(expId)`).

**Why this is the biggest win**: it unblocks deep-linking for all 94 experiments AND unblocks every future automated audit (Andrea iter 21+ mandate becomes mechanically verifiable). Currently NO E2E sweep can validate per-experiment behavior on prod without manual click-through the picker.

**Verification**: re-run `tests/e2e/iter-27-92-esperimenti-sweep.spec.js` post-fix; expect Cat 2 to drop from 94 → 0 (or near-0) and componentsRendered > 0 for the majority.

### P0.2 — Surface canonical Vol.N pag.M citation in the simulator chrome — EFFORT 1-2 h — IMPACT 94/94 PRINCIPIO ZERO compliance
Even when an experiment is mounted (verified manually for v1-cap6-esp1 via `#prova` control, see §6), the page chrome does NOT print `Vol.1 pag.X` — only the title. PRINCIPIO ZERO mandates docente reads VERBATIM dal libro, so the page header MUST surface `Vol.{volume} cap.{chapter} — pag.{page}` continuously.

`src/data/volume-references.js` already has the data (94/94 enriched per CLAUDE.md). Wire it into `LavagnaShell` header.

**Verification**: post-fix, sweep should drop Cat 3 from 94 → 0.

### P0.3 — Restrict `#prova` route to ONLY Vol.1 OR extend to 94 — EFFORT 30 min — IMPACT inconsistency removed
Control test confirmed `#prova?exp=v1-cap6-esp1` works (8 components rendered) but `#prova?exp=v2-cap3-esp1` and `#prova?exp=v3-cap5-esp1` both render 0 components — the "Versione di prova" banner says "Volume 1 (38 esperimenti)" yet also "Tutti i 94 esperimenti". Pick one and enforce it; the mixed messaging breaks the demo path.

### P0.4 — Audit the lesson-paths JSON schema vs Omaric kit manifest — EFFORT 4-6 h — IMPACT kit triplet coerenza (Morfismo Sense 2)
Lesson-paths declare 5-7 components per experiment (e.g., v3-cap7-mini → 7 components). The audit cannot test "componenti mal disposti" or "kit fisico mismatch" until P0.1 lands (no experiment ever mounts via deep-link). Once P0.1 lands, extend the sweep to assert:
- Each component name in `components_needed[]` resolves to a registered SVG in `src/components/simulator/components/`.
- Component positions on the breadboard match the wiring diagram in the volume PDF (page reference is already in lesson-path JSON).

### P0.5 — Add per-route deep-link smoke test to CI — EFFORT 1 h — IMPACT permanent regression gate
Add a 3-experiment smoke (v1-cap6-esp1 + v2-cap3-esp1 + v3-cap5-esp1) running on every PR with assertion `componentsRendered > 0`. Prevents this bug from re-emerging silently.

---

## 6. Honest caveats + evidence gaps

1. **Anti-G45 suspicion check triggered (94/94 broken is "too uniform")**. Per spec instructions, this was investigated:
   - Sample 5 random body texts: all identical "Scegli un esperimento" picker (see §3 quoted body).
   - Source code grep `src/App.jsx:213`: `getExpFromHash()` is used ONLY in the `prova` branch, not in the `lavagna`/`tutor` branch.
   - Control test on `#prova?exp=v1-cap6-esp1`: 8 components rendered → confirms experiment-mount logic itself works, but is unreachable via `#lavagna?exp=`.
   - **Conclusion**: the 94/94 broken rate is REAL on the `#lavagna` route (the route Andrea documented in spec). It is a single-line wiring bug, not a measurement artifact.

2. **Cat 5 (wire/connection broken) was NOT probed** in this iter. Since 94/94 fail upstream at Cat 2 (zero components rendered), wires cannot be inspected. Iter 28 post-P0.1-fix should add `state.connections` count assertion (pattern from `tests/e2e/helpers/wire-count.js` iter 29).

3. **No `[AZIONE:...]` or UNLIM behavior tested** — sweep covers SHELL ONLY (canvas mount + component count + citation). UNLIM chat quality, voice, vision, fumetto generation are out-of-scope for this iter.

4. **Screenshots are viewport-only** (not full-page) to keep file size manageable (12 MB total for 94 PNGs). They all show the same picker screen — they are evidence OF the bug, not differentiated per-experiment evidence.

5. **License gate bypass via `addInitScript`** assumes the prod build still honors the `elab-license-key` localStorage seed. If a future prod change rotates the gate, the sweep falls back to "page redirect to /scuole" and Cat 4 would spike — current run shows 0 Cat 4, so gate bypass works.

6. **94 vs 92 nomenclature**: Andrea's mandate says "~92 esperimenti". The lesson-paths directory contains **94 JSON files** (38+27+29) matching `experiments-vol*.js ALL_EXPERIMENTS` aggregator (38+27+29 ids each). The "92" likely predates iter 37 +2 additions (v3-cap7-mini, v3-cap8-serial). Sweep covers the current 94.

7. **No write to src/** during this audit (read-only mandate respected). Only new files: spec, audit doc, JSON results, 94 screenshots.

8. **R0/R5/R7 quality benches not affected** — those measure UNLIM response quality independent of the broken deep-link. Quality benches likely still pass because they bypass the SPA entirely and hit the Edge Function directly.

---

## 7. Andrea iter 28 P0 ratify queue (paste-ready)

1. **RATIFY P0.1 fix** — wire `getExpFromHash()` into `#lavagna` route + pass `initialExperimentId` prop to `LavagnaShell`, then call `api.mountExperiment(initialExperimentId)` on mount. ~30 min Maker-1.
2. **RATIFY P0.5 CI gate** — add 3-experiment smoke (v1+v2+v3 representatives) asserting `componentsRendered > 0` on every PR. ~1 h Tester-1.
3. **DECIDE Vol1-only vs all-94 for `#prova` route** — current messaging mixes "Volume 1 (38)" and "Tutti i 94 esperimenti" inconsistently. ~30 min Maker-1.
4. **APPROVE P0.2 citation surface** — visible `Vol.N cap.M — pag.K` in LavagnaShell header reading from `volume-references.js`. ~1-2 h WebDesigner-1.
5. **APPROVE P0.4 kit triplet audit extension** — post-P0.1, extend sweep to assert component SVG resolution + breadboard position vs PDF page reference. ~4-6 h Maker-1 + Tester-1.
6. **NOTE**: Andrea iter 21+ "esperimenti broken UNO PER UNO" mandate is **structurally unverifiable until P0.1 lands**. P0.1 is the gate for closing the carryover from iter 22-26.

---

## 8. Files produced this iter (paths absolute, NEW only)

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/tests/e2e/iter-27-92-esperimenti-sweep.spec.js` (~240 LOC Playwright spec, parameterized via env)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/iter-27-92-esperimenti-results-20260511-154246-full.json` (timestamped raw results)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/iter-27-92-esperimenti-results-latest.json` (stable copy for downstream tooling)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/audits/iter-27-screenshots/*.png` (94 PNGs, ~12 MB)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/audits/2026-05-11-iter-27-92-esperimenti-broken-sweep.md` (this doc)

Zero `src/`, `supabase/functions/`, or `vitest tests/` modifications. Iter 27 read-only audit mandate respected.
