# G30 — TEST REALE + DEPLOY FINALE

## OBIETTIVO: Prodotto testato con docente reale. Deploy pre-PNRR.

## CONTESTO
Questa e' la sessione piu' importante. 15 minuti con un insegnante vero > 100 cicli automa.
Andrea contatta un insegnante e registra lo schermo.

## TASK PRE-TEST
1. Preparare checklist per il docente (1h)
   - "Apri elabtutor.school"
   - "Scegli il Volume 1"
   - "Segui il percorso lezione"
   - "Tocca la mascotte UNLIM e chiedi qualcosa"
   - "Prova a cambiare esperimento"
   - "Prova Modalita' Inventore"
   - Non dare istruzioni — osserva dove si blocca

2. Preparare ambiente test (0.5h)
   - Clear localStorage del browser test
   - Vercel deploy aggiornato
   - Nanobot attivo e responsive
   - Screen recording attivo

## TASK POST-TEST
3. Analizzare video (2h)
   - Dove si e' bloccato il docente?
   - Cosa non ha capito?
   - Cosa ha provato a fare che non funzionava?
   - Quanto tempo per il primo esperimento?
   - Ha usato UNLIM? Come?
   - Ha capito le 3 modalita'?

4. Fix critici emersi dal test (4h)
   - Top 3 problemi dal video → fix immediato
   - Build + test + deploy

5. Deploy finale (1h)
   - npm run build && npx vercel --prod --yes
   - Verificare sito live

6. Report finale ONESTO (2h)
   - Score card aggiornata per ogni area
   - Cosa funziona DAVVERO (verificato con utente reale)
   - Cosa NON funziona (verificato con utente reale)
   - Gap rispetto al Principio Zero
   - Cosa serve per le prossime 10 sessioni

## VERIFICA
- Video del test: almeno 15 minuti
- 3 fix dal video implementati
- Deploy live verificato
- Report in .team-status/QUALITY-AUDIT-G30-FINAL.md

## LA DOMANDA FINALE
Dopo 30 sessioni:
- La Prof.ssa Rossi arriva alla LIM e spiega PER MAGIA?
- Risposta onesta. Non quello che vogliamo sentire.
