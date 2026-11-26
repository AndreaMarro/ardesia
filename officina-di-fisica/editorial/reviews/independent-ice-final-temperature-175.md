# Revisione indipendente ice-final-temperature-175

La primaria di tutti gli 80 prompt originali U5-03 è stata salvata prima di aprire candidati, opzioni o chiavi: file primary-calorimetry-173-177-before-candidates-20261125.md, SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Pin fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. I messaggi autore hanno anticipato soltanto SHA, file e ipotesi generali, senza chiavi o risultati. Nessun modulo autore è stato importato o letto per derivare le risposte.

Successivamente sono stati letti individualmente tutti i 16 prompt finali, ciascuna opzione, tutti i blocchi e le formule, hint, feedback, metadati e didascalie; i calcoli sono stati ricontrollati sui dati realmente proposti. Il file ROOT è identico all’edizione finale letta nel Git B, comprendendo il fix visibile SVG 9d647bca e, per 17309, il fix hint 5579fe21. Non si congela una vecchia edizione. Le competenze C3-L01 (scale e confine), C3-L03 (capacità totale e specifica) e C3-L04 (fase e bilanci a tratti) sono reali e sono state rilette. La competenza primaria L04 è coerente con tutti questi sedici compiti.

Il modello usa coefficienti ideali esplicitamente assegnati; non li dichiara valori sperimentali esatti dell’acqua. Massa, potenza, calore trasferito, temperature puntuali e incrementi restano grandezze distinte. Gli oracoli indipendenti derivano bilanci, inverse, rapporti, tarature e rami fisici con SymPy, Pint e Fraction; nessun PASS deriva dalla sola chiave candidata o dal flag autore.

## Lettura e prova per ciascun ID

### AR-u5-ice-final-temperature-01

La fusione di 5/2 g costa 750 J. Restano 800−750=50 J su capacità 4·5/2=10 J/K: Θ=5 K, lettura finale 5 °C.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Q/(mc_l)=80 K omette 750 J latenti; zero ignora 50 J residui; −5 K rovescia il residuo.

Esito indipendente esatto: 5; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-02

Si chiede il punto termometrico T_f in °C. L’incremento Θ è 5 K, mentre il punto assoluto è 278,15 K: numeri distinti.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: J è energia, J/g costo specifico, J/K capacità e W potenza; non punti termometrici.

Esito indipendente esatto: °C; modalità AI_CONCEPTUAL, ambito NO_STUDENT_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-03

Dal bilancio Q=mL_f+mc_lΘ si ricava Θ=(Q−mL_f)/(mc_l), quindi T_f=T_m+Θ. Il dominio 0<Θ<100 K esclude fasi ulteriori.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il termine latente va sottratto da Q, poi si divide per tutta la capacità mc_l, non solo c_l.

Esito indipendente esatto: T_f = T_m + (Q − m L_f) / (m c_l); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-04

A: residuo 50 J dà 5 K. B: 1000−750=250 J dà 25 K alla stessa capacità 10 J/K. Letture 5 e 25 °C, non scalate come Q totale.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 25/4 °C scala Q totale perdendo l’offset latente; 100 °C usa tutta l’energia come sensibile.

Esito indipendente esatto: Da 5 a 25 °C; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-05

A 5 °C servono 300+4·5=320 J/g; per 5/2 g Q=800 J. Si ricostruiscono latente e sensibile.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 50 J è solo sensibile e 750 J solo fusione; entrambi insufficienti al percorso completo.

Esito indipendente esatto: 800; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-06

m=800/(300+4·5)=800/320=5/2 g. Con questa massa 750 J fondono e 50 J riscaldano: entrambe le soglie sono rispettate.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 g danno 25 °C; 8/3 g finiscono alla fusione senza incremento; 40 g non fondono tutti, 1 g supera il ramo.

Esito indipendente esatto: 5/2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-07

A ha lettura 5 °C. Con Q=800 J e massa B=2 g il residuo è 200 J su 8 J/K, lettura 25 °C. Rapporto numerico Celsius 5, uguale qui a quello degli incrementi da 0 °C.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 4/5 e 5/4 confrontano masse, 1/5 inverte le letture, 2 non ricostruisce i residui.

Esito indipendente esatto: 5; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-08

Proposta 10 °C meno 5 °C è un intervallo di +5 K. Non si aggiunge 273,15 agli scarti.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: −5 K scambia l’ordine; 10 K copia la proposta; zero e 2 K non sono la differenza.

Esito indipendente esatto: 5; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-09

Moltiplicare Θ per mc_l e aggiungere mL_f dà Q=m(L_f+c_lΘ); la parentesi è in J/g e il prodotto in J.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Un solo termine omette un tratto, il segno meno toglie energia richiesta; dividere per m dà J/g².

Esito indipendente esatto: Q = m (L_f + c_l Θ); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-10

Si rapportano i due residui divisi per le rispettive capacità: (κ₁Q_A−κ₂m_AL_f)/[κ₂(Q_A−m_AL_f)]. Le due finali positive rendono il rapporto definito.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il solo κ₁/κ₂ perde il costo latente; omettere κ₂ perde la capacità finale.

Esito indipendente esatto: (κ₁ Q_A − κ₂ m_A L_f) / [κ₂ (Q_A − m_A L_f)]; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-11

