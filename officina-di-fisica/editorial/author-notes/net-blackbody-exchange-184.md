# net-blackbody-exchange-184 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json, file SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Letti tutti gli 80 prompt originali 183–187 e relative ipotesi tramite allowlist id/prompt/familyId/lawFamily, senza aprire opzioni, chiavi, solutionSteps o hints sorgente. Snapshot SHA256 f5773c7d6a17f9164992df1208b93984ac156633e0eda86e351275431effc573.

Prima della scrittura dei candidati, il revisore A ha confermato la propria primaria source-only degli 80 ID, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Non ne sono stati letti i risultati dall’autore B. Le risoluzioni qui raccolte sono calcoli dell’autore e non una verifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: rilette integralmente C3-L05 «Tre vie per trasferire energia» e C3-L10 «Seguire il verso dei processi», con formule e prerequisiti reali. Le grandezze energetiche richiamano le fondazioni C3 e la potenza C1-L007 dove pertinente.

Si usa esclusivamente assemble_family e la pipeline canonica esistente, course C3/unit u5, ID AR-<sourceId>. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, nessuna pubblicazione. Le unità e la fattibilità manuale sono esplicitate nel cammino, senza presentare coefficienti di modello come costanti sperimentali esatte.

Controlli tecnici: due assembly identici, binding source/candidate/provenance verificati e import canonico in SQLite temporaneo 16→0 con 16 invariati. I 991 pubblicati restano byte identici; zero nuove teste live. Nessun PASS scientifico è dedotto da tali controlli.

UI del prodotto NOT_RUN: resta attivo lo stop dell’integratore sui nuovi replay. La sola lettura dello SVG in XML e rendering completo asset-only serve a controllare la figura e non attribuisce credito browser al prodotto o a un runtime. Nessun report o marker sintetico, nessun ritag di prove precedenti.

Geometria per la review, espressa soltanto qui in coordinate intrinseche SVG e non come pixel CSS: Nel secondo pannello le lunghezze intrinseche 340,2, 4,2 e 336 rappresentano emissione 486 W, assorbimento 6 W e saldo 480 W, dal comune x130 al fattore 7/10 unità SVG/W. Nell’ultimo 120, 360 e 240 rappresentano 480, 1440 e 960 W al fattore 1/4. Gli zeri sono fuori dalle aste. Le due frecce del primo pannello sono esplicitamente schematiche, non proporzionali alle potenze; ogni freccia ha la propria punta.

## 01 — La potenza netta è una differenza

La superficie a 300 K emette K_r·3⁴=6·81=486 W. Dal grande ambiente a 100 K assorbe K_r·1⁴=6 W. Il saldo uscente è 486−6=480 W. L’assorbimento non scompare solo perché la superficie è più calda: si sottrae il suo contributo, positivo ma minore.

Passaggi: `P_{\rm em}=6\cdot81\,\mathrm W\qquad P_{\rm ass}=6\cdot1\,\mathrm W\qquad P_{\rm net}=P_{\rm em}-P_{\rm ass}\qquad P_{\rm net}=480\,\mathrm W`

Distrattori e controllo: 486 W è la sola emissione. 492 W somma i due moduli pur chiedendo il saldo. −480 W cambierebbe il verso positivo scelto e zero richiederebbe temperature uguali nel presente modello.

## 02 — Il saldo resta una potenza

Emissione e assorbimento sono potenze totali riferite alla stessa superficie: sottraendole restano watt. La moltiplicazione per l’area è già inclusa. Il risultato non è una quantità di calore finché non si assegna anche un intervallo di tempo.

Passaggi: `[P_{\rm net}]=[P_{\rm em}]=[P_{\rm ass}]\qquad [P_{\rm net}]=\mathrm W\qquad \mathrm W=\mathrm{J/s}`

Distrattori e controllo: J indica energia, K temperatura, W/m² densità superficiale di potenza e J/K capacità o unità di entropia. Il fatto che A valga numericamente uno non elimina la sua dimensione nella derivazione.

