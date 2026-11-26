# Revisione indipendente del fix della legenda del lavoro

Revisore A, distinto dall’autore Core. Delivery letta: `7173a92ce980f102f0904175c90c0f7a150b2931`; codice candidato `b38d8b8dd1dd3d69f558bbe8753d759084aa527f`, baseline `64aef05bef5ca7ebff8491060762dd4cac0cbb34`. Runtime realmente verificato prima e dopo: `95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d`. Nessuna produzione, firma precedente, registro o checkpoint modificato.

## Esito delimitato

**NON APPROVATO: istruzione del fallback da correggere.** Nel fallback reale WebGL disabilitato, sia a 320 sia a 1280 px, la legenda invita «usa la vista Alto», ma il bottone Alto è visibile e disabilitato. L’associazione geometrica resta riconoscibile nella tavola 2D: la retta grigia passa per la coda comune. Il difetto riguarda il comando richiesto, che non è utilizzabile. Il supplemento registra esplicitamente testo, controlli DOM e stato `disabled=true`, con PNG reali. Non è una deduzione dal solo codice.

La rimozione della sola etichetta opaca y libera invece le code del target nelle viste native osservate. Il controllo indipendente non si limita alle punte: riproietta tutti i vertici delle due parti chiuse a 32 facce di ogni vettore. Nei 24 stati nativi sono presenti 48 corpi completi, tutti entro il viewport e sopra il piano; la distanza conservativa minima fra un loro rettangolo d’ingombro e l’unica etichetta x è 59,689 px. Il margine è ampio rispetto agli arrotondamenti Float32, ma questo calcolo da replay sorgente non è introspezione dello stato GPU privato. I PNG reali corroborano la rimozione dell’ostacolo.

Le sovrapposizioni proprie della proiezione restano esplicite: a 0° i due vettori sono collineari e si coprono parzialmente; a 90° in Laterale la forza è vista di punta, dunque non se ne leggono lunghezza e direzione nel piano; anche a 120° Laterale si vede soltanto la componente proiettata. La vista Alto, disponibile nel nativo, mostra i vettori nel loro piano e la retta y senza etichetta. Non si afferma che due corpi completi siano sempre separatamente leggibili in ogni proiezione. Forza e spostamento hanno grandezze e scale proprie: 1,5 e 1,6 unità grafiche non sono una scala fisica comune. Le scale, le linee d’azione e i controlli precedenti sono invariati.

## Prove nuove realmente eseguite

- Collector canonico byte-identico, SHA `e5fb470573b382d440fd55b50c82f60f8b9edae368b675bf14f2ed96c3c89e95`: **40/40 casi tecnici**, processo reale exit 0. Per 320 e 1280: Obliqua, Laterale, Alto e fallback; setup e angoli 0°, 90°, 120°, 180°. Assenza di violazioni axe e overflow nei setup; import canonici e identità dei tre record DRAFT coesistenti verificati. Questo esito tecnico non concede accettazione scientifica o visiva.
- Supplemento nuovo e separato, protocollo `9c5284702415c046dc040c2ee78b2f68fcd542759288b05120e42337f6903107`: **4/4 casi**, processo reale exit 0, osserva i controlli del fallback. Non sostituisce né riscrive i 40 canonici.
- Tutta la griglia del target, 37 angoli da 0° a 180° con passo 5°, in sei stadi: 222 contesti. Confronto strutturale della stessa griglia dei sei record C1 nativi vettori: **888 contesti**, di cui 666 degli altri cinque record byte-equivalenti nelle primitive. Il confronto serve a delimitare il delta, non approva le occlusioni degli altri ID. Le funzioni matematiche, il teaching e le scene sono identici; cambia soltanto il filtro y del target e la sua legenda.
- Riproduzione indipendente della legge W=Fs cos θ e derivazione manuale: 12, 0, −6, −12 J. Il valore grezzo Node a 120° è −5,999999999999997; è riprodotto esattamente senza ampliare tolleranze.

Il target è **solo source/published v1**. I tre pacchetti DRAFT 118/119/140 sono record diversi coesistenti; non esiste una versione DRAFT di questo ID. Non è stato inventato un confronto source/DRAFT del lavoro.

## Lettura delle immagini e limiti

Tutti i 32 PNG degli stati e gli otto setup sono stati letti nelle tavole di contatto; i 12 stati nativi a 320 sono stati inoltre letti in strisce a risoluzione nativa dell’intero apparato, senza tagliare vettori o assi. Le tre viste native a 120° e 1280 px sono state aperte anche integralmente. Il setup fallback a 320 è stato aperto integralmente; gli otto setup sono visibili nelle due tavole dedicate. Le tavole sono derivati di sola consultazione: gli originali completi restano separati e immutati con hash. Non si dichiara una lettura manuale pixel per pixel di ogni immagine a piena risoluzione.

I due negativi preparatori del revisore sono conservati: riferimento analitico +0 invece di −0 in un confronto Node; conteggio erroneo di almeno 64 vertici unici anche per il cono con apice collassato. Le correzioni riguardano soltanto tali riferimenti del revisore; il confronto strutturale candidato/baseline e i dati dei corpi restano invariati. I processi finali sono stati realmente rieseguiti con output e codice di uscita conservati. Il primo tentativo di produrre una tavola di contatto ha avuto un refuso Python prima di qualsiasi scrittura; la sola produzione del derivato è stata poi ripetuta.

Nessuna estensione dell’esito agli altri cinque esperimenti vettori, a un futuro fix comune o al runtime Root 1a. Nessun nuovo ID, attività, pubblicazione o approvazione umana accreditato. Human NOT_RUN, activityCredit 0. I negativi e le prove precedenti rimangono immutati.
