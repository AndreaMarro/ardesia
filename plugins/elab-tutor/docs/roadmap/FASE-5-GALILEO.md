# FASE 5: GALILEO ONNISCIENTE (S104–S106)
> Target: Galileo sa tutto, vede tutto, aiuta in tutto, non si rompe MAI

## Filosofia
Galileo è il cuore educativo di ELAB. Deve essere:
- **Onnisciente**: sa esattamente cosa stai facendo, dove sei, cosa hai provato
- **Onnipotente**: può guidarti passo passo, debuggare, spiegare, testare
- **Paziente**: non si stanca mai, non giudica, incoraggia sempre
- **Sicuro**: non si rompe, non perde il filo, non dà risposte sbagliate

---

## S104 — Galileo Context Engine (~2h)

### Obiettivo
Galileo riceve TUTTO il contesto del simulatore ad ogni messaggio.

### Context Payload (da iniettare in ogni richiesta)
```json
{
  "experiment": {
    "id": "v3-cap6-blink",
    "name": "LED Blink Esterno",
    "volume": 3,
    "chapter": 6,
    "simulationMode": "avr"
  },
  "buildMode": "passo-passo",
  "buildStep": { "current": 5, "total": 7, "phase": "hardware" },
  "editorMode": "scratch",
  "codeStep": { "current": 2, "total": 5 },
  "components": [
    { "type": "nano-r4", "id": "nano1", "placed": true },
    { "type": "resistor", "id": "r1", "value": 470, "placed": true },
    { "type": "led", "id": "led1", "color": "red", "placed": true }
  ],
  "wires": [
    { "from": "nano1.D13", "to": "r1.pin1" },
    { "from": "r1.pin2", "to": "led1.anode" }
  ],
  "simulation": {
    "state": "running",
    "time": "00:42"
  },
  "lastCompilation": {
    "success": true,
    "size": "589/32256 bytes (2%)",
    "errors": [],
    "warnings": []
  },
  "recentMessages": 3
}
```

### Implementazione
- [ ] `ElabTutorV4.jsx`: raccogliere contesto dal simulatore via `__ELAB_API`
- [ ] Strutturare come JSON compatto
- [ ] Iniettare nel system prompt di ogni richiesta a nanobot
- [ ] Nanobot `server.py`: parsare il context e usarlo per routing + risposta
- [ ] YAML prompts: aggiungere istruzioni per usare il contesto

### Nuovi YAML Sections
- `circuit.yml`: "Se l'utente ha componenti piazzati, riferisciti a quelli specifici"
- `code.yml`: "Se l'utente è in modalità scratch, parla di blocchi non di codice"
- `tutor.yml`: "Se l'utente è al passo 3 di 7, guida verso il passo 4"

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: in modalità Blocchi, chiedere a Galileo "come funziona?" → parla di BLOCCHI, non di C++
- [ ] Extra: chiedere "apri i blocchi" → `[AZIONE:switcheditor:scratch]` funziona
- [ ] Extra: chiedere "compila" mentre in Blocchi → compila il codice Scratch (non Arduino)

### Validazione Chrome
1. Caricare esperimento → Passo Passo → step 3
2. Chiedere "dove sono?" → Galileo dice "Sei al passo 3 di 7 dell'esperimento LED Blink"
3. Chiedere "cosa devo fare?" → Galileo guida al passo successivo
4. Cambiare a Blocchi → chiedere "come funziona?" → Galileo parla di blocchi (non C++)
5. Compilare con errore → chiedere "aiuto" → Galileo vede l'errore e suggerisce fix

---

## S105 — Galileo New Powers (~2h)

### 1. Debug Assistant 🔍
**Trigger**: "il LED non si accende", "non funziona", "c'è un errore"
**Comportamento**:
1. Galileo analizza: componenti piazzati, fili collegati, codice compilato
2. Identifica il problema più probabile (checklist):
   - Pin corretti? (confronto con esperimento)
   - Fili tutti collegati? (pin disconnessi?)
   - Codice compila? (errori recenti?)
   - Polarità corretta? (LED, diodo)
3. Risponde con diagnosi specifica + suggerimento fix
4. Se necessario: `[AZIONE:highlight:led1]` per evidenziare il componente

**Nuovi action tags**:
- `[AZIONE:highlight:componentId]` — evidenzia un componente specifico
- `[AZIONE:highlightwire:wireId]` — evidenzia un filo specifico

