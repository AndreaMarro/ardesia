---
id: resistenza
type: concept
title: "Resistenza (Resistore)"
locale: it
volume_ref: 1
pagina_ref: 35
created_at: 2026-04-23
updated_at: 2026-04-23
updated_by: architect
tags: [resistenza, ohm, partitore, base, passivo]
---

## Definizione

La resistenza è un componente passivo che limita il flusso di corrente elettrica. Vol. 1 pag. 35 la paragona a un "tubo stretto che frena l'acqua".

## Analogia per la classe

Ragazzi, pensate a un'autostrada con una strozzatura: più stretta è la strozzatura, meno macchine (corrente) passano. La resistenza funziona così: misurata in Ohm (Ω), dice quanto "frena" la corrente.

## Codice colori

Le resistenze hanno 4 o 5 anelli colorati che indicano il valore. Per 470Ω (Vol.1 pag.50):
```
Giallo - Viola - Marrone - Oro (4 fasce)
  4       7      x10        ±5%
```

## Valori comuni kit ELAB

| Valore   | Uso tipico                                            |
|----------|-------------------------------------------------------|
| 220Ω     | LED con 5V Arduino                                    |
| 470Ω     | LED con 9V batteria                                   |
| 1 kΩ     | Pull-up/pull-down pulsante                            |
| 10 kΩ    | LDR partitore, potenziometro                          |

## Serie e parallelo

- **Serie**: R_tot = R1 + R2
- **Parallelo**: 1/R_tot = 1/R1 + 1/R2

## Formula chiave (legge di Ohm)

```
V = R × I
```

Vedi [concepts/legge-ohm.md](legge-ohm.md) per approfondimento.

## Esperimenti correlati

- Vol.1 pag.35 — Prima resistenza (TBD link)
- Vol.1 pag.50 — Perché 470Ω con 9V
- Vol.2 pag.8 — Partitore di tensione

## Errori comuni

- Valore sbagliato per la tensione: LED brucia o spento
- Resistenza saltata: LED si rompe in secondi
- Serie vs parallelo confuso: corrente totale errata
