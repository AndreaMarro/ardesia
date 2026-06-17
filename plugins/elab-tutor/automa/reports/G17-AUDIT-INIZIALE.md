# G17 Audit Iniziale — "IL FUMETTO"

**Data**: 28/03/2026
**Build**: PASSA (35.23s)
**PWA**: 19 entries (4,140 KB)
**Last deploy**: G14+debug su Vercel (G16 NON deployato)

## File Letti (Obbligatori)
1. CLAUDE.md — ✅
2. automa/STATE.md — ✅ (G16: sessioni salvate, contesto classe, welcome contestuale)
3. automa/reports/G16-COV-FINALE.md — ✅ (Score insegnante 7.8, UNLIM 7.5)
4. automa/context/UNLIM-VISION-COMPLETE.md — ✅ (sezione Report Fumetto letta)
5. automa/PIANO-2-SETTIMANE.md — ✅ (sezione G17 letta)
6. automa/handoff.md — ✅ (G16→G17 handoff)
7. src/hooks/useSessionTracker.js — ✅ (~241 LOC, structure: messages/actions/errors/summary)
8. src/services/classProfile.js — ✅ (~192 LOC, buildClassProfile/buildClassContext/getWelcomeMessage)

## Stato Pre-G17
| Metrica | Valore |
|---------|--------|
| Composito insegnante | 7.8/10 |
| UNLIM vision | 7.5/10 |
| Build | ✅ 35.23s |
| Bundle index | 711 KB |
| Sessioni salvate | ✅ |
| Contesto classe | ✅ |
| Welcome contestuale | ✅ |
| Voce TTS+STT | ✅ |
| Report PDF | ❌ (obiettivo G17) |
| Error boundary | ❌ (obiettivo G17) |
| Deploy G16 | ❌ |

## Struttura Dati Sessione (carburante per il report)
```
session = {
  id, experimentId, startTime, endTime,
  messages: [{ role, text, timestamp }],  // max 100
  actions: [{ type, detail, timestamp }], // max 200
  errors: [{ type, detail, timestamp }],  // max 50
  summary: string
}
```

## Piano G17
1. **FASE 1**: UnlimReport.jsx — HTML + CSS @media print (3-4h)
2. **FASE 2**: Demo end-to-end (2h)
3. **FASE 3**: Error boundary + 3 quick wins (1h)
4. **FASE 4**: CoV + Deploy Vercel (1-2h)

## Rischi
- jsPDF + react-pdf GIÀ nel bundle (1.5MB) — useremo HTML → Stampa → PDF (zero dipendenze extra)
- Mascotte PNG `/assets/mascot/logo-senza-sfondo.png` — usare inline nel report
- Style tag re-injected in UnlimMascot (keyframes nel JSX) — da fixare in FASE 3
