# Revisione indipendente — parallel-flow-divider-112

Revisore distinto dall’autore. Nessuna importazione del modulo autore e nessuna modifica ai candidati. Tutti gli 80 prompt originali U3-04 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Nessuna chiave originale usata per concludere la verifica. Successivamente letti tutti i 16 record di questo lotto: consegna, alternative, ogni formula, hint, feedback, didascalie e metadati C2. Le lezioni reali C2-L005/L006/L007/L008/L009 sono state rilette nel lavoro U3-04.

Edizione candidata congelata solo dopo la lettura: b27a2ca4dfb6bbf951e5b35cd99a3ab9dd6899f2. Package SHA256 28ff37487c5194b02e01e77bf0a480da198b00af574b76d59f773bb3ac356310; binding SHA256 aa47799aa855d2081c9cb6cf7c70864f15cfedaa97432681bf32c0d243d0653f. Oracolo SymPy distinto dal calcolo dell’autore; unità SI controllate con Pint e Fraction, scelte numeriche lette con AST aritmetico limitato. EXACT_ORACLE e AI_CONCEPTUAL sono i soli valori del contratto, senza equiparare una firma a una prova matematica.

Dichiarazione di esposizione: prima della lettura fonte, l’handoff dell’autore aveva anticipato Q_T=10 L/s, le medie 11/2 e 40/7 del caso 12, la scala comune R libera del caso 16 e il grafico a 20 px/(L/s), con 200=100+100 e 200=50+150 px. Le lunghezze implicano anche le portate 5+5 del caso 01 e 5/2+15/2 del caso 04. Non rivendico cecità per 112-01/04/12/16. Ho rifatto indipendentemente continuità e uguaglianza delle cadute, ricavando il divisore, le due medie e la non identificabilità prima di aprire i candidati. Nei casi 12 e 16 la prova riportata sotto deriva da queste equazioni, non dall’anticipazione.

Ipotesi del lotto: Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.

Figura: XML e rendering completo letti. Tre reti schematiche con rami a stesso salto nella prova, non stessa pressione a monte e valle. Frecce singole separate: scala 20 px/(L/s), ingresso 200 px per 10, iniziali 100+100 px per 5+5. Con R₁=3, R₂=1 frecce 50/150 px per 5/2 e 15/2; Δp=15/2 kPa. Barre finali 100+100 e 120+80=200 px per le prove A e B, pressioni 5/12 kPa. Nessuna lettura della resistenza come lunghezza.

## AR-u3-parallel-flow-divider-01

Continuità Q₁+Q₂=10 e cadute R₁Q₁=R₂Q₂. Con R₁=R₂=1, Q₁=Q₂=5 L/s e Δp=5 kPa.

Controllo delle alternative e del feedback: 10 nel solo ramo viola uguaglianza delle cadute e lascia Q₂=0 con resistenza finita; 1 copia la resistenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 5. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d4c5d4942366f095fce0b1acd74a40e64b8651cdcd7806ed291cafc777bee420; candidato SHA256 4f41cd1defc130bbc93085b24984468d3f319b7c383a3c772072996bc830ec02; firma di lettura 9435b19052dfbbee69a40607fba96a0f2e487c50244198640ca865c4823d9b12.

## AR-u3-parallel-flow-divider-02

Portata volumetrica: [Q]=L³/T. kPa/(kPa·s/L)=L/s, con 1 L/s=10⁻³ m³/s. Nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: kPa pressione; kPa·s/L resistenza; s/L portata inversa; L volume senza tempo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: L/s. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 e08a4a2c9ab286beab7afbd1da03da8cf20ef9fe391c95454e535bd9e37edf4a; candidato SHA256 699446ba7607e977b2ee74ce1b27f98041dd90fae0148a2b019a44f0d5a42885; firma di lettura c0051fe19abe5581bc354260ab38296bddc2a66e064c89f4ef008c7ec5d41284.

## AR-u3-parallel-flow-divider-03

Eliminare Q₂=Q_T −Q₁: R₁Q₁=R₂(Q_T −Q₁), dunque (R₁+R₂)Q₁=R₂Q_T e Q₁=Q_T R₂/(R₁+R₂).

