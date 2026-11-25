# current-divider-212 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 210–214 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuit-power-210-214-primary-source-only.md, SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Anche i modelli fonte-only sono stati congelati prima delle candidate: SHA97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f, commitf558411. U del candidato211 è V₂ della primaria; T del candidato214 è la durata t, distinta dal suo tempo internoτ. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 7c71e095686a96dae449f7a4507c98bd651f45e8. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-current-divider-01

Derivazione e calcolo manuale: La tensione V è comune ai due rami: I₁=V/R₁, I₂=V/R₂ e I_tot=I₁+I₂. Eliminando V si ottiene I₁=I_tot R₂/(R₁+R₂). Con I_tot 12 mA e rami 2 Ω uguali, I₁6 mA. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Dodici mA elimina il secondo ramo, 24 raddoppia, 2 copia Ω e 1/2 è quota pura non corrente. Sei per ramo conserva il totale 12 mA.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: Due soli rami tra nodi A/B, simboli uguali 2Ω e totale 12 mA dichiarato, nessuna sorgente di tensione fissata nel disegno. Barre centrali quote 6+6 e 8+4 mA con lunghezze 180+180 e 240+120, scala 30 unità/mA; somme 360. Ultime I₁6/3/9/2 mA lunghezze 240/120/180, scala 40 unità/mA distinta. B finale distinto dalla modifica centrale.

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `f63214bd9fae01107ffebe0a87e0b1a50412cf5305b858617f079ab9be7eaa0e`.

## AR-u6-current-divider-02

Derivazione e calcolo manuale: La corrente di ramo ha dimensione A=C/s; mA è un’unità dimensionalmente compatibile e scala 10⁻³ A. Nessuna alternativa è stata ancora aperta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: V, Ω, W misurano altre grandezze; uno è solo frazione di corrente. mA mantiene dimensione ampere con prefisso 10⁻³.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `mA`. Firma: `87917d0a94ac2e42b9b1384b63a70a69700a67863c6ae6bcf6e8fd2ad837b77a`.

## AR-u6-current-divider-03

Derivazione e calcolo manuale: Il rapporto I₁/I_tot=(1/R₁)/(1/R₁+1/R₂)=R₂/(R₁+R₂). Dunque I₁=(12 mA)R₂/(R₁+R₂), con 0<I₁<12 mA. Il numeratore contiene l’altro resistore perché la corrente segue la conduttanza del primo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: R₁ al numeratore dà I₂; inverso supera I_T; R₂/R₁ confronta rami ma non quota sul totale. I_TR₁R₂ ha AΩ².

Didattica: Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `I₁ = I_T R₂ / (R₁ + R₂)`. Firma: `636fc9ce550bcfc33fe69d17555c4c95719da0960b2dc89d6f2e3c879f855cb0`.

## AR-u6-current-divider-04

Derivazione e calcolo manuale: A 6 mA. B riduce R₁ a 1 Ω con R₂2 Ω e totale mantenuto 12 mA: I₁=12·2/3=8 mA. La tensione comune si adatta; non è imposta da una sorgente ideale di tensione fissa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Tre segue direttamente R₁, sei ignora, 12 azzera I₂, quattro è invece I₂ finale. La tensione adattata 8 mV dà 8 e 4 mA.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: Due soli rami tra nodi A/B, simboli uguali 2Ω e totale 12 mA dichiarato, nessuna sorgente di tensione fissata nel disegno. Barre centrali quote 6+6 e 8+4 mA con lunghezze 180+180 e 240+120, scala 30 unità/mA; somme 360. Ultime I₁6/3/9/2 mA lunghezze 240/120/180, scala 40 unità/mA distinta. B finale distinto dalla modifica centrale.

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 6 a 8 mA`. Firma: `3d0fb5cba8607e59e86b65c703f55957b41d82dbc10def2a3ebc376fd8f39a38`.

## AR-u6-current-divider-05

Derivazione e calcolo manuale: R₁=R₂[(12 mA)/I₁−1]. Con I₁6 mA e R₂2 Ω si ottiene 2 Ω. Il rapporto di correnti è adimensionale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: R₁4Ω dà 4 mA, 6Ω dà 3 mA; resistenza meno corrente non è un’operazione omogenea. Il rapporto deve usare la corrente dell’altro ramo.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `7441f5f8a1e0e91a0a6f66b8d08e980a8debe5e538997145fad9dd578a3c58a5`.

## AR-u6-current-divider-06

Derivazione e calcolo manuale: R₂=I₁R₁/(12 mA−I₁). Con I₁6 mA, R₁2 Ω, R₂=2 Ω. La condizione stretta 0<I₁<12 mA mantiene R₂ positivo e finito. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: R₂1Ω dà 4 mA, 4Ω dà 8 mA. Eccesso al denominatore darebbe 2/3Ω. I₁=I_T richiede l’altro ramo aperto, fuori dai due rami finiti.

Didattica: Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `ac29d0ef8f73a80d8fd3195cf797b90f8fb1c0cbaa348f70db763eb84e03ed69`.

## AR-u6-current-divider-07

Derivazione e calcolo manuale: A 6 mA; B con R₁2 Ω, R₂4 Ω dà 8 mA. Rapporto 4/3. R₂ più grande porta meno corrente nel secondo ramo e una quota maggiore nel primo, a corrente totale mantenuta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: 3/4 reciproco, due segue solo R₂, 1/2 ne inverte effetto. Uno sarebbe il diverso controllo V costante; qui V passa a 16 mV.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `fdcbd0103d73cc4b44b1c7dab01deac36cf698bc8e655e8f937ddf336b0a0d38`.

## AR-u6-current-divider-08

Derivazione e calcolo manuale: Proposta 12 mA meno corretta 6 mA dà+6 mA. Con entrambi i rami passivi finiti positivi una quota strettamente positiva attraversa anche R₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: −6 scambia ordine, 12 copia proposta, zero la accetta. Due è rapporto puro non differenza in mA.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `24ba67fb8a08d372967b5ea95bd9bc78e5a97bd0115fd4832709868f5cfc9d21`.

## AR-u6-current-divider-09

Derivazione e calcolo manuale: Da I₁(R₁+R₂)=I_tot R₂ segue R₁=R₂(I_tot/I₁−1), dove I_tot 12 mA. Non si somma una corrente a una resistenza e il dominio è 0<I₁<I_tot. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Il più non è I₂; reciproco scambia le correnti. I₁/R₂ ha A/Ω e non Ω; R₂−I₁ non è omogeneo. Estremi 0 e 12 mA esclusi.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `R₁ = R₂ (I_T − I₁) / I₁`. Firma: `bc8fdce92a1815597d877d4d1c870c28e8f098afa378c93234211774182f32f6`.

## AR-u6-current-divider-10

Derivazione e calcolo manuale: I₁, B/I₁, A=κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂), perché il totale assegnato è identico nelle due prove. Un fattore comuneκ cancella e lascia la partizione invariata, pur cambiando la tensione richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: κ₁ scala il ramo errato al numeratore, prodotto omette il totale, reciproco inverte le prove, κ₂/κ₁ ignora la somma. Fattore comune conserva quote ma cambia V.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₂ S / S_B`. Firma: `bf2c17069328dbfe30989ed0edbe2db2a4137995ac8e30b87f696e3aa84e747a`.

