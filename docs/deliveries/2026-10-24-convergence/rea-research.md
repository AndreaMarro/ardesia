# REA Research Lab — Ardesia

**Data della verifica: 24 ottobre 2026.** Ricerca primaria, ispezione dei reperti storici e prova locale riproducibile. Questo rapporto distingue capacità documentate, risultati misurati e lavoro proposto. I reperti originali sono conservati in `evidence/rea/rea-original-evidence.zip`, con risultati selezionati e runner portabili in `evidence/rea/`; non sono stati modificati repository remoti, configurazioni MCP globali o prodotti terzi.

## 1. Decisione che incide sul prossimo incremento

**REA è disponibile e funziona nell’ambiente, ma il primo investimento di Ardesia deve essere rendere affidabile e visibile il proprio flusso di lezione.** Per correggere una classe TypeScript disponibile nel repository, ricerca nel sorgente, test e browser reale offrono un percorso più diretto. REA aggiunge valore quando occorre stabilire cosa contiene un pacchetto distribuito, collegarlo al codice, osservare un comportamento reale o ricostruire una specifica che il sorgente non rende evidente. Anche la skill ufficiale suggerisce di saltare REA per l’ordinaria analisi architetturale di un repository sorgente. [R1–R3]

La prova svolta sul build marketing di Ardesia conferma un percorso mobile concreto: scelta del corso, esempio, suggerimento, soluzione ragionata, spiegazione dell’errore e ritorno con corso selezionato. Non conferma tentativi valutati, persistenza dello studente o audio: nel bersaglio osservato queste capacità non compaiono. L’esempio di fluidi riguarda `p = F/A`, non la legge di Poiseuille. Il nome di un percorso o una schermata convincente non basta a dimostrare il sottosistema didattico promesso.

La ricognizione del lavoro precedente impedisce un altro errore: l’esistenza di 139 target o di una ricevuta MCP non dimostra 139 componenti ricostruiti. Ci sono acquisizioni di superficie e alcune indagini più profonde, da conservare con il loro ambito effettivo. Non occorre ripartire da zero; occorre promuovere a componente riutilizzabile solo ciò che supera una specifica verificabile.

**Ordine raccomandato:** lifecycle audio e isolamento della lezione; singola esperienza predizione–simulazione–feedback; prova di un ponte tra evento, risorsa e istante. REA rimane uno strumento di indagine e raccolta delle prove in questi incrementi, senza diventare una dipendenza del prodotto.

## 2. Identità, installazione e limiti dell’ambiente

| Elemento | Riscontro |
|---|---|
| Distribuzione ufficiale | npm `rea-agents`, repository dichiarato `git+https://github.com/morluto/rea.git` |
| Versione installata e verificata dalla CLI | **6.7.0** |
| Release GitHub | `rea-agents-6.7.0`, pubblicata il 18 ottobre 2026 alle 07:45:18 UTC |
| Commit della release | `27dc42d10249f0410904a75c0997842eb03b931c` |
| Integrità npm | `sha512-yhIx2ioJYYT1C/tONfYeitC6LhnKmCh+ZwRUOgYuhSc733lGhkkt73zhug9WmLgxoMdKuqIYGCoBfD4fXkOhFw==` |
| Licenza dichiarata | MIT |
| Node del laboratorio | v24.22.1, npm 11.9.0 |
| Engine della release npm | `^22.19.0 || ^24.11.0 || >=26.0.0` |
| Engine letto sul ramo main | `^22.23.4 || ^24.22.1 || >=26.12.1` |
| Installazione | Prefisso locale `rea-lab/toolchain`, versione esatta, `--ignore-scripts --no-audit --no-fund` |

I requisiti di `main` e quelli del pacchetto pubblicato differiscono: la documentazione più recente non deve essere trattata come schema eseguibile della versione installata. Sono stati letti `--help`, schema del comando browser e schema interno della distribuzione. I metadati npm e della release sono salvati localmente. [R1, R4, R5]

L’installazione REA ha aggiunto 174 pacchetti in circa sei secondi riportati da npm. La distribuzione dichiara circa 28,6 MB non compressi; questa misura non include tutte le dipendenze né Chromium. Non sono stati registrati server MCP in Codex o Claude. La CLI ha consentito la prova senza account, chiavi API o pagamento di un provider.

Due blocchi ambientali sono documentati, senza trasformarli in risultati positivi:

1. La prima analisi statica nel sandbox ristretto falliva durante il controllo del processo con `ps`, con messaggio `fatal library error, lookup self` e capacità indisponibile. Lo stesso comando, autorizzato dall’ambiente di esecuzione ampliato, ha completato la prova.
2. Il download standard di Chromium tramite Playwright ha restituito una pagina HTML di 195 byte, `Site Unavailable`, dall’URL CDN atteso per lo ZIP. Il fallback è stato il pacchetto pubblico `@sparticuz/chromium@153.0.0`, installato solo nel laboratorio. L’estrattore iniziale falliva su `chown`; l’estrazione Brotli locale ha prodotto un eseguibile verificato da 209.022.176 byte, **Chromium 153.0.8010.0**. Il percorso valido è `rea-lab/browser-bin/chromium`. È stato usato il lancio ordinario di Playwright/REA, senza adottare i flag permissivi aggiuntivi suggeriti dal pacchetto.

