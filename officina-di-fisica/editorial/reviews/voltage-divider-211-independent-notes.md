# voltage-divider-211 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 210–214 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuit-power-210-214-primary-source-only.md, SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Anche i modelli fonte-only sono stati congelati prima delle candidate: SHA97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f, commitf558411. U del candidato211 è V₂ della primaria; T del candidato214 è la durata t, distinta dal suo tempo internoτ. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 156d5924c9bbdfd8fa815c1d3af49ffb9226f255. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding21109: atteso e riletto il testo finale che distingue i simboli dell’inversa per il ramo alternativo. Nessuna chiave,formula o figura modificata.

## AR-u6-voltage-divider-01

Derivazione e calcolo manuale: Nel circuito a serie senza carico, I=12 V/(R₁+R₂) e V₂=IR₂. Con 2 Ω e 2 Ω, I 3 A e V₂6 V. Corrente comune e cadute positive sommate a 12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Dodici V non lascia caduta al primo resistore positivo; 3 copia I, 4 copia Rtot, 2 copia un resistore. U=IR₂ dà 6 V.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: Circuito con generatore positivo in alto, R₁ sopra M, R₂ sotto M, morsetti M/B aperti e nessun corto o carico. Barre centrali cadute 6+6 e 4+8V lunghe 180+180 e 120+240, scala 30 unità/V. Ultime uscite 6/3/9/2V lunghe 240/120/180, scala 40 unità/V; B finale distinto da caso centrale. Zeri fuori assi e label non sovrapposte.

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `08f2bce6c9aeb790efb1c9622ca2be47faa1cf7e8393b5dc9c0bd781899bfb31`.

## AR-u6-voltage-divider-02

Derivazione e calcolo manuale: V₂ è una differenza di potenziale con unità V=J/C. Il rapporto di resistenze nella partizione è puro, quindi la dimensione resta quella della sorgente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: A, Ω, W sono corrente, resistenza, potenza; uno è solo il rapporto resistivo. Il rapporto puro moltiplicato per E è ancora tensione.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `V`. Firma: `9f43de84e2dcb5ebfd6f09391a7f0b258f72f6539684bd7fd3e788095874410e`.

## AR-u6-voltage-divider-03

Derivazione e calcolo manuale: Dalla legge di Ohm in ciascun ramo in serie e Kirchhoff: V₂=(12 V)R₂/(R₁+R₂). L’assenza di carico al nodo intermedio è necessaria per questa forma; con entrambi i resistori positivi si ha 0<V₂<12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: R₁ al numeratore dà la caduta superiore. Invertire frazione supera E; solo R₁ al denominatore perde il totale. ER₁R₂ ha unità VΩ².

Didattica: Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `U = E R₂ / (R₁ + R₂)`. Firma: `751f886ca5cf2e989bed4f38589ee31856d0172289f7faa5e2a24e7e08b9588b`.

## AR-u6-voltage-divider-04

Derivazione e calcolo manuale: A 6 V. B con R₁1 Ω, R₂2 Ω dà V₂=12·2/3=8 V. R₁ più piccola aumenta la corrente comune e la caduta sul resistore inferiore non modificato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Tre dimezza U seguendo R₁ direttamente; 6 assume corrente fissata; 12 annulla la caduta superiore; 4 è invece la caduta finale su R₁.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: Circuito con generatore positivo in alto, R₁ sopra M, R₂ sotto M, morsetti M/B aperti e nessun corto o carico. Barre centrali cadute 6+6 e 4+8V lunghe 180+180 e 120+240, scala 30 unità/V. Ultime uscite 6/3/9/2V lunghe 240/120/180, scala 40 unità/V; B finale distinto da caso centrale. Zeri fuori assi e label non sovrapposte.

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 6 a 8 V`. Firma: `fa2a4260625754ff46533b865faefdd28eb6d276955ef762c575433dd8598125`.

## AR-u6-voltage-divider-05

Derivazione e calcolo manuale: R₁=R₂[(12 V)/V₂−1]. Con V₂6 V e R₂2 Ω si ottiene 2(2−1)=2 Ω. V₂ deve essere strettamente tra 0 e 12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: R₁6Ω dà U3V, 4Ω dà 4V. La sottrazione fra tensione e resistenza non è omogenea; U0 esclude l’inversa con R₂ positivo.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `482573693c2dd3007db42e31f69425496f74b0bd2b9bbf56ffbdafbb8c16545d`.

## AR-u6-voltage-divider-06

Derivazione e calcolo manuale: V₂R₁=(12 V−V₂)R₂. Quindi R₂=V₂R₁/(12 V−V₂)=6·2/(12−6) Ω=2 Ω. Denominatore positivo nel dominio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: R₂4Ω dà 8V, 1Ω dà 4V. Denominatore E+U darebbe 2/3Ω; U=E non può avere R₁>0 e R₂ finito.

Didattica: Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `027f146e26676ac9bd86b58b1ff9c1a14c2923686bf1a75cbbd831cb2cfd63fa`.

## AR-u6-voltage-divider-07

Derivazione e calcolo manuale: A 6 V; B con R₁2 Ω, R₂4 Ω dà 8 V. Rapporto 8/6=4/3, non raddoppio del solo resistore R₂ perché cambia anche il totale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: 3/4 reciproco, due segue solo R₂, 1/2 ne inverte l’effetto, uno ignora modifica. U_B8V resta sotto 12V.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `7e91d144b65bfdace8d9d0dc057274e09f09061cf4aaca65b94710ebb6515df3`.

## AR-u6-voltage-divider-08

Derivazione e calcolo manuale: Proposta 12 V meno corretta 6 V dà+6 V. Un resistore superiore positivo impedisce a V₂ di essere tutta la tensione della sorgente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: −6V scambia ordine; 12 copia proposta, zero la accetta. Due è un rapporto puro senza unità volt.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `0d5828b019d29592592cc302d3a5062e5f000bd9c32b1ec01423263fb75dda28`.

## AR-u6-voltage-divider-09

Derivazione e calcolo manuale: V₂(R₁+R₂)=(12 V)R₂ dà R₁=R₂[(12 V)/V₂−1]. Il rapporto di tensioni è puro e il risultato è una resistenza positiva solo con 0<V₂<12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: E+U altera il raccoglimento; invertire rapporto delle tensioni non isola R₁. Con E12V, U3V, R₂1Ω il corretto è 3Ω e il distrattore dà 1/3Ω. U/R₂ ha A, R₂−U non è omogeneo.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `R₁ = R₂ (E − U) / U`. Firma: `bdfc23399d6d098c98004231ac7fab45a9dc861a498efcdf711d6f914c01e49c`.

## AR-u6-voltage-divider-10

Derivazione e calcolo manuale: Inserendo i fattori: V₂, B/V₂, A=κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂). Un fattore comune su entrambe le resistenze lascia la tensione divisa invariata; non si applica il sempliceκ₂/κ₁. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: κ₁ scala l’elemento errato al numeratore; prodotto omette il totale; reciproco scambia B/A; κ₂/κ₁ non descrive una somma. Scalatura comune dà uno.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₂ S / S_B`. Firma: `7d693cb112d90361677475a5940c1ff7efd5b809897f531f3da1133aaebdb3b2`.

