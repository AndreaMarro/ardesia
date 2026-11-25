# Revisione indipendente — hydrostatic-weighing-090

Autore e reviewer distinti. Edizione autore finale `092b90b`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json`. Tutti gli 80 prompt delle cinque famiglie sono stati letti e risolti prima delle chiavi candidate; nessuna esposizione iniziale alle chiavi in questa revisione. Nessun modulo autore importato. Poi sono stati riletti singolarmente tutti i 16 record finali di questo lotto: consegne, passaggi, alternative, suggerimenti, feedback e collegamenti scientifici.

Pacchetto normalizzato `a9a4f7956b4abcab26e3cd680979305872c68ad94d8d7962d3ca43167d9c7e96`; binding `852e21c7456f85c11c65cf59d035f295cb48d32c484ac33ee1abf79c0f36295d`. Le impronte delle singole fonti, dei candidati e delle figure sono congelate solo dopo la lettura delle edizioni finali. Competenze C2 reali controllate sulle lezioni: L004 per galleggiamento/pesata, L005 per portate e continuità. Il profilo assegnato nel 091-03 è autonomo e ora include esplicitamente A=πR²; il procedimento manuale usa la media areale esatta.

Questa è una revisione scientifica di un reviewer AI distinto. Approvazione umana NOT_RUN; stato DRAFT; publicationAction NONE. Nessuna pubblicazione, nessuna modifica del reviewer ai candidati.

## Modello e figure

Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

XML e rendering completo letti. In aria: tensione 10 N e peso 10 N, freccia 200 px ciascuna a 20 px/N. In acqua: tensione 5 N e spinta 5 N, 100 px ciascuna contro peso 10 N di 200 px. Ogni freccia ha un proprio path; sono proiezioni separate. Barre peso/spinta 200/100 px. Con g 10 m/s², spinta 5 N→volume 1/2 L e peso 10 N→massa 1 kg. Ultimo esempio 20/10 N raddoppia volume e massa, non la densità 2 kg/L.

## AR-u3-hydrostatic-weighing-01

Procedimento indipendente: In aria W_a=ρ_c gV; in acqua W_i+ρ_w gV=W_a. Si elimina V e g: ρ_c=ρ_w W_a/(W_a−W_i). Differenza 5 N, rapporto 10/5=2, densità 2 kg/L.

Alternative e distrattori: W_i non è nuova gravità né risultante; peso reale invariato, tensione e spinta sostengono insieme.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `462fe07458e7a5a48a5236079841c11e863fdb304597fa3b35d4b0dece3219f8`; candidato `720519e248b9d90595ae10f20ccca0dd5867afe392457f90a31b5a856c512a24`; firma individuale `20a7947e8578c1030335c4f8f272d266b40ed3990f6f213972cb722d773dd9e5`.

## AR-u3-hydrostatic-weighing-02

Procedimento indipendente: Il rapporto di forze è puro ma moltiplica ρ_w: unità kg/L=1000 kg/m³. Non si perde la dimensione perché il numero di ρ_w è 1.

Alternative e distrattori: N forza, L/kg reciproco densità, kg massa, N/L forza per volume; solo kg/L è densità.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `kg/L`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `7ba7d3381f0139dcba836ce8049f768e9f03c7f7d268d4ef3cfb471b84c97b27`; candidato `af21a0abc006dcb11e7d7082d8bc6992ef24c22b218ad5800bb685ec86e2a2c4`; firma individuale `76287fe154a98d2461ef6ab541bbfca13aceec166e4bc110b0af2a69f36fdc9c`.

## AR-u3-hydrostatic-weighing-03

Procedimento indipendente: La differenza delle pesate è la spinta, non il peso residuo. Peso/spinta =ρ_c/ρ_w; il confronto è fra masse nello stesso volume.

Alternative e distrattori: W_a/W_i coincide nel caso 10/5 ma non è la legge: 20/15 darebbe 4/3 invece di 4. Rapporti invertiti/somma portano sotto ρ_w.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `ρ_c = ρ_w W_a / (W_a − W_i)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e1389baa7a88864bf893d9781e536d72dbee18c4ce0c8e778be753c3a89f24fd`; candidato `bb954a2db4f119241fb12f1aa6ba0df96a2ebc16f604f6fe638002ab0f2a1663`; firma individuale `97a2c349b6dd937ee591cedbe7333b763a697057b468364b998b173aeea0abb1`.

## AR-u3-hydrostatic-weighing-04

Procedimento indipendente: A: spinta 5 N, densità 2. B: 20−5=15 N, densità 20/15=4/3 kg/L. Corpi distinti; un peso maggiore non ordina da solo la densità.

Alternative e distrattori: 4 segue solo numeratore, 2 ignora nuova spinta, 1 richiede W_i 0, 1/2 richiede sostegno verso basso.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `Da 2 a 4/3 kg/L`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `71ff3e46a8ea86e6ee6aeac958ee7a4b1fe012c72a59f9537dad40fdf6e1c294`; candidato `5e333a0d846c033d0c3e09d4743aaec3baed3c37efdd81fe3781b97a4342f5e7`; firma individuale `62e2286f07adbdff1364920376b8c5c41097fea1d86829246d1f7ca0e2538555`.

## AR-u3-hydrostatic-weighing-05

Procedimento indipendente: R=ρ_c/ρ_w=2. R(W_a−W_i)=W_a→W_a=R W_i/(R−1)=10 N>5 N.

Alternative e distrattori: R W_i coincide numericamente a R = 2 ma non sostituisce l’inversa generale R/(R−1); il denominatore contiene W_a.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `07535384e05934f9082015450f3d0ea2c7166e5da8953e6232afddfa7bfdb2c8`; candidato `d498e62e4ef7cbc5d887111231ed67eb4d5719d85bf8c6b63d94b4c39fd653a5`; firma individuale `ab27650b723ee6966f625e82e91ae375bc286d8a6a406898e0a494c58f6194e3`.

## AR-u3-hydrostatic-weighing-06

Procedimento indipendente: Spinta=(ρ_w/ρ_c)W_a=5 N; W_i=10−5=5 N, tensione positiva.

Alternative e distrattori: 10 N ignora la spinta, zero è ρ_c=ρ_w, tensione negativa fuori dominio.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `6a66e0467f6f593f419c4f775982422ee76af836b777200e7d7fb2bc94c0aa62`; candidato `fc58834132bf9f1e4a1d56e3db32eca2d12725157a33f1f9709a67f9bd219fbc`; firma individuale `c372e3f83d610cca59c8290e325c36252b5ccdd1c51c8758e41c5db2f010594f`.

## AR-u3-hydrostatic-weighing-07

Procedimento indipendente: B con W_a 10, W_i 1 ha spinta 9 N e ρ_c 10/9 kg/L. Rapporto a 2 kg/L=(10/9)/2=5/9.

Alternative e distrattori: 9/5 reciproco, 1/5 e 5 seguono soltanto tensioni, 1 ignora il volume cambiato.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `5/9`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `54984169eaefb4148ea92bfc9818c06532761ac9d178d6b81d4a5125b9f48e01`; candidato `7644761c11633eb89cdb83e21eb5903999fc593ee332c650ca8240e87dbbff66`; firma individuale `3d8ed80259f0aa9958d5fbaebcdac9502cc77e21171136505953c6e79e85b6fd`.

## AR-u3-hydrostatic-weighing-08

Procedimento indipendente: Proposta 4 meno corretta 2=+2 kg/L. Controprova: ρ_c 4 con W_a 10 darebbe spinta 5/2 N e W_i 15/2 N, non 5.

Alternative e distrattori: −2 ordine invertito, 4 proposta, 0 accetta, 1 doppia metà.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `467af4c6a3017dbc46c96ef06299490c2eafca5aaa05ba1162a20ade920545cf`; candidato `3c73e1db4919cee81db87119d1ae6f55cc9bc104a200cccadfdf9e20d8b25f58`; firma individuale `fb0b19065fa745ba4f1be7eab6c573c497b49baef0217513bb1306a04e4c268a`.

## AR-u3-hydrostatic-weighing-09

Procedimento indipendente: Raccogliendo W_a si ottiene (ρ_c−ρ_w)W_a=ρ_c W_i; inversa ρ_c W_i/(ρ_c−ρ_w), valida per ρ_c>ρ_w.

Alternative e distrattori: ρ_c W_i/ρ_w omette raccoglimento; ρ_w nel numeratore altera equazione; ultime forme danno W_a<W_i.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `W_a = ρ_c W_i / (ρ_c − ρ_w)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `07fdb5351b6ee89210814b7e2e31ce71a6d641fe8439720bc4002397c4c02c2e`; candidato `ce4b21d8ac56d4bb728789d23fc1f6dd51484734a11aeb5d33aa95e17c6687cd`; firma individuale `74f88ba8fb85d025fb09855ec691c6fe35aeb06704eaa1d8dea061f6a97d6176`.

