# ELAB Tutor — Cost Optimization Roadmap 2026

**Data**: 2026-04-28
**Iter**: cost-stack-opus 18
**Scope**: Roadmap stack ATTUALE → OTTIMIZZATO → SCALING. Quick wins shippable Sprint T iter 18. Tea co-dev impact split.

NO inflation. Math verifiable. Trade-off espliciti per ogni decisione.

---

## 1. Stack ATTUALE 2026-04-28 (verified concern Andrea €386)

### 1.1 Mensile breakdown
```
Vercel Pro                      €18.40
Supabase Pro                    €23.00
Sentry Team                     €24.00
n8n Hostinger VPS               €18.00
RunPod storage idle (pre-term)  €12.30
LLM Together AI usage           €30.00 (~est)
Mistral fallback                 €5.00
Voyage embedding (free)          €0.00
Edge TTS                         €0.00
Whisper STT (opt)                €5.00
Gemini Vision                    €3.00
Iubenda (assumed)               €27.00
Insurance cyber+RC               €50.00
Commercialista IT              €150.00
Brevo email free                 €0.00
Crisp + Discord                  €0.00
Domain elabtutor.school          €2.50
Backup R2                        €0.15
GitHub Actions free              €0.00
Upstash free                     €0.00
Notion + Cal.com free            €0.00
                              ---------
TOTAL                          €368.35/mese ≈ €4,420/anno
```

Match Andrea concern €386 (variance 5% accuracy).

### 1.2 Cost per scuola attuale steady-state
```
Cost/scuola/anno (N) = (€4,420 - €15×N) / N + €15
```

| N | Backend €/scuola/anno |
|---|---|
| 5 | €899 |
| 20 | €236 |
| 50 | €103 |
| 100 | €59 |
| 200 | €37 |

---

## 2. Stack OTTIMIZZATO Sprint T iter 18 (5 quick wins shippable)

### Quick Win 1 — Sentry → GlitchTip self-hosted Hetzner
- **Cost change**: -€24/mese + €4.51/mese hosting = -€19.49/mese
- **Annual saving**: €234/anno
- **Migration effort**: 1 giorno (Docker compose + Postgres + DNS)
- **Trade-off**: maintenance Hetzner self-host. NO out-of-the-box features Sentry (Seer AI, deeper integrations). API Sentry-compatible.
- **Risk**: bassa. GlitchTip mature open project.
- **Decision**: ship iter 18 SE Andrea OK ~1h Hetzner setup.

### Quick Win 2 — n8n Hostinger → Supabase Edge Function compile
- **Cost change**: -€18/mese
- **Annual saving**: €216/anno
- **Migration effort**: 1 settimana port Edge Function spawn arduino-cli docker.
- **Trade-off**: Edge Fn 60s timeout limit (sufficiente compile basic). Single point failure rimosso.
- **Risk**: media. Bisogna verify arduino-cli docker portable Deno runtime.
- **Decision**: ship iter 19 (richiede dev tempo, defer iter 18 quick win 1+3+4+5 priority).

### Quick Win 3 — RunPod TERMINATED (gia fatto iter 5 Phase 3)
- **Cost change**: -€12.30/mese (already done)
- **Annual saving**: €148/anno
- **Effort**: zero. Path A confermato ADR-020.
- **Status**: SHIPPED iter 5 Phase 3.

### Quick Win 4 — Mistral Small primary vs Together AI gated
- **Cost change**: -€20/mese (50% LLM token reduction)
- **Annual saving**: €240/anno
- **Migration effort**: 1h llm-client.ts router switch primary.
- **Trade-off**: Mistral Small 3.1 quality vs Llama 3.3 70B. R5 benchmark required.
- **Decision**: ship iter 18 con A/B 50% test prod (ADR-022 nuovo proposto).

### Quick Win 5 — Vercel Pro → Cloudflare Pages free
- **Cost change**: -€18.40/mese
- **Annual saving**: €220/anno
- **Migration effort**: 1 giorno (DNS migration + redeploy + monitor 48h).
- **Trade-off**: Vercel preview deploys + analytics included. Cloudflare Pages più semplice ma OK ELAB scope.
- **Risk**: bassa. Cloudflare Pages ben supportato Vite + React.
- **Decision**: ship iter 19+ (richiede DNS migration + monitor windowing).

### 2.1 Stack OTTIMIZZATO post 5 quick wins

