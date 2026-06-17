---
id: ADR-049
title: Sense 1.6 Morfismo extended runtime — 10 nuove dimensioni context docente/classe/sessione
status: PROPOSED
date: 2026-05-15
deciders:
  - Claude Opus 4.7 (iter 63 entrance — author skeleton per Andrea Q4 delega "ricerca tu, minimizza debito tecnico, max qualità beneficio")
  - Andrea Marro (final approver per schema extension + runtime collection + GDPR teacher_history_log)
extends:
  - ADR-019 (Sense 1.5 Morfismo runtime docente/classe — ACCEPTED 2026-05-15 iter 63 ratify)
context-tags:
  - iter-63
  - sprint-V-or-W
  - morfismo-sense-1.6
  - runtime-adaptation-extended
  - teacher-history-log
  - class-session-metadata
  - voice-movement-tracking
  - errore-ricorrente-pattern
  - tempo-disponibile-adapter
  - principio-zero-v3
  - gdpr-minors-art-8
  - dual-moat
related:
  - ADR-019 (Sense 1.5 4-level Context/Functions/Windows/Persistence — baseline che 1.6 estende)
  - ADR-009 (Principio Zero validator V3 plurale Ragazzi + ≤60 parole + Vol/pag verbatim INVARIANTI iter 63)
  - ADR-013 (ClawBot composite handler L1 morphic capacity layer — Sense 1.6 ortogonale)
  - ADR-024 (onniscenza-bridge LIVE iter 24 commit b0c2a96 — sostrato implementazione Sense 1.6 estensione)
  - ADR-028 (INTENT dispatcher server-side — surface-to-browser pattern preservato Sense 1.6)
  - ADR-046 (Percorso lezione personalizzata onniscenza wire-up frontend — first Sense 1.5 consumer iter 45)
  - ADR-047 (Narrative arc canon Tea schema adoption — Sense 1.6 dim 9 "esperimento scelto" leverages narrative_map.json)
input-files:
  - supabase/functions/_shared/onniscenza-bridge.ts (LIVE iter 31 — aggregateOnniscenza entry point, EXTEND con 10 nuove dimensioni)
  - src/services/unlimContextCollector.js (existing iter 14+ — collectFullContext circuit+code+compilation+step+errors+pinStates, EXTEND teacher_history_log)
  - src/services/unlimMemory.js (existing 3-tier memory — EXTEND teacher + class slot iter 63 ratify queue voci 5)
  - supabase/functions/_shared/system-prompt.ts (BASE_PROMPT v3.1 iter 28 — Sense 1.6 inject teacher_style + class_competence_band)
output-files:
  - docs/adrs/ADR-049-sense-1.6-morfismo-extended-runtime-context.md (THIS file, NEW iter 63 entrance)
  - Future iter 64+: supabase/migrations/teacher_history_log + class_session_metadata + voice_movement_log + errore_ricorrente_pattern (4 NEW tabelle)
  - Future iter 64+: supabase/functions/_shared/onniscenza-bridge.ts EXTEND con 10 nuove dimensioni collectors
  - Future iter 65+: src/components/lavagna/movement-tracker.js NEW (movimenti lavagna inseriti via SVG overlay drawing path coord delta sampling)
---

# ADR-049 — Sense 1.6 Morfismo extended runtime — 10 nuove dimensioni context docente/classe/sessione

> **Estende ADR-019 Sense 1.5** (4-level architecture Context Collection + Morphic Functions + Morphic Windows + Supabase Persistence, ratificato iter 63 entrance 2026-05-15) con **10 nuove dimensioni context** che alimentano `aggregateOnniscenza` runtime per generare risposte UNLIM iper-adattate alla storia + stato lezione corrente. Mandate Andrea iter 62 PM verbatim: "insegnante + sessioni passate + chat + voce + movimenti lavagna + errori ricorrenti + tempo disponibile + esperimento scelto + livello autonomia + materiale presente classe". Sense 1.6 NON sostituisce Sense 1.5 (8 dimensioni baseline) — aggiunge 10 dimensioni STORICHE + LIVE-STATE che permettono Morfismo predittivo (anticipare nudge prima di errore docente) vs Sense 1.5 Morfismo reattivo (adattare presentazione corrente).

---

## 1. Contesto

### 1.1 Stato Sense 1.5 iter 63 entrance

