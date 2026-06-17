# Bug Hunt Report — 01:40 07/04/2026

## Bug Trovato: P0 GDPR — parentEmail in chiaro

**File**: src/services/gdprService.js linea 331
**Problema**: `parentEmail` (PII adulto associato a minore) salvata in localStorage senza crittografia
**Severita'**: P0 — violazione GDPR Art.5 + COPPA
**Fix**: Sostituito con `parentEmailHash` (SHA-256 troncato 12 hex chars)
**PR**: #20 su AndreaMarro/elabtutor

## Altre Aree Analizzate

| Area | Risultato |
|------|-----------|
| console.log/warn in services/ | PULITO (zero) |
| try/catch vuoti | 5 in CanvasTab.jsx (accettabili — pointer capture) |
| localStorage senza try/catch | PULITO (tutti protetti) |
| fetch senza timeout | PULITO (tutti con AbortSignal) |
| addEventListener senza cleanup | PULITO (tutti con removeEventListener) |
| setInterval senza clearInterval | PULITO (tutti con cleanup in useEffect return) |
| dangerouslySetInnerHTML | ZERO (SafeMarkdown usato) |
| eval() | ZERO |
| Memory leak potenziali | Nessuno nuovo trovato (fix G42 efficaci) |

## Score
- Test: 1442/1442 PASS (invariato)
- Build: PASS
- 1 bug P0 trovato e fixato con PR

## Prossimo ciclo
Cercare: race condition in useEffect con async, state update dopo unmount, 
chiavi localStorage senza prefisso elab_ (collision risk).
