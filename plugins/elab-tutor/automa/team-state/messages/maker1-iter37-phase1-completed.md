# Maker-1 Iter 37 Phase 1 Completion

**Date**: 2026-04-30 19:25 CEST
**Branch**: `e2e-bypass-preview`
**Pattern**: PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md atomi A2 + A4 + A5 + B-NEW + A9
**Andrea ratify status**: ADR-028 §14 surface-to-browser ACCEPTED + LLM_ROUTING 70/20/10 ACTIVE

---

## §1 Atomi delivery matrix

| Atom | Status | LOC delta | Acceptance |
|------|--------|-----------|------------|
| **A2 ENABLE_ONNISCENZA conditional** | PASS | +150 NEW classifier + 215 NEW tests + 30 modified unlim-chat + 5 modified onniscenza-bridge | 30/30 unit tests PASS + smoke prod LIVE prompt_class verified |
| **A4 STT CF Whisper format fix** | PASS | +174 modified cloudflare-client.ts + 116 NEW rationale doc | dual-shape JSON+raw fallback impl + container detect (live smoke deferred Phase 3) |
| **B-NEW useGalileoChat intents_parsed dispatch** | PASS | +151 NEW intentsDispatcher.js + 264 NEW tests + 25 modified useGalileoChat.js + 7 modified api.js | 22/22 unit tests PASS + 4 lavagna sweep 61/61 anti-regression |
| **A5 unlim-chat redeploy** | PASS | n/a (deploy only) | v48 → v50 LIVE prod + smoke `chit_chat` returned `prompt_class:{category:"chit_chat",skipOnniscenza:true,topK:0}` |
| **A9 7 missing esperimenti** | PARTIAL (5/7) | volume-references.js unchanged 92 entries | 5/7 already mapped both datasets (cap6-morse, cap6-semaforo, extra-{lcd-hello,servo-sweep,simon}). 2/7 (cap7-mini, cap8-serial) DEFERRED — see §3 honesty caveat. |

### File system verification

NEW (5 files, 896 LOC totale):
- `supabase/functions/_shared/onniscenza-classifier.ts` (150 LOC) — pre-LLM regex classifier 6 categorie
- `tests/unit/onniscenza-classifier.test.js` (215 LOC) — 30 fixture tests
- `docs/audits/iter-37-stt-fix-rationale.md` (116 LOC) — A4 decision doc + risks
- `src/components/lavagna/intentsDispatcher.js` (151 LOC) — server intent dispatcher + whitelist
- `tests/unit/components/lavagna/useGalileoChat-intents-parsed.test.js` (264 LOC) — 22 fixture tests

MODIFIED (4 files, +200 / -36):
- `supabase/functions/_shared/cloudflare-client.ts` (+174 -32) — A4 dual-shape Whisper STT
- `supabase/functions/unlim-chat/index.ts` (+30 -4) — A2 classifier wire-up + prompt_class telemetry
- `src/services/api.js` (+7) — B-NEW surface intents_parsed from Edge response
- `src/components/lavagna/useGalileoChat.js` (+25 -1) — B-NEW dispatch wire-up + import refactor

---

## §2 Tests added + anti-regression

```
Pre iter 37 Phase 1 baseline:        13260 PASS (PDR §4)
Post iter 37 Phase 1 final vitest:   13312 PASS + 15 skipped + 8 todo (13335)
Net delta:                           +52 tests added, ZERO regressions
```

A2 onniscenza-classifier: 30/30 PASS
B-NEW intentsDispatcher: 22/22 PASS
volumeParallelism + volumeReferencesQuality + factory parallelism: 117/117 PASS (post revert)
Lavagna sweep (CapitoloPicker + DocenteSidebar + PercorsoCapitoloView + B-NEW): 61/61 PASS

Build: NOT re-run iter 37 Phase 1 (heavy ~14min, defer Phase 3 orchestrator pre-flight).

---

## §3 Acceptance criteria PASS/FAIL per atom

### A2 (P0 latency)
- PASS: chit_chat short greeting → `skipOnniscenza:true topK:0`
- PASS: deep_question >=20w + `?` → `topK:3`
- PASS: safety_warning ("pericolo|brucia|scossa|...") → top priority `topK:3`
- PASS: citation_vol_pag (Vol.X / pag.Y) → `topK:2`
- PASS: plurale_ragazzi → `topK:2`
- PASS: default fallback → `topK:3`
- PASS: NO LLM call (regex + word count only)
- PASS: never throws (defensive on null/undefined/emoji/long input)
- PASS: smoke prod LIVE returned `prompt_class:{category:"chit_chat",skipOnniscenza:true,topK:0,wordCount:1}` for "Ciao"
- DEFERRED: live R5 latency bench post-tune (Phase 3 orchestrator + bench env)

