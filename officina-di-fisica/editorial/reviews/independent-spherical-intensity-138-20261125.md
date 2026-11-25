# Revisione indipendente — spherical-intensity-138

Revisore distinto dall’autore. Tutti gli 80 prompt originali B135–139 di U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Le derivazioni per ID sono state salvate prima di aprire qualsiasi pacchetto B; nessuna chiave originale consultata. Gli handoff contenevano soltanto SHA, file e ipotesi generali, senza risultati numerici o chiavi. Il revisore ha scritto altre famiglie A130–134 e conosce le leggi dell’oscillatore da quel lavoro: non rivendica ignoranza della fisica, ma separazione dell’autoria e derivazione prima della lettura di queste candidate. Nessun modulo autore importato e nessun candidato modificato.

Successivamente letti tutti i 16 record del lotto: ogni consegna, opzione, blocco, formula, hint, feedback, didascalia e metadato. Cinque SVG controllati in XML e rendering nativo completo. Mapping al vero corso C5: competenze C5-L01/L02/L04 e prerequisiti esistenti; lezioni C5-L01/L02/L03/L04/L05 e C1-L003/L005/L006/L008 rilette durante il lavoro U4. I trasferimenti C1 nelle schede energetiche sono espliciti.

Edizione finale riletta: 2d10f59b6e6f78dc74d5f99cc526f95db27c4345. Package SHA256 468a355ab2ac44bcb00b9b93e52ada75dcf5161469e17567a4b2125fe352bc90; binding SHA256 d40d07589144d9d429c8b47dbb2cb514ced20d951e7c98c5991d7e125b70c4a6. Modello SymPy separato dal calcolo autore, unità esatte con Pint e Fraction, risposte interpretate con AST aritmetico limitato e senza eval o sympify del testo candidato. Le sole enum usate sono EXACT_ORACLE e AI_CONCEPTUAL. I casi qualitativi conservano una prova fisica specifica anche quando non richiedono un calcolo numerico autonomo.

Finding originale 138-01: «1/4 inverte il quoziente» attribuiva un reciproco falso, perché 4/4=1 e il suo reciproco è ancora 1. Il valore 1/4 omette invece p e usa soltanto 1/r². Correzione dell’autore 2d10f59b riletta integralmente nel record 01 dal Git pin e confrontata con il ROOT integrato: soli feedback/error e binding 01 cambiati; altri 15 record, tutte le chiavi, formule e SVG identici. La firma finale non approva il testo originale difettoso.

Ipotesi generali: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Figura: XML e rendering completo letti. Cerchi concentrici 80/160 px a 40 px/m per sfere di raggi 2/4 m. Raggio obliquo(96, 128) px ha norma 160 px; i cerchi sono sezioni e non superfici sferiche. Barre area 100/400 px a 100 px per S₀=16π m², rapporto 4. Barre intensità 200/100 px a 200 px/(W/m²) per prove con p 4/8 W, r 2/4 m e I 1/1/2 W/m². Potenza costante radialmente solo entro una stessa prova.

## AR-u4-spherical-intensity-01

p=4 W, r=2 m dà I=1 W/m²; P=16π W esatto.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: Due usa p/r anziché p/r²; quattro copia p. Il valore 1/4 omette p e usa solo 1/r², non il reciproco di 4/4=1. Il finding dell’edizione originale è corretto dall’autore in 2 d 10 f 59 b e riletto separatamente.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 85e8d1815bbc3844a3350e5839a6ad88c8b455ab405a9f22aa908346a8294733; candidato SHA256 010661e556f5ee1e5c983acc6be1a07dd4aef4598b36a903a8c353a5897b6de3; firma di lettura 7145d2b5374c7c3d4deaea92fabde0d54df84c2847a0ca2fb28f0620e4637cf1.

## AR-u4-spherical-intensity-02

