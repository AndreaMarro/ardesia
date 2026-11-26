# Authoring DRAFT — ideal-expansion-entropy-188

Letti individualmente tutti i 16 prompt A188 e le relative opzioni, leggi e vincoli dalla fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-05 SHA256 e8f90aea8c862df7110419c599fbd2b7160d32b370a098146feb303553194378. I sedici compiti speciali e gli ID sono conservati; sono resi espliciti domini dei logaritmi, segni, unità e procedimenti. Riletti i testi reali C3-L01/L06/L07/L10 per temperature assolute, primo principio, percorsi del gas ed entropia. La primaria indipendente dell’integratore non è stata aperta. Il revisore distinto sarà ROOT: nessuna approvazione da questo modulo autore.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-ideal-expansion-entropy-01 — Un raddoppio conta una volta B

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Con B=2 J/K e r=2, quanto vale ΔS in J/K?

Procedimento d’autore: Il rapporto dei volumi è proprio due. Il logaritmo al numeratore coincide con ln 2 al denominatore: il loro rapporto è uno. Il gas aumenta quindi la propria entropia di B=2 J/K. Non occorre assegnare un valore decimale a ln 2, né sapere il percorso reale seguito.

Passaggi: \frac{\ln 2}{\ln 2}=1;  \Delta S=B;  \Delta S=2\,\mathrm{J/K}.

Distrattori: Quattro J/K moltiplicherebbe B per r invece che per ln(r)/ln 2. Zero confonderebbe uguale temperatura con entropia invariata; −2 J/K corrisponderebbe invece al dimezzamento del volume. Il valore di B non è un calore in joule.

Hint: Semplifica prima i logaritmi identici, poi conserva le unità di B.

Fonte canonica SHA256 199a4736ef0488286bb331a7d0af612968f87749ba3fe433fecb90ec8d24ee28. Candidato SHA256 3eb61dc3b23bcdc37c6577ae7ce54c57d46e8f56b360e7a4b548d271ab3633b9. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-02 — Un logaritmo puro non cambia le unità

Per un gas ideale si usa ΔS=B ln(r)/ln 2, con B in J/K e r=V_f/V_i adimensionale. Quale unità esprime ΔS?

Procedimento d’autore: L’argomento del logaritmo è un rapporto fra volumi nella stessa unità, quindi è puro. Anche ln(r)/ln 2 è adimensionale. Moltiplicarlo per B lascia J/K, l’unità di una variazione di entropia. La coincidenza di unità con una capacità termica non rende uguali le due grandezze.

Passaggi: [r]=1;  \left[\frac{\ln r}{\ln 2}\right]=1;  [\Delta S]=\mathrm{J/K}.

Distrattori: J esprime energia, K temperatura, W potenza e m³ volume. Scrivere ln di un volume dimensionato sarebbe diverso da usare ln(V_f/V_i).

Hint: Controlla prima che il rapporto dentro il logaritmo sia adimensionale.

Fonte canonica SHA256 b0b28a1d825417cd30c699d6ed1701963bf6a789a4ec19f8d5fe871364e61ef0. Candidato SHA256 f79f1da60a8ca74ba8de17e7bd7bf72b70767d143c83a35eaae35fdf6ce3305f. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-03 — Gli stessi estremi, due percorsi

Lo stesso campione chiuso di gas ideale collega gli stessi stati di equilibrio I e F, con uguale temperatura assoluta iniziale e finale e V_f>V_i. Un percorso è reversibile e un altro irreversibile. Quale affermazione riguarda correttamente ΔS del gas?

Procedimento d’autore: Entropia è una funzione di stato: una volta fissati gli estremi I e F, ΔS=S_F−S_I non può cambiare scegliendo un altro cammino. Qui r>1 rende ln r positivo, dunque ΔS>0 in entrambi. Cambiano invece trasferimenti e produzione di entropia del processo completo. In una libera espansione isolata il calore reale è nullo, ma questa variazione del gas è positiva.

Passaggi: r=\frac{V_f}{V_i}>1;  \Delta S=\frac{B\ln r}{\ln 2}>0;  \Delta S_{\rm rev}=\Delta S_{\rm irr}.

Distrattori: Reversibile significa produzione totale nulla, non variazione nulla di ogni parte. Aggiungere più entropia al gas soltanto perché il cammino è irreversibile contraddice gli stessi estremi. Q_reale/T non sostituisce l’integrale sul percorso reversibile di confronto; l’espansione dà segno positivo, non negativo.

