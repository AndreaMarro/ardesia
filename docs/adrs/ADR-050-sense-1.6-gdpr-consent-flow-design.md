---
id: ADR-050
title: Sense 1.6 GDPR Consent Flow design — Atom 0 prereq ADR-049 atomization
status: PROPOSED
date: 2026-05-15
deciders:
  - Claude Opus 4.7 (iter 64 entrance — author Atom 0 design prereq ADR-049 atomization per Andrea Q1 delega "max qualità zero debito tecnico")
  - Andrea Marro (final approver per consent flow UX + GDPR Art. 7 + L. 300/1970 Art. 4 compliance review)
extends:
  - ADR-049 (Sense 1.6 Morfismo extended runtime — 10 nuove dimensioni context, PROPOSED iter 63 entrance)
  - ADR-019 (Sense 1.5 Morfismo runtime — ACCEPTED iter 63 entrance)
context-tags:
  - iter-64
  - sprint-V-or-W
  - gdpr-consent-flow
  - art-7-consenso-esplicito
  - l-300-1970-art-4-protezione-lavoratori
  - teacher-history-log
  - right-to-be-forgotten
  - sub-processor-list
  - data-retention-policy
  - sense-1.6-atom-0
related:
  - ADR-049 (Sense 1.6 schema 4 tabelle Supabase)
  - GDPR Regulation EU 2016/679 (Art. 7 consenso + Art. 17 RTBF + Art. 28 sub-processors)
  - L. 300/1970 (Statuto dei Lavoratori) Art. 4 — divieto controllo distanza
  - public/privacy-policy.md (4 docs DRAFT iter 30, da update)
  - public/sub-processors.md (13 provider tabella iter 30)
input-files:
  - public/privacy-policy.md (existing iter 30 DRAFT — extend Sense 1.6 section)
  - public/sub-processors.md (existing iter 30 — add 4 NEW tabelle teacher_history_log + class_session_metadata + voice_movement_log + errore_ricorrente_pattern)
  - src/components/onboarding/ConsentBanner.jsx (NEW iter 65+ — UI consent flow)
  - supabase/functions/_shared/onniscenza-bridge.ts (existing LIVE iter 31 — EXTEND con consent gate iter 65+)
output-files:
  - docs/adrs/ADR-050-sense-1.6-gdpr-consent-flow-design.md (THIS file, NEW iter 64 entrance)
  - Future iter 65+: ConsentBanner UI + endpoint /api/teacher/consent (POST grant/revoke) + /api/teacher/forget-me (DELETE RTBF)
  - Future iter 65+: public/privacy-policy.md EXTEND Sense 1.6 section + public/sub-processors.md +4 entries
---

# ADR-050 — Sense 1.6 GDPR Consent Flow design (Atom 0 prereq Atom 1 migrations)

> **Atom 0 prereq Sense 1.6 atomization cascade**: ADR-049 PROPOSED iter 63 entrance richiede 4 Supabase migrations (teacher_history_log + class_session_metadata + voice_movement_log + errore_ricorrente_pattern). PRIMA di applicare migrations, design completo GDPR consent flow + sub-processor list update + Right To Be Forgotten endpoint **deve essere ratificato da Andrea**. Senza Atom 0 → debito legale (L. 300/1970 Art. 4 + GDPR Art. 7) = NON shippable iter 64 P0 senza compromesso qualità. Andrea Q1 delega ratify "max qualità zero debito tecnico" → Atom 0 design FIRST, Atom 1 migrations APPLY iter 65+ post ratify.

---

## 1. Contesto

### 1.1 Vincolo legale italiano

**L. 300/1970 Art. 4 Statuto Lavoratori** vieta installazione strumenti di controllo a distanza dell'attività lavorativa SENZA accordo sindacale o autorizzazione ITL. Sense 1.6 dimension 1 `teacher_history_log` traccia comportamento docente cross-session (concetti spiegati + errori ricorrenti + durata + decisioni). Equivale a **profilazione lavorativa** → richiede consenso esplicito docente + sub-processor declaration prima deploy.

**GDPR Art. 7** richiede consenso "libero, specifico, informato, inequivocabile". Consenso default ON inaccettabile. Withdraw consent deve essere semplice come grant.

**GDPR Art. 17 RTBF** — Right To Be Forgotten: docente deve poter cancellare proprio `teacher_anon_uuid` data on demand. Endpoint dedicato + esecuzione ≤72h.

