---
id: delay-millis
type: concept
title: "delay() e millis() — Controllare il tempo nei programmi Arduino"
locale: it
volume_ref: 3
pagina_ref: 47
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [delay, millis, tempo, millisecondi, blink, temporizzazione, blocking, non-blocking, arduino]
---

## Definizione

`delay(ms)` è la funzione Arduino che mette in pausa il programma per un numero preciso di **millisecondi**. Vol. 3 pag. 47 la introduce nel programma Blink: *"delay(1000) aspetta 1000 millisecondi, cioè 1 secondo"*. È la funzione che dà al programma il senso del tempo: senza di essa, il loop() girerebbe così veloce da essere invisibile all'occhio umano.

## Analogia per la classe

Ragazzi, immaginate di giocare a un semaforo umano in cortile: gridare "VERDE" e subito dopo "ROSSO" senza aspettare non funziona — nessuno fa in tempo a reagire. `delay(1000)` è come mettere una clessidra tra un comando e l'altro: Arduino grida "accenditi", aspetta che la clessidra finisca di scorrere, poi grida "spegniti". Senza la clessidra, il LED lampeggierebbe 16 milioni di volte al secondo — troppo veloce per vederlo, sembrerebbe sempre acceso a metà luminosità.

## Cosa succede fisicamente

### Come funziona `delay()`

Quando il programma arriva a `delay(1000)`, il microcontrollore ATmega328 entra in un ciclo di attesa attiva: conta i suoi cicli di clock (16 milioni al secondo su Arduino Nano) finché non raggiunge il numero corrispondente a 1000 ms. Durante quel tempo **non fa nient'altro**.

```arduino
void loop() {
  digitalWrite(13, HIGH);  // accendi LED
  delay(1000);             // aspetta 1000 ms = 1 secondo
  digitalWrite(13, LOW);   // spegni LED
  delay(1000);             // aspetta 1000 ms = 1 secondo
}
```

### Tabella di riferimento millisecondi

| `delay(ms)` | Tempo reale | Effetto visivo sul LED |
|-------------|-------------|------------------------|
| `delay(50)` | 0.05 s | Lampeggio molto veloce — quasi un tremolio |
| `delay(100)` | 0.1 s | Lampeggio veloce — visibile ma rapido |
| `delay(500)` | 0.5 s | Lampeggio medio — mezzo secondo |
| `delay(1000)` | 1 s | Lampeggio normale — un secondo esatto (Vol. 3 pag. 47) |
| `delay(2000)` | 2 s | Lampeggio lento — due secondi (Vol. 3 pag. 49) |
| `delay(5000)` | 5 s | Molto lento — cinque secondi |

### Conversione millisecondi → secondi

```
secondi = millisecondi / 1000
```

Quindi `delay(500)` = 500 / 1000 = 0,5 secondi; `delay(2000)` = 2 secondi.

### `delay()` è BLOCCANTE

Questo è il concetto più importante: mentre `delay()` è in esecuzione, Arduino **ignora tutto** — pulsanti premuti, sensori che cambiano, segnali in arrivo. È come se il programmatore avesse detto: "fermati qui e non fare niente finché non passa il tempo".

Per casi semplici come il Blink questo va benissimo. Ma per programmi più complessi (pulsante + LED contemporaneamente, semaforo con più tempi) si usa `millis()`.

### `millis()` — il timer non bloccante

`millis()` restituisce il numero di millisecondi passati da quando Arduino si è acceso. Con un confronto periodico si possono eseguire azioni a intervalli senza bloccare il programma:

```arduino
unsigned long ultimaVolta = 0;
const long INTERVALLO = 1000;  // 1 secondo
int statoLED = LOW;

void loop() {
  unsigned long adesso = millis();
  if (adesso - ultimaVolta >= INTERVALLO) {
    ultimaVolta = adesso;
    statoLED = (statoLED == LOW) ? HIGH : LOW;
    digitalWrite(13, statoLED);
  }
  // qui possiamo leggere pulsanti, sensori, ecc. senza bloccarsi
}
```

