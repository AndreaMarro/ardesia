---
id: digital-write
type: concept
title: "digitalWrite() — Comandare un Pin Digitale"
locale: it
volume_ref: 3
pagina_ref: 47
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [digitalwrite, pin-digitali, output, high, low, blink, led, pinmode, resistenza-470]
---

## Definizione

`digitalWrite(pin, valore)` è la funzione Arduino che imposta un pin digitale di uscita a **HIGH** (5 V) oppure **LOW** (0 V, cioè GND). Vol. 3 pag. 47 la introduce nel programma Blink: `"digitalWrite(13, HIGH) accende il LED; digitalWrite(13, LOW) lo spegne"`.

## Analogia per la classe

Ragazzi, immaginate di avere un interruttore della luce in camera: quando lo schiacciate verso l'alto si accende (**HIGH**), verso il basso si spegne (**LOW**). `digitalWrite` fa esattamente la stessa cosa con un pin di Arduino — lo accende o lo spegne con un solo comando. La differenza è che lo fate dal programma, quindi potete farlo migliaia di volte al secondo, con sequenze precise come i pixel di un semaforo o il codice Morse.

## Cosa succede fisicamente

Quando chiamate `digitalWrite(pin, HIGH)`, il microcontrollore ATmega328p porta quel pin a **5 V** rispetto a GND, permettendo alla corrente di scorrere nel circuito collegato. Con `LOW` il pin viene portato a **0 V** (equivale a un collegamento diretto a GND).

**Regola d'oro — sempre in coppia con `pinMode`:**
```cpp
void setup() {
  pinMode(13, OUTPUT);   // dichiaro il pin come uscita
}
void loop() {
  digitalWrite(13, HIGH); // 5 V → LED acceso
  delay(1000);
  digitalWrite(13, LOW);  // 0 V → LED spento
  delay(1000);
}
```

> `digitalWrite` funziona **solo se avete prima chiamato `pinMode(pin, OUTPUT)`**. Senza quel comando il pin resta in stato indefinito.

**Tabella stati:**

| Comando                    | Tensione sul pin | Corrente sul LED | LED     |
|----------------------------|------------------|------------------|---------|
| `digitalWrite(pin, HIGH)`  | 5 V              | dipende da R     | acceso  |
| `digitalWrite(pin, LOW)`   | 0 V              | 0 mA             | spento  |

**Corrente massima per pin:**

| Limite          | Valore | Note                                         |
|-----------------|--------|----------------------------------------------|
| Raccomandato    | 20 mA  | Uso normale, pin sempre freddo               |
| Assoluto        | 40 mA  | Non superare mai — rischio danno permanente  |
| Totale I/O Nano | 200 mA | Somma di tutti i pin accesi contemporaneamente |

**Resistenza protettiva obbligatoria per il LED:**

```
R = (Vcc − Vf) / I
R = (5 V − 2 V) / 0,02 A = 150 Ω  (minimo teorico)
```

In pratica si usa **470 Ω** per sicurezza: il LED è meno brillante ma durerà anni. Con resistenze sotto i 100 Ω rischiate di bruciare il LED o il pin.

**Pin map ATmega328p — dove agisce `digitalWrite`:**

| Pin Arduino | Registro hardware | Note                          |
|-------------|-------------------|-------------------------------|
| D0-D7       | PORTD             | D0/D1 riservati a Serial RX/TX |
| D8-D13      | PORTB             | D13 = LED_BUILTIN onboard     |
| A0-A5       | PORTC             | Usabili come OUTPUT se necessario |

**Esempio più avanzato — semaforo a tre LED:**
```cpp
const int PIN_VERDE  = 10;
const int PIN_GIALLO = 11;
const int PIN_ROSSO  = 12;

void setup() {
  pinMode(PIN_VERDE,  OUTPUT);
  pinMode(PIN_GIALLO, OUTPUT);
  pinMode(PIN_ROSSO,  OUTPUT);
}
void loop() {
  digitalWrite(PIN_VERDE,  HIGH); delay(3000);
  digitalWrite(PIN_VERDE,  LOW);
  digitalWrite(PIN_GIALLO, HIGH); delay(1000);
  digitalWrite(PIN_GIALLO, LOW);
  digitalWrite(PIN_ROSSO,  HIGH); delay(3000);
  digitalWrite(PIN_ROSSO,  LOW);
}
```