**GDPR Art. 8 minori** — target ELAB 8-14 anni: studenti NO direct interaction (Principio Zero) → docente è solo intermediario LIM. Studenti NON registrati come utenti → no consent diretto richiesto. Tracking è del docente NON studenti.

### 1.2 Stato post iter 31 GDPR DRAFT

iter 31 commit `aee48e2` shipped 4 docs DRAFT in `public/`:
- privacy-policy.md
- cookie-policy.md
- terms-of-service.md
- sub-processors.md (13 provider: Vercel + Supabase + Mistral + Voyage + Together + Render + Hostinger + CF + Gemini + Render + Anthropic + OpenAI + HuggingFace)

**Gap iter 64**: 4 NEW tabelle Sense 1.6 NON dichiarate + consent flow UI NON esistente + RTBF endpoint NON implementato.

### 1.3 Perché Atom 0 NOW (iter 64 entrance)

Andrea Q1 ratify gruppo 2 verbatim: "fai la cosa che porti maggiore beneficio e qualità e zero debito tecnico. Sii oggettivo e non omettere o saltare passaggi."

Oggettivamente: shipping 4 migrations + RLS + sub-processor list update SENZA consent UI design = debito legale + perdita controllo legal review. Atom 0 design FIRST → Atom 1 migrations APPLY post Andrea ratify schema + UX + legal review pipeline.

Zero debito = design pipeline completo PRIMA implementation. Andrea ratify gate iter 65+ entrance.

---

## 2. Decisione architetturale Atom 0

### 2.1 4 componenti deliverable Atom 0

**Atom 0 = design + audit, NO implementation. Deliverables**:

1. **Consent Banner UX spec** — first-launch modal + footer permanent link "Privacy & Consenso" + opt-in granular per categoria (basic Sense 1.5 vs full Sense 1.6)
2. **Privacy Policy Sense 1.6 amend** — add §X "Tracciamento Sense 1.6 docente" con 4 tabelle dichiarate + retention 24 mesi + RTBF endpoint
3. **Sub-processor list update** — +4 entries (Supabase 4 tabelle NEW) + GDPR Art. 28 §3 Data Processing Agreement reference
4. **RTBF endpoint design** — `POST /api/teacher/forget-me` + `POST /api/teacher/consent` (grant/revoke) + audit trail

### 2.2 Consent Banner UX spec (5 stati)

**State 1: First launch (no consent record)**
- Modal blocking action (overlay viewport)
- 3-paragraph plain Italian:
  1. "Ragazzi, ELAB Tutor può ricordare le tue spiegazioni precedenti per non ripeterle e suggerirti il prossimo passo. Questa funzione è opzionale."
  2. "Se acconsenti, ricordiamo: capitoli spiegati + errori frequenti + tempo per lezione + esperimenti scelti. NON registriamo audio né video studenti."
  3. "Puoi cambiare idea in qualsiasi momento dal pannello impostazioni docente. Puoi anche cancellare tutta la cronologia con un click."
- 3 bottoni: **"SÌ, attiva Sense 1.6"** (Lime button) | **"Solo funzioni base"** (Navy button, default focus) | **"Leggi di più"** (link Privacy Policy §X)

**State 2: Consent granted (Sense 1.6 active)**
- Banner dismissed
- Footer chip permanente "Cronologia attiva ✓" + click → impostazioni
- Edge Function `aggregateOnniscenzaV2` invoca con `sense_1_6_enabled: true`

**State 3: Consent denied (Sense 1.5 only)**
- Banner dismissed
- Edge Function invoca con `sense_1_6_enabled: false` → cade su Sense 1.5 baseline (operativo non bloccato)
- Footer chip "Funzioni base" + click → impostazioni (può riattivare Sense 1.6 in qualsiasi momento)

**State 4: Consent revoke (post-grant)**
- Impostazioni > Privacy > toggle "Cronologia Sense 1.6 attiva: ON/OFF"
- Toggle OFF → confirm dialog "Disattivare Sense 1.6 ferma la raccolta MA NON cancella i dati esistenti. Per cancellare TUTTO, usa 'Cancella la mia storia'."
- 2 options: **Solo OFF** (granular) | **OFF + cancella tutto** (RTBF trigger)

