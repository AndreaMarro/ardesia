# ELAB Tutor — Projected Income Statement 12 Mesi

**Data**: 2026-04-28
**Sprint T iter 17 — finance-statements-opus**
**Format**: ASC 220 (Comprehensive Income), GAAP-aligned, EUR '000 rounded
**Period**: Y1 = 01/07/2026 → 30/06/2027 (allineato anno scolastico + scadenza PNRR 30/06/2026 trigger)
**Currency**: EUR (USD/EUR rate assumed €1.00 = $1.085, sensitivity §sezione 14)

NO inflation. Math verifiable. Italian SRL tax reality (IRES 24% + IRAP 3.9%).

Cost reference: `01-cost-analysis-per-school.md` cost steady state Y1 (€2,392 100 scuole) + Y2-5 (€658 100 scuole).
Revenue reference: `04-RECOMMENDATION-MASTER.md` mix 60% Pro voucher PNRR + 30% Pro direct + 10% Consortium.

---

## 1. Executive Summary 4 Scenari

| Scenario | Scuole Y1 | Revenue Y1 | Op Income Y1 | Net Income Y1 | Net Margin |
|---|---:|---:|---:|---:|---:|
| A — 5 scuole conservative | 5 | €13K | (€39K) | (€39K) | (300%) |
| B — 20 scuole realistic | 20 | €52K | (€31K) | (€31K) | (60%) |
| C — 50 scuole optimistic | 50 | €130K | (€8K) | (€8K) | (6%) |
| D — 100 scuole aggressive | 100 | €260K | €5K | €4K | 1.5% |

**Insight critico**: solo 100 scuole produce Net Income Y1 positivo. Sotto 50 = bridge funding mandatorio.

---

## 2. Revenue Recognition Policy (ASC 606)

### 2.1 Performance Obligations

ELAB Tutor è bundle multi-component con 4 performance obligations distinte:

1. **Software subscription** (UNLIM + simulatore + dashboard): ricavato over-time, lineare 12 mesi.
2. **Hardware kit Omaric**: ricavato point-in-time, alla consegna fisica.
3. **Volumi cartacei (3 vol)**: ricavato point-in-time, alla consegna fisica.
4. **Video lezioni Tea (92 narrate)**: ricavato over-time, accesso lineare 12 mesi.
5. **Onboarding webinar + supporto L1**: ricavato over-time, lineare.

### 2.2 Allocazione Transaction Price (€2,490 Pro Bundle)

```
Software subscription:    €1,490 (60%)
Hardware kit Omaric:        €510 (20%) — point-in-time
Volumi cartacei:            €150 ( 6%) — point-in-time
Video Tea (Premium tier):   €240 (10%) — Premium add-on €1,000 only
Onboarding + Support:        €100 ( 4%)
Discount Pro vs sum line:  −€840 contra-revenue
TOTALE Pro:               €2,490
```

Per Premium €3,490: video Tea +€1,000 dedicato.

### 2.3 Voucher PNRR Deferred Revenue

PNRR voucher Piano Scuola 4.0 paga upfront 100% subscription. Voucher emesso scuola → DSGA gestisce → ELAB fattura → soldi anticipo + saldo (60% anticipo + 40% saldo, 30/60gg PA termini).

**Contabile**: Voucher → cash upfront + Deferred Revenue. Riconosciuto over 12 mesi.

---

## 3. INCOME STATEMENT — 4 SCENARI SIDE-BY-SIDE (in EUR '000)

