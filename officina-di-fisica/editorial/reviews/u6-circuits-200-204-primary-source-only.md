# Primaria indipendente U6-02 — lotti A200–204

Stato: risoluzioni degli 80 originali dai soli prompt, prima di candidati, opzioni, chiavi, svolgimenti, hint o figure A200–204. Non è un PASS di candidati né approvazione umana.

Disclosure: nessuna esposizione a risposte/candidati U6-02. Il lettore Git ha esportato solo id, prompt, familyId e lawFamily. Nessuna primaria del distinto revisore A o Root aperta. Le derivazioni U6-01 già concluse non sono riutilizzate come chiavi delle nuove famiglie; ogni fonte qui è stato letto individualmente.

Fonte immutabile5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Snapshot allowlist160 prompt SHA256c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b. Nessun ID inventato, 16 originali per ciascuna delle cinque famiglie.

Cautele: rapporti delle distanze adimensionali e radice positiva, punto nullo interno fra sorgenti positive. Somma vettoriale ortogonale distinta dalla somma dei moduli; casi04 e07 conservano radicali esatti senza approssimazione, caso06 tratta una direzione. Corrente media distinta dall’istantanea e dalla media su intervalli concatenati; caso20203 magnetico separato. Resistore ohmico e resistività a temperatura fissata, generatore ideale dove dichiarato; fili confrontati senza imporre volume costante non assegnato. Variabili macroscopiche continue, non conteggi discreti di componenti.

## u6-zero-field-distance-ratio-01

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Sono assegnati Q₁ = 1 nC e Q₂ = 4 nC. Quanto vale rapporto delle distanze (d₁/d₂) in 1?

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Fra sorgenti positive i due campi hanno versi opposti. L’annullamento impone kQ₁/d₁²=kQ₂/d₂², dunque η=d₁/d₂=√(Q₁/Q₂)>0. Per 1 e 4 nC, η=√(1/4)=1/2; il punto è più vicino alla carica minore. A separazione L>0 fissata si avrebbe d₁=Lη/(1+η), d₂=L/(1+η), entrambe positive.

## u6-zero-field-distance-ratio-02

Prompt originale:

Nell’argomento «Punto di campo nullo» si considera rapporto delle distanze. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Il rapporto di due distanze è adimensionale: m/m=1. Non si assegna una stringa fra alternative non ancora lette; la dimensione è quella di un numero puro.

## u6-zero-field-distance-ratio-03

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente d₁/d₂ nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Il bilancio dei moduli dei campi opposti dà Q₁/d₁²=Q₂/d₂². Quindi η²=Q₁/Q₂ e η=√(Q₁/Q₂), radice positiva perché d₁,d₂ sono distanze. Il fattore k si cancella e le cariche si esprimono nella stessa unità.

## u6-zero-field-distance-ratio-04

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Si passa da Q₁ = 1 nC a Q₁ = 9 nC, mantenendo Q₂ = 4 nC e le altre condizioni fisse. Che cosa accade a rapporto delle distanze?

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

η_A=√(1/4)=1/2; con Q₁=9 nC e Q₂=4 nC, η_B=√(9/4)=3/2. Il rapporto cresce di 3, non di 9; il punto di campo nullo resta interno.

## u6-zero-field-distance-ratio-05

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

La misura di rapporto delle distanze è 1/2; si conosce Q₂ = 4 nC. Determina prima carica nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è nC.

Derivazione primaria indipendente:

Isolo Q₁=η²Q₂. Con η=1/2 e Q₂=4 nC si ha Q₁=(1/4)4=1 nC. Reinserendo si ritrova il rapporto positivo 1/2.

## u6-zero-field-distance-ratio-06

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

La misura di rapporto delle distanze è 1/2; si conosce Q₁ = 1 nC. Determina seconda carica nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è nC.

Derivazione primaria indipendente:

Isolo Q₂=Q₁/η². Con Q₁=1 nC e η=1/2 si ottiene Q₂=4 nC. Richiede η>0 e sorgente nota positiva.

## u6-zero-field-distance-ratio-07

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Nello stato A: Q₁ = 1 nC, Q₂ = 4 nC. Nello stato B rimane Q₁ = 1 nC, mentre Q₂ = 1 nC. Calcola il rapporto d₁/d₂_B/d₁/d₂_A.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

η_A=1/2; con Q₁=Q₂=1 nC si ha η_B=1, quindi η_B/η_A=2. Il punto è al centro soltanto nella seconda configurazione.

## u6-zero-field-distance-ratio-08

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Con Q₁ = 1 nC e Q₂ = 4 nC, una soluzione propone d₁/d₂_proposto = 1. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

