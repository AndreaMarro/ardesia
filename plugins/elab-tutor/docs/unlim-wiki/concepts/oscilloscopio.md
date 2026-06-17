---
id: oscilloscopio
type: concept
title: "Oscilloscopio"
locale: it
volume_ref: ~
pagina_ref: ~
source_status: general_knowledge_only
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-wiki-batch
tags: [oscilloscopio, strumento, misura, waveform, tensione, frequenza, pwm, segnale, onda-quadra]
---

## Definizione

L'oscilloscopio è uno strumento di misura elettronico che mostra come la **tensione** cambia nel tempo, disegnando una curva sullo schermo chiamata **forma d'onda** (waveform). Permette di "vedere" segnali altrimenti invisibili: impulsi PWM, segnali digitali, onde sinusoidali, comunicazioni seriali. *(Concetto non presente direttamente nei volumi ELAB — fonte: knowledge generale)*

## Analogia per la classe

Ragazzi, immaginate una macchina fotografica speciale che invece di fotografare la luce, fotografa l'**elettricità**: ogni secondo scatta migliaia di "foto" della tensione nel circuito e le dispone in fila sul monitor, formando una curva. Se la tensione sale, la curva sale; se scende, scende. Con l'oscilloscopio potete letteralmente **guardare dentro il filo** e vedere come si comporta un segnale nel tempo — come guardare le onde del mare, ma per l'elettricità!

## Cosa succede fisicamente

### Anatomia dello schermo

L'oscilloscopio mostra una griglia di quadrati. Ogni asse ha una scala regolabile:

| Asse | Misura | Unità tipiche | Parametro |
|------|--------|---------------|-----------|
| X (orizzontale) | Tempo | s, ms, µs, ns | **Timebase** (tempo/divisione) |
| Y (verticale) | Tensione | V, mV | **Volts/div** |

Esempio: con 2 V/div sull'asse Y e 1 ms/div sull'asse X, ogni quadrato vale 2 V in altezza e 1 ms in larghezza.

### Parametri chiave

| Parametro | Significato | Esempio tipico |
|-----------|-------------|----------------|
| **Frequenza (f)** | Quanti cicli al secondo | 490 Hz PWM Arduino / 50 Hz rete |
| **Periodo (T)** | Durata di un ciclo completo | T = 1/f |
| **Ampiezza (Vpp)** | Tensione picco-picco (max − min) | 5 V segnale digitale Arduino |
| **Duty cycle** | Percentuale di tempo HIGH in un PWM | 50% = metà ciclo HIGH |
| **Trigger** | Aggancio per stabilizzare la forma d'onda | fronte di salita (rising edge) |

### Formula periodo-frequenza

```
T = 1 / f          (T in secondi, f in Hz)
f = 1 / T

Esempio — PWM su pin Arduino pin 9:
f ≈ 490 Hz  →  T = 1 / 490 ≈ 2.04 ms

Esempio — Blink LED (delay 1000 ms):
f = 0.5 Hz  →  T = 2 s  (1 s HIGH + 1 s LOW)
```

### Segnali visibili con Arduino

| Sketch / funzione | Forma d'onda | Parametri |
|-------------------|--------------|-----------|
| `digitalWrite(13, HIGH/LOW)` + delay 1000 | Onda quadra lenta | T = 2 s, Vpp = 5 V |
| `analogWrite(9, 127)` | PWM 50% duty | f ≈ 490 Hz, T ≈ 2 ms |
| `analogWrite(9, 255)` | Linea continua HIGH | Tensione costante 5 V |
| `Serial.print(...)` a 9600 baud | Impulsi UART | 1 bit ≈ 104 µs |
| Potenziometro su A0 → `analogRead()` | Curva variabile | 0–5 V in base alla rotazione |

## Esperimenti correlati

> **Nota:** L'oscilloscopio non è incluso nel kit fisico ELAB standard. I concetti si possono osservare nel **simulatore ELAB** o con un oscilloscopio da laboratorio se disponibile.

- **`concepts/pwm.md`** — segnale PWM 490 Hz su pin digitali Arduino — forma d'onda rettangolare
- **`concepts/blink.md`** — onda quadra 0–5 V lenta, ottima come primo segnale da osservare
- **`concepts/comunicazione-seriale-uart.md`** — segnale UART a 9600 baud — impulsi ~104 µs
- **`concepts/analog-read.md`** — variazione continua di tensione su pin A0 con potenziometro
- **`concepts/corrente-alternata.md`** — forma d'onda sinusoidale (rete 50 Hz, NON con kit ELAB)
- **`concepts/multimetro.md`** — strumento complementare: misura valori statici, l'oscilloscopio misura segnali dinamici

## Errori comuni

