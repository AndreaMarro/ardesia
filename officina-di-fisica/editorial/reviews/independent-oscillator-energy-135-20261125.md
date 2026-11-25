# Revisione indipendente — oscillator-energy-135

Revisore distinto dall’autore. Tutti gli 80 prompt originali B135–139 di U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Le derivazioni per ID sono state salvate prima di aprire qualsiasi pacchetto B; nessuna chiave originale consultata. Gli handoff contenevano soltanto SHA, file e ipotesi generali, senza risultati numerici o chiavi. Il revisore ha scritto altre famiglie A130–134 e conosce le leggi dell’oscillatore da quel lavoro: non rivendica ignoranza della fisica, ma separazione dell’autoria e derivazione prima della lettura di queste candidate. Nessun modulo autore importato e nessun candidato modificato.

Successivamente letti tutti i 16 record del lotto: ogni consegna, opzione, blocco, formula, hint, feedback, didascalia e metadato. Cinque SVG controllati in XML e rendering nativo completo. Mapping al vero corso C5: competenze C5-L01/L02/L04 e prerequisiti esistenti; lezioni C5-L01/L02/L03/L04/L05 e C1-L003/L005/L006/L008 rilette durante il lavoro U4. I trasferimenti C1 nelle schede energetiche sono espliciti.

Edizione finale riletta: e49b1ee7d32c2822dd14e7605019cf4c96416373. Package SHA256 6aac0cdbf1f85a4476b52cd6fef2a4676574b1a3bf2e8481d79f162e4bb90f7f; binding SHA256 c623fbd3e1a01149b9fea9493904841e660193a8127d99f5d99f177a4bf40164. Modello SymPy separato dal calcolo autore, unità esatte con Pint e Fraction, risposte interpretate con AST aritmetico limitato e senza eval o sympify del testo candidato. Le sole enum usate sono EXACT_ORACLE e AI_CONCEPTUAL. I casi qualitativi conservano una prova fisica specifica anche quando non richiedono un calcolo numerico autonomo.

Ipotesi generali: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Figura: XML e rendering completo letti. Posizioni 200/320/440 px per −2/0/+2 m a 60 px/m; ampiezza 120 px per 2 m distinta da distanza totale 4 m. Barre conservative 100 px a 25 px/J per E 4 J, elastiche all’estremo e cinetiche al centro. Caso smorzato separato: segmenti 120/60 px per A 2/1 m, barre 100/25 px per E 4/1 J. Si confrontano punti di inversione distinti, non un’esatta legge dell’inviluppo continuo.

## AR-u4-oscillator-energy-01

k=2 N/m, A=2 m: E=2·4/2=4 J.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Otto omette il mezzo del triangolo sotto kx; due non conserva A². U=0 al centro non significa E=0 perché K=E.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 82410150947a3107d9905e37d1f78e621f357c92e22862748663705cf2dbfd2a; candidato SHA256 741cf565946566daecdc48d7967b33c5c5f7111c11347654634fcd2bb2c7fe6c; firma di lettura 69bc620e1856c2b85321a5e003752a7ccb2e15e120a4e1dd3f8d91f0917685a3.

## AR-u4-oscillator-energy-02

(N/m)m²=N·m=J; unità energetica.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: N forza, N/m rigidezza, m/s velocità, W potenza. J=N·m, non N/m.

Esito AI: PASS_AI. Risultato esatto: J. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 b4550947fa06090f202a6fe26109f8cfa97aeed8ac0f2eba2ad845b78fe324fd; candidato SHA256 401dbbc06c9e15a3365d374e98b0bfac331055674a34c6e99d01935532781c31; firma di lettura dc48a6ddcb7a285611a53568007ff29eea8afdd66c918a7bf35c0e93c2c93271.

## AR-u4-oscillator-energy-03

in assenza di apporto esterno, attrito converte energia meccanica in energia interna del sistema e ambiente; ampiezza diminuisce, energia totale non viene distrutta. Non applicare la conservazione della sola K+U al sistema con attrito.

Ipotesi applicate: Solo 03: massa e molla reali con attrito debole passivo, nessun apporto da forzante. Si confrontano energie ai punti di inversione, senza assumere conservazione della sola E_mecc o una forma esatta continua dell’inviluppo. Energia totale con ambiente conservata.

Alternative e feedback: Distruzione dell’energia totale è falsa; costanza della sola E_mecc contraddice ampiezza decrescente. Attrito passivo compie lavoro negativo; il periodo da solo non sostituisce il bilancio.

Esito AI: PASS_AI. Risultato esatto: L’energia meccanica si trasforma in energia interna della massa, della molla o dell’ambiente. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 af46c0c9ff57fbc4ac8a8014e1ebd49eb6955ef9b5721e5fc33781c4b8a3f64e; candidato SHA256 122197baaed9917a9df709b06005970270c71c3008a45123bbb4f9281c38f27c; firma di lettura efedc9120501d82e8636b9f3a5a60c874496f6f660c142401b43ab002df1f91d.