ADR-019 ha codificato Sense 1.5 come 4-level runtime adattabilità con 8 dimensioni baseline (teacher + class + device + session contexts). Implementazione LIVE prod iter 31 via `supabase/functions/_shared/onniscenza-bridge.ts:299` `aggregateOnniscenza()` orchestratore parallelo (L1 RAG + L2 Wiki + L4 Sessione + L5 Lesson + L6 Chat history) wired in `unlim-chat/index.ts` Edge Function.

Quel ratificato iter 63 (status PROPOSED→ACCEPTED + `extended_by: ADR-049`) chiude debito documentale apertosi tra design Apr 28 e wire-up prod iter 31.

### 1.2 Gap Sense 1.5 → Sense 1.6 — perché 10 nuove dimensioni iter 62 PM mandate

Sense 1.5 baseline cattura **stato corrente** (chi è il docente, quale classe, quale device, quale sessione). NON cattura:

1. **Insegnante** — profilo cumulativo trans-sessione (anni esperienza, capitoli più spiegati, errori docente ricorrenti, stile rilevato pattern)
2. **Sessioni passate** — corpus narrativo cross-session per stesso docente o stessa classe (cosa è stato spiegato la lezione 6 fa, dove si è interrotti, come reagivano i ragazzi)
3. **Chat** — corpus chat history corrente DEEPER del L6 corrente (full thread + sentiment + clarification pattern)
4. **Voce** — pattern voce docente (cadenza, registro emotivo rilevato STT) + frequenza/durata utilizzo wake word
5. **Movimenti lavagna** — coord delta SVG overlay drawing paths (dove ha tracciato, intensità + velocità + zone preferite, kit zoom-in pattern)
6. **Errori ricorrenti** — pattern errori docente ricorrenti (es. dimentica sempre R220 + LED, parte sempre dal codice prima del cablaggio, salta sezione X libro)
7. **Tempo disponibile** — vincolo temporale lezione (40 min standard scuola pubblica vs 30 min ridotti, 50 min lab — UNLIM adatta sintesi/profondità)
8. **Esperimento scelto** — esperimento corrente attivo + narrative_map.json arco narrativo precedente/successivo (Tea schema canon iter 47)
9. **Livello autonomia** — rilevato dall'uso (docente lead manual full-step-by-step vs docente lascia agire UNLIM auto-mode più ampio)
10. **Materiale presente classe** — kit Omaric versione + componenti effettivamente disponibili (rilevato da sessioni passate "abbiamo solo LED rossi + 2 R220" → UNLIM evita esperimenti che richiedono componenti mancanti)

Queste 10 dimensioni trasformano Morfismo da **reattivo** (adatta presentazione del momento) a **predittivo** (anticipa nudge docente in base a pattern storico) chiudendo gap pedagogico Principio Zero V3 "docente NON tecnico ZERO panico" iter 21 mandate.

### 1.3 Perché ADR NUOVO non amend ADR-019

Tre motivi:
1. **Single-decision ADR pattern** — ADR-019 codifica Sense 1.5 4-level architecture (DESIGN architettonico baseline); Sense 1.6 = scope-extension via 10 nuove dimensioni (NUOVA architettonica decisione che si appoggia su baseline ma aggiunge superficie significativa)
2. **Amend in-place anti-pattern Godzilla ADR** — aggiungere 300+ LOC a ADR-019 (attualmente ~600 LOC) creerebbe un ADR difficile da auditare per cronologia + scope-creep ammucchiato
3. **Independent ratify** — Andrea può ratificare ADR-019 SUBITO (de facto già LIVE iter 31) e ADR-049 SEPARATAMENTE post review schema + GDPR teacher_history_log impact (vincolo legale art. 8 GDPR minori italiani richiede consenso esplicito docente per tracciamento comportamentale)

### 1.4 Precedente ADR-028 §14 amend vs nuovo ADR

ADR-028 §14 amend iter 37 (~60 LOC surface-to-browser pivot) = small scope addition within original decision boundary. ADR-049 = scope-EXTENSION significativa (4 NUOVE Supabase tabelle + 10 NUOVE collector functions + nuovo morphic-predictor.js runtime layer + GDPR consent UI) ben oltre boundary amend.

---

## 2. Decisione architetturale

### 2.1 Sintesi

