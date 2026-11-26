# Revisione distinta cric-c2-l010

Dieci problemi originali distinti. Primaria e modello pre-key congelati prima delle chiavi; nessun modulo autore B o primaria opposta aperti. Edizione finale confrontata byte per byte con Git. Lettura individuale completa; figura nuova controllata in XML e in un PNG indipendente intero.

Verdetti AI degli oracoli: 10/10. Il target comune effettivo è 19/19; non è una prova UI del prodotto né un’approvazione umana. Integrazione canonica Root ancora da eseguire.

## C2-Q091

Ipotesi e dominio: Volume fissato, γ positiva isotropa uniforme e forzanti esterne trascurabili; superficie libera ideale e costo superficiale, non densità nulla.

Calcolo e controllo manuale: Per una goccia libera di volume fissato, tensione superficiale isotropa positiva e gravità trascurabile, la forma sferica minimizza l’area e quindi l’energia libera superficiale γA nel modello assegnato. Non è la minimizzazione del volume: quello è vincolato dalla quantità di liquido. Un supporto o campi esterni potrebbero cambiare la forma, qui esclusi dall’idealizzazione.

Confronto delle risposte errate: Aumentare area costa più energia, non serve γ zero; perdere volume o invocare gravità contraddice le ipotesi.

Verifica: AI_CONCEPTUAL; firma `272ae574a474726757ea83e2f874fddf911b3164b4cd6237628c3207e48d25c7`.

## C2-Q092

Ipotesi e dominio: Modello assegnato ΔEγΔA a temperatura e γ fisse: costo superficiale/free energy del lavoro minimo, non calore o energia interna generale. Una sola nuova interfaccia.

Calcolo e controllo manuale: Una sola interfaccia: ΔA=3·10⁻⁴ m² e γ=1/20 N/m. Il prodotto γΔA=(3/20)·10⁻⁴ J=15·10⁻⁶ J=15 μJ. A temperatura fissata questo è l’incremento dell’energia libera superficiale e il lavoro minimo quasistatico nel modello γ costante. Non si raddoppia l’area come in un film con due facce né si identifica automaticamente tutto ciò con un calore o l’energia interna del liquido.

Confronto delle risposte errate: 30 µJ conterebbe due aree fisiche. cm² richiede 10⁻⁴m²;γ/area non è energia e nessun fattore 2 va aggiunto alla singola interfaccia.

Verifica: EXACT_ORACLE; firma `c3915b50d0ab36491290d55a02dd9d0f546d85194c43f4e2b51b2fe9d5337f99`.

## C2-Q093

Ipotesi e dominio: Film sottile a due interfacce fisiche;γ 1/40 N/m e bordo 1/25 m, contributi concordi e modulo totale richiesto in mN.

Calcolo e controllo manuale: Il film ha due interfacce: ciascuna tira il bordo con γℓ. Con γ=1/40 N/m e ℓ=1/25 m, F_tot=2/(40·25) N=1/500 N=2 mN. Il fattore 2 conta le due facce dichiarate; non si aggiunge un altro fattore per i due estremi del bordo. Le due trazioni sono concordi sul bordo mobile. La candidata chiede mN: 1/500 N corrisponde esattamente a 2 mN.

Confronto delle risposte errate: Una faccia darebbe 1 mN;4 m anziché 4 cm dà forza cento volte maggiore. γ in N/m non è la forza finale.

Verifica: EXACT_ORACLE; firma `18ffe97cd20fc2ebc6ecf309c2cad8168926a301f7707ad933edee20db7503af`.

## C2-Q094

Ipotesi e dominio: Angolo attraverso il liquido 120°, atmosfera comune e gas trascurabile; quota positiva verso l’alto rispetto alla superficie esterna e modello capillare statico.

Calcolo e controllo manuale: Nel modello capillare statico h=2 γ cos θ/(ρgr), con h positivo sopra il livello esterno. L’angolo attraverso il liquido è 120°, quindi cos θ=−1/2 e h<0: depressione, livello interno inferiore. Non è una risalita positiva; il segno deriva dall’angolo di contatto, non da una tensione superficiale negativa.

Confronto delle risposte errate: cos 120−1/2 implica h negativa; zero appartiene a 90° e non si perde liquido per la depressione.

Verifica: AI_CONCEPTUAL; firma `dbf37e621645afed4e0a1fbf612e2cab14e0539ded366be4324393de92ec5e2a`.

## C2-Q095

Ipotesi e dominio: Una interfaccia per goccia, stessa γ esplicitamente assegnata, raggi 1/4 mm e deformazioni gravitazionali trascurabili; confronto di sovrapressioni, non assolute.

Calcolo e controllo manuale: Per due gocce sferiche a singola interfaccia e medesima γ, Δp=2 γ/r. Il raggio piccolo è un quarto di quello grande, perciò la sua sovrapressione è quattro volte 30 Pa:120 Pa. La γ comune è una condizione da verificare nella futura candidata, non conseguenza universale della sola composizione se cambiasse la temperatura. Non usare il fattore 4 di una bolla di sapone a due facce.

