# Deep Analysis — `v2-cap7-esp1` (Andrea 17-checkpoint)

**Sorgente**: PNG render Vol2 pag.67-68 + textual vol2.txt + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 1 — Cap.7 condensatori |
| Pagine | 67, 68 |
| Reference PNG | reference/vol2/v2-cap7-esp1/page-{067,068}.png |
| Tipo | Scarica condensatore via MM probes (alta R interna) |

---

## Andrea 17-checkpoint

### 1. Breadboard — **CRITICA differenza vs Vol1**

**Libro pag.67-68 visivo**:
- **FULL SIZE** (NON half come Vol1)
- Orizzontale (asse lungo orizzontale)
- ~60 colonne visibili (vs ~30 Vol1)
- Occupa quasi tutta larghezza pagina
- Rail visibili 4: top+ top− bot+ bot−
- Divisione centrale gap visibile

**App attuale**:
- bb default scale half-size (Vol1) → **MISMATCH** se app non differenzia bb size per Vol2

**Decisione**:
- App deve avere variant `breadboard-full-size` per Vol2 vs `breadboard-half` per Vol1
- OR usare bb full per tutti volumi (consistency)

### 2. Batteria 9V

**Libro pag.67 visivo (step iniziali)**:
- **NO BATTERIA VISIBILE** nei primi step di pag.67 — solo bb + cap + MM
- Battery appare in pag.68 step 1 (final state con MM 9.00V display)
- Posizione: SOTTO-SINISTRA bb (verticale, "9V" stampato)
- Clip esce orientata verso bb sopra

**Differenza Vol1**:
- Vol1: bat SINISTRA bb (lato)
- Vol2: bat SOTTO-SINISTRA bb (under)

**App attuale**:
- Handoff esp1 Vol2 connections include "bat+ → bus-top-plus-1" + "bus-bot-minus-1 → bat-" = bat presente
- Posizione SVG: TBD verify se app posiziona bat sotto bb come libro o lato (Vol1 default)

### 3. Arduino
- N/A Vol2

### 4. Orientamento componenti

#### Condensatore (cap)
**Libro pag.67-68**:
- **Posizione**: centro bb, **a cavallo gap centrale**
- **Orientamento**: VERTICALE (cilindro verticale)
- **Polarità**: striscia negativa visibile su un lato del corpo (convenzione standard cond elettrolitico)
- **Verbatim libro pag.67**: "Inserisci il condensatore a cavallo della separazione centrale della breadboard e collega il multimetro con il cavo nero sul negativo e il rosso sul positivo del condensatore"

**App handoff**:
- c1:positive = bb1:e14, c1:negative = bb1:f14 (a cavallo gap) ✅ MATCH libro
- Asset SVG: TBD verify polarità marker visible (striscia negativa)

#### Pulsante
**Libro pag.67**:
- **Posizione**: accanto al condensatore (a sinistra cap)
- **Orientamento**: a cavallo gap centrale
- **Tipo**: tactile 4-pin (visibili 4 zampe)
- **Verbatim**: "Inserisci il pulsante accanto al condensatore sempre a cavallo della separazione centrale"

**App handoff**:
- btn1:pin1 = bb1:e10, pin2 = bb1:e12, pin3 = bb1:f10, pin4 = bb1:f12 ✅ a cavallo gap
- 4-pin layout corretto

#### Multimetro (MM)
**Libro pag.67-68**:
- **Posizione**: A DESTRA della bb
- **Orientamento**: orizzontale (display LCD bianco rettangolare in alto, manopole/quadranti rosso/nero sotto)
- **Display**: pag.68 mostra "9.00 V" in primo step, scende in step finale
- **Selettore**: 20V DC fondo scala (verbatim libro)
- **Probes**: cavo rosso + cavo nero, lunghi sottili, terminano su bb (rosso su cap+, nero su cap−)
- **Forma**: rettangolare giallo (Fluke-style? oppure libro custom giallo Omaric)

**App attuale**:
- Asset SVG: handoff non documenta dettagli MM asset
- **VERIFICA P0**: app deve avere MM giallo libro-style con display LCD animato (9V → 0V scarica)

### 5. Dimensioni relative

| Componente | Libro proporzione | App |
|------------|-------------------|-----|
| Breadboard FULL | ~70% larghezza pagina | TBD bb full variant |
| Batteria | ~10% larghezza (più piccola di Vol1 relative) | TBD |
| Multimetro | ~25% larghezza (corpo grande) | TBD asset |
| Condensatore | ~3% larghezza (piccolo cilindro) | TBD |
| Pulsante | ~2% larghezza (piccolo quadrato) | TBD |

### 6. Compatibilità SVG attuali

- `Battery9V.jsx` esistente ma posizione sotto-bb? — TBD verify
- `Multimeter.jsx` esistente? — verify
- `Capacitor.jsx` polarità marker — verify
- `PushButton.jsx` tactile 4-pin — verify

**Decisione P0**: Sprint E audit asset SVG vs foto libro.

### 7. Numero cavi visibili

**Libro pag.67 step iniziali (no batteria)**:
- 2 wire visibili (probes MM): rosso cap+→ MM, nero cap− → MM

**Libro pag.68 step finale**:
- 2 wire batteria: rosso (bat+ → bb rail top+), nero (bus bot− → bat−)
- 2 wire probes MM: rosso + nero
- 1 wire colorato (filo "colorato" libro): pulsante → cap+ via bb (visibile come orange/yellow?)
- = **5 wire visibili totali libro pag.68 final**

