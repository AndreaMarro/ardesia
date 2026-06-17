# GPU VPS — Quando SI, Quando NO (decision framework onesto)

**Data:** 2026-04-23
**Autore:** Andrea Marro (attraverso Claude, max honesty)
**Finalità:** framework concreto per decidere quando attivare GPU VPS mensile per ELAB

---

## 0. Il fine ultimo (contesto)

**Obiettivo ELAB 2026**: UNLIM onnipotente + onniscente, morfico controllato, GDPR-pulito, che faccia guadagnare Andrea entro fine 2026 senza compromessi su Principio Zero v3 + linguaggio bambino 8-14.

Componenti che potenzialmente richiedono GPU:

| Componente                          | Oggi                           | Con GPU locale                |
|-------------------------------------|--------------------------------|-------------------------------|
| LLM tutor (chat runtime)            | Gemini cloud (EU)              | Qwen 14B/72B self-host        |
| LLM batch (wiki ingest)             | Together AI batch ($0.07)      | Qwen locale gratis            |
| Vision diagnosi circuito            | Gemini Vision cloud            | Qwen VL 7B locale             |
| TTS voce UNLIM                      | Edge TTS VPS (CPU)             | Voxtral 4B GPU (voce reale)  |
| STT trascrizione                    | Whisper cloud / locale CPU     | Whisper Turbo GPU            |
| Embeddings RAG (BGE-M3)             | NON ATTIVO (keyword only)      | BGE-M3 locale (vector)       |
| Morphic L1 orchestration            | LLM esterno                    | LLM locale + L1/L2 runtime   |

---

## 1. Decision matrix: QUANDO sì

Attiva GPU VPS mensile (Hetzner GEX44 €187/m o simili) quando almeno **2 di queste 4 condizioni vere**:

### Condizione A — Volume: > 500 sessioni/mese
```
Gemini API 500 sessioni × avg 3 call × 1k token = 1.5M token/mese
Costo Gemini Flash: ~€3.50/mese  →  GPU non vale
Costo Gemini Pro 5%: ~€2/mese   →  GPU non vale
Volume > 5000 sessioni/mese: Gemini ≈ €40/mese  →  GPU inizia a valere
```
**Soglia: 5.000+ sessioni/mese**. Oggi: < 50.

### Condizione B — Privacy: scuola richiede self-host
Alcuni DS pretendono "i dati non escono dalla regione UE" come requisito contratto.
Hetzner DE = EU-only = requisito soddisfatto.

**Soglia: 3+ scuole con requisito esplicito**. Oggi: 0 verificato.

### Condizione C — Latenza: < 500ms p95 richiesto
Gemini cloud oggi ~800-1200ms cold + 400ms warm. Qwen locale < 300ms possibile.
Rilevante se workflow classe veloce (es. speakTTS streaming real-time).

**Soglia: requisito UX documentato dopo 3+ demo fallite per lentezza**. Oggi: 0 demo con lag identificato.

### Condizione D — Fine-tuning: modello custom serve
Fine-tune Qwen su corpus ELAB + stile Principio Zero v3 + linguaggio bambino = differenziatore.
Non possibile su Gemini (no FT API user). Possibile su Together AI batch (costoso).

**Soglia: piano FT concreto (dataset + budget + tempo)**. Oggi: nessuno.

---

## 2. Quando assolutamente NO

| Scenario                         | Perché NO                                                             |
|----------------------------------|------------------------------------------------------------------------|
| 0 clienti paganti                | €187×12 = €2.244/anno vs Gemini ~€15/anno → 150x spreco                |
| Benchmark hobby                  | Affitta orarie Vast/Scaleway €0.30-0.85/h per weekend (€15-20 totale)  |
| "Just in case" ridondanza        | Cloud già ridondante. GPU singola = SPOF                              |
| PoC modelli                      | Together AI batch $0.07 una-tantum per provare                        |
| Fase ideazione architettura      | Scrivi codice prima, misura, poi decidi infra                        |

---

## 3. Path di onboarding GPU (quando decidi SÌ)

### Step 1 — Benchmark weekend (€15-25)
Plan esistente: `docs/superpowers/plans/2026-04-26-gpu-vps-weekend-benchmark.md`
- Vast.ai RTX 4090 × 6h
- Scaleway L4 FR × 4h
- RunPod A100 LU × 3h
- Together AI batch comparison
- Hetzner GEX44 trial 3h (se vuoi)

