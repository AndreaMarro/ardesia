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