Questi interventi sono costi reali di setup. Non devono scomparire da una futura valutazione economica solo perché i comandi finali durano pochi secondi.

## 3. Architettura e capacità: cosa abbiamo effettivamente stabilito

REA espone una CLI, un server MCP e una skill che guida l’agente nella scelta degli strumenti. Le operazioni costruiscono ricevute ed evidenze identificabili, utilizzano provider specializzati dove necessari e separano osservazione statica da attività di runtime. Non è un compilatore che trasforma automaticamente un prodotto commerciale in un equivalente mantenibile. La specifica, l’implementazione indipendente e la verifica rimangono lavoro esplicito. [R1–R3, R6–R9]

| Area | Capacità documentata | Verifica in questa sessione | Limite rilevante |
|---|---|---|---|
| CLI e metadati | Comandi e schema, output JSON | **Eseguita**, versione 6.7.0 | Schema della release prevale sugli esempi di main |
| MCP | Strumenti esposti a client compatibili, integrazione Codex/Claude | Ricevuta storica ispezionata; nessuna nuova registrazione | Numero di tool non misura capacità ricostruite |
| JavaScript | Inventario, parsing, dipendenze, grafo semantico e relazione con artefatti | **Eseguita** su build HTML/JS locale | Analisi statica; import dinamici e valori runtime possono restare ignoti |
| Electron | Analisi di pacchetti, ruoli main/preload/renderer e seam | Documentazione ispezionata | Non provato su un’app Electron; un ruolo inferito non prova uso di Electron |
| Browser | Sessione propria o collegamento, sequenze di azioni, DOM, accessibilità, rete, storage, screenshot | **Eseguita**, otto azioni mobili | Ordine di ricezione degli eventi non dimostra causalità; scenario non fornisce automaticamente gli stack degli iniziatori di rete |
| Native e binari | Formati, disassemblaggio/decompilazione, riferimenti, provider esterni | Documentazione ispezionata | Nessun binario proprietario aperto; Ghidra/Hopper non installati né misurati |
| Process/runtime capture | Osservazione dichiarata di processi e risorse | Non eseguita fuori dal browser del laboratorio | Lancio o attach richiede perimetro esplicito e ambiente compatibile |
| API e protocolli | Esame delle richieste e di evidenze osservabili | Solo GET locali del bersaglio | Nessuna inferenza di API private, auth o backend non osservati |
| Esportazione | Evidenze, identificatori, bundle/receipt | JSON conservati, manifest locale con SHA256 | Integrità del reperto non equivale a completezza funzionale |

Ghidra è un framework aperto con licenza Apache-2.0 e componenti terzi da rispettare; Hopper è un prodotto commerciale con licenza propria. La FAQ di Hopper chiarisce anche che il pseudocodice non coincide con il recupero del sorgente originale compilabile. Nessuno dei due è necessario per il percorso JS/browser provato qui. La licenza MIT di REA non concede diritti su software, provider, asset o modelli analizzati. [R9, R10, R11]

I casi ufficiali dello showcase sono utili perché circoscritti: ad esempio una funzione di calcolo in DX-Ball, un helper di TH04, un ponte clipboard di Notion o comportamenti di Aegis. Vanno letti come dimostrazioni del metodo su seam specifici, non come certificazione di ricostruzione completa di prodotti. [R12]

## 4. Audit delle prove Ardesia già disponibili

Ispezione in sola lettura del precedente checkout, in particolare `docs/ops/ARDESIA-REA-DEPTH-139.md`, `docs/ops/rea-deep/`, `factory/rea/` e `docs/deliveries/2026-10-20-rea/reports/REA_RICEVUTA_SETUP.json`.

| Reperto | Cosa sostiene | Cosa non sostiene |
|---|---|---|
| Matrice 139 target | Catalogo ampio, superfici e provenienza iniziale | Molte voci sono `NO_SOURCE_GRAPH_TRACE`; nessuna equivalenza automatica a 139 ricostruzioni |
| Ricevuta 20 ottobre | REA 6.7.0, smoke MCP, inventario ZIP, 207 strumenti dichiarati | La ricevuta marca ricostruzione `NOT_STARTED`, browser `NOT_RUN`, provider nativi `NOT_CONFIGURED` |
| Target Moodle, PrairieLearn, AFFiNE | Alcuni workflow mirati con prove più profonde | Non autorizzano un giudizio globale di parità con gli interi prodotti |
| TARGET-082 notebook | Evidenze più recenti relative al percorso PDF/notebook | Non va duplicato lo stesso esperimento come se mancasse tutto |

