# Revisione indipendente — wave-phase-time-137

Revisore distinto dall’autore. Tutti gli 80 prompt originali B135–139 di U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Le derivazioni per ID sono state salvate prima di aprire qualsiasi pacchetto B; nessuna chiave originale consultata. Gli handoff contenevano soltanto SHA, file e ipotesi generali, senza risultati numerici o chiavi. Il revisore ha scritto altre famiglie A130–134 e conosce le leggi dell’oscillatore da quel lavoro: non rivendica ignoranza della fisica, ma separazione dell’autoria e derivazione prima della lettura di queste candidate. Nessun modulo autore importato e nessun candidato modificato.

Successivamente letti tutti i 16 record del lotto: ogni consegna, opzione, blocco, formula, hint, feedback, didascalia e metadato. Cinque SVG controllati in XML e rendering nativo completo. Mapping al vero corso C5: competenze C5-L01/L02/L04 e prerequisiti esistenti; lezioni C5-L01/L02/L03/L04/L05 e C1-L003/L005/L006/L008 rilette durante il lavoro U4. I trasferimenti C1 nelle schede energetiche sono espliciti.

Edizione finale riletta: 98211c55303c351d0334c2cdcdf50a04aa5a827a. Package SHA256 330b1546b465dc5a97f3e652b5b4a7e214bf23ba3b39136970a027d8929c5bc3; binding SHA256 32aa22cbe5e4d1a1549b0c3fcd974012d070ec3f184c12290f52afa635aa5b00. Modello SymPy separato dal calcolo autore, unità esatte con Pint e Fraction, risposte interpretate con AST aritmetico limitato e senza eval o sympify del testo candidato. Le sole enum usate sono EXACT_ORACLE e AI_CONCEPTUAL. I casi qualitativi conservano una prova fisica specifica anche quando non richiedono un calcolo numerico autonomo.

Ipotesi generali: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Figura: XML e rendering completo letti. Timeline a 120 px/s, sei caselle 60 px per periodi 1/2 s: 3 s danno 6 giri. Secondo pannello stessa f 2 Hz: 60+30 px rappresentano 3/4 s, 1+1/2 giri. Nel grafico finale origine(100, 1350), endpoint(460, 1110), scale 120 px/s e 40 px/giro; punti(3/4, 3/2), (1, 2), (3, 6) sulla retta N=2Δt. Nessun arrotondamento di fase.

## AR-u4-wave-phase-time-01

f=2 Hz, Δt=3 s: N=6 giri.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 3 copia tempo; 2/3 divide; 12 raddoppia; 1/6 reciproco. La fase accumulata non è spazio percorso.

Esito AI: PASS_AI. Risultato esatto: 6. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 22089c907652bfd52a20ccc29280fb28ee76b54259213f373e332e5232e4b47e; candidato SHA256 71f804a8b4e5cebd5e9f1791720bf9b0aefb3a81b5d2df5ccc9cc542fbbacb44; firma di lettura 62cd47bb8d7eefa2e53893ffff7355b4bda87cb5b8c5a78086288f8ef71f4781.

## AR-u4-wave-phase-time-02

N è puro, etichettato in giri; Hz·s=1.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: Hz frequenza, s durata, m lunghezza, m/s velocità. Il prodotto Hz·s è puro senza obbligo di integralità.

Esito AI: PASS_AI. Risultato esatto: numero puro (giri). Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 ce843b880de2630280b6394fcc444211f83cd7a13a25f341731962eedc928347; candidato SHA256 933c8a5f4d94af166beddc1a09de5b37f484dce50ca6f3840013f7288e787f00; firma di lettura 87304308be2b15624e7505de47a15496fe3dacef2a70a6fe2b9fbdaab216898b.

## AR-u4-wave-phase-time-03

T=2/5 s dà f=1/T=5/2 Hz, senza approssimazioni.

Ipotesi applicate: Solo 03: periodo completo T=2/5 s, ritorno alla stessa configurazione e allo stesso verso; frequenza costante f=1/T, non confondere mezzo periodo.

Alternative e feedback: 2/5 copia T, 5 dimezza T prima di invertire, 2 copia numeratore, 5/4 usa periodo doppio. Il dato richiede stessa configurazione e verso.

Esito AI: PASS_AI. Risultato esatto: 5/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ad645b163b3bd23f7430283c65d1251b13c42d677e90c8fcbba96e4cf7e01f3a; candidato SHA256 46a4cbceb43853f64036644b11abd7e59e1d01657a54f7567ea5505a1a43e3c6; firma di lettura e1c605ab6e19dc95ec30e2cbaf303254990f279a458a3f1754e914faa27673f4.

## AR-u4-wave-phase-time-04

f da 2 a 1 a Δt=3 dà N da 6 a 3 giri.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 12 inverte effetto; 3/2 dimezza due volte; 6 ignora variazione; 0 fuori f, t>0.