```
Cloudflare Pages frontend       €0.00 (was Vercel €18.40)
Supabase Pro                    €23.00
GlitchTip Hetzner               €4.51 (was Sentry €24)
Supabase Edge Fn compile        €0.00 (was n8n €18, included Pro plan)
LLM Mistral Small primary       €10.00 (was Together €30)
Gemini Flash fallback            €5.00
Voyage embeddings                €0.00 (free 200M lifetime)
Edge TTS Isabella                €0.00
Whisper STT API                  €5.00
Gemini Vision                    €3.00
PostHog Cloud EU free            €0.00
Plausible €60/anno EU            €5.00
Brevo email free                 €0.00
Crisp + Discord                  €0.00
Iubenda Standard                €27.00
Aruba Fatturazione               €3.00
Cyber+RC insurance              €50.00
Commercialista IT              €150.00
Domain Cloudflare DNS            €2.50
R2 backup                        €0.15
GitHub Actions                   €0.00
Upstash free                     €0.00
Notion + Cal.com                 €0.00
                              ---------
TOTAL OTTIMIZZATO              €288.16/mese ≈ €3,458/anno
```

**Risparmio totale**: €4,420 - €3,458 = **€962/anno -22%**

(Match Andrea ambition step 1, NO -75% senza decisioni strutturali §3 sotto.)

### 2.2 Cost per scuola ottimizzato

```
Cost/scuola/anno (N) = (€3,458 - €15×N) / N + €15
```

| N | Backend €/scuola/anno |
|---|---|
| 5 | €706 |
| 20 | €188 |
| 50 | €84 |
| 100 | €50 |
| 200 | €32 |

---

## 3. Stack -75% REDUCTION ambition (€4,420 → €1,105/anno)

Richiede 3 decisioni strutturali:

### Decision A — Defer SRL → Andrea partita IVA forfettario
- **Risparmio commercialista**: €150/mese SRL → €60/anno forfettario regime = -€1,740/anno
- **Trade-off**: limit fatturato €85K/anno regime forfettario. Above = transizione SRL forced.
- **Match**: 50 scuole × €1,500/anno = €75K (sotto limit). 100 scuole = €150K (above limit, force SRL).
- **Recommendation**: Y1 forfettario, Y2 transition SRL al raggiungimento 50+ scuole.

### Decision B — Defer Insurance Y1 fino 20 scuole signed
- **Risparmio**: €600/anno
- **Trade-off**: liability exposure Y1 senza assicurazione = self-funded if incident. Su 0-19 scuole basso rischio.
- **Recommendation**: defer 6 mesi, attivare al primo contratto formale scuola pubblica.

### Decision C — Iubenda free tier OR self-host alternative
- **Risparmio**: €27/mese × 12 = €324/anno
- **Trade-off**: free tier <50K pageviews/mese (sufficiente <50 scuole). DPA template lawyer one-time vs Iubenda included.
- **Recommendation**: free tier Y1, upgrade Standard al raggiungimento 50K pageviews/mese.

### 3.1 Stack -75% post decisioni A+B+C

```
Cloudflare Pages                 €0.00
Supabase Pro                    €23.00
GlitchTip Hetzner               €4.51
Edge Fn compile                  €0.00
LLM Mistral Small               €10.00
Gemini Flash fallback            €5.00
Voyage embeddings                €0.00
Edge TTS Isabella                €0.00
Whisper STT                      €5.00
Gemini Vision                    €3.00
PostHog free EU                  €0.00
Plausible (alt)                  €5.00
Brevo email free                 €0.00
Crisp + Discord                  €0.00
Iubenda free tier                €0.00 (defer §C)
Aruba Fatturazione               €3.00
Insurance defer Y1               €0.00 (§B)
Commercialista forfettario       €5.00 (§A €60/anno)
Domain Cloudflare                €2.50
R2 backup                        €0.15
GitHub + Upstash + Notion        €0.00
                              ---------
TOTAL -75%                      €66.16/mese ≈ €794/anno
```

**Risparmio totale -75%**: €4,420 - €794 = **€3,626/anno -82%** (supera ambition Andrea -75%).

### 3.2 Cost per scuola -75% mode

```
Cost/scuola/anno (N) = (€794 - €15×N) / N + €15
```

| N | Backend €/scuola/anno |
|---|---|
| 5 | €174 |
| 20 | €55 |
| 50 | €31 |
| 100 | €23 |
| 200 | €19 |

**Question rovesciata**: con €19-31/scuola steady-state Y2+, prezzo €490/scuola Standard = margine 94%.

---

## 4. Stack SCALING (200-500 scuole) Y2-Y3

A scaling raggiunto, costi crescono lineari LLM token + Vision + monitoring overage. Fixed scala 1:N.

