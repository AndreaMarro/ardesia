# Authoring DRAFT — isothermal-work-152

Tutti i 16 prompt originali di questa famiglia U5-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati esatti e procedure manuali esplicite, con scale, rapporti e coefficienti dichiarati. Lezioni reali C3-L01/L02/L06/L07 rilette; corso C3 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u5-isothermal-work-01 — Un raddoppio calibrato

Il rapporto dei logaritmi è ln2/ln2=1: il lavoro è proprio il valore di taratura dieci joule. Non occorre conoscere il valore decimale di ln2 né separare n,R,T. Il volume aumenta e il lavoro del gas è positivo.

Controllo didattico d’autore: Venti usa il rapporto dei volumi al posto del numero di raddoppi. Cinque divide per due ancora una volta e zero confonde isoterma con assenza di lavoro: per il gas ideale è ΔU a essere nulla, non necessariamente W.

Source SHA256 8c73b5d5f0b258f5e761c31860c5af0986620b5e5ab08ee20ca6cc2b1f74390b; candidato SHA256 bb69ca86f2c4c8b71c85a3f9417339578e4436253dd99afe34ed4269843e59e0. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-02 — L’unità del lavoro

Il lavoro è un’energia e si esprime in joule. Nel prodotto nRT le moli e i kelvin si cancellano con le unità di R, lasciando joule; il logaritmo del rapporto di volumi è puro.

Controllo didattico d’autore: Pa è pressione, il simbolo W nell’elenco delle unità è watt e indica potenza. K è temperatura e J/K energia per temperatura. Il simbolo di una grandezza non coincide necessariamente con l’unità dal nome simile.

Source SHA256 8709b2b41d9bf1fd9cd1b8ce5fe47a2795f1dc559021116ba 251a00d50ad199f; candidato SHA256 8f30c9fad6db4e521b2df28cb19315f67b55473112ec43eb6704b2c4027b2e9b. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-03 — Usare il riferimento senza valutare logaritmi

Da W₂=nRT ln2 si ricava nRT=W₂/ln2. Sostituendo in W=nRT ln r si ottiene W₂ ln r/ln2. Il logaritmo descrive quanti raddoppi, anche non interi, separano i volumi. Per r=1 il lavoro è zero; per compressione 0<r<1 è negativo.

Controllo didattico d’autore: W₂r e W₂/r non si annullano a r=1. Invertire i logaritmi rende il risultato indefinito proprio a volume invariato; ln(2r) aggiunge un contributo non richiesto. Non basta che un candidato abbia unità di energia: deve rispettare taratura e segno.

Source SHA256 7d2a5daae112d64ef4b5e36d9547944d87f60af44fcef858f0df7f496f519925; candidato SHA256 37081bda29f25ecedb94c0fc7fda1a227b3c4cba358c3dd47c030f95684c7eb3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-04 — Una diversa temperatura fra due prove

Ogni trasformazione è un raddoppio, perciò ciascun lavoro coincide con il proprio W₂. Il raddoppio della taratura dà un raddoppio del lavoro. A parità di n questo confronto usa T_B=2T_A; non è una singola isoterma a temperatura variabile.

Controllo didattico d’autore: Quaranta conta due volte il fattore due, cinque lo inverte e dieci lo ignora. Zero identifica erroneamente temperatura costante entro la prova con lavoro nullo. Il cambiamento di T riguarda due prove distinte.

Source SHA256 0dd46fe578f7fe566bd7ae297891b43d5cc0c2151117697a6a7bce87e6c3aa8c; candidato SHA256 b5a27f27b819c63ddb8514cce95c7da0f5e558af5a464f3eaca0b141923847c8. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-05 — Ricostruire il lavoro di taratura

Per un raddoppio il quoziente dei logaritmi vale uno. L’inversa W₂=W ln2/lnr restituisce dieci joule. Il dato è compatibile con W₂ positivo perché si tratta di un’espansione e W è positivo.