La conclusione è recuperare artefatti con identità, comando, versione, target, esito e limite, lasciando separati inventario, osservazione, ipotesi, implementazione e verifica. Una matrice di maturità può usare questi cinque stati, senza moltiplicare nuove tassonomie nel prodotto.

## 5. Esperimento reale E0: continuità di un percorso didattico sul build

### Bersaglio e domanda

Codice originale Ardesia, base PR #290, commit **`339ab08f4139da0b37e78bbde81e9fe4e83afea0`**. Il target è il build generato con:

```sh
python3 apps/marketing-01/build.py --review-examples --output /percorso/rea-lab/marketing-artifact
```

Domanda: il comportamento distribuito conserva il corso attraverso una visita all’esempio e separa davvero suggerimento, soluzione e spiegazione dell’errore? La domanda non richiede accesso a prodotti terzi, dati studenti, credenziali o chiamate a servizi AI.

### Osservazione ed evidenza

Analisi statica mediante `analyze-javascript-application`, timeout 30 secondi e heap massimo 256 MB. Risultato: exit 0 in **1.785 ms**; otto file pertinenti, un file JS analizzato, zero errori di parsing, 62.015 byte di input considerati, 794 nodi AST. Grafo con 11 nodi e grafo semantico con 619 nodi. Sono recuperate `choose` alle righe 10–27 e `fromURL` alle righe 28–34 dell’asset emesso.

Scenario browser isolato: viewport 390×844, lingua italiana, movimento ridotto, server HTTP effimero su loopback. Otto azioni: attesa della pagina, selezione fluidi, apertura esempio, suggerimento, soluzione, spiegazione dell’errore, ritorno, attesa esplicita del radio del corso selezionato. Il browser raccoglie DOM/accessibilità/URL/storage, eventi e screenshot finale. Non attiva collegamenti esterni.

Risultato runtime: exit 0, **1.869 ms** di CLI; **984 ms** durata dichiarata dello scenario. Cattura completa nel perimetro richiesto, nessuna troncatura dichiarata, browser posseduto terminato. Tredici richieste e tredici risposte, tutte GET dello stesso origin locale; nessun errore pagina catturato. URL finale `/?percorso=fluidi-termodinamica#fluidi-termodinamica`. Storage finale vuoto.

### Specifica implementata e verifica indipendente

La specifica di regressione comprende: il suggerimento non apre da solo la soluzione; la soluzione non apre da sola la spiegazione dell’errore; il ritorno preserva ID canonico, ancora e selezione effettiva; il build contiene lo stesso JavaScript del sorgente dichiarato; la cattura non usa origin esterni e chiude il browser.

È stato scritto `verify_marketing_evidence.py`, con parser HTML e verifica degli hash, che esamina le evidenze conservate invece di fidarsi del solo exit code REA. **Dodici asserzioni su dodici passano.** `run_marketing_experiment.py` rende ripetibile acquisizione e server locale. Questo implementa una verifica del contratto osservato, non una nuova funzionalità per lo studente né una ricostruzione completa di un componente. La catena target → osservazione → evidenza → specifica → implementazione del verificatore → test è conclusa per questo ristretto oggetto. La ricostruzione e integrazione di una nuova feature sono oggetto dei protocolli E1–E3 seguenti e non sono dichiarate eseguite.

### Identità dei risultati e confini

| Prova | Identificatore / file |
|---|---|
| Evidenza statica | `ev_f4f4897b6c8cbde6f0e13c195e2ac0b6d47a60182a4cf2afe0709d0a15ca7f55` |
| Evidenza runtime | `ev_eec60a4bf5277a03bdee83bbac5e07d8eb8d8555e19e41c115a5f945ed8ba873` |
| SHA256 artefatto REA | `22ab32c933f637003e770993953991e5d235f1e829b1798008a585b323607a64` |
| SHA256 JS sorgente/emesso | `084d55bb702f480833342b4641462c5b30a68c00f059108778772b2de86f7a83` |
| Dati grezzi | `marketing-static-evidence.json`, `marketing-runtime-evidence.json` |
| Asserzioni | `marketing-experiment-verification.json` |
| Immagine originale della cattura | `marketing-course-return-mobile.png` |
| Integrità dei reperti | `manifest.json` |

L’ispezione visiva dello screenshot conferma una card leggibile in questo viewport. Non è una verifica esaustiva di accessibilità, browser, touch o schermi. Mancano controlli per inviare una risposta, audio/video, persistenza locale e traccia studente; non è stato verificato un deployment pubblico. Nessun materiale in bozza viene promosso a contenuto approvato da questo test.

## 6. Tempi e convenienza: numeri misurati e numeri che mancano

Una query AST diretta sullo stesso asset di 4.986 byte ha individuato le due funzioni in **16,502 ms** in una prima misura. È disponibile anche `compare_direct_ast.cjs`, con risultato separato `direct-ast-comparison-reproducible.json`: esplicita che cronometra parsing e visita, escludendo avvio Node, import e lettura. REA ha richiesto 1.785 ms per inventario, hash e grafi dell’intero target. **Non sono lavori equivalenti: non si può ricavare un fattore di accelerazione da questi due numeri.** La misura suggerisce soltanto che una piccola domanda sul sorgente non giustifica automaticamente l’intero percorso REA.

Il JSON statico pesa circa 1,06 MB, quello runtime 366 KB: passare tutto al modello sarebbe un costo di contesto evitabile. Cercare simboli e richiedere viste ristrette è parte del metodo. I tempi di acquisizione sono misurati; il tempo umano risparmiato, il costo dell’agente e la riduzione di difetti non lo sono. Nessuna fattura API è stata generata da questi comandi, ma questo non equivale a costo complessivo zero.

| Strategia | Quando conviene ad Ardesia | Costo che va contato | Esito di questa ricerca |
|---|---|---|---|
| A. Sviluppo originale | Contratto didattico piccolo e distintivo, sorgente interno disponibile | Specifica, implementazione, regressioni | Prima scelta per percorso Poiseuille e lifecycle interno |
| B. Riuso open source | Parser, editor matematico, rendering documenti | Adattatore, aggiornamenti, bundle, licenze, accessibilità | PDF.js/MathLive già presenti: consolidare il riuso |
| C. API pubblica | Interoperabilità con contratto stabile | Auth, schema, quota, latenza, affidabilità | Prima della decompilazione; nessuna integrazione API provata qui |
| D. Osservazione e reimplementazione | Microinterazione utile senza componente riusabile adeguato | Corpus di casi, specifica originale, confronto | Appropriata per pattern UX; evitare imitazione di interi prodotti |
| E. REA su artefatti autorizzati | Differenza sorgente/build, seam opaco, app pacchettizzata | Setup, acquisizione, triage, runtime, verifica | Provata; non dimostrato risparmio netto rispetto alla via sorgente |
| F. Composizione | Riutilizzare motori già disponibili mantenendo uno spazio utente | Adattatori, consistenza stato, versioni, test tra moduli | Forte candidato per Kirchhoff e LessonOS, senza nuovo kernel |
| G. Sostituzione | Dipendenza blocca prodotto o costo/diritti diventano sfavorevoli | Migrazione dati, parità necessaria, supporto e rollback | Nessuna sostituzione generale giustificata dal test attuale |

Per ogni pilot misurare `T_totale = setup + osservazione + specifica + implementazione + verifica + migrazione + manutenzione attesa`. Il risparmio è la differenza rispetto a un’alternativa con **gli stessi criteri di accettazione**. Un limite operativo proposto è fermare una prima indagine dopo mezza giornata se non ha ridotto un’incertezza bloccante o prodotto una specifica implementabile. Questa è una regola di budget proposta, non una misura osservata.

## 7. Tre esperimenti prioritari, delimitati e riproducibili

Le durate qui indicate sono **stime di pianificazione**, riferite a un singolo sviluppatore che conosce il repository; non sono preventivi verificati. Lo stato E1–E3 è `PROPOSED`, salvo le verifiche audio native documentate separatamente se completate nella stessa sessione. Una prova del registratore da sola non completa il ponte LessonOS di E3.

### E1 — Grafica e interazione: Poiseuille, previsione prima del controllo

**Target:** il simulatore di fluidi originale già disponibile in Ardesia/Web PhysicsLab, alla revisione fissata prima del test. Nessuna acquisizione di Brilliant o PhET come codice. **Domanda:** un’unica scena conduce lo studente da una previsione esplicita all’effetto di una variazione del raggio, mantenendo unità e vincoli del modello?

**Contratto:** registrare la previsione prima di sbloccare il controllo; variare il raggio entro intervallo documentato; mostrare rapporto di portata e spiegazione; permettere un nuovo tentativo con stato riconoscibile. Il caso raddoppio del raggio, a parità degli altri parametri e nel modello laminare adottato, è un oracolo numerico da verificare nel motore. La scena non deve far passare il modello ideale per una previsione clinica.

**Procedura:** build locale fissato → cattura REA di stato iniziale e interazioni → confronto del calcolo con sorgente/test numerico → specifica degli stati e tastiera → implementazione originale con SVG/DOM e componenti esistenti → test browser a desktop/mobile, riduzione movimento e ricarica. REA serve a conservare il contratto del build, non a progettare la matematica. Per controlli e formula disponibili nel codice, AST e test restano la via diretta.

**Gate:** valori corretti, nessuna risposta rivelata prima della previsione, controlli utilizzabili da tastiera, feedback spiegabile, spazio stabile senza overflow, evento didattico con parametri e unità; altrimenti non chiamare la scena esercizio completo. **Stima:** 0,5–1 giorno per specifica/prova, 1–2 giorni per la slice se il simulatore esistente è sano. **Risparmio da misurare:** minuti necessari per produrre una seconda attività coerente dopo aver costruito la prima, rispetto a due implementazioni originali isolate.

