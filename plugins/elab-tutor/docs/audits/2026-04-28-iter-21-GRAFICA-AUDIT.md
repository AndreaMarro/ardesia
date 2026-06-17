# ITER 21 — GRAFICA AUDIT (Caveman terse)

**Data**: 2026-04-28 PM
**Mandate Andrea iter 18 PM**: "MIGLIORA LA GRAFICA"
**Skill set**: /frontend-design /algorithmic-art /web-artifacts-builder /canvas-design /figma-generate-design /design-critique
**Modalita**: readonly audit (NO compiacenza)
**Scope**: Live `https://www.elabtutor.school` + grep `src/components/` `src/styles/`

---

## 1. Live audit screenshots + console findings

**Screenshots**:
- Login wall: `docs/audits/iter-21-grafica-homepage.png` (ELAB2026 chiave univoca, robot mascotte placeholder, gradient navy->lime background, Oswald heading "BENVENUTO IN ELAB TUTOR")
- Lavagna: `docs/audits/iter-21-grafica-lavagna.png` (post-login auto-redirect `#lavagna`, no hash route)

**Console**:
- 1 ERROR: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat:0` HTTP 400 (Edge Function rejection at boot, prima che l'utente scriva)
- 0 warnings DOM/CSS

**Computed styles 5 elementi rilevanti**:
1. **Mascotte UNLIM**: trovato come `minimal-toolbar__btn--unlim` (NON FloatingWindow — e bottone nella minimal toolbar). Live nessuna mascotte 3D/illustrata visibile, solo la chat overlay header "UNLIM". Robot SVG visibile solo in login (placeholder generic, NON kit-faithful).
2. **Toolbar 4 tools**: `minimal-toolbar` class (Select / Wire / Pen / Delete / Undo / Redo) — 6 icone inline SVG `viewBox="0 0 20 20"` in `FloatingToolbar.jsx:24-62` — NON usa ElabIcons.jsx libreria custom. Touch target 48x48 OK.
3. **Modalita switch**: `Gia Montato / Passo Passo / Libero` 3 button glass pill, font 14px Oswald, hover OK.
4. **Pannello sinistra components**: `RetractablePanel` con 8 quick-add (LED, Resistore, Pulsante, Batteria 9V, Potenziometro, Buzzer, LDR, Interruttore). Ogni voce icona inline SVG diversa (NON ElabIcons), 13.3px font.
5. **SVG NanoR4Board**: `hasNanoSVG: false` nello snapshot — non montato in default state ("Gia Montato" tab vuoto pre-experiment). Confermato Resistor + LED renderizzati nello screenshot con palette kit-faithful (resistore beige + LED rosso).

**CSS variables LIVE confermati**:
```
--color-primary: #1E4D8C    OK (Navy ELAB)
--color-accent: #4A7A25     OK (Lime ELAB)
--color-vol1: #4A7A25       OK
--color-vol2: #E8941C       OK
--color-vol3: #E54B3D       OK
--font-sans: "Open Sans" + fallback
--font-heading: "Oswald" + fallback
--touch-min: 56px           OK
--glass-bg: rgba(255,255,255,.88) + blur(12px)  OK
```

**Anomalia font live**: alcuni button computati con `fontFamily: Arial` (es. `Manuale`, `Video`, `Fumetto` header — 13.3px). Open Sans NON applicato a header pills => CSS specificity gap o font-face load miss in produzione.

---

## 2. Palette analysis token vs hardcoded

**Design tokens definiti**: `src/styles/design-system.css:14-348` — eccellente coverage (235+ CSS vars, 4 volume gradient, syntax tokens, glass tokens).

**Hardcoded brand hex (VIOLAZIONE token-based)**:
```
grep -rn "#1E4D8C\|#4A7A25\|#E8941C\|#E54B3D" src/ --include="*.css" --include="*.jsx" | wc -l
=> 794 occorrenze
```

794 hex hardcoded che dovrebbero essere `var(--color-primary)` etc. Significa che il design system esiste ma e bypassato in maggior parte dei file.

**Hardcoded color non-brand (lavagna only)**:
- `CapitoloPicker.module.css:10` `background-color: #fafbfc` (dovrebbe `var(--color-bg-secondary)`)
- `CapitoloPicker.module.css:105` `color: #1a1a1a` (dovrebbe `var(--color-text)`)
- `CapitoloPicker.module.css:146` `color: #3a6020` (verde inventato, non in palette)
- `CapitoloPicker.module.css:154` `color: #c07010` (arancio inventato)
- `CapitoloPicker.module.css:162` `color: #c93f30` (rosso inventato, varia da `--color-vol3 #E54B3D`)
- `LessonBar.module.css:106` `background: #1E4D8C` (dovrebbe var)
- `UnlimBar.module.css:88` `background: #3d6620` (verde inventato)
- 19 sample analoghi solo in `lavagna/`

