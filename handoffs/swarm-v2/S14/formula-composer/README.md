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

## 26 ottobre 2026 — primo browser nativo e rettifica

Finestra dichiarata in306/6406210315 e rilasciata6406231996. Tre tentativi:
il primo non avvia il browser perché il runner risolveva MathJax dal workspace
sbagliato; il secondo si ferma sul selettore status, che includeva anche la
live-region interna MathLive; il terzo raggiunge il salvataggio/rientro ma va
in timeout aspettando il download .lesson. Nessun PASS di export/import.
Report raw dei tentativi2/3 conservati lossless; nessun errore scartato.

La rilettura del report3 ha scoperto una conclusione prematura del runner:
in modalità LaTeX il valore restava `x+1`, ma il test verificava solo l'assenza
di `#0/#?`. Quel singolo PASS precedente e il claim modeLaTeX nel checkpoint
6406231996 sono **NON_CONCLUSIVI**. L'asserzione ora richiede anche la frazione.
Il donor richiede di completare prima il gruppo LaTeX: aggiunto il comando
complete, con nuova regressione host RED→GREEN. Host successivo15PASS/3file,
1.73s. Test nativo da ripetere sulla nuova fonte.

Già osservati nel browser: prompt bloccato, toggle Room bloccato, rigetto con
stessa bozza, selezione/strutture in math e text, undo/redo, clipboard, SVG
MathJax reale sul canvas, save/reload e isolamento dalla seconda lezione.
Non sono certificazione di main. Anche la visibilità fisica della tastiera
richiede un'asserzione DOM: il flag visible e la prima screenshot non bastano.
Il runner ora la esige.

Nel report3 compaiono anche6risposte403; causa non ancora stabilita. Il runner
successivo registra URL/schermata d'errore, consente al Vite locale le sole
directory reali delle dipendenze condivise e usa la navigazione Materiali con
flush canonico, anziché un salto diretto di URL. Correzioni di fixture da
verificare, non attribuzioni certe del timeout.

## 26 ottobre 2026 — ripresa FileProvider, policy touch e v3

Il file originale MathComposer in Documents è stato osservato con flag
compressed,dataless. Letture git/cat sospese; originale preservato, ripresa
dello stesso commit38c32302 in /private/tmp/ardesia-s14-formula-recovered-20261026.
Blob del componente confrontato prima degli edit:6065878e63a4489eddd9f62b53ff76b6ba0bf4dd
identico a Git. Nessun reset, force-push o modifica a file/PID di altri owner.
Gli export REA raw sono compressi lossless nella directory work originale;
hash dei byte decompressi verificati prima di rimuovere le copie non compresse.

I workflow della38 sono tutti completed/success: CI40254992876, marketing40254994439,
readiness40254992851 e contract40254993105. Questo verde non certifica il delta
successivo descritto qui, né il consumer Room conservato come patch.

Browser9 ha confermato export/import della vera formula in un contesto/store
nuovo e viewport touch. Il precedente errore raw/events.jsonl derivava dal
reload dopo sola conferma board: attraversando la normale Continuità si
esegue flushLiveLesson (canvas+journal) prima della riapertura. Il runner non
crea journal artificiali. Il limite del reload prima di un flush completo
resta esplicito; un badge board non è prova di durabilità del journal.

Browser9 ha poi riprodotto il toggle touch che riapriva la tastiera: auto focus
interferiva col comando hide. Il composer usa ora la policy manual nativa,
controllata dai due pulsanti host/donor. Browser10 ha verificato entrambi i
versi del toggle, senza overflow, oltre a tutti i passaggi precedenti:14check
PASS e zeroerrori inattesi. Il risultato globale resta FAIL: il menu Room
mobile aperto intercettava il click su Chiudi.

La patchv3 conserva tutti i controlli v2 e chiude il menu quando si sceglie
Formula. Regressione DOM dedicata più i tre contratti precedenti:4RED control
con Room originale →4GREEN su copie candidate,41.65s sotto carico.
Host su policy manual:15PASS/3file,7.08s con Node22.14.0. Le patchv1/v2 sono
SUPERSEDED_NOT_APPLIED; usare soltanto room-insert-math-v3.patch.

Browser11 ha raggiunto10check ma è fallito al reload della canvas sotto
contesa; causa non stabilita, budget60s non alzato. Il suo label testuale
"patchv2" nel report è rimasto vecchio: il loader leggeva il filev3, come nel
runner e nel relativo check di applicabilità. Il report raw non viene riscritto.
La chiusura mobile con tastiera visibile sulla v3 resta da completare.

Correzioni di reporting effettivamente pubblicate in306/6411636274 e6411679352:
6411616246 anticipava4GREEN quando il comando era ancora running; esito
ritirato, poi registrato solo dopo EXIT0 effettivo. Runner11 è FAIL con cleanup
interrotto, non semplicemente INTERRUPTED. Ho avviato quel runner senza prima
attendere l'analisi del ps che mostrava la fullsuite S00; fermati solo i miei
PID10059/10053/10052/10045/9953/9875. Nessun PID S00 toccato, nessun tempo
allargato per contesa. L'errore di coordinamento e le sue prove restano storici.

S00 ha risposto direttamente: mantiene il raccordo nella STESSA318 dopo311,
nessuna delega Room prima di quella integrazione; applicherà lui i soli hunks
v3 oppure assegnerà la candidata consolidata. Il diff continua a non modificare
Room. Non READY/DONE: verifica nativa finalev3, raccordo autorizzato, CI della
nuova head e post-merge restano necessari. Merge/rilascio spettano sempreS00.

Priorità successive, con lo stesso consumer:
1. Rilascio effettivo slot daS00, poi controprova nativev3 con chiusura mentre
   tastiera visibile. Accettazione:15check, zeroerrori; report/screenshot reali.
