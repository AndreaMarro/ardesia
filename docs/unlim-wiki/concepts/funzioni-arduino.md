---
id: funzioni-arduino
type: concept
title: "Funzioni Arduino — riusare blocchi di codice"
locale: it
volume_ref: null
pagina_ref: null
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
source_status: general_knowledge_only
fix_iter44_W2: "Pagine fabbricate. Concept marcato general_knowledge_only."
tags: [funzioni, riuso, parametri, return, programmazione, arduino, vol3]
---

## Definizione

Una **funzione** è un blocco di codice nominato che si può chiamare più volte senza riscriverlo. Vol. 3 pag. 110 introduce: "le funzioni sono come i nomi delle ricette: una volta scritta la ricetta, basta dire il nome per usarla".

Sintassi:
```cpp
tipoRitornato nomeFunzione(parametri) {
  // istruzioni
  return valore;  // se tipoRitornato non è void
}
```

Esempio minimo:
```cpp
int somma(int a, int b) {
  return a + b;
}

void loop() {
  int risultato = somma(3, 5);   // risultato = 8
}
```

## Anatomia di una funzione

| Parte | Esempio | Significato |
|-------|---------|-------------|
| Tipo ritornato | `int`, `float`, `void`, `bool` | Cosa restituisce (`void` = niente) |
| Nome | `somma`, `lampeggia`, `leggiTemp` | Identificatore camelCase |
| Parametri | `(int a, int b)` | Input ricevuti dall'esterno |
| Corpo | `{ ... }` | Istruzioni eseguite alla chiamata |
| Return | `return valore;` | Restituisce risultato (omessa se void) |

## Esempi pratici Vol. 3

**Funzione con parametri (lampeggio personalizzabile):**
```cpp
void lampeggia(int pin, int ms) {
  digitalWrite(pin, HIGH);
  delay(ms);
  digitalWrite(pin, LOW);
  delay(ms);
}

void loop() {
  lampeggia(13, 500);   // LED su pin 13 lampeggia 500 ms
  lampeggia(12, 200);   // LED su pin 12 lampeggia 200 ms
}
```

**Funzione che ritorna valore (calcolo temperatura):**
```cpp
float leggiTemperatura() {
  int raw = analogRead(A0);
  float vout = raw * (5.0 / 1023.0);
  return (vout - 0.5) * 100.0;  // °C
}

void loop() {
  float t = leggiTemperatura();
  if (t > 30.0) {
    digitalWrite(LED_ALLARME, HIGH);
  }
}
```

**Funzione bool (utile per condizioni):**
```cpp
bool pulsantePremuto() {
  return digitalRead(BUTTON) == LOW;
}

void loop() {
  if (pulsantePremuto()) {
    Serial.println("click !");
    delay(50);
  }
}
```

## Perché usare funzioni

Vol. 3 pag. 110 elenca tre ragioni:
1. **Riuso**: scrivere una volta, chiamare N volte
2. **Leggibilità**: `if (pulsantePremuto())` è più chiaro di `if (digitalRead(BUTTON) == LOW)`
3. **Manutenzione**: cambiare la logica in UN posto si propaga ovunque

```cpp
// SENZA funzioni (ripetuto 3 volte, fragile)
digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500);
digitalWrite(12, HIGH); delay(500); digitalWrite(12, LOW); delay(500);
digitalWrite(11, HIGH); delay(500); digitalWrite(11, LOW); delay(500);

// CON funzioni (lampeggia 3 LED, leggibile)
lampeggia(13, 500);
lampeggia(12, 500);
lampeggia(11, 500);
```

## Posizionamento nello sketch

Arduino IDE accetta tre posizioni per dichiarare funzioni:

**1. Prima di setup() (preferito Vol. 3):**
```cpp
void miaFunzione() { ... }   // ← qui

void setup() { ... }
void loop() { ... }
```

