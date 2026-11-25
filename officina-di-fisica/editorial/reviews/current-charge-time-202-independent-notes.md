# current-charge-time-202 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 200–204 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuits-200-204-primary-source-only.md, SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA a6d4f710adc944d3ad603f018f013d00a481eecf. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-current-charge-time-01

Derivazione e calcolo manuale: La corrente media orientata è I_media=Q/Δt. Qui Q=6·10⁻³ C e Δt=2·10⁻³ s: i prefissi si cancellano e I_media=3 C/s=3 A. Il verso positivo è coerente con il trasferimento; non si deduce il valore istantaneo in ogni momento. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 3 mA converte Q in C ma lascia il tempo in ms come se fosse in s; 3000 A converte solo il tempo. Il prodotto QΔt non è corrente.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: XML e rendering intero letti: sezione e freccia iniziali schematiche. Q(t) in mC: punti(0, 0), (1 ms, 2 mC), (2 ms, 6 mC), coordinate(130, 850), (330, 770), (530, 610), scale 200 unità/ms e 40 unità/mC. Pendenze 2/4A, secante 3A. Caso magnetico distinto: corrente uscente col punto, quattro archi da destra→alto→sinistra→basso→destra, tangenti antiorarie, nessuna lunghezza di freccia pretende moduloB.

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `1d78c47a8274fa6e8ef2fcfd42a97a5c06087b53d185af67f9ff6d18a2b727a1`.

## AR-u6-current-charge-time-02

Derivazione e calcolo manuale: La dimensione della corrente è carica/tempo: A=C/s. Una carica inC o un intervallo ins non sono da soli una corrente; mC/ms ha scala uguale aC/s. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: C misura carica, s durata, V tensione e Ω resistenza; A=C/s misura la corrente, anche quando è media.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `A`. Firma: `d0f8d0b9f3d2eeb56cb27e95155596ca0e0698e0748014c5681c689457dd13e6`.

## AR-u6-current-charge-time-03

Derivazione e calcolo manuale: Caso autonomo magnetico: per un lungo filo rettilineo con corrente continua, trascurando estremi e altri fili, le linee diB sono circonferenze concentriche attorno al filo in piani perpendicolari; il verso segue la mano destra rispetto alla corrente convenzionale. In mezzo uniforme non magnetico il modulo decresce come 1/r. Senza alternative non si inventa una stringa di risposta. Non sono linee radiali del campo elettrico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: Linee radiali confondono B con E. La direzione parallela al filo è errata; una corrente continua non annulla B. Il verso orario richiederebbe corrente entrante.

Didattica: Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.

Figura: XML e rendering intero letti: sezione e freccia iniziali schematiche. Q(t) in mC: punti(0, 0), (1 ms, 2 mC), (2 ms, 6 mC), coordinate(130, 850), (330, 770), (530, 610), scale 200 unità/ms e 40 unità/mC. Pendenze 2/4A, secante 3A. Caso magnetico distinto: corrente uscente col punto, quattro archi da destra→alto→sinistra→basso→destra, tangenti antiorarie, nessuna lunghezza di freccia pretende moduloB.

Modalità AI_CONCEPTUAL. Risultato indipendente: `Linee circolari centrate sul filo, con verso antiorario`. Firma: `c0560cead916703fc07623c37438faf58de1f5db9d9a66a5160bf5f81a02f023`.

## AR-u6-current-charge-time-04

Derivazione e calcolo manuale: A dà 6/2=3 A. B con Q=1 mC nello stesso intervallo 2 ms dà 1/2 A: corrente media sei volte minore. Non cambia il denominatore temporale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 18 A rende inversa Q; 3 A ignora la modifica. Uno copia Q nuova e sei copia Q iniziale, senza dividere per la durata.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 3 a 1/2 A`. Firma: `6173b86cdd8d066534d5601b5ff657f1a99598da867f656a9fcdab4ba9c4c16e`.

## AR-u6-current-charge-time-05

Derivazione e calcolo manuale: Q=I_mediaΔt. Con 3 A e 2 ms, Q=6 mC=6·10⁻³ C. La media basta a ricostruire la carica netta sull’intervallo, senza corrente istantanea costante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 3/2 divide per il tempo anziché moltiplicare. Sei C perde il prefisso milli. Il conteggio di elettroni non è determinato senza ulteriori dati sul trasferimento netto.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `5bef0e4d92aa3a1da97ede7b77c08b74a388db819d66cdecaac550adb32cdedd`.

## AR-u6-current-charge-time-06

Derivazione e calcolo manuale: Δt=Q/I_media. Con 6 mC e 3 A si ha Δt=2 ms. Carica e media positive danno un intervallo strettamente positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 18 moltiplica Q e I; 1/2 inverte il rapporto. Due s perde il prefisso milli e una durata negativa esce dal dominio.

Didattica: Seconda inversa o angolo autonomo con dominio e orientazione espliciti.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `885e5ce9bf836d3748be4defbac0fbaefb0eb228f230036163ce4d7ce57c3561`.

## AR-u6-current-charge-time-07

Derivazione e calcolo manuale: A:6 mC/2 ms=3 A. B:6 mC/1 ms=6 A. Rapporto 2; il tempo dimezzato raddoppia la media a carica netta uguale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 1/2 rende diretta la dipendenza dal tempo; uno ignora la prova nuova. Quattro introduce un quadrato e il negativo viola il verso dichiarato.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `c377c525bd66804aaf543def33385944f1e04e2160656361d205cbff78e58a55`.

## AR-u6-current-charge-time-08

Derivazione e calcolo manuale: Valore corretto 3 A, proposta 6 A: scarto=+3 A. Il rapporto 2 non è una corrente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: −3 A inverte l’ordine, 6 A copia la proposta, zero la accetta. Due è un rapporto puro.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `1267f05b498b5877be624957eaaded37ae350e4ab45f145c24bd6eaf15ae89cb`.

## AR-u6-current-charge-time-09

Derivazione e calcolo manuale: Dalla definizione media I_media=Q/Δt segue Q=I_mediaΔt. Ampere per secondi dàcoulomb; ampere permillisecondi dàmillicoulomb. Nessuna ipotesi di costanza istantanea è richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: I/Δt ha unità A/s; Δt/I non è una carica. Potenze ulteriori di corrente o tempo alterano le dimensioni.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Q = I Δt`. Firma: `0079a5254df1374353f061740bb04a75113891d45d1ad91b00cda164d5500562`.

