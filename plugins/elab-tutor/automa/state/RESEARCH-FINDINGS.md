# Research Findings — 2026-04-09 17:25 (Ciclo 17)

## Topic: Google Classroom Integration — 3 opzioni, MVP in 2-4 ore

## Key Findings

### 1. Share to Classroom Button = MVP in 2-4 ore
Un bottone HTML/JS che condivide link ELAB come assignment in Google Classroom.
Zero OAuth, zero marketplace review, funziona subito. Elimina il gap competitivo #1.

### 2. Google Classroom NON supporta LTI (nessuna versione)
L'unica via e' la Classroom API o il Classroom Add-on. Non esiste standard.

### 3. Classroom Add-on richiede tier a pagamento Google
Solo scuole con Teaching and Learning Upgrade o Education Plus possono usare add-on.
Il Share Button funziona per TUTTI i tier (incluso il gratuito).

### 4. OAuth verification richiede 3-5 giorni lavorativi
Per usare la Classroom API (roster, grading) serve OAuth verified.
Per il bottone Share = NON serve OAuth.

### 5. Edlink offre unified API per 10+ LMS
Un'alternativa a integrare ogni piattaforma singolarmente.
Costo non pubblico. Da valutare se ELAB vuole multi-LMS.

## Azione Suggerita per Builder
- Implementare Share to Classroom button (2-4h, zero rischio)
- Il bottone va nella dashboard docente, accanto agli esperimenti

## Azione Suggerita per Andrea
- Creare Google Cloud Project per ELAB
- Registrare OAuth consent screen (anche se non serve subito per il bottone)
- Pianificare Classroom API per Fase 2 (Maggio)
