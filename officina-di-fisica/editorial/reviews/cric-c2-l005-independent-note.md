# Revisione indipendente cric-c2-l005

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in 9dc54dba, SHA 34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; modello realmente eseguito prima dei candidati in e37686ebab9f1ac50919592f189ab8cf7f37184f, SHA 02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali 91f13eef7412e3227bd11fc7e2bc747bd980bdd3 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C2-L005 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente 640×1550 letti per intero. Volumi in 45 s: barre 270/150/120 per 6,75/3,75/3 L, origine comune e 40 coordinate/L; 270−150=120. Nodo senza accumulo: barre 360/140/220 per 36/14/22 mL/s, scala 10 coordinate/(mL/s). Riempimento iniziale: origine(140,1390), punto(500,1150),360 coordinate per 9 s e 240 per 120 mL; pendenza 40/3 mL/s=800 mL/min. L’intervallo finisce all’arrivo del liquido, non è imposto un accumulo dopo 9 s. Nessun taglio o contatto residuo rilevato.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C2-Q041

Ipotesi: Portate costanti 9 L/min entranti e 5 uscenti per 45 s, vasca senza trabocco; accumulo non nullo incluso.

Derivazione manuale: La portata netta è 9−5=4 L/min. Quarantacinque secondi sono 3/4 min, quindi accumulo 4·3/4=3 L. La somma delle portate darebbe una quantità diversa dall’accumulo netto.

Distrattori: 6,75 L solo ingresso,3,75 solo uscita,10,5 somma invece di sottrarre,180 interpreta 45 s come 45 min.

Didattica: Bilancio con accumulo e tempi nella medesima unità.

Modalità distinta: EXACT_ORACLE; esito True. Firma 14bd46884e15ed75c99d67a8d01cabf7304bc8270941b4559faadf03ce7a737d.

## C2-Q042

Ipotesi: Getto incomprimibile stazionario senza perdite laterali, velocità media normale cresce cadendo; portata comune.

Derivazione manuale: Per un getto continuo stazionario incomprimibile, senza perdite laterali, Q=Av resta costante lungo il getto. La gravità ne aumenta la rapidità in caduta, dunque l’area deve diminuire. Stazionario non significa che la velocità sia uguale in tutti i punti.

Distrattori: Portata non cala senza accumulo/perdita; densità non nulla; stazionario non significa uniforme nello spazio e gravità non sottrae massa.

Didattica: Continuità fra sezioni senza confondere stazionarietà e accelerazione della particella.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 45ce7f94566784943c321d8dd7375d77adf54ec191a05612fdbe4b85e20df60b.

## C2-Q043

Ipotesi: Tubo circolare, portata 8πcm³/s e velocità normale media 2 cm/s; diametro positivo richiesto, non raggio.

Derivazione manuale: Da Q=Av_m ricavo A=(8π)/(2)=4π cm². Con A=πr² ottengo r=2 cm e diametro 4 cm. La velocità assegnata è la media normale sulla sezione; r e diametro non sono intercambiabili.

Distrattori: 2 cm è raggio,8 raddoppia già il diametro,4π copia coefficiente di area come lunghezza; 16 cm darebbeQ 128πcm³/s, non 8π.

Didattica: Area, raggio e diametro distinti, π cancellato esattamente.

Modalità distinta: EXACT_ORACLE; esito True. Firma 8cdaebe8586598b311938b9856a29892cd70abc1dfcf9e86c4b89463ef7007c9.

## C2-Q044

Ipotesi: Raccordo incomprimibile stazionario senza accumulo,36 mL/s in ingresso,840 mL/min nel primo ramo; secondo ramo uscente.

Derivazione manuale: Porto 840 mL/min a 14 mL/s. La continuità stazionaria dàQ₂=36−14=22 mL/s. Non si sottraggono numeri espressi in unità temporali diverse.

Distrattori: 50 somma i flussi, −804 sottrae 840/min a 36/s senza convertire,14 è primo ramo,18 suppone rami uguali senza dati.

Didattica: Unità di tempo uniformate prima del nodo stazionario.

Modalità distinta: EXACT_ORACLE; esito True. Firma a9fafc94308b0aac95e249eedd201db40003e0679448d60e980fd72a4d99d5df.

## C2-Q045

Ipotesi: Campo di velocità in tubo a sezioni diverse; portata totale costante non basta a imporre profilo locale indipendente dal tempo.

Derivazione manuale: Per campo stazionario, la velocità in ogni punto fisso della condotta deve restare costante nel tempo, anche se varia da una sezione all’altra e all’interno della sezione. La sola portata costante non esclude cambiamenti temporali del profilo a integrale costante.

