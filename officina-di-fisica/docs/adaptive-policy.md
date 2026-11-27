# Studio adattivo: policy, evidenze e continuità del quaderno

## Ambito e decisione di prodotto

La policy `cric-discipline-policy-2` riguarda le discipline installate nel modulo `multidiscipline`. Usa gli eventi reali del quaderno, le competenze, i prerequisiti e il programma scelto. È deterministica, non richiede un modello linguistico e non modifica le regole di valutazione del corpus di Fisica.

Il risultato è una proposta motivata del prossimo passo, non una percentuale di padronanza. Apertura della lezione, lettura conclusa, risposta con supporto, risposta autonoma, trasferimento e richiamo a distanza restano grandezze distinte. Esplorare uno strumento o salvare un caso non produce implicitamente evidenze di competenza.

## Evidenze e famiglie dei quesiti

Una risposta corretta è autonoma, nel significato operativo attuale, quando sullo stesso ID di attività non risultano precedenti risposte o indizi. La verifica attraversa le edizioni: una nuova edizione non rende automaticamente nuovo un quesito già incontrato. Gli strumenti di lettura e accessibilità non generano eventi `hint`.

Per registrare un trasferimento devono valere tutte queste condizioni:

1. La risposta è corretta e autonoma rispetto all’attività.
2. Il quesito ha `assessmentRole: "transfer"` e un `familyId` valido.
3. Esiste una precedente risposta autonoma in una famiglia classificata della stessa competenza.
4. Nessuna risposta o richiesta di indizio precedente appartiene alla famiglia del nuovo quesito.

Cambiare soltanto i numeri di un esercizio non basta. Un indizio su un quesito impedisce di dichiarare trasferimento su una successiva variante della stessa famiglia, anche quando quella variante viene risolta senza un indizio specifico.

`familyId` è un metadato editoriale opzionale nel record completo dell’attività. Deve identificare una famiglia di problemi con una strategia o struttura riconoscibile; assegnare un ID diverso a ogni quesito vanificherebbe la misura. La correttezza della tassonomia richiede una revisione didattica. Il software valida il formato e impedisce di cambiare una famiglia già assegnata mantenendo lo stesso ID di attività. I pacchetti precedenti senza questa informazione restano installabili e utilizzabili, ma non producono nuove dichiarazioni di trasferimento fra famiglie.

La valutazione delle famiglie legge l’edizione immutabile effettivamente associata a ciascun evento. I vecchi eventi non vengono riscritti. Nel quaderno, `transfer` conta i flag storici sostenuti dai metadati e dalla successione delle evidenze; `legacyTransfer` conserva separatamente quelli che non documentano il criterio attuale. Le ricevute originali continuano a restituire i risultati registrati al momento del tentativo. La presentazione distingue questa provenienza.

Il richiamo a distanza richiede una risposta corretta autonoma a un quesito diverso dopo almeno due giorni dall’ultima risposta autonoma della competenza. Non implica necessariamente una nuova famiglia. Dopo un richiamo riuscito, l’intervallo di proposta del successivo ripasso passa a sette giorni. Sono parametri espliciti di prodotto (`REVIEW_DELAY` e `RETAINED_DELAY`), non intervalli clinicamente o sperimentalmente personalizzati.

## Recupero, esaurimento e limiti della diagnosi

La decisione considera difficoltà non ancora seguite da una risposta autonoma riuscita, ripassi dovuti, prerequisiti documentati e disponibilità di quesiti nuovi. Un prerequisito non documentato può precedere il ritorno all’obiettivo in cui si è verificata una difficoltà. A parità di priorità, un quesito nuovo in un’altra unità della stessa competenza è preferito a una unità senza più quesiti disponibili.

Se tutti i quesiti utili sono già stati incontrati, `next` resta raggiungibile: indica la lezione da riprendere, con `action: "review-lesson"` e `activityId: null`. Il messaggio spiega che riprovare è un esercizio con supporto e che una nuova verifica autonoma richiede un quesito non ancora visto. Nessun tentativo precedente viene riclassificato per eliminare artificialmente il limite del pool. `next` può restare nullo quando non esiste un’unità accessibile nell’ambito richiesto.

La proposta espone `reason`, `reasonCode`, `freshEvidenceAvailable`, `missingPrerequisites`, l’eventuale `limitation` e la versione della policy. Il frontend presenta motivazione e limite, senza imporre allo studente di interpretare i codici tecnici. Il segnale d’errore riguarda competenza e storia delle risposte: non è una diagnosi specifica del fraintendimento da una singola alternativa sbagliata.

## Programmi, microcorsi e prerequisiti

I programmi dichiarano competenze (`skills`), microcorsi (`courses`) o entrambi. I riferimenti devono esistere ed essere distinti; è necessaria almeno una competenza o un microcorso. Se entrambi sono presenti, la copertura è la loro unione. Il filtro del catalogo e la decisione server adottano questa stessa interpretazione.

La policy aggiunge i prerequisiti delle competenze selezionate, senza concedere nuovi accessi. Può proporre un prerequisito esterno agli argomenti del programma e lo dichiara nella motivazione. I microcorsi estranei non entrano nella decisione. La scelta del programma viene applicata sul server a ogni richiesta; la preferenza selezionata resta nella cronologia del browser, non è ancora sincronizzata fra dispositivi.