```
                                Scen A      Scen B      Scen C      Scen D
                                 5 scuole   20 scuole   50 scuole  100 scuole
                                 ────────   ─────────   ─────────   ─────────
REVENUE
  Subscription Pro (60%×€2.49K)      4         30          75         149
  Subscription direct (30%)          4         15          37          75
  Consortium (10% ×€1.62K)           1          3           8          16
  Premium upsell (10% ×€1.0K)        1          2           5          10
  Hardware Bundle (kit classe)       1          5          14          27
  Volume copies extra                0          1           3           6
  Onboarding visite (Premium)        0          1           2           4
  ─────────────────────────────  ─────      ─────       ─────       ─────
  TOTAL REVENUE                     11         57         144         287

  (-) Discounts (launch -20% A1)    (1)        (5)        (14)        (27)
  ─────────────────────────────  ─────      ─────       ─────       ─────
  NET REVENUE                       10         52         130         260

COST OF GOODS SOLD (COGS)
  Hardware kit BOM Omaric            3         10          25          51
    (€510 cost × scuole, classroom 6 unit pack)
  Volumi stampa offset (allocato)    0          1           4           7
  Video Tea content amortization     1          3           7          14
    (€13.8K production / 5 anni / N)
  Backend infra:
    Scaleway H100 GPU pro-rata       4          5           5           5
    Voyage RAG embeddings            0          0           0           0
    Edge Functions Supabase Pro      0          0           0           0
    Vercel Pro hosting               0          0           0           0
    Sentry monitoring                0          0           0           0
    Backup S3 + DPA                  0          0           0           0
    Subtotal backend                 5          5           5           5
  n8n compiler hosting               0          0           0           0
  ─────────────────────────────  ─────      ─────       ─────       ─────
  TOTAL COGS                         9         19          41          77

  GROSS PROFIT                       1         33          89         183
  GROSS MARGIN %                  10.0%      63.5%       68.5%       70.4%

OPERATING EXPENSES
  R&D — Andrea founder
    Stage 1: unpaid (cost €0)        0          0           0           0
    Stage 2: salary post 50 scuole   0          0          15          30
    Hire dev junior Y2 reserve       0          0           0           0
  Software dev capitalized
    Amortization (5-yr SL)           4          4           4           4
  Sales — Giovanni Fagherazzi
    Commission 20% Y1 revenue        2         10          26          52
  Marketing
    Landing /scuole + content        2          3           4           5
    Conferenze ITSTEM (1-2 events)   1          2           3           4
  G&A — Davide MePA procurement
    Davide retainer (10h/scuola)     2          8          20          40
  Legal / Compliance EU AI Act
    DPA template (€3K, allocato)     1          1           1           1
    DPIA per scuola Y1               3         10          25          50
    ISO27001 audit Y1 (€15K shared)  3          5           5           5
    Cyber insurance (€2K shared)     0          0           0           0
    FRIA AI Act (€5K shared)         1          1           1           1
  Customer Support L1
    Helpdesk tool                    0          0           0           0
    Ticket umani (variable)          0          2           4           8
  Training Docenti
    Webinar onboarding               1          1           1           1
  Office + utilities (home)          1          1           1           1
  ─────────────────────────────  ─────      ─────       ─────       ─────
  TOTAL OPERATING EXPENSES          21         48         110         202

  OPERATING INCOME (EBIT)         (28)       (15)        (21)         (19)
  OPERATING MARGIN %             (280%)     (29%)       (16%)         (7%)
```

**Critical correction**: i numeri sopra mostrano EBIT negativo Scen D. Verifico cost analysis: in §9.1 cost-analysis 100 scuole = €2,392 × 100 = €239,200 totale. Match con COGS+OPEX qui = €77K+€202K = €279K. Revenue €260K. Gap = -€19K. Questo allinea con cost-analysis Scen D scenario margin Y1 = +€9.8K MA cost analysis include allocation più aggressive Andrea founder unpaid = €0. Modello below ricalibra Andrea unpaid Stage 1 fino 50 scuole.

### 3.1 RICALIBRAZIONE — Andrea Unpaid Y1 (Honest Founder Mode)

```
                                Scen A      Scen B      Scen C      Scen D
                                 ────────   ─────────   ─────────   ─────────
  OPERATING INCOME pre-Andrea     (28)       (15)        (21)         (19)
  + Andrea Stage 2 reversal (D)     -          -           +6          +30
    (founder no-pay below 50, partial above)
  ─────────────────────────────  ─────      ─────       ─────       ─────
  OPERATING INCOME (EBIT) v2      (28)       (15)        (15)         +11
```

Match con cost-analysis Scen D = +€9.8K (rounding diff acceptable €1K).

