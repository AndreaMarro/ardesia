# cric-c1-l010 — autoria di dieci problemi distinti

Nuove edizioni degli ID Cric originali, senza produrre varianti Ardesia. Ogni problema è stato letto dal solo enunciato e risolto individualmente; nessuna chiave, opzione, soluzione, hint o figura originale è stata aperta per ricavarne la risposta.

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C1.json, SHA 0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf. Lezioni C1-L006–L010 effettive lette integralmente, con prerequisiti e contenuto reali. Famiglia, difficoltà, prerequisiti, identità, ordine, corso, skill ed eventuale flag exam sono conservati per ciascun ID. baseVersion è la versione individuale della fonte e version=baseVersion+1.

Primarie reciproche congelate prima dei candidati: B sui cinquanta A001–050 commit a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; A sui cinquanta B051–100 commit 227d4a08, SHA 1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1. La primaria A è stata ricevuta solo come hash/percorso e non letta durante l’autoria.

Una sola pipeline: assemble_family originale esteso dal Root, non un nuovo importatore. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file è copiato byte-esatto per riprodurre l’assembly locale e non attribuito a questa autoria. Due assembly identiche, importatore canonico con budget originale 60 s, SQLite temporaneo: dieci nuove edizioni DRAFT, poi zero nuove/dieci invariate; tutti i 991 pubblicati e i live head storici restano invariati.

Le tre operazioni effettive sono terminali 0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto dall’autore insieme all’XML: evidenza asset-only, non UI del prodotto. Nessuna review scientifica propria o approvazione umana; tutto DRAFT, SCI/UI prodotto/human NOT_RUN.

## C1-Q091 — Una coordinata pesata dalle masse

Versione 2, base 1; famiglia spostare-il-centro-di-massa; difficoltà 2.

Scelta del modello e procedura: Il centro di massa è la media delle coordinate pesata con le masse, non la media semplice dei due estremi. Il primo contributo è nullo perché x_1=0; il secondo è 3·0,80=2,4 kg·m. Divido per la massa totale 4 kg e ottengo 0,60=3/5 m, più vicino alla massa maggiore e compreso fra le due coordinate.

Passaggi manuali: x_{\rm CM}=\frac{m_1x_1+m_2x_2}{m_1+m_2};  x_{\rm CM}=\frac{3\cdot(4/5)}4\,\mathrm m;  x_{\rm CM}=\frac35\,\mathrm m

Risposta proposta: 3/5 m.

Confutazioni proposte: 2/5 m sarebbe il punto medio senza pesi. 4/5 m coincide con la seconda massa e 1/5 la avvicina a quella leggera. 12/5 m copia il numeratore come coordinata e cade persino fuori dall’intervallo fra le masse.

## C1-Q092 — Il braccio è una distanza perpendicolare

Versione 2, base 1; famiglia distanza-corretta-per-il-momento; difficoltà 2.

Scelta del modello e procedura: Il momento è il prodotto vettoriale r×F. In modulo compare la componente di r perpendicolare alla forza: b=r sinα. È la distanza più breve dal perno alla retta lungo cui agisce la forza. Soltanto per α=90° il braccio coincide con tutta la distanza r.

Passaggi manuali: |\tau|=rF\sin\alpha;  b=r\sin\alpha;  |\tau|=Fb

Risposta proposta: Il braccio b=r sinα, distanza del perno dalla retta d’azione.

Confutazioni proposte: r senza il seno funziona soltanto nel caso perpendicolare. r cosα è la proiezione parallela alla forza e si annulla proprio quando il momento è massimo. rF non è una lunghezza e la strada percorsa non determina il braccio istantaneo.

## C1-Q093 — Una forza sulla maniglia

Versione 2, base 1; famiglia forza-inclinata-sulla-maniglia; difficoltà 2.

Scelta del modello e procedura: La distanza dalla cerniera non coincide col braccio perché la forza è obliqua. Il braccio è 0,40 sin30°=0,20 m; moltiplicandolo per 15 N ottengo 3 N·m. La domanda chiede il modulo: il segno di rotazione richiederebbe anche una convenzione orientata e il verso geometrico della forza.

Passaggi manuali: b=r\sin30^\circ;  b=\frac25\cdot\frac12\,\mathrm m;  b=\frac15\,\mathrm m;  |\tau|=15\cdot\frac15\,\mathrm{N\,m};  |\tau|=3\,\mathrm{N\,m}

Risposta proposta: 3 N·m.

Confutazioni proposte: Sei N·m ometterebbe il seno e tratterebbe la forza come perpendicolare. 3√3 N·m userebbe il coseno al posto del seno; 0,20 m è il braccio da moltiplicare ancora per la forza.

## C1-Q094 — Due forze opposte su rette diverse

Versione 3, base 2; famiglia una-coppia-di-forze; difficoltà 2.

Scelta del modello e procedura: Le due forze si cancellano nella somma vettoriale ma non nel momento: le rette distinte hanno separazione perpendicolare d>0. Il modulo del momento della coppia è Fd, indipendente dal polo. Il centro di massa non accelera per questa risultante nulla, mentre il momento produce un effetto rotazionale; il corpo può comunque avere già una velocità traslatoria.

Passaggi manuali: \vec F_1+\vec F_2=0;  |\tau_{\rm coppia}|=Fd;  d>0

Risposta proposta: Risultante nulla e momento non nullo: una coppia di forze.

Confutazioni proposte: Risultante nulla non implica momento nullo quando le rette sono distinte. Il fattore due non si applica a forze opposte nella risultante. Sostituire la coppia con una sola forza non nulla cambierebbe l’accelerazione del centro di massa.

## C1-Q095 — La reazione lontana dal carico