intensità W/m², energia per tempo e area normale al flusso.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: W potenza, J energia, Pa pressione, W/m potenza per lunghezza. p in W non diventa pressione a causa del simbolo.

Esito AI: PASS_AI. Risultato esatto: W/m². Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 53966d0ac9b30093aa99bf2ce5079533260e8aca115d0dba923b324efe74ddf2; candidato SHA256 5438515dfefee3b044a603ffcb2b870ed79d418681c730d109cc629a8bf49263; firma di lettura f1e7f1a07020996464f3285d4f6108b4f913d1eab67298cd3598a62f1cc5c1a1.

## AR-u4-spherical-intensity-03

il suono richiede un mezzo materiale; vuoto ideale nell’interno elimina quel cammino acustico. Eventuali vibrazioni dei supporti o pareti non smentiscono l’assenza di propagazione sonora nel vuoto interno.

Ipotesi applicate: Solo 03: sorgente continua a vibrare, aria rimossa fino al vuoto ideale; si considera soltanto il cammino interno, supporti solidi esclusi. Non si applica la legge sferica a un mezzo inesistente.

Alternative e feedback: Vuoto senza mezzo non implica frequenza nulla né conversione spontanea in onde elettromagnetiche. Non è un fluido viscoso; supporti sono percorso escluso.

Esito AI: PASS_AI. Risultato esatto: Il suono richiede un mezzo materiale che sostenga perturbazioni di pressione e densità. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 de9e9da768ebeca19f1e2be9676ffa96c153854e78c3afbcc7fde68f7b395b9d; candidato SHA256 a4d6579f9fb4e89058773c22a9ddeec04553fa2ee500c131323bc17c5bf3ca90; firma di lettura 1b95f267b885c7d950dc8d89239fe1073a8f1f2f08ce167d823d0a621aaae61d.

## AR-u4-spherical-intensity-04

p=16, r=2 dà I=4 W/m², fattore 4.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 1/4 inverte fattore 4; 16 quadra il fattore di potenza; 1 ignora variazione; zero viola positività.

Esito AI: PASS_AI. Risultato esatto: Da 1 a 4 W/m². Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 94d6ee14c2b8ee5ee8feb77996fa3a03d1d267c3d939dabb6a52e6f403d2f1ec; candidato SHA256 2639641d60dfd6be0b408fe9fbf8b932a4f311ef6e15f4a5d04dc02a1c260998; firma di lettura fac9ed11286b5eb363d4b0249c49183e7e83dcad2e7abca99419626679d623f1.

## AR-u4-spherical-intensity-05

p=Ir²=1·4=4 W, non P=16π W.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 16π W è P, non p; 2 usa un r solo; dividere per r² non isola p e cambia unità.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 83f17b6c211065217a29ffc9d5562b2eefc0dc86f044b826d7a020edfca24c56; candidato SHA256 ddfa77683c381a6b909a0d67e59b4e5fb53651be6df1ae144aafddddec80a12b; firma di lettura a7753911238302e8ed24db486c6bcf47b4bb1121d4d06fff1353432deee2de39.

## AR-u4-spherical-intensity-06

r²=p/I=4 m²; r=2 m positivo.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 4 numero di r²; negativo non è distanza e r non è diametro. Richiede campo lontano per accettare il dato nel modello.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 06c397b773559a11f290b9c88bd0d5a30d196a4626e42983a6732c16c2a76e2d; candidato SHA256 ac636b85011e22903545d90a1b5ac7753881a6e3da77089fe805b9d99ad96324; firma di lettura 2c5a9f901725f110854fb5e4e9c902bf63a77e3986d47b16dbc4b4c57cc04aca.

## AR-u4-spherical-intensity-07

r=1 a p=4 dà I=4, rapporto 4 con la prova A.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 2 omette quadrato; 1/2 e 1/4 seguono distanza nel verso sbagliato; 1 ignora espansione della sfera.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f23b64faaf9b4cd4644aad30456f93b52cf8b1d84370cd632144779fc11d6e7a; candidato SHA256 d4769d9a701769992030b370a0591bb1aeef3e761c7ac1e664d2857f2dff2597; firma di lettura f67482683a43074d03b4185d89552af06b3f4bf953505944304cbf78232ec56e.

