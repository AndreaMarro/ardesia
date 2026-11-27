# Cric — handoff di prodotto per Astra, Claude o un altro agente

Data: **27 novembre 2026**, fuso di riferimento Europe/Rome.

Questo è il punto d’ingresso per continuare il lavoro senza dipendere dalla chat o da un provider. La consegna è nella [PR pubblica in bozza #366](https://github.com/AndreaMarro/ardesia/pull/366), branch `feat/cric-resource-learning-20261127`. Il codice e le prove sono l’autorità sul comportamento effettivo. I risultati scientifici rimangono nei rispettivi registri; questo documento non li sostituisce.

## Lettura iniziale e destinazione

1. Questo documento: decisioni, struttura e istruzioni di ripresa.
2. [Traguardo di prodotto e criteri di accettazione](PRODUCT-TARGET-AND-ACCEPTANCE.md): come portare il progetto alla visione richiesta, con priorità e prove osservabili.
3. [Registro della consegna](resource-learning-validation-20261127.json): revisioni esatte, prove riuscite, prove negative e limiti.
4. [PR #366](https://github.com/AndreaMarro/ardesia/pull/366): head remota e stato aggiornato dei controlli. I risultati appartengono alla revisione indicata, non automaticamente alla head successiva.

## 1. Mandato del proprietario

Andrea chiede di portare avanti concretamente Cric, conservando la visione e prevenendo regressioni. Chiede anche di documentare tutto perché Astra o Claude possano proseguire. Il repository è pubblico, la cartella di lavoro esclusiva è `officina-di-fisica/`, il branch canonico è `officina-di-fisica`.

**Il docente deve poter attingere alle risorse, senza dover condurre o amministrare il corso dentro Cric.** Deve poter aprire uno strumento mentre spiega, variare le condizioni, richiamare un caso preparato e dare allo studente un collegamento utile per continuare a studiare. Il microcorso non è soltanto una pagina commerciale o un contenitore di file: collega obiettivo, spiegazione, esempio, strumento, pratica e recupero.

Per lo studente l’interfaccia deve chiarire dove si trova, che cosa sta facendo e quale passo può seguire. Le raccomandazioni devono dipendere da dati effettivamente registrati. Una lettura, un’esplorazione o una risposta già assistita non diventano automaticamente una competenza dimostrata.

Preservare identità grafica, monolite modulare, account, ordini, accessi, edizioni, quaderni e ledger esistenti. Il prodotto continua a funzionare senza un LLM. Usare i provider come strumenti di sviluppo, senza rendere il funzionamento dello studio dipendente da essi.

## 2. Situazione verificata all’ingresso

| Riferimento | SHA osservata | Ruolo |
| --- | --- | --- |
| `officina-di-fisica` | `7c29ccc18ad3b42ceecfca509ef57f786bd2c496` | Canone remoto, comprende merge PR #364 |
| `feat/cric-learning-platform`, PR #365 DRAFT | `71a4a31bed9357cdc6a8291b6291a58593e70a73` | Estensione multidisciplinare, quaderno, contratti e supporto Analisi |
| `review/cric-converged-runtime` | `4e9a37eb120b2bd4a4c8876f5dc52d6471cfd7aa` | Successore scientifico da verificare separatamente |
| `design/officina-tre-direzioni-1`, PR #340 DRAFT | `abb25af1a5c48a7ebd9b3ad9e0b22fcb3332f5ad` | Proposta grafica concorrente, non integrata qui |

La ricognizione non vede eventuali modifiche non pubblicate nei worktree delle altre sessioni. Ricontrollare quindi ownership e nuove head prima del prossimo incremento.

Il branch di questa consegna è **`feat/cric-resource-learning-20261127`**. È nato in un worktree separato dal canone e compone la PR #365 con un merge normale, base comune `831b73fa71076b2e9b363006ffd94a350f22fe90`. Le 38 path della PR multidisciplinare non si sovrapponevano alle modifiche canoniche o scientifiche osservate. Il merge locale iniziale è `615e81d7`; non usarlo come sinonimo della head remota finale. Per la candidata effettiva leggere Git, la PR e il registro di verifica di questa consegna.

La pubblicazione è avvenuta con le API Git del connettore perché il clone locale non aveva credenziali di scrittura CLI. Ogni tree pubblicato è stato confrontato con il tree locale e deve essere identico; i commit possono avere SHA differenti per metadati e parent remoti. Il merge pubblico iniziale è `6b97800eed735a71a1c98a08ff42c848cb5a3712`, con parent canonico `7c29ccc` e PR #365 `71a4a31`. Il checkpoint pubblico `d10582d58386c6c64caf244660343002dede1527` contiene esattamente il tree `edaa75c6e223f66c0755b8728260df5ddb34a71d` della prova locale di coesistenza. In un clone nuovo usare le SHA pubbliche, non pretendere che i commit locali menzionati nelle ricevute siano raggiungibili dal remoto.

**Il ramo scientifico #4e9 non è stato fuso indiscriminatamente.** Contiene lavoro e prove ancora in revisione. Una composizione temporanea verifica compatibilità e riapertura dei dati senza muovere quel ramo, riscrivere checkpoint o attribuire retroattivamente validità scientifica ai nuovi flussi.

## 3. Incremento implementato

### Orientamento e riuso delle risorse

La copertina composta propone due azioni principali: percorso/ripresa dello studio e risorse. La navigazione principale espone **Il mio studio, Percorsi, Risorse**. I percorsi di Fisica, la preparazione all’esame e le simulazioni rimangono raggiungibili. La palette, la tipografia e le illustrazioni esistenti sono riutilizzate.

La pagina Risorse permette di cercare i banchi e aprirli in uso libero. Il docente può usare immediatamente i comandi senza rispondere alla previsione iniziale. L’attività guidata resta un percorso distinto e raggiungibile. La concentrazione dell’uso libero mantiene nello stesso spazio scena, spiegazione e parametri. I controlli dei parametri hanno etichette esplicite. Il consumer attribuisce un ruolo esplicito ai gruppi SVG etichettati dopo ogni ridisegno: il primo audit browser aveva rilevato una semantica ARIA non valida nella tavola del capillare. La correzione resta nel modulo composto; la sorgente scientifica nativa richiede coordinamento separato con il suo revisore.

Il primo contratto completo di caso riproducibile riguarda **LAB3D-04, Poiseuille**. Salva sette parametri, istante e vista standard, con identità e versione della risorsa e impronta del modello. La riapertura valida gli stessi dati. Un modello o un’edizione incompatibile producono una spiegazione; non si sostituiscono silenziosamente i valori con quelli iniziali.

Il collegamento pubblico al caso contiene solo condizioni del modello. Il salvataggio personale conserva titolo e nota nel quaderno. Una raccolta ordina fino a 24 casi e aggiunge un obiettivo o istruzioni per un microcorso. Può nascere vuota e privata. Il docente attiva esplicitamente un collegamento condiviso e può revocarlo; una riattivazione genera un nuovo token. La raccolta condivisa mostra istruzioni e titoli dei casi, non le note personali dei singoli casi. I permessi della risorsa vengono ricontrollati per ogni visitatore.

Da ogni caso della raccolta lo studente può riaprire il modello, raggiungere la lezione collegata e proseguire nel percorso. L’esplorazione non scrive tentativi né attribuisce padronanza. Il caso conserva il contesto per tornare alla raccolta.

### Studio adattivo

Sono corretti i vicoli ciechi quando finiscono i quesiti nuovi. Il quaderno propone recupero o ripasso della spiegazione e dichiara quando mancano ulteriori prove autonome. Il recupero può risalire ai prerequisiti. La selezione del programma universitario ora interroga una policy server realmente limitata al programma e ai suoi prerequisiti accessibili.

Il trasferimento richiede una famiglia classificata effettivamente nuova rispetto alle esposizioni registrate e una precedente risposta autonoma in un’altra famiglia. Indizi o errori su una variante della stessa famiglia impediscono di presentarla come nuova. I vecchi eventi sono immutati; i flag storici non sufficientemente documentati sono separati come `legacyTransfer`.

Una ricevuta dell’edizione corrente si riapre dal server anche su un secondo dispositivo, senza dipendere dal `sessionStorage` e senza creare un nuovo tentativo. Dopo la correzione compare un prossimo passo con motivazione. La scelta del programma non è ancora una preferenza persistente fra dispositivi.

Dettagli: [contratto dei casi e delle raccolte](resource-cases.md), [policy adattiva](adaptive-policy.md), [architettura multidisciplinare preesistente](discipline-e-convergenza.md).

## 4. Mappa del codice

| Modulo | Responsabilità |
| --- | --- |
| `multidiscipline/frontend.py` | Entry point composto, navigazione, whitelist degli asset pubblici |
| `multidiscipline/resource_frontend.py` | Compone il banco per l’uso libero con hook controllati, senza copiare i modelli fisici |
| `multidiscipline/static/js/risorse.js` | Catalogo, uso libero, salvataggio, raccolte e condivisione |
| `multidiscipline/static/js/risorse-stato.js` | Collegamenti che contengono solo lo stato del caso |
| `multidiscipline/static/risorse.css` | Disposizione e adattamento alle dimensioni dello schermo |
| `multidiscipline/resource_cases.py` | Validazione, persistenza, idempotenza, revisioni e permessi dei casi |
| `multidiscipline/study.py` | Evidenze, ricevute, prerequisiti e decisione del prossimo passo |
| `multidiscipline/pack.py` | Validazione del grafo e dei programmi, metadati delle famiglie |
| `multidiscipline/editions.py` | Importazione e indici additivi nello stesso database |
| `multidiscipline/web.py` | Dispatcher HTTP comune e guard per schede con sessione cambiata |
| `multidiscipline/contracts/` | JSON Schema e OpenAPI dei nuovi contratti |
| `tests/browser-resources.mjs` | Percorso risorsa/caso/raccolta e verifiche del browser |
| `tests/browser-discipline.mjs` | Studio, correzione, riapertura e programmi |
| `tests/test_resource_cases.py` | Persistenza, autorizzazioni, revoca, compatibilità e concorrenza |
| `tests/test_resource_composition.py` | Hook, import condivisi, asset e confronto con runtime scientifici esatti |
| `tools/verifica_convergenza.py` | Composizione temporanea e verifica della conservazione dei dati |

Gli asset scientifici in `static/`, i modelli, il corpus, le edizioni pubblicate e i checkpoint rimangono byte-identici rispetto alla base di questa consegna. Il nuovo asset composto costituisce comunque **un nuovo comportamento da collaudare**: conservare i byte originali non certifica automaticamente l’uso libero o la nuova navigazione.

I punti d’innesto falliscono se un’ancora non compare esattamente una volta. Non convertirli in sostituzioni permissive per far passare una nuova revisione. Se cambia il runtime scientifico, verificare gli hook e ripetere le prove del consumer composto.

Questa composizione isola il lavoro durante la revisione parallela, ma resta accoppiata alla forma esatta dei sorgenti nativi. È un vincolo di manutenzione dichiarato. Quando la proprietà dei file e la revisione permetteranno un intervento coordinato, valutare punti di estensione espliciti nel modulo canonico, preservando gli stessi contratti, le prove dei consumer e il modello condiviso. La rimozione degli hook non giustifica una riscrittura indiscriminata o la riattribuzione di vecchie prove a un runtime nuovo.

## 5. Avvio riproducibile e dati di prova

Da un clone del repository, controllare prima `git status`, worktree e PR. Aggiornare le ref e creare un proprio branch, senza riusare o cancellare il worktree di un’altra sessione:

```sh
git fetch origin officina-di-fisica feat/cric-resource-learning-20261127 feat/cric-learning-platform review/cric-converged-runtime
git worktree add -b feat/cric-next ../cric-next origin/feat/cric-resource-learning-20261127
cd ../cric-next/officina-di-fisica
```

Scegliere nomi liberi se quel branch o percorso esistono. La PR #365 è già un parent della consegna: non riapplicarne alla cieca i file. I comandi seguenti si eseguono dentro `officina-di-fisica/`:

```sh
npm ci
export ASTRA_DATA="$(mktemp -d -t cric-handoff.XXXXXX)"
export ASTRA_HOSTED=0
python3 app.py install-discipline examples/discipline/catalog.json
python3 app.py serve --port 0 --open
```

Per un collaudo isolato impostare `ASTRA_DATA` a una **nuova directory temporanea dedicata** prima dei comandi. Non puntarlo al database personale o alla produzione. Il catalogo dimostrativo è geometria pubblica, utile a provare l’architettura; non è il corpus privato di Analisi 1. Il pacchetto Suria e i nuovi materiali privati non fanno parte di questa consegna.

Aprire `/` per il client composto. `/index.html` conserva l’ingresso storico. Un server Python già avviato va riavviato dopo modifiche ai moduli Python: gli asset composti usano una cache di processo. Per modifiche JavaScript ricaricare la pagina.

### Percorso manuale minimo

1. Dalla copertina aprire Risorse e il banco di Poiseuille. Modificare il raggio con la tastiera, scegliere una vista e un istante. Non deve essere necessaria una previsione.
2. Aprire Concentrazione: controlli, scena e spiegazione restano disponibili. Escape richiude e restituisce il focus al pulsante.
3. Generare il collegamento e aprirlo in un altro contesto. Confrontare parametri, vista, istante e letture. Aprire una versione incompatibile deve produrre un errore esplicito.
4. In un account di prova salvare il caso, ricaricare e riaprirlo. Creare una raccolta, aggiungere e ordinare casi, salvare. Controllare titolo e istruzioni.
5. Attivare il collegamento e aprirlo come visitatore: le note personali dei casi non devono comparire. Raggiungere la lezione, tornare alla raccolta, revocare e verificare che il vecchio collegamento non funzioni.
6. Su una disciplina di prova esaurire i quesiti con errori, poi riaprire il quaderno: deve esserci un passo di recupero dichiarato. Ripetere risposte già viste non aumenta le evidenze autonome.
7. Riprendere una correzione da un secondo contesto con gli stessi cookie e senza storage del dispositivo. Non deve essere creato un nuovo tentativo.

## 6. Comandi di verifica

```sh
python3 -m unittest tests.test_resource_cases tests.test_resource_composition tests.test_discipline_study tests.test_discipline_exports tests.test_rational_steps -v
npm test
npm run test:contracts
node tests/browser-resources.mjs
node tests/browser-discipline.mjs
node tests/browser-architecture.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

I runner browser usano Playwright e richiedono i relativi motori installati. Un errore di installazione o di avvio del motore non è un test applicativo superato. I report del runner sono separati dai test Python e dai contratti HTTP.

Per la compatibilità esatta, dopo aver creato un commit della candidata:

```sh
CRIC_COMPOSITION_REFS='7c29ccc18ad3b42ceecfca509ef57f786bd2c496,4e9a37eb120b2bd4a4c8876f5dc52d6471cfd7aa' python3 -m unittest tests.test_resource_composition -v
python3 tools/verifica_convergenza.py --base 7c29ccc18ad3b42ceecfca509ef57f786bd2c496 --platform HEAD --scientific 4e9a37eb120b2bd4a4c8876f5dc52d6471cfd7aa
python3 tools/package_release.py var/cric-candidate.zip --verify
```

Il tool di convergenza ora estrae soltanto i blob Core dichiarati, controllando path e tipi. Un archivio indiscriminato del ramo scientifico in un clone parziale aveva richiesto il recupero di artefatti estranei al test. La lista dei file e la sua impronta vengono registrate; le verifiche sui dati non sono state eliminate.

## 7. Regole di compatibilità e rilascio

- Le tabelle dei casi e delle raccolte sono additive nello stesso database. Non esiste un secondo account o ledger. Nessun contatore di competenza viene scritto dall’esplorazione.
- Le scritture usano il trasporto, il controllo di origine e la sessione esistenti. La UI cattura lo scope della sessione; una scheda obsoleta non deve attribuire una scrittura all’account appena subentrato.
- Un collegamento condiviso non è un titolo di accesso a contenuti riservati. Un caso relativo a materiale ritirato o non accessibile resta conservato ma non consegna il contenuto al visitatore.
- Import e rollback dell’app non devono cancellare quaderni, tentativi, ordini o dati additivi. Il vecchio lettore può ignorare le nuove tabelle. Non eliminare tabelle per simulare un downgrade.
- Merge di codice, preview, approvazione scientifica ed esposizione di contenuti nell’app sono passaggi distinti. Questa sessione produce una PR separata in bozza. Non è autorizzato usare il suo esito come approvazione della banca DRAFT.
- Non aggiornare firme o ricevute scientifiche per ottenere il verde. Un nuovo comportamento richiede prove nuove sul proprio consumer.

## 8. Limiti effettivi e prossimo lavoro

L’uso libero è disponibile per i banchi del catalogo. Il contratto completo di caso, con salvataggio e riapertura verificabile, è limitato a Poiseuille. Le viste sono quelle standard; l’orientamento libero della camera non viene serializzato. Non sono archiviate tutte le vecchie versioni del motore. Le raccolte contengono casi, non un editor generale di lezioni, classi o videoconferenze.

La lista personale mostra gli ultimi 200 casi e le ultime 100 raccolte con conteggi totali. La paginazione non è ancora implementata. Gli account di prova sono dati sintetici. Nessuna prova condotta da agenti equivale a un test di usabilità con studenti o docenti, né a una misura di efficacia didattica. La policy ha regole reali e controprove riproducibili; il beneficio sulle persone richiede un pilot dedicato.

### Ordine consigliato per la sessione successiva

1. **Chiudere la verifica della candidata precisa.** Primo passo: leggere head, PR e ricevute, eseguire soltanto i gate mancanti o invalidati. Dipendenza: runtime browser disponibile e head scientifica riconciliata. Accettazione: report con SHA, percorso completo, negativi conservati, nessuna regressione rispetto alla base.
2. **Portare il medesimo contratto su un secondo strumento e su Analisi.** Primo passo: scegliere un oggetto con modello e parametri già verificati. Dipendenza: classificazione delle versioni e degli accessi. Accettazione: riapertura esatta, errore incompatibile esplicito, stessi test e stessa autorità dati, senza fork del player.
3. **Completare lo studio quotidiano con preferenze persistenti.** Primo passo: riusare le impostazioni account per programma e obiettivo, preservando l’override esplicito. Accettazione: due dispositivi propongono un percorso coerente e spiegabile; nessun requisito di diagnosi o etichetta personale.
4. **Verificare il percorso con persone.** Primo passo: far cercare uno strumento e riprendere un caso a un docente e a uno studente, usando dati di prova. Accettazione: osservazioni e problemi riproducibili, raccolti separatamente dai test automatici; correggere i blocchi prima di aggiungere funzioni.
5. **Scalare le raccolte e la manutenzione degli asset.** Primo passo: paginazione per cursore e gestione esplicita dei casi obsoleti. Accettazione: gli elementi vecchi restano raggiungibili, niente perdita silenziosa, tempo misurato su quaderni e raccolte ampi.

## 9. Prompt breve da dare all’agente successivo

> Lavora su `AndreaMarro/ardesia`, cartella esclusiva `officina-di-fisica/`, in un worktree nuovo a partire dalla head aggiornata della PR DRAFT #366 (`feat/cric-resource-learning-20261127`). Leggi `AGENTS.md`, rigenera lo stato e leggi questo handoff, `PRODUCT-TARGET-AND-ACCEPTANCE.md`, il registro della consegna e i check della PR. Ricontrolla le head: il ramo scientifico può essere avanzato e può esistere lavoro locale non pubblicato. Continua il prodotto preservando la visione: il docente attinge a strumenti e casi; lo studente trova spiegazione, pratica e recupero coerenti. Non introdurre un LMS per conduzione delle lezioni. Conserva architettura, dati e gate. Verifica il consumer reale e la riapertura prima di dichiarare completato. Correggi le regressioni osservate; non indebolire test o firme. Documenta comandi, SHA, limiti e prossimo passo. La pubblicazione dei materiali nell’app resta soggetta al gate umano.
