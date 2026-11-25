# adiabatic-monatomic-165 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-02.json; SHA256 del file sorgente 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 163–167 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06, L07, L08 e L09. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Una compressione di rapporto otto

Prima estraiamo la radice cubica di otto, che è due; elevandola al quadrato otteniamo quattro. La temperatura finale è quindi quattro volte i cento kelvin iniziali. Nella compressione il gas riceve lavoro: W è negativo e l’energia interna aumenta, in accordo con l’aumento di temperatura senza calore entrante.

Passaggi: `r^{2/3}=(\sqrt[3]{8})^2\qquad r^{2/3}=2^2=4\qquad T_2=100\cdot4\,\mathrm K\qquad T_2=400\,\mathrm K`

Errori e controllo: Ottocento K usa r alla prima potenza; duecento usa soltanto la radice cubica. La reversibilità adiabatica non impone temperatura costante: impone la relazione fra T e V.

## 02 — Il rapporto di volumi non porta unità

I due volumi sono espressi nella stessa unità, perciò il loro rapporto e ogni sua potenza sono numeri puri. Moltiplicare T₁ per r^(2/3) conserva l’unità kelvin. La legge usa temperature assolute: la stessa moltiplicazione non vale per letture Celsius.

Passaggi: `[r]=[V_1]/[V_2]=1\qquad [T_2]=[T_1]=\mathrm K`

Errori e controllo: J esprime energia, Pa pressione e J/K una capacità termica. K² introdurrebbe una potenza della temperatura assente nella legge.

## 03 — Reversibile adiabatica non significa isoterma

Per un’adiabatica reversibile del gas ideale vale TV^(γ−1)=costante. Con γ=5/3, l’esponente è due terzi. Dividendo i due stati di equilibrio, V₁/V₂ diventa r e si ottiene la legge richiesta. L’assenza di calore non annulla il lavoro e dunque non annulla necessariamente ΔU.

Passaggi: `T_1V_1^{\gamma-1}=T_2V_2^{\gamma-1}\qquad \gamma-1=2/3\qquad T_2=T_1(V_1/V_2)^{2/3}\qquad T_2=T_1r^{2/3}`

Errori e controllo: T₂=T₁/r sarebbe la relazione a pressione costante per lo stesso campione ideale; T₂=T₁r non è la legge adiabatica assegnata. T costante sarebbe invece un’isoterma. Cinque terzi è l’esponente della legge pV^γ=costante, non di TV^(γ−1). La legge qui non descrive l’espansione libera irreversibile.

## 04 — Cambiare solo la temperatura iniziale

Il fattore di compressione termica r^(2/3) rimane quattro. Moltiplica cento kelvin nella prima prova e duecento nella seconda: la temperatura finale raddoppia da quattrocento a ottocento kelvin. Non va raddoppiato anche r, che è esplicitamente fisso.

Passaggi: `8^{2/3}=4\qquad T_{2,A}=100\cdot4\,\mathrm K\qquad T_{2,B}=200\cdot4\,\mathrm K\qquad T_{2,B}=800\,\mathrm K`

Errori e controllo: Duecento K confonde il nuovo ingresso con l’uscita. Milleseicento quadrerebbe un raddoppio lineare; seicento non applica il fattore quattro al nuovo ingresso: 200 K per quattro danno 800 K.

## 05 — La temperatura prima della compressione

Il processo moltiplica la temperatura per quattro. Per tornare all’ingresso dividiamo la finale per quattro: quattrocento su quattro dà cento kelvin. Tutte le temperature restano positive e la compressione le aumenta nel verso corretto.

Passaggi: `T_1=T_2/r^{2/3}\qquad r^{2/3}=4\qquad T_1=400/4\,\mathrm K\qquad T_1=100\,\mathrm K`

Errori e controllo: Moltiplicare ancora per quattro darebbe 1600 K e ricostruirebbe una finale di 6400 K. Dividere per otto darebbe 50 K e ometterebbe l’esponente termico corretto.

## 06 — Il rapporto di volumi dalla temperatura

Il rapporto delle temperature è quattro. Per annullare la potenza due terzi eleviamo alla potenza tre mezzi: la radice quadrata positiva di quattro è due, e il suo cubo è otto. r è positivo perché è un rapporto di volumi positivi; non c’è un secondo ramo negativo da conservare.

