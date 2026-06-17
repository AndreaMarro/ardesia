# SCALETTA DEMO — Riunione Lunedi 14 Aprile 2026

**Presenti:** Giovanni Fagherazzi (ex Arduino Global Sales Director), Omaric Elettronica, Andrea Marro
**Durata:** 30 minuti netti
**URL:** https://www.elabtutor.school
**Chiave accesso:** ELAB2026

---

## PRE-DEMO: Checklist 15 minuti prima

- [ ] Aprire Chrome (NON Safari — miglior compatibilita)
- [ ] Navigare a https://www.elabtutor.school — verificare che carica
- [ ] Inserire chiave ELAB2026 — verificare accesso
- [ ] Aprire esperimento v1-cap6-esp1 e verificare che il LED si accende
- [ ] Testare una domanda UNLIM: "Cos'e un resistore?" — verificare risposta
- [ ] Aprire v3-cap6-semaforo — verificare che Scratch carica
- [ ] Verificare volume audio del portatile (per TTS)
- [ ] Chiudere TUTTE le altre tab e applicazioni
- [ ] Tenere il telefono in silenzioso
- [ ] Preparare il volume fisico ELAB aperto su Cap. 6 come riferimento visivo

---

## 1. SCALETTA DEMO — 15 Step in 30 Minuti

---

### STEP 1 — Apertura e prima impressione (2 min)
**Wow: ★★★☆☆**

**Azione:** Aprire https://www.elabtutor.school su schermo condiviso

**Cosa dire:**
> "Questo e ELAB Tutor. Funziona nel browser, zero installazione. Lo studente riceve il kit fisico con i 3 volumi e accede qui con un codice classe. Quello che vedete e una PWA — funziona anche offline dopo il primo caricamento."

**Cosa mostrare:** Homepage, design pulito, logo, PWA feel
**Cosa NON mostrare:** Non soffermarsi sui dettagli della landing, non menzionare /scuole

**Note:** Tenere il volume fisico visibile sul tavolo. Giovanni deve VEDERE il collegamento fisico-digitale.

---

### STEP 2 — Accesso con chiave classe (1 min)
**Wow: ★★☆☆☆**

**Azione:** Inserire "ELAB2026" nel campo chiave e premere Invio

**Cosa dire:**
> "Ogni classe riceve un codice. Il docente lo distribuisce, lo studente lo inserisce. Zero account, zero email, zero password. GDPR-safe: nessun dato personale raccolto."

**Cosa mostrare:** Il campo chiave, l'accesso immediato
**Cosa NON mostrare:** Non parlare di registrazione docente (non esiste ancora un flusso completo)

---

### STEP 3 — Panoramica 3 volumi (1 min)
**Wow: ★★★☆☆**

**Azione:** Mostrare la selezione dei 3 volumi nella home tutor

**Cosa dire:**
> "92 esperimenti in 3 volumi. Volume 1: le basi — LED, resistori, pulsanti, solo batteria 9V. Volume 2: approfondiamo — condensatori, transistor, motori. Volume 3: Arduino — programmazione con Scratch e C++. Ogni esperimento corrisponde ESATTAMENTE a una pagina del libro fisico."

**Cosa mostrare:** I 3 volumi con icone colorate, il conteggio esperimenti
**Cosa NON mostrare:** Non aprire il Volume 2 (ha esperimenti con multimetro non simulabile)

---

### STEP 4 — Primo esperimento: Accendi il LED (3 min) ★ MOMENTO CHIAVE
**Wow: ★★★★★**

**Azione:** Selezionare Volume 1 > Cap. 6 Esp. 1 "Accendi il tuo primo LED"

**Cosa dire:**
> "Questo e il primo esperimento del libro. Batteria 9V, resistore da 470 ohm, LED rosso. Lo studente lo monta fisicamente con il kit, e qui nel simulatore puo provarlo prima, o ripassarlo dopo."

