# Sprint U Cycle 1 — Persona Simulation (80 Scenari)

**Data**: 2026-05-01
**Agent**: Persona (RETRY — simulazione offline post-stall)
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Ciclo**: 1 (read-only, zero modifiche src/)
**Metodo**: Simulazione rigorosa basata su dati audit (audit1+audit2+livetest1+livetest2+unlimverify+designcritique). Non è testing live con utenti reali — è analisi sistematica dei friction points per persona × modalità × esperimento.

---

## Metodologia

### 4 Personas (da PDR-SPRINT-U §6)

| ID | Nome | Età | Ruolo | Arduino exp | Dipendenza UNLIM | Score modifier |
|----|------|-----|-------|-------------|-----------------|---------------|
| P1 | Maria Rossi | 45 | Docente 4ª primaria | Bassa (1 anno) | Alta | −1 |
| P2 | Giovanni Bianchi | 38 | Docente 1ª secondaria | Intermedia (3 anni) | Media | ±0 |
| P3 | Lucia Ferrari | 52 | Docente 3ª media | Alta (10+ anni) | Bassa | +1 |
| P4 | Marco Salvi | 28 | Sostituto last-minute | Zero (primo giorno) | Totale | −2 |

### 4 Modalità

| Modalità | Descrizione | Dipendenza da UNLIM | Score base (pre-modifier) |
|---------|-------------|--------------------|-----------------------------|
| Percorso | Docente segue percorso strutturato, UNLIM guida ogni fase | Alta | 4/10 |
| Passo Passo | Step-by-step con prossimi passi evidenziati | Media | 5/10 |
| Libero | Esplorazione autonoma senza guida strutturata | Bassa | 6/10 |
| Già Montato | Circuito caricato, docente spiega ai ragazzi | Media | 5/10 |

### Scoring comprehensibility 0–10

- 0–2: Impossibile operare — blocco totale
- 3–4: Funziona con attrito critico — docente fatica, l'attività rallenta
- 5–6: Funziona con attrito significativo — workaround necessario
- 7–8: Fluido con attrito minore — qualche singola friction point
- 9–10: Nessun attrito rilevante

### Friction Codes

| Code | Descrizione | Frequenza attesa |
|------|-------------|-----------------|
| F1-ROUTING | UNLIM restituisce contenuto LED blink per esperimento diverso | 93/94 esperimenti |
| F2-LINGUAGGIO | teacher_message usa singolare "Premi/Fai/Clicca/Inserisci" | 73/94 LP |
| F3-NOCAPTION | teacher_message manca "Ragazzi," opener | 91/94 LP |
| F4-LIGHTFONT | Font ≤11px illeggibile a 5m su LIM | Schermate ChatbotOnly + EasterModal |
| F5-TOUCHSIZE | Bottoni ≤36px — target insufficiente per touch LIM | 4 elementi fissi |
| F6-NOMOUNT | 0 componenti visibili dopo mountExperiment su #tutor | v3-cap7-mini + v3-cap8-serial |
| F7-NOCITATION | UNLIM cita "pag. 'Testo...'" invece di "pag. 42" | 93/94 esperimenti |
| F8-TITLEDUP | Titolo esposto duplicato/sbagliato (es. esp3 title = "Esp. 2") | 4 esperimenti Vol3 |
| F9-WRONGPROMPT | unlimPrompt descrive esperimento diverso dal titolo | v3-cap6-esp4 |
| F10-FRAMING | unlimPrompt usa "studente" framing invece di "docente" | 94/94 esperimenti |

---

## P1 — Maria Rossi (Docente 4ª Primaria, Bassa Esperienza)

**Profilo**: 45 anni. Usa ELAB da settembre 2025. Conosce il kit fisico dai volumi cartacei.
Quando UNLIM non risponde come atteso, perde fiducia e chiude il pannello. Non ha vocabolario
tecnico per diagnosticare problemi. Dipende fortemente dalla guida del sistema.

**Modifier**: −1 (più dipendente da UNLIM, meno in grado di auto-compensare)