## AR-u4-spherical-intensity-08

e=2−1=+1 W/m².

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: −1 ordine inverso; 2 proposta; zero accetta; 1/2 dimezza scarto.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5b7070ab7bc4357fe32144e9c7babfcf1bf98f6a672a7ee62a90d15b40be5ea7; candidato SHA256 1111ac63fb9020f3a11b78baa289e527dfec6295871b89010e754b35ac0f7461; firma di lettura c2390b3f2b4e6c713537c27b30a10cf2ad0f8c1fd385ab3a6ba5118f2801ef41.

## AR-u4-spherical-intensity-09

p=Ir²; P invece 4πIr².

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: I/r² W/m⁴; r²/I m⁴/W; Ir W/m. 4πIr² ha unità W ma è P, non il parametro p.

Esito AI: PASS_AI. Risultato esatto: p = I r². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 b1405576741b24c70869d0f60015a2408db0f47320196348a33792038b02d61f; candidato SHA256 f37bcc1a40a2fb1883f12e94de2a90600f26804b2296d24b0822c23e55796290; firma di lettura f7da765ae6fea8a27e19a9eb344d7113b0918b055020a76f6e7b4cb5a17663f7.

## AR-u4-spherical-intensity-10

I_B/I_A=κ₁/κ₂².

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: Prodotto rende distanza diretta; una κ₂ perde quadrato; reciproco scambia stati; κ₁² quadra potenza senza motivo.

Esito AI: PASS_AI. Risultato esatto: κ₁ / κ₂². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 9d14ed9c4ad5dd86aaed11afd5c5b68bbf5d74f0b00ed02b985e8ba7892cd4a5; candidato SHA256 31ddd03866f2c65e5b2bdb52c641d4e53a6ef84d8e2fd5f311fcfab59f5d0d9d; firma di lettura 5cf99e0144eae1857a2328480fefd0ee5f1f93bcb4be075eb36df7dbb3aa544e.

## AR-u4-spherical-intensity-11

p_B=8, r_B=4 dà I_B=1/2 W/m²; rapporto 1/2.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 2 solo p; 1/4 solo fattore area; 4 segue area direttamente; 8 moltiplica gli incrementi ignorando il denominatore.

Esito AI: PASS_AI. Risultato esatto: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 042b03f714fc113f9cec163391b331dea039c5389c8ee3f308cf4697180cf919; candidato SHA256 f61dc4e8c02cba5052eae267402d5f65812a5a8ce1c9338e009a87ad202df80e; firma di lettura 8c19c60ef81cdf89d67f782b1e9fa86956fa32bdb8365423ea1ac92f22cbcb78.

## AR-u4-spherical-intensity-12

media (1+1/2)/2=3/4 W/m². Ingressi medi p=6, r=3 danno 2/3, inferiore per 1/12 W/m².

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 3/2 somma; 3/8 doppia metà; 1/2 sola B; 2/3 ingresso medio con scarto 1/12.

Esito AI: PASS_AI. Risultato esatto: 3/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 af3825dfe59178d323e03a826c43c937bc8ca164369e109945d3f1565f8077c1; candidato SHA256 780299e7ac4c95f69be4faeca2c335422d950770bed94998ebad70b97920b269; firma di lettura c0c46e46fe68ec0980fa9232d3e940bb2aadca84abfc9ca417c1ec3d32095289.

## AR-u4-spherical-intensity-13

