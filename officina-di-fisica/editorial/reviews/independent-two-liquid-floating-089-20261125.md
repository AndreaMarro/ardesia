# Revisione indipendente — two-liquid-floating-089

Autore e reviewer distinti. Edizione autore finale `712aa70dfafde874399b35b85a5c285a4598d2d3`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json`. Tutti gli 80 prompt delle cinque famiglie sono stati letti e risolti prima delle chiavi candidate; nessuna esposizione iniziale alle chiavi in questa revisione. Nessun modulo autore importato. Poi sono stati riletti singolarmente tutti i 16 record finali di questo lotto: consegne, passaggi, alternative, suggerimenti, feedback e collegamenti scientifici.

Pacchetto normalizzato `88e8b41341187e9c49a63e252168138768e68792750ae682fa270b6cb64d2b0b`; binding `17d71424b5b3e23194f98e54ed442d350abb6debe0159b0caea5a682dfa739a4`. Le impronte delle singole fonti, dei candidati e delle figure sono congelate solo dopo la lettura delle edizioni finali. Competenze C2 reali controllate sulle lezioni: L004 per galleggiamento/pesata, L005 per portate e continuità. Il profilo assegnato nel 091-03 è autonomo e ora include esplicitamente A=πR²; il procedimento manuale usa la media areale esatta.

Questa è una revisione scientifica di un reviewer AI distinto. Approvazione umana NOT_RUN; stato DRAFT; publicationAction NONE. Nessuna pubblicazione, nessuna modifica del reviewer ai candidati.

## Modello e figure

Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

XML e rendering completo letti. Corpo a sezione costante: 120 px sopra e 40 px sotto alla scala volumetrica 160 px/L, totale 1 L. Densità 1/2 e 3/2 kg/L, corpo 3/4 kg/L. Con g 10 m/s² i contributi di spinta sono 15/4 N ciascuno, peso 15/2 N: frecce 75, 75, 150 px a 20 px/N, ciascuna in path separato. Barre finali 150+50 px a 200 px/L; nessuna scala di forza confusa con quella di volume.

## AR-u3-two-liquid-floating-01

Procedimento indipendente: Il bilancio è ρ_c g V = ρ_t g(1−f)V + ρ_b gf V. Si cancellano g V e si isola f = (ρ_c−ρ_t)/(ρ_b−ρ_t). Con 3/4, 1/2, 3/2 kg/L si ottiene (1/4)/1 = 1/4.

Alternative e distrattori: 1/2 trascura il liquido superiore; 3/4 è il volume superiore; 1/3 fallisce il bilancio; 4 supera il volume totale.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `1/4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `7e2933a34d2d7f13c5115ace36544a9ce2a41cc0d40a77c5b11117bdcb281596`; candidato `c2bb0bd8da410d4e20ec73b47460710f53cd0a68fd65488e9e71773119896945`; firma individuale `753857ce0a50c646f5191b35c48e79741b2ad4fc7203ba73916391789743c07c`.

## AR-u3-two-liquid-floating-02

Procedimento indipendente: La frazione V_b/V è un rapporto di volumi: unità 1. Il vincolo geometrico è 0 < f < 1; 1/4 equivale a 25%.

Alternative e distrattori: L volume, kg/L densità, N forza, m² area: soltanto 1 è puro.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `1`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `867b510580c09166cc3d7c6de2e0dce3067122012d2bfb494cbbf75b39e4e7a0`; candidato `cf562e79c58a98b9edf5dc23f7e1d3dbd0c03da7650932398115a053d81fed29`; firma individuale `f10404d28eb3d8c25fca5caabddb08fa2eda7657844bcc235956765d053fd0d3`.

## AR-u3-two-liquid-floating-03

Procedimento indipendente: Raccogliendo f nel bilancio: ρ_c = ρ_t + (ρ_b−ρ_t)f. Il contrasto positivo permette la divisione e dà la legge richiesta.