Output: tabella latency/quality/€ per provider.

### Step 2 — Single month trial (€187)
Hetzner GEX44 RTX 6000 Ada 48 GB mensile.
Setup:
```bash
# Deploy stack (Deno + vllm + ollama + Voxtral)
git clone <deploy-repo>
docker compose up -d
```
Target: 1 mese reale traffic (se Andrea fa demo scuole live).

### Step 3 — Evalutation month 1 report
Dopo 30 giorni:
- Numero sessioni servite
- Latency p50/p95/p99 vs cloud
- Downtime incidenti
- €187 vs cloud equivalent cost
- Verdict: continue / kill / swap provider

### Step 4 — Commit annuale (se OK)
Prezzo annuale ~€200/mese sconto.
ROI only se Stage 2a+ (3+ scuole).

---

## 4. Fallback cloud senza GPU (oggi + fino a Stage 2a)

| Workload                | Provider                    | Cost/mese stimato (< 500 ses) |
|-------------------------|-----------------------------|--------------------------------|
| LLM tutor               | Gemini 2.5 Flash-Lite       | €1-3                          |
| Vision                  | Gemini 2.5 Flash Vision     | €0.50-1.50                     |
| TTS                     | Edge TTS VPS € 5/mese fisso | €5                             |
| STT                     | Whisper locale CPU          | €0                             |
| Embeddings              | Together AI batch una-tantum | €0.07 (one-time)              |
| **TOTAL cloud AI**      |                             | **~€7-10/mese**                |

**Conclusione: fino a 500 sessioni/mese, cloud cloud è 10-20× più economico di GPU VPS.**

---

## 5. Piano "se serve la impostiamo" (come Andrea ha detto)

### Trigger immediato (quando attivare)
- Prima scuola firma contratto pagato con requisito "self-host EU"
- OR 3+ demo confermate per Q2 con 5+ classi target
- OR fine-tuning Principio Zero v3 pianificato concreto

### Setup in 1 giornata
1. Mattina: noleggio Hetzner GEX44 (€187 prima settimana pro-rata)
2. Pomeriggio: docker compose up (stack preconfigurato)
3. Sera: test workload reali da ELAB staging
4. Giorno dopo: cutover flag cloud → GPU (feature flag `VITE_AI_BACKEND=hetzner`)

### Setup pre-requisiti (fare ORA, senza spendere GPU money)
- [ ] Docker compose stack (ollama + vllm + BGE-M3 + Voxtral) scritto + testato in CI
- [ ] Feature flag `VITE_AI_BACKEND` pluggabile a `src/services/api.js`
- [ ] Health check + failover automatico cloud se GPU down
- [ ] Monitoring (Grafana + Prometheus container)

---

## 6. Decisione onesta OGGI

- **Non attiviamo GPU mensile oggi**: sarebbe €187 di infra con 0 ricavi attesi mese successivo.
- **Weekend benchmark €15-25**: SÌ, quando Andrea ha weekend libero. Utile per familiarità stack + numeri reali.
- **Docker compose ready-to-deploy**: da scrivere Sprint 7-8 (~2 giornate), così al trigger si attiva in un giorno.
- **Together AI batch $0.07 una-tantum**: SÌ, ora come parte di wiki ingest per BGE-M3 embeddings iniziali.

## 7. Trigger + counter-trigger (auto-check mensile)

Script `scripts/gpu-decision.mjs` (da creare):
```js
// Condizione sì: (sessioni_ultimi_30g > 5000) || (scuole_self_host >= 3) || (fine_tuning_planned)
// Emette notifica Telegram quando trigger hit
// Non decide da solo — alerta Andrea
```

---

## 8. Honesty

- Oggi: 0 ricavi, 0 scuole firmate, GPU mensile = premature optimization
- Weekend €20: YES
- Mese €187: NO finché non c'è almeno 1 cliente contratto
- Docker compose stack ready: YES, Sprint 7-8
- "Se serve la impostiamo": VERO, in 1 giorno se prereqs fatti

**Non comprare potenza oggi. Comprare preparazione.**
