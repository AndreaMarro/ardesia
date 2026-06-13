# Deep-research (claude claude-fable-5) — 2026-06-10

Ho verificato tutto il necessario su fonti multiple. Ecco il report.

---

## Sintesi

**Sì, Gemma 4 esiste**: la famiglia è stata lanciata da Google nel 2026 e **Gemma 4 12B** (rilasciato il 3 giugno 2026) è reale: multimodale nativo (vision + audio) con architettura **encoder-free**, Apache 2.0, pensato per girare "su laptop con 16GB". Però il Q4_K_M pesa **~7,4 GB solo di pesi**, e su Hacker News utenti con Mac da **18GB** riportano errori di memoria. Il concorrente più forte è **Qwen3.5** (feb–mar 2026): famiglia 0.8B–9B nativamente multimodale, Apache 2.0, con il 9B a ~5–7 GB in Q4 e reputazione migliore sul lavoro agentico. Qwen3-VL (ott. 2025) resta valido ma è superato; Pixtral 12B è **deprecato** da Mistral; InternVL eccelle su DocVQA ma ha supporto Mac/GGUF/MLX incerto. **Verdetto**: su un Mac Mini M4 16GB che già esegue build+ASR, un brain locale 12B **non è sostenibile**; un modello ≤4B per task secondari sì.

## Fatti verificati (con URL)

