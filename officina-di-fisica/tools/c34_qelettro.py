"""Cento problemi indipendenti di elettromagnetismo. Unità SI salvo richiesta esplicita."""

from c34_base import *

enter("C4", 1)
num(
    "Contare gli elettroni trasferiti",
    "Una gocciolina acquisisce carica −4,80 fC. Quanti elettroni ha acquistato? Usa e = 1,60 × 10⁻¹⁹ C.",
    1,
    30000,
    "elettroni",
    1,
    4.8e-15 / 1.6e-19,
    "Converti il femtocoulomb e usa il modulo della carica.",
    "unità",
    "Il prefisso femto vale 10⁻¹⁵, e il numero di particelle è positivo.",
    eq(r"N=|q|/e=\frac{4{,}80\cdot10^{-15}}{1{,}60\cdot10^{-19}}=3{,}00\cdot10^4"),
    "Il segno meno indica un eccesso di elettroni, non un numero negativo di particelle.",
)
choice(
    "Forze fra cariche diverse",
    "Due cariche isolate +q e +3q si respingono. Quale confronto fra le forze reciproche rispetta la dinamica?",
    1,
    "Stesso modulo e versi opposti",
    [
        "La carica maggiore esercita forza tripla",
        "Stesso modulo e stesso verso",
        "La carica minore non esercita forza",
    ],
    "Guarda la coppia di corpi su cui agiscono le due forze.",
    "concetto",
    "La legge di Coulomb è simmetrica nello scambio fra q₁ e q₂.",
    "Le forze costituiscono una coppia di azione e reazione. Il loro modulo contiene il prodotto q·3q, uguale nelle due valutazioni. Le accelerazioni richiedono anche le rispettive masse.",
)
word(
    "Prefisso sotto il microcoulomb",
    "Quale prefisso SI, scritto in lettere, corrisponde a 10⁻⁹ e si usa spesso per le piccole cariche?",
    1,
    "nano",
    ["nano-"],
    "Fra un microcoulomb e un picocoulomb vi sono due salti di un fattore mille.",
    "unità",
    "Un nanocoulomb è un miliardesimo di coulomb.",
    eq(r"1\ \mathrm{nC}=10^{-9}\ \mathrm C=10^{-3}\ \mu\mathrm C"),
    "Tenere separati prefisso e unità evita errori di molti ordini di grandezza nella forza.",
)
num(
    "La distanza necessaria a ridurre la forza",
    "Due cariche a distanza 4 cm si respingono con forza F. A quanti cm vanno portate per ridurre il modulo a F/9?",
    2,
    12,
    "cm",
    0.03,
    4 * math.sqrt(9),
    "La distanza compare al quadrato al denominatore.",
    "algebra",
    "Per ridurre la forza nove volte basta aumentare la distanza di tre volte.",
    eq(
        r"\frac{F_f}{F_i}=\left(\frac{r_i}{r_f}\right)^2=\frac19\quad\Longrightarrow\quad r_f=3r_i=12\ \mathrm{cm}"
    ),
    "Il risultato è una distanza maggiore, coerente con una forza ridotta.",
)
num(
    "Carica mancante dopo la separazione",
    "Un sistema isolato possiede in totale −2,5 nC. Dopo una separazione il primo oggetto ha +1,2 nC. Qual è la carica del secondo, in nC?",
    1,
    -3.7,
    "nC",
    0.015,
    -2.5 - 1.2,
    "Somma algebricamente le due cariche finali.",
    "calcolo",
    "Una parte positiva richiede una seconda parte più negativa del totale.",
    eq(
        r"q_1+q_2=Q\quad\Longrightarrow\quad q_2=Q-q_1=-2{,}5-1{,}2=-3{,}7\ \mathrm{nC}"
    ),
    "Il controllo restituisce +1,2 − 3,7 = −2,5 nC.",
)
choice(
    "Quando approssimare una sfera con un punto",
    "In quale condizione geometrica la dimensione di un corpo carico può essere usualmente trascurata in una stima del suo campo lontano, se ha carica netta diversa da zero?",
    2,
    "La distanza di osservazione è molto maggiore delle dimensioni del corpo",
    [
        "Il corpo è necessariamente neutro",
        "Il punto di osservazione è sulla superficie",
        "La carica deve essere un elettrone",
    ],
    "Confronta la dimensione della sorgente con la distanza.",
    "modello",
    "Da lontano le differenze relative di distanza dai diversi punti della sorgente sono piccole.",
    "Il contributo dominante a grandi distanze è quello della carica netta trattata come puntiforme. Vicino a una distribuzione estesa l’effettiva geometria può contare fortemente.",
)
word(
    "Segni opposti",
    "Come si definisce, con un aggettivo, la forza fra due cariche puntiformi ferme di segno opposto?",
    1,
    "attrattiva",
    ["attraente"],
    "Le frecce sulle due cariche puntano una verso l’altra o si allontanano?",
    "concetto",
    "Il prodotto q₁q₂ negativo stabilisce il verso attrattivo dell’interazione.",
    fig("C4-coulomb", "Ogni forza è diretta verso la posizione dell’altra carica."),
    "La forza accelera ciascuna carica verso l’altra se le particelle sono libere. Il modulo della forza rimane una grandezza positiva.",
)
num(
    "Cambiare insieme cariche e distanza",
    "Una delle due cariche puntiformi è triplicata e la distanza è raddoppiata, mentre l’altra carica resta uguale. Trova il rapporto Ff/Fi dei moduli.",
    2,
    0.75,
    "1",
    0.004,
    3 / 2**2,
    "Scrivi separatamente il fattore dovuto alla carica e quello dovuto alla distanza.",
    "algebra",
    "Il raddoppio della distanza dà un fattore 1/4.",
    eq(r"F_f/F_i=(3q_1/q_1)(r_i/r_f)^2=3(1/2)^2=3/4"),
    "Nonostante la carica maggiore, la forza finale vale il 75% di quella iniziale.",
)
choice(
    "Uno sfregamento lascia il materiale positivo",
    "Un oggetto inizialmente neutro diventa positivo per elettrizzazione per strofinio. Quale cambiamento microscopico è coerente?",
    1,
    "Ha perso elettroni",
    [
        "Ha perso protoni per semplice contatto",
        "Ha guadagnato elettroni",
        "Ogni sua molecola ha perso il nucleo",
    ],
    "Confronta il numero di cariche negative con quelle positive fissate nei nuclei.",
    "concetto",
    "Nella normale elettrizzazione si trasferiscono elettroni fra materiali.",
    "Perdere elettroni lascia un eccesso netto di carica positiva. Il sistema comprendente entrambi i materiali conserva la carica totale se elettricamente isolato.",
)
num(
    "Scegliere il valore della seconda carica",
    "Nel vuoto a distanza 0,20 m da +2,0 nC, una carica esercita una forza attrattiva di 9,0 μN. Trova la seconda carica con segno in nC. Usa k = 9,0 × 10⁹ N·m²/C².",
    3,
    -20,
    "nC",
    0.15,
    -9e-6 * 0.2**2 / (9e9 * 2e-9) * 1e9,
    "Ricava il modulo e assegna il segno usando l’attrazione.",
    "algebra",
    "La forza con la sorgente positiva è attrattiva, quindi la seconda carica deve essere negativa.",
    eq(
        r"|q_2|=\frac{Fr^2}{k|q_1|}=\frac{9\cdot10^{-6}\cdot0{,}20^2}{9\cdot10^9\cdot2\cdot10^{-9}}=2{,}0\cdot10^{-8}\ \mathrm C"
    ),
    "Questo modulo equivale a 20 nC. Il segno necessario dà q₂ = −20 nC.",
)

