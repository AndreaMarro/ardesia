# identical-parallel-resistors-210 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 210–214 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuit-power-210-214-primary-source-only.md, SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Anche i modelli fonte-only sono stati congelati prima delle candidate: SHA97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f, commitf558411. U del candidato211 è V₂ della primaria; T del candidato214 è la durata t, distinta dal suo tempo internoτ. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 751185c3791519a1d0402574f0e247625d542461. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-identical-parallel-resistors-01

Derivazione e calcolo manuale: Alla medesima tensione V, ogni ramo porta V/r. Kirchhoff dà I=N V/r e quindi R=V/I=r/N. Con 12 Ω e 3 rami, R=4 Ω. Il generatore è soltanto una sonda ideale della relazione equivalente; N è intero positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 36 Ω è la serie, 12 Ω un solo ramo.1/4 Ω copia il reciproco numerico; il reciproco fisico di 4 Ω è 1/4 S. Due Ω richiederebbero 6 rami.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: Rete con tre percorsi distinti fra A e B, ognuno con simbolo 12Ω schematico. Barre centrali R4/12Ω lunghe 80/240 da x 150, scala 20 unità/Ω. Barre finali R4/3/7/2Ω lunghe 160/120/140, scala 40 unità/Ω distinta dalla precedente. Conteggi e origini coerenti; nessun simbolo resistivo pretende scala di valore.

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `3d583db55265a293c2cb4788b44ba132e9ca756bea47fe434de1f4ad098658a4`.

## AR-u6-identical-parallel-resistors-02

Derivazione e calcolo manuale: La resistenza equivalente ha unità Ω=V/A. Il conteggio N è puro e non cambia la dimensione di r/N; nessuna opzione o stringa di risposta è stata letta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: Uno misura il conteggio e non la resistenza; S è conduttanza, A corrente, V tensione. N puro non cancella gli ohm di r.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Ω`. Firma: `96a0eb5fd132c4cfb528ce2faf8586169d2950e9eb0de24edf8a75228bbc5a37`.

## AR-u6-identical-parallel-resistors-03

Derivazione e calcolo manuale: Sommo le conduttanze: 1/R=N/r; invertendo con r>0 e N∈N⁺ si ottiene R=r/N. R=r per N 1 e R diminuisce quando si aggiungono rami identici in parallelo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: Nr è serie, N/r conduttanza. r+N somma grandezze diverse; r/N² applica due volte la crescita di percorsi invece di una.

Didattica: Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.

Figura: Rete con tre percorsi distinti fra A e B, ognuno con simbolo 12Ω schematico. Barre centrali R4/12Ω lunghe 80/240 da x 150, scala 20 unità/Ω. Barre finali R4/3/7/2Ω lunghe 160/120/140, scala 40 unità/Ω distinta dalla precedente. Conteggi e origini coerenti; nessun simbolo resistivo pretende scala di valore.

Modalità AI_CONCEPTUAL. Risultato indipendente: `R = r / N`. Firma: `1d1e1059f897c09cffea8769ec4e276e668f0d7a5cad7f8b640097c80fb3efee`.

## AR-u6-identical-parallel-resistors-04

Derivazione e calcolo manuale: A dà 12/3=4 Ω. B dimezza r a 6 Ω senza cambiare i 3 rami: R_B=6/3=2 Ω. Dipendenza lineare da r e non quadratica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: Otto inverte l’effetto di r, quattro ignora la modifica, sei copia il ramo e uno dimezza due volte.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 4 a 2 Ω`. Firma: `ce5b69aef601585bfb1b6a99d8491ce8c4b1468ca2a090bff6a231f6b2ea061c`.

## AR-u6-identical-parallel-resistors-05

Derivazione e calcolo manuale: Inversa r=NR. Con R 4 Ω e N 3 si ha r=12 Ω, reinserimento 12/3=4 Ω. Unità di resistenza conservata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 4/3 Ω ricompone 4/9 Ω; 4 Ω come ramo ricompone 4/3 Ω; 36 Ω darebbero 12 Ω. Solo 12/3 dà 4 Ω.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `12`. Firma: `a67e609a5ee9ca993624294a7559bf1d201146234b30188ca0f485b45131bbf7`.

## AR-u6-identical-parallel-resistors-06

Derivazione e calcolo manuale: Inversa N=r/R=12/4=3, numero puro intero positivo. Un dato r/R non intero non rappresenterebbe un numero ammissibile di resistori nel modello. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 1/3 non è conteggio intero; 48 moltiplica, 12 copia r, zero esclude tutti i percorsi. N=r/R deve risultare intero, senza arrotondare.

Didattica: Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `c7a778c2ca645730470fb776b458812f99d560bda56a8703808100282f8ef5ae`.

## AR-u6-identical-parallel-resistors-07

Derivazione e calcolo manuale: A 4 Ω; B con un solo ramo da 12 Ω dà 12 Ω. Rapporto R_B/R_A=3: togliere rami aumenta l’equivalente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 1/3 confronta i conteggi direttamente invece dell’inverso; uno ignora la rimozione. Nove e 1/9 inventano un quadrato.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `930784635a2a78f99f90914d892f2832460312fb73c0f4cdb05975f4dae4f6d8`.

## AR-u6-identical-parallel-resistors-08

Derivazione e calcolo manuale: Il valore corretto è 4 Ω. Proposta 8 Ω meno corretto 4 Ω dà+4 Ω. Il rapporto due non è lo scarto richiesto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: −4 Ω scambia l’ordine, 8 Ω copia la proposta, zero la accetta. Due è rapporto puro e non differenza.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `25bc18a995f02be68676e320225df78e2d4f52d0d5c5636e40ecf374d7b3279b`.