**Verdict**: design system esiste ma componenti recenti (lavagna redesign S1-S8) reinventano colori invece di consumare token. Non e shocking violation, ma e debt che si accumula.

---

## 3. Icon system inventory custom vs generic

**ElabIcons.jsx** (`src/components/common/ElabIcons.jsx`): 30+ icone custom inline SVG, stroke-based, currentColor, role="img", aria-hidden. Eccellente design system iconografico.

```
grep -rln "ElabIcons" src/ | wc -l
=> 9 files import ElabIcons
```

**Anti-pattern Morfismo VIOLATO**: `FloatingToolbar.jsx:24-62` usa 7 inline `<svg viewBox="0 0 20 20">` che ricalcano material-design generic (cursor, pencil, undo, redo, trash) NON derivate da volumi.

```bash
grep -c "ElabIcons\|from.*icons" src/components/lavagna/FloatingToolbar.jsx
=> 0
```

**Files che dovrebbero importare ElabIcons (campionatura)**:
- `FloatingToolbar.jsx` — 6 inline SVG
- `MascotPresence.jsx` — TBD
- `LessonBar.jsx` — TBD
- `RetractablePanel.jsx` — 8 component preview SVG inline
- `AppHeader.jsx` — TBD

**Note positiva**: NO MUI (`_hasMUI: false`), NO tailwind reset (`_hasTailwindReset: false`), NO bootstrap import. Tutto custom CSS modules. Triplet coerenza tecnica preservata.

**Iconografia volumi**: NESSUNA evidenza. Volumi cartacei usano illustrazioni hand-drawn / stilizzate — gli icon ELAB sono Lucide/Feather-style generic. Mandate iter 18 PM "iconografia derivata volumi" NON soddisfatta.

---

## 4. SVG components kit-faithfulness

**Inventario simulator components** (`src/components/simulator/components/`):
- 21 SVG components: NanoR4Board, BreadboardFull/Half, Led, Resistor, Capacitor, Diode, Battery9V, BuzzerPiezo, LCD16x2, MosfetN, MotorDC, Multimeter, PhotoResistor, Phototransistor, Potentiometer, PushButton, ReedSwitch, RgbLed, Servo, Wire, Annotation

**Hex hardcoded in simulator SVGs**:
```
grep -rn "fill=\"#" src/components/simulator/components/ --include="*.jsx" | wc -l
=> 132 occorrenze
```

**Distinct hex sample (132 fills)**:
- Kit-faithful: `#1E4D8C` (Navy, board PCB), `#1B5E20` `#2E7D32` (verdi PCB), `#F3C65C` (LED yellow halo), `#9C874E` (resistor body brown)
- Generici / inventati: `#3498db` (flat-UI blue, Twitter-Bootstrap-era), `#3570C0`, `#2A5FA0`, `#0D6B40`, `#3A3A3A`
- Neutrali OK: `#000000` `#FFFFFF` `#1A1A1A` (shadow/highlight)

**Verdict**: NanoR4Board PCB color `#1E4D8C` matcha kit Omaric Arduino Nano blue. Resistor body `#9C874E` matcha tan resistor reale. LED isOn `#FF3333` glow OK. MA: `#3498db` Flat-UI azzurro NON in palette ELAB e NON kit-faithful. Frizione tra "kit Omaric exact replica" claim e "library clipart hex". Non disastro ma audit fisico vs simulatore richiesto.

