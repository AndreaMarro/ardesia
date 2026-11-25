# emitted-blackbody-power-183 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json, file SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Letti tutti gli 80 prompt originali 183–187 e relative ipotesi tramite allowlist id/prompt/familyId/lawFamily, senza aprire opzioni, chiavi, solutionSteps o hints sorgente. Snapshot SHA256 f5773c7d6a17f9164992df1208b93984ac156633e0eda86e351275431effc573.

Prima della scrittura dei candidati, il revisore A ha confermato la propria primaria source-only degli 80 ID, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Non ne sono stati letti i risultati dall’autore B. Le risoluzioni qui raccolte sono calcoli dell’autore e non una verifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: rilette integralmente C3-L05 «Tre vie per trasferire energia» e C3-L10 «Seguire il verso dei processi», con formule e prerequisiti reali. Le grandezze energetiche richiamano le fondazioni C3 e la potenza C1-L007 dove pertinente.

Si usa esclusivamente assemble_family e la pipeline canonica esistente, course C3/unit u5, ID AR-<sourceId>. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, nessuna pubblicazione. Le unità e la fattibilità manuale sono esplicitate nel cammino, senza presentare coefficienti di modello come costanti sperimentali esatte.

Controlli tecnici: due assembly identici, binding source/candidate/provenance verificati e import canonico in SQLite temporaneo 16→0 con 16 invariati. I 991 pubblicati restano byte identici; zero nuove teste live. Nessun PASS scientifico è dedotto da tali controlli.

UI del prodotto NOT_RUN: resta attivo lo stop dell’integratore sui nuovi replay. La sola lettura dello SVG in XML e rendering completo asset-only serve a controllare la figura e non attribuisce credito browser al prodotto o a un runtime. Nessun report o marker sintetico, nessun ritag di prove precedenti.

Geometria per la review, espressa soltanto qui in coordinate intrinseche SVG e non come pixel CSS: Nel secondo pannello le lunghezze intrinseche 4,5, 72 e 364,5 rappresentano 3, 48 e 243 mW, con origine x130 e fattore comune 1,5 unità SVG/mW. Nell’ultimo le lunghezze 36, 364,5 e 200,25 rappresentano 48, 486 e 267 mW al fattore 3/4. Gli zeri sono separati dalle aste. Nessuna indicazione di pixel compare nei testi del prodotto.

## 01 — Prima converto l’area, poi elevo la temperatura

θ=2 significa 200 K assoluti. Cinque centimetri quadrati sono 5·10⁻⁴ m²: il fattore cento della lunghezza viene elevato al quadrato. Inseriamo i dati nella legge. Le potenze di dieci danno 10⁻⁸·10⁻⁴·10⁸=10⁻⁴ e i numeri 6·5·16=480. La potenza è 480·10⁻⁴ W=48·10⁻³ W, cioè 48 mW.

Passaggi: `A=5\cdot10^{-4}\,\mathrm{m^2}\qquad T=2\cdot100\,\mathrm K\qquad P_{\rm em}=\sigma_*AT^4\qquad P_{\rm em}=\frac{48}{1000}\,\mathrm W\qquad P_{\rm em}=48\,\mathrm{mW}`

Distrattori e controllo: Tre mW omette θ⁴. Novantasei raddoppia senza motivo il risultato. Usare 5 m² al posto di 5 cm² sovrastima l’area di diecimila volte. La temperatura va espressa in kelvin: una quarta potenza di una lettura Celsius non descrive questa legge.

## 02 — Una potenza, anche quando è piccola

Il prefisso milli significa un millesimo: un milliwatt è 10⁻³ W e ha dimensione di energia per tempo. La grandezza chiesta è una potenza totale, già moltiplicata per l’area, non una potenza per unità di superficie.

Passaggi: `[P_{\rm em}]=\mathrm W\qquad 1\,\mathrm{mW}=10^{-3}\,\mathrm W\qquad \mathrm W=\mathrm{J/s}`

