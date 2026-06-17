---
id: digital-read
type: concept
title: "digitalRead() — leggere un pin digitale"
locale: it
volume_ref: 3
pagina_ref: 63
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [digitalread, pin-digitali, input, high, low, pulsante, pinmode, pullup, pulldown, if-else]
---

## Definizione

`digitalRead(pin)` è la funzione Arduino che legge lo stato di un pin digitale e restituisce uno dei soli due valori possibili: **HIGH** (1, ~5V) oppure **LOW** (0, ~0V). Vol. 3 pag. 63 introduce il Capitolo 7 *"I Pin di Input: Arduino Ascolta e Decide"* come il momento in cui Arduino smette di solo parlare e impara ad ascoltare.

## Analogia per la classe

Ragazzi, immaginate di fare una domanda sì/no a un compagno: "è aperta o chiusa?". Non può rispondere "così così" — solo **SÌ** o **NO**. Ecco cosa fa `digitalRead()`: chiede al pin "hai corrente o no?" e ottiene solo due risposte. Con `analogRead()` invece otterreste un numero da 0 a 1023 — ma `digitalRead()` è come un interruttore della luce: o è on, o è off, niente in mezzo.

## Cosa succede fisicamente

Quando Arduino esegue `digitalRead(2)`, misura la tensione sul pin D2 e la confronta con le soglie interne dell'ATmega328p:

| Tensione pin D2 | Risultato | Valore codice |
|-----------------|-----------|---------------|
| > 3.5V (~0.7×VCC) | HIGH | `1` |
| < 1.5V (~0.3×VCC) | LOW | `0` |
| 1.5V – 3.5V | indeterminato | ⚠️ evitare |

### Il problema del pin "galleggiante" (floating)

Un pin impostato come `INPUT` ma non collegato a niente legge valori **casuali**: a volte HIGH, a volte LOW, cambia da solo anche se non toccate niente. Si chiama *floating* ed è uno degli errori più comuni con Arduino.

### La soluzione: pullup o pulldown

Due strategie per rendere stabile la lettura:

| Modalità | pinMode | Pin rilasciato | Pin premuto | Nota |
|----------|---------|----------------|-------------|------|
| `INPUT_PULLUP` (interna) | `INPUT_PULLUP` | HIGH | LOW | Usa resistenza interna ~47kΩ |
| Pull-down esterna | `INPUT` | LOW | HIGH | Resistenza 10kΩ verso GND |

La resistenza interna `INPUT_PULLUP` è quella più usata nel kit ELAB — basta una riga di codice, nessun componente extra.

### Logica invertita con INPUT_PULLUP

⚠️ Con `INPUT_PULLUP` la logica è **invertita** rispetto all'intuizione:
- Pulsante **non premuto** → pin a 5V → `digitalRead()` restituisce **HIGH**
- Pulsante **premuto** (collega pin a GND) → pin a 0V → `digitalRead()` restituisce **LOW**

### Sequenza minima corretta

```arduino
void setup() {
  pinMode(2, INPUT_PULLUP);  // pulsante su D2, pullup interno attivo
  pinMode(8, OUTPUT);        // LED su D8
}

void loop() {
  if (digitalRead(2) == LOW) {  // pulsante premuto → LOW (logica invertita!)
    digitalWrite(8, HIGH);      // accendi LED
  } else {
    digitalWrite(8, LOW);       // spegni LED
  }
}
```

**Citazione Vol. 3 pag. 65:** *"Arduino ora ASCOLTA il pulsante: se lo premi il LED si accende, se non premi si spegne. La scheda decide in tempo reale!"*

### Toggle su fronte discesa

Per alternare lo stato LED a ogni pressione (non solo tenerlo acceso mentre si preme):

```arduino
bool statoLED = false;

void loop() {
  if (digitalRead(2) == LOW) {     // fronte discesa: pulsante appena premuto
    statoLED = !statoLED;          // inverti stato
    digitalWrite(8, statoLED);
    while (digitalRead(2) == LOW) {} // aspetta rilascio (anti-rimbalzo grezzo)
    delay(50);
  }
}
```

## Esperimenti correlati

- **v3-cap7-esp1** (Vol. 3 pag. 65) — Pulsante che accende/spegne LED con `if/else`
- **v3-cap7-esp2** (Vol. 3 pag. 67) — Due LED + un pulsante (verde premuto / rosso non premuto)
- **v3-cap6-esp5** — `digitalRead` con `INPUT_PULLUP`, variabile bool, toggle semplice
- Per il debounce completo: vedi [concepts/debounce.md](debounce.md)

## Errori comuni