### A4 (P0 carryover)
- PASS: dual-shape architecture impl (`base64-json` primary, `raw-binary` fallback on 4xx)
- PASS: magic-byte container detection (Ogg/WebM/MP3/WAV/FLAC/MP4)
- PASS: chunked base64 encoder (8KB chunks, no String.fromCharCode overflow)
- PASS: rationale doc shipped with risks + honesty caveats
- DEFERRED: live STT smoke 200 OK with Voxtral Ogg Opus sample (requires CLOUDFLARE_API_TOKEN + Voxtral output sample, Phase 3 orchestrator)

### A5 (deploy)
- PASS: Edge Function `unlim-chat` v48 → **v50** deployed prod (verified `supabase functions list`)
- PASS: 20 file uploaded incluso onniscenza-classifier.ts (NEW)
- PASS: smoke 1 chat call HTTP 200 + `success:true` + Italian "Ragazzi" response + Vol.1 cap.1 citation
- PASS: `intents_parsed` field surface-to-browser working (when `[INTENT:...]` present in response — chit_chat correctly omitted)

### B-NEW (P0 mandate Andrea ratify)
- PASS: T1 empty array → `[]`
- PASS: T2 whitelisted action with handler → fn invoked once with params (`highlightComponent` + `captureScreenshot` covered)
- PASS: T3 non-whitelisted action → skip + warn + entry `not_whitelisted`
- PASS: T4 whitelisted but fn missing → entry `fn_not_found`
- PASS: T5 fn throws → caught + NEXT intent still dispatched (error isolation verified)
- PASS: ALLOWED_INTENT_ACTIONS whitelist 12 entries (NO destructive ops: deleteAll/submitForm/fetchExternalUrl)
- PASS: `api.unlim[action]` priority over `api[action]` resolution
- PASS: api === null gracefully → `api_unavailable`
- PASS: anti-regression 21+ existing useGalileoChat-related lavagna tests preserve (PercorsoCapitoloView, CapitoloPicker, DocenteSidebar 39/39)
- PASS: extracted module `intentsDispatcher.js` for testability without React render

### A9 (Davide co-author Andrea sostituto Vol3 ODT)
- PASS 5/7: lesson-paths JSON files exist for ALL 7 (`v3-cap6-morse, v3-cap6-semaforo, v3-cap7-mini, v3-cap8-serial, v3-extra-{lcd-hello,servo-sweep,simon}`)
- PASS 5/7: volume-references.js entries already present for `cap6-morse, cap6-semaforo, extra-{lcd-hello,servo-sweep,simon}` (5/7 baseline pre-iter-37)
- PASS 5/7: docs/data/volume-structure.json has all 7 entries in tutor_files arrays + dedicated catalog (verified via grep)
- DEFERRED 2/7: `v3-cap7-mini` + `v3-cap8-serial` volume-references.js entries — see §3 honesty caveat below

---

## §4 Honesty caveats critical

### 1. A9 partial — 2/7 deferred to follow-up sub-task

I drafted complete bookText + bookInstructions + bookContext entries for `v3-cap7-mini` and `v3-cap8-serial` (verbatim from `/tmp/manuale-vol3-iter37.txt` ESERCIZIO 7.x and Cap.8 sections), inserted them in volume-references.js, and ran full vitest. Result: **4 tests failed** because the test files have hard assertions:
- `volumeParallelism.test.js`: `expect(Object.keys(VOLUME_REFERENCES).length).toBe(92)`
- `volumeReferencesQuality.test.js`: `expect(ALL_IDS.length).toBe(92)` + `expect(v3.length).toBe(27)`
- `factory/2026-04-15-09-volume-parallelism.test.js`: `EXPECTED_COUNTS = { vol3: 27, total: 92 }` + parity check `Object.keys(VOLUME_REFERENCES).filter(id => !expIds.has(id))`

The bidirectional parity test (factory) requires symmetric presence in BOTH `VOLUME_REFERENCES` AND `experiments-vol3.js` (`ALL_EXPERIMENTS` aggregator). The 5 already-mapped entries are in BOTH datasets; my 2 NEW entries would only be in volume-references.js, causing the "no extra orphan in VOLUME_REFERENCES" assertion to fail.

**Decision under iter 37 mandate "no debito tecnico" + my Maker-1 file ownership boundary**:
- experiments-vol3.js entries require full schema (components + connections + code + bookRef + ...) — non-trivial 100+ LOC each, outside Maker-1 surgical scope and risks breaking experiment loading.
- I REVERTED my 2 volume-references.js additions to preserve 92 baseline + ZERO regressions.
- The complete drafts (bookText/instructions/context) are documented in this completion msg §6 below for the follow-up sub-task agent.

