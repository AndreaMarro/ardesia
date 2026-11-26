# wire-resistance-204 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 200–204 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuits-200-204-primary-source-only.md, SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 5852f02d884d6ca3196cfc0d3e5bb1fcefb29334. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding204-13: i due fattori moltiplicativi espliciti distinguono raddoppio di L e raddoppio di1/A; riletto5852f02d, solo primo testo13 e binding, altre15 e tuttechiavi/formule/SVG invariati.

## AR-u6-wire-resistance-01

Derivazione e calcolo manuale: Seconda legge di Ohm: R=ρL/A, filo uniforme a temperatura fissata. A=2 mm²=2·10⁻⁶ m², L 100 m e ρ2·10⁻⁸ Ω·m danno R=(2·10⁻⁸·100)/(2·10⁻⁶)=1 Ω. Area ha conversione quadratica del millimetro. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Usare A=2 m² dà 10⁻⁶ Ω; la conversione lineare del mm² dà 10⁻³ Ω. Due Ω omette il divisore dell’area e cento copia L.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: XML e rendering integrale: filo e sezione sono due viste schematiche con scale indipendenti dichiarate; conversione 2 mm²→2·10⁻⁶m². RettaR(L) conarea 2 mm² fissata, da(0, 0) aperto a(200 m, 2Ω), scale 2 unità/m e 120 unità/Ω, punto 100 m/1Ω. Origine aperta indica limiteL→0, fuori dominioL>0. Barre 1/4/5/2Ω lunghe 80/320/200, scala 80; provaB area 1 mm² distinta dalla retta.

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `05ddea2cd3ae204c1d1e3df3881bde6e7691602f2931c8c6fcc248bd0d559c08`.

## AR-u6-wire-resistance-02

Derivazione e calcolo manuale: La resistenza ha unità Ω=V/A. Nella legge(Ω·m)·m/m² rimaneΩ; resistività ha inveceΩ·m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Ω·m misura ρ, m lunghezza, A corrente e V tensione. Il simbolo A della sezione è distinto dall’unità ampere.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Ω`. Firma: `bd9aff05ddb0f4e638cb2b8665b167e0f427422fef883ee09ffd81383f0d735a`.

## AR-u6-wire-resistance-03

Derivazione e calcolo manuale: Con ℓ=L/(1 m), a=A/(1 mm²), R/(1 Ω)=(2·10⁻⁸/10⁻⁶)ℓ/a=ℓ/(50 a). Il coefficiente 1/50 incorpora la conversione mm²→m² e la resistività assegnata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: ρA/L ha unità Ω·m²; il reciproco di ρ altera la dipendenza dal materiale. Il prodotto con A inverte la legge e L² è assente.

Didattica: Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.

Figura: XML e rendering integrale: filo e sezione sono due viste schematiche con scale indipendenti dichiarate; conversione 2 mm²→2·10⁻⁶m². RettaR(L) conarea 2 mm² fissata, da(0, 0) aperto a(200 m, 2Ω), scale 2 unità/m e 120 unità/Ω, punto 100 m/1Ω. Origine aperta indica limiteL→0, fuori dominioL>0. Barre 1/4/5/2Ω lunghe 80/320/200, scala 80; provaB area 1 mm² distinta dalla retta.

Modalità AI_CONCEPTUAL. Risultato indipendente: `R = ρ L / A`. Firma: `e46ed9fb51953fc67ea70ab3f457ee5ad7b8cdc8bd53e225536f6d344f273209`.

## AR-u6-wire-resistance-04

Derivazione e calcolo manuale: A dà 1 Ω con 100 m. B con 1 m e stessa sezione 2 mm² dà 1/100 Ω; dipendenza lineare daL, non daL². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 100 Ω inverte la dipendenza; uno ignora la modifica. 1/50 Ω omette l’area numerica due e 1/2 non riduce di cento volte.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 1 a 1/100 Ω`. Firma: `a2f953c147c8ba23e5e2dae73b32ee839beb1f0b814698138540e584ec052196`.

## AR-u6-wire-resistance-05

Derivazione e calcolo manuale: L=RA/ρ. ConR 1 Ω eA 2·10⁻⁶ m² si haL 100 m. Nelle unità numeriche ℓ=50 a(R/Ω)=100. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 50 m omette l’area numerica due; 200 m darebbero 2 Ω. Moltiplicare per ρ non isola L e altera le dimensioni.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `100`. Firma: `7dca87781606c1b197424cf0e37c6ec529e3f79a009ed554045cc01827243324`.

## AR-u6-wire-resistance-06

Derivazione e calcolo manuale: A=ρL/R=2·10⁻⁸·100/1 m²=2·10⁻⁶ m²=2 mm². L’area richiesta non è un diametro o raggio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 1/2 mm² darebbe 4 Ω. Due m² perde il fattore 10⁶ della conversione e 4 mm² darebbero 1/2 Ω.

Didattica: Seconda inversa o angolo autonomo con dominio e orientazione espliciti.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `83162f529e47524b74ad54d8ba4e6fe83bd87c74c471d38a5021b3b338065456`.

## AR-u6-wire-resistance-07

Derivazione e calcolo manuale: A con 100 m e 2 mm² dà 1 Ω; B a 1 mm² dà 2 Ω. Rapporto 2: dimezzare area raddoppiaR aL e ρ fissati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 1/2 rende diretta la dipendenza da A; uno ignora la modifica. Quattro introduce un quadrato e il negativo contraddice resistenze passive positive.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `c4b8f125479d6b187d82f6b0f82fbc09b9de3bbcf306dd0a3a7fdc9e9d154c6b`.

## AR-u6-wire-resistance-08

