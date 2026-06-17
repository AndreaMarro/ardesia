---
id: debounce
type: concept
title: "Debounce (anti-rimbalzo)"
locale: it
volume_ref: 2
pagina_ref: 55
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [debounce, pulsante, rimbalzo, millis, delay, input, software, anti-rimbalzo]
---

## Definizione

Il debounce (o "anti-rimbalzo") è la tecnica software — o hardware — usata per eliminare le letture spurie che si generano quando un pulsante meccanico viene premuto o rilasciato. I contatti metallici di un pulsante reale "rimbalzano" decine di volte in pochi millisecondi prima di stabilizzarsi: senza debounce, Arduino vede ogni rimbalzo come una pressione distinta. Vol. 2 pag. 55 lo introduce spiegando perché "il contatore avanza di tre invece di uno" la prima volta che si preme un tasto.

## Analogia per la classe

Ragazzi, immaginate di palleggiare una palla da tennis sul pavimento: quando la lanciate giù, prima di fermarsi la palla rimbalza tante volte sempre più piano. I contatti di un pulsante funzionano allo stesso modo — ogni volta che li premete, i due pezzetti di metallo si toccano e si staccano decine di volte nell'arco di pochi millesimi di secondo prima di restare appiccicati. Noi non lo percepiamo, ma Arduino è così veloce da "sentire" ogni rimbalzo come una pressione separata! Il debounce insegna ad Arduino ad aspettare che il rimbalzo finisca prima di decidere: "ok, il pulsante è davvero premuto".

## Cosa succede fisicamente

Un contatto meccanico impiega tipicamente **5 – 50 millisecondi** per stabilizzarsi dopo la chiusura. Arduino legge i pin in pochi **microsecondi**: può perciò registrare 10-50 eventi "falsi" per ogni pressione reale.

### Durata tipica del rimbalzo

| Tipo di pulsante     | Rimbalzo tipico |
|----------------------|-----------------|
| Pulsante da breadboard | 5 – 20 ms     |
| Interruttore a levetta | 20 – 50 ms    |
| Reed switch (mag.)    | 1 – 5 ms       |
| Tastiera meccanica    | 5 – 15 ms      |

### Tecnica 1 — `delay()` (semplice, scuola base)

```cpp
const int PIN_PULSANTE = 2;
const int PIN_LED      = 13;
int statoLed = LOW;
int ultimoStato = HIGH;

void setup() {
  pinMode(PIN_PULSANTE, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int lettura = digitalRead(PIN_PULSANTE);
  if (lettura == LOW && ultimoStato == HIGH) {
    statoLed = !statoLed;
    digitalWrite(PIN_LED, statoLed);
    delay(50);                     // ignora i rimbalzi dei prossimi 50 ms
  }
  ultimoStato = lettura;
}
```

**Limite**: `delay(50)` blocca tutto il programma per 50 ms. OK per esperimenti semplici; problematico se avete anche un display o un motore da gestire.

### Tecnica 2 — `millis()` (non bloccante, consigliata)

```cpp
const int PIN_PULSANTE  = 2;
const int PIN_LED       = 13;
const unsigned long DEBOUNCE_MS = 50;

int statoLed           = LOW;
int letturaPrecedente  = HIGH;
int statoStabile       = HIGH;
unsigned long ultimoCambio = 0;

void setup() {
  pinMode(PIN_PULSANTE, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int lettura = digitalRead(PIN_PULSANTE);

  if (lettura != letturaPrecedente) {
    ultimoCambio = millis();         // segnala l'inizio di una transizione
  }

  if ((millis() - ultimoCambio) >= DEBOUNCE_MS) {
    if (lettura != statoStabile) {
      statoStabile = lettura;
      if (statoStabile == LOW) {     // pressione confermata
        statoLed = !statoLed;
        digitalWrite(PIN_LED, statoLed);
      }
    }
  }

  letturaPrecedente = lettura;
}
```

`millis()` restituisce i millisecondi trascorsi dall'accensione: controllando la differenza con `ultimoCambio` il programma aspetta i 50 ms di stabilizzazione **senza fermare il resto del codice**.

### Confronto delle due tecniche

| Caratteristica          | `delay()`          | `millis()`             |
|-------------------------|--------------------|------------------------|
| Complessità codice      | Bassa              | Media                  |
| Blocca il programma?    | Sì                 | No                     |
| OK con display/motori?  | No (lag visibile)  | Sì                     |
| Consigliato per         | Primo approccio    | Progetti reali         |

## Esperimenti correlati

- Vol. 1 pag. 43 — Primo pulsante ([`concepts/pulsante.md`](pulsante.md))
- Vol. 2 pag. 55 — Contatore pulsante con debounce (`delay`)
- Vol. 3 cap. 5 — Debounce con `millis()` + display LCD
- [`v2-cap5-esp3`](../experiments/v2-cap5-esp3.md) — LED toggle con pulsante (debounce incluso)

## Errori comuni

1. **Contatore che salta di 2, 3, 10**: nessun debounce implementato. Ogni rimbalzo del contatto viene contato come pressione reale. Soluzione: aggiungere `delay(50)` come primo passo.

