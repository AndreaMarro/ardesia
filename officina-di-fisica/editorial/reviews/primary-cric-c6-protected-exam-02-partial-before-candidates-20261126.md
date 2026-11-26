# Preparazione parziale C6: primaria indipendente del secondo esame protetto

Questa parte copre soltanto i 31 prompt C6-Q044–074 del cohort cric-c6-protected-exam-02. È separata dalla primaria dei 13 practice e non attribuisce alcun credito scientifico. Gli esami nell’app restano default-deny; il repository pubblico autorizzato non costituisce pubblicazione nell’app o approvazione umana.

Ho estratto soltanto id e prompt con allowlist e sourcePath individuali dell’assegnazione. Non sono stati aperti opzioni, chiavi, soluzioni, hint, figure o candidati C6. Il revisore ha già studiato modelli e quesiti degli altri corsi: questa esposizione fisica generale è dichiarata e non presentata come cecità assoluta sui concetti. Le condizioni mancanti vengono annotate come condizioni, non aggiunte tacitamente ai dati.

Fonte Git 5d1dc8dc7b601aef959d10d564c75462be74708d. Modello computazionale di questa parte NOT_RUN al momento di questo freeze manuale. Nessun candidato nuovo viene prodotto.

## C6-Q044

Prompt originale: Un campione da 12 g occupa 8,0 cm³, un secondo campione omogeneo da 18 g occupa 12 cm³. Che cosa si può dedurre confrontando soltanto massa e volume?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Le densità sono 12/8=3/2 g/cm³ e 18/12=3/2 g/cm³: i due rapporti coincidono. Non si può dedurre che sia lo stesso materiale, perché materiali differenti possono avere la stessa densità e il primo campione non è neppure dichiarato omogeneo. Si confrontano densità medie, non identità chimiche.

## C6-Q045

Prompt originale: Due fili dello stesso materiale alla stessa temperatura hanno resistenze uguali. Il secondo è lungo quattro volte il primo. Quanto deve valere il diametro del secondo rispetto al primo, per sezioni circolari uniformi?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Con medesima resistività, R=ρL/A. R uguali e L₂=4 L₁ richiedono A₂=4 A₁. Per una sezione circolare A è proporzionale al diametro al quadrato, quindi d₂/d₁=2, con diametri positivi. Non confondere fattore dell’area e fattore della lunghezza del diametro.

## C6-Q046

Prompt originale: Due contenitori rigidi da 1,0 L ciascuno comunicano tramite un rubinetto. Il primo contiene gas ideale a 180 kPa assoluti, il secondo è vuoto. Dopo l’apertura il gas torna alla temperatura iniziale. Qual è la pressione finale?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Con moli conservate e stessa temperatura iniziale e finale, p_i V_i=p_f(V_i+V_vuoto). I due volumi sono uguali, dunque p_f=180/2=90 kPa assoluti. L’eventuale evoluzione intermedia della temperatura non deve essere supposta isoterma: basta il ritorno finale alla temperatura iniziale dichiarato.

## C6-Q047

Prompt originale: Un corpo viene lasciato muovere verticalmente verso il basso con velocità iniziale 2,0 m/s. In assenza d’attrito, con g = 10 m/s², quanto spazio percorre nel primo secondo?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Scelgo positivo verso il basso: s=v₀t+gt²/2. Nel primo secondo si percorrono 2+5=7 m; velocità iniziale e gravità hanno lo stesso verso, quindi non ci sono inversioni. La legge dello spazio non coincide con la sola variazione della velocità.

## C6-Q048

Prompt originale: Una sorgente passa da 440 Hz a 880 Hz nella stessa aria, con velocità del suono praticamente invariata. Quale coppia di effetti si osserva?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La frequenza raddoppia e il suono è più acuto. Nella stessa aria con velocità costante λ=c/f si dimezza. Non segue un aumento necessario dell’intensità o della velocità di propagazione dal solo aumento della frequenza.

## C6-Q049