**App handoff (esp1 Vol2)**:
- 7 connections totali (W1-W7)
- W1: bat+ → bus-top-plus-1 ✅
- W2: bus-top-plus-10 → a10 (alimenta btn) — RAIL JUMPER app-only
- W3: c12 → c14 (btn out → cap+) — FILO "colorato" libro ✅
- W4: f14 → bus-bot-minus-14 ✅
- W5: bus-bot-minus-1 → bat- ✅
- W6: mm probe-positive → b14 (cap+) ✅
- W7: mm probe-negative → g14 (cap-) ✅

**Discrepanza**:
- W2 (bus-top-plus-10 → a10) = rail jumper app-only NON visibile libro
- W4 (f14 → bus-bot-minus-14) = libro mostra come rail jumper interno OR wire visibile?
- Probabilmente: app ha 1-2 wire extra rispetto libro

### 8. Colori cavi

**Libro**:
- Rosso (positive paths)
- Nero (negative paths)
- Colorato (giallo/arancione probably — filo "colorato" pulsante → cap+)

**App handoff**:
- Default red/black non specifica colore filo "colorato" — TBD verify W3

### 9. Punto partenza/arrivo cavi libro

**Pag.68 final state**:
- W1 rosso: clip bat+ → bb rail top+ col1
- W2 nero: clip bat− → bb rail bot− col1
- W3 colorato: pulsante out-pin → cap+ pin (via bb colonna)
- W4 rosso (probe MM): cap+ pin top-section → MM probe + ingresso
- W5 nero (probe MM): cap- pin bot-section → MM probe − ingresso

### 10. Curve cavi

**Libro pag.68**:
- W1, W2 batteria: curve morbide bezier (come Vol1)
- W3 filo colorato: orizzontale corto attraverso bb (short jumper)
- W4, W5 probes: curve morbide lunghe da MM a bb (cavi probes flessibili)

### 11. Angoli cavi
- ~90° entrata/uscita pin libro
- Probes MM curva libera (lunghi)

### 12. Sovrapposizioni
- Libro pag.68: nessuna sovrapposizione tra wire e componenti
- MM a destra non interferisce con bb componenti

### 13. Compattezza
- Libro pag.67: bb + MM a destra = ~80% pagina, ~50% altezza
- Pag.68 final: aggiunge batteria sotto-sinistra → leggermente più ampio
- Compatto ma più disteso di Vol1

### 14. Compattezza su transform
- bb anchor centrale (libro)
- MM satellite destra
- Batteria satellite sotto-sinistra
- Verify PlacementEngine behavior

### 15. Funzionamento elettrico

**Libro circuit**:
- bat+ → rail+ → ... → pulsante → cap+ (chiuso pulsante = current flow charging cap)
- cap− → rail− → bat−
- Quando user **PREMI**: cap si carica fino 9V (MM mostra ~9V)
- Quando user **RILASCIA**: pulsante apre → cap rimane carico → scarica lenta via probes MM (alta R interna probes)
- MM mostra 9V → scende lentamente verso 0V

**App attuale**:
- Handoff bug: "cap esp1 trattiene 9V dopo rilascio. Solver discharge path P0 fix Sprint E"
- Solver MNA non modella correttamente discharge via MM probes
- **P0 SPRINT E**: aggiungere R interna probes ~10MΩ in modello MM per discharge realistic

### 16. Coerenza codice
- N/A Vol2 (no Arduino)

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: **MM discharge path bug** — modello solver R interna probes
- **P0-2**: **R 1kΩ libro lista vs app NO R wired** — verbatim libro materiali include "un resistore da 1kΩ" MA illustrazioni NON mostrano R inserito. Audit Andrea: tipo libro o R parallelo non illustrato?
- **P0-3**: MM asset SVG libro-style giallo + display LCD animato (9V → scarica)
- **P0-4**: bb FULL SIZE variant (vs Vol1 half) — asset SVG differenziato
- **P0-5**: Wire visibility 7→5 (refactor W2 rail jumper → hiddenElectricalConnection)
- **P0-6**: Cap SVG polarità marker visibile (striscia negativa cilindro)
- **P0-7**: Pulsante tactile 4-pin orientazione (4 zampe corrette)
- **P0-8**: Reference PNG pag.67-68 CAPTURED ✅

#### P1 importante
- **P1-1**: Filo "colorato" libro = colore distintivo (orange/yellow) NON rosso/nero default
- **P1-2**: Build steps libro 5 stati progressive — match esp1 buildSteps[]
- **P1-3**: MM range selector visibile 20V DC (UI element)
- **P1-4**: Bat posizione SOTTO-SINISTRA bb (vs Vol1 sinistra-lato)
- **P1-5**: UNLIM commentary: "Premete il pulsante e guardate il multimetro!" + "Rilasciate e osservate cosa succede"

#### P2 rifinitura
- P2-1: Animation discharge curve dinamica MM display
- P2-2: Probes MM curve flessibili (rendering libero)
- P2-3: Sound effect "click" pulsante

## Verdetto

**NON PRONTO**. Bug discharge solver bloccante. Asset MM/cap/bb-full TBD verify. Discrepanza R 1kΩ libro materiali vs illustrazioni richiede verbatim audit Andrea.

**Priorità Sprint E**:
1. Fix solver discharge path (R probes MM)
2. Audit R 1kΩ presenza libro materiali (typo o reale?)
3. Asset SVG MM giallo libro-style + display animato
4. bb FULL variant
5. Wire visibility refactor
6. UNLIM commentary press/release
