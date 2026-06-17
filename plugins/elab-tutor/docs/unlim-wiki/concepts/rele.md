---
id: rele
type: concept
title: "Relè (interruttore elettromeccanico)"
locale: it
volume_ref: 2
pagina_ref: 84
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [rele, relais, relay, transistor, driver, bobina, contatti, isolamento, sicurezza, alta-tensione, mosfet, diodo-flyback]
---

## Definizione

Il relè è un interruttore elettromeccanico: una **bobina** percorsa da corrente genera un campo magnetico che attira fisicamente un contatto metallico, chiudendo (o aprendo) un secondo circuito completamente separato. Vol. 2, Cap. 8 lo introduce come l'esempio più potente di "catena di amplificazione": Arduino → transistor → relè → carico ad alta tensione.

## Anatomia

- **Bobina (coil)**: l'elettromagnete, alimentata a 5 V, ~70 mA. Arduino **non la pilota direttamente** — serve un transistor o MOSFET come driver.
- **Armatura (ancora)**: il cursore metallico che si sposta quando il campo magnetico è attivo; produce il tipico "click" udibile.
- **Contatti**:
  - **COM** (common): terminale condiviso, dove arriva il filo del carico
  - **NO** (Normally Open): aperto a relè spento, chiuso quando la bobina è attiva
  - **NC** (Normally Closed): chiuso a relè spento, aperto quando la bobina è attiva
- **Diodo di ricircolo (flyback)**: collegato in antiparallelo alla bobina — obbligatorio, protegge il transistor dalla sovratensione inversa alla disattivazione.

## Analogia per la classe

Ragazzi, immaginate che Arduino sia un bambino di 8 anni che vuole accendere un enorme interruttore a muro per la luce del palazzetto — ma è troppo piccolo e debole per premere quel grosso pulsante. Allora chiama un operaio adulto (il transistor), che a sua volta tira una leva meccanica (la bobina del relè), e quella leva chiude il contatto che accende le luci del palazzetto (220 V). Arduino ha controllato qualcosa di enorme usando pochissima energia — e i due circuiti non si toccano mai!

## Cosa succede fisicamente

Quando la bobina è percorsa da corrente *I*, genera una forza magnetomotrice *F = N × I* (numero di spire × corrente). Quella forza attira l'armatura contro i poli magnetici, chiudendo il contatto **NO**.

Quando il transistor driver si spegne, il campo magnetico crolla **istantaneamente**. Per la legge di Lenz, la bobina reagisce generando una tensione inversa che può superare facilmente i 50–100 V — letale per un transistor da 30 V. Il **diodo flyback** offre un percorso di scarica sicuro: la corrente di ricircolo gira nella bobina finché l'energia è dissipata termicamente.

### Schema funzionale

```
Arduino Pin 7 → R_base (1kΩ) → Base transistor NPN
                                Collettore → Bobina relè (pin 1)
Bobina relè (pin 2) → GND
Diodo flyback: anodo → GND, catodo → Bobina pin 1  ← OBBLIGATORIO
Contatto COM → Lampada 220V → Neutro
Contatto NO  → Fase 220V
```

### Tabella stati relè

| Segnale Arduino | Transistor | Bobina | Contatto NO | Carico (lampada) |
|-----------------|------------|--------|-------------|------------------|
| LOW (0 V)       | OFF        | spenta | aperto      | spento           |
| HIGH (5 V)      | ON         | attiva | chiuso      | acceso           |
| Transizione OFF | OFF        | picco inverso → diodo scarica | aperto | spento |

### Parametri tipici — relè da 5 V (HK4100F o SRD-05VDC-SL-C)

| Parametro               | Valore tipico                     |
|-------------------------|-----------------------------------|
| Tensione bobina         | 5 V DC                            |
| Corrente bobina         | 60–90 mA (troppa per pin Arduino) |
| Resistenza bobina       | 55–80 Ω                           |
| Contatti nominali       | 250 VAC / 10 A oppure 30 VDC / 10 A |
| Tensione pick-up        | ≥ 3,75 V (75 % di V_nominale)    |
| Tensione drop-out       | ≤ 0,5 V (10 % di V_nominale)     |
| Tempo risposta ON       | ~10 ms                            |
| Vita meccanica          | 10 milioni di operazioni          |

> Arduino Nano: corrente massima per pin = 40 mA. La bobina ne vuole 70–90 mA → **sempre usare un transistor o MOSFET driver**. Senza driver il pin Arduino si danneggia.

## Esperimenti correlati

- **Vol. 2, Cap. 8** — transistor come driver del relè (estensione degli esperimenti MOSFET)
- **Vol. 2 — Motore DC** — il relè può sostituire il driver H-Bridge per inversione di marcia a bassa frequenza
- **Vol. 3 — Automazione** — relè temporizzato con `millis()` per luci automatiche
- → `transistor.md` — il transistor NPN driver del relè
- → `mosfet.md` — alternativa MOSFET come driver (preferito perché non serve corrente di base)
- → `diodo.md` — il diodo flyback che protegge il transistor
- → `fusibile.md` — il fusibile che protegge il carico ad alta tensione

## Errori comuni

1. **Pilotare la bobina direttamente dal pin Arduino senza transistor**: il pin si danneggia o si resetta perché la corrente richiesta (70–90 mA) supera il limite del pin (40 mA). Usate sempre un transistor NPN o MOSFET N-channel tra il pin e la bobina.

2. **Dimenticare il diodo flyback**: al momento dello spegnimento la bobina genera una tensione inversa di 50–100 V. Senza diodo il transistor brucia in pochi cicli ON/OFF, spesso in silenzio — il circuito smette di funzionare e non capite perché. Il diodo è piccolo, economico e obbligatorio.

3. **Invertire l'orientamento del diodo flyback**: il catodo (banda) va verso il positivo dell'alimentazione (lato bobina pin 1), l'anodo verso GND. Invertito, il diodo conduce in continuazione e cortocircuita l'alimentazione — potrebbe bruciare il transistor o il diodo stesso.

4. **Confondere NO e NC**: se volete che il carico sia **spento** quando Arduino è spento, usate il contatto **NO** (aperto di default). Se volete che sia **acceso** in assenza di segnale (fail-safe attivo), usate **NC**. Invertirli produce comportamento opposto a quello atteso.

5. **Collegare carichi AC 220 V in modo non sicuro**: nella classe non si lavora MAI con 220 V — il relè è spiegato come concetto, non come esperimento live su rete domestica. I circuiti di simulazione usano una lampadina a 9 V DC per riprodurre il principio in sicurezza.

## Domande tipiche degli studenti

**"Perché si sente il 'click'? Il relè si rompe?"**
No, è normalissimo! Il click è il suono dell'armatura metallica che si sposta fisicamente contro i poli magnetici. Ogni relè lo fa ad ogni commutazione — è la prova che il meccanismo interno funziona. I relè industriali fanno click milioni di volte nel corso della loro vita.

**"Perché Arduino non può accendere direttamente la bobina?"**
Arduino è un microcontrollore delicato: ogni pin eroga al massimo 40 mA, altrimenti la corrente eccessiva brucia il driver interno del pin — e con esso, a volte, tutta la scheda. La bobina del relè vuole 70–90 mA: quasi il doppio. Il transistor è il "guanto" che protegge Arduino: lui sopporta quella corrente, Arduino comanda solo il transistor con pochi mA.

**"Cosa succederebbe se usassimo un relè invece di un MOSFET per controllare un motore DC ad alta velocità?"**
Il relè è lento: impiega ~10 ms ad aprire e chiudere. Per variare la velocità di un motore con PWM servono migliaia di commutazioni al secondo — il relè non ce la fa, si surriscalda e si distrugge. Il MOSFET invece commuta in nanosecondi: è l'interruttore giusto per PWM. Il relè è perfetto per commutazioni lente (accendi/spegni una lampada), il MOSFET per commutazioni rapide.

**"Il relè isola davvero i due circuiti? Come fa?"**
Sì, completamente. La bobina e i contatti non sono collegati elettricamente: l'unico legame tra loro è il campo magnetico. Questa è la magia del relè — l'informazione passa da un circuito all'altro senza che un singolo elettrone si sposti tra loro. Per questo un relè può usare Arduino a 5 V per controllare una lampada a 220 V in totale sicurezza (se il circuito AC è installato correttamente da un elettricista).

## PRINCIPIO ZERO

### Sicurezza

Il relè è uno dei pochissimi componenti ELAB che porta il discorso vicino ai 220 V della rete domestica. **In classe si lavora SEMPRE e SOLO con tensioni sicure** (9 V DC, 5 V DC). Non si collegano mai i contatti del relè alla rete elettrica durante le sessioni ELAB.

**Regole pratiche:**
- Il lato "carico" del relè (COM/NO/NC) nella simulazione è collegato a una lampadina a 9 V DC — mai alla presa di corrente
- Se i ragazzi chiedono "ma a casa si potrebbe controllare una lampadina?" — la risposta è sì, ma solo con impianto realizzato da un elettricista certificato, mai in fai-da-te
- Il diodo flyback è un requisito di sicurezza del circuito, non un'opzione: senza di lui il transistor può esplodere (letteralmente fare un piccolo "pop") — spiegarlo come regola non derogabile

### Narrativa per il docente

Il relè è il **ponte tra il mondo digitale e il mondo fisico ad alta potenza**: Arduino parla in milliwatt, il relè comanda kilowatt. Questa è la grande lezione — l'elettronica di controllo non deve necessariamente sopportare la potenza che governa.

Usate questo script quando introducete il componente:

> *"Ragazzi, Arduino è bravissimo — sa fare milioni di calcoli al secondo, ricorda tutto, non si stanca. Ma è minuscolo e delicato: può controllare solo carichi piccoli. Il relè è il suo 'braccio meccanico': Arduino gli manda un ordine, e lui apre o chiude un circuito completamente separato, anche ad alta tensione. I due circuiti non si toccano mai. Questo si chiama isolamento galvanico."*

Se avete un relè fisico a disposizione (il kit ELAB lo include), fatelo vedere mentre è tenuto in mano: mostrate i pin della bobina e i pin dei contatti, spiegate che sono separati. Fate click il relè manualmente premendo l'armatura con il dito: i ragazzi capiscono immediatamente la meccanica.

### Cosa dire ai ragazzi

Quando nel volume leggete la sezione transistor + relè, citate il testo esatto: Vol. 2, Cap. 8. Poi aggiungete:

> *"Vedete questa catena? Arduino manda 5 V al transistor, il transistor accende la bobina, la bobina attira il contatto, e la lampadina si accende. Quattro componenti, quattro 'anelli' di una catena. Ogni anello fa la sua parte: Arduino pensa, il transistor amplifica, il relè isola, la lampadina brilla."*

### Connessione con altri concetti

- Insegnate il relè sempre **dopo** `transistor.md` o `mosfet.md` — il driver è un prerequisito
- Collegate il diodo flyback a `diodo.md` (la funzione di valvola unidirezionale usata in modo creativo)
- Ricordate `fusibile.md` come protezione aggiuntiva sul lato carico
- Per i più curiosi, collegate a `corrente-alternata.md`: spiegate che la rete domestica è AC 50 Hz e che il relè commuta i contatti senza aver bisogno di "capire" se è AC o DC — lui apre e chiude, il resto è il circuito di potenza

## Link L1 (raw RAG queries)

- Query `"relè transistor driver bobina"` in `src/data/rag-chunks.json` → chunk transistor + relè Vol. 2 Cap. 8
- Query `"interruttore elettromeccanico contatti NO NC COM"` → chunk componenti avanzati Vol. 2
- Query `"diodo flyback protezione bobina relè"` → chunk sicurezza + diodi Vol. 2
- Query `"Arduino controlla lampada 220V isolamento"` → chunk applicazioni relè + sicurezza
- Query `"transistor NPN pilotare carico corrente base"` → chunk transistor driver Vol. 2 pag. 75-84
