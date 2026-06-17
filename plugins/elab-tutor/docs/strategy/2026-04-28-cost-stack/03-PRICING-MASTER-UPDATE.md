# ELAB Tutor — Pricing Strategy MASTER UPDATE post Cost Verification

**Data**: 2026-04-28
**Iter**: cost-stack-opus 18
**Scope**: Aggiornamento pricing master post-verify cost stack reale 2026. Top 5 raccomandazione rivisto. Profit projection 100/200/500 scuole rivisto. Andrea decision queue.

NO inflation. Cost reali file 01 + roadmap file 02 → pricing decisione informata.

---

## 1. Cost stack OTTIMIZZATO conferma

Da `02-cost-optimization-roadmap.md` §3 stack -75% mode post 6 quick wins decisione Q1+Q2+Q3+Q4+Q5+Q6+Q8:

```
Cost fixed/anno backend ottimizzato:    €794-€3,458/anno (range -75% vs ottimizzato standard)
Cost variable/scuola/anno:              €15-25
```

Cost/scuola/anno scaling:

| N | -75% mode | Ottimizzato | Attuale |
|---|---|---|---|
| 5 | €174 | €706 | €899 |
| 20 | €55 | €188 | €236 |
| 50 | €31 | €84 | €103 |
| 100 | €23 | €50 | €59 |
| 200 | €19 | €32 | €37 |

**Insight**: software-only cost steady-state >50 scuole = €19-50/scuola/anno.

---

## 2. TOP 5 pricing recommendation rivisto

Da `2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md` 4 tier shortlist + 1 nuova raccomandazione bundle Omaric:

### 2.1 Recommendation #1 — Standard €490/anno + modular add-ons

**Rationale post cost verify**:
- Cost steady-state €50/scuola/anno (100 scuole, ottimizzato)
- Margine: €490 - €50 = €440/scuola = **90% margine software-only**
- Break-even: 8 scuole

**Add-ons opt-in €99 ciascuno**:
- Vision UNLIM diagnose
- Voice premium ElevenLabs Italian
- Compile Arduino unlimited
- Multi-class license
- Backup 30gg

**Revenue projection con 30% attach**:
- 100 scuole × €490 + 30 × €99 = €49,000 + €2,970 = **€51,970/anno**

**Andrea decision iter 18**: SHIP.

### 2.2 Recommendation #2 — PNRR €1490/3 anni voucher-friendly

**Rationale**:
- PNRR Piano Scuola 4.0 deadline 30/06/2026.
- Voucher PNRR copre 100% per scuola pubblica.
- Cost 3 anni: €50 × 3 = €150/scuola; pricing 3-anni = €1490.
- Margine: €1490 - €150 = €1340 = **90% margine** + lock-in 3 anni retention.

**Vendita Davide MePA**:
- Bandi PNRR 3-anni voucher = scuola NON paga out-of-pocket.
- Decoupling cost-perception massimo.

**Andrea decision iter 18-19**: prepare collateral PNRR-friendly + Davide pitch deck.

### 2.3 Recommendation #3 — Bundle Omaric Y1 free + €590 Y2+

**Rationale**:
- Omaric vende kit hardware (€85 cost, €110 vendita) → ELAB software FREE Y1 = customer acquisition strategy.
- Y2+ scuola unlock €590/anno software annual subscription.
- Lock-in hardware + software ecosystem.

**Math 100 scuole bundle**:
- Y1: kit revenue Omaric 100 × €110 = €11,000 (Omaric only, ELAB €0)
- Y2+: 100 × €590 = €59,000/anno ELAB.
- Cumulative 5 anni: €236,000 ELAB + Omaric kit refill ~€2K/anno.

**Trade-off**:
- Y1 ELAB cash burn pure (Tea + Andrea unpaid). Bridge funding required.
- Risk attrition Y2: SE 30% scuole abbandona = €177K cum vs €236K stress.

**Andrea decision iter 19+**: pitch Omaric partnership formale Y1-free strategy.

### 2.4 Recommendation #4 — Site License €590 unlimited classi

