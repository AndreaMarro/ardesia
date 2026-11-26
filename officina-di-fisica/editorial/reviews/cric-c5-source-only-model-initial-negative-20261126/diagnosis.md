# Diagnosi dei negativi source-only

Il primo run si è fermato davvero sul rapporto del quadrato di due ampiezze, costruito per errore con divisione Python e risultato float 4.0. La comparazione esatta con 4 è fallita; nessuna tolleranza è stata aggiunta. Il costruttore è stato sostituito con Rational.

Il secondo run ha completato i 26 confronti simbolici ma si è fermato sulla frequenza in hertz. La diagnosi eseguita sotto mutex ha rilevato 27.777777777777775 di tipo float dal reciproco di una Quantity con magnitudine intera. Le altre sette quantità erano Fraction. Anche UnitRegistry(non_int_type=Fraction) non forza automaticamente ogni magnitudine intera al tipo Fraction.

La correzione locale costruisce tutte le magnitudini dimensionali come Fraction prima delle operazioni. Sono aggiunte guardie esplicite contro float sia nelle predizioni simboliche sia nei risultati Pint. Non si cambia alcuna legge, dato fisico, risultato atteso o tolleranza. Vecchi modelli, raw e ricevute restano verbatim. Nessuna candidata, chiave o opzione C5 è stata aperta.