Alternative e distrattori: I rapporti senza ρ_t omettono una parte della spinta; il reciproco può superare 1; la differenza da sola è dimensionata.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `f = (ρ_c − ρ_t) / (ρ_b − ρ_t)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `9dbda7bcb5a8f57da8fe166839878aa997bfa9ecbe2411edb7f0c18bda666746`; candidato `1a0bd896f380fa22d311a4a3d3202f87809f8417f036c16241be241afb50f067`; firma individuale `5a7714389f18a7ee33f84962e06e82e923d7fdf8e61fc502b3299cf658557e3c`.

## AR-u3-two-liquid-floating-04

Procedimento indipendente: A liquidi fissi il contrasto inferiore è 1 kg/L; l’eccesso del corpo passa da 1/4 a 1/2 kg/L. f passa quindi da 1/4 a 1/2.

Alternative e distrattori: 1/3 applica il rapporto delle densità del corpo senza sottrarre ρ_t; 1 ignora la stratificazione interna; 1/8 inverte il cambiamento; invarianza falsa.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `Da 1/4 a 1/2`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `27c8a7eab5214697707ee83b3438cd10db47a9c26c472958e2e7c887e47eb79a`; candidato `187b09943aac4b99cc1b1e5192731e932f5881da0bf4af8569b33272ca9aa136`; firma individuale `58849da4b2bb4c390fb2ee613b80acc37508503af1b7db237ed19ecfe4713722`.

## AR-u3-two-liquid-floating-05

Procedimento indipendente: L’inversa è ρ_c = ρ_t(1−f)+ρ_b f. I due contributi sono 3/8+3/8 = 3/4 kg/L, interno all’intervallo.

Alternative e distrattori: Solo ρ_b f darebbe 3/8 kg/L, sotto il liquido superiore e fuori dominio.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `3/4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `571b5b88d149ab24bb05003ef418dcaf6f1a3b4bd4df6135827e9675845541de`; candidato `dee2a3df391e88e73c6a323da5f5b29fe29ddf7bd0d7596ea997c6998bdcb43a`; firma individuale `366296e323a3dce3addd50b1635e0e3bdc8d1b94dba36530123dd2111f9404aa`.

## AR-u3-two-liquid-floating-06

Procedimento indipendente: ρ_b = ρ_t + (ρ_c−ρ_t)/f = 1/2 + (1/4)/(1/4) = 3/2 kg/L. Riaggiungere il termine superiore è necessario.

Alternative e distrattori: Omettere ρ_t darebbe 1 kg/L e densità del corpo ricostruita 5/8, non 3/4.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `3/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `67614ccebb37bc4ada362dcc9b977a26b981e9b0034a52a033ffb73070bf7b0c`; candidato `e8f617db72588879dfaba903ee56125113270c75e2c566f146cddc7b4e0c2b4a`; firma individuale `55576dcd90ee1f99f4f59c2c196f864fe894a65ec2b159211164a006bd8c6c62`.

## AR-u3-two-liquid-floating-07

Procedimento indipendente: Con ρ_b ridotta a 1 kg/L il contrasto si dimezza: f_B = (1/4)/(1/2)=1/2. Rapporto a f_A=1/4 uguale 2.

Alternative e distrattori: 1/2 inverte, 3/2 usa densità inferiori senza lo sfondo, 1 ignora, 4 duplica ancora.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `b054b9a14c56273493c4fefa06aad80d87c35bdad685a4c62b3db0d77d6af1e9`; candidato `f43d26c3b8f0b1963fb20fe40fd127cce1170929723e48167e29bf5979aec499`; firma individuale `667bd336dfbe1be8dc5ec9b5ca65d88d02f6e004ace2beeaaae8e144a7bc32d0`.

## AR-u3-two-liquid-floating-08

Procedimento indipendente: Proposta 1/2 meno corretta 1/4 = +1/4. La proposta equilibra un corpo da 1 kg/L, non quello da 3/4 kg/L.

Alternative e distrattori: −1/4 ordine invertito; 1/2 proposta; 0 accetta; 1/8 dimezza ancora.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `1/4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `184b8cd7f3735747951c9932c955a299a1768e58b4d08f31bdf692d1da0821cb`; candidato `f0dbd31ed2736199aa1885115f8c41c43c597c18fa94851c563b4df1fe21cb5c`; firma individuale `debe2e93e4882d7f5107cc67f8578741347554b76c4db053beb15777761da3d4`.