## AR-u3-hydrostatic-weighing-10

Procedimento indipendente: Denominatori D=W_a−W_i e D_B=κ₁ W_a−κ₂ W_i positivi. Rapporto κ₁ D/D_B. Se κ₁=κ₂, la densità resta uguale.

Alternative e distrattori: κ₁/κ₂ ignora sottrazione, prodotto ingiustificato, reciproco scambia stati, D/D_B omette κ₁.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `κ₁ D / D_B`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e359dc5ce31f28b30626bb8b8c0c55b5bcfa801bb8a498d5564025e6c4c83a9d`; candidato `3bd95ecbe1c48ce9344c85e88166a35dcfe6a9a94318ac55d408d755c8cc400b`; firma individuale `87692d40d3c3407cb6f0cfef7fd056080bb0703a7a3eff55c3c70ac25f26d69c`.

## AR-u3-hydrostatic-weighing-11

Procedimento indipendente: A 10−5=5 N e B 20−15=5 N: spinta e volume uguali. Densità 2→4 kg/L, rapporto 2.

Alternative e distrattori: 1/2 reciproco, 3 solo tensione, 4 densità B, non il rapporto, 1 spinta uguale non implica peso uguale.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `b675264845f987f37611b03dc92e6fcf6821f008d65443feaa928cd734f1dae7`; candidato `dd2c670abd753f7d1e54be539840e765fc8147edcbb7cd4f73c190ba39bae588`; firma individuale `59a69f52da2db98f57024c5cedbce328b5e0773b563de66e970dac5a769d3f9e`.

## AR-u3-hydrostatic-weighing-12

Procedimento indipendente: Media(2+4)/2=3 kg/L; letture medie 15, 10 N danno ancora 3 perché entrambe le differenze valgono 5 N. Nonlinearità generale: coppie (10, 5) e (30, 10) danno media 7/4, mentre ingressi medi 20, 15/2 danno 8/5.

Alternative e distrattori: 6 somma, 3/2 doppia metà, 2 e 4 singole prove. Coincidenza con le medie deve essere ammessa e motivata, non negata.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e1230024b53c167671bc8610f2c535e4d915d0b076e01c38c76483d175bec05e`; candidato `532f1a220cbf1d2554fcdc2eb28b42cade73bcbbcc0445c8c49b54cca705b40f`; firma individuale `88298c4b5f8e488e7eadbda51fd78ef08d76208c08c7dd165dbcab046c4e3fd7`.