Sense 1.6 estende Sense 1.5 4-level architecture con:

- **Level 1 Context Collection EXTEND**: aggiunge 10 new collectors invocati in parallelo da `aggregateOnniscenza` (parallel Promise.all per minimizzare latency p95)
- **Level 2 Morphic Functions EXTEND**: aggiunge funzione morfica `predictNextNudge(history, currentState) → NudgePrediction` (predittiva vs reattiva)
- **Level 3 Morphic Windows UNCHANGED**: scale UI runtime non cambia (LIM resolution detection già completo Sense 1.5)
- **Level 4 Supabase Persistence EXTEND**: aggiunge 4 NUOVE tabelle (`teacher_history_log` + `class_session_metadata` + `voice_movement_log` + `errore_ricorrente_pattern`) con RLS open client-side anonimo + Pattern S1 UUID localStorage convention iter 14

### 2.2 Invariante INVIOLABILE (preservato Sense 1.5)

Linguaggio Italiano scuola pubblica plurale "Ragazzi" + Vol/pag VERBATIM citazione + ≤60 parole UNLIM iter 28 cap + no imperativo singolare + Isabella voice narratore registro **NON cambia mai** per nessuna dimensione di 10 nuove. Morfismo Sense 1.6 adatta CONTENUTO predittivo + TIMING nudge + PROFONDITA' spiegazione, mai TONO INVARIANTE.

### 2.3 Test acceptance criterion canonico

**Test Sense 1.6 estensione**:
1. **Pre-condizione**: 2 docenti diversi (D1 esperto 8 anni Arduino + D2 primo anno scuola elettronica) su 2 sessioni passate ciascuno (4 sessioni totali in `teacher_history_log` + 4 record in `errore_ricorrente_pattern`).
2. **Stesso esperimento attivo**: v1-cap6-esp1 LED blink Arduino.
3. **Output atteso**: UNLIM prompt sintesi a D1 SALTA passaggio "il LED ha catodo/anodo" (D1 già spiegato 8 volte tracked); UNLIM prompt sintesi a D2 INCLUDE analogia espansa "il LED è come una valvola idraulica unidirezionale" + suggerimento "Ragazzi, verifichiamo orientamento prima di alimentare".
4. **Invariante**: ambedue risposte plurale "Ragazzi," + cita Vol.1 pag.24 VERBATIM + ≤60 parole + Isabella TTS.

### 2.4 GDPR considerations critical

**Issue**: tabella `teacher_history_log` traccia comportamento docente cross-session (data + ora + capitolo + durata + errori + decisioni). Equivale a profilazione lavorativa = require **consenso esplicito GDPR Art. 7 + protezione lavoratori L. 300/1970 Art. 4 Stato Italiano**.

**Mitigazione**: 
- Consent banner UI on first launch sessione: "ELAB Tutor ricorda le tue spiegazioni precedenti per non ripetere. Acconsenti? [Sì / No]" — NO consent = Sense 1.6 disabilitato + UNLIM cade su Sense 1.5 baseline (operativo non bloccato)
- Right To Be Forgotten endpoint: `/api/teacher/forget-me` → DELETE FROM `teacher_history_log` WHERE anon_uuid = X
- Data retention 24 mesi max + auto-purge cron
- Anonymization: UUID anonimo, no nome cognome scuola
- Sub-processor list aggiornata (supabase/functions iter 30 docs GDPR base draft preserved)

---

## 3. Schema dati extension Supabase

### 3.1 `teacher_history_log`

```sql
CREATE TABLE teacher_history_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_anon_uuid UUID NOT NULL,
  session_id UUID NOT NULL,
  experiment_id TEXT,
  chapter TEXT,
  vol TEXT, -- "v1" / "v2" / "v3"
  pag INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  concepts_explained TEXT[],
  errors_encountered TEXT[], -- error patterns categorized
  ragazzi_count_estimated INT,
  device_mode TEXT, -- 'lim' | 'lim+ipad' | 'solo-lim'
  consent_version TEXT NOT NULL, -- gdpr consent tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_thl_teacher_uuid ON teacher_history_log(teacher_anon_uuid);
CREATE INDEX idx_thl_chapter_lookup ON teacher_history_log(teacher_anon_uuid, vol, chapter);
-- RLS Pattern S1 open client-side, anon UUID localStorage
ALTER TABLE teacher_history_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_thl_anon_rw ON teacher_history_log FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON teacher_history_log TO anon, authenticated;
```

