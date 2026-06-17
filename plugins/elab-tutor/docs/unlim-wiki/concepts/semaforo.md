---
id: semaforo
type: concept
title: "Semaforo — tre LED in sequenza con delay"
locale: it
volume_ref: 3
pagina_ref: ~52
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [semaforo, led, sequenza, delay, digitalWrite, loop, progetto, timing, tre-led, arduino, rosso, giallo, verde]
---

## Definizione

Il Semaforo è uno dei primi progetti completi con Arduino: tre LED (rosso, giallo, verde) si accendono e spengono in sequenza, imitando un vero semaforo stradale. Vol. 3 pag. ~52 lo presenta come "il primo progetto autonomo dove Arduino decide QUANDO accendere ogni LED, senza aspettare un comando da fuori".

## Analogia per la classe

Ragazzi, pensate a un semaforo vero mentre attraversate la strada: verde = via, giallo = rallenta, rosso = stop. Arduino fa esattamente lo stesso lavoro del "cervello" dentro il palo del semaforo — solo che al posto di un computer da migliaia di euro, ci riesce con il vostro Arduino Nano e tre LED da pochi centesimi. La magia sta nel `delay()`: Arduino aspetta per il tempo che voi decidete, poi passa al LED successivo, esattamente come il semaforo vero che conta i secondi prima di cambiare colore.

## Cosa succede fisicamente

### Il circuito

Tre LED, ognuno con la propria resistenza da 220 Ω, collegati a tre pin digitali diversi. I catodi (gamba corta) vanno tutti nella stessa riga GND della breadboard:

| LED    | Pin Arduino | Resistenza | Colore filo consigliato |
|--------|-------------|------------|-------------------------|
| Rosso  | D11         | 220 Ω      | Rosso                   |
| Giallo | D10         | 220 Ω      | Giallo/Arancione        |
| Verde  | D9          | 220 Ω      | Verde                   |

> Usate i pin D9–D11 perché sono anche pin PWM (`~`): se in seguito volete far lampeggiare o sfumare i LED, potete usare `analogWrite()` senza cambiare nulla nel cablaggio.

### Il codice Semaforo base

```cpp
int rosso  = 11;
int giallo = 10;
int verde  = 9;

void setup() {
  pinMode(rosso,  OUTPUT);
  pinMode(giallo, OUTPUT);
  pinMode(verde,  OUTPUT);
}

void loop() {
  // Verde: VIA
  digitalWrite(verde, HIGH);
  delay(3000);
  digitalWrite(verde, LOW);

  // Giallo: ATTENZIONE
  digitalWrite(giallo, HIGH);
  delay(1000);
  digitalWrite(giallo, LOW);

  // Rosso: STOP
  digitalWrite(rosso, HIGH);
  delay(3000);
  digitalWrite(rosso, LOW);
}
```

### Tabella sequenza temporale

| Fase        | LED acceso | Durata | `delay()` usato |
|-------------|------------|--------|-----------------|
| VIA         | Verde      | 3 s    | `delay(3000)`   |
| ATTENZIONE  | Giallo     | 1 s    | `delay(1000)`   |
| STOP        | Rosso      | 3 s    | `delay(3000)`   |
| — (ciclo)   | —          | 7 s    | totale          |

### Formula durata ciclo completo

```
durata_ciclo (ms) = delay_verde + delay_giallo + delay_rosso
                  = 3000 + 1000 + 3000 = 7000 ms = 7 s
```

Cambiate i tre numeri per simulare semafori con tempi diversi. Esempio per una strada a scorrimento veloce (verde lungo) o per una zona scolastica (rosso lungo):

```
strada veloce: delay(5000) + delay(1000) + delay(2000) = 8 s ciclo
zona scuola:   delay(2000) + delay(1000) + delay(5000) = 8 s ciclo
```

### Verde lampeggiante prima del giallo (variante)

Aggiungete un ciclo `for` alla fine della fase verde per segnalare "sta per finire":

```cpp
// Verde fisso
digitalWrite(verde, HIGH);
delay(2500);

// Verde lampeggia (5 volte × 200 ms = 1 s)
for (int i = 0; i < 5; i++) {
  digitalWrite(verde, LOW);
  delay(100);
  digitalWrite(verde, HIGH);
  delay(100);
}
digitalWrite(verde, LOW);

// Poi giallo come al solito
digitalWrite(giallo, HIGH);
delay(1000);
digitalWrite(giallo, LOW);
```

## Esperimenti correlati

- Vol. 3 pag. ~52 — Semaforo (questo esperimento)
- [concepts/blink-led.md](blink-led.md) — prerequisito: un solo LED con `delay()`, da completare prima
- [concepts/led.md](led.md) — anatomia LED, anodo/catodo, calcolo resistenza serie
- [concepts/delay-millis.md](delay-millis.md) — differenza tra `delay()` bloccante e `millis()` non-bloccante
- [concepts/digital-write.md](digital-write.md) — `digitalWrite()`, `pinMode()`, HIGH/LOW
- [concepts/pin-digitali.md](pin-digitali.md) — mappa pin D0–D13 su Arduino Nano

## Errori comuni

1. **Un LED non si accende mai** — Verificate che il cablaggio di quel LED sia corretto: anodo (gamba lunga) sul pin Arduino tramite 220 Ω, catodo (gamba corta) a GND. Spesso il LED è ruotato di 180°: basta girarlo.

2. **Due LED rimangono accesi insieme** — Nel codice manca la riga `digitalWrite(led, LOW)` prima di passare alla fase successiva. Ogni `HIGH` deve avere il suo `LOW` prima che il LED successivo si accenda.

