---
id: ADR-019
title: Sense 1.5 Morfismo runtime — adattabilità docente + classe + UI/funzioni/finestre
status: ACCEPTED
status_history:
  - PROPOSED (2026-04-28 iter 12 PHASE 1)
  - ACCEPTED (2026-05-15 iter 63 entrance — `aggregateOnniscenza` LIVE prod iter 31 commit b0c2a96 via `supabase/functions/_shared/onniscenza-bridge.ts:299`; ratify de jure aligning status with de facto production state, debito documentale chiuso)
date: 2026-04-28
ratified_date: 2026-05-15
deciders:
  - architect-opus (Sprint S iter 12 PHASE 1, Pattern S 5-agent OPUS) — design
  - Andrea Marro (final approver iter 63 entrance — Sense 1.5 already LIVE prod via aggregateOnniscenza wire-up iter 31, formal ratify closes status mismatch)
extended_by:
  - ADR-049 (Sense 1.6 — 10 nuove dimensioni context Andrea mandate iter 62 PM: insegnante storico + sessioni passate + chat + voce + movimenti lavagna + errori ricorrenti + tempo disponibile + esperimento scelto + livello autonomia + materiale presente classe)
context-tags:
  - sprint-s-iter-12
  - morfismo-sense-1.5
  - runtime-adaptation
  - teacher-memory
  - class-memory
  - lim-resolution-detection
  - principio-zero-v3
  - dual-moat
related:
  - CLAUDE.md §0 lines 27-58 (Sense 1.5 canonical definition iter 10)
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §0.2 Morfismo DUAL+SENSE 1.5
  - docs/pdr/sprint-S-iter-12-contract.md §1 ATOM-S12-A5
  - ADR-008 (buildCapitoloPromptFragment design) — Vol/pag verbatim citazioni invariante
  - ADR-009 (Principio Zero validator middleware) — V3 plurale Ragazzi + ≤60 parole
  - ADR-013 (ClawBot composite handler L1 morphic) — funzioni morfiche capacity layer
  - ADR-015 (Hybrid RAG retriever BM25+dense+RRF+rerank) — retrieval focused chapter context
  - ADR-016 (TTS Isabella WebSocket Deno migration) — voce narratore italiano invariante registro
input-files:
  - src/services/unlimContextCollector.js (target NEW or extend, runtime context layer)
  - src/services/unlimMemory.js (existing 3-tier memory, extend teacher + class slot)
  - supabase/functions/_shared/rag.ts (chapter-focused retrieval already capitolo-aware)
  - src/components/lavagna/ (LavagnaShell + RetractablePanel + FloatingToolbar — morphic UI host)
  - src/components/Header/AppHeader.jsx (resolution detection injection point)
output-files:
  - docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md (THIS file, NEW)
  - Future iter 13+: src/services/unlimContextCollector.js (NEW ~400 LOC, runtime detection layer)
  - Future iter 13+: supabase migrations `teacher_memory` + `class_memory` tables
  - Future iter 14+: src/services/morphicLayout.js (NEW ~300 LOC, LIM resolution + mode UI scaling)
---

# ADR-019 — Sense 1.5 Morfismo runtime adattabilità docente + classe + UI/funzioni/finestre

> Codificare il **Morfismo Sense 1.5** come livello architetturale runtime di ELAB Tutor: stesso prodotto, forma adattata per **docente specifico** (linguaggio Italiano scuola pubblica plurale "Ragazzi" INVARIANTE + dettagli adattati a memoria docente per nome + storia lezioni + stile rilevato), per **classe specifica** (età 8-14 + livello competenza + kit dotazione + capitolo corrente + LIM/iPad config), tramite **funzioni morfiche** (stesse capacity highlight/mountExperiment/captureScreenshot, presentazione adattiva contesto lezione frontale vs analisi puntuale), **finestre morfiche** (risoluzione LIM 65"-86" 1080p/4K + mode active + touch/voice + stato sessione), **toolbar morfica** (4 strumenti core + AI command bar UNLIM), **mascotte UNLIM finestra morfica** (posizione/dimensione/stato adatta workflow), **quick-access pannelli docente** (esperienza accumulata → shortcut frequenti). NOT preferenze utente generiche → MORFISMO automatico runtime apprendimento.

---

## 1. Contesto

### 1.1 Stato Sense 1.5 iter 10 → iter 12 close

