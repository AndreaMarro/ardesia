# ELAB — 20 Micro-Idee Geniali (Session 46)
> Piccole cose controintuitive che fanno dire "wow, ci hanno pensato".

---

### #1 — Circuito Fantasma
Quando uno studente sbaglia un collegamento, mostrare per 0.5s un'ombra semi-trasparente del filo nella posizione CORRETTA prima che scompaia. Il cervello registra la posizione giusta senza che sembri "la risposta data". Effort: 3h.

### #2 — Suono del Click
Aggiungere un micro-suono (50ms) diverso per ogni azione: click componente = "tock", collegamento filo = "snap", errore = "buzz". L'audio feedback aumenta la ritenzione del 40% (studio Mayer 2009). Web Audio API, 3 file .wav da 1KB. Effort: 2h.

### #3 — Easter Egg del Maker
Se lo studente costruisce un circuito NON nel catalogo che funziona (LED acceso, nessun cortocircuito), mostrare un badge segreto "Inventore" con coriandoli CSS. Premia la sperimentazione libera. Effort: 4h.

### #4 — Filo Arcobaleno
In modalità libera, ogni nuovo filo ha un colore diverso ciclico (rosso→arancione→giallo→verde→blu→viola). Elimina il problema "quale filo è quale?" quando ce ne sono 8+ sulla breadboard. Zero effort cognitivo per lo studente. Effort: 1h.

### #5 — Respirazione del LED
Quando un LED è acceso nella simulazione, farlo "respirare" con un'animazione CSS subtile (opacity 0.85↔1.0, 2s cycle). I LED reali hanno un leggero flicker. Aggiunge realismo senza caricare la GPU. Effort: 1h.

### #6 — Tooltip del Nonno
Quando il mouse resta fermo su un componente per >3 secondi, mostrare un tooltip con un fatto curioso: "Lo sapevi? Il primo LED è stato inventato nel 1962 da Nick Holonyak Jr." 21 componenti × 1 fatto = 21 stringhe. Effort: 3h.

### #7 — Countdown Motivazionale
Nel quiz, mostrare un timer visivo (non numerico) come una barra che si svuota dolcemente. Nessuna penalità se scade — solo un leggero shake del container come incoraggiamento gentile. Riduce l'ansia da test. Effort: 2h.

### #8 — Schermata "E Ora?"
Dopo aver completato un esperimento + quiz, invece del generico "Bravo!", mostrare 3 opzioni contestuali: "Prossimo esperimento →", "Ripeti con variazioni", "Sfida un compagno". Riduce il "what now?" drop-off. Effort: 3h.

### #9 — Breadboard Zoom Semantico
Doppio-click su un'area della breadboard = zoom 2x centrato su quell'area con i numeri dei fori visibili. Singolo click altrove = zoom out. Per studenti con difficoltà visive o LIM a bassa risoluzione. Effort: 4h.

### #10 — Ombra del Componente
Quando si trascina un componente verso la breadboard, mostrare un'ombra nella posizione di atterraggio con i pin evidenziati in verde (valido) o rosso (occupato/incompatibile). Feedback prima del rilascio = meno errori. Effort: 3h.

### #11 — Diario Segreto di Galileo
Galileo (AI) tiene un "diario" invisibile di ogni sessione. Alla fine, lo studente può sbloccare una frase tipo: "Oggi hai fatto 3 tentativi prima di accendere il LED. La persistenza è la qualità #1 di un ingegnere." Rinforzo positivo personalizzato. Effort: 4h.

### #12 — Modalità "Buio"
Un bottone "Spegni la luce" che oscura tutto tranne i LED accesi (sfondo nero, componenti in silhouette). Effetto wow immediato + dimostra visivamente il concetto di circuito aperto/chiuso. Effort: 2h.

### #13 — Filo Elastico Live
Mentre si trascina l'estremo di un filo, mostrare una linea tratteggiata che "segue" il cursore come un elastico. Quando si rilascia su un pin valido, il filo "scatta" in posizione con un'animazione spring (200ms). Effort: 2h.

### #14 — Badge da Stampare
Ogni badge guadagnato (bronzo/argento/oro) ha un bottone "Stampa" che genera un certificato A4 con nome studente, data, esperimento, e un QR code che linka al simulatore. I ragazzi li appendono in camera. Effort: 5h.

### #15 — Micro-Quiz Sorpresa
Dopo il 3° esperimento consecutivo senza fare il quiz, Galileo appare con: "Ehi, ho una domanda veloce..." e fa UNA sola domanda. Non invasivo, non bloccante, ma ricorda che il quiz esiste. Effort: 2h.

### #16 — Componente del Giorno
All'apertura del simulatore, evidenziare un componente random con un bordo dorato e la scritta "Componente del giorno". Click = scheda tecnica con 3 fatti + 1 esperimento suggerito. Crea curiosità quotidiana. Effort: 3h.

### #17 — Undo Gestuale
Shake del telefono (DeviceMotion API) = undo ultimo collegamento. Più intuitivo di cercare il bottone undo su mobile. Fallback: doppio-tap con due dita. Effort: 3h.

### #18 — Simulatore Parlante
Bottone "Leggi ad alta voce" che usa Web Speech API per descrivere il circuito: "Hai una batteria da 9V collegata a un LED rosso attraverso una resistenza da 220 ohm". Inclusione per studenti con DSA. Effort: 4h.

### #19 — Streak Counter
Mostrare discretamente nell'angolo "🔥 3 giorni consecutivi" quando lo studente accede per 3+ giorni di fila. Il meccanismo di streak (Duolingo-style) è il più potente driver di retention conosciuto. localStorage only, zero backend. Effort: 2h.

### #20 — Circuito Condiviso via URL
Bottone "Condividi" che codifica lo stato del circuito in un URL hash (`#circuit=base64...`). Chi apre il link vede lo stesso circuito. Perfetto per: "Prof, guardi cosa ho fatto!" senza login né server. Effort: 4h.

---

## CLASSIFICA PER IMPATTO/EFFORT

| # | Idea | Effort | Impatto | Rapporto |
|---|------|--------|---------|----------|
| 5 | Respirazione LED | 1h | Alto | ★★★★★ |
| 4 | Filo Arcobaleno | 1h | Medio | ★★★★ |
| 19 | Streak Counter | 2h | Altissimo | ★★★★★ |
| 2 | Suono del Click | 2h | Alto | ★★★★ |
| 12 | Modalità Buio | 2h | Alto | ★★★★ |
| 13 | Filo Elastico | 2h | Medio | ★★★ |
| 7 | Countdown Quiz | 2h | Medio | ★★★ |
| 15 | Micro-Quiz Sorpresa | 2h | Medio | ★★★ |
| 8 | Schermata "E Ora?" | 3h | Alto | ★★★★ |
| 1 | Circuito Fantasma | 3h | Alto | ★★★★ |

---
*Generato: 25 Febbraio 2026 — Session 46*
