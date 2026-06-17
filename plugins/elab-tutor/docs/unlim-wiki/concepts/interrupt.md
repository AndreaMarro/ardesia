---
id: interrupt
type: concept
title: "Interrupt (attachInterrupt / ISR)"
locale: it
volume_ref: 3
pagina_ref: 92
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [interrupt, attachInterrupt, ISR, volatile, hardware, pulsante, avanzato, concorrenza, FALLING, RISING]
---

## Definizione

Un interrupt è un segnale hardware che fa "interrompere" immediatamente il programma principale di Arduino per eseguire una funzione speciale chiamata **ISR** (Interrupt Service Routine). Appena la ISR termina, il programma riprende esattamente dove si era fermato. Vol. 3 cap. 8 lo introduce come "il modo in cui Arduino ascolta il mondo esterno senza perdere un colpo" *(pag. ~92 — verificare sul volume fisico)*.

## Analogia per la classe

Ragazzi, immaginate di stare leggendo un libro: a un certo punto squilla il telefono. Mettete subito il segnalibro alla pagina, rispondete alla chiamata, poi riaprite il libro esattamente dove eravate rimasti. Arduino fa la stessa cosa: stava eseguendo il programma principale nel `loop()`, poi un pin cambia stato → il microcontrollore "mette il segnalibro" nel codice, esegue la funzione ISR in pochi microsecondi, e ritorna esattamente al punto in cui si era fermato. Tutto questo avviene così velocemente che il programma principale non si accorge quasi di nulla.

## Cosa succede fisicamente

Su Arduino Nano/Uno **solo i pin 2 e 3** sono collegati ai circuiti hardware per gli interrupt esterni:

| Pin Arduino | Numero interrupt | Nota                      |
|-------------|-----------------|---------------------------|
| **2**       | INT0            | Interrupt 0 (più comune)  |
| **3**       | INT1            | Interrupt 1 (anche PWM ~) |

Ogni interrupt può scattare in quattro modi:

| Modalità  | Quando scatta                              |
|-----------|--------------------------------------------|
| `RISING`  | Quando il pin passa da LOW a HIGH          |
| `FALLING` | Quando il pin passa da HIGH a LOW          |
| `CHANGE`  | A ogni cambio di stato (salita o discesa)  |
| `LOW`     | Finché il pin è a livello basso            |

### Sintassi base

```cpp
volatile bool pulsantePremsuto = false;   // DEVE essere volatile

void ISR_pulsante() {
  pulsantePremsuto = true;               // ISR: solo questa riga, nient'altro
}

void setup() {
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), ISR_pulsante, FALLING);
  Serial.begin(9600);
}

void loop() {
  if (pulsantePremsuto) {
    Serial.println("Pulsante premuto!");
    pulsantePremsuto = false;            // reset flag
  }
  // Il loop continua normalmente anche tra un interrupt e l'altro
}
```

### Perché `volatile`?

Il compilatore C++ può ottimizzare il codice assumendo che una variabile non cambi "da sola". La parola chiave `volatile` dice al compilatore: "questa variabile può essere modificata in qualsiasi momento da un interrupt — rileggi sempre dalla memoria, non usare la copia in cache".

```cpp
volatile int contatore = 0;  // OK — il compilatore non ottimizza questa
int contatore = 0;           // SBAGLIATO — l'ISR la modifica, ma il loop legge un valore vecchio
```

### Sezione critica — variabili multi-byte

Se la variabile condivisa è `int` (2 byte) o `long` (4 byte), una lettura in `loop()` non è atomica: l'interrupt può scattare "a metà lettura". Proteggere con `noInterrupts()` / `interrupts()`:

```cpp
volatile unsigned long timestamp = 0;

void loop() {
  noInterrupts();                    // disabilita interrupt momentaneamente
  unsigned long copia = timestamp;  // leggi in sicurezza
  interrupts();                      // riabilita
  Serial.println(copia);
}
```

### Regole d'oro della ISR