3. **La sequenza va troppo veloce** — Il valore dentro `delay()` è in **millisecondi**: `delay(3)` dura 3 ms (quasi invisibile), `delay(3000)` dura 3 secondi. Regola facile: 1 secondo = 1000 ms.

4. **Arduino non risponde mentre il semaforo gira** — È normale: `delay()` **blocca** tutto il programma per tutta la sua durata. Se premete un pulsante durante `delay(3000)`, Arduino non lo sente. Per semafori interattivi (es. pulsante pedonale) servono `millis()` e variabili di stato — argomento avanzato dopo aver padroneggiato il semaforo base.

5. **Il numero nel codice non corrisponde al pin fisico** — Con tre LED e tre pin è facile confondersi: `rosso = 11` ma il LED rosso è fisicamente su D10. Controllate sempre il numero nel codice con il foro fisico sulla breadboard. Etichettate i fili con un pennarello prima di cablare.

## Domande tipiche degli studenti

**"Posso mettere i tre LED in colonna sulla stessa riga della breadboard?"**
No: ogni LED deve avere il suo ramo separato con la propria resistenza da 220 Ω. Se li mettete in serie, la tensione si divide tra i tre LED (5 V ÷ 3 ≈ 1.67 V ciascuno, troppo poco per accenderli bene) e non potete controllarli indipendentemente con `digitalWrite()`.

**"Posso usare un solo filo di GND per tutti e tre i catodi?"**
Sì, potete farlo. I catodi di tutti e tre i LED possono condividere la stessa colonna blu GND della breadboard. Risparmiate due fili e il circuito funziona ugualmente.

**"Come faccio il semaforo pedonale con il pulsante che chiede il verde?"**
Con `delay()` è molto difficile perché `delay()` blocca Arduino e non "sente" il pulsante durante l'attesa. La soluzione corretta usa `millis()` e una variabile di stato per tenere traccia della fase. È il naturale upgrade di questo esperimento una volta che avete capito la sequenza base.

**"Perché non usiamo direttamente `millis()` da subito?"**
`delay()` è più semplice da leggere e capire per chi inizia: "aspetta 3 secondi" si scrive esattamente `delay(3000)`. Il limite (blocca tutto) si sente solo quando aggiungete interattività. Prima capite il semaforo base, poi affrontate `millis()` con una base solida.

## PRINCIPIO ZERO

### Sicurezza
- Tutte le tensioni in gioco sono **5 V DC da Arduino** o **9 V DC dalla batteria ELAB** — sicure per i ragazzi con i kit.
- La resistenza da **220 Ω è obbligatoria** per ogni LED: senza resistenza il LED brucia in pochi secondi e può danneggiare il pin di Arduino (corrente massima pin = 40 mA, LED senza R può tirarne 100+ mA).
- Non collegare più di un LED sullo stesso pin senza calcolare la corrente totale: un LED da 20 mA va bene, due sullo stesso pin già raggiungono 40 mA (al limite), tre superano il massimo e danneggiano il chip.

### Narrativa per la classe
Il semaforo è il primo progetto in cui Arduino **decide da solo**: non accende un LED perché voi premete un bottone, ma perché **sa quando** è il momento. È la differenza tra uno strumento che aspetta un ordine e una macchina che esegue una sequenza autonoma. Ogni `delay(3000)` è come un orologio interno che Arduino gestisce da solo — esattamente come fa il semaforo nel palo fuori dalla scuola. Da oggi, ogni semaforo che vedete per strada vi ricorderà che dentro c'è (anche) un po' di codice come questo.

### Cosa dire ai ragazzi
- *"Vediamo insieme quanti cicli al minuto fa il nostro semaforo: ciclo di 7 secondi, 60 secondi in un minuto… quante volte cambia?"* (risposta: 60 ÷ 7 ≈ 8 volte al minuto — ottimo aggancio alla matematica delle divisioni).
- *"Se volete che il verde duri di più, cosa cambiate? Solo quel numero dentro `delay()` — provate."*
- *"Sapete cosa succederebbe con `delay(100)` invece di `delay(3000)`? I LED cambierebbero così velocemente che vedreste quasi tutti e tre accesi insieme — perché il vostro occhio non riesce a star dietro a 10 cambi al secondo."*
- Citate **Vol. 3 pag. ~52** quando mostrate il codice sulla LIM.
- Prima di caricare, fate indicare ai ragazzi i tre pin (D9, D10, D11) sulla scheda Nano fisica e abbinate il colore del LED al nome della variabile nel codice.

### Progressione didattica consigliata (5 passi)
1. Richiamare il Blink con un LED (già fatto) → "abbiamo controllato ON/OFF su un LED"
2. Cablare i tre LED uno alla volta, verificando che ogni LED si accenda prima di passare al successivo
3. Caricare il codice Semaforo base e osservare la sequenza completa insieme
4. Far modificare i valori dentro i `delay()` → "cambiate i tempi: fate il semaforo di una superstrada, poi quello davanti a una scuola"
5. Sfida aperta: *"Come fareste per aggiungere un segnale sonoro con il cicalino quando scatta il rosso?"* (aggancio al prossimo esperimento)

## Link L1 (raw RAG queries)

Questi termini trovano i chunk rilevanti in `src/data/rag-chunks.json`:

- `"semaforo LED sequenza delay"`
- `"digitalWrite HIGH LOW tre LED"`
- `"delay millisecondi sequenza Arduino"`
- `"semaforo rosso giallo verde Arduino Nano"`
- `"progetto semaforo breadboard 220 ohm"`
