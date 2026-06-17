---
id: variabili-arduino
type: concept
title: "Variabili in Arduino — Memorizzare dati nel programma"
locale: it
volume_ref: 3
pagina_ref: 63
created_at: 2026-04-27
updated_at: 2026-04-27
updated_by: scribe
tags: [variabili, int, float, bool, byte, dichiarazione, tipo, scope, costante, overflow, arduino, programmazione]
---

## Definizione

Una variabile è uno spazio nominato nella memoria di Arduino dove il programma può salvare, leggere e modificare un valore. Vol. 3 pag. 63 le introduce così: "una variabile è come una scatola con un'etichetta — ci metti dentro un numero, lo usi quando serve, e puoi cambiarlo in qualsiasi momento".

## Analogia per la classe

Ragazzi, immaginate di avere tante scatole colorate su un ripiano. Su ogni scatola c'è scritto il suo nome — "luminosità", "temperatura", "conta" — e dentro ci sta esattamente un tipo di oggetto: solo numeri interi, oppure solo numeri decimali, oppure solo vero/falso. Ogni volta che il programma ha bisogno di quel valore, apre la scatola giusta e lo legge. Ogni volta che il valore cambia, lo rimette dentro aggiornato. Arduino fa esattamente questo con le variabili: le scatole sono nella sua memoria RAM (2 KB sull'ATmega328p — piccola ma veloce).

## Cosa succede fisicamente

Nella RAM di Arduino ogni variabile occupa un certo numero di byte. Quando dichiarate `int luminosita = 0;`, Arduino riserva 2 byte in RAM e ci scrive il numero 0. Quando il programma esegue `luminosita = analogRead(A0)`, quei 2 byte vengono sovrascritti con il nuovo valore.

### Tabella dei tipi principali

| Tipo       | Byte | Range                                    | Uso tipico                       |
|------------|------|------------------------------------------|----------------------------------|
| `bool`     | 1    | `true` / `false`                         | stato LED, flag acceso/spento    |
| `byte`     | 1    | 0 – 255                                  | valore `analogWrite`, colori RGB |
| `int`      | 2    | −32 768 → +32 767                        | contatore, valore sensore        |
| `long`     | 4    | −2 147 483 648 → +2 147 483 647          | tempo con `millis()`             |
| `float`    | 4    | ±3.4 × 10³⁸ (precisione ~6-7 cifre)     | temperatura in gradi             |
| `char`     | 1    | carattere ASCII (es. `'A'`, `'0'`)       | singolo carattere                |
| `String`   | var  | testo di lunghezza arbitraria            | messaggi `Serial.print`          |

### Sintassi: dichiarare e usare una variabile

```arduino
// dichiarazione con inizializzazione
int luminosita = 0;        // intero, iniziato a 0
float temperatura = 25.5;  // decimale
bool acceso = false;       // vero/falso
const int PIN_LED = 9;     // costante: non può cambiare

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  luminosita = luminosita + 10;  // aggiorna la variabile
  if (luminosita > 255) {
    luminosita = 0;              // torna a zero quando supera 255
  }
  analogWrite(PIN_LED, luminosita);
  Serial.println(luminosita);
  delay(100);
}
```

### Scope: globale vs locale

```arduino
int contatore = 0;   // globale: visibile in setup() e loop()

void loop() {
  int valore = analogRead(A0);  // locale: esiste solo dentro loop()
  contatore++;                   // modifica la variabile globale
}
```

Le variabili **globali** sono dichiarate fuori da qualsiasi funzione e vivono per tutta la durata del programma. Le variabili **locali** nascono quando la funzione inizia e vengono cancellate quando finisce: usano meno memoria ma non sopravvivono tra un loop e l'altro.

### Costanti — `const`

```arduino
const int PIN_LED = 9;      // il compilatore impedisce di modificarla
const float V_REF = 5.0;    // utile per conversioni analogRead → tensione
```

Usate `const` per i numeri che non cambiano mai (numeri di pin, soglie fisse). Il compilatore segnala errore se provate ad assegnarle un nuovo valore dopo la dichiarazione.