enter("C4", 2)
choice(
    "La prova cambia segno",
    "Sostituisci una piccola carica di prova +q con −q nello stesso punto, senza alterare le sorgenti. Quale cambiamento si osserva?",
    1,
    "La forza si inverte e il campo resta uguale",
    [
        "Si invertono sia campo sia forza",
        "Il campo si annulla",
        "La forza resta uguale e cambia solo la massa",
    ],
    "Distingui la sorgente dalla particella che sonda il campo.",
    "concetto",
    "E dipende dalla configurazione sorgente; F contiene il fattore q della prova.",
    fig(
        "C4-campo",
        "Il verso di E è fissato dalle piastre anche quando sulla prova negativa la forza punta nel verso opposto.",
    ),
    eq(r"\vec F_{-q}=(-q)\vec E=-\vec F_{+q}"),
)
num(
    "Campo da una forza misurata",
    "Una prova di +4,0 nC subisce una forza di 1,2 μN verso est. Trova il modulo del campo in N/C.",
    1,
    300,
    "N/C",
    1,
    1.2e-6 / 4e-9,
    "Dividi la forza per la carica e converti i due prefissi separatamente.",
    "unità",
    "Micro e nano differiscono di un fattore mille.",
    eq(r"E=F/q=\frac{1{,}2\cdot10^{-6}}{4{,}0\cdot10^{-9}}=300\ \mathrm{N/C}"),
    "Poiché la prova è positiva il campo è diretto verso est come la forza.",
)
word(
    "Verso locale di una linea",
    "Completa la frase. La direzione del campo elettrico in un punto in cui E è diverso da zero è quella della … alla linea di campo.",
    1,
    "tangente",
    ["retta tangente"],
    "Il campo è un vettore locale che segue la linea nel punto considerato.",
    "concetto",
    "La tangente è la retta che rappresenta l’orientamento locale della curva.",
    "La freccia della linea sceglie il verso lungo la tangente. La retta che congiunge due punti lontani della linea non descrive necessariamente il campo in ciascuno di essi.",
)
num(
    "Annullare due contributi collineari",
    "Due sorgenti +q e +4q sono distanti 30 cm. Fra di esse, a quanti cm da +q è nullo il campo?",
    3,
    10,
    "cm",
    0.05,
    30 / (1 + math.sqrt(4)),
    "Fra due sorgenti positive i campi si oppongono. Uguaglia i moduli.",
    "algebra",
    "La distanza dalla carica maggiore deve essere doppia di quella dalla più piccola.",
    eq(r"\frac{kq}{x^2}=\frac{4kq}{(30-x)^2}\quad\Longrightarrow\quad 30-x=2x"),
    eq(r"x=10\ \mathrm{cm}"),
    "A 10 cm dalla sorgente piccola e 20 cm dalla grande i due contributi hanno lo stesso modulo e verso opposto.",
)
choice(
    "Le linee possono attraversarsi?",
    "Un disegno mostra due linee di campo elettrico che si incrociano con tangenti differenti in un punto con E diverso da zero. Qual è il problema?",
    1,
    "Assegna due direzioni al campo nello stesso punto",
    [
        "Le linee devono essere sempre parallele",
        "Un campo non può variare nello spazio",
        "Le cariche sorgenti devono sempre essere due",
    ],
    "Cerca una singola freccia locale E compatibile con entrambe le tangenti.",
    "modello",
    "Il campo elettrico risultante in un punto ha una sola direzione quando è non nullo.",
    "Le diverse sorgenti possono generare vettori con direzioni diverse, ma il loro campo risultante è uno solo. Le linee del campo risultante devono seguire questo vettore.",
)
num(
    "Una traiettoria fra le armature",
    "Una particella entra tra due piastre con vx = 4 m/s e vy = 0. Il campo produce ay = 6 m/s² e ax = 0. Dopo 0,80 m orizzontali, di quanti cm si è spostata verso y positivo?",
    2,
    12,
    "cm",
    0.08,
    0.5 * 6 * (0.8 / 4) ** 2 * 100,
    "Usa il moto orizzontale per il tempo di permanenza.",
    "modello",
    "L’accelerazione è verticale, quindi il tempo si trova da x/vx.",
    eq(
        r"t=0{,}80/4=0{,}20\ \mathrm s,\qquad y=\tfrac12a_y t^2=3(0{,}20)^2=0{,}12\ \mathrm m"
    ),
    "La conversione finale dà 12 cm. La traiettoria combina moto orizzontale uniforme e moto verticale accelerato.",
)
word(
    "Linee rivolte verso il centro",
    "Una distribuzione radiale di linee elettriche punta verso un’unica carica puntiforme al centro. Indica con un aggettivo il segno della sorgente.",
    1,
    "negativa",
    ["negativo"],
    "Guarda il verso della forza sulla prova positiva.",
    "concetto",
    "La prova positiva è attratta verso la sorgente.",
    "Le linee di campo entrano in una sorgente negativa ed escono da una positiva. Il verso vale per una prova positiva per definizione del campo.",
)
num(
    "Vettori ortogonali nel punto di misura",
    "In un punto una sorgente dà 300 N/C verso est e un’altra 400 N/C verso nord. Calcola il modulo del campo risultante in N/C.",
    2,
    500,
    "N/C",
    1,
    math.hypot(300, 400),
    "Costruisci il triangolo con le componenti perpendicolari.",
    "modello",
    "Sommare direttamente i due moduli varrebbe per vettori paralleli e concordi.",
    eq(r"E=\sqrt{E_x^2+E_y^2}=\sqrt{300^2+400^2}=500\ \mathrm{N/C}"),
    "La risultante punta a nord-est ed è compresa tra il modulo maggiore, 400, e la somma dei moduli, 700 N/C.",
)
choice(
    "Una carica negativa inizialmente ferma",
    "Una particella negativa è libera in un campo uniforme verso destra, senza altre forze. Cosa succede appena viene lasciata da ferma?",
    1,
    "Accelera verso sinistra",
    [
        "Resta ferma perché la velocità iniziale è nulla",
        "Accelera verso destra",
        "Si muove subito di moto circolare",
    ],
    "La forza elettrica dipende dalla carica e dal campo.",
    "modello",
    "Una velocità iniziale nulla non annulla qE.",
    eq(r"\vec a=(q/m)\vec E"),
    "Con q negativa il vettore accelerazione è opposto al campo. Partendo da ferma, anche la velocità subito successiva punta verso sinistra.",
)
num(
    "Tempo per invertire il moto",
    "Una carica parte verso destra a 6 m/s in un campo elettrico uniforme che le impartisce accelerazione di 3 m/s² verso sinistra. Dopo quanti secondi raggiunge l’istante di inversione?",
    2,
    2,
    "s",
    0.01,
    6 / 3,
    "Scegli destra positiva e imponi velocità nulla all’inversione.",
    "algebra",
    "L’accelerazione ha segno opposto alla velocità iniziale.",
    eq(r"v_x(t)=6-3t,\qquad v_x=0\Rightarrow t=6/3=2\ \mathrm s"),
    "All’istante trovato la velocità è nulla, ma resta l’accelerazione verso sinistra. La particella riparte in quel verso.",
)

enter("C4", 3)
num(
    "Potenziale in un punto equidistante",
    "Due cariche +2,0 nC e −1,0 nC sono entrambe a 0,10 m da P. Con zero all’infinito e k = 9,0 × 10⁹ N·m²/C², calcola V(P) in volt.",
    2,
    90,
    "V",
    0.5,
    9e9 * (2e-9 - 1e-9) / 0.1,
    "Somma gli scalari con i loro segni.",
    "modello",
    "Per il potenziale compare r e il contributo della sorgente negativa si sottrae.",
    eq(r"V=\frac{k}{r}(q_1+q_2)=\frac{9\cdot10^9}{0{,}10}(2-1)10^{-9}=90\ \mathrm V"),
    "Basta conoscere le distanze e i segni. Per il campo servirebbero anche le direzioni.",
)
choice(
    "Muoversi su una equipotenziale",
    "Sposti una carica positiva lungo una superficie con potenziale costante in un campo elettrostatico. Quanto lavoro compie il campo?",
    1,
    "Zero",
    [
        "Positivo in ogni direzione",
        "Negativo in ogni direzione",
        "Dipende dal percorso anche con ΔV = 0",
    ],
    "Confronta i potenziali dei due estremi.",
    "concetto",
    "Il lavoro elettrostatico fra due punti vale −qΔV.",
    fig(
        "C4-potenziale",
        "Lungo una stessa linea tratteggiata i due estremi hanno uguale potenziale.",
    ),
    eq(r"W=-q(V_f-V_i)=0"),
    "La forza può essere non nulla e perpendicolare allo spostamento lungo la superficie.",
)
word(
    "Unità di potenziale",
    "Un joule per coulomb corrisponde a quale unità SI? Scrivine il nome.",
    1,
    "volt",
    ["V"],
    "La stessa unità compare sulla scala di un voltmetro.",
    "unità",
    "Il volt misura energia potenziale per carica.",
    eq(r"1\ \mathrm V=1\ \mathrm{J/C}"),
    "Una carica di un coulomb che attraversa una differenza di potenziale di un volt cambia energia potenziale di un joule in modulo.",
)
num(
    "Campo dalla spaziatura delle equipotenziali",
    "In un campo uniforme due piani equipotenziali distano 3,0 cm lungo il campo e differiscono di 12 V. Trova il modulo E in V/m.",
    1,
    400,
    "V/m",
    1,
    12 / 0.03,
    "Usa la distanza misurata nella direzione del campo.",
    "unità",
    "La differenza di potenziale per unità di distanza deve usare metri.",
    eq(r"E=|\Delta V|/d=12/0{,}030=400\ \mathrm{V/m}"),
    "Il campo punta dal piano a potenziale più alto verso quello a potenziale più basso.",
)
choice(
    "Potenziale nullo senza campo nullo",
    "Nel punto medio tra +q e −q, ponendo V = 0 all’infinito, quale situazione si incontra?",
    2,
    "V = 0 e campo non nullo",
    [
        "Campo e potenziale sempre entrambi nulli",
        "V diverso da zero e campo nullo",
        "Non si può definire il potenziale fra cariche",
    ],
    "Confronta somma di scalari e somma di frecce.",
    "concetto",
    "I potenziali opposti si cancellano ma i due campi puntano nello stesso verso al centro.",
    fig(
        "C4-dipolo", "I contributi vettoriali verso destra si sommano nel punto medio."
    ),
    eq(r"V=kq/r+k(-q)/r=0"),
    "Per il campo, allontanarsi dalla positiva significa dirigersi verso la negativa. Le due frecce sono concordi.",
)
num(
    "Quanta energia cinetica in elettronvolt?",
    "Un elettrone passa da un punto a 2 V a uno a 17 V per effetto del solo campo. Di quanti eV aumenta K?",
    2,
    15,
    "eV",
    0.02,
    17 - 2,
    "Per una particella con carica unitaria in modulo, 1 V di differenza corrisponde a 1 eV di energia in modulo.",
    "algebra",
    "La carica negativa guadagna energia cinetica andando verso un potenziale più alto.",
    eq(
        r"\Delta V=17-2=15\ \mathrm V,\qquad \Delta K=-q\Delta V=e\cdot15\ \mathrm V=15\ \mathrm{eV}"
    ),
    "Un elettronvolt è un’unità di energia. Il guadagno sarebbe di segno opposto per una carica positiva con lo stesso spostamento.",
)
word(
    "Scelta dello zero",
    "La scelta di V = 0 all’infinito per una carica puntiforme fissa un … per il potenziale. Completa con la parola che indica l’origine convenzionale della scala.",
    1,
    "riferimento",
    ["livello di riferimento", "potenziale di riferimento"],
    "Aggiungere la stessa costante ai potenziali lascia invariata ogni differenza.",
    "concetto",
    "Il valore assoluto dichiarato per il potenziale dipende dalla scelta dello zero.",
    "Un riferimento permette di assegnare un numero a V in ogni punto. Se V′ = V + c, la differenza V′B − V′A è nuovamente VB − VA e le previsioni fisiche non cambiano.",
)
num(
    "Velocità guadagnata fra due punti",
    "Una particella da 2,0 mg con carica +4,0 μC parte da ferma e scende di 9,0 V di potenziale. Agisce solo il campo. Calcola la velocità finale in m/s.",
    2,
    6,
    "m/s",
    0.04,
    math.sqrt(2 * 4e-6 * 9 / 2e-6),
    "Converti la massa in kg e uguaglia il guadagno cinetico alla perdita di energia potenziale.",
    "unità",
    "Un milligrammo vale 10⁻⁶ kg.",
    eq(
        r"\tfrac12 mv_f^2=-q\Delta V=4{,}0\cdot10^{-6}\cdot9{,}0=36\cdot10^{-6}\ \mathrm J"
    ),
    eq(r"v_f=\sqrt{2\cdot36\cdot10^{-6}/(2{,}0\cdot10^{-6})}=6{,}0\ \mathrm{m/s}"),
    "La perdita di potenziale accelera una carica positiva.",
)
choice(
    "Campi e curve di livello",
    "In due regioni segnate con lo stesso intervallo di potenziale fra linee adiacenti, dove è mediamente più intenso il campo?",
    2,
    "Dove le equipotenziali sono più ravvicinate nella direzione normale",
    [
        "Dove sono più lontane",
        "Dove il valore assoluto del potenziale è sempre maggiore",
        "Dove si cambia il riferimento dello zero",
    ],
    "Confronta la variazione di V per distanza percorsa normalmente.",
    "modello",
    "È il gradiente del potenziale a determinare il campo.",
    eq(r"E_\perp\simeq |\Delta V|/\Delta s"),
    "Per la medesima caduta di potenziale una distanza minore richiede un campo medio maggiore lungo la normale.",
)
num(
    "Numero di coppie in una configurazione",
    "Per calcolare l’energia di quattro cariche puntiformi distinte sommando i contributi a coppie, quanti termini distinti devi includere?",
    2,
    6,
    "coppie",
    0,
    math.comb(4, 2),
    "Collega ogni carica a quelle che la seguono nell’elenco.",
    "testo",
    "Una coppia AB e la corrispondente BA descrivono la stessa interazione.",
    "La prima carica forma tre coppie, la seconda due nuove e la terza una nuova. La quarta è già apparsa con ciascuna delle altre.",
    eq(r"N_{\rm coppie}=3+2+1=6"),
    "Ogni termine kqiqj/rij va incluso una sola volta.",
)

