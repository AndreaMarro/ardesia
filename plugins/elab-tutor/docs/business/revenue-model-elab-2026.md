# ELAB Tutor — Revenue Model 2026
**Autore:** Andrea Marro (solo-dev)
**Data:** 2026-04-22
**Tono:** Massima onestà. Nessun numero gonfiato. Tutto verificabile o etichettato come ipotesi.

---

## 0. TL;DR onesto

- **Oggi (Apr 2026):** 0 scuole paganti. Il prodotto è live ma non venduto.
- **Break-even solo-dev (infra coperta, tempo Andrea non pagato):** ~**8-10 scuole** in abbonamento base €500/anno = ~€4.000-5.000/anno ricorrenti.
- **Break-even con compenso Andrea €30k/anno:** ~**60 scuole** base + 10 premium = ~€35k/anno.
- **Finestra PNRR (deadline 30/06/2026):** unica leva per raggiungere 50+ scuole rapidamente via MePA (Davide).
- **Rischio #1:** senza deal PNRR firmati entro giugno, il modello scala solo su adozione organica — lenta (2-3 anni).
- **Rischio #2:** commodity LLM. Se OpenAI/Google lancia "tutor scuola" generico, il nostro vantaggio (volumi fisici ELAB + kit Omaric + Principio Zero) diventa difendibile solo con la filiera integrata.

---

## 1. Stato attuale (verificato)

| Dimensione                 | Valore verificato                                                      | Come verificato                                                |
|---------------------------|------------------------------------------------------------------------|----------------------------------------------------------------|
| Scuole paganti            | 0                                                                      | —                                                              |
| Classi pilota (freemium)  | ? (Supabase `classes` table) — probabilmente 0-2                       | `select count(*) from classes` — da verificare live            |
| Sessioni registrate       | 51+ (Supabase `sessions` — S1/10 04/04/2026)                           | `S1-supabase-dashboard-04apr2026.md`                           |
| Test suite                | **12.371 test** (baseline 22/04/2026)                                  | pre-push hook                                                  |
| RAG corpus                | 549 chunk volumi + 27 Lezioni mappate + 92 esperimenti con `bookText`  | `src/data/rag-chunks.json`, `src/data/lesson-groups.js`        |
| Wiki LLM POC              | scaffold Deno edge + retriever keyword (Sett-4 loop)                   | `supabase/functions/unlim-wiki-query/` + `scripts/wiki-query-core.mjs` |
| Infra spesa mese (oggi)   | ~€20-50/mese: Vercel Hobby, Supabase Free, Render Free, Hostinger VPS  | fatture Vercel + Supabase UI                                   |
| Costo AI per sessione     | Gemini Flash 70%/Flash 25%/Pro 5% ≈ **€0,002 a sessione**              | routing in `supabase/functions/unlim-chat/`                    |

---

## 2. Segmenti clienti (dal più caldo al più freddo)

### A. Scuole PNRR 4.0 (HOT — deadline 30/06/2026)
- **Chi:** istituti comprensivi che hanno fondi PNRR STEM/Scuola 4.0 da rendicontare
- **Canale:** Davide Fagherazzi via MePA (filiera già attiva)
- **Unità:** singolo istituto = 2-5 classi
- **Willingness-to-pay:** €1.500-5.000 una-tantum (kit + abbonamento software 1 anno)
- **Tempo ciclo:** 4-8 settimane (gara MePA + consegna Omaric)
- **Realistico H1 2026:** 5-15 scuole se Davide chiude entro giugno

### B. Scuole kit-only (WARM — no deadline)
- **Chi:** scuole private + comprensivi con budget proprio
- **Unità:** 1 classe
- **WTP:** €500/anno base (software-only) o €1.500 kit+software
- **Tempo ciclo:** 2-3 mesi tra contatto insegnante e approvazione DSGA
- **Realistico H2 2026:** 3-10 scuole se facciamo 2-3 demo/mese

### C. Docenti solo-ingaggiati (COLD — flywheel lento)
- **Chi:** docente singolo che entra con classe virtuale + class_key
- **Unità:** 1 classe, no kit fisico
- **WTP:** €10-30/mese (abbonamento classe virtuale) o freemium
- **Tempo ciclo:** immediato (signup)
- **Realistico 2026:** 10-30 docenti pagati (noise rispetto a PNRR)

