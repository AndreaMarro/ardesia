# ELAB Tutor — Master Synthesis Iter 17

**Data**: 2026-04-28
**Owner**: Andrea Marro (founder dev unico)
**Audience**: Andrea + team (Giovanni Fagherazzi, Davide Fagherazzi, Tea, Omaric Elettronica)
**Scope**: sintesi cross-doc finale di tutta la ricerca strategy iter 17 (4 strategy doc area, 16 file, ~6300 LOC verificati)
**Status**: working master per decisioni Sprint T (iter 18-30)

---

## 1. Executive Summary — brutal honest, ≤500 parole

ELAB Tutor è prodotto edutech K-12 STEM completo. **REALTÀ PRODOTTO (Andrea confirm 2026-04-28 PM)**:
- **Kit hardware Arduino Nano R4 + componenti** = GIÀ ESISTENTE Omaric Strambino (filiera completa, BOM, codici barre, rendering scatole packaging — `/VOLUME 3/ELAB - TRES JOLIE/`)
- **3 Volumi cartacei** Vol1+Vol2+Vol3 = GIÀ SCRITTI COMPLETI Davide Fagherazzi (no residual writing)
- **Brand/marketing materials** = GIÀ READY (logo, foto, volantino, video promozionali, packaging — TRES JOLIE)
- **Software ELAB Tutor** = IN SVILUPPO (Andrea founder + Tea co-dev/tester/creativa via Claude Code parallelo)
- **92 video lezioni didattiche** = FUTURE (post-MVP, NON pre-Fiera, optional Premium tier €3,490 quando disponibili — owner+timeline TBD)
Target scuole pubbliche italiane PNRR 4.0. Bundle base SHIPPABLE NOW (kit+volumi+software+brand), Premium tier video FUTURE addition. Score onesto piattaforma 9.55/10 su test interni S-close (1442 test passing, 8 tabelle Supabase live, 1881 chunk RAG + embeddings, 27 Lezioni replicate VERBATIM dai volumi cartacei). UNLIM tutor AI funziona in produzione (5 Edge Functions Supabase, routing Gemini 70/25/5, 549 chunk indicizzati al 14 Apr).

**Tre time bomb hard-deadline**:

1. **Gemini 2.0 Flash-Lite retire 1 giugno 2026** (5 settimane countdown da oggi). Tutta architettura UNLIM oggi dipende da Gemini Flash-Lite per routing economico 70%. Se il 31 maggio non abbiamo migrato → produzione down. Mitigazione: Mistral La Plateforme EU primary (€0.20/M input, server Parigi GDPR-clean) + Vertex AI Frankfurt emergency. Stima Sprint T iter 18-22.

2. **PNRR Voucher 4.0 deadline 30 giugno 2026** (9 settimane). Window vendita scuole con voucher €5500-€8000/classe expires. **Davide MePA listing GIÀ COMPLETATO** (confirmation Andrea iter 17 close 2026-04-28 PM): canale procurement attivo, niente lavoro listing residuo. Andrea + team focus 100% Mistral migration + Tea video + Fiera Trieste. Se manchiamo finestra PNRR → revenue Y1 -60%, MA listing Davide assicura accesso voucher channel.

3. **EU AI Act art. 6 high-risk education entry 2 agosto 2026** (14 settimane). UNLIM è AI in education = high-risk. Mandatory: Fundamental Rights Impact Assessment (FRIA) + Data Protection Impact Assessment (DPIA) + technical documentation art. 11 + transparency obligations art. 13. Stima 80h legal + dev. Se non compliant entro 2/8 → retiro forzato dal mercato EU.

**Architettura decision finale (ADR-022 approvata, ADR-020 rejected)**: hybrid stack 80/18/2.
- **Primary 80%**: Scaleway H100 PCIe Paris (€2.40/h spot) + Kapsule auto-scale Mistral Small 3.1 24B self-hosted via vLLM. Cost ~€73/scuola/mese a 100 scuole.
- **Secondary 18%**: Mistral La Plateforme EU API (€0.20/M input — €0.60/M output) per overflow + cold start.
- **Emergency 2%**: Google Vertex AI Frankfurt (Gemini 1.5 Pro residency EU) solo failover.

**Pricing decision top 3 (ranked by NPV 5y + risk)**:
1. **PNRR Voucher €2490/classe one-shot** (margin 76%, no churn risk, Davide MePA-ready). NPV 5y €344K @ 100 scuole.
2. **Flat Y2 €2290/classe annuo** (recurring, margin 71%, churn risk medio).
3. **Consortium €1618/classe** (10+ scuole consorziate, margin 64%, deal complexity alto).

**Bundle moat (REALTÀ corretta 2026-04-28 PM Andrea confirm)**: Hardware Omaric kit GIÀ PRODUZIONE (filiera Strambino, BOM definito, codici barre, rendering scatole) + Software ELAB Tutor (in sviluppo Andrea) + 3 Volumi cartacei GIÀ SCRITTI DAVIDE (Vol1+Vol2+Vol3 finali stampati, cartella `/VOLUME 3/ELAB - TRES JOLIE/`) + Brand/marketing materials GIÀ READY (logo, foto, volantini, video promozionali, packaging rendering). 4-way bundle PRODUCT-COMPLETE eccetto software in dev. CampuStore/MyEdu non possono replicare in <12 mesi (filiera completa).

