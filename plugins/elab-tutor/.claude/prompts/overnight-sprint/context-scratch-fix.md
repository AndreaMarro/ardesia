# Scratch Generator Fix — Context Reference

## ROOT CAUSE (Sessione 113)

Il file `scratchGenerator.js` aveva SOLO generatori per blocchi custom ELAB (`arduino_variable_set`/`arduino_variable_get`), ma NESSUN generatore per i blocchi built-in di Blockly (`variables_set`/`variables_get`).

Quando un utente creava variabili dal toolbox standard di Blockly, il generatore non sapeva come convertirle in C++, producendo codice malformato.

### Esempio errore:
```cpp
// PRIMA (broken):
if (ledNum = 3)  // assignment, non comparison!

// DOPO (fixed):
if (ledNum == 3)  // comparison corretto
```

## FIX APPLICATO (Sessione 113)

### Generatori aggiunti (11 nuovi):
1. `variables_set` — dichiarazione + assegnamento con tracking `_declaredVars`
2. `variables_get` — lettura variabile con `getField('VAR').getText()`
3. `math_modulo` — operatore `%`
4. `math_constrain` — `constrain(value, low, high)`
5. `math_random_int` — `random(from, to + 1)`
6. `controls_flow_statements` — `break` / `continue`
7. `procedures_defnoreturn` — `void funcName() { ... }`
8. `procedures_defreturn` — `int funcName() { ... return val; }`
9. `procedures_callnoreturn` — `funcName();`
10. `procedures_callreturn` — `funcName()` (expression)
11. Reset `_declaredVars` in `arduino_base` (ogni nuova generazione parte pulita)

### File modificato:
`src/components/simulator/panels/scratchGenerator.js`

### Totale generatori ora: 41 (era 30)

## VERIFICA

Per testare che il fix funzioni:
1. Aprire un esperimento AVR (es. v3-cap6-blink)
2. Tab "Blocchi"
3. Creare variabile dal toolbox Variables
4. Usare `set` e `get` variabile
5. Verificare nel pannello "Codice Generato" che il C++ sia corretto
6. Compilare e verificare 0 errori
