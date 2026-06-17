---
id: amperometro
type: concept
title: "Amperometro — Misurare la corrente nel circuito"
locale: it
volume_ref: 1
pagina_ref: 25
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [amperometro, corrente, multimetro, misura, serie, mA, ampere, strumenti, fondamenti]
---

## Definizione

L'amperometro è la funzione del multimetro che misura la corrente elettrica. Vol. 1 pag. 25 lo introduce così: "Questa è forse la misurazione più delicata, ma anche la più affascinante perché è in grado di dirci per quanto tempo possono funzionare i nostri circuiti." La corrente si misura in **Ampere (A)** — per i circuiti del kit si usano i **milliampere (mA)**, dove 1 A = 1000 mA.

## Analogia per la classe

Ragazzi, immaginate di stare sul marciapiede a contare le macchine che passano su una strada a senso unico. Per contarle davvero, dovete entrare DENTRO la strada e diventare voi stessi un casello autostradale: ogni macchina passa attraverso di voi. L'amperometro funziona esattamente così — va inserito DENTRO il circuito, "in fila" con gli altri componenti, per contare gli elettroni che scorrono. Se invece lo mettete sul bordo (in parallelo, come se apriste un cancello a lato), le macchine ci entrano tutte insieme e il casello si rompe.

## Cosa succede fisicamente

La corrente è il flusso di elettroni che scorre nel circuito. Per misurarla, l'amperometro deve diventare esso stesso parte del percorso degli elettroni — questo si chiama **collegamento in serie**.

**Perché in serie e non in parallelo?**

Il voltmetro ha una resistenza interna altissima (MΩ) — si mette in parallelo e quasi nessun elettrone ci passa. L'amperometro ha resistenza interna vicinissima a zero — se lo mettete in parallelo, tutta la corrente ci passa dentro all'improvviso: è come un cortocircuito attraverso lo strumento.

| Strumento      | Resistenza interna | Collegamento | Cosa misura         |
|----------------|--------------------|--------------|---------------------|
| Voltmetro      | Molto alta (MΩ)   | Parallelo    | Tensione ai capi    |
| Amperometro    | Quasi zero (mΩ)   | Serie        | Corrente nel ramo   |
| Ohmmetro       | Variabile          | Su circuito spento | Resistenza    |

**Come si collega in pratica:**
1. Si **apre** il circuito in un punto (si stacca un filo)
2. Si **inserisce** il multimetro in quel punto (diventa un pezzo del filo)
3. Vol. 1 pag. 28: "Il multimetro deve diventare un pezzo del circuito. In buona sostanza si comporta da cavetto speciale: mette in comunicazione due punti e inoltre ci restituisce il valore di corrente."

**Morsetto corretto nel multimetro del kit:**

| Morsetto | Colore | Quando usarlo |
|----------|--------|---------------|
| COM      | Nero   | Sempre (riferimento) |
| VΩmA     | Rosso  | Per correnti < 200 mA (tutti gli esperimenti ELAB) |
| 10A      | Rosso  | Solo per correnti fino a 10 A — **MAI usato nel kit** |

**Correnti tipiche nel kit ELAB:**

| Componente                   | Corrente tipica    |
|------------------------------|--------------------|
| LED rosso standard           | 10–20 mA           |
| LED con 470 Ω e batteria 9 V | ~15 mA             |
| LED con 220 Ω e Arduino 5 V  | ~12 mA             |
| Arduino Nano (solo acceso)   | ~25 mA             |
| Servo motor a vuoto          | 50–100 mA          |
| Motore DC in stallo          | 200–500 mA         |

**Relazione con la Legge di Ohm:**
```
I = V / R
```
Esempio: con batteria 9 V e resistore 470 Ω:
```
I = 9 / 470 ≈ 0.019 A = 19 mA
```
L'amperometro deve confermare ~19 mA — se legge molto meno o molto di più, c'è un problema nel circuito.

## Esperimenti correlati

- **Vol. 1 pag. 25** — Prima misura di corrente: circuito resistore + batteria 9 V
- **Vol. 1 pag. 28** — Inserire il multimetro in serie, leggere mA, confrontare con I = V/R
- **Vol. 2 pag. 28** — Misura di corrente nel circuito LED + resistore (`v2-cap3-esp4`)
- **Vol. 1 pag. 45** — Verifica sperimentale della Legge di Ohm con voltmetro + amperometro

## Errori comuni

1. **Collegare l'amperometro in parallelo invece di serie** — il multimetro ha resistenza quasi nulla, crea un cortocircuito su se stesso. Risultato: il fusibile interno salta, lo strumento smette di misurare corrente. Soluzione: aprire il circuito e inserire il multimetro in serie.

2. **Usare il morsetto 10A invece di VΩmA** — il morsetto 10A ha scala diversa, con correnti di pochi mA il display mostra 0.00. Non è rotto: la sensibilità è troppo bassa per il valore piccolo. Soluzione: spostare il cavo rosso su VΩmA.

3. **Non aprire il circuito prima di inserire l'amperometro** — si tenta di fare la misura posizionando le sonde come con il voltmetro, ottenendo letture assurde. Ricorda: per la corrente bisogna sempre staccare un filo e inserire il multimetro al suo posto.

4. **Invertire i puntali (rosso nel COM e nero nel VΩmA)** — la lettura compare con il segno meno (corrente "negativa"). Non è pericoloso, ma confonde. Basta invertire i cavi per avere il valore positivo corretto.

5. **Confondere A con mA nella lettura** — il display potrebbe mostrare 0.015 A che alcuni leggono come "15 ampere". In realtà sono 15 mA = 0.015 A, valore normalissimo per un LED. Attenzione alla virgola e all'unità visualizzata sul display.

## Domande tipiche degli studenti

**"Perché non posso misurare la corrente come la tensione, mettendo le sonde ai due capi?"**
Perché il voltmetro ha resistenza altissima (non disturba il circuito), mentre l'amperometro ha resistenza quasi zero. Se lo mettete in parallelo a un componente, create un percorso a resistenza zero: tutta la corrente del circuito ci passa dentro, il fusibile del multimetro salta. La tensione "si misura da fuori", la corrente "si misura da dentro".

**"Se devo aprire il circuito per inserire l'amperometro, non si spegne tutto?"**
Sì, per un attimo sì! Aprite il circuito in un punto, collegate lì il multimetro, e il circuito si richiude attraverso lo strumento. Gli elettroni ora passano dentro all'amperometro che li conta mentre scorrono. Il LED si riaccende e voi leggete quanta corrente lo attraversa.

**"Il multimetro si può rompere se sbaglio il collegamento?"**
Sì, ma non è un dramma: dentro c'è un **fusibile** (un piccolo filo che si brucia apposta per proteggere lo strumento). Se collegate l'amperometro in parallelo su un circuito con molta corrente, il fusibile salta. Non si ripara da soli — lo riferite al docente, che lo sostituisce. Meglio un fusibile di €1 che un multimetro di €20.

**"Come so se la corrente che misuro è troppa per un componente?"**
Regole del kit: i **LED** reggono al massimo 25–30 mA (oltre si bruciano lentamente); i **pin di Arduino** possono erogare al massimo 40 mA (ma 20 mA è il valore sicuro). Se l'amperometro mostra valori alti, controllate la resistenza in serie — probabilmente è troppo bassa o manca.

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** La misura di corrente è il momento in cui i ragazzi capiscono che l'elettricità non è solo "c'è o non c'è" — ha una quantità, un flusso misurabile. È anche il primo momento in cui uno strumento diventa parte del circuito, non più solo uno spettatore esterno. È un cambio di prospettiva importante.

**Cosa fare con i ragazzi:**
- Prima di collegare: chiedete "Secondo voi, come pensiamo che si misuri la corrente? Come il voltmetro, in parallelo?" — lasciate che facciano l'ipotesi sbagliata, poi mostrate perché non funziona
- Fate aprire fisicamente il circuito e inserire il multimetro in serie: il gesto manuale di "aprire e inserire" rimane in memoria meglio di qualsiasi spiegazione
- Mostrate sul display i ~15 mA del LED e fate notare che è molto meno di 1 A — i ragazzi spesso pensano che ci voglia "tanta corrente" per accendere qualcosa
- Citate Vol. 1 pag. 28: "Il multimetro deve diventare un pezzo del circuito"
- Fate confrontare la lettura misurata con il calcolo I = V/R — se corrispondono, la Legge di Ohm è verificata con i propri occhi

**Sicurezza:**
- **Non collegare mai l'amperometro in parallelo** su una batteria o su un alimentatore: si crea un cortocircuito attraverso lo strumento, il fusibile salta e in casi estremi il cavo può scaldarsi
- Il morsetto **10A NON va usato** negli esperimenti del kit — la corrente massima con batteria 9V e resistori da almeno 100Ω è sempre inferiore a 100 mA, quindi si sta sempre nel range VΩmA
- Se il display mostra valori molto alti (>100 mA) con circuiti LED standard, spegnete subito e controllate se manca la resistenza di protezione

**Cosa NON fare:**
- Non saltate la fase di "aprire il circuito e reinserire" con scorciatoie — la comprensione del collegamento in serie si costruisce proprio in quel gesto fisico
- Non dite "è uguale al voltmetro, metti solo le sonde" — la differenza serie/parallelo è fondamentale per tutti i capitoli successivi (transistor, MOSFET, Arduino pin)

**Cosa dire ai ragazzi** (citazione diretta Vol. 1):
> "Questa è forse la misurazione più delicata, ma anche la più affascinante perché è in grado di dirci per quanto tempo possono funzionare i nostri circuiti." — Vol. 1 pag. 25

## Link L1 (raw RAG queries)

Frasi di ricerca per recuperare chunk L1 correlati da `src/data/rag-chunks.json`:

- `"amperometro misurare corrente multimetro"`
- `"misurare corrente in serie circuito"`
- `"MISURIAMO LA CORRENTE AMPERE Vol.1"`
- `"multimetro diventa pezzo del circuito"`
- `"morsetto VΩmA milliampere"`
- `"corrente LED mA resistore"`
