# Revisione indipendente subzero-ice-melting-173

La primaria di tutti gli 80 prompt originali U5-03 è stata salvata prima di aprire candidati, opzioni o chiavi: file primary-calorimetry-173-177-before-candidates-20261125.md, SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Pin fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. I messaggi autore hanno anticipato soltanto SHA, file e ipotesi generali, senza chiavi o risultati. Nessun modulo autore è stato importato o letto per derivare le risposte.

Successivamente sono stati letti individualmente tutti i 16 prompt finali, ciascuna opzione, tutti i blocchi e le formule, hint, feedback, metadati e didascalie; i calcoli sono stati ricontrollati sui dati realmente proposti. Il file ROOT è identico all’edizione finale letta nel Git B, comprendendo il fix visibile SVG 9d647bca e, per 17309, il fix hint 5579fe21. Non si congela una vecchia edizione. Le competenze C3-L01 (scale e confine), C3-L03 (capacità totale e specifica) e C3-L04 (fase e bilanci a tratti) sono reali e sono state rilette. La competenza primaria L04 è coerente con tutti questi sedici compiti.

Il modello usa coefficienti ideali esplicitamente assegnati; non li dichiara valori sperimentali esatti dell’acqua. Massa, potenza, calore trasferito, temperature puntuali e incrementi restano grandezze distinte. Gli oracoli indipendenti derivano bilanci, inverse, rapporti, tarature e rami fisici con SymPy, Pint e Fraction; nessun PASS deriva dalla sola chiave candidata o dal flag autore.

## Lettura e prova per ciascun ID

### AR-u5-subzero-ice-melting-01

Il grammo assorbe 2·10=20 J prima della fusione e 300 J durante la fase: Q=320 J. Il secondo tratto è a temperatura costante.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 300 J e 20 J omettono un tratto; 280 J sottrae due assorbimenti; 640 J duplica la massa.

Esito indipendente esatto: 320; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-02

La somma di due trasferimenti energetici è in joule: g·J/(g K)·K e g·J/g danno entrambi J; W richiederebbe una durata.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: J/(g K), J/g e K sono capacità specifica, costo specifico e intervallo; W richiede tempo.

Esito indipendente esatto: J; modalità AI_CONCEPTUAL, ambito NO_STUDENT_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-03

Integrare mc_i dT fra −θ e 0 dà mc_iθ; fondere l’intera massa aggiunge mL_f. Quindi Q=m(c_iθ+L_f), positivo nei due tratti.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il segno meno non descrive due assorbimenti; omettere massa da un termine altera le unità.

Esito indipendente esatto: Q = m (c_i θ + L_f); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-04

Con θ=10 K fisso, il costo è 320 J/g. Una massa da 1 a 2 g porta Q da 320 a 640 J: dipendenza lineare, nessun quadrato.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 320 J ignora il cambio di massa; 1280 J usa il quadrato; zero è impossibile con massa positiva.

Esito indipendente esatto: Da 320 a 640 J; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-05

m=Q/(c_iθ+L_f)=320/(20+300)=1 g. Il denominatore è 320 J/g e non una capacità specifica in J/(g K).

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Solo L_f dà 16/15 g; solo c_iθ dà 16 g. Nessuno ricostruisce i due tratti.

Esito indipendente esatto: 1; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-06

Q/m−L_f=320−300=20 J/g. Dividendo per c_i=2 J/(g K) si ottiene θ=10 K, sotto il limite assoluto del modello.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Usare tutto Q come sensibile dà 160 K; il reciproco scambia energia specifica e intervallo.

Esito indipendente esatto: 10; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-07

A richiede 320 J; a massa uguale B con θ=20 K richiede 340 J. Rapporto 340/320=17/16, non 2: il costo latente non raddoppia.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 perde il costo latente; 16/17 è il reciproco; 1 ignora il sensibile cambiato.

Esito indipendente esatto: 17/16; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-08

La proposta è 640 J e il valore corretto 320 J: proposta meno corretto è +320 J. Il segno si riferisce allo scarto.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Segno inverso produce −320 J; copiare la proposta dà 640 J; accettarla dà zero.

Esito indipendente esatto: 320; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-09

Dal bilancio Q=m(c_iθ+L_f), dividere per l’energia positiva richiesta da un grammo dà m=Q/(c_iθ+L_f).

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Q/(c_iθ+L_f) è massa; prodotti o reciproci non soddisfano la legge e spesso cambiano dimensione.

Esito indipendente esatto: m = Q / (c_i θ + L_f); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-10

Sostituire m_B=κ₁m_A, θ_B=κ₂θ_A prima del rapporto: κ₁(c_iκ₂θ_A+L_f)/(c_iθ_A+L_f). Nessuna legge temporale implicita.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: κ₁κ₂ moltiplicherebbe anche la parte latente per κ₂; rapporto solo dei fattori perde la somma.

Esito indipendente esatto: κ₁ (c_i κ₂ θ_A + L_f) / (c_i θ_A + L_f); modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-11

A: 1 g, 10 K dà 320 J. B: 2 g, 20 K dà 680 J. Rapporto 680/320=17/8; controllati entrambi i contributi.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 2 considera solo la massa; 17/16 solo l’intervallo; 8/17 capovolge B/A.

Esito indipendente esatto: 17/8; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-12

