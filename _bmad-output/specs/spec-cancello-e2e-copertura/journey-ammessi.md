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
| `first-led-ipad-touch` | **ammessa** (giro 11) | la fascia tablet 769-1024px riportata scoperta la fa rossa (il pulsante "sim" torna oltre il bordo a 810px) mentre la suite unitaria resta **verde**: jsdom non ha layout ne' media query risolte |
| `montaggio-canvas` | **RESPINTA** (giro 10, per IMPOTENZA), poi **ammessa** (giro 12) | tolto `pointerEvents="none"` da `BoardWires` la fa rossa con «subtree intercepts pointer events», mentre la suite unitaria e i dieci gia' dentro restano verdi. Ci sono voluti tre giri per capire DOVE guardare |
| `elab-lab-canvas-colors` | **ammessa** (giro 13) | tolto `import '../styles/design-tokens.css'` dall'entry del plugin — il difetto storico rimesso — le **otto scene su otto** escono rosse, mentre la suite unitaria e i dieci gia' dentro restano verdi |
| `sim-esp6-rgb` | **RESPINTA** e **ammessa nello stesso giro** (giro 15) | la mutazione ovvia (l'id luminoso torna `led1`) la fa rossa **ma anche la suite unitaria**: ridondante. L'ha fatta entrare una seconda mutazione — il canvas nascosto sotto i 480px — piu' il passaggio da `toHaveCount(1)` a `toBeVisible()` |
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

## Giro 11 — la decima entra, e una regressione MIA aveva quasi fatto respingere una spec buona

`first-led-ipad-touch` difende una classe di difetto **nuova per questo
cancello**: il **layout responsivo**. Il difetto storico e' documentato nel file
e nel CSS: su iPad/LIM a **810px** la toolbar completa (~1356px) non entrava e
l'hamburger compariva **solo <=768px**, quindi il pulsante «sim» restava
**oltre il bordo** — irraggiungibile a tocco E a mouse (`btn.right=893 >
innerWidth=810`). Il rimedio e' la fascia `@media (min-width: 769px) and
(max-width: 1024px)` in `src/index.css`, il cui commento **dichiara** di essere
«guardata da `e2e/first-led-ipad-touch.spec.ts`». Adesso e' vero anche in CI.

| mutazione | candidata | suite unitaria (required) | i nove gia' dentro |
|---|---|---|---|
| fascia tablet riportata scoperta (`min-width: 1025px`) | **rossa** (1) | **verde (0) — CIECA** | verde (0) |
| nessuna | verde (0) | verde (0) | verde (0) |

La cecita' e' **strutturale**: jsdom non ha layout ne' media query risolte,
quindi nessun test unitario puo' vedere un controllo spinto fuori dal viewport.
E' la **seconda** classe — dopo la geometria resa — che solo un e2e difende.

### ⚠️ La prima misura di questo giro diceva il contrario, ed era colpa mia

La prima esecuzione dava la suite unitaria **rossa** sotto quella mutazione,
cioe' «ridondante, respinta». Era rossa per un **emoji che avevo committato io**
in `ToolCanvasEmbeddable.tsx` al giro 10 (`4672d189`), che viola
`src/__tests__/no-emoji.test.ts` (S-UX-1). Riparata (`ada6c5c6`) e rimisurata su
albero pulito, la suite esce **0** e la spec e' ammissibile.

**Una regressione non misurata aveva quasi fatto respingere un journey buono.**
La causa e' nota e vale piu' del sintomo: al giro 10, dopo l'ultima modifica al
commento, avevo eseguito `tsc` e il journey — **non** la suite unitaria — e il
gate frozen l'avevo eseguito *prima* di quella modifica. Tre comandi verdi, e
nessuno dei tre guardava la riga appena scritta.

### I journey si eseguono UNO PER VOLTA, e non e' un dettaglio

Eseguiti tutti insieme in un solo comando, `plugin-postit-room-reload`
(desktop) esce **rosso**: `toHaveCount(3)` riceve **0**. Eseguiti **uno per
volta**, come fa `ci.yml` (uno step per journey, niente glob), **tutti e nove i
file escono 0**.

Non e' un difetto del job com'e' configurato — e' un vincolo di cui il job
dipende senza dirlo: **i journey non sono mutuamente isolati**. Chi un giorno
li unisse in un'unica invocazione per fare prima troverebbe un rosso che non e'
del prodotto. Scritto qui perche' non venga scoperto per caso.

## Giro 12 — l'undicesima entra, e la lezione e' su DOVE si misura

Al giro 10 `montaggio-canvas` era stata respinta per **impotenza**: non vedeva
nemmeno l'invariante che il codice le affidava esplicitamente. Al giro 12 entra,
e **non e' la spec ad avere cambiato idea**: sono due suoi dettagli ad essere
diventati un oracolo.

| mutazione | candidata **rafforzata** | candidata **com'era** | suite unitaria | i dieci dentro |
|---|---|---|---|---|
| `pointerEvents="none"` tolto da `BoardWires` | **rossa (1)** | **verde (0)** | **verde (0)** | **verde (0)** |
| nessuna | verde (0) | verde (0) | verde (0) | verde (0) |

Il messaggio che la fa rossa e' quello che serviva da tre giri:

```text
<path fill="none" stroke="#ffffff" stroke-width="0.45" ...>
  from <g>...</g> subtree intercepts pointer events
```

### I due dettagli, ed erano sbagliati entrambi

1. **Il clic non deve essere `force: true`.** `force` disattiva il controllo di
   hit-target di Playwright, cioe' **esattamente la domanda** «chi riceve davvero
   questo tocco». La colonna «candidata com'era» sopra e' la controprova: stessa
   mutazione, `force: true`, **verde**.
2. **Il foro tappato deve stare sotto il TRATTO di un filo**, e i fori giusti si
   misurano **dentro lo stage legacy**, non sul canvas core.

### ⚠️ La trappola che e' costata tre giri: la superficie sbagliata

Le sonde dei giri 10 e 11 misuravano **senza aprire il pannello legacy**, quindi
guardavano il **canvas CORE** — che ha 420 fori suoi e altri fili — e davano una
lista di fori coperti (`bb1:j1` fra questi) **inutile per questa spec**, che
tappa nello **stage legacy**.

Misurato dentro lo stage legacy: `path=14`, `fori=420`, il gruppo dei fili ha
**6 path**, e i fori sotto il tratto sono **TRE**: `bb1:bus-top-plus-1`,
`bb1:bus-bot-plus-3`, `bb1:a9`. La spec adesso tappa il secondo.

Due misure identiche nel metodo (`isPointInStroke`), su **due superfici
diverse**, e solo una risponde alla domanda. E' la stessa famiglia del referente
adiacente, applicata al DOM invece che a un albero git.

## Giro 13 — la dodicesima entra, e porta una quarta classe

`elab-lab-canvas-colors` difende la **risoluzione dei token nel documento
renderizzato**. Il difetto storico non e' ipotetico: misurato sulla **produzione
viva** il 2026-07-31 — **45** custom property usate in `fill`/`stroke` e
**nessuna definita**, **~1700** elementi, **40 `<rect>` su 52** con `fill`
computato **NERO**. Un `var()` irrisolto rende la proprieta' invalida e `fill`
cade sul valore iniziale: breadboard, batteria e componenti come blocchi neri
pieni. Il plugin portava il disegno e **non i suoi token**.

| mutazione | candidata | suite unitaria (required) | i dieci dentro |
|---|---|---|---|
| `import '../styles/design-tokens.css'` tolto dall'entry del plugin | **rossa (1)** — **8 scene su 8** | **verde (0)** | **verde (0)** |
| nessuna | verde (0) — `10 passed` | verde (0) | verde (0) |

**La cecita' la dichiara il file stesso**, e non e' un'opinione: «jsdom non
applica i fogli di stile importati dai moduli: li' `getComputedStyle(...).fill`
non distingue un token risolto da uno rotto. Un unit test su questo difetto
sarebbe **verde per costruzione** — la forma di falso verde che questo loop
esiste per cacciare.»

E' la **quarta** classe che solo un e2e difende, dopo geometria resa, layout
responsivo e hit-testing dei pointer.

## ⚠️ CORREZIONE DI UN CONTEGGIO: i journey erano dieci, non undici

Le receipt dei giri 11 e 12 hanno scritto «il cancello e' a **dieci**» e «passa a
**undici**» journey. **Erano nove e dieci.** Contato dal workflow invece che a
memoria:

```
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/ci.yml')); \
  print(len([x for x in d['jobs']['e2e-journey']['steps'] if x.get('name')]))"
-> 10   (prima di questo giro)
-> 11   (dopo)
```

L'errore nasce da due numerazioni sovrapposte: «la nona spec» contava le spec
**giudicate** (ammesse + respinte), «nove journey» conta quelle **nel job**. Da
qui in avanti il numero dei journey si **conta dal workflow**, e il comando sta
qui sopra. Le due frasi sbagliate restano nelle receipt, marcate.

## Giro 14 — la lista si importa, non si copia

`elab-lab-canvas-colors` iterava su una **copia letterale** di `VISIBLE_EXP_IDS`
— otto id scritti a mano nella spec. Il costo era gia' dichiarato al giro 13
(«se una scena nuova diventa visibile e nessuno la aggiunge qui, il journey
resta verde su una domanda piu' piccola di quella che dichiara»), ed e' stato
**misurato**, non ipotizzato:

| albero | fonte `VISIBLE_EXP_IDS` | test eseguiti dalla spec |
|---|---|---|
| copia letterale | 8 scene | **10** |
| copia letterale | **9** scene (una resa visibile) | **10** ⚠️ la nona non la guarda nessuno |
| **import** della fonte | **9** scene | **11** |
| **import** della fonte | 8 scene (ripristino) | **10** — senza toccare la spec |

Il rimedio non e' un cancello: e' togliere la possibilita' di divergere.
`import { VISIBLE_EXP_IDS } from "../../../plugins/elab-tutor/src/data/experiment-visibility.js"`.
Stessa forma di `node-version-file: .nvmrc` — cio' che non si copia non puo'
divergere.

L'import e' **relativo** e non usa l'alias `@elab-tutor-plugin/...`: quell'alias
lo risolve vite per l'app, non il runner di Playwright, che compila la spec per
conto suo.

### Cercate altre copie, e una distinzione che vale

`grep` degli array di >=3 stringhe letterali in **tutte** le spec e2e: ne restano
**due**, e nessuna delle due e' lo stesso difetto.

- `cruscotto-graph.spec.ts:13 EVENTS` — e' **fixture**, non una copia di una
  costante del prodotto.
- `plugin-postit-room-reload.spec.ts:12 EXPECTED_INSTANCES` — e' l'**atteso**,
  non il **dominio**.

E' la distinzione: **copiare il DOMINIO su cui si itera e' pericoloso** perche'
la divergenza *restringe la copertura in silenzio*; **copiare l'ATTESO e' il
mestiere del test**, perche' la divergenza lo fa fallire a voce alta. Solo la
prima famiglia va importata.

## Giro 15 — respinta e ammessa nello stesso giro, e la differenza e' una parola

`sim-esp6-rgb` al primo giudizio era **RESPINTA per ridondanza**. La sua
mutazione ovvia e' il difetto F5-1 rimesso: l'id del componente luminoso che
torna la costante `led1` invece di leggersi dall'esperimento — per la lampada
RGB (`rgb1`) `componentStates.led1?.on` vale `false` perche' l'id **non esiste**,
e `?.` collassa «assente» e «negativo».

| mutazione | candidata | suite unitaria (required) |
|---|---|---|
| **A** l'id luminoso torna `led1` | **rossa (1)** | **rossa (1)** — la vede |

Cio' che l'ha fatta entrare e' una **seconda** mutazione, browser-only:

```css
@media (max-width: 480px) { [data-elab-canvas] { display: none } }
```

la regressione plausibile «nascondi il canvas su mobile per far stare la UI».

| mutazione **B** | candidata **com'era** | candidata **rafforzata** | suite unitaria | gli undici dentro |
|---|---|---|---|---|
| canvas nascosto sotto i 480px | **verde (0)** | **rossa (1)** | **verde (0)** | **verde (0)** |

### La differenza e' una parola: `toHaveCount` non e' `toBeVisible`

La spec faceva, sui tre viewport:

```ts
await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)
```

`toHaveCount` conta i nodi nel **DOM**. Un `display: none` lascia il nodo dov'e':
la spec restava **verde su tutti e tre i viewport** mentre il docente su telefono
non vedeva piu' niente — e il commento sopra diceva «Evidenza visiva desktop /
tablet / mobile». **Dichiarava di guardare la vista e guardava l'albero.**

Con `toBeVisible()` la stessa mutazione esce **1**. Una parola separa difendere
da sembrare di difendere.

E' la quinta classe che solo un e2e vede: **visibilita' sotto un viewport**.
jsdom non ha layout ne' media query risolte.

## Giro 16 — contare non e' vedere: il censimento, e il buco che ha trovato

La domanda aperta dal giro 15 — «quante altre `toHaveCount` dovrebbero essere
`toBeVisible`?» — non si risponde leggendo: si risponde con una mutazione.

**Censimento** delle dodici spec ammesse: **3** `toHaveCount(0)` (asserzioni di
**assenza**: contare li' e' esatto) e **8** `toHaveCount(n>0)` (asserzioni di
**presenza**), piu' 2 occorrenze dentro un commento.

**La mutazione**: `[data-elab-canvas] { display: none }` — il disegno resta nel
DOM e sparisce dallo schermo, su **ogni** viewport.

| | journey che se ne accorgono |
|---|---|
| **prima** del rimedio | **1 su 12** — solo `sim-esp6-rgb` |
| **dopo** | **2 su 12** — e la seconda e' quella che doveva |

⚠️ **Il buco era nella spec meno sospettabile.** `elab-lab-canvas-colors` — nata
perche' il circuito era **grafica morta in produzione**, 40 `<rect>` su 52 con
`fill` computato nero — usciva **`10 passed`** con il disegno **completamente
invisibile**. Verificava che i token si **risolvessero**, e un token si risolve
benissimo dentro un sottoalbero che nessuno vede.

Rimediato: `toBeVisible()` accanto al conteggio, sul canvas e sul LED. Sotto la
stessa mutazione ora esce **1**, `9 failed`.

### Non tutte le `toHaveCount` sono un buco, e la controprova lo dimostra

`product-flow-shell` conta le tre voci di nav in tre punti. Reso il nav
**invisibile** (`visibility: hidden`), la spec esce **1** — senza che nessuno
l'abbia toccata. **E' il CLIC a pretendere la visibilita'**, non il conteggio:
Playwright rifiuta di cliccare cio' che non si vede.

Da cui la regola, piu' precisa di «usa sempre `toBeVisible`»:

> `toHaveCount` e' un buco **solo quando nient'altro nella spec interagisce con
> quell'elemento**. Se la spec poi lo clicca, l'azione difende gia' la
> visibilita'. Contare cio' che poi si tocca e' corretto; contare cio' che si
> guarda soltanto, no.

Per lo stesso motivo `sim-esp2-senza-resistore:29` (`select option` a otto)
resta com'e': le `<option>` non hanno una visibilita' propria utile, e la spec
poi **seleziona** un valore.

## Giro 17 — il verdetto che non si vede, e una mutazione che non era una mutazione

Stesso metodo del giro 16, applicato a `toHaveText` / `toContainText` /
`toHaveAttribute`. Censimento delle dodici spec ammesse: **28** asserzioni di
testo o attributo, di cui **15** su selettori con cui la spec **non interagisce**
— cioe' cose che il docente **legge** e nessuno **tocca**: `[data-marked-count]`,
`[data-led-on]`, `[data-led-burned]`, `[data-montaggio-canvas-notice]`,
`[data-imported-pack]`, `[data-rgb-channels]`.

**Mutazione**: quei verdetti resi `display: none` — nel DOM, fuori dallo schermo.

| | journey che se ne accorgono |
|---|---|
| **prima** | **3 su 12** (`sim-esp2`, `studentpack-artifact`, `sim-esp6-rgb`) |
| **dopo** il rimedio | **6 su 12** |

I tre che gia' vedevano lo devono a `toBeVisible` o a `getByText(...)` che
avevano per altre ragioni — non al fatto di asserire un attributo.

### ⚠️ La prima mutazione NON era una mutazione, e va detto per primo

La prima misura diceva **12 su 12 ciechi**. Era falsa: la regola CSS non aveva
effetto sui verdetti elettrici, perche' l'elemento che li porta ha uno **style
inline**:

```tsx
<dd style={{ display: "inline", margin: 0 }}
    data-led-on={ledOn ? "1" : "0"}
    data-led-burned={ledBurned ? "1" : "0"}>
```

Uno `style` inline batte qualunque regola di foglio senza `!important`. Per
quegli elementi la mutazione **non e' mai avvenuta**, e «12 su 12 verdi»
rispondeva a un'altra domanda. Rifatta con `display: none !important` e
rimisurata su entrambi i lati: **3 prima, 6 dopo**.

E' la regola «verifica che il tuo comando abbia fatto quello che credi» pagata
una seconda volta, in una forma nuova: **una mutazione che non muta e' un
controllo che non controlla**, e sembra identica a una che funziona.

### `first-led-ipad-touch` resta a 0, e non e' un buco

Il rimedio su `[data-montaggio-canvas-count]` li' e' dentro il `test.fixme`
dichiarato: non gira, quindi non puo' vedere niente. Registrato per non
cercarlo di nuovo.

## Giro 18 — quali verdetti nessuno guarda, e QUATTRO SCENE SU OTTO senza verdetto

La domanda del giro 17 («sei su dodici e' un miglioramento, non una
copertura») risposta mutando **un verdetto alla volta**:

| verdetto reso invisibile | journey che diventano rossi |
|---|---|
| `data-marked-count` | **3** — marcatura-durabile, ripasso-live, studentpack |
| `data-led-on` | **2** — sim-esp2, sim-esp6 |
| `data-led-burned` | **2** — sim-esp2, sim-esp6 |
| `data-montaggio-canvas-count` | **1** — montaggio-canvas |
| `data-montaggio-canvas-notice` | **1** — montaggio-canvas |
| `data-imported-pack` | **1** — studentpack-artifact |
| `data-rgb-channels` | **1** — sim-esp6 |

**Nessuno dei sette e' cieco**: ogni verdetto che una spec asserisce ha almeno un
journey che lo guarda davvero. La risposta alla domanda del giro 17 e'
**positiva**, ed e' misurata riga per riga.

### ⚠️ Ma la domanda giusta era un'altra, e la risposta e' peggiore

I sette sono quelli che **qualcuno gia' asserisce**. Censiti invece i `data-*`
che il prodotto **emette**: **127**, di cui **88 mai nominati da nessuna spec
e2e**. Fra quelli, `data-led-state` — l'attributo che porta il cartello
**«Verdetto non disponibile»**, nato proprio per non far leggere un'assenza come
un verdetto — e `data-light-id`, le righe per-luce degli esperimenti con piu' di
una luce.

Seguendo quella pista, misurato su **tutte e otto** le scene visibili:

```text
v1-cap6-esp1  solve=ok     led-count=1 on=1 burned=0
v1-cap6-esp2  solve=ok     led-count=1 on=0 burned=1
v1-cap6-esp3  solve=ok     led-count=1 on=1 burned=0
v1-cap9-esp6  solve=ok     led-count=1 on=1 burned=0
v2-cap7-esp1  solve=error  led-count=-  on=-  burned=-
v2-cap7-esp2  solve=error  led-count=-  on=-  burned=-
v3-cap6-esp4  solve=error  led-count=-  on=-  burned=-
v3-cap6-esp5  solve=error  led-count=-  on=-  burned=-
```

**Quattro scene su otto che un docente puo' aprire escono `solve=error` e non
gli mostrano NESSUN verdetto elettrico** — ne' acceso, ne' bruciato, ne' il
cartello «verdetto non disponibile». Diagnostica e citazione ci sono; il
verdetto no.

E **nessuno dei dodici journey se ne accorgeva**: `elab-lab-canvas-colors` itera
su tutte e otto ma guardava solo i token, e le altre spec usano **esp2 ed esp6**
— due delle quattro che stanno bene.

### Il segnalibro, e perche' non e' una promessa

⚠️ **Non e' dichiarato che sia un difetto.** Un solver MNA in continua puo'
legittimamente non risolvere un transitorio (carica/scarica del condensatore,
`v2-cap7-esp1/2`); per «due LED che si alternano» e il semaforo la ragione **non
e' stata cercata**. E' un **gate-Andrea**.

Aggiunta a `elab-lab-canvas-colors` la mappa `SOLVE_ATTESO`, che fissa lo stato
**com'e' oggi** scena per scena. Non promette che sia giusto: impedisce che
cambi in silenzio **in entrambi i versi**. Il giorno in cui una delle quattro si
risolvera' — o in cui una delle quattro sane smettera' — la spec diventera'
rossa e qualcuno dovra' aggiornare la riga scrivendo perche'. E' la stessa forma
che F5-1 aveva usato per non dimenticare la lampada RGB spenta.

Mutazione: `data-elab-lab-solve` che dichiara `error` anche quando risolve →
la spec esce **1**. (La vedono anche la suite unitaria e altri journey: questa
riga non cerca un'ammissione, e' un segnalibro dentro una spec gia' ammessa.)

## Giro 19 — perche' quattro scene non risolvono: la causa ha un nome

Il giro 18 aveva trovato che quattro scene su otto escono `solve=error`. Il
compito era indagare **senza riparare in silenzio**, perche' tocca il motore
elettrico. Indagato, e la causa e' precisa.

**Il motore e' fail-closed per progetto** (`apps/studio/sim/solver/elabSolver.ts`,
commento verbatim: «Fail-closed sui tipi non catalogati»): prima di risolvere
scorre i componenti e lancia se **uno solo** non e' nel catalogo elettrico.

Il catalogo ne registra **SETTE**: `breadboard-half`, `battery9v`, `resistor`,
`led`, `wire`, `potentiometer`, `rgb-led`.

Cio' che il docente **vede davvero** — misurato, non dedotto:

```text
v2-cap7-esp1  solve=error  «solve fallito: … non catalogato … capacitor (id c1)»
v2-cap7-esp2  solve=error  «solve fallito: … non catalogato … capacitor (id c1)»
v3-cap6-esp4  solve=error  «solve fallito: … non catalogato … nano-r4 (id nano1)»
v3-cap6-esp5  solve=error  «solve fallito: … non catalogato … nano-r4 (id nano1)»
```

### ⚠️ Correzione al giro 18: il prodotto NON resta in silenzio

La receipt del giro 18 diceva che quelle scene «non mostrano NESSUN verdetto
elettrico — ne' acceso, ne' bruciato, ne' il cartello». Vero per il **verdetto**;
falso come impressione complessiva. C'e' un `role="alert"` **visibile**
(`display=block`, misurato) che dice **perche'**. Il prodotto e' fail-closed e
lo dichiara: e' la forma giusta, non un silenzio.

### E i componenti mancanti sono almeno TRE, non uno

Catalogato `capacitor` per prova, le stesse due scene falliscono su
**`push-button` (id btn1)**. La mutazione era **arrivata** — l'ho verificato
invece di dedurlo dal verde — e lo stato non e' cambiato perche' manca un terzo
tipo. Servono almeno `capacitor`, `push-button`, `nano-r4`.

### L'oracolo adesso fissa la RAGIONE, non solo l'esito

`SOLVE_ATTESO` pinnava il **kind**. Aggiunto: per le quattro scene in errore,
l'alert dev'essere **visibile** e contenere `tipo componente non catalogato`.

| mutazione | la spec |
|---|---|
| **A** `capacitor` catalogato | **verde** — e la verifica dice perche': ora fallisce su `push-button` |
| **B** la ragione sparisce dal messaggio d'errore | **rossa (1)** |
| nessuna | verde |

⚠️ **GATE-ANDREA**: e' voluto che **meta' delle scene** della Founder Beta
contenga componenti fuori dal catalogo elettrico? Non e' un difetto da riparare
di nascosto — e' una domanda di ambito.

## Giro 20 — quanti tipi mancano: la risposta completa, in un comando

Il giro 19 aveva trovato i tipi mancanti **uno alla volta**, catalogandone uno e
rileggendo l'alert: `capacitor`, poi `push-button`. Metodo giusto ma lento, e
non dice **quando finisce**.

La domanda si chiude in un comando solo, leggendo i dati invece di sondare la
vista: per ogni scena visibile, i tipi dei suoi componenti meno i sette del
catalogo.

```text
v1-cap6-esp1  tipi=4  fuori-catalogo=[]
v1-cap6-esp2  tipi=3  fuori-catalogo=[]
v1-cap6-esp3  tipi=4  fuori-catalogo=[]
v1-cap9-esp6  tipi=5  fuori-catalogo=[]
v2-cap7-esp1  tipi=6  fuori-catalogo=[capacitor push-button multimeter]
v2-cap7-esp2  tipi=7  fuori-catalogo=[capacitor push-button multimeter]
v3-cap6-esp4  tipi=4  fuori-catalogo=[nano-r4]
v3-cap6-esp5  tipi=4  fuori-catalogo=[nano-r4]

