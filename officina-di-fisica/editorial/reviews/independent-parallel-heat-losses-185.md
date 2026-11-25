# Revisione indipendente parallel-heat-losses-185

Primaria completa degli 80 prompt originali U5-04 salvata prima di candidati, opzioni o chiavi: primary-thermal-transport-183-187-before-candidates-20261125.md, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. I messaggi di consegna hanno anticipato soltanto SHA, percorsi e ipotesi generali, senza risultati. Nessun modulo d’autore importato o usato per le derivazioni.

Poi sono stati letti individualmente tutti i 16 prompt finali, tutte le opzioni, ogni blocco, formula, hint, feedback, metadato e didascalia. Le leggi, i numeri e i domini finali sono stati ricalcolati separatamente. Package e binding ROOT sono byte-identici al pin finale B 9f0907273410a8cf981acf1e1a441a046bc84b18; non si congela una versione precedente. Il catalogo reale C3-L01/L05/L06/L09/L10 è stato riletto: scala assoluta per radiazione ed entropia, vie di trasferimento e distinzione fra variazione di una parte e produzione totale. La competenza primaria effettiva è C3-L05.

Gli oracoli derivano le leggi e le inverse con SymPy, verificano unità con Pint/Fraction e mantengono calcoli razionali esatti. La quarta e quinta radice dei casi numerici si riconoscono tramite potenze intere perfette; nessuna valutazione a calcolatrice o approssimazione logaritmica è necessaria. Le alternative simboliche sono confrontate come leggi generali: una coincidenza per parametri particolari non rende corretta una falsa legge. Non si attribuisce PASS dalla sola chiave o da dichiarazioni dell’autore.

## Lettura e prova individuale

### AR-u5-parallel-heat-losses-01

Due percorsi distinti e diretti fra le stesse temperature hanno conduttanze in parallelo: G_tot=5 W/K+h·1 m². Con h=5 W/(m² K) e ΔT=10 K: P=(5+5)·10=100 W, 50 W per percorso.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 50 W omette un percorso;25 W pone in serie due resistenze1/5 K/W;2500 avrebbeW².

Esito indipendente esatto: 100. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-02

P è potenza W. Una conduttanza è W/K e il coefficiente superficiale h è W/(m² K): occorre l’area prima di sommare con 5 W/K. Le alternative candidate sono state poi lette integralmente: unica unità compatibile W.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: G haW/K e hW/(m² K); solo dopo hA e ΔT si ottieneW.

Esito indipendente esatto: W. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u5-parallel-heat-losses-03

Formula fisica P=[G_s+hA]ΔT, G_s=5 W/K e A=1 m². Nei valori numerici dichiarati P[W]=(5+h[W/(m² K)])ΔT[K]. Non si sommano resistenze in serie perché i percorsi sono distinti.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: G+h non è somma omogenea;GhAΔT haW²/K;ΔT/(G+hA) haK²/W;divisione perΔT haW/K².

Esito indipendente esatto: P = (G + h A) ΔT. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-parallel-heat-losses-04

h=5 fisso: G_tot=10 W/K; ΔT da 10 a 20 K porta P da 100 a 200 W. La relazione è lineare a conduttanze costanti.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 50 rende inverso il salto;400 usa quadrato;150 raddoppia un solo ramo.

Esito indipendente esatto: Da 100 a 200 W. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-05

ΔT=P/(G_s+hA)=100/(5+5)=10 K. Il denominatore positivo è una conduttanza, non una resistenza.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 20 K ignora convezione;100 copia il numero deiW senza conduttanza.

Esito indipendente esatto: 10. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-06

h=(P/ΔT−G_s)/A=(100/10−5)/1=5 W/(m² K). Per il ramo h>0 occorre P>G_sΔT.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 10 attribuisce a h anche il sostegno;15 somma G invece di sottrarre; h≤0 viola il ramo.

Esito indipendente esatto: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-07

A: P=100 W; B a ΔT=10 K e h=10 dà P=150 W. Rapporto 3/2, non 2, perché il sostegno mantiene 5 W/K.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 2 segue solo convezione;2/3 inverte il totale;1 ignora il cambiamento.

Esito indipendente esatto: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-08

Proposta 200 W−corretto 100 W=+100 W. Non si cambia il segno della dispersione fisica positiva.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: −100 inverte ordine;200 copia proposta;0 la accetta;2 è rapporto puro.

Esito indipendente esatto: 100. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-09

Raccogliere ΔT dà ΔT=P/(5 W/K+h·1 m²). Le due conduttanze sono positive e il risultato è in K.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: P/G oP/(hA) omettono un percorso;reciproco dàK⁻¹;P/(GhA) dàK²/W.