enter("C4", 4)
choice(
    "Bacchetta vicina e sfera isolata",
    "Una bacchetta negativa si avvicina a una sfera metallica inizialmente neutra, isolata e senza contatto. Come si presenta il lato della sfera più vicino alla bacchetta?",
    1,
    "Con eccesso locale di carica positiva",
    [
        "Con eccesso di elettroni",
        "Senza alcuna ridistribuzione",
        "Con carica totale negativa su tutta la sfera",
    ],
    "Considera la repulsione sugli elettroni mobili.",
    "concetto",
    "Gli elettroni sono spinti verso il lato lontano. Sul lato vicino resta un difetto elettronico.",
    "Le cariche si separano per induzione. Il lato vicino diventa positivo e quello lontano negativo. La sfera isolata resta globalmente neutra.",
)
word(
    "Risposta locale dell’isolante",
    "Quale termine indica la formazione o l’orientamento di dipoli elettrici in un dielettrico immerso in un campo?",
    1,
    "polarizzazione",
    ["polarizzazione elettrica"],
    "Le cariche possono spostarsi localmente, pur restando legate.",
    "concetto",
    "La risposta del dielettrico consiste in una separazione microscopica delle cariche.",
    fig(
        "C4-materiali",
        "Nel dielettrico i piccoli dipoli rispondono al campo pur mantenendo il materiale neutro.",
    ),
    "La polarizzazione genera un contributo al campo interno. Può derivare da deformazioni delle distribuzioni di carica o da orientamento parziale di dipoli già presenti.",
)
num(
    "Il bilancio di una sfera neutra",
    "Su una parte della superficie di una sfera conduttrice neutra isolata si raccolgono −6,0 nC per induzione. Quanto vale in nC la carica sul resto della superficie, in assenza di cariche nella cavità o nel volume?",
    1,
    6,
    "nC",
    0.02,
    0 - (-6),
    "La sfera non ha scambiato carica con l’esterno.",
    "algebra",
    "Le regioni superficiali devono ricostruire la carica totale iniziale.",
    eq(
        r"Q_{\rm tot}=q_1+q_2=0\quad\Longrightarrow\quad q_2=0-(-6{,}0)=+6{,}0\ \mathrm{nC}"
    ),
    "La separazione superficiale produce un campo pur senza trasferire carica netta alla sfera.",
)
choice(
    "Togliere prima la bacchetta",
    "Una sfera metallica è collegata a terra vicino a una bacchetta positiva. Si allontana prima la bacchetta mentre il filo di terra è ancora collegato, poi si stacca il filo. In assenza di altre sorgenti che cosa si ottiene idealmente?",
    2,
    "Sfera finale neutra",
    [
        "Sfera con eccesso negativo necessariamente intrappolato",
        "Sfera con carica doppia della bacchetta",
        "Terra isolante",
    ],
    "Individua il momento in cui si chiude lo scambio di elettroni con la terra.",
    "testo",
    "La terra resta collegata mentre scompare il campo esterno della bacchetta.",
    "Con il collegamento ancora attivo, gli elettroni possono ridistribuirsi fra sfera e terra fino al nuovo equilibrio in assenza della bacchetta. Staccando solo alla fine si isola una sfera idealmente neutra.",
)
num(
    "Potenziale fra due punti del metallo",
    "Due punti si trovano entrambi nello stesso conduttore collegato in equilibrio elettrostatico. Se uno è a +42 V rispetto alla terra, quale differenza VB − VA si misura fra loro in volt?",
    1,
    0,
    "V",
    0,
    42 - 42,
    "Nel materiale conduttore all’equilibrio elettrostatico il campo interno è nullo.",
    "concetto",
    "Il valore di potenziale rispetto alla terra può essere non nullo anche se è uniforme nel conduttore.",
    eq(r"V_B=V_A=42\ \mathrm V,\qquad V_B-V_A=0\ \mathrm V"),
    "Uno zero del campo implica costanza spaziale del potenziale all’interno del conduttore.",
)
word(
    "Connettere un conduttore alla Terra",
    "Qual è il termine pratico per un collegamento conduttore a un grande serbatoio di carica che fissa il potenziale di riferimento? Completa «messa a …».",
    1,
    "terra",
    [],
    "Il collegamento può fornire o assorbire elettroni.",
    "testo",
    "La Terra funge da grande serbatoio a potenziale praticamente fissato nelle condizioni usuali.",
    "Una messa a terra permette alle cariche mobili di circolare finché il conduttore collegato raggiunge il potenziale della terra. Il collegamento cambia i vincoli rispetto a un oggetto isolato.",
)
choice(
    "Direzione del campo alla superficie",
    "Sulla superficie di un conduttore in equilibrio elettrostatico, quale componente del campo appena esterno deve essere nulla?",
    2,
    "Tangenziale",
    [
        "Normale in ogni situazione",
        "Radiale per qualunque geometria e sorgente",
        "Tutte le componenti anche fuori dalla superficie",
    ],
    "Una componente lungo la superficie sposterebbe le cariche mobili.",
    "modello",
    "In equilibrio il potenziale del materiale conduttore è uniforme.",
    "Una componente tangenziale produrrebbe forza tangenziale sulle cariche libere e continuerebbe la ridistribuzione. Un campo normale può invece esistere subito fuori dalla superficie.",
)
choice(
    "Un filo con corrente stazionaria",
    "Un filo resistivo porta corrente continua e si misura una caduta di tensione. Quale uso della regola «metallo equipotenziale» sarebbe errato?",
    2,
    "Applicarla al filo resistivo in conduzione come se fosse in equilibrio elettrostatico",
    [
        "Applicarla a un conduttore isolato in equilibrio elettrostatico",
        "Usarla nei fili ideali di resistenza nulla del modello circuitale",
        "Distinguere un resistore da un collegamento ideale",
    ],
    "Chiediti se le cariche mobili sono davvero in equilibrio elettrostatico.",
    "modello",
    "Un conduttore resistivo in conduzione può avere un campo elettrico interno.",
    "Una corrente stazionaria è costante nel tempo ma comporta moto di carica e dissipazione nel filo resistivo. Il campo interno può guidare tale moto. L’ipotesi di equilibrio elettrostatico non vale per quel caso.",
)
num(
    "Effetto di un mezzo sul campo a carica fissa",
    "Tra due piastre isolate cariche il campo iniziale è 12 kV/m. Un dielettrico lineare omogeneo riempie tutto lo spazio con εr = 3. Trascurando i bordi, quale campo si ottiene in kV/m?",
    2,
    4,
    "kV/m",
    0.02,
    12 / 3,
    "Le cariche libere restano fisse e il campo delle cariche legate riduce il campo totale.",
    "modello",
    "Con carica libera fissata il campo nel mezzo si divide per εr.",
    eq(
        r"E_f=\sigma_{\rm libera}/(\varepsilon_0\varepsilon_r)=E_i/\varepsilon_r=12/3=4\ \mathrm{kV/m}"
    ),
    "Il risultato richiede piastre isolate. Con un generatore collegato che mantiene V costante il vincolo fisico cambia.",
)
word(
    "Materiale con cariche prevalentemente legate",
    "Come si chiama, nel linguaggio dei condensatori, un materiale isolante che risponde al campo principalmente per polarizzazione?",
    1,
    "dielettrico",
    ["dielettrico isolante"],
    "La sua proprietà elettrica si esprime spesso mediante εr.",
    "concetto",
    "Il materiale può polarizzarsi senza offrire un percorso conduttivo ideale tra le piastre.",
    "Un dielettrico contiene cariche legate che rispondono al campo. Questo modifica il campo e la capacità di una coppia di armature, nelle ipotesi del modello lineare.",
)

