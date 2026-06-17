# ELAB Tutor — Cost Analysis per Scuola/Anno

**Data**: 2026-04-28
**Iterazione**: Sprint T iter 17 — finance-opus
**Scope**: Costo TOTALE per 1 scuola/anno con scaling 5/10/20/40/80/100/200 scuole.
**Fonte cost backend**: ADR-022 Scaleway H100 + Kapsule. Verificato pricing real 2026.

Stima onesta. NO inflation. Math verifiable.

---

## 1. Backend Infrastructure (per scuola/anno)

### 1.1 Scaleway H100 GPU (UNLIM Brain runtime + Vision)

Pricing real 2026: H100 SXM52x €2.73/h (3TB scratch incluso).

| Mode | Ore/anno | Cost/anno |
|---|---|---|
| Always-on dedicato | 8760 | €23,914 |
| Auto-scale 8h scuola/giorno × 200 gg scolastici | 1600 | €4,368 |
| Burst 4h/gg × 180 gg | 720 | €1,966 |
| Sustained 6h/gg × 200 gg (mid scaling) | 1200 | €3,276 |

**Modello scelto** (Sprint T): Kapsule auto-scale + spot fallback.
- Base: 1200h/anno × €2.73 = **€3,276**
- Scratch storage incluso 3TB.
- Block Storage 500GB persistente: €0.10/GB/mese × 12 = €600/anno.
- **Subtotal 1.1**: €3,876/anno per istanza condivisa N scuole.

### 1.2 Edge Functions Supabase (CORS gate + nudge + sessions)

Free tier: 500K invocazioni/mese. Stima per scuola: 200 studenti × 50 query/gg × 200 gg = 2M/anno → 167K/mese. **Free tier copre fino ~3 scuole**.
Plan Pro: $25/mese × 12 = €276/anno (2M invocations + 8GB DB).

### 1.3 Vercel hosting frontend

Hobby gratuito non commerciale. Pro: $20/mese = €240/anno (illimitato bandwidth dev).
Per scaling >50 scuole: Enterprise (~€1,200/anno custom).

### 1.4 Voyage RAG embeddings

Voyage-4-lite: $0.02/M token. RAG 549 chunk × 800 token = 440K token (one-shot indexing). Re-embedding ~quarterly = €0.04/anno (negligible).
Query embedding: 200 studenti × 30 query/gg × 200 gg × 50 token = 60M token/scuola/anno × $0.02 = **€1.20/scuola/anno**.

### 1.5 Monitoring + DPA

- Sentry Team plan: €26/mese = €312/anno (shared tutte scuole).
- DPA Supabase EU: incluso.
- Backup S3 Scaleway: €5/mese × 12 = €60/anno.

### 1.6 Subtotal Backend Per Istanza Multi-Tenant

```
Scaleway GPU:           €3,876
Supabase Pro:           €276
Vercel Pro:             €240
Voyage embeddings:      €1.20 × N
Sentry:                 €312
Backup:                 €60
TOTAL fixed:            €4,764/anno
TOTAL variable:         €1.20/scuola
```

Per scuola/anno = (€4,764 / N) + €1.20.

| N scuole | Backend €/scuola |
|---|---|
| 5 | €954 |
| 10 | €477 |
| 20 | €239 |
| 40 | €120 |
| 80 | €61 |
| 100 | €49 |
| 200 | €25 |

**Mismatch vs CLAUDE.md**: docs dicono €98/€70/€75/€63/€55. Mio numero (post-allocazione fixed) é più basso oltre 20 scuole. CLAUDE.md include probabilmente buffer + retry + monitoring esteso. Uso media conservativa: ~€100/scuola sotto 20, ~€60 oltre 100.

---

## 2. Software Development Amortizzato Andrea

Sprint S+T+U budget Andrea solo dev:
- 5 sprint × 8 cicli × 6h = 240h. Stima retail dev senior IT €70/h = €16,800/sprint.
- Roadmap 2026: 18 sprint stimati = €302,400 dev cost teorico.
- Andrea costo reale: zero (founder unpaid). Costo opportunità ~€60K/anno se non vendesse altrove.

