# Revisione indipendente wire-stretched-fixed-volume-205

Gli 80 prompt originali U6-02 B205–209 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave o soluzione altrui. Primaria SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, copia byte-identica in u6-independent-205-209-fixtures-20261125/primary-source-only.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json, SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Nessuna esposizione anticipata alle chiavi U6-02. La primaria è rimasta immutata.

Successivamente ho letto integralmente i sedici record finali: ogni consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Le leggi e gli esiti sono stati confrontati con la primaria indipendente; nessun modulo autore è stato importato. Edizione finale letta: e9405f9104380baffa38f7c6725765a239317a89. I modelli derivano da conservazione del volume, legge ohmica e leggi di Kirchhoff secondo la topologia pertinente. Catalogo reale C4-L05/L06 riletto; il caso sui materiali è distinto dalla riduzione delle reti.

Le inverse conservano parametri reali finiti, resistenze positive e denominatori non nulli; il conteggio di elementi rimane intero positivo dove richiesto. Le tarature hanno guadagno positivo e possono avere offset negativo. Il decoder AST legge esattamente i lessemi originali, senza eval né ricostruzione da float binari. Il suo SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc è controllato e riportato per ogni record. SymPy, Pint e Fraction forniscono oracoli separati dai generatori.

Tutto l’XML e il nuovo rendering nativo completo sono stati letti. I cinque render asset-only sono realmente terminati con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Le copie esatte di SVG, PNG e log sono nella fixture con manifest. Le rettifiche d’autore sono state rilette prima del congelamento: 205 didascalia dei due fili e descrizione simbolica; 206 parentesi della somma e attribuzione del numero puro; 207 controprova della conduttanza e tensione positiva esplicita; 208 scale comuni solo entro il pannello; 209 somma di N cadute senza uguaglianza interna spezzata. Chiavi, leggi e geometrie sono rimaste invariate; nessun helper autore globale è stato modificato.

## Prove individuali

### AR-u6-wire-stretched-fixed-volume-01

Volume A₀L₀=AL e L=sL₀ impongono A=A₀/s. Con resistività ρ invariata, R=ρL/A=R₀s². R₀=1 Ω, s=2 danno 4 Ω. Il modello assume deformazione uniforme e temperatura/materiale tali da mantenere ρ costante.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 2 Ω omette la diminuzione della sezione; 1/2 Ω inverte la variazione di lunghezza; 8 Ω aggiunge un altro fattore due. La resistività rimane invariata.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-02

R è resistenza elettrica, quindi la dimensione è V/A e l’unità Ω. Un prefisso non ne cambia dimensione. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: Ω·m misura resistività, S conduttanza, A corrente e V tensione. Solo Ω corrisponde a V/A.

Esito esatto indipendente: Ω. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-03

Per stesso materiale e temperatura, nel modello ohmico la resistività ρ deve coincidere, non la resistenza R=ρL/A né necessariamente la conduttanza. Cambiare geometria può cambiare L/A; la resistività è proprietà del materiale alle condizioni fissate.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: A parità di resistività, L/A può cambiare: geometrie con L/A pari a 1 e 2 hanno resistenze diverse; anche conduttanze e correnti a tensione non nulla possono differire.

Esito esatto indipendente: La resistività ρ. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-04

A s=2 fisso, R=4 R₀. R₀ da 1 a 3 Ω porta R da 4 a 12 Ω: dipendenza lineare da R₀, non triplicazione di s.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 4/3 Ω inverte il fattore della resistenza iniziale; 36 Ω lo eleva anche al quadrato; 4 Ω ignora il cambiamento; 6 Ω omette il contributo della sezione.

Esito esatto indipendente: Da 4 a 12 Ω. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-05

R₀=R/s². Misura 4 Ω e s=2 danno 4/4=1 Ω. s è adimensionale e non nullo; R₀ resta positivo.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 2 Ω divide soltanto per s; 16 Ω moltiplica per s²; 4 Ω non rimuove il fattore geometrico. La sola resistenza non determina la resistività senza geometria.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-06

s²=R/R₀=4; radici±2, ma s=L/L₀≥1 impone s=2. Per un’inversa generale occorre R≥R₀>0; se R<R₀ non descrive allungamento nel dominio dichiarato.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 4 è s²; −2 viola il rapporto positivo; 1/2 descriverebbe accorciamento, escluso da s≥1. Il rapporto di lunghezze è adimensionale.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-07

A dà 1·2²=4 Ω. B con s=1 dà 1 Ω; rapporto B/A=1/4. s=1 è il confine ammesso di nessun allungamento.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 1/2 considera solo la lunghezza; 4 inverte il rapporto; 1 ignora la variazione; −1/4 non è rapporto di resistenze positive.

Esito esatto indipendente: 1/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-08

Il corretto è 4 Ω. Scarto con segno proposta−corretto=8−4=+4 Ω; il rapporto 2 sarebbe puro e risponderebbe a un’altra domanda.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: −4 Ω inverte lo scarto; 8 Ω ripete la proposta; zero la accetta; 2 è un rapporto adimensionale, non una differenza in Ω.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-09