Esito indipendente esatto: ΔT = P / (G + h A). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-parallel-heat-losses-10

P_B/P_A=κ₁(G_s+κ₂hA)/(G_s+hA). Nei numeri assegnati κ₁(5+κ₂h)/(5+h). Il sostegno non si scala con κ₂.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: G non viene scalato:κ₁κ₂ lo cambierebbe;omissioneκ₁ perde il salto;ultimo inverte conduttanze.

Esito indipendente esatto: κ₁ (G + κ₂ h A)/(G + h A). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-parallel-heat-losses-11

A=100 W; B con ΔT=20 K e h=10 dà (5+10)20=300 W. Rapporto 3.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 4 presume due raddoppi su tutto;2 segue salto;3/2 segue conduttanza;1/3 è reciproco.

Esito indipendente esatto: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-12

Media (100+300)/2=200 W. Ingressi medi 15 K e 15/2 W/(m² K) darebbero (25/2)15=375/2 W; differenza 25/2 W.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 375/2 W usa dati medi;400 non dimezza;100 e300 ignorano una prova.

Esito indipendente esatto: 200. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-13

Bersaglio 300 W a ΔT=20 K richiede G_tot=15 W/K; h_BA=10 W/K, h_B=10 e rapporto con h_A=5 pari a 2.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 3 copia potenza e3/2 conduttanza;1/2 inverte coefficiente; nessuno soddisfa300 W.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-14

A=100 W, S=300 implica a=3 W⁻¹. Nuova lettura 900 dà 300 W. Con h=10 la conduttanza totale è 15 W/K, ΔT=20 K.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 900/15=60 K trascura guadagno3;300/10=30 K trascura nuova h.

Esito indipendente esatto: 20. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-15

a=(601−201)/(300−100)=400/200=2 W⁻¹, b=1. S_C=401 dà 200 W; a h=5 la conduttanza totale 10 W/K dà ΔT_C=20 K.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 401/20 omette offset e predice402;40 non divide perq;200 copiaW.

Esito indipendente esatto: 20. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-parallel-heat-losses-16

Vincolo numerico ΔT=2h fra preparazioni, coefficiente con unità m²K²/W. P=2h(5+h)=100 implica h²+5h−50=0=(h−5)(h+10). Radici 5 e −10; soltanto h=5 W/(m² K) è positivo e dà ΔT=10 K.

Ipotesi: Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.

Distrattori e controprove: −10 rende h e salto negativi;10 produce300 W;50 produce5500 W; radici fisiche una sola.

Esito indipendente esatto: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti delle prove

XML e PNG nativo integrale letti. Due percorsi diretti fra stesso corpo e ambiente con frecce separate; schema non geometria delle resistenze. Barre50+50=100W larghezze175+175=350; confronto100/300/200W larghezze120/360/240. Ogni pannello ha scala propria dichiarata tramite valori fisici, zeri staccati dagli assi e nessuna misura di pixel effettivi.

Cinque rendering nativi Quick Look realmente terminati con exit 0, sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB; PNG integrali letti, XML e log conservati. Queste sono prove asset-only, non un replay del prodotto o del layout a 320 px. Tutta UI del prodotto rimane NOT_RUN in questo perimetro; nessun marker inventato o riusato. Nessuna modifica a candidati, runtime, registro, checkpoint o Git ROOT.

## Provenienza congelata

Verifier SHA256 4036e32b4512ec9c419dafbbc2e0fd58e528daedea0b0834e6d3e2ad008a25e9. Package canonico SHA256 fb8df8032a68bc7f995229103b8423f89e4527d60538c100f7ddb36befd3ac86. Binding canonico SHA256 c3514e94d659bb657f35d6846d39d4c9c4f1d2438f08bdb46e52ff7b6fef049c. Report SHA256 433eea16fe4134ce980b7fbafb5e5b79e885d69be3da3c599382bbb86987891d.

Review AI distinta dall’autore; human NOT_RUN; publication DRAFT; publicationAction NONE. Nessuna nuova integrazione o pubblicazione attribuita.

## Controlli automatici distinti conclusi

Il test comune indipendente è terminato realmente con exit 0: 13 test in 3,763 s. Sono state respinte 125 mutazioni dei pacchetti, di cui 80 risposte errate con binding, token e pin sostituiti soltanto in memoria per isolare gli oracoli matematici; respinti anche cinque guasti alle funzioni costitutive. Sono state provate 240 configurazioni Hypothesis e le identità canoniche dei report fresh e salvati di tutti gli 80 record. Log autentico conservato in thermal-entropy-183-187-independent-tests-20261125.txt. Tutta la suite del corpus e la UI del prodotto sono fuori da questa prova locale.
