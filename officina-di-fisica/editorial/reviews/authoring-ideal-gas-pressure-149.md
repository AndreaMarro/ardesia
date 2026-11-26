# Authoring DRAFT — ideal-gas-pressure-149

Tutti i 16 prompt originali di questa famiglia U5-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati esatti e procedure manuali esplicite, con scale, rapporti e coefficienti dichiarati. Lezioni reali C3-L01/L02/L06/L07 rilette; corso C3 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u5-ideal-gas-pressure-01 — La pressione assoluta del campione

Il prodotto nRT è trecento J. Dividendo per tre L otteniamo cento J/L, cioè cento kPa. L’identità fra kPa·L e joule evita conversioni numeriche supplementari, ma non elimina le unità né trasforma nR in un numero puro.

Controllo didattico d’autore: Novecento moltiplica per il volume anziché dividere; trecento copia l’energia numerica. Un valore di cento Pa perderebbe il prefisso: cento kPa sono centomila Pa. La pressione è assoluta, non la sola differenza rispetto all’atmosfera.

Source SHA256 c7a5155f6ab7fbcce886b1df74c4aa28afb3b7b77ed24e39ac5d684a6517c4e2; candidato SHA256 5fbc3bc2a13c1a7267b81e8cb92b6137458b19b29fcfdd65efb47d34855f4bde. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-02 — Quale unità esprime p

Una pressione è forza per area e ha unità pascal; il kilopascal è mille pascal. Dal bilancio del gas, energia su volume ha la stessa dimensione. In particolare un J/L equivale a un kPa.

Controllo didattico d’autore: J è energia, K temperatura e L volume. J/K è l’unità del prodotto nR o di una capacità termica, non di una pressione. Il prefisso kilo cambia il valore numerico, non la dimensione.

Source SHA256 ac1c09969538f98dff6aed5faf5e0a8f4084170800fafbe91e2e9fe594efc95e; candidato SHA256 58fd30ab70e3dff7d028cbc1a915bcb8d20094e30d98d8e551f275d10dffa1ef. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-03 — Gli estremi di stato non fissano il calore

Gli estremi fissano la variazione di energia interna del campione, ma Q=ΔU+W contiene il lavoro del percorso. Per esempio, da (p₀,V₀) a (p₀,2V₀) si può espandere a p₀, oppure prima aumentare la pressione a volume fisso, espandere a 2p₀ e infine tornare a p₀ a volume fisso. I lavori sono rispettivamente p₀V₀ e 2p₀V₀: gli stessi estremi non bastano a fissare il calore.

Controllo didattico d’autore: Il calore è un trasferimento di energia, non una proprietà contenuta nello stato. Gas ideale non significa adiabatico. La pressione finale non ricostruisce l’area del cammino p–V. Per quantità e composizione assegnate ΔU è invece una differenza di valori di stato; per il gas ideale dipende dalle temperature.

Source SHA256 50925c881aaedcd5f638dbe932f37c906d04506ce6cafc37d11f69f495b4c62f; candidato SHA256 72a0cd196bdc415536fe4ec3f1a4e043e8e8657c20741ee491a9e5c0f338ea0d. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-04 — Raddoppiare T a volume fisso

Il rapporto delle temperature assolute è due e il volume non cambia. L’energia nRT raddoppia, quindi anche p raddoppia da cento a duecento kPa. Il confronto è fra stati di equilibrio; non occorre conoscere il percorso termico per confrontare le pressioni di stato.

Controllo didattico d’autore: Quattrocento introduce un quadrato, cinquanta rende inversa una dipendenza diretta. Seicento dimentica il volume e cento ignora l’aumento. Questo rapporto è lecito in kelvin e non si applica automaticamente ai numeri Celsius.

Source SHA256 75d436eee147ecbcdf87ac10da13b55e7445b5c4247d90707a2c2246a00539bf; candidato SHA256 975a5308d3e097c1de774815f8f923afb01dc86e5cd511f38cc68872c9cbe448. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-05 — Ricostruire T dallo stato

Il prodotto pV vale trecento kPa·L, cioè trecento J. Lo dividiamo per nR=1 J/K e otteniamo trecento K. La divisione per una grandezza con unità J/K è necessaria anche se il suo valore numerico è uno.

Controllo didattico d’autore: Cento copia la pressione e cento terzi dividerebbe per V anziché moltiplicare. Trecento °C sarebbe un’altra temperatura: la legge usa T assoluta. L’inversa conserva T>0 con tutti i dati positivi.

Source SHA256 c31518af69f1b3e33d687aa64ce8c9b3e661b26d712b16994b189c26a6d3c0ab; candidato SHA256 3fd08aa01107cd1184c3b6c99bf14ef713ed45e9269342ea2cf6593448357b82. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-06 — Il volume in litri

Isoliamo il volume dividendo nRT per p. Trecento J su cento kPa dà tre L, perché un kPa·L vale un J. In SI lo stesso risultato è 0,003 m³; non tre m³.

