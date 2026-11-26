import { n } from './misure.js';

// Each observation selects the corresponding construction in the scene and in its planar drawing.
export const piloti = {
  'LAB3D-02': 'volo',
  'LAB3D-04': 'tubo',
  'LAB3D-05': 'gas',
  'SIM-C4-L10-02': 'induzione',
  'LAB3D-10': 'onde',
};
export function guidaPilota(key, phase) {
  const pages = {
    volo: [
      [
        'Segui la pallina',
        'Avvia il lancio e guarda il culmine. La velocità cambia verso lungo la verticale, mentre la gravità continua a puntare verso il pavimento. Metti in pausa e confronta la pallina con la tacca dei grafici.',
        'aᵧ = −9,81 m/s²',
      ],
      [
        'Inclina il lancio',
        'Scegli elevazione e direzione. Vista dall’alto, la traiettoria segue la direzione orizzontale. Di lato puoi misurare l’altezza al culmine. Scorri il tempo per confrontare i vettori prima e dopo quel punto.',
        'vₕ = v₀ cos α · vᵧ(t) = v₀ sen α − gt',
      ],
      [
        'Controlla con un altro lancio',
        'Riparti dalla condizione al culmine o dal ritorno alla quota iniziale. Decidi quale componente della velocità entra nel calcolo e riporta l’unità.',
        'vᵧ = 0 al culmine · y = 0 al ritorno',
      ],
    ],
    tubo: [
      [
        'Segui due traccianti',
        'Mentre il fluido scorre, confronta un punto vicino alla parete con uno in asse. Il puntino rosso segue la quota della sonda. I punti che escono vengono reintrodotti all’ingresso per mostrare un flusso continuo.',
        'v(0) = 2v̄ · v(R) = 0',
      ],
      [
        'Scegli che cosa fissa la pompa',
        'Apri i parametri. Cambia il raggio a pressione fissata, poi ripeti a portata fissata. Leggi quale grandezza resta costante e quale risponde. Sposta la sonda lungo il raggio per campionare il profilo.',
        'Q = πR⁴Δp/(8μL)',
      ],
      [
        'Usa la condizione imposta',
        'Per il tracciante usa la velocità alla sua distanza dall’asse. Per l’intero tubo stabilisci se la pompa mantiene la pressione o la portata prima di applicare la quarta potenza.',
        'Δx = v(r)Δt · R idraulica = Δp/Q',
      ],
    ],
    gas: [
      [
        'Segui il pistone e il punto sul grafico',
        'Il termostato tiene costante T. La tacca verde è la partenza e quella viola è l’arrivo. Avvia il pistone. Quando il gas occupa meno spazio, il punto sul diagramma risale lungo l’isoterma.',
        'p(t)V(t) = nRT',
      ],
      [
        'Imposta i due volumi',
        'Scegli il volume finale e osserva il cambiamento di pressione nello stesso istante. Per invertire il processo porta il volume finale oltre quello iniziale. Se le due tacche coincidono il lavoro è zero.',
        'p𝒇/pᵢ = Vᵢ/V𝒇',
      ],
      [
        'Interpreta area e segno',
        'Confronta l’ultima pressione con la prima. Per leggere il lavoro guarda anche il verso con cui il punto ha percorso la curva, dalla tacca iniziale a quella finale.',
        'W del gas > 0 in espansione · W del gas < 0 in compressione',
      ],
    ],
    induzione: [
      [
        'Guarda il campo cambiare verso',
        'La bobina resta ferma. La lunghezza delle frecce viola segue il campo normale alla superficie e il loro verso ne indica il segno. Quando il campo passa per zero, guarda se la sua pendenza è ancora diversa da zero.',
        'ε = −Δ(NΦ)/Δt',
      ],
      [
        'Apri e chiudi l’interruttore',
        'Mantieni la stessa rampa del campo e confronta la corrente nelle due posizioni. Cambia poi il segno della rampa. A campo costante puoi avere flusso diverso da zero e fem nulla.',
        'Circuito chiuso con 5 Ω · I = ε/R',
      ],
      [
        'Distingui flusso e variazione',
        'Sottrai i flussi concatenati nei due istanti, dividi per l’intervallo e applica il segno meno. Per ricavare la corrente verifica che esista un percorso chiuso.',
        'Δ(NΦ) = NΦ finale − NΦ iniziale',
      ],
    ],
    onde: [
      [
        'Segui i due fronti fino a P',
        'Osserva la superficie e il grafico della sonda. La vista dall’alto rende visibili i fronti di entrambe le sorgenti. Quando una cresta e una valle raggiungono P, i loro spostamenti verticali si sommano con segno.',
        'y(P,t) = y₁(P,t) + y₂(P,t)',
      ],
      [
        'Sposta la sonda',
        'Metti la sonda sulla linea mediana con x = 0. Confronta le fasi 0° e 180°. In sezione vedi l’altezza lungo la linea passante per P. La scala verticale è ingrandita.',
        'Δφ = 2π(r₂ − r₁)/λ + φ₂',
      ],
      [
        'Prevedi cosa misura P',
        'Per un istante somma le due ordinate. Per l’ampiezza considera l’intero periodo e la differenza di fase. Il valore massimo raggiungibile è 4 mm.',
        'A = 2 mm per sorgente · 0 ≤ A risultante ≤ 4 mm',
      ],
    ],
  };
  return pages[key][phase === 3 ? 2 : phase];
}
export function ragionamento(key, p, s, t, q) {
  switch (key) {
    case 'volo':
      return [
        [
          'Scegli gli assi',
          'Segui l’ombra sul tavolo. La sua velocità rimane costante perché la sola forza è verticale. La direzione sul tavolo dipende dall’azimut β.',
          'vₕ = v₀ cos α · vₓ = vₕ cos β · v𝓏 = vₕ sen β',
          'x · z',
          0,
        ],
        [
          'Misura la salita',
          'L’impulso iniziale dà alla pallina una velocità verso l’alto. Ogni secondo la gravità sottrae 9,81 m/s alla componente verticale, anche mentre la pallina sale.',
          'vᵧ = v₀ sen α − gt = ' + n(s.u) + ' − 9,81 × ' + n(t) + ' = ' + n(q.vy) + ' m/s',
          'Velocità verticale',
          1,
        ],
        [
          'Ricostruisci la posizione',
          'Sul grafico velocità-tempo l’area verticale con segno dà la quota. La velocità orizzontale continua a spostare la pallina anche al culmine. Le tre frecce componenti ricostruiscono il vettore velocità.',
          'x = vₓt = ' + n(q.x) + ' m · y = vᵧ₀t − gt²/2 = ' + n(q.y) + ' m · z = v𝓏t = ' + n(q.z) + ' m',
          'Quota y',
          2,
        ],
        [
          'Ritrova il tempo di volo',
          'Alla quota di partenza raccogli il fattore t. La prima soluzione è il lancio, la seconda è l’arrivo. Dividendo il tempo totale per due trovi l’istante del culmine.',
          '0 = t(vᵧ₀ − gt/2) ⇒ T = 2vᵧ₀/g = ' + n(s.duration) + ' s ⇒ vᵧ₀ = gT/2',
          'Tempo t',
          2,
        ],
      ];
    case 'tubo':
      return [
        [
          'Isola due traccianti',
          'La parete trattiene il fluido a contatto. Al centro il fluido avanza più rapidamente. Confronta i punti dopo lo stesso intervallo. Le dimensioni assiale e radiale del disegno hanno scale diverse.',
          'r = (r/R) × R = ' + n((p.probe ?? 0.5) * p.r) + ' mm',
          'Velocità locale',
          1,
        ],
        [
          'Leggi la parabola',
          'A una stessa distanza dall’asse la velocità è uguale. Sulla parete la parentesi è zero. Nell’asse vale uno. Al centro la velocità è il doppio della media sulla sezione.',
          'v̄ = Q/(πR²) = ' + n(s.mean) + ' m/s · v(r) = 2v̄[1 − (r/R)²]',
          'Velocità locale',
          2,
        ],
        [
          'Cambia il raggio',
          'Ogni anello trasporta velocità per area. Sommando gli anelli ottieni Q. A pressione imposta, raddoppiando R la sezione quadruplica e la velocità media quadruplica a sua volta.',
          'Q = ∫v 2πr dr = πR⁴Δp/(8μL) · Q(2R)/Q(R) = 16',
          'Portata del modello',
          2,
        ],
        [
          'Inverti la domanda',
          'Se la pompa impone la portata, deve adattare la caduta di pressione. La parabola descrive un fluido newtoniano in moto laminare già sviluppato. Controlla Reynolds prima di leggere un tracciante.',
          'Δp = 8μLQ/(πR⁴) = ' + n(s.dp) + ' Pa · Re = ρv̄(2R)/μ = ' + n(s.re),
          'Caduta Δp',
          2,
        ],
      ];
    case 'gas':
      return [
        [
          'Segui il pistone',
          'Il cilindro ha sezione costante. Lo spostamento del pistone cambia il volume. Le due tacche restano ai volumi iniziale e finale. Il comando del pistone varia linearmente il volume in sei secondi di tempo simulato.',
          'V(t) = Vᵢ + (V𝒇 − Vᵢ) × t/(6 s) = ' + n(q.V) + ' L',
          'Volume',
          0,
        ],
        [
          'Confronta le pressioni',
          'Un termostato mantiene la temperatura e il pistone procede attraverso stati di equilibrio. Il gas è ideale e le moli sono costanti. Dimezzare lo spazio disponibile raddoppia la pressione.',
          'pV = nRT = ' + n(s.product) + ' J ⇒ p(t) = nRT/V(t) = ' + n(q.pressure) + ' kPa',
          'Pressione assoluta',
          1,
        ],
        [
          'Misura l’area con segno',
          'Durante un piccolo spostamento il gas compie p ΔV di lavoro. Sul diagramma la striscia ha altezza p e larghezza |ΔV|. Sommare le strisce dal volume iniziale a quello attuale dà il lavoro compiuto dal gas.',
          'W = ∫ p dV = nRT ln[V(t)/Vᵢ] = ' + n(q.work) + ' J · 1 kPa·L = 1 J',
          'Lavoro del gas',
          2,
        ],
        [
          'Controlla il bilancio',
          'L’espansione produce lavoro positivo. La compressione produce lavoro negativo. Per il gas ideale isotermo l’energia interna resta costante. Il calore ricevuto dal gas ha lo stesso segno del lavoro da esso compiuto.',
          'ΔU = Q − W = 0 ⇒ Q = W · T = pV/(nR) = ' + n(p.T) + ' K',
          'Prodotto pV',
          2,
        ],
      ];
    case 'induzione':
      return [
        [
          'Orienta la superficie',
          'Guarda la bobina dalla punta della normale +n. Il verso positivo lungo il suo bordo è antiorario. Ogni spira attraversata dal campo uniforme intercetta il campo per la propria area.',
          'Φ = BA cos θ · B normale con segno ⇒ Φ = B × 0,05 m²',
          'Campo B',
          0,
        ],
        [
          'Somma le dieci spire',
          'La bobina è ferma. Il flusso concatenato è dieci volte il flusso della singola spira. Guarda il suo segno quando le frecce del campo si invertono.',
          'NΦ = 10 × 0,05 × (' + n(q.B) + ') = ' + n(q.flux) + ' Wb',
          'Flusso concatenato NΦ',
          1,
        ],
        [
          'Confronta due istanti',
          'La pendenza misura la variazione di flusso per secondo. Una rampa lineare di campo dà fem costante anche quando B passa per zero. Cambia il segno del comando e confronta i grafici.',
          'ε = −Δ(NΦ)/Δt = −NAk = −0,5 × (' + n(s.x) + ') = ' + n(q.emf) + ' V',
          'Fem indotta',
          2,
        ],
        [
          'Chiudi il percorso',
          'La fem è lavoro per unità di carica. A interruttore aperto compare tensione ai capi e la corrente è nulla. A circuito chiuso il segno di I indica il verso. Il campo della corrente si oppone alla variazione del flusso esterno.',
          s.closed
            ? 'I = ε/R = ' + n(q.emf) + ' / 5 = ' + n(q.current) + ' A'
            : 'Circuito aperto ⇒ I = 0 A · ε = ' + n(q.emf) + ' V',
          'Corrente',
          2,
        ],
      ];
    case 'onde':
      return [
        [
          'Segui una cresta',
          'Ogni sorgente oscilla con la stessa frequenza. Una cresta impiega un periodo per avanzare di una lunghezza d’onda. Nel modello l’ampiezza di ciascun contributo resta 2 mm nella zona osservata.',
          'T = 1/f = ' + n(1 / p.f) + ' s · λ = cT = ' + n(s.lambda) + ' m',
          'Spostamento istantaneo',
          0,
        ],
        [
          'Confronta i cammini',
          'Le distanze fra ciascuna sorgente e la sonda P possono essere diverse. Ogni lunghezza d’onda in più corrisponde a un giro di fase. Aggiungi la fase iniziale della seconda sorgente secondo la convenzione kr − ωt + φ.',
          'Δr = r₂ − r₁ = ' +
            n(s.probe.r2 - s.probe.r1) +
            ' m · Δφ = 2πΔr/λ + φ₂ = ' +
            n(s.probe.delta) +
            ' rad',
          'Fase relativa',
          1,
        ],
        [
          'Somma allo stesso istante',
          'Prendi le due ordinate sul grafico, entrambe alla tacca di tempo. Una cresta positiva può incontrare una valle negativa. La sonda segue la loro somma algebrica.',
          'y₁ + y₂ = (' + n(1000 * q.first) + ') + (' + n(1000 * q.second) + ') = ' + n(1000 * q.y) + ' mm',
          'Spostamento istantaneo',
          2,
        ],
        [
          'Trova un nodo',
          'Nel punto medio i cammini sono uguali. Con sorgenti in fase le creste si rinforzano fino a 4 mm. Imposta 180° e le onde continuano a propagarsi ma P resta fermo per l’intero ciclo.',
          'Aᵣ = 2A |cos(Δφ/2)| = ' + n(s.envelope * 1000) + ' mm · f = c/λ',
          'Ampiezza alla sonda',
          2,
        ],
      ];
  }
}

