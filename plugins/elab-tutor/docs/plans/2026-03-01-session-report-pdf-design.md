# Design: PDF Report Sessione ELAB

**Data**: 2026-03-01
**Stato**: Approvato
**Target**: Studenti medie/superiori + insegnanti

---

## Principi Fondamentali

1. **Racconta una storia** — Il report NON e' una lista di dati. E' il racconto di un'avventura scientifica: "Oggi hai esplorato... hai costruito... hai scoperto che...". Ogni sessione ha un senso, anche quelle andate male. Un circuito che non funziona insegna tanto quanto uno che funziona.
2. **Solo fatti reali** — Il racconto si basa ESCLUSIVAMENTE su quello che lo studente ha fatto. Zero invenzioni, zero abbellimenti. Ma ogni fatto viene contestualizzato e gli viene dato significato educativo.
3. **Linguaggio semplice** — Frasi corte, analogie con oggetti quotidiani. Target: ragazzo 13 anni. "Il resistore rallenta la corrente, come un rubinetto controlla l'acqua."
4. **Un pulsante** — Click singolo nella toolbar del simulatore, PDF scaricato in automatico.
5. **Stile ELAB** — Palette ufficiale, font Oswald/Open Sans, mascotte Galileo, watermark.
6. **Anche le difficolta' hanno valore** — Se il circuito non ha funzionato, il report spiega PERCHE' e' comunque un passo avanti. "Hai sbagliato la polarita'? Ora sai che il verso conta — come le pile nella torcia!"

---

## Architettura

### Stack
- **Frontend**: `@react-pdf/renderer` (già installato, code-split on-demand)
- **Screenshot**: `exportPng.js` esistente (SVG → canvas → PNG base64, 2x retina)
- **AI Summary**: nanobot `/tutor-chat` con prompt dedicato → fallback template locale
- **Dati**: React state (messages, activeExperiment, circuitState) + localStorage (quiz scores, game stars)

### Flusso

```
[Click pulsante "Report PDF" nella toolbar]
  1. Cattura screenshot canvas → base64 PNG (exportPng.js)
  2. Raccoglie dati sessione:
     - messages[] dal state di ElabTutorV4
     - activeExperiment (metadata, quiz, description)
     - circuitState dal ref
     - quizResults dal QuizPanel state
     - code + compilationStatus (se AVR)
     - gameScore da localStorage
     - sessionDuration da sessionStartRef
  3. Chiama nanobot con prompt "riassumi sessione" + dati reali
     → timeout 8 sec → fallback template locale
  4. Genera PDF con @react-pdf/renderer
  5. Download automatico: "ELAB-Report-{esperimento}-{data}.pdf"
```

### Vincolo critico: NO INVENZIONI
Il prompt nanobot riceve SOLO dati reali della sessione:
- Lista esperimenti tentati (con esito)
- Errori effettivamente commessi
- Risposte quiz effettive
- Messaggi chat reali

Il prompt istruisce esplicitamente: "Riassumi SOLO quello che è successo. NON inventare attività, risultati o concetti non presenti nei dati."

---

## Struttura PDF (6-8 pagine)

### Pagina 1 — Cover
- Barra superiore navy `#1E4D8C`
- Titolo: **"La tua avventura con [nome esperimento]"**
- Sottotitolo: Capitolo + Volume (colore volume)
- Data e durata sessione
- Mascotte Galileo (`galileo-excited.png` embedded base64)
- Watermark footer: `Andrea Marro — DD/MM/YYYY`

### Pagina 2 — La Missione di Oggi
- Titolo esperimento + descrizione (dal campo experiment.description)
- Difficolta (stelle visuali)
- **"I tuoi strumenti"**: lista componenti usati (nomi italiani)
- Box narrativo: "Oggi la sfida era [obiettivo]. Per riuscirci servivano [componenti]."
- Analogia del concetto fisico (mappatura experiment.id → analogia locale)
  - Es: "Un LED funziona come una porta girevole: la corrente passa solo in una direzione"

### Pagina 3 — Il Tuo Circuito
- Screenshot PNG del circuito (catturato al momento del click, 2x retina)
- Racconto contestuale basato sullo stato REALE:
  - Se funzionante: "Ce l'hai fatta! Ogni componente al suo posto, ogni filo collegato. Il circuito funziona."
  - Se incompleto: "Il circuito non era ancora finito — ma guarda quanta strada hai fatto! Hai posizionato [N] componenti su [M]."
  - Se errori (cortocircuito, polarita): "Hai incontrato un ostacolo: [tipo errore]. E' come [analogia]. La prossima volta saprai evitarlo!"

