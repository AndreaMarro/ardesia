# Review indipendente — editor quaderno scientifico

20 ottobre 2026. Checkout `/tmp/ardesia-public-rea-20261020`, diff rispetto a `ebcb6bc8020f444281f87770b66e43b7bb665a7a`. Review in sola lettura del prodotto; tutti i probe/report sono in `/tmp/ardesia-notebook-ui-20261020`. Il builder ha applicato correzioni durante la review.

## Esito finale della review

**Tre finding concreti riprodotti: uno P1 e due P2. Tutti e tre risultano chiusi nei probe indipendenti ripetuti sul diff aggiornato.** Nessun altro difetto concreto individuato nel perimetro letto. Questo non è un'attestazione di assenza di vulnerabilità né di completamento SYS-01.

Sono stati eseguiti tre probe mirati jsdom/Vitest, serialmente con un solo worker, circa quattro secondi complessivi nell'ultima esecuzione: **3 passati / 3**. Nessuna suite completa, dev server, browser reale o servizio esterno. Nessun file di prodotto modificato dal reviewer.

## Passata finale sul delta — sola lettura

**Nessun nuovo finding concreto individuato negli ultimi cambiamenti.** Questa passata non ha eseguito suite, probe o browser; il risultato 3/3 precedente riguarda la ripetizione dei tre finding sopra. I difetti reali di mount/focus MathLive e le relative verifiche browser sono stati comunicati dal builder, non riprodotti indipendentemente dal reviewer.

- **Mount MathLive:** `createMathField` usa il setter `macros`, che il pacchetto locale differisce fino al mount, senza leggere il getter che richiede `_mathfield`. `menuItems` viene applicato dopo `appendChild`; il disposer è predisposto prima di questa chiamata e rimuove listener, elemento e tastiera in cleanup/fallback. Il reset iniziale di Undo, presente in quella passata, è stato successivamente rimosso come descritto nel delta finale sotto. L'import completato dopo lo smontaggio viene ignorato. La verifica include la lettura dell'implementazione locale dei getter/setter MathLive.
- **Focus:** rimosso il focus automatico dopo l'import del mathfield. Rimane il focus esplicito della textarea delle note al cambio di annotazione selezionata; nessuna nuova prova di tastiera reale in questa passata.
- **Messaggio di handoff:** `used` viene azzerato al cambio di `editor.state`, coprendo anche titolo, Undo e rimozioni; la modifica non cambia ricevute o body pending.
- **Scala del testo PDF:** il font delle ancore usa la norma di un segmento del viewBox trasformato dal PageViewport, divisa per la sua larghezza PDF. La scala è quindi indipendente dalla rotazione e dal rapporto tra canvas e pixel CSS. Le dimensioni tipografiche interne sono relative al font del layer. Nessuna misura visuale indipendente effettuata.
- **Rimozione allegato:** il nuovo pulsante elimina solo il riferimento dall'array locale della bozza e rinnova la chiave di richiesta. È disabilitato durante busy/pending; non invoca cancellazioni server. La derivazione del PDF esatto dalla revisione del quaderno rimane nel primo invio. Letto il nuovo test con cinque riferimenti espliciti più PDF, rimozione di un riferimento e invio dei quattro rimasti più PDF, inclusa l'asserzione di assenza di DELETE; test non eseguito dal reviewer.

## Lettura aggiuntiva — guard beforeunload per sessione

Nessun nuovo finding concreto individuato nel trasferimento del guard dal componente all'epoch. Il listener legge la mappa delle bozze al momento dell'evento, quindi copre anche editor smontati e richieste ancora pending; quando salvataggio o ripristino eliminano l'ultima bozza, non annulla più l'evento. L'inizializzazione per epoch evita listener duplicati per più editor; il cambio epoch rimuove quello precedente e l'abort della sessione svuota la mappa e rimuove il guard anche senza editor montati. Il listener di invalidazione del singolo hook conserva il proprio cleanup separato.

