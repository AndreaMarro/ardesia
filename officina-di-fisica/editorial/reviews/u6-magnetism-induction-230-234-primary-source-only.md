# Primaria indipendente U6-05 — lotti A230–234

Stato: 80 derivazioni individuali dei soli prompt originali, congelate prima di candidati, opzioni, chiavi, solutionSteps, hints o SVG A230–234. Nessun PASS di candidati e nessuna approvazione umana.

Disclosure: tutti gli 80 prompt A sono stati letti individualmente tramite allowlist id/prompt/familyId/lawFamily dal Git immutabile. Nessuna chiave, opzione, soluzione originale, candidato, SVG o primaria dell’autore A U6-05 è stata aperta. Le sole anticipazioni sono nomi delle famiglie, ownership e hash della fonte; nessun risultato numerico è stato anticipato da A. I cataloghi C4-L09 e C4-L10 sono stati letti come fondamenti disciplinari. I precedenti lotti U6 non costituiscono esposizione alle risposte di questi 80 ID.

Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json. Raw SHA256 383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Snapshot allowlist160 SHA256 53a5f54bc7ec7e99f2580a5ccbb94a8a4dea93ae929fac86e538bdedb1067606. Esattamente 16 prompt per ciascuna delle cinque famiglie autorizzate.

Metodo: leggi fisiche e sostituzioni manuali esatte, senza eseguire codice d’autore o leggere altre primarie. Ogni testo originale è riprodotto sotto; gli eventuali separatori letterali \n del JSON sono resi come a capo. I conteggi di questa primaria non attribuiscono credito ai futuri candidati. Tarature e medie riguardano prove distinte; le unità strumentali non sono implicitamente unità SI. I coefficienti di normalizzazione conservano le dimensioni nella legge delle grandezze fisiche. Si distingue T_orbita da τ=T_orbita/(2π), angolo rispetto alla normale da angolo rispetto al piano, e moto parallelo da perpendicolare.

Catalogo Cric: pin 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L09 tratta Lorentz, forza sul filo e moto circolare; C4-L10 tratta flusso e induzione, con prerequisiti effettivi C4-L05 e C4-L09. Le scelte didattiche dei futuri candidati saranno verificate sul testo effettivo, non sulla sola appartenenza alla famiglia.

## u6-force-current-wire-01

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Sono assegnati I = 2 A e L = 3 cm. Quanto vale forza sul tratto (F) in mN?

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mN.

Derivazione primaria indipendente:

La forza sul tratto rettilineo è il modulo di Iℓ×B: F=BIL perché filo e campo sono perpendicolari. Convertendo 3 cm in 3/100 m, F=1·2·3/100 N=6/100 N=60 mN. È la forza sul segmento, non necessariamente la risultante su un circuito chiuso.

## u6-force-current-wire-02

Prompt originale:

Nell’argomento «Forza su un filo percorso da corrente» si considera forza sul tratto. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Una forza si esprime in newton: N=kg·m/s². Il millinewton è 10⁻³ N e conserva la stessa dimensione. Tesla, ampere e lunghezza compaiono nel prodotto BIL, non sono separatamente unità di forza.

## u6-force-current-wire-03

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente F nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Il prodotto vettoriale dà F=BIL sin90°=BIL. Se i simboli denotano i soli valori numerici nelle unità richieste, F/(mN)=10[I/(A)][L/(cm)]. Il fattore 10 nasce da 10⁻² m/cm e 10³ mN/N; non è un fattore fisico adimensionale da usare indiscriminatamente con simboli SI.

## u6-force-current-wire-04

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Si passa da I = 2 A a I = 1 A, mantenendo L = 3 cm e le altre condizioni fisse. Che cosa accade a forza sul tratto?

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

A B e L fissati, F è proporzionale a I. Passando da 2 A a 1 A si passa da 60 mN a 30 mN: F_B/F_A=1/2. La linearità riguarda il modulo nelle condizioni perpendicolari assegnate.

## u6-force-current-wire-05

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

La misura di forza sul tratto è 60 mN; si conosce L = 3 cm. Determina corrente nel filo nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è A.

Derivazione primaria indipendente:

Da F=BIL si ottiene I=F/(BL). In SI, I=(60/1000 N)/[(1 T)(3/100 m)]=2 A. Il denominatore è positivo e non nullo nel dominio dichiarato.

## u6-force-current-wire-06

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

La misura di forza sul tratto è 60 mN; si conosce I = 2 A. Determina lunghezza nel campo nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è cm.

Derivazione primaria indipendente:

Isolo L=F/(BI). La sostituzione dà (60/1000 N)/[(1 T)(2 A)]=3/100 m=3 cm. La conversione finale è necessaria perché il quesito chiede centimetri.

## u6-force-current-wire-07

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Nello stato A: I = 2 A, L = 3 cm. Nello stato B rimane I = 2 A, mentre L = 1 cm. Calcola il rapporto F_B/F_A.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Con B e I invariati il rapporto delle forze coincide con quello delle lunghezze: F_B/F_A=L_B/L_A=1/3. Separatamente si trovano 20 mN e 60 mN; il rapporto non ha unità.

## u6-force-current-wire-08

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Con I = 2 A e L = 3 cm, una soluzione propone F_proposto = 120 mN. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Il valore fisico corretto è 60 mN. Lo scarto ordinato come proposto meno corretto è 120−60=+60 mN. Il segno positivo identifica la sovrastima, non una direzione spaziale della forza.