1. **Timebase troppo lenta** — il segnale appare come una linea piatta o un blob confuso. Abbassare la timebase (es. da 1 s/div a 1 ms/div) per vedere la forma d'onda correttamente.
2. **Volts/div troppo alta** — la curva è un filino sottile vicino allo zero. Abbassare la scala (es. da 10 V/div a 1 V/div) per ingrandire e leggere correttamente.
3. **Trigger non impostato** — la forma d'onda "corre" sullo schermo e non si stabilizza. Impostare il trigger sul fronte di salita (**rising edge**) per agganciare l'onda e fermarla.
4. **Puntale GND non collegato al GND del circuito** — il segnale mostra rumore o non ha riferimento corretto. Il puntale nero (GND) va sempre collegato alla massa del circuito che si misura.
5. **Confondere Vpp con Vrms** — Vpp è tensione picco-picco (max − min); Vrms vale circa Vpp / 2.83 per un'onda sinusoidale pura. Per onde quadre (Arduino) la relazione è diversa: Vrms = Vpp × √(duty cycle).

## Domande tipiche degli studenti

**D: "L'oscilloscopio misura la corrente o la tensione?"**
R: Misura la **tensione** — la differenza di potenziale tra il puntale segnale e il puntale GND. Per osservare la corrente bisogna inserire una piccola resistenza nota nel circuito, misurare la caduta di tensione su di essa e applicare la legge di Ohm: I = V/R.

**D: "Possiamo usarlo con il nostro Arduino?"**
R: Sì! Se il laboratorio ha un oscilloscopio, collegate il puntale al pin D13 durante il Blink e vedrete un'onda quadra che sale a 5 V per 1 secondo e scende a 0 V per 1 secondo. Con `analogWrite(9, 127)` vedrete invece un PWM al 50% a circa 490 Hz — tantissimi cicli al secondo!

**D: "Perché il segnale PWM sembra un'onda quadra e non una curva liscia?"**
R: Perché il pin digitale di Arduino passa istantaneamente da 0 V a 5 V — è un segnale on/off preciso, non graduale. La forma è rettangolare (onda quadra). Una curva sinusoidale liscia si vede invece con segnali analogici come quelli della rete elettrica a 50 Hz.

**D: "Come leggo la frequenza sullo schermo senza uno strumento speciale?"**
R: Contate quanti quadrati occupa un ciclo completo sull'asse X, moltiplicateli per il valore della timebase (es. 0.5 ms/div × 4 div = 2 ms per ciclo) e calcolate f = 1/T: 1 / 0.002 s = 500 Hz. È matematica che conoscete già!

## PRINCIPIO ZERO

Quando introducete l'oscilloscopio alla classe:

- **Parlare sempre in plurale** — «Ragazzi, vedete questa curva sullo schermo?», «Contiamo insieme quanti quadrati occupa un ciclo…», «Proviamo a cambiare la timebase e osserviamo cosa succede»
- **Sicurezza**: L'oscilloscopio da laboratorio non è pericoloso sui circuiti ELAB a 5–9 V. NON collegarlo mai alla rete elettrica domestica (220 V): non è attrezzato per quelle tensioni e può danneggiare lo strumento e fare male.
- **Narrativa suggerita**: «Ragazzi, finora abbiamo usato il multimetro per misurare tensione e corrente — ma dava un numero fisso, un singolo istante. L'oscilloscopio fa qualcosa di speciale: ci mostra come la tensione *cambia nel tempo*, disegnando una curva. È come passare da una fotografia a un film. Quando il nostro Arduino fa il Blink, possiamo vedere esattamente quando il pin va a 5 V e quando torna a 0 V, e quanto dura ogni stato.»
- **Cosa mostrare sulla LIM**: uno screenshot di oscilloscopio reale o simulato con un'onda quadra PWM; la griglia con timebase e V/div evidenziati; il confronto tra segnale lento (blink 0.5 Hz) e veloce (PWM 490 Hz). Se disponibile in laboratorio, mostrare dal vivo il segnale del Blink sul pin D13.
- **Collegamento al simulatore ELAB**: nel simulatore si vedono i pin HIGH/LOW in tempo reale — l'oscilloscopio estende questo mostrando la forma temporale continua nel laboratorio reale.
- **Nota kit**: l'oscilloscopio non è nel kit ELAB standard. Se disponibile in laboratorio, è uno strumento avanzato ottimo per i ragazzi più curiosi che vogliono andare oltre il multimetro.

## Link L1 (query RAG suggerite)

```
oscilloscopio forma d'onda segnale elettrico
PWM onda quadra frequenza duty cycle Arduino
tensione tempo misura oscilloscopio
Arduino pin digitale 0 5V segnale blink
frequenza periodo formula f=1/T
UART serial baud segnale impulsi
corrente alternata sinusoidale 50Hz
timebase volts div griglia oscilloscopio
```