**Cosa mostrare:**
1. Il circuito gia montato con breadboard, batteria, resistore, LED
2. Il LED che SI ACCENDE (la simulazione funziona in tempo reale)
3. La breadboard realistica con bus colorati
4. Fare zoom con scroll per mostrare i dettagli dei componenti SVG

**Cosa NON mostrare:** Non provare a trascinare componenti (drag-and-drop non perfetto), non toccare la toolbar di disegno

**FRASE CHIAVE per Giovanni:**
> "Ogni componente SVG e disegnato a mano per sembrare identico al componente fisico nel kit. Giovanni, guarda la breadboard — stessi colori, stessa disposizione del libro."

---

### STEP 5 — Passo Passo: montaggio guidato (2 min) ★ MOMENTO CHIAVE
**Wow: ★★★★★**

**Azione:** Cliccare "Passo Passo" (se disponibile) o mostrare gli step nel pannello laterale

**Cosa dire:**
> "La modalita Passo Passo guida lo studente nel montaggio. Ogni step evidenzia dove posizionare il componente sulla breadboard. Lo studente segue le istruzioni passo dopo passo, sia nel simulatore che con il kit fisico."

**Cosa mostrare:**
1. Gli step numerati nel pannello (es. "Inserisci il resistore da 470 ohm...")
2. L'animazione di assemblaggio automatico se disponibile
3. I 6 step dell'esperimento v1-cap6-esp1

**Cosa NON mostrare:** Non passare a esperimenti Vol3 senza buildSteps (21/27 mancano)

---

### STEP 6 — UNLIM: il tutor AI risponde (3 min) ★ MOMENTO CHIAVE
**Wow: ★★★★★**

**Azione:** Aprire la chat UNLIM (icona mascotte o toggle) e digitare: "Perche serve il resistore?"

**Cosa dire (PRIMA di digitare):**
> "Adesso vi mostro la cosa piu innovativa. UNLIM e il tutor AI integrato. Non e ChatGPT generico — e addestrato sui nostri 3 volumi. Ha 638 chunk di conoscenza estratti direttamente dai libri. Risponde usando le STESSE parole e analogie del volume."

**Cosa dire (DOPO la risposta):**
> "Vedete? Usa l'analogia dell'acqua, come nel libro. Non inventa — cita dal materiale didattico. Questo e il valore: l'AI non sostituisce il libro, lo AMPLIFICA."

**Cosa mostrare:**
1. La chat UNLIM che si apre
2. Digitare "Perche serve il resistore?" 
3. La risposta che arriva (deve usare analogia acqua/tubo dal RAG)
4. Il tono adatto a bambini

**Cosa NON mostrare:** Non fare domande troppo complesse o fuori contesto. Non chiedere cose su argomenti non coperti dal RAG.

**PIANO B se Gemini non risponde (rate limit):**
> "Il sistema usa Gemini di Google con routing intelligente. In questo momento il server e sotto carico — in produzione con le classi risponde in 1-3 secondi."

---

### STEP 7 — UNLIM evidenzia componenti (1 min)
**Wow: ★★★★☆**

**Azione:** Digitare nella chat UNLIM: "Qual e il LED?"

**Cosa dire:**
> "Guardate: UNLIM non solo risponde a parole. Evidenzia il componente direttamente nel circuito. Lo studente chiede 'qual e il resistore?' e il simulatore lo illumina."

**Cosa mostrare:** Il componente LED che si evidenzia nel canvas SVG
**Cosa NON mostrare:** Non testare highlight su componenti che non esistono nel circuito corrente

---

### STEP 8 — Cambio volume: LED RGB (2 min)
**Wow: ★★★☆☆**

**Azione:** Tornare alla selezione esperimenti > Volume 1 > Cap. 7 Esp. 1 "Accendi il rosso del RGB"

**Cosa dire:**
> "Lo studente naviga tra 92 esperimenti organizzati per capitolo. Qui vediamo il LED RGB — tre colori in un solo componente. Ogni esperimento ha la stessa struttura: circuito, step, osservazione, e il tutor AI sempre disponibile."

