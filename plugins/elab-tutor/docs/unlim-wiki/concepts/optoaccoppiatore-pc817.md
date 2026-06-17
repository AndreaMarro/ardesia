---
id: optoaccoppiatore-pc817
type: concept
title: "PC817 — optoaccoppiatore per isolamento elettrico"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [pc817, optoaccoppiatore, isolamento, sicurezza, vol-non-coperto]
---

## Definizione

Un **optoaccoppiatore** (o opto-isolatore) e' un componente che trasferisce un segnale digitale tra due circuiti **senza connessione elettrica**: dentro c'e' un LED (lato in) e un fototransistor (lato out) sigillati in un unico chip. Il PC817 e' il modello piu' diffuso: 4 pin, isolamento 5000 V tra ingresso e uscita.

Si usa per:
- Proteggere Arduino da circuiti ad alta tensione (rete 230 V)
- Eliminare ground loops in audio o sensori industriali
- Interfacciare segnali con masse diverse

## Pinout PC817

```
     +---+---+
1 -- |   | 4
2 -- |   | 3
     +---+---+

1 = anodo LED (in+)
2 = catodo LED (in-)
3 = emettitore fototransistor (out-)
4 = collettore fototransistor (out+)
```

Tacca o pallino indicano il pin 1.

## Schema base

```
LATO INGRESSO (Arduino)        LATO USCITA (carico isolato)

  Arduino D5                       VCC isolato
       |                                |
       R 330 Ohm                      R 10k pull-up
       |                                |
   1 (anodo) PC817 4 (collettore) ---+--- a Arduino o circuito
                |                       |
   2 (catodo) PC817 3 (emettitore) --- GND isolato

       GND Arduino                  GND isolato (separato!)
```

I due GND **non si toccano** (e' lo scopo dell'isolamento).

## Esempio: leggere un sensore con GND diverso

```cpp
const int OUT_OPTO = 6;  // pin Arduino che riceve il segnale isolato

void setup() {
  pinMode(OUT_OPTO, INPUT);
  Serial.begin(9600);
}

void loop() {
  int s = digitalRead(OUT_OPTO);
  Serial.println(s ? "OFF" : "ON");  // logica invertita per pull-up
  delay(100);
}
```

## Calcolo resistore lato LED

V_F (PC817) = ~1.2 V, I_F tipica = 10-20 mA. Con Arduino 5 V:
R = (5 - 1.2) / 0.015 = 253 Ω -> usa 330 Ω standard.

## CTR (Current Transfer Ratio)

Il PC817 ha CTR ~50-200% (variabile per esemplare). Significa: corrente uscita = CTR * corrente ingresso. Se ingresso 10 mA -> uscita puo' essere 5-20 mA. Per logica digitale (on/off) e' irrilevante; per analogico richiede selezione del PC817 e calibrazione.

## Errori comuni

1. **GND comune** tra in e out -> svanisce l'isolamento, tanto vale cablo diretto
2. **Resistore lato LED assente** -> il LED interno si brucia
3. **Polarita' LED invertita** -> non si accende, ma neanche si rompe
4. **CTR sotto-stimato** -> non scatta il fototransistor, usa carico R minore o LED piu' brillante

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, un optoaccoppiatore e' come un "telegrafo via luce" dentro un chip: il segnale entra come corrente in un LED, e dall'altra parte un fototransistor lo riceve come luce. I due lati non sono collegati elettricamente -- e' come parlare attraverso un vetro.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti con tensioni di rete (NON da fare con i ragazzi senza supervisione esperta)
- Spiegare che molti elettrodomestici (PLC industriali, alimentatori switching) usano optoaccoppiatori per sicurezza
- Esempio sicuro: usare PC817 per leggere un pulsante che si trova a 10 m di distanza con cavi lunghi -> isolamento da disturbi

**Sicurezza:**
- Tensioni > 50 V SOLO con docente esperto e norme
- 5000 V isolamento NON significa "puoi metterci 5000 V" -> e' tensione di rottura, mai oltre 600 V continui
- Mai cortocircuitare i 4 pin

## Link L1 (raw RAG queries)

- "PC817 optoaccoppiatore Arduino isolamento"
- "CTR current transfer ratio optocoupler"
- "ground loop sensori Arduino"