Hint: Separa differenza di stato del gas e produzione del processo completo.

Fonte canonica SHA256 77b87e71991f32cd99abc09044179fc0aea379962938fe85b1a6743e0b23d318. Candidato SHA256 f6cd6360fe062397b8bef038762b101d2d8bb31da28c322d8fae4c1fb386f160. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-04 — Stesso raddoppio, un campione con B doppio

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Due campioni A e C hanno entrambi r=2. A ha B_A=2 J/K, C ha B_C=4 J/K. Come cambia la variazione del gas?

Procedimento d’autore: Con r=2 il fattore logaritmico vale uno per entrambi. Le variazioni sono perciò 2 e 4 J/K. Il parametro doppio può descrivere una quantità doppia di gas nella seconda preparazione, ma ciascun campione rimane chiuso durante la propria trasformazione. Non si modifica n nel tempo per ottenere questa proporzione.

Passaggi: \Delta S_A=B_A;  \Delta S_C=B_C;  \frac{\Delta S_C}{\Delta S_A}=2.

Distrattori: Un J/K renderebbe inversa la dipendenza da B; otto introdurrebbe un quadrato. Due J/K ignora il diverso campione. Zero non segue dall’uguaglianza delle temperature estreme.

Hint: Il fattore logaritmico resta uno: confronta soltanto i parametri dei campioni.

Fonte canonica SHA256 50a38ce0fde7b014b00c489c64a6ea2c79db83fc3a1d790d9a49953a82df2d8e. Candidato SHA256 34a618dcbcf9af7f18ccaac2ccd1d4f569804dec239d3a15495bb4360598a343. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-05 — Ricavare il parametro del campione

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Si misura ΔS=2 J/K e si conosce r=2. Quanto vale B in J/K?

Procedimento d’autore: Si parte dalla legge, si moltiplica per ln 2 e si divide per ln r. A r=2 i due logaritmi si cancellano e B=ΔS=2 J/K. Il divisore non è nullo: r=1 non sarebbe utilizzabile per identificare B da questa sola misura.

Passaggi: B=\frac{\Delta S\ln 2}{\ln r};  r=2;  B=2\,\mathrm{J/K}.

Distrattori: Quattro J/K moltiplica per r; un J/K divide per r. Nessuna delle due operazioni sostituisce il rapporto di logaritmi. Se r=1, la legge darebbe ΔS=0 per qualunque B e l’inversa qui non sarebbe definita.

Hint: Isola B conservando il rapporto dei logaritmi fino alla sostituzione.

Fonte canonica SHA256 9b16603194b0da26c2b45b313c878e326b4c6274af6ea3d6ae66f8ddce04bd9c. Candidato SHA256 f82b919a42a37061df8ad1f15f2a882edc92284dcc423111dde4f0ea7417ec21. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-06 — Ricostruire il rapporto di volumi

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Con ΔS=2 J/K e B=2 J/K, quanto vale r?

Procedimento d’autore: Dividendo la variazione per B si trova un numero di raddoppi pari a uno. Dalla legge ln r=(ΔS/B)ln 2 si ottiene r=2^(ΔS/B)=2. È un rapporto puro e positivo, non un volume in litri. L’esponenziale fornisce un unico r>0 per ogni rapporto reale ΔS/B.

Passaggi: \frac{\Delta S}{B}=1;  \ln r=\ln 2;  r=2^{\Delta S/B};  r=2.

Distrattori: Uno confonde il numero di raddoppi con il fattore di volume. Quattro comporterebbe ΔS=2B=4 J/K. Un mezzo darebbe −2 J/K, con segno opposto alla misura; r=0 è escluso dal logaritmo e dai volumi positivi.

Hint: Trasforma il numero di raddoppi in un fattore di volume con una potenza di due.

Fonte canonica SHA256 cfae0068dcba9096e7f348d9903a9264cfad58e6284cd110ed3a63f9fc5ac499. Candidato SHA256 ac91b81459f393233b00d7fa79a232f126730bf5b60a94987b6cb2933e793a6b. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-07 — Da un raddoppio a due raddoppi

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. A usa B=2 J/K e r_A=2. C mantiene B e ha r_C=4. Quanto vale ΔS_C/ΔS_A?

