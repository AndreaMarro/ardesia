# Revisione indipendente — torricelli-flow-103

Autore e reviewer distinti. Edizione autore finale `ca03aa8250c49486f2d25da55d99e6ceabedad46`; fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json`. Tutti gli 80 prompt originali delle cinque famiglie sono stati letti e risolti prima di aprire i pacchetti candidati. Trasparenza: il messaggio di consegna dell’autore aveva già anticipato l’esito del record 104-06 (gittate uguali e velocità A doppia), oltre a indicazioni qualitative sui radicali, sul quartico e sul cambio dei nomi h/H. Quell’esito è stato comunque derivato dai due modelli fisici, ma non viene presentato come lettura completamente cieca della chiave. Nessun modulo autore importato.

Sono poi stati letti tutti i 16 candidati finali di questo lotto, con consegne, passaggi, formule, alternative, suggerimenti, feedback e metadati. C2-L005 e C2-L006 reali rilette per portate, energia per volume, Bernoulli e ipotesi. Tutti i cinque SVG delle famiglie sono stati letti in XML e nel rendering nativo completo, incluse geometrie, scale e traiettoria quadratica.

Pacchetto normalizzato `2af78f8f43d6718f051e3d03e6b87c058d71c1c5af0fa9ec473dc5a926e58b53`; binding `7e3d5e2c1820fa2348413f24483b1efbf5e7e27f81b183112862c61720380453`. Impronte congelate solo dopo lettura delle edizioni finali. Revisione AI distinta, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Nessuna pubblicazione o modifica del reviewer ai candidati.

## Modello e figura

Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

XML e rendering completo letti. Dettagli rettangolari 20×20 e 20×40 px a 20 px/mm rappresentano aree 1 e 2 mm²; non sono cerchi e non rappresentano il serbatoio. Con H=5 m, velocità comune 10 m/s e barre 100/200 px a 10 px/(mL/s) per 10/20. Conversione mm²·m/s=mL/s dichiarata. Confronto finale A1,H5 e A2,H20: barre 100 e 400 px per 10 e 40 mL/s, stessa scala, senza confusione con quote o velocità.

## AR-u3-torricelli-flow-01

Procedimento indipendente: Torricelli: v²=2·10·5=100 m²/s², v=10 m/s. A=1 mm²=10⁻⁶ m² dà Q=10·10⁻⁶ m³/s=10 mL/s.

Alternative e distrattori: La portata 10 mL/s non è la velocità 10 m/s. Omettere conversione mm²→m² moltiplica il valore SI per un milione.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `04881237295418bde4a96484247e219d5fcf1b3a8da0ba02eb31a6aab86ca83b`; candidato `c7f62f99361b090f685c354100ae84dda8bb09ed2aded8ab3b1cfa390628559a`; firma `59c55bf4184111afd079a5be928623e3f6624791edc4bb661e34e3c42f3e6c58`.

## AR-u3-torricelli-flow-02

Procedimento indipendente: Q=Av ha dimensioni L³/T. Conversione esatta: 1 mm²·1 m/s=10⁻⁶ m³/s=1 mL/s. Riconoscere mL/s non richiede un calcolo numerico autonomo.

Alternative e distrattori: m/s velocità, mm² area, mL volume senza tempo, kg/s flusso massico che richiederebbe densità.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `mL/s`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `19f0311b87169ec0262f3b26cfe86d5e14db35da2ddb77f7156e9e4d8bc33583`; candidato `acee29486d8c33d02fa7a5678fc57369f223b08a5a5d11bdb4d42c49f03441d1`; firma `27f48ab0fa8994c2c4ee9f9e152416224aab721b508533cefb1e894a77db1205`.

## AR-u3-torricelli-flow-03

Procedimento indipendente: Il modello dà v=√(2gH), uniforme nel foro. Con coefficiente ideale unitario e contrazione esclusa, il flusso volumetrico è Q=A√(2gH).

Alternative e distrattori: 1/A dipendenza e dimensioni errate; A·2gH usa v²; √(gH) perde fattore 2 e doppio esterno non assegnato.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `Q = A√(2gH)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `7e30469a2087d08b98f7a2f43bef0ea2b204956d57f40e343096ea2fd2599967`; candidato `7d8ecbf93007d2fa7543db8cd7db6c6585283fab5ee622528814d9bb5d37b23e`; firma `eeada06ae19da48d2025a5afc48e5826e62a9f2043c83dca49b0f6635c9132b6`.

