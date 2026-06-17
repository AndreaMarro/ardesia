/**
 * ELAB Concept Dependency Graph
 * Maps concepts taught in each experiment, their prerequisites,
 * and rich analogies for teaching.
 *
 * Used by:
 *  - LessonPathPanel: shows prerequisites before starting
 *  - UNLIM: builds progressive explanations using prior analogies
 *  - TeacherDashboard: tracks concept mastery per student
 */

// ── All concepts taught across 62 experiments ──
export const CONCEPTS = {
  // ── Volume 1: Elettronica Base ──
  'circuito-chiuso': {
    name: 'Circuito chiuso',
    description: 'Un circuito deve essere chiuso (completo) per funzionare',
    analogy: 'Come una pista di Formula 1: la macchina deve poter fare tutto il giro completo, altrimenti si ferma!',
    metaphor: 'Immagina un treno su una ferrovia circolare. Se togli un pezzo di binario, il treno si ferma.',
    firstTaught: 'v1-cap6-esp1',
    difficulty: 1,
  },
  'polarita-led': {
    name: 'Polarita del LED',
    description: 'Il LED funziona solo in un verso (anodo +, catodo -)',
    analogy: 'Come una porta girevole: puoi passare solo in una direzione. Se provi al contrario, resti fuori!',
    metaphor: 'Pensa a uno scivolo: l\'acqua scende solo da sopra a sotto, non al contrario.',
    firstTaught: 'v1-cap6-esp1',
    difficulty: 1,
  },
  'resistenza-protezione': {
    name: 'Resistenza di protezione',
    description: 'Una resistenza limita la corrente per proteggere il LED',
    analogy: 'Come un rubinetto dell\'acqua: se apri tutto, il getto e troppo forte. La resistenza e il rubinetto che regola il flusso.',
    metaphor: 'Immagina un tubo stretto: piu e stretto, meno acqua passa. La resistenza e il tubo stretto dell\'elettricita.',
    firstTaught: 'v1-cap6-esp2',
    difficulty: 1,
  },
  'legge-ohm': {
    name: 'Legge di Ohm',
    description: 'V = R x I — la relazione tra tensione, resistenza e corrente',
    analogy: 'Come l\'acqua in un tubo: la pressione (tensione) spinge l\'acqua (corrente) attraverso un tubo stretto (resistenza). Piu pressione = piu flusso. Tubo piu stretto = meno flusso.',
    metaphor: 'Pensa a una folla che esce da una porta: la porta stretta (resistenza) rallenta le persone (corrente), ma se spingi di piu (tensione), passano piu in fretta.',
    firstTaught: 'v1-cap7-esp1',
    difficulty: 2,
  },
  'circuito-serie': {
    name: 'Circuito in serie',
    description: 'Componenti collegati uno dopo l\'altro — stessa corrente, tensione divisa',
    analogy: 'Come le perle di una collana: se ne togli una, la collana si rompe. Tutti collegati in fila indiana!',
    metaphor: 'Come gli operai in una catena di montaggio: se uno si ferma, si fermano tutti.',
    firstTaught: 'v1-cap8-esp1',
    difficulty: 2,
  },
  'circuito-parallelo': {
    name: 'Circuito in parallelo',
    description: 'Componenti collegati fianco a fianco — stessa tensione, corrente divisa',
    analogy: 'Come le corsie di un\'autostrada: se una si blocca, le altre funzionano ancora. Ogni LED ha la sua strada!',
    metaphor: 'Come le porte di uscita di un cinema: se una si chiude, la gente esce dalle altre.',
    firstTaught: 'v1-cap9-esp1',
    difficulty: 2,
  },
  'breadboard': {
    name: 'Breadboard',
    description: 'Piastra per prototipi — righe collegate, bus di alimentazione',
    analogy: 'Come un hotel: ogni riga e una stanza dove i componenti si incontrano. I bus sono i corridoi lunghi che portano corrente a tutti.',
    metaphor: 'Pensa a un parcheggio a piani: ogni piano (riga) e collegato, e le scale (bus) collegano tutti i piani.',
    firstTaught: 'v1-cap6-esp1',
    difficulty: 1,
  },
  'led-rgb': {
    name: 'LED RGB',
    description: 'LED con 3 colori (rosso, verde, blu) che mescolati creano qualsiasi colore',
    analogy: 'Come mescolare i colori con le tempere: rosso + verde = giallo, rosso + blu = viola, tutti insieme = bianco!',
    metaphor: 'Come un televisore: ogni pixel ha 3 lucine (R, G, B) e mescolandole vedi milioni di colori.',
    firstTaught: 'v1-cap7-esp3',
    difficulty: 2,
  },
  'pwm': {
    name: 'PWM (Pulse Width Modulation)',
    description: 'Accendere e spegnere velocissimo per simulare valori intermedi',
    analogy: 'Come sbattere le palpebre molto veloce: se apri gli occhi meta del tempo, vedi meta della luce!',
    metaphor: 'Come il volume della radio: il PWM non cambia il suono, cambia quanto tempo il suono e acceso. Se lo accendi e spegni 1000 volte al secondo, sembra a meta volume.',
    firstTaught: 'v1-cap10-esp1',
    difficulty: 3,
  },
  'analogread': {
    name: 'Lettura analogica',
    description: 'Leggere valori continui (0-1023) da sensori',
    analogy: 'Come un termometro: non dice solo "caldo" o "freddo" (digitale), ma ti dice esattamente quanti gradi (analogico)!',
    metaphor: 'Pensa alla differenza tra un interruttore (acceso/spento) e un rubinetto (aperto poco, medio, tanto).',
    firstTaught: 'v1-cap10-esp3',
    difficulty: 3,
  },
  'digitalread': {
    name: 'Lettura digitale',
    description: 'Leggere valori binari (HIGH/LOW, 1/0) da pulsanti e sensori',
    analogy: 'Come una domanda si/no: il pulsante dice solo "premuto" o "non premuto". Non ci sono mezze misure!',
    metaphor: 'Come un interruttore della luce: o e acceso o e spento, non esiste "meta acceso" nel mondo digitale.',
    firstTaught: 'v1-cap8-esp3',
    difficulty: 2,
  },
  'potenziometro': {
    name: 'Potenziometro',
    description: 'Resistenza variabile che si regola girando una manopola',
    analogy: 'Come il volume della radio: giri la manopola e la resistenza cambia, facendo passare piu o meno corrente.',
    metaphor: 'Come un rubinetto: quando lo giri, apri o chiudi il passaggio dell\'acqua (corrente).',
    firstTaught: 'v1-cap10-esp2',
    difficulty: 2,
  },
  'serial-monitor': {
    name: 'Monitor Seriale',
    description: 'Finestra per comunicare con Arduino — leggere valori e inviare comandi',
    analogy: 'Come una chat con Arduino: tu scrivi messaggi e Arduino ti risponde con numeri e parole!',
    metaphor: 'Come un walkie-talkie: Arduino parla attraverso il cavo USB e tu leggi quello che dice sul monitor.',
    firstTaught: 'v1-cap11-esp1',
    difficulty: 2,
  },
  'buzzer': {
    name: 'Buzzer piezoelettrico',
    description: 'Componente che produce suoni vibrando a diverse frequenze',
    analogy: 'Come un tamburello elettronico: vibra velocissimo e produce un bip! Piu vibra veloce, piu il suono e acuto.',
    metaphor: 'Come le corde di una chitarra: corde corte (frequenza alta) = suono acuto, corde lunghe (frequenza bassa) = suono grave.',
    firstTaught: 'v1-cap9-esp5',
    difficulty: 2,
  },
  'ldr': {
    name: 'Fotoresistenza (LDR)',
    description: 'Resistenza che cambia con la luce — piu luce, meno resistenza',
    analogy: 'Come le pupille dei tuoi occhi: al buio si allargano (piu resistenza), alla luce si restringono (meno resistenza)!',
    metaphor: 'Come una porta magica: quando c\'e tanta luce si apre di piu e lascia passare piu corrente.',
    firstTaught: 'v1-cap12-esp1',
    difficulty: 2,
  },

  // ── Volume 2: Arduino Coding ──
  'variabile': {
    name: 'Variabile',
    description: 'Un contenitore per memorizzare un valore nel codice',
    analogy: 'Come una scatola con un\'etichetta: scrivi il nome fuori (nome variabile) e dentro metti il valore. Puoi cambiare il contenuto quando vuoi!',
    metaphor: 'Come un armadietto a scuola: ha un numero (nome) e dentro puoi mettere quello che vuoi (valore).',
    firstTaught: 'v2-cap6-esp1',
    difficulty: 2,
  },
  'condizione-if': {
    name: 'Condizione IF',
    description: 'Fare qualcosa solo SE una condizione e vera',
    analogy: 'Come le regole di casa: SE piove, prendi l\'ombrello. SE e buio, accendi la luce. Arduino decide allo stesso modo!',
    metaphor: 'Come un semaforo: SE rosso → fermati, SE verde → vai. Il programma fa scelte come te!',
    firstTaught: 'v2-cap7-esp1',
    difficulty: 3,
  },
  'ciclo-loop': {
    name: 'Ciclo (loop)',
    description: 'Ripetere un\'azione piu volte automaticamente',
    analogy: 'Come una canzone che va in repeat: Arduino ripete le stesse istruzioni all\'infinito (o per un numero di volte).',
    metaphor: 'Come un orologio: le lancette girano e girano, sempre lo stesso percorso. Il loop di Arduino e uguale!',
    firstTaught: 'v2-cap6-esp2',
    difficulty: 2,
  },
  'servo-motore': {
    name: 'Servo motore',
    description: 'Motore che si posiziona a un angolo preciso (0-180 gradi)',
    analogy: 'Come il braccio di un orologio: puoi dirgli "vai a 90 gradi" e lui ci va con precisione!',
    metaphor: 'Come una porta che puoi aprire a qualsiasi angolo: 0° chiusa, 90° mezza aperta, 180° spalancata.',
    firstTaught: 'v2-cap8-esp1',
    difficulty: 3,
  },
  'lcd-display': {
    name: 'Display LCD',
    description: 'Schermo 16x2 caratteri per mostrare testo e numeri',
    analogy: 'Come la lavagna della classe: ci puoi scrivere messaggi, cancellarli e riscrivere!',
    metaphor: 'Come il tabellone dei treni alla stazione: 2 righe di testo che mostrano informazioni.',
    firstTaught: 'v2-cap10-esp1',
    difficulty: 3,
  },

  // ── Volume 3: Progetti Avanzati ──
  'semaforo': {
    name: 'Progetto Semaforo',
    description: 'Sequenza di LED con timing preciso — rosso, giallo, verde',
    analogy: 'Come un direttore d\'orchestra: Arduino da il tempo a ogni LED, dicendo "adesso tu, adesso tu!"',
    metaphor: 'Come un vigile: alza e abbassa le braccia in sequenza per far passare le macchine (corrente).',
    firstTaught: 'v3-cap6-semaforo',
    difficulty: 3,
  },
  'comunicazione-seriale': {
    name: 'Comunicazione Seriale',
    description: 'Scambio dati tra Arduino e computer via USB',
    analogy: 'Come mandare SMS ad Arduino: scrivi un messaggio, lui lo legge e risponde!',
    metaphor: 'Come il telefono col filo: l\'informazione viaggia bit per bit, come le gocce in un tubo.',
    firstTaught: 'v3-cap8-esp3',
    difficulty: 3,
  },
};

// ── Concept dependency graph ──
// Each concept lists what must be understood BEFORE it
export const PREREQUISITES = {
  'circuito-chiuso': [],
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  'polarita-led': ['circuito-chiuso'],
  'breadboard': ['circuito-chiuso'],
  'resistenza-protezione': ['circuito-chiuso', 'polarita-led'],
  'legge-ohm': ['resistenza-protezione', 'circuito-chiuso'],
  'circuito-serie': ['circuito-chiuso', 'resistenza-protezione'],
  'circuito-parallelo': ['circuito-chiuso', 'circuito-serie'],
  'led-rgb': ['polarita-led', 'resistenza-protezione'],
  'buzzer': ['circuito-chiuso', 'resistenza-protezione'],
  'digitalread': ['circuito-chiuso', 'breadboard'],
  'potenziometro': ['resistenza-protezione', 'legge-ohm'],
  'analogread': ['potenziometro', 'digitalread'],
  'pwm': ['analogread', 'led-rgb'],
  'ldr': ['resistenza-protezione', 'analogread'],
  'serial-monitor': ['digitalread'],
  'variabile': ['serial-monitor'],
  'ciclo-loop': ['variabile'],
  'condizione-if': ['variabile', 'digitalread'],
  'servo-motore': ['pwm', 'condizione-if'],
  'lcd-display': ['serial-monitor', 'variabile'],
  'semaforo': ['condizione-if', 'ciclo-loop', 'led-rgb'],
  'comunicazione-seriale': ['serial-monitor', 'variabile'],
};

// ── Experiment → concepts mapping ──
// What each experiment teaches (new concepts) and requires (prerequisites)
export const EXPERIMENT_CONCEPTS = {
  'v1-cap6-esp1': { teaches: ['circuito-chiuso', 'polarita-led', 'breadboard'], requires: [] },
  'v1-cap6-esp2': { teaches: ['resistenza-protezione'], requires: ['circuito-chiuso', 'polarita-led'] },
  'v1-cap6-esp3': { teaches: [], requires: ['resistenza-protezione'] },
  'v1-cap7-esp1': { teaches: ['legge-ohm'], requires: ['resistenza-protezione'] },
  'v1-cap7-esp2': { teaches: [], requires: ['legge-ohm'] },
  'v1-cap7-esp3': { teaches: ['led-rgb'], requires: ['polarita-led', 'resistenza-protezione'] },
  'v1-cap7-esp4': { teaches: [], requires: ['led-rgb'] },
  'v1-cap7-esp5': { teaches: [], requires: ['led-rgb'] },
  'v1-cap7-esp6': { teaches: [], requires: ['led-rgb'] },
  'v1-cap8-esp1': { teaches: ['circuito-serie'], requires: ['circuito-chiuso', 'resistenza-protezione'] },
  'v1-cap8-esp2': { teaches: [], requires: ['circuito-serie'] },
  'v1-cap8-esp3': { teaches: ['digitalread'], requires: ['circuito-chiuso', 'breadboard'] },
  'v1-cap8-esp4': { teaches: [], requires: ['digitalread'] },
  'v1-cap8-esp5': { teaches: [], requires: ['circuito-serie'] },
  'v1-cap9-esp1': { teaches: ['circuito-parallelo'], requires: ['circuito-serie'] },
  'v1-cap9-esp2': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap9-esp3': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap9-esp4': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap9-esp5': { teaches: ['buzzer'], requires: ['circuito-chiuso', 'resistenza-protezione'] },
  'v1-cap9-esp6': { teaches: [], requires: ['buzzer'] },
  'v1-cap9-esp7': { teaches: [], requires: ['buzzer', 'circuito-parallelo'] },
  'v1-cap9-esp8': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap9-esp9': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap10-esp1': { teaches: ['pwm'], requires: ['analogread', 'led-rgb'] },
  'v1-cap10-esp2': { teaches: ['potenziometro'], requires: ['resistenza-protezione', 'legge-ohm'] },
  'v1-cap10-esp3': { teaches: ['analogread'], requires: ['potenziometro', 'digitalread'] },
  'v1-cap10-esp4': { teaches: [], requires: ['analogread'] },
  'v1-cap10-esp5': { teaches: [], requires: ['pwm', 'analogread'] },
  'v1-cap10-esp6': { teaches: [], requires: ['pwm'] },
  'v1-cap11-esp1': { teaches: ['serial-monitor'], requires: ['digitalread'] },
  'v1-cap11-esp2': { teaches: [], requires: ['serial-monitor'] },
  'v1-cap12-esp1': { teaches: ['ldr'], requires: ['resistenza-protezione', 'analogread'] },
  'v1-cap12-esp2': { teaches: [], requires: ['ldr'] },
  'v1-cap12-esp3': { teaches: [], requires: ['ldr'] },
  'v1-cap12-esp4': { teaches: [], requires: ['ldr', 'pwm'] },
  'v1-cap13-esp1': { teaches: [], requires: ['circuito-parallelo', 'pwm'] },
  'v1-cap13-esp2': { teaches: [], requires: ['circuito-parallelo'] },
  'v1-cap14-esp1': { teaches: [], requires: ['serial-monitor', 'analogread'] },
  'v2-cap6-esp1': { teaches: ['variabile'], requires: ['serial-monitor'] },
  'v2-cap6-esp2': { teaches: ['ciclo-loop'], requires: ['variabile'] },
  'v2-cap6-esp3': { teaches: [], requires: ['ciclo-loop'] },
  'v2-cap6-esp4': { teaches: [], requires: ['variabile', 'pwm'] },
  'v2-cap7-esp1': { teaches: ['condizione-if'], requires: ['variabile', 'digitalread'] },
  'v2-cap7-esp2': { teaches: [], requires: ['condizione-if'] },
  'v2-cap7-esp3': { teaches: [], requires: ['condizione-if', 'analogread'] },
  'v2-cap7-esp4': { teaches: [], requires: ['condizione-if'] },
  'v2-cap8-esp1': { teaches: ['servo-motore'], requires: ['pwm', 'condizione-if'] },
  'v2-cap8-esp2': { teaches: [], requires: ['servo-motore'] },
  'v2-cap8-esp3': { teaches: [], requires: ['servo-motore', 'potenziometro'] },
  'v2-cap9-esp1': { teaches: [], requires: ['condizione-if', 'buzzer'] },
  'v2-cap9-esp2': { teaches: [], requires: ['condizione-if', 'ldr'] },
  'v2-cap10-esp1': { teaches: ['lcd-display'], requires: ['serial-monitor', 'variabile'] },
  'v2-cap10-esp2': { teaches: [], requires: ['lcd-display'] },
  'v2-cap10-esp3': { teaches: [], requires: ['lcd-display', 'analogread'] },
  'v2-cap10-esp4': { teaches: [], requires: ['lcd-display'] },
  'v2-cap12-esp1': { teaches: [], requires: ['condizione-if', 'ciclo-loop'] },
  'v3-cap6-semaforo': { teaches: ['semaforo'], requires: ['condizione-if', 'ciclo-loop', 'led-rgb'] },
  'v3-cap8-esp3': { teaches: ['comunicazione-seriale'], requires: ['serial-monitor', 'variabile'] },
};

/**
 * Get concepts that must be understood before an experiment.
 * Returns sorted list of prerequisite concepts with their analogies.
 */
export function getPrerequisites(experimentId) {
  const expConcepts = EXPERIMENT_CONCEPTS[experimentId];
  if (!expConcepts) return [];

  return expConcepts.requires
    .filter(id => CONCEPTS[id])
    .map(id => ({
      id,
      ...CONCEPTS[id],
      met: false, // Will be set by UI based on student progress
    }));
}

/**
 * Get new concepts that an experiment teaches.
 * Returns concepts with analogies for the teacher/UNLIM to use.
 */
export function getNewConcepts(experimentId) {
  const expConcepts = EXPERIMENT_CONCEPTS[experimentId];
  if (!expConcepts) return [];

  return expConcepts.teaches
    .filter(id => CONCEPTS[id])
    .map(id => ({
      id,
      ...CONCEPTS[id],
    }));
}

/**
 * Suggest the next experiment based on concepts already mastered.
 * Returns experiments whose prerequisites are all met.
 */
export function suggestNextExperiments(masteredConcepts = []) {
  const mastered = new Set(masteredConcepts);
  const suggestions = [];

  for (const [expId, expData] of Object.entries(EXPERIMENT_CONCEPTS)) {
    const allMet = expData.requires.every(req => mastered.has(req));
    const teachesNew = expData.teaches.some(t => !mastered.has(t));
    if (allMet && teachesNew) {
      suggestions.push({
        experimentId: expId,
        teaches: expData.teaches.map(id => CONCEPTS[id]?.name || id),
        difficulty: Math.max(...expData.teaches.map(id => CONCEPTS[id]?.difficulty || 1)),
      });
    }
  }

  return suggestions.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Build a progressive analogy chain for a concept.
 * Traces back through prerequisites to build understanding from simple to complex.
 */
export function buildAnalogyChain(conceptId, maxDepth = 4) {
  const chain = [];
  const visited = new Set();

  function traverse(id, depth) {
    if (depth > maxDepth || visited.has(id) || !CONCEPTS[id]) return;
    visited.add(id);

    const prereqs = PREREQUISITES[id] || [];
    for (const prereq of prereqs) {
      traverse(prereq, depth + 1);
    }

    chain.push({
      concept: CONCEPTS[id].name,
      analogy: CONCEPTS[id].analogy,
      metaphor: CONCEPTS[id].metaphor,
    });
  }

  traverse(conceptId, 0);
  return chain;
}