Controllo didattico d’autore: Venti moltiplica per r anziché per il rapporto dei logaritmi; cinque divide per r. Un decimo prende il reciproco di un’energia. Il caso r=1 non permetterebbe questa inversa e qui non si presenta.

Source SHA256 dddc461a674c406d02dab755a1445e465eeb0696f1bb5b045addd1adcdb4d0b1; candidato SHA256 2c9c715a2c434864b1dea0635f1833fbc87d0d192a3050a6f47a0742f6a5a43a. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-06 — Dal lavoro al rapporto dei volumi

Il quoziente W/W₂ vale uno, dunque ln r=ln2 e r=2. Questa conclusione usa l’iniettività del logaritmo per r positivo, senza logaritmi decimali. Il segno positivo di W conferma r>1.

Controllo didattico d’autore: Uno darebbe lavoro zero, quattro due raddoppi e un mezzo una compressione con lavoro negativo. Dieci copia il numero del lavoro come se fosse un rapporto puro, senza l’inversione della legge.

Source SHA256 1f3368f3467525d210a2c0e8e6176c8864f0e33b2e5819603cc6562fb62f2c54; candidato SHA256 1a8251c6630d0e6e9fa3cd969afcacb6c30889c67230d9a7ef4a429170517b92. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-07 — Due raddoppi successivi

Quattro è due al quadrato, quindi ln4=2ln2. Il primo lavoro è dieci joule e il secondo venti joule. Due raddoppi successivi allo stesso n,T hanno uguale lavoro e si sommano: il rapporto è due, non quattro.

Controllo didattico d’autore: Quattro segue il valore finale di r senza confrontare logaritmi; un mezzo inverte A e B. Uno ignora il secondo raddoppio e un quarto applica due inversioni. Non serve approssimare ln2.

Source SHA256 331c496a57ba70004e80364dbda8561bc753206378a0e1dbf306d97027951d1e; candidato SHA256 7258cc7cdef1c4e5bc094a111d37ddb2989ff827af751000e3f91f6ef831d5d9. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-08 — Una proposta che confonde r con il fattore di lavoro

Un raddoppio produce dieci joule, mentre la proposta ne attribuisce venti. La differenza ordinata è venti meno dieci, dieci joule. La quantità r non moltiplica direttamente W₂: entra nel logaritmo.

Controllo didattico d’autore: Meno dieci cambia l’ordine, venti ripete la proposta e trenta somma. Zero accetterebbe una legge W=W₂r che non si annulla nemmeno quando r=1.

Source SHA256 e64238043d290a89e50b64c890400daa4ca4d5dd08402b57c60e7d852adf9bd8; candidato SHA256 36f557c74933e064b21df665e671c2e46c0fb3f5adf91479d884136736f53483. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-09 — L’inversa generale e il suo dominio

Moltiplichiamo per ln2 e dividiamo per ln r, che non è zero nel dominio dichiarato. Si ricava W₂=W ln2/lnr. La compatibilità assicura W₂>0 anche per una compressione, perché W e ln r hanno allora entrambi segno negativo.

Controllo didattico d’autore: Riapplicare la legge diretta scambia i fattori dell’inversa. Il reciproco ha unità inverse di energia, W/r sostituisce impropriamente il logaritmo e ln(2r) non rimuove la taratura. A r=1 il dato W=0 sarebbe compatibile con ogni W₂ positivo e non lo identificherebbe.

Source SHA256 b0519de631817f07b658ba4c25eb5c62e3110c57daaa8d992898267d62142c9d; candidato SHA256 c6b945136406af447dbc75900f9296fa0ab4b9894a63796038302075b78e2815. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-10 — Fattori su taratura e volume

Il nuovo lavoro contiene κ₁ nella taratura e ln(κ₂r) nel logaritmo. Dividendo per il lavoro A si cancellano W₂ e ln2; rimane κ₁ ln(κ₂r)/lnr. Il denominatore non è nullo grazie a r≠1; B può avere lavoro nullo se κ₂r=1.

