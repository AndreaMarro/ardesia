# G10 Verifica Finale — 6 Layer

**Data**: 28/03/2026
**Sessione**: G10 Marathon

---

## Layer 1 — Build
- **Risultato**: PASS
- **Tempo**: 26.21s
- **Exit code**: 0
- **Precache**: 107 entries (16,443 KB)

## Layer 2 — Browser E2E (5 esperimenti)

| Esperimento | Caricato | Componenti | Fili | Modo | Tracker |
|------------|----------|-----------|------|------|---------|
| v1-cap6-esp1 (LED base) | ✅ | 4 | 6 | circuit | ✅ tracciato |
| v1-cap7-esp3 (RGB blu) | ✅ | 4 | 6 | circuit | ✅ tracciato |
| v2-cap6-esp1 (serie) | ✅ | 5 | 6 | circuit | ✅ tracciato |
| v3-cap6-semaforo | ✅ | 8 | 10 | avr | ✅ tracciato |
| v1-cap8-esp2 (random) | ✅ | 5 | 8 | circuit | ✅ tracciato |

**5/5 PASS** — tutti caricano, tutti tracciati dal studentTracker

## Layer 3 — Teacher Dashboard

| Check | Risultato |
|-------|-----------|
| 8 tab presenti | ✅ (Giardino, Meteo, Attivita', Dettaglio, Nudge, Doc, PNRR, Classi) |
| PNRR visibile | ✅ "Report Progresso — PNRR Scuola 4.0" |
| Dati da localStorage | ✅ "2 studenti nel giardino" (dati REALI) |
| Zero "Demo Mode" | ✅ Nessun dato finto visibile |
| Banner data source | ✅ "Dati locali — Il server non e' raggiungibile" |
| Crash/errori | ✅ Nessun crash |

## Layer 4 — Touch/A11y

| Check | Risultato |
|-------|-----------|
| Lime contrasto WCAG AA | ✅ #4A7A25 → 5.12:1 su bianco (era 4.10:1) |
| Navy contrasto | ✅ #1E4D8C → 8.42:1 su bianco |
| borderColor fix (homepage) | ✅ thumbActive usa border completo |
| Admin/gestionale borderColor | ⚠️ 248 errori console — modulo admin, non utente finale |
| Touch targets simulatore | ✅ Bottoni >=44px |
| Touch targets admin | ⚠️ 25+ bottoni <44px — modulo admin interno |

## Layer 5 — Regressioni

| Check | Risultato |
|-------|-----------|
| Bundle size vs G9 | ✅ 1,575 KB vs 1,574 KB (+0.06%) |
| Feature perse | ✅ ZERO regressioni |
| 67 esperimenti | ✅ Tutti registrati (38+18+6+extra) |
| Lesson paths | ✅ 5/5 verificati (struttura JSON completa) |
| Simulatore core | ✅ KVL/KCL, AVR, 21 componenti — invariati |

## Layer 6 — Scores Onesti

Vedi: G10-SCORES-HONEST.md