## u6-force-current-wire-09

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Si misura F e si conoscono le altre quantità della relazione F = BIL; con B = 1 T, F[mN] = 10 I[A] L[cm]. Quale formula isola I nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Dividendo F=BIL per BL, positivo, si ottiene I=F/(BL). Per i valori numerici normalizzati si ha I/(A)=[F/(mN)]/{10[L/(cm)]}. Scrivere soltanto F/L con grandezze fisiche ometterebbe B e altererebbe le dimensioni.

## u6-force-current-wire-10

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Da uno stato A con grandezze I e L si passa a uno stato B in cui I_B = κ₁·I e L_B = κ₂·L. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto F_B/F_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Nei due stati B, orientazione e geometria rettilinea restano le stesse. Dividendo B(κ₁I)(κ₂L) per BIL si cancellano tutti i parametri originari e resta κ₁κ₂. I fattori sono positivi e il denominatore è non nullo.

## u6-force-current-wire-11

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Nello stato iniziale A si hanno I = 2 A e L = 3 cm. Nello stato B si hanno I = 1 A e L = 4 cm. Qual è il rapporto F_B/F_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Calcolo prima entrambe le forze: F_A=10·2·3=60 mN e F_B=10·1·4=40 mN. Il rapporto F_B/F_A è 40/60=2/3. La variazione della lunghezza impedisce di usare soltanto il rapporto delle correnti.

## u6-force-current-wire-12

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Si registrano due letture con uguale peso statistico. La prima usa I = 2 A, L = 3 cm; la seconda usa I = 1 A, L = 4 cm. Qual è la media aritmetica delle due letture di forza sul tratto? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Le due letture sono 60 e 40 mN e hanno uguale peso: la media è (60+40)/2=50 mN. Come controllo di non linearità congiunta, il modello agli ingressi medi I=3/2 A e L=7/2 cm dà 10·(3/2)·(7/2)=105/2 mN; media delle uscite meno questo valore è −5/2 mN. Non si scambiano i due procedimenti.

## u6-force-current-wire-13

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

La condizione iniziale è I = 2 A, L = 3 cm. Si impone poi I = 1 A e si vuole che la grandezza d’uscita diventi 2/3 volte quella iniziale. Quale rapporto L_B/L_A è necessario?

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

La forza richiesta è (2/3)·60=40 mN. Con I_B=1 A, 10·1·L_B/(cm)=40 impone L_B=4 cm. Il rapporto cercato è 4/3; sostituendo si recupera esattamente il fattore 2/3 nell’uscita.

## u6-force-current-wire-14

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Uno strumento misura F con legge S_strum = a_cal·F, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento I = 2 A, L = 3 cm, legge S_strum=180. In una nuova prova legge S_strum=120 e si conosce L = 4 cm. Determina corrente nel filo nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è A.

Derivazione primaria indipendente:

Il riferimento dà F=60 mN e S=180, quindi il guadagno è 3 unità strumentali per mN. La nuova lettura S=120 corrisponde a F=40 mN; con L=4 cm, I=40/(10·4) A=1 A. Le unità strumentali restano le medesime, non sono implicitamente newton.

## u6-force-current-wire-15

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

Lo strumento obbedisce a S_strum = a_cal·F + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: I = 2 A, L = 3 cm, S_strum=121. Riferimento B: I = 1 A, L = 4 cm, S_strum=81. Prova C: L = 5 cm, S_strum=401. Trova corrente nel filo nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

I riferimenti fisici sono 60 e 40 mN. Sottraendo le due equazioni di taratura: 121−81=a(60−40), dunque a=2 unità strumentali/mN; b=121−2·60=1 unità strumentale. S_C=401 dà F_C=(401−1)/2=200 mN. Con L_C=5 cm si ricava I_C=200/(10·5)=4 A.

## u6-force-current-wire-16

Prompt originale:

Un tratto rettilineo di filo lungo L centimetri porta corrente I ampere ed è perpendicolare a un campo uniforme B = 1 T. Si cerca il modulo della forza in mN.

I valori numerici nelle unità dichiarate devono soddisfare I = 2/3·L. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è F=60 mN. Determina lunghezza nel campo nel dominio fisico positivo.

Ipotesi e convenzioni: B = 1 T uniforme Filo perpendicolare al campo I valori numerici rispettano: I > 0 e L > 0.

Derivazione primaria indipendente:

Pongo l=L/(1 cm)>0; il vincolo dimensionato è I=(2/3 A/cm)L e quindi I/(A)=2l/3. La legge normalizzata dà 60=10·(2l/3)l=(20/3)l², perciò l²=9. Il dominio seleziona l=3, cioè L=3 cm e I=2 A. La radice negativa è estranea al ramo fisico.

## u6-magnetic-circle-radius-01

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Sono assegnati v = 2 m/s e B = 1 T. Quanto vale raggio orbitale (r) in m?

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m.

Derivazione primaria indipendente:

La forza magnetica perpendicolare ha modulo |q|vB ed è centripeta: |q|vB=mv²/r. Poiché v>0, r=mv/(|q|B). Qui m=10⁻⁶ kg e |q|=10⁻⁶ C, quindi m/|q|=1 kg/C; con v=2 m/s e B=1 T si ottiene r=2 m.

## u6-magnetic-circle-radius-02

Prompt originale:

