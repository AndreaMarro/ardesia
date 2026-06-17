---
id: ground-massa
type: concept
title: "Ground / Massa (GND) — il punto di riferimento a 0 Volt"
locale: it
volume_ref: 1
pagina_ref: 18
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [ground, massa, GND, riferimento, potenziale-zero, breadboard, arduino, fondamenti, circuito, sicurezza]
---

## Definizione

GND (dall'inglese *Ground*, tradotto "massa") è il **punto di riferimento a 0 Volt** in un circuito elettrico: tutte le tensioni si misurano rispetto a lui. Vol. 1 pag. 18 lo introduce come *"il pavimento del circuito — tutto parte da lì, tutto torna lì"*. Nel kit ELAB la massa corrisponde al **polo negativo (−) della batteria 9V**, alla **riga blu/nera della breadboard** e ai **pin GND di Arduino Nano**. Senza una connessione di GND il circuito non si chiude: la corrente non scorre, i componenti non si accendono.

## Analogia per la classe

Ragazzi, immaginate di misurare l'altezza degli edifici di una città. Per farlo, tutti usano lo stesso punto zero: il livello del mare. Non importa da che parte della città siete — il riferimento è sempre lo stesso. La **massa elettrica funziona esattamente così**: è il "livello del mare" del circuito. La batteria da 9V ha 9V sopra questo pavimento, il pin 5V di Arduino è 5V sopra, il LED si accende perché tra anodo e catodo c'è una differenza di quota. Se non avessimo un punto zero condiviso, non potremmo confrontare nessuna tensione — sarebbe come misurare l'altitudine ognuno con un punto zero diverso.

## Cosa succede fisicamente

In un circuito a corrente continua (DC), la corrente scorre dal polo **+** della batteria attraverso i componenti e torna al polo **−** — che per convenzione chiamiamo GND = 0 V.

### Perché GND è una convenzione, non una legge di natura

| Termine | Significato pratico nel kit ELAB | Sinonimo |
|---------|----------------------------------|---------|
| GND | Polo − batteria 9V = 0 V di riferimento | Massa, terra, comune |
| 9V | Polo + batteria → 9 V sopra GND | Alimentazione |
| 5V | Pin 5V Arduino → 5 V sopra GND | Uscita regolata Arduino |
| 3.3V | Pin 3.3V Arduino → 3.3 V sopra GND | Uscita regolata bassa |
| V_GND | Sempre 0 V per definizione | — |

La formula di riferimento è semplicissima:

```
V_componente = V_nodo_A − V_nodo_B

Se V_nodo_B = GND = 0V  →  V_componente = V_nodo_A
```

Esempio: il LED ha il catodo (−) collegato a GND (0V) e l'anodo (+) a 9V. Tensione ai capi del LED = 9V − 0V = 9V (troppo alta senza resistenza → LED brucia). Con resistenza 470Ω in serie, parte della tensione cade sulla resistenza → LED ai capi: ~2V.

### Pin GND su Arduino Nano

Arduino Nano ha **tre pin GND**, tutti internamente collegati:

| Pin fisico | Posizione | Note |
|------------|-----------|------|
| GND (pin 4) | Lato destro, vicino D2 | Il più usato in esperimenti Vol.1 |
| GND (pin 14) | Lato sinistro, vicino AREF | Utile per esperimenti ADC Vol.3 |
| GND (pin 30) | Connettore USB (interno) | Non accessibile su breadboard |

**Regola pratica**: potete usare qualsiasi pin GND — sono tutti equivalenti. Quando il manuale dice "collega a GND" può significare qualsiasi dei tre.

### La riga blu/nera della breadboard = GND rail

```
 Riga ROSSA (+)  ─────────────────────── 9V (positivo batteria)
 Riga BLU  (−)  ─────────────────────── GND (negativo batteria)

 Colonne centrali:
 a b c d e   f g h i j    ← punti sperimentali, non GND finché non li collegate
```

La **riga blu (−)** è già predisposta come GND rail, ma diventa GND **solo dopo** aver collegato fisicamente un filo dal polo − della batteria (o dal pin GND di Arduino) a quella riga.

### Circuito chiuso: GND completa il percorso

```
 Batteria 9V (+) ─── [R 470Ω] ─── [LED] ─── GND ─── Batteria 9V (−)
                                                 ↑
                                    senza questo filo: I = 0A
```

Togliere il filo di GND equivale a tagliare il percorso degli elettroni: il circuito si apre e la corrente è zero. Il LED non si accende — non perché sia rotto, ma perché la corrente non ha dove "tornare".

### GND condiviso tra più sorgenti (regola critica)

Quando usate sia la **batteria 9V** sia **Arduino** nello stesso circuito (es. motore DC pilotato da Arduino), i GND delle due sorgenti devono essere collegati insieme:

```
 Batteria 9V (−) ──┐
                   ├── GND comune su breadboard ← ← ← tutti i componenti si riferiscono a questo
 Arduino GND    ──┘
```

Senza GND comune, il segnale digitale di Arduino non ha un riferimento condiviso con il motore: il componente si comporta in modo imprevedibile.

## Esperimenti correlati

- **Primo circuito LED** (Vol. 1 pag. 27) — il filo dal catodo del LED alla riga − della breadboard è il vostro primo collegamento GND
- **Blink Arduino** (Vol. 3 pag. 47) — il pin GND di Arduino Nano si collega alla riga − della breadboard; da lì il catodo del LED
- **v2-cap3-esp5** — divisore di tensione con potenziometro: il pin 1 del potenziometro va a GND, il pin 3 a 5V; il cursore (pin 2) misura una tensione 0-5V rispetto al GND comune
- **Motore DC con transistor** (Vol. 2 pag. 75) — GND comune tra batteria e Arduino è obbligatorio: senza di esso il segnale base del transistor non funziona
- Concetti collegati: [concepts/tensione.md](tensione.md) · [concepts/corrente.md](corrente.md) · [concepts/circuito-chiuso.md](circuito-chiuso.md) · [concepts/voltmetro.md](voltmetro.md)

## Errori comuni

1. **Manca il filo GND tra Arduino e breadboard** — è l'errore numero uno dei principianti. Il programma sembra caricato correttamente, il LED non si accende, sembrano rotti. Causa: Arduino ha il suo GND interno ma non lo ha comunicato alla breadboard — i potenziali non sono condivisi. Fix: aggiungere **un solo filo** dal pin GND di Arduino Nano alla riga blu (−) della breadboard. Regola mnemonica: "ogni volta che usi Arduino su una breadboard, il primo filo che metti è sempre GND."

2. **Riga blu (−) non collegata alla batteria** — la riga blu della breadboard non diventa magicamente GND: deve essere connessa fisicamente al polo − della batteria (o al pin GND di Arduino). Se dimenticate questo filo, la riga blu è flottante (potenziale sconosciuto) e i componenti si comportano in modo casuale. Fix: verificare sempre che ci sia un filo che va dal polo − della batteria OPPURE dal GND di Arduino alla riga blu.

3. **Due sorgenti di alimentazione senza GND comune** — usate la batteria 9V per il motore e Arduino per la logica, ma non collegate i loro GND. Il segnale digitale (HIGH = 5V rispetto al GND di Arduino) non è interpretato correttamente dal circuito motore (che ha un GND diverso). Fix: collegare sempre polo − batteria e pin GND Arduino alla stessa riga blu della breadboard.

4. **Confondere il pin GND con il pin 3.3V o con un pin digitale** — Arduino Nano ha pin GND, 3.3V, 5V e pin digitali D0–D13 molto vicini tra loro. Se collegate per errore un componente al pin 3.3V invece che a GND, il componente riceve una tensione invece di zero volt — spesso brucia o funziona male senza motivo apparente. Fix: seguire sempre il pinout stampato sul Nano o usare il voltmetro per verificare che il pin misuri 0V rispetto alla riga blu prima di collegare qualcosa.

5. **Breadboard grande con due sezioni (−) non collegate tra loro** — le breadboard da 830 punti hanno spesso la riga blu interrotta a metà: la metà superiore e quella inferiore sono **due rotaie distinte**. Se collegate il GND solo in un punto e usate componenti nell'altra metà, quella parte è flottante. Fix: aggiungere un filo di ponticello che collega la riga blu in alto con quella in basso (stesso per la riga rossa).

## Domande tipiche degli studenti

**"La batteria ha + e −, Arduino ha GND — è la stessa cosa?"**
Sì, in pratica sono la stessa cosa nel kit ELAB. Il polo − della batteria e il pin GND di Arduino devono essere collegati insieme sulla breadboard: entrambi diventano il vostro "0 V" di riferimento. La differenza è solo nel nome: gli ingegneri elettronici usano "GND" per indicare il riferimento comune in un sistema digitale (come Arduino), mentre nelle batterie si parla di polo positivo e negativo. Ma il concetto fisico è lo stesso: è il punto da cui si misurano tutte le tensioni.

**"Se tolgo il filo di GND, cosa succede esattamente?"**
La corrente non scorre più — il circuito si apre. Gli elettroni hanno bisogno di un percorso chiuso per muoversi: partono dal + della batteria, attraversano i componenti, e devono tornare al − (GND). Se tagliate quel ritorno, è come togliere il binario di ritorno di un trenino: il treno parte ma non arriva da nessuna parte. Risultato pratico: LED spento, motore fermo, zero corrente — anche se la batteria è carica. Potete verificarlo con il voltmetro: appoggiate i puntali ai capi del LED — con GND scollegato leggerete ~9V (tutta la tensione "cade" sull'interruzione aperta) invece di ~2V.

**"Perché ci sono tre pin GND su Arduino Nano? Quale uso?"**
Tutti e tre sono identici: internamente Arduino li collega allo stesso nodo. Esistono più pin GND per comodità — così potete collegare componenti su entrambi i lati della breadboard senza dover allungare fili lunghi da un pin all'altro. Usate quello più vicino al componente che state collegando. Nei kit ELAB, gli esperimenti usano tipicamente il pin GND accanto al pin D2 (lato destro del Nano), perché è quello più comodo per la breadboard standard da 830 punti.

**"La riga blu della breadboard è sempre GND o posso usarla per altro?"**
Per convenzione la riga blu/nera è riservata a GND e la rossa a +. Tecnicamente potreste usarla per altro, ma non fatelo mai — confonde tutti, è fonte di errori, e i libri di testo (incluso Vol. 1) usano sempre questa convenzione. In laboratorio, se vedete la riga blu usata per qualcosa che non sia GND, è quasi certamente un errore di cablaggio da correggere.

## PRINCIPIO ZERO

**Per il docente — guida silenziosa:**

📖 **Citate le parole del Vol. 1 pag. 18:** *"il pavimento del circuito — tutto parte da lì, tutto torna lì."*

**Cosa dire ai ragazzi:**
> "Ragazzi, adesso aggiungiamo un concetto fondamentale: la **massa**, o GND. Pensateci come al pavimento della vostra casa — è il punto zero da cui misurate tutto. Se dite 'la finestra è a 1 metro', intendete 1 metro dal pavimento. In elettronica, quando diciamo 'questo punto ha 5 Volt', intendiamo 5 Volt sopra la massa. Ogni circuito ha bisogno di questo punto zero condiviso. Senza di lui, è come avere una stanza senza pavimento — tutto galleggia e non si capisce niente. Adesso prendete un filo nero e colleghiamo il polo − della batteria alla riga blu della breadboard. Questo filo è il vostro pavimento."

**Sicurezza:**
- Il kit ELAB lavora a 9V DC — nessun rischio elettrico per i ragazzi; possono maneggiare tutti i fili liberamente
- La massa nel kit è il polo − della batteria, **non** la terra fisica dell'impianto elettrico domestico (che è letale a 230V e non fa parte delle attività)
- Se un ragazzo chiede "ma la terra elettrica di casa è uguale?" — rispondere con chiarezza: "No, quella è la rete elettrica a 230V, non la tocchiamo mai. Il nostro GND è solo il − della batteria a 9V: sicuro al 100%."
- Non è necessario nessun dispositivo di protezione per lavorare con il GND del kit

**Narrativa per la classe — progressione 5 step:**
1. *Il problema concreto*: accendete il circuito LED senza collegare il filo di GND. Niente. "Perché non si accende? La batteria è carica, il LED è su, la resistenza c'è..." Fate ipotizzare ai ragazzi. Poi: "Manca il percorso di ritorno." Collegate il filo GND. Si accende. Questo è il momento 'wow'.
2. *La metafora del pavimento*: "Le tensioni esistono solo come differenza rispetto a qualcosa. Quel qualcosa è GND. È il nostro pavimento comune. Senza pavimento, non puoi misurare niente."
3. *Trovate GND su Arduino*: mostrate il pinout. "Vedete questi pin scritti GND? Sono tre, tutti uguali. Quale usate? Quello più vicino — la natura odia i fili lunghi." Collegare il pin GND di Arduino alla riga blu della breadboard.
4. *Verifica con voltmetro*: puntale NERO su GND (riga blu), puntale ROSSO in giro per il circuito. "Leggete 0V sulla riga blu? Giusto, è il nostro zero. Leggete ~9V sul + della batteria? Giusto. ~5V sul pin 5V di Arduino? Giusto. Il voltmetro usa GND come riferimento — esattamente come voi usate il pavimento per misurare l'altezza."
5. *Sfida*: "Scolleghiamo il GND e misuriamo la tensione ai capi del LED con il voltmetro. Cosa leggete?" → ~9V (circuito aperto, tutta la tensione cade sull'interruzione). "Perché? Perché senza GND il circuito non si chiude." Ricollegare → LED si accende, voltmetro legge ~2V. Legge di Kirchhoff in azione.

## Link L1 (raw RAG queries)

Query per `src/data/rag-chunks.json`:
- `"GND massa riferimento zero volt circuito batteria negativo"` — bookText Vol.1 pag.18 + schema circuito chiuso + polo − batteria
- `"breadboard riga blu meno alimentazione GND collegamento"` — tip-breadboard + convenzione colore rosso/blu + rotaia −
- `"Arduino Nano pin GND tre pin identici pinout"` — pinout Nano + tip-collegamento + pin map ATmega328p
- `"GND comune due sorgenti batteria Arduino motore segnale riferimento"` — tip-multicircuito + errore classico + fix GND comune
- `"circuito aperto corrente zero filo GND mancante LED non si accende"` — diagnosi errore + voltmetro 9V su LED spento + troubleshooting
- `"terra elettrica casa GND batteria differenza sicurezza 230V"` — sicurezza + distinzione GND DC vs terra impianto domestico
