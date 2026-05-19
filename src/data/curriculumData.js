// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Curriculum Data — Teacher-facing pedagogy for lesson paths
 * Converted from automa/curriculum/*.yaml — curated by Andrea Marro
 * Used by LessonPathPanel for rich, experiment-specific guidance.
 * Fallback: LessonPathPanel generates content algorithmically when no entry exists.
 */

const CURRICULUM = {
  'v1-cap6-esp1': {
    teacherBriefing: {
      beforeClass: 'Assicurati che ogni gruppo abbia 1 breadboard, 1 batteria 9V con clip, 2 fili e 1 LED rosso. NON dare il resistore in questa fase — lo scopriranno dopo. Obiettivo: far provare l\'emozione del "si accende!" prima di qualsiasi teoria.',
      duringClass: 'Lascia che provino da soli. Se il LED non si accende, chiedi "Cosa potremmo provare a cambiare?" (risposta attesa: girare il LED). NON dire tu la risposta. Quando si accende: "Perché secondo voi funziona solo in un verso?"',
      commonQuestion: '"Perché il LED funziona solo in un verso?" → È come una porta girevole che gira solo in una direzione. La corrente può passare solo in un verso.',
    },
    commonMistakes: [
      { error: 'LED inserito al contrario', response: 'Non correggerli. Chiedi: "Cosa succede se lo giri?"' },
      { error: 'Fili non nella stessa riga della breadboard', response: 'Mostra come i fori della stessa riga sono collegati sotto. "Come i binari del treno — vanno nella stessa direzione."' },
      { error: 'Batteria con polarità invertita', response: 'Nessun danno con il LED — semplicemente non si accende. Fai notare i simboli + e -.' },
    ],
    analogies: [
      { concept: 'Circuito chiuso', text: 'Un circuito è come un circuito di Formula 1 — la macchina deve poter fare tutto il giro e tornare al punto di partenza. Se la strada è interrotta, la macchina si ferma.' },
      { concept: 'Polarità LED', text: 'Il LED è come una porta girevole — lascia passare solo in una direzione. Se provi dall\'altra parte, resta bloccata.' },
    ],
    assessment: [
      'Se gira il LED spontaneamente quando non funziona → ha capito la polarità',
      'Se chiede "perché solo in un verso?" → pronto per approfondire',
      'Se inserisce i fili nella riga corretta al primo tentativo → ha capito la breadboard',
    ],
  },

  'v1-cap6-esp2': {
    teacherBriefing: {
      beforeClass: 'IMPORTANTE: nel simulatore il LED non si brucia davvero. Ma nel mondo reale SÌ. Prepara un LED bruciato vero da mostrare. L\'obiettivo è capire che serve qualcosa che limiti la corrente.',
      duringClass: 'Fai costruire il circuito LED+batteria SENZA resistore. Nel simulatore si accende ma lampeggia l\'avviso. Chiedi: "Cosa potrebbe andare storto?" Mostra il LED bruciato reale. "Come potremmo proteggere il LED?"',
      commonQuestion: '"Perché troppa corrente brucia il LED?" → È come aprire un rubinetto al massimo — troppa acqua può rompere il tubo. Il LED ha bisogno di poca corrente.',
    },
    commonMistakes: [
      { error: 'Non capisce perché il LED si brucia', response: 'Usa l\'analogia del rubinetto. Troppa acqua = troppa corrente = danno.' },
      { error: 'Pensa che il simulatore sia sbagliato', response: 'Spiega che il simulatore avvisa ma non distrugge. Nel mondo reale succede davvero.' },
    ],
    analogies: [
      { concept: 'Corrente eccessiva', text: 'La corrente è come l\'acqua in un tubo. Se ne passa troppa, il tubo (il LED) si rompe. Serve qualcosa che limiti il flusso.' },
      { concept: 'Protezione', text: 'È come mettere un cuscino tra un uovo e il pavimento — senza protezione, l\'uovo si rompe. Il LED è fragile come un uovo.' },
    ],
    assessment: [
      'Se dice "serve qualcosa per limitare la corrente" → ha capito il concetto chiave',
      'Se propone "qualcosa che rallenta la corrente" → pronto per Cap 7 (resistore)',
      'Se chiede "e se uso meno batteria?" → ha intuito il rapporto tensione/corrente',
    ],
  },

  'v1-cap6-esp3': {
    teacherBriefing: {
      beforeClass: 'Prepara 3 resistori con valori diversi (220Ω, 470Ω, 1kΩ). NON dire i valori in ohm — i ragazzi devono osservare l\'effetto sulla luminosità. L\'obiettivo è che scoprano da soli: "resistenza grande = LED meno luminoso".',
      duringClass: 'Fai provare le 3 resistenze una alla volta. Chiedi di mettere in ordine dalla più luminosa alla meno luminosa. Poi chiedi: "Secondo voi, perché cambia?" La risposta attesa è: "La resistenza frena la corrente". NON introdurre la legge di Ohm.',
      commonQuestion: '"Perché con una resistenza più grande il LED è meno luminoso?" → È come stringere un tubo dell\'acqua — più lo stringi, meno acqua passa.',
    },
    commonMistakes: [
      { error: 'Pensa che la resistenza consumi corrente', response: 'La resistenza non consuma, LIMITA. Come un rubinetto non beve l\'acqua, la controlla.' },
      { error: 'Confonde resistenza grande con LED più luminoso', response: 'Fai riprovare e osservare. Chiedi di toccare le resistenze (sono sicure) — quella più calda fa passare più corrente.' },
      { error: 'Non inserisce la resistenza correttamente', response: 'Rassicura: la resistenza funziona in entrambi i versi, non come il LED! "Come un ponte — puoi attraversarlo da entrambe le parti."' },
    ],
    analogies: [
      { concept: 'Resistenza come protezione', text: 'La resistenza è come un limitatore di velocità — non ferma la macchina, la rallenta. Protegge il LED facendo passare meno corrente.' },
      { concept: 'Effetto del valore', text: 'Resistenza piccola = tubo largo (tanta acqua). Resistenza grande = tubo stretto (poca acqua). Il LED si illumina di più quando passa più corrente.' },
    ],
    assessment: [
      'Se ordina correttamente le resistenze per luminosità → ha capito la relazione',
      'Se dice "la resistenza frena la corrente" → concetto chiave acquisito',
      'Se chiede "quanto frena esattamente?" → pronto per Cap 7 (legge di Ohm)',
    ],
  },

  'v1-cap7-esp1': {
    teacherBriefing: {
      beforeClass: 'Ogni gruppo ha 1 LED RGB (catodo comune), 1 resistenza 470 ohm, breadboard, batteria 9V. Il LED RGB ha 4 piedini — il più lungo è il catodo (GND). Obiettivo: far capire che un LED RGB contiene 3 LED dentro un unico componente.',
      duringClass: 'Chiedi: "Quanti piedini ha questo LED? Perché 4 e non 2?" Lascia che osservino. Poi: "Proviamo a collegare solo il piedino del rosso." Se non funziona, chiedere "Cosa manca?" (il collegamento al catodo comune).',
      commonQuestion: '"Perché ha 4 gambe?" → Dentro ci sono 3 piccoli LED (rosso, verde, blu) che condividono lo stesso piedino negativo. È come un palazzo con 3 appartamenti e un unico ingresso.',
    },
    commonMistakes: [
      { error: 'Collegano il piedino sbagliato', response: 'Mostra il datasheet semplificato: piedino lungo = catodo, poi R, G, B. "Come una forchetta — il manico è il catodo, i rebbi sono i colori."' },
      { error: 'Dimenticano la resistenza', response: 'Ricorda l\'esperimento 6.2 — cosa succede senza resistenza?' },
      { error: 'Collegano catodo al + invece che al -', response: 'Ricorda: catodo = piedino lungo = va al polo negativo.' },
    ],
    analogies: [
      { concept: 'LED RGB', text: 'Un LED RGB è come una torcia con 3 lampadine colorate dentro. Puoi accenderne una, due o tutte e tre per creare colori diversi — come un pittore che mescola i colori sulla tavolozza.' },
      { concept: 'Catodo comune', text: 'Il catodo comune è come la porta di uscita di un cinema con 3 sale — tutti escono dalla stessa porta, ma entrano da porte diverse (rosso, verde, blu).' },
    ],
    assessment: [
      'Se identifica il piedino lungo come catodo senza aiuto → ha trasferito conoscenza dal cap 6',
      'Se chiede "posso accendere anche gli altri colori?" → curiosità naturale, pronto per esp 2-3',
      'Se prova a mescolare colori spontaneamente → pronto per esp 4',
    ],
  },

  'v1-cap8-esp1': {
    teacherBriefing: {
      beforeClass: 'Ogni gruppo ha 1 LED, 1 resistenza 470 ohm, 1 pulsante (tact switch), breadboard, batteria 9V. Il pulsante ha 4 piedini — i due sulla stessa fila sono collegati internamente. Obiettivo: capire che il pulsante apre e chiude il circuito.',
      duringClass: 'Chiedi: "Come facciamo ad accendere e spegnere il LED senza staccare i fili?" Lascia che provino. Poi mostra il pulsante: "Questo componente si chiama pulsante. Provate a inserirlo nel circuito." Se non funziona, chiedere "Il circuito è completo? L\'elettricità può passare?"',
      commonQuestion: '"Perché si spegne quando rilascio?" → Il pulsante è come una porta a molla: quando la spingi si apre, quando la lasci si richiude. Finché tieni premuto, l\'elettricità passa.',
    },
    commonMistakes: [
      { error: 'Pulsante sulle stesse file della breadboard', response: 'Il pulsante deve stare a cavallo della scanalatura centrale. "Come un ponte che collega due sponde."' },
      { error: 'Collegano i piedini sbagliati', response: 'I piedini opposti (diagonali) sono quelli che si collegano premendo. Prova a ruotarlo di 90 gradi.' },
      { error: 'LED resta sempre acceso o sempre spento', response: 'Controlla se il pulsante è inserito nel verso giusto — prova a ruotarlo di 90 gradi.' },
    ],
    analogies: [
      { concept: 'Pulsante', text: 'Un pulsante è come il campanello di casa: finché tieni premuto suona, quando lasci smette. Non resta premuto da solo.' },
      { concept: 'Circuito aperto/chiuso', text: 'Un circuito è come un percorso ad anello per le biglie. Se togli un pezzo di binario, le biglie si fermano. Il pulsante è il pezzo che metti e togli.' },
    ],
    assessment: [
      'Se capisce che il LED si spegne rilasciando → ha capito circuito aperto/chiuso',
      'Se chiede "posso fare che resta acceso senza tenere premuto?" → pronto per concetto latch/toggle',
      'Se prova a mettere due pulsanti → curiosità verso serie/parallelo',
    ],
  },

  'v1-cap9-esp1': {
    teacherBriefing: {
      beforeClass: 'Ogni gruppo ha 1 LED, 1 resistenza 220 ohm, 1 potenziometro 10K, breadboard, batteria 9V. Il potenziometro ha 3 piedini — quello centrale è il cursore. Obiettivo: capire che la resistenza può cambiare in modo continuo.',
      duringClass: 'Inizia chiedendo: "Finora la resistenza era sempre uguale. Come fareste a cambiare la luminosità del LED senza cambiare resistenza?" Lascia che pensino. Poi mostra il potenziometro: "Questo è un potenziometro — una resistenza con la manopola." Falli provare liberamente.',
      commonQuestion: '"Perché girando da un lato si spegne?" → Immaginalo come un rubinetto dell\'acqua. Quando lo chiudi del tutto, l\'acqua non passa più. Il potenziometro fa lo stesso con l\'elettricità.',
    },
    commonMistakes: [
      { error: 'Collegano solo 2 piedini', response: 'Serve il piedino centrale + uno degli estremi. "È come un rubinetto: ha l\'entrata, l\'uscita, e la manopola che regola."' },
      { error: 'Il LED non cambia luminosità girando', response: 'Probabilmente collegati i due piedini esterni senza il centrale — il cursore non è nel circuito.' },
      { error: 'Il LED si brucia girando il pot al minimo', response: 'Serve la resistenza fissa in serie! Il pot da solo può arrivare a 0 ohm. "La resistenza fissa è come il limitatore di velocità."' },
    ],
    analogies: [
      { concept: 'Potenziometro', text: 'Un potenziometro è come il rubinetto della doccia: girando la manopola decidi quanta acqua (corrente) esce. Non cambi la pressione dell\'acquedotto, cambi solo quanto ne fai passare.' },
      { concept: 'Resistenza variabile', text: 'Immagina una strada con un semaforo regolabile: puoi decidere quante auto (elettroni) far passare ogni minuto, da zero a tutte.' },
    ],
    assessment: [
      'Se dice "è come cambiare la resistenza" → ha collegato potenziometro a resistenza',
      'Se nota che serve la resistenza fissa di protezione → ha interiorizzato il concetto dal cap 6',
      'Se prova a invertire i pin del pot → curiosità esplorativa, pronto per esp 2',
    ],
  },

  'v1-cap10-esp1': {
    teacherBriefing: {
      beforeClass: 'Ogni gruppo ha 1 LED, 1 resistenza 1K ohm, 1 fotoresistenza (LDR), breadboard, batteria 9V. La fotoresistenza non ha polarità (si può mettere in qualsiasi verso). Obiettivo: scoprire che esistono componenti che reagiscono all\'ambiente.',
      duringClass: '"Ricordate il potenziometro? Cambiava resistenza girando la manopola. Ora vi mostro un componente che cambia resistenza DA SOLO." Dai la fotoresistenza: "Cosa notate quando la coprite con la mano? E quando la illuminate con la torcia del telefono?"',
      commonQuestion: '"Come fa a sentire la luce?" → Dentro c\'è un materiale speciale che quando la luce lo colpisce, diventa più facile per l\'elettricità passare. Come una porta che si apre con il sole e si chiude al buio.',
    },
    commonMistakes: [
      { error: 'Non vedono differenza di luminosità', response: 'Serve una stanza non troppo illuminata. Coprire completamente con la mano, poi illuminare con torcia del telefono.' },
      { error: 'Fotoresistenza al posto sbagliato', response: 'Va in serie col LED, come una resistenza normale. "È come il potenziometro, ma la manopola è la luce stessa."' },
      { error: 'LED sempre spento o sempre acceso', response: 'Controllare il valore della resistenza fissa — se troppo alto, il LED non si accende mai.' },
    ],
    analogies: [
      { concept: 'Fotoresistenza', text: 'La fotoresistenza è come un guardiano che apre il cancello quando c\'è luce e lo chiude quando è buio. Non hai bisogno di toccarlo — reagisce da solo.' },
      { concept: 'Sensore luce', text: 'È il primo componente che "sente" il mondo esterno! Come i tuoi occhi sentono la luce, la fotoresistenza sente la luce e cambia il circuito.' },
    ],
    assessment: [
      'Se dice "è come il potenziometro ma automatico" → ha fatto il collegamento concettuale chiave',
      'Se copre la LDR e nota il cambiamento → apprendimento per scoperta funziona',
      'Se chiede "possiamo fare che si accende AL BUIO?" → pensiero inverso, pronto per esp 2',
    ],
  },
};

export function getCurriculum(experimentId) {
  return CURRICULUM[experimentId] || null;
}

export default CURRICULUM;