const task = (prompt, value, unit, worked) => ({ prompt, value, unit, worked });
export const problemi = {
  volo: [
    task(
      'Con g = 10 m/s² e vᵧ₀ = 6 m/s, quale quota guadagni nei primi 0,2 s?',
      1,
      'm',
      'y = 6 × 0,2 − 5 × 0,2² = 1,2 − 0,2 = 1 m.',
    ),
    task(
      'Una goccia ricade alla quota del getto dopo 0,8 s. Con g = 10 m/s², quale era la velocità verticale iniziale?',
      4,
      'm/s',
      'Dalla seconda radice di y = 0 segue vᵧ₀ = gT/2 = 10 × 0,8/2 = 4 m/s.',
    ),
  ],
  tubo: [
    task(
      'Un tracciante in asse viaggia a 8 mm/s. A r = R/2 quanto avanza in 2 s?',
      12,
      'mm',
      'v = 8(1 − 1/4) = 6 mm/s. Lo spostamento è 6 × 2 = 12 mm.',
    ),
    task(
      'Due capillari laminari hanno pari lunghezza e viscosità. Per mantenere la stessa portata passi da R a 2R. La prima caduta era 96 Pa. Quale serve ora?',
      6,
      'Pa',
      'La resistenza è proporzionale a 1/R⁴. A portata fissata la pompa deve fornire 96/16 = 6 Pa.',
    ),
  ],
  gas: [
    task(
      'Durante una compressione isoterma lo stato passa da 4 L e 60 kPa a 3 L. Quanto segna il sensore di pressione?',
      80,
      'kPa',
      'pᵢVᵢ = 240 kPa·L. Dividendo per 3 L ottieni 80 kPa.',
    ),
    task(
      'Durante un’espansione isoterma un gas ideale assorbe 45 J. Quanto lavoro compie il gas sull’esterno, con il segno?',
      45,
      'J',
      'ΔU = 0. Da ΔU = Q − W segue W = Q = +45 J.',
    ),
  ],
  induzione: [
    task(
      'In 0,2 s il flusso concatenato passa da +0,30 Wb a −0,10 Wb. Quanto vale la fem media con il segno?',
      2,
      'V',
      'Δ(NΦ) = −0,10 − 0,30 = −0,40 Wb. ε = −(−0,40)/0,2 = +2 V.',
    ),
    task(
      'Chiudi una bobina su 8 Ω. Il flusso concatenato cresce di 0,4 Wb in 0,1 s. Qual è la corrente con il segno rispetto al verso positivo?',
      -0.5,
      'A',
      'ε = −0,4/0,1 = −4 V. I = −4/8 = −0,5 A.',
    ),
  ],
  onde: [
    task(
      'In un istante P riceve +1,5 mm dalla prima sorgente e −0,5 mm dalla seconda. Qual è lo spostamento risultante?',
      1,
      'mm',
      'Lo spostamento istantaneo è la somma con segno. +1,5 − 0,5 = +1 mm.',
    ),
    task(
      'Due sorgenti in fase sono distanti dalla sonda rispettivamente 0,6 m e 0,9 m. Con λ = 0,6 m e ampiezze uguali, quale ampiezza risultante osservi?',
      0,
      'mm',
      'Δr = 0,3 m = λ/2. La fase relativa è π e i contributi si cancellano in P.',
    ),
  ],
};
