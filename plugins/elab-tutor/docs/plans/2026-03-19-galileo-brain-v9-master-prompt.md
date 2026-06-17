# Galileo Brain v9 — Master Prompt per Dataset Definitivo

**Data**: 19/03/2026
**Autore**: Andrea Marro + Claude
**Scopo**: Prompt auto-contenuto per generare, allenare e deployare il Galileo Brain v9

---

## ISTRUZIONI PER CLAUDE

> Questo documento è un prompt ottimizzato per essere dato a una nuova sessione Claude Code.
> Contiene TUTTO il necessario per ricreare il dataset v9, allenare il modello, e deployarlo.
> Usa **superpowers:brainstorming** per eventuali decisioni architetturali.
> Usa **skill-creator** se devi creare skill di validazione del dataset.
> Non improvvisare — segui questo documento alla lettera.

---

## 1. CONTESTO DEL PROGETTO

### Cos'è ELAB Tutor
Simulatore di circuiti con tutor AI ("Galileo") per bambini 8-14 anni. 69 esperimenti,
22 componenti, emulatore Arduino, editor Scratch/Blockly. Deploy su LIM per insegnanti inesperti.

### Cos'è il Galileo Brain
Un modello Qwen3.5-2B fine-tunato che fa routing: riceve il messaggio dell'utente + contesto
del simulatore, e ritorna un JSON con intent, entities, actions, needs_llm, response, llm_hint.
NON genera spiegazioni — decide solo COSA fare e chi deve rispondere.

### Percorsi file chiave
```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/
├── datasets/
│   ├── generate.py                          # CLI entry point
│   ├── inject_context_v8.py                 # Context injection (v8)
│   ├── galileo-brain-v7.jsonl               # Dataset v7 (86K, 133MB) — BASELINE
│   ├── galileo-brain-v8.jsonl               # Dataset v8 (85K) — MIGLIORATO
│   ├── galileo-brain-v8-eval.jsonl          # Eval set v8 (200 esempi)
│   ├── brain_factory/
│   │   ├── engine.py                        # Orchestratore generazione
│   │   ├── corruption.py                    # 12 corruzioni (typo, voice, sms, emoji...)
│   │   ├── registry.py                      # Auto-discovery sezioni YAML
│   │   └── sections/
│   │       ├── template_section.py          # Generatore template (MODIFICATO in v8)
│   │       └── combo_section.py             # Generatore combo componenti
│   ├── configs/
│   │   ├── system_prompt.txt                # System prompt per il Brain
│   │   ├── responses.yml                    # Pool risposte v7 (4-7 varianti)
│   │   ├── responses_v8.yml                 # Pool risposte v8 (20-40 varianti)
│   │   ├── components.yml                   # Componenti e slang
│   │   └── sections/                        # 21+ sezioni YAML
│   │       ├── 01_actions.yml ... 21_lcd_scratch.yml  # Originali v5
│   │       ├── 03_code_v8.yml               # Code espanso (v8)
│   │       ├── 04_tutor_v8.yml              # Tutor con hint vari (v8)
│   │       └── 06_vision_v8.yml             # Vision espanso (v8)
│   └── profiles/
│       ├── v5-extreme-25k.yml               # Profilo v5/v7
│       └── v8-extreme-variety.yml           # Profilo v8
├── notebooks/
│   └── galileo-brain-finetune-v7.ipynb      # Notebook Colab (11 celle)
├── docs/plans/
│   ├── 2026-03-18-galileo-local-stack-architecture.md
│   ├── 2026-03-18-galileo-local-stack-plan.md
│   └── 2026-03-19-galileo-brain-v9-master-prompt.md  # QUESTO FILE
└── .claude/prompts/
    └── session-galileo-local-stack.md       # Prompt sessione
```

---

## 2. PROBLEMI INCONTRATI E SOLUZIONI

### Problema 1: Risposte morte ("Fatto tutto!" x7500)
**Causa**: `template_section.py` riga 155 copiava `ex["messages"][2]` identica per ogni
variant corrupted. responses.yml aveva solo 4-7 varianti per categoria.
**Soluzione v8**:
- `_re_pick_response()` aggiunto a template_section.py — ri-sceglie dalla pool per ogni variant
- `responses_v8.yml` con 20-40 varianti per ogni categoria
- **Risultato**: max ripetizione da 7500 a 936

### Problema 2: LLM hints generici (4 stringhe x21000 volte)
**Causa**: ogni template aveva UN solo llm_hint fisso.
**Soluzione v8**: variabile `{hint}` nei template con lista di 5-7 hint diversi.
- **Risultato**: da 4 hint unici a 86 hint unici

