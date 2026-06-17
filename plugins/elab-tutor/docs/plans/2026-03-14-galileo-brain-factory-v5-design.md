# Galileo Brain Factory v5 — Design Document

**Date**: 2026-03-14
**Session**: Galileo Brain Restart
**Status**: APPROVED

---

## 1. Vision

The Brain is a **local JSON router** running on Ollama (Qwen3-4B GGUF). For 80% of messages it responds autonomously without cloud. It is NOT a chatbot — receives Italian text + simulator context, returns structured JSON.

**Primary user: the TEACHER** — even totally incompetent ones. UNLIM empowers the teacher to look competent. The lesson credit belongs to the teacher.

**Tone**: Simple language, everyday analogies ("la corrente e' come l'acqua in un tubo!"), fun, engaging. Target: 10-14 year olds.

## 2. Architecture — 5 Layers

```
L0: Deterministic regex (play/pause/reset — 0ms, 100% reliable)
 |  if no match
L1: Semantic cache (embedding similarity — <10ms, seen responses)
 |  if cache miss
L2: Local Brain Qwen3-4B GGUF via Ollama (~200ms, JSON routing)
 |  if needs_llm=true
L3: Cloud specialist (DeepSeek/Groq racing — ~1-3s, reasoning)
 |  transversal
L4: Teacher memory (preferences, class, progress — NO students)
```

## 3. JSON Output Schema

```json
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["led", "resistor"],
  "actions": ["[AZIONE:play]"],
  "needs_llm": false,
  "response": "Ecco il LED, lo piazzo!",
  "llm_hint": null
}
```

- **Intent "teacher"**: new, for teacher didactic requests
- **Responses**: mechanical actions telegraphic ("Avviato."), components/diagnosis warm ("Ecco il LED, lo piazzo!"), teacher always `needs_llm=true` with rich hint

## 4. System Prompt v2

```
Sei il Galileo Brain, il cervello di routing di UNLIM — l'assistente AI di ELAB Tutor.
ELAB Tutor e' una piattaforma educativa di elettronica per ragazzi 10-14 anni
e per i loro docenti.

Ricevi il messaggio dell'utente (studente O docente) + contesto del simulatore.
Rispondi SOLO in JSON valido.

REGOLE:
1. "intent": action|circuit|code|tutor|vision|navigation|teacher
2. "entities": componenti, pin, esperimenti menzionati
3. "actions": array di [AZIONE:...] o [INTENT:{...}]
4. "needs_llm": false se puoi rispondere da solo, true se serve ragionamento
5. "response": frase breve se needs_llm=false. Azioni meccaniche: telegrafiche.
   Componenti/diagnosi: una frase calda con personalita'.
6. "llm_hint": se needs_llm=true, descrivi contesto per LLM grande.
   Indica se l'utente sembra docente o studente, livello competenza percepito.
   Linguaggio semplice, analogie quotidiane, tono divertente e coinvolgente.

COMPONENTI VALIDI: led, resistor, push-button, buzzer-piezo, capacitor,
potentiometer, photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo,
reed-switch, phototransistor, battery9v, multimeter, lcd16x2, nano-r4-board,
breadboard-half, breadboard-full, wire
```

## 5. Brain Factory — Directory Structure

```
datasets/
├── brain_factory/
│   ├── __init__.py
│   ├── engine.py           — Core: generate from sections, dedup, stats, JSONL, manifest
│   ├── corruption.py       — Pluggable corruption pipeline
│   ├── registry.py         — Auto-discover sections from configs/sections/*.yml
│   └── sections/
│       ├── base.py         — ABC: Section.generate() -> List[Example]
│       ├── template_section.py  — Read YAML -> generate examples
│       ├── combo_section.py     — Combinatorial explosion (multi-comp, multi-action)
│       └── multi_turn_section.py — Multi-turn conversations
│
├── configs/
│   ├── system_prompt.txt        — System prompt (separate, versioned)
│   ├── components.yml           — 21 components + slang aliases + pin maps
│   ├── experiments.yml          — 69 experiments + volume metadata
│   ├── actions.yml              — 48+ action tags + linguistic variants
│   ├── responses.yml            — Warm response templates (random pick)
│   ├── corruptions.yml          — Corruptor configs: probabilities, levels
│   └── sections/                — 1 YAML per section (21 files)
│       ├── 01_actions.yml       — play/pause/reset/compile + variants
│       ├── 02_circuit.yml       — component placement + wiring
│       ├── 03_code.yml          — Arduino/Scratch coding
│       ├── 04_tutor.yml         — theory, explanations, physics laws
│       ├── 05_navigation.yml    — load experiment, open tab
│       ├── 06_vision.yml        — image/screenshot analysis
│       ├── 07_teacher.yml       — competent teacher (~1500 examples)
│       ├── 08_teacher_clueless.yml — clueless teacher (~500+ examples)
│       ├── 09_dialects.yml      — 13 Italian dialects
│       ├── 10_profanity.yml     — profanity + frustration
│       ├── 11_expert.yml        — expert user, technical jargon
│       ├── 12_ignorant.yml      — user who knows nothing
│       ├── 13_truncated.yml     — truncated, incomplete phrases
│       ├── 14_emoji.yml         — emoji communication
│       ├── 15_english.yml       — English/mixed messages
│       ├── 16_voice.yml         — voice-to-text errors
│       ├── 17_out_of_scope.yml  — off-topic questions
│       ├── 18_multi_step.yml    — multi-action sequences
│       ├── 19_context_aware.yml — context-dependent responses
│       ├── 20_autocorrect.yml   — smartphone autocorrect fails
│       └── 21_lcd_scratch.yml   — LCD + Blockly specific
│
├── profiles/
│   ├── v5-extreme-25k.yml       — Target 25K, weights per section
│   └── eval-200.yml             — 200 holdout for evaluation
│
├── generate.py                  — CLI: --profile, --only, --eval, --dry-run, --seed
└── output/
    ├── *.jsonl                  — Generated dataset
    └── *.manifest.json          — Lineage tracking
```