## AR-u3-two-liquid-floating-09

Procedimento indipendente: Moltiplicando per ρ_b−ρ_t e aggiungendo ρ_t si ricava ρ_c = ρ_t+f(ρ_b−ρ_t), con le dimensioni di densità.

Alternative e distrattori: f ρ_b omette sopra; divisione per f sbaglia l’inversa; ρ_b−f ρ_t non è la media pesata (per esempio f 1/4 dà 11/8 anziché 3/4); ultima espressione inversa densità.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `ρ_c = ρ_t + f(ρ_b − ρ_t)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `3af1aaac035116798f4bbd20461e99cbfc1ef353edfeae4b90f7344f0e8437d5`; candidato `cd7ffd334c5a73ed6ceab4bf74acb309f0e78d87f48c9036cbf307ac27697ffc`; firma individuale `184ab6fcdba45ae93648f74385bd38b32dcc7003f472cd9ec21a0fb482db80b7`.

## AR-u3-two-liquid-floating-10

Procedimento indipendente: f_A=X/Y, f_B=X_B/Y_B; rapporto X_B Y/(Y_B X). ρ_t è fisso e non scala con gli altri dati; tutti i contrasti sono positivi.

Alternative e distrattori: κ₁/κ₂ ignora gli offset di densità; prodotto non segue dal bilancio; reciproco scambia stati; X_B/X omette il contrasto inferiore.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `(X_B Y) / (Y_B X)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `958b0d4e4d72e8248559d749622264ce9aba861a6e7e7c3194765ba7a4400e43`; candidato `31e82a37092b88197335a0315dc3aaf069a8bae5eea6a869e33742ee3d42f1aa`; firma individuale `24655d77a2a22ee0df94cab29723ee867df1c5ecc36cdd99ed4360ffe62bbaaa`.

## AR-u3-two-liquid-floating-11

Procedimento indipendente: A dà 1/4 e B dà (1/2)/(3/2)=1/3. Il rapporto (1/3)/(1/4) = 4/3.

Alternative e distrattori: 3/4 reciproco, 2 solo eccesso corpo, 1/3 singola uscita B, 1 scalerebbe erroneamente anche ρ_t.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `4/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `333fb0bf0dc2d873a4a0c2bf968074ad0dc5d707269cb03e8dc931fd82c333d8`; candidato `b7223b84728823adf6051ed3c38d4d851958d63767e6397e3fb102857acbe4c5`; firma individuale `9b31d175a74fbd278c6637cfc8ef374e1aca2239c53bca6b209531c525cace84`.

## AR-u3-two-liquid-floating-12

Procedimento indipendente: Media (1/4+1/3)/2 = 7/24. Le densità medie 7/8 e 7/4 kg/L danno 3/10, maggiore della media di 1/120.

Alternative e distrattori: 7/12 somma, 7/48 doppia metà, 3/10 ingressi medi, 1/12 differenza.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `7/24`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `8346bdb3712874fdb88a39f60996cca730e7fe768719bb00077560bc24f2c13f`; candidato `de40f25f8407bbdd466a1a0c3b4e443e76b5826b20e325b41a7f4d9111395a58`; firma individuale `2b0d03c591109192ff293172a89080b3483cf3ccfaa0d58ff2f1b604eae55087`.

## AR-u3-two-liquid-floating-13

Procedimento indipendente: Target (4/3)(1/4)=1/3. Con ρ_c, B=1 kg/L si ricava ρ_b, B=1/2+(1/2)/(1/3)=2 kg/L; rapporto a 3/2 uguale 4/3.

Alternative e distrattori: 2 è densità B numerica, non rapporto; 3/4 reciproco; 1 lascerebbe f 1/2 anziché 1/3; 1/3 è frazione target.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `4/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `08a501cf615e348a8268074ece737c30440e9efd53d09fce0b951ab190a0b62e`; candidato `94214ec7282c6041caa3e5e71b98c0144042f8e7528968b568b7d28203bc8b7a`; firma individuale `6780c296e1857b52a91d2f69c7efdcb90eabd3eb13835df96419278d59ee56ec`.

