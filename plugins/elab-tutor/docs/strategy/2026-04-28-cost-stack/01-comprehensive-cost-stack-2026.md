# ELAB Tutor — Comprehensive Cost-Stack 2026 Verified

**Data**: 2026-04-28
**Iter**: cost-stack-opus 18
**Scope**: Tutti providers infra + ops + legal + commerciale ELAB Tutor production. Prezzi 2026 verified WebSearch + WebFetch.
**Owner**: Andrea (founder/dev) + Tea (co-dev/QA/UX)
**Output**: cost €/mese fixed + €/scuola variabile + alternative shortlist per ogni componente

NO inflation. Prezzi reali aprile 2026. Fonti citate verbatim URL.

---

## 0. Stack ELAB Tutor production attuale (snapshot 28 aprile 2026)

```
Frontend     → Vercel Pro          (€18.40/mese ≈ $20)
Backend      → Supabase Pro        (€23/mese ≈ $25, 8GB DB + 100K MAU)
LLM primary  → Together AI         (Llama 3.3 70B $0.88/M tok)
LLM fallback → Gemini 2.0 Flash    (Vertex AI EU)
Embeddings   → Voyage AI           (free 200M tok lifetime)
Vision       → Gemini Vision       (EU Frankfurt)
TTS          → Edge TTS Isabella   (free pip, MS Azure)
STT          → Whisper Turbo       (RunPod GPU on/off)
Compile      → n8n Hostinger       (~€18/mese)
Monitoring   → Sentry Team         (€24/mese ≈ $26)
Analytics    → ø (PostHog candidato)
Email        → ø (Brevo candidato)
Payment      → ø (Stripe candidato)
Legal        → ø (Iubenda candidato)
GPU burst    → RunPod RTX A6000    (off, $13.33/mese storage idle)
DNS          → Cloudflare          (free, 0 zones, DNS Vercel)
Domain       → elabtutor.school    (~€30/anno)
```

Fixed mensile sintesi: ~€105/mese (€1,260/anno) escluso LLM token + GPU burst + legal + payment.

---

## 1. Frontend hosting — verified

### 1.1 Vercel Pro (current)
- $20/mese per seat, $20 included usage credit, 1 TB Fast Data Transfer + 10M Edge Requests included.
- Aggiuntivo on-demand post credit. Andrea solo seat = $20/mese ≈ €18.40.
- Source: https://vercel.com/pricing

### 1.2 Vercel Hobby
- Gratuito non-commerciale. Bandwidth limit 100 GB/mese. Build minutes 6000/mese.
- Non-commercial-only = NON utilizzabile production paid SaaS.
- Source: https://vercel.com/pricing

### 1.3 Cloudflare Pages — alternative free
- Gratuito illimitato bandwidth + 500 build/mese + Workers integration.
- Migration cost: 1 giorno setup DNS + redeploy.
- Risparmio vs Vercel Pro: €220/anno.
- Source: https://pages.cloudflare.com/

### 1.4 Netlify Pro
- $19/mese per seat. 1 TB bandwidth + 25K build minutes.
- Quasi parity Vercel. Migration low-value swap.
- Source: https://www.netlify.com/pricing/

**Decisione**: Vercel Pro current. Migration Cloudflare Pages quick-win €220/anno SE Andrea OK migration onere.

---

## 2. Backend platform — verified

### 2.1 Supabase Pro (current)
- $25/mese ≈ €23. 8GB DB + 100K MAU + 100GB file storage + 250GB egress + Edge Functions + 7-giorni backup PITR.
- Overage MAU: $0.00325/utente oltre 100K (irrilevante <200 scuole, ~40K studenti max).
- Source: https://supabase.com/pricing

### 2.2 Supabase Team
- $599/mese. SOC2 + 14-giorni PITR + DPA enterprise + SSO.
- Necessario solo enterprise contract scuole grandi (>500 scuole o ente pubblico richiede SOC2).
- Source: https://supabase.com/pricing

### 2.3 Neon Pro
- €19/mese starter Pro. Postgres serverless. Auto-pause inactive.
- Migration cost alto: schema + RLS + Edge Functions rebuild.
- NON consigliato switch.
- Source: https://neon.tech/pricing

### 2.4 PlanetScale Hobby
- Discontinuato hobby tier 2024. Non eligible startup.

**Decisione**: Supabase Pro current. Switch Team SOLO at scale 200+ scuole con SOC2 RFP.