Con `millis()` il loop continua a girare liberamente: il LED lampeggia E Arduino controlla tutto il resto.

## Esperimenti correlati

- **Vol.3 pag.47** — v3-cap5-esp1: Blink — `delay(1000)` introduce i millisecondi
- **Vol.3 pag.49** — v3-cap5-esp2: Variazione delay — *"Prova con delay diversi per capire il concetto di millisecondi"* (100 ms lampeggio veloce, 2000 ms lampeggio lento)
- **Vol.3 pag.57** — v3-cap6-morse: SOS in codice Morse — `delay(150)` per i punti, `delay(400)` per le linee, `delay(1000)` tra lettere
- **Vol.3 pag.68** — v3-cap6-sirena: sequenza semaforo — `delay(5000)` verde, `delay(2000)` giallo, `delay(5000)` rosso
- **Vol.3 pag.77** — v3-cap7-esp5: `delay(250)` nel loop del Serial Monitor — cadenza di stampa dei valori

## Errori comuni

1. **Confondere millisecondi con secondi**: `delay(1)` aspetta 1 millisecondo, non 1 secondo. Per 1 secondo serve `delay(1000)`. Scrivere `delay(1)` nel Blink produce un LED apparentemente sempre acceso (lampeggia 500 volte al secondo — invisibile a occhio nudo).
2. **`delay()` troppo lungo e pulsante ignorato**: se il programma è in `delay(5000)`, un pulsante premuto in quel momento non viene registrato. L'utente preme e non succede niente — sembra un bug del circuito, ma è il codice bloccato in attesa. Soluzione: ridurre i delay o usare `millis()`.
3. **Dimenticare il secondo `delay()` nel Blink**: senza `delay()` dopo `digitalWrite(pin, LOW)`, il LED si spegne e si riaccende immediatamente — a occhio sembra sempre acceso. Ogni fase (HIGH e LOW) ha bisogno del suo tempo di attesa.
4. **Usare `float` come argomento**: `delay(0.5)` non aspetta mezzo millisecondo — `delay()` accetta solo numeri interi (`int` o `unsigned long`). Il compilatore tronca il decimale a 0: nessuna attesa. Usate `delay(500)` per mezzo secondo.
5. **`delay()` dentro una libreria o interrupt**: le interruzioni hardware (ISR) non devono contenere `delay()`. All'interno di un ISR, `delay()` non funziona perché il timer interno che conta i millisecondi è già sospeso. Tutto ciò che va in una ISR deve essere rapidissimo.

## Domande tipiche degli studenti

**"Perché si usano i millisecondi e non i secondi?"**
Perché Arduino lavora molto in fretta: in un secondo esegue centinaia di migliaia di istruzioni. Usare i millisecondi dà una precisione molto maggiore — potete creare lampi da 50 ms, ritardi da 250 ms, battiti da 833 ms (72 bpm). Come dice il Vol. 3 pag. 49: *"Prova con delay diversi per capire il concetto di millisecondi"* — sperimentiamo proprio variando quel numero.

**"Se uso `delay(0)` succede qualcosa?"**
No, `delay(0)` non aspetta niente — il programma continua immediatamente. È utile come placeholder temporaneo durante il debug, ma in produzione non ha senso. Meglio toglierlo del tutto.

**"Qual è il massimo che posso mettere in `delay()`?"**
`delay()` accetta un `unsigned long`, quindi fino a circa 4,3 miliardi di millisecondi (circa 49 giorni). In pratica per tempi lunghi (ore, giorni) si usa `millis()` con la logica di confronto, perché `millis()` stesso si azzera (overflow) dopo circa 49 giorni.

**"Quando uso `millis()` invece di `delay()`?"**
Quando il programma deve fare due cose "quasi contemporaneamente": ad esempio far lampeggiare un LED E leggere un pulsante. Con `delay()` Arduino è sordo al pulsante mentre aspetta. Con `millis()` il loop continua a girare libero e potete controllare sia il LED che il pulsante a ogni iterazione.

## PRINCIPIO ZERO