Controllo didattico d’autore: Un terzo inverte la divisione; trentamila moltiplica i numeri. Il litro è un volume e non una lunghezza, quindi la sua conversione in m³ porta un fattore mille.

Source SHA256 9494bb04a228ae04de681c02fa435c11afaab3493b239f401c7958a8a51b73d3; candidato SHA256 0e747e24e314e63288c552adf137f1bf32c4d1552654561c07447702708d9b59. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-07 — Un volume doppio alla stessa T

L’energia nRT resta trecento J. A tre L la pressione è cento kPa, a sei L cinquanta kPa. Il rapporto B/A è un mezzo: lo stesso numero di molecole occupa un volume doppio alla stessa temperatura.

Controllo didattico d’autore: Due segue V direttamente, uno ignora la modifica. Un quarto e quattro aggiungono un quadrato che l’equazione di stato non contiene. Il campione non perde gas fra i due stati.

Source SHA256 c5aad6d4d1866f8977ed73ca3d2ac2b56f78c7ac74db3e8169d7f4bc547b3238; candidato SHA256 2393111f701c08bdf4893f17e91813586b3c3201179f2f2b6b6c1aa9ccd42fef. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-08 — Dove il modello ideale perde accuratezza

Aumentando la densità, la distanza media fra molecole diminuisce e le idealizzazioni di volume nullo e interazioni trascurabili possono perdere accuratezza. Gli effetti possono competere: non si deduce dal solo aumento di densità un unico segno della deviazione di pressione. Non viene richiesta una nuova equazione di stato da memorizzare.

Controllo didattico d’autore: Celsius al posto di kelvin non corregge la fisica del gas reale. R è la costante universale, non un parametro del contenitore. La non idealità non impone pressione nulla né rende impossibile l’equilibrio macroscopico.

Source SHA256 6d432e0df64b3f13592790b4bc1c7199d5f251fa065d17cc0ecd149788e4d705; candidato SHA256 549c463429201bc3024f2c9ee94b31f31420c302bd2e30d27de5e8b4f768cde0. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-09 — La formula inversa per T

La temperatura è moltiplicata per nR. Dividendo pV per quella quantità otteniamo T. Per questo campione, il calcolo numerico diventa T[K]=p[kPa]V[L], ma la relazione fisica generale conserva nR con le sue unità.

Controllo didattico d’autore: Dividere per V anziché moltiplicare non isola T. Il reciproco nR/(pV) ha dimensione K⁻¹; gli altri prodotti o quozienti non hanno dimensione di temperatura. Il valore numerico uno di nR non autorizza a cancellarne l’unità.

Source SHA256 bd4aa4e77411c09516866398b996a1220474a923f40ad17ca7c95128b292d247; candidato SHA256 9d9c5a8a9c5fe67f53946b4643459de2a90df6c268914ab13833d477ea687339. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-10 — Fattori su temperatura e volume

Il campione conserva nR, che si cancella nel rapporto. La temperatura assoluta porta κ₁ al numeratore e il volume κ₂ al denominatore: p_B/p_A=κ₁/κ₂. Non occorre assegnare valori alle due temperature per questa relazione di scala.

Controllo didattico d’autore: Il prodotto rende diretta la dipendenza da V; il quoziente inverso scambia le prove. Il quadrato di κ₁ non è nella legge e la somma darebbe due per stati identici. I fattori sono di temperature in kelvin.

Source SHA256 2a9ef57237e9c41036f6e2df71bef8e41d5ff42f0a9227d0f1b83d80105a3b75; candidato SHA256 65959cc11a0c39dd3c2ac60e9b2d865f442d814feb8611ce742de82c297b582a. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-11 — Temperatura e volume cambiano insieme

A ha cento kPa. B ha quattrocento J su due L, duecento kPa. Il rapporto è due. Lo stesso esito combina il fattore di temperatura quattro terzi con l’inverso del fattore di volume due terzi.

Controllo didattico d’autore: Un mezzo inverte il rapporto, quattro terzi segue soltanto T e due terzi soltanto V. Duecento è il numero della pressione B e non il rapporto puro. Tutte le temperature sono positive e compatibili col modello classico dichiarato.

Source SHA256 f7314fc35b14e7dd1fe1a14ab64b93aa24baa24919a92e7a6b27e06c0dc9882d; candidato SHA256 2d61afcd0f64ed74767d95eadd0a857c991d357330be20c166fae8a01a46620e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-12 — Media di pressioni di due stati

Le pressioni sono cento e duecento kPa; la semisomma dà centocinquanta kPa. Non si costruisce prima uno stato con temperatura e volume medi: 350 K e 5/2 L darebbero centoquaranta kPa, un risultato diverso perché T/V non è una legge additiva negli ingressi.

Controllo didattico d’autore: Trecento è la somma, cinquanta la semidifferenza e duecento la sola B. Centoquaranta è la risposta agli ingressi medi, inferiore di dieci kPa alla media richiesta. Si tratta di una media statistica, non della pressione di un gas mescolato fisicamente.