Media delle energie (320+680)/2=500 J. Con ingressi medi 3/2 g e 15 K si ottiene 495 J, differenza esatta 5 J.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 495 J usa ingressi medi; 1000 J non dimezza; 180 J è metà della differenza.

Esito indipendente esatto: 500; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-13

Il bersaglio 17/8 di 320 J è 680 J. Con 2 g servono 340 J/g: θ_B=(340−300)/2=20 K, rapporto 2.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 17/8 è rapporto di energie, non intervalli; 1 omette il cambio di θ.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-14

A: Q=320 J, S=960 dà q=3 J⁻¹. B: S=2040 dà Q=680 J. A θ=20 K il costo è 340 J/g: massa 2 g.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Omettere q porta massa 6 g; il guadagno positivo deve convertire il display prima dell’inversa.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-15

Riferimenti 320 e 680 J con letture 641 e 1361: q=720/360=2 J⁻¹, b=1. S_C=1281 dà Q_C=640 J; a 10 K massa 2 g.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Omettere b dà 1281/640 g e predice S=1282, non 1281. 4 g e 1 g non soddisfano la nuova lettura.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-subzero-ice-melting-16

Fra preparazioni m=(1/10 g/K)θ. Il bilancio a Q=320 J diventa x²+150x−1600=0, x=θ/K. Si cercano due interi di prodotto −1600 e somma 150: 160 e −10. Quindi (x−10)(x+160)=0, con radici 10 e −160; soltanto 10 dà θ>0 e m>0, massa 1 g.

Ipotesi: Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.

Distrattori e controprove: La radice −160 rende massa negativa; 20 K dà Q=680 J sotto il vincolo, 320 K viola anche il limite assoluto.

Esito indipendente esatto: 10; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

## Figura e limiti delle prove

SVG completo letto in XML e rendering nativo a piena altezza. Curva Q/T con coordinate (100,320)→(120,220)→(420,220): 1 coordinata/J e 10 coordinate/K rappresentano 20 J sensibili e 300 J latenti. Barre 24/360/384 per 20/300/320 J, scala comune 6/5; confronto 192/408/300 per 320/680/500 J, scala 3/5. Assi fisici e riferimento Celsius espliciti, nessuna pretesa di pixel fisici dopo resize.

I cinque rendering integrali sono asset-only: non costituiscono un replay dell’app o un marker UI. Le anteprime autore b963 precedenti sono storiche; i pacchetti finali di questi cinque lotti non acquisiscono alcun credito UI da questa revisione. Il replay prodotto sul profilo finale è competenza dell’integratore.

Finding 17309 risolto e riletto: c_iθ+L_f è energia per unità di massa, non calore specifico. L’hint finale dice «L’energia richiesta per unità di massa in entrambi i tratti compare al denominatore». Confronto strutturale: solo hint09 e binding09 cambiati; gli altri 15 record e chiavi, formule e SVG sono identici.

## Provenienza congelata

- Verifier SHA256: 874cbafa499fca68e8ce8a897fc0b10cb30fc8284708473b482a1bdb981da98d.
- Package canonico SHA256: 899079e9619ab86278ffdda891211d2f9a1eed76bd370b7f94f5c40e0ca0a326.
- Binding canonico SHA256: feeef92a7d7e4bb8dda9d22f3cb17f0e08777e1c8f39cfd922a92167eabafd41.
- Report SHA256: 2384aebc56471a0676bb0521c2cfe1d9a73e315f07cd7beedf8123cf32ed88aa.

Nessuna modifica a candidati, registro, checkpoint, runtime o Git ROOT. Human NOT_RUN; publication DRAFT; publicationAction NONE. Questa è review AI distinta dall’autore, non approvazione umana o misura empirica.

## Collaudo finale indipendente

Suite comune: 13 test PASS, processo exit 0 in 7,635 s. Identità canonica fresh e saved per tutti gli 80 record; soltanto enum EXACT_ORACLE e AI_CONCEPTUAL. Verificati dal Git il file fonte immutabile e gli 80 hash individuali. Sei proprietà Hypothesis, ciascuna con 40 configurazioni deterministiche (240 in totale), verificano bilanci, inverse, scale, segni e vincoli ridondanti.

Per questo lotto 25 mutazioni sono realmente rifiutate, incluse tutte le 16 chiavi sbagliate con candidateSha, binding, token e guardie package/binding deliberatamente rinnovati soltanto in memoria. Il rifiuto deve provenire dall’oracolo matematico. Le altre mutazioni controllano testo fisico falso a chiave corretta, fonte falsa, unità errata, corso errato, confini di completezza e SVG alterati. Cinque guasti ulteriori, uno per funzione costitutiva di famiglia, sono introdotti solo nei test dopo svuotamento della cache: le asserzioni fisiche indipendenti li espongono. Si distinguono quindi 125 mutazioni sui pacchetti e 5 guasti degli oracoli, senza accredito di nuove domande.

Trascritto phase-processes-173-177-independent-tests.txt SHA256 6c27acda40992ad18c26290e572f683d4c3e93066c2de6f20d7fb15ce7d6f1c6. Test comune SHA256 de4d573412be9114654c5ec1eaf6e80230051fbecb65345991fde08add7788e0. Mutation report SHA256 23e29f294d07ac228633cb7f5ad478f1d3fbfd5117b75e7c23697b64b7625e7d. Nessuna prova browser del prodotto è generata da questa suite scientifica.
