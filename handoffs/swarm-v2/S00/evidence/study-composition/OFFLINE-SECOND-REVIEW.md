# Review indipendente della correzione offline — 26 ottobre 2026

Scope: sola lettura del delta storage rispetto a PR309 `350d65a4c795c324cb836808abd9d2e2b39869ad`, nella composizione S00 su main317. Nessun edit di sorgenti o commit. Nessuna suite/build/browser eseguita da questo revisore; controprova pura Node26 e renderer React server dell'installazione locale.

## P2 residuo — chiavi ereditate raggiungono il rendering

`storage.ts:24–25` accetta una fase qualunque purché inclusa nell'array di stringhe `phases`; `storage.ts:18,33–35` accetta nomi arbitrari dei parametri e dei controlli. In `IndependentStudy.tsx:98,104` le lookup `labels[phase]` sono su un normale oggetto; in `IndependentStudy.tsx:112` e nel componente Parameters a fondo file lo stesso avviene per `modelLabels[k]`.

Controprove con `readOffline` reale, stato valido minimale salvo il dato indicato e successivo `renderToStaticMarkup(createElement('p', null, valoreDellaLookup))`:

1. `phase='__proto__', phases=['__proto__']`: accepted=true; React lancia Objects are not valid as a React child.
2. `task.parameters=JSON.parse('{"__proto__":1}')`: accepted=true; `modelLabels['__proto__']` è Object.prototype; stesso errore.
3. `simulation.controls=JSON.parse('{"__proto__":[1]}')` con parameters corrispondenti: accepted=true; stesso errore.

Non è un'affermazione di prototype pollution, esecuzione codice o fuga dati: è un crash deterministico di rendering da copia malformata. Soluzione suggerita: lookup own-property oppure tabelle a prototipo nullo; validazione del vocabolario delle fasi. Una blacklist solo di __proto__ sarebbe incompleta per altre proprietà ereditate. Conservare un test di rendering o una controprova delle lookup, non soltanto uno snapshot del validatore.

## Verifiche senza finding materiale

La proiezione rimuove il risultato modello sia nelle cache nuove sia in quelle precedenti, senza mutare l'oggetto originale; conserva parametri e controlli. L'omissione è dichiarata e il parent ha un avviso dedicato. Non richiede parser/solver duplicati per i cinque renderer. Ho confrontato il formato con `_view` e `preview` Core: gli optional usati sono assenti anziché null e i campi obbligatori verificati esistono nello stato canonico.

`clearActorOffline` riconosce la proprietà dall'identità nella chiave JSON, rimuove tutte le edizioni del solo attore, raccoglie prima le chiavi per non saltarle durante l'iterazione, preserva peer e chiavi non attribuibili. Non ho dimostrato una regressione di isolamento o compatibilità in questo delta. `git diff --check` passa. I20test GREEN dichiarati dall'autore sono stati letti nel diff, non rieseguiti da questo revisore; la suite completa/typecheck/browser restano a S00.

## Impronte dei file al momento della review

- `apps/web/src/features/independent-study/storage.ts` SHA256 `7e017d3a80bee10e74b62ba567c79253b7f228a829c354c75984c5995a408ac7`
- `apps/web/src/features/independent-study/storage.test.ts` SHA256 `2521349115950243c1989d9a51826f78964edc21b47cdef4d77ac33cc93448ab`


## Verifica successiva della correzione P2 — 26 ottobre 2026

Riletto il delta S00: `modelLabels` e `phaseLabels` ora sono dizionari a prototipo nullo; `phaseLabels` è l'unico vocabolario condiviso tra reader offline e renderer. `Object.hasOwn` verifica la fase corrente e tutti i passi, senza blacklist di singole chiavi. I test aggiunti controllano tre cache con fasi/passaggi non ammessi e due render reali di task/simulation con chiavi ereditate. Letto il log RED S00:5FAIL/27PASS e2erroriReact. Non rieseguita la suite dal revisore.

Controprova pura successiva su Node26.5.1, source corrente con `stripTypeScriptTypes` nativo (solo rimozione dei tipi; import relativo risolto verso il file reale modelLabels.ts), ReactDOMServer locale:

- Prototipo di modelLabels e phaseLabels: null.
- Fasi `__proto__`, `constructor`, `toString`, `hasOwnProperty`: readOffline restituisce null.
- Le stesse chiavi in lookup parametri rendono testo semplice con il fallback, senza oggetti ereditati.
- Task e simulation con parametro/control `__proto__`: cache ancora leggibile, valore testuale `<p>__proto__</p>` reso senza errore; non sono attribuite semantiche fisiche a quelle chiavi.
- Exit0 della controprova. Il warning sperimentale di stripTypeScriptTypes è conservato; una prima invocazione del solo harness aveva fallito per package esbuild non installato, prima di eseguire il prodotto. Non è stata aggiunta alcuna dipendenza o modificato un sorgente per eseguire la controprova.

Il finding P2 originale è affrontato dal delta osservato. Non ho dimostrato altri problemi materiali nella correzione offline. Questa rilettura non certifica fullWeb, build, browser, CI o stato terminale della PR; i521test precedenti rimangono associati ai byte precedenti. Nessuna modifica ai sorgenti/commit da questo revisore.

Impronte successive:

- `apps/web/src/features/independent-study/modelLabels.ts` SHA256 `0114f0488e479a319030339e452aa4faab7d9ef7d3eabde1df06317006c98a9c`
- `apps/web/src/features/independent-study/storage.ts` SHA256 `0809872c8c8763e7a46bac47e4c962194c70d266326daffe01e039934fe3f73d`
- `apps/web/src/features/independent-study/storage.test.ts` SHA256 `2521349115950243c1989d9a51826f78964edc21b47cdef4d77ac33cc93448ab`
- `apps/web/src/features/independent-study/IndependentStudy.tsx` SHA256 `57148dc03747480a99860b438c182a624c7b61f0408e77dd48ec4fbe442c7513`
- `apps/web/src/features/independent-study/IndependentStudy.test.tsx` SHA256 `e264cb84548004fe83f8e8841ab634d75675952381650a9d119dae390161ce0a`
