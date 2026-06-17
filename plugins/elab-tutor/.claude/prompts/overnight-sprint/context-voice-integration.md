# Voice Integration Design — ELAB Tutor LIM

## Obiettivo

Integrare in ELAB Tutor una voce quasi real-time, gratuita, che sulla LIM sappia:
1. Ascoltare domande sul circuito
2. Guidare i passaggi dell'esperimento
3. Eseguire comandi sul simulatore
4. Adattare la spiegazione
5. Fare domande alla classe
6. Riassumere cio che e successo
7. Gestire il ritmo della lezione

NON e assistente totale. E guida vocale didattica legata ai volumi e al simulatore.

## Architettura Pipeline

```
microfono LIM
    |
    v
VAD (Silero VAD / WebRTC VAD)
    |  -- rileva inizio/fine parlato
    v
STT (whisper.cpp / faster-whisper)
    |  -- trascrive audio -> testo
    v
Nanobot / DeepSeek Chat/R1
    |  -- interpreta intento
    |  -- genera risposta + action tags
    v
Comando simulatore + Risposta testuale
    |
    v
Piper TTS
    |  -- converte testo -> voce
    v
Speaker LIM
```

## Valore Aggiunto

La forza non e la voce in se. E il collegamento a:
1. **Volumi** con esperimenti gia strutturati
2. **LIM** come punto centrale della lezione
3. **Simulatore** controllabile e interrogabile

La voce parla dentro un esperimento preciso, non nel vuoto.

## Stack Tecnico Gratuito

| Componente | Tool | Repo |
|-----------|------|------|
| STT | whisper.cpp | github.com/ggerganov/whisper.cpp |
| STT alt | faster-whisper | github.com/SYSTRAN/faster-whisper |
| VAD | Silero VAD | github.com/snakers4/silero-vad |
| VAD alt | WebRTC VAD | github.com/wiseman/py-webrtcvad |
| TTS | Piper | github.com/rhasspy/piper |
| AI | DeepSeek via Nanobot | gia in stack |
| Wake word | Porcupine | github.com/Picovoice/porcupine |
| Noise | RNNoise | github.com/xiph/rnnoise |
| Echo | WebRTC APM | WebRTC Audio Processing |

## Abilita Vocali (20 totali)

### Base (Fase 1 — priorita alta)
| # | Abilita | Input vocale | Output | Modulo |
|---|---------|-------------|--------|--------|
| 1 | Domanda circuito | "Perche il LED non si accende?" | Spiegazione + suggerimento | DeepSeek |
| 2 | Comando play/pause | "Avvia la simulazione" | [AZIONE:play] | Nanobot deterministic |
| 3 | Comando componente | "Aggiungi un LED rosso" | [AZIONE:addcomponent] | Nanobot circuit |
| 4 | Riassunto | "Riassumi questo esperimento" | Sintesi vocale | DeepSeek |

### Utili (Fase 2 — priorita media)
| # | Abilita | Input vocale | Output | Modulo |
|---|---------|-------------|--------|--------|
| 5 | Guida passaggio | "Iniziamo il passaggio 2" | buildStep advance | Nanobot |
| 6 | Spiega semplice | "Spiegalo piu semplice" | Riformulazione | DeepSeek |
| 7 | Spiega passo-passo | "Spiegalo passo passo" | Sequenza | DeepSeek |
| 8 | Ripeti | "Ripeti l'ultimo passaggio" | Replay | Nanobot |
| 9 | Errore tipico | "Qual e l'errore tipico?" | Spiegazione | DeepSeek |
| 10 | Carica esperimento | "Apri l'esperimento del semaforo" | [AZIONE:loadexp] | Nanobot |

### Avanzate (Fase 3 — priorita bassa)
| # | Abilita | Input vocale | Output | Modulo |
|---|---------|-------------|--------|--------|
| 11 | Domanda classe | "Cosa succede senza resistenza?" | Domanda aperta | DeepSeek |
| 12 | Quiz | "Fai un quiz su questo" | [AZIONE:quiz] | Nanobot |
| 13 | Ritmo lezione | "Fermiamoci un attimo" | Pausa simulazione | Nanobot |
| 14 | Verifica insieme | "Controlliamo il collegamento" | Highlight componente | Nanobot |
| 15 | Confronto | "Confronta con il volume" | Overlay reference | DeepSeek |
| 16 | Wake word | "ELAB, aiutami" | Attivazione ascolto | Porcupine |
| 17 | Adatta livello | "Troppo difficile" | Semplificazione auto | DeepSeek |
| 18 | Nota breadboard | "Prendi nota: R1 bruciata" | Annotazione salvata | Galileo |
| 19 | Vision vocale | "Guarda il mio circuito" | Screenshot + analisi | Gemini |
| 20 | Compila voce | "Compila il codice" | [AZIONE:compile] | Nanobot |

## Fasi Implementazione

### Fase 1 — Utile subito (1-2 settimane)
- whisper.cpp oppure faster-whisper
- Piper TTS con voce italiana
- DeepSeek via Nanobot
- 4 intenti base: domanda, comando, ripeti, riassumi
- Browser Web Audio API per cattura microfono

### Fase 2 — Molto migliore (2-3 settimane)
- Silero VAD per rilevamento voce
- Filtro rumore con RNNoise
- explain simple / explain step-by-step / explain short
- Streaming partial results

### Fase 3 — Forte davvero (1 mese)
- Domande alla classe
- Wake word "ELAB" con Porcupine
- Echo cancellation / AGC
- Micro-prompting sul contesto dell'esperimento
- Note breadboard visibili a Galileo

## Integrazione con Qwen

L'allenamento Qwen sara parallelo:
1. Dataset 500+ esempi ChatML (gia fatto in S75)
2. Qwen3-4B fine-tuned come pre-router
3. Router voce: STT output → Qwen routing → specialist
4. Specialist execution → TTS output

La voce usa lo STESSO routing di Galileo testuale.