La proposta η=1 supera il risultato corretto 1/2 di+1/2, numero puro. Non si tratta del rapporto proposta/corretta, che vale 2.

## u6-zero-field-distance-ratio-09

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Si misura d₁/d₂ e si conoscono le altre quantità della relazione Q₁/d₁² = Q₂/d₂²; d₁/d₂ = √(Q₁/Q₂). Quale formula isola Q₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Da η²=Q₁/Q₂ segue Q₁=η²Q₂, dove η=d₁/d₂. In forma geometrica Q₁=Q₂(d₁/d₂)². Unità di carica e dominio positivo rispettati.

## u6-zero-field-distance-ratio-10

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Da uno stato A con grandezze Q₁ e Q₂ si passa a uno stato B in cui Q₁_B = κ₁·Q₁ e Q₂_B = κ₂·Q₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto d₁/d₂_B/d₁/d₂_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Sostituendo Q₁,B=κ₁Q₁,A e Q₂,B=κ₂Q₂,A, si trova η_B/η_A=√(κ₁/κ₂). Il rapporto non richiede la distanza totale tra le sorgenti, ma richiede entrambe positive.

## u6-zero-field-distance-ratio-11

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Nello stato iniziale A si hanno Q₁ = 1 nC e Q₂ = 4 nC. Nello stato B si hanno Q₁ = 4 nC e Q₂ = 1 nC. Qual è il rapporto d₁/d₂_B/d₁/d₂_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A dàη_A=1/2. B con 4 e 1 nC dàη_B=2. Il rapporto tra uscite è 4; cambiare entrambe le cariche moltiplica il rapporto delle cariche per 16 e quello delle distanze per 4.

## u6-zero-field-distance-ratio-12

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Si registrano due letture con uguale peso statistico. La prima usa Q₁ = 1 nC, Q₂ = 4 nC; la seconda usa Q₁ = 4 nC, Q₂ = 1 nC. Qual è la media aritmetica delle due letture di rapporto delle distanze? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Media delle letture=(1/2+2)/2=5/4. Le cariche medie sono entrambe 5/2 nC e darebberoη=1, distinto. Sono due prove statistiche, non quattro sorgenti presenti insieme.

## u6-zero-field-distance-ratio-13

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

La condizione iniziale è Q₁ = 1 nC, Q₂ = 4 nC. Si impone poi Q₁ = 4 nC e si vuole che la grandezza d’uscita diventi 4 volte quella iniziale. Quale rapporto Q₂_B/Q₂_A è necessario?

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il bersaglio èη_B=4·(1/2)=2. Con Q₁,B=4 nC, Q₂,B=Q₁,B/η_B²=1 nC. Il rapporto richiesto Q₂,B/Q₂,A=1/4.

## u6-zero-field-distance-ratio-14

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Uno strumento misura d₁/d₂ con legge S_strum = a_cal·d₁/d₂, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento Q₁ = 1 nC, Q₂ = 4 nC, legge S_strum=3/2. In una nuova prova legge S_strum=6 e si conosce Q₂ = 1 nC. Determina prima carica nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è nC.

Derivazione primaria indipendente:

Riferimentoη_A=1/2 e S_A=3/2: gain a=3 nella scala strumentale. S_B=6 decodificaη_B=2; con Q₂,B=1 nC, Q₁,B=η_B²Q₂,B=4 nC.

## u6-zero-field-distance-ratio-15

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

Lo strumento obbedisce a S_strum = a_cal·d₁/d₂ + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: Q₁ = 1 nC, Q₂ = 4 nC, S_strum=2. Riferimento B: Q₁ = 4 nC, Q₂ = 1 nC, S_strum=5. Prova C: Q₂ = 9 nC, S_strum=7/3. Trova prima carica nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Riferimentiη_A=1/2,η_B=2 e letture 2,5: a=(5−2)/(2−1/2)=2, b=2−2(1/2)=1. S_C=7/3 dàη_C=(7/3−1)/2=2/3. Q₂,C=9 nC impone Q₁,C=(4/9)9=4 nC.

## u6-zero-field-distance-ratio-16

Prompt originale:

Due cariche positive Q₁ e Q₂ sono fisse su una retta. Nel punto di campo nullo compreso fra esse, le distanze dalle cariche sono d₁ e d₂. Si cerca il rapporto d₁/d₂.

I valori numerici nelle unità dichiarate devono soddisfare Q₁ = 1/4·Q₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre d₁/d₂=1/2. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Cariche positive Punto cercato fra le due sorgenti I valori numerici rispettano: Q₁ > 0 e Q₂ > 0.

Derivazione primaria indipendente:

Il vincolo Q₁=Q₂/4 rendeη=√(1/4)=1/2 per ogni Q₂>0. La misura è ridondante: infinite coppie positive nel modello continuo, per esempio(1,4)nC e(2,8)nC. Per ciascuna coppia e una separazione fissata esiste un solo punto interno, ma il rapporto non identifica la scala delle cariche.

## u6-orthogonal-electric-fields-01

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Sono assegnati E₁ = 3 N/C e E₂ = 4 N/C. Quanto vale modulo del campo totale (E) in N/C?

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è N/C.

Derivazione primaria indipendente:

Sovrapposizione vettoriale: E²=E₁²+E₂² perché il prodotto scalare dei contributi è zero. Con 3 e 4 N/C, E²=9+16=25 (N/C)² e il modulo positivo è 5 N/C. Sommare 3+4 darebbe un risultato valido per contributi paralleli concordi, non per questi.

## u6-orthogonal-electric-fields-02

Prompt originale:

Nell’argomento «Somma vettoriale del campo» si considera modulo del campo totale. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Il modulo della risultante è ancora un campo: N/C, equivalente a V/m. Proiezioni e somma vettoriale conservano la dimensione di campo.

## u6-orthogonal-electric-fields-03

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente E nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Dal teorema di Pitagora per componenti ortogonali, E=√(E₁²+E₂²)>0. Entrambi i quadrati hanno unità(N/C)² e la radice restituisceN/C; non occorre conoscere la posizione delle sorgenti per questa somma locale.

## u6-orthogonal-electric-fields-04

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Si passa da E₁ = 3 N/C a E₁ = 1 N/C, mantenendo E₂ = 4 N/C e le altre condizioni fisse. Che cosa accade a modulo del campo totale?

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

A dà 5 N/C. B con E₁=1 ed E₂=4 N/C dà√17 N/C, esatto. Poiché 16<17<25, si ha 4<√17<5 e il campo totale diminuisce. Non si approssima la radice né si forza una terna pitagorica non presente nei dati.

## u6-orthogonal-electric-fields-05

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

La misura di modulo del campo totale è 5 N/C; si conosce E₂ = 4 N/C. Determina primo contributo di campo nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è N/C.

Derivazione primaria indipendente:

E₁=√(E²−E₂²), ramo strettamente positivo se E>E₂>0. Con 5 e 4 N/C, E₁=√(25−16)=3 N/C. La radice negativa non è un modulo.

## u6-orthogonal-electric-fields-06

Prompt originale:

Si chiede la direzione della somma vettoriale di due contributi di campo uguali e perpendicolari.

Nel punto P un campo di 3 N/C è diretto lungo +x e un secondo campo di 3 N/C lungo +y. Qual è l’angolo della risultante rispetto a +x, misurato verso +y?

Ipotesi e convenzioni: Contributi lungo +x e +y Assi cartesiani ortogonali

Derivazione primaria indipendente:

Caso autonomo di direzione: vettore(3,3)N/C nel primo quadrante. tanθ=E_y/E_x=1 e 0<θ<90°, quindiθ=45°=π/4 rad rispetto a+x verso+y. Il modulo 3√2 N/C è una grandezza diversa dall’angolo richiesto.

## u6-orthogonal-electric-fields-07

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Nello stato A: E₁ = 3 N/C, E₂ = 4 N/C. Nello stato B rimane E₁ = 3 N/C, mentre E₂ = 1 N/C. Calcola il rapporto E_B/E_A.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

A dà 5 N/C; B con 3 e 1 N/C dà√10 N/C. Rapporto E_B/E_A=√10/5, esatto e minore di 1. Non si riduce il problema al rapporto del soloE₂.

## u6-orthogonal-electric-fields-08

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Con E₁ = 3 N/C e E₂ = 4 N/C, una soluzione propone E_proposto = 10 N/C. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Il campo corretto è 5 N/C e la proposta 10 N/C; scarto ordinato=10−5=+5 N/C. Il rapporto 2 è adimensionale e non lo scarto.

## u6-orthogonal-electric-fields-09

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Si misura E e si conoscono le altre quantità della relazione E = √(E₁² + E₂²). Quale formula isola E₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Isolo E₁²=E²−E₂² e prendo E₁=√(E²−E₂²)>0. La soluzione richiede E>E₂>0; all’uguaglianza il primo modulo sarebbe zero ed è escluso dal dominio.

## u6-orthogonal-electric-fields-10

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Da uno stato A con grandezze E₁ e E₂ si passa a uno stato B in cui E₁_B = κ₁·E₁ e E₂_B = κ₂·E₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto E_B/E_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Inserendo i fattori nei due quadrati: E_B/E_A=√[(κ₁²E₁²+κ₂²E₂²)/(E₁²+E₂²)]. I fattori positivi non permettono di separare una radice di somma in una somma di radici. Un fattore comuneκ dàκ.

