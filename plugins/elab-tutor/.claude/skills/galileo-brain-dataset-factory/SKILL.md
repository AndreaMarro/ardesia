---
name: galileo-brain-dataset-factory
description: |
  Genera dataset di training per il Galileo Brain (modello di routing AI per ELAB Tutor).
  Usa questa skill quando l'utente chiede di creare, rigenerare o espandere il dataset di training
  per il Galileo Brain, o quando menziona "dataset factory", "training data", "generare esempi",
  "espandere dataset", "più frasi", "più varianti". Anche se l'utente dice semplicemente
  "crea il dataset" o "genera più esempi" nel contesto del Galileo Brain, usa questa skill.
---

# Galileo Brain Dataset Factory

Genera dataset JSONL per il fine-tuning del Galileo Brain — il modello di routing che capisce
QUALUNQUE richiesta di uno studente o professore su ELAB Tutor e la trasforma in azioni concrete.

## Filosofia: ONNIPOTENZA

Il Brain deve capire:
- Bambini di 10 anni che scrivono male
- Professori inesperti che non sanno i termini tecnici
- Frasi lunghissime e confuse
- Italiano parlato, slang, abbreviazioni
- Errori di battitura
- Combinazioni assurde di richieste
- Richieste implicite ("non funziona" → diagnose)
- Richieste multi-step in una sola frase

## Come Usare

1. Esegui lo script di generazione:
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
python3 .claude/skills/galileo-brain-dataset-factory/scripts/generate_dataset.py \
  --output datasets/galileo-brain-v7.jsonl \
  --eval-output datasets/galileo-brain-v7-eval.jsonl \
  --variants 200 \
  --seed 42
```

2. Parametri:
   - `--variants N`: Numero di varianti linguistiche per ogni azione/scenario (default: 200)
   - `--seed N`: Seed random per riproducibilità
   - `--output`: Path file JSONL training
   - `--eval-output`: Path file JSONL eval
   - `--include-typos`: Aggiunge varianti con errori di battitura (default: on)
   - `--include-dialect`: Aggiunge varianti dialettali (default: on)
   - `--teacher-scenarios`: Moltiplica scenari professore inesperto (default: on)

3. Il dataset viene generato con queste stratificazioni:
   - **Strato 1 — Replay**: Esempi dal v5 per anti-catastrophic-forgetting
   - **Strato 2 — Direct Action**: 46 azioni × N varianti linguistiche
   - **Strato 3 — Circuit Building**: Combinazioni componenti × operazioni
   - **Strato 4 — Context-Aware**: Stessi messaggi, risposte diverse in base al contesto simulatore
   - **Strato 5 — Teacher/Prof**: Scenari specifici per professori inesperti
   - **Strato 6 — Adversarial**: Frasi ambigue, lunghe, confuse, dialettali
   - **Strato 7 — Multi-Action**: Richieste che contengono 2-5 azioni in una frase
   - **Strato 8 — Implicit Intent**: Richieste che non nominano l'azione ma la implicano

## Output Format

Ogni riga JSONL è un oggetto ChatML:
```json
{
  "messages": [
    {"role": "system", "content": "<system prompt del Brain>"},
    {"role": "user", "content": "[CONTESTO]\n...\n\n[MESSAGGIO]\n..."},
    {"role": "assistant", "content": "{\"intent\":\"...\",\"action\":\"...\",\"entities\":[...],\"actions\":[...],\"needs_llm\":true/false,\"response\":\"...\"}"}
  ]
}
```

## Dopo la Generazione

1. Verifica distribuzione: `python3 scripts/analyze_dataset.py datasets/galileo-brain-v7.jsonl`
2. Upload su Colab per training con Unsloth LoRA su Qwen3-4B
3. Training ~45-90 min su A100
4. Export GGUF q4_k_m per Ollama