**Test Morfismo (CLAUDE.md sezione)**: prendi screenshot lavagna + foto Arduino Nano kit Omaric. Sembrano "stesso prodotto"? Risposta onesta: VICINO ma non perfetto. PCB color OK, ma componenti circuit board secondari (chip) usano hex generic.

---

## 5. Touch + WCAG metrics

**Touch target audit (live)**:
- 1 button < 44x44 trovato: `Accendi il tuo primo LED` (204x37) — H1 main esperimento titolo, 37px height < 44 minimum iOS HIG
- Tutti gli altri 24 buttons campionati >= 44x44 OK

**Codebase scan** (CLAUDE.md sprint S iter 12 §3): "103 touch<44 + 1326 fontSize<14 JSX". Confermato qui: 19 font<13 in lavagna CSS only.

**WCAG AA contrast**:
- Testo body `#1A1A2E` su `#F7F7F8` => 16.4:1 PASS
- Volume orange `#996600` text on white => 4.94:1 PASS (corretto da G42)
- Volume red `#C62828` text on white => 7.1:1 PASS
- `--color-text-muted #475569` su `#F0F4F8` => 5.5:1 PASS (ATOM-002 19/04)

**Concerns**:
- Header pills "Manuale/Video/Fumetto" font Arial 13.3px, color rgba(255,255,255,.85) su gradient navy. Contrast variabile. 13.3px sotto minimo 14px CLAUDE.md regola 8.
- Login subtitle "Simulatore di elettronica e Arduino per la scuola" rendered grey su white card — readable OK ma small.

---

## 6. Anti-pattern Morfismo violations list

**Da CLAUDE.md "Anti-pattern Morfismo (vietati)"**:

| # | Anti-pattern | Stato | Evidenza |
|---|--------------|-------|----------|
| 1 | Componenti SVG palette generica | PARZIALE | `#3498db` Flat-UI in simulator SVGs |
| 2 | UNLIM parafrasa libro | N/A | (linguistico, non grafica) |
| 3 | Capitoli software titoli inventati | N/A | (linguistico) |
| 4 | Esperimenti software-only | N/A | (strutturale) |
| 5 | **Icone material-design generic vs derivate volumi** | **VIOLATO** | `FloatingToolbar.jsx` 6 inline SVG Lucide-style; ElabIcons usa 30+ icone Feather/Lucide-style stroke 2 — NON volume-illustration derivative |
| 6 | Layout simulatore non riconducibile a kit | OK | Breadboard + Nano + LED snap-fit kit Omaric |

**Verdict**: Anti-pattern #5 e quello piu problematico per mandate iter 18 PM. ElabIcons.jsx in se e ben fatto ma NON deriva da illustrazioni volumi cartacei (Davide Fagherazzi). Iconografia oggi e "Feather Icons clean stroke" — funziona ma non e differenziatore Morfismo.

---

## 7. Score grafica honest current state

| Dimensione | Score | Note |
|---|---|---|
| Palette coerenza volumi | 7/10 | Token DS ottimi (235+ vars), ma 794 hex hardcoded bypassano DS. Lift facile via codemod. |
| Iconografia derivata | **3/10** | ElabIcons stroke-2 generic Feather-style, NON volume-illustrative. FloatingToolbar usa 6 inline SVG, non importa ElabIcons (altro problema). |
| SVG components kit-faithful | 6/10 | NanoR4Board navy OK, resistor brown OK, LED red OK. Ma `#3498db` flat-UI inventato in alcuni componenti. Audit foto kit fisico vs SVG mai fatto rigorosamente. |
| Layout morfico LIM | 6/10 | Glass overlay UNLIM + RetractablePanel + minimal-toolbar funzionano. Ma mandate Sense 1.5 "morfismo per docente/classe/kit" NON visibile a runtime — layout statico per tutti. |
| Touch usability | 7/10 | 56px touch-min token OK. 1 button live <44px (H1 title 37px). 103 touch<44 codebase Sprint T iter 15+ debt. |
| WCAG AA | 7/10 | Contrasti corretti G42+ATOM-002. 19 font<13 lavagna CSS, 1326 fontSize<14 JSX (debt Sprint T). |
| Glassmorphism Lavagna (positive iter 17) | 8/10 | Glass tokens definiti, applicati UnlimBar + minimal-toolbar. Ben fatto. |