Da R=R₀s² si divide per s²>0: R₀=R/s². La dimensione rimane Ω. Non si usa R/s o s²/R.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: R/s rimuove un solo fattore geometrico; s²/R ha unità Ω⁻¹; Rs² non isola R₀; il fattore due ulteriore è arbitrario.

Esito esatto indipendente: R₀ = R / s². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-wire-stretched-fixed-volume-10

Sostituendo R₀, B=κ₁R₀, A e s_B=κ₂s_A si ottiene R_B/R_A=κ₁κ₂². I fattori positivi devono anche conservare s_A, s_B≥1; non ogni fattore piccolo è lecito a s_A fissato.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: κ₁κ₂ omette un fattore geometrico; κ₁/κ₂² inverte la scalatura; κ₁²κ₂² quadra anche R₀; κ₂²/κ₁ rende inversa R₀.

Esito esatto indipendente: κ₁ κ₂². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-wire-stretched-fixed-volume-11

A:1·2²=4 Ω. B:2·3²=18 Ω. Rapporto 18/4=9/2, comprendendo sia la variazione di R₀ sia il quadrato di s.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 2 segue solo R₀; 9/4 segue solo s²; 3 usa s linearmente; 2/9 è il reciproco del rapporto corretto 9/2.

Esito esatto indipendente: 9/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-12

Media delle uscite (4+18)/2=11 Ω. Ai dati medi R₀=3/2 Ω, s=5/2 il modello darebbe(3/2)(25/4)=75/8 Ω;11−75/8=13/8 Ω. Si devono mediare le resistenze già calcolate.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 75/8 Ω applica il modello ai dati medi; 22 Ω omette la divisione per due; 7 Ω è metà della differenza; 4 Ω ripete la prima prova.

Esito esatto indipendente: 11. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-13

Il bersaglio è(9/2)·4=18 Ω. Con R₀, B=2 Ω segue s_B²=9, quindi s_B=3. Rapporto s_B/s_A=3/2, con entrambi i fattori almeno 1.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 2/3 inverte il rapporto; 9/4 confronta i quadrati; 9/2 copia il fattore di R; 3 è il solo valore finale di s, senza divisione per quello iniziale.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-14

Riferimento 4 Ω con S 12: guadagno a=3 Ω⁻¹ se il display è adimensionale. Lettura 54 dà R=18 Ω. s=3 implica R₀=18/9=2 Ω; la taratura si rimuove prima dell’inversa.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 6 Ω usa la lettura come resistenza senza taratura; 18 Ω è la resistenza finale; R₀=1 Ω ricostruisce una lettura 27, non 54.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-15

Riferimenti R_A 4, R_B 18 Ω, letture 9,37: a=(37−9)/(18−4)=2 Ω⁻¹, b=1. Lettura 25 dà R_C=(25−1)/2=12 Ω; con s_C 2 segue R₀, C=12/4=3 Ω.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 25/8 Ω non sottrae l’offset e ricostruisce 26; 1 Ω ricostruisce 9; 6 Ω ricostruisce 49; 12 Ω ricostruisce 97. Solo 3 Ω restituisce 25.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-wire-stretched-fixed-volume-16

Il vincolo nelle unità dichiarate è R₀=(1/2 Ω)s. Sostituendo in R=R₀s²:4 Ω=(1/2 Ω)s³, quindi s³=8 e s=2≥1. È unico sul ramo s≥1, con R₀=1 Ω. Non è una legge temporale di variazione della resistività.

Ipotesi: Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.

Distrattori e controprove: 8 copia s³; 4 non risolve la cubica; −2 viola s≥1 e renderebbe R₀ negativo nel vincolo. La monotonia di s³ esclude infinite soluzioni.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML finale e rendering nativo indipendente completo letti. I rettangoli L×A hanno lati 120×80 e 240×40 e area comune 9600 nelle coordinate del disegno: A è una sezione, non un diametro. Nella curva x=220+240u e y=840−80u−80u², le variabili fisiche sono s=(x−100)/120 e R=(860−y)/20=s². I punti s=1,2,3 restituiscono R=1,4,9 Ω. Le barre 4,18,11 Ω sono larghe 80,360,220 con origine 150 e scala comune 20 coordinate/Ω. Le origini numeriche sono separate dagli assi. Queste coordinate documentano la verifica, non compaiono come pixel fisici nel percorso studente.

UI del prodotto, verifica del layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Le fixture e l’identità fresh/saved sono controlli della revisione locale; confronto con ROOT integrato e replay canonico dell’integratore restano PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Nessun push o upload durante il vincolo operativo di ROOT.

Verifier SHA256 50737f19b2babdfafa276cc6aa1424cd913c826e2e664ec177af6238e3244d44. Package canonico SHA256 2b21bf8ed8649e3c04e77daf6418ded387347746e5a105fe4058876b44674f5b. Binding canonico SHA256 abf1a5a3ff88ceae454d05547899211ce8eae4fee69a54ad5ccdc4742757f5c9. Report SHA256 9c8c1104122a6f246bea6faadff93ef7916bef75532a8701a7c3b550ba17570f.