enter("C4", 5)
num(
    "Carica dal tracciato di corrente",
    "Una corrente vale 3 mA per 4 s e poi 1 mA nello stesso verso per 6 s. Quanti mC attraversano la sezione complessivamente?",
    1,
    18,
    "mC",
    0.03,
    3 * 4 + 1 * 6,
    "Somma le aree dei due rettangoli sotto la curva I(t).",
    "calcolo",
    "Ogni tratto deve essere moltiplicato per la propria durata.",
    eq(r"\Delta q=I_1t_1+I_2t_2=3\cdot4+1\cdot6=18\ \mathrm{mC}"),
    "Il prodotto mA·s è direttamente mC. I due contributi sono concordi e si sommano.",
)
choice(
    "Moto degli elettroni in un filo",
    "La corrente convenzionale in un tratto metallico è diretta verso destra. Qual è il verso della deriva media degli elettroni?",
    1,
    "Verso sinistra",
    ["Verso destra", "Perpendicolare al filo", "Nullo se la corrente è continua"],
    "La corrente convenzionale adotta il verso di trasporto positivo.",
    "concetto",
    "Un portatore negativo in moto verso sinistra produce corrente convenzionale verso destra.",
    "Il contributo al trasporto di carica contiene il segno del portatore. La deriva elettronica è opposta alla corrente convenzionale anche se il moto termico individuale si svolge in numerose direzioni.",
)
word(
    "Energia per carica al generatore",
    "Quale grandezza viene mantenuta fissa da un generatore ideale di tensione ai suoi morsetti? Rispondi con il nome della differenza fra i due punti.",
    1,
    "differenza di potenziale",
    ["tensione", "d.d.p.", "ddp"],
    "È la grandezza espressa in volt.",
    "concetto",
    "La corrente del generatore dipende dal carico esterno.",
    "Il generatore ideale impone la sua differenza di potenziale. Il circuito esterno, insieme a tale vincolo, determina la corrente nei morsetti.",
)
num(
    "Durata di un trasferimento",
    "Un segnale mantiene una corrente di 0,40 mA e trasferisce 8,0 μC in un verso. Per quanti millisecondi dura?",
    2,
    20,
    "ms",
    0.06,
    8e-6 / 0.4e-3 * 1e3,
    "Trasforma μC in C e mA in A prima di dividere.",
    "unità",
    "Il rapporto fra coulomb e ampere fornisce secondi.",
    eq(
        r"t=\frac{\Delta q}{I}=\frac{8{,}0\cdot10^{-6}}{0{,}40\cdot10^{-3}}=0{,}020\ \mathrm s=20\ \mathrm{ms}"
    ),
    "Quaranta microcoulomb al decimo di secondo corrispondono allo stesso ordine di grandezza.",
)
choice(
    "Confrontare due curve ohmiche",
    "In un grafico I in ordinata e V in ascissa, due resistori danno rette per l’origine. Quale ha resistenza più alta?",
    2,
    "Quello con retta meno inclinata",
    [
        "Quello con retta più inclinata",
        "Quello che passa per l’origine",
        "Sono uguali perché il grafico è lineare",
    ],
    "Leggi le etichette degli assi prima di interpretare la pendenza.",
    "modello",
    "Nei grafici I(V) la pendenza è 1/R.",
    eq(r"I=(1/R)V"),
    "Per ogni volt aggiunto, una pendenza minore significa un incremento minore di corrente. Occorre quindi una resistenza maggiore.",
)
num(
    "Filo stirato a volume costante",
    "Un filo uniforme, con resistività invariata, viene stirato fino a lunghezza doppia conservando il volume. Quanto vale Rf/Ri?",
    2,
    4,
    "1",
    0.01,
    2 / (1 / 2),
    "L’allungamento modifica anche l’area trasversale.",
    "modello",
    "Con Aℓ costante un filo lungo il doppio ha sezione dimezzata.",
    eq(
        r"\frac{A_f}{A_i}=\frac{\ell_i}{\ell_f}=\frac12,\quad\frac{R_f}{R_i}=\frac{\ell_f}{\ell_i}\frac{A_i}{A_f}=2\cdot2=4"
    ),
    "Il doppio cammino e la metà dell’area di sezione aumentano entrambi la resistenza.",
)
word(
    "Resistenza di un dato materiale",
    "Quale grandezza indicata usualmente con ρ ha unità Ω·m nella relazione per un filo omogeneo?",
    1,
    "resistività",
    ["resistivita", "resistività elettrica"],
    "La geometria viene trattata separatamente tramite il rapporto ℓ/A.",
    "unità",
    "La grandezza descrive il materiale alle condizioni considerate.",
    eq(r"R=\rho\ell/A\quad\Longrightarrow\quad [\rho]=\Omega\,\mathrm{m}"),
    "La resistività può dipendere dalla temperatura. La resistenza di uno specifico filo dipende anche dalla lunghezza e dalla sezione.",
)
num(
    "Lama metallica a sezione rettangolare",
    "Una pista lunga 0,20 m ha larghezza 2,0 mm e spessore 0,10 mm. Con ρ = 2,0 × 10⁻⁸ Ω·m trova R in Ω.",
    2,
    0.020,
    "Ω",
    0.0002,
    2e-8 * 0.2 / (0.002 * 0.0001),
    "La sezione che attraversa la corrente è larghezza per spessore.",
    "unità",
    "Converti entrambe le dimensioni trasverse in metri.",
    eq(r"A=(2{,}0\cdot10^{-3})(1{,}0\cdot10^{-4})=2{,}0\cdot10^{-7}\ \mathrm{m^2}"),
    eq(r"R=\frac{2{,}0\cdot10^{-8}\cdot0{,}20}{2{,}0\cdot10^{-7}}=0{,}020\ \Omega"),
    "Usare la superficie superiore della pista darebbe l’area sbagliata: il trasporto avviene lungo la sua lunghezza.",
)
choice(
    "Analizzare un componente non lineare",
    "Per lo stesso componente si misurano 1 V con 1 mA e 3 V con 2 mA. Quale conclusione segue dai dati?",
    2,
    "Il rapporto V/I cambia fra le due misure",
    [
        "Il componente ha una singola R ohmica di 1 kΩ in entrambe",
        "La corrente è zero alla seconda misura",
        "I valori dimostrano che 1 V equivale a 1 A",
    ],
    "Confronta V/I utilizzando la stessa unità di corrente.",
    "modello",
    "Le due resistenze di rapporto sono 1 kΩ e 1,5 kΩ.",
    eq(r"R_1=1/0{,}001=1000\ \Omega,\qquad R_2=3/0{,}002=1500\ \Omega"),
    "Una resistenza ohmica costante richiederebbe valori uguali. Dati ulteriori servirebbero a distinguere non linearità intrinseca e mutamento delle condizioni, come il riscaldamento.",
)
num(
    "Corrente media con un’inversione",
    "In un intervallo di 5 s passano 12 C verso destra e 2 C verso sinistra. Calcola la corrente media in A assumendo destra positiva.",
    2,
    2,
    "A",
    0.01,
    (12 - 2) / 5,
    "Valuta il trasporto netto algebrico prima di dividere per il tempo.",
    "testo",
    "I due contributi si riferiscono a versi opposti.",
    eq(
        r"\Delta q_{\rm netta}=12-2=10\ \mathrm C,\quad I_{\rm media}=10/5=+2\ \mathrm A"
    ),
    "Il segno indica un trasporto netto convenzionale verso destra.",
)

