# S20 — Valutazione di riuso UX

Ricerca del 26 ottobre 2026; solo fonti ufficiali e sorgenti pubbliche. Nessun file del prodotto modificato. Le copie di studio sono in questa cartella; `license-manifest.json`, `source-manifest.json` e `radix-published-manifest.json` fissano URL, commit, digest e limiti.

## Decisione

Riusare **Radix Dialog 1.3.1 già presente**, i componenti S02 `SurfaceState`/`SourceStatus`, i lettori fonte e modelli scientifici esistenti. Comporre un piccolo sistema S20 coerente con i token ProductShell e HTML semantico. Non introdurre MantineProvider, React Aria o Floating UI come ulteriori runtime. È una scelta di integrazione basata sul repository, non una pretesa di superiorità universale.

L'inventario locale è `apps/web/package.json` a main a00f2f40: React/ReactDOM 19.2.6 e solo `@radix-ui/react-dialog` 1.3.1 tra i pacchetti Radix; `CommandSearch.tsx` lo usa già. Tabs e Popover Radix **non** risultano dipendenze dirette Web. Non importarli presumendo che esistano.

## Confronto

| Candidato | Licenza verificata | Valore concreto | Costo/compatibilità | Decisione S20 |
|---|---|---|---|---|
| Mantine Core 9.7.4 / Mantine UI | MIT; licenze salvate | AppShell responsive, Aside e sezioni mobile/desktop collassabili; libreria di esempi pronta | Peer React >=19.2 compatibile con Web; aggiunge provider, hooks, CSS e dipendenze. Le style import richiedono disciplina nell'ordine della cascata. Non misurato nel build Ardesia | Riferimento di comportamento/layout, nessun runtime acquisito |
| React Aria 3.53.1 | Apache-2.0; testo completo salvato | FocusScope contain/restore/autoFocus; usePress tratta pointer, tastiera e cancellazione; componenti senza stile | Peer include React19, ESM sideEffects:false; aggiunge proprio sistema di focus/interazioni e dipendenze internazionalizzazione/stato. Se si copiasse codice occorrono licenza, notice applicabili e dichiarazione modifiche | Riferimento accessibilità, nessun codice copiato |
| Floating UI React 0.27.20 | MIT; testo salvato | Posizionamento con offset/flip/shift/size; focus e dismiss composabili | Peer React>=17 compatibile. Solo positioning usa react-dom; toolkit completo richiede integrazione e prove di interazione. Non serve al flusso S20 se fonte è drawer/dialog | Nessuna nuova dipendenza |
| Radix Dialog 1.3.1 | MIT WorkOS; LICENSE del tarball salvata | Portal, modal, overlay, focus trap/return, Esc, Title/Description, pinch zoom/scroll lock | Peer React19 compatibile; già incluso da ProductShell. ESM sideEffects:false, CSS libero e asChild | Riuso diretto del pacchetto esistente |

