# CoV — Home, Lavagna, tre pulsanti, deploy veloce

Data: 2026-05-08

## Scope verificato

- Rimozione pulsante `Capitoli` da header Lavagna.
- Home senza `Glossario`.
- Home `Videolezioni` con i 2 video TikTok locali dentro la card esistente.
- `#lavagna-solo` dalla home: solo lavagna + UNLIM, niente circuiti, niente tre pulsanti.
- Tre pulsanti su `#lavagna`:
  - `Percorso` -> canvas sandbox vuoto + UNLIM Percorso.
  - `Passo Passo` -> `buildMode=guided` + drawer/pannello guidato.
  - `Già Montato` -> `buildMode=complete` + circuito montato, LED acceso, diagnosi UNLIM.
- Profilo build preview più veloce: obfuscation disattivata salvo `VERCEL_ENV=production` o `ELAB_OBFUSCATE=true`.
- Fix PWA/CSP:
  - `virtual:pwa-register` risolto da Vite, non più import runtime letterale.
  - meta CSP allineato a `vercel.json`, incluso `wss://*.supabase.co`.

## Evidenza comandi

Test mirati:

```bash
npx vitest run tests/unit/pwa-stale-precache-hotfix.test.js tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx tests/unit/components/lavagna/LavagnaShell-modalita.test.jsx
```

Risultato: 3 file passati, 29 test passati, 1 todo. Warning noti: Supabase/Gotrue nei test UNLIM.

Build locale finale:

```bash
npm run build
```

Risultato: exit 0, `BUILD_SECONDS=105`, precache PWA 31 entries, 1719.95 KiB.

Vercel build finale:

```bash
npx vercel build
```

Risultato: exit 0, `VERCEL_BUILD_SECONDS=649`.

Deploy finale:

```bash
npx vercel deploy --prebuilt --yes --archive=tgz
```

Risultato: exit 0, `VERCEL_DEPLOY_SECONDS=77`.

Preview finale:

- https://elab-tutor-q4tz0gw95-andreas-projects-6d4e9791.vercel.app
- Alias verificato: https://elab-tutor-andreamarro-andreas-projects-6d4e9791.vercel.app

## Evidenza Playwright

Output:

- `docs/audits/2026-05-08-speed-deploy-smoke-final/playwright-smoke-result.json`

Screenshot:

- `docs/audits/2026-05-08-speed-deploy-smoke-final/01-home.png`
- `docs/audits/2026-05-08-speed-deploy-smoke-final/02-lavagna-solo-ipad.png`
- `docs/audits/2026-05-08-speed-deploy-smoke-final/03-gia-montato.png`
- controllo extra drawer: `docs/audits/2026-05-08-speed-deploy-smoke/07-passo-passo-drawer-check.png`

Risultati chiave dal JSON:

- Home: `hasGlossarioCard=false`, `playerInsideVideoCard=true`, `virtualButtons=2`.
- Lavagna solo: `hasEmptyCanvas=true`, `hasModalitaSwitch=false`, `forbidden=[]`.
- Header normale: `capitoli=false`.
- Percorso: `mode=sandbox`.
- Passo Passo: `mode=guided`, testo/pannello `PASSO PASSO`, `Avanti`.
- Già Montato: `mode=complete`, descrizione contiene batteria, resistore, LED acceso, 6 fili.
- Errori CSP cercati: nessun `Content Security Policy`, nessun `virtual:pwa-register`, nessun blocco `wss://*.supabase.co`.

## Non risolto / segnali da non ignorare

- `vercel build` resta troppo lento: 649s. La preview locale è migliorata, ma il collo di bottiglia vero è ancora output/asset/chunk.
- Upload deploy ancora 85.9 MB. `public/volumes` e `public/videos` vanno spostati fuori dal bundle.
- Chunk grandi ancora presenti: `react-pdf` ~1.9 MB, `LavagnaShell` ~744 KB, `ScratchEditor` ~732 KB.
- Console remota mostra ancora:
  - due 404 non identificati;
  - 400 Supabase su `class_key="_self"` in `UnlimMemory`.
- Picker esperimenti: cliccare il titolo gruppo `Accendi il LED` non equivale a scegliere esperimento. UX ambigua, da correggere.

