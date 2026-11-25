# parallel-heat-losses-185 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json, file SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Letti tutti gli 80 prompt originali 183–187 e relative ipotesi tramite allowlist id/prompt/familyId/lawFamily, senza aprire opzioni, chiavi, solutionSteps o hints sorgente. Snapshot SHA256 f5773c7d6a17f9164992df1208b93984ac156633e0eda86e351275431effc573.

Prima della scrittura dei candidati, il revisore A ha confermato la propria primaria source-only degli 80 ID, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Non ne sono stati letti i risultati dall’autore B. Le risoluzioni qui raccolte sono calcoli dell’autore e non una verifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: rilette integralmente C3-L05 «Tre vie per trasferire energia» e C3-L10 «Seguire il verso dei processi», con formule e prerequisiti reali. Le grandezze energetiche richiamano le fondazioni C3 e la potenza C1-L007 dove pertinente.

Si usa esclusivamente assemble_family e la pipeline canonica esistente, course C3/unit u5, ID AR-<sourceId>. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, nessuna pubblicazione. Le unità e la fattibilità manuale sono esplicitate nel cammino, senza presentare coefficienti di modello come costanti sperimentali esatte.

Controlli tecnici: due assembly identici, binding source/candidate/provenance verificati e import canonico in SQLite temporaneo 16→0 con 16 invariati. I 991 pubblicati restano byte identici; zero nuove teste live. Nessun PASS scientifico è dedotto da tali controlli.

UI del prodotto NOT_RUN: resta attivo lo stop dell’integratore sui nuovi replay. Lo SVG è stato letto in XML. Il rendering completo asset-only è stato letto; non attribuisce credito browser al prodotto o a un runtime. Nessun report o marker sintetico, nessun ritag di prove precedenti.

Geometria per la review, espressa soltanto qui in coordinate intrinseche SVG e non come pixel CSS: Nel pannello dei contributi, i due segmenti lunghi 175 unità intrinseche rappresentano 50 W ciascuno; la loro somma è lunga 350 per 100 W, con origine x145 e fattore 7/2 unità SVG/W. Nell’ultimo le lunghezze 120, 360 e 240 rappresentano 100, 300 e 200 W al fattore 6/5. Zeri separati dalle aste e frecce schematiche con punte distinte. Il PNG era stato prodotto prima dello stop ENOSPC ed è stato riletto senza un nuovo browser dopo la ripresa.

## 01 — Sommo due potenze, non due temperature

Il sostegno cede GΔT=5·10=50 W. La superficie distinta cede hAΔT=5·1·10=50 W. I due percorsi funzionano contemporaneamente fra gli stessi punti termici: la somma è 100 W. Non sono due strati successivi che la stessa energia deve attraversare uno dopo l’altro.

Passaggi: `P_{\rm sost}=G\Delta T=50\,\mathrm W\qquad P_{\rm conv}=hA\Delta T=50\,\mathrm W\qquad P=P_{\rm sost}+P_{\rm conv}\qquad P=100\,\mathrm W`

Distrattori e controllo: 50 W omette un percorso. 25 W tratterebbe come in serie due resistenze da 1/5 K/W, cambiando lo schema fisico. Il prodotto dei due numeri 50 non è una somma di potenze e avrebbe unità W².

## 02 — Le dispersioni simultanee hanno unità di potenza

Si chiede quanta energia viene ceduta per unità di tempo. Ogni termine GΔT oppure hAΔT è in watt, così anche il totale. La conduttanza e il coefficiente convettivo sono parametri che devono ancora essere moltiplicati per un intervallo termico, e per l’area nel secondo caso.

Passaggi: `[G\Delta T]=\mathrm{W/K}\cdot\mathrm K\qquad [hA\Delta T]=\mathrm{W/(m^2K)}\cdot\mathrm{m^2K}\qquad [P]=\mathrm W`

Distrattori e controllo: J è energia, W/K conduttanza, W/(m² K) coefficiente convettivo e K intervallo termico. G e h non si sommano direttamente perché hanno unità diverse.

## 03 — Una differenza comune per due collegamenti

In regime assegnato, il sostegno e la superficie hanno la stessa differenza ΔT. Sommando GΔT e hAΔT si può raccogliere ΔT: la conduttanza totale è G+hA. Il prodotto hA ha unità W/K come G, quindi la somma è fisicamente lecita. Non si sommano le resistenze dei due rami.

Passaggi: `P=G\Delta T+hA\Delta T\qquad P=(G+hA)\Delta T\qquad p=(5+u)x`

Distrattori e controllo: G+h mescola W/K e W/(m² K). GhAΔT ha W²/K. ΔT/(G+hA) ha K²/W, mentre (G+hA)/ΔT ha W/K²: nessuna delle ultime tre espressioni è una potenza.

## 04 — Raddoppiare il salto termico in entrambi i rami

La conduttanza totale resta 5+5·1=10 W/K. A 10 K cede 100 W; a 20 K cede 200 W. Entrambi i rami raddoppiano il proprio contributo, da 50 a 100 W, senza modificare G, h o A.

