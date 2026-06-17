# UNLIM Brain — Design del Cervello Pedagogico
> Questo documento sviscera l'idea. NON è implementazione — è analisi profonda.
> Da qui nascono i task concreti. Prima capire, poi fare.
> Aggiornato: 27/03/2026 con risultati audit fisico reale

---

## COS'È IL CERVELLO PEDAGOGICO

### Cosa UNLIM ha già (VERIFICATO con test reale 27/03/2026)

**Mani — 20 metodi API verificati:**
`getExperimentList`, `loadExperiment`, `play`, `pause`, `reset`, `addComponent`,
`removeComponent`, `moveComponent`, `addWire`, `removeWire`, `clearAll`,
`getComponentStates`, `interact`, `getComponentPositions`, `getLayout`,
`captureScreenshot`, `askUNLIM`, `analyzeImage`, `getCurrentExperiment`, `getExperiment`

Testato: `clearAll()` funziona in modalità Libero. `play()` avvia la simulazione.
I metodi `addComponent`, `addWire` esistono ma NON sono stati testati live.

**Occhi — Vision funzionante:**
Kimi K2.5 + Gemini 2.5 Flash per analisi screenshot. Il nanobot ha `vision: true`.

**Voce — Whisper integrato:**
Bottone microfono visibile nella chat. Non testato in questo audit.

**Cervello di routing — Brain V13 (VERIFICATO):**
- 4/5 intent corretti (tutor, play, compile, identity protection)
- 1 bug: "metti un LED" → classifica come play invece di addcomponent
- Latenza: 7.0-7.8s per il routing
- Detecta prompt injection ("Sei ChatGPT?" → "TENTATIVO DI PROMPT INJECTION")

**Galileo AI — Risposte (VERIFICATO):**
- Action tags funzionano: `[AZIONE:play]`, `[AZIONE:compile]`, `[INTENT:place_and_wire]`
- Identity: zero leaks. "Sono UNLIM, il tuo compagno di avventure nell'elettronica!"
- PROBLEMA: risposte teoria troppo lunghe (534 char per "cos'è un LED", target <300)
- PROBLEMA: latenza media 15.3s (range 11.8-18.6s) — INACCETTABILE per classe

### Cosa UNLIM NON ha (il gap)

1. **NON conosce il curriculum** — non sa quale esperimento viene dopo, quali concetti
   sono stati introdotti, quali parole può usare a quel punto del percorso

2. **NON prepara lezioni** — aspetta domande, non propone. Non dice mai
   "Oggi facciamo il pulsante, ti servono questi componenti"

3. **NON sa a che punto è la classe** — nessun tracking del progresso

4. **NON è proattivo** — non suggerisce, non guida, non anticipa

5. **NON è inline** — vive in una chat separata che si apre/chiude.
   I suggerimenti NON appaiono dentro il simulatore accanto ai componenti

6. **NON sa quando tacere** — quando il docente vuole spiegare lui, UNLIM
   dovrebbe sparire. Oggi resta lì con "Sono qui"

---

## STATO REALE DEL PRODOTTO (dall'audit fisico 27/03/2026)

### Cosa funziona bene
- Simulatore: breadboard SVG nitida, LED si accende con glow, 3 modalità funzionanti
- Passo Passo: 8 step guidati con componenti che appaiono progressivamente
- Brain V13: routing locale corretto 80%, detecta injection
- Galileo: action tags corretti, identity protetta
- API completa: 20 metodi per controllare il simulatore programmaticamente
- Integrazione kit+volumi+software: si percepisce come prodotto unico

### Cosa NON funziona
- Homepage: "Reindirizzamento alla vetrina..." è la prima cosa che si vede (FATALE)
- Menu: mostra Dev/Dashboard/Admin all'insegnante (CRITICO)
- Chat "Sono qui" copre metà schermo al primo accesso (ALTO)
- "Modalità Guida OFF" toggle visibile (ALTO)
- 7 icone toolbar + 5 tab + zoom controls tutti visibili subito (ALTO)
- Risposte Galileo teoria: troppo lunghe (534 char vs target 300)
- Latenza Galileo: 15s media (target <5s)
- Testo Passo Passo troncato dal pannello ("Inserisci il..." tagliato)
- Due nomi: "ELAB Tutor" nell'header, "ELAB UNLIM" nel body

