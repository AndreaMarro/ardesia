# Revisione indipendente magnetic-flux-234

Primaria prompt-only 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 022df919c10dcdf159007018cf0ce0adb089f33e, separata dalle prove automatiche.

Il catalogo C4 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; il caso autonomo 234-03 usa L09, gli altri flussi L10, e le quattro famiglie meccaniche magnetiche L09.

XML e PNG indipendente completo 640×1800 letti. Superficie aperta in proiezione, B e normale paralleli concordi e frecce schematiche di grandezze diverse. Nel magnete N sinistra, S destra: percorso esterno da(170, 600) sopra al magnete fino(470, 600), freccia interna daS aN. Barre da x 150 lunghe 240/160/200 per 6/4/5 Wb a 40 coordinate/Wb. Grafico finale origine(150, 1600), 120 coordinate/T e 30 coordinate/Wb con punto(390, 1420) perB 2 T, Φ6 Wb, A 3 m² fissa. Origine aperta e dominio positivo espliciti.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

Riletto fix 234-09: B=Φ/(2A) ricostruisce BA=Φ/2, non il flusso misurato. Nessun fattore dovuto a interfacce è implicato.

## AR-u6-magnetic-flux-01

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Il flusso è Φ=∫B·n dA. Campo uniforme e normale concorde rendono cosθ=1, quindi Φ=BA=(2 T)(3 m²)=6 Wb. L’angolo nullo è quello con la normale, mentre il campo è perpendicolare al piano.

Distrattori: Dodici aggiunge due superfici non assegnate; −6 Wb cambia la normale e zero scambia campo perpendicolare al piano con campo tangente. Con normale concorde il flusso è positivo 6 Wb.

Didattica: Legge motivata prima della sostituzione, unità e variabile richiesta distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma bc58689247204e0b9ee215aad91c4f706a825e7fbf0bfe64f5e79f377b8371ed.

## AR-u6-magnetic-flux-02

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Il flusso magnetico si esprime in weber: Wb=T·m². Tesla misura il campo e m² l’area; il prodotto ha dimensione diversa da ciascuno dei due fattori.

Distrattori: T è il campo senza area; T/m² divide invece di moltiplicare. V e N sono tensione e forza. Wb=T·m² ha dimensione di flusso.

Didattica: Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma d90ec472f3c833b7162fdd617baa983a7a68d41e47a949703eb7e01ccddfdd16.

## AR-u6-magnetic-flux-03

Ipotesi: Caso autonomo del magnete a barra illustrato, linee seguite dentro e fuori e nessun monopolo. Il percorso disegnato chiude con versi N→S esterno e S→N interno. Il flusso nullo riguarda una superficie chiusa Σ, non l’area piana aperta degli altri record; non si afferma che ogni linea di ogni campo sia una curva finita chiusa.

Derivazione manuale: Considerando interno ed esterno di un magnete a barra, le linee del campo si completano in anelli chiusi: all’esterno vanno dal polo nord al sud e all’interno ritornano dal sud al nord. Non iniziano né finiscono realmente sui poli. Il flusso netto su una superficie chiusa è nullo; questo non contraddice un flusso positivo attraverso una superficie aperta orientata. Riletta la qualificazione finale del percorso illustrato, distinta da una pretesa universale di linee finite chiuse.

Distrattori: Fermare definitivamente le linee ai poli imita un campo con cariche magnetiche isolate. Eliminare l’interno o troncare al centro non completa il percorso; invertire entrambi i versi contraddice N/S. Il vincolo di flusso netto nullo è su superfici chiuse.

Didattica: Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 93f830306ebf576fe1ba6e793c3a229eacf05636ae1d021f209acf858a99e5b1.

## AR-u6-magnetic-flux-04

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Con area e orientazione fisse, Φ è proporzionale a B. Da 2 T a 1 T si passa da 6 a 3 Wb, cioè alla metà. Il segno resta positivo perché il campo resta concorde con la normale.

Distrattori: Dodici inverte la dipendenza da B; sei ignora la modifica. Zero richiederebbe B nullo o tangente, −3 un cambio di orientazione. Nessuno è il flusso concorde al nuovo campo 1 T.