CLAUDE.md §0 (lines 27-58, iter 10 estensione 2026-04-27) ha consolidato la definizione di Sense 1.5 come "Adattabilità docente + classe + UI/funzioni" articolata su 3 sotto-categorie:

- **A. Per docente specifico**: linguaggio INVARIATO scuola pubblica plurale + memoria docente + stile rilevato
- **B. Per contesto classe**: età + livello + kit + capitolo + numero alunni/dispositivi
- **C. Morfismo funzionale + UI/finestre (NEW iter 10)**: funzioni morfiche + finestre morfiche + toolbar morfica + mascotte UNLIM finestra morfica + quick-access + layout adattivo

PDR Sprint S §0.2 (2026-04-28) e iter-12-contract §1 ATOM-S12-A5 hanno confermato Sense 1.5 come **fondazione iter 12** richiedendo un ADR codifica esplicita prima di implementare il context layer runtime in `src/services/unlimContextCollector.js` (ATOM future iter 13+).

### 1.2 Perché ADR adesso (iter 12 PHASE 1)

Tre motivi cogenti:

1. **Rischio drift implementativo**: senza ADR codifica esplicita, gli agenti gen-app-opus + gen-test-opus (Pattern S 5-agent) implementano Sense 1.5 con interpretazioni divergenti (es. "preferenze utente generiche" tipo theme dark/light invece di MORFISMO automatico runtime apprendimento). PDR §0.2 reject criteria pre-merge richiede contributo S1 morfico runtime adattivo + S2 triplet coerenza materiale → necessario riferimento canonico.
2. **Schema dati Supabase pre-allineamento**: `teacher_memory` + `class_memory` tables future iter 13+ devono allinearsi al modello Sense 1.5. Senza ADR pre-design, schema iter 13 = guesswork.
3. **Dual MOAT enforcement**: Sense 1.5 = differenziatore tecnico INTERNO. Tinkercad/Wokwi/LabsLand static-config + UI fissa per tutti utenti. ELAB morfico runtime self-adapting = moat 2026+. Codifica ADR rende l'invariante difendibile (audit + iter close + handoff cite).

### 1.3 Vincoli invarianti (NON negoziabili da Sense 1.5)

Sense 1.5 adatta **dettagli + presentazione + UI**, NON gli invarianti Principio Zero V3:

- Linguaggio plurale "Ragazzi," + dettagli rivolti TUTTA classe + docente — INVARIANTE
- Citazione VERBATIM Vol/pag (NO parafrasi) — INVARIANTE
- ≤60 parole risposta UNLIM — INVARIANTE
- Mai imperativo verso docente ("fai questo" vietato) — INVARIANTE
- Voce Isabella italiana registro narratore volumi — INVARIANTE (ADR-016)

Ciò che adatta è il **contesto + densità + dettaglio + posizione UI + sequenza presentazione**, non il registro linguistico.

### 1.4 Test Morfismo iter 10 (CLAUDE.md line 56)

> Stesso esperimento aperto da 2 docenti diversi su stessa LIM = layout/funzioni/finestre adattate identità + storia ciascuno. Non è "preferenze utente" generiche → è MORFISMO automatico runtime apprendimento.

Questo test definisce l'accettazione criterio Sense 1.5: se l'esperienza è identica per due docenti diversi, Sense 1.5 è violato.

---

## 2. Decision

### 2.1 Architettura runtime Sense 1.5 — 4 livelli

**Livello 1: Context Collection (runtime detection)**

`src/services/unlimContextCollector.js` (NEW ~400 LOC, ATOM iter 13+) raccoglie ad ogni interazione UNLIM 8 dimensioni di contesto:

```js
{
  teacher: {
    id: string,                          // Supabase teacher_memory.id (UUID)
    name: string,                        // mostrato in saluti UNLIM
    experienceLevel: 'novice'|'mid'|'expert', // rilevato pattern interazioni
    sessionsCount: number,               // memoria storica
    explainedConcepts: string[],         // concepts già coperti (NO ripeti)
    detectedStyle: 'verifier'|'narrator'|'doer', // pattern rilevato
    quickAccessShortcuts: ToolSpec[]     // top 5 frequenti
  },
  class: {
    id: string,                          // Supabase class_memory.id
    ageBand: '8-10'|'11-13'|'14',
    competenceLevel: 0..10,              // analisi sessioni passate
    kitDotazione: 'omaric-base'|'omaric-advanced'|'custom',
    currentChapter: { volume: 1|2|3, capitolo: number, page: number },
    deviceConfig: 'lim-only'|'lim+ipad'|'mixed',
    studentsCount: number
  },
  device: {
    limResolution: '1080p'|'4k',
    screenSizeInches: number,             // 65|75|86 typical
    inputMode: 'touch'|'mouse'|'voice'
  },
  session: {
    mode: 'lezione-frontale'|'lavagna-libera'|'dashboard'|'esperimento',
    phase: 'intro'|'costruzione'|'verifica'|'report'
  }
}
```