**State 5: RTBF execute**
- Confirm dialog "Cancellare la tua storia in ELAB Tutor cancellerà permanentemente: concetti spiegati + errori + sessioni + voce + movimenti. Non potrà essere recuperata. Procedi?"
- POST `/api/teacher/forget-me` → backend DELETE FROM 4 tabelle WHERE `teacher_anon_uuid = X` + audit log entry retain (anonymized) per compliance trace
- Toast "Cronologia cancellata. Sense 1.6 disattivato. Puoi riattivare in qualsiasi momento."

### 2.3 Privacy Policy Sense 1.6 amend §X

Add section to `public/privacy-policy.md`:

```markdown
## Sezione X — Tracciamento Sense 1.6 docente (opt-in)

Quando attivi "Cronologia Sense 1.6" dal pannello impostazioni, ELAB Tutor
ricorda nelle sessioni successive:

| Categoria | Cosa ricordiamo | Per quale scopo | Retention |
|-----------|-----------------|-----------------|-----------|
| `teacher_history_log` | Capitoli + concetti spiegati + sessioni completate | Suggerire next step coerente, evitare ripetizioni | 24 mesi |
| `class_session_metadata` | Tempo lezione + livello autonomia + materiale kit | Adattare profondità + sintesi al contesto classe | 24 mesi |
| `voice_movement_log` | Pattern wake word + zone preferite lavagna | Personalizzare suggerimenti UI morfica | 90 giorni |
| `errore_ricorrente_pattern` | Errori ricorrenti rilevati (es. dimentichi sempre R220 + LED) | Nudge predittivo proattivo prima di errore | 24 mesi |

**Cosa NON registriamo**: nome cognome docente · audio voce docente · video
studenti · contenuti chat in full (solo metadati aggregati anonimi).

**Identificatore**: UUID anonimo localStorage `elab_teacher_anon_uuid`
(generato `crypto.randomUUID()` first launch, NO PII).

**Cancellazione**: Impostazioni > Privacy > "Cancella la mia storia in
ELAB Tutor" → cancella permanentemente entro 72 ore (GDPR Art. 17 RTBF).

**Sub-processor**: Supabase EU Frankfurt — vedi sub-processors.md per
elenco completo.

**Base legale**: Consenso esplicito GDPR Art. 7 (revocabile in qualsiasi
momento). Nessuna automazione decisionale sui dati raccolti.

**Diritti**: accesso (Art. 15) · rettifica (Art. 16) · cancellazione (Art. 17) ·
limitazione (Art. 18) · portabilità (Art. 20) · opposizione (Art. 21).
Contatta marro.andrea96@gmail.com per esercitare i diritti.
```

### 2.4 Sub-processor list update (+4 tabelle)

Add to `public/sub-processors.md`:

```markdown
## Sense 1.6 tabelle Supabase (iter 65+ post ADR-050 ratify)

| Tabella | Sub-processor | Region | Dati | Retention | RLS |
|---------|---------------|--------|------|-----------|-----|
| `teacher_history_log` | Supabase | EU Frankfurt | UUID anon + capitolo + tempo + concetti | 24m | Pattern S1 |
| `class_session_metadata` | Supabase | EU Frankfurt | class_key + tempo + materiale_presente JSON | 24m | Pattern S1 |
| `voice_movement_log` | Supabase | EU Frankfurt | session_id + wake events + SVG path coord | 90d | Pattern S1 |
| `errore_ricorrente_pattern` | Supabase | EU Frankfurt | UUID anon + pattern_signature + count | 24m | Pattern S1 |
```

