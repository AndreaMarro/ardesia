# TARGET-082 PDF.js - fonte esatta, ripresa e lettura

Stato: DEEP_OBSERVED_WITH_LIMITS. Contratto funzionale ADAPT; installazione nel prodotto DEFER. Nessun codice, dipendenza, asset o store aggiunto ad Ardesia; nessun test prodotto, ricevuta o certificazione globale viene prodotto qui. Il catalogo139 resta lo snapshot originale: questo dossier e un avanzamento separato.

## Provenienza e diritti

Ricerca reale del20ottobre2026, REA6.7.0/Node26.5.1. Sito primario `https://mozilla.github.io/pdf.js/`, viewer ufficiale `https://mozilla.github.io/pdf.js/web/viewer.html`, repository `https://github.com/mozilla/pdf.js`. Nessun account, dato personale, spesa o accesso al runtime Ardesia.

Il registry NPM osservato pubblica `pdfjs-dist@6.4.299`, commit `d0991a0d53f3bb3a7307e3b83f279c1d117aafb3`. Tarball originale8539589B, SHA256 `86269b40170eb41740ea05ad2102d71d33de4f122b34eb2f478be0ea7779c415`, integrita SHA512 verificata contro la metadata primaria. Il viewer pubblico dichiara invece6.5.260/build33734f1fd: il GitHub primario risolve quest'ultimo a `33734f1fdf1b8987c656c0a5f67b4e2cc57e9d13`. Sono due riferimenti distinti. Le tre sorgenti selezionate coincidono nei due pin, non viene dedotta uguaglianza delle distribuzioni complete.

LICENSE Apache-2.0 primaria identica ai due commit, SHA256 `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594`. La homepage distingue la documentazione CC BY-SA2.5 dal codice Apache2. L'archivio contiene ulteriori LICENSE per CMaps, ICC, font Foxit/Liberation, JBIG2, OpenJPEG e QCMS: l'inventario dei percorsi e conservato, ma non costituisce clearance transitiva. Prima di riuso vanno scelti e verificati gli asset effettivamente distribuiti, con eventuali NOTICE. Non copiare manuali, font o worker da un deploy senza pin. I PDF di questa prova sono originali sintetici; il documento predefinito del demo rimane solo nei raw privati dell'ingresso, senza riuso o pubblicazione del suo contenuto.

## Flusso esercitato e differenza di fonte

`fixtures/manifest.json` identifica due PDF A4 di due pagine, generati con testo didattico originale. V1 SHA256 `9cb417b41f923ad9fdd44fa584f17ed3317161d9a14f913cdbf74ef19c59953d`,2503B; V2 `797820afe7b48400822457c46c65917ecae1eed39494a5ceacff6d3f0f25f5d6`,2508B. Entrambi hanno il primo ID permanente PDF `d2179ab5c014b7849fd2c4d86f18ffcb`; il secondo ID aggiornamento e diverso. Questo e deliberato: il primo ID di un documento non e un digest crittografico di ogni sua revisione. PDFinfo e rendering Poppler della fixture sono stati controllati; nessun JavaScript, form o cifratura nel documento.

Un solo Chrome proprio PID52337/CDP5356, profilo temporaneo: chiuso/rimosso alle07:35:55UTC prima delle prove launch. Il file chooser non e un'azione REA6.7: i sidecar `load-*.sidecar.json` dichiarano l'uso di Playwright setInputFiles sull'effettivo `#fileInput` osservato nel viewer. Questo attiva il normale handler, senza mock o modifica dello stato applicativo. Le richieste osservate durante questi caricamenti sono GET, nessun POST del file. I readback del PDFDocumentProxy sono sidecar ordinari, non nuove Evidence.

