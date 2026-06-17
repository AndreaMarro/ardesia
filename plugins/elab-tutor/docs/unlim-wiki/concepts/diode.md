---
id: diode
type: concept
title: "Diodo (e Diodo LED)"
locale: it
volume_ref: 1
pagina_ref: 27
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: content-writer
tags: [diodo, led, anodo, catodo, polarizzato, componente-base, capitolo-6]
---

## Definizione

Il diodo LED — acronimo di **Light Emitting Diode** — è un piccolo dispositivo elettronico che produce luce quando viene attraversato da corrente elettrica nella direzione corretta. Vol.1 pag.27 lo introduce come «una minuscola lampadina molto efficiente»: stessa funzione di una lampadina tradizionale, consumi enormemente inferiori.

Il diodo in generale è un componente **polarizzato**: lascia passare la corrente in un solo verso, esattamente come una valvola a senso unico. Il LED è il caso più vistoso della famiglia diodo perché emette luce quando la corrente scorre correttamente.

## Analogia per la classe

Ragazzi, immaginate un cancellino a girevole come quelli dei tornelli della metro: la gente (la corrente) può entrare solo da un lato. Se cercate di passare al contrario, il tornello si blocca. Il diodo LED funziona esattamente così: la corrente entra dall'**Anodo** (gamba lunga, +) ed esce dal **Catodo** (gamba corta, −). Se lo girate al contrario, niente corrente, niente luce — ma nessun danno.

## Come identificare il positivo e il negativo

Dal Vol.1 pag.27, Capitolo 6: «la gambetta lunga indica il POSITIVO, mentre la gambetta corta il NEGATIVO.»

Tre segnali visivi da cercare sempre sul LED fisico:

| Segnale           | Significato              |
|-------------------|--------------------------|
| Gamba **lunga**   | **Anodo** (+) — positivo |
| Gamba **corta**   | **Catodo** (−) — negativo |
| Piattina sul bordo della testa | Conferma lato Catodo (−) |

A differenza dei resistori (che si possono inserire in qualunque verso), il LED Vol.1 pag.27 sottolinea che «NON può essere inserito nella breadboard in qualunque verso perché è un componente POLARIZZATO».

## Parametri fisici tipici (LED 5 mm da kit Omaric)

| Parametro           | LED Rosso       | LED Verde       | LED Blu/Bianco  |
|---------------------|-----------------|-----------------|-----------------|
| Tensione diretta    | 1.8 – 2.2 V     | 2.0 – 2.4 V     | 3.0 – 3.4 V     |
| Corrente nominale   | 20 mA           | 20 mA           | 20 mA           |
| Resistenza con 5 V  | ~150 – 220 Ω    | ~130 – 180 Ω    | ~82 – 100 Ω     |
| Resistenza con 9 V  | ~390 – 470 Ω    | ~330 – 390 Ω    | ~270 – 330 Ω    |

**Formula per calcolare la resistenza serie:**

```
R = (V_sorgente − V_LED) / I_LED

Esempio: V_sorgente = 9V, V_LED = 2V, I_LED = 0.02 A
R = (9 − 2) / 0.02 = 350 Ω  →  scegliere 470 Ω (valore commerciale)
```

*Nota pedagogica*: questa formula collega direttamente la Legge di Ohm (Vol.1 cap. precedente) all'uso pratico del LED. Il calcolo R è il primo "ragionamento da elettronico" dei ragazzi.

## Cosa succede fisicamente

Quando la corrente scorre dall'Anodo al Catodo del LED, gli elettroni nel semiconduttore (materiale speciale: arseniuro di gallio, fosfuro di gallio, ecc.) ricombinano e rilasciano energia sotto forma di **fotoni** — particelle di luce. Cambiare il materiale cambia il colore: fosfuro → rosso/giallo, nitruro → blu/bianco.

Se la corrente è invertita (Catodo verso +, Anodo verso −): la barriera di potenziale del semiconduttore blocca il flusso. Nessuna ricombinazione, nessuna luce. Il LED è integro ma inattivo.

> Sezione non coperta dal Vol.1 pag.27 (fisica dei semiconduttori — integrazione da conoscenza generale).

## Esperimenti correlati

