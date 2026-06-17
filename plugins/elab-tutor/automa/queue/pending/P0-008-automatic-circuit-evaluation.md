# P0-008: Sistema Valutazione Automatica Circuiti

**Priorità**: P0 (Differenziatore competitivo critico)
**Stima**: 2-3 settimane  
**Assegnato**: Autoresearch Agent
**Creato**: 2026-03-24
**Deadline**: 2026-04-15

## PROBLEMA
ELAB Tutor non ha sistema valutazione automatica circuiti. Competitor come Tinkercad pure. Docenti devono correggere manualmente 25 circuiti per classe → time sink enorme. Studenti non hanno feedback immediato → apprendimento ritardato.

## SOLUZIONE PROPOSTA
Algoritmo ibrido (regole + simulazione simbolica) per valutare circuiti base e fornire feedback pedagogico istantaneo.

### Features MVP
1. **Rilevamento errori base**:
   - Cortocircuito (percorso <1Ω)
   - LED invertito (polarità sbagliata)  
   - LED senza resistenza (corrente eccessiva)
   - Tensioni fuori range (>3.2V o <1.8V per LED)
   - Circuito aperto (no connessione)

2. **Feedback pedagogico**:
   - Messaggio specifico per ogni errore
   - Linguaggio 10-14 anni (Gulpease ≥60)
   - Suggerimento correzione semplice

3. **Dashboard docente**:
   - Lista errori comuni per classe
   - Tempo medio per completare esercizio
   - Studenti che necessitano aiuto

### Performance Target
- **Velocità**: <100ms per circuito
- **Accuratezza**: <5% false positive
- **Copertura**: 95% errori comuni riconosciuti

## IMPLEMENTAZIONE

### File da Creare/Modificare
```
src/lib/circuit-evaluator/
├── circuit-parser.js       # Parsing grafo circuito
├── validation-rules.js     # Regole errori comuni
├── symbolic-solver.js      # Simulazione semplificata
├── feedback-generator.js   # Messaggi pedagogici
└── evaluation-engine.js    # Orchestratore principale

src/components/simulator/
└── EvaluationPanel.jsx     # UI risultati valutazione

nanobot/prompts/
└── circuit-feedback.yml    # Template feedback Galileo
```

### API Endpoint
```javascript
POST /api/evaluate-circuit
{
  circuit: {components, connections},
  exerciseId: "cap8-esp1",
  studentId: "abc123"
}

Response:
{
  isCorrect: true/false,
  errors: [
    {
      type: "led_reversed", 
      component: "LED1",
      message: "Il LED è invertito. Il catodo (-) deve collegarsi al polo negativo della batteria.",
      suggestion: "Prova a ruotare il LED di 180 gradi."
    }
  ],
  score: 85,
  completionTime: 127000 // ms
}
```

### Algoritmo Core
```python
def evaluate_circuit(graph, target_config):
    # 1. Validazione strutturale (20ms)
    structural_errors = validate_structure(graph)
    if structural_errors:
        return generate_feedback(structural_errors)
    
    # 2. Analisi elettrica simbolica (40ms)  
    model = build_circuit_model(graph)
    electrical_errors = check_operating_conditions(model)
    
    # 3. Confronto con target (20ms)
    functional_errors = compare_with_target(model, target_config)
    
    # 4. Feedback pedagogico (20ms)
    all_errors = structural_errors + electrical_errors + functional_errors
    return generate_pedagogical_feedback(all_errors, target_config)
```

## TESTING & VALIDATION

### Dataset Test
- **200 circuiti corretti** (con variazioni creative)
- **300 circuiti con errori** (uno per tipo)
- **Validazione con 3 docenti** di tecnologia

### Criteri Success
- [ ] Tutti gli errori P0 riconosciuti (cortocircuito, LED invertito, no resistenza)
- [ ] <100ms tempo risposta medio
- [ ] <5% false positive su dataset test
- [ ] Feedback comprensibile a studenti 12 anni (test Gulpease ≥60)
- [ ] 90%+ docenti trovano utile in trial

## VALORE BUSINESS
- **ROI Docente**: -80% tempo correzione (da 25min a 5min per classe)
- **Learning Impact**: +40% retention concetti (feedback immediato)
- **Competitive Edge**: Primo simulatore italiano con auto-evaluation
- **Pricing Justification**: Feature da €399/anno vs gratuti

## LINK RICERCA
- `automa/knowledge/RESEARCH-AUTOMATIC-EVALUATION-ALGORITHMS.md`
- `automa/knowledge/RESEARCH-CYCLE20-STRATEGIC-ANALYSIS-2026.md`

---
**Note**: Questa feature è il differenziatore #1 vs competitor. Se implementata bene, giustifica premium pricing e crea switching cost alto per scuole che adottano.