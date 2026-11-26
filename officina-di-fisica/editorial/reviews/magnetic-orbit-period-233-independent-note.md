# Revisione indipendente magnetic-orbit-period-233

Primaria prompt-only 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 31face2d00ff2aa172edef0f5ff3f5e58e16dc1c, separata dalle prove automatiche.

Il catalogo C4 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; il caso autonomo 234-03 usa L09, gli altri flussi L10, e le quattro famiglie meccaniche magnetiche L09.

XML e PNG indipendente completo 640×1480 letti. Cerchio schematico, rapidità tangente e freccia di rotazione coerenti; nessun raggio numerico implicito. Etichette distinguono T=π s eτ=1/2 s. Barre da x 150 lunghe 80/320/200 rappresentanoτ1/2/2/5/4 s a scala 160 coordinate/s. Ultimi tre punti a massa 1 mg hanno origine(150, 1280), 80 coordinate/T e 160 coordinate/s, perτ1/1/2/1/4 s ai B 1/2/4 T. No interpolazione e B 0 escluso.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u6-magnetic-orbit-period-01

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Dalla forza centripeta si ha r=mv/(|q|B); dividendo la circonferenza 2πr per v si ottiene T_orbita=2πm/(|q|B). La variabile richiesta è τ=T_orbita/(2π)=m/(|q|B). Con m=10⁻⁶ kg, |q|=10⁻⁶ C e B=2 T, τ=1/2 s; il periodo completo è π s.

Distrattori: Un s ignora il campo 2 T; due s moltiplica anziché dividere per B; un quarto aggiunge un fattore due e zero viola masse e campi finiti positivi. Il periodo completo èπ s, nonτ.

Didattica: Legge motivata prima della sostituzione, unità e variabile richiesta distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 160e10f2b294be13284abcaf9b8d57870515da84d45af6bcda7b66ceb4ec042b.

## AR-u6-magnetic-orbit-period-02

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Il divisore 2π è adimensionale, quindi τ conserva la dimensione temporale del periodo e si esprime in secondi. Da m/(|q|B), usando T=kg/(C·s), si recupera s.

Distrattori: Hz è inverso di tempo; m e T sono lunghezza e campo. Dividere per 2π non elimina l’unità secondo.

Didattica: Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 190debce429fa809aaf29524b1c4c09f4bfc2aa0b723272385b742db758f510e.

## AR-u6-magnetic-orbit-period-03

Ipotesi: Elettrone con velocità iniziale non nulla esattamente parallela a B uniforme e statico, nessun campo elettrico o altra forza, radiazione trascurata. Non si ereditano perpendicolarità, |q|=1 μC o massa in mg degli altri quesiti. Forza nulla e velocità costante; nessun periodo di orbita circolare.

Derivazione manuale: Questa domanda autonoma riguarda un elettrone lanciato esattamente parallelo al campo, non il moto perpendicolare della famiglia numerica. Il prodotto vettoriale v×B è nullo e la forza magnetica è zero anche se la carica è negativa. Nel modello senza altri campi il moto resta rettilineo uniforme parallelo a B; non esiste un’orbita circolare finita a cui applicare il periodo della famiglia.

Distrattori: Cerchio o elica a raggio non nullo richiedono v_perp non nulla, esclusa dal prompt. Forza nulla non ferma una velocità iniziale e non aumenta la rapidità. Il segno negativo della carica non cambia il prodotto vettoriale nullo.

Didattica: Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 3e2de09dea4e4f82cc356cab81c7fee4d1e910f5404b79fde2fae8c5c3dc2e78.

## AR-u6-magnetic-orbit-period-04

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: A |q| e B fissi τ è proporzionale a m. La massa passa da 1 a 3 mg, quindi τ passa da 1/2 a 3/2 s, triplicando. Il periodo completo cambia con lo stesso fattore, ma non coincide con τ.

Distrattori: 1/6 s inverte la dipendenza da m; 9/2 applica il quadrato del fattore tre; 1/2 ignora la nuova massa e 3 s omette B 2 T. Si confrontano particelle preparate, non masse variabili nel tempo.

