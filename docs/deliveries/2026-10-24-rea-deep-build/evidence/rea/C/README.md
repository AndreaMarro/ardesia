# Missione C — CircuitJS/Falstad, osservazione e trasferimento circoscritto

24 ottobre 2026. REA CLI **6.7.0**, Chromium **148.0.7778.96**, viewport 1440×1000, reduced-motion, service worker bloccato. Il [ticket a 13 campi](C-transfer-ticket.json) distingue osservazione donor, trasposizione originale, implementazione del destinatario e prove indipendenti del destinatario. **Non è una ricostruzione CircuitJS**, né un'analogia fisica fra circuito e fluido.

Azioni vere: LRC → Circuits → Basics → Ohm's Law → Stop → due campioni → Reset → ripresa → due campioni → Resistors → menu contestuale. Il percorso finale contiene 17 step completati. In Ohm's Law la scena mostra +5 V e due rami 100 Ω/50 mA e 1 kΩ/5 mA. Le due PNG a simulazione ferma hanno gli stessi byte; quelle dopo ripresa differiscono. Il pulsante cambia nome accessibile fra `RUN / Stop` e `Run / STOP`.

Reset è stato cliccato da fermo e non cambia il frame campionato: **azzeramento numerico non dimostrato**. La modifica di R non è stata raggiunta: parametri e componenti sono canvas, senza locator semantico, e la CLI dichiarativa non offre drag a coordinate. Il clic destro al centro apre l'aggiunta componenti, non l'editor del resistore.

La [pagina primaria About](https://www.falstad.com/circuit/about.html) dichiara GPL v2 o successiva per il programma e crediti separati per librerie/icone; [COPYING del repository autore](https://github.com/pfalstad/circuitjs1/blob/master/COPYING.txt) è stato letto e digerito. Il campo versione About è vuoto. Identità fissata agli asset serviti sotto `circuitjs112`, non a una versione dedotta dal nome o a un commit upstream non confrontato:

- JS `circuitjs-D4a6dPHu.js`: SHA-256 `e6d868e7bfa82a1d9c928dacc12b0d9c10b9c07e533fd2a8a920a7d4c6e186b5`.
- CSS `circuitjs-DDWVHsFC.css`: SHA-256 `4ba1f27abada17ee255486ff3b7ff635c347af7d52634a4906de78c616fa62d4`.

Nessun codice GPL, definizione di circuito, stile o icona è importato in Ardesia. Raw zip e PNG donor restano soltanto in `work/deep-build/rea/`: il DOM catturato contiene path SVG/icone, quindi non viene inclusa qui una redistribuzione di quei contenuti. Ticket e hash consentono di identificare le prove senza pretendere un clearance dei raw. I file JS sono stati letti in memoria solo per SHA-256; non sono conservati. Le schermate sono prove diagnostiche, non nuovi asset dell'interfaccia.

Il trasferimento proposto è originale: in Poiseuille rendere esplicito il vincolo, controllare il raggio, mostrare quantità Core e uno stato visuale derivato da Q/area, con pausa/ripetizione e controllo accessibile. Formula e dominio rimangono nel Core Ardesia. Il destinatario `PoiseuilleVisual.tsx` è stato poi verificato indipendentemente: 118 controlli mirati PASS sulle quattro larghezze, movimento reale/pausa/reduced-motion e rapporti della proiezione Core. Il finding sul contrasto delle etichette è stato corretto dall'autore e ricontrollato a 7,215:1; altri 8 controlli PASS sul composto finale coprono focus e voce. Le prove sono nella [review del destinatario](../../review/C-public/README.md); nessun successo donor viene spacciato per test del destinatario.

## Prove e fallimenti conservati

- Archivio originale **locale, escluso dalla consegna pubblicabile**: `work/deep-build/rea/C-capture-records.zip`: scenari, Evidence CLI, stderr e baseline del root. Oggetti nuovi `ev_5c47f911…`, `ev_9f7e295b…` (incompleto), `ev_351b4e41…` (completo); hash completi nel ticket.
- [Verifica del perimetro osservato](C-verification.json): 17 step, frame fermi uguali, frame dopo ripresa diversi, label Resistors e 13 campi.
- [Digest asset riusciti](C-asset-digests-curl.json) e [fallimento TLS urllib](C-asset-digests.json): curl ha usato la propria verifica TLS, senza bypass.
- Un primo input con locator `text` non ammesso è stato rifiutato prima del browser. Corretto con CSS derivato dal DOM già catturato. Un successivo tentativo di ripresa usa il vecchio nome esatto del pulsante: timeout 10 s e azioni rimanenti cancellate. La variante successiva usa il nuovo nome osservato; nessun aumento di timeout.
- L'errore di registrazione service worker dovuto alla policy della cattura e il messaggio CompositeElm rimangono negli eventi. La completezza REA riguarda il perimetro selezionato, non assenza universale di problemi.

Riprodurre estraendo l'archivio in una directory di lavoro, poi:

```sh
PATH=/opt/homebrew/bin:$PATH /Users/andreamarro/.npm/_npx/a1722018f28f9df2/node_modules/.bin/rea capture-browser-scenario C-state-examples-v2.json --format json
```

Il percorso Chromium nello scenario è locale: su un altro host va adattato e dichiarato. Il sito remoto può cambiare; gli hash conservati identificano l'osservazione, non promettono che una replica futura abbia gli stessi byte o tempi.