Letto il nuovo test che modifica una bozza, smonta l'editor, verifica `defaultPrevented` su beforeunload e verifica che il successivo cambio sessione elimini l'avviso. Nessuna suite, probe o browser eseguito in questa passata. Non è attestata la comparsa del dialogo nativo in tutti i browser o nelle chiusure forzate del processo.

## Lettura aggiuntiva — input nativo MathLive e ruolo del contenitore

Nessun nuovo finding concreto nel delta letto. `sanitizeMathHTML` consente `contenteditable` soltanto quando chiamata con `editor=true` da `MathfieldElement.createHTML`; `formulaMarkup` continua a usare il percorso statico. La lettura del pacchetto DOMPurify locale conferma che ogni nuova configurazione ripristina la allowlist degli attributi prima di applicare `ADD_ATTR`, senza trasferire l'abilitazione dall'editor alla successiva preview. Il filtro CSS, i tag/attributi vietati, la rimozione degli event handler e le macro HTML rese inerti restano applicati in entrambi i percorsi.

MathLive genera effettivamente il keyboard sink interno con `contenteditable=true`; la sua rimozione precedente e il mancato input sono evidenze browser riferite dal builder. Il ruolo esplicito `group` conserva la label dell'host e il textbox interno; la lettura del lifecycle MathLive non mostra una successiva sovrascrittura del ruolo esplicito. Letto il test che alterna sanitizzazione editor/statica e controlla la rimozione di `oninput`. Nessun test, suite o browser avviato dal reviewer; input reale, Undo, axe e CSP restano verifiche separate del builder.

## Lettura aggiuntiva — baseline Undo di FormulaField

Nessun nuovo finding concreto nel delta letto. Nel pacchetto MathLive locale, `resetUndo` svuota stack e indice senza creare uno snapshot; il costruttore registra lo stato iniziale e `setValue` registra la baseline dopo una sostituzione. Eliminare il reset subito dopo il mount conserva quindi il primo punto di ripristino dell'istanza nuova. Nella sincronizzazione esterna il confronto `field.current.value !== value` precede il reset e `setValue`, evitando di svuotare la cronologia quando il valore React riflette semplicemente l'input appena digitato. Per un valore esterno diverso, il reset precedente alla sostituzione elimina la cronologia della fonte precedente e la successiva `setValue` crea la baseline; il reset in disposal resta invariato.

La lettura include il getter/setter pubblico e l'UndoManager della versione MathLive distribuita localmente. Nessun test o browser avviato; il recupero del primo carattere con Cmd+Z e gli altri comportamenti reali restano da confermare con le verifiche browser del builder.

## Lettura conclusiva — regione PDF nominata

Letta la sola aggiunta `role="region"` al contenitore `.pdf-viewport` in `PdfReader.tsx`, che mantiene `tabIndex={0}` e `aria-label="Pagina PDF, area scorrevole"`. Il ruolo esplicito rende appropriata la denominazione della regione scorrevole; non cambia render, focusabilità, handler o lifecycle del lettore. Nessun finding concreto. Nessuna suite o prova browser eseguita dal reviewer; i risultati Web/Studio e input/Undo/CSP comunicati dal builder restano evidenze separate.

## F1 — P1: CSS attivo nelle formule consegnate al tutor

**Stato: corretto e riprovato sul caso originario.**

Riferimento iniziale: `apps/web/src/integrations/notebook/mathField.ts`, `inertMacros` e `formulaMarkup`; consumer `FormulaPreview.tsx` con `dangerouslySetInnerHTML`.

Il filtro iniziale neutralizzava `htmlStyle` ma ometteva l'alias `style` fornito dal pacchetto MathLive. DOMPurify da solo non filtra i valori CSS. La formula seguente, accettabile come testo canonico Core, produceva markup con posizione fissa, inset, z-index e URL CSS intatti:

```latex
\style{position:fixed;inset:0;z-index:2147483647;background-image:url(https://example.invalid/probe)}{x}
```

Il vero `formulaMarkup` restituiva un `span` contenente esattamente quelle proprietà. La superficie del tutor renderizza le formule di una consegna studente, quindi questo contenuto non è affidabile: il markup permetteva CSS attivo e potenziali richieste di risorse esterne nel browser. **Non è stato dimostrato JavaScript eseguibile; non è stata emessa alcuna richiesta all'URL del probe.**

Prova: `math-sanitizer-probe.test.ts`, `math-sanitizer-probe-before-fix.json`. Il test usa l'adapter effettivo, risolvendo l'entry browser `mathlive.mjs` locale: l'entry SSR di Node non espone MathfieldElement e non rappresenterebbe il codice distribuito nel browser.

Fix letto: alias `href/htmlData/class/htmlClass/cssId/htmlId/style/htmlStyle` resi inerti; istanza dedicata di DOMPurify con filtro delle proprietà/valori CSS; medesima funzione per preview e `MathfieldElement.createHTML`. Il probe aggiornato conferma che `position:fixed` e l'URL non compaiono più nel markup. Risultato dopo fix: `math-sanitizer-probe.json`.

Limite: non eseguito fuzzing completo di MathLive, un audit di tutti i comandi LaTeX o una prova CSP/network nel browser; la compatibilità visuale del filtro CSS con tutte le formule rimane da verificare con il browser del builder.

## F2 — P2: il recupero di una ricevuta nascondeva una head più recente già conosciuta

**Stato: corretto e riprovato.**

Riferimento: `apps/web/src/integrations/notebook/useNotebookDraft.ts`, ramo success di `save` (attualmente righe 79–88).

Sequenza riprodotta:

1. Editor su V1 salva V2; la risposta si perde dopo il commit.
2. Un altro editor salva V3.
3. Riapertura: GET restituisce V3; la cache recupera il pending V1→V2.
4. Retry con body/key originali recupera correttamente la ricevuta V2.
5. Prima del fix, il hook pubblicava V2 con `dirty=false`, `uncertain=false`, `conflict=false` e messaggio «Tutte le modifiche sono salvate»; la V3 già osservata veniva dimenticata.

Il problema non sovrascriveva V3 sul server: il CAS restava corretto. Tuttavia abilitava il collegamento alla nuova consegna di una versione già nota come storica, destinata a ricevere `stale_source`, e nascondeva il conflitto all'utente.

Prova: `draft-head-probe.test.tsx`, risultato iniziale `draft-head-probe-before-fix.json`. Trasporto mock; hook, cache e confine sessione reali.

Fix letto: confronto della head osservata con entrambe la base richiesta e la revisione ricevuta. Il caso normale (head V1==expected o head V2==receipt) rimane distinto. Il retest conserva V2 come ricevuta ma espone `conflict=true`, disabilitando l'handoff attraverso la condizione già presente nel footer e offrendo rilettura esplicita. Risultato `draft-head-probe.json`.

## F3 — P2: il posizionamento di un'annotazione ridimensionata usava le dimensioni iniziali

**Stato: corretto e riprovato.**

Riferimenti: `AnnotationLayer.tsx`, `onPointerDown` per il posizionamento (attualmente riga 23), e `NotebookEditor.tsx`, collegamento `placingSize/onPlace` (righe 127–133).

Un'annotazione larga/alta 10% veniva riposizionata con un click al centro pagina (50%,50%). Prima del fix, AnnotationLayer chiamava `anchorRect` con dimensioni default 38%×13%; NotebookEditor ne conservava left/top ma rimetteva width/height correnti 10%×10%. La richiesta salvata conteneva `[0.31,0.435,0.1,0.1]`, cioè centro **36%,48.5%**, spostato dal punto scelto.

