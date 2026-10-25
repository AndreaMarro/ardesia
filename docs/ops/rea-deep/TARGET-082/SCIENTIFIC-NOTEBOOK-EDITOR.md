# Quaderno scientifico — editor integrato nel corso

20 ottobre 2026. Incremento locale sulla base Core
`ebcb6bc8020f444281f87770b66e43b7bb665a7a`.

Il quaderno ora si apre sia nell'aula sia in «Il mio lavoro»: PDF originale,
note, evidenziazioni, formule MathLive, spostamento, dimensioni, Undo/Redo,
salvataggio e riapertura usano lo stesso componente. La consegna collega la
revisione salvata e aggiunge il suo PDF esatto. Il tutor legge quella revisione,
anche quando lo studente ha già salvato una versione successiva privata.

## Evidenze e ricostruzione

REA **6.7.0**, MCP stdio reale, 207 tool inventariati. Il registro npm e la
[release ufficiale](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0)
confermano questa versione come ultima pubblicata al controllo odierno.
La registrazione era già valida: non sono stati ripetuti setup o aggiornamenti.
Il client locale non aggiunge a caldo tool alla chat.

| Evidenza | Osservazione e uso |
|---|---|
| Studio originale, `ev_4262a9eb22a1b768425a55c61c453402ff8dc32f5ab22ab502314f113c0d6b43` | Apertura del compositore e scelta dell'integrale riuscite; riuso del motore MathLive con adattatore originale. Dettagli nella precedente consegna Core. |
| MathLive distribuito 0.110.0, `ev_d70e3d107c1a5302e6c0ac3f6a3ab3b24c254833946dae1a8f350a33bf458684` | Analisi statica selezionata di `mathlive.mjs`, digest dell'artefatto `d45bb2f21186c8c0c259b721479e262a8be211d0110231bd1e2e66c99ed70be2`; font e motore distribuiti localmente. Non è una prova di esecuzione o di recupero completo della logica. |
| Editor Ardesia costruito, `ev_de64475928f53c3ea64e359d27829e3403c23a2c2a48ed8ef8a64af3c9e7b099` | Navigazione iniziale e 25 azioni completate: pagina 2, nota, salvataggio confermato, chiusura/riapertura, formula, salvataggio, rotazione e zoom. DOM, accessibilità, screenshot e rete nel bundle MCP. |

L'analisi statica lascia 19 file inventariati non selezionati e raggiunge il
limite dei fatti sconosciuti; il grafo è incompleto. La cattura finale conserva
168 eventi, zero scartati e nessun page-error, ma REA la classifica globalmente
**incomplete / events**: alcuni contenuti di rete selezionati non sono
disponibili entro i budget. Non prova equivalenza completa, wire bytes,
causalità delle richieste o identità crittografica del processo. Il manifest
del build locale è un'evidenza separata.

Le prime due catture sono conservate: attesa del pulsante disabilitato scambiata
per salvataggio concluso; poi selettore ambiguo dopo l'aggiunta ripetuta di una
nota. Il secondo export è stato rifiutato perché il file esisteva già; rimane
la risposta MCP completa. La cattura finale usa conferma visibile, fixture
sintetica ripristinata e destinazione nuova. Non sono correzioni al prodotto.

Il precedente scenario Undo dello Studio originale resta fallito, come
documentato in `SCIENTIFIC-NOTEBOOK-CORE.md`; la riuscita dell'editor nuovo non
trasforma quell'evidenza storica in un successo.

## Contratti implementati

- **Identità:** apertura autorizzata a ogni selezione; originale verificato
  per assetId e SHA-256. Due PDF con lo stesso fingerprint interno e byte
  diversi restano separati. Un upload rinominato degli stessi byte recupera
  la risorsa e rilegge la sua head.
- **Geometria:** il PageViewport effettivo di PDF.js converte pixel, CropBox e
  rotazione in coordinate normalizzate non ruotate. Drag, frecce, posizionamento
  e campi numerici condividono il contratto. Il testo sul PDF scala col documento;
  il pannello laterale mantiene note e formule leggibili.
- **Salvataggio:** CAS sulla revisione, body e chiave idempotente congelati nel
  pending, retry della stessa richiesta dopo risposta persa. Un ACK vecchio
  non cancella una nuova bozza. Una head successiva già osservata rimane un
  conflitto anche dopo il recupero della ricevuta precedente.
- **Bozze e Undo:** memoria isolata per sessione, attore, edizione, risorsa e
  originale; massimo 10 bozze e 20 passaggi Undo. La bozza sopravvive alla
  navigazione interna, la storia Undo resta nell'editor corrente. Il cambio
  sessione svuota anche le bozze di editor già smontati. Beforeunload avvisa
  se restano bozze; download JSON disponibile.
