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
| `plugin-postit-room-reload` | **RESPINTA** (giro 8) | verde, e discriminante: l'identita' di istanza tolta dagli id del DOM la fa rossa mentre i sette gia' dentro e i tre advisory restano verdi. Ma la STESSA mutazione fa rossa anche la suite unitaria (`+4 file, +10 test` sopra il rosso preesistente), e `studio (typecheck + test + build)` e' gia' un check **REQUIRED**. Vedi §«Una spec respinta perche' un cancello che c'e' gia' la copre» |

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

## Una spec RESPINTA perche' un cancello che c'e' gia' la copre

- **`plugin-postit-room-reload`** (2026-08-22). Il criterio d'ingresso non era
  ancora scritto per intero: «cosa si rompe se il prodotto peggiora» va letto
  **al netto di cio' che gia' e' obbligatorio**. Un journey la cui potenza
  discriminante e' contenuta in `studio (typecheck + test + build)` — required
  su `main` — aggiunge tempo di CI e nessuna protezione.

  Tre mutazioni, tutte sul PRODOTTO, tutte con ripristino e sigillo di digest:

  | mutazione | la candidata | la suite unitaria (rosso di partenza: **5 file / 22 test**) |
  |---|---|---|
  | **A** l'identita' di istanza sparisce dagli id del DOM (`prefix = 'plugin-postit'`) | **rossa** | **9 file / 32 test** -> `+4 / +10`: la vede |
  | **B** i tre post-it collassati in `x:0, y:0` nella scena | **rossa** | **6 file / 23 test** -> `+1 / +1`: la vede |
  | **C** il post-it disegnato al **40%** del suo riquadro (solo CSS) | **VERDE** | **5 file / 22 test** -> **identico al partenza: NON la vede** |

  Sotto A i sette journey ammessi escono `7 passed` e `golden-path`,
  `cruscotto`, `cruscotto-graph` escono `3 passed`: la candidata **e'**
  discriminante rispetto al cancello. Non lo e' rispetto al **required**.

  ⚠️ **La mutazione C non la vede nessuno.** Un post-it disegnato al 40% del suo
  riquadro passa la suite unitaria (jsdom non ha geometria) **e** passa la
  candidata, che asserisce `width > 120` su riquadri molto piu' grandi di 300px.
  E' un buco aperto, e non lo chiude questo giro.

## ⚠️ Il check REQUIRED e' ROSSO sull'albero consegnato

Misurato per **esecuzione**, non per inferenza, sul tip di
`fix/246-durabilita-eventi`: `npx vitest run` esce **1**, `5 file / 22 test`
rossi, e i file hanno un nome:

```
src/__tests__/ContinuityRuntimePath.test.tsx
src/__tests__/SavedLessonsView.test.tsx
src/__tests__/StudentPackArtifact.test.tsx
src/__tests__/TeacherDashboardStatsZone.test.tsx
src/__tests__/TeacherDashboardZ7View.test.tsx
```

`studio (typecheck + test + build)` e' uno dei tre check **required** su `main`.
Sette giri hanno promosso journey su questo ramo e **nessuno** ha detto che il
check che conta davvero e' rosso. Non e' una scoperta del cancello e2e: e' cio'
che il cancello e2e nascondeva, misurando solo la propria corsia.
