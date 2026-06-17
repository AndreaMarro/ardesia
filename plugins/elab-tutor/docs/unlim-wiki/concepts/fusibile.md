---
id: fusibile
type: concept
title: "Fusibile (protezione da sovracorrente)"
locale: it
volume_ref: 2
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [fusibile, protezione, sicurezza, sovracorrente, cortocircuito, polyfuse, arduino, componenti]
---

## Definizione

Il fusibile è un componente elettronico di protezione che **interrompe automaticamente il circuito** quando la corrente supera il valore per cui è dimensionato. Al suo interno c'è un sottilissimo filamento metallico: se la corrente diventa troppo alta, il filamento si fonde (si "brucia"), aprendo il circuito e proteggendo tutti gli altri componenti da danni o incendi. Arduino Nano monta un **polyfuse da 500 mA** sulla linea USB — un fusibile ripristinabile che si re-inserisce automaticamente quando si raffredda.

## Analogia per la classe

Ragazzi, pensate al fusibile come all'**eroè sacrificale** del circuito elettronico. Quando in una casa troppi elettrodomestici accesi insieme assorbono più corrente di quanto i fili possano reggere, l'interruttore del quadro elettrico scatta — il "fusibile" della casa. Si sacrifica lui, al posto dei fili che altrimenti potrebbero surriscaldarsi e prendere fuoco. Nel nostro kit, se per sbaglio collegassimo due fili che non devono stare insieme (cortocircuito), è il fusibile che cede per primo — non l'Arduino, non la batteria, non i fili.

## Cosa succede fisicamente

Il filamento del fusibile ha una piccola resistenza *R*. Quando scorre corrente *I*, dissipa potenza termica:

```
P = I² × R
```

Finché *I* è dentro il valore nominale, il calore generato viene smaltito nell'aria. Se *I* supera la soglia, il calore accumulate supera il **punto di fusione** del filamento (tipicamente 200–300 °C per leghe stagno-piombo), il filo si rompe e il circuito si apre: `I = 0 A` istantaneamente.

### Tabella grandezze nel momento del "salto"

| Grandezza           | Prima del fusibile (ok)     | Dopo il fusibile (aperto)  |
|---------------------|-----------------------------|----------------------------|
| Corrente (I)        | ≤ I_nominale                | 0 A (circuito aperto)      |
| Tensione sul fusibile | ~0 V (filo conduce)       | = V_sorgente (tutto sul gap)|
| Temperatura filamento | bassa (smaltisce calore)  | > punto di fusione → rotto |
| Stato circuito      | chiuso, funzionante         | aperto, protetto           |

### Tipi di fusibili nel contesto ELAB

| Tipo                    | Aspetto                          | Ripristino | Uso tipico               |
|-------------------------|----------------------------------|------------|--------------------------|
| Tubolare vetro 5×20 mm  | Cilindro trasparente, filo visibile | NO (da sostituire) | Alimentatori, circuiti DIY |
| Blade (auto)            | Lamella colorata a spatola       | NO         | Auto, robotica           |
| Polyfuse (PTC)          | Componente SMD o disc nero       | **Sì**, quando si raffredda | Arduino Nano, USB hub    |
| Fusibile SMD            | Rettangolo piccolo sulla PCB     | NO         | PCB produzione           |

Arduino Nano: il polyfuse da **500 mA** è il piccolo componente giallo/arancio vicino al connettore USB. Se collegate un carico eccessivo (es. motore direttamente su 5 V senza driver), il polyfuse scatta, Arduino perde alimentazione, ma né l'USB del computer né la scheda si danneggiano.

## Esperimenti correlati

- **Qualsiasi esperimento con cortocircuito intenzionale** — il fusibile è la prima linea di difesa che mostra perché il percorso protetto è fondamentale
- **Vol. 2 — Motore DC** — i motori assorbono picchi di corrente all'avvio (inrush); un fusibile lento (time-delay) o un polyfuse evita falsi scatti
- **Vol. 3 — MOSFET come driver** — senza fusibile tra alimentazione e motore, un MOSFET in cortocircuito può bruciare la batteria; il fusibile salva il circuito
- → `cortocircuito.md` (concetto gemello: la causa più comune di fusibile saltato)
- → `corrente.md` (il fusibile reagisce alla corrente, non alla tensione)

## Errori comuni

1. **Sostituire un fusibile saltato con uno di amperaggio maggiore** ("non avevo il 500 mA, ho messo un 5 A"): è pericoloso. Il fusibile più grande lascia passare correnti che i fili e i componenti non reggono — aumenta il rischio di incendio o di bruciare l'Arduino. Usate sempre l'amperaggio corretto.

2. **Cortocircuitare il fusibile con un filo di rame** per "far funzionare il circuito": errore gravissimo. Eliminate ogni protezione e andate incontro a danni certi. Il filo al posto del fusibile è la singola modifica più pericolosa che si possa fare su un circuito.

3. **Confondere fusibile saltato con componente difettoso** — quando un LED non si accende, quasi sempre è un circuito aperto o un LED invertito; ma se tutti i LED si spengono contemporaneamente, il primo sospettato è il fusibile o il polyfuse di Arduino. Misurate la tensione a monte e a valle del fusibile con il multimetro.

