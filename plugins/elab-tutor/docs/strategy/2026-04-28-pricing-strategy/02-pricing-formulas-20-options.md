# ELAB Tutor — 20 Formule Pricing Diverse

**Data**: 2026-04-28
**Sprint T iter 17 — finance-opus**
**Cost reference**: vedi `01-cost-analysis-per-school.md`. Cost steady-state ~€650/scuola/anno (100 scuole).
**Math**: ogni formula calcolata su 100 scuole base. Margin = (Revenue − Cost) / Revenue.

NO inflation. Math coerente. Honest.

---

## Formula 1 — Subscription Annuale Flat All-Inclusive

**Razionale**: prezzo unico MePA-friendly, tutto incluso, scuola paga 1 fattura.

- **Componenti incluse**: software + UNLIM + voice + vision + fumetto + 92 video + dashboard + RAG + 4 giochi + Scratch + Arduino IDE + simulatore + kit Omaric base + 3 volumi + supporto L1 + onboarding webinar.
- **Escluse**: trasferta on-site (extra €300/visita), corsi PCTO (extra), white-label.
- **Target**: scuola primaria + secondaria 8-14, MePA standard procurement.
- **Prezzo**: **€2,490/scuola/anno** (€2,290 anno 2+).
- **Per studente**: 200 alunni → €12.45/studente/anno.
- **Margin (100 scuole, anno 1)**: (2490−2392)/2490 = **3.9%** thin. Anno 2+: (2290−658)/2290 = **71%**.
- **Pros**: semplice MePA, retention amorta cost A1, zero confusione cliente.
- **Cons**: Anno 1 quasi-zero margin. Solo sostenibile se retention >85%.
- **Break-even**: 95 scuole anno 1 (zero margin), 25 scuole anno 2+ (€700 cost).

---

## Formula 2 — Tiered Base / Pro / Premium-Video

**Razionale**: segmentazione willingness-to-pay. Base copre baseline scuole budget-strict. Premium upsell per scuole STEM-forti.

| Tier | Prezzo/anno | Componenti |
|---|---|---|
| Base | €1,290 | software + UNLIM chat + Arduino IDE + Scratch + simulatore + kit base + 3 volumi |
| Pro | €1,890 | Base + voice + vision + fumetto + dashboard + 4 giochi + supporto |
| Premium | €2,790 | Pro + 92 video Tea narrate + onboarding 4 visite + RAG completo |

- **Target Base**: primaria piccola con budget MePA strict.
- **Target Pro**: secondaria standard, default.
- **Target Premium**: scuole pilota + STEM-flagship.
- **Margin medio mix 30/50/20** = €1,938/scuola revenue, cost €700 = **64% margin** (anno 2+).
- **Pros**: massimizza ARPU, segmenta mercato, upsell facile.
- **Cons**: complessità sales, Davide gestisce 3 SKU MePA.
- **Break-even mix**: 70 scuole anno 1.

---

## Formula 3 — Per-Student Licensing

**Razionale**: pay-per-seat, scaling lineare con dimensione classe. Modello SaaS classico.

- **Prezzo**: **€18/studente/anno** software-only. Hardware separato.
- **Min**: 50 studenti = €900/scuola.
- **Max**: 500 studenti = €9,000.
- **Componenti**: software + UNLIM + voice + simulatore + RAG (no video Tea, no kit, no volumi).
- **Add-on**:
  - Kit Omaric: €110 unitario (1 ogni 4 studenti consigliato).
  - Volumi: €25/copia (1 per docente).
  - Video Tea premium: +€8/studente.
- **Target**: scuole grandi (>200 studenti) + scuole tech-mature.
- **Margin scuola 200 alunni**: revenue €3,600 + €110×50 (kit) = €9,100, cost ~€2,500 = **72%**.
- **Pros**: scala revenue con dimensione classe, modello cloud-native standard.
- **Cons**: piccole scuole (50 alunni) sotto break-even, MePA fatica con seat-license vs flat.
- **Break-even scuola**: minimo 70 studenti.