**Cosa mostrare:** La navigazione fluida tra esperimenti, il nuovo circuito con LED RGB
**Cosa NON mostrare:** Non aprire esperimenti casuali — restare su quelli preparati

---

### STEP 9 — Volume 3: Arduino e Scratch (3 min) ★ MOMENTO CHIAVE
**Wow: ★★★★★**

**Azione:** Volume 3 > Cap. 6 Esp. 5 "Il semaforo" (v3-cap6-semaforo)

**Cosa dire:**
> "Volume 3: Arduino. Lo studente programma con Scratch — i blocchi colorati. Qui il semaforo: verde 3 secondi, giallo 1 secondo, rosso 3 secondi. Il codice gira VERAMENTE — compiliamo C++ in esadecimale e emuliamo il chip ATmega328p direttamente nel browser."

**Cosa mostrare:**
1. Il circuito con Arduino Nano, 3 LED (verde, giallo, rosso) e 3 resistori
2. Aprire il pannello Scratch/Blockly
3. I blocchi gia configurati per il semaforo
4. CLICCARE PLAY — il semaforo deve funzionare (verde > giallo > rosso in loop)
5. I LED che si accendono e spengono in sequenza nel simulatore

**Cosa NON mostrare:** Non mostrare il codice C++ generato (troppo tecnico per questa demo). Non tentare di modificare i blocchi (rischio rottura).

**FRASE CHIAVE per Giovanni:**
> "Giovanni, questo gira nel browser. Zero IDE, zero driver, zero cavi USB. Lo studente programma e vede il risultato in tempo reale. L'Arduino fisico lo usa DOPO, quando e sicuro del codice."

---

### STEP 10 — Compilazione e emulazione live (1 min)
**Wow: ★★★★☆**

**Azione:** Se il semaforo e gia in esecuzione, mostrare la console seriale (se visibile) o l'output

**Cosa dire:**
> "Il codice viene compilato da un server dedicato, l'esadecimale torna al browser, e avr8js — un emulatore open-source del chip ATmega328p — lo esegue ciclo per ciclo. E la stessa tecnologia usata da Wokwi, il simulatore online piu usato al mondo. Ma noi lo integriamo con il contenuto didattico."

**Cosa mostrare:** I LED che cambiano in tempo reale
**Cosa NON mostrare:** Non aprire la console di sviluppo, non mostrare errori di compilazione

---

### STEP 11 — Voce: STT e TTS (2 min)
**Wow: ★★★★☆**

**Azione:** Attivare il microfono nella chat UNLIM e dire: "Spiegami il semaforo"

**Cosa dire (PRIMA):**
> "Lo studente puo anche PARLARE con il tutor. Utile per i piu piccoli che non sanno ancora scrivere bene."

**Cosa mostrare:**
1. Il pulsante microfono
2. La trascrizione voice-to-text
3. La risposta del tutor
4. Se il TTS e attivo, la risposta letta ad alta voce

**Cosa NON mostrare:** Se il TTS non funziona o la voce e metallica, disattivarlo e dire: "Stiamo integrando Voxtral, il nuovo TTS di Mistral — voce naturale, zero latenza."

**PIANO B se STT non funziona:**
> "La voce usa le Web Speech API del browser. Su alcuni dispositivi richiede Chrome. In produzione funziona su tutti i Chromebook delle scuole."

---

### STEP 12 — Cambio rapido: LED Blink Arduino (1 min)
**Wow: ★★★☆☆**

**Azione:** Passare a v3-cap5-esp1 "Blink — Il primo programma Arduino"

**Cosa dire:**
> "Il classico Hello World di Arduino: accendi e spegni un LED. Lo studente parte da qui e arriva al semaforo, al servo motore, al gioco Simon Says. 27 esperimenti solo nel Volume 3."

