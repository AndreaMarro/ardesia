# G28 — TEACHER DASHBOARD

## OBIETTIVO: Dashboard docente connessa ai progressi classe. Vendita PA richiede report.

## TASK
1. Vista progressi classe per esperimento (6h)
   - Tabella: esperimento | stato (completato/parziale/non fatto) | tempo | errori
   - Dati da: unlimMemory.js + useSessionTracker.js (localStorage)
   - Raggruppato per volume e capitolo
   - Colori: verde (completato), giallo (parziale), grigio (non fatto)

2. Integrazione con session data (4h)
   - Leggere tutte le sessioni salvate (getSavedSessions)
   - Aggregare: quanti esperimenti fatti, tempo totale, errori piu' comuni
   - Mostrare concetti appresi (da lesson path → session_save.concepts_covered)

3. Report classe stampabile (4h)
   - Bottone "Stampa report"
   - PDF/HTML con: data, classe, esperimenti fatti, tempo, punteggi quiz
   - Formato A4, logo ELAB, nome docente
   - Utile per il dirigente scolastico

4. Export CSV (2h)
   - Bottone "Esporta CSV"
   - Colonne: data, esperimento, durata, errori, quiz_score
   - Il docente lo apre in Excel per le valutazioni

## VERIFICA 8 STRATI CoV
1. Build & Test
2. Browser: navigare a dashboard → tabella visibile con dati reali
3. Browser: cliccare "Stampa report" → PDF generato
4. Browser: cliccare "Esporta CSV" → file scaricato
5. Dati: almeno 3 sessioni simulate per vedere i progressi
6. LIM 1024x768: dashboard leggibile
7. Code audit: nessun dato personale nel CSV (solo experimentId, non nomi studenti)
8. Prof.ssa Rossi: capisce i progressi della classe in 10 secondi?
