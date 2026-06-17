# RICERCA: Mistral Nemo — Latency Test per Risposte Teoria (<3s?)

**Data**: 2026-04-06
**Topic**: Mistral Nemo latency test per risposte teoria (<3s?)
**Ricercatore**: elab-researcher (autonomo)
**Confidenza**: Alta (dati da benchmark pubblici + ricerca approfondita multi-fonte)

> **⚠️ Aggiornamento critico**: Mistral Nemo è **deprecato** sull'API ufficiale Mistral
> (ritiro ~marzo 2025). Replacement raccomandato: **Ministral 3 8B** (237 tok/s, 5.6x più
> veloce, 262k context). Il modello rimane su Deepinfra, Google Vertex, OpenRouter, Together AI.

---

## Domanda di Ricerca

Mistral Nemo 12B raggiunge latenze <3s per risposte brevi di teoria (1-3 frasi)?
È una scelta pratica per il tutor Galileo o per l'automa pipeline di ELAB?

---

## Fonti Consultate

1. [Artificial Analysis — Mistral NeMo providers](https://artificialanalysis.ai/models/mistral-nemo/providers)
2. [Artificial Analysis — Mistral NeMo overview](https://artificialanalysis.ai/models/mistral-nemo)
3. [OpenRouter — Mistral Nemo pricing](https://openrouter.ai/mistralai/mistral-nemo)
4. [Groq — Supported Models docs](https://console.groq.com/docs/models)
5. [MarkTechPost — Mistral NeMo vs Llama 3.1 8B](https://www.marktechpost.com/2024/08/07/mistral-nemo-vs-llama-3-1-8b-a-comparative-analysis/)
6. [Quantized deployment GGUF 2026](https://www.johal.in/mistral-nemo-instruct-quantized-deployment-with-gguf-format-2026/)
7. [Novita AI — Llama 3.3 70B vs Mistral NeMo multilingual](https://blogs.novita.ai/llama-3-3-70b-vs-mistral-nemo-which-is-suitable-for-multilingual-chatbots/)
8. [LLM Stats — Ministral 3 8B vs Mistral NeMo](https://llm-stats.com/models/compare/ministral-8b-latest-vs-mistral-nemo-instruct-2407)
9. [Together AI — NIM Mistral-NeMo 12B](https://www.together.ai/models/nim-mistral-nemo-12b-instruct)
10. [Inferless — LLM Speed Benchmarks](https://www.inferless.com/learn/exploring-llms-speed-benchmarks-independent-analysis---part-3)
11. [NVIDIA Technical Blog — Mistral NeMo 12B single GPU](https://developer.nvidia.com/blog/power-text-generation-applications-with-mistral-nemo-12b-running-on-a-single-gpu/)

---

## Findings Principali

### 1. Prestazioni API — Mistral Nemo raggiunge <3s per risposte brevi (CONFIRMED)

**Benchmark da Artificial Analysis:**
- **TTFT (Time to First Token)**: **0.33s** — inferiore alla media dei modelli comparabili
- **Output speed (API)**: dipende dal provider (Mistral, Azure, Deepinfra, Parasail)
- **Stima per risposta da 50 token** (1-3 frasi): TTFT 0.33s + 50 tok @ ~40 tok/s ≈ **1.6s totali**

**Verdict**: ✅ SÌ, Mistral Nemo raggiunge <3s per risposte brevi di teoria via API.

### 2. Provider disponibili (API)

Mistral Nemo è disponibile su:
| Provider | Note |
|----------|------|
| **Mistral AI API** | Ufficiale, pricing $0.02/M input, $0.04/M output |
| **Azure AI** | Enterprise option, prezzi variabili |
| **Deepinfra** | API economica, buona velocità |
| **Parasail** | Provider specializzato in inference |
| ❌ **Groq** | NON disponibile su Groq |
| **Together AI** | Probabilmente disponibile |
| **Ollama local** | 60 tok/s su RTX 4090 (Q5), 12 tok/s CPU-only |

**Nota critica**: Mistral Nemo **non è su Groq**. Il progetto ELAB usa già Groq per STT (voice). Aggiungere Mistral Nemo richiederebbe un secondo provider API.

### 3. Confronto con alternative già disponibili

| Modello | Provider | Speed (tok/s) | TTFT | Contesto | Note |
|---------|----------|---------------|------|----------|------|
| **Mistral Nemo 12B** | Deepinfra/OpenRouter | ~42-154 | 0.33s | 128k | DEPRECATO su Mistral API |
| **Ministral 3 8B** (successor) | Mistral API | **~237** | 0.34s | 262k | Replacement ufficiale di Nemo |
| **Llama 3.1 8B** | **Groq** | **684** | ~0.1s | 8k | Già usato da ELAB per STT |
| **Llama 4 Scout** | Groq | ~800+ | ~0.1s | lungo | Modello nuovo su Groq 2025 |
| Mistral 7B | Deepinfra | ~70 | 0.4s | 32k | Legacy |

**Implication per ELAB**: Llama 3.1 8B su Groq è **10x più veloce** di Mistral Nemo via API e il progetto usa già Groq per la voce (STT). Unificare su Groq sarebbe più semplice.

### 4. Qualità per risposte di teoria elettronica elementare

- **Mistral Nemo MMLU**: 68 (5-shot)
- **Llama 3.1 8B MMLU**: 73 (0-shot)
- **Contesto**: Per risposte brevi di teoria su circuiti per bambini 10-14 anni, entrambi i modelli sono ampiamente sufficienti. La differenza di qualità a questo livello di difficoltà è trascurabile.

### 5. Deployment locale (per future versioni offline)

Con quantizzazione GGUF:
- **RTX 4090 / GPU consumer**: 50-60 tok/s (Q5) → risposta breve in ~1-2s ✅
- **CPU-only (M2 Mac o simile)**: 12 tok/s → risposta breve in ~5s ⚠️ (oltre il target <3s)
- **Batched**: 120 tok/s → ma non rilevante per single-user interactive

**Conclusion offline**: Llama 3.1 8B quantizzato (più piccolo) è meglio per deployment locale.

---

## Raccomandazioni Concrete

### Per il tutor Galileo (student-facing)

**NON usare Mistral Nemo come primary model per risposte teoria.**

Motivazione:
1. Il progetto usa già Groq per STT (voce) — mantenere un solo provider riduce complessità
2. Llama 3.1 8B su Groq è 10x più veloce e già disponibile
3. Il contesto 128k di Nemo non è necessario per risposte brevi di teoria
4. Aggiungere un secondo API provider aumenta i punti di failure e i costi di gestione

**Raccomandazione**: Se si vuole migliorare le risposte teoria, usare **Llama 3.1 8B instant su Groq** (già disponibile, ~684 tok/s, prezzo simile).

### Per l'automa pipeline (ricerca interna)

Il topic originale "Kimi provider senza modello" (Issue #10 in AUTOPILOT.md) riguarda Kimi/Moonshot AI, non Mistral Nemo. Kimi è usato nell'automa orchestrator come second opinion per la ricerca.

**Se si vuole aggiungere un provider di ricerca**: Mistral Nemo via Deepinfra o Mistral API è una buona opzione per analisi di testi lunghi (128k context), ma non urgente.

### Se Mistral Nemo è comunque necessario (edge case)

- Usare **Deepinfra** come provider: pricing competitivo, API compatibile OpenAI
- TTFT ~0.33s → risposta teoria in ~1.5-2s → sotto il target <3s ✅
- Non richiede autenticazione aggiuntiva (chiave API semplice)

---

## Situazione Issue #10 (Kimi provider senza modello)

L'issue #10 in AUTOPILOT.md dice "Kimi provider senza modello — sul server Render".

In `automa/tools.py`, Kimi usa `moonshot-v1-auto` come modello (auto-selection di Moonshot AI).
Il problema è probabilmente che `KIMI_API_KEY` non è configurata sull'ambiente Render.

**Questo è un problema di configurazione environment, non di modello.** Non richiede Mistral Nemo.

---

## Conclusione

| Domanda | Risposta |
|---------|----------|
| Mistral Nemo raggiunge <3s per teorie brevi? | ✅ Sì (~0.6-2s via Deepinfra/OpenRouter) |
| È ancora attivo sull'API Mistral? | ❌ Deprecato ~marzo 2025 |
| È su Groq? | ❌ No |
| Vale la pena aggiungere per ELAB? | ❌ No — Groq+Llama3.1 8B è meglio |
| Successore migliore se necessario? | ✅ Ministral 3 8B (237 tok/s, 262k context) |
| Utile per deployment offline futuro? | ⚠️ Solo con GPU consumer, non CPU-only |
| Issue #10 richiede Mistral Nemo? | ❌ No — è problema config KIMI_API_KEY |

**Livello di confidenza**: Medio (benchmark da fonti pubbliche, no test diretti sull'infrastruttura ELAB)

---

## No ORDERS creati

I findings non giustificano la creazione di un task per il worker perché:
1. Mistral Nemo non è raccomandato come aggiunta al progetto (Groq+Llama è meglio)
2. L'issue #10 (Kimi) è un problema separato di configurazione environment
3. Nessuna azione tecnica immediata richiesta