## 6. Section YAML Format

Each section is self-contained. Example `08_teacher_clueless.yml`:

```yaml
id: teacher_clueless
name: "Docente Imbranato"
intent: teacher
needs_llm: true
min_examples: 500

templates:
  - input: "Io sono la prof di {materia}, non capisco niente di circuiti"
    llm_hint: "Docente totalmente inesperto ({materia}), primo contatto. Rassicurare, fornire script pronto."
    vars:
      materia: [italiano, storia, geografia, matematica, arte, musica, inglese, scienze, ed. fisica]

  - input: "Come faccio a fare bella figura se non so cos'e' {componente}?"
    llm_hint: "Docente insicuro, non conosce {componente}. Analogia semplice, frase pronta per la classe."
    vars:
      componente: [un resistore, un LED, un condensatore, un buzzer, un potenziometro]

  - input: "{prefisso} {domanda}"
    llm_hint: "Docente riporta domanda studente. Risposta pronta con analogia quotidiana."
    vars:
      prefisso: ["Uno studente mi ha chiesto", "Un ragazzo vuole sapere", "Mi hanno chiesto"]
      domanda: ["perche' il LED si brucia", "a cosa serve la resistenza", "cos'e' la corrente"]

corruptions:
  typo: 0.3
  truncated: 0.2
  voice: 0.1
  autocorrect: 0.15
```

`template_section.py` reads the YAML, explodes `vars` combinatorially, applies corruptions per probabilities, generates complete JSON output with response from `responses.yml`. Zero Python for new sections.

## 7. Corruptors

| Corruptor | What it does | Example |
|-----------|-------------|---------|
| `typo` | Swapped/doubled/missing letters | "resistenza" -> "reistenza" |
| `dialect` | Regional slang | "metti" -> "mettc" (napoletano) |
| `truncated` | Phrase cut mid-word | "metti un led sulla bre" |
| `emoji` | Emoji replacing words | "metti un (lightbulb)" |
| `voice` | Speech-to-text errors | "accendi" -> "a Gendy" |
| `autocorrect` | Smartphone autocorrect | "mosfet" -> "mostre" |
| `space_chaos` | Random missing/added spaces | "mettiun led" |
| `caps_chaos` | Random capitalization | "METTI un Led" |
| `profanity` | Frustration with profanity | "non funziona 'sto coso" |

Each corruptor is a registered function — adding one = 5 lines of Python.

## 8. Profile v5 — 25K Distribution

```yaml
# profiles/v5-extreme-25k.yml
target: 25000
seed: 2026_03_14
system_prompt: system_prompt.txt
output: galileo-brain-v5-extreme-25k.jsonl

sections:
  actions:          { weight: 8  }
  circuit:          { weight: 15 }
  code:             { weight: 8  }
  tutor:            { weight: 10 }
  navigation:       { weight: 5  }
  vision:           { weight: 4  }
  teacher:          { weight: 6  }
  teacher_clueless: { weight: 3  }
  dialects:         { weight: 6  }
  profanity:        { weight: 3  }
  expert:           { weight: 4  }
  ignorant:         { weight: 5  }
  truncated:        { weight: 3  }
  emoji:            { weight: 3  }
  english:          { weight: 3  }
  voice:            { weight: 3  }
  out_of_scope:     { weight: 4  }
  multi_step:       { weight: 5  }
  context_aware:    { weight: 5  }
  autocorrect:      { weight: 2  }
  lcd_scratch:      { weight: 3  }
```

Estimated distribution (weights normalized to 25K):

