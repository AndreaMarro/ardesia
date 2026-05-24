# Deep Analysis — `v1-cap6-esp1` (Andrea 17-checkpoint)

**Sorgente**: visual analysis PNG render 200 DPI Vol1 pag.29-31 + textual extracted vol1.txt + repo experiments-vol1.js. Cross-check pendente con codex (background). Andrea NON COMPIACERMI.

---

## Identità + scope

| Campo | Valore |
|-------|--------|
| Volume | 1 |
| Capitolo | 6 — Cos'è il diodo LED? |
| Esp libro | ESPERIMENTO 1 |
| Pagine | 29, 30, 31 |
| File PDF | VOL1_ITA_ COMPLETO V.0.1 GP.pdf |
| Reference PNG | reference/vol1/v1-cap6-esp1/page-{029,030,031}.png |
| Repo data | src/data/experiments-vol1.js |
| bookGeometry | src/data/book-geometry/v1-cap6-esp1.bookGeometry.json (draft session prima) |

---

## Andrea 17-checkpoint verbatim

### 1. Breadboard — orientamento + posizione

**Libro pag.30-31 visivo**:
- Orientamento: **ORIZZONTALE** (asse lungo orizzontale, ~30 colonne fronti)
- Posizione: **DESTRA della scena** (occupa ~60% larghezza pagina)
- Scala: half-size (mezzo) — visibile divisione centrale orizzontale
- Rail visibili: top+ (rossa) + top− (azzurra/blu) + bot+ (rossa) + bot− (blu) — convenzione kit Omaric
- Numerazione colonne: visibile leggera (numeri piccoli) — Andrea verificare se app simulator mostra numerazione

**App attuale (handoff)**:
- bb orizzontale half — **match libro** ✅
- Andrea preferenza handoff "Vol1 bb verticale" REVERTED (layout bug round 11)
- Score: OK come libro per demo

### 2. Batteria 9V — orientamento + posizione

**Libro pag.30-31 visivo**:
- Forma: rettangolo VERTICALE con "9V" stampato sul corpo (font bold)
- Clip: rettangolare separato sopra batteria, terminali (+/−) escono RIGHT verso bb
- Posizione: **SINISTRA della scena**, allineata con bb (centro verticale)
- Distanza da bb: ~50px (compatto, non lontano)
- Lato entrata fili clip: **DESTRO** (verso bb)
- Polarità: + e − visibili come "+" e "−" piccoli su clip

**App attuale (handoff round 12 + selection bbox)**:
- Battery9V SVG `renderMode='clip_simplified'` + pin coords positive=(9,-30), negative=(9,-10)
- COMP_SIZES w=85, h=40, ox=-28.5, oy=-20 (selection bbox aggiornata)
- Orientamento verticale **match libro** ✅
- Pin clip verbatim libro OK

### 3. Arduino — N/A Vol1

### 4. Orientamento OGNI componente

#### LED libro
- **Posizione**: zona destra bb, ~colonna 7
- **Orientamento**: VERTICALE — gambetta lunga (anodo) ALTO, gambetta corta (catodo) BASSO
- **Gambe**: divaricate (visibili 2 gambe distinte, NON bridge)
- **Colore corpo**: rosso illustrativo (libro dice "sceglilo del colore che ti piace", default rosso)
- **Quanto stoltamente proiettate**: leggera divergenza ~10-15° vs verticale puro

#### Resistore libro
- **Posizione**: zona centro-bb, tra rail top+ e zona sotto
- **Orientamento**: VERTICALE (corpo verticale, terminali alto-basso)
- **Lunghezza**: 5-7 colonne span verticale (~37-52px)
- **Bande**: testo libro dice "Giallo Viola Marrone" = 3 bande NO oro (4-band E12 standard)
- **Corpo**: cilindrico illustrativo color marrone chiaro/beige

**ATTENZIONE — discrepanza handoff vs libro**:
- Handoff afferma "R pin distance 5 col (37.5px), body 8px, leads 14.75px each side, 4 color bands E12 standard" → orientamento ORIZZONTALE
- Libro pag.30 illustrazione mostra R orientato VERTICALE
- **VERIFICARE**: handoff sbaglia orientamento OR app deve ruotare R 90° per match libro?

### 5. Dimensioni relative

| Componente | Libro proporzione | App proporzione | Match? |
|------------|-------------------|-----------------|--------|
| Breadboard | ~60% larghezza scena | TBD verify SVG bb width | TBD |
| Batteria | ~15% larghezza scena (alta) | bb scale=85x40 (handoff) | TBD |
| LED | ~3% larghezza scena (piccolo) | ~12x18px standard | OK |
| Resistore | ~5% larghezza scena (sottile) | ~37x8px (R5col) | TBD orientation |

### 6. Compatibilità SVG attuali

**Componenti app esistenti**:
- `Battery9V.jsx` — verticale + clip OK (handoff aggiornato) → **MATCH libro** ✅
- `Resistor.jsx` — orientamento di default orizzontale (5-col span 37.5px) → **MISMATCH** vs libro verticale
- `Led.jsx` standard splay+ — gambe divaricate → **MATCH** libro (gambe divaricate visibili)
- `LedBridge` variant (handoff esp1 usa questo) — attraversa gap → **MISMATCH** libro

**Decisione**:
- Switch da `led-bridge` a `led` standard splay+ per esp1 ✅
- Ruotare R 90° (verticale) OR mantenere orizzontale se demo accetta (P1 trade-off)

### 7. Numero cavi visibili libro vs app

**Libro pag.30 (3 step illustrazioni)**:
- Step 1 (clip+rail): **1 wire rosso** visibile (clip+ → bb rail top+)
- Step 2 (+R): **1 wire rosso** + R inserito (no nuovo wire)
- Step 3 (+LED): **1 wire rosso** + R + LED inseriti (no nuovo wire)

