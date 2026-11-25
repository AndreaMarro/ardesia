# Revisione indipendente steam-condensation-cooling-174

La primaria di tutti gli 80 prompt originali U5-03 è stata salvata prima di aprire candidati, opzioni o chiavi: file primary-calorimetry-173-177-before-candidates-20261125.md, SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Pin fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. I messaggi autore hanno anticipato soltanto SHA, file e ipotesi generali, senza chiavi o risultati. Nessun modulo autore è stato importato o letto per derivare le risposte.

Successivamente sono stati letti individualmente tutti i 16 prompt finali, ciascuna opzione, tutti i blocchi e le formule, hint, feedback, metadati e didascalie; i calcoli sono stati ricontrollati sui dati realmente proposti. Il file ROOT è identico all’edizione finale letta nel Git B, comprendendo il fix visibile SVG 9d647bca e, per 17309, il fix hint 5579fe21. Non si congela una vecchia edizione. Le competenze C3-L01 (scale e confine), C3-L03 (capacità totale e specifica) e C3-L04 (fase e bilanci a tratti) sono reali e sono state rilette. La competenza primaria L04 è coerente con tutti questi sedici compiti.

Il modello usa coefficienti ideali esplicitamente assegnati; non li dichiara valori sperimentali esatti dell’acqua. Massa, potenza, calore trasferito, temperature puntuali e incrementi restano grandezze distinte. Gli oracoli indipendenti derivano bilanci, inverse, rapporti, tarature e rami fisici con SymPy, Pint e Fraction; nessun PASS deriva dalla sola chiave candidata o dal flag autore.

## Lettura e prova per ciascun ID

### AR-u5-steam-condensation-cooling-01

Un grammo cede 2400 J nella condensazione e 4·25=100 J raffreddando il liquido: Q_c=2500 J. Il calore ricevuto con segno è −2500 J.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2400 e 100 J omettono ciascuno un tratto; 2300 J sottrae due cessioni; −2500 J è Q con segno, non Q_c.

Esito indipendente esatto: 2500; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-02

Il modulo Q_c è un’energia in J. J/g descrive un costo specifico e W una potenza; entrambi i contributi mL_v e mc_lΔT sono in J.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: J/g e J/(g K) sono coefficienti specifici, W potenza, K intervallo.

Esito indipendente esatto: J; modalità AI_CONCEPTUAL, ambito NO_STUDENT_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-03

I due tratti cedono entrambi calore: Q_c=mL_v+mc_lΔT. Si sommano i moduli e si pone Q=−Q_c; non si assume ΔU=Q durante un percorso isobaro.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Sottrarre il sensibile è incompatibile con due cessioni; nessun reciproco dà il calore totale.

Esito indipendente esatto: Q_c = m (L_v + c_l ΔT); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-04

Il costo rimane 2500 J/g. Da 1 a 2 g a pari intervallo di raffreddamento Q_c va da 2500 a 5000 J.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2500 J ignora la massa doppia; il quadrato sovrastima entrambi i tratti.

Esito indipendente esatto: Da 2500 a 5000 J; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-05

m=2500/[2400+4·25]=1 g. Si usa l’energia per unità di massa dell’intero percorso, non il solo costo latente.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Solo L_v produce 25/24 g; solo il sensibile produce 25 g, entrambi errati.

Esito indipendente esatto: 1; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-06

Q_c/m−L_v=100 J/g; dividendo per 4 J/(g K) si ottiene ΔT=25 K. Il ramo liquido impone inoltre il limite assegnato.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Q_c/(mc_l) dà 625 K e salta L_v; il residuo corretto è 100 J/g.

Esito indipendente esatto: 25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-07

A=2500 J, B=2400+4·50=2600 J a massa uguale; rapporto 2600/2500=26/25. Il costo latente è invariato.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 perde il latente costante; 25/26 è il reciproco; 1 ignora il raffreddamento maggiore.

Esito indipendente esatto: 26/25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-08

Proposta 5000 J meno valore corretto 2500 J dà +2500 J. È un errore sul modulo, non il segno del calore del campione.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: −2500 J inverte lo scarto; 5000 J copia la proposta e zero la accetta.

Esito indipendente esatto: 2500; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-09

Q_c=m(L_v+c_lΔT) con parentesi positiva J/g. L’inversa m=Q_c/(L_v+c_lΔT) ha unità g.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il denominatore è energia per massa: reciproco o prodotto non è l’inversa corretta.

Esito indipendente esatto: m = Q_c / (L_v + c_l ΔT); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-10

Variare massa e intervallo fra prove dà κ₁(L_v+c_lκ₂ΔT_A)/(L_v+c_lΔT_A), rispettando in entrambe il ramo liquido.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: κ₁κ₂ moltiplica indebitamente L_v per κ₂, mentre L_v resta assegnato.

Esito indipendente esatto: κ₁ (L_v + c_l κ₂ ΔT_A) / (L_v + c_l ΔT_A); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-11

A cede 2500 J; B con 2 g e 50 K cede 5200 J. Rapporto 5200/2500=52/25.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Due segue la sola massa; 26/25 il solo intervallo; 25/52 inverte il risultato.