## 03 — Equilibrio radiativo non significa assenza di radiazione

La superficie emette σ*AT⁴ e assorbe lo stesso valore perché l’ambiente è alla medesima temperatura. Ogni potenza è positiva per T>0 e area positiva. Si annulla soltanto la loro differenza. Questo caso di equilibrio è distinto dal ramo T_s>T_a dei confronti con saldo uscente positivo.

Passaggi: `T_s=T_a=T>0\qquad P_{\rm em}=\sigma_*AT^4>0\qquad P_{\rm ass}=\sigma_*AT^4\qquad P_{\rm net}=0`

Distrattori e controllo: Fermare emissione o assorbimento confonde un saldo nullo con due processi nulli. Emettere senza assorbire violerebbe l’interazione con l’ambiente nero. La positività della temperatura rende positiva l’emissione, non necessariamente il saldo.

## 04 — Aumentare la temperatura della sola superficie

A 400 K la superficie emette 6·4⁴=6·256=1536 W. L’ambiente resta a 100 K e fornisce ancora 6 W assorbiti. Il nuovo saldo è 1536−6=1530 W. Non si può applicare al saldo il solo fattore di quarta potenza della temperatura della superficie, perché il termine ambientale resta fisso.

Passaggi: `\theta_{s,B}^4=256\qquad P_{{\rm em},B}=1536\,\mathrm W\qquad P_{{\rm ass},B}=6\,\mathrm W\qquad P_{{\rm net},B}=1530\,\mathrm W`

Distrattori e controllo: 1536 W omette l’assorbimento. 640 W moltiplica linearmente 480 per 4/3; il saldo invariato ignora il riscaldamento e quello negativo contraddice T_s>T_a.

## 05 — La temperatura della superficie dal saldo

Normalizziamo il saldo: p=480/6=80. Poiché p=θ_s⁴−θ_a⁴, si deve aggiungere il termine ambientale: θ_s⁴=80+1=81. La radice quarta positiva è tre e restituisce T_s=300 K, maggiore di T_a=100 K.

Passaggi: `p=480/6=80\qquad \theta_s^4=p+\theta_a^4\qquad \theta_s^4=81\qquad \theta_s=3`

Distrattori e controllo: 81 copia la quarta potenza e nove ne prende solo la radice quadrata. Sottrarre il termine ambientale anziché aggiungerlo non ricostruisce l’emissione richiesta dal saldo; il ramo negativo non è una temperatura assoluta ammessa.

## 06 — La temperatura dell’ambiente dal saldo

La superficie ha θ_s⁴=81. Il saldo normalizzato vale 80, quindi l’assorbimento normalizzato deve essere 81−80=1. Da θ_a⁴=1 segue θ_a=1 nel ramo positivo. L’inversa richiede in generale 0<P_net<K_rθ_s⁴: un ambiente a temperatura positiva assorbe una potenza positiva.

Passaggi: `\theta_a^4=\theta_s^4-p\qquad \theta_a^4=81-80\qquad \theta_a^4=1\qquad \theta_a=1\qquad 0<P_{\rm net}<K_r\theta_s^4`

Distrattori e controllo: Zero attribuirebbe all’ambiente temperatura assoluta nulla, esclusa dal dominio, e darebbe saldo 486 W. Tre renderebbe uguali le temperature e saldo zero. Un radicando negativo indicherebbe dati incompatibili, non un ramo fisico alternativo.

## 07 — Un ambiente più caldo riduce la cessione netta

La superficie emette ancora 486 W. B assorbe 6·2⁴=96 W e cede al netto 390 W. A cedeva 480 W: 390/480 si riduce a 13/16. Aumentare la temperatura dell’ambiente riduce il saldo uscente, pur lasciando invariata l’emissione della superficie.

Passaggi: `P_{{\rm net},A}=480\,\mathrm W\qquad P_{{\rm net},B}=6(81-16)\,\mathrm W\qquad P_{{\rm net},B}=390\,\mathrm W\qquad P_{{\rm net},B}/P_{{\rm net},A}=13/16`