**Cosa mostrare:** Il circuito blink con Arduino, il codice Scratch minimale
**Cosa NON mostrare:** Non entrare nei dettagli del codice C++

---

### STEP 13 — Report sessione (1 min)
**Wow: ★★★☆☆**

**Azione:** Mostrare il report di sessione (se disponibile nel menu o nella dashboard)

**Cosa dire:**
> "A fine sessione lo studente vede un report: cosa ha fatto, dove ha avuto difficolta, suggerimenti per la prossima volta. Il docente vede lo stesso report nella sua dashboard."

**Cosa mostrare:** Il report in stile fumetto/grafico se disponibile
**Cosa NON mostrare:** Se il report e vuoto o non funziona, saltare dicendo: "Il report si popola durante una sessione completa di 45 minuti."

---

### STEP 14 — Dashboard docente (2 min)
**Wow: ★★★☆☆**

**Azione:** Navigare alla Dashboard (se raggiungibile da menu/URL)

**Cosa dire:**
> "Il docente vede la classe in tempo reale. Chi sta lavorando, su quale esperimento, dove si blocca. Puo inviare suggerimenti mirati — li chiamiamo 'nudge'. Export CSV per i registri scolastici."

**Cosa mostrare:** La struttura della dashboard, le sezioni principali
**Cosa NON mostrare:** NON mostrare dati vuoti o "Nessun studente connesso". Se la dashboard e vuota, dire: "La dashboard si popola con la classe connessa. Vi mostro la struttura."

**ATTENZIONE:** La dashboard attualmente funziona con localStorage, non cross-device. Non promettere funzionalita che non ci sono.

---

### STEP 15 — Chiusura e proposta commerciale (3 min)
**Wow: ★★★★★**

**Azione:** Tornare alla home, mostrare il prodotto completo

**Cosa dire:**
> "Riassumo: 92 esperimenti che coprono ESATTAMENTE i 3 volumi del kit. Simulatore proprietario, tutor AI addestrato sui nostri contenuti, Scratch per Arduino, compilazione nel browser, voce, dashboard docente. Funziona su qualsiasi dispositivo con un browser — Chromebook, iPad, LIM. Nessuna installazione, nessun driver, nessun account studente."

**Frase di chiusura:**
> "Le scuole hanno i fondi PNRR da spendere entro giugno. Il kit fisico piu il software e un pacchetto unico — hardware, contenuto, e intelligenza artificiale. Non esiste niente di simile sul mercato italiano."

---

## 2. LISTA ESPERIMENTI DA MOSTRARE

### Volume 1 — Le Basi (scegliere 3)

| # | ID | Titolo | Perche mostrarlo | Rischio |
|---|-----|--------|-----------------|---------|
| 1 | v1-cap6-esp1 | Accendi il tuo primo LED | Primo esperimento, semplicissimo, LED si accende SICURO | Basso |
| 2 | v1-cap7-esp1 | Accendi il rosso del RGB | LED RGB impressiona visivamente, 3 colori in 1 | Basso |
| 3 | v1-cap9-esp1 | Divisore di tensione con potenziometro | Interattivo: ruoti il potenziometro e il LED cambia | Medio — verificare che il pot funzioni nel simulatore |

**Alternativa sicura:** v1-cap6-esp3 (3 LED in parallelo) — visivamente ricco, zero rischi

### Volume 2 — Approfondiamo (scegliere 2, max)

| # | ID | Titolo | Perche mostrarlo | Rischio |
|---|-----|--------|-----------------|---------|
| 1 | v2-cap6-esp1 | Condensatore carica/scarica | Componente nuovo, animazione carica visibile | Medio |
| 2 | v2-cap7-esp1 | Motore DC con transistor | Giovanni conosce i motori, componente fisico nel kit | Medio-Alto |

**ATTENZIONE Vol2:** Capitolo 3 (multimetro) ha `simulable: false`. NON mostrare Cap. 3.