Esito AI: PASS_AI. Risultato esatto: Da 6 a 3 giri. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a24b2227b27fd8f3c3a80caa8e2fc8bb6c1d7130fb93fafa0fd0883757fcc303; candidato SHA256 c5d3e4cb2ea65d7daeefa10bd55bd5a8bff1424b61df80b2a626adcc175e7d19; firma di lettura 48abb39952fb8cf46f9d8c5037587b18b528fd7567b756802781a6a60583bd9f.

## AR-u4-wave-phase-time-05

f=N/Δt=6/3=2 Hz.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 18 moltiplica; zero è fase residua modulo uno e perde i sei giri accumulati.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 023e1cecf3decd7ee223e4a8f4c2aaad953c61f76191eacb044e61ab6bd9ad8a; candidato SHA256 fb151f9202fbc9760527791c2d800da3a8b9957a216297b01923b014e2df3a4a; firma di lettura e54ff9c1801cf5f729806cf104ae0df6c7ab9bd7fc0afded68b6b8d19b08b618.

## AR-u4-wave-phase-time-06

Δt=N/f=6/2=3 s.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 1/2 s solo un periodo; 12 moltiplica per frequenza anziché dividere.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 30828395e0cd2d528e261db09f452ad22f57849bcc33348b730d53d441ea44e4; candidato SHA256 d771b8400488251da3c3765d0deea4d2b17ff230c7e8c5267c93c500b3022dbe; firma di lettura 720119b336b16287724c8e728ac8be2af73a6081fc495454da5790241f9297cc.

## AR-u4-wave-phase-time-07

Δt_B=1 a f=2 dà N_B=2; rapporto 2/6=1/3.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 3 reciproco; 2 N_B; 1 ignora durata; 1/9 potenza quadratica non presente.

Esito AI: PASS_AI. Risultato esatto: 1/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5c57a776df0612fd579b32bf57e72e4f400ed566dd24fe83dbd430c306d38451; candidato SHA256 cbfa86d6f9013b2f0793375f948933cca3ecf249ef69504fdde2a569e3385b18; firma di lettura 1e9a89102532e9540d8c5c7ebce9650851434572692bfcc7c77ae689343948fe.

## AR-u4-wave-phase-time-08

e=12−6=+6 giri.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: −6 ordine inverso; 12 proposta; 3 dimezza scarto; 0 ridurrebbe modulo uno perdendo errore.

Esito AI: PASS_AI. Risultato esatto: 6. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 971538a98671153c12020e66d624d6e198d4f9ec912754cf13fea92494972bc6; candidato SHA256 feb7055013ba3b1768ced7d6d07dfb5745e14ca66de127eb81d65a41696e4fbf; firma di lettura cbd75069a2d1a6592603c75d0e71dbd2ed553c390df4e4bdacbe75e7792fdef6.

## AR-u4-wave-phase-time-09

f=N/Δt; nessun 2π aggiunto dopo aver convertito la fase in giri.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: NΔt e Δt/N tempi; 2πN/Δt pulsazione; N/Δt² tempo inverso quadrato. Nessuna di queste isola f.

Esito AI: PASS_AI. Risultato esatto: f = N / Δt. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 cecb6d38d69c3d0a7692bac607be4af83013e60403706f8f734bcb05f092f235; candidato SHA256 217b3b310c2664f0436d4d882dee1e6916d685b8820f62f049692d8f776aa70b; firma di lettura dc2e254f53a93252720c84c4edff04218b33bef3bf98e6f023c40950c7d63fe6.

## AR-u4-wave-phase-time-10

rapporto κ₁κ₂.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: Quozienti invertono un fattore diretto; durata quadrata indebita; somma due per stati identici.

Esito AI: PASS_AI. Risultato esatto: κ₁ κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 ae8c551027e6dbc7f95eb8f64df152c5e22fb91d1db76c2eb6a36b20ac807f62; candidato SHA256 5f7852a2a343dfac4b4e9b87986c3b6eaaf9a215547c1827c51d1f1ad999c871; firma di lettura fa7b0de888829ce96cf766c9cd79bc2a464263933766fac1b175596c7fda76be.

## AR-u4-wave-phase-time-11

B con f=4, Δt=2 dà N_B=8, rapporto 4/3.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 3/4 reciproco; 2 solo f; 2/3 solo durata; 8 fase finale non rapporto.

Esito AI: PASS_AI. Risultato esatto: 4/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e3fea3d05baf1f9f44929a267fe73df70ef4f149b3f2ae15080fb7d80df80e72; candidato SHA256 466eadbfdde930778570363bb924875747dca7e25b8d9089af4679e90332295c; firma di lettura 3d028b15f449c5d70d945a2d8dc03daedeca657ba62381fac47d6c6f4c4825e7.

