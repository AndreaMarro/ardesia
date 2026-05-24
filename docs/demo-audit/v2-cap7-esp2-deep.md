# Deep Analysis — `v2-cap7-esp2` (Andrea 17-checkpoint)

**Sorgente**: PNG render Vol2 pag.69-71 + textual + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 2 — Cap.7 condensatori (continua) |
| Pagine | 69, 70, 71 |
| Reference PNG | reference/vol2/v2-cap7-esp2/page-{069,070,071}.png |
| Tipo | Scarica cap con LED + R serie (carica/scarica visibile via LED brightness) |

---

## Build sequence libro completa (8 step illustrati)

**Pag.69**:
- Step 1: pulsante a cavallo gap + batteria 9V sotto-sx + MM destra + 2 wire bat→bb (rosso+nero) — circuito base alimentato
- Step 2: cap accanto pulsante (negativo basso, pos al lato pulsante)

**Pag.70**:
- Step 3: cap inserito (replica step 2 più chiaro)
- Step 4: filo cap- → bat- aggiunto
- Step 5: R 1kΩ aggiunto tra cap+ e altro punto bb destra

**Pag.71**:
- Step 6: LED collegato (anodo a R-libero, catodo zona post-gap)
- Step 7: filo LED- → bat- aggiunto
- Step 8: MM probes (rosso su cap+, nero su cap-)

**Final state**: cap carica con pulsante premuto (LED si accende via R 1kΩ), rilascia → cap scarica via LED+R serie (LED fade out lentamente)

---

## Andrea 17-checkpoint

### 1. Breadboard
- FULL SIZE orizzontale (eredita Vol2 esp1) ✅

### 2. Batteria 9V
- Verticale SOTTO-SINISTRA bb (eredita Vol2 esp1 posizione) ✅

### 3. Arduino
- N/A

### 4. Orientamento componenti

#### Cap
- A cavallo gap centrale, verticale, neg basso ✅ match Vol2 esp1
- Polarità marker visibile

#### Pulsante
- A cavallo gap, 4-pin ✅

#### Resistore 1kΩ
**Libro pag.70 step 5**:
- **Orientamento**: ORIZZONTALE (corpo orizzontale sopra bb post-gap area)
- **Posizione**: a destra del cap, tra cap+ pin (top section) e altro pin top section
- **Spazio span**: ~5 colonne (handoff dice a14-a19)
- **Bande color**: 1kΩ = marrone-nero-rosso-oro (E12 4-band) — verify libro illustrazione bands visibili

#### LED rosso
**Libro pag.71 step 6**:
- **Posizione**: zona destra bb post-gap (anodo a R libero, catodo bot section)
- **Orientamento**: verticale (gambe divaricate)
- **Colore**: rosso (verbatim libro "un LED rosso")

#### MM
- Destra bb ✅ match esp1
- Display animato durante carica/scarica

### 5. Dimensioni relative
- Stesso esp1 + LED+R aggiuntivi

### 6. Compatibilità SVG
- Tutti componenti esp1 + LED standard + R 1kΩ ✅

### 7. Numero cavi visibili libro

**Pag.71 step 8 (final)**:
- W1 rosso: bat+ → bus rail top+
- W2 nero: bus rail bot- → bat-
- W3 colorato: pulsante → cap+ (filo "colorato")
- W4 filo: cap- → bat- (verbatim "Collega il negativo del condensatore al negativo della batteria con un filo")
- W5 filo: LED- → bat- (verbatim "Collega il negativo del LED al negativo della batteria con un filo")
- W6 probe rosso MM: cap+ → MM+
- W7 probe nero MM: cap- → MM-

**Conteggio**: ~7 wire visibili (più "tre fili colorati" verbatim materiali = i 3 fili = W3, W4, W5)

**App handoff (esp2 Vol2)**:
- 8 connections totali (W1-W8)
- W1: bat+ → bus-top-plus-1 ✅
- W2: bus-top-plus-10 → a10 (RAIL JUMPER app-only NON libro)
- W3: c12 → c14 (btn out → cap+) ✅
- W4: f14 → bus-bot-minus-14 (RAIL JUMPER OR libro filo?)
- W5: f19 → bus-bot-minus-19 (LED catodo → GND, MATCH libro?)
- W6: bus-bot-minus-1 → bat- ✅
- W7: mm probe+ → b14 ✅
- W8: mm probe- → g14 ✅

**Discrepanza**:
- W2 = app-only rail jumper, NON libro
- W4 + W5 + W6 vs libro 2 "fili" + bat-: app spezza in 3 wire (catodo→rail, rail-jumper, rail→bat) vs libro mostra come 2 fili separati (cap-→bat-, LED-→bat-) sotto la bb
- **Anti-pattern wire-visibility 1-2 extra**

