# Revisione indipendente freezing-time-177

La primaria di tutti gli 80 prompt originali U5-03 è stata salvata prima di aprire candidati, opzioni o chiavi: file primary-calorimetry-173-177-before-candidates-20261125.md, SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Pin fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. I messaggi autore hanno anticipato soltanto SHA, file e ipotesi generali, senza chiavi o risultati. Nessun modulo autore è stato importato o letto per derivare le risposte.

Successivamente sono stati letti individualmente tutti i 16 prompt finali, ciascuna opzione, tutti i blocchi e le formule, hint, feedback, metadati e didascalie; i calcoli sono stati ricontrollati sui dati realmente proposti. Il file ROOT è identico all’edizione finale letta nel Git B, comprendendo il fix visibile SVG 9d647bca e, per 17309, il fix hint 5579fe21. Non si congela una vecchia edizione. Le competenze C3-L01 (scale e confine), C3-L03 (capacità totale e specifica) e C3-L04 (fase e bilanci a tratti) sono reali e sono state rilette. La competenza primaria L04 è coerente con tutti questi sedici compiti.

Il modello usa coefficienti ideali esplicitamente assegnati; non li dichiara valori sperimentali esatti dell’acqua. Massa, potenza, calore trasferito, temperature puntuali e incrementi restano grandezze distinte. Gli oracoli indipendenti derivano bilanci, inverse, rapporti, tarature e rami fisici con SymPy, Pint e Fraction; nessun PASS deriva dalla sola chiave candidata o dal flag autore.

## Lettura e prova per ciascun ID

### AR-u5-freezing-time-01

Un grammo cede 4·20=80 J nel raffreddamento e 300 J nel congelamento: totale 380 J. A 10 W t=38 s, composto da 8 e 30 s.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 8 s e 30 s omettono una fase ciascuno; il plateau continua a sottrarre calore senza cambiare temperatura.

Esito indipendente esatto: 38; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-02

J/W=J/(J/s)=s. La durata non è un’energia o una temperatura; il plateau richiede tempo e calore sottratto non nulli.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: J energia, W potenza, J/g costo specifico e K intervallo non sono durata.

Esito indipendente esatto: s; modalità AI_CONCEPTUAL, ambito NO_STUDENT_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-03

Con P netta costante, t=(mc_l·20 K+mL_f)/P. I due tempi si sommano, perché entrambi i tratti cedono energia; ci si ferma appena solido a 0 °C.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il reciproco è s⁻¹; sottrarre il latente tratterebbe il congelamento come assorbimento del campione.

Esito indipendente esatto: t = m [c_l (20 K) + L_f] / P; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-04

Da 1 a 2 g a potenza 10 W il calore passa 380→760 J e il tempo 38→76 s; entrambi i tratti raddoppiano.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 19 s rende inversa la dipendenza dalla massa; 152 s usa il quadrato, 40 s copia la temperatura iniziale.

Esito indipendente esatto: Passa da 38 a 76 s; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-05

Pt=10·38=380 J; a 380 J/g si ottiene m=1 g. Considerare il solo latente perderebbe gli 80 J/g sensibili.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 380/300 g usa solo fase; 19/4 g solo sensibile; copiare 38 dimentica energia specifica e potenza.

Esito indipendente esatto: 1; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-06

P=380 J/(38 s)=10 W termici netti. Il dato non determina l’assorbimento elettrico senza un ulteriore modello del dispositivo.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 300/38 e 80/38 W omettono un tratto; t/Q_c ha unità W⁻¹.

Esito indipendente esatto: 10; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-07

A: 380/10=38 s; B: 380/20=19 s. Rapporto 1/2: più potenza riduce il tempo, senza cambiare il calore totale.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 inverte la dipendenza dalla potenza; 1 ignora il cambio, 1/4 e 4 applicano un quadrato.

Esito indipendente esatto: 1/2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-08

Proposta 76 s meno corretto 38 s dà +38 s. Il tempo aggiunto non appartiene al processo arrestato al ghiaccio a zero.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: −38 s scambia l’ordine, 76 s copia la proposta, zero la accetta, 2 è rapporto senza unità.

Esito indipendente esatto: 38; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-09

m=Pt/[c_l·20 K+L_f]. Il numeratore è un’energia e il denominatore 380 J/g, quindi il risultato è in grammi.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Dividere per P non ricostruisce Pt; solo L_f omette 80 J/g e differenza 80−300 dà massa negativa.

Esito indipendente esatto: m = Pt / [c_l (20 K) + L_f]; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-10

Con costo specifico costante fra prove, t_B/t_A=(m_B/m_A)/(P_B/P_A)=κ₁/κ₂. Fattori uguali lasciano la durata invariata.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: κ₂/κ₁ è reciproco; κ₁κ₂ cresce erroneamente con potenza; κ₁² aggiunge un quadrato; differenza dà zero per prove uguali.

Esito indipendente esatto: κ₁/κ₂; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-11

A dura 38 s; B con 2 g e 1 W dura 760 s. Rapporto 20: fattore 2 per massa e 10 per potenza inversa.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 segue massa, 10 segue potenza; 1/5 manca l’inversione della potenza e 1/20 capovolge B/A.

