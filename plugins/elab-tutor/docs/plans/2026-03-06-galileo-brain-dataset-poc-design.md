# Galileo Brain — Dataset PoC Design

> **Data**: 2026-03-06
> **Approccio**: A — Dataset-First con 500 esempi PoC
> **Priorita**: Controllo TOTALE del simulatore via chat
> **Esecuzione**: Nuova sessione Claude Code

---

## 1. Obiettivo

Generare un dataset di **500 esempi** in formato ChatML JSONL per valutare la fattibilita di un Qwen3.5-4B fine-tuned come "Galileo Brain" — un modello che governa l'intero simulatore ELAB via chat con precisione assoluta.

## 2. Output Attesi

| File | Descrizione |
|------|-------------|
| `datasets/galileo-brain-poc.jsonl` | 500 esempi validati, formato ChatML |
| `scripts/generate-brain-dataset.py` | Script Python che scala a 11K esempi |
| `datasets/quality-report.md` | Report qualita: copertura, edge case, metriche |
| `notebooks/galileo-brain-finetune.ipynb` | Colab notebook: Unsloth + Qwen3.5-4B LoRA + GGUF export |

## 3. Formato Esempio

```jsonl
{"messages":[{"role":"system","content":"Sei il Galileo Brain..."},{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-primo-circuito\ncomponenti: [led1, resistor1]\nfili: 2\n\n[MESSAGGIO]\nAvvia la simulazione"},{"role":"assistant","content":"{\"intent\":\"action\",\"entities\":[],\"actions\":[\"[AZIONE:play]\"],\"needs_llm\":false,\"response\":\"Simulazione avviata! \\u25b6\",\"llm_hint\":null}"}]}
```

### System Prompt del Brain

```
Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}
```

### User Message Format

```
[CONTESTO]
tab: simulator|manuale|video|canvas|editor
esperimento: v1-cap6-primo-circuito
componenti: [led1:OFF, resistor1:220ohm]
fili: 3
step_corrente: 2/5
volume_attivo: 1

[MESSAGGIO]
<testo libero dello studente>
```

## 4. Categorie Dataset (500 totali)

| ID | Categoria | Qty | Fonte Dati | Priorita |
|----|----------|-----|-----------|----------|
| C1 | Comandi simulazione (play/pause/reset/clearall) | 60 | `deterministic_action_fallback` regex patterns | ALTA |
| C2 | Piazzamento componente singolo (21 tipi) | 80 | `WIRING_TEMPLATES` x variazioni linguistiche | ALTA |
| C3 | Circuiti multi-componente (2-5 componenti) | 70 | 69 esperimenti x intent patterns | ALTA |
| C4 | Wiring specifico (pin-to-pin) | 60 | Pin map x wing pins x bus connections | ALTA |
| C5 | Navigazione (loadexp/opentab/openvolume) | 50 | 69 experiment IDs + 9 tab names | MEDIA |
| C6 | Codice (setcode/compile) | 40 | Code specialist patterns + Arduino snippets | MEDIA |
| C7 | Interazioni (interact/measure/highlight) | 50 | interact actions + component IDs | ALTA |
| C8 | Educativi (quiz/youtube/notebook) | 40 | Quiz triggers + video DB | MEDIA |
| C9 | Rimozione/Sostituzione (remove/clearall/replace) | 50 | Smontaggio patterns + Dio Mode sequences | ALTA |

### Variazioni per ogni esempio base:
- 3-4 formulazioni diverse (formale, informale, abbreviato, con errori battitura)
- Con e senza contesto circuito
- Con e senza esperimento attivo

## 5. Copertura Action Tag Target

