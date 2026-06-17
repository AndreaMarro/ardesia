# Miglioramenti Orchestratore — ELAB Autoresearch

**Data**: 2026-03-24
**Modo**: EVOLVE
**Analisi**: Sistema corrente + proposte ottimizzazione

## Problemi Identificati nell'Orchestratore Attuale

### 1. Frequenze Tool AI Non Ottimali
**Attuale:**
- DeepSeek: ogni 5 cicli
- Gemini: ogni 10 cicli  
- Kimi: ogni 10 cicli

**Problema:** Sottoutilizzo tool gratuiti, frequenza non basata su valore/costo

### 2. Budget Management Passivo
- Budget €20/mese non tracciato attivamente
- Nessun sistema di prioritizzazione dinamica
- Costi attuali ~€4/mese = sottoutilizzo risorse

### 3. Context Layers Ridondanti  
8 layer di memoria ma alcuni sovrapposti:
- Layer 2 (last report) vs Layer 3 (handoff) vs Layer 7 (eval score)
- Layer 5 (knowledge index) vs Layer 8 (SQLite) potrebbero essere unificati

### 4. Mode Selection Statico
Selezione modo non considera:
- Performance metrics trend
- Urgenza task nella queue
- Budget disponibile giornaliero

## PROPOSTE DI MIGLIORAMENTO

### A. Frequenze Tool Ottimizzate

```python
def get_ai_tool_schedule(cycle_num: int, mode: str, budget_remaining: float) -> dict:
    """Dinamicamente calcola quali tool usare questo ciclo."""
    tools = []
    
    # DeepSeek: ogni 3 cicli (quality feedback critico)
    if cycle_num % 3 == 0 or mode == "EVOLVE":
        tools.append("deepseek")
    
    # Gemini: ogni 15 cicli O se mode=RESEARCH
    if cycle_num % 15 == 0 or mode == "RESEARCH": 
        tools.append("gemini")
    
    # Kimi: ogni 5 cicli (gratuito, massimizziamo)
    if cycle_num % 5 == 0 or mode in ["IMPROVE", "AUDIT"]:
        tools.append("kimi")
    
    # Budget boost: se budget >70% rimasto, aumenta frequenza
    if budget_remaining > 14:  # €14 di €20
        tools = list(set(tools + ["deepseek", "kimi"]))
    
    return {
        "tools_to_use": tools,
        "estimated_cost": calculate_cost(tools),
        "priority_rationale": f"Mode {mode}, cycle {cycle_num}, budget {budget_remaining}"
    }
```

### B. Mode Selection Intelligente

```python
def select_optimal_mode(check_results: list, queue_stats: dict, 
                       recent_scores: list, budget_today: float) -> str:
    """Selezione dinamica modo basata su stato sistema."""
    
    failed_checks = [r for r in check_results if r["status"] == "fail"]
    
    # EMERGENZA: se check falliti, sempre IMPROVE
    if failed_checks:
        return "IMPROVE"
    
    # DEGRADATION: se score in calo, focus IMPROVE/AUDIT  
    if len(recent_scores) >= 3:
        trend = recent_scores[-1] - recent_scores[-3]
        if trend < -0.05:  # Calo significativo
            return "AUDIT" if recent_scores[-1] < 0.85 else "IMPROVE"
    
    # QUEUE PRESSURE: tanti task pending = IMPROVE
    high_priority_tasks = queue_stats.get("high_priority", 0)
    if high_priority_tasks >= 3:
        return "IMPROVE"
    
    # BUDGET DRIVEN: se budget alto, modes costosi (RESEARCH)
    if budget_today > 15:  # €15+ rimanenti
        return "RESEARCH" 
    
    # DEFAULT ROTATION: bilanciata sui 5 modi
    rotation = ["IMPROVE", "RESEARCH", "AUDIT", "IMPROVE", "EVOLVE"]
    cycle_in_day = datetime.now().hour  # Rough proxy
    return rotation[cycle_in_day % 5]
```

### C. Context Layers Snelliti (5 invece di 8)