### Problema 3: Vision sottorappresentato (2.9% → 1.8%)
**Causa**: poche frasi base nel template vision, dedup aggressivo.
**Soluzione v9 proposta**:
- Mergiare i 2459 esempi vision dal v7
- Aggiungere template vision specifici per ogni componente (13 comp × 8 frasi = 104 combinazioni)
- Aggiungere template vision per foto circuito fisico reale
- Target: 5-8% del dataset

### Problema 4: Funzionalità simulatore non coperte
**Cause**: il dataset copre solo ~10 dei 16 action tags.
**Azioni mancanti scoperte**:
- `[AZIONE:measure]` — misurare tensione/corrente (multimetro)
- `[AZIONE:setvalue]` — impostare valore componente (resistenza, frequenza buzzer)
- `[AZIONE:switcheditor]` — cambiare tra Arduino e Scratch
- `[AZIONE:youtube]` — cercare video educativi
- `[AZIONE:interact]` — premere pulsante, ruotare potenziometro (solo 602 esempi)
**Soluzione v9**: nuove sezioni YAML per ogni azione mancante

### Problema 5: Giochi quasi assenti
**Causa**: Detective, POE, Reverse, Review non hanno sezioni dedicate.
**Soluzione v9**: nuove sezioni per i 4 giochi del tutor

### Problema 6: Scratch/Blockly quasi assente
**Causa**: solo sezione `21_lcd_scratch.yml` generica.
**Soluzione v9**: sezione dedicata con i 38 tipi di blocco

### Problema 7: Training lentissimo (22h stimati)
**Causa**: `packing=False` con pre-tokenizzazione — 70%+ token sono padding.
**Soluzione v9**: packing manuale nel notebook (vedi sezione Training)

### Problema 8: Tokenizer VL confonde SFTTrainer
**Causa**: Qwen3.5-2B carica come modello VL, il tokenizer è un processore multimodale.
**Soluzione**: `text_tok = tokenizer.tokenizer` estrae il tokenizer testuale puro.

### Problema 9: Incompatibilità transformers/trl
**Causa**: Unsloth 2026.3.7 installa transformers 5.3.0, ma trl 0.22.2 non è compatibile.
**Soluzione**: Pin esplicito `transformers>=5.2.0,<=5.3.0` + `trl==0.22.2`

### Problema 10: YAML quoting
**Causa**: frasi con `{var}` + `?` o `'` rompono il parser YAML.
**Soluzione**: generare i YAML con `yaml.dump()` da Python, non a mano.

---

## 3. DESIGN DATASET v9

### 3.1 Intent (7 categorie)
| Intent | Descrizione | Target % | needs_llm |
|--------|-------------|----------|-----------|
| action | Play/pause/reset/compile/undo/redo/quiz | 20% | false |
| circuit | Aggiungere/rimuovere componenti e fili | 25% | false |
| code | Domande codice, generazione, debug, Scratch | 15% | true/false |
| tutor | Teoria, spiegazioni, curiosità | 18% | true |
| vision | Analisi visiva circuito, foto reale | 7% | true |
| navigation | Caricare esperimenti, cambiare tab/volume | 5% | false |
| teacher | Domande docente (preparare lezione, suggerimenti) | 10% | true |

### 3.2 Copertura azioni (TUTTE le 16 azioni)
```
[AZIONE:play]          [AZIONE:pause]         [AZIONE:reset]
[AZIONE:clearall]      [AZIONE:compile]       [AZIONE:undo]
[AZIONE:redo]          [AZIONE:diagnose]      [AZIONE:quiz]
[AZIONE:addcomponent]  [AZIONE:addwire]       [AZIONE:removewire]
[AZIONE:highlight]     [AZIONE:openeditor]    [AZIONE:nextstep]
[AZIONE:prevstep]      [AZIONE:closeeditor]   [AZIONE:switcheditor]
[AZIONE:interact]      [AZIONE:measure]       [AZIONE:setvalue]
[AZIONE:screenshot]    [AZIONE:youtube]       [AZIONE:getcode]
```

### 3.3 Copertura componenti (TUTTI i 22)
```
led, resistor, capacitor, push-button, buzzer-piezo, potentiometer,
photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo,
reed-switch, phototransistor, battery9v, multimeter, lcd16x2,
nano-r4-board, breadboard-half, breadboard-full, wire, annotation
```

### 3.4 Copertura esperimenti (TUTTI i 70)
Tutti gli esperimenti nei 3 volumi devono apparire nel contesto almeno 100 volte ciascuno.