Controllo delle alternative e del feedback: R₁ al numeratore calcola Q₂; somma sopra manca normalizzazione; Q_T/R ha dimensione errata.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Q₁ = Q_T R₂ / (R₁ + R₂). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 a7332ac75f1da479c5cb0a52d77936fcf10bd4795924076e4291b2aaa45aecc9; candidato SHA256 e06117a98c21683fe1f49985b42acd43b288cf1bd15453467a9a1a960d73aebb; firma di lettura 728d8745d810ab8f6968691a40e9eedb5179d7687939ee9d595557260ed0780b.

## AR-u3-parallel-flow-divider-04

R₁ da 1 a 3, R₂=1: Q₁ da 10/2=5 a 10/4=5/2 L/s. Q₂=15/2 e Δp=15/2 kPa; la pompa varia la pressione.

Controllo delle alternative e del feedback: 15 supera il totale; 5/3 manterrebbe Δp iniziale fisso; 5 ignora la modifica; zero richiede chiusura limite.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Da 5 a 5/2 L/s. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 648c9e252f0f5d86e09bcdd0db4c53d8261290875eca6a4be8c71fb570bf27e6; candidato SHA256 642992e8ac5cbe29d024a7f5c2a8bccadbf2e9f08c6e1b092ef82e7b6da22f35; firma di lettura 33fe232ceaa903b45e5b28c716fa0e4283e5c8b4e6234c2460f23445780d2569.

## AR-u3-parallel-flow-divider-05

Q₂=10−5=5 L/s. R₂Q₂=5 kPa, diviso Q₁=5 L/s restituisce R₁=1 kPa·s/L. Inversa R₁=R₂(Q_T −Q₁)/Q₁.

Controllo delle alternative e del feedback: 5 copia Q₁ come resistenza; non si divide Δp per la portata totale per ricostruire un singolo ramo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 539dc7baffaa3bd05b59f2b22cb529869684ccd033b80dff9eebc2e6eddc9968; candidato SHA256 c6f5d425edc5391e04355daa7c268775239d4d3b4341a605d2b09a6a1a71d23e; firma di lettura 7bfcccc86a5d1a26bc6d64fee7ca93dd7292e84907e79e4b157af17d48ba290f.

## AR-u3-parallel-flow-divider-06

Da Q₁=5 e R₁=1 segue Δp=5 kPa. Q₂=5 L/s, quindi R₂=Δp/Q₂=1 kPa·s/L.

Controllo delle alternative e del feedback: Usare Q_T al denominatore darebbe 1/2 kPa·s/L, equivalente esterna e non R₂.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f9224992139970765e5f75b93c3fbd727ef9ee1d646f35ca5925cfcb103cb309; candidato SHA256 dfa34d75e2d8234e5ffb299994546e15a3afb0b1ed636942174a61b10e28854c; firma di lettura 7d7154379b8399f05232feec12a655bac8032c14a7cf63a46ce866983b49fd0e.

## AR-u3-parallel-flow-divider-07

R₁=1, R₂=3: Q₁=30/4=15/2 L/s. Rapporto con 5: (15/2)/5=3/2.

Controllo delle alternative e del feedback: 2/3 reciproco; 3 ignora nuova somma; 1/2 scambia l’effetto dei rami; 1 ignora la modifica.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 41c87a4cc378ef188c034a4177940a756a9c043d881963186d49f139c4ffd269; candidato SHA256 ee340cc8c5532675b229326cd3df402a605f290e3adbb98ee09753acd379690b; firma di lettura 8b040df79bf4dfef8c590d66c3e629c02487182916df893be0f266b69ecc9d47.

## AR-u3-parallel-flow-divider-08

Riferimento Q₁=5 L/s. Scarto proposto meno corretto 10−5=+5 L/s. Proposta imporrebbe Q₂=0 e cadute discordanti 10 e 0 kPa.