### E2 — Componente complesso riutilizzabile: riferimento PDF durevole

**Target:** PDF.js e notebook già in Ardesia, con fixture PDF originale e hash noto. TARGET-082 ha già prove: il nuovo esperimento deve isolare un rischio non coperto, ad esempio riapertura di un riferimento dopo cambio di zoom e riavvio.

**Contratto:** un riferimento conserva identità del documento, indice pagina, rettangolo in coordinate del documento e testo selezionato quando disponibile. Alla riapertura evidenzia la regione corretta e mantiene separata la citazione dalla trascrizione/interpretazione. Documento mancante o hash cambiato produce uno stato esplicito, non una citazione apparentemente valida.

**Procedura:** corpus minimo con testo, rotazione e documento scansionato → inventario REA del build e dipendenze realmente emesse → osservazione selezione/riapertura → specifica dell’adattatore sul componente canonico → implementazione piccola senza nuovo motore PDF → test round-trip a due zoom, dopo reload e con file sostituito. Una pagina scansionata senza OCR non autorizza inventare testo.

**Gate:** coordinate stabili e riferimento verificabile; navigazione da tastiera; memoria e dimensione del bundle misurate; nessuna duplicazione del renderer. **Stima:** 0,5 giorno di ricognizione e 1–3 giorni di adattatore/test, se l’attuale integrazione espone le coordinate necessarie. **Risparmio da misurare:** tempo di authoring di dieci riferimenti e tasso di riaperture corrette. **No-go:** formato canonico duplicato o layer PDF nuovo per aggirare un seam riparabile.

### E3 — LessonOS, audio e interoperabilità: evento collegato a un istante

**Target:** `AudioRecorder`, store e journal originali, audio sintetico, una sola lezione e due room distinte. Prima chiudere lifecycle e isolamento; il fatto che una classe salvi un blob non dimostra l’integrazione, specialmente se il punto d’ingresso passa `audioRecorder: null` o il journal rifiuta marker audio.

**Contratto:** consenso iniziale OFF; un’unica origine temporale; registrazione breve seguita da stop conserva il chunk finale; il marker è pubblicato solo dopo storage riuscito; revoca interrompe le tracce e rimuove i chunk; un permesso risolto dopo revoca non riavvia la registrazione. Un evento didattico contiene riferimenti a lezione, tempo e risorsa, poi la UI torna al punto corretto. Export include soltanto riferimenti validi e autorizzati; import segnala ciò che manca.

**Procedura:** test del lifecycle con `MediaRecorder` nativo e stream WebAudio sintetico → cattura REA del build che incorpora il recorder e del percorso UI → specifica di un adattatore nel servizio esistente → implementazione della connessione al journal canonico → test di stop corto, revoca durante scrittura e autorizzazione pendente, replay/export/import e cambio room. Nessun microfono reale né dato studente necessario per il pilot.

**Gate:** blob decodificabile e non vuoto, ordine storage/marker verificato, nessuna traccia viva dopo stop/revoca, nessun evento nella room sbagliata, nessuna promessa di sincronizzazione dedotta soltanto da timestamp simili. **Stima:** 0,5–1 giorno per protocollo e test nativo; 2–4 giorni per ponte minimo e UI se il journal ha un contratto canonico compatibile. Se richiede cambiare l’intero formato eventi, ridurre il perimetro e produrre una migrazione esplicita. **Risparmio da misurare:** secondi necessari al docente per ritrovare una spiegazione e quantità di riferimenti persi dopo riapertura.

## 8. ArtCraft: ciò che è trasferibile e ciò che non è dimostrato

Fonti primarie consultate: catalogo ArtCraft, pagina PhotoCraft, organizzazione Storytold, repository PhotoCraft, WordCraft e craft-libs, guide degli agenti e documento sulla parità. Non è stato eseguito il software e non è disponibile in questa ricerca un audit indipendente dei costi o della completezza. **Nessuna fonte consultata stabilisce che ArtCraft sia stato costruito con REA.** [A1–A7]

Il catalogo presenta una famiglia di applicazioni native Rust, molte ancora in sviluppo. PhotoCraft si definisce early alpha e il README non lo presenta come sostituto quotidiano per un professionista. Il conteggio dei comandi cablati non equivale a completamento del loro comportamento; lo stesso progetto distingue queste cose. Le affermazioni su centinaia di comandi e corpus PSD restano risultati dichiarati dagli autori finché non rieseguiti. [A1–A3]

Le metriche richiedono il loro denominatore: la pagina commerciale parla di 134/135 round-trip byte per byte; il README distingue corpus del modello dell’applicazione, rendering e parser indipendente, con numeri e garanzie diversi. Una garanzia del parser non si trasferisce all’intero editor. Non c’è base per derivare da questi dati parità complessiva, numero di settimane-persona risparmiate o budget totale. [A2, A3]