enter("C4", 6)
num(
    "Un parallelo dentro una serie",
    "Due resistori da 30 Ω e 60 Ω sono in parallelo. L’insieme è in serie con 10 Ω ai capi di 9 V. Trova la corrente totale in A.",
    2,
    0.30,
    "A",
    0.002,
    9 / (10 + 1 / (1 / 30 + 1 / 60)),
    "Riduci per primo il sottogruppo che condivide entrambi i nodi.",
    "modello",
    "I 10 Ω si sommano al parallelo già ridotto.",
    eq(
        r"R_p=\frac{30\cdot60}{30+60}=20\ \Omega,\quad R_{\rm eq}=10+20=30\ \Omega,\quad I=9/30=0{,}30\ \mathrm A"
    ),
    "Il parallelo ha valore inferiore a 30 Ω. L’aggiunta del tratto in serie aumenta la resistenza totale.",
    lab=True,
)
choice(
    "Più resistenza, più calore?",
    "Due resistori positivi di valori diversi sono in parallelo su un generatore ideale. Quale dissipa maggiore potenza?",
    1,
    "Il resistore di valore minore",
    [
        "Il resistore di valore maggiore",
        "Entrambi dissipano sempre la stessa potenza",
        "Quello con corrente minore",
    ],
    "Individua la grandezza uguale nei due rami.",
    "modello",
    "A tensione comune si usa P = V²/R.",
    eq(r"P_1/P_2=R_2/R_1"),
    "Il ramo meno resistivo porta più corrente alla stessa tensione, e riceve più energia ogni secondo.",
    lab=True,
)
word(
    "Il punto in comune",
    "Nel linguaggio dei circuiti ideali, come si chiama l’insieme di estremi collegati fra loro da filo ideale e aventi lo stesso potenziale? Usa il singolare.",
    1,
    "nodo",
    ["nodo elettrico"],
    "La posizione grafica sulla pagina non conta se si segue lo stesso filo.",
    "concetto",
    "I collegamenti ideali senza componenti interposti appartengono al medesimo nodo.",
    "Il nodo si identifica seguendo la continuità del filo. Due componenti sono in parallelo quando condividono entrambi i nodi di collegamento.",
    lab=True,
)
num(
    "Energia di un resistore acceso",
    "Un resistore da 100 Ω porta 20 mA costanti per 30 s. Calcola l’energia dissipata in J.",
    2,
    1.20,
    "J",
    0.012,
    0.020**2 * 100 * 30,
    "Ottieni prima la potenza con I in ampere.",
    "unità",
    "La corrente va elevata al quadrato prima di moltiplicare per R.",
    eq(
        r"P=I^2R=(0{,}020)^2\cdot100=0{,}040\ \mathrm W,\quad E=Pt=0{,}040\cdot30=1{,}20\ \mathrm J"
    ),
    "L’energia cresce con il tempo durante il quale il resistore dissipa la potenza.",
)
num(
    "Ricavare il secondo ramo",
    "Un resistore da 12 Ω è in parallelo a un resistore incognito. L’equivalente misurata è 4 Ω. Calcola la resistenza incognita in Ω.",
    2,
    6,
    "Ω",
    0.03,
    1 / (1 / 4 - 1 / 12),
    "Isola il reciproco della resistenza mancante.",
    "algebra",
    "Sottrai le conduttanze, poi inverti il risultato.",
    eq(
        r"\frac1{R_x}=\frac14-\frac1{12}=\frac{3-1}{12}=\frac16\ \Omega^{-1}\quad\Longrightarrow\quad R_x=6\ \Omega"
    ),
    "Il controllo 12 × 6/(12 + 6) restituisce 4 Ω.",
    lab=True,
)
choice(
    "Aprire un ramo su generatore ideale",
    "Due resistori sono in parallelo direttamente ai morsetti di una sorgente ideale di tensione. Si apre un ramo. Nel ramo che resta collegato cosa accade alla corrente?",
    2,
    "Resta uguale",
    [
        "Raddoppia necessariamente",
        "Si annulla",
        "Diventa uguale alla vecchia corrente totale",
    ],
    "Verifica che la differenza di potenziale sul ramo superstite sia ancora la stessa.",
    "modello",
    "Il generatore ideale fissa la tensione indipendentemente dalla corrente totale.",
    "Il resistore rimasto vede ancora V e la propria resistenza resta uguale. La sua corrente V/R si conserva, mentre la corrente totale diminuisce perché un ramo è stato rimosso.",
    lab=True,
)
word(
    "Nome della dissipazione resistiva",
    "Come si chiama l’effetto per cui un resistore trasforma l’energia elettrica ricevuta in energia interna? Completa «effetto …».",
    1,
    "Joule",
    ["Joule termico"],
    "La potenza vale I²R in un resistore ohmico.",
    "concetto",
    "Questo nome collega il passaggio di corrente alla dissipazione di energia.",
    "Per effetto Joule il campo trasferisce energia alle cariche e l’energia alimenta l’agitazione microscopica del materiale. In regime termico stazionario può poi fluire all’ambiente.",
)
num(
    "Partitore con un vincolo",
    "Un generatore ideale da 12 V alimenta due resistori in serie. Sul primo da 80 Ω si vogliono 4 V. Trova R₂ in Ω.",
    2,
    160,
    "Ω",
    1,
    (12 - 4) / (4 / 80),
    "Dalla caduta su R₁ ricava la corrente condivisa.",
    "algebra",
    "La seconda caduta vale la tensione totale meno la prima.",
    eq(
        r"I=4/80=0{,}050\ \mathrm A,\quad V_2=12-4=8\ \mathrm V,\quad R_2=8/0{,}050=160\ \Omega"
    ),
    "Il valore doppio della resistenza comporta caduta doppia alla stessa corrente.",
    lab=True,
)
choice(
    "Due resistenze disegnate una accanto all’altra",
    "Uno schema disegna due resistori vicini e alla stessa altezza. Quale informazione serve per stabilire con certezza se sono in parallelo?",
    1,
    "Se entrambe le coppie di estremi sono collegate agli stessi due nodi",
    [
        "Se sono disegnati con rettangoli identici",
        "Se hanno valori uguali",
        "Se la pagina è orientata orizzontalmente",
    ],
    "Segui i collegamenti prima di leggere i valori.",
    "testo",
    "La topologia si ricava da fili e nodi.",
    fig(
        "C4-reti",
        "Lo schema a destra può essere ridisegnato mantenendo entrambe le connessioni ai nodi A e B.",
    ),
    "Il parallelismo è una proprietà del collegamento elettrico. Lo stesso schema può essere disegnato con un componente anche molto distante dall’altro.",
    lab=True,
)
num(
    "Dimezzare la tensione a resistenza fissa",
    "Un resistore ohmico dissipa 8,0 W. Il generatore riduce la tensione ai suoi capi alla metà, mantenendo R invariata. Trova la nuova potenza in W.",
    1,
    2,
    "W",
    0.01,
    8 * (0.5**2),
    "A resistenza fissa la potenza dipende dal quadrato della tensione.",
    "algebra",
    "Il fattore di tensione 1/2 diventa 1/4 per la potenza.",
    eq(r"P_f/P_i=(V_f/V_i)^2=(1/2)^2=1/4,\quad P_f=8{,}0/4=2{,}0\ \mathrm W"),
    "Scendono sia il valore della tensione sia quello della corrente. La potenza, loro prodotto, si riduce quattro volte.",
    lab=True,
)

