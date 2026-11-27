const orientaLorentz = 'Per confrontare il modulo della forza scegli la vista Obliqua o Laterale.';
const orientaOttica = 'Per confrontare gli angoli dei raggi scegli la vista Obliqua o Laterale: dall’alto il loro piano si vede di taglio.';
const lavoroTermico = new Set(['SIM-C3-L08-02', 'SIM-C3-L09-01', 'SIM-C3-L09-02', 'SIM-C3-L09-03', 'SIM-C3-L09-04']);
const dettaglioTermico = ' Il dettaglio sul davanti, in ocra, mantiene il verso e ingrandisce 32 volte le frecce più corte.';

export const legende = {
  calibro: 'Ganasce verdi · tratto ocra fra i due riferimenti',
  campione: 'Il bordo viola misura il lato · il materiale occupa tre dimensioni',
  vettori: 'Gli assi x e y sono indicati sulla tavola. Verde · primo vettore, a nei confronti oppure v nelle prove con un solo vettore. Ocra · secondo vettore b. Viola · somma, proiezione o prodotto vettoriale a × b, secondo la prova.',
  binario: 'Tacca ocra · Via, posizione di partenza. Carrello verde · posizione di misura. La freccia sopra il carrello indica la velocità.',
  volo: 'Curva verde · traiettoria. Tratteggio · proiezione al suolo',
  caduta: 'Corpo ocra · massa. Riga graduata · quota. Rosso · peso; nel confronto con il filo il peso di riferimento è 20 N e il verde indica la tensione, alla stessa scala. Le frecce sono separate dal corpo per leggerne il verso.',
  cerchio: 'Il perno indica il centro. Verde · velocità tangente alla circonferenza. Viola · accelerazione verso il centro. Le frecce sono disegnate sopra la pallina, in un piano parallelo. Velocità e accelerazione hanno scale proprie: confronta le lunghezze della stessa grandezza.',
  forze: 'Il modello considera la traslazione lungo la guida. Le due forze sono disegnate davanti al blocco, lungo la stessa linea e alla stessa scala; il verso indica il segno. La freccia viola, quando presente, indica l’accelerazione con una scala propria.',
  coppia: 'Carrello A viola · carrello B verde. Ogni corpo riceve una forza',
  piano: 'Rosso · peso verticale di 20 N. Verde · reazione normale perpendicolare al piano. Le frecce sono separate lungo le loro linee d’azione e hanno la stessa scala. La forza che trattiene il blocco lungo il piano non è disegnata.',
  molla: 'Supporto fisso · molla viola · massa ocra, che identifica l’estremo mobile. Verde · forza elastica diretta verso la posizione di equilibrio.',
  gravita: 'Distanza fra i centri · frecce verdi di attrazione reciproca',
  percorso: 'Verde tratteggiato · cammino diretto. Viola · deviazione',
  urto: 'La freccia sopra il carrello rappresenta la sua velocità',
  leva: 'Il perno viola è il fulcro; nella leva umana rappresenta il gomito. I punti di applicazione delle forze sono marcati sull’asta.',
  fasi: 'Ogni sfera rappresenta la stessa quantità di materia',
  strati: 'Lastra ocra mobile · frecce verdi di velocità, alla stessa scala. Le frecce sono nel piano davanti alle lastre: ciascuna si riferisce allo strato alla stessa altezza.',
  vasca: 'Sonde · i due punti viola nel liquido. La linea verde tratteggiata le unisce alla stessa quota. Superficie · il livello superiore del liquido. La freccia rossa, quando presente, indica l’azione sulla superficie.',
  manometro: 'La lettura è il dislivello verticale fra le superfici',
  pressa: 'L’area si misura sulla faccia perpendicolare alla forza. Nella pressa a due pistoni, a sinistra l’area è A₁ e a destra è 4 A₁.',
  galleggia: 'Pelo libero verde · blocco ocra · spinta verticale viola',
  condotto: 'Verde a monte · viola a valle. Le frecce rappresentano le velocità di sezione',
  profilo: 'Contorno verde · profilo delle velocità. Viola · velocità locale',
  rete: 'Nelle biforcazioni: nodo A · ingresso dal tubo con la freccia ocra; nodo B · ricongiunzione e uscita dei due rami. Ocra · portata entrante; viola e verde · portate nei rami, alla stessa scala. La portata entrante è la somma delle due uscite. Nei tubi in serie la freccia verde segue la portata comune.',
  film: 'Bordo mobile ocra · le due facce del film tirano nello stesso verso',
  goccia: 'La misura del raggio parte dal centro della superficie sferica',
  capillare: 'La freccia viola va dal pelo libero esterno al livello interno',
  pistone: 'Camera sotto il pistone · posizione del pistone sulla scala di volume',
  termometro: 'La sommità della colonna individua una stessa temperatura sulle due scale',
  calorimetro: 'Il termometro segue lo stato del campione nel recipiente',
  fase: 'Blocco chiaro · fase solida. Azzurro · acqua liquida o particelle di vapore',
  barra: 'Rosso · faccia calda. Blu · faccia fredda. Viola · potenza termica',
  convezione: 'Rosso · tratto caldo. Azzurro · ritorno del liquido',
  radiazione: 'Le superfici scambiano energia. La freccia viola indica il verso netto scelto',
  ciclo: 'Asse orizzontale · volume. Asse verticale · pressione. Area · lavoro',
  motore: 'Serbatoio caldo rosso · serbatoio freddo azzurro · lavoro in viola. Le frecce sono separate dai corpi in un piano davanti al banco. Le due frecce del calore condividono la scala; il lavoro ha una scala propria.',
  microstati: 'I quattro colori identificano le singole particelle',
  cariche: 'Sfere: rosso · carica positiva; viola · carica negativa. La distanza parte dai centri. Nella prova del campo, il piccolo punto verde indica la posizione P della sonda. La freccia viola più vicina alla sonda rappresenta E, alla stessa scala durante la prova. Quando compare, la seconda freccia, ocra e più lontana dalla sonda, rappresenta E ×10: lo stesso campo ingrandito dieci volte. La lettura numerica è il campo nella posizione P.',
  piastre: 'Armatura positiva a sinistra · armatura negativa a destra',
  dipoli: 'Viola · carica negativa. Rosso · positiva. Verde · campo applicato',
  filo: 'Verde · corrente convenzionale. Punti viola · portatori negativi',
  circuito: 'Pila sul ramo anteriore · freccia verde di corrente convenzionale',
  condensatori: 'Ogni coppia di piastre è un condensatore. Segui i fili tra i terminali',
  bussola: 'Filo verticale · circonferenze del campo · sonda tangenziale',
  lorentz: `B · le tre frecce grigie parallele sotto la carica. v · la freccia verde sopra la carica. F · la freccia viola della forza sulla carica positiva, quando presente. La forza non nulla è perpendicolare sia a v sia a B; con velocità parallela o antiparallela al campo si annulla. v e F sono riportate accanto alla carica, conservando il verso e la propria scala. ${orientaLorentz}`,
  spira: 'Verde · campo magnetico. Viola · normale orientata. Ocra · spira',
  oscillatore: 'Riferimento centrale · equilibrio. Blocco ocra · posizione istantanea',
  onda: 'Il punto marcato segue il mezzo. La curva rappresenta il profilo nello spazio',
  onde2: 'S₁ e S₂ · sorgenti coerenti. P · sonda. Asta ocra · ampiezza locale',
  sorgente: 'La sonda viola intercetta una porzione del fronte proveniente dalla sorgente',
  doppler: 'Sorgente ocra · fronti emessi · ricevitore o riflettore. La freccia della pressione è separata dal ricevitore. Nella prova di eco, la sfera ocra a sinistra rappresenta sorgente e microfono; lo schermo all’estremità destra è il riflettore. La freccia verde indica l’andata verso lo schermo; la viola indica il ritorno al microfono. La piccola sfera viola animata rappresenta l’impulso: arriva allo schermo, si riflette e ritorna alla sorgente. Le due frecce hanno quote e spostamenti laterali diversi solo per renderle distinguibili anche dall’alto: il tragitto fisico è lo stesso, percorso in versi opposti, con uguale lunghezza in andata e ritorno.',
  em: 'Viola · campo elettrico E. Verde · campo magnetico B, su una scala diversa. L’asse segue la propagazione. Ad ampiezza zero entrambi i campi sono nulli.',
  assorbitore: 'Lastra viola · assorbitore. Il fascio conserva la sezione e cambia intensità',
  fotone: 'Onda viola · fotone incidente. Verde · elettrone del bersaglio',
  nucleo: 'Rosso · protone. Verde nel nucleo · neutrone',
  decadimento: 'Viola · nuclei iniziali ancora presenti. Grigio · nuclei decaduti',
  ottica: `All’interfaccia tra due mezzi o sullo specchio, la linea grigia tratteggiata è la normale: passa dal punto d’incontro dei raggi ed è perpendicolare alla superficie. Nel banco con la lente, la linea grigia tratteggiata è invece l’asse ottico. ${orientaOttica} All’interfaccia i segmenti hanno lunghezza schematica; mostrano direzioni e angoli, non un cammino ottico misurato.`,
};