Didattica: Confronto controllato a parametro fissato, non evoluzione dinamica inventata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 8459d850540b0af486bcc032a855c020c77d694bd9e3475b344ac640615fdc0b.

## AR-u6-magnetic-flux-05

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Isolo B=Φ/A. Con Φ=6 Wb e A=3 m² risulta B=2 T. L’area positiva evita la divisione per zero e la scelta della normale mantiene il campo concorde.

Distrattori: Diciotto moltiplica invece di dividere. Il rapporto A/Φ ha T⁻¹, non T; sei copia il flusso e−2 non è un modulo nel dominio.

Didattica: Prima inversa ricavata e reinserita nella legge diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d31160bd5809bcb511b8395901179102ea1bffca1a19874afe1795f8868956d2.

## AR-u6-magnetic-flux-06

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Da Φ=BA segue A=Φ/B. La sostituzione 6 Wb/(2 T)=3 m² restituisce l’area richiesta. Il campo assegnato è positivo e non nullo.

Distrattori: Dodici moltiplica, 1/3 inverte il rapporto, sei ignora B.√3 m sarebbe il lato di un eventuale quadrato, non l’area richiesta e neppure un dato necessario.

Didattica: Seconda inversa con denominatori positivi e distinzione fra modulo e verso.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0aecb979547b5d70f92f90ae5bcb8d1e9645146d6f9c1f6caee7b476302cc2a8.

## AR-u6-magnetic-flux-07

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: A B costante e normale invariata, il rapporto dei flussi coincide con quello delle aree: Φ_B/Φ_A=1/3. Le uscite sono 2 e 6 Wb. Il rapporto non ha unità e non introduce variazioni dell’angolo.

Distrattori: Tre inverte il confronto; 1/9 eleva nuovamente al quadrato un rapporto già di aree. Uno ignora l’area diversa e zero viola A>0.

Didattica: Due uscite ricostruite prima del rapporto adimensionale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0285d5eee87454bd9b2dd534721c3036c8f71fa58a293ba98258d42e0897bec5.

## AR-u6-magnetic-flux-08

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Il flusso corretto è 6 Wb. Con la convenzione proposto meno corretto, lo scarto è 12−6=+6 Wb. È una sovrastima del valore concorde, non un cambiamento della normale.

Distrattori: −6 inverte la sottrazione, due è rapporto puro, dodici ripete proposta e zero la accetta. Lo scarto deve conservare weber.

Didattica: Ordine dello scarto preservato, separato dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 149b6e31b5cc2c0691c017581fcd0c218831b21eddc859e051bb16274adb4b49.

## AR-u6-magnetic-flux-09

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: La legge generale è Φ=BA cosθ; qui θ=0 rispetto alla normale, perciò Φ=BA e B=Φ/A. Non si applica sinθ né si misura θ dal piano. Il dominio A>0 consente l’inversione.

Distrattori: ΦA ha T·m⁴, A/Φ T⁻¹ e la radice T¹ᐟ². La formula con 2 A ricostruirebbe BA=Φ/2, non il flusso misurato; non esiste un fattore due nel modello di questa superficie.

Didattica: Inversa simbolica con coefficienti dimensionali espliciti.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 0097aecfc40f9e6f49fb518cba3727b704643d01912e987b91675ace44d1e7aa.

## AR-u6-magnetic-flux-10

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Orientazione e uniformità sono preservate nei due stati. Dividendo (κ₁B)(κ₂A) per BA si ricava Φ_B/Φ_A=κ₁κ₂. La conclusione richiede lo stesso cosθ=1 in entrambe le prove.

Distrattori: Le divisioni rendono inverso uno dei due ingressi; κ₁² modifica la dipendenza lineare in B. La somma fallisce per fattori entrambi unitari, dando due invece di uno.

Didattica: Fattori inseriti nella legge effettiva prima di semplificare.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma a810e7a0eb54a0fe09116440219146617261b211da2ef8b9d56a95eeb3061a9a.

