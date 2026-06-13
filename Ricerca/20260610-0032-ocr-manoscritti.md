# Deep-research (claude claude-fable-5) — 2026-06-10

La ricerca è completa: 9 ricerche, 6 fonti primarie lette. Ecco il report.

---

## Sintesi

Per ~500 pagine di appunti manoscritti di Teoria dei Segnali (formule, integrali, grafici qualitativi, grafia frettolosa) i **vision-LLM via API hanno superato l'OCR classico** sia in accuratezza che in costo. Un benchmark indipendente su testo matematico ha trovato che **Gemini Flash batte Mathpix a 1/6 del costo** (~$0.0044/pagina), con Mathpix che produceva errori semantici critici. Tesseract è inutilizzabile su manoscritto+formule; TrOCR non gestisce LaTeX. L'esecuzione locale su Mac Mini M4 16GB è possibile (Qwen3-VL 8B, PaddleOCR-VL/GLM-OCR ~0.9B) ma con qualità inferiore su grafia frettolosa, specie quantizzata. La strategia migliore documentata in letteratura è per-pagina con contesto del documento ("+first page" / pagine precedenti come testo nel prompt). **Verdetto: Gemini Flash via API, costo totale stimato $2–5 per 500 pagine.** Attenzione al rischio principale dei LLM: omissioni di righe e "correzioni" inventate su passaggi illeggibili.

## Fatti verificati (con URL)