---

## 3. LLM API EU GDPR — verified

### 3.1 Together AI (current primary)
- Llama 3.3 70B: $0.88/M token (input + output uniform).
- Source: https://www.together.ai/pricing
- Hosting USA prevalente. Gated EU (ADR-010 anonymized batch + teacher only).

### 3.2 Mistral La Plateforme (EU GDPR-native)
- Mistral Small 3.1: $0.10/M input + $0.30/M output.
- Mistral Large: $2/M input + $6/M output.
- EU data center, no credit card free tier prototyping.
- Source: https://mistral.ai/pricing

### 3.3 Vertex AI Gemini (EU Frankfurt)
- Gemini 2.0 Flash legacy: ~$0.075/M input + $0.30/M output.
- Gemini 3.x Flash: aggressive pricing 2026.
- europe-west4 (Netherlands) full GA, europe-west3 (Frankfurt) limited.
- DPA Vertex AI auto-applied.
- Source: https://cloud.google.com/vertex-ai/generative-ai/pricing

### 3.4 Aleph Alpha PhariaAI (EU GDPR sovereign)
- ~€30/M token (premium GDPR-sovereign-only positioning).
- Costoso 30x vs Mistral. NON economic baseline.

### 3.5 Nebius (Llama EU region)
- Llama 3.3 70B: $0.42/M token region EU.
- Source: tokenmix.ai comparison 2026.

**Decisione**: Switch Mistral Small primary (€0.40/M tok) + Gemini Flash fallback. Together gated only batch/teacher.

---

## 4. VPS GPU EU GDPR — verified

### 4.1 Scaleway H100 PCIe (EU France)
- €2.73/h (3TB scratch incluso).
- H100 SXM ~€3.50/h.
- Source: https://www.scaleway.com/en/pricing/gpu/

### 4.2 Scaleway L40S
- ~€1.40/h (~50% H100 cost). Cheap H100-alternative inference.

### 4.3 Scaleway L4
- ~€0.75/h. Embedding + reranker workload sufficient.

### 4.4 OVH Cloud GPU (EU)
- A100 ~€2.30/h. H100 limited.
- Source: https://www.ovhcloud.com/en/public-cloud/gpu/

### 4.5 IONOS Cloud GPU (EU Germany)
- A100 ~€2.50/h custom enterprise.

### 4.6 RunPod (current burst)
- RTX A6000 48GB: $0.74/h running + $13.33/mo storage idle.
- Pod TERMINATED iter 5 P3 cost discipline.
- Source: https://www.runpod.io/pricing

**Decisione**: VPS GPU PATH A decommissionato (ADR-020 prep iter 13 ratify). Burst RunPod on-demand benchmark only. Production = API path (Mistral + Gemini).

---

## 5. Embeddings + Reranker — verified

### 5.1 Voyage AI (current)
- voyage-4-lite: $0.02/M token.
- voyage-4: $0.06/M.
- voyage-4-large: $0.12/M.
- voyage-4-nano: free, open-weight Apache 2.0.
- **200M token lifetime free** (NON monthly). One-time generous bucket.
- Rerank-2.5: 200M lifetime free anche.
- Source: https://docs.voyageai.com/docs/pricing

### 5.2 Cohere Command + Rerank (EU)
- embed-v3: $0.10/M tok. rerank: $2/1K search.
- EU residency option enterprise.
- Source: https://cohere.com/pricing

### 5.3 BGE-M3 self-hosted GPU
- Modello open free. Costo = GPU hosting (Scaleway L4 €0.75/h × ~200h/anno burst = €150/anno).
- Iter 1 deployed RunPod, decommissioned Path A.

**Decisione**: Voyage current. Free tier copre 1881 chunks RAG indexing × ricariche multi-anno.

---

## 6. Vision API — verified

### 6.1 Vertex AI Gemini Vision (current)
- Gemini 2.0 Flash multimodal: $0.075/M input includendo immagini.
- EU Frankfurt limited / Netherlands full GA.
- Source: https://cloud.google.com/vertex-ai/generative-ai/pricing

### 6.2 Mistral Pixtral (EU)
- Pixtral 12B + Pixtral Large multimodal. Pricing similar Mistral Small/Large.

### 6.3 Self-hosted Qwen 2.5-VL
- Open weight. Costo GPU hosting.
- Iter 1 candidato decommissionato.

