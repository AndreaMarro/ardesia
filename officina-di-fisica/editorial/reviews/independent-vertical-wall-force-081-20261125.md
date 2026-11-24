# Revisione indipendente — vertical-wall-force-081

Autore e reviewer distinti; candidato finale `995d230`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json`. Nessun import del modulo autore. Fonte e derivazioni proprie lette prima delle candidate; eccezione di esposizione iniziale dichiarata in source.reference: primo07901 mostrato accidentalmente come intero record, inclusa chiave, poi comunque risolto dal bilancio fisico. Nessuna approvazione umana: NOT_RUN. Pubblicazione NONE, tutte DRAFT.

Edizione normalizzata `00724e5f7e5d4b1642b07cfff207472f0bec27d2d78b94634428c24c3b61d95f`, binding `12f2bafcf738e139775d0c6adc0fef7e47b516ce65373de99b01217182629d41`. Le impronte sono congelate solo dopo lettura delle edizioni finali, figure XML/rendering compresi.

## Modello e asset

Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

XML e rendering completo letti. Il fronte di 200 × 200 px, alla scala di 100 px/m, rappresenta un’area di 4 m². Nel profilo laterale 200 px rappresentano 2 m di profondità. I segmenti di 20, 40, 60 e 80 px rappresentano rispettivamente 5, 10, 15 e 20 kPa alla scala di 4 px/kPa. Ogni freccia ha un proprio path. La forza totale di 40 kN è proiettata separatamente con lunghezza 200 px alla scala di 5 px/kN. Non viene collocata a metà profondità: il punto di applicazione è distinto dal livello della pressione media.

## AR-u3-vertical-wall-force-01

Procedimento indipendente: z verso il basso,p_rel=ρgz. Integrale0→h p_rel b dz=ρgbh²/2. b2,h2→media10kPa,area4m²,F40kN. Pressione fondo20kPa non uniforme.

Controllo alternative: 80kNmassimosuarea,nonmedia;atmosferacomunesi cancella,forzeorizzontali.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `40`. Sorgente `54f45e05b6265677a97de56c1b873a261bef1928c9f96aa0fa038c20e02e84db`; candidato `161c8d17ce809b2d951d6ece4c7f4a329d53ad29ea1debb59943aaef48a35d6f`; firma `882b591437689036e5bcb692b9ad51a27870931ab177b5666e339c1e8fde7b0c`.

## AR-u3-vertical-wall-force-02

Procedimento indipendente: Pa·m²=N;1kN1000N. Non è un calcolo numerico autonomo: riconoscimento della forza,distinta da pressione e lavoro.

Controllo alternative: Pa pressione,kgmassa,mlunghezza,Jlavoro;solo kNforza.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `kN`. Sorgente `88c97f32edf23254ce20e6130e6260c741d8b8f80746b5dc85f9f5d86ada8076`; candidato `a3142b80d2cd1d1f58ab2d92bac4971cacf1feb22400dbe3fc850575ec326a8f`; firma `1bed533acca7434e0d3bcdeb0f6d5cc9b19763ad01244656b27702a79a03f07b`.

## AR-u3-vertical-wall-force-03

Procedimento indipendente: Ogni striscia senteρgz,profilo triangolare. Media(0+ρgh)/2,integrale metà delrettangolomassimo. Normali orizzontali. Puntoapplicazione dalla prima area2h/3nonprofonditàdellapressionemediah/2;figura nonloassegna.

Controllo alternative: Forzeverticali,noforza,pressionenettanulla,atmosferaraddoppiata:tuttifalsi nelbilanciointegrato. Pressionefondomassimo,nonmedia.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `La pressione varia con la profondità e quella sul fondo è il massimo.`. Sorgente `0798189a4ea865cf260891306cbec4778d007b891be0446002e4c328241c7c43`; candidato `f64f81eb1f3ce53c1beba73846ab4d388a3275a086ca3c9dcd3272f3f6671cd0`; firma `e767112e73fab9a3bc0ce06871e475e17738d21da114466b692f3f876bc59b3e`.

## AR-u3-vertical-wall-force-04

Procedimento indipendente: h2m invariata→media10kPa. Larghezza2→1m,area4→2m²,F40→20kN.

Controllo alternative: 10doppio dimezzamento,80inverteeffetto,40ignoralarghezza,0violaareapositiva.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `Da 40 a 20 kN`. Sorgente `ebd04587acafd34c126a2335b3bdebf563fd55895d24d4093f952a9ecbae723e`; candidato `0bfe89e29bd870a493baa982ca1f89f331f41e2a49e13c45d4fa6a7cb2100808`; firma `b74e33cd435779daa65f8c2001ce3414453d80d54beee92a14f0b1ba6f5ce561`.

## AR-u3-vertical-wall-force-05

Procedimento indipendente: b=2F/(ρgh²)=80000/(1000·10·4)=2m;coefficiente20kN/m.

Controllo alternative: F/pressione darebbearea,nonlarghezza;senza1/2b1mnonriproduce40kN.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `2`. Sorgente `5b6f6b65128764903ee47af334991fe743e5c3da59d5f50b0d8e8ce575842059`; candidato `4cd2308a4a95c4569765c0738e17daf8ac9ad19c0a67cd588a5e2561500cc94e`; firma `abf2984cbd1a2558521aff03ea2b4d6c8924d1841434c35906ad0b5d137efcf2`.

## AR-u3-vertical-wall-force-06

Procedimento indipendente: h²=2F/(ρgb)=80000/20000=4m²,radici±2m;solo+2profonditàpositiva.

Controllo alternative: 4m²èquadrato,−2mfuoridominio;conversione40kN40000Nnecessaria.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `2`. Sorgente `8662c0a9eae8b5c0baebeed18298e5791b51483fe34fb77b493fcaa78fde5ba0`; candidato `f168ff5e92ee654789317e367f281fa74ab93aba9d56cf867b042cf345a70a6b`; firma `20b51eb7a47fa7fab69b5ba3cfce5d369580c20d9a0cff493e370f4ee0124413`.

## AR-u3-vertical-wall-force-07

Procedimento indipendente: h2→4:media10→20kPa earea4→8m²,F40→160kN,rapporto4.

Controllo alternative: 2contaunosolo deidueeffetti,1/4reciproco,8fattoreextra,1ignora.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `4`. Sorgente `290426d8aacc1f44ca5a20f3cd0d46fbe18bf3e100fe552ee6a617c7412985f2`; candidato `8b2ce2a17ddb05daa7996822849187c8b8ecee9fc8eb55e1a7619e93db07ee90`; firma `8a65b100314e222ca79946fddeb503245681bba7c9299ab634ece380e33dd388`.

## AR-u3-vertical-wall-force-08

Procedimento indipendente: 80−40=+40kN. Origineproposta:profilorettangolare massimoinvece triangolare.

Controllo alternative: −40ordineinvertito,80proposta,0accetta,20dimezzaerrore.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `40`. Sorgente `cc6f37666b1c0773447bd8c612966cfc62bc36909d8a4de2f938b0c0deeb9f18`; candidato `62854a4e5109d0dc56a37e8a5bc255380b6512fc250c1fa4c171d2f5da871e7f`; firma `9a2310448a1187cc8f7f53d4aafc284afff284cbdf050323ccb0a545cafe12db`.

## AR-u3-vertical-wall-force-09

Procedimento indipendente: 2F=ρgbh²,divisione perρgh²positivo→b2F/(ρgh²),unitàlunghezza.

Controllo alternative: Metà/doppiodelcoefnonisolano b;h1produrrebbearea,reciprocoinversalunghezza.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `b=2F/(ρgh²)`. Sorgente `bc7f62275107cf9c734817c37b5ac22478418c602b75b150522aec7a912598b9`; candidato `4802f5e426757eb8f8ab8ab90816675bf6d98373ececeb163ce9ff44ce23b50f`; firma `36675eeb3e84d41a60392415bfcc474dcf3de9d8c7f3cf7b481f9f4a0c946213`.

## AR-u3-vertical-wall-force-10

Procedimento indipendente: bscalaκ1,hscalaκ2→Fscalaκ1κ2²;altezza agisce suarea epressmedia.

Controllo alternative: κ1κ2ignoraunh,κ1²κ2quadratovariabilesbagliata;quozientieffettoinverso.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `κ₁ κ₂²`. Sorgente `c92f212163baf77e025161414b6e202ca53e11d95cb807a529f2eb57a1c8822b`; candidato `44d7fdb3f6aa7c6a82fe07563396ccc3aa90495f6f802d6a08f87cfd76bd5e16`; firma `3e5f2c6a98ec8c3be881d65f4c51060b532365113b0f480a9bb198aab0904bf2`.

## AR-u3-vertical-wall-force-11

Procedimento indipendente: A40kN,B5·1·16=80kN. Rapporto2=(1/2)·2²;areeentrambe4m² ma pressionimediadifferenti.

Controllo alternative: 1soloareeuguali;4soloaltezza,1/2sololarghezza;2ricostruisceentrambe.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `2`. Sorgente `bb5dbb43630fcda6fd62a490e7bb52d57c6458e230720fca4cc5982ea3bf9a78`; candidato `715315903fe8c6e2ce624a572ee7ce99699f0c3b471a6d5965c293f390ace92d`; firma `1f22caf80672cbbfc051e7bf8406f94e80e476b43bad5991d9abe2f444a0a1a5`.

## AR-u3-vertical-wall-force-12

Procedimento indipendente: (40+80)/2=60kN. Ingressimedi b3/2m,h3m→135/2kN;diff15/2kN,non60.

Controllo alternative: 120somma,30doppia metà,135/2ingressimedi,40singolaA.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `60`. Sorgente `31f15dfaaba3057ff917dbc5e636aededfb4b61d4ba0502b6a9478f72b2319a7`; candidato `07b799681d1bb18098fa7e75084d0c45adda3a33f7b06adf422658a707f0feb8`; firma `61d4c2c261dbea85166c10be3347e91510df1f2dc4dd68dbdaeab8c7a4cc328a`.

## AR-u3-vertical-wall-force-13

Procedimento indipendente: Target80kN,b1m→h²16m²,h4mpositivo;rapportoa2m=2.

Controllo alternative: 4numeroaltezzaametri,nonrapporto;h2su b1darebbe20non80.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `2`. Sorgente `4e999413f64dcd83fddf1966cfeda076ed9105e7412aaf0618504d987506ed40`; candidato `9becd448a3ac2b785b3569c6bec3f6d070c8aa6a8f8a1997eff2ae2d00deaae5`; firma `12097df6eda317e99bb06c2d88ae4d7a9723c7eee6689d83845172f03f677107`.

## AR-u3-vertical-wall-force-14

Procedimento indipendente: c120/(40kN)=3kN⁻¹,S240→80kN;h4m,coeff80kN/m→b1m.

Controllo alternative: S240comeforzadarebbeb3m; b1media20kPasuarea4m²produce80kN.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `1`. Sorgente `fb63bfe39ca897febfa7792f8139e922a5520e7fa52166f8862ba6f27ee3e2f6`; candidato `64d94dcd6854673dc7f90edd2a4ce71cad66b2fad1ba69969b179b156be7b67d`; firma `82cb5561d8dc8d12e95567ada3fdabddb5da85d0df2710b640d16bc28b1b6f8a`.

## AR-u3-vertical-wall-force-15

Procedimento indipendente: ΔS80/ΔF40kN→c2kN⁻¹,d1. SC41→FC20kN;h2m→b1m.

Controllo alternative: b2dàS81,b1/2dà21,zeronegativifuoridominio;solo1dà41.

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali.

Esito esatto: `1`. Sorgente `344019511e9e2ba290bff1e9040a5b596331533548c261c873ae44cd35245835`; candidato `5571a829ee5c5562339cdf35a951d315600f16c02e6febe6acbc6aed0d628635`; firma `811ae09400fb685afbecec0572b7d0a144aa116c89a6c9ab57d08ee638505411`.

## AR-u3-vertical-wall-force-16

Procedimento indipendente: b=h tra configurazioni→F=ρgh³/2;h³2·40000/10000=8m³→h2m,b2m. Cubica strettamentecrescente,unaradicereale ammessa.

Controllo alternative: −2geometrianegativanonradicecubicapositiva;h1/h4danno5/320kN. 8m³nonm².

Ipotesi: Parete rettangolare verticale di larghezza costante, con b > 0 e h > 0. Il bordo superiore della parte bagnata è al pelo libero. L’acqua ha densità 1000 kg/m³ ed è in quiete; g = 10 m/s² è uniforme. La stessa atmosfera agisce sulla superficie libera e sul lato esterno asciutto: si cancella nel bilancio della forza netta. La pressione relativa locale è ρgz, con z diretto verso il basso. Le forze di pressione sono normali alla parete, dunque orizzontali. Il vincolo b = h collega configurazioni distinte; larghezza e altezza restano costanti in ciascuno stato di equilibrio.

Esito esatto: `2`. Sorgente `58dd4b5002395ea5e197a35e167d283a0b75be8ac131ca284a3b4ab967727dde`; candidato `2ecc3ee23fcb226188e05043ef4ee47021ecfec86e3dc3d0d396a67e60eb4341`; firma `a3bfcbfb7472b62d1a1d3aa1edde3c358c3f5d3f60c5ec1b0b90808a2b457c91`.

## Controprove e limiti

24 controprove riproducibili:16 chiavi errate con binding e tutte le guardie di edizione rinnovate in memoria,respinte dagli oracoli matematici o dalla prova concettuale separata; falsa fonte anch’essa retokenizzata; unità numerica errata; prova fisica falsa con chiave corretta respinta dalla lettura congelata; pacchetti vuoto/parziale/duplicato; byteSVG allegato e locale cambiati. Si distingue il rifiuto matematico dal solo congelamento. Test comune include35esempi Hypothesis per ciascuna di4proprietà fisiche (140 configurazioni) su stabilità/scala delle colonne,segno del manometro,integrale triangolare e Pascal/volume locale. Non certifica persone reali o approvazione umana.