Controllo didattico d’autore: Prodotto e quoziente dei fattori trattano r come argomento lineare. L’altro rapporto di logaritmi sposta κ₁ dentro un argomento sbagliato. La somma omette la divisione di lnκ₂ per lnr. Se κ₂=1 la risposta corretta deve ridursi a κ₁.

Source SHA256 c6e9876d592bfb203ab064a6831acee8b714016d6f97db88f6e86f9c0196eef1; candidato SHA256 acc2453f2d43cc66aa82b3c73fefdd95de49d6cf4bce064ab0e490b6fad0d1a2. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-11 — Taratura doppia e due raddoppi

A compie un raddoppio con lavoro dieci joule. B ne compie due, ciascuno da venti joule: W_B=40 J. Il rapporto è quattro, prodotto dei due fattori due di taratura e numero di raddoppi. La temperatura di B è doppia a parità di n.

Controllo didattico d’autore: Due considera un solo cambiamento; un quarto inverte il rapporto completo e un mezzo un fattore soltanto. Otto usa r_B=4 come numero di raddoppi e moltiplica anche per il due della taratura.

Source SHA256 dd91e3acdbfd0e3d6a64f486d8b75f4aee9c645246ef6eeca0f85e86f1b20147; candidato SHA256 1e5293921720f2763ae81ddafe64bdda3499a1f3b0be2dcbedd7c4d3d342eabc. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-12 — Media statistica di due lavori

I lavori sono dieci e quaranta joule, quindi la media è venticinque joule. Le medie degli ingressi sarebbero W₂=15 J e r=3 e darebbero 15ln3/ln2 J, un valore diverso: l’uguaglianza a 25 richiederebbe 3³=2⁵, mentre 27≠32. Non occorre calcolare alcun logaritmo decimale.

Controllo didattico d’autore: Cinquanta è la somma, quindici la semidifferenza e quaranta la sola prova B. L’espressione con ln3 risponde al modello sugli ingressi medi, non alla media delle uscite. Il peso statistico non è una durata di processo.

Source SHA256 bf4b21da114f3135f6f78c05521f92f7ae3af6f8351adbf58bb1595a18a9eb35; candidato SHA256 df9902cde077bece4bd85fe2239349fcbf6fa33f0be03b2fe273e41a06d56c82. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-13 — Il rapporto di volumi necessario

Il target è quaranta joule. Ogni raddoppio in B vale venti joule, quindi ne occorrono due: lnr_B/ln2=2 e r_B=4. Dividendo per r_A=2 otteniamo due. Il rapporto dei volumi r_B non coincide con il rapporto fra i due r.

Controllo didattico d’autore: Quattro copia r_B anziché dividerlo per r_A; un mezzo inverte il rapporto richiesto. Uno consentirebbe soltanto il raddoppio del lavoro dovuto a W₂, non il fattore quattro. Otto moltiplica anziché dividere i due rapporti di volume.

Source SHA256 e901bef799cb0a021694bf39b9684466f0cc9a428e8b2e9dad1eeed2c9429bc4; candidato SHA256 a76d2cecb1d58df306071c6657633c355502f382b21da4a65b4d3cda6d7a4748. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-14 — Display del lavoro e taratura termica

La prova A ha lavoro dieci joule: q=3 per joule. S=120 rappresenta quaranta joule. Poiché r=4 contiene due raddoppi, la nuova taratura è W₂,B=40/2=20 J. Fra A e B cambia la temperatura, non il guadagno del display.

Controllo didattico d’autore: Sessanta usa la lettura 120 come lavoro prima di dividere per due; quaranta copia il lavoro totale di B. Dieci conserva la vecchia taratura senza rispettare il nuovo display. La lettura continua non è un conteggio discreto di joule.

Source SHA256 e80a02475bf746dd04c3db8ee721823a6d88f21d76e61e0c3c26e14b46126929; candidato SHA256 3d2a689f872ee1a872c283a5b7eddf064ce042ee55d7bad7a66a6d7914e91961. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-15 — Offset prima del numero di raddoppi