Detection runtime:
- LIM resolution: `window.matchMedia('(min-resolution: 192dpi)')` + screen.width
- Input mode: `pointer:coarse` media query + `webkit-touch-callout` capability
- Device config: heuristic via user agent + window.innerWidth >= 2560 = LIM
- Session phase: derived da current route + active component state machine

**Livello 2: Morphic Functions (capacity adapters)**

Stesse capacity OpenClaw (52→80 ToolSpec, ADR-013), MA invocazione + presentazione adattate `session.mode + session.phase + device.limResolution`:

| Capacity | Lavagna lezione frontale | Dashboard analisi puntuale |
|----------|--------------------------|---------------------------|
| highlight | grosso colorato 8px stroke + animation 1s glow (visibilità LIM 5m) | subtle inline 2px + tooltip on hover |
| mountExperiment | full-screen overlay + voice narration step-by-step | sidebar panel + expand on click |
| captureScreenshot | annotation toolbar prominent (docente disegna live) | thumbnail saved silent + report aggregator |
| postToVision | UNLIM mascotte parla risultato voce + finestra morfica grande | inline JSON expanded + log entry |
| readVolumePage | TTS Isabella + scroll auto sync evidenziato | text-only quote + click to expand |

Lookup table morphic in `src/services/morphicFunctions.js` (NEW ~250 LOC, ATOM iter 14+).

**Livello 3: Morphic Windows (UI scaling)**

`src/services/morphicLayout.js` (NEW ~300 LOC, ATOM iter 14+) calcola runtime:

- **Font scaling**: 1080p LIM 65" → base 18px, 4K LIM 86" → base 24px
- **Component sizing**: touch-mode → minimum 44px tap target (WCAG AAA), mouse-mode → 32px
- **Window prominence**: matrix mode × phase → quale pannello full-screen vs minimizzato vs hidden
- **Mascotte UNLIM finestra**: position bottom-right (Lavagna lezione) vs top-left (Dashboard) vs floating-center (Esperimento step intro), dimensione 180px (analisi) vs 280px (lezione frontale)
- **Toolbar prominence**: 4 strumenti core (Pen/Wire/Select/Delete) sempre visibili, AI command bar grande in Lavagna lezione, compatto in Dashboard

Layout scaling base CSS custom properties:
```css
--morphic-base-font: var(--lim-resolution-1080p, 18px);
--morphic-tap-target: var(--input-mode-touch, 44px);
--morphic-mascotte-size: var(--session-mode-frontale, 280px);
```

**Livello 4: Persistence (Supabase memory)**

Schema dati 2 nuove tabelle Supabase iter 13+:

```sql
CREATE TABLE teacher_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_uuid TEXT NOT NULL,                  -- localStorage elab_anon_uuid
  display_name TEXT,
  experience_level TEXT CHECK (experience_level IN ('novice','mid','expert')),
  sessions_count INT DEFAULT 0,
  explained_concepts JSONB DEFAULT '[]',
  detected_style TEXT,
  quick_access_shortcuts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key TEXT NOT NULL UNIQUE,           -- localStorage class_key (S1 pattern)
  age_band TEXT,
  competence_level NUMERIC(3,1) CHECK (competence_level BETWEEN 0 AND 10),
  kit_dotazione TEXT,
  current_chapter JSONB,                    -- {volume, capitolo, page}
  device_config TEXT,
  students_count INT,
  sessions_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS policies: aperte client-side (pattern S1 senza Supabase Auth) + service-role read/write Edge Function unlim-chat.

### 2.2 Algoritmo runtime adattamento (per chiamata UNLIM)

```
1. unlimContextCollector.collect() → context object 8 dimensioni
2. Send context con ogni unlim-chat invocation (header X-ELAB-Context base64)
3. Edge Function unlim-chat:
   a. Parse context
   b. RAG retrieval focused class.currentChapter (ADR-015 chapter filter)
   c. System prompt enrich:
      - "Docente {teacher.name}, {teacher.experienceLevel}"
      - "Classe {class.ageBand}, livello {class.competenceLevel}"
      - "Kit {class.kitDotazione}, capitolo {class.currentChapter}"
      - "Concepts già coperti NO ripetere: {teacher.explainedConcepts}"
   d. Linguaggio Italiano scuola pubblica plurale "Ragazzi" — INVARIANTE prompt
   e. ≤60 parole — INVARIANTE prompt
