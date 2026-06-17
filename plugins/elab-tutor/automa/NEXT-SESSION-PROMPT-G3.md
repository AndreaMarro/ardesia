# SESSIONE GIORNO 3 — UNLIM Mode

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 3 del piano 2 settimane per UNLIM Mode.

## STATO VERIFICATO (27/03/2026 ore 12:00)
- Build: ✅ PASSA (24s)
- Deploy: ✅ HTTP 200 su elabtutor.school
- Git: pulito, 0 uncommitted, ultimo commit 0251c20
- Nanobot: ✅ v5.5.0 (ma STALE — /gdpr-status mancante, risposte >60 parole)
- Brain V13: ✅ 2 modelli su VPS 72.60.129.50:11434
- Score: 0.946 (composite v3 — quasi saturo, inutile come metrica UX)
- Automa: IN PAUSA (decisione consapevole — produce infra, non UNLIM)
- Lesson paths: 1/67 (solo v1-cap6-esp1.json — IL TEMPLATE PERFETTO)
- Componenti UNLIM: 5 file JSX (connessi ma MAI testati end-to-end)

## CONTESTO CRITICO — NON SALTARE
- Giovanni Fagherazzi = ex Global Sales Director di ARDUINO
- Omaric Elettronica = filiera hardware Arduino (Strambino/TO)
- PNRR deadline 30/06/2026 — 95 giorni
- Teacher Dashboard MVP OBBLIGATORIA per vendere
- Nessun competitor ha AI dentro il simulatore. UNLIM sarebbe il PRIMO.
- Andrea è l'UNICO sviluppatore. La reputazione dipende da questo.

## COSA ESISTE GIÀ (NON RIFARE)
### Componenti UNLIM (Giorno 1-2)
- `src/components/unlim/UnlimWrapper.jsx` — wrapper con handleSend→sendChat(), AbortController, experimentContext
- `src/components/unlim/UnlimMascot.jsx` — mascotte con stati idle/active/speaking
- `src/components/unlim/UnlimOverlay.jsx` — messaggi contestuali con fade, coda, posizioni
- `src/components/unlim/UnlimInputBar.jsx` — barra input testo + mic + invio (font 24px LIM)
- `src/components/unlim/UnlimModeSwitch.jsx` — toggle UNLIM/Classic con localStorage
- `src/data/lesson-paths/v1-cap6-esp1.json` — TEMPLATE PERFETTO (5 fasi, vocabolario, analogie, intent)
- `src/data/lesson-paths/index.js` — registry getLessonPath(), hasLessonPath()

### LessonPathPanel (connesso)
- `src/components/simulator/panels/LessonPathPanel.jsx` — 668 LOC
- RichLessonPath: renderizza 5 fasi se JSON ricco esiste, fallback generico altrimenti
- "Monta il circuito per me" → usa loadExperiment(id) (FIX G2, non più addComponent broken)
- Progress bar visiva: 📋→🔧→❓→👀→✅

### API e servizi
- `src/services/api.js` — sendChat() con fallback chain: local→nanobot→webhook
- `src/services/simulator-api.js` — __ELAB_API con 20+ metodi (loadExperiment, addComponent, addWire, play, etc.)
- `nanobot/server.py` — 18 endpoints, 5 providers, Mistral EU configurato

### Prodotto esistente (intatto)
- Simulatore: CircuitSolver MNA/KCL + AVRBridge + 21 componenti SVG
- 67 esperimenti (3 volumi: 38+18+11)
- 4 giochi didattici
- Scratch/Blockly + compilatore Arduino
- TeacherDashboard (1774 LOC, esiste ma per docenti, non per dirigenti)
- Auth + License + Landing PNRR

### Fix UX già applicati (Fase 0 — NON RIFARE)
- [x] Dashboard/Admin nascosto (solo isDocente/isAdmin)
- [x] Chat minimizzata + "Sono qui" eliminato
- [x] Google Fonts self-hosted (GDPR)
- [x] Toggle Modalità Guida eliminato (guida = il prodotto)
- [x] Redirect homepage eliminato

## BUGS NOTI DA SESSIONI PRECEDENTI
- [x] Monta il circuito: addComponent broken → FIXATO con loadExperiment (G2)
- [x] Race condition mascotState bloccato su 'speaking' → FIXATO (G1)
- [x] Memory leak setTimeout in UnlimOverlay → FIXATO (G1)
- [x] Stale closure lessonPath in handleSend → FIXATO (G1)
- [x] __ELAB_API retry 800ms se non pronto al mount → FIXATO (G1)
- [x] isLoading non passato a InputBar → FIXATO (G1)
- [ ] Nanobot STALE su Render — /gdpr-status mancante, risposte >60 parole
- [ ] Lime #7CB342 su bianco: contrasto 2.50:1 (WCAG AA richiede 4.5:1)
- [ ] 461 bottoni senza aria-label
- [ ] 1856 inline styles (0 design system)
- [ ] Bundle ElabTutorV4 = 1107 KB (sopra 1000 KB warning)
- [ ] bus-top naming in JSON da verificare vs breadboardSnap.js pin IDs

## QUALITY AUDIT NUMERI (G2 — verificati)
| Metrica | Valore | Target |
|---------|--------|--------|
| Font < 14px | 64 (23 critici) | 0 |
| Touch < 44px | 6 minHeight | 0 |
| console.log | 20 | 0 |
| Inline styles | 1856 | < 100 |
| CSS module imports | 4 | > 50 |
| Buttons senza aria | 461 | 0 |
| Lime/bianco contrasto | 2.50:1 | 4.5:1 |
| Navy/bianco contrasto | 8.42:1 | 4.5:1 ✅ |
| LOC totali | 89,754 | — |
| File JSX/JS | 193 | — |
| Componenti React | 126 | — |