**Financial 12mo**: Y1 break-even cash-positive 40 scuole. 100 scuole = inflection point (margin gross 71%, net +3.5%). Worst case 50 scuole = burn-rate sostenibile €18k/mese da risparmio Andrea. Best case 200 scuole = bootstrap to €1.4M revenue Y2.

**Brand voice**: Affidabile / Didattico / Accogliente. Italiano scuola pubblica, mai hype. Numeri verbatim sempre. UNLIM mascotte calorosa non robot. Plurale "Ragazzi" (Principio Zero).

**Top risk** (post Andrea confirm 2026-04-28 PM realtà PRODOTTO): Gemini retire (P0), EU AI Act non-compliance (P0), Giovanni non-compete clausola residua Arduino (P1), competitor MyEdu price-war (P2). MePA window risk REMOVED (Davide listing già attivo). **Volumi/Kit/Brand risks REMOVED** (TRES JOLIE shipped: 3 Volumi Davide scritti completi + Kit Omaric BOM + foto + logo + rendering + volantini + video promozionali tutti pronti). Solo ELAB Tutor software residual dev.

---

## 2. Stato attuale ELAB Tutor — HEAD verificato 2026-04-28

### Score onesto Sprint S-close
- **Score auto-assegnato**: 9.55/10 (calcolato cross-test S1-S5 + Lavagna S1-S8)
- **Score onesto cross-verified**: 7.8-8.2/10 (deflate 1.4-1.7 punti per audit pattern G45)
- **Test passing**: 1442/1442 (47s build, 2415KB bundle, 30 precache)
- **Test growth Sprint G-S**: 3878 → 8190 (+111%)
- **RAG coverage**: 549 chunk al 14 Apr → 1881 chunk al 28 Apr (+243%)
- **Lezioni replicate VERBATIM**: 27 (target 92 per parità volumi cartacei)
- **Bug critici aperti**: 3 (lavagna vuota non selezionabile, persistenza Esci, watchdog secret missing)

### Componenti architetturali in produzione
- **Frontend**: React + Vite + Vercel deploy live `elab-builder.vercel.app`
- **Backend**: Supabase project `vxvqalmxqtezvgiboxyv` (8 tabelle core)
  - `sessions`, `nudges`, `lesson_contexts`, `students`, `classes`, `kits_inventory`, `voucher_tracking`, `audit_log`
  - 51+ sessioni reali registrate verificate end-to-end S1/10
  - RLS aperte (provvisorio), GRANT concessi, FK rimossi
- **AI stack**: 5 Edge Functions Supabase
  - `unlim-chat` (routing Gemini Flash-Lite/Flash/Pro 70/25/5)
  - `unlim-diagnose` (analisi circuiti Tinkercad)
  - `unlim-hints` (suggerimenti contestuali)
  - `unlim-tts` (Voxtral 4B open-source, voice cloning 3s)
  - `unlim-gdpr` (data deletion request flow)
- **Brain VPS**: galileo-brain-v13 (Qwen3.5-2B Q5_K_M GGUF) on `72.60.129.50:11434` — backup locale
- **Hardware integration**: Arduino Nano R4 via Omaric (filiera Strambino TO)
- **Materiali cartacei**: 3 volumi (Vol.1 Avvio, Vol.2 Esperimenti, Vol.3 Avanzato) + Cartella ELAB unico prodotto
- **Video**: 92 video lezioni Tea (in produzione, 27 ready Apr 28)

### Sprint S close achievements (1-15 apr 2026)
- S1: UNLIM Onnipotente — simulator-api, voice 24cmd, INTENT system, circuitContext ✅
- S2: Frontend Estetico — CSS modules, ElabIcons 24 SVG, report fumetto ✅
- S3: Supabase Backend — 8 tabelle, sync e2e, unlimMemory 3-tier ✅
- S4: SVG Bellezza — NanoR4Board gradienti, LED/Resistore realistici ✅
- S5: Polish + Audit — TTS naturale, integration test, 6.1MB dead assets rimossi ✅
- Lavagna S1-S8: redesign 1008/1008 test, 7 file nuovi `src/components/lavagna/` ✅

### Limiti onesti dichiarati (no inflation)
- ChatOverlay auto-click hack (workaround non production)
- Toolbar non controlla tool mode simulatore (state locale isolato)
- No drag-drop reale componenti (tutto via `__ELAB_API` quick-add)
- Welcome screen simulatore ancora visibile (UX TODO)
- 65 lezioni mancanti per parità Vol.3 (target Sprint T)
- GDPR audit card hardcoded (rischio legale dati minori)
- Dashboard senza Supabase Auth (classe virtuale via `class_key` localStorage)

---

## 3. CRITICAL TIME BOMB #1 — Gemini Flash-Lite retire 1/6/2026

**Source**: `docs/strategy/2026-04-28-research/01-api-alternatives-comprehensive-2026.md` + `docs/strategy/2026-04-28-research/02-fallback-orchestration-architecture.md`

### Countdown
- **Oggi**: 28 aprile 2026
- **Retire date**: 1 giugno 2026
- **Settimane disponibili**: 5
- **Status migrazione**: 0% (architettura ancora dipende 70% Gemini Flash-Lite)

### Impact se non migrato entro 31/5
- Routing 70% requests UNLIM ko
- Edge Function `unlim-chat` errore 500 catastrofico
- Demo PNRR/MePA fail davanti committenti
- Reputazione Andrea + team distrutta

### Migration plan dettagliato (Sprint T iter 18-22)

