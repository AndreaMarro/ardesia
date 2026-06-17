---
id: blink-led
type: concept
title: "Blink LED — far lampeggiare un LED con Arduino"
locale: it
volume_ref: 3
pagina_ref: 47
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [blink, led, arduino, digitalWrite, delay, loop, setup, output, pin13, primo-programma, timing, lampeggio]
---

## Definizione

Far lampeggiare un LED con Arduino — il Blink — è il **primo programma Arduino** completo: un codice che accende e spegne un LED a intervalli regolari usando `digitalWrite()` e `delay()`. Vol. 3 pag. 47 lo introduce con queste parole: *"il programma Blink è il 'ciao mondo' dell'elettronica: ogni piccolo ingegnere nel mondo inizia da qui."* Il circuito è semplicissimo — un LED su pin D13 con resistenza da 220Ω — e il codice è solo 10 righe. Eppure contiene tutti i mattoni fondamentali: `setup()`, `loop()`, `pinMode()`, `digitalWrite()`, `delay()`.

## Analogia per la classe

Ragazzi, immaginate un semaforo pedonale: rosso per 1 secondo, verde per 1 secondo, rosso di nuovo, verde di nuovo… all'infinito. Non c'è nessuno che lo accende e spegne a mano — ha un **timer interno** che ripete la sequenza da solo. Ecco esattamente cosa fa Arduino con il Blink: dentro `loop()` c'è la stessa sequenza infinita — *accendi, aspetta, spegni, aspetta, accendi di nuovo* — gestita dal microcontrollore invece che da un operaio. Voi scrivete le istruzioni **una volta sola**, Arduino le esegue per sempre.

## Cosa succede fisicamente

### Il circuito

```
Arduino Nano D13 ──── [R 220Ω] ──── [LED] ──── GND
                                    ↑ anodo +    ↑ catodo −
```

Il pin D13 di Arduino Nano è un pin digitale di **output**: quando il programma scrive `HIGH`, il pin porta 5V sul filo. Quella tensione spinge corrente attraverso la resistenza e il LED → LED acceso. Quando il programma scrive `LOW`, il pin torna a 0V → nessuna tensione ai capi del LED → LED spento.

| Stato pin D13 | Tensione pin | Corrente LED | LED |
|---------------|-------------|--------------|-----|
| `HIGH` | ~5V | ~(5-2)/220 ≈ 13 mA | Acceso |
| `LOW` | 0V | 0 mA | Spento |

La resistenza da 220Ω limita la corrente e protegge il LED dal bruciare. Con 9V di alimentazione esterna usate 470Ω.

### Il codice minimo

```arduino
void setup() {
  pinMode(13, OUTPUT);   // imposta D13 come uscita
}

void loop() {
  digitalWrite(13, HIGH); // accendi LED
  delay(1000);            // aspetta 1 secondo (1000 ms)
  digitalWrite(13, LOW);  // spegni LED
  delay(1000);            // aspetta 1 secondo
}                         // loop() ricomincia dall'inizio → lampeggio infinito
```

**Citazione Vol. 3 pag. 48:** *"Il programma gira all'interno di `loop()` all'infinito: Arduino non si ferma mai, non si stanca mai, lampeggia finché c'è corrente."*

### Perché `loop()` non finisce mai

`setup()` viene eseguito **una sola volta** all'avvio (o dopo il reset). `loop()` viene eseguito **all'infinito**: quando arriva all'ultima riga, Arduino riparte automaticamente dall'inizio. Questo ciclo perpetuo è il motore di ogni programma Arduino.

### Timing con `delay(ms)`

| `delay(ms)` | Pausa percepita |
|-------------|----------------|
| `delay(100)` | 100 ms → LED lampeggia veloce (10 volte al secondo) |
| `delay(500)` | 500 ms → lampeggio rapido (2 volte al secondo) |
| `delay(1000)` | 1 secondo → lampeggio standard (1 volta al secondo) |
| `delay(2000)` | 2 secondi → lampeggio lento |

**Attenzione:** durante `delay()` Arduino è **bloccato** — non può fare nient'altro (leggere pulsanti, controllare sensori). Per programmi avanzati si usa `millis()` al posto di `delay()` (vedi [concepts/millis.md](millis.md)).

### Pin D13 — LED integrato

Arduino Nano ha un LED **già integrato sulla scheda** collegato al pin D13. Questo significa che il Blink funziona anche **senza circuito esterno**: caricando il codice, l'LED sulla scheda lampeggia subito. Perfetto per la prima prova senza breadboard.

## Esperimenti correlati