Procedimento d’autore: Quattro è due al quadrato, perciò ln 4=2 ln 2. A dà 2 J/K; C dà 4 J/K. Il rapporto è due. Il rapporto dei volumi tra gli estremi è cresciuto da due a quattro, ma la variazione entropica segue il logaritmo di quei numeri.

Passaggi: \ln 4=2\ln 2;  \Delta S_A=2\,\mathrm{J/K};  \Delta S_C=4\,\mathrm{J/K};  \frac{\Delta S_C}{\Delta S_A}=2.

Distrattori: Quattro copia r_C, senza confrontare i logaritmi. Un mezzo capovolge C/A. Uno ignora il secondo raddoppio; −2 darebbe un confronto negativo fra due variazioni positive.

Hint: Riconosci 4=2² prima di formare il rapporto delle entropie.

Fonte canonica SHA256 b59fb5b53467075adff7c45e54e83f35c1023916cdd567ad3248399cf2e72e3f. Candidato SHA256 9f9695d675def95906dacf8f6c8411563a7426323eaccb2a90132b6da1e847ed. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-08 — Una proposta doppia non è il valore corretto

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Con B=2 J/K e r=2, si propone ΔS=4 J/K. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Il valore corretto è B=2 J/K. Lo scarto richiesto è 4−2=+2 J/K, positivo perché la proposta è eccessiva. Il rapporto proposta/corretta è numericamente due ma è puro: non ha le unità della differenza cercata.

Passaggi: \Delta S=2\,\mathrm{J/K};  e=(4-2)\,\mathrm{J/K};  e=2\,\mathrm{J/K}.

Distrattori: −2 J/K inverte l’ordine, quattro copia la proposta, zero l’accetta. Il numero puro due risponde al rapporto e non allo scarto dimensionato.

Hint: Calcola prima il valore fisico e poi conserva l’ordine della sottrazione.

Fonte canonica SHA256 4cfc31b62450afc55a096842a95ec4cd02f9ae4199b595108787386bc6590712. Candidato SHA256 bbbac978d43684a412bc54f34d11939a5ae13d9c25a4cc6b02964f97f010088f. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-09 — L’inversa richiede r diverso da uno

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Sono noti ΔS e r, con r≠1 e ΔS ln r>0, così che il parametro ricavato sia positivo. Quale formula isola B?

Procedimento d’autore: Moltiplichiamo ΔS=B ln r/ln 2 per ln 2, poi dividiamo per ln r. Il risultato è B=ΔS ln 2/ln r. ln 2 è positivo e ln r è non nullo per r≠1. Per una compressione 0<r<1, ΔS deve essere negativa: il rapporto resta B>0. Non si assume che ogni variazione di entropia di un gas debba essere positiva.

Passaggi: \Delta S\ln 2=B\ln r;  B=\frac{\Delta S\ln 2}{\ln r};  r>0;  r\ne1.

Distrattori: Scambiare i logaritmi non inverte la moltiplicazione originaria. Il reciproco ha K/J invece di J/K. Mettere anche ln 2 al denominatore cambia il fattore costante. Sommare ΔS e ln r mescola una grandezza dimensionata e un numero puro.

Hint: Distingui il dominio del logaritmo r>0 da quello dell’inversa r≠1.

Fonte canonica SHA256 e8cbb158cbc3eaeebc9f6f8ab9457dddc9374dbb75101de6ed20a7e988aaa9d7. Candidato SHA256 4f14714ba49f791b100a42544082c64650d7e686e485c6cab3cc1698ff5f8820. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-10 — Scalare un argomento non scala il suo logaritmo

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Le prove A e C hanno B_C=κ₁B_A e r_C=κ₂r_A, con κ₁,κ₂>0, r_A>0 e r_A≠1. Quale legge generale dà ΔS_C/ΔS_A?

Procedimento d’autore: Sostituiamo entrambi i cambiamenti: ΔS_C=κ₁B_A ln(κ₂r_A)/ln 2. Nel rapporto si cancellano B_A e ln 2, ma non il logaritmo dell’argomento nuovo. Resta κ₁ ln(κ₂r_A)/ln r_A. La base A non può avere r_A=1 perché in quel caso ΔS_A=0; se κ₂r_A=1, invece, il numeratore si annulla lecitamente e il rapporto è zero.

Passaggi: \Delta S_C=\frac{\kappa_1 B_A\ln(\kappa_2r_A)}{\ln 2};  \frac{\Delta S_C}{\Delta S_A}=\kappa_1\frac{\ln(\kappa_2r_A)}{\ln r_A}.