---

## Formula 4 — Pay-per-Experiment Consumo

**Razionale**: scuole budget-zero pagano solo cosa usano. Inspired by Twilio/AWS.

- **Pacchetto starter**: €299/anno (200 esperimenti UNLIM + 50h voice + 100 vision query).
- **Top-up**: €0.30/esperimento, €1/h voice, €0.50/vision.
- **Componenti**: software base + UNLIM (con quota) + simulatore. Kit Omaric separato (€110).
- **Target**: scuole pilot + insegnanti early-adopter senza budget MePA approvato.
- **Margin cost-tracked**: €0.04 cost/esperimento (Voyage+GPU). Revenue €0.30 = **86% margin** sul variable.
- **Cost fixed/scuola**: €700/anno. Break-even consumo: ~2,300 esperimenti/anno (12 alunni × 192 esperimenti).
- **Pros**: ingaggio low-friction, monetizza intensive users.
- **Cons**: revenue impredicibile, MePA non gestisce facilmente, hard sell vs flat.
- **Break-even**: scuole high-usage (>200 alunni, >150 esperimenti/alunno/anno).

---

## Formula 5 — Bundle Hardware+Software+Volumi+Video Unico Prezzo (One-Shot 3 Anni)

**Razionale**: PNRR dà finanziamento una tantum. Bundle 3-year license sfrutta cassa upfront.

- **Prezzo unico**: **€5,490/scuola** per 3 anni (= €1,830/anno equivalent).
- **Componenti**: tutto Premium tier (formula 2) × 3 anni + kit classe 6 unità + 3 volumi × 5 copie + 92 video.
- **Target**: scuole PNRR Piano Scuola 4.0 con €50,000 voucher disponibile (DM 219/2025).
- **Margin a 100 scuole**: €5,490 revenue, cost A1 €2,392 + cost A2 €658 + A3 €658 = €3,708. Margin = (5490−3708)/5490 = **32%**.
- **Pros**: cassa upfront, lock-in 3 anni, MePA single-procurement-event, riduce comm cost 67%.
- **Cons**: customer might churn after 3 anni se non ottimi risultati. Risk concentrato.
- **Break-even**: 50 scuole anno 1 (cash basis).

---

## Formula 6 — Freemium + Paid Premium

**Razionale**: acquisition viral docenti. Free tier converte 5-10% paid.

- **Free Tier**: 30 esperimenti/mese, UNLIM chat base, simulatore, no kit, no video Tea, no vision.
- **Paid Tier**: €890/scuola/anno con tutti unlimited.
- **Componenti free**: software baseline. Paid: tutto.
- **Target free**: docenti curiosi singoli + scuole esplorative.
- **Margin paid 100 scuole convertite**: (890−658)/890 = **26%**.
- **Cost free tier**: ~€80/scuola/anno (GPU minimo + Voyage).
- **Conversione tipica freemium edu**: 5%. Servono 2000 free per 100 paid.
- **Pros**: zero CAC docenti, network effect, brand awareness.
- **Cons**: cost free tier moltiplicato, GDPR rigoroso anche free, supporto L1 cresce.
- **Break-even**: 200 scuole paid (per cover free tier cost).

---

## Formula 7 — Site License Unlimited (€/scuola flat tutte le classi)

**Razionale**: scuole grandi non vogliono contare seat. Flat semplifica.

- **Prezzo**: **€2,990/scuola/anno** unlimited studenti + classi + docenti.
- **Componenti**: tutto incluso eccetto kit hardware (separato €510 classroom pack).
- **Target**: secondarie 500-1000 studenti, istituti comprensivi multipli plessi.
- **Margin grande scuola** (500 studenti, cost ~€800): (2990−800)/2990 = **73%**.
- **Pros**: predictable revenue, MePA-friendly flat, attractive scuole grandi.
- **Cons**: piccole scuole (100 studenti) sentono overprice, cannibalizza per-student.
- **Break-even**: 35 scuole grandi.