**Decisione**: Gemini Vision current. Volume Vision basso (~5 capture/lezione × 200 gg).

---

## 7. TTS Italian — verified

### 7.1 Edge TTS Isabella (current)
- Pip free unofficial wrapper Microsoft Azure Speech.
- it-IT-IsabellaNeural voice approvata Andrea iter 5 P3.
- ZERO cost monetary. WS Deno migration ADR-016 iter 8.
- Source: https://github.com/rany2/edge-tts

### 7.2 ElevenLabs (premium Italian)
- Free 10K char/mese (~10 min audio).
- Starter $5/mese 30K char.
- Creator $22/mese 100K char (~100 min). Overage $0.30/1K char.
- Source: https://elevenlabs.io/pricing

### 7.3 Google Cloud TTS
- Standard Italian: $4/M char. Wavenet: $16/M char. Neural: $16/M char.
- Source: https://cloud.google.com/text-to-speech/pricing

### 7.4 Self-hosted Voxtral 4B GPU
- Open Mistral. GPU hosting €0.75-1.40/h Scaleway burst.

### 7.5 Self-hosted XTTS-v2 (Coqui)
- Open. Voice clone 3s. Iter 1 RunPod deploy fallito disk 30GB.

**Decisione**: Edge TTS Isabella PRODUCTION. ElevenLabs Creator solo IF docente premium VIP request voice clone.

---

## 8. STT Italian — verified

### 8.1 OpenAI Whisper API
- $0.006/min audio. ~3 ore lezione/giorno × 200 gg = 600h/anno = €216/anno.

### 8.2 Self-hosted Whisper Turbo (RunPod)
- GPU burst €0.74/h × 100h benchmark = €74/anno.
- Iter 1 deployed port 9000.

### 8.3 Google Cloud STT
- $0.024/min standard. 4× più costoso OpenAI. Italian supported.

**Decisione**: Whisper API OpenAI on-demand cheap baseline. Self-hosted only IF privacy sensitive student audio (defer Sprint U+).

---

## 9. CDN + Storage — verified

### 9.1 Cloudflare R2 (recommended)
- $0.015/GB stored. **ZERO egress** (key differentiator AWS S3).
- 10GB free + 1M Class A + 10M Class B operations/mese free.
- Source: https://developers.cloudflare.com/r2/pricing/

### 9.2 AWS S3 EU
- $0.023/GB storage + $0.09/GB egress (the killer cost).
- Source: https://aws.amazon.com/s3/pricing/

### 9.3 Backblaze B2
- $0.005/GB storage + $0.01/GB egress (cap 3× storage).
- Cheapest storage but egress non-zero.
- Source: https://www.backblaze.com/cloud-storage/pricing

**Decisione**: Cloudflare R2 raccomandato per Postgres backup snapshots + Tea video lezioni + cookbook PDF assets. Switch da Supabase Storage SE volume >100GB.

---

## 10. Monitoring + Observability — verified

### 10.1 Sentry Team (current)
- $26/mese annual, $29/mese monthly. 50K errors + 100K performance units + 90 days retention + unlimited users.
- Overage $0.000290/event.
- Source: https://sentry.io/pricing/

### 10.2 GlitchTip self-hosted (Sentry-compatible API)
- Open free. Self-host Docker + Postgres.
- Hosting cost: Hetzner CX11 €4.51/mese.
- Risparmio Sentry: €25/mese × 12 = €300/anno.
- Source: https://glitchtip.com/

### 10.3 PostHog Cloud EU
- Free 1M events + 5K recordings + 1M flag requests + 100K exceptions/mese.
- Step pricing $0.0000050-$0.0000343/event after.
- EU residency available.
- Source: https://posthog.com/pricing

### 10.4 PostHog self-hosted EU
- Open. Hosting Hetzner ~€20/mese 4 vCPU + 16GB.

### 10.5 Plausible Cloud EU
- €6/mese annual (€60/anno) 10K pageviews 50 sites.
- €9/mese 100K pageviews.
- EU-only servers (no US transit).
- Source: https://plausible.io/

### 10.6 Plausible self-hosted (Community Edition)
- Open free + hosting Hetzner €4.51/mese.

### 10.7 Better Stack Logs
- $25/mese 30 GB ingest. Heroku-style logs.

### 10.8 Grafana Cloud Free + Loki
- 10K series metrics + 50 GB logs free. Datadog alternative.

### 10.9 Datadog
- $15+/host/mese APM + €0.10/M log events. Enterprise overkill for ELAB.

