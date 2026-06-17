# PDR — Commercial 10 Pacchetti + Videocorsi HeyGen

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #2)
**Durata stimata**: 60h autonome
**Branch**: `feature/commercial-v1`
**Dipendenze**: v1.0 staging funzionale
**Governance**: `docs/GOVERNANCE.md`

---

## 🎯 Obiettivo

Tradurre i 10 pacchetti commerciali (Freemium → Enterprise) in:
- Brochure PDF
- Listino MePA (via Davide Fagherazzi)
- Landing page `/pacchetti` con pricing calculator
- Contratti template
- Videocorsi HeyGen (92 video una tantum)
- Onboarding self-service
- CRM setup

---

## ⚖️ Regola 0 — riuso

- `src/data/lesson-groups.js` (27 Lezioni) — **RIUSA** per biblioteca videocorsi (1 video per lesson principale)
- `src/data/volume-references.js` (92 esperimenti bookText) — **RIUSA** per scripts videocorsi
- `src/components/admin/gestionale/*` — **VERIFICA esistente** gestionale Andrea
- `src/services/licenseService.js` — **RIUSA + ESTENDI** per 10 tier pacchetti
- `src/services/notionService.js` — **RIUSA** se Notion è backend commercial data
- `src/services/authService.js` — **RIUSA** per tiered access

---

## 📋 I 10 pacchetti (ref `docs/plans/2026-04-18-*-commercial-*` per analisi)

| # | Pacchetto | €/anno | Target | Margine |
|---|-----------|--------|--------|---------|
| 1 | Freemium | 0 | Funnel | -€60 |
| 2 | Scintilla | 490 | Test scuola | 71% |
| 3 | Scintilla + Video | 790 | Autodidatta | 81% |
| 4 | Scintilla + AI Plus | 990 | Pro AI | 70% |
| 5 | Laboratorio | 2.490 | PNRR DM 219 | 64% |
| 6 | Laboratorio Multilingue | 2.990 | Bilingui | 63% |
| 7 | Laboratorio Pro | 3.990 | Premium+SLA | 60% |
| 8 | Scuola (plesso) | 4.950 | Multi-classe | 56% |
| 9 | Territorio (5 scuole) | 13.000 | Rete PNRR | 29% |
| 10 | Enterprise white-label | 60-250k | Editoriale | 60-70% |

---

## 📋 Task (10 sub-task)

### C.1 — Design visivi 10 brochure PDF (InDesign-like via HTML→PDF)

**Tool**: Playwright screenshot + Puppeteer PDF generation
**Template**: `src/components/marketing/BrochureTemplate.jsx`
**Deliverable**: 10 PDF in `docs/sales/brochures/`
**Audit**: review visivo + correzione grammatica IT+EN

### C.2 — Listino MePA (PDF + upload via Davide)

**Contenuto**: codice articolo, descrizione, prezzo, fornitore (Omaric+ELAB), condizioni
**Deliverable**: `docs/sales/listino-mepa-2026.pdf`
**Passaggio**: Davide Fagherazzi (MePA handler) uploada su acquistinretepa.it

### C.3 — Landing page `/pacchetti` con pricing calculator

**Frontend**:
- `src/components/marketing/PacchettiLanding.jsx`
- `src/components/marketing/PricingCalculator.jsx`
- Form: n° classi, pacchetto, multilingue, add-on video → stima annua
- CTA "Richiedi preventivo" → email Andrea + creazione lead CRM

### C.4 — Demo video 3 min per pacchetto (Loom/screen capture)

**5 video** (non 10 — skippiamo Freemium + Enterprise custom):
- Scintilla base (2 min)
- Scintilla + Video (2 min)
- Laboratorio + kit unboxing (3 min)
- Scuola multi-classe dashboard (3 min)
- Territorio federated learning (3 min)

**Tool**: OBS Studio + TTS narration (F5-TTS RunPod)