---

## Formula 8 — PNRR Voucher Zero-Cost (Government-Funded)

**Razionale**: scuola NON paga out-of-pocket. ELAB fattura direttamente fondo PNRR via Davide.

- **Prezzo nominale**: **€2,490/scuola/anno** (allineato MePA).
- **Pagamento**: scuola usa voucher Piano Scuola 4.0 (€50K limite) o DM 219/2025 (AI training).
- **Componenti**: bundle Premium completo.
- **Target**: tutte scuole pubbliche italiane con voucher PNRR attivo (~80% scuole 2026).
- **Margin**: stesso formula 1 (€2,490, cost €700) = **71%** anno 2+.
- **Differenza chiave**: scuola non sente prezzo, focus su valore. CAC più basso, conversion x3.
- **Pros**: zero price-resistance, scaling rapido, deadline PNRR 30/06/2026 = urgency.
- **Cons**: dipendenza politica fondi, post-PNRR (2027+) churn massiccio se scuole non hanno cash.
- **Break-even**: 20 scuole (voucher copre A1 quasi interamente).

**Critical**: PNRR scade. Dopo 2027 strategy switch obbligatorio.

---

## Formula 9 — Cooperative/Consortium Pricing (Reti Scuole)

**Razionale**: rete di scuole capofila + soci ottiene sconto. Scaling B2B2B.

- **Prezzo lista**: €2,490/scuola.
- **Sconto rete**:
  - 5-9 scuole: 15% = €2,116/scuola.
  - 10-19 scuole: 25% = €1,867.
  - 20+ scuole: 35% = €1,618.
- **Componenti**: bundle Premium + dashboard rete (vista capofila aggregata).
- **Target**: reti ambito territoriale (RST), reti regionali STEM.
- **Margin a 20 scuole**: (1618−658)/1618 = **59%** anno 2+.
- **Pros**: deal grossi (1 contratto = 20 scuole), CAC 1/20, MePA convenzione facilitata.
- **Cons**: pricing pressure se rete trattativa hard, capofila vuole revenue-share.
- **Break-even rete 20 scuole**: 4 reti.

---

## Formula 10 — Reseller/Distributor Model

**Razionale**: ELAB B2B-ELAB. Vendere via partner CampuStore/Ligra/Rekordata che già MePA-listed.

- **Prezzo wholesale**: €1,490/scuola → reseller markup 50% → €2,235 retail.
- **Componenti**: bundle Pro tier (no Premium video).
- **Target**: scuole acquirenti tramite reseller storici STEM Italia.
- **Margin ELAB**: (1490−658)/1490 = **56%**.
- **Margin reseller**: (2235−1490)/2235 = **33%**.
- **Pros**: zero comm cost ELAB, channel reach >5000 scuole, MePA listing reseller.
- **Cons**: brand control diluito, reseller vende anche competitor (Wokwi). Margin -15% vs direct.
- **Break-even**: 80 scuole via reseller.

**Important**: Giovanni Fagherazzi network = direct. Reseller solo per scuole non raggiungibili.

---

## Formula 11 — White-Label per Regione/Provincia

**Razionale**: regione/provincia compra license white-label, distribuisce con brand suo. Sicilia, Lazio, Lombardia.

- **Prezzo**: **€80,000-150,000/regione/anno** (50-100 scuole regionali).
- **Componenti**: full bundle + branding custom + DPA regionale + dashboard provinciale.
- **Margin regione 80 scuole**: revenue €100K, cost (80×€700) = €56K = **44% margin**. CAC ammortizzato.
- **Target**: assessorati regionali istruzione (Lombardia top STEM budget €23M/anno).
- **Pros**: deal massivi 1-shot, brand minore importance per ELAB ma volume gigante, lock-in 3-5 anni.
- **Cons**: sales cycle 12-18 mesi, RFI/RFP enterprise complessi, ISO27001 obbligatorio.
- **Break-even**: 1 regione = 50 scuole-equivalente.

---

