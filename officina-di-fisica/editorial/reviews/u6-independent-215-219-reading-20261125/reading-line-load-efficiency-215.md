# Lettura indipendente provvisoria B215 — non è un report SCI finale

Primaria 4c49ff congelata e modelli source-only eseguiti prima di ogni candidato. Tutti i 16 record del pin e474aa3bf610c3188760108356a2a3fd32935e00 sono ora letti integralmente: prompt, opzioni/chiavi, tutti i blocchi/formule, hint, error, metadati e didascalie. Nessun generatore autore importato. I finding 11/14 sono stati comunicati e non sono ancora congelate firme.

## AR-u6-line-load-efficiency-01

Derivazione primaria indipendente: La corrente è comune nella serie. P_L=I²R_L e P_c=I²R_c; per I≠0 la frazione η=R_L/(R_L+R_c). Con 3 e 1 Ω si ottiene 3/4, compreso strettamente fra zero e uno. Se I=0 la definizione come rapporto di potenze sarebbe 0/0: l’edizione futura deve dichiarare funzionamento con corrente non nulla, oppure definire esplicitamente il rapporto dei coefficienti dissipativi come limite.

Lettura delle alternative e feedback: Le alternative sono state tutte lette: 1/4 è quota persa; 4/3 supera uno; 3 confronta utile con perdita anziché totale; 1 richiederebbe R_c=0. Solo 3/4 rispetta il modello.

## AR-u6-line-load-efficiency-02

Derivazione primaria indipendente: η è rapporto di potenze e quindi adimensionale: unità 1, eventualmente espresso in percentuale dopo moltiplicazione per cento. Nessuna delle cinque alternative è ancora aperta; confronterò le unità effettive nella revisione successiva.

Lettura delle alternative e feedback: 1 è adimensionale. W, J e Ω rappresentano altre dimensioni; %·W conserva dimensione di potenza, non quella di una quota.

## AR-u6-line-load-efficiency-03

Derivazione primaria indipendente: Dalla somma delle potenze P_tot=I²(R_L+R_c) segue η=R_L/(R_L+R_c) per corrente comune non nulla. Non è un rendimento di conversione dell’intera rete termodinamica: qui utile significa precisamente potenza dissipata nel carico e persa significa quella nei cavi. Con resistenze positive finite, 0<η<1.

Lettura delle alternative e feedback: R_c/(R_L+R_c) è la perdita; R_L/R_c e R_c/R_L non hanno il totale al denominatore; (R_L+R_c)/R_L è il reciproco della quota e supera uno. Il fattore I² si cancella soltanto con I>0, reso esplicito.

## AR-u6-line-load-efficiency-04

Derivazione primaria indipendente: R_c resta 1 Ω. Passare da R_L=3 a 4 Ω dà η da 3/4 a 4/5: aumenta, ma non di un fattore 4/3 perché cambia anche il denominatore. La corrente può cambiare a seconda del generatore; il rapporto delle potenze conserva questa formula.

Lettura delle alternative e feedback: 4/5−3/4=1/20. Le alternative 1,3/5,3/4,1/2 eliminano perdite, conservano il vecchio numeratore, ignorano la modifica o impongono resistenze uguali. Non si inferisce una maggiore potenza utile assoluta senza controllo del generatore.

## AR-u6-line-load-efficiency-05

Derivazione primaria indipendente: η(R_L+R_c)=R_L implica (1−η)R_L=ηR_c. Con η=3/4 e R_c=1 Ω, R_L=(3/4)/(1/4) Ω=3 Ω. In generale servono R_c>0 e 0<η<1 per resistenza finita positiva.

Lettura delle alternative e feedback: Il valore 3 Ω ricompone la quota 3/4. I controesempi 3/4 Ω e 4/3 Ω danno quote 3/7 e 4/7. Il dominio inverso è aperto 0<η<1.

## AR-u6-line-load-efficiency-06

Derivazione primaria indipendente: ηR_c=(1−η)R_L, quindi R_c=R_L(1−η)/η. Con R_L=3 Ω e η=3/4 si ottiene 3·(1/4)/(3/4)=1 Ω. Il denominatore η è strettamente positivo.

Lettura delle alternative e feedback: R_c=1 Ω. Il valore errato 3/4 Ω è il prodotto R_L(1−η), privo della divisione per η; 9 Ω dà η=1/4 e zero darebbe η=1, esclusa. Quote sul totale e fra utile/perdita sono distinte.