Fonti ufficiali: [Mantine AppShell](https://mantine.dev/core/app-shell/), [Mantine UI](https://ui.mantine.dev/), [Mantine CSS](https://help.mantine.dev/q/styles-order), [React Aria Quality](https://react-aria.adobe.com/quality), [React Aria styling](https://react-aria.adobe.com/styling), [Floating UI React](https://floating-ui.com/docs/react), [Radix introduction](https://www.radix-ui.com/primitives/docs/overview/introduction).

## Sorgenti osservate

I seguenti file sono stati letti, non eseguiti come applicazioni. Le conclusioni di questa sezione sono statiche:

- Radix `packages/react/dialog/src/dialog.tsx` al commit `eb3a2b7091293e27df8f9ba906632d8daa3d81a3`: compone FocusScope, DismissableLayer, Portal e RemoveScroll; collega Title/Description all'accessibilità e rimette il focus sul trigger alla chiusura. Il branch upstream non è assunto byte-identico al tarball; il modulo distribuito è conservato separatamente.
- Mantine `AppShell.tsx` e `AppShellMediaStyles.tsx` al commit `1d8c524fac27bc6ede5441cdff79abceb9e95b5c`: sezioni componibili e configurazione di layout trasformata in variabili/media styles; il codice dipende dal theme/context Mantine, quindi copiarlo isolato non sarebbe semplice né desiderabile.
- React Aria `packages/react-aria/src/focus/FocusScope.tsx` e `src/interactions/usePress.ts` al commit `338cf2e1940e395c899e79b7ac09eb0de6b1cea7`: contratti espliciti di focus e pressione/cancellazione. I vecchi percorsi `packages/@react-aria/...` hanno risposto404; il fallimento resta nel manifest, i percorsi correnti sono stati trovati nell'albero ufficiale.
- Floating UI `FloatingFocusManager.tsx` e `useDismiss.ts` al commit `56cbb1ab2fa0dee676bf0a222f21f99bde434f90`: focus iniziale/ritorno e modale distinti; Esc considera IME, fuori-click e focus richiedono configurazione coerente.

Tutti gli URL esatti sono nei manifest. Le licenze sono state acquisite tramite curl con verifica TLS normale: il primo tentativo urllib è fallito per CA Python non disponibile ed è conservato in `failed-license-attempt.json`.

## Costo bundle verificabile

Tarball npm ufficiale Radix Dialog1.3.1: SHA256 `485336a3a4118d0f7e49504a3b2752c8975ea0e5e3ad1c944ff055d2d2fc15f2`, SHA1 uguale al dist.shasum di registry. `dist/index.mjs` contiene14.132byte; gzip del file grezzo3.189byte. **Esclude le dipendenze, non è il costo browser completo né una misura dopo tree shaking**. La doc Radix aperta mostra12,83kB per un'altra versione1.2.0: non usare quel numero per1.3.1. Le dimensioni promozionali Floating UI sono anch'esse solo per moduli specifici, non l'impatto di un consumer.

S20 deve fare build prima/dopo sullo stesso checkout, riportare chunk grezzi/gzip e verificare la richiesta lazy effettiva. Se si riusa il Dialog già nel grafo, l'incremento non comprende una seconda copia del pacchetto; la deduplicazione va verificata nel risultato build.

## Flussi maturi da adattare

[JupyterLab interface](https://jupyterlab.readthedocs.io/en/stable/user/interface.html) mantiene una sola attività corrente dentro un workspace componibile. Simple Interface concentra un'attività senza chiudere i documenti; al ritorno ripristina il layout. [JupyterLab URLs](https://jupyterlab.readthedocs.io/en/stable/user/urls.html) separa identità del documento, sezione e workspace salvato dal server, ripristinato al refresh. Inferenza S20: stesso obiettivo/fonte sempre riconoscibile, area scientifica e scrittura vicine, pannello fonte richiudibile, modalità concentrazione reversibile e posizione URL; dati e ricevute rimangono nel Core.

Mantine AppShell insegna a rendere secondari aside/nav mobili invece di restringere tutto; in Ardesia la Shell esiste già, dunque applicare il comportamento al solo contenuto S20. React Aria suggerisce di rendere equivalenti mouse/touch/tastiera e testare la cancellazione, senza copiare il suo codice. Radix Dialog fornisce direttamente il comportamento maturo per fonte e recupero del contesto. Nessun marchio, asset o layout intero di questi prodotti viene copiato.

## Insieme coerente proposto

Componenti S20 riusabili: `JourneyHeader` (obiettivo e fonte); `JourneySection` (titolo e landmark); `JourneySourceDialog` (Radix completo con Title/Description/Close e lettore fonte esistente); `JourneyCheckpoint` (passaggi già disponibili, stato corrente esplicito, niente progresso inventato); `JourneyDraftStatus` (salvato/in attesa/non confermato); `JourneyReceipt` (Core, fonte/revisione, assistenza); `JourneyRecovery` (SurfaceState S02 + azioni reali); `JourneyFocusMode` (reversibile senza smontare form/modello). Questo è un piano di adattamento, non una dichiarazione che il consumer è già acquisito o testato.

Non mettere la risposta modificabile dentro il Dialog fonte: la chiusura deve preservarla. Non usare tooltip per istruzioni indispensabili. Non cambiare automaticamente pannello con le frecce se l'operazione scatena I/O; link/anchor di sezione sono più semplici dei tab dove serve vedere modello e quaderno insieme. L'eventuale set Radix Tabs va acquisito separatamente se necessario, con licenza e costo espliciti.

## Limiti

La documentazione upstream descrive comportamento atteso; non dimostra che il consumer Ardesia lo rispetti. Non sono stati eseguiti test assistive technology, Safari, touch fisico o test con studenti. Le prove browser e Core di S20 spettano al consumer finale. Non c'è misura comparativa bundle dei quattro framework: installarli solo per ottenere numeri irrilevanti al prodotto non è richiesto. Il confronto sceglie il sistema esistente in base a compatibilità e costo di integrazione, con costo build finale ancora da misurare.

## Tentativi REA/runtime, senza trasferire risultati

Il package REA6.7.0 già presente nella cache npm è stato richiamato via CLI; nessuna configurazione/nuovo runtime installati. Prima analisi del modulo distribuito con source-path `dist/index.mjs`, heap256MiB, deadline20s: `provider_timeout`, exit1, Evidence parziale `ev_782f4e4e1e4ed5af9eef33a07ea19e89b55cd393d9f2ea1228a2340fba282980`. Identità albero `aaeb9b797a179e8466f672cdc9d9b903b85a43646adea054450d25c43e0e7d1d`; parsing interrotto, non costituisce ricostruzione semantica riuscita né osservazione di accessibilità. Raw completo53kB in `rea-radix-published.json`. Un tentativo successivo limita i nodi a1000 e deadline60s, con output distinto.

Tentativo di aprire il demo ufficiale Radix Dialog in IAB tramite cua_repl: `transport closed before response` dopo36,7s. Nessuna interazione sul demo confermata, nessuno screenshot/runtime claim. Documentazione e sorgenti restano prove statiche. Non è un test utente.


Retry concluso exit0: Evidence `ev_9f2f43b0f4313c8cdbf32115c83c229eb20e445d63a7ed9d4f6cdf5e4e29a2d2`, stesso artefatto, source-path `dist/index.mjs`, deadline60s e limiti1000nodi/file e1000totali. Raw2.017.738byte in `rea-radix-published-bounded.json`, sintesi `rea-summary.json`. È analisi statica derivata del solo modulo selezionato;3file inventariati fuori scope e dipendenze esterne non risolte. Non ha eseguito bootstrap/JavaScript/HTML e non dimostra comportamento runtime. Il primo timeout resta FAIL separato, non sostituito dal retry.