### D. Enterprise (VERY COLD, long-term)
- **Chi:** reti scuole (es. 10+ istituti), regioni, MiUR
- **Unità:** rete
- **WTP:** €5.000-50.000/rete/anno
- **Tempo ciclo:** 6-18 mesi
- **Realistico 2026:** 0-1 deal

---

## 3. Tariffario proposto (SKU)

| SKU                     | Prezzo         | Include                                                                | Target                                  |
|-------------------------|----------------|------------------------------------------------------------------------|------------------------------------------|
| **Base €500/anno**      | €500/anno      | Software UNLIM full, 1 classe, dashboard docente, RAG 549 chunk        | Docente singolo, classe virtuale         |
| **Premium €1.500/anno** | €1.500/anno    | Base + Wiki LLM full 6000 chunk + fumetto report + voce TTS premium    | Scuola con 2+ classi, budget proprio     |
| **Kit ELAB €800-1.200** | una-tantum     | 3 volumi + kit Omaric (breadboard, Arduino, componenti)                | Qualsiasi scuola con budget kit          |
| **Enterprise €5k+**     | €5.000-50.000  | Tutto + onboarding + supporto prioritario + analytics classe           | Reti scuole, regioni                    |
| **Freemium**            | €0             | UNLIM base + 10 esperimenti + watermark + no fumetto                   | Adozione virale                          |

**Note onestà:**
- Il prezzo €500/anno è sotto competitor tipo DeskTime/Edmodo premium (€8-15/studente/anno × 25 = €200-375/classe/anno) ma offre più profondità didattica.
- Il kit €800-1.200 è gestito da Omaric (margine loro + un nostro 10-20%, da negoziare).
- Enterprise è speculativo — nessuna vendita ancora fatta. Da togliere se non materializza entro 9 mesi.

---

## 4. Costo per scuola (mensile, CloudRun scale)

Ipotesi per UNA scuola attiva (2 classi × 20 studenti × 2 sessioni/settimana):

| Voce                         | Costo mensile  | Note                                                                |
|------------------------------|----------------|---------------------------------------------------------------------|
| Gemini API (70/25/5 routing) | €0,80-2,00     | 320 sessioni/mese × €0,002-€0,006                                   |
| Supabase (Free → Pro a scala)| €0,00-25,00    | Free fino a 500MB DB + 2GB storage, poi €25/mese Pro               |
| Vercel (Hobby → Pro a scala) | €0,00-20,00    | Hobby fino a limiti, Pro €20/mese squad                            |
| Hostinger VPS compilatore    | €8,00          | fixed, 1 istanza condivisa                                          |
| Edge TTS VPS                 | €5,00          | fixed, 1 istanza condivisa                                          |
| Render Nanobot AI            | €0 (free tier) | valuta promozione a paid se serve warm instance                    |
| **TOTALE scuola attiva**     | **~€14-60/mese** | (dipende da soglie Supabase/Vercel superate)                     |
| **TOTALE solo-dev (fisso)**  | **~€20-50/mese** | mentre siamo sotto soglie free + 1 scuola attiva                  |

**Riassunto:**
- 1 scuola attiva costa circa **€20-60/mese** di infra (scala col traffico).
- Ricavo 1 scuola base: €500/12 = **€41,60/mese**.
- Ricavo 1 scuola premium: €1.500/12 = **€125/mese**.

**→ Mix 2 base + 1 premium = ~€208/mese ricavo vs ~€60/mese infra → margine 70%.**

---

## 5. Stage di scala — break-even honest

| Stage | Scuole paganti        | Infra €/mese | Ricavi €/mese | Margine | Andrea €    |
|-------|-----------------------|--------------|---------------|---------|-------------|
| **0 (oggi)**     | 0 (gratis)      | ~€30   | €0      | -€30/mese      | 0 €/mese    |
| **1**            | 2 base          | ~€40   | €83     | +€43/mese      | 0 €/mese    |
| **2a**           | 5 base + 1 prem | ~€65   | €333    | +€268/mese     | ~€3.200/anno |
| **2b (target H2 2026)** | 8 base + 2 prem | ~€80 | €583 | +€503/mese | ~€6.000/anno |
| **3**            | 20 base + 5 prem| ~€200  | €1.458  | +€1.258/mese   | ~€15.000/anno |
| **4**            | 50 base + 15 prem + 1 enterprise | ~€500 | €5.500 | +€5.000/mese | ~€60k/anno |
| **5**            | 100 base + 30 prem + 3 enterprise | ~€1.000 | €12.000 | +€11.000/mese | ~€130k/anno + team hire |