## u6-orthogonal-electric-fields-11

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Nello stato iniziale A si hanno E₁ = 3 N/C e E₂ = 4 N/C. Nello stato B si hanno E₁ = 5 N/C e E₂ = 12 N/C. Qual è il rapporto E_B/E_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A è la terna 3,4,5; B è 5,12,13 perché 25+144=169. Rapporto 13/5, adimensionale e non il rapporto delle singole componenti.

## u6-orthogonal-electric-fields-12

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Si registrano due letture con uguale peso statistico. La prima usa E₁ = 3 N/C, E₂ = 4 N/C; la seconda usa E₁ = 5 N/C, E₂ = 12 N/C. Qual è la media aritmetica delle due letture di modulo del campo totale? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Media delle due letture=(5+13)/2=9 N/C. Ai contributi medi E₁=4,E₂=8 N/C si otterrebbe√80=4√5 N/C; è diverso da 9 perché 80<81.

## u6-orthogonal-electric-fields-13

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

La condizione iniziale è E₁ = 3 N/C, E₂ = 4 N/C. Si impone poi E₁ = 5 N/C e si vuole che la grandezza d’uscita diventi 13/5 volte quella iniziale. Quale rapporto E₂_B/E₂_A è necessario?

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Bersaglio E_B=(13/5)5=13 N/C. Con E₁,B=5 N/C, E₂,B=√(169−25)=12 N/C. Rapporto E₂,B/E₂,A=12/4=3.

## u6-orthogonal-electric-fields-14

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Uno strumento misura E con legge S_strum = a_cal·E, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento E₁ = 3 N/C, E₂ = 4 N/C, legge S_strum=15. In una nuova prova legge S_strum=39 e si conosce E₂ = 12 N/C. Determina primo contributo di campo nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è N/C.

Derivazione primaria indipendente:

A dà 5 N/C e S 15, quindi a=3 nella scala strumentale perN/C. S 39 significa E_B=13 N/C. Con E₂,B=12 N/C, E₁,B=√(169−144)=5 N/C.

## u6-orthogonal-electric-fields-15

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

Lo strumento obbedisce a S_strum = a_cal·E + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: E₁ = 3 N/C, E₂ = 4 N/C, S_strum=11. Riferimento B: E₁ = 5 N/C, E₂ = 12 N/C, S_strum=27. Prova C: E₂ = 8 N/C, S_strum=21. Trova primo contributo di campo nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

Riferimenti 5 e 13 N/C con S 11 e 27 danno a=(27−11)/(13−5)=2, b=1. S 21 decodifica E_C=(21−1)/2=10 N/C. Con E₂,C=8 N/C, E₁,C=√(100−64)=6 N/C.

## u6-orthogonal-electric-fields-16

Prompt originale:

Nel punto P agiscono due contributi di campo elettrico perpendicolari, di moduli E₁ ed E₂. Si cerca il modulo della risultante. I dati sono scelti per ottenere terne pitagoriche.

I valori numerici nelle unità dichiarate devono soddisfare E₁ = 3/4·E₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è E=5 N/C. Determina secondo contributo di campo nel dominio fisico positivo.

Ipotesi e convenzioni: Contributi esattamente perpendicolari I valori numerici rispettano: E₁ > 0 e E₂ > 0.

Derivazione primaria indipendente:

E₁=(3/4)E₂ rende E=√(9/16+1)E₂=(5/4)E₂ per E₂>0. Misura 5 N/C determina E₂=4 N/C e E₁=3 N/C. Unica coppia positiva; non una famiglia libera dopo la misura.

## u6-current-charge-time-01

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Sono assegnati Q = 6 mC e Δt = 2 ms. Quanto vale corrente media (I) in A?

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è A.

Derivazione primaria indipendente:

La corrente media orientata è I_media=Q/Δt. Qui Q=6·10⁻³ C e Δt=2·10⁻³ s: i prefissi si cancellano e I_media=3 C/s=3 A. Il verso positivo è coerente con il trasferimento; non si deduce il valore istantaneo in ogni momento.

## u6-current-charge-time-02

Prompt originale:

Nell’argomento «Definizione di corrente» si considera corrente media. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La dimensione della corrente è carica/tempo: A=C/s. Una carica inC o un intervallo ins non sono da soli una corrente; mC/ms ha scala uguale aC/s.

## u6-current-charge-time-03

Prompt originale:

Un lungo filo rettilineo è percorso da corrente continua. Quale descrizione qualitativa del campo magnetico vicino al filo è corretta, trascurando estremi e altri conduttori?

Ipotesi e convenzioni: Valgono le condizioni specificate nella domanda.

Derivazione primaria indipendente:

Caso autonomo magnetico: per un lungo filo rettilineo con corrente continua, trascurando estremi e altri fili, le linee diB sono circonferenze concentriche attorno al filo in piani perpendicolari; il verso segue la mano destra rispetto alla corrente convenzionale. In mezzo uniforme non magnetico il modulo decresce come 1/r. Senza alternative non si inventa una stringa di risposta. Non sono linee radiali del campo elettrico.

## u6-current-charge-time-04

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Si passa da Q = 6 mC a Q = 1 mC, mantenendo Δt = 2 ms e le altre condizioni fisse. Che cosa accade a corrente media?

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

A dà 6/2=3 A. B con Q=1 mC nello stesso intervallo 2 ms dà 1/2 A: corrente media sei volte minore. Non cambia il denominatore temporale.

## u6-current-charge-time-05

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

La misura di corrente media è 3 A; si conosce Δt = 2 ms. Determina carica attraversata nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mC.

Derivazione primaria indipendente:

Q=I_mediaΔt. Con 3 A e 2 ms, Q=6 mC=6·10⁻³ C. La media basta a ricostruire la carica netta sull’intervallo, senza corrente istantanea costante.

## u6-current-charge-time-06

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

La misura di corrente media è 3 A; si conosce Q = 6 mC. Determina intervallo di tempo nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è ms.

Derivazione primaria indipendente:

Δt=Q/I_media. Con 6 mC e 3 A si ha Δt=2 ms. Carica e media positive danno un intervallo strettamente positivo.

## u6-current-charge-time-07

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Nello stato A: Q = 6 mC, Δt = 2 ms. Nello stato B rimane Q = 6 mC, mentre Δt = 1 ms. Calcola il rapporto I_B/I_A.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

A:6 mC/2 ms=3 A. B:6 mC/1 ms=6 A. Rapporto 2; il tempo dimezzato raddoppia la media a carica netta uguale.

## u6-current-charge-time-08

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Con Q = 6 mC e Δt = 2 ms, una soluzione propone I_proposto = 6 A. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Valore corretto 3 A, proposta 6 A: scarto=+3 A. Il rapporto 2 non è una corrente.

## u6-current-charge-time-09

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Si misura I e si conoscono le altre quantità della relazione I_media = Q/Δt. Quale formula isola Q nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Dalla definizione media I_media=Q/Δt segue Q=I_mediaΔt. Ampere per secondi dàcoulomb; ampere permillisecondi dàmillicoulomb. Nessuna ipotesi di costanza istantanea è richiesta.

## u6-current-charge-time-10

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Da uno stato A con grandezze Q e Δt si passa a uno stato B in cui Q_B = κ₁·Q e Δt_B = κ₂·Δt. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto I_B/I_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Con Q_B=κ₁Q_A e Δt_B=κ₂Δt_A, I_B/I_A=κ₁/κ₂. Positività dei fattori mantiene gli intervalli ammissibili.

## u6-current-charge-time-11

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Nello stato iniziale A si hanno Q = 6 mC e Δt = 2 ms. Nello stato B si hanno Q = 12 mC e Δt = 3 ms. Qual è il rapporto I_B/I_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A dà 3 A; B con 12 mC in 3 ms dà 4 A. Rapporto 4/3, includendo sia il raddoppio della carica sia il fattore 3/2 dell’intervallo.

## u6-current-charge-time-12

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Si registrano due letture con uguale peso statistico. La prima usa Q = 6 mC, Δt = 2 ms; la seconda usa Q = 12 mC, Δt = 3 ms. Qual è la media aritmetica delle due letture di corrente media? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Media aritmetica delle due correnti medie=(3+4)/2=7/2 A. Non è la media temporale sugli intervalli concatenati, che sarebbe(6+12)mC/(2+3)ms=18/5 A. Anche ai valori medi Q=9 mC e Δt=5/2 ms la legge dà 18/5 A, distinto.

## u6-current-charge-time-13

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

La condizione iniziale è Q = 6 mC, Δt = 2 ms. Si impone poi Q = 12 mC e si vuole che la grandezza d’uscita diventi 4/3 volte quella iniziale. Quale rapporto Δt_B/Δt_A è necessario?

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Bersaglio I_B=(4/3)3=4 A. Con Q_B=12 mC serve Δt_B=3 ms. Rapporto Δt_B/Δt_A=3/2.

## u6-current-charge-time-14

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Uno strumento misura I con legge S_strum = a_cal·I, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento Q = 6 mC, Δt = 2 ms, legge S_strum=9. In una nuova prova legge S_strum=12 e si conosce Δt = 3 ms. Determina carica attraversata nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mC.

Derivazione primaria indipendente:

A dà 3 A e S 9: a=3 nella scala strumentale perA. S 12 decodifica 4 A; per Δt 3 ms la carica netta è 12 mC.

## u6-current-charge-time-15

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

Lo strumento obbedisce a S_strum = a_cal·I + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: Q = 6 mC, Δt = 2 ms, S_strum=7. Riferimento B: Q = 12 mC, Δt = 3 ms, S_strum=9. Prova C: Δt = 5 ms, S_strum=5. Trova carica attraversata nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Riferimenti 3 e 4 A, letture 7 e 9: a=2, b=1. S_C 5 decodifica I_C=(5−1)/2=2 A. In 5 ms passano Q_C=10 mC.

## u6-current-charge-time-16

Prompt originale:

Una carica totale Q, espressa in mC, attraversa una sezione di un conduttore durante Δt millisecondi. Si cerca la corrente media in ampere.

I valori numerici nelle unità dichiarate devono soddisfare Q = 3·Δt. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre I=3 A. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Si richiede un valore medio Verso positivo coerente con il trasferimento assegnato I valori numerici rispettano: Q > 0 e Δt > 0.

Derivazione primaria indipendente:

Il vincolo dimensionato Q=(3 mC/ms)Δt=(3 A)Δt rende I_media=3 A per ogni Δt>0. La misura è ridondante: infinite coppie nel modello macroscopico continuo, per esempio(6 mC,2 ms) e(12 mC,4 ms). Il dato non impone una corrente istantanea costante.

## u6-ohmic-current-01

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Sono assegnati V = 12 V e R = 3 Ω. Quanto vale corrente (I) in A?

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è A.

Derivazione primaria indipendente:

Per un resistore ohmico a temperatura costante e generatore ideale, V=RI. Con V 12 V eR 3 Ω, I=12/3=4 A, orientata secondo il verso convenzionale di caduta di potenziale nel resistore.

## u6-ohmic-current-02

Prompt originale:

Nell’argomento «Prima legge di Ohm» si considera corrente. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La corrente ha unità A=V/Ω=C/s. Resistenza,tensione e potenza sono grandezze diverse; si aspetteranno le alternative effettive prima di fissare una stringa.

## u6-ohmic-current-03

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente I nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Da V=RI con R>0 segue I=V/R. È una relazione costitutiva ohmica nel regime e alla temperatura assegnati, non una legge universale per qualsiasi componente.

## u6-ohmic-current-04

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Si passa da V = 12 V a V = 1 V, mantenendo R = 3 Ω e le altre condizioni fisse. Che cosa accade a corrente?

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

A dà 12/3=4 A. A V_B=1 V conR 3 Ω si ottiene 1/3 A, dodici volte minore. Nessun cambio della resistenza è implicato dal confronto.

## u6-ohmic-current-05

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

La misura di corrente è 4 A; si conosce R = 3 Ω. Determina tensione applicata nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

V=IR=4 A·3 Ω=12 V. Unità V e dominio positivo conservati.

## u6-ohmic-current-06

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

La misura di corrente è 4 A; si conosce V = 12 V. Determina resistenza nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Ω.

Derivazione primaria indipendente:

R=V/I=12 V/(4 A)=3 Ω. La divisione richiede corrente non nulla e qui positiva.

## u6-ohmic-current-07

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Nello stato A: V = 12 V, R = 3 Ω. Nello stato B rimane V = 12 V, mentre R = 1 Ω. Calcola il rapporto I_B/I_A.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

A I 4 A; B conR 1 Ω eV 12 V dà 12 A. Rapporto 3, inverso al fattore 1/3 della resistenza.

## u6-ohmic-current-08

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Con V = 12 V e R = 3 Ω, una soluzione propone I_proposto = 8 A. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Proposta 8 A meno corretta 4 A dà+4 A. Il rapporto 2 è diverso e adimensionale.

## u6-ohmic-current-09

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Si misura I e si conoscono le altre quantità della relazione I = V/R. Quale formula isola V nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Isolando V da I=V/R si ha V=IR, A·Ω=V. Moltiplicare e non dividere perR ricostruisce la tensione.

## u6-ohmic-current-10

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Da uno stato A con grandezze V e R si passa a uno stato B in cui V_B = κ₁·V e R_B = κ₂·R. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto I_B/I_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

V_B=κ₁V_A eR_B=κ₂R_A danno I_B/I_A=κ₁/κ₂, per fattori e resistenze positive e stesso regime ohmico.

## u6-ohmic-current-11

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Nello stato iniziale A si hanno V = 12 V e R = 3 Ω. Nello stato B si hanno V = 15 V e R = 5 Ω. Qual è il rapporto I_B/I_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A dà 4 A; B con 15 V e 5 Ω dà 3 A. Rapporto 3/4: maggiore tensione non garantisce maggiore corrente se cambia ancheR.

## u6-ohmic-current-12

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Si registrano due letture con uguale peso statistico. La prima usa V = 12 V, R = 3 Ω; la seconda usa V = 15 V, R = 5 Ω. Qual è la media aritmetica delle due letture di corrente? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Media aritmetica=(4+3)/2=7/2 A. Agli ingressi medi V=27/2 V,R 4 Ω si avrebbe 27/8 A, diverso da 28/8 A. Si trattano le due prove con uguale peso statistico.

## u6-ohmic-current-13

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

La condizione iniziale è V = 12 V, R = 3 Ω. Si impone poi V = 15 V e si vuole che la grandezza d’uscita diventi 3/4 volte quella iniziale. Quale rapporto R_B/R_A è necessario?

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Bersaglio I_B=(3/4)4=3 A. Con V_B 15 V serve R_B=5 Ω. Rapporto conR_A 3 Ω uguale 5/3.

## u6-ohmic-current-14

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Uno strumento misura I con legge S_strum = a_cal·I, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento V = 12 V, R = 3 Ω, legge S_strum=12. In una nuova prova legge S_strum=9 e si conosce R = 5 Ω. Determina tensione applicata nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Riferimento 4 A conS 12: a=3 perA nella scala strumentale. S 9 decodifica 3 A. A R_B 5 Ω, V_B=15 V.

## u6-ohmic-current-15

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

Lo strumento obbedisce a S_strum = a_cal·I + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: V = 12 V, R = 3 Ω, S_strum=9. Riferimento B: V = 15 V, R = 5 Ω, S_strum=7. Prova C: R = 4 Ω, S_strum=4. Trova tensione applicata nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Riferimenti 4 e 3 A e letture 9,7: a=(9−7)/(4−3)=2, b=1. S_C 4 dà I_C=3/2 A. ConR_C 4 Ω, V_C=6 V.

## u6-ohmic-current-16

Prompt originale:

Un resistore ohmico di resistenza R è collegato a una differenza di potenziale V costante. Si trascurano altri elementi e si cerca la corrente.

I valori numerici nelle unità dichiarate devono soddisfare V = 4·R. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre I=4 A. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Resistore ohmico Temperatura costante Generatore ideale I valori numerici rispettano: V > 0 e R > 0.

Derivazione primaria indipendente:

Il vincolo fra prove V=(4 A)R rende I=4 A per qualsiasi R>0. Infinite coppie continue positive(V,R) compatibili: misura e vincolo non identificano la scala. Non è un generatore ideale unico che vari da solo entro una prova.

## u6-wire-resistance-01

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Sono assegnati L = 100 m e A = 2 mm². Quanto vale resistenza (R) in Ω?

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Ω.

Derivazione primaria indipendente:

Seconda legge diOhm: R=ρL/A, filo uniforme a temperatura fissata. A=2 mm²=2·10⁻⁶ m², L 100 m eρ2·10⁻⁸ Ω·m danno R=(2·10⁻⁸·100)/(2·10⁻⁶)=1 Ω. Area ha conversione quadratica del millimetro.

## u6-wire-resistance-02

Prompt originale:

Nell’argomento «Seconda legge di Ohm» si considera resistenza. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La resistenza ha unità Ω=V/A. Nella legge(Ω·m)·m/m² rimaneΩ; resistività ha inveceΩ·m.

## u6-wire-resistance-03

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente R nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

Con ℓ=L/(1 m), a=A/(1 mm²), R/(1 Ω)=(2·10⁻⁸/10⁻⁶)ℓ/a=ℓ/(50 a). Il coefficiente 1/50 incorpora la conversione mm²→m² e la resistività assegnata.

## u6-wire-resistance-04

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Si passa da L = 100 m a L = 1 m, mantenendo A = 2 mm² e le altre condizioni fisse. Che cosa accade a resistenza?

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

A dà 1 Ω con 100 m. B con 1 m e stessa sezione 2 mm² dà 1/100 Ω; dipendenza lineare daL, non daL².

## u6-wire-resistance-05

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

La misura di resistenza è 1 Ω; si conosce A = 2 mm². Determina lunghezza del filo nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m.

Derivazione primaria indipendente:

L=RA/ρ. ConR 1 Ω eA 2·10⁻⁶ m² si haL 100 m. Nelle unità numeriche ℓ=50 a(R/Ω)=100.

## u6-wire-resistance-06

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

La misura di resistenza è 1 Ω; si conosce L = 100 m. Determina area della sezione nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mm².

Derivazione primaria indipendente:

A=ρL/R=2·10⁻⁸·100/1 m²=2·10⁻⁶ m²=2 mm². L’area richiesta non è un diametro o raggio.

## u6-wire-resistance-07

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Nello stato A: L = 100 m, A = 2 mm². Nello stato B rimane L = 100 m, mentre A = 1 mm². Calcola il rapporto R_B/R_A.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

A con 100 m e 2 mm² dà 1 Ω; B a 1 mm² dà 2 Ω. Rapporto 2: dimezzare area raddoppiaR aL eρ fissati.

## u6-wire-resistance-08

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Con L = 100 m e A = 2 mm², una soluzione propone R_proposto = 2 Ω. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

Corretto 1 Ω, proposta 2 Ω: scarto+1 Ω. Il rapporto 2 non ha unità di resistenza.

## u6-wire-resistance-09

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Si misura R e si conoscono le altre quantità della relazione R = ρL/A; R[Ω] = L[m]/(50 A[mm²]). Quale formula isola L nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

DaR=ρL/A segue L=RA/ρ, dominio R,A,ρ positivi. In unità dichiarate L/(1 m)=50(R/Ω)[A/(1 mm²)]. Non si usa la stessa formula numerica conA immessa inm².

## u6-wire-resistance-10

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Da uno stato A con grandezze L e A si passa a uno stato B in cui L_B = κ₁·L e A_B = κ₂·A. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto R_B/R_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

L_B=κ₁L_A eA_B=κ₂A_A aρ invariata danno R_B/R_A=κ₁/κ₂. Non si impone volume costante in questa famiglia di fili indipendenti.

## u6-wire-resistance-11

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Nello stato iniziale A si hanno L = 100 m e A = 2 mm². Nello stato B si hanno L = 200 m e A = 1 mm². Qual è il rapporto R_B/R_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

A 1 Ω; B con 200 m e 1 mm² dà 200/50=4 Ω. Rapporto 4, fattore 2 dalla lunghezza e 2 dall’inverso dell’area.

## u6-wire-resistance-12

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Si registrano due letture con uguale peso statistico. La prima usa L = 100 m, A = 2 mm²; la seconda usa L = 200 m, A = 1 mm². Qual è la media aritmetica delle due letture di resistenza? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

Media=(1+4)/2=5/2 Ω. Ai dati medi L 150 m eA 3/2 mm² si avrebbe 150/[50·(3/2)]=2 Ω, distinto.

## u6-wire-resistance-13

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

La condizione iniziale è L = 100 m, A = 2 mm². Si impone poi L = 200 m e si vuole che la grandezza d’uscita diventi 4 volte quella iniziale. Quale rapporto A_B/A_A è necessario?

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Bersaglio 4 Ω. ConL_B 200 m serve A_B=200/(50·4)=1 mm². Rapporto A_B/A_A=1/2.

## u6-wire-resistance-14

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Uno strumento misura R con legge S_strum = a_cal·R, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento L = 100 m, A = 2 mm², legge S_strum=3. In una nuova prova legge S_strum=12 e si conosce A = 1 mm². Determina lunghezza del filo nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è m.

Derivazione primaria indipendente:

Riferimento 1 Ω eS 3: a_cal 3 nella scala strumentale perΩ. S 12 decodificaR_B 4 Ω;A_B 1 mm² implicaL_B=50·4·1=200 m.

## u6-wire-resistance-15

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

Lo strumento obbedisce a S_strum = a_cal·R + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: L = 100 m, A = 2 mm², S_strum=3. Riferimento B: L = 200 m, A = 1 mm², S_strum=9. Prova C: A = 1 mm², S_strum=26/25. Trova lunghezza del filo nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

Riferimenti 1 e 4 Ω,letture 3 e 9: a_cal=(9−3)/(4−1)=2,b_cal 1. S_C 26/25 dàR_C=(26/25−1)/2=1/50 Ω. ConA_C 1 mm², L_C=50·(1/50)·1=1 m.

## u6-wire-resistance-16

Prompt originale:

Un filo uniforme ha resistività ρ = 2×10⁻⁸ Ω m, lunghezza L in metri e area trasversale A in mm². Si cerca la resistenza in ohm.

I valori numerici nelle unità dichiarate devono soddisfare L = 50·A. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre R=1 Ω. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: ρ costante Filo uniforme a temperatura fissata I valori numerici rispettano: L > 0 e A > 0.

Derivazione primaria indipendente:

Il vincolo nelle unità dichiarate L/(1 m)=50[A/(1 mm²)] corrisponde aL=(50 m/mm²)A. Sostituendo nella legge si haR 1 Ω per ogniA>0. Infinite coppie positive continue, per esempio(100 m,2 mm²) e(50 m,1 mm²); misura ridondante, non un conteggio intero di resistori.