Distrattori: Uniformità spaziale è altra proprietà; particelle possono accelerare per variazioni spaziali. Q costante non determina il profilo né richiede velocità zero.

Didattica: Definizione locale del campo stazionario esplicita.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 7603ba13649ce00fc3ce8ae461682a71163871c542c15c8f707f45c2ba3d4257.

## C2-Q046

Ipotesi: Liquido omogeneoρ0,85 kg/L, Q 12 L/min costante; si chiede massa transitata nel preciso intervallo 1 s.

Derivazione manuale: La portata massica èρQ=(0,85 kg/L)(12 L/min)=10,2 kg/min=17/100 kg/s. In un secondo passano 0,17 kg. Litri e densità si combinano prima di convertire il minuto in secondi. Il valore del modello pre-key è la portata di massa 17/100 kg/s; moltiplicando per 1 s si ottiene la massa 17/100 kg richiesta dalla nuova edizione, senza cambiare il coefficiente.

Distrattori: 10,2 kg transita in 1 min,0,85 copia densità,12 copia portata numerica in altre unità,17 perde fattore 100.

Didattica: Portata di massa trasformata in massa su 1 s, senza confonderla con accumulo.

Modalità distinta: EXACT_ORACLE; esito True. Firma 36c2b37803ad2f257a59396eb11fa180a10864c24d4b346fd3b340f68a2d292a.

## C2-Q047

Ipotesi: Gas senza accumulo, densità uniforme su ogni sezione, ρ₂=2ρ₁ eA₂=A₁/2, flusso normale medio confrontato.

Derivazione manuale: Senza accumulo la portata massicaρAv_m è la stessa. Raddoppiareρ e dimezzareA lasciaρA invariato; la velocità media resta uguale. Per un gas comprimibile non basta imporreQ volumetrica costante a priori.

Distrattori: Raddoppio considera solo area, dimezzamento solo densità, quadruplicare applica entrambi nello stesso verso; in realtàρA resta uguale. Flusso non deve fermarsi.

Didattica: Conservazione della massa anche quando le portate di volume differiscono.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 92f4b4dbbb9730519c91029a108f70f2dc9f66dec1c73641d9c8ec087af6549f.

## C2-Q048

Ipotesi: Profilo non uniforme, portata integrale della componente normale sulla sezione; media areale, non massimo o media temporale.

Derivazione manuale: La parola richiesta è media: in Q=Av si usa la media areale della componente normale alla sezione. Con profilo non uniforme non è in generale la velocità al centro né il massimo; eventuali contributi di flusso opposto hanno segno.

Distrattori: Massimo, minimo e valore sull’asse non ricostruiscono in generale l’integrale; componente tangenziale non attraversa la sezione.

Didattica: Media normale areale derivata dall’integrale.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 6d337fb3643914bdfe1b1528faa823b515449eb5805091d6111884c3186b7f28.

## C2-Q049

Ipotesi: Linea inizialmente vuota 120 mL, portata pompa 2,4 L/3 min costante, no perdite, elasticità o vie alternative; arrivo al termine del riempimento.

Derivazione manuale: La pompa haQ=2,4 L/(3 min)=800 mL/min=40/3 mL/s. Per riempire 120 mL, t=120/(40/3)=9 s. È il modello ideale di una linea inizialmente vuota che si riempie senza compressibilità, dispersione o volume addizionale non dichiarato.

Distrattori: 0,15 è durata inmin,15 s fornirebbero 200 mL,90 s è fattore 10, zero ignora volume di riempimento; 3 min definisconoQ, non ritardo aggiuntivo.

Didattica: Transitorio di riempimento distinto dal flusso dopo l’uscita.

Modalità distinta: EXACT_ORACLE; esito True. Firma c7837eb787b856c24220c0d242f9fe31c84b604c537bc5a918ab049ddf0d6971.

## C2-Q050

Ipotesi: Rete stazionaria incomprimibile, Qtot 6 mL/s, media normale 0,20 cm/s sull’intera area aperta; area totale richiesta.

Derivazione manuale: Converto 6 mL/s in 6 cm³/s. Dividendo per 0,20=1/5 cm/s ottengoA_tot=30 cm². La velocità è media sulle sezioni aperte complessive assegnate, non la velocità in ogni singolo ramo.

Distrattori: 1,2 è coefficiente diQv con dimensione diversa,0,30 e 300 errano fattori 100/10,6 copia la portata; area individuale dei rami non è assegnata.

Didattica: Area totale e media globale, senza inventare singoli diametri.

Modalità distinta: EXACT_ORACLE; esito True. Firma 9f13a770e20b9ce8d43473803ec74ef1352b121adf4ffb0091e43891212e9acc.
