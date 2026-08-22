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
| `sim-esp2-senza-resistore` | **ammessa** (giro 5) | la zona di stress LED allargata la fa rossa con la bugia verbatim nel DOM (`data-led-on="1" data-led-burned="0"` su «acceso»), mentre gli altri cinque restano verdi |
| `ripasso-live` | **ammessa** (giro 6) | `graph.query` negata al pannello ripasso la fa rossa con `data-zripasso-aperti="0"` mentre gli altri cinque, `golden-path`, `cruscotto` e `cruscotto-graph` restano verdi; e' il lato consumatore della memoria che #246 difende dal lato produttore |
| `studentpack-artifact` | **ammessa** (giro 7) | `evidence: []` nel builder del pack lo fa rosso mentre i sei gia' dentro, `golden-path` e `cruscotto` restano verdi; unico journey che segue il FILE fuori dall'app e lo riporta dentro |
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

## Bersagli sbagliati, e perche' vanno scritti

- **`plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js` NON e' il
  motore dello Studio.** `apps/studio/sim/solver/elabSolver.ts` importa
  `./engine/CircuitSolver.js`: una copia **vendored dentro `apps/studio`**.
  Misurato il 2026-08-22 alzando `LED_BURN_CURRENT` nel sorgente del plugin:
  tre exit 0, candidata compresa. Chi muta il sorgente del plugin credendo di
  toccare il motore dello Studio sta misurando un altro programma.

## Una spec RESPINTA per una ragione nuova: il verdetto non dipende dal repository

- **`sim-duplicate-instance`** e' **deterministicamente ROSSA** oggi — 3 corse
  isolate su 3, e 1 fallita anche dentro la corsa intera con `--workers=3`,
  cioe' il comando esatto che il giro 2 dichiaro' verde («40 passed»).
  Misurato che fra quell'albero (`3ee18131`) e oggi sono cambiati **sei file**:
  `ci.yml` e cinque markdown di `_bmad-output/`. `git diff --stat` su
  `apps/studio/src`, `apps/studio/sim`, `apps/studio/e2e` e `plugins` stampa
  **niente**: **zero righe di prodotto**.
  Il verdetto e' cambiato senza che il prodotto cambiasse, e la causa **non e'
  stabilita**. L'ipotesi piu' ovvia — la clipboard di sistema, visto che la
  spec usa `ControlOrMeta+c/v` — e' stata **falsificata**: dopo la corsa la
  clipboard contiene ancora intatto un marcatore scritto prima.
  Una spec il cui verdetto non e' funzione del repository non entra in un job
  che blocca, e finche' la causa non ha un nome non entra nemmeno in advisory
  con la pretesa di significare qualcosa.