Passaggi: `G+hA=10\,\mathrm{W/K}\qquad P_A=100\,\mathrm W\qquad P_B=(10\,\mathrm{W/K})(20\,\mathrm K)\qquad P_B=200\,\mathrm W`

Distrattori e controllo: 50 W rende inversa la dipendenza dal salto; 400 W ne usa il quadrato. 150 W raddoppia un solo contributo pur cambiando ΔT comune a entrambi. Il valore invariato non rispetta nessuno dei due rami.

## 05 — L’intervallo dal totale disperso

Sommiamo prima le conduttanze: G+hA=10 W/K. Dividendo la potenza totale per questo valore troviamo 100/(10 W/K)=10 K. È una differenza fra corpo e ambiente; la temperatura assoluta di nessuno dei due è determinata da questo solo dato.

Passaggi: `\Delta T=\frac{P}{G+hA}\qquad \Delta T=\frac{100\,\mathrm W}{10\,\mathrm{W/K}}\qquad \Delta T=10\,\mathrm K`

Distrattori e controllo: 20 K usa solo G e ignora la superficie convettiva. 100 K copia il numero della potenza. Prendere il reciproco della conduttanza totale è utile per una resistenza equivalente, ma occorre poi moltiplicarlo per P.

## 06 — Il coefficiente della superficie dal totale

Dal totale per kelvin ricaviamo G+hA=P/ΔT=10 W/K. Il sostegno ne fornisce già 5 W/K; alla superficie restano altri 5 W/K. Dividendo per A=1 m² si ottiene h=5 W/(m² K). In generale serve P>GΔT per mantenere h positivo.

Passaggi: `hA=\frac{P}{\Delta T}-G\qquad h=\frac{P/\Delta T-G}{A}\qquad h=5\,\mathrm{W/(m^2K)}\qquad P>G\Delta T`

Distrattori e controllo: 10 W/(m² K) attribuisce alla superficie anche la dispersione del sostegno. 15 aggiunge G invece di sottrarla. Un risultato nullo o negativo segnalerebbe dati fuori dal ramo h>0 dichiarato.

## 07 — Aumentare soltanto la dispersione convettiva

Il sostegno cede 50 W in entrambe le prove. La superficie passa da 50 a 100 W: il totale B è 150 W contro 100 W in A. Il rapporto è 150/100=3/2. Raddoppiare h non raddoppia il contributo fisso del sostegno.

Passaggi: `P_A=50\,\mathrm W+50\,\mathrm W\qquad P_B=50\,\mathrm W+100\,\mathrm W\qquad P_B=150\,\mathrm W\qquad P_B/P_A=3/2`

Distrattori e controllo: Due seguirebbe il solo ramo convettivo. Due terzi inverte il totale; un mezzo nega la maggiore cessione e uno ignora h nuova.

## 08 — Lo scarto di un totale sovrastimato

La potenza corretta è la somma 50+50=100 W. La proposta 200 W la supera di altri 100 W, quindi lo scarto richiesto è positivo. Il numero due misura invece il rapporto proposta/corretta e non una differenza in watt.

Passaggi: `P=100\,\mathrm W\qquad e=P_{\rm proposto}-P\qquad e=(200-100)\,\mathrm W\qquad e=100\,\mathrm W`

Distrattori e controllo: −100 W cambia il verso della sottrazione, 200 W copia la proposta, zero la accetta e due è una quantità pura diversa.

## 09 — Isolare il salto termico con tutte le conduttanze

Nel totale P=(G+hA)ΔT la quantità che moltiplica ΔT è la conduttanza equivalente dei percorsi paralleli. Dividendo per la somma positiva si ottiene un intervallo positivo. Watt diviso watt per kelvin dà kelvin: l’inversa non determina separatamente la temperatura del corpo o quella ambiente.

Passaggi: `P=(G+hA)\Delta T\qquad \Delta T=\frac{P}{G+hA}\qquad [\Delta T]=\frac{\mathrm W}{\mathrm{W/K}}=\mathrm K`

Distrattori e controllo: P/G e P/(hA) eliminano un ramo e sovrastimano l’intervallo. Il rapporto inverso ha K⁻¹. P/(GhA) ha K²/W perché moltiplica due conduttanze anziché sommarle.

## 10 — Fattori diversi per salto e coefficiente

Il salto comune porta un fattore κ₁, ma dentro la conduttanza totale cambia solo hA. Il termine G non viene riscalato. Sostituendo i nuovi ingressi e dividendo per P_A rimane κ₁(G+κ₂hA)/(G+hA). Se κ₂=1 il rapporto si riduce correttamente a κ₁.

Passaggi: `P_A=(G+hA)\Delta T_A\qquad P_B=(G+\kappa_2hA)\kappa_1\Delta T_A\qquad \frac{P_B}{P_A}=\kappa_1\frac{G+\kappa_2hA}{G+hA}`