Distrattori e controllo: 16/13 inverte il confronto. Due segue direttamente la temperatura dell’ambiente e un mezzo ne usa il reciproco, ignorando la differenza fra quarte potenze. Uno confonde emissione invariata con saldo invariato.

## 08 — Lo scarto di una proposta doppia

Il saldo corretto è 480 W. La proposta di 960 W è maggiore di altri 480 W, quindi lo scarto ordinato è positivo. Il rapporto due è un’altra grandezza: non misura una differenza di potenza.

Passaggi: `P_{\rm net}=480\,\mathrm W\qquad e=P_{\rm proposto}-P_{\rm net}\qquad e=(960-480)\,\mathrm W\qquad e=480\,\mathrm W`

Distrattori e controllo: −480 W scambia l’ordine, 960 W copia il valore proposto e zero lo accetta. Il numero puro due non ha la dimensione dello scarto richiesto.

## 09 — L’inversa simbolica include il termine ambientale

La legge p=θ_s⁴−θ_a⁴ richiede di spostare il termine sottratto dall’altro lato prima di estrarre la radice. La somma p+θ_a⁴ è positiva e maggiore di θ_a⁴, dunque la radice quarta positiva è automaticamente maggiore di θ_a. Questo controlla sia la realtà sia il verso del saldo.

Passaggi: `\theta_s^4=p+\theta_a^4\qquad \theta_s=\sqrt[4]{p+\theta_a^4}\qquad \theta_s>\theta_a>0`

Distrattori e controllo: Il meno sottrae ancora l’assorbimento anziché ricostruirlo. La radice quadrata produce θ_s²; la radice di una somma non è la somma delle radici. Il segno negativo viola la temperatura assoluta positiva.

## 10 — Due temperature riscalate con ordine fisico conservato

Le due temperature assolute portano separatamente i rispettivi fattori elevati alla quarta. Il saldo B è K_r(κ₁⁴u−κ₂⁴v); quello A è K_r(u−v). K_r si cancella, ma i pesi u e v rimangono. L’ordine imposto in entrambe le prove mantiene positivi numeratore e denominatore.

Passaggi: `p_A=u-v\qquad p_B=\kappa_1^4u-\kappa_2^4v\qquad \frac{P_{{\rm net},B}}{P_{{\rm net},A}}=\frac{\kappa_1^4u-\kappa_2^4v}{u-v}`

Distrattori e controllo: Sottrarre i soli fattori perde le temperature iniziali e darebbe zero con fattori uguali. Il più descrive una somma di moduli, non il saldo; quoziente e prodotto semplici non rappresentano la quarta potenza con due pesi. Con un fattore comune κ il rapporto è κ⁴.

## 11 — Entrambe le temperature cambiano

A ha differenza delle quarte potenze 81−1=80. B ha 256−16=240. Moltiplicando per 6 W si ottengono 480 e 1440 W; il rapporto è 240/80=3. La crescita dell’assorbimento ambientale è inclusa, non ignorata.

Passaggi: `p_A=81-1=80\qquad p_B=256-16=240\qquad P_{{\rm net},B}=1440\,\mathrm W\qquad P_{{\rm net},B}/P_{{\rm net},A}=3`

Distrattori e controllo: Un terzo inverte il rapporto. Sedici segue il solo raddoppio dell’ambiente elevato alla quarta. 81/16 è un rapporto di quarte potenze privo della sottrazione dei rispettivi ambienti; quattro non ricostruisce le due differenze.

## 12 — Media del saldo di due prove

Le potenze nette sono 480 e 1440 W. Sommandole si ottengono 1920 W e la metà è 960 W. Alle temperature normalizzate medie 7/2 e 3/2, il modello darebbe invece 6[(7/2)⁴−(3/2)⁴] W=870 W. Media delle uscite e modello applicato alle medie non coincidono.

