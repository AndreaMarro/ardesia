---
id: led-giallo
type: concept
title: "LED Giallo"
locale: it
volume_ref: 2
pagina_ref: 59
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-wiki-batch
tags: [led, led-giallo, serie, colore, tensione-diretta, vf, multimetro, resistenza, capitolo-6]
---

## Definizione

Il LED giallo è un diodo a emissione luminosa che produce luce gialla quando attraversato da corrente nella direzione corretta. A differenza del LED rosso (Vf ~1.8–2.0 V), il giallo ha una tensione diretta leggermente più alta (~2.0–2.2 V). Vol.2 pag.59 lo introduce in un circuito a tre LED in serie: «Posiziona un LED di un altro colore (usiamo il giallo) con il catodo rivolto verso l'anodo del LED rosso e il suo anodo collegato in un punto qualsiasi della breadboard».

## Analogia per la classe

Ragazzi, immaginate una fila di tre porte a senso unico — rossa, gialla e verde — che la corrente deve attraversare una dopo l'altra per raggiungere il traguardo. Ogni porta "assorbe" un po' di tensione per aprirsi. Più porte aggiungete, meno spinta rimane per le successive: ecco perché in un circuito a tre LED la luminosità cala rispetto a uno solo. Provate a immaginare quanta energia si "consuma" ad aprire tutte e tre le porte insieme!

## Cosa succede fisicamente

### Parametri tipici LED giallo 5 mm

| Parametro            | Valore                          |
|----------------------|---------------------------------|
| Tensione diretta Vf  | 2.0–2.2 V                       |
| Corrente nominale    | 20 mA (0.02 A)                  |
| Resistenza con 9 V   | ~(9 – 2.1) / 0.02 ≈ **345 Ω** → 330 Ω commerciale |
| Colore               | ~590 nm (spettro giallo)        |

### Formula per la resistenza in serie

```
R = (V_sorgente – V_led) / I_led
```

Con batteria 9 V, LED giallo (Vf = 2.1 V), corrente 20 mA:
```
R = (9 – 2.1) / 0.02 = 345 Ω  →  si sceglie 330 Ω
```

Vol.2 pag.59 usa proprio **330 Ω** come resistore tra il positivo della batteria e l'anodo del LED giallo.

### Serie di tre LED — effetto cumulativo

Quando tre LED sono in serie (rosso + giallo + verde) la stessa corrente li attraversa tutti, ma la tensione si divide:

```
V_sorgente = V_R + V_led1 + V_led2 + V_led3
```

Aggiungendo LED, la corrente effettiva diminuisce perché la somma delle Vf lascia meno "margine" alla resistenza. Il Vol.2 pag.59 suggerisce: «Prova ora a modificare il valore di resistenza da 330 Ω a 220 Ω e osserva come cambia la luminosità dei LED!» — passare a 220 Ω aumenta la corrente e quindi la luminosità di tutti e tre.

### Misura Vf con multimetro (Esperimento 4 — Vol.2 pag.60)

Il multimetro in modalità **prova diodi** applica una piccola tensione al LED e mostra la caduta Vf esatta. Vol.2 pag.60: «Sapendo qual è la Vf esatta del nostro diodo, siamo in grado di individuare il valore esatto di resistenza di cui abbiamo bisogno per avere il massimo della luminosità».

Procedura:
1. Ruotare il selettore sulla funzione **prova diodi / continuità** (simbolo diodo + buzzer)
2. Collegare il puntale rosso all'**anodo** (gamba lunga) del LED giallo
3. Collegare il puntale nero al **catodo** (gamba corta)
4. Leggere il valore in mV — es. 2050 mV = Vf 2.05 V
5. Con Vf misurata: `R = (9 – 2.05) / 0.02 = 347.5 Ω` → scegliere 330 Ω o 390 Ω

## Esperimenti correlati

- **Vol.2 pag.59 — Cap.6** — Circuito tre LED in serie (rosso + giallo + verde), resistore 330 Ω, batteria 9 V
- **Vol.2 pag.60 — Cap.6 Esperimento 4** — Misura Vf del LED con multimetro in modalità prova diodi
- **`concepts/led.md`** — concetto base LED (Vol.1 pag.27) — anodo/catodo, formula generale
- **`concepts/diodo.md`** — diodo come componente a senso unico (Vol.2 pag.103)
- **`concepts/multimetro.md`** — funzioni del multimetro inclusa prova diodi
- **`concepts/resistenza.md`** — calcolo valore resistenza in serie

