---
id: mq2-gas
type: concept
title: "MQ-2 — sensore gas combustibili e fumo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [mq2, gas, fumo, sensore, sicurezza, vol-non-coperto]
---

## Definizione

L'**MQ-2** e' un sensore a stato solido (SnO2) sensibile a gas combustibili (metano, GPL, propano, butano, idrogeno) e fumo. Restituisce una tensione analogica proporzionale alla concentrazione. La famiglia MQ ha decine di varianti: MQ-2 (combustibili+fumo), MQ-3 (alcool), MQ-4 (metano), MQ-7 (CO), MQ-135 (qualita' dell'aria).

## Pinout modulo

| Pin | Funzione |
|---|---|
| VCC | 5 V (richiede ~150 mA per il riscaldatore) |
| GND | massa |
| AO | uscita analogica (concentrazione gas) |
| DO | uscita digitale soglia (regolata da trimmer) |

## Schema collegamento

```
+5V (alim. dedicata raccomandata) --- VCC
GND --- GND
A0  --- AO  (lettura analogica)
D2  --- DO  (allarme se sopra soglia, opzionale)
```

## Esempio Arduino — semplice

```cpp
const int MQ = A0;
const int LED = 13;

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
}

void loop() {
  int v = analogRead(MQ);
  Serial.print("MQ-2: "); Serial.println(v);

  if (v > 400) {  // soglia indicativa, calibra!
    digitalWrite(LED, HIGH);
    Serial.println("ALLARME GAS!");
  } else {
    digitalWrite(LED, LOW);
  }
  delay(500);
}
```

## Importante: warm-up

Il riscaldatore interno deve raggiungere temperatura per dare letture stabili. **Prime 24-48 ore** dopo l'acquisto: lasciare alimentato in continuo. **Ogni accensione**: aspettare 2-3 minuti prima di considerare le letture affidabili.

## Calibrazione

Il valore "raw" varia con umidita', temperatura, eta' del sensore. Procedura semplice:
1. In aria pulita (esterno, lontano da fonti gas) -> registrare `baseline`
2. Soglia allarme = `baseline * 2` o `baseline + 200`

Datasheet ha grafici per conversione in ppm, ma richiede regressione e per uso scuola e' overkill.

## Errori comuni

1. **Alim. da pin Arduino 5V senza warm-up** -> letture saltellanti, falsi allarmi
2. **Confronto con MQ-7 per CO** -> MQ-2 non e' affidabile per monossido, usa MQ-7 dedicato
3. **Vicino a forni o caloriferi** -> letture sbagliate per temperatura ambiente alta
4. **Mai testare con fiamma diretta** -> rovini il sensore!

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, l'MQ-2 e' un sensore di gas che si accende come un piccolo radiatore (sentite il calore con il dito vicino). Misura quanti gas combustibili ci sono nell'aria. Si usa nelle case per allarmi gas e nei garage industriali.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti sicurezza domestica
- Se disponibile, mostrare il "warm-up" (LED rosso del modulo si accende, sensore caldo)
- Test sicuro: accendere un fiammifero a 30-50 cm dal sensore (NON troppo vicino) -> watch the value rise
- Spiegare che gli sensori reali in casa sono certificati EN 50194, l'MQ-2 e' didattico

**Sicurezza:**
- Sensore caldo (~80 °C superficie) -> non toccare con dita, non in tasca
- Mai testare con accendini vicini -> rischio di accendere il sensore stesso
- Non sostituisce un rilevatore di gas certificato in casa
- Alim. esterna 5 V se Arduino non basta (USB scuola spesso limita a 500 mA)

## Link L1 (raw RAG queries)

- "MQ-2 sensore gas Arduino calibrazione"
- "MQ famiglia MQ-3 MQ-7 MQ-135"
- "warm-up sensore gas SnO2"
