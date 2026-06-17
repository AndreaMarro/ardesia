---
id: debouncer-hardware
type: concept
title: "Debouncer hardware — RC + Schmitt"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [debounce, hardware, rc, schmitt, pulsante, vol-non-coperto]
---

## Definizione

Il **debouncer hardware** e' un circuito che pulisce i rimbalzi meccanici di un pulsante senza scrivere codice. Quando un pulsante si chiude, le lamelle metalliche vibrano per qualche millisecondo, generando una serie di impulsi falsi (5-50 ms tipici). Un filtro RC + Schmitt trigger elimina questi rimbalzi a livello elettrico.

## Schema base

```
+5V ---+
       |
   pulsante (normalmente aperto)
       |
       +--- nodo A
       |
       R 10k pull-down --- GND
       |
       C 100 nF --- GND  (filtro)
       |
       ingresso 74HC14 (Schmitt) o pin Arduino direttamente
```

Costante di tempo τ = R*C = 10k * 100 nF = 1 ms. I rimbalzi tipici (10-30 µs) vengono filtrati, mentre le pressioni reali (100+ ms) passano normalmente.

## Quando usarlo

- Pulsanti che vengono letti da interrupt (no spazio per debounce software)
- Sistemi real-time dove il delay del debounce software e' inaccettabile
- Quando si vuole semplificare il codice del docente

## Quando NON usarlo

- Per il kit ELAB base, il debounce **software** e' piu' che sufficiente (vedi `debounce.md`)
- Aggiunge componenti che non sono nel kit -> rompe Morfismo

## Confronto con software

| | Hardware | Software |
|---|---|---|
| Componenti | C 100 nF + R 10k + (74HC14) | nessuno |
| Codice | minimo | ~10 righe `millis()` |
| Latenza | ~1 ms | ~50 ms |
| Affidabilita' | altissima | dipende da `loop()` |
| Costo | qualche centesimo | 0 |

## Errori comuni

1. **R o C sbagliati** -> τ troppo basso non filtra, τ troppo alto perde pressioni veloci
2. **Pull-up vs pull-down confuso** -> in pull-up il filtro va sul "fronte di discesa"
3. **Senza Schmitt trigger** -> il fronte lento del condensatore puo' creare doppi trigger su pin senza isteresi (raro su Arduino, comune su altri MCU)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, quando premete un pulsante le lamelle vibrano e Arduino vede tante pressioni invece di una. Il debouncer hardware mette un piccolo "ammortizzatore elettrico" (un condensatore) che assorbe queste vibrazioni.

**Cosa fare:**
- Per il kit ELAB usate il debounce **software** (vedi `debounce.md` Vol. corrispondente)
- Mostrare opzionalmente l'oscilloscopio sul pulsante senza filtro vs con filtro -> visualizzazione potente
- Spiegare che e' una scelta del progettista: hardware (preciso, costa) vs software (gratis, lento)

**Sicurezza:**
- Condensatore 100 nF e' indistruttibile a 5V, nessun rischio
- Non superare 25V sui condensatori ceramici economici

## Link L1 (raw RAG queries)

- "debounce hardware RC filtro pulsante"
- "Schmitt 74HC14 anti-rimbalzo"
- "filtro passa-basso 100nF 10k pulsante"
