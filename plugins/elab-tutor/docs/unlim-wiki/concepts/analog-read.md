---
id: analog-read
type: concept
title: "analogRead() — Leggere il Mondo Analogico"
locale: it
volume_ref: 3
pagina_ref: 77
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [analogread, adc, sensori, pin-analogici, potenziometro, fotoresistore, map, 10-bit]
---

## Definizione

`analogRead(pin)` è la funzione Arduino che legge una tensione continua su uno dei pin A0-A5 e la converte in un numero intero da 0 a 1023. Vol. 3 pag. 77 la introduce così: "Leggiamo un valore con analogRead(A0) e lo stampiamo sul Monitor Seriale. Il potenziometro genera numeri da 0 a 1023 che vediamo scorrere sullo schermo."

## Analogia per la classe

Ragazzi, immaginate di misurare la temperatura con un termometro a mercurio: il liquido può salire a ogni altezza, non solo "caldo" o "freddo". Ecco la differenza tra il mondo **analogico** e quello **digitale**. Con `digitalRead` Arduino risponde solo sì/no; con `analogRead` risponde con un numero tra 0 e 1023 — come un righello che misura ogni millimetro tra 0 e 5 volt. Vol. 3 pag. 79: "Arduino non riceve sì/no, riceve un numero."

## Cosa succede fisicamente

Dentro Arduino Nano c'è un componente chiamato **ADC** (Convertitore Analogico-Digitale, Analog-to-Digital Converter). Quando chiamate `analogRead(A0)`:

1. Arduino "assaggia" la tensione presente sul pin A0
2. La confronta con la tensione di riferimento (5 V per default)
3. Fa un calcolo: divide il valore letto per l'intero range e lo mappa su 1024 livelli

**Formula:**
```
valore = (Vin / Vref) × 1023
```

| Tensione su A0 | Valore restituito |
|----------------|-------------------|
| 0.0 V          | 0                 |
| 1.25 V         | 255               |
| 2.5 V          | 511               |
| 3.75 V         | 767               |
| 5.0 V          | 1023              |

**Risoluzione:** 5 V ÷ 1024 ≈ **4.9 mV per passo** — Arduino sente variazioni minuscole di tensione.

**Tempo di conversione:** circa 100 µs per chiamata. Con `delay(250)` nel loop leggete 4 valori al secondo — abbastanza per giochi e sensori base.

**Codice minimo:**
```cpp
void setup() {
  Serial.begin(9600);
}
void loop() {
  int valore = analogRead(A0);
  Serial.println(valore);
  delay(250);
}
```

**Conversione valore → tensione reale:**
```cpp
float tensione = valore * 5.0 / 1023.0;
```

**Mappatura su altro range** (es. 0-100 per percentuale):
```cpp
int percentuale = map(valore, 0, 1023, 0, 100);
```

## Esperimenti correlati

- **v3-cap7-esp3** — Vol. 3 pag. 75: introduzione pin analogici con potenziometro
- **v3-cap7-esp5** — Vol. 3 pag. 77: primo `analogRead()` + Monitor Seriale
- **v3-cap7-esp7** — Vol. 3 pag. 79: approfondimento ADC a 10 bit riga per riga
- **v3-cap8-esp1** — Vol. 3 pag. 81: uso del Monitor Seriale per vedere i valori
- **v3-cap8-esp2** — Vol. 3 pag. 82: `analogRead` + `if/else` per soglia (LED on/off)

## Errori comuni

1. **Leggere un pin non collegato** — il valore fluttua casualmente tra 0 e 1023 perché il pin "flotta" nell'aria. Soluzione: collegare sempre il sensore o usare `pinMode(A0, INPUT_PULLUP)`.

2. **Usare `analogRead` su pin digitali D0-D13** — `analogRead(13)` non legge il pin D13 ma è un errore logico; i pin analogici sono A0-A5 (internamente 14-19). Usate sempre la costante `A0`, `A1` … `A5`.