A e B hanno lavori dieci e quaranta joule. La differenza sessanta dei display su trenta joule dà q=2 per joule; b=1. C ha W_C=(41−1)/2=20 J. Siccome r=2, questo è anche il lavoro di un raddoppio W₂,C.

Controllo didattico d’autore: Dieci copia A, quaranta copia B e 41/2 dimentica l’offset. Quarantuno usa direttamente il display come energia. La risposta deve ricostruire S=2·20+1=41, nelle stesse unità strumentali.

Source SHA256 2cd9e65bfa400d13ef0eb1375eb00bce6162ce0c624683b1ad5b5f2b1ecaa173; candidato SHA256 0e86239492a7cb286e8721ad1c9fc130417d6f7ed3a6871ba195dcc7833bfab9. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-work-16 — Il calore della sola isoterma calda

Chiamiamo A=nRT_h ln4 il lavoro dell’espansione calda. La compressione fredda percorre il rapporto inverso 1/4 a temperatura dimezzata e compie −A/2. Le isocore non aggiungono lavoro, quindi W_net=A/2=12 J e A=24 J. Sulla sola isoterma calda ΔU=0 per il gas ideale: il primo principio dà Q_h=W_h=24 J.

Controllo didattico d’autore: Dodici copia il lavoro netto, quarantotto applica un fattore due ancora una volta e meno ventiquattro confonde espansione con compressione. Diciotto non soddisfa W_net=A/2. Il calore totale assorbito nel ciclo comprenderebbe anche il riscaldamento isocoro e non è la quantità domandata.

Source SHA256 58fc09dca920dd2d949b77e3be76636724ce943044b0f88096d9382b09b43b42; candidato SHA256 1a306e3e383d7466ec280d04a58c2ee9d6da2b70609d8cee5ab4fa240bc617fa. Nessun giudizio scientifico indipendente attribuito all’autore.

## Logaritmi, segni e ciclo separato

W è positivo se compiuto dal gas. Il modello comprende r>0: espansione, volume invariato e compressione hanno rispettivamente W positivo, nullo e negativo. Soltanto dove si divide per ln r si esclude r=1; il caso09 dichiara anche la compatibilità di segno necessaria a W₂>0. Nel rapporto10 il denominatore A è non nullo e il lavoro B può essere zero. Si conserva n nei confronti: una diversa taratura W₂ fra prove rappresenta una diversa temperatura assoluta, costante entro ciascuna isoterma, non una variazione di T lungo una stessa isoterma.

Le risposte numeriche usano ln4=2ln2 e la cancellazione di ln2, senza valutarlo in decimali. Nel12 il valore simbolico sugli ingressi medi non viene approssimato: la presunta uguaglianza a 25 J condurrebbe a 3³=2⁵, confutata da 27≠32. Si distinguono media statistica dei lavori e un’unica trasformazione fisica. Nel16 l’espansione calda compie A, la compressione alla temperatura dimezzata −A/2 e le isocore lavoro nullo. Il lavoro netto 12 J fissa A a 24 J; ΔU=0 sulla sola isoterma calda permette Q_h=A. Il calore del riscaldamento isocoro è espressamente escluso dalla domanda, senza presumerlo nullo.

La figura mostra curve campionate dall’equazione analitica esatta, non un calcolo numerico richiesto allo studente. Primo grafico: 100 px per V/V₀ e 220 px per p/p₀, con p₀V₀=nRT; i due intervalli 1→2 e 2→4 hanno uguale lavoro fisico W₂. La barra successiva usa 20 px/J e due tratti da 200 px. Il ciclo inferiore è distinto, con nuovo riferimento p₀V₀=nRT_h e 320 px per p/p₀: stati 1=(1,1),2=(4,1/4),3=(4,1/8),4=(1,1/2). Le quattro frecce rispettano espansione calda, raffreddamento isocoro, compressione fredda e riscaldamento isocoro. I numeri degli stati evitano confusione con il simbolo A del lavoro caldo.