### 3.5 Copertura giochi (4 giochi)
- Detective (trova guasto): "trova l'errore", "cos'e' rotto?", "cerca il guasto"
- POE (predici-osserva-spiega): "cosa pensi che succeda?", "perche' e' successo questo?"
- Reverse Engineering: "che circuito e'?", "indovina il componente nascosto"
- Review: "il circuito e' corretto?", "valuta il mio lavoro"

### 3.6 Copertura Scratch/Blockly
Template per i 38 tipi di blocco: I/O, logica, loop, variabili, servo, LCD, serial, math.

### 3.7 Stili di input (varietà estrema)
- Bambino 8 anni: "ke fa sto coso?? 😭", "nn capisco", "boh"
- Bambino 14 anni: "come funziona il PWM?", "posso usare un for loop?"
- Insegnante inesperto: "come preparo la lezione sui LED?", "quale volume per la terza media?"
- Insegnante esperto: "il modello MNA converge?", "qual è la resistenza equivalente?"
- Dialetto: "uè Galileo, fammelo vede sto circuito" (napoletano), "dai metti su" (milanese)
- Voice-to-text: "a Gendy il LED" (accendi il LED), "avia la simolazione" (avvia)
- SMS: "nn funz nnt", "cm si fa?", "x favore"
- Emoji heavy: "🔴 metti il led rosso 💡", "aiuto 😭😭😭"
- Inglese misto: "come faccio il blink?", "make it work please"
- Troncato: "metti il le-", "avvia la simu"
- Parolacce: "cazzo non funziona", "ma che ***** di circuito"
- Autocorrect: "la distanza" (la resistenza), "il buzer" (il buzzer)

### 3.8 Formato output JSON
```json
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["led", "resistor"],
  "actions": ["[AZIONE:addcomponent:led]", "[AZIONE:addcomponent:resistor]"],
  "needs_llm": false,
  "response": "LED e resistenza in posizione!",
  "llm_hint": null
}
```

### 3.9 Risposte (varietà)
- Ogni categoria di risposta ha 15-40 varianti in `responses_v8.yml`
- Il generatore ri-sceglie la risposta per ogni variant (no ripetizioni)
- Target: nessuna risposta ripetuta più di 200 volte su 100K esempi

### 3.10 LLM Hints (varietà)
- Ogni template con needs_llm=true usa `{hint}` con lista di 5-7 hint
- Hint specifici per sotto-categoria (non generici come "spiega con pazienza")
- Target: almeno 100 hint unici

---

## 4. SEZIONI YAML DA CREARE/ESPANDERE

### Nuove sezioni necessarie per v9:
1. `22_games_detective.yml` — Intent: tutor, azioni: diagnose, hint per troubleshooting
2. `23_games_poe.yml` — Intent: tutor, predici-osserva-spiega
3. `24_games_reverse.yml` — Intent: tutor, reverse engineering
4. `25_measure.yml` — Intent: action, azione: measure con multimetro
5. `26_setvalue.yml` — Intent: action, azione: setvalue (resistenza, freq buzzer)
6. `27_interact.yml` — Intent: action, azione: interact (pulsante, pot, slider)
7. `28_scratch_blocks.yml` — Intent: code, tutti i 38 blocchi Scratch
8. `29_teacher_lim.yml` — Intent: teacher, domande uso LIM/lezione
9. `30_switcheditor.yml` — Intent: action, azione: switcheditor
10. `31_youtube.yml` — Intent: navigation, azione: youtube

### Sezioni da espandere:
- `06_vision_v8.yml` — Aggiungere 50+ frasi per foto circuito fisico
- `03_code_v8.yml` — Aggiungere errori compilazione specifici
- `04_tutor_v8.yml` — Aggiungere domande "vita reale" e meta-apprendimento

---

## 5. PIPELINE DI GENERAZIONE

### Step 1: Genera sezioni YAML (IMPORTANTE: usa yaml.dump!)
```python
# SEMPRE generare YAML con yaml.dump per evitare problemi di quoting
import yaml
section = {
    "id": "my_section",
    "name": "...",
    "intent": "...",
    "templates": [...]
}
with open("configs/sections/XX_my_section.yml", "w") as f:
    yaml.dump(section, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
```

### Step 2: Crea profilo v9
```
python3 generate.py --profile v9-definitive --dry-run  # Verifica distribuzione
python3 generate.py --profile v9-definitive             # Genera 35-40K base
```

### Step 3: Context injection
```
python3 inject_context_v9.py  # Espande a 100-120K con contesti
```