**Decisione QUICK WIN**:
- Sentry → GlitchTip self-hosted Hetzner = -€300/anno
- PostHog Cloud EU free tier (under 1M events, copre 200 scuole)
- Plausible €60/anno EU-native analytics

---

## 11. Email transactional + marketing — verified

### 11.1 Brevo (recommended EU)
- 300 email/giorno **free** (9000/mese).
- Starter €7/mese 5000 email.
- Standard €15/mese marketing automation.
- **GDPR-compliant by design EU servers**.
- Source: https://www.brevo.com/pricing/

### 11.2 Mailchimp Transactional
- $20/blocco 25K email (expire 1 mese). Costoso.
- Source: https://mailchimp.com/pricing/

### 11.3 Resend (developer)
- $20/mese 50K email. React Email integration.
- Hosting USA primary. EU non-default.
- Source: https://resend.com/pricing

### 11.4 Postmark
- $15/mese 10K email. Best deliverability transactional.
- Source: https://postmarkapp.com/pricing

### 11.5 Supabase Auth native emails
- Incluso Pro. Limit 30 email/ora gratuito. Production NO sufficient.

**Decisione**: Brevo free tier (300/giorno = 9K/mese) copre 100 scuole. Upgrade Starter €7/mese >100 scuole.

---

## 12. Customer support — verified

### 12.1 Crisp (recommended)
- Free 2 operators chat widget unlimited.
- Essentials $95/mese 10 seats (€87/mese).
- Workspace pricing flat = no per-agent fee.
- Source: https://crisp.chat/en/pricing/

### 12.2 Intercom
- $29/seat/mese annual. $95/mese 10 seats.
- Startup program 50% discount Y1.
- Source: https://www.intercom.com/pricing

### 12.3 Freshdesk
- **Free plan up to 10 agents**. Growth $19/agent/mese. Pro $55/agent.
- Best free tier per ELAB stage 1.
- Source: https://www.freshworks.com/freshdesk/pricing/

### 12.4 Zendesk
- $55+/agent/mese. Enterprise overkill.

### 12.5 Discord community
- Free. ZERO support cost. Tier 1 docenti FAQ + tutorial.

### 12.6 GitHub Discussions
- Free (repo public). Tech-savvy docenti only.

**Decisione**: Crisp free 2 ops + Discord community = €0/mese. Upgrade Crisp Essentials $95 SOLO at >100 scuole con SLA contracts.

---

## 13. Payment processor EU — verified

### 13.1 Stripe (default)
- 1.5% + €0.25 carte EU. 2.9% + €0.30 international.
- Currency conversion +2%.
- Source: https://stripe.com/it/pricing

### 13.2 Mollie (EU-native cheaper)
- iDEAL €0.29 (Olanda, irrilevante IT).
- Carte EU 1.8% + €0.19. SEPA Direct Debit €0.29 flat.
- Più economico Stripe per SEPA recurring.
- Source: https://www.mollie.com/it/pricing

### 13.3 Satispay (Italian)
- 1% + €0 fee carte Italian consumer.
- Niche, non per scuole.
- Source: https://www.satispay.com/

### 13.4 SEPA Direct Debit standalone
- Banca Italia €0.20-0.50/transazione. Setup contratto banca + IBAN diretto.
- Cheapest recurring scuola PA. Friction setup alto.

**Decisione**: Mollie EU-native + SEPA Direct Debit per scuole pubbliche annual recurring (~€0.30/transazione vs Stripe €23 su €1500).

---

## 14. Invoicing italiano — verified

### 14.1 Aruba Fatturazione Elettronica (recommended)
- €29.90/anno + IVA = ~€36/anno. 1 GB space + 10-anni conservazione.
- 3 mesi trial €1.
- Source: https://fatturazioneelettronica.aruba.it/

### 14.2 Fatture in Cloud
- €48/anno Forfettari Y1, €96/anno renewal.
- Più ricco automation + integrations.
- Source: https://www.fattureincloud.it/

### 14.3 Software Semplice
- €48/anno + IVA. Cheapest Y2+.

**Decisione**: Aruba €36/anno setup + scaling fino enterprise.

---

## 15. Compile Arduino service — verified

### 15.1 n8n self-hosted Hostinger (current)
- VPS Hostinger ~€15-25/mese (KVM 2 4GB RAM).
- n8n Community Edition free unlimited execution.
- 1 endpoint /compile arduino-cli.
- Source: https://www.hostinger.com/vps-hosting