## AR-u6-identical-parallel-resistors-09

Derivazione e calcolo manuale: Da R=r/N segue r=NR. N non porta unità, mentre R e r portano ohm. L’inversa è unica quando N intero positivo è noto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: R/N divide ancora, N/R ha unità S, R−N non è omogeneo, N²R introduce un ulteriore fattore di conteggio.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `r = N R`. Firma: `24382788a5c58223651474400af1241029bb51bb04361deec089a4526b9d6f5b`.

## AR-u6-identical-parallel-resistors-10

Derivazione e calcolo manuale: R_B/R_A=(κ₁r/(κ₂N))/(r/N)=κ₁/κ₂. κ₂ può essere razionale soltanto se κ₂N resta un conteggio intero positivo; non si estende il dominio a una frazione di ramo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: Il prodotto rende diretto N, il reciproco inverte B/A; i quadrati non nascono dalla legge. Entrambi i conteggi devono essere interi.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁/κ₂`. Firma: `b37b0d0b12446db88f5d2a48615fd2bbdf03752444966666f3d2bbc95afd5f3b`.

## AR-u6-identical-parallel-resistors-11

Derivazione e calcolo manuale: A 12/3=4 Ω; B 15/5=3 Ω. Rapporto 3/4. I fattori sonoκ₁5/4 eκ₂5/3, il loro quoziente è 3/4. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 4/3 è reciproco; 5/4 segue solo r, 3/5 solo l’inverso di N.25/12 moltiplica 5/4 per 5/3 invece di dividerli.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3/4`. Firma: `5498d88d89c4c27d347af4c795bd1ab3b7f2bfd9746aecda3dcf819b0cb8e9f6`.

## AR-u6-identical-parallel-resistors-12

Derivazione e calcolo manuale: Uguale peso statistico: (4+3)/2=7/2 Ω. Gli ingressi medi r=27/2 Ω, N 4 sono qui fisicamente ammissibili ma danno 27/8 Ω, diverso da 28/8 Ω. Mediare prima gli ingressi cambia il compito. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 27/8 Ω usa gli ingressi medi, qui ammissibili; 7 Ω somma, 1/2 Ω è semidifferenza, 3 Ω ripete B. La differenza delle due medie è 1/8 Ω.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: Rete con tre percorsi distinti fra A e B, ognuno con simbolo 12Ω schematico. Barre centrali R4/12Ω lunghe 80/240 da x 150, scala 20 unità/Ω. Barre finali R4/3/7/2Ω lunghe 160/120/140, scala 40 unità/Ω distinta dalla precedente. Conteggi e origini coerenti; nessun simbolo resistivo pretende scala di valore.

Modalità EXACT_ORACLE. Risultato indipendente: `7/2`. Firma: `ee7bbe2ff71cfb0054b2fdd26fde68621aa6312a30649a0fed44e0d149355ec1`.

## AR-u6-identical-parallel-resistors-13

Derivazione e calcolo manuale: Bersaglio R_B=(3/4)4=3 Ω. Con r_B 15 Ω occorre N_B=15/3=5; rapporto N_B/N_A=5/3. Entrambi i conteggi sono interi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 3/5 reciproco, 3/4 copia il bersaglio, 5/4 segue r. Cinque è il conteggio nuovo senza dividerlo per tre: il rapporto di conteggi può essere frazionario.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5/3`. Firma: `50491254c3c037cf1e9bea04e116bd75735d556d5456daec38492efbc66b177c`.

## AR-u6-identical-parallel-resistors-14

Derivazione e calcolo manuale: Riferimento R_A 4 Ω e S 12 dà a_cal 3 per ohm nella scala strumentale. S 9 decodifica R_B 3 Ω. N_B 5 impone r_B 15 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 45 Ω usa D come R; 3 Ω copia R anziché r; 3/5 Ω divide per N anziché moltiplicare.12 Ω ripete il riferimento.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `15`. Firma: `2643eb80f1d3d77952c38001b23bbb458bb9998c61caa8f5b972481f6efa85d9`.

## AR-u6-identical-parallel-resistors-15

Derivazione e calcolo manuale: Riferimenti 4 Ω→9 e 3 Ω→7: a=(9−7)/(4−3)=2 per ohm, b=1. S_C 5 decodifica R_C=(5−1)/2=2 Ω. N_C 3 dà r_C 6 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: 15/2 Ω omette b e restituisce D6; 2 Ω copia equivalente; 15 Ω predice 11 e 3 Ω predice 3. Il reinserimento del ramo 6 Ω in tre percorsi restituisce D5.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `437e24c52f53e568fe7a86ef4c2028d20010df8ac17cffc8281557bfa3967cd9`.

## AR-u6-identical-parallel-resistors-16

Derivazione e calcolo manuale: Il vincolo dimensionato r=(4 Ω)N rende R 4 Ω per ogni N intero positivo. Infinite coppie discrete numerabili (4 N Ω, N), non un continuo di conteggi e non due parametri indipendenti. La misura è ridondante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.

Distrattori: Le coppie singole sono esempi; nessuna è falsa perché esistono esempi espliciti. N non è continuo e r non è libero indipendentemente da N.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie, con N intero positivo e r = (4 Ω) N`. Firma: `243cf9b5f9366b7505f4fc47c7583a5de7377415119a84b86d1dfe835cddb3c7`.
