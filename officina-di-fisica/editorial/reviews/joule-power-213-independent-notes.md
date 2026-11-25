# joule-power-213 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 210–214 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuit-power-210-214-primary-source-only.md, SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Anche i modelli fonte-only sono stati congelati prima delle candidate: SHA97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f, commitf558411. U del candidato211 è V₂ della primaria; T del candidato214 è la durata t, distinta dal suo tempo internoτ. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 156d5924c9bbdfd8fa815c1d3af49ffb9226f255. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding21313: riletto finale che distingue il numero puro quattro dalla copia del valore numerico della resistenza in ohm.

## AR-u6-joule-power-01

Derivazione e calcolo manuale: Potenza elettrica entrante nel resistore passivo: P=VI. Per Ohm V=RI, quindi P=I²R. Con 2 A e 3 Ω si ha P=4·3=12 W. È conversione di energia elettrica in energia interna, non una quantità di calore contenuta nel corpo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Sei da IR è volt; 4 copia I², 18 usa IR², 36 quadra entrambi i parametri. Solo I²R ricompone 12W.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: Schema A(+) a sinistra, B(−) a destra, resistore 3Ω e corrente entrante dal lato A secondo testo. Parabola esatta P=3I² per 1≤I≤2: I=1+u, x 240+140 u, y 740−120 u−60 u², daM240740Q310680380560; origine degli assi 100800, scale 140 unità/A e 20 unità/W. Punti 3/12W corretti, label 3W fuori curva. Barre 12/4/8W lunghe 240/80/160, scala 20 unità/W; B haR4Ω separato.

Modalità EXACT_ORACLE. Risultato indipendente: `12`. Firma: `f9a8f5a818c7a765bcd893fc72d5be3fb2459e6724ee5e4fc02119126d6d4a41`.

## AR-u6-joule-power-02

Derivazione e calcolo manuale: La potenza ha unità W=J/s=V·A=A²Ω. La potenza e l’energia hanno dimensioni diverse; un intervallo sarebbe necessario per ricavare energia. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: J energia, V tensione, Ω resistenza, A corrente. Potenza W=J/s non si confonde con energia trasferita.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `W`. Firma: `2f89c774f829f42e7b0892aa862f43d518351d23aad24fd33484310c568c3a19`.

## AR-u6-joule-power-03

Derivazione e calcolo manuale: Un resistore ohmico a R costante soddisfa V=RI e P=VI=I²R. Il segno è positivo nella convenzione passiva; un’eventuale corrente orientata negativa darebbe ancora I²R, ma qui I>0 è assegnata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: IR ha V; IR² dipendenza errata daR; I²/R dimensioni non W; R/I² non derivato daVI. Passivo significa P positiva con riferimenti coerenti.

Didattica: Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `P = I² R`. Firma: `a9b3f75e8fc290a21f4ef6286b085fed4bb171956e468603dd7f7cb77a9a6e48`.

## AR-u6-joule-power-04

Derivazione e calcolo manuale: A 12 W; B a 1 A con 3 Ω dà 3 W. Dimezzare I riduce la potenza a un quarto, non a metà. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Sei applica legge lineare in I, 12 ignora, 24 e 48 invertono riduzione. Anche V cambia da 6 a 3V, non è tenuta fissa.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: Schema A(+) a sinistra, B(−) a destra, resistore 3Ω e corrente entrante dal lato A secondo testo. Parabola esatta P=3I² per 1≤I≤2: I=1+u, x 240+140 u, y 740−120 u−60 u², daM240740Q310680380560; origine degli assi 100800, scale 140 unità/A e 20 unità/W. Punti 3/12W corretti, label 3W fuori curva. Barre 12/4/8W lunghe 240/80/160, scala 20 unità/W; B haR4Ω separato.

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 12 a 3 W`. Firma: `0f65f50a8fef8490249d0ee846243eb68f4e5a596e0b64315902d3ec59bcde70`.

## AR-u6-joule-power-05

Derivazione e calcolo manuale: I=√(P/R), ramo positivo assegnato. Con 12 W e 3 Ω, I=√4 A=2 A. La radice negativa non è ammessa dal dominio della corrente qui dichiarato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Quattro A copia I² e dà 48W; −2 è verso e non modulo. Sei A dà 108W. R/P non ha A².

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `0baf9bf758bd0753daf9f2aaa8aa042609db12f43425630743e0c2f4611cd630`.

## AR-u6-joule-power-06

Derivazione e calcolo manuale: R=P/I²=12 W/(4 A²)=3 Ω. Non si divide per I una sola volta: quello darebbe una tensione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Sei Ω divide una volta e dà 24W; 48 moltiplica per I²; 1/3Ω dà 4/3W. I=0 e P0 non determinerebbero R.

Didattica: Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `d85ddeba1a3228250ab83ac1edef46d789865943b183b62cd319ee0de79b83ec`.

## AR-u6-joule-power-07

Derivazione e calcolo manuale: A 12 W; B con I 2 A e R 1 Ω dà 4 W. Rapporto 1/3 a corrente mantenuta; la dipendenza inversa da R varrebbe a tensione mantenuta, altro controllo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Tre sarebbe diverso controllo V costante; uno ignora R, 1/9 e 9 inventano R². A corrente fissata la legge è diretta in R.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/3`. Firma: `0aac144cba878c8532d24b202bcd6d73ce8f43b5444ceaba26e877b4ab118af3`.

## AR-u6-joule-power-08

Derivazione e calcolo manuale: Caso autonomo: utilizzatori in parallelo allo stesso 12 V. I_A=P_A/V=18/12 A=3/2 A, I_B=6/12 A=1/2 A. Rapporto I_A/I_B=3. Non è lo scarto proposto/corretto del modello principale e non richiede che i carichi siano resistori ohmici. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: 1/3 inverte A/B; due non segue 18/6; 12 copia V; uno presuppone correnti uguali. Differenza 1A è altro compito. P=VI comune dà 3.