Distrattori e controllo: mJ misura energia, K temperatura, W/m² potenza per area e J/K capacità termica o unità di entropia. Un prefisso non converte un’energia in una potenza.

## 03 — La legge nelle unità normalizzate dichiarate

Un centimetro quadrato vale 10⁻⁴ m² e (100 K)⁴ porta un fattore 10⁸ K⁴. Con σ* resta 6·10⁻⁴ W per ogni aθ⁴, cioè 3/5 mW. Dividendo per 1 mW otteniamo la relazione adimensionale. La dipendenza è lineare nell’area e di quarto grado nella temperatura assoluta.

Passaggi: `A=a\cdot10^{-4}\,\mathrm{m^2}\qquad T=100\theta\,\mathrm K\qquad P_{\rm em}=\frac35a\theta^4\,\mathrm{mW}\qquad p=\frac35a\theta^4`

Distrattori e controllo: θ² sostituisce un’altra legge alla quarta potenza. Dividere per a renderebbe minore l’emissione di una superficie maggiore alla stessa T. a⁴ scambia i ruoli degli ingressi; l’ultima alternativa perde il coefficiente delle conversioni.

## 04 — Una temperatura assoluta moltiplicata per tre mezzi

Per a=5 il coefficiente (3/5)a è tre. Prima θ⁴=2⁴=16, poi 3⁴=81. Le potenze sono quindi 3·16=48 e 3·81=243 mW. Il rapporto è 81/16: il fattore sulla temperatura assoluta va elevato alla quarta, non applicato direttamente alla potenza.

Passaggi: `p_A=3\cdot2^4=48\qquad p_B=3\cdot3^4=243\qquad P_{{\rm em},B}=243\,\mathrm{mW}\qquad p_B/p_A=81/16`

Distrattori e controllo: 72 mW usa soltanto il fattore 3/2. 108 mW ne usa il quadrato; 96 raddoppia pur avendo temperature nel rapporto 3/2. Il valore invariato ignora il riscaldamento assoluto.

## 05 — La radice quarta ha un solo ramo termico

La relazione normalizzata è 48=3θ⁴, perché a=5. Dividendo per tre otteniamo θ⁴=16. Poiché 2²=4 e 4²=16, il ramo positivo è θ=2. La temperatura corrispondente è 200 K. La radice reale negativa risolverebbe la potenza algebrica ma violerebbe T>0.

Passaggi: `\theta^4=48/3\qquad \theta^4=16\qquad \theta=\sqrt[4]{16}\qquad \theta=2\qquad T=200\,\mathrm K`

Distrattori e controllo: Quattro è la radice quadrata di 16, non quella quarta. Sedici copia θ⁴ e meno due viola il dominio delle temperature assolute. Non si cerca una lettura di 2 °C.

## 06 — Ricostruire l’area dalla potenza

Isoliamo a=5p/(3θ⁴). Con p=48 e θ⁴=16, il denominatore è 48: a=5·48/48=5. Moltiplicando per 1 cm² torniamo all’area fisica. La positività dei dati rende lecita la divisione.

Passaggi: `a=\frac{5p}{3\theta^4}\qquad a=\frac{5\cdot48}{3\cdot16}\qquad a=5\qquad A=5\,\mathrm{cm^2}`

Distrattori e controllo: 48 cm² copia il numero della potenza. Usare θ invece di θ⁴ porterebbe a 40 cm²: l’errore modifica la legge, non la conversione del prefisso. Un’area negativa non può emettere la potenza positiva del modello.

## 07 — Due superfici alla stessa temperatura

Ogni unità di superficie alla stessa temperatura emette la stessa potenza. A emette 48 mW; B, con a=10, emette (3/5)·10·16=96 mW. Il rapporto 96/48 è due: la quarta potenza riguarda T, non A.

Passaggi: `P_{{\rm em},A}=48\,\mathrm{mW}\qquad P_{{\rm em},B}=96\,\mathrm{mW}\qquad \frac{P_{{\rm em},B}}{P_{{\rm em},A}}=2`

