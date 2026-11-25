# Authoring DRAFT — temperature-difference-148

Tutti i 16 prompt originali di questa famiglia U5-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati esatti e procedure manuali esplicite, con scale, rapporti e coefficienti dichiarati. Lezioni reali C3-L01/L02/L06/L07 rilette; corso C3 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u5-temperature-difference-01 — L’intervallo fra due letture Celsius

Sottraiamo i numeri delle due letture: quaranta meno venti dà venti. Il passo di un grado Celsius ha la stessa ampiezza di un kelvin, quindi l’intervallo è venti K. Convertendo prima entrambe le temperature otterremmo 313,15 e 293,15 K; la loro differenza è ancora venti K.

Controllo didattico d’autore: 293,15 K sarebbe la temperatura assoluta del corpo freddo, non l’intervallo. Sessanta somma le letture e meno venti inverte l’ordine. L’offset riguarda l’origine della scala, non la dimensione del suo passo.

Source SHA256 32275d10bbce6286ea2e7fab319b2646f904ac8c7f8ab03906a277b60c5110b7; candidato SHA256 ab04b1cf035020d8cef71ae2a187d2b83f6a041eb9be96947e951bf7c4966528. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-02 — L’unità di un intervallo termico

La grandezza è una variazione di temperatura, la cui unità SI è il kelvin. Non è il calore scambiato: la stessa differenza può corrispondere a energie diverse in corpi con capacità termiche diverse. Un intervallo di un grado Celsius corrisponde a un kelvin.

Controllo didattico d’autore: J misura energia, W potenza e Pa pressione. K⁻¹ compare in coefficienti inversi di temperatura, non in una differenza. Il simbolo del kelvin si scrive senza il segno di grado.

Source SHA256 ac8b1edfa7b1724ba67488545287368ebe5aab04e1f5d2c6bad4fabf53a5fb10; candidato SHA256 a729e211f84f15173f659e50f5350ca97866464688818b2f1b80db70e4aacf00. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-03 — Raddoppiare Celsius non raddoppia la temperatura

Le temperature assolute sono 293,15 K e 313,15 K. La differenza è venti K, ma la seconda non è il doppio della prima: il doppio sarebbe 586,30 K. Il rapporto quaranta su venti confronta soltanto i numeri Celsius, che hanno un’origine spostata rispetto allo zero assoluto.

Controllo didattico d’autore: 293,15 K è la prima temperatura, non il suo aumento. 273,15 K è l’offset delle scale. Per rapporti termodinamici servono temperature assolute; per differenze l’offset si cancella.

Source SHA256 af8fd88391a0c6784ca2fca05de99feb74b81e32ef369abef1cf47a2560147c7; candidato SHA256 7e6a7aa52dcaa4d417de4a0d5fe722485691e53e37d51334dc44556a14107083. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-04 — Scaldare soltanto il corpo caldo

L’intervallo iniziale è quaranta meno venti, venti K. Quello finale è sessanta meno venti, quaranta K. In questo confronto l’intervallo raddoppia, benché il numero Celsius del corpo caldo cresca soltanto di tre mezzi. Il corpo freddo rimane alla stessa temperatura.

Controllo didattico d’autore: Trenta applica tre mezzi all’intervallo invece di rifare la sottrazione; sessanta copia la lettura calda. Dieci inverte l’effetto e venti ignora il cambiamento.

Source SHA256 8503691de4522acc85de6de09ca2353c5d82ff04f8d4ed4abf33784719dd963f; candidato SHA256 a952830df69f5fceb642f2c99bd566749259d075aa32207c173a7e9247b72f8d. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-05 — Ricostruire la lettura più calda

Il numero d dell’intervallo è venti. Alla lettura fredda venti si aggiunge un intervallo di venti gradi Celsius, ottenendo quaranta °C. La conversione assoluta serve solo come controllo: 293,15 K più venti K dà 313,15 K, cioè quaranta °C.

Controllo didattico d’autore: Zero sottrae l’intervallo nel verso sbagliato, venti copia la sola lettura fredda. 313,15 è il valore in kelvin e non può essere etichettato °C. Nel calcolo t_c è il numero della lettura Celsius.

Source SHA256 53563c6af358dbc46537543a49c056a46faf287116127968d4f455b79944e619; candidato SHA256 5d5b5ae9fdca5bdc95db9a2f248d185fbace89722d5d4f9a4e7e99da4f6f77d7. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-06 — Trovare la lettura del corpo freddo

Isoliamo la lettura fredda sottraendo l’intervallo al numero caldo: quaranta meno venti dà venti °C. Il risultato conserva l’ordine delle temperature e rientra nel dominio di questa prova. L’offset non va sottratto una seconda volta.

Controllo didattico d’autore: Sessanta aggiunge invece di sottrarre e supererebbe il corpo detto caldo. Quaranta ignora l’intervallo. La positività Celsius è un dominio scelto per questi dati, non un divieto fisico delle letture Celsius negative.

Source SHA256 966fbabec27b10b90ee1ff29b75fb7206e59fbb25693b72db3e099e10d3766d9; candidato SHA256 c702fd8244a46491934e200016d0f2e417f891b5ea316eb9356b9d636b357664. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-07 — Il corpo freddo si raffredda

Gli intervalli sono venti K e trenta K. Il rapporto è trenta su venti, tre mezzi. È un rapporto fra differenze, per le quali l’offset è già cancellato; non è il rapporto fra le temperature assolute dei corpi freddi.

Controllo didattico d’autore: Un mezzo segue solo il numero Celsius freddo; due terzi capovolge gli intervalli. Due ignora la lettura fredda finale e uno ignora la variazione. La differenza cresce quando la temperatura fredda diminuisce.

Source SHA256 aa9e68f774ac7844e229cc9a4b40488a3576d6fdfe8ec1584f1bb6d19ffc0850; candidato SHA256 84ffc88991bd36d49bed8838791e7ced527c10b240988cfb9728cbcdc5609915. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-08 — Scarto di un intervallo sovrastimato

L’intervallo corretto vale venti K. La proposta quaranta meno il corretto venti dà uno scarto positivo di venti K. L’errore è fra due intervalli della stessa grandezza; non deve subire conversioni di origine della scala.

Controllo didattico d’autore: Meno venti cambia l’ordine, quaranta conserva la proposta e sessanta somma. Zero accetta una differenza raddoppiata. Aggiungere 273,15 allo scarto non ha giustificazione.

Source SHA256 51d706ec9197df1e520bd96384d9f14c8383ae1487f423ab034d4a670920ae56; candidato SHA256 9a93761bc5b913f3162398af72ee635a55c2d53387697680f12dc98f09791c44. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-09 — L’inversa espressa con letture numeriche

Dalla sottrazione d=t_c−t_f aggiungiamo t_f a entrambi i membri. Risulta t_c=t_f+d. I simboli qui sono numeri di letture nelle scale dichiarate, perciò la formula non mescola una temperatura Celsius assoluta con un offset Kelvin non convertito.

Controllo didattico d’autore: t_f−d ricostruirebbe il lato freddo a partire da quello caldo, non l’incognita richiesta. d−t_f cambia l’algebra e può essere negativo. Prodotto e quoziente non invertono un bilancio additivo.

Source SHA256 f2ae324ac54d9c74fbcb70ec92b8b70a58f6e650c4862941aa007102d053a33e; candidato SHA256 475f5db7456e52955d029ef7070fe1e6f1ec4aa0b37c37a9488ad663ca28b430. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-10 — Fattori sulle temperature assolute

I fattori scalano qui temperature assolute in kelvin. Applichiamoli prima di calcolare la nuova differenza e dividiamo per la differenza iniziale. Non si attribuiscono gli stessi fattori ai numeri Celsius, perché la conversione di scala contiene un offset.

Controllo didattico d’autore: La differenza dei fattori darebbe zero per prove identiche; prodotto e quoziente perdono i pesi delle temperature. Il rapporto delle somme è un’altra grandezza. Il dominio impedisce un intervallo finale negativo.

Source SHA256 f9bcaf12e116d4359ab11cff1b16cf3920480c6d34dabf4317a2329610fc896e; candidato SHA256 b00ecdd4ec1a67e922e0b7f4a3048ba96d0d7b95546061945063716f095daf17. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-11 — Cambiano entrambe le letture

A dà venti K e B sessanta meno dieci, cinquanta K. Cinquanta diviso venti si semplifica a cinque mezzi. Il rapporto riguarda gli intervalli: i fattori delle singole letture Celsius non si trasferiscono direttamente alla loro differenza.

Controllo didattico d’autore: Due quinti capovolge il rapporto, tre mezzi segue soltanto la lettura calda e un mezzo quella fredda. Cinque omette il fattore due del denominatore venti.

Source SHA256 c62a6143593aa035c3ab798b9ce857e0695d20ffc0641246face494cb29539c1; candidato SHA256 59058c8af0a0d4e334b40c23d98c60074ca029b378c795da149a7f15bced91d5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-12 — Media di intervalli termici

Gli intervalli venti e cinquanta K hanno semisomma trentacinque K. Qui le letture medie cinquanta e quindici °C restituiscono lo stesso intervallo: la differenza è lineare nei numeri della scala e i pesi sono uguali. Non si sta prevedendo la temperatura di equilibrio di due corpi messi a contatto.

Controllo didattico d’autore: Settanta è la somma, quindici la semidifferenza e venti o cinquanta copiano una prova. La coincidenza con l’intervallo delle letture medie non dipende dalle capacità termiche dei corpi: si tratta di una media statistica di dati.

Source SHA256 04af61ca817ecef017bcc44bfdb153276341fb37c0ba6b78aa4fb0a727e5515c; candidato SHA256 c8875c0204a40a128b500edccbc3659b425665965e52b84d9b054997c0a361e3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-13 — Un bersaglio e un rapporto assoluto

