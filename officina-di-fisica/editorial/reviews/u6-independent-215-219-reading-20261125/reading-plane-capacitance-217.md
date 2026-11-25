# Lettura indipendente provvisoria B217 — firme non ancora create

Tutti i 16 record finali 2d27216100473a6d81a0774e369b4d9873054b48 letti integralmente dopo primaria 4c49ff e modello source-only eseguito. Nessun modulo autore importato; nessun candidato modificato. Nessun finding residuo testuale o grafico osservato, ma suite/identity e contratto finale ancora da eseguire.

## AR-u6-plane-capacitance-01

Derivazione primaria: C=εA/d. Con ε=10 pF/m, A=100 cm²=1/100 m² e d=1 mm=1/1000 m, C=10·10 pF=100 pF. Il dielettrico è lineare e il modello trascura il bordo; la geometria deve conservare dimensioni laterali grandi rispetto a d.

Confronto candidato/alternative: 100 cm²=1/100 m², d=1/1000 m: A/d=10 m e C=100 pF.10 pF perde un fattore dieci;1 pF usa area1 cm²;100000 pF usa impropriamente d=10⁻⁶ m. La permittività10 pF/m è un dato esatto di modello, non epsilon zero universale.

## AR-u6-plane-capacitance-02

Derivazione primaria: La capacità ha unità farad, F=Coulomb/Volt; pF è un suo sottomultiplo. Da εA/d si verifica (F/m)·m²/m=F. Nessuna alternativa ancora aperta: non confondere C simbolo della capacità con C unità di carica.

Confronto candidato/alternative: Il farad è C/V. Il coulomb da solo misura carica; V,J,Ω sono tensione,energia,resistenza. Il simbolo C della capacità non cambia la propria unità in coulomb.

## AR-u6-plane-capacitance-03

Derivazione primaria: In equilibrio elettrostatico il campo elettrico nel materiale conduttore è nullo; altrimenti le cariche libere continuerebbero a muoversi. Di conseguenza il potenziale è costante nel conduttore connesso e la carica libera netta in eccesso risiede alle superfici. Non estendere automaticamente E=0 a una cavità con cariche interne o all’esterno. La scelta esatta sarà valutata dopo apertura delle alternative.

Confronto candidato/alternative: E=0 nel materiale conduttore in equilibrio e potenziale uniforme nel corpo connesso. Il valore assoluto del potenziale dipende dal riferimento; non è necessariamente zero. Le altre opzioni confondono campo esterno, corrente continua o neutralità con le condizioni necessarie. Le cavità sono esplicitamente escluse. Skill C4-L04 pertinente.

## AR-u6-plane-capacitance-04

Derivazione primaria: A d e ε fissati, C è proporzionale all’area. Da 100 a 1 cm², C passa da 100 a 1 pF, fattore 1/100. L’ipotesi di bordo trascurabile va conservata anche dopo il cambiamento; non basta la sola positività di A e d per garantire una buona approssimazione geometrica reale.

Confronto candidato/alternative: Area100→1 cm² con d fisso produce C100→1 pF. Dieci pF usa una radice del fattore d’area;10000 inverte;100 ignora;1/100 applica due volte il fattore. Si conserva il regime di bordo trascurabile dichiarato, non una promessa di esattezza di un condensatore reale finito.

## AR-u6-plane-capacitance-05

Derivazione primaria: A=Cd/ε. Con C=100 pF, d=1 mm e ε=10 pF/m, A=1/100 m²=100 cm². In unità numeriche dichiarate il coefficiente si semplifica: A[cm²]=C[pF]d[mm].

Confronto candidato/alternative: A=Cd/ε, risultato100 cm². Nelle unità prescritte il coefficiente si riduce a uno.10 cm² dividerebbe di nuovo per10 dopo la conversione già inclusa;100 m² cambierebbe l’area fisica di10⁴.

## AR-u6-plane-capacitance-06

Derivazione primaria: d=εA/C. Con ε=10 pF/m, A=1/100 m² e C=100 pF si ottiene d=1/1000 m=1 mm. C,A,ε devono restare positivi finiti; il limite C=0 non è un’inversa ammessa in questo modello.