## AR-u6-current-charge-time-10

Derivazione e calcolo manuale: Con Q_B=κ₁Q_A e Δt_B=κ₂Δt_A, I_B/I_A=κ₁/κ₂. Positività dei fattori mantiene gli intervalli ammissibili. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: Il prodotto rende diretta la durata; il reciproco inverte B/A. Il tempo al quadrato non compare; la somma dei fattori dà due per prove identiche.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁/κ₂`. Firma: `3f9c1b759eb07dfa5e686218964f71a27c5b385b3d7d220b9b11ce6d65177d87`.

## AR-u6-current-charge-time-11

Derivazione e calcolo manuale: A dà 3 A; B con 12 mC in 3 ms dà 4 A. Rapporto 4/3, includendo sia il raddoppio della carica sia il fattore 3/2 dell’intervallo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 3/4 è il reciproco, due segue solo Q e 3/2 segue la durata nel verso sbagliato. Uno presume una compensazione che non avviene.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `ac80f2075280776c78d909e4bfa2102d719a9539aae1d6bb918cc2a381723d10`.

## AR-u6-current-charge-time-12

Derivazione e calcolo manuale: Media aritmetica delle due correnti medie=(3+4)/2=7/2 A. Non è la media temporale sugli intervalli concatenati, che sarebbe(6+12)mC/(2+3)ms=18/5 A. Anche ai valori medi Q=9 mC e Δt=5/2 ms la legge dà 18/5 A, distinto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 18/5 A pondera per durata oppure usa gli ingressi medi. Sette somma, 1/2 è semidifferenza e quattro copia B. Le due medie differiscono di 1/10 A.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `7/2`. Firma: `def3bc32f4388f80c898ee068740c4772e42bf914f7cc5c197c7b77f8fe1bdcf`.

## AR-u6-current-charge-time-13

Derivazione e calcolo manuale: Bersaglio I_B=(4/3)3=4 A. Con Q_B=12 mC serve Δt_B=3 ms. Rapporto Δt_B/Δt_A=3/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 2/3 inverte il confronto; due segue solo Q e 4/3 copia le correnti. Un rapporto dei tempi uguale a uno darebbe I_B=6 A.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3/2`. Firma: `2848351f01f1cbbef645f533fba6d4c5cc5d9bb276ab587afea01d7aa0889442`.

## AR-u6-current-charge-time-14

Derivazione e calcolo manuale: A dà 3 A e S 9: a=3 nella scala strumentale perA. S 12 decodifica 4 A; per Δt 3 ms la carica netta è 12 mC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 36 mC usa D come ampere; quattro copia la corrente e tre la durata. La coincidenza numerica fra D e Q_C in mC non è una legge generale.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `12`. Firma: `5ad466692fbb31c613c98361a817e0e48ef8794d3b90db90cafa847c6f86d1a1`.

## AR-u6-current-charge-time-15

Derivazione e calcolo manuale: Riferimenti 3 e 4 A, letture 7 e 9: a=2, b=1. S_C 5 decodifica I_C=(5−1)/2=2 A. In 5 ms passano Q_C=10 mC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: 25/2 mC omette b; due copia I e cinque copia lettura o durata. Venti mC sottrae b senza togliere il guadagno e predice D=9.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `10`. Firma: `241b045726eda4f528e271238aeb792772bda01bced98948c475ae2d5fd989d8`.

## AR-u6-current-charge-time-16

Derivazione e calcolo manuale: Il vincolo dimensionato Q=(3 mC/ms)Δt=(3 A)Δt rende I_media=3 A per ogni Δt>0. La misura è ridondante: infinite coppie nel modello macroscopico continuo, per esempio(6 mC, 2 ms) e(12 mC, 4 ms). Il dato non impone una corrente istantanea costante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.

Distrattori: Le singole coppie sono esempi. Q non è libera a durata fissata; il tempo zero è escluso. Il vincolo fra totali non impone I(t) costante.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie positive`. Firma: `3dda4c21e887b430585a4524afe45b4248b6a2d5203fc62909aee4626c69675e`.
