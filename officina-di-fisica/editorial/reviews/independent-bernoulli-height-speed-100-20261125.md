# Revisione indipendente — bernoulli-height-speed-100

Autore e reviewer distinti. Edizione autore finale `54c5064253058dddcec2c05b8c628c552345fe5c`; fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json`. Tutti gli 80 prompt originali delle cinque famiglie sono stati letti e risolti prima di aprire i pacchetti candidati. Trasparenza: il messaggio di consegna dell’autore aveva già anticipato l’esito del record 104-06 (gittate uguali e velocità A doppia), oltre a indicazioni qualitative sui radicali, sul quartico e sul cambio dei nomi h/H. Quell’esito è stato comunque derivato dai due modelli fisici, ma non viene presentato come lettura completamente cieca della chiave. Nessun modulo autore importato.

Sono poi stati letti tutti i 16 candidati finali di questo lotto, con consegne, passaggi, formule, alternative, suggerimenti, feedback e metadati. C2-L005 e C2-L006 reali rilette per portate, energia per volume, Bernoulli e ipotesi. Tutti i cinque SVG delle famiglie sono stati letti in XML e nel rendering nativo completo, incluse geometrie, scale e traiettoria quadratica.

Pacchetto normalizzato `66ac52170e47b1a42138d5828259adeb80d767cb80b5bcb77d9871c2c070b622`; binding `7291abe44c891b306c5698f15ca02fc296035fcba42aaf9f7efe2166cfd8bbcf`. Impronte congelate solo dopo lettura delle edizioni finali. Revisione AI distinta, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Nessuna pubblicazione o modifica del reviewer ai candidati.

## Modello e figura

Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

XML e rendering completo letti. Superficie y=300 e getto y=200, dislivello 100 px a 100 px/m. Freccia del getto 60 px a 30 px/(m/s). Δp=12 kPa è somma 10+2: barre 200+40=240 px a 20 px/kPa. Grafico contro v², non v: origine (100,1450), scale 10 px/(m²/s²) e 10 px/kPa; intercetta (100,1350) per 10 kPa, punti (140,1330) per (4,12) e (260,1270) per (16,18). Le frecce degli assi sono path separati. Pressioni assolute esplicite.

## AR-u3-bernoulli-height-speed-01

Procedimento indipendente: Bernoulli: p_s = p_j + ρgh + ρv²/2. A h=1 m, v=2 m/s: quota 10000 Pa e cinetico 2000 Pa, somma 12000 Pa = 12 kPa; p_s=112 kPa assoluti.

Alternative e distrattori: 2 kPa copiano il cinetico e 10 la sola quota; 24 raddoppia la somma. La differenza 12 non è p_s assoluta 112.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `12`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `807907b9b862a23a9c1ef90c41b203e9c4883f2185ecbfe5e047f7733ac882ac`; candidato `5b318a7f9957a52dc85c57be0d014ba72676fe68e192d7588b050fba2217cfd5`; firma `78d8e0b1fb0b127c0a430e6db4007e728a9e47cb9c199a52c8d745b0476ca1c3`.

## AR-u3-bernoulli-height-speed-02

Procedimento indipendente: ρgh e ρv² hanno dimensione M/(LT²), energia per volume. Pa=N/m²; kPa è la stessa dimensione con fattore 1000. Non occorre un calcolo numerico autonomo oltre al controllo dimensionale.

Alternative e distrattori: m/s velocità, m²/s² energia per massa, N forza e kg/m³ densità: solo kPa è pressione.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `kPa`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `36ce67c7970ccdb3c273939f34bfdd307e17921cbd7cd2595e4da1ba13a6b7bf`; candidato `7ce00fe147b054240ea758c8ed565c3cd5a739108674a35db3817f0cce198dd8`; firma `21857ec92daf715b6c02aebbbfdd190aba42bb53447c68b1b67531c001cf3062`.

## AR-u3-bernoulli-height-speed-03

Procedimento indipendente: Con z_s=0 e z_j=h>0, superficie quasi ferma e getto in moto, la differenza p_s−p_j deve fornire sia ρgh sia ρv²/2: entrambi i termini positivi.

Alternative e distrattori: I segni meno farebbero fornire energia all’accelerazione o a una salita; termini singoli trascurano una richiesta energetica assegnata.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `Δp = ρgh + ρv²/2`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `1ecea2cfd130d62f4ff61ccfacf196f64fb86862a62d9ca057d4bafa305d84a8`; candidato `82e9e6d7b75b3f03fb648242d5c3aaf5a8261ba53d3e7e48179f44a5ffa5e6a8`; firma `2aab875d3c5af02eb24a9ba1cf05a849d95849d2c24e39968e7a3b8bb2ec705a`.

## AR-u3-bernoulli-height-speed-04

Procedimento indipendente: Quota 1→2 m a v=2 m/s porta ρgh da 10 a 20 kPa; termine cinetico fisso 2 kPa. Δp passa da 12 a 22 kPa.

Alternative e distrattori: 24 raddoppia tutta la differenza, 6 la dimezza, 12 ignora la nuova quota e 14 aggiunge 2 kPa anziché i 10 del metro aggiunto.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `Da 12 a 22 kPa`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `0d3410dfa485eb3e755e3873938875f8a9bb27953f61ffb2e986dcc5c0199c12`; candidato `28c15d7b127e9fb9461220eabc719d28b339e1d2fc4ce747fb3a6c680474b1b7`; firma `b1f931595bc545bb39d28ff8dacb86fede18f8a37df36de47a332e2a5c2aa9d4`.

## AR-u3-bernoulli-height-speed-05

Procedimento indipendente: Prima si sottraggono i 2 kPa cinetici da 12; h=(10 kPa)/(10 kPa/m)=1 m. Serve Δp>ρv²/2 per h>0.

Alternative e distrattori: Senza sottrarre il cinetico h=6/5 m; aggiungendolo h=7/5 m. Entrambi falliscono la ricostruzione 10h+2=12.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `5bd88733f8421c71eb837fa713a96a2d0dd5e75a772d69d9b8fd34dfa0fa2cb0`; candidato `2c38ebe7506ad37470adf7a6a518530d55fe7ce8750a88459b0ab2f5129e8c4c`; firma `7d1edf7ef30af532fdb57fb8ec3cc3f05550ca0c951ae6299b33c5d6162bd5d6`.

## AR-u3-bernoulli-height-speed-06

Procedimento indipendente: Il residuo cinetico è 2 kPa. v²=2·2000/1000=4 m²/s², rami ±2 m/s; il modulo positivo assegnato è 2 m/s.

Alternative e distrattori: 4 è v² nelle unità del quadrato, non v. Il ramo negativo non è il modulo positivo richiesto; residuo cinetico deve essere positivo.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `51fa7b4e298fb2a3e7e60d538d498ac3c3b6ec1b80520842208a76041d7ff269`; candidato `059a3030d236e3ca7bc7327a9622635de707cc44c723d641d640f77641d9d618`; firma `fdae18b695adf0f10e8d7b2767d88e52a12bf0d9c61ec7c9f55237b964dfb90c`.

## AR-u3-bernoulli-height-speed-07

Procedimento indipendente: A 12 kPa, B con stessa quota e velocità 4 m/s: 10+8=18 kPa. Rapporto 18/12=3/2; il termine di quota non quadruplica.

Alternative e distrattori: 2 segue v linearmente, 4 attribuisce il quadrato anche alla quota, 2/3 reciproco, 1 ignora il nuovo v.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `3/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `c7b95d69f432b0e866526bdd5b5a2e212ef105da1106086da2d2b8bf592d8622`; candidato `1f04f6e2f3fb45d68b3232bcf9012bc372d8d2fb824a6dc119f5ffe316bfbdf3`; firma `a8a0202b242d316d928d19b5955743b1dfd35c0a671ed4cbaec764832402016b`.