## AR-u6-voltage-divider-11

Derivazione e calcolo manuale: A 6 V; B con R₁3 Ω, R₂1 Ω dà 3 V. Rapporto 1/2. La sorgente resta 12 V anche se cambia la corrente totale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Due reciproco, 3/2 segue R₁, 1/3 è rapporto interno R₂/R₁ e non uscita relativa fra prove. Uno ignora la ripartizione a totale costante.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `7471127861d3efe3afee6885c8f1a70acd02320a725677ef1acd0bb07886a183`.

## AR-u6-voltage-divider-12

Derivazione e calcolo manuale: Media delle letture (6+3)/2=9/2 V. Qui gli ingressi medi R₁5/2 Ω, R₂3/2 Ω hanno somma 4 Ω come entrambe le prove e danno anch’essi 9/2 V. È una coincidenza condizionata al totale costante: A(1, 1) Ω dà 6 V e B(1, 3) Ω dà 9 V, media 15/2 V, mentre ingressi medi(1, 2) Ω darebbero 8 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Nove somma senza dimezzare, 3/2 è semidifferenza, 6 e 3 ripetono una lettura. Medie coincidono qui per il totale 4Ω, con controesempio separato esatto negli oracoli.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: Circuito con generatore positivo in alto, R₁ sopra M, R₂ sotto M, morsetti M/B aperti e nessun corto o carico. Barre centrali cadute 6+6 e 4+8V lunghe 180+180 e 120+240, scala 30 unità/V. Ultime uscite 6/3/9/2V lunghe 240/120/180, scala 40 unità/V; B finale distinto da caso centrale. Zeri fuori assi e label non sovrapposte.

Modalità EXACT_ORACLE. Risultato indipendente: `9/2`. Firma: `38baaf1882ae13efc535769ab0e57464c586f6a0d95d4507e0e5ee540dd0446d`.

## AR-u6-voltage-divider-13

Derivazione e calcolo manuale: Bersaglio V₂, B=3 V. Con R₁, B 3 Ω, 3=(12)R₂/(3+R₂), quindi 9=9 R₂ nelle unità in ohm e R₂, B 1 Ω. Rapporto R₂, B/R₂, A=1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Due reciproco, 1/3 confonde rapporto di rami in B con rapporto fra prove, 3/2 segue solo R₁. R₂ invariato 2Ω darebbe 24/5V, non 3V.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `43771ba276b7f667088ee53275efa91f2bd5f9fbb84573a9732479dcf565e0f7`.

## AR-u6-voltage-divider-14

Derivazione e calcolo manuale: Riferimento 6 V→S 18 dà a 3 per volt. S 9 significa 3 V. Con R₂1 Ω, R₁=1(12/3−1) Ω=3 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: 1/3Ω usa D9 come 9V; 1Ω dà 6V; 9Ω dà 6/5V. Il corretto 3Ω ricompone 3V e D9.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `68c1268c5ee16ec669d671685f5b4c63fa9e46d4de928ee611a4e734f0dae612`.

## AR-u6-voltage-divider-15

Derivazione e calcolo manuale: Riferimenti 6 V→13 e 3 V→7: a=(13−7)/(6−3)=2 per volt, b=1. S 17 decodifica V₂, C 8 V. R₂, C 2 Ω impone R₁, C=2(12/8−1)=1 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: 14/17Ω omette b e restituisce D18; 2Ω dà 13, 4Ω dà 9, 8Ω dà 29/5. Un Ω riproduce 17.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `268e0a8fb5f200374e9b892f663114058153b40e50abd9d79a3dbc4c02182d1b`.

## AR-u6-voltage-divider-16

Derivazione e calcolo manuale: Il vincolo R₁=R₂>0 rende V₂6 V per ogni scala comune delle due resistenze. Infinite coppie positive continue; la misura è ridondante e non determina la corrente assoluta senza la scala resistiva. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.

Distrattori: Coppie singole sono esempi; qualunque scala comune positiva è ammessa, ma non resistori indipendenti. Una corrente misurata aggiungerebbe scala, non presente.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie positive con R₁ = R₂`. Firma: `c0af4abe8491dff6c8ca4ae29f8479d15a8e0003ef4eddc040f12b7068606516`.
