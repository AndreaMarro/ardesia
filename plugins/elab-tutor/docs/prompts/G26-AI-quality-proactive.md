# G26 — AI QUALITY + UNLIM PROATTIVO

## OBIETTIVO: UNLIM prepara la lezione automaticamente. Contesto classe nel prompt.

## TASK
1. UNLIM proattivo al caricamento esperimento (3h)
   - Quando si apre un esperimento, UNLIM dice automaticamente il teacher_briefing
   - Leggere lesson path JSON → estrarre fase PREPARA → mostrare come overlay
   - Esempio: "Oggi il pulsante! Servono: pulsante, LED, resistore. Premi ▶ quando sei pronta."
   - Max 2 frasi. Non nella chat — come overlay contestuale (UnlimOverlay)

2. Contesto classe completo nel prompt AI (2h)
   - Iniettare buildClassContext() nel system prompt di ogni richiesta
   - Il prompt deve includere: sessioni passate, concetti appresi, errori frequenti, volume attivo
   - UNLIM deve poter dire: "L'ultima volta abbiamo visto la polarita'. Oggi la corrente."

3. Dedup proactive events atomico (2h)
   - Generare eventId nel simulatore (non hash timestamp)
   - Usare eventId per dedup, non msgKey
   - 1 evento per tipo per esperimento (non per tick)

4. TTS voce: wait-for-readiness (1h)
   - Sostituire setTimeout 50ms con voiceschanged event
   - Margine 200ms dopo voiceschanged

5. Risposte proattive brevi (1h)
   - Diagnosi proattive (short-circuit, burnout): max 1 frase
   - "Attenzione! Il LED e' al contrario — gira il piedino lungo verso il +."
   - Non serve spiegazione lunga — il docente capisce al volo

## VERIFICA
- Browser: apri esperimento → overlay PREPARA appare in <1s (non dopo 15s di AI)
- Browser: chiedere "cosa abbiamo fatto la volta scorsa?" → UNLIM risponde con contesto
- Proactive: cortocircuito → 1 messaggio (non 3)
- TTS: prima risposta parlata (non muta su primo caricamento)
