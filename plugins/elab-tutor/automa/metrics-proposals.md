# Proposte di Nuove Metriche — ELAB Tutor

**Data**: 2026-03-24
**Modo**: EVOLVE
**Analisi**: DeepSeek, Gemini, Kimi

## Problemi Identificati nel Sistema Attuale

### 1. Vulnerabilità al "Gaming"
- **build_pass**: Troppo facile da manipolare, basta soddisfare requisiti tecnici minimi
- **content_integrity**: Può essere aggirata con parafrasi superficiali  
- **galileo_identity**: Se misura solo conformità template, non valuta efficacia didattica

### 2. Aspetti Mancanti Critici
- **Accessibilità**: Nessuna metrica WCAG per studenti con disabilità (critico su LIM)
- **Coinvolgimento studenti**: Mancano metriche di interazione e attenzione
- **Supporto insegnante**: Nessuna valutazione di note didattiche, suggerimenti metodologici
- **Apprendimento insegnante**: Come l'insegnante inesperto migliora usando il sistema
- **Valutazione formativa**: Qualità di quiz ed esercizi auto-generati

### 3. Pesi Non Allineati (EdTech 2026)
- **galileo_tag_accuracy** (20%): Troppo alta per metadati vs impatto didattico
- **ipad_compliance** (15%): Troppo bassa considerando che è l'interfaccia primaria
- **lighthouse_perf** (15%): Sottovalutato per ambiente classe con 25+ studenti

## PROPOSTE PRIORITARIE

### FASE 1: Accessibilità e UX Core (implementare SUBITO)

#### A1. accessibility_wcag (Peso: 10%)
```python
def measure_accessibility():
    # Usa axe-core per scansione automatica
    # + test manuale su screen reader
    # + contrasto colori, navigazione keyboard
    return score_0_1
```
**Rationale**: GDPR compliance + inclusività studenti con disabilità
**Target**: ≥0.95 (AA standard WCAG)

#### A2. ipad_ux_quality (Peso: 20% ← da 15%)
```python  
def measure_ipad_ux():
    # Esistente: bottoni ≥56px, no overflow
    # NUOVO: gesture recognition, touch responsiveness
    # NUOVO: orientamento landscape/portrait
    return score_0_1
```
**Rationale**: LIM è interfaccia primaria, 25+ studenti la vedono
**Target**: ≥0.90

#### A3. performance_under_load (Peso: 20% ← da 15%)  
```python
def measure_performance_load():
    # Esistente: Lighthouse single user
    # NUOVO: simula 25 studenti contemporanei
    # NUOVO: latency da periferia italiana
    return score_0_1
```
**Rationale**: Classe = 25+ dispositivi, connessione spesso scarsa
**Target**: ≥0.85 con 25 utenti simultanei

### FASE 2: Qualità Didattica (implementare entro 2 settimane)

#### B1. teacher_empowerment (Peso: 15%)
```python
def measure_teacher_support():
    # Qualità delle note per insegnanti
    # Presenza di fallback quando Galileo non risponde
    # Suggerimenti metodologici evidence-based
    return score_0_1
```
**Rationale**: Insegnante inesperto deve sentirsi sicuro, non abbandonato
**Target**: ≥0.80

#### B2. misconception_detection (Peso: 10%)
```python  
def measure_misconception_handling():
    # Test automatico: errori comuni studenti
    # Galileo li riconosce e suggerisce intervento pedagogico?
    # Esempio: "LED al contrario" → non dire "sbagliato", 
    # ma "Cosa succede se proviamo a girarlo?"
    return score_0_1
```
**Rationale**: Il cuore della pedagogia è trasformare errori in apprendimento
**Target**: ≥0.85 su 20+ scenari comuni

#### B3. curriculum_alignment (Peso: 10%)
```python
def measure_curriculum_compliance():
    # Galileo rispetta il vocabolario progressivo?
    # Vol1-Cap6: NO "resistenza", Vol1-Cap8: SÌ "resistenza"  
    # Controllo automatico su termini proibiti per capitolo
    return score_0_1
```
**Rationale**: Fondamentale per apprendimento scaffoldato
**Target**: ≥0.95

### FASE 3: Engagement e Evoluzione (implementare entro 4 settimane)

#### C1. student_engagement_proxy (Peso: 5%)
```python
def measure_engagement_proxy():
    # Tempo medio sessione per esperimento
    # Rapporto simulazioni avviate/completate
    # Pattern di interazione (scroll, click, pausa)
    return score_0_1
```
**Rationale**: Proxy per coinvolgimento, senza privacy invasion
**Target**: ≥0.75