Distrattori e controllo: Un mezzo è il reciproco; quattro e sedici assegnano all’area un quadrato o una quarta potenza assenti. Uno ignora la superficie aggiunta.

## 08 — Una sovrastima da misurare con segno

Il valore corretto è 48 mW. La proposta di 96 mW lo supera di 48 mW. L’errore richiesto è una differenza fra potenze; il rapporto due descrive invece quante volte è grande la proposta e non ha l’unità richiesta.

Passaggi: `P_{\rm em}=48\,\mathrm{mW}\qquad e=P_{\rm proposto}-P_{\rm em}\qquad e=(96-48)\,\mathrm{mW}\qquad e=48\,\mathrm{mW}`

Distrattori e controllo: −48 mW cambia l’ordine della sottrazione. 96 mW copia la proposta, zero la accetta e due risponde con un rapporto invece che con uno scarto.

## 09 — Isolare θ mantenendo la quarta potenza

Dividiamo p=(3/5)aθ⁴ per il coefficiente positivo (3/5)a. Il quoziente dà θ⁴, non θ. Si prende quindi la radice quarta positiva. θ è adimensionale e restituisce poi T=100 K·θ; la stessa procedura si può scrivere direttamente come T=[P_em/(σ*A)]^(1/4) in unità SI.

Passaggi: `\theta^4=\frac{5p}{3a}\qquad \theta=\sqrt[4]{\frac{5p}{3a}}\qquad T=(100\,\mathrm K)\theta`

Distrattori e controllo: La radice quadrata lascia ancora θ². Non estrarre alcuna radice copia θ⁴; invertire il quoziente dà il reciproco della temperatura normalizzata. Il segno meno è incompatibile con T>0.

## 10 — Il fattore di area si moltiplica per quello termico

Sostituendo entrambi i nuovi ingressi, la temperatura porta κ₁⁴ mentre l’area porta κ₂ una sola volta. Il coefficiente assegnato e le unità normalizzate sono gli stessi in entrambe le prove e si cancellano nel rapporto.

Passaggi: `p_B=\frac35(\kappa_2a_A)(\kappa_1\theta_A)^4\qquad p_B=\kappa_1^4\kappa_2p_A\qquad p_B/p_A=\kappa_1^4\kappa_2`

Distrattori e controllo: κ₁κ₂ e κ₁²κ₂ perdono due o tre fattori di temperatura. Dividere per κ₂ rende inversa la dipendenza dall’area; κ₂⁴κ₁ scambia area e temperatura.

## 11 — Temperatura e area cambiano insieme

A emette 48 mW. Per B, (3/5)·10=6 e θ⁴=81, quindi la potenza è 486 mW. Dividiamo per 48: 486/48 si riduce a 81/8. Il risultato combina il fattore due dell’area con 81/16 della temperatura.

Passaggi: `P_{{\rm em},A}=48\,\mathrm{mW}\qquad P_{{\rm em},B}=486\,\mathrm{mW}\qquad \frac{P_{{\rm em},B}}{P_{{\rm em},A}}=\frac{486}{48}\qquad \frac{P_{{\rm em},B}}{P_{{\rm em},A}}=81/8`

Distrattori e controllo: 81/16 considera soltanto la temperatura; due soltanto l’area. Tre usa linearmente il fattore 3/2 insieme al due. 8/81 è il reciproco del confronto richiesto.

## 12 — La media delle potenze è un’altra operazione

Le potenze sono 48 e 486 mW. La somma è 534 mW e la metà 267 mW. Gli ingressi medi θ=5/2 e a=15/2 darebbero invece (3/5)(15/2)(5/2)⁴=5625/32 mW. Una quarta potenza e il prodotto con un’area variabile non conservano in generale la media degli ingressi.

