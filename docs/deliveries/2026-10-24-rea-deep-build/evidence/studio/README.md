# Studio — consegna congelata

**Ultima fonte:** [profile-mathlive-fonts.json](profile-mathlive-fonts.json), dopo i fix prepare/revoca e MathLive/font/lazy descritti sotto. Ultimo focused font: 115/115 e typecheck Node 22.14.0 PASS. **Gate post font PASS `{passed:2274,failed:0,exit:0}`**, Node 26.5.1: [log separato](gate-mathlive-fonts-frozen.log), [profilo finale senza drift](profile-mathlive-fonts-final-gate.json). Le prove 2.259/2.260, 2.267 e il browser a 36 controlli restano storiche, con le rispettive fonti; non sono esecuzioni dell'ultimo delta. Il root ricostruisce il candidato privato da un unico commit prodotto dopo il gate.

Ownership: `audio_v2`, solo `apps/studio` e questa evidenza. Web è di `poiseuille`; Core, builder e server sono del root. Nessun commit/push dell'agente. La base è AUDIO-V2 #298 (`f456ade218acee1a8b65f5dc24e9220681658b11`): cattura, persistenza, consenso CAS, fence import/revoca e bundle non sono stati riscritti.

La UI permette di collegare l'oggetto reale selezionato senza duplicarlo, oppure aggiungere una dichiarazione docente. Il pannello si apre dalla barra compatta, resta laterale su desktop e diventa un foglio inferiore su mobile. Usa i token carta/ink/salvia già presenti. Il replay evidenzia l'esatto ID/versione salvato con un overlay separato dal journal; il richiamo fallisce se i pin non coincidono. Il pulsante di ascolto riavvia il media reale. Testi lunghi vengono mandati a capo e l'inquadratura usa l'API pubblica della tela, senza animazione.

Il bridge effimero usa solo `courseBridge=<UUID v4>`, tre messaggi `ready/connect/proposed`, origin esatta, identità `Window` dell'opener e channel verificati. Stesso origin solo sotto `/studio/`; in sviluppo solo `127.0.0.1:5197 → 127.0.0.1:5320` oppure `localhost` corrispondente. Nessuna origine fornita da query. La UI invia solo dopo handshake e gesto esplicito; invio non significa pubblicazione Core. Prima di inviare o copiare, `prepareLessonPassage` ricontrolla consenso, byte/digest, marker persistito e oggetto/versione nella scena storica. I link interni e replay rispettano la base statica; `ARDESIA_STUDIO_BASE` accetta solo `/` o `/studio/`.

## Verifica

Il profilo [prima della suite](profile-before.json) registra SHA-256 di 517 file Studio, inclusi package/lock e gate. Il runtime della full locale è **Node 26.5.1 / npm 11.17.0**, scelto dal PATH del gate congelato. La CI definisce Node 22: questa prova locale non afferma equivalenza fra runtime. Il focused precedente era Node 22.14.0.

Comandi della full locale, eseguiti in sequenza:

```sh
export PATH="/opt/homebrew/bin:$HOME/node-local/bin:$PATH"
npm run typecheck
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

[Full log](full-studio.log): typecheck PASS, 207 file passati e 1 saltato; **2.259 test passati e 5 saltati**, 165,67 s. I cinque skip appartengono a `shots.test.ts`, che richiede la directory storica esterna `~/maestro-logs/ui-shots`; lo skip condizionale era già nel codice. Nessun test modificato o saltato per far passare questa esecuzione. Restano nel log i warning sperimentali Node 26 sul localStorage e due messaggi jsdom di navigazione non implementata.

[Focused](green-focused.log): 10 file, 186 test passati in 24,58 s. I RED conservati coprono bridge, preparazione del riferimento, selezione senza duplicazione, focus del replay, wrapping, base `/studio/` e navigazione interna. La modifica al test Room apre ora il pannello prima di cercare il pulsante audio; continua a provare nessuna acquisizione al mount o dopo l'apertura.

Gate congelato: `bash eval/gate.sh`, senza modifiche allo script, **PASS `{passed:2260,failed:0,exit:0}`** in [gate-frozen.log](gate-frozen.log). Include il [kill-test replay reale 1/1](gate-replay.log). Il suo runner mantiene il comportamento dello script originale; la full a un worker sopra è una prova separata. [Profilo dopo](profile-after.json): tutti i 517 hash Studio sono identici al profilo prima, incluso il gate (`46dbf3e019cb4fd89c39148d5336752ade34cf1dc4449ecc136c6ac9829f69f3`).

## Browser reale con fixture sintetica

[Script ripetibile](run-studio-qa.cjs), [risultati finali](browser-final/result.json), [media](browser-final/native.json), [descriptor](browser-final/passage.json), [manifest trace conservate solo localmente](../retained-traces.json). Il browser esegue la UI reale e MediaRecorder nativo; solo `getUserMedia` riceve un tono sintetico da AudioContext. La pagina parent è un **HTML harness** dell'opener, non l'app Web/Core. Nessuna voce o informazione reale.

Ultimo run: **36/36 controlli PASS**, zero page error, zero warning/error console, zero richieste fallite. Il clip persistito contiene 17.549 byte e decodifica in 1,080 s. Il percorso prova consenso esplicito, start/stop, tracce rilasciate, invio al parent senza pubblicazione Core, copia compatibile, stesso oggetto senza duplicazione, playback reale, versione obsoleta rifiutata e revoca della sessione precedente dopo riapertura.

A 1440/820/390/360 sono verificati pannello, overflow, lavagna dominante, **bounding box del testo reale nel viewport**, Escape con ritorno del focus e outline replay visibile. `browser-final` conserva 12 PNG del nostro prodotto; il [ticket B](../rea/B/B-transfer-ticket.json) ne fissa gli hash. Gli screenshot sono stati letti visivamente dall'autore; la review indipendente è separata.

`browser/` conserva un primo errore del runner (locator immagine ambiguo) e il relativo screenshot, senza classificarlo come fallimento di cattura. `browser-run2/` era 32/32, ma la lettura del PNG a 360 ha rilevato la tela fuori inquadratura pur senza overflow del documento. La correzione ha aggiunto fit al resize; il run finale controlla anche i limiti del contenuto effettivo. Non sono stati rimossi gli esiti precedenti.

## Limiti

Nessun pilot su dispositivo fisico, microfono reale, multiutente, cloud o autenticazione remota. I media restano locali; il postMessage trasferisce solo il descriptor. L'associazione è una dichiarazione docente con identità/versione e tempo: non prova semantica, apprendimento o correttezza scientifica. Le prove del percorso integrato Aula/Core e dell'artifact unificato sono del root/poiseuille. Nessuna nuova dipendenza. La missione REA B è una controprova successiva all'implementazione: [limiti, fonti e licenza](../rea/B/README.md).

## Addendum — prepare/revoca dopo il primo freeze

La review indipendente ha riprodotto un P2: `prepareLessonPassage` verificava i media, poi attendeva il journal; una revoca completata durante quell'attesa rendeva la timeline `revoked`, ma il confronto dei pin ignorava availability e restituiva il descriptor. Zero byte venivano trasportati, ma il nuovo riferimento era già indisponibile. [RED indipendente ripetuto dall'autore](prepare-revoke-independent-red.log); [RED permanente](prepare-races-red.log): 2 fallimenti (revoca e corruzione) con 18 altri test verdi.

Il fix aggiunge il controllo canonico di availability al preflight e ricontrolla marker, digest, oggetto/versione e scena storica nella snapshot finale sotto la **lease della lezione già esistente**. `WorkspaceStore.readLessonSnapshot` espone soltanto `read` del driver interno, limitato a `raw/<lesson>/`: nessuna riacquisizione del coordinator, write o nuovo stato di consenso. `loadReplayTimeline` accetta ora una porta di sola lettura. Il preflight resta fuori lease, così una revoca concorrente può completare; la snapshot finale è coerente con CAS, purge, journal e import della stessa lezione. Un descriptor valido già restituito non diventa un'autorizzazione permanente: il replay continua a verificare consenso e byte correnti.

Le regressioni permanenti verificano revoca/corruzione durante il journal, revoca/corruzione/nuova versione dello stesso oggetto/import validamente completati dopo preflight e prima della lease finale, più coerenza della snapshot mentre una revoca CAS attende la lease. La porta rifiuta letture di un'altra lezione e traversal. [Ultimo focused](prepare-races-final-green.log): **8 file, 197/197 PASS**, 5,27 s; `tsc -b --noEmit` PASS, Node **22.14.0**. Include i precedenti test audio tail/drain/pending/import/revoca e replay. La prima invocazione estesa aveva un glob shell senza corrispondenze: [errore di comando conservato](prepare-races-invocation-error.log), corretto usando nomi espliciti.

[Diff concreto](prepare-fix.diff.gz), [hash delle quattro variazioni rispetto al primo gate](profile-prepare-fix.json). Full e gate precedenti restano evidenza storica; nessuna seconda full locale è stata eseguita, su indicazione root. Gate, lockfile e UI non sono cambiati in questo fix. Nessuna nuova dipendenza, autorità o secondo lock.

Il revisore ha confermato il proprio [oracle immutato GREEN 1/1](../review/C-private/C-prepare-revoke-green.log), test SHA-256 `c4c94c0bbe2df5882070fd9fe6b14bc7f2f5ffe224a9ecf781c22380bfea0eb2`. Successivamente il root ha richiesto un nuovo gate congelato conclusivo per la fonte post fix: **PASS `{passed:2267,failed:0,exit:0}`**, [log separato](gate-prepare-fix-frozen.log), Node 26.5.1 / npm 11.17.0. Comprende 2.266 test e il [kill-test replay nativo 1/1](gate-prepare-fix-replay.log). Non è una seconda full a un worker; lo script originale conserva il suo runner. [Profilo finale](profile-final-gate.json): zero differenze rispetto ai 517 hash post fix, gate invariato.

La review autonoma del lato Web/Core ha trovato due P2 separati: pin query duplicati accettati via `join` e proposta ciclica che generava TypeError. L'autore Web li ha corretti; gli stessi probe sono stati rieseguiti dall'autore Studio e ora rifiutano/ignorano senza eccezione. [Report e limiti della review](bridge-web-core-review.json), [recheck](bridge-web-core-recheck.log). Non è una review indipendente del nostro codice Studio.

## Addendum — MathLive, font locali e caricamento su richiesta

La base #298 e la fonte prima di questo delta contenevano **lo stesso identico `MathComposer.tsx`**, che forzava `https://unpkg.com/mathlive/fonts` pur avendo MathLive 0.110.0 nel lock. I relativi SHA sono nel [profilo font](profile-mathlive-fonts.json): è un difetto di portabilità preesistente in entrambi gli stati, non una regressione del nuovo chrome. Il claim precedente sui font locali riguardava Excalidraw; non garantiva MathLive né il percorso formula→immagine.