## AR-u3-bernoulli-height-speed-08

Procedimento indipendente: Corretto 12 kPa; proposta meno corretto 24−12=+12 kPa. La proposta eccede la somma dei contributi presenti.

Alternative e distrattori: −12 inverte lo scarto, 24 proposta, 0 accetta e 6 dimezza ancora il risultato.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `12`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `5f4de4623a72943522a5c7a9acf0ad58aef031a67083fd7173208054eaf03fd6`; candidato `36d4005d5326485e4567047dfed43ba2c6b34312f0b74d4a9cb49b9a165ff304`; firma `8a175207c956ec5c56f6c026f0687838cf392e9d36b941fa6ec3d43626d95c6e`.

## AR-u3-bernoulli-height-speed-09

Procedimento indipendente: ρgh=Δp−ρv²/2; dividere per ρg>0 dà h=(Δp−ρv²/2)/(ρg). Numeratore positivo, pressione su pressione per metro lascia metri.

Alternative e distrattori: Il più conta due volte la parte cinetica, l’omissione la attribuisce alla quota, differenza invertita negativa; prodotto per ρg dimensionalmente errato.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `h = (Δp − ρv²/2) / (ρg)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `581e739dd98bbe058ce654759fe63b62c018e46b2d0795203020998dd25836cd`; candidato `d11b7b4d040052d131602b92440248c2ac9141343baf98443180947246dd67e0`; firma `0dcfa06ad0dad0aa9ea8b0619f0882914abfa83f0ae5f6eacf1a501352ce3a75`.

## AR-u3-bernoulli-height-speed-10

Procedimento indipendente: U=ρgh_A e W=ρv_A²/2 sono pressioni. In B il primo termine è κ₁U, il secondo κ₂²W. Il rapporto è (κ₁U+κ₂²W)/(U+W).

Alternative e distrattori: Prodotto dei κ non descrive una somma; κ₂ senza quadrato perde l’energia cinetica, reciproco inverte, somma dei fattori omette i pesi U,W.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `(κ₁ U + κ₂² W) / (U + W)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `cdb1ec0a2967621ab8029b7a5750040575d2e89bb17a0d712b2a6ca35da578df`; candidato `5e164f3b7583bd38ba0c50463e347cd181f10f89b390737cf2d85f1992631820`; firma `e35207f4b7b5999a39e1fbd7c84f26f922181b32c38416e69e2a7cd22a6790d7`.