**Rationale**:
- Scuola pubblica spesso ha 8-15 classi 8-14 anni stesso plesso.
- Pricing per-classe €99 × 10 = €990 disincentivante.
- Site License €590 unlimited classi = pricing competitivo + scuola sceglie ELAB su tutti gradi.

**Cost per scuola con 10 classi attive**:
- Steady-state €50/scuola/anno (data 100 scuole baseline) MA usage 10x = €100-150/scuola/anno scaling.
- Margine: €590 - €150 = €440 = **75% margine site license**.

**Andrea decision iter 19+**: ship Site License come default tier (replaces Standard?).

### 2.5 Recommendation #5 — Multi-year discount tiered

**Pricing**:
- 1 anno: €490/anno (Standard)
- 2 anni prepaid: €890 (€445/anno, -9%)
- 3 anni prepaid: €1290 (€430/anno, -12%)
- 5 anni prepaid: €1990 (€398/anno, -19%)

**Rationale**:
- Cash flow upfront (3 anni prepaid €1290 immediate cash).
- Retention lock-in.
- PNRR voucher friendly 3-anni.

**Margine 3-anni prepaid**:
- Cost 3 anni × €50 = €150
- Revenue €1290
- Margine €1140 = 88%

**Andrea decision iter 18**: ship multi-year toggle pricing UI.

---

## 3. Profit projection 100/200/500 scuole rivisto

Assumendo Recommendation #1 Standard €490/anno + 30% add-on attach.

### 3.1 100 scuole steady-state Y2-Y3

```
Revenue:
  Base 100 × €490                          = €49,000
  Add-on 30 × €99                          = €2,970
  Total Revenue                            = €51,970

Cost:
  Fixed backend ottimizzato                = €3,458
  Variable 100 × €15                       = €1,500
  Total Cost                               = €4,958

GROSS PROFIT                               = €47,012
GROSS MARGIN                               = 90.5%

Subtract opportunity cost Andrea+Tea:
  Andrea unpaid (€60K)                     = €60,000
  Tea unpaid (€30K)                        = €30,000
NET PROFIT (excl founder cost)             = -€42,988

NET PROFIT (incl founder cost cash split):
  Andrea pull €15K/anno                    = €15,000 cash burn
  Tea revenue share 15% × €47K             = €7,050 cash
  Operating profit                         = €47,012 - €15,000 - €7,050 = €24,962
```

**100 scuole Y2-Y3**: profit operativo €24,962/anno.

### 3.2 200 scuole steady-state Y3-Y4

```
Revenue:
  Base 200 × €490                          = €98,000
  Add-on 60 × €99                          = €5,940
  Total Revenue                            = €103,940

Cost:
  Fixed scaling (Crisp/Brevo upgrade)      = €8,841
  Variable 200 × €15                       = €3,000
  Total Cost                               = €11,841

GROSS PROFIT                               = €92,099
GROSS MARGIN                               = 88.6%

Tea revenue share 15% × €92K               = €13,815
Andrea full salary €36K/anno              = €36,000
Operating profit                          = €42,284
```

**200 scuole Y3-Y4**: profit operativo €42,284/anno.

### 3.3 500 scuole Y4-Y5 (target maturity)

```
Revenue:
  Base 500 × €490                          = €245,000
  Add-on 150 × €99                         = €14,850
  Total Revenue                            = €259,850

Cost:
  Fixed scaling Supabase Team etc          = €22,614
  Variable 500 × €15                       = €7,500
  Total Cost                               = €30,114

GROSS PROFIT                               = €229,736
GROSS MARGIN                               = 88.4%

Andrea full salary €60K                   = €60,000
Tea full salary €40K (post-conv employee) = €40,000
Hire 1 dev junior €30K                    = €30,000
Hire 1 sales €30K                         = €30,000
Hire 1 support L2 €25K                    = €25,000
Operating profit                          = €44,736
```

**500 scuole Y4-Y5**: profit operativo €44,736/anno (post-team hires).

---

## 4. Confronto pre vs post cost verification

### 4.1 Pricing prior (`2026-04-28-pricing-strategy/01-cost-analysis-per-school.md`)