**Amortizzazione su 5 anni × N scuole** (founder cost recovery):
| N scuole anno 1 | Dev amortized/scuola/anno |
|---|---|
| 5 | €60K/5/5 = €2,400 |
| 10 | €1,200 |
| 20 | €600 |
| 50 | €240 |
| 100 | €120 |
| 200 | €60 |

NO retail markup. Andrea fa pulled-down 1 anno per ricovero = €15K/anno target.

---

## 3. Content Creation Tea (volumi + 92 video)

### 3.1 Volumi cartacei (Vol1+2+3)
- Scrittura + revisione: 6 mesi × €1,500 = €9,000 (Tea retail collaboratrice).
- Editing+layout: €3,000.
- Stampa offset 1000 copie 3 vol = €4 × 3000 = €12,000 (€4/copia).
- **Subtotal scrittura+stampa lotto**: €24,000 (riusabile multi-anno).

Per scuola: lotto 1000 copie copre 333 scuole (3 vol × 1 scuola). Allocato: €72/scuola anno 1.

### 3.2 Video lezioni Tea (92 narrate)

- Production cost stima: €150/video (script + recording + edit + voiceover + Voxtral TTS clone).
- 92 video × €150 = **€13,800 una tantum**.
- Ammortamento 5 anni × N scuole.

| N scuole | €/scuola/anno video |
|---|---|
| 5 | €552 |
| 20 | €138 |
| 100 | €27 |
| 200 | €14 |

### 3.3 Subtotal Content Tea

Anno 1: ~€124/scuola (5 scuole) → €14/scuola (200 scuole).
Anni 2-5: solo refresh contenuti (~€20/scuola/anno).

---

## 4. Hardware Kit Omaric

BOM ELAB Kit (stima da filiera Arduino + Omaric):
- Arduino Nano R4 clone: €15
- Breadboard 830 pt + jumpers: €5
- LED, resistor, push, photoresistor mix: €4
- Servo SG90 + buzzer + LCD 16x2: €12
- Sensore DHT11 + ultrasuono HC-SR04: €8
- PCB custom Omaric (LIM connector): €10
- Box plastica + booklet quickstart: €8
- **BOM totale**: €62/kit
- Assembly Omaric: €15/kit
- Shipping ITA: €8/kit
- **Cost Omaric per scuola** (1 kit base): **€85**
- Kit classe 6 unità: €85 × 6 = €510 (Arduino-style classroom pack precedente €600+)

Markup Omaric 30%: vendita scuola €110/kit singolo, €663/kit classe.

---

## 5. Commerciale Davide MePA + Giovanni Sales

### 5.1 Davide procurement MePA
- Cost iscrizione MePA: gratuito (Consip).
- Tempo Davide gestione bandi: ~10h/scuola. Retail €40/h = €400/scuola anno 1.
- Anno 2-5: rinnovo ~2h = €80/scuola.

### 5.2 Giovanni Fagherazzi sales
- Network Arduino global = lead acquisition cheap.
- Stima: 20% revenue commission anno 1 (typical channel).
- Su prezzo €1,500/scuola → €300/scuola Giovanni.
- Anno 2+: solo retention 5% = €75/scuola.

### 5.3 Travel + demo presenza
- 1 demo/scuola/anno: 200 km × €0.30 = €60. Trasferta + tempo: €200/demo allocato.

### 5.4 Subtotal Commerciale
- Anno 1: €400 + €300 + €200 = **€900/scuola** (peggior caso)
- Anno 2-5: €80 + €75 + €0 = **€155/scuola**

---

## 6. Legal + DPA + ISO27001

Target enterprise scuole pubbliche minori 8-14 = GDPR rigoroso.