1. **Brevissima**: solo ciò che non può aspettare. Niente `Serial.print`, niente cicli.
2. **Niente `delay()`**: usa il Timer0 interrupt — nella ISR è sospeso e si blocca per sempre.
3. **Niente `millis()`**: per lo stesso motivo — il contatore Timer0 si ferma dentro la ISR.
4. **Solo variabili `volatile`** per comunicare col loop principale.
5. **Niente Serial né display**: operazioni lente con buffer interni — corrompono i dati.

## Esperimenti correlati

- Vol. 3 cap. 8 — Primo interrupt hardware con pulsante
- Vol. 3 cap. 8 — Interrupt + encoder rotativo
- [`concepts/debounce.md`](debounce.md) — Debounce software: prerequisito per usare interrupt bene
- [`concepts/pulsante.md`](pulsante.md) — Pulsante base: da qui parte il percorso
- [Gioco "I due pulsanti rivali"](../../src/data/broken-circuits.js) — Race condition senza `volatile` (broken-circuits id: `interrupt-conflict`)

## Errori comuni

1. **Variabile condivisa senza `volatile`**: l'ISR aggiorna il valore, ma il loop legge la versione vecchia dalla cache del compilatore. Il programma sembra ignorare le pressioni del pulsante. Soluzione: aggiungere `volatile` alla dichiarazione — due caratteri che cambiano tutto.

2. **`delay()` dentro la ISR**: `delay()` dipende dal Timer0 interrupt per contare il tempo. Dentro la ISR, il Timer0 è sospeso: `delay(500)` aspetta per sempre e il programma si congela. L'ISR deve solo alzare un flag booleano; il `delay` va nel `loop()`.

3. **Confondere numero interrupt e numero pin**: `attachInterrupt(0, ...)` attiva INT0, che su Arduino Nano/Uno corrisponde al **pin 2**, non al pin 0! Usare sempre `digitalPinToInterrupt(pin)`: è leggibile, non ambiguo, e funziona su qualunque board.

4. **`Serial.print` o `Serial.println` dentro la ISR**: il buffer seriale si corrompe, il programma si inceppa, il Serial Monitor mostra caratteri strani o si blocca. La ISR deve solo impostare un flag; è il `loop()` a stampare.

5. **Due ISR che modificano la stessa variabile senza protezione**: race condition classica. Se INT0 e INT1 scattano quasi in contemporanea su una variabile `int` (2 byte), un aggiornamento può essere "a metà" quando arriva il secondo interrupt. Usare `noInterrupts()` / `interrupts()` nelle sezioni critiche del `loop()`.

## Domande tipiche degli studenti

**"Perché devo scrivere `volatile`? Il programma funziona lo stesso..."**
Senza `volatile`, il programma *sembra* funzionare nelle prove casuali ma può rompersi con le ottimizzazioni del compilatore attivate, o su board diverse. Il compilatore non sa che l'ISR può cambiare quella variabile e conserva una copia vecchia in un registro — così il loop non vede mai l'aggiornamento. `volatile` lo costringe a rileggere dalla RAM ogni volta: due lettere, zero bug nascosti.

**"Posso usare `delay()` o `millis()` nell'ISR?"**
No. Entrambi dipendono dal Timer0 interrupt per contare i millisecondi — ma dentro la ISR tutti gli interrupt sono sospesi, quindi il Timer0 non scatta mai. `delay()` aspetta per sempre; `millis()` restituisce un valore congelato. Soluzione: nella ISR alzate solo un flag booleano, poi nel `loop()` controllate il flag e gestite i tempi lì.

**"Qual è la differenza tra RISING, FALLING e CHANGE?"**
`FALLING` scatta quando il pin scende da HIGH a LOW (pulsante premuto con `INPUT_PULLUP`). `RISING` scatta sulla salita, utile per rilevare "pulsante rilasciato". `CHANGE` scatta su entrambi i fronti — ideale per gli encoder rotativi dove ogni scatto del manopola genera sia una salita sia una discesa. Per la maggior parte degli esperimenti con pulsanti, usate `FALLING`.

**"Posso usare più interrupt nello stesso programma?"**
Su Arduino Nano/Uno ci sono solo 2 interrupt esterni (pin 2 e 3). Si possono usare entrambi in parallelo: `attachInterrupt(digitalPinToInterrupt(2), ISR_A, FALLING)` e `attachInterrupt(digitalPinToInterrupt(3), ISR_B, FALLING)`. Il trucco: se le due ISR modificano variabili diverse, non c'è problema. Se modificano la stessa variabile, serve la protezione con `noInterrupts()`.

