# Deep Analysis — `v3-cap6-esp5` (Andrea 17-checkpoint)

**Sorgente**: PNG render Vol3 PDF V0.8.1 pag-pdf38 + textual + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 5 — Il semaforo |
| Pagine V0.8.1 | PDF pag.38 (printed TBD) |
| Reference PNG | reference/vol3/v3-cap6-esp5/page-pdf38-38.png |
| Tipo | Arduino Nano R4 + 3 LED semaforo sequenza temporizzata |

---

## Pin assignment + sequenza CONFIRMED verbatim libro V0.8.1

```
ESPERIMENTO 5: Il semaforo
Un semaforo è solo: un Blink con più fasi

LED:
  Verde → pin 5
  Giallo → pin 6
  Rosso → pin 7

Sequenza:
  Verde (3 s)
  Giallo (1 s)
  Rosso (3 s)
  Ripeti
```

**Verbatim libro V0.8.1 = canone.**

**RISOLUZIONE canone clash Sprint A**:
- Codex adversarial review §22 claim "rosso → pin 9" → **SBAGLIATO**
- Libro V0.8.1 verbatim "Rosso → pin 7" → **CANONE**
- Sprint A audit doc + manifest da aggiornare con pin verified

---

## Andrea 17-checkpoint

### 1. Breadboard

**Libro pdf38 visivo**:
- Orizzontale half-size (~30 colonne)
- Posizione: sotto-destra rispetto Arduino + codice
- Rail 4 (top+ top− bot+ bot−)

### 2. Batteria
- N/A (alimentazione Arduino USB)

### 3. Arduino Nano R4

**Libro pdf38**:
- Verticale a sinistra (stesso layout esp4)
- Stessi pin labels D2-D13, A0-A5, 5V/GND etc.
- USB connector top

### 4. Orientamento componenti

#### 3 LED semaforo
**Libro pdf38 illustrazione**:
- 3 LED inseriti sulla bb in **disposizione verticale** (semaforo verticale convenzionale)
- LED verde (top) → LED giallo (mid) → LED rosso (bot)
- Gambe divaricate verticali
- Anodi in zona top-section bb, catodi in zona bot-section

#### 3 Resistori 220Ω
- 3 R serie (uno per LED) — current limit
- Orientamento: orizzontale corti (style Vol3 modulare)
- Bande: 220Ω = red-red-brown-gold

### 5. Dimensioni relative
- Stesse esp4 + 3 LED + 3 R (più affollata)

### 6. Compatibilità SVG
- NanoR4Board (eredita esp4 audit)
- LED standard 3 colori (verde + giallo + rosso) — verify saturation libro
- R 220Ω x3

### 7. Numero cavi visibili libro

**Libro pdf38 illustrazione**:
- Pin D5 (verde) → R → LED verde anodo
- Pin D6 (giallo) → R → LED giallo anodo
- Pin D7 (rosso) → R → LED rosso anodo
- 3 catodi → GND rail comune
- VCC 5V Arduino → bb rail+ (optional)
- GND Arduino → bb rail−

= **~8-10 wire visibili totali**

**App attuale**:
- Topology RESET base origin/main — Sprint D ribake

### 8. Colori cavi

- VCC: rosso
- GND: nero
- Signal pin → LED: colorati (verde/giallo/rosso match LED?) OR uniformi orange/yellow jumper

### 9. Punto partenza/arrivo

```
D5 (Arduino) → R1 → LED_verde anodo (via bb column)
D6 → R2 → LED_giallo anodo
D7 → R3 → LED_rosso anodo
LED_verde catodo → GND rail
LED_giallo catodo → GND rail
LED_rosso catodo → GND rail
5V Arduino → bb rail+ (rail alimentazione)
GND Arduino → bb rail−
```

### 10. Curve cavi
- Style modulare Vol3 "vol3-short-orthogonal-jumper"

### 11. Angoli
- 90° (modulari)

### 12. Sovrapposizioni
- Libro illustrazione: 3 wire signal paralleli pin Arduino → bb area top
- Catodi convergenti su GND rail (parallel jumpers corti)
- No overlap LED/R

### 13. Compattezza
- Arduino + bb + 3 LED + 3 R + codice = scena affollata
- LED verticali a sequenza semaforo (compatto verticale)
- Codice top-right

### 14. Compattezza su transform
- Eredita esp4 (Arduino + bb come unità anchor)

