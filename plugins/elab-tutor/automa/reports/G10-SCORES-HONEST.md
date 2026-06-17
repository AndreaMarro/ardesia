# G10 Scores — Brutalmente Onesti

**Data**: 28/03/2026
**Principio**: se fa schifo, lo dico. Se e' buono, dico quanto.

---

## PDR 16 Aspetti — Post-G10

| # | Aspetto | Pre-G10 | Post-G10 | Delta | Note |
|---|---------|---------|----------|-------|------|
| 1 | Simulatore funzionalita' | 10.0 | 10.0 | 0 | Zero regressioni. 5/5 esperimenti PASS in browser. |
| 2 | Simulatore estetica | 8.5 | 8.5 | 0 | Lime piu' scuro ma esteticamente OK. 248 borderColor errors ancora nel gestionale admin. |
| 3 | iPad + LIM | 8.8 | 8.8 | 0 | Non toccato. I 13 bottoni <44px sulla homepage sono ancora li'. |
| 4 | Arduino/Scratch/C++ | 10.0 | 10.0 | 0 | Invariato, non toccato. |
| 5 | AI/Galileo | 10.0 | 10.0 | 0 | Invariato. Chat tracking aggiunto ma non testato con Galileo live. |
| 6 | Insegnante | 5.5 | **7.0** | **+1.5** | Dashboard ora con dati REALI. No demo. Tracking automatico. Ma: manca aggregazione multi-device, export/import, nomi studente. |
| 7 | Contenuti/Volumi | 9.5 | 9.5 | 0 | Invariato. 62 lesson paths confermati validi dall'audit. |
| 8 | Performance | 8.0 | 8.0 | 0 | Bundle +1 KB (+0.06%). Build +2s. Accettabile. |
| 9 | PWA/Offline | 7.0 | 7.0 | 0 | Non toccato. |
| 10 | Sicurezza/A11y | 9.2 | **9.5** | **+0.3** | Lime contrasto fixato: 4.10→5.12:1 WCAG AA. borderColor fix homepage. |
| 11 | Design/UX | 8.0 | 8.0 | 0 | Non toccato. |
| 12 | i18n | 0 | 0 | 0 | Zero. Solo italiano. |
| 13 | Business/Mercato | 1 | 1 | 0 | Non toccato. |
| 14 | Ricerca continua | 3 | 3 | 0 | Non toccato (Fase 6 saltata per priorita'). |
| 15 | Sistemi locali | 2 | 2 | 0 | Non toccato. |
| 16 | Cluster scuola | 0 | 0 | 0 | Futuro. |

### Media pesata
- **Pre-G10**: ~7.5/10
- **Post-G10**: ~7.7/10
- **Delta**: +0.2 (piccolo ma su aspetti CRITICI per la vendita)

---

## Cosa G10 ha DAVVERO migliorato

1. **Il prodotto non mente piu'** — Teacher Dashboard mostra dati reali, zero fake
2. **Il tracking funziona** — ogni esperimento aperto, compilazione, chat viene registrata
3. **WCAG AA Lime** — il colore verde ora passa il test di accessibilita'
4. **borderColor homepage** — 1 fix specifico, il resto e' admin (non utente)

## Cosa G10 NON ha fatto (onesta')

1. **Fase 4 saltata** — nessuna simulazione UX insegnante
2. **Fase 6 saltata** — nessuna ricerca innovazione/marketing/tecnica
3. **borderColor admin** — 248 errori console ancora presenti (modulo gestionale)
4. **Touch targets** — 13 bottoni homepage + 25 bottoni admin ancora <44px
5. **Galileo non testato live** — il tracking e' wired ma non verificato con AI attiva
6. **Giochi non tracciati** — CircuitDetective, PredictObserveExplain non chiamano logGameResult

## Giudizio complessivo

Il G9B report diceva: "Fase 2+3 sono le uniche critiche. Meglio 2 fasi fatte bene che 8 fatte male."

**Risultato**: Fase 2+3 fatte bene. Il prodotto e' passato da "dashboard con dati finti" a "dashboard con dati reali dal simulatore". Questo e' il cambiamento che un dirigente scolastico nota: NON vede "Demo Mode", vede dati veri.

Non e' un +10, non e' un +5. E' un +1.5-2 su aspetto #6 (il piu' debole) e +0.3 su aspetto #10. Piccoli numeri, grande impatto sul posizionamento prodotto.