## PRINCIPIO ZERO

Gli interrupt non presentano rischi di sicurezza elettrica — lavorano nel software e coinvolgono solo i pin 2 e 3 a 5V. Il rischio è **pedagogico**: un interrupt scritto male produce un programma che "funziona quasi sempre" ma fallisce in modo imprevedibile. Questo è uno dei concetti più avanzati del percorso Vol. 3 e va affrontato **solo dopo** che i ragazzi padroneggiano `digitalRead`, `INPUT_PULLUP`, `debounce` e le funzioni in C++.

**Prerequisiti da verificare prima di iniziare**:
- Sanno usare `digitalRead` e riconoscono `INPUT_PULLUP`
- Hanno visto e risolto il problema del debounce (Vol. 2 pag. 55, [`concepts/debounce.md`](debounce.md))
- Capiscono cos'è una funzione in C++ (definizione, chiamata, parametri)
- Conoscono `millis()` e il concetto di "codice non bloccante"

**Cosa mostrare alla classe prima di spiegare**:
Caricare un programma che fa lampeggiare un LED ogni 500 ms con `delay()`. Tenere un pulsante collegato al pin 2. Premere più volte il pulsante e chiedere: "Quando risponde Arduino alla pressione?" — la risposta è: *dipende da dove si trova nel `delay()`*. Se il `delay` è appena iniziato, aspetta quasi 500 ms prima di leggere il pulsante. Questo "ritardo imprevisto" è il problema che gli interrupt risolvono.

**Cosa dire ai ragazzi** (citando il libro):
> "Con `loop()` e `delay()`, Arduino controlla il pulsante solo quando arriva a quella riga. Con un interrupt, Arduino risponde *immediatamente* — qualunque cosa stia facendo. È la differenza tra guardare il telefono ogni 5 minuti e tenerlo sempre in tasca con la suoneria attivata." *(Vol. 3 cap. 8, introduzione interrupt)*

**Narrativa suggerita**:
1. Dimostrare il problema: LED lampeggiante con `delay(500)` + pulsante → pressioni rapide si perdono
2. Chiedere: "Come potremmo far rispondere Arduino più velocemente, qualunque cosa stia facendo?"
3. Raccogliere le idee della classe, poi introdurre l'analogia del libro con il segnalibro
4. Mostrare il codice minimo: `attachInterrupt` + flag `volatile` + reset nel `loop()`
5. Indicare fisicamente pin 2 e 3 sulla scheda: "Solo questi due hanno i 'riflessi veloci'"
6. Far premere il pulsante mentre il LED lampeggia: ora risponde subito, anche durante il `delay`
7. (Avanzati) Mostrare il gioco "I due pulsanti rivali" nel Detective per discutere la race condition

**Plurale inclusivo sempre**: "osserviamo insieme cosa succede", "proviamo a premere il pulsante durante il lampeggio", "vediamo la risposta sul Serial Monitor", "abbiamo insegnato ad Arduino ad ascoltare senza distrarsi".

**Non sostituisce la lettura del volume**: le parole esatte di Vol. 3 cap. 8 vanno lette al momento della spiegazione — i ragazzi devono riconoscere le stesse frasi nel libro fisico che hanno in mano e sulla LIM.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"interrupt"` → cerca in glossary, capitoli v3-cap8, broken-circuits (interrupt-conflict)
- `"attachInterrupt"` → code-interrupt, capitoli v3, faq-interrupt
- `"volatile"` → code-volatile, error-race-condition, tip-ISR
- `"ISR"` → glossary-ISR, tip-interrupt-brevita
- `"digitalPinToInterrupt"` → code-interrupt-portabile, faq-interrupt-pin
- `"noInterrupts interrupts"` → code-sezione-critica, tip-multibyte
- `"race condition"` → broken-circuits interrupt-conflict, error-concorrenza
- `"FALLING RISING CHANGE"` → glossary-interrupt-mode, capitoli v3-cap8