**Gemma 4 — esistenza e specifiche**
- Gemma 4 12B annunciato il 3 giugno 2026; famiglia: **E4B** (edge), **12B** (dense), **26B MoE**. Primo modello mid-size Google con **audio nativo**; vision+audio entrano direttamente nel backbone LLM senza encoder (vision embedder da 35M parametri, patch 48×48; audio 16 kHz in frame da 40 ms proiettati linearmente). Apache 2.0, pesi su HF/Kaggle. Fonti: [blog ufficiale Google](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12b/), [Google Developers Blog](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/), [InfoQ](https://www.infoq.com/news/2026/06/google-gemma4-12b-local-coding/)
- Runtime supportati: llama.cpp, MLX, Ollama, LM Studio, LiteRT-LM, vLLM; GGUF ufficiali su [ggml-org/gemma-4-12B-it-GGUF](https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF); guida [Unsloth](https://unsloth.ai/docs/models/gemma-4)
- Dimensioni reali: **Q4_K_M ≈ 7,38 GB**, Q4_0 ≈ 6,7 GB, BF16 26,7 GB; con 4-bit e contesto 8K–32K "sta in 16 GB" *da solo* ([buildfastwithai](https://www.buildfastwithai.com/blogs/gemma-4-12b-guide), [Lushbinary](https://lushbinary.com/blog/self-host-gemma-4-12b-local-deployment-guide/))
- Esperienza reale: su [Hacker News](https://news.ycombinator.com/item?id=48385906) un utente con MacBook Pro **18GB** riceve "requires more memory than is available"; int8 ≈ 12 GB; vision giudicata "decente"; tool-calling buono ma con errori sintattici sporadici in Q4 (meglio le versioni **QAT**); multimodale via llama.cpp richiede mmproj dedicato. Function calling nativo con token speciali dedicati ([Datature](https://datature.io/blog/gemma-4-what-computer-vision-engineers-actually-need-to-know))

**Qwen3.5 (il vero rivale, supersede Qwen3-VL)**
- Rilascio feb–mar 2026; **0.8B/2B/4B/9B Apache 2.0**, nativamente multimodali (testo+immagini+video, early fusion, niente albero VL separato), contesto 262K. Fonti: [blog Qwen](https://qwen.ai/blog?id=qwen3.5), [Simon Willison](https://simonwillison.net/2026/Feb/17/qwen35/), [MarkTechPost](https://www.marktechpost.com/2026/03/02/alibaba-just-released-qwen-3-5-small-models-a-family-of-0-8b-to-9b-parameters-built-for-on-device-applications/), [HF Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- 9B in 4-bit ≈ **5–7 GB**; su M4 16GB ~22–28 tok/s; il 4B ≈ 3,5 GB a 38–48 tok/s ([modelfit.io](https://modelfit.io/blog/best-llm-mac-mini-m4-16gb/), [apxml](https://apxml.com/models/qwen35-9b)). Nei confronti diretti, Qwen3.5 batte Gemma 4 E4B su quasi tutti i benchmark agentici (gap TAU2 di ~38 punti sul 4B) ([MindStudio](https://www.mindstudio.ai/blog/gemma-4-vs-qwen-3-5-open-weight-comparison), [XDA](https://www.xda-developers.com/ran-gemma-4-and-qwen-35-for-same-local-tasks-one-pulled-ahead/)); su HN, Qwen 3.5 9B giudicato superiore a Gemma 4 12B per lavoro agentico, comparabile per coding

**Qwen3-VL / InternVL / Pixtral**
- Qwen3-VL-8B: GGUF Q4_K_M ≈ **6,1 GB**, supporto llama.cpp da ott. 2025 e MLX; forte su document OCR/tabelle/UI grounding; su Apple Silicon "best on 16GB" ([HF GGUF ufficiale](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF), [codersera](https://codersera.com/blog/qwen3-vl-4b-vs-qwen3-vl-8b-benchmarks-vram-guide/), [Unsloth](https://unsloth.ai/docs/models/qwen3-vl-how-to-run-and-fine-tune))
- InternVL 3.5: **#1 su DocVQA**, eccellente su documenti+OCR ([blog InternVL](https://internvl.github.io/blog/2025-08-26-InternVL-3.5/)) — ma supporto MLX/GGUF su Mac non verificato nelle fonti consultate
- Pixtral 12B: **ufficialmente deprecato da Mistral** ([pagina Mistral](https://mistral.ai/news/pixtral-12b/)); accuratezza che crolla su manoscritti e font piccoli; richiede ~16GB in Q4 → da escludere

**Budget RAM su Mac Mini M4 16GB**
- Disponibile realisticamente per i modelli: **10–12 GB** (macOS+servizi 2–3 GB, app attive 2–3 GB); con build/ASR concorrenti la raccomandazione è restare **≤8B**, e un 12B richiede di chiudere tutto il resto ([modelfit.io](https://modelfit.io/blog/best-llm-mac-mini-m4-16gb/), [like2byte](https://like2byte.com/mac-mini-m4-16gb-local-llm-benchmarks-roi/))

## Opzioni e verdetto

| Opzione | RAM reale (Q4 + contesto) | Vision doc/manoscritti | Tool-calling | Verdetto |
|---|---|---|---|---|
| **Gemma 4 12B** brain agente | ~7,4 GB pesi + 2–4 GB KV/vision ≈ **10–11 GB** | Buona, OCR/manoscritti nel training; "decente" nei test community | Nativo ma errori sintattici in Q4 (usare QAT) | **IGNORE** come brain su questa macchina |
| **Qwen3.5-9B** | ~5–7 GB + contesto | Nativa, forte | Migliore della classe per agentic | **TRIAL** solo se l'agente gira quando build/ASR sono fermi |
| **Qwen3.5-4B** / **Gemma 4 E4B** | **3,5–4 GB** | Buona per docs semplici, limitata su manoscritti difficili | Sì (Qwen3.5-4B nettamente superiore nei benchmark agentici) | **ADOPT** per task secondari (classificazione, OCR leggero, routing, riassunti) |
| Qwen3-VL-8B | ~6,1 GB | Molto forte su OCR documenti | Sì | IGNORE: superato da Qwen3.5 |
| InternVL 3.5 / Pixtral 12B | n.d. / ~8 GB | Top DocVQA / scarso su manoscritti | n.d. | IGNORE su Mac (supporto incerto / deprecato) |

**Verdetto finale**: un agente autonomo con brain locale 12B su un Mac Mini M4 16GB **che esegue già build+ASR non ha senso**: il solo Gemma 4 12B Q4 occupa ~10–11 GB con contesto e vision, contro i 10–12 GB realisticamente disponibili *a macchina scarica* — e ci sono segnalazioni di OOM perfino su 18GB. La velocità (~20–30 tok/s, meno sotto pressione di memoria) è inoltre marginale per loop agentici multi-step. **Architettura consigliata**: brain dell'agente in cloud (o su altra macchina), più **Qwen3.5-4B quantizzato (~3,5 GB)** locale per task secondari sempre attivi; costo reale: 0 € di hardware aggiuntivo, ~3,5–4 GB di RAM residente. Se in futuro la macchina viene liberata dai carichi (o si passa a 24/32 GB), Qwen3.5-9B diventa il primo candidato come brain locale, prima ancora di Gemma 4 12B.

## Incertezze dichiarate

- **Composizione esatta della famiglia Gemma 4**: il blog ufficiale cita E4B/12B/26B MoE, ma fonti secondarie citano anche E2B e 31B — non verificato su fonte primaria.
- **Context window di Gemma 4 12B**: non dichiarata nelle fonti primarie consultate.
- **Qualità su manoscritti** (handwriting vero, non print-OCR): nessun benchmark indipendente dedicato trovato per Gemma 4 12B o Qwen3.5; le affermazioni provengono da documentazione dei vendor e impressioni community. Da testare in proprio su campioni reali.
- **Token/s precisi su M4 base 16GB** per Gemma 4 12B: il claim ">50 tok/s con MTP drafters" è di Google/community, non misurato indipendentemente su M4 16GB.
- Diverse fonti di confronto (modelfit.io, lushbinary, gemma4-ai.com, codersera) sono blog SEO-oriented: i numeri di RAM/tok/s sono plausibili e coerenti tra loro, ma non benchmark accademici.
- Supporto MLX/GGUF di **InternVL 3.5 su Mac**: non verificabile dalle fonti consultate.