Nell’argomento «Moto circolare in campo magnetico» si considera raggio orbitale. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Il raggio è una lunghezza, dunque l’unità dimensionalmente pertinente è il metro. Da mv/(|q|B), usando T=kg/(C·s), si ottiene m. Un prefisso non modifica questa dimensione.

## u6-magnetic-circle-radius-03

Prompt originale:

Due particelle hanno uguali massa, modulo della carica e velocità iniziale, perpendicolare allo stesso campo magnetico. Le cariche hanno segno opposto. Come si confrontano le traiettorie?

Ipotesi e convenzioni: Valgono esclusivamente le condizioni esplicitate nella domanda concettuale.

Derivazione primaria indipendente:

La forza qv×B cambia verso cambiando il segno di q, mentre il suo modulo è uguale. Le due traiettorie hanno lo stesso raggio mv/(|q|B), ma curvatura e verso di rotazione opposti rispetto al campo. Non è assegnata una posizione iniziale comune: non la si aggiunge per fissare i centri. Se fosse comune anche la posizione, i centri sarebbero sui lati opposti della tangente iniziale.

## u6-magnetic-circle-radius-04

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Si passa da v = 2 m/s a v = 3 m/s, mantenendo B = 1 T e le altre condizioni fisse. Che cosa accade a raggio orbitale?

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

A massa, modulo della carica e B costanti, r è lineare nella rapidità. Da 2 a 3 m/s il raggio passa da 2 a 3 m: il fattore è 3/2. Il campo magnetico devia la velocità senza aumentarne il modulo durante ciascuna prova.

## u6-magnetic-circle-radius-05

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

La misura di raggio orbitale è 2 m; si conosce B = 1 T. Determina modulo della velocità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m/s.

Derivazione primaria indipendente:

Da r=mv/(|q|B) segue v=|q|Br/m. Inserendo r=2 m, B=1 T e m/|q|=1 kg/C si ricava v=2 m/s. Tutti i dati sono positivi, coerenti con il ramo del modulo della velocità.

## u6-magnetic-circle-radius-06

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

La misura di raggio orbitale è 2 m; si conosce v = 2 m/s. Determina campo magnetico nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è T.

Derivazione primaria indipendente:

Isolo B=mv/(|q|r). Con v=2 m/s e r=2 m si ottiene B=1 T. Il raggio positivo evita la divisione per zero e il modulo B è positivo.

## u6-magnetic-circle-radius-07

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Nello stato A: v = 2 m/s, B = 1 T. Nello stato B rimane v = 2 m/s, mentre B = 2 T. Calcola il rapporto r_B/r_A.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

A v fissata il raggio varia inversamente con B: r_B/r_A=B_A/B_B=1/2. I due raggi sono rispettivamente 2 m e 1 m. Aumentare il campo accresce la curvatura, non il raggio.

## u6-magnetic-circle-radius-08

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Con v = 2 m/s e B = 1 T, una soluzione propone r_proposto = 4 m. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

La legge fisica dà r=2 m. Lo scarto con la convenzione richiesta è 4−2=+2 m. Il segno indica una sovrastima del raggio proposto.

## u6-magnetic-circle-radius-09

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Si misura r e si conoscono le altre quantità della relazione |q|vB = mv²/r; r = mv/(|q|B); qui m/|q| = 1 kg/C. Quale formula isola v nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

La relazione centripeta si riduce, per v>0, a r=mv/(|q|B); moltiplico per |q|B/m e ottengo v=|q|Br/m. L’identità numerica v/(m/s)=[r/(m)][B/(T)] vale grazie al rapporto assegnato m/|q|, non autorizza a eliminare le dimensioni di quel rapporto nella legge fisica.

## u6-magnetic-circle-radius-10

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Da uno stato A con grandezze v e B si passa a uno stato B in cui v_B = κ₁·v e B_B = κ₂·B. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto r_B/r_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

La massa e il modulo della carica si cancellano nel rapporto dei due raggi. Resta (κ₁v)/(κ₂B) diviso v/B, cioè κ₁/κ₂. Entrambe le prove devono mantenere velocità perpendicolare e regime non relativistico.

## u6-magnetic-circle-radius-11

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Nello stato iniziale A si hanno v = 2 m/s e B = 1 T. Nello stato B si hanno v = 6 m/s e B = 2 T. Qual è il rapporto r_B/r_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il raggio iniziale è 2/1=2 m; quello finale è 6/2=3 m nelle unità normalizzate assegnate. Il rapporto è 3/2. I fattori separati danno lo stesso controllo: 3/2 per la rapidità e il campo combinati, cioè 3 diviso 2.

## u6-magnetic-circle-radius-12

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Si registrano due letture con uguale peso statistico. La prima usa v = 2 m/s, B = 1 T; la seconda usa v = 6 m/s, B = 2 T. Qual è la media aritmetica delle due letture di raggio orbitale? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

Le letture fisiche sono 2 e 3 m: la media è 5/2 m. Il modello valutato invece su v medio 4 m/s e B medio 3/2 T dà 8/3 m. La differenza fra media delle letture e valore agli ingressi medi è 5/2−8/3=−1/6 m; i due procedimenti non coincidono.

## u6-magnetic-circle-radius-13

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

