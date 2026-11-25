# Revisione scientifica indipendente — isobaric-work-155

Autore B e revisore A distinti. Tutti gli 80 prompt originali B153–157 sono stati letti integralmente e risolti prima di aprire candidate, chiavi o moduli autore. Primaria per ID persistita in /private/tmp/cric-a153-157-primary-before-keys.md, SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641. Le consegne preliminari esponevano soltanto SHA, file e ipotesi generali, senza numeri di risposta o chiavi. L’esperienza del revisore come autore di altre famiglie termodinamiche è esplicita; nessuna pretesa di ignorare le leggi fisiche.

Fonte Ardesia 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json, SHA256 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Hash individuali dei record completi usati solo come provenienza; le chiavi originali non sono state lette né usate per derivare gli oracoli. Lezioni reali C3-L01, L02, L03, L06 e L07 rilette dal pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d. Primaria C3-L06 e prerequisiti effettivi controllati contro il catalogo, nessuna competenza inventata.

Edizione autore finale a060f76e833d2159eb98dda731c08b0d89a6880d, confrontata byte per byte con package, binding e asset ROOT. Package canonico SHA256 175df717fa22aad8ff3cd7167b268a62a26b4d9d29a2e9a5b10ecf5596b43837, binding canonico SHA256 b0a2de3fcdacdece9d0cdece9ec1a23cf1f8749867224ac4b5d90e93b60d9c70, verificatore SHA256 62a0bb12a3364245b58695d30a0a4b2c818bfb17a690517cacc99a6a17e0ca55. Tutte le 16 schede finali lette integralmente, inclusi prompt, opzioni, passaggi, hint, feedback, metadati e didascalie. XML e rendering nativo completo della figura letti. Nessun finding residuo e nessun candidato modificato dal revisore.

Derivazioni autonome SymPy, Fraction e Pint per leggi, inverse, rapporti, medie, calibrazioni e rami fisici. Il parser numerico è un AST limitato: nessuna esecuzione di testo e nessun sympify di input libero. Risultati numerici EXACT_ORACLE; stringhe qualitative o simboliche AI_CONCEPTUAL con prove specifiche, senza fingere assenza di ragionamento fisico. Le stringhe composite di confronto possono includere calcoli esatti documentati pur mantenendo esplicita la componente di lettura AI.

Contratto canonico assert_record_identity eseguito sugli 80 record fresh e saved; report fresh identici ai file salvati ed enum limitate a EXACT_ORACLE/AI_CONCEPTUAL. Venticinque mutazioni effettive per famiglia: 16 chiavi errate con binding e tutti i token di edizione ricostruiti soltanto in memoria, più falso testo con chiave corretta, falsa fonte, unità errata, corso errato, confini vuoto/parziale/duplicato, SVG incorporato alterato e SVG locale alterato. Il rifiuto delle chiavi è nei controlli indipendenti matematici/concettuali; il testo fisico falso con chiave corretta viene rifiutato dalla lettura integrale congelata. Non si confondono le due garanzie.

Test finale comune: 12 test PASS con exit 0 in 2,462 s, 125 controprove per i cinque lotti e sei proprietà Hypothesis da 40 configurazioni ciascuna. Incluse la conservazione con tutti i segni di ΔU, il cambiamento di convenzione on/by, il percorso isobaro inverso, la capacità totale, il fattore monoatomico, la covarianza delle medie nei prodotti e la commutazione per somme/differenze, i rami positivi e le coordinate degli SVG. Trascrizione persistita in thermal-energy-balances-153-157-tests-20261125.txt.

Esito AI indipendente positivo sulle nuove bozze, approvazione umana NOT_RUN, publication DRAFT e publicationAction NONE. Nessun registro, dato di studenti o runtime modificato. Questa review non certifica apprendimento o accessibilità osservata con persone.

## Figura scientifica

XML e rendering nativo completo letti. Due grafici con origine a zero e stessa scala 35 px/L e 60 px/kPa: segmento da (135,180) a (240,180) a p=2 kPa per V=1→4 L, ritorno opposto da (240,580) a (135,580) con origine y=700. Rettangoli 105×120 px corrispondono a 6 J in modulo; frecce separate rendono lavori +6 e −6 J, somma 0 solo su quel cammino ripercorso. Barre distinte A=6, B=20, media=13 J larghe 90 px, 300 px e 195 px a 15 px/J; non sono i due tratti del ciclo.

## Particolarità preservate

