---
id: kirchhoff-current
type: concept
title: "Prima Legge di Kirchhoff (KCL) — La corrente si conserva nei nodi"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [kirchhoff, KCL, nodo, corrente, parallelo, conservazione, circuito, leggi-fondamentali, analisi-circuiti]
---

## Definizione

La Prima Legge di Kirchhoff (KCL — Kirchhoff's Current Law) afferma che **la somma di tutte le correnti che entrano in un nodo è uguale alla somma di tutte le correnti che escono dallo stesso nodo**. In formule: **ΣI_entranti = ΣI_uscenti**. La corrente non si accumula nei nodi — si conserva sempre.

> *(Nota: nessun match diretto trovato nei Volumi ELAB per questa voce — contenuto da conoscenza generale, `source_status: general_knowledge_only`. La KCL è il fondamento implicito dietro i circuiti in parallelo descritti in tutto il corso; Vol. 1 pag. 27 mostra il primo circuito con più rami paralleli — la KCL spiega perché funziona così.)*

---

## Analogia per la classe

Ragazzi, immaginate un incrocio stradale: tante macchine arrivano da destra e da sinistra, poi ripartono verso il basso e verso l'alto. Quante macchine entrano nell'incrocio? Esattamente tante quante ne escono — non scompaiono e non si moltiplicano nell'incrocio. Gli elettroni in un nodo si comportano esattamente così: quanti entrano, tanti escono. La corrente non si "accumula" mai in un punto del filo.

---

## Cosa succede fisicamente — nodi e rami

### Il concetto di nodo

Un **nodo** è qualsiasi punto del circuito dove due o più fili si incontrano. Sul vostro kit ELAB, un nodo tipico è una fila della breadboard dove collegate LED, resistori e fili insieme.

```
       I₁ →                ← I₃
            ────[Nodo A]────
       I₂ →                ↓ I₄
```

**Equazione KCL al Nodo A:**
```
I₁ + I₂ + I₃ = I₄
```

### La regola con i segni

Per usare KCL in modo sistematico si assegna un segno alle correnti:
- **Correnti entranti** nel nodo: segno **+**
- **Correnti uscenti** dal nodo: segno **−**

Somma = **0** (forma alternativa equivalente):

```
ΣI = 0      →      I₁ + I₂ − I₃ − I₄ = 0
```

### KCL nei circuiti parallelo del kit

| Configurazione | Cosa dice la KCL |
|---|---|
| 2 LED in parallelo su Arduino D13 | I_totale = I_LED1 + I_LED2 |
| 3 resistori in parallelo | I_batteria = I_R1 + I_R2 + I_R3 |
| Ramo aperto (interruttore OFF) | I_ramo = 0 → tutta la corrente va sugli altri rami |

**Esempio pratico con il kit:**
```
Arduino 5 V alimenta 2 LED in parallelo, ciascuno con 220 Ω:
I_LED1 = (5 − 2) / 220 ≈ 13.6 mA
I_LED2 = (5 − 2) / 220 ≈ 13.6 mA

KCL al nodo positivo:
I_totale = I_LED1 + I_LED2 = 13.6 + 13.6 = 27.2 mA

→ Il pin D13 di Arduino deve erogare 27.2 mA (attenzione: limite pin ≈ 40 mA!)
```

---

## Esperimenti correlati

- **Vol. 1 pag. 27** — Primo LED con 9 V: circuito serie; KCL conferma che la stessa corrente scorre ovunque (un solo ramo, ΣI_entranti = ΣI_uscenti in ogni punto)
- **Vol. 1 pag. 50** — Introduzione ai circuiti con più componenti: nodi impliciti sulla breadboard dove la KCL opera in silenzio
- **Capitoli partitore di tensione** (Vol. 2) — Due resistori in serie formano un nodo intermedio; la KCL garantisce che la corrente sia identica nei due resistori in serie
- **Capitoli motori e servomotori** — Il driver del motore riceve corrente da due rami (logica + potenza); KCL al nodo di alimentazione spiega la corrente totale assorbita

---

## Errori comuni

1. **"La corrente si accumula nel nodo" (errore concettuale base)** — Gli elettroni non si fermano nei nodi come acqua in un serbatoio. Il nodo è solo un punto di smistamento. Se la KCL non torna in un circuito reale, c'è sempre un filo non collegato o un cortocircuito nascosto.

2. **Ignorare i rami aperti nel conteggio** — Un ramo con interruttore aperto porta I = 0, ma va comunque incluso nell'equazione KCL. Trascurarlo porta a somme sbagliate e calcoli errati sul ramo principale.

3. **Confondere KCL (corrente) con KVL (tensione)** — La Seconda Legge di Kirchhoff (KVL) riguarda le tensioni lungo un anello. KCL riguarda le correnti in un nodo. Sono due strumenti diversi, entrambi necessari per analizzare un circuito complesso.

4. **Dimenticare che KCL vale anche per correnti AC e PWM** — Nei circuiti Arduino con PWM (analogWrite), KCL vale istante per istante. In media, la corrente media si conserva allo stesso modo.

5. **Misurare la corrente sbagliando il punto** — L'amperometro (o il multimetro in modalità A) misura la corrente nel ramo in cui è inserito in serie. Se lo mettete nel ramo sbagliato, misurate solo una parte della corrente totale — non quella che vale la KCL al nodo.

---

## Domande tipiche degli studenti

**"Se la KCL dice che la corrente si conserva, perché un LED collegato in parallelo a un altro è più luminoso?"**
Non è più luminoso — riceve la stessa corrente del LED da solo (uguale resistenza di protezione, uguale tensione di alimentazione). La KCL dice che la corrente totale della batteria/Arduino *aumenta*, ma ogni LED riceve la sua quota individuale invariata. Due LED in parallelo = stessa luminosità per LED, doppio consumo totale.

**"Come si fa a sapere in quale direzione va la corrente se non lo so a priori?"**
Si sceglie una direzione convenzionale (es. tutti i rami entranti positivi). Se il risultato del calcolo è negativo, la corrente scorre nel verso opposto — non c'è nulla di sbagliato, è solo la matematica che corregge l'ipotesi iniziale.

**"La KCL vale solo per i nodi o anche per i fili?"**
Un filo senza diramazioni è un "nodo degenere" con due soli rami: la corrente entrante = la corrente uscente, quindi è uguale lungo tutto il filo. Questo spiega perché in un circuito in serie la corrente è identica in ogni punto.

**"Posso usare la KCL per trovare quanta corrente assorbe l'Arduino?"**
Esattamente! Sommate le correnti di tutti i componenti collegati ai pin di Arduino: LED, servomotori, sensori. La KCL vi dice la corrente totale che il pin di alimentazione (5 V) deve erogare. Se supera ~200 mA totali, il regolatore di Arduino si scalda.

---

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Narrativa**: «Ragazzi, la Prima Legge di Kirchhoff è la "legge del traffico" dei vostri circuiti: ogni elettrone che arriva in un punto deve ripartire. Niente si perde, niente si crea. Quando costruite un circuito in parallelo sul vostro kit, state vedendo la KCL in azione — ogni ramo prende la sua quota di corrente, e la batteria fornisce esattamente la somma di tutte le quote.»

> **Approccio didattico**: partire da un circuito fisico già costruito sul kit (es. due LED in parallelo), misurare con il multimetro la corrente nel ramo comune e nei singoli rami, poi mostrare che la somma torna. La KCL passa da formula astratta a fatto verificato con le mani.

> **Sicurezza**: la KCL aiuta a calcolare la corrente totale che un pin di Arduino deve erogare. Prima di collegare troppi componenti in parallelo, fate la somma — i pin di Arduino hanno un limite di circa 40 mA ciascuno. Superarlo non causa esplosioni, ma può danneggiare silenziosamente il microcontrollore nel tempo.

> **Collegamento ai volumi**: sebbene la KCL non sia esplicitamente nominata nei Volumi ELAB con questo nome, è il principio dietro ogni schema con più rami che vedete nel libro. Quando il libro dice «i due LED si accendono indipendentemente» (circuito in parallelo), sta usando la KCL senza dirlo. Voi ora sapete il perché.

---

## Link L1 (raw RAG queries)

```
Kirchhoff corrente nodo legge prima KCL
corrente parallelo rami somma conservazione
nodo circuito corrente entrante uscente
parallelo LED corrente totale Arduino
amperometro misura corrente ramo breadboard
circuito parallelo resistori corrente distribuzione
```

Cercare in `src/data/rag-chunks.json` con le query sopra. Concetti collegati: → [legge-ohm.md](legge-ohm.md) · [ohm-law.md](ohm-law.md) · [pull-up-resistor.md](pull-up-resistor.md) · [resistenza.md](resistenza.md)
