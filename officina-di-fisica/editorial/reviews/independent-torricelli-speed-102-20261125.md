# Revisione indipendente — torricelli-speed-102

Autore e reviewer distinti. Edizione autore finale `c6894b2364ba4a7e64cac209d1f1ec6191ec551a`; fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json`. Tutti gli 80 prompt originali delle cinque famiglie sono stati letti e risolti prima di aprire i pacchetti candidati. Trasparenza: il messaggio di consegna dell’autore aveva già anticipato l’esito del record 104-06 (gittate uguali e velocità A doppia), oltre a indicazioni qualitative sui radicali, sul quartico e sul cambio dei nomi h/H. Quell’esito è stato comunque derivato dai due modelli fisici, ma non viene presentato come lettura completamente cieca della chiave. Nessun modulo autore importato.

Sono poi stati letti tutti i 16 candidati finali di questo lotto, con consegne, passaggi, formule, alternative, suggerimenti, feedback e metadati. C2-L005 e C2-L006 reali rilette per portate, energia per volume, Bernoulli e ipotesi. Tutti i cinque SVG delle famiglie sono stati letti in XML e nel rendering nativo completo, incluse geometrie, scale e traiettoria quadratica.

Pacchetto normalizzato `9ce671f3e1e1afc00bb9c15cfe51908ac7d50ea3e11c58eb01dc7cf412e1268c`; binding `f51b5a74db038579c5f722ceccfdc47d41f984bc3f0edca02c369391cbd84518`. Impronte congelate solo dopo lettura delle edizioni finali. Revisione AI distinta, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Nessuna pubblicazione o modifica del reviewer ai candidati.

## Modello e figura

Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

XML e rendering completo letti. Superficie y=180 e foro y=380: 200 px a 40 px/m per H=5 m. Freccia 100 px a 10 px/(m/s) per v=10 m/s. Barre separate gH e v²/2 entrambe lunghe 200 px a 4 px/(m²/s²), energia per massa 50. Nel confronto a g=10 m/s², battenti 5 e 20 m danno frecce separate di 100 e 200 px per 10 e 20 m/s. Scale di quota, velocità ed energia specifica distinte; niente extrapolazione temporale a H fisso.

## AR-u3-torricelli-speed-01

Procedimento indipendente: Con pressioni uguali, superficie quasi ferma e battente H, Bernoulli dà gH=v²/2. 2·10·5=100 m²/s², radice positiva 10 m/s.

Alternative e distrattori: 100 è v² nelle unità del quadrato; 20 raddoppia dopo la radice. La velocità 10 non è costante durante uno svuotamento con H variabile.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `c02e46b9b5583e16a6e508da417e7dc02784dc31e18cb2250a9ec488422b7cd5`; candidato `c831f253083e5128f694c5ac6b211bf49963db0ca228eac214ff4c1a5cdeeb69`; firma `b439ce6188e3e8df02cd7962a35042b6872191765fbd0d5c2c01777a5d50a460`.

## AR-u3-torricelli-speed-02

Procedimento indipendente: gH ha dimensione L²/T² e la radice restituisce L/T. La scelta m/s non richiede una decimalizzazione o un calcolo numerico autonomo.

Alternative e distrattori: m²/s² è v², m lunghezza, s tempo e Pa pressione; non si conserva l’unità di g dopo prodotto e radice.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `m/s`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `68ec4a8ba772ec0073d0601a37ece1bcdce65dd1062c0f016deab4cdcffa6112`; candidato `cd5b616ed9aba01352187a28c7088af1561d2306a63561370a1d3aca775ee0b7`; firma `9e3a82ec7be0857731e4e173e28e0b10ac52e8148a6747dd77d5e5cf6e5d78a6`.

## AR-u3-torricelli-speed-03

Procedimento indipendente: Dalla stessa energia per massa gH=v²/2 si ricava v=√(2gH). Il ramo positivo è il modulo di uscita; velocità superficiale e perdite sono trascurate esplicitamente.

Alternative e distrattori: 2gH è v², √(gH) perde 2, √(2g/H) ha unità s⁻¹; il meno non è un modulo.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `v = √(2gH)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `6ad59f1ee08227111b8702512df97e3a83a0c414e04198a398dcad3ba0dd17a7`; candidato `f1708c075c968fe3e1aecc0d7315d0a6736d4736043ce195aabde82afb9a747e`; firma `4b87ec9b9af02ccdf23cd2556c623f98282177d357a0a52fe431dd99c864840a`.