I principi organizzativi più utili sono concreti:

- **Un registro di comandi condiviso** per GUI, CLI, JSON e MCP. Ardesia può esporre i servizi canonici già esistenti, evitando che il comando dell’agente e il gesto UI implementino due versioni della stessa modifica.
- **Confini stretti e testabili:** i documenti degli agenti distinguono motore, livelli superiori e UI; una modifica deve rispettare i gate del livello pertinente. Questo aiuta a assegnare a un agente una specifica piccola e controllarne il risultato.
- **Oracoli e corpus:** rendering CPU di riferimento, confronto GPU, file sintetici e realistici, round-trip e snapshot. Per Ardesia gli analoghi utili sono formule con risultati noti, documenti con ancore, replay di due room e registrazioni brevi.
- **Dipendenze condivise fissate a revisione:** craft-libs è organizzato per riuso tra prodotti; il principio è consolidare duplicazioni dimostrate, non inventare un nuovo framework per ogni modulo.
- **Stati di capacità espliciti:** le funzioni non supportate devono dichiararlo e i gate devono verificare comportamento, non sola presenza di menu. Originalità e attribuzione degli asset sono trattate separatamente dalla licenza del codice. [A3–A7]

Non si deduce da questo una ragione per riscrivere Ardesia in Rust. Il costo dominante nel percorso attuale è chiudere contratti e collegamenti già presenti. La convergenza del codice e delle prove è un principio trasferibile; il numero di applicazioni annunciate non è una metrica da imitare.

## 9. Strumenti complementari e decisioni di riuso

La tabella riporta metadati primari e giudizio di integrazione. Le versioni npm sono quelle osservate il 24 ottobre, **non un invito ad aggiornare il lockfile**. Bundle gzip, benchmark, accessibilità e compatibilità completa non sono stati misurati per tutte le librerie: non sono sostituiti da punteggi inventati. I file `primary-licenses/*.json` conservano versione, licenza dichiarata, repository e integrità delle distribuzioni consultate. [L1–L5]

| Strumento | Identità/licenza osservata | Qualità utile e costo d’integrazione | Decisione e limite |
|---|---|---|---|
| Playwright / DevTools | Strumenti browser; Chromium separato | Ottimi per stati, rete, timing e test ripetibili; contesto di test da gestire | Usare subito con nuove istanze e fixture sintetiche |
| AST / ricerca sorgente | Babel disponibile nella toolchain di prova | Risposta rapida su simboli e chiamate; non prova effetti runtime | Prima scelta per codice interno leggibile |
| REA 6.7.0 | MIT | Evidenze del pacchetto e del runtime; setup e output più ampi | Usare su una domanda esplicita, fuori dalle dipendenze dell’app |
| Ghidra / Hopper | Apache-2.0 / commerciale | Analisi nativa; costo di apprendimento e provider | Rimandare finché manca un seam nativo necessario |
| tldraw 5.5.2 | `SEE LICENSE IN LICENSE.md`; chiave richiesta in produzione, licenza commerciale per uso commerciale | SDK ricco, ma costo contrattuale e migrazione del modello | Non classificarlo come OSS permissivo gratuito; confronto dedicato se sostituisce davvero un costo |
| Excalidraw 0.18.1 | MIT | Editor pronto, formato e UI propri | Riuso mirato possibile; prima stimare conflitti con engine e persistenza esistenti |
| MathLive 0.111.1 | MIT; Ardesia usa 0.110.0 | Input matematico e tastiera; test necessari per focus, serializzazione e screen reader | Consolidare la versione già usata; upgrade separato |
| JSXGraph 1.14.1 | MIT oppure LGPL-3.0-or-later | Geometria e grafici interattivi | Pilot se un caso didattico supera quanto già disponibile; interazioni accessibili da progettare |
| Numbas runtime/editor | Apache-2.0 | Valutazione matematica con formati e runtime propri | Valutare adattatore/corpus, non adottare un secondo LMS completo |
| STACK | GPL-3.0-or-later | Valutazione simbolica; dipendenze e integrazione Moodle/Maxima | Pilot separato; licenza e forma di distribuzione vanno decise sull’integrazione concreta |
| KaTeX 0.19.1 / MathJax 4.1.3 | MIT / Apache-2.0 | Rendering matematico con coperture diverse | Scegliere in base al corpus necessario; non aggiungere entrambi senza bisogno |
| PDF.js 6.4.299 | Apache-2.0; già presente | Renderer documenti; worker e risorse incidono sul bundle | Riutilizzare e misurare l’adattatore di citazione |
| Docling | Codice MIT; licenze modelli distinte | Estrazione strutturata, potenziale processo separato | Corpus documenti sintetico prima; nessuna qualità OCR garantita qui |
| whisper.cpp | MIT | Trascrizione locale, costi computazionali e modelli | Benchmark italiano e lessico scientifico prima di promesse; allineamento temporale separato |
| Motion 14.6.0 | MIT | Transizioni di UI | Nessuna nuova dipendenza per poche transizioni CSS; misurare se orchestration diventa necessaria |
| Rive React 4.37.1 | Runtime npm MIT; editor e asset separati | Animazioni interattive da asset dedicati | Costi authoring/licenze asset e fallback accessibile da verificare |
| Lottie 5.13.0 | MIT | Riproduzione animazioni esportate | Decorazione soltanto se utile all’obiettivo; non simulatore scientifico |
| PixiJS 8.22.0 | MIT | Rendering scene ricche | Aggiungere solo dopo misure che mostrino limite di DOM/SVG/Canvas |
| SVG / Canvas / WebGL | Piattaforme web, senza nuova libreria applicativa | SVG/DOM favoriscono controlli semantici; Canvas/WebGL richiedono alternative accessibili | Prima scelta minimale per una scena originale, misurando il caso reale |