- **Ripristino:** rilettura della head prima di scartare la bozza, conferma
  esplicita e conservazione del draft se il recupero fallisce.
- **Formule:** caricamento differito di MathLive, font locali, niente Compute
  Engine o suoni. Macro HTML rese inerti e DOMPurify con filtro CSS. L'editor
  conserva `contenteditable` necessario alla tastiera; le preview statiche
  lo rimuovono. Il primo carattere digitato è annullabile.
- **Consegna:** verifica della revisione esatta prima del primo invio, PDF
  deduplicato negli allegati, massimo 5 originali. Rimozione del riferimento
  dalla bozza senza cancellare il file. Retry con payload invariato; risposta
  `stale_source` sblocca la selezione conservando la spiegazione.

Il codice di integrazione è originale; motori e licenze restano attribuiti ai
rispettivi autori. `apps/web/THIRD_PARTY_NOTICES.md` riporta MathLive 0.110.0
(MIT), DOMPurify 3.4.17 (opzione Apache-2.0) e PDF.js 6.4.299 (Apache-2.0).
Manifest e lockfile bloccano le nuove dipendenze. MathLive è necessario per
editing matematico strutturato; DOMPurify per rendere markup non fidato anche
nel contesto tutor. Il chunk matematico è circa 833 kB, 231 kB gzip, caricato
su richiesta. Il warning Vite >500 kB rimane visibile.

## Verifica e correzioni

Risultati e hash sono in `notebook-editor/verification.json`; evidenze REA in
`notebook-editor/evidence-index.json`. Log, bundle, screenshot e script sono
nella consegna esterna.

La suite Web completa passa **191 test in 29 file**. L’ultima aggiunta di
`role="region"` al viewport PDF è seguita da 9 test mirati, build con `tsc -b`
e ripetizione del browser/axe; l’incomplete ARIA è risolto. La cattura REA e
il flusso browser completo precedono questa modifica di attributo, verificata
separatamente; entrambi i manifest del build sono conservati.
Il gate Studio congelato verifica anche il consumer condiviso SubmissionPanel,
typecheck e replay deterministico. Non sono stati modificati Core/API in questo
incremento: i precedenti 2.473 test Engine e 235 API non sono rivendicati come
nuove esecuzioni.

Il flusso nel browser reale usa il build Web, Chrome e API SQLite con soli
utenti/dati sintetici: upload → annotazioni/formula → drag e Undo/Redo →
salvataggio → chiusura/riapertura → risposta persa e retry → consegna in aula →
nuova versione privata → tutor sulla revisione consegnata. Tutor: 200 sulla
revisione consegnata, 403 sulla head privata; nessuna richiesta esterna o
eccezione JavaScript rilevata nel percorso.

Browser plugin non disponibile: Playwright ordinario. URL locale
`http://127.0.0.1:5397`; viewport 390, 820 e 1440 px, zoom CSS 200%, preferenza
reduced-motion. Identità pagina, contenuto presente, controlli effettivi,
assenza di overlay di errore e screenshot controllati. Focus visibile da
tastiera, input MathLive e Cmd+Z, policy CSP candidata senza script/font/rete
esterni verificati nel browser. Axe sulla regione quaderno: zero violazioni,
25 controlli passati; `color-contrast` rimane incomplete sui simboli e sul testo
sovrapposto al PDF. Non è un'attestazione di accessibilità completa.

La review separata ha riprodotto e chiuso tre difetti: CSS attivo tramite alias
LaTeX, conflitto nascosto dopo ricevuta vecchia, posizionamento con dimensioni
obsolete. Tre probe indipendenti passati. Le passate successive sono in sola
lettura, non nuovi collaudi. Il wrapper esterno `~/lessonos/bin/review.sh` è
assente; la review separata è esplicitamente distinta da quel wrapper.

Il browser del builder ha inoltre individuato e corretto API MathLive chiamate
prima del mount, autofocus ritardato, feedback di handoff rimasto dopo una
modifica, scala delle formule sul PDF, attributo di input rimosso e baseline
Undo cancellata. I log falliti sono conservati, senza contarli come verdi.

## Limiti residui

La bozza non salvata non sopravvive al reload/crash: avviso ed export non
equivalgono a recupero persistente. Salvataggi canonici e riapertura sono
verificati. L'export della bozza è una copia di recupero, non un'importazione
automatica. Nessuna modifica/signatura del PDF originale.

Restano PostgreSQL live, screen reader, Safari/Firefox, penna/touch, prestazioni
con 200 formule, verifica completa di contrasto e un workflow equivalente
esterno autorizzato. Nessun accesso nominativo, test cloud, G0/G1 o rilascio
certificato. SYS-01 rimane aperto per queste verifiche; SYS-02..08 non sono
completati da questo incremento. Nessun push, merge, deploy o messaggio esterno.
