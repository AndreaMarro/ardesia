---
id: while-loop
type: concept
title: "Ciclo while — ripetere finché una condizione è vera"
locale: it
volume_ref: 3
pagina_ref: 70
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
fix_iter44_W2: "Body citazione Vol.3 pag.100 fabbricata marcata concetto generale. Frontmatter pag.70 OK."
tags: [while, ciclo, loop, condizione, programmazione, arduino, vol3]
---

## Definizione

Il ciclo `while` esegue un blocco di codice **finché una condizione resta vera**. A differenza di `for` (numero noto di ripetizioni), `while` è ideale quando le ripetizioni dipendono da un evento esterno (sensore, pulsante, valore variabile).

Vol. 3 pag. 70 lo introduce come "il modo per dire ad Arduino: continua a fare questa cosa fino a quando la situazione cambia".

Sintassi:
```cpp
while (condizione) {
  // istruzioni ripetute finché condizione è vera
}
```

La condizione viene verificata **PRIMA** di ogni iterazione. Quando diventa falsa, esce dal ciclo.

## Analogia per la classe

Ragazzi, è come dire "Continua a battere le mani finché ti dico stop". Non sai a priori quante volte batterai — dipende da quando arriva lo stop. Anche `while` non conosce il numero di ripetizioni in anticipo.

## Esempi pratici Vol. 3

**Aspettare pulsante premuto (Vol. 3 pag. 70):**
```cpp
while (digitalRead(BUTTON) == HIGH) {
  // pulsante non premuto → non fa niente
  delay(10);
}
// quando pulsante premuto, esce dal while
digitalWrite(LED, HIGH);
```

**Leggere finché temperatura sotto soglia (Vol. 3 pag. 95):**
```cpp
while (leggiTemperatura() < 30.0) {
  digitalWrite(VENTILA, LOW);   // ventola spenta finché < 30°C
  delay(1000);
}
digitalWrite(VENTILA, HIGH);    // accende ventola superata soglia
```

**Acquisire campioni finché contenitore pieno (Vol. 3 pag. 100):**
```cpp
int campioni[100];
int n = 0;
while (n < 100) {
  campioni[n] = analogRead(A0);
  n++;
  delay(10);
}
// elabora campioni qui
```

## while vs for — quando usare

| Caso | Costrutto preferito |
|------|---------------------|
| Ripetizioni note in anticipo (10 volte) | `for` |
| Ripetizioni dipendono da evento esterno | `while` |
| Iterare su array di lunghezza nota | `for` |
| Aspettare cambio di stato sensore | `while` |
| Polling con timeout | `while` con check `millis()` |

**Vol. 3 pag. 70 raccomanda**: imparare `for` PRIMA, poi `while`. `for` è più strutturato, `while` più potente ma più rischioso.

## Loop infinito — pericolo principale di while

```cpp
int i = 0;
while (i < 10) {
  Serial.println(i);
  // ERRORE: dimenticato i++  → i resta 0 → loop infinito
}
```

Conseguenze del loop infinito:
- Arduino "freezato" — non risponde a Serial, pulsanti, watchdog
- Per uscire serve **reset fisico** (pulsante reset Nano)
- In sketch lunghi può corrompere EEPROM se interrupt scriveva quando bloccato

**Difesa**: aggiungere SEMPRE una **condizione di uscita** verificabile dentro il while.

## Pattern timeout (uscita di sicurezza)

```cpp
unsigned long start = millis();
const unsigned long TIMEOUT = 5000; // 5 secondi max

while (digitalRead(BUTTON) == HIGH) {
  if (millis() - start > TIMEOUT) {
    Serial.println("Timeout — pulsante non premuto in 5s");
    break;  // esce forzatamente
  }
  delay(10);
}
```

`break` interrompe il while immediatamente. Vol. 3 pag. 73 raccomanda timeout in OGNI while che dipende da input esterno.

## do-while — verifica condizione DOPO

Variante: `do { ... } while (condizione);` esegue ALMENO UNA volta, poi verifica.

```cpp
int letto;
do {
  letto = analogRead(A0);
} while (letto < 500);  // ripete finché < 500, ma legge almeno 1 volta
```

Caso d'uso: quando l'azione deve avvenire prima del check (es. leggere sensore prima di valutare).

## Errori comuni

1. **Loop infinito da contatore mancante** — `while (i < 10) { ... }` senza `i++`. Soluzione: ALWAYS aggiornare la variabile di condizione dentro il loop.

2. **Condizione sempre vera** — `while (true) { ... }` o `while (1)` è loop infinito intenzionale (raro in Arduino, usato solo in `loop()` implicito). Sketch normali NON ne hanno bisogno.

3. **Confronto sbagliato (`=` invece di `==`)** — `while (x = 0)` assegna 0 a x, ritorna 0 (falso): loop NON entra. Sintomo: il blocco non gira mai. Sempre `==` per uguaglianza.

4. **Polling sensore senza delay** — `while (digitalRead(BUTTON))` senza delay esegue milioni di volte al secondo, scalda il microcontroller, può saturare debounce. Aggiungere `delay(10-50)`.

5. **Modifica variabile dall'esterno (interrupt)** — Se condizione dipende da variabile modificata da ISR, dichiarare la variabile `volatile`. Senza `volatile`, il compilatore può "ottimizzare" via il check.

## Esperimenti correlati

- **Vol. 3 pag. 67** — Ciclo for (vedi `for-loop.md`)
- **Vol. 3 pag. 70** — Primo while: aspetta pulsante
- **Vol. 3 pag. 73** — Pattern timeout con break
- **Vol. 3 pag. 95** — Termostato: while temperatura sotto soglia (vedi `tmp36.md`)
- **Vol. 3 pag. 100** — Acquisizione campioni con condizione di stop

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 70):
> "Il while è il modo per dire ad Arduino: continua a fare questa cosa fino a quando la situazione cambia."

**Cosa fare:**
- Mostrate prima `for` (ripetizioni note), poi introducete `while` (ripetizioni dipendenti)
- Disegnate sulla LIM il "diagramma di flusso": rombo "condizione vera?" → blocco → ritorno al rombo
- Vol. 3 pag. 70 raccomanda esempi visibili: while con LED che lampeggia finché pulsante non premuto. Ragazzi vedono input cambiare → output cambia
- Insegnate il timeout pattern come **regola di sicurezza** per tutti i while con input esterno

**Sicurezza:**
- Loop infinito in pubblico (LIM proiettata): Arduino sembra "rotto" → confusione classe. Sempre testare prima della lezione
- Watchdog: Arduino Nano R4 ha watchdog disabilitato di default. Loop infinito = reset fisico. Per progetti delicati abilitare watchdog (`wdt_enable`)

**Cosa NON fare:**
- Non usate `while (true)` come scorciatoia per `loop()` — confonde + è scorretto stile
- Non scrivete while complesse con multiple condizioni (`while (a && b || c)`) prima che ragazzi padroneggiano `if` con stesse condizioni

## Link L1 (raw RAG queries)

- `"ciclo while Arduino condizione"`
- `"while loop pulsante sensore"`
- `"loop infinito break timeout"`
- `"do-while differenza while"`
- `"volatile variabile interrupt while"`
