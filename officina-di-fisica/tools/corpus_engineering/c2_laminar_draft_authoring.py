"""Reproduce the C2 fluid flow and surface tension draft editions."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c2-laminar-viscosity-reading-20261127'
POISEUILLE_BATCH = 'experiment-c2-poiseuille-reading-20261127'
NETWORK_BATCH = 'experiment-c2-hydraulic-network-reading-20261127'
SURFACE_BATCH = 'experiment-c2-surface-tension-reading-20261127'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


EDITIONS = {
    'SIM-C2-L007-01': {
        'points': [0.15, 0.4],
        'transferPrompt': 'Acqua di densità 1.000 kg/m³ e viscosità 0,001 Pa·s percorre un tubo di diametro 1 cm a {x}. Quale numero di Reynolds ottieni?',
        'blocks': [
            text('Il numero di Reynolds confronta gli effetti dell’inerzia con quelli della viscosità. Nel tubo si usa la velocità media sulla sezione e il diametro interno. Per l’acqua del modello prendi ρ = 1.000 kg/m³ ed η = 10⁻³ Pa·s. Il diametro è 1 cm = 10⁻² m.'),
            formula(r'\mathrm{Re}=\frac{\rho vD}{\eta}=(10^4\ \mathrm{s/m})v'),
            text('Per ritrovare il fattore, moltiplica le potenze 10³ e 10⁻², poi dividi per 10⁻³. L’esponente finale è 3 − 2 + 3 = 4. Le unità di ρvD sono kg/(m·s), le stesse di Pa·s, quindi Reynolds è adimensionale. A 0,15 m/s leggi 1.500 e a 0,40 m/s leggi 4.000.'),
            text('Disegna il diametro e la freccia della velocità media. A 1.500 aggiungi un profilo laminare parabolico al banco. A 4.000 il banco ritira quel profilo perché sarebbe fuori dal dominio scelto. Dividendo 2.300 per 10.000 trovi 0,23 m/s, una soglia orientativa del modello per il tubo, sensibile alle condizioni di ingresso e alle perturbazioni.'),
        ],
    },
    'SIM-C2-L007-02': {
        'points': [1, 2],
        'formula': 'v(R/2) = (8 cm/s)[1 − (1/2)²] = 6 cm/s',
        'transferPrompt': 'La sonda resta a metà raggio in un flusso laminare stazionario. Il profilo è parabolico e al centro l’acqua scorre a 8 cm/s. Al tempo {x}, quale velocità locale misuri?',
        'blocks': [
            text('Tieni fermo un punto nello spazio e confronta le sue letture in istanti diversi. Nel moto stazionario la velocità a quel punto resta costante nel tempo. In un profilo parabolico la velocità cambia da un raggio a un altro, quindi occorre fissare la sonda prima del confronto.'),
            formula(r'v(R/2)=v(0)\left[1-(1/2)^2\right]=(8\ \mathrm{cm/s})\frac34=6\ \mathrm{cm/s}'),
            text('Disegna la sezione di misura con una tacca a metà raggio. Un mezzo al quadrato dà un quarto. Togli quel quarto dall’intero e rimangono tre quarti. Fai 8/4 = 2, poi 2 × 3 = 6. Leggi dunque 6 cm/s sia a un secondo sia a due secondi.'),
            text('Nel disegno successivo la sonda è nello stesso punto e il tracciante rosso si è spostato. A metà raggio percorre altri 6 cm in un secondo, anche se la lettura locale resta uguale. Se conosci soltanto 6 cm/s a metà raggio, risali al valore sull’asse moltiplicando per 4/3 e torni a 8 cm/s.'),
        ],
    },
    'SIM-C2-L007-03': {
        'points': [0.5, 1.5],
        'formula': 'τ = η dv/dy, con dv/dy = 4 s⁻¹',
        'transferPrompt': 'Il gradiente resta 4 s⁻¹ fra le lastre. Con una viscosità di {x}, quale sforzo di taglio ottieni per il fluido newtoniano?',
        'blocks': [
            text('Considera strati di fluido tra due lastre che scorrono l’una rispetto all’altra. Per un fluido newtoniano la forza tangenziale per area è proporzionale al gradiente di velocità. Il banco tiene fermo il gradiente e cambia soltanto la viscosità, come quando si mantiene la stessa pendenza ma il liquido oppone una resistenza diversa.'),
            formula(r'\tau=\eta\frac{dv}{dy},\qquad \frac{dv}{dy}=4\ \mathrm{s^{-1}}'),
            text('Disegna le stesse frecce di velocità tra le lastre per entrambi i liquidi. Cambia la freccia dello sforzo. Per 0,5 Pa·s moltiplica 4 per un mezzo e trovi 2 Pa. Per 1,5 Pa·s moltiplica 4 per 1 + 1/2 e trovi 4 + 2 = 6 Pa. Nel prodotto Pa·s × s⁻¹ resta il pascal, uguale a N/m².'),
            text('Per stimare η da uno sforzo di 6 Pa, dividi per 4 s⁻¹. Ottieni 6/4 Pa·s = 3/2 Pa·s. Le velocità degli strati possono essere uguali nei due esperimenti e gli sforzi diversi, perché è diversa la risposta viscosa del fluido.'),
        ],
    },
    'SIM-C2-L007-04': {
        'points': [2, 5],
        'transferPrompt': 'Le due lastre distano {x}. Quella superiore scorre a 40 mm/s e quella inferiore è ferma. Quale gradiente trovi per un profilo lineare?',
        'blocks': [
            text('Usa l’asse y per misurare l’altezza dal basso verso l’alto e disegna la velocità orizzontale rispetto a quest’asse. Per un profilo lineare la pendenza è il salto di velocità fra le lastre diviso per la distanza. Il salto è 40 mm/s in entrambe le configurazioni.'),
            formula(r'\frac{dv}{dy}=\frac{\Delta v}{h}=\frac{40\ \mathrm{mm/s}}{h}'),
            text('Con le lastre a 2 mm, distribuisci il salto di 40 su due millimetri. Il gradiente vale 20 s⁻¹. A 5 mm, dividi 40 per 5 e trovi 8 s⁻¹. I millimetri si cancellano perché le due lunghezze usano la stessa unità. Traccia i due profili con lo stesso salto di velocità e altezze diverse per confrontare le pendenze.'),
            text('Per calcolare la distanza necessaria a ottenere 8 s⁻¹, inverti il rapporto. Dividi 40 mm/s per 8 s⁻¹ e trovi 5 mm. Il gradiente positivo indica che la velocità cresce con y. Una lastra più lontana distribuisce lo stesso salto su più spazio.'),
        ],
    },
    'SIM-C2-L007-05': {
        'points': [0.5, 1],
        'formula': 'v(r) = (12 cm/s) [1 − (r/R)²]',
        'transferPrompt': 'In un tubo con profilo laminare parabolico la velocità sull’asse è 12 cm/s. Se r/R vale {x}, quale velocità locale misuri?',
        'blocks': [
            text('Nel tubo circolare con moto laminare pienamente sviluppato, la velocità va misurata a una distanza r dall’asse. Parti con la freccia più lunga sull’asse e riducila seguendo la parabola. Alla parete ferma la condizione di aderenza dà velocità nulla.'),
            formula(r'v(r)=12\ \mathrm{cm/s}\left[1-(r/R)^2\right]'),
            text('A r/R = 1/2 la parte sottratta vale 1/4. Rimangono 3/4 della velocità di asse. Dividi 12 per 4, poi moltiplica 3 per 3. Leggi 9 cm/s. Alla parete r/R = 1 e la parentesi vale 1 − 1 = 0. Nella figura segna i tre raggi 0, R/2 e R prima di unire le punte delle frecce.'),
            text('Se trovi 9 cm/s, separa il profilo dal fattore 12. Hai v/12 = 3/4, quindi (r/R)² = 1 − 3/4 = 1/4. La distanza radiale è positiva o nulla e la radice dà r/R = 1/2. A metà raggio la velocità è quindi tre quarti di quella sull’asse, come mostra il profilo curvo.'),
        ],
    },
}



POISEUILLE = {
    'SIM-C2-L008-01': {
        'points': [2, 0.5],
        'transferPrompt': 'In un tubo rigido il raggio diventa {x} volte quello iniziale. Nello stesso liquido e a pari lunghezza e salto di pressione, quale rapporto Q/Q₀ trovi?',
        'blocks': [
            text('Per fare il confronto usa lo stesso liquido newtoniano e un tubo diritto, rigido e circolare. Mantieni uguali lunghezza e salto di pressione e supponi flusso laminare pienamente sviluppato. Nel rapporto fra le due portate si cancellano tutti i fattori tranne la quarta potenza del raggio.'),
            formula(r'Q=\frac{\pi r^4\Delta p}{8\eta L},\qquad \frac{Q}{Q_0}=\left(\frac{r}{r_0}\right)^4'),
            text('Accosta due sezioni di raggio r₀ e 2r₀. La sezione più grande ha quattro volte l’area. Alla stessa caduta di pressione, il modello dà anche una velocità media quattro volte maggiore. Il prodotto area per velocità diventa 4 × 4 = 16 volte più grande.'),
            text('Se dimezzi il raggio, il rapporto delle portate è (1/2)⁴ = 1/16. Per scriverlo in decimale, dimezza uno quattro volte o usa 625/10.000 e inserisci 0,0625. Per il problema inverso, se vuoi una portata 16 volte maggiore, la radice quarta positiva di 16 è 2 e devi raddoppiare il raggio mantenendo valide le ipotesi.'),
        ],
    },
    'SIM-C2-L008-02': {
        'points': [1, 2],
        'transferPrompt': 'Il tecnico seleziona «{x}» nel banco. Tutti gli altri parametri restano ai valori di riferimento. Quale rapporto fra la nuova portata e Q₀ ottiene?',
        'blocks': [
            text('Usa un tubo di riferimento e ripeti l’esperimento cambiando una sola condizione. Per un liquido newtoniano in flusso laminare pienamente sviluppato dentro un tubo rigido, la quarta potenza del raggio e il salto di pressione stanno al numeratore. Viscosità e lunghezza stanno al denominatore.'),
            formula(r'\frac{Q}{Q_0}=\frac{\Delta p}{\Delta p_0}\left(\frac{r}{r_0}\right)^4\frac{\eta_0}{\eta}\frac{L_0}{L}'),
            text('Disegna prima la sezione del tubo iniziale e poi quella di raggio doppio. Nell’ultima prova ottieni 2⁴ = 4 × 4 = 16 per la portata relativa. Riparti dal tubo iniziale e allungalo lasciando immutata la sezione. Con L = 2L₀ il rapporto diventa L₀/(2L₀) = 1/2, quindi inserisci 0,5.'),
            text('Raddoppiare solo la viscosità dà ancora 1/2. Raddoppiare soltanto il salto di pressione dà invece 2. Se l’unico parametro variato è la lunghezza e osservi metà della portata, puoi invertire il rapporto e dedurre che il tubo è lungo il doppio. In figura l’area e la lunghezza sono due misure distinte.'),
        ],
    },
    'SIM-C2-L008-03': {
        'points': [2.5, 6],
        'transferPrompt': 'Per ottenere una portata di {x} in un capillare di resistenza 3 kPa·s/mL, quale salto di pressione deve sostenere la pompa?',
        'blocks': [
            text('La resistenza idraulica R descrive quanta differenza di pressione occorre per mantenere una certa portata. Nel regime lineare del banco la geometria e il liquido restano uguali e R è costante. Segna la pressione a monte e quella a valle. La pompa sostiene la differenza fra le due letture.'),
            formula(r'\Delta p=RQ,\qquad R=3\ \mathrm{kPa}\,\mathrm{s}/\mathrm{mL}'),
            text('Moltiplica 3 per 2,5 spezzando 2,5 in 2 + 1/2. Ottieni 6 + 1,5 = 7,5 kPa. Con 6 mL/s il conto è 3 × 6 = 18 kPa. Nelle unità, mL del flusso e s della resistenza si cancellano con quelli al denominatore del prodotto.'),
            text('Aggiungi alla figura due punti su un grafico della differenza di pressione rispetto alla portata e uniscili all’origine. La pendenza è R, quindi puoi tornare da 18 kPa a 6 mL/s dividendo per 3 kPa·s/mL. Quando la portata è zero, il modello dà zero caduta di pressione nel tubo.'),
        ],
    },
    'SIM-C2-L008-04': {
        'points': [-20, 20],
        'formula': 'Q/Q₀ = [1 + Δr/r₀]⁴. Se il controllo vale x%, Δr/r₀ = x/100',
        'transferPrompt': 'In un tubo rigido, il raggio varia del {x}. A pari caduta di pressione, quanto vale il rapporto fra nuova portata e portata iniziale?',
        'blocks': [
            text('Il controllo assegna una variazione percentuale del raggio, da aggiungere al raggio iniziale. Disegna il raggio di riferimento e affianca due raggi con un quinto in meno e un quinto in più. Per il tubo rigido con liquido newtoniano in regime laminare, la portata dipende dalla quarta potenza del raggio a pari caduta di pressione, viscosità e lunghezza.'),
            formula(r'\frac{Q}{Q_0}=\left(1+\frac{\Delta r}{r_0}\right)^4'),
            text('Con −20% hai r/r₀ = 4/5 = 8/10. Il numeratore al quadrato è 64 e il suo quadrato vale (60 + 4)² = 3.600 + 480 + 16 = 4.096. Dividendo per 10⁴ ottieni 0,4096. Con +20% hai 12/10. Fa 12² = 144, poi (150 − 6)² = 22.500 − 1.800 + 36 = 20.736. Su 10⁴ vale 2,0736.'),
            text('Le due variazioni del raggio sono simmetriche attorno a r₀, mentre le portate distano da 1 rispettivamente di 0,5904 e 1,0736. La quarta potenza rompe quella simmetria. Per risalire dal rapporto di portata al raggio prendi la radice quarta positiva. Questi risultati descrivono il tubo rigido del banco. Pareti deformabili e flusso pulsante cambiano il modello.'),
        ],
    },
}


NETWORKS = {
    'SIM-C2-L009-01': {
        'points': [2, 6],
        'formula': '1/Rₑq = 1/R₁ + 1/R₂ in parallelo. In serie Rₑq = R₁ + R₂. R₁ = 2 kPa·s/mL',
        'transferPrompt': 'Un ramo da 2 kPa·s/mL è in parallelo con un ramo da {x}. Qual è la resistenza equivalente fra i due nodi comuni?',
        'blocks': [
            text('Segna il nodo di ingresso e quello di uscita, poi unisci gli stessi due nodi con due rami. Il salto di pressione è comune, mentre le due portate si sommano. Nel banco vale la legge lineare Δp = RQ per ciascun ramo. Aggiungendo il secondo ramo si aggiunge una via di passaggio.'),
            formula(r'Q=\Delta p\left(\frac{1}{R_1}+\frac{1}{R_2}\right),\qquad R_{\rm eq}=\frac{R_1R_2}{R_1+R_2}'),
            text('Con due rami da 2 kPa·s/mL, la portata è doppia rispetto a un solo ramo. La resistenza equivalente è la metà di 2, quindi 1 kPa·s/mL. Con R₂ = 6 kPa·s/mL calcola 2 × 6/(2 + 6) = 12/8 = 3/2 kPa·s/mL. Un ramo da 6 lascia passare meno fluido del ramo da 2 quando Δp è uguale.'),
            text('Se l’equivalente vale 3/2 kPa·s/mL, sottrai 1/2 da 2/3 nelle unità della conduttanza. Rimane 1/6, quindi R₂ è 6 kPa·s/mL. Se invece disegni i due rami uno dopo l’altro, la portata è comune. In quella configurazione la pompa deve sostenere la somma delle due cadute e la resistenza è 2 + 6 = 8 kPa·s/mL.'),
        ],
    },
    'SIM-C2-L009-02': {
        'points': [3, 6],
        'formula': 'Q₁ = Δp/R₁, con Δp = 12 kPa',
        'transferPrompt': 'La pompa fissa una differenza di pressione di 12 kPa. La resistenza del ramo superiore è {x}. Quale portata passa in quel ramo?',
        'blocks': [
            text('Disegna le frecce dei due rami in parallelo. Entrambe collegano il nodo ad alta pressione allo stesso nodo a bassa pressione. La pompa fissa la differenza fra i nodi a 12 kPa e nel modello ogni ramo ha resistenza lineare. Puoi quindi calcolare la sua portata separatamente con la sua resistenza.'),
            formula(r'Q_1=\frac{12\ \mathrm{kPa}}{R_1},\qquad Q_2=\frac{12\ \mathrm{kPa}}{3\ \mathrm{kPa\,s/mL}}=4\ \mathrm{mL/s}'),
            text('Se R₁ = 3 kPa·s/mL, disegna frecce uguali e inserisci 12/3 = 4 mL/s per il ramo superiore. Se R₁ sale a 6 kPa·s/mL, disegna la freccia in alto lunga la metà. Il conto 12/6 dà 2 mL/s. Nel ramo inferiore persistono 4 mL/s perché lì non è cambiato né il salto di pressione né la resistenza.'),
            text('La portata totale è la somma. Passa da 8 a 6 mL/s quando riduci la portata superiore. Per risalire a R₁ da 2 mL/s dividi 12 kPa per 2 mL/s. Il risultato è 6 kPa·s/mL. Questa dipendenza presuppone che la pompa mantenga davvero la stessa differenza ai due capi.'),
        ],
    },
    'SIM-C2-L009-03': {
        'points': [2, 6],
        'formula': 'pₙ − pᵤ = (pᵢ − pᵤ) R₂/(R₁ + R₂), con pᵢ = 10 kPa, pᵤ = 0 kPa e R₁ = 2 kPa·s/mL',
        'transferPrompt': 'In un tubo in serie R₁ = 2 kPa·s/mL e la resistenza a valle è {x}. Dall’ingresso a 10 kPa all’uscita a 0 kPa, quale pressione trovi fra R₁ e R₂?',
        'blocks': [
            text('Metti le due resistenze in fila e traccia una sola freccia di portata lungo il tubo. In moto stazionario incomprimibile la portata è uguale nei due tratti. Le cadute di pressione si sommano e ciascuna è proporzionale alla resistenza del proprio tratto. La pressione al nodo è quella di uscita più la caduta sul tratto a valle.'),
            formula(r'Q=\frac{p_i-p_u}{R_1+R_2},\qquad p_n-p_u=R_2Q=(p_i-p_u)\frac{R_2}{R_1+R_2}'),
            text('Disegna un dislivello totale di 10 kPa. Con R₂ = 2 le due cadute sono uguali, quindi il nodo sta a 5 kPa. Con R₂ = 6 la parte a valle è 6/(2 + 6) = 3/4 del totale. Tre quarti di 10 fanno 7,5 kPa. La parte a monte scende a 2,5 kPa.'),
            text('Se sai che il nodo è a 7,5 kPa, usa il rapporto fra le cadute. A valle cadono 7,5 kPa e a monte 2,5 kPa. Poiché la portata è uguale, R₂ è tre volte R₁, quindi 6 kPa·s/mL. Mentre la resistenza a valle cresce, la portata totale cala e la pressione del nodo si avvicina a quella di ingresso.'),
        ],
    },
}
SURFACES = {
    'SIM-C2-L010-01': {
        'points': [1.5, 4],
        'transferPrompt': 'Una pellicola di sapone ha due facce e la tensione su ciascuna è 0,05 N/m. Il bordo mobile è lungo {x}. Quale forza in mN lo mantiene in equilibrio?',
        'blocks': [
            text('Disegna il bordo mobile e guarda il film da un lato. La tensione superficiale esercita una trazione tangente alla superficie, lungo tutta la linea di contatto. Ripeti il disegno per l’altra faccia della pellicola. Su questo bordo le due trazioni hanno lo stesso verso e il bordo è perpendicolare alla direzione di tiro.'),
            formula(r'F=2\gamma\ell=(0{,}10\ \mathrm{N/m})\ell'),
            text('Con 1,5 cm hai 0,015 m. Dividi per dieci e ottieni 0,0015 N, cioè 1,5 mN. Con 4 cm parti da 0,04 m, trovi 0,004 N e quindi 4 mN. L’uguaglianza fra il numero in centimetri e quello in millinewton vale qui perché la tensione assegnata dà esattamente 0,10 N/m per entrambe le facce.'),
            text('Con 4 mN torna a 0,004 N e dividi per 0,10 N/m. Ottieni 0,04 m, cioè 4 cm. Il segno della forza di equilibrio è opposto a quello del tiro del film. Conteggiare una sola superficie farebbe prevedere metà della forza richiesta.'),
        ],
    },
    'SIM-C2-L010-02': {
        'points': [0.5, 3],
        'transferPrompt': 'Per gocce sferiche di raggio {x}, quale superficie esposta per unità di volume ottieni in mm⁻¹?',
        'blocks': [
            text('Disegna due sfere e segna il raggio dal centro alla superficie. L’area cresce con il quadrato del raggio, mentre il volume cresce con il cubo. Quando confronti l’area esposta con il volume racchiuso, una potenza del raggio rimane al denominatore.'),
            formula(r'\frac{A}{V}=\frac{4\pi r^2}{(4/3)\pi r^3}=\frac{3}{r}'),
            text('Per r = 1/2 mm, dividere 3 per un mezzo equivale a moltiplicare per due. Ottieni 6 mm⁻¹. Per r = 3 mm ottieni 3/3 = 1 mm⁻¹. Dalla misura 6 mm⁻¹ ricavi r = 3/(6 mm⁻¹) = 1/2 mm. Le unità sono mm²/mm³ e diventano l’inverso di una lunghezza.'),
            text('Ora immagina di suddividere lo stesso volume totale in molte gocce uguali. Il rapporto complessivo fra la somma delle aree e il volume totale è ancora 3/r. A volume totale fissato, le gocce più piccole espongono quindi più superficie.'),
        ],
    },
    'SIM-C2-L010-03': {
        'points': [60, 120],
        'transferPrompt': 'Al contatto nullo il capillare ha un dislivello di +10 mm. Se l’angolo misurato nel liquido vale {x}, quale dislivello con segno ottieni?',
        'blocks': [
            text('Segna lo zero all’altezza del pelo libero esterno. Misura l’angolo fra parete e tangente al menisco dalla parte del liquido. Lungo la circonferenza la tensione ha componente verticale γ cos θ per unità di lunghezza. In equilibrio questa componente bilancia la differenza idrostatica della colonna. Supponi il tubo circolare e usa il modello statico del banco.'),
            formula(r'2\pi r\gamma\cos\theta=\rho g\pi r^2 h,\qquad h=\frac{2\gamma}{\rho g r}\cos\theta=(10\ \mathrm{mm})\cos\theta'),
            text('Sul disegno di 60° traccia una componente rivolta in alto. Il coseno di 60° è 1/2, quindi h = +5 mm. Per 120° usa cos(180° − 60°) = −cos 60° e ottieni −5 mm. Il menisco sta sotto il livello esterno. A 90° la componente verticale scompare e il dislivello è zero.'),
            text('Dal dislivello −5 mm risali a cos θ = −5/10 = −1/2. Nell’intervallo da 0° a 180° riconosci 120° senza cercare valori di arccoseno. La stessa lunghezza in valore assoluto da una parte e dall’altra del livello corrisponde a due angoli supplementari.'),
        ],
    },
    'SIM-C2-L010-04': {
        'points': [0, 1.5],
        'formula': 'Δp = 2γ/r = 2γκ, con κ = 1/r e γ = 0,05 N/m',
        'transferPrompt': 'Una goccia sferica ha una sola interfaccia, tensione 0,05 N/m e curvatura 1/r uguale a {x}. Qual è il salto di pressione dall’esterno all’interno?',
        'blocks': [
            text('Segna le pressioni ai due lati di una sola superficie liquida. Per una sfera le due curvature principali valgono entrambe 1/r. La legge di Laplace somma quei contributi. Il banco mostra 1/r, quindi devi contare due volte quella curvatura per ottenere la somma.'),
            formula(r'\Delta p=\gamma(1/r+1/r)=2\gamma\kappa,\qquad 1\ \mathrm{mm}^{-1}=1000\ \mathrm m^{-1}'),
            text('Per la superficie piana la curvatura è zero, quindi 2γ × 0 dà 0 Pa. A 1,5 mm⁻¹ moltiplica per 1.000 e ottieni 1.500 m⁻¹. Il doppio di 0,05 N/m è 0,10 N/m. Un decimo di 1.500 dà 150 N/m², cioè 150 Pa.'),
            text('Traccia una sezione più curva per il secondo caso, con la pressione maggiore all’interno. Per ritrovare la curvatura da 150 Pa dividi per 0,10 N/m e ottieni 1.500 m⁻¹, pari a 1,5 mm⁻¹. Curvatura zero significa raggio infinito nel modello limite.'),
        ],
    },
    'SIM-C2-L010-05': {
        'points': [2, 8],
        'transferPrompt': 'Una bolla di sapone sottile ha raggio {x} e tensione 0,05 N/m su ciascuna faccia. Quale pressione interna in eccesso prevedi?',
        'blocks': [
            text('Disegna il film come due circonferenze molto vicine tra loro. Si passa dall’aria esterna al liquido e poi dal liquido all’aria interna. Nel limite di film sottile, i due raggi sono quasi uguali e ciascuna interfaccia contribuisce 2γ/r al salto. Assumi equilibrio e uguale tensione sulle due facce.'),
            formula(r'\Delta p=\frac{4\gamma}{r}=\frac{0{,}20\ \mathrm{N/m}}{r}'),
            text('Con r = 2 mm dividi 0,20 per 0,002 in unità SI. Il rapporto è 200/2 = 100 Pa. Con 8 mm dividi 200 per 8 e ottieni 25 Pa. La bolla più grande ha raggio quadruplo e sovrapressione pari a un quarto.'),
            text('Per ritrovare il raggio da 25 Pa inverti la relazione. Calcola (0,20 N/m)/(25 N/m²) = 0,008 m = 8 mm. Alla stessa γ e allo stesso raggio una goccia con una sola interfaccia darebbe metà del salto. La differenza dipende dal numero di superfici che attraversi, mentre le due curvature per superficie restano già incluse.'),
        ],
    },
}


def assemble(source_file, directory, batch, editions, prerequisite):
    sources = {row['id']: row for row in json.loads(source_file.read_bytes())}
    records, bindings = [], []
    for key, authored in editions.items():
        source = sources[key]
        if (source['version'], source['kind'], source['course']) != (1, 'experiment', 'C2'):
            raise ValueError('Unexpected immutable source ' + key)
        record = {**source, 'baseVersion': 1, 'version': 2, 'prerequisites': [prerequisite],
                  'transferPrompt': authored['transferPrompt'], 'blocks': authored['blocks'],
                  'formula': authored.get('formula', source['formula']),
                  'assessmentSelection': {'schemaVersion': '1.0.0', 'points': authored['points']},
                  'review': 'Candidata DRAFT. Revisione distinta e approvazione umana in attesa.'}
        records.append(record)
        bindings.append({'id': key, 'sourceId': key, 'sourceRef': SOURCE_REF,
                         'sourceSha256': digest(source), 'candidateSha256': digest(record), 'assetChecksums': {}})
    write(directory/(batch+'.json'), {'schema': 'astra/1', 'records': records, 'assets': []})
    write(directory/(batch+'-bindings.json'), bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_file', type=Path)
    parser.add_argument('batch_directory', type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--poiseuille', action='store_true')
    mode.add_argument('--networks', action='store_true')
    mode.add_argument('--surfaces', action='store_true')
    args = parser.parse_args()
    if args.poiseuille:
        scope = POISEUILLE_BATCH, POISEUILLE, 'C2-L008'
    elif args.networks:
        scope = NETWORK_BATCH, NETWORKS, 'C2-L009'
    elif args.surfaces:
        scope = SURFACE_BATCH, SURFACES, 'C2-L010'
    else:
        scope = BATCH, EDITIONS, 'C2-L007'
    assemble(args.source_file, args.batch_directory, *scope)