- **Capitolo 6, Vol.1** — Primo circuito LED: breadboard + LED + resistenza + batteria 9V. È l'esperimento fondante dove si impara a orientare il LED e calcolare la resistenza.
- **Vol.1, capitoli successivi** — LED con Arduino (pin digitale D13, `digitalWrite(13, HIGH)`)
- **Vol.2, pag.40 area** — LED con PWM (`analogWrite`) per variare luminosità

## Errori comuni

1. **LED inserito al contrario**: non si accende, ma non si rompe (il diodo blocca la corrente). Soluzione: invertire le gambe nella breadboard.
2. **LED senza resistenza serie**: la corrente è limitata solo dalla resistenza interna — molto bassa. Il LED brucia in pochi secondi (odore di plastica bruciata). La resistenza è OBBLIGATORIA.
3. **Resistenza troppo alta (es. 10 kΩ)**: il LED si accende debolmente o non si vede. Calcolare R con la formula sopra.
4. **Confusione gamba corta / piattina**: alcuni LED cinesi economici hanno gambe tagliate uguali. In questo caso la piattina sul bordo della testa è l'unico riferimento sicuro (Vol.1 pag.27).
5. **Gamba tagliata a zero**: Vol.1 pag.27 domanda «Cosa succede se tagliamo le gambette al povero LED?» — senza gambe non si riesce più a distinguere Anodo da Catodo. Usare il multimetro in modalità test diodo.

## Domande tipiche degli studenti

**D: Perché il LED non si può mettere al contrario ma il resistore sì?**
R: Il resistore è simmetrico (non polarizzato): la resistenza è la stessa in entrambi i sensi. Il diodo LED è asimmetrico: ha un giunzione p-n che lascia passare corrente solo in un verso.

**D: Se non metto la resistenza, che succede davvero?**
R: Il LED disegna tutta la corrente che il circuito può fornire finché il giunzione non si surriscalda e si rompe — pochi secondi. Con Arduino si rischia anche di bruciare il pin del microcontrollore (max 40 mA per pin).

**D: Come faccio se ho tagliato le gambe del LED uguali?**
R: Guardare il bordo della testa del LED: il lato con il taglio piatto è il Catodo (−). Se non si vede, usare il multimetro in modalità diodo: la lettura ~1.8–2.0 V indica che il puntale rosso è sull'Anodo.

**D: I LED di colori diversi hanno tensioni diverse?**
R: Sì — è per questo che la formula R cambia. LED blu e bianchi hanno tensione ~3.2–3.4 V; LED rossi e gialli ~1.8–2.2 V. Usare sempre il valore corretto nel calcolo della resistenza.

## PRINCIPIO ZERO

**Per chi spiega ai ragazzi — guida silenziosa:**

Quando introducete il diodo LED in classe:

- Usate sempre il plurale inclusivo: «Ragazzi, prendete il LED dal kit…», «Vediamo insieme come orientarlo…»
- Citate il Volume verbatim: Vol.1 pag.27 dice «la gambetta lunga indica il POSITIVO» — usate queste esatte parole, non parafrasate
- Il kit fisico è PROTAGONISTA: fate toccare il LED ai ragazzi, far sentire la differenza tra gamba lunga e corta con le dita
- MAX 3 frasi + 1 analogia (tornello metro) prima di far costruire il circuito
- Il simulatore mostra il LED che si accende/spegne MA i ragazzi costruiscono prima sul kit fisico, poi verificano nel simulatore
- Sicurezza: ricordare SEMPRE la resistenza serie — è la regola d'oro, non un'opzione

**Errore pedagogico da evitare**: non dire ai ragazzi "mettete la gamba lunga nel foro X". Farli ragionare: «Sapete come riconoscere il positivo? Qual è la gamba lunga? Dove va il positivo nel circuito?»

## Link L1 (raw RAG queries)

Per recuperare i chunk raw correlati da `src/data/rag-chunks.json`:

- Query: `"LED diodo gambetta lunga anodo catodo"`
- Query: `"componente polarizzato breadboard verso"`
- Query: `"resistenza LED formula calcolo"`
- Query: `"Vol.1 Capitolo 6 primo circuito LED"`
