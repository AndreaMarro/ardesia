# PDR — FASE 15 Feedback & Research (NPS + Screen Recording + GDPR Tier)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #2)
**Durata stimata**: 30-40h autonome
**Branch**: `feature/feedback-research-v1`
**Dipendenze**: v1.0 deployata + GDPR legal review
**Governance**: `docs/GOVERNANCE.md` + GDPR ferreo minori

---

## 🎯 Obiettivo

Sistema di feedback utenti consenzienti, stratificato in 3 tier GDPR-compliant, per:
- Migliorare UNLIM con feedback reale
- Prove sociali per vendite MePA
- Retention analytics per scuole
- Case study

**Feedback Andrea**: "Potremmo fare un questionario durante utilizzo da parte degli utenti o registrarli ovviamente consenzienti" + "registrare lo schermo".

---

## ⚖️ Regola 0 — riuso

- `src/services/classProfile.js` — **MODIFY** campi consent
- `src/services/gdprService.js` — **RIUSA + ESTENDI** per nuovi consent type
- `supabase/functions/unlim-gdpr/index.ts` — **MODIFY** add delete per feedback data
- `src/components/common/ConsentBanner.module.css` — **RIUSA** (già esiste)
- `src/services/studentService.js` — **MODIFY** link feedback a student (anonimizzato)

---

## 📋 3 Tier feedback GDPR-compliant

### TIER 1 — Feedback aggregato anonimo (bassissimo rischio)

**Cosa**: NPS, like/dislike, tempo sessione, topic più discussi.
**Granularità**: aggregato per classe (mai individuale).
**Consent**: docente (ha mandato autorizzazione generico).
**GDPR**: nessun dato personale, solo metriche.

**Deliverable**:
- `src/components/feedback/NPSModal.jsx` (fine sessione, skippable)
- Supabase table `nps_responses` (sessione_id, classe_id hash, score 1-5, timestamp)
- Dashboard aggregata docente: "La classe ha avuto NPS medio 4.2/5 questo mese"

### TIER 2 — Feedback qualitativo pseudonimizzato (medio rischio)

**Cosa**: free text ("cosa ti è piaciuto?", "UNLIM ha aiutato?"), audio 10s commento opzionale.
**Granularità**: per studente pseudonimizzato (id + iniziali fittizie, mai nome reale).
**Consent**: genitoriale esplicito (popup al primo accesso).
**GDPR**: pseudonymization + retention 12 mesi + right-to-delete.

**Deliverable**:
- `src/components/feedback/QualitativeFeedback.jsx`
- Supabase table `qualitative_feedback` (pseudo_id, text/audio_url, consent_id, timestamp)
- Consent flow obbligatorio prima di ogni primo utilizzo
- `src/components/consent/ParentalConsentFlow.jsx`

### TIER 3 — Registrazione sessione (alto rischio)

**Cosa**: audio LIM (no volti studenti) + screen recording (schermo proiettato).
**Granularità**: per sessione classe.
**Consent**: doppio opt-in — docente **e** genitore firma modulo digitale.
**GDPR**:
- Retention max 90 giorni (auto-delete)
- Anonymization: no volti studenti (camera frontale disabilitata)
- Storage: Backblaze B2 EU region cifrato a riposo
- Right-to-delete instant: genitore può cancellare registrazione specifica via link email

**Deliverable**:
- `src/components/teacher/SessionRecording.jsx` (start/stop/preview)
- Supabase table `session_recordings` (recording_id, classe_id, teacher_consent, parental_consents_json, file_url, expires_at)
- Supabase Edge Function `session-record/` (upload + firma URL presigned)
- Cron job `auto-delete-recordings-90d.sql`
- `src/components/consent/RecordingConsentModal.jsx` (doppio opt-in UI)
- Email template parental consent con link accept/reject
- Download per docente (post-processing con UNLIM): insights + quote studenti + areas of confusion

---

## 📋 Task (8 sub-task)

### F.1 — Supabase schema 3 tier

**Migration SQL**:
```sql
-- TIER 1
CREATE TABLE nps_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  class_id_hash TEXT NOT NULL,  -- hash(class_id + salt), not identifiable
  score SMALLINT CHECK (score BETWEEN 1 AND 5),
  comment_length SMALLINT,  -- solo lunghezza, non contenuto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIER 2
CREATE TABLE qualitative_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo_id TEXT NOT NULL,  -- pseudonymous
  consent_id UUID NOT NULL REFERENCES parental_consents(id),
  text TEXT,
  audio_url TEXT,
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '12 months',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIER 3
CREATE TABLE session_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  teacher_consent_at TIMESTAMPTZ NOT NULL,
  parental_consents_json JSONB NOT NULL,  -- {student_id: consent_timestamp}
  recording_url TEXT NOT NULL,  -- Backblaze B2 presigned
  duration_sec INT NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parental_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_pseudo_id TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('tier2_qualitative', 'tier3_recording')),
  accepted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  -- GDPR: email NON è identificazione diretta studente (è del genitore, per comunicazione)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: docenti vedono solo propria classe, genitori solo proprio figlio
-- (Implement via policies Supabase)
```