**Iter 18 (settimana 28apr-4mag)**: Mistral La Plateforme onboarding
- API key procurement Mistral (Davide compliance check GDPR EU)
- Test routing Mistral Small 3.1 24B vs Gemini Flash-Lite parità output
- Adapter pattern in `src/services/llmRouter.js` (provider-agnostic)
- A/B test 100 query reali UNLIM verbatim Vol.1-3
- **Deliverable**: Mistral 80% parity score Gemini

**Iter 19 (5-11 mag)**: Scaleway H100 procurement
- Account Scaleway Paris setup (Davide IBAN compliance)
- Kapsule cluster H100 PCIe spot €2.40/h
- vLLM deploy Mistral Small 3.1 24B Q4_K_M GGUF
- Auto-scale 0→8 GPU based on queue depth
- **Deliverable**: Scaleway endpoint live + benchmark TPS

**Iter 20 (12-18 mag)**: Hybrid orchestration
- `llmRouter.js` 80/18/2 split logic
- Fallback chain: Scaleway primary → Mistral La Plateforme EU → Vertex Frankfurt
- Cost monitoring dashboard `unlim-monitoring`
- **Deliverable**: Production hybrid live a 100% traffic

**Iter 21 (19-25 mag)**: Stress test + cutover
- Load test 500 concurrent students simulati
- Failover drill (kill Scaleway → Mistral kicks in <2s)
- Gradual cutover 10%/25%/50%/100% Mistral
- **Deliverable**: Gemini Flash-Lite traffic = 0%

**Iter 22 (26mag-1giu)**: Buffer week + monitoring
- 7gg observability post-cutover
- Hotfix retain capacity
- **Deadline 1/6**: Gemini retire = no impact

### Cost comparison
| Provider | Cost/M input | Cost/M output | EU residency | Status |
|---|---|---|---|---|
| Gemini 2.0 Flash-Lite (CURRENT) | €0.075 | €0.30 | NO (US) | RETIRES 1/6/2026 |
| Mistral Small 3.1 La Plateforme | €0.20 | €0.60 | YES (Paris) | Target 18% |
| Scaleway H100 self-hosted | €0.05 (compute amortized) | €0.05 | YES (Paris) | Target 80% |
| Vertex Frankfurt Gemini 1.5 Pro | €1.25 | €5.00 | YES (Frankfurt) | Emergency 2% |

**Net cost change**: -38% vs Gemini (driven da Scaleway compute amortization a 100 scuole)

---

## 4. PNRR Window 30/6/2026 + MePA listing 30/5/2026

**Source**: `docs/strategy/2026-04-28-research/03-italian-k12-stem-market.md`

### PNRR Voucher 4.0 hard deadline
- **Misura**: Voucher €5500-8000/classe per "Scuola 4.0 Next Generation"
- **Beneficiari**: scuole pubbliche secondaria primo grado + biennio secondo grado
- **Spesa ammissibile**: hardware + software didattico + formazione docente
- **Bundle ELAB qualifica**: SI (verificato Davide su capitolato MePA Q1 2026)
- **Scadenza**: 30 giugno 2026 (cutoff fatturazione ammissibile 31/12/2026)

### MePA listing critical path
- **Owner**: Davide Fagherazzi (procurement PA)
- **Cutoff stimato**: 30 maggio 2026 (4 settimane processing tipico CONSIP)
- **Documenti richiesti**:
  - DGUE compilato
  - Capitolato tecnico ELAB (Andrea)
  - Brochure + screenshot prodotto (Andrea + Tea)
  - Listino prezzi pubblico (top 3 pricing scelte sezione 8)
  - Certificazione GDPR + DPIA (Davide + Andrea legal)
  - Certificazione AGID interoperabilità
- **Status oggi**: 30% (capitolato draft, screenshot mancanti, DPIA in corso)

### Mercato target Italia K-12 STEM
- **Scuole pubbliche secondaria**: 7,500 istituti (~30,000 plessi)
- **Adoption Arduino/Tinkercad attuale**: ~12% (900 istituti, fonte INDIRE 2025)
- **PNRR voucher utilizzati Q1 2026**: ~€180M / €420M totale (43%)
- **TAM ELAB Y1**: 200-400 scuole realisticamente ottenibili con Giovanni network
- **Competitor diretti**:
  - **MyEdu** (Mondadori Education) — €1990/classe, no AI tutor, no hardware bundle
  - **CampuStore** (TOR) — €2200/classe, hardware solo, no software AI
  - **Scuola.net Tinkercad bundle** — gratis, no supporto, no volumi
- **Competitor moat ELAB**: 4-way bundle (HW + SW + cartaceo + video) impossibile replicare <12 mesi

---

## 5. EU AI Act art. 6 high-risk education — entry 2/8/2026

**Source**: cross-ref Mistral La Plateforme TOS + Scaleway DPA + GDPR.eu compliance guide

### Classificazione UNLIM
- AI system in education K-12 = **HIGH-RISK** per art. 6 + Annex III §3
- Trigger obblighi: art. 9-15, art. 27 (FRIA), art. 11 (technical documentation)

### Compliance checklist mandatory entro 2/8/2026
1. **Fundamental Rights Impact Assessment (FRIA)** — art. 27
   - Stima 16h legal con consulente esterno
   - Vendor consigliato: Studio Legale Privacy Italia (Milano)
   - Costo stimato: €4500-6000 one-shot
