# Moduli e formati editoriali

L’unità di riuso è il singolo materiale identificato da un ID stabile. Il server legge l’edizione iniziale da JSON e registra le modifiche successive in SQLite. Il browser richiede i dati al server quando apre una pagina. Per una modifica editoriale sono sufficienti un salvataggio e una pubblicazione.

| Componente | Responsabilità |
|---|---|
| `content/` | Edizione installabile. `catalog.json` elenca i corsi, i file C1–C6 le schede, `labs.json` le attività dei banchi. I lotti editoriali aggiungono schede allo stesso catalogo. |
| `server/store.py` | Apertura transazionale di SQLite, edizione iniziale, ID, versioni, corsi inclusi, utenti e diritti di lettura. |
| `server/learning.py` | Selezione dei quesiti, verifica di risposte, scadenze e suggerimenti. Ogni tentativo riferisce ID, versione, competenza e famiglia osservate in quel momento. |
| `static/lab-models.json` e `static/js/models.js` | Intervalli, unità, valori di partenza e funzioni fisiche pure. `labs.js` disegna i risultati e raccoglie le osservazioni esplicite. |
| `server/editor.py` | Bozze, risorse caricate, importazione atomica, validazione dei riferimenti, storico e promozione della versione visibile. |
| `server/commerce.py` | Offerte, bonifici, registrazione dell’incasso, accessi e audit. La logica del pagamento è indipendente dai modelli fisici. |
| `server/printing.py` | Composizione per la stampa, impronte di versione, rigenerazione in background e controllo dell’edizione scaricabile. |
| `server/web.py` | API, sessioni, autorizzazioni per ogni operazione e consegna di figure, allegati e PDF. |
| `static/js/` | Navigazione, lezioni, esercitazione, area personale, ordini e banco autore. `ui.js` condivide i controlli e compone testo, formule e figure. |
| `tests/` e `tools/` | Prove del software, ricalcoli scientifici, controlli dei PDF e rigenerazione degli inventari. |

## Identità e pubblicazione

Un record di tipo `course` ha `course` uguale al proprio `id`. `includes` contiene gli ID dei corsi da includere. Su un singolo materiale `reuse` indica ulteriori percorsi che lo usano. C6 attraversa le cinque raccolte mantenendo gli ID originali. `section` indica il nome della sezione, `order` la posizione nel gruppo e `skill` la lezione di riferimento.

Nel database `heads.live` e `heads.draft` individuano le revisioni in uso. `versions` conserva il payload di ogni revisione. Il salvataggio confronta la versione su cui si è lavorato con l’ultima presente. Se un secondo editor è intervenuto, il server conserva entrambe le fonti di lavoro chiedendo di confrontare la copia locale con la revisione sul server. Il ripristino crea una bozza nuova. Il ritiro sospende anche la disponibilità dei materiali che richiedono un prerequisito o un blocco incorporato ritirato.

I tentativi fissano la versione all’apertura della sessione. I fascicoli finiti possono essere riletti con domande e correzioni storiche. Letture, osservazioni scritte al banco, aiuti consultati e prove autonome sono eventi distinti. Una risposta ripetuta dopo l’apertura della soluzione è assistita. I risultati recenti considerano fino a cinque famiglie diverse per competenza. Tre risposte autonome corrette e almeno il 75% di corrette nel campione permettono l’indicazione editoriale *risultati stabili*. Due famiglie con errore portano a un recupero. Gli intervalli di ritorno sono di uno, tre o sette giorni secondo le evidenze. Sono regole didattiche esplicite e modificabili in `learning.py`.

## Lotto JSON versione 1

Il file deve essere UTF-8. `schema` vale `astra/1`. `records` è un array da 1 a 2 500 materiali. `assets` può essere vuoto. Il pulsante di controllo verifica l’intero lotto e restituisce gli errori prima di salvare. La conferma ripete i controlli e crea tutte le bozze in una transazione.