### Volume 3 — Arduino (scegliere 3)

| # | ID | Titolo | Perche mostrarlo | Rischio |
|---|-----|--------|-----------------|---------|
| 1 | v3-cap5-esp1 | Blink — Il primo programma | Hello World Arduino, scratchXml presente | Basso |
| 2 | v3-cap6-semaforo | Il semaforo | 3 LED colorati, visivamente forte, scratchXml OK | Basso |
| 3 | v3-extra-simon | Simon Says | GIOCO completo, wow factor massimo | Medio — verificare pre-demo |

**Alternativa sicura Vol3:** v3-cap6-morse (SOS in codice Morse) — scratchXml presente, funziona

---

## 3. FUNZIONALITA PER PACCHETTO

### Pacchetto BASE — "ELAB Starter"
- Accesso web a tutti 92 esperimenti (3 volumi)
- Simulatore circuiti con breadboard, LED, resistori, batteria
- Passo Passo: montaggio guidato step-by-step
- 3 modalita per esperimento (Gia Montato / Passo Passo / Percorso Guidato)
- Componenti SVG realistici e interattivi
- PWA: funziona offline dopo primo caricamento
- Codice classe per accesso (zero registrazione studente)
- Compatibile: Chrome, Safari, Edge, Chromebook, iPad, LIM

### Pacchetto STANDARD — "ELAB Classroom" (BASE +)
- Tutor AI UNLIM (chat testuale, risposte contestuali)
- 638 chunk RAG dai volumi fisici (risposte fedeli al libro)
- Highlight componenti nel simulatore (AI indica cosa guardare)
- Report sessione per studente
- Dashboard docente: visione classe, progressi, export CSV
- Nudge: suggerimenti mirati dal docente allo studente
- 4 giochi didattici (Detective, POE, Reverse Engineering, Circuit Review)
- Voce: input vocale (STT) per studenti che non scrivono

### Pacchetto PREMIUM — "ELAB Pro" (STANDARD +) ← SPINGERE QUESTO
- **Arduino nel browser**: programmazione Scratch/Blockly senza IDE
- **Compilatore C++**: genera HEX da blocchi Scratch
- **Emulazione AVR**: ATmega328p emulato ciclo-per-ciclo nel browser
- **Zero installazione Arduino**: niente driver, niente cavi USB, niente IDE
- **TTS**: il tutor legge le risposte ad alta voce
- **Videolezioni** integrate per ogni capitolo (quando disponibili)
- **Percorsi guidati** avanzati con quiz intermedi
- Supporto prioritario per la scuola

### Pacchetto ENTERPRISE — "ELAB District" (PREMIUM +)
- Multi-classe: un docente gestisce piu classi
- Analytics avanzate: trend, confronto classi, report automatici
- Personalizzazione: logo scuola, esperimenti custom
- API per integrazione con registro elettronico (Argo, Axios)
- Formazione docenti dedicata (1 sessione online inclusa)
- SLA di supporto (risposta entro 24h giorni lavorativi)

---

## 4. RISPOSTE A OBIEZIONI

### "Ma funziona senza internet?"
**Risposta ONESTA:**
> "Si, e una PWA. Dopo il primo caricamento, il simulatore e gli esperimenti funzionano offline. I componenti SVG, i circuiti, gli step sono tutti nel bundle. L'unica cosa che richiede connessione e il tutor AI (servono le API Gemini) e la compilazione Arduino (serve il server). In una scuola con WiFi base, funziona perfettamente. Stiamo lavorando alla compilazione offline per le scuole con connessione instabile."

### "Quanto costa per scuola?"
**Risposta ONESTA:**
> "Il software e parte del kit. Il prezzo del kit (volumi + componenti + accesso software) e competitivo con CampuStore e altri rivenditori MePA. Per il software standalone, stiamo definendo i prezzi: l'idea e circa 20 euro per classe al mese per il pacchetto Premium, che include tutto. Ma il modello principale e kit + software insieme, come prodotto unico su MePA."

