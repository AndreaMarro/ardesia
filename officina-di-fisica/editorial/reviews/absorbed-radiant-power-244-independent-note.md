# Revisione indipendente absorbed-radiant-power-244

Primaria prompt-only 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 8f63b33ab1ed4f6d105b9898322bbeff6ed6c79e, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L06 copre fase, lunghezze d’onda e potenza dai campi; C5-L07 copre fotoni, tassi e bilancio radiativo, con fondazioni reali L02/L04.

XML and full 640×1480 native read. Panel 1 uses 40 coordinates/W: 8 W length 320, two 4 W bars 160. Panel 2 at 8 W total has same 40 coordinates/W; segments 160+160 and 80+240 represent transmitted/absorbed 4+4 and 2+6 W. Panel 3 separate common 32 coordinates/W gives lengths 128, 288, 208 for absorbed 4, 9, 13/2 W. Panels explicitly distinguish scenarios; labels and shared origins clear, no overlap or physical-scale defect.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u7-absorbed-radiant-power-01

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Con potenza trasmessa P_t=τP₀ e riflessione trascurabile, conservazione dell’energia dà P_ass=P₀−P_t=P₀(1−τ). Per 8 W e τ=1/2 si assorbono 4 W. È la componente assorbita della radiazione incidente, non automaticamente incremento di energia interna senza altri scambi.

Distrattori: 8 W ignora la trasmissione, 16 W supera l’ingresso dividendo perτ, 0 ignora l’assorbimento. τ e 1−τ coincidono solo nel caso particolare 1/2, non come leggi generali.

Didattica: Legge motivata e unità normalizzate distinte dalle grandezze fisiche.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 66f7f7304b697fb274fee7f58f1c95f6b20cb6c8afc6704a1c83a09012730d45.

## AR-u7-absorbed-radiant-power-02

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Una potenza assorbita è in watt, J/s. La trasmittanza è un rapporto di potenze adimensionale, non l’unità richiesta.

Distrattori: J è energia, W/m² intensità, s tempo e 1 trasmittanza. Moltiplicare per una frazione pura conserva W.

Didattica: Dimensione ricostruita e prefisso distinto dall’unità fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 24393bad5af88986b0e2a681366d0c6ec028490264676e957414f14ba5bc21e6.

## AR-u7-absorbed-radiant-power-03

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P_ass=P₀(1−τ) deriva sottraendo potenza trasmessa da quella incidente nel bilancio senza riflessione. Il dominio 0<τ<1 implica 0<P_ass<P₀.

Distrattori: P₀τ è trasmessa, P₀/τ eP₀(1+τ) superano l’ingresso, τ/P₀ haW⁻¹. La coincidenza aτ1/2 non rende equivalenti le leggi generali.

Didattica: Caso autonomo o legge riconosciuta dalle ipotesi effettive.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 77ccb9eab5fa227288036a39e4f6a28d0fc190e3d572b03b5e7a151f3dd3619f.

## AR-u7-absorbed-radiant-power-04

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: A τ=1/2 fissata P_ass è lineare in P₀: da 8 a 12 W incidenti si passa da 4 a 6 W assorbiti, fattore 3/2.

Distrattori: 8/3 W inverte 3/2, 9 W applica(3/2)², 12 W ignora la trasmissione e 4 W il nuovo ingresso. Aτfissa la potenza assorbita è lineare inP₀.

Didattica: Confronto controllato a un solo parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 39ee723de68a0143008e98f6bbc66645c1a24a968a47d1a81c25c1b574f13fdf.

## AR-u7-absorbed-radiant-power-05

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P₀=P_ass/(1−τ)=4/(1/2)=8 W. Il denominatore è strettamente positivo nel dominio dato.

Distrattori: 2 W applica di nuovo la riduzione ed è minore dell’assorbita; 4 W ignora la trasmissione e 16 W darebbe 8 W assorbiti. Il denominatore 1−τ è positivo.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d096f5984dd6bd79b1a1ea689f183203da62e540f77cc849329ce3c227b9cbdc.

## AR-u7-absorbed-radiant-power-06

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: τ=1−P_ass/P₀=1−4/8=1/2, adimensionale e fra zero e uno.

Distrattori: 2 viola il dominio, 0 e 1 sono confini esclusi. P_ass/P₀ da solo è frazione assorbita, non sempre trasmittanza; il complemento è indispensabile.

Didattica: Seconda inversa con dominio e unità verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b5e427ccdff32f33404643161df490ba27e4e21b43d3e53d628249bb0e9887c8.

## AR-u7-absorbed-radiant-power-07

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: A=4 W. A P₀=8 W e τ_B=1/4 si ha B=6 W; rapporto B/A=3/2. Ridurre la trasmittanza aumenta l’assorbimento se la riflessione è trascurabile.

Distrattori: 2/3 è reciproco, 1/2 rapporto delle trasmittanze, 2 il reciproco di queste e 1 ignora il complemento. 4/6 W assorbiti danno 3/2.

Didattica: Due uscite ricostruite prima del rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c5c69f3968862e2d8ff1d1cf9a13905f48746933e03b810307557eb0474cbcb7.

## AR-u7-absorbed-radiant-power-08

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Proposto 8 W meno corretto 4 W dà +4 W. Usare tutta la potenza incidente ignorerebbe quella trasmessa.

Distrattori: −4 W scambia ordine, 2 è rapporto, 8 W proposta e 0 l’accetta. Lo scarto 4 W mantiene dimensione di potenza.

