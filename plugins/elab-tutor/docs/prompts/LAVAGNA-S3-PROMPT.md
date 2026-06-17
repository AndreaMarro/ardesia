# SESSIONE LAVAGNA 3/8 — VideoFloat (YouTube + Videocorsi)

## PRINCIPIO ZERO
**L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.**
UNLIM e un assistente INVISIBILE — non una video lezione. Il docente non deve capire l'interfaccia, deve insegnare. La Lavagna e lo strumento, non il soggetto.

## SPECIFICHE GENERALI (da rispettare SEMPRE)
- **Target**: bambini 8-12 anni, docenti non tecnici, LIM scolastiche
- **Dispositivi**: LIM (1024x768 min), iPad (1024x768 / 1366x1024), Chromebook (1366x768), PC
- **Touch target**: minimo 48px su TUTTO
- **Font minimo**: 14px
- **Contrasto**: WCAG AA su TUTTO
- **Palette**: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373, BG #F0F4F8
- **Font**: Oswald (titoli/brand), Open Sans (body), Fira Code (codice)
- **Icone**: SVG (Feather-style). ZERO emoji.
- **Animazioni**: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Build**: `npm run build` deve passare SEMPRE. 33 precache, ~4000KB.
- **Test**: 1008+ test devono passare SEMPRE.
- **ELAB Tres Jolie**: cartella `/ELAB - TRES JOLIE/` contiene TUTTO il materiale ELAB. Kit + Volumi + Tutor = UNICO PRODOTTO. Allinearsi visivamente.

---

## Stato Ereditato
Score sessione precedente: **8.2/10** (S2 — 15 metriche)
Bug P0 aperti: nessuno

File creati in src/components/lavagna/:
- AppHeader.jsx + .module.css (glassmorphism 48px, connessa a simulator API)
- FloatingWindow.jsx + .module.css (drag/resize/z-index, montata con UNLIM)
- FloatingToolbar.jsx + .module.css (7 icone SVG, connessa a simulator API)
- RetractablePanel.jsx + .module.css (3 dir, montata left con quick components)
- LavagnaShell.jsx + .module.css (assemblaggio completo con tutti i componenti)
- GalileoAdapter.jsx + .module.css (UNLIM chat in FloatingWindow con voice)
- useGalileoChat.js (hook chat: sendChat + action execution + screenshot)

Test: 1008/1008 PASS
Build: 33 precache, 4000KB

---

## PRIMA DI TUTTO
1. Leggi: `CLAUDE.md`
2. Leggi: `docs/plans/2026-04-01-lavagna-redesign.md`
3. Leggi: `docs/plans/2026-04-01-lavagna-master-plan.md`
4. `npm run build && npx vitest run` — DEVE passare
5. Navigare a #tutor — verificare IDENTICO
6. Navigare a #lavagna — verificare stato attuale (header + simulator + UNLIM FloatingWindow + toolbar + left panel)

---

## REGOLE ESECUZIONE
```
PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
```

### Vincoli assoluti
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- FONT: Oswald (display), Open Sans (body), Fira Code (mono)
- ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js
- UNLIM INTOCCABILE: 11 file, 2430 LOC — solo wrappare
- ZERO REGRESSIONI: #tutor IDENTICO
- STRANGLER FIG: tutti i file nuovi in src/components/lavagna/
- TOUCH FIRST: pointer events, min 48px target
- CSS MODULES per tutto il nuovo codice
- ZERO EMOJI: usa SVG Feather-style

---

## SKILL DA USARE
```
/lavagna-benchmark          — 1/3, 1/2, fine (15 metriche)
/elab-quality-gate          — prima, meta, fine
/verification-before-completion — prima di ogni commit
/simplify                   — dopo ogni implementazione
```

---

## 10 TASK

### Task 1: VideoFloat.jsx — YouTube iframe in FloatingWindow
- Creare `src/components/lavagna/VideoFloat.jsx` + `.module.css`
- YouTube embed via iframe (`<iframe>` con src=youtube URL)
- Paste URL o seleziona da catalogo
- Wrappato in FloatingWindow (drag, resize, minimize, close)
- Default: flottante (480x320)
- Zero autoplay — il docente decide quando avviare

### Task 2: Catalogo videocorsi JSON
- Creare `src/data/video-catalog.json` — lista curata di video didattici ELAB
- Ogni entry: { id, title, youtubeId, chapter, volume, duration, description }
- Includere almeno 10 video reali da ELAB (se disponibili in unlim-videos.js)
- UI di selezione dentro VideoFloat

### Task 3: UI ricerca/incolla URL
- Input per incollare URL YouTube (parse automatica per videoId)
- Barra di ricerca nel catalogo
- Card per ogni video con titolo + durata + thumbnail placeholder
- Click su card = carica video nel player

### Task 4: AUDIT 1/3
- /lavagna-benchmark 1/3
- Verificare: YouTube embed funziona? Play/pause nativo?
- Screenshot #lavagna con VideoFloat aperta
- Screenshot #tutor — DEVE essere IDENTICO

### Task 5: Picture-in-picture minimize
- Quando minimizzata, VideoFloat mostra thumbnail piccola (120x80)
- Click sul thumbnail = ri-espande
- Video continua in background (YouTube iframe non si ferma)

### Task 6: Touch test iPad (1024x768)
- `preview_resize` 1024x768
- Verificare VideoFloat drag/resize con touch
- Verificare che non copre il simulatore completamente
- Verificare che il catalogo e scrollabile con touch

### Task 7: AUDIT 1/2
- /lavagna-benchmark 1/2 (tutte 15 metriche)
- D1: drag FloatingWindow per VideoFloat
- D2: resize VideoFloat
- Touch test completo

### Task 8: Bottone Video nella AppHeader
- Aggiungere icona "Video" nella AppHeader (accanto a UNLIM toggle)
- Click = apre/chiude VideoFloat
- SVG icon (Feather-style play/video)

### Task 9: Test regressione: #tutor IDENTICO
- Navigare a #tutor, confrontare con baseline S2
- Verificare ZERO cambiamenti

### Task 10: AUDIT Fine Sessione
- /lavagna-benchmark fine (tutte 15 metriche)
- Screenshot confronto #tutor vs #lavagna
- Score card ONESTA
- Generare LAVAGNA-S4-PROMPT.md
- Aggiornare MEMORY.md

---

## BENCHMARK TARGET S3 (SEVERO)
- F1-F5: tutte PASS (bloccante)
- D1 Drag VideoFloat: >= 8
- D2 Resize VideoFloat: >= 7
- U1 Chrome ratio: >= 8 (VideoFloat non deve occupare troppo spazio)
- U3 LIM: >= 8
- D5 Palette: 10 (zero violazioni)
- **Target composito ONESTO S3: >= 7.5/10**
- Se YouTube non carica = sessione FALLITA
- Se VideoFloat non si trascina = D1 vale 0