**SCORE GRAFICA AGGREGATO ONESTO**: **6.0/10**

NO compiacenza: lavagna funziona, palette esiste, ma:
1. Iconografia generic non differenziatore (3/10)
2. 794 hex hardcoded vs token DS (debt accumulato)
3. Morfismo Sense 1.5 (CLAUDE.md iter 10) NON visible runtime — layout fisso per tutti
4. Mandate iter 18 PM "GRAFICA OVERHAUL" NON soddisfatto da iter precedenti — ancora aperto

---

## 8. Top 10 fix concrete iter 22+

| # | Fix | File:line | Severity | LOC | Effort |
|---|---|---|---|---|---|
| 1 | FloatingToolbar usa ElabIcons (rimuovi 6 inline SVG) | `src/components/lavagna/FloatingToolbar.jsx:24-62` | P1 | -40 +12 | 30min |
| 2 | Codemod 794 hardcoded brand hex -> CSS vars | `src/**/*.{css,jsx}` | P1 | ~800 sost. | 2-3h script |
| 3 | Sostituisci `#3498db` `#3570C0` `#0D6B40` simulator SVG con palette ELAB | `src/components/simulator/components/*.jsx` | P0 (Morfismo violation) | ~30 sost. | 1h |
| 4 | Crea `VolumeIllustrationIcon` set: 8 icone derivate da illustrazioni Davide Fagherazzi (LED stilizzato volume style, breadboard hand-drawn, batteria etc.) | NEW `src/components/icons/VolumeIcons.jsx` | P0 (mandate iter 18) | +500 | 6h (1h Davide source asset + 5h vector trace) |
| 5 | Header pills `Manuale/Video/Fumetto` font Arial -> Open Sans + 14px min | `AppHeader.module.css` (TBD line) | P1 | 3 sost. | 15min |
| 6 | H1 esperimento title 37px -> 44px min height | `LessonBar.module.css` o `AppHeader` | P1 | 1 sost. | 10min |
| 7 | Implementa Morfismo runtime stub: detect `kit-version` localStorage e mostra RetractablePanel components diversi | `RetractablePanel.jsx` + `useKitContext.js` NEW | P0 (mandate Sense 1.5) | +120 | 4h |
| 8 | Mascotte UNLIM 3D illustrated (NON robot generic placeholder login screen) — sourcing illustrazione volumi o commission Tea | `src/assets/mascotte/` NEW | P1 | +1 asset | 4h Tea |
| 9 | Edge Function `unlim-chat` HTTP 400 boot error fix (preflight inutile o invalid auth gate) | `supabase/functions/unlim-chat/index.ts` | P1 | TBD | 1h |
| 10 | Audit foto kit fisico Omaric vs SVG simulator (componente per componente, 21 totali) -> diff matrix in `docs/audits/kit-vs-svg-matrix.md` | NEW doc | P2 | +200 | 3h Andrea/Tea fisico |

**Effort totale**: ~25h (6 P0/P1 + 4 P2). Distribuibile 3 sessioni.

---

## 9. Mockup proposal /impeccable:overdrive direzioni (text describe, NOT execute)

3 direzioni per overhaul grafico iter 22-24:

### Direzione A — "Volume Vivente" (preferita per Morfismo)
- Mascotte UNLIM = illustrazione 2D stile volumi cartacei (Davide F. style guide), animata SVG (idle breath + parla mouth-open)
- Iconografia 30+ icone disegnate hand-drawn ink stroke 2.5px, palette navy/lime/orange/red volumi
- NanoR4Board overlay kit-photo blend mode: SVG sopra foto kit reale Omaric, alpha 70%, alterna view "Schema" / "Foto"
- Background lavagna: sottile texture carta volume cartaceo (paper grain SVG filter)
- Differenziatore vs Tinkercad: kit-coupled photorealism + handcrafted volume aesthetic

### Direzione B — "Educational Glassmorphism v2"
- Estende glassmorphism iter 17 esistente: layered translucent panels con blur
- Mascotte UNLIM 3D mesh stylized (Three.js low-poly OR LottieJS animation)
- Iconografia material-symbols-rounded variabili (peso 300-700, fill on hover)
- Color = current ELAB palette + saturated accent gradients per stato (UNLIM thinking = lime gradient pulse)
- Differenziatore vs Wokwi: motion design + voce + fluid morphic UI