## Esperimenti correlati

- **Vol.3 pag. 63** — v3-cap6-esp5: prima variabile `int` per memorizzare il valore letto dal sensore
- **Vol.3 pag. 65** — v3-cap6-esp6: variabile `luminosita` aggiornata ogni ciclo con `analogRead` → `analogWrite`
- **Vol.3 pag. 77** — v3-cap7-esp5: `int valore = analogRead(A0)` — lettura sensore in variabile locale con Serial Monitor
- **Vol.3 pag. 82** — v3-cap7-esp10: variabile confrontata in `if/else` per soglia luminosità LED

## Errori comuni

1. **Variabile non dichiarata prima dell'uso**: se scrivete `luminosita = 100` senza `int luminosita;` prima, il compilatore si ferma con `was not declared in this scope`. Dichiarate sempre la variabile prima del primo utilizzo.
2. **Overflow silenzioso con `int` e `millis()`**: il tipo `int` arriva al massimo a 32 767. Se usate `millis()` — che può raggiungere oltre 4 miliardi — dentro un `int`, il valore "si avvolge" e diventa negativo dopo circa 32 secondi, senza nessun errore o avviso. Usate sempre `unsigned long` per i tempi.
3. **Scope dimenticato — variabile locale che si "azzera"**: se dichiarate `int conta = 0;` dentro `loop()`, si reimposta a 0 ogni ciclo perché è locale alla funzione. Per mantenere il valore tra un ciclo e l'altro, dichiarate la variabile globale (fuori da `loop()`).
4. **`float` passato a `analogWrite`**: `analogWrite` accetta solo interi 0–255. Se passate un `float`, il compilatore tronca (non arrotonda): 254.9 diventa 254. Usate `int` o `byte` per la luminosità PWM, oppure convertite esplicitamente con `(int)`.
5. **`String` che esaurisce la RAM**: su Arduino Nano la RAM è solo 2 KB. Concatenare `String` con `+` dentro il loop alloca e dealloca blocchi di RAM continuamente, fino a frammentazione e comportamenti caotici. Per testi fissi nel `Serial.print`, usate `F("testo fisso")` per tenerli nella flash: `Serial.println(F("Valore:"))`.

## Domande tipiche degli studenti

**"Perché devo scrivere `int` — non basta il nome?"**
Perché Arduino deve sapere quanta memoria riservare e quali operazioni sono lecite. Un `int` occupa 2 byte, un `float` 4 byte, un `bool` 1 byte. Senza il tipo, Arduino non sa né quanto spazio prendere né come interpretare i bit in quella posizione di memoria.

**"Posso usare lo stesso nome per due variabili diverse?"**
Non nello stesso blocco. In blocchi diversi (una globale e una locale) tecnicamente funziona, ma la variabile locale "nasconde" quella globale all'interno del suo blocco: è una delle cause più frequenti di bug difficili da trovare. Usate nomi diversi e descrittivi per ogni variabile.

**"Cosa succede se metto un numero troppo grande in un `int`?"**
Si verifica l'**overflow**: il valore "ricomincia" dall'estremo opposto. Per esempio, 32 767 + 1 in un `int` diventa −32 768 senza nessun avviso. Il programma continua con il valore sbagliato. Per i contatori che crescono molto usate `long` o `unsigned long`.

**"`const` è obbligatorio per i numeri dei pin?"**
Non obbligatorio, ma fortemente consigliato. Con `const int PIN_LED = 9;` potete cambiare il numero del pin in un solo posto. Se invece avete scritto `9` in dieci punti del codice, dovete trovarli e cambiarli uno a uno — e basta dimenticarne uno per creare un bug invisibile.

## PRINCIPIO ZERO