## AR-u4-oscillator-energy-04

k=1, A=2 dà E=2 J, metà del valore iniziale.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Otto inverte k, uno dimezza due volte, quattro ignora la nuova rigidezza; zero viola k, A>0.

Esito AI: PASS_AI. Risultato esatto: Da 4 a 2 J. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d3e30b9dc7774e3dd984e50e18c3607c9f68d5395d2298477586914096936bad; candidato SHA256 46972e2d7101e0399af3c719e49f082d8c6ca8f4018b6e89cd90092932849411; firma di lettura 228e6da077e1feb74cfdf07b2ef8fcfe92376444072bf3ffeef91346ce977fda.

## AR-u4-oscillator-energy-05

k=2 E/A²=8/4=2 N/m.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Omettere il due dà 1 N/m; scambiare A con 2 A quadruplica il denominatore e riduce k di quattro.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 656803edd4231aab9a247eda6d9674c5e0ffa573b666fb1df13a63fb2f36f822; candidato SHA256 c4e5a302a0fe455146492240a510e0a6fc6fe6cb08e712366df792851f5b8202; firma di lettura a4f65a27a2ed1cd8de7aabd32bd75ca90d1f92751cace5218f6c9d6ae43fcf83.

## AR-u4-oscillator-energy-06

A²=2 E/k=4 m², ramo A=2 m>0.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Quattro è A² numerico e anche distanza fra estremi, non A; ramo negativo possibile per x ma escluso per ampiezza.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 61c42394d7868cd0b8045c74140b6eb476e374059fcced9eac9e5d410a37dce6; candidato SHA256 4333132da3a94db79c29ec3d4d0c370a8502108e121b1793b4ad68a45c7f7ede; firma di lettura e423bbc8959e92cc558560f6b9e0e648f3de7f4ca7421339df0dd3d3fb31db75.

## AR-u4-oscillator-energy-07

ampiezza doppia 2→4 m, energia 4→16 J, rapporto 4.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Due è il rapporto lineare di ampiezze o forze; 1/2 e 1/4 sono inversi; uno ignora la variazione.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c2f76af57cf336567d163cff3c32d9f985852bc94d8f35b65d3629198c04c8d0; candidato SHA256 66cb6890b00bc91c1271a8eaee806ce90ed6f7fd4b31dc77c641d75d13a0820a; firma di lettura 6290bebbb948c985e6769977b8915b48306a115aa18c45673a4300f0aedd9291.

## AR-u4-oscillator-energy-08

proposta meno corretto 8−4=+4 J.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: −4 ordine inverso, 8 proposta, 0 accetta, 2 dimezza ancora lo scarto.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 51779c287c315b9343990e857458949b4f17e92e555039b67f87c8ff4b2ca192; candidato SHA256 c988945c3ee98aef457a8b4a855f655ed6ea96a80a2caf90352eb470dab4006b; firma di lettura f2a56e2a410bca1d6ad96118521f167e2f9ecd17f9888d7d93b22ad3fc4d513e.

## AR-u4-oscillator-energy-09

k=2 E/A²; J/m²=N/m.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: E/(2 A²) quarto del corretto; 2 EA² ha unità J·m²; A²/(2 E) inversa di k; 2 E/A è forza.

Esito AI: PASS_AI. Risultato esatto: k = 2 E / A². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 c56fb43c77aca69d58418b8f32996448bfe05616e0e0087d4c65a9672fff0136; candidato SHA256 ca70d4cb885964295340b8d78f72909f2f8e1774f7fb6e1875d98d274dd1bd3c; firma di lettura d2b8fa21da529c35ca5bd9e82f3ff4d4f160c21ce87eacf9040168a8b0cf2ce8.

## AR-u4-oscillator-energy-10

E_B/E_A=κ₁κ₂², k e A positivi in entrambe le prove.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Una sola potenza di κ₂ confonde energia e forza; quozienti invertono dipendenze; κ₁² quadra k anziché A.

Esito AI: PASS_AI. Risultato esatto: κ₁ κ₂². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 dbeb6cba1e661014781e67aba3607a9e57a20d4227feedcd9e3fad3b066113b4; candidato SHA256 539ee24fdaf8c4fc73af248b67a86174dca6ebfc1cc1f4bad1e4c10852e5e5d0; firma di lettura a10d54019a85fe7e4496a610a4480addaa83e5274312e8b28ee3ea5ec9593444.

## AR-u4-oscillator-energy-11

B con k=4, A=3 dà E_B=18 J; rapporto 18/4=9/2.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: 2 segue solo k, 9/4 solo A², 2/9 reciproco, 18 valore finale non rapporto.

Esito AI: PASS_AI. Risultato esatto: 9/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7457ed61057321f6b849a5e26b1a3ea57f1fe3a28b27e56006295255c7e3552a; candidato SHA256 bf3a178f54508a8cf2c59ae87ba011bfb0c5ddbbed41ae6f962ac00fb1961079; firma di lettura 3b45e6562bed8fbf533e9c3717c3009baa65b39e42b3c1191770d845367c5077.