Prompt originale: Una pressa ideale ha due pistoni alla stessa quota con aree 4 cm² e 100 cm². Applicando un incremento di forza di 8 N sul piccolo, quale incremento di forza si ottiene sul grande?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Alla stessa quota l’incremento di pressione si trasmette: ΔF_grande=ΔF_piccolo·A_grande/A_piccolo=8·100/4=200 N. Non si deve aggiungere una correzione di quota e non si pretende un’uguaglianza dei lavori da questa sola relazione istantanea.

## C6-Q050

Prompt originale: Due cariche puntiformi identiche positive sono tenute ferme a distanza 2d. Una piccola carica negativa è posta esattamente a metà. Considerando solo queste cariche, quale affermazione è corretta?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Al punto medio i due campi delle cariche positive sono uguali e opposti: E=0 e la forza qE sulla piccola carica negativa è zero. Il potenziale con zero all’infinito è invece la somma positiva 2 kQ/d, non zero, e l’energia della carica negativa è negativa. Il campo nullo non prova stabilità: l’equilibrio è instabile per spostamenti lungo la congiungente.

## C6-Q051

Prompt originale: Lo stesso carico viene sollevato alla stessa altezza prima in 8 s e poi in 2 s a velocità costante, trascurando perdite. Quale coppia di rapporti secondo/primo è corretta per lavoro e potenza media?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Stesso peso, stesso dislivello e uguale energia cinetica agli estremi danno uguale lavoro utile mgh. Il rapporto lavoro secondo/primo è 1; la potenza media è lavoro/durata, quindi il rapporto è 8/2=4. Il lavoro non quadruplica solo perché la stessa azione avviene più rapidamente.

## C6-Q052

Prompt originale: Due superfici a temperature diverse sono separate dal vuoto senza alcun supporto materiale tra loro. Quale meccanismo permette trasferimento termico attraverso l’intercapedine?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Attraverso il vuoto passa radiazione elettromagnetica: irraggiamento. Conduzione e convezione richiedono un mezzo materiale nel varco. Nel modello dichiarato non esistono supporti che offrano un percorso conduttivo alternativo.

## C6-Q053

Prompt originale: Lente sottile tra oggetto e schermo, distanti 64 cm. L’immagine è nitida e con lo stesso modulo di altezza dell’oggetto. Quanto vale la focale?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Immagine reale sullo schermo e uguale modulo di altezza implicano q/p=1. Con p+q=64 cm si ha p=q=32 cm. Dalla lente sottile 1/f=1/p+1/q segue f=16 cm. L’ingrandimento orientato è−1, non+1: l’immagine è invertita.

## C6-Q054

Prompt originale: Un oggetto percorre metà di una circonferenza a velocità di modulo costante. Quale affermazione descrive correttamente velocità e accelerazione istantanee lungo il tratto?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La velocità è tangente alla circonferenza e cambia direzione pur avendo modulo costante. L’accelerazione è centripeta, perpendicolare alla velocità e di modulo v²/R costante per R e v costanti. I vettori non sono costanti lungo mezza circonferenza, anche se i loro moduli lo sono.

## C6-Q055

Prompt originale: In un tubo circolare rigido, lungo, con flusso stazionario laminare sviluppato di un fluido newtoniano e pareti ferme con aderenza, dove si trova il modulo massimo della velocità?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Nel modello di Poiseuille il profilo è parabolico e il massimo del modulo si trova sull’asse, r=0, mentre l’aderenza rende la velocità nulla alla parete. Per un confronto stretto serve un flusso non nullo: con portata nulla tutti i punti avrebbero lo stesso massimo zero. Il modello include pareti ferme e regime sviluppato, già dichiarati.

## C6-Q056

Prompt originale: Una particella carica entra in un campo magnetico uniforme con velocità esattamente parallela al campo. Agiscono soltanto forze magnetiche. Che traiettoria segue?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Con velocità esattamente parallela a B il prodotto vettoriale v×B è nullo. Non agiscono altre forze, quindi la traiettoria è rettilinea uniforme lungo il campo, indipendentemente dal segno della carica. Non si deve imporre un moto circolare senza componente trasversale.

## C6-Q057

