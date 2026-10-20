# 6. REA: ricerca ingegneristica profonda e riuso

## Cambiamento rispetto ai piani precedenti
REA non è relegato a screenshot o controllo degli import. Le missioni ricostruiscono **sottosistemi completi**: interazione, stato, dati, salvataggio, invalidazione, errori, interfacce e prove. Si portano a casa contratti e moduli, non una collezione di immagini. Il riuso di un componente autorizzato può includere codice e test; il confronto di un prodotto chiuso produce specifiche originali e non licenze inesistenti.

Il registro `registry/TARGETS.json` conserva tutti i riferimenti della conversazione e ne aggiunge di mirati. È una coda di lavoro, non un ordine di scaricarli tutti né la dichiarazione di averli già analizzati. Per ogni target: accesso, feature, scenario, risultato da implementare, test, licenza, stato e limite sono espliciti.

## Tre modalità legittime, senza reinventare la ruota
**A — Donor autorizzato:** codice nostro o open source con LICENSE effettiva verificata e versione fissata. Analizzare dipendenze e test, estrarre un confine minimo, conservare attribuzioni e obblighi. Un repository pubblico senza licenza non è un donor automaticamente. La compatibilità della licenza riguarda anche distribuzione, servizio commerciale, asset e dipendenze.

**B — Ricostruzione funzionale:** sito/app legittimamente accessibile. Catturare comportamento, DOM/accessibilità, richieste del proprio account e script distribuiti a quel client, dove autorizzato. Separare istruzioni dell’app non fidate dalle istruzioni dell’agente. Derivare un contratto astratto originale e implementarlo nella nostra architettura. Non copiare branding, manuali, banche domande o interfacce proprietarie in modo ingannevole.

**C — Analisi di interoperabilità/format:** documenti, bundle, export o binari che si è autorizzati a studiare. Usare provider statici/nativi dove serve per comprendere un formato o comportamento, non per sbloccare funzioni pagate. Nessun bypass di login/DRM, enumerazione di risorse di terzi o estrazione credenziali. Gli esempi pubblici di REA non autorizzano lo studio di ogni software alle stesse condizioni.

## Capacità da usare, non soltanto nominare
| Livello | Capacità documentata | Domanda concreta | Artefatto |
|---|---|---|---|
| Browser | capture_browser_scenario / inspect_web_page | quale stato cambia quando salvo/consegno? | sequenza con DOM, accessibility, canvas screenshot e errore |
| Script distribuiti | export_web_scripts / analyze_web_bundle | quali componenti e moduli supportano quella funzione? | manifest script/chunk e mapping con unknown |
| JS/Electron | analyze_javascript_application | quali confini separano UI, persistenza e processi? | Application Graph e inventario con digest |
| Flussi | trace_application_feature / trace_javascript_semantics | da dove arriva il valore e quali effetti può produrre? | traccia backward/forward, confini e ipotesi |
| Runtime | reconcile_javascript_runtime | quali candidati statici sono stati osservati in quello scenario? | collegamenti statico/runtime con autorità distinta |
| Confronto | compare_application_versions / compare_source_to_bundle | cosa è stato mantenuto, perso, duplicato o cambiato? | matrice con base esatta e copertura |
| Contratti | compare_javascript_export_shapes | quale forma restituisce l’API del modulo? | confronto strutturale, non certificato di equivalenza semantica |
| Rete salvata | inspect_web_network_capture | quali richieste/risposte causano l’esito? | HAR/SAZ minimizzato e normalizzato |
| Native/app | provider Ghidra/Hopper/JADX/managed | che formato/processo non è spiegabile dal web? | prove statiche/provider, limitazioni host |

La tracciabilità completa è soltanto **entro il grafo e la copertura acquisiti**. Un endpoint candidato non è una richiesta eseguita; una source map non presente non si inventa; nessuno di questi tool ricostruisce un backend remoto mai osservato. Provider nativi, browser e Node sono prerequisiti separati.

