---
id: fade-led
type: concept
title: "Fade LED — luminosità variabile con PWM"
locale: it
volume_ref: 2
pagina_ref: 40
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [led, fade, pwm, analogWrite, for-loop, luminosita, ciclo, arduino, pin-pwm]
---

## Definizione

Il Fade LED (dissolvenza del LED) è una tecnica che usa il PWM (Pulse Width Modulation) per variare la luminosità di un LED in modo graduale, da spento a pieno e viceversa. Vol. 2 pag. 40 descrive il fade come "la luminosità variabile del LED controllata da Arduino con `analogWrite()`".

## Analogia per la classe

Ragazzi, immaginate una lampadina con il dimmer: girate la manopola lentamente verso destra e la luce cresce piano piano, poi rigirate verso sinistra e si spegne altrettanto piano. Il Fade LED funziona esattamente così — solo che al posto della manopola c'è un ciclo `for` che conta da 0 a 255 e poi torna a 0, e Arduino accende e spegne il pin così velocemente che il vostro occhio vede una luce che cresce o cala.

## Cosa succede fisicamente

### Il segnale PWM
Arduino **non può** generare una tensione intermedia (es. 2.5 V) direttamente da un pin digitale. Usa invece un trucco: accende e spegne il pin migliaia di volte al secondo. La percentuale di tempo in cui il pin è HIGH si chiama **duty cycle**.

| Valore `analogWrite` | Duty cycle | Tensione "percepita" | Effetto visivo      |
|----------------------|------------|----------------------|---------------------|
| 0                    | 0 %        | 0 V                  | LED spento          |
| 64                   | 25 %       | ~1.25 V              | LED fioco           |
| 127                  | ~50 %      | ~2.5 V               | Metà luminosità     |
| 191                  | 75 %       | ~3.75 V              | Quasi al massimo    |
| 255                  | 100 %      | 5 V                  | LED al massimo      |

### Pin PWM di Arduino Nano

Solo i pin con il simbolo **~** supportano `analogWrite()`:

```
D3 (~)   D5 (~)   D6 (~)   D9 (~)   D10 (~)   D11 (~)
```

> Se usate `analogWrite()` su un pin senza `~`, il LED non fa fade: rimane fisso HIGH o LOW.

### Codice Fade standard

```cpp
int ledPin = 9;   // pin PWM (~)

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // Accende gradualmente: 0 → 255
  for (int i = 0; i <= 255; i += 5) {
    analogWrite(ledPin, i);
    delay(30);
  }
  // Spegne gradualmente: 255 → 0
  for (int i = 255; i >= 0; i -= 5) {
    analogWrite(ledPin, i);
    delay(30);
  }
}
```

Il `for` con `i += 5` sale in 51 passi (0, 5, 10 … 255). Ogni passo dura 30 ms → l'accensione completa dura ~1.5 secondi.

### Formula durata dissolvenza

```
durata_salita (ms) = (255 / step) × delay_ms
```

Esempio con step = 5, delay = 30 ms:
```
durata = (255 / 5) × 30 = 51 × 30 = 1530 ms ≈ 1.5 s
```

## Esperimenti correlati

- Vol. 2 pag. 40 — Fade LED (questo esperimento)
- Vol. 2 pag. 40+ — Potenziometro regola luminosità (`analogWrite` + `map()`)
- [concepts/pwm.md](pwm.md) — PWM spiegato in profondità
- [concepts/led.md](led.md) — Anatomia LED e calcolo resistenza
- [concepts/pin-digitali.md](pin-digitali.md) — Differenza pin digitali vs pin PWM

## Errori comuni

1. **`analogWrite()` su pin senza `~`** — il pin rimane fisso, nessun fade. Verificate che il pin scelto abbia il simbolo `~` (D3, D5, D6, D9, D10, D11).

2. **`delay()` troppo grande** — con `delay(500)` ogni passo dura mezzo secondo: la dissolvenza si vede a scatti. Usate valori tra 10 ms e 50 ms per un effetto fluido.

3. **LED senza resistenza** — anche a bassa luminosità la resistenza è obbligatoria: a `analogWrite(ledPin, 255)` il pin eroga 5 V continui e il LED brucia. Minimo 220 Ω tra pin e anodo.