> `HIGH` e `LOW` sono costanti Arduino equivalenti a `1` e `0`, ma usate sempre le costanti: il codice è più leggibile.

## Esperimenti correlati

- **v3-cap5-esp1** — Vol. 3 pag. 47: primo Blink con `digitalWrite(13, HIGH/LOW)` e `delay()`
- **v3-cap5-esp2** — Vol. 3 pag. 49: variare il tempo di accensione e spegnimento
- **v3-cap6-esp1** — Vol. 3 pag. 53: LED esterno su D10 con resistenza 470 Ω
- **v3-cap6-esp3** — Vol. 3 pag. 56: sequenza di LED (semaforo, coda d'insegna)
- **v3-cap7-esp2** — Vol. 3 pag. 63: `digitalWrite` controllato da `digitalRead` (pulsante)

## Errori comuni

1. **Dimenticare `pinMode(pin, OUTPUT)`** — il pin resta in modalità INPUT di default e `digitalWrite` non ha alcun effetto visibile. Il LED non si accende e il programma non dà errori: è un bug silenzioso. Soluzione: verificare che ogni pin usato con `digitalWrite` sia dichiarato `OUTPUT` nel `setup()`.

2. **Collegare il LED senza resistenza** — con 5 V diretti sul LED la corrente sale a decine o centinaia di mA. Il LED si brucia in pochi secondi e può danneggiare il pin. Regola: **sempre una resistenza in serie**, minimo 150 Ω, consigliato 470 Ω.

3. **Usare D0 o D1 come uscita digitale con il Monitor Seriale attivo** — D0 (RX) e D1 (TX) sono usati dalla comunicazione seriale (`Serial.begin()`). Se li usate anche come OUTPUT, il programma si comporta in modo strano o il Monitor Seriale mostra caratteri corrotti. Soluzione: usate sempre pin da D2 in poi per i vostri LED.

4. **Confondere `digitalWrite` con `analogWrite`** — `digitalWrite` produce solo 5 V o 0 V (on/off), mentre `analogWrite` genera un segnale PWM con valori da 0 a 255 per regolare la luminosità. Se volete far variare l'intensità del LED, dovete usare `analogWrite` su un pin con il simbolo `~` (D3, D5, D6, D9, D10, D11).

5. **Sovraccaricare troppi pin contemporaneamente** — se accendete molti LED insieme, la corrente totale può superare i 200 mA del Nano. Risultato: il microcontrollore si resetta da solo o si danneggia. Soluzione: usate transistor o driver di corrente per carichi multipli, o calcolate che la somma delle correnti resti sotto 150 mA per sicurezza.

## Domande tipiche degli studenti

**"Posso scrivere `digitalWrite(13, 1)` invece di `digitalWrite(13, HIGH)`?"**
Sì, tecnicamente funziona: `HIGH` vale `1` e `LOW` vale `0`. Ma usate sempre `HIGH` e `LOW` — il codice è più chiaro e chiunque capisce al volo cosa fa, senza dover ricordare che 1 significa acceso.

**"Se uso `digitalWrite(13, HIGH)` sul LED di bordo del Nano, si accende anche quello esterno su D13?"**
Sì! Il LED integrato sul Nano è collegato direttamente a D13. Se collegate anche un LED esterno con resistenza su D13, entrambi si accendono insieme con lo stesso comando. Utile per vedere subito se il programma funziona anche senza circuito esterno.

**"Quanto è veloce `digitalWrite`? Può lampeggiare così veloce da sembrare sempre acceso?"**
Sì! Sopra i 50-60 Hz l'occhio umano non percepisce il lampeggio e vede un LED "sempre acceso" (in realtà dimezzato in luminosità). È esattamente il principio del PWM. Con `delay(0)` il pin cambia stato circa 100.000 volte al secondo.

**"Perché usate la resistenza da 470 Ω e non quella da 220 Ω?"**
470 Ω dà circa 6 mA: il LED è visibile e il pin è al sicuro per ore di funzionamento. Con 220 Ω arrivate a ~14 mA: il LED è più brillante ma il pin si scalda di più. Entrambi vanno bene nei kit ELAB, ma 470 Ω è la scelta "dormi tranquillo".

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** `digitalWrite` è il primo vero atto di *controllo* che i ragazzi esercitano su un componente fisico — non modificano un valore sul monitor, ma accendono qualcosa di reale. È il momento "magia": il programma sul computer accende una luce nel mondo fisico. Sfruttate questa meraviglia.

**Cosa fare con i ragazzi:**
- Prima di caricare il codice, chiedete: "Secondo voi cosa farà Arduino quando arriverà a `digitalWrite(13, HIGH)`?" — lasciate che indovinino
- Caricate il Blink e osservate il LED D13 sul Nano: "Quel LED risponde esattamente a quello che avete scritto voi"
- Citate Vol. 3 pag. 47: *"digitalWrite(13, HIGH) accende il LED; digitalWrite(13, LOW) lo spegne"* — leggete la riga insieme, parola per parola
- Fate modificare i valori di `delay()`: chi riesce a fare il Blink più veloce? Più lento? (collegamento con il concetto di tempo e frequenza)
- Mostrate il semaforo a tre LED: "Il semaforo che vediamo ogni giorno funziona esattamente così — qualcuno ha scritto `digitalWrite` e `delay` in un computer dentro il semaforo"

**Sicurezza:**
- Ricordate sempre la resistenza in serie con il LED: senza di essa il LED si brucia e il pin può danneggiarsi in modo permanente
- Non collegare mai carichi superiori a 20 mA direttamente su un pin digitale: motorini, cicalini da 5V e relè richiedono transistor o driver dedicati
- I pin D0/D1 sono riservati: non collegarli a LED se avete `Serial.begin()` nel codice

**Cosa NON fare:**
- Non mostrare `digitalWrite(13, 1)` come forma abbreviata prima che i ragazzi abbiano capito `HIGH/LOW` — introduce confusione senza vantaggio
- Non saltare `pinMode` pensando che "tanto si capisce" — il comportamento indefinito del pin senza `pinMode` è una fonte di malfunzionamenti silenziosi difficili da diagnosticare

**Cosa dire ai ragazzi** (citazione diretta Vol. 3):
> *"digitalWrite(13, HIGH) accende il LED; digitalWrite(13, LOW) lo spegne."* — Vol. 3 pag. 47

**Progressione didattica consigliata (6 step):**
1. Blink su D13 (LED di bordo) — nessun componente esterno, codice Blink stock
2. Modificare i `delay()`: più veloce, più lento, asimmetrico (acceso 200ms / spento 800ms)
3. LED esterno su D10 con resistenza 470 Ω — collegamento breadboard + codice identico
4. Due LED alternati (D10 e D11) — sequenza `HIGH/LOW` in coppia
5. Tre LED semaforo (D10/D11/D12) — gestione di più `digitalWrite` in sequenza temporizzata
6. `digitalWrite` controllato da `digitalRead` — pulsante che accende il LED (capitolo successivo)

## Link L1 (raw RAG queries)

Frasi di ricerca per recuperare chunk L1 correlati da `src/data/rag-chunks.json`:

- `"digitalWrite HIGH LOW LED accende spegne"`
- `"pinMode OUTPUT pin digitale setup"`
- `"blink LED 13 delay 1000 Arduino"`
- `"resistenza 470 ohm LED protezione corrente"`
- `"pin digitali D0-D13 PORTD PORTB Arduino Nano"`