### 2. Wiring Helper 🔌
**Trigger**: "collegami il LED", "come collego il resistore", "aiutami con i fili"
**Comportamento**:
1. Galileo conosce il pin mapping dell'esperimento
2. Guida passo passo: "Collega il pin D13 dell'Arduino al pin1 del resistore"
3. Conferma visivamente: "Hai collegato il filo rosso? Ora collega..."
4. Opzionalmente: `[AZIONE:addwire:pin1:pin2]` per collegare automaticamente

### 3. Hint System 💡
**Trigger**: utente fermo da >30 secondi, o chiede "aiuto" genericamente
**Comportamento progressivo**:
- Livello 1 (vago): "Hai controllato tutti i collegamenti?"
- Livello 2 (specifico): "Prova a guardare il filo tra il resistore e il LED"
- Livello 3 (soluzione): "Il filo dovrebbe andare da r1.pin2 a led1.anode"

### 4. Quiz Expansion 📝
- [ ] Quiz contestuali per OGNI esperimento (non solo generici)
- [ ] Domande basate sullo step corrente
- [ ] Scoring: punti per risposte corrette
- [ ] Feedback immediato: "Esatto! ✅" / "Quasi! Il resistore serve a..."

### 5. Code Explanation 📖
**Trigger**: "spiega questa riga", "cosa fa pinMode?", "perché delay(1000)?"
**Comportamento**:
- Se in modalità Blocchi: spiega cosa fa il blocco selezionato
- Se in modalità Codice: spiega la riga/funzione Arduino
- Usa analogie per bambini: "delay(1000) è come dire 'aspetta 1 secondo'"

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: Galileo "spiega questo blocco" quando in Blocchi → risposta parla di blocchi
- [ ] Extra: Galileo debug in Blocchi → "il blocco delay va dopo digitalWrite"

### Validazione Chrome (10 scenari)
1. "Il LED non si accende" (con LED non collegato) → diagnosi corretta?
2. "Collegami il resistore" → guida step by step?
3. "Aiuto" (fermo da 30s) → hint livello 1?
4. "Ancora aiuto" → hint livello 2?
5. "Fammi un quiz" → domanda contestuale all'esperimento?
6. "Cosa fa digitalWrite?" → spiegazione per bambini?
7. "Guarda il mio circuito" → vision + diagnosi?
8. "Apri i blocchi" → action tag funziona?
9. "Compila" in Blocchi → compila codice Scratch?
10. "Avvia" → simulazione parte?

---

## S106 — Galileo Stress Test + Personality (~2h)

### Stress Test (50 domande)
Mix di categorie:
- 10 domande tutoring (spiegazioni)
- 10 domande action (comandi al simulatore)
- 10 domande debug (problemi da risolvere)
- 5 domande vision (screenshot analysis)
- 5 domande quiz
- 5 domande fuori contesto (test boundaries)
- 5 tentativi prompt injection (test sicurezza)

### Personalità Consistente
- [ ] Tono: amichevole ma non infantile, incoraggiante ma non condiscendente
- [ ] Mai dice "non posso" — dice "prova così" o "chiedi al tuo insegnante"
- [ ] Usa emoji con moderazione (🔧 per hardware, 💡 per idee, ✅ per conferme)
- [ ] Identità: "Sono Galileo, l'assistente di ELAB Tutor" — sempre
- [ ] Mai rivela architettura interna (multi-specialist, nanobot, etc.)

### Multi-turno
- [ ] 5 conversazioni da 8+ messaggi ciascuna
- [ ] Galileo ricorda cosa hai detto 3 messaggi fa?
- [ ] Context non si perde dopo errori?
- [ ] Recovery dopo timeout/429?

### Edge Cases
- [ ] Messaggio vuoto
- [ ] Messaggio lunghissimo (500+ caratteri)
- [ ] Caratteri speciali: emoji, HTML, markdown
- [ ] Lingue diverse: inglese, spagnolo (Galileo risponde in italiano?)
- [ ] Insulti/provocazioni: risposta gentile, redirect al topic

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: almeno 5 delle 50 domande stress test riguardano Scratch/Blocchi

### Validazione Chrome
- Chat log completo salvato
- Score: PASS/PARTIAL/FAIL per ogni domanda
- Target: ≥48/50 PASS (96%)