La condizione iniziale è v = 2 m/s, B = 1 T. Si impone poi v = 6 m/s e si vuole che la grandezza d’uscita diventi 3/2 volte quella iniziale. Quale rapporto B_B/B_A è necessario?

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Si vuole r_B=(3/2)·2 m=3 m con v_B=6 m/s. Da B=mv/(|q|r) segue B_B=2 T. Poiché B_A=1 T, il rapporto B_B/B_A è 2. Sostituire questo campo nel modello restituisce il raggio richiesto.

## u6-magnetic-circle-radius-14

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Uno strumento misura r con legge S_strum = a_cal·r, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento v = 2 m/s, B = 1 T, legge S_strum=6. In una nuova prova legge S_strum=9 e si conosce B = 2 T. Determina modulo della velocità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m/s.

Derivazione primaria indipendente:

La lettura di riferimento S=6 corrisponde a r=2 m: a=3 unità strumentali/m. S=9 implica r=3 m. Con B=2 T, v=|q|Br/m=6 m/s. Non si identifica la lettura strumentale con un raggio prima della taratura.

## u6-magnetic-circle-radius-15

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

Lo strumento obbedisce a S_strum = a_cal·r + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: v = 2 m/s, B = 1 T, S_strum=5. Riferimento B: v = 6 m/s, B = 2 T, S_strum=7. Prova C: B = 1 T, S_strum=3. Trova modulo della velocità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

Dai punti (r,S)=(2 m,5),(3 m,7) si ottiene a=(7−5)/(3−2)=2 unità strumentali/m e b=1. La lettura 3 implica r=(3−1)/2=1 m. A B=1 T si ricava v=1 m/s. I riferimenti hanno raggi distinti, quindi la taratura affine è determinata.

## u6-magnetic-circle-radius-16

Prompt originale:

Una particella ideale ha massa m = 1 mg e modulo della carica |q| = 1 μC. Entra perpendicolarmente in un campo uniforme B con velocità v. Si cerca il raggio della traiettoria in metri.

I valori numerici nelle unità dichiarate devono soddisfare v = 2·B. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre r=2 m. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Moto non relativistico Velocità perpendicolare a B Campo uniforme m = 1 mg e |q| = 1 μC I valori numerici rispettano: v > 0 e B > 0.

Derivazione primaria indipendente:

Il vincolo dimensionato v=(2 m·s⁻¹·T⁻¹)B rende r=2 m identicamente per tutti i B positivi compatibili col regime non relativistico. La misura è dunque ridondante e restano infinite coppie continue: per esempio (B,v)=(1 T,2 m/s) e (2 T,4 m/s). Non sono conteggi interi e non si pretende validità non relativistica a velocità arbitrariamente grandi.

## u6-accelerated-magnetic-radius-01

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Sono assegnati U = 2 V e B = 1 T. Quanto vale raggio della traiettoria (r) in m?

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m.

Derivazione primaria indipendente:

Nella regione elettrica il lavoro favorevole |q|U diventa energia cinetica da fermo: |q|U=mv²/2. Con |q|/m=1 C/kg e U=2 V si trova v=2 m/s. Nella regione magnetica distinta, r=mv/(|q|B); a B=1 T si ottiene r=2 m. Il campo magnetico non aggiunge energia cinetica.

## u6-accelerated-magnetic-radius-02

Prompt originale:

Nell’argomento «Accelerazione elettrica e deviazione magnetica» si considera raggio della traiettoria. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La grandezza cercata è una lunghezza, espressa in metri. La legge combinata r=√(2mU/|q|)/B ha dimensione di lunghezza; i coefficienti numerici assegnati non eliminano i fattori dimensionati.

## u6-accelerated-magnetic-radius-03

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente r nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Combino il bilancio elettrico da fermo con la forza centripeta: v=√(2|q|U/m), poi r=mv/(|q|B)=√(2mU/|q|)/B. La radice positiva esprime una rapidità. Con u=U/(1 V), b=B/(1 T), il raggio normalizzato è r/(1 m)=√(2u)/b, grazie al rapporto fisico |q|/m=1 C/kg.

## u6-accelerated-magnetic-radius-04

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Si passa da U = 2 V a U = 8 V, mantenendo B = 1 T e le altre condizioni fisse. Che cosa accade a raggio della traiettoria?

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Quadruplicare U da 2 a 8 V raddoppia v, perché v² è proporzionale a U. Con B=1 T il raggio raddoppia da 2 a 4 m. Il fattore quattro non va applicato direttamente al raggio.

## u6-accelerated-magnetic-radius-05

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

La misura di raggio della traiettoria è 2 m; si conosce B = 1 T. Determina tensione acceleratrice nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Quadrando rB=√(2mU/|q|) e isolando U: U=|q|r²B²/(2m). Per r=2 m e B=1 T, con il rapporto assegnato, U=2 V. U>0 e B>0 rendono valida la selezione del ramo iniziale.

## u6-accelerated-magnetic-radius-06

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

La misura di raggio della traiettoria è 2 m; si conosce U = 2 V. Determina campo della seconda regione nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è T.

Derivazione primaria indipendente:

Dalla legge combinata B=√(2mU/|q|)/r. Con U=2 V e r=2 m si trova B=1 T. Si sceglie il modulo positivo del campo, non una soluzione negativa introdotta elevando al quadrato.

## u6-accelerated-magnetic-radius-07

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Nello stato A: U = 2 V, B = 1 T. Nello stato B rimane U = 2 V, mentre B = 2 T. Calcola il rapporto r_B/r_A.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

