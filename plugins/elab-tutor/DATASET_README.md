# ELAB Tutor Brain v3 - Training Dataset

## Overview

**galileo-brain-v3.jsonl** is a comprehensive ChatML JSONL dataset with **5,383 training examples** designed for fine-tuning **Qwen3-4B** as the intelligent brain of ELAB Tutor - an educational circuit simulator for children ages 8-14.

**File**: `galileo-brain-v3.jsonl`
**Format**: ChatML JSONL (one JSON object per line)
**Size**: ~11 MB
**Examples**: 5,383
**Generation Date**: 2026-03-13

---

## Dataset Structure

Each JSONL line contains a training example with this structure:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "[SYSTEM PROMPT - defines Qwen as BRAIN router]"
    },
    {
      "role": "user",
      "content": "[CONTEXT]\ntab: simulator|editor|manual|canvas\nesperimento: v1-cap6-esp1\ncomponenti: [led_rosso, resistor_220]\nfili: 3\nvolume_attivo: 1\n\n[CHILD'S MESSAGE]\nfai partire il circuito!"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"action\", \"entities\": [], \"actions\": [\"[AZIONE:play]\"], \"needs_llm\": false, \"response\": \"Perfetto! Avvio la simulazione... 🚀\"}"
    }
  ]
}
```

### Message Components

**System Prompt**: Defines Qwen's role as the BRAIN of ELAB Tutor - routing user intents to appropriate specialists (SimulatorController, CircuitBuilder, CodeEditor, TutorAI, VisionAnalyzer, NavigationManager)

**User Context**: Provides simulated session state:
- `tab`: Current UI view (simulator, editor, manual, canvas)
- `esperimento`: Current experiment ID (e.g., v1-cap6-esp1 through v3-extra-esp6 - all 69 experiments covered)
- `componenti`: List of components currently on the breadboard
- `fili`: Number of active wire connections
- `volume_attivo`: Which volume the student is on (1, 2, or 3)

**User Message**: Natural Italian text from children 8-14 years old, including:
- Typos and slang: "nn" (non), "xfavore" (per favore), "cmq" (comunque), "qlcosa" (qualcosa)
- Informal kid language: "fai partire", "prova!", "manda!", "via!"
- Varied grammar and spelling errors

**Assistant Response**: Structured JSON with:
- `intent`: Classification (action | circuit | code | tutor | vision | navigation)
- `entities`: Extracted components, pins, experiments, concepts
- `actions`: Concrete simulator actions using [AZIONE:type:params] format
- `needs_llm`: Boolean - whether specialist LLM is needed
- `response`: Direct response text (when needs_llm=false)
- `llm_hint`: Instruction for specialist (when needs_llm=true)

---

## Intent Distribution

| Intent | Count | % | Direct Response | Specialist Routing |
|--------|-------|---|-----------------|-------------------|
| circuit | 1,968 | 36.6% | 699 | 869 |
| tutor | 1,067 | 19.8% | 116 | 951 |
| action | 915 | 17.0% | 829 | 86 |
| code | 686 | 12.7% | 86 | 600 |
| vision | 400 | 7.4% | 0 | 400 |
| navigation | 347 | 6.4% | 347 | 0 |
| **TOTAL** | **5,383** | **100%** | **2,077** | **2,906** |

---

## Coverage by Category

### C1: Simulator Actions (~950 examples)
Commands to control the simulation environment:
- **Play/Start**: "avvia", "fai partire", "play!", "manda!", "prova il circuito"
- **Pause**: "ferma", "pausa", "stop!"
- **Reset**: "ricomincia", "reset", "azzera", "torna all'inizio"
- **Clear All**: "pulisci la breadboard", "svuota tutto"
- **Compile/Verify**: "compila il codice", "verifica", "upload"
- **Diagnose**: "controlla gli errori", "cosa non va?", "trova i problemi"
- **Quiz**: "testami", "fammi domande", "verificami"
- **YouTube Search**: "cerca video su LED", "mostrami un tutorial"
- **Tab Switching**: Open simulator, editor, manual, canvas views
- **Volume/Experiment Loading**: All 69 experiments
- **Component Highlighting**: Visual feedback for specific components

### C2: Component Placement (~700 examples)
Adding and configuring circuit components:
- **Single Components**: LED colors (rosso/verde/blu/giallo), resistors (220/1k/10k/4.7k), buttons, buzzers, capacitors, potentiometers, motors, servos, RGB LEDs, photoresistors, diodes, transistors (NPN/PNP), LCD, MOSFETs
- **With Position Hints**: "vicino al resistore", "sulla riga 5", "a destra del LED"
- **Multiple Components**: "aggiungi un LED e un resistore", "metti 3 LED"
- **Specific Values**: "resistore da 330 ohm", "condensatore da 100μF"

### C3: Complete Circuits (~550 examples)
High-level requests to build entire circuit assemblies:
- Simple LED circuits with resistors
- Multicolor traffic light (semaforo)
- Button-activated LED circuits
- Blinking patterns
- Buzzer circuits
- Servo motor control
- RGB LED effects
- Sensor circuits (photoresistor, temperature)
- Transistor switches
- Common educational projects from all 3 volumes

### C4: Wiring (~600 examples)
Connections between components:
- **Direct Pin Connections**: "collega LED al pin D3", "connetti resistore a LED"
- **Bus Connections**: "collega a massa", "collega al positivo", "GND", "VCC"
- **Remove Wires**: "togli il filo", "elimina questo collegamento"
- **Wing Pins**: Connections to W_A0-W_A5, W_D3-W_D13
- **Multiple Bus Nodes**: bus-bot-plus, bus-bot-minus, bus-top-plus, bus-top-minus

### C5: Navigation (~550 examples)
Moving between learning sections and interfaces:
- **Load Experiments**: All 69 v1, v2, v3, and extra experiments
- **Navigate Chapters**: By volume and chapter number
- **Back/Forward**: "torna indietro", "vai avanti", "prossima pagina"
- **Open Panels**: Serial monitor, code editor, Scratch, Blockly, BOM, manual
- **Switch Volumes**: Select learning volume (1, 2, or 3)

### C6: Code (~600 examples)
Arduino and block-based programming:
- **Write Code**: Blink, fade, button reads, serial prints
- **Fix Errors**: "il codice non funziona", "cosa è sbagliato?", "errore nel codice"
- **Explain Code**: "spiega questo codice", "come funziona?", "che significa digitalWrite?"
- **Language Switching**: Arduino text code ↔ Scratch ↔ Blockly

### C7: Component Interactions (~400 examples)
Simulated physical interactions with components:
- **Button Press**: "premi il pulsante", "attiva il button", "fai click"
- **Potentiometer**: Rotate to any value 0-1023
- **Light Sensor**: Set illumination level 0-1023
- **Multimeter**: Measure voltage, current, resistance
- **Value Feedback**: Numeric display of sensor readings

### C8: Theory/Tutor (~700 examples)
Educational questions and explanations:
- **Concepts**: "cos'è un LED?", "come funziona un resistore?", "spiega la legge di Ohm"
- **Physics**: Current, voltage, power, resistance, PWM, digital vs analog
- **Greetings**: "ciao!", "come stai?", "chi sei?"
- **Off-Topic**: Weather, jokes, favorites (gently redirects)
- **Help Requests**: "aiutami", "non capisco", "guidami"

### C9: Removal/Modification (~400 examples)
Deleting or changing circuit elements:
- **Remove Component**: "rimuovi il LED", "togli il resistore"
- **Remove All of Type**: "rimuovi tutti i LED", "elimina i resistori"
- **Replace Component**: "sostituisci il LED rosso con verde"
- **Move Component**: "sposta il LED a destra", "riposiziona"

### C10: Vision (~400 examples)
Image analysis and feedback:
- **Circuit Photo Analysis**: "guarda il mio circuito", "è corretto?", "cosa c'è che non va?"
- **Canvas Drawing**: Analyze user sketches and circuit diagrams
- **Error Detection**: Identify wiring mistakes, component misplacement

### C11: Memory/Context (~400 examples)
Session management and progress tracking:
- **Session Queries**: "cosa stavo facendo?", "dove eravamo?", "ricordami l'esperimento"
- **Progress Tracking**: "quanto ho fatto?", "sono bravo?", "quanti esperimenti ho completato?"
- **History Retrieval**: Restore previous circuit states

---

## Key Features

### Comprehensive Language Coverage
- **Italian Only**: All user messages in Italian (kids speak Italian!)
- **Authentic Kid Language**: Typos, slang, abbreviations (nn, xfavore, cmq, qlcosa, etc.)
- **Varied Formulations**: Multiple ways to express same intent
- **Emoji Use**: Natural emoji in responses (🚀, ✨, 🔌, 📡, etc.)

### Rich Context
- **Randomized Simulation State**: Each example has different experiment, components, wire count, tab, volume
- **69 Experiments**: All educational activities from all 3 volumes represented
- **14 Component Types**: 40+ specific component variants
- **Realistic Scenarios**: Contexts match actual student usage patterns

### Smart Intent Routing
- **Direct Responses** (2,077 examples): Brain handles simple queries immediately
- **Specialist Routing** (2,906 examples): Routes complex queries to appropriate expert LLM
- **Hybrid Approach**: Balances latency and quality

### Actions Format
All actions follow pattern: `[AZIONE:type:params]`

**Common Actions**:
- `[AZIONE:play]` - Start simulation
- `[AZIONE:pause]` - Pause simulation
- `[AZIONE:reset]` - Reset to initial state
- `[AZIONE:clearall]` - Empty breadboard
- `[AZIONE:compile]` - Compile code
- `[AZIONE:diagnose]` - Check for errors
- `[AZIONE:quiz]` - Ask assessment questions
- `[AZIONE:highlight:component_id]` - Visual emphasis
- `[AZIONE:loadexp:experiment_id]` - Load experiment
- `[AZIONE:opentab:tab_name]` - Switch UI view
- `[AZIONE:openvolume:volume_num]` - Switch volume
- `[AZIONE:addwire:comp1:pin1:comp2:pin2]` - Create connection
- `[AZIONE:removewire:wire_id]` - Remove connection
- `[AZIONE:removecomponent:component_id]` - Delete component
- `[AZIONE:interact:component_id:value]` - Physical interaction
- `[AZIONE:youtube:search_query]` - Find video tutorial
- `[AZIONE:navigate:direction]` - Browse pages

---

## Top Components Used

| Component | Frequency | Category |
|-----------|-----------|----------|
| button1 | 289 | Switches |
| led_rosso | 237 | LEDs |
| resistor_220 | 125 | Resistors |
| servo1 | 125 | Motors |
| led_giallo | 124 | LEDs |
| buzzer1 | 121 | Sound |
| lcd1 | 116 | Display |
| led_verde | 115 | LEDs |
| transistor_npn | 114 | Semiconductors |
| rgb_led1 | 113 | Advanced LEDs |
| led_blu | 107 | LEDs |
| transistor_pnp | 95 | Semiconductors |
| motor1 | 94 | Motors |
| resistor_1k | 88 | Resistors |
| capacitor_10uf | 88 | Capacitors |

---

## Usage for Fine-Tuning

### Required Dependencies
```bash
pip install torch transformers datasets
```

### Basic Fine-Tuning Code (Hugging Face)

```python
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer

# Load dataset
dataset = load_dataset('json', data_files='galileo-brain-v3.jsonl', split='train')

# Load model and tokenizer
model_name = "Qwen/Qwen-3B"  # or Qwen3-4B
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Prepare data
def format_chat(example):
    text = tokenizer.apply_chat_template(
        example['messages'],
        tokenize=False
    )
    return {'text': text}

formatted_data = dataset.map(format_chat)

# Training arguments
training_args = TrainingArguments(
    output_dir="./elab-tutor-brain",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    warmup_steps=100,
    weight_decay=0.01,
    save_strategy="epoch",
    logging_steps=100,
)

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=formatted_data,
)

trainer.train()
```

### Testing the Model

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("./elab-tutor-brain")
model = AutoModelForCausalLM.from_pretrained("./elab-tutor-brain")

# Test message
messages = [
    {"role": "system", "content": "Sei il BRAIN di ELAB Tutor..."},
    {"role": "user", "content": "tab: simulator\nesperimento: v1-cap1-esp1\ncomponenti: [led_rosso]\nfili: 0\nvolume_attivo: 1\n\nfai partire il circuito!"},
]

text = tokenizer.apply_chat_template(messages, tokenize=False)
inputs = tokenizer(text, return_tensors="pt")
outputs = model.generate(**inputs, max_length=200)
response = tokenizer.decode(outputs[0])
print(response)
```