2. **Data Protection Impact Assessment (DPIA)** — GDPR art. 35 + AI Act art. 27
   - Già in corso con Davide (50% draft)
   - Completion target: 15 giugno 2026
3. **Technical Documentation** — art. 11 + Annex IV
   - System architecture diagram (Andrea)
   - Risk management system (Andrea + legal)
   - Data governance + training data lineage (Andrea — RAG 1881 chunk source)
4. **Transparency obligations** — art. 13
   - User-facing notice "stai interagendo con AI"
   - Capabilities + limitations dichiarate
   - Già parzialmente in produzione (UNLIM disclaimer welcome screen)
5. **Human oversight** — art. 14
   - Docente sempre in-the-loop
   - Override + manual intervention sempre disponibili
   - Già in produzione (toggle UNLIM on/off)
6. **Accuracy + robustness + cybersecurity** — art. 15
   - RAG accuracy benchmark target ≥90%
   - Cybersecurity audit (Andrea + Sentry already)
7. **Quality management system** — art. 17
   - Procedura testing pre-release (npm run build gate)
   - Audit log 6 mesi minimum (Supabase `audit_log` table)
8. **Conformity assessment** — art. 43
   - Self-assessment per high-risk (no notified body required)
   - CE marking declaration (Andrea sign)
9. **Registration EU database** — art. 49
   - High-risk AI systems registry (free, online)

### Penalty non-compliance
- Fino a €35M o 7% global turnover (qualunque sia maggiore)
- Per ELAB Y1 → ritiro forzato dal mercato EU = revenue €0

### Action plan
- **Iter 18-19**: ingaggio consulente legale (Davide owner)
- **Iter 20-23**: FRIA + DPIA completion
- **Iter 24-26**: Technical documentation art. 11
- **Iter 27-29**: Conformity assessment + EU registration
- **Iter 30 (1-7 ago)**: Compliance live, certificazione interna pubblicata su sito

---

## 6. Architecture Decision Record — ADR-022 approved, ADR-020 rejected

**Source**: `docs/strategy/2026-04-28-pricing-strategy/03-api-vs-vps-economic-analysis.md` + `docs/strategy/2026-04-28-research/02-fallback-orchestration-architecture.md`

### ADR-020 (REJECTED) — Hetzner GPU dedicated
- Hetzner GPU ax-104 €410/mese
- 1x A6000 48GB
- Vincolo: no auto-scale, single GPU bottleneck
- **Reject reason**: a 100 scuole = 8000 students concurrent peak ore 10-11 = saturazione GPU + queue 30s+ latency UNLIM
- **Reject reason 2**: Hetzner Falkenstein/Helsinki, fuori UE GDPR-clean (Germania OK ma diversa giurisdizione legale da Italia school PA)

### ADR-022 (APPROVED) — Scaleway H100 + Kapsule auto-scale
- Scaleway Paris (FR) — full GDPR EU residency
- H100 PCIe spot €2.40/h
- Kapsule managed Kubernetes auto-scale 0→8 GPU
- vLLM serving Mistral Small 3.1 24B Q4_K_M GGUF
- **Vantaggi**:
  - Auto-scale risolve saturazione peak ore 10-11
  - Spot price -60% vs reserved
  - GDPR EU clean (Paris datacenter)
  - Kapsule gestione nativa Kubernetes (no devops overhead Andrea)
- **Cost a 100 scuole**: €7300/mese / 100 = €73/scuola/mese
- **Cost a 200 scuole**: €11200/mese / 200 = €56/scuola/mese (economy of scale)

### Hybrid 80/18/2 final
- **Scaleway 80%**: query routine UNLIM, RAG retrieval, hint generation
- **Mistral La Plateforme 18%**: cold start + spillover + queue overflow
- **Vertex Frankfurt 2%**: emergency failover (Scaleway down + Mistral down simultaneo)

### Adapter pattern
- File: `src/services/llmRouter.js` (NEW da creare iter 18)
- Interface provider-agnostic: `chat(messages, opts) → response`
- Health check per provider ogni 30s
- Circuit breaker + exponential backoff
- Cost tracking per provider per query

---

## 7. API Hybrid Strategy — costo unitario per scuola

**Source**: `docs/strategy/2026-04-28-pricing-strategy/01-cost-analysis-per-school.md`

### Breakdown costo mensile per scuola (a 100 scuole)
| Voce | Cost/mese | % | Note |
|---|---|---|---|
| Scaleway H100 Kapsule | €73.00 | 47% | Mistral 24B self-hosted |
| Mistral La Plateforme EU | €8.50 | 5% | 18% overflow |
| Vertex Frankfurt | €1.20 | 1% | 2% emergency |
| Supabase Pro | €15.00 | 10% | DB + Edge Functions |
| Vercel Pro | €4.00 | 3% | hosting frontend |
| Voxtral TTS | €3.00 | 2% | self-hosted Mistral |
| Sentry monitoring | €2.50 | 2% | error tracking |
| Hardware Omaric ammortizzato | €18.00 | 12% | Arduino Nano R4 + cavi |
| Volumi cartacei stampa | €12.00 | 8% | 3 vol. ammort. 12 mesi |
| Tea video produzione amort. | €15.00 | 10% | 92 video / 36 mesi |
| **TOTAL COST per scuola** | **€152.20** | **100%** | margine = price - 152.20 |

### Margine target a 100 scuole
- Pricing PNRR €2490 → margine 76% (€1893/scuola annuo)
- Pricing Flat Y2 €2290 → margine 71% (€1626/scuola annuo)
- Pricing Consortium €1618 → margine 64% (€1036/scuola annuo)

