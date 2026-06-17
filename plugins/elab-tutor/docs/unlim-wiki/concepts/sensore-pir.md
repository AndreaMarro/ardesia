---
id: sensore-pir
type: concept
title: "Sensore PIR — rilevamento movimento via infrarosso"
locale: it
volume_ref: 3
pagina_ref: 165
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [pir, sensore, movimento, infrarosso, sicurezza, automation, vol3]
---

## Definizione

Il sensore **PIR** (Passive Infrared) rileva movimento captando cambiamenti di calore corporeo nell'area di copertura. Vol. 3 pag. 165 introduce: "Il PIR vede il calore che le persone emettono e ci avverte quando qualcosa si muove davanti al sensore — funziona come l'occhio del cane di guardia".

Pinout (3 pin):
- **VCC** — 5 V (alcuni 3.3-12V)
- **OUT** — digital signal HIGH se movimento, LOW se quiete (pin Arduino INPUT)
- **GND** — massa

Range: 5-7 metri, cono 110°.

## Principio fisico

1. Tutti i corpi caldi (>0K) emettono **infrarossi** invisibili
2. Sensore PIR ha 2 elementi piroelettrici sensibili a IR
3. Quando una persona attraversa il campo visivo, gli elementi rilevano differenza di calore tra due zone
4. Differenza → segnale elettrico → output HIGH per durata regolabile

## Schema collegamento

```
Arduino     PIR
  +5V  ───→ VCC
  GND  ───→ GND
  D2   ←── OUT (digital)
```

## Codice Arduino base

```cpp
const int PIN_PIR = 2;
const int PIN_LED = 13;

void setup() {
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR warmup 30 secondi...");
  delay(30000);  // PIR richiede 30-60s warmup post-power
  Serial.println("PIR pronto.");
}

void loop() {
  int stato = digitalRead(PIN_PIR);

  if (stato == HIGH) {
    digitalWrite(PIN_LED, HIGH);
    Serial.println("MOVIMENTO RILEVATO");
  } else {
    digitalWrite(PIN_LED, LOW);
  }
  delay(100);
}
```

## Manopole regolazione (HC-SR501)

PIR HC-SR501 ha **2 trimmer + 1 jumper**:

| Manopola | Funzione | Range |
|----------|----------|-------|
| Sensitivity (Sx) | Distanza max rilevamento | 3-7m |
| Time delay (Tx) | Durata HIGH dopo rilevamento | 5s - 5min |
| Jumper | Modalità trigger | H = retriggerable, L = single |

**H mode (default)**: ogni nuovo movimento estende il timer.
**L mode**: dopo HIGH, ignora trigger fino al fine timer.

Vol. 3 pag. 165 raccomanda L per applicazioni con singolo trigger preciso.

## Esempio Vol. 3 — allarme antifurto

```cpp
const int PIN_PIR = 2;
const int PIN_BUZZER = 8;
const int PIN_LED_ROSSO = 9;
bool allarmeAttivo = false;
unsigned long lastTrigger = 0;
const unsigned long DURATA_ALLARME = 30000;  // 30s

void setup() {
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_ROSSO, OUTPUT);
  Serial.begin(9600);
  delay(30000);  // warmup
}

void loop() {
  if (digitalRead(PIN_PIR) == HIGH && !allarmeAttivo) {
    allarmeAttivo = true;
    lastTrigger = millis();
    Serial.println("INTRUSO!");
  }

  if (allarmeAttivo) {
    digitalWrite(PIN_LED_ROSSO, (millis() / 200) % 2);  // lampeggio 5Hz
    tone(PIN_BUZZER, 2000);
    if (millis() - lastTrigger > DURATA_ALLARME) {
      allarmeAttivo = false;
      digitalWrite(PIN_LED_ROSSO, LOW);
      noTone(PIN_BUZZER);
    }
  }
}
```

Vol. 3 pag. 168 estende: integrazione con buzzer + LED + display LCD per messaggi.

## Errori comuni

1. **Skip warmup 30-60s** — PIR appena alimentato genera falsi positivi continui. Vol. 3 raccomanda `delay(30000)` in setup.

2. **Esposizione a fonti calore** — sole diretto, riscaldatori, finestre con luce solare → falsi positivi. Posizionare PIR lontano da fonti termiche variabili.

3. **Trimmer sensitivity max sempre** — sensibilità troppo alta → trigger su animali/insetti. Calibrare empiricamente per ambiente.

4. **Time delay troppo breve** — output HIGH < 5s → segnale può essere perso da loop Arduino con delay. Minimo 5-10s consigliato.

5. **PIR + alimentazione 9V batteria** — alcuni HC-SR501 richiedono 5V stabili. Da batteria 9V via VIN regolatore può creare rumore. Preferire USB durante calibrazione.

6. **Pretendere rilevamento oggetti immobili** — PIR rileva SOLO MOVIMENTO. Persona ferma davanti per 5+ secondi → nessun output. Per presence detection statica usare microwave radar sensor.

## Esperimenti correlati

- **Vol. 3 pag. 165** — Primo PIR: LED si accende se movimento rilevato
- **Vol. 3 pag. 168** — Allarme con buzzer + LED rosso lampeggiante
- **Vol. 3 pag. 172** — Smart light: PIR + servo + LED strip per illuminazione automatica
- **Vol. 3 pag. 175** — Datalogger movimento: registra eventi su EEPROM con timestamp millis()

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 165):
> "Il PIR vede il calore che le persone emettono e ci avverte quando qualcosa si muove davanti al sensore — funziona come l'occhio del cane di guardia."

**Cosa fare:**
- Vol. 3 pag. 165 raccomanda di insegnare PIR DOPO `digitalRead` + `if/else` (concetti dipendenti)
- Mostrate empiricamente: passate la mano davanti al sensore, vedete LED accendersi. Restate fermi → spegne dopo timeout
- Spiegate il warmup come "il sensore deve abituarsi alla temperatura della stanza"
- Esempio iconico antifurto: ragazzi capiscono subito utility — applicabile a casa loro
- Vol. 3 raccomanda di parlare di **privacy**: PIR vede solo calore, NON immagini → no privacy concerns

**Sicurezza:**
- PIR è passivo → non emette nulla. Sicuro per lunga esposizione umana.
- Output HIGH = 3.3V (alcuni modelli) — verificare compat con Arduino 5V (di solito OK ma verificare).
- Allarmi acustici con buzzer NON oltre 70 dB in aula classe — proteggere udito ragazzi.

**Cosa NON fare:**
- Non aspettatevi precisione direzionale — PIR rileva movimento, NON direzione.
- Non usate PIR per contare persone — può perdere passaggi consecutivi rapidi.
- Non posizionate PIR vicino a finestre/calorifero — falsi positivi continui.

## Link L1 (raw RAG queries)

- `"sensore PIR movimento Arduino"`
- `"HC-SR501 trimmer sensitivity time"`
- `"warmup 30 secondi PIR falsi positivi"`
- `"allarme antifurto Arduino buzzer"`
- `"infrarosso passivo principio fisico"`
