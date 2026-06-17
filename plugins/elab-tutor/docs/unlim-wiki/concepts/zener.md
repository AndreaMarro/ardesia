---
id: zener
type: concept
title: "Diodo Zener — stabilizzatore di tensione"
locale: it
volume_ref: 2
pagina_ref: 105
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [zener, diodo, stabilizzatore, tensione, breakdown, regolatore, vol2]
---

## Definizione

Il diodo zener è un diodo speciale progettato per lavorare in **conduzione inversa** stabile. Vol. 2 pag. 105 lo introduce come "diodo che fa passare corrente all'indietro a una tensione precisa, e usiamo questa proprietà per fissare un riferimento".

Mentre un diodo normale brucia se polarizzato inverso oltre il limite, lo zener entra in **breakdown controllato** a una tensione nominale (Vz) fissa: 3.3 V, 5.1 V, 9.1 V, 12 V sono valori tipici del kit ELAB.

## Analogia per la classe

Ragazzi, immaginate uno sfioratore di una diga: l'acqua sale fino a un certo livello, e poi quando supera la soglia esce dallo sfioratore mantenendo l'altezza costante. Lo zener fa lo stesso con la tensione: oltre la sua "soglia inversa" Vz, blocca ogni aumento e tiene la tensione fissa.

## Cosa succede fisicamente

Il drogaggio del semiconduttore è progettato per provocare un campo elettrico interno molto forte. A Vz, gli elettroni vengono "strappati" agli atomi (effetto Zener fino a ~5 V) o accelerati così tanto da liberarne altri (effetto valanga oltre 5 V). La tensione resta fissa, la corrente può aumentare entro il limite di potenza P = Vz × Iz.

## Schema d'uso (regolatore stabilizzatore)

```
   Vin ──[R serie]──┬──── Vout (fissa = Vz)
                    │
                  [ZENER]  (catodo verso +)
                    │
                   GND
```

La resistenza serie limita la corrente; lo zener fissa Vout a Vz indipendentemente da Vin (purché Vin > Vz + dropout R).

**Esempio Vol. 2 pag. 108:**
- Vin = 12 V batteria, voglio Vout = 5.1 V per Arduino logic
- R = (12 - 5.1) / 0.020 A = 345 Ω → uso 330 Ω commerciale
- P_zener = 5.1 × 0.020 = 0.1 W → zener da ½ W va bene

## Esperimenti correlati

- **Vol. 2 pag. 105** — Introduzione zener: collegamento inverso e misura Vz con multimetro
- **Vol. 2 pag. 108** — Stabilizzatore zener: alimentare LED da batteria 9 V con tensione fissa 5.1 V
- **Vol. 2 pag. 112** — Limite di potenza: cosa succede se R serie troppo piccola (zener si surriscalda)

## Errori comuni

1. **Polarità invertita** — Lo zener funziona da regolatore SOLO con catodo (anello bianco) verso il +. Polarizzato direttamente diventa un diodo normale (Vd ≈ 0.7 V).

2. **R serie mancante** — Senza resistenza limitante, lo zener riceve tutta la corrente disponibile e si brucia in millisecondi. Vol. 2 raccomanda sempre R serie ≥ (Vin - Vz) / Imax.

3. **Confondere Vz dei modelli** — Zener 5V1 ≠ 5V6 ≠ 6V2. Gli anelli colorati sul corpo seguono lo stesso codice delle resistenze ma codificano la tensione (es. verde-marrone = 5.1 V).

4. **Sottostimare la dissipazione** — Uno zener da ¼ W a 9.1 V supporta max 27 mA. Calcolare sempre P_zener = Vz × Iz per evitare il surriscaldamento.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 2 pag. 105):
> "Il diodo zener fa passare corrente all'indietro a una tensione precisa, e usiamo questa proprietà per fissare un riferimento."

**Cosa fare:**
- Mostrate la differenza tra diodo normale (1N4148) e zener (es. BZX85C5V1) — sembrano uguali, ma lo zener ha Vz stampato sul corpo
- Fate misurare con multimetro in modalità diodo: il diodo normale legge ~0.7 V solo in un verso; lo zener legge sia diretta (~0.7 V) sia inversa (Vz)
- Chiedete: "A cosa serve mantenere una tensione fissa?" → introduce il concetto di alimentatore stabilizzato

**Sicurezza:**
- Uno zener bruciato può andare in cortocircuito e portare Vin direttamente all'uscita (pericoloso per il carico). Verificare sempre con multimetro prima di alimentare un microcontrollore.
- Vol. 2 raccomanda di usare lo zener SOLO come riferimento, non come alimentatore principale di carichi pesanti — usare regolatori dedicati (LM7805) per >100 mA.

## Link L1 (raw RAG queries)

- `"diodo zener tensione fissa"`
- `"breakdown inverso zener"`
- `"stabilizzatore zener resistenza serie"`
- `"calcolo potenza zener Vz × Iz"`
- `"BZX85 zener catodo anello bianco"`