### 15. Funzionamento elettrico

**Circuit**:
- 3 LED in parallelo, ciascuno con R 220Ω serie, controllati da pin D5/D6/D7
- Loop semaforo:
  - digitalWrite(5, HIGH); rest LOW; delay(3000)
  - digitalWrite(5, LOW); digitalWrite(6, HIGH); delay(1000)
  - digitalWrite(6, LOW); digitalWrite(7, HIGH); delay(3000)
  - Ripeti

**App solver**:
- avr8js emulazione 3 pin OUTPUT
- Solver DC LED brightness in funzione I
- AVRBridge eventi sync visual

### 16. Coerenza codice

**Libro pdf38 codice snippet visualizzato**:
```cpp
void setup() {
  pinMode(5, OUTPUT);  // LED verde
  pinMode(6, OUTPUT);  // LED giallo
  pinMode(7, OUTPUT);  // LED rosso
}

void loop() {
  digitalWrite(5, HIGH);
  delay(3000);
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  delay(1000);
  digitalWrite(6, LOW);
  digitalWrite(7, HIGH);
  delay(3000);
  digitalWrite(7, LOW);
}
```

(Delay values verbatim libro: 3s, 1s, 3s)

**Pin-code sync**:
- digitalWrite(5, HIGH) → highlight pin D5 + wire + LED verde brightness ON
- Analogamente per 6, 7
- 3 stati ciclico visualizzato

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: Topology BAKE da zero Sprint D (handoff RESET)
- **P0-2**: Pin assignment EXACT: D5/D6/D7 (NON D9 codex review claim — libro V0.8.1 canone)
- **P0-3**: Sequenza temporizzata code verbatim libro (3s/1s/3s + Ripeti)
- **P0-4**: 3 LED disposizione verticale semaforo + colori distinti saturati
- **P0-5**: NanoR4Board SVG audit (eredita esp4)
- **P0-6**: Pin-code visual sync 3 LED + 3 pin
- **P0-7**: Wire style "vol3-short-orthogonal-jumper"
- **P0-8**: 3 R 220Ω SVG bande red-red-brown-gold
- **P0-9**: GND rail comune wire visibility (parallel jumpers OR consolidato single wire?)
- **P0-10**: Compile + upload flow end-to-end
- **P0-11**: Reference PNG pdf38 CAPTURED ✅

#### P1 importante
- **P1-1**: LED colori saturation libro-faithful (verde brillante, giallo amber, rosso saturo)
- **P1-2**: Layout LED verticale "torre semaforo" (NON orizzontale random)
- **P1-3**: UNLIM commentary: spiegazione semaforo + sequenza + analogia
- **P1-4**: Codice IDE syntax highlighting

#### P2
- P2-1: Sound effects opzionali (bip cambio fase)
- P2-2: Animation transition LED ON→OFF morbido
- P2-3: Mode "demo accelerated" (delay 300ms invece 3s, demo Andrea pubblico veloce?)

## Verdetto

**NON PRONTO**. Stesse priorità esp4 + 3 LED layout + sequenza temporizzata + GND rail visibility decisione.

**Priorità Sprint D**:
1. NanoR4Board verify (condiviso esp4)
2. bookGeometry 3 LED + 3 R + 9-10 wire layout
3. Code verbatim sequenza 3-1-3s
4. Pin-code sync 3 pin
5. UNLIM commentary
6. Compile end-to-end

## Cross-link sblocco canone clash

| Source | Pin verde | Pin giallo | Pin rosso | Status |
|--------|-----------|------------|-----------|--------|
| Libro V0.8.1 PDF | **5** | **6** | **7** | CANONE VERIFIED ✅ |
| Codex review §22 | 5 | 6 | 9 | SBAGLIATO ❌ |
| Sprint A audit/manifest | TBD verbatim flagged | 6 | **7 (libro)** vs 9 (codex) clash | CORRECTED post deep analysis |

Aggiornare:
- `docs/demo-audit/v3-cap6-esp5.md` (Sprint A audit doc) — sostituire "rosso=7 vs codex=9 clash" con "verbatim libro V0.8.1 = 5/6/7 confirmed"
- `reference/vol3/v3-cap6-esp5/manifest.json` — clarify canoneClash RESOLVED
- `src/data/manual-index.json` — verbatimQuote update con pin numerati verified
