---
id: string-arduino
type: concept
title: "String Arduino — gestire testo (con cautele)"
locale: it
volume_ref: 3
pagina_ref: 82
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [string, testo, char-array, frammentazione-heap, programmazione, arduino, vol3]
---

## Definizione

In Arduino esistono **due modi** di gestire testo:

1. **`String`** (oggetto Arduino, classe C++): facile da usare, ma rischia frammentazione heap su sketch lunghi
2. **`char[]`** (array di char C-style): più tecnico, ma efficiente in memoria e prevedibile

Vol. 3 pag. 82 introduce: "String è comodo per imparare, char[] è il modo professionale di gestire testo su Arduino".

## Esempi a confronto

**Con String (semplice):**
```cpp
String saluto = "Ciao ";
String nome = "ragazzi";
String messaggio = saluto + nome + "!";  // concatenazione
Serial.println(messaggio.length());        // metodo: 13
Serial.println(messaggio);                  // "Ciao ragazzi!"
```

**Con char[] (efficiente):**
```cpp
char saluto[] = "Ciao ";
char nome[] = "ragazzi";
char messaggio[30];
strcpy(messaggio, saluto);
strcat(messaggio, nome);
strcat(messaggio, "!");
Serial.println(strlen(messaggio));   // 13
Serial.println(messaggio);            // "Ciao ragazzi!"
```

## Perché char[] preferito su sketch lunghi

`String` alloca memoria nell'heap dinamicamente. Ogni concatenazione (`+`) può:
1. Allocare nuovo blocco (size = old + new)
2. Copiare contenuto vecchio
3. Liberare blocco vecchio
4. Lasciare "buco" nella heap

Dopo molte operazioni, l'heap diventa **frammentata**: spazio totale libero OK, ma blocchi grandi non più disponibili → crash.

Vol. 3 pag. 82 raccomanda: progetti **lunghi (>50 righe codice testuale)** → usare char[]. Progetti **brevi/educational** → String OK.

## Metodi String comuni

| Metodo | Esempio | Risultato |
|--------|---------|-----------|
| `length()` | `s.length()` | numero caratteri |
| `charAt(i)` | `s.charAt(0)` | char a posizione i |
| `substring(start, end)` | `s.substring(0, 4)` | sottostringa |
| `indexOf(c)` | `s.indexOf('a')` | posizione del char (-1 se non trovato) |
| `toInt()` | `"42".toInt()` | converte a int |
| `toFloat()` | `"3.14".toFloat()` | converte a float |
| `equals(other)` | `s.equals("ciao")` | confronto |
| `replace(old, new)` | `s.replace("a", "b")` | sostituzione |
| `trim()` | `s.trim()` | rimuove spazi inizio/fine |
| `toUpperCase()` | `s.toUpperCase()` | UPPERCASE |

## Funzioni char[] comuni (string.h)

| Funzione | Esempio | Risultato |
|----------|---------|-----------|
| `strlen(s)` | `strlen("ciao")` | 4 |
| `strcpy(dst, src)` | `strcpy(buf, "ciao")` | copia stringa |
| `strcat(dst, src)` | `strcat(buf, "!")` | concatena |
| `strcmp(s1, s2)` | `strcmp("a", "b")` | < 0, == 0, > 0 |
| `strchr(s, c)` | `strchr("abc", 'b')` | pointer al char (NULL se non) |
| `sprintf(buf, fmt, ...)` | `sprintf(buf, "T=%d", 25)` | formatting |
| `atoi(s)` | `atoi("42")` | int |
| `atof(s)` | `atof("3.14")` | float |

## Esempio pratico — formattare messaggio sensore

**Con String:**
```cpp
float temp = 23.5;
int humid = 65;
String msg = "T=" + String(temp, 1) + "C H=" + String(humid) + "%";
Serial.println(msg);  // "T=23.5C H=65%"
```