## AR-u3-torricelli-speed-04

Procedimento indipendente: Con g ridotta da 10 a 2 m/s² e H=5 m, v² passa da 100 a 20. Scomporre 20=4·5 dà v_B=2√5 m/s, esatto e minore di 10.

Alternative e distrattori: 2 applica linearmente il fattore 1/5; 50 lo inverte; 10 ignora g nuova e 20 cresce quando g diminuisce.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `Da10 a2√5 m/s`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `ace6081165889f6a0db8e9f1bb36797e7534c52b05141024e03e7e442960c708`; candidato `87ebc3d2579a73aa6f016b5aa278d4e7d30fcfc0fb7ab6d24c8deb4c6ed004ce`; firma `01e631d10ffd5925323bd6dfe1b1835098c9c3ef45b10ba40bc2ef1022b66e04`.

## AR-u3-torricelli-speed-05

Procedimento indipendente: g=v²/(2H)=100/(2·5)=10 m/s². L’inversa è lineare in g, non produce due gravità.

Alternative e distrattori: v/(2H) è s⁻¹; dimenticare il 2 darebbe 20 m/s², non 10.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f8759a670fb1aa3e3e92ad3b625b3806cfead1c77f3b80a01ebbaa0d03822bfe`; candidato `5af08eab2b7708dff37fc756995e0aa581a7aba7d95d014fe2f286ba317d02d2`; firma `a9dda57bbec4442c232afdab0ef87f24f9c8ba8ec5a7a3d56068dd6197030748`.

## AR-u3-torricelli-speed-06

Procedimento indipendente: H=v²/(2g)=100/(2·10)=5 m. È un battente verticale, non una quota del foro sul suolo.

Alternative e distrattori: 10 m omette il 2. Altezza del suolo non assegnata e non necessaria per la velocità di efflusso.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `2bbbc30b9822ac88218ae4e654b464333dc686c2f36f5afb21daefed8899adea`; candidato `d2bfd3bc10331d3c89c29b97259f8a9b9011c4c13e6fa3c096972651055f0b8d`; firma `ae7c79dd2845b8d32a4e93ef43a994b97bdc6dbc685f9c9c50dabe5d9a5064e5`.

## AR-u3-torricelli-speed-07

Procedimento indipendente: A g=10 fisso, H da 5 a 20 m quadruplica v²; velocità 10 e 20 m/s, rapporto 2.

Alternative e distrattori: 4 riguarda v²; 1/2 e 1/4 invertono; 20 è la velocità B numerica, non rapporto.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `3ef9b7559942e26a5c5bdd0dea04914ac9ca5a954f9b85d626e08e02e3f6d290`; candidato `0be0e09fdbd0056c9b52c9279929e99e59fd940155fd97dcefcf3ba0507416cd`; firma `7637eeda90722d53fcd1c9f5eacdffdb8ca4bdc0377d6e4efea4deb70d01420f`.

## AR-u3-torricelli-speed-08

Procedimento indipendente: Corretto 10 m/s, proposta 20: scarto +10 m/s. La proposta avrebbe v²/2=200 m²/s² contro i 50 disponibili dal battente.

Alternative e distrattori: −10 ordine invertito; 20 proposta; 0 accetta; 5 dimezza lo scarto. Pressione comune non aggiunge energia differenziale.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `461d2191977bd47f095292d7fe4cf47c93b28fc5f209948e14a8bdf35888e1f3`; candidato `0dc42cd8f61437bed62853eb7495684764bdb6b345178f2564e3420a893aef32`; firma `af907e32bf829930a21e554bb4da633ffb05b2bc49bfbde56f77de7d813b0bfd`.

## AR-u3-torricelli-speed-09

Procedimento indipendente: Quadrare v=√(2gH), con v>0 e g,H>0, dà v²=2gH. Dividere per 2H isola g=v²/(2H).

Alternative e distrattori: v/(2H) dimensione errata; 2v²/H fattore quattro; H/(2v²) inverso di accelerazione; v²H/2 ha due potenze di lunghezza extra.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `g = v²/(2H)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `bcb782c8f4a57ec0a9e65d567202dbf7b4671aa1fba429faf45368e7ecd2980a`; candidato `d655d20637c186946608ab4ca6d90fe11a7ed35d6a3ddbdb9ad0e800c4249e80`; firma `70744205c681ad0214418cc34f87f48de9a45fdcf34ef792f0d36c537a0ee499`.