```python
def build_context_layers(state: dict) -> dict:
    """5 layer essenziali senza ridondanza."""
    return {
        "experiments": load_results_tsv_summary(),  # Storia performance
        "session": load_handoff_and_recent_work(),   # Cosa fatto recentemente  
        "knowledge": load_context_db_summary(),      # Research persistente
        "codebase": get_git_recent_commits(),        # Modifiche codice
        "targets": get_current_priorities()          # Task queue + scores attuali
    }
```

### D. Budget Monitoring Attivo

```python
def update_budget_tracking(state: dict, ai_calls_made: list) -> dict:
    """Tracking attivo spesa AI con proiezioni."""
    today = datetime.now().date().isoformat()
    
    # Calcola costo effettivo chiamate 
    cost_today = sum(estimate_call_cost(call) for call in ai_calls_made)
    
    # Proiezione fine mese
    days_in_month = 30
    days_passed = datetime.now().day
    projected_monthly = (cost_today / days_passed) * days_in_month
    
    state["budget"] = {
        "spent_today": cost_today,
        "spent_this_month": state.get("budget", {}).get("spent_this_month", 0) + cost_today,
        "projected_monthly": projected_monthly,
        "recommendations": get_budget_recommendations(projected_monthly)
    }
    
    return state
```

### E. Micro-Research Strutturata

```python
def get_micro_research_topic(mode: str, recent_work: list) -> str:
    """1 micro-research per ciclo, allineata al lavoro corrente."""
    
    if mode == "IMPROVE":
        return "UX patterns EdTech classroom 2026"
    elif mode == "RESEARCH": 
        return "competitive analysis electronics simulators education"
    elif mode == "WRITE":
        return "teacher professional development electronics curriculum"  
    elif mode == "AUDIT":
        return "accessibility standards educational technology WCAG"
    elif mode == "EVOLVE":
        return "autonomous systems educational assessment metrics"
        
    return "pedagogy electronics misconceptions middle school"
```

## IMPLEMENTAZIONE PRIORITARIA

### Week 1: Budget & Tool Frequency
1. Implementare `get_ai_tool_schedule()` 
2. Aggiungere budget tracking attivo
3. Increase DeepSeek frequency 5→3 cicli
4. Increase Kimi frequency 10→5 cicli

### Week 2: Mode Selection  
1. `select_optimal_mode()` con logica trend/queue
2. Testing mode selection su dati storici
3. Fallback su rotation se logica fallisce

### Week 3: Context Optimization
1. Snellire 8→5 context layers
2. Unificare knowledge sources (Layer 5+8)
3. Remove redundancy report/handoff/eval

### Week 4: Micro-Research
1. Structured micro-research per mode
2. Auto-saving findings in context DB
3. Cross-reference con task queue per relevance

## METRICHE SUCCESSO

### Performance Orchestratore:
- **Budget utilization**: Target 70-85% (€14-17/mese)
- **Mode selection accuracy**: Decisions che migliorano composite score
- **Context efficiency**: Meno token prompt, stesso valore informativo
- **Research quality**: Micro-research findings che generano task implementabili

### Downstream Impact:
- **Composite score stability**: Meno oscillazioni, trend crescente
- **Task completion rate**: % task queue risolti in tempo
- **AI tools ROI**: Insight/Euro speso su DeepSeek/Gemini/Kimi

## RISCHI E MITIGAZIONI

### Complessità Logica
- **Risk**: Mode selection troppo complesso, hard to debug
- **Mitigation**: Extensive logging + fallback su rotation semplice

### Budget Overshoot  
- **Risk**: Logica dinamica aumenta troppo la spesa
- **Mitigation**: Hard cap €18/mese + alert €15

### Context Overload
- **Risk**: Anche 5 layer potrebbero essere troppi per Claude
- **Mitigation**: A/B test su context size vs output quality

---

**Conclusione**: L'orchestratore attuale è conservativo ma sottoutilizza risorse disponibili. Le proposte massimizzano valore/costo mantenendo robustezza del sistema.