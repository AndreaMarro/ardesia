# Chiusura documentale degli esperimenti REA

Questo pacchetto documenta due ricerche già congelate: **TARGET-116 Tiptap** e il **prototipo proprio TARGET-082-ADAPTER** basato su PDF.js. Non contiene nuove esecuzioni, modifiche al prodotto o nuove dipendenze. Non è una ricevuta di adozione né una certificazione globale G0/G1.

## Tiptap: editing e cronologia nel contesto corretto

La ricerca ha esercitato realmente inserimento di testo, grassetto, elenco puntato, undo e redo. Il materiale esaminato comprende sorgente e pacchetto della serie Tiptap 3.32 con licenza MIT; la versione del deploy pubblico resta UNKNOWN. Il freeze conserva 19 envelope REA originali. Non sono inclusi in questo pacchetto bundle, capture o contenuti del provider.

Il comportamento significativo riguarda il cambio di contesto: un caricamento silenzioso con `setContent` può conservare la precedente cronologia undo. Pertanto cambiare documento o revisione sullo stesso editor può consentire a undo di riportare contenuti del contesto precedente. La ricerca osserva questo comportamento del donor; non afferma che sia un difetto del prodotto ARDESIA o che una correzione sia stata integrata.

**Contratto di eventuale adozione:** l'editor rimane un adattatore. Core mantiene autorità su attore, corso, risorsa, revisione, permessi e commit. Al cambio di tale contesto occorre disporre la vecchia istanza e crearne una nuova, oppure dimostrare un reset completo della cronologia con regressioni equivalenti. Dirty locale, salvataggio e consegna devono restare stati distinti. Le risposte tardive e i comandi undo non possono attraversare il confine di contesto. La decisione è un requisito ingegneristico, non una richiesta di ulteriore approvazione umana.

**Limiti:** nessuna dipendenza installata nel prodotto; nessuna integrazione o prova ACL del prodotto; nessuna affermazione di copertura completa della tastiera, IME, accessibilità, collaborazione o formati. Una visita o un grafo non equivalgono alla prova di tutte le funzionalità.

## PDF.js: prototipo proprio con fonte e revisione esatte

Il prototipo isolato ha usato PDF.js **6.4.299**, API e worker della stessa versione, serviti dalla stessa origine. Ha esercitato PDF originali sintetici V1/V2, pagina renderizzata e testo estratto, associazione alla revisione esatta, controllo SHA, errore di hash con retry, scarto di una risposta fetch tardiva e controlli CSP positivi e negativi. Il freeze conserva 9 envelope REA originali; browser e server propri risultavano chiusi al freeze.

Due PDF diversi possono condividere il primo fingerprint e recuperare lo stesso stato di `ViewHistory`. **Fingerprint e stato di vista non sono identità della fonte né autorizzazione.** L'adattatore deve usare i riferimenti canonici autorizzati e il digest dei byte, distinguendoli dal fingerprint PDF e dalla revisione del testo estratto. Il prototipo conservava il Blob originale: il buffer passato al worker può essere trasferito e diventare vuoto nel chiamante.

La prova CSP ha osservato il caricamento consentito e il blocco dei controlli intenzionali inline/eval. Non dimostra compatibilità di tutte le configurazioni di deployment. Il worker non era coperto da un'esecuzione semantica completa; lo stato globale degli eventi delle capture restava **INCOMPLETE**. Le fixture erano PDF propri semplici con testo latino. Nessuna affermazione su fedeltà generale dei PDF, formule, XFA, CMaps, Wasm, font arbitrari, accessibilità o prestazioni.

### Finding indipendente aperto F082-1

Una review successiva ha riprodotto un difetto del **prototipo non integrato**: un `getPage`/`getTextContent` di V1 che rigetta dopo che V2 è pronta entra in un `catch` privo del controllo dell'epoch e sovrascrive lo stato V2 con `OLD_V1_ERROR`.

La prova indipendente comprende due casi di rejection e un controllo late-resolve, eseguiti in **NodeVM sullo stesso `app.mjs`**, con PDF/fetch/hash/DOM controllati. Non è una prova con PDF reale, browser reale o Auth reale. **F082-1 resta OPEN.** Non viene regolarizzato come PASS dal precedente scarto della risposta fetch tardiva: quel controllo copriva un confine diverso.

Prima dell'adozione servono controlli di epoch anche in `catch`/`finally`, identità e SHA canonici autorizzati distinti dal fingerprint, confini di sessione e trasporto del prodotto, corretta chiusura del worker e verifica dei pin/licenze. Servono poi prove integrate reali sul candidato scelto. Questo pacchetto non contiene un fix.

## Conservazione e stato della consegna

I freeze e i raw privati rimangono immutati. I loro hash, e l'hash del report indipendente F082-1 ricevuto dall'integratore, sono elencati in `PROVENANCE.json`. Sono riferimenti storici: la chiusura documentale non riesegue né ricalcola tutti i raw.

Per mantenere la consegna piccola e verificabile, non sono inclusi sorgenti del prototipo, test harness, PDF, bundle o capture. Non è stata completata una nuova verifica byte per byte dei singoli sorgenti prima della chiusura; il prototipo conserva inoltre il finding aperto sopra descritto. `DIRITTI-E-LIMITI.md` delimita il riuso possibile. Il pacchetto contiene soltanto documenti propri e il loro manifest.

Il catalogo dei 139 target resta una mappa di accessi e profondità: **visita non significa workflow esercitato, analisi profonda o componente assimilato**. Questi due esperimenti non promuovono gli altri target né chiudono UNKNOWN storici. Tempo risparmiato, benchmark e benefici quantitativi restano UNKNOWN.