| Operazione effettiva | Risultato e limite |
|---|---|
| REA apertura e navigazione V1 | Pagina2, zoom100%; ricerca `ANCHOR-42` trova1occorrenza nella seconda pagina |
| REA rotazione oraria | Rotazione90 osservata; prima attesa sbagliata fallisce, conferma successiva conserva screenshot/stato |
| Nuovo documento browser nello stesso profilo, riapri V1 | Prima di qualunque fragment REA il sidecar osserva gia pagina2, zoom1, rotazione90: stato ripristinato, non i byte del PDF. Il file viene scelto nuovamente |
| Apri V2 con stesso primo fingerprint e byte diversi | Eredita pagina2/zoom1/rotazione90; il readback getData() coincide invece con SHA256 V2 |
| REA cerca spiegazione V2 | `quadruples` trova1occorrenza nella seconda pagina; testo estratto distingue V1(area dimezzata, velocita doppia) da V2(area a un quarto, velocita quadrupla) |
| REA lancio isolato1440x1000 | Normale parametro `file` del viewer con dataURL del nostro PDF V2; ricerca, focus del match e chiusura ricerca.8step completati, capture globale COMPLETE/equality_eligible=true, browser provider-owned terminato |
| REA lancio isolato390x844 | Stesso flusso,8step completati, COMPLETE/equality_eligible=true; pagina2 e spiegazione corretta visibili. Il testo del PDF resta piccolo, quindi nessun claim di buona leggibilita mobile/Axe |

Le due launch non riproducono la ripresa nello stesso profilo: sono una verifica separata della lettura/rendering da origine sintetica esplicita. Il dataURL contiene soltanto la nostra fixture originale e non costituisce una prova di upload Core, storage o ACL. Nessuna pretesa di gesto umano. Screenshot originali verificati sono estratti in `pixels/isolated-v2-read-{1440,390}.png`.

Gli URL fragment usati nelle capture attach sono setup espliciti di pagina/zoom per continuare lo stesso documento senza ricaricare il file. Non sono prova autonoma di ripristino: quel claim deriva dal sidecar pre-fragment `load-v1-fresh`. Nessun riavvio OS/processo, cloudsave, firma/validita legale o trasferimento autorita e stato esercitato.

## Struttura, runtime e confronti REA

`source.application` analizza le tre sorgenti al pin del deploy osservato: `web/view_history.js`, `web/pdf_history.js`, `web/pdf_link_service.js`,42848B,4043ASTnode,37finding,0parsefailure. Il feature trace della ViewHistory attraversa39node/43edge,24fatti osservati/69inferiti, complete-within-source. Questo riguarda solo il sottoinsieme selezionato. La traccia semantica del costruttore produce1nodo/0relazioni,2UNKNOWN, copertura parziale: non e una dimostrazione completa del flusso dinamico.

`navigation-execution` osserva8secondi dalle07:28:00.816Z alle07:28:08.821Z; le due azioni UI ordinarie esplicitate nel sidecar (precedente e successiva) avvengono nella finestra. V8 rileva previousPage/nextPage count1 ciascuna, setMultiple count6 e _writeToStorage count3. I conteggi interni non sono ulteriori azioni utente. Script vuoti di strumentazione sono esclusi dai claim vendor.

Il source originale V8 del viewer ha SHA256 `9158cce51ad75b4fad4e97c0d26cd313b0183b51ec8522433a4965b571dcb569`. Il metodo setMultiple eseguito ai range UTF16[586010,586201) e191B esatti del metodo nel sorgente pinned, SHA256 `f30c647a1adc99f52293d1ad917a1a7ded2d7202767c197bddaccd57628ede7a`. E un match del solo metodo, non dell'intero modulo o semantica. Il V8 source contiene inoltre la chiamata reale `new ViewHistory(pdfDocument.fingerprints[0])`: il primo fingerprint e effettivamente la chiave di navigazione del viewer.

Inspect/export reali conservano i due script ammessi del sito, con attach_limited/policy_filtered e worker fuori target. Il primo reconcile rigetta correttamente observe_web_execution come tipo non supportato: errore conservato. Il retry passa la sola inspect_web_page valida:0matched,2unmatched,3UNKNOWN e27stati statici UNKNOWN; source maps non usate come autorita primaria. La derivazione del metodo esatto rimane separata e non regolarizza questi UNKNOWN.

`v1-v2-compare` usa i due originali con stessi due step allineati e nessuna normalizzazione. Risultato CHANGED, con delta reali di contenuto, rotazione e query. Non isola la sola revisione ne dichiara equivalenza; gli eventi rete delle capture attach restano INCOMPLETE. Due launch complete successive non cambiano retroattivamente tale limite.

## Errori e qualita visiva