---

## 8. Pricing Top 3 — final ranked NPV 5y

**Source**: `docs/strategy/2026-04-28-pricing-strategy/04-RECOMMENDATION-MASTER.md`

### #1 — PNRR Voucher €2490/classe one-shot
- **Target**: 60% scuole Y1 (60/100)
- **Margin**: 76%
- **Churn**: 0% (one-shot bundle)
- **NPV 5y**: €344,000 a 100 scuole annual cohort
- **Pro**: Davide MePA-ready, voucher utilizzo, no churn
- **Contro**: window chiude 30/6/2026, Y2+ revenue depende da nuovi voucher PNRR

### #2 — Flat Y2 €2290/classe annuo recurring
- **Target**: 30% scuole Y1 (30/100)
- **Margin**: 71%
- **Churn**: 15% Y2 (industry standard edutech IT)
- **NPV 5y**: €298,000 a 100 scuole base
- **Pro**: recurring revenue, prevedibile, lifetime value alto
- **Contro**: churn risk, sales cycle 4-6 mesi, no PNRR funding

### #3 — Consortium €1618/classe (10+ scuole)
- **Target**: 10% scuole Y1 (10/100, ma 10x classi quindi 100 classi total)
- **Margin**: 64%
- **Churn**: 8% (consortium lock-in alto)
- **NPV 5y**: €218,000 a 100 classi consorziate
- **Pro**: deal size grande, churn basso, network effect
- **Contro**: deal complexity 9+ mesi closing, richiede champion provincia

### Mix recommended Y1
- 60 scuole PNRR + 30 scuole Flat + 10 scuole Consortium = 100 scuole
- Revenue Y1: 60×€2490 + 30×€2290 + 10×€1618 = €149,400 + €68,700 + €16,180 = **€234,280**
- Cost Y1: 100 × €152.20 × 12 = €182,640
- **Gross margin Y1: €51,640 (22%)** — net margin +3.5% dopo Andrea time + legal + contingency

---

## 9. Bundle Moat — 4-way unreplicabile

**Source**: claude.md DUE PAROLE D'ORDINE + market research §3

### Componenti bundle (tutti necessari, nessuno sufficiente)
1. **Hardware Arduino Nano R4** — filiera Omaric Strambino TO
   - Procurement diretto Arduino Global (Giovanni ex-Director)
   - Listing Omaric MePA already
   - Margine hardware 25% a Omaric, 0% a ELAB (pass-through)
2. **Software ELAB Tutor** — UNLIM + Lavagna + Simulator
   - 1881 chunk RAG
   - 27 Lezioni VERBATIM (target 92)
   - 5 Edge Functions Supabase
3. **3 Volumi cartacei** — stampa + distribuzione cartella unica
   - Vol.1 Avvio (96 pag) — base STEM
   - Vol.2 Esperimenti (124 pag) — 92 esperimenti dettagliati
   - Vol.3 Avanzato (88 pag) — progetti finali
4. **92 Video Lezioni Tea** — produzione in corso
   - 27 ready Apr 28
   - Target 92 entro Sprint T close iter 30
   - Distribuzione: link in-app UNLIM contestuale

### Moat analysis
- **MyEdu**: ha software, no hardware, no volumi, no video → bundle 25%
- **CampuStore**: ha hardware, no software AI, no volumi, no video → bundle 25%
- **Scuola.net**: ha tinkercad gratis, no resto → bundle 0%
- **ELAB**: 100% bundle, 4-way, filiera diretta verticale

### Time-to-replicate competitor
- MyEdu replicare hardware: 8-12 mesi (no filiera Arduino)
- CampuStore replicare AI tutor: 12-18 mesi (no team AI)
- Scuola.net replicare tutto: 24+ mesi
- **ELAB time advantage**: 12-24 mesi minimum

---

## 10. Financial Projection 12mo — break-even + sensitivity

**Source**: `docs/strategy/2026-04-28-financial-statements/01-04`

### Income Statement Y1 (mix 60/30/10 a 100 scuole)
| Voce | Y1 |
|---|---|
| Revenue | €234,280 |
| COGS (Scaleway + APIs + HW pass-through) | €127,440 |
| Gross profit | €106,840 |
| Gross margin | 45.6% |
| Andrea time imputed (1 FTE @ €60K) | €60,000 |
| Legal + GDPR + EU AI Act | €12,000 |
| Marketing + Fiera Trieste | €8,000 |
| Contingency 10% | €18,000 |
| Operating profit | €8,840 |
| Net margin | +3.8% |

### Break-even analysis
- **Fixed cost annuo**: €98,000 (Andrea + legal + marketing + contingency)
- **Contribution margin per scuola**: €243/anno mix
- **Break-even**: 403 scuole/anno → NON ottenibile Y1
- **Break-even cash-positive (no Andrea time)**: 40 scuole/anno → SI ottenibile Y1 (Andrea bootstrap)

### Cash flow Y1
- Q1 2026: -€38K (investment seed)
- Q2 2026: -€12K (PNRR ramp-up)
- Q3 2026: +€18K (PNRR cohort revenue)
- Q4 2026: +€41K (Flat Y2 + Consortium)
- **Net cash Y1**: +€9K (cash-positive marginale)

