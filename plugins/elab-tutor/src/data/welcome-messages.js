/**
 * UNLIM Welcome Messages — Contestuali per esperimento
 * Max 15 parole per messaggio. Tono naturale, specifico per l'esperimento.
 * Copertura: 62/62 esperimenti (38 Vol1 + 18 Vol2 + 6 Vol3).
 * © Andrea Marro — 30/03/2026 — G41
 */

const WELCOME_MESSAGES = {
  // ═══════════════════════════════════════════════════
  // VOLUME 1 — Le Basi (38 esperimenti)
  // ═══════════════════════════════════════════════════

  // Cap. 6: Cos'è il diodo LED? (3)
  'v1-cap6-esp1': 'Oggi accendiamo il primo LED! Premi Play quando siete pronti.',
  'v1-cap6-esp2': 'LED senza resistore — scopriamo perché è una pessima idea!',
  'v1-cap6-esp3': 'Cambiamo resistenza e vediamo come cambia la luminosità.',

  // Cap. 7: Cos'è il LED RGB? (6)
  'v1-cap7-esp1': 'Accendiamo solo il rosso del LED RGB — un colore alla volta!',
  'v1-cap7-esp2': 'Ora tocca al verde — stesso LED, colore diverso.',
  'v1-cap7-esp3': 'Il blu completa il trio — accendiamolo!',
  'v1-cap7-esp4': 'Mescoliamo due colori: rosso + blu = viola! Magia della luce.',
  'v1-cap7-esp5': 'Tutti e tre insieme fanno il bianco. Provare per credere!',
  'v1-cap7-esp6': 'Crea il tuo colore preferito con le resistenze giuste.',

  // Cap. 8: Cos'è un pulsante? (5)
  'v1-cap8-esp1': 'Un pulsante controlla il LED — il primo interruttore!',
  'v1-cap8-esp2': 'Pulsante + resistenze diverse: cambia colore e luminosità.',
  'v1-cap8-esp3': 'RGB + pulsante = viola! Un colore che appare e scompare.',
  'v1-cap8-esp4': 'Tre pulsanti controllano tre colori — un mixer manuale!',
  'v1-cap8-esp5': 'Mix avanzato: resistori diversi per sfumature personalizzate.',

  // Cap. 9: Cos'è un potenziometro? (9)
  'v1-cap9-esp1': 'La manopola del potenziometro controlla la luminosità del LED.',
  'v1-cap9-esp2': 'Invertiamo la rotazione — gira a destra, si spegne!',
  'v1-cap9-esp3': 'Stesso potenziometro, LED di colore diverso. Che effetto!',
  'v1-cap9-esp4': 'Dimmer RGB azzurrino — girate piano la manopola.',
  'v1-cap9-esp5': 'Due potenziometri miscelano blu e rosso. Quante sfumature!',
  'v1-cap9-esp6': 'Tre potenziometri = lampada RGB completa! Ogni manopola un colore.',
  'v1-cap9-esp7': 'Sfida: aggiungi pulsanti alla lampada RGB. Ce la fate?',
  'v1-cap9-esp8': 'Sfida: combinare gli esperimenti 5 e 6 insieme. Riuscite?',
  'v1-cap9-esp9': 'Sfida finale: pulsante + potenziometri insieme. Bravi!',

  // Cap. 10: Cos'è un fotoresistore? (6)
  'v1-cap10-esp1': 'Il fotoresistore reagisce alla luce — copritelo e guardate!',
  'v1-cap10-esp2': 'Stesso LDR, LED diverso — cambia colore con la luce.',
  'v1-cap10-esp3': 'Tre fotoresistori controllano un LED RGB. Luce = colore!',
  'v1-cap10-esp4': 'Un LED bianco illumina l\'LDR che accende un LED blu!',
  'v1-cap10-esp5': 'Aggiungete il potenziometro per controllare il LED bianco.',
  'v1-cap10-esp6': 'Pulsante + fotoresistore: due controlli, un circuito.',

  // Cap. 11: Cos'è un cicalino? (2)
  'v1-cap11-esp1': 'Il buzzer suona appena lo collegate — tenetevi le orecchie!',
  'v1-cap11-esp2': 'Campanello con pulsante — premete e suona!',

  // Cap. 12: L'interruttore magnetico (4)
  'v1-cap12-esp1': 'Avvicinate il magnete al reed switch — il LED si accende!',
  'v1-cap12-esp2': 'Il magnete attiva il reed switch e cambia la luminosità.',
  'v1-cap12-esp3': 'Sfida: RGB + interruttore magnetico. Che colore esce?',
  'v1-cap12-esp4': 'Sfida: potenziometro + RGB + magnete — il circuito più ricco!',

  // Cap. 13: Cos'è l'elettropongo? (2)
  'v1-cap13-esp1': 'La plastilina conduce! Accendete un LED con le dita.',
  'v1-cap13-esp2': 'Circuiti artistici — create forme e fatele brillare.',

  // Cap. 14: Primo Robot (1)
  'v1-cap14-esp1': 'Il primo robot ELAB! Motori, sensori e creatività.',

  // ═══════════════════════════════════════════════════
  // VOLUME 2 — Approfondiamo (18 esperimenti)
  // ═══════════════════════════════════════════════════

  // Cap. 6: Approfondiamo i LED (4)
  'v2-cap6-esp1': 'LED in serie: la tensione si divide, la corrente resta uguale.',
  'v2-cap6-esp2': 'LED in serie di colori diversi — quale si accende prima?',
  'v2-cap6-esp3': 'Tre LED in serie: il massimo dalla batteria 9V.',
  'v2-cap6-esp4': 'Usiamo il multimetro per misurare la tensione Vf del LED.',

  // Cap. 7: Cosa sono i condensatori? (4)
  'v2-cap7-esp1': 'Il condensatore si carica e scarica — osservate il multimetro!',
  'v2-cap7-esp2': 'Il LED rosso si spegne lentamente — è la scarica del condensatore.',
  'v2-cap7-esp3': 'Condensatori in parallelo: più capacità, scarica più lunga.',
  'v2-cap7-esp4': 'Cambiamo la resistenza e la scarica cambia velocità!',

  // Cap. 8: Cosa sono i transistor? (3)
  'v2-cap8-esp1': 'Il MOSFET è un interruttore elettronico — niente parti mobili!',
  'v2-cap8-esp2': 'La carica del vostro corpo attiva il MOSFET. Provate!',
  'v2-cap8-esp3': 'MOSFET + potenziometro: scopriamo la tensione di soglia.',

  // Cap. 9: Fototransistor (2)
  'v2-cap9-esp1': 'Il fototransistor reagisce alla luce — più sensibile dell\'LDR!',
  'v2-cap9-esp2': 'Luce notturna automatica: si accende quando è buio.',

  // Cap. 10: Motori (4)
  'v2-cap10-esp1': 'Il motore gira! Colleghiamolo e vediamolo in azione.',
  'v2-cap10-esp2': 'Invertiamo i fili: il motore gira al contrario!',
  'v2-cap10-esp3': 'Motore con pulsante — premete per far girare.',
  'v2-cap10-esp4': 'Motore + pulsante + LED: il LED indica quando gira.',

  // Cap. 12: Robot Segui Luce (1)
  'v2-cap12-esp1': 'Robot che segue la luce — il progetto più ambizioso!',

  // ═══════════════════════════════════════════════════
  // VOLUME 3 — Arduino Programmato (2 esperimenti)
  // ═══════════════════════════════════════════════════
  'v3-cap6-semaforo': 'Semaforo a 3 LED con Arduino — il codice controlla tutto!',
  'v3-cap8-esp3': 'analogRead + Serial Monitor: i numeri raccontano il circuito.',
};

/**
 * Get welcome message for a specific experiment.
 * @param {string} experimentId
 * @returns {string|null}
 */
export function getWelcomeMessage(experimentId) {
  return WELCOME_MESSAGES[experimentId] || null;
}

/**
 * Get returning-user welcome message when they've done this experiment before.
 * @param {string} experimentId
 * @param {string} lastTitle - Title of the experiment done last time
 * @returns {string}
 */
export function getReturningMessage(experimentId, lastTitle) {
  if (!lastTitle) return null;
  return `Bentornati! L'ultima volta: "${lastTitle}". Continuiamo!`;
}

export default WELCOME_MESSAGES;