1. **Pin floating** — `pinMode(pin, INPUT)` senza resistenza → letture casuali. Fix: usare sempre `INPUT_PULLUP` oppure aggiungere resistenza 10kΩ esterna verso GND.
2. **Logica invertita ignorata** — Con `INPUT_PULLUP`, il pulsante premuto dà `LOW`, non `HIGH`. Scrivere `if (digitalRead(2) == HIGH)` per "pulsante premuto" è sbagliato: funziona al contrario.
3. **`digitalRead` su pin analogico** — `digitalRead(A0)` compila ma dà solo 0 o 1. Se serve un valore variabile (fotoresistore, potenziometro) usare `analogRead()`.
4. **`pinMode` dimenticato** — Senza `pinMode(pin, INPUT_PULLUP)` nel `setup()`, il pin rimane in modalità OUTPUT di default. Le letture non sono affidabili e il pin potrebbe danneggiarsi se cortocircuitato.
5. **`=` al posto di `==` nel confronto** — `if (digitalRead(2) = LOW)` è un assegnamento, non un confronto. Il compilatore segnala errore oppure, in alcuni contesti, si comporta in modo imprevedibile.

## Domande tipiche degli studenti

**"Perché quando premo il pulsante leggo LOW e non HIGH?"**
Con `INPUT_PULLUP`, il pin è mantenuto a 5V (HIGH) dalla resistenza interna. Quando premete il pulsante, collegate il pin direttamente a GND: la tensione scende a 0V e Arduino legge LOW. È un collegamento più semplice e stabile rispetto al pulldown esterno.

**"Posso usare `digitalRead` su qualsiasi pin?"**
Sì su tutti i pin digitali D0-D13. Sui pin A0-A5 funziona ma leggete solo HIGH/LOW — perdete tutta la precisione analogica. Usate `digitalRead` solo quando vi basta sapere sì/no (pulsante, reed switch, interruttore); per valori variabili (luce, temperatura, manopola) usate `analogRead`.

**"Qual è la differenza tra `digitalRead` e `analogRead`?"**
`digitalRead` → 2 valori possibili (HIGH o LOW, come un interruttore). `analogRead` → 1024 valori possibili (0-1023, come una manopola). Per un pulsante usate `digitalRead`; per un potenziometro o un sensore di luce usate `analogRead`.

**"Cosa succede se non scrivo `pinMode` nel `setup`?"**
I pin di default sono OUTPUT. Leggere un pin OUTPUT con `digitalRead` dà risultati inaffidabili. In più, se quel pin è collegato a GND (come farebbe un pulsante), potete cortocircuitare l'uscita di Arduino — non è sicuro. Mettete sempre `pinMode` per ogni pin che usate.

## PRINCIPIO ZERO

**Per il docente — guida silenziosa:**

📖 **Citate le parole esatte del Vol. 3 pag. 65:** *"Arduino ora ASCOLTA il pulsante: se lo premi il LED si accende, se non premi si spegne. La scheda decide in tempo reale!"*

**Cosa dire ai ragazzi:**
> "Fino adesso Arduino solo *parlava* — accendeva LED, mandava segnali. Adesso impara ad *ascoltare*. `digitalRead()` è come un orecchio: sente se c'è corrente o no e risponde con sì o no. Provate sul kit: premete il pulsante e osservate cosa cambia sul LED."

**Sicurezza:**
- Il kit funziona a 5V — nessun rischio per i ragazzi
- Con `INPUT_PULLUP` non servono resistenze extra: la resistenza interna (~47kΩ) protegge il pin
- Non collegare mai il pin direttamente a 5V quando è impostato OUTPUT (cortocircuito): in caso di dubbio, usate `INPUT_PULLUP`
- Se un LED si accende in modo strano o Arduino si resetta, controllare che nessun pin OUTPUT sia cortocircuitato a GND dal pulsante

**Narrativa per la classe — progressione 6 step:**
1. *Richiamate `digitalWrite`*: "Fino adesso Arduino dava comandi — HIGH o LOW. È stato bravo a parlare."
2. *Introduce la domanda*: "Ma come fa Arduino a sapere se un pulsante è premuto? Deve *ascoltare*."
3. *Mostrate il codice*: leggete ad alta voce `digitalRead(2) == LOW` — "chiediamo al pin 2: sei LOW?" 
4. *Fate premere il pulsante fisicamente* sul kit ELAB mentre guardano il LED. Il momento "wow" arriva quando i ragazzi vedono la scheda *reagire* in tempo reale.
5. *Spiegate la logica invertita* con la metafora del campanello: "quando premi, colleghi a terra — LOW significa 'premuto'."
6. *Sfida*: "Riuscite a fare in modo che il LED rimanga acceso anche dopo aver rilasciato il pulsante?" → introduce toggle e variabile bool.

## Link L1 (raw RAG queries)

Query per `src/data/rag-chunks.json`:
- `"digitalRead pulsante INPUT_PULLUP"` — codice pulsante + spiegazione logica invertita
- `"Arduino ascolta pin input"` — bookContext Capitolo 7 Vol. 3
- `"floating pin pullup resistenza interna"` — errore pin non collegato
- `"digitalRead analogRead differenza HIGH LOW"` — confronto funzioni
- `"if else digitalRead LOW accendi LED"` — snippet base Vol. 3 pag. 65