Cost/scuola/anno includeva:
- Backend (€25-954)
- Dev amortized (€60-2400)
- Content Tea (€26-676)
- Kit Omaric (€510)
- Commerciale (€900 Y1)
- Legal (€591-4120 Y1)
- Support + Training

**Total Y1 cost/scuola**: €2,196-9,955 (5-200 scuole)
**Break-even Y1**: 100 scuole a €2,500/scuola

### 4.2 Pricing post cost-stack-opus iter 18

Cost SOFTWARE-only/scuola/anno (steady-state ottimizzato):
- 100 scuole: €50/scuola/anno
- 200 scuole: €32/scuola/anno

**Break-even Y2+ Standard €490**: 8 scuole.

### 4.3 Reconcile divergenza

`pricing-strategy/01-cost-analysis-per-school.md` modellava:
- **Total business cost** (software + dev + content + hardware + GTM + legal)
- Founder cost as cash retail

Questo doc cost-stack-opus 18 modella:
- **Software-only infrastructure cost**
- Founder cost as opportunity (NOT cash burn)

**NO conflitto**. Sono lenti diverse.

**Pricing decisione**:
- Software-only cost €50/scuola = pricing software-only €290-1290 (margine 80-95%)
- Hardware kit Omaric VENDUTO SEPARATO €110-663/scuola
- Content Tea + dev Andrea = capex Y1 + opportunity cost (NON variable cost steady-state)
- Legal+ISO27001 = optional capex Y2+ (defer Y1)
- Commerciale Davide MePA = sale-based commission (NOT fixed cost)

---

## 5. Pricing TOP 5 final master shortlist

### Final ranking after cost verification

| # | Pricing | Margine 100 scuole | Break-even | Andrea decision iter |
|---|---|---|---|---|
| 1 | Standard €490 + add-ons €99 | 90% | 8 scuole | 18 SHIP |
| 2 | Multi-year 3y €1290 prepaid | 88% | 8 scuole | 18 SHIP |
| 3 | PNRR €1490/3y voucher | 90% | 5 scuole | 19 PREPARE |
| 4 | Site License €590 unlimited classi | 75% | 12 scuole | 20 EVAL |
| 5 | Bundle Omaric Y1 free + €590 Y2+ | 85% Y2+ | 20 scuole post bridge | 19 PITCH OMARIC |

---

## 6. Andrea decision queue cost reduction iter 18-22 (synthesis)

Da file 02 §10 + new pricing decisions §5:

### Iter 18 (immediate, 1-3 days)
1. **Q1**: Sentry → GlitchTip (-€234/anno)
2. **Q2**: Mistral primary A/B (-€240/anno)
3. **Q5**: Defer Insurance Y1 (-€600/anno)
4. **Q6**: Andrea partita IVA forfettario (-€1,740/anno)
5. **Q8**: Iubenda free Y1 (-€324/anno)
6. **Q10**: PostHog free EU vs Plausible (-€60 avoided)
7. **PRICING-1**: Ship Standard €490 + Multi-year 3y €1290
8. **PRICING-2**: Configure Stripe checkout 4 tier

### Iter 19 (1 settimana)
9. **Q3**: n8n → Edge Fn (-€216/anno, 1 settimana effort)
10. **Q4**: Vercel → Cloudflare Pages (-€220/anno, 1 giorno migration)
11. **PRICING-3**: PNRR collateral + Davide MePA pitch 3-year
12. **PRICING-4**: Pitch Omaric Y1-free bundle strategy

### Iter 20 (Tea decision)
13. **Q7**: Tea co-founder agreement equity 25% + revenue 15% Y2+
14. **PRICING-5**: Site License €590 evaluation post 5 scuole signed

### Iter 21 (scaling triggers)
15. Brevo Starter activation (>9K email/mese trigger)
16. Crisp Essentials (>10 scuole concurrent SLA)
17. Insurance Cyber+RC activation (post 20 scuole signed)

### Iter 22 (quarterly review)
18. Cost vs revenue actual reconcile
19. Pricing tier adjustment based 6-month sales data
20. Roadmap iter 23+ refresh

---

## 7. Risk + uncertainty

