---
id: if-else
type: concept
title: "if / else — decisioni nel codice"
locale: it
volume_ref: 3
pagina_ref: 82
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe-opus
fix_iter44_W2: "Pagina fabbricata Vol.3 pag.102 (Vol.3 max=95) corretta a pag.82 (Vol.3 Cap.8 esp.2 v3-cap8-esp2 usa if/else con threshold analogico)."
tags: [if, else, controllo-flusso, condizioni, programmazione, logica]
---

## Definizione

`if / else` è il costrutto base di decisione in Arduino C++. Permette di eseguire blocchi di codice diversi a seconda che una condizione sia vera (`true`) o falsa (`false`). Vol.3 pag.82.

Sintassi:

```cpp
if (condizione) {
  // codice eseguito se condizione vera
} else {
  // codice eseguito se condizione falsa
}
```

## Analogia per la classe

Ragazzi, `if / else` è come la regola del bivio: SE piove, prendete l'ombrello; ALTRIMENTI uscite senza. Il programma fa la stessa cosa: legge la condizione, sceglie un cammino o l'altro. Mai entrambi.

## Operatori di confronto

| Operatore | Significato        | Esempio                |
|-----------|--------------------|------------------------|
| `==`      | uguale a           | `if (lettura == 1023)` |
| `!=`      | diverso da         | `if (stato != HIGH)`   |
| `<`       | minore di          | `if (temp < 25)`       |
| `>`       | maggiore di        | `if (luce > 500)`      |
| `<=`      | minore o uguale    | `if (count <= 10)`     |
| `>=`      | maggiore o uguale  | `if (volt >= 4.5)`     |

## Operatori logici

- `&&` AND: vere ENTRAMBE le condizioni → `if (luce > 500 && bottone == HIGH)`
- `||` OR: vera ALMENO UNA → `if (allarme == HIGH || bottone == HIGH)`
- `!` NOT: inverte → `if (!sensoreAttivo)`

## Esperimenti correlati

- Vedi Capitolo: `v3-cap6-controllo-flusso`
- Esercizio: lettura potenziometro → 3 LED accesi a soglie diverse
- Concetto: `digital-read.md` (input bottone)
- Concetto: `analog-read.md` (sensori analogici)

## Errori comuni

- Usare `=` (assegnazione) invece di `==` (confronto): `if (x = 5)` assegna 5 a x, NON confronta. Errore silenzioso.
- Dimenticare le parentesi graffe `{ }` quando il blocco ha più righe — solo la prima riga finisce nell'`if`.
- Confondere `&&` (AND logico) con `&` (AND bit-a-bit) — semantica diversa, risultato diverso.

## PRINCIPIO ZERO

Quando spiegate questo concetto alla classe:
- Parlate in plurale ("Proviamo insieme", "Decidete voi")
- Citate **Vol.3 pag.82**
- Disegnate il bivio sulla LIM prima di scrivere codice — la mente capisce prima il diagramma
- MAX 60 parole + 1 analogia concreta (bivio della strada)
- NO comandi diretti al docente — guida silenziosa per voi