4. Response → client morphicFunctions.adaptResponse(context, llmResponse)
   - Adapter sceglie presentazione capacity per session.mode
5. UI render via morphicLayout.computeStyles(context)
   - CSS variables aggiornate runtime
6. Post-render telemetry: detect docente style pattern (es. apertura sempre "verifichiamo componenti"), aggiorna teacher_memory.detected_style
7. Persist: teacher_memory + class_memory updates async via Supabase RPC
```

### 2.3 Test acceptance Sense 1.5

Test integration iter 14+ (Playwright):

```
Test 1: stesso esperimento Vol1Cap6Esp1 aperto da docente A (experience=novice) e docente B (experience=expert) su stessa LIM 65" 1080p:
- A: highlight grosso 8px + analogie esplicite + 3 esempi base + repeat key concept 2× + slow voice TTS
- B: highlight 4px + meno analogie + 1 esempio + advanced spunti + faster voice TTS
- INVARIANTE entrambi: "Ragazzi," apertura + Vol.1 pag.42 verbatim + ≤60 parole

Test 2: stessa classe stesso esperimento Lavagna vs Dashboard:
- Lavagna: full-screen overlay + voice narration + mascotte 280px bottom-right
- Dashboard: sidebar panel + text-only + mascotte 180px top-left
```

Pass criteria: differenza misurabile presentazione + invariante linguaggio = Morfismo automatico VERIFIED.

---

## 3. Consequences

### 3.1 Positive

1. **Differenziatore competitivo codificato**: Sense 1.5 = INTERNO moat documentato. Audit pre-merge cite ADR-019 reject feature non-morfica.
2. **Schema dati pre-allineato**: teacher_memory + class_memory pre-design evita refactor iter 14+. Pattern S1 anonimo UUID localStorage estendibile.
3. **Test Morfismo automatizzabile**: integration test 2-docenti acceptance criterion = oggettivo (NO judgment soggettivo).
4. **Principio Zero V3 protetto**: invarianti linguaggio esplicitati Livello 1 (system prompt enrich) → impossibile violazione cross-docente accidentale.
5. **Foundation iter 13+ Sprint T**: Sense 1.5 + Box 1+3 redefine + 28 ToolSpec expand = 3 pilastri Sprint S close 10/10 ONESTO.
6. **Mascotte UNLIM consistency**: posizione/dimensione/stato deterministico runtime context, NO drift visivo cross-componente.

### 3.2 Negative

1. **Effort iter 13-14**: ~700 LOC nuovi (unlimContextCollector + morphicFunctions + morphicLayout) + 2 Supabase migrations + ~150 LOC test integration. Total ~12-15h dev iter 13-14 background.
2. **Privacy concern teacher_memory**: docenti italiani scuola pubblica = dati personali GDPR. `display_name` + `detected_style` + `sessions_count` richiedono consenso esplicito + RTBF (right-to-be-forgotten) cancellazione su richiesta. Iter 13 P0 deve includere GDPR card schema documentation.
3. **Detection runtime accuracy**: detected_style pattern detection = euristica imprecisa. Falsi positivi (es. docente novice marked expert) = degrade esperienza. Mitigazione: confidence threshold + manual override toggle UI iter 14+.
4. **LIM resolution detection unreliable**: media query `min-resolution: 192dpi` non discrimina sempre 4K LIM da 4K monitor desktop. Mitigazione: prompt one-time "Configurazione LIM" iter 14 al primo lancio (one-shot, persistente).
5. **System prompt growth**: enrich context aggiunge ~200 token system prompt per request → cost cumulato +€0.0003/session × scale. Tollerabile a budget €50/mese (PDR Master), ma monitorare.

### 3.3 Risks

1. **Drift "preferenze utente" anti-pattern**: developer junior potrebbe interpretare Sense 1.5 come "settings page con dark mode + font size". MITIGATION: ADR cita Test Morfismo line 56 CLAUDE.md + reject criteria pre-merge (architect-opus PR review block).
2. **Memory schema migration cost iter 14+**: se schema teacher_memory cambia post-deploy = data loss. MITIGATION: schema versioning column `schema_version INT` + migration scripts forward-only.
3. **Context payload size**: 8 dimensioni × N field = ~2KB JSON payload header. HTTP/2 header compression mitiga, ma se cresce 10×+ richiede body POST. MITIGATION: monitor X-ELAB-Context header size benchmark iter 14.
4. **A/B testing Morfismo regressions**: cambio adapter `highlight` Lavagna potrebbe rompere docenti già abituati. MITIGATION: feature flag `morphic-functions-v2` rollout progressivo + telemetry success rate.

---

## 4. Alternatives Considered

### 4.1 Static-config (REJECTED — Tinkercad/Wokwi pattern)

Settings page docente → toggle "modalità Lavagna" / "modalità Dashboard" → CSS theme statico. UI fissa per tutti utenti.

**Why rejected**: viola CLAUDE.md line 58 "Differenziatore vs static-config competitor". Sense 1.5 = morfico runtime self-adapting NON config dialog. Test Morfismo line 56 fallirebbe (2 docenti = stessa esperienza con stesso config).

### 4.2 Preferences-based user settings (REJECTED — Generic UX pattern)

Profile docente → settings page (font size + layout density + voice speed + theme). Memorizzato Supabase user preferences. Applicato runtime via CSS variables.

**Why rejected**: generic UX pattern NON Morfismo. Adatta SOLO ciò che docente esplicitamente sceglie, NON apprende automatico runtime. Differenza chiave Sense 1.5 line 56: "MORFISMO automatico runtime apprendimento" — sistema rileva pattern, non chiede.

### 4.3 LLM-only adaptation via prompt engineering (REJECTED — Insufficient depth)

Tutto adattamento delegato a system prompt LLM ricco. NO context collector layer + NO morphicFunctions + NO morphicLayout. UI invariata, solo testo response cambia.

**Why rejected**: viola Sense 1.5 §C iter 10 "Funzioni morfiche + Finestre morfiche + Toolbar morfica + Mascotte morfica + Layout adattivo". Adattamento DEVE essere multi-livello (linguaggio + UI + funzioni + finestre + layout), non solo testo.

### 4.4 Hardcoded if-else per role (REJECTED — Anti-scaling)

Codice tipo `if (teacher.role === 'novice') { showAnalogies = true }` sparso applicazione.

**Why rejected**: anti-scaling. 8 dimensioni × N capacity × M mode = combinatorial explosion. Lookup table dichiarativa morphicFunctions + computed CSS morphicLayout = single source of truth + auditable.

---

## 5. References

- CLAUDE.md (2026-04-27 iter 10), §0 Sense 1.5 lines 27-58 canonical definition
- docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md, §0.2 Morfismo DUAL+SENSE 1.5 + §1.1 box scoring + §2.1 path 9.30→10
- docs/pdr/sprint-S-iter-12-contract.md, §1 ATOM-S12-A5 file ownership architect-opus + §2 RIGID write exclusive
- ADR-008 — buildCapitoloPromptFragment (Vol/pag verbatim invariant)
- ADR-009 — Principio Zero validator middleware (V3 plurale Ragazzi + ≤60 parole)
- ADR-013 — ClawBot composite handler L1 morphic (52→80 ToolSpec capacity layer)
- ADR-015 — Hybrid RAG retriever BM25+dense+RRF+rerank (chapter-focused retrieval)
- ADR-016 — TTS Isabella WebSocket Deno migration (voce narratore italiano invariante)
- W3C Media Queries Level 4 (2024). https://www.w3.org/TR/mediaqueries-4/ (pointer + min-resolution detection)
- WCAG 2.1 AAA tap target 44×44 CSS pixels (2018). https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Supabase RLS docs (2026). https://supabase.com/docs/guides/auth/row-level-security
- ELAB session-summaries.md S1 Supabase Dashboard 04/04/2026 (Pattern S1 anonimo UUID localStorage)

---

## 6. Sign-off

- architect-opus iter 12 PHASE 1: PROPOSED ⏳
- Andrea Marro final approver: pending teacher_memory + class_memory schema review + LIM resolution detection runtime ratify
- Foundation iter 13+: Sense 1.5 implementation atoms (unlimContextCollector + morphicFunctions + morphicLayout + Supabase migrations)
- Test acceptance: integration test 2-docenti stesso esperimento differenza misurabile presentazione + invariante linguaggio Principio Zero V3

— architect-opus iter 12, 2026-04-28. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation.
