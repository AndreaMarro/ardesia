# Deep Analysis — `v1-cap6-esp2` (Andrea 17-checkpoint)

**Sorgente**: visual PNG Vol1 pag.32 + textual vol1.txt + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 2 — Cos'è il diodo LED? |
| Pagine | 32 |
| Reference PNG | reference/vol1/v1-cap6-esp2/page-032.png |
| Tipo | Anti-pattern educativo (LED senza R = brucia) |

## Andrea 17-checkpoint verbatim

### 1. Breadboard
- Orizzontale half-size (stesso esp1) ✅

### 2. Batteria 9V
- Verticale sinistra clip-right (stesso esp1) ✅

### 3. Arduino
- N/A Vol1

### 4. Orientamento componenti

**Libro pag.32 visivo**:
- 1 sola illustrazione (anti-pattern)
- bb destra, batteria sinistra
- LED inserito sulla bb, gambe divaricate verticali
- **NO RESISTORE** (volutamente assente — è il punto della lezione)
- LED rosso visibile sulla bb
- Icona DANGER (cerchio rosso con `!`) sopra/accanto al LED — segnala pericolo
- Visivamente identico esp1 MA senza R nel mezzo

### 5. Dimensioni relative
- Stessi proporzioni esp1 ✅

### 6. Compatibilità SVG
- Battery9V OK ✅
- LED standard (NON led-bridge) match libro
- NO R = NO mismatch issue
- Icona danger SVG: ELAB ha ElabIcons.jsx — verify se DangerIcon presente

### 7. Numero cavi visibili libro

**Libro pag.32**:
- Visibile: 1 wire rosso (clip+ → bb rail top+) + 1 wire nero (clip− → bb LED-cathode-column)
- = **2 wire visibili totali**
- LED inserito diretto su rail+ (no R intermedio) — anodo gambetta lunga PIN su zona col-7 top section, catodo PIN su zona col-7 bottom section

**App handoff topology**:
- 4 wires: bat+→bus-top-plus-1, bus-top-plus-7→a7 (direct anode NO R), f7→bus-bot-minus-7, bus-bot-minus-1→bat−
- **Stessa violazione 2 extra wire** anti-pattern

### 8. Colori cavi
- Rosso + nero (match libro)

### 9. Punto partenza/arrivo cavi

**Libro pag.32**:
- W1 rosso: clip+ → bb rail top+ (col1 ~)
- W2 nero: clip− → bb LED-cathode-column (col bottom-section)

**App**:
- W1: bat+ → bus-top-plus-1 (match)
- W2 extra: bus-top-plus-7 → a7 (rail jumper, NON libro) ⚠️
- W3 extra: f7 → bus-bot-minus-7 (rail jumper, NON libro) ⚠️
- W4: bus-bot-minus-1 → bat− (match)

### 10. Curve cavi
- Libro: bezier morbide simmetriche (W1 in alto, W2 in basso)
- App: TBD verify rendering

### 11. Angoli cavi
- ~90° entrata/uscita bb (perpendicolari)

### 12. Sovrapposizioni
- Nessuna nel libro
- Wire passano laterali, non sopra LED

### 13. Compattezza
- Stessi parametri esp1 ✅ molto compatto

### 14. Compattezza su transform
- N/A specifico esp2, eredita PlacementEngine generale (TBD verify)

### 15. Funzionamento elettrico

**Libro circuit (anti-pattern volontario)**:
- bat+ (9V) → rail top+ → LED anodo (diretto NO R) → LED catodo → cathode-col → bat−
- LED forward voltage ~2.0V, no current limit → I = (9-2)/R_LED_only = ~70mA su LED da 20mA max
- LED **si brucia / esplode** (libro: "il LED si brucia e potrebbe addirittura esplodere")
- App solver: deve modellare overcurrent → trigger LED_BURN event → animation visual

**App attuale**:
- Solver MNA OK calcola overcurrent
- LED burn rendering: TBD verify (handoff non documenta burn animation)

### 16. Coerenza codice
- N/A

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: Wire visibility 4→2 (stessa violazione esp1)
- **P0-2**: LED burn animation visiva pedagogica (CRITICO — è il punto dell'esperimento!)
- **P0-3**: UNLIM context event emit LED_BURN → diagnostic message per docente
- **P0-4**: Warning icon DangerIcon SVG vicino LED quando brucia
- **P0-5**: Reference PNG full page pag.32 CAPTURED ✅

#### P1 importante
- **P1-1**: Reset behaviour dopo burn (LED resta nero, user must remove)
- **P1-2**: Sound effect "pop" optional (P2 ma menzione)
- **P1-3**: TTS UNLIM legge avviso pedagogico: "Vedete cosa succede senza il resistore! ATTENZIONE: il LED si brucia. NON MAI collegate un LED direttamente alla batteria!"

#### P2 rifinitura
- P2-1: Crepa SVG body LED (visualizzazione damage)
- P2-2: Fumo animation breve
- P2-3: Restore LED via right-click context menu

## Verdetto

**NON PRONTO**. Anti-pattern educativo solver OK (no R wired) ma LED_BURN visualizzazione + pedagogical event NON validato. Stesso wire-visibility refactor esp1 si applica anche qui.

**Priorità**:
1. Implementare LED_BURN animation (critico per pedagogia)
2. Refactor wire visibility (eredita esp1 fix)
3. UNLIM warning event