tipi FUORI catalogo usati dalle scene visibili: 4
elenco: capacitor multimeter nano-r4 push-button
```

**Quattro tipi, non tre.** E la riga che cambia una decisione: **`v3-cap6-esp4/5`
sono a UN SOLO componente** dal risolvere — manca `nano-r4`, la scheda. Le altre
due ne aspettano tre.

### Il rapporto adesso e' sorvegliato, e non da un cancello nuovo

`apps/studio/src/__tests__/CatalogoSceneVisibili.test.ts` — un test unitario,
dentro `studio (test)` che e' **required**, non un gate in piu' da mantenere.
Confronta il catalogo registrato con i tipi usati dalle scene **visibili** e
pretende che l'insieme fuori catalogo sia esattamente quello misurato.

| mutazione | il test |
|---|---|
| `nano-r4` catalogato | **rosso (1)** |
| nessuna | verde |

Cosi' il rapporto non puo' cambiare in silenzio **in entrambi i versi**: una
scena nuova che porta dentro un tipo non catalogato, o un tipo catalogato che fa
risolvere una scena che prima non risolveva, obbligano ad aggiornare la costante
**scrivendo perche'**. E' `SOLVE_ATTESO` dal lato dei **dati** invece che della
vista.

⚠️ Il test **non ripara** e non giudica: il gate-Andrea resta aperto, ed e' la
domanda d'ambito «e' voluto che meta' della Founder Beta non risolva?».

## Giro 21 — quanto costa il catalogo: la tabella che serve per decidere

Il gate-Andrea sul catalogo elettrico era posto bene («e' voluto che meta' della
Founder Beta non risolva?») e privo del numero che lo decide: **quanto costa
cambiarlo, e da dove si comincia**.

Esteso il censimento del giro 20 dalle **8 scene visibili** a **tutte le 88** del
corpus:

```text
esperimenti nel corpus: 88
tipi nel catalogo elettrico: 7
tipi fuori catalogo usati dal corpus: 12
risolvibili col catalogo attuale: 21
```

**Ventuno su 88.** E i tipi che bloccano, per scene che li usano:

```text
nano-r4 23 · push-button 19 · multimeter 16 · photo-resistor 6
reed-switch 5 · mosfet-n 5 · motor-dc 5 · capacitor 4
phototransistor 3 · buzzer-piezo 2 · breadboard-full 2 · diode 1
```

### L'ordine greedy: da dove si comincia

| + tipo | risolvibili | guadagno |
|---|---|---|
| *(catalogo attuale, 7 tipi)* | **21** / 88 | — |
| `nano-r4` | **39** | **+18** |
| `push-button` | **50** | +11 |
| `multimeter` | **61** | +11 |
| `photo-resistor` | 67 | +6 |
| `reed-switch` | 71 | +4 |
| `capacitor` | 75 | +4 |
| `motor-dc` | 79 | +4 |
| `mosfet-n` | 82 | +3 |
| `buzzer-piezo` | 84 | +2 |
| `phototransistor` | 86 | +2 |
| `breadboard-full` | 87 | +1 |
| `diode` | 88 | +1 |

**Tre tipi — `nano-r4`, `push-button`, `multimeter` — portano il corpus da 21 a
61 su 88.** Da meno di un quarto a oltre due terzi. Ed e' la stessa scheda
Arduino che sblocca da sola le due scene visibili di Volume 3.

Lo strumento e' `ops/tools/catalogo-copertura.mjs` (FABBRICA, mai spedito), e
**legge il catalogo vero** invece di ricopiarlo: catalogato `nano-r4` per prova,
i suoi numeri passano da `21` a `39` risolvibili e da `12` a `11` tipi fuori
catalogo. Ripristinato, tornano.

⚠️ Il comando misura la **copertura**, non la **difficolta'**. Un catalogo non e'
un elenco di nomi: e' un modello, e le dodici fisiche non si equivalgono. La
decisione resta di Andrea — ma adesso ha davanti una tabella invece di
un'impressione.

## Giro 22 — il cartello era gia' difeso, e il mio «88» ne valeva 31

Due correzioni mie, ed e' tutto cio' che questo giro produce di duraturo.

### Il cartello «Verdetto non disponibile» E' difeso, e da prima di me

Il giro 18 aveva notato che `data-led-state` non compare in **nessuna spec e2e**,
e ne aveva fatto una domanda aperta: «o il caso non capita, o il blocco non viene
renderizzato». Nessuna delle due. **Esisteva gia' un test**
(`ElabLab.test.tsx`, «stato del componente luminoso ASSENTE») che registra un
solve con `componentStates: {}` e pretende il cartello **piu'** il nome del
componente.

Falsificato per esserne sicuro, invece di fidarmi della lettura:

| mutazione | il test |
|---|---|
| il marcatore `data-led-state="missing"` cambiato | **rosso (1)** |
| il cartello non nomina piu' il componente | **rosso (1)** |
| nessuna | verde |

### ⚠️ E il numero che avevo scritto valeva un terzo

Il censimento del giro 18 guardava **solo le spec e2e** e diceva «**88** emessi e
mai nominati». Giusto per la domanda posta, **fuorviante** per quella che
sembrava rispondere: si legge come «88 non difesi», e non lo e'. Un attributo di
**vista** lo difende benissimo un test unitario — il cartello ne e' la prova.

Contando anche i test unitari:

```text
127 emessi · 39 nominati da e2e · 91 da test unitari
 96 nominati da almeno un oracolo · 31 da NESSUNO