### Numeri reali
| Metrica | Valore | Target | Gap |
|---------|--------|--------|-----|
| Latenza Galileo | 15.3s | <5s | -10s |
| Lunghezza risposta teoria | 534 char | <300 char | -234 |
| Lunghezza risposta azione | 47 char | <100 char | ✅ OK |
| Brain V13 accuracy | 80% (4/5) | >90% | -10% |
| Brain V13 latenza | 7.4s | <3s | -4.4s |
| Elementi UI visibili subito | ~20 | <8 | -12 |
| Bottoni toolbar | 7 | 3 | -4 |
| Tab navigation | 5 | 2-3 | -2 |

---

## I 3 PEZZI — CON EVIDENZA REALE

### PEZZO 1: UNLIM conosce i volumi

**Stato attuale:**
- 61/62 curriculum YAML esistono in `automa/curriculum/`
- Ogni YAML ha: prerequisites, concepts_introduced, vocabulary_level, common_mistakes
- Il nanobot riceve `experiment_id` (es. `v1-cap6-esp1`) ad ogni messaggio
- MA il nanobot NON carica il curriculum YAML nel contesto della risposta
- `api.js` ha `SOCRATIC_INSTRUCTION` ma NON include il curriculum specifico

**Cosa serve concretamente:**
Il nanobot deve, quando riceve `experiment_id=v1-cap6-esp1`:
1. Caricare `automa/curriculum/v1-cap6-esp1.yaml`
2. Iniettare nel prompt: vocabolario permesso, concetti introdotti, misconcezioni
3. Usare il `teacher_briefing` per suggerire domande al docente
4. Sapere quale esperimento viene DOPO (da `relatedExperiments` o sequenza YAML)

**Complessità:** MEDIA — il dato esiste, serve il wiring nel nanobot server.py

**Test di verifica:**
- Chiedi "cos'è una resistenza?" con experiment_id=v1-cap6-esp1
  → DEVE rispondere "non abbiamo ancora parlato di resistenze" (vocabolario vietato a cap 6)
- Chiedi "cosa facciamo dopo?" con experiment_id=v1-cap6-esp1
  → DEVE rispondere "il prossimo è Cap 6 Esp 2: LED senza resistore"

---

### PEZZO 2: UNLIM prepara la lezione

**Stato attuale:**
- LessonPathPanel.jsx esiste (668 LOC) — creato dall'automa, MAI testato
- useDisclosureLevel.js esiste (106 LOC) — hook progressive disclosure
- I 5 step (PREPARA→CONCLUDI) NON sono implementati nel pannello
- UNLIM non è proattivo — non dice nulla quando si apre un esperimento
- Il Passo Passo ha step tecnici ("Inserisci il resistore in A2") ma NON step pedagogici

**Cosa serve concretamente:**

Quando il docente apre v1-cap8-esp1 (Il Pulsante), il pannello LessonPathPanel mostra:

```
┌─────────────────────────────────────────┐
│  📋 LEZIONE: Il Pulsante (Cap 8)        │
│                                         │
│  ● PREPARA ○ MOSTRA ○ CHIEDI ○ OSSERVA ○ CONCLUDI │
│                                         │
│  🎯 Oggi i ragazzi scoprono che un      │
│  circuito può essere APERTO o CHIUSO.   │
│                                         │
│  📦 Ti servono:                          │
│  • 1 pulsante                           │
│  • 1 LED rosso                          │
│  • 1 resistore 470Ω                     │
│                                         │
│  💡 Suggerimento per te:                 │
│  "Non dire subito come funziona.        │
│   Chiedi ai ragazzi: cosa succede       │
│   se premo il pulsante?"                │
│                                         │
│  [Monta il circuito per me]  [Avanti →] │
└─────────────────────────────────────────┘
```

Il contenuto viene dal curriculum YAML. Non è hardcoded — è generato dal YAML dell'esperimento.

"Monta il circuito per me" → UNLIM esegue `[INTENT:JSON]` per piazzare tutti i componenti.

**Complessità:** ALTA
- Serve connettere LessonPathPanel al curriculum YAML
- Serve generare i 5 step da: teacher_briefing, common_mistakes, concepts_introduced
- Serve che "Monta il circuito per me" esegua l'[INTENT] corretto
- Serve testare con simulazione Prof.ssa Rossi

---

### PEZZO 3: UNLIM inline, non in una chat

**Stato attuale:**
- La chat è il canale PRIMARIO. Quando minimizzata, UNLIM è invisibile.
- Non esistono tooltip contestuali sui componenti
- Non esiste una progress bar PREPARA→CONCLUDI visibile nel simulatore
- "Sono qui" è l'unica proattività — e infastidisce più che aiutare