## AR-u6-current-divider-11

Derivazione e calcolo manuale: A 6 mA; B con 3 e 1 Ω dà 12·1/4=3 mA. Rapporto 1/2, non il rapporto diretto delle resistenze del primo ramo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Due reciproco, 3/2 segue R₁ direttamente, 1/3 è I₁/I₂ nella sola B; uno ignora nuova divisione. B ha 3 e 9 mA.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `6f7ad02876a7ebc772465575a48e4fe513941732322d46ce9049ac0d761d3234`.

## AR-u6-current-divider-12

Derivazione e calcolo manuale: Media (6+3)/2=9/2 mA. Con ingressi medi 5/2 e 3/2 Ω la somma resta 4 Ω, quindi il modello dà qui 9/2 mA. Non è identità universale: (1, 1) Ω e(1, 3) Ω danno 6 e 9 mA, media 15/2 mA, mentre (1, 2) Ω darebbe 8 mA. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Nove somma, 3/2 semidifferenza, 6 e 3 singole uscite. La coincidenza coi dati medi deriva dal totale 4Ω, non da conservazione al nodo applicata a medie statistiche.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: Due soli rami tra nodi A/B, simboli uguali 2Ω e totale 12 mA dichiarato, nessuna sorgente di tensione fissata nel disegno. Barre centrali quote 6+6 e 8+4 mA con lunghezze 180+180 e 240+120, scala 30 unità/mA; somme 360. Ultime I₁6/3/9/2 mA lunghezze 240/120/180, scala 40 unità/mA distinta. B finale distinto dalla modifica centrale.

Modalità EXACT_ORACLE. Risultato indipendente: `9/2`. Firma: `7167b42c8615b9daf3dec7f3773bb30078767e9d614a7ff1b147580eb7a2fd01`.

## AR-u6-current-divider-13

Derivazione e calcolo manuale: Il bersaglio è 3 mA. Con R₁, B 3 Ω, l’inversa R₂=I₁R₁/(12 mA−I₁) dà R₂, B 1 Ω. Rapporto al riferimento 2 Ω uguale 1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Due reciproco, 1/3 rapporto interno resistenze B, 3/2 segue solo R₁. R₂ invariato dà 24/5 mA. Il bersaglio corretto assegna 3 e 9 mA.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/2`. Firma: `84be330221edff0336a7d6f8d57a978ca1246aa09104689d8d6a3cf77ed63149`.

## AR-u6-current-divider-14

Derivazione e calcolo manuale: I₁, A 6 mA e S 18 danno gain 3 per mA nella scala dichiarata. S 9 decodifica I₁, B 3 mA. Con R₂1 Ω si trova R₁3 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: 1/3Ω usa D come 9 mA; 1Ω dà D18, 9Ω dà 18/5. Il ramo 3Ω dà 3 mA e D9.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `baa2e3a72546a3723840fc793503e5fe59183709eee31fdb462e94c54bf26f81`.

## AR-u6-current-divider-15

Derivazione e calcolo manuale: Riferimenti 6 mA→13 e 3 mA→7 danno a 2 per mA e b 1. S 17 decodifica I₁, C 8 mA. Con R₂2 Ω, R₁=2(12/8−1)=1 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: 14/17Ω omette offset e D18; 2Ω dà 13, 4Ω dà 9, 8Ω dà 29/5. Tensione non invariata fra riferimenti e prova C.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `aa8752faabeb7647b33bcbe2cc7a53fd956590373284b828abea11ae0ebc7caf`.

## AR-u6-current-divider-16

Derivazione e calcolo manuale: R₁=R₂>0 divide sempre 12 mA in due quote da 6 mA. Infinite coppie continue con scala comune libera; la misura non determina le resistenze assolute né la tensione richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.

Distrattori: Coppie uguali singole sono esempi; zero non è passivo finito positivo. Scale continue libere ma rapporto uno obbligatorio; una misura di V aggiungerebbe scala.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie positive con R₁ = R₂`. Firma: `d93c90b9746d7dea15061adcc11bfdacf27e7be5d487c9215138b1a14685af7b`.