2. **`delay()` troppo corto** (es. 5 ms): il rimbalzo dura ancora. Il contatore conta comunque troppo. Aumentare a 50 ms come valore sicuro universale.

3. **`delay()` troppo lungo** (es. 500 ms): le pressioni rapide vengono ignorate. Il LED non risponde se premete velocemente. 50 ms è il punto d'equilibrio.

4. **Dimenticare `INPUT_PULLUP`**: senza resistenza di pull-up il pin "fluttua" tra HIGH e LOW anche senza toccare il pulsante — letture casuali anche senza rimbalzo. Usare sempre `pinMode(PIN, INPUT_PULLUP)` con pulsante collegato a GND.

5. **Confondere `millis()` e `delay()`**: `millis()` non aspetta, legge solo "quanti ms sono passati". Lo schema con `ultimoCambio = millis()` va capito bene prima di usarlo: la variabile salva il momento del cambio, non blocca il programma.

## Domande tipiche degli studenti

**"Perché il mio LED lampeggia o conta troppo ogni volta che premo?"**
Sono i rimbalzi dei contatti. Il pulsante fisico non chiude il circuito in modo netto: i metalli oscillano rapidamente. Arduino vede ogni oscillazione come una pressione distinta. Aggiungere `delay(50)` dopo la lettura risolve subito il problema nel 90% dei casi.

**"Quanto deve essere lungo il debounce? 10 ms bastano?"**
Dipende dal pulsante. I pulsanti da breadboard ELAB rimbalzano in genere 10-20 ms. 50 ms è il valore sicuro che funziona per tutti i componenti del kit: abbastanza lungo da coprire i rimbalzi, abbastanza corto da non rallentare il programma percepibilmente.

**"Si può fare il debounce senza scrivere codice?"**
Sì — con un condensatore da 100 nF in parallelo al pulsante (debounce hardware). Il condensatore assorbe i rimbalzi elettricamente. Non lo facciamo nei kit ELAB perché aggiunge componenti, ma vale la pena mostrarlo come curiosità ai più curiosi.

**"Perché `millis()` è meglio di `delay()`?"**
Con `delay(50)` il programma si ferma: il display si congela, il motore non aggiorna, i sensori non vengono letti. Con `millis()` il resto del codice continua a girare — il debounce avviene "in sottofondo". È la differenza tra "aspettare seduti fermi" e "controllare l'orologio mentre si fa altro".

## PRINCIPIO ZERO

Il debounce non presenta rischi di sicurezza per i ragazzi — è un concetto puramente software che non comporta tensioni alte o correnti pericolose. Il rischio reale è **pedagogico**: senza debounce il programma sembra "rotto" e i ragazzi si scoraggiano pensando di aver sbagliato il circuito.

**Cosa mostrare alla classe prima di introdurre il debounce**:
Caricare su Arduino un programma contatore senza debounce. Premere il pulsante una volta sola con calma, poi mostrare il Serial Monitor: il numero probabilmente non è aumentato di 1. Chiedere ai ragazzi "secondo voi perché conta di 3?". Lasciare che provino a spiegarlo. Poi introdurre l'analogia della palla da tennis.

**Cosa dire ai ragazzi** (citando il libro):
> "Avete mai notato che il vostro contatore avanza di tre invece di uno ogni volta che premete? Non avete sbagliato niente — è la fisica del pulsante che ci gioca un brutto scherzo. I contatti di metallo rimbalzano, e Arduino è così veloce da vedere ogni rimbalzo come una pressione. Il debounce è il nostro antidoto." *(Vol. 2 pag. 55, introduzione al debounce)*

**Narrativa suggerita**:
1. Mostrare il problema dal vivo: contatore senza debounce sul Serial Monitor
2. Chiedere "cos'è successo?" — raccogliere le ipotesi della classe
3. Analogia della palla da tennis (concreta, visibile)
4. Aggiungere `delay(50)` — solo 2 righe di codice — e riprovare
5. Il contatore adesso funziona: "abbiamo insegnato ad Arduino ad aspettare"
6. (Facoltativo, avanzati) Mostrare `millis()` per spiegare perché nei progetti grandi `delay()` non basta

**Plurale inclusivo sempre**: "premiamo insieme", "vediamo cosa succede", "proviamo a spiegarlo" — i ragazzi sul kit fisico, il docente che racconta.

**Non sostituisce la lettura del volume**: le parole esatte di Vol. 2 pag. 55 vanno lette ad alta voce — i ragazzi devono riconoscere le stesse frasi nel libro fisico che hanno in mano e sulla LIM.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"debounce"` → cerca in glossary, faq, capitoli V2/V3 (pulsante avanzato)
- `"rimbalzo pulsante"` → error-pulsante, tip-pulsante, faq-input
- `"INPUT_PULLUP"` → code-pulsante, glossary-pinMode
- `"millis"` → code-millis, tip-nonblocking, capitoli v3 timing
- `"contatore pulsante"` → capitoli v2-cap5, code-counter
- `"delay pulsante"` → error-delay-blocking, tip-debounce
