---
id: ohm-law
type: concept
title: "Legge di Ohm — Applicazione pratica ai circuiti del kit"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [legge-ohm, V=RI, potenza, serie, parallelo, calcolo-resistenza, kit, troubleshooting, fondamenti]
---

## Definizione

La Legge di Ohm descrive la relazione lineare tra tensione (V), corrente (I) e resistenza (R) in un conduttore ohmico: **V = R × I**. Vedi → [legge-ohm.md](legge-ohm.md) per la derivazione di base e l'analogia idraulica; vedi → [ohm.md](ohm.md) per l'unità di misura e il codice colori.

> *(Nota: nessun match diretto trovato nei Volumi ELAB per questa voce — contenuto da conoscenza generale, `source_status: general_knowledge_only`. Per il testo originale dei volumi: legge-ohm.md cita Vol. 1 pag. 45; ohm.md cita Vol. 1 pag. 35.)*

---

## Analogia per la classe

Ragazzi, pensate a Ohm come al "semaforo" di ogni circuito: dice quanta corrente può passare. Conoscendo due dei tre valori (V, R, I), trovate sempre il terzo — come trovare il lato mancante di un triangolo. Il kit ELAB contiene tutti i "pezzi" per verificarlo con le vostre mani.

---

## Il triangolo di Ohm — mnemonica visiva

```
          V
        ┌───┐
        │ V │
        ├───┼───┐
        │ R │ I │
        └───┴───┘
```

Coprite la grandezza che cercate: quello che rimane è la formula.

| Cerco | Copro | Formula      |
|-------|-------|--------------|
| V     | V     | R × I        |
| R     | R     | V / I        |
| I     | I     | V / R        |

---

## Potenza elettrica — la terza formula

La potenza (P, in **Watt**) è energia dissipata al secondo. Si ricava combinando Ohm con la definizione di potenza:

```
P = V × I          (regola base)
P = I² × R         (se conosco corrente e resistenza)
P = V² / R         (se conosco tensione e resistenza)
```

**Perché ci interessa nel kit?** Un resistore che dissipa troppa potenza si scalda e si brucia. I resistori del kit Omaric reggono **0.25 W (¼ W)**. Esempio:

```
LED con R = 220 Ω, alimentato a 5 V Arduino:
I = (5 - 2) / 220 ≈ 13.6 mA  (3 V = Vf LED, tolto dal totale)
P = I² × R = (0.0136)² × 220 ≈ 0.041 W  → sicuro, ben sotto ¼ W
```

---

## Applicazioni dirette al kit ELAB

### Calcolare la resistenza giusta per un LED

| Tensione alimentazione | V_LED tipico | Corrente target | Formula R = (V_alim - V_LED) / I |
|---|---|---|---|
| 9 V (batteria kit) | 2 V (rosso/giallo) | 20 mA | (9-2)/0.02 = **350 Ω** → usa 470 Ω |
| 5 V (pin Arduino) | 2 V (rosso/giallo) | 15 mA | (5-2)/0.015 = **200 Ω** → usa 220 Ω |
| 5 V (pin Arduino) | 3.3 V (blu/bianco) | 15 mA | (5-3.3)/0.015 = **113 Ω** → usa 150 Ω |

> Vol. 1 pag. 50 mostra questo calcolo step-by-step per il primo esperimento LED (citato in legge-ohm.md).

### Resistenze in serie — somma diretta

```
R_tot = R1 + R2 + R3 + ...
```

Esempio kit: due resistenze da 220 Ω in serie = 440 Ω. La corrente è uguale in tutti i componenti in serie.

### Resistenze in parallelo — formula inversa

```
1/R_tot = 1/R1 + 1/R2     →     R_tot = (R1 × R2) / (R1 + R2)
```

Esempio kit: due resistenze da 1 kΩ in parallelo = 500 Ω. La tensione è uguale su tutti i rami in parallelo.

---

## Esperimenti correlati

- **Vol. 1 pag. 27** — Primo LED con 9 V: applicazione diretta V = R × I per calcolare la resistenza
- **Vol. 1 pag. 45** — Teoria Legge di Ohm ("formula madre di tutto il corso") — da legge-ohm.md
- **Vol. 2 pag. 8** — Partitore di tensione: due resistenze in serie, tensione si divide proporzionalmente a R
- Capitoli potenziometro: leggere V variabile con analogRead() + formula partitore