Controllo delle alternative e del feedback: −5 ordine inverso; 10 proposta; 0 accetta proposta; 5/2 dimezza lo scarto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 5. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 597a33aed15edfc76acfa661574a94ff3dd3943d9a86e96670e951450fed163f; candidato SHA256 0f42f4563f5be1354daceb78a39d63d037c276828f7ad8cd0bf57f5acbaaacfb; firma di lettura e299796505aee6e3d242740b20668d390901839e0de35d5943370bb637615218.

## AR-u3-parallel-flow-divider-09

Da R₁Q₁=R₂(Q_T −Q₁), dividere per Q₁>0: R₁=R₂(Q_T −Q₁)/Q₁. La differenza deve essere positiva per il secondo ramo.

Controllo delle alternative e del feedback: Rapporto inverso scambia i rami; Q₁/R₂ dimensione errata; omettere −Q₁ perde il secondo ramo; senza Q₁ resta pressione.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: R₁ = R₂ (Q_T − Q₁) / Q₁. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 4c490dd2b1beeefd0ab8af68d6b0697df878513b2889932c2ea070d197f43c77; candidato SHA256 6515405a12629769b88ffdcbcaacbdc7df9589f93363ff0321cd82af1f064f04; firma di lettura 482265dad37fa4770cb0a81f8d8989a06de2210d4f17f07aa695e15f4044c0e0.

## AR-u3-parallel-flow-divider-10

B ha numeratore κ₂R₂ e denominatore D=κ₁R₁+κ₂R₂; A ha U=R₁+R₂. Rapporto κ₂U/D, uguale a uno se κ₁=κ₂.

Controllo delle alternative e del feedback: κ₁ al numeratore segue il ramo sbagliato; D/U rovescia la somma; κ₁/κ₂ omette pesi; ultima reciproca.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: κ₂ U / D. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 33f5513e8c46c934c2a89aed35b066234c3d72cac3f293d87c3bfaa451d191a7; candidato SHA256 4f45240b5e2b2929d6e5f104b2358d1d9f801cfe0a4e901eec41b581ed229a47; firma di lettura 99d86057d8f19e28e602bbd91c545f152a93a4d14836337707497cc9b34bff73.

## AR-u3-parallel-flow-divider-11

B: Q₁=10·3/(2+3)=6 L/s, Q₂=4. Cadute 2·6=3·4=12 kPa. Rapporto 6/5.

Controllo delle alternative e del feedback: 5/6 reciproco; 3/2 e 2/3 seguono singoli fattori; 6 è portata numerica e non rapporto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 6/5. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e1734659ca65537a58e4d1adb0eab3900495ca0685967893290f7eaf0d7b2e06; candidato SHA256 afd4006c1984a0c31689998bfb1370c297d2cbd79cc8b145c6f917ffbfd6452b; firma di lettura c8a185f3f868fc273511a11860339240037d662b3bd124831c0fd594af47eff7.

## AR-u3-parallel-flow-divider-12

Media (5+6)/2=11/2 L/s. Ingressi medi R₁=3/2, R₂=2 danno 40/7 L/s; 40/7−11/2=(80−77)/14=3/14 L/s.

Controllo delle alternative e del feedback: 11 somma; 11/4 doppia metà; 40/7 modello agli ingressi medi; 1 differenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 11/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 57c76c5efbe570a536229afd4659410daa2c98cd08a436643689ad212d835639; candidato SHA256 4b0225984cfc6fda93253de6bf49e1c40ad87ab5ff065604bba24597bc471bb8; firma di lettura 2c585c12a4449acf2b2ee0eb3d934f4ca515f1e45ef8ca7f2c6b6f7d0c477244.

## AR-u3-parallel-flow-divider-13

Target Q₁=6, Q₂=4 L/s. A R₁, B=2, Δp=12 kPa; R₂, B=12/4=3 kPa·s/L, rapporto rispetto a 1 uguale a 3.

Controllo delle alternative e del feedback: 1/3 reciproco; 6/5 copia target; R₂=2 dà Q₁=5; R₂=3/2 dà Q₁=30/7.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ddbf4be6254cc550aff2b3d963a7a8ebc831a7227f2a7814f58ed4f0e15271d5; candidato SHA256 3122271690c34ce8e6146af7dd55d230bf1df990e038144230f5b32c88902320; firma di lettura 6f2c054477331ab77676db34da9bc3751811bb9006f1c5398c04fadb1c0f4658.

