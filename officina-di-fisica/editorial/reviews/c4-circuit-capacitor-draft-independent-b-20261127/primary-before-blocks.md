# Primaria distinta: sette attività circuiti/condensatori

Fonte candidata45af4e31194a07e4b9d9967874ecbaceb49cf106, autoreRoot, revisoreauthor_vectors_b. Fonte originale dello stesso pin. Sono stati estratti soltanto ID, descrizione originale, controllo, unità, consegna di trasferimento e due punti numerici proposti in assessmentSelection. Nessun blocks candidato/manuale Root/valore assessment è stato aperto. Il controllo che il consumer serva davvero questi due punti è PENDING. Non è stato eseguito Chrome né un calcolo automatico.

Disclosure: ho già lavorato su fisica C4 e altri ID del renderer. I sette nuovi ID non contengono mie correzioni. Per L07-01 il contesto originale estratto non specificava il valore numerico di ε₀; Root ha fornito soltanto il dato «ε₀ ≈8,854×10⁻¹²F/m», senza risultati. Uso questo coefficiente arrotondato come dato prescritto; non ne rivendico esattezza fisica assoluta.

## SIM-C4-L06-01

Due resistori fra gli stessi due nodi, primo4Ω, secondoR>0. A tensione comune si sommano le conduttanze:1/R_eq=1/(4Ω)+1/R. Numericamente con R in ohm, R_eq=4R/(4+R)Ω. Primo R4Ω:16/8=2Ω. Secondo R12Ω:48/16=3Ω. Entrambi i valori sono inferiori alla resistenza individuale minore. L’ohmmetro richiede generatore scollegato; non sommare le resistenze come in serie. Inversa al punto3Ω:3(4+R)=4R, quindiR12Ω. Nessuna calcolatrice.

## SIM-C4-L06-02

Resistore ohmico3Ω a temperatura mantenuta, correnteI, convenzione passiva: P=VI=RI². Primo I1A:3×1²=3W. Secondo I3A:3×9=27W. Watt=joule/secondo: si tratta di potenza, non energia senza un intervallo temporale. Raddoppiare I quadruplica P. A I0 il flusso di energia eP sono nulli. Il segno di I non rende negativa la potenza dissipata, anche se questo controllo usa solo correnti nonnegative.

## SIM-C4-L07-01

Piastre nel vuoto, areaA0,01m², bordi trascurati, distanza d positiva. C=ε₀A/d. d2mm=2×10⁻³m dà C=(8,854×10⁻¹²×10⁻²)/(2×10⁻³)F=4,427×10⁻¹¹F=44,27pF. d4mm dà metà:2,2135×10⁻¹¹F=22,135pF. Unità(F/m)m²/m=F;1pF=10⁻¹²F.

L’aritmetica è esatta rispetto al coefficiente decimale assegnato8,854: i passaggi usano soltanto divisioni per2/4 e potenze di dieci. Il coefficiente ε₀ è un’approssimazione fisica;44,27 e22,135 non sono dichiarati misure sperimentali esatte con tutte quelle cifre. La legge suggerisce C inversa di d; quadruplicare d dividerebbe C per4. Il dominio1…8mm evita d0. Va controllata separatamente la formattazione del consumer e la rappresentazione binaria; non copiare eventuali cifre della macchina come nuove costanti fisiche.

## SIM-C4-L07-02

Capacità senza dielettricoC₀1nF, generatore mantenuto aV2V. Materiale lineare omogeneo riempie tutta la regione, κ=ε_r puro; C=κC₀ e |Q|=CV=2κnC. κ2 dà4nC e κ5 dà10nC. Si chiede la quantità su un’armatura: le due armature hanno segni opposti e stesso modulo. Non mantenere Q costante perché il generatore è connesso; la carica aggiuntiva viene dal circuito esterno. Non confondere incremento rispetto aκ1 (2κ−2nC) con carica finale (2κnC).

## SIM-C4-L07-03

Condensatore ideale lineareC2µF, inizialmente scarico. U=∫Vdq=Q_fV_f/2=C V_f²/2. Primo V2V:U=(2×4)/2=4µJ. Secondo V5V:U=(2×25)/2=25µJ. Si elevano al quadrato2 e5; poi il2 della capacità semplifica il mezzo. µF·V²=µJ. V0 dà energia0, non vi sono divisioni per V. Questa è energia del campo; il lavoro totale del generatore in una carica dissipativa richiederebbe contare anche il calore e non è il quesito.

## SIM-C4-L08-01

Due capacità ideali in serie, nodo intermedio neutro e isolato: stesso moduloQ sulle capacità, Vtot=Q/C₁+Q/C₂. C₁2µF, C₂cµF: C_eq=2c/(2+c)µF. c2 dà4/4=1µF; c6 dà12/8=3/2µF=1,5µF, decimale esatto inseribile. La capacità equivalente è minore di ciascuna. Il parallelo darebbe4/8µF e costituisce una topologia diversa, non una commutazione con cariche preesistenti da conservare senza specifiche. Nel dominio c1…8µF tutti i denominatori sono positivi.

## SIM-C4-L08-02

C₁1µF con carica inizialeQ₀, C₂2µF inizialmente scarico. Generatori scollegati, terminali omologhi collegati, si considera il finale a tensione comune dopo il transitorio. Il nodo conserva Q₀:Q₀=(C₁+C₂)V_f. Q₀3µC dà V_f=3/3=1V;Q₀9µC dà9/3=3V. µC/µF=V. Il ramo resistivo/dissipativo o altra giustificazione dell’assestamento va esplicitato per un finale statico; un circuito LC ideale perfettamente isolato non si assesta per sola conservazione della carica. L’energia del campo non resta in generale costante: la carica sì. A Q₀0 anche V_f0, senza divisioni per la carica.

Quattordici risultati primari indipendenti sigillati prima delle candidate chiavi. Test e confronto con codice reale PENDING, UI/humanNOT_RUN, publicationActionNONE, credito0.