Per confrontare questi candidati senza false certezze, la stessa scheda deve contenere tredici campi: obiettivo di qualità, compatibilità con stack/versione, licenza, attività/manutenzione, tempi e memoria, peso effettivamente caricato, prova da tastiera/screen reader, costi di servizio/authoring, frequenza e rischio degli aggiornamenti, grandezza dell’adattatore, diritti per uso commerciale, portabilità del dato e ore fino al gate della feature. Oggi diverse celle sono `NOT_MEASURED`; il pilot scelto deve riempirle, non solo produrre una schermata.

Per charting, editor strutturati e ottimizzazione asset non c’è una necessità provata che giustifichi introdurre ora altri pacchetti. Verificare prima componenti e pipeline presenti. Un framework documentale aggiuntivo richiede confronto di schema, migrazione, accessibilità, export e coesistenza; una demo elegante non paga questo costo. Nei primi due giorni: riparare audio e usare PDF.js, MathLive e componenti grafici esistenti.

## 10. Provenienza e prossimo gate

Per un eventuale prodotto commerciale da studiare, il dossier minimo è: funzione osservata; accesso autorizzato; versione; comportamento desiderato; osservazioni e limiti; specifica originale; alternativa aperta; implementazione propria; test di confronto; licenze di ogni codice e asset incorporato. In questa sessione non è stato eseguito software proprietario né acquisito materiale protetto per inserirlo in Ardesia.

Il prossimo gate utile non è aumentare il catalogo dei donor: è chiudere E3 fino al collegamento verificabile tra lezione, evento e istante, oppure E1 fino a una risposta dello studente con feedback. Conservare `NOT_RUN` per la ricostruzione di nuovi componenti, benchmark nativi, accessibilità completa, multi-browser e risparmio economico che questa prova non stabilisce.

## Appendice — Verifica nativa del registratore completata nella stessa sessione

Il prerequisito di lifecycle di E3 è stato **eseguito**, tramite Playwright e il `MediaRecorder` reale di Chromium 153.0.8010.0. Non è una nuova cattura REA e non dimostra il ponte completo a LessonOS. Il modulo è stato importato dal server Vite locale `127.0.0.1:5197`; il browser aveva un contesto nuovo e la prova ha intercettato solo la richiesta di permesso microfono e sostituito lo store con un’implementazione in memoria. La factory di osservazione costruisce l’oggetto nativo, senza simulare i suoi eventi. Il segnale viene da un oscillatore WebAudio a 440 Hz, collegato a `MediaStreamDestination`, senza microfono fisico e senza uscita agli altoparlanti.

**Esito: 20 verifiche su 20 passano, durata totale 1.626 ms.** Il costruttore è nativo e gli eventi finali sono `isTrusted: true`. Una registrazione di 1,2 secondi, inferiore al timeslice di 30 secondi, ha prodotto un chunk WebM/Opus di **19.481 byte**, decodificato dal browser in **1,199977 secondi** di audio a 44.100 Hz, due canali, ampiezza massima circa 0,0506. La firma binaria è EBML `1a45dfa3`.

L’ordine osservato è `native-start → native-dataavailable → write-start → native-stop → write-complete → marker → stop-resolved`. Con scrittura ritardata di 80 ms, il marker rimane assente e la Promise di stop resta pendente finché lo store non completa il salvataggio. Le tracce risultano terminate già al ritorno sincrono da stop e rimangono tali alla fine.

Nel secondo caso, `getUserMedia` è lasciato pendente e poi risolto con un vero stream WebAudio dopo la revoca: **zero MediaRecorder costruiti, zero chunk, zero marker, consenso OFF in sessione e tutte le tracce terminate**. L’AudioContext è chiuso e il browser è terminato. Tutte le 21 richieste registrate sono GET locali; nessun errore pagina catturato.