**Con char[] + sprintf:**
```cpp
float temp = 23.5;
int humid = 65;
char msg[40];
sprintf(msg, "T=%.1fC H=%d%%", temp, humid);
Serial.println(msg);  // "T=23.5C H=65%"
```

## Errori comuni

1. **Frammentazione heap progressiva** — Sketch con `String` in `loop()` → memoria libera diminuisce nel tempo → crash dopo ore. Sintomo classico: funziona 1h poi `Serial.print` smette di stampare. Soluzione: char[] o evitare concatenazione runtime.

2. **Buffer char[] troppo piccolo** — `char buf[10]; strcpy(buf, "stringa lunga 20 char");` overflow. Sempre allocare buffer ≥ stringa max + 1 (per '\0' terminatore).

3. **Dimenticare '\0' nel char[]** — `char s[5] = {'c','i','a','o'};` SENZA terminatore. `Serial.println(s)` stampa garbage. Sempre `char s[] = "ciao";` (compilatore aggiunge '\0' automaticamente).

4. **Confondere `==` con `equals` su String** — `if (s1 == s2)` su String funziona (operator overload), ma su char[] confronta puntatori, NON contenuto. Usare `strcmp()` per char[].

5. **String su PROGMEM senza F() macro** — `Serial.println("Stringa lunga in flash");` non usa flash di default. Usare `Serial.println(F("..."))` per messaggi statici lunghi e risparmiare SRAM.

## F() macro — risparmio SRAM con stringhe letterali

```cpp
// SCONSIGLIATO — stringa va in SRAM (sprecata)
Serial.println("Questa è una stringa molto lunga di esempio");

// CONSIGLIATO — F() forza in PROGMEM
Serial.println(F("Questa è una stringa molto lunga di esempio"));
```

Con `F()`, la stringa resta in flash, NON occupa SRAM. Critical su sketch con molti `Serial.println`. Vol. 3 pag. 84 raccomanda F() per ogni messaggio statico.

## Esperimenti correlati

- **Vol. 3 pag. 82** — Primo confronto String vs char[]
- **Vol. 3 pag. 84** — F() macro per messaggi tutorial PROGMEM
- **Vol. 3 pag. 87** — sprintf per formattare letture sensori
- **Vol. 3 pag. 90** — Parser comando seriale con char[]

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 82):
> "String è comodo per imparare, char[] è il modo professionale di gestire testo su Arduino."

**Cosa fare:**
- Vol. 3 pag. 82 raccomanda di insegnare PRIMA `String` (più semplice), POI char[] quando ragazzi capiscono memoria
- Mostrate empiricamente la frammentazione heap: sketch che concatena String 1000 volte → measure `freeMemory()` (libreria) e vedere SRAM scendere
- Per progetti tutorial brevi (Vol. 3 pag. 1-80): String è OK
- Per progetti capstone (matrice LED scrolling, datalogger lungo, parser seriale): obbligatorio char[]
- Insegnate F() macro come "trucco utile" per ogni `Serial.println` con stringa fissa

**Sicurezza:**
- Buffer overflow in char[] non genera errore Arduino (no protezione runtime). Sintomo: crash random, variabili modificate inspiegabilmente
- String memory leaks su sketch web/IoT che girano per giorni: sketch sembra OK 6 ore poi muore. Difficile da debuggare

**Cosa NON fare:**
- Non usate String dentro `loop()` con concatenazioni — ogni iterazione frammenta più
- Non aspettatevi che `String += ` sia veloce — è O(n²) per concatenazioni multiple
- Non passate `String` per valore ai funzioni: copia tutto, lento. Usare `const String&` (riferimento)

## Link L1 (raw RAG queries)

- `"String char array Arduino differenza"`
- `"frammentazione heap Arduino"`
- `"F macro PROGMEM stringa"`
- `"sprintf Arduino formatting"`
- `"strcpy strcat strlen string.h"`