Didattica: Confronto controllato a parametro fissato, non evoluzione dinamica inventata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 00023bac414000b75ff528d2558092f004445781e82810b9b3620854a36ba888.

## AR-u6-magnetic-orbit-period-05

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Da τ=m/(|q|B) ricavo m=|q|Bτ. La sostituzione (1 μC)(2 T)(1/2 s)=1 μC·T·s=10⁻⁶ kg=1 mg dà la massa positiva richiesta.

Distrattori: Un mezzo mg copia τ e darebbe 1/4 s; due mg omette il numero 1/2 diτ e dà 1 s. Omettere micro nella carica sovrastima la massa di 10⁶.

Didattica: Prima inversa ricavata e reinserita nella legge diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 4ee3cc2312f170ca3938e1df44754919ce31014952f1e8c10306e5aeaadf6426.

## AR-u6-magnetic-orbit-period-06

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Isolo B=m/(|q|τ). Con m=1 mg, |q|=1 μC e τ=1/2 s risulta B=2 T. Le due potenze 10⁻⁶ di massa e carica si cancellano numericamente, non dimensionalmente.

Distrattori: Un mezzo T moltiplica m perτ nei numeri, un T ignoraτ. Sostituire il periodo completo al tempo ridotto senza 2π cambia la legge.

Didattica: Seconda inversa con denominatori positivi e distinzione fra modulo e verso.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 74954160d9d441d23acf46fe2a41d318ca191903ac2d0a373c74480f17bcc30d.

## AR-u6-magnetic-orbit-period-07

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Con massa fissata τ è inversamente proporzionale a B. Da 2 T a 1 T il valore passa da 1/2 s a 1 s; il rapporto τ_B/τ_A è 2. Non si usa il rapporto diretto dei campi.

Distrattori: Un mezzo segue direttamente B; quattro ne usa il quadrato, uno ignora la differenza e zero è escluso dal dominio positivo.

Didattica: Due uscite ricostruite prima del rapporto adimensionale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 8bdc0b7a75efef87b17f44e0a2ed7e7a58b8dbf2be2cea57165dee1ebc156cde.

## AR-u6-magnetic-orbit-period-08

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Il corretto τ è 1/2 s. La proposta 1 s sovrastima di 1−1/2=+1/2 s. Questo è lo scarto della variabile τ, non del periodo completo T_orbita.

Distrattori: −1/2 s inverte lo scarto; due è rapporto puro e un s copia proposta. Zero la accetta. Lo scarto conserva la dimensione temporale.

Didattica: Ordine dello scarto preservato, separato dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ce74f982f5c8b6027f3d808e6ef5517bd1edcee457f59833ccacc1232ca7aa03.

## AR-u6-magnetic-orbit-period-09

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Moltiplicando τ=m/(|q|B) per |q|B si ottiene m=|q|Bτ. Per i valori normalizzati m/(mg)=[B/(T)][τ/(s)], grazie a |q|=1 μC. Omettere |q| nella legge delle grandezze fisiche produrrebbe dimensioni errate.

Distrattori: τ/(|q|B) ha s²/kg, |q|B/τ kg/s², Bτ/|q| kg/C².2π|q|Bτ ha la dimensione giusta ma introduce un fattore non previsto dalla definizione diτ.

Didattica: Inversa simbolica con coefficienti dimensionali espliciti.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma dc0b956b9885cbd008798b52b49195b8bfaa6c50d1e46c6fd66d9ae0ffbc039a.

## AR-u6-magnetic-orbit-period-10

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Nel rapporto fra prove |q| resta uguale; τ_B/τ_A=(κ₁m)/(κ₂B) diviso m/B=κ₁/κ₂. Le due prove restano perpendicolari e non relativistiche. Il fattore 2π non compare perché è già separato nella definizione di τ.

Distrattori: Il prodotto rende diretta la dipendenza dal campo; il reciproco scambia A/B e il quadrato di massa cambia la legge. La somma dei fattori vale due per stati identici.

Didattica: Fattori inseriti nella legge effettiva prima di semplificare.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 9437074fa7023b568b780eb5c8ab9ac5a630384291cf874454cb5bd8598999d3.

