# Task: Fix Galileo Pattern Matching in Checks

**Priorità**: ALTA (blocca valutazione corretta sistema)
**Tipo**: Bug Fix / Technical Debt
**Tempo stimato**: 15 minuti

## Problema
I check di Galileo falliscono con false negative. Il test cerca pattern esatti ma Galileo risponde con parametri:
- **Atteso**: `[AZIONE:loadexp]`  
- **Ricevuto**: `[AZIONE:loadexp:v1-cap6-primo-circuito]`  
- **Risultato**: FAIL anche se funziona correttamente

## Solution Strategy
1. Modificare `automa/checks.py` pattern matching da string equality a regex
2. Pattern robusto: `\[AZIONE:loadexp(?::[^\]]+)?\]` (parametri opzionali)
3. Testare altri tag che potrebbero avere stesso problema

## Tag da verificare
- `[AZIONE:loadexp]` → `[AZIONE:loadexp:v1-cap6-...]`
- `[AZIONE:addcomponent]` → parametri tipo/valore?  
- `[AZIONE:quiz]` → parametri specifici?
- `[INTENT:]` → classificazione intent

## Files da modificare
- `automa/checks.py` (linea ~84 pattern matching)
- Test anche manuale con `test_galileo()` per verifica

## CoV (Chain of Verification)
1. `npm run build` → OK
2. Check Galileo singoli → 10/10 PASS  
3. `evaluate_score()` → score migliorato
4. Test manuale LIM → caricamento esperimenti funziona

## Impact
- Score galileo_tag_accuracy: 90% → 100%
- Score composito: 0.9068 → ~0.92
- Fiducia sistema valutazione più accurata