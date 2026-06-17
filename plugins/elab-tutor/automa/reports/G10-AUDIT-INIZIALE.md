# G10 Audit Iniziale — Score Card

**Data**: 28/03/2026
**3 agenti paralleli**: Quality Auditor, Simulator Verifier, Bug Hunter

---

## Score Card

| Area | Score | Dettaglio |
|------|-------|-----------|
| Simulatore funzionalita' | 10/10 | 5/5 esperimenti PASS, 67 registrati, JSON tutti validi |
| Font sizes | 7/10 | 5 violazioni <14px (admin/gestionale, non simulatore) |
| Touch targets | 4/10 | 25+ bottoni <44px nel modulo gestionale admin |
| WCAG AA contrasto | 6/10 | Lime #558B2F su bianco = 4.10:1 (FAIL 4.5:1) |
| Bundle size | 6/10 | ElabTutorV4 1,107KB (+10.7% soglia warning) |
| borderColor bugs | 2/10 | 50+ conflitti inline styles (admin/gestionale) |
| Dead code | 8/10 | Minimal, import tutti attivi |
| Bug critici | 10/10 | ZERO critical/high bugs trovati |
| Teacher Dashboard | 7/10 | 8 tab funzionali, dati ora reali (post Fase 3) |
| studentService | 8/10 | Hybrid localStorage+server, API completa |

**Overall Score pre-fix: 6.8/10**

---

## Top Issues da Fixare (Fase 5)

### CRITICO (da fare)
1. **borderColor/border conflict** — 50+ inline styles con shorthand+longhand misto
   - Localita': admin/gestionale module
   - Fix: rimuovere `borderColor` dove c'e' gia' `border`

2. **Lime #558B2F contrasto** — 4.10:1 su bianco, FAIL WCAG AA
   - Il valore era stato aggiornato da #7CB342 il 27/03/2026 PER migliorare il contrasto
   - Ma 4.10:1 e' ANCORA sotto 4.5:1 per testo normale
   - Fix: scurire a ~#4A7A25 (~5.0:1) o usare Lime solo come accento su background scuro

### ALTO (da fare se tempo)
3. **Touch targets admin** — 25+ bottoni <44px
   - Zona: GestionaleForm.jsx, GestionaleTable.jsx
   - Ma l'admin NON e' per bambini — priorita' piu' bassa

### NOTA
4. L'audit ha confermato che il simulatore core e' in ottima forma
5. I bug borderColor NON sono nel simulatore ma nell'admin gestionale
6. Zero regressioni post-G9