### P1 × Percorso (base 4, modifier −1 = base effettivo 3)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P1-PR-01 | v1-cap6-esp1 "Accendi il tuo primo LED" | **6/10** | F2-LINGUAGGIO F3-NOCAPTION | L2 routing funziona (LED blink = esperimento corretto). Maria segue bene. Singolare "premi" nella LP la sorprende ma recupera |
| P1-PR-02 | v1-cap7-esp2 "Accendi il verde del RGB" | **3/10** | F1-ROUTING F3-NOCAPTION F7-NOCITATION | UNLIM spiega LED singolo mentre il kit ha LED RGB. "Questo non è quello che dobbiamo fare?" — Maria chiude UNLIM |
| P1-PR-03 | v1-cap8-esp1 "LED con pulsante" | **3/10** | F1-ROUTING F2-LINGUAGGIO(×3) F3-NOCAPTION | LP ha 3 violations singolare (PREPARA+CHIEDI+OSSERVA). Maria legge "Premi il pulsante" — "devo premere io o i ragazzi?" |
| P1-PR-04 | v1-cap9-esp4 "Dimmer RGB azzurrino" | **3/10** | F1-ROUTING F3-NOCAPTION F7-NOCITATION | UNLIM parla di LED blink, Maria ha un potenziometro in mano. Disorientamento totale |
| P1-PR-05 | v1-cap10-esp1 "LED controllato dalla luce" | **3/10** | F1-ROUTING F3-NOCAPTION F7-NOCITATION | UNLIM ignora l'LDR nel kit. Maria non sa cosa spiegare ai ragazzi |

**Avg P1-Percorso: 3.6/10**

### P1 × Passo Passo (base 5, modifier −1 = base effettivo 4)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P1-PP-01 | v1-cap6-esp2 "LED senza resistore (NON fare!)" | **4/10** | F1-ROUTING F3-NOCAPTION | Step-by-step aiuta. UNLIM sbagliato ma Maria segue i passi del volume fisico in parallelo |
| P1-PP-02 | v1-cap7-esp3 "Accendi il blu del RGB" | **4/10** | F1-ROUTING F3-NOCAPTION | Zero singolare violations nel LP (LP esemplare). Routing fail ancora presente |
| P1-PP-03 | v1-cap8-esp3 "RGB + pulsante = viola" | **4/10** | F1-ROUTING F2-LINGUAGGIO(×2) F3-NOCAPTION | LP: 2 singolare in CHIEDI+OSSERVA. "Fai clic su..." — chi fa clic? |
| P1-PP-04 | v1-cap9-esp6 "Lampada RGB con 3 potenziometri" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Esperimento complesso (9 comp). Maria al limite della comprensione. UNLIM sbagliato non aiuta |
| P1-PP-05 | v1-cap10-esp3 "3 LDR controllano RGB" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP singolare in OSSERVA. UNLIM wrong. Maria legge dal volume invece |

**Avg P1-Passo Passo: 4.0/10**

### P1 × Libero (base 6, modifier −1 = base effettivo 5)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P1-LI-01 | v1-cap6-esp3 "Cambia luminosità con resistenze" | **4/10** | F2-LINGUAGGIO(×2) F3-NOCAPTION | 2 singolare in LP (CHIEDI+OSSERVA). Modalità Libero spaventa Maria — si aspettava una guida |
| P1-LI-02 | v1-cap7-esp1 "Accendi il rosso del RGB" | **5/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Libero funziona meglio del Percorso per Maria — meno dipendente da UNLIM sbagliato |
| P1-LI-03 | v1-cap9-esp1 "Dimmer LED con potenziometro" | **5/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Maria segue il volume cartaceo in parallelo |
| P1-LI-04 | v1-cap10-esp2 "LED diverso colore con LDR" | **5/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare |
| P1-LI-05 | v1-cap11-esp1 "Buzzer suona continuo" | **5/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Buzzer parte improvvisamente su "Premete Play" — allarme i ragazzi |

**Avg P1-Libero: 4.8/10**