### 3.2 `class_session_metadata`

```sql
CREATE TABLE class_session_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key TEXT NOT NULL, -- existing class_key convention iter 14
  session_id UUID NOT NULL,
  tempo_disponibile_min INT NOT NULL DEFAULT 40, -- 30/40/50 lab
  livello_autonomia TEXT NOT NULL DEFAULT 'lead', -- 'lead' | 'shared' | 'auto'
  materiale_presente JSONB NOT NULL DEFAULT '{}', -- {"led": 10, "r220": 5, "breadboard": true, ...}
  esperimento_scelto TEXT, -- experiment_id pinned currently
  narrative_position TEXT, -- narrative_map.json arc position iter 47
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_csm_class_session ON class_session_metadata(class_key, session_id);
ALTER TABLE class_session_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_csm_anon_rw ON class_session_metadata FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON class_session_metadata TO anon, authenticated;
```

### 3.3 `voice_movement_log`

```sql
CREATE TABLE voice_movement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  voice_event_type TEXT, -- 'wake_word_triggered' | 'stt_transcription' | 'tts_played'
  voice_payload JSONB, -- transcription text + confidence + duration
  movement_paths JSONB, -- SVG path array [{x, y, t_ms}, ...]
  movement_intensity FLOAT, -- coord delta sum per minute
  zone_preferred TEXT[], -- ['breadboard', 'arduino', 'led-area']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vml_session ON voice_movement_log(session_id);
-- Retention 90 days (lower than teacher_history_log per GDPR principle proporzionalità)
ALTER TABLE voice_movement_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_vml_anon_rw ON voice_movement_log FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON voice_movement_log TO anon, authenticated;
```

### 3.4 `errore_ricorrente_pattern`

```sql
CREATE TABLE errore_ricorrente_pattern (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_anon_uuid UUID NOT NULL,
  pattern_signature TEXT NOT NULL, -- es. 'led_polarity_dimenticata', 'r220_inversione_alim', 'breadboard_riga_sbagliata'
  detected_count INT NOT NULL DEFAULT 1,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  capitolo_context TEXT,
  remediation_suggested TEXT, -- UNLIM nudge text già provato
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_erp_teacher_signature ON errore_ricorrente_pattern(teacher_anon_uuid, pattern_signature);
ALTER TABLE errore_ricorrente_pattern ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_erp_anon_rw ON errore_ricorrente_pattern FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON errore_ricorrente_pattern TO anon, authenticated;
```

---

## 4. Runtime collection layer extension

### 4.1 `aggregateOnniscenza` v2 Sense 1.6 — 10 new dimensions

```typescript
// supabase/functions/_shared/onniscenza-bridge.ts (EXTEND, NOT replace)
interface OnniscenzaInputV2 extends OnniscenzaInput {
  // Sense 1.5 baseline preservato (query + experiment_id + supabase + history)
  // Sense 1.6 extensions:
  teacher_anon_uuid?: string;
  class_key?: string;
  sense_1_6_enabled?: boolean; // default false until Andrea ratify queue voci GDPR consent
}

interface OnniscenzaSnapshotV2 extends OnniscenzaSnapshot {
  // Sense 1.5 baseline preservato
  // Sense 1.6 extensions:
  teacher_history?: TeacherHistoryItem[]; // last 10 sessions
  class_metadata?: ClassSessionMetadata;
  voice_movement_summary?: VoiceMovementSummary;
  errore_ricorrente_patterns?: ErrorePattern[]; // top 5 most frequent
  predicted_nudges?: NudgePrediction[]; // morphic Level 2 predictive
}

export async function aggregateOnniscenzaV2(input: OnniscenzaInputV2): Promise<OnniscenzaSnapshotV2> {
  const baselinePromise = aggregateOnniscenza(input); // Sense 1.5 preservato
  if (!input.sense_1_6_enabled) return baselinePromise; // gate
  
  const [
    baseline,
    teacherHistory,
    classMetadata,
    voiceMovement,
    errorePatterns,
  ] = await Promise.all([
    baselinePromise,
    queryTeacherHistoryLog(input.supabase, input.teacher_anon_uuid),
    queryClassSessionMetadata(input.supabase, input.class_key),
    queryVoiceMovementLog(input.supabase, input.session_id),
    queryErrorePattern(input.supabase, input.teacher_anon_uuid),
  ]);
  
  const predictedNudges = predictNextNudge({
    history: teacherHistory,
    currentExperiment: input.experiment_id,
    classMeta: classMetadata,
    errorePatterns: errorePatterns,
  });
  
  return {
    ...baseline,
    teacher_history: teacherHistory,
    class_metadata: classMetadata,
    voice_movement_summary: voiceMovement,
    errore_ricorrente_patterns: errorePatterns,
    predicted_nudges: predictedNudges,
  };
}
```