## OBIETTIVI GIORNO 3 — CODICE, NON DOCUMENTI

### P0: Generare 2 percorsi lezione aggiuntivi
- **v1-cap6-esp2.json** "LED senza resistore" — usa v1-cap6-esp1.json come template
- **v1-cap7-esp1.json** "Il resistore protegge il LED"
- Verificare vocabolario contro curriculum YAML (forbidden/allowed per capitolo)
- Verificare che LessonPathPanel li renderizzi (import in index.js)
- Da 1 a 3 percorsi = valida il pattern per l'automa

### P0: Test end-to-end nel browser
- Usare Claude Preview (MCP) per testare il sito live
- UNLIM switch → mascotte → input → overlay risposta
- Caricare v1-cap6-esp1 → LessonPathPanel mostra 5 fasi ricche
- "Monta il circuito per me" → esperimento si carica
- Screenshot + annotazioni su cosa funziona/non funziona

### P1: Fix contrasto Lime su bianco
- Lime #7CB342 su bianco = 2.50:1 → FAIL WCAG AA
- Opzione A: scurire Lime a ~#5A8A2A (contrast 4.5:1+)
- Opzione B: usare Lime solo su sfondo scuro, mai su bianco
- Verificare TUTTI gli usi di #7CB342 su sfondo chiaro

### P1: Deploy nanobot su Render
- Il nanobot live non ha /gdpr-status (404)
- Serve push al repo elab-galileo-nanobot separato
- Verificare: /health, /gdpr-status, test 3 domande brevità (≤60 parole)

### P2: Generare altri 2-4 percorsi lezione (se tempo)
- v1-cap7-esp2, v1-cap7-esp3, v1-cap8-esp1, v1-cap8-esp2
- L'obiettivo è avere 5-7 percorsi per validare il pattern completo

## FILE DA LEGGERE (in ordine di priorità)

### A. Componenti da testare/modificare
1. src/components/unlim/UnlimWrapper.jsx
2. src/components/unlim/UnlimOverlay.jsx
3. src/components/unlim/UnlimMascot.jsx
4. src/components/unlim/UnlimInputBar.jsx
5. src/components/unlim/UnlimModeSwitch.jsx
6. src/components/simulator/panels/LessonPathPanel.jsx
7. src/data/lesson-paths/v1-cap6-esp1.json — IL TEMPLATE
8. src/data/lesson-paths/index.js

### B. API e dati
9. src/services/api.js (riga 517: sendChat)
10. src/services/simulator-api.js (loadExperiment, addComponent)
11. src/data/experiments-vol1.js (v1-cap6-esp1, v1-cap6-esp2, v1-cap7-esp1)
12. src/data/curriculumData.js (vocabolario per capitolo)

### C. Contesto immutabile
13. automa/context/PRODUCT-VISION.md
14. automa/context/UNLIM-BRAIN-DESIGN.md
15. automa/context/teacher-principles.md
16. automa/context/volume-path.md

### D. Handoff
17. automa/SESSION-HANDOFF-20260327-G2.md
18. automa/RESOCONTO-SESSIONE-27MARZO-G1.md

## REGOLE
1. CODICE PRIMA DI DOCUMENTI — ogni sessione deve produrre file .jsx/.json/.js
2. Non toccare CircuitSolver, AVRBridge, evaluate.py, checks.py
3. Build DEVE passare dopo ogni modifica
4. Deploy Vercel dopo ogni gruppo di fix significativo
5. Test: "La Prof.ssa Rossi lo capirebbe in 5 secondi?"
6. Giovanni Fagherazzi è l'ex Global Sales Director di Arduino — il prodotto deve essere all'altezza
7. PNRR deadline 30/06/2026 — ogni giorno conta
8. NON rileggere i 43 file del G1 — il resoconto è completo
9. MASSIMA ONESTÀ — se qualcosa non funziona, dillo
10. Committi e pusha spesso

## ANTI-PATTERN DA EVITARE
- ❌ Spendere >30min su audit/analisi senza scrivere codice
- ❌ Lanciare agenti di ricerca prima di aver implementato qualcosa
- ❌ Riscrivere componenti che funzionano già
- ❌ Promettere cose non verificate
- ❌ "Un altro audit prima di iniziare"

## PIANO
1. Leggi handoff G2 + template v1-cap6-esp1.json (15 min)
2. Leggi experiments-vol1.js per v1-cap6-esp2 e v1-cap7-esp1 (10 min)
3. Genera v1-cap6-esp2.json + v1-cap7-esp1.json (1h)
4. Aggiorna index.js con i nuovi percorsi
5. Build + verifica
6. Test nel browser (Claude Preview se disponibile)
7. Fix contrasto Lime se serve
8. Deploy Vercel
9. CoV finale
10. Scrivi SESSION-HANDOFF per G4

## OUTPUT ATTESO
- 2-3 percorsi lezione nuovi (JSON)
- Test end-to-end documentato (cosa funziona, cosa no)
- Fix contrasto Lime (se impatta WCAG)
- Deploy aggiornato
- SESSION-HANDOFF per G4

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `npx vercel --prod --yes`
- Sito: https://www.elabtutor.school
- Nanobot: https://elab-galileo.onrender.com/health
- Brain: http://72.60.129.50:11434
- Palette: Navy #1E4D8C, Lime #7CB342
```