Confronto candidato/alternative: d=εA/C=1 mm. Il prodotto εA=1/10 pF·m diviso100 pF dà1/1000 m. Un quadrato di area100 cm² ha lato10 cm, quindi il gap1 mm resta piccolo. Nessun denominatore nullo.

## AR-u6-plane-capacitance-07

Derivazione primaria: A ed ε restano fissi mentre d raddoppia. C_B/C_A=d_A/d_B=1/2. Capacità iniziale 100 pF e finale 50 pF; non si suppone fissata la carica durante il confronto se il collegamento elettrico non è specificato.

Confronto candidato/alternative: Rapporto1/2, capacità100 e50 pF. Due rende diretto d; i quadrati non sono nella legge; uno ignora la modifica. Il collegamento al generatore non è necessario per la sola capacità geometrica.

## AR-u6-plane-capacitance-08

Derivazione primaria: Prendo x positivo da sinistra a destra. ΔV=V_destra−V_sinistra=−40 V e Δx=2 cm=1/50 m. E_x=−ΔV/Δx=+2000 V/m, diretto dalla piastra a +40 V verso quella a 0 V. L’uniformità segue dal modello piano senza effetti di bordo.

Confronto candidato/alternative: Con x verso destra, ΔV=−40 V e Δx=1/50 m. E_x=−ΔV/Δx=2000 V/m verso destra. Sinistra inverte il segno;20 V/m usa2 cm come2 m;zero confonde il dielettrico/spazio interno con il metallo;40 V/m copia il numero della tensione. Skill C4-L03 pertinente.

## AR-u6-plane-capacitance-09

Derivazione primaria: Da C=εA/d si moltiplica per d e si divide per ε>0: A=Cd/ε. Se C è espresso in pF e d in mm, con il valore assegnato di ε la formula per i valori numerici diventa A[cm²]=C[pF]d[mm]. Non confondere questa scorciatoia di unità con la legge dimensionale universale.

Confronto candidato/alternative: Cd/ε ha m². εd/C e C/(εd) sono puri; ε/(Cd) ha m⁻²; Cεd ha F². Tutte le alternative fisiche sono state lette; la semplificazione numerica A=C d con unità normalizzate non sostituisce la formula dimensionale.

## AR-u6-plane-capacitance-10

Derivazione primaria: Con ε invariata, A_B=κ₁A e d_B=κ₂d danno C_B/C_A=κ₁/κ₂. Fattori positivi mantengono i denominatori non nulli; occorre inoltre che entrambe le geometrie restino nel regime di bordo trascurabile.

Confronto candidato/alternative: Il rapporto èκ₁/κ₂, con entrambe le geometrie ancora ammissibili. Prodotto e reciproco alterano dipendenze;κ₁ è già fattore d’area e non va quadrato come se fosse un lato;κ₂² non segue dalla separazione.

## AR-u6-plane-capacitance-11

Derivazione primaria: A: 100/1=100 pF. B: 400/2=200 pF. Rapporto 2: l’area fornisce un fattore quattro e la separazione un fattore inverso due.

Confronto candidato/alternative: C_A100 pF, C_B200 pF: rapporto2. Quattro considera solo area;1/2 considera solo distanza o inverte l’intero rapporto;uno presume erroneamente fattori compensanti uguali.

## AR-u6-plane-capacitance-12

Derivazione primaria: Media delle capacità (100+200)/2=150 pF. Il modello sui dati medi A=250 cm² e d=3/2 mm darebbe 250/(3/2)=500/3 pF. La differenza 500/3−150=50/3 pF è esatta, senza decimalizzazione.

Confronto candidato/alternative: Media150 pF; il modello su area250 cm² e gap3/2 mm darebbe500/3 pF. Le alternative300,50,200 pF sono somma,semidifferenza,sola prova B. La differenza dei due tipi di media è50/3 pF esatta.

## AR-u6-plane-capacitance-13

Derivazione primaria: Bersaglio C_B=2·100=200 pF con A_B=400 cm². Da d[mm]=A[cm²]/C[pF] si trova d_B=2 mm, quindi d_B/d_A=2. Le due geometrie devono rispettare la stessa approssimazione piana.

