# statistical-entropy-189 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-05.json, file SHA256 e8f90aea8c862df7110419c599fbd2b7160d32b370a098146feb303553194378. Letti individualmente tutti i 16 prompt originali della famiglia tramite allowlist id/prompt/familyId/lawFamily, senza estrarre opzioni, chiavi, solutionSteps o hints sorgente. Snapshot prompt-only SHA256 9fd83d6d22c9948aeb3200af1f9f116cdc3b47b6a9c7d45b972414c56c6e958a.

L’integratore ha confermato prima dell’autoria una primaria source-only distinta già congelata del verificatore Root per U5-05. L’autore non ha aperto quella primaria, il suo verificatore o risultati attesi. Le risoluzioni seguenti sono note dell’autore, non una revisione scientifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: riletti C3-L01, C3-L09 e C3-L10, in particolare la legge statistica e la distinzione fra singola parte e sistema complessivamente isolato. Primary C3-L10 «Seguire il verso dei processi», prerequisiti reali C1-L001/C3-L01/C3-L06/C3-L09/C3-L10 e riuso C6.

Si usa soltanto assemble_family della pipeline esistente, course C3/unit u5, astra/1 e ID AR-<sourceId>. DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione e nessun registro o runtime modificati.

Non sono cambiati i dati dei casi numerici originali. Il dominio dei conteggi è intero positivo; il coefficiente z non viene confuso con un conteggio. Il caso 09 richiede compatibilità dell’inversa con conteggi interi, senza arrotondamenti; il caso 10 esplicita z_A≠0 e integrità dei prodotti con i fattori κ. Il caso 12 distingue la media delle uscite da conteggi medi non interi. Il caso 16 conserva una scala intera libera e infinite coppie numerabili, senza introdurre una famiglia continua. Il display D è dichiarato continuo e distinto dall’entropia S.

Manualità: rapporti riconosciuti come potenze intere di due, logaritmi lasciati esatti quando necessario, inverse mediante esponenziale e controlli di interezza. Per chiarire che z non deve essere intero si usa il confronto Ω_i=1, Ω_f=3: ln3/ln2 è strettamente fra uno e due, senza calcolarne un decimale. Una variazione di segno negativo non è respinta in generale, perché non è imposto un processo spontaneo isolato a ogni confronto.

Controlli tecnici reali: due assembly identici, binding source/candidate/provenance verificati; importatore canonico in SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici, con zero nuove teste live. Tali controlli non costituiscono PASS scientifico.

SVG completo letto in XML e rendering asset-only nativo. Le quattro tappe distinguono conteggi, incrementi logaritmici, media dei coefficienti e scala discreta. I cerchi sono alternative e non particelle; non codificano una dimensione geometrica fisica o una probabilità con la loro area. Le barre 2, 1 e 3/2 partono da x130 e sono lunghe 240, 120 e 180 unità intrinseche SVG: fattore comune 120 unità per unità di z. Questa scala di coordinate è registrata soltanto nelle note e non presentata come pixel CSS nel prodotto. Le due frecce dei raddoppi hanno punte distinte. Nella tabella i conteggi sono esattamente (1,4), (2,8), (3,12).

Rendering asset-only avviato sotto mutex /private/tmp/cric-bounded-local-work.lock e guardia interna di almeno 2 GiB liberi; terminale exit 0. PNG completo e checksum sono conservati nella cartella author-evidence/statistical-entropy-189-asset-only. UI del prodotto NOT_RUN: non è stato avviato browser-drafts o browser-batches e non si crea alcun marker di completamento del prodotto. Nessuna full suite locale.

## 01 — Due raddoppi del numero di stati

La variazione si ottiene sottraendo le due entropie: ΔS=k_B(ln8−ln2)=k_B ln4. Poiché 4=2², ln4=2ln2. Dividere per k_B ln2 lascia due. Gli otto microstati finali non sono otto particelle: sono alternative compatibili con il macrostato finale.

Passaggi: `\Delta S=k_B\ln(8/2)\qquad \Delta S=k_B\ln4\qquad \ln4=2\ln2\qquad z=2`

