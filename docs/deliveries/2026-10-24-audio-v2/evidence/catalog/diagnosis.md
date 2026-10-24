# Catalogo: evento perso prima della sottoscrizione

Rilevazione locale: 24 ottobre 2026. Base `ae25b93bec826539940e0226da1f0cd8cebff0b1`,
branch `codex/ardesia-audio-v2-poiseuille-20261024`. La prova identifica base + diff,
non un nuovo commit pubblicato. Gli hash dei quattro file pertinenti sono in
`status.json`.

## Esito e limite

È riprodotta una finestra reale del lifecycle: il titolo del percorso è già
visibile nel DOM, ma il suo listener `popstate` registrato da `useEffect` non è
ancora attivo. Un evento in quella finestra viene perso. `fireEvent` usa già
`act`: l'effetto viene completato dopo il dispatch, senza ripetere l'evento.
Con il listener presente lo stesso evento produce subito il rifiuto atteso.

Il fix minimo registra il solo listener di `PhysicsPathways` con
`useLayoutEffect`, nella fase di commit prima degli osservatori DOM. La
validazione di versione/SHA e l'asserzione sincrona originale restano intatte.

**Il fallimento della specifica originale nel singolo run CI non è stato
riprodotto localmente.** Il controesempio controllato dimostra questa classe di
race e la sua correzione, ma non stabilisce con certezza che abbia causato il run
40083426275, che non aveva la telemetria dei listener. Il job Web sul candidato
integrato resta da verificare dall'integratore; nessun rerun verde viene usato
per cancellare il RED storico.

## Ambiente e ingresso originale

Letti AGENTS root, mandato §0, ultima voce RUNLOG, mappa/loop e addendum memoria,
package, lock e workflow. Nessun AGENTS aggiuntivo sotto `apps/web`.