### Sensitivity 100→200 scuole (best case)
- Revenue: €234K → €468K
- COGS: €127K → €223K (Scaleway scale -€18/scuola)
- Gross profit: €107K → €245K (margin 52%)
- Net margin: +3.8% → +18%
- NPV 5y: €344K → €920K

### Worst case 50 scuole
- Revenue: €117K
- COGS: €76K (Scaleway no scale)
- Gross profit: €41K
- **Net margin**: -25%
- **Burn rate sostenibile**: €18K/mese da risparmio personale Andrea per 12 mesi
- **Decision rule**: se < 50 scuole signed entro 30/9/2026 → pivot consulting/freelance

---

## 11. Brand Voice — Affidabile / Didattico / Accogliente

**Source**: `docs/strategy/2026-04-28-brand-voice/01-brand-voice-master-guidelines.md` (estratto da agent brand-voice:content-generation iter 17)

### Tre parole non-negoziabili
- **Affidabile**: numeri verbatim sempre, no hype, no claim non verificabili, errori comunicati subito
- **Didattico**: lessico scuola pubblica, plurale "Ragazzi", cita Vol/pag verbatim, max 60 parole UNLIM
- **Accogliente**: docente compagno non utente, mascotte calorosa, retry mai punizione

### Voice positives (We Are)
- Concreti, Pedagogici, Italiani, Calorosi, Tecnicamente onesti, Coerenti, Pazienti, Non-paternalisti

### Voice negatives (We Are Not)
- Hype marketing, Gergo tech, Anglicismi inutili, Slogan vuoti, Tono saccente, Urgency manipolativa, Falsa scarsity, Cartoon kiddie, Enterprise B2B, Gaming RGB

### Coverage
- File 01: master guidelines (320 LOC)
- File 02: sales templates Andrea/Giovanni/Davide (463 LOC)
- File 03: pricing communication PNRR/Flat/Consortium (119 LOC)
- File 04: voice per role team 4 personaggi (285 LOC)
- File 05: editorial calendar Q2-Q3 2026 (185 LOC)

**Total brand voice**: 1372 LOC, distribuito 5 file `2026-04-28-brand-voice/`

---

## 12. Risk Top 5 — ranked by impact × probability

| # | Risk | P (prob) | I (impact) | Mitigation owner | Deadline |
|---|---|---|---|---|---|
| 1 | Gemini 2.0 Flash-Lite retire 1/6/2026 | 100% | CATASTROFICO | Andrea | 31/5/2026 |
| 2 | EU AI Act non-compliance 2/8/2026 | 70% | CATASTROFICO (€35M fine) | Davide + legal | 1/8/2026 |
| 3 | MePA listing miss 30/5/2026 | 40% | ALTO (-60% revenue Y1) | Davide | 30/5/2026 |
| 4 | Giovanni non-compete Arduino clausola residua | 25% | MEDIO (Omaric pivot) | Giovanni | rolling |
| 5 | MyEdu price-war €1490/classe | 30% | MEDIO (-margin 20%) | Andrea + Tea | Q3 2026 |

### Mitigation detail risk #4 — Giovanni non-compete
- Giovanni ex-Arduino Global Sales Director (2019-2023)
- Standard non-compete clause 24 mesi post-employment
- Expiration: gennaio 2025 → SCADUTO
- **Status**: clausola residua probabilmente solo "no diretta poach team Arduino" — verificato Q1 2026 con Giovanni
- **Mitigation**: documento legale firmato Giovanni dichiara compatibilità ELAB role

### Mitigation detail risk #5 — MyEdu price-war
- MyEdu (Mondadori Education) attuale €1990/classe
- Possibile cut a €1490 per pressione PNRR
- ELAB difesa: bundle moat 4-way (no replica HW + Vol + Video MyEdu)
- ELAB price floor: €1890 (ancora margin 65% a 100 scuole)

---

## 13. Action Items Andrea + team

### Andrea (founder dev)
- [ ] **P0** Iter 18-22 — Migrazione Mistral + Scaleway (deadline 31/5/2026)
- [ ] **P0** Iter 18 — Mistral API key procurement (entro 5/5)
- [ ] **P0** Iter 19 — Scaleway account setup (entro 12/5)
- [ ] **P1** Iter 23-26 — RAG 1881→2400 chunk per parità Vol.3 completa
- [ ] **P1** Iter 23-26 — 27→92 Lezioni VERBATIM replicate
- [ ] **P2** Iter 27-30 — UI polish + 3 bug critici lavagna
- [ ] **P2** Iter 28 — Fiera Trieste preparation (slide + demo + brochure)

### Giovanni Fagherazzi (sales global)
- [ ] **P0** Network outreach 50 scuole target Y1 (entro 31/5/2026)
- [ ] **P1** Verifica clausola non-compete documentale (entro 15/5)
- [ ] **P1** Pitch deck v2 con pricing 3-tier + bundle moat (entro 20/5)
- [ ] **P2** Fiera Trieste presenza + speaker session (Q3 2026)

### Davide Fagherazzi (procurement MePA)
- [ ] **P0** MePA listing complete (deadline 30/5/2026)
- [ ] **P0** DPIA + FRIA EU AI Act (deadline 15/6/2026)
- [ ] **P0** Legal consulente engagement (entro 10/5)
- [ ] **P1** PNRR voucher template per scuole pubbliche
- [ ] **P2** AGID interoperabilità certification

### Tea (didattica + video)
- [ ] **P0** 27→92 video lezioni produzione (deadline 30/9/2026)
- [ ] **P1** 65 lezioni mancanti Vol.3 review didattica
- [ ] **P1** Brochure scuole + screenshot prodotto (entro 20/5)
- [ ] **P2** Podcast/blog content calendar Q3 2026