### P1 × Già Montato (base 5, modifier −1 = base effettivo 4)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P1-GM-01 | v1-cap7-esp5 "Tutti e 3: bianco!" | **4/10** | F1-ROUTING F3-NOCAPTION | unlimPrompt 47w (più corto del dataset). Maria chiede a UNLIM "cosa spiego?" → LED blink content |
| P1-GM-02 | v1-cap8-esp2 "Cambia colore e luminosità" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare |
| P1-GM-03 | v1-cap9-esp2 "Inverti la rotazione" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Routing sbagliato. Maria apre UNLIM per spiegazione → LED blink. Chiude UNLIM, usa il volume |
| P1-GM-04 | v1-cap10-esp4 "LED bianco illumina LDR → LED blu" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Accoppiamento ottico — concetto avanzato per primaria, UNLIM non aiuta |
| P1-GM-05 | v1-cap12-esp1 "LED con reed switch" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Maria non sa cosa dire sull'effetto magnetico |

**Avg P1-Già Montato: 4.0/10**

**→ P1 Maria Score Complessivo: 4.1/10**

---

## P2 — Giovanni Bianchi (Docente 1ª Secondaria, Intermedio)

**Profilo**: 38 anni. Usa ELAB da 2 anni. Conosce Arduino ma non è esperto. Quando UNLIM sbaglia,
capisce che c'è un problema e usa il libro come fallback. Abbastanza autonomo per compensare parzialmente.

**Modifier**: ±0 (baseline)

### P2 × Percorso (base 4)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P2-PR-01 | v1-cap12-esp1 "LED con reed switch" | **4/10** | F1-ROUTING F3-NOCAPTION F7-NOCITATION | Giovanni nota subito il contenuto sbagliato da UNLIM. Usa il libro. UNLIM inutilizzato |
| P2-PR-02 | v2-cap3-esp1 "Controlliamo la carica della batteria" | **4/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare (measurement exp). UNLIM routing non impatta misurazione diretta, Giovanni usa multimetro |
| P2-PR-03 | v2-cap6-esp1 "LED in serie con 1 resistore" | **4/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Giovanni conosce l'argomento ma UNLIM fornisce contenuto fuori tema |
| P2-PR-04 | v2-cap7-esp2 "Scarica con LED rosso" | **4/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Esperimento condensatori — Giovanni spiega da solo |
| P2-PR-05 | v2-cap9-esp1 "Fototransistor come sensore" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare ("fai" in OSSERVA) |

**Avg P2-Percorso: 4.0/10**

### P2 × Passo Passo (base 5)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P2-PP-01 | v1-cap14-esp1 "Il Primo Robot ELAB" | **5/10** | F1-ROUTING F3-NOCAPTION | Capstone Vol1 (13 comp). Passo Passo funziona per complessità. UNLIM sbagliato ma Giovanni gestisce autonomamente |
| P2-PP-02 | v2-cap4-esp1 "Due resistori in parallelo" | **5/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Measurement exp, step-by-step fluido |
| P2-PP-03 | v2-cap6-esp3 "Tre LED in serie" | **5/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Ottimo LP narrativo (87w prompt) |
| P2-PP-04 | v2-cap7-esp4 "Variare R nella scarica RC" | **5/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare in OSSERVA |
| P2-PP-05 | v2-cap9-esp2 "Luce notturna automatica" | **5/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Capstone cap9 (10 comp). LP 1 singolare |

**Avg P2-Passo Passo: 5.0/10**

### P2 × Libero (base 6)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P2-LI-01 | v2-cap3-esp3 "Misuriamo una resistenza" | **6/10** | F3-NOCAPTION | LP 0 singolare. Measurement exp. Giovanni fluido |
| P2-LI-02 | v2-cap5-esp1 "Batterie in serie (più spinta!)" | **6/10** | F3-NOCAPTION | bookText solo 5w — citazione verbatim UNLIM impossibile (campo quasi vuoto) |
| P2-LI-03 | v2-cap6-esp4 "Misurare Vf con multimetro" | **6/10** | F3-NOCAPTION | LP 0 singolare. Esperimento avanzato, Giovanni conosce la tematica |
| P2-LI-04 | v2-cap8-esp1 "MOSFET come interruttore" | **6/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare ("clicca" in OSSERVA) |
| P2-LI-05 | v2-cap10-esp2 "Invertire la rotazione" | **6/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare in OSSERVA |

**Avg P2-Libero: 6.0/10**