La domanda 03 mantiene la stessa isobara percorsa nei due versi, con nuovi valori espliciti 1→4 L a 2 kPa: si ricavano +6 J e −6 J, non lavoro nullo su ciascun tratto e non lavoro nullo per ogni ciclo. p è la pressione esterna totale, quindi non si aggiunge atmosfera a un valore già assoluto. Nel 16 il vincolo p=cΔV è fra prove; entro ogni prova p resta costante e non compare il fattore un mezzo di una pressione crescente lungo il percorso.

## AR-u5-isobaric-work-01 — Forza e spostamento diventano pΔV

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: W=∫p_ext dV=pΔV per pressione resistente totale costante. Con 2 kPa e 3 L: W=6 J; il fattore 10³ di kPa cancella 10⁻³ del litro.

Alternative e feedback: 12 J aggiunge un fattore due e 6000 J converte soltanto kPa senza convertire L. La pressione deve essere quella resistente totale, non una pressione relativa usata senza correzione.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 311738df754de3a638d3e3dc98e83b36aea2e077fa5c74bc1b17ad91ef8daa6d; candidato SHA256 6afaab80b5b236863fae0d602d5efcb67eab4cacf3261903dc318b289d7372fe; firma 862a992701df6429e7e0ed8e882b64967e73f0a55ef207a5d2ab4ffbedf47b83. Human NOT_RUN.

## AR-u5-isobaric-work-02 — Perché kPa per litro dà joule

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Lavoro è energia trasferita: J. Pa·m³ e kPa·L sono dimensionalmente energie, non pressioni o potenze.

Alternative e feedback: Pressione, volume, temperatura e potenza non sono energia; una potenza richiederebbe dividere il lavoro per una durata.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION. Source SHA256 9b2356a1f766c57e0477765d762adf8297285a3cdc3265afa5f3ba0a7856dd91; candidato SHA256 0ec73db92f5b3cb5c29bf99a83791af37297a7da3b210442ba4997fa0dc300ac; firma 801f9769b1cde8d259838f6503d782ce145c01272125d1a9b22e44193ba3f780. Human NOT_RUN.

## AR-u5-isobaric-work-03 — Ripercorrere la stessa isobara

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Andata A→B: p(V_B−V_A)>0. Ritorno sulla stessa isobara: p(V_A−V_B)=−W_AB<0. Stesso modulo e lavoro netto zero, con versi del volume opposti.

Alternative e feedback: Non sono entrambi positivi e non sono entrambi nulli: il volume cambia. Il lavoro cambia segno quando si inverte lo spostamento a uguale pressione.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION. Source SHA256 e2c576e7f17979089914ec4dbccbbf24f9ec928cfded6a543132d543d927e8fe; candidato SHA256 dca31cbae5ea89f1780b06b92147101a27bc2ec2e105e9101624dbd74c92205d; firma f89779e63ed0e948ba2878d2fba0596a6bdbca97f43ce37d94e00e5c414b968a. Human NOT_RUN.

## AR-u5-isobaric-work-04 — La stessa espansione a pressione doppia

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Pressione da 2 a 4 kPa, incremento 3 L invariato: lavoro da 6 a 12 J. Il raddoppio riguarda la pressione costante fra prove, non una pressione crescente entro la prova.

Alternative e feedback: Lasciare 6 J ignora p; dimezzare la risposta inverte dipendenza; quadrarla aggiunge un fattore inesistente.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION. Source SHA256 4b01af8bce0d66aa9dcaeb5544a746ded55fc2cf6d63d6fb316803b43021405a; candidato SHA256 04272dd2c1fa99a5ee235e210ecd4f6f3e4b94829a75785114f6934459b362fa; firma b5d1ec8828aa32fe499b84ef674e41cb666472a0cb8506b1b7ed771617dc250b. Human NOT_RUN.

## AR-u5-isobaric-work-05 — La pressione dal lavoro misurato

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: p=W/ΔV=6 J/(3 L)=2 kPa, divisione lecita per ΔV>0. Non moltiplicare per il volume ancora.

Alternative e feedback: WΔV ha J·L, il reciproco ha L/J. Nessuno ha dimensione kPa; la sostituzione deve ricostruire 6 J.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 bed57cbab872b8608766b99e803500e0c37be90572b68d032acef1191b935eb7; candidato SHA256 1dc175a12fa876cf9ac183b29fa6043910bbf9e6236a0cfdd602352bdc7e2104; firma 122fecac81e3d9df35eb37f496a706c364d26245a28a9ab9038e31aee5291407. Human NOT_RUN.