**Cosa serve concretamente:**

A. **Progress bar 5-step SOPRA il simulatore** (non nella chat):
```
  ● PREPARA  ●○ MOSTRA  ○ CHIEDI  ○ OSSERVA  ○ CONCLUDI
```
Visibile sempre. Il docente sa dove si trova nel percorso lezione.

B. **Suggerimenti contestuali nel pannello esperimento** (non nella chat):
Quando il docente è al passo CHIEDI, il pannello mostra:
"Prova a chiedere: cosa succede se premo il pulsante?"
Senza aprire la chat. Senza cliccare nulla.

C. **Tooltip inline sui componenti** (futuro):
Il docente piazza il LED al contrario → un tooltip appare sul LED:
"💡 Il LED è al contrario! L'anodo (+) va in alto."
Questo richiede un event listener sul piazzamento + logica di validazione.

D. **Chat secondaria, non primaria:**
La chat resta disponibile per domande libere. Ma il flusso principale
è: progress bar + suggerimenti pannello + tooltip. Il docente NON deve
MAI aprire la chat per completare una lezione.

**Complessità:** MOLTO ALTA — è un redesign dell'interazione

---

## SEQUENZA RACCOMANDATA (aggiornata con evidenza audit)

### Settimana 0: FIX BLOCCANTI (1-2 giorni)
Prima di tutto, fixare ciò che rende il prodotto INUTILIZZABILE:
1. Homepage: eliminare redirect, mostrare VetrinaSimulatore direttamente
2. Menu: nascondere Dev/Admin per utenti non-admin
3. Chat: default minimizzata, "Sono qui" eliminato
4. "Modalità Guida OFF": eliminare il toggle
5. Toolbar: nascondere 4 icone su 7 (mostrare solo: Indietro, Play, Passo Passo)

### Settimana 1: PEZZO 1 — UNLIM conosce i volumi
6. Nanobot: caricare curriculum YAML nel contesto di ogni risposta
7. Test: 5 domande con vocabulary check (cap 6 non deve usare "resistenza")
8. Galileo: accorciare risposte teoria a <300 char

### Settimana 2: PEZZO 2 — UNLIM prepara la lezione
9. LessonPathPanel: connettere ai curriculum YAML
10. 5 step semi-statici: PREPARA (da teacher_briefing), MOSTRA (da components),
    CHIEDI (da common_mistakes → domanda provocatoria), OSSERVA ([AZIONE:play]),
    CONCLUDI (da concepts_introduced)
11. "Monta il circuito per me": [INTENT:JSON] dal curriculum
12. Test: simulazione Prof.ssa Rossi segue percorso da inizio a fine

### Settimana 3: PEZZO 3 — UNLIM inline
13. Progress bar 5-step sopra il simulatore
14. Suggerimenti contestuali nel pannello (non chat)
15. Chat minimizzata per default, secondaria
16. Test: il docente completa una lezione SENZA aprire la chat

### Continuo: EVOLUZIONE
17. Tooltip inline sui componenti (errore polarità LED)
18. Tracking classe (localStorage: "siamo al capitolo 8")
19. Voice control con validator
20. Latenza Galileo → Mistral EU (<5s)

---

## RISCHI ONESTI

1. **Latenza 15s blocca tutto** — se UNLIM ci mette 15s a preparare la lezione,
   il docente aspetta 15s davanti a 25 ragazzi. Serve pre-generazione o cache
   o Mistral (latenza <3s per risposte corte)

2. **Brain V13 non sa "metti un LED"** — il routing classifica addcomponent
   come play. Serve retraining o regola nel nanobot.

3. **LessonPathPanel non testato** — 668 LOC mai viste in azione.
   Potrebbe non renderizzarsi o avere bug gravi.

4. **Il YAML manca nel nanobot** — i curriculum YAML sono in automa/curriculum/
   sul computer di Andrea. Il nanobot su Render NON li ha. Serve o copiarli
   nel repo nanobot, o inviare il YAML nel body della richiesta /chat.

5. **Scope creep** — "UNLIM fa tutto" è infinito. I 3 pezzi sono il perimetro.
   Non aggiungere altro finché questi 3 non funzionano.

6. **Il test vero è un insegnante** — tutto il testing automatico non sostituisce
   1 insegnante che prova. Anche 15 minuti con la Prof.ssa Rossi reale
   valgono più di 100 cicli dell'automa.