### 7.1 Risk pricing too low
- Standard €490 vs CampuStore €600-900 = competitive pricing.
- Risk perceived "low quality".
- Mitigation: PNRR €1490/3y signals premium positioning + Site License €590 anchored higher.

### 7.2 Risk pricing too high
- 5 scuole pilot Y1 = €2,450 revenue total. Insufficient cash bridge.
- Mitigation: Bundle Omaric Y1 free strategy = customer acquisition cost recovered Y2+.

### 7.3 Risk cost overrun
- LLM token usage spike unexpected (200 scuole heavy → €200/mese vs €100 budget).
- Mitigation: Mistral Small primary cap + Gemini fallback + cache pgvector.

### 7.4 Risk Tea departure
- Tea co-founder unpaid Y1 → exit risk.
- Mitigation: equity vesting 4-anni cliff 1-anno + revenue share Y2+.

### 7.5 Risk PNRR deadline 30/06/2026
- Sales window ~2 mesi rimanenti.
- Mitigation: Davide MePA already activated (CLAUDE.md "listing GIÀ COMPLETATO 2026-04-28").

---

## 8. Final pricing master decision iter 18

Recommended pricing structure live iter 18 ship:

```
ELAB TUTOR PRICING 2026

Software License Annual:
  Light €290/anno    — 1 classe, base features, no add-ons
  Standard €490/anno — 1 classe + 1 add-on inclusi (Vision OR Voice OR Backup)
  Pro €790/anno      — Multi-class (5) + 3 add-ons inclusi
  Premium €1290/anno — Site License + tutti add-ons + priority support

Multi-year Prepaid Discount:
  2-year: -9%  (Standard €890)
  3-year: -12% (Standard €1290) ← PNRR-friendly voucher
  5-year: -19% (Standard €1990)

Add-ons modulari €99/anno:
  Vision UNLIM (capture+diagnose)
  Voice premium ElevenLabs Italian
  Compile Arduino unlimited
  Multi-class extension
  Backup R2 30gg rolling
  Dashboard analytics premium

Hardware Kit Omaric (separato, venduto by Omaric Elettronica):
  Kit base €110/scuola
  Kit classe 6-unit €663/scuola
  Kit classe 12-unit €1,200/scuola

Bundle Strategy (negotiation pitch):
  Omaric Y1 free + €590 Y2+ (customer acquisition Y1)
  Site License €590 unlimited classi same plesso
  PNRR voucher 3-year €1490/3y
```

---

## 9. Summary deliverables iter 18 cost-stack-opus

**3 files NEW**:
- `01-comprehensive-cost-stack-2026.md` — 30+ providers verified 2026 pricing
- `02-cost-optimization-roadmap.md` — current → optimized → scaling roadmap
- `03-PRICING-MASTER-UPDATE.md` — pricing strategy rivisto post cost verify (this file)

**Quick wins shippable iter 18**:
1. Sentry → GlitchTip self-host: -€234/anno
2. Mistral primary A/B 50%: -€240/anno
3. Defer Insurance Y1: -€600/anno
4. Andrea forfettario regime: -€1,740/anno
5. Iubenda free Y1: -€324/anno

**Total quick wins iter 18 alone**: -€3,138/anno (-71% vs €4,420 attuale)

**Pricing tier shippable iter 18**:
- Standard €490 + add-ons €99
- Multi-year 3y €1290 (PNRR voucher friendly)

**Profit projection**:
- 100 scuole steady-state: €47K gross profit, €25K operating
- 200 scuole: €92K gross, €42K operating
- 500 scuole: €230K gross, €45K operating post team hires

---

## 10. Sources

- File 01: `01-comprehensive-cost-stack-2026.md` (provider URL list §28)
- File 02: `02-cost-optimization-roadmap.md`
- Pre-existing: `docs/strategy/2026-04-28-pricing-strategy/01-cost-analysis-per-school.md`
- Pre-existing: `docs/strategy/2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md`
- Pre-existing: `docs/strategy/2026-04-28-financial-statements/01-projected-income-statement-12mo.md`
- CLAUDE.md team context (Andrea + Tea co-dev iter 8 close)