### 4.2 System prompt inject Sense 1.6 context

```typescript
// supabase/functions/_shared/system-prompt.ts (EXTEND BASE_PROMPT v3.2)
function buildSense1_6_Context(snapshot: OnniscenzaSnapshotV2): string {
  if (!snapshot.teacher_history?.length) return ''; // graceful degradation Sense 1.5 only
  
  const lines: string[] = ['\n## Contesto docente esteso (Sense 1.6)\n'];
  
  if (snapshot.teacher_history.length > 0) {
    const concepts_spiegati = aggregateConcepts(snapshot.teacher_history);
    lines.push(`Concetti già spiegati: ${concepts_spiegati.slice(0, 5).join(', ')}. Evita ripetizioni.`);
  }
  
  if (snapshot.class_metadata?.tempo_disponibile_min < 40) {
    lines.push(`Tempo disponibile: ${snapshot.class_metadata.tempo_disponibile_min} min ridotti — sintesi ≤40 parole.`);
  }
  
  if (snapshot.predicted_nudges?.length) {
    const topNudge = snapshot.predicted_nudges[0];
    lines.push(`Suggerimento predittivo: "${topNudge.message}" (pattern: ${topNudge.signature}).`);
  }
  
  return lines.join('\n');
}
```

---

## 5. Implementation roadmap iter 64+

### 5.1 Atomization

- **Atom 1** (iter 64 P0, ~2h): Supabase migrations 4 tabelle + RLS Pattern S1 + sub-processor list update GDPR
- **Atom 2** (iter 64 P1, ~3h): `onniscenza-bridge.ts` EXTEND `aggregateOnniscenzaV2` + 10 collectors via Promise.all
- **Atom 3** (iter 65 P0, ~4h): `system-prompt.ts` EXTEND BASE_PROMPT v3.2 inject Sense 1.6 context block + post-LLM PZ V3 validator preservato
- **Atom 4** (iter 65 P1, ~3h): `src/services/morphic-predictor.js` NEW `predictNextNudge` algoritmo pattern-matching + scoring
- **Atom 5** (iter 66 P0, ~5h): UI consent banner GDPR Sense 1.6 + Right To Be Forgotten endpoint + class_session_metadata persistence wire-up dashboard docente
- **Atom 6** (iter 66 P1, ~4h): movement-tracker.js NEW SVG overlay drawing path sampling + voice_event_log integration via wake word service
- **Atom 7** (iter 67 P0, ~3h): tests unit (Sense 1.6 acceptance criterion §2.3) + integration test E2E 2-docente scenario
- **Atom 8** (iter 67 P1, ~2h): R8 bench 100q stress Sense 1.6 enabled vs disabled — latency p95 delta <500ms target + quality delta verify

Total stima ~26h work iter 64-67 (4 iter cascade, P0 + P1 dispatch).

### 5.2 Activation flag

```bash
ENABLE_SENSE_1_6=true # default false fino Andrea ratify queue voci GDPR + RLS sub-processor list publish
```

### 5.3 Canary rollout

- 0% iter 64-65 (build infrastructure DEV only)
- 5% iter 66 (Andrea + Tea testing classi pilot Strambino + Davide)
- 25% iter 67 (post acceptance criterion test §2.3 PASS + GDPR audit clean)
- 100% iter 68+ (rollout completo post Opus indipendente review G45 mandate)

---

## 6. Alternatives considered + rejected

### 6.1 Alternative 1: Sense 1.6 inline in ADR-019 amend

**Rejected**: Anti-pattern Godzilla ADR (300+ LOC append a 600 LOC ADR-019 = 900 LOC single ADR difficile audit). Vedi §1.3 motivo 2.