## AR-u3-torricelli-flow-04

Procedimento indipendente: A da 1 a 2 mm² a H=5 m: v resta 10 m/s e Q da 10 a 20 mL/s. Si scala l’area assegnata, non un raggio.

Alternative e distrattori: √2 mette area sotto radice, 40 conta due volte il raddoppio, 5 inverte, 10 ignora il foro nuovo.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `Da10 a20 mL/s`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `9f11989541f4ac9161f0f881494a2ee9a93ec11159a134754d9ab5bb9c2b7fc5`; candidato `b1d9641eb5ce365abf445d59e944d965d1ffeee688d43912f6d9ddcb5dc2a162`; firma `76afc3caa0941ceb99a4cb8669bed72dc2d47fd9403585de6b39a00118b97f90`.

## AR-u3-torricelli-flow-05

Procedimento indipendente: A=Q/v. Q=10·10⁻⁶ m³/s e v=10 m/s danno A=10⁻⁶ m²=1 mm².

Alternative e distrattori: Qv non è area, v/Q area inversa; 1 m² cambia l’area corretta di un milione.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `0a31f0a902416ef2f8b59ea509eaa44f4e9d5988d20500202b02e07c84a21f67`; candidato `99fccfe0dd4af95ae8f52ab806f71fd3f145b2778c775352b9ed93ff2e6e265b`; firma `27e7814dc5f48831c5d310d7272660e43c1f31318b7940d69b4506e5aade8a84`.

## AR-u3-torricelli-flow-06

Procedimento indipendente: v=Q/A=10 m/s dopo conversione. H=v²/(2g)=100/20=5 m, battente istantaneo.

Alternative e distrattori: v/(2g) non lunghezza; omettere 2 darebbe 10 m. Senza conoscere A la sola portata non identifica H.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `724297679493cb71fb8c1ac3739c5b286cb08b5eb87b049a70a9a2b709b424b0`; candidato `377e2ce6642ecfd6a8cce932d4e9c8944e635ec30ca4f01a7adbb688ce98bb3c`; firma `bacf3265bea7e007a879d0b5867e3c5e040e594d7aa836ad4b5aa7948aef974b`.

## AR-u3-torricelli-flow-07

Procedimento indipendente: A fissa, H da 5 a 20 m: v 10→20 m/s e Q 10→20 mL/s; rapporto 2.

Alternative e distrattori: 4 tratta Q come lineare in H; 1/2 e 1/4 invertono; 20 è Q_B numerico, non rapporto.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f3e5f5137244c3878c575bbfbae0393fdfff9263d353b0ab9d638d58c5493242`; candidato `82bfd2ec8ae4e19ca6fe989814b2d3e3e99cb14bd10cdf70dae46e6f99fe3dc4`; firma `30138da708102fa88a07fcfff27d377a5421f584dc0db7ef8b428a8455a0d3c4`.

## AR-u3-torricelli-flow-08

Procedimento indipendente: Corretto 10 mL/s; proposta meno corretto 20−10=+10 mL/s. A stessa area, proposta richiederebbe battente 20 m, non 5.

Alternative e distrattori: −10 ordine invertito; 20 proposta; 0 accetta; 5 metà dello scarto. Non si contano due volte i flussi ai due lati.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `10`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `506f93fc975a3457ef6e110f222de13496c1b944de2723f10c8159642eea1bb3`; candidato `72fa998b0990533443bcdcb0e2e8fe305bb4ce4f3049bceecea6586c9d636fcd`; firma `3f217ba33ff31cb14dee9f77e46c1b0ed45ef4ea7e00a14562ae61627852bcb6`.

## AR-u3-torricelli-flow-09

Procedimento indipendente: Dividere Q=A√(2gH) per la velocità positiva isola A=Q/√(2gH), dimensione area. Conversione in mm² solo dopo coerenza delle unità.

Alternative e distrattori: Prodotto per v e reciproco non area; dividere per v² errato; fattore 2 finale altera Q senza dato.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `A = Q/√(2gH)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `01fdb0ba952bc002707d1faea3fc58ea748b10b94801ff613cb7d64c318a44fc`; candidato `5ad7576f8a83b1e2cec9430c5a64e7984f8f93b8f1744a83563763dc1595dbb6`; firma `f538464037d11aaa8ce572dedd36edab1a50dabe852ce1ede140ef661f95df8e`.