## Errori comuni

1. **LED giallo collegato al contrario** — catodo al positivo: non si accende (il diodo blocca), ma non si rompe. Controllare la gamba lunga (anodo) verso il positivo.
2. **Confondere la Vf del giallo con quella del rosso** — i LED rossi hanno Vf più bassa (~1.8 V) rispetto ai gialli (~2.1 V): usare sempre la misura reale col multimetro per calcolare R precisa (Vol.2 pag.60).
3. **Non mettere nessuna resistenza** — senza resistore il LED giallo prende tutta la tensione: brucia in secondi. La resistenza è obbligatoria.
4. **Resistenza troppo alta (es. 1 kΩ) in serie con tre LED** — la corrente cala così tanto che i LED sembrano spenti. Se i ragazzi vedono i LED debolissimi, provare a scalare a 220 Ω (Vol.2 pag.59).
5. **Confondere il puntale rosso/nero alla prova diodi** — il puntale rosso va all'anodo (gamba lunga): invertito il multimetro mostra "OL" (circuito aperto), non un errore ma indica che il diodo è sano e che hai i puntali al contrario.

## Domande tipiche degli studenti

**D: "Perché il LED giallo si accende più fioco del rosso con la stessa resistenza?"**
R: Perché ha una Vf leggermente più alta: la stessa resistenza lascia passare una corrente leggermente minore, quindi meno luminosità. Per parificarla bisogna scendere di qualche decina di ohm (es. da 330 Ω a 270 Ω).

**D: "Se metto 220 Ω invece di 330 Ω non brucia il LED?"**
R: No, con batteria 9 V e 220 Ω la corrente sale a circa 32 mA — un po' sopra i 20 mA nominali, ma il LED giallo standard 5 mm sopporta punte fino a 40–50 mA per breve tempo. Meglio non farlo di continuo: il calore accumula. Provatelo per osservare la differenza di luminosità (Vol.2 pag.59), poi tornate a 330 Ω.

**D: "Come faccio a sapere se il LED giallo è rotto prima di montarlo?"**
R: Con la funzione prova diodi del multimetro (Vol.2 pag.60): se mostra un valore tra 1800 e 2500 mV il LED è sano; se mostra "OL" in entrambi i versi è rotto (circuito aperto); se mostra 0 è in cortocircuito (fulminato).

**D: "Posso usare qualsiasi resistenza che ho disponibile?"**
R: Sì, l'importante è che la corrente resti sotto 30 mA circa. Con 9 V e un LED giallo (Vf ≈ 2.1 V): la resistenza minima sicura è (9–2.1)/0.03 ≈ 230 Ω. Qualsiasi valore superiore è sicuro, anche se il LED sarà più fioco.

## PRINCIPIO ZERO

Quando si introduce il LED giallo alla classe:

- **Parlare sempre in plurale** — «Ragazzi, prendete il LED giallo dalla scatola…», «Vedete la gamba lunga? Quella va verso il positivo…», «Misuriamo insieme la sua Vf con il multimetro…»
- **Sicurezza**: le tensioni del kit ELAB (5–9 V) sono completamente sicure. I LED non bruciano le dita. L'unico "pericolo" è bruciare il LED stesso se si dimentica la resistenza — niente fumo, solo il componente smette di funzionare.
- **Narrativa suggerita**: «Nel Vol.2 a pag.59 abbiamo visto come collegare tre LED in serie. Il resistore da 330 Ω fa da "guardia": controlla quanta corrente entra nel circuito. Se vogliamo più luce, proviamo con 220 Ω — ma attenzione, troppa corrente e i LED soffrono! Misuriamo prima la Vf di questo LED giallo con il multimetro come dice pag.60.»
- **Cosa mostrare sulla LIM**: il circuito a tre LED in serie (schema da Vol.2 pag.59), il selettore del multimetro sulla funzione prova diodi, la lettura in mV del LED giallo.
- **Collegamento al libro**: Vol.2 Capitolo 6, pagine 59–60. Tenere il volume fisico aperto sulla pagina mentre si monta il circuito — leggere insieme la descrizione del posizionamento.

## Link L1 (query RAG suggerite)

```
LED giallo serie tre LED breadboard
resistore 330 ohm LED giallo 9V
multimetro prova diodi Vf LED
tensione diretta LED colori diversi
luminosità LED resistenza corrente
capitolo 6 vol 2 LED serie circuito
```
