---
id: pwm
type: concept
title: "PWM (Pulse Width Modulation)"
locale: it
volume_ref: 2
pagina_ref: 40
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [pwm, analogWrite, duty-cycle, luminosita, motore, servo, segnale]
---

## Definizione

Il PWM (Pulse Width Modulation, modulazione di larghezza d'impulso) è la tecnica usata da Arduino per simulare valori intermedi di tensione: il pin si accende e spegne centinaia di volte al secondo, e la percentuale di "tempo acceso" determina la luminosità o la velocità percepita. Vol. 2 pag. 40 lo introduce come il segreto per fare un LED "a metà luce".

## Analogia per la classe

Ragazzi, pensate a un ventilatore che accendete e spegnete velocissimo con un interruttore: se lo accendete per metà del tempo e lo spegnete per l'altra metà, sembra andare a metà velocità. Con il LED è uguale — Arduino non abbassa davvero la tensione, la accende e spegne ~490 volte al secondo! L'occhio non vede il lampeggio e percepisce solo la luminosità media.

## Cosa succede fisicamente

Il PWM genera un'onda quadra: il pin alterna rapidamente tra HIGH (5V) e LOW (0V). Il rapporto tra tempo HIGH e periodo totale si chiama **duty cycle**.

```
Duty cycle = (Tempo HIGH) / (Periodo totale) × 100%
```

In Arduino si controlla con `analogWrite(pin, valore)`:

| Valore `analogWrite` | Duty cycle | Effetto sul LED       |
|----------------------|------------|-----------------------|
| 0                    | 0%         | Spento                |
| 64                   | 25%        | Un quarto di luce     |
| 127                  | ~50%       | Metà luminosità       |
| 191                  | 75%        | Tre quarti di luce    |
| 255                  | 100%       | Massima luminosità    |

**Frequenza PWM**: ~490 Hz sui pin 3, 9, 10, 11 — ~980 Hz sui pin 5 e 6.

**Pin PWM su Arduino Nano/Uno**: solo **3, 5, 6, 9, 10, 11** (marcati con il simbolo `~` sulla scheda).

### Codice base

```cpp
// Fade LED graduale
int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  for (int i = 0; i <= 255; i += 5) {
    analogWrite(ledPin, i);
    delay(30);
  }
  for (int i = 255; i >= 0; i -= 5) {
    analogWrite(ledPin, i);
    delay(30);
  }
}
```

### Con potenziometro

```cpp
// Potenziometro (A0) → luminosità LED (pin 9)
void loop() {
  int val = analogRead(A0);                     // 0–1023
  int brightness = map(val, 0, 1023, 0, 255);  // converti range
  analogWrite(9, brightness);
}
```

`map()` è essenziale: `analogRead` restituisce 0-1023, `analogWrite` vuole 0-255.

## Esperimenti correlati

- Vol.1 pag.82 — Fotoresistore + LED (prima apparizione di `analogWrite`)
- Vol.2 pag.40 — LED con PWM: luminosità variabile
- Vol.3 cap.7 — PWM: luminosità variabile con potenziometro
- [`v3-bonus-servo-sweep`](../../src/data/capitoli/v3-bonus-servo-sweep.json) — Servo motore comandato via PWM (0-180°)

## Errori comuni

1. **`analogWrite` su un pin senza `~`**: nessun effetto PWM — il pin si comporta come `digitalWrite`. Sempre controllare il simbolo `~` sulla scheda.
2. **Valori fuori range**: `analogWrite(pin, 300)` viene troncato a 255. Il range è strettamente 0-255.
3. **Dimenticare `map()` dopo `analogRead`**: scrivere `analogWrite(pin, analogRead(A0))` manda valori fino a 1023 — overflow silenzioso.
4. **Buzzer passivo senza PWM**: il buzzer passivo ha bisogno di un segnale PWM con frequenza variabile (`tone()`), non di `analogWrite` a valore fisso — produce solo un clic.
5. **Credere che il segnale sia "vero analogico"**: il nome `analogWrite` è storico e fuorviante. La tensione media percepita è analogica, ma il segnale fisico è sempre digitale (ON/OFF).

## Domande tipiche degli studenti

**"Ma se il LED si accende e si spegne, non lampeggia?"**
No — 490 cicli al secondo è 30 volte più veloce del massimo percepibile dall'occhio umano (~25 Hz). Il cervello vede solo la luminosità media.

**"analogWrite(9, 127) fa esattamente metà luminosità?"**
Sì in termini di duty cycle (50%). La luminosità *percepita* dall'occhio segue una curva logaritmica, quindi 127 visivamente può sembrare leggermente meno della metà — ma elettricamente è esattamente il 50%.

**"Posso usare `analogWrite` su tutti i pin?"**
Solo sui pin con `~`: 3, 5, 6, 9, 10, 11 su Arduino Nano/Uno. Su un pin senza `~` il comando viene ignorato o produce solo HIGH/LOW.

**"Perché si chiama `analogWrite` se è digitale?"**
È un nome storico: dal punto di vista del circuito *esterno* (LED, motore) l'effetto sembra analogico perché la tensione media cambia. Ma dentro Arduino il pin oscilla sempre tra 0V e 5V, mai a valori intermedi reali.

## PRINCIPIO ZERO

Il PWM non presenta rischi specifici di sicurezza (è un concetto software), ma vale la pena di guidare la classe con cura perché è **controintuitivo**: ragazzi abituati a "HIGH = acceso" faticano a capire che "analogWrite(9, 127)" fa accendere e spegnere 490 volte al secondo.

**Cosa mostrare alla classe**:
Indicare fisicamente sulla scheda Arduino i pin marcati con `~`. Chiedere ai ragazzi: "Quanti pin PWM vedete?" — aspettarsi risposte, non dare subito la risposta. Poi mostrare il fade LED dal vivo: vedere la luce crescere e calare gradualmente è il momento "wow" che fissa il concetto.

**Cosa dire ai ragazzi** (citando il libro):
> "Finora il LED era solo acceso o spento. Oggi scopriamo una via di mezzo! Con `analogWrite` possiamo scegliere 256 livelli di luminosità, da 0 (spento) a 255 (piena luce). Il segreto si chiama PWM." *(Vol. 3 cap. 7, sidebar docente)*

**Narrativa suggerita**:
1. Mostrare il LED che lampeggia a 1 Hz (visibile) con `delay(500)`
2. Accelerare progressivamente: 10 Hz, 50 Hz, 490 Hz → il lampeggio "scompare"
3. Introdurre `analogWrite` come "interruttore automatico velocissimo"
4. Far girare il potenziometro e osservare il LED che cambia luminosità in tempo reale

**Non sostituisce la lettura del volume**: le parole esatte di Vol. 2 pag. 40 e Vol. 3 cap. 7 vanno citate durante la spiegazione — i ragazzi devono vedere le stesse frasi sul libro fisico e sulla LIM.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"PWM"` → glossary-13 (definizione), analogy-12 (ventilatore), faq-8 (analogWrite pin)
- `"analogWrite"` → code-3, code-13, code-14, tip-13
- `"duty cycle"` → glossary-13, capitoli v3-cap7-esp4 sidebar
- `"luminosità variabile"` → tip-13, code-13 (fade LED)
- `"map()"` → code-3, code-14
- `"buzzer PWM"` → error-23
