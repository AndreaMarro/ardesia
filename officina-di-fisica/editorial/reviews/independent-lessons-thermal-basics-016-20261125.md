# Revisione indipendente AI — lessons-thermal-basics-016

Scoperti e letti i veri ID **C3-L01..C3-L04**, non C3-L001..004: nessuna rinumerazione o sostituzione di fonte. Tutti esistono come lezioni versione1 in `officina-di-fisica/content/C3.json` alla revisione Git `5d1dc8dc7b601aef959d10d564c75462be74708d`. Riscontrati anche `ACCOUNTED/NOT_RUN` nel checkpoint letto `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`.

Letti integralmente **29 blocchi**, tutte le formule, testo e didascalie e quattro SVG originali, sia XML sia anteprime individuali complete. Revisore AI separato dall'autore storico; nessun modulo di authoring, chiave o vecchio flag di revisione usato come oracolo. **4 originali PASS, 0 FAIL, 56 controlli esatti**, SymPy1.14.0, Pint0.25.2 e frazioni. Sei test PASS. Nessuna fonte, figura, candidato, registro, checkpoint o runtime modificati. `humanApproval=NOT_RUN`, `publicationAction=NONE`, originali conservati. Le prove costruite dal revisore sono distinte dai calcoli effettivamente richiesti dal materiale.

SHA256 del file sorgente Git: `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0`.

| ID canonico | SHA256 canonico dell'intero record letto | Esito / controlli |
|---|---|---|
| C3-L01 | `45fc983887bd650ee8ab45f9482fd00b1823a95a53dc3cc84ded01cbbe064eef` | PASS / 10 |
| C3-L02 | `a5e5291a81721079a6c08422baca89b59539532f3a11211ea339353799e95a67` | PASS / 15 |
| C3-L03 | `1201fe443d15dbdc0b64d6a62d1376f68d429812aa29e76530c6b56324e1e5c3` | PASS / 16 |
| C3-L04 | `cd25cb01f21086c43a8a332874c5e01dcb10c9062e9d26411387e5d8c3d292a3` | PASS / 15 |

## C3-L01 — confine, stato, equilibrio e temperatura

Controllati scelta del sistema e dell'ambiente prima dei bilanci, confine mobile del gas nel pistone, differenza fra chiuso/aperto/isolato, materia rispetto a energia, equilibrio di un gas semplice a composizione fissata, funzioni di stato, contatto termico e termometro. Un sistema chiuso può ricevere o cedere energia senza scambiare materia. Un sistema isolato non scambia né materia né energia; non deduco il contrario dal solo fatto che i contenuti rimangano invariati, perché flussi opposti potrebbero compensarsi. Le classificazioni sono state lette e giudicate concettualmente, senza spacciare un'identità0=0 per prova del loro significato.

Una funzione di stato ha variazioni che si sommano a zero su un ciclo: `(Ub−Ua)+(Uc−Ub)+(Ua−Uc)=0`. Non applico questa proprietà al calore o al lavoro come se fossero contenuti dello stato.

La conversione Celsius–kelvin ha offset esatto273,15=5463/20, a differenza di un'approssimazione di una costante tabulata. La [definizione SI e il riferimento Celsius riportati dal NIST](https://www.nist.gov/pml/special-publication-330/sp-330-section-2) sono coerenti con la formula sorgente. Le differenze cancellano l'offset, quindi un intervallo1°C vale1K. I rapporti termodinamici richiedono temperature assolute positive, non numeri Celsius.

**Prove costruite dal revisore**, non esercizi assegnati:20°C=5863/20K=293,15K;35−20°C=15K. Per40°C e20°C il rapporto assoluto è6263/5863, non2. Temperature Celsius−73,15 e126,85 corrispondono a200 e400K e danno rapporto2. Le frazioni esatte bastano; nessuna divisione decimale lunga è necessaria. Un cambiamento11−7=4J illustra soltanto un possibile scambio energetico di sistema chiuso, non un dato della lezione.

`C3-confine.svg`: gas dentro il contorno tratteggiato, pistone mobile a destra, ambiente fuori; calore verso la parete sinistra e lavoro uscente tramite pistone. Testo e figura consentono scambi di energia attraverso un confine chiuso alla materia. Le frecce indicano il verso del trasferimento, non forze o quantità di energia misurabili dai pixel.

## C3-L02 — gas ideale, moli e precisione del coefficiente

Controllati urti e pressione, quantità di gas costante durante il confronto isotermo, equazione pV=nRT, pressione e temperatura assolute, unità SI, significato della mole, rapporti fra stati, eventuale variazione di n attraverso una valvola, limiti di gas diluito lontano dalla condensazione e manometro relativo. Non si impone una conservazione di n se il sistema perde gas.