---

## Dataset Quality Metrics

✅ **Total Examples**: 5,383
✅ **Intent Balance**: Weighted distribution (circuit-heavy, as expected)
✅ **Context Diversity**: 69+ experiments, randomized component configurations
✅ **Language Authenticity**: Real kid language patterns, typos, slang
✅ **Action Coverage**: 20+ distinct action types
✅ **Component Coverage**: 40+ specific components from all categories
✅ **Routing Ratio**: 38.5% direct responses, 53.9% specialist routing, 7.6% vision-only

---

## System Prompt (Included in Every Example)

The system prompt is consistent across all 5,383 examples and defines:

1. **Qwen's Role**: Brain router for ELAB Tutor
2. **Intent Categories**: 6 types (action, circuit, code, tutor, vision, navigation)
3. **Available Specialists**: 6 expert systems
4. **Context Fields**: Tab, experiment, components, wires, volume
5. **Processing Rules**: How to analyze messages, extract entities, route intelligently
6. **Output Format**: JSON structure with intent, entities, actions, needs_llm, response/llm_hint

---

## Generation Script

The dataset was generated by `/scripts/generate-brain-dataset-v3.py` using:

- **Language**: Italian (kid-friendly)
- **Randomization**:
  - 69 experiments across 3 volumes (each example has random experiment)
  - 40+ components in random combinations
  - Variable wire counts (0-10 per example)
  - All 4 UI tabs represented
  - All 3 volume levels covered
- **Typo Introduction**: 40-60% of examples include realistic typos/slang
- **Action Tags**: Format-consistent `[AZIONE:type:params]`
- **Intent Distribution**: Circuit-heavy (36.6%), balanced across other categories

---

## Citation

If you use this dataset in research or production, please cite:

```bibtex
@dataset{elab_tutor_brain_v3,
  title={ELAB Tutor Brain v3: ChatML Training Dataset for Circuit Education},
  author={ELAB Project Team},
  year={2026},
  publisher={ELAB Tutor},
  url={https://github.com/elab/elab-builder/blob/main/galileo-brain-v3.jsonl}
}
```

---

## License

This dataset is intended for educational use within the ELAB Tutor project.

---

## Questions?

For questions about the dataset, generation process, or fine-tuning:
- Review the generation script: `scripts/generate-brain-dataset-v3.py`
- Check example lines in `galileo-brain-v3.jsonl`
- Refer to system prompt in any example for routing logic

Generated: **2026-03-13**
Total Lines: **5,383**
File Size: **~11 MB**