Confronto delle risposte errate: 7,5 Pa usa il rapporto diretto dei raggi;30 ignora il rapporto 4;480 impone un quadrato non presente in Laplace.

Verifica: EXACT_ORACLE; firma `c806717956d90b258321f0af95192dc9b12dab3092e14afa99f0022f7e8dafc0`.

## C2-Q096

Ipotesi e dominio: Stesso liquido e condizioni, r/g comuni, angoli attraverso il liquido 0°/60°; entrambe le risalite positive.

Calcolo e controllo manuale: Con r, ρ, g, γ comuni, h∝cos θ. Si ha cos 0°=1 e cos 60°=1/2, quindi h_60=h_0/2: il primo tubo sale il doppio del secondo. Entrambe le risalite sono positive; non si sommano o sottraggono gli angoli per confrontare le altezze.

Confronto delle risposte errate: Il solo liquido comune non fissa la bagnabilità. Due è il reciproco, zero richiede 90° e un livello negativo richiede un coseno negativo.

Verifica: AI_CONCEPTUAL; firma `b0879fb07abbadb623b8eb88101950d29de595731c004ba7569b25627298a093`.

## C2-Q097

Ipotesi e dominio: Interfaccia piana e nessuna altra sollecitazione interfaciale: curvature zero, non pressione assoluta zero né γ zero.

Calcolo e controllo manuale: Young–Laplace per una sola interfaccia ideale: Δp_curv=γ(1/R_1+1/R_2). Per superficie piana entrambe le curvature sono nulle e il salto di pressione di curvatura è zero. Non implica pressione assoluta nulla o tensione superficiale nulla. Altre trazioni interfaciali sono esplicitamente escluse.

Confronto delle risposte errate: Raggio infinito corrisponde a curvatura zero.2 γ senza lunghezza non è pressione e l’atmosfera non misura curvatura.

Verifica: AI_CONCEPTUAL; firma `52215cfb90a1f7e86a2547ab6a6834102bccc475f5f9e4b6084a2e166c50aa5e`.

## C2-Q098

Ipotesi e dominio: Stesso capillare, bagnamento completo e ρ/g comuni;γ_B 7/10 γ_A e riferimento dell’altezza uguale.

Calcolo e controllo manuale: Nella stessa geometria, con uguali densità, gravità e angolo di contatto, h è proporzionale a γ. Quindi h_2/h_1=7/10 e h_2=20·7/10=14 mm. A bagnamento completo il coseno è 1; non si inverte la dipendenza dalla tensione superficiale.

Confronto delle risposte errate: 6 mm è la diminuzione, non l’altezza finale.200/7 inverte 7/10;20 e 10 mm ignorano il dato 70%.

Verifica: EXACT_ORACLE; firma `1cdf0382cf53009cd879309dbc2ead76365fe27818e51b96b967566b12bac8f7`.

## C2-Q099

Ipotesi e dominio: Otto sfere identiche positive senza perdita di volume diventano una sfera; area iniziale complessiva, non area di una sola figlia.

Calcolo e controllo manuale: Conservazione del volume:8·(4 πr³/3)=4 πR³/3, quindi R³=8 r³ e R=2 r. Area finale 4 π(2 r)²=16 πr²; area iniziale complessiva 8·4 πr²=32 πr². Il rapporto è 1/2. Non si confronta l’area finale con quella di una sola goccia né si fa crescere il raggio linearmente con il numero delle gocce.

Confronto delle risposte errate: 2 è rapporto di raggi;1/8 usa solo il numero. ConR 2 r l’area finale 16 πr² non è 8 πr², quindi non 1/4.

Verifica: EXACT_ORACLE; firma `071a994f230a69406a93ca5a1642bb5d9ea387ab15df3c59da3099531729bcf0`.

## C2-Q100

Ipotesi e dominio: Bolla gas nel liquido con una sola interfaccia materiale sferica, γ uniforme; due curvature della stessa interfaccia, non due facce di film.

Calcolo e controllo manuale: Una bolla di gas immersa in un liquido ha una sola interfaccia gas–liquido. Per una sfera le due curvature principali sono entrambe 1/R: Δp=2 γ/R. Il 2 viene dalle due curvature, non da due superfici. Una bolla di sapone con film sottile e due interfacce darebbe invece circa 4 γ/R; non è il sistema descritto. Pressione interna maggiore nell’ideale, senza ulteriori membrane o sollecitazioni.

Confronto delle risposte errate: Due curvature non sono due interfacce.γR è forza; il gas non elimina superficie o tensione e la dipendenza inversa dal raggio resta.

Verifica: AI_CONCEPTUAL; firma `32cee05145a909e75b10e7abe475df30634cbdc7c8eac5991e6f1928f4ed6a42`.