Derivazione indipendente: pressione dal flusso di quantità di moto `pV=N m<v²>/3`; energia traslazionale isotropa `<v²>=3kT/m` dà pV=NkT. Sostituire N=nNA dà nRT. Pa·m³=J e nRT ha le stesse dimensioni. A n,T fissi, volume dimezzato raddoppia p; a n,V fissi, raddoppiare T assoluta raddoppia p; dimezzare n a V,T fissi dimezza p. La differenza fra pressione relativa e assoluta non è ignorata: un controllo con20kPa relativi e100kPa atmosferici dà120kPa assoluti.

**Precisione letta senza nasconderla:** la sorgente stampa R=8,314J/(mol·K). È il consueto valore tabulato di lavoro a quattro cifre significative; non lo certifico come valore SI esatto. Dai valori esatti NA e k della [definizione SI NIST](https://www.nist.gov/pml/special-publication-330/sp-330-section-2) ricavo con interi e frazioni

`R_SI=8,31446261815324=207861565453831/25000000000000 J/(mol·K)`.

Arrotondare alla millesima dà correttamente8,314. La differenza esatta è `11565453831/25000000000000`, cioè0,00046261815324, e **non viene posta uguale a zero** nel verificatore. È inferiore a metà unità dell'ultima cifra stampata,0,0005. La lezione non chiede un risultato che richieda più precisione e non presenta un prodotto numerico arrotondato come identità esatta fra ingressi assegnati, come nel distinto precedente E003. Non classifico questa normale costante tabulata finita come un nuovo errore fisico; la precisione di lavoro e il valore SI esatto restano esplicitamente separati nella review. Gli usuali rapporti a n fisso eliminano inoltre R.

**Prova del revisore** con il coefficiente di lavoro esplicitamente stampato: n=1/10mol, T=250K, p=100000Pa danno `V=(4157/500)·25/100000=4157/2000000m³=4157/2000L`. Si può lasciare la frazione o scrivere2,0785L, esatto rispetto ai dati di questo modello di lavoro; non è una pretesa di esattezza fisica illimitata. Nessun decimale obbligatorio richiede calcolatrice nel materiale originale.

`C3-isoterma.svg`: origine grafica(72,211), A(150,85), B(306,169). Rettangoli di lati78×126 e234×42 hanno entrambi area9828px². Tutti119 vertici della curva seguono `y=211−9828/(x−72)` entro0,05px di arrotondamento verticale. Non invento valori fisici o scale per p e V; la figura illustra correttamente la stessa isoterma di gas chiuso, con prodotto pV costante.

## C3-L03 — calore, capacità, calorimetria e gas

Verificati calore come trasferimento per differenza di temperatura, temperatura come variabile di stato, dipendenza da materiale/quantità/percorso e distinzione fra capacità del campione C, calore specifico c e capacità molari dei gas. La sorgente qualifica C circa costante nell'intervallo e vieta transizioni di fase nella formula sensibile; questo dominio non viene rimosso. Integrare C=mc costante dà `Q=mc(Tf−Ti)`. Un corpo che si raffredda ha DeltaT negativo e Q negativo per capacità positiva.

**Prove del revisore**: massa1/2kg, c=400J/(kg·K) danno C=200J/K; raffreddamento di10K dà Q=−2000J. C si misura in J/K, c in J/(kg·K), Cp/Cv molari in J/(mol·K). Le temperature finali nei calcoli su coordinate Celsius sono espresse in°C, mentre le variazioni sono in K: non sono confuse con una temperatura assoluta zero.

Per calorimetro isolato, lavoro e capacità del contenitore trascurati secondo il testo, risolvo `C1(Tf−Th)+C2(Tf−Tc)=0`: `Tf=(C1Th+C2Tc)/(C1+C2)`. Con Th>Tc e capacità positive, le differenze dal freddo e dal caldo sono rispettivamente `C1(Th−Tc)/(C1+C2)>0` e `C2(Th−Tc)/(C1+C2)>0`: il limite fra le temperature iniziali è dimostrato e non controllato solo sul risultato di una fixture.

**Prova del revisore**: Ccaldo=200J/K a80°C, Cfreddo=100J/K a20°C danno Tf=60°C, calori−4000 e+4000J. Se aggiungo contenitore da100J/K inizialmente a20°C, il calcolo completo dà50°C: il recipiente non può essere assorbito tacitamente nel nulla se la sua capacità è rilevante.

Per gas ideale a composizione fissata e sole condizioni di lavoro pV, parto da U=nCvT nel modello a Cv costante e da H=U+pV=U+nRT. Derivare H rispetto a T dà Cp=Cv+R. A volume fisso non c'è lavoro di espansione, quindi QV=nCvDeltaT. A pressione fissa si aggiunge pDeltaV=nRDeltaT, dando Qp=nCpDeltaT. Le formule finite conservano l'approssimazione di capacità costante e non sono estese a un intervallo con variazioni importanti senza integrale.

`C3-scambi.svg`: corpo caldo a sinistra, freddo a destra, freccia di energia fra loro completamente interna all'involucro isolante. Il bilancio Qcaldo+Qfreddo=0 riguarda l'insieme; i due corpi singolarmente scambiano energia con segni opposti. Nessuna misura di capacità o energia è ricavabile dalla lunghezza della freccia.

## C3-L04 — plateau, massa trasformata e bilancio a tratti

Letti equilibrio di ghiaccio puro/acqua a pressione atmosferica, temperatura vicina a0°C durante coesistenza, energia che cambia la frazione liquida, modulo del calore latente, segni dei processi inversi, massa effettivamente trasformata, tre stadi del riscaldamento, potenza costante e possibile raffreddamento per evaporazione superficiale sotto ebollizione. Non si assume che qualunque liquido evapori solo al punto di ebollizione né che il raffreddamento sia inevitabile in presenza di riscaldamento esterno.

Il modulo `|Qfase|=mtrasformata L` ha unità J per L in J/kg. Fusione/vaporizzazione richiedono energia; solidificazione/condensazione la cedono. Integro separatamente mc_s dT fino a Tfus e mc_l dT dopo, aggiungendo mLf fra i due. La formula completa richiede che l'energia basti a fondere tutta la massa e a portare il liquido sopra Tfus. Se resta una parte della fase iniziale, il calcolo deve fermarsi alla frazione trasformata e alla temperatura di coesistenza.

**Prove costruite dal revisore**, con parametri giocattolo assegnati e non presentati come proprietà precise dell'acqua: m=1kg, cs=2000,cl=4000J/(kg·K), Lf=300000J/kg, Tfus=0°C, Ti=−10°C. Servono20kJ per arrivare alla fusione,300kJ per fondere e40kJ per scaldare il liquido fino a10°C: totale360kJ. Un budget170kJ consente, dopo i20kJ iniziali, fusione di150000/300000=1/2kg e temperatura ancora Tfus. Un budget340kJ lascia20kJ dopo la fusione e termina a5°C. A potenza termica costante500W il tratto latente300000J dura600s; il tempo è proporzionale al calore effettivamente fornito. Congelare1/2kg nello stesso modello dà Qsistema=−150000J. Questi casi avversi controllano realmente la soglia di fusione completa senza assegnare al testo un esercizio che non contiene.

`C3-fasi.svg`: ascissa Q, ordinata T; tratto crescente del solido, plateau da(196,125)a(364,125), crescita del liquido dopo la fusione completa. Il riferimento Tfus coincide con il plateau. Non c'è calibrazione numerica di assi, calori specifici o latent heat, e l'origine dell'asse non è etichettata0°C: la quota grafica del plateau non è un errore di temperatura Celsius.

## Integrità, risultati e limiti

Quattro asset originali confrontati byte per byte con Git e copie locali:

- C3-confine.svg: `60305e8f10320fd9030f3ac8a7b3a7d7ba25adbff8489be42e864d1e06ff39f4`.
- C3-isoterma.svg: `f2b86e9001fe906ef43b1f6b54c3af3908e51e2ea3b3bdf9930aeafda5c00e47`.
- C3-scambi.svg: `5fe72c5b200c4e14ad3db3c88469737cf19a1aca4b1516c9c391b025dc6f9c8f`.
- C3-fasi.svg: `59316774d57a882676062fc86650c6a080c6aebda3180da2e5aaf83fc6940828`.

**6/6 test PASS, exit0,1,117s**: ID canonici a due cifre, identità e riproducibilità di tutti i record, confronti reali con Git, rifiuto di ciascuna fonte alterata o omessa e ciascun asset assente o modificato. Verificati anche coefficiente arrotondato diverso da valore SI esatto, temperature finali con unità corrette, budget parziale e tutti119 vertici dell'isoterma rispetto alla curva teorica e ai rettangoli uguali. I report originali/effective coincidono: nessuna nuova edizione necessaria per questi quattro record entro le ipotesi lette.

Il giudizio è AI e circoscritto alle edizioni precisamente lette. Non certifica altri record, un esito con studenti, accessibilità generale, UI browser o pubblicazione. Le frasi storiche «revisione assistita/controllo strutturale» non sono state assunte come prove della correttezza. Nessuna approvazione umana o nuova autorizzazione di rilascio è implicata.

- Verificatore SHA256: `de62c2bbe57f9330ffa050eb34285c0cbd15945afa2a980ddb6195f8483aba14`.
- Test SHA256: `9e143737e406df5013857932c5f8b58d68df01e9c1e6f40b1ea203995d28de2f`.
- Entrambi i report SHA256 file: `dab22f8d91b5e66086a0f2e0b5c2c2ddcf2bff71e07ab2119f47ab40e7278dc9`.
- Digest canonico JSON di ciascun report: `05a444a18e2cfd4c694b7bc50a6f5202cbcf4e723b7bedbf70e131172a620e7c`.
- Contratto SHA256 letto dai report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.
