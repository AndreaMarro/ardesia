# S3 COV — E2E Playwright Audit
> Data: 2026-04-12
> Auditor: Claude Opus 4.6

## Risultato: 19/19 FAIL

### Spec 09 — Chapter Map Navigation (7 test)
| Test | Risultato | Causa |
|------|-----------|-------|
| ExperimentPicker shows 3 volume tabs | FAIL | `[role="tab"]` non esiste nella UI |
| Vol1 shows experiments grouped by chapters | FAIL | Nessun tab/dialog con capitoli |
| switching to Vol2 shows different chapters | FAIL | idem |
| switching to Vol3 shows Arduino chapters | FAIL | idem |
| search filters experiments across chapters | FAIL | `input[placeholder*="Cerca"]` non esiste |
| selecting experiment loads circuit in lavagna | FAIL | button "Accendi il tuo primo LED" hidden |
| progress counter shows correct format | FAIL | No `[role="dialog"]` picker |

### Spec 10 — Scratch/Blockly (5 test)
| Test | Risultato | Causa |
|------|-----------|-------|
| Scratch tab is visible for Vol3 | FAIL | No Scratch/Blockly tab visibile |
| Blockly workspace renders | FAIL | idem |
| Blockly workspace has ELAB categories | FAIL | idem |
| no console errors during Blockly load | FAIL | `logger.log is not a function` |
| Semaforo loads scratchXml | FAIL | No Vol3 tab |

### Spec 11 — Teacher Full Journey (7 test)
| Test | Risultato | Causa |
|------|-----------|-------|
| complete journey: landing to experiment | FAIL | No CTA "Accedi al Simulatore" |
| lavagna experiment picker: chapter navigation | FAIL | No picker dialog |
| search works across volumes | FAIL | No search input |
| UNLIM suggestion banner | FAIL | No picker dialog |
| experiment cards show metadata | FAIL | idem |
| progress counter updates correctly | FAIL | idem |
| modal accessibility: focus trap and escape | FAIL | dialog trovato ma aria-label="UNLIM" non "Scegli un esperimento" |

## Diagnosi

**Root cause**: I test E2E sono stati scritti per una UI che NON esiste.
La Lavagna attuale non ha:
- Tab `[role="tab"]` per Volume 1/2/3
- Dialog `[role="dialog"]` per experiment picker
- Input di ricerca con placeholder "Cerca"
- CTA "Accedi al Simulatore" sulla homepage

I test descrivono un'interfaccia immaginata, non quella reale.

## Bug reale trovato
- `logger.log is not a function` — errore console durante caricamento Blockly

## Azione necessaria
1. RISCRIVERE i 3 spec per la UI reale (serve screenshot Chrome per capire la struttura)
2. Fixare `logger.log is not a function`
3. Aggiungere `role="tab"` e `role="dialog"` ai componenti esistenti per accessibilita