```

**Trentuno, non ottantotto.** Un terzo. E 31 e' una lista che una persona puo'
leggere in dieci minuti, mentre 88 sembrava un cantiere.

`ops/tools/attributi-senza-oracolo.py` (FABBRICA) rende il numero ripetibile
invece di riderivarlo a mano. Mutazione: tolto a un test il nome
`data-led-state`, il censimento passa da **31 a 32**; ripristinato, torna. Legge
gli oracoli veri.

⚠️ Il comando produce un **denominatore**, non un verdetto: nominare non e'
asserire, e molti `data-*` sono agganci interni che non hanno bisogno di un
oracolo. Il verso dell'errore e' pero' quello giusto — sovrastima la copertura,
quindi i 31 sono un limite **inferiore**.

## Giro 23 — due limiti invece di un numero, e il parametro che stavo accordando

Il giro 22 aveva corretto «88» in «**31**». Il giro 23 corregge il **31**, e non
sostituendolo con un altro numero: mostrando che **un numero solo, qui, e' falsa
precisione**.

«Nominato» non e' «asserito»: un attributo citato in un selettore d'appoggio non
e' sorvegliato. Separare i due insiemi sembra facile. Provati due criteri, ed
**entrambi sbagliano, in versi opposti**.

### VICINANZA — ha un parametro, e il parametro sceglie la risposta

| finestra | non asseriti |
|---|---|
| stessa riga (`N=0`) | **51** |
| `N=1` | **36** |
| `N=2` | **31** |
| `N=3` | 31 |

Avevo scelto `N=2` **e ottenuto il numero piu' comodo**. Non l'avevo scelto per
quello — ma non avevo nemmeno guardato gli altri, ed e' la stessa cosa dal punto
di vista di chi legge il risultato.

### PARENTESI — niente parametri, e sottostima

L'attributo dentro le parentesi di un `expect(...)`, per conteggio di bracket.
Nessun parametro da accordare. E sbaglia lo stesso, perche' il legame passa per
una variabile:

```ts
const alert = view.querySelector("[data-led-state=missing]")
expect(alert).not.toBeNull()
```

`data-led-state` finisce fra i «solo citati» — **eppure e' difeso davvero**, e al
giro 22 due mutazioni lo hanno fatto rosso. Nessun criterio testuale segue una
variabile.

### La risposta onesta e' un intervallo

```text
LIMITE INFERIORE dei non sorvegliati: 31   (nessun oracolo li nomina)
LIMITE SUPERIORE dei non sorvegliati: 50   (piu' i citati fuori da expect)
```

`ops/tools/attributi-senza-oracolo.py` adesso stampa **due limiti e la ragione
di ognuno**, con il controesempio scritto nella docstring perche' nessuno —
me compreso — torni ad accordare un parametro finche' il numero non piace.

Mutazione: tolto a un test il nome `data-led-state`, il limite inferiore passa
da **31 a 32**; ripristinato, torna.

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

---

## Giro 19 — `p30-free-manipulation`: **RESPINTA**, per due ragioni insieme

La candidata dichiara nella sua intestazione la classe che difende: la
**raggiungibilita' del puntatore**, verificata da `assertPointerReachable`, che
chiede a `document.elementFromPoint` sul centro del controllo di restituire il
controllo stesso — «dev'essere visibile, abilitato e non coperto da un
overlay/canvas». E' una delle cinque classi gia' ammesse, quindi la domanda non
e' se la classe conti, ma se **questa** spec veda qualcosa che nessun check
required vede.

Due mutazioni, due esiti opposti, e nessuno dei due la ammette.

### Mutazione A — il canvas torna sopra i pannelli

In `apps/studio/src/index.css`, prima del blocco `@media (max-width: 768px)`:

```css
.excalidraw { position: relative; z-index: 9999; }
```

E' la forma del difetto storico che il commento accanto a `.st-bar` ricorda: la
tela che si riprende lo stacking context e copre la barra.

| referente | exit | legge |
|---|---|---|
| `p30-free-manipulation` (la candidata) | **0** | non lo vede |
| `npx vitest run` (il required) | **0** | non lo vede |
| i **dodici** journey del cancello, uno per passo | **1** | lo vede |

Il journey che l'ha preso e' **`first-led-ipad-touch`**, e gli altri undici sono
rimasti verdi. La mutazione quindi **arriva** — non e' un no-op, ed e' la regola
che il giro 14 ha pagato — ma la classe che p30 dichiara e' gia' difesa da un
journey ammesso, e p30 e' cieca proprio li'.

### Mutazione B — il digest topologico smette di distinguere

In `apps/studio/sim/core/simulationSceneDigest.ts`, `simulationSceneDigest`
restituisce una costante invece dell'hash FNV della topologia canonica.

| referente | exit | legge |
|---|---|---|
| `p30-free-manipulation` | **1** | lo vede |
| `npx vitest run` | **1** | lo vede |

Qui p30 vede — ma il check required vede lo stesso, e prima. Il digest e'
coperto da quattro file unitari (`ContinuityProjection`, `ContinuityRuntimePath`,
`ToolHostSimulationBroker`, e la prova di tipo `…ImpossibleStates`).

### L'esito

**RESPINTA per impotenza sulla classe che dichiara** (mutazione A) **e per
ridondanza con un required su cio' che invece vede** (mutazione B). E' la prima
candidata che colleziona entrambe le ragioni: dove e' sola non guarda, e dove
guarda non e' sola.

### Il reperto da tenere

`assertPointerReachable` non e' scattata con la tela a `z-index: 9999` sopra
tutto. O il controllo che interroga non sta sotto la tela, o l'asserzione corre
prima che la copertura conti. Non e' una dichiarazione di difetto: e' la domanda
che chi legge il file deve poter fare, e oggi non e' scritta da nessuna parte.

Ripristino misurato: albero pulito, candidata exit **0**.

---

## Giro 20a — la domanda aperta del giro 19, chiusa con tre misure

Il giro 19 aveva scritto: `assertPointerReachable` promette «non coperto da un
overlay/canvas» e non e' scattata con `.excalidraw` a `z-index: 9999`. Offriva
due spiegazioni — o il controllo non sta sotto la tela, o l'asserzione corre
prima che la copertura conti. **La vera era una terza, e si misura.**

**Sonda di parentela**, inserita accanto alla chiamata e a due facce:

| asserzione della sonda | exit |
|---|---|
| il break **NON** e' discendente di `.excalidraw` | **1** — `Received: true` |
| il break **E'** discendente di `.excalidraw` | **0** |

Il controllo `[data-sim-break]` vive **dentro** `.excalidraw`. Alzare lo
`z-index` di un antenato non copre i propri discendenti: tutto il sottoalbero,
bottone incluso, sale insieme. La mutazione A del giro 19 **non era una
mutazione per quel controllo**, e per `first-led-ipad-touch` — che tocca la barra
FUORI dalla tela — lo era.

**E l'asserzione funziona.** Mutazione D, una copertura che non e' antenata:

```css
body::after { content: ""; position: fixed; inset: 0; z-index: 2147483647; }
```

`p30-free-manipulation` → exit **1**, con il messaggio che l'asserzione stessa
promette: `puntatore reale colpisce BODY, atteso il controllo stesso`.

`assertPointerReachable` non e' rotta. Non c'e' niente da riparare, e la
respinta del giro 19 resta valida per le due ragioni che gia' portava — solo che
la prima si legge meglio: p30 non e' cieca alla copertura, e' che quella
mutazione non poteva coprirla.

---

## Giro 20b — `plugin-wizard`: **AMMESSA** (tredicesima), classe nuova

Non e' una delle cinque. Le altre dodici guardano cio' che la pagina **mostra**;
questa guarda cio' che l'utente **si porta via**: i byte del file che il browser
consegna davvero.

### La mutazione

In `apps/studio/src/design/PluginWizard.tsx`, `handleExport` costruisce il
package e poi lo consegna:

```ts
const pkg = buildPluginPackage({ manifestJson, signatureB64, entryHtml })
const url = URL.createObjectURL(pkg)          // <- il cablaggio
anchor.download = `${output.manifest.id}.maestrotool`
```

Mutazione: `URL.createObjectURL(new Blob([output.manifestJson]))`. Il **nome**
del file resta giusto; i **byte** sono altri.

| referente | exit | legge |
|---|---|---|
| `plugin-wizard` (la candidata) | **1** | magic `PK` assente |
| `npx vitest run` | **0** | cieca |
| `npx tsc -b --noEmit` | **0** | cieco |
| i **dodici** journey gia' ammessi | **0** | ciechi |

### Perche' il required non la vede

Non e' che l'export sia scoperto: e' coperto **due volte, e mai nel mezzo**.

- `PluginWizard.test.tsx` sostituisce `URL.createObjectURL` con un mock e
  asserisce gli **attributi dell'ancora** (`download` = `<id>.maestrotool`, una
  sola chiamata). Il blob non viene mai aperto.
- `MarketplaceLocalCatalog.test.ts` apre davvero i byte, ma di
  `buildPluginPackage(...)` chiamata **dal test**, non di cio' che il componente
  passa al browser.

Il cablaggio fra le due — la riga 198 — non ha oracolo. E non puo' averne uno in
jsdom: jsdom non emette un evento `download`.

### Cosa vede solo lei

`download.suggestedFilename()` e poi lo **stream reale**: magic `PK`, e
`manifest.json` + `signature.b64` + `entry.html` nel central directory. Piu' la
firma Ed25519 vera via WebCrypto e l'handshake postMessage contro un iframe
sandbox (4 check, incluso `no-out-of-band-reply`).

### Cablata

`.github/workflows/ci.yml`, job `e2e-journey`, tredicesimo passo, con la ragione
di ammissione e **quattro costi dichiarati prima** (curva Ed25519 nel Chromium
del runner · timing dell'handshake sandbox · il formato dello zip come contratto
· `consoleErrors` vuoto).

Albero pulito: **tredici** journey, tutti exit **0**, uno per passo.

---

## Giro 21 — `sim-multi-experiment-restore` **AMMESSA** (quattordicesima), `sim-multi-instance` **RESPINTA**

Il giro precedente ha lasciato un metodo, non solo un esito: cercare **due
coperture forti che si guardano senza toccarsi**. Qui ce n'e' un'altra, e il buco
fra le due e' una regressione che nessuno vedrebbe.

### Le due mutazioni che non hanno deciso nulla (e perche' le scrivo lo stesso)

- **F** — l'emissione `host.emitLessonEvent` spostata dall'effetto al corpo del
  render: candidata **0**, unitari **0**, typecheck **0**. Nessuno la vede, e
  non ho la prova che sia arrivata: e' una mutazione **muta**, non un reperto.
- **G** — una scrittura `host.persistEmbedState` durante il render del figlio:
  candidata **0**, **unitari 1**. La mutazione e' arrivata (il required la
  prende) e la candidata non la vede. Prima gamba d'impotenza — ma sulla classe
  che la spec dichiara nel titolo, non su cio' che sa fare davvero.

Due tentativi a vuoto sulla classe dichiarata. Il terzo ha cercato la
**regressione**, non la classe.

### Mutazione H — la regressione a singleton

`renderToolCanvasEmbeddable` ricorda il primo `embedId` visto per ogni `toolId`
e restituisce `null` per gli altri. E' la forma esatta del difetto storico che
`sim-multi-instance` documenta nella sua intestazione («prima del fix il secondo
click selezionava l'istanza esistente»), spostata dall'inserimento al **render**.

| referente | exit | legge |
|---|---|---|
| `sim-multi-experiment-restore` (candidata) | **1** | 1 embed su 3 dopo il reload |
| `sim-multi-instance` (l'altra candidata) | **1** | lo vede anche lei |
| `npx vitest run` | **0** | cieca |
| `npx tsc -b --noEmit` | **0** | cieco |
| i **tredici** journey gia' ammessi | **0** | ciechi |

I tredici sono ciechi per una ragione sola e verificabile: **nessuno di loro ha
piu' di un embed vivo insieme.** `plugin-postit-room-reload` ricarica davvero,
ma con un post-it solo.

### Le due coperture che non si toccano

| cosa | chi la copre | cosa NON copre |
|---|---|---|
| la **logica d'inserimento** (`nextSimulationEmbedId`, `buildSimulationInsert`) | la suite unitaria | il dispatch del render |
| il **render di un embed** | `ToolCanvasEmbeddable.test.tsx` | piu' embed vivi insieme |

Prova della prima riga — **mutazione I**, `nextSimulationEmbedId` che ritorna
sempre `baseEmbedId`: suite unitaria exit **1**, `sim-multi-instance` exit **1**.
L'inserimento e' gia' required. Il **render con piu' istanze** non lo e'.

### Gli esiti

- **`sim-multi-experiment-restore`: AMMESSA.** Vede la regressione a singleton
  che i tredici e i required non vedono, e in piu' esercita l'unica cosa che
  nessun altro fa: tre embed che si rimontano **insieme** dopo un `reload()`
  vero, da store persistito.
- **`sim-multi-instance`: RESPINTA per ridondanza**, su entrambe le gambe. Sulla
  regressione del render duplica la quattordicesima (mutazione H: rosse tutte e
  due); sull'inserimento duplica il check required (mutazione I: rossi tutti e
  due). Non resta nulla che veda da sola.

### Cablata, con una fragilita' dichiarata

`.github/workflows/ci.yml`, quattordicesimo passo, con quattro costi. Il quarto
va detto qui perche' e' scomodo: una delle asserzioni della spec e' una **regex
sul testo dei warning React**. Se React cambiasse la formulazione, quella gamba
diventerebbe cieca **in silenzio** — un falso verde. L'ammissione non poggia su
di lei: la mutazione che l'ha ammessa fallisce sul **conteggio** degli embed.

Albero pulito: **quattordici** journey, tutti exit **0**, uno per passo.
`/tmp/journeys.sh` rigenerato da `ci.yml`, mai a mano.

---

## Giro 22 — le ultime tre. **Il filone e' chiuso.**

`elab-lab` **AMMESSA** (quindicesima). `sim-passo-passo` e `board-home`
**RESPINTE**. Non restano candidate.

### `elab-lab` — AMMESSA: il cablaggio dell'export

Terza volta in tre giri che il difetto sta **fra** due coperture. E stavolta il
codice lo dice da se': sopra `exportMemory` c'e' scritto «il modulo costruisce il
JSON versionato dall'event-log, **qui SOLO il download**».

Mutazione J: `buildLessonMemoryExport(log, { experimentId: "v1-cap6-esp9" })` —
la memoria depositata sotto un esperimento che non e' quello aperto. Il file
scende, e' JSON valido, si apre: e' solo archiviato nel posto sbagliato.

| referente | exit | legge |
|---|---|---|
| `elab-lab` (la candidata) | **1** | `experimentId` e il nome del file |
| `npx vitest run` | **0** | cieca |
| `npx tsc -b --noEmit` | **0** | cieco |
| i **quattordici** journey gia' ammessi | **0** | ciechi |

`ExportLessonMemory.test.ts` copre il modulo — con gli argomenti che gli passa il
test. **Quali argomenti passi il componente** non lo verifica nessuno, e in jsdom
non si puo': non c'e' evento `download`.

### `sim-passo-passo` — RESPINTA: ridondante dove guarda, cieca dove e' sola

- **Ridondante sull'evidenza del libro.** La spec asserisce
  `pag.30 — «Collega il positivo della batteria`. `SimulationStepByStep.test.tsx`
  asserisce **la stessa stringa** (righe 144-148), ed e' nel check required.
- **Impotente sul telefono.** Il suo secondo test esiste per il pannello su
  390px. Mutazione K: `[data-step-id] { display: none !important }` dentro
  `@media (max-width: 768px)`.

| referente | exit | legge |
|---|---|---|
| `sim-passo-passo` | **0** | non lo vede |
| `npx vitest run` | **1** | lo vede |

La mutazione e' arrivata — il required la prende. La candidata no, perche' il suo
test mobile fa `toHaveCount(4)`, che **conta nodi nel DOM e ignora il render**, e
poi uno screenshot, che non asserisce niente. E' la lezione gia' pagata al giro
17, qui in una spec che nessuno aveva riletto: **la gamba mobile e' decorativa.**

### `board-home` — RESPINTA per ridondanza

La sua unica affermazione e' un caricamento pulito. Mutazione L: un
`console.error` all'avvio in `main.tsx`.

| referente | exit |
|---|---|
| `board-home` | **1** |
| i quattordici gia' ammessi | **1** — e **dieci su quattordici** rossi |

Non aggiunge nulla: dieci journey ammessi asseriscono gia' `consoleErrors` vuoto
sullo stesso caricamento.

### Il quadro finale

**Quindici journey** nel cancello. Sette classi ammesse: geometria renderizzata ·
layout responsivo · hit-testing del puntatore · risoluzione dei token ·
visibilita' sotto un viewport · i byte che il browser consegna · il cablaggio fra
un modulo coperto e la consegna.

Le sei respinte, con la ragione: `sim-duplicate-instance` · `p30-free-manipulation`
(impotenza **e** ridondanza) · `sim-multi-instance` · `sim-passo-passo`
(ridondanza **e** impotenza) · `board-home` · e le altre gia' a registro.

**Il filone e' chiuso: non restano spec fuori dal cancello da giudicare.**

### Cosa lascia aperto, e vale piu' di un'ammissione

Tre giri, tre difetti nella stessa posizione: **fra due coperture forti che si
guardano senza toccarsi**. L'export dei plugin, il render con piu' istanze, la
memoria della lezione. Non e' un caso: e' la forma piu' comune di buco in un
repository ben testato, perche' ogni singola copertura sembra completa dal suo
lato. Nessuno ha censito quante altre coppie ci siano — le tre sono emerse
cercando mutazioni, non cercando loro.

---

## Giro 23 — la gamba decorativa riparata, e una mia conclusione corretta

`sim-passo-passo` **AMMESSA (sedicesima), dopo riparazione**. E il giro corregge
una riga che il giro precedente aveva scritto sbagliata.

### La riparazione, rossa prima

La gamba mobile faceva `toHaveCount(4)` e uno screenshot. Ora ogni passo
dev'essere **visibile** e avere un box non degenere.

| gate | exit |
|---|---|
| la gamba riparata sotto `display:none` dentro il media block | **1** — «passo `…step-1-positivo-striscia-rossa` invisibile a 390px» |
| la gamba riparata sull'albero pulito, file intero | **0** |

### La correzione: «il required la prende» era falso

Il giro 22 ha respinto questa spec per impotenza e ha scritto che sotto la
mutazione il check required andava **rosso**. Era vero come exit e **falso come
causa**: avevo inserito la regola in un blocco `@media (max-width: 768px)`
**nuovo**, e `responsive.test.ts` (S-UX-3) legge la forma del CSS. Andava rosso
per il blocco in piu', non per il pannello nascosto.

Rifatta la mutazione **dentro** il blocco che esiste gia':

| referente | exit | legge |
|---|---|---|
| la gamba mobile **riparata** | **1** | la vede |
| la gamba mobile **com'era** | **0** | cieca |
| `npx vitest run` | **0** | **cieca** — non come avevo scritto |
| i **quindici** journey gia' ammessi | **0** | ciechi |

La respinta del giro 22 resta giusta — la gamba com'era e' cieca, exit **0** — ma
la ragione che le avevo messo accanto era sbagliata. Una mutazione puo' essere
presa dal required **per il motivo sbagliato**, e allora la ridondanza che sembra
di aver misurato non esiste.

### Un oracolo che ho scritto e poi tolto, perche' misurava altro

Avevo aggiunto anche: il box di ogni passo dev'essere dentro i 390px. **Rosso sul
prodotto intatto**, bordo destro a `1087`. Sonda a due letture, prima e dopo il
resize: **prima 1087, dopo 1087**. Il post-it vive su una tela Excalidraw
pannabile e `setViewportSize` non la rifluisce: quel limite misurava la posizione
sulla **tela**, non la leggibilita'. Tolto, con la misura scritta nel commento.

E' il caso simmetrico della mutazione muta: qui non e' la mutazione a non
arrivare, e' **l'oracolo a puntare altrove**. Il prodotto intatto che va rosso e'
il segnale.

### Cablata

`.github/workflows/ci.yml`, sedicesimo passo, con quattro costi — fra cui, detto
esplicitamente, che i suoi due screenshot **non asseriscono niente** e restano
solo come CoV visivo, e che l'evidenza del libro e' ridondante con l'unitario e
non e' la ragione dell'ammissione.

Albero pulito: **sedici** journey, tutti exit **0**. `/tmp/journeys.sh`
rigenerato da `ci.yml`.

---

## Giro 24 — la regex fragile, sostituita. Un falso verde misurato.

Il quattordicesimo passo asseriva i warning React con una **regex sul testo**. Il
giro 21 l'aveva dichiarata fragile e non l'aveva risolta: se React cambiasse la
formulazione, quella gamba diventerebbe cieca **in silenzio**. Non era una
supposizione, e ora c'e' la misura.

### Il falso verde, misurato

Mutazione N: un `console.error` emesso sul percorso di mount degli embed, con
parole che React **non usa** — «regressione simulata: stato aggiornato fuori
tempo». Non corrisponde a nessuno dei quattro rami di `RENDER_PHASE_SETSTATE`.

| referente | exit | legge |
|---|---|---|
| l'oracolo **nuovo** | **1** | lo prende |
| la spec **com'era**, con la regex | **0** | **cieca — falso verde** |

E' esattamente la forma temuta: il prodotto sbaglia, il test resta verde, e
nessuno lo sa.

### La sostituzione

Il gate non legge piu' il testo. Raccoglie **tutti** gli errori di console e i
`pageerror` durante il restore e pretende che siano zero. La regex resta, ma solo
per **etichettare** la riga nel messaggio di fallimento
(`[setState-in-render] …`), dove serve a chi legge e non decide niente.

| gate | exit |
|---|---|
| l'oracolo nuovo sull'albero pulito | **0** |
| `npx tsc -b --noEmit` | **0** |
| i **sedici** journey, uno per passo | **0** |
| REQUIRED studio e hygiene | **0** |

### Cosa si guadagna e cosa si paga, detto prima

**Si guadagna** un soprainsieme: i warning React passano da `console.error`, che
ora si raccoglie senza filtro — quindi tutto cio' che la regex prendeva viene
preso ancora. Questo pezzo e' **per costruzione, non misurato**: non sono
riuscito a produrre un warning di fase-render vero con una mutazione locale (i
tentativi F e G del giro 21), e lo scrivo invece di far finta.

**Si paga** che qualunque errore di console sul percorso di restore ora fa rossa
questa gamba, anche se non c'entra con il `setState`. E' scritto accanto al passo
in `ci.yml` come costo numero 4, al posto della fragilita' che c'era prima.

### Il commento in `ci.yml` non mente piu'

Il quattordicesimo passo portava scritto «quella gamba diventerebbe cieca in
silenzio». Restava vero fino a oggi. Ora quel blocco dice **RISOLTO**, con le due
misure e il costo nuovo — perche' un avvertimento stantio accanto a un passo e'
peggio di nessun avvertimento: chi lo legge crede di sapere una cosa falsa.

---

## Giro 25 — una gamba decorativa fra i SEDICI ammessi, e una che credevo tale e non lo era

Il giro 23 aveva trovato una gamba decorativa in una spec **respinta**. Questo la
cerca dentro il cancello, e ne trova una nel secondo journey ammesso in assoluto.

### Da dove ho cominciato

Scansione dei sedici per le forme che non possono fallire: `toHaveCount`,
`toHaveAttribute` senza valore, screenshot. Nove spec ne hanno almeno una.
`product-flow-shell` e' la piu' esposta: quattro `toHaveCount`, nessuno
screenshot, e — la cosa che conta — un blocco di tre asserzioni sulla scheda del
founder plugin che leggono **solo** il DOM:

```ts
await expect(founderPlugin).toHaveCount(1)
await expect(founderPlugin).toHaveAttribute("data-founder-plugin-id", "io.ardesia.simulation")
await expect(founderPlugin).toHaveAttribute("data-plugin-trust-tier", "builtin-reviewed")
```

### La misura

Mutazione O: `[data-founder-plugin-id] { display: none !important; }`.

| referente | exit | legge |
|---|---|---|
| `product-flow-shell` **com'era** | **0** | **cieca** |
| `npx vitest run` | **0** | cieca |
| `product-flow-shell` **riparata** (`toBeVisible()`) | **1** | la vede |
| sull'albero pulito, riparata | **0** | verde |

La scheda del founder plugin e' la **porta d'ingresso al simulatore**: poteva
sparire dalla vista e il journey che la controlla restava verde.

### Il dettaglio che cambia la conclusione

Sotto la stessa mutazione, **tre** dei sedici vanno rossi: `first-led-ipad-touch`,
`montaggio-canvas`, `sim-passo-passo`. Non perche' guardino la scheda — perche'
la **cliccano**. L'elemento era difeso **di rimbalzo**, da chi lo usa, non da chi
lo asserisce. Una difesa cosi' sparisce il giorno in cui quei tre cambiano
percorso, e nessuno se ne accorge.

### E una che credevo decorativa e non lo era

Avevo rafforzato anche `toHaveCount(3)` sulle voci di navigazione. Mutazione P
(`[data-view-nav-item] { display: none !important }`): rosso — ma alla **riga che
c'era gia'**, `[data-view-nav-item="continuita"][aria-current="page"]`
`toBeVisible()`, due righe sopra. La mia aggiunta era ridondante e l'ho
**ritirata**, lasciando al suo posto un commento con la misura: quel conteggio
aggiunge «sono TRE», che la visibilita' non dice.

E' la lezione numero 2 applicata a me stesso. Avevo supposto due gambe
decorative; misurate, era una.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 26 — il quattordicesimo journey non guardava i tre embed che conta

E la **difesa di rimbalzo** si conferma con una seconda misura indipendente:
sono sempre gli **stessi tre** journey a tenerla su.

### La scansione, questa volta precisa

Il giro 25 aveva contato le FORME (`toHaveCount`, screenshot). Questo cerca la
firma esatta: **un conteggio il cui locator non compare mai su una riga con
`toBeVisible`**. Esclusi i `toHaveCount(0)`, che sono asserzioni di assenza e non
possono essere cieche allo stesso modo.

Ne esce che `sim-esp6-rgb` era gia' a posto — ogni conteggio ha accanto la sua
visibilita', con i commenti che spiegano perche' — e che il sospetto piu' grosso
e' il **quattordicesimo passo**, `sim-multi-experiment-restore`, con tre
conteggi nudi, fra cui i due che sono la ragione stessa della sua ammissione.

### La misura

Mutazione Q:
`[data-elab-canvas-source-of-truth="simulation-scene"] { display: none !important; }`

| referente | exit | legge |
|---|---|---|
| `sim-multi-experiment-restore` **com'era** | **0** | **cieca** |
| `npx vitest run` | **0** | cieca |
| `sim-multi-experiment-restore` **riparata** | **1** | riga 91, `toBeVisible` |
| sull'albero pulito, riparata | **0** | verde |

Il punto di quel journey e' che **i tre tornano** dopo un reload vero. Tornare
invisibili non e' tornare, e nessuno lo diceva.

### La difesa di rimbalzo, confermata

Sotto Q vanno rossi **`first-led-ipad-touch`, `montaggio-canvas`,
`sim-passo-passo`** — gli **stessi tre** della mutazione O del giro 25, che
nascondeva un elemento diverso (la scheda del founder plugin).

Due mutazioni indipendenti, su due elementi diversi, e lo stesso identico
insieme di rossi. La visibilita' della catena d'ingresso al simulatore e'
protetta da **tre journey che la cliccano**, non da chi la asserisce. Il giorno
in cui quei tre cambiano percorso, la protezione sparisce **in silenzio** — e
adesso e' scritto con due misure invece che con un sospetto.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 27 — le ultime due gambe cieche, e un rosso che non si ripete

Le due spec che la firma precisa aveva lasciato in sospeso erano **entrambe**
cieche. Riparate. E il giro inciampa in qualcosa che non stavo cercando.

### `plugin-wizard` — i quattro check che l'autore non vede

Il collaudo dell'handshake e' asserito con `toHaveCount(4)` e quattro
`toHaveAttribute("data-pass", "1")`: tutto DOM, niente resa.

Mutazione R: `[data-testid^="harness-check-"] { display: none !important; }`

| referente | exit |
|---|---|
| `plugin-wizard` **com'era** | **0** — cieca |
| `plugin-wizard` **riparata** | **1** — «il check `tool-ready-received` dev'essere visibile» |

Un collaudo che l'autore del plugin **non vede** non e' un collaudo: il journey
certificava quattro spunte che potevano non esserci sullo schermo.

### `elab-lab` — i cinque passi del libro

`[data-book-step]` contati 5 dentro `[data-elab-lab-citation]`, che e' asserito
visibile. **Il contenitore visibile non rende visibili i figli.**

Mutazione S: `[data-book-step] { display: none !important; }`

| referente | exit |
|---|---|
| `elab-lab` **com'era** | **0** — cieca |
| `npx vitest run` | **0** — cieca |
| `elab-lab` **riparata** | **1** |

La citazione verbatim dal libro serve al docente **solo se la legge**.

### Il conto delle gambe cieche

Quattro trovate con la firma precisa, **tutte e quattro vere**: la scheda del
founder plugin (`product-flow-shell`), i tre embed ripristinati
(`sim-multi-experiment-restore`), i quattro check dell'handshake
(`plugin-wizard`), i cinque passi del libro (`elab-lab`). Piu' quella trovata per
caso in `sim-passo-passo` prima dell'ammissione. Un solo falso sospetto — il
conteggio delle voci di nav — ritirato dopo la misura.

### Il rosso che non si ripete

Alla prima esecuzione dei sedici sull'albero pulito, **`sim-esp2-senza-resistore`
exit 1** — una spec che questo giro non ha toccato.

| gate | exit |
|---|---|
| `sim-esp2-senza-resistore` da sola | **0** (`1 passed`) |
| i sedici, prima esecuzione | **1** (solo lei rossa) |
| i sedici, seconda esecuzione, stesso albero | **0** |

Non e' una regressione: e' un **flake**, e questa e' la seconda volta che se ne
vede uno nella stessa forma (il giro 23 aveva visto `sim-passo-passo` fallire in
batch e passare da solo). La verita' scomoda: **il verde dei sedici, in locale,
non e' deterministico.** Non l'ho inseguito — costerebbe il giro — ma non lo
lascio implicito: un cancello che a volte e' rosso senza causa e' un cancello che
si impara a ignorare.

### Lo stato

Seconda esecuzione: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**,
i sei cancelli hygiene **0**.

---

## Giro 28 — il flake NON e' stato risolto, ed ecco cosa e' stato misurato invece

L'ordine chiedeva la causa misurata o un isolamento che rendesse il verde
riproducibile, «non «riprovato e passava»». **Non ho la causa.** Quello che ho e'
il motivo per cui non ce l'ho, e la riparazione di quel motivo.

### Cosa ho misurato del meccanismo

Ogni invocazione di `npx playwright test` **avvia e uccide il proprio dev
server**: prima e dopo una singola invocazione i processi `vite --port 5199` sono
**zero**. Sedici passi = **sedici cicli di vita del server**, ognuno che si lega
alla porta 5199 con `--strictPort` subito dopo che il precedente e' stato ucciso.
Vale anche in `ci.yml`, dove i sedici passi sono sedici invocazioni separate.

Sembrava la causa. **Non l'ho dimostrato**, e ho anzi dimostrato che una parte
della mia ipotesi era falsa.

### Una mia misura ritirata

Prima lettura: batch con server persistente **74s**, batch com'e' oggi **114s** —
«il 35% di risparmio». **Ritirata.** Rifatta attraverso lo strumento, con la
durata stampata dal runner stesso:

| gate | durata |
|---|---|
| i sedici, un dev server per invocazione | `durata_secondi=129` |
| i sedici, UN solo dev server persistente | `durata_secondi=128` |

**Un secondo.** La prima misura confondeva il ciclo di vita del server con la
cache di ottimizzazione di vite, calda dopo le esecuzioni precedenti. Il server
persistente non fa risparmiare niente.

### E il flake non si e' ripresentato

**Cinque** esecuzioni dei sedici oggi — tre con il server per invocazione, due
con quello persistente — **zero rossi**. Con zero eventi non si distingue nulla:
non posso attribuire il flake al meccanismo, e non posso nemmeno escluderlo.

Per questo **non ho cablato** il server persistente in `ci.yml`: l'unica
giustificazione sarebbe stata un guadagno di velocita' che non esiste e un
determinismo che non so dimostrare. Cambiare la CI su una supposizione e' come
riparare una gamba di test senza vederla rossa.

### Il diff che invece serviva: le prove alla caduta

Il flake dei giri 23 e 27 non e' stato diagnosticabile perche' **un journey che
cade non lasciava prove**. Misurato:

| gate | `journey_exit` | trace | screenshot | video |
|---|---|---|---|---|
| config **com'era** | **1** | **0** | **0** | **0** |
| config **dopo** | **1** | **1** | **1** | **1** |

`playwright.config.ts` non nominava `trace`, `screenshot` ne' `video`: un
fallimento lasciava in `test-results/` soltanto un `error-context.md`, e il passo
`upload-artifact` del job `e2e-journey` — che esiste, e carica quella cartella —
caricava quasi niente.

Ora: `trace: "retain-on-failure"`, `screenshot: "only-on-failure"`,
`video: "retain-on-failure"`. **Nessun costo sui verdi**; sui rossi la cartella
caricata cresce, ed e' esattamente il momento in cui serve.

Il flake resta aperto. La prossima volta che accade, ci sara' un trace da aprire.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 29 — il flake ha un nome, e il DOM diceva una cosa per un'altra

Partito per riparare la difesa di rimbalzo. Trovato che era **gia' chiusa**, poi
un quarto difetto fra due coperture, e infine — grazie al trace cablato ieri —
**la causa del flake**.

### La difesa di rimbalzo era gia' chiusa, e non lo sapevo

`[data-founder-plugin-id]` e
`[aria-label="Inserisci Simulation Plugin sulla lavagna"]` sono **lo stesso
nodo**: il bottone della toolbar porta entrambi. La riparazione del giro 25
(`toBeVisible()` sulla scheda founder) copriva gia' la porta d'ingresso.
Misurato: nascosto il bottone, `product-flow-shell` exit **1**, `vitest` **0**.

Due mutazioni che credevo su elementi diversi erano sullo stesso elemento. Ecco
perche' producevano lo stesso insieme di rossi.

### Il quarto difetto fra due coperture

`simulationSolveEvent` e' puro e coperto dagli unitari **con gli argomenti che
gli passa il test**. Quali argomenti passi il componente non lo verificava
nessuno.

Mutazione U: `experimentId: "v1-cap6-esp9"` al posto di `scene.experimentId`.

| referente | exit |
|---|---|
| `npx vitest run` | **0** |
| `npx tsc -b --noEmit` | **0** |
| i **sedici** journey | **0** |

### E il DOM esponeva un calcolo parallelo

Il primo tentativo di riparazione — asserire `data-sim-last-event-scene` — e'
rimasto **verde** sotto la mutazione. La sonda dice perche': ci sono **due**
chiamate a `simulationSolveEvent`, con **due sorgenti diverse**.

- riga 916, nell'effetto: `scene.experimentId` — l'evento **consegnato** a LessonOS
- riga 1028, in un `useMemo`: `boardScene.experimentId` — l'evento **mostrato** nel DOM

`scene` e' `sceneOverride ?? baseScene`: durante la manipolazione libera le due
divergono. Un journey che leggeva `data-sim-last-event-kind` credeva di osservare
cio' che il log ha ricevuto, e osservava un calcolo parallelo.

Riparazione: uno stato registra cio' che e' stato **emesso davvero**, esposto come
`data-sim-emitted-event-scene`, e `first-led-ipad-touch` lo asserisce.
Sotto la mutazione U: exit **1**. Albero pulito: exit **0**.

### Il flake ha un nome

Il batch ha fatto cadere `montaggio-canvas`. Alla prima caduta **il trace non
c'era**: ogni invocazione di playwright **svuota `test-results/`**, quindi le
prove del journey caduto le cancella il journey successivo.

| gate | trace sopravvissuti |
|---|---|
| cartella condivisa (com'era) | **0** |
| `--output` per journey | **1** |

Cablato `--output=test-results/<nome>` sui sedici passi. Alla caduta successiva
il trace c'era, e diceva: **`Test timeout of 30000ms exceeded`**.

Tempi per journey misurati dentro il batch (avvio del dev server incluso):
`montaggio-canvas` **32s**, `sim-multi-experiment-restore` **33s**,
`sim-passo-passo` **33s**, `elab-lab-canvas-colors` **47s**. Con il tetto a
**30s** i journey pesanti di canvas correvano a pochi secondi dal soffitto.

Tetto portato a **60s**. Controllo che governi davvero: tetto a 5s →
`montaggio-canvas` exit **1**. **COSTO dichiarato**: un blocco vero adesso
impiega il doppio a farsi vedere.

Tre flake, tre spec diverse (giri 23, 27, 29), sempre in batch, sempre verdi da
sole: **una sola causa**, e non era ne' lo stato condiviso ne' la porta.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 30 — correggo il giro 29: le due sorgenti NON divergono nei flussi misurati

E trovo, cercando altro, un test **spento** dentro un journey ammesso.

### La correzione

Il giro 29 ha scritto che le due chiamate a `simulationSolveEvent` **divergono**
durante la manipolazione libera. **L'ho affermato, non misurato.** Misurato oggi:

`boardScene = createBoardSceneWithPlacements(scene, placements)` — cioe' e'
DERIVATA da `scene`, e aggiunge i piazzamenti dalla palette. Il DOM calcola la
fisica su `boardScene`; l'effetto che consegna a LessonOS la calcola su `scene`.
Strutturalmente diverse, quindi. Ma dopo un piazzamento reale
(`montaggio-canvas`, resistenza posata su due fori):

```
dom=solved  emesso=simulation.circuit.solved:15.3  correnteDom=15.3
```

**Stesso esito, stessa corrente.** La divergenza e' **possibile per costruzione,
non osservata** nei flussi che il cancello esercita.

Non ho aggiunto l'asserzione di uguaglianza che avevo in mente: non sono riuscito
a costruire una mutazione che la faccia rossa senza inventarne una artificiale, e
un'asserzione che non so vedere rossa e' la definizione di gamba decorativa. La
domanda su quale sorgente sia quella giusta resta **aperta**, e resta un
gate-Andrea — ma senza la parola «divergono», che non mi ero guadagnato.

### Il test spento

La sonda e' finita dentro `test.fixme` e non e' mai stata eseguita: e' cosi' che
ho scoperto che `first-led-ipad-touch` **ha due test e uno e' spento**.

| gate | osservato |
|---|---|
| test dentro i sedici journey | **21** |
| test **spenti** (`fixme` o `skip`) | **1** |
| dove | `first-led-ipad-touch`, «student places a resistor via touch» |

`--forbid-only` vieta `.only`, **non** `.fixme`. Un test spento e' la gamba
decorativa perfetta: non puo' fallire per costruzione, e non lascia traccia nel
verde del passo.

Il nome del passo in `ci.yml` parlava del pulsante raggiungibile — che il test
vivo copre davvero — ma il file prometteva anche il piazzamento a tocco, che non
gira. **Annotato**: il nome del passo ora lo dice, e il quarto costo lo spiega
con la misura.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 31 — il test spento non era pigrizia: su iPad lo studente non puo' piazzare nulla

Il giro 30 aveva trovato un `test.fixme` dentro un journey ammesso e l'aveva
dichiarato. Questo lo **accende e lo misura**, come l'ordine chiedeva: leggere
prima perche' fu spento.

### Perche' fu spento, e se vale ancora

Il commento accanto lo dice fin da P29: con gesti di puro tocco l'embed di
montaggio **legacy** non si attiva — la tela interattiva di Excalidraw intercetta
i pointer, e il doppio-tap non fa quello che fa il doppio-click del mouse.

Acceso il fixme e lasciato correre:

```
locator.tap: Test timeout of 60000ms exceeded
  > 81 |   await paletteResistenza.tap()
```

Il divario **c'e' ancora**, e cade **prima** di qualunque posa: a tocco non si
arriva nemmeno a **selezionare** un componente dalla palette.

### Il fatto che rende il divario piu' grave di come suona

La palette e i fori (`SimulationBoard`) stanno **solo** dentro il `<details>`
«Montaggio libero legacy». Il canvas **core** — la superficie primaria, quella
che il commento di P29 proponeva come via alternativa — **non ha affordance di
piazzamento**.

Quindi oggi non esiste una seconda strada: **su iPad lo studente non puo'
piazzare nulla**, ne' nel pannello legacy ne' altrove. Il journey ammesso copre
il gesto del **docente** (inserire il plugin), che funziona; il gesto dello
**studente** non e' coperto perche' non esiste.

### Cosa ho fatto e cosa no

**Non ho riacceso il test**: sarebbe rosso per un difetto vero, e trasformare un
gap documentato in un cancello rosso non e' una decisione da test.

**Ho scritto la misura dove serve**: nel commento del `fixme` (con la riga e
l'errore esatti) e nel quarto costo del passo 9 in `ci.yml`. Chi legge non deve
rifare la misura per sapere se il divario e' ancora li'.

**GATE-ANDREA**: o si rendono attivabili a tocco gli embed Excalidraw, o il
flusso dello studente si porta sul canvas core. E' una scelta di prodotto.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 32 — la caccia al sosia: il banner dell'onesta' non era un sosia, ma non era legato a niente

Cercavo un attributo che esponesse un calcolo parallelo. Ne ho trovato uno che
espone una **lista scritta a mano che il prodotto non consulta**.

### Il sospetto

Dei quattordici attributi asseriti con un valore dai sedici journey, il piu'
esposto e' `data-elab-catalog-summary` — il banner «N esperimenti montati di 88»,
asserito `4/88` da `sim-passo-passo`. E' una dichiarazione di onesta' verso il
docente: la regola scritta nel file dice «la UI non vende esperimenti non
montati».

### Le tre liste

| lista | dove | chi la legge a runtime |
|---|---|---|
| `ELAB_EXPERIMENT_CATALOG` (4 voci) | `src/toolhost/elabExperimentCatalog.ts` | **nessuno**: solo `catalogSummary()` e il suo test |
| `getElabSceneStatus` | `sim/elab/sceneCatalog.ts` | **nessuno**: solo il suo test |
| il corpus vero | `packs/elab-tutor/data/lesson-paths/` | la vista ELAB Lab, via `getLessonPath` |

Il banner nasce dalla prima. Il **mount** passa dalla terza. Le due non si
toccano.

### Il sosia non c'era — misurato

Se la lista fosse gonfiata, il banner mentirebbe. Sonda su `v1-cap9-esp6`, il
quarto dichiarato montato:

```
stato=mounted solve=ok
```

**Si monta e risolve.** Il banner oggi dice il vero. Il difetto non e' il valore:
e' che **niente lo tiene legato** — l'unico vincolo era «la fixture esiste su
disco», che non impedisce di dichiarare montato un esperimento che nel corpus non
c'e'.

### La riparazione, rossa prima

Aggiunta un'asserzione unitaria: ogni voce del catalogo deve **esistere nel
corpus** (`lesson-paths/<id>.json`).

Mutazione X: un id del catalogo sostituito con uno fuori dal corpus, **conteggio
invariato** (resta 4).

| referente | exit | legge |
|---|---|---|
| la nuova asserzione | **1** | la vede |
| `sim-passo-passo` (che asserisce `4/88`) | **0** | **cieca**: il numero non e' cambiato |
| la stessa asserzione, albero pulito | **0** | verde |

Il journey guardava il **numero**, non il suo significato. Ora il numero e'
legato al corpus.

### Cosa NON copre, detto qui

L'asserzione lega il banner al **corpus**, non alla **montabilita'**. Che un
esperimento dichiarato montato si monti davvero richiede il browser, e resta
scoperto: `v1-cap9-esp6` l'ho verificato **a mano** con una sonda, una volta.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 33 — un catalogo che dice sempre no

La terza lista trovata il giro scorso, `sim/elab/sceneCatalog.ts`: serve o e'
morta? Misurato, e la risposta e' piu' interessante di «morta».

### La misura di morte apparente

Mutazione Y: `getElabSceneStatus` reso esplosivo.

| referente | exit | legge |
|---|---|---|
| `npx vitest run` | **1** | **solo** i due test di `ElabSceneCatalog.test.ts` |
| i **sedici** journey | **0** | ciechi: a runtime non lo chiama nessuno |

Dead code, dunque. Ma il nome del file dice «scene catalog», e i tipi dichiarano
un ramo `ready`.

### Il fatto che rende il file peggio che morto

`getElabSceneStatus` **risponde `blocked` a qualunque id**: il ramo `ready` non
viene mai costruito. Quindi risponde «bloccato» anche per **`v1-cap6-esp1`**, che
il prodotto monta e risolve davvero (misurato in browser il giro scorso:
`stato=mounted solve=ok`).

Un file che si chiama «catalogo delle scene» e che, se qualcuno lo cablasse come
cancello del mount, **bloccherebbe tutto**. E il giro scorso ci sono quasi
cascato io: l'avevo elencato come una delle tre liste candidate a essere «quella
che decide».

### Cosa ho fatto, e cosa NON ho deciso

**Non l'ho cancellato.** Il piano del 2026-07-07 (Task 4) lo vuole li' per il
blocker onesto di `v3-cap6-esp4`, e togliere un artefatto di contratto non e' una
decisione da giro di loop.

**Gli ho fatto dire cosa e'.** Intestazione con lo stato misurato: nessuno lo
chiama, il mount passa dal Pack, il banner nasce da un'altra lista, e chi volesse
cablarlo deve PRIMA aggiungere le voci `ready` o blocca tutto.

**Ho scritto il confine come test**, perche' non si perda:

| gate | exit |
|---|---|
| l'asserzione del confine sotto la MUTAZIONE Z (il modulo comincia a dire `ready` per esp1) | **1** |
| la stessa, albero pulito | **0** |

L'asserzione dice: questo modulo risponde `blocked` **anche** per un esperimento
che il prodotto monta. Non e' un difetto da riparare — e' il confine da non
dimenticare.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 34 — la caccia al sosia: quattro negativi onesti e una gamba che contava

Cinque dei quattordici attributi asseriti dai sedici, tracciati alla loro
sorgente. Quattro sono onesti. Il quinto ha dato una gamba da rafforzare.

### I quattro negativi, misurati e non supposti

| attributo | da dove nasce | esito |
|---|---|---|
| `data-plugin-trust-tier` | costante `FOUNDER_BETA_PLUGIN_TRUST_TIER` | **onesto**: il commento accanto dichiara cosa NON afferma (nessuna firma verificata al mount) e a quale condizione la costante deve sparire |
| `data-led-burned` | `solve.result` del motore, stesso `readings` di `data-led-on` | **coperto**: tolto il verdetto dal motore, `vitest` exit **1** e `sim-esp2-senza-resistore` exit **1** |
| `data-elab-lab-solve` | `solve?.kind` | **onesto**: e' l'esito del solve, non un suo sinonimo |
| il contenuto del ripasso | `handle.plugin.render()` | **coperto**: svuotate le righe, `vitest` exit **1** (`TeacherDashboardRipassoLive.test`) |

Nessun sosia fra questi quattro. Lo scrivo perche' un negativo misurato vale
quanto un positivo: toglie una zona dal sospetto invece di lasciarla nel dubbio.

### Il quinto: un badge che conta e un pannello che poteva restare vuoto

`ripasso-live` asseriva **solo** `data-zripasso-aperti` con una regex
`/^[1-9]\d*$/`. Mutazione AB — `lines: []` mentre il badge continua a contare:

| referente | exit | legge |
|---|---|---|
| `ripasso-live` **com'era** | **0** | **cieca**: il badge dice «1», il pannello e' vuoto |
| `npx vitest run` | **1** | lo vede |
| `ripasso-live` **rafforzata** | **1** | riga visibile + righe ≥ aperti |
| la stessa, albero pulito | **0** | verde |

### Perche' non e' ridondanza, e cosa NON ho misurato

Sotto AB il required va rosso, quindi su **quella** mutazione l'asserzione nuova
duplica l'unitario. Non e' quello il suo valore, e lo scrivo per non barare:
`TeacherDashboardRipassoLive.test` rende il pannello in jsdom **con un event-log
iniettato**; qui il log e' quello **vero**, IndexedDB, scritto dal passo 1 dello
stesso journey. Il tratto che solo questo passo puo' vedere e' **log reale →
righe rese**, e quel tratto **non l'ho misurato**: non ho una mutazione che lo
rompa senza rompere anche il resto.

Il badge, comunque, non certificava piu' nulla di cio' che il docente legge.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.

---

## Giro 35 — asserire il valore positivo di un booleano e' decorativo

Otto attributi restanti, tracciati. Tre negativi netti, due gambe decorative
trovate con la stessa forma, e **due mie mutazioni ritirate perche' non
compilavano**.

### Le due mutazioni ritirate

Avevo scritto `{/* MUTAZIONE ... */}` **dentro la lista di attributi** di un
elemento JSX: parse error. Entrambe le esecuzioni erano rosse — e per il motivo
sbagliato: `[PARSE_ERROR] Expected \`...\` but found \`}\``. Ho rifatto le due
mutazioni senza commento, verificando `tsc` prima. **Un rosso che non ho
attribuito non e' una misura**, ed erano due.

### I negativi (misurati, non letti)

| attributo | mutazione | esito |
|---|---|---|
| `data-step-passed` | i passi giudicano un circuito senza collegamenti | **vivo**: `sim-passo-passo` exit **1**, `vitest` exit **1** |
| `data-montaggio-canvas-count` | (stessa esecuzione) | vivo |
| `data-led-on` | copre lo stesso `readings` di `data-led-burned`, gia' misurato | coperto |

### La forma nuova: il valore positivo asserito

Due attributi booleani sono asseriti dai journey **solo nel loro valore
positivo**. Se il prodotto smette di distinguere e dice sempre «si», il journey
non se ne accorge.

| attributo | mutazione | journey | `vitest` |
|---|---|---|---|
| `data-pending` | ogni foro si dichiara in attesa | `montaggio-canvas` exit **0** | exit **1** |
| `data-pass` | il collaudo si dichiara sempre superato | `plugin-wizard` exit **0** | exit **1** |

Entrambe coperte dal required — non sono buchi di copertura. Sono **gambe
decorative dentro journey ammessi**: sembrano oracolo e non lo sono.

### Le due riparazioni, diverse per un motivo

- **`montaggio-canvas` — riparata.** Il tap-tap ha senso se il foro in attesa e'
  **uno**: `toHaveCount(1)` su `[data-pending]`. Rossa sotto la mutazione (exit
  **1**), verde sull'albero pulito (exit **0**).
- **`plugin-wizard` — NON riparata, dichiarata.** Non ho una mutazione che faccia
  fallire le spunte senza inventarla: nel flusso verde non esiste un handshake che
  fallisce. Ho scritto accanto alle quattro asserzioni che **non possono fallire
  se il badge dice sempre «1»**, e dove sta la garanzia vera: l'export e'
  fail-closed sul report reale, e piu' sotto il download viene ispezionato byte a
  byte. Le spunte restano come contesto leggibile, non come oracolo.

Riparare cio' che so vedere rosso; dichiarare cio' che non so vedere rosso.

### Lo stato

Albero pulito: **sedici** journey exit **0**, `vitest` **0**, `tsc` **0**, i sei
cancelli hygiene **0**.