Il working tree testato aveva `HEAD` base `339ab08f4139da0b37e78bbde81e9fe4e83afea0` e includeva la correzione corrente di `AudioRecorder.ts`. Per evitare di attribuire il risultato al solo commit base, il file è identificato da SHA256 **`6534bc53e1acbc00c7c25dea545d52f942cbff19dbfc4cfa999f82c310d269cd`**, uguale prima e dopo la prova. Cambiamenti successivi al file richiedono un nuovo esito riferito alla nuova identità.

Reperti in `research/evidence/`: `audio-recorder-native.cjs`, `audio-recorder-native-result.json`, `audio-recorder-native-tail.webm`, `audio-recorder-native-manifest.json`. SHA256 del solo audio sintetico: `3739c4fc38a1e88329d89d3b4fc8ae65492058f8d99b35217b99a04c0a03f4fd`.

Il test non prova un microfono reale, storage FSA, browser diversi, cablaggio Room→Journal, riapertura della lezione o export. Queste restano verifiche separate. Il risultato nativo sostiene il fix del lifecycle e integra i test unitari proprio dove jsdom non dispone del motore di registrazione.

## Fonti primarie e reperti

Consultazione: 24 ottobre 2026. I collegamenti a `main` sono mobili; quando il risultato dipende dalla release è stata conservata la relativa identità locale.

- **R1:** [REA repository](https://github.com/morluto/rea), README locale `REA_README.md`.
- **R2:** [REA](https://rea.tools/), [guide](https://rea.tools/guides/), [FAQ](https://rea.tools/faq/).
- **R3:** [Skill REA](https://github.com/morluto/rea/blob/main/.agents/skills/reverse-engineer-anything/SKILL.md), copia `REA_SKILL.md` e riferimenti della distribuzione installata.
- **R4:** [Release 6.7.0](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0), `release-latest.json`.
- **R5:** [Metadati npm REA](https://registry.npmjs.org/rea-agents), `npm-metadata.json`; [tarball 6.7.0](https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz).
- **R6:** [Workflow JS](https://github.com/morluto/rea/blob/main/docs/javascript-application-workflows.md).
- **R7:** [Indagine nativa](https://github.com/morluto/rea/blob/main/docs/native-investigation.md).
- **R8:** [Security](https://github.com/morluto/rea/blob/main/SECURITY.md), copia `REA_SECURITY.md`.
- **R9:** [Third-party notices](https://github.com/morluto/rea/blob/main/THIRD_PARTY_NOTICES.md).
- **R10:** [Ghidra LICENSE](https://github.com/NationalSecurityAgency/ghidra/blob/master/LICENSE), [NOTICE](https://github.com/NationalSecurityAgency/ghidra/blob/master/NOTICE).
- **R11:** [Hopper FAQ](https://www.hopperapp.com/faq.html).
- **R12:** [REA showcase](https://rea.tools/showcase/).
- **A1:** [ArtCraft apps](https://getartcraft.com/apps), [Storytold](https://github.com/storytold).
- **A2:** [PhotoCraft marketing](https://getartcraft.com/apps/photocraft).
- **A3:** [PhotoCraft repository](https://github.com/storytold/photocraft).
- **A4:** [PhotoCraft target parity](https://github.com/storytold/photocraft/blob/main/docs/target-app-parity.md).
- **A5:** [PhotoCraft AGENTS](https://github.com/storytold/photocraft/blob/main/AGENTS.md).
- **A6:** [WordCraft](https://github.com/storytold/wordcraft).
- **A7:** [craft-libs](https://github.com/storytold/craft-libs).
- **L1:** Metadati npm delle versioni fissate in `primary-licenses/`; fonti `https://registry.npmjs.org/<pacchetto>/latest` al momento della verifica. I file contengono URL esatto, repository e integrità.
- **L2:** [Licenza tldraw](https://tldraw.dev/community/license), [chiave SDK](https://tldraw.dev/sdk-features/license-key).
- **L3:** [Numbas licensing](https://docs.numbas.org.uk/en/latest/licensing.html), [runtime LICENSE](https://github.com/numbas/Numbas/blob/master/LICENSE).
- **L4:** [STACK COPYING](https://github.com/maths/moodle-qtype_stack/blob/master/COPYING.txt), [licenza nei sorgenti](https://github.com/maths/moodle-qtype_stack/blob/master/settingslib.php).
- **L5:** [Docling](https://github.com/docling-project/docling), [whisper.cpp](https://github.com/ggml-org/whisper.cpp).

Le misure locali sono nei file del laboratorio e nel manifest. La ricerca storica è tracciabile ai percorsi di repository indicati nella sezione 4. La prova E0 non incorpora codice o asset di ArtCraft o di altri prodotti.

### Sede permanente dei reperti

I nomi dei file del laboratorio citati nel rapporto corrispondono ai reperti originali dell’archivio ZIP e al suo manifest. Il README di `evidence/rea/` fornisce comandi portabili e distingue script eseguiti da copie adattate. Per la prova nativa usare `evidence/audio-native/README.md`; i risultati originali sono immutati in `original-run/`. Non sono inclusi dipendenze, browser o sorgenti completi di terzi.
