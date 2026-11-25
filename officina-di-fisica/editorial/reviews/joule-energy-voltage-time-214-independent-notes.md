# joule-energy-voltage-time-214 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 210–214 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuit-power-210-214-primary-source-only.md, SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Anche i modelli fonte-only sono stati congelati prima delle candidate: SHA97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f, commitf558411. U del candidato211 è V₂ della primaria; T del candidato214 è la durata t, distinta dal suo tempo internoτ. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 156d5924c9bbdfd8fa815c1d3af49ffb9226f255. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding21404: riletto il numeratore dimensionato (1 V)² del calcolo nel primo testo.

## AR-u6-joule-energy-voltage-time-01

Derivazione e calcolo manuale: A tensione costante sul resistore R 2 Ω, P=V²/R e l’energia trasferita nel tempo è E=Pt. Con 2 V e 3 s, P 2 W e E 6 J. Il resistore è ideale a R costante; nessun riscaldamento modifica qui R. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 12J omette divisore R2Ω, due copia P, tre T, 2/3 inverte tempo. W·s ricostruisce 6J.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: Rettangolo P(τ) alto 2W, largo 3 s: coordinatex 100..400, y 280..400, scale 100 unità/s e 60 unità/W, area 6J. Retta E(τ)M100880L400640 per 0≤τ≤3 s, scale 100 unità/s e 40 unità/J, estremo 6J, origine internaτ0 ammessa. Barre E6/16/11J lunghe 120/320/220, scala 20 unità/J; B haV4V eT2 s, distinta dalla retta. Nessuna label attraversata.

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `d1238a2e4101de7feda6014a34b019b9db1046c0fb7173cdbf2a6bcf41e73e9d`.

## AR-u6-joule-energy-voltage-time-02

Derivazione e calcolo manuale: L’energia ha unità J=W·s=V²s/Ω. Non è watt: quello è il tasso di trasferimento, mentre E integra quel tasso per la durata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: W tasso, V tensione, s tempo, Ω resistenza: l’energia haJ. Serve la durata per integrare P costante.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `J`. Firma: `22e07eb470e9a6bd94261693b83537d3c4240f99565867379c2050f48a3447b9`.

## AR-u6-joule-energy-voltage-time-03

Derivazione e calcolo manuale: Da P=VI=V²/R e V, R costanti nell’intervallo, E=∫Pdt=V²t/(2 Ω). In unità numeriche V in volt e t in secondi, E in joule vale V_num²t_num/2; il 2 rappresenta una resistenza, non un puro coefficiente fisico universale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: VT/R perde V e nonenergia; T al denominatore inverte effetto; R al numeratore usa altra legge; T² non è potenza costante.

Didattica: Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.

Figura: Rettangolo P(τ) alto 2W, largo 3 s: coordinatex 100..400, y 280..400, scale 100 unità/s e 60 unità/W, area 6J. Retta E(τ)M100880L400640 per 0≤τ≤3 s, scale 100 unità/s e 40 unità/J, estremo 6J, origine internaτ0 ammessa. Barre E6/16/11J lunghe 120/320/220, scala 20 unità/J; B haV4V eT2 s, distinta dalla retta. Nessuna label attraversata.

Modalità AI_CONCEPTUAL. Risultato indipendente: `E = V² T / R`. Firma: `207fc5cd38338eb3431729c32d789f1b1b08228cf908d2b32d34ee04c742bd09`.

## AR-u6-joule-energy-voltage-time-04

Derivazione e calcolo manuale: A 6 J; B con 1 V e 3 s dà 3/2 J. Tensione dimezzata riduce P ed E a un quarto a durata fissata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: TreJ segue Vlinearmente, sei ignora; 12/24 invertono variazione. UnV al quadrato su 2Ω dà 1/2W e per 3 s dà 3/2J.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 6 a 3/2 J`. Firma: `37e58a7e798ec5377d6b439cb1f4aa4ae6019850f52b2eceb5c00ae49b6cf388`.

## AR-u6-joule-energy-voltage-time-05

Derivazione e calcolo manuale: V=√(ER/t), positivo. Con E 6 J, R 2 Ω, t 3 s si ottiene√4 V=2 V. Unità J·Ω/s=V² prima della radice. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: Quattro V copia V² e dà 24J; −2 fuori dominio; 6V dà 54J. Unità sotto radice V² e segno positivo entrambi necessari.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `eea94be5d87c71faf4b0fc98887cf80f60735d23a72ac9cad76de9402459296b`.

## AR-u6-joule-energy-voltage-time-06

Derivazione e calcolo manuale: t=ER/V²=(6 J·2 Ω)/(4 V²)=3 s. Durata positiva perché E, R, V² sono positivi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: Sei s dà 12J; 3/2 s omette R e dà 3J; 2 s copia P e dà 4J. Energia su potenza restituisce durata.

Didattica: Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `e8737e553922e1207908b86ff9e3eb88f41920e2c74676d3ffdab10045d2153f`.

## AR-u6-joule-energy-voltage-time-07

Derivazione e calcolo manuale: A 6 J; B con 2 V e 5 s dà 10 J. Rapporto 10/6=5/3, lineare nella durata a tensione fissa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 3/5 reciproco, 25/9 quadra T, uno ignora, due nonsegue 5/3. E èlineare inT quando Vcostante.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5/3`. Firma: `95cda1b05ad9448605ab5fb05ac7067dd5766ef6d901b4da3c9f16a991f823a2`.

## AR-u6-joule-energy-voltage-time-08