- **Blink base** (Vol. 3 pag. 47-48) — LED esterno su D13 con resistenza 220Ω: primo programma completo
- **Blink velocità variabile** (Vol. 3 pag. 50) — modificate il valore di `delay()` per cambiare la frequenza di lampeggio
- **Due LED alternati** (Vol. 3 pag. 52) — LED rosso e verde si alternano: LED1 HIGH quando LED2 LOW e viceversa
- **Morse code** — esercizio libero: usate `delay()` diversi per codificare lettere in codice Morse con il LED
- Concetti collegati: [concepts/led.md](led.md) · [concepts/pin-digitali.md](pin-digitali.md) · [concepts/ground-massa.md](ground-massa.md) · [concepts/blink.md](blink.md)

## Errori comuni

1. **LED non si accende — PIN sbagliato in `pinMode`** — scrivete `pinMode(12, OUTPUT)` ma collegate il LED al pin D13 (o viceversa). `digitalWrite(13, HIGH)` non fa niente al pin D13 se `pinMode` era sul 12. Fix: numero del pin in `pinMode` = numero del pin fisico dove è collegato il LED = numero in `digitalWrite`. Regola: "i tre numeri devono essere identici."

2. **LED acceso fisso, non lampeggia — `delay()` mancante o a 0** — se dimenticate un `delay()` oppure scrivete `delay(0)`, il lampeggio è così veloce (migliaia di volte al secondo) che l'occhio vede il LED sempre acceso (effetto stroboscopio velocissimo). Fix: aggiungere `delay(500)` o `delay(1000)` dopo ogni `digitalWrite`.

3. **LED non si accende — LED collegato al contrario** — l'anodo (gamba lunga, +) deve andare verso il pin D13 (attraverso la resistenza), il catodo (gamba corta, −) deve andare verso GND. Se invertite, il diodo blocca la corrente. Nessun danno, ma LED spento. Fix: girare il LED di 180°.