target I_B=1/2 a p_B=8 impone r_B²=16, r_B=4 m e rapporto 2.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: 4 rapporto aree; 1/2 reciproco; √2 manterrebbe I uguale anziché dimezzarla; 1/4 aumenterebbe I.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 20d0e623a342de57d2c27351c96639aa531e6f6e1e0f1f2ffd3b16dd49bd99db; candidato SHA256 afe2412cd9c08040ce881d777183b700823dbb35899deef227642641ecb8ba33; firma di lettura 94bef8a1644c101a81c9533812ddefe32a1ca69c42f04602e1e2934849853e3d.

## AR-u4-spherical-intensity-14

gain 3/(1 W/m²)=3 m²/W; S_B=3/2 dà I_B=1/2; r_B=4 implica p_B=8 W.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: S 3/2 come I darebbe p 24 W; il raggio diverso impedisce di leggere direttamente rapporto potenze dalle letture.

Esito AI: PASS_AI. Risultato esatto: 8. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 2e2ee74445492d67f6b14d7dbe1455e8e66c66a3608991a0714454c4d4356461; candidato SHA256 020a33778c8609c6d75e5de83d52673ce307aba937d63a1aedefd26d5199af0e; firma di lettura 29e42adfe3eb0ff54a8e7251a4a46bdf0711333f0167815b48d0e474194ffbda.

## AR-u4-spherical-intensity-15

gain (3−2)/(1−1/2)=2 m²/W, offset 1. S_C=9 dà I_C=4; r_C=2 implica p_C=16 W.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: p 8, 4, 32 W a r 2 m danno S 5, 3, 17; 64π W è P_C completa e non p_C.

Esito AI: PASS_AI. Risultato esatto: 16. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 99896abdf57696f3ee50f69e552e82796f324ddbfd72f4e583cabbc20650c2d8; candidato SHA256 8148c945749bb6ec4ac205297f826120586bda24675fa10ecee689934809980d; firma di lettura 9a1050e8a1d9ef5697082f448d446a65cad19560da11a1f259b89120b918578c.

## AR-u4-spherical-intensity-16

p=cr con c=2 W/m dà I=c/r. I=1 impone r=2 m, p=4 W, unica soluzione positiva. Un’eventuale radice r=0 introdotta moltiplicando per r² è estranea al dominio.

Ipotesi applicate: Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.

Alternative e feedback: Dopo p=cr resta I=c/r, non la radice del modello con p indipendente. c è W/m, non intensità o pressione; nessuna legge radiale crescente nella singola prova.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 0539bb10ccf26cd6ee244dc221f24e629ebe9db8c0b9588fda82c594ada1fd4f; candidato SHA256 97ae08261c8118c9e79230a90ee977358eeba9a5801ce7045389a47dec30f894; firma di lettura 9296d3ed14ae1fa8297b670903ac3f7b7bd6181543ea979a693c27dc192272fc.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo il rinnovo del binding, dei token e di tutte le guardie d’edizione esclusivamente in memoria nel test. Resta attivo l’oracolo matematico o la risposta concettuale motivata, non la sola impronta. Altre prove coprono falsa fonte, unità errata, batch vuoto/parziale/duplicato, falsa fisica a chiave corretta e SVG incorporato o locale mutato. Le guardie su testo e figura certificano l’edizione letta e non sono risolutori semantici universali.

assert_record_identity verificato sui report fresh e salvati contro package e binding reali integrati ROOT. Proprietà Hypothesis per ulteriori configurazioni fisiche e test geometrici sui cinque SVG. La suite generale, il replay browser finale e l’integrazione spettano al root. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.

Nota sul test comune: il primo run non era PASS. La mutazione d’unità sceglieva sempre Hz, che in 137 era già l’unità originale e quindi non mutava nulla; ora sceglie sempre una dimensione diversa e lo asserisce. Il lettore XML è stato corretto per ignorare il rettangolo di sfondo senza attributo y, mantenendo tutte le asserzioni sulle sei caselle e sulle coordinate fisiche. Nessun candidato, oracolo matematico o criterio di accettazione è stato indebolito per queste correzioni della fixture.