Distrattori e controllo: κ₁κ₂ tratta anche G come variabile. Il quoziente rende inverso h; omettere κ₁ perde il cambiamento del salto. L’ultima formula inverte il confronto fra le due conduttanze totali.

## 11 — Cambiano entrambi gli ingressi

A ha conduttanza totale 10 W/K e cede 100 W. B ha 5+10=15 W/K e, con 20 K, cede 300 W. Il rapporto è tre: un fattore due dal salto e un fattore 3/2 dalla conduttanza totale.

Passaggi: `P_A=100\,\mathrm W\qquad P_B=(15\,\mathrm{W/K})(20\,\mathrm K)\qquad P_B=300\,\mathrm W\qquad P_B/P_A=3`

Distrattori e controllo: Quattro moltiplica i due raddoppi come se tutto il coefficiente cambiasse con h. Due segue solo ΔT e 3/2 solo la conduttanza; un terzo inverte il confronto.

## 12 — La media delle dispersioni non coincide con quella dei dati

Le due uscite sono 100 e 300 W. La loro media è 400/2=200 W. Usando prima gli ingressi medi ΔT=15 K e h=15/2 W/(m² K), la conduttanza sarebbe 25/2 W/K e la potenza 375/2 W. La parte GΔT è lineare, ma il prodotto hΔT non conserva in generale la media dei due ingressi.

Passaggi: `\overline P=\frac{100+300}{2}\,\mathrm W\qquad \overline P=200\,\mathrm W\qquad P_{\rm ingressi\ medi}=\frac{25}{2}\cdot15\,\mathrm W\qquad P_{\rm ingressi\ medi}=375/2\,\mathrm W`

Distrattori e controllo: 375/2 W usa i dati medi. 400 W omette la metà; 100 e 300 W ripetono una sola prova. La media statistica non è un nuovo corpo con temperature miscelate.

## 13 — Il coefficiente necessario per il bersaglio

Il bersaglio è 300 W. A salto 20 K occorre una conduttanza totale 300/20=15 W/K. Il sostegno fornisce 5 W/K: alla superficie ne servono 10 W/K e quindi h_B=10 W/(m² K). Il rapporto con h_A=5 è due.

Passaggi: `P_B=300\,\mathrm W\qquad G+h_BA=15\,\mathrm{W/K}\qquad h_B=10\,\mathrm{W/(m^2K)}\qquad h_B/h_A=2`

Distrattori e controllo: Tre copia il fattore di potenza e 3/2 quello della conduttanza totale. Un mezzo è il reciproco di h_B/h_A. Quattro moltiplica fattori che nella legge non agiscono su tutto il coefficiente.

## 14 — Dal display al salto termico

Il riferimento cede 100 W, quindi q=3 W⁻¹. Il display B indica 300 W. Con h_B=10, la conduttanza complessiva è 15 W/K: l’intervallo richiesto è 300/15=20 K. La taratura del display non cambia la somma fisica dei due rami.

Passaggi: `q=3\,\mathrm{W^{-1}}\qquad P_B=300\,\mathrm W\qquad G+h_BA=15\,\mathrm{W/K}\qquad \Delta T_B=20\,\mathrm K`

Distrattori e controllo: 60 K usa 900 come watt senza taratura. 30 K mantiene la vecchia conduttanza totale 10 W/K; 300 K copia il numero della potenza come intervallo.

## 15 — Guadagno e offset prima dell’inversa

Le potenze A e B sono 100 e 300 W. Il guadagno è (601−201)/(300−100)=2 W⁻¹ e b=1. C cede (401−1)/2=200 W. Con h=5 la conduttanza complessiva è 10 W/K, quindi ΔT_C=20 K.

Passaggi: `q=2\,\mathrm{W^{-1}}\qquad b=1\qquad P_C=200\,\mathrm W\qquad \Delta T_C=\frac{200\,\mathrm W}{10\,\mathrm{W/K}}\qquad \Delta T_C=20\,\mathrm K`

Distrattori e controllo: 401/20 K omette b. 10 K torna al riferimento A e al display 201. 40 K sottrae b ma non divide per q; 200 K copia i watt senza dividere per la conduttanza.

## 16 — Un vincolo fra preparazioni dà due radici algebriche

Nella relazione p=(5+u)x sostituiamo x=2u e p=100. Si ottiene 2u²+10u=100, ossia u²+5u−50=0. Il prodotto si fattorizza in (u−5)(u+10): le radici sono 5 e −10. Solo u=5 dà h>0 e, dal vincolo, ΔT=10 K>0. Il vincolo riguarda prove diverse con coefficienti costanti al loro interno.

Passaggi: `100=2u(5+u)\qquad u^2+5u-50=0\qquad (u-5)(u+10)=0\qquad u=5\qquad h=5\,\mathrm{W/(m^2K)}`

Distrattori e controllo: −10 viola sia h>0 sia il salto positivo imposto dal vincolo. Dieci non soddisfa la quadratica; cinquanta copia il termine noto senza risolverla. Il dato di potenza fissa la scala e non lascia infinite soluzioni.
