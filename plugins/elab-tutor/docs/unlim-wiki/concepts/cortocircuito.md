---
id: cortocircuito
type: concept
title: "Cortocircuito"
locale: it
volume_ref: 1
pagina_ref: 32
created_at: 2026-04-25
updated_at: 2026-04-25
updated_by: architect
tags: [cortocircuito, sicurezza, corrente, circuito, protezione, resistenza]
---

## Definizione

Un cortocircuito si verifica quando due punti del circuito a potenziale diverso vengono collegati da un percorso a resistenza quasi zero, bypassando il componente che dovrebbe limitare la corrente. Vol. 1 pag. 32 lo descrive come "il nemico numero uno del circuito: tutto il potere senza nessun controllo".

## Analogia per la classe

Ragazzi, immaginate un tubo dell'acqua con un rubinetto a metà. Se aprite un buco enorme nel tubo prima del rubinetto, tutta l'acqua schizza fuori dal buco — il rubinetto non serve più a nulla. Nel circuito elettrico succede la stessa cosa: se la corrente trova una via diretta senza resistenza, ci passa tutta insieme, riscaldando i fili e bruciando i componenti.

## Cosa succede fisicamente

Quando si crea un cortocircuito, la resistenza del percorso è quasi 0 Ω. Dalla legge di Ohm:

```
I = V / R
```

Con R → 0, la corrente I → infinito (in pratica: limitata solo dalla resistenza interna della batteria).

### Conseguenze tipiche

| Situazione | Corrente | Effetto |
|---|---|---|
| Circuito normale (LED + 470Ω, 9V) | ~19 mA | OK |
| LED senza resistenza (9V) | ~900 mA | LED brucia in secondi |
| Cortocircuito diretto batteria 9V | 1–5 A | Batteria si scalda, possibile perdita di elettrolita |
| Cortocircuito batteria Li-Ion | >10 A | Surriscaldamento, rischio incendio |

## Esperimenti correlati

- Vol.1 pag.27 — Primo circuito LED (il LED senza resistenza è un quasi-cortocircuito)
- Vol.1 pag.45 — Legge di Ohm: capire perché R=0 causa corrente infinita
- Vol.2 pag.8 — Partitore di tensione: resistenze in serie proteggono dal cortocircuito

## Errori comuni

1. **Filo diretto tra + e − della batteria**: cortocircuito puro. La batteria si scalda rapidamente, si scarica in secondi e può perdere elettrolita. Sul breadboard i fili Dupont possono scivolare facilmente sulle colonne adiacenti.

2. **LED collegato senza resistenza**: la corrente sale a 10× il valore nominale. Il LED si brucia in 2-3 secondi emettendo fumo e odore acre. È l'errore più comune nei primi esperimenti.

3. **Fili che si toccano accidentalmente**: su una breadboard affollata, due cavetti Dupont con l'isolamento vicino possono toccarsi ai terminali. Controllare sempre che ogni filo vada nel foro giusto e non tocchi nulla a fianco.

4. **Cavo con isolamento danneggiato**: un cavo che si è piegato troppe volte può avere l'isolamento crepato. Se tocca un'altra pista, cortocircuita silenziosamente — il circuito funziona male senza un motivo ovvio.

5. **Pin digitale Arduino messo in OUTPUT HIGH collegato direttamente a GND**: non è un cortocircuito classico ma ci si avvicina — corrente fino a 40 mA su un pin limitato a 20 mA, il pin si brucia in pochi minuti.

## Domande tipiche degli studenti

**"Perché la batteria si scalda anche se non ho acceso niente?"**
Cercate un cortocircuito nascosto: un filo che tocca una pista sbagliata, o un componente inserito al contrario che crea una via diretta.

**"Perché il LED si è bruciato subito?"**
Quasi certamente mancava la resistenza in serie. Senza resistenza il LED riceve tutta la tensione e tutta la corrente — si brucia in 2-3 secondi.

**"Perché la batteria si è scaricata in pochi minuti?"**
Un piccolo cortocircuito può scaricare una batteria da 9V in meno di 10 minuti senza che nessun componente sembri acceso. Scollegare tutto e controllare la continuità con il multimetro.

**"Il componente ha fatto un piccolo scoppio/fumo — cosa è successo?"**
Probabile cortocircuito su un componente non protetto. Scollegare immediatamente l'alimentazione, non ricollegare finché non si è trovata la causa.

## PRINCIPIO ZERO

Quando mostri alla classe un cortocircuito, usa sempre una batteria stilo AA o AAA (1.5V) — mai la batteria da 9V direttamente sui morsetti, e mai alimentatori da rete. La batteria AA ha resistenza interna più alta e non si surriscalda pericolosamente.

Prima di spiegare la formula, mostra fisicamente cosa succede: prendi un LED senza resistenza e collegalo brevemente (meno di 1 secondo) — i ragazzi vedono e sentono che qualcosa non va. Poi spiega il perché con il Vol.1 pag.32 aperto davanti a loro. Le parole del libro vengono *dopo* l'esperienza diretta, non prima.

**Cosa dire ai ragazzi**: "Vedete? La corrente ha trovato una strada troppo facile e ha bruciato tutto nel tragitto. La resistenza è la nostra guardia del corpo — senza di lei, la corrente distrugge quello che incontra."

## Link L1 (raw)

Citazioni bookText correlate in `src/data/rag-chunks.json` con query "cortocircuito", "resistenza serie", "LED senza resistenza", "batteria si scalda".