### 6.2 Alternative 2: 10 dimensioni in 10 ADR separati (ADR-049 ... ADR-058)

**Rejected**: Frammentazione eccessiva. Le 10 dimensioni condividono lo stesso runtime layer (`aggregateOnniscenza` + schema Supabase coordinato) — ratificarle separatamente creerebbe overhead + rischio inconsistencia schema cross-ADR. Single ADR-049 raccoglie scope coerente (1 decisione architettonica = 1 ADR).

### 6.3 Alternative 3: defer Sense 1.6 a Sprint W post-Sprint U close

**Rejected**: Andrea iter 62 PM mandate verbatim explicit — Sense 1.6 = scope iter 62+. Defer = inflation debito documentale + perdita context fresco mandate.

### 6.4 Alternative 4: design Sense 1.6 senza GDPR consent flow

**Rejected**: GDPR Art. 8 minori (target ELAB 8-14 anni) + Art. 7 consenso docente + L. 300/1970 Art. 4 protezione lavoratori italiani = consent flow OBBLIGATORIO. Skip = rischio legale catastrophic per ELAB go-to-market PNRR 2026-06-30.

### 6.5 Alternative 5: full LLM-only inference invece collector tabelle Supabase

**Rejected**: Inflazione costo LLM (10 collectors x N sessioni storiche = context length explosion) + impossibilità GDPR Right To Be Forgotten (LLM context can't unlearn). Schema tabelle Supabase = scalable + GDPR-clean.

---

## 7. Open questions per Andrea ratify

1. **GDPR consent banner timing**: first launch OR per-session OR opt-in dashboard? (Recommend: first launch + opt-in dashboard reversible)
2. **Data retention `teacher_history_log` 24 mesi**: confirm o ridurre 12 mesi?
3. **Sub-processor list update**: include Supabase EU Frankfurt + Mistral La Plateforme EU FR (gia in 4 docs DRAFT iter 30)?
4. **`predictNextNudge` algoritmo**: pattern-matching deterministic (preferred ms latency) OR small LLM call (Mistral Small ~200ms)?
5. **Rollout canary 5%→25%→100%**: trigger criterio R8 PASS + Tea acceptance test PASS?

---

## 8. Implementation note iter 63 entrance

ADR-049 status PROPOSED — implementation atomization defer iter 64+ entrance per HONESTY G45 mandate iter 63 score cap 9.0-9.2/10 conditional Codex Server HTTP success + Real Nano R4 UAT + B3 HomePage guard + Tea T1-T5 dispatch (vedi SESSION-ITER-63-ENTRANCE-V4-MASTER.md §4).

Andrea ratify gate iter 64 entrance prima atomization dispatch:
- Schema 4 tabelle review + RLS Pattern S1 confirm
- GDPR consent flow design review
- Sub-processor list update commit before migration apply
- `predictNextNudge` algoritmo choice (§7 q4)

NO atomization premature iter 63 — author SKELETON only (THIS doc + ADR-019 amend `extended_by: ADR-049`).

---

## 9. PRINCIPIO ZERO + MORFISMO compliance gate 8/8 Sense 1.6

1. ✅ Linguaggio plurale "Ragazzi" preservato (invariante §2.2)
2. ✅ Vol/pag verbatim citazione preservato (invariante §2.2)
3. ✅ ≤60 parole UNLIM cap preservato (invariante §2.2 + iter 28 hard rule)
4. ✅ Kit fisico Omaric SEMPRE protagonista (Sense 1.6 dim 10 `materiale_presente` rinforza vincolo)
5. ✅ Vol/cap canonical reference (Tea narrative_map.json iter 47 dim 9 `esperimento_scelto`)
6. ✅ Mascotte UNLIM (NOT Galileo) preservato (Sense 1.6 ortogonale UI mascotte)
7. ✅ Triplet kit ↔ volumi ↔ software (Sense 1.6 dim 10 rinforza triplet via materiale_presente sync)
8. ✅ Multimodale Voxtral primary preservato (Sense 1.6 dim 4 voce + dim 5 movimenti aumentano signal non sostituiscono Voxtral)

---

**End ADR-049 SKELETON iter 63 entrance — Andrea ratify queue gruppo 2 voci 1 prima atomization iter 64+ dispatch.**
