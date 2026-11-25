# Revisione indipendente — mass-flow-092

Autore e reviewer distinti. Edizione autore finale `fc01e7b`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json`. Tutti gli 80 prompt delle cinque famiglie sono stati letti e risolti prima delle chiavi candidate; nessuna esposizione iniziale alle chiavi in questa revisione. Nessun modulo autore importato. Poi sono stati riletti singolarmente tutti i 16 record finali di questo lotto: consegne, passaggi, alternative, suggerimenti, feedback e collegamenti scientifici.

Pacchetto normalizzato `4e9319ef1818053ac457c39f11efa63bc25817243f7d75a9f6fd37b403ca310e`; binding `78398b283c2fcb63b00d8e94b6d7a6a7071beebc14ef0379f34f8ab2681113ba`. Le impronte delle singole fonti, dei candidati e delle figure sono congelate solo dopo la lettura delle edizioni finali. Competenze C2 reali controllate sulle lezioni: L004 per galleggiamento/pesata, L005 per portate e continuità. Il profilo assegnato nel 091-03 è autonomo e ora include esplicitamente A=πR²; il procedimento manuale usa la media areale esatta.

Questa è una revisione scientifica di un reviewer AI distinto. Approvazione umana NOT_RUN; stato DRAFT; publicationAction NONE. Nessuna pubblicazione, nessuna modifica del reviewer ai candidati.

## Modello e figure

Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

XML e rendering completo letti. Quattro celle uguali da 1 L nel secondo considerato, totale 160 px a 40 px/L. A Q 4 L/s le densità 1 e 4/5 kg/L danno barre 200 e 160 px per 4 e 16/5 kg/s alla scala 50 px/(kg/s). Grafico con x 40 px/(L/s), y 40 px/(kg/s): A(4, 4) a(260, 1300), B(3, 12/5) a(220, 1364), origine(100, 1460). Rette di pendenza dimensionata ρ, non grafici massa-tempo. Ogni freccia degli assi ha un proprio path.

## AR-u3-mass-flow-01

Procedimento indipendente: In Δ t passa Δ V=QΔ t e massa Δ m=ρΔ V. Il tasso è ṁ=ρ Q=1·4=4 kg/s; in 2 s stazionari passano 8 kg.

Alternative e distrattori: Una portata non è massa finita; Q/ρ ha dimensioni diverse.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `c168d990bcabcf868a259cf276a893486b30e2b8cb8d0cf508b1ab93815f08d4`; candidato `58c60e1043e12fe6efa343654fb655f5dfcb9ab00d20ac5a72bc1886264633ff`; firma individuale `7a3d7cea85f6dd022ae44af31746a90228d2c35dfc3224902d75666c5be0d4a8`.

## AR-u3-mass-flow-02

Procedimento indipendente: Dimensione massa/tempo, unità kg/s; kg/L per L/s cancella il volume.

Alternative e distrattori: L/s volume per tempo, kg massa, N/s forza per tempo, kg/L densità; solo kg/s corretto.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `kg/s`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `aea26589f02f4716fa8d6e7b4cc7dd2bcfde4b467fcbc9750285de13ffa1329a`; candidato `76ccd7e97a9683c8fe21fd6a057eb769dcc1c5cd0aee692bcd6813748d3d36f4`; firma individuale `9d5f904a6744412bddd282e24f25ba9515ef6cec3a5793930eb257cdfb0f6406`.

## AR-u3-mass-flow-03

Procedimento indipendente: Densità uniforme sulla sezione permette di estrarre ρ dall’integrale di massa: ṁ=ρ Q. Non è una portata di peso e non compare g.

Alternative e distrattori: Q/ρ e ρ/Q non M/T; doppio/metà aggiungono frazioni di volume mai assegnate.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `ṁ = ρ Q`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `fd74e57d46e2337f279ed0c627d75d1c76bf3174fa6ba952cbb9f37df95c47b8`; candidato `59cc9c6cfab1fd3a11527bdc6a503c38116e7250b4c68c0eeffe45f0dd9b6e34`; firma individuale `fe66d4d2040904a6332c7a596eadfb439d5d8f1e5d3e1b69958340179969d766`.

## AR-u3-mass-flow-04

Procedimento indipendente: ρ1→4/5 kg/L, Q 4 L/s fisso: ṁ4→16/5 kg/s, proporzionalità diretta fra prove.

Alternative e distrattori: 5 inverte la densità, 4 la ignora, 4/5 copia ρ, 8 raddoppia senza dato.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `Da 4 a 16/5 kg/s`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `76f7ebc4d7e4eac856284eebdfd794d675669807e280b8e0fc175a131a27b315`; candidato `fda4763423e5fcb202a08c6687c2f72547f8a303b256fb89bc1a3b537646a818`; firma individuale `76608c330fb11973ca8792203600d2843020daec24517e484da1f17b353cb82f`.

## AR-u3-mass-flow-05

Procedimento indipendente: ρ=ṁ/Q=(4 kg/s)/(4 L/s)=1 kg/L=1000 kg/m³.

Alternative e distrattori: Prodotto ṁ Q non densità; Q/ṁ volume specifico, inverso.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `453d78e771573e4a6fb023b693101e563e9ed3b9f0c4aed38ad8a1dff7ba1035`; candidato `361c78e81ee89b5ba0677d43db0e342b6d8ef4baea7281b36fc42251692b9574`; firma individuale `40e065b538fde7c63e6316e58ef1b22c7242768ef21449661aaa6cdafe643243`.

## AR-u3-mass-flow-06

Procedimento indipendente: Q=ṁ/ρ=(4 kg/s)/(1 kg/L)=4 L/s, non una massa accumulata.

Alternative e distrattori: Il numero 4 non conserva l’unità kg/s: si chiede L/s. Tempo aggiuntivo serve soltanto al volume totale.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `a03f378f89f426cc50fe51f21df310cbc33c43e7c948f5eae90a9980bda6c575`; candidato `fc22a3bca85dba3051302e5caeaf0d8273e7671bb6c7bea9627ab9bb0e77103d`; firma individuale `742b492eef71ac9ddbe9a8bd318254c4d51631500acd828a7df8b826981b6060`.

## AR-u3-mass-flow-07

Procedimento indipendente: A 4 kg/s e B 5 kg/s, rapporto 5/4. L’incremento relativo è invece 1/4.

Alternative e distrattori: 4/5 reciproco, 5 uscita numerica, 1/4 incremento, 1 ignora il cambio.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `5/4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `d3909f10b6a24bbef8536fb4c0018be56375a05e42caff12bb8930254e0e1b11`; candidato `0f65d0ad48e6851cee679d323a42237cb9755129729353533e5a9acd8a3e5945`; firma individuale `c7795c74794c53d23ab57f92dcaaf34494dbec999a586daf2252ccf9f47101f9`.