### Direzione C — "Children Whimsical"
- Mascotte UNLIM character costante big-eyed friendly robot (commission illustrator) presente sempre top-right
- Iconografia rounded chunky (cornerRadius 4 su 24px viewBox), saturated palette
- Sfondi pannelli pastel tints volumi gradient (vol1 lime soft, vol2 peach, vol3 coral)
- Sound feedback morbidi su click/hover (Tea audio assets)
- Differenziatore vs LabsLand: warm friendly vs cold-lab vibes

**Raccomandazione iter 22+**: Direzione A "Volume Vivente". Chiede investimento iniziale Davide F. style guide assets MA risolve mandate "iconografia derivata volumi" + Morfismo Sense 2 triplet coerenza. Direzione B fattibile in parallelo (no asset blocker). Direzione C richiede commission e tempo (defer).

---

## 10. Comparison vs Tinkercad / Wokwi / LabsLand competitor

| Dim | Tinkercad | Wokwi | LabsLand | ELAB attuale | ELAB con Direzione A |
|---|---|---|---|---|---|
| **Palette** | Autodesk corporate gray/cyan | Cyber dark green/black | Academic gray/blue | ELAB navy/lime/orange/red volumi | Volume-derived saturated |
| **Iconografia** | Material rounded | Custom but generic | FontAwesome | Feather/Lucide stroke (generic) | **Hand-drawn volume style (UNICO)** |
| **Mascotte/Tutor** | Nessuna | Nessuna | Tutor live remoto | UNLIM chat header testuale | **UNLIM character SVG animato** |
| **Photo-kit blend** | NO (vector only) | NO (vector pixel) | Lab fisico remoto | NO | **SVG + foto Omaric blend** |
| **Morfismo runtime** | Static UI | Static UI | Static UI per dispatch | Static (claim Sense 1.5 NON live) | Adaptive docente/classe/kit |
| **Italian native + scuola** | EN-only | EN-only | Multilingua ma generic | IT + plurale "Ragazzi," + cita Vol/pag (UNICO) | Same + visual quote-from-volume |
| **Diff visivo** | Pulito-corporate | Tech-hacker | Lab-academic | Modern-clean (no signature) | **Volume-coupled handcraft** |

**Posizionamento attuale**: ELAB e "modern-clean educational SaaS" — competente ma indistinguibile da generic ed-tech (Khan-style). Mandate iter 18 PM richiede signature visivo che renda copy-cat impossibile (CLAUDE.md "differenziatore competitivo 2026+: chiunque potra costruire Arduino tutor — ma NON puo copiare kit Omaric + volumi cartacei + Morfismo coerente").

**Posizionamento target con Direzione A**: ELAB e "il software dello stesso autore dei volumi cartacei". Volume-vivente aesthetic + kit-coupled SVG + handcrafted iconografia = differenziatore visivo immediato che competitor LLM-generated NON puo replicare senza accesso volumi originali.

---

## Conclusion onesta

- **Score grafica current**: 6.0/10
- **Mandate iter 18 PM "GRAFICA OVERHAUL"**: NON soddisfatto. Lavoro iter 17 glassmorphism positivo (8/10 quel sub-aspect) ma incompleto.
- **Top 3 azioni iter 22+**: (1) codemod 794 hex -> token, (2) Volume Illustration Icon set (Davide F. assets + vector trace), (3) Mascotte SVG character animato.
- **Effort 25h distribuibile 3 sessioni**.
- **NO compiacenza**: design system esiste, ma uso bypassato. Iconografia generic Feather. Mascotte placeholder. Morfismo Sense 1.5 claim non live runtime.

**File audit**: `docs/audits/2026-04-28-iter-21-GRAFICA-AUDIT.md`
**Screenshots**: `docs/audits/iter-21-grafica-{homepage,lavagna}.png`
**Auditor**: Claude (Opus 4.7 1M context) caveman terse mode
**Deadline**: 13 min (rispettata)