Passaggi: `r^{2/3}=T_2/T_1=4\qquad r=(T_2/T_1)^{3/2}\qquad r=(\sqrt4)^3\qquad r=8`

Errori e controllo: Quattro è il rapporto termico, non quello volumico. Sedici ne prende il quadrato, due si ferma alla radice. Un valore negativo non rappresenta volumi del modello.

## 07 — Da otto a ventisette

Otto ha radice cubica due e dà un fattore termico quattro; ventisette ha radice cubica tre e dà nove. Le temperature finali sono 400 K e 900 K. Il rapporto richiesto è nove quarti; la temperatura iniziale comune si cancella.

Passaggi: `8^{2/3}=4\qquad 27^{2/3}=9\qquad T_{2,A}=400\,\mathrm K\qquad T_{2,B}=900\,\mathrm K\qquad T_{2,B}/T_{2,A}=9/4`

Errori e controllo: 27/8 conserva il rapporto dei volumi senza l’esponente. Tre mezzi considera solo le radici cubiche; quattro noni scambia B e A. Nove è il solo fattore di B, non il confronto con A.

## 08 — Uno scarto positivo in kelvin

La temperatura finale corretta è quattrocento kelvin. La proposta è più alta di quattrocento kelvin, quindi lo scarto ha segno positivo. È una differenza di temperature, non un nuovo valore assoluto a cui aggiungere un offset Celsius.

Passaggi: `T_2=400\,\mathrm K\qquad e=T_{2,\rm proposto}-T_2\qquad e=(800-400)\,\mathrm K\qquad e=400\,\mathrm K`

Errori e controllo: Meno quattrocento inverte la sottrazione. Ottocento ripete la proposta, zero la accetta e duecento non coincide con la differenza assegnata.

## 09 — Isolare la temperatura iniziale

r>0 rende positivo e non nullo il fattore r^(2/3). Dividiamo per esso i due membri della legge: resta T₁. Per una compressione r>1 la finale viene divisa per un numero maggiore di uno, ricostruendo una temperatura iniziale minore.

Passaggi: `T_2=T_1r^{2/3}\qquad T_1=\frac{T_2}{r^{2/3}}\qquad [T_1]=\mathrm K`

Errori e controllo: Moltiplicare applica di nuovo la trasformazione invece di invertirla. Dividere per r o per r^(3/2) cambia la legge: tre mezzi serve a isolare r, non T₁. L’ultima formula ha unità K⁻¹.

## 10 — Due variazioni con esponenti diversi

Il primo fattore moltiplica direttamente T₁. Il secondo entra invece nella potenza del rapporto volumico. Per quantità positive la potenza del prodotto si separa: dopo aver cancellato T₁,A e r_A^(2/3), rimane κ₁κ₂^(2/3). Questo vale anche quando una prova è un’espansione, purché i rapporti rimangano positivi.

Passaggi: `T_{2,B}=\kappa_1T_{1,A}(\kappa_2r_A)^{2/3}\qquad \frac{T_{2,B}}{T_{2,A}}=\kappa_1\kappa_2^{2/3}`

Errori e controllo: κ₁κ₂ ignora l’esponente; il quoziente rende inversa una dipendenza crescente. La formula con κ₁^(2/3) scambia i ruoli degli ingressi. La somma darebbe due per prove identiche, anziché uno.

## 11 — Preparazioni diverse e compressioni diverse

A termina a quattrocento kelvin. B parte da duecento kelvin e li moltiplica per nove, terminando a 1800 K. Il quoziente è 1800/400=18/4=9/2. Si ottiene anche moltiplicando il raddoppio di T₁ per il fattore termico nove quarti.

Passaggi: `T_{2,A}=100\cdot4\,\mathrm K\qquad T_{2,B}=200\cdot9\,\mathrm K\qquad T_{2,B}/T_{2,A}=1800/400\qquad T_{2,B}/T_{2,A}=9/2`

Errori e controllo: Nove quarti considera solo la variazione di r e due solo T₁. 27/4 usa l’esponente sbagliato sul rapporto dei volumi; due noni inverte il confronto.

