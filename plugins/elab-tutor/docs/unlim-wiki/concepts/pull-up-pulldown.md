---
id: pull-up-pulldown
type: concept
title: "Pull-up e Pull-down — fissare lo stato di un pin digitale"
locale: it
volume_ref: 1
pagina_ref: 78
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [pull-up, pull-down, resistenza, pulsante, digitale, stato-flottante, vol1, vol3]
---

## Definizione

Pull-up e pull-down sono **resistenze di servizio** che fissano un pin digitale a un livello logico stabile (HIGH per pull-up, LOW per pull-down) quando un pulsante o sensore non sta attivamente impostando il pin.

Vol. 1 pag. 78 introduce il concetto: "un pin lasciato libero non è né HIGH né LOW — è 'flottante' e legge valori casuali. La pull-up lo tiene a HIGH finché qualcosa non lo abbassa".

## Analogia per la classe

Ragazzi, immaginate un pin digitale come una bandiera su un palo:
- **Senza pull-up/pull-down**: la bandiera ondeggia con il vento — non si sa se è in alto o in basso
- **Pull-up (10 kΩ verso 5 V)**: una corda tira la bandiera verso l'alto. Per portarla giù serve forza (premere il pulsante che la collega a GND)
- **Pull-down (10 kΩ verso GND)**: la corda tira la bandiera verso il basso. Per portarla in alto serve la forza opposta (collegarla a 5 V)

## Perché serve

Senza pull-up/pull-down, un pin digitale che non riceve segnale legge valori imprevedibili (rumore, capacità parassite, dita umane che fanno da antenna). Esempio reale del kit:

```cpp
// SENZA pull-up — leggi pulsante
pinMode(BUTTON, INPUT);
int stato = digitalRead(BUTTON);  // legge HIGH e LOW casualmente !!
```

```cpp
// CON pull-up integrata Arduino — modo corretto
pinMode(BUTTON, INPUT_PULLUP);
int stato = digitalRead(BUTTON);  // sempre HIGH a riposo, LOW solo quando premuto
```

## Pull-up vs Pull-down

| Caratteristica | Pull-up | Pull-down |
|----------------|---------|-----------|
| Resistenza connessa a | 5 V (o 3.3 V) | GND |
| Stato a riposo | HIGH | LOW |
| Pulsante collega a | GND | 5 V |
| Logica button premuto | LOW (active-low) | HIGH (active-high) |
| Più diffuso | ✓ (Arduino ha INPUT_PULLUP) | meno comune |

**Vol. 1 pag. 78** raccomanda pull-up come default — Arduino ha resistenze pull-up interne (~20-50 kΩ) attivabili con `INPUT_PULLUP` senza componenti esterni.

**Vol. 3 pag. 45** introduce `INPUT_PULLUP` come "il modo più semplice per leggere un pulsante senza saldare resistenze".

## Schema esterno (se non si usa INPUT_PULLUP)

```
Pull-up esterna 10 kΩ:

    +5V ──[10 kΩ]──┬──── al pin Arduino
                   │
                   └──[BUTTON]── GND

Stato pin:
- Pulsante non premuto: pin = HIGH (5 V via 10 kΩ)
- Pulsante premuto:     pin = LOW  (collegato direttamente a GND)
```

## Errori comuni

1. **Pin flottante senza pull-up/pull-down** — Sintomo: il programma reagisce a tocchi della scheda, vibrazioni, persino senza nulla. Soluzione: usare `INPUT_PULLUP` o aggiungere resistenza esterna.

2. **Confondere pull-up con resistenza limitatrice LED** — La pull-up è una resistenza di **servizio per leggere uno stato**, non per limitare corrente. Valori tipici 4.7-10 kΩ. Una pull-up da 220 Ω scarica troppa corrente quando il pulsante è premuto (a vuoto).

3. **Pull-up + pull-down insieme sullo stesso pin** — Se entrambe presenti, il pin va a una tensione intermedia (partitore di tensione) che Arduino legge come comportamento incoerente. Usarne SOLO una.

4. **Logica invertita** — Con pull-up, il pulsante premuto legge **LOW**, non HIGH. Codice:
```cpp
if (digitalRead(BUTTON) == LOW) {
  // pulsante premuto !!
}
```
Errore comune: scrivere `== HIGH` aspettandosi che premere il pulsante porti a HIGH.

5. **Valore resistenza troppo alto** — Pull-up da 1 MΩ è "debole": rumore elettromagnetico la sovrasta facilmente. Tenersi tra 4.7 kΩ e 47 kΩ.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 1 pag. 78):
> "Un pin lasciato libero non è né HIGH né LOW — è 'flottante' e legge valori casuali. La pull-up lo tiene a HIGH finché qualcosa non lo abbassa."

**Cosa fare:**
- Mostrate il problema empiricamente: scrivete sketch che stampa `digitalRead(BUTTON)` in loop senza pull-up. Mostrate sul Serial Monitor i valori che ballano casualmente
- Aggiungete `INPUT_PULLUP` e mostrate la differenza: lettura stabile HIGH a riposo, LOW solo quando premuto
- Disegnate sulla LIM lo schema con la "corda che tira" — analogia bandiera funziona bene a 8-14 anni
- Vol. 1 pag. 78 raccomanda di insegnare PRIMA pull-up esterna (10 kΩ + 5V), POI passare a INPUT_PULLUP come scorciatoia comoda

**Sicurezza:**
- La pull-up integrata Arduino è 20-50 kΩ, sufficiente per pulsanti tactile. Per ambienti rumorosi (motori vicini, fili lunghi) preferire pull-up esterna 4.7 kΩ
- INPUT_PULLUP è disponibile su TUTTI i pin digitali Arduino. NON funziona su pin analogici A6/A7 della Nano (sono solo input).

**Cosa NON fare:**
- Non lasciate pin digitali "flottanti" mai. Anche se non li usate, configurate `pinMode(pin, OUTPUT)` o `INPUT_PULLUP`
- Non usate pull-up + pull-down contemporanee — partitore di tensione confonde la logica

## Link L1 (raw RAG queries)

- `"pull-up resistenza pulsante"`
- `"INPUT_PULLUP Arduino"`
- `"pin flottante stato indeterminato"`
- `"active-low active-high logica pulsante"`
- `"valore resistenza pull-up 10 kOhm"`