Prova: `placement-probe.test.tsx`, risultato iniziale `placement-probe-before-fix.json`. NotebookEditor, hook e AnnotationLayer effettivi; original/PdfReader/trasporto mock per isolare la trasformazione e catturare il payload salvato. Il probe parte da un'annotazione con dimensioni già modificate, seleziona «Posiziona sulla pagina», invia un pointer event e salva.

Fix letto: dimensioni correnti passate come `placingSize`; callback applica il rettangolo completo calcolato. Il retest ottiene `[0.45,0.45,0.1,0.1]`, centro **50%,50%**. Risultato `placement-probe.json`.

## Altri aspetti verificati per lettura

- ScientificNotebooks usa chiave sessione/attore/edizione, rilettura autorizzata a ogni apertura, controlli identità e invalidazione al ticket abort. Il draft include assetId/SHA nella chiave e non recupera il vecchio journal.
- Richieste di revisione mantenute come pending con chiave stabile, editing congelato nell'incertezza, controllo del pending prima di applicare una risposta tardiva, distinguendo successo del salvataggio da fallimento del refresh.
- Undo/Redo restano nell'istanza corrente; il cambio sessione svuota la cache anche con editor smontato. Discard fa GET prima di sostituire il draft. Non sono stati ripetuti i test di prodotto per queste proprietà.
- SourceViewer apre revisioni esatte e passa lo snapshot a NotebookEditor read-only, conservando il testo derivato per i consumer delle ancore. Nessuna associazione asset/source per indice.
- SubmissionPanel verifica la revisione esatta prima del primo invio, aggiunge e deduplica il PDF associato, preserva body/key nel retry e sblocca il pending sul 409 `stale_source`. Nessuna verifica Core live o invio reale eseguito in questa review.
- PageGeometry viene dal PageViewport effettivo del render; CSS pixel separati dal backing canvas, inversione Y rispetto a viewBox, supporto a trasformazioni ruotate. Il cambio chiave render rimuove il layer precedente; pointercancel/lost capture eliminano la preview del drag.
- MathLive è locale con versione bloccata e font/licenza/manifest emessi; suoni e Compute Engine disattivati. Cleanup del mathfield, listener e tastiera esaminato. Nessuna prova reale di font/keyboard/CSP eseguita dal reviewer.
- Accessibilità: controlli per posizione/dimensioni e frecce sulle ancore disponibili, focus di testo, label e stati esaminati. Non effettuato audit completo con screen reader, tastiera reale o misure di contrasto.

## Limiti e elementi preesistenti

- UI reale/responsive, PDF.js/MathLive in browser, touch, focus durante import ritardato, contrasto, prestazioni con 200 formule e budget massimi non sono collaudati da questi tre probe.
- SubmissionPanel ora consente la rimozione dei riferimenti agli allegati dalla bozza; il delta è stato esaminato solo per lettura nella passata finale. La gestione preesistente del pending per altri rifiuti definitivi diversi da stale_source resta fuori da questa modifica e non è stata ampliata o collaudata in questa review.
- Nessun nuovo bypass ACL dimostrato; controlli client non equivalgono all'autorizzazione server. Core v6 e PostgreSQL non sono stati modificati o collaudati in questo passaggio.
- Nessuna suite completa indipendente: gli esiti delle suite del builder rimangono evidenze separate.
- Nessuna dichiarazione di UI «perfetta», SYS-01 completato, G0/G1 superati o prontezza alla pubblicazione.

## Ripetizione

```sh
/Users/andreamarro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /tmp/ardesia-public-rea-20261020/node_modules/vitest/vitest.mjs run --config /tmp/ardesia-notebook-ui-20261020/vitest.config.mjs --maxWorkers=1 --no-file-parallelism
```

Il comando esegue soltanto i tre probe di questa cartella. I risultati `*-before-fix.json` preservano le evidenze iniziali; i normali `.json` riflettono il retest. I test ora esprimono le aspettative corrette dopo i fix.
