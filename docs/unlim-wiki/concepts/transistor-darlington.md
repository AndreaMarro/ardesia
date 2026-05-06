---
id: transistor-darlington
type: concept
title: "Transistor Darlington — guadagno altissimo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [darlington, bjt, transistor, guadagno, vol-non-coperto]
---

## Definizione

Un **transistor Darlington** e' una coppia di BJT in cascata, dove l'emettitore del primo pilota la base del secondo. Il guadagno di corrente complessivo e' il prodotto dei due (tipicamente 1000-10000 contro 100-300 di un BJT singolo). Cio' permette di pilotare carichi pesanti con correnti di base minuscole.

## Componenti tipici

- **TIP120** (NPN, 5 A, 60 V) -- onnipresente per controllare motori DC, rele', solenoidi
- **TIP125** (PNP, complementare)
- **ULN2003 / ULN2803** -- array di 7/8 Darlington in un solo chip, comodissimi per pilotare display, motori passo-passo, rele' multipli

## Schema TIP120 (motore DC da Arduino)

```
            +12V (alim. esterna)
              |
            Motore DC
              |
              +--- Collettore
                    |
                  TIP120 (Darlington NPN)
                    |
              +--- Emettitore -> GND
              |
Gate (base)<-+ resistore 1k <- pin Arduino D9 (PWM)

Diodo 1N4007 (flyback) in parallelo al motore, catodo a +V
```

## Esempio: ULN2003 per pilotare 4 LED ad alta corrente

```cpp
const int IN[] = {2, 3, 4, 5};

void setup() {
  for (int p : IN) pinMode(p, OUTPUT);
}

void loop() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(IN[i], HIGH);
    delay(200);
    digitalWrite(IN[i], LOW);
  }
}
```
Pin Arduino -> ingresso ULN2003 -> uscita -> LED ad alta corrente verso +V.

## Errori comuni

1. **Caduta di tensione 1.4-2 V** sul Darlington -> a parita' di V_alim si perde piu' tensione che con un MOSFET (R_DS_ON minima). Per applicazioni >1 A preferire MOSFET
2. **Senza diodo flyback** -> motori e rele' bruciano il Darlington al rilascio
3. **Surriscaldamento** -> serve dissipatore quando si superano 500 mA continui
4. **GND comune mancante** tra alim. esterna del motore e Arduino -> il transistor non riceve riferimento

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il Darlington e' come due transistor in serie che si "aiutano". Un transistor da solo amplifica 100 volte, due in cascata amplificano 100x100 = 10.000 volte. Cosi' con poca corrente dal pin Arduino possiamo accendere motori grandi.

**Cosa fare:**
- NON costruire questo circuito senza un docente che ha gia' usato motori esterni (richiede alim. dedicata)
- Mostrare l'integrato ULN2003 -- "8 Darlington in un solo chip"
- Spiegare che il MOSFET e' alternativa moderna (efficiente)

**Sicurezza:**
- Sempre alim. esterna per motori, mai dal 5V Arduino
- GND comune obbligatorio tra Arduino e alim. esterna
- Diodo flyback su ogni carico induttivo

## Link L1 (raw RAG queries)

- "TIP120 Darlington Arduino motore"
- "ULN2003 array Darlington pinout"
- "diodo flyback motore DC"
