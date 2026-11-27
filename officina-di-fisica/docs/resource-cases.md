# Casi degli strumenti e raccolte per microcorsi

## Scopo e confini

Il docente può aprire uno strumento durante una spiegazione, salvarne un caso e
condividere una raccolta di riferimenti con gli studenti. La raccolta non impone
una sequenza didattica e non introduce classi, presenze o un nuovo registro di
valutazione. Il primo strumento con stato riproducibile è **LAB3D-04, Poiseuille
nel capillare**. Gli altri strumenti restano disponibili nelle modalità esistenti.

Aprire, modificare, salvare o condividere un caso non produce tentativi né
competenze. La pratica dello studente continua a usare i percorsi e i registri
esistenti. I contenuti scientifici DRAFT non diventano accessibili attraverso
questa integrazione.

## Contratto del caso

Il server espone lo schema `cric.resource-case/1` con questi campi:

| Campo | Significato |
| --- | --- |
| `resource.id`, `resource.version`, `resource.sha256` | Risorsa pubblicata esatta, nella sua edizione corrente. |
| `model.id`, `model.sha256` | Modello `tubo` e impronta dei suoi sorgenti numerici. |
| `parameters` | Tutti i sette parametri fisici, nelle unità dichiarate dalla specifica. |
| `time` | Istante in secondi, compreso nell'intervallo del modello. |
| `view` | `orbit`, `top`, `side` oppure `diagram`. |

La specifica iniziale arriva da
`GET /api/v1/resource-cases/spec/LAB3D-04`; il client usa `initialCase` come base.
Il caso non contiene nome del docente, note personali, sessione, tentativi o
risposte dello studente. La vista identifica un'inquadratura standard; un'orbita
personalizzata della telecamera non è parte di questo primo contratto.

Il server respinge campi sconosciuti, valori non finiti, booleani al posto dei
numeri, parametri fuori dominio, istanti non validi e impronte incompatibili.
Il contratto v1 accetta soltanto valori rappresentabili con gli incrementi dei
controlli attuali: per esempio, `r=1.55` non può essere riprodotto dallo slider
con passo `0.1` e viene respinto. Questo è un limite di rappresentazione del
consumer, non un vincolo universale della legge fisica. Il confronto ammette
un errore di arrotondamento fino a `1e-7` nell'indice dell'incremento, così che i
valori legali ottenuti con aritmetica binaria restino validi. Il test confronta
parametri, unità e limiti direttamente con `tubo.js`; confronta anche i limiti
temporali in regime laminare e fuori regime.

L'impronta del modello comprende `static/js/banchi/modelli/tubo.js` e
`static/js/banchi/misure.js`. Una modifica a questi file richiede la verifica
dei casi precedenti: il server li segnala come non disponibili, conservandone
il documento originale. Non migra silenziosamente valori o significato fisico.
Questa versione non archivia né esegue vecchi motori arbitrari.

## API e persistenza

Il prefisso delle operazioni seguenti è `/api/v1/resource-cases`.

| Metodo e percorso | Operazione |
| --- | --- |
| `GET /spec/{resource}` | Legge il contratto dello strumento, applicando le autorizzazioni esistenti. |
| `POST /validate` | Valida `{case}` senza salvarlo. |
| `GET /me` | Legge i propri casi e le proprie raccolte. |
| `POST /cases` | Salva `{requestId,title,note?,case}` come documento immutabile. |
| `GET /cases/{id}` | Riapre il proprio caso e verifica nuovamente accesso ed edizione. |
| `POST /collections` | Crea `{requestId,title,note?,caseIds}`; una raccolta privata può nascere vuota. |
| `GET /collections/{id}` | Legge una propria raccolta con i casi ordinati. |
| `POST /collections/{id}` | Aggiorna `{revision,title,note?,caseIds}` con controllo delle modifiche concorrenti. |
| `POST /collections/{id}/share` | Applica `{revision,shared}`; condividere richiede almeno un caso. |
| `GET /shared/{token}` | Apre una raccolta condivisa e ricontrolla l'accesso a ciascuna risorsa. |

