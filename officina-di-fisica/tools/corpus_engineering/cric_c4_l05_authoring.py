"""Ten distinct original Cric electric questions; author edition, not approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C4.json"
SOURCE_IDS=['C4-Q041', 'C4-Q042', 'C4-Q043', 'C4-Q044', 'C4-Q045', 'C4-Q046', 'C4-Q047', 'C4-Q048', 'C4-Q049', 'C4-Q050']
TASKS=[('Carica da due intervalli di corrente',
  'Una corrente vale +3 mA per 4 s e poi +1 mA per altri 6 s, sempre nello stesso verso positivo. Quanti mC '
  'attraversano complessivamente la sezione?',
  18,
  'Per una corrente costante in ciascun tratto, la carica è corrente per durata. Il primo intervallo trasferisce '
  '3×4=12 mC e il secondo 1×6=6 mC, perché mA·s=mC. I due contributi hanno lo stesso segno e si sommano: totale '
  '+18 mC. Nel grafico I(t) è la somma delle due aree rettangolari.',
  '\\Delta q=I_1\\Delta t_1+I_2\\Delta t_2\\qquad \\Delta q=18\\,\\mathrm{mC}',
  '12 mC considera soltanto il primo intervallo; 6 mC soltanto il secondo. 40 mC userebbe la somma delle correnti '
  'per la durata complessiva come se entrambe scorressero contemporaneamente. Le durate sono invece successive.',
  'Calcola separatamente le due cariche e poi somma con il segno.'),
 ('Corrente convenzionale e deriva elettronica',
  'In un tratto metallico la corrente convenzionale è diretta verso destra. Qual è il verso della deriva media '
  'degli elettroni?',
  ['Sempre verso l’alto, indipendentemente dal filo',
   'Verso sinistra, opposto alla corrente convenzionale',
   'Verso destra, sempre concorde con la corrente convenzionale',
   'Nessuna deriva media è possibile in un metallo',
   'Alternativamente destra e sinistra con media necessariamente nulla'],
  'La corrente convenzionale segue il trasporto di carica positiva equivalente. Gli elettroni hanno carica '
  'negativa, quindi la loro deriva media è in verso opposto: verso sinistra. Si parla di moto medio ordinato, '
  'sovrapposto ai moti microscopici; non si afferma che ogni singolo elettrone percorra sempre una linea retta '
  'verso sinistra.',
  'q_e=-e',
  'Una deriva concorde di portatori negativi darebbe corrente convenzionale opposta a quella assegnata. '
  'L’agitazione microscopica non annulla per forza la deriva media che sostiene la corrente. Il verso verticale '
  'non è indicato dai dati.',
  'Usa il segno negativo dei portatori e distingui deriva media da moto microscopico.'),
 ('Il vincolo del generatore ideale',
  'Quale grandezza viene mantenuta fissa da un generatore ideale di tensione ai suoi morsetti, nelle condizioni '
  'di funzionamento ammesse? Rispondi con il nome della differenza fra i due punti.',
  ['Carica totale trasferita in ogni intervallo',
   'Potenza assorbita da qualunque carico',
   'Differenza di potenziale',
   'Corrente in qualunque carico',
   'Resistenza di qualunque carico'],
  'Il generatore ideale di tensione impone la differenza di potenziale fra i morsetti. Se cambia il carico, la '
  'corrente necessaria a rispettare quel vincolo può cambiare. Non impone perciò in generale la stessa corrente, '
  'potenza o quantità di carica trasferita per tutti i carichi.',
  'V_{\\rm morsetti}=V_0',
  'Un generatore ideale di corrente avrebbe un vincolo diverso. La resistenza appartiene al carico e non è '
  'fissata dalla sola tensione. Carica e potenza dipendono anche dalla corrente e, per la carica trasferita, '
  'dalla durata.',
  'Identifica il vincolo che compare nel nome del generatore.'),
 ('Durata di un trasferimento di carica',
  'Un segnale mantiene una corrente costante di 0,40 mA e trasferisce 8,0 μC nel verso positivo. Per quanti '
  'millisecondi dura?',
  20,
  'Dalla definizione I=Δq/Δt ricavo Δt=Δq/I. Una corrente di 0,40 mA equivale a 400 μC/s, quindi il tempo è '
  '8,0/400 s=0,020 s. Con 1000 ms in un secondo ottengo 20 ms. Controllo: (0,40 mA)(0,020 s)=0,0080 mC=8,0 μC.',
  '\\Delta t=\\frac{\\Delta q}{I}\\qquad \\Delta t=20\\,\\mathrm{ms}',
  '2 ms trasferirebbero 0,8 μC e 200 ms trasferirebbero 80 μC. Moltiplicare corrente e carica non darebbe un '
  'tempo. I prefissi micro e milli non possono essere trattati come uguali.',
  'Porta carica e corrente a prefissi coerenti, poi dividi.'),
 ('Una retta meno ripida nel grafico I contro V',
  'In un grafico con I in ordinata e V in ascissa, due resistori ohmici a temperatura fissata danno rette per '
  'l’origine con pendenze positive diverse. Quale ha resistenza più alta?',
  ['Quello con pendenza I/V maggiore',
   'Hanno necessariamente la stessa resistenza perché passano per l’origine',
   'Quello che ha corrente maggiore alla stessa tensione positiva',
   'La resistenza non si può confrontare nemmeno conoscendo gli assi',
   'Quello con pendenza I/V minore, quindi con retta meno ripida'],
  'Per un resistore ohmico I=V/R, quindi la pendenza del grafico I(V) è 1/R. Una pendenza minore corrisponde a '
  'resistenza maggiore. Alla stessa tensione positiva quel resistore lascia passare meno corrente. Occorre '
  'leggere gli assi: nel grafico opposto V(I) la pendenza sarebbe invece R.',
  'I=V/R',
  'La regola “maggiore pendenza, maggiore resistenza” vale per V in ordinata e I in ascissa, non per gli assi di '
  'questa domanda. Passare per l’origine non fissa il valore della pendenza. Una corrente maggiore alla stessa '
  'tensione implica resistenza minore.',
  'Scrivi la legge nella forma della variabile che si trova in ordinata.'),
 ('Stirare un filo senza perdere volume',
  'Un filo uniforme ha lunghezza e sezione iniziali positive, resistività positiva e invariata. Viene stirato '
  'fino a lunghezza doppia conservando il volume del materiale. Quanto vale il rapporto R_f/R_i?',
  4,
  'Il volume vale Aℓ. Se la lunghezza raddoppia senza perdita di volume, la sezione si dimezza. La legge R=ρℓ/A '
  'fornisce quindi un fattore due dalla lunghezza e un altro fattore due dal reciproco della sezione. Il rapporto '
  'complessivo è quattro. È il modello ideale a resistività invariata dichiarato, non una legge per qualunque '
  'deformazione reale.',
  'A_f=A_i/2\\qquad \\frac{R_f}{R_i}=\\frac{2}{1/2}=4',
  'Due considera soltanto la lunghezza e trascura la sezione. Un mezzo scambia la dipendenza inversa dall’area. '
  'Otto conterebbe un ulteriore fattore due non presente nei vincoli assegnati.',
  'Usa prima il volume costante per ricavare come cambia la sezione.'),
 ('Una proprietà del materiale',
  'Quale grandezza, indicata usualmente con ρ, ha unità Ω·m nella relazione per la resistenza di un filo '
  'omogeneo?',
  ['Corrente elettrica', 'Resistività', 'Resistenza', 'Conduttanza', 'Densità di massa'],
  'La grandezza è la resistività. Nella legge R=ρℓ/A, il rapporto ℓ/A ha unità m⁻¹: per ottenere R in ohm, ρ deve '
  'avere unità ohm moltiplicato per metro, cioè Ω·m. La resistività dipende dal materiale e dalle condizioni, per esempio '
  'dalla temperatura.',
  '\\rho=\\frac{RA}{\\ell}',
  'La resistenza ha unità Ω, la conduttanza Ω⁻¹ e la corrente A. La stessa lettera greca ρ può rappresentare una '
  'densità in altri contesti, ma qui legge e unità identificano la resistività.',
  'Ricava ρ dalla legge del filo e controlla le unità.'),
 ('Resistenza di una pista rettangolare',
  'Una pista uniforme lunga 0,20 m ha larghezza 2,0 mm e spessore 0,10 mm. Alla temperatura considerata la '
  'resistività è 2,0×10⁻⁸ Ω·m. Trova la resistenza fra gli estremi lungo la lunghezza.',
  ['2,0 Ω', '20 Ω', '0,020 Ω', '0,0020 Ω', '0,20 Ω'],
  'L’area trasversale è larghezza per spessore: (2,0×10⁻³ m)(1,0×10⁻⁴ m)=2,0×10⁻⁷ m². Il prodotto ρℓ vale '
  '4,0×10⁻⁹ Ω·m². Dividendo per l’area ottengo R=2,0×10⁻² Ω=0,020 Ω. L’area richiesta non è la superficie estesa '
  'della faccia della pista.',
  'A=2{,}0\\cdot10^{-7}\\,\\mathrm{m^2}\\qquad R=0{,}020\\,\\Omega',
  '0,0020 Ω richiederebbe una sezione dieci volte maggiore; 0,20 Ω una dieci volte minore, a parità degli altri '
  'dati. 2,0 Ω e 20 Ω non soddisfano la sostituzione SI. Due lunghezze in millimetri formano un’area con fattore '
  '10⁻⁶ rispetto al metro quadrato.',
  'Calcola la sezione perpendicolare alla corrente, poi usa R=ρℓ/A.'),
 ('Due misure non descritte dalla stessa costante',
  'Per lo stesso componente si misurano 1 V con 1 mA e 3 V con 2 mA. Quale conclusione segue direttamente dai due '
  'dati?',
  ['La resistenza costante è sicuramente 2 kΩ perché si divide la differenza delle tensioni per quella delle '
   'correnti',
   'Il componente è necessariamente un generatore ideale',
   'La corrente si annulla in entrambi i punti',
   'Il rapporto V/I cambia: una sola resistenza costante non descrive entrambi i punti',
   'Il rapporto V/I è identico in entrambi i punti'],
  'Nel primo punto V/I=1 V/(0,001 A)=1000 Ω. Nel secondo V/I=3 V/(0,002 A)=1500 Ω. I due rapporti sono diversi: i '
  'dati non seguono un’unica legge V=RI con lo stesso R in entrambe le condizioni. Questa conclusione non '
  'identifica da sola la causa del cambiamento o l’intera curva del componente.',
  'R_1=1000\\,\\Omega\\qquad R_2=1500\\,\\Omega',
  'Il rapporto fra le differenze vale 2 kΩ, ma è la pendenza della secante fra i due punti, non un valore di R '
  'che soddisfi V=RI per entrambi. Non si può dedurre dai soli dati che il componente sia un generatore o che la '
  'corrente sia nulla.',
  'Calcola separatamente V/I in ciascuna misura prima di confrontarli.'),
 ('Somma algebrica dei transiti',
  'In 5 s attraversano una sezione 12 C di carica positiva equivalente verso destra e 2 C verso sinistra. Calcola '
  'la corrente media in A scegliendo destra come verso positivo.',
  2,
  'Il transito algebrico verso destra è +12 C−2 C=+10 C. Divido per l’intero intervallo di 5 s e ottengo '
  'I_media=+2 A. La media conta la carica netta orientata, non la somma dei moduli dei transiti nei due versi.',
  '\\Delta q=10\\,\\mathrm C\\qquad I_{\\rm medio}=2\\,\\mathrm A',
  '14/5 A somma i moduli e perde l’inversione del verso. 12/5 A ignora la carica che passa verso sinistra. −2 A '
  'userebbe il riferimento opposto a quello assegnato.',
  'Attribuisci prima un segno ai due transiti, poi dividi la somma per la durata.')]
CHOICES={2: 1, 3: 2, 5: 4, 7: 1, 8: 2, 9: 3}
UNITS={1: 'mC', 4: 'ms', 6: '1', 10: 'A'}
FIGURES={1: 'Le due aree del grafico I(t) sono cariche positive: 12 mC nel primo intervallo e 6 mC nel secondo, per un totale di 18 mC.', 6: 'Schema di un filo a sezione rettangolare, con profondità costante: raddoppiare la lunghezza dimezza l’altezza e quindi la sezione A. Il volume resta lo stesso; con resistività invariata R aumenta di un fattore quattro.', 9: 'Sono rappresentati soltanto i due punti misurati, con I in ordinata e V in ascissa; non una curva interpolata fra essi. I rapporti statici V/I valgono 1 kΩ e 1,5 kΩ e non coincidono.'}
def assemble(repo,source_ref):
 categories={1: 'modello', 2: 'concetto', 3: 'concetto', 4: 'unità', 5: 'modello', 6: 'modello', 7: 'unità', 8: 'unità', 9: 'modello', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C4-L05"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c4-l05",TASKS,CHOICES,UNITS,"cric-c4-l05-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C4",skill="C4-L05",section="Elettricità e magnetismo",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c4-l05")