A U invariata la rapidità di ingresso è uguale, mentre B raddoppia da 1 a 2 T. I raggi sono 2 e 1 m e il rapporto è 1/2. Il lavoro elettrico resta identico nelle due prove.

## u6-accelerated-magnetic-radius-08

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Con U = 2 V e B = 1 T, una soluzione propone r_proposto = 4 m. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Il valore corretto è 2 m; quello proposto è 4 m. Lo scarto proposto meno corretto è +2 m. La sottrazione conserva l’unità di lunghezza.

## u6-accelerated-magnetic-radius-09

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Si misura r e si conoscono le altre quantità della relazione v = √(2|q|U/m); r = mv/(|q|B); per |q|/m = 1 C/kg, r = √(2U)/B. Quale formula isola U nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Da r²B²=2mU/|q| ottengo U=|q|r²B²/(2m). In numeri normalizzati u=(r/(1 m))²b²/2. La dipendenza è quadratica sia nel raggio sia nel campo; il rapporto dimensionato |q|/m rimane nella legge fisica.

## u6-accelerated-magnetic-radius-10

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Da uno stato A con grandezze U e B si passa a uno stato B in cui U_B = κ₁·U e B_B = κ₂·B. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto r_B/r_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Per le due prove valide r_B/r_A=√(U_B/U_A)·B_A/B_B=√κ₁/κ₂. Questo confronto usa lo stesso rapporto |q|/m, partenza da fermo e regioni separate; non presuppone una forza magnetica che compia lavoro.

## u6-accelerated-magnetic-radius-11

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Nello stato iniziale A si hanno U = 2 V e B = 1 T. Nello stato B si hanno U = 1 V e B = 2 T. Qual è il rapporto r_B/r_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

In A, r_A=√4/1=2 m. In B, U=1 V e B=2 T danno r_B=√2/2 m. Il rapporto è (√2/2)/2=√2/4. Si conserva il radicale esatto, senza conversione decimale.

## u6-accelerated-magnetic-radius-12

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Si registrano due letture con uguale peso statistico. La prima usa U = 2 V, B = 1 T; la seconda usa U = 1 V, B = 2 T. Qual è la media aritmetica delle due letture di raggio della traiettoria? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Calcolo le due uscite 2 m e √2/2 m prima di farne la media: (2+√2/2)/2=1+√2/4 m. La risposta agli ingressi medi U=3/2 V e B=3/2 T sarebbe invece √3/(3/2)=2√3/3 m. Sono costruzioni diverse e non si sostituisce la seconda alla prima.

## u6-accelerated-magnetic-radius-13

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

La condizione iniziale è U = 2 V, B = 1 T. Si impone poi U = 1 V e si vuole che la grandezza d’uscita diventi √(2)/4 volte quella iniziale. Quale rapporto B_B/B_A è necessario?

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il raggio richiesto è (√2/4)·2=√2/2 m. Con U_B=1 V, B_B=√2/(√2/2) T=2 T. Pertanto B_B/B_A=2. Il fattore cercato è razionale anche se il raggio intermedio è irrazionale.

## u6-accelerated-magnetic-radius-14

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Uno strumento misura r con legge S_strum = a_cal·r, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento U = 2 V, B = 1 T, legge S_strum=6. In una nuova prova legge S_strum=3·√(2)/2 e si conosce B = 2 T. Determina tensione acceleratrice nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Il riferimento r=2 m con S=6 dà a=3 unità strumentali/m. S=3√2/2 corrisponde a r=√2/2 m. Con B=2 T, U=|q|r²B²/(2m)=1 V. Il radicale si elimina elevando esattamente al quadrato, non approssimandolo.

## u6-accelerated-magnetic-radius-15

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

Lo strumento obbedisce a S_strum = a_cal·r + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: U = 2 V, B = 1 T, S_strum=5. Riferimento B: U = 1 V, B = 2 T, S_strum=1 + √(2). Prova C: B = 1 T, S_strum=9. Trova tensione acceleratrice nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

I riferimenti fisici hanno r_A=2 m e r_B=√2/2 m. La differenza delle letture è 4−√2 e quella dei raggi è (4−√2)/2 m; quindi a=2 unità strumentali/m e b=1. S_C=9 implica r_C=4 m; con B=1 T risulta U_C=8 V. La taratura coinvolge riferimenti algebrici esatti e non un arrotondamento razionale.

## u6-accelerated-magnetic-radius-16

Prompt originale:

Una particella ideale con rapporto |q|/m = 1 C/kg parte da ferma e viene accelerata da una differenza di potenziale favorevole U. Poi entra perpendicolarmente in un campo B, senza altri campi. Si cerca il raggio in metri.

I valori numerici nelle unità dichiarate devono soddisfare U = 2·B. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è r=2 m. Determina campo della seconda regione nel dominio fisico positivo.

Ipotesi e convenzioni: Regioni elettrica e magnetica separate |q|/m = 1 C/kg Partenza da fermo Regime non relativistico I valori numerici rispettano: U > 0 e B > 0.

Derivazione primaria indipendente:

Il vincolo è lineare U=(2 V/T)B, non quadratico nel campo. Pongo b=B/(1 T)>0, allora u=2b e r/(1 m)=√(4b)/b=2/√b. La misura r=2 m impone √b=1, quindi B=1 T e U=2 V. La positività esclude B=0 e ogni ramo non fisico.