## AR-u3-mass-flow-08

Procedimento indipendente: Proposta 8 meno corretto 4=+4 kg/s; occorre un tempo per trasformare la differenza di tassi in massa.

Alternative e distrattori: −4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza lo scarto.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `d073715bc1d02c985cfebfe39468cc4a00f19086c37e080a7647da2473fb393b`; candidato `cc119c5ce06c29b81b4013394e17890eacf9276cbe9e19bcef7a3b0032b61649`; firma individuale `742f229d304140f772b508772401c9d52482927e910f28a3c35879e9c4245468`.

## AR-u3-mass-flow-09

Procedimento indipendente: Dividere per Q>0 isola ρ=ṁ/Q con unità massa/volume.

Alternative e distrattori: Prodotto non cancella i tempi; reciproco volume specifico; fattori 2 errati.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `ρ = ṁ / Q`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e1a1e7df870d5b0394397bd6ea2aed6ceb80b6ba8c1a390e70e6882ee7f970af`; candidato `4a42ddf0933558cd55c4d3cf56fa8aa2b4ccfd77564fa518d62a6fcb0d566de9`; firma individuale `d8c4c76746e9505b4807a50c36c8b2d6e54988c6e915df621bcb4749e2fca72f`.

## AR-u3-mass-flow-10

Procedimento indipendente: I due fattori diretti ρ e Q scalano ṁ con κ₁ κ₂.

Alternative e distrattori: Quozienti effetto inverso, κ₁² duplica ρ, somma 2 per prove identiche.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `κ₁ κ₂`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `bb9af904c1aa224b9cddd65d8c7325068fe410a331ecd15445a193feca2ca3dd`; candidato `ff882e5ddeda719d923ae28c8eea5f841337907460d41eb8c707d79399c5605d`; firma individuale `2cb9e36e5eabaf97f88765be3392d57588e24e01c9033e69d81ab92bc018cdce`.

## AR-u3-mass-flow-11

Procedimento indipendente: A 4 kg/s, B(4/5)·3=12/5 kg/s; rapporto(12/5)/4=3/5.

Alternative e distrattori: 5/3 reciproco, 4/5 solo ρ, 3/4 solo Q, 12/5 singola uscita numerica.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `3/5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `2a3cfa4d7dff508671cf07e92e18d78103dceed7a9ef6e1f0964094e5b0f49f5`; candidato `f5fcae98211ef4b4ec623d5a1a4e81f9d32e5c01b889d98d3122b2faf6c16e58`; firma individuale `fc4e456e06f8cebb4acea83ad29cc96ec00c91a59a4dabbdc17ae1abb19add1c`.

## AR-u3-mass-flow-12

Procedimento indipendente: Media(4+12/5)/2=16/5 kg/s. Ingressi medi 9/10 kg/L e 7/2 L/s danno 63/20 kg/s, inferiore di 1/20.