## AR-u3-torricelli-flow-10

Procedimento indipendente: Area scala κ₁, velocità scala √κ₂ perché g è fisso e H sta nella radice. Q_B/Q_A=κ₁√κ₂, con coefficiente di efflusso uguale e unitario.

Alternative e distrattori: κ₁κ₂ perde radice su H; √κ₁ applica radice anche all’area; quoziente inverte H; κ₁² tratta l’area come un raggio.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `κ₁√κ₂`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `024274c730040997e5c62d2c184ef67a97fa81ad51ecc485eb4b1600ffc2499b`; candidato `c288f54c47fe6d5aec7d1b7dd38c271e8882da2246ea2cb1533483da7265bfcc`; firma `1b94b9b6efaaf4cb2863c3655b9dd3275a95d44dcbaeec52f182d36c5da54fc8`.

## AR-u3-torricelli-flow-11

Procedimento indipendente: A: 1 mm² e 5 m→10 mL/s. B: 2 mm² e 20 m→40 mL/s. Rapporto 4=2·√4.

Alternative e distrattori: 2 solo una variazione; 8 applica H linearmente; 1/4 reciproco; 40 portata B numerica.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `06e1cd674288013d1cc289b744141fe8810ee2717c573bed81327a622531f8c6`; candidato `08c21aa02f5df219f815f2829ecf51bd7674833326116b59b6050cb4e869bcca`; firma `e7f6817056741445f5ade5ef7c343cad5675de9b60e992f546d11b5a852263c6`.

## AR-u3-torricelli-flow-12

Procedimento indipendente: Media (10+40)/2=25 mL/s. Ingressi medi 3/2 mm² e 25/2 m danno 15√10/2 mL/s. I quadrati 625 e 1125/2 sono diversi: prova manuale esatta, senza √10 decimale.

Alternative e distrattori: 50 somma; 25/2 doppia metà; 15√10/2 ingressi medi; 30 differenza fra portate.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `25`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `fe22e4f30e560e7f491c7ac72472be793c8388f7f6b14b99a1dbffc4bafc19f4`; candidato `1ec35b196116784950689be74cb5e6d56ca1bf2a688c8271bbfb3847f35b9f2f`; firma `b2045d42d0dd5fd651896c18269a748e5186138a054e956ade6586099548a8aa`.

## AR-u3-torricelli-flow-13

Procedimento indipendente: Target 4·10=40 mL/s; A_B=2 mm² richiede v_B=20 m/s. H_B=20 m e rapporto H_B/H_A=20/5=4.

Alternative e distrattori: 2 segue velocità anziché suo quadrato; 1/4 reciproco; 8 conta ancora area; 20 è H_B numerico.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `ee0f1171e5dff6ed95a9b3c4531401a45e37ca791fd9e73cd7c8ea44180d9977`; candidato `6de974ae59619e50fe4799ad5bee3e5ea550f6780a372a384bc616f63cf02b32`; firma `743e90f5debc51744a2cb3ae5c4d3b944f1e415e0421c44a738603027e118b71`.