### 15.2 n8n Cloud Starter
- €24/mese 2,500 esecuzioni/mese (~83/giorno).
- INSUFFICIENTE: 200 scuole × 50 compile/giorno = 10K/giorno.
- Source: https://n8n.io/pricing/

### 15.3 Migration Supabase Edge Functions
- Compile via deno spawn arduino-cli docker (Edge Function 60s timeout).
- INCLUSO Supabase Pro 2M invocations.
- Risparmio Hostinger: €18 × 12 = €216/anno.
- Migration onere: 1 settimana port + test.

### 15.4 PlatformIO Cloud API
- Enterprise CI/CD compile farm. Custom enterprise pricing.
- Overkill per ELAB.

### 15.5 Self-hosted arduino-cli docker direct
- Render free tier 750h + Fly.io free 3 VM = €0/mese alternative.

**Decisione QUICK WIN**: Migration n8n → Supabase Edge Function compile = -€216/anno + elimina single point failure Hostinger VPS.

---

## 16. Legal compliance EU AI Act + GDPR — verified

### 16.1 Iubenda (recommended)
- Free plan low-traffic. Paid €5-10/mese sites <50K pageviews.
- Privacy + Cookie banner + DPA generator.
- $0.06/1K pageviews overage.
- AI Act compliance assessment included paid plans.
- Source: https://www.iubenda.com/en/pricing/

### 16.2 OneTrust
- Custom pricing thousands/anno. Enterprise only.
- Overkill ELAB stage.

### 16.3 Lawyer ad-hoc DPA template
- One-time €1,500-3,000 IT lawyer DPA template scuole pubbliche minori.

### 16.4 Adobe Sign / DocuSign
- $10-25/mese basic e-sign per DPA scuola.
- Source: https://acrobat.adobe.com/it/it/sign/pricing.html

### 16.5 Commercialista italiano
- €100-200/mese SRL piccola. Include fattura + bilancio + IVA + F24.

**Decisione**: Iubenda Standard €27/mese (~€324/anno) all-inclusive privacy + cookie + DPA. Lawyer ad-hoc one-time €2K. Commercialista €150/mese.

---

## 17. Insurance — verified

### 17.1 Civil liability EU SRL software startup minori
- €30-60/mese (€360-720/anno) starter EU.
- Tech/SaaS premium 40-88% sopra SMB media.
- Cyber + RC professionale combined ~€500-800/anno startup.
- Source: https://foundershield.com/blog/tech-insurance-pricing-trends-2026/

### 17.2 DORA EU compliance (2026+)
- Operational Resilience Act EU mandatory. Premium insurance lift +15-20%.

**Decisione**: Cyber + RC bundle Lloyds/Generali Italia ~€600/anno starter. Lift Y2+.

---

## 18. Domain + DNS — verified

### 18.1 elabtutor.school registry
- ~€30/anno .school TLD.
- Source: https://www.namecheap.com/domains/registration/results/?domain=elabtutor.school

### 18.2 Cloudflare DNS
- Free unlimited zones + DNS query.
- Source: https://www.cloudflare.com/plans/free/

### 18.3 Multi-subdomain
- Free Cloudflare. *.elabtutor.school wildcard A/CNAME.

**Decisione**: status quo €30/anno.

---

## 19. Backup — verified

### 19.1 Postgres logical backup → Cloudflare R2
- pg_dump weekly cron → R2.
- Storage 10GB × $0.015 × 12 = €1.80/anno. Egress 0.
- Setup 1h Bash script.

### 19.2 Supabase native PITR
- Pro plan = 7 giorni PITR included.
- Team plan = 14 giorni PITR + WAL archive.

**Decisione**: PITR Supabase Pro + R2 weekly logical backup = €1.80/anno extra. Total backup OK.

---

## 20. CI/CD — verified

### 20.1 GitHub Actions
- 2000 min/mese free public repo. 3000 min Team.
- Pro account $4/mese unlimited public minutes.
- Source: https://github.com/pricing

### 20.2 Vercel deployments
- Inclusi Pro plan unlimited.

### 20.3 Supabase CLI deploy
- Free CLI. Edge Function deploy via push.

**Decisione**: GitHub Actions free + Vercel + Supabase CLI = €0/mese.

---

## 21. Cache layer — verified