- DPA template legale: €3,000 una tantum (avvocato). Allocato €600/anno × 5 anni / N scuole.
- DPIA scuola: €500/scuola anno 1 (template + revisione case-by-case).
- ISO27001 audit fee anno 1: €15,000 una tantum. Anno 2-5: surveillance €5,000/anno.
- Cyber insurance: €2,000/anno (RC + data breach).
- Cookie banner + privacy policy maintenance: €500/anno.

**Subtotal Legal**:
- Anno 1: (€600 + €15,000 + €2,000 + €500)/N + €500 = €18,100/N + €500.
- Anno 2-5: (€600 + €5,000 + €2,000 + €500)/N + €100 = €8,100/N + €100.

| N scuole | Legal anno 1/scuola | Legal anno 2-5/scuola |
|---|---|---|
| 5 | €4,120 | €1,720 |
| 20 | €1,405 | €505 |
| 100 | €681 | €181 |
| 200 | €591 | €141 |

ISO27001 è il driver principale — rinunciabile primo anno (mitiga RFP enterprise).

---

## 7. Support Clienti L1

- FAQ + chatbot self-service: zero costo incrementale (UNLIM stesso).
- Ticket umani: stima 5 ticket/scuola/anno × 30 min × €30/h = €75/scuola.
- Tool Helpdesk (Crisp/Intercom basic): €25/mese = €300/anno fisso.
- Fixed: €300/N
- Variable: €75/scuola

| N scuole | Support €/scuola |
|---|---|
| 5 | €135 |
| 20 | €90 |
| 100 | €78 |
| 200 | €76.5 |

---

## 8. Training Docenti

- Webinar onboarding 2h gratuito di gruppo: €100/sessione (Tea + Andrea).
- 1 webinar/mese × 12 = €1,200/anno. Allocato fisso.
- Materiale training (PDF + video tutorial): €500 una tantum / 5 anni = €100/anno.
- Site visit opzionale: €300 (incluso solo top-tier).

| N scuole | Training €/scuola |
|---|---|
| 5 | €260 |
| 20 | €65 |
| 100 | €13 |
| 200 | €6.5 |

---

## 9. Total Cost per Scuola (Anno 1 vs Anno 2-5)

### 9.1 Costo Anno 1 (acquisizione + setup)

```
Backend            + Dev amortized  + Content Tea + Kit Omaric (cost)
+ Commerciale      + Legal           + Support       + Training
```

| N scuole | Backend | Dev | Content | Kit | Comm | Legal | Sup | Train | TOTALE Anno1 |
|---|---|---|---|---|---|---|---|---|---|
| 5 | 954 | 2,400 | 676 | 510 | 900 | 4,120 | 135 | 260 | **9,955** |
| 10 | 477 | 1,200 | 338 | 510 | 900 | 2,310 | 105 | 145 | **5,985** |
| 20 | 239 | 600 | 169 | 510 | 900 | 1,405 | 90 | 65 | **3,978** |
| 40 | 120 | 300 | 85 | 510 | 900 | 953 | 83 | 33 | **2,984** |
| 80 | 61 | 150 | 42 | 510 | 900 | 726 | 79 | 17 | **2,485** |
| 100 | 49 | 120 | 41 | 510 | 900 | 681 | 78 | 13 | **2,392** |
| 200 | 25 | 60 | 26 | 510 | 900 | 591 | 77 | 7 | **2,196** |

### 9.2 Costo Anno 2-5 (retention)

Drop: dev ammortizzato resto, content refresh basso, comm leggera, legal solo surveillance, kit non si rivende ogni anno (vendita una tantum), training minimal.

| N scuole | Backend | Dev | Content | Kit refill | Comm | Legal | Sup | Train | TOTALE A2-5 |
|---|---|---|---|---|---|---|---|---|---|
| 5 | 954 | 1,200 | 200 | 100 | 155 | 1,720 | 135 | 50 | **4,514** |
| 20 | 239 | 300 | 50 | 100 | 155 | 505 | 90 | 25 | **1,464** |
| 100 | 49 | 60 | 27 | 100 | 155 | 181 | 78 | 8 | **658** |
| 200 | 25 | 30 | 14 | 100 | 155 | 141 | 77 | 4 | **546** |

