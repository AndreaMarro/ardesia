# G14 Chain of Verification — 3 Agenti

**Data**: 28/03/2026

---

## Agente 1: Prof.ssa Rossi (Insegnante)

> "Arrivo in classe, accendo la LIM, apro ELAB Tutor. Vedo il simulatore con il circuito del LED. In basso a destra c'e' il robottino. Clicco sul robot — appare una barra in basso con un microfono! Posso PARLARE! Premo il microfono e dico 'cos'e' un LED?'..."

> "Il robot mi risponde e — magia — la voce legge la risposta ad alta voce! Non devo piu' leggere io davanti a 25 ragazzini che si distraggono. Il fumetto appare sullo schermo e la voce lo legge. Posso guardare i ragazzi invece dello schermo."

> "Provo un comando: 'evidenzia il LED'. Il fumetto appare ACCANTO al LED nel circuito, con una freccia che punta al componente. I ragazzi vedono esattamente di cosa si parla. Questo e' il salto di qualita'."

> "C'e' anche un bottone per silenziare la voce (🔊) — utile se voglio leggere io o se la voce disturba."

> "Cosa manca: la voce a volte e' un po' robotica (e' la voce di sistema, non una voce naturale). E quando faccio una domanda di conoscenza tipo 'cos'e' un LED?', la risposta e' un po' troppo lunga e formale — i bambini non capirebbero 'dispositivo a semiconduttore'. Vorrei risposte piu' corte e semplici."

**Score Prof.ssa Rossi: 7.5/10** (era 7.0)
- +0.5 TTS: la voce legge — non devo piu' leggere io
- +0.3 STT: posso parlare al robot
- -0.2 voce robotica (non naturale)
- -0.1 risposte a volte troppo lunghe/formali

---

## Agente 2: Bug Hunter (Cacciatore di Regressioni)

| Test | Risultato | Note |
|------|-----------|------|
| Build exit 0 | ✅ | 25s |
| PWA entries | ✅ | 19 (invariato) |
| Bundle size | ✅ | 4,137 KB (+15 KB vs G13, dovuto a useSTT) |
| useTTS integrato | ✅ | 3 punti di integrazione |
| useSTT creato | ✅ | 120 LOC, SpeechRecognition API |
| Mic button render | ✅ | Solo se browser supporta |
| Mute toggle render | ✅ | Solo se TTS supportato |
| Mute persistente | ✅ | localStorage |
| Galileo risponde | ✅ | 3 domande testate |
| Messaggio contestuale | ✅ | Accanto al LED |
| Auto-dismiss | ✅ | 12s per risposte, 6s per contestuali |
| Click dismiss + stop TTS | ✅ | |
| Console errors reali | ✅ | 0 (solo warmup ping benigno) |

**Regressioni trovate: 0**

**Rischi potenziali:**
- P2: `speakIfEnabled` nelle dependency array — potrebbe causare re-render extra (minimizzato da useCallback)
- P2: STT `onResult` usa ref pattern per evitare dipendenza circolare — corretto ma indiretto
- P3: Toggle mute (bottom:100px) potrebbe sovrapporsi alla chat UNLIM espansa
- P3: Firefox non supporta SpeechRecognition — mic non appare (fallback corretto, 0% copertura Firefox)
- P3: Safari SpeechRecognition supporto parziale, richiede prefisso webkit

---

## Agente 3: Vision Check (Confronto con UNLIM-VISION-COMPLETE.md)

| Aspetto Vision | Target | G13 | G14 | Delta |
|----------------|--------|-----|-----|-------|
| Mascotte = robot animato | Robot con occhi brillanti | Robot reale PNG, 3 anim | **Invariato** | = |
| Messaggi posizionati | Accanto al componente | Contestuali con freccia | **Invariato + voce** | = |
| Messaggi auto-dismiss | 4-6 secondi | 6s default | **12s risposte, 6s eventi** | ✅ |
| Click mascotte = chat | Apre input | ✅ | ✅ | = |
| Voce TTS | UNLIM legge ad alta voce | ❌ | **✅ Web Speech API** | **+1.5** |
| Voce STT | Prof parla al robot | ❌ | **✅ SpeechRecognition** | **+1.0** |
| Mute/unmute | Toggle facile | ❌ | **✅ Persistente** | **+0.3** |
| Galileo E2E | Risponde + azioni | Non testato | **✅ 3 test, 4.3/5** | **+0.5** |
| Sessioni salvate | Persistenza | ❌ | ❌ | G16 |
| Report fumetto | Stile narrativo | ❌ | ❌ | G17 |

**Score UNLIM Vision: 5.5 → 6.5** (+1.0) ✅ TARGET RAGGIUNTO

**Cosa manca per 7.0+:**
1. Sessioni salvate (contesto classe) — G16
2. Report PDF fumetto — G17
3. Tono risposte piu' adatto a 10-14 anni (prompt tuning)
4. Voce piu' naturale (Google Cloud TTS o ElevenLabs in futuro)

---

## Score Card G14

| Metrica | G13 | G14 | Target G18 |
|---------|-----|-----|-----------|
| Composito insegnante | 7.0 | **7.5** | 8.0+ |
| UNLIM vision | 5.5 | **6.5** ✅ | 6.5+ |
| Progressive Disclosure | 65% | 65% | 80% |
| LIM/iPad | 6.2 | 6.2 | 7.0+ |
| Build health | ✅ | ✅ | ✅ |
| Regressioni | 0 | 0 | 0 |
| TTS funzionante | ❌ | **✅** | ✅ |
| STT funzionante | ❌ | **✅** | ✅ |
| Galileo E2E | ❌ | **✅** | ✅ |

## Principio Zero Gate

> "Tutto cio' che fai deve cambiare l'esperienza dell'insegnante."

- ✅ TTS: L'insegnante non deve piu' LEGGERE le risposte — UNLIM le legge
- ✅ STT: L'insegnante puo' PARLARE al robot — non deve digitare
- ✅ Mute: Un tap per silenziare se serve
- ✅ Galileo: Funziona davvero, risponde in <5s, azioni funzionano
- ✅ Messaggio contestuale + voce: fumetto accanto al LED E viene letto

**PRINCIPIO ZERO: PASSA**