Distrattori: Quattro è il rapporto dei conteggi prima del logaritmo. Tre usa ln8 ma omette lo stato iniziale; sei sottrae i conteggi anziché le entropie. −2 invertirebbe iniziale e finale: una variazione negativa non è vietata in ogni confronto, ma non descrive questi dati.

## 02 — Un coefficiente senza unità

ΔS e k_B hanno entrambi unità J/K; ln2 è un numero puro. Il quoziente non ha dimensioni e si esprime con 1. Essere adimensionale non significa essere intero: per esempio Ω_i=1 e Ω_f=3 danno z=ln3/ln2, strettamente fra uno e due perché 2<3<4.

Passaggi: `[\Delta S]=[k_B]=\mathrm{J/K}\qquad [z]=1\qquad 1<\frac{\ln3}{\ln2}<2`

Distrattori: J/K è l’unità di ΔS, non del quoziente normalizzato. J è energia, K temperatura e K⁻¹ temperatura inversa. I conteggi sono interi, mentre il loro logaritmo normalizzato non deve esserlo.

## 03 — Raddoppiare le alternative

Il rapporto finale/iniziale è 2n/n=2, indipendente da n. La differenza delle entropie è quindi k_B ln2: raddoppiare il numero di alternative aggiunge questo contributo, senza moltiplicare necessariamente per due l’entropia iniziale. Per n=1 l’entropia iniziale del modello è zero ma quella finale è positiva.

Passaggi: `\frac{\Omega_f}{\Omega_i}=2\qquad \Delta S=k_B\ln2\qquad z=1`

Distrattori: 2S_i confonde un raddoppio del conteggio con uno dell’entropia. Zero ignora il cambiamento; il segno meno inverte il rapporto e 2k_B sostituisce erroneamente ln2 con due. Non è assegnato un calore o un percorso isotermo reversibile dal quale ricavare Q.

## 04 — Un raddoppio aggiunge uno

I rapporti sono quattro e otto, cioè 2² e 2³. Le due uscite sono due e tre. Il raddoppio del conteggio finale moltiplica il rapporto per due e aggiunge ln2 al logaritmo: z cresce di uno, non di un fattore due.

Passaggi: `\Omega_{f,A}/\Omega_i=2^2\qquad \Omega_{f,B}/\Omega_i=2^3\qquad z_A=2\qquad z_B=3`

Distrattori: Quattro raddoppia z invece del conteggio. Uno va nel verso opposto; due ignora la prova B e sei moltiplica fra loro i due esponenti anziché leggere quello di ciascuna potenza.

## 05 — Dal logaritmo al conteggio finale

Moltiplichiamo per ln2: ln(Ω_f/Ω_i)=2ln2=ln4. Uguagliando gli argomenti positivi si trova Ω_f/Ω_i=4. Il conteggio finale è 2·4=8, un intero positivo: non occorre né è ammesso arrotondare una molteplicità.

Passaggi: `\ln(\Omega_f/\Omega_i)=2\ln2\qquad \Omega_f/\Omega_i=2^2\qquad \Omega_f=2\cdot4\qquad \Omega_f=8`

Distrattori: Quattro è il solo rapporto e dimentica Ω_i. Due copia lo stato iniziale; sei somma due e quattro invece di moltiplicarli. In generale la formula inversa è ammessa solo se il conteggio ottenuto resta intero positivo.

## 06 — Ricostruire il conteggio iniziale

Il rapporto finale/iniziale deve essere 2²=4. Perciò Ω_i=Ω_f/4=8/4=2. Sostituendo di nuovo si ritrova ln(8/2)/ln2=2. Il risultato rispetta il dominio dei conteggi senza una scelta di segno ulteriore.

Passaggi: `\Omega_f/\Omega_i=2^z\qquad \Omega_i=\Omega_f/2^z\qquad \Omega_i=8/4\qquad \Omega_i=2`

Distrattori: Trentadue moltiplicherebbe per quattro invece di dividere. Quattro confonde il rapporto con il conteggio iniziale e otto annullerebbe la variazione. Non si sottrae z direttamente da un conteggio per invertire un logaritmo.