Esito indipendente esatto: 52/25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-12

Media (2500+5200)/2=3850 J. Ingressi medi 3/2 g e 75/2 K danno 3825 J: le due medie differiscono di 25 J.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 3825 J usa ingressi medi; 7700 J è somma; 1350 J metà differenza.

Esito indipendente esatto: 3850; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-13

B deve cedere 5200 J con 2 g: 2600 J/g. Togliendo 2400 e dividendo per 4 si ottiene ΔT_B=50 K; rapporto con 25 K pari a 2.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 52/25 non è il rapporto degli intervalli; 2 ricostruisce ΔT_B=50 K.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-14

A: S=7500 su Q_c=2500 J dà q=3 J⁻¹. B: S=15600 implica 5200 J; a 50 K il costo è 2600 J/g, massa 2 g.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: S grezzo produce massa 6 g; occorre q=3 J⁻¹.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-15

Q_A=2500 e Q_B=5200 J, letture 5001 e 10401: q=2 J⁻¹, b=1. S_C=10001 dà 5000 J; a 25 K massa 2 g.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Senza b si usa 10001/2 J e si ricostruisce S=10002; 4 g e 1 g sono altre letture.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-steam-condensation-cooling-16

Con m=(1/25 g/K)ΔT fra prove, Q_c=2500 J dà x²+600x−15625=0. Si cercano due interi di prodotto −15625 e somma 600: 625 e −25, perché 625·25=15625. Quindi (x−25)(x+625)=0, con radici 25 e −625; soltanto 25 K ha massa positiva e intervallo positivo. Resta il limite liquido esplicito.

Ipotesi: Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.

Distrattori e controprove: −625 K ha massa negativa; 50 K dà Q_c=5200 J sotto il vincolo e non 2500.

Esito indipendente esatto: 25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

## Figura e limiti delle prove

SVG completo letto in XML e rendering nativo a piena altezza. Q_c cumulativo cresce 0→2400→2500 J; plateau alla condensazione e poi T−T_s scende 0→−25 K. Scale intrinseche 3/20 coordinate/J e 4 coordinate/K; barre 360/15/375 per 2400/100/2500 J, confronto 200/416/308 per 2500/5200/3850 J a scala 2/25. Il segno negativo è differenza termica, non temperatura assoluta negativa.

I cinque rendering integrali sono asset-only: non costituiscono un replay dell’app o un marker UI. Le anteprime autore b963 precedenti sono storiche; i pacchetti finali di questi cinque lotti non acquisiscono alcun credito UI da questa revisione. Il replay prodotto sul profilo finale è competenza dell’integratore.

## Provenienza congelata

- Verifier SHA256: 9163a5f574c5ab9ff4b6741a5a92763fb11efc57c7d8e89c35bc44d26d9cfaf4.
- Package canonico SHA256: 33422f2a5606da11acebac5829783812d224e3739c95d84938f80d51e2df141f.
- Binding canonico SHA256: ce3aec7381718958c688edf71b2c482afa3a1b26205c21c8e921398e5687d17b.
- Report SHA256: 91244b698cda38cc385bb9b5ace92e1991e136d98afd532121ac7ba5d90b75cc.

Nessuna modifica a candidati, registro, checkpoint, runtime o Git ROOT. Human NOT_RUN; publication DRAFT; publicationAction NONE. Questa è review AI distinta dall’autore, non approvazione umana o misura empirica.

## Collaudo finale indipendente

Suite comune: 13 test PASS, processo exit 0 in 7,635 s. Identità canonica fresh e saved per tutti gli 80 record; soltanto enum EXACT_ORACLE e AI_CONCEPTUAL. Verificati dal Git il file fonte immutabile e gli 80 hash individuali. Sei proprietà Hypothesis, ciascuna con 40 configurazioni deterministiche (240 in totale), verificano bilanci, inverse, scale, segni e vincoli ridondanti.

Per questo lotto 25 mutazioni sono realmente rifiutate, incluse tutte le 16 chiavi sbagliate con candidateSha, binding, token e guardie package/binding deliberatamente rinnovati soltanto in memoria. Il rifiuto deve provenire dall’oracolo matematico. Le altre mutazioni controllano testo fisico falso a chiave corretta, fonte falsa, unità errata, corso errato, confini di completezza e SVG alterati. Cinque guasti ulteriori, uno per funzione costitutiva di famiglia, sono introdotti solo nei test dopo svuotamento della cache: le asserzioni fisiche indipendenti li espongono. Si distinguono quindi 125 mutazioni sui pacchetti e 5 guasti degli oracoli, senza accredito di nuove domande.

Trascritto phase-processes-173-177-independent-tests.txt SHA256 6c27acda40992ad18c26290e572f683d4c3e93066c2de6f20d7fb15ce7d6f1c6. Test comune SHA256 de4d573412be9114654c5ec1eaf6e80230051fbecb65345991fde08add7788e0. Mutation report SHA256 6e88963d0b99bb0e1b42920a8a3346cbca4b8c571c751b6d06e3b0a5c64af661. Nessuna prova browser del prodotto è generata da questa suite scientifica.
