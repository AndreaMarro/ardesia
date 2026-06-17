# Multi-Galileo Onnisciente — Design Document
## Session 58 — 28/02/2026

### Overview
Evoluzione dell'architettura AI di ELAB Tutor da un singolo nanobot monolitico (1 prompt da 280 righe) a un sistema multi-agente con orchestratore intelligente, 4 specialisti, e apprendimento a 2 livelli.

### Motivazione
1. Un prompt da 280 righe e' troppo lungo — il modello perde focus
2. Galileo non impara dalle interazioni — ogni sessione riparte da zero
3. La visione (screenshot) e' un afterthought, non una capacita' nativa
4. Errori comuni degli studenti non vengono anticipati
5. Il routing e' statico — non si adatta al contesto

---

## Architettura: Approccio B (Hybrid Router)

### Principio
- 70% dei messaggi: routing keyword diretto (~1ms)
- 30% ambigui: Groq flash classify (~300ms)
- Risposta: specialista focalizzato con prompt corto (~60-80 righe)
- Post-risposta: apprendimento async (0ms per l'utente)

### Flusso

```
Frontend (ElabTutorV4.jsx)
  |  Invia SEMPRE: message + pageContext + screenshot(auto) + sessionId
  v
Orchestratore (server.py)
  |
  |-- FASE 1: CAPIRE (~1-300ms)
  |   |-- Che pagina? (tab=simulator/manual/canvas/...)
  |   |-- C'e' screenshot? → flag vision=true
  |   |-- Classify intent (keyword ~1ms, Groq se ambiguo ~300ms)
  |   '-- Serve visione? ("guarda","vedi","screen", image presente)
  |
  |-- FASE 2: ARRICCHIRE (~10ms)
  |   |-- Memoria individuale (errori, esperimenti, livello)
  |   |-- Pattern collettivi (errori comuni per questo esperimento)
  |   |-- Contesto pagina (componenti, fili, posizioni, codice)
  |   '-- Storia conversazione (ultime 3 coppie)
  |
  |-- FASE 3: ROUTING
  |   |-- circuit + vision? → Circuiti + Gemini Vision
  |   |-- circuit no vision? → Circuiti (DeepSeek)
  |   |-- code? → Codice (DeepSeek)
  |   |-- vision senza circuito? → Vision puro (Gemini)
  |   '-- tutto il resto? → Tutor (DeepSeek)
  |
  '-- FASE 4: IMPARARE (async, post-risposta)
      |-- Estrai segnali: errore? successo? confusione?
      |-- Aggiorna memoria individuale
      '-- Aggiorna pattern collettivi
```

---

## 5 Agenti

### 1. Orchestratore (cervello)
- **Endpoint**: `/tutor-chat` (entry point)
- **Prompt AI**: Nessuno (keyword) o ~15 righe (Groq flash)
- **Ruolo**: Classifica, arricchisce, ruota, impara
- **NON** risponde MAI allo studente direttamente

### 2. Specialista Circuiti
- **Prompt**: `prompts/circuit.yml` (~60 righe)
- **Modello**: DeepSeek + Gemini racing
- **SA fare**: Diagnosi, cablaggio, pin, polarita', KVL/KCL, errori hardware
- **NON fa**: Codice Arduino, teoria lunga, navigazione

### 3. Specialista Codice
- **Prompt**: `prompts/code.yml` (~60 righe)
- **Modello**: DeepSeek + Groq racing
- **SA fare**: Arduino debug, errori GCC, Serial, sintassi, suggerimenti codice
- **NON fa**: Diagnosi circuito fisico, quiz

### 4. Specialista Tutor
- **Prompt**: `prompts/tutor.yml` (~80 righe)
- **Modello**: DeepSeek + Groq racing
- **SA fare**: Teoria, quiz, navigazione, giochi, esperimenti, off-topic, pedagogia
- **NON fa**: Diagnosi profonda (delega), debug codice

### 5. Specialista Vision
- **Prompt**: `prompts/vision.yml` (~30 righe)
- **Modello**: Gemini only (unico con vision)
- **SA fare**: Descrivere screenshot, analizzare lavagna, leggere manuale, confrontare schema
- **NON fa**: Non agisce — descrive e passa info allo specialista di dominio
- **Combinabile**: Vision + Circuiti, Vision + Codice

### 6. Assistente Sito (separato)
- **Endpoint**: `/site-chat` (invariato)
- **Prompt**: `site-prompt.yml` (~50 righe)
- **SA fare**: FAQ, info prodotto, supporto pre-vendita
- **ZERO** tag [AZIONE:], ZERO tutoring, ZERO manipolazione simulatore

---

## Sistema di Apprendimento

### Livello 1: Memoria Individuale (per studente)

**Storage**: localStorage (FE immediato) + session file backend (persistente)

| Campo | Fonte | Esempio |
|-------|-------|---------|
| Esperimenti completati | FE trackExperimentCompletion() | `v1-cap6-esp1: {attempts:3, result:"success"}` |
| Quiz risultati | FE trackQuizResult() | `v1-cap6-esp1: {correct:1, total:2, pct:50}` |
| Errori frequenti | BE (estratti da diagnosi) | `[{cat:"polarita", count:5}]` |
| Livello stimato | BE (calcolato) | `"principiante"/"intermedio"/"avanzato"` |
| Sessioni passate | BE | `[{summary:"LED e resistori", date:"..."}]` |
| Stile preferito | BE (dedotto) | `"socratico"/"diretto"` |

**Iniezione nel contesto** (esempio):
```
[STUDENTE: sessione tutor-1234 — Livello intermedio]
Esperimenti: 12/69 completati. Ultimi: v1-cap8-esp3, v1-cap9-esp1
Quiz: 8/14 corretti (57%). Deboli: v1-cap7 (RGB), v1-cap9 (potenziometro)
Errori ricorrenti: polarita(x5), resistenza-mancante(x3)
Sessione precedente: "Stava facendo il dimmer LED, bloccato al passo 4"
```

### Livello 2: Pattern Collettivi (tutti gli studenti)

**Storage**: `patterns.json` sul backend (aggiornato async)

```json
{
  "version": 1,
  "experiments": {
    "v1-cap6-esp1": {
      "totalAttempts": 142,
      "successRate": 0.73,
      "topErrors": [
        {"cat": "polarita", "pct": 0.45},
        {"cat": "resistenza-mancante", "pct": 0.22}
      ]
    }
  },
  "globalMisconceptions": [
    {"concept": "corrente da + a -", "frequency": 87},
    {"concept": "LED senza resistore", "frequency": 64}
  ]
}
```

**Iniezione nel contesto** (esempio):
```
[PATTERN — esp. v1-cap6-esp1]
Successo: 73%. Errore #1: 45% sbaglia polarita LED. Errore #2: 22% dimentica resistore.
```

### Stima Livello Studente

```python
def estimate_level(profile):
    exp_count = len(profile.get("experiments", {}))
    quiz_avg = avg_quiz_percentage(profile)
    if exp_count < 5 or quiz_avg < 40: return "principiante"
    elif exp_count < 25 or quiz_avg < 70: return "intermedio"
    else: return "avanzato"
```

Effetto sul comportamento:
- **Principiante**: analogie semplici, passi piccoli, incoraggiamento
- **Intermedio**: meno mano, domande socratiche
- **Avanzato**: sfide, approfondimenti

### Ciclo di Apprendimento (FASE 4, async)

```
Risposta inviata allo studente
  |
  '-- async (non blocca):
      |-- LED bruciato dopo risposta? → trackMistake("corrente-alta")
      |-- Studente dice "non capisco"? → trackMistake("confusione", topic)
      |-- Quiz completato? → trackQuizResult(espId, correct, total)
      |-- Esperimento completato? → trackExperimentCompletion(espId)
      |-- Stessa domanda 3+ volte? → flag "studente bloccato"
      |
      |-- UPDATE individuale: session file
      '-- UPDATE collettivo: patterns.json contatori++
```

---

## Auto-Screenshot (Vision Trigger)

Non ad ogni messaggio. Trigger automatici:

| Trigger | Condizione | Azione frontend |
|---------|-----------|-----------------|
| Parole visive | "cosa vedi?", "guarda", "screen" | Canvas capture → base64 → invia |
| Errore circuito | burnout, short-circuit event | Screenshot auto per diagnosi |
| Utente invia foto | Pulsante fotocamera | Gia' implementato |
| Cambio esperimento | loadExperiment() | Screenshot iniziale (1s delay) |
| Tab lavagna/canvas | tab === "canvas" | Auto (canvas non ha dati strutturati) |

---

## File Modificati

### Backend (nanobot/)
| File | Modifica |
|------|----------|
| `server.py` | Orchestratore FASE 1-4, routing specialisti, learning async |
| `prompts/circuit.yml` | NUOVO — prompt Circuiti (~60 righe) |
| `prompts/code.yml` | NUOVO — prompt Codice (~60 righe) |
| `prompts/tutor.yml` | NUOVO — prompt Tutor (~80 righe) |
| `prompts/vision.yml` | NUOVO — prompt Vision (~30 righe) |
| `memory.py` | NUOVO — gestione memoria individuale + collettiva |
| `patterns.json` | NUOVO — pattern collettivi (cresce nel tempo) |
| `nanobot.yml` | Rimane come catalogo esperimenti + config |
| `site-prompt.yml` | Invariato |

### Frontend (src/)
| File | Modifica |
|------|----------|
| `ElabTutorV4.jsx` | Auto-screenshot trigger, pageContext arricchito, sync memoria |
| `galileoMemory.js` | Sync bidirezionale con backend |
| `api.js` | Payload arricchito, nuovo campo screenshot |

---

## Vincoli e Paletti

1. **Stesso server Render** — $7/mese, nessun costo aggiuntivo
2. **Specialisti non comunicano tra loro** — solo l'orchestratore coordina
3. **Vision non agisce** — descrive e basta, lo specialista di dominio agisce
4. **Sito completamente separato** — zero overlap con tutor
5. **patterns.json < 1MB** — purgato automaticamente se troppo grande
6. **Session files TTL 24h** — pulizia automatica
7. **Max 20 messaggi per sessione** — invariato
8. **Screenshot max 1.5MB** — compresso lato frontend
9. **Async learning non blocca MAI la risposta** — FASE 4 e' fire-and-forget
10. **Fallback**: se uno specialista fallisce, Tutor gestisce tutto (graceful degradation)
