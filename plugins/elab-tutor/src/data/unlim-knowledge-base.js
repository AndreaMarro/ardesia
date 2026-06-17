// ============================================
// ELAB — UNLIM Knowledge Base (Offline Fallback)
// Risposte curate per le domande più comuni
// quando il server backend non è raggiungibile.
// © Andrea Marro — 20/02/2026
// ============================================

import RAG_CHUNKS from './rag-chunks.json';

/**
 * Ogni entry contiene:
 *   keywords: parole chiave per il matching
 *   question: domanda rappresentativa
 *   answer: risposta educativa (stile UNLIM, 8-14 anni)
 *   relatedExperiment: ID esperimento ELAB collegato (opzionale)
 */
const KNOWLEDGE_BASE = [
  // ── LED ────────────────────────────────────────
  {
    keywords: ['led', 'accende', 'luminoso', 'luce', 'diodo', 'lucina'],
    question: 'Come funziona un LED?',
    answer: 'Il LED è una lucina speciale che funziona come una porta girevole: la corrente passa solo in un verso! Ha due piedini — quello lungo va verso il + della batteria, quello corto verso il −. Se lo metti al contrario non si accende, ma tranquillo: non si rompe! Metti sempre una resistenza insieme al LED, come dice il libro, altrimenti passa troppa corrente e la lucina si brucia.',
    relatedExperiment: 'v1-cap6-esp1',
  },
  {
    keywords: ['led', 'non', 'accende', 'spento', 'funziona', 'lucina'],
    question: 'Perché il mio LED non si accende?',
    answer: 'Niente panico! Controlliamo insieme:\n\n1. **Gira il LED**: il piedino lungo deve andare verso il +. Se è al contrario, la corrente non passa!\n2. **C\'è la resistenza?** Senza quella, il LED potrebbe essersi bruciato.\n3. **I fili sono ben inseriti?** A volte basta spingerli un po\' più a fondo nella breadboard.\n4. **Il circuito è chiuso?** La corrente deve fare il giro completo: dal + della batteria, attraverso la resistenza e il LED, e tornare al −.\n\nCome dice il libro: controlla un pezzo alla volta!',
    relatedExperiment: 'v1-cap6-esp1',
  },
  {
    keywords: ['led', 'rgb', 'colore', 'colori', 'rosso', 'verde', 'blu', 'anodo', 'catodo', 'piedino', 'piedini', 'polarità', 'polarita'],
    question: 'Come funziona un LED RGB?',
    answer: 'Il LED RGB è come un mini-dipingitore di luce: ha 3 LED piccolissimi dentro (Rosso, Verde, Blu) e mescolandoli crei qualsiasi colore! Ha 4 piedini: uno comune (il più lungo) e uno per ogni colore. Pensalo come i 3 rubinetti della pittura: apri il rosso + verde e viene giallo! Con Arduino puoi dosare da 0 a 255 ogni colore.',
    relatedExperiment: 'cap7-led-rgb',
  },

  // ── BATTERIA ───────────────────────────────────
  {
    keywords: ['batteria', 'pila', 'alimentazione', '9v', 'clip', 'energia'],
    question: 'A cosa serve la batteria?',
    answer: 'La batteria è come il serbatoio di una pompa d\'acqua: fornisce l\'energia che fa muovere la corrente nel circuito. Nel kit ELAB usiamo la batteria da 9V con la clip. Ha due poli: il + (rosso, l\'uscita dell\'energia) e il − (nero, il ritorno). Senza la batteria, il circuito è fermo: la corrente è come l\'acqua, ha bisogno di una pompa per scorrere!',
    relatedExperiment: 'v1-cap6-esp1',
  },

  // ── RESISTENZA ─────────────────────────────────
  {
    keywords: ['resistenza', 'resistore', 'ohm', 'bande', 'colori'],
    question: 'Come funziona una resistenza?',
    answer: 'Una resistenza è come un tubo stretto per l\'acqua: limita il flusso di corrente nel circuito. Si misura in Ohm (Ω). Le bande colorate indicano il valore:\n\n- **Nero=0, Marrone=1, Rosso=2, Arancione=3, Giallo=4, Verde=5, Blu=6, Viola=7, Grigio=8, Bianco=9**\n- Le prime due bande sono le cifre, la terza è il moltiplicatore.\n\nEsempio: Marrone-Nero-Rosso = 10 × 100 = 1000Ω = 1kΩ\n\nPer un LED standard, una resistenza da 220Ω o 330Ω va benissimo!',
  },
  {
    keywords: ['legge', 'ohm', 'tensione', 'corrente', 'formula'],
    question: 'Cos\'è la Legge di Ohm?',
    answer: 'La Legge di Ohm dice che: **V = R × I**\n\n- **V** = Tensione (Volt) — è la "spinta" che fa muovere la corrente\n- **R** = Resistenza (Ohm) — è il "freno" che limita la corrente\n- **I** = Corrente (Ampere) — è il "flusso" di elettricità\n\nPensa all\'acqua: la tensione è la pressione, la resistenza è quanto è stretto il tubo, e la corrente è quanta acqua passa.\n\nSe aumenti la tensione (più pressione), passa più corrente. Se aumenti la resistenza (tubo più stretto), passa meno corrente.',
  },
  {
    keywords: ['serie', 'parallelo', 'collegamento', 'circuito'],
    question: 'Qual è la differenza tra serie e parallelo?',
    answer: 'In **serie**, i componenti sono uno dopo l\'altro, come le perle di una collana. La corrente è la stessa per tutti, ma la tensione si divide. Se un LED si spegne, si spengono tutti!\n\nIn **parallelo**, i componenti sono fianco a fianco, ognuno con il suo percorso. La tensione è la stessa per tutti, ma la corrente si divide. Se un LED si spegne, gli altri restano accesi.\n\nNelle case, le prese di corrente sono in parallelo — ecco perché se si fulmina una lampadina, le altre funzionano ancora!',
  },

  // ── SCRATCH / BLOCKLY ──────────────────────────
  // (Gap critico trovato da t1-utenti 16/04: 0 risultati RAG per 'scratch blockly')
  {
    keywords: ['scratch', 'blockly', 'blocchi', 'visuale', 'programmazione visuale', 'drag', 'incastro'],
    question: 'Cos\'è Scratch/Blockly?',
    answer: 'Scratch (con Blockly) è come costruire un programma con i mattoncini Lego: trascini blocchi colorati e li incastri uno dentro l\'altro! Ogni blocco è un\'istruzione, e quando li metti in sequenza, Arduino esegue il programma. Pensa a una ricetta di cucina: i blocchi sono i passaggi, basta metterli in ordine. È perfetto per chi è alle prime armi: niente sintassi da ricordare, niente punti e virgola dimenticati!',
    relatedExperiment: 'v3-cap5-esp1',
  },
  {
    keywords: ['scratch', 'blockly', 'come si', 'inizia', 'primi blocchi'],
    question: 'Come inizio con Scratch/Blockly in ELAB?',
    answer: 'Con Scratch in ELAB è come giocare con i mattoncini: apri l\'editor, trascini i blocchi dalla palette e li incastri insieme! Per il primo esperimento:\n\n1. Apri un esperimento del Volume 3 (Arduino)\n2. Clicca su "Blocchi" nell\'editor\n3. Trascina il blocco "imposta pin" e scegli il pin del LED\n4. Aggiungi "scrivi digitale" → HIGH\n5. Premi Compila! Il codice Arduino viene generato automaticamente\n\nÈ come tradurre: tu lavori con i blocchi, il computer scrive il codice per te!',
  },
  {
    keywords: ['scratch', 'blockly', 'non funziona', 'errore', 'compila'],
    question: 'Perché il mio programma Scratch non compila?',
    answer: 'Niente panico! Gli errori Scratch sono come le virgole dimenticate nel tema: facili da trovare. Cose da controllare:\n\n1. **Tutti i blocchi sono incastrati?** Un blocco "staccato" non viene eseguito.\n2. **Il blocco di avvio c\'è?** Serve "Quando si avvia" come primo blocco.\n3. **Pin corretti?** Se usi il LED su pin 13, il blocco deve dire "13".\n4. **Valori numerici?** I blocchi "delay" vogliono millisecondi (1000 = 1 secondo).\n\nPensa ai blocchi come a un trenino: se un vagone è staccato, il treno non parte!',
  },

  // ── ARDUINO BASE ───────────────────────────────
  {
    keywords: ['arduino', 'nano', 'scheda', 'microcontrollore'],
    question: 'Cos\'è Arduino?',
    answer: 'Arduino è una piccola scheda con un microcontrollore (un mini-computer) che puoi programmare per controllare circuiti elettronici. Il modello che usiamo in ELAB è l\'**Arduino Nano**, che ha:\n\n- **14 pin digitali** (D0-D13) — acceso/spento\n- **8 pin analogici** (A0-A7) — valori da 0 a 1023\n- **Pin 5V e 3.3V** per alimentare i componenti\n- **Pin GND** (massa) per chiudere il circuito\n\nScrivi il codice nel linguaggio Arduino (simile al C++), lo carichi sulla scheda, e il circuito prende vita!',
  },
  {
    keywords: ['setup', 'loop', 'struttura', 'programma', 'sketch'],
    question: 'Come è strutturato un programma Arduino?',
    answer: 'Ogni programma Arduino (chiamato "sketch") ha due funzioni principali:\n\n```cpp\nvoid setup() {\n  // Eseguito UNA sola volta all\'avvio\n  // Qui configuri i pin e le impostazioni\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // Eseguito all\'INFINITO, in loop\n  // Qui metti il comportamento del circuito\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n```\n\n`setup()` è come preparare gli ingredienti, `loop()` è come cucinare — ripeti la ricetta all\'infinito!',
  },

  // ── DIGITALWRITE / DIGITALREAD ─────────────────
  {
    keywords: ['digitalwrite', 'accendere', 'output', 'high', 'low'],
    question: 'Come si usa digitalWrite?',
    answer: '`digitalWrite()` serve per accendere o spegnere un pin digitale:\n\n```cpp\npinMode(13, OUTPUT);     // Configura il pin 13 come uscita\ndigitalWrite(13, HIGH);  // Accende (5V)\ndigitalWrite(13, LOW);   // Spegne (0V)\n```\n\n**HIGH** = il pin dà 5 Volt (acceso)\n**LOW** = il pin dà 0 Volt (spento)\n\nRicorda: prima devi dire ad Arduino che il pin è un\'uscita con `pinMode(pin, OUTPUT)` nel `setup()`!',
  },
  {
    keywords: ['digitalread', 'pulsante', 'bottone', 'input', 'leggere'],
    question: 'Come si legge un pulsante con digitalRead?',
    answer: '`digitalRead()` legge lo stato di un pin: premuto o non premuto.\n\n```cpp\npinMode(2, INPUT_PULLUP); // Pin 2 come ingresso con resistenza interna\n\nvoid loop() {\n  int stato = digitalRead(2);\n  if (stato == LOW) {\n    // Pulsante PREMUTO (LOW perché usa pull-up)\n    digitalWrite(13, HIGH);\n  } else {\n    // Pulsante RILASCIATO\n    digitalWrite(13, LOW);\n  }\n}\n```\n\nCon `INPUT_PULLUP`, il pin è HIGH quando il pulsante è rilasciato e LOW quando è premuto. Sembra al contrario, ma è il modo più sicuro!',
    relatedExperiment: 'cap6-pulsante',
  },

  // ── ANALOGWRITE (PWM) ──────────────────────────
  {
    keywords: ['analogwrite', 'pwm', 'dimmer', 'luminosità', 'intensità'],
    question: 'Come funziona analogWrite e il PWM?',
    answer: 'Il **PWM** (Pulse Width Modulation) è un trucco per simulare tensioni intermedie. Arduino accende e spegne il pin molto velocemente — così veloce che il LED sembra meno luminoso!\n\n```cpp\nanalogWrite(9, 0);    // Spento (0%)\nanalogWrite(9, 127);  // Metà luminosità (50%)\nanalogWrite(9, 255);  // Piena luminosità (100%)\n```\n\nFunziona solo sui pin con il simbolo **~** (3, 5, 6, 9, 10, 11 su Arduino Nano).\n\nÈ come sbattere le palpebre velocissimo: se le chiudi per metà del tempo, vedi "meno luce"!',
  },

  // ── ANALOGREAD ─────────────────────────────────
  {
    keywords: ['analogread', 'analogico', 'sensore', 'potenziometro', 'valore'],
    question: 'Come funziona analogRead?',
    answer: '`analogRead()` legge una tensione analogica (non solo acceso/spento, ma valori intermedi) su un pin A0-A7:\n\n```cpp\nint valore = analogRead(A0);  // Legge: 0-1023\n```\n\n- **0** = 0 Volt\n- **1023** = 5 Volt\n- **512** = circa 2.5 Volt\n\nÈ perfetto per leggere sensori come:\n- **Potenziometro** (manopola)\n- **Fotoresistenza** (sensore di luce)\n- **Sensore di temperatura**\n\nPensa al potenziometro come al volume della radio: giri e il valore cambia!',
    relatedExperiment: 'cap3-potenziometro',
  },

  // ── SERIAL ─────────────────────────────────────
  {
    keywords: ['serial', 'monitor', 'seriale', 'stampa', 'debug', 'println'],
    question: 'Come funziona Serial Monitor?',
    answer: 'Il Serial Monitor è come una chat tra te e Arduino. Puoi inviare dati e leggerli sullo schermo:\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);  // Avvia comunicazione a 9600 baud\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  Serial.print("Valore: ");\n  Serial.println(val);  // Stampa con a capo\n  delay(500);\n}\n```\n\n`Serial.print()` scrive sulla stessa riga, `Serial.println()` va a capo dopo.\n\nÈ utilissimo per il **debug**: quando qualcosa non funziona, stampa i valori per capire cosa sta succedendo!',
  },

  // ── BREADBOARD ─────────────────────────────────
  {
    keywords: ['breadboard', 'basetta', 'fori', 'collegamento', 'prova'],
    question: 'Come funziona una breadboard?',
    answer: 'La breadboard è una basetta per costruire circuiti senza saldare. I fori sono collegati così:\n\n- **Righe centrali** (a-e, f-j): i 5 fori di ogni riga sono collegati tra loro\n- **Colonne laterali** (+/-): tutti i fori della stessa colonna sono collegati (alimentazione)\n- **Scanalatura centrale**: separa le due metà — i fori NON sono collegati attraverso la scanalatura\n\n**Regole d\'oro:**\n1. I componenti si inseriscono a cavallo della scanalatura\n2. Mai due piedini dello stesso componente nella stessa riga!\n3. Usa la colonna rossa (+) per il 5V e la blu (-) per GND',
  },

  // ── BUZZER ─────────────────────────────────────
  {
    keywords: ['buzzer', 'suono', 'tono', 'tone', 'musica', 'nota'],
    question: 'Come si usa un buzzer con Arduino?',
    answer: 'Il buzzer è come un piccolo altoparlante che fa "bip": emette suoni quando gli invii un segnale. Con `tone()` scegli la nota musicale:\n\n```cpp\ntone(8, 440);     // Pin 8, nota LA (440 Hz)\ndelay(500);        // Suona per mezzo secondo\nnoTone(8);         // Silenzio\n```\n\n**Note musicali:** DO=262, RE=294, MI=330, FA=349, SOL=392, LA=440, SI=494\n\nÈ come un pianoforte digitale: metti in sequenza `tone()` e `delay()` e suoni una melodia!\n\nIl buzzer ha un verso: il piedino lungo (+) va al pin di Arduino.',
    relatedExperiment: 'cap4-buzzer',
  },

  // ── FOTORESISTENZA ─────────────────────────────
  {
    keywords: ['fotoresistenza', 'ldr', 'luce', 'sensore', 'buio', 'luminosità'],
    question: 'Come funziona una fotoresistenza?',
    answer: 'La fotoresistenza (LDR) cambia la sua resistenza in base alla luce:\n- **Tanta luce** → resistenza bassa → il valore di `analogRead()` è alto\n- **Buio** → resistenza alta → il valore è basso\n\n```cpp\nint luce = analogRead(A0);\nif (luce < 300) {\n  // È buio! Accendi il LED\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}\n```\n\nServe un partitore di tensione: collega la fotoresistenza tra 5V e il pin A0, e una resistenza da 10kΩ tra A0 e GND.\n\nÈ come funzionano le luci automatiche nei lampioni!',
    relatedExperiment: 'cap5-fotoresistenza',
  },

  // ── SERVO ──────────────────────────────────────
  {
    keywords: ['servo', 'motore', 'angolo', 'gradi', 'rotazione'],
    question: 'Come si controlla un servo motore?',
    answer: 'Il servo motore è come il braccio di un robot: ruota esattamente all\'angolo che vuoi (0°-180°). Pensalo come un orologio che punta l\'ora che gli dici tu! Usa la libreria Servo:\n\n```cpp\n#include <Servo.h>\nServo mioServo;\nvoid setup() { mioServo.attach(9); }\nvoid loop() {\n  mioServo.write(0);    delay(1000);\n  mioServo.write(90);   delay(1000);\n  mioServo.write(180);  delay(1000);\n}\n```\n\nHa 3 fili: rosso (5V), marrone/nero (massa), giallo/arancione (segnale). Prova a collegare un potenziometro: giri la manopola, il servo ti segue!',
    relatedExperiment: 'cap8-servo',
  },

  // ── CONDENSATORE ───────────────────────────────
  {
    keywords: ['condensatore', 'capacità', 'carica', 'scarica', 'farad'],
    question: 'Cos\'è un condensatore?',
    answer: 'Il condensatore è come una piccola batteria ricaricabile: accumula energia e la rilascia.\n\n- **Carica**: quando gli dai tensione, accumula energia (come riempire un secchio d\'acqua)\n- **Scarica**: quando togli la tensione, rilascia l\'energia accumulata\n\nSi misura in **Farad** (F), ma i condensatori comuni sono micro-Farad (µF) o nano-Farad (nF).\n\n**Attenzione alla polarità!** I condensatori elettrolitici hanno un verso: la striscia bianca indica il piedino negativo (-).\n\nUsi comuni: filtrare disturbi, stabilizzare tensioni, creare ritardi (circuiti RC).',
  },

  // ── DELAY / MILLIS ─────────────────────────────
  {
    keywords: ['delay', 'millis', 'tempo', 'attesa', 'ritardo', 'bloccante'],
    question: 'Qual è la differenza tra delay() e millis()?',
    answer: '`delay()` è come mettere Arduino in pausa: si ferma e non fa nient\'altro. `millis()` è più furbo: è come un cronometro che scorre mentre Arduino continua a lavorare.\n\n```cpp\n// CON DELAY (bloccante)\ndigitalWrite(13, HIGH);\ndelay(1000);  // Arduino fermo 1 secondo!\ndigitalWrite(13, LOW);\n\n// CON MILLIS (non bloccante)\nunsigned long precedente = 0;\nvoid loop() {\n  if (millis() - precedente >= 1000) {\n    precedente = millis();\n    // Cambia stato LED\n  }\n  // Arduino può fare ALTRO qui!\n}\n```\n\nUsa `millis()` quando vuoi fare più cose insieme: leggere un sensore E lampeggiare un LED.',
  },

  // ── IF / ELSE ──────────────────────────────────
  {
    keywords: ['if', 'else', 'condizione', 'confronto', 'uguale'],
    question: 'Come funziona if/else in Arduino?',
    answer: '`if` è come un bivio della strada: controlla una condizione e decide quale strada prendere:\n\n```cpp\nint temperatura = analogRead(A0);\n\nif (temperatura > 500) {\n  // Fa caldo! Accendi ventilatore\n  digitalWrite(9, HIGH);\n} else if (temperatura > 300) {\n  // Temperatura media\n  Serial.println("Tutto ok");\n} else {\n  // Fa freddo\n  digitalWrite(9, LOW);\n}\n```\n\n**Operatori di confronto:**\n- `==` uguale (ATTENZIONE: due =, non uno!)\n- `!=` diverso\n- `>` maggiore, `<` minore\n- `>=` maggiore o uguale, `<=` minore o uguale\n\nErrore comune: scrivere `=` invece di `==`. Un solo `=` assegna un valore, non confronta!',
  },

  // ── FOR ────────────────────────────────────────
  {
    keywords: ['for', 'ciclo', 'ripetere', 'loop', 'contatore'],
    question: 'Come funziona il ciclo for?',
    answer: 'Il ciclo `for` è come un contatore che ripete un blocco di codice un numero preciso di volte. Pensalo come "fai 10 flessioni" — il contatore tiene il conto per te:\n\n```cpp\n// Accendi 5 LED uno dopo l\'altro\nfor (int i = 2; i <= 6; i++) {\n  digitalWrite(i, HIGH);\n  delay(200);\n}\n```\n\nLe 3 parti:\n1. `int i = 2` → parte dal valore 2\n2. `i <= 6` → continua finché i è ≤ 6\n3. `i++` → dopo ogni giro, aumenta i di 1\n\nQuindi: i=2, i=3, i=4, i=5, i=6 → 5 ripetizioni!\n\nÈ perfetto per controllare più LED, creare effetti luminosi, o fare misurazioni ripetute.',
  },

  // ── MOTORE DC ──────────────────────────────────
  {
    keywords: ['motore', 'dc', 'velocità', 'transistor', 'driver'],
    question: 'Come si controlla un motore DC?',
    answer: 'Un motore DC gira quando gli dai corrente. Ma **non collegarlo direttamente ad Arduino!** Il pin può dare solo 40mA, il motore ne vuole 200-500mA.\n\nServe un **transistor** (come un interruttore elettronico) o un **driver motore** (L293D/L298N):\n\n```cpp\n// Con transistor NPN sul pin 9\nanalogWrite(9, 0);    // Fermo\nanalogWrite(9, 127);  // Metà velocità\nanalogWrite(9, 255);  // Massima velocità\n```\n\nIl transistor amplifica il segnale debole di Arduino per controllare il motore potente. È come un interruttore che si accende con un soffio!',
    relatedExperiment: 'cap9-motor-dc',
  },

  // © Andrea Marro — 20/02/2026

  // ── ERRORI COMUNI ──────────────────────────────
  {
    keywords: ['errore', 'compilazione', 'non', 'compila', 'rosso', 'sbagliato'],
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    question: 'Il mio codice non compila, cosa faccio?',
    answer: 'Niente panico! Un errore di compilazione è come una virgola dimenticata nel tema: basta trovare dove. Gli errori più comuni:\n\n1. **Punto e virgola mancante** (`;`) — Arduino lo vuole alla fine di ogni istruzione\n2. **Parentesi non chiusa** — Conta le `{` e `}`, devono essere uguali!\n3. **Nome sbagliato** — `digitalwrite` ≠ `digitalWrite` (le maiuscole contano!)\n4. **Variabile non dichiarata** — Devi scrivere `int x = 5;` prima di usare `x`\n5. **Pin inesistente** — Arduino Nano ha pin D0-D13 e A0-A7\n\n**Consiglio**: leggi il messaggio di errore dal basso verso l\'alto. La prima riga di errore spesso è la più utile. Guarda il numero di riga per trovare dove sta il problema!',
  },
  {
    keywords: ['cortocircuito', 'corto', 'circuito', 'caldo', 'brucia', 'fumo'],
    question: 'Cos\'è un cortocircuito e come evitarlo?',
    answer: 'Un cortocircuito succede quando la corrente trova un percorso senza resistenza tra + e -. È come togliere il tappo a una diga: l\'acqua scorre tutta insieme!\n\n**Come evitarlo:**\n1. **Mai collegare 5V direttamente a GND** senza un componente in mezzo\n2. **Usa sempre una resistenza con i LED** (220Ω - 1kΩ)\n3. **Controlla i fili prima di alimentare** il circuito\n4. **Non sovrapporre fili scoperti** sulla breadboard\n\n**Se senti caldo o vedi fumo**: scollega subito il cavo USB! Poi controlla i collegamenti con calma.\n\nNel simulatore ELAB puoi sperimentare senza rischi!',
  },

  // ── VARIABILI ──────────────────────────────────
  {
    keywords: ['variabile', 'int', 'float', 'bool', 'tipo', 'dichiarare'],
    question: 'Cosa sono le variabili in Arduino?',
    answer: 'Le variabili sono "scatole" dove conservi dei valori. Ogni scatola ha un tipo:\n\n```cpp\nint contatore = 0;      // Numero intero (-32768 a 32767)\nfloat temperatura = 23.5; // Numero decimale\nbool acceso = true;      // Vero o Falso\nchar lettera = \'A\';      // Un singolo carattere\nString nome = "ELAB";    // Testo\n```\n\n**Regole:**\n- Il nome non può iniziare con un numero\n- Maiuscole e minuscole contano (`LED` ≠ `led`)\n- Usa nomi descrittivi: `luminosita` è meglio di `x`\n\n`int` basta per la maggior parte dei casi. Usa `float` solo quando serve la precisione decimale (sensori di temperatura).',
  },

  // ── MAP ────────────────────────────────────────
  {
    keywords: ['map', 'convertire', 'scala', 'range', 'mappare'],
    question: 'Come funziona la funzione map()?',
    answer: '`map()` converte un valore da una scala a un\'altra. È come tradurre tra lingue diverse!\n\n```cpp\n// Potenziometro (0-1023) → Servo (0-180)\nint pot = analogRead(A0);          // 0-1023\nint angolo = map(pot, 0, 1023, 0, 180); // 0-180\nmioServo.write(angolo);\n\n// Sensore luce (0-1023) → Luminosità LED (0-255)\nint luce = analogRead(A1);\nint pwm = map(luce, 0, 1023, 0, 255);\nanalogWrite(9, pwm);\n```\n\nSintassi: `map(valore, min_input, max_input, min_output, max_output)`\n\nÈ utilissimo per collegare sensori a motori, LED, o qualsiasi uscita con scala diversa!',
  },

  // ── DOMANDE GENERALI ──────────────────────────
  {
    keywords: ['cosa', 'posso', 'fare', 'progetto', 'idea', 'costruire'],
    question: 'Cosa posso costruire con Arduino?',
    answer: 'Arduino è come un laboratorio in miniatura: con i componenti di ELAB costruisci qualsiasi cosa! Ecco alcune idee:\n\n **Semaforo** — LED rosso, giallo, verde con temporizzazione\n **Stazione meteo** — Sensore di temperatura + display\n **Piano elettronico** — Pulsanti + buzzer per suonare note\n **Robot evita-ostacoli** — Sensore ultrasuoni + motori\n **Lampada smart** — Fotoresistenza per accensione automatica\n **Gioco di reazione** — LED casuale + pulsante + timer\n **Irrigazione automatica** — Sensore umidità + pompa\n\nInzia dai progetti del libro ELAB e poi modifica e combina le idee. La creatività è il tuo superpotere!',
  },
  {
    keywords: ['aiuto', 'help', 'come', 'iniziare', 'inizio', 'parto', 'principiante', 'base', 'iniziamo'],
    question: 'Come inizio con ELAB?',
    answer: 'Benvenuto in ELAB! Ecco come iniziare:\n\n1. **Apri il Manuale** — Vai alla sezione "Manuale" nella barra laterale. Inizia dal Volume 1, Capitolo 1.\n\n2. **Primo esperimento** — "LED Semplice": colleghi un LED e una resistenza ad Arduino e lo fai accendere.\n\n3. **Usa il Simulatore** — Non serve hardware! Puoi simulare i circuiti direttamente nel browser.\n\n4. **Scrivi il codice** — Usa l\'editor nella tab Simulatore. Il codice si compila automaticamente.\n\n5. **Chiedi a me!** — Sono UNLIM, il tuo tutor. Chiedimi qualsiasi cosa sull\'elettronica!\n\nConsiglio: segui gli esperimenti in ordine, ognuno si basa su quello prima. E non aver paura di sbagliare — nel simulatore non si rompe niente!',
  },

  // ── SUPPORTO EMOTIVO ────────────────────────
  // (a2-unlim audit: "non capisco niente", "è troppo difficile", "aiutami", "sono confuso"
  //  avevano 0 KB hits e pertinenza 1-2. Un bambino frustrato non riceveva supporto.)
  {
    keywords: ['non', 'capisco', 'niente', 'confuso', 'confusa', 'perso', 'persa'],
    question: 'Non capisco niente!',
    answer: 'Tranquillo, è normale! L\'elettronica sembra complicata all\'inizio, ma è come imparare ad andare in bicicletta: all\'inizio cadi, poi diventa naturale. Proviamo insieme: dimmi cosa stai cercando di fare e ti guido passo passo. Nessuna domanda è stupida!',
  },
  {
    keywords: ['troppo', 'difficile', 'impossibile', 'riesco', 'farcela'],
    question: 'È troppo difficile!',
    answer: 'Tranquillo, sembra difficile ma è come imparare ad andare in bici: all\'inizio cadi, poi diventa naturale! Ogni grande inventore ha iniziato esattamente da dove sei tu. Il trucco è fare un passo alla volta. Dimmi qual è l\'ultimo passo che sei riuscito a fare — ripartiamo da lì. Insieme ce la facciamo!',
  },
  {
    keywords: ['aiutami', 'aiuto', 'favore', 'sos', 'bloccato', 'bloccata'],
    question: 'Aiutami per favore!',
    answer: 'Certo, sono qui come una guida sul sentiero! Dimmi cosa stai facendo e dove ti sei bloccato. Se stai seguendo un esperimento, dimmi quale e a che passo sei. Se hai un errore, descrivimelo e troviamo la soluzione insieme!',
    relatedExperiment: 'v1-cap6-esp1',
  },
  {
    keywords: ['sbaglio', 'errore', 'sbagliato', 'rotto', 'bruciato', 'paura'],
    question: 'Ho paura di sbagliare!',
    answer: 'Il simulatore è come una palestra virtuale: non puoi rompere niente! Sperimenta quanto vuoi — se qualcosa non funziona, premi "Ricomincia" e riparti. Sbagliare è il modo migliore per imparare: ogni errore ti insegna qualcosa di nuovo. Provaci!',
  },
  {
    keywords: ['evviva', 'riuscito', 'bravo', 'fantastico', 'funzionato', 'ce l\'ho fatta', 'sono riuscito'],
    question: 'Funziona! Ce l\'ho fatta!',
    answer: 'Fantastico, complimenti! È come aver completato un livello di un videogioco: ora sei pronto per la prossima sfida! Quando vuoi, prova l\'esperimento successivo — ogni volta diventa un po\' più interessante. Continua così!',
  },

  // ── SENSORE TEMPERATURA ────────────────────────
  {
    keywords: ['temperatura', 'termometro', 'ntc', 'tmp36', 'caldo', 'freddo'],
    question: 'Come si misura la temperatura con Arduino?',
    answer: 'Il sensore TMP36 è come un piccolo termometro digitale: legge la temperatura e la trasforma in un segnale che Arduino capisce.\n\n```cpp\nint lettura = analogRead(A0);\nfloat tensione = lettura * 5.0 / 1023.0;\nfloat temperatura = (tensione - 0.5) * 100;\nSerial.print("Temperatura: ");\nSerial.print(temperatura);\nSerial.println(" °C");\n```\n\nHa 3 pin: alimentazione (5V, positivo), segnale (pin analogico A0), massa (il "ritorno" del circuito). Attenzione all\'ordine!\n\n**Idea progetto**: LED rosso sopra 30°C, LED blu sotto 20°C — come un semaforo della temperatura!',
  },

  // ── LCD ────────────────────────────────────────
  {
    keywords: ['lcd', 'display', 'schermo', 'scrivere', 'testo', 'i2c'],
    question: 'Come si usa un display LCD?',
    answer: 'Il display LCD è come un mini-schermo della calcolatrice: mostra testo su 2 righe da 16 caratteri. Con il modulo I2C (una specie di "adattatore" che riduce i fili), ne bastano 2 per i dati:\n\n```cpp\n#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.print("Ciao ELAB!");\n}\nvoid loop() {\n  lcd.setCursor(0, 1);\n  lcd.print(millis()/1000);\n  lcd.print(" secondi");\n}\n```\n\n**Collegamento I2C** (pensa come un "cavo dati intelligente"): SDA → A4, SCL → A5, 5V alla alimentazione, massa alla massa.\n\nPerfetto per mostrare temperatura, messaggi, menu interattivi!',
    relatedExperiment: 'cap10-lcd',
  },

  // ── ULTRASUONI ─────────────────────────────────
  {
    keywords: ['ultrasuoni', 'distanza', 'hcsr04', 'eco', 'ping', 'misurare'],
    question: 'Come si misura la distanza con un sensore a ultrasuoni?',
    answer: 'Il sensore HC-SR04 funziona come un pipistrello: emette un suono e ascolta l\'eco!\n\n```cpp\nint trig = 3;\nint echo = 4;\n\nvoid setup() {\n  pinMode(trig, OUTPUT);\n  pinMode(echo, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(trig, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trig, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  \n  long durata = pulseIn(echo, HIGH);\n  float distanza = durata * 0.034 / 2; // cm\n  Serial.print(distanza);\n  Serial.println(" cm");\n  delay(200);\n}\n```\n\nMisura da 2cm a 400cm. Perfetto per robot evita-ostacoli!',
  },

  // ── CONCETTI AVANZATI ──────────────────────────
  {
    keywords: ['pullup', 'pull-up', 'flottante', 'floating', 'resistenza', 'interna'],
    question: 'Cos\'è una resistenza di pull-up?',
    answer: 'Quando un pin di input non è collegato a niente, è "flottante" — legge valori casuali. La resistenza di **pull-up** lo tiene a HIGH quando il pulsante non è premuto.\n\nArduino ha resistenze pull-up interne! Basta scrivere:\n\n```cpp\npinMode(2, INPUT_PULLUP); // Attiva pull-up interno\n```\n\nCosì:\n- Pulsante **rilasciato** → pin legge HIGH (5V tramite pull-up)\n- Pulsante **premuto** → pin legge LOW (collegato a GND)\n\nSenza pull-up, il pin fluttua come una barca senza ancora. Il pull-up è l\'ancora!',
  },

  // © Andrea Marro — 20/02/2026

  // ── ELAB SPECIFICO ─────────────────────────────
  {
    keywords: ['simulatore', 'wokwi', 'provare', 'testare', 'virtuale'],
    question: 'Come funziona il simulatore ELAB?',
    answer: 'Il simulatore ELAB ti permette di costruire e testare circuiti senza hardware reale!\n\n**Come usarlo:**\n1. Vai alla tab **Simulatore** nella barra laterale\n2. Scegli un esperimento dal manuale oppure scrivi codice libero\n3. I componenti appaiono sulla breadboard virtuale\n4. Clicca **Compila** per tradurre il codice\n5. Se non ci sono errori, il circuito si anima!\n\n**Cosa puoi fare:**\n- Vedere i LED accendersi e spegnersi\n- Leggere i valori dei sensori\n- Usare il Serial Monitor virtuale\n- Collegare fili trascinando tra i pin\n\nÈ identico a un circuito vero, ma senza rischio di bruciare niente!',
  },
  {
    keywords: ['manuale', 'libro', 'volume', 'capitolo', 'pagina', 'lezione'],
    question: 'Come è organizzato il manuale ELAB?',
    answer: 'Il manuale ELAB è come una trilogia di avventure, divisa in 3 volumi che vanno dal semplice al complesso:\n\n **Volume 1** — Le basi: LED, resistenze, pulsanti, breadboard, primi passi con Arduino\n **Volume 2** — Approfondiamo: sensori, motori, comunicazione seriale\n **Volume 3** — Arduino avanzato: progetti complessi, logica combinata, robot\n\nOgni capitolo è come una mini-lezione:\n- **Teoria** — Spiegazione del concetto\n- **Esperimento guidato** — Passo passo nel simulatore\n- **Quiz** — 2 domande di verifica\n- **Sfida** — Attività libera per sperimentare\n\nI volumi fisici ELAB ti danno i componenti reali da costruire sul kit!',
  },
  {
    keywords: ['lavagna', 'disegnare', 'whiteboard', 'schizzo', 'disegno'],
    question: 'Come si usa la lavagna?',
    answer: 'La lavagna ti permette di disegnare schemi e annotazioni sopra il simulatore:\n\n**Strumenti:**\n-  **Matita** — Disegno libero\n-  **Gomma** — Cancella parti del disegno\n- **T** **Testo** — Aggiungi etichette e note\n-  **Rettangolo, cerchio, freccia, linea** — Forme geometriche\n\n**Funzioni:**\n- **Annulla/Ripeti** (Ctrl+Z / Ctrl+Y)\n- **6 colori** + spessore regolabile\n- **Salva PNG** — Esporta il disegno come immagine\n- **Salvataggio automatico** — Il disegno si salva per ogni esperimento\n\nUsa la lavagna per annotare i tuoi circuiti, segnare le tensioni, o fare schizzi prima di costruire!',
  },
  {
    keywords: ['unlim', 'chat', 'tutor', 'chiedere', 'domanda'],
    question: 'Come posso usare UNLIM?',
    answer: 'Io sono UNLIM, il tuo tutor di elettronica! Pensa a me come a un assistente sempre pronto ad aiutarti. Ecco cosa posso fare:\n\n **Rispondi alle tue domande** — Chiedimi qualsiasi cosa su elettronica e Arduino\n **Ti guido nel manuale** — Ti indico le pagine giuste per approfondire\n **Ti suggerisco esperimenti** — Posso proporti sfide e progetti\n **Ti aiuto col debug** — Descrivi il problema e ti aiuto a risolverlo\n **Analizzo i tuoi disegni** — Puoi mandarmi una foto della lavagna!\n\n**Suggerimenti:**\n- Fai domande specifiche: "Perché il LED non si accende?" è meglio di "Non funziona"\n- Descrivi il tuo circuito: componenti, collegamento, codice\n- Non aver paura di chiedere! Non esistono domande stupide.',
  },

  // ── SICUREZZA ──────────────────────────────────
  {
    keywords: ['sicurezza', 'pericoloso', 'scossa', 'elettricità', 'attenzione'],
    question: 'L\'elettronica è pericolosa?',
    answer: 'Con Arduino e i componenti di ELAB sei al sicuro! La tensione massima è **5 Volt** — una pila produce 9V. Non puoi prendere la scossa.\n\n**Regole di sicurezza:**\n1.  **Non aprire alimentatori o prese di corrente** — quelle SÌ sono pericolose (220V!)\n2.  **Scollega il cavo USB** prima di cambiare i collegamenti\n3.  **Se qualcosa diventa caldo**, scollega subito e controlla i fili\n4.  **Tieni lontano dall\'acqua** — l\'elettronica e l\'acqua non vanno d\'accordo\n5.  **Controlla i collegamenti** prima di alimentare il circuito\n\nNel simulatore ELAB puoi sperimentare senza nessun rischio — è il posto perfetto per imparare!',
  },
];