enter("C4", 7)
num(
    "Capacità da due letture",
    "Aumentando la tensione di un condensatore lineare da 2 a 5 V, il modulo della carica su un’armatura aumenta di 18 μC. Trova C in μF.",
    1,
    6,
    "μF",
    0.025,
    18 / (5 - 2),
    "Per un condensatore lineare ΔQ = CΔV.",
    "algebra",
    "Al denominatore compare l’incremento di tensione.",
    eq(
        r"C=\frac{\Delta Q}{\Delta V}=\frac{18\ \mu\mathrm C}{5-2\ \mathrm V}=6\ \mu\mathrm F"
    ),
    "Si può usare la pendenza della retta Q(V) senza conoscere la carica iniziale assoluta.",
)
choice(
    "Allontanare le piastre isolate",
    "Un condensatore piano scollegato dal generatore conserva la propria carica. Le armature vengono allontanate, senza cambiare area o dielettrico e trascurando i bordi. Che cosa succede alla tensione?",
    2,
    "Aumenta",
    [
        "Diminuisce",
        "Resta sempre uguale alla vecchia tensione del generatore",
        "Si annulla perché manca il generatore",
    ],
    "Ricava prima l’effetto della distanza sulla capacità.",
    "modello",
    "Aumentare d riduce C, e a Q fissata V = Q/C cresce.",
    eq(r"C=\varepsilon A/d,\qquad |V|=Qd/(\varepsilon A)"),
    "Il campo ideale fra piastre a carica fissa conserva il modulo, ma ora viene attraversato per una distanza maggiore.",
)
word(
    "Nome dell’unità di capacità",
    "Come si chiama l’unità SI corrispondente a un coulomb per volt?",
    1,
    "farad",
    ["F"],
    "L’unità si legge nella formula C = Q/|ΔV|.",
    "unità",
    "Il farad è un’unità di capacità e il coulomb è un’unità di carica.",
    eq(r"1\ \mathrm F=1\ \mathrm{C/V}"),
    "Una capacità di un farad richiede un coulomb su ciascuna armatura, in modulo, per ottenere una differenza di un volt.",
)
num(
    "Dimensionare l’area delle piastre",
    "Un condensatore piano nel vuoto ha distanza 1,0 mm e capacità 88,5 pF. Usa ε₀ = 8,85 × 10⁻¹² F/m e trascura i bordi. Trova l’area affacciata in cm².",
    2,
    100,
    "cm²",
    0.5,
    88.5e-12 * 1e-3 / 8.85e-12 * 1e4,
    "Isola A in C = ε₀A/d e converti i metri quadrati.",
    "unità",
    "1 m² corrisponde a 10 000 cm².",
    eq(
        r"A=Cd/\varepsilon_0=(88{,}5\cdot10^{-12})(10^{-3})/(8{,}85\cdot10^{-12})=0{,}010\ \mathrm{m^2}"
    ),
    "La conversione dà 100 cm². Piastre quadrate di lato 10 cm hanno dimensione laterale molto maggiore della distanza di 1 mm.",
)
choice(
    "Perché compare un mezzo?",
    "Quale grafico consente di ricavare l’energia del condensatore ideale inizialmente scarico come area di un triangolo?",
    2,
    "Tensione ai capi in funzione della carica accumulata",
    [
        "Temperatura in funzione del tempo",
        "Resistenza in funzione della distanza fra piastre",
        "Campo magnetico in funzione del tempo",
    ],
    "Il lavoro per aggiungere una piccola carica dq vale V dq.",
    "concetto",
    "La tensione durante il caricamento cresce da zero al valore finale.",
    eq(r"U=\int_0^Q V(q)\,dq=\int_0^Q q/C\,dq=Q^2/(2C)"),
    "La tensione media durante questa sommatoria è metà di quella finale. Il fattore un mezzo esprime l’area triangolare.",
)
num(
    "Una variazione di energia per tensione",
    "Un condensatore da 5,0 μF passa da 2,0 a 4,0 V. Quanto aumenta l’energia in μJ?",
    2,
    30,
    "μJ",
    0.1,
    0.5 * 5 * (4**2 - 2**2),
    "Calcola la differenza tra i quadrati delle due tensioni.",
    "algebra",
    "La variazione di V² è Vf² − Vi² e non (Vf − Vi)².",
    eq(r"\Delta U=\tfrac12C(V_f^2-V_i^2)=\tfrac12\cdot5(16-4)=30\ \mu\mathrm J"),
    "Il valore finale è 40 μJ e quello iniziale 10 μJ. La sottrazione conferma l’aumento.",
)
word(
    "La grandezza fissa con batteria collegata",
    "Inseriamo un dielettrico tra le piastre di un condensatore mantenuto collegato a un generatore ideale. Quale grandezza elettrica resta fissata ai capi?",
    1,
    "tensione",
    ["differenza di potenziale", "voltaggio"],
    "Il generatore impone una condizione ai suoi morsetti.",
    "modello",
    "Il generatore può fornire carica mentre mantiene V costante.",
    "La tensione resta quella imposta dal generatore. Se la capacità aumenta per il dielettrico, cresce anche la carica Q = CV. Il caso isolato avrebbe un vincolo diverso.",
)
num(
    "Confrontare due mezzi a tensione mantenuta",
    "Un condensatore collegato a 8 V immagazzina 16 μJ. Un dielettrico che riempie tutto lo spazio raddoppia la capacità. Qual è l’energia finale in μJ?",
    2,
    32,
    "μJ",
    0.08,
    16 * 2,
    "Scegli la forma per U con V costante.",
    "modello",
    "Con il generatore collegato l’energia del campo cresce proporzionalmente a C.",
    eq(r"U_f/U_i=(C_f/C_i)(V_f/V_i)^2=2\cdot1=2"),
    eq(r"U_f=2\cdot16=32\ \mu\mathrm J"),
    "Il generatore partecipa al bilancio fornendo carica. Conservare la carica delle piastre sarebbe incompatibile con questo collegamento.",
)
choice(
    "Una piastra conta due volte?",
    "Un condensatore porta +7 μC su una piastra e −7 μC sull’altra. Quale valore di Q usi per il modulo in C = Q/|ΔV|?",
    1,
    "7 μC",
    ["14 μC", "0 μC", "−14 μC"],
    "Le due armature conservano cariche opposte.",
    "testo",
    "La definizione utilizza il modulo della carica su una sola armatura.",
    "La carica totale delle due armature è zero e la somma dei moduli è 14 μC. La quantità separata dal circuito da una piastra all’altra vale 7 μC, ed è questa che entra nella capacità.",
)
num(
    "Ricavare la tensione dalla riserva energetica",
    "Un condensatore da 8,0 μF immagazzina 100 μJ. Trova il modulo della differenza di potenziale in V.",
    2,
    5,
    "V",
    0.02,
    math.sqrt(2 * 100 / 8),
    "Isola V² e poi prendi la radice positiva.",
    "algebra",
    "L’energia riguarda il modulo della tensione e non determina la polarità delle armature.",
    eq(r"V^2=2U/C=2\cdot100/8=25\ \mathrm{V^2},\qquad |V|=5{,}0\ \mathrm V"),
    "Microjoule e microfarad prestano lo stesso prefisso al rapporto e si semplificano.",
)

enter("C4", 8)
num(
    "Tre condensatori sullo stesso nodo",
    "Tre condensatori distinti da 2, 3 e 5 μF sono in parallelo su 4 V. Trova la carica totale fornita al nodo positivo in μC.",
    1,
    40,
    "μC",
    0.1,
    (2 + 3 + 5) * 4,
    "In parallelo tutte le capacità vedono la stessa tensione.",
    "modello",
    "Somma le cariche sulle armature appartenenti al medesimo nodo.",
    eq(r"Q_{\rm nodo}=(C_1+C_2+C_3)V=(2+3+5)\cdot4=40\ \mu\mathrm C"),
    "Le tre quote 8, 12 e 20 μC ricostruiscono il valore totale.",
)
choice(
    "Quale condensatore rischia la tensione più alta?",
    "Due condensatori di diversa capacità sono in serie con nodo centrale isolato inizialmente neutro. Quale sostiene la maggiore tensione in modulo dopo la carica?",
    1,
    "Quello di capacità minore",
    [
        "Quello di capacità maggiore",
        "Entrambi sempre la stessa",
        "Quello collegato graficamente più in basso",
    ],
    "Le cariche hanno lo stesso modulo nella serie descritta.",
    "modello",
    "A uguale Q la tensione varia come 1/C.",
    eq(r"|V_i|=Q/C_i"),
    "Lo stesso modulo di carica su una capacità più piccola produce una differenza di potenziale più grande.",
)
word(
    "Il vincolo fra le piastre interne",
    "All’inizio il nodo isolato fra due condensatori in serie è neutro. Quale grandezza algebrica totale di quel nodo si conserva durante la carica del circuito? Rispondi con il nome.",
    1,
    "carica",
    ["carica elettrica", "carica elettrica totale"],
    "Le armature sono separate da isolanti.",
    "concetto",
    "Nessuna carica libera entra nel nodo intermedio attraverso i dielettrici ideali.",
    "La somma algebrica delle cariche sulle due piastre del nodo resta zero. Per questo le cariche sulle due facce interne risultano uguali e opposte e i moduli sulle capacità di serie coincidono.",
)
num(
    "Ricavare una capacità in serie",
    "Un condensatore da 9 μF in serie con uno ignoto dà capacità equivalente 3 μF. Trova la capacità ignota in μF.",
    2,
    4.5,
    "μF",
    0.02,
    1 / (1 / 3 - 1 / 9),
    "Sottrai i reciproci prima di invertire.",
    "algebra",
    "Per la serie di condensatori si sommano i reciproci.",
    eq(
        r"1/C_x=1/3-1/9=2/9\ \mu\mathrm F^{-1}\quad\Longrightarrow\quad C_x=9/2=4{,}5\ \mu\mathrm F"
    ),
    "Il valore equivalente 3 μF è inferiore sia a 9 sia a 4,5 μF.",
)
choice(
    "Collegare armature di segno opposto",
    "Due condensatori identici da C, inizialmente caricati entrambi a V, sono scollegati dalle sorgenti. Si connette la piastra positiva di ciascuno a quella negativa dell’altro. Dopo il transitorio reale qual è il modulo della tensione comune?",
    2,
    "Zero",
    ["2V", "V", "V/2"],
    "Somma algebricamente le cariche appartenenti a ogni nuovo nodo.",
    "modello",
    "In ciascun nodo le cariche iniziali +CV e −CV si cancellano.",
    "La carica netta di ciascuno dei due nodi isolati è zero. In parallelo Ctot > 0 e la tensione finale deve quindi essere zero. L’energia iniziale dei campi viene ceduta nel transitorio reale.",
)
num(
    "Ridurre una rete di capacità",
    "Due condensatori da 3 μF e 6 μF sono in parallelo. Il loro insieme è in serie con 9 μF. Trova Ceq in μF.",
    2,
    4.5,
    "μF",
    0.02,
    1 / (1 / (3 + 6) + 1 / 9),
    "Ricava l’equivalente del parallelo prima della serie.",
    "modello",
    "Il blocco parallelo da 9 μF forma una serie con un secondo blocco di uguale valore.",
    eq(
        r"C_p=3+6=9\ \mu\mathrm F,\quad C_{\rm eq}=\frac{9\cdot9}{9+9}=4{,}5\ \mu\mathrm F"
    ),
    "La serie di due condensatori uguali ha metà della capacità di uno.",
)
word(
    "Giunzioni a tensione comune",
    "Qual è il nome del collegamento in cui due condensatori hanno gli stessi due nodi e la medesima tensione?",
    1,
    "parallelo",
    ["in parallelo", "collegamento in parallelo"],
    "Controlla sia l’armatura di ingresso sia quella di ritorno.",
    "testo",
    "Un singolo nodo comune non basta per la stessa differenza di potenziale.",
    fig(
        "C4-reti-c",
        "Nel circuito di destra entrambe le capacità sono connesse fra i nodi A e B.",
    ),
    "Nel parallelo le differenze di potenziale coincidono. Le cariche si distribuiscono in proporzione alle capacità se la tensione è assegnata.",
)
num(
    "Distribuzione iniziale asimmetrica",
    "Un condensatore da 2 μF a 8 V e uno da 6 μF a 4 V sono scollegati dalle sorgenti e connessi in parallelo con le armature positive insieme. Trova la tensione finale in V.",
    2,
    5,
    "V",
    0.02,
    (2 * 8 + 6 * 4) / (2 + 6),
    "La media dei potenziali va pesata con le capacità.",
    "algebra",
    "Somma prima le cariche iniziali del nodo positivo.",
    eq(
        r"Q_{\rm nodo}=2\cdot8+6\cdot4=40\ \mu\mathrm C,\qquad V_f=40/(2+6)=5\ \mathrm V"
    ),
    "La media semplice sarebbe 6 V. La maggior capacità inizialmente a 4 V sposta il risultato verso 4 V.",
)
choice(
    "Energia dopo ridistribuzione",
    "Un condensatore carico viene collegato in parallelo a uno identico scarico, senza batterie. La tensione finale si dimezza. Come cambia l’energia totale immagazzinata rispetto a prima?",
    2,
    "Si dimezza",
    ["Resta uguale", "Raddoppia", "Si annulla sempre"],
    "La capacità equivalente finale è 2C e la tensione è V/2.",
    "modello",
    "La conservazione della carica dei nodi non impone la conservazione dell’energia del solo campo.",
    eq(r"\frac{U_f}{U_i}=\frac{\tfrac12(2C)(V/2)^2}{\tfrac12 CV^2}=\tfrac12"),
    "Una parte dell’energia iniziale viene trasferita fuori dal campo statico dei condensatori nel transitorio, per esempio ai collegamenti reali.",
)
num(
    "Confronto fra due riconfigurazioni",
    "Due condensatori da 4 μF e 12 μF possono essere collegati tra gli stessi morsetti in parallelo o in serie. Calcola il rapporto Cp/Cs.",
    2,
    5.33333,
    "1",
    0.025,
    (4 + 12) / (4 * 12 / (4 + 12)),
    "Trova i due equivalenti evitando di scambiarli.",
    "algebra",
    "La capacità in parallelo deve superare ciascuna capacità, quella in serie deve essere minore.",
    eq(r"C_p=4+12=16\ \mu\mathrm F,\qquad C_s=4\cdot12/(4+12)=3\ \mu\mathrm F"),
    eq(r"C_p/C_s=16/3\simeq5{,}33"),
    "Il rapporto superiore a uno è coerente con il confronto qualitativo delle configurazioni.",
)

