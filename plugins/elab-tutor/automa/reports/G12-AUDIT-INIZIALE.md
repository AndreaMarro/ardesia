# G12 AUDIT INIZIALE — Numeri PRIMA

**Data**: 28/03/2026
**Sessione**: G12 "RESPIRA" — Progressive Disclosure
**Build**: PASSA (27.24s, PWA 19 entries / 4,118 KB)

---

## Toolbar (ControlBar.jsx)

### Bottoni primari desktop: 11 (+3 condizionali)
1. Hamburger (toggle sidebar)
2. Back (torna a lista)
3. Play/Pause (avvia/pausa simulazione)
4. Reset (azzera)
5. Wire Mode (collega fili)
6. Palette (componenti)
7. Code Editor (editor)
8. Lesson Path (lezione)
9. Quiz (condizionale: solo se hasQuiz)
10. Compile (compila codice)
11. Serial Monitor (monitor seriale)
12. Delete (condizionale: solo se componente selezionato)
13. Rotate (condizionale: solo se componente selezionato)
14. Properties (condizionale: solo se componente selezionato)

### UNLIM button: 1 (separato, bottom-right)

### Mobile overflow menu: 24 items
- Pannelli: Componenti, Editor, Lista Pezzi, Quiz
- Insegnante: Percorso Lezione, Appunti, Nota sul Circuito
- Strumenti: Collega Fili, Monitor Seriale, Cattura Immagine, Report PDF, Lavagna, Vista Elettroni
- Aiuto: Chiedi a UNLIM, Controlla Circuito, Suggerimenti, Cerca su YouTube, Scorciatoie, Guida Rapida
- Modifica: Annulla, Ripeti
- File: Salva Circuito, Carica Circuito, Ripristina Esperimento

**TOTALE interattivo toolbar: ~35 elementi**

---

## Tab (TutorLayout.jsx)

### Tab visibili: 5
1. 📖 manual — Manuale
2. ⚡ simulator — Simulatore
3. 🎮 detective — Giochi
4. ✏️ canvas — Lavagna
5. 📓 notebooks — Taccuini

### Tab condizionali: 4
- poe (Plan-Observe-Explain)
- reverse (Reverse engineering)
- review (Assessment)
- 1 additional conditional

**TOTALE tab: 9 (5 visibili + 4 condizionali)**

---

## fontSize < 14px
- **54 istanze** nel tutor/simulatore (da audit G11)
- Da verificare con grep nella FASE 4

---

## TARGET G12

| Metrica | PRIMA | DOPO (target) |
|---------|-------|---------------|
| Bottoni toolbar visibili | 11-14 | **3** |
| Mobile overflow items | 24 | organizzati in menu |
| Tab visibili | 5 | **0** (solo simulator default) |
| fontSize < 14px | 54 | **0** |
| Score LIM/iPad | 4.0 | **6.0** |

---

## Principio Zero Gate
"La Prof.ssa Rossi arriva alla LIM. Vede: breadboard grande, mascotte piccola, 3 bottoni. NIENT'ALTRO."

Oggi vede: 11+ bottoni, 5 tab, sidebar aperta. **FAIL.**