**Se insiste su numeri:**
> "Stiamo finalizzando il pricing con Davide per il MePA. I competitor come Tinkercad Classroom costano 0 per il software ma non hanno AI ne contenuto didattico. Arduino Education Kit costa 300+ euro a kit senza software di questo tipo. Noi includiamo tutto."

### "E la privacy dei bambini?"
**Risposta ONESTA:**
> "Zero dati personali raccolti dallo studente. Nessun account, nessuna email, nessuna password. Lo studente inserisce un codice classe e usa un UUID anonimo generato localmente. I dati di sessione (quale esperimento, quanto tempo) sono associati a questo UUID anonimo, mai a un nome. Il docente vede 'Studente 1, Studente 2'. Siamo GDPR-compliant by design. Se il docente vuole associare nomi, lo fa nella sua dashboard locale — mai nei nostri server."

### "Si puo usare su iPad?"
**Risposta ONESTA:**
> "Si, funziona su Safari iPad e Chrome iPad. E una web app responsive. Sulle LIM (Lavagne Interattive Multimediali) funziona a schermo pieno. L'unica limitazione attuale e il drag-and-drop dei componenti su touchscreen — stiamo ottimizzando i touch target. La programmazione Scratch su iPad funziona perche Blockly e gia ottimizzato per il touch."

### "Che differenza c'e con Tinkercad?"
**Risposta ONESTA — questa e la domanda PIU IMPORTANTE:**
> "Tinkercad e un simulatore generico. ELAB e un TUTOR. La differenza fondamentale: Tinkercad ti da un banco di lavoro vuoto e devi sapere cosa fare. ELAB ti guida passo per passo attraverso 92 esperimenti che corrispondono ai nostri libri. Ha un tutor AI che risponde usando le stesse parole del volume. Ha il Passo Passo che ti insegna a montare. Ha la modalita Scratch per programmare senza IDE.

> Tinkercad non ha: AI, contenuto didattico, guida step-by-step, dashboard docente, percorsi formativi strutturati, giochi, voce. Tinkercad e uno strumento. ELAB e un percorso didattico completo.

> In piu: Tinkercad richiede account Autodesk, email, e ha termini di servizio non compatibili con GDPR per minori senza consenso dei genitori. Noi no."

### "Come si aggiorna?"
**Risposta ONESTA:**
> "E una web app. L'aggiornamento e istantaneo — noi facciamo deploy e il prossimo caricamento della pagina ha la versione nuova. Zero intervento dell'IT scolastico. Zero installazione di aggiornamenti. Questo e un vantaggio enorme per le scuole dove l'IT e un docente volontario."

### "Serve formazione per i docenti?"
**Risposta ONESTA:**
> "Il sistema e progettato per essere autoesplicativo. Il docente apre la dashboard, vede la classe, invia suggerimenti. Lo studente apre l'esperimento e segue gli step. Detto questo, offriamo una sessione di formazione online inclusa nel pacchetto Enterprise, e stiamo preparando video tutorial per i docenti. I volumi fisici hanno gia la guida per il docente."

### DOMANDA BONUS che Giovanni potrebbe fare: "Perche non usate Arduino Cloud?"
**Risposta:**
> "Arduino Cloud richiede account, connessione stabile, e un abbonamento per le classi. Noi emuliamo il chip nel browser — lo studente scrive il codice, lo compila, e lo vede funzionare immediatamente. Quando e pronto, carica lo stesso codice sull'Arduino fisico. E il meglio dei due mondi: prototipazione rapida nel browser, verifica finale sul dispositivo reale."

---

## 5. COSE DA NON DIRE / NON MOSTRARE

### NON MOSTRARE MAI