### Pagina 4 — Il Codice (solo esperimenti AVR/Vol3, skip se assente)
- Codice Arduino in monospace (Fira Code 9pt, sfondo #F5F5F5)
- Racconto: "Hai scritto [N] righe di codice per controllare il tuo circuito."
- Se compilato ok: "Il compilatore ha detto: tutto a posto!"
- Se errori: spiegazione semplice (da errorTranslator) + "Non preoccuparti, anche i programmatori esperti fanno errori — il bello e' capire perche'."
- Condizionale: questa pagina esiste SOLO se l'esperimento ha codice

### Pagina 5 — La Tua Conversazione con Galileo
- Trascrizione chat REALE (max 20 messaggi, i piu' significativi)
- Formato: icona ruolo + nome + messaggio
  - Galileo: bolla navy, icona mascotte
  - Studente: bolla grigia chiara, icona utente
- Intro narrativa: "Durante la sessione hai fatto [N] domande a Galileo. Ecco i momenti chiave:"
- Se pochi messaggi (<3): "Hai preferito esplorare da solo — segno di sicurezza!"
- Selezione intelligente: primo messaggio, domande, momenti di errore, ultimo messaggio

### Pagina 6 — La Sfida del Quiz
- Intro: "Dopo aver lavorato sul circuito, hai messo alla prova quello che hai imparato."
- Per ogni domanda (2 per esperimento):
  - Testo domanda
  - Risposta dello studente evidenziata (verde se giusta, arancione se sbagliata)
  - Risposta corretta
  - Spiegazione con analogia
- Score con stelle (1-3)
- Se 2/2: "Perfetto! Hai capito tutto al primo colpo."
- Se 1/2: "Una su due — ci sei quasi! Rileggi la spiegazione della domanda sbagliata."
- Se 0/2: "Questa volta non e' andata — ma ora hai le spiegazioni per capire meglio."
- Se quiz non fatto: "Non hai ancora provato il quiz — la prossima volta sara' il momento!"

### Pagina 7 — Il Senso della Tua Avventura (AI-generated con fallback)
- Racconto educativo da nanobot (o template locale)
- BASATO SOLO sui dati reali della sessione
- Formato narrativo: 3-5 frasi che danno SIGNIFICATO a quello che e' successo
  - "Oggi hai scoperto che senza un resistore il LED si brucia — come una lampadina troppo potente per un portalampada piccolo"
  - "Hai provato a invertire i fili e il LED non si accendeva — ora sai che la polarita' conta, come le pile nella torcia"
- **"Il prossimo passo"**: basato su progressione reale, non inventato
- Tono: narrativo, incoraggiante, onesto. Ogni sessione ha un senso.

### Footer (ogni pagina)
- Numero pagina (es: "Pagina 3 di 7")
- Barra colorata sottile (colore del volume)
- Watermark: `Andrea Marro — DD/MM/YYYY` (data dinamica)

---

## Stile Visivo

### Colori
| Elemento | Colore | Uso |
|----------|--------|-----|
| Header bar | `#1E4D8C` (Navy) | Barra superiore ogni pagina |
| Volume 1 | `#7CB342` (Lime) | Accenti, barra footer |
| Volume 2 | `#E8941C` (Orange) | Accenti, barra footer |
| Volume 3 | `#E54B3D` (Red) | Accenti, barra footer |
| Successo | `#4CAF50` | Box circuito ok, quiz corretto |
| Errore/Attenzione | `#FF9800` | Box circuito ko, quiz sbagliato |
| Sfondo codice | `#F5F5F5` | Area codice Arduino |
| Testo corpo | `#333333` | Body text |
| Testo secondario | `#666666` | Didascalie, note |

### Tipografia
| Uso | Font | Size |
|-----|------|------|
| Titoli pagina | Oswald Bold | 24pt |
| Sottotitoli | Oswald Regular | 16pt |
| Body text | Open Sans Regular | 10pt |
| Codice | Fira Code Regular | 9pt |
| Didascalie | Open Sans Italic | 9pt |
| Watermark | Open Sans Light | 8pt |

### Immagini Embedded (base64)
- `galileo-excited.png` — Cover page
- `galileo-thinking.png` — Pagina "Cosa Hai Imparato"
- Screenshot circuito — Catturato al click
- Stelle rating — SVG inline

---

## Prompt Nanobot per Summary AI

```
Sei Galileo, il tutor AI di ELAB. Racconta la sessione dello studente come
una breve avventura scientifica per un report PDF (target: medie/superiori).

REGOLE TASSATIVE:
- Racconta SOLO quello che è successo. NON inventare attivita', risultati o concetti non presenti nei dati.
- Dai un SENSO a tutto: anche un errore e' una scoperta. "Hai provato a collegare il LED al contrario — ora sai che la polarita' conta!"
- Usa linguaggio narrativo: "Oggi hai esplorato...", "Hai scoperto che...", "La sfida e' stata..."
- Analogie quotidiane (acqua, porte, torce, tubi, strade).
- Max 5 frasi per il racconto.
- Max 2 frasi per il "prossimo passo".
- Tono: incoraggiante ma onesto. MAI inventare successi non avvenuti.
- Se la sessione e' andata male, trova comunque il valore: "Non hai completato il circuito, ma hai imparato dove vanno i componenti — la prossima volta partirai avvantaggiato!"

DATI SESSIONE:
- Esperimento: {experimentTitle}
- Circuito completato: {circuitComplete ? "Sì" : "No"}
- Quiz: {quizScore}/2 ({quizScore === 2 ? "Tutto giusto!" : quizScore === 1 ? "Una su due" : "Da rivedere"})
- Errori nel chat: {errorsList}
- Durata: {duration} minuti
- Messaggi scambiati: {messageCount}

Rispondi in formato JSON:
{
  "riassunto": ["frase 1", "frase 2", ...],
  "prossimoPassoSuggerito": "frase",
  "concettiToccati": ["concetto 1", "concetto 2"]
}
```

---

## Fallback Template Locale

Se nanobot non risponde entro 8 sec o fallisce:

```javascript
function generateLocalSummary(sessionData) {
  const { experiment, quizScore, circuitComplete, duration } = sessionData;

  const riassunto = [];
  riassunto.push(`Hai lavorato sull'esperimento "${experiment.title}" per ${duration} minuti.`);

  if (circuitComplete) {
    riassunto.push("Hai completato il circuito correttamente — ottimo lavoro!");
  } else {
    riassunto.push("Il circuito non era ancora completo — ci riproverai la prossima volta!");
  }

  if (quizScore === 2) riassunto.push("Hai risposto correttamente a entrambe le domande del quiz!");
  else if (quizScore === 1) riassunto.push("Una risposta giusta su due nel quiz — quasi perfetto!");
  else if (quizScore === 0) riassunto.push("Il quiz non e' andato benissimo — rileggi la spiegazione!");
  else riassunto.push("Non hai ancora provato il quiz — provalo!");

  return { riassunto, prossimoPassoSuggerito: getNextExperiment(experiment.id) };
}
```

---

## Integrazione nel Simulatore

### Pulsante
- Posizione: toolbar di `NewElabSimulator.jsx`, accanto a export PNG
- Icona: documento PDF (SVG inline)
- Label: "Report PDF"
- Stato: disabilitato se nessun esperimento attivo
- Loading state: spinner + "Generazione report..." durante creazione

### Dati da passare
Il componente `NewElabSimulator` deve esporre al generatore PDF:
- `canvasRef` (per screenshot)
- `circuitState`
- `codeContent` + `compilationResult` (se AVR)

Il componente `ElabTutorV4` deve esporre:
- `messages[]`
- `activeExperiment`
- `quizResults` (dal QuizPanel)
- `sessionStartRef`

### Nuovo file: `services/sessionReportService.js`
- `generateSessionReport(sessionData)` — orchestratore principale
- `captureCircuitScreenshot(canvasRef)` — wrapper exportPng
- `fetchAISummary(sessionData)` — nanobot call + fallback
- `buildPDF(allData)` — @react-pdf/renderer

### Nuovo file: `components/report/SessionReportPDF.jsx`
- Componenti React-PDF per ogni pagina
- Stili ELAB
- Font registration (Oswald, Open Sans, Fira Code)

---

## Cosa NON fare
- NON inventare dati non presenti nella sessione
- NON aggiungere screenshot di esperimenti non fatti
- NON mostrare quiz se lo studente non l'ha fatto (mostrare "non provato")
- NON generare grafici complessi (overkill per MVP)
- NON richiedere login/auth per generare il report
- NON salvare il report su server (solo download locale)