## AR-u3-hydrostatic-weighing-13

Procedimento indipendente: Target 4 kg/L, W_a B 20 N→spinta 5 N, W_i B 15 N; rapporto a 5 N uguale 3.

Alternative e distrattori: 2 segue il peso, 1/3 reciproco, 4 numero densità, 1 dà densità 4/3 anziché 4.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `3d3769ce9caedfc41af5956ca2be9d2a5545970693707a18cef91ebde57c3aad`; candidato `97e4f2226c8d30ac5ce9f6402b86f1dd3e04308f3754ad8a92f3be10c1cbf6c6`; firma individuale `47c2f81dbd7edff55b72e6a30e998d54f7a9abb6ecdc76563cfb8be27b1c9b8b`.

## AR-u3-hydrostatic-weighing-14

Procedimento indipendente: q = 6/(2 kg/L)=3 L/kg; S 12→ρ_c 4 kg/L. W_i 15 N→W_a 4·15/(4−1)=20 N.

Alternative e distrattori: S 12 scambiata per rapporto densità darebbe 180/11 N; guadagno va rimosso.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `20`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `559d78acef7b8590526c25fce653a9d486ef8874d4fb98f5e7f813eaef7c788e`; candidato `dc3963e4bd4987a6e6ce811b7a6dfd5a23ed6c267f85f69cde5da17d299451d0`; firma individuale `c39e732c882937eeb08fe4b4f6f16009ce426b6d783759a0ea475e41cdb33474`.