Distrattori: κ₁κ₂ tratta il logaritmo come una funzione lineare del rapporto di volumi. κ₁/κ₂ gli attribuisce una dipendenza inversa. La frazione dei logaritmi capovolta cambia il confronto e non è neppure definita quando r_C=1; la somma non segue dal modello e darebbe due per prove identiche.

Hint: Sostituisci i fattori dentro ln prima di cancellare i termini comuni.

Fonte canonica SHA256 61bb38d7ce61a208d2638f28b7cc76cdf76dbf26550bea710f1f7a21c00c21bd. Candidato SHA256 2a320f7d5ef807d55f7a60ce2ae7ec7d66bbc389b047a24ad578b2ff01332a2b. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-11 — Due raddoppi con un campione più grande

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. A ha B_A=2 J/K e r_A=2. C ha B_C=4 J/K e r_C=4. Quanto vale ΔS_C/ΔS_A?

Procedimento d’autore: A dà 2 J/K. C ha parametro 4 J/K e due raddoppi di volume, dunque ΔS_C=4·2=8 J/K. Il rapporto 8/2=4 contiene un fattore due dal parametro del campione e un altro dal numero di raddoppi. Non proviene dal quadrato della quantità di gas.

Passaggi: \Delta S_A=2\,\mathrm{J/K};  \Delta S_C=(4\,\mathrm{J/K})\cdot2;  \Delta S_C=8\,\mathrm{J/K};  \frac{\Delta S_C}{\Delta S_A}=4.

Distrattori: Due considera un solo cambiamento. Otto copia il numero della variazione C senza dividerlo per quella A; un quarto è il reciproco del confronto richiesto. La stessa temperatura iniziale e finale non annulla nessuna delle due variazioni.

Hint: Ricostruisci il numero di raddoppi di ciascuna prova prima del rapporto.

Fonte canonica SHA256 56fd8788973e4af6c593d8b498544e94067826f165708bffa745174c170b1c25. Candidato SHA256 e2978a403d2a42f42f2b942823359a2338b4278f394f48494df460eeaa9b3023. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-12 — Media delle variazioni, non dei parametri

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. A ha B_A=2 J/K, r_A=2; C ha B_C=4 J/K, r_C=4. Qual è la media aritmetica delle due ΔS, con uguale peso?

Procedimento d’autore: Le due letture sono 2 e 8 J/K. La metà della somma è 5 J/K. Gli ingressi medi sarebbero B=3 J/K e r=3: il modello darebbe 3 ln 3/ln 2 J/K, che si lascia esatto. Non è uguale a cinque: l’uguaglianza richiederebbe ln 27=ln 32, ma 27≠32. Non serve stimare alcun logaritmo.

Passaggi: \overline{\Delta S}=\frac{2+8}{2}\,\mathrm{J/K};  \overline{\Delta S}=5\,\mathrm{J/K};  3\ln 3=\ln 27;  5\ln 2=\ln 32;  27\ne32.

Distrattori: Dieci J/K non dimezza la somma; 5/2 la dimezza due volte; quattro ignora il confronto delle due letture. 3 ln 3/ln 2 applica il modello ai dati medi, operazione non richiesta e qui non equivalente.

Hint: Media i due risultati già calcolati e lascia esatti eventuali confronti logaritmici.

Fonte canonica SHA256 c8e3b0cfda3ec01890bbdad4de96cca6b82dc3b6bb9b379fbb0d881dc0611210. Candidato SHA256 32a8715bbcce58f392cec59d06aa4ae2bf9ef0236c509124f29c85612aa696eb. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-13 — Il bersaglio sull’entropia e il rapporto di volumi

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. A ha B_A=2 J/K, r_A=2. C ha B_C=4 J/K e deve avere ΔS_C=4ΔS_A. Quanto vale r_C/r_A?

Procedimento d’autore: Il bersaglio è 4·2=8 J/K. Dividendo per B_C=4 J/K si trovano due raddoppi: ln r_C/ln 2=2. Dunque r_C=2²=4 e il rapporto richiesto è 4/2=2. Il parametro B è cambiato tra campioni, ma i volumi di ogni campione restano gli estremi della propria trasformazione chiusa.

Passaggi: \Delta S_C=8\,\mathrm{J/K};  \frac{\ln r_C}{\ln 2}=2;  r_C=4;  r_C/r_A=2.

