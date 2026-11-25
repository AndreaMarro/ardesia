# Revisione indipendente — constriction-velocity-093

Autore e reviewer distinti. Edizione autore finale `07ea648f480e7027702d8340968d21d50884dac6`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json`. Tutti gli 80 prompt delle cinque famiglie sono stati letti e risolti prima delle chiavi candidate; nessuna esposizione iniziale alle chiavi in questa revisione. Nessun modulo autore importato. Poi sono stati riletti singolarmente tutti i 16 record finali di questo lotto: consegne, passaggi, alternative, suggerimenti, feedback e collegamenti scientifici.

Pacchetto normalizzato `4709b9b4a6b9ac5f3099603d4090a6b844ddd54162e698e65d35cfaa2a51983b`; binding `81c4550d001fa3230f9ed6684816071ed275d3adbae9619fd2d9caa30ddfc887`. Le impronte delle singole fonti, dei candidati e delle figure sono congelate solo dopo la lettura delle edizioni finali. Competenze C2 reali controllate sulle lezioni: L004 per galleggiamento/pesata, L005 per portate e continuità. Il profilo assegnato nel 091-03 è autonomo e ora include esplicitamente A=πR²; il procedimento manuale usa la media areale esatta.

Questa è una revisione scientifica di un reviewer AI distinto. Approvazione umana NOT_RUN; stato DRAFT; publicationAction NONE. Nessuna pubblicazione, nessuna modifica del reviewer ai candidati.

## Modello e figure

Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

XML e rendering completo letti. Canale rettangolare con profondità fuori foglio 1 cm: altezze 4 e 2 cm, 200 e 100 px a 50 px/cm, danno aree 4 e 2 cm². Frecce 80 e 160 px a 40 px/(cm/s), ognuna in path distinto. Grafici area×avanzamento: 80 × 80 e 40 × 160 px, assi 20 px/cm² e 40 px/cm, entrambi 6400 px² per 8 cm³ in 1 s. Ultimo pannello apparati distinti: Q 8 e 6 cm³/s, barre 160 e 120 px a 20 px/(cm³/s). Non è applicata una falsa Q costante fra apparati.

## AR-u3-constriction-velocity-01

Procedimento indipendente: Continuità di massa senza accumuli: ρ A₁ v₁=ρ A₂ v₂. Densità comune si cancella: Q 4·2=8 cm³/s, v₂8/2=4 cm/s.

Alternative e distrattori: v₂2 farebbe uscire 4 cm³/s contro 8 entranti; nessun accumulo disponibile.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `15f718b25c7b7d6042d6e68d843987be2de58f0fa9e6f275bdc6d0b0072b38f6`; candidato `51913db5034dce5da4f2fb760eb4d85b00d40b1743a0ee378152d88c009fcee2`; firma individuale `1849e45412ba86f31705d5d0060e05f1fc40edc9d2e4af0ab1f82149c4c22b96`.

## AR-u3-constriction-velocity-02

Procedimento indipendente: Rapporto aree puro, velocitàv₂ in cm/s come v₁. Portata volumetrica distinta dalla velocità.

Alternative e distrattori: cm³/s portata, cm² area, s/cm velocità inversa, kg/s portata massica.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `cm/s`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `617b135a4500d98cfda1117bc63d8bc2f755548bd185ea14a416c9c84430cf3c`; candidato `786a7a0546efaf6e210ced83fb09e659b02b6952c50f74e1077dc881b2e8e0de`; firma individuale `92a85b77095ece939aa81e05ec53064047152f82030cfb37d852064866e8bd26`.

## AR-u3-constriction-velocity-03

Procedimento indipendente: Dal volume di controllo stazionario si ricava v₂=v₁ A₁/A₂. La viscosità non invalida la massa conservata; pressione non determinata da questa sola legge.

Alternative e distrattori: Aree invertite rallentano erroneamente il tratto stretto; prodotto altera dimensioni; fattore 2 extra; v₁ uguale solo per aree uguali.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `v₂ = v₁ A₁ / A₂`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `1fa6957dc84aa304dbd43f71a87aac11d5c051f974d769cd63ca88241a57a62a`; candidato `bb5a86726b49c763e360367850e0d2a2f2c3063ef427a45ce162e7b8aa059293`; firma individuale `50bc96a0e9364231a677cbc6b8829d2c6060976e94b83b7728d302b40951d803`.

## AR-u3-constriction-velocity-04

Procedimento indipendente: Fra apparati A₁4→3 cm², v₁2 cm/s fissata: Q 8→6 cm³/s. A₂2 cm²→v₂4→3 cm/s. Q uguale entro il singolo tubo, non fra gli apparati.

Alternative e distrattori: 16/3 inverte il fattore 3/4; 4 mantiene una Q non assegnata fra apparati; 6 è portata numerica, zero non positivo.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `Da4 a3 cm/s`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `613add58e902de58f8f1b59d369f2c7ed47195e32634a2ee29c5bcf45bc68778`; candidato `03f9084e5f3a94efeacc22fb3c1a55ce90400023366f7c3ace1e43531fa4a52f`; firma individuale `d3d24eaef265e03b3d531574bf5421c37f85a6b1e2b059467c1097d4d5d5e17b`.

## AR-u3-constriction-velocity-05

Procedimento indipendente: A₁=A₂ v₂/v₁=2·4/2=4 cm², area già assegnata come grandezza.

Alternative e distrattori: A₂ v₁/v₂ darebbe 1 cm² insufficiente; nessun quadrato di aree già note.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `bdf6a29c44f4fdd198a1ccf14d13c6a6c9a2979e29b30e9c6d0060c422d4af16`; candidato `c53f1f0f2474f40443996d61aa672e4c089583439b1aa59e654bc61c44803687`; firma individuale `a34d676da313b337a01378aa5a3a03655185bd9a7242ab23622cf801521ff929`.

## AR-u3-constriction-velocity-06

Procedimento indipendente: Q 8 cm³/s, v₂4 cm/s→A₂2 cm².

Alternative e distrattori: 8 non area; 8 cm² a 4 cm/s richiederebbe 32 cm³/s.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `1acf2e539a2dc3aafc60234392b1274ca4d266c7d4b6738963fa1094b83ea5f4`; candidato `898563e5df15b2579621efe535252e945dff63c9ce330623669bda2f3a32dbf2`; firma individuale `ad4bc5d8732c202ee13abf5a009c1b6debdbf0bb4472b9f25cd8ed955c112f99`.

## AR-u3-constriction-velocity-07

Procedimento indipendente: A₁4, v₁2 fissati mantengono Q 8. A₂2→1 cm² producev₂4→8 cm/s, rapporto 2.

Alternative e distrattori: 1/2 verso opposto, 4 confonde area con raggio, 8 velocità B non rapporto, 1 viola Q comune.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `04bb965a3cf4c70006c65e5433bfdfc3fc94b7c937dd77b948df25991e069fdc`; candidato `25761373a5dde894630f7321edc39fb6f7247b7f7d35c7d973e197330dbd240d`; firma individuale `e20224ef7ba631696138128b240b0013f1ce7f13c27c7b356f21bc0c09c503aa`.

## AR-u3-constriction-velocity-08

Procedimento indipendente: Proposta 8 meno corretta 4=+4 cm/s. La proposta a valle richiederebbe Q 16 contro ingresso 8.

Alternative e distrattori: −4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza ancora.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `8cf8473c994e3b00953a28d5c285ea849d21342a018e63ef52ee98667f0b257c`; candidato `134bc70ca0232e5e30f022e476ee6f4b49cb839719a5e574d15f15f422b1f441`; firma individuale `9e99b4b633581ed258a2ccad6de25228e68a6c5d76405735f82aa7dc64ca8fc1`.

## AR-u3-constriction-velocity-09

Procedimento indipendente: A₂ v₂=A₁ v₁→A₁=A₂ v₂/v₁, rapporto velocità puro. v₁ è 2 cm/s, non numero 2 privo di unità.

Alternative e distrattori: Rapporto velocità invertito errato; v₂/v₁ solo è puro; A₂ v₂ portata; 2 extra non giustificato.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `A₁ = A₂ v₂ / v₁`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `d41bbece934d0b8c8b7c415a4488124d6267339506deb69a67e42f513b1c15a4`; candidato `ac1f8842168d5acb1d8d10db1d498eb3c42d524d79ba636cb1fc7f874a19ced2`; firma individuale `035d4ad453859b7e6fdcd10013f84a2908e12976a5b1b6928cd521e048ac4934`.

## AR-u3-constriction-velocity-10

Procedimento indipendente: Scalature delle aree: rapporto v₂ B/v₂ A=κ₁/κ₂ con v₁ comune. Le Q possono cambiare se cambia A₁.

Alternative e distrattori: Prodotto effetto diretto errato su A₂; reciproco scambia apparati; κ₁² duplica area; somma non 1 per identici.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `κ₁ / κ₂`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `0bdebcd42d0fb9864bbf9f70788af718d3ba5638140d9fac4b87543e324abf1a`; candidato `87dadd12096d6ef2d0ccbc6f92ce1e3ef09beb18a38bb62e1cfec319cf30b994`; firma individuale `78472034ceec225fa6ea2ca6a8e941b7785be3d9792136b13a50b63c706edf54`.

## AR-u3-constriction-velocity-11

Procedimento indipendente: A: v₂4 e Q 8; B: v₂6 e Q 6. Rapporto velocità 3/2 pur con portata B minore.

Alternative e distrattori: 2/3 reciproco, 3/4 solo ingresso, 2 solo uscita, 6 velocità numerica B.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `3/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e61e0a44f807d7b4198f7102701434ef03a3000b6812421ae9de083675293ac0`; candidato `b92b692670a7e3ac79d8f866ab0c9d5cae1d8a75b35f259b77aac545468c4d25`; firma individuale `f5c56f814797dcae9a2a3092ad048fb5ee2dba7cda8ec594d895b74649498f55`.

## AR-u3-constriction-velocity-12

Procedimento indipendente: Media(4+6)/2=5 cm/s. Aree medie 7/2 e 3/2 cm² danno 14/3 cm/s, differenza 1/3.

Alternative e distrattori: 10 somma, 5/2 doppia metà, 14/3 ingressi medi, 2 differenza.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `2ef4ab1c694f68079afe2c83c5f5b71f9be3c78aad71b4c932019aec0609547e`; candidato `e183b7fd0db63fc8d9f17c8cfc3d8b31b52eaaf631b2897d0e62b87dfb834652`; firma individuale `f4e024eea279088aa3eda738beb80ce48bfcba6949ff7893cc17cb30295a033e`.

## AR-u3-constriction-velocity-13

Procedimento indipendente: Target 6 cm/s, A₁ B 3 cm²→Q_B 6 cm³/s, A₂ B 1 cm²; rapporto a 2 cm² uguale 1/2.

Alternative e distrattori: 2 reciproco, 3/2 seguev₂ invece inversa area; 3/4 darebbev₂4; 1 darebbev₂3, non 6.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `1/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `1932568ded81850f989e7cceaed9b9075dbb136811e09828a582810f7555bd53`; candidato `971e484e84d5061da8af2d44d19af832c23f233c17c7908b7329154cc486194d`; firma individuale `2b04962702d28534c984db07dbec1d3f71798192c09d09523be0acc5f90da85f`.