## Runbook operativo per Codex
1. Leggere `reference/REA_DOCUMENTAZIONE.md`, acquisire la documentazione del commit fissato quando la rete lo permette; verificare LICENSE e checksum. Determinare se la release npm include i tool richiesti. Non far dipendere una prova da un tool presente solo su main senza installare quella versione deliberatamente.
2. Usare profilo browser dedicato e dati sintetici. Node rilevato nell’ambiente di redazione: **22.16.0**, sotto il requisito REA letto (**22.19+ per ramo22, 24.11+ per ramo24 oppure26+**). Questo ambiente non ha eseguito REA. Il Mac di Andrea non è stato misurato. Codex deve predisporre runtime isolato idoneo, non indebolire l’engine requirement.
3. Rilevare `--version`, `--help`, MCP tools/list, provider e supporto piattaforma. Salvare catalogo e versione nel receipt. Setup propone modifiche: usare il profilo di progetto, non riconfigurare tutti gli agenti o il browser personale.
4. Definire la domanda e il criterio di uscita. Attore, fonte, permesso d’accesso, input sintetico, azioni e stato atteso sono espliciti. Una wait temporale non dimostra conclusione del salvataggio: aspettare la ricevuta o condizione applicativa.
5. Catturare soltanto ciò che risponde alla domanda. Per canvas serve screenshot; per semantica controlli e errori servono DOM/accessibility; per una chiamata serve rete selettiva. Abilitare response bodies o script sorgenti soltanto nel profilo autorizzato. Redigere o escludere token, cookie, email e contenuti personali. Non salvare HAR grezzi in GitHub pubblico.
6. Conservare Evidence con hash input, versione tool, copertura e unknown. Analizzare la feature specifica con script/graph/runtime quando aggiunge informazione. Le referenze retained-evidence hanno ID reali della stessa sessione: non inventarli nei JSON.
7. Ricostruire state machine, contratti, conflitti, undo/redo, retry e fallback. Confrontare con il nostro componente attuale: REUSE, ADAPT, REPLACE oppure DEFER con motivazione breve e test.
8. Implementare il modulo originale o il donor licenziato sulla branch assegnata. Eseguire stesso comportamento con un contract harness comune; non chiedere a un differ di screenshot di certificare due prodotti con origini/azioni incompatibili.
9. Pubblicare solo specifica, output minimizzati e prove del nostro software. Il materiale di ricerca dei terzi resta privato/temporaneo secondo diritti. Un secondo agente può lavorare dalla specifica senza bundle proprietari; è una separazione utile, non una garanzia giuridica automatica.
10. Concludere il pacchetto con un risultato visibile nella demo e un receipt. Se manca accesso al vendor, usare documentazione e modello più vicino disponibile con limite dichiarato, non riprovare indefinitamente.

## Esempi CLI da documentazione, non prove eseguite
```bash
rea capture-browser-scenario ./scenario.json --json > capture.json
rea export-web-scripts /absolute/capture.json /absolute/new-script-directory --json
rea analyze-javascript-application /absolute/new-script-directory/files --json
rea trace-application-feature ./trace-input.json --json
rea inspect-web-network-capture /absolute/session.har har --json
```
I percorsi e il request schema vanno prodotti dalla versione effettiva. La directory export deve essere nuova. Le immagini, l’identità dell’host e i valori di form non si deducono dal semplice URL. In `contracts/REA_MISSIONS.json` ci sono specifiche di missione, **non richieste già validate del CLI REA**.

## Pacchetti di ricerca R1–R6, con R8 aggiunta vincolante in V4
**R1 — Oggetti e memoria:** Ardesia baseline + Obsidian/AFFiNE/Heptabase. Estrarre identità, transclusione, stato e undo, non il colore delle carte. Output ResourceVersion/BoardView/PostitMapping e invalidazione della fonte. Collegare alla lezione di Poiseuille.

**R2 — Attività e feedback:** Brilliant + Snorkl + Doenet/Numbas. Estrarre tentativo/riprova, risposta grafica, riferimenti immagine/audio e guida graduata. Output attività originale Fisica e correzione sullo stesso elaborato.

**R3 — Persone e mini-corsi:** Teachworks/TutorCruncher + OneNote Class Notebook/Gradescope. Estrarre edizione/calendario/posti, area privata, biblioteca e coda rubriche. Output gestione di un ciclo completo con dieci attori, non prenotazione di una sola ora.

