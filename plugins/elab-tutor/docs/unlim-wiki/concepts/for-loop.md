---
id: for-loop
type: concept
title: "Ciclo for — ripetere un blocco N volte"
locale: it
volume_ref: 3
pagina_ref: 67
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [for, ciclo, loop, ripetizione, programmazione, arduino, vol3]
---

## Definizione

Il ciclo `for` è un costrutto C++ che esegue un blocco di codice **un numero noto di volte**. Vol. 3 pag. 67 lo introduce dopo `if-else` come "il modo per dire ad Arduino: fai questa cosa N volte e poi vai avanti".

Sintassi:
```cpp
for (int i = 0; i < 10; i++) {
  // istruzioni ripetute 10 volte
}
```

Tre parti tra parentesi:
1. **Inizializzazione** (`int i = 0`): variabile contatore creata UNA volta
2. **Condizione** (`i < 10`): verificata PRIMA di ogni ripetizione; quando falsa esce dal ciclo
3. **Incremento** (`i++`): eseguito DOPO ogni ripetizione; equivalente a `i = i + 1`

## Analogia per la classe

Ragazzi, è come dire "Fai 10 flessioni": c'è un contatore (1, 2, 3...), una regola di stop (fino a 10), e un "fai questa cosa" che si ripete. In codice è la stessa idea, ma Arduino conta in modo perfetto e velocissimo.

## Esempi pratici dal Vol. 3

**Lampeggiare un LED 5 volte (Vol. 3 pag. 67):**
```cpp
for (int i = 0; i < 5; i++) {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
```

**Effetto fade incrementale (Vol. 3 pag. 71):**
```cpp
for (int valore = 0; valore <= 255; valore += 5) {
  analogWrite(LED_PIN, valore);
  delay(30);
}
```

**Accendere 6 LED in sequenza (Vol. 3 pag. 78, semaforo capitolo):**
```cpp
int pinLed[6] = {2, 3, 4, 5, 6, 7};
for (int i = 0; i < 6; i++) {
  digitalWrite(pinLed[i], HIGH);
  delay(200);
}
```

## Differenza for vs while

`for` è preferito quando il numero di ripetizioni è **noto in anticipo**. `while` quando dipende da una condizione esterna (es. "fino a quando il pulsante è premuto").

```cpp
// for: lo so già che voglio 10 ripetizioni
for (int i = 0; i < 10; i++) { ... }

// while: continuo finché il sensore lo dice
while (digitalRead(BUTTON) == LOW) { ... }
```

## Errori comuni

1. **Off-by-one** — `for (int i = 0; i <= 10; i++)` esegue 11 volte (da 0 a 10 incluso), non 10. Usate `i < 10` per esattamente 10 ripetizioni partendo da 0.

2. **Modificare il contatore dentro il blocco** — Cambiare `i` dentro il `for` rompe la logica e crea bug difficili da trovare. Usate una variabile separata se serve.

3. **Dimenticare l'incremento** — `for (int i = 0; i < 10; )` senza `i++` crea un loop infinito perché `i` resta sempre 0.

4. **Variabile fuori scope** — La `i` dichiarata nel `for` esiste SOLO dentro il blocco. Per usarla dopo, dichiarare prima del `for`.

5. **delay() troppo lungo dentro il ciclo** — Un ciclo di 1000 ripetizioni con `delay(1000)` blocca Arduino per 1000 secondi (16 minuti!). Calcolare sempre il tempo totale.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 67):
> "Il ciclo for è il modo per dire ad Arduino: fai questa cosa N volte e poi vai avanti."

**Cosa fare:**
- Scrivete sulla LIM le tre parti: inizializzazione, condizione, incremento. Fate ripetere ad alta voce: "i parte da 0, va finché è minore di 10, e ogni volta cresce di 1"
- Mostrate il primo esempio (LED lampeggia 5 volte) e fate contare ai ragazzi le accensioni
- Chiedete: "Cosa succede se cambio `i < 5` con `i < 100`?" → introduce l'idea di parametrizzazione
- Vol. 3 pag. 67 raccomanda di partire SEMPRE con esempi a contatore basso (3, 5, 10) prima di passare a 100+

**Cosa NON fare:**
- Non introducete cicli annidati (`for` dentro `for`) prima che i ragazzi padroneggino il singolo ciclo
- Non usate il ciclo come scusa per evitare di parlare di `delay()` non bloccante (millis()) — quello viene dopo

## Link L1 (raw RAG queries)

- `"ciclo for Arduino LED"`
- `"for loop ripetizione contatore"`
- `"differenza for while Arduino"`
- `"esempio for fade analogWrite"`
- `"errore off-by-one ciclo"`
