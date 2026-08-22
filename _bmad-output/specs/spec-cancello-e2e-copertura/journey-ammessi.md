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
| `plugin-postit-room-reload` | **RESPINTA** (giro 8), poi **AMMESSA** (giro 9) | verde, e discriminante: l'identita' di istanza tolta dagli id del DOM la fa rossa mentre i sette gia' dentro e i tre advisory restano verdi. Ma la STESSA mutazione fa rossa anche la suite unitaria (`+4 file, +10 test` sopra il rosso preesistente), e `studio (typecheck + test + build)` e' gia' un check **REQUIRED**. Vedi §«Una spec respinta perche' un cancello che c'e' gia' la copre» |

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

## La stessa spec ENTRA al giro 9, e cio' che e' cambiato non e' l'opinione

Al giro 8 era respinta con la ragione giusta: le mutazioni che vedeva le vedeva
anche `studio (typecheck + test + build)`, che e' **required**. Al giro 9 entra
perche' vede una **terza** mutazione, e quella non la vede nessuno.

Non e' la spec ad avere cambiato verdetto: e' la spec ad essere **cambiata**.
L'asserzione nuova e' relativa al riquadro, e la vecchia resta accanto a
mostrare perche' non bastava.

| mutazione | candidata **rafforzata** | suite unitaria (required) | i sette | advisory |
|---|---|---|---|---|
| **A** identita' di istanza fuori dagli id del DOM | **rossa** (1) | **rossa** (1) — la vede | — | — |
| **C** post-it al **40%** del riquadro (solo CSS) | **rossa** (1) | **verde** (0) — **CIECA** | **verde** (0) | **verde** (0) |
| nessuna | verde (0) | verde (0) | verde (0) | verde (0) |

`fillRatioX` misurato **0.3978** contro la soglia `> 0.9`. Sull'albero pulito i
rapporti sono **0.99**, su riquadri **560x384** e **740x424**: al 40% il post-it
fa ~224px e la vecchia asserzione `width > 120` resta **verde**. Una soglia
assoluta su un riquadro variabile non misura il riempimento — ed e' esattamente
il buco che il giro 8 aveva trovato e lasciato aperto.

**La cecita' della suite unitaria non e' riparabile li'**: in jsdom
`getBoundingClientRect` restituisce zeri. Nessun test unitario puo' asserire una
geometria resa. E' la classe di difetto per cui un e2e esiste, ed e' la prima
volta che questo cancello ne ammette una per quella ragione.

⚠️ **Costo dichiarato:** la soglia 0.9 e' tarata su rapporti 0.99. Un cambio di
padding del contenitore la puo' far scendere: se un giorno diventa rossa senza
che il post-it si sia rimpicciolito, la causa e' quella, ed e' scritta anche in
`ci.yml`.

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

## ⚠️ Il check REQUIRED era rosso **solo qui**: era Node 26, non il prodotto

> **CORREZIONE del 2026-08-22, e vale piu' del testo che corregge.** Questa
> sezione diceva «Il check REQUIRED e' ROSSO sull'albero consegnato» e citava
> `main` come secondo referente. Era vero **su questa macchina** e falso come
> affermazione su CI: `ci.yml` installa `node-version: 22`, e sotto Node 22
> quei 22 test **passavano gia'** (`112 passed`, exit 0, misurato).
> Mancava un referente — la versione di Node — e senza quello «rosso su main»
> non significa niente. La causa e' in `apps/studio/vitest.config.ts` (commit
> `e33d51a3`): Node >= 24 definisce di suo un globale `localStorage` che
> restituisce `undefined` e **oscura quello di jsdom**. Chiuso con
> `execArgv: ["--no-experimental-webstorage"]`, e la suite intera esce **0**
> su **entrambe** le versioni: `191 file, 2138 test`.

## Il testo di prima, lasciato perche' cancellarlo sarebbe meno vero

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

## Giro 10 — `montaggio-canvas` NON entra, e la ragione non e' la ridondanza

Cercata la mutazione che **solo un e2e** puo' vedere, secondo il criterio che ha
funzionato due volte. Trovata, ed e' migliore di quanto sperato: il codice
**dichiara da solo** l'invariante, in
`apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`, sopra `BoardWires`:

> *«Decorativo: i fili NON intercettano i pointer, i fori sotto restano
> tappabili.»*

