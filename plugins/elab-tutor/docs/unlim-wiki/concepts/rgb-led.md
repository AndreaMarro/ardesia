---
id: rgb-led
type: concept
title: "LED RGB (Rosso-Verde-Blu)"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [led, rgb, colori, pwm, anodo-comune, catodo-comune, arduino]
---

## Definizione

Il LED RGB è un singolo componente che racchiude tre LED separati — rosso (R), verde (G) e blu (B) — in un unico involucro trasparente. Combinando le tre intensità luminose con PWM si ottiene qualsiasi colore visibile. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

## Analogia per la classe

Ragazzi, avete mai visto lo schermo del telefono o della TV da vicinissimo? È fatto di minuscoli puntini rossi, verdi e blu affiancati. Il LED RGB funziona esattamente così: tre lampadine microscopiche nello stesso involucro. Mescolando rosso + verde + blu in proporzioni diverse — proprio come i pittori mescolano i colori — si ottiene qualsiasi tonalità, dal viola al giallo all'arancione!

## Tipi di LED RGB

| Tipo | Pin | Come si collega |
|------|-----|----------------|
| **Catodo comune** (più diffuso) | 4 pin: R, G, B, GND comune | Pin comune → GND; R/G/B → resistenza → Arduino |
| **Anodo comune** | 4 pin: R, G, B, VCC comune | Pin comune → 5V; R/G/B → resistenza → Arduino (logica invertita) |

**Come riconoscerli**: il pin più lungo di solito è il comune. Anodo comune = logica invertita (0 = acceso, 255 = spento).

## Schema collegamento (catodo comune)

```
LED RGB                  Arduino Nano
  Pin R  ──── 220Ω ─────  D9  (PWM)
  Pin G  ──── 100Ω ─────  D10 (PWM)
  Pin B  ──── 100Ω ─────  D11 (PWM)
  GND    ──────────────── GND
```

Le resistenze differenti compensano l'efficienza luminosa diversa dei tre chip: il rosso è meno efficiente, il verde e il blu molto di più.

## Cosa succede fisicamente

Ogni colore del LED RGB è un diodo separato con materiale semiconduttore diverso:

| Canale | Materiale | Vf tipica | Resistenza consigliata (5V) |
|--------|-----------|-----------|----------------------------|
| Rosso | AlGaInP | 1.8–2.2 V | 150–220 Ω |
| Verde | InGaN | 3.0–3.4 V | 68–100 Ω |
| Blu | InGaN | 3.0–3.4 V | 68–100 Ω |

Con PWM (analogWrite 0–255) si controlla la luminosità di ogni canale. La combinazione produce colori additivi:

- R=255, G=0, B=0 → **rosso**
- R=0, G=255, B=0 → **verde**
- R=255, G=255, B=0 → **giallo**
- R=128, G=0, B=128 → **viola**
- R=255, G=255, B=255 → **bianco**

## Codice di esempio

```cpp
const int PIN_R = 9;
const int PIN_G = 10;
const int PIN_B = 11;

void setColor(int r, int g, int b) {
  analogWrite(PIN_R, r);
  analogWrite(PIN_G, g);
  analogWrite(PIN_B, b);
}

void setup() {
  pinMode(PIN_R, OUTPUT);
  pinMode(PIN_G, OUTPUT);
  pinMode(PIN_B, OUTPUT);
}

void loop() {
  setColor(255, 0, 0);   // rosso
  delay(1000);
  setColor(0, 255, 0);   // verde
  delay(1000);
  setColor(0, 0, 255);   // blu
  delay(1000);
  setColor(255, 165, 0); // arancione
  delay(1000);
}
```

**Per anodo comune**: invertire i valori (`analogWrite(PIN_R, 255 - r)` ecc.).

## Esperimenti correlati

- **Lampada dell'umore** — ciclo colori con `for` loop sulle tre variabili r/g/b (Cap. avanzato Vol. 2-3)
- **Indicatore di stato** — verde=OK, giallo=warning, rosso=errore (utile con sensori)
- **Miscelatore colori interattivo** — tre potenziometri su A0/A1/A2 controllano R/G/B in tempo reale
- Vedi `led.md` per i fondamentali del LED singolo e la legge di Ohm applicata

## Errori comuni

1. **Pin comune collegato male** — se anodo comune va a GND (invece di 5V) il LED non si accende. Verificare il tipo con multimetro o scheda dati.
2. **Stessa resistenza per tutti e tre i canali** — il verde e il blu risultano molto più brillanti del rosso. Usare resistenze differenziate.
3. **Pin non PWM per analogWrite** — su Arduino Nano solo D3, D5, D6, D9, D10, D11 supportano PWM. Se si usa D2, il colore sarà solo ON/OFF.
4. **Confondere catodo e anodo comune** — la logica si inverte. Un LED che sembra "non funzionare" spesso è il tipo sbagliato usato con il codice sbagliato.
5. **Nessuna resistenza** — brucia uno o più canali in pochi secondi. Ogni canale ha bisogno della propria resistenza.

## Domande tipiche degli studenti

**"Perché non riesco a fare il bianco perfetto?"**  
Il bianco percepito dipende dall'efficienza relativa dei tre chip. Spesso R=255, G=180, B=160 risulta più "bianco" di R=G=B=255 perché il verde domina. Si calibra empiricamente per ogni LED.

**"Posso fare tutti i colori dell'arcobaleno?"**  
Sì! Con la miscelazione additiva RGB si ottengono circa 16 milioni di colori (256³). Quasi tutti i colori visibili sono raggiungibili, anche se alcuni viola molto saturi sono difficili da riprodurre.

**"Qual è la differenza tra colori additivi e sottrattivi?"**  
RGB (additivo) aggiunge luce: rosso + verde = giallo. CMY (sottrattivo, come la stampa) sottrae: ciano + giallo = verde. Il LED RGB usa il modello additivo — somma le luci.

**"Posso usare un solo pin per controllare il colore?"**  
No, servono tre pin PWM separati, uno per ogni canale. Alcuni moduli RGB speciali (come WS2812B «NeoPixel») usano un solo filo dati digitale con protocollo seriale integrato.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Sicurezza**: il LED RGB ha le stesse caratteristiche di sicurezza di un LED normale — nessun pericolo. Non fissare il LED bianco acceso da molto vicino per periodi prolungati.

> **Narrativa**: «Ragazzi, ogni schermo che avete mai guardato — telefono, computer, TV — funziona con esattamente questo principio: rosso + verde + blu mescolati. Oggi voi costruite dal nulla la stessa tecnologia che c'è in ogni pixel del vostro telefono!»

> **Aggancio concreto**: far avvicinare uno smartphone con lo schermo bianco a un LED RGB bianco e confrontare i colori. Poi provare a "programmare" il colore preferito di ciascun ragazzo inserendo i valori RGB dal Serial Monitor.

## Link L1 (raw RAG queries)

```
LED RGB arduino colori
PWM analogWrite colori
catodo comune anodo comune LED
resistenza LED RGB
miscelazione colori additiva RGB
```

Cercare in `src/data/rag-chunks.json` con le query sopra per trovare chunk L1 correlati se presenti.