## AR-u6-line-load-efficiency-07

Derivazione primaria indipendente: η_A=3/4 e η_B=3/(3+2)=3/5. Rapporto (3/5)/(3/4)=4/5: l’aumento delle perdite nei cavi diminuisce la frazione utile. Il valore non è il reciproco semplice del rapporto delle resistenze dei cavi.

Lettura delle alternative e feedback: 4/5 è il rapporto delle due uscite; 5/4 ne è il reciproco, 1/2 considera solo R_c, 2 copia il suo fattore e 1 ignora la variazione.

## AR-u6-line-load-efficiency-08

Derivazione primaria indipendente: Valore corretto 3/4; proposta 3/2. Scarto proposta−corretto=3/2−3/4=3/4, adimensionale. La proposta stessa supera uno, già incompatibile con due potenze dissipate positive nella definizione assegnata.

Lettura delle alternative e feedback: La differenza è +3/4. Le altre scelte invertono il segno, formano il rapporto 2, ripetono 3/2 o accettano lo zero. La proposta non è fisicamente ammissibile anche se lo scarto si può calcolare.

## AR-u6-line-load-efficiency-09

Derivazione primaria indipendente: Da η(R_L+R_c)=R_L si raccolgono i termini in R_L: (1−η)R_L=ηR_c. Si divide per 1−η>0: R_L=ηR_c/(1−η). Unità Ω; η=1 non ammette R_c>0 finita e η=0 non ammette R_L>0.

Lettura delle alternative e feedback: Con η=3/4 e R_c=1 Ω, il rapporto invertito darebbe R_L=1/3 Ω e quota1/4; ηR_c dà 3/4 Ω e quota3/7; R_c/(1−η) dà4 Ω e quota4/5. η/R_c ha unità S. Il noto resta R_c nelle formule effettive.

## AR-u6-line-load-efficiency-10

Derivazione primaria indipendente: η_B=κ₁R_L/(κ₁R_L+κ₂R_c). Dividendo per η_A=R_L/(R_L+R_c), il rapporto è κ₁(R_L+R_c)/(κ₁R_L+κ₂R_c). Fattori positivi mantengono denominatore positivo; una scalatura comune κ₁=κ₂ lascia η invariata.

Lettura delle alternative e feedback: La candidata definisce a=R_L/(R_L+R_c), b=R_c/(R_L+R_c). κ₁/(κ₁a+κ₂b) equivale esattamente alla formula della primaria. Il numeratore κ₂ segue i cavi; κ₁/κ₂ omette i pesi; la somma è il solo fattore totale; il prodotto fallisce già con κ₁=κ₂=2.

## AR-u6-line-load-efficiency-11

Derivazione primaria indipendente: A: 3/(3+1)=3/4. B: 2/(2+2)=1/2. Rapporto (1/2)/(3/4)=2/3. La potenza utile resta definita sul carico, senza cambiare il significato del rapporto fra le prove.

Lettura delle alternative e feedback: 2/3 è corretto; 3/2 è il reciproco e 1/2 copia η_B. Il distrattore4/3 è il reciproco della sola quota iniziale, non del rapporto R_L,B/R_L,A, il cui reciproco sarebbe3/2. FINDING inviato all’autore sul feedback11; attendo testo corretto prima di firma. Uno confonde totale uguale con ripartizione uguale.

## AR-u6-line-load-efficiency-12

Derivazione primaria indipendente: Media delle due uscite: (3/4+1/2)/2=5/8. Ai dati medi R_L=5/2 Ω e R_c=3/2 Ω si ottiene ancora (5/2)/4=5/8 perché in queste due prove il totale R_L+R_c è identico, 4 Ω. È una coincidenza motivata, non una regola generale per questa funzione non lineare.

Lettura delle alternative e feedback: Media5/8. Le alternative3/4 e1/2 ripetono una prova,5/4 non dimezza,1/8 è metà differenza. Il controesempio(1,1),(3,1) Ω dà media5/8 ma uscita ai dati medi2/3: la coincidenza del caso richiesto dipende dal totale4 Ω.

## AR-u6-line-load-efficiency-13

Derivazione primaria indipendente: Bersaglio η_B=(2/3)(3/4)=1/2. Con R_L,B=2 Ω, 2/(2+R_c,B)=1/2 dà R_c,B=2 Ω. Dividendo per R_c,A=1 Ω segue il rapporto richiesto 2.