L’intervallo A vale venti K, quindi il target B è cinquanta K. La lettura fredda B è 66,85−50=16,85 °C. Convertendo i due corpi freddi otteniamo T_f,A=300 K e T_f,B=290 K: il rapporto è ventinove trentesimi. La scelta di questi dati rende esatta e breve la conversione, senza approssimazioni.

Controllo didattico d’autore: 16,85/26,85 confronta numeri Celsius e non temperature assolute. Trenta ventinovesimi inverte le prove; cinque mezzi copia il target sugli intervalli. Tre mezzi non considera né la differenza richiesta né la conversione.

Source SHA256 1b170cd3f1168bbe851125be7dfa4c6cdf5165772a6f19429b82c25389686e2a; candidato SHA256 41014c07029eed284f9441ea5420959dabbdaca6a1577b9b47343d7759a72250. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-14 — Tarare un display dell’intervallo

L’intervallo di riferimento venti K dà q=3 K⁻¹. La nuova lettura rappresenta centocinquanta diviso tre, cinquanta K. La lettura calda è quindi dieci più cinquanta, sessanta °C. Il display non indica direttamente una temperatura assoluta del corpo caldo.

Controllo didattico d’autore: Centosessanta aggiunge la lettura grezza a quella fredda senza rimuovere il guadagno. Cinquanta copia l’intervallo e dieci il corpo freddo. L’offset Celsius non entra nella taratura di un intervallo.

Source SHA256 2fff793e840a96c60e0b4f7b08dc070ec0cb0e0c36a5a9640c7cae27560474c1; candidato SHA256 82139315771227047bd4233c4b752ac237e9a0d276184b6883f153c2a7f284da. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-15 — Offset strumentale e differenza di temperatura

Le due tarature hanno intervalli venti e cinquanta K. La differenza sessanta delle letture divisa per trenta K dà q=2 K⁻¹; poi b=1. C ha intervallo (81−1)/2=40 K, quindi la lettura calda è venti più quaranta, sessanta °C.

Controllo didattico d’autore: Quaranta è l’intervallo, ottanta copia S−b senza invertire il guadagno né ricostruire la lettura calda, e sessantuno aggiunge indebitamente b alla temperatura finale. Venti ignora l’intervallo. Il risultato sessanta ricostruisce S=2(60−20)+1=81.

Source SHA256 44374bb52ccfb1914487ec53e5bcb3fa442c02448f4c1776e34cdbc3f86696f7; candidato SHA256 249e1141eee708826638c07b723be293d277bd5e287e22fe331d693e8c615956. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-temperature-difference-16 — Un vincolo sui numeri Celsius

Sostituiamo il vincolo nella differenza numerica: d=2t_f−t_f=t_f. Poiché d=20, la lettura fredda è venti °C e quella calda quaranta °C. In kelvin sono 293,15 e 313,15: il vincolo non afferma che una temperatura assoluta sia doppia dell’altra.

Controllo didattico d’autore: Dieci dimezza l’intervallo ignorando il termine sottratto; quaranta copia la lettura calda e zero viola la misura. La soluzione è unica nel dominio assegnato; il coefficiente due è puro perché collega due numeri della medesima scala dichiarata.

Source SHA256 94039efce5c1db3fbcc3295a3f0e4e20cf23a0684585f9f319ec0f7fe2691c81; candidato SHA256 f550a22bb5239a1e111eb5776a12fe56c57db8963fd3713d37390a3d3cd68d5c. Nessun giudizio scientifico indipendente attribuito all’autore.

Tutti gli 80 prompt originali U5-01 delle cinque famiglie assegnate letti individualmente prima di scrivere nuovi moduli; SHA256 file fonte 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. C3-L01 riletto dal pin Cric; prerequisito C1-L001 per misure. Per evitare un falso rapporto termodinamico di numeri Celsius, il caso 10 scala temperature assolute in kelvin e preserva le disuguaglianze. Nel 13 ho riparametrizzato le letture in 46,85/26,85 °C per A e 66,85 °C calda B: il target di intervallo conduce alla lettura fredda 16,85 °C, cioè 290 K contro 300 K. Si chiede il rapporto assoluto 29/30; il quoziente Celsius è esplicitamente un distrattore. Il 16 conserva invece un vincolo dichiarato sui soli numeri delle letture Celsius, senza affermare che una temperatura assoluta raddoppi. Medie statistiche di intervalli non sono temperature di equilibrio termico. Tutti i valori e gli offset sono esatti nel modello assegnato. SVG con due assi a passo uguale ma zero assoluto fuori dal riquadro; pannello finale da zero a scala distinta per i kelvin assoluti. Prima anteprima48/48 tecnica riuscita; poi spazi corretti nel solo desc SVG per leggibilità, package/binding rigenerati e nuovo run finale48/48 exit0 sul nuovo hash. Nessun own PASS scientifico.