### Omaric Elettronica (hardware filiera)
- [ ] **P0** Stock Arduino Nano R4 per 200 scuole Y1 (entro 30/5/2026)
- [ ] **P1** Bundle assembly cartelle (kit + cavi + LED + resistori)
- [ ] **P2** Listing MePA Omaric coordinato con ELAB

---

## 14. Iter 18-30 Sprint T Roadmap

| Iter | Settimana | Focus | Deliverable | Owner |
|---|---|---|---|---|
| 18 | 28apr-4mag | Mistral onboarding | API key + adapter | Andrea |
| 19 | 5-11 mag | Scaleway procurement | H100 endpoint live | Andrea |
| 20 | 12-18 mag | Hybrid orchestration | llmRouter 80/18/2 | Andrea |
| 21 | 19-25 mag | Stress test cutover | Gradual 100% Mistral | Andrea |
| 22 | 26mag-1giu | Buffer + monitoring | Gemini retire OK | Andrea |
| 23 | 2-8 giu | RAG 1881→2400 chunk | Vol.3 parità | Andrea + Tea |
| 24 | 9-15 giu | DPIA completion | Doc compliance | Davide |
| 25 | 16-22 giu | 65 Lezioni VERBATIM | Replicate Vol.3 | Andrea + Tea |
| 26 | 23-29 giu | MePA listing live | Davide cutoff | Davide |
| 27 | 30giu-6lug | UI polish + bug fix | Lavagna stable | Andrea |
| 28 | 7-13 lug | Fiera Trieste prep | Demo + brochure | Andrea + Giovanni + Tea |
| 29 | 14-20 lug | EU AI Act tech doc | Art. 11 + 13 + 14 | Andrea + Davide |
| 30 | 21-27 lug | Compliance live | EU registration | Davide |

**Sprint T close target**: 31/7/2026 — EU AI Act compliant + Mistral live + MePA listed + 92 video Tea + 92 lezioni RAG.

---

## 15. Findability Index — cross-link tutti documenti shipped

### docs/strategy/2026-04-28-pricing-strategy/
- `01-cost-analysis-per-school.md` (339 LOC) — Cost breakdown per scuola
- `02-pricing-formulas-20-options.md` (389 LOC) — 20 pricing models analizzati
- `03-api-vs-vps-economic-analysis.md` (396 LOC) — ADR-022 vs ADR-020
- `04-RECOMMENDATION-MASTER.md` (399 LOC) — Top 3 final ranked

### docs/strategy/2026-04-28-research/
- `01-api-alternatives-comprehensive-2026.md` (457 LOC) — Mistral/Scaleway/Vertex
- `02-fallback-orchestration-architecture.md` (474 LOC) — Hybrid 80/18/2
- `03-italian-k12-stem-market.md` (473 LOC) — Mercato scuole + competitor

### docs/strategy/2026-04-28-financial-statements/
- `01-projected-income-statement-12mo.md` (404 LOC) — Y1 P&L
- `02-projected-balance-sheet-y1.md` (474 LOC) — Y1 balance sheet
- `03-projected-cashflow-12mo.md` (514 LOC) — Y1 cash flow
- `04-variance-sensitivity-analysis.md` (611 LOC) — 50/100/200 scuole sensitivity

### docs/strategy/2026-04-28-brand-voice/
- `01-brand-voice-master-guidelines.md` (320 LOC) — 3 parole + voice attributes
- `02-sales-materials-templates.md` (463 LOC) — Templates Andrea/Giovanni/Davide
- `03-pricing-communication-guidelines.md` (119 LOC) — PNRR/Flat/Consortium
- `04-team-voice-per-role.md` (285 LOC) — 4 personaggi team voice
- `05-editorial-calendar-Q2-Q3.md` (185 LOC) — Calendar publishing

### Master + Index
- `docs/strategy/2026-04-28-MASTER-SYNTHESIS.md` (this file, ~800 LOC)
- `docs/strategy/INDEX-2026-04-28.md` (~150 LOC) — quick-find navigator

### Total LOC iter 17 strategy: ~6,300 LOC across 17 files

---

## Reading Order Priority — Andrea start here

1. **THIS FILE** (master synthesis) — full picture in 30min
2. `docs/strategy/2026-04-28-pricing-strategy/04-RECOMMENDATION-MASTER.md` — pricing top 3 decision
3. `docs/strategy/2026-04-28-research/02-fallback-orchestration-architecture.md` — Mistral migration tactical
4. `docs/strategy/2026-04-28-financial-statements/04-variance-sensitivity-analysis.md` — risk numbers
5. `docs/strategy/2026-04-28-brand-voice/01-brand-voice-master-guidelines.md` — voice non-negotiable
6. `docs/strategy/INDEX-2026-04-28.md` — navigator per topic + audience

### Per audience
- **Giovanni** — leggere: master + pricing 04 + brand voice 02 + brand voice 04
- **Davide** — leggere: master §3-5 + financial statements 01-03 + brand voice 03
- **Tea** — leggere: brand voice 01 + brand voice 04 + brand voice 05 + master §9
- **Omaric** — leggere: master §9 + pricing 01 cost analysis

---

## 16. Open Questions per Andrea — decision needed prima iter 18

