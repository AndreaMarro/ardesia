# Catalogo Fisica: cronologia delle viste e delle edizioni

La CI della head `b8b1894507861a98bca684749db5a60b9dbae984`, run
[40414879451](https://github.com/AndreaMarro/ardesia/actions/runs/40414879451),
ha superato i 26 controlli del golden unico, la geometria PDF e le cinque suite
concatenate, ma il job Web è fallito nel successivo test del catalogo Fisica.
Il checkout della merge ref era `c80f33c1fd23c3ca5ade0de5ca0defc6d807b5ed`.
Studio, Core/API, Engine, MCP, igiene, contratto PR e S19 risultavano verdi;
questo non rendeva verde l'intera candidata.

Il RED è stato riprodotto con il runner canonico, API reale, cookie sintetico e
SQLite temporaneo. L'aspettativa storica dopo unità → Oggi → Indietro richiedeva
il percorso padre: codificava la perdita della posizione causata dal precedente
`replaceState` della Shell. S20 ha già corretto la Shell con `pushState`; il
browser ripristina correttamente l'unità esatta. Il test ora confronta l'intero
URL e verifica anche Avanti e il ritorno all'unità.

Questa verifica più precisa ha trovato un secondo RED effettivo: cambiare
edizione sostituiva ancora la voce corrente della cronologia. Indietro perdeva
l'unità precedente. Il solo cambio esplicito di edizione ora aggiunge una voce;
la selezione della stessa edizione, discovery, riconciliazione popstate e revoca
mantengono `replaceState`. ACL, scelta autorizzata, abort e cache restano quelli
del medesimo hook.

Controprova: **1 test browser PASS in 12,5 s** con viste, catalogo/versione/hash,
unità, cambio edizione, Indietro/Avanti, reload, tastiera, moto ridotto e tre
larghezze originali 390/820/1440. Il ritorno all'unità è distinto dal successivo
ritorno al percorso padre. Aggiunta anche l'asserzione sugli errori console/JS
già raccolti. **22 test unitari PASS**, typecheck PASS. Nessun timeout, skip,
soglia o risultato scientifico modificato.

I due RED locali e il RED remoto sono conservati integralmente, compressi senza
perdita; il nome iniziale del secondo log era `green`, ma il manifest e questa
consegna lo classificano come RED. Digest raw e gzip nel manifest. Tre screenshot
provengono dal browser del GREEN. Nessun token, database, trace con sessione o
materiale privato incluso. Queste prove richiedono ancora nuova CI, merge
ordinario e CI post-merge della nuova head: non attestano un deployment.