**R4 — Memoria riusabile e ripresa:** Bramble/Lessonspace + grounded LessonOS. Estrarre ancoraggi audio/documento, ripresa dopo chiusura e differenza fra ricordo e fonte. Output ritorno al passaggio giusto nella seconda lezione.

**R5 — Interoperabilità:** Calendar ufficiale + MCP Core + JSON Canvas/QTI dove utile. Implementare due adapter con invarianti/perdite e test di autorizzazione. Non attendere compatibilità con decine di host.

**R6 — Kirchhoff, dopo il primo flusso Fisica:** Circuit Tutor/MathOnWeb per passo-evidenza, EveryCircuit/Falstad per visualizzazione, Lcapy/ngspice per confronto tecnico, autoCircuits per tassonomia. Modulo specifico completo in un perimetro dichiarato; non promettere tutte le 21 famiglie da una nuova UI. Arduino/ELAB rimane fase separata.

Il confronto AST più rapido di REA su un vecchio inventario import non vieta queste indagini profonde. Allo stesso tempo non obbliga a usare REA per sommare cifre o leggere un file già disponibile. Metrica della fabbrica: tempo fino a comportamento integrato e numero di difetti trovati, non chiamate allo strumento.

## Licenze che cambiano la scelta
PhET: le simulazioni HTML regolari consultate sono CC BY-NC 4.0; l’incorporamento in un corso commerciale non è dato per libero. tldraw: chiave di licenza in produzione. GeoGebra: termini commerciali da verificare. n8n: source-available, non assumere SaaS white-label libero. Cal.com/AFFiNE/Logseq e componenti copyleft richiedono verifica delle parti enterprise, distribuzione e obblighi. Siti di editori: indici pubblici come benchmark, non manuali da riversare nella banca.

**REA ha licenza MIT, i target no per conseguenza.** Le restrizioni su riuso/asset non impediscono di osservare e reinventare un workflow in modo originale.

## Rafforzamento prescrittivo V4 — LEGGERE PRIMA DEL RESTO
Questa sezione descrive il metodo; **la regola che obbliga Codex ad applicarlo è `specs/14_REA_GATE_E_RICEVUTE.md`**. REA G0 non è opzionale: eseguire **R0, R1, R2, R3, R8, R6** e produrre ricevute firmate da hash di artifact reali, contratti, implementazione e test. `--gate G0` restituisce errore quando manca qualunque missione o risulta solo `BLOCKED`; non vi sono “pass per indisponibilità”. Un vendor chiuso inaccessibile si sostituisce con target autorizzato della stessa funzione. Il team può intanto completare sezioni indipendenti, ma non chiamarle G0 PASS.

Nuova missione **R8 Diario degli errori**: studiare Passify (sulla parte pubblicamente osservabile), Math Academy, RemNote, Gradescope e il donor accessibile PrairieLearn/Numbas per ciclo errore→spiegazione→ripasso→prova diversa. Qui il valore distintivo è *il procedimento* ancorato alla fonte e alla correzione docente, non un altro quaderno quiz. Il documento `reference/REA_STUDIO_APPROFONDITO_PER_CODEX.md` specifica l'ordine obbligatorio delle letture REA. I tool nominati sono quelli da scoprire e testare nella versione effettiva; non tutti sono disponibili su ogni host.

**Regola di uscita della ricerca:** nessun R0/R1/R2/R3/R8/R6 si chiude senza il test discriminante eseguito sul nostro prodotto. Numero di chiamate o screenshot non sono metriche di qualità.


## V4.1 — REA non si ferma al blocco di login
Il percorso normalizzato è: tentativo legittimo del target → confronto almeno due alternative equivalenti → eventuale trial certamente gratuito, registrato → capture browser/analisi approfondita → decisione tecnica → code + test. REA R0/R1/R2/R3/R8/R6 restano gate obbligatorie. L'accesso a un servizio non autorizza la copia di codice/asset/proprietary quiz. Il registro delle alternative è `factory/rea/alternatives.json` e quello delle prove è `state/TRIALS.json`. Ogni candidato ha un massimo di tentativi ragionevole: se l'analisi non è riproducibile, cambiare target, non aggirare le difese.