## AR-u4-wave-phase-time-12

media (6+8)/2=7 giri. Ingressi medi f=3, Δt=5/2 danno 15/2, maggiore per 1/2.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 14 somma; 7/2 doppia metà; 2 differenza; 15/2 modello agli ingressi medi, maggiore 1/2.

Esito AI: PASS_AI. Risultato esatto: 7. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c5740dcb039e52452cd0fe11ce55fc6184f4de234e6071296f3d6a27079b8386; candidato SHA256 e1d19b3043e078e689858cd80daaf7f808560bbc6b7c37b0b72c2b3d95b822b8; firma di lettura d43bea3ccd0528d53120c76e487ceaf20c10dd02f03936c6a6d66735e870300c.

## AR-u4-wave-phase-time-13

target N_B=8 a f_B=4 richiede Δt_B=2 s; rapporto con 3 s pari a 2/3.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: 3/2 reciproco; 4/3 solo target; 2 numero della durata B; 1/3 produrrebbe 4 giri.

Esito AI: PASS_AI. Risultato esatto: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 28549887a5e162cc3b254de9ae0b20d73e0cca9a2837d06acb066b0cf922330f; candidato SHA256 5ef29111ab40c6e96ceede1c5327bc2414a9319cae2ce7fe6dd90808eae982b2; firma di lettura efc241b23d565fb3d9453f4423a7afa8243c14e57c6ff4ac7c4522beada4801a.

## AR-u4-wave-phase-time-14

gain 18/6=3; S_B=24 dà N_B=8, Δt_B=2 porta f_B=4 Hz.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: S 24 trattato come N porta 12 Hz, triplo. Rimuovere gain prima di dividere per durata.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 48123e8f5755b5df4c4d628286f0354c0edf51efce90d8fae4843e8d60837fd6; candidato SHA256 b08c9524c076f37039256f99de4a7011c43e834172d413354779dd334564abe1; firma di lettura c00d7f95e49112594d2fe3b956b56dd56e5bdc99ee1ebac3167bcdee01886509.

## AR-u4-wave-phase-time-15

gain (17−13)/(8−6)=2, offset 1. S_C=25 dà N_C=12, Δt_C=4 porta f_C=3 Hz.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: f 2, 4, 6 con durata 4 s producono S 17, 33, 49; 25/4 Hz ignora gain e offset e produce S 51.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e598eedd9422950ee9178118c407936467c5dc09bb6f1d8ecdb6913ec53fcb83; candidato SHA256 4a1d59e05ba43ea7ddce49d830e179c42c8c123a102467b152ac9e74bf82da50; firma di lettura 1134a3293fcba6c2c8ac6e0760a7c2d7c1ec073aebbf9e4159fd02bbbbb4f649.

## AR-u4-wave-phase-time-16

f=cΔt con c=2/3 s⁻² rende N=c(Δt)². Dato N=6, (Δt)²=9 s² e Δt=3 s positiva, f=2 Hz. Vincolo fra prove, non frequenza variabile nel tempo della stessa prova.

Ipotesi applicate: Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.

Alternative e feedback: Nove è durata al quadrato; ramo negativo viola durata e frequenza positive. Nessun mezzo da integrare perché f è costante per prova.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 30bd65dd6a12cb458daecd987ba93e5b719b6f3d0739fbc6846e30cca268fa9e; candidato SHA256 1f56eeb9e4783a31745565c146b419128111e686d0295c1781eca004df19f9d4; firma di lettura a544240472b12eeb5cd04939d373c33c751b066cdbfd6d3fea0397c225fb6beb.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo il rinnovo del binding, dei token e di tutte le guardie d’edizione esclusivamente in memoria nel test. Resta attivo l’oracolo matematico o la risposta concettuale motivata, non la sola impronta. Altre prove coprono falsa fonte, unità errata, batch vuoto/parziale/duplicato, falsa fisica a chiave corretta e SVG incorporato o locale mutato. Le guardie su testo e figura certificano l’edizione letta e non sono risolutori semantici universali.

assert_record_identity verificato sui report fresh e salvati contro package e binding reali integrati ROOT. Proprietà Hypothesis per ulteriori configurazioni fisiche e test geometrici sui cinque SVG. La suite generale, il replay browser finale e l’integrazione spettano al root. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.

Nota sul test comune: il primo run non era PASS. La mutazione d’unità sceglieva sempre Hz, che in 137 era già l’unità originale e quindi non mutava nulla; ora sceglie sempre una dimensione diversa e lo asserisce. Il lettore XML è stato corretto per ignorare il rettangolo di sfondo senza attributo y, mantenendo tutte le asserzioni sulle sei caselle e sulle coordinate fisiche. Nessun candidato, oracolo matematico o criterio di accettazione è stato indebolito per queste correzioni della fixture.
