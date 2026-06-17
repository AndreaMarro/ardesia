---
id: ground
type: concept
title: "Ground (Massa / GND)"
locale: it
volume_ref: 1
pagina_ref: 18
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [ground, massa, GND, riferimento, potenziale-zero, circuito, breadboard, corrente, sicurezza]
---

## Definizione

GND (Ground, in italiano **massa**) è il punto di riferimento a **0 Volt** del circuito: è il filo nero, la riga "−" della breadboard, il terminale negativo della batteria e il pin GND di Arduino. Vol. 1 — sezione introduttiva ai circuiti — lo definisce come "il polo negativo da cui parte il confronto per tutte le tensioni: ogni altra tensione si misura rispetto a lui". Senza GND non si può misurare niente, perché la tensione è sempre una differenza tra due punti — e GND è il punto fisso.

## Analogia per la classe

Ragazzi, immaginate di misurare l'altezza degli edifici di una città. Per misurare ogni palazzo dovete avere un punto fisso da cui partire: il livello del mare, che vale **zero metri** per definizione. GND è esattamente questo per il circuito elettrico: è il "livello del mare" delle tensioni. La batteria da 9V ha il polo positivo a 9 volt *rispetto a GND* e il polo negativo a 0 volt — cioè GND stesso. Il LED, la resistenza, Arduino: ognuno lavora rispetto a questo riferimento comune. Se ognuno avesse il suo "livello del mare", le misure non tornerebbero mai!

## Cosa succede fisicamente

La corrente elettrica percorre sempre un **circuito chiuso**: esce dal polo positivo (+), attraversa i componenti, e torna al polo negativo (−), cioè GND. Senza questo percorso di ritorno il circuito è aperto e niente funziona.

### Potenziale nei punti chiave del kit ELAB

| Punto del circuito            | Tensione rispetto a GND |
|-------------------------------|-------------------------|
| Polo (+) batteria 9V          | +9 V                    |
| Pin 5V di Arduino Nano        | +5 V                    |
| Pin 3.3V di Arduino Nano      | +3.3 V                  |
| Riga (−) breadboard / GND     | 0 V (per definizione)   |
| Polo (−) batteria             | 0 V (per definizione)   |

### Dove si trova GND nel kit fisico

| Componente / strumento        | Dove è GND                                            |
|-------------------------------|-------------------------------------------------------|
| Batteria 9V                   | Terminale negativo (filo **nero** del connettore)     |
| Arduino Nano                  | Pin etichettati **GND** (due pin: vicino a A7 e a D13)|
| Breadboard                    | Riga con il bordo **blu / −**                         |
| Multimetro                    | Punta **nera** (COM)                                  |
| Alimentatore da banco         | Morsetto nero / terminale (−)                         |

### Perché tutti i GND devono essere collegati insieme

Se usate la batteria *e* Arduino insieme, il GND della batteria e il GND di Arduino **devono essere uniti da un filo**, altrimenti i due "livelli del mare" non coincidono e le tensioni lette da Arduino non hanno senso.

```
Batteria (+9V) ──► [circuito] ──► GND batteria
                                       │
Arduino GND ───────────────────────────┘  ← filo di collegamento obbligatorio
```

## Esperimenti correlati

- Vol. 1 pag. 27 — Primo circuito LED ([`concepts/led.md`](led.md)): il filo nero dalla batteria alla riga − è il GND
- Vol. 1 pag. 35 — Resistenza ([`concepts/resistenza.md`](resistenza.md)): corrente che torna a GND attraverso la resistenza
- Vol. 1 pag. 45 — Legge di Ohm ([`concepts/legge-ohm.md`](legge-ohm.md)): tensione sempre misurata tra un punto e GND
- Vol. 1 — Breadboard ([`concepts/breadboard.md`](breadboard.md)): riga − = GND, va collegata prima di tutto il resto
- Vol. 2 pag. 45 — Divisore di tensione ([`concepts/divisore-tensione.md`](divisore-tensione.md)): il punto basso del divisore è GND

## Errori comuni

1. **Componente collegato ma non funziona**: il filo GND è mancante o non arriva alla riga − della breadboard. È l'errore numero uno dei principianti. Controllate sempre che la riga − sia collegata al polo − della batteria prima di qualsiasi altra cosa.

2. **Batteria + Arduino: GND non uniti**: usate Arduino con la batteria esterna ma non avete messo il filo tra il GND di Arduino e il polo − della batteria. Arduino "vede" tensioni sbagliate su tutti i pin analogici — `analogRead()` restituisce valori casuali o sempre 0.

3. **Riga + e riga − confuse sulla breadboard**: la riga con il bordo **rosso / +** è VCC, quella con il bordo **blu / −** è GND. Se le invertite, tutto il circuito è alimentato al contrario — i LED si bruciano in un secondo. Regola: rosso = positivo, blu/nero = GND.