4. **Non rispettare la tensione nominale del fusibile** — i fusibili hanno anche una tensione massima (es. 250 V). Su circuiti a bassa tensione (9 V, 5 V) questo non è un problema, ma usare un fusibile da alta tensione su 5 V non dà protezione aggiuntiva — va bene lo stesso.

5. **Dimenticare che il polyfuse di Arduino non è infinito** — dopo molti cicli di scatto-ripristino, le prestazioni del polyfuse peggiorano e la soglia di scatto scende. Se Arduino scatta spesso, investigate la causa (carico eccessivo) invece di ignorarla; il polyfuse non è immortale.

## Domande tipiche degli studenti

**"Ma se il fusibile si brucia, dobbiamo buttare via il circuito?"**
No, quasi mai. I fusibili tubolari si sostituiscono in pochi secondi (ne basta uno di ricambio uguale). Il polyfuse di Arduino si ripristina da solo: staccate l'USB, aspettate 30 secondi, ricollegare. Se continua a scattare, il problema non è il fusibile — è un cortocircuito da trovare.

**"Come faccio a sapere se il fusibile è saltato?"**
Con il multimetro in modalità continuità (bip): posate le punte ai due capi del fusibile. Se suona il bip, conduce — è integro. Se non suona, il filamento è interrotto — è saltato. In alternativa in modalità ohm: un fusibile integro legge 0–2 Ω; uno saltato legge "OL" (overload, infinito).

**"Perché l'Arduino Nano ha un fusibile se funziona con soli 5 V?"**
Protegge il computer, non solo Arduino. La porta USB del vostro PC può erogare al massimo 500 mA; se un esperimento ELAB assorbisse di più (es. motore direttamente su 5 V), senza polyfuse potreste danneggiare la porta USB del computer. Il polyfuse è lì per voi, per il docente, e per la scuola.

**"Un interruttore e un fusibile fanno la stessa cosa?"**
No, anche se entrambi aprono il circuito. L'interruttore lo fate voi a mano, quando volete. Il fusibile agisce **automaticamente** quando la corrente supera la soglia — anche se non siete lì, anche se state dormendo, anche se succede in un millisecondo. L'interruttore è controllo volontario; il fusibile è guardia autonoma.

## PRINCIPIO ZERO

### Sicurezza

Nel kit ELAB (9 V DC, correnti ≤ 200 mA tipicamente) il rischio da sovracorrente è basso ma reale in caso di cortocircuito accidentale: la batteria da 9 V può erogare picchi di corrente elevati, riscaldarsi pericolosamente e — in casi estremi con batterie di capacità alta — rigonfiarsi.

**Regole pratiche per la classe:**
- Se sentite odore di bruciato, staccate la batteria immediatamente e identificate il componente caldo prima di ricollegare
- Non cortocircuitate mai direttamente i poli della batteria: anche senza LED o resistenze, il filo diventa bollente in pochi secondi
- Il polyfuse di Arduino vi protegge dal computer — trattate il connettore USB con cura, non tirare i fili

### Narrativa per il docente

Il fusibile è un ottimo punto di ingresso alla discussione sulla **protezione per strati** (defense in depth): la batteria ha la sua protezione interna, Arduino ha il polyfuse, e in un circuito reale si aggiunge un fusibile esterno. Ogni livello protegge quello successivo.

Quando introducete il concetto, usate questo script:

> *"Ragazzi, nel nostro kit chi si 'sacrifica' per proteggere tutto il resto se qualcosa va storto?"*

Aspettate le risposte — spesso dicono "la batteria" o "il LED". Poi mostrate il polyfuse su Arduino: quel componente giallo/arancio minuscolo vicino all'USB è l'eroe che nessuno vede.

Se avete un fusibile tubolare di scorta, fatelo vedere fisicamente: il filo interno è visibile attraverso il vetro. Mostrate uno saltato a confronto — il filo è interrotto, il circuito è aperto. È un'immagine che i ragazzi ricordano.

### Cosa dire ai ragazzi

Non c'è una pagina specifica dei volumi dedicata al fusibile come esperimento a sé, ma quando compare un componente di protezione nei circuiti dei Vol. 2–3 (driver motore, MOSFET), leggete il testo del volume che introduce il componente e aggiungete:

> *"Vedete? Prima di collegare un carico come il motore, il libro ci mostra come proteggere il circuito. Il fusibile — o il polyfuse di Arduino — è quella protezione: si rompe lui, al posto vostro."*

### Connessione con altri concetti

Insegnate il fusibile sempre in coppia con `cortocircuito.md` (la causa principale che fa saltare i fusibili) e `corrente.md` (il fusibile reagisce all'amperaggio, non alla tensione). Richiamate `circuito-aperto.md`: un fusibile saltato **è** un circuito aperto — la stessa situazione, ma creata intenzionalmente per protezione.

## Link L1 (raw RAG queries)

- Query `"fusibile protezione corrente"` in `src/data/rag-chunks.json` → chunk sicurezza circuiti Vol. 2–3
- Query `"polyfuse arduino nano USB"` → chunk Arduino Nano pinout e protezione
- Query `"cortocircuito protezione batteria"` → chunk errori comuni + sicurezza Vol. 1
- Query `"sovracorrente componente brucia"` → chunk troubleshooting circuiti
- Query `"corrente massima LED resistenza"` → chunk dimensionamento + protezione corrente