### C.5 — Contratti template SaaS scuole

**3 template**:
- Contratto 1 anno Scintilla/Laboratorio (5 pagine)
- Contratto 2 anni Scuola (8 pagine, GDPR DPA allegato)
- Contratto 3 anni Territorio (12 pagine, multi-ente)

**File**: `docs/legal/templates/`
**Verifica legale**: consultabile con avvocato ELAB (quando Andrea ha budget)

### C.6 — CRM setup (HubSpot Free o Notion)

**Pipeline stages**:
- Lead → Qualified → Demo → Proposta → Contratto → Signed
- Leads trigger da landing page form
- Email sequences automatiche

**File**: `docs/sales/crm-setup.md`

### C.7 — Onboarding scuole self-service

**Flow**:
1. Docente si registra `/signup` (Supabase Auth)
2. Dropdown "Qual è il tuo pacchetto?" → tier attivato
3. Setup classe (nome, età, lingua, studenti)
4. Tutorial interattivo 5 step (Lesson Reader, UNLIM demo, Vision, Fumetto)
5. Email conferma con PDF guida

**File**: `src/components/onboarding/*` (nuovi componenti)

### C.8 — Accreditamento MIUR SOFIA (formazione docenti)

**Processo**:
- Request accreditamento ente formazione (MIUR)
- Design corso formazione "ELAB Tutor + UNLIM per docenti STEM" (4h online + 4h pratica)
- Upload corso su SOFIA platform (piattaforma MIUR ufficiale)
- Ogni scuola che compra Laboratorio+ ottiene 2 crediti formazione gratuiti

**File**: `docs/sales/miur-sofia.md`
**Durata**: 2-4 settimane (burocrazia MIUR)

### C.9 — Videocorsi HeyGen (92 video una tantum)

**Produzione**:
- Avatar HeyGen "Prof ELAB" (custom, italiano, voce neutra)
- Script: 1 video per esperimento × 92 + 5 introduttivi = 97 video
- Durata media: 5-8 min ciascuno
- Generation: 92 × $1-2 = **~$150-200 one-time**
- Storage: Backblaze B2 (+€5/mese ricorrente)
- Playback: embedded HTML5 video nel frontend (no dependency HeyGen runtime)

**File**: 
- `scripts/generate-heygen-videocorsi.js` (batch script)
- `public/videocorsi/vol1-cap6-esp1.mp4` (storage Backblaze URL)

### C.10 — Analytics commerciale + retention tracking

**Metriche da tracciare**:
- Lead → Paid conversion rate
- Pacchetto più venduto
- Churn rate per pacchetto
- CLV (Customer Lifetime Value)
- NPS scuole (via FASE 15 feedback)

**Dashboard**: `/admin/commercial-analytics` (internal)

---

## 🔬 Gate finale PDR Commercial

- [ ] 10 brochure PDF pronte
- [ ] Listino MePA firmato da Davide
- [ ] Landing `/pacchetti` live
- [ ] 5 demo video disponibili
- [ ] 3 contratti template review legale
- [ ] CRM setup operativo
- [ ] Onboarding self-service test end-to-end
- [ ] MIUR SOFIA submission completa
- [ ] 97 videocorsi HeyGen generati + storati
- [ ] Analytics dashboard live
- [ ] Auditor APPROVE

## 🚨 Rischi

| Rischio | Mitigation |
|---------|------------|
| MIUR SOFIA approval 4-6 settimane | Parte subito in parallelo con PDR1-3 dev |
| HeyGen qualità italiano sub-par | A/B test con 3 video campione prima batch 97 |
| Landing conversion <1% | Iterare copy + design dopo primi 30gg |
| Prezzi percepiti alti | Confronto competitor LEGO SPIKE €3740 |

---

**Goal commerciale**: arrivare a **30 scuole Laboratorio vendute entro 30/06/2026** (deadline PNRR) = **€74.700 revenue anno 1**.