### 4.1 Mensile breakdown 200 scuole

```
Cloudflare Pages                 €0.00
Supabase Pro (8GB DB OK)        €23.00
GlitchTip Hetzner               €4.51
Edge Fn compile                  €0.00
LLM Mistral 200 scuole          €100.00 (€60M tok/mese × $0.40/M)
Gemini Flash fallback            €30.00
Voyage embedding 200 scuole     €30.00 (~freemium spent)
Edge TTS Isabella                €0.00
Whisper STT 200 scuole          €40.00
Gemini Vision 200 scuole        €40.00
PostHog free EU (1M events)      €0.00 (still free at 200 scuole ~600K events/mese)
Plausible Pro                   €15.00 (€180/anno 100K pageviews)
Brevo Starter (>9K/mese)         €7.00
Crisp Essentials (SLA)         €87.00
Iubenda Standard               €27.00
Aruba Fatturazione               €3.00
Cyber+RC scaling               €100.00 (€1,200/anno 200 scuole tier)
Commercialista SRL             €200.00
Domain Cloudflare                €2.50
R2 backup (50GB)                 €0.75
GitHub Pro                       €4.00
Upstash Pay-as-you-go           €15.00
Notion Plus                      €8.00
                              ---------
TOTAL SCALING 200             €736.76/mese ≈ €8,841/anno
```

Cost/scuola/anno = €8,841/200 = **€44/scuola/anno** stabile scaling.

### 4.2 Mensile breakdown 500 scuole

LLM + Vision + STT scalano linear. Supabase Pro 8GB DB OK fino ~300 scuole, poi Team plan $599/mese forced.

```
Frontend + DNS + Backup        €5.00
Supabase Team (>300 scuole)   €560.00
GlitchTip self-host             €4.51
LLM scaling (5x 200)          €200.00
Vision + STT scaling          €200.00
Voyage paid (200M+ tok)        €30.00
Monitoring + analytics         €30.00
Email Brevo Standard           €15.00
Crisp Plus 20 seats          €270.00
Iubenda Pro                    €40.00
Insurance scale            €200.00
Commercialista SRL Y2     €300.00
Misc (cache + CI + tools)      €30.00
                              ---------
TOTAL SCALING 500           €1,884.51/mese ≈ €22,614/anno
```

Cost/scuola/anno = €22,614/500 = **€45/scuola/anno** stabile.

---

## 5. Cost per scuola/anno tier confronto consolidato

| N scuole | ATTUALE | OTTIMIZZATO (-22%) | -75% MODE | SCALING |
|---|---|---|---|---|
| 5 | €899 | €706 | €174 | n/a |
| 20 | €236 | €188 | €55 | n/a |
| 50 | €103 | €84 | €31 | n/a |
| 100 | €59 | €50 | €23 | n/a |
| 200 | €37 | €32 | €19 | €44 |
| 500 | n/a | n/a | n/a | €45 |

**Insight critico**: cost/scuola si stabilizza ~€20-50/anno >100 scuole tutti modi. Pricing tier €290-1290 = margine 85-95% backend.

---

## 6. Break-even pricing tier €290/€490/€790/€1290

Da `docs/strategy/2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md` 4 tier shortlist.

### 6.1 Tier Light €290/anno
- Cost/scuola steady-state ottimizzato: €50 (100 scuole)
- Margine: €290 - €50 = €240/scuola/anno
- Margine %: 83%
- **Break-even fixed €3,458/anno**: €3,458 / €240 = **15 scuole/anno**

### 6.2 Tier Standard €490/anno
- Margine: €490 - €50 = €440/scuola
- **Break-even**: €3,458 / €440 = **8 scuole/anno**

### 6.3 Tier Pro €790/anno
- Margine: €790 - €50 = €740/scuola
- **Break-even**: 5 scuole

### 6.4 Tier Premium €1290/anno
- Margine: €1290 - €50 = €1240/scuola
- **Break-even**: 3 scuole

### 6.5 Confronto vs cost analysis precedente

`docs/strategy/2026-04-28-pricing-strategy/01-cost-analysis-per-school.md` includeva:
- Dev amortizzato Andrea (€60-2400/scuola)
- Content Tea video (€14-552/scuola)
- Kit Omaric (€510/scuola)
- Commerciale (€900/scuola Y1)
- Legal+ISO27001 (€591-4120/scuola Y1)

Quei costi NON sono backend-software; sono cost compositi prodotto + GTM + content + hardware.