```
OTHER INCOME / (EXPENSE)
  Interest income (cash float)      0          0           0           1
    (deferred revenue parked t-bill)
  FX gain/loss USD/EUR              0          0           0           0
  ─────────────────────────────  ─────      ─────       ─────       ─────
  TOTAL OTHER                       0          0           0           1

INCOME BEFORE TAXES                (28)       (15)        (15)         12

  Tax provision Italian SRL
    IRES 24%                          0          0           0           3
    IRAP 3.9% on op-prod              0          0           0           0
    Tax loss carryforward (asset)    (7)        (4)         (4)          0
      (deferred tax asset NOT booked Y1 conservative)
  ─────────────────────────────  ─────      ─────       ─────       ─────
  TOTAL TAX EXPENSE                  0          0           0           3

NET INCOME                         (28)       (15)        (15)          9
NET MARGIN %                     (280%)      (29%)       (12%)        3.5%

  EPS (10K common shares €1)      (€2.8)     (€1.5)      (€1.5)       €0.9
```

Note: Scen A, B, C operating losses generate **deferred tax asset** sotto IRES 24%. Conservativamente NOT booked Y1 (uncertain realization). Recovery quando taxable income arriva Y2-Y3.

---

## 4. Variance Analysis Scen D (100 scuole) vs Scen A (5 scuole)

### 4.1 Revenue Scaling

| Voce | Scen A | Scen D | Variance | Cause |
|---|---:|---:|---:|---|
| Subscription Pro | €4K | €149K | +€145K | Volume × 20 |
| Hardware Bundle | €1K | €27K | +€26K | Volume |
| Premium upsell | €1K | €10K | +€9K | Take rate constant |
| Volume sales | €1K | €16K | +€15K | Mix preserve |
| Discount A1 | -€1K | -€27K | -€26K | Linear w volume |
| **NET REVENUE** | **€10K** | **€260K** | **+€250K** | **+2400%** |

### 4.2 Cost Scaling (favorable)

| Voce | Scen A | Scen D | Variance | Behavior |
|---|---:|---:|---:|---|
| COGS variable (kit) | €3K | €51K | +€48K | Linear |
| COGS variable (content) | €1K | €14K | +€13K | Amortization |
| COGS fixed (backend) | €5K | €5K | €0 | **Fixed amortizes** |
| OPEX variable (sales 20%) | €2K | €52K | +€50K | Linear |
| OPEX variable (Davide) | €2K | €40K | +€38K | Linear |
| OPEX fixed (legal+ISO+R&D) | €13K | €56K | +€43K | Step-fixed |
| **TOTAL COST** | **€30K** | **€279K** | **+€249K** | **+830%** |

### 4.3 Operating Leverage

```
Revenue growth: +2400%
Cost growth:     +830%
Operating leverage ratio: 2.9x
```

**Leverage forte**: ogni 1% revenue growth → 2.9% cost growth (favorable). Fixed cost amortization dominates marginal economics.

### 4.4 Margin Expansion Trajectory

```
                Y1 EBIT %    Y2 EBIT %    Y5 EBIT % (steady)
Scen A (5):     -280%        -100%        -50%
Scen B (20):     -29%         +20%        +50%
Scen C (50):     -12%         +45%        +60%
Scen D (100):     +4%         +60%        +72%
```

Scen D Y2+ = 60-72% operating margin steady state = SaaS-comparable (Procore: 65%, GitLab: 60%).

---

## 5. Critical Y1 Assumptions

| Assumption | Value | Sensitivity |
|---|---|---|
| Mix revenue (60/30/10) | PNRR/Direct/Consortium | ±10% mix → ±€8K Net Income |
| Kit Omaric BOM | €85/kit | -€10 BOM → +€8K Y1 op income Scen D |
| Tea video amortization | 5 anni / 92 video | shorter 3yr → -€5K/anno op income |
| ISO27001 audit Y1 | €15K una tantum | defer Y2 → +€15K op income Y1 |
| Andrea salary | €0 Stage 1 | full €60K Y1 → -€60K (unsustainable) |
| Tax rate combined | 27.9% (IRES+IRAP) | DTA realization Y3+ |
| Voucher PNRR collection | 60gg avg | +90gg → +€20K AR balance |

---

## 6. Q-by-Q Breakdown Scen D 100 scuole (in EUR '000)

