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

export function legendaVoce(record, vista) {
  const legenda = vista === 'diagram' ? legendaTavola(record.apparatus) : legende[record.apparatus];
  if (record.id === 'SIM-C3-L04-03') {
    return legenda + '. La freccia rossa indica l’energia fornita.' + dettaglioTermico;
  }
  if (lavoroTermico.has(record.id)) {
    const suggerimento = vista === 'diagram' ? '' : ' Per leggere la freccia verticale del lavoro scegli la vista Obliqua o Laterale.';
    return legenda + dettaglioTermico + suggerimento;
  }
  if (record.id === 'SIM-C3-L10-01') {
    return 'Il serbatoio è a sinistra e il sistema a destra. La freccia viola punta verso il sistema quando entra calore, verso il serbatoio quando esce. A Q uguale a zero lo scambio è nullo.';
  }
  return legenda;
}
