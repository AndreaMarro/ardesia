---
id: joystick-2axis
type: concept
title: "Joystick 2 assi — input direzionale analogico"
locale: it
volume_ref: 3
pagina_ref: 155
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [joystick, input, analogico, gioco, vol3, capstone]
---

## Definizione

Il **joystick analogico 2 assi** è un input fatto da 2 potenziometri ortogonali (asse X + asse Y) + 1 pulsante (premendo verso il basso). Vol. 3 pag. 155 introduce: "il joystick è come una piccola leva di controllo videogame — Arduino legge in che direzione punta e quanto è inclinata".

Pinout (5 pin):
- **VCC** — 5 V
- **GND** — massa
- **VRx** — asse X (analog 0-1023)
- **VRy** — asse Y (analog 0-1023)
- **SW** — pulsante (digital, INPUT_PULLUP)

A riposo (centro): VRx ≈ 512, VRy ≈ 512.
Estremi: 0 (sinistra/giù) o 1023 (destra/su) per ogni asse.

## Schema collegamento

```
Arduino     Joystick
  +5V  ───→ VCC
  GND  ───→ GND
  A0   ←── VRx
  A1   ←── VRy
  D2   ←── SW (INPUT_PULLUP)
```

## Codice Arduino base

```cpp
const int PIN_X = A0;
const int PIN_Y = A1;
const int PIN_SW = 2;

void setup() {
  pinMode(PIN_SW, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(PIN_X);
  int y = analogRead(PIN_Y);
  bool premuto = (digitalRead(PIN_SW) == LOW);

  Serial.print("X=");  Serial.print(x);
  Serial.print(" Y=");  Serial.print(y);
  Serial.print(" SW=");  Serial.println(premuto ? "PREMUTO" : "rilasciato");
  delay(100);
}
```

## Mappatura direzionale (4 direzioni discrete)

```cpp
enum Direzione { CENTRO, SU, GIU, SINISTRA, DESTRA };

Direzione leggiDirezione() {
  int x = analogRead(PIN_X);
  int y = analogRead(PIN_Y);

  if (y > 800) return SU;        // alto
  if (y < 200) return GIU;       // basso
  if (x < 200) return SINISTRA;
  if (x > 800) return DESTRA;
  return CENTRO;                  // dead zone center
}
```

**Dead zone**: zona centrale 400-600 dove il joystick legge "centro" anche se non perfettamente centrato. Necessaria per evitare drift falsi positivi.

## Esempio Vol. 3 — pilotare LED matrice

```cpp
int posX = 4, posY = 4;  // posizione LED su matrice 8×8

void loop() {
  Direzione d = leggiDirezione();

  switch (d) {
    case SU:       posY = max(0, posY - 1); break;
    case GIU:      posY = min(7, posY + 1); break;
    case SINISTRA: posX = max(0, posX - 1); break;
    case DESTRA:   posX = min(7, posX + 1); break;
    case CENTRO:   /* nessun movimento */ break;
  }

  pulisciMatrice();
  accendiPixel(posX, posY);
  delay(150);  // velocità movimento
}
```

Vol. 3 pag. 158 estende a gioco "Snake" (capstone) con movimento joystick + LED matrice 8×8.

## Calibrazione

I joystick reali NON ritornano mai a 512 perfetto. Vol. 3 pag. 155 raccomanda calibrare al setup:

```cpp
int xCenter, yCenter;

void setup() {
  delay(500);  // assicurarsi joystick a riposo
  xCenter = analogRead(PIN_X);
  yCenter = analogRead(PIN_Y);
}

int xCalibrated() {
  return analogRead(PIN_X) - xCenter;  // -512 a +512 ca
}
```

## Sensibilità progressiva (movimento accelerato)

Per giochi più reattivi, mappare velocità al deflessione:

```cpp
int x = analogRead(PIN_X) - 512;
int velocita = map(abs(x), 0, 512, 0, 5);  // 0 a 5 pixel/frame
if (x < 0) posX -= velocita;
else if (x > 0) posX += velocita;
```

Più il joystick è inclinato, più veloce il movimento. Vol. 3 pag. 160 mostra questo come "controllo intuitivo".

## Errori comuni

1. **VRx/VRy invertiti** — Joystick ha label rotated rispetto orientamento "naturale" (alcuni hanno X verticale, Y orizzontale). Sintomo: SU sposta a sinistra/destra. Soluzione: verificare empiricamente quale asse cambia con quale movimento.

2. **Dead zone troppo stretta** — Centro 500-524 → drift naturale 5-10 unità causa falsi movimenti. Vol. 3 raccomanda dead zone 400-600 (range 200 unità).

3. **Pulsante SW senza INPUT_PULLUP** — Floating pin → letture casuali. Sempre `pinMode(PIN_SW, INPUT_PULLUP);` (vedi `pull-up-pulldown.md`).

4. **No debouncing pulsante** — Click joystick rimbalza. Per giochi a turni, debounce 50 ms (vedi `debounce.md`).

5. **Lettura troppo veloce** — `loop()` legge analogRead a 1 kHz → su matrice LED si muove troppo velocemente. Aggiungere delay o usare velocità mappata progressiva.

## Esperimenti correlati

- **Vol. 3 pag. 155** — Primo joystick: Serial Monitor X/Y/SW
- **Vol. 3 pag. 158** — Movimento LED matrice 8×8
- **Vol. 3 pag. 160** — Sensibilità progressiva
- **Vol. 3 pag. 162** — Snake game (capstone, 4 lezioni)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 155):
> "Il joystick è come una piccola leva di controllo videogame — Arduino legge in che direzione punta e quanto è inclinata."

**Cosa fare:**
- Vol. 3 pag. 155 raccomanda di insegnare joystick DOPO `analogRead` + `pull-up` + matrice LED basics
- Mostrate empiricamente: muovete il joystick in tutte le direzioni, fate notare i numeri X/Y cambiare. Premete il pulsante per il SW
- Confronto con potenziometro singolo: joystick è "2 potenziometri insieme + 1 pulsante" → composizione di concetti già noti
- Esempio Snake game è iconico: movimento personaggio + cibo da mangiare + ostacoli. Coinvolge ragazzi al massimo
- Vol. 3 raccomanda calibrazione SEMPRE in `setup()` — i joystick "muoiono" se non calibrati e ragazzi vedono solo drift inspiegabili

**Sicurezza:**
- Joystick è componente robusto. Sicuro per uso ragazzi.
- Verificare che VCC sia 5V (non 9V) — alcuni joystick economici NON tollerano sovratensione

**Cosa NON fare:**
- Non usate joystick senza dead zone — drift centrale frustra ragazzi
- Non insegnate joystick prima di matrice LED + array — concetti dipendenti
- Non aspettatevi precisione sub-millimetrica — joystick fisico ha gioco meccanico ±5%

## Link L1 (raw RAG queries)

- `"joystick 2 assi Arduino analogRead"`
- `"dead zone center calibrazione"`
- `"Snake game Arduino joystick"`
- `"sensibilità progressiva joystick velocità"`
- `"VRx VRy SW joystick pinout"`