## Endpoint e ricevute

I percorsi HTTP completi hanno il prefisso `/api`. Richiedono la sessione dell’utente e applicano visibilità dell’edizione e accessi correnti.

| Metodo e percorso | Risultato |
|---|---|
| `GET /api/v1/disciplines/{discipline}/me` | Quaderno, ripresa e proposta nell’insieme dei microcorsi accessibili. |
| `GET /api/v1/disciplines/{discipline}/me/syllabi/{syllabus}` | Stessa proiezione, limitata al programma e ai prerequisiti pertinenti. |
| `GET /api/v1/disciplines/{discipline}/me/courses/{course}` | Stessa proiezione, limitata al microcorso e ai prerequisiti pertinenti. |
| `GET /api/v1/disciplines/{discipline}/units/{unit}/activities/{activity}/receipt` | Ultima ricevuta dell’utente nell’edizione corrente, oppure `receipt: null`. |

La lettura della ricevuta non crea eventi di risposta e non incrementa evidenze. Restituisce scelta, ID della richiesta, momento e correzione già autorizzata. Un altro utente non può ottenere quella ricevuta. Il frontend può quindi riaprirla da un contesto senza storage del dispositivo, conservando una eventuale bozza locale non ancora consegnata.

Se esistono soltanto tentativi di edizioni precedenti, il risultato segnala `previousEdition: true`. L’interfaccia non presenta la vecchia formulazione come corrente. Le ricevute precedenti restano recuperabili attraverso il replay idempotente della richiesta originale; non è stato aggiunto un navigatore completo delle edizioni archiviate.

Per le scritture disciplinari, un header `X-Officina-Session` presente ma incoerente con la sessione corrente produce 409, evitando l’attribuzione di un tentativo da una scheda rimasta su un altro quaderno. L’omissione dell’header rimane compatibile con i client precedenti. Autenticazione, protezione della richiesta e autorizzazione continuano a essere applicate dal trasporto condiviso.

## Dati esistenti e compatibilità

La fonte delle evidenze resta `discipline_events`, nello stesso database del quaderno. Non vengono introdotti un secondo registro, una migrazione distruttiva o un diverso motore di pubblicazione. Gli eventi esistenti, i contenuti immutabili, le chiavi idempotenti, le ricevute e i record di Fisica restano invariati.

L’installazione di un pacchetto aggiunge l’indice parziale `discipline_independent` sulle risposte autonome corrette. L’operazione è ripetibile; viene eseguita anche quando la medesima edizione non richiede una nuova importazione. Un database precedente resta leggibile senza l’indice, con prestazioni da misurare separatamente. La proiezione esistente delle statistiche resta ricostruibile dagli eventi.

I nuovi campi del quaderno e i nuovi endpoint sono documentati nello schema e in OpenAPI. **`next.activityId` ora può essere nullo quando il prossimo passo è una lezione:** il frontend fornito supporta questo caso; eventuali client esterni che convalidano con una copia precedente dello schema devono aggiornare il contratto. Le forme delle richieste di evento e delle ricevute già esistenti sono conservate.

## Accettazione e verifiche riproducibili

Eseguire dalla cartella `officina-di-fisica/` della candidata:

```bash
python3 -m unittest -v tests.test_discipline_study tests.test_discipline_exports
node --test tests/discipline-contracts.test.js
node tests/browser-discipline.mjs
python3 -m tools.benchmark_discipline examples/discipline/catalog.json --events 0 1000 10000 --repetitions 7
```

Le prove automatiche coprono pool esaurito dopo errori e dopo successi, orologio controllato, letture senza competenza implicita, replay concorrenti, ritentativi assistiti, varianti della stessa famiglia, indizi su famiglie correlate, conservazione dei vecchi flag, invarianti fra edizioni, programmi non validi, recupero dei prerequisiti, ricevute isolate e rifiuto delle sessioni incoerenti. Il contratto HTTP verifica anche autorizzazione, schema, export del contesto e biblioteca MCP.

La suite browser include un secondo contesto con soli cookie e nessuno storage del dispositivo: deve riaprire la correzione senza aggiungere un tentativo. Verifica inoltre che la selezione del programma chiami il relativo endpoint server. **L’esecuzione browser resta un gate separato: l’aggiunta dello scenario al test non ne attesta il superamento.**

Nella verifica locale del 27 novembre 2026, 17 test Python e il test HTTP/schema/MCP sono riusciti. Sul pacchetto minimo pubblico, sette letture calde con 10.000 aperture simulate hanno misurato una mediana di circa 0,64 ms e un p95 di 0,72 ms. Una prova separata con 10.000 risposte assistite simulate ha misurato 6,37 ms di mediana e 8,55 ms di massimo, conservando zero evidenze autonome e zero trasferimenti. Sono misure locali indicative su dati sintetici; non descrivono carico concorrente, rete o prestazioni di produzione.

Queste prove dimostrano il comportamento del software e i suoi limiti dichiarati. Restano necessari revisione della tassonomia, osservazioni di usabilità e un pilota con persone e compiti nuovi per valutare l’efficacia dell’apprendimento. Non viene dichiarato un miglioramento sperimentale dei risultati degli studenti.