Prompt originale: Un gas percorre in senso antiorario un ciclo quasi statico nel piano p–V. L’area racchiusa vale 12 kPa·L. Nei primi due tratti il gas riceve 40 J e poi cede 15 J di calore. Quanto calore riceve, con il segno algebrico, nel terzo e ultimo tratto?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Il ciclo antiorario ha lavoro compiuto dal gas W=−12 J, perché 1 kPa·L=1 J. In un ciclo ΔU=0 e il calore netto ricevuto è W. I primi due contributi sommano 40−15=25 J; il terzo deve essere−12−25=−37 J. Il sistema cede 37 J in quel tratto, pur essendo la domanda formulata come calore ricevuto con segno.

## C6-Q058

Prompt originale: Un rivelatore piccolo rispetto al raggio e perpendicolare ai raggi è posto a distanza r da una sorgente isotropa senza perdite. Lo si sostituisce con uno di area quadrupla a distanza 2r. La potenza raccolta diventa quale?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Per sorgente isotropa e rivelatore piccolo normale, P_raccolta è proporzionale ad A/r². Area quadrupla e distanza doppia danno fattore 4/4=1: la potenza resta uguale. Nessun assorbimento e nessuna variazione della potenza sorgente sono introdotti.

## C6-Q059

Prompt originale: Un liquido incomprimibile scorre in un condotto con portata 12 mL/s. Il condotto si divide in tre rami senza perdite di liquido. In regime stazionario due portano rispettivamente 2 e 7 mL/s. Il terzo ha sezione 0,50 cm². Qual è la sua velocità media?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La portata del terzo ramo è 12−2−7=3 mL/s=3 cm³/s. Dividendo per 0,50 cm² si ha velocità media 6 cm/s=3/50 m/s. Le sezioni dei due rami noti non servono, e questa è una media sulla sezione del terzo, non il suo massimo locale.

## C6-Q060

Prompt originale: Un resistore ideale fisso da 4 Ω è alimentato a 8 V continui. Quanto tempo occorre per dissipare 80 J?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La potenza continua sul resistore fisso è V²/R=64/4=16 W. L’energia 80 J richiede t=E/P=5 s. Non si usa V²R, che non ha unità di potenza e contraddice la legge di Ohm a tensione fissata.

## C6-Q061

Prompt originale: Due pattinatori inizialmente fermi si respingono su ghiaccio senza attrito. Quello di 60 kg acquista velocità +2,0 m/s. Quanto vale la velocità di quello di 40 kg?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La quantità di moto orizzontale totale iniziale è zero e le forze esterne orizzontali sono trascurabili.60·2+40 v₂=0, dunque v₂=−3 m/s. Il corpo più leggero ha modulo maggiore; la somma delle velocità non deve essere zero quando le masse differiscono.

## C6-Q062

Prompt originale: Un sistema chiuso passa da A a B lungo un cammino reversibile. Riceve 60 J a 300 K e 120 J a 400 K. Gli altri tratti sono adiabatici e reversibili. Poi ritorna da B ad A attraverso un cammino irreversibile. Qual è la variazione di entropia del solo sistema nel ritorno?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: L’entropia è funzione di stato. Sul cammino reversibile A→B, ΔS=60/300+120/400=1/5+3/10=1/2 J/K; gli altri tratti reversibili adiabatici contribuiscono zero. Il ritorno B→A ha quindi ΔS_sistema=−1/2 J/K anche se è irreversibile. Non si impone un aumento dell’entropia del solo sistema in qualunque processo: la produzione riguarda il bilancio completo con gli scambi.

## C6-Q063

Prompt originale: Una sorgente infrarossa monocromatica aumenta la potenza emessa lasciando f invariata. Nel regime di interazioni a singolo fotone, quale effetto segue necessariamente?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Frequenza f invariata significa energia per fotone hf invariata. La potenza monocromatica maggiore richiede un maggiore tasso di fotoni emessi P/(hf). Nel regime a singolo fotone non aumenta per questo l’energia del singolo evento. Un maggiore tasso rilevato richiederebbe inoltre geometria ed efficienza di raccolta invariati.

## C6-Q064