Tolto `pointerEvents="none"` da quel gruppo — cioe' rimesso esattamente il
difetto che la riga esclude — **non se ne accorge nessuno**:

| chi guarda | esito |
|---|---|
| `montaggio-canvas` (l'unica spec che tocca i fori) | **exit 0** |
| la **suite unitaria intera** (required) | **exit 0** · `2138 passed` |
| i **nove** journey del cancello | **exit 0** |

**Perche' la candidata non lo vede, e perche' non basta rafforzarla.** I due fori
che tocca (`bb1:c3`, `bb1:c4`) **non stanno sotto un filo**: un clic **non
forzato** — quello che attiva il controllo di hit-target di Playwright — passa
con e senza la mutazione. Servirebbe un foro coperto da un filo.

## Bersagli sbagliati del giro 10, e vanno scritti

Due strade tentate e cadute, cosi' il giro 11 non le ripete:

1. **`document.elementFromPoint` sui centri dei fori** non funziona qui: nel
   viewport di default del runner la lavagna sta **sotto la piega**. Il primo
   foro ha `y ≈ 755` e il viewport e' alto **720** — e `playwright.config.ts`
   **non dichiara alcun viewport** (`grep viewport` esce **1**, nessuna riga),
   quindi vale il default di Playwright. `elementFromPoint` restituisce `null`
   per tutti e 420 i fori, e un'asserzione costruita su di lui sarebbe **vuota,
   non verde**. `scrollIntoViewIfNeeded` non basta: dopo lo scroll i fori con
   rect interamente dentro il viewport restano **0**.
2. **Il clic non forzato come discriminante** non basta da solo: e' la forma
   giusta — disattiva `force: true` e riaccende il controllo di hit-target — ma
   su `bb1:c3`/`bb1:c4` non c'e' niente sopra da intercettare.

Cio' che il giro 11 avrebbe bisogno di sapere: **55 fori su 420 hanno il centro
dentro il bounding box di un `path`** dell'SVG. Il bounding box non e' il tratto,
quindi non e' ancora la lista dei fori davvero coperti — ma e' li' che si cerca.

## Un invariante dichiarato e non difeso, lasciato dichiarato

La riga sopra `BoardWires` adesso **dice di se stessa** che nessun comando la fa
rispettare, con i tre exit accanto. Non e' un rimedio: e' smettere di far
sembrare difeso cio' che non lo e'. Questo repository ha gia' pagato la forma
opposta — un «tetto» dichiarato in un commento e mai imposto.

## I check REQUIRED, eseguiti (A-3 della retrospettiva)

Sette giri hanno promosso journey senza mai eseguire i check che impediscono
davvero una fusione. Il giro 9 li ha eseguiti, e questi sono gli exit:

| check required | comando | exit |
|---|---|---|
| studio | `npm run typecheck` | **0** |
| studio | `npx vitest run` | **0** |
| studio | `npm run build` | **0** |
| hygiene | `python3 bin/ci/nul_scan.py` | **0** |
| hygiene | `python3 bin/ci/secret_scan.py` | **0** |
| hygiene | `python3 bin/ci/elab_boundary_gate.py` | **0** |
| hygiene | `python3 bin/ci/workflow_trigger_gate.py` | **0** |
| hygiene | `python3 bin/ci/doc_claims_gate.py` | **0** |
| engine | `uv run pytest -q -rs` | **1** ⚠️ |
| engine | `env -u KIMI_API_KEY uv run pytest -q -rs` | **0** — `2044 passed, 7 skipped` |
| (il job intero) | gli **otto** journey del cancello | **0** |

⚠️ **Il rosso di `engine` porta il suo referente d'ambiente, e non e' un difetto
del prodotto.** I due test rossi sono `TestRealtimeEvalLiveKimi` e il suo
compagno, `@pytest.mark.skipif("KIMI_API_KEY" not in os.environ)`: la variabile
esiste su questa macchina e non su un runner, dove risultano **SKIPPED**.
Tolta la variabile, exit **0**. (L'endpoint Kimi risponde `404 url.not_found` su
`/anthropic/chat/completions`: cablaggio locale rotto, tocca credenziali, non
riparato qui.)

E' la regola che il giro precedente ha pagato: **una misura sulla CI porta la
versione del runtime e le variabili d'ambiente, non solo lo `sha`.**