Alternative e distrattori: 32/5 somma, 8/5 doppia metà, 63/20 ingressi medi, 4 solo A.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `16/5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `d34dc85e35c3e1db5bb59eaead089d04652834cc0ea1cd944f7656b6959a4919`; candidato `25622f33dc18b626cd59e959eae1337d4e47ab0fbd06623e7408e32a19b621c2`; firma individuale `84876b12ae42cc7bd16d0bc733126eb15f1c8dad92ed78e8e433d62817d2d583`.

## AR-u3-mass-flow-13

Procedimento indipendente: Target(3/5)4=12/5 kg/s; ρ_B 4/5→Q_B 3 L/s; rapporto a 4 uguale 3/4.

Alternative e distrattori: 4/3 reciproco, 3/5 fattore di massa, 4/5 fattore ρ, 3 numero Q_B, non il rapporto.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `3/4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `e2c0e7270ab644e2bd3dcefb45b9887b6df1ee7421627e42eab3a8b312d1e4fa`; candidato `1e63dbd579e31b2de12736bd2dfeb21a8bc562b55f4c9f74099b6d42e5b91166`; firma individuale `437c315037efa90233a1c3edf2f5bf1ae93afa500f8d609f8091b1fad302c8be`.

## AR-u3-mass-flow-14

Procedimento indipendente: q = 12/(4 kg/s)=3 s/kg. S 36/5→ṁ12/5 kg/s; Q 3 L/s→ρ4/5 kg/L.

Alternative e distrattori: 12/5 kg/L viene da lettura grezza 36/5 divisa per Q 3; ρ1 ignora il dato; 3/5 dà S 27/5; 5/4 non ricostruisce la lettura.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4/5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `35c12ae96083e03bed81d554e2b24e9c2f79b5663e0271c4269b702d2f85a0c0`; candidato `3f181d79cd52b8db65158e9c18701d91fb8efcd486db6bb7040ad62af1016427`; firma individuale `2a2868167bf5ae415b898653a4ee2eccd8638aee29ec5c911d1dda7fb5fada6f`.

## AR-u3-mass-flow-15

Procedimento indipendente: Δ S−16/5 e Δṁ−8/5 kg/s danno q = 2 s/kg, offset 1. S 37/5→ṁ16/5 kg/s; Q 4→ρ4/5 kg/L.

Alternative e distrattori: ρ1, 3/5, 2/5, 6/5 kg/L con Q 4 producono S 9, 29/5, 21/5, 53/5; solo 4/5 dà 37/5.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4/5`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `02f31b90c9e253a0a1361071dbb7feefaad943ccb6cabad856eea8b6cc21cbe1`; candidato `1e2ee0611ad452b8118f693a5fcad25992a8b5fd4c1802941ad18664d42c86bb`; firma individuale `32705386350c96c9417ae50a2cf6ba5a64dabdb3fb22e6c3196e6f3a96872a14`.

## AR-u3-mass-flow-16

Procedimento indipendente: ρ=c Q, c 1/4 kg·s/L² fra prove. ṁ=c Q²4 kg/s→Q²16 L²/s²; rami±4 L/s, solo +4 con ρ1 kg/L ammesso.

Alternative e distrattori: Ramo negativo rende negativa anche ρ; 16 è quadrato portata, non portata. Vincolo fra prove, non densità variabile lungo il tubo.

Ipotesi e dominio: Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `f9b7f7cf1efc809bae872add4b0dd7a12acd7f35fa329462ee6711f75fa5f58d`; candidato `3bc601ac1a0f0bf89425f17ba520a0b063af2c09502b84c410f6abff90b5e770`; firma individuale `69695449fd2ca097b12db358bf73fcfe3efe958ac7ab7dd0edb0399ad5acb799`.

## Controprove, identità e limiti

24 controprove riproducibili per questo lotto. Le 16 chiavi errate sono ricalcolate con binding e tutte le guardie di edizione rinnovate in memoria: il rifiuto deriva dall’oracolo matematico o dalla distinta prova concettuale, non dal solo hash. Sono inoltre respinti fonte falsa con guardie rinnovate, numero corretto con unità fisica errata, prova fisica falsa con chiave corretta, pacchetto vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Il rifiuto della falsa spiegazione conserva invece esplicitamente il confine della lettura individuale congelata.

Il test comune verifica assert_record_identity sui report fresh e saved usando pacchetti e binding reali: sono ammesse solo EXACT_ORACLE e AI_CONCEPTUAL. Controlla inoltre 35 configurazioni Hypothesis per ciascuna di cinque proprietà fisiche: densità convessa e stratificazione; pesata idrostatica e scala; media areale del profilo; massa trasportata; continuità entro un apparato distinta dal cambiamento di apparato. Sono 175 configurazioni complessive, senza sostituire le 80 letture individuali.

L’integratore esegue separatamente i controlli di importazione e interfaccia. Nessuna prova con studenti o approvazione umana è stata eseguita.