## AR-u4-oscillator-energy-12

media (4+18)/2=11 J. Ingressi medi k=3, A=5/2 danno 75/8 J, inferiore di 13/8 J.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: 22 somma, 11/2 doppia metà, 14 differenza; 75/8 è il modello agli ingressi medi.

Esito AI: PASS_AI. Risultato esatto: 11. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 af30cf50c929380bd8f34862c0a46994757234965237fc84e79fa9d0db4d506e; candidato SHA256 2c65f6525f9aa744d8658541bc97bc138a61e475ed7ee3b80d299ce2e20cb6de; firma di lettura 00f8df32462eb9749a00b79dd46f17c4c6870413b0e5337f415e7cf108e60a6e.

## AR-u4-oscillator-energy-13

target E_B/E_A=9/2 e k_B/k_A=2 implica (A_B/A_A)²=9/4; ramo positivo 3/2 e A_B=3 m.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: 9/4 è rapporto al quadrato; 2/3 reciproco; 9/2 target e 3 ampiezza B numerica, non rapporto.

Esito AI: PASS_AI. Risultato esatto: 3/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 0e347db162874460d3f7977c6ecffb763b4c2a589b8386b101efb9592d56187e; candidato SHA256 8a7cc1543082f4876d749857c4f385b018ec9197c3b9bcce5afd1ae2c778cb77; firma di lettura 249e783c760cefd829ecd6f0816c5ffcaa0253320ca7b3eaea2f4b6ecca7656e.

## AR-u4-oscillator-energy-14

gain 12/(4 J)=3 J⁻¹; S_B=54 dà E_B=18 J. A_B=3 m implica k_B=36/9=4 N/m.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: La lettura 54 usata come J produce k 12 N/m, triplo. Prima rimuovere gain, poi usare A_B².

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 04743f7f4f9ecc93b4df9f75415dbc971be3fe7ed587c8b7a61febb14957573f; candidato SHA256 25b17afb9403d0fa76bc6a6f3ab11c21585356855713c0443061bd99a30ea3b4; firma di lettura c2861655ce0f9a0dbd039d21d83c9ea80d331e30881d15488cdbf9ddc7d21ba5.

## AR-u4-oscillator-energy-15

gain (37−9)/(18−4)=2 J⁻¹, offset 1. S_C=2 dà E_C=1/2 J; A_C=1 m implica k_C=1 N/m.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: A 1 m con k 2, 4, 8, 1/2 dà S 3, 5, 9, 3/2; solo k 1 produce S 2.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 fdb31d98388fc9bec8519fe4470956885cb1e1e442de8c18e23973a479d21b52; candidato SHA256 dcfddef00a580f775eadaa034bae492f6f365ea7e6f4778815c740dbe0c43f35; firma di lettura 5846231531562b2a4870a415f195ae3a6eb7da39e7e654e9baaab564a5f20ef3.

## AR-u4-oscillator-energy-16

k=cA con c=1 N/m² rende E=cA³/2; E=4 J impone A³=8 m³, unica A=2 m positiva, k=2 N/m. Il coefficiente è dimensionato e il vincolo lega prove diverse.

Ipotesi applicate: Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.

Alternative e feedback: Otto è il cubo numerico, non A. A³ crescente su A>0 garantisce unica radice fisica; non si varia k dentro una stessa prova.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7b18f9a876c4ea4c12fafb94013324e46ba69bde6973fc84d120f7ad9d13d0d8; candidato SHA256 20de44daaa0533a250d07ecc54c8e9707ba5141e9e29e10ca461c07b488d9870; firma di lettura 7b5409dd190f59e000fda8cf84a27565c0a306600b85da05c1ddf9bcdbac3522.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo il rinnovo del binding, dei token e di tutte le guardie d’edizione esclusivamente in memoria nel test. Resta attivo l’oracolo matematico o la risposta concettuale motivata, non la sola impronta. Altre prove coprono falsa fonte, unità errata, batch vuoto/parziale/duplicato, falsa fisica a chiave corretta e SVG incorporato o locale mutato. Le guardie su testo e figura certificano l’edizione letta e non sono risolutori semantici universali.

assert_record_identity verificato sui report fresh e salvati contro package e binding reali integrati ROOT. Proprietà Hypothesis per ulteriori configurazioni fisiche e test geometrici sui cinque SVG. La suite generale, il replay browser finale e l’integrazione spettano al root. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.

Nota sul test comune: il primo run non era PASS. La mutazione d’unità sceglieva sempre Hz, che in 137 era già l’unità originale e quindi non mutava nulla; ora sceglie sempre una dimensione diversa e lo asserisce. Il lettore XML è stato corretto per ignorare il rettangolo di sfondo senza attributo y, mantenendo tutte le asserzioni sulle sei caselle e sulle coordinate fisiche. Nessun candidato, oracolo matematico o criterio di accettazione è stato indebolito per queste correzioni della fixture.