**Riferimenti stage:**
- **Stage 1** raggiungibile con 2-3 demo riuscite (H1 2026).
- **Stage 2b** è il vero target 2026 se PNRR performa. Andrea inizia a vedere €500/mese netti.
- **Stage 3** presuppone case study solido + referenze + Giovanni vende export.
- **Stage 4** richiede assunzione customer success part-time (~€1.500/mese).
- **Stage 5** è team completo (3-4 persone). Fuori scope 2026.

---

## 6. Perché l'architettura OpenClaw + Morfico ha senso ECONOMICO

**Ipotesi critica:** ogni nuova feature-richiesta oggi richiede tempo Andrea (~€200/giorno implicito). Moltiplicato per 10-50 richieste/anno di docenti, è un freno a mano.

**Con OpenClaw morfico (L1/L2):** molte richieste non-standard risolte a runtime SENZA nuovo deploy. Esempio:
- Docente dice: "UNLIM, quando il LED è acceso, fai blinkare anche il buzzer" → L1 composition di `highlightComponent` + `speakTTS` + loop.
- Oggi: richiede codice custom. Tempo Andrea: 1-3 ore.
- Con OpenClaw: 0 tempo Andrea, costo Gemini ~€0,01.

**Aritmetica retrospettiva:** se OpenClaw evita anche solo 20 feature-request/anno che mi costerebbero 1 giorno ciascuna, salva ~€4.000/anno di tempo equivalente (in opportunity cost di altre vendite/sviluppi).

---

## 7. GPU VPS vs Together AI — scelta onesta

### Scenario A: "zero clienti paganti" (oggi)
- **Non serve GPU VPS mensile.** Premature.
- **Consigliato:** affitta GPU orarie (Vast.ai RTX 4090 €0,30/h, Scaleway L4 €0,85/h) per weekend benchmark. **Budget: €15-20/weekend per test.**
- **Together AI:** usa SOLO in mode `batch_ingest` per generare Wiki LLM full corpus una-tantum. **Costo stimato: $0,07.** Poi il corpus vive su Supabase/pgvector e non serve più Together.

### Scenario B: "3-5 scuole paganti" (Stage 2a)
- **Hetzner GEX44 RTX 6000 Ada 48GB €187/mese.** Diventa rational se si esegue LLM server proprio (Qwen 14B/72B) perché:
  - Gemini su 5 scuole costa ~€10-30/mese → GEX44 costa 6x più
  - MA dà GDPR-pulito (no transfer US) + latenza sub-100ms + privacy story vendibile alla scuola
- **Together AI:** `teacher_context` mode per "prepara lezione" con consenso esplicito. Budget €5/mese cap.

### Scenario C: "20+ scuole" (Stage 3)
- GEX44 diventa economico (€9,35 per scuola/mese vs €1,50 di Gemini → margine GDPR +€5 giustifica).
- Opzione: 2x VPS (ridondanza + load balancer Scaleway).

**Decisione attuale (oggi, Apr 2026):**
- NIENTE GPU VPS mensile.
- Together AI batch ingest UNA volta per Wiki LLM ($0,07).
- GPU orarie €15-20/weekend quando si testano nuovi modelli (Qwen VL 7B, Voxtral 4B TTS, BGE-M3).

---

## 8. Rischi veri (non teorici)

