# Journey ammessi al cancello, e quelli respinti

Il registro di chi e' entrato in `e2e-journey` di `.github/workflows/ci.yml`, con
la misura che gliel'ha fatto guadagnare. Una riga per giro: il `git log` del
workflow e questa tabella devono raccontare la stessa storia.

| spec | esito | ragione |
|---|---|---|
| `elab-lab-marcatura-durabile` | **ammessa** (giro 1) | oracolo scritto per #246, visto rosso prima del rimedio |
| `product-flow-shell` | **ammessa** (giro 2) | una quarta voce di nav la fa rossa mentre golden-path e #246 restano verdi |
| `lessonos-eventlog-multitab` | **ammessa** (giro 3) | `recovered: 0` la fa rossa mentre gli altri tre restano verdi; e quella mutazione rende irraggiungibile l'avviso di perdita memoria |
| `saved-lessons` | **ammessa** (giro 4) | l'avviso «il bundle non contiene memoria LessonOS» reso muto la fa rossa mentre gli altri quattro restano verdi; unico journey che asserisce zero richieste non locali |
| `toolhost-srcdoc-bypass` | **RESPINTA**, poi in **advisory** (giro 3) | verde, ma asserisce che il bypass di sandbox **esiste ancora**: diventerebbe rossa quando ADR-0001 chiude il buco. Un cancello che difende la vulnerabilità |

## Perche' una respinta sta qui accanto alle ammesse

Perche' il criterio d'ingresso non e' «la spec e' verde»: e' **cosa si rompe se
il prodotto peggiora**. `toolhost-srcdoc-bypass` e' verde e resta fuori, e senza
questa riga il prossimo giro la troverebbe nell'elenco delle candidate e
rifarebbe il ragionamento da capo — o peggio, non lo rifarebbe.

## Sospetti verificati e caduti

Vanno scritti quanto le promozioni, se no il giro dopo li ricontrolla.

- `first-led-ipad-touch` ha un test non eseguito. **Non è uno skip silenzioso**: è
  `test.fixme` con un `KNOWN GAP` dichiarato in chiaro sopra di sé (righe 49-56) e
  un piano citato. Una regola già rispettata non è un difetto.