## AR-u5-isobaric-work-06 — Il volume spazzato dal lavoro

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: ΔV=W/p=6 J/(2 kPa)=3 L. È incremento di volume, non il volume finale senza un valore iniziale.

Alternative e feedback: Moltiplicare per p non isola un volume; copiare 6 J non risponde a un incremento in L. V_f necessita anche V_i.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 82647a58426b880ee7cd5b092a00ac5c95e56be99254c9b8cfe26d036b4f9d35; candidato SHA256 f513e4a03a6d3d8330f0cc18e87a3ff8f35adb37cef69b1bded28af2b744e710; firma 8d0d203be7a5875245abb768f13286f6774df3bc369e2ca127eef5b8db77f9c1. Human NOT_RUN.

## AR-u5-isobaric-work-07 — Una corsa maggiore alla stessa pressione

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: W_A=2×3=6 J e W_B=2×5=10 J. Rapporto 10/6=5/3, stessa pressione.

Alternative e feedback: 3/5 inverte le prove; rapporto pressioni è 1 e non rappresenta da solo la variazione del volume.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 01025639b8ea97e55feae38c03ad126c248c015e331a990c91f5a2fb891c3271; candidato SHA256 8619dc4419f98070a82892f11c7039e22aebfffb0a8d617b5fd66ec245a7feb1; firma c8b7dce723215b478bce895c4caef53ad2d1c1df2ef711ed21d5d6d76dfd8bcc. Human NOT_RUN.

## AR-u5-isobaric-work-08 — Lo scarto di un lavoro raddoppiato

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Proposta 12 J meno lavoro corretto 6 J=+6 J, errore con ordine esplicito.

Alternative e feedback: −6 sottrae al contrario, 12 copia la proposta, 0 la accetta e 3 dimezza ancora lo scarto.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 70fdd98f211e1de8b067c691d4ec9e997c776532ca061029927c4a05dd196fe2; candidato SHA256 5f52a8f868331655e8acb2cb6da597b1f6a49b21e43fd66f160abe0d0b4b8659; firma 5c317c73ba8e46d7c185e2856ecae4d0e3856b642ed941b6bbc2ed94a89e1fe2. Human NOT_RUN.

## AR-u5-isobaric-work-09 — L’inversa della pressione costante

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Isolamento p=W/ΔV, unità J/L=kPa. La positività di ΔV esclude il denominatore nullo.

Alternative e feedback: Prodotto WΔV non è pressione; ΔV/W è reciproco della pressione. Fattori due producono lavori diversi dai dati anche con dimensioni corrette.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 8749dc4e6d73ef7a4e50629392c33a6f5a12122666f0f6f727256814941e8e1d; candidato SHA256 7d096085e70fe5f1bab060513c744625f68ae35cdbd34f4afe0d05b60f482ec6; firma 0f8640bb183622d0eaa9eee04029b229aa3e571ce812ae9cbfa7fa875d2632dc. Human NOT_RUN.

## AR-u5-isobaric-work-10 — Scalare pressione e incremento di volume

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Legge bilineare: W_B/W_A=(κ₁p κ₂ΔV)/(pΔV)=κ₁κ₂, con denominatore positivo.

Alternative e feedback: Quozienti invertono un effetto diretto; somma dà 2 per stati identici; un quadrato su κ₂ non deriva da W=pΔV.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 ae683e28bb5df45109621c995fe27e4e1f18caebde5e00e082dc996347669cb3; candidato SHA256 4c134ee3835f0ae92c72a61ccb88f5274c534ddfd89229c8a8405f2843716571; firma 746ac624574aaa3cc6d7226bdd4ae4e407a91e51ba0bc78e55ee8e47ae440c5d. Human NOT_RUN.

## AR-u5-isobaric-work-11 — Due modifiche nell’area del lavoro

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: W_A=6 J, W_B=4×5=20 J. Rapporto 20/6=10/3, non soltanto rapporto delle pressioni o dei volumi.

Alternative e feedback: 3/10 inverte rapporto completo; 2 segue solo p,5/3 solo ΔV,20 è energia numerica B.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 dacedc905519d2f680680efc23a7ea82b6266aca6c2d76dedab83bb48851e159; candidato SHA256 e2196d4e69cb2f48cc6fcd09ad8802a11f1a7acccee56337cad49d117647484a; firma 1e0570c08728d929125ce73c63e2e21da52a427aaff0345a63c78666e06516d0. Human NOT_RUN.