### Step 4: Merge vision v7
```python
# Prendi i 2459 esempi vision dal v7 e aggiungili al v9
```

### Step 5: Validazione
```python
# Verifica:
# - Tutti i 16 action tags presenti
# - Tutti i 22 componenti presenti
# - Tutti i 70 esperimenti nel contesto
# - Nessuna risposta ripetuta > 200 volte
# - Vision >= 7% del dataset
# - Code >= 15% del dataset
# - Nessun campo JSON mancante
# - Nessun intent "teacher" rimasto (se non voluto)
```

---

## 6. TRAINING SU COLAB

### Notebook aggiornato — CELLA UNICA
```python
# ═══ GALILEO BRAIN v9 — TRAINING CON PACKING MANUALE ═══
# Prerequisiti: A100 40GB, transformers>=5.2.0, trl==0.22.2

# 1. Installa
!pip install --no-deps trl peft accelerate bitsandbytes
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps xformers triton
!pip install "transformers>=5.2.0,<=5.3.0" "trl==0.22.2" datasets
# → RIAVVIA RUNTIME

# 2. Carica modello
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen3.5-2B",
    max_seq_length=2048, dtype=None, load_in_4bit=False)

# 3. LoRA (r=16 per routing, SOTA raccomanda alpha=2*r)
model = FastLanguageModel.get_peft_model(model, r=16,
    target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
    lora_alpha=32, lora_dropout=0, bias="none",
    use_gradient_checkpointing="unsloth", random_state=3407)

# 4. TOKENIZER FIX — estrai testuale dal VL processor
text_tok = tokenizer.tokenizer if hasattr(tokenizer, 'tokenizer') else tokenizer
if text_tok.pad_token is None:
    text_tok.pad_token = text_tok.eos_token

# 5. Pre-tokenizza
tok_train = dataset.map(lambda ex: {
    **text_tok(ex["text"], truncation=True, max_length=2048),
    "labels": text_tok(ex["text"], truncation=True, max_length=2048)["input_ids"]
}, remove_columns=["text"])

# 6. PACKING MANUALE (critico per velocità!)
def pack_sequences(dataset, max_len=2048):
    eos = text_tok.eos_token_id
    all_ids, all_labels = [], []
    buf_ids, buf_labels = [], []
    for ex in dataset:
        buf_ids.extend(ex["input_ids"] + [eos])
        buf_labels.extend(ex["labels"] + [eos])
        while len(buf_ids) >= max_len:
            all_ids.append(buf_ids[:max_len])
            all_labels.append(buf_labels[:max_len])
            buf_ids, buf_labels = buf_ids[max_len:], buf_labels[max_len:]
    return Dataset.from_dict({
        "input_ids": all_ids,
        "attention_mask": [[1]*max_len]*len(all_ids),
        "labels": all_labels})

# 7. Training — 1-2h su A100 (vs 22h senza packing!)
trainer = SFTTrainer(
    model=model, tokenizer=text_tok,
    train_dataset=packed_train, eval_dataset=packed_eval,
    packing=False,  # già fatto manualmente
    data_collator=DataCollatorForSeq2Seq(tokenizer=text_tok, padding=False),
    args=TrainingArguments(
        per_device_train_batch_size=8, gradient_accumulation_steps=2,
        num_train_epochs=3, learning_rate=2e-4,
        lr_scheduler_type="cosine", warmup_steps=50,
        bf16=True, eval_steps=200, save_steps=200,
        output_dir="/content/galileo-brain-v9",
        remove_unused_columns=False))

# 8. Salva su Drive + Export GGUF
FastLanguageModel.for_inference(model)
model.save_pretrained_gguf("drive_path/gguf", tokenizer, quantization_method="q5_k_m")
```

### Parametri ottimali (aggiornati con ricerca SOTA 03/2026)
| Parametro | Valore | Motivazione |
|-----------|--------|-------------|
| Modello | Qwen3.5-2B | 1.5GB GGUF Q5, perfetto M1 8GB |
| LoRA r | 16 | SOTA: per routing/classificazione r=16 basta (r=64 overkill) |
| LoRA alpha | 32 | Ratio alpha/r = 2 (raccomandato SOTA) |
| Batch | 8×2=16 | Bilanciato per intent rari |
| Epochs | 2-3 | Con load_best_model protegge da overfitting |
| LR | 2e-4 | Aggressivo ma safe con cosine decay |
| Packing | Manuale | Riduce steps 10x, da 22h a 2h |
| GGUF | **q5_k_m** | 1.5GB, qualità superiore a q4, M1 8GB ha 5GB headroom |
| Train on | **Completions only** | CRITICO: il modello impara a generare JSON, non a ripetere il prompt |