3. **Dimenticare `Serial.begin(9600)` nel setup** — il Monitor Seriale mostra caratteri strani o niente. La comunicazione seriale va inizializzata prima di usare `Serial.println`.

4. **Aspettarsi valori esatti** — piccole variazioni di ±2-3 unità sono normali (rumore ADC). Non è un bug del circuito: è la fisica del sensore.

5. **Confondere `analogRead` con `analogWrite`** — `analogRead` legge un sensore (A0-A5 in ingresso); `analogWrite` genera un segnale PWM su pin speciali (D3, D5, D6, D9, D10, D11). Sono due funzioni completamente diverse.

## Domande tipiche degli studenti

**"Perché il numero va fino a 1023 e non a 1024?"**
Perché partiamo da 0: i livelli sono 0, 1, 2 … 1023, cioè 1024 livelli in totale. È lo stesso motivo per cui una scala da 0 a 9 ha 10 gradini.

**"Posso usare A0 sia come digitale che come analogico?"**
Sì! I pin A0-A5 possono fare `digitalRead`/`digitalWrite` (0 o 1) oppure `analogRead` (0-1023). Basta non mischiare le due modalità sullo stesso pin nello stesso momento.

**"Se giro il potenziometro piano piano, i numeri cambiano davvero uno alla volta?"**
Quasi. La risoluzione è ~4.9 mV per passo, quindi con movimenti molto piccoli potreste vedere cambiare i valori di 1-2 unità alla volta. Con movimenti veloci saltano decine di valori in una volta.

**"Posso usare `analogRead` con il fotoresistore invece del potenziometro?"**
Assolutamente sì — è uno degli usi più comuni. Il fotoresistore, in un partitore di tensione con una resistenza fissa, genera una tensione variabile in base alla luce, e `analogRead` la legge allo stesso modo.

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** Questo è il momento in cui i ragazzi scoprono che Arduino non è solo un interruttore on/off — sa *misurare* il mondo. È un passaggio importante: dall'esperienza digitale (sì/no) al mondo reale (sfumature, quantità, grandezze fisiche).

**Cosa fare con i ragazzi:**
- Fate girare lentamente il potenziometro mentre il Monitor Seriale è aperto e tutti vedono i numeri cambiare — è il momento "wow" del capitolo
- Chiedete: "Secondo voi, dove si trova lo 0? E il 1023?" (GND e 5V)
- Collegare il concetto alla vita reale: "Il termostato di casa fa la stessa cosa — misura gradi, non solo 'caldo/freddo'"
- Citate Vol. 3 pag. 75: "La luce non è solo 'c'è/non c'è': può essere poca, media, tanta"

**Sicurezza:**
- I pin A0-A5 in modalità `analogRead` sono ingressi: non collegare tensioni superiori a 5 V o negative — si danneggiano irreversibilmente
- Il potenziometro va sempre collegato con i due estremi a 5V e GND; il piedino centrale ad A0. Invertire GND e 5V non rompe nulla, ma dà valori invertiti

**Cosa NON fare:**
- Non collegare direttamente una batteria 9V su A0 senza partitore
- Non lasciare A0 scollegato e mostrare i valori fluttuanti come se fosse un bug — spiegate che è normale (pin flottante) e che serve sempre un sensore collegato

**Cosa dire ai ragazzi** (citazione diretta Vol. 3):
> "Arduino non riceve sì/no, riceve un numero." — Vol. 3 pag. 79

## Link L1 (raw RAG queries)

Frasi di ricerca per recuperare chunk L1 correlati da `src/data/rag-chunks.json`:

- `"analogRead A0 potenziometro"`
- `"pin analogici A0-A5 Arduino Nano"`
- `"ADC 10 bit 0 1023"`
- `"Monitor Seriale valori analogici"`
- `"map analogRead percentuale"`