## AR-u3-parallel-flow-divider-14

Riferimento Q₁=5 e S=15: q=3 s/L. S_B=18 dà Q₁=6, Q₂=4. R₂=3 produce Δp=12 e R₁=12/6=2 kPa·s/L.

Controllo delle alternative e del feedback: 18 grezzo supera Q_T e non è portata fisica; prima togliere q, poi imporre positività di entrambe le portate.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 08e8786a4587e62ff5a82cb711595ee339b8dad5fcca715d6c3b586b5ad239f2; candidato SHA256 407817f4ae4ce8292f3a2725e925c1ed488d67d1263d4fbc5afafbf071e53c10; firma di lettura fd976795dabbd66b7f9d21641dad58193599df9ce08edb98b06030f63034c502.

## AR-u3-parallel-flow-divider-15

Riferimenti Q₁=5,6 e S=11,13: q=2 s/L, z=1. S_C=6 dà Q₁=5/2, Q₂=15/2; R₂=1 implica R₁=3 kPa·s/L.

Controllo delle alternative e del feedback: A R₂=1, R₁=1,2,4,6 generano S=11,23/3,5,27/7; solo 3 dà 6.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ffb90902b88c83887ba29e3d90d80ecbe2ac3ed32a0c08ff14604822f3e25ac4; candidato SHA256 00f56d35bbe91268768fc7af5be105c98bbf2896551e9744208c9b17d31e62a3; firma di lettura 539d10cbc2257a4e86b39ea468b46b072e143ded2b1fcedd90329f4300e86098.

## AR-u3-parallel-flow-divider-16

Con R₁=R₂=R>0, Q₁=10 R/(2 R)=5 L/s per ogni R. (1,1) e (2,2) sono esempi di infinite coppie, con Δp=5 e 10 kPa; scala non identificata.

Controllo delle alternative e del feedback: Una e due confondono esempi con cardinalità; nessuna è falsa per R=1; coppia nulla fuori dominio. Una pressione aggiuntiva fisserebbe R.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Infinite. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 b35640d4dfa95e0c3e6fb8070c6b73ae8da22f475cc5407acc34c2fd67f078bf; candidato SHA256 081decc204d481ccaeda1428ca99720b958230db2729277246e30b9c02c20a86; firma di lettura 55a3900d2b0cb754177cf3fec1e32bda2c2753f1449d804258e9528abf0e1316.

Controprove riproducibili: 24 per questo lotto, incluse tutte le 16 chiavi sbagliate con binding e ogni token/guardia d’edizione rinnovati esclusivamente in memoria dal test. Queste chiavi falliscono l’oracolo matematico o la risposta concettuale motivata anche dopo la sostituzione delle firme. Prove distinte per falsa fisica a chiave corretta, fonte falsa con token sostituiti, unità errata, lotti vuoti/parziali/duplicati e SVG incorporato o locale mutato. Le prove su testo e figura sono guardie dell’edizione riletta, non risolutori semantici universali.

assert_record_identity controllato sui report fresh e salvati contro i pacchetti e binding canonici reali. Le proprietà Hypothesis esercitano ulteriori configurazioni fisiche e i test leggono coordinate dei grafici, senza scritture nel registro o nei candidati. La suite completa e le anteprime finali sono responsabilità dell’integratore; questo report non le sostituisce. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana simulata.

Prova finale sui byte consegnati: `python -m unittest tests.corpus.test_cross_review_viscosity_networks -v` con runtime recovery, 11 test PASS in 3,504 s. Le cinque proprietà Hypothesis hanno 35 esempi ciascuna (175 configurazioni); gli altri test comprendono 80 identità fresh/saved, 80 hash fonte riletti da Git, unicità esatta delle alternative numeriche, AST limitato e geometria dei grafici. Tutti i 21 file di questa consegna controllati per singola newline finale e assenza di whitespace finale; SHA dei verificatori coerenti con i report salvati.