## AR-u3-two-liquid-floating-14

Procedimento indipendente: Guadagno (3/4)/(1/4)=3. S=1 dà f_B=1/3; ρ_b=2 kg/L dà ρ_c=1/2+(1/3)(3/2)=1 kg/L.

Alternative e distrattori: S = 1 non significa f 1: includendo q = 3, il corpo resta tra i due liquidi.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `f7460e9c21672d4f37b5e124df6817af5d82ac29a81c46bc9112cb0889fe0008`; candidato `25d702a18a017845d08cac1a72439d743f52eadf9a227b9cbe262d3ceb633aab`; firma individuale `b1697518031946857dd15ca004e92efc7e33e149ffb1b8fcc6c0447e8e576437`.

## AR-u3-two-liquid-floating-15

Procedimento indipendente: Differenze Δ S=1/6 e Δ f=1/12 danno q=2, offset 1. S_C=2 dà f_C=1/2 e ρ_c, C=1 kg/L.

Alternative e distrattori: ρ_c 3/4 e 5/4 danno S 3/2 e 5/2; 3/2 è bordo f 1 escluso; 2 supera il liquido inferiore.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `3f67b2e98a493c525822f0cfcd41ecb40e3d50e7ae2cf9ab503efe462a82f905`; candidato `c829cfb37f02094972156c3d7d36e5440e5eeef062fe05391d5280531c2e8b6e`; firma individuale `0c5107a3ee93ae326df9bd8ff52c988190c76cd0623f2aabc12be60e55875c79`.

## AR-u3-two-liquid-floating-16

Procedimento indipendente: ρ_c=ρ_b/2 non elimina il fondo fisso ρ_t. Equazione 1/4=(ρ_b/2−ρ_t)/(ρ_b−ρ_t) porta ρ_b=3 ρ_t=3/2 kg/L, ρ_c=3/4; dominio vincolato ρ_b>1 verificato.

Alternative e distrattori: Nessuna cancellazione tra differenze con ρ_t nonzero; nessuna seconda radice; zero fuori dominio.

Ipotesi e dominio: Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.

Esito esatto: `3/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `bfb56965c3829481f700a5143e407025ec5420a5854db0c3126ab42e1ea6038d`; candidato `418ce9624b2a71889a5bbbf00993ff1f21d2b998a85ae215455f201c90781295`; firma individuale `e92c657d18cb9eb896d384e04af38176d35c9f8a5cb03321000d8661d759591e`.

## Controprove, identità e limiti

24 controprove riproducibili per questo lotto. Le 16 chiavi errate sono ricalcolate con binding e tutte le guardie di edizione rinnovate in memoria: il rifiuto deriva dall’oracolo matematico o dalla distinta prova concettuale, non dal solo hash. Sono inoltre respinti fonte falsa con guardie rinnovate, numero corretto con unità fisica errata, prova fisica falsa con chiave corretta, pacchetto vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Il rifiuto della falsa spiegazione conserva invece esplicitamente il confine della lettura individuale congelata.

Il test comune verifica assert_record_identity sui report fresh e saved usando pacchetti e binding reali: sono ammesse solo EXACT_ORACLE e AI_CONCEPTUAL. Controlla inoltre 35 configurazioni Hypothesis per ciascuna di cinque proprietà fisiche: densità convessa e stratificazione; pesata idrostatica e scala; media areale del profilo; massa trasportata; continuità entro un apparato distinta dal cambiamento di apparato. Sono 175 configurazioni complessive, senza sostituire le 80 letture individuali.

L’integratore esegue separatamente i controlli di importazione e interfaccia. Nessuna prova con studenti o approvazione umana è stata eseguita.