Derivazione e calcolo manuale: Corretto 1 Ω, proposta 2 Ω: scarto+1 Ω. Il rapporto 2 non ha unità di resistenza. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: −1 Ω inverte l’ordine; due Ω copia la proposta, zero la accetta. Due puro è una grandezza diversa dallo scarto.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `6beba3557e9b7b2addadba9a91fe505bfc2d05e052549c060198c5db1b8e6bab`.

## AR-u6-wire-resistance-09

Derivazione e calcolo manuale: DaR=ρL/A segue L=RA/ρ, dominio R, A, ρ positivi. In unità dichiarate L/(1 m)=50(R/Ω)[A/(1 mm²)]. Non si usa la stessa formula numerica con A immessa inm². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Rρ/A ha unità Ω²/m, ρA/R ha m³ e R/(ρA) ha m⁻³. RAρ non è una lunghezza; tutte le alternative ricomposte nella legge falliscono.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `L = R A / ρ`. Firma: `79b3d38b799ff681cd98f1cdfa33b849efc1788ac0c766045a783a5cdefedfe4`.

## AR-u6-wire-resistance-10

Derivazione e calcolo manuale: L_B=κ₁L_A eA_B=κ₂A_A aρ invariata danno R_B/R_A=κ₁/κ₂. Non si impone volume costante in questa famiglia di fili indipendenti. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Il prodotto rende diretta A, il reciproco inverte B/A. κ₂² confonde un fattore d’area con un fattore lineare; κ₁² inventa una dipendenza quadratica da L.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁/κ₂`. Firma: `4b36a284b57054c65b1dd4cbf2d482ba7205a874c33a3fc65932a1d226ab576e`.

## AR-u6-wire-resistance-11

Derivazione e calcolo manuale: A 1 Ω; B con 200 m e 1 mm² dà 200/50=4 Ω. Rapporto 4, fattore 2 dalla lunghezza e 2 dall’inverso dell’area. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Due considera un solo cambiamento; 1/4 inverte B/A e uno presume una compensazione. Entrambi i cambiamenti aumentano la resistenza.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `ce809940da763df394cf3c5a8feda33500da2198d298121f15ac3bed2c809da3`.

## AR-u6-wire-resistance-12

Derivazione e calcolo manuale: Media=(1+4)/2=5/2 Ω. Ai dati medi L 150 m eA 3/2 mm² si avrebbe 150/[50·(3/2)]=2 Ω, distinto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Due Ω usa i dati medi, cinque somma, 3/2 è semidifferenza e quattro copia B. Serie e parallelo di fili sarebbero altri esperimenti.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: XML e rendering integrale: filo e sezione sono due viste schematiche con scale indipendenti dichiarate; conversione 2 mm²→2·10⁻⁶m². RettaR(L) conarea 2 mm² fissata, da(0, 0) aperto a(200 m, 2Ω), scale 2 unità/m e 120 unità/Ω, punto 100 m/1Ω. Origine aperta indica limiteL→0, fuori dominioL>0. Barre 1/4/5/2Ω lunghe 80/320/200, scala 80; provaB area 1 mm² distinta dalla retta.

Modalità EXACT_ORACLE. Risultato indipendente: `5/2`. Firma: `c9e3651d57d25af4fb06431fff331d2ed83fee570e325d9858ef73a9f2614c5f`.

## AR-u6-wire-resistance-13

Derivazione e calcolo manuale: Bersaglio 4 Ω. ConL_B 200 m serve A_B=200/(50·4)=1 mm². Rapporto A_B/A_A=1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Due inverte il rapporto; 1/4 ignora L raddoppiata. Quattro copia il bersaglio e uno darebbe 2 Ω. I fattori due della lunghezza e dell’inverso dell’area si moltiplicano.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `58af4b04ad70eb4c54747520a1ed17447e3af16fc4d85c299518b15f8d463861`.

## AR-u6-wire-resistance-14

Derivazione e calcolo manuale: Riferimento 1 Ω eS 3: a_cal 3 nella scala strumentale perΩ. S 12 decodificaR_B 4 Ω; A_B 1 mm² implicaL_B=50·4·1=200 m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 600 m usa D come ohm; quattro copia R e cinquanta il coefficiente numerico di conversione. ρ resta fissata.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `200`. Firma: `e0600cb4d8985056356efe82be278499d58d9870bf78efea5503ab892428d12c`.

## AR-u6-wire-resistance-15

Derivazione e calcolo manuale: Riferimenti 1 e 4 Ω, letture 3 e 9: a_cal=(9−3)/(4−1)=2, b_cal 1. S_C 26/25 dà R_C=(26/25−1)/2=1/50 Ω. ConA_C 1 mm², L_C=50·(1/50)·1=1 m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: 26 m omette b, due m non divide per il guadagno. 1/50 copia il numero della resistenza e 50 m ignora il piccolo eccesso sopra l’offset.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `e6238dfd8c07dfe19be66e2a5b10b9b16439eb5bbc124e05a8aad8ffd8f9fa2e`.

## AR-u6-wire-resistance-16

Derivazione e calcolo manuale: Il vincolo nelle unità dichiarate L/(1 m)=50[A/(1 mm²)] corrisponde aL=(50 m/mm²)A. Sostituendo nella legge si haR 1 Ω per ogniA>0. Infinite coppie positive continue, per esempio(100 m, 2 mm²) e(50 m, 1 mm²); misura ridondante, non un conteggio intero di resistori. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.

Distrattori: Le coppie singole sono esempi; L e A devono restare legate dal rapporto assegnato. Non si impone un volume conservato fra le preparazioni.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie positive`. Firma: `60e863d3fbdb5c6d9b7cc2bbd8cfe26b09c3c05d8fe16b0b8031a426c2fc5442`.
