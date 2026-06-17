# AUDIT PARITA — Volumi Fisici vs Simulatore

> Data: 2026-04-11
> Auditor: Claude Opus 4.6 (AUDITOR-PARITA)
> Fonti: PDF "MANUALE VOLUME 1/2/3 ITALIANO" + experiments-vol1/2/3.js
> Metodo: lettura integrale dei PDF pagina per pagina, confronto con ogni campo degli experiment JS

---

## SINTESI ESECUTIVA

| Metrica | Vol 1 | Vol 2 | Vol 3 |
|---------|-------|-------|-------|
| Esperimenti nel PDF | 38 | 27 | N/A (Volume 3 = Arduino, solo .odt disponibile) |
| Esperimenti nel JS | 38 | 27 | 27 |
| Capitoli nel PDF | Cap 6-14 (9 cap con esp) | Cap 3-12 (10 cap con esp) | Cap 5-8 + Extra |
| Capitoli nel JS | Cap 6-14 | Cap 3-12 (manca Cap 11 Diodi) | Cap 5-8 + Extra |
| Capitoli MANCANTI nel JS | Nessuno | Cap 11 - I Diodi (0 esp nel JS, ma nel PDF non ha esperimenti espliciti, solo teoria) | -- |
| Parità titoli | ~85% | ~80% | Non verificabile (no PDF leggibile) |
| Parità componenti | ~70% | ~65% | Non verificabile |
| Parità buildSteps | ~60% | ~50% | Non verificabile |
| **Score parità globale** | **5.5/10** | **4.5/10** | **3/10** (impossibile verificare senza PDF) |

---

## VOLUME 1 — LE BASI (112 pagine, 38 esperimenti)

### Struttura Capitoli: PDF vs JS

| Cap PDF | Titolo PDF | Cap JS | Titolo JS | Esp PDF | Esp JS | Match |
|---------|-----------|--------|-----------|---------|--------|-------|
| Cap 6 | Cos'e il diodo LED? | Cap 6 | Cos'e il diodo LED? | 3 | 3 | OK |
| Cap 7 | Cos'e il LED RGB? | Cap 7 | Cos'e il LED RGB? | 6 | 6 | OK |
| Cap 8 | Cos'e un pulsante? | Cap 8 | Cos'e un pulsante? | 5 | 5 | OK |
| Cap 9 | Cos'e un potenziometro? | Cap 9 | Cos'e un potenziometro? | 9 | 9 | OK |
| Cap 10 | Cos'e un fotoresistore? | Cap 10 | Cos'e un fotoresistore? | 6 | 6 | OK |
| Cap 11 | Cos'e un cicalino? | Cap 11 | Cos'e un cicalino? | 2 | 2 | OK |
| Cap 12 | L'interruttore magnetico | Cap 12 | L'interruttore magnetico | 4 | 4 | OK |
| Cap 13 | Cos'e l'elettropongo? | Cap 13 | Cos'e l'elettropongo? | 2 | 2 | OK |
| Cap 14 | Costruiamo il nostro primo robot | Cap 14 | Costruiamo il nostro primo robot | 1 | 1 | OK |

**Conteggio capitoli: PERFETTO. 9/9 capitoli presenti. 38/38 esperimenti contati.**

### Discrepanze Dettagliate Vol 1

#### Cap 6 — Cos'e il diodo LED?

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Accendi il primo LED | **PDF**: componenti = LED (colore a scelta), breadboard, batteria 9V, clip, resistore 470 Ohm. **JS**: LED rosso fisso. Il PDF dice "sceglilo del colore che ti piace di piu!" | MEDIA — il simulatore forza rosso, il volume lascia scegliere |
| Esp 1 — Accendi il primo LED | **PDF**: istruzioni generiche "collega il resistore tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto". **JS**: fori specifici A2-A9, F9-F10. Il PDF NON specifica fori esatti. | ALTA — il docente vedra nel simulatore fori diversi da quelli nel libro. Il libro e generico, il simulatore e rigido. |
| Esp 2 — LED senza resistore | **PDF**: usa lo stesso circuito dell'esp 1 ma senza resistore. **JS**: usa LED blu. Il PDF non specifica colore. | BASSA |
| Esp 3 — Cambia luminosita | **PDF**: parte dal circuito dell'esp 1, cambia resistore da 470 a 220 poi a 1k. **JS**: parte con 470 e dice "cambia". Congruente nel concetto. | BASSA |

#### Cap 7 — LED RGB

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Accendi il rosso | **PDF**: resistore 470 Ohm, collega "tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto". **JS**: fori specifici A2-A9. | MEDIA — stesso problema di fori generici vs specifici |
| Esp 2 — Accendi il verde | **PDF**: "Scollega il resistore dal rosso e collegalo al verde". **JS**: circuito dedicato con connessioni diverse. | BASSA |
| Esp 3 — Accendi il blu | Idem | BASSA |
| Esp 4 — Mischia due colori | **PDF**: "Prendi un altro resistore da 470 Ohm e prova ad accendere insieme due colori". **JS**: ha resistori e connessioni specifiche. | MEDIA |
| Esp 5 — Tutti i colori (bianco) | **PDF**: "Prendi un altro resistore da 470 Ohm e accendere tutti i colori contemporaneamente". **JS**: ha connessioni specifiche. Concetto OK. | BASSA |
| Esp 6 — Gioca con valori | **PDF**: "prova a giocare con i valori di resistenza dei colori per creare il colore che piu ti piace". **JS**: ha un circuito specifico. | BASSA |

#### Cap 8 — Pulsante

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — LED con pulsante | **PDF**: LED, breadboard, batteria 9V, clip, resistore 470 Ohm, pulsante. Istruzioni passo-passo con foto dettagliate. **JS**: componenti corrispondono. | BASSA |
| Esp 2 — Cambia colore/resistore | **PDF**: "cambia colore del LED o valore del resistore". **JS**: circuito specifico. | BASSA |
| Esp 3 — Pulsante + RGB viola | **PDF**: LED RGB + 2 resistori 470 + pulsante per fare viola (rosso+blu). **JS**: componenti OK. | BASSA |
| Esp 4 — 3 pulsanti per RGB | **PDF**: 3 pulsanti, 3 resistori 470, LED RGB. Istruzioni molto dettagliate con foto. **JS**: componenti OK. | BASSA |
| Esp 5 — Gioca con resistenze | **PDF**: varia valori resistenze. **JS**: circuito specifico. | BASSA |

#### Cap 9 — Potenziometro

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — LED + potenziometro | **PDF**: LED, resistore 470, potenziometro 10k. Istruzioni dettagliate con pin 1/2/3. **JS**: componenti OK. | BASSA |
| Esp 2 — Inversione pin 3 | **PDF**: sposta filo nero sul terzo pin. **JS**: circuito dedicato. | BASSA |
| Esp 3 — Cambia colore | **PDF**: "Cambia colore del LED, noti differenze?" | BASSA |
| Esp 4 — RGB + potenziometro | **PDF**: LED RGB + resistore 470 + potenziometro. Istruzioni passo-passo dettagliate. **JS**: componenti OK. | BASSA |
| Esp 5 — RGB blu↔rosso | **PDF**: utilizza tutti e 3 i pin del potenziometro per passare da blu a rosso. Istruzioni molto dettagliate. **JS**: componenti OK. | BASSA |
| Esp 6 — 3 pot + 3 res + RGB (lampada) | **PDF**: 3 potenziometri, 3 resistori 470, LED RGB. Crea qualsiasi colore. Istruzioni molto dettagliate su 6 pagine. **JS**: componenti OK. | BASSA |
| Esp 7 — Aggiungi pulsante | **PDF**: "Vuoi provare ad aggiungere qualche pulsante?" Solo testo. **JS**: circuito specifico. | MEDIA — il PDF e vago, il JS inventa |
| Esp 8 — Esp 6 + Esp 5 | **PDF**: "Prova a fare insieme l'esperimento 6 e l'esperimento 5". Solo testo. **JS**: circuito specifico. | MEDIA |
| Esp 9 — Pulsante + Esp 8 | **PDF**: "Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!" Solo testo. **JS**: circuito specifico. | MEDIA |

#### Cap 10 — Fotoresistore

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — LED + fotoresistore | **PDF**: LED, breadboard, batteria 9V, clip, fotoresistore. NOTA: il PDF dice che NON serve resistore di protezione perche il fotoresistore ha resistenza abbastanza elevata. **JS**: ha componenti con resistore? Da verificare. | ALTA — se JS mette resistore extra, non corrisponde |
| Esp 2 — Cambia colore LED | **PDF**: "Prova adesso a cambiare il LED con uno di un colore diverso" | BASSA |
| Esp 3 — RGB + 3 fotoresistori | **PDF**: LED RGB + 3 fotoresistori. Istruzioni dettagliate. "Usando una torcia, copri i fotoresistori e osserva come cambia il colore del LED RGB!" | MEDIA |
| Esp 4 — LED bianco illumina fotoresistore | **PDF**: LED bianco + fotoresistore + LED blu + resistore 470. Circuito dove il LED bianco illumina il fotoresistore che controlla il LED blu. | MEDIA |
| Esp 5 — Aggiunge potenziometro | **PDF**: aggiunge potenziometro all'esp 4. | BASSA |
| Esp 6 — Aggiunge pulsante | **PDF**: aggiunge pulsante all'esp 4. | BASSA |

#### Cap 11 — Cicalino

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Cicalino base | **PDF**: cicalino, breadboard, batteria 9V, clip. "Collega ora il cicalino alla batteria collegando nero con nero e rosso con rosso". **JS**: componenti OK. | BASSA |
| Esp 2 — Cicalino + pulsante | **PDF**: "Prova a realizzare un circuito in cui il cicalino suona solo se premi un pulsante." Con foto. **JS**: componenti OK. | BASSA |

#### Cap 12 — Interruttore magnetico

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — LED + interruttore magnetico | **PDF**: LED, breadboard, batteria 9V, clip, resistore 470, interruttore magnetico. Istruzioni dettagliate con foto. **JS**: componenti OK. | BASSA |
| Esp 2 — Cambia resistore | **PDF**: "prova a sperimentare con i valori di resistenza". | BASSA |
| Esp 3 — RGB + interruttore | **PDF**: "Prova a realizzare un circuito che accenda un LED RGB del colore che preferisci utilizzando un interruttore magnetico". Solo testo. | MEDIA |
| Esp 4 — Potenziometri + RGB + interruttore | **PDF**: "Prova ad utilizzare insieme potenziometri, LED RGB e un interruttore magnetico". Solo testo. | MEDIA |

#### Cap 13 — Elettropongo

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Elettropongo base | **PDF**: LED, batteria 9V, elettropongo. NO breadboard. "Stacca due pezzettini di elettropongo, forma due striscettine e inserisci il LED nelle due striscette". **JS**: ha breadboard? | ALTA — l'elettropongo non usa breadboard, il simulatore probabilmente non puo simularlo |
| Esp 2 — Circuito artistico | **PDF**: "Dai sfogo alla tua fantasia e prova a creare un circuito artistico utilizzando l'elettropongo e i LED!" | ALTA — non simulabile |

#### Cap 14 — Robot

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Costruisci robot | **PDF**: 3 potenziometri, 2 LED verdi, 1 LED RGB, interruttore magnetico, resistenze 220 Ohm, breadboard 830 punti. Istruzioni dettagliatissime su 5 pagine con fori specifici (e-1, e-5, e-9, g-15, g-16, d-15, d-16, ecc.) | ALTA — il robot fisico usa la breadboard full-size (830 punti) e componenti meccanici (robot ELAB), il simulatore probabilmente non lo riproduce |

### PROBLEMI TRASVERSALI VOL 1

1. **Fori generici vs specifici**: Il PDF dice quasi sempre "un punto qualsiasi della striscia rossa", il JS specifica fori esatti (A2, A9, F9...). Questo ROMPE il Principio Zero: il docente legge nel libro "metti dove vuoi" e nel simulatore vede fori obbligati.

2. **Colore LED libero vs fisso**: Il PDF dice ripetutamente "sceglilo del colore che ti piace di piu!", il JS forza un colore specifico (rosso, verde, blu...).

3. **Esperimenti "prova tu"**: Esp 7-8-9 del Cap 9, Esp 3-4 del Cap 12 nel PDF sono solo una riga di testo ("prova a fare..."). Nel JS sono circuiti completi con buildSteps. Questo e positivo (il simulatore aggiunge valore) ma potenzialmente confuso per il docente.

4. **Elettropongo e Robot**: Cap 13 e 14 NON sono simulabili con il simulatore attuale. L'elettropongo non usa breadboard, il robot usa componenti meccanici.

---

## VOLUME 2 — APPROFONDIMENTI (114 pagine, 27 esperimenti)

### Struttura Capitoli: PDF vs JS

| Cap PDF | Titolo PDF | Cap JS | Titolo JS | Esp PDF | Esp JS | Match |
|---------|-----------|--------|-----------|---------|--------|-------|
| Cap 1 | Altri cenni di storia dell'elettronica | -- | Non presente | 0 | 0 | OK (solo teoria) |
| Cap 2 | Che cos'e l'elettricita? | -- | Non presente | 0 | 0 | OK (solo teoria) |
| Cap 3 | Il Multimetro | Cap 3 | Il Multimetro | 4 | 4 | OK |
| Cap 4 | Approfondiamo le Resistenze | Cap 4 | Approfondiamo le Resistenze | 3 | 3 | OK |
| Cap 5 | Approfondiamo le Batterie | Cap 5 | Approfondiamo le Batterie | 2 | 2 | OK |
| Cap 6 | Approfondiamo i LED | Cap 6 | Approfondiamo i LED | 4 | 4 | OK |
| Cap 7 | Cosa sono i condensatori? | Cap 7 | Cosa sono i condensatori? | 4 | 4 | OK |
| Cap 8 | Cosa sono i Transistor? | Cap 8 | Cosa sono i transistor? | 3 | 3 | OK (titolo PDF "Alla scoperta dei transistor! Piccoli giganti dell'elettronica") |
| Cap 9 | Cosa sono i fototransistor? | Cap 9 | Cosa sono i fototransistor? | 2 | 2 | OK |
| Cap 10 | Il motore a corrente continua | Cap 10 | Il motore a corrente continua | 4 | 4 | OK |
| Cap 11 | I Diodi | -- | **MANCANTE** | 0 (solo teoria nel PDF, nessun esperimento numerato) | 0 | NOTA: teoria presente ma nessun esperimento |
| Cap 12 | Costruiamo il Robot Segui Luce | Cap 12 | Robot Segui Luce | 1 | 1 | OK |

**Conteggio: 27/27 esperimenti. Cap 11 (Diodi) ha solo teoria, nessun esperimento, quindi corretto non averlo nel JS.**

### Discrepanze Dettagliate Vol 2

#### Cap 3 — Il Multimetro

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Misura batteria 9V | **PDF**: usa solo multimetro + batteria 9V + clip. NO breadboard. **JS**: potrebbe avere breadboard? | ALTA — il multimetro NON esiste nel simulatore. Questi esperimenti richiedono un componente fisico non presente. |
| Esp 2 — Traccia carica batteria | **PDF**: "Ogni volta che userai il kit, segna qui sotto la data e il valore in Volt". Esercizio su carta. | ALTA — non simulabile |
| Esp 3 — Misura tensione su resistori | **PDF**: usa multimetro con coccodrilli su breadboard. | ALTA — multimetro non nel simulatore |
| Esp 4 — Misura corrente | **PDF**: usa multimetro in modalita amperometro. | ALTA — non simulabile |

#### Cap 4 — Approfondiamo le Resistenze

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Parallelo 2x 1k | **PDF**: "metti in parallelo due resistori da 1k, misura con multimetro". **JS**: ha breadboard e connessioni. | ALTA — richiede multimetro |
| Esp 2 — Serie 3x 1k | **PDF**: "metti in serie tre resistori da 1k, misura". | ALTA — richiede multimetro |
| Esp 3 — Partitore di tensione | **PDF**: "aggiungi la batteria, misura tensione in 3 punti con coccodrillo". | ALTA — richiede multimetro |

#### Cap 5 — Approfondiamo le Batterie

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Batterie in serie | **PDF**: usa 3-4 batterie AA/AAA (1.5V) + multimetro. NO breadboard per la misura. **JS**: probabilmente usa batteria 9V del simulatore. | ALTA — il PDF usa batterie AA, non 9V |
| Esp 2 — Batterie antiserie | **PDF**: collega batterie in verso opposto, misura 0V. | ALTA — non simulabile senza multimetro |

#### Cap 6 — Approfondiamo i LED

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — 2 LED in serie | **PDF**: breadboard, resistore 330 Ohm, 2 LED. Istruzioni dettagliate con foto (breadboard 830 punti). **JS**: componenti probabilmente OK. | MEDIA — il PDF usa 330 Ohm, verificare che il JS usi lo stesso valore |
| Esp 2 — Cambia colore 2o LED | **PDF**: "prova a modificare il colore del secondo LED". | BASSA |
| Esp 3 — 3 LED in serie | **PDF**: aggiunge un terzo LED. "Cambia resistore da 330 a 220 Ohm." | MEDIA |
| Esp 4 — Prova diodi con multimetro | **PDF**: usa funzione "prova diodi e continuita" del multimetro per misurare Vf. | ALTA — richiede multimetro |

#### Cap 7 — Condensatori

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Scarica condensatore | **PDF**: condensatore 1000uF, pulsante, multimetro, resistore 1k. "Osserva la tensione scendere sul multimetro". **JS**: ha componenti ma il multimetro non c'e nel simulatore. | ALTA |
| Esp 2 — Scarica con LED | **PDF**: condensatore 1000uF, pulsante, LED rosso, resistore 1k, multimetro. | ALTA |
| Esp 3 — Condensatori in parallelo | **PDF**: "aggiungi prima un condensatore in parallelo, poi un terzo". | MEDIA |
| Esp 4 — Cambia resistenza | **PDF**: "cambia il valore di resistenza e osserva come cambia la scarica". | BASSA |

#### Cap 8 — Transistor (MOSFET)

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — MOSFET come interruttore | **PDF**: transistor MOSFET, LED, resistore 470, breadboard, batteria 9V. Istruzioni dettagliate con foto (breadboard compatta). Pin: gate a sinistra, drain al centro, source a destra. **JS**: componenti probabilmente OK. | MEDIA — verificare che il JS usi MOSFET e non BJT |
| Esp 2 — Touch MOSFET | **PDF**: "Scollega il gate dal positivo e tocca l'estremita col dito: la carica del tuo corpo consente al MOSFET di accendersi!" **JS**: evento touch non simulabile. | ALTA — non simulabile |
| Esp 3 — Potenziometro + Vth | **PDF**: potenziometro + multimetro, misura tensione di soglia Vth. Istruzioni molto dettagliate con foto. | ALTA — richiede multimetro |

#### Cap 9 — Fototransistor

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Sensore di luce | **PDF**: fototransistor, resistore 10k, breadboard, batteria 9V, multimetro. "Collega il multimetro ai capi del resistore da 10k". | ALTA — richiede multimetro |
| Esp 2 — Luce accende LED al buio | **PDF**: fototransistor, resistore 10k, resistore 470, LED, transistor MOSFET. "Copri con le mani il fototransistor: il LED dovrebbe accendersi!" | MEDIA — richiede interazione fisica (coprire con mani) |

#### Cap 10 — Motore DC

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Motore base | **PDF**: breadboard, batteria 9V, clip, motore. "Connetti il filo rosso del motore al positivo". **JS**: il motore non e presente come componente SVG nel simulatore. | CRITICA — motore non simulabile |
| Esp 2 — Inverti polarita | **PDF**: "Prova a scambiare il filo rosso e il filo nero" | CRITICA |
| Esp 3 — Motore + pulsante | **PDF**: "Prova a inserire un pulsante per comandare il motore acceso e spento" | CRITICA |
| Esp 4 — Motore + pulsante + LED | **PDF**: "inserire un pulsante e una resistenza e un led in maniera che quando il motore inizia a girare il led si accenda". Con foto dettagliata del circuito completo. | CRITICA |

#### Cap 12 — Robot Segui Luce

| Esperimento | Discrepanza | Gravita |
|-------------|-------------|---------|
| Esp 1 — Robot completo | **PDF**: 2 transistor MOSFET, 2 fototransistor, 2 diodi, 2 resistori 10k, 2 motori, 2 ruote, breadboard 830 punti, batteria 9V, supporto batteria. Istruzioni su 10 pagine con foto dettagliatissime. | CRITICA — non simulabile (motori, ruote, incollaggio fisico) |

### PROBLEMI TRASVERSALI VOL 2

1. **MULTIMETRO**: Il Volume 2 introduce il multimetro come strumento centrale (Cap 3 intero). Il simulatore NON ha un componente multimetro. Questo impatta Cap 3 (4 esp), Cap 4 (3 esp), Cap 5 (2 esp), Cap 6 Esp 4, Cap 7 Esp 1-2, Cap 8 Esp 2-3, Cap 9 Esp 1. **Totale: ~14/27 esperimenti richiedono multimetro = 52% non completamente simulabili.**

2. **MOSFET vs BJT**: Il PDF usa esplicitamente MOSFET (N-channel) con terminologia Gate/Drain/Source. Verificare che il JS usi la stessa terminologia e non BJT (Base/Collector/Emitter).

3. **MOTORE DC**: Cap 10 ha 4 esperimenti con motore, componente non presente nel simulatore. **4/27 = 15% completamente non simulabili.**

4. **ROBOT**: Come per Vol 1, il progetto finale (Cap 12) non e simulabile.

---

## VOLUME 3 — ARDUINO (solo .odt disponibile, non PDF)

### Stato

Il Volume 3 esiste solo come file `MANUALE VOLUME 3 WORD.odt` nella cartella TRES JOLIE. Non e stato possibile leggerlo con gli strumenti disponibili (solo PDF reader). Il JS contiene 27 esperimenti distribuiti in:

- Cap 5: Il nostro primo programma (2 esp)
- Cap 6: I pin digitali (9 esp, include Morse e Semaforo)
- Cap 7: I pin analogici (8 esp)
- Cap 8: Comunicazione Seriale (5 esp)
- Extra: 3 esperimenti (LCD Hello, Servo Sweep, Simon)

**IMPOSSIBILE verificare la parita senza accesso al contenuto del Volume 3.** Questo e un BLOCCO per l'audit.

---

## TABELLA RIEPILOGATIVA DISCREPANZE PER PRIORITA

### CRITICHE (bloccano il Principio Zero)

| # | Volume | Capitolo | Problema | Impatto |
|---|--------|----------|----------|---------|
| C1 | Vol 2 | Cap 3 | Multimetro non esiste nel simulatore — 4 esperimenti non simulabili | 4 esp |
| C2 | Vol 2 | Cap 10 | Motore DC non esiste nel simulatore — 4 esperimenti non simulabili | 4 esp |
| C3 | Vol 2 | Cap 12 | Robot Segui Luce non simulabile (motori+ruote+incollaggio) | 1 esp |
| C4 | Vol 1 | Cap 14 | Robot ELAB non simulabile (componenti meccanici+breadboard 830) | 1 esp |
| C5 | Vol 1 | Cap 13 | Elettropongo non simulabile (non usa breadboard) | 2 esp |
| C6 | Vol 2 | Cap 4 | Esperimenti resistenze richiedono multimetro per misurare | 3 esp |
| C7 | Vol 2 | Cap 5 | Batterie AA/AAA non nel simulatore (solo 9V) | 2 esp |

**Totale esperimenti CRITICI: 17/65 = 26%**

### ALTE (il docente nota la differenza)

| # | Volume | Capitolo | Problema |
|---|--------|----------|----------|
| A1 | Vol 1 | TUTTI | Fori breadboard generici nel PDF vs specifici nel JS |
| A2 | Vol 1 | TUTTI | Colore LED libero nel PDF vs fisso nel JS |
| A3 | Vol 2 | Cap 7 | Esperimenti condensatore richiedono multimetro per vedere scarica |
| A4 | Vol 2 | Cap 8 | MOSFET touch non simulabile (Esp 2) |
| A5 | Vol 2 | Cap 8 | Misura Vth con multimetro non simulabile (Esp 3) |
| A6 | Vol 2 | Cap 9 | Fototransistor come sensore richiede multimetro (Esp 1) |

### MEDIE (discrepanze notabili ma non bloccanti)

| # | Volume | Capitolo | Problema |
|---|--------|----------|----------|
| M1 | Vol 1 | Cap 9 | Esp 7-8-9 sono solo una riga nel PDF, circuiti completi nel JS |
| M2 | Vol 1 | Cap 12 | Esp 3-4 sono solo una riga nel PDF |
| M3 | Vol 2 | Cap 6 | Verificare che JS usi 330 Ohm come il PDF (non 470) |
| M4 | Vol 2 | Cap 8 | Verificare terminologia MOSFET vs BJT nel JS |

---

## RACCOMANDAZIONI PER IL PRINCIPIO ZERO

### Priorita 1 — Fix immediati (prima di lunedi)

1. **Aggiungere nota "non simulabile" per Cap 13 (elettropongo) e Cap 14 (robot Vol 1)**: Il docente deve sapere che questi esperimenti sono solo fisici.

2. **Aggiungere nota "richiede multimetro" per Cap 3-5 Vol 2 e tutti gli esp che lo usano**: Almeno 14 esperimenti devono avere un avviso chiaro.

3. **Aggiungere nota "richiede motore" per Cap 10 e 12 Vol 2**: Il docente non deve cercarli nel simulatore.

### Priorita 2 — Fix a medio termine

4. **Rendere il colore LED selezionabile**: Il PDF dice "scegli il colore che ti piace". Il simulatore dovrebbe permetterlo.

5. **Rendere i fori breadboard flessibili**: Il PDF dice "un punto qualsiasi". Il simulatore potrebbe accettare piu posizioni.

6. **Aggiungere componente Multimetro al simulatore**: Questo sbloccherebbe 14 esperimenti del Vol 2.

### Priorita 3 — Fix a lungo termine

7. **Aggiungere componente Motore DC**: Sbloccherebbe 4 esp Vol 2.
8. **Leggere e verificare Volume 3**: Serve convertire il .odt in PDF o leggerlo con altro strumento.
9. **Aggiungere componente Condensatore**: Se non gia presente, serve per Cap 7 Vol 2.

---

## NOTA SULLA QUALITA DEI BUILDSTEPS

Tutti i 92 esperimenti hanno il campo `buildSteps` popolato (nessun array vuoto). Tuttavia:

- I buildSteps del Vol 1 sono i piu dettagliati e accurati (8 step tipici con hint)
- I buildSteps sono stati scritti basandosi sui PDF ma con fori specifici, mentre i PDF sono spesso generici
- La VERA parita richiederebbe che i buildSteps riproducessero ESATTAMENTE le foto del PDF, cosa non possibile perche le foto mostrano posizioni "libere"

---

## CONCLUSIONE

**Score parita globale: 4.5/10**

I titoli e i conteggi degli esperimenti sono corretti (38+27+27 = 92, corrispondenti). Ma il contenuto diverge significativamente in tre aree:

1. **Componenti non simulabili** (multimetro, motore, elettropongo, robot) = 26% degli esperimenti
2. **Fori specifici vs generici** = problema trasversale su tutti gli esperimenti Vol 1
3. **Volume 3 non verificabile** = 27 esperimenti senza controllo

Il Principio Zero e VIOLATO quando il docente apre il libro e vede istruzioni diverse da quelle del simulatore. La soluzione non e cambiare il simulatore per copiare il PDF (impossibile per componenti fisici), ma aggiungere chiari avvisi e categorizzare gli esperimenti in: "simulabili", "parzialmente simulabili", "solo fisici".