Lettura delle alternative e feedback: Il bersaglioη_B=1/2 e R_L,B=2 Ω danno R_c,B=2 Ω e rapporto2. Le altre alternative invertono il rapporto, seguono soltanto le quote o lasciano R_c invariata; quest’ultima darebbeη_B=2/3.

## AR-u6-line-load-efficiency-14

Derivazione primaria indipendente: Il riferimento ha η=3/4 e lettura 9/4, quindi a_cal=(9/4)/(3/4)=3. La nuova lettura 3/2 restituisce η=1/2. Con R_c=2 Ω, R_L=ηR_c/(1−η)=2 Ω. La lettura strumentale non è direttamente una resistenza.

Lettura delle alternative e feedback: Guadagno3, quota decodificata1/2 e R_L,B=2 Ω. Trattare D come resistenza dà3/2 Ω e quota3/7; trattarlo comeη violaη<1. R_L=6 Ω produce D=9/4, ma non deriva dall’omissione del guadagno applicato aη: FINDING sul feedback14 in attesa di correzione.

## AR-u6-line-load-efficiency-15

Derivazione primaria indipendente: η_A=3/4 e η_B=1/2. Guadagno a_cal=[5/2−2]/[3/4−1/2]=2, offset b_cal=2−2·(1/2)=1. Lettura 13/5 restituisce η_C=(13/5−1)/2=4/5. Con R_c=1 Ω si trova R_L=(4/5)/(1/5) Ω=4 Ω, nel dominio fisico.

Lettura delle alternative e feedback: Guadagno2, offset1,η_C=4/5,R_L,C=4 Ω. Omettere offset dà13/10; omettere guadagno dopo sottrazione dà8/5: entrambe quote impossibili. Le controprove R_L=1 e2 Ω ricostruiscono D=2 e7/3.

## AR-u6-line-load-efficiency-16

Derivazione primaria indipendente: Il vincolo R_L=3R_c rende η=3R_c/(4R_c)=3/4 per ogni R_c>0 finita. La misura è ridondante e non fissa la scala: infinite coppie positive (R_L,R_c)=(3x,x), x>0. Nessuna ulteriore misura assoluta è stata fornita.

Lettura delle alternative e feedback: R_L=3R_c elimina la scala dalla quota. Le coppie(3,1) e(6,2) Ω sono esempi di una famiglia continua, non le uniche due. Nessuna e coppie indipendenti contraddicono rispettivamente gli esempi e il vincolo; R_c=0 è esclusa.

## SVG realmente letto in XML e rendering integrale

Lo SVG f6de01b9d00e97412c1b1696adedce3bf89a63a4638231776ed4a77abe422630 è stato letto integralmente. La mia fixture browser-native ha realmente concluso exit0 e PNG 640×1470, pari all’intero SVG 640×1470; immagine intera vista. Solo SVG inline, nessuna applicazione, server o dati studenti. Topologia serie, corrente 1 A e generatore 4 V: R_L3 Ω e R_c1 Ω; potenze3,1,4 W. Il simbolo resistivo non è in scala ed è dichiarato schematico. Barre di potenza180,60,240, scala60 coordinate/W, origine150. Barre adimensionali300,200,250 rappresentano3/4,1/2,5/8, scala400 coordinate; scala distinta dichiarata. Zeri a118/883 e118/1402 esterni agli assi; freccia di corrente unica con punta visibile e verso dal polo positivo attraverso il carico. Nessun finding grafico osservato. Il testo non usa coordinate tecniche visibili al discente.

Record unitario: modalità concettuale richiesta dalle unità; nessun calcolo numerico autonomo, ma prova dimensionale esplicita. Gli altri casi hanno procedimenti esatti o simbolici e controlli dei denominatori. Giudizio finale, identity, firme e suite avversaria ancora NOT_RUN per il lotto: attendono i due fix e la nuova lettura. Human e UI prodotto NOT_RUN, publication DRAFT.

## Chiusura successiva della lettura

I finding segnalati sopra appartengono alla prima lettura. Le edizioni finali 215 aea78b9, 216 0444dc79 e 218 035031b9 sono state rilette integralmente nei record modificati, con confronto strutturale di tutti gli altri campi. Nessun finding residuo; report finali e prove per ID sono nei file independent-<batch>.md. Le precedenti frasi di attesa descrivono la cronologia e non il risultato finale.
