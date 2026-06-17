/**
 * Friendly Error Translator — GCC errors → italiano kid-friendly
 * Estratto da CodeEditorCM6.jsx per condivisione con ScratchCompileBar.
 * © Andrea Marro — 31/03/2026
 */

const FRIENDLY_ERRORS = [
  [/expected ';' before/i, () => 'Hai dimenticato il punto e virgola (;) alla fine della riga!'],
  [/expected '\)' before/i, () => 'Manca una parentesi di chiusura ) — controlla che ogni ( abbia la sua )'],
  [/expected '\}' before/i, () => 'Manca una parentesi graffa di chiusura } — controlla le parentesi graffe!'],
  [/expected '([^']+)' before/i, (m) => `Manca "${m[1]}" — controlla di aver chiuso tutte le parentesi e i punti e virgola!`],
  [/'([^']+)' was not declared in this scope/i, (m) => `"${m[1]}" non esiste! Controlla di averlo scritto bene o di averlo creato prima.`],
  [/expected unqualified-id/i, () => 'C\'è qualcosa di strano all\'inizio della riga. Controlla di non aver scritto caratteri extra.'],
  [/stray '\\([^']+)' in program/i, () => 'C\'è un carattere strano nel codice. Forse hai copiato da un documento con caratteri speciali?'],
  [/no matching function for call to '([^']+)'/i, (m) => `La funzione "${m[1]}" non accetta questi parametri. Controlla quanti valori servono!`],
  [/too few arguments to function/i, () => 'Mancano dei valori nella funzione. Servono più numeri tra le parentesi!'],
  [/too many arguments to function/i, () => 'Hai messo troppi valori nella funzione. Togline qualcuno!'],
  [/invalid conversion from '([^']+)' to '([^']+)'/i, () => 'Stai usando un tipo di dato sbagliato. Controlla se serve un numero o un testo.'],
  [/cannot convert/i, () => 'I tipi di dato non corrispondono. Controlla cosa stai assegnando.'],
  [/redefinition of '([^']+)'/i, (m) => `"${m[1]}" è stato definito due volte! Rinomina uno dei due o cancellane uno.`],
  [/void value not ignored/i, () => 'Stai cercando di usare il risultato di una funzione che non restituisce nulla (void).'],
  [/control reaches end of non-void/i, () => 'La funzione deve restituire un valore (return) prima di finire!'],
  [/ISO C\+\+ forbids/i, () => 'Questa scrittura non è permessa in C++. Prova a riscrivere in modo diverso.'],
  [/lvalue required/i, () => 'Non puoi assegnare un valore a questa espressione. Controlla il lato sinistro del =.'],
  [/subscripted value is not an array/i, () => 'Stai usando le parentesi quadre [] su qualcosa che non è un array!'],
];

/**
 * Traduce errori GCC in italiano semplice per bambini 8-12 anni.
 * @param {string} gccError — errore raw dal compilatore
 * @returns {string} errore tradotto
 */
export function friendlyError(gccError) {
  if (!gccError) return gccError;
  const lines = gccError.split('\n');
  const result = [];
  for (const line of lines) {
    let matched = false;
    for (const [pattern, formatter] of FRIENDLY_ERRORS) {
      const m = line.match(pattern);
      if (m) {
        const lineNumMatch = line.match(/\.ino:(\d+):\d+:/);
        const prefix = lineNumMatch ? `Riga ${lineNumMatch[1]}: ` : '';
        result.push(prefix + formatter(m));
        matched = true;
        break;
      }
    }
    if (!matched && line.trim()) {
      result.push(line);
    }
  }
  return result.join('\n');
}