export function legendaTavola(apparato) {
  const testo = legende[apparato];
  if (apparato === 'lorentz') {
    return testo.replace(orientaLorentz, 'Per confrontare il modulo della forza usa la lettura numerica.');
  }
  if (apparato === 'ottica') {
    return testo.replace(orientaOttica, 'La tavola mostra lo schema nel piano di misura.');
  }
  return testo;
}

const annotazioniScene = new Map();
const annotazioni = {
  C1: [
    ['Distanza fra i centri', 'Le frecce verdi hanno la stessa lunghezza e puntano verso l’altra massa. Quando sono corte, le due frecce ocra scuro le mostrano in una fascia separata, cinque volte più lunghe e negli stessi versi.', ['L006-03']],
    ['Carrello', 'Da fermo la freccia della velocità scompare. Per le piccole velocità, il dettaglio ocra scuro mostra la stessa freccia sei volte più lunga, lungo il binario e nello stesso verso.', ['L007-02','L007-03']],
  ],
  C2: [
    ['Entrata', 'L’entrata è a sinistra e l’uscita a destra.', ['L005-01','L005-02','L005-03','L006-01','L006-02','L006-03','L006-04','L008-01','L008-02','L008-04']],
    ['Presa frontale', 'La presa frontale del tubo di Pitot è a destra. È rivolta contro il flusso e misura la pressione di ristagno.', ['L006-02']],
    ['Uscita', 'Le frecce di velocità sono spostate di lato nel disegno per lasciare visibile la presa. La loro lunghezza segue la velocità lungo il tubo.', ['L006-02']],
    ['Uscita', '', ['L005-01','L005-02','L005-03','L006-01','L006-03','L008-01']],
    ['Sezione di misura', 'Quando è valido il profilo laminare, le frecce viola mostrano la velocità alle varie quote nella sezione di misura. Il profilo verde ne congiunge le punte.', ['L005-04','L007-01','L007-02','L007-05']],
    ['Sforzo sulla lastra', 'Lo sforzo sulla lastra mobile è rappresentato dalla freccia viola sopra la lastra.', ['L007-03']],
    ['Presa intermedia', 'La presa intermedia è tra i due tratti del condotto, al centro della tavola.', ['L008-03','L009-03']],
    ['In parallelo', 'Il collegamento in serie è a sinistra e quello in parallelo è a destra.', ['L009-01']],
    ['Goccia', 'La sfera azzurra è la goccia. La freccia ocra va dal centro alla superficie.', ['L010-02']],
    ['Film a due facce', 'I due contorni schematici indicano le superfici del film a due facce. La freccia ocra indica il raggio di riferimento.', ['L010-05']],
  ],
  C4: [
    ['+1', 'Le due sfere rosse hanno ciascuna carica +1 nC. Le frecce viola sono riportate accanto alle sfere alla stessa scala, parallele alla retta che unisce i centri. Il dettaglio ocra scuro conserva i versi e ingrandisce di otto volte le frecce più corte.', ['L01-02']],
    ['P', 'Il punto P è a metà fra le due cariche. Resta fisso mentre si varia la carica a destra.', ['L02-02']],
    ['Sonda', 'Il punto viola rappresenta la particella positiva.', ['L02-03']],
    ['Sonda', 'Il punto viola è la sonda; il suo spostamento è misurato rispetto al riferimento centrale.', ['L03-02']],
    ['Sonda', 'Il punto viola rappresenta la carica positiva di 3 µC.', ['L03-03']],
    ['+', 'Le frecce ocra rappresentano il campo elettrico uniforme dalla piastra positiva a quella negativa.', ['L02-03','L03-02','L03-03']],
    ['−', '', ['L02-03','L03-02','L03-03']],
    ['Corrente convenzionale', '', ['L05-01','L05-04','L05-05']],
    ['Pila', '', ['L05-02','L05-03','L06-02']],
    ['In parallelo', 'Il circuito in serie è a sinistra. Il circuito in parallelo è a destra e i rami condividono gli stessi nodi.', ['L06-01']],
    ['+', 'La piastra rossa porta il segno + e quella verde il segno −.', ['L07-01']],
    ['−', '', ['L07-01']],
    ['Sonda B', 'La sonda B è a destra del filo. La freccia in quel punto è tangente alla circonferenza del campo.', ['L09-01']],
    ['Normale alla spira', 'La normale alla spira forma un angolo retto con il piano della spira.', ['L10-01']],
  ],
  C5: [
    ['Massa oscillante', 'Il blocco ocra è la massa oscillante. La freccia parte dall’equilibrio e arriva alla posizione della massa.', ['L01-02']],
    ['Sorgente', '', ['L05-01','L05-03']],
    ['Ricevitore', '', ['L05-01','L05-03']],
    ['Elettrone libero', 'L’elettrone verde rimane legato sull’anello oppure compare all’esterno come elettrone libero. La freccia verde è spostata rispetto alla sfera e la sua lunghezza segue l’energia cinetica. Quando appare il dettaglio ocra scuro, conserva lo stesso verso e ha lunghezza quattro volte maggiore.', ['L07-03']],
    ['Elettrone legato', '', ['L07-03']],
  ],
  C6: [
    ['Entrata', 'L’entrata è a sinistra e l’uscita a destra.', ['L02-01']],
    ['Uscita', '', ['L02-01']],
    ['Rivelatore', 'Il fascio entra da sinistra. Il rivelatore è la piastra grigia a destra. Cerca fra la lastra e il rivelatore il fascio trasmesso. Ogni strato dimezza il segnale indicato nella lettura.', ['L04-01']],
    ['Carrello', 'Il carrello è il blocco verde sulla guida graduata.', ['L05-01']],
    ['Oggetto', 'La freccia viola a sinistra è l’oggetto. Quando visibile nella tavola, l’immagine è la freccia rossa. L’immagine virtuale è diritta sul lato dell’oggetto e più distante dalla lente. L’immagine reale è capovolta sul lato opposto. Al fuoco i raggi emergono paralleli.', ['L06-01']],
  ],
};
for (const [corso, gruppo] of Object.entries(annotazioni)) {
  for (const [etichetta, descrizione, voci] of gruppo) {
    for (const voce of voci) {
      const id = 'SIM-' + corso + '-' + voce;
      const annotazione = annotazioniScene.get(id) ?? { etichette: [], descrizioni: [] };
      annotazione.etichette.push(etichetta);
      if (descrizione) annotazione.descrizioni.push(descrizione);
      annotazioniScene.set(id, annotazione);
    }
  }
}