enter("C4", 9)
choice(
    "La bussola al fianco del filo",
    "In prossimità di un lungo filo rettilineo la corrente viene invertita. Che cosa succede al contributo magnetico prodotto dal filo in un punto fisso?",
    1,
    "Inverte il verso",
    [
        "Resta nello stesso verso perché il filo non si muove",
        "Si trasforma in campo elettrico radiale",
        "Scompare per qualunque intensità",
    ],
    "Applica la regola della mano destra prima e dopo l’inversione.",
    "concetto",
    "Una corrente con verso opposto dà linee circolari percorse nel verso opposto.",
    fig(
        "C4-filo-b",
        "Con corrente uscente il campo è antiorario. Con corrente entrante si orienta in senso orario.",
    ),
    "Il campo misurato dalla bussola può includere anche il campo terrestre. L’inversione qui riguarda il contributo del filo.",
)
num(
    "Carica misurata tramite deviazione",
    "Una particella passa perpendicolarmente a B = 0,50 T alla velocità 400 m/s e subisce forza magnetica di 2,0 μN. Trova il modulo della carica in nC.",
    2,
    10,
    "nC",
    0.05,
    2e-6 / (400 * 0.5) * 1e9,
    "Con angolo retto il seno vale uno.",
    "unità",
    "Il rapporto F/(vB) fornisce coulomb e va convertito in nC.",
    eq(
        r"|q|=F/(vB)=2{,}0\cdot10^{-6}/(400\cdot0{,}50)=1{,}0\cdot10^{-8}\ \mathrm C=10\ \mathrm{nC}"
    ),
    "La misura del modulo non distingue i due segni di carica. Per il segno serve la direzione della deviazione.",
)
word(
    "Quale angolo annulla la forza?",
    "Una particella carica con velocità non nulla attraversa un campo magnetico non nullo senza forza magnetica. Completa: la velocità è parallela o … al campo.",
    1,
    "antiparallela",
    ["antiparallelo", "opposta", "antiparallela al campo"],
    "Il seno dell’angolo deve essere zero.",
    "concetto",
    "Gli angoli 0° e 180° annullano v × B.",
    eq(r"F_B=|q|vB\sin\theta"),
    "Sia una velocità concorde sia una discorde con B hanno componente perpendicolare nulla. Il moto rettilineo lungo il campo può proseguire senza deviazione.",
)
num(
    "Filo obliquo fra i poli",
    "Un tratto di filo lungo 0,30 m porta 4,0 A in B = 0,20 T. L’angolo fra filo e B è 30°. Calcola il modulo della forza in N.",
    2,
    0.12,
    "N",
    0.002,
    4 * 0.30 * 0.20 * math.sin(math.radians(30)),
    "Prendi la componente perpendicolare mediante il seno dell’angolo.",
    "modello",
    "Usare l’intera lunghezza senza seno darebbe la forza a 90°.",
    eq(
        r"F=I\ell B\sin30^\circ=4{,}0\cdot0{,}30\cdot0{,}20\cdot0{,}50=0{,}12\ \mathrm N"
    ),
    "Il valore è metà di quello massimo ottenibile con lo stesso filo e lo stesso campo.",
)
choice(
    "Una particella negativa e le croci",
    "Una particella negativa si muove verso destra in B entrante perpendicolare al foglio. In quale verso punta la forza magnetica?",
    2,
    "Verso il basso nel foglio",
    ["Verso l’alto nel foglio", "Verso destra", "Verso chi guarda"],
    "Trova prima v × B per una carica positiva, poi applica il segno.",
    "modello",
    "Destra per campo entrante dà verso l’alto per la carica positiva e si inverte per quella negativa.",
    fig(
        "C4-orbita",
        "Il disegno è per una prova positiva. Cambiare il segno della carica inverte la forza a parità di v e B.",
    ),
    "Il prodotto vettoriale punta in alto, ma è moltiplicato da q negativa. La freccia della forza risultante punta quindi verso il basso.",
)
num(
    "Periodo di una traiettoria circolare",
    "Una particella non relativistica impiega 0,40 ms per percorrere un quarto di circonferenza a velocità costante in B uniforme. Trova la frequenza di rotazione in Hz.",
    2,
    625,
    "Hz",
    1,
    1 / (4 * 0.4e-3),
    "Ricava il tempo di un giro intero prima di fare il reciproco.",
    "unità",
    "Il periodo completo vale quattro volte 0,40 ms.",
    eq(
        r"T=4\cdot0{,}40=1{,}60\ \mathrm{ms}=1{,}60\cdot10^{-3}\ \mathrm s,\quad f=1/T=625\ \mathrm{Hz}"
    ),
    "Per un moto uniforme il tempo di percorrenza è proporzionale alla frazione di giro.",
)
word(
    "Forma del moto con due componenti",
    "In B uniforme, senza altre forze, una particella carica ha velocità con componenti non nulle parallela e perpendicolare al campo. Qual è la forma della traiettoria?",
    2,
    "elica",
    ["elicoidale", "elica cilindrica"],
    "Sovrapponi avanzamento assiale e moto circolare nel piano perpendicolare.",
    "modello",
    "La componente parallela resta costante e la componente perpendicolare ruota.",
    "La somma di una rotazione uniforme in un piano e di una traslazione uniforme perpendicolare al piano produce un’elica. Con componente parallela nulla il caso limite è una circonferenza.",
)
num(
    "Cosa fa il campo all’energia cinetica?",
    "Una particella passa in un campo magnetico statico uniforme e il suo vettore velocità ruota di 90°. È soggetta solo alla forza magnetica. Calcola in J la variazione dell’energia cinetica.",
    1,
    0,
    "J",
    0,
    0,
    "Guarda l’angolo tra forza istantanea e velocità istantanea.",
    "concetto",
    "La forza magnetica è perpendicolare alla velocità in ciascun istante.",
    eq(r"P=\vec F_B\cdot\vec v=0\quad\Longrightarrow\quad\Delta K=W_B=0\ \mathrm J"),
    "Una variazione della direzione può avvenire senza cambiare il modulo della velocità.",
)
choice(
    "Confrontare raggi a stessa quantità di moto",
    "Due particelle entrano perpendicolarmente nello stesso B con la stessa quantità di moto in modulo. Una porta carica +e, l’altra +2e. Quale ha il raggio più piccolo?",
    2,
    "Quella con carica +2e",
    [
        "Quella con carica +e",
        "Hanno sempre lo stesso raggio",
        "La domanda richiede la loro temperatura",
    ],
    "Scrivi il raggio usando p al posto di mv.",
    "algebra",
    "Il raggio è inversamente proporzionale al modulo della carica a p e B fissati.",
    eq(r"r=p/(|q|B)"),
    "Raddoppiare il modulo della carica raddoppia la curvatura a quantità di moto assegnata. La seconda particella percorre un cerchio con raggio dimezzato.",
)
num(
    "Approfondimento · Bilanciare forza elettrica e magnetica",
    "Una particella positiva attraversa senza deviazione campi uniformi E e B perpendicolari fra loro e alla velocità. Le due forze hanno versi opposti. Se E = 1200 V/m e B = 0,040 T, qual è la velocità in m/s?",
    3,
    30000,
    "m/s",
    10,
    1200 / 0.04,
    "Scrivi l’uguaglianza dei moduli delle forze e cancella la carica.",
    "modello",
    "La compensazione richiede qE = qvB con i versi già specificati.",
    eq(r"qE=qvB\quad\Longrightarrow\quad v=E/B=1200/0{,}040=30\,000\ \mathrm{m/s}"),
    "Una velocità diversa cambierebbe solo il contributo magnetico per i campi assegnati, producendo una deviazione.",
)

