---
id: divisore-tensione
type: concept
title: "Divisore di Tensione (Partitore)"
locale: it
volume_ref: 2
pagina_ref: 45
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-q4
tags: [divisore-tensione, partitore, formula, resistenza, sensori, analog, arduino, ldr]
---

## Definizione

Il divisore di tensione è un circuito con due (o più) resistori in serie che divide la tensione di ingresso in frazioni proporzionali ai valori delle resistenze — Vol. 2 Cap. 4 pag. 45 lo introduce con tre resistori in serie a 9V: *"Succede quello che ti aspettavi? Applica la legge di Ohm."*

## Analogia per la classe

Ragazzi, immaginate di dividere una pizza in due fette di misura diversa: chi ha la fetta più grande riceve più pizza. Allo stesso modo, due resistori in serie si spartiscono la tensione della batteria — chi ha più Ohm, ottiene più Volt.

## Cosa succede fisicamente

Quando R1 e R2 sono collegati in serie tra Vin e GND, la stessa corrente scorre attraverso entrambi. Il nodo centrale — tra i due — vale:

```
Vout = Vin × R2 / (R1 + R2)
```

È la legge di Ohm applicata due volte: la tensione si distribuisce proporzionalmente alle resistenze.

### Esempi rapidi

| Vin | R1      | R2      | Vout calcolata |
|-----|---------|---------|----------------|
| 9V  | 1 kΩ    | 1 kΩ    | 4.5 V          |
| 9V  | 470 Ω   | 1 kΩ    | ≈ 6.1 V        |
| 5V  | 10 kΩ   | 10 kΩ   | 2.5 V          |
| 5V  | 10 kΩ   | LDR*    | varia con luce |

*L'LDR cambia resistenza con la luce (≈1 kΩ in piena luce → ≈100 kΩ al buio): Vout sale e scende al variare dell'illuminazione, e Arduino la legge con `analogRead()` (0–1023).

### Collegamento pratico (LDR + Arduino)

```
5V ──┬── R1 (10 kΩ) ──┬── GND
     │                │
     │             A0 (Vout)
     │                │
     └── LDR ─────────┘
```

Luce intensa → R_LDR bassa → Vout bassa → valore analogico basso.
Buio → R_LDR alta → Vout alta → valore analogico alto.

## Esperimenti correlati

- `v2-cap4-esp3` — Tre resistori in serie, misura con multimetro (Vol.2 pag.45)
- `v1-cap10-esp1` — LDR + resistore 10 kΩ in partitore (Vol.1 pag.82)
- `v2-cap3-esp4` — Misura di corrente con multimetro (Vol.2 pag.28)

Vedi anche: [concepts/fotoresistore.md](fotoresistore.md) · [concepts/resistenza.md](resistenza.md) · [concepts/legge-ohm.md](legge-ohm.md) · [concepts/potenziometro.md](potenziometro.md)

## Errori comuni

1. **R1 e R2 invertiti** — il punto di misura è tra i due resistori: se li invertite ottenete il valore complementare (Vin − Vout attesa). Controllate sempre quale resistore è verso GND.
2. **Carico che assorbe corrente** — se collegate un componente ad alto consumo al nodo centrale (es. un LED direttamente), "trascina" Vout verso il basso. Il partitore funziona bene solo con carichi ad alta impedenza come il pin analogico di Arduino (≈100 MΩ).
3. **Resistori troppo piccoli** — valori bassi (100–220 Ω) sprecano molta corrente dalla batteria. Per circuiti con sensori usate 10 kΩ.
4. **GND non comune** — il GND dell'Arduino e il GND della batteria esterna devono essere collegati insieme; senza questo collegamento la lettura analogica è casuale o errata.
5. **Confondere partitore con parallelo** — nel parallelo entrambi i terminali sono condivisi; nel partitore si legge il nodo intermedio tra i due rami.

## Domande tipiche degli studenti

**"Perché non uso solo una resistenza?"**
> Con una sola resistenza si limita la corrente (protezione LED), ma non si ottiene una tensione intermedia precisa. Il partitore serve quando serve un valore di tensione specifico tra 0 e Vin.

**"Se giro il potenziometro, è un divisore di tensione?"**
> Esatto! Il potenziometro è un partitore regolabile: il cursore centrale è il nodo Vout, le due sezioni interne sono R1 e R2 variabili.

**"Posso usarlo per alimentare un LED?"**
> No — il LED assorbe troppa corrente e fa crollare Vout. Il partitore va bene solo per leggere segnali (pin analogico Arduino), non per alimentare carichi.

**"Cosa cambia se metto tre resistori uguali invece di due?"**
> Con tre resistori uguali in serie ottenete Vin/3 al primo nodo e 2×Vin/3 al secondo — la tensione si divide in tre parti uguali. Questo è esattamente l'esperimento Vol.2 pag.45!

## PRINCIPIO ZERO

**Narrativa per la classe** — quando portate questo concetto alla LIM:

> "Vediamo insieme come si divide la tensione in un circuito. Guardate: tre resistori in serie, una batteria da 9V. Ogni resistore si prende una fetta di tensione proporzionale al suo valore. Il libro (Vol. 2 pag. 45) ci chiede: *'Succede quello che ti aspettavi?'* — proviamo insieme col multimetro, tocchiamo i punti J9, J5, J1 e leggiamo i valori."

**Sicurezza:** il divisore di tensione con resistori ≥ 470 Ω è sicuro a 9V (corrente max ≈ 19 mA). Non cortocircuitare il nodo Vout direttamente su GND senza almeno una resistenza in serie.

**Cosa dire ai ragazzi:**
- "Misuriamo la tensione nei punti J9, J5, J1 col puntale rosso del multimetro — vedete come cambia?"
- "Qual è il nodo con più tensione? E quello con meno? Perché secondo voi?"
- "Proviamo a mettere due resistori uguali: che tensione vi aspettate al centro?"

**Plurale inclusivo:** usate sempre "Vediamo", "Proviamo", "Misuriamo" — mai comandi diretti al singolo.

## Link L1 (raw RAG queries)

Query dirette da passare a `searchRAGChunks()` o `searchKnowledgeBase()` per arricchire il contesto:

```
partitore di tensione resistori serie
LDR fotoresistore partitore 10kΩ analogRead
caduta tensione misura multimetro Vol.2 Cap.4
Vout Vin R2 R1 formula divisore
divisore tensione carico impedenza errore
sensore luce Arduino pin analogico LDR
```
