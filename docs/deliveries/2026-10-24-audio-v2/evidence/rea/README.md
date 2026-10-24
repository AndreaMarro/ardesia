# REA E3 — dal recorder isolato al passaggio raggiungibile

24 ottobre 2026. Esperimento circoscritto alla Room/replay locale di Ardesia, con dati sintetici. REA 6.7.0 è eseguito tramite CLI già presente nella cache, fuori dalle dipendenze del prodotto. Doctor read-only conferma la registrazione Codex ma nessun tool REA è esposto in questa sessione; non sono state modificate configurazioni o installati motori nativi.

## Catena osservazione → implementazione → verifica

1. **Target precedente:** Room della base `ae25b93bec826539940e0226da1f0cd8cebff0b1`, servita da Vite prima degli edit applicativi. REA apre il percorso docente e attende la navigazione ordinaria. Evidence `ev_f046b7f17a4ce36ff2a81f96556ea5ae252f970665c8aa1322911c5648735c95`: la Room osservata non espone un comando di cattura. Il provider non identifica l'artefatto; l'attribuzione alla base deriva separatamente dall'ordine del lavoro e dal sorgente Git, non da un digest inventato nella Evidence.
2. **Controprova diretta:** AST TypeScript dello stesso `Room.tsx` fissato alla base: zero costruzioni di recorder audio, harness `audioRecorder: null`. Il metodo legge sorgente completo disponibile; non è una seconda cattura runtime. Output e digest in `direct-comparator.json`.
3. **Specifica:** [piano esecutivo](../../implementation-plan.md), contratti canonici e addendum AUDIO-V2. Un gesto esplicito controlla il microfono della sessione; stop include tail e persistenza prima del cambio superficie; oggetto/versione e media sono riferimenti distinti; più take non vengono concatenati; import/revoca devono convergere senza ripristinare consenso.
4. **Implementazione nuova:** SessionAudioRecorder, eventi v2 rigorosi, consumer Room/Replay, bundle reader2, annotazione e riferimento portabile verso la fonte CoursePack/Core. Il codice non è generato da una copia del bundle e non ricostruisce l'intero LessonOS; completa un consumer assente riusando i primitivi. La review ha riprodotto race e payload ostili, poi gli autori li hanno corretti.
5. **Verifica runtime successiva:** REA usa lo stato locale sintetico ottenuto dal percorso UI reale (due take A e una Room B). Evidence `ev_8b29dc69bad06ab658e85fc6b467091cdd7f6f4322b45cdbf7fc16048e43f39c`: cinque azioni dichiarate a 390 px, movimento ridotto, ultimo istante via End, inquadratura e avvio del take nativo. Il browser posseduto dal provider è terminato correttamente; capture dichiarata completa nel proprio scope.
6. **Oracolo indipendente:** `python3 verify_rea.py` legge le Evidence originali, verifica i digest DOM e 18 asserzioni, tutte PASS. Le prove native/UI separate verificano decodifica, due take, export/import in profilo nuovo e revoca. Queste non sono ribattezzate “catture REA”.

## Costo complessivo e confronto

La domanda equivalente è se la Room ordinaria renda utilizzabile il recorder esistente. Entrambi i metodi rispondono negativamente sulla base, con classi di evidenza differenti. Il nuovo consumer e le sue verifiche sono lavoro comune ai due percorsi; non esiste una seconda implementazione indipendente temporizzata.

| Voce | REA | Metodo diretto |
| --- | --- | --- |
| Preparazione | Doctor CLI circa 2,32 s; costruzione scenario e lettura documentazione non temporizzate integralmente | Preparazione query AST e lettura sorgenti non temporizzate integralmente |
| Esecuzione diagnostica | Baseline 17.151 ms, replay successivo 34.012 ms secondo provider | 1.197,48 ms, include caricamento TypeScript e lettura Git |
| Analisi, specifica, implementazione, debug e review | Eseguiti, tempo e token attribuibili non misurati integralmente | Lavoro condiviso; costo controfattuale UNKNOWN |
| Costo totale per lo stesso incremento | **UNKNOWN** | **UNKNOWN** |
| Risparmio o rapporto di produttività | **NON DIMOSTRATO** | Nessuna accelerazione dedotta dal solo parsing |

REA aggiunge una prova esterna del gesto e dello stato raggiunto. Con sorgente completo disponibile, la lettura diretta era sufficiente per individuare il consumer mancante; non raccomandiamo REA come requisito del prodotto. La convenienza economica resta un gate aperto, non un PASS derivato dai millisecondi sopra.

## Riproduzione e limiti

`baseline-scenario.json` e `replay-scenario.json` sono input CLI, con soli dati locali sintetici. Eseguire con REA 6.7.0 e un Chromium compatibile, selezionando un nuovo output e un server Studio locale. Il secondo scenario conserva literal localStorage sintetico (inclusi audio di un oscillatore) per rendere i riferimenti riproducibili. Nessun cookie Study o dato studente reale è presente.

`verify_rea.py` verifica offline le acquisizioni; non esegue nuovamente il target. La baseline non può essere ricreata sul nuovo sorgente senza usare il commit fissato. L'osservazione non dimostra FSA, microfono fisico, remoto, autenticazione dello studente, tutti i browser, comprensione semantica o efficacia didattica. La cancellazione delle copie esportate fuori dal controllo dell'app rimane impossibile da questa UI.