**Auto-delete cron**:
```sql
-- Runs daily
DELETE FROM qualitative_feedback WHERE retention_until < NOW();
DELETE FROM session_recordings WHERE expires_at < NOW();
-- Backblaze B2 lifecycle rule: auto-delete file dopo 90 giorni
```

### F.2 — NPS Modal Tier 1 UI

**Component**: `src/components/feedback/NPSModal.jsx`
**Trigger**: fine sessione (>10 min attiva), una volta per sessione
**Design**: non invasivo, 3 domande max
- "La lezione è stata chiara?" (1-5 stelle)
- "UNLIM ha aiutato?" (✅ ❌)
- "Vuoi aggiungere qualcosa?" (optional text, 200 char max)

### F.3 — Qualitative Feedback Tier 2

**Component**: `src/components/feedback/QualitativeFeedback.jsx`
**Trigger**: opt-in (configurazione docente enable)
**Consent flow**: `ParentalConsentFlow.jsx` al primo accesso studente
**Input**: text 500 char o audio 30s
**Upload**: audio → Backblaze B2, transcribe via Whisper RunPod, store text

### F.4 — Recording Tier 3 UI + flow

**Component docente**: 
- Pulsante "Registra questa sessione" (disabled senza consent completo)
- Stato: "12/25 studenti hanno consenso" (count aggiornato)
- Start/stop recording

**Implementation tecnico**:
- MediaRecorder API (browser native)
- Stream: audio (solo LIM, no camera frontale) + screen capture
- Chunked upload ogni 10s a Backblaze B2 presigned URL
- Max durata: 90 min (limit scolastico)

### F.5 — Parental consent flow email

**Flow**:
1. Docente inserisce classe studenti (pseudo_id + parent_email)
2. Sistema invia email genitore con link accept/reject per tier2 + tier3
3. Genitore firma digitalmente (accetta ToS + GDPR)
4. Scaduta 30gg senza risposta → tier2/3 disabilitato per quello studente
5. Genitore può revocare in qualsiasi momento via email link

**Template email**: `supabase/functions/_shared/emails/parental-consent.html`

### F.6 — GDPR dashboard genitore

**URL**: `/parent-portal?token=<JWT>`
**Cosa vede il genitore**:
- Lista feedback/registrazioni del figlio
- Pulsante "Cancella questo dato" per ogni item
- Export dati in JSON (portability)
- Revoca consenso globale

**Component**: `src/components/parent/ParentPortal.jsx`

### F.7 — Aggregation insights per docente

**Dashboard docente sezione Feedback**:
- NPS media mensile (line chart)
- Top 5 topic positivi (word cloud da qualitative)
- Top 5 confusion areas (estratte da UNLIM via analisi sessioni)
- Trends temporali

**Component**: `src/components/teacher/FeedbackDashboard.jsx`

### F.8 — Legal review + privacy policy update

**Deliverable**:
- Update `docs/legal/privacy-policy.md` con 3 tier + basi giuridiche
- Update `docs/legal/terms-of-service.md`
- Cookie banner (se serve per analytics)
- DPA addendum per scuole che usano tier 3

**Review legale**: consulente GDPR (quando Andrea ha budget), altrimenti self-audit rigoroso contro GDPR Art. 8 (minori).

---

## 🔬 Gate finale PDR Feedback

- [ ] 3 tier implementati con consent flow completo
- [ ] Supabase schema + RLS policies
- [ ] Auto-delete retention 90gg (tier3) e 12m (tier2) funzionante
- [ ] Docente dashboard feedback aggregato
- [ ] Genitore portal accessibile
- [ ] Privacy policy + ToS aggiornati
- [ ] Audit GDPR minori: APPROVE
- [ ] Auditor APPROVE

## 🚨 Rischi GDPR

| Rischio | Prob | Mitigation |
|---------|------|------------|
| Consent flow bug fa registrare senza consenso | Bassa | 10× integration test + audit legale |
| Data leak Backblaze B2 | Bassa | Encryption at-rest + presigned URL short-ttl |
| Genitore denuncia per data retention extra | Media | Auto-delete cron hardened + log audit |
| Parental consent email spam | Media | Rate limit + unsubscribe link |

---

**Principio ferreo**: **GDPR Art. 8 minori non-negoziabile**. Mai compromessi per velocità.