## 07 — Un iniziale più grande riduce la variazione

A ha rapporto 8/2=4 e z_A=2. B ha rapporto 8/4=2 e z_B=1. Il quoziente richiesto è uno diviso due. Non è il rapporto dei due Ω_i: il logaritmo è stato applicato prima di confrontare le uscite.

Passaggi: `z_A=\ln4/\ln2=2\qquad z_B=\ln2/\ln2=1\qquad z_B/z_A=1/2`

Distrattori: Due inverte B e A o segue il solo aumento di Ω_i. Uno ignora il diverso rapporto di microstati; un quarto dimezza due volte e −1/2 attribuisce un segno negativo non presente nelle due variazioni assegnate.

## 08 — Uno scarto fra coefficienti

Il rapporto dei conteggi è quattro, ma il coefficiente corretto è due perché quattro è 2². La proposta lo supera di 4−2=+2. Lo scarto è adimensionale come le due uscite; non è una variazione espressa direttamente in J/K.

Passaggi: `z_{\rm corretto}=2\qquad e=z_{\rm proposto}-z_{\rm corretto}\qquad e=4-2\qquad e=2`

Distrattori: −2 cambia l’ordine della sottrazione. Quattro copia la proposta, zero la accetta e sei somma i due coefficienti. Non si deve moltiplicare lo scarto per k_B ln2 se viene richiesto proprio il coefficiente.

## 09 — L’inversa conserva il conteggio

Dalla definizione si ha ln(Ω_f/Ω_i)=zln2. Esponenziare dà Ω_f/Ω_i=e^(zln2)=2^z, quindi Ω_f=Ω_i2^z. Il prodotto deve essere intero positivo: un valore z incompatibile con questa condizione non viene corretto arrotondando il risultato.

Passaggi: `\ln(\Omega_f/\Omega_i)=z\ln2\qquad \Omega_f/\Omega_i=e^{z\ln2}\qquad \Omega_f=\Omega_i2^z\qquad \Omega_i2^z\in\mathbb N_{>0}`

Distrattori: Moltiplicare per z non inverte il logaritmo. Dividere per Ω_i scambia il ruolo del riferimento; dividere per 2^z invertirebbe il verso della variazione. Sommare i due termini non ricostruisce il rapporto esponenziale.

## 10 — Scalare due conteggi

Il rapporto dei nuovi conteggi è R(κ₁/κ₂). Il logaritmo di un prodotto somma lnR e ln(κ₁/κ₂). Dividendo z_B per z_A si cancellano i due divisori ln2 e rimane il rapporto dei logaritmi indicato. Il denominatore non è nullo perché R≠1. Se κ₁=κ₂, la nuova scala comune dei conteggi lascia z invariato.

Passaggi: `R_B=R\frac{\kappa_1}{\kappa_2}\qquad \ln R_B=\ln R+\ln(\kappa_1/\kappa_2)\qquad \frac{z_B}{z_A}=\frac{\ln R+\ln(\kappa_1/\kappa_2)}{\ln R}`

Distrattori: Il solo quoziente dei fattori confonde rapporto dei conteggi e rapporto dei logaritmi; il reciproco scambia i fattori. Il segno meno descriverebbe Rκ₂/κ₁. Il prodotto dei fattori non conserva z quando entrambi sono, per esempio, due. La formula non richiede che z_A sia positivo, ma soltanto diverso da zero.

## 11 — Due coppie di microstati

I rapporti dei conteggi sono quattro in A e due in B. Sono una potenza seconda e una potenza prima di due: z_A=2, z_B=1. Il loro rapporto è 1/2, benché Ω_f sia stato moltiplicato per 1/4 e Ω_i per 1/2: i due fattori dei conteggi non si trasferiscono direttamente a z.

Passaggi: `R_A=4\qquad R_B=2\qquad z_A=2\qquad z_B=1\qquad z_B/z_A=1/2`

Distrattori: Due è il rapporto inverso. Un quarto considera solo il conteggio finale, uno ignora la variazione del rapporto e −1/2 cambia segno a una delle uscite positive. Tutti i quattro conteggi assegnati sono interi positivi.