Passaggi: `\overline P_{\rm net}=\frac{480+1440}{2}\,\mathrm W\qquad \overline P_{\rm net}=960\,\mathrm W\qquad p_{\rm ingressi\ medi}=\frac{2401-81}{16}\qquad P_{\rm ingressi\ medi}=870\,\mathrm W`

Distrattori e controllo: 870 W usa gli ingressi medi. 1920 W è la somma non dimezzata; 480 e 1440 W ripetono una sola delle due prove. Le temperature restano assegnate per ciascuna prova: non si sta mescolando fisicamente due corpi.

## 13 — Il bersaglio fissa l’ambiente della seconda prova

Il bersaglio è 1440 W e p_B=240. La superficie B ha θ_s,B⁴=256, quindi θ_a,B⁴=256−240=16. La radice quarta positiva è due; il rapporto con θ_a,A=1 è due. La nuova superficie resta più calda dell’ambiente, perché 4>2.

Passaggi: `p_B=1440/6=240\qquad \theta_{a,B}^4=256-240\qquad \theta_{a,B}=2\qquad \theta_{a,B}/\theta_{a,A}=2`

Distrattori e controllo: Un mezzo è il reciproco. Tre copia il fattore del saldo, sedici copia la quarta potenza e quattro la temperatura normalizzata della superficie, che darebbe equilibrio radiativo e saldo nullo.

## 14 — Un display del saldo prima dell’inversa

Il riferimento cede 480 W, quindi q=3 W⁻¹. La nuova lettura significa 1440 W e p_B=240. Con θ_a=2 il termine ambientale vale 16: θ_s⁴=240+16=256 e la radice quarta positiva è quattro.

Passaggi: `q=3\,\mathrm{W^{-1}}\qquad P_{{\rm net},B}=1440\,\mathrm W\qquad \theta_{s,B}^4=240+16\qquad \theta_{s,B}^4=256\qquad \theta_{s,B}=4`

Distrattori e controllo: Sedici estrae solo la radice quadrata di 256. Due copia l’ambiente e annullerebbe il saldo. Il numero 4320 è il display, non una temperatura né una potenza finché non viene diviso per q.

## 15 — L’offset del display precede la sottrazione ambientale

A e B cedono 480 e 1440 W. Il guadagno è (2881−961)/(1440−480)=2 W⁻¹ e b=1. C cede (3061−1)/2=1530 W, quindi p_C=255. Aggiungendo θ_a⁴=1 otteniamo θ_s⁴=256: la temperatura normalizzata è quattro.

Passaggi: `q=2\,\mathrm{W^{-1}}\qquad b=1\qquad P_{{\rm net},C}=1530\,\mathrm W\qquad \theta_{s,C}^4=255+1\qquad \theta_{s,C}=4`

Distrattori e controllo: Tre tornerebbe ai dati A e al display 961. Sedici è la radice quadrata di 256; 256 copia θ_s⁴. Due con ambiente uno darebbe saldo 90 W e S=181, non 3061.

## 16 — Il rapporto termico lascia una quarta potenza positiva

Sostituiamo il vincolo: θ_s⁴−θ_a⁴=(81−1)θ_a⁴=80θ_a⁴. Il saldo è quindi 480 W·θ_a⁴. Il dato 480 W richiede θ_a⁴=1; l’unico ramo con temperatura assoluta positiva è θ_a=1. Ne segue θ_s=3 e l’ordine caldo-freddo è rispettato.

Passaggi: `P_{\rm net}=6(81-1)\theta_a^4\,\mathrm W\qquad P_{\rm net}=480\theta_a^4\,\mathrm W\qquad \theta_a^4=1\qquad \theta_a=1\qquad \theta_s=3`

Distrattori e controllo: −1 è una radice algebrica ma viola T_a>0. Tre copia il valore finale della superficie; ottanta copia il coefficiente della differenza. Il dato di potenza non è ridondante: determina la scala termica positiva rimasta dopo il rapporto.