## 12 — Media delle temperature finali

Le due letture finali sono 400 K e 1800 K. La somma è 2200 K e la metà 1100 K. I due ingressi medi descriverebbero invece una terza adiabatica, con T₁=150 K e r=35/2: non sostituiscono la media richiesta. Non occorre estrarre la radice cubica di quel rapporto per risolvere questo compito.

Passaggi: `T_{2,A}=400\,\mathrm K\qquad T_{2,B}=1800\,\mathrm K\qquad \overline T_2=\frac{400+1800}{2}\,\mathrm K\qquad \overline T_2=1100\,\mathrm K`

Errori e controllo: 2200 K è la somma e 550 K divide due volte per due. 700 K è metà della differenza, non la media; 900 K considera soltanto il fattore nove applicato all’ingresso di A.

## 13 — Il rapporto volumico per un bersaglio termico

Il riferimento finisce a 400 K e il bersaglio è 1800 K. Con ingresso 200 K, B richiede r_B^(2/3)=9. La radice quadrata di nove è tre; il cubo di tre dà r_B=27. Confrontando con otto troviamo 27/8.

Passaggi: `T_{2,B}=1800\,\mathrm K\qquad r_B^{2/3}=1800/200=9\qquad r_B=(\sqrt9)^3=27\qquad r_B/r_A=27/8`

Errori e controllo: Nove è il fattore termico, non r_B né il rapporto r_B/r_A. Tre mezzi si ferma al confronto delle radici cubiche. Il rapporto delle temperature finali non è quello volumico perché cambia anche T₁.

## 14 — Il display va convertito in kelvin

A termina a 400 K, perciò q=1200/(400 K)=3 K⁻¹. La lettura 5400 corrisponde a 1800 K. Il rapporto volumico 27 moltiplica T₁ per nove: dividendo 1800 per nove si ottengono 200 K.

Passaggi: `T_{2,A}=400\,\mathrm K\qquad q=3\,\mathrm{K^{-1}}\qquad T_{2,B}=5400/q\qquad T_{2,B}=1800\,\mathrm K\qquad T_{1,B}=1800/9\,\mathrm K\qquad T_{1,B}=200\,\mathrm K`

Errori e controllo: Usare 5400 direttamente come kelvin darebbe T₁=600 K. Dividere per 27 invece che per nove darebbe 200/3 K e non ricostruirebbe la lettura con la legge adiabatica.

## 15 — Una taratura con zero spostato

Le finali di riferimento sono 400 K e 1800 K. La differenza 2800 delle letture su 1400 K fissa q=2 K⁻¹; da A ricaviamo b=1. La finale C è (1601−1)/2=800 K. Con r=8 il fattore è quattro, quindi l’iniziale è 200 K.

Passaggi: `q=\frac{3601-801}{(1800-400)\,\mathrm K}\qquad q=2\,\mathrm{K^{-1}}\qquad b=1\qquad T_{2,C}=800\,\mathrm K\qquad T_{1,C}=800/4\,\mathrm K\qquad T_{1,C}=200\,\mathrm K`

Errori e controllo: 400 K e 100 K darebbero rispettivamente S=3201 e S=801. 1601/8 K dimentica l’offset e ricostruisce S=1602. 800 K si ferma alla finale, prima dell’inversa per T₁.

## 16 — Un vincolo fra stati iniziali preparati

Sostituendo il vincolo, T₂=d r^(5/3). Il quoziente 400 K su 25/2 K è 32. Poniamo z uguale alla radice cubica positiva di r: l’equazione diventa z⁵=32=2⁵. La funzione quinta potenza è crescente e dà z=2, quindi r=8; il vincolo restituisce T₁=100 K e la legge produce 400 K.

Passaggi: `T_2=dr^{5/3}\qquad r^{5/3}=400/(25/2)=32\qquad z=\sqrt[3]r>0\qquad z^5=2^5\qquad z=2\qquad r=z^3=8`

Errori e controllo: Meno otto viola i volumi positivi. Quattro non soddisfa r^(5/3)=32; trentadue confonde la potenza con la sua base. Due è z, non r. L’unica soluzione positiva è verificata anche dai dati iniziali ricostruiti.
