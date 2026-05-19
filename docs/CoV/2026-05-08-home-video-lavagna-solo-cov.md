# CoV — Home Video + Lavagna Solo

Data: 2026-05-08
Scope: richiesta Andrea su homepage, videocorsi, video float e lavagna libera da home.

## Esito

PASS con una nota: deploy effettuato su preview Vercel, non promosso a produzione.

Preview verificata:
https://elab-tutor-f7eewqft1-andreas-projects-6d4e9791.vercel.app

## Cosa e stato verificato

- Pulsante Capitoli rimosso dall'header Lavagna.
- Glossario rimosso dalla homepage.
- Homepage: i due video locali TikTok sono dentro la card esistente `home-card-videolezioni`, senza container video aggiuntivo esterno.
- Homepage: lista video marcata `data-virtualized="true"`.
- VideoFloat / Videocorsi ELAB: usa gli stessi due MP4 locali con lista virtualizzata.
- Click dalla homepage su Lavagna: route `#lavagna-solo`, scope hard solo lavagna + UNLIM.
- In `#lavagna-solo` non compaiono modalita, Capitoli, Manuale, Video, Fumetto, Vision/circuiti, Bentornati, simulator/componenti/breadboard.

## Test automatici

Comando:

```bash
npx vitest run tests/unit/navigation.test.js tests/unit/components/HomePage.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx tests/unit/lavagna/AppHeader.test.jsx tests/unit/lavagna/VideoFloat-local-videos.test.jsx tests/unit/videoCourses.test.js
```

Risultato:

- 6 file passed
- 75 test passed
- 2 todo preesistenti

Build:

```bash
npm run build
npx vercel build
```

Risultato: PASS.

Warning non bloccanti osservati:

- CSS minify warning su selettori legacy `[file:line]`.
- chunk warning > 1000 kB.

## Playwright

Locale desktop e iPad:

- `hasGlossario: false`
- `hasVideoCard: true`
- `playerInsideCard: true`
- `playerSrc: /videos/tiktok-elab-1.mp4`
- `virtualized: true`
- Lavagna da Home:
  - `hash: #lavagna-solo`
  - `hasEmptyCanvas: true`
  - `hasModeSwitch: false`
  - `hasCapitoli: false`
  - `hasManualeButton: false`
  - `hasVideoButton: false`
  - `hasFumetto: false`
  - `hasVisionCircuit: false`
  - `hasBentornati: false`
  - `hasSimulatorMarker: false`

Screenshot locali:

- `/tmp/elab-home-video-desktop-route.png`
- `/tmp/elab-lavagna-solo-desktop-route.png`
- `/tmp/elab-home-video-ipad-route.png`
- `/tmp/elab-lavagna-solo-ipad-route.png`

Preview remota:

- `/tmp/elab-preview-home-video.png`
- `/tmp/elab-preview-lavagna-solo.png`

## Debug notes

Il primo approccio solo con flag runtime/localStorage era fragile tra home e lavagna in preview remota. Correzione applicata: route deterministica `#lavagna-solo`, aliasata da `App.jsx` a pagina `lavagna` e consumata da `LavagnaShell` per attivare freeMode.

Console remota: restano errori esterni/preesistenti su health CORS Galileo, Vercel Insights MIME e CSP PWA `virtual:pwa-register`. Non sono introdotti da questa modifica e non bloccano la verifica funzionale richiesta.