4. **LED brucia subito o puzza — resistenza assente o troppo bassa** — senza resistenza il LED assorbe tanta corrente da bruciare in pochi secondi. Con Arduino a 5V la corrente sarebbe (5-2)/0 → infinita (in pratica limitata dall'uscita Arduino, ma abbastanza da danneggiare LED e pin). Fix: usare sempre la resistenza da 220Ω (5V) o 470Ω (9V) in serie al LED.

5. **Codice caricato ma LED non lampeggia sul circuito esterno — GND non collegato** — il LED integrato sulla scheda (D13 interno) lampeggia regolarmente, ma il LED esterno è spento. Causa: avete dimenticato di collegare il catodo del LED esterno alla riga GND della breadboard, oppure la riga GND non è collegata al pin GND di Arduino. Fix: verificare che ci sia un filo dal catodo del LED → riga blu (−) breadboard → pin GND Arduino Nano. Senza questo filo il circuito esterno è aperto.

## Domande tipiche degli studenti

**"Perché si chiama 'Blink'? Cosa vuol dire?"**
*Blink* in inglese significa *lampeggio* o *battito di ciglia* (to blink = sbattere le palpebre). I programmatori di Arduino hanno scelto questo nome perché il programma fa sbattere le "palpebre" al LED — aperto/chiuso, acceso/spento, in continuazione. È diventato così famoso che in tutto il mondo "fare il Blink" significa "far lampeggiare il proprio primo LED con Arduino".

**"Se cambio il numero dentro `delay()`, cosa cambia esattamente?"**
Cambiate la velocità di lampeggio. `delay(1000)` aspetta 1 secondo → il LED lampeggia 1 volta al secondo. `delay(200)` aspetta 200 millisecondi → il LED lampeggia 5 volte al secondo (sembra quasi sempre acceso). `delay(5000)` aspetta 5 secondi → il LED lampeggia molto lento. Provate da soli: cambiate solo quel numero, caricare il codice e osservate. I numeri dentro `delay()` sono in **millisecondi**: 1000 ms = 1 secondo, 500 ms = mezzo secondo.

**"Posso mettere il LED su un altro pin invece del 13?"**
Sì, qualsiasi pin digitale da D2 a D13 funziona. Ricordate solo di cambiare il numero in **tutte e tre le parti** del codice: `pinMode(numero, OUTPUT)`, `digitalWrite(numero, HIGH)` e `digitalWrite(numero, LOW)`. Il pin D13 è speciale perché ha già un LED integrato sulla scheda — tutti gli altri pin richiedono un LED esterno su breadboard.

**"Arduino si ferma durante `delay()`? Non può fare altro?"**
Esatto: durante `delay(1000)` Arduino è completamente bloccato per 1 secondo intero — non legge pulsanti, non controlla sensori, non aggiorna display. Per i primissimi programmi va benissimo. Quando vorrete fare più cose contemporaneamente (es. lampeggiare un LED E leggere un pulsante nello stesso momento) dovrete imparare `millis()` — ma quello è il passo successivo, per ora `delay()` va perfetto.

## PRINCIPIO ZERO

**Per il docente — guida silenziosa:**

📖 **Citate le parole esatte del Vol. 3 pag. 47:** *"il programma Blink è il 'ciao mondo' dell'elettronica: ogni piccolo ingegnere nel mondo inizia da qui."*

**Cosa dire ai ragazzi:**
> "Ragazzi, adesso arriva il momento che aspettavate: il vostro primo programma Arduino. Si chiama Blink, che in inglese vuol dire lampeggio. Guardate il circuito: un LED, una resistenza, due fili. Guardate il codice: dieci righe. Eppure quando caricherete questo programma, Arduino farà lampeggiare quel LED per sempre — senza che voi tocchiate niente. È la magia della programmazione: voi scrivete le istruzioni una volta sola, e la macchina le esegue all'infinito. Ogni ingegnere elettronico del mondo ha fatto esattamente questo come primo passo. Adesso tocca a voi."

**Sicurezza:**
- Il kit ELAB lavora a 5V (Arduino) e 9V (batteria) — nessun rischio per i ragazzi; possono maneggiare tutti i componenti liberamente
- La resistenza da 220Ω è **obbligatoria**: senza di essa il LED si brucia in pochi secondi. Non è pericoloso per i ragazzi (nessun rischio elettrico), ma il LED è inutilizzabile. Se un gruppo dimentica la resistenza, il LED si spegnerà o emetterà odore di bruciato → occasione didattica perfetta per spiegare la resistenza serie
- Il pin D13 di Arduino è protetto internamente contro cortocircuiti brevi: un errore di cablaggio non rompe la scheda, ma verificare sempre prima di caricare il codice
- Non è necessario nessun dispositivo di protezione per questo esperimento

**Narrativa per la classe — progressione 7 step:**
1. *Il circuito prima del codice*: montate il LED su breadboard con resistenza e fili prima di toccare il computer. "Guardatelo: spento. Perché? Perché manca qualcuno che dica ad Arduino cosa fare."
2. *Il LED integrato*: mostrate il LED minuscolo già sulla scheda Arduino Nano vicino al pin D13. "Vedete quel puntino? È già un LED. Se caricassimo Blink adesso, senza nessun circuito, lampeggerebbe lui." Dimostrazione opzionale: caricare Blink con solo la scheda, senza breadboard.
3. *Leggete `setup()` ad alta voce*: "Setup vuol dire preparazione — viene eseguito una sola volta. `pinMode(13, OUTPUT)` dice ad Arduino: 'il pin 13 è un'uscita, può dare corrente verso fuori'."
4. *Leggete `loop()` ad alta voce*: "Loop vuol dire cerchio — gira per sempre. `digitalWrite(13, HIGH)` — metti 5 Volt. `delay(1000)` — aspetta 1 secondo senza fare nient'altro. `digitalWrite(13, LOW)` — togli i 5 Volt. `delay(1000)` — aspetta ancora. Poi ricomincia." Mimicry: fate ripetere ai ragazzi con le mani (su/pausa/giù/pausa).
5. *Caricamento*: premete Upload. "Vedete la barra che avanza? Arduino sta ricevendo il vostro programma. Adesso è vostro."
6. *Il momento 'wow'*: il LED lampeggia. Lasciate qualche secondo di silenzio. "Adesso sta lampeggiando per voi. Se spegnete tutto e riaccendete, ripartirà da solo — perché il programma è salvato dentro Arduino."
7. *Sfida*: "Cambiate il numero dentro `delay()`. Quanto potete renderlo veloce prima che sembri sempre acceso? Quanto lento prima che sembri quasi sempre spento?" Ogni gruppo scrive i propri valori e li condivide. Chi trova il lampeggio più lento? Chi il più veloce percepibile?

## Link L1 (raw RAG queries)

Query per `src/data/rag-chunks.json`:
- `"Blink primo programma Arduino LED lampeggio setup loop"` — bookText Vol.3 pag.47-48 + codice base + spiegazione setup/loop
- `"digitalWrite HIGH LOW pin 13 OUTPUT"` — funzione digitalWrite + pin digitali output + stato HIGH/LOW
- `"delay millisecondi blocca Arduino aspetta"` — funzione delay + comportamento bloccante + timing
- `"LED resistenza 220 pin D13 Arduino circuito breadboard"` — schema circuito LED esterno + calcolo resistenza + collegamento GND
- `"pinMode OUTPUT INPUT setup Arduino Nano"` — configurazione pin + setup() + differenza INPUT/OUTPUT
- `"loop infinito Arduino riparte setup eseguito una volta"` — struttura programma Arduino + ciclo loop perpetuo