## AR-u3-hydrostatic-weighing-15

Procedimento indipendente: q = 2 L/kg, offset 1; S 11/3→ρ_c=(11/3−1)/2=4/3 kg/L. W_i 5 N→W_a=(4/3)·5/(1/3)=20 N.

Alternative e distrattori: Con W_i 5 N, W_a 10, 15, 25 N darebbero S 5, 4, 7/2. W_a 5 annulla spinta e denominatore; solo 20 dà 11/3.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `20`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `5a3433fcdfd13c3fe70325b2e299f72042f9c3b5fe8204609ce7e51fbf0aa8b8`; candidato `959ca87e5b129442462335b14e200d1e57a7354dcf8f67f36830ddf0984c9be1`; firma individuale `2ecc0bee0a5c7da35ff95f211628d55877af9a4c5af48c6792471ec51a5db6e8`.

## AR-u3-hydrostatic-weighing-16

Procedimento indipendente: W_a=2 W_i rende ρ_c=2 ρ_w per ogni W_i>0. Infinite coppie: 10/5 e 20/10 N. La misura non determina peso, volume o scala.

Alternative e distrattori: Una coppia richiede misura aggiuntiva; due esempi non limitano la scala; nessuna falsa; zero escluso.

Ipotesi e dominio: Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.

Esito esatto: `Infinite`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `3369f754f4bae7f00d55285e6f3ba241b0d03198df1e0cbf640639198705d208`; candidato `f5c70214ee2e91a7696b9f01ace48761ac5b5d0b371f3956e10745ce533cbea0`; firma individuale `8c9ab2cabbcfa206a45393e189891505e387ebbed67a87aff68d5ada9b27354f`.

## Controprove, identità e limiti

24 controprove riproducibili per questo lotto. Le 16 chiavi errate sono ricalcolate con binding e tutte le guardie di edizione rinnovate in memoria: il rifiuto deriva dall’oracolo matematico o dalla distinta prova concettuale, non dal solo hash. Sono inoltre respinti fonte falsa con guardie rinnovate, numero corretto con unità fisica errata, prova fisica falsa con chiave corretta, pacchetto vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Il rifiuto della falsa spiegazione conserva invece esplicitamente il confine della lettura individuale congelata.

Il test comune verifica assert_record_identity sui report fresh e saved usando pacchetti e binding reali: sono ammesse solo EXACT_ORACLE e AI_CONCEPTUAL. Controlla inoltre 35 configurazioni Hypothesis per ciascuna di cinque proprietà fisiche: densità convessa e stratificazione; pesata idrostatica e scala; media areale del profilo; massa trasportata; continuità entro un apparato distinta dal cambiamento di apparato. Sono 175 configurazioni complessive, senza sostituire le 80 letture individuali.

L’integratore esegue separatamente i controlli di importazione e interfaccia. Nessuna prova con studenti o approvazione umana è stata eseguita.
