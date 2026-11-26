# Primaria indipendente U6-03 B215–219 — solo prompt e dati originali

Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, percorso packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Estrazione allowlist degli 80 ID assegnati al revisore A: esclusivamente id e prompt. Tutti gli 80 testi seguenti sono stati letti integralmente e derivati individualmente prima di aprire opzioni, chiavi, risposte, solutionSteps, hint o moduli autore U6-03. Nessun candidato B215–219 è stato aperto. Nessuna primaria B dei miei A210–214 è stata aperta. Disclosure: nessuna esposizione anticipata a chiavi o soluzioni di questi 80 ID; i precedenti lavori U6-01/U6-02 sono famiglie diverse.

Questa primaria non approva le edizioni future e non attribuisce credito di integrazione. I casi concettuali sono risolti per principi e ipotesi, senza inventare un’alternativa ancora non visibile. Le future opzioni saranno tutte lette nella revisione distinta. I limiti fisici includono: frazione di potenze con corrente non nulla; fusione già alla temperatura di transizione con potenza costante; dielettrico lineare e bordo trascurabile; carica su ciascuna armatura distinta dal totale neutro; energia immagazzinata distinta dal lavoro di un generatore. Le tarature rimuovono prima offset e guadagno e solo dopo si inverte il modello. Le medie sono delle uscite, salvo coincidenze giustificate separatamente.

Nessun verificatore sui candidati, nessuna UI prodotto o approvazione umana eseguita. Human NOT_RUN, nessuna pubblicazione, nessun push o upload durante il vincolo operativo ROOT. Derivazione primaria da congelare prima dell’autoria e della review incrociata.

## u6-line-load-efficiency-01

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Sono assegnati R_L = 3 Ω e R_c = 1 Ω. Quanto vale frazione di potenza utile (η) in 1?

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

La corrente è comune nella serie. P_L=I²R_L e P_c=I²R_c; per I≠0 la frazione η=R_L/(R_L+R_c). Con 3 e 1 Ω si ottiene 3/4, compreso strettamente fra zero e uno. Se I=0 la definizione come rapporto di potenze sarebbe 0/0: l’edizione futura deve dichiarare funzionamento con corrente non nulla, oppure definire esplicitamente il rapporto dei coefficienti dissipativi come limite.

## u6-line-load-efficiency-02

### Prompt originale completo

Nell’argomento «Ripartizione della potenza resistiva» si considera frazione di potenza utile. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

### Derivazione indipendente

η è rapporto di potenze e quindi adimensionale: unità 1, eventualmente espresso in percentuale dopo moltiplicazione per cento. Nessuna delle cinque alternative è ancora aperta; confronterò le unità effettive nella revisione successiva.

## u6-line-load-efficiency-03

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Usando i simboli definiti nel testo, quale espressione fornisce correttamente η nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

Dalla somma delle potenze P_tot=I²(R_L+R_c) segue η=R_L/(R_L+R_c) per corrente comune non nulla. Non è un rendimento di conversione dell’intera rete termodinamica: qui utile significa precisamente potenza dissipata nel carico e persa significa quella nei cavi. Con resistenze positive finite, 0<η<1.

## u6-line-load-efficiency-04

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Si passa da R_L = 3 Ω a R_L = 4 Ω, mantenendo R_c = 1 Ω e le altre condizioni fisse. Che cosa accade a frazione di potenza utile?

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

R_c resta 1 Ω. Passare da R_L=3 a 4 Ω dà η da 3/4 a 4/5: aumenta, ma non di un fattore 4/3 perché cambia anche il denominatore. La corrente può cambiare a seconda del generatore; il rapporto delle potenze conserva questa formula.

## u6-line-load-efficiency-05

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

La misura di frazione di potenza utile è 3/4; si conosce R_c = 1 Ω. Determina resistenza del carico nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Ω.

### Derivazione indipendente

η(R_L+R_c)=R_L implica (1−η)R_L=ηR_c. Con η=3/4 e R_c=1 Ω, R_L=(3/4)/(1/4) Ω=3 Ω. In generale servono R_c>0 e 0<η<1 per resistenza finita positiva.

## u6-line-load-efficiency-06

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

La misura di frazione di potenza utile è 3/4; si conosce R_L = 3 Ω. Determina resistenza dei cavi nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Ω.

### Derivazione indipendente

ηR_c=(1−η)R_L, quindi R_c=R_L(1−η)/η. Con R_L=3 Ω e η=3/4 si ottiene 3·(1/4)/(3/4)=1 Ω. Il denominatore η è strettamente positivo.

## u6-line-load-efficiency-07

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Nello stato A: R_L = 3 Ω, R_c = 1 Ω. Nello stato B rimane R_L = 3 Ω, mentre R_c = 2 Ω. Calcola il rapporto η_B/η_A.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

η_A=3/4 e η_B=3/(3+2)=3/5. Rapporto (3/5)/(3/4)=4/5: l’aumento delle perdite nei cavi diminuisce la frazione utile. Il valore non è il reciproco semplice del rapporto delle resistenze dei cavi.

## u6-line-load-efficiency-08

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Con R_L = 3 Ω e R_c = 1 Ω, una soluzione propone η_proposto = 3/2. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

Valore corretto 3/4; proposta 3/2. Scarto proposta−corretto=3/2−3/4=3/4, adimensionale. La proposta stessa supera uno, già incompatibile con due potenze dissipate positive nella definizione assegnata.

## u6-line-load-efficiency-09

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Si misura η e si conoscono le altre quantità della relazione η = I²R_L/[I²(R_L+R_c)] = R_L/(R_L+R_c). Quale formula isola R_L nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

Da η(R_L+R_c)=R_L si raccolgono i termini in R_L: (1−η)R_L=ηR_c. Si divide per 1−η>0: R_L=ηR_c/(1−η). Unità Ω; η=1 non ammette R_c>0 finita e η=0 non ammette R_L>0.

## u6-line-load-efficiency-10

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Da uno stato A con grandezze R_L e R_c si passa a uno stato B in cui R_L_B = κ₁·R_L e R_c_B = κ₂·R_c. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto η_B/η_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

η_B=κ₁R_L/(κ₁R_L+κ₂R_c). Dividendo per η_A=R_L/(R_L+R_c), il rapporto è κ₁(R_L+R_c)/(κ₁R_L+κ₂R_c). Fattori positivi mantengono denominatore positivo; una scalatura comune κ₁=κ₂ lascia η invariata.

## u6-line-load-efficiency-11

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Nello stato iniziale A si hanno R_L = 3 Ω e R_c = 1 Ω. Nello stato B si hanno R_L = 2 Ω e R_c = 2 Ω. Qual è il rapporto η_B/η_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

A: 3/(3+1)=3/4. B: 2/(2+2)=1/2. Rapporto (1/2)/(3/4)=2/3. La potenza utile resta definita sul carico, senza cambiare il significato del rapporto fra le prove.

## u6-line-load-efficiency-12

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Si registrano due letture con uguale peso statistico. La prima usa R_L = 3 Ω, R_c = 1 Ω; la seconda usa R_L = 2 Ω, R_c = 2 Ω. Qual è la media aritmetica delle due letture di frazione di potenza utile? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

Media delle due uscite: (3/4+1/2)/2=5/8. Ai dati medi R_L=5/2 Ω e R_c=3/2 Ω si ottiene ancora (5/2)/4=5/8 perché in queste due prove il totale R_L+R_c è identico, 4 Ω. È una coincidenza motivata, non una regola generale per questa funzione non lineare.

## u6-line-load-efficiency-13

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

La condizione iniziale è R_L = 3 Ω, R_c = 1 Ω. Si impone poi R_L = 2 Ω e si vuole che la grandezza d’uscita diventi 2/3 volte quella iniziale. Quale rapporto R_c_B/R_c_A è necessario?

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

Bersaglio η_B=(2/3)(3/4)=1/2. Con R_L,B=2 Ω, 2/(2+R_c,B)=1/2 dà R_c,B=2 Ω. Dividendo per R_c,A=1 Ω segue il rapporto richiesto 2.

## u6-line-load-efficiency-14

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Uno strumento misura η con legge S_strum = a_cal·η, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento R_L = 3 Ω, R_c = 1 Ω, legge S_strum=9/4. In una nuova prova legge S_strum=3/2 e si conosce R_c = 2 Ω. Determina resistenza del carico nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è Ω.

### Derivazione indipendente

Il riferimento ha η=3/4 e lettura 9/4, quindi a_cal=(9/4)/(3/4)=3. La nuova lettura 3/2 restituisce η=1/2. Con R_c=2 Ω, R_L=ηR_c/(1−η)=2 Ω. La lettura strumentale non è direttamente una resistenza.

## u6-line-load-efficiency-15

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

Lo strumento obbedisce a S_strum = a_cal·η + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: R_L = 3 Ω, R_c = 1 Ω, S_strum=5/2. Riferimento B: R_L = 2 Ω, R_c = 2 Ω, S_strum=2. Prova C: R_c = 1 Ω, S_strum=13/5. Trova resistenza del carico nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

η_A=3/4 e η_B=1/2. Guadagno a_cal=[5/2−2]/[3/4−1/2]=2, offset b_cal=2−2·(1/2)=1. Lettura 13/5 restituisce η_C=(13/5−1)/2=4/5. Con R_c=1 Ω si trova R_L=(4/5)/(1/5) Ω=4 Ω, nel dominio fisico.

## u6-line-load-efficiency-16

### Prompt originale completo

Un carico resistivo R_L è in serie con la resistenza R_c dei cavi. La potenza utile è quella dissipata nel carico; le perdite sono quelle nei cavi. Si cerca la frazione η = P_L/(P_L + P_c).

I valori numerici nelle unità dichiarate devono soddisfare R_L = 3·R_c. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre η=3/4. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Carico e cavi resistivi in serie Potenza utile definita sul carico I valori numerici rispettano: R_L > 0 e R_c > 0.

### Derivazione indipendente

Il vincolo R_L=3R_c rende η=3R_c/(4R_c)=3/4 per ogni R_c>0 finita. La misura è ridondante e non fissa la scala: infinite coppie positive (R_L,R_c)=(3x,x), x>0. Nessuna ulteriore misura assoluta è stata fornita.

## u6-fuse-latent-heating-01

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Sono assegnati m = 10 mg e I = 1 A. Quanto vale tempo di fusione (t) in s?

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è s.

### Derivazione indipendente

10 mg=1/100 g. Il calore latente richiesto è (1/100 g)(200 J/g)=2 J. La potenza Joule costante è I²R=(1 A)²·2 Ω=2 W. Tempo t=2 J/(2 W)=1 s; non si aggiunge riscaldamento sensibile, perché il filamento parte già alla temperatura di fusione.

## u6-fuse-latent-heating-02

### Prompt originale completo

Nell’argomento «Joule e cambiamento di stato» si considera tempo di fusione. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

### Derivazione indipendente

Il tempo ha dimensione temporale e si esprime in s o in suoi multipli/sottomultipli. Dal bilancio t=energia/potenza segue J/W=s. Le alternative saranno lette solo nella futura revisione.

## u6-fuse-latent-heating-03

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente t nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Per una massa numerica m in mg, Q_f=(m/1000 g)(200 J/g)=(m/5) J. La potenza numerica è 2I² W quando I è in A. Quindi t[s]=m[mg]/(10 I[A]²). La legge fisica è t=mL_f/(I²R) con unità coerenti, non una massa in mg trattata come grammi.

## u6-fuse-latent-heating-04

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Si passa da m = 10 mg a m = 20 mg, mantenendo I = 1 A e le altre condizioni fisse. Che cosa accade a tempo di fusione?

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

I resta 1 A e raddoppia soltanto la massa da 10 a 20 mg. Raddoppia il calore latente da 2 a 4 J mentre P=2 W resta fisso; t passa da 1 a 2 s.

## u6-fuse-latent-heating-05

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

La misura di tempo di fusione è 1 s; si conosce I = 1 A. Determina massa del filamento nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mg.

### Derivazione indipendente

Il bilancio inverte la legge: m=I²Rt/L_f. Nelle unità assegnate m[mg]=10 I[A]² t[s]. Con I=1 A e t=1 s si ottiene 10 mg. Parametri e tempo sono finiti positivi.

## u6-fuse-latent-heating-06

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

La misura di tempo di fusione è 1 s; si conosce m = 10 mg. Determina corrente nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è A.

### Derivazione indipendente

I²=mL_f/(Rt). Con m=10 mg, Q_f=2 J, R=2 Ω e t=1 s: I²=1 A². Le radici matematiche sono ±1 A; il ramo dichiarato I>0 seleziona 1 A, modulo della corrente di riscaldamento.

## u6-fuse-latent-heating-07

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Nello stato A: m = 10 mg, I = 1 A. Nello stato B rimane m = 10 mg, mentre I = 2 A. Calcola il rapporto t_B/t_A.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

A massa fissa t è inversamente proporzionale a I². Da 1 a 2 A la potenza quadruplica e t_B/t_A=1/4. Il nuovo tempo è 1/4 s, non 1/2 s.

## u6-fuse-latent-heating-08

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Con m = 10 mg e I = 1 A, una soluzione propone t_proposto = 2 s. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Tempo corretto 1 s, proposta 2 s: scarto +1 s. La differenza è un tempo; il rapporto 2 sarebbe adimensionale e risponderebbe a un’altra domanda.

## u6-fuse-latent-heating-09

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Si misura t e si conoscono le altre quantità della relazione mL_f = I²Rt; t[s] = m[mg]/(10 I[A]²). Quale formula isola m nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Da t[s]=m[mg]/(10 I[A]²), moltiplicando per 10 I[A]² segue m[mg]=10 t[s] I[A]². In forma dimensionale m=I²Rt/L_f. La corrente non deve annullarsi nel modello di fusione a tempo finito.

## u6-fuse-latent-heating-10

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Da uno stato A con grandezze m e I si passa a uno stato B in cui m_B = κ₁·m e I_B = κ₂·I. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto t_B/t_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Con m_B=κ₁m e I_B=κ₂I: t_B/t_A=κ₁/κ₂², con i fattori positivi e R,L_f invariati. Il fattore della massa è diretto; quello della corrente è inverso e quadratico.

## u6-fuse-latent-heating-11

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Nello stato iniziale A si hanno m = 10 mg e I = 1 A. Nello stato B si hanno m = 80 mg e I = 2 A. Qual è il rapporto t_B/t_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

A: 10/(10·1²)=1 s. B: 80/(10·2²)=2 s. Il rapporto t_B/t_A è 2: la massa fornisce un fattore otto e la potenza un fattore quattro.

## u6-fuse-latent-heating-12

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Si registrano due letture con uguale peso statistico. La prima usa m = 10 mg, I = 1 A; la seconda usa m = 80 mg, I = 2 A. Qual è la media aritmetica delle due letture di tempo di fusione? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Media delle uscite (1+2)/2=3/2 s. Ai dati medi m=45 mg e I=3/2 A, il modello darebbe 45/[10·(9/4)]=2 s, diverso di 1/2 s. Il quesito chiede la prima media e non il modello applicato agli ingressi medi.

## u6-fuse-latent-heating-13

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

La condizione iniziale è m = 10 mg, I = 1 A. Si impone poi m = 80 mg e si vuole che la grandezza d’uscita diventi 2 volte quella iniziale. Quale rapporto I_B/I_A è necessario?

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

Il bersaglio è t_B=2 s. Con m_B=80 mg: 2=80/(10 I_B²) ⇒ I_B²=4 A². La radice positiva è I_B=2 A; il rapporto con I_A=1 A vale 2.

## u6-fuse-latent-heating-14

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Uno strumento misura t con legge S_strum = a_cal·t, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento m = 10 mg, I = 1 A, legge S_strum=3. In una nuova prova legge S_strum=6 e si conosce I = 2 A. Determina massa del filamento nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mg.

### Derivazione indipendente

Riferimento t=1 s e lettura 3 danno a_cal=3 s⁻¹ per display adimensionale. Lettura 6 restituisce t=2 s. Con I=2 A, m[mg]=10·2·4=80. Rimuovere prima la taratura e poi invertire il bilancio.

## u6-fuse-latent-heating-15

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

Lo strumento obbedisce a S_strum = a_cal·t + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: m = 10 mg, I = 1 A, S_strum=3. Riferimento B: m = 80 mg, I = 2 A, S_strum=5. Prova C: I = 1 A, S_strum=6/5. Trova massa del filamento nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Riferimenti t_A=1 s, t_B=2 s e letture 3,5: a_cal=2 s⁻¹, b_cal=1. Lettura 6/5 restituisce t=(6/5−1)/2 s=1/10 s. Con I=1 A si trova m=10·(1/10) mg=1 mg; il risultato è positivo nonostante la piccola lettura.

## u6-fuse-latent-heating-16

### Prompt originale completo

Un filamento è già alla temperatura di fusione. Ha massa m in mg, calore latente 200 J/g e resistenza mantenuta idealmente a 2 Ω. Una corrente I costante lo attraversa; ogni perdita termica è trascurata. Si cerca il tempo di fusione.

I valori numerici nelle unità dichiarate devono soddisfare m = 10·I. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è t=1 s. Determina corrente nel dominio fisico positivo.

Ipotesi e convenzioni: Temperatura iniziale di fusione Calore latente 200 J/g R = 2 Ω costante Nessuna perdita termica I valori numerici rispettano: m > 0 e I > 0.

### Derivazione indipendente

Il vincolo fra preparazioni è m[mg]=10 I[A], con coefficiente fisico 10 mg/A. Inserendo nel bilancio t[s]=1/I[A]. La misura 1 s seleziona I=1 A e m=10 mg, un’unica coppia positiva. Non è una corrente variabile durante la fusione: ogni prova ha corrente costante.

## u6-plane-capacitance-01

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Sono assegnati A = 100 cm² e d = 1 mm. Quanto vale capacità (C) in pF?

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è pF.

### Derivazione indipendente

C=εA/d. Con ε=10 pF/m, A=100 cm²=1/100 m² e d=1 mm=1/1000 m, C=10·10 pF=100 pF. Il dielettrico è lineare e il modello trascura il bordo; la geometria deve conservare dimensioni laterali grandi rispetto a d.

## u6-plane-capacitance-02

### Prompt originale completo

Nell’argomento «Capacità del condensatore piano» si considera capacità. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

### Derivazione indipendente

La capacità ha unità farad, F=Coulomb/Volt; pF è un suo sottomultiplo. Da εA/d si verifica (F/m)·m²/m=F. Nessuna alternativa ancora aperta: non confondere C simbolo della capacità con C unità di carica.

## u6-plane-capacitance-03

### Prompt originale completo

In un conduttore in equilibrio elettrostatico, quale affermazione è corretta per l’interno del materiale conduttore?

Ipotesi e convenzioni: Valgono esclusivamente le condizioni esplicitate nella domanda concettuale.

### Derivazione indipendente

In equilibrio elettrostatico il campo elettrico nel materiale conduttore è nullo; altrimenti le cariche libere continuerebbero a muoversi. Di conseguenza il potenziale è costante nel conduttore connesso e la carica libera netta in eccesso risiede alle superfici. Non estendere automaticamente E=0 a una cavità con cariche interne o all’esterno. La scelta esatta sarà valutata dopo apertura delle alternative.

## u6-plane-capacitance-04

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Si passa da A = 100 cm² a A = 1 cm², mantenendo d = 1 mm e le altre condizioni fisse. Che cosa accade a capacità?

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

A d e ε fissati, C è proporzionale all’area. Da 100 a 1 cm², C passa da 100 a 1 pF, fattore 1/100. L’ipotesi di bordo trascurabile va conservata anche dopo il cambiamento; non basta la sola positività di A e d per garantire una buona approssimazione geometrica reale.

## u6-plane-capacitance-05

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

La misura di capacità è 100 pF; si conosce d = 1 mm. Determina area di un’armatura nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è cm².

### Derivazione indipendente

A=Cd/ε. Con C=100 pF, d=1 mm e ε=10 pF/m, A=1/100 m²=100 cm². In unità numeriche dichiarate il coefficiente si semplifica: A[cm²]=C[pF]d[mm].

## u6-plane-capacitance-06

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

La misura di capacità è 100 pF; si conosce A = 100 cm². Determina distanza fra le armature nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è mm.

### Derivazione indipendente

d=εA/C. Con ε=10 pF/m, A=1/100 m² e C=100 pF si ottiene d=1/1000 m=1 mm. C,A,ε devono restare positivi finiti; il limite C=0 non è un’inversa ammessa in questo modello.

## u6-plane-capacitance-07

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Nello stato A: A = 100 cm², d = 1 mm. Nello stato B rimane A = 100 cm², mentre d = 2 mm. Calcola il rapporto C_B/C_A.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

A ed ε restano fissi mentre d raddoppia. C_B/C_A=d_A/d_B=1/2. Capacità iniziale 100 pF e finale 50 pF; non si suppone fissata la carica durante il confronto se il collegamento elettrico non è specificato.

## u6-plane-capacitance-08

### Prompt originale completo

Le armature piane parallele di un condensatore sono distanti 2 cm. La piastra a sinistra è a +40 V e quella a destra a 0 V. Trascurando gli effetti di bordo, qual è il campo elettrico nello spazio interno?

Ipotesi e convenzioni: Valgono esclusivamente i dati e le condizioni indicati nel testo.

### Derivazione indipendente

Prendo x positivo da sinistra a destra. ΔV=V_destra−V_sinistra=−40 V e Δx=2 cm=1/50 m. E_x=−ΔV/Δx=+2000 V/m, diretto dalla piastra a +40 V verso quella a 0 V. L’uniformità segue dal modello piano senza effetti di bordo.

## u6-plane-capacitance-09

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Si misura C e si conoscono le altre quantità della relazione C = εA/d; C[pF] = A[cm²]/d[mm] per ε = 10 pF/m. Quale formula isola A nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

Da C=εA/d si moltiplica per d e si divide per ε>0: A=Cd/ε. Se C è espresso in pF e d in mm, con il valore assegnato di ε la formula per i valori numerici diventa A[cm²]=C[pF]d[mm]. Non confondere questa scorciatoia di unità con la legge dimensionale universale.

## u6-plane-capacitance-10

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Da uno stato A con grandezze A e d si passa a uno stato B in cui A_B = κ₁·A e d_B = κ₂·d. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto C_B/C_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

Con ε invariata, A_B=κ₁A e d_B=κ₂d danno C_B/C_A=κ₁/κ₂. Fattori positivi mantengono i denominatori non nulli; occorre inoltre che entrambe le geometrie restino nel regime di bordo trascurabile.

## u6-plane-capacitance-11

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Nello stato iniziale A si hanno A = 100 cm² e d = 1 mm. Nello stato B si hanno A = 400 cm² e d = 2 mm. Qual è il rapporto C_B/C_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

A: 100/1=100 pF. B: 400/2=200 pF. Rapporto 2: l’area fornisce un fattore quattro e la separazione un fattore inverso due.

## u6-plane-capacitance-12

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Si registrano due letture con uguale peso statistico. La prima usa A = 100 cm², d = 1 mm; la seconda usa A = 400 cm², d = 2 mm. Qual è la media aritmetica delle due letture di capacità? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

Media delle capacità (100+200)/2=150 pF. Il modello sui dati medi A=250 cm² e d=3/2 mm darebbe 250/(3/2)=500/3 pF. La differenza 500/3−150=50/3 pF è esatta, senza decimalizzazione.

## u6-plane-capacitance-13

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

La condizione iniziale è A = 100 cm², d = 1 mm. Si impone poi A = 400 cm² e si vuole che la grandezza d’uscita diventi 2 volte quella iniziale. Quale rapporto d_B/d_A è necessario?

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

Bersaglio C_B=2·100=200 pF con A_B=400 cm². Da d[mm]=A[cm²]/C[pF] si trova d_B=2 mm, quindi d_B/d_A=2. Le due geometrie devono rispettare la stessa approssimazione piana.

## u6-plane-capacitance-14

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Uno strumento misura C con legge S_strum = a_cal·C, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento A = 100 cm², d = 1 mm, legge S_strum=300. In una nuova prova legge S_strum=600 e si conosce d = 2 mm. Determina area di un’armatura nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è cm².

### Derivazione indipendente

Il riferimento C=100 pF con lettura 300 dà a_cal=3 pF⁻¹ per display adimensionale. Lettura 600 restituisce C=200 pF. Con d=2 mm si trova A=200·2=400 cm². Prima si rimuove la taratura, poi si usa la legge geometrica.

## u6-plane-capacitance-15

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

Lo strumento obbedisce a S_strum = a_cal·C + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: A = 100 cm², d = 1 mm, S_strum=201. Riferimento B: A = 400 cm², d = 2 mm, S_strum=401. Prova C: d = 1 mm, S_strum=3. Trova area di un’armatura nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

C_A=100 pF, C_B=200 pF; letture 201,401 danno a_cal=2 pF⁻¹ e b_cal=1. Lettura 3 restituisce C_C=(3−1)/2=1 pF. Con d=1 mm, A=1 cm². La validità della geometria piana resta un’ipotesi distinta dalla soluzione algebrica e deve essere conservata nell’edizione.

## u6-plane-capacitance-16

### Prompt originale completo

Un condensatore piano ha area A in cm² e distanza fra le armature d in mm. Il dielettrico uniforme ha permittività ε = 10 pF/m, valore assegnato esattamente per il modello. Si trascurano gli effetti di bordo e si cerca C in pF.

I valori numerici nelle unità dichiarate devono soddisfare A = 100·d. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre C=100 pF. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Permittività ε = 10 pF/m Armature parallele molto estese rispetto alla separazione Dielettrico lineare I valori numerici rispettano: A > 0 e d > 0.

### Derivazione indipendente

Il vincolo numerico A[cm²]=100 d[mm] ha coefficiente 100 cm²/mm. Allora C[pF]=A/d=100 per ogni d>0 nel modello. La misura è ridondante: infinite coppie (A,d) proporzionali, restringendo eventualmente d al sottoinsieme che conserva dimensioni laterali grandi rispetto alla separazione. Non determina una scala assoluta.

## u6-capacitor-charge-01

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Sono assegnati C = 2 μF e V = 3 V. Quanto vale modulo della carica d’armatura (Q) in μC?

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μC.

### Derivazione indipendente

Per condensatore lineare Q=CV. μF·V=μC, dunque 2·3=6 μC su ciascuna armatura in modulo. Le cariche sono +Q e −Q: la carica netta dell’intero condensatore ideale resta zero, non 12 μC.

## u6-capacitor-charge-02

### Prompt originale completo

Nell’argomento «Definizione di capacità» si considera modulo della carica d’armatura. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

### Derivazione indipendente

La carica si misura in coulomb, C, o suoi multipli/sottomultipli; qui μC. Da Q=CV segue F·V=C. Le alternative saranno confrontate soltanto nella successiva lettura, senza confondere capacità con carica.

## u6-capacitor-charge-03

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente Q nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

La capacità è il coefficiente C=Q/V per armature con moduli uguali e opposti; isolando la carica positiva in modulo si ottiene Q=CV, con C,V>0. Non occorre un ulteriore fattore due perché si chiede il modulo su ciascuna armatura e non la somma dei moduli.

## u6-capacitor-charge-04

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Si passa da C = 2 μF a C = 1 μF, mantenendo V = 3 V e le altre condizioni fisse. Che cosa accade a modulo della carica d’armatura?

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

V resta 3 V e C dimezza da 2 a 1 μF. Q passa da 6 a 3 μC, una dipendenza lineare. A tensione mantenuta, il generatore può scambiare carica; non si assume isolamento delle armature.

## u6-capacitor-charge-05

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

La misura di modulo della carica d’armatura è 6 μC; si conosce V = 3 V. Determina capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

### Derivazione indipendente

C=Q/V=6 μC/(3 V)=2 μF. Divisione per V>0 finita. La dimensione è C/V=F e non energia.

## u6-capacitor-charge-06

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

La misura di modulo della carica d’armatura è 6 μC; si conosce C = 2 μF. Determina tensione nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

### Derivazione indipendente

V=Q/C=6 μC/(2 μF)=3 V. Si usa il modulo della differenza di potenziale nel ramo positivo assegnato; il segno della singola armatura non cambia il valore richiesto.

## u6-capacitor-charge-07

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Nello stato A: C = 2 μF, V = 3 V. Nello stato B rimane C = 2 μF, mentre V = 1 V. Calcola il rapporto Q_B/Q_A.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

C resta 2 μF. Q_A=6 μC e Q_B=2 μC. Rapporto Q_B/Q_A=2/6=1/3, uguale al rapporto delle tensioni.

## u6-capacitor-charge-08

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Con C = 2 μF e V = 3 V, una soluzione propone Q_proposto = 12 μC. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Carica corretta 6 μC; proposta 12 μC. Scarto proposta−corretto=+6 μC. Il raddoppio errato può confondere il modulo di una singola armatura con la somma dei due moduli, che non è la quantità richiesta.

## u6-capacitor-charge-09

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Si misura Q e si conoscono le altre quantità della relazione Q = CV. Quale formula isola C nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Da Q=CV si divide per V>0 e si ricava C=Q/V. Le unità μC/V danno μF. Il denominatore nullo è escluso; con V=0 non si inferisce C dal solo Q=0.

## u6-capacitor-charge-10

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Da uno stato A con grandezze C e V si passa a uno stato B in cui C_B = κ₁·C e V_B = κ₂·V. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto Q_B/Q_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Sostituendo C_B=κ₁C e V_B=κ₂V si trova Q_B=κ₁κ₂CV. Rapporto Q_B/Q_A=κ₁κ₂, con tutti i dati finiti positivi. Sono confronti fra preparazioni, non una variazione obbligata nello stesso condensatore isolato.

## u6-capacitor-charge-11

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Nello stato iniziale A si hanno C = 2 μF e V = 3 V. Nello stato B si hanno C = 1 μF e V = 5 V. Qual è il rapporto Q_B/Q_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

A: 2·3=6 μC. B: 1·5=5 μC. Rapporto 5/6: la tensione aumenta ma la capacità si dimezza, perciò la carica finale è leggermente minore.

## u6-capacitor-charge-12

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Si registrano due letture con uguale peso statistico. La prima usa C = 2 μF, V = 3 V; la seconda usa C = 1 μF, V = 5 V. Qual è la media aritmetica delle due letture di modulo della carica d’armatura? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Media delle uscite (6+5)/2=11/2 μC. Ai dati medi C=3/2 μF e V=4 V il prodotto sarebbe 6 μC, diverso di 1/2 μC. La media del prodotto non è in generale il prodotto delle medie.

## u6-capacitor-charge-13

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

La condizione iniziale è C = 2 μF, V = 3 V. Si impone poi C = 1 μF e si vuole che la grandezza d’uscita diventi 5/6 volte quella iniziale. Quale rapporto V_B/V_A è necessario?

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

Bersaglio Q_B=(5/6)·6=5 μC. Con C_B=1 μF, V_B=5 V. Rapporto V_B/V_A=5/3; tutti i parametri restano nel ramo positivo.

## u6-capacitor-charge-14

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Uno strumento misura Q con legge S_strum = a_cal·Q, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento C = 2 μF, V = 3 V, legge S_strum=18. In una nuova prova legge S_strum=15 e si conosce V = 5 V. Determina capacità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

### Derivazione indipendente

Q_A=6 μC con lettura 18 dà a_cal=3 μC⁻¹ per display adimensionale. Lettura 15 restituisce Q=5 μC. Con V=5 V, C=1 μF. Non dividere direttamente la lettura strumentale per la tensione.

## u6-capacitor-charge-15

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

Lo strumento obbedisce a S_strum = a_cal·Q + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: C = 2 μF, V = 3 V, S_strum=13. Riferimento B: C = 1 μF, V = 5 V, S_strum=11. Prova C: V = 2 V, S_strum=17. Trova capacità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Riferimenti Q_A=6 e Q_B=5 μC, letture 13,11: a_cal=2 μC⁻¹ e b_cal=1. Lettura 17 restituisce Q_C=(17−1)/2=8 μC. Con V_C=2 V, C_C=4 μF.

## u6-capacitor-charge-16

### Prompt originale completo

Un condensatore di capacità C in μF è mantenuto alla tensione V. Si cerca il modulo della carica su ciascuna armatura, in μC.

I valori numerici nelle unità dichiarate devono soddisfare C = 2/3·V. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è Q=6 μC. Determina tensione nel dominio fisico positivo.

Ipotesi e convenzioni: Condensatore lineare ideale Cariche opposte sulle armature I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Il vincolo numerico C[μF]=(2/3)V[V] ha coefficiente fisico (2/3) μF/V. Inserendo in Q=CV si ottiene 6=(2/3)V² per i valori numerici dichiarati. Quindi V²=9 e il ramo V>0 seleziona 3 V; C=2 μF. L’altra radice non appartiene al dominio positivo.

## u6-capacitor-energy-01

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Sono assegnati C = 2 μF e V = 2 V. Quanto vale energia immagazzinata (U) in μJ?

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μJ.

### Derivazione indipendente

Per un condensatore lineare U=∫₀^Q(q/C)dq=Q²/(2C)=CV²/2. Con 2 μF e 2 V: U=2·4/2=4 μJ. μF·V²=μJ; energia non negativa, distinta dal lavoro totale eventualmente fornito da una batteria durante una procedura di carica.

## u6-capacitor-energy-02

### Prompt originale completo

Nell’argomento «Energia elettrostatica immagazzinata» si considera energia immagazzinata. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

### Derivazione indipendente

L’energia ha unità joule, J, e qui μJ. F·V²=(C/V)V²=C·V=J. Nessuna alternativa è stata ancora aperta; la successiva revisione distinguerà unità effettive, energia e potenza.

## u6-capacitor-energy-03

### Prompt originale completo

Un dielettrico viene posto in un campo elettrico. Quale descrizione della polarizzazione è corretta?

Ipotesi e convenzioni: Valgono esclusivamente le condizioni esplicitate nella domanda concettuale.

### Derivazione indipendente

La polarizzazione di un dielettrico consiste in separazioni relative di cariche legate e/o orientamento di dipoli nel materiale. Non richiede trasporto macroscopico di cariche libere da un’armatura all’altra né creazione di carica netta. Un materiale inizialmente neutro può avere polarizzazione non nulla e cariche legate superficiali. Non assumo isotropia o un modello molecolare più specifico non dichiarato; confronterò poi le alternative.

## u6-capacitor-energy-04

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Si passa da C = 2 μF a C = 1 μF, mantenendo V = 2 V e le altre condizioni fisse. Che cosa accade a energia immagazzinata?

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

V resta 2 V mentre C dimezza da 2 a 1 μF: U passa da 4 a 2 μJ. Non è una trasformazione a carica fissata; mantenere la tensione può implicare scambio di energia col generatore.

## u6-capacitor-energy-05

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

La misura di energia immagazzinata è 4 μJ; si conosce V = 2 V. Determina capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

### Derivazione indipendente

C=2U/V². Con U=4 μJ e V=2 V: C=8/4=2 μF. Il denominatore V²>0 è necessario per un’inversa finita.

## u6-capacitor-energy-06

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

La misura di energia immagazzinata è 4 μJ; si conosce C = 2 μF. Determina tensione nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

### Derivazione indipendente

V²=2U/C=8/2=4 V². Radici ±2 V, ma il dominio assegnato V>0 seleziona 2 V. L’energia sola non determinerebbe il segno della tensione senza tale convenzione.

## u6-capacitor-energy-07

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Nello stato A: C = 2 μF, V = 2 V. Nello stato B rimane C = 2 μF, mentre V = 4 V. Calcola il rapporto U_B/U_A.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

C resta costante e la tensione raddoppia da 2 a 4 V: U_B/U_A=(4/2)²=4. Le energie sono 4 e 16 μJ, non in rapporto due.

## u6-capacitor-energy-08

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Con C = 2 μF e V = 2 V, una soluzione propone U_proposto = 8 μJ. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Energia corretta 4 μJ; proposta 8 μJ. Scarto proposta−corretto=+4 μJ. Il rapporto 2 è adimensionale e non è lo scarto richiesto.

## u6-capacitor-energy-09

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Si misura U e si conoscono le altre quantità della relazione U = CV²/2. Quale formula isola C nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Da U=CV²/2 si moltiplica per due e si divide per V²>0: C=2U/V². Dimensione J/V²=F. Le alternative verranno controllate dopo il congelamento di questa derivazione.

## u6-capacitor-energy-10

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Da uno stato A con grandezze C e V si passa a uno stato B in cui C_B = κ₁·C e V_B = κ₂·V. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto U_B/U_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Con C_B=κ₁C e V_B=κ₂V si ottiene U_B/U_A=κ₁κ₂². La capacità entra linearmente e la tensione quadraticamente. Entrambi i preparati devono restare condensatori lineari ideali entro il proprio regime operativo.

## u6-capacitor-energy-11

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Nello stato iniziale A si hanno C = 2 μF e V = 2 V. Nello stato B si hanno C = 4 μF e V = 3 V. Qual è il rapporto U_B/U_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

U_A=2·2²/2=4 μJ. U_B=4·3²/2=18 μJ. Rapporto 18/4=9/2. Il fattore due della capacità e quello 9/4 del quadrato della tensione si moltiplicano.

## u6-capacitor-energy-12

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Si registrano due letture con uguale peso statistico. La prima usa C = 2 μF, V = 2 V; la seconda usa C = 4 μF, V = 3 V. Qual è la media aritmetica delle due letture di energia immagazzinata? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Media delle uscite (4+18)/2=11 μJ. Ai dati medi C=3 μF e V=5/2 V il modello darebbe 3·(25/4)/2=75/8 μJ. La differenza 11−75/8=13/8 μJ è esatta, senza decimali.

## u6-capacitor-energy-13

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

La condizione iniziale è C = 2 μF, V = 2 V. Si impone poi C = 4 μF e si vuole che la grandezza d’uscita diventi 9/2 volte quella iniziale. Quale rapporto V_B/V_A è necessario?

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

### Derivazione indipendente

Bersaglio U_B=(9/2)·4=18 μJ. Con C_B=4 μF, V_B²=2·18/4=9 V²; ramo positivo V_B=3 V. Rapporto V_B/V_A=3/2.

## u6-capacitor-energy-14

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Uno strumento misura U con legge S_strum = a_cal·U, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento C = 2 μF, V = 2 V, legge S_strum=12. In una nuova prova legge S_strum=54 e si conosce V = 3 V. Determina capacità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

### Derivazione indipendente

Il riferimento U=4 μJ e lettura 12 dà a_cal=3 μJ⁻¹ per display adimensionale. Lettura 54 restituisce U=18 μJ. Con V=3 V, C=2·18/9=4 μF.

## u6-capacitor-energy-15

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

Lo strumento obbedisce a S_strum = a_cal·U + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: C = 2 μF, V = 2 V, S_strum=9. Riferimento B: C = 4 μF, V = 3 V, S_strum=37. Prova C: V = 1 V, S_strum=2. Trova capacità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Riferimenti U_A=4, U_B=18 μJ e letture 9,37: a_cal=(37−9)/(18−4)=2 μJ⁻¹, b_cal=1. Lettura 2 restituisce U_C=(2−1)/2=1/2 μJ. Con V_C=1 V, C_C=2·(1/2)/1=1 μF.

## u6-capacitor-energy-16

### Prompt originale completo

Un condensatore ideale ha capacità C in μF e tensione V. Si cerca l’energia immagazzinata in μJ.

I valori numerici nelle unità dichiarate devono soddisfare C = 1·V. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è U=4 μJ. Determina tensione nel dominio fisico positivo.

Ipotesi e convenzioni: Condensatore lineare ideale I valori numerici rispettano: C > 0 e V > 0.

### Derivazione indipendente

Il vincolo numerico C[μF]=V[V] ha coefficiente fisico 1 μF/V. Sostituendo nell’energia: U[μJ]=V[V]³/2. Misura 4 μJ implica V³=8 e unica tensione positiva 2 V, con capacità 2 μF. Il vincolo confronta preparazioni, non una capacità che cresce tacitamente durante la carica dello stesso componente.