## AR-u5-isobaric-work-12 — Media di due lavori del pistone

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Media (6+20)/2=13 J. Agli ingressi medi p=3 kPa e ΔV=4 L il modello dà 12 J: differenza 1 J.

Alternative e feedback: 26 somma, 13/2 dimezza ancora la media, 14 è la differenza delle due energie. 12 è il modello agli ingressi medi, non la media richiesta.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 14bc1d8a1f726c5612b888d82bd7b8f0775c0047b4b7d63d7085664239520d84; candidato SHA256 b5bef98c4cb701aff70893e42a31e4a1814555dff5166209ba859f7b9f0f7df2; firma f23b644333239cc60cd53098b102501006b8501eaa7e7fcc0f0ae7e5b81e4eac. Human NOT_RUN.

## AR-u5-isobaric-work-13 — Il volume per il lavoro desiderato

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Target (10/3)×6=20 J con p_B=4 kPa richiede ΔV_B=5 L. Rapporto 5/3 rispetto ai 3 L iniziali.

Alternative e feedback: 3/5 reciproco del target del volume; 10/3 è target di lavoro ma dimentica p raddoppiata. Serve distinguere ΔV_B dal suo rapporto con ΔV_A.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 1abc830b7c11962f718b3d7b08641da1e55d2d6b8d0be68c1ce6fb8a9c7182b9; candidato SHA256 9b78271eaad6dfe07fbd6e158d902009a9adbf0591c655fab02c1f17b87cc579; firma d704ce64dfede26756cd863b60a88a4416436c342765bbc9b9b969152117f339. Human NOT_RUN.

## AR-u5-isobaric-work-14 — Tarare una lettura di lavoro

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Riferimento W_A=6 J: q=18/(6 J)=3 J⁻¹. S_B=60 dà W_B=20 J; p_B=20 J/(5 L)=4 kPa.

Alternative e feedback: Usare 60 come joule produce 12 kPa, triplo del valore corretto; usare guadagno sull’incremento anziché sul lavoro cambia la relazione strumentale.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 bd054f4099d0df79151e29332beb95aac9a78a452ff5458845678c6429b73d54; candidato SHA256 35f2001eb72baf69ec4cf3b7fa9bbed13a00cf681fec6e70ff471b4a25c4e74c; firma bfb2be91f2eef2158c8ccf6cb91d9270067793725db8e6bb2757aaba2398d0e7. Human NOT_RUN.

## AR-u5-isobaric-work-15 — Due riferimenti per pressione e offset

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Riferimenti 6 e 20 J: q=(41−13)/(20−6) J⁻¹=2 J⁻¹, b=1. W_C=(25−1)/2=12 J. p_C=12 J/(3 L)=4 kPa, ricostruisce S=25.

Alternative e feedback: Ignorare offset usa W_C=25/2 J, p_C=25/6 kPa e ricostruisce S=26. La pressione corretta ricostruisce entrambi i riferimenti e C.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 236eb59823571c371b2d490829d1999a9dd0dacaae59b001c25cd414bc89b323; candidato SHA256 9f8365a7313cfbed73683f2931502a9c4c128d125e15c97a0b0d4deaa0fd27c2; firma e95ce046bcf2abc464510d72e63e4e3398cdaa56fa8daabcb16074e442762c47. Human NOT_RUN.

## AR-u5-isobaric-work-16 — Un vincolo fra due parametri della prova

Ipotesi e dominio: Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.

Derivazione e procedura manuale: Fra prove p=cΔV con c=(2/3) kPa/L. W=c(ΔV)²=6 J implica (ΔV)²=9 L². Le radici ±3 L soddisfano l’algebra; espansione e p positivi selezionano +3 L e p=2 kPa.

Alternative e feedback: Radice negativa rende negativi ΔV e p, fuori dominio; 9 è il quadrato e non l’incremento. Il vincolo è fra prove, non p(V) lungo la singola isobara.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 168d4a1e58582808f1605d330d9f389387ebc10ddd665683e8c3b852868c58ba; candidato SHA256 bdc6056660e21848a4b7bd9a8d2c557700358e069a9deea6b31bc20342d30c13; firma 09f4007bd97128d7d18b5ea1ca9cd55c47187633e7e39cdd87c794b14349203f. Human NOT_RUN.