Le scritture usano il trasporto esistente: cookie di sessione, JSON,
`X-Astra-Request: 1`, controllo dell'origine e transazione SQLite. Il limite del
corpo è 16 KiB prima della lettura; titolo e nota hanno limiti rispettivamente
di 120 e 2.000 caratteri. Ogni raccolta contiene al massimo 24 casi distinti.
Quando il client invia `X-Officina-Session`, il server verifica il namespace
della sessione che ha aperto il modulo: una scheda rimasta sull'account precedente
riceve `409` e non attribuisce il salvataggio al nuovo account. Il campo resta
facoltativo per i client di contratto precedenti.

`resource_case_documents` e `resource_collections` sono tabelle aggiuntive nello
stesso database. Sono create nella prima transazione di salvataggio autorizzata,
senza cambiare `PRAGMA user_version` né le tabelle editoriali, delle sessioni o
dei tentativi. Le letture non eseguono DDL e funzionano su snapshot in sola
lettura. La cancellazione dell'account usa le relazioni `ON DELETE CASCADE`.

Le creazioni sono idempotenti per utente e `requestId`. Riutilizzare la stessa
chiave con contenuto differente produce `409`. Una ripetizione dopo la modifica
di una risorsa restituisce il documento originario, marcato non disponibile.
Gli aggiornamenti delle raccolte richiedono la revisione corrente: un conflitto
produce `409`, senza sovrascrivere modifiche concorrenti. Le liste restituiscono
i 200 casi e le 100 raccolte più recenti, con i conteggi totali; la paginazione
del materiale più vecchio non è ancora implementata.

Una risposta di caso non disponibile conserva titolo e identificatore del
documento, con `available:false`, `case:null` e una motivazione. Il frontend può
quindi spiegare il problema senza ricostruire un caso differente dai default.

## Condivisione

Un caso salvato è privato. La raccolta nasce privata e la condivisione è una
scelta esplicita. Il link contiene un token casuale e restituisce titolo e nota
della raccolta, titoli dei casi e stati accessibili; le **note private dei singoli
casi sono escluse**. Non contiene l'identità dell'autore o la sua sessione.

Il link non concede accesso a materiali protetti: il server rilegge pubblicazione
e autorizzazioni con l'identità di chi apre la raccolta. Una risorsa ritirata,
un'edizione incompatibile o l'assenza di accesso rendono il caso indisponibile.
Una revoca invalida subito il token. Condividere nuovamente genera un token
diverso e non riattiva quello revocato. Prima di svuotare una raccolta condivisa
occorre revocare il link.

Un link diretto che serializza lo stato di uno strumento pubblico è invece una
copia autonoma di quei parametri: revocare la raccolta non cancella gli stati
pubblici già copiati. Anche un link diretto passa dalla validazione dell'edizione
quando viene riaperto.

## Verifica riproducibile

Da `officina-di-fisica/`:

```sh
python3 -m unittest -v tests.test_resource_cases
```

La suite verifica riapertura esatta, contratto con il modello JavaScript,
preservazione dei dati preesistenti, retry concorrenti senza duplicati, isolamento
fra utenti, raccolte ordinate e inizialmente vuote, revisioni concorrenti,
condivisione e revoca, note private escluse, risorse ritirate e DRAFT, input
malformati, origine HTTP, limite del corpo e corrispondenza al JSON Schema.

Il contratto è disponibile a
`/api/v1/schemas/resource-cases-v1.schema.json`; i percorsi sono inclusi nel
contratto composto `/api/v1/openapi.json`. I test browser del consumer e la
verifica scientifica della candidata composta restano prove distinte: questa
suite non certifica l'intero corpus né sostituisce l'approvazione umana.