Distrattori: Quattro copia il bersaglio o r_C, non il rapporto r_C/r_A. Un mezzo inverte il confronto; uno darebbe soltanto 4 J/K. Non si può far passare il fattore quattro attraverso il logaritmo come un moltiplicatore dell’argomento.

Hint: Trasforma l’entropia bersaglio in numero di raddoppi, poi torna al rapporto dei volumi.

Fonte canonica SHA256 9b1949474f2b061ad4076a4868e44f0989834ae510c380134e371fdb8dba7a81. Candidato SHA256 e549732152ba8ce74669eec94b9353d212d2d7e5981691150808a68e90653dc1. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-14 — Il display si tara su una variazione nota

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. Il display continuo adimensionale è D=qΔS, q>0. Il riferimento B=2 J/K e r=2 dà D=6. Una nuova prova ha r=4 e D=24. Quanto vale B della nuova prova in J/K?

Procedimento d’autore: Il riferimento ha ΔS=2 J/K, quindi q=6/(2 J/K)=3 K/J. La nuova lettura indica ΔS=24/q=8 J/K. A r=4 ci sono due raddoppi: dividendo 8 J/K per due si ottiene B=4 J/K. Guadagno dello strumento e parametro termodinamico sono grandezze diverse.

Passaggi: q=3\,\mathrm{K/J};  \Delta S_C=8\,\mathrm{J/K};  \frac{\ln 4}{\ln 2}=2;  B_C=4\,\mathrm{J/K}.

Distrattori: Dodici J/K usa D=24 come variazione senza togliere q. Otto J/K si ferma alla variazione invece di dividere per due; due J/K conserverebbe il riferimento e predirebbe D=12, non 24.

Hint: Decodifica prima ΔS dal display e poi dividi per il numero di raddoppi.

Fonte canonica SHA256 a9d350625eff368f93af6f36aaf4442795ce027de3c5f79d9df95452b369b81c. Candidato SHA256 22874f1dca1c5fb2a4ff3448c1899cc3f2f68413ab13e808387b6ae33f8aa60a. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-15 — Guadagno e offset prima del parametro del gas

Un campione chiuso di gas ideale ha stati iniziale e finale di equilibrio alla stessa temperatura assoluta T>0. La quantità n resta fissata entro ciascuna trasformazione. Si definiscono r=V_f/V_i>0 e B=nR ln 2>0, in J/K. La variazione di entropia del gas è ΔS=B ln(r)/ln 2. Questa è una differenza fra stati: si può calcolarla con un percorso reversibile ausiliario, senza identificare il calore di quel percorso con il calore effettivo di un processo irreversibile. B diverso fra prove significa campioni o preparazioni diversi, non ingresso di materia nello stesso gas chiuso. D=qΔS+b è un display continuo adimensionale, q>0. Riferimento A: B_A=2 J/K, r_A=2, D_A=5. Riferimento C: B_C=4 J/K, r_C=4, D_C=17. Prova E: r_E=2, D_E=9. Quanto vale B_E?

Procedimento d’autore: Le variazioni dei riferimenti sono 2 e 8 J/K. Il guadagno è (17−5)/(8−2)=2 K/J; dal primo riferimento b=1. La prova E dà ΔS_E=(9−1)/q=4 J/K. Poiché r_E=2 conta un solo raddoppio, il parametro cercato è B_E=4 J/K.

Passaggi: q=2\,\mathrm{K/J};  b=1;  \Delta S_E=4\,\mathrm{J/K};  B_E=4\,\mathrm{J/K}.

Distrattori: 9/2 J/K omette l’offset e, reinserito nel display, predice dieci anziché nove. Otto J/K toglie b ma non divide per q. Due e tre J/K predicono rispettivamente D=5 e D=7, diversi dalla lettura E.

Hint: Sottrai l’offset prima del guadagno; solo dopo usa r della nuova prova.

Fonte canonica SHA256 69603ebe0f12ab756e534e024ef3d64bf688ad1a21bf478cc5f0290d37ee938f. Candidato SHA256 21ccd05f9dce85cab7736469f57797311e18dfa4cd98a3f760b07973ba67458b. Revisione indipendente e human NOT_RUN.

## AR-u5-ideal-expansion-entropy-16 — Due tappe: variazione del gas e aumento dell’insieme