### Nota SOTA: Train on completions only
Il v7/v8 trainava sull'intero messaggio (system + user + assistant). Questo spreca
capacità del modello per memorizzare il system prompt (che è identico in ogni esempio).
Con `DataCollatorForCompletionOnly` di TRL, il modello impara SOLO a generare il JSON
di risposta. Questo migliora la qualità del routing e riduce il training time.

```python
from trl import DataCollatorForCompletionOnlyLM
response_template = "<|im_start|>assistant"
collator = DataCollatorForCompletionOnlyLM(response_template, tokenizer=text_tok)
```

### Nota SOTA: Chat template matching
Il #1 causa di degradazione quando si passa da training a Ollama è un mismatch
nel chat template. Il Modelfile DEVE usare lo STESSO template ChatML di Qwen3.5:
```
<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n
```

---

## 7. DEPLOY SU MAC

```bash
# 1. Scarica GGUF da Google Drive
mkdir -p ~/models/galileo-brain-v9
cp ~/Downloads/galileo-brain-v9-Q4_K_M.gguf ~/models/galileo-brain-v9/

# 2. Crea Modelfile
cat > ~/models/galileo-brain-v9/Modelfile << 'EOF'
FROM ./galileo-brain-v9-Q4_K_M.gguf
PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER num_ctx 2048
PARAMETER stop <|im_end|>
TEMPLATE """<|im_start|>system
{{ .System }}<|im_end|>
<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
"""
EOF

# 3. Crea modello Ollama
cd ~/models/galileo-brain-v9
ollama create galileo-brain -f Modelfile

# 4. Test
ollama run galileo-brain "avvia la simulazione"
```

---

## 8. DATASET ESTERNI UTILI (HuggingFace)

### Direttamente utili:
- **STEM-AI-mtl/Electrical-engineering** — Q&A elettronica in inglese, traducibile
- **DeepMount00/italian_conversations** — Conversazioni italiane strutturate
- **stemdataset/STEM** — 1M+ domande STEM K-12 (inglese)

### Per augmentation:
- **gsarti Italian NLP Resources** — Collezione risorse NLP italiano
- **adrianoamalfi Italian datasets** — Collezione dataset italiani

### Strategia: NON usare dataset esterni direttamente
Il Brain è un router JSON, non un generatore di testo. I dataset esterni servono solo per:
1. Ispirare NUOVE frasi utente da aggiungere ai template
2. Verificare copertura concetti elettronici
3. Augmentation tramite back-translation (IT→EN→IT) per varietà linguistica

---

## 9. METRICHE DI QUALITÀ TARGET

| Metrica | Target | v7 attuale | v8 attuale |
|---------|--------|------------|------------|
| Totale esempi | 100-120K | 86K | 85K |
| Messaggi unici | >25K | 78K* | 19K |
| Risposte uniche | >300 | 10K | 196 |
| Max ripetizione risposta | <200 | 7500 | 936 |
| Intent vision % | ≥7% | 2.9% | 1.8% |
| Intent code % | ≥15% | 4.1% | 16.5% |
| LLM hints unici | >150 | 85 | 86 |
| Action tags coperti | 16/16 | ~10/16 | ~10/16 |
| Componenti coperti | 22/22 | 15/22 | 15/22 |
| Esperimenti coperti | 70/70 | 62/70 | 62/70 |
| Train loss target | <0.08 | 0.102 | TBD |
| Eval accuracy target | ≥97% | ~95% | TBD |

*v7 ha tanti messaggi unici ma con contesto diverso, non frasi diverse

---

## 10. CHECKLIST PRIMA DEL TRAINING

- [ ] Tutti i 16 action tags hanno almeno 500 esempi
- [ ] Tutti i 22 componenti appaiono in entities almeno 1000 volte
- [ ] Tutti i 70 esperimenti appaiono nel contesto almeno 100 volte
- [ ] Vision ≥ 7% del dataset
- [ ] Code ≥ 15% del dataset
- [ ] Teacher ≥ 8% del dataset
- [ ] Nessuna risposta ripetuta > 200 volte
- [ ] Almeno 150 llm_hint unici
- [ ] Formato JSON valido per OGNI esempio
- [ ] Nessun campo mancante (intent, entities, actions, needs_llm, response, llm_hint)
- [ ] System prompt coerente in tutti gli esempi
- [ ] Eval set bilanciato (≥30 per intent)
- [ ] YAML generati con yaml.dump (no editing manuale)
- [ ] Test dry-run del profilo prima della generazione completa
