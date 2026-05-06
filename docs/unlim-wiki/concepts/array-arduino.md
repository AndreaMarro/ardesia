---
id: array-arduino
type: concept
title: "Array Arduino — collezioni di valori dello stesso tipo"
locale: it
volume_ref: 3
pagina_ref: 78
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
fix_iter44_W2: "Body citazioni Vol.3 pag.100/105 fabbricate (Vol.3 max=95) → marcate concetto generale. Frontmatter pag.78 mantenuto (in range)."
tags: [array, collezione, indice, programmazione, arduino, vol3]
---

## Definizione

Un **array** è una sequenza di valori dello stesso tipo memorizzati uno dopo l'altro. Vol. 3 pag. 78 introduce: "l'array è come una fila di cassetti numerati: ogni cassetto contiene un valore, e accediamo per numero".

Sintassi:
```cpp
int pinLed[6] = {2, 3, 4, 5, 6, 7};
//  ↑    ↑      ↑   ↑   ↑   ↑   ↑   ↑
// tipo nome  dim   valori iniziali
```

Accesso ai valori per **indice** (parte da 0):
```cpp
pinLed[0] = 2;   // primo elemento
pinLed[5] = 7;   // sesto elemento
pinLed[6];       // !!! ERRORE — indice 6 fuori bounds (array ha 6 elementi 0-5)
```

## Analogia per la classe

Ragazzi, immaginate una rastrelliera con 6 caselle, ognuna numerata da 0 a 5. Ogni casella contiene un oggetto. Per prendere o mettere un oggetto, dite il numero della casella. Negli array funziona uguale.

## Pattern semaforo Vol. 3 (esempio iconico)

Vol. 3 pag. 78 introduce array con il capitolo semaforo:

```cpp
const int N_LED = 6;
int pinLed[N_LED] = {2, 3, 4, 5, 6, 7};

void setup() {
  for (int i = 0; i < N_LED; i++) {
    pinMode(pinLed[i], OUTPUT);
  }
}

void loop() {
  // accendi tutti in sequenza
  for (int i = 0; i < N_LED; i++) {
    digitalWrite(pinLed[i], HIGH);
    delay(200);
  }
  // spegni tutti in sequenza
  for (int i = 0; i < N_LED; i++) {
    digitalWrite(pinLed[i], LOW);
    delay(200);
  }
}
```

Confronto SENZA array (più lungo, fragile):
```cpp
pinMode(2, OUTPUT); pinMode(3, OUTPUT); pinMode(4, OUTPUT);
pinMode(5, OUTPUT); pinMode(6, OUTPUT); pinMode(7, OUTPUT);
digitalWrite(2, HIGH); delay(200);
digitalWrite(3, HIGH); delay(200);
// ... 6 righe quasi identiche per spegnere
```

## Pattern campionamento sensori

Acquisire 100 letture analogiche (Vol. 3 pag. 100 datalogger):
```cpp
int campioni[100];
for (int i = 0; i < 100; i++) {
  campioni[i] = analogRead(A0);
  delay(10);
}

// Calcolo media
long somma = 0;
for (int i = 0; i < 100; i++) {
  somma += campioni[i];
}
float media = somma / 100.0;
```

## Tipi di array comuni

| Sintassi | Uso |
|----------|-----|
| `int x[10];` | 10 interi (non inizializzati, contenuto casuale) |
| `int x[5] = {1,2,3,4,5};` | 5 interi inizializzati |
| `int x[] = {1,2,3};` | dimensione dedotta (3) |
| `char nome[20];` | stringa C (max 19 caratteri + '\0') |
| `byte valori[256];` | array di byte (0-255 ciascuno) |
| `bool stati[8];` | array di booleani |

## Memoria — limite cruciale Arduino Nano

Arduino Nano ha **2 KB SRAM**. Array consumano memoria:
| Array | Bytes |
|-------|-------|
| `int x[100]` (int = 2 byte) | 200 bytes |
| `int x[1000]` | **2000 bytes = TUTTA SRAM** !! |
| `byte x[1000]` | 1000 bytes |
| `char nome[100]` | 100 bytes |

Vol. 3 pag. 80 raccomanda: array > 100 elementi richiedono attenzione. Per dati grandi usare PROGMEM (memoria flash, 32 KB) o EEPROM.

## Errori comuni

1. **Indice out-of-bounds** — `int x[5]; x[5] = 0;` scrive su memoria casuale (Arduino non controlla bounds). Sintomo: variabili adiacenti corrompono. Sempre `i < dim`, non `i <= dim`.

2. **Confondere dimensione con ultimo indice** — Array di 6 elementi ha indici 0-5, NON 1-6. Off-by-one comune.

3. **Modificare lunghezza dopo dichiarazione** — `int x[5]` ha dimensione fissa 5. `x[6] = 1;` non "estende" l'array — scrive in memoria adiacente. Per array dinamici usare `Vector` (libreria) o `malloc()` (avanzato).

4. **Stack overflow con array enormi local** — `void miaFn() { int x[1000]; }` alloca 2000 byte sullo stack della funzione → overflow garantito. Array grandi sempre `static` o globali.

5. **Confondere array char con String** — `char nome[10] = "ciao";` è array C-string. `String nome = "ciao";` è oggetto Arduino String (più comodo ma più lento + frammentazione heap). Vol. 3 pag. 82 raccomanda char[] per progetti memory-tight.

## Esperimenti correlati

- **Vol. 3 pag. 78** — Primo array: semaforo 6 LED in sequenza
- **Vol. 3 pag. 80** — Array di byte per pattern visivi (matrice LED)
- **Vol. 3 pag. 100** — Datalogger con array di campioni
- **Vol. 3 pag. 105** — Array bidimensionale per matrice 8×8

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 78):
> "L'array è come una fila di cassetti numerati: ogni cassetto contiene un valore, e accediamo per numero."

**Cosa fare:**
- Vol. 3 pag. 78 raccomanda di insegnare array DOPO `for` (richiede iterazione su indici). Mai prima
- Disegnate sulla LIM "fila di cassetti": numeri sopra (0, 1, 2...), valori dentro. Mostrate `arr[2]` come "apri il cassetto numero 2"
- Esempio semaforo è iconico: 6 LED accesi in sequenza è visivamente potente
- Spiegate l'indice partendo da 0 con esempio concreto: "il piano terra di un edificio è il piano 0, non il piano 1"
- Insegnate `for + array` come accoppiata standard. NON ha senso array senza iteratore

**Sicurezza:**
- Out-of-bounds NON dà errore in Arduino (no protezione runtime). Sintomi: variabili "saltano" valore, sketch si comporta in modo strano. Insegnare a contare gli elementi attentamente
- Array > 200 elementi può causare instabilità su Nano. Verificare con `freeMemory()` library quanto spazio resta

**Cosa NON fare:**
- Non usate array di `String` Arduino (`String arr[10]`) — frammentazione heap garantita
- Non passate array per valore alle funzioni (in C array si passano per riferimento implicito; sintassi è `void f(int arr[])` o `void f(int *arr)`)
- Non insegnate array bidimensionali prima che ragazzi padroneggiano monodimensionali

## Link L1 (raw RAG queries)

- `"array Arduino indice"`
- `"semaforo array LED for"`
- `"out-of-bounds array Arduino"`
- `"PROGMEM array memoria flash"`
- `"char array vs String Arduino"`