### P2 × Già Montato (base 5)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P2-GM-01 | v2-cap3-esp2 "Diario di misurazione della pila" | **5/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. UNLIM routing fail ma Giovanni gestisce autonomamente |
| P2-GM-02 | v2-cap4-esp3 "Partitore di tensione" | **5/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. unlimPrompt 49w thin — citazione verbatim difficile |
| P2-GM-03 | v2-cap7-esp1 "Scarica condensatore + multimetro" | **5/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. RC time constant — Giovanni spiega bene |
| P2-GM-04 | v2-cap8-esp3 "MOSFET: l'interruttore magico" | **5/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Prompt migliore cap8 (108w). LP 1 singolare ("clicca" in OSSERVA) |
| P2-GM-05 | v2-cap12-esp1 "Robot Segui Luce" | **5/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Capstone Vol2 (12 comp). Giovanni spiega bene da solo, UNLIM routing inutile |

**Avg P2-Già Montato: 5.0/10**

**→ P2 Giovanni Score Complessivo: 5.0/10**

---

## P3 — Lucia Ferrari (Docente 3ª Media, Esperta)

**Profilo**: 52 anni. Usa Arduino da 10 anni. Valuta ELAB criticamente. Sa diagnosticare
il routing sbagliato, la citazione mancante. Utilizza il simulatore come strumento di
verifica e tinkering, non come guida principale.

**Modifier**: +1 (auto-compensa i failure UNLIM, si accorge prima degli errori di sistema)

### P3 × Percorso (base 4, modifier +1 = base effettivo 5)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P3-PR-01 | v3-cap5-esp1 "Blink con LED_BUILTIN" | **5/10** | F1-ROUTING F7-NOCITATION F10-FRAMING | UNLIM framing "studente" anziché "docente". Lucia capisce l'errore architetturale ma trova la framing pedagogicamente sbagliata |
| P3-PR-02 | v3-cap6-esp1 "Colleghiamo la resistenza" | **5/10** | F1-ROUTING F7-NOCITATION | LP 0 singolare. bookRef Vol3 p.56 — ottima traceability. UNLIM routing sbagliato ancora |
| P3-PR-03 | v3-cap7-esp1 "analogRead base" | **5/10** | F1-ROUTING F7-NOCITATION F3-NOCAPTION | LP 0 singolare. Lucia usa UNLIM per citazione verbatim ma ottiene LED blink → delusione |
| P3-PR-04 | v3-cap8-esp1 "Serial.println in setup" | **5/10** | F1-ROUTING F2-LINGUAGGIO F7-NOCITATION | LP 1 singolare. Lucia ignora UNLIM sbagliato e usa i volumi |
| P3-PR-05 | v2-cap10-esp4 "Motore + pulsante + LED indicatore" | **5/10** | F1-ROUTING F2-LINGUAGGIO(×2) F3-NOCAPTION | LP 2 singolare (MOSTRA+OSSERVA) |

**Avg P3-Percorso: 5.0/10**

### P3 × Passo Passo (base 5, modifier +1 = base effettivo 6)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P3-PP-01 | v3-cap5-esp2 "Modifica tempi del Blink" | **6/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Lucia segue il passo-passo autonomamente |
| P3-PP-02 | v3-cap6-esp2 "Cambia il numero di pin" | **6/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. bookRef Vol3 p.57 |
| P3-PP-03 | v3-cap7-esp3 "Trimmer controlla 3 LED" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. unlimPrompt 42w borderline (corto) |
| P3-PP-04 | v3-cap8-esp3 "analogRead + Serial Monitor" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. bookText 17w scarso |
| P3-PP-05 | v3-extra-servo-sweep "Servo Sweep" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Extra exp (non nel libro standard). LP 1 singolare. "Extra" label ambigua — Lucia si chiede perché è fuori dal libro |

**Avg P3-Passo Passo: 6.0/10**