Passaggi: `\overline P_{\rm em}=\frac{48+486}{2}\,\mathrm{mW}\qquad \overline P_{\rm em}=267\,\mathrm{mW}\qquad p_{\rm ingressi\ medi}=\frac35\frac{15}{2}\left(\frac52\right)^4\qquad p_{\rm ingressi\ medi}=5625/32`

Distrattori e controllo: 5625/32 mW applica il modello ai parametri medi. 534 mW omette la metà; 219 mW è metà della differenza. 243 mW usa la temperatura B ma mantiene l’area A: è una terza prova.

## 13 — Scegliere l’area per il bersaglio di emissione

Il bersaglio è (81/8)·48=486 mW. A θ=3 si ha p=(243/5)a: per ottenere p=486 servono a=486·5/243=10. L’area B è 10 cm² e il rapporto con 5 cm² iniziali è due.

Passaggi: `P_{{\rm em},B}=486\,\mathrm{mW}\qquad a_B=\frac{5\cdot486}{3\cdot81}\qquad a_B=10\qquad A_B/A_A=2`

Distrattori e controllo: 81/8 è il rapporto delle potenze, 81/16 quello dovuto alla sola temperatura e 3/2 il rapporto delle temperature assolute. Un mezzo inverte il rapporto delle aree.

## 14 — Decodificare il display prima della radice

Il riferimento emette 48 mW, quindi q=144/(48 mW)=3 mW⁻¹. La nuova lettura significa 1458/3=486 mW. Con a=10, p=6θ⁴: θ⁴=486/6=81 e la radice quarta positiva è tre. T_B è dunque 300 K.

Passaggi: `q=3\,\mathrm{mW^{-1}}\qquad P_{{\rm em},B}=486\,\mathrm{mW}\qquad \theta_B^4=486/6\qquad \theta_B^4=81\qquad \theta_B=3`

Distrattori e controllo: Nove è la radice quadrata di 81, non quella quarta. 81 copia la potenza quarta e 1458 è il display, non una temperatura. La taratura va tolta prima di invertire la legge fisica.

## 15 — Guadagno e offset prima dell’inversa termica

Le emissioni dei riferimenti sono 48 e 486 mW. La differenza di letture 876 divisa per la differenza di potenze 438 mW dà q=2 mW⁻¹; dal primo riferimento segue b=1. C emette (487−1)/2=243 mW. Con a=5 abbiamo p=3θ⁴: θ⁴=81 e θ=3 nel ramo positivo.

Passaggi: `q=\frac{973-97}{(486-48)\,\mathrm{mW}}\qquad q=2\,\mathrm{mW^{-1}}\qquad b=1\qquad P_{{\rm em},C}=243\,\mathrm{mW}\qquad \theta_C^4=81\qquad \theta_C=3`

Distrattori e controllo: θ=2 tornerebbe a S=97. θ=1 emetterebbe 3 mW e darebbe S=7; θ=4 emetterebbe 768 mW e darebbe S=1537. 81 è il valore della quarta potenza, non della temperatura normalizzata.

## 16 — Il vincolo porta a una quinta potenza dell’area

Il legame è fra le variabili normalizzate dichiarate. Sostituendo θ=(2/5)a, p=(3/5)a(2a/5)⁴=(48/3125)a⁵. Il dato p=48 implica a⁵=3125. Poiché 5⁵=3125, a=5 e A=5 cm². Per a>0 la quinta potenza cresce strettamente, quindi la soluzione positiva è unica; il vincolo restituisce θ=2.

Passaggi: `p=\frac35a\left(\frac25a\right)^4\qquad p=\frac{48}{3125}a^5\qquad a^5=3125\qquad a=5\qquad A=5\,\mathrm{cm^2}`

Distrattori e controllo: −5 cm² viola il dominio e renderebbe anche θ negativa. 25 cm² copia a² senza risolvere la quinta potenza; 2 cm² copia il numero della θ finale. Il vincolo non lascia libera la scala, perché la potenza fissata cresce come a⁵.