## AR-u3-torricelli-flow-14

Procedimento indipendente: q=30/(10 mL/s)=3 s/mL. S_B=120→Q_B=40 mL/s; H=20 m→v=20 m/s, dunque A=2 mm².

Alternative e distrattori: S=120 scambiato per mL/s darebbe A=6 mm². Il numero 2 corretto è area, non lato da quadrare.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `17868908a805eb0f34a50b89895327ee8ad817ae6f76abd26117631b2de1c675`; candidato `b256a284c92521ba60810a12b9b4332b739ffc817c72ef3ca3384c41be7a7ee2`; firma `3428b70b0b5f6d555863ebf49184902f8b9219926b55920b28c06811f1ac6566`.

## AR-u3-torricelli-flow-15

Procedimento indipendente: Differenze ΔS=60 e ΔQ=30 mL/s danno q=2 s/mL, offset 1. S_C=41→Q_C=20 mL/s; H=5 m→v=10, dunque A_C=2 mm².

Alternative e distrattori: A=1,3,4,1/2 mm² a H=5 m danno letture 21,61,81,11, non 41.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `b55c962167c6d48d75496383f9c8efa1553b83031ccad9d1b35fc66aa4db2a20`; candidato `d0c0f613bf28518b92cda1eeb62844b3fa4048a05f04e64728d37fab7e97bdc4`; firma `6654eb4d0585d90a8f562bb4ac1efc51a79580d0be4f7cfe69a96bf67110953c`.

## AR-u3-torricelli-flow-16

Procedimento indipendente: Con x=H/(1 m)>0, a=A/(1 mm²)=x/5, la portata numerica è a√(20x). Dato 10: 100=(4/5)x³, quindi x³=125 e x=5. H=5 m, A=1 mm²; unicità dal cubo crescente.

Alternative e distrattori: Il coefficiente c è area per lunghezza. H=5 e A=1 ricostruiscono Q=10; cubo positivo crescente esclude due soluzioni. Elevamento al quadrato applicato a grandezze positive, senza ramo spurio.

Ipotesi e dominio: Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `039a8aae7dcf3ee34d3321d73ac557481b444fc867f52a3d648e52c03746b9b6`; candidato `5814d737b7cb76ec978a0ed39237be36136d79983c313f80ecf568651d006afe`; firma `06ccfc22ce2872981964f04a762d083991d815e66cda7a6826451a3201e95670`.

## Controprove e contratto

24 controprove per lotto: 16 chiavi errate con candidateSha256, binding e tutte le guardie d’edizione rinnovate in memoria, respinte dagli oracoli o dalla prova concettuale separata. Sono respinti anche fonte falsa con guardie rinnovate, numero corretto con unità sbagliata, prova fisica falsa con chiave corretta, pacchetti vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Per la spiegazione falsa resta esplicito il confine della lettura individuale congelata: il rifiuto non viene attribuito a un ricalcolo automatico del linguaggio naturale.

assert_record_identity verifica sia report fresh sia report salvati contro pacchetti e binding reali. Sono usati soltanto EXACT_ORACLE e AI_CONCEPTUAL. I radicali numerici passano da un AST limitato ad aritmetica razionale e radici di interi: nessun eval o sympify dell’input. Sono provati frazioni, somme radicali, reciproci e rigetto di chiamate arbitrarie, divisioni per zero e potenze enormi.

Il test comune genera inoltre 35 configurazioni per ciascuna di cinque proprietà fisiche, 175 in totale: somma dei costi gravitazionale/cinetico, continuità e totale di Bernoulli nel Venturi, ramo positivo e inverse di Torricelli, unità e area nell’efflusso, complementarità e limite geometrico della gittata. Le letture individuali non vengono sostituite da queste configurazioni.

Importazione, browser e conteggi globali restano dell’integratore. Non è stata eseguita una prova con studenti o una revisione umana.