| Rischio                                   | Probabilità | Impatto  | Mitigazione                                          |
|-------------------------------------------|-------------|----------|------------------------------------------------------|
| PNRR deadline 30/06 mancata               | MEDIA       | ALTO     | Davide chiude 5 scuole entro maggio o pivot a B/C    |
| Commodity LLM (GPT/Gemini "tutor scuola") | MEDIA-ALTA  | ALTO     | Defending moat: volumi fisici + kit Omaric + PZ v3   |
| Andrea sololo-dev burnout                 | ALTA (nel tempo) | ALTO | Hire customer success @Stage 3, outsource CS         |
| Supabase paused per inattività            | BASSA       | MEDIO    | Heartbeat cron + upgrade a Pro quando 1ª scuola paga |
| Together AI privacy backlash              | BASSA       | MEDIO    | Cap utilizzo batch + teacher-consent, audit log      |
| GDPR violation (fuga dati minori)         | BASSA       | CRITICO  | EU-only runtime, audit log, niente Together student  |
| Giovanni lascia il progetto               | MEDIA (nel tempo) | ALTO | MePA Davide è autonomo, Andrea tech è autonomo       |
| Omaric ritardi kit                        | MEDIA       | MEDIO    | Buffer 2 settimane + alternative (sconti kit-only)   |

---

## 9. Azioni consigliate (ordine di priorità)

1. **H1 2026 — Vendita PNRR (Davide)**
   - Target: 5-15 scuole firmate entro 30/06/2026
   - Andrea: materiali marketing 1-pager + demo video 3-min
   - KPI settimanale: n. demo fatte / n. preventivi inviati / n. scuole firmate

2. **Infra: resta su free tier finché possibile**
   - Upgrade Supabase Pro SOLO quando 1ª scuola paga
   - Vercel Pro SOLO quando metriche superano Hobby
   - GPU VPS SOLO quando 3+ scuole paganti

3. **OpenClaw morfico Sprint 6 (Sett 5-6 loop)**
   - L1 composition in produzione entro fine maggio
   - L2 template gated a teacher-explicit-consent entro metà giugno
   - L3 dynamic DEV-FLAG only, non in produzione 2026

4. **Together AI: UNA SOLA sessione batch-ingest**
   - Wiki LLM full corpus in R2/Supabase ($0,07 una-tantum)
   - Poi spegnere: $0/mese a regime per noi

5. **GPU benchmark weekend — budget €20**
   - Vast.ai RTX 4090 × 8h = $2,40 (Qwen 72B + 14B)
   - Scaleway L4 × 4h = €3,40 (confronto)
   - Voxtral 4B TTS test × 2h locali o cloud
   - Output: tabella comparativa reale per decidere Stage 2a

6. **Documentazione vendita (Giovanni)**
   - 1-pager tecnico "perché ELAB è diverso" (Principio Zero + kit fisico + GDPR EU)
   - Slide 10-pag export-ready (scuole in Germania/Francia dopo Italia)
   - ROI scuola: "Con ELAB il docente risparmia 2-3h preparazione a lezione" (testare con 3 docenti pilota)

---

## 10. Onestà brutale finale

- **Oggi ELAB Tutor fa €0/mese ricorrenti.** Il prodotto è tecnicamente solido (12.371 test, 6.8-7.0 score onesto). Il gap è commerciale, non tecnico.
- **PNRR è la finestra.** Se non chiude entro 30/06, H2 diventa marketing organico e cresce lentamente.
- **L'architettura OpenClaw morfica NON sostituisce vendite.** È un moltiplicatore: rende ogni €1 di ricavo più sostenibile perché riduce tempo-dev marginale. Ma senza clienti, è solo elegante codice.
- **GPU VPS mensile oggi = premature optimization.** Si sposta a Stage 2a.
- **Together AI è un martello specifico (batch + emergency). Non è la soluzione generale.** Se lo usi per runtime student, violi GDPR.
- **Principio Zero v3 è il VERO differenziatore vendibile.** Prova a metterlo nel pitch deck: "il nostro AI parla ai ragazzi, non al docente" → è un concetto che nessun competitor ha formalizzato.

---

## 11. Ancoraggio: questo documento è vivo

Aggiornare mensilmente:
- N. scuole paganti effettive
- Infra €/mese reale (fattura Vercel + Supabase)
- Costo medio AI per sessione (query `together_audit_log` + Supabase Functions logs)
- Stage corrente raggiunto

Se tra 6 mesi (ottobre 2026) siamo ancora Stage 0/1, rivalutare onestamente:
- Il prodotto ha fit? (chiedi a 10 docenti)
- Il prezzo è giusto? (A/B test €300 vs €500 vs €800)
- C'è un canale che manca? (forse non solo MePA — directt-to-school, YouTube, influencer docenti)

**Il successo non è più complessità tecnica. È trovare il canale che converte.**