| Cosa | Motivo |
|------|--------|
| Dashboard con zero studenti | Sembra un prodotto vuoto |
| Esperimenti Vol2 Cap3 (multimetro) | Marcati `simulable: false` |
| Esperimenti Vol3 senza buildSteps | 21 su 27 non hanno il Passo Passo |
| Scratch su esperimenti senza scratchXml | Si apre un workspace vuoto |
| Pannello Admin (#admin) | E' per lo sviluppatore |
| Console di sviluppo del browser | Mai, per nessun motivo |
| La toolbar di disegno (Pen/Select/Wire) | Non controlla veramente il simulatore |
| Drag-and-drop componenti dal pannello laterale | Non e drag reale, e quick-add |
| URL del server Nanobot o Supabase | Dettagli interni |

### NON DIRE MAI

| Cosa | Motivo |
|------|--------|
| "E ancora in beta" | Giovanni vuole un prodotto vendibile |
| "Stiamo ancora lavorando su..." | Mostra solo cosa FUNZIONA |
| "Non funziona su..." | Dire "Funziona su Chrome, Safari, Edge" (positivo) |
| "E gratis" | Il software ha valore, non svalutarlo |
| "Usiamo ChatGPT" | Usiamo Gemini con RAG proprietario, e MOLTO diverso |
| "Lo studente puo fare quello che vuole" | ELAB guida, non lascia liberi |
| "Abbiamo copiato Tinkercad" | Siamo un TUTOR, non un simulatore generico |
| I nomi dei servizi cloud (Supabase, Vercel, Render) | A Giovanni non interessa |
| "Io sono l'unico sviluppatore" | Dire "il team di sviluppo" |
| Il prezzo esatto se non concordato con Davide | Dire "stiamo definendo con Davide per il MePA" |

### SE QUALCOSA VA STORTO

| Problema | Cosa dire |
|----------|-----------|
| UNLIM non risponde | "Il tutor usa server distribuiti. In classe la risposta arriva in 1-3 secondi. Vi faccio vedere la domanda che ho preparato." (mostrare screenshot pre-salvato) |
| LED non si accende | "Lasciate che ricarichi l'esperimento." (F5 e ricaricare) |
| Scratch non compila | "La compilazione passa da un server dedicato. Vi mostro il risultato gia compilato." (passare a esperimento blink che funziona sicuro) |
| Pagina bianca | "Ricarico. E una web app, a volte il service worker va aggiornato." (Ctrl+Shift+R) |
| Voce non funziona | "La voce richiede Chrome. Vi mostro l'input testuale che fa la stessa cosa." |

---

## ORDINE DI PRIORITA SE IL TEMPO STRINGE

Se avete solo 15 minuti, fare SOLO questi 7 step:

1. **Homepage + chiave** (1 min) — Step 1+2
2. **LED si accende** (3 min) — Step 4 ← NON SALTARE MAI
3. **UNLIM risponde** (3 min) — Step 6 ← NON SALTARE MAI
4. **Semaforo Arduino + Scratch** (3 min) — Step 9 ← NON SALTARE MAI
5. **Voce** (1 min) — Step 11
6. **Differenza con Tinkercad** (2 min) — a voce, senza mostrare
7. **Chiusura commerciale** (2 min) — Step 15

I 3 momenti che Giovanni DEVE vedere: LED che si accende, AI che risponde dal libro, Arduino che gira nel browser. Tutto il resto e contorno.

---

## NOTE FINALI

**Giovanni viene dal mondo Arduino.** Sa ESATTAMENTE quanto e complicato installare l'IDE, configurare i driver, far funzionare il compilatore. Quando vede che il semaforo funziona nel browser senza nulla di installato, capisce immediatamente il valore.

**Omaric produce hardware.** Vogliono vedere che il software COMPLETA il kit, non lo sostituisce. Il messaggio e: "Il kit fisico e insostituibile. Il software lo rende 10 volte piu potente."

**Non vendere il futuro. Vendi il presente.** Tutto quello che mostri deve funzionare in demo. Se funziona davanti a Giovanni, funziona davanti a un compratore MePA.