4. **GND "flottante" sul pin analogico**: il pin analogico di Arduino legge rispetto a GND. Se il componente (es. potenziometro, LDR) non è ancorato a GND, il pin "galleggia" tra HIGH e LOW e restituisce letture rumorose o random.

5. **Pensare che GND sia "inerte" e possa toccare qualsiasi cosa**: nel kit ELAB a 9V non è pericoloso, ma la cattiva abitudine di non rispettare il GND diventa un rischio grave nei circuiti a 220V AC da adulti. Imparate subito a trattare GND con rispetto.

## Domande tipiche degli studenti

**"GND è pericoloso? Il filo nero mi fa la scossa?"**
No — nel kit ELAB la batteria è da 9V, una tensione che non attraversa la pelle umana. Il polo GND della batteria è semplicemente il punto di riferimento del circuito. La scossa si prende quando c'è una *differenza* di tensione tra due punti del corpo: toccando solo GND (e non il polo +) non succede niente. Detto questo, è buona abitudine non toccare i fili a circuito acceso: imparate la buona pratica adesso, quando le tensioni sono sicure.

**"Perché devo collegare GND? La corrente non va già da sola dal + al −?"**
La corrente va dal + al −, ma ha bisogno di un percorso fisico continuo. Il filo GND è quel percorso di ritorno. Senza di lui il circuito è aperto — come una corsia sull'autostrada che si interrompe: le macchine (elettroni) non possono tornare indietro e tutto si blocca.

**"Sulla breadboard, quale riga devo usare come GND?"**
Quella con il bordo **blu** o il simbolo **−**. Collegare un filo da quella riga al polo − (nero) della batteria è la prima cosa da fare ogni volta che iniziate un esperimento. Prima ancora di inserire qualsiasi componente.

**"Arduino ha due pin GND — quale uso?"**
Sono identici: entrambi i pin GND di Arduino Nano sono collegati allo stesso punto interno. Usate quello più comodo per il circuito che state costruendo. Spesso ne servono entrambi quando avete molti componenti da collegare a GND.

## PRINCIPIO ZERO

GND a 9V non presenta rischi elettrici per i ragazzi — la tensione del kit ELAB è ben al di sotto della soglia di percezione cutanea (~30-50V AC). Il rischio principale è **didattico**: se i ragazzi non capiscono che GND è un punto di riferimento e non "niente", faranno errori sistematici per tutto il corso.

**Cosa dire ai ragazzi** (citando il libro):
> "Prima di inserire qualsiasi componente, collegate sempre il filo nero della batteria alla riga − della breadboard. Quel filo nero è il GND — il punto zero da cui misuriamo tutto. Senza di lui il circuito non ha un riferimento e non funzionerà mai." *(Vol. 1 — introduzione ai circuiti)*

**Narrativa suggerita**:
1. Mostrare la breadboard vuota con solo il connettore batteria inserito: chiedere "dove va il filo nero?" — lasciare che i ragazzi rispondano
2. Spiegare l'analogia del livello del mare: "ogni tensione si misura rispetto a questo punto fisso"
3. Collegare prima GND, poi VCC: "sempre questo ordine — è la regola degli elettronici"
4. Mostrare cosa succede *senza* GND: inserire un LED senza il filo di ritorno — non si accende. "Il circuito è aperto: manca la strada di ritorno"
5. Completare il circuito con GND: il LED si accende. "Adesso il percorso è chiuso"
6. Convenzione colori: **rosso = +, nero = GND** — il docente può portare la batteria e far notare i colori del connettore

**Plurale inclusivo sempre**: "colleghiamo insieme", "guardiamo cosa succede se togliamo il filo nero", "quale riga è il nostro riferimento?".

**Sicurezza extra**: ricordare ai ragazzi che la **convenzione del filo nero = GND** vale anche in elettronica domestica a 230V — ma lì il GND (terra) ha una funzione di protezione reale. Imparare questa abitudine adesso, con le batterie sicure, è il modo migliore per restare al sicuro da grandi.

**Non sostituisce la lettura del volume**: le parole esatte della sezione introduttiva di Vol. 1 vanno lette ad alta voce — i ragazzi devono sentire "livello del mare" e "punto zero" dette con le stesse parole del libro che tengono in mano.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"GND"` → glossary-GND, error-breadboard, tip-alimentazione, code-analogRead
- `"massa"` o `"ground"` → glossary, capitoli-v1-introduzione, tip-circuito
- `"riga meno breadboard"` → error-breadboard-bus, tip-primo-circuito
- `"polo negativo batteria"` → capitoli-v1-cap1, tip-connessioni
- `"filo nero"` → tip-colori-fili, error-GND-mancante
- `"riferimento 0 volt"` → glossary-GND, teoria-tensione
- `"circuito chiuso"` → concepts/circuito-chiuso.md, capitoli-v1
