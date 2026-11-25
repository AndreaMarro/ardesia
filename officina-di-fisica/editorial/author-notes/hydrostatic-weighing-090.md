# hydrostatic-weighing-090 — note dell’autore

Fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-02.json. Tutti80 originali089–093 letti prima dell’authoring, con varianti dimensionali02 e profilo09103 separatamente. ID effettivi confermati; stesso assembler canonico courseC2/unitu3 e competenze esistenti rilette nel catalogo C2.

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore. Note di calcolo per il revisore separato.

Peso gravitazionale distinto dalla tensione e dalla risultante nulla; W_a>W_i>0,ρ_c>ρ_w. g uguale nelle pesate si cancella.03 il distrattore W_a/W_i coincide numericamente con la legge solo per il riferimento10,5N: la soluzione spiega esplicitamente la falsa universalità usando20,15N.12 le medie degli ingressi danno lo stesso3kg/L qui perché le spinte sono uguali; non si afferma una regola universale.15 S11/3→ρ4/3kg/L→W_a20N.16 misura ridondante, infinite coppie positive.

SVG XML e rendering nativo completo letti dall’autore. Ogni grandezza ha la propria scala esplicita; vettori su path separati con marker-end, origini e riferimenti indicati. Le formule sono scomposte con il helper law_steps esistente; nessun CSS o renderer modificato.

## 01 — La perdita di lettura misura la spinta

In acqua il peso non diminuisce: la spinta verso l’alto condivide il sostegno con la tensione del dinamometro. Perciò S=W_a−W_i=5 N. La stessa g moltiplica sia ρ_cV sia ρ_wV e si cancella nel rapporto W_a/S, dando la densità del solido.

Passaggi: `S=W_a-W_i=5\,\mathrm N\qquad W_a=\rho_cgV\qquad S=\rho_wgV\qquad \rho_c=\rho_w\frac{W_a}{W_a-W_i}\qquad \rho_c=2\,\mathrm{kg/L}`

Errori e controllo: W_i non è la risultante delle forze, che è zero in equilibrio, e non è il nuovo peso gravitazionale. Il valore 2 kg/L supera 1 kg/L, coerentemente con tensione positiva e immersione completa.

## 02 — Forze in rapporto, densità in risultato

Il rapporto W_a/(W_a−W_i) è puro, ma deve moltiplicare la densità nota dell’acqua. Il risultato mantiene quindi dimensioni di massa per volume. Il numero 1 della densità dell’acqua non autorizza a cancellarne l’unità.

Passaggi: `\rho_c=\rho_w\frac{W_a}{S}\qquad [\rho_c]=M/L^3\qquad 1\,\mathrm{kg/L}=1000\,\mathrm{kg/m^3}`

Errori e controllo: N è forza, L/kg è densità inversa, kg massa e N/L forza per volume. Il rapporto delle forze da solo determina una densità relativa, non una densità dimensionata.

## 03 — La densità dalla differenza delle pesate

Nella seconda pesata l’equilibrio è W_i+S=W_a. La differenza è dunque il peso dell’acqua spostata, non il peso rimasto al corpo. Dividere peso del corpo per peso dell’acqua spostata confronta masse che occupano lo stesso volume e restituisce il rapporto di densità.

Passaggi: `W_i+S=W_a\qquad S=\rho_wgV\qquad W_a=\rho_cgV\qquad \frac{\rho_c}{\rho_w}=\frac{W_a}{W_a-W_i}`

Errori e controllo: W_a/W_i può coincidere col numero corretto nel caso particolare 10 e 5 N, ma non è la legge: con 20 e 15 N darebbe 4/3 anziché 4. Le espressioni con rapporto invertito o somma danno densità sotto quella dell’acqua, incompatibile con il dominio.

## 04 — Peso maggiore con la stessa lettura immersa

La spinta non resta fissa: passa da 5 a 15 N perché la differenza delle letture aumenta. Il rapporto peso/spinta cambia quindi da 10/5=2 a 20/15=4/3. Il secondo corpo ha peso maggiore ma densità minore: sposta un volume relativamente più grande.

Passaggi: `S_A=5\,\mathrm N\qquad S_B=15\,\mathrm N\qquad \rho_{c,A}=2\,\mathrm{kg/L}\qquad \rho_{c,B}=\frac{20}{15}\,\mathrm{kg/L}\qquad \rho_{c,B}=\frac43\,\mathrm{kg/L}`

Errori e controllo: Quattro segue soltanto il numeratore; uno imporrebbe tensione immersa nulla e un mezzo richiederebbe un sostegno verso il basso, entrambi esclusi. Una densità non si ordina dal solo peso senza conoscere il volume.