Didattica: Differenza ordinata distinta da un rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 56b7405bc144c080ecfee9b72ca8004a7d5201167c7b049498dc4b5b068cffa7.

## AR-u7-absorbed-radiant-power-09

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P₀=P_ass/(1−τ). Non si divide per τ, che è la frazione trasmessa anziché assorbita; τ=1 non è nel dominio dell’inversa.

Distrattori: Moltiplicare per 1−τ ripete la riduzione, dividere perτ confonde trasmissione e assorbimento; reciprocoW⁻¹ eP_ass−τ è dimensionalmente incoerente.

Didattica: Inversa simbolica con dimensioni e dominio.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 03512fb3559b1e6829de3d2974e13143d93acc148bbae7bea071a17985eecceb.

## AR-u7-absorbed-radiant-power-10

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P_ass, B/P_ass, A=κ₁(1−κ₂τ)/(1−τ). Occorrono 0<τ<1 e 0<κ₂τ<1, oltre a κ₁, κ₂>0. Non si sostituisce 1−τ con un rapporto lineare di τ.

Distrattori: Prodotto/quoziente dei fattori ignorano il complemento. Il reciproco scambia A/B e la somma fallisce aκ₁=κ₂=1. Occorreκ₂τ_A<1 per un modello assorbente.

Didattica: Fattori inseriti nella legge effettiva, senza analogie improprie.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 00f1fd185cad0815a93fb61071659d92e76fbe54b79f2fb5534fdf6e11ee490a.

## AR-u7-absorbed-radiant-power-11

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: A=8·1/2=4 W e B=12·3/4=9 W. Rapporto 9/4; entrambi gli ingressi cambiano.

Distrattori: 4/9 inverte il rapporto, 3/2 segue soloP₀ e 1/2 soloτ. 3/4 confronta in realtà potenze trasmesse(3 W)/(4 W), non assorbite 9 W/4 W.

Didattica: Entrambi gli ingressi considerati nel nuovo stato.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 65ed9dd91f5157744c88e8da219ef1db32573e336e9747029689f04c5ba56401.

## AR-u7-absorbed-radiant-power-12

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Media uscite=(4+9)/2=13/2 W. I parametri medi P₀=10 W e τ=3/8 darebbero 25/4 W. Media uscite meno modello agli ingressi medi=1/4 W.

Distrattori: 25/4 W usa i dati medi, 13 W somma, 5/2 W semidifferenza e 9 W solo B. Media 13/2 W e modello ai medi 25/4 W differiscono di 1/4 W.

Didattica: Media delle uscite distinta dagli ingressi medi.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f7dfd04050de011520f16c8042a53059747c6225834f67a1da1eb3a859062bc2.

## AR-u7-absorbed-radiant-power-13

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Il target è (9/4)·4=9 W. Con P₀, B=12 W, 1−τ_B=3/4, τ_B=1/4. Il rapporto τ_B/τ_A è 1/2, non il rapporto degli assorbimenti.

Distrattori: 2 inverteτ_B/τ_A, 9/4 copia il target assorbito e 4/9 il suo reciproco.3/2 è rapporto dei complementi assorbiti, non diτ.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ed1b8d3a4693e6641068d6cdc3bdb52b0fb9b58c9e51f48dd18da72cc14b4718.

## AR-u7-absorbed-radiant-power-14

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P_ass, A=4 W con S=12 dà guadagno 3 per watt. S=27 corrisponde a 9 W assorbiti; τ=1/4 implica P₀=9/(3/4)=12 W.

Distrattori: 36 W leggeD 27 come 27 W e prediceD 81; 9/4 W moltiplica perτ invece di dividere per 1−τ; 8 W ripete A e dàD 18. Inversa corretta 12 W.

Didattica: Taratura rimossa prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 94f1216bbbe517e950f53d0562d6ca084b2ac2500eb42d5f423792104325a75b.

## AR-u7-absorbed-radiant-power-15

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: Due riferimenti 4 e 9 W con letture 9 e 19: a=(19−9)/(9−4)=2 per watt, b=1. S_C=13 dà P_ass, C=6 W. Con τ_C=1/2 si ricava P₀, C=12 W.

Distrattori: 13 W ometteb e prediceD 14; 24 W ometteg dopo b; 6 W copiaP_ass. 12 W dà 6 W assorbiti eD 13.

Didattica: Guadagno e offset identificati da due riferimenti distinti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma fc3bf8d965a1e844b1b96956bd829b1cdfb46af9708ccc0b4aa5166bb171db5b.

## AR-u7-absorbed-radiant-power-16

Ipotesi: P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.

Derivazione manuale: P₀=(16 W)τ porta P_ass=(16 W)τ(1−τ)=4 W. Si ottiene 4τ²−4τ+1=0, cioè (2τ−1)²=0. Unica trasmittanza τ=1/2 nel dominio aperto; è una radice doppia, non due soluzioni distinte.

Distrattori: τ1/4 e 3/4 danno 3 W nel vincolo, τ2 viola 0<τ<1. Al massimo 4 W il discriminante nullo dà un unico valoreτ1/2 con molteplicità 2, non due trasmittanze distinte.

Didattica: Vincolo sostituito prima di decidere numero e dominio delle soluzioni.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 2af5880eb4473008e7b966b38fb0571176b0e33030d2a0e70cd3e5a7650c2eae.
