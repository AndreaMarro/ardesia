# S14 — MathLive nel consumer Formula

## 26 ottobre 2026 — primo checkpoint, append-only

Chat `01a175a6-aa38-7142-82c3-c642e522e608`, branch
`codex/s14-formula-composer-20261026`, base aggiornata `992d1a0b5cdf40d94259d3be698a4d6c5dcc1231`.
L'utente ha autorizzato esecuzione e coordinamento diretto fra chat. S00 ha
delegato MathComposer, namespace formula-composer e questo handoff. Room resta
del writer S07/S00; latexToImage, Vite, font e lockfile sono invariati.

Il filone raccolta Excalidraw della chat `01a1759b` resta distinto, così come
collaborazione S07 e media/replay S08. Non è stato creato un secondo editor.

## Risultato implementato

- I sei template usano insert/replaceSelection/placeholder di MathLive: il
  resto della formula si conserva; la selezione entra nella struttura.
- Annulla/ripeti e tastiera matematica usano i comandi nativi del componente.
- Una richiesta asincrona alla volta; campo e azioni sono bloccati durante
  l'inserimento. Rigetto visibile, stessa bozza disponibile per il retry.
- Copia LaTeX confermata o errore leggibile; nessuna chiusura implicita.
- Risultati tardivi ignorati dopo smontaggio; listener rimossi nel cleanup.

Consumer esistente: toolbar Room → formula → MathComposer → insertMath →
latexToImage → Excalidraw image + journal → WorkspaceStore/bundle.lesson.
La patch `room-insert-math.patch` propone not-ready/rethrow e controllo
identità canvas/journal dopo await. Include l'asserzione di rigetto nel test
Room esistente. Applicabilità PASS (`git apply --check`), **NON APPLICATA** qui.
Senza applicazione reale il vecchio Room continua ad assorbire l'errore: il
batch non è DONE e non si dichiara conservazione della bozza end-to-end.

## Prove effettive a questo checkpoint

RED: i sei nuovi test falliscono sul codice originale per doppia richiesta,
mancato errore/retry, callback dopo unmount, empty e feedback clipboard.
Anche un rigetto non gestito è stato osservato e conservato nel log RED.
GREEN: 13 test / 3 file PASS, 5.28s, runner seriale; nessun errore non gestito.
È un test del lifecycle host con CustomElement sostitutivo jsdom: non prova
selezione/history/tastiera del donor, né inserimento reale sulla lavagna.
Log integrali locali in `../../../../../work/formula-red.log` e
`formula-green.log` rispetto alla directory chat, SHA nel registro prove.

Comando da apps/studio:

```sh
../../node_modules/.bin/vitest run src/formula-composer/MathComposer.integration.test.tsx src/__tests__/MathComposer.test.tsx src/__tests__/MathComposerFonts.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Typecheck/build/browser e CI della candidata: NON_RUN a questo checkpoint,
in attesa della finestra host rilasciata. Nessun merge o deploy eseguito.

## Acquisizione e diritti

TARGET-081 MathLive **ADAPT**: versione 0.111.1 MIT già nel lock, nessuna
dipendenza runtime nel package installato. Riutilizzati editing strutturale,
selezione, placeholder, undo manager e tastiera virtuale; nessuna estrazione o
modifica del donor. Pin/integrity e REA in PROVENANCE.json.

Confronto: [MathQuill](https://github.com/mathquill/mathquill) (MPL-2.0),
**DEFER**: introdurrebbe un secondo editor e un adapter per la stessa capacità;
nessun pin/install o riuso effettuato.
[KaTeX](https://github.com/KaTeX/KaTeX) (MIT), **DEFER** per questo batch:
renderer statico, non sostituisce selezione/history; rendering SVG resta al
MathJax già usato da Room e posseduto da S00.
[API MathLive](https://mathlive.io/mathfield/guides/commands/) consultate e tipi
del pin riletti: le API ufficiali evitano una ricostruzione del motore.

TARGET-013 Goodnotes: REA ha identificato installazione/versione/eseguibile e
formati dichiarati. CUA getApp ha restituito timeout -10005: **UI NON_VERIFICATA**.
La [documentazione ufficiale audio](https://support.goodnotes.com/hc/en-us/articles/7352688559631-Add-Audio-Recordings-to-your-documents)
descrive sync/replay; ciò non è una prova runtime locale. Audio/replay Ardesia
sono già presenti e posseduti da S08/S00: nessuna reimplementazione duplicata,
nessun codice/asset/contenuto proprietario incorporato.

REA MathLive: analisi statica del distribuito mathlive.mjs, parent
`ev_41c470810c9d249197ae0925c5cad06dd7a80547db5d2af8b85af4a12feda7c8`.
Copertura parziale: 19 file non selezionati, limiti 6000 nodi / 3000 unknown;
bootstrap non eseguito. Il corpo distribuito conferma delega insert e comandi
al mathfield interno e gestione undo nativa. Comportamento da provare nel browser.
Bundle completo esportato prima della rimozione dei tool REA dalla sessione;
nessun tentativo di configurazione/riavvio richiesto.

## Appendice per memoria S00 — non modificare il passato

Le note storiche Studio sulla CDN e M0 non sono state riscritte: canone corrente
e ownership S00 governano il rendering locale della PR314. Main aggiornata
da8e0737b1 a992d1a0b via fast-forward ordinario, preservando modifiche composer.
Il passaggio MathLive è attivazione del sottosistema già acquisito; il valore
aggiunto misurabile va dichiarato solo dopo il consumer reale e il round-trip.

1. **P0 raccordo Room.** Primo passo: S00 applica patch contro Room finale S07.
   Dipendenza: writer rilasciato; accettazione: rigetto/bozza/retry e stale
   lifecycle impediscono inserimento nel contesto nuovo; prova Room reale.
2. **P0 native UI.** Primo passo: nella finestra libera avviare un solo browser.
   Dipendenza: rilascio host; accettazione: selezione/history/tastiera e ripetute
   aperture su desktop/390px, senza errori; screenshot e script riproducibile.
3. **P0 persistenza.** Inserire due formule in due lezioni sintetiche, export/
   import in store nuovo e cold reopen; accettazione: immagini e journal
   presenti e isolati. Prova sul consumer patchato, non solo callback.
4. **P1 integrazione.** Review separata, CI head esatta e merge sequenziale S00;
   verifica post-merge. Nessuna pubblicazione o approvazione scientifica implicita.

## 26 ottobre 2026, 02:22 CET — review e correzioni successive

Primo commit21f979e3 nella draft PR318. Il suo CI hygiene è FAIL per context
blank con spazi finali nel file patch; non era un problema del prodotto.
Corretti i blank senza cambiare i gate, `git diff --check origin/main` PASS.
Il primo verde host13 resta la fotografia sopra; dopo due P2 riprodotti in
review il nuovo checkpoint è14PASS/3file,2.50s, senza errori non gestiti.

Review indipendente e adjudication in REVIEW.md. `mode: math` esplicito e
`disabled` completo durante pending correggono le assunzioni sbagliate sulle
API del donor. La patchv1 è SUPERSEDED_NOT_APPLIED; la v2 aggiunge anche mutex
Room e blocco del toggle esterno. Control Room originale3FAIL →copie candidate
3PASS, senza editRoom nel diff. Raccordo reale ancora affidato aS00 dopoS07.
Prove complete browser/native/round-trip restano NON_RUN a questo checkpoint;
la finestra effettiva è occupata daS01, dietro releaseS04/S05/S09.

Nuovi log raw locali: formula-review-red.log, formula-review-green.log,
room-patch-red.log, room-patch-green.log. Non si promuove una prova di copie a
prova di main o ambiente pubblicato. I prossimi quattro task sopra rimangono
validi, con la sola sostituzione del nome patchv1 con patchv2.