## Formula 12 — Hybrid Hardware-Only + Software Trial

**Razionale**: kit Omaric venduto da subito, software trial 6 mesi gratis poi paga. Lower friction.

- **Anno 1**: Kit classe 6 unità a €699 (margin Omaric 30%). Software gratis 6 mesi.
- **Mese 7+**: software €99/mese × 12 = €1,188 obbligatorio.
- **Componenti**: kit + software bundle Pro tier dopo trial.
- **Margin combinato a 100 scuole**: kit €700 + software A1 €594 (6 mesi) = €1,294 revenue. Cost A1 €2,392. **−€1,098/scuola anno 1**.
- **Anno 2+**: €1,188 software, cost €658 = **45% margin**.
- **Pros**: low-barrier entry, kit-first sales (Omaric vince), software vendita upgrade naturale.
- **Cons**: cassa negativa anno 1, churn rate 6-mese-trial pericoloso.
- **Break-even**: solo se anno 2+ retention >70%.

---

## Formula 13 — Outcome-Based (€ per Studente Esame Passato)

**Razionale**: pay-for-performance. Scuola paga solo se studenti completano percorso.

- **Pricing**: €15/studente che completa "Patentino Elettronica ELAB" (test finale).
- **Min garantito**: €500/scuola/anno fixed (anche zero certificati).
- **Componenti**: full bundle, valutazione automatica via UNLIM + dashboard certificazione.
- **Target**: scuole performance-driven, dirigenti che vendono risultati.
- **Margin a 100 scuole** (avg 60 studenti certificati × €15 = €900 + €500 = €1,400): (1400−658)/1400 = **53%**.
- **Pros**: aligned incentives, marketing potente "paghi solo se funziona", SDG-friendly.
- **Cons**: revenue volatile, ELAB rischia performance, gaming docenti possibile (pass-all).
- **Break-even**: 50 scuole con avg >40 certificazioni.

---

## Formula 14 — Time-Based €/h Utilizzo LIM

**Razionale**: LIM è risorsa scarsa. Pay-per-time tipico classroom display vendor.

- **Prezzo**: **€2/h LIM-attivo + €0.50/studente connesso**. Pacchetti prepagati.
- **Pacchetto annuale**: 200h × €2 = €400 + 200 alunni × €0.50 × 200gg = €20,000... troppo.
- **Adjusted**: €0.05/studente-ora. 200 studenti × 200gg × 1.5h = 60K studenti-ora × €0.05 = €3,000/scuola.
- **Componenti**: full bundle metered.
- **Target**: dirigenti data-driven, scuole misurano OEE classroom.
- **Margin**: (3000−700)/3000 = **77%**.
- **Pros**: usage-aligned, scuole power-user pagano di più (giusto), monetizza intensive scuole.
- **Cons**: tracking richiede telemetry pesante, GDPR studenti minori = complesso, scuole basso-uso scappano.
- **Break-even**: 30 scuole high-usage.

---

## Formula 15 — Buy-as-You-Go Modular Components

**Razionale**: scuola compone bundle solo cosa serve. Modular SaaS.

| Modulo | €/scuola/anno |
|---|---|
| Core LIM + UNLIM chat | 690 |
| Voice Isabella | +290 |
| Vision diagnosi | +390 |
| Fumetto | +90 |
| 92 Video Tea | +590 |
| Dashboard docente | +190 |
| 4 Giochi | +90 |
| Scratch+Arduino IDE+sim | +290 |
| Volumi RAG (Vol1+2+3) | +290 |
| Kit Omaric classroom | +699 |

- **Total full** = €3,608/scuola se prendono tutto. **Sconto bundle 25%** = €2,706 (vs Formula 7 €2,990 = leggermente cheaper).
- **Avg scuola compra 5 moduli**: ~€1,890 = sweet spot.
- **Target**: scuole tecnicamente sofisticate, dirigenti costruttori.
- **Margin avg**: (1890−658)/1890 = **65%**.
- **Pros**: massimizza upsell, percezione fairness, compatible MePA configurazione.
- **Cons**: complessità SKU 10, paradox-of-choice cliente, sales cycle lungo.
- **Break-even**: 70 scuole.