## u6-magnetic-orbit-period-01

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Sono assegnati m = 1 mg e B = 2 T. Quanto vale periodo orbitale diviso per 2π (τ) in s?

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è s.

Derivazione primaria indipendente:

Dalla forza centripeta si ha r=mv/(|q|B); dividendo la circonferenza 2πr per v si ottiene T_orbita=2πm/(|q|B). La variabile richiesta è τ=T_orbita/(2π)=m/(|q|B). Con m=10⁻⁶ kg, |q|=10⁻⁶ C e B=2 T, τ=1/2 s; il periodo completo è π s.

## u6-magnetic-orbit-period-02

Prompt originale:

Nell’argomento «Periodo del moto circolare magnetico» si considera periodo orbitale diviso per 2π. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Il divisore 2π è adimensionale, quindi τ conserva la dimensione temporale del periodo e si esprime in secondi. Da m/(|q|B), usando T=kg/(C·s), si recupera s.

## u6-magnetic-orbit-period-03

Prompt originale:

Un elettrone viene lanciato esattamente parallelamente a un campo magnetico uniforme, senza altri campi. Che cosa accade nel modello ideale?

Ipotesi e convenzioni: Valgono esclusivamente le condizioni esplicitate nella domanda concettuale.

Derivazione primaria indipendente:

Questa domanda autonoma riguarda un elettrone lanciato esattamente parallelo al campo, non il moto perpendicolare della famiglia numerica. Il prodotto vettoriale v×B è nullo e la forza magnetica è zero anche se la carica è negativa. Nel modello senza altri campi il moto resta rettilineo uniforme parallelo a B; non esiste un’orbita circolare finita a cui applicare il periodo della famiglia.

## u6-magnetic-orbit-period-04

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Si passa da m = 1 mg a m = 3 mg, mantenendo B = 2 T e le altre condizioni fisse. Che cosa accade a periodo orbitale diviso per 2π?

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

A |q| e B fissi τ è proporzionale a m. La massa passa da 1 a 3 mg, quindi τ passa da 1/2 a 3/2 s, triplicando. Il periodo completo cambia con lo stesso fattore, ma non coincide con τ.

## u6-magnetic-orbit-period-05

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

La misura di periodo orbitale diviso per 2π è 1/2 s; si conosce B = 2 T. Determina massa della particella nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mg.

Derivazione primaria indipendente:

Da τ=m/(|q|B) ricavo m=|q|Bτ. La sostituzione (1 μC)(2 T)(1/2 s)=1 μC·T·s=10⁻⁶ kg=1 mg dà la massa positiva richiesta.

## u6-magnetic-orbit-period-06

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

La misura di periodo orbitale diviso per 2π è 1/2 s; si conosce m = 1 mg. Determina campo magnetico nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è T.

Derivazione primaria indipendente:

Isolo B=m/(|q|τ). Con m=1 mg, |q|=1 μC e τ=1/2 s risulta B=2 T. Le due potenze 10⁻⁶ di massa e carica si cancellano numericamente, non dimensionalmente.

## u6-magnetic-orbit-period-07

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Nello stato A: m = 1 mg, B = 2 T. Nello stato B rimane m = 1 mg, mentre B = 1 T. Calcola il rapporto τ_B/τ_A.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

Con massa fissata τ è inversamente proporzionale a B. Da 2 T a 1 T il valore passa da 1/2 s a 1 s; il rapporto τ_B/τ_A è 2. Non si usa il rapporto diretto dei campi.

## u6-magnetic-orbit-period-08

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Con m = 1 mg e B = 2 T, una soluzione propone τ_proposto = 1 s. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

Il corretto τ è 1/2 s. La proposta 1 s sovrastima di 1−1/2=+1/2 s. Questo è lo scarto della variabile τ, non del periodo completo T_orbita.

## u6-magnetic-orbit-period-09

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Si misura τ e si conoscono le altre quantità della relazione T_orbita = 2πm/(|q|B); τ[s] = m[mg]/B[T]. Quale formula isola m nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

Moltiplicando τ=m/(|q|B) per |q|B si ottiene m=|q|Bτ. Per i valori normalizzati m/(mg)=[B/(T)][τ/(s)], grazie a |q|=1 μC. Omettere |q| nella legge delle grandezze fisiche produrrebbe dimensioni errate.

## u6-magnetic-orbit-period-10

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Da uno stato A con grandezze m e B si passa a uno stato B in cui m_B = κ₁·m e B_B = κ₂·B. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto τ_B/τ_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

Nel rapporto fra prove |q| resta uguale; τ_B/τ_A=(κ₁m)/(κ₂B) diviso m/B=κ₁/κ₂. Le due prove restano perpendicolari e non relativistiche. Il fattore 2π non compare perché è già separato nella definizione di τ.

## u6-magnetic-orbit-period-11

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Nello stato iniziale A si hanno m = 1 mg e B = 2 T. Nello stato B si hanno m = 2 mg e B = 1 T. Qual è il rapporto τ_B/τ_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A dà τ_A=1/2 s; B con m=2 mg e B=1 T dà τ_B=2 s. Il rapporto è 2/(1/2)=4. Il raddoppio della massa e il dimezzamento del campo moltiplicano entrambi τ per due.

## u6-magnetic-orbit-period-12

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Si registrano due letture con uguale peso statistico. La prima usa m = 1 mg, B = 2 T; la seconda usa m = 2 mg, B = 1 T. Qual è la media aritmetica delle due letture di periodo orbitale diviso per 2π? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