## AR-u6-magnetic-flux-11

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: In A il prodotto 2·3 dà 6 Wb; in B 1·4 dà 4 Wb. Il rapporto finale/iniziale è 4/6=2/3. Le due variazioni non si sommano: si moltiplicano nei rispettivi fattori.

Distrattori: 3/2 inverte il rapporto, 1/2 segue solo B e 4/3 soloA. Una compensazione esatta al campo 1 T richiederebbe 6 m², non 4 m².

Didattica: Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 195af0608567c3fc1a24ffea2bb82867456840f75c07dbd9d6b5026d6b74474d.

## AR-u6-magnetic-flux-12

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Le due letture sono 6 e 4 Wb e la loro media aritmetica è 5 Wb. Usando invece i valori medi B=3/2 T e A=7/2 m², il modello darebbe 21/4 Wb. La differenza fra le due costruzioni è 5−21/4=−1/4 Wb. Il quesito richiede la prima.

Distrattori: Dieci Wb somma senza mediare, 21/4 usa gli ingressi medi e uno è semidifferenza. Pesi statistici uguali non sono una divisione per un intervallo temporale.

Didattica: Media delle uscite distinta da modello agli ingressi medi e da media temporale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 230bc71f3e1a198e3bda1c2b4ced76abd6902d80bcf7f1f71371792fed3721ce.

## AR-u6-magnetic-flux-13

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Il nuovo flusso deve essere (2/3)·6=4 Wb. Con B_B=1 T si richiede A_B=4 m², quindi A_B/A_A=4/3. La normale resta concorde in entrambe le prove.

Distrattori: 3/4 inverte il rapporto; 2/3 copia il fattore dei flussi. Un terzo implica A_B 1 m² eΦ_B 1 Wb; due implica A_B 6 m² eΦ_B 6 Wb, non 4.

Didattica: Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c77e909ef2cff34e131b4b0add034dff26147de5287a683794baff0229c34bc7.

## AR-u6-magnetic-flux-14

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Il riferimento Φ=6 Wb con S=18 fissa a=3 unità strumentali/Wb. S=12 implica Φ=4 Wb. Con area 4 m², B=Φ/A=1 T. Non serve conoscere l’unità strumentale assoluta perché è coerente fra le prove.

Distrattori: Tre T usa D 12 come 12 Wb, quattro copia il numero del flusso e 2/3 copia il rapporto dei display senza l’area diversa. Un T dàΦ4 Wb eD 12.

Didattica: Guadagno del display rimosso prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 08f73f59aea316c317dc30ccd343eca8b8459e771a6734abb0477744fbf7a843.

## AR-u6-magnetic-flux-15

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: I riferimenti Φ_A=6 Wb, S_A=13 e Φ_B=4 Wb, S_B=9 danno a=(13−9)/(6−4)=2 unità strumentali/Wb e b=1. La lettura 41 significa Φ_C=(41−1)/2=20 Wb. Con A_C=5 m² segue B_C=4 T.

Distrattori: 41/10 T omette b e predice D 42. Otto T sottrae b ma salta a; venti copiaΦ_C senza dividerlo per 5 m². Quattro T ricostruisce l’intera taratura.

Didattica: Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma e2a26d8fbbba3fc4e30465802a28ed56123b66336f612a50ea43d6862eb76a66.

## AR-u6-magnetic-flux-16

Ipotesi: B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.

Derivazione manuale: Pongo a=A/(1 m²)>0. Il vincolo dimensionato B=(2/3 T/m²)A implica B/(T)=2 a/3. La misura Φ=6 Wb dà 6=(2/3)a², quindi a²=9 e a=3 nel dominio positivo. Si ottengono A=3 m² e B=2 T; la radice negativa non rappresenta un’area ammessa.

Distrattori: La radice−3 m² è fuori dominio. Nove m² dà 54 Wb dal vincolo, due m²8/3 Wb. La misura e il vincolo fissano la scala e non lasciano infinite aree positive.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 9a8609fc31eca9af561a6b6a28dab1b0da97158eb25c27e66a6f65156019b2d0.
