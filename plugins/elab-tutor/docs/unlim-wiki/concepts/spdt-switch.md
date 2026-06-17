---
id: spdt-switch
type: concept
title: "Interruttore SPDT — un polo, due uscite"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [spdt, interruttore, switch, polo-singolo, doppio-lancio, selezione-circuito, toggle, slide-switch]
---

## Definizione

Un **interruttore SPDT** (*Single Pole Double Throw* — un polo, doppio lancio) è un componente elettrico con **tre terminali**: un comune (**COM**), un normalmente aperto (**NO**) e un normalmente chiuso (**NC**). Ogni volta che lo spostiamo, COM si disconnette da un terminale e si connette all'altro, instradando il segnale su uno dei due percorsi alternativi.

> *Nota fonte*: concetto non presente nei volumi Omaric analizzati (Vol.1–3). Contenuto basato su knowledge generale elettronica didattica. Se i volumi trattassero gli interruttori SPDT in una futura edizione, aggiornare `volume_ref` + `pagina_ref` e aggiungere citazione verbatim.

## Analogia per la classe

Ragazzi, pensate a uno **scambio ferroviario**: il treno (la corrente) arriva sempre sullo stesso binario (COM), ma lo scambio decide se il treno va a destra (NO) o a sinistra (NC). Con un solo movimento del leva, cambiate il percorso del treno — è esattamente quello che fa l'SPDT con l'elettricità.

Un secondo modo per capirlo: immaginate un rubinetto con tre tubi. L'acqua entra sempre dall'ingresso centrale (COM) e può uscire o dal tubo A o dal tubo B — mai da entrambi insieme.

## Come funziona fisicamente

```
Posizione 1 (NC attivo):          Posizione 2 (NO attivo):

   COM ──── NC                       COM ────────── NO
              │                                     │
              NO (aperto)            NC (aperto)   │
```

| Terminale | Sigla | Ruolo |
|---|---|---|
| Comune | COM | Entrata/uscita principale — sempre collegato |
| Normalmente chiuso | NC | Connesso a COM a riposo (switch non azionato) |
| Normalmente aperto | NO | Connesso a COM quando switch è azionato |

**Nota corrente**: l'SPDT non limita corrente da solo. La corrente massima dipende dal modello fisico (tipico: 100 mA–3 A per slide-switch didattici). Con Arduino usate sempre ≤ 40 mA per pin o inserite una resistenza.

### Connessioni pratiche con Arduino Nano

```
Scenario A — Selezione modalità (COM → pin digitale):

  5 V ──── NO ─────┐
                    ├── COM ──── pin D7 + R pull-down 10 kΩ → GND
  GND ──── NC ─────┘

  switch su NO → D7 legge HIGH (modalità 1)
  switch su NC → D7 legge LOW  (modalità 2)

Scenario B — Inversione LED (due LED alternativi):

  COM → LED_rosso → GND   (posizione 1)
  COM → LED_verde  → GND  (posizione 2)
  Corrente entra da 5 V sempre al COM
```

### Tipi fisici comuni nel kit didattico

| Tipo | Aspetto | Tipico uso |
|---|---|---|
| Slide switch | Cursore plastica | Selezione modalità on-off |
| Toggle switch (leva) | Leva metallica | Selezione manuale circuito |
| Rocker switch | Bilanciere | Alimentazione / accensione |
| DIP switch | Array switch su PCB | Configurazione indirizzo I2C |

## Esperimenti correlati

- **Capitoli pulsante / input digitale** (Vol.1 cap. input): stessa logica HIGH/LOW, ma SPDT è non-momentaneo (resta in posizione)
- **Capitolo motori DC** (ove presente in Vol.3): SPDT può selezionare direzione corrente motore semplice
- **Bus I2C indirizzo**: DIP switch SPDT array usato per impostare indirizzo fisico sensori (A0–A2 pull-up/pull-down)
- **Sketch modalità**: selezione tra due programmi diversi (es. blink veloce vs blink lento) senza ri-caricare codice

## Errori comuni

1. **Pin COM non identificato** — I tre terminali sembrano identici dall'esterno. Senza leggere la datasheet o usare il tester, si collegano NO/NC e si dimentica COM. Risultato: il circuito non funziona in nessuna posizione. Usare il multimetro in modalità continuità per identificare COM (suona sia con NO che con NC).

2. **Confonderlo con un pulsante (SPST momentaneo)** — L'SPDT rimane nella posizione scelta fino al prossimo azionamento. Se nel codice si aspetta un impulso momentaneo (`while(digitalRead(pin) == LOW)`) il programma si blocca. Gestire con `if` non `while`, oppure con debounce state-machine.

3. **Assenza di pull-up o pull-down** — Con SPDT che seleziona 5 V / GND il pin è sempre definito. Ma se uno dei terminali rimane scollegato (solo COM + un terminale), il pin fluttua nella posizione "aperta". Aggiungere sempre pull-up o pull-down sul terminale non usato.

4. **Corrente eccessiva sul COM** — Collegare motori o carichi > 100 mA direttamente allo switch didattico. I contatti del slide switch si bruciano silenziosamente. Usare transistor o MOSFET come stadio di potenza; lo switch pilota solo il gate/base.

5. **Logica NC/NO invertita nel codice** — NC è chiuso a RIPOSO: se lo switch non è azionato e NC è collegato a GND, il pin legge LOW. I ragazzi si aspettano HIGH "perché lo switch non è premuto". Commentare sempre `// NC=GND → LOW a riposo` per evitare confusione.

## Domande tipiche degli studenti

**"Cos'è la differenza tra SPDT e un pulsante normale?"**
Il pulsante normale (SPST) apre o chiude un solo circuito — come luce accesa/spenta. L'SPDT ha due uscite: invece di "aperto o chiuso" sceglie "percorso A o percorso B". E soprattutto rimane nella posizione scelta, non serve tenerlo premuto.

**"Quando uso COM, quando NO e quando NC?"**
COM è sempre il vostro punto di arrivo/partenza — il "filo principale". NO usatelo se volete che qualcosa succeda SOLO quando azionate lo switch. NC usatelo se volete qualcosa attivo per IMPOSTAZIONE PREDEFINITA che si spegne quando azionate.

**"Posso usare SPDT per accendere/spegnere un motore?"**
Sì, ma attenzione alla corrente! Per motori da 5 V / 200 mA un slide switch didattico va bene. Per motori più grandi serve un transistor o un driver L298N — lo switch da solo non regge.

**"Perché si chiama 'Single Pole Double Throw'?"**
In inglese "pole" = polo (quante entrate ha) e "throw" = lancio (quante uscite ha). SPDT = 1 entrata, 2 uscite. Esistono anche DPDT (2 poli, 2 uscite) usati per invertire motori, o 4PDT nei mixer audio. Noi usiamo SPDT perché è il più semplice.

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi (linguaggio kit fisico, NON simulatore)**:

> "Ragazzi, prendete lo switch dal vostro kit. Vedete i tre terminali? Quello centrale è COM — è sempre 'acceso'. Spostate il cursore e sentite il clic: state dirigendo la corrente su un percorso diverso, come un deviatore del treno. Adesso colleghiamo i tre fili sulla breadboard e vediamo cosa succede ai due LED."

**Sequenza didattica raccomandata**:
1. Mostrare lo switch fisico: far toccare il meccanismo, far sentire il clic dei due stati
2. Con multimetro modalità continuità: identificare insieme COM, NC, NO (suono = collegato)
3. Collegare in breadboard: COM → LED_rosso + LED_verde su percorsi separati, alimentazione da 5 V
4. Alternare posizioni: i ragazzi vedono i LED accendersi alternativamente
5. Collegare COM a pin digitale Arduino: `digitalRead()` e stampare sul Serial Monitor lo stato
6. Discutere applicazioni reali: interruttore luce scala (SPDT a due punti di azionamento)

**Sicurezza**:
- Slide switch didattici reggono fino a ~100–300 mA a 5 V: sicuri per LED e piccoli buzzer
- Non collegare mai COM direttamente a 5 V e NC direttamente a GND senza resistenza di carico: cortocircuito garantito quando si aziona in posizione NC
- Nel kit Omaric: identificare il tipo esatto di switch incluso prima di dichiararne la portata corrente

**Cosa NON fare**:
- Non lasciate NC o NO scollegati (floating) se il pin Arduino li legge — aggiungete pull-up/pull-down
- Non presentate SPDT come sostituto del pulsante momentaneo per sketch che richiedono impulso — la logica è diversa

## Link L1 (raw RAG queries)

- `"interruttore SPDT single pole double throw"`
- `"switch tre terminali COM NO NC Arduino"`
- `"slide switch selezione modalità circuito"`
- `"deviatore corrente due percorsi elettrici"`
- `"toggle switch Arduino digitalRead HIGH LOW"`
- `"interruttore non momentaneo stato persistente"`
