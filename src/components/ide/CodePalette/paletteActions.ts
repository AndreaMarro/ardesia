export type PaletteAction = {
  id: string;
  label: string;
  description: string;
  category: 'Output' | 'Tempo' | 'Setup' | 'Input' | 'Seriale' | 'Controllo';
  snippet: string;
  preview: string;
};

export const PALETTE_ACTIONS: PaletteAction[] = [
  {
    id: 'accendi-led',
    label: 'Accendi LED',
    description: 'Porta il pin 13 a HIGH.',
    category: 'Output',
    snippet: 'digitalWrite(13, HIGH);',
    preview: 'digitalWrite(13, HIGH);',
  },
  {
    id: 'spegni-led',
    label: 'Spegni LED',
    description: 'Porta il pin 13 a LOW.',
    category: 'Output',
    snippet: 'digitalWrite(13, LOW);',
    preview: 'digitalWrite(13, LOW);',
  },
  {
    id: 'attendi',
    label: 'Attendi',
    description: 'Ferma il programma per mezzo secondo.',
    category: 'Tempo',
    snippet: 'delay(500);',
    preview: 'delay(500);',
  },
  {
    id: 'configura-pin',
    label: 'Configura pin',
    description: 'Imposta il pin 13 come uscita.',
    category: 'Setup',
    snippet: 'pinMode(13, OUTPUT);',
    preview: 'pinMode(13, OUTPUT);',
  },
  {
    id: 'leggi-pulsante',
    label: 'Leggi pulsante',
    description: 'Legge lo stato digitale dal pin 2.',
    category: 'Input',
    snippet: 'int pulsante = digitalRead(2);',
    preview: 'digitalRead(2);',
  },
  {
    id: 'scrivi-pwm',
    label: 'Scrivi PWM',
    description: 'Regola la luminosita sul pin 9.',
    category: 'Output',
    snippet: 'analogWrite(9, 128);',
    preview: 'analogWrite(9, 128);',
  },
  {
    id: 'leggi-analogico',
    label: 'Leggi analogico',
    description: 'Legge un valore da A0.',
    category: 'Input',
    snippet: 'int valore = analogRead(A0);',
    preview: 'analogRead(A0);',
  },
  {
    id: 'stampa-seriale',
    label: 'Stampa seriale',
    description: 'Scrive un messaggio sul monitor seriale.',
    category: 'Seriale',
    snippet: 'Serial.println("Ciao da ELAB");',
    preview: 'Serial.println(...);',
  },
  {
    id: 'ripeti-ciclo',
    label: 'Ripeti ciclo',
    description: 'Esegue tre ripetizioni numerate.',
    category: 'Controllo',
    snippet: 'for (int i = 0; i < 3; i++) {\n  // azione\n}',
    preview: 'for (...) { }',
  },
];

export const PALETTE_CATEGORIES = ['Output', 'Tempo', 'Setup', 'Input', 'Seriale', 'Controllo'] as const;
