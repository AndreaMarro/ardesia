# Lista Sub-Processor — ELAB Tutor

**Versione**: 1.1 — 15 maggio 2026 (iter 64 entrance — ADR-050 Atom 1 Sense 1.6 +4 entries)
**Compliance**: GDPR Art. 28 §3 (sub-processor obligation disclosure)
**Status**: DRAFT — pending DPA firma con scuole acquirenti

Companion: `public/sub-processors.html` (legacy iter 29 — 13 provider).
Canonical fonte iter 64+: questo file `.md` per single source of truth.

---

## Riepilogo categorie

- 🟢 **EU-only** (data residency garantita): trattamento dati studenti runtime
- 🟡 **EU edge / EU region**: trattamento via infrastruttura EU
- 🟠 **Extra-EU gated**: solo contenuti statici OR fallback emergency anonymized

---

## Sense 1.6 tabelle Supabase (iter 65+ post ADR-050 ratify)

> Aggiunte iter 64 entrance (ADR-049 + ADR-050 §2.4 verbatim).
> 4 tabelle Sense 1.6 Morfismo extended runtime context docente/classe/sessione.
> **[STATUS: pending UI deploy iter 66+]** — Andrea Q5 ratify gruppo 3 4/4 SI
> 2026-05-15 PM: commit iter 65 con flag, UI ConsentBanner deploy iter 66+
> (Atom 4 ADR-050 §3.1 atomization cascade).

| Tabella | Sub-processor | Region | Dati | Retention | RLS | Status |
|---------|---------------|--------|------|-----------|-----|--------|
| `teacher_history_log` | Supabase | EU Frankfurt | UUID anon + capitolo + tempo + concetti spiegati + errori categorized | 24 mesi | Pattern S1 | [STATUS: pending UI deploy iter 66+] |
| `class_session_metadata` | Supabase | EU Frankfurt | class_key + tempo_disponibile + livello_autonomia + materiale_presente JSON | 24 mesi | Pattern S1 | [STATUS: pending UI deploy iter 66+] |
| `voice_movement_log` | Supabase | EU Frankfurt | session_id + wake events + SVG path coord delta + zone_preferred | 90 giorni | Pattern S1 | [STATUS: pending UI deploy iter 66+] |
| `errore_ricorrente_pattern` | Supabase | EU Frankfurt | UUID anon + pattern_signature + detected_count + remediation_suggested | 24 mesi | Pattern S1 | [STATUS: pending UI deploy iter 66+] |

**Base legale**: Consenso esplicito GDPR Art. 7 (revocabile in qualsiasi momento via Impostazioni docente). Tracking Sense 1.6 **opt-in** — default OFF (Q2 ratify navy_solo_base_default_off iter 64).

**Cosa NON registriamo**: nome cognome docente · audio voce docente · video studenti · contenuti chat in full (solo metadati aggregati anonimi).

**Identificatore**: UUID anonimo localStorage `elab_teacher_anon_uuid` (generato `crypto.randomUUID()` first launch, NO PII).

**Cancellazione (Right To Be Forgotten — GDPR Art. 17)**: Impostazioni > Privacy > "Cancella la mia storia in ELAB Tutor" → endpoint `POST /functions/v1/teacher-rtbf` (deploy iter 66+ Atom 5) cancella permanentemente entro 72 ore.

**Sub-processor reference**: Supabase DPA (Data Processing Agreement) GDPR Art. 28 §3 already signed at signup. Default DPA URL: https://supabase.com/legal/dpa

**Project Supabase**: euqpdueopmlllqjmqnyb (region eu-central-1 Frankfurt).

---

## Sub-processor legacy (13 provider — iter 29 baseline)

Reference: `public/sub-processors.html` per dettaglio tabella HTML legacy.

Riepilogo provider attivi runtime:

- 🟢 **Mistral AI** (Parigi, FR) — LLM + Pixtral Vision + Voxtral TTS
- 🟡 **Google Cloud Gemini** (Frankfurt, DE) — LLM fallback + Vertex Frankfurt primary iter 39+
- 🟡 **Cloudflare Workers AI** (EU edge) — STT Whisper + ImgGen FLUX + Embeddings BGE-M3
- 🟢 **Supabase** (Frankfurt, DE) — Database PostgreSQL + Edge Functions + pgvector
- 🟡 **Vercel** (EU edge) — Frontend hosting + CDN
- 🟠 **Voyage AI** (USA gated) — Embeddings volumi statici (NO PII studenti)
- 🟠 **Together AI** (USA gated) — LLM emergency fallback (BLOCK student runtime)
- 🟢 **n8n self-hosted** (Hostinger Lituania) — Compilatore Arduino
- 🟡 **GitHub** (USA — code only)
- 🟢 **Anthropic Bedrock** (Frankfurt — dev tools only)
- 🟡 **Microsoft Edge TTS** (Global — DEPRECATED)
- 🟡 **Render** (USA — DEPRECATED)
- ❌ **RunPod** (DECOMMISSIONED iter 5 P3)

---

## Distribuzione geografica trattamento dati (post iter 64 entrance Sense 1.6 +4)

- **EU-only student runtime**: Mistral FR + Gemini Frankfurt + CF EU edge + Supabase Frankfurt + n8n Lituania = **5 provider EU** (100% dati personali studenti)
- **Sense 1.6 NEW 4 tabelle**: Supabase Frankfurt (stesso sub-processor esistente, no nuovo vendor) = **+0 nuovi sub-processor**, **+4 tabelle data flow declared**
- **USA gated batch only**: Voyage (statico volumi) + Together (consent + anonymized) = **2 provider USA gated**
- **USA dev/admin**: GitHub (code) + Anthropic Bedrock EU + Render (deprecato) = solo development

---

## Aggiornamenti

Questa lista viene aggiornata quando un sub-processor viene aggiunto, rimosso, o cambia categoria. Notifica via email a docenti registrati con preavviso 30 giorni per cambi material.

**Iter 64 entrance update**: +4 entries Sense 1.6 tabelle Supabase Frankfurt (no nuovo vendor, solo data flow declaration). ADR-050 Q5 ratify trigger commit iter 65 con flag [STATUS: pending UI deploy iter 66+].

---

## Responsabili sub-processor

Per richieste DPA con singoli sub-processor: marro.andrea96@gmail.com

---

*Documento DRAFT v1.1 iter 64 entrance — pending DPA firma scuole acquirenti. ADR-050 ACCEPTED Andrea ratify gruppo 3 4/4 SI 2026-05-15 PM (D2 Consent Banner UX 5 stati + D3 RTBF endpoint + D4 Q1-Q5 defaults).*
