# G29 — STABILITA' + POLISH

## OBIETTIVO: Score composito >= 8/10. Fix i bug rimasti, polish UX.

## TASK
1. Fix CircuitSolver bug potentiometro (4h)
   - Polarita' invertita: validare connessione breadboard
   - Testare: ruotare pot → tensione cambia correttamente

2. Fix CircuitSolver bug condensatore (2h)
   - Self-reference check: usare tolleranza 0.01V (non exact match)
   - Testare: circuito RC → scarica visibile

3. Session sync immediato su cambio esperimento (1h)
   - Chiamare syncWithBackend() quando l'esperimento cambia
   - Non aspettare l'intervallo 60s

4. Scroll lock chat + badge "nuovo messaggio" (2h)
   - Se l'utente ha scrollato su, NON auto-scroll a bottom
   - Mostrare badge "↓ Nuovo messaggio" in basso
   - Click badge → scroll a bottom

5. Rate limiting feedback visivo (1h)
   - Se 3+ messaggi in 6s: mostrare toast "Aspetta qualche secondo!"
   - Non silenzioso — l'utente deve capire PERCHE' non arriva risposta

6. Quality audit completo finale (2h)
   - Tutti gli strumenti: browser test, code grep, console check
   - Score card aggiornata per ogni area
   - Lista onesta di cosa NON funziona ancora

## VERIFICA 8 STRATI CoV
1. Build & Test (911+ test)
2. Browser: pot ruota → tensione cambia (non bug)
3. Browser: RC circuit → scarica visibile
4. Browser: scroll up in chat → nuovo messaggio non sposta
5. Browser: 4 messaggi rapidi → toast "aspetta"
6. Console: 0 errori, 0 warning anomali
7. LIM 1024x768: tutto funzionale
8. Prof.ssa Rossi: usa il prodotto per 5 minuti senza intoppi?