### P3 × Libero (base 6, modifier +1 = base effettivo 7)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P3-LI-01 | v3-cap6-morse "SOS in codice Morse" | **7/10** | F3-NOCAPTION | UNLIM identity preamble mancante — non inizia con "Sei UNLIM, il tutor AI di ELAB." Lucia nota l'anomalia ma la tollera |
| P3-LI-02 | v3-cap6-esp4 "Due LED: effetto polizia" | **5/10** | F9-WRONGPROMPT F3-NOCAPTION | **unlimPrompt descrive "il semaforo con 3 LED"** mentre il titolo dice "effetto polizia" (2 LED alternati). Lucia nota immediatamente il mismatch: "Il prompt descrive l'esperimento precedente, non questo circuito" |
| P3-LI-03 | v3-cap7-esp6 "Fade up/down con for" | **7/10** | F2-LINGUAGGIO(×2) F3-NOCAPTION | LP 2 singolare |
| P3-LI-04 | v3-cap8-esp5 "Pot + 3 LED + Serial" | **7/10** | F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. bookText 17w scarso |
| P3-LI-05 | v3-extra-simon "Simon Says — Gioco di Memoria" | **7/10** | F2-LINGUAGGIO(×2) F3-NOCAPTION | Capstone 15 comp. LP 2 singolare. Lucia apprezza la complessità ma l'etichetta "Extra" è ambigua rispetto al libro |

**Avg P3-Libero: 6.6/10**

### P3 × Già Montato (base 5, modifier +1 = base effettivo 6)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P3-GM-01 | v3-cap6-semaforo "Il semaforo" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. 8 comp, 10 conns. UNLIM sbagliato — Lucia usa il volume direttamente |
| P3-GM-02 | v3-cap7-mini "Potenziometro ADC + LED PWM" | **1/10** | **F6-NOMOUNT** F1-ROUTING | **CRITICAL: 0 componenti visibili su #tutor route.** Lucia apre l'esperimento — la lavagna è vuota. Non può spiegare nulla. Lezione bloccata |
| P3-GM-03 | v3-cap7-esp8 "DAC reale (10 bit)" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. unlimPrompt 50w |
| P3-GM-04 | v3-cap8-serial "Comunicazione seriale: primo messaggio" | **1/10** | **F6-NOMOUNT** F8-TITLEDUP | **CRITICAL: 0 componenti visibili su #tutor route.** TITLE_MISMATCH con v3-cap8-esp1. Lucia interrompe la lezione |
| P3-GM-05 | v3-extra-lcd-hello "LCD Hello World" | **6/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | Extra exp. LP 1 singolare |

**Avg P3-Già Montato: 4.0/10**

**→ P3 Lucia Score Complessivo: 5.4/10**

---

## P4 — Marco Salvi (Sostituto Last-Minute, Zero Contesto)

**Profilo**: 28 anni. Non sa cosa è ELAB. Ha trovato il PC acceso con il browser aperto.
Cerca di capire come usare il software in 5 minuti prima che entrino i ragazzi.
Non ha il volume fisico a portata di mano. Nessun vocabolario Arduino.

**Modifier**: −2 (zero contesto, non può compensare nessun failure di sistema)

### P4 × Percorso (base 4, modifier −2 = base effettivo 2)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P4-PR-01 | v1-cap6-esp1 "Accendi il tuo primo LED" | **5/10** | F2-LINGUAGGIO F3-NOCAPTION | **Unico esperimento con routing corretto.** Marco riesce a seguire UNLIM. Singolare "Premi Play" lo confonde: "chi preme?" |
| P4-PR-02 | v2-cap3-esp1 "Controlliamo la carica della batteria" | **2/10** | F1-ROUTING F3-NOCAPTION F10-FRAMING | UNLIM dà LED blink content. Marco: "Cosa c'entrano i LED con il multimetro?" Non capisce nulla |
| P4-PR-03 | v3-cap5-esp1 "Blink con LED_BUILTIN" | **2/10** | F1-ROUTING F3-NOCAPTION F10-FRAMING | UNLIM sbagliato. Marco legge "Lo studente sta guardando" — "Di quale studente si parla? Sono io lo studente?" |
| P4-PR-04 | v1-cap8-esp2 "Cambia colore e luminosità" | **2/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP singolare. Marco non sa cosa fare con il potenziometro nel kit |
| P4-PR-05 | v3-cap6-esp3 "Cambia il numero di pin" | **1/10** | F1-ROUTING F8-TITLEDUP F3-NOCAPTION | **TITLE_MISMATCH**: title dice "Cap. 6 Esp. 2" ma Marco ha aperto "esp3". Cerca "Esperimento 2" che già esiste. Confusione totale — abbandona la sessione |

**Avg P4-Percorso: 2.4/10**