| Section | Target | needs_llm % |
|---------|--------|-------------|
| circuit | ~3750 | 30% |
| tutor | ~2500 | 90% |
| actions | ~2000 | 5% |
| code | ~2000 | 60% |
| teacher | ~1500 | 95% |
| dialects | ~1500 | 40% |
| multi_step | ~1250 | 20% |
| context_aware | ~1250 | 50% |
| ignorant | ~1250 | 70% |
| teacher_clueless | ~750 | 100% |
| navigation | ~1250 | 10% |
| expert | ~1000 | 40% |
| out_of_scope | ~1000 | 100% |
| others | ~2250 | varies |

Global needs_llm: ~45%

## 9. Warm Response Templates (responses.yml)

```yaml
action_play: ["Avviato.", "Via!", "Simulazione avviata."]
action_pause: ["In pausa.", "Pausa.", "Fermata."]
action_reset: ["Reset.", "Azzerato.", "Da capo."]
action_clearall: ["Svuotato.", "Tutto pulito.", "Breadboard vuota."]

component_place:
  - "Ecco {component}, lo piazzo!"
  - "{component} in arrivo!"
  - "Metto {component} sulla breadboard!"

component_multi:
  - "{components} — li monto subito!"
  - "Ecco {components}, tutti in posizione!"

diagnose:
  - "Vediamo cosa non va..."
  - "Controllo il circuito!"
  - "Diagnosi in corso, un attimo!"
```

## 10. Training Pipeline

```
STEP 1: python generate.py --profile v5-extreme-25k --dry-run
STEP 2: python generate.py --profile v5-extreme-25k
STEP 3: python generate.py --profile eval-200

STEP 4: Upload to Colab (A100 or T4)
  Sequential training:
  A) Epoch 1-2 on 20K base (existing)
  B) Epoch 1 on 25K extreme (new)

  Hyperparams:
  - QLoRA: r=32, alpha=32, 4-bit
  - train_on_responses_only=True
  - gradient_checkpointing="unsloth"
  - batch=2, grad_accum=8, lr=1e-4
  - early_stopping patience=3
  - save checkpoint every 500 steps
  - DoRA fallback if LoRA plateaus

STEP 5: Export GGUF q4_k_m (~2.5GB) + q5_k_m (~3GB)
STEP 6: Test on eval-200 -> target >= 95% accuracy
STEP 7: Ollama Modelfile -> deploy in nanobot
```

## 11. Nanobot Integration — Shadow Mode

```python
async def route_with_brain(message, context):
    # L0: Deterministic regex
    l0_result = deterministic_action_fallback(message)
    if l0_result:
        return l0_result

    # L2: Local Brain
    brain_result = await call_ollama_brain(message, context)

    if BRAIN_MODE == "shadow":
        log_brain_prediction(brain_result, message)
        return await route_to_specialist_v5(message, context)

    elif BRAIN_MODE == "active":
        if not brain_result["needs_llm"]:
            return brain_result
        else:
            return await call_cloud_specialist(
                message, context,
                hint=brain_result["llm_hint"]
            )
```

## 12. CLI Interface

```bash
# Dry run — show stats only
python generate.py --profile v5-extreme-25k --dry-run

# Full generation
python generate.py --profile v5-extreme-25k

# Generate only specific sections
python generate.py --profile v5-extreme-25k --only teacher,teacher_clueless

# Generate evaluation holdout
python generate.py --profile eval-200

# Custom seed
python generate.py --profile v5-extreme-25k --seed 42
```

## 13. Lineage Tracking (manifest.json)

Generated automatically alongside every JSONL:

```json
{
  "generated_at": "2026-03-14T15:30:00",
  "profile": "v5-extreme-25k",
  "git_hash": "abc1234",
  "total": 24873,
  "duplicates_removed": 1127,
  "sections": { "dialects": 1489, "teacher": 1502 },
  "intents": { "action": 5200, "circuit": 8100 },
  "needs_llm_pct": 45.2
}
```

## 14. Future-Proofing

| Future scenario | What to change |
|----------------|---------------|
| New model (Qwen3.5, Phi-4) | 1 line in notebook (model_name) |
| New phrase category | 1 YAML file in configs/sections/ |
| New corruptor | 5 lines Python + registration |
| New response tone | Edit responses.yml |
| Different target (15K, 50K) | New profile in profiles/ |
| Regenerate 1 section | `--only section_name` |
| Evaluate regressions | `--eval 200` + auto test |
| Train successor's successor | Manifest records exactly what produced each dataset |

## 15. Key Design Decisions

1. **Keep 20K base** as foundation, generate 25K extreme supplement
2. **Sequential training**: base -> extreme (not merged)
3. **Teacher-first**: 2000+ teacher examples (500+ clueless)
4. **Dual user support**: system prompt covers teacher + student, `llm_hint` adapts
5. **Warm + telegraphic mix**: mechanical actions short, components/diagnosis with personality
6. **Config-driven**: adding a section = adding a YAML file, no Python needed
7. **Incremental**: `--only` flag for partial regeneration
8. **Traceable**: manifest.json for every dataset
