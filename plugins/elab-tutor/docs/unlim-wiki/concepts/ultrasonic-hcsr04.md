---
id: ultrasonic-hcsr04
type: concept
title: "HC-SR04 — sensore ultrasuoni per misurare distanza"
locale: it
volume_ref: 3
pagina_ref: 130
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [hcsr04, ultrasuoni, distanza, sensore, pulsein, vol3]
---

## Definizione

Il **HC-SR04** è un sensore ultrasuoni che misura distanza emettendo un impulso a 40 kHz e cronometrando l'eco di ritorno. Vol. 3 pag. 130 introduce: "L'HC-SR04 è il "pipistrello" del kit: emette un suono troppo acuto per noi, e ascolta il ritorno per capire quanto è lontano un oggetto".

Pinout (4 pin):
- **VCC** — 5 V
- **TRIG** — pulse input (Arduino → sensore)
- **ECHO** — pulse output (sensore → Arduino)
- **GND** — massa

Range: 2 cm - 400 cm. Risoluzione: ~3 mm. Angolo cono: 15°.

## Principio fisico

1. Arduino invia un impulso 10 µs su TRIG
2. Sensore emette burst 8 cicli a 40 kHz su trasmettitore
3. Onda viaggia, rimbalza su ostacolo, torna su ricevitore
4. ECHO va HIGH durante andata-ritorno
5. Arduino misura la durata di ECHO HIGH

```
distanza (cm) = durata (µs) × 0.0343 / 2
                                 ─── velocità suono cm/µs
                                       /2 perché andata+ritorno
```

Vol. 3 pag. 130 spiega: 343 m/s velocità suono = 0.0343 cm/µs. Diviso 2 perché segnale percorre andata + ritorno.

## Schema collegamento

```
Arduino     HC-SR04
  +5V  ───→ VCC
  pin 9 ──→ TRIG
  pin 8 ←── ECHO
  GND  ───→ GND
```

## Codice Arduino base

```cpp
const int PIN_TRIG = 9;
const int PIN_ECHO = 8;

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.begin(9600);
}

float misuraDistanza() {
  // 1. invia impulso TRIG 10 µs
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // 2. attendi ECHO + misura durata
  long durata = pulseIn(PIN_ECHO, HIGH, 30000);  // timeout 30 ms

  // 3. converti durata → cm
  if (durata == 0) return -1;  // nessun eco (oggetto troppo distante o assente)
  return durata * 0.0343 / 2.0;
}

void loop() {
  float d = misuraDistanza();
  if (d < 0) {
    Serial.println("Out of range");
  } else {
    Serial.print("Distanza: ");
    Serial.print(d);
    Serial.println(" cm");
  }
  delay(500);
}
```

## Esempio Vol. 3 — allarme parcheggio

```cpp
const int PIN_LED_ROSSO = 5;
const int PIN_LED_VERDE = 6;
const int PIN_BUZZER = 8;

void loop() {
  float d = misuraDistanza();

  if (d < 10) {
    digitalWrite(PIN_LED_ROSSO, HIGH);
    digitalWrite(PIN_LED_VERDE, LOW);
    tone(PIN_BUZZER, 2000, 100);  // beep allarme
  } else if (d < 30) {
    digitalWrite(PIN_LED_ROSSO, LOW);
    digitalWrite(PIN_LED_VERDE, HIGH);
    noTone(PIN_BUZZER);
  } else {
    digitalWrite(PIN_LED_ROSSO, LOW);
    digitalWrite(PIN_LED_VERDE, LOW);
    noTone(PIN_BUZZER);
  }
  delay(100);  // 10 Hz refresh
}
```

Vol. 3 pag. 132 mostra questo come progetto capstone: parcheggio assistito visualizzato con LED + suono.

## Limitazioni