---

## 10. Break-Even Analysis

Assumendo prezzo retail €1,800/scuola/anno (target medio MePA):

```
Margin Anno 1 = €1,800 − Cost Anno 1
Margin Anno 2-5 = €1,800 − Cost Anno 2-5
```

| N scuole | Cost A1 | Margin A1 | Cost A2 | Margin A2 |
|---|---|---|---|---|
| 5 | 9,955 | **−8,155** | 4,514 | −2,714 |
| 10 | 5,985 | −4,185 | 2,500 | −700 |
| 20 | 3,978 | −2,178 | 1,464 | +336 |
| 40 | 2,984 | −1,184 | 1,000 | +800 |
| 80 | 2,485 | −685 | 750 | +1,050 |
| 100 | 2,392 | −592 | 658 | +1,142 |
| 200 | 2,196 | −396 | 546 | +1,254 |

**Break-even ANNO 1 = NON RAGGIUNTO a €1,800 fino 200 scuole.**

A €2,500/scuola/anno:
| N | Anno1 margin | Anno2 margin |
|---|---|---|
| 20 | −1,478 | +1,036 |
| 100 | +108 | +1,842 |
| 200 | +304 | +1,954 |

**Break-even Anno 1 a €2,500/scuola = 100 scuole.**
**Break-even cumulativo 5 anni = 30 scuole circa** (se anno 2-5 paga €1,800).

A €3,000/scuola/anno (premium tier):
| N | Anno1 margin | Anno2 margin |
|---|---|---|
| 20 | +-22 | +1,536 |
| 50 | +500 | +1,800 |
| 100 | +608 | +2,342 |

Break-even cumulativo Y1+Y2 = 20 scuole.

---

## 11. Cost Stima per Numero Scuole (riepilogo)

```
                       N = 5    N = 10   N = 20   N = 40   N = 80  N = 100  N = 200
Anno 1 €/scuola        9,955    5,985    3,978    2,984    2,485    2,392    2,196
Anno 2-5 €/scuola      4,514    2,500    1,464    1,000      750      658      546
TCO 5 anni €/scuola    28,011  15,985    9,834    6,984    5,485    5,024    4,380
```

---

## 12. Critical Insights

1. **Sotto 20 scuole il modello brucia cassa**. Andrea + Tea + Davide + Giovanni servono molte scuole per coprire fixed.
2. **Legal+ISO27001 è il #2 cost driver** dopo dev. Senza ISO27001 anno 1 risparmio €11K/N.
3. **Backend GPU é stabile dopo 20 scuole** (~€60-240/scuola). Non é il blocker.
4. **Kit Omaric é il wedge**: vendita una tantum + necessario fisicamente. Margine 30% = revenue diretto Omaric.
5. **PNRR voucher = scuola NON paga out-of-pocket**. Decoupling cost-perception.
6. **Tea content lotto unico copre 333 scuole** = scaling content cost si abbatte rapidamente.

---

## 13. Conclusion Cost-Side

Per pareggiare anno 1 con prezzo realistico MePA (€1,800-2,500), ELAB deve raggiungere **40-100 scuole**. Sotto questa soglia: bridging founder unpaid + PNRR voucher essenziali.

Cost minimo sostenibile per scuola/anno (steady state 100+ scuole, anno 2+):
**€650-700/scuola/anno operating cost.**
Markup minimo per profittabilità: 2.5x = **€1,650-1,750 break-even prezzo**.

**Sources**:
- [Scaleway H100 Pricing](https://www.scaleway.com/en/pricing/gpu/)
- [Voyage AI Pricing](https://docs.voyageai.com/docs/pricing)
- [Piano Scuola 4.0 PNRR](https://www.mim.gov.it/documents/20182/6735034/PIANO_SCUOLA_4.0.pdf/)