// ============================================
// KEYWORD MATCHING ENGINE
// Trova la risposta più pertinente alla domanda
// usando un punteggio basato sulle parole chiave
// ============================================

const STOP_WORDS = new Set([
  'il', 'lo', 'la', 'le', 'li', 'gli', 'un', 'uno', 'una',
  'di', 'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'a', 'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'da', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
  'in', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
  'con', 'su', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
  'per', 'tra', 'fra', 'e', 'o', 'ma', 'che', 'chi', 'come',
  'è', 'sono', 'ha', 'ho', 'hai', 'hanno', 'questo', 'questa',
  'quello', 'quella', 'mio', 'mia', 'tuo', 'tua', 'suo', 'sua',
  'cosa', 'mi', 'ti', 'si', 'ci', 'vi', 'me', 'te', 'se',
  'non', 'più', 'anche', 'solo', 'già', 'ancora', 'poi',
  'molto', 'poco', 'tanto', 'quanto', 'quale', 'dove', 'quando',
]);

/**
 * Cerca nella knowledge base la risposta più pertinente.
 * @param {string} message — la domanda dell'utente
 * @returns {{ answer: string, question: string, score: number, relatedExperiment?: string } | null}
 *          null se nessuna risposta supera la soglia minima
 */
export function searchKnowledgeBase(message) {
  if (!message || typeof message !== 'string') return null;

  const words = message
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const word of words) {
      for (const kw of entry.keywords) {
        if (word === kw) {
          score += 3; // exact match
        } else if (word.length >= 4 && kw.length >= 4 && (word.includes(kw) || kw.includes(word))) {
          // Partial match solo per parole >= 4 char (evita false positive: "fa" in "fantastico", "ho" in "fatta", etc.)
          score += 1.5;
        }
      }
      // Bonus: match in question text (solo parole >= 4 char per stesso motivo)
      if (word.length >= 4 && entry.question.toLowerCase().includes(word)) {
        score += 0.5;
      }
    }

    // Use raw score (higher recall for natural language queries)
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Soglia minima: almeno 2.5 punti raw (1 exact match = 3 points)
  if (bestScore < 2.5 || !bestMatch) return null;

  return {
    answer: bestMatch.answer,
    question: bestMatch.question,
    score: bestScore,
    relatedExperiment: bestMatch.relatedExperiment || null,
  };
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
}