## 05 — Il peso in aria da densità e tensione

Poniamo R=ρ_c/ρ_w=2. La relazione R(W_a−W_i)=W_a porta (R−1)W_a=R W_i. Dividendo per R−1>0 otteniamo 10 N, maggiore della lettura immersa.

Passaggi: `R=\rho_c/\rho_w=2\qquad RW_a-RW_i=W_a\qquad W_a=\frac{R}{R-1}W_i\qquad W_a=10\,\mathrm N`

Errori e controllo: Moltiplicare semplicemente la densità per W_i dimentica che il denominatore contiene anche W_a; qui il numero coinciderebbe per R=2, ma l’inversa generale richiede il fattore R/(R−1). Il controllo 10−5=5 N ricostruisce la densità assegnata.

## 06 — La tensione in acqua

La spinta vale la frazione ρ_w/ρ_c=1/2 del peso, quindi 5 N. La tensione sostiene il peso residuo: W_i=W_a−S=5 N. Non stiamo calcolando la risultante, che resta nulla.

Passaggi: `S=\frac{\rho_w}{\rho_c}W_a\qquad S=5\,\mathrm N\qquad W_i=W_a-S\qquad W_i=5\,\mathrm N`

Errori e controllo: Un sostegno da 10 N ignora la spinta; zero sarebbe il caso limite ρ_c=ρ_w e non quello assegnato. Tensioni negative non sono ammesse da una fune che tira soltanto verso l’alto.

## 07 — Una lettura immersa più piccola

Il corpo B è sostenuto quasi tutto dall’acqua: S_B=9 N, quindi ρ_c,B=10/9 kg/L. Dividendo per i 2 kg/L di A si ottiene 5/9. Entrambe le densità superano quella dell’acqua, ma B le è più vicino.

Passaggi: `\rho_{c,B}=\frac{10}{9}\,\mathrm{kg/L}\qquad \rho_{c,A}=2\,\mathrm{kg/L}\qquad \rho_{c,B}/\rho_{c,A}=\frac59`

Errori e controllo: Un quinto segue solo la tensione, che non è proporzionale alla densità. Nove quinti inverte il confronto; cinque confonde il rapporto delle tensioni con quello delle densità.

## 08 — Il doppio della densità corretta

La densità corretta è 2 kg/L. La proposta ne aggiunge altrettanti, perciò lo scarto con segno è +2 kg/L. Un corpo da 4 kg/L e peso 10 N avrebbe spinta 5/2 N e lettura immersa 15/2 N, non i 5 N osservati.

Passaggi: `\rho_c=2\,\mathrm{kg/L}\qquad e=(4-2)\,\mathrm{kg/L}\qquad e=2\,\mathrm{kg/L}`

Errori e controllo: −2 scambia l’ordine, quattro ripete la proposta, zero la accetta e uno dimezza lo scarto. La controprova con il dinamometro distingue una densità numericamente plausibile da quella compatibile con le misure.

## 09 — L’inversa conserva le densità

Moltiplicando per la differenza delle letture, ρ_cW_a−ρ_cW_i=ρ_wW_a. Raccogliamo W_a e dividiamo per ρ_c−ρ_w>0. Il rapporto fra densità è puro, quindi l’inversa restituisce una forza.

Passaggi: `\rho_c(W_a-W_i)=\rho_wW_a\qquad (\rho_c-\rho_w)W_a=\rho_cW_i\qquad W_a=\frac{\rho_cW_i}{\rho_c-\rho_w}`

Errori e controllo: ρ_cW_i/ρ_w omette il termine da raccogliere; sostituire ρ_w al numeratore modifica l’equazione. Le formule che restituiscono W_a<W_i violano l’esistenza di una spinta positiva verso l’alto.

## 10 — Scalare entrambe le pesate

Il numeratore della densità scala con κ₁, ma il denominatore è la nuova differenza D_B: non si può scalarlo con κ₂ da solo. Dividiamo ρ_wκ₁W_a/D_B per ρ_wW_a/D e cancelliamo i fattori comuni.

Passaggi: `\rho_{c,A}=\rho_wW_a/D\qquad \rho_{c,B}=\rho_w\kappa_1W_a/D_B\qquad \frac{\rho_{c,B}}{\rho_{c,A}}=\frac{\kappa_1D}{D_B}`

Errori e controllo: Il quoziente κ₁/κ₂ ignora la sottrazione; il prodotto è privo di giustificazione. Il reciproco scambia gli stati e D/D_B omette la scalatura del peso. Se κ₁=κ₂ la densità resta uguale, perché entrambe le pesate scalano insieme.

## 11 — Peso e sostegno più grandi