**Libro pag.31 final (MAGIA)**:
- **2 wire** visibili: 1 rosso (bat+ → rail top+) + 1 nero (bat− → bb LED-cathode-column)

**Libro pag.31 variante colore** (esp1 estensione):
- Stesso layout, LED colore diverso, **2 wire** stessi

**App handoff topology**:
- **4 wires totali**: W1 red (bat+→bus-top-plus-1), W2 red (bus-top-plus-2→a2), W3 black (f7→bus-bot-minus-7), W4 black (bus-bot-minus-1→bat−)
- W2 + W3 = rail jumpers app-only (NON visibili libro)
- **Anti-pattern workflow-v2 fase 8**: 2 extra visibili wires

### 8. Colori cavi

- Libro: rosso + nero (kit Omaric standard)
- App: rosso + nero match ✅
- Wire "altro colore"/colorati NON applicabile Vol1 esp1

### 9. Punto partenza/arrivo

**Libro pag.31 final**:
- W1 rosso: clip+ → bb rail top+ (colonna sinistra rail)
- W2 nero: clip− → bb cathode-column (colonna corrispondente foro catodo LED, zona bottom-section)

**App**:
- W1 rosso: bat1:positive → bb1:bus-top-plus-1 (match ✅)
- W2 rosso EXTRA: bus-top-plus-2 → a2 (rail jumper, NON libro)
- W3 nero EXTRA: f7 → bus-bot-minus-7 (rail jumper, NON libro)
- W4 nero: bus-bot-minus-1 → bat1:negative (match ✅)

**Conclusione**: 2 extra wire = anti-pattern. Refactor → `hiddenElectricalConnections`.

### 10. Curve cavi

**Libro pag.31**:
- W1 rosso: curva morbida (bezier-like), parte sotto clip+, sale leggermente, va orizzontale verso bb, entra rail dall'alto-sinistra
- W2 nero: curva morbida specchiata (parte sotto clip−, scende, va orizzontale verso bb, entra column dal basso)

**App**: handoff descrive wire come "diretti from→to" senza curve esplicite — verify rendering effettivo.

### 11. Angoli cavi rispetto bb

- W1 entra rail top+ dall'alto → angolo ~90° (perpendicolare a rail)
- W2 entra column cathode dal basso → angolo ~90° (perpendicolare a column)

### 12. Sovrapposizioni

- Libro pag.31: nessuna sovrapposizione tra wire e componenti
- Wire passano LATERALMENTE bb, non sopra LED/R
- Path libero

### 13. Compattezza generale

- Libro: circuito MOLTO compatto (~60-70% larghezza pagina, ~30% altezza)
- Distanza batteria-bb: minimo (clip→rail diretta)
- LED+R molto vicini (consecutive columns)

### 14. Compattezza su transform (Andrea principio)

**Mandate**: bb anchor, componenti vincolati, wire vincolati a pin, batteria/Arduino satelliti.

**App attuale**: PlacementEngine.js (822 righe) gestisce positioning. Verify behavior:
- Rotation: TBD test (Andrea NON ratify ancora)
- Translation: TBD
- Zoom: TBD
- Responsive: TBD

### 15. Funzionamento elettrico

**Libro circuit**:
- bat+ (9V) → rail top+ → R 470Ω → LED anodo → LED catodo → cathode-column → bat−
- I = (9 - V_LED_red ~2.0) / 470 = ~14.9mA (sicuro per LED standard 20mA max)
- LED accende ✅

**App handoff**:
- Stessa netlist effettiva (via rail jumpers app-only)
- Solver MNA/KCL calcola correttamente
- LED accende in sim ✅

**Polarità**: LED anodo gambetta-lunga → R via column → MATCH libro

### 16. Coerenza codice

N/A Vol1 (no Arduino).

### 17. Classificazione P0/P1/P2

#### P0 bloccante demo
- **P0-1**: Wire visibility refactor (4 → 2 visibili). Rail jumpers app-only → `hiddenElectricalConnections`. ANTI-PATTERN workflow-v2 fase 8.
- **P0-2**: LED switch `led-bridge` → `led` standard splay+ (gambe divaricate libro)
- **P0-3**: Validare orientamento R (libro verticale vs app orizzontale). Andrea decide.
- **P0-4**: Reference PNG full pages CAPTURED. State-crop singoli (page-030-step-01, etc.) ANCORA PLANNED — richiedono UI cropper Sprint B fase 3.

#### P1 importante
- **P1-1**: R color bands libro dice 3 bande (Giallo Viola Marrone). App ha 4 bande E12 (giallo-viola-marrone-oro). Decide: aderire testo libro (3) o standard E12 (4)?
- **P1-2**: Wire curve bezier morbide libro vs path automatici app
- **P1-3**: Polarità LED visiva: app SVG mostra gambetta lunga/corta visivamente distinguibili?

#### P2 rifinitura
- P2-1: Antialiasing wire
- P2-2: Battery clip exit-point pixel-perfect
- P2-3: bb rail color match Omaric kit (Andrea ratify)

---

## Verdetto deep-analysis

**NON PRONTO** confermato Sprint A audit.

**Priorità refactor (workflow-v2 mandate)**:
1. Switch led-bridge → led standard (P0-2)
2. Refactor wire visibility 4→2 (P0-1)
3. Andrea decide R orientation libro vs app (P0-3)
4. Verify compattezza su transform (P0 verify, NOT yet validated)
5. Reference state-crop PNG (Sprint B fase 3 cropper UI)

**Codex convergence**: pending background output. Quando codex completa → update doc con eventuali correzioni/aggiunte.
