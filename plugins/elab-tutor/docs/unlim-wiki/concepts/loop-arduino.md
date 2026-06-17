---
id: loop-arduino
type: concept
title: "I loop in Arduino — loop(), for e while"
locale: it
volume_ref: 3
pagina_ref: 47
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [loop, for, while, ciclo, iterazione, ripetizione, setup, infinito, contatore, arduino, programmazione]
---

## Definizione

Un **loop** (ciclo) è un blocco di codice che Arduino esegue più volte di seguito. Vol. 3 pag. 47 introduce la struttura base: il `loop()` principale è la funzione che *"si ripete all'infinito dopo setup()"* — è il cuore pulsante di ogni programma Arduino. Il `for` è un ciclo che si ripete un numero preciso di volte tenendo un contatore; il `while` è un ciclo che gira finché una condizione è vera.

## Analogia per la classe

Ragazzi, immaginate una giornata scolastica: `setup()` è il momento in cui arrivate a scuola e preparate i quaderni (si fa una volta sola all'inizio). `loop()` è invece la sequenza di ore — matematica, italiano, scienze — che si ripete ogni giorno all'infinito, sempre nello stesso ordine. Il `for` è come quando il prof dice *"fate questo esercizio 10 volte"*: partite dall'esercizio numero 1, arrivate al 10, e poi vi sedete. Il `while` è come *"studiate questa formula finché non la sapete a memoria"*: non sapete quante volte vi servirà rileggerla, ma smettete non appena la condizione è soddisfatta.

## Cosa succede fisicamente

Arduino esegue le istruzioni una dopo l'altra a 16 milioni al secondo. Senza loop, il programma finirebbe in una frazione di secondo e il microcontrollore si fermerebbe. I loop servono per tenere Arduino *vivo* e occupato indefinitamente, oppure per ripetere un'azione un numero preciso di volte all'interno del flusso.

### 1. `loop()` — il ciclo infinito principale

```arduino
void setup() {
  pinMode(13, OUTPUT);  // eseguito UNA volta all'accensione
}

void loop() {
  // questo blocco gira all'infinito, senza mai fermarsi
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
```

`loop()` non termina mai da solo: ogni volta che arriva all'ultima `}`, ricomincia dall'inizio. Arduino spento = loop interrotto; Arduino acceso = loop riparte da zero.

### 2. `for` — ciclo con contatore

```arduino
// Fade: accendi il LED gradualmente da 0 a 255
for (int i = 0; i <= 255; i += 5) {
  analogWrite(9, i);   // luminosità cresce
  delay(30);
}
// Fade: spegni gradualmente da 255 a 0
for (int i = 255; i >= 0; i -= 5) {
  analogWrite(9, i);   // luminosità decresce
  delay(30);
}
```

Struttura di un `for`:
```
for (inizio; condizione; passo) {
  // istruzioni ripetute
}
```

| Parte       | Esempio       | Significato                              |
|-------------|---------------|------------------------------------------|
| `inizio`    | `int i = 0`   | Crea il contatore e lo azzera            |
| `condizione`| `i <= 255`    | Finché vera, il ciclo continua           |
| `passo`     | `i += 5`      | Aggiorna il contatore dopo ogni giro     |

Nella rotazione del servo (Vol. 3 pag. 90) il `for` porta il braccio da 0° a 180° e ritorno:

```arduino
for (int pos = 0; pos <= 180; pos++) {
  myservo.write(pos);
  delay(15);
}
for (int pos = 180; pos >= 0; pos--) {
  myservo.write(pos);
  delay(15);
}
```

### 3. `while` — ciclo condizionale

```arduino
// Aspetta finché il pulsante non viene premuto
while (digitalRead(2) == HIGH) {
  // non fare niente — aspetta
}
// quando il pulsante viene premuto, esci e continua
digitalWrite(13, HIGH);
```

`while` è ideale quando non si sa quante volte ripetere, ma si conosce la condizione di uscita. Una variante comune è `while (true)` con `break` per uscire:

```arduino
while (true) {
  int val = analogRead(A0);
  if (val > 900) break;   // esci se il sensore supera la soglia
  delay(100);
}
```

### Confronto rapido

| Tipo       | Quando usarlo                                      | Numero di ripetizioni |
|------------|----------------------------------------------------|-----------------------|
| `loop()`   | Cuore del programma — azioni continue              | Infinito              |
| `for`      | Numero di giri noto in anticipo (10 passi, 180°)   | Preciso e contato     |
| `while`    | Numero di giri non noto, dipende da sensore/evento | Variabile             |

## Esperimenti correlati

- **Vol. 3 pag. 47** — v3-cap5-esp1: Blink — prima introduzione a `void loop()` infinito
- **Vol. 3 pag. 49** — v3-cap5-esp2: variazione Blink — `loop()` con `delay` diversi per capire la ripetizione temporizzata
- **Vol. 3 pag. 58** — v3-cap6-semaforo: semaforo a tre LED — sequenza di `digitalWrite` + `delay` dentro `loop()` che si ripete all'infinito
- **Vol. 3 pag. 90** — v3-extra-servo-sweep: Servo Sweep — `for` loop da 0° a 180° e ritorno, primo esempio di ciclo contato
- RAG code chunk — Fade LED: `for (int i = 0; i <= 255; i += 5)` + `analogWrite` per luminosità graduale

## Errori comuni

1. **Mettere tutto in `setup()` invece di `loop()`**: se il codice è in `setup()`, Arduino lo esegue una volta e poi si ferma — il LED lampeggia una volta e basta. Tutto ciò che deve ripetersi (leggere sensori, far lampeggiare luci, controllare pulsanti) deve stare in `loop()`.

2. **Condizione `for` sempre vera — ciclo infinito accidentale**: `for (int i = 0; i >= 0; i++)` non finisce mai perché `i` cresce sempre e resta ≥ 0. Arduino si blocca dentro questo for e non arriva mai al resto del `loop()` — sembra "morto". Controllate sempre che la condizione arrivi a diventare falsa.

3. **`while (true)` senza `break`**: un `while (true)` senza una via d'uscita blocca Arduino per sempre nel ciclo — il pulsante premuto dopo non viene mai registrato, il LED non lampeggia più. Ogni `while (true)` deve avere almeno un `break` o una condizione che eventualmente diventa falsa.

4. **Variabile del `for` usata fuori dal ciclo**: la variabile `i` dichiarata dentro il `for` (`int i = 0`) esiste solo dentro il ciclo. Se provate a usarla dopo la `}` di chiusura, il compilatore dice `was not declared in this scope`. Se serve il valore di `i` dopo il ciclo, dichiaratela fuori: `int i = 0; for (i = 0; i <= 10; i++) {...}`.

5. **Confondere `loop()` con un `for` loop**: `loop()` non ha un contatore e non finisce mai — è la struttura principale obbligatoria di Arduino, non un ciclo che si ripete N volte. Se un ragazzo chiede "quante volte gira?", la risposta è: finché Arduino è acceso. Un `for` invece si conta e si ferma.

## Domande tipiche degli studenti

**"`loop()` si ferma mai?"**
No, `loop()` gira all'infinito finché Arduino è alimentato. Appena arriva alla parentesi graffa di chiusura `}`, ricomincia dall'inizio automaticamente — circa 16 milioni di volte al secondo se vuoto, molto più lento se ci sono `delay()`. Staccare l'alimentazione è l'unico modo per fermarla. Come dice il Vol. 3 pag. 47: `setup()` si esegue una volta, `loop()` si ripete all'infinito.

**"Quante volte gira `loop()` in un secondo?"**
Dipende dal contenuto: un `loop()` vuoto gira milioni di volte al secondo. Con `delay(1000)` gira una volta al secondo (1000 ms ON + 1000 ms OFF = 2 s per ciclo = 0,5 giri/s). Con il Blink di Vol. 3 pag. 47 gira circa ogni 2 secondi. Il `delay()` è il "freno" che rallenta il loop.

**"Qual è la differenza tra `for` e `while`?"**
Il `for` è adatto quando sapete già quante volte ripetere (es. "muovi il servo 180 passi da 0° a 180°"). Il `while` è adatto quando non lo sapete, ma conoscete la condizione di uscita (es. "aspetta finché il pulsante è premuto"). In pratica potete riscrivere qualsiasi `for` come `while` e viceversa — è una questione di leggibilità e intenzione.

**"Posso mettere un `for` dentro `loop()`?"**
Sì, ed è molto comune! Il Fade LED lo fa: dentro `loop()` ci sono due `for` (uno per aumentare la luminosità, uno per diminuirla). Ogni volta che `loop()` riparte, i due `for` si ripetono dall'inizio — il LED continua a pulsare all'infinito. I loop si possono annidare (uno dentro l'altro) con attenzione al numero totale di iterazioni.

## PRINCIPIO ZERO

### Sicurezza

- `loop()`, `for` e `while` non presentano rischi elettrici diretti, ma **un ciclo infinito accidentale dentro `loop()` può rendere il dispositivo non reattivo a comandi di sicurezza** (pulsante di stop, sensore d'emergenza). Se il programma è bloccato dentro un `for` molto lungo o un `while (true)` senza `break`, Arduino non legge i pulsanti nel frattempo.
- Con motori o servo: un `for` che impegna Arduino per molti secondi blocca il controllo della direzione. Nei progetti con parti in movimento, usate cicli brevi o `millis()` per mantenere il `loop()` principale reattivo.
- Il kit ELAB non ha componenti a 230V — i loop non causano danni fisici, ma un ciclo sbagliato può far girare un servo oltre il limite meccanico (0°–180°): non superare questi valori nei `for` sul servo.

### Narrativa — come raccontarlo alla classe

Aprite il libro al **Vol. 3 pag. 47** e mostrate la struttura del programma Blink. Dite: *"Vedete queste due funzioni — `setup()` e `loop()`? Ogni programma Arduino le deve avere. `setup()` si esegue una volta quando accendiamo Arduino. `loop()` invece... non finisce mai. Continua, continua, continua — finché stacchiamo il cavo."*

Poi caricate il Blink e chiedete: *"Quante volte lampeggia il LED in 10 secondi?"* — i ragazzi contano 5 lampeggi. *"Quindi `loop()` ha girato 5 volte in 10 secondi. Ma se tolgo i `delay()`... quante volte girerebbe?"* Senza i delay, il LED lampeggerebbe milioni di volte al secondo — sembrerebbe acceso fisso a metà luminosità. Il delay è il freno del loop.

Per il `for`, passate al **Vol. 3 pag. 90** con il servo sweep. Leggete il codice e dite: *"Questo `for` dice: parti da 0, vai avanti di 1 ogni volta, fermati a 180. Il servo fa esattamente 181 passi — non uno di più, non uno di meno."* Fate girare il servo e contatene i movimenti insieme.

Per il `while`, usate l'analogia del pulsante: *"Scriviamo `while (digitalRead(2) == HIGH)` — Arduino aspetta qui, fermo, finché non premi il pulsante. Appena premi, il pulsante diventa LOW, la condizione diventa falsa, e Arduino esce e fa quello che c'è dopo."*

### Cosa dire ai ragazzi (parole del libro)

> "Prima di scrivere codice, capisci il circuito. setup() si esegue una volta all'avvio, loop() si ripete all'infinito." — Vol. 3 cap. 5 pag. 47

Dopo questa lettura, chiedete: *"Cosa mettete in `setup()` e cosa in `loop()`?"* — aspettate le risposte. La regola è: tutto ciò che si fa una volta (dichiarare pin, aprire Serial) va in `setup()`; tutto ciò che deve ripetersi va in `loop()`. È una delle distinzioni più importanti di tutto il corso.

### Progressione didattica consigliata

1. **`loop()` infinito — Blink**: `setup()` una volta, `loop()` per sempre — la struttura base di ogni sketch (Vol. 3 pag. 47)
2. **`loop()` con più azioni**: semaforo, sirena — più `digitalWrite` + `delay` in sequenza dentro `loop()` — il loop come "partitura musicale" (Vol. 3 pag. 58)
3. **`for` loop — Servo Sweep**: contatore da 0 a 180, il braccio si muove passo dopo passo — numero di ripetizioni noto in anticipo (Vol. 3 pag. 90)
4. **`for` loop — Fade LED**: due `for` annidati in `loop()` — luminosità che cresce e scende in loop infinito
5. **`while` — attesa evento**: Arduino aspetta il pulsante con `while(digitalRead(2) == HIGH)` — ciclo condizionale, numero di giri ignoto, uscita su evento reale

## Link L1 (raw)

Query RAG per recuperare chunk correlati da `src/data/rag-chunks.json`:
- `"loop infinito setup arduino struttura"` → chunk code-1, tip-1, analogia-3
- `"void setup void loop programma base"` → chunk code-1, text-vol3-cap5
- `"for loop arduino contatore"` → code-13 (fade), code-11 (servo sweep), analogia-4 (giro di pista)
- `"for int i 0 255 analogWrite fade"` → code-13
- `"for pos servo sweep 180 gradi"` → code-11
- `"while arduino condizione pulsante"` → code-2, tip-3
- `"ciclo ripetizione arduino programmazione"` → analogia-3, analogia-4, text-vol3-cap5

bookText citati da `src/data/volume-references.js`:
- `v3-cap5-esp1` (pag. 47) — `void setup()` + `void loop()`, primo sketch Blink, loop infinito
- `v3-cap5-esp2` (pag. 49) — variazione delay nel Blink — loop con tempi diversi
- `v3-cap6-semaforo` (pag. 58) — tre LED in sequenza dentro `loop()` — la loop come "partitura" temporizzata
- `v3-extra-servo-sweep` (pag. 90) — `for (int pos = 0; pos <= 180; pos++)` — primo for loop contato su attuatore fisico