### Sicurezza
- `delay()` non presenta pericoli elettrici diretti, ma **un delay troppo lungo può rendere il circuito non reattivo a input di sicurezza** (ad esempio un pulsante di stop su un motore). Nei progetti con parti in movimento (servo, motore DC) evitate delay > 500 ms nel loop principale: usate `millis()`.
- Il kit ELAB non ha componenti che richiedono timing di precisione inferiore a 10 ms — i valori del libro (50–2000 ms) sono tutti sicuri e verificati.

### Narrativa — come raccontarlo alla classe
Aprite il libro al **Vol. 3 pag. 47** e mostrate le quattro righe del loop del Blink. Dite: *"Vediamo insieme: il LED si accende, poi Arduino aspetta 1000 millisecondi, poi il LED si spegne, poi Arduino aspetta ancora. Quanti millisecondi ci sono in un secondo?"* — aspettate la risposta (1000), poi scrivete il numero alla lavagna. Caricate il Blink e contate insieme i lampeggi per 5 secondi: ne conterete esattamente 5.

Poi passate a **Vol. 3 pag. 49** e chiedete: *"Se cambio `delay(1000)` in `delay(200)`, quante volte lampeggia in 5 secondi?"* — 25 volte. Cambiate il valore in diretta, caricate, e contate insieme. Il collegamento numero ↔ tempo diventa concreto e memorabile.

Per il Morse (Vol. 3 pag. 57), leggete ad alta voce:
> "Usa delay diversi: delay(150) per il punto, delay(400) per la linea" — Vol. 3 pag. 57

Poi battete sul banco il ritmo S-O-S (breve breve breve — lungo lungo lungo — breve breve breve) e chiedete: *"Riuscite a sentire la differenza tra 150 ms e 400 ms?"*

### Cosa dire ai ragazzi (parole del libro)
> "Modifica il programma Blink per cambiare la velocità del lampeggio. Prova con delay diversi per capire il concetto di millisecondi." — Vol. 3 pag. 49

Dopo che i ragazzi hanno provato i loro valori, chiedete: *"Chi riesce a far lampeggiare il LED esattamente a ritmo di musica lenta — circa 60 battiti al minuto?"* La risposta è `delay(500)` (mezzo secondo ON, mezzo secondo OFF = 1 beat/s = 60 bpm). È un modo creativo di ancorare il concetto di millisecondi alla vita reale.

### Progressione didattica consigliata
1. **Blink con `delay(1000)`**: il LED lampeggia, contiamo insieme i secondi — concreto e verificabile (Vol. 3 pag. 47)
2. **Variazione delay**: 100 ms, 500 ms, 2000 ms — il numero controlla il tempo (Vol. 3 pag. 49)
3. **Codice Morse**: delay diversi nella stessa sequenza — creatività + comprensione profonda (Vol. 3 pag. 57)
4. **Semaforo**: più LED con delay diversi — composizione di sequenze temporizzate (Vol. 3 pag. 68)
5. **`millis()` come sfida avanzata**: per i ragazzi più veloci — LED lampeggia + pulsante funziona contemporaneamente

## Link L1 (raw)

Query RAG per recuperare chunk correlati da `src/data/rag-chunks.json`:
- `"delay millisecondi arduino"` → chunk code-1, code-2, error-5
- `"blink delay 1000"` → chunk code-1, tip-1, tip-2
- `"LED lampeggia troppo veloce delay"` → error-5
- `"millis non bloccante arduino"` → tip-5, tip-6
- `"delay bloccante loop"` → tip-5, error-6
- `"delay morse semaforo temporizzazione"` → code-2, code-5

bookText citati da `src/data/volume-references.js`:
- `v3-cap5-esp1` (pag. 47) — Blink, prima introduzione a `delay(1000)`
- `v3-cap5-esp2` (pag. 49) — variazione delay, comprensione millisecondi: *"Prova con delay diversi"*
- `v3-cap6-morse` (pag. 57) — SOS in codice Morse, delay differenziati per punti e linee
- `v3-cap7-esp5` (pag. 77) — `delay(250)` come cadenza di stampa nel Serial Monitor