`MathfieldElement.fontsDirectory` usa ora `${BASE_URL}mathlive-fonts` prima del costruttore. Un plugin Vite con inventario finito serve in dev ed emette in build **20 WOFF2, 259.792 byte**, da MathLive bloccata nel package; nessun URL runtime dal network, query o filesystem del chiamante. Dev supporta GET/HEAD sotto `/` e `/studio/`, con MIME corretto; gli altri file non appartengono alla mappa. La distribuzione include `LICENSE-MATHLIVE.txt` e `LICENSE-KATEX.txt`. Il package e il tree ufficiale non contengono un diverso COPYING per i font; tutti i 20 file sono byte identici ai corrispondenti di KaTeX 0.16.47 già installata, con notice MIT preservato. Hash per font e licenze nel profilo. Nessun font binario viene vendorizzato nel repo.

Il root ha inoltre autorizzato l'aggiornamento della sola dipendenza esistente MathLive a **0.111.1 esatta**, dopo la lettura il 24 ottobre 2026 del [changelog ufficiale](https://github.com/arnog/mathlive/blob/master/CHANGELOG.md). L'advisory descrive la costruzione non sicura di attributi SVG dall'opzione `shadow` di `enclose`, anche nell'editor. Il [RED su 0.110.0](mathlive-shadow-red.log) passa un input ostile al renderer SSR reale, inserisce il risultato in un template DOM inerte e rileva un attributo `onload`; **nessun handler è stato eseguito**, nessun URL è stato aperto. Lo stesso test su 0.111.1 non produce attributi evento. Non è una certificazione generale della dipendenza.

[Installazione](mathlive-upgrade.log): `npm install --ignore-scripts --save-exact mathlive@0.111.1`, senza altro aggiornamento diretto. Il lock rimuove tre dipendenze ora non più usate da MathLive (`@cortex-js/compute-engine`, `@arnog/colors`, `complex-esm`); `decimal.js` resta solo dev per jsdom. L'output audit npm preesistente è conservato; nessun audit-fix generale eseguito. Le API usate da Studio sono `value`, `focus`, `remove` e policy tastiera: nessuna API `expression`/MathJSON rimossa.

`Room` importa ora il composer con React `lazy`/`Suspense`, solo quando il docente apre “formula”, con stato accessibile “Apro l’editor delle formule…”. Il [RED font/lazy](mathlive-fonts-lazy-red.log) osservava il CDN anziché il percorso locale e il modulo importato prima del gesto; il test asset iniziale falliva perché il plugin mancava. [GREEN](mathlive-fonts-lazy-green.log): **6 file, 115/115 PASS**, typecheck Node **22.14.0** PASS. Comprende vero build Vite minimale con byte emessi, server HTTP Vite nativo nelle due basi, inizializzazione locale, apertura esplicita del composer, comportamento esistente e input ostile SSR. Nessun ritardo artificiale nel prodotto.

Il delta del bundle e la rete browser a cache fredda sono misurati dal root sul nuovo artifact da commit; non sono dedotti dal numero dei font o dal cambio di import. Nessun build concorrente prodotto da questo agente. Il caricamento **MathJax CDN** di `latexToImage.ts` resta il percorso separato esistente, come richiesto da `apps/studio/AGENTS.md`; la località dei font MathLive/Excalidraw non equivale a completa autonomia offline della conversione formula→immagine.

Gate congelato conclusivo post font: **2.274 PASS / 0 FAIL**, Node 26.5.1 / npm 11.17.0, comprende 2.273 test e il [kill-test replay nativo 1/1](gate-mathlive-fonts-replay.log). I 521 hash del profilo font sono rimasti identici durante il gate; script gate invariato. Il root gestisce commit prodotto e unico build artifact finale, poi rete/font/formula e performance browser.