Lo stesso campione chiuso di gas ideale compie due tappe. Prima raddoppia il volume mediante espansione isoterma reversibile con una sola sorgente a temperatura T>0. Poi, dentro un recipiente totale rigido e isolato, si espande liberamente nel vuoto quadruplicando il nuovo volume. La sorgente interviene soltanto nella prima tappa e i dispositivi meccanici ideali non producono entropia. Fra gli stati iniziale e finale del gas si misura ΔS_gas=12 J/K. Si forniscono ΔS=nR ln(V_f/V_i) per estremi alla stessa temperatura e B=nR ln 2. Quanto aumenta l’entropia del gas più la sorgente?

Procedimento d’autore: La prima tappa aumenta l’entropia del gas di B. La libera espansione successiva ha Q=0 e W=0; per un gas ideale l’energia interna dipende solo da T, quindi gli stati di equilibrio estremi hanno ancora la stessa temperatura. Il fattore quattro dà ln 4=2 ln 2 e aumenta l’entropia del gas di 2B. In totale il gas guadagna 3B=12 J/K: B=4 J/K. La sorgente perde soltanto B=4 J/K durante la prima tappa reversibile. Sommando le parti, 12−4=8 J/K: è la produzione della libera espansione isolata, non il calore scambiato dal gas.

Passaggi: \Delta S_1=B;  \Delta S_2=2B;  3B=12\,\mathrm{J/K};  B=4\,\mathrm{J/K};  \Delta S_{\rm sorg}=-4\,\mathrm{J/K};  \Delta S_{\rm insieme}=8\,\mathrm{J/K}.

Distrattori: Zero estende erroneamente la reversibilità alla libera espansione. Quattro J/K è il guadagno della prima tappa e il modulo perso dalla sorgente; sei dimezza il dato del gas senza bilancio. Dodici J/K ignora la perdita della sorgente. Q=0 nella seconda tappa non impone ΔS_2=0.

Hint: Conta i raddoppi nelle due tappe e poi somma gas e sorgente con i segni.

Fonte canonica SHA256 063b89aff1e471e1ebd9977558228f9e03da573c5b2cf22f32c0872aa2d98de1. Candidato SHA256 a3582531c7580faa9b0724b93ca38f7932b969a85453bc1511501130ed09e258. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 76458603b4e1ac32d5c3a2c1b9163d35166b393987f7eef35694f5fdba6e9d72. Package file SHA256 141f3cc4a5ffcd08679b19c333c704c96e63b052c6cf4aff6fefc7d9e750b0f3. Binding file SHA256 fad1da4b987bac483ff7cd95d2cfc1ad9beff94a57fc03f9faab2f72dcb3823e. Prova strutturale SHA256 5dc7fd4c524bb6c60a6bc0cefbe0609ea144518f39e7e7fcbcca33eb5957f5a2. Asset-only manifest SHA256 0eb37fcbe6c70156203d41ec1e373caf019c71d746529239793006499442fb5b.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Controlli di dominio e manualità del lotto

Il modello base ammette r>0: espansione, r=1 e compressione hanno variazioni positiva, nulla e negativa. L’inversa per B richiede r≠1 e compatibilità del segno ΔS ln r>0; il rapporto di due variazioni richiede r_A≠1, mentre r_C=1 può dare un numeratore nullo. Per passare dal numero di raddoppi al rapporto di volume si usa r=2^(ΔS/B), senza valutazioni decimali. Nel confronto della media, 3 ln 3/ln 2≠5 si prova esattamente mediante 27≠32.

Cambi di B nei confronti significano preparazioni o campioni diversi; n è costante in ciascuna trasformazione chiusa. Il caso 16 conserva il campione in entrambe le tappe: libera espansione isolata Q=W=0 e gas ideale danno temperatura finale uguale all’iniziale; la variazione del gas resta positiva. La sorgente compare soltanto nella tappa reversibile e il totale include la sua perdita con segno. Non si calcola Q reale usando impropriamente TΔS per la tappa irreversibile.

Geometria intrinseca: volumi 1 L e 2 L a sezione comune hanno larghezze 100 e 200. Le barre delle prove 2, 8, 5 J/K hanno larghezze 90, 360, 225, una sola scala 45 coordinate/(J/K). Le barre con segno del caso 16 hanno lunghezze 300, 100, 200 per +12, −4, +8 J/K, una sola scala 25. Le scale appartengono alla sorgente SVG e non sono presentate come pixel fisici dopo ridimensionamento. Rendering nativo integrale osservato con exit 0 sotto mutex, label e origini libere; UI del prodotto NOT_RUN.