## AR-u3-torricelli-speed-10

Procedimento indipendente: Le scalature g_B=κ₁g_A, H_B=κ₂H_A moltiplicano v² per κ₁κ₂. Il rapporto dei moduli positivi è √(κ₁κ₂).

Alternative e distrattori: Prodotto senza radice è rapporto di v²; quozienti invertono H; somma vale 2 per stati identici.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `√(κ₁ κ₂)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f4c91c674d477c481ff9569e3490beede1c7bad365524fb9faca7afa659a5f25`; candidato `55368d72d4c43bf9ec841fd0e9961f139b482d420d6e5f6af143ba8af8d0fafd`; firma `db456f01bd4327a9cd78d7d43bad1bd27cb6c1acfca47c50de5fb62b0a1be9eb`.

## AR-u3-torricelli-speed-11

Procedimento indipendente: B ha v²=2·2·20=80 m²/s², quindi v_B=4√5 m/s. Rapporto a 10 m/s: 2√5/5; quadrato 4/5<1.

Alternative e distrattori: 4/5 rapporto dei quadrati; √5/5 solo g; 2 solo H; 5/(2√5) è reciproco. Nessuna equivalenza esatta fra le opzioni.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `2*sqrt(5)/5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f14c6d4729747b1cb9a7c92dc549bbfb0f181421bbd07b88dcb59aef2b88db2d`; candidato `f4c6c0cca4f3d5a734228ec7b3c6150263e8757257dcfe2acaa50078a301d8d2`; firma `bdb812eb569252f67bd4da4de7ae8f4ccde304aa06193ee5952deb747851f54d`.

## AR-u3-torricelli-speed-12

Procedimento indipendente: Media (10+4√5)/2=5+2√5 m/s. È minore di 10 perché √5<5/2; gli ingressi medi darebbero 5√6>10. Entrambi i confronti si provano quadrando numeri positivi: 20<25 e 6>4.