La spinta è 5 N in entrambe le prove, dunque il volume spostato è uguale nelle medesime acqua e gravità. Il peso raddoppia e la densità passa da 2 a 4 kg/L: il rapporto è due.

Passaggi: `S_A=S_B=5\,\mathrm N\qquad \rho_{c,A}=2\,\mathrm{kg/L}\qquad \rho_{c,B}=4\,\mathrm{kg/L}\qquad \rho_{c,B}/\rho_{c,A}=2`

Errori e controllo: Tre segue soltanto la tensione 5→15 N. Quattro è la nuova densità espressa in kg/L, non il rapporto puro; un mezzo inverte gli stati e uno confonde la spinta uguale con il peso uguale.

## 12 — La media delle due densità

Le densità ricavate separatamente sono 2 e 4 kg/L; la loro media è 3 kg/L. In questa coppia le due spinte sono uguali, perciò anche le letture medie 15 e 10 N darebbero 3 kg/L. È una proprietà di questi dati, non una regola generale sui quozienti.

Passaggi: `\overline\rho_c=\frac{2+4}{2}\,\mathrm{kg/L}\qquad \overline\rho_c=3\,\mathrm{kg/L}\qquad \rho_{medie}=\frac{15}{15-10}\,\mathrm{kg/L}`

Errori e controllo: Sei somma senza dividere, 3/2 divide due volte e due o quattro selezionano una sola prova. La coincidenza con gli ingressi medi dipende qui dal denominatore comune 5 N.

## 13 — La tensione per raddoppiare la densità

La densità bersaglio è 4 kg/L, perciò la spinta di B deve essere un quarto del peso 20 N, cioè 5 N. La tensione vale 20−5=15 N e confrontata con i 5 N iniziali dà tre.

Passaggi: `\rho_{c,B}=4\,\mathrm{kg/L}\qquad S_B=5\,\mathrm N\qquad W_{i,B}=15\,\mathrm N\qquad W_{i,B}/W_{i,A}=3`

Errori e controllo: Due segue il peso, ma la tensione è il peso meno una spinta e non una quantità proporzionale al peso in questo cambiamento. Quattro è la densità numerica; uno conserverebbe la densità 4/3 kg/L, non 4.

## 14 — Una taratura di densità e un peso incognito

Il riferimento ha densità 2 kg/L e determina q=3 L/kg. La lettura 12 rappresenta 4 kg/L. Con R=4 e W_i=15 N, l’inversa W_a=R W_i/(R−1) dà 20 N; la spinta positiva è 5 N.

Passaggi: `q=3\,\mathrm{L/kg}\qquad \rho_{c,B}=4\,\mathrm{kg/L}\qquad W_{a,B}=\frac{4\cdot15}{4-1}\,\mathrm N\qquad W_{a,B}=20\,\mathrm N`

Errori e controllo: Usare 12 come densità relativa darebbe 180/11 N, confondendo il guadagno dello strumento con la legge fisica. Il risultato corretto supera W_i e restituisce ρ_c=4 kg/L.

## 15 — Un offset e una densità frazionaria

Le densità di riferimento sono 2 e 4 kg/L: q=(9−5)/(4−2)=2 L/kg e z=1. C ha densità (11/3−1)/2=4/3 kg/L. Raccogliendo W_a nell’inversa si trova W_a=(4/3)5/(1/3)=20 N.

Passaggi: `q=2\,\mathrm{L/kg}\qquad z=1\qquad \rho_{c,C}=\frac43\,\mathrm{kg/L}\qquad W_{a,C}=\frac{(4/3)5}{1/3}\,\mathrm N\qquad W_{a,C}=20\,\mathrm N`

Errori e controllo: Con W_i=5 N, W_a10,15,25 N darebbero S5,4,7/2, non 11/3. W_a=5 N annulla la spinta e rende la densità inferita indefinita. La lettura strumentale non è un peso e non va sottratta a W_i.

## 16 — Due pesate proporzionali senza scala fissata

Sostituendo W_a=2W_i, la differenza è W_i e la densità vale sempre 2ρ_w=2 kg/L. La misura conferma il vincolo ma non identifica la dimensione o il peso del corpo. Le coppie 10 e 5 N, oppure 20 e 10 N, sono entrambe ammesse.

Passaggi: `\rho_c=\rho_w\frac{2W_i}{2W_i-W_i}\qquad \rho_c=2\rho_w\qquad \rho_c=2\,\mathrm{kg/L}`

Errori e controllo: Una sola coppia richiederebbe una misura indipendente di peso o volume. Zero è escluso perché la differenza finirebbe al denominatore; due esempi non limitano a due la famiglia continua con W_i>0.