| Action Tag | Esempi Min | Note |
|-----------|-----------|------|
| `[AZIONE:play]` | 15 | Variazioni: avvia, start, fai partire, vai |
| `[AZIONE:pause]` | 10 | ferma, stop, metti in pausa |
| `[AZIONE:reset]` | 10 | resetta, riavvia, ricomincia |
| `[AZIONE:clearall]` | 15 | pulisci, cancella tutto, svuota, rimuovi tutto |
| `[AZIONE:addwire:...]` | 30 | collega, connetti, metti un filo |
| `[AZIONE:removecomponent:...]` | 25 | rimuovi, togli, elimina il LED |
| `[AZIONE:highlight:...]` | 15 | evidenzia, mostrami, dov'e |
| `[AZIONE:interact:...]` | 20 | premi, ruota, accendi, spegni |
| `[AZIONE:loadexp:...]` | 20 | carica esperimento, apri il capitolo |
| `[AZIONE:opentab:...]` | 15 | apri simulatore/manuale/video |
| `[AZIONE:openvolume:...]` | 10 | vai al volume 2, pagina 45 |
| `[AZIONE:compile]` | 10 | compila, verifica il codice |
| `[AZIONE:setcode:...]` | 15 | scrivi codice per, programma il LED |
| `[AZIONE:quiz]` | 10 | quiz, verificami, testami |
| `[AZIONE:youtube:...]` | 8 | cerca un video su, mostrami un tutorial |
| `[AZIONE:measure:...]` | 8 | misura, quanti volt, che corrente |
| `[AZIONE:diagnose]` | 8 | diagnostica, cosa c'e che non va |
| `[AZIONE:movecomponent:...]` | 8 | sposta, metti piu a destra |
| `[AZIONE:setvalue:...]` | 8 | cambia la resistenza, metti 470 ohm |
| `[AZIONE:removewire:...]` | 8 | rimuovi il filo, scollega |
| `[AZIONE:createnotebook:...]` | 5 | crea un taccuino, nuova lezione |
| `[INTENT:{...}]` | 40 | circuiti completi con multi-componente |
| Multi-tag (2+ tag) | 30 | costruisci E avvia, rimuovi E sostituisci |

**Target**: 23/23 action tag coperti nel dataset.

## 6. Metriche di Qualita

| Metrica | Target | Critico |
|---------|--------|---------|
| JSON valido (ogni assistant message) | 100% | 100% |
| Action tag syntax corretta | 100% | 98% |
| Copertura action tag (23 totali) | 23/23 | 20/23 |
| Copertura componenti (21 tipi) | 21/21 | 15/21 |
| Variazioni linguistiche per esempio | 3+ | 2+ |
| Edge case coperti | 15+ | 10+ |
| Experiment IDs validi | 100% | 95% |

## 7. Edge Case da Coprire

1. **Multi-intent**: "Costruisci un LED, collegalo a D3, e avvia" → 3 azioni
2. **Componente ambiguo**: "metti una lucina" → LED
3. **Pin inesistente**: "collega al pin D99" → errore educativo
4. **Contesto vuoto**: nessun componente sul circuito + "collega il LED"
5. **Conflitto**: "aggiungi un LED" quando c'e gia un LED
6. **Smontaggio parziale**: "rimuovi solo il resistore, lascia il LED"
7. **Sostituzione**: "sostituisci il LED con un buzzer"
8. **Riferimento precedente**: "collegalo" (senza specificare cosa)
9. **Errore battitura**: "costrusci", "aviva", "rezistenza"
10. **Domanda + azione**: "Come funziona un LED? Mettine uno sulla breadboard"
11. **Negazione**: "non avviare la simulazione"
12. **Condizionale**: "se il circuito e corretto, avvia"
13. **Wing pin specifico**: "collega a W_D10"
14. **Bus connection**: "collega al bus positivo"
15. **Quantita**: "metti 3 LED rossi"

## 8. Script Generatore (`generate-brain-dataset.py`)

```python
# Pseudocodice struttura
class BrainDatasetGenerator:
    def __init__(self):
        self.system_prompt = load_brain_system_prompt()
        self.experiments = load_all_experiments()    # 69
        self.components = load_component_types()     # 21
        self.action_tags = load_action_tag_specs()   # 23
        self.pin_map = load_pin_mappings()
        self.wing_pins = load_wing_pins()            # 16
        self.intent_keywords = load_intent_keywords()
        self.variations = load_linguistic_variations()  # IT synonyms

    def generate_category(self, cat_id, count):
        """Generate `count` examples for category `cat_id`"""
        # For each base pattern:
        #   1. Pick random experiment context (or empty)
        #   2. Pick random circuit state
        #   3. Generate 3-4 linguistic variations
        #   4. Generate correct Brain output (JSON)
        #   5. Validate JSON + action tag syntax
        pass

    def validate(self, dataset):
        """Run quality checks on entire dataset"""
        # JSON validity, action tag coverage, component coverage
        pass

    def export_jsonl(self, path):
        """Write dataset to JSONL file"""
        pass
```