Prompt originale: Una cassa viene trascinata verso destra su un piano orizzontale fermo. È già in scorrimento verso destra rispetto al piano. La forza di attrito dinamico del piano sulla cassa è diretta come?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: L’attrito dinamico sulla cassa è diretto verso sinistra, opposto allo scorrimento relativo verso destra rispetto al piano fermo. Non è la direzione dell’accelerazione o della forza applicata a fissare il verso dell’attrito di scorrimento.

## C6-Q065

Prompt originale: Il prodotto tra due vettori definito come ab cos θ si chiama prodotto ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È il prodotto scalare. Il risultato è uno scalare ab cosθ e può essere positivo, nullo o negativo. Il modulo del prodotto vettoriale contiene invece sinθ ed è un’altra operazione.

## C6-Q066

Prompt originale: Il principio secondo cui la spinta su un corpo immerso ha modulo pari al peso del fluido spostato porta il nome di ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È il principio di Archimede. Nel modello idrostatico la risultante delle pressioni sul volume immerso equivale al peso del fluido spostato, verso l’alto in gravità uniforme. La massa totale dell’oggetto non è direttamente il volume spostato.

## C6-Q067

Prompt originale: La capacità termica per unità di massa è il calore ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Il nome richiesto è calore specifico: capacità termica totale divisa per la massa, con unità SI J/(kg·K). Per un gas occorre specificare il vincolo del processo per distinguere, ad esempio, c_p e c_v. Non è il calore latente in J/kg.

## C6-Q068

Prompt originale: Il parziale orientamento dei dipoli o lo spostamento delle cariche legate in un isolante sotto un campo esterno è una forma di ____ elettrica.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È polarizzazione elettrica: orientamento parziale di dipoli e/o separazione delle cariche legate. Non coincide con una corrente di conduzione continua di cariche libere attraverso il materiale ideale isolante.

## C6-Q069

Prompt originale: La distanza tra due compressioni consecutive in un’onda sonora armonica progressiva è detta ____ d’onda.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: La parola è lunghezza: la distanza fra due compressioni consecutive è la lunghezza d’onda λ. Compressione e rarefazione consecutive distano invece mezza lunghezza d’onda nel modello armonico. L’ampiezza descrive l’oscillazione locale, non questa periodicità spaziale.

## C6-Q070

Prompt originale: La grandezza fisica che misura il lavoro compiuto nell’unità di tempo è la ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È la potenza. Per un intervallo finito la potenza media è W/Δt; la potenza istantanea è dW/dt. La grandezza non è il lavoro stesso e ha unità watt, cioè joule al secondo.

## C6-Q071

Prompt originale: La proprietà del fluido che nella legge di Newton per lo sforzo tangenziale moltiplica il gradiente di velocità è la ____ dinamica.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È viscosità dinamica μ oη. Per fluido newtoniano lega lo sforzo tangenziale al gradiente di velocità e ha unità Pa·s. La viscosità cinematica è invece μ/ρ e ha unità m²/s.

## C6-Q072

Prompt originale: Una trasformazione durante la quale il sistema non scambia calore con l’ambiente si chiama ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È adiabatica: il trasferimento di energia come calore è zero. Può esserci lavoro e quindi variazione di energia interna e temperatura. Non confondere questa proprietà con isotermia o isolamento completo da ogni trasferimento energetico.

## C6-Q073

Prompt originale: Una spira conduttrice chiusa giace sul foglio. Il campo magnetico esterno è diretto verso il lettore e il suo modulo cresce. Visto dal lettore, il verso della corrente indotta è ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: Il flusso esterno uscente aumenta; la risposta indotta deve produrre un contributo entrante. La mano destra dà corrente oraria vista dal lettore. Questa è la corrente indotta dalla variazione, con circuito chiuso e nessuna diversa sorgente o corrente iniziale imposta; non si sta classificando una corrente totale arbitraria già esistente.

## C6-Q074

Prompt originale: L’unità SI che esprime un decadimento al secondo si chiama ____.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Derivazione indipendente: È il becquerel, simbolo Bq, attività di un decadimento al secondo. Anche l’hertz ha dimensione s⁻¹ ma identifica una frequenza, non il nome dell’unità di attività nucleare richiesta.