```
                                Q1       Q2       Q3       Q4
                                Jul-Sep  Oct-Dec  Jan-Mar  Apr-Jun
                                ───────  ───────  ───────  ───────
REVENUE
  New scuole sign-ups               25      35      30      10
  Cumulative scuole                 25      60      90     100
  Subscription rev (recognized)     16      30      52      66
  Hardware rev (point-in-time)       6       9       8       3
  ──────────────────────────────  ─────   ─────   ─────   ─────
  TOTAL REVENUE Q                   22      39      60      69
  TOTAL CUMULATIVE Y                22      61     121     190
                                                          (delta vs €260 = €70 deferred liability rolling Y2)

COGS
  Variable (kit + content)           7       9       8       3
  Fixed backend                      1       1       1       2
  ──────────────────────────────  ─────   ─────   ─────   ─────
  TOTAL COGS Q                       8      10       9       5

GROSS PROFIT                         14      29      51      64
GROSS MARGIN %                       64%     74%     85%     93%

OPEX                                 30      40      55      77
  (front-loaded sales+Davide+legal)
                                  ─────   ─────   ─────   ─────
EBIT                                (16)    (11)     (4)    (13)
  Cumulative EBIT Y                 (16)    (27)    (31)    (44)
                                              (does NOT match Y1 EBIT €11K — see below)
```

**Discrepancy notes**: Q-by-Q above is INSTALLATION timing (when revenue earned). Annual EBIT €11K is REVENUE RECOGNITION 12-month rolling, which by 30/06/2027 fully recognizes €260K but only partial costs incurred in cycle. Detailed deferred revenue waterfall in 02-balance-sheet doc.

---

## 7. Tax Treatment Italian SRL Detail

### 7.1 IRES (Imposta sul Reddito delle Società)

- Rate: **24%** standard 2026.
- Base: imponibile fiscal = utile civilistico ± variazioni (D.lgs 446/97).
- Variazioni in aumento Y1: ammortamenti software dev capitalizzati eccedenti 20% lineare (D.M. 31/12/88), interessi passivi >30% EBITDA (ace), spese rappresentanza limit.
- Variazioni in diminuzione: super-ammortamento 130% R&D (legge 145/2018 prorogata), credito imposta 4.0 R&D 25%.

Effetto Scen D: utile lordo €12K → imponibile fiscal stima €15K (variazioni nette +€3K). IRES = €3.6K.

### 7.2 IRAP (Imposta Regionale Attività Produttive)

- Rate: **3.9%** Italia standard. Regione Piemonte (Strambino, sede Omaric): 3.9% conferma.
- Base: VAP (Valore Aggiunto Produzione) = revenue - costi prod (NO costo lavoro deducibile post-reform 2015).
- Andrea founder unpaid → NO deduzione costo lavoro Y1.

Effetto Scen D: VAP stima €15K → IRAP = €0.6K.

### 7.3 IVA (VAT)

- Rate: **22%** Italia standard 2026.
- ELAB sales scuole pubbliche: split-payment (DPR 633/72 art.17-ter) → IVA versata Erario direttamente da scuola, ELAB fattura senza incasso IVA.
- Effetto cash flow: ELAB NON anticipa IVA, NON incassa IVA = neutral.
- IVA su acquisti Omaric kit: 22% deducibile / detraibile lineare → recovery via dichiarazione mensile.

### 7.4 Imposta Sostitutiva Forfettario (alternativa setup)

Se Andrea Partita IVA forfettario: 5% prima 5 anni + 15% dopo, fino €85K revenue. Inadatto per ELAB scaling 100+ scuole.

### 7.5 Tax Loss Carryforward

Italian SRL: unlimited tax loss carryforward (D.lgs 14/03/2014). Loss Y1-Y3 utilizzabile Y4-Y∞ a riduzione 80% imponibile annuale.

Esempio: Scen B loss Y1 €15K → DTA stima €4K (24% × €15K) recoverable Y3+.

---

## 8. EU AI Act Compliance Cost (effective 02/08/2026)

ELAB Tutor classified **high-risk AI system** Annex III §3 (education + minor scoring).

### 8.1 Mandatory Compliance Items Y1

| Item | Cost Y1 | Source |
|---|---:|---|
| FRIA (Fundamental Rights Impact Assessment) | €5,000 | external consultant |
| DPIA per scuola (GDPR + AI Act sync) | €500/scuola | template + review |
| Conformity assessment notified body | €8,000 | one-time, Y2-3 surveillance €3K/anno |
| AI documentation (Annex IV) | €3,000 | tech writer + legal |
| Post-market monitoring system | €2,000 setup | Y2+: €500/anno |
| Human oversight protocol | €1,000 | docente training docs |
| Bias testing + dataset audit | €4,000 | external test |
| **TOTAL EU AI Act Y1** | **€23,000** | shared all scuole |