CI originale: [run 40083426275](https://github.com/AndreaMarro/ardesia/actions/runs/40083426275),
job 120841443289. Log integrale acquisito dal connettore GitHub in
`ci-40083426275-job-120841443289.log`: Ubuntu 24.04.5 x64, Node 26.5.1,
npm 11.17.0, React/ReactDOM 19.2.6, Testing Library React 16.3.2, Vitest 4.1.8,
jsdom 29.1.1. Il checkout CI era il merge sintetico
`75a541a82148adec6467aa3b5867f41d8feff16a`, head PR `9f738d25` e base `339ab08f`.
Il log conserva 293 PASS / 1 FAIL, al `getByRole` originale riga 95, con il
vecchio titolo nel DOM.

Locale: macOS arm64, `/opt/homebrew/bin/node` 26.5.1 e npm 11.17.0. Il Node
predefinito 22.14.0 non è stato usato per queste prove. Lock originale SHA-256
`4f261496a923a8afcddaa0775b7bfae1c4bd5d08860fcd17200f7ae688c05b68`;
nessuna modifica al lock. Le versioni coincidono, il sistema operativo e
l'architettura differiscono dalla CI. `npm ci` ha installato 146 package sul Mac
contro 147 in CI; gli avvisi locali sui due script opzionali fsevents sono
conservati, senza modifica delle policy npm.

Comandi originali, eseguiti prima di modificare test o componente:

```sh
PATH=/opt/homebrew/bin:$PATH npm ci --no-audit --no-fund
PATH=/opt/homebrew/bin:$PATH npm run test:web -- src/__tests__/curriculum-catalog.test.tsx
PATH=/opt/homebrew/bin:$PATH npm run test:web
```

- `npm-ci.log`: exit 0.
- `original-focused.log`: exit 0, 4 PASS, 2.56 s.
- `original-full-web.log`: exit 1, 285 PASS / 9 FAIL, 69.28 s; il catalogo non
  compare tra i fallimenti. Non è una suite verde.

I nove fallimenti della suite originale completa sono conservati per nome:

1. accessibility-semantics — public and private brand links retain the complete visible name.
2. accessibility-semantics — skip links target a main that can receive focus without joining the tab order.
3. course-pack-disclosure — student-courses: closed preview makes no content or evaluation request; opening is explicit and closing unmounts it.
4. edition-register — opening reads the selected edition and keeps four lanes distinct; server canRecord forbids an old-date cell.
5. resource-composer — Classroom: retry reuses an immutable draft key and a new draft rotates it.
6. resource-composer — Materials: retry reuses an immutable draft key and a new draft rotates it.
7. session-boundary — a verified child json 401 (cookie) removes the private application and opens access.
8. session-boundary — a verified child binary 401 (cookie) removes the private application and opens access.
9. session-boundary — a verified child json 401 (missing) removes the private application and opens access.

Il log distingue timeout del test, query scadute e un'asserzione sullo stato del
bottone. La causa di questi risultati non è stata indagata in questa ownership;
non vengono attribuiti al catalogo né classificati come flaky. Il full corrente
è coordinato con l'integratore dopo gli edit indipendenti del verticale.

## Controprove causali

`listener-probe.tsx` contiene lo stesso fixture e una diagnostica con
`MutationObserver` nativo. Non sostituisce React, scheduler, useEffect o clock.
Due wrapper trasparenti di add/removeEventListener contano registrazioni e
invocazioni, inoltrando chiamate e cleanup ai listener reali. Il dispatch
avviene quando il titolo viene osservato, prima dell'effetto passivo. Il log
`listener-probe.log` registra questa sequenza:

| Passo | Listener registrati | Callback totali | Titolo |
| --- | ---: | ---: | --- |
| Prima del primo evento, heading committato | 1 | 0 | U4 · Onde meccaniche |
| Primo evento ritornato da fireEvent/act | 2 | 1 | U4 · Onde meccaniche |
| Effetti completati, senza nuovo evento | 2 | 1 | U4 · Onde meccaniche |
| findByRole scaduto col timeout standard | 2 | 1 | U4 · Onde meccaniche |
| Secondo identico evento ritornato | 2 | 3 | Riferimento non disponibile |

Il primo listener è quello del catalogo padre, che mantiene gli stessi kind e
open. Il secondo è quello del percorso: soltanto esso aggiorna la selection.
La registrazione durante il flush di `act` non recupera l'evento precedente.
`findByRole` non lo recupera neppure dopo l'avvenuta registrazione. Il secondo
evento dimostra che con il listener attivo non resta un commit React pendente
da attendere e che la regola di routing rifiuta correttamente `catalogVersion=999`.
Non si sostituisce perciò `getByRole` con `findByRole` nella spec originale.

Riproduzione diagnostica sul sorgente originale conservato:

```sh
python3 docs/deliveries/2026-10-24-audio-v2/evidence/catalog/run-listener-probe.py
```

Lo script salva e ripristina in `finally` i soli due file posseduti. Durante
l'esecuzione monta test diagnostico e `original-PhysicsPathways.tsx`; non va
eseguito insieme ad altri test sullo stesso checkout. Quattro skip nel log sono
la selezione `-t diagnostic:`, non skip aggiunti ai test del prodotto. Un primo
tentativo ha inoltrato le opzioni attraverso l'alias npm annidato: npm le
consumava. Il runner è stato corretto per invocare direttamente il workspace e
il log conservato mostra il comando effettivo corretto.

## RED, fix, GREEN e controllo

Il nuovo test permanente osserva il primo titolo con `MutationObserver` e
invia `popstate` immediatamente, senza gli spy diagnostici. Asserisce il rifiuto
del riferimento obsoleto e l'assenza della vecchia raccolta. La fixture è
condivisa con il test originale; le sue asserzioni e il suo dispatch sono
conservati. Nessun aumento di timeout, mock di effetti, retry o fallback.

- `regression-red.log`: codice applicativo originale, 4 PASS / 1 FAIL. Il nuovo
  test fallisce perché manca “Riferimento non disponibile”, mentre U4 resta nel
  DOM. Questo RED precede la modifica del componente.
- Fix: import di `useLayoutEffect` e uso per la sola sottoscrizione popstate;
  l'effetto di focus resta passivo.
- `regression-green.log`: 5 PASS, 3.86 s, con la spec originale inclusa.
- `control-baseline.log`: ripristinato il componente originale, stesso nuovo
  test RED (exit 1).
- `control-current.log`: riapplicato il componente corrente, stesso test GREEN
  (exit 0). Riepilogo in `control-status.json`.
- `typecheck-web.log`: `npm run typecheck:web`, exit 0.

Il controllo controfattuale è ripetibile con:

```sh
python3 docs/deliveries/2026-10-24-audio-v2/evidence/catalog/run-regression-control.py
PATH=/opt/homebrew/bin:$PATH npm run test --workspace @ardesia/web -- src/__tests__/curriculum-catalog.test.tsx --reporter=verbose
PATH=/opt/homebrew/bin:$PATH npm run typecheck:web
```

Lo script di controllo ripristina il componente corrente anche in caso di
errore. Le copie `original-*.tsx` sono prove del baseline, non test scoperti dal
runner né codice importato dal prodotto.

## Verifiche pendenti e ownership

Full Web, build ordinario/pubblico, browser e CI del candidato integrato sono
responsabilità dell'integratore, per evitare esecuzioni sovrapposte agli edit
Poiseuille. Il PASS mirato non chiude questi gate. Nessun commit, push,
deploy, merge, inferenza o aggiornamento memoria eseguito da questa ownership.