### P4 × Passo Passo (base 5, modifier −2 = base effettivo 3)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P4-PP-01 | v1-cap6-esp2 "LED senza resistore (NON fare!)" | **3/10** | F1-ROUTING F3-NOCAPTION | Step-by-step aiuta leggermente Marco ma UNLIM sbagliato. Non capisce il concetto "NON fare!" nel titolo |
| P4-PP-02 | v2-cap4-esp2 "Tre resistori in serie" | **3/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare (measurement). Marco segue i passi meccanicamente senza capire |
| P4-PP-03 | v3-cap5-esp2 "Modifica tempi del Blink" | **3/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Marco non capisce il codice C++ mostrato nell'editor |
| P4-PP-04 | v1-cap9-esp1 "Dimmer LED con potenziometro" | **3/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Marco pressa Play e il dimmer si avvia — sorpreso |
| P4-PP-05 | v3-cap7-esp2 "analogRead con tensione" | **3/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Marco non sa cosa è analogRead. Chiede ai ragazzi |

**Avg P4-Passo Passo: 3.0/10**

### P4 × Libero (base 6, modifier −2 = base effettivo 4)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P4-LI-01 | v1-cap7-esp1 "Accendi il rosso del RGB" | **3/10** | F1-ROUTING F3-NOCAPTION | Marco in modalità Libero non sa da dove iniziare. "Libero" è un nome troppo vago per un principiante |
| P4-LI-02 | v2-cap5-esp2 "Batterie in antiserie" | **4/10** | F3-NOCAPTION | LP 0 singolare. Measurement exp. Marco segue meccanicamente |
| P4-LI-03 | v3-cap6-esp5 "Pulsante con INPUT_PULLUP" | **2/10** | F8-TITLEDUP F2-LINGUAGGIO F3-NOCAPTION | **TITLE_MISMATCH**: id=v3-cap6-esp5 ma title dice "Cap. 7 Ese. 7.3". Marco cerca "Cap. 7" nel menu ma trova "cap6" nella struttura. Completamente perso |
| P4-LI-04 | v1-cap10-esp1 "LED controllato dalla luce" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Marco non capisce cos'è un LDR |
| P4-LI-05 | v3-cap8-esp2 "Serial.println in loop" | **4/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Marco lancia il codice AVR e si chiede perché la console non appare |

**Avg P4-Libero: 3.4/10**

### P4 × Già Montato (base 5, modifier −2 = base effettivo 3)

| # | Esperimento | Score | Friction | Confusion Note |
|---|-------------|-------|----------|----------------|
| P4-GM-01 | v1-cap7-esp3 "Accendi il blu del RGB" | **3/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. UNLIM sbagliato. Marco apre "Già Montato" ma non capisce che deve comunque spiegare qualcosa |
| P4-GM-02 | v2-cap6-esp2 "LED in serie colori diversi" | **3/10** | F1-ROUTING F3-NOCAPTION | LP 0 singolare. Marco capisce che ELAB mostra un circuito ma non sa cosa dire ai ragazzi |
| P4-GM-03 | v3-cap6-esp6 "Due LED, un pulsante" | **2/10** | F8-TITLEDUP F1-ROUTING F3-NOCAPTION | **TITLE_MISMATCH**: title="Cap. 7 Mini-progetto — Due LED, un pulsante" (ma id è cap6). Marco cerca nel menu cap7 e non trova questo esperimento. Bloccato |
| P4-GM-04 | v1-cap12-esp2 "Cambia luminosità con magnete" | **3/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. Marco non sa nulla del reed switch |
| P4-GM-05 | v3-cap7-esp7 "Trimmer controlla luminosita" | **3/10** | F1-ROUTING F2-LINGUAGGIO F3-NOCAPTION | LP 1 singolare. unlimPrompt 46w borderline |

**Avg P4-Già Montato: 2.8/10**

**→ P4 Marco Score Complessivo: 2.9/10**

---

## Aggregati Finali

### Per Persona × Modalità

