# ELAB — Visual Reference Matrix esperimenti visibili (8/8) — 2026-07-13

> Fonte di verità visibilità: `plugins/elab-tutor/src/data/experiment-visibility.js` → `VISIBLE_EXP_IDS` (selezione Andrea verbatim 25/05/2026). Questa matrice copre SOLO gli 8 visibili. Baseline: `origin/main` = `80520005` (merge #130). Sessione FABLE NOTTE-12. Aggiornata in NOTTE-15 (esp6 → verified-structural 4/8, multi-pin sbloccato in bridge+renderer).

## Metodo (riproducibile, zero dati inventati)

- Pagine-libro identificate da `packs/elab-tutor/data/volume-references.js` (bookPage) e verificate firsthand col footer stampato sulla pagina estratta.
- PDF sorgente = i volumi INTERNI al plugin (`plugins/elab-tutor/public/volumes/volume{1,2,3}.pdf`), NON i file in `VOLUME 3/CONTENUTI/` (vol3 lì è build diversa, v0.8.1).
- Estrazione pagina: `pdftoppm -png -r 150 -f <pag> -l <pag> volumeN.pdf out` (poppler 26.04.0, MIT-clean, nessuna dipendenza AGPL).
- Hash: `shasum -a 256`. Dimensioni: `sips -g pixelWidth -g pixelHeight`.
- Nessun testo dei volumi riprodotto qui; solo path/pagina/hash/misure.

### Sorgenti canoniche (sha256)

| Sorgente | bytes | sha256 |
|---|---:|---|
| `plugins/elab-tutor/public/volumes/volume1.pdf` | 27.661.848 | `b08b8ec6b8c585510aa2a649d6cc028f575e88c8baa1128f4cb7c7b4c3f5fd1a` |
| `plugins/elab-tutor/public/volumes/volume2.pdf` | 17.575.882 | `2aebce16d6a8943087ae4caf5ad5f799ba6175e374b2bd32b16266713457369d` |
| `plugins/elab-tutor/public/volumes/volume3.pdf` | 21.166.639 | `95a690ca3c1ee5ddec051447994638aef825e58a4835815a4e97ded66fc04bd4` |

⚠️ `VOLUME 3/CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf` ha sha diverso (`923777…`): NON usarlo come reference del plugin senza decisione esplicita.

### Asset pagina già committati (reference reali in repo)

| Asset | px | sha256 | Copre |
|---|---|---|---|
| `apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png` | 1497×1936 | `11318b5471882d3737629b79e24706ebcbbfc411b214db88eade7c878cc683b7` | v1-cap6-esp1 |
| `apps/studio/public/elab/manuals/vol1/page-031-esercizio-6-1.png` | 1332×1771 | `2f686a8af52fc057f68de9be9eae6363bc9df913becefa0733a5018e84694944` | v1-cap6-esp1 |
| `apps/studio/public/elab/manuals/vol3/page-051-esercizio-6-2.png` | 1049×1489 | `56ce5cd5a3e6c84fd72ac3f0811ddb3582c7465c5ec732e4d659c3d49932c454` | v3-cap6-esp2 (FUORI whitelist oggi) |

### Pagine estratte firsthand in NOTTE-12 (footer verificato, da committare nelle PR per-esperimento)

Estrazione a 150dpi dai PDF interni; sha256 (primi 16) dell'estrazione di questa sessione — ricalcolare al commit.

| Pagina | px | sha256/16 | Copre |
|---|---|---|---|
| Vol.1 p.29 | 1110×1476 | `bf77f6cfce6e5849` | v1-cap6-esp1 (già coperto da crop committati) |
| Vol.1 p.32 | 1110×1476 | `4377b4a5656a6084` | v1-cap6-esp2 |
| Vol.1 p.33 | 1247×1614 | `6923b3b4fdf9aa91` | v1-cap6-esp3 (2 figure: 220Ω e 1kΩ) |
| Vol.1 p.71 | 1110×1476 | `129a7151748a409f` | v1-cap9-esp6 (materiali) |
| Vol.1 p.72 | 1110×1476 | `f9e0ab59545ea603` | v1-cap9-esp6 (build 1-3) |
| Vol.1 p.73 | 1247×1614 | `51b2f9849224b97d` | v1-cap9-esp6 (build) |
| Vol.1 p.74 | 1247×1614 | `698b1df8ca323809` | v1-cap9-esp6 (2° e 3° pot + 470Ω) |
| Vol.2 p.67 | 972×1339 | `a580d97a4e2bc4e1` | v2-cap7-esp1 (breadboard INTERA orizzontale + multimetro) |
| Vol.2 p.68 | 972×1339 | `a0a87006cc64b95e` | v2-cap7-esp1 (build) |
| Vol.2 p.69 | 972×1339 | `9bf95b61a020cc2f` | v2-cap7-esp2 (pulsante a cavallo del divisorio) |
| Vol.2 p.70 | 972×1339 | `5de1fc669927f2f6` | v2-cap7-esp2 (build) |
| Vol.3 p.54 | 875×1241 | `d629d9878cf46540` | v3-cap6-esp4 (materiali: Nano R4 + ELAB Nano Breakout) |
| Vol.3 p.55 | 875×1241 | `f632c8b998e8a397` | v3-cap6-esp4 (figura circuito + sketch pin 6/9, delay 200ms) |
| Vol.3 p.57 | 875×1241 | `db1b112f7e4c8a60` | v3-cap6-esp5 (figura semaforo: 3 LED + 3×470Ω, pin 5/6/9) |

Render software (NON reference-libro, utili solo come confronto): `plugins/elab-tutor/docs/audits/iter-29-92-esperimenti-screenshots/` (8/8 presenti, 1280×720).

## Stati ammessi

`static-only` · `mounted-candidate` · `book-aligned-candidate` · `verified-human` · `verified-structural` · `uploadable` · `blocked-by-missing-reference` · `blocked-by-gate`.
Regola dura (canon §3): nessun `verified-*` senza gate umano o grader robusto; `visualMatch` via overlay CV = gate-Andrea (dipendenze).

## Matrice 8/8

| # | ID | Titolo | Vol/Cap/Pag | Reference primaria | Breakout | Asset (stato) | Stato scena | Stato simulazione | Stato Arduino | Gap principale | Prossimo test falsificabile |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | v1-cap6-esp1 | Accendi il tuo primo LED | 1/6/29-31 | pp.30-31 committate (sha sopra) | no | ✅ committato | **verified-structural** (overlay `docs/ops/overlays/v1-cap6-esp1-overlay.png` + report; era book-aligned-candidate (`elab-scene-v2-candidate-v1cap6esp1.json`: pose 4/4, wire.path 2/2, bookConstraints C1-C5 pass, grader strutturale pass, `visualMatch: unknown`) | solve reale via registry, LED 15.3 mA (golden) | N/A (batteria) | `cropBBox` assente; p.031 non strutturata come 2ª source; verifica umana aperta | overlay/GT reale → `visualMatch`; poi review umana → `verified-human` |
| 2 | v1-cap6-esp2 | LED senza resistore (cosa NON fare!) | 1/6/32 | p.32 committata: `apps/studio/public/elab/manuals/vol1/page-032-esercizio-6-2.png` (1332×1771, sha256 `0992810c…958419`) | no | ✅ committato (PR2) | **verified-structural** (overlay+report in docs/ops/overlays/; era book-aligned-candidate (`elab-scene-v2-candidate-v1cap6esp2.json`: pose 3/3, wire.path 3/3, bookConstraints E1-E5 pass + 4 falsificatori, grader onGrid, `visualMatch: unknown`) | solve reale: LED **BRUCIATO** (burned=true, I≈1A > soglia 30mA); controfattuale 470Ω → 12.8mA acceso; post-it (toolbar "sim esp2") + ElabLab dichiarano BRUCIATO; passo-passo 3 step p.32 con falsificatore resistore-aggiunto; e2e desktop+mobile | N/A (batteria) | `cropBBox` assente; verifica umana aperta; overlay CV = gate-Andrea | overlay/GT reale → `visualMatch`; poi review umana → `verified-human` |
| 3 | v1-cap6-esp3 | Cambia luminosità con resistenze diverse | 1/6/33 | p.33 committata: `apps/studio/public/elab/manuals/vol1/page-033-esercizio-6-3.png` (1497×1936, sha256 `df516df3…623083`) | no | ✅ committato (PR3) | **verified-structural** (ADR-0003 + overlay+report in docs/ops/overlays/) (`elab-scene-v2-candidate-v1cap6esp3.json`: pose 4/4, wire.path 2/2, bookConstraints F1-F6 pass incl. guardia "mai sotto 100Ω", grader onGrid, `electrical: unknown`, `visualMatch: unknown`) | metrica libro FALSIFICATA-OK: I(220)=30.9mA > I(470)=14.5mA > I(1k)=6.8mA. **D4-2 RISOLTO (ADR-0003)**: zone di stress nel wrapper — 220Ω=overdrive (acceso, più luminoso, vita ridotta, warning strutturato), 100Ω=pericolo (pavimento del libro), >100mA=bruciato (esp2 invariato); electrical=pass CALCOLATO; nel catalogo (3/88) + toolbar "sim esp3" + zona visibile in diagnostica | N/A (batteria) | `cropBBox`; verifica umana; passo-passo non esprimibile (valori resistore fuori dalla grammatica step) | overlay/GT → `visualMatch`; review → verified |
| 4 | v1-cap9-esp6 | Lampada RGB con 3 potenziometri | 1/9/71-74 | pp.71-74 COMMITTATE (`apps/studio/public/elab/manuals/vol1/page-07{1..4}-esercizio-9-6.png`) | no | ✅ committato (NOTTE-15) | **verified-structural** (fixture `elab-scene-v2-candidate-v1cap9esp6.json`: pose 7/7 multi-pin centroide, wire.path 16/16, bookConstraints G1-G6 pass, grader strictOnGrid, overlay `docs/ops/overlays/v1-cap9-esp6-{overlay.png,report.json}`; `visualMatch: unknown` — claim structural-only) | solve REALE via wrapper (NOTTE-13): catalogo host sbloccato per potentiometer+rgb-led (il motore li supportava già: _solvePotentiometer/_solveRGBLed); 3 canali accesi con brightness reali e INDIPENDENTI (falsificatori: gamba blu staccata → solo blu off; common staccato → tutto off). Scena circuit-scene/2 dalle figure pp.71-74 = prossimo passo; bridge/renderer ancora fail-closed su multi-pin (onesto) | N/A (batteria) | verifica umana aperta; wiper interattivo (oggi metà corsa fissa) | review umana → `verified-human`; poi wiper regolabile |
| 5 | v2-cap7-esp1 | Scarica condensatore + multimetro | 2/7/67-68 | pp.67-68 estratte (breadboard INTERA orizzontale + multimetro) | no | ⚠️ pdf-only, crop da committare | static-only | mountable; **transitorio RC e multimetro NON supportati dal solve di scena attuale** | N/A (batteria) | board full-size + condensatore + pulsante + multimetro in scena; modello temporale (τ=RC) | test RED su τ: V(t)=V₀·e^(−t/RC) entro tolleranza dichiarata |
| 6 | v2-cap7-esp2 | Scarica con LED rosso | 2/7/69-70 | pp.69-70 estratte | no | ⚠️ pdf-only, crop da committare | static-only | mountable; come sopra + LED come indicatore di scarica | N/A (batteria) | come esp1 + LED path | test RED: LED si spegne con la scarica (soglia Vf) |
| 7 | v3-cap6-esp4 | Due LED che si alternano | 3/6/54-55 | pp.54-55 estratte (breakout + LED blu/rosso + 2×470Ω, pin 6/9; sketch completo nel libro, delay 200ms) | **sì — ELAB Nano Breakout** | ⚠️ pdf-only, crop da committare | static-only | AVR (avr8js ATmega328P): sketch nel subset 5/23 compilabile in-browser | compile-in-browser: subset OK (verificato firsthand) MA board nano-r4 lo salta (`inBrowserCompileSupported:false`) → via precompiled; **HEX RICONCILIATO (PR5)**: record ora punta a `v3-cap6-esp4.hex` (build pin-6 provato dal disassembly `ldi r24,0x06`, sha `d4f9363e…`); `sirena.hex` = pin 8, altro esperimento, quarantenato dal test-verità; variante R4 `v3-cap6-esp4-r4.hex` esiste (Renesas); upload NON verificato su hardware; R4 runtime 0x0074 / DFU 0x0374 coerenti ovunque | componente breakout assente dal renderer di scena; HEX da riconciliare o quarantenare; nota onestà: screenshot IDE del libro mostra board "Nano 33 BLE" | matrix-test HEX: ogni `hexFile` Vol.3 esiste su disco e matcha lo sketch (oggi FAIL atteso) |
| 8 | v3-cap6-esp5 | Costruiamo un semaforo | 3/6/57 | p.57 estratta (3 LED R/G/Y + 3×470Ω, pin 5/6/9, breakout) | **sì — ELAB Nano Breakout** | ⚠️ pdf-only, crop da committare | static-only | AVR: sketch nel subset 5/23 compilabile in-browser | compile-in-browser: subset OK (verificato firsthand) MA board nano-r4 lo salta; **HEX `v3-cap6-esp5.hex` MANCANTE — QUARANTENA CARATTERIZZATA (PR5)**: test che si rompe quando il .hex vero (pin 5/6/9) verrà generato con arduino-cli; `semaforo.hex` esistente è il VECCHIO semaforo pin 5/6/3 — mai spacciarlo per esp5; nessun precompiled AVR/R4 né fast-matcher; upload NON verificato | come esp4 + HEX mancante | come esp4; in più: fetch del hexFile dichiarato → oggi 404 (FAIL onesto) |

### Nota fuori whitelist

`v3-cap6-esp2` (LED esterno pin 13) ha già crop p.051 committato e compila nel subset in-browser, ma **NON è nella whitelist visibile oggi**: non prioritizzarlo salvo blocker dimostrato (ordine severo NOTTE-12).

## Conteggio onesto parità visiva (oggi)

- Reference primaria identificata e verificata firsthand: **8/8** (nessun `blocked-by-missing-reference` a livello pagina).
- Crop pagina committato in repo: **4/8** (esp1 pp.30-31, esp2 p.32, esp3 p.33, esp6 pp.71-74 — NOTTE-15).
- Fixture `circuit-scene/2`: **4/8** (esp1, esp2, esp3, esp6 — esp6 è la prima MULTI-PIN: pot 3-pin + RGB 4-pin, runtime elab-mna).
- `wire.path` autorati: **4/8** (esp1: 2 fili; esp2: 3 fili; esp3: 2 fili; esp6: 16 fili).
- bookConstraints falsificabili: **4/8** (esp1 C1-C5, esp2 E1-E5, esp3 F1-F6 con guardia 100Ω, esp6 G1-G6 net-level con biiezione pot↔470↔canale).
- Passo-passo dedicato con falsificatori: **2/8** (esp1: 4 step; esp2: 3 step).
- Evidenza visiva strutturale (overlay+report, soglia 0.5px): **4/8** = `verified-structural` (esp1, esp2, esp3, esp6 — docs/ops/overlays/). `visualMatch` nelle fixture resta "unknown": il claim è structural-only, MAI CV/umano; rigenerazione: `npx tsx scripts/visual-overlay-report.ts` (drift-guard in VisualOverlayReport.test.ts).
- `verified-human`: **0/8**.
- Arduino end-to-end onesto (compile+HEX+upload con evidenza): **0/2** target AVR — ma esp4 ora ha catena artefatto coerente (sketch pin 6/9 ↔ HEX pin 6 ↔ record), manca solo l'evidenza upload su hardware; esp5 in quarantena dichiarata (HEX da generare).

Nota superficie: il canvas del plugin dentro ElabLab renderizza segnaposto scuri
(pre-esistente, uguale per esp1 e esp2 — verificato con screenshot NOTTE-12);
la superficie visiva book-aligned è il POST-IT Simulation Plugin (SVG scena).

## Prossimi passi vincolati

1. ~~PR2: v1-cap6-esp2 end-to-end~~ FATTO (fixture, sovracorrente onesta, toolbar "sim esp2", e2e screenshot desktop/mobile).
2. ~~PR3: v1-cap6-esp3~~ FATTO fino al gate (crop p.33, fixture, F1-F6, correnti 220/470/1k falsificate OK, conflitto burn caratterizzato). Resta: decisione Andrea D4-2 → poi catalogo/post-it.
3. ~~PR4: breadboard copy system~~ FATTO (helper `sceneAuthoring.ts`, bend-points nel modello dati con `insertBendPoint`, hover node highlight nel post-it, `gradeSceneGeometryStrict` con copertura obbligatoria; procedura ripetibile in docs/ops/BREADBOARD-COPY-SYSTEM-2026-07-13.md).
4. ~~PR5~~ FATTO (parziale onesto): esp4 HEX riconciliato + test-verità `ElabVol3HexTruth`; esp5 quarantena caratterizzata. Restano: generare v3-cap6-esp5.hex + esp5-r4 con arduino-cli (gate: toolchain), scena breadboard v3 con breakout (SVG esiste solo nel plugin: NanoR4Board.jsx), evidenza upload reale.
5. Gate-Andrea: overlay CV (dipendenze), promozione verified-human, board full-size per Vol.2.