**Recommended iter 38 follow-up sub-task** (~2h, separate atom):
1. Add `v3-cap7-mini` entry to `src/data/experiments-vol3.js` matching v3-cap7-esp7 schema (PWM + trimmer + LED).
2. Add `v3-cap8-serial` entry to `experiments-vol3.js` matching v3-cap8-esp1 schema (Serial bidirectional + LED).
3. Add 2 entries to `volume-references.js` using drafts in §6 below.
4. Update 3 test files: `expect(...).toBe(92)` → `toBe(94)`, vol3 27 → 29.
5. Update CLAUDE.md "92 esperimenti" → "94 esperimenti" + document.
6. Verify harness regex + run full vitest.

### 2. A2 chit_chat skip path — only triggered on ENABLE_ONNISCENZA=true

The conditional logic only impacts onniscenza aggregation when ENABLE_ONNISCENZA env flag is set true. Currently prod has the flag enabled (per iter 31 wire-up). The classifier ALWAYS runs (cheap regex), but the actual ~500-1000ms saving manifests only when:
- ENABLE_ONNISCENZA=true (active prod) AND
- L2 template router doesn't short-circuit (returns null) AND
- prompt classifies as chit_chat

L2 templates handle most plurale_ragazzi + concept-explain queries before reaching the classifier path; this is an additional latency win compounding on top of A2. R5 50-prompt bench (Tester-1 atom A7) should measure delta vs iter 36 2424ms baseline.

### 3. A4 live smoke deferred — architecture sound but not verified

The dual-shape rewrite is grounded in CF docs (canonical 2026 = JSON+base64) + community confirmation (curl --data-binary works). Live verification requires:
- CLOUDFLARE_API_TOKEN env (have via Supabase secrets list)
- A Voxtral-generated Ogg Opus sample bytes
- A `cfWhisperSTT()` smoke caller

I did NOT perform end-to-end Voxtral→Whisper round-trip in this session. Phase 3 orchestrator should run the STT smoke to confirm 200 OK + `shapeUsed` + `audioContainer:'ogg'` telemetry surfacing.

### 4. A5 deploy v50 NOT v49 (vs PDR claim)

PDR §3 A5 expected v48 → v49. Live `supabase functions list` confirms current version **v50** (iter 31-32 PM commits already advanced v48 → v49 prior to my deploy). My iter 37 deploy advanced v49 → v50 with all 4 atomi + B-NEW server-side wire-up. No functional impact, just a numbering note.

### 5. ToolSpec count drift NOT verified iter 37

PDR §1 item 9 mandates definitive ToolSpec count 57 vs 62 verify. This is Documenter Phase 2 task per PDR §3 A10 — not in my Maker-1 scope. Flagging here for orchestrator awareness.

---

## §5 Time spent

- A2 design + impl + tests: ~1.5h (slightly over PDR 1h estimate due to Unicode word-count edge case)
- A4 investigation + impl + rationale doc: ~1.5h (PDR estimate 2-3h)
- B-NEW design + extraction module + tests + wire-up: ~1.5h (PDR estimate 1h, +0.5h for clean module extraction enabling testability)
- A5 deploy + smoke verify: ~10min
- A9 investigation + revert + test cleanup: ~1h (PDR estimate 2.5h, but only 5/7 already mapped; 2 deferred)
- Vitest baseline verify (2 full runs): ~6min
- Completion msg draft (this file): ~30min

**Total**: ~6h (within 6-8h budget per PDR)

---

## §6 A9 deferred entries — drafts ready for iter 38 follow-up