Source SHA256 b11d27fc5700cfe975fda0401451d7f5e2416fcd03ef5a6edeacc9cdaf5d9b23; candidato SHA256 a52ce9bf8458ca339057faa88706c1c2155d8c6817fd109a0edcfa8e4fabd7c5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-13 — Un bersaglio per il volume

La pressione target è duecento kPa. Con nRT_B=400 J il volume è due L. Diviso per i tre L iniziali dà due terzi. Aumentare T da sola non basterebbe a raddoppiare p: serve anche la riduzione di V.

Controllo didattico d’autore: Tre mezzi inverte il rapporto, due copia il target e quattro terzi segue soltanto T. Un mezzo dimezzerebbe V, ma con la T aumentata produrrebbe p_B/p_A=8/3 e non due.

Source SHA256 1d08137abd48fa933b4a2eac4850f51f5dca0b22cef165bf3656d61570c42a14; candidato SHA256 3ef0106fe2a017891f1613f1b8af6fdc7fb10eb3905242eeaff93e68e12043d9. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-14 — Taratura proporzionale della pressione

A ha p=100 kPa, quindi il guadagno è tre per kPa. La lettura seicento rappresenta duecento kPa. Moltiplicando per due L si ricavano quattrocento J; dividendo per nR=1 J/K risulta T_B=400 K.

Controllo didattico d’autore: Milleduecento moltiplica il display grezzo per V e ignora q. Duecento copia il numero della pressione. Il guadagno converte S in p, non direttamente in temperatura.

Source SHA256 118f71a5bddc4fe6696224f54726762d7172d9fba05c6f1b442d9f9df09c7fbe; candidato SHA256 d101d0c88627e0e8c8b546d639a37cac239993f9d218e0b9096b6c71e1cc54df. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-15 — Un offset con pressioni coincidenti

Le pressioni A e B valgono cento e duecento kPa. Il guadagno è (401−201)/(200−100)=2 per kPa e b=1. C ha la stessa lettura di B e quindi la stessa pressione duecento kPa; il suo volume, però, è tre L. Il prodotto pV dà seicento J e T_C=600 K.

Controllo didattico d’autore: Quattrocento copia la temperatura B, confondendo pressione uguale con stato uguale. Trecento copia A e duecento il numero di p_C. Milleduecentotre è 401×3: usa la lettura grezza senza invertire offset e guadagno.

Source SHA256 90d4d2a6d94653fe4f7dcdc93a1d751eb3580a240b9ff2dea6a30d7aabdaf707; candidato SHA256 8a9bd8b77e81a8690bc168ee8bca5cabaa04346e64646e7ad0408b83d6403838. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-ideal-gas-pressure-16 — Un vincolo di stato ridondante

Sostituendo il vincolo, p=nRk: il volume si cancella. Il dato nR=1 J/K e k=100 K/L produce cento J/L, cento kPa, per ogni volume positivo nel modello. Per esempio 3 L con 300 K e 4 L con 400 K soddisfano entrambi i dati. La misura conferma il vincolo ma non determina la scala.

Controllo didattico d’autore: Una sola coppia attribuisce al dato ridondante un’informazione assente; due esempi non esauriscono le possibilità. La coppia nulla viola T,V>0. Il vincolo collega stati diversi e non significa che T cresca nel tempo con una legge assegnata.

Source SHA256 72e3a063194150ae4a44b3dc2e4e353c446754dd6fd6087c3fd249e222d4f3e2; candidato SHA256 3640636869e07c1af9366a543065e81f17fea18e677b2ac9be0dffe02c28de36. Nessun giudizio scientifico indipendente attribuito all’autore.

Lettura individuale dei 16 originali prima della scrittura, insieme agli altri 64 assegnati U5-01. Riparametrizzazione dichiarata dei casi 11–15: la fonte usava B a 1 K e 1 L; la nuova edizione usa B a 400 K e 2 L, mantenendo i compiti di confronto, media, bersaglio e taratura ma evitando una temperatura non rappresentativa del modello classico diluito. Target, opzioni e letture sono riscritti coerentemente. Il caso 03 ha primaria C3-L06 e prerequisiti veri per il primo principio: due cammini con gli stessi estremi danno lavori diversi, nessuna falsa identificazione Q=funzione di stato. Il caso 08 è qualitativo, separato dal campione ideale numerico, e non attribuisce un segno universale alle deviazioni reali. nR=1 J/K è proprietà assegnata del campione, non il valore di R; pressioni e temperature sono assolute. Le figure mostrano rettangoli pV di stato e barre di volume con scale comuni dichiarate, senza cammino di lavoro fra A e B. Nel 15 una lettura uguale indica pressione uguale, con V e T che possono differire. Nel 16 il dato di pressione è ridondante col vincolo fra stati. Nessuna nuova pipeline, registro o autofirma scientifica.