## AR-u3-constriction-velocity-14

Procedimento indipendente: q = 12/(4 cm/s)=3 s/cm. S 18→v₂6 cm/s, A₂1→A₁3 cm².

Alternative e distrattori: S 18 come velocità darebbe A₁9 cm², triplicando Q; guadagno e offset vanno distinti.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `f520210adb153c30b2c475714227828579b141db743953ff466c7e7bbb725d46`; candidato `3329d8fb72a3e101c3197a8baffa725221da5ccacc766b7777f147204e1ce041`; firma individuale `039400252f21b0bf1a639c83576bc9e11c0146f7eff3a488f57458b7fa233251`.

## AR-u3-constriction-velocity-15

Procedimento indipendente: q = 2 s/cm, offset 1. S 7→v₂3 cm/s, A₂2→Q 6 cm³/s e A₁3 cm².

Alternative e distrattori: Con A₂2, aree d’ingresso 2, 4, 1, 6 cm² danno S 5, 9, 3, 13; solo 3 dà 7.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `013def642b7f6c90b3909210186d8f22a8b714d0774ba623e42e781b3d3452de`; candidato `f01d623f79ce9170a727101f8465b8825a200181126690a907598e5a4dfc658d`; firma individuale `fb955b7944a9d3b69b0d7942b8acd2ab87dcd2a8d4d43311ccaf1f7c02499051`.