B: 1000−2·300=400 J su 8 J/K dà 50 °C; A=5 °C. Rapporto delle letture 10, non delle temperature assolute.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 5/4 segue solo Q, 4/5 solo massa; 1/10 capovolge B/A e 5 appartiene al caso a Q comune.

Esito indipendente esatto: 10; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-12

Media letture (5+50)/2=55/2 °C. Q medio 900 J e massa media 9/4 g darebbero invece 25 °C; la media statistica non è una nuova mescolanza.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 25 °C usa gli ingressi medi; 55 °C è somma e 45/2 °C metà differenza; 5 °C ignora B.

Esito indipendente esatto: 55/2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-13

Bersaglio 50 °C: costo 300+4·50=500 J/g. Q_B=1000 J dà m_B=2 g e m_B/m_A=4/5; finale sotto ebollizione.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 5/4 è il reciproco; 10 è il fattore sulla lettura, 2 il numero della massa B.

Esito indipendente esatto: 4/5; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-14

Θ_A=5 K, S_A=15 implica q=3 K⁻¹. S_B=150 dà Θ_B=50 K; con 2 g Q_B=2(300+200)=1000 J.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: S=150 come kelvin dà 1800 J e viola il limite liquido; 400 J omette fusione.

Esito indipendente esatto: 1000; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-15

Riferimenti Θ=5 e 50 K, S=11 e 101: q=90/45=2 K⁻¹ e b=1. S_C=51 dà Θ_C=25 K; Q_C=(5/2)(300+100)=1000 J.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 1005 J omette b e produce S=52 anziché 51; 250 e 750 J sono singoli tratti.

Esito indipendente esatto: 1000; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-ice-final-temperature-16

Q=(320 J/g)m cancella m nella legge: Θ=(320−300)/4=5 K. Ogni m>0 con Q=320m è ammesso; ad esempio 1 g/320 J e 5/2 g/800 J. Non identificabile la scala.

Ipotesi: Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.

Distrattori e controprove: La coppia di riferimento non è unica; massa zero è esclusa prima della cancellazione e annulla il denominatore.

Esito indipendente esatto: Infinite: ogni m>0 con Q=(320 J/g)m; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

## Figura e limiti delle prove

SVG completo letto in XML e rendering nativo a piena altezza. Curva (100,320)→(400,320)→(420,220): 2/5 coordinata/J dà 750 J latenti e 50 J sensibili; 20 coordinate/K dà aumento 5 K. Barre 300/20/320 per 750/50/800 J, origini comuni. Incrementi 5/50/55/2 K con larghezze 20/200/110 a scala 4 coordinate/K; corrispondenti letture Celsius distinte dagli assoluti.

I cinque rendering integrali sono asset-only: non costituiscono un replay dell’app o un marker UI. Le anteprime autore b963 precedenti sono storiche; i pacchetti finali di questi cinque lotti non acquisiscono alcun credito UI da questa revisione. Il replay prodotto sul profilo finale è competenza dell’integratore.

## Provenienza congelata

- Verifier SHA256: 562d6e3d400c9e1b1f8196723721f0e5dcc6ca69926ff44d922e83dfc8e2d31c.
- Package canonico SHA256: cd948a716d1f37b25b2a623cefbe1e44b78ac0df8431228afc903d74f9a28549.
- Binding canonico SHA256: c6466c2c4457c37597b8286a133779784a356ddc7c096d5bdb10ebd27a2fc15d.
- Report SHA256: a6718b2c2b3334149b26a5027653bead37cd59c0696e463ea99289f08024ba01.

Nessuna modifica a candidati, registro, checkpoint, runtime o Git ROOT. Human NOT_RUN; publication DRAFT; publicationAction NONE. Questa è review AI distinta dall’autore, non approvazione umana o misura empirica.

## Collaudo finale indipendente

Suite comune: 13 test PASS, processo exit 0 in 7,635 s. Identità canonica fresh e saved per tutti gli 80 record; soltanto enum EXACT_ORACLE e AI_CONCEPTUAL. Verificati dal Git il file fonte immutabile e gli 80 hash individuali. Sei proprietà Hypothesis, ciascuna con 40 configurazioni deterministiche (240 in totale), verificano bilanci, inverse, scale, segni e vincoli ridondanti.

Per questo lotto 25 mutazioni sono realmente rifiutate, incluse tutte le 16 chiavi sbagliate con candidateSha, binding, token e guardie package/binding deliberatamente rinnovati soltanto in memoria. Il rifiuto deve provenire dall’oracolo matematico. Le altre mutazioni controllano testo fisico falso a chiave corretta, fonte falsa, unità errata, corso errato, confini di completezza e SVG alterati. Cinque guasti ulteriori, uno per funzione costitutiva di famiglia, sono introdotti solo nei test dopo svuotamento della cache: le asserzioni fisiche indipendenti li espongono. Si distinguono quindi 125 mutazioni sui pacchetti e 5 guasti degli oracoli, senza accredito di nuove domande.

Trascritto phase-processes-173-177-independent-tests.txt SHA256 6c27acda40992ad18c26290e572f683d4c3e93066c2de6f20d7fb15ce7d6f1c6. Test comune SHA256 de4d573412be9114654c5ec1eaf6e80230051fbecb65345991fde08add7788e0. Mutation report SHA256 a0c32f8ded70cfffda51aeab6a81c0d43a7478383fc2f6855d7e10329ff65761. Nessuna prova browser del prodotto è generata da questa suite scientifica.
