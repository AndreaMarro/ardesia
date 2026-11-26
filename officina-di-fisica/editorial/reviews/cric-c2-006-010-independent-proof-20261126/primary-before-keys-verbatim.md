# Primaria indipendente Cric C2-Q051…Q100 — solo prompt e dati

Fonte immutabile: `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. SHA-256 del file: `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`. Sono stati estratti soltanto id e prompt dei cinquanta ID assegnati tramite allowlist. Tutti sono stati letti e derivati individualmente prima di aprire opzioni, chiavi, soluzioni, hint, figure originali o candidate della nuova autoria C2 B. Nessuna esposizione puntuale nota; nessun modulo autore B o primaria B aperto.

Sono cinquanta problemi distinti nei cinque cohort L006…L010. Le qualificazioni sulle ipotesi non sono finding su candidate ancora non viste: delimitano il risultato deducibile dal solo enunciato. In particolare restano da verificare il flusso non nullo nei rapporti, il pieno sviluppo dei profili, le condizioni al contorno delle reti, la γ comune e il conteggio delle interfacce. Per Q086 la topologia deriva dal testo, mentre la figura andrà letta successivamente. Nessun verdetto scientifico sulle nuove bozze. Approvazione umana NOT_RUN; pubblicazione NONE.

## C2-Q051

Enunciato originale (soli prompt e dati):

Un fluido ideale incomprimibile scorre stazionario in un tubo orizzontale senza rami. Che cosa avviene entrando in un restringimento?

Derivazione indipendente:

Continuità stazionaria incomprimibile senza rami: Q=A v è comune. Per portata non nulla, una sezione minore richiede rapidità maggiore. Bernoulli lungo la stessa linea di corrente orizzontale, senza perdite o macchine, dà p+ρv²/2 costante: alla maggiore rapidità corrisponde pressione statica minore. Non è una perdita di portata; pressione e rapidità sono grandezze diverse.

## C2-Q052

Enunciato originale (soli prompt e dati):

In una dilatazione orizzontale ideale la velocità passa da 2,0 m/s a 1,0 m/s. Per ρ = 1000 kg/m³, calcola p finale meno p iniziale.

Derivazione indipendente:

Bernoulli orizzontale: p_f−p_i=(ρ/2)(v_i²−v_f²). Inserisco 1000/2=500 kg/m³ e 2²−1²=3 m²/s²: incremento +1500 Pa. La decelerazione recupera pressione nel modello ideale. Un valore negativo scambierebbe finale e iniziale; non si usa il quadrato della differenza 2−1.

## C2-Q053

Enunciato originale (soli prompt e dati):

In un tubo ideale a sezione costante un liquido di densità 800 kg/m³ sale di 0,75 m a velocità costante. Con g = 10 m/s², di quanti pascal diminuisce la pressione?

Derivazione indipendente:

Sezione costante e incomprimibilità mantengono la stessa rapidità nei due stati. Rimangono p+ρgz costanti: p_f−p_i=−ρgΔz=−800·10·(3/4)=−6000 Pa. Si chiede di quanto diminuisca, quindi il modulo della caduta è 6000 Pa. Il dislivello è verticale, non la lunghezza del tubo.

## C2-Q054

Enunciato originale (soli prompt e dati):

In aria trattata come incomprimibile (ρ = 1,2 kg/m³) un punto di ristagno alla stessa quota ha pressione superiore di 60 Pa alla statica della corrente. Quanto vale la velocità indisturbata nel modello ideale?

Derivazione indipendente:

Nel punto di ristagno v=0 e la differenza rispetto alla pressione statica è ρv²/2. Quindi v²=2·60/(6/5)=100 m²/s² e la rapidità è la radice positiva 10 m/s. Si usa il modello di aria incomprimibile prescritto; non serve una radice decimale né si identifica la pressione totale con quella statica.

## C2-Q055

Enunciato originale (soli prompt e dati):

Un lungo tubo orizzontale uniforme con liquido viscoso in regime stazionario mostra pressione più bassa a valle, con la stessa velocità media. Quale fenomeno deve entrare nel bilancio?

Derivazione indipendente:

Con uguali quota e velocità media, il calo di pressione non si spiega col Bernoulli ideale senza perdite. Occorre la dissipazione viscosa dell’energia meccanica, che alimenta energia interna e scambi termici. In un tubo uniforme stazionario la portata può restare costante benché la pressione diminuisca. Il calo positivo pertinente entra come perdita di carico o potenza dissipata Δp·Q.

## C2-Q056

Enunciato originale (soli prompt e dati):

In un tubo orizzontale ideale il fluido ha ρ = 1000 kg/m³ e a monte v₁ = 1 m/s. A valle la pressione è 1500 Pa più bassa. Calcola il rapporto A₁/A₂.

Derivazione indipendente:

Da p_1−p_2=(ρ/2)(v_2²−v_1²), 1500=500(v_2²−1) con le unità SI coerenti. Risulta v_2²=4 m²/s² e, nello stesso verso di flusso, v_2=2 m/s. Continuità dà A_1/A_2=v_2/v_1=2. Il rapporto delle aree è inverso a quello delle rapidità nelle sezioni corrispondenti.

## C2-Q057

Enunciato originale (soli prompt e dati):

Come si chiama il punto nel quale una linea di corrente si arresta contro un ostacolo? Rispondi con il sostantivo dopo «punto di».

Derivazione indipendente:

Il sostantivo richiesto è ristagno. Il punto di ristagno ha velocità locale nulla rispetto all’ostacolo fermo e permette il confronto fra pressione totale e statica nel modello ideale. Non significa che tutta la corrente sia ferma. Nessuna opzione o alias originale è stato aperto.

## C2-Q058

Enunciato originale (soli prompt e dati):

In un allargamento brusco reale si osservano zone di ricircolo. Perché il recupero di pressione può essere inferiore alla stima ideale?

Derivazione indipendente:

Un allargamento brusco reale può separare la corrente e creare ricircolo, mescolamento e dissipazione viscosa. La pressione recuperata è la diminuzione del termine cinetico meno la perdita meccanica positiva: p_2−p_1=ρ(v_1²−v_2²)/2−Δp_perdita. Non è necessario dichiarare ogni ricircolo automaticamente turbolento; è la perdita non nulla a rendere insufficiente la stima ideale.

## C2-Q059

Enunciato originale (soli prompt e dati):

Un piccolo foro di un grande serbatoio aperto ha velocità ideale 2 m/s. Se il dislivello sopra il foro quadruplica, quale diventa la velocità ideale?

Derivazione indipendente:

Nel modello di Torricelli istantaneo, serbatoio grande, superficie e getto alla stessa pressione esterna e perdite assenti, v=√(2gh). Quadruplicare h moltiplica v per √4=2: da 2 a 4 m/s. Non quadruplica la rapidità; il confronto è fra due battenti preparati, senza bisogno di integrare lo svuotamento.

## C2-Q060

Enunciato originale (soli prompt e dati):

Per due sezioni orizzontali di un tubo ideale qualcuno scrive p₁ − p₂ = ρ(v₂ − v₁)²/2. Quale correzione riflette il bilancio energetico?

Derivazione indipendente:

Il bilancio corretto è p_1−p_2=ρ(v_2²−v_1²)/2, cioè differenza dei quadrati, non quadrato della differenza. L’espressione proposta aggiunge un termine incrociato e non può dare una differenza negativa durante una dilatazione. Per esempio v_1=1 e v_2=2 darebbero rispettivamente 3 e 1 come fattori cinematici; è una controprova indipendente, non un’opzione vista.

## C2-Q061

Enunciato originale (soli prompt e dati):

Un sottile filamento colorato rimane ordinato in un tubo diritto e le linee di moto scorrono affiancate. Quale regime è suggerito nel tratto osservato?

Derivazione indipendente:

Un filamento ordinato e strati che scorrono affiancati suggeriscono regime laminare nel tratto osservato. Non è una certificazione universale di ogni sezione o istante: la formulazione suggerito è locale. Una corrente stazionaria non è per definizione laminare e una grande velocità non basta da sola a diagnosticare turbolenza.

## C2-Q062

Enunciato originale (soli prompt e dati):

In flusso di Poiseuille pienamente sviluppato una sonda sull’asse registra 0,56 m/s. Calcola la velocità media.

Derivazione indipendente:

Per Poiseuille in tubo circolare, laminare newtoniano stazionario sviluppato e con aderenza, v(r)=v_max[1−(r/R)²]. La media sulla sezione è (2/R²)∫₀ᴿv(r)r dr=v_max/2. Con v_max=0,56=14/25 m/s, la media è 7/25=0,28 m/s. Non è la media temporale del valore sull’asse.

## C2-Q063

Enunciato originale (soli prompt e dati):

Fra due strati a distanza 0,50 mm la velocità varia di 0,020 m/s. Qual è il modulo del gradiente medio trasversale?

Derivazione indipendente:

Il gradiente medio trasversale in modulo è Δv/Δy. Converto 0,50 mm in 1/2000 m e 0,020 m/s in 1/50 m/s: (1/50)/(1/2000)=40 s⁻¹. Non è un’accelerazione, perché il denominatore è una distanza e non un intervallo di tempo. Non serve assumere che il gradiente locale sia uniforme oltre i due punti.

## C2-Q064

Enunciato originale (soli prompt e dati):

Una prova su un liquido newtoniano misura uno sforzo tangenziale di 3,6 Pa per un gradiente di velocità di 12 s⁻¹. Qual è η?

Derivazione indipendente:

Nel modello newtoniano τ=η γ̇. L’inversa è η=τ/γ̇: (18/5 Pa)/(12 s⁻¹)=3/10 Pa·s. Si tratta di viscosità dinamica; la viscosità cinematica avrebbe unità m²/s e richiederebbe anche la densità. La divisione manuale 3,6/12 è esatta.

## C2-Q065

Enunciato originale (soli prompt e dati):

Due strati adiacenti di un fluido newtoniano hanno la stessa velocità in un tratto di campo uniforme. Qual è lo sforzo viscoso di taglio dovuto a quel gradiente?

Derivazione indipendente:

Nel tratto di velocità uniforme il gradiente trasversale è zero. Lo sforzo viscoso di taglio dovuto a quel gradiente è dunque τ=η·0=0, anche con η non nulla. Non segue che la pressione o ogni componente del tensore degli sforzi sia nulla; la conclusione riguarda solo il contributo di taglio assegnato.

## C2-Q066

Enunciato originale (soli prompt e dati):

Per una parete ferma con condizione di aderenza, la velocità del liquido direttamente a contatto con essa è …

Derivazione indipendente:

L’aderenza impone uguaglianza fra velocità del fluido a contatto e della parete. Poiché la parete è ferma, il valore locale è zero nel suo riferimento. Non si deduce che tutto il liquido sia fermo o che il gradiente alla parete sia nullo. Con una parete mobile cambierebbe il valore di velocità di contatto.

## C2-Q067

Enunciato originale (soli prompt e dati):

Nel profilo parabolico completamente sviluppato di un tubo diritto, dove è massimo il modulo del gradiente radiale di velocità?

Derivazione indipendente:

Derivo il profilo v(r)=v_max(1−r²/R²): dv/dr=−2v_max r/R². Il modulo cresce linearmente da zero sull’asse al massimo sulla parete r=R. Non confondere il massimo della velocità, sull’asse, con quello del suo gradiente. La velocità nulla alla parete non elimina lo sforzo di taglio.

## C2-Q068

Enunciato originale (soli prompt e dati):

Che frazione della velocità massima si misura a r = 0,80R in un profilo di Poiseuille?

Derivazione indipendente:

La frazione locale è v/v_max=1−(r/R)². Con r/R=0,80=4/5: 1−16/25=9/25=0,36. Le unità si cancellano e non serve conoscere R. Il quadrato del rapporto non è direttamente la frazione di velocità, ma il termine che va sottratto da uno.

## C2-Q069

Enunciato originale (soli prompt e dati):

Si ripete una prova raddoppiando il gradiente di velocità e si osserva che lo sforzo cresce di un fattore 1,3. Temperatura, composizione e misura sono controllate. Quale ipotesi è messa in dubbio?

Derivazione indipendente:

Con η newtoniana costante, raddoppiare γ̇ dovrebbe raddoppiare τ. Il fattore osservato 1,3 contraddice quella proporzionalità nelle condizioni controllate. La viscosità apparente nel secondo punto sarebbe η_2/η_1=1,3/2=13/20, minore: è messa in dubbio l’ipotesi di viscosità indipendente dal gradiente, non l’esistenza stessa della viscosità. Non si deduce da soli due punti un’intera legge reologica.

## C2-Q070

Enunciato originale (soli prompt e dati):

Due piastre nel modello di scorrimento lineare hanno velocità relativa e area costanti. Se la distanza passa da 1,0 a 2,5 mm, quale frazione della forza iniziale serve a parità di viscosità?

Derivazione indipendente:

Nel Couette lineare ideale, F=η A V_rel/h. A η, area e velocità relativa non nulla fissate, F_2/F_1=h_1/h_2=1/(5/2)=2/5. Se V_rel fosse zero il rapporto fra due forze nulle non sarebbe definito: la futura candidata deve restare nel ramo di scorrimento. Si confrontano preparazioni con distanze costanti entro ciascuna prova.

## C2-Q071

Enunciato originale (soli prompt e dati):

Una pompa fornisce portata costante. A parità di lunghezza e viscosità il raggio di un tubo di Poiseuille passa da 3 mm a 2 mm. Quanto vale Δp₂/Δp₁?

Derivazione indipendente:

Poiseuille dà Δp=8ηLQ/(πr⁴). Con Q imposto e stessa η, L, il rapporto è Δp_2/Δp_1=(r_1/r_2)⁴=(3/2)⁴=81/16. I millimetri si cancellano nel rapporto. Il regime laminare sviluppato deve restare valido in entrambe le prove: non si estende la legge dopo una transizione non specificata.

## C2-Q072

Enunciato originale (soli prompt e dati):

Due prove hanno lo stesso raggio e la stessa Δp. Nella seconda la viscosità si dimezza e la lunghezza triplica. Se Q₁ = 9 mL/s, quanto vale Q₂?

Derivazione indipendente:

A raggio e Δp fissati, Q è inversamente proporzionale a ηL. La seconda preparazione ha prodotto (η_1/2)(3L_1)=(3/2)η_1L_1: Q_2/Q_1=2/3. Quindi 9·2/3=6 mL/s. Il dimezzamento della viscosità e l’allungamento triplo non si sommano come cambiamenti additivi.

## C2-Q073

Enunciato originale (soli prompt e dati):

In un grafico con Δp sull’asse verticale e Q su quello orizzontale, un tubo di Poiseuille dà una retta per l’origine. Qual è la sua pendenza?

Derivazione indipendente:

Nel grafico con Δp verticale e Q orizzontale la pendenza è Δp/Q=R_h=8ηL/(πr⁴), in Pa·s/m³. La conduttanza 1/R_h sarebbe la pendenza con gli assi scambiati. Il modello è lineare passivo con R_h positiva, non una curva generica che autorizzi ogni regime.

## C2-Q074

Enunciato originale (soli prompt e dati):

A parità di Δp, viscosità e lunghezza, di quale fattore occorre moltiplicare il raggio per triplicare Q?

Derivazione indipendente:

A η, L,Δp fissati, Q_2/Q_1=(r_2/r_1)⁴. Per ottenere tre pongo il rapporto dei raggi alla quarta uguale a tre: r_2/r_1=⁴√3, radice reale positiva. È un risultato esatto e manualmente definito; non occorre un’approssimazione decimale. Usare il fattore tre direttamente sul raggio moltiplicherebbe Q per 81.

## C2-Q075

Enunciato originale (soli prompt e dati):

Un calcolo inserisce nella formula di Poiseuille il diametro d nel posto riservato a r. A parità degli altri dati, quale errore produce sulla Q prevista?

Derivazione indipendente:

Il diametro è d=2r. Inserirlo nel posto del raggio cambia il quarto grado da r⁴ a(2r)⁴=16r⁴: il calcolo sovrastima Q di un fattore 16, a dati fisici invariati. Il flusso reale non cambia perché si è commesso un errore di sostituzione; il risultato errato non è un aumento del16 per cento.

## C2-Q076

Enunciato originale (soli prompt e dati):

Una prova fornisce R_h = 8,0 × 10⁸ Pa·s/m³ e Q = 2,5 mL/s. Quanto vale la caduta di pressione in kPa?

Derivazione indipendente:

Uso Δp=R_hQ e converto 2,5 mL/s in (5/2)·10⁻⁶ m³/s. Il prodotto (8·10⁸)(5/2·10⁻⁶)=20·10²=2000 Pa, cioè 2 kPa. Le unità Pa·s/m³ per m³/s danno Pa; trascurare il prefisso milli e il volume in metri cubi introdurrebbe un fattore enorme.

## C2-Q077

Enunciato originale (soli prompt e dati):

A geometria invariata, quale proprietà del liquido, espressa in Pa·s, raddoppia R_h quando raddoppia?

Derivazione indipendente:

La proprietà è la viscosità dinamica η, espressa in Pa·s. A geometria fissata R_h=8ηL/(πr⁴) è direttamente proporzionale a η. La viscosità cinematica ν ha altre unità e non è identificabile dal solo nome generico viscosità senza distinguere il simbolo e l’unità.

## C2-Q078

Enunciato originale (soli prompt e dati):

Si vuole dedurre η applicando subito il profilo parabolico appena dopo un ingresso brusco. Quale condizione deve essere controllata in particolare?

Derivazione indipendente:

All’ingresso brusco il profilo può essere ancora in sviluppo: prima di usare la parabola occorre verificare il pieno sviluppo idrodinamico del tratto. Laminarità, Newtonianità, stazionarietà e aderenza restano necessarie ma non sostituiscono quella verifica. Deducendo η da una velocità locale con una parabola non ancora raggiunta si confonderebbe la struttura del profilo con il coefficiente del liquido.

## C2-Q079

Enunciato originale (soli prompt e dati):

Un tubo orizzontale dissipativo trasporta 4,0 × 10⁻⁶ m³/s con caduta di 3,0 kPa fra sezioni uguali. Quanta potenza meccanica fornisce questa differenza di pressione?

Derivazione indipendente:

La potenza idraulica fornita dalla caduta di pressione è Δp Q. Converto3,0 kPa in 3000 Pa: 3000·4·10⁻⁶=12·10⁻³ W=3/250 W, cioè 12 mW. Le sezioni uguali e il tubo orizzontale eliminano differenze dei termini cinetici e di quota nel bilancio fra estremi; questa non è automaticamente la potenza elettrica della pompa senza rendimento.

## C2-Q080

Enunciato originale (soli prompt e dati):

Un tubo orizzontale passivo contiene un liquido newtoniano in condizioni di Poiseuille. Se la pressione statica è identica ai due estremi, che cosa prevede il modello stazionario?

Derivazione indipendente:

Con resistenza finita positiva nel modello passivo di Poiseuille, Δp=R_hQ. Identica pressione statica ai due estremi orizzontali impone Δp=0 e quindi Q=0. Non si può mantenere un profilo di Poiseuille non nullo senza gradiente di pressione o altra sorgente di moto. La conclusione non va trasferita al diverso modello inviscido o a pareti in movimento.

## C2-Q081

Enunciato originale (soli prompt e dati):

Tre segmenti laminari consecutivi senza diramazioni hanno resistenze 2, 5 e 1 kPa·s/mL. Con una portata di 1,5 mL/s, quale caduta totale si misura?

Derivazione indipendente:

Per tre resistenze lineari in serie, senza rami o accumulo, la portata è comune e le cadute si sommano. R_tot=2+5+1=8 kPa·s/mL; con Q=3/2 mL/s, Δp_tot=12 kPa. Le singole cadute sono3,15/2 e 3/2 kPa. Il valore riguarda il modello Δp=R_hQ: quote o variazioni cinetiche aggiuntive non devono essere inserite tacitamente nel significato della pressione misurata.

## C2-Q082

Enunciato originale (soli prompt e dati):

Quattro rami identici in parallelo hanno ciascuno resistenza 20 kPa·s/mL. Qual è la resistenza equivalente?

Derivazione indipendente:

Quattro rami identici hanno lo stesso salto di pressione e portate che si sommano: 1/R_eq=4/20, dunque R_eq=5 kPa·s/mL. Non si sommano le quattro resistenze, come si farebbe in serie. La legge lineare di ciascun ramo rende determinata la ripartizione.

## C2-Q083

Enunciato originale (soli prompt e dati):

Due rami indipendenti in parallelo sono fra nodi mantenuti a differenza di pressione costante. Chiudendone uno, che cosa accade alla portata del ramo rimasto aperto, se la sua resistenza resta costante?

Derivazione indipendente:

Con nodi mantenuti alla stessa differenza di pressione prima e dopo la chiusura, il ramo rimasto ha Q=Δp/R_h invariato. La portata totale invece perde il contributo del ramo chiuso. Se la pompa mantenesse la portata totale anziché Δp la conclusione cambierebbe: le condizioni al contorno sono parte essenziale del problema.

## C2-Q084

Enunciato originale (soli prompt e dati):

Due rami identici in parallelo trasportano complessivamente 8 mL/s. Si chiude un ramo e la pompa mantiene la portata totale di 8 mL/s. Di quale fattore cambia il salto di pressione?

Derivazione indipendente:

Prima i due rami identici dividono gli8 mL/s in 4 ciascuno, con resistenza equivalente R/2. Dopo resta un ramo e la pompa impone ancora8: resistenza equivalente R. Quindi il salto di pressione raddoppia. La portata totale non raddoppia; raddoppia quella dell’unico ramo rimasto rispetto a prima.

## C2-Q085

Enunciato originale (soli prompt e dati):

Un tratto da 2 kPa·s/mL è in serie con due rami paralleli ciascuno da 6 kPa·s/mL. Con 20 kPa fra gli estremi, quale portata attraversa il tratto iniziale?

Derivazione indipendente:

Calcolo prima il parallelo: due resistenze6 danno3 kPa·s/mL. In serie col tratto iniziale2, R_tot=5 kPa·s/mL. Con 20 kPa, Q_tot=20/5=4 mL/s e questa stessa portata attraversa il tratto iniziale; ogni ramo finale ne prende2. Controllo:8 kPa nel primo tratto e 12 nel parallelo sommano20.

## C2-Q086

Enunciato originale (soli prompt e dati):

Osserva i collegamenti nello schema: ciascuno dei due condotti parte dal nodo A e arriva al nodo B. Come sono collegati?

Derivazione indipendente:

Dal solo testo, entrambi i condotti collegano il medesimo nodo A al medesimo nodo B: sono in parallelo, qualunque sia la forma del disegno. Hanno comune differenza di pressione, non necessariamente uguale portata se le resistenze sono diverse. La figura originale non è stata aperta nella primaria; la sua effettiva coerenza andrà letta nella revisione successiva.

## C2-Q087

Enunciato originale (soli prompt e dati):

Due rami paralleli hanno resistenza equivalente 3 kPa·s/mL. Il primo ha resistenza 4 kPa·s/mL. Trova quella del secondo.

Derivazione indipendente:

Per il parallelo 1/R_eq=1/R_1+1/R_2. Il residuo è1/3−1/4=1/12, quindi R_2=12 kPa·s/mL. Il ramo passivo richiede R_eq<R_1;3<4 soddisfa il dominio. Controllo:4·12/(4+12)=48/16=3.

## C2-Q088

Enunciato originale (soli prompt e dati):

Quale nome ha la grandezza idraulica G = Q/Δp, additiva per rami in parallelo?

Derivazione indipendente:

G è la conduttanza idraulica, reciproco della resistenza, con unità SI m³/(Pa·s). Nei rami paralleli Q_tot=ΣG_i Δp, perciò G_tot=ΣG_i. Il rapporto misurato Q/Δp richiede Δp non nullo; a pressione nulla la conduttanza del modello lineare si definisce come coefficiente, non ricavando0/0.

## C2-Q089

Enunciato originale (soli prompt e dati):

In due segmenti in serie uno ha il doppio della resistenza dell’altro. In stato stazionario, quale ha maggiore caduta di pressione?

Derivazione indipendente:

In serie la portata è comune e, per flusso non nullo, il segmento con resistenza doppia ha caduta doppia in modulo: Δp=Q R_h. Non ha una portata diversa dal segmento in serie. Se Q=0 entrambe le cadute sono nulle e non c’è una maggiore caduta: la futura candidata deve rendere chiaro il ramo di scorrimento effettivo.

## C2-Q090

Enunciato originale (soli prompt e dati):

Due rami circolari di uguale lunghezza e viscosità sono in parallelo. I raggi sono r e 2r e si applica Poiseuille. Quale frazione della portata totale transita nel ramo stretto?

Derivazione indipendente:

A Δp,η, L comuni, Poiseuille dà Q∝r⁴. Il ramo largo di raggio2r porta16 volte quello stretto. La portata totale è17 volte quella stretta, dunque la frazione chiesta è1/17. Un sedicesimo è il rapporto stretto/largo, non stretto/totale.

## C2-Q091

Enunciato originale (soli prompt e dati):

Perché una piccola goccia libera tende a essere sferica quando la gravità incide poco?

Derivazione indipendente:

Per una goccia libera di volume fissato, tensione superficiale isotropa positiva e gravità trascurabile, la forma sferica minimizza l’area e quindi l’energia libera superficiale γA nel modello assegnato. Non è la minimizzazione del volume: quello è vincolato dalla quantità di liquido. Un supporto o campi esterni potrebbero cambiare la forma, qui esclusi dall’idealizzazione.

## C2-Q092

Enunciato originale (soli prompt e dati):

A temperatura fissata si crea lentamente 3,0 cm² di nuova singola interfaccia di tensione 0,050 N/m. Quanta energia superficiale occorre in microjoule?

Derivazione indipendente:

Una sola interfaccia: ΔA=3·10⁻⁴ m² e γ=1/20 N/m. Il prodotto γΔA=(3/20)·10⁻⁴ J=15·10⁻⁶ J=15 μJ. A temperatura fissata questo è l’incremento dell’energia libera superficiale e il lavoro minimo quasistatico nel modello γ costante. Non si raddoppia l’area come in un film con due facce né si identifica automaticamente tutto ciò con un calore o l’energia interna del liquido.

## C2-Q093

Enunciato originale (soli prompt e dati):

Un film di sapone ha due facce, entrambe di tensione superficiale 0,025 N/m. Le due facce tirano perpendicolarmente un bordo lungo 4 cm. Con quale forza totale?

Derivazione indipendente:

Il film ha due interfacce: ciascuna tira il bordo con γℓ. Con γ=1/40 N/m e ℓ=1/25 m, F_tot=2/(40·25) N=1/500 N=2 mN. Il fattore 2 conta le due facce dichiarate; non si aggiunge un altro fattore per i due estremi del bordo. Le due trazioni sono concordi sul bordo mobile.

## C2-Q094

Enunciato originale (soli prompt e dati):

Un liquido in un capillare verticale ha angolo di contatto 120° misurato attraverso il liquido. Come si dispone il livello interno rispetto a quello esterno?

Derivazione indipendente:

Nel modello capillare statico h=2γ cosθ/(ρgr), con h positivo sopra il livello esterno. L’angolo attraverso il liquido è120°, quindi cosθ=−1/2 e h<0: depressione, livello interno inferiore. Non è una risalita positiva; il segno deriva dall’angolo di contatto, non da una tensione superficiale negativa.

## C2-Q095

Enunciato originale (soli prompt e dati):

Due gocce della stessa sostanza sono sferiche e hanno raggi 1 mm e 4 mm. Se la goccia grande presenta sovrapressione 30 Pa, quanto vale quella piccola?

Derivazione indipendente:

Per due gocce sferiche a singola interfaccia e medesima γ, Δp=2γ/r. Il raggio piccolo è un quarto di quello grande, perciò la sua sovrapressione è quattro volte30 Pa:120 Pa. La γ comune è una condizione da verificare nella futura candidata, non conseguenza universale della sola composizione se cambiasse la temperatura. Non usare il fattore 4 di una bolla di sapone a due facce.

## C2-Q096

Enunciato originale (soli prompt e dati):

Due tubi di ugual raggio contengono lo stesso liquido. Uno ha θ = 0°, l’altro θ = 60°. Come si confrontano le risalite positive?

Derivazione indipendente:

Con r,ρ, g,γ comuni, h∝cosθ. Si ha cos0°=1 e cos60°=1/2, quindi h_60=h_0/2: il primo tubo sale il doppio del secondo. Entrambe le risalite sono positive; non si sommano o sottraggono gli angoli per confrontare le altezze.

## C2-Q097

Enunciato originale (soli prompt e dati):

Nella legge di Laplace un’interfaccia ideale piana, in assenza di altre sollecitazioni interfaciali, ha differenza di pressione di curvatura …

Derivazione indipendente:

Young–Laplace per una sola interfaccia ideale: Δp_curv=γ(1/R_1+1/R_2). Per superficie piana entrambe le curvature sono nulle e il salto di pressione di curvatura è zero. Non implica pressione assoluta nulla o tensione superficiale nulla. Altre trazioni interfaciali sono esplicitamente escluse.

## C2-Q098

Enunciato originale (soli prompt e dati):

In un capillare a bagnamento completo un liquido sale di 20 mm. Un secondo liquido, con stessa densità e angolo ma tensione superficiale pari al 70% della prima, quanto sale?

Derivazione indipendente:

Nella stessa geometria, con uguali densità, gravità e angolo di contatto, h è proporzionale a γ. Quindi h_2/h_1=7/10 e h_2=20·7/10=14 mm. A bagnamento completo il coseno è1; non si inverte la dipendenza dalla tensione superficiale.

## C2-Q099

Enunciato originale (soli prompt e dati):

Otto gocce sferiche identiche di raggio r si fondono senza perdita di liquido in una sola goccia sferica. Quanto vale il rapporto fra area finale e area iniziale complessiva?

Derivazione indipendente:

Conservazione del volume:8·(4πr³/3)=4πR³/3, quindi R³=8r³ e R=2r. Area finale4π(2r)²=16πr²; area iniziale complessiva8·4πr²=32πr². Il rapporto è1/2. Non si confronta l’area finale con quella di una sola goccia né si fa crescere il raggio linearmente con il numero delle gocce.

## C2-Q100

Enunciato originale (soli prompt e dati):

Una bolla sferica di gas si trova all’interno di un liquido. Quale ragionamento individua il fattore nella formula per la sovrapressione capillare?

Derivazione indipendente:

Una bolla di gas immersa in un liquido ha una sola interfaccia gas–liquido. Per una sfera le due curvature principali sono entrambe1/R: Δp=2γ/R. Il2 viene dalle due curvature, non da due superfici. Una bolla di sapone con film sottile e due interfacce darebbe invece circa4γ/R; non è il sistema descritto. Pressione interna maggiore nell’ideale, senza ulteriori membrane o sollecitazioni.