4. **Step non arriva esattamente a 255** — con `i += 7` l'ultimo valore è 252, non 255. Non è un bug grave ma il massimo non è mai al 100%. Usate step = 1, 3, 5, 15, 51 o 85 per toccare 255 esattamente.

5. **Confusione `digitalWrite()` vs `analogWrite()`** — `digitalWrite(pin, HIGH)` → 5 V fissi (acceso/spento), `analogWrite(pin, 0..255)` → duty cycle variabile (fade). Non sono intercambiabili.

## Domande tipiche degli studenti

**"Perché con `analogWrite(127)` il LED non sembra a metà luminosità?"**
Matematicamente è al 49.8 %, ma l'occhio umano non percepisce la luce in modo lineare (risposta logaritmica): "metà valore" sembra più buio di "metà luminosità". Per i nostri esperimenti va benissimo così; correzioni avanzate usano curve gamma.

**"Se metto `delay(0)`, il fade è più veloce?"**
Con `delay(0)` il `for` gira velocissimo ma il PWM di Arduino si aggiorna già al proprio ritmo (490 Hz su D5/D6, 980 Hz su D3/D9/D10/D11). Il LED sembrerà quasi sempre acceso senza fade visibile. Mettete almeno `delay(10)` per vedere l'effetto.

**"Posso fare fade a due LED nello stesso tempo?"**
Con `delay()` no — blocca tutto il programma. Per due fade in parallelo serve `millis()` e una macchina a stati. È l'upgrade naturale di questo esperimento una volta che avete capito il Fade base.

**"Perché 255 e non 100?"**
255 è il massimo di un numero a 8 bit: da 0 a 2⁸ − 1 = 255. Arduino usa 8 bit per il duty cycle. È la stessa logica dei colori RGB: rosso puro = (255, 0, 0).

## PRINCIPIO ZERO

### Sicurezza
- La tensione in gioco è **5 V DC da Arduino** — sicura per i ragazzi con i kit ELAB.
- La resistenza **rimane obbligatoria** anche quando il LED è a bassa luminosità: a `analogWrite(ledPin, 255)` il pin eroga 5 V continui e senza resistenza il LED brucia in pochi secondi.
- Non scambiate il pin `~9` con il pin `9` su schede diverse: su Arduino Nano D9 è sempre PWM, ma su altri modelli potrebbe non esserlo.

### Narrativa per la classe
Questo è il primo esperimento in cui Arduino non comanda solo ON/OFF ma **sfuma**. È il salto dal bianco-e-nero al grigio. Il LED "respira" — come la spia di standby di un MacBook o la luce pulsante di un telefono con notifiche. Quel LED che respira usa esattamente il codice che state scrivendo voi oggi.

### Cosa dire ai ragazzi
- *"Vediamo insieme come Arduino riesce a fare qualcosa che un interruttore normale non può: non solo accendere e spegnere, ma sfumare."*
- *"Provate a cambiare il valore dentro `delay()`: più piccolo = fade più veloce. Trovate il valore che preferite."*
- *"Sapete quante volte al secondo Arduino accende e spegne il LED? Circa 490 volte — il vostro occhio non riesce a percepirlo, vede solo la media: una luce che cresce o cala."*
- Citate **Vol. 2 pag. 40** quando mostrate il codice sulla LIM.
- Prima di caricare il codice, fate indicare ai ragazzi il pin `~9` sulla scheda Nano fisica.

### Progressione didattica consigliata (5 passi)
1. Richiamare il Blink (già fatto) → "abbiamo controllato ON/OFF"
2. Cablare LED su D9 con 220 Ω → "stesso montaggio, pin diverso"
3. Caricare il codice Fade standard e osservare insieme
4. Far modificare `delay()` e `i += N` → "sperimentate, non abbiate paura"
5. Sfida: "Come fareste per fare un fade più lento? Più veloce? Che si ferma a metà?"

## Link L1 (raw RAG queries)

Questi termini trovano i chunk rilevanti in `src/data/rag-chunks.json`:

- `"analogWrite fade LED for loop"`
- `"PWM duty cycle 0 255 analogWrite"`
- `"pin PWM Arduino Nano tilde ~"`
- `"luminosità LED variabile Arduino"`
- `"Fade LED codice for incrementa delay"`
