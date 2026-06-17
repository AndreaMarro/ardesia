---
id: relay-state-machine
type: concept
title: "Macchina a stati per controllo rele'"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [relay, rele, state-machine, controllo, vol-non-coperto]
---

## Definizione

Una **macchina a stati** (state machine) e' un pattern di programmazione che organizza il codice in **stati discreti** + **transizioni** condizionate. E' particolarmente utile quando si pilota un attuatore lento (rele', solenoide, motore) per evitare cicli rapidi che lo danneggiano e per gestire timing complesso senza `delay()` (che blocca tutto il programma).

## Esempio: rele' anti-rapido-ciclo

Problema tipico: hai un sensore di temperatura. Vuoi accendere un rele' (ventola) sopra 30 °C, spegnere sotto 28 °C. Ma non vuoi che il rele' scatti 100 volte al minuto se la temperatura oscilla.

```cpp
enum Stato { OFF, COOLING, COOLDOWN };
Stato stato = OFF;

const float SOGLIA_ACCENSIONE = 30.0;
const float SOGLIA_SPEGNIMENTO = 28.0;
const unsigned long MIN_ON_MS = 60000;  // 1 min minimo acceso
const unsigned long COOLDOWN_MS = 30000; // 30 s cooldown spento

unsigned long t_ingresso_stato = 0;

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, LOW);
}

void loop() {
  float t = leggiTemperatura();
  unsigned long now = millis();

  switch (stato) {
    case OFF:
      if (t > SOGLIA_ACCENSIONE) {
        digitalWrite(RELAY, HIGH);
        stato = COOLING;
        t_ingresso_stato = now;
      }
      break;

    case COOLING:
      if (t < SOGLIA_SPEGNIMENTO && (now - t_ingresso_stato) > MIN_ON_MS) {
        digitalWrite(RELAY, LOW);
        stato = COOLDOWN;
        t_ingresso_stato = now;
      }
      break;

    case COOLDOWN:
      if ((now - t_ingresso_stato) > COOLDOWN_MS) {
        stato = OFF;
      }
      break;
  }

  delay(100);
}
```

## Vantaggi

- Niente `delay()` lunghi -> il programma resta reattivo (puo' leggere sensori, comunicare seriale)
- Comportamento prevedibile: ogni stato ha una transizione esplicita
- Facile da debuggare (`Serial.println(stato)` per vedere cosa fa)
- Estensibile: aggiungere uno stato `MANUAL_OVERRIDE` non rompe gli altri

## Pattern: isteresi via 2 soglie

L'esempio sopra usa due soglie diverse (30 ON, 28 OFF) -> isteresi. Questo evita oscillazioni quando la temperatura "balla" tra 29.5 e 30.5 °C.

## Pattern: minimo tempo on/off

`MIN_ON_MS` impedisce al rele' di spegnersi subito dopo l'accensione (evita "click click" rapidi che logorano i contatti).

## Errori comuni

1. **`delay()` dentro lo stato** -> blocca tutto. Usa sempre `millis()` per timing
2. **Stato non resetta `t_ingresso_stato`** -> condizioni temporali non scattano
3. **Variabile `stato` non `volatile`** se modificata da interrupt -> race condition (avanzato)
4. **Soglie troppo vicine** -> oscillazione persistente, allarga isteresi

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, una macchina a stati e' come un diagramma di flusso che si esegue tante volte al secondo: "se sono in stato X e succede Y, vado in stato Z". E' come la macchinetta del caffe': accendere, scaldare, erogare, spegnere -- ognuna con regole precise.

**Cosa fare:**
- Per il kit ELAB usate il rele' del volume corrispondente (`rele.md` esistente)
- Spiegare che le centraline auto, i forni intelligenti, i robot sono tutte macchine a stati
- Disegnare alla lavagna il "diagramma di stato" prima di scrivere il codice

**Sicurezza:**
- Rele' AC 230V -> mai con i ragazzi senza supervisione
- Rele' DC con motori: diodo flyback OBBLIGATORIO
- Cooldown evita usura, ma non sostituisce limiti elettrici (correnti max contatti)

## Link L1 (raw RAG queries)

- "state machine Arduino enum switch"
- "isteresi rele temperatura"
- "millis senza delay loop"