Reference: Supabase DPA (Data Processing Agreement) GDPR Art. 28 §3 already signed at signup (default DPA URL: https://supabase.com/legal/dpa).

### 2.5 RTBF endpoint design

**API contract Edge Function `supabase/functions/teacher-rtbf/index.ts` NEW (iter 65+)**:

```typescript
// POST /functions/v1/teacher-rtbf
// Headers: Authorization: Bearer <ELAB_API_KEY>
// Body: { teacher_anon_uuid: string }
// Response: 200 { deleted_rows: { teacher_history_log: N, class_session_metadata: N, voice_movement_log: N, errore_ricorrente_pattern: N }, audit_id: "<uuid>" }
// Errors: 401 (missing token), 400 (missing uuid), 500 (DB error)

// 5 DELETE in transaction:
// 1. DELETE FROM teacher_history_log WHERE teacher_anon_uuid = $1
// 2. DELETE FROM class_session_metadata WHERE related_teacher_uuid = $1
// 3. DELETE FROM voice_movement_log WHERE related_teacher_uuid = $1
// 4. DELETE FROM errore_ricorrente_pattern WHERE teacher_anon_uuid = $1
// 5. INSERT INTO gdpr_audit_log (action='rtbf_executed', teacher_anon_uuid=$1, timestamp=NOW())
```

**Consent grant/revoke endpoint `supabase/functions/teacher-consent/index.ts` NEW**:

```typescript
// POST /functions/v1/teacher-consent
// Body: { teacher_anon_uuid: string, consent: 'grant' | 'revoke', categories: string[] }
// Response: 200 { consent_version: 'v1.0', granted_at: ISO, categories }
// INSERT INTO teacher_consent_log (anon_uuid, version, categories, granted_at) ON CONFLICT update
```

### 2.6 Atom 1 migrations BLOCKED until Atom 0 ratify

Andrea ratify gate iter 65+ entrance:
- ✅ Consent Banner UX wireframe + flow 5 stati review
- ✅ Privacy Policy §X amend review + legal expert opzionale check
- ✅ Sub-processor list +4 entries commit
- ✅ RTBF endpoint design approval

POST ratify → Atom 1 dispatch (`supabase db push --linked` migrations + endpoint deploy + UI ConsentBanner.jsx shipping iter 65-66).

---

## 3. Implementation roadmap post Atom 0 ratify

### 3.1 Atomization Sense 1.6 cascade UPDATED

- **Atom 0** (iter 64 entrance, ~1h THIS doc): ADR-050 GDPR consent flow design ✅ (Claude MacBook)
- **Atom 1** (iter 65 P0 post Andrea ratify, ~2h subagent): 4 Supabase migrations + RLS Pattern S1 + sub-processor list commit
- **Atom 2** (iter 65 P1, ~3h): `onniscenza-bridge.ts` EXTEND `aggregateOnniscenzaV2` + 10 collectors via Promise.all
- **Atom 3** (iter 66 P0, ~4h): `system-prompt.ts` EXTEND BASE_PROMPT v3.2 inject Sense 1.6 context + post-LLM PZ V3 validator
- **Atom 4** (iter 66 P0, ~5h NEW): `ConsentBanner.jsx` UI component + 5 stati + 14+ tests + impostazioni dashboard wire-up
- **Atom 5** (iter 66 P0, ~3h): `teacher-rtbf` + `teacher-consent` Edge Functions + integration tests
- **Atom 6** (iter 66 P1, ~4h): `morphic-predictor.js` NEW + `predictNextNudge` algoritmo
- **Atom 7** (iter 67 P0, ~5h): `movement-tracker.js` NEW SVG overlay drawing path sampling + wake word event log
- **Atom 8** (iter 67 P0, ~3h): tests unit + integration E2E 2-docente scenario + R8 bench 100q stress Sense 1.6 ON vs OFF

Total revised stima ~30h work iter 64-67 (4 iter cascade, Atom 0 + 8 atoms, P0+P1 dispatch).

### 3.2 Activation flag

```bash
ENABLE_SENSE_1_6=true # default false fino Atom 0 ratify + Atom 4 ConsentBanner UI deployed
```

### 3.3 Canary rollout updated

- 0% iter 64-65 (Atom 0 design ratify + Atom 1-3 DEV-only build)
- 5% iter 66 (Atom 4 ConsentBanner UI LIVE + Atom 5 RTBF endpoint deployed, Andrea + Tea + Davide pilot Strambino)
- 25% iter 67 (post Atom 7-8 PASS + R8 bench quality gate + GDPR audit clean)
- 100% iter 68+ (full rollout post Opus indipendente review G45 mandate)

---

## 4. Alternatives considered + rejected

### 4.1 Alternative 1: Skip consent flow, ship migrations directly

**Rejected**: GDPR Art. 7 + L. 300/1970 Art. 4 OBBLIGATORI. Skip = rischio legale catastrophic + perdita PNRR pubbliche scuole 2026-06-30.

### 4.2 Alternative 2: Consent banner default ON

**Rejected**: GDPR Art. 7 "libero" → default OFF mandatory. Banner default Lime button "Sì attiva" + Navy button "Solo base" default-focus.

### 4.3 Alternative 3: Defer Atom 0 to iter 65+ post Atom 1 migrations

**Rejected**: Migrations SENZA design flow + RTBF endpoint = orphan tabelle. Shipping data tracking PRIMA legal review = debito legale aperto. Atom 0 design FIRST principle preserved.

### 4.4 Alternative 4: Use third-party consent management platform (Iubenda/OneTrust)

**Rejected**: External vendor dependency + cost monthly + complessità integration vs simple in-house Banner React component (~300 LOC). ELAB scale (pilot 5-10 scuole iter 67) NON giustifica CMP enterprise.

### 4.5 Alternative 5: Anonymize teacher data at source (no UUID persistence)

**Rejected**: Anonymization at source breaks Sense 1.6 cross-session memory premise. UUID anon localStorage + RTBF endpoint = optimal balance privacy + functionality. NIST anonymization guidelines respect.

---

## 5. Open questions per Andrea ratify

1. **Consent banner timing**: first launch (modal blocking) OR less aggressive footer banner non-blocking? **Recommend**: first launch modal (zero ambiguity GDPR Art. 7 informato + inequivocabile).
2. **Default state**: Navy "Solo funzioni base" focus OR Lime "Sì attiva" focus? **Recommend**: Navy default (default-OFF Sense 1.6 per GDPR Art. 7 "libero").
3. **Legal expert review pre-deploy**: ELAB consultor avvocato (~€500 review) OR self-cert audit (DPA reference Supabase)? **Recommend**: self-cert acceptable pilot 5-10 scuole iter 66-67, legal expert review iter 68+ pre 100% rollout.
4. **Data retention duration**: 24 mesi default OR 12 mesi più conservativo? **Recommend**: 24 mesi (allinea Vol/cap anno scolastico + necessary per nudge predittivo cross-anno).
5. **Sub-processor list ratify trigger**: include Sense 1.6 4 tabelle iter 65 commit OR aspettare deploy Atom 5 RTBF + Atom 4 UI? **Recommend**: commit iter 65 con `[STATUS: pending UI deploy iter 66+]` flag.

---

## 6. PRINCIPIO ZERO + MORFISMO compliance gate 8/8 ADR-050

1. ✅ Linguaggio plurale "Ragazzi" preserved (Consent Banner copy uses "Ragazzi, ELAB Tutor può ricordare...")
2. ✅ Vol/pag verbatim citazione (NOT applicable Atom 0 — UI consent flow, NO content delivery)
3. ✅ ≤60 parole UNLIM cap (NOT applicable — Consent Banner is UI not UNLIM chat)
4. ✅ Kit fisico Omaric SEMPRE protagonista (preserved — Consent Banner NON menziona simulazione, NON sostituisce kit)
5. ✅ NOT Galileo naming (UNLIM canonical in Consent Banner copy)
6. ✅ Mascotte UNLIM (Consent Banner può mostrare ElabMascotte SVG per visual coerenza, Atom 4 design decision)
7. ✅ Triplet kit ↔ volumi ↔ software (Consent Banner riferisce solo "ELAB Tutor" coerente con Sense 2)
8. ✅ Multimodale Voxtral primary preservato (Consent Banner UI silent — NO TTS read)

---

## 7. Atom 0 close — handoff Atom 1 iter 65+

**Atom 0 status**: PROPOSED (this ADR-050 doc shipped iter 64 entrance Claude MacBook).

**Andrea ratify queue gruppo 3 iter 64+ entrance** (4 voci max via AskUserQuestion):
1. ADR-050 §2.2 Consent Banner UX 5 stati review (SI ratify / RICERCA modifica / DEFER ulteriore review)
2. ADR-050 §2.3 Privacy Policy §X amend ratify
3. ADR-050 §2.5 RTBF endpoint design ratify
4. ADR-050 §5 Open questions Q1-Q5 decisione finale

**Atom 1 dispatch trigger**: post Andrea ratify 4/4 voci → subagent agent-teams:team-implementer 4 Supabase migrations + sub-processor list commit iter 65 entrance.

**Sense 1.6 release projection**: iter 67 close pilot 5% rollout (Atom 8 R8 bench gate PASS).

---

**End ADR-050 Atom 0 design — Andrea ratify gate iter 65+ entrance prima Atom 1 dispatch. Zero debito legale + zero debito tecnico via design-first principle.**