La prima attesa di rotazione cercava data-main-rotation sul DIV.page invece del figlio textLayer: timeout conservato, azione rotazione90 gia osservata, nessun bug vendor rivendicato. Su390px il selettore zoom e i pulsanti precedente/successiva sono nascosti; un'azione priva di timeout e stata interrotta con SIGINT solo sul proprio childREA, exit130 e nessuna Evidence prodotta. L'output finale di cancellazione e un JSON errore di7614B, senza evidence_id; stderr, sidecar e nota di cancellazione rimangono nel dossier. Il retry bounded sul pulsante nascosto fallisce autenticamente; non viene promosso a prova di navigazione riuscita.

I primi screenshot attach mostrano clipping/ridimensionamento rispetto al viewport nativo e il readback successivo al distacco puo gia vedere il viewport ripristinato. Le misure ordinaryDOM esterne sono percio esplicitamente di fase diversa e non una validazione della geometria durante capture. Le due prove launch separate risolvono il dubbio sul rendering isolato. Nessuna correzione delle immagini o degli originali.

Anatomia osservata: toolbar compatta, Arial, target28x28px nel DOM misurato; ricerca in pannello distinto, pagina numerica, zoom, strumenti secondari. A390 la toolbar conserva pagina, ricerca e zoom +/- ma nasconde vari comandi; la cattura launch mostra il documento a impaginazione fissa, con testo piccolo e coda della pagina precedente ancora visibile. Questi sono limiti reali per uno studio su telefono, non un modello da copiare integralmente.

## Contratto minimo per Ardesia

ADAPT un port SourceViewer di sola lettura, non l'intero editor/gestionale del viewer. Il Core unico continua ad autorizzare e recuperare ogni coppia resourceId/revisionId; il renderer riceve solo bytes/Blob gia autorizzati e verificati, mai URL arbitrari o una chiave globale PDF come autorita. Le lezioni/pin conservano l'esatta revisione: l'esistenza di una nuova head non riscrive spiegazioni o ancore precedenti.

La proposta di ancora e `(resourceId, revisionId, assetSha256, pageNumber, eventuale rettangolo normalizzato)`. Fingerprint e posizione di vista sono metadati UI consultivi; la proiezione di pagina/zoom puo essere memorizzata con scope attore/ruolo/corso/coppia esatta, senza duplicare un originale o introdurre un nuovo store canonico di memoria. Su revoca o cambio scope smontare/cancellare il renderer, worker e callback; un ACK/render tardivo non puo mostrare bytes del contesto precedente. Fingerprint uguale tra V1/V2 qui provato e sufficiente a respingere un adapter che lo usi come chiave di revisione o permesso. Non e una fuga ACL del prodotto terzo.

La UI proposta tiene visibili fonte, versione, pagina e ritorno alla spiegazione; mostra il PDF originale con pochi controlli accessibili e affianca una citazione/testo leggibile legata allo stesso riferimento. Stato storico/disponibile/revocato e provenienza rimangono quelli Core. Nessun passaggio silenzioso alla head corrente. Annotazioni, edit del PDF, immagini/forme e firma restano fuori dal port iniziale; nascondere soltanto un pulsante non realizza un controllo di autorizzazione.

DEFER installazione finche il renderer inlinePDF e una priorita esplicita e sono verificati asset/worker/CSP e limiti pagine/pixel/memoria/tempo/cancellazione. Main e worker dovranno avere la stessa versione pinned e restare self-hosted; nessun CDN dinamico. La cache ViewHistory osservata e bounded20documenti per default, con rimozione in ordine di inserimento; non e una garanzia bytebudget o LRU, ne un archivio affidabile delle fonti del corso.

Regressioni necessarie se adottato: due revisioni stesso primoID/digestdiverso; pin storico mentre head privata avanza; revoca e cambio attore/corso; ultimo callback dopo scopechange; pagina fuori intervallo e PDF malformato/oversized; zoom/rotazione con ancora stabile; reflow testuale e zoom/mobile/focus; worker cancellato/disposto; originale scaricato con hash esatto e nessuna cache intercorso; errore parser distinto da indisponibilita fonte. Nessuna nuova prova prodotto di questa lista e stata eseguita. Beneficio atteso qualitativo: fonte/pagina verificabile e ripresa della spiegazione, con una lettura piu adatta al telefono. Benchmark, tempo risparmiato e impatto didattico misurato: UNKNOWN.
