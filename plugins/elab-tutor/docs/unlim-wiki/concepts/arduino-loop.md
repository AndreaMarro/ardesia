---
id: arduino-loop
type: concept
title: "La funzione loop() — il cuore pulsante di Arduino"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [loop, setup, funzione, arduino, sketch, ciclo, programmazione, base]
---

## Definizione

`loop()` è la funzione principale di ogni sketch Arduino: viene eseguita **in continuazione**, dall'inizio alla fine, poi ricomincia da capo — per sempre, finché la scheda è accesa. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

Ogni sketch Arduino ha esattamente **due funzioni obbligatorie**:

```cpp
void setup() {
  // eseguita UNA volta sola all'avvio
}

void loop() {
  // eseguita ALL'INFINITO in sequenza
}
```

## Analogia per la classe

Ragazzi, pensate a un semaforo di un incrocio: si accende il rosso, poi il giallo, poi il verde, poi ricomincia — rosso, giallo, verde, rosso, giallo, verde… senza mai fermarsi finché c'è corrente. La funzione `loop()` è esattamente così: ogni volta che arriva alla parentesi graffa finale `}`, riparte dall'inizio. Arduino non si "stanca" mai di ripetere!

## Come funziona la struttura di uno sketch

```
ACCENSIONE
    ↓
setup()  ← UNA volta sola (configurazione pin, Serial, display…)
    ↓
loop()   ← Ciclo infinito
  ├─ riga 1
  ├─ riga 2
  ├─ …
  └─ ultima riga → TORNA ALL'INIZIO di loop()
```

Il microcontrollore ATmega328p sulla Nano esegue le righe di `loop()` **circa 10.000–100.000 volte al secondo** (dipende dalla complessità del codice e dall'eventuale uso di `delay()`).

## Cosa succede fisicamente dentro la Nano

Quando il codice compilato viene caricato nella memoria Flash dell'ATmega328p, il firmware runtime di Arduino:

1. Esegue il boot (configurazione registri interni)
2. Chiama `setup()` una sola volta
3. Entra in un ciclo `while(1) { loop(); }` che non termina mai

Non c'è un sistema operativo che "schedula" il codice: `loop()` gira su CPU nuda, ogni istruzione eseguita strettamente in sequenza.

## La relazione tra setup() e loop()

| Funzione | Eseguita | Tipico contenuto |
|----------|----------|-----------------|
| `setup()` | 1 volta all'avvio | `pinMode()`, `Serial.begin()`, inizializzazioni |
| `loop()` | All'infinito | `digitalRead()`, `analogRead()`, condizioni `if`, azioni |

> Variabili dichiarate **dentro** `loop()` vengono ricreate ad ogni ciclo (valore azzerato). Variabili dichiarate **fuori** da entrambe (globali) persistono tra un ciclo e l'altro.

## delay() dentro loop() — attenzione!

`delay(ms)` blocca completamente l'esecuzione per il numero di millisecondi indicato. Durante un `delay(1000)` Arduino non legge pulsanti, non controlla sensori, non fa nulla:

```cpp
void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);               // Arduino "dorme" 500 ms — sordo a tutto
  digitalWrite(LED_PIN, LOW);
  delay(500);               // altri 500 ms bloccati
}
```

Per fare più cose in parallelo (blink + lettura pulsante contemporanei) si usa la tecnica `millis()` invece di `delay()` — argomento avanzato, vedi `millis-non-blocking.md`.

## Esperimenti correlati

- **Primo LED che lampeggia** — Cap. 6 Vol. 1: il classico blink usa `loop()` + `delay()`
- **Lettura pulsante continua** — Cap. 8 Vol. 1: `digitalRead()` ripetuto dentro `loop()`
- **Lettura sensore luminosità** — Vol. 2 capitoli analogici: `analogRead()` ogni ciclo
- **Monitor seriale in tempo reale** — qualsiasi esperimento che stampa valori su Serial: tutto gira in `loop()`

## Errori comuni

1. **Codice che si esegue una volta sola e si credeva continuo** — Il codice era in `setup()` anziché in `loop()`. La distinzione setup/loop è il primo concetto da padroneggiare.

2. **`delay()` troppo lungo blocca tutto** — `delay(5000)` significa 5 secondi di Arduino sordo. Pulsanti, sensori, tutto ignorato. Soluzione: ridurre il delay o passare a `millis()`.

3. **Variabile locale azzerata ogni ciclo** — Dichiarare `int contatore = 0;` dentro `loop()` la azzera a ogni iterazione. Per contare tra cicli diversi, dichiararla **globale** (fuori da entrambe le funzioni).

4. **Pensare che loop() si fermi** — `loop()` non si ferma mai (salvo `while(true){}` esplicito o reset). Se il programma "sembra fermo" è perché c'è un `delay()` molto lungo o un ciclo bloccante dentro.

5. **Dimenticare le graffe** — Una `{` aperta senza la corrispondente `}` causa errore di compilazione. Il compilatore Arduino segnala la riga errata.

## Domande tipiche degli studenti

**"Quante volte al secondo gira loop()?"**  
Dipende da cosa c'è dentro. Un loop vuoto gira ~8 milioni di volte al secondo. Con `delay(1000)` gira esattamente 1 volta al secondo. Con sensori e Serial può girare 1000–10000 volte al secondo.

**"Posso mettere tutto in setup() e non usare loop()?"**  
Tecnicamente sì (lasciando `loop()` vuota), ma il programma si ferma dopo `setup()`. Per qualsiasi comportamento continuativo — leggere sensori, controllare pulsanti, aggiornare display — serve `loop()`.

**"Cosa succede se scrivo `return;` dentro loop()?"**  
`return;` esce dalla funzione `loop()` anticipatamente e ricomincia subito dal suo inizio — esattamente come arrivare alla fine. Non "ferma" il programma.

**"Come faccio a fare due cose contemporanee?"**  
Con `delay()` non si può. La soluzione professionale è `millis()`: controllare il tempo trascorso senza bloccare. Argomento vol. avanzato — vedi concetto `millis-non-blocking.md`.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Narrativa docente**: «Ragazzi, ogni volta che carichiamo uno sketch sulla Nano, la scheda esegue prima le istruzioni di `setup()` — come prepararsi per una partita. Poi parte `loop()`, che è la partita vera: ricomincia dall'inizio ogni volta che finisce, all'infinito. La Nano non si stanca mai!»

> **Demo consigliata**: caricare uno sketch che stampa `Serial.println("Ciclo numero: " + String(i++))` con variabile globale `i`. Aprire il Serial Monitor e far vedere ai ragazzi il contatore che sale da solo — l'evidenza visiva diretta che `loop()` gira continuamente.

> **Sicurezza**: nessun rischio specifico legato a `loop()`. Ricordare che un ciclo con `delay()` molto lungo (es. `delay(60000)`) può far sembrare la scheda "rotta" — rassicurare i ragazzi e spiegare che sta solo aspettando.

> **Aggancio concreto**: «Ogni esperimento che abbiamo fatto — il LED che lampeggia, il sensore che legge la luce, il motore che gira — funziona grazie a `loop()`. È il cuore di tutto ciò che Arduino fa!»

## Link L1 (raw RAG queries)

- `"loop arduino funzione sketch"`
- `"setup loop arduino differenza"`
- `"delay loop arduino blocca"`
- `"ciclo infinito arduino while"`
- `"variabile globale loop arduino"`
- `"arduino sketch struttura base"`
