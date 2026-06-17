# G11 FASE 5 — Teacher Dashboard Export PNRR

**Data**: 28/03/2026
**Obiettivo**: Export dati reali per rendicontazione PNRR
**Status**: COMPLETATO — build PASSA

---

## Cosa e' stato fatto

### 1. Export JSON per dirigente scolastico
- Bottone "Esporta JSON" nel tab "Progresso PNRR"
- Struttura dati:
  - Metadata: report name, data generazione
  - Classe: numero studenti, media progresso, esperimenti totali
  - Distribuzione: avanti/in pari/indietro/non iniziato
  - Per studente: nome, completati, totali, %, stato, dettaglio per volume, lista esperimenti

### 2. Export CSV per Excel
- Bottone "Esporta CSV" accanto al JSON
- Separatore `;` per compatibilita' Excel italiano
- BOM UTF-8 per encoding corretto
- Colonne: Studente, Completati, Totali, %, Stato, Vol1, Vol2, Vol3

### 3. Stampa (gia' esistente)
- Bottone "Stampa" gia' presente (handlePrint → window.print)
- Ora allineato visualmente con i nuovi bottoni export

## Dati REALI
- I dati esportati sono REALI da localStorage via studentService
- Se non ci sono dati, il tab mostra "Nessun dato disponibile"
- ZERO dati finti, ZERO mock

## Build
- PASSA (46s — piu' lento perche' obfuscator + chunk changes)
- PWA precache: 22 entries (7,431 KB) — sotto target 8 MB

## File modificati
- `src/components/teacher/TeacherDashboard.jsx` — +60 LOC (handleExportJSON, handleExportCSV, bottoni)
