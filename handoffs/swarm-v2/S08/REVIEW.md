# Review tecnica S08

Review di un secondo agente, in contesto separato, prima del commit; non è una review scientifica umana o una firma di approvazione. Ha letto dominio, UI, test e confini esistenti; ha eseguito soltanto una riproduzione leggera del target replay. Nessuna modifica del reviewer.

1. P2: il cambio del solo `at` conservava object/version del descrittore, che può riferirsi a un oggetto nato successivamente al cue. Riprodotto con oggetto apparso a1200, registrazione1000–1500, originale a1500 valido e cue a1000 rifiutato dal player canonico. Correzione: comando principale conserva l’URL canonico completo; i cue a un altro istante selezionano registrazione/session/hash ma non dichiarano una versione dell’oggetto non verificata in quell’istante. Il player non è stato indebolito. Regressione model.test attraversa `resolveReplayTarget` reale.
2. P2: pending veniva fissato prima dei GET di preflight, congelando la bozza quando un allegato era già ritirato. Correzione: errori precedenti all’invio del comando liberano la bozza; gli invii con esito incerto conservano payload e chiave. Regressione UI elimina il collegamento ritirato conservando il testo e salva con successo.

RED esatto: due test falliti con errore di versione oggetto e controllo `:disabled` sulla bozza; 7 altri test esclusi intenzionalmente. Il primo tentativo del test replay importava dinamicamente Studio dentro il timeout5s e non era una prova discriminante: sostituito da import statico, poi osservato il fallimento effettivo. Il vecchio controllo `.disabled` non osservava l’ereditarietà del fieldset: corretto a `matches(':disabled')`, conservando il requisito.

I risultati GREEN e la prova browser finale sono riportati nel rapporto. Nessun secondo round di review dichiarato; la correzione si verifica con le regressioni e i gate.

La prova che importa il resolver canonico è infine nel workspace Studio. La prima collocazione Web introduceva una dipendenza transitiva Studio-only nel typecheck pulito CI; corretto dopo riproduzione npm ci. Nel Web rimane la controprova sul contratto URL; Studio esegue il resolver reale e verifica sia il rifiuto del target invalido sia il nuovo target valido. Vedere VALIDATION.md.

## Addendum 26 ottobre — review acquisizione sottotitoli

Reviewer read-only distinto ha letto adapter, UI/test e donor reale. Ha riprodotto P2: tokenizerVTT consumava «<» letterale inSRT, alterando «Δp < 10kPa». Quattro testRED conservano la confutazione. Guardia aggiunta per consumare solo markup caption noto e preservare altri simboli/tag come testo; anche WebVTT protetto. Dopo fix:29namespacePASS; reviewer esegue10import/export/reimport per operatori, tag, formattazione ed entità, senzaVTTCuenativo, e verifica29file contro manifest/tarball. Nessun altro finding azionabile nella controprova. Non ha eseguito browser/build/fullsuite, non è approvazione umana.

Parent ha poi eseguito la prova browser Chromium148 sul consumer reale con CoreSQLite/sessioni/risorse/revisioni:7gruppi di controlliPASS, esatta fonte48251a32. Il primo FAIL del runner era il selettore getByLabel exact sul testo completo del label che includeva il contenuto textarea; DOM e accessibilitysnapshot confermano il controllo presente. Corretto solo harness a getByRole textbox. Nessun cambio prodotto per fare passare questo test.404dopo ritiro atteso; zero pageerror o consoleerror inattesi. [Prove](captions-validation.json).