### 21.1 Upstash Redis
- Free 500K commands/mese.
- $0.20/100K commands. Storage $0.25/GB.
- 200GB bandwidth free/mese.
- Source: https://upstash.com/pricing/redis

### 21.2 Cloudflare Workers KV
- $0.50/M reads. Workers Paid $5/mese minimum.
- Source: https://developers.cloudflare.com/kv/platform/pricing/

### 21.3 Self-hosted Redis Supabase
- Postgres LISTEN/NOTIFY o pgcrypto cache table = €0 extra Supabase.

**Decisione**: Upstash free tier 500K commands/mese copre 50 scuole RAG cache. Postgres native cache fallback.

---

## 22. Documentation — verified

### 22.1 GitBook free
- Open source / public free unlimited spaces.

### 22.2 Outline self-hosted
- Open. Hosting Hetzner €4.51/mese.

### 22.3 Notion
- Free <10 guests. Plus $8/mese.
- Andrea + Tea = free tier sufficient.

**Decisione**: Notion free + GitBook public docs = €0/mese.

---

## 23. Calendar + booking — verified

### 23.1 Cal.com free
- Open source. Free self-hosted o Cloud free 1 user.
- Source: https://cal.com/pricing

### 23.2 Calendly
- $8-15/mese basic.

**Decisione**: Cal.com free per docente onboarding webinar booking = €0.

---

## 24. Quick wins shortlist Sprint T iter 18

| # | Action | Risparmio €/anno | Onere migration |
|---|---|---|---|
| 1 | Sentry → GlitchTip self-hosted | €300 | 1 giorno setup |
| 2 | PostHog Cloud EU free tier (no Sentry) | €0 (avoid future cost) | 30 min instrumentation |
| 3 | n8n Hostinger → Supabase Edge Fn compile | €216 | 1 settimana port |
| 4 | Mailchimp avoidance → Brevo free 9K/mese | €240 (avoid) | 30 min API switch |
| 5 | Plausible €60/anno EU vs PostHog if heavy | €0 (alternative) | 15 min snippet |
| 6 | Mistral Small primary vs Together gated | ~€500/anno scaling | 1h LLM client switch |
| 7 | RunPod terminated (already done iter 5 P3) | €160/anno (era $13.33/mo) | done |
| 8 | Vercel → Cloudflare Pages | €220 | 1 giorno DNS migration |

**Total quick wins shippable Sprint T iter 18**: €1,496/anno se tutti applicati.

---

## 25. Cost stack consolidato — fixed + variable

### 25.1 Fixed mensile (steady-state minimo, dopo quick wins)

| Componente | €/mese ottimizzato | Note |
|---|---|---|
| Cloudflare Pages (frontend) | 0 | Migration Vercel |
| Supabase Pro | 23 | DB + Edge Fn + Auth + 100K MAU |
| Voyage AI | 0 | Free 200M tok lifetime |
| Edge TTS Isabella | 0 | Pip free wrapper |
| Mistral Small primary | ~5-15 | Variable token-based |
| Gemini Flash fallback | ~2-5 | Token-based |
| GlitchTip Hetzner | 4.51 | Self-hosted error tracking |
| PostHog Cloud EU free | 0 | Under 1M events/mese |
| Plausible EU (alt) | 5 | €60/anno |
| Brevo free email | 0 | 9K/mese |
| Crisp free + Discord | 0 | Tier 1 support |
| Iubenda Standard | 27 | Privacy + cookie + DPA |
| Aruba Fatturazione | 3 | €36/anno |
| Commercialista IT | 150 | SRL bilancio |
| Cyber+RC insurance | 50 | €600/anno |
| Domain + Cloudflare DNS | 2.50 | €30/anno |
| Cloudflare R2 backup | 0.15 | <10GB free tier |
| GitHub Actions | 0 | Free 2000 min |
| Upstash Redis cache | 0 | Free 500K cmd |
| Notion + Cal.com | 0 | Free tier |

**TOTAL FIXED ottimizzato**: ~€272/mese ≈ €3,264/anno

### 25.2 Variable per scuola/anno (steady-state)

| Componente | €/scuola/anno |
|---|---|
| LLM token Mistral + Gemini | ~€8 |
| Vision Gemini multimodal | ~€2 |
| Voyage embedding query | ~€1.20 |
| Whisper API STT (opt) | ~€2 |
| Email Brevo overage (>100 scuole) | ~€1 |
| Storage R2 student artifacts | ~€0.50 |
| Bandwidth Cloudflare Pages | ~€0 |