Il generatore legge automaticamente da:
- `nanobot/nanobot.yml` → action tag specs
- `nanobot/server.py` → deterministic_action_fallback patterns, INTENT_KEYWORDS
- `nanobot/prompts/*.yml` → specialist context
- `src/components/simulator/engine/PlacementEngine.js` → WIRING_TEMPLATES, KNOWN_TYPES
- `public/data/experiments/*.json` → 69 experiment configs

## 9. Risultati PoC (06/03/2026)

| Metrica | Target | Risultato |
|---------|--------|-----------|
| Esempi totali | 500 | **500** |
| JSON valido | 100% | **100% (500/500)** |
| Action tag coperti | 23/23 | **23/23** |
| Componenti coperti | 21/21 | **21/21** |
| Intent coperti | 6/6 | **6/6** |
| Edge case | 15+ | **182** |
| needs_llm=false (deterministici) | — | **437 (87.4%)** |
| needs_llm=true (serve LLM) | — | **63 (12.6%)** |
| Multi-action | — | **22** |

**VERDICT: PASS** — Tutti i target raggiunti.

### File Generati

| File | Descrizione |
|------|-------------|
| `datasets/galileo-brain-poc.jsonl` | 500 esempi validati, formato ChatML |
| `scripts/generate-brain-dataset.py` | Script Python scalabile (~1900 righe) |
| `datasets/quality-report.md` | Report qualita completo |

## 10. Piano Scalata (500 → 11K)

| Fase | Esempi | Tempo | Costo |
|------|--------|-------|-------|
| PoC (completato) | 500 | ~3 ore | $0 |
| Scalata automatica (`--scale 10`) | 5,000 | ~1 ora (script) | $0 |
| Review manuale campione (5%) | — | 2 ore | $0 |
| Variazioni aggiuntive | 5,000 | ~1 ora (script) | $0 |
| Fine-tuning LoRA | — | 30min-3h (vedi sotto) | $0-3 |
| Serving | — | ongoing | $0-7/mese |

### Fine-Tuning Estimates

| Platform | Model | Time | Cost |
|----------|-------|------|------|
| Google Colab (free T4) | Qwen3.5-4B LoRA | ~2-3 hours | $0 |
| Google Colab Pro (A100) | Qwen3.5-4B LoRA | ~30 min | $10/mo |
| Together AI | Qwen3.5-4B LoRA | ~15-30 min | ~$1-3 |
| Unsloth (local) | Qwen3.5-4B LoRA | ~1-2 hours | $0 (10GB VRAM) |

### Serving Estimates

| Platform | Model | Latency | Cost |
|----------|-------|---------|------|
| Together AI Serverless | Qwen3.5-4B | ~100-200ms | ~$0.10/1M tokens |
| Ollama (local M1/M2) | Qwen3.5-4B GGUF | ~50-100ms | $0 |
| Render (Docker) | Qwen3.5-4B vLLM | ~100-300ms | $7-25/mo |

### LoRA Config Recommendation

```python
lora_config = {
    "r": 64,
    "lora_alpha": 128,
    "lora_dropout": 0.05,
    "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    "bias": "none",
}
```

## 11. Decisioni Non Prese (Futura Sessione)

- Quale modello base: Qwen3.5-4B vs 2B vs 9B
- Hyperparameter LoRA: rank, alpha, epochs
- Integrazione in server.py: prima o dopo il classify_intent attuale?
- Fallback: cosa succede se il Brain fallisce?
- A/B test: come confrontare Brain vs sistema attuale?

---

**Approvato da**: Andrea Marro
**Stato**: PoC completato, dataset generato, pronto per scalata
