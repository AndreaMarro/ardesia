# 04 — Galileo Capabilities

> Ultimo aggiornamento: Sprint 1.1 (11/03/2026)

## Architettura

- **Frontend**: ElabTutorV4.jsx (2235 righe) — chat UI, action tag parser, vision handler
- **Backend**: nanobot v5.3.0 (FastAPI, Docker su Render)
- **Routing**: Multi-specialist YAML (circuit.yml, code.yml, scratch.yml, vision.yml, nanobot.yml)
- **AI Providers**: DeepSeek + Groq (text racing), Gemini (vision ONLY)

## Action Tags (26+)

Formato: `[AZIONE:comando:args]` — AZIONE sempre MAIUSCOLO, alla FINE della risposta.

| Tag | Descrizione |
|-----|-------------|
| `[AZIONE:play]` | Avvia simulazione |
| `[AZIONE:pause]` | Pausa simulazione |
| `[AZIONE:stop]` | Stop simulazione |
| `[AZIONE:clearall]` | Pulisci tutto dal circuito |
| `[AZIONE:addcomponent:type]` | Aggiungi componente |
| `[AZIONE:removecomponent:id]` | Rimuovi componente |
| `[AZIONE:addwire:from:to]` | Aggiungi filo |
| `[AZIONE:removewire:index]` | Rimuovi filo |
| `[AZIONE:compile]` | Compila codice |
| `[AZIONE:switcheditor:scratch]` | Passa a Scratch |
| `[AZIONE:switcheditor:arduino]` | Passa a Arduino C++ |
| `[AZIONE:openeditor]` | Apri editor codice |
| `[AZIONE:closeeditor]` | Chiudi editor codice |
| `[AZIONE:loadblocks]` | Carica blocchi Scratch |
| `[AZIONE:quiz]` | Avvia quiz |
| `[AZIONE:hint]` | Mostra suggerimento |
| `[AZIONE:loadexp:id]` | Carica esperimento |
| `[AZIONE:opentab:name]` | Apri tab (simulator/scratch/canvas/manual) |
| `[AZIONE:highlight:id]` | Evidenzia componente |
| `[AZIONE:setvalue:id:prop:val]` | Imposta proprieta componente |
| `[INTENT:{json}]` | Intent strutturato per PlacementEngine |

## Ralph Loop (Repair System)

Se l'utente chiede un'azione ma l'AI non include tag, il frontend fa una seconda richiesta silenziosa per recuperare i tag mancanti. Regex di detection:
```
/\b(carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|evidenzia|mostra|
mostrami|sposta|premi|gira|avvia|ferma|reset|compila|imposta|setta|cancella|pulisci|
interagisci)\b/i
```

## Vision

- Trigger: pulsante camera in chat O frase naturale ("guarda il mio circuito")
- Provider: Gemini 2.5 Flash (vision ONLY, mai per testo)
- `thinkingConfig: {thinkingBudget: 2048}` + `maxOutputTokens: 8192`
- Timeout: 60s per vision calls
- 429 retry: 3x con backoff (10s, 20s, 30s)
- Identita: "Sei Galileo, l'assistente AI di ELAB" — MAI rivela architettura interna
- Vision->Circuit chaining: se l'utente chiede "guarda e correggi", chains vision poi circuit specialist

## Deterministic Fallbacks

Pattern regex che non richiedono AI:
- clearall/reset/pulisci -> `[AZIONE:clearall]`
- highlight/evidenzia -> `[AZIONE:highlight:...]`
- compile/compila -> `[AZIONE:compile]`
- loadexp/carica esperimento -> `[AZIONE:loadexp:...]`
- opentab -> `[AZIONE:opentab:...]`

## Quiz Frontend Fallback

Se AI manca `[AZIONE:quiz]`, il frontend fa dispatch deterministico basato su keyword detection.

## Context Awareness

ElabTutorV4 invia a Galileo:
- Esperimento corrente (titolo, volume, modo)
- Componenti sul circuito (tipi, stati)
- Tab attiva
- Modalita editor (arduino/scratch)
- Ultime 5 interazioni utente
- Goal context (componenti attesi/mancanti) per action intent

## Problemi Noti

- Kimi/Moonshot ON STANDBY (401 auth — probabili chiavi consumer vs developer)
- circuitState non sanitizzato (P2-NAN-5)
- Messaggi sessione non sanitizzati (P2-NAN-7)