### 8. Colori cavi

**Libro "tre fili colorati"** (materiali pag.69):
- Filo 1: pulsante → cap+ (orange?)
- Filo 2: cap- → bat-
- Filo 3: LED- → bat-

**App**:
- W3 default red? — verify color match
- W4, W5 black/red mix — verify

### 9. Punto partenza/arrivo cavi
- W1 rosso: clip bat+ → bb rail top+
- W2 nero: bus rail bot- → clip bat-
- W3 filo colorato: pulsante e12 → cap+ pin (e14 area)
- W4 filo: cap- (f14) → bat- (via bus bot- bb)
- W5 filo: LED- (f19) → bat- (via bus bot- bb)
- W6 probe MM+: cap+ (b14) → MM+ ingresso
- W7 probe MM-: cap- (g14) → MM- ingresso

### 10. Curve cavi

**Libro pag.71**:
- W1, W2 batteria: bezier morbide simmetriche
- W3 colorato: short orizzontale through bb (top section)
- W4, W5: sotto la bb, curve lunghe verso batteria neg
- W6, W7 probes: lunghi da MM laterale destra

### 11. Angoli
- 90° entrata bb (perpendicolari)
- Probes liberi (45° o curva libera)

### 12. Sovrapposizioni
- Libro pag.71: W4 e W5 si avvicinano in fascia inferiore bb verso batteria — potenziali parallel ma non sovrappongono LED/cap

### 13. Compattezza
- Più componenti di esp1 = scena più affollata
- bb centrale + MM destra + bat sotto-sx + LED+R aggiunti → leggermente più ampio
- Ancora compatto entro 80% larghezza pagina

### 14. Compattezza su transform
- Eredita esp1 (bb anchor + satelliti)

### 15. Funzionamento elettrico

**Libro circuit**:
- **Premi pulsante**: 9V → pulsante chiuso → cap+ → cap carica + R 1kΩ → LED anodo → LED catodo → bat- (chiuso loop carica)
  - I = (9V - V_LED ~2V) / 1000 = 7mA → LED brightness medio
  - Cap carica fino ~9V (cap blocked DC steady state)
- **Rilascia pulsante**: pulsante apre, cap rimane carico ~9V
  - Cap si scarica attraverso R+LED in serie verso bat- via cap- → LED brightness scende esponenzialmente (RC discharge, tau = R*C = 1000 * 1000e-6 = 1s)
  - MM mostra scarica curve simulata
  - LED fade out in ~3-5τ = 3-5s

**App attuale**:
- Solver MNA RC + LED diode model — verify dynamic discharge correttamente modellato
- LED brightness rendering proportional a I(t) durante scarica
- MM display animato

### 16. Coerenza codice
- N/A

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: Solver RC discharge dynamic + LED brightness curve (TBD verify implementation)
- **P0-2**: Wire visibility refactor 8→7 (W2 rail jumper → hidden)
- **P0-3**: 3 fili colorati distinct colors (not all red/black)
- **P0-4**: LED switch led-bridge → led standard (eredita Vol1)
- **P0-5**: Cap polarità marker visibile
- **P0-6**: MM giallo libro-style
- **P0-7**: bb FULL variant (eredita esp1)
- **P0-8**: 8 build steps lesson-path match libro sequence
- **P0-9**: Reference PNG pag.69-70-71 CAPTURED ✅

#### P1 importante
- **P1-1**: R 1kΩ orientation orizzontale (match libro)
- **P1-2**: R bands SVG match libro (1k = brown-black-red-gold E12)
- **P1-3**: LED fade-out animation realistic RC curve
- **P1-4**: MM display tensione cap scende dinamico
- **P1-5**: UNLIM commentary 8-step sequence

#### P2
- P2-1: Stati intermedi visualizzazione (10%, 50%, 90% carica)
- P2-2: Suono click pulsante

## Verdetto

**NON PRONTO**. Esperimento PIÙ COMPLESSO di Vol1 — richiede:
- RC dynamic discharge solver corretto
- LED brightness curve realistic
- 8 build steps match libro
- Asset SVG MM/cap/R/LED tutti libro-style
- Wire visibility refactor

**Priorità Sprint E**:
1. Solver RC discharge dynamic (vs static DC)
2. LED brightness rendering animato
3. MM display animato scarica
4. Asset complete suite (MM giallo + cap + R orizzontale + LED standard)
5. 8 build steps lesson-path
6. Wire visibility refactor
