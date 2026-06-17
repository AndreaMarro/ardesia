# ELAB Tutor Brain Dataset v4 - Tool Calling Format

## Overview
This dataset contains **10,284 training examples** with **structured tool_calls JSON format** for fine-tuning LLMs on circuit simulator task understanding and routing.

**File**: `galileo-brain-v4-toolcall.jsonl`
**Size**: 11 MB
**Format**: ChatML JSONL (one JSON object per line)

## Key Differences from v3

### Tool Calls Format (NEW)
Instead of text action tags like `[AZIONE:play]`, v4 uses structured JSON:

```json
{
  "name": "simulator.play",
  "arguments": {}
}
```

```json
{
  "name": "component.add",
  "arguments": {"type": "led", "color": "red"}
}
```

```json
{
  "name": "wire.add",
  "arguments": {
    "from_component": "nano",
    "from_pin": "D3",
    "to_component": "led1",
    "to_pin": "anode"
  }
}
```

## Dataset Structure

Each example is a ChatML message format with 3 roles:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il BRAIN di ELAB Tutor..."
    },
    {
      "role": "user",
      "content": "tab: simulator\nesperimento: v1-cap6-esp1\n...\n\nAvvia il circuito"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"action\", \"entities\": [], \"tool_calls\": [{\"name\": \"simulator.play\", \"arguments\": {}}], \"needs_llm\": false, \"response\": \"Perfetto!\"}"
    }
  ]
}
```

## Intent Categories (8 types)

- **action** (1514 examples): Direct simulator commands (play, pause, reset, compile)
- **circuit** (3895 examples): Circuit building and component placement
- **code** (1162 examples): Code writing, editing, compilation
- **tutor** (1963 examples): Theory questions, help, memory recall
- **vision** (500 examples): Image analysis of circuits
- **navigation** (403 examples): Experiment loading, tab switching, volume navigation
- **voice** (350 examples): Voice mode control, language switching
- **drawing** (497 examples): Annotation and drawing mode

## Supported Tool Types (30+)

### Simulator Control
- `simulator.play` - Start simulation
- `simulator.pause` - Pause simulation
- `simulator.reset` - Reset simulation
- `simulator.clearAll` - Clear all components
- `simulator.compile` - Compile code
- `simulator.diagnose` - Diagnose circuit issues

### Component Operations
- `component.add` - Add component to breadboard
- `component.remove` - Remove component
- `component.move` - Move component position
- `component.highlight` - Highlight component(s)

### Wiring
- `wire.add` - Add wire connection
- `wire.remove` - Remove specific wire
- `wire.removeAll` - Remove all wires

### Navigation
- `navigation.loadExperiment` - Load experiment by ID
- `navigation.openTab` - Open tab (simulator|editor|manual|scratch)
- `navigation.openVolume` - Open volume (1|2|3)
- `navigation.goToPage` - Go to page number

### Code Editor
- `editor.setCode` - Set/update code
- `editor.switchMode` - Switch mode (arduino|scratch)
- `editor.openPanel` - Open panel (serial|plotter|bom)

### User Interaction
- `interaction.pressButton` - Simulate button press
- `interaction.setPotentiometer` - Set potentiometer value (0-1023)
- `interaction.setLightLevel` - Set sensor light level (0-1023)

### Learning
- `quiz.start` - Start quiz on topic
- `quiz.answer` - Answer quiz question

### Advanced Features
- `voice.enable` - Enable voice mode
- `voice.disable` - Disable voice mode
- `voice.setLanguage` - Change language (it|en|de|es)
- `drawing.enable` - Enable drawing mode
- `drawing.clear` - Clear all drawings
- `drawing.setColor` - Set drawing color
- `memory.recall` - Recall session context
- `report.generate` - Generate progress report
- `youtube.search` - Search YouTube
- `buildMode.set` - Set build mode

## Coverage Statistics

### Experiments (69 total)
- Volume 1: v1-cap1-esp1 through v1-cap6-esp3 (18 experiments)
- Volume 2: v2-cap1-esp1 through v2-cap6-esp3 (18 experiments)
- Volume 3: v3-cap1-esp1 through v3-cap6-esp3 (18 experiments)
- Extra: v3-extra-esp1 through v3-extra-esp6 (6 experiments)

### Components (22 types)
- **LED**: led_rosso, led_verde, led_blu, led_giallo (4)
- **Resistors**: resistor_220, resistor_1k, resistor_10k, resistor_4.7k (4)
- **Buttons**: button1, button2 (2)
- **Buzzer**: buzzer1 (1)
- **Capacitors**: capacitor_10uf, capacitor_100uf (2)
- **Potentiometer**: potentiometer1 (1)
- **Motor**: motor1 (1)
- **Servo**: servo1 (1)
- **RGB LED**: rgb_led1 (1)
- **Photoresistor**: photoresistor1 (1)
- **Diode**: diode1 (1)
- **Transistors**: transistor_npn, transistor_pnp (2)
- **LCD**: lcd1 (1)
- **MOSFET**: mosfet1 (1)

### Tabs
- simulator, editor, manual, scratch

### Wiring Nodes
- bus-bot-plus, bus-bot-minus, bus-top-plus, bus-top-minus
- Digital pins: D3-D13
- Analog pins: A0-A5

## Language Features

### Italian Kid Language (Ages 8-14)
- **Typos**: "nn" (non), "xfavore" (per favore), "cmq" (comunque), "qlcosa" (qualcosa)
- **Slang**: "figo!", "bello!", "anke" (anche), "xké" (perché)
- **Short queries**: "play!", "stop", "LED rosso"
- **Rambling speech**: "allora io volevo tipo fare un circuito..."
- **Character swaps**: typo-like errors (e.g., "awvia" instead of "avvia")

## Example Training Entries

### Simple Simulator Action
```json
{
  "messages": [
    {"role": "system", "content": "Sei il BRAIN..."},
    {"role": "user", "content": "tab: simulator\n...\n\nFai partire"},
    {"role": "assistant", "content": "{\"intent\": \"action\", \"entities\": [], \"tool_calls\": [{\"name\": \"simulator.play\", \"arguments\": {}}], \"needs_llm\": false, \"response\": \"Perfetto! Avvio la simulazione...\"}"}
  ]
}
```

### Multi-Step Circuit Building
```json
{
  "messages": [
    {"role": "system", "content": "Sei il BRAIN..."},
    {"role": "user", "content": "tab: simulator\n...\n\nCostruisci un semaforo con 3 LED, resistori e un pulsante"},
    {"role": "assistant", "content": "{\"intent\": \"circuit\", \"entities\": [\"led_rosso\", \"led_giallo\", \"led_verde\", \"resistor_220\", \"button1\"], \"tool_calls\": [{\"name\": \"component.add\", \"arguments\": {\"type\": \"led\"}}, ...], \"needs_llm\": true, \"llm_hint\": \"Guida l'utente...\""}
  ]
}
```

### Voice Mode
```json
{
  "messages": [
    {"role": "system", "content": "Sei il BRAIN..."},
    {"role": "user", "content": "tab: simulator\n...\n\nParla in italiano"},
    {"role": "assistant", "content": "{\"intent\": \"voice\", \"entities\": [\"italiano\"], \"tool_calls\": [{\"name\": \"voice.setLanguage\", \"arguments\": {\"lang\": \"it\"}}], \"needs_llm\": false}"}
  ]
}
```

## Statistics

| Metric | Value |
|--------|-------|
| Total Examples | 10,284 |
| File Size | 11 MB |
| Intents | 8 |
| Unique Tools | 30+ |
| Experiments Covered | 69 |
| Component Types | 22 |
| Max Wires per Example | 15 |
| Avg Example Size | ~1.1 KB |

## Use Cases

1. **Fine-tuning LLMs** for circuit simulator task understanding
2. **Training intent classifiers** to route user requests
3. **Building tool-calling models** for complex multi-step operations
4. **Language understanding** in Italian educational context
5. **Multi-modal learning** combining simulator state + user intent + tool calls

## Data Quality

✓ All tool_calls validated for correct structure
✓ All experiments referenced are in the 69 available experiments
✓ All components from the 22 supported types
✓ Realistic Italian kid language with natural typos
✓ Balanced distribution across intent categories
✓ Mix of simple single-tool and complex multi-step examples
✓ Context-aware with simulator state information

## Generation Script

Generated by: `generate-brain-dataset-v4-toolcall.py`
- Programmatic tool call generation
- Random context simulation
- Diverse prompt variations
- Natural language typos
- Multi-step scenario generation

---
*Dataset v4 generated for ELAB Tutor fine-tuning (2026)*