**Vision-LLM vs Mathpix su matematica:**
- Benchmark indipendente (dic 2025/gen 2026) su pagine di Pólya-Szegő: Gemini 3 Flash $0.0044/pagina vs Mathpix $0.025/pagina (~6x più caro); Mathpix ha prodotto errori semantici critici (5 letto come notazione, pedice 8 → S, layout multi-colonna distrutto); i LLM moderni output corretto; **Grok ha allucinato intere pagine** (1-4% di somiglianza) — [igorrivin.github.io/blog/ocr-benchmark](https://igorrivin.github.io/blog/ocr-benchmark/). Nota: testo stampato, non manoscritto.
- Prezzi Mathpix ufficiali: $0.002/immagine, $0.005/pagina PDF, + $19.99 setup una tantum con $29 di crediti — [mathpix.com/pricing/api](https://mathpix.com/pricing/api)

**Manoscritto — accuratezza (benchmark IAM, apr 2026):** GPT-5 ~1.22% CER (~$12/1K pag), Claude Opus 4.7 ~1.31% (~$15/1K), Gemini 3 ~1.44% (~$8/1K), GPT-5-mini ~1.52% (~$2/1K), Mistral OCR 3 ~2.1% ($2/1K, $1 in batch), TrOCR-Large 2.89% (gratis, locale). Caveat: IAM è testo inglese, non formule — [codesota.com/ocr/best-for-handwriting](https://www.codesota.com/ocr/best-for-handwriting). Gemini segnalato come "extraordinarily well" anche su manoscritto italiano — [handwritingocr.com](https://www.handwritingocr.com/blog/chatgpt-claude-and-ai-for-ocr), [generativehistory.substack.com](https://generativehistory.substack.com/p/gemini-3-solves-handwriting-recognition).

**Matematica manoscritta/fotografata resta difficile:** MathReal (2.000 immagini reali da smartphone): errori di percezione OCR+figure = 40–50% dei fallimenti; il miglior modello si ferma al 53.9% sul *reasoning* (la trascrizione pura va meglio del problem-solving) — [arxiv.org/html/2508.06009](https://arxiv.org/html/2508.06009). Paper 2026 conferma che anche i MLLM di punta faticano su soluzioni STEM manoscritte universitarie — [arxiv.org/html/2602.00095v2](https://arxiv.org/html/2602.00095v2).

**Strategia multi-pagina con contesto (verificata su paper):** su IAM, OCR-only CER 0.036 → "+first page" con gpt-4o-mini CER 0.015 → vision pagina-per-pagina con tutte le pagine CER 0.010. Dare al modello contesto del documento (testo delle pagine precedenti + immagine della pagina corrente) è sulla frontiera di Pareto costo/qualità; curiosità: gpt-4o-mini spesso batteva gpt-4o — [arxiv.org/html/2502.20295v1](https://arxiv.org/html/2502.20295v1).

**OCR classico:** Tesseract: nessun modello per manoscritto, e sulle formule fallisce strutturalmente (√(x+2) → "vx+2", apici/pedici confusi tra righe) — [groups.google.com/g/tesseract-ocr](https://groups.google.com/g/tesseract-ocr/c/ZM1eKp-sPCU), [extend.ai](https://www.extend.ai/resources/pytesseract-guide-ocr-limits-alternatives). TrOCR riconosce righe di testo, non struttura LaTeX.

**Locale su 16GB:** modelli OCR specializzati open (GLM-OCR 0.9B: 94.62 su OmniDocBench; PaddleOCR-VL 0.9B: 94.50) battono i frontier LLM su documenti e girano su hardware modesto, ma il benchmark è su documenti per lo più stampati — [ofox.ai/blog/best-ai-model-for-ocr-2026](https://ofox.ai/blog/best-ai-model-for-ocr-2026/). Su Mac, MLX > GGUF per VLM; segnalazioni utenti di OCR manoscritto scadente con Qwen-VL quantizzato 8-bit — [huggingface.co/mlx-community/Qwen2.5-VL-32B-Instruct-8bit/discussions/1](https://huggingface.co/mlx-community/Qwen2.5-VL-32B-Instruct-8bit/discussions/1), [insiderllm.com](https://insiderllm.com/guides/vision-models-locally/).

**Kimi k2.6:** multimodale ma "Multimodal & Grounded" è la sua categoria più debole nei ranking; nessun benchmark trovato su manoscritto — [llm-stats.com/models/kimi-k2.6](https://llm-stats.com/models/kimi-k2.6).

## Opzioni e verdetto

| Opzione | Costo 500 pag | Verdetto |
|---|---|---|
| **Gemini 3 Flash API** (per-pagina + contesto rolling) | **~$2–5** | **ADOPT** — miglior rapporto accuratezza/costo su matematica, ottimo su corsivo e italiano; può anche *descrivere* i grafici qualitativi (cosa che nessun OCR fa) |
| GPT-5-mini / Mistral OCR 3 batch | ~$1–2 | TRIAL — economici; Mistral leggermente peggio su manoscritto (~2.1% CER), GPT-5-mini ottimo backup |
| Gemini Pro / GPT-5 / Claude solo su pagine difficili | ~$0.01–0.11/pag | TRIAL — escalation selettiva per le ~10–20% di pagine peggiori |
| PaddleOCR-VL / GLM-OCR / Qwen3-VL 8B locale (MLX/LM Studio) | $0 | TRIAL — fattibile su M4 16GB, privacy totale; ma qualità non verificata su formule manoscritte frettolose, e quantizzazione degrada il manoscritto |
| Mathpix | ~$2.50 + $19.99 setup | IGNORE — costo simile ai LLM ma errori semantici documentati e setup fee |
| SimpleTex | gratis (50 riconoscimenti/giorno, per formula singola) | IGNORE per batch — quota inadatta a 500 pagine intere |
| Tesseract, TrOCR | $0 | IGNORE — strutturalmente inadatti a formule manoscritte |
| Kimi k2.6 vision | — | IGNORE — nessuna evidenza di vantaggio su questo task |

**Pipeline consigliata:** foto/scansioni a buona risoluzione → script Python che invia 1 pagina per chiamata a Gemini Flash con prompt fisso (corso, notazione tipica di Teoria dei Segnali: sinc, rect, δ, convoluzione, trasformate) + le ultime 1–2 pagine già trascritte come contesto testuale → output Markdown+LaTeX → per i grafici, chiedere descrizione strutturata (assi, forma, punti notevoli) invece di trascrizione. Validazione: compilare il LaTeX e rileggere a campione le pagine peggiori. Il Mac Mini serve solo da orchestratore: nessun vincolo di RAM.

## Incertezze dichiarate

- **Nessun benchmark pubblico combina esattamente i tre fattori del tuo caso** (manoscritto + formule LaTeX + italiano): i CER su IAM sono testo inglese senza formule; il benchmark Mathpix-vs-Gemini è su stampa matematica; MathReal è stampa fotografata. I numeri vanno letti come indicativi, non predittivi della tua grafia.
- I CER di CodeSOTA mescolano paper accademici e benchmark dei vendor — non una valutazione indipendente uniforme.
- Le performance di GLM-OCR/PaddleOCR-VL **su manoscritto frettoloso** non sono verificate (OmniDocBench è prevalentemente documenti stampati).
- Rischio strutturale dei LLM, documentato: saltano righe, "correggono" parole illeggibili inventando contenuto plausibile, gestiscono male note a margine — su appunti di matematica un'allucinazione è peggio di un buco. Mitigazione: temperatura bassa, istruire "scrivi [illeggibile] se incerto", revisione a campione.
- Prezzi API volatili nel 2026; la stima $2–5 per Gemini Flash deriva da un singolo benchmark indipendente (~$0.0044/pagina) e dipende dalla risoluzione delle immagini e dalla lunghezza dell'output.

Sources:
- [Math OCR Benchmark: Why Gemini Flash Beats Mathpix — Igor Rivin](https://igorrivin.github.io/blog/ocr-benchmark/)
- [Best Handwriting OCR 2026 — CodeSOTA](https://www.codesota.com/ocr/best-for-handwriting)
- [Multi-Page Handwritten Document Transcription with MLLMs (arXiv 2502.20295)](https://arxiv.org/html/2502.20295v1)
- [MathReal benchmark (arXiv 2508.06009)](https://arxiv.org/pdf/2508.06009)
- [EDU-CIRCUIT-HW: MLLMs on University STEM Handwritten Solutions (arXiv)](https://arxiv.org/html/2602.00095v2)
- [Mathpix Convert API Pricing](https://mathpix.com/pricing/api)
- [Mistral Pricing](https://mistral.ai/pricing/)
- [Best LLM for OCR 2026 — ofox.ai](https://ofox.ai/blog/best-ai-model-for-ocr-2026/)
- [Best Vision Models You Can Run Locally — InsiderLLM](https://insiderllm.com/guides/vision-models-locally/)
- [Qwen2.5-VL 8-bit handwriting issues — HuggingFace](https://huggingface.co/mlx-community/Qwen2.5-VL-32B-Instruct-8bit/discussions/1)
- [Tesseract math recognition thread](https://groups.google.com/g/tesseract-ocr/c/ZM1eKp-sPCU)
- [PyTesseract limits — Extend](https://www.extend.ai/resources/pytesseract-guide-ocr-limits-alternatives)
- [Can ChatGPT Do OCR? — handwritingocr.com](https://www.handwritingocr.com/blog/chatgpt-claude-and-ai-for-ocr)
- [Gemini 3 Solves Handwriting Recognition — Generative History](https://generativehistory.substack.com/p/gemini-3-solves-handwriting-recognition)
- [SimpleTex API docs](https://doc.simpletex.cn/en/api/)
- [Kimi K2.6 — llm-stats](https://llm-stats.com/models/kimi-k2.6)
- [Gemini API pricing — Google AI](https://ai.google.dev/gemini-api/docs/pricing)