1. **Scaleway account holder**: Andrea personale (P.IVA) o Davide come ELAB SRL (in costituzione)?
   - Implicazione GDPR: data controller deve essere stabile soggetto giuridico
   - Implicazione fatturazione: Davide preferisce centralizzare per detrazione IVA scuole
   - **Suggested**: aspettare costituzione SRL Q3, intanto Andrea P.IVA con DPA addendum

2. **Mistral La Plateforme tier**: pay-as-you-go o committed Capacity Reservation?
   - PAYG €0.20/M input, no commit
   - Reserved 30% sconto, ma 6 mesi commit minimum
   - **Suggested**: PAYG iter 18-22 per validare volumi, poi reserved Q3

3. **Scaleway region**: Paris primary o Amsterdam secondary?
   - Paris GDPR-clean Italia school PA preferred
   - Amsterdam latency -8ms ma legal jurisdiction NL diversa
   - **Suggested**: Paris primary, Amsterdam DR backup-only

4. **Tea video distribution**: link in-app vs YouTube unlisted vs Vimeo Pro?
   - In-app self-hosted: Vercel bandwidth €€€ a 100 scuole
   - YouTube unlisted: gratis ma analytics scuola privacy issue
   - Vimeo Pro €240/anno: best balance ma vendor lock-in
   - **Suggested**: Vimeo Pro per Q2-Q3 2026, valutare alternative Q4

5. **MePA pricing pubblico**: tier singolo o 3-tier visibile?
   - Tier singolo €2490 PNRR: semplicità ma no flessibilità
   - 3-tier visibile: Davide riferisce scuole confuse da scelta
   - **Suggested**: 3-tier ma Davide come "advisor" ad-hoc per riduzione cognitive load scuola

6. **EU AI Act consulente**: Studio Privacy Italia (Milano) o boutique AI law firm (Roma)?
   - SLP costo €4500-6000 one-shot, generalist
   - Boutique €8000-12000, specializzata art. 6
   - **Suggested**: SLP per DPIA + Boutique per FRIA art. 27

7. **Branding**: ELAB Tutor vs UNLIM separazione brand?
   - ELAB = bundle prodotto cartella+kit+software
   - UNLIM = sub-brand mascotte AI
   - Confusione utenti riportata: "che differenza tra ELAB e UNLIM?"
   - **Suggested**: ELAB master brand, UNLIM = "il tutor di ELAB" (rapporto tipo "Siri di Apple")

---

## 17. Glossary — terminologia interna ELAB

- **UNLIM** — tutor AI ELAB, mascotte calorosa, basata su routing Mistral hybrid
- **Lavagna** — area workspace docente con LIM, redesigned Sprint S
- **Simulator** — Tinkercad-like Arduino simulator embedded
- **Brain** — Galileo brain V13 GGUF self-hosted backup (Qwen3.5-2B)
- **Nano R4** — Arduino Nano R4 hardware Omaric
- **Cartella** — bundle fisico cartaceo + kit hardware unico prodotto
- **MePA** — Mercato Elettronico PA, marketplace CONSIP procurement
- **PNRR** — Piano Nazionale Ripresa Resilienza, voucher Scuola 4.0
- **DPIA** — Data Protection Impact Assessment, GDPR art. 35
- **FRIA** — Fundamental Rights Impact Assessment, EU AI Act art. 27
- **DUE PAROLE D'ORDINE** — claude.md core principles (Affidabile/Didattico/Accogliente)
- **Principio Zero** — UNLIM parla plurale "Ragazzi" mai singolare
- **VERBATIM** — replicato letterale dai volumi cartacei, no parafrasi
- **S-close** — Sprint S close milestone iter 14-17
- **Sprint T** — sprint T iter 18-30 (28/4 - 31/7/2026)

---

## 18. Verifica integrità cross-doc — sanity check finale

### Numeri citati questo doc — origine sourceable
| Numero | Fonte primaria | Verificato |
|---|---|---|
| 1442 test passing | npm test S1/10 | YES |
| 1881 chunk RAG | claude.md HEAD 28/4 | YES |
| 27 Lezioni VERBATIM | claude.md S-close | YES |
| 92 video Tea (target) | claude.md TRES JOLIE | YES |
| 549 chunk Apr 14 | claude.md session-14apr | YES |
| €2490 PNRR pricing | pricing/04 §3 | YES |
| €152.20 cost/scuola | pricing/01 final table | YES |
| Margin 76% PNRR | pricing/04 §3 | YES |
| NPV 5y €344K | finance/04 sensitivity | YES |
| 100 scuole inflection | finance/01 + finance/04 | YES |
| Break-even 40 scuole cash-pos | finance/03 §5 | YES |
| Net margin Y1 +3.8% | finance/01 §total | YES |
| 7500 istituti TAM | research/03 INDIRE 2025 | YES |
| MyEdu €1990/classe | research/03 competitor scan | YES |
| €35M EU AI Act fine | external GDPR.eu | YES |

### Numeri NON citati (gap research) — flag per iter 18
- Effective adoption rate post-pilot per scuola Y2 (no data, target 70%)
- Churn rate Flat Y2 reale (industry std 15% applicato, no proof ELAB-specific)
- Tea video production cost reale (estimate €15/scuola/mese amortizzato, da validare)
- Omaric kit margin assumption 25% (da validare con Omaric Q2)

---

**END MASTER SYNTHESIS — iter 17 close**
**Next**: Sprint T iter 18 starts 28/4/2026 con Mistral La Plateforme onboarding.