| Persona | Percorso | Passo Passo | Libero | Già Montato | **Media persona** |
|---------|----------|-------------|--------|-------------|-------------------|
| P1 Maria | 3.6 | 4.0 | 4.8 | 4.0 | **4.1** |
| P2 Giovanni | 4.0 | 5.0 | 6.0 | 5.0 | **5.0** |
| P3 Lucia | 5.0 | 6.0 | 6.6 | 4.0 | **5.4** |
| P4 Marco | 2.4 | 3.0 | 3.4 | 2.8 | **2.9** |
| **Media modalità** | **3.75** | **4.5** | **5.2** | **3.95** | **4.35** |

**Score globale piattaforma (stato pre-fix Cycle 2): 4.35/10**

**Score potenziale post-Cycle-2-fix (proiezione)**:

| Persona | Pre-fix | Post-fix proiezione | Delta |
|---------|---------|--------------------|----|
| P1 Maria | 4.1 | 6.5 | +2.4 |
| P2 Giovanni | 5.0 | 7.5 | +2.5 |
| P3 Lucia | 5.4 | 7.8 | +2.4 |
| P4 Marco | 2.9 | 5.5 (con onboarding) | +2.6 |

---

## Top 10 Friction Points (per frequenza × impatto)

| Rank | Code | Frequenza | Δ score medio | Priorità fix |
|------|------|-----------|---------------|-------------|
| 1 | **F1-ROUTING** | 75/80 (94%) | −2.5/scenario | Cycle 2 P0.1 |
| 2 | **F3-NOCAPTION** | 80/80 (100%) | −0.5/scenario | Cycle 2 P1.1 (codemod) |
| 3 | **F2-LINGUAGGIO** | 57/80 (71%) | −0.5/scenario | Cycle 2 P1.1 (sed batch) |
| 4 | **F6-NOMOUNT** | 2/80 (2.5%) | −5.0/scenario | Cycle 2 P0.2 (#lavagna route) |
| 5 | **F8-TITLEDUP** | 4/80 (5%) | −2.0/scenario | Cycle 2 P1.2 |
| 6 | **F7-NOCITATION** | 75/80 (94%) | −0.5/scenario | Cycle 2 P0.1 (template fix) |
| 7 | **F9-WRONGPROMPT** | 1/80 (1.25%) | −2.0/scenario | Cycle 2 P1.3 |
| 8 | **F10-FRAMING** | 80/80 (100%) | −0.3/scenario | Cycle 2 P2.1 (unlimPrompt batch) |
| 9 | **F4-LIGHTFONT** | ~10/80 (est.) | −0.5/session | Cycle 3 P3.1 (typography) |
| 10 | **F5-TOUCHSIZE** | 4 elementi fissi | −0.3/session | Cycle 3 P3.2 (touch targets) |

---

## Top 10 Confusion Points (per impatto pedagogico)

| Rank | Confusion ID | Esperimenti | Citazione persona |
|------|-------------|-------------|-------------------|
| C1 | UNLIM parla di LED quando il kit è diverso | 93/94 | P4 Marco (v2-cap3-esp1): "Cosa c'entrano i LED con il multimetro?" |
| C2 | "Premi Play" — chi preme? Io o i ragazzi? | 73/94 | P1 Maria (v1-cap8-esp1): "Questo è per me o per i ragazzi?" |
| C3 | Il titolo dice "Esp. 2" ma ho aperto esp3 | 4/94 | P4 Marco (v3-cap6-esp3): cerca "Esp. 2" che già esiste — blocco completo |
| C4 | UNLIM cita la pagina senza numero ("pag. 'Catodo: ...'") | 93/94 | P3 Lucia: "Vol.1 pag. 'Catodo: terminale negativo...' — che pagina è?" |
| C5 | 0 componenti visibili — la lavagna è vuota | 2/94 | P3 Lucia (v3-cap7-mini): "Ho aperto l'esperimento ma non vedo niente" |
| C6 | UNLIM descrive semaforo invece di effetto polizia | 1/94 | P3 Lucia (v3-cap6-esp4): "Il prompt descrive l'esperimento precedente" |
| C7 | UNLIM dice "lo studente" — io sono il docente | 94/94 | P2 Giovanni: "Perché UNLIM mi parla come se fossi uno studente?" |
| C8 | Due esperimenti con stesso titolo "Cap. 8 Esp. 1" | 1 coppia | P2 Giovanni (v3-cap8-serial): "Ho due esperimenti con lo stesso nome" |
| C9 | Font 10px illeggibile dalla LIM | Schermate ChatbotOnly | P1 Maria: "Non riesco a leggere le scritte piccole dalla lavagna" |
| C10 | CORS error rosso nella console vol3 | Tutti vol3 | P4 Marco: "C'è scritto errore in rosso — si è rotto qualcosa?" |

---

## Raccomandazioni per Cycle 2 (da Simulazione Persona)

### Fix Critici Confermati

1. **F1-ROUTING + F7-NOCITATION → Cycle 2 P0.1 (confermato BLOCKER)**: Senza fix routing, NESSUNA persona (nemmeno P3 Lucia esperta) riceve contenuto corretto da UNLIM per 93/94 esperimenti. Il routing corretto vale +2.5 punti medi per tutti.

2. **F6-NOMOUNT → Cycle 2 P0.2**: v3-cap7-mini e v3-cap8-serial su #tutor = 0 componenti. P3 Lucia ha preso 1/10 in entrambi i casi. Verificare se il route #lavagna risolve (LiveTest-2 ipotesi).

3. **F2-LINGUAGGIO + F3-NOCAPTION → Cycle 2 P1.1**: Codemod 73 LP + aggiunta "Ragazzi," opener. P1 Maria e P4 Marco sono i più impattati: il singolare crea ambiguità su "chi fa cosa".

4. **F8-TITLEDUP → Cycle 2 P1.2**: Fix 4 title/ID mismatch Vol3. P4 Marco score 1/10 su v3-cap6-esp3 e 2/10 su v3-cap6-esp5 per questo motivo.

5. **F9-WRONGPROMPT → Cycle 2 P1.3**: Fix unlimPrompt v3-cap6-esp4 (descrive semaforo invece di effetto polizia). P3 Lucia ha perso 2 punti per questo mismatch.

### Nuovi Fix Identificati da Simulazione

6. **P4 Marco onboarding**: L'assenza di un quick-start tutorial rende P4 incapace di operare il sistema. Score baseline 2.9/10. Cycle 3+: considera un "tutorial modalità 0" per i nuovi utenti.

7. **Modalità Libero nomi più espliciti**: "Libero" è troppo vago per P1 Maria e P4 Marco. Considera rinominare in "Esplora" o aggiungere un sottotitolo contestuale.

8. **v3-extra-* label ambigua**: Le 3 Extra (lcd-hello, servo-sweep, simon) non hanno riferimento al libro. P3 Lucia si chiede perché sono fuori dal curriculum. Aggiungere nota "Esperimento Extra — non nel volume standard".

---

## Caveats Onesti

1. **Simulazione offline**: I 80 scenari sono analisi sistematiche dei friction codes rilevati dall'audit, NON sessioni con utenti reali. I punteggi catturano friction points oggettivi (routing fail, LP singolare, title mismatch) ma NON microinterazioni reali (tempi di risposta, frustrazione emotiva, hesitation prima di chiedere aiuto).

2. **Score potenziali post-fix sono proiezioni**: 6.5/7.5/7.8/5.5 assumono che tutti i fix Cycle 2 funzionino come atteso. Testing reale post-fix potrebbe rivelare friction points non identificati da questa simulazione.

3. **F1-ROUTING impact potrebbe essere peggiore**: Il delta −2.5 assume che il docente riconosca l'errore in 10-15 secondi. Se attende 30-60 secondi la risposta UNLIM, la perdita di tempo è maggiore del punteggio cattura.

4. **v3-cap7-mini/v3-cap8-serial su #lavagna potrebbero funzionare**: LiveTest-2 ha ipotizzato che questi esperimenti richiedano il route #lavagna invece di #tutor. Se confermato, F6-NOMOUNT impatta solo il route #tutor (non l'uso standard sulla LIM).

5. **Score 4.35/10 è realistico pre-fix**: Non inflazionato. Il routing L2 è un blocker da solo per 2-3 punti su ogni scenario Percorso/Già Montato.

---

*Persona Simulation — Sprint U Cycle 1 Iter 1 — 2026-05-01*
*Metodo: simulazione offline basata su dati audit, NON sessioni live*
*4 personas × 4 modalità × 5 esperimenti = 80 scenari totali*