export const annotazioneScena = (record) => annotazioniScene.get(record.id);

export function legendaVoce(record, vista) {
  const legenda = vista === 'diagram' ? legendaTavola(record.apparatus) : legende[record.apparatus];
  if (record.id === 'SIM-C2-L003-02') {
    const orientamento = vista === 'top' ? ' Con la vista Laterale puoi confrontare le quote dei pistoni.' : '';
    return legenda + ' La freccia rossa indica la discesa a sinistra, la verde la salita a destra. Le frecce indicano solo i versi e scompaiono a corsa zero. Usa le quote e le letture per confrontare le corse: a destra la corsa è un quarto di quella a sinistra.' + orientamento;
  }
  if (record.id === 'SIM-C4-L02-02') {
    return 'La carica di sinistra è fissa a +1 nC. Il controllo della carica a destra mostra il valore con segno. '
      + 'Le sfere mostrano cariche positive in rosso, negative in viola e nulle in grigio. '
      + 'Il punto verde P è a metà tra le cariche. La freccia viola è spostata accanto a P per renderla visibile '
      + 'e mostra il campo risultante lungo la retta delle cariche. Il dettaglio ocra scuro ingrandisce di dieci volte '
      + 'le frecce corte e ne conserva il verso. Quando i due campi si annullano, la freccia scompare e la lettura vale zero.';
  }
  if (record.id === 'SIM-C3-L04-03') {
    return legenda + '. La freccia rossa indica l’energia fornita. Il dettaglio in alto, in ocra, mantiene il verso e ingrandisce 128 volte le frecce più corte.';
  }
  if (lavoroTermico.has(record.id)) {
    const suggerimento = vista === 'diagram' ? '' : ' Per leggere la freccia verticale del lavoro scegli la vista Obliqua o Laterale.';
    return legenda + dettaglioTermico + suggerimento;
  }
  if (record.id === 'SIM-C3-L10-01') {
    return 'Il serbatoio è a sinistra e il sistema a destra. La freccia viola punta verso il sistema quando entra calore, verso il serbatoio quando esce. A Q uguale a zero lo scambio è nullo.';
  }
  if (record.id === 'SIM-C5-L05-01') {
    return 'La sfera ocra a sinistra è la sorgente. L’asta a destra è il ricevitore. '
      + 'Il punto viola segue il segnale dalla sorgente al ricevitore. I cerchi verdi mostrano i fronti nel mezzo. '
      + 'Il cronometro misura solo l’andata lungo i 150 m.';
  }
  if (record.id === 'SIM-C5-L05-03') {
    return 'Sfera ocra · sorgente. Punto viola · ricevitore. Gli archi verdi sono le creste emesse dalla sorgente. La freccia rossa indica il verso di moto della sorgente.';
  }
  const descrizioni = annotazioneScena(record)?.descrizioni;
  if (descrizioni?.length) return legenda.replace(/\.$/,'') + '. ' + descrizioni.join(' ');
  return legenda;
}
