# Continuità: archivio degradato e sessioni — issue #261

Stato: LOCAL_GREEN_REVIEWED_TARGET_INCOMPLETE. Base del lavoro `9800fe66e477060ca033b81785b632f4dfbebd41` (fix #260 locale), branch `codex/continuity-open-260-20261015`. Questo receipt precede il commit che lo contiene; le prove sono sul working tree identificato dagli hash sotto, non su main.

## Requisito e scelta minima

Il descrittore reale `corrupt` o `data-loss` non può diventare «nessuna sessione» o un elenco ordinario che nasconde il guasto. La superficie mantiene ora `storage-degraded` con backend/causa e discovery correlata nei tipi:

- `corrupt` → `blocked`, prima di enumerare: il loader esistente non legge fatti da una sequenza corrotta e il projector azzera i contenuti corrupt;
- `data-loss` → `partial` con candidati indirizzabili, anche se zero; il risultato non è un elenco completo;
- `data-loss` con lettura fallita → `unreadable`, conservando separatamente descrittore e causa della lettura.

Le chiavi sono validate con `validateContinuityScopeV1`, senza materializzare tutti gli eventi. Uno scope valido rende la voce indirizzabile; non certifica i byte. I link «Controlla sessione» passano ancora dal loader reale. Gli stati normali, il rifiuto dell'apertura #260 e la chiusura finally best-effort restano invariati.

La vista distingue «Archivio incompleto» da «Archivio danneggiato», mantiene la navigazione ed espone motivi umani distinti per formato precedente, righe malformate, coda scartata e sequenza non contigua; il codice sconosciuto ha un fallback esplicito. Descrittore/codice originali restano ispezionabili. Non viene mostrato un badge Verified per l'elenco.

## Controesempi e verifiche

- RED valido iniziale: 5 fallimenti e 1 controllo sano PASS su storage reale fake-indexeddb. RED unit/UI combinato 9 FAIL/8 PASS; control con i due source della base ripristinati temporaneamente: stesso risultato.
- Finding P2 del reviewer: le cause data-loss erano distinte solo in un attributo macchina e il testo visibile era identico. RED mirato 3 FAIL; messaggi visibili distinti aggiunti, mantenendo la causa reale.
- GREEN finale mirato: 41 test in quattro file. Il nuovo test d'integrazione dimostra che un evento canonico identico attraversa opener→loader→projector con SHA coerente, issue data-loss e phase degraded, senza digest-mismatch. Per corrupt il loader conserva zero fatti e phase corrupt. Righe fisiche prima/dopo identiche.
- Typecheck finale stabile e build separati: exit0. Suite completa profilo CI: 2454 PASS, 5 SKIP storici, 0 FAIL, success=true.
- Chromium: 16 PASS selezionati, cioè10 nuovi casi (cinque per desktop/mobile),2 casi di apertura #260 e4 percorsi CircuitCheck originali. IndexedDB nativo con righe fisiche sintetiche, cold reload esplicito, candidati indirizzabili anche con byte malformati, esclusione chiavi numeriche/UUID invalidi, assenza di false liste vuote, Tab reale, nessun overflow/pageerror e righe fisiche invariate dopo elenco/riapertura. Lo stato finale del candidato malformato resta degraded/corrupt, mai ready.
- Control browser corretto su source9800: 4 FAIL per malformed-unindexed/corrupt-sequence su due viewport. DOM ispezionato: falsa «Nessuna sessione da riprendere» con riga malformata; normale «Riprendi una sessione» con log corrotto. Tracce conservate prima del GREEN.
- Gate congelato immutato: `NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh` → `{"passed":2455,"failed":0,"exit":0}`. Sono2454unit+1replay reale; nessun SKIP_REPLAY, nuovo skip, expected storico o soglia cambiati. L'adattamento Node26/JSDOM è quello diagnosticato nel receipt #260, non una modifica al gate.

Fallimenti del setup preservati e distinti dalle prove prodotto: primo path di creazione test duplicato; fixture it.each iniziale errata; opzioni exact di Playwright usate con Testing Library e rifiutate dal typecheck; helper di test inserito nel return sbagliato, rifiutato da test/typecheck; navigazione con solo hash che poteva lasciare la pagina su no-lesson. Quest'ultimo setup ha prodotto falsi RED e un run9FAIL/7PASS, NON usati come prova del bug. Il test corretto esegue reload esplicito prima della controprova valida. Nessun full gate è stato eseguito durante uno swap di source in questa unità.

## Pin delle misure e review

I cinque file sotto sono relativi alla root del repository:

```text
e7d8e1b144e2257704f6a5bc3cc4004526c2b9531cce58d83f5593e0f9ee5e4e  apps/studio/src/lessonos/continuitySurface.ts
8ef6a02583119cf3bdda8300490b430350bbf4095fa119cb11837425bf4062ca  apps/studio/src/design/ContinuityView.tsx
1cab642f93e1be452b756d9dedabfc21d2281427e6ea6fdcb34a18432cf4f5cb  apps/studio/src/__tests__/ContinuityView.test.tsx
0b0e2857608016c5d6a37fbd533a34fc4c8866b967b6bc991f5e27c59a9aa7e7  apps/studio/src/__tests__/ContinuityDegradedStorage.test.ts
77cf0f3d44f40093cdee9a5346a18ed79d5bbce06529bbbff2dc41b001cea222  apps/studio/e2e/continuity-degraded-storage.spec.ts
```

Log integrali nel workspace privato del run: ardesia261-red.log, ardesia261-control-red.log, ardesia261-reason-red.log, ardesia261-green-targeted-v4.log, ardesia261-typecheck-v4.log, ardesia261-build.log, ardesia261-studio-final-results.json, ardesia261-browser-control-red-valid.log, ardesia261-browser-green-v2-live.log, ardesia261-frozen-gate.log e ardesia261-frozen-replay.log. Le prove browser e i log non sono presunte esecuzioni GitHub.

Review tecnica Codex in contesto separato: APPROVE sui cinque hash verificati anche nell'index. Identificatore esatto del modello non esposto. P0/P1 nessuno; P2 originario e P2 della causa visibile FIXED, lacuna di prova del recupero canonico CLOSED. Il reviewer ha eseguito propri probe real-IDB/loader/tipi/close e16 osservazioni Chromium, separati dai log del writer: errore reale openKeyCursor, scope/altra lezione, cause distinte, dati invariati, mixed con SHA reale della build→degraded senza digest-mismatch, malformed-addressable→corrupt senza Verified. Nessun nuovo finding bloccante residuo nel delta. Il pin del commit con receipt/ledger resta da verificare dopo la sua creazione. Questa review non è un quorum non-Codex, un'approvazione GitHub o una verifica degli effetti della pubblicazione.

## Limiti e prossima azione

Non sono provati recupero completo dell'archivio, accettazione umana, tutti i browser o tutte le modalità di corruzione. Restano il P3 del factory iniettato che rigetta un oggetto non stringificabile (#260), cronologia/date delle sessioni del vecchio stack255 e le21famiglie incomplete. Questi dati sintetici non sono nuovi holdout né un corpus di studenti.

Nessun push, merge, deploy o chiusura di #261. La pubblicazione Ardesia attende accesso in sola lettura alla configurazione corrente degli effetti automatici Vercel (MCP403 e CLI esplicita access denied); il futuro merge richiede inoltre CI sul commit effettivo e approvazione GitHub distinta. Verificare main prima di chiudere le issue o dichiarare assorbite le PR.