/**
 * Search RAG chunks (549 entries from volumes, glossary, FAQ, errors, analogies)
 * Used as fallback when curated KB has no match.
 * @param {string} message
 * @param {number} topK - max results
 * @returns {Array<{text, score, source, volume}>}
 */
export function searchRAGChunks(message, topK = 3) {
  if (!message || typeof message !== 'string') return [];
  if (!RAG_CHUNKS || !Array.isArray(RAG_CHUNKS)) return [];

  const lower = message.toLowerCase();

  // Short-phrase fallback: common kid phrases that lose all words to stopword/length filters
  // "non va", "non funziona", "aiuto", "help" → search for related terms instead
  const SHORT_PHRASE_MAP = {
    'non va': ['led', 'circuito', 'errore', 'problema', 'collegamento'],
    'non funziona': ['errore', 'circuito', 'collegamento', 'problema'],
    'aiuto': ['guida', 'spiegazione', 'come', 'fare'],
    'help': ['guida', 'spiegazione', 'come', 'fare'],
    'boh': ['spiegazione', 'circuito', 'come'],
    'non capisco': ['spiegazione', 'concetto', 'analogia'],
    'sono confuso': ['spiegazione', 'concetto', 'analogia', 'semplice'],
    'troppo difficile': ['semplice', 'base', 'primo', 'iniziare'],
    'non riesco': ['guida', 'passo', 'aiuto', 'soluzione'],
    'è rotto': ['errore', 'problema', 'collegamento', 'circuito'],
    'che bello': ['esperimento', 'prossimo', 'avanzato'],
  };
  let words;
  const phraseMatch = Object.entries(SHORT_PHRASE_MAP).find(([phrase]) => lower.includes(phrase));
  if (phraseMatch) {
    words = phraseMatch[1];
  } else {
    words = lower
      .replace(/[^a-z\u00E0-\u00FA0-9\s']/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  if (words.length === 0) return [];

  const scored = RAG_CHUNKS.map(chunk => {
    const text = chunk.text.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (text.includes(word)) score += 1;
    }
    // Bonus for curated sources (glossary, FAQ, errors, analogies)
    if (chunk.source !== 'volume-pdf') score *= 1.5;
    return { ...chunk, score };
  });

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// © Andrea Marro — 20/02/2026