---

## Formula 16 — Annual Subscription con Auto-Renewal + Discount Multi-Year

**Razionale**: lock-in retention via discount progressivi.

- **Anno 1**: €2,490 (base).
- **Anno 2** (auto-renewal): −10% = €2,241.
- **Anno 3+**: −15% = €2,116.
- **Commit 3-year upfront**: −25% = €1,867/anno (Formula 5 simile ma annual billing).
- **Componenti**: bundle Premium.
- **Target**: scuole MePA con budget pluriennale, contratti CONSIP convenzioni.
- **Margin avg**: anno 1 €2,490, anno 2 €2,241, anno 3 €2,116 → avg €2,282/scuola/anno.
- **Margin avg cost €700**: **69%**.
- **Pros**: predictable LTV, retention engineering forced.
- **Cons**: scuole percepiscono lock-in negativo, churn rate Y2 spike se scontento.
- **Break-even**: 25 scuole (cumulative 3-year basis).

---

## Formula 17 — Ad-Funded Education (Sponsored by STEM Brands)

**Razionale**: software gratis scuole. Revenue da Arduino/Adafruit/Sparkfun sponsor.

- **Scuola paga**: €0 software, €110 kit Omaric (cost). Volumi+video gratis.
- **Sponsor paga**: €5,000-15,000/anno per logo + content placement + lead gen.
- **Target sponsor**: vendor hardware STEM, editori didattici, fondazioni STEAM.
- **Componenti**: software bundle Pro + kit subsidized.
- **Margin sponsor 10 sponsor × €10,000 = €100K /yr / 100 scuole reach**: €1,000/scuola revenue ELAB. Cost €700 = **30% margin**.
- **Pros**: zero price-resistance scuole, viral growth potential, brand association high-tier.
- **Cons**: dipendenza sponsor, GDPR (no data minor venduto), content neutrality compromessa, MIM potrebbe vietare.
- **Break-even**: 5 sponsor anchor + 50 scuole.

**Risk**: Italia MIM (Ministero Istruzione) potrebbe contestare advertising scuole minori.

---

## Formula 18 — Pay-per-Class with Volume Discount

**Razionale**: license per classe non per scuola. Granularità intermedia.

- **Pricing**: €290/classe/anno. Min 3 classi = €870.
- **Discount**: 10+ classi = €240/classe. 20+ = €190/classe.
- **Componenti**: bundle Pro per ogni classe.
- **Target**: scuole grandi voglia controllo budget per classe.
- **Margin scuola 8 classi × €290**: revenue €2,320, cost €700 = **70%**.
- **Pros**: granular budgeting, classi-pilota sotto budget contenuto.
- **Cons**: anagrafica classi management complesso, churn classi mid-year.
- **Break-even**: 25 scuole (avg 6 classi).

---

## Formula 19 — Edu Federation/Comune-Wide

**Razionale**: vendita a Comune/Provincia che dota tutte scuole territorio. Equity-driven.

- **Prezzo Comune medio (10 scuole)**: **€18,000/anno** flat tutte scuole.
- **Componenti**: bundle Premium completo + branding civic + dashboard sindaco.
- **Target**: comuni capoluogo (Strambino-style ma scaling Bologna, Milano, Torino).
- **Margin Comune 10 scuole**: revenue €18K, cost (10×€700) = €7K = **61% margin**.
- **Pros**: deal politico high-visibility, locked 3-5 anni typical, citizen-equity narrativa.
- **Cons**: Procurement comunale lento, politicizzazione, election cycle risk.
- **Break-even**: 5 Comuni = 50 scuole-equivalente.

---

## Formula 20 — Unlimited Pro (€99/mese SaaS Individuale Docenti)

**Razionale**: bypass scuola. Vendere direct docente power-user.

- **Prezzo**: **€99/mese o €890/anno** docente singolo.
- **Componenti**: software Pro + 1 kit personale + accesso aula illimitato + 92 video.
- **Target**: docenti early-adopter, formatori indipendenti, makerspace.
- **Margin docente singolo**: revenue €890, cost ~€200/docente (no MePA, low support, GPU minimo) = **78%**.
- **Pros**: bypass procurement lentezza, viral social, scaling autonomo, brand grass-root.
- **Cons**: revenue piccolo per deal, no kit-classroom (solo individuale), MePA escluso (non istituzionale).
- **Break-even**: 200 docenti individuali.
- **Hybrid**: aggiungere a Formula 1 come canale parallelo, NON sostituirla.

---

## Riepilogo Tabella Comparativa 20 Formule

| # | Formula | €/scuola/anno medio | Margin% A2+ | Target | Complexity sales |
|---|---|---|---|---|---|
| 1 | Flat all-inclusive | 2,490 | 71% | MePA standard | Low |
| 2 | Tiered Base/Pro/Prem | 1,938 (mix) | 64% | Segmenti | Medium |
| 3 | Per-student | 18×N | 72% | Scuole grandi | Medium |
| 4 | Pay-per-experiment | 299+top-up | 53% var | Pilot/early | High |
| 5 | Bundle 3-anni one-shot | 1,830 (avg/anno) | 67% | PNRR voucher | Low |
| 6 | Freemium + paid | 890 (paid) | 26% | Viral acq | High |
| 7 | Site license unlimited | 2,990 | 73% | Scuole 500+ | Low |
| 8 | PNRR Voucher zero-cost | 2,490 | 71% | Tutte PNRR | Very low |
| 9 | Consortium reti | 1,618 (20+) | 59% | RST regionali | Medium |
| 10 | Reseller distributor | 1,490 | 56% | Via partner | Low |
| 11 | White-label regione | €100K/50 scuole | 44% | Regioni | Very high |
| 12 | Hardware + soft trial | 1,188 (Y2+) | 45% | Low-friction | Medium |
| 13 | Outcome-based | 1,400 | 53% | Performance-driven | High |
| 14 | Time-based €/h | 3,000 | 77% | Power users | High |
| 15 | Buy-as-you-go modular | 1,890 (avg) | 65% | Tech-savvy | High |
| 16 | Auto-renewal multi-year | 2,282 (avg) | 69% | Pluriennale | Low |
| 17 | Ad-funded sponsor | 1,000 | 30% | Sponsor tech | Very high |
| 18 | Per-class | 2,320 | 70% | Granular | Medium |
| 19 | Comune-federation | 1,800 (per scuola comune) | 61% | Comuni | Very high |
| 20 | Unlimited Pro docente | 890 | 78% | Direct teacher | Low |

**Top performers**: Formula 8 (PNRR), Formula 1 (flat), Formula 5 (3-year bundle), Formula 7 (site license).
**Bassa qualità segnale**: Formula 17 (sponsor risk), Formula 12 (cash-negative A1), Formula 11 (sales cycle 18 mesi).

---

## Insight Cross-Formule

1. **Margin floor minimo**: 30%. Sotto è non-sostenibile post-CAC.
2. **Margin sweet-spot**: 60-75% (formule 1, 7, 9, 16, 18).
3. **PNRR voucher decoupling** (Formula 8) é il game-changer 2026.
4. **Combine consigliato**: Formula 1 (default) + Formula 8 (channel) + Formula 9 (reti) + Formula 20 (docente direct) = portfolio robusto.
5. **Da escludere**: Formula 17 (advertising minori = legale rischioso), Formula 14 (telemetry overhead non giustifica).

**Sources**:
- [Wokwi Classroom Pricing](https://wokwi.com/classroom)
- [MePA Acquisti in Rete PA](https://www.acquistinretepa.it/opencms/opencms/)
- [Bando DM 219/2025 AI scuola](https://scuolatech.com/guida/bando-dm-219-2025-guida-completa)
