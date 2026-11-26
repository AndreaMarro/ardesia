"""Ten distinct original Cric wave questions; author edition, no own approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C5.json"
SOURCE_IDS=['C5-Q001', 'C5-Q002', 'C5-Q003', 'C5-Q004', 'C5-Q005', 'C5-Q006', 'C5-Q007', 'C5-Q008', 'C5-Q009', 'C5-Q010']
TASKS=[('Misurare dal centro a un estremo',
  'Un oscillatore raggiunge +7 mm e −7 mm rispetto allo zero di equilibrio. Qual è l’ampiezza, in millimetri?',
  7,
  'L’ampiezza è una distanza dall’equilibrio a un solo estremo. La corsa completa va da −7 a +7 mm e misura 14 '
  'mm. Dividendo questa corsa per due trovo 7 mm. Lo stesso risultato si legge direttamente come distanza fra '
  'zero e +7 mm, oppure fra zero e −7 mm.',
  'A=\\frac{x_{\\max}-x_{\\min}}2\\qquad A=7\\,\\mathrm{mm}',
  '14 mm è la distanza fra entrambi gli estremi, non l’ampiezza. −7 mm è una coordinata orientata: un’ampiezza '
  'non è negativa. 3,5 mm dividerebbe ancora per due una distanza già misurata dal centro.',
  'Traccia lo zero di equilibrio e misura fino a un solo estremo.'),
 ('Contare gli intervalli fra sei massimi',
  'Un oscillatore periodico ha il primo massimo a 0,10 s e il sesto a 0,85 s. Qual è il periodo esatto?',
  ['0,17 s', '0,15 s', '0,125 s', '0,75 s', '0,85 s'],
  'Fra il primo e il sesto massimo ci sono cinque intervalli, come fra sei tacche su un righello. Sottraggo i due '
  'tempi: 0,85−0,10=0,75 s. Divido per cinque e ottengo 0,15 s. Posso verificarlo elencando i massimi a 0,10; '
  '0,25; 0,40; 0,55; 0,70; 0,85 s.',
  '\\Delta t=0{,}75\\,\\mathrm s\\qquad T=\\frac{\\Delta t}{5}\\qquad T=\\frac3{20}\\,\\mathrm s',
  '0,125 s divide 0,75 s per sei e conta un intervallo in più. 0,75 s è l’intero tempo trascorso. 0,17 s divide '
  'il tempo finale per cinque senza sottrarre l’istante iniziale.',
  'Conta i vuoti fra i sei massimi, poi sottrai gli estremi temporali.'),
 ('Due zeri non fanno ancora un giro',
  'Un oscillatore armonico ideale di ampiezza non nulla passa due volte consecutive per l’equilibrio in versi '
  'opposti. Fra i due passaggi trascorrono 18 ms. Qual è la frequenza esatta?',
  ['36 Hz', '18 Hz', '250/9 Hz', '500/9 Hz', '125/9 Hz'],
  'Partendo dal centro in un verso, l’oscillatore visita un estremo e ritorna al centro nel verso opposto: è '
  'mezzo ciclo. Il periodo intero è dunque 36 ms, cioè 36/1000 s=9/250 s. Invertendo questa frazione ottengo '
  '250/9 Hz. La frazione selezionabile evita una divisione decimale periodica.',
  'T=2\\cdot18\\,\\mathrm{ms}\\qquad T=\\frac9{250}\\,\\mathrm s\\qquad f=\\frac{250}{9}\\,\\mathrm{Hz}',
  '500/9 Hz tratta i 18 ms come un periodo intero. 125/9 Hz usa invece quattro volte 18 ms. I numeri 36 e 18 '
  'descrivono durate in millisecondi nei passaggi precedenti, non frequenze in hertz.',
  'Prima ricostruisci un ciclo intero e soltanto dopo fai il reciproco in secondi.'),
 ('Riconoscere la fase nella corsa',
  'Per lo stesso oscillatore armonico ideale, con ampiezza e pulsazione costanti, confronti due istanti lontani '
  'dagli estremi. Quale coppia di osservazioni identifica la stessa fase modulo un giro?',
  ['Stesso modulo della velocità, qualunque sia la posizione',
   'Uguale energia totale',
   'Stesso modulo dell’accelerazione',
   'Stessa posizione e stesso verso della velocità',
   'Stessa posizione e verso opposto della velocità'],
  'Una posizione interna si attraversa due volte per ciclo. Sapere se il corpo sta andando verso destra o verso '
  'sinistra distingue quei due passaggi. Stessa posizione e stesso verso della velocità riportano quindi allo '
  'stesso stato della sinusoide, a meno di un numero intero di periodi. L’energia totale è invece identica in '
  'tutte le fasi del moto ideale.',
  'x_2=x_1\\qquad \\operatorname{sgn}(v_2)=\\operatorname{sgn}(v_1)',
  'Il solo modulo della velocità coincide anche in posizioni opposte. Una posizione con verso di moto opposto '
  'corrisponde all’altro attraversamento e non alla stessa fase. La conservazione dell’energia non seleziona un '
  'istante del ciclo.',
  'Immagina i due passaggi per il centro: quale informazione li distingue?'),
 ('Il coseno parte da un estremo',
  'Un oscillatore segue x(t)=A cos(ωt), con A>0 e ω>0. Quali posizione e velocità ha a t=0?',
  ['Equilibrio e velocità positiva',
   'Equilibrio e velocità nulla',
   'Estremo negativo e velocità nulla',
   'Estremo positivo e velocità massima',
   'Estremo positivo e velocità nulla'],
  'A t=0 l’argomento del coseno è zero e cos0=1: la coordinata è +A. La velocità è la pendenza della curva, '
  'oppure la derivata −Aω sin(ωt), che vale zero. L’accelerazione non è nulla: è −ω²A e punta verso l’equilibrio. '
  'Il corpo sta invertendo il verso del moto.',
  'x(0)=A\\qquad v(0)=0\\qquad a(0)=-\\omega^2A',
  'Il passaggio per l’equilibrio appartiene a una fase diversa. All’estremo la velocità non è massima: è '
  'momentaneamente zero. Il segno positivo dell’estremo deriva dal coseno iniziale, non dal segno della velocità.',
  'Valuta il coseno e la pendenza nello stesso istante iniziale.'),
 ('Dai radianti ai cicli trascorsi',
  'La fase reale accumulata da un oscillatore armonico cresce di 3π radianti. Quanti periodi sono trascorsi? Non '
  'arrotondare il conteggio a un intero.',
  ['3/2 periodi', '3 periodi', '1/2 periodo', '2/3 di periodo', '6 periodi'],
  'Un ciclo completo corrisponde a 2π radianti. Divido la fase accumulata per quella di un giro: 3π/(2π)=3/2. È '
  'un periodo intero più mezzo periodo. Il numero di periodi trascorsi è un rapporto di tempi e può essere '
  'frazionario; non è un conteggio di soli giri completati.',
  '\\frac{\\Delta t}{T}=\\frac{\\Delta\\varphi}{2\\pi}\\qquad \\frac{\\Delta t}{T}=\\frac32',
  'Tre periodi richiederebbero 6π radianti. Mezzo periodo richiede solo π. 2/3 inverte il rapporto fra fase '
  'accumulata e fase di un giro. Non si deve eliminare il mezzo ciclo soltanto perché non è completo.',
  'Un giro di fase contiene 2π radianti.'),
 ('Il segno del richiamo',
  'Nella legge a=−ω²x di un oscillatore armonico, con ω>0 e origine x=0 scelta al centro del moto, verso quale '
  'posizione punta l’accelerazione quando x≠0?',
  ['Il verso positivo dell’asse in ogni istante',
   'La posizione di equilibrio',
   'L’estremo positivo in ogni istante',
   'L’estremo più vicino in ogni istante',
   'Il verso della velocità in ogni istante'],
  'Se x è positiva, l’accelerazione è negativa; se x è negativa, l’accelerazione è positiva. In entrambi i casi '
  'punta verso x=0, posizione di equilibrio. Il segno meno esprime un richiamo rispetto alla posizione, non un '
  'freno sempre opposto alla velocità. Nel passaggio per il centro l’accelerazione si annulla.',
  'a=-\\omega^2x',
  'Durante il moto verso il centro accelerazione e velocità possono avere lo stesso verso. Una forza dissipativa '
  'avrebbe invece un legame diverso con la velocità. Né l’estremo positivo né il verso positivo sono privilegiati '
  'lungo tutto il ciclo.',
  'Prova separatamente una coordinata positiva e una negativa.'),
 ('Il centro è il punto più veloce',
  'Un oscillatore armonico ideale, di ampiezza non nulla, attraversa l’equilibrio. Quale fra queste grandezze '
  'raggiunge il massimo modulo?',
  ['Lo spostamento dall’equilibrio',
   'L’energia potenziale elastica rispetto al minimo',
   'La velocità',
   'L’accelerazione',
   'La forza elastica risultante'],
  'All’equilibrio lo spostamento e il richiamo elastico sono nulli. L’energia potenziale elastica è minima e '
  'tutta l’energia oscillatoria è cinetica. La velocità ha quindi modulo massimo, pari ad Aω. Lo stesso valore '
  'del modulo si ritrova nei due passaggi per il centro, con versi opposti.',
  '|v|_{\\max}=A\\omega\\qquad x=0\\qquad a=0',
  'Accelerazione e forza di richiamo hanno invece massimo modulo agli estremi, dove la velocità è zero. Lo '
  'spostamento al centro è nullo. Il massimo della velocità non richiede una forza massima nello stesso istante.',
  'Segui dove si trova l’energia quando la deformazione elastica è nulla.'),
 ('Una molla quattro volte meno rigida',
  'Lo stesso corpo di massa m>0 oscilla senza attriti con una molla ideale. In una seconda preparazione k₂=k₁/4, '
  'con k₁>0. Come cambia il periodo, usando ω²=k/m?',
  ['Si dimezza', 'Quadruplica', 'Diventa un quarto', 'Raddoppia', 'Resta uguale'],
  'A massa costante il rapporto ω₂²/ω₁² vale 1/4. La pulsazione positiva diventa quindi metà di prima. Poiché '
  'T=2π/ω, il periodo raddoppia. Le due preparazioni possono avere la stessa ampiezza nel regime lineare: la '
  'variazione di periodo deriva dalla rigidezza, non da una variazione di massa.',
  '\\frac{\\omega_2}{\\omega_1}=\\frac12\\qquad \\frac{T_2}{T_1}=2',
  'Quadruplicare T userebbe una dipendenza inversa da k senza la radice. Dimezzare T confonderebbe il rapporto '
  'dei periodi con quello delle pulsazioni. Il periodo non resta costante quando cambia k a massa fissata.',
  'Estrai prima la radice del rapporto delle pulsazioni al quadrato.'),
 ('Massimi sempre più piccoli',
  'Una traccia mostra massimi successivi di 8 mm, 6 mm e 4,5 mm rispetto allo stesso equilibrio, quasi '
  'equidistanti nel tempo. Quale descrizione è compatibile con questi dati?',
  ['Oscillatore ideale con ampiezza costante',
   'Periodo uguale alla differenza fra le altezze',
   'Frequenza che diminuisce necessariamente come le altezze',
   'Nessun moto, perché i massimi non sono uguali',
   'Ampiezza decrescente e periodo osservato quasi costante'],
  'Le altezze misurano l’ampiezza e diminuiscono: 6/8=3/4 e 4,5/6=3/4. Le separazioni temporali quasi uguali '
  'indicano invece un periodo osservato quasi costante. Una dissipazione debole è compatibile con questa traccia. '
  'I soli tre massimi non identificano in modo unico la legge completa dello smorzamento.',
  '\\frac{A_2}{A_1}=\\frac34\\qquad \\frac{A_3}{A_2}=\\frac34',
  'Un modello ideale ad ampiezza costante non riproduce queste altezze. Sottrarre millimetri non dà un tempo. La '
  'diminuzione dell’ampiezza non implica lo stesso rapporto per la frequenza: il dato temporale va letto '
  'separatamente.',
  'Confronta separatamente le ordinate dei massimi e le loro distanze temporali.')]
CHOICES={2: 1, 3: 2, 4: 3, 5: 4, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4}
UNITS={1: 'mm'}
FIGURES={1: 'Nel primo pannello gli estremi sono +7 e −7 mm. Ogni distanza dal centro a un estremo è 7 mm; la corsa completa è 14 mm. La figura confronta posizioni sulla stessa scala, non un percorso temporale.', 2: 'Sei massimi delimitano cinque intervalli temporali uguali. Le tacche da 0,10 a 0,85 s hanno scala comune e separazione di 0,15 s.', 10: 'Le barre indicano soltanto le altezze di tre massimi successivi: 8, 6 e 4,5 mm. L’ascissa enumera i massimi e non misura una nuova durata; la quasi uguaglianza dei tempi è un dato della consegna.'}
def assemble(repo,source_ref):
 categories={1: 'concetto', 2: 'testo', 3: 'modello', 4: 'concetto', 5: 'modello', 6: 'algebra', 7: 'concetto', 8: 'concetto', 9: 'algebra', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C5-L01"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c5-l01",TASKS,CHOICES,UNITS,"cric-c5-l01-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C5",skill="C5-L01",section="Onde e oscillazioni",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c5-l01")
