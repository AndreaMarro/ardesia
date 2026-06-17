#!/usr/bin/env node
/**
 * RAG Chunk Generator — Estrae testo dai volumi ELAB e crea chunk per il vector store
 * Legge i file .txt estratti con pdftotext, li divide in chunk di ~400 token con overlap,
 * e produce un JSON pronto per l'upload su Supabase pgvector.
 *
 * Usage: node scripts/rag/generate-chunks.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', '..', 'src', 'data', 'rag-chunks.json');

const VOLUMES = [
  { path: '/tmp/vol1.txt', volume: 1, title: 'Volume 1 — Le Basi' },
  { path: '/tmp/vol2.txt', volume: 2, title: 'Volume 2 — Approfondiamo' },
  { path: '/tmp/vol3.txt', volume: 3, title: 'Volume 3 — Arduino' },
];

const CHUNK_SIZE = 100; // ~100 words per chunk (very granular for precise retrieval)
const OVERLAP = 25;     // ~25 words overlap between chunks

function cleanText(text) {
  return text
    .replace(/\f/g, '\n\n') // page breaks → double newline
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n') // max 3 newlines
    .replace(/\t/g, ' ')
    .replace(/ {3,}/g, ' ')
    .trim();
}

function detectChapter(text) {
  // Try to detect chapter from text context
  const match = text.match(/(?:Capitolo|Cap\.?)\s*(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

function chunkText(text, volume) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + CHUNK_SIZE);
    const chunkText = chunkWords.join(' ');

    // Skip very short chunks (less than 15 words)
    if (chunkWords.length >= 15) {
      const chapter = detectChapter(chunkText);
      chunks.push({
        id: `v${volume}-chunk-${chunks.length + 1}`,
        text: chunkText,
        volume,
        chapter,
        wordCount: chunkWords.length,
        source: 'volume-pdf',
      });
    }

    i += CHUNK_SIZE - OVERLAP;
  }

  return chunks;
}

function addGlossaryChunks() {
  // Manually curated glossary entries for common student questions
  const glossary = [
    { term: 'LED', def: "Il LED (Light Emitting Diode) \u00E8 un componente che emette luce quando la corrente lo attraversa. Ha due piedini: l'anodo (+, pi\u00F9 lungo) e il catodo (-, pi\u00F9 corto). Serve sempre un resistore per proteggerlo!" },
    { term: 'Resistore', def: "Il resistore limita la corrente nel circuito. Si misura in Ohm (\u03A9). I colori delle bande indicano il valore. Pi\u00F9 alto il valore, meno corrente passa. Protegge i LED dal bruciarsi." },
    { term: 'Breadboard', def: "La breadboard \u00E8 una basetta con fori collegati internamente. Le righe orizzontali (a-e, f-j) sono collegate tra loro. Le righe + e - ai lati (bus) portano corrente a tutto il circuito." },
    { term: 'Potenziometro', def: "Il potenziometro \u00E8 una resistenza variabile con una manopola. Ha 3 piedini: VCC, Signal, GND. Girando la manopola cambi la resistenza e quindi la tensione in uscita. Perfetto per regolare luminosit\u00E0!" },
    { term: 'Pulsante', def: "Il pulsante (push-button) \u00E8 un interruttore momentaneo. Premendolo, chiudi il circuito e la corrente passa. Rilasciandolo, il circuito si apre. Ha 4 piedini collegati a coppie." },
    { term: 'Condensatore', def: "Il condensatore accumula energia elettrica e la rilascia. Si misura in Farad (F). Usato per stabilizzare la tensione, filtrare rumore, e creare ritardi nei circuiti RC." },
    { term: 'MOSFET', def: "Il MOSFET \u00E8 un interruttore elettronico controllato dalla tensione. Ha 3 piedini: Gate (cancello), Drain (scarico), Source (sorgente). Quando mandi abbastanza energia al Gate, il cancello si apre e la corrente passa dal Drain al Source." },
    { term: 'Arduino', def: "Arduino \u00E8 una scheda con un microcontrollore che puoi programmare. Legge sensori (input) e controlla LED, motori, buzzer (output). Si programma in C++ con l'IDE Arduino." },
    { term: 'Corrente', def: "La corrente \u00E8 il flusso di elettroni nel circuito. Si misura in Ampere (A). Per i nostri circuiti usiamo milliampere (mA). Troppa corrente brucia i componenti!" },
    { term: 'Tensione', def: "La tensione \u00E8 la 'spinta' che fa muovere gli elettroni. Si misura in Volt (V). La batteria da 9V fornisce la tensione, i componenti la 'consumano'. \u00C8 come la pressione dell'acqua in un tubo." },
    { term: 'Circuito serie', def: "In un circuito in serie, i componenti sono collegati uno dopo l'altro. La corrente \u00E8 la stessa ovunque, ma la tensione si divide. Se un componente si rompe, tutto il circuito si ferma." },
    { term: 'Circuito parallelo', def: "In un circuito in parallelo, i componenti sono collegati su rami diversi. La tensione \u00E8 la stessa su ogni ramo, ma la corrente si divide. Se un componente si rompe, gli altri continuano a funzionare." },
    { term: 'PWM', def: "PWM (Pulse Width Modulation) \u00E8 un modo per simulare tensioni intermedie accendendo e spegnendo rapidamente un pin. analogWrite(pin, 0-255) controlla il 'duty cycle'. 0=spento, 255=pieno, 127=met\u00E0 luminosit\u00E0." },
    { term: 'LDR', def: "Il fotoresistore (LDR) cambia resistenza in base alla luce. Pi\u00F9 luce = meno resistenza. Usato per fare circuiti che reagiscono alla luce ambientale, come luci notturne automatiche." },
    { term: 'Buzzer', def: "Il buzzer piezoelettrico produce suono quando riceve corrente. Il buzzer attivo suona con corrente continua, quello passivo serve un segnale PWM per controllare la frequenza (nota)." },
    { term: 'Reed switch', def: "Il reed switch \u00E8 un interruttore che si chiude quando avvicini un magnete. Dentro ha due lamelle metalliche che si toccano con il campo magnetico. Usato per sensori di porta e allarmi." },
    { term: 'Cortocircuito', def: "Un cortocircuito avviene quando la corrente trova un percorso senza resistenza, bypassando i componenti. \u00C8 pericoloso: la batteria si scalda, i fili si bruciano. Controlla sempre i collegamenti!" },
    { term: 'GND', def: "GND (Ground) \u00E8 il riferimento a 0 Volt del circuito. Tutti i componenti devono avere un percorso verso GND per funzionare. Nel simulatore, corrisponde alla riga - della breadboard e al pin GND di Arduino." },
    { term: 'Multimetro', def: "Il multimetro misura tensione (V), corrente (A) e resistenza (\u03A9). La sonda rossa va al punto + che vuoi misurare, la nera a GND. Nel simulatore funziona in tempo reale!" },
    { term: 'Diodo', def: "Il diodo lascia passare la corrente in una sola direzione. Il LED \u00E8 un tipo di diodo che emette luce. La banda sul diodo indica il catodo (-). Se lo metti al contrario, non passa corrente." },
  ];

  return glossary.map((g, i) => ({
    id: `glossary-${i + 1}`,
    text: `${g.term}: ${g.def}`,
    volume: 0,
    chapter: null,
    wordCount: g.def.split(/\s+/).length,
    source: 'glossary',
    term: g.term,
  }));
}

function addFAQChunks() {
  const faqs = [
    { q: "Il LED non si accende", a: "Controlla: 1) La polarit\u00E0 del LED (anodo/piedino lungo al +). 2) Il resistore \u00E8 collegato? 3) I fili toccano i fori giusti della breadboard. 4) La batteria \u00E8 collegata. 5) Premi 'Avvia' per attivare la simulazione." },
    { q: "Come si collega un filo", a: "Clicca su un foro della breadboard, poi clicca su un altro foro. Il filo si crea automaticamente. Il colore del filo non cambia nulla elettricamente, \u00E8 solo per organizzazione." },
    { q: "Il codice non compila", a: "Controlla: 1) Hai scritto 'void setup()' e 'void loop()'? 2) Ogni riga finisce con ';'. 3) Le parentesi graffe {} sono aperte e chiuse correttamente. 4) I nomi delle funzioni sono scritti correttamente (pinMode, digitalWrite, analogRead)." },
    { q: "Cosa fa il resistore", a: "Il resistore limita la corrente. Senza resistore, troppa corrente passerebbe nel LED e lo brucerebbe. Il valore in Ohm (\u03A9) determina quanta corrente lascia passare: pi\u00F9 alto il valore, meno corrente." },
    { q: "Come si usa il potenziometro", a: "Il potenziometro ha 3 piedini: VCC (corrente), Signal (uscita variabile), GND (massa). Girando la manopola, cambi la tensione sul pin Signal da 0V a VCC. Collegalo con Arduino ad analogRead() per leggere il valore (0-1023)." },
    { q: "Il simulatore \u00E8 lento", a: "Prova a: 1) Ridurre il numero di componenti. 2) Chiudere altre schede del browser. 3) Se su tablet, assicurati di non avere troppe app aperte. Il simulatore usa molta CPU per calcolare il circuito in tempo reale." },
    { q: "Differenza serie e parallelo", a: "In SERIE: i componenti sono uno dopo l'altro, la corrente \u00E8 uguale ovunque ma la tensione si divide. In PARALLELO: i componenti sono su rami separati, la tensione \u00E8 uguale ma la corrente si divide." },
    { q: "Come funziona analogWrite", a: "analogWrite(pin, valore) controlla la luminosit\u00E0 di un LED o la velocit\u00E0 di un motore. Il valore va da 0 (spento) a 255 (massimo). Funziona solo sui pin PWM (~) di Arduino: 3, 5, 6, 9, 10, 11." },
    { q: "Cos'\u00E8 la breadboard", a: "La breadboard ha fori collegati internamente. Le file a-e sono collegate orizzontalmente (5 fori). Le file f-j pure. Le righe + e - ai lati (bus di alimentazione) corrono lungo tutta la breadboard. La scanalatura centrale separa le due met\u00E0." },
    { q: "Come si aggiunge un componente", a: "Nel simulatore: 1) Nella barra laterale sinistra, clicca sul componente che vuoi. 2) Trascinalo sulla breadboard. 3) I piedini si agganciano ai fori pi\u00F9 vicini. Puoi anche chiedere a UNLIM: 'aggiungi un LED rosso'." },
  ];

  return faqs.map((f, i) => ({
    id: `faq-${i + 1}`,
    text: `Domanda: ${f.q}\nRisposta: ${f.a}`,
    volume: 0,
    chapter: null,
    wordCount: f.a.split(/\s+/).length,
    source: 'faq',
  }));
}

function addCodeExampleChunks() {
  const examples = [
    { title: 'Blink — LED lampeggiante', code: 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }', explain: "Il programma pi\u00F9 semplice: accende il LED sul pin 13 per 1 secondo, lo spegne per 1 secondo, ripete all'infinito." },
    { title: 'Pulsante legge stato', code: 'int buttonPin = 2;\nvoid setup() { pinMode(buttonPin, INPUT_PULLUP); pinMode(13, OUTPUT); }\nvoid loop() { if (digitalRead(buttonPin) == LOW) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); } }', explain: "Legge un pulsante sul pin 2. INPUT_PULLUP attiva la resistenza interna: quando premi il pulsante legge LOW, quando rilasci legge HIGH." },
    { title: 'Potenziometro regola LED', code: 'void setup() { pinMode(9, OUTPUT); }\nvoid loop() { int val = analogRead(A0); int brightness = map(val, 0, 1023, 0, 255); analogWrite(9, brightness); }', explain: "Legge il potenziometro su A0 (0-1023) e usa map() per convertire in luminosit\u00E0 PWM (0-255) sul pin 9." },
    { title: 'Semaforo', code: 'void setup() { pinMode(8, OUTPUT); pinMode(9, OUTPUT); pinMode(10, OUTPUT); }\nvoid loop() { digitalWrite(10, HIGH); delay(5000); digitalWrite(10, LOW); digitalWrite(9, HIGH); delay(2000); digitalWrite(9, LOW); digitalWrite(8, HIGH); delay(5000); digitalWrite(8, LOW); }', explain: "Tre LED (rosso pin 10, giallo pin 9, verde pin 8) si accendono in sequenza come un semaforo: verde 5s, giallo 2s, rosso 5s." },
    { title: 'Codice Morse SOS', code: 'int ledPin = 13;\nvoid dot() { digitalWrite(ledPin, HIGH); delay(200); digitalWrite(ledPin, LOW); delay(200); }\nvoid dash() { digitalWrite(ledPin, HIGH); delay(600); digitalWrite(ledPin, LOW); delay(200); }\nvoid setup() { pinMode(ledPin, OUTPUT); }\nvoid loop() { dot(); dot(); dot(); delay(400); dash(); dash(); dash(); delay(400); dot(); dot(); dot(); delay(1000); }', explain: "SOS in Morse: 3 punti (S), 3 linee (O), 3 punti (S). Le funzioni dot() e dash() semplificano il codice." },
    { title: 'Buzzer suona melodia', code: 'int buzzerPin = 8;\nvoid setup() { }\nvoid loop() { tone(buzzerPin, 262, 500); delay(600); tone(buzzerPin, 294, 500); delay(600); tone(buzzerPin, 330, 500); delay(600); tone(buzzerPin, 349, 500); delay(600); noTone(buzzerPin); delay(1000); }', explain: "Suona Do-Re-Mi-Fa con tone(pin, frequenza, durata). Le frequenze: Do=262Hz, Re=294Hz, Mi=330Hz, Fa=349Hz." },
    { title: 'Sensore luce con LDR', code: 'void setup() { pinMode(13, OUTPUT); Serial.begin(9600); }\nvoid loop() { int luce = analogRead(A0); Serial.println(luce); if (luce < 300) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); } delay(100); }', explain: "Legge il fotoresistore su A0. Se \u00E8 buio (valore <300), accende il LED. Serial.println mostra il valore nel monitor." },
    { title: 'RGB LED colori', code: 'void setup() { pinMode(9, OUTPUT); pinMode(10, OUTPUT); pinMode(11, OUTPUT); }\nvoid setColor(int r, int g, int b) { analogWrite(9, r); analogWrite(10, g); analogWrite(11, b); }\nvoid loop() { setColor(255, 0, 0); delay(1000); setColor(0, 255, 0); delay(1000); setColor(0, 0, 255); delay(1000); setColor(255, 255, 0); delay(1000); }', explain: "Funzione setColor() semplifica il controllo del LED RGB. Ogni colore va da 0 (spento) a 255 (massimo)." },
    { title: 'Servo sweep', code: '#include <Servo.h>\nServo myservo;\nvoid setup() { myservo.attach(9); }\nvoid loop() { for (int pos = 0; pos <= 180; pos++) { myservo.write(pos); delay(15); } for (int pos = 180; pos >= 0; pos--) { myservo.write(pos); delay(15); } }', explain: "Il servo si muove da 0\u00B0 a 180\u00B0 e ritorna. Servo.h \u00E8 una libreria inclusa con Arduino. attach() collega il servo al pin." },
    { title: 'LCD Hello World', code: '#include <LiquidCrystal.h>\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\nvoid setup() { lcd.begin(16, 2); lcd.print("Hello ELAB!"); }\nvoid loop() { lcd.setCursor(0, 1); lcd.print(millis()/1000); }', explain: "Il display LCD 16x2 mostra testo. lcd.begin() inizializza, lcd.print() scrive, lcd.setCursor() posiziona il cursore (colonna, riga)." },
    { title: 'analogRead e Serial', code: 'void setup() { Serial.begin(9600); }\nvoid loop() { int val = analogRead(A0); Serial.print("Valore: "); Serial.println(val); delay(500); }', explain: "Legge un valore analogico (0-1023) dal pin A0 e lo stampa nel Serial Monitor ogni 0.5 secondi. Utile per debug e capire i sensori." },
    { title: 'Pulsante con debounce', code: 'int buttonPin = 2; int ledPin = 13; bool ledState = false; unsigned long lastPress = 0;\nvoid setup() { pinMode(buttonPin, INPUT_PULLUP); pinMode(ledPin, OUTPUT); }\nvoid loop() { if (digitalRead(buttonPin) == LOW && millis() - lastPress > 200) { lastPress = millis(); ledState = !ledState; digitalWrite(ledPin, ledState); } }', explain: "Il debounce evita che un singolo press venga letto come multiplo. 200ms di intervallo minimo tra una lettura e l'altra." },
    { title: 'Fade LED con for', code: 'int ledPin = 9;\nvoid setup() { pinMode(ledPin, OUTPUT); }\nvoid loop() { for (int i = 0; i <= 255; i += 5) { analogWrite(ledPin, i); delay(30); } for (int i = 255; i >= 0; i -= 5) { analogWrite(ledPin, i); delay(30); } }', explain: "Il LED si accende e spegne gradualmente. analogWrite va da 0 a 255. Il for loop incrementa/decrementa di 5 ogni 30ms." },
    { title: 'Mappatura valori', code: 'int potPin = A0; int ledPin = 9;\nvoid setup() { pinMode(ledPin, OUTPUT); }\nvoid loop() { int val = analogRead(potPin); int pwm = map(val, 0, 1023, 0, 255); analogWrite(ledPin, pwm); }', explain: "map(valore, inMin, inMax, outMin, outMax) converte un range in un altro. Qui converte 0-1023 (analogRead) in 0-255 (analogWrite)." },
    { title: 'Lettura temperatura NTC', code: 'void setup() { Serial.begin(9600); }\nvoid loop() { int val = analogRead(A0); float tensione = val * 5.0 / 1023; float tempC = (tensione - 0.5) * 100; Serial.print("Temp: "); Serial.print(tempC); Serial.println(" C"); delay(1000); }', explain: "Legge un sensore di temperatura analogico (come TMP36). Converte il valore ADC in tensione, poi in gradi Celsius." },
  ];

  return examples.map((e, i) => ({
    id: `code-${i + 1}`,
    text: `Esempio codice Arduino — ${e.title}:\n${e.code}\nSpiegazione: ${e.explain}`,
    volume: 3,
    chapter: null,
    wordCount: e.explain.split(/\s+/).length + e.code.split(/\s+/).length,
    source: 'code-example',
  }));
}

function addExperimentTipChunks() {
  const tips = [
    { vol: 1, ch: 6, tip: "Volume 1 Capitolo 6 — I primi circuiti: Inizia sempre dal circuito pi\u00F9 semplice (LED + resistore + batteria). Se funziona, aggiungi un componente alla volta. Non partire mai con il circuito completo!" },
    { vol: 1, ch: 7, tip: "Volume 1 Capitolo 7 — LED RGB: Il LED RGB ha 4 piedini. Il pi\u00F9 lungo \u00E8 il catodo comune (va a GND). Gli altri 3 controllano rosso, verde e blu. Ogni canale ha bisogno del suo resistore!" },
    { vol: 1, ch: 8, tip: "Volume 1 Capitolo 8 — Pulsanti: Ricorda che il pulsante deve stare a cavallo della scanalatura della breadboard. Altrimenti i piedini sono gi\u00E0 collegati e il pulsante sembra sempre premuto." },
    { vol: 1, ch: 9, tip: "Volume 1 Capitolo 9 — Potenziometro: Il potenziometro \u00E8 come una manopola del volume. Ha 3 piedini: corrente in entrata (VCC), corrente regolata in uscita (Signal), e massa (GND)." },
    { vol: 1, ch: 10, tip: "Volume 1 Capitolo 10 — Sensore di luce: L'LDR va usato in un partitore di tensione. Mettilo tra VCC e il punto di lettura, con un resistore da 10k\u03A9 tra il punto di lettura e GND." },
    { vol: 1, ch: 11, tip: "Volume 1 Capitolo 11 — Buzzer: Il buzzer attivo suona appena gli dai corrente. Quello passivo ha bisogno di un segnale alternato (come tone() di Arduino)." },
    { vol: 1, ch: 12, tip: "Volume 1 Capitolo 12 — Reed switch: Il reed switch \u00E8 un interruttore magnetico. Avvicina il magnete e il circuito si chiude. Pi\u00F9 il magnete \u00E8 vicino, pi\u00F9 forte la connessione." },
    { vol: 2, ch: 3, tip: "Volume 2 Capitolo 3 — Resistenze in dettaglio: Le bande colorate indicano il valore. Usa la regola: Nero=0, Marrone=1, Rosso=2, Arancione=3, Giallo=4, Verde=5, Blu=6, Viola=7, Grigio=8, Bianco=9." },
    { vol: 2, ch: 5, tip: "Volume 2 Capitolo 5 — Condensatore: Il condensatore si carica e scarica come un secchio d'acqua. La costante di tempo RC = R \u00D7 C determina quanto velocemente si carica/scarica." },
    { vol: 2, ch: 7, tip: "Volume 2 Capitolo 7 — Condensatori in serie/parallelo: In parallelo le capacit\u00E0 si sommano (C_tot = C1 + C2). In serie si sommano gli inversi (1/C_tot = 1/C1 + 1/C2). Opposto delle resistenze!" },
    { vol: 2, ch: 8, tip: "Volume 2 Capitolo 8 — Transistor MOSFET: Pensa al MOSFET come a un interruttore controllato elettricamente. Il Gate \u00E8 la maniglia: se mandi abbastanza energia, l'interruttore si accende." },
    { vol: 3, ch: 5, tip: "Volume 3 Capitolo 5 — Primi passi Arduino: Prima di scrivere codice, capisci il circuito. setup() si esegue una volta all'avvio, loop() si ripete all'infinito. Usa Serial.println() per debuggare." },
    { vol: 3, ch: 6, tip: "Volume 3 Capitolo 6 — LED digitale: pinMode(pin, OUTPUT) nel setup(), poi digitalWrite(pin, HIGH/LOW) per accendere/spegnere. analogWrite(pin, 0-255) per regolare la luminosit\u00E0 (solo pin PWM: 3,5,6,9,10,11)." },
    { vol: 3, ch: 7, tip: "Volume 3 Capitolo 7 — Input analogico: analogRead(A0) restituisce 0-1023 (10 bit). Usa map() per convertire in altri range. I pin analogici sono A0-A5." },
    { vol: 3, ch: 8, tip: "Volume 3 Capitolo 8 — Output avanzato: tone(pin, freq) genera suoni. La comunicazione seriale (Serial.begin, Serial.print) permette di comunicare tra Arduino e computer." },
  ];

  return tips.map((t, i) => ({
    id: `tip-${i + 1}`,
    text: t.tip,
    volume: t.vol,
    chapter: t.ch,
    wordCount: t.tip.split(/\s+/).length,
    source: 'experiment-tip',
  }));
}

function addSafetyChunks() {
  const safety = [
    "Sicurezza con le batterie: Non cortocircuitare mai una batteria (collegare direttamente + e -). La batteria si scalda e pu\u00F2 essere pericolosa. Usa sempre un resistore nel circuito.",
    "Sicurezza con i LED: I LED si bruciano se ricevono troppa corrente. Usa SEMPRE un resistore (220-470\u03A9) in serie con ogni LED. Un LED bruciato non si pu\u00F2 riparare.",
    "Sicurezza con i condensatori: I condensatori elettrolitici hanno polarit\u00E0 (+ e -). Se collegati al contrario possono gonfiarsi o esplodere con tensioni alte. Nei nostri circuiti a 9V il rischio \u00E8 basso ma fai attenzione.",
    "Sicurezza nel simulatore: Nel simulatore ELAB non puoi bruciare componenti reali! \u00C8 un posto sicuro per sperimentare. Se qualcosa non funziona, premi 'Annulla' o 'Reset' e riprova.",
    "Regola d'oro del debugging: Se il circuito non funziona, togli tutto e riparti dal componente pi\u00F9 semplice. Aggiungi un pezzo alla volta finch\u00E9 non trovi dove si rompe.",
    "Come chiedere aiuto a UNLIM: Descrivi cosa hai fatto e cosa ti aspetti. 'Il LED dovrebbe accendersi ma non si accende' \u00E8 meglio di 'non funziona'. Pi\u00F9 dettagli dai, migliore sar\u00E0 l'aiuto.",
    "Prima di iniziare un esperimento: 1) Leggi la descrizione completa. 2) Identifica i componenti necessari. 3) Guarda lo schema. 4) Costruisci un passo alla volta. 5) Testa dopo ogni passo.",
    "Errori comuni dei principianti: 1) Fili nel foro sbagliato. 2) LED al contrario. 3) Bus di alimentazione non collegato. 4) Pulsante messo male. 5) Dimenticare il resistore.",
    "Come leggere gli errori di compilazione: L'errore indica la riga e il tipo di problema. 'expected ;' = manca un punto e virgola. 'was not declared' = variabile non definita. Vai alla riga indicata!",
    "Buone pratiche di programmazione Arduino: 1) Usa nomi descrittivi per le variabili (ledPin, buttonPin). 2) Commenta il codice con //. 3) Testa spesso. 4) Usa Serial.println() per debuggare.",
    "GDPR e privacy in ELAB: Non salviamo dati personali. Usiamo solo codice classe + nickname. Nessun cookie di tracciamento. I dati restano nel tuo browser (localStorage).",
    "Come funziona il simulatore: Il simulatore calcola correnti e tensioni in tempo reale usando le leggi di Kirchhoff. I componenti si comportano come nella realt\u00E0, inclusi cortocircuiti e LED bruciati!",
    "Modalit\u00E0 di costruzione: 'Passo Passo' ti guida componente per componente. 'Gi\u00E0 Montato' mostra il circuito completo. 'Libero' ti lascia costruire da zero. Per iniziare, usa sempre 'Passo Passo'.",
    "Come usare il Serial Monitor: Apri l'editor di codice, scrivi Serial.begin(9600) nel setup() e Serial.println(valore) nel loop(). Clicca 'Compila & Carica'. Il monitor seriale mostra i messaggi.",
    "Suggerimenti per il docente: Proietta il simulatore sulla LIM. Segui i passi del pannello 'Guida'. Fai domande dopo ogni passo. Lascia che i bambini provino prima di dare la soluzione.",
  ];

  return safety.map((s, i) => ({
    id: `safety-${i + 1}`,
    text: s,
    volume: 0,
    chapter: null,
    wordCount: s.split(/\s+/).length,
    source: 'safety-guide',
  }));
}

function addErrorChunks() {
  const errors = [
    // LED errors
    { component: 'LED', error: "LED non si accende — polarit\u00E0 invertita", fix: "Il piedino pi\u00F9 lungo (anodo) deve andare al + e il pi\u00F9 corto (catodo) al -. Se il LED \u00E8 al contrario, non si accende ma non si rompe. Gira il LED e riprova." },
    { component: 'LED', error: "LED bruciato — manca il resistore", fix: "Senza resistore, troppa corrente passa nel LED e lo brucia. Aggiungi sempre un resistore da 220-470\u03A9 in serie con il LED." },
    { component: 'LED', error: "LED molto fioco", fix: "Il resistore potrebbe avere un valore troppo alto. Prova un resistore pi\u00F9 piccolo (220\u03A9 invece di 1k\u03A9). Oppure controlla che la batteria sia carica." },
    { component: 'LED RGB', error: "Solo un colore del RGB funziona", fix: "Ogni pin del LED RGB (rosso, verde, blu) ha bisogno del suo resistore e del suo collegamento al + o ad Arduino. Controlla tutti e 3 i canali." },
    { component: 'LED RGB', error: "Colore sbagliato nel RGB", fix: "I pin del LED RGB variano per modello. Il pin pi\u00F9 lungo \u00E8 il catodo comune (va a GND). Gli altri 3 sono R, G, B. Prova a scambiare i fili." },
    // Breadboard errors
    { component: 'Breadboard', error: "Componenti non collegati", fix: "Ricorda: le file a-e e f-j sono collegate orizzontalmente. La scanalatura centrale SEPARA le due met\u00E0. Assicurati che i fili collegano fori nella stessa fila o tra bus e fori." },
    { component: 'Breadboard', error: "Bus di alimentazione non collegato", fix: "Le righe + e - ai lati della breadboard NON sono collegate tra di loro automaticamente. Devi collegare la riga + alla batteria e la riga - al GND con dei fili." },
    { component: 'Breadboard', error: "Fili nel foro sbagliato", fix: "Controlla attentamente le lettere (a-j) e i numeri (1-30/63) dei fori. Un foro sbagliato = collegamento sbagliato = circuito non funziona." },
    // Button errors
    { component: 'Pulsante', error: "Pulsante non funziona", fix: "Il pulsante ha 4 piedini collegati a coppie. Deve essere posizionato a cavallo della scanalatura centrale della breadboard. Se \u00E8 in una sola met\u00E0, i piedini sono gi\u00E0 collegati e il pulsante \u00E8 sempre 'premuto'." },
    { component: 'Pulsante', error: "LED sempre acceso anche senza premere", fix: "Probabilmente il pulsante \u00E8 montato male (tutti i piedini nella stessa met\u00E0 della breadboard). Giralo di 90\u00B0 o posizionalo a cavallo della scanalatura." },
    // Potentiometer errors
    { component: 'Potenziometro', error: "Potenziometro non cambia nulla", fix: "Controlla i 3 piedini: VCC va al +, GND al -, Signal va al circuito/Arduino. Se VCC e GND sono invertiti, il pot funziona al contrario. Se Signal non \u00E8 collegato, non fa nulla." },
    { component: 'Potenziometro', error: "Valore instabile/che salta", fix: "Con Arduino, il valore analogRead pu\u00F2 saltare se il circuito ha rumore. Aggiungi un condensatore da 100nF tra Signal e GND per stabilizzare." },
    // Arduino errors
    { component: 'Arduino', error: "Il codice non compila — 'expected ;'", fix: "Ogni istruzione in C++ deve finire con punto e virgola (;). Controlla la riga indicata nell'errore. Probabilmente manca un ; alla fine." },
    { component: 'Arduino', error: "Il codice non compila — 'was not declared'", fix: "Il nome della variabile o funzione \u00E8 scritto diversamente da dove \u00E8 stato definito. C++ \u00E8 case-sensitive: 'led' e 'LED' sono diversi. Controlla maiuscole/minuscole." },
    { component: 'Arduino', error: "Il LED lampeggia troppo veloce/lento", fix: "Modifica il valore di delay() nel codice. delay(1000) = 1 secondo, delay(500) = mezzo secondo, delay(100) = molto veloce. Il numero \u00E8 in millisecondi." },
    { component: 'Arduino', error: "analogRead restituisce sempre 0", fix: "Controlla: 1) Il pin analogico \u00E8 corretto (A0-A5). 2) Il componente \u00E8 collegato al pin giusto. 3) Il potenziometro ha VCC e GND collegati. 4) Il pin nel codice corrisponde a quello fisico." },
    { component: 'Arduino', error: "Pin digitale non funziona", fix: "Assicurati di aver chiamato pinMode(pin, OUTPUT) nel setup() prima di usare digitalWrite(). I pin 0 e 1 sono usati per la comunicazione seriale, evitali." },
    // Circuit errors
    { component: 'Circuito', error: "Cortocircuito — la batteria si scalda", fix: "C'\u00E8 un percorso diretto dal + al - senza resistenza. Controlla tutti i fili: nessun filo deve collegare direttamente + e - senza passare per almeno un componente con resistenza." },
    { component: 'Circuito', error: "Nessun componente funziona", fix: "Controlla: 1) La batteria \u00E8 collegata. 2) Il + va alla riga + della breadboard. 3) Il - va alla riga -. 4) C'\u00E8 un percorso chiuso dal + attraverso i componenti fino al -." },
    { component: 'Circuito', error: "Solo un componente funziona su 3", fix: "Se i componenti sono in parallelo, controlla che ogni ramo abbia un percorso completo verso + e -. Se sono in serie, un componente rotto interrompe tutto il circuito." },
    // Condensatore
    { component: 'Condensatore', error: "Il condensatore non si carica", fix: "Controlla la polarit\u00E0: i condensatori elettrolitici hanno + e -. Il piedino lungo \u00E8 +. Se invertito, non funziona (e potrebbe essere pericoloso con tensioni alte)." },
    // MOSFET
    { component: 'MOSFET', error: "Il MOSFET non si accende", fix: "Il MOSFET ha bisogno di abbastanza tensione al Gate. Controlla: 1) Il Gate \u00E8 collegato? 2) La tensione al Gate \u00E8 sufficiente (>2V tipicamente). 3) Il Drain va al componente, il Source a GND." },
    // Buzzer
    { component: 'Buzzer', error: "Il buzzer non suona", fix: "Controlla la polarit\u00E0: il + del buzzer va al +. Con Arduino, usa tone(pin, frequenza) per generare un suono. Il buzzer passivo ha bisogno di un segnale PWM, quello attivo funziona con semplice corrente continua." },
    // Servo
    { component: 'Servo', error: "Il servo non si muove", fix: "Il servo ha 3 fili: rosso (VCC, 5V), marrone/nero (GND), arancione (Signal). Usa la libreria Servo.h e servo.write(angolo) per controllarlo. L'angolo va da 0 a 180 gradi." },
    // Fotoresistore
    { component: 'LDR', error: "Il fotoresistore non risponde alla luce", fix: "L'LDR va in un partitore di tensione con un resistore fisso (10k\u03A9 tipicamente). Collegalo tra VCC e il punto di lettura, con il resistore tra il punto di lettura e GND. Leggi con analogRead()." },
  ];

  return errors.map((e, i) => ({
    id: `error-${i + 1}`,
    text: `Errore comune — ${e.component}: ${e.error}\nSoluzione: ${e.fix}`,
    volume: 0,
    chapter: null,
    wordCount: e.fix.split(/\s+/).length,
    source: 'error-guide',
    component: e.component,
  }));
}

function addAnalogyChunks() {
  const analogies = [
    { concept: 'Corrente elettrica', analogy: "La corrente elettrica \u00E8 come l'acqua in un tubo. La batteria \u00E8 la pompa che spinge l'acqua. I fili sono i tubi. I componenti sono come ostacoli o apparecchi lungo il percorso dell'acqua." },
    { concept: 'Tensione', analogy: "La tensione \u00E8 come la pressione dell'acqua. Pi\u00F9 alta la pressione (tensione), pi\u00F9 forte scorre l'acqua (corrente). Una batteria da 9V ha pi\u00F9 'pressione' di una da 1.5V." },
    { concept: 'Resistenza', analogy: "La resistenza \u00E8 come un tubo stretto: rallenta l'acqua (corrente). Un resistore grande \u00E8 come un tubo molto stretto — passa poca acqua. Un resistore piccolo \u00E8 un tubo largo — passa molta acqua." },
    { concept: 'LED come valvola', analogy: "Il LED \u00E8 come una valvola che fa passare l'acqua solo in una direzione e si illumina quando l'acqua scorre. Se lo metti al contrario, l'acqua non passa e non si accende." },
    { concept: 'Circuito serie come catena', analogy: "Un circuito in serie \u00E8 come una catena: se un anello si rompe, tutta la catena si spezza. Tutti i componenti sono collegati uno dopo l'altro, e la corrente deve passare attraverso tutti." },
    { concept: 'Circuito parallelo come autostrada', analogy: "Un circuito in parallelo \u00E8 come un'autostrada con pi\u00F9 corsie: se una corsia \u00E8 bloccata, le auto (corrente) passano dalle altre. Ogni componente ha il suo percorso indipendente." },
    { concept: 'Condensatore come secchio', analogy: "Il condensatore \u00E8 come un secchio: si riempie d'acqua (carica) lentamente e poi la rilascia. Pi\u00F9 grande il secchio (capacit\u00E0 in Farad), pi\u00F9 acqua pu\u00F2 contenere e pi\u00F9 tempo ci mette a riempirsi/svuotarsi." },
    { concept: 'Pulsante come porta', analogy: "Il pulsante \u00E8 come una porta: quando la premi si apre e l'acqua (corrente) passa. Quando la rilasci si chiude e l'acqua si ferma. \u00C8 un controllo on/off istantaneo." },
    { concept: 'Potenziometro come rubinetto', analogy: "Il potenziometro \u00E8 come un rubinetto: girando la manopola regoli quanta acqua passa. Tutto chiuso = 0V, tutto aperto = tensione massima. Il punto intermedio d\u00E0 tensioni intermedie." },
    { concept: 'MOSFET come cancello', analogy: "Il MOSFET \u00E8 come un cancello elettronico: mandi un segnale al Gate (la maniglia) e il cancello si apre, facendo passare la corrente dal Drain al Source. Senza segnale, il cancello resta chiuso." },
    { concept: 'Arduino come cervello', analogy: "Arduino \u00E8 il cervello del circuito: legge i sensi (sensori) e decide cosa fare (accendere LED, suonare buzzer, muovere motori). Il programma \u00E8 come le istruzioni che dai al cervello." },
    { concept: 'PWM come ventilatore', analogy: "Il PWM \u00E8 come accendere e spegnere un ventilatore molto velocemente: se lo accendi per met\u00E0 del tempo, sembra andare a met\u00E0 velocit\u00E0. Con il LED, sembra essere a met\u00E0 luminosit\u00E0." },
    { concept: 'Breadboard come hotel', analogy: "La breadboard \u00E8 come un hotel: ogni piano (fila) ha camere (fori) collegate tra loro. La scanalatura \u00E8 il corridoio che separa le due ali. Le righe + e - sono come l'ascensore che porta energia a tutti i piani." },
    { concept: 'Bus di alimentazione come acquedotto', analogy: "Le righe + e - della breadboard sono come l'acquedotto di un palazzo: portano l'acqua (corrente) a tutti gli appartamenti (componenti). Il + \u00E8 l'acqua in pressione, il - \u00E8 lo scarico." },
    { concept: 'Codice Arduino come ricetta', analogy: "Il codice Arduino \u00E8 come una ricetta di cucina: setup() \u00E8 la preparazione degli ingredienti (fatta una volta), loop() \u00E8 il procedimento che ripeti (cuoci, mescola, assaggia, ripeti). Le variabili sono gli ingredienti." },
    { concept: 'LDR come occhio', analogy: "Il fotoresistore (LDR) \u00E8 come un occhio: quando c'\u00E8 molta luce la pupilla (resistenza) si restringe, quando \u00E8 buio si allarga. Collegato ad Arduino, pu\u00F2 far reagire il circuito alla luce." },
    { concept: 'Cortocircuito come alluvione', analogy: "Un cortocircuito \u00E8 come quando un fiume straripa: l'acqua (corrente) prende il percorso pi\u00F9 facile bypassando tutto. Troppa acqua tutta insieme = danni! Per questo servono i resistori (dighe)." },
    { concept: 'Variabili come cassetti', analogy: "Le variabili in Arduino sono come cassetti etichettati: int ledPin = 13 crea un cassetto chiamato 'ledPin' e ci mette dentro il numero 13. Quando scrivi ledPin nel codice, Arduino apre il cassetto e legge 13." },
    { concept: 'Funzioni come minigiochi', analogy: "Le funzioni sono come minigiochi: setup() \u00E8 il gioco 'prepara tutto', loop() \u00E8 il gioco 'ripeti all'infinito'. Puoi creare i tuoi minigiochi (funzioni) e richiamarli quando vuoi." },
    { concept: 'Multimetro come termometro', analogy: "Il multimetro \u00E8 come un termometro per l'elettricit\u00E0: misura la 'temperatura' (tensione), il 'flusso' (corrente) e la 'strettoia' (resistenza) del circuito. Mettilo nel punto che vuoi controllare." },
    { concept: 'Serial Monitor come walkie-talkie', analogy: "Il Serial Monitor \u00E8 come un walkie-talkie tra te e Arduino: con Serial.print() Arduino ti manda messaggi, con Serial.read() tu mandi messaggi ad Arduino. Perfetto per debuggare!" },
    { concept: 'Diodo come porta girevole', analogy: "Il diodo \u00E8 come una porta girevole che gira solo in una direzione: la corrente passa in un verso ma non nell'altro. Il LED \u00E8 un diodo speciale che si illumina quando la corrente passa." },
    { concept: 'Reed switch come cassaforte magnetica', analogy: "Il reed switch \u00E8 come la serratura di una cassaforte magnetica: solo il magnete giusto (abbastanza vicino) pu\u00F2 aprirla. Quando il magnete si avvicina, le lamelle interne si toccano e il circuito si chiude." },
    { concept: 'if/else come bivio', analogy: "if/else in Arduino \u00E8 come un bivio sulla strada: se la condizione \u00E8 vera (if), vai a destra. Se \u00E8 falsa (else), vai a sinistra. Ogni bivio ha esattamente 2 strade possibili." },
    { concept: 'for loop come giro di pista', analogy: "Il for loop \u00E8 come fare giri di pista: 'per i da 0 a 9, fai un giro'. Ogni giro, i aumenta di 1. Dopo 10 giri, esci dalla pista e continui con il resto del programma." },
  ];

  return analogies.map((a, i) => ({
    id: `analogy-${i + 1}`,
    text: `Analogia — ${a.concept}: ${a.analogy}`,
    volume: 0,
    chapter: null,
    wordCount: a.analogy.split(/\s+/).length,
    source: 'analogy',
    concept: a.concept,
  }));
}

// Main
console.log('Generating RAG chunks from ELAB volumes...');

const allChunks = [];

for (const vol of VOLUMES) {
  try {
    const text = readFileSync(vol.path, 'utf-8');
    const clean = cleanText(text);
    const chunks = chunkText(clean, vol.volume);
    allChunks.push(...chunks);
    console.log(`  ${vol.title}: ${chunks.length} chunks (${clean.length} chars)`);
  } catch (e) {
    console.error(`  Error reading ${vol.path}:`, e.message);
  }
}

// Add Arduino code examples
const codeChunks = addCodeExampleChunks();
allChunks.push(...codeChunks);
console.log(`  Esempi codice: ${codeChunks.length} entries`);

// Add experiment tips per chapter
const tipChunks = addExperimentTipChunks();
allChunks.push(...tipChunks);
console.log(`  Tips esperimenti: ${tipChunks.length} entries`);

// Add safety and best practices
const safetyChunks = addSafetyChunks();
allChunks.push(...safetyChunks);
console.log(`  Sicurezza: ${safetyChunks.length} entries`);

// Add common errors per component
const errorChunks = addErrorChunks();
allChunks.push(...errorChunks);
console.log(`  Errori comuni: ${errorChunks.length} entries`);

// Add analogy chunks for concepts
const analogyChunks = addAnalogyChunks();
allChunks.push(...analogyChunks);
console.log(`  Analogie: ${analogyChunks.length} entries`);

// Add glossary and FAQ chunks
const glossaryChunks = addGlossaryChunks();
allChunks.push(...glossaryChunks);
console.log(`  Glossary: ${glossaryChunks.length} entries`);

const faqChunks = addFAQChunks();
allChunks.push(...faqChunks);
console.log(`  FAQ: ${faqChunks.length} entries`);

console.log(`\nTotal: ${allChunks.length} chunks`);

// Write output
writeFileSync(OUTPUT, JSON.stringify(allChunks, null, 2), 'utf-8');
console.log(`Written to: ${OUTPUT}`);