## AR-u6-magnetic-orbit-period-11

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: A dà τ_A=1/2 s; B con m=2 mg e B=1 T dà τ_B=2 s. Il rapporto è 2/(1/2)=4. Il raddoppio della massa e il dimezzamento del campo moltiplicano entrambi τ per due.

Distrattori: Un quarto inverte il confronto. Due segue un solo fattore e un mezzo copia B_B/B_A senza invertirlo. Uno confonde due effetti che si rinforzano con una compensazione.

Didattica: Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 8c567e964ae51f93ae1bcaf4910082780545c6f0730697b0f185080076c014c7.

## AR-u6-magnetic-orbit-period-12

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: La media delle due letture 1/2 s e 2 s è 5/4 s. Il modello agli ingressi medi m=3/2 mg e B=3/2 T darebbe invece 1 s. La differenza media delle uscite meno uscita agli ingressi medi è 1/4 s. Non si confonde questa media tra prove col periodo di una sola orbita.

Distrattori: Un s usa gli ingressi medi; 5/2 s somma senza mediare; 3/4 è semidifferenza. Zero non è una media di tempi positivi. Per il periodo completo medio servirebbe anche 2π.

Didattica: Media delle uscite distinta da modello agli ingressi medi e da media temporale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f055ee29d88e79a6cd7d2f3b34cf04cce4c624172b2327f78ec59c5ff96f52e1.

## AR-u6-magnetic-orbit-period-13

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Si impone τ_B=4·(1/2 s)=2 s con m_B=2 mg. Da B=m/(|q|τ) risulta B_B=1 T. Rispetto a B_A=2 T il rapporto richiesto è 1/2.

Distrattori: Due inverte il campo richiesto; quattro copia il bersaglio temporale e uno mantiene il campo. Un quarto impone B_B 1/2 T eτ_B 4 s, non 2 s.

Didattica: Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 649949c61209891bc1d1b9b088c75f584b7a5c8a51094e808ed3af282f5ce3e2.

## AR-u6-magnetic-orbit-period-14

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Il riferimento ha τ=1/2 s e S=3/2, quindi a=3 unità strumentali/s. La nuova lettura S=6 corrisponde a τ=2 s. Con B=1 T, m=|q|Bτ=2 mg. La taratura precede l’inversione fisica.

Distrattori: Sei mg tratta D 6 come 6 s e predice D 18. Un mezzo mg copiaτ_A e predice D 3/2 con B_B 1 T. Un mg ignora la preparazione nuova.

Didattica: Guadagno del display rimosso prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma a161a519f97ad81a549586720f41f6e56abc03847851c21cd9a2db540708146a.

## AR-u6-magnetic-orbit-period-15

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: I riferimenti sono (τ, S)=(1/2 s, 2) e (2 s, 5). La pendenza è (5−2)/(2−1/2)=2 unità strumentali/s e l’offset è 1. S_C=4 dà τ_C=(4−1)/2=3/2 s. Con B_C=2 T si ricava m_C=3 mg.

Distrattori: Quattro mg omette b e predice D 5; sei mg sottrae b ma salta a. Mezzo mg riusa un numero del riferimento senza decodificare C. Tre mg ricomponeτ_C 3/2 s eD 4.

Didattica: Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 260295adf84aaaa4a84afe83635972a8893f73d2d964c1bc805f37abf6607ca0.

## AR-u6-magnetic-orbit-period-16

Ipotesi: Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.

Derivazione manuale: Il vincolo dimensionato m=(1/2 mg/T)B rende m/(|q|B)=1/2 s identicamente. La misura di τ non aggiunge un’equazione indipendente: esistono infinite coppie continue positive, per esempio (B, m)=(2 T, 1 mg) e (1 T, 1/2 mg). Si possono scegliere velocità perpendicolari non relativistiche; non si impongono conteggi interi a masse o campi.

Distrattori: Il campo si cancella nel rapporto imposto. Non nasce una quadratica con due radici e non è richiesto B intero. Le due coppie d’esempio non esauriscono il continuo delle possibilità.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 263685d0e1f67576c47970d6e095437e6a160118fd8d65e58b862975df8e6870.
