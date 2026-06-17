---
id: voltmetro
type: concept
title: "Voltmetro — misurare la tensione in parallelo"
locale: it
volume_ref: 1
pagina_ref: 22
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [voltmetro, tensione, misura, parallelo, multimetro, volt, strumenti, fondamenti, sicurezza]
---

## Definizione

Il voltmetro è uno strumento che misura la **differenza di potenziale** (tensione, in Volt) tra due punti di un circuito. Si collega **in parallelo** — cioè direttamente ai capi del componente da misurare, senza aprire il circuito. Vol. 1 pag. 22 lo introduce come *"il primo strumento da imparare: ti dice quanta tensione ha un punto del circuito, senza toccarlo davvero"*. La modalità voltmetro del multimetro si riconosce dalla selezione **V— (DC)** o **V~ (AC)** sul selettore rotante. Vol. 2 pag. 13 descrive il multimetro completo con le tre modalità: voltmetro, amperometro e ohmmetro.

## Analogia per la classe

Ragazzi, immaginate il voltmetro come un barometro che misura la "pressione dell'aria" tra due punti di una stanza: lo avvicinate ai due punti, legge la differenza di pressione, e non cambia nulla nell'aria. Ecco il punto chiave — il voltmetro **non spezza il filo**, si appoggia solo ai lati. Questo è il suo superpotere rispetto all'amperometro: può misurare senza interrompere il circuito, esattamente come un termometro che misura la temperatura di una pentola senza doverla aprire.

## Cosa succede fisicamente

Quando i due puntali del voltmetro toccano due punti del circuito, il voltmetro misura la **differenza di potenziale elettrico** V_A − V_B tra quei punti. Per farlo senza perturbare il circuito originale, il voltmetro ha una **resistenza interna altissima** (tipicamente 1-10 MΩ).

### Perché la resistenza interna alta è cruciale

| Resistenza interna voltmetro | Effetto sul circuito | Risultato |
|------------------------------|----------------------|-----------|
| Alta (≥ 1 MΩ) | Corrente assorbita ≈ 0 | Misura corretta, circuito non perturbato |
| Bassa (es. 100 Ω) | Assorbe molta corrente | Misura sbagliata, circuito si modifica |

Con una batteria 9V e resistenza interna 1 MΩ:
```
I_voltmetro = V / R = 9V / 1 000 000Ω = 0.000009A = 9 µA
```
Trascurabile: il circuito non "sente" il voltmetro.

### Schema collegamento

```
   +---[R 470Ω]---[LED]---+
   |                      |
  9V                     GND
   |                      |
   +---- puntale ROSSO    |
         (voltmetro)      |
   +---- puntale NERO ----+
```

Il voltmetro misura la tensione ai capi del LED senza aprire nulla — i due puntali si "appoggiano" in parallelo al componente.

### Tensioni tipiche nel kit ELAB

| Punto del circuito | Tensione attesa | Cosa si misura |
|-------------------|-----------------|----------------|
| Batteria 9V (terminali) | ~8.5-9.2V | Stato di carica batteria |
| Pin 5V Arduino → GND | 4.9-5.1V | Alimentazione logica |
| Pin 3.3V Arduino → GND | 3.2-3.4V | Riferimento ADC |
| Ai capi LED rosso acceso | 1.8-2.2V | Caduta di tensione LED |
| Ai capi resistenza 470Ω (con 20mA) | ~6.5-7V | Caduta resistenza = V_bat − V_led |
| Ai capi LED spento | ~0V | LED non attraversato da corrente |

### Calcolo verifica con legge di Ohm

Se misurate 7V ai capi di una resistenza 470Ω, potete calcolare la corrente che passa:
```
I = V / R = 7V / 470Ω ≈ 14.9 mA
```
Confrontatelo con la corrente attesa — se coincide, il circuito funziona come previsto.

### Differenza fondamentale: voltmetro vs amperometro

| Strumento | Collegamento | Resistenza interna | Apre il circuito? |
|-----------|-------------|-------------------|-------------------|
| **Voltmetro** | **Parallelo** | Alta (1-10 MΩ) | ❌ No |
| Amperometro | Serie | Bassa (~0.1-1 Ω) | ✅ Sì |

**Citazione Vol. 1 pag. 22:** *"Il voltmetro non vuole stare nel mezzo del circuito: si siede accanto, in parallelo, e legge la tensione senza disturbare niente. L'amperometro invece deve stare dentro, come un casello autostradale."*

## Esperimenti correlati

- **Verifica batteria 9V** — misurate la tensione prima di iniziare ogni esperimento: batteria scarica = circuito imprevedibile
- **v1-cap6-esp1** (Vol. 1 pag. 27) — Primo LED: misurate con voltmetro la caduta sul LED e sulla resistenza; la somma deve fare ~9V (legge di Kirchhoff maglia)
- **v2-cap3-esp5** — Divisore di tensione con potenziometro: voltmetro sul cursore centrale mostra tensione variabile 0-9V mentre ruotate
- **v3-cap7-esp2** — Misurare tensione pin Arduino: verificate con voltmetro che pin HIGH = 5V e pin LOW = 0V
- Per misurare la **corrente** invece della tensione: vedi [concepts/amperometro.md](amperometro.md)
- Per la teoria tensione/potenziale: vedi [concepts/tensione.md](tensione.md)
- Per il multimetro completo (tutte e tre le modalità): vedi [concepts/multimetro.md](multimetro.md)

## Errori comuni

1. **Collegamento in serie invece che in parallelo** — Il voltmetro ha resistenza interna altissima (1 MΩ): se lo mettete in serie blocca quasi tutta la corrente del circuito. Il LED non si accende, il voltmetro mostra quasi tutta la tensione della batteria (perché cade su di lui), il circuito sembra "rotto". Fix: collegare **sempre in parallelo** ai capi del componente da misurare — i due puntali toccano i due terminali del componente senza aprire niente.

2. **Puntali invertiti (lettura negativa)** — Se il display mostra `−7.3V` invece di `7.3V`, i puntali ROSSO (+) e NERO (−) sono scambiati. Con i multimetri digitali non è un danno, ma la lettura è invertita. Fix: scambiare i puntali. Regola: puntale ROSSO va al punto di potenziale più alto (positivo della batteria, anodo del LED), puntale NERO al punto più basso (GND).

3. **Fondo scala sbagliato (range troppo basso)** — Se il selettore è su `2V` e il circuito ha 9V, il display mostra `OL` (overload) o `1.` senza numero. Il multimetro è protetto, ma la lettura è inutile. Fix: partire sempre dal range più alto (20V per circuiti con batteria 9V) e scendere al range più basso per leggere con più precisione.

4. **Misurare tensione con puntali in modalità corrente (mA/A)** — Se il selettore è su `mA` ma i puntali sono collegati in parallelo come un voltmetro, si crea un **cortocircuito a bassa resistenza** — può bruciare il fusibile del multimetro o danneggiare il circuito. Fix: verificare sempre che il selettore sia su `V` prima di collegare i puntali, e che il cavo rosso sia nel morsetto `VΩmA` (non nel morsetto `10A`).

5. **Misurare tensione AC con selezione DC (o viceversa)** — `V—` (DC) misura tensione continua (batterie, Arduino). `V~` (AC) misura tensione alternata (rete elettrica — NON usare nel kit ELAB). Se usate `V~` su un circuito DC, leggete un valore strano o zero. Fix: nel kit ELAB usare **sempre V— (DC)**; la modalità V~ non si usa mai sui nostri circuiti.

## Domande tipiche degli studenti

**"Perché il voltmetro si collega in parallelo e non in serie come l'amperometro?"**
Il voltmetro misura la *differenza di pressione* tra due punti — esattamente come un manometro che si appoggia ai due lati di un tubo senza aprirlo. Se lo metteste in serie, tutta la corrente dovrebbe passare attraverso la sua resistenza altissima (1 MΩ): il circuito si bloccherebbe e la misura sarebbe inutile. L'amperometro invece deve stare in serie perché misura *quanta corrente scorre* — come un contatore dell'acqua che deve stare dentro il tubo per contare tutto quello che passa.

**"Cosa succede se la batteria segna 8.2V invece di 9V — è scarica?"**
Una batteria 9V nuova misura tipicamente 9.0-9.2V a riposo. Sotto carico (con un circuito collegato) scende a 8.5-8.8V — è normale. Sotto 7.5V la batteria è quasi scarica e potrebbe non far funzionare bene Arduino. Sotto 6V sostituitela. Quindi 8.2V è borderline: funziona ancora, ma tenetene un'altra di riserva per la prossima sessione.

**"Posso usare il voltmetro per verificare se un filo è rotto?"**
Sì, è un trucco utile! Collegare i puntali ai due estremi del filo sospetto: se il filo è integro, misurate ~0V (nessuna differenza di potenziale lungo il filo). Se il filo è rotto (circuito aperto), misurate la tensione della sorgente (es. 9V) — significa che tutta la tensione "cade" sul punto rotto. Questa tecnica si chiama *ricerca del circuito aperto con voltmetro* ed è usata dai tecnici professionisti.

**"Quante misure posso fare con lo stesso fondo scala (es. 20V)?"**
Tutte quelle che volete, purché la tensione da misurare non superi il fondo scala. Con il fondo scala 20V potete misurare qualsiasi tensione da 0 a 20V: batteria 9V, pin 5V Arduino, caduta su LED (2V), caduta su resistenza (6.5V) — tutto nello stesso fondo scala senza cambiare niente. Cambiate range (es. passate a 2V) solo quando volete più cifre decimali di precisione su misure basse, come la caduta precisa di 1.95V su un LED.

## PRINCIPIO ZERO

**Per il docente — guida silenziosa:**

📖 **Citate le parole del Vol. 1 pag. 22:** *"Il voltmetro non vuole stare nel mezzo del circuito: si siede accanto, in parallelo, e legge la tensione senza disturbare niente. L'amperometro invece deve stare dentro, come un casello autostradale."*

**Cosa dire ai ragazzi:**
> "Ragazzi, adesso abbiamo uno strumento che ci permette di 'vedere' la tensione in qualsiasi punto del circuito — senza smontare niente. I puntali si appoggiano ai capi del componente e il display ci dice quanti Volt ci sono lì. È come avere degli occhiali a raggi X per il circuito. Proviamo insieme: prima misuriamo la batteria, poi la caduta sul LED, poi sulla resistenza. Alla fine sommate i tre numeri — cosa notate?"

**Sicurezza:**
- Il kit ELAB lavora a 9V DC — tensioni sicure per i ragazzi; nessun rischio elettrico
- Non usare mai la modalità `V~` (AC) nel kit: la rete elettrica a 230V è **letale** e non fa parte delle attività
- Verificare sempre che il selettore sia su `V` prima di collegare i puntali; se il selettore è su `mA` o `A` e si collega in parallelo, si crea un cortocircuito che può bruciare il fusibile interno del multimetro
- Il fusibile interno del multimetro protegge lo strumento ma non il circuito — se i puntali scintillano al contatto, controllare immediatamente che il selettore sia nella posizione corretta
- Puntali con le dita sul metal tip: normale sul kit a 9V, ma abituate i ragazzi a reggere i puntali dal manico isolato (buona pratica per il futuro)

**Narrativa per la classe — progressione 6 step:**
1. *Il problema concreto*: "Come facciamo a sapere se una batteria è ancora carica? O se il LED ha davvero 2V ai suoi capi?" Fate notare che finora usavano solo "si accende / non si accende" come risposta — adesso vogliamo numeri.
2. *Presentate lo strumento*: mostrate il multimetro sul selettore `V— 20V`. "Questo è il voltmetro. È come un termometro ma per la tensione elettrica. Non apre niente, si appoggia solo ai lati."
3. *Prima misura — la batteria*: puntale ROSSO sul + della batteria, puntale NERO sul −. Leggete insieme il valore. "Quanti Volt? Bene — la batteria è carica o scarica?"
4. *Seconda misura — il LED acceso*: appoggiate i puntali ai capi del LED nel circuito già montato. "Vedete? Non abbiamo smontato niente. Il circuito funziona ancora." Leggete ~2V. "Questa è la caduta di tensione del LED."
5. *Terza misura — la resistenza*: appoggiate i puntali ai capi della resistenza 470Ω. Leggete ~7V. "E se sommassimo LED + resistenza?" → 2 + 7 = 9V. Momento 'wow': corrisponde alla batteria. "Questa è la legge di Kirchhoff — la tensione totale si divide tra i componenti."
6. *Sfida*: "Riuscite a trovare il punto del circuito con tensione zero? E quello con tensione massima?" → introduce il concetto di GND come riferimento e di potenziale relativo.

## Link L1 (raw RAG queries)

Query per `src/data/rag-chunks.json`:
- `"voltmetro parallelo tensione misura puntali"` — bookText Vol.1 pag.22 + tip collegamento parallelo
- `"multimetro V DC selettore tensione fondo scala"` — tip-12 uso pratico multimetro + modalità DC/AC
- `"caduta tensione LED resistenza legge Kirchhoff maglia"` — bookContext misura sperimentale + verifica V=IR
- `"batteria 9V tensione scarica sotto carico Arduino"` — errori + diagnostica alimentazione kit
- `"voltmetro amperometro differenza parallelo serie resistenza interna"` — confronto strumenti + perché parallelo
- `"circuito aperto voltmetro tensione massima filo rotto diagnostica"` — tecnica ricerca guasto con voltmetro