Esito indipendente esatto: 20; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-12

Media durate (38+760)/2=399 s. I parametri medi 3/2 g e 11/2 W darebbero 1140/11 s, altra operazione.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 1140/11 s usa parametri medi; 798 s somma, 361 metà differenza e 399/2 dimezza due volte.

Esito indipendente esatto: 399; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-13

Il tempo bersaglio è 20·38=760 s e il calore per 2 g è 760 J. P_B=1 W, rapporto con 10 W pari a 1/10.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 1/20 ignora massa doppia, 10 inverte il confronto; 20 segue tempo direttamente, 2 soltanto massa.

Esito indipendente esatto: 1/10; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-14

S_A=114 su 38 s dà q=3 s⁻¹. S_B=2280 dà 760 s; a 1 W sono 760 J, quindi 2 g.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: S grezzo come secondi produce 6 g; 20 è rapporto dei tempi ma non delle masse perché cambia P.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-15

Riferimenti 38 e 760 s, letture 77 e 1521: q=1444/722=2 s⁻¹, b=1. S_C=153 dà 76 s; con 10 W sono 760 J, massa 2 g.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 153/76 g omette b e usa 765 J; 4 g danno S=305 e 1 g S=77; 76 g copia la durata.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-freezing-time-16

Con m=(1/10 g/W)P fra preparazioni, t=d·380 J/g=38 J/W=38 s per ogni P>0. Ogni potenza positiva ha massa positiva corrispondente; nessuna seconda equazione indipendente.

Ipotesi: Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.

Distrattori e controprove: Esempio 1 g e 10 W non è unico; P=0 è esclusa e non può sottrarre energia positiva; 38 g copia il tempo.

Esito indipendente esatto: Infinite: ogni P>0 con m=dP; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

## Figura e limiti delle prove

SVG completo letto in XML e rendering nativo a piena altezza. Curva (100,160)→(164,320)→(404,320) a scala 8 coordinate/s e 8 coordinate/K: 20→0 °C in 8 s poi plateau fino a 38 s. Barre energetiche 80+300=380 e barre temporali 64+240=304 per 8+30=38 s, ciascun pannello a scala propria e origine comune. Nessun tratto dopo completa solidificazione.

I cinque rendering integrali sono asset-only: non costituiscono un replay dell’app o un marker UI. Le anteprime autore b963 precedenti sono storiche; i pacchetti finali di questi cinque lotti non acquisiscono alcun credito UI da questa revisione. Il replay prodotto sul profilo finale è competenza dell’integratore.

## Provenienza congelata

- Verifier SHA256: 532e1f2705e103cbd72c575acbec3c9669c1c3249431158dc77d3d7200584a75.
- Package canonico SHA256: f3a6d6b6c12a68a0842c63d30596182bd7529afa287857aeb08d174b5e40b2c1.
- Binding canonico SHA256: ad04234becc7f715ee6b01200e44113922b82b63f49b87daa6c885a83c74cf4a.
- Report SHA256: 4cd206ef047d30433799b92e032097a31f0cc7caa0eca3c4adbd1b76efcdbdc7.

Nessuna modifica a candidati, registro, checkpoint, runtime o Git ROOT. Human NOT_RUN; publication DRAFT; publicationAction NONE. Questa è review AI distinta dall’autore, non approvazione umana o misura empirica.

## Collaudo finale indipendente

Suite comune: 13 test PASS, processo exit 0 in 7,635 s. Identità canonica fresh e saved per tutti gli 80 record; soltanto enum EXACT_ORACLE e AI_CONCEPTUAL. Verificati dal Git il file fonte immutabile e gli 80 hash individuali. Sei proprietà Hypothesis, ciascuna con 40 configurazioni deterministiche (240 in totale), verificano bilanci, inverse, scale, segni e vincoli ridondanti.

Per questo lotto 25 mutazioni sono realmente rifiutate, incluse tutte le 16 chiavi sbagliate con candidateSha, binding, token e guardie package/binding deliberatamente rinnovati soltanto in memoria. Il rifiuto deve provenire dall’oracolo matematico. Le altre mutazioni controllano testo fisico falso a chiave corretta, fonte falsa, unità errata, corso errato, confini di completezza e SVG alterati. Cinque guasti ulteriori, uno per funzione costitutiva di famiglia, sono introdotti solo nei test dopo svuotamento della cache: le asserzioni fisiche indipendenti li espongono. Si distinguono quindi 125 mutazioni sui pacchetti e 5 guasti degli oracoli, senza accredito di nuove domande.

Trascritto phase-processes-173-177-independent-tests.txt SHA256 6c27acda40992ad18c26290e572f683d4c3e93066c2de6f20d7fb15ce7d6f1c6. Test comune SHA256 de4d573412be9114654c5ec1eaf6e80230051fbecb65345991fde08add7788e0. Mutation report SHA256 08aefabe7ac865208b9d9757572f5daabee3e758c6c3675dcfd8352f7ee944d8. Nessuna prova browser del prodotto è generata da questa suite scientifica.
