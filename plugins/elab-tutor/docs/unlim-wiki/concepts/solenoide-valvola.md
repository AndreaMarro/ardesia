---
id: solenoide-valvola
type: concept
title: "Solenoide e valvola elettromagnetica"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [solenoide, valvola, elettromagnete, attuatore, vol-non-coperto]
---

## Definizione

Un **solenoide** e' una bobina di filo che, quando attraversata da corrente, genera un campo magnetico che muove un nucleo di ferro. Ne esistono due tipologie:

- **Push/pull lineare** -- il nucleo entra/esce dalla bobina (~1-3 cm corsa). Usato per: serrature elettriche, distributori automatici, robotica di base
- **Valvola elettromagnetica** -- il movimento del nucleo apre/chiude un passaggio per un fluido (acqua, aria, gas). 12 V tipico per valvole acqua giardinaggio

## Schema pilotaggio (Arduino + MOSFET o relay)

I solenoidi richiedono **molta corrente** (200 mA - 2 A) e producono **kickback induttivo** (picchi alla disconnessione). Pilotaggio sicuro:

```
Alim. esterna +12V ---+
                      |
                   solenoide
                      |
                      +---+--- diodo flyback (catodo verso +12V) <-- OBBLIGATORIO
                      |
                      +--- Drain MOSFET (canale N, logic level se 5V gate)
                                |
                            Source --- GND comune

Gate <- Arduino D9 (PWM o digitale)
GND comune obbligatorio
```

## Esempio Arduino — irrigazione automatica

```cpp
const int VALVOLA = 9;
const int SUOLO = A0;

void setup() {
  pinMode(VALVOLA, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int u = analogRead(SUOLO);
  Serial.print("Umidita': "); Serial.println(u);

  if (u > 600) {  // suolo secco
    Serial.println("Innaffio per 5 secondi");
    digitalWrite(VALVOLA, HIGH);
    delay(5000);
    digitalWrite(VALVOLA, LOW);
  }

  delay(60000);  // controlla ogni minuto
}
```

## Diodo flyback

Quando il solenoide si spegne, l'energia del campo magnetico genera un picco di tensione (anche centinaia di volt). Il **diodo 1N4007** in parallelo al solenoide (catodo verso +V) cortocircuita questo picco, salvando il MOSFET. **MAI omettere**.

## Errori comuni

1. **Diodo flyback assente** -> MOSFET o relay si bruciano dopo qualche centinaio di cicli
2. **Alim. da Arduino 5V** -> 200 mA gia' troppi, brucia il regolatore. Sempre alim. esterna
3. **GND non comune** -> il MOSFET non riceve riferimento gate-source
4. **PWM su solenoide AC** -> non si pilotano AC con MOSFET DC, usa SSR (solid state relay)
5. **Duty cycle 100% prolungato** -> il solenoide scalda, qualche modello non e' "100% duty rated"

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, un solenoide e' un elettromagnete che muove un nucleo di ferro. E' come un piccolo muscolo: quando arriva corrente "tira" o "spinge". Le valvole dell'acqua nelle lavastoviglie e nei sistemi di irrigazione lo usano per aprire/chiudere il flusso.

**Cosa fare:**
- NON e' nel kit ELAB base -- progetto avanzato con alim. esterna obbligatoria
- Esempio bello: valvola da giardino 12 V + sensore suolo + Arduino = "irrigazione smart" (vedi `sensore-suolo-umidita.md`)
- Spiegare che l'auto-acceleratore e l'iniettore benzina sono solenoidi velocissimi (ms)

**Sicurezza:**
- Alim. esterna SEMPRE -- mai dal 5 V Arduino
- Diodo flyback OBBLIGATORIO -- non opzionale
- Valvole acqua: usare raccordi giardinaggio standard, non improvvisare cablaggi
- Acqua + elettronica: tappetino isolante sotto + alim. su circuito separato con interruttore principale

## Link L1 (raw RAG queries)

- "solenoide Arduino MOSFET diodo flyback"
- "valvola elettromagnetica 12V irrigazione"
- "kickback induttivo solenoide"