## 12 — La media non deve essere un conteggio

Le uscite sono due e uno. La loro media è (2+1)/2=3/2, perfettamente ammissibile come media di coefficienti. Non è il numero di microstati di un nuovo macrostato. Le medie dei conteggi originali sarebbero Ω_f=5 e Ω_i=3/2: il secondo non è intero e non appartiene al modello, quindi non si sostituiscono tali medie nella legge né le si arrotonda.

Passaggi: `z_A=2\qquad z_B=1\qquad \overline z=\frac{2+1}{2}\qquad \overline z=3/2`

Distrattori: Tre non dimezza la somma. Un mezzo è metà della differenza, due copia A e uno copia B. Il vincolo di interezza riguarda Ω_i e Ω_f, non questa media statistica e neppure, in generale, un singolo coefficiente z.

## 13 — Un bersaglio e un iniziale intero

A dà z_A=2, perciò B deve dare uno. Occorre Ω_f,B/Ω_i,B=2¹=2. Con Ω_f,B=2 segue Ω_i,B=1, intero positivo. Il rapporto con il conteggio iniziale A è 1/2. Si ricostruisce il bersaglio su z prima di invertire la legge.

Passaggi: `z_B=1\qquad \Omega_{f,B}/\Omega_{i,B}=2\qquad \Omega_{i,B}=1\qquad \Omega_{i,B}/\Omega_{i,A}=1/2`

Distrattori: Due inverte il confronto. Uno darebbe Ω_i,B=2 e z_B=0. Un quarto richiederebbe Ω_i,B=1/2, non un conteggio ammesso; quattro darebbe Ω_i,B=8 e z_B=−2, diverso dal bersaglio.

## 14 — Tarare un display di z

Il riferimento ha z=2, quindi a=6/2=3. La lettura tre significa z_B=1. Il rapporto finale/iniziale B è due: con un solo microstato iniziale si hanno due microstati finali. Il guadagno strumentale non è un conteggio e non modifica la legge fisica.

Passaggi: `a=6/2=3\qquad z_B=D_B/a=1\qquad \Omega_{f,B}=\Omega_{i,B}2^{z_B}\qquad \Omega_{f,B}=2`

Distrattori: Otto userebbe D=3 direttamente come z e salterebbe la taratura. Uno annullerebbe la variazione; tre copierebbe il display e quattro darebbe z=2, quindi D=6 anziché tre.

## 15 — Togliere anche l’offset

A e B danno z=2 e z=1. Dalle differenze a=(5−3)/(2−1)=2; poi b=5−2·2=1. C ha z_C=(7−1)/2=3. Il rapporto dei suoi conteggi è 2³=8, quindi Ω_f,C=2·8=16, intero positivo. La sottrazione dell’offset precede l’esponenziale.

Passaggi: `a=2\qquad b=1\qquad z_C=(7-1)/2=3\qquad 2^{z_C}=8\qquad \Omega_{f,C}=16`

Distrattori: 16√2 omette b: userebbe z=7/2 e Ω_f=2·2^(7/2)=16√2, che non è intero e non si arrotonda. Otto copia il solo rapporto; trentadue userebbe z=4 e predirebbe D=9. Quattro darebbe z=1 e D=3.

## 16 — La scala intera resta libera

Scriviamo Ω_i=n e Ω_f=4n, con n intero positivo. Il rapporto è sempre quattro e z=2: la misura ripete la conseguenza del vincolo, senza scegliere n. Esempi sono (1,4), (2,8), (3,12), e si può continuare per tutti gli interi positivi. Le coppie sono infinite e numerabili, non una famiglia continua di conteggi frazionari.

Passaggi: `\Omega_i=n\qquad \Omega_f=4n\qquad n\in\mathbb N_{>0}\qquad z=\frac{\ln4}{\ln2}=2`

Distrattori: La coppia (2,8) è solo un esempio. Quattro è il rapporto imposto, non il numero delle soluzioni. Non sono tutte le coppie reali sul medesimo rapporto: per esempio Ω_i=1/2 non è un conteggio. Nessuna ulteriore misura determina la scala intera.