Derivazione e calcolo manuale: Proposta 12 J meno corretto 6 J dà+6 J. Dodici J corrisponderebbero, per esempio, al doppio della durata a tensione 2 V, non alle condizioni assegnate. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: −6J scambia ordine, 12 copia proposta, zeroaccetta. Due èrapporto puro, non energia.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `59e4109609562a13a8c555fc52e837dfced2af1f82754eccb06aa43bd9b8e593`.

## AR-u6-joule-energy-voltage-time-09

Derivazione e calcolo manuale: Da E=V²t/R segue V=√(ER/t)>0. Sostituisco R=2 Ω mantenendone la dimensione; non scrivo una radice di 2 E/t priva della resistenza dimensionata quando si ragiona in unità fisiche. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: ER/T èV²; ET/R haC² e sua radice carica. R/(ET) haC⁻² e radice C⁻¹. Ramo negativo non ammesso per caduta Vpositiva.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `V = √(E R / T)`. Firma: `5a38fc5a1368faaff18c891eed46d3cc4db79ab4c33c9d93243ee8e7fd5f953c`.

## AR-u6-joule-energy-voltage-time-10

Derivazione e calcolo manuale: E_B/E_A=κ₁²κ₂, perché R non cambia e la durata entra linearmente. Un fattore comuneκ agli ingressi dàκ³, nonκ². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: κ₁κ₂ perde V; κ₁²/κ₂ inverte T; κ₁κ₂² quadra T anziché V; κ₂/κ₁² inverteeffetto V. R invariata cancella.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁² κ₂`. Firma: `6655e0a5ba471965a9fb0aaab46b957b6c0f285b3be0baaee103fe518c6db13b`.

## AR-u6-joule-energy-voltage-time-11

Derivazione e calcolo manuale: A 6 J; B a 4 V per 2 s dà 16 J. Rapporto 16/6=8/3. Il fattore quattro della tensione al quadrato moltiplica 2/3 dalla durata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 3/8 reciproco, 4/3 segue Vlineare, 2/3 solo T, 4 solo V². Corretti 8W per 2 s danno 16J.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `8/3`. Firma: `8f71e31b73b27e070f04d3dd644f70b572ea2b9940ee03f7d6fef4946feaabe6`.

## AR-u6-joule-energy-voltage-time-12

Derivazione e calcolo manuale: Media (6+16)/2=11 J. Ai dati medi V 3 V, t 5/2 s si avrebbe 9·(5/2)/2=45/4 J, diverso da 44/4 J. Uguale peso delle due uscite, non tensione efficace di un’unica forma variabile. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 45/4 usa ingressi medi, 22 somma, 5 semidifferenza, 16 singola B. La legge ai dati medi supera 11J di 1/4J.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: Rettangolo P(τ) alto 2W, largo 3 s: coordinatex 100..400, y 280..400, scale 100 unità/s e 60 unità/W, area 6J. Retta E(τ)M100880L400640 per 0≤τ≤3 s, scale 100 unità/s e 40 unità/J, estremo 6J, origine internaτ0 ammessa. Barre E6/16/11J lunghe 120/320/220, scala 20 unità/J; B haV4V eT2 s, distinta dalla retta. Nessuna label attraversata.

Modalità EXACT_ORACLE. Risultato indipendente: `11`. Firma: `5afbfa597987126991bca077fbd37f81b1d46062ef737932f1acde8d05cb6174`.

## AR-u6-joule-energy-voltage-time-13

Derivazione e calcolo manuale: Bersaglio E_B=(8/3)6=16 J. A V_B 4 V, t_B=E_BR/V_B²=2 s; t_B/t_A=2/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 3/2 reciproco, 8/3 copiaenergie, 4 copiapotenze.1/3 darebbe 1 s e 8J. Corretto 2 s su 3 s è 2/3.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2/3`. Firma: `3714fef1321760a2d76b0bfd618d724a4726bdd73d13c40391d4cde7ac917406`.

## AR-u6-joule-energy-voltage-time-14

Derivazione e calcolo manuale: Riferimento 6 J→18 dà gain 3 per joule. S 48 decodifica 16 J. Con t_B 2 s e R 2 Ω, V_B√16=4 V, ramo positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 16V copia V² e dà 256J; 2V dà 4J eD12; 8V dà 64J eD192. Gain rimosso prima di radice.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `6468d593d6a4cfa2501d5335d3414e0ee9177d597964827aca36002c3d77af1b`.

## AR-u6-joule-energy-voltage-time-15

Derivazione e calcolo manuale: Riferimenti 6 J→13 e 16 J→33 danno a 2 per joule e b 1. S 37 decodifica E_C 18 J; con t_C 1 s, R 2 Ω si trova V_C√36=6 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: √37V ometteoffset e predice D38; 18 copia E, 36V², 3V dà 9/2J eD10. Non occorre valutare√37 decimale.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `4bdf8c168a918ba471fa8e2f547673c7118da508974fa5a2824ea37cc2046e05`.

## AR-u6-joule-energy-voltage-time-16

Derivazione e calcolo manuale: Il vincolo V=(2/3 V/s)t produce E=(2/9 J/s³)t³. Con E 6 J, t³=27 s³ e t 3 s, unica durata positiva; V 2 V. La durata non può essere una radice negativa o un valore di tensione scambiato per secondi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.

Distrattori: 27 copiacubo, duecopiatensione, −3 s viola durata positiva. Cubica strettamente crescente fissa 3 s; V(τ)=ατ sarebbe un altro protocollo e introdurrebbe diverso integrale.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `44d548b941771e0f57506ffe68f8e3f143f5eee4fcddb1591245a1707c34c9d1`.