| Campo | Significato |
|---|---|
| `id`, `kind`, `course`, `section`, `order`, `title` | ID di 1–96 caratteri ASCII, tipo, corso proprietario, sezione, posizione numerica e titolo. Tipi ammessi: `course`, `section`, `lesson`, `example`, `question`, `lab`. |
| `version`, `baseVersion` | Il server assegna la nuova versione. Per una creazione `baseVersion` è 0 oppure omesso. Per un aggiornamento deve corrispondere all’ultima revisione del materiale. |
| `skill`, `prerequisites`, `coverage` | ID della lezione di competenza, array di ID prerequisiti, etichette delle voci di programma trattate. |
| `blocks`, `promptBlocks` | Contenuto o soluzione in ordine di lettura. I blocchi facoltativi della consegna sono visibili prima della risposta. |
| `prompt`, `family`, `difficulty` | Testo del problema, famiglia editoriale e difficoltà da 1 a 3. Servono a esempi e quesiti. |
| `answer` | Per la scelta: `type=choice`, `options` e `value` uguale a una delle opzioni. Per i numerici: `type=numeric`, `value` numerico, `unit` esplicita e `tolerance` assoluta nella stessa unità. Per i completamenti: `type=text`, `value` e facoltativamente `aliases`. |
| `hints`, `error` | Suggerimenti ordinati. L’errore contiene `category`, `message` e `target`. Il target è un ID di lezione o laboratorio, oppure `lab:C2` e analoghi per il banco del modulo. |
| `exam` | Nei record C6 dedicati, 1, 2 o 3 identifica il fascicolo. `order` fissa la posizione. |
| `model`, `defaults`, `prediction`, `observation`, `interpretation` | Configurazione del banco. I parametri devono rispettare chiavi, passi e limiti del modello scelto. |
| `reuse`, `includes` | Array di ID di corsi. Il primo è per materiali condivisi, il secondo per i corsi composti. |

Per i completamenti il confronto normalizza maiuscole, spazi, apostrofi tipografici e rappresentazioni Unicode compatibili. Le risposte numeriche accettano virgola o punto decimale e notazione scientifica. La pagina mostra l’unità richiesta e la tolleranza insieme al campo di risposta. Un valore in una diversa unità va convertito prima dell’inserimento.

### Blocchi e asset

Ogni blocco ha `type` e `text`. I tipi `text` e `formula` contengono rispettivamente prosa e LaTeX supportato da KaTeX, senza delimitatori. `figure` e `attachment` aggiungono `src`. `text` diventa didascalia o nome del collegamento. I blocchi `example`, `question` e `lab` contengono `ref`, l’ID del materiale riutilizzato.

Un asset allegato al lotto ha `id` uguale allo SHA-256 esadecimale dei byte, con `name`, `mime` e `data` in Base64. È richiamato da `/asset/<id>`. Un file caricato può pesare fino a 4 MiB, l’intera richiesta fino a 40 MB. Sono ammessi PNG, JPEG, WebP, SVG statici e PDF. Per le tavole distribuite con l’edizione si può riusare `/figures/nome.svg`. Il PDF allegato resta un documento scaricabile.

L’esportazione `origin=archivio` conserva le schede di lavoro, le relative versioni di base e gli allegati caricati. In un’installazione dove l’ID manca può creare la scheda. Gli ID già presenti devono corrispondere alla versione di partenza. Studenti, tentativi e ordini si conservano con il backup della cartella dati. Un esempio completo di pacchetto e una sua prova ripetibile accompagnano questa edizione. [Lotto di due materiali](lotti/lotto-001.json)

## Dal bisogno didattico alla pubblicazione

1. Nell’area personale e nelle risposte esaminate individua il passaggio che gli studenti sbagliano. Scrivi la competenza, i prerequisiti e la situazione che dovrebbe dimostrare il trasferimento.
2. Prepara i record in un lotto locale con Astra, Codex o un editor di testo. Definisci famiglia, ipotesi, unità, soluzione e feedback prima di creare varianti.
3. Ricalcola i risultati per un’altra via. Confronta testo, figura, segni, tolleranza, chiave e distrattori. Cerca vicinanze con i problemi esistenti.
4. Importa in bozza, apri l’anteprima e controlla le dipendenze condivise. Pubblica dopo la revisione e rigenera i PDF indicati.
5. Osserva le risposte autonome successive prima di modificare la difficoltà o i prerequisiti.

Il flusso editoriale funziona interamente senza chiamate AI. Una futura integrazione può produrre lo stesso pacchetto per la coda delle bozze.

## Aggiungere un modello fisico

Aggiungi parametri e modalità alla specifica JSON, una funzione pura in `models.js`, il disegno corrispondente in `labs.js` e prove per limiti e invarianti. Poi crea il record laboratorio dall’area autore. Le configurazioni di un modello esistente si modificano nello stesso editor senza intervenire sui moduli JavaScript.