| Problema | Causa |
|----------|-------|
| Letture fluttuanti ±1-2 cm | Rumore acustico ambientale |
| Letture impossibili oltre 400 cm | Onde troppo deboli al ritorno |
| Letture errate < 2 cm | Tempo riflessione troppo breve |
| Cono 15°: oggetti laterali | Pacchetto cilindrico geometria |
| Falsi negativi su superfici morbide | Tessuto, capelli assorbono ultrasuoni |
| Falsi positivi specchi/vetro | Onda rimbalza in modi imprevisti |

## Errori comuni

1. **TRIG e ECHO scambiati** — Sintomo: lettura sempre 0 o casuale. Soluzione: rispettare pinout (TRIG = output Arduino, ECHO = input Arduino).

2. **`pulseIn` senza timeout** — Senza timeout, se nessun eco arriva (oggetto >400cm), Arduino blocca per **secondi**. Sempre aggiungere `pulseIn(pin, HIGH, 30000)` (30 ms = ~5 m max range).

3. **Calcolo distanza con velocità suono fissa** — La velocità del suono varia con temperatura (343 m/s a 20°C, 320 m/s a 0°C). Per applicazioni precise, correggere:
```cpp
float vSuono = 331.4 + 0.6 * temperatura;  // cm/µs = m/s/10
float distanza = durata * vSuono / 2.0 / 10000.0;
```

4. **Refresh troppo veloce** — Letture < 50 ms apart possono interferire (eco residua del precedente burst confonde). Vol. 3 pag. 130 raccomanda minimo 60 ms tra misure.

5. **Alimentazione VCC instabile** — Se Arduino alimentato da batteria 9V con VIN, il regolatore può variare → 5V varia → lettura HC-SR04 varia. Vol. 3 raccomanda alimentazione USB durante calibrazione.

## Esperimenti correlati

- **Vol. 3 pag. 130** — Primo HC-SR04: misura distanza Serial Monitor
- **Vol. 3 pag. 132** — Allarme parcheggio (LED + buzzer)
- **Vol. 3 pag. 135** — Distanziometro digitale display LCD I2C
- **Vol. 3 pag. 140** — Robot evita-ostacoli (capstone, HC-SR04 + servo)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 130):
> "L'HC-SR04 è il "pipistrello" del kit: emette un suono troppo acuto per noi, e ascolta il ritorno per capire quanto è lontano un oggetto."

**Cosa fare:**
- Vol. 3 pag. 130 raccomanda di insegnare HC-SR04 nel cap intermedio Vol. 3 (dopo `pulseIn` + `delayMicroseconds`)
- Mostrate empiricamente: muovete la mano avanti/indietro davanti al sensore → numeri Serial Monitor cambiano. Ragazzi vedono "vista a ultrasuoni" funzionare
- Parlate del pipistrello (echolocalizzazione) come connessione tra biologia e elettronica — concetto STEAM
- Esperimento facile: misurare distanza muro a vari passi (0.5m, 1m, 2m). Confrontare con metro a nastro. Errori tipici < ±1cm
- Vol. 3 raccomanda di NON usare HC-SR04 senza temperatura compensation per progetti scientifici precisi

**Sicurezza:**
- HC-SR04 emette 40 kHz — inudibile per umani (oltre 20 kHz). Sicuro a livello acustico.
- Bambini molto piccoli o cani sentono frequenze alte e possono mostrare disagio se sensore acceso a lungo. Vol. 3 raccomanda spegnere quando non in uso

**Cosa NON fare:**
- Non usate HC-SR04 in pieno sole diretto su superficie nera — assorbe ultrasuoni, lettura instabile
- Non cercate misure precise sotto 2 cm (tempo riflessione troppo breve per timer interno)
- Non aspettatevi precisione su materiali morbidi (tessuto, schiuma) — ultrasuoni assorbiti

## Link L1 (raw RAG queries)

- `"HC-SR04 ultrasuoni distanza Arduino"`
- `"pulseIn timeout Arduino"`
- `"velocità suono temperatura cm/µs"`
- `"echolocalizzazione pipistrello sensore"`
- `"robot evita ostacoli HC-SR04 servo"`