2. S00 integra311 e applica/assegna i soli hunksv3 sulla consolidata. Accettazione:
  4contratti Room e percorso Formula con errore/retry senza perdita, non solo copie.
3. CI head/merge-tree esatte e verifica sul prodotto integrato; niente trasferimento
   di verdi o approvazioni scientifiche. RUNLOG/NEXT appendice solo tramiteS00.

## 26 ottobre 2026 — runner 12 e successiva ispezione visuale

S00 ha rilasciato esplicitamente la finestra dopo il gate. Runner 12 su fonte
23604bc + Room v3 da copia: EXIT0, 15 controlli funzionali PASS, zero errori
inattesi; un errore di rete deliberato MathJax separato nel report. Verificati
math/text/LaTeX, selezione/history, prompt e toggle bloccati durante pending,
rigetto con bozza conservata, clipboard, SVG reale sul canvas, navigazione
Continuità con flush canvas+journal, reload, isolamento lezioni A/B e bundle
.lesson esportato e importato in nuovo contesto/store touch 390px. Chiusa la
formula con tastiera aperta e ripetuto mount/unmount. Slot rilasciato in
306/6411809212; S00 ha preso lo slot successivo.

La successiva ispezione delle screenshot ha però trovato il pannello Formula
**tagliato a destra su mobile**. Il controllo document.scrollWidth non rilevava
il taglio da parte del contenitore: il claim di assenza overflow del pannello
è ritirato in 306/6411864850, anche se il report funzionale raw resta PASS.
Report e screenshot originali sono conservati con questo limite nel manifest.
Non riscrivere il risultato storico né promuoverlo a verifica visuale riuscita.

Preparata una correzione locale nel namespace assegnato: border-box e max-width
per pannello/campo nativo, toolbar a capo. Il runner verifica ora i rettangoli
reali del pannello e di ogni controllo host. Modalità S14_LAYOUT_ONLY=1 per una
controprova breve su Room reale; S14_LAYOUT_CONTROL=1 disabilita soltanto il
nuovo CSS per verificare che l'asserzione rilevi la regressione. Nessun timeout
allargato. Controprova di questo delta ancora NON_RUN mentre S00 usa lo slot.

Il verde funzionale non applica il raccordo: Room resta immutata nel branch.
S00 mantiene l'applicazione nella stessa PR 318 dopo la 311. Nessun merge,
deploy o claim di integrazione in main è autorizzato a questa chat.

Audit del manifest durante la consegna: i primi otto log host/control sono
locali nella directory work originale, non inclusi nel repository. Il comando
ls -lO ne conferma ora i flag compressed,dataless; digest storici conservati,
file non riletti per evitare un nuovo blocco FileProvider. Manifest arricchito
con path e disponibilità, senza inventare un recupero o ricreare byte storici.
I log Room v3 e i report browser gzip presenti in evidence sono invece leggibili
e i loro hash decompressi sono stati ricontrollati. CI e nuove prove native
restano fonti distinte, riferite alle rispettive SHA.

## 26 ottobre 2026 — controllo negativo layout e bug tastiera su unmount

S00 ha rilasciato direttamente il gap dopo la prova HTTPS; ps analizzato senza
processi pesanti prima della presa 306/6412348209. Nuovo delta 7cf3d66: pannello
sopra la toolbar canvas, che le screenshot precedenti mostravano sovrapposta;
il runner usa anche elementFromPoint sul centro di titolo, campo e comandi.

Control 13 con solo il CSS nuovo disattivato: EXIT1 per causa attesa precisa,
right=412 > viewport=390. Candidata 14: pannello right=378, bottom=482.6875,
tastiera top=627; campo e tutti i comandi host contenuti, hit-test sopra canvas
prima e durante la tastiera. Tre controlli PASS e zero errori inattesi, poi
FAIL reale: dopo chiusura il campo sparisce ma keyboard.visible resta true
oltre i 5 secondi standard. Report e screenshot del fallimento conservati.

Il runner 12 non asseriva il false dopo la chiusura: il claim hide su unmount
in 306/6411809212 è ritirato esplicitamente in 306/6412393366. Non attribuire
retroattivamente questa asserzione al PASS funzionale 12. Il suo dato raw non
viene riscritto. Il nuovo difetto deriva dalla tastiera condivisa gestita in
modalità manual: la sola rimozione del mathfield non ne prova la chiusura.

Preparato cleanup esplicito con il comando nativo hideVirtualKeyboard prima
di remove, più test del contratto d'ordine host. Controprova ancora NON_RUN:
slot rilasciato effettivamente con porta55140 chiusa, richiesto singolo nuovo
gap dopo S08/S02. Nessun timeout allargato o nuovo tentativo non coordinato.
Room v3 resta invariata e non applicata al sorgente.

Review read-only successiva della f66ee96 trova che il primo fix cleanup non
è sufficiente: React distacca il DOM prima dell'effetto passivo, MathLive
invalida il command target e hide diventa no-op. P1 accettato, nessun PASS
nativo attribuito alla f66. Spostata costruzione/pulizia imperativa in
useLayoutEffect; il test modella ora invalidazione del target su disconnect
e verifica la chiusura effettiva mentre connesso. Controprova ancora pendente,
nessun nuovo browser avviato durante lo slot S08.

Seconda lettura statica del cleanup 60395e9: executeCommand accoda un frame con
proxy del modello che viene subito distrutto. Evitato quel wrapper: il cleanup
chiude direttamente window.mathVirtualKeyboard.hide() quando visibile, API
pubblica della stessa tastiera condivisa. Test aggiornato a verificare il
controller e assenza di comandi sul mathfield in distruzione. Nessuna nuova
prova nativa prima di questa correzione e nessun PASS runtime anticipato.
