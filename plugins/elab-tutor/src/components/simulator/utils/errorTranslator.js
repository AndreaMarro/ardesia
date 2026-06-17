// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/* Andrea Marro — 12/02/2026 */
/**
 * GCC Error Translator — Kid-friendly compilation error messages.
 * Target audience: bambini 8-12 anni. Keep language simple and encouraging.
 *
 * Extracted from NewElabSimulator.jsx
 *
 * Exports:
 *   translateCompilationErrors(errorText: string): string
 */

const GCC_FRIENDLY_ERRORS = [
  // Syntax / typos
  { pattern: /expected '([^']+)' before '([^']+)'/, translate: (m) => `Manca un "${m[1]}" prima di "${m[2]}". Controlla che le parentesi e i punti e virgola siano tutti al posto giusto!` },
  { pattern: /expected ';' before/, translate: () => `Hai dimenticato un punto e virgola (;) alla fine di una riga. Ogni istruzione deve finire con ;` },
  { pattern: /expected '\)' before/, translate: () => `Manca una parentesi di chiusura ). Controlla che ogni ( abbia la sua )!` },
  { pattern: /expected '\}' before/, translate: () => `Manca una graffa di chiusura }. Ogni { deve avere la sua }!` },
  { pattern: /expected declaration before '\}'/, translate: () => `C'è una graffa } di troppo, oppure manca del codice prima. Controlla le parentesi graffe!` },
  { pattern: /stray '\\(\d+)' in program/, translate: () => `C'è un carattere strano nel codice. Forse hai copiato del testo da un sito web? Prova a riscrivere la riga.` },
  // Undeclared / not found
  { pattern: /'([^']+)' was not declared in this scope/, translate: (m) => `Il nome "${m[1]}" non esiste. Controlla di averlo scritto bene (maiuscole e minuscole contano!) oppure di averlo creato prima di usarlo.` },
  { pattern: /'([^']+)' does not name a type/, translate: (m) => `"${m[1]}" non è un tipo conosciuto. Forse hai sbagliato a scrivere "int", "void", "String"... o manca un #include?` },
  { pattern: /use of undeclared identifier '([^']+)'/, translate: (m) => `Non conosco "${m[1]}". Hai creato questa variabile? Controlla di averla dichiarata con int, float, o String.` },
  // Function errors
  { pattern: /too few arguments to function '([^']+)'/, translate: (m) => `La funzione ${m[1]} ha bisogno di più valori tra le parentesi. Controlla quanti ne servono!` },
  { pattern: /too many arguments to function '([^']+)'/, translate: (m) => `Hai messo troppi valori nella funzione ${m[1]}. Togline qualcuno!` },
  { pattern: /no matching function for call to '([^']+)'/, translate: (m) => `La funzione "${m[1]}" non accetta questi valori. Controlla che i parametri siano del tipo giusto.` },
  { pattern: /'([^']+)' cannot be used as a function/, translate: (m) => `"${m[1]}" non è una funzione — non puoi usare le parentesi () dopo. Forse è una variabile?` },
  { pattern: /void value not ignored as it ought to be/, translate: () => `Stai cercando di salvare il risultato di una funzione che non restituisce nulla (void). Togli la parte "= ..." davanti.` },
  // Type errors
  { pattern: /invalid conversion from '([^']+)' to '([^']+)'/, translate: (m) => `Non puoi trasformare ${m[1]} in ${m[2]} automaticamente. Prova a usare il tipo giusto.` },
  { pattern: /cannot convert '([^']+)' to '([^']+)'/, translate: (m) => `Il tipo "${m[1]}" e "${m[2]}" non sono compatibili. Controlla che stai usando il tipo giusto.` },
  { pattern: /incompatible types in assignment/, translate: () => `Stai mettendo un valore del tipo sbagliato in una variabile. Per esempio, non puoi mettere testo in un numero intero.` },
  // Redefinition
  { pattern: /redefinition of '([^']+)'/, translate: (m) => `Hai creato "${m[1]}" due volte! Ogni variabile o funzione deve avere un nome unico.` },
  { pattern: /conflicting declaration/, translate: () => `Hai dichiarato la stessa cosa due volte con tipi diversi. Scegline uno solo!` },
  // Missing libraries
  { pattern: /No such file or directory.*#include/, translate: () => `Il file che stai cercando di includere con #include non esiste. Controlla il nome della libreria.` },
  { pattern: /([A-Za-z]+\.h): No such file/, translate: (m) => `La libreria "${m[1]}" non è disponibile. Le librerie supportate sono: Serial, tone, e le funzioni base di Arduino.` },
  // Linker errors
  { pattern: /undefined reference to '([^']+)'/, translate: (m) => `La funzione "${m[1]}" è stata usata ma non è stata scritta. Controlla di avere sia setup() che loop() nel tuo programma!` },
  { pattern: /multiple definition of '([^']+)'/, translate: (m) => `"${m[1]}" è stato definito più di una volta. Assicurati che ogni funzione sia scritta una sola volta.` },
  // Array errors
  { pattern: /array subscript is not an integer/, translate: () => `L'indice dell'array deve essere un numero intero. Non puoi usare un decimale (float) come indice!` },
  { pattern: /size of array '([^']+)' is not an integral constant/, translate: (m) => `La dimensione dell'array "${m[1]}" deve essere un numero fisso, non una variabile. Usa un numero diretto come int arr[10];` },
  // Assignment in condition (common beginner mistake)
  { pattern: /suggest parentheses around assignment used as truth value/, translate: () => `Hai scritto = (assegnazione) invece di == (confronto) dentro un if. Per confrontare usa ==, non =!` },
  // Division by zero
  { pattern: /division by zero/, translate: () => `Stai dividendo per zero! Controlla che il divisore non sia mai 0.` },
  // Return type mismatch
  { pattern: /return-statement with no value, in function returning '([^']+)'/, translate: (m) => `La funzione deve restituire un valore di tipo ${m[1]}, ma il tuo "return" è vuoto. Aggiungi un valore!` },
  { pattern: /control reaches end of non-void function/, translate: () => `La funzione dovrebbe restituire un valore con "return", ma non lo fa in tutti i casi. Aggiungi un return alla fine!` },
  // Comparison between different types
  { pattern: /comparison between signed and unsigned/, translate: () => `Stai confrontando un numero con segno e uno senza segno. Per evitare problemi, usa lo stesso tipo per entrambi.` },
  // Unused variable (warning)
  { pattern: /unused variable '([^']+)'/, translate: (m) => `La variabile "${m[1]}" è stata creata ma non usata. Puoi rimuoverla o usarla nel codice.` },
  // Narrowing conversion
  { pattern: /narrowing conversion/, translate: () => `Un numero viene convertito in un tipo più piccolo e potrebbe perdere precisione. Usa un cast esplicito se è intenzionale.` },
  // Missing setup/loop — most common beginner error
  { pattern: /undefined reference to 'main'/, translate: () => `Il tuo programma non ha le funzioni setup() e loop(). Ogni programma Arduino deve avere entrambe!` },
  { pattern: /undefined reference to 'setup'/, translate: () => `Manca la funzione setup()! Ogni programma Arduino inizia con void setup() { }` },
  { pattern: /undefined reference to 'loop'/, translate: () => `Manca la funzione loop()! Ogni programma Arduino ha bisogno di void loop() { }` },
  // Case sensitivity — kids often write pinmode instead of pinMode
  { pattern: /'pinmode' was not declared/, translate: () => `Hai scritto "pinmode" ma si scrive "pinMode" con la M maiuscola! In Arduino le maiuscole contano.` },
  { pattern: /'digitalwrite' was not declared/, translate: () => `Hai scritto "digitalwrite" ma si scrive "digitalWrite" con la W maiuscola!` },
  { pattern: /'digitalread' was not declared/, translate: () => `Hai scritto "digitalread" ma si scrive "digitalRead" con la R maiuscola!` },
  { pattern: /'analogwrite' was not declared/, translate: () => `Hai scritto "analogwrite" ma si scrive "analogWrite" con la W maiuscola!` },
  { pattern: /'analogread' was not declared/, translate: () => `Hai scritto "analogread" ma si scrive "analogRead" con la R maiuscola!` },
  { pattern: /'Serial' was not declared/, translate: () => `"Serial" deve avere la S maiuscola. E ricorda di aggiungere Serial.begin(9600) nel setup()!` },
  // Constant too large
  { pattern: /integer constant is too large/, translate: () => `Il numero che hai scritto è troppo grande. Per numeri grandi usa il tipo "long" invece di "int".` },
  // Unterminated string
  { pattern: /missing terminating " character/, translate: () => `Hai aperto le virgolette " ma non le hai chiuse. Ogni testo deve iniziare e finire con "` },
];

function translateGccError(line) {
  const msgMatch = line.match(/(?:error|errore):\s*(.+)/i);
  const msg = msgMatch ? msgMatch[1] : line;
  for (const rule of GCC_FRIENDLY_ERRORS) {
    const match = msg.match(rule.pattern);
    if (match) return rule.translate(match);
  }
  return null;
}

export function translateCompilationErrors(errorText) {
  if (!errorText) return errorText;
  const lines = errorText.split('\n');
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const locMatch = line.match(/\.ino:(\d+):(\d+):\s*(error|warning|errore|avviso)/i);
    const friendly = translateGccError(line);
    if (locMatch && friendly) {
      result.push(`Riga ${locMatch[1]}: ${friendly}`);
    } else if (friendly) {
      result.push(friendly);
    } else if (locMatch) {
      const msgPart = line.replace(/^.*?:\s*(error|warning|errore|avviso):\s*/i, '').trim();
      const isWarning = /warning|avviso/i.test(locMatch[3]);
      const prefix = isWarning ? 'Attenzione' : 'Errore';
      result.push(`Riga ${locMatch[1]}: ${prefix} — controlla il codice a questa riga. (${msgPart})`);
    } else if (/error:|errore:/i.test(line)) {
      const msgPart = line.replace(/^.*?:\s*(error|errore):\s*/i, '').trim();
      result.push(`Errore nel codice: ${msgPart}. Ricontrolla le parentesi, i punti e virgola e i nomi delle funzioni!`);
    } else if (/warning:|avviso:/i.test(line)) {
      const msgPart = line.replace(/^.*?:\s*(warning|avviso):\s*/i, '').trim();
      result.push(`Attenzione: ${msgPart}`);
    }
  }
  return result.length > 0 ? result.join('\n') : errorText;
}