Confronto candidato/alternative: Bersaglio200 pF con area400 cm² impone gap2 mm e rapporto2. Mezzo inverte;quattro conserverebbe100 pF;uno darebbe400 pF;otto darebbe50 pF. Tutte le controprove ricompongono C=A/d nelle unità definite.

## AR-u6-plane-capacitance-14

Derivazione primaria: Il riferimento C=100 pF con lettura 300 dà a_cal=3 pF⁻¹ per display adimensionale. Lettura 600 restituisce C=200 pF. Con d=2 mm si trova A=200·2=400 cm². Prima si rimuove la taratura, poi si usa la legge geometrica.

Confronto candidato/alternative: Guadagno3 pF⁻¹, lettura600→C200 pF, gap2 mm→area400 cm².1200 usa il display come capacità;100 divide per d e darebbe50 pF;200 copia il numero della capacità senza il fattore del gap.

## AR-u6-plane-capacitance-15

Derivazione primaria: C_A=100 pF, C_B=200 pF; letture 201,401 danno a_cal=2 pF⁻¹ e b_cal=1. Lettura 3 restituisce C_C=(3−1)/2=1 pF. Con d=1 mm, A=1 cm². La validità della geometria piana resta un’ipotesi distinta dalla soluzione algebrica e deve essere conservata nell’edizione.

Confronto candidato/alternative: Guadagno2 pF⁻¹ e offset1, lettura3→C1 pF e area1 cm² al gap1 mm.3/2 cm² omette offset e ricostruisce D4;2 cm² omette guadagno e D5;3 cm² usa D come area e D7. Si mantiene l’idealizzazione geometrica esplicita.

## AR-u6-plane-capacitance-16

Derivazione primaria: Il vincolo numerico A[cm²]=100 d[mm] ha coefficiente 100 cm²/mm. Allora C[pF]=A/d=100 per ogni d>0 nel modello. La misura è ridondante: infinite coppie (A,d) proporzionali, restringendo eventualmente d al sottoinsieme che conserva dimensioni laterali grandi rispetto alla separazione. Non determina una scala assoluta.

Confronto candidato/alternative: Il vincolo A=(100 cm²/mm)d fissa C100 pF per un continuo di geometrie. Gli esempi(100,1) e(200,2) nelle unità dichiarate non esauriscono la famiglia; la sola positività non autorizza d arbitrariamente grande rispetto ai lati. La candidata esplicita il vincolo di piastre estese. Nessuna scala assoluta ricavata dalla misura ridondante.

## Quattro pannelli realmente letti

XML ed120367d77a303c004fa9eaf8a1333c101406735f594ee26a3409c33abbd5cf letto integralmente e nuovo PNG browser-native640×2040 realmente eseguito e visto tutto. Primo pannello: area100 cm² e d1 mm, quote schematiche con lati e distanza non in scala reciproca. Secondo: conduttore, cariche ridistribuite presso le facce, campo nullo nel materiale e potenziale uniforme, distinto da una cavità. Terzo: caso indipendente con piastre+40/0 V distanti2 cm; tre frecce separate con punta a destra, uguali lunghezze205 coordinate, tutte interamente visibili e senza sovrapposizioni; E=2000 V/m. Quarto: barre160,320,240 per100,200,150 pF, origine150, scala8/5 coordinate/pF, zero118/1930 lontano dall’asse. Nessuna misura tecnica in pixel è nel testo del discente.

C4-L07 reale letto per condensatore, dielettrico e regime piano; C4-L04 riletto per il caso03; C4-L03 per gradiente di potenziale nel caso08. C1-L001/L002 reali riletti come fondamenti di unità e riferimenti vettoriali, non usati per inventare nuove lezioni. UI prodotto e human NOT_RUN; DRAFT e nessuna pubblicazione.

## Chiusura successiva della lettura

I finding segnalati sopra appartengono alla prima lettura. Le edizioni finali 215 aea78b9, 216 0444dc79 e 218 035031b9 sono state rilette integralmente nei record modificati, con confronto strutturale di tutti gli altri campi. Nessun finding residuo; report finali e prove per ID sono nei file independent-<batch>.md. Le precedenti frasi di attesa descrivono la cronologia e non il risultato finale.