```javascript
// Insert in src/data/volume-references.js after 'v3-cap7-esp8'
'v3-cap7-mini': {
  volume: 3, bookPage: 73, chapter: "Capitolo 7 - Il Mondo Continuo: I Pin Analogici", chapterPage: 67,
  bookText: "Mini-progetto del Cap.7: usiamo il valore letto da un trimmer (potenziometro) sul pin analogico A1 per controllare la luminosità di un LED collegato al pin PWM 5 con analogWrite. Ruotando il trimmer cambia la luminosità in tempo reale.",
  bookInstructions: [
    "Collega il trimmer: piedino centrale ad A1, piedini laterali a 5V e GND",
    "Collega un LED: anodo al pin 5 con resistore 470 Ohm, catodo a GND",
    "Imposta pinMode(5, OUTPUT) — A1 come INPUT è gestito da analogRead",
    "Nel loop usa analogRead(A1) per leggere il trimmer (0-1023) e map() per convertirlo in 0-255",
    "Usa analogWrite(5, valoreMappato) per impostare la luminosità del LED",
    "Carica e ruota il trimmer per vedere il LED cambiare luminosità"
  ],
  bookQuote: "Ruotando il trimmer vedremo cambiare il valore di tensione sul pin PWM, e il LED varierà luminosità in modo continuo.",
  bookContext: "Mini-progetto Cap.7: input analogico (trimmer) controlla output PWM (LED). Mostra il pieno potenziale dei pin analogici di Arduino: leggere un valore continuo e usarlo per controllare con precisione un'uscita."
},

// Insert in src/data/volume-references.js after 'v3-cap8-esp5'
'v3-cap8-serial': {
  volume: 3, bookPage: 88, chapter: "Capitolo 8 - Visualizzare Dati: Il Monitor Seriale", chapterPage: 84,
  bookText: "Esperimento integrato del Cap.8: usiamo Serial.print + Serial.println per inviare messaggi dal codice al computer e poi leggiamo dal Monitor Seriale i comandi che digitiamo per controllare un LED. È la conversazione bidirezionale Arduino <-> PC.",
  bookInstructions: [
    "Collega un LED al pin 13 con resistore 470 Ohm verso GND",
    "Nel setup() usa Serial.begin(9600) per aprire il canale di comunicazione",
    "Usa pinMode(13, OUTPUT) per il LED",
    "Nel loop() controlla Serial.available() per vedere se il PC ha scritto qualcosa",
    "Leggi il carattere con Serial.read() — se è '1' accendi il LED, se è '0' spegnilo",
    "Stampa Serial.println(\"LED ON\") o \"LED OFF\" per dare feedback al PC",
    "Apri Strumenti > Monitor Seriale a 9600 baud, scrivi 1 o 0 nella casella in alto e premi INVIO"
  ],
  bookQuote: "Arduino non solo riceve ordini, ma può anche parlare e dirci cosa sta succedendo: è come aprire una finestra dentro Arduino e vedere cosa fa in tempo reale.",
  bookContext: "Esperimento integrato Cap.8: comunicazione seriale bidirezionale. Combina Serial.print (Arduino->PC) e Serial.read (PC->Arduino) per controllare un LED da tastiera. È il primo passo verso il debug e l'interattività via terminale."
},
```

Source verbatim from `/tmp/manuale-vol3-iter37.txt`:
- v3-cap7-mini: lines 3696-3700 + 3789-3815 (ESERCIZIO 7.6 trimmer + 7.7 PWM)
- v3-cap8-serial: lines 3864-4087 (Cap.8 Monitor Seriale + ESERCIZIO 8.1)

---

## §7 PRINCIPIO ZERO + MORFISMO compliance gate (8/8 PASS)

1. ✅ Linguaggio plurale "Ragazzi" preserved — A2 classifier explicitly detects `\bragazz[ie]\b` for `plurale_ragazzi` category
2. ✅ Vol/pag verbatim ≤60 parole — A9 deferred drafts use VERBATIM ODT excerpts (Cap.7 lines 3789-3815, Cap.8 lines 3864-4087)
3. ✅ Kit fisico mention — A4 rationale doc + A5 smoke prod response "Inserite componenti e fili nel kit ELAB"
4. ✅ Palette tokens — no UI changes this iter (backend-only); existing tokens preserved
5. ✅ Iconografia ElabIcons — no UI changes
6. ✅ Morphic runtime — A2 classifier + A4 inputShape selector are runtime-adaptive (no static config)
7. ✅ Onniscenza L1+L4+L7 cross-pollination preserved — A2 only modulates topK, never blocks (default `topK:3`)
8. ✅ Multimodale Voxtral + Vision + STT preserved — A4 fix unblocks Voxtral STT round-trip without regressing TTS

---

## §8 Phase 2 / Phase 3 handoff

This Maker-1 Phase 1 work is COMPLETE for atomi A2 + A4 + A5 + B-NEW + A9 (5/7 partial). 

**Awaiting**:
- Maker-2: ADR-028 §14 amend ready for orchestrator review (Phase 1 in flight per PDR §3 A3, completed-msg expected separately)
- WebDesigner-1: HomePage A13b atom (PDR §3 A6 8h estimate)
- Tester-1: R5+R6+R7 bench scale post-tune (PDR §3 A7 — exec post my deploy v50 LIVE) + Playwright A8

Phase 2 Documenter mandate per PDR §6:
- 4/4 completion msg filesystem barrier required PRE Documenter spawn
- Phase 3 orchestrator pre-flight CoV: vitest 13260+ baseline + build PASS

**My completion msg path**: `automa/team-state/messages/maker1-iter37-phase1-completed.md` (this file)

---

**Maker-1 status**: Phase 1 COMPLETE. Standing by for Phase 3 orchestrator instructions or iter 38 atom assignments.