Versione 3, base 2; famiglia reazione-alla-seconda-estremita; difficoltà 2.

Scelta del modello e procedura: Scelgo come polo l’appoggio sinistro, così la sua reazione ha braccio nullo. La reazione destra a 2 m deve equilibrare il momento del peso a mezzo metro: R_D·2=30·(1/2). Ricavo R_D=15/2 N. La somma verticale fornisce poi R_S=45/2 N, coerentemente maggiore perché il carico è vicino a sinistra.

Passaggi manuali: R_D\ell=P a;  R_D=\frac{30\cdot(1/2)}2\,\mathrm N;  R_D=\frac{15}{2}\,\mathrm N;  R_S=30\,\mathrm N-R_D

Risposta proposta: 15/2 N.

Confutazioni proposte: 45/2 N è la reazione sinistra, non quella destra. Quindici dividerebbe il carico ugualmente benché non sia al centro. Trenta attribuirebbe tutto il peso all’appoggio destro e sessanta non soddisferebbe il bilancio verticale.

## C1-Q096 — Le forze interne non accelerano il totale

Versione 2, base 1; famiglia il-moto-del-sistema-intero; difficoltà 2.

Scelta del modello e procedura: Per il centro di massa uso M a_CM=F_est, con tutta la massa del sistema. Le interazioni fra carrelli sono interne e si cancellano nella somma, anche se ciascun carrello può avere un moto diverso. Divido 18 N per 12 kg e ottengo 3/2 m/s² nella direzione della risultante.

Passaggi manuali: Ma_{\rm CM}=F_{\rm est};  a_{\rm CM}=\frac{18\,\mathrm N}{12\,\mathrm{kg}};  a_{\rm CM}=\frac32\,\mathrm{m/s^2}

Risposta proposta: 3/2 m/s².

Confutazioni proposte: 2/3 inverte forza e massa; sei dividerebbe per il numero dei carrelli anziché per la massa totale. Diciotto copia la forza come accelerazione e zero ignorerebbe la risultante esterna non nulla.

## C1-Q097 — Un corpo può ruotare senza deformarsi

Versione 2, base 1; famiglia il-modello-indeformabile; difficoltà 1.

Scelta del modello e procedura: La costanza delle distanze reciproche definisce il corpo rigido ideale. I punti possono cambiare posizione nel laboratorio durante una traslazione o una rotazione, ma non si avvicinano e non si allontanano gli uni dagli altri. È un’idealizzazione che trascura le deformazioni, non il moto.

Passaggi manuali: |\vec r_i-\vec r_j|=\text{costante nel tempo}

Risposta proposta: Corpo rigido.

Confutazioni proposte: Un punto materiale trascura l’estensione e non descrive distanze interne. Rigido non significa fermo; un fluido può cambiare forma e la definizione non elimina la massa.

## C1-Q098 — Cambiare il polo in equilibrio

Versione 2, base 1; famiglia equilibrio-con-fulcro-diverso; difficoltà 3.

Scelta del modello e procedura: Indico con a il vettore da O a O′ e con R la risultante esterna. Spostando il polo, la differenza Δτ fra momento nuovo e vecchio vale −a×R. Poiché questa risultante è zero, il termine aggiuntivo è nullo. Dunque un sistema con risultante nulla e momento nullo rispetto a O ha momento nullo anche rispetto a O′.

Passaggi manuali: \Delta\vec\tau=-\vec a\times\vec R;  \vec R=0;  \Delta\vec\tau=0;  \vec\tau_{O^\prime}=0

Risposta proposta: Il momento totale resta nullo.

Confutazioni proposte: La distanza fra i poli da sola non crea un momento: conta anche la risultante. Un raddoppio o un’inversione automatica del segno non segue dalla trasformazione. La condizione di risultante nulla è essenziale per trasferire in questo modo il momento.

## C1-Q099 — Un braccio muscolare più lungo

Versione 2, base 1; famiglia che-cosa-succede-piegando-il-gomito; difficoltà 2.

Scelta del modello e procedura: Il momento muscolare deve compensare lo stesso momento resistente: F b=6 N·m. Porto i bracci in metri: 3/100 m e 1/25 m. La forza passa da 200 N a 150 N; la diminuzione è 200−150=50 N. Il confronto descrive una leva ideale con momento imposto, non una previsione clinica su un arto reale.

Passaggi manuali: F_A=\frac{6}{3/100}\,\mathrm N;  F_A=200\,\mathrm N;  F_B=\frac{6}{1/25}\,\mathrm N;  F_B=150\,\mathrm N;  F_A-F_B=50\,\mathrm N

Risposta proposta: 50 N.

Confutazioni proposte: 150 N è la nuova forza, non la sua diminuzione; 200 N quella iniziale. Sottrarre direttamente 4−3 cm non determina una differenza di forza, perché il braccio entra al denominatore. Il momento resta 6 N·m in entrambe le prove.

## C1-Q100 — Il segno di una rotazione oraria

Versione 2, base 1; famiglia il-segno-di-una-rotazione; difficoltà 1.

Scelta del modello e procedura: Il vettore posizione dal fulcro al punto d’applicazione è verso destra e la forza è verso il basso. La coppia geometrica tende a far scendere l’estremità destra: è una rotazione oraria. Con la convenzione antioraria positiva, il momento è quindi negativo; in componenti τ_z=r_xF_y<0.

Passaggi manuali: r_x>0;  F_y<0;  \tau_z=r_xF_y;  \tau_z<0

Risposta proposta: Negativo, perché tende a ruotare in senso orario.

Confutazioni proposte: Essere a destra non basta a rendere positivo il momento: serve anche il verso della forza. La verticalità non annulla il braccio orizzontale e il modulo non può cambiare il segno fissato dalla geometria.
