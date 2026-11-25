# Audit indipendente AI — identità delle opzioni di risposta

Letta la patch effettiva di `server/domain/assessment.py`, il file completo, i test d'autore e i consumer `server/learning.py`, `server/application/study.py` e le route in `server/web.py`. **Nessun finding residuo concreto** entro il contratto di risposte a scelta con valore corretto appartenente alle opzioni. Il confronto esatto precede la normalizzazione; il fallback verso un'opzione normalizzata è ammesso solo se univoco. Le opzioni effettivamente selezionate M/m e V/v non sono più equiparate. I percorsi numerico e testo libero restano invariati.

Controprove dal vero codice precedente, oggetto Git `be7a766fa490a2e7363e2da88c3cd69293ccfd65`, SHA256 `71450cf3fd9fc7d34cbd4edfd5cfe45d356f1575927f02a6022337bc7659ce55`, letto separatamente senza modificare il runtime:

- AR-u2-inelastic-rest-09: chiave `m=MV/(v−V)`, distrattore `m=MV/(V−v)`. Il vecchio casefold rende identici i denominatori e accetta il distrattore; la nuova funzione lo valuta falso.
- AR-u2-recoil-03: chiave `U=mv/M`, distrattore `U=Mv/m`. Il vecchio confronto accetta entrambi; il nuovo mantiene l'identità e valuta falso il secondo.

Il ritorno immediato per un'opzione esatta è necessario: non si deve prima cambiare il caso e poi tentare di recuperare l'identità perduta. Se un input non esatto normalizza verso più opzioni, la patch non ne indovina una. Verificato indipendentemente anche un caso NFKC (`x²` contro `x2`), oltre al caso M/m: la selezione esatta corretta passa, quella esatta errata no e una versione normalizzata ambigua è respinta.

Compatibilità effettiva riscontrata su **241 edizioni choice originali** dei file content e **603 record choice dei batch registrati**, quindi844 record e **4042 selezioni** (1027 originali e3015 registrate); non tutti i960 quesiti sono choice. Per ognuno answer.value appartiene esattamente alle proprie opzioni e ogni opzione selezionata è corretta se e solo se identica a tale valore. Nessuna edizione reale riscontrata dipende da un valore corretto che esista soltanto dopo normalizzazione. Alias espliciti non ambigui, testo con accenti composti/decomposti e apostrofi, stringhe numeriche con virgola/segno Unicode continuano a funzionare; Infinity resta respinto. Un alias in conflitto con un'opzione non può ribaltare l'identità di una selezione effettiva. Choice legacy senza options conserva il vecchio fallback; i contratti attuali richiedono comunque opzioni valide.

Il consumer di pratica controlla già che il valore inviato appartenga alle opzioni esatte, poi usa `matches` sia per registrare la correttezza sia per mostrare il feedback. Il facade learning importa la stessa funzione. Non sono stati trovati un secondo algoritmo di grading nel client o un confronto casefold alternativo nei consumer esaminati. La normalizzazione in editor.js letta è per la famiglia/slug del record, non per valutare una risposta.

## Prova HTTP indipendente senza pubblicazione

Nuovo test `tests/corpus/test_choice_identity_review.py`, scritto dal revisore, crea un'installazione SQLite temporanea fuori dal repository, usa l'importatore canonico per i due pacchetti e mantiene tutti i candidati con `heads.live` nullo. Crea tramite il repository canonico di studio sessioni di prova private che puntano alle versioni draft. Questa preparazione tecnica permette di verificare il consumer delle versioni fissate senza pubblicare le bozze o modificare la selezione del catalogo studente.

Avviato un server reale soltanto su127.0.0.1 con porta effimera, ottenuta sessione owner locale mediante ticket temporaneo e inviate le dieci selezioni attraverso **POST /api/run/{id}**, la route usata dalla pratica. Le cinque opzioni di ciascun quesito sono state tutte inviate, in dieci sessioni indipendenti. Esiti HTTP: **2 corrette,8 errate**, corrispondenti esattamente alle chiavi. Nel DB risultano dieci attempts con somma correct=2. La lista completa delle heads pubblicate prima e dopo è identica; i due candidati restano non pubblicati. Server e DB di prova chiusi e rimossi; nessun Chrome dell'utente, servizio di produzione o DB esistente coinvolto.

Queste attempts sono soltanto dati di fixture tecnica. Non danno evidenza scientifica nuova per i contenuti, prestazioni osservate con studenti, mastery reale o approvazione umana.

## Esecuzioni e limiti

- Nuovo test indipendente: **3/3 PASS, exit0,1,065s**, inclusa la prova HTTP e la scansione delle opzioni.
- Test d'autore aggiornato: **5/5 PASS, exit0,0,019s**, rieseguito dal revisore.
- In una prima versione del mio test avevo assunto erroneamente che tutti i quesiti registrati fossero choice, imponendo un minimo di1200 record. La scansione reale è844 perché molti quesiti hanno risposte numeriche. Rimossa quella soglia priva di significato; resta l'obbligo di coprire i due ID della regressione e tutte le opzioni effettivamente presenti. Non era un fallimento del grading o del contenuto.

Non ho modificato `assessment.py`, test d'autore, candidati, registro o checkpoint. La patch di runtime cambia correttamente il fingerprint: le vecchie prove UI non diventano valide grazie a questa nota. La riesecuzione generale UI/import rimane lavoro dell'integratore e non è rivendicata qui. Giudizio tecnico AI, nessuna approvazione umana o pubblicazione.

SHA256 esatti dei file letti:

- assessment.py: `a3c488245e0f64d26150fbb389220ac2c09dd500643bc0a45066637ff0b5a9df`.
- Test d'autore test_case_sensitive_choice.py: `76dde9c2c8e07944fd485918dc876c6964248f33a3253315814e3f7ab39ed870`.
- Nuovo test indipendente test_choice_identity_review.py: `7503fe500cf884647d9ee5372cb405f975770612e33f8993eda76f3901c268ca`.
- server/application/study.py: `a3f5cd40dc5bb959f5138c32edcdcf09de290e7a43e5230815ae48a24466dc23`.
- server/learning.py: `518a5ccb6e0e250afa354eec51f21a2036e944129eaca18bcf861fcde029f596`.
- server/web.py: `4fa905a4cdc02e6b9866fe2cb658a9f19225a17956187d35ca5ea98053d1d903`.