---

## Errori comuni

1. **Dimenticare la caduta di tensione sul LED (V_f)** — Si calcola `R = V_alim / I` invece di `R = (V_alim - V_f) / I`. Il LED riceve troppa corrente e si brucia in pochi secondi. Sottraete sempre V_f (circa 2 V per LED rosso/giallo, 3.3 V per blu/bianco).

2. **Usare V in millivolt o I in milliampere nella formula grezza** — La Legge di Ohm vuole unità SI: V in Volt, I in Ampere, R in Ohm. 20 mA = 0.020 A. Convertite prima, poi calcolate.

3. **Assumere che più resistenza = più sicuro sempre** — Vero per proteggere il LED, ma troppa resistenza spegne il circuito. Con 100 kΩ in serie a un LED con 5 V, corrente = 0.05 mA — il LED non si vede. Sicurezza ≠ resistenza massima.

4. **Non controllare la potenza dissipata** — Con valori bassi di R e tensioni alte, P = I²×R può superare ¼ W del resistore. Il resistore diventa caldo, cambia valore, o brucia silenziosamente senza accorgersene subito.

5. **Misurare R con il multimetro mentre il circuito è alimentato** — Il multimetro misura resistenza iniettando la propria corrente. Con il circuito acceso misura valori assurdi. Spegnete sempre prima di misurare R.

---

## Domande tipiche degli studenti

**"Se aggiungo più resistenze in serie, la corrente scende — ma la tensione totale è sempre quella della batteria?"**
Sì! La batteria mantiene la sua tensione; quella tensione si "distribuisce" tra le resistenze proporzionalmente ai loro valori (V1 = I×R1, V2 = I×R2). La corrente invece è uguale in ogni punto del circuito in serie.

**"Due resistenze in parallelo sono più "resistenti" o meno?"**
Meno! In parallelo aprono due strade alla corrente — come due corsie sull'autostrada. R_tot è sempre minore della più piccola delle due. Con due resistenze identiche da R in parallelo, il totale è R/2.

**"Perché il resistore si scalda? Dove va l'energia?"**
Si trasforma in calore per attrito tra gli elettroni e gli atomi del materiale resistivo. È lo stesso principio di una stufa elettrica, solo su scala minuscola. Più alta P = V×I, più calore prodotto al secondo.

**"Come faccio a sapere se una resistenza si è bruciata?"**
Con il multimetro in modalità Ω: una resistenza bruciata misura "infinito" (OL sul display) o un valore completamente sbagliato. Visivamente può apparire annerita o odorare di bruciato.

---

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Narrativa**: «Ragazzi, la Legge di Ohm è lo strumento che vi permette di COSTRUIRE circuiti invece di solo montarli a caso. Ogni volta che scegliete una resistenza, state applicando V = R × I. Dal libro al kit fisico, dalla formula alle vostre mani — questo è il vero elettronico.»

> **Approccio didattico**: partire dal calcolo concreto (resistenza per il LED con la batteria del kit) prima di mostrare la formula astratta. Il kit fisico è la dimostrazione che la formula funziona.

> **Sicurezza**: ricordate ai ragazzi che la resistenza è il componente "guardiano" — protegge LED e Arduino da correnti eccessive. Non aver paura della formula: sbagliare il calcolo non rompe nulla finché la resistenza è presente.

> **Collegamento ai volumi**: citate Vol. 1 pag. 45 per la teoria (citato in legge-ohm.md) e Vol. 1 pag. 50 per il calcolo pratico LED. I ragazzi vedono che la formula che state usando è esattamente quella del loro libro fisico.

---

## Link L1 (raw RAG queries)

```
legge Ohm V = R × I corrente tensione resistenza
calcolo resistenza LED 9V 5V kit
potenza watt resistore ¼W
resistenze serie parallelo Arduino
partitore tensione potenziomentro
resistenza bruciata multimetro misura
```

Cercare in `src/data/rag-chunks.json` con le query sopra. Concetti collegati: → [legge-ohm.md](legge-ohm.md) · [ohm.md](ohm.md) · [resistenza.md](resistenza.md)