La media delle due letture 1/2 s e 2 s è 5/4 s. Il modello agli ingressi medi m=3/2 mg e B=3/2 T darebbe invece 1 s. La differenza media delle uscite meno uscita agli ingressi medi è 1/4 s. Non si confonde questa media tra prove col periodo di una sola orbita.

## u6-magnetic-orbit-period-13

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

La condizione iniziale è m = 1 mg, B = 2 T. Si impone poi m = 2 mg e si vuole che la grandezza d’uscita diventi 4 volte quella iniziale. Quale rapporto B_B/B_A è necessario?

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Si impone τ_B=4·(1/2 s)=2 s con m_B=2 mg. Da B=m/(|q|τ) risulta B_B=1 T. Rispetto a B_A=2 T il rapporto richiesto è 1/2.

## u6-magnetic-orbit-period-14

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Uno strumento misura τ con legge S_strum = a_cal·τ, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento m = 1 mg, B = 2 T, legge S_strum=3/2. In una nuova prova legge S_strum=6 e si conosce B = 1 T. Determina massa della particella nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mg.

Derivazione primaria indipendente:

Il riferimento ha τ=1/2 s e S=3/2, quindi a=3 unità strumentali/s. La nuova lettura S=6 corrisponde a τ=2 s. Con B=1 T, m=|q|Bτ=2 mg. La taratura precede l’inversione fisica.

## u6-magnetic-orbit-period-15

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

Lo strumento obbedisce a S_strum = a_cal·τ + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: m = 1 mg, B = 2 T, S_strum=2. Riferimento B: m = 2 mg, B = 1 T, S_strum=5. Prova C: B = 2 T, S_strum=4. Trova massa della particella nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

I riferimenti sono (τ,S)=(1/2 s,2) e (2 s,5). La pendenza è (5−2)/(2−1/2)=2 unità strumentali/s e l’offset è 1. S_C=4 dà τ_C=(4−1)/2=3/2 s. Con B_C=2 T si ricava m_C=3 mg.

## u6-magnetic-orbit-period-16

Prompt originale:

Una particella di modulo della carica 1 μC e massa m milligrammi si muove perpendicolarmente a B uniforme. Si cerca τ = T_orbita/(2π), in secondi, per mantenere π simbolico.

I valori numerici nelle unità dichiarate devono soddisfare m = 1/2·B. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre τ=1/2 s. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Campo uniforme Velocità perpendicolare Regime non relativistico |q| = 1 μC I valori numerici rispettano: m > 0 e B > 0.

Derivazione primaria indipendente:

Il vincolo dimensionato m=(1/2 mg/T)B rende m/(|q|B)=1/2 s identicamente. La misura di τ non aggiunge un’equazione indipendente: esistono infinite coppie continue positive, per esempio (B,m)=(2 T,1 mg) e (1 T,1/2 mg). Si possono scegliere velocità perpendicolari non relativistiche; non si impongono conteggi interi a masse o campi.

## u6-magnetic-flux-01

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Sono assegnati B = 2 T e A = 3 m². Quanto vale flusso magnetico (Φ) in Wb?

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Wb.

Derivazione primaria indipendente:

Il flusso è Φ=∫B·n dA. Campo uniforme e normale concorde rendono cosθ=1, quindi Φ=BA=(2 T)(3 m²)=6 Wb. L’angolo nullo è quello con la normale, mentre il campo è perpendicolare al piano.

## u6-magnetic-flux-02

Prompt originale:

Nell’argomento «Flusso magnetico» si considera flusso magnetico. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Il flusso magnetico si esprime in weber: Wb=T·m². Tesla misura il campo e m² l’area; il prodotto ha dimensione diversa da ciascuno dei due fattori.

## u6-magnetic-flux-03

Prompt originale:

Nel modello elementare del campo di un magnete a barra, come si completano le linee del campo magnetico quando si considerano sia lo spazio esterno sia l’interno del magnete?

Ipotesi e convenzioni: Valgono esclusivamente i dati e le ipotesi specificati nel testo.

Derivazione primaria indipendente:

Considerando interno ed esterno di un magnete a barra, le linee del campo si completano in anelli chiusi: all’esterno vanno dal polo nord al sud e all’interno ritornano dal sud al nord. Non iniziano né finiscono realmente sui poli. Il flusso netto su una superficie chiusa è nullo; questo non contraddice un flusso positivo attraverso una superficie aperta orientata.

## u6-magnetic-flux-04

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Si passa da B = 2 T a B = 1 T, mantenendo A = 3 m² e le altre condizioni fisse. Che cosa accade a flusso magnetico?

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

Con area e orientazione fisse, Φ è proporzionale a B. Da 2 T a 1 T si passa da 6 a 3 Wb, cioè alla metà. Il segno resta positivo perché il campo resta concorde con la normale.

## u6-magnetic-flux-05

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

La misura di flusso magnetico è 6 Wb; si conosce A = 3 m². Determina campo magnetico nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è T.

Derivazione primaria indipendente:

Isolo B=Φ/A. Con Φ=6 Wb e A=3 m² risulta B=2 T. L’area positiva evita la divisione per zero e la scelta della normale mantiene il campo concorde.

## u6-magnetic-flux-06

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

La misura di flusso magnetico è 6 Wb; si conosce B = 2 T. Determina area della superficie nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m².

Derivazione primaria indipendente:

Da Φ=BA segue A=Φ/B. La sostituzione 6 Wb/(2 T)=3 m² restituisce l’area richiesta. Il campo assegnato è positivo e non nullo.

## u6-magnetic-flux-07

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Nello stato A: B = 2 T, A = 3 m². Nello stato B rimane B = 2 T, mentre A = 1 m². Calcola il rapporto Φ_B/Φ_A.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

A B costante e normale invariata, il rapporto dei flussi coincide con quello delle aree: Φ_B/Φ_A=1/3. Le uscite sono 2 e 6 Wb. Il rapporto non ha unità e non introduce variazioni dell’angolo.

## u6-magnetic-flux-08

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Con B = 2 T e A = 3 m², una soluzione propone Φ_proposto = 12 Wb. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

Il flusso corretto è 6 Wb. Con la convenzione proposto meno corretto, lo scarto è 12−6=+6 Wb. È una sovrastima del valore concorde, non un cambiamento della normale.

## u6-magnetic-flux-09

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Si misura Φ e si conoscono le altre quantità della relazione Φ = BA cosθ; con B concorde alla normale, Φ = BA. Quale formula isola B nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

La legge generale è Φ=BA cosθ; qui θ=0 rispetto alla normale, perciò Φ=BA e B=Φ/A. Non si applica sinθ né si misura θ dal piano. Il dominio A>0 consente l’inversione.

## u6-magnetic-flux-10

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Da uno stato A con grandezze B e A si passa a uno stato B in cui B_B = κ₁·B e A_B = κ₂·A. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto Φ_B/Φ_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

Orientazione e uniformità sono preservate nei due stati. Dividendo (κ₁B)(κ₂A) per BA si ricava Φ_B/Φ_A=κ₁κ₂. La conclusione richiede lo stesso cosθ=1 in entrambe le prove.

## u6-magnetic-flux-11

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Nello stato iniziale A si hanno B = 2 T e A = 3 m². Nello stato B si hanno B = 1 T e A = 4 m². Qual è il rapporto Φ_B/Φ_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

In A il prodotto 2·3 dà 6 Wb; in B 1·4 dà 4 Wb. Il rapporto finale/iniziale è 4/6=2/3. Le due variazioni non si sommano: si moltiplicano nei rispettivi fattori.

## u6-magnetic-flux-12

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Si registrano due letture con uguale peso statistico. La prima usa B = 2 T, A = 3 m²; la seconda usa B = 1 T, A = 4 m². Qual è la media aritmetica delle due letture di flusso magnetico? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

Le due letture sono 6 e 4 Wb e la loro media aritmetica è 5 Wb. Usando invece i valori medi B=3/2 T e A=7/2 m², il modello darebbe 21/4 Wb. La differenza fra le due costruzioni è 5−21/4=−1/4 Wb. Il quesito richiede la prima.

## u6-magnetic-flux-13

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

La condizione iniziale è B = 2 T, A = 3 m². Si impone poi B = 1 T e si vuole che la grandezza d’uscita diventi 2/3 volte quella iniziale. Quale rapporto A_B/A_A è necessario?

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il nuovo flusso deve essere (2/3)·6=4 Wb. Con B_B=1 T si richiede A_B=4 m², quindi A_B/A_A=4/3. La normale resta concorde in entrambe le prove.

## u6-magnetic-flux-14

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Uno strumento misura Φ con legge S_strum = a_cal·Φ, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento B = 2 T, A = 3 m², legge S_strum=18. In una nuova prova legge S_strum=12 e si conosce A = 4 m². Determina campo magnetico nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è T.

Derivazione primaria indipendente:

Il riferimento Φ=6 Wb con S=18 fissa a=3 unità strumentali/Wb. S=12 implica Φ=4 Wb. Con area 4 m², B=Φ/A=1 T. Non serve conoscere l’unità strumentale assoluta perché è coerente fra le prove.

## u6-magnetic-flux-15

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

Lo strumento obbedisce a S_strum = a_cal·Φ + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: B = 2 T, A = 3 m², S_strum=13. Riferimento B: B = 1 T, A = 4 m², S_strum=9. Prova C: A = 5 m², S_strum=41. Trova campo magnetico nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

I riferimenti Φ_A=6 Wb,S_A=13 e Φ_B=4 Wb,S_B=9 danno a=(13−9)/(6−4)=2 unità strumentali/Wb e b=1. La lettura 41 significa Φ_C=(41−1)/2=20 Wb. Con A_C=5 m² segue B_C=4 T.

## u6-magnetic-flux-16

Prompt originale:

Un campo uniforme B è perpendicolare al piano di una superficie di area A. La normale positiva della superficie è concorde con B. Si cerca il flusso magnetico.

I valori numerici nelle unità dichiarate devono soddisfare B = 2/3·A. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è Φ=6 Wb. Determina area della superficie nel dominio fisico positivo.

Ipotesi e convenzioni: Campo uniforme Campo concorde alla normale I valori numerici rispettano: B > 0 e A > 0.

Derivazione primaria indipendente:

Pongo a=A/(1 m²)>0. Il vincolo dimensionato B=(2/3 T/m²)A implica B/(T)=2a/3. La misura Φ=6 Wb dà 6=(2/3)a², quindi a²=9 e a=3 nel dominio positivo. Si ottengono A=3 m² e B=2 T; la radice negativa non rappresenta un’area ammessa.