## AR-u3-bernoulli-height-speed-11

Procedimento indipendente: A: 10+2=12 kPa. B: 20+8=28 kPa. Rapporto 28/12=7/3, senza decimalizzazione.

Alternative e distrattori: 3/7 reciproco; 2 solo quota; 4 solo cinetico; 28 è la pressione B numerica, non rapporto.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `7/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `745b8a3e4dc6a956b58fe682c72f8bf9b06a69f610e65fb35aae55b304b23051`; candidato `060a90ac68686d6f6ec227a8116ee538aadda2ade6e92e83638598bc0cb453d3`; firma `fa899dec952d201c65a3b80fb03ee29838545715bf79f820b46086ea1f798465`.

## AR-u3-bernoulli-height-speed-12

Procedimento indipendente: Media (12+28)/2=20 kPa. Ingressi medi h=3/2 m, v=3 m/s danno 15+9/2=39/2 kPa, inferiore di 1/2 kPa.

Alternative e distrattori: 40 somma, 10 doppia metà, 39/2 ingressi medi, 16 differenza fra uscite.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `20`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `e2692bcdbb6fcd9aa45dd34236d4a96131083e4e4ee2baae27fb0ba66feb2111`; candidato `cb1f6b83426a9048c0202706de753dd901e93c3fd39c7deb93a20e002401215d`; firma `efb5c10176021f40e1d6d066a0573bc2f5f2b2d50784e2491f1128af9d5a25ea`.

## AR-u3-bernoulli-height-speed-13

Procedimento indipendente: Target (7/3)·12=28 kPa. Quota B costa 20 kPa; residuo 8 kPa, v_B²=16 m²/s²→v_B=4 m/s. Rapporto 4/2=2.

Alternative e distrattori: 1/2 reciproco, 7/3 bersaglio di pressione, 4 rapporto dei quadrati, 4/3 non realizza 28 kPa.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `b5adaa1ede2b402d0aa1ac31710aad6dc741f589aca942896c97c252e4c199e4`; candidato `e90a4fb3dbd9e2098f7b4934ed8bc5f37cafb2c52eb05fd89f09aedb1d297322`; firma `d7aa2500a1752dd81ea9c2635eb435caf4ff6be1c55711b5d14e945dcd66388f`.

## AR-u3-bernoulli-height-speed-14

Procedimento indipendente: q=36/(12 kPa)=3 kPa⁻¹. S=84 dà Δp=28 kPa; velocità 4 m/s costa 8 kPa, quota 20 kPa→h=2 m.

Alternative e distrattori: S=84 scambiata per kPa darebbe (84−8)/10=38/5 m. Serve prima dividere per q.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `134d981b472971584f9c823060b0b7c1f130054794c33bbcb1d51486fd61845e`; candidato `73ed0048436cd2cf4dbc17af51f007698bfbeab2131488f745619e84fdd497a3`; firma `5b51b48d7cdd06b8234160ca967ad288e2c394244b776ba32f71ee5282a0de39`.

## AR-u3-bernoulli-height-speed-15

Procedimento indipendente: Riferimenti Δp=12,28 kPa e letture 25,57: q=32/16=2 kPa⁻¹, offset 1. S=45 dà 22 kPa; a v=2 restano 20 kPa→h=2 m.

Alternative e distrattori: Quote 1,3/2,5/2,3 m a v=2 danno letture 25,35,55,65; solo 2 m dà 45.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `b259652f95b080c2c71c41126ba82473c6840bdb2446b562311f0b13c0a7d4c8`; candidato `c2d81c0b68e39a720ae63846946158c5b8fdcd2bd0ac0a32134548eede1041ac`; firma `f781c9b45df0c397e1117ed373ccd6563fdcd94dc975ac3a32444d823239ae87`.

## AR-u3-bernoulli-height-speed-16

Procedimento indipendente: Vincolo h=(1/2 s)v. Per x=v/(1 m/s), Δp/(1 kPa)=5x+x²/2. Dato 12: x²+10x−24=(x−2)(x+12)=0; soltanto x=2 dà h=1 m e v=2 m/s positivi.

Alternative e distrattori: −12 è vera radice algebrica ma dà velocità e quota negative. Non si elimina per la sua grandezza: è fuori dal dominio.

Ipotesi e dominio: Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `7af945344debae8c8e8c5dba8bfdb2150ef4cab20ae9578c2cd234c728d2e294`; candidato `9997f62b92e3b9d4d68caa72578fd13284d97dd06add85bff33791bd2c4c000b`; firma `0d67ac064acd395014926cb729bca2c42ab2806b3400b2e0d6438f1b5b52e643`.

## Controprove e contratto

24 controprove per lotto: 16 chiavi errate con candidateSha256, binding e tutte le guardie d’edizione rinnovate in memoria, respinte dagli oracoli o dalla prova concettuale separata. Sono respinti anche fonte falsa con guardie rinnovate, numero corretto con unità sbagliata, prova fisica falsa con chiave corretta, pacchetti vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Per la spiegazione falsa resta esplicito il confine della lettura individuale congelata: il rifiuto non viene attribuito a un ricalcolo automatico del linguaggio naturale.

assert_record_identity verifica sia report fresh sia report salvati contro pacchetti e binding reali. Sono usati soltanto EXACT_ORACLE e AI_CONCEPTUAL. I radicali numerici passano da un AST limitato ad aritmetica razionale e radici di interi: nessun eval o sympify dell’input. Sono provati frazioni, somme radicali, reciproci e rigetto di chiamate arbitrarie, divisioni per zero e potenze enormi.

Il test comune genera inoltre 35 configurazioni per ciascuna di cinque proprietà fisiche, 175 in totale: somma dei costi gravitazionale/cinetico, continuità e totale di Bernoulli nel Venturi, ramo positivo e inverse di Torricelli, unità e area nell’efflusso, complementarità e limite geometrico della gittata. Le letture individuali non vengono sostituite da queste configurazioni.

Importazione, browser e conteggi globali restano dell’integratore. Non è stata eseguita una prova con studenti o una revisione umana.
