---
id: schmitt-trigger
type: concept
title: "Schmitt trigger — segnali puliti senza rimbalzi"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [schmitt, trigger, hysteresis, debounce, vol-non-coperto]
---

## Definizione

Lo **Schmitt trigger** e' un comparatore con due soglie diverse (alta e bassa). Quando il segnale sale oltre la soglia alta, l'uscita scatta a HIGH. Quando il segnale scende sotto la soglia bassa, l'uscita torna a LOW. La distanza tra le due soglie si chiama **isteresi** e serve a evitare oscillazioni quando il segnale e' rumoroso o varia lentamente.

## Perche' serve

Un comparatore semplice ha una sola soglia: se il segnale rumoroso oscilla intorno a quel valore, l'uscita va su/giu' migliaia di volte (rumore = rimbalzi). Lo Schmitt trigger ignora le piccole oscillazioni grazie all'isteresi.

## Esempi nel mondo reale

- **74HC14** -- IC con 6 inverter Schmitt, fondamentale per pulire segnali da pulsanti, sensori capacitivi, fronti lenti di RC
- **Pin Arduino** -- gli ingressi digitali hanno gia' uno Schmitt trigger interno (~1.7 V soglia bassa, ~3 V soglia alta su 5 V VCC)
- **Sensori industriali** -- fotocellule, encoder ottici emettono segnali "a fronte lento", lo Schmitt li rende squadrati

## Schema base con 74HC14

```
Segnale rumoroso ---+--- ingresso 74HC14 (1A)
                    |
                   --- (capacita' 100 nF a GND, RC filtro)
                    |
                   GND

Uscita 1Y -> pin Arduino digitale (gia' pulito)
```

## Esempio: pulsante con anti-rimbalzo hardware

```
Pulsante ---+--- 5V
            |
            +--- 10k resistore --- GND  (pull-down)
            |
           100 nF condensatore --- GND  (filtro RC)
            |
        ingresso 74HC14
            |
        uscita 74HC14 -> Arduino D2
```

Il filtro RC + Schmitt elimina i rimbalzi meccanici del pulsante senza scrivere codice di debounce.

## Errori comuni

1. **Confondere Schmitt con comparatore semplice** -> il comparatore senza isteresi rimbalza
2. **Non aggiungere RC** prima dello Schmitt -> il fronte e' troppo veloce, l'isteresi non serve
3. **Usare 74HC14 come buffer non invertente** -> e' invertente! Per non invertere serve doppio passaggio (74HC14 -> 74HC14)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, lo Schmitt trigger e' un "interruttore intelligente" con due soglie. E' come una porta che scatta solo quando spingete forte: piccole vibrazioni non la fanno aprire e chiudere a casaccio.

**Cosa fare:**
- NON introdurre questo concetto prima di aver spiegato `digitalRead()` e debounce software
- Per il kit ELAB, mostrare che il debounce si puo' fare in software (vedi `debounce.md`) o con condensatore + 74HC14 (avanzato)
- Lo Schmitt trigger non fa parte del kit ELAB, e' nozione propedeutica per Vol. successivi

**Sicurezza:**
- Alimentare il 74HC14 a 5 V, non oltre
- Disaccoppiare con condensatore 100 nF tra VCC e GND vicino all'IC

## Link L1 (raw RAG queries)

- "Schmitt trigger 74HC14 isteresi"
- "anti-rimbalzo hardware pulsante"
- "comparatore con isteresi Arduino"
