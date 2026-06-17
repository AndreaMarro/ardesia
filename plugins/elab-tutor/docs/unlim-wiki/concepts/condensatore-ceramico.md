---
id: condensatore-ceramico
type: concept
title: "Condensatore Ceramico"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-wiki-batch
tags: [condensatore, ceramico, filtro, disaccoppiamento, bypass, alta-frequenza]
---

## Definizione

*(Nota: il condensatore ceramico come tipo specifico non è trattato direttamente nei volumi ELAB 1-3. Il concetto generale di condensatore è introdotto nel Vol.2 pag.63 (`concepts/condensatore.md`). Questo articolo espande quella base con conoscenza generale — volume_ref: null, pagina_ref: null.)*

Il condensatore ceramico è il tipo di condensatore più diffuso nei circuiti elettronici: due strati di metallo separati da un materiale ceramico che funge da **dielettrico** (isolante). Quando si applica una tensione, sulle due "facce" si accumulano cariche opposte — energia immagazzinata nel campo elettrico tra i piatti. Non è polarizzato: può essere collegato in entrambe le direzioni senza danneggiarsi, a differenza del condensatore elettrolitico (vedi Vol.2 pag.63).

## Analogia per la classe

Ragazzi, immaginate due piatti da cucina sovrapposti con un foglio di carta in mezzo. Se caricate di "carica elettrica" un piatto, il foglio trattiene quella carica separata dall'altro piatto — è come una molla invisibile che accumula energia e poi la rilascia all'istante quando serve. Il condensatore ceramico fa esattamente questo, ma in un componente grande come un chicco di riso. Rispetto al condensatore elettrolitico che avete visto (Vol.2 pag.63 — il cilindretto con la striscia), questo non ha frecce o simboli di polarità: potete metterlo nel circuito in qualsiasi verso.

## Cosa succede fisicamente

**Formula base della capacità:**

```
C = ε × (A / d)
```

- `C` = capacità in Farad (F)
- `ε` = costante dielettrica del materiale ceramico
- `A` = area delle armature (piatti)
- `d` = distanza tra i piatti (spessore ceramica)

**Comportamento con la frequenza:**

| Frequenza del segnale | Reattanza Xc | Effetto pratico |
|---|---|---|
| Continua (DC, 0 Hz) | Infinita | Blocca la corrente |
| Bassa frequenza (~50 Hz) | Alta | Passa pochissima corrente |
| Alta frequenza (>10 kHz) | Bassa | Si comporta quasi come un filo |
| Radiofrequenza (>1 MHz) | Bassissima | Cortocircuita i disturbi a massa |

Formula reattanza capacitiva: `Xc = 1 / (2π × f × C)`

**Valori tipici nei kit ELAB:**

| Codice stampato | Capacità | Uso tipico |
|---|---|---|
| `104` | 100 nF (0,1 µF) | Bypass alimentazione Arduino |
| `103` | 10 nF | Filtro antidisturbi |
| `101` | 100 pF | Circuiti RF, oscillatori |
| `472` | 4,7 nF | Filtri audio |

**Come leggere il codice a 3 cifre:**
- Prime 2 cifre = valore
- 3ª cifra = numero di zeri da aggiungere (in picofarad)
- Es. `104` → 10 + 0000 pF = 100.000 pF = 100 nF = 0,1 µF

## Confronto con condensatore elettrolitico

| Caratteristica | Ceramico | Elettrolitico |
|---|---|---|
| Polarità | No (bidirezionale) | Sì (+ e − obbligatori) |
| Capacità tipica | 1 pF – 10 µF | 1 µF – 10.000 µF |
| Frequenza di lavoro | DC → GHz | DC → ~100 kHz |
| Aspetto fisico | Dischetto giallo/marrone oppure SMD | Cilindro alluminio con striscia |
| Se montato al contrario | Nessun danno | Può esplodere (gas interno) |
| Uso principale | Bypass, disaccoppiamento, filtri HF | Serbatoio energia, filtro bassa freq. |

## Uso su Arduino — disaccoppiamento alimentazione

Il condensatore ceramico da **100 nF (codice `104`)** è quasi sempre presente accanto al pin VCC di ogni chip integrato nei circuiti professionali. Quando Arduino esegue un'istruzione digitale, la corrente assorbita cambia di colpo: senza il condensatore ceramico vicino, quella variazione rapida si propaga come disturbo sui fili di alimentazione e può causare reset o letture errate dei sensori analogici.

**Schema collegamento tipico:**

```
5V ──┬──────────────── VCC chip
     │
    [104]  ← ceramico 100nF il più vicino possibile al chip
     │
GND ─┴──────────────── GND chip
```

## Esperimenti correlati

*(Nessun esperimento specifico per il condensatore ceramico nei 92 esperimenti ELAB. Concetti collegati nei volumi:)*

- **Condensatore generico** — Vol.2 pag.63, Cap. `v2-cap7` (`concepts/condensatore.md`) — base teorica e condensatore elettrolitico
- **Filtro con resistenza e condensatore (RC)** — concetto RC presente nei circuiti di debounce (`concepts/debounce.md`)
- **Alimentazione Arduino** — ogni esperimento con Arduino usa implicitamente il bypass ceramico sulla scheda
- **PWM e filtro** — `concepts/pwm.md` — convertire PWM in tensione analogica richiede un filtro RC con condensatore ceramico

## Errori comuni

1. **Leggere il codice a 3 cifre come valore diretto** — `104` NON significa 104 pF, ma 100.000 pF = 100 nF. Usare sempre la formula: prime 2 cifre + (10 elevato alla 3ª cifra) picofarad.
2. **Confonderlo con l'elettrolitico** — il ceramico NON ha polarità: montarlo "al contrario" non crea problemi. L'elettrolitico sì — se invertito si danneggia.
3. **Ignorarlo nel circuito** — sembra inutile perché il circuito "funziona anche senza", ma senza bypass ceramico vicino al chip si possono avere reset sporadici o misure ADC rumorose su Arduino.
4. **Usare un ceramico dove serve un elettrolitico** — per serbatoi di energia (es. filtro alimentatore, condensatore di carica lenta) il ceramico da 100 nF è troppo piccolo: serve un elettrolitico da 100–470 µF.
5. **Danneggiarlo meccanicamente** — il corpo ceramico è fragile: non piegare i piedini dalla radice, non pressare con forza sulla breadboard, non applicare calore prolungato con il saldatore.

## Domande tipiche degli studenti

**D: "Ma se non ha polarità, perché sulle breadboard lo mettiamo sempre in un certo verso?"**
R: Questione di abitudine e di leggibilità dello schema: in genere il piedino più lungo (se presente) va al + per uniformità con gli altri condensatori, ma elettricamente non cambia nulla.

**D: "Perché ha quel codice strano invece di scrivere direttamente il valore?"**
R: Il componente è così piccolo che non c'è spazio per scrivere "100 nF". Il codice a 3 cifre è uno standard internazionale usato da tutti i produttori.

**D: "Posso sostituire un condensatore elettrolitico da 10 µF con dieci ceramici da 1 µF?"**
R: In teoria la capacità totale in parallelo si somma e sarebbe 10 µF, ma i ceramici hanno caratteristiche diverse alle basse frequenze e la soluzione risulta più costosa e ingombrante. Per applicazioni di potenza o filtri lenti, meglio usare l'elettrolitico corretto.

**D: "Come faccio a testarlo con il multimetro?"**
R: Il multimetro in modalità resistenza mostrerà una lettura che sale velocemente verso infinito (si carica rapidamente). In modalità capacità (se il multimetro ce l'ha) mostra il valore in nF/pF. Un ceramico "rotto" mostra cortocircuito (0 Ω) o circuito aperto (non si carica affatto).

## PRINCIPIO ZERO

Quando si introduce questo concetto alla classe:

- **Parlare sempre in plurale** — "Ragazzi, oggi conosciamo il condensatore ceramico…", "Proviamo insieme a leggerlo…", "Vedete questa scritta sul componente?"
- **Sicurezza**: il condensatore ceramico NON accumula tensioni pericolose come i grandi elettrolitici. Con le tensioni dei kit ELAB (5–9 V) è completamente sicuro toccare il componente anche quando è alimentato.
- **Narrativa suggerita**: «Avete visto il condensatore grande (elettrolitico) che si carica lentamente come una mini-batteria. Questo invece — piccolo come un chicco di riso — si carica e scarica così veloce da filtrare i disturbi ad alta frequenza prima ancora che li vediate. È il "guardiano silenzioso" che protegge Arduino dai rumori elettrici.»
- **Cosa mostrare sulla LIM**: il codice `104` stampato sul componente, la lettura con il multimetro in modalità capacità, il circuito di bypass accanto ad Arduino.
- **Collegamento al libro**: questo componente è una variante del condensatore spiegato nel **Vol.2 pag.63** — la differenza è il materiale dielettrico (ceramica invece di ossido di alluminio) e l'assenza di polarità.

## Link L1 (query RAG suggerite)

```
condensatore bypass alimentazione arduino
filtro antidisturbi circuito digitale
codice condensatore ceramico 104 nF
disaccoppiamento condensatore chip integrato
condensatore non polarizzato
reattanza capacitiva alta frequenza
```