#### C2. galileo_teaching_quality (Peso: 15%)
```python
def measure_galileo_responses():
    # DeepSeek score su 10+ risposte casuali
    # Criteri: chiarezza, età-appropriatezza, correttezza
    # Sostituzione automatica di galileo_gulpease (limitato)
    return deepseek_average_score / 10
```
**Rationale**: Qualità effettiva vs proxy superficiale (gulpease)
**Target**: ≥0.80

## RICALIBRAZIONE PESI TOTALI

| Metrica | Peso Attuale | Peso Proposto | Rationale |
|---------|--------------|---------------|-----------|
| build_pass | 15% | 5% | Igienico ma non strategico |
| galileo_tag_accuracy | 20% | 15% | Importante ma non tutto |
| galileo_gulpease | 15% | 0% | RIMUOVI - sostituito da galileo_teaching_quality |
| galileo_identity | 10% | 5% | Merge con altri controlli |
| content_integrity | 10% | 5% | Automatizzabile, peso ridotto |
| accessibility_wcag | — | 10% | NUOVO - compliance critica |
| ipad_ux_quality | 15% | 20% | Interfaccia primaria |
| performance_under_load | 15% | 20% | Classe = carico reale |
| teacher_empowerment | — | 15% | NUOVO - utente primario |
| misconception_detection | — | 10% | NUOVO - pedagogia core |
| curriculum_alignment | — | 10% | NUOVO - apprendimento scaffoldato |
| student_engagement_proxy | — | 5% | NUOVO - feedback loop |
| galileo_teaching_quality | — | 15% | NUOVO - qualità effettiva |

**TOTALE**: 100% (bilanciato)

## IMPLEMENTAZIONE SUGGERITA

### Week 1 (CRITICO)
1. `accessibility_wcag` — compliance legale
2. Aumentare peso `ipad_ux_quality` e `performance_under_load`
3. Ridurre pesi metriche "facili" (build_pass, content_integrity)

### Week 2 (CORE PEDAGOGICO)  
1. `teacher_empowerment` — note e supporto insegnanti
2. `misconception_detection` — gestione errori come learning opportunity
3. `curriculum_alignment` — vocabolario progressivo

### Week 3-4 (RAFFINAMENTO)
1. `student_engagement_proxy` — feedback indiretto su coinvolgimento
2. `galileo_teaching_quality` — sostituzione gulpease con valutazione AI
3. Testing e tuning di tutte le nuove metriche

## RISCHI E MITIGAZIONI

### Gaming Resistance
- Metriche composite (accessibilità = axe + test manuali)
- Random sampling per valutazioni AI
- Cross-validation tra sistemi (DeepSeek score vs engagement metrics)

### Performance Impact  
- Alcune metriche (teacher_empowerment) calcolabili offline
- Cache risultati stabili (accessibility_wcag)
- Parallelizzazione test pesanti (performance_under_load)

### Complessità Implementazione
- FASE 1 usa tooling esistente (axe-core, Lighthouse)
- FASE 2 richiede curriculum YAML + prompt engineering
- FASE 3 può essere iterativa con A/B testing

## FASE 4: Voice Control (dal Ciclo 53)

#### D1. voice_control_success_rate (Peso: 5% futuro)
```python
def measure_voice_control():
    # % comandi vocali eseguiti correttamente / totale tentativi
    # Test: 20 comandi standard in italiano (play, reset, aggiungi LED...)
    # Threshold: confidence > 0.65 per Phase 1 (Web Speech API)
    return successful_commands / total_attempts
```
**Rationale**: Accessibilità + differenziatore vs competitor (nessuno ha voice)
**Target**: ≥0.80 su 20 comandi test
**Dipendenza**: Richiede implementazione Phase 1 (useVoiceCommand.js)
**Evidence**: RESEARCH-VOICE-NLU-PIPELINE-2026-03-24.md

---

## METRICHE FUTURE (VISION 2027+)

- **teacher_learning_curve**: L'insegnante migliora nel tempo?
- **class_outcome_correlation**: Impatto su voti reali studenti
- **multimodal_accessibility**: Support per studenti non-vedenti/non-udenti
- **ai_hallucination_detection**: Galileo dice cose sbagliate?
- **cultural_localization**: Adattamento per diverse regioni Italia

---

**Conclusione**: Il sistema attuale è troppo focalizzato su metriche "igieniche" e poco su impatto didattico reale. Le proposte bilanciano compliance tecnica con efficacia pedagogica, allineandosi ai trend EdTech 2026 identificati da Gemini e alle best practice architetturali suggerite da Kimi.