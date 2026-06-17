---
id: infrarosso
type: concept
title: "Sensore e LED a Infrarossi (IR)"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [infrarosso, ir, sensore, led-ir, ricevitore, telecomando, arduino]
---

## Definizione

Il sensore a infrarossi (IR) è un componente elettronico che rileva la luce infrarossa — luce invisibile all'occhio umano ma emessa da qualsiasi corpo caldo e usata nei telecomandi. Nei kit Arduino si trovano in coppia: un **LED IR emettitore** (trasmette) e un **fotodiodo IR ricevitore** (riceve). *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

## Analogia per la classe

Ragazzi, immaginate di parlare con un amico al buio usando una torcia invisibile. Voi premete il tasto del telecomando della TV: la torcia lampeggia rapidissima in un codice segreto. Il televisore "vede" quei lampeggi e capisce il comando, anche se voi non vedete nulla. Il LED IR è quella torcia invisibile, il ricevitore IR è l'orecchio del televisore!

## Componenti tipici nei kit Arduino

| Componente | Codice tipico | Funzione |
|------------|--------------|----------|
| LED IR emettitore | IR333-A (940nm) | Emette luce infrarossa |
| Ricevitore IR demodulato | TSOP4838 / VS1838B | Riceve + demodula segnale 38kHz |
| Modulo IR riga | KY-032 / FC-51 | Coppia IR integrata (proximity/line) |

## Schema collegamento ricevitore VS1838B

```
VS1838B               Arduino Nano
  Pin 1 (OUT) ───────── D2 (interrupt pin)
  Pin 2 (GND) ───────── GND
  Pin 3 (VCC) ───────── 5V
```

**Resistenza:** non necessaria sul pin OUT (already pulled up internally).  
**LED IR emettitore:** anodo → resistenza 100Ω → D3, catodo → GND.

## Cosa succede fisicamente

Il LED IR emette luce a 940nm (vicino infrarosso). Il ricevitore demodulato contiene:
1. **Fotodiodo** che risponde a 940nm
2. **Amplificatore** + **filtro** per 38kHz carrier
3. **Demodulatore**: output LOW quando rileva segnale, HIGH altrimenti

Il protocollo più comune è **NEC**: ogni tasto del telecomando invia un indirizzo (8bit) + un comando (8bit), trasmesso come sequenza di burst a 38kHz. La libreria `IRremote` di Arduino decodifica automaticamente.

## Parametri tipici

| Parametro | LED IR | Ricevitore |
|-----------|--------|-----------|
| Lunghezza d'onda | 940 nm | Sensibile 800-1050 nm |
| Angolo emissione | 20-45° | 45° angolo ricezione |
| Portata | 5-10 m (con 100mA pulsati) | 5-15 m |
| Corrente operativa | 20 mA continua / 200 mA pulsata | 0.4 mA @ 5V |
| Frequenza carrier | — | 38 kHz (standard NEC) |

## Codice di esempio (libreria IRremote)

```cpp
#include <IRremote.hpp>

const int PIN_RICEVITORE = 2;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(PIN_RICEVITORE);
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.println(IrReceiver.decodedIRData.command, HEX);
    IrReceiver.resume();   // pronti per il prossimo segnale
  }
}
```

## Esperimenti correlati

- **Telecomando IR** — controllo LED o motore con telecomando TV (tipicamente Cap. avanzato Vol. 2-3)
- **Sensore di prossimità IR** — rilevamento ostacoli (modulo FC-51/KY-032, connesso a pin digitale)
- **Seguibordo line-follower** — coppia IR sotto il robot, rileva linea nera su sfondo bianco
- Vedi `sensore-pir.md` per il PIR (che rileva movimento di corpi caldi, diverso dall'IR attivo)

## Errori comuni

1. **Luce solare o fluorescente disturba** — i neon emettono IR a 100Hz. Usare `IrReceiver.begin(pin, true)` per abilitare LED di feedback, o schermatura.
2. **LED IR al contrario** — non emette, nessun danno (diodo blocca). Verificare che la gamba lunga (+) vada al positivo.
3. **Senza resistenza sul LED emettitore** — il LED brucia subito. Mettere sempre almeno 100Ω.
4. **Pin D2 confuso con altri interrupt** — `IrReceiver.begin()` usa interrupt hardware. Non usare D2 per altro.
5. **Libreria sbagliata** — esistono `IRremote` (raccomandato, versione 4+) e `IRLib2`. Non mescolare nei progetti.

## Domande tipiche degli studenti

**"Come fa il telecomando a capire quale tasto ho premuto?"**  
Ogni tasto invia un codice binario diverso (es. tasto "1" = `0x45`, tasto "2" = `0x46`). Il ricevitore misura la durata dei burst IR e le converte nel numero corrispondente.

**"Posso usare qualsiasi telecomando?"**  
Quasi tutti i telecomandi TV/DVD usano il protocollo NEC o SONY — funzionano con `IRremote`. Telecomandi AC (aria condizionata) usano protocolli più complessi.

**"Il sensore IR e il sensore PIR sono la stessa cosa?"**  
No! Il PIR (Passive IR) rileva *calore corporeo* passivamente (nessun emettitore). Il sensore IR *attivo* usa un emettitore + ricevitore propri. Vedi `sensore-pir.md`.

**"Quanto lontano arriva il segnale?"**  
Con il LED alimentato a 5V e resistenza 100Ω, circa 3-5 metri. Riducendo la resistenza a 47Ω (massimo 200 mA pulsato) si arriva a 10+ metri.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Sicurezza**: la luce infrarossa è invisibile ma NON pericolosa alle intensità dei LED da kit (simile al LED del telecomando di casa). Non fissare direttamente il LED IR acceso per lunghi periodi — precauzione generale, non rischio reale a queste potenze.

> **Narrativa**: «Ragazzi, questo è lo stesso principio che usa il vostro telecomando della TV da anni. Il LED emette luce che i vostri occhi non vedono, ma Arduino la "vede" benissimo. Oggi costruite il vostro decoder di telecomandi!»

> **Aggancio concreto**: far portare un vecchio telecomando da casa e decodificarne i tasti live su Serial Monitor — ogni ragazzo scopre i codici HEX del proprio telecomando.

## Link L1 (raw RAG queries)

```
infrarosso arduino kit
telecomando IR ricevitore
VS1838B TSOP arduino
IRremote library arduino
sensore prossimità IR KY-032
```

Cercare in `src/data/rag-chunks.json` con le query sopra per trovare chunk L1 correlati se presenti.