Alternative e distrattori: 10+4√5 somma; ulteriore metà sbagliata; 5√6 ingressi medi; 2√5/5 rapporto invece di velocità media.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `2*sqrt(5) + 5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `3fb8a856e35e72c87e9c53849ee18b8488c5a066abdff1e4d8ee8320c12c2bd4`; candidato `a8f205bc1c363cce389356ce08299a78c81356f95f6efeb05fbada3d471b1867`; firma `cf8841cecfda034e604d7b8f3025e408de7e4a23af67e9ffaf050bc407835d81`.

## AR-u3-torricelli-speed-13

Procedimento indipendente: Target (2√5/5)·10=4√5 m/s; quadrato 80. Con g_B=2 m/s², H_B=80/4=20 m, rapporto 20/5=4.

Alternative e distrattori: 2 segue la radice del rapporto di H; 1/4 reciproco; 4/5 rapporto di v²; 20 valore H_B numerico.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `16ebea1de3ffd7716f2dde4fd19a3c13e20798b95879559526ef52a93651845e`; candidato `1b34cba872a277534c264b905ff5233ce6cfb64cf5cc9040bd3082b791f978a6`; firma `9958982936438b25cd818ae6f6cf911165d887427dec59bf0ad9cab2bfe05e3b`.

## AR-u3-torricelli-speed-14

Procedimento indipendente: q=30/(10 m/s)=3 s/m. S_B=12√5 significa v_B=4√5 m/s; v_B²=80, H=20 m→g_B=2 m/s².

Alternative e distrattori: S_B scambiata per velocità darebbe v² nove volte maggiore e g=18 m/s². Rimuovere q prima del quadrato.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `20c4d41cb2441f4131d53c3bc722f3a39e8601c8d17c46924e522ebce5e30985`; candidato `f83069186f7e5d98cede11e0b7da08d4bd8200032d32045f1395e8c2cd847436`; firma `15cced3ec33720f21499479aaede6dcf88c58fafdfcc60a5003809fe83d02df6`.

## AR-u3-torricelli-speed-15

Procedimento indipendente: Differenze dei riferimenti: ΔS=2(4√5−10), Δv=(4√5−10) m/s, fattore non nullo perché 80≠100. q=2 s/m, offset 1. S_C=1+4√5→v_C=2√5, v_C²=20; H=5 m→g_C=2 m/s².

Alternative e distrattori: g=10,4,1,8 m/s² a H=5 darebbero S=21,1+4√10,1+2√10,1+8√5. Nessuna coincide con 1+4√5.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `125dff3d200fc7349d996e758b7921d59a277f29e3517aad19f456eb40e9754d`; candidato `3f21e62a0ab5f15cb9be4e35d7673af53571fd6ae0fdeaee7c04370f17b1bfa4`; firma `d33afe56b6df142dc0c572a6128e7bd427b8cda49a0062362ef0fd0f5a60123e`.

## AR-u3-torricelli-speed-16

Procedimento indipendente: Vincolo g=cH, c=2 s⁻²: v²=2cH². 100/(4 s⁻²)=25 m². Rami ±5 m; H=5 m dà g=10 m/s² ed è l’unico ramo con entrambi positivi.

Alternative e distrattori: 25 è H², non H. Ramo negativo viola sia H>0 sia g=cH>0; il vincolo è fra prove, non durante lo svuotamento.

Ipotesi e dominio: Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `6fc61020dc13784b89397a77d91ed2cde82617f81af3da855878d88cf233679c`; candidato `e563a60722f5d8fa64c5fab75caa35bb151d4e055eb3d7d01be90793e0ce4c1c`; firma `e7beabd28e8d403be449513986f5f2abd532300b99b1c18de400021931e47f68`.

## Controprove e contratto

24 controprove per lotto: 16 chiavi errate con candidateSha256, binding e tutte le guardie d’edizione rinnovate in memoria, respinte dagli oracoli o dalla prova concettuale separata. Sono respinti anche fonte falsa con guardie rinnovate, numero corretto con unità sbagliata, prova fisica falsa con chiave corretta, pacchetti vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Per la spiegazione falsa resta esplicito il confine della lettura individuale congelata: il rifiuto non viene attribuito a un ricalcolo automatico del linguaggio naturale.

assert_record_identity verifica sia report fresh sia report salvati contro pacchetti e binding reali. Sono usati soltanto EXACT_ORACLE e AI_CONCEPTUAL. I radicali numerici passano da un AST limitato ad aritmetica razionale e radici di interi: nessun eval o sympify dell’input. Sono provati frazioni, somme radicali, reciproci e rigetto di chiamate arbitrarie, divisioni per zero e potenze enormi.

Il test comune genera inoltre 35 configurazioni per ciascuna di cinque proprietà fisiche, 175 in totale: somma dei costi gravitazionale/cinetico, continuità e totale di Bernoulli nel Venturi, ramo positivo e inverse di Torricelli, unità e area nell’efflusso, complementarità e limite geometrico della gittata. Le letture individuali non vengono sostituite da queste configurazioni.

Importazione, browser e conteggi globali restano dell’integratore. Non è stata eseguita una prova con studenti o una revisione umana.
