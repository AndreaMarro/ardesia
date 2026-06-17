/**
 * Pre-generated circuit reviews for offline fallback.
 * Used when CircuitReview AI API is unavailable.
 * © Andrea Marro — 31/03/2026 — G53
 */

const REVIEW_CIRCUITS = [
  {
    description: 'Un circuito con una batteria da 9V, un resistore da 470 ohm e un LED rosso collegati in serie sulla breadboard.',
    components: ['Batteria 9V', 'Resistore 470Ω', 'LED rosso'],
    questions: [
      { text: 'Il circuito e collegato in serie o in parallelo?', options: ['Serie', 'Parallelo', 'Misto'], correct: 0, explanation: 'I componenti sono uno dopo l\'altro, come vagoni di un treno. Questo e un circuito in serie!' },
      { text: 'Cosa succede se togli il resistore?', options: ['Il LED si spegne', 'Il LED brilla di piu e poi si brucia', 'Non cambia nulla'], correct: 1, explanation: 'Senza resistore, troppa corrente passa nel LED e lo brucia. Il resistore lo protegge!' },
      { text: 'Se il LED non si accende, quale potrebbe essere il problema?', options: ['Il LED e al contrario', 'Serve un secondo resistore', 'La batteria e troppo potente'], correct: 0, explanation: 'I LED funzionano solo in una direzione. Se e invertito, non si accende!' },
    ],
  },
  {
    description: 'Due LED (rosso e verde) collegati in parallelo con un resistore ciascuno, alimentati da una batteria 9V.',
    components: ['Batteria 9V', 'Resistore 220Ω (x2)', 'LED rosso', 'LED verde'],
    questions: [
      { text: 'Se scolleghi il LED rosso, cosa succede al verde?', options: ['Si spegne anche lui', 'Resta acceso normalmente', 'Brilla di piu'], correct: 1, explanation: 'In parallelo, ogni ramo e indipendente. Il LED verde continua a funzionare!' },
      { text: 'Perche ci sono due resistori invece di uno solo?', options: ['Per sicurezza extra', 'Ogni LED ha bisogno del suo resistore', 'E un errore'], correct: 1, explanation: 'In parallelo, ogni LED deve avere il suo resistore per limitare la corrente nel suo ramo.' },
    ],
  },
  {
    description: 'Un Arduino Nano con un LED collegato al pin 13 tramite un resistore da 220 ohm. Il codice fa lampeggiare il LED.',
    components: ['Arduino Nano', 'Resistore 220Ω', 'LED giallo', 'Breadboard'],
    questions: [
      { text: 'Quale funzione Arduino accende il LED?', options: ['analogWrite', 'digitalWrite(pin, HIGH)', 'Serial.print'], correct: 1, explanation: 'digitalWrite(pin, HIGH) manda 5V al pin, accendendo il LED!' },
      { text: 'Cosa fa la funzione delay(1000)?', options: ['Aspetta 1 secondo', 'Aspetta 1 millisecondo', 'Spegne il LED'], correct: 0, explanation: 'delay(1000) ferma il programma per 1000 millisecondi = 1 secondo.' },
      { text: 'Se il LED non lampeggia ma resta sempre acceso, quale potrebbe essere il problema nel codice?', options: ['Manca il delay', 'Manca il digitalWrite LOW', 'Il pin e sbagliato'], correct: 1, explanation: 'Se non scrivi digitalWrite(pin, LOW), il LED resta sempre acceso! Servono sia HIGH che LOW per lampeggiare.' },
    ],
  },
  {
    description: 'Un circuito con un pulsante collegato al pin 2 di Arduino e un LED sul pin 13. Premendo il pulsante, il LED si accende.',
    components: ['Arduino Nano', 'Pulsante', 'Resistore 10KΩ (pull-down)', 'LED', 'Resistore 220Ω'],
    questions: [
      { text: 'A cosa serve il resistore da 10KΩ collegato al pulsante?', options: ['Protegge il pulsante', 'E un resistore pull-down', 'Limita la corrente nel LED'], correct: 1, explanation: 'Il resistore pull-down tiene il pin a 0V (LOW) quando il pulsante non e premuto. Senza di lui, il pin "fluttua" e da valori casuali!' },
      { text: 'Quale funzione Arduino legge lo stato del pulsante?', options: ['analogRead', 'digitalRead', 'Serial.read'], correct: 1, explanation: 'digitalRead(pin) legge se il pin e HIGH (premuto) o LOW (rilasciato).' },
    ],
  },
  {
    description: 'Un circuito con un potenziometro collegato al pin A0 di Arduino. Il valore letto viene mostrato sul Monitor Seriale.',
    components: ['Arduino Nano', 'Potenziometro 10KΩ', 'Breadboard'],
    questions: [
      { text: 'Che valori restituisce analogRead?', options: ['0 o 1', 'Da 0 a 255', 'Da 0 a 1023'], correct: 2, explanation: 'analogRead restituisce un numero da 0 a 1023 (10 bit). 0 = 0V, 1023 = 5V.' },
      { text: 'Se ruoti il potenziometro tutto a destra, quale valore ti aspetti?', options: ['0', '512', '1023'], correct: 2, explanation: 'Tutto a destra = massima tensione = 5V = 1023!' },
      { text: 'Come fai a vedere il valore sul computer?', options: ['Con digitalWrite', 'Con Serial.println', 'Con analogWrite'], correct: 1, explanation: 'Serial.println() manda il valore al Monitor Seriale dove puoi leggerlo sul computer.' },
    ],
  },
  {
    description: 'Tre LED (rosso, giallo, verde) collegati ai pin 8, 9 e 10 di Arduino per fare un semaforo. Si accendono in sequenza.',
    components: ['Arduino Nano', 'LED rosso', 'LED giallo', 'LED verde', 'Resistore 220Ω (x3)'],
    questions: [
      { text: 'Quanti pin digitali di Arduino servono per controllare 3 LED?', options: ['1', '3', '6'], correct: 1, explanation: 'Ogni LED ha bisogno del suo pin. 3 LED = 3 pin!' },
      { text: 'Come fai ad accendere solo il LED verde e spegnere gli altri?', options: ['Basta scrivere digitalWrite(verde, HIGH)', 'Devi fare HIGH sul verde e LOW sugli altri due', 'Si accendono tutti insieme'], correct: 1, explanation: 'Devi esplicitamente spegnere rosso e giallo con LOW, e accendere verde con HIGH.' },
    ],
  },
  {
    description: 'Un buzzer piezoelettrico collegato al pin 5 di Arduino che emette un suono quando premi un pulsante.',
    components: ['Arduino Nano', 'Buzzer piezo', 'Pulsante', 'Resistore 10KΩ'],
    questions: [
      { text: 'Quale funzione Arduino produce un suono sul buzzer?', options: ['digitalWrite', 'tone(pin, frequenza)', 'analogWrite'], correct: 1, explanation: 'tone(pin, frequenza) genera un\'onda quadra alla frequenza specificata. 440 = nota LA!' },
      { text: 'Come fermi il suono?', options: ['digitalWrite(pin, LOW)', 'noTone(pin)', 'delay(0)'], correct: 1, explanation: 'noTone(pin) ferma il suono generato da tone().' },
    ],
  },
  {
    description: 'Un sensore di luce (LDR) collegato al pin A0. Il valore letto controlla la luminosita di un LED tramite PWM.',
    components: ['Arduino Nano', 'LDR', 'Resistore 10KΩ', 'LED', 'Resistore 220Ω'],
    questions: [
      { text: 'Cosa cambia nel LDR quando c\'e piu luce?', options: ['La resistenza aumenta', 'La resistenza diminuisce', 'Non cambia'], correct: 1, explanation: 'Piu luce = meno resistenza. Il LDR (Light Dependent Resistor) e sensibile alla luce!' },
      { text: 'Quale funzione controlla la luminosita del LED gradualmente?', options: ['digitalWrite', 'analogWrite', 'tone'], correct: 1, explanation: 'analogWrite(pin, valore) usa il PWM per variare la luminosita da 0 (spento) a 255 (massimo).' },
      { text: 'Come converti il valore da 0-1023 (analogRead) a 0-255 (analogWrite)?', options: ['Dividi per 4', 'Usa la funzione map()', 'Entrambe le risposte'], correct: 2, explanation: 'Puoi dividere per 4 oppure usare map(valore, 0, 1023, 0, 255). Entrambi funzionano!' },
    ],
  },
  {
    description: 'Due resistori in serie collegati a una batteria 9V. Un multimetro misura la tensione ai capi del secondo resistore.',
    components: ['Batteria 9V', 'Resistore 330Ω', 'Resistore 680Ω'],
    questions: [
      { text: 'La tensione ai capi del resistore da 680Ω e maggiore o minore di quella ai capi del 330Ω?', options: ['Maggiore', 'Minore', 'Uguale'], correct: 0, explanation: 'In un partitore di tensione, il resistore piu grande "prende" piu tensione. 680Ω > 330Ω, quindi ha piu tensione.' },
      { text: 'Quanto vale la corrente nel circuito?', options: ['9mA', 'Circa 8.9mA', 'Circa 27mA'], correct: 1, explanation: 'I = V/R = 9V / (330+680)Ω = 9/1010 ≈ 8.9mA. La stessa corrente passa in entrambi i resistori in serie!' },
    ],
  },
  {
    description: 'Un servo motore SG90 collegato al pin 9 di Arduino. Il codice muove il braccio del servo avanti e indietro.',
    components: ['Arduino Nano', 'Servo SG90', 'Breadboard'],
    questions: [
      { text: 'Quale libreria Arduino serve per controllare un servo?', options: ['Wire.h', 'Servo.h', 'Motor.h'], correct: 1, explanation: 'La libreria Servo.h fornisce le funzioni per controllare i servo motori.' },
      { text: 'Che angoli puo raggiungere il servo SG90?', options: ['Da 0 a 90 gradi', 'Da 0 a 180 gradi', 'Da 0 a 360 gradi'], correct: 1, explanation: 'Il servo SG90 si muove da 0 a 180 gradi. Non fa giri completi!' },
      { text: 'Quale funzione imposta l\'angolo del servo?', options: ['servo.write(angolo)', 'servo.move(angolo)', 'analogWrite(pin, angolo)'], correct: 0, explanation: 'servo.write(90) posiziona il servo a 90 gradi (centro).' },
    ],
  },
];

export default REVIEW_CIRCUITS;
