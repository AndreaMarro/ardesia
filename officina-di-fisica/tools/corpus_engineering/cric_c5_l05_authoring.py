"""Ten distinct original Cric wave questions; author edition, no own approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C5.json"
SOURCE_IDS=['C5-Q041', 'C5-Q042', 'C5-Q043', 'C5-Q044', 'C5-Q045', 'C5-Q046', 'C5-Q047', 'C5-Q048', 'C5-Q049', 'C5-Q050']
TASKS=[('Ricostruire l’intensità da cinquanta decibel',
  'Il livello di intensità è L=10 log₁₀(I/I₀) dB e il riferimento è I₀=10⁻¹² W/m². A 50 dB quale intensità '
  'corrisponde, in microwatt al metro quadrato?',
  ['0,10 μW/m²', '10 μW/m²', '100 μW/m²', '0,00001 μW/m²', '50 μW/m²'],
  'Divido il coefficiente del livello per dieci: log₁₀(I/I₀)=5. Significa che I/I₀=10⁵. Moltiplico 10⁵ per 10⁻¹² '
  'W/m² e ottengo 10⁻⁷ W/m². Poiché un microwatt è 10⁻⁶ W, il valore è 10⁻¹ μW/m², ossia 0,10 μW/m². Ogni '
  'passaggio usa soltanto potenze di dieci.',
  '\\log_{10}(I/I_0)=5\\qquad I=10^{-7}\\,\\mathrm{W/m^2}\\qquad I=\\frac1{10}\\,\\mu\\mathrm{W/m^2}',
  '10 μW/m² corrisponde a un rapporto 10⁷ dal riferimento e quindi a 70 dB, non 50 dB. 50 copia il coefficiente '
  'del livello senza invertire il logaritmo. Il prefisso micro moltiplica l’unità watt per 10⁻⁶.',
  'Il logaritmo vale cinque: ricostruisci prima il rapporto, poi converti il prefisso.'),
 ('Zero della scala e intensità non nulla',
  'Nel livello L=10 log₁₀(I/I₀) dB, il riferimento I₀ è positivo. Quale intensità fisica corrisponde a L=0 dB?',
  ['Un valore che dipende soltanto dal tempo di ascolto',
   'L’intensità positiva I₀',
   'Intensità rigorosamente nulla',
   'Un’intensità negativa',
   'La massima intensità udibile da chiunque'],
  'Il logaritmo deve valere zero e 10⁰=1. Dunque I/I₀=1 e I=I₀>0. Lo zero della scala di livello è un riferimento '
  'convenzionale, non assenza di onda. Per intensità positive inferiori a I₀ il livello può essere negativo senza '
  'che sia negativa l’intensità fisica.',
  '\\log_{10}(I/I_0)=0\\qquad I/I_0=1\\qquad I=I_0',
  'Intensità nulla non appartiene al dominio del logaritmo reale di questa formula: il livello tende a meno '
  'infinito quando I tende a zero da valori positivi. Un’intensità negativa non è ammessa nel modello del '
  'livello.',
  'Quale numero positivo ha logaritmo decimale uguale a zero?'),
 ('Il segno della variazione in decibel',
  'Un filtro acustico porta un’intensità positiva I_i a I_f=I_i/100. Usa ΔL=10 log₁₀(I_f/I_i) dB. Qual è la '
  'variazione finale meno iniziale, in decibel?',
  -20,
  'Il rapporto finale su iniziale è 1/100=10⁻². Il suo logaritmo decimale è −2; moltiplicando per dieci ottengo '
  '−20 dB. Il segno negativo corrisponde alla diminuzione dell’intensità. Non devo conoscere il livello iniziale '
  'per trovare questa differenza.',
  '\\frac{I_f}{I_i}=10^{-2}\\qquad \\Delta L=-20\\,\\mathrm{dB}',
  '+20 dB inverte l’ordine del rapporto e descriverebbe un aumento di cento volte. −2 dB dimentica il fattore '
  'dieci della definizione. −100 dB non è il logaritmo del fattore cento.',
  'Scrivi un centesimo come una potenza di dieci.'),
 ('La misura non esaurisce la percezione',
  'Due toni hanno la stessa intensità fisica positiva al ricevitore e frequenze diverse. Senza altre informazioni '
  'sull’udito dell’ascoltatore, si può dedurre che siano percepiti ugualmente forti?',
  ['Sì, purché l’intensità sia espressa in W/m²',
   'No: il tono più acuto ha necessariamente maggiore intensità fisica',
   'No: due frequenze diverse non possono mai avere intensità uguali',
   'No: la sensibilità dell’udito dipende anche dalla frequenza',
   'Sì, sempre, perché i watt sono uguali'],
  'La stessa intensità dà lo stesso livello riferito allo stesso I₀. La sensazione dipende però anche dalla '
  'frequenza e dalla risposta dell’ascoltatore. Il solo dato fisico assegnato non consente quindi di concludere '
  'uguale sensazione. Non serve negare l’uguaglianza delle intensità per riconoscere questo limite.',
  'I_1=I_2\\qquad L_1=L_2',
  'Cambiare l’unità con cui si esprime I non cambia la percezione. Una frequenza maggiore non impone un’intensità '
  'fisica maggiore. Il livello di intensità non costituisce da solo una scala universale della sensazione sonora.',
  'Distingui la grandezza rilevata dal microfono dalla risposta dell’orecchio.'),
 ('Andata più ritorno dell’eco',
  'Una sorgente e un microfono sono nello stesso punto, a 51 m da una parete ferma. Il suono viaggia alla stessa '
  'velocità costante all’andata e al ritorno; l’eco arriva dopo 0,30 s, trascurando altri ritardi. Qual è la '
  'velocità in metri al secondo?',
  340,
  'L’eco percorre 51 m fino alla parete e altri 51 m per ritornare al microfono. Il cammino totale è 102 m. '
  'Divido per 0,30 s e, moltiplicando numeratore e denominatore per dieci, ottengo 1020/3=340 m/s. Il controllo '
  '340×0,30=102 m ricostruisce entrambe le tratte.',
  's_{\\rm tot}=2d\\qquad s_{\\rm tot}=102\\,\\mathrm m\\qquad v=340\\,\\mathrm{m/s}',
  '170 m/s divide soltanto la distanza della parete per il tempo di andata e ritorno. 680 m/s conterebbe quattro '
  'tratte uguali. Il fattore due viene dalla geometria dell’eco, non da una variazione della velocità alla '
  'riflessione.',
  'Disegna separatamente la freccia di andata e quella di ritorno.'),
 ('Il tono prima e dopo il passaggio',
  'Una sorgente sonora subsonica mantiene la frequenza emessa in aria immobile. Rispetto a un ricevitore fermo '
  'passa da un tratto radiale di avvicinamento a uno di allontanamento, con velocità radiali non nulle. Come si '
  'confrontano le frequenze ricevute con quella emessa?',
  ['Prima superiore, poi inferiore a quella emessa',
   'Prima inferiore, poi superiore a quella emessa',
   'Sempre uguali a quella emessa',
   'Entrambe nulle perché il ricevitore è fermo',
   'Cambia soltanto l’intensità, mai la frequenza'],
  'In avvicinamento le emissioni successive partono da posizioni più vicine al ricevitore: i fronti davanti alla '
  'sorgente sono più ravvicinati e arrivano più spesso. In allontanamento i fronti arrivano più distanziati e la '
  'frequenza ricevuta è minore di quella emessa. La sorgente mantiene il suo ritmo proprio; cambia il ritmo di '
  'arrivo nel mezzo.',
  'f_{\\rm avv}>f_{\\rm emessa}\\qquad f_{\\rm all}<f_{\\rm emessa}',
  'Essere fermo non impedisce al ricevitore di rilevare un Doppler dovuto alla sorgente. Variare soltanto '
  'l’intensità non descrive la diversa separazione dei fronti. Il modello dichiarato è subsonico, non il caso di '
  'fronti d’urto.',
  'Conta quanti fronti raggiungono il punto fisso in un secondo.'),
 ('Andare incontro ai fronti',
  'Una sorgente sonora resta ferma in aria immobile. Un ascoltatore si muove verso la sorgente con velocità '
  'positiva minore di quella del suono. Che cosa cambia al suo orecchio?',
  ['La velocità del suono rispetto all’aria aumenta',
   'Incontra più fronti nell’unità di tempo',
   'La sorgente emette più cicli in un secondo',
   'La distanza fra i fronti nell’aria deve raddoppiare',
   'La frequenza ricevuta si annulla'],
  'La sorgente ferma mantiene il ritmo di emissione e la distanza fra i fronti nell’aria. L’ascoltatore va '
  'incontro ai fronti e li incrocia più spesso di un ricevitore fermo. La frequenza ricevuta aumenta senza '
  'bisogno di cambiare la frequenza della sorgente o la velocità del suono rispetto al mezzo.',
  'f_{\\rm ricevuta}>f_{\\rm emessa}',
  'Il movimento del ricevitore non modifica automaticamente le onde già emesse nel mezzo. Non raddoppia la loro '
  'distanza e non accelera il suono rispetto all’aria. Il ritmo degli incontri può cambiare anche se il ritmo '
  'della sorgente resta invariato.',
  'Immagina di camminare incontro a una successione regolare di fronti.'),
 ('La stessa frequenza oltre il confine',
  'Un suono monocromatico di 1,00 kHz passa normalmente dall’aria all’acqua attraverso un’interfaccia fissa e '
  'lineare. Nell’acqua la velocità assegnata è 1480 m/s. Qual è la lunghezza d’onda trasmessa?',
  ['0,6757 m', '1000 m', '1,48 m', '1480 m', '0,00148 m'],
  'L’interfaccia fissa conserva la frequenza di 1,00 kHz=1000 Hz. Nell’acqua λ=v/f=1480/1000 m=1,48 m. Il nuovo '
  'mezzo cambia la velocità e quindi la distanza fra fronti, ma non il ritmo temporale imposto dalla sorgente. La '
  'divisione per mille si esegue spostando la virgola di tre posizioni.',
  'f=1000\\,\\mathrm{Hz}\\qquad \\lambda=\\frac{v}{f}\\qquad \\lambda=1{,}48\\,\\mathrm m',
  '1480 m usa 1 Hz anziché 1 kHz. 0,00148 m conterebbe il fattore mille due volte. Invertire v/f produce un '
  'numero con dimensione inversa di una lunghezza; non è la λ richiesta.',
  'Conserva la frequenza e usa la velocità del mezzo di arrivo.'),
 ('Il nome dell’unità del livello',
  'Come si chiama l’unità con simbolo dB usata per il livello di intensità sonora?',
  ['Hertz', 'Pascal', 'Joule', 'Decibel', 'Watt al metro quadrato'],
  'Il nome è decibel. Il livello è dieci volte il logaritmo decimale di un rapporto di intensità e si esprime in '
  'dB. L’intensità fisica si misura invece in W/m²: una grandezza e il suo livello logaritmico non hanno la '
  'stessa unità di presentazione.',
  'L=10\\log_{10}(I/I_0)\\,\\mathrm{dB}',
  'Hertz misura frequenza, pascal pressione e joule energia. Watt al metro quadrato è l’unità di I, non il nome '
  'dell’unità del suo livello. Il rapporto nell’argomento del logaritmo deve essere adimensionale.',
  'Leggi per esteso il simbolo dB.'),
 ('Tre sorgenti senza fase comune',
  'Tre sorgenti mutuamente incoerenti producono ciascuna la stessa intensità media positiva I al microfono. I '
  'termini d’interferenza hanno media nulla. Quanto aumenta il livello rispetto a una sola? Scegli l’espressione '
  'esatta positiva, senza approssimare il logaritmo.',
  ['30 dB', '3 dB', '20 log₁₀(3) dB', '10 log₁₀(1/3) dB', '10 log₁₀(3) dB'],
  'Per sorgenti incoerenti si sommano le intensità medie: I_tot=I+I+I=3I. La differenza dei livelli dipende dal '
  'rapporto 3I/I=3. È quindi 10 log₁₀(3) dB, positivo perché 3>1. Questa forma è già esatta e selezionabile: non '
  'occorre calcolare a mente le cifre decimali del logaritmo.',
  'I_{\\rm tot}=3I\\qquad \\Delta L=10\\log_{10}(3)\\,\\mathrm{dB}',
  '30 dB richiederebbe un rapporto d’intensità 1000, non 3. 3 dB confonde il numero delle sorgenti con un '
  'livello. Il fattore 20 si applica a rapporti di ampiezze nelle condizioni appropriate, non al rapporto '
  'd’intensità qui assegnato. Il rapporto inverso darebbe una variazione negativa.',
  'Somma prima le intensità, poi confronta il totale con quella di una sola sorgente.')]
CHOICES={1: 0, 2: 1, 4: 3, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4}
UNITS={3: 'dB', 5: 'm/s'}
FIGURES={1: 'Il primo pannello separa il livello dal rapporto d’intensità: 0 dB corrisponde a I₀, 10 dB a 10I₀ e 50 dB a 10⁵I₀. Le lunghezze delle frecce non rappresentano intensità lineari.', 5: 'La parete è a 51 m dal punto comune di sorgente e microfono. Le due frecce distinte rappresentano 51 m di andata e 51 m di ritorno: 102 m in 0,30 s.', 8: 'L’ultimo pannello è un’istantanea della sola onda in acqua, a 1,00 kHz. La distanza fra due creste è 1,48 m; non è la traiettoria delle particelle. La frequenza è la stessa di quella incidente attraverso l’interfaccia fissa.'}
def assemble(repo,source_ref):
 categories={1: 'unità', 2: 'concetto', 3: 'calcolo', 4: 'concetto', 5: 'testo', 6: 'concetto', 7: 'modello', 8: 'unità', 9: 'unità', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C5-L05"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c5-l05",TASKS,CHOICES,UNITS,"cric-c5-l05-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C5",skill="C5-L05",section="Onde e oscillazioni",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c5-l05")