**Software-only cost** (questa analisi cost-stack): €19-50/scuola/anno steady-state.

**Software-only pricing** € 290-1290 break-even al 3-15 scuole.

---

## 7. Strategy modular feature unlock €99/feature add-on

Unlock pattern: Standard €490 base + add-ons opt-in.

### 7.1 Add-ons feature shortlist

| Add-on | €/anno | Cost incrementale/scuola | Margine |
|---|---|---|---|
| Vision UNLIM (capture+diagnosi) | €99 | €5 (Vision tokens × 200gg) | 95% |
| Voice premium ElevenLabs Italian | €99 | €15 (Creator tier shared) | 85% |
| Dashboard analytics PostHog premium | €99 | €0 (free tier copre) | 100% |
| Compile Arduino unlimited | €99 | €1 (Edge Fn included) | 99% |
| Backup R2 30 giorni rolling | €99 | €2 (R2 storage 5GB) | 98% |
| Multi-class license (5 classi) | €199 | €5 (extra DB rows) | 97% |

Strategy: Standard €490 = 1 add-on Vision included. Pro €790 = 3 add-ons. Premium €1290 = unlimited.

### 7.2 Revenue uplift 100 scuole con 30% add-on attach
- Base 100 × €490 = €49,000
- Add-on attach 30 scuole × €99 medio = €2,970
- Total: €51,970 (uplift +6%)

---

## 8. Tea co-dev impact dev cost split

### 8.1 Pre Tea (Andrea solo)
Cost analysis precedente:
- Dev amortizzato Andrea founder: €60K/anno opportunity cost / 5 anni / N scuole

### 8.2 Post Tea co-dev

Tea ruolo (CLAUDE.md aggiornato 2026-04-28):
- Co-dev parallel + tester E2E/UAT + creativa UX/idee
- Usa Claude Code stesso harness Andrea
- 4 documenti del 13/04/2026 in `/VOLUME 3/TEA/`
- Capabilities: coding contributor + design feedback + UAT

**Cost split scenari**:

#### Scenario A — Tea unpaid co-founder Y1
- Cost: €0 dev split. Tea split equity (TBD %).
- Risparmio Andrea opportunity cost: 30-40% velocity boost.
- Y2+: Tea revenue split (10-20% net).

#### Scenario B — Tea contractor freelance Y1
- €1500/mese × 12 = €18K/anno cost.
- Productivity 50% Andrea = €9K/anno effective.
- Migration cost SRL employee Y2 SE Tea full-time.

#### Scenario C — Tea revenue share 15%
- Y1 break-even: 8 scuole × €490 = €3,920 → Tea share €588.
- Y2 50 scuole = €24,500 → Tea share €3,675.
- Y3 200 scuole = €98,000 → Tea share €14,700 (cap quasi-employment).

**Recommended**: Scenario A unpaid co-founder Y1 + revenue share 15% Y2+ con cap €15K/anno.

### 8.3 Impact su cost/scuola

Pre Tea (Andrea solo, opportunity cost €60K/5anni/N):
- 50 scuole: €240/scuola/anno dev amortized

Post Tea Scenario A (Y1 unpaid co-founder):
- 50 scuole: €240/scuola/anno dev cost UNCHANGED (Andrea opportunity cost)
- + Tea opportunity cost €30K/5anni/50 = €120/scuola/anno
- Total: €360/scuola/anno opportunity (NOT cash burn)

Post Tea Scenario B (cash €18K):
- 50 scuole: €240 Andrea + €18000/50 = €360 + €360 = €720/scuola Y1 Tea cash
- Inacceptable Y1.

**Recommendation**: Scenario A. Tea split equity 25% + revenue share 15% Y2+ post 50 scuole signed.

---

## 9. Capex vs Opex one-time investments

### 9.1 One-time setup costs (capex Y1)

| Item | €/once |
|---|---|
| DPA template lawyer scuole pubbliche minori | 2,000 |
| Iubenda + GDPR audit setup | 0 (incluso Standard) |
| ISO27001 audit Y1 (defer Y2+) | 0 (defer) |
| Commercialista SRL setup | 500 |
| Domain + branding initial | 100 |
| Marketing landing + collateral Tea | 500 |
| **Total Capex Y1** | **3,100** |

### 9.2 Andrea + Tea capex contribution
- Andrea founder unpaid Y1 = €0 cash, opportunity €60K
- Tea co-founder unpaid Y1 = €0 cash, opportunity €30K
- Cash capex Y1 actual: €3,100 (Andrea pocket o credit line)

---

## 10. Andrea decision queue cost reduction iter 18-22

Priorità ordinata. Ogni decisione Y/N + ETA shipping.

### Decision Q1 — Sentry → GlitchTip self-host (iter 18)
- Y/N: ?
- Risparmio: €234/anno
- Effort: 1 giorno Hetzner setup
- ETA: iter 18 SE Y oggi

### Decision Q2 — Mistral Small primary A/B 50% (iter 18)
- Y/N: ?
- Risparmio: €240/anno
- Effort: 1h llm-client.ts switch + R5 benchmark verify
- ETA: iter 18 SE Y oggi

### Decision Q3 — n8n → Supabase Edge Fn compile (iter 19)
- Y/N: ?
- Risparmio: €216/anno
- Effort: 1 settimana port + test
- ETA: iter 19 SE Y entro iter 18 close

### Decision Q4 — Vercel → Cloudflare Pages (iter 19+)
- Y/N: ?
- Risparmio: €220/anno
- Effort: 1 giorno DNS migration + 48h monitor
- ETA: iter 20 SE Y entro iter 19 close

### Decision Q5 — Defer Insurance Y1 fino 20 scuole signed
- Y/N: ?
- Risparmio: €600/anno
- Effort: zero, just hold purchase
- ETA: immediate decision

### Decision Q6 — Andrea partita IVA forfettario vs SRL Y1
- Y/N: ?
- Risparmio: €1,740/anno commercialista + tax saving
- Effort: 1 giorno setup commercialista forfettario regime
- Trade-off: limit €85K fatturato Y1
- ETA: 1 settimana decision con commercialista consult

### Decision Q7 — Tea revenue split vs equity vs contractor (iter 20+)
- Y/N: equity 25% + revenue 15% Y2+ recommended Scenario A
- Risparmio: -€18K/anno cash burn vs Scenario B contractor
- Effort: legal contract co-founder agreement (€500 lawyer)
- ETA: iter 20 al raggiungimento 5 scuole signed

### Decision Q8 — Iubenda free vs Standard
- Y/N: free Y1 then upgrade
- Risparmio: €324/anno Y1
- Effort: zero
- ETA: immediate

### Decision Q9 — RunPod Path A confirmed (FATTO iter 5)
- Status: SHIPPED
- Risparmio: €148/anno

### Decision Q10 — PostHog free EU vs Plausible €60/anno
- Y/N: PostHog free EU primary (1M events copre 200 scuole)
- Risparmio: €60/anno avoided
- Effort: 30 min instrumentation
- ETA: iter 18 SE Y oggi

---

## 11. Sintesi roadmap iter 18-22 ship plan

| Iter | Decisioni shippable | Risparmio cumulativo |
|---|---|---|
| 18 | Q1+Q2+Q5+Q6+Q8+Q10 (6 decisioni) | €3,138/anno |
| 19 | Q3+Q4 (2 decisioni shippable) | +€436/anno = €3,574 |
| 20 | Q7 (Tea cofounder agreement) | strutturale |
| 21 | scaling triggers (Crisp Essentials, Brevo Starter, Insurance attiva) | scaling |
| 22 | review consolidato + iter 23 plan | quarterly |

**Risparmio totale shippable iter 18-22**: ~€3,574/anno = **-81% vs €4,420 attuale** (supera ambition Andrea -75%).

---

## 12. Risk assessment quick wins

| Quick Win | Risk | Mitigation |
|---|---|---|
| GlitchTip self-host | Low — open project mature | Hetzner backup snapshot weekly |
| Mistral primary | Medium — quality regression | A/B 50% test + R5 benchmark verify pre-flip |
| Edge Fn compile | Medium — Deno arduino-cli portability | POC 1 settimana + fallback n8n keep |
| Cloudflare Pages | Low — Vite + React supported | Vercel keep 30gg fallback |
| Insurance defer | Medium — liability exposure | Self-fund €5K reserve emergency |
| Forfettario regime | Low — €85K limit cap Y1 | Plan SRL transition trigger 50 scuole |
| Iubenda free | Low — <50K pageviews OK Y1 | Upgrade trigger 50K monthly |

---

## 13. Sources

- [docs/strategy/2026-04-28-pricing-strategy/01-cost-analysis-per-school.md](../2026-04-28-pricing-strategy/01-cost-analysis-per-school.md)
- [docs/strategy/2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md](../2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md)
- [docs/strategy/2026-04-28-cost-stack/01-comprehensive-cost-stack-2026.md](./01-comprehensive-cost-stack-2026.md)
- All provider URL pricing: see file 01 §28
