# G9 REPORT — Teacher Dashboard MVP per PNRR

**Data**: 28/03/2026
**Durata**: ~1 sessione
**Focus**: Teacher Dashboard MVP — Tab "Progresso PNRR"

---

## Deliverables

### 1. Tab "Progresso PNRR" aggiunto alla Teacher Dashboard
**File modificato**: `src/components/teacher/TeacherDashboard.jsx` (+~250 LOC)

#### Componenti implementati:
- **Header PNRR** con titolo formale "Report Progresso — PNRR Scuola 4.0", contatore studenti/esperimenti/media classe, pulsante "Stampa Report"
- **KPI Cards** (4): Studenti totali, Avanti (≥60%), In pari (25-59%), Indietro (<25%)
- **Tabella Progresso Individuale**: nome studente, totale completamento (X/62), progress bar per Volume 1/2/3 con colori dedicati (verde/arancio/rosso), stato pace (Avanti/In pari/Indietro/Non iniziato)
- **Matrice Completamento Esperimenti**: griglia students×experiments con header verticali rotati, checkmark per completati, filtro per volume, toggle mostra/nascondi, sticky column per nomi studenti, scroll orizzontale per 62 colonne
- **Legenda** con volumi e significato pace indicators
- **Note per la rendicontazione PNRR** — testo formale per dirigente scolastico

### 2. Curriculum Catalog
- Catalogo automatico dei 62 esperimenti estratto da LESSON_PATHS
- Organizzato per volume: Vol 1 (38), Vol 2 (18), Vol 3 (6)
- Cross-reference con `studentData.esperimenti[].experimentId` per tracciamento completamento

### 3. Print/PDF Support
- **File modificato**: `src/index.css` — @media print styles per .pnrr-report-area
- Nasconde bottoni e select in stampa
- `print-color-adjust: exact` per preservare colori progress bar
- `page-break-inside: avoid` per righe tabella

### 4. Bundle Impact
- TeacherDashboard ora in chunk separato: 174KB (include 62 lesson path JSON)
- Main index chunk ridotto da 1,708KB a 1,580KB (-128KB)
- **Net positive**: lesson path data caricati solo quando il docente apre la dashboard

---

## Verifiche

| Check | Risultato |
|-------|-----------|
| Build Exit 0 | ✅ PASS |
| Browser: tab visibile | ✅ "Progresso PNRR" nella tab bar |
| Browser: KPI cards | ✅ 4 card con numeri corretti |
| Browser: tabella progresso | ✅ Progress bar per volume, stato pace |
| Browser: matrice | ✅ 62 colonne, header verticali, checkmark/dot |
| Browser: toggle matrice | ✅ Mostra/Nascondi funziona |
| Browser: Stampa Report | ✅ Bottone presente, chiama window.print() |
| Console errors | ✅ Solo warning pre-esistenti (React 19 borderColor shorthand) |
| Deploy HTTP 200 | ✅ elab-builder.vercel.app |

---

## Impatto sul PDR

**Aspetto #6 "Insegnante — UTENTE REALE"**: da 3.5/10 → **5.5/10**

Il tab PNRR copre i 4 requisiti MVP documentati in `mercato-pnrr-mepa.md`:
1. ✅ Lista classe (nomi studenti) — era già in Giardino, ora anche in tabella PNRR
2. ✅ Quali esperimenti ha completato ogni studente — matrice completa 62 esperimenti
3. ✅ Chi è in difficoltà, chi è avanti — pace indicators con soglie chiare
4. ✅ Report esportabile — Stampa Report → PDF via browser print

**Perché non 10/10?** Manca:
- Test con dati reali (non solo demo/locale)
- Teacher onboarding flow (primo accesso)
- Pre-lesson preparation integrata con lesson paths
- Dashboard di uso reale in aula (real-world testing)
- Classe management migliorato (aggiunta studenti fluida)

---

## File Toccati
- `src/components/teacher/TeacherDashboard.jsx` — +1 import, +1 tab, +1 render block, +250 LOC (ProgressoPNRRTab + helpers)
- `src/index.css` — +18 righe print styles

## Regressioni
- **ZERO**: nessun file esistente modificato nel comportamento. Solo aggiunte.