## AR-u3-constriction-velocity-16

Procedimento indipendente: A₁=2 A₂→v₂=2 v₁=4 cm/s per ogni A₂>0. Infinite coppie 4/2 e 8/4 cm²; Q 8 e 16 cm³/s diverse. Una misura di Q fisserebbe la scala.

Alternative e distrattori: Due esempi non significano solo due coppie; zero vietato. La scala richiede Q o una delle aree.

Ipotesi e dominio: Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico aggiuntivo.

Esito esatto: `Infinite`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `a4b24fcc6d15320ee8d9ebb586d46e460dd305599f5a275c95ea418915d22758`; candidato `4cf80afdcf42086863a8ed5a98129af9a97b77f9af57279e86f648ff037ea346`; firma individuale `27906cfa388b32db35d077c7622653b23aecde624e6ac5c0da86cd05bd92ce2c`.

## Controprove, identità e limiti

24 controprove riproducibili per questo lotto. Le 16 chiavi errate sono ricalcolate con binding e tutte le guardie di edizione rinnovate in memoria: il rifiuto deriva dall’oracolo matematico o dalla distinta prova concettuale, non dal solo hash. Sono inoltre respinti fonte falsa con guardie rinnovate, numero corretto con unità fisica errata, prova fisica falsa con chiave corretta, pacchetto vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Il rifiuto della falsa spiegazione conserva invece esplicitamente il confine della lettura individuale congelata.

Il test comune verifica assert_record_identity sui report fresh e saved usando pacchetti e binding reali: sono ammesse solo EXACT_ORACLE e AI_CONCEPTUAL. Controlla inoltre 35 configurazioni Hypothesis per ciascuna di cinque proprietà fisiche: densità convessa e stratificazione; pesata idrostatica e scala; media areale del profilo; massa trasportata; continuità entro un apparato distinta dal cambiamento di apparato. Sono 175 configurazioni complessive, senza sostituire le 80 letture individuali.

L’integratore esegue separatamente i controlli di importazione e interfaccia. Nessuna prova con studenti o approvazione umana è stata eseguita.