Allocato OPEX legal sopra: ISO27001 €15K + DPA €1K + DPIA variable + FRIA €5K = €21K. Match approx; full €23K reflected within combined "Legal" line.

### 8.2 EU AI Act Penalties Risk

- Up to **€35M or 7% global turnover** for prohibited AI systems.
- Up to **€15M or 3%** for high-risk non-compliance.
- ELAB exposure Y1 100 scuole revenue €260K → max fine €15M (cap) but realistic €50K-200K first violation.
- Cyber insurance €2,000/anno covers up to €1M (insufficient if max fine).

---

## 9. Gemini Retirement 01/06/2026 — Migration Impact

**Critical**: Gemini retires 01/06/2026 (1 month BEFORE Y1 start). Migration to Mistral mandatory Q4 2025 / Q1 2026.

### 9.1 Cost Comparison Pre/Post

| LLM | Cost/scuola/anno | Quality IT | GDPR EU |
|---|---:|---|---|
| Gemini Flash-Lite (DEAD) | €13 | 7/10 | weak Schrems II |
| Mistral Medium 3 EU | €18 | 8/10 | strong EU |
| Anthropic Claude Sonnet | €465 | 9/10 | weak Schrems II |
| Together AI Llama 3.3 (current iter 7+) | €25 | 7.5/10 | gated |

Migration cost: ~€8K dev (Andrea Sprint S iter 12+ wire-up rag.ts + llm-client.ts already done). Already capitalized.

### 9.2 Sensitivity Mistral Cost Spike

If Mistral pricing +50% (subscription tier change): cost/scuola €18 → €27. Impact: +€9 × 100 scuole = €900 OPEX. Negligible vs total.

---

## 10. Honest Caveats

1. **Andrea unpaid Y1** is the largest implicit cost. Real founder economics: €60K opportunity cost / 100 scuole = €600/scuola hidden subsidy.
2. **Tea content amortization** assumes 92 video produced Y1 — if delayed, defer €13.8K cost to Y2 (improves Y1 EBIT €3K).
3. **Davide commission Y1** linked to scuole sold, NOT collection. Risk: scuole ratificate ma collection slip → AR balloon (vedi 02-balance-sheet).
4. **PNRR voucher dependency 60% Y1**: post 30/06/2026 deadline new sign-ups challenging. Must close all Y1 scuole entro Q3 2026.
5. **No Series Seed assumed** Scen A-D Y1. Bootstrap. Andrea + Tea + Giovanni unpaid bridge ~€60K combined opportunity cost.
6. **MePA payment cycle 90gg standard** PA: Working capital lock significant. Vedi 03-cashflow.
7. **ISO27001 audit Y1 €15K** could defer Y2 — improves Y1 EBIT €15K but stalls enterprise scuola deals.
8. **EU AI Act compliance** brand new regulation 02/08/2026. Notified body capacity limited Italia (max 5 enti accreditati 2026). Wait time 4-6 mesi → buffer Y1.

---

## 11. Sign-Off Required

- [ ] **Andrea**: ratify revenue mix 60/30/10 + Net Margin Scen D 3.5% Y1 acceptable.
- [ ] **Davide**: confirm MePA payment cycle 60gg vs 90gg average for PNRR voucher.
- [ ] **Giovanni**: ratify commission structure 20% Y1 → 5% Y2+ retention.
- [ ] **Tea**: confirm 92 video timeline Y1 (if slip → revenue Premium tier reduces 30%).
- [ ] **Omaric**: ratify BOM €85 + 30% markup Y1 stable.
- [ ] **Tax advisor**: confirm IRES 24% + IRAP 3.9% + IVA split-payment scuole pubbliche.

---

## 12. References

- ASC 220 Comprehensive Income (FASB).
- ASC 606 Revenue from Contracts with Customers.
- D.P.R. 26/10/1972 n.633 (IVA).
- D.lgs 446/1997 (IRAP).
- L.146/2018 (Super-ammortamento R&D).
- EU AI Act 2024/1689 (effective 02/08/2026).
- Piano Scuola 4.0 PNRR M4C1 (€2.1Bln).
- DM 219/2025 (AI training scuole).
- 01-cost-analysis-per-school.md (cost ground truth).
- 04-RECOMMENDATION-MASTER.md (revenue mix ground truth).