Didattica: Caso08 autonomo: rapporto di correnti daP=VI con tensione comune, non scarto di proposta; carichi non necessariamente ohmici.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `27f3cd13ec0289c892f46b6e0e4c5094532570c5e8c82993bbc7f33cb22ed2e3`.

## AR-u6-joule-power-09

Derivazione e calcolo manuale: Da P=I²R segue I=√(P/R)>0. W/Ω ha unità A² e la radice restituisce ampere. La forma I=P/V è pure valida se si assume noto V, ma l’inversa in termini di P, R usa la radice. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: P/R è I², √(PR) è V, R/P è A⁻²; il ramo negativo non è modulo. La radice corretta ha A.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `I = √(P/R)`. Firma: `b84472142a9ec8b659e1ad50c299a2e5d10e24bd02db836551fd041581bb29b0`.

## AR-u6-joule-power-10

Derivazione e calcolo manuale: P_B/P_A=(κ₁I)²κ₂R/(I²R)=κ₁²κ₂. Il quadrato investe soltanto il fattore della corrente e un fattore comuneκ sui due ingressi dàκ³. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: κ₁κ₂ perde I, κ₁²/κ₂ scambia controllo, κ₂²κ₁ scambia esponenti, κ₂/κ₁² rende inverso I.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁² κ₂`. Firma: `bb96cf9fa64826ea357c304eb0f1cff56a883ba07975257f0caa3e8ac1e48d99`.

## AR-u6-joule-power-11

Derivazione e calcolo manuale: A 12 W; B con 1 A e 4 Ω dà 4 W. Rapporto 1/3: il fattore 1/4 dalla corrente compensa solo in parte il fattore 4/3 di R. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: Tre reciproco, 1/2 segue I, 4/3 segue R, 2/3 omette il quadrato della corrente. Il prodotto corretto è(1/4)(4/3)=1/3.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/3`. Firma: `baad55928eb177f8a070d3f051f6e0422516a97771dd17abbaa1a6cd5058c0c5`.

## AR-u6-joule-power-12

Derivazione e calcolo manuale: Media (12+4)/2=8 W. Ai dati medi I 3/2 A, R 7/2 Ω si avrebbe(9/4)(7/2)=63/8 W, distinto da 64/8 W. Le prove sono pesate ugualmente e non sono due resistori simultanei. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: 63/8 usa ingressi medi; 16 somma, 4 e 12 singole prove. Non è una media temporale senza durate assegnate.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: Schema A(+) a sinistra, B(−) a destra, resistore 3Ω e corrente entrante dal lato A secondo testo. Parabola esatta P=3I² per 1≤I≤2: I=1+u, x 240+140 u, y 740−120 u−60 u², daM240740Q310680380560; origine degli assi 100800, scale 140 unità/A e 20 unità/W. Punti 3/12W corretti, label 3W fuori curva. Barre 12/4/8W lunghe 240/80/160, scala 20 unità/W; B haR4Ω separato.

Modalità EXACT_ORACLE. Risultato indipendente: `8`. Firma: `aa6f886dec7b220ec2726aae6572dca6c17c859e0d55f0f0c9f8faa266f3f05f`.

## AR-u6-joule-power-13

Derivazione e calcolo manuale: Bersaglio P_B=(1/3)12=4 W. Con I_B 1 A, R_B 4 Ω e R_B/R_A=4/3. Si isola prima la resistenza dopo aver fissato la corrente nuova. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: 3/4 reciproco, 1/3 copia P, 2 usa solo inverso diI. Quattro copia il numero di R_B in ohm senza dividerlo per 3Ω.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `ccf354d58d8f8b3e64f6892838ee33634f7a93e59388234c8d9c50f73265a188`.

## AR-u6-joule-power-14

Derivazione e calcolo manuale: Riferimento 12 W→36 dà gain 3 per watt. S 12 decodifica P_B 4 W. Con R_B 4 Ω si ha I_B√(4/4)=1 A, ramo positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: √3A usa D12 come W, 2A dà 16W eD48, 4A dà 64W. Decodificare P4W prima di estrarre radice con R4Ω.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `2586ed1acd015d2146da885030247d0c6161fead57b37513020f413fb7330678`.

## AR-u6-joule-power-15

Derivazione e calcolo manuale: Riferimenti 12 W→25 e 4 W→9 danno a 2 per watt e b 1. S 37 decodifica P_C=(37−1)/2=18 W. R_C 2 Ω impone I_C√9=3 A. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: 37/4 usa I² ricavato senzaoffset come corrente; 9A dà 162W, 18A copia numero P; 1A ricompone D5. TreA ricompone D37.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `6027bf4f2a317177e1231cf79e2d7b6f1c57249f57c059cfdcdc3269dee61c45`.

## AR-u6-joule-power-16

Derivazione e calcolo manuale: Il vincolo dimensionato I=(2/3 A/Ω)R dà P=(4/9 A²/Ω²)R³. In unità ohm si trova R³=27 Ω³ e quindi R 3 Ω, unica radice positiva; I 2 A. La radice cubica reale di 27 è unica e positiva; nessun secondo ramo reale negativo soddisfa questa equazione. Il dominio R>0 è preservato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.

Distrattori: 27 copia cubo, 2Ω dà 32/9W, −3 viola passività e segno di I. Cubica strettamente crescente su dominio positivo, fissa R3Ω.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `d70a4f3adbc0bc03e16973cce1eb542ca4e59c5d08e348932606ca351a025bce`.