### Sicurezza
- Le variabili non causano rischi elettrici diretti, ma **errori nei valori possono causare comportamenti fisici indesiderati**: una variabile `velocita` che va in overflow può mandare un motore al contrario o spegnere un componente in modo inatteso.
- Un `int` usato con `millis()` va in overflow dopo ~32 secondi: su kit con motori o relay, questo può causare attivazioni accidentali. Usate sempre `unsigned long` con `millis()`.
- La RAM di Nano è 2 KB: nessun rischio fisico, ma un programma che esaurisce la RAM si comporta in modo imprevedibile (riavvii, valori casuali). Dichiarate le variabili con il tipo più piccolo adeguato.

### Narrativa — come raccontarlo alla classe
Aprite il libro al **Vol. 3 pag. 63** e mostrate il primo esempio con variabile. Dite: *"Vedete questa parola `int` prima del nome? Significa che stiamo riservando uno spazio in memoria di Arduino — come mettere un'etichetta su una scatola vuota. Quando poi scriviamo `luminosita = analogRead(A0)`, stiamo mettendo dentro la scatola il numero che Arduino ha appena letto dal sensore."*

Poi chiedete: *"Se cambio `int` con `byte`, cosa cambia?"* — mostrate la tabella dei tipi e fate notare che `byte` arriva a 255, che è esattamente il massimo di `analogWrite`. Questo collega due concetti in modo concreto.

Quando introducete le costanti, leggete dal libro il punto sui numeri di pin, poi dite: *"Se ogni volta usate il numero `9` direttamente nel codice, e domani spostate il filo sul pin 8, dovete trovare e cambiare ogni `9`. Con `const int PIN_LED = 9;` cambiate solo questa riga — il resto segue automaticamente."*

### Cosa dire ai ragazzi (parole del libro)
> "Una variabile è come una scatola con un'etichetta — ci metti dentro un numero, lo usi quando serve, e puoi cambiarlo in qualsiasi momento." — Vol. 3 pag. 63

Dopo questa lettura, mostrate il codice con `int luminosita = 0;` che cresce di 10 ogni loop. Chiedete: *"Cosa succede quando luminosita arriva a 300?"* — portate i ragazzi a scoprire da soli la necessità del controllo `if (luminosita > 255) luminosita = 0;`. Il momento in cui capiscono che il programma deve "sorvegliare" la propria variabile è un salto concettuale importante verso il pensiero computazionale.

### Progressione didattica consigliata
1. **Variabile come "contenitore"**: analogia scatola-etichetta + tipo `int` — concreto e visivo (Vol. 3 pag. 63)
2. **Lettura sensore in variabile**: `int val = analogRead(A0)` + `Serial.println(val)` — il valore compare sullo schermo (Vol. 3 pag. 77)
3. **Aggiornamento in loop**: variabile che cresce/decresce ogni ciclo — il programma "ricorda" lo stato passato tra un ciclo e l'altro
4. **Scope globale vs locale**: perché il contatore non si azzera — concetto chiave per capire la struttura `setup()/loop()`
5. **Costanti + nomi descrittivi**: da numeri magici a `const int PIN_LED = 9` — codice leggibile anche dai compagni

## Link L1 (raw)

Query RAG per recuperare chunk correlati da `src/data/rag-chunks.json`:
- `"variabile int arduino dichiarazione"` → chunk code-5, code-8, code-11, tip-6
- `"int float byte tipo variabile"` → tip-6, faq-7
- `"overflow int long millis"` → error-10, tip-12
- `"scope variabile globale locale"` → tip-6, error-9
- `"const pin numero arduino"` → tip-1, code-1, code-4
- `"String RAM memoria arduino"` → error-18, tip-15

bookText citati da `src/data/volume-references.js`:
- `v3-cap6-esp5` (pag. 63) — prima variabile `int`, analogia scatola, dichiarazione e uso
- `v3-cap6-esp6` (pag. 65) — variabile `luminosita` aggiornata da `analogRead` → `analogWrite`
- `v3-cap7-esp5` (pag. 77) — `int valore = analogRead(A0)`, primo sensore in variabile con Serial Monitor
- `v3-cap7-esp10` (pag. 82) — variabile + `if/else` + soglia luminosità