enter("C4", 10)
num(
    "Flusso attraverso una spira inclinata",
    "Una spira piana di area 0,020 m² è in B = 0,30 T. L’angolo fra B e la normale scelta è 60°. Calcola il flusso in mWb.",
    2,
    3,
    "mWb",
    0.018,
    0.020 * 0.30 * math.cos(math.radians(60)) * 1000,
    "Il coseno usa l’angolo rispetto alla normale.",
    "modello",
    "A 60° la componente normale è metà del modulo del campo.",
    fig(
        "C4-flusso",
        "Il piano e la normale sono perpendicolari. L’angolo indicato è quello della formula.",
    ),
    eq(
        r"\Phi=BA\cos60^\circ=0{,}30\cdot0{,}020\cdot0{,}5=0{,}0030\ \mathrm{Wb}=3{,}0\ \mathrm{mWb}"
    ),
)
choice(
    "Un grande campo immutabile",
    "Una spira conduttrice chiusa resta ferma con area e orientamento fissi in un campo magnetico uniforme costante. Qual è la f.e.m. dovuta a quel campo?",
    1,
    "Nulla",
    [
        "Maggiore se la resistenza è maggiore",
        "Sempre pari a BA",
        "Sempre pari alla corrente",
    ],
    "La f.e.m. di Faraday dipende dal cambiamento del flusso.",
    "modello",
    "Un flusso anche grande può restare costante nel tempo.",
    eq(r"\Delta\Phi=0\quad\Longrightarrow\quad\overline{\mathcal E}=0"),
    "Il campo attraversa la spira, ma la sua presenza costante non produce una f.e.m. di induzione.",
)
word(
    "Segno meno nella legge di Faraday",
    "Quale cognome identifica la regola secondo cui l’induzione contrasta la variazione di flusso che l’ha generata?",
    1,
    "Lenz",
    ["legge di Lenz"],
    "Il segno meno fissa un orientamento relativo fra variazione di flusso e f.e.m.",
    "concetto",
    "L’induzione contrasta il cambiamento del flusso esterno.",
    "La legge di Lenz stabilisce il verso della risposta. Quando il flusso esterno diminuisce, il campo indotto tende a sostenerlo, mentre quando aumenta tende a limitarne l’aumento.",
)
num(
    "Dalla tensione alla rapidità di variazione",
    "Una bobina di 80 spire identiche presenta una f.e.m. media di modulo 1,6 V. Quanto vale il modulo della variazione di flusso per spira al secondo, in Wb/s?",
    1,
    0.020,
    "Wb/s",
    0.00015,
    1.6 / 80,
    "La tensione totale riguarda il flusso concatenato di tutte le spire.",
    "algebra",
    "Dividi per il numero di spire per ottenere il dato per spira.",
    eq(
        r"|\Delta\Phi|/\Delta t=|\overline{\mathcal E}|/N=1{,}6/80=0{,}020\ \mathrm{Wb/s}"
    ),
    "Il risultato per una sola spira è inferiore a quello concatenato di un fattore 80.",
)
choice(
    "Spira vista dal lato opposto",
    "Un osservatore vede una corrente indotta antioraria in una spira. Un osservatore che la guarda dal lato opposto descrive la stessa corrente come …",
    1,
    "Oraria",
    ["Ancora antioraria", "Nulla", "Alternata anche se è costante"],
    "Immagina di guardare le lancette attraverso il retro di un orologio trasparente.",
    "testo",
    "Il senso orario dipende dal lato di osservazione.",
    "Il percorso fisico della carica è lo stesso. Invertire la normale rivolta all’osservatore scambia la descrizione oraria e antioraria. Per questo si specifica sempre da quale lato si osserva la spira.",
)
num(
    "Una mezza rotazione",
    "Una sola spira di area 0,010 m² ruota di mezzo giro in B uniforme di 0,50 T in 0,10 s. La normale scelta, inizialmente concorde con B, termina discorde. Trova il modulo della f.e.m. media in V.",
    2,
    0.10,
    "V",
    0.0008,
    2 * 0.01 * 0.5 / 0.1,
    "Calcola i flussi iniziale e finale mantenendo la stessa orientazione materiale della spira.",
    "algebra",
    "Il flusso passa da +BA a −BA e la variazione ha modulo 2BA.",
    eq(
        r"\Phi_i=+0{,}005\ \mathrm{Wb},\quad \Phi_f=-0{,}005\ \mathrm{Wb},\quad |\Delta\Phi|=0{,}010\ \mathrm{Wb}"
    ),
    eq(r"|\overline{\mathcal E}|=0{,}010/0{,}10=0{,}10\ \mathrm V"),
    "Usare soltanto BA trascurerebbe il cambiamento di segno del flusso.",
)
word(
    "Circuito interrotto",
    "Una spira presenta un’interruzione isolante e un flusso magnetico variabile. Quale grandezza, possibile in una spira chiusa resistiva, manca come circolazione continua di carica lungo tutta la spira aperta?",
    1,
    "corrente",
    ["corrente elettrica", "corrente indotta", "corrente di conduzione"],
    "Distingui la forza elettromotrice e la risposta conduttiva del percorso.",
    "concetto",
    "L’interruzione impedisce il passaggio continuo di cariche lungo un percorso chiuso.",
    "Una f.e.m. indotta può ancora produrre una differenza di potenziale ai capi dell’interruzione. Nel modello a circuito aperto ideale la corrente di conduzione lungo l’intero anello è nulla.",
)
num(
    "Approfondimento · Dalla variazione di flusso alla carica passata",
    "Una spira singola di resistenza 5,0 Ω, con autoinduzione trascurabile, subisce una variazione monotona di flusso di modulo 0,030 Wb. Qual è il modulo della carica transitata in mC?",
    3,
    6,
    "mC",
    0.03,
    0.03 / 5 * 1000,
    "Integra nel tempo I = ℰ/R e applica Faraday.",
    "modello",
    "Con R costante il tempo scompare dal calcolo della carica complessiva.",
    eq(
        r"|\Delta q|=\left|\int I\,dt\right|=\frac1R\left|\int\mathcal E\,dt\right|=|\Delta\Phi|/R"
    ),
    eq(r"|\Delta q|=0{,}030/5{,}0=0{,}0060\ \mathrm C=6{,}0\ \mathrm{mC}"),
    "La rapidità del cambiamento influenza la corrente istantanea. A resistenza costante la carica algebrica complessiva dipende dagli estremi del flusso.",
)
choice(
    "Spira che entra in una regione di campo",
    "Una spira conduttrice viene spinta in una regione con B entrante uniforme, partendo completamente fuori. Durante l’ingresso l’area immersa cresce. Quale verso ha la corrente vista dal davanti?",
    2,
    "Antiorario",
    [
        "Orario",
        "Nullo perché B è uniforme nella regione",
        "Dipende soltanto dal materiale del filo",
    ],
    "Considera il flusso che cresce perché muta l’area immersa.",
    "modello",
    "L’aumento del flusso entrante richiede un campo indotto uscente.",
    fig(
        "C4-lenz",
        "La direzione della risposta è la stessa per un aumento dovuto all’area immersa o al modulo del campo.",
    ),
    "Con il pollice destro verso chi guarda, le dita si chiudono in senso antiorario. Dopo che tutta la spira è dentro, una traslazione rigida nel campo uniforme lascia costante il flusso.",
)
num(
    "Da un grafico con due pendenze",
    "Una spira singola concatena un flusso che sale linearmente da 0 a 8 mWb nei primi 4 ms e resta poi costante per 4 ms. Calcola il modulo della f.e.m. media sull’intero intervallo di 8 ms in V.",
    2,
    1,
    "V",
    0.005,
    0.008 / 0.008,
    "Usa la variazione fra gli estremi e la durata totale richiesta.",
    "testo",
    "La f.e.m. è diversa nei due tratti, mentre il quesito chiede la media sull’intero intervallo.",
    eq(
        r"|\overline{\mathcal E}|=|\Phi_f-\Phi_i|/(8\cdot10^{-3})=8\cdot10^{-3}/(8\cdot10^{-3})=1\ \mathrm V"
    ),
    "Nei primi 4 ms il modulo è 2 V e nei successivi 4 ms è zero. Le due durate uguali giustificano anche la media dei due valori.",
)