**2. Dopo loop() (Arduino IDE risolve automaticamente con auto-prototyping):**
```cpp
void setup() { ... }
void loop() { miaFunzione(); }

void miaFunzione() { ... }   // ← anche qui funziona
```

**3. In file separato (.ino o .h)** — per sketch grandi, Vol. 3 pag. 115.

Vol. 3 pag. 110 raccomanda **opzione 1** per chiarezza didattica.

## Parametri per valore vs riferimento

**Per valore (default)**: il parametro è una copia, modifiche non si propagano.
```cpp
void raddoppia(int x) { x = x * 2; }   // x è copia locale
int n = 5;
raddoppia(n);
// n è ancora 5, NON 10
```

**Per riferimento (`&`)**: il parametro è alias all'originale.
```cpp
void raddoppia(int &x) { x = x * 2; }  // x è alias di n
int n = 5;
raddoppia(n);
// ora n = 10
```

Vol. 3 pag. 113 introduce riferimenti come "tecnica avanzata" — utile per modificare variabili esterne senza global.

## Errori comuni

1. **Dimenticare `return`** — Funzione `int somma(int a, int b) { a + b; }` senza `return` fa l'addizione ma butta il risultato. Compilatore avvisa "control reaches end of non-void function".

2. **Tipo ritornato sbagliato** — `int leggiTemperatura()` con `return 25.7;` tronca a 25 (perdita decimali). Usare `float` se il valore non è intero.

3. **Modificare parametro per valore aspettandosi propagazione** — Vedi sopra `raddoppia`. Se serve modifica, usare `&` (riferimento).

4. **Funzione con stesso nome di variabile** — `int delay; void delay(int ms) { ... }` confonde il compilatore. Sempre nomi univoci.

5. **Chiamata ricorsiva senza condizione di uscita** — `void f() { f(); }` riempie lo stack di Arduino (~2 KB) → crash. Funzioni ricorsive devono avere caso base.

## Esperimenti correlati

- **Vol. 3 pag. 110** — Prima funzione: `lampeggia(pin, ms)`
- **Vol. 3 pag. 113** — Funzioni con return + riferimenti
- **Vol. 3 pag. 115** — Sketch grandi: file .h separati
- **Vol. 3 pag. 120** — Funzioni callback per eventi (preview cap avanzato)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 110):
> "Le funzioni sono come i nomi delle ricette: una volta scritta la ricetta, basta dire il nome per usarla."

**Cosa fare:**
- Mostrate ai ragazzi uno sketch lungo con codice ripetuto. Chiedete: "vi piace riscrivere lo stesso pezzo 3 volte?". Introducete funzione come soluzione
- Vol. 3 pag. 110 raccomanda di partire SEMPRE da funzione `void` senza parametri, poi aggiungere parametri, poi return
- Disegnate sulla LIM una "scatola nera": input parametri → magia interna → output return. Ragazzi visualizzano l'astrazione
- Fate inventare ai ragazzi un nome di funzione per un'azione: "lampeggia", "ascolta", "controlla". Naming è metà del valore di una funzione

**Sicurezza:**
- Niente specifico, ma funzioni profonde (>10 chiamate annidate) consumano stack — overflow su Arduino Nano (2 KB SRAM)
- Variabili `static` dentro funzioni mantengono valore tra chiamate — utile ma confonde se non documentato

**Cosa NON fare:**
- Non insegnate funzioni ricorsive prima della superiore — concetto astratto difficile
- Non usate funzioni per ogni 2 righe di codice — perde leggibilità. Funzioni utili = blocchi >5 righe riusati ≥2 volte
- Non sottomettete sketch dove la stessa funzione è dichiarata in due file: errore "duplicate declaration"

## Link L1 (raw RAG queries)

- `"funzione Arduino parametri return"`
- `"riuso codice funzione"`
- `"parametro per valore vs riferimento"`
- `"void function senza ritorno"`
- `"prototipo funzione Arduino IDE"`