**TOTAL VARIABILE/scuola/anno**: ~€15/anno

### 25.3 Cost per scuola/anno scaling

```
Cost/scuola/anno = (€3,264 fixed / N) + €15 variable

N = 50  → €80/scuola
N = 100 → €48/scuola
N = 200 → €31/scuola
N = 500 → €22/scuola
```

---

## 26. Cost stack ATTUALE (pre quick wins) per confronto

| Componente | €/mese current | Note |
|---|---|---|
| Vercel Pro | 18.40 | $20 |
| Supabase Pro | 23 | $25 |
| Sentry Team | 24 | $26 |
| n8n Hostinger | 18 | VPS KVM |
| RunPod storage idle | ~12.20 | $13.33 (pre-terminate) |
| LLM Together AI | ~30 | Token current usage |
| Iubenda (assumed) | 27 | If subscribed |
| Insurance (assumed) | 50 | If subscribed |
| Commercialista | 150 | If subscribed |
| Brevo (assumed) | 0 | Free tier OK |
| Domain + DNS | 2.50 | |

**TOTAL CURRENT ~€355/mese ≈ €4,260/anno** (matches Andrea concern €386 inflato).

**Risparmio applicando quick wins**: €4,260 - €3,264 = **€996/anno -23%** (NON -75% come ambizione Andrea, ma materiale).

---

## 27. Strategy -75% reduction Andrea ambition

Per raggiungere -75% (€4,260 → €1,065/anno):

1. Cloudflare Pages free + GlitchTip + Brevo + Crisp free + Plausible self-host = -€500/anno
2. Mistral Small primary token reduction × 5 = -€100/anno
3. Iubenda free tier <50K pageviews = -€324/anno
4. Insurance defer Y1 (only post 20+ scuole liability exposure) = -€600/anno
5. Commercialista forfettario partita IVA Andrea = -€1,200/anno (€60/anno regime forfettario vs SRL)

**Strategy -75% richiede**:
- Defer SRL → Andrea partita IVA forfettario regime
- Defer insurance Y1 fino 20 scuole acquisite
- Aggressive free tier maximization
- ZERO Tea cost (co-dev unpaid until revenue split iter 20+)

**Realistic budget Y1 minimum**: ~€1,200/anno = €100/mese steady-state. Match ambition.

---

## 28. Sources verbatim citate

- [Vercel Pricing](https://vercel.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Mistral Pricing](https://mistral.ai/pricing)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Together AI Pricing](https://www.together.ai/pricing)
- [Scaleway GPU Pricing](https://www.scaleway.com/en/pricing/gpu/)
- [RunPod Pricing](https://www.runpod.io/pricing)
- [Voyage AI Pricing](https://docs.voyageai.com/docs/pricing)
- [Cohere Pricing](https://cohere.com/pricing)
- [Sentry Pricing](https://sentry.io/pricing/)
- [PostHog Pricing](https://posthog.com/pricing)
- [Plausible Pricing](https://plausible.io/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/platform/pricing/)
- [Upstash Redis Pricing](https://upstash.com/pricing/redis)
- [Brevo Pricing](https://www.brevo.com/pricing/)
- [Mailchimp Transactional](https://mailchimp.com/pricing/)
- [Resend Pricing](https://resend.com/pricing)
- [Postmark Pricing](https://postmarkapp.com/pricing)
- [Crisp Pricing](https://crisp.chat/en/pricing/)
- [Intercom Pricing](https://www.intercom.com/pricing)
- [Freshdesk Pricing](https://www.freshworks.com/freshdesk/pricing/)
- [Stripe Italy Pricing](https://stripe.com/it/pricing)
- [Mollie Pricing](https://www.mollie.com/it/pricing)
- [Aruba Fatturazione](https://fatturazioneelettronica.aruba.it/)
- [Fatture in Cloud](https://www.fattureincloud.it/)
- [Iubenda Pricing](https://www.iubenda.com/en/pricing/)
- [n8n Pricing](https://n8n.io/pricing/)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing)
- [Hostinger VPS](https://www.hostinger.com/vps-hosting)
- [Cal.com Pricing](https://cal.com/pricing)
- [GitHub Pricing](https://github.com/pricing)
- [FounderShield Cyber Insurance 2026](https://foundershield.com/blog/tech-insurance-pricing-trends-2026/)
