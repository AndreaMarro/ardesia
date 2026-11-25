# Revisione indipendente — volume-flow-091

Autore e reviewer distinti. Edizione autore finale `24dfb749c412e204d03b89bc29cdcc893f9587f6`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json`. Tutti gli 80 prompt delle cinque famiglie sono stati letti e risolti prima delle chiavi candidate; nessuna esposizione iniziale alle chiavi in questa revisione. Nessun modulo autore importato. Poi sono stati riletti singolarmente tutti i 16 record finali di questo lotto: consegne, passaggi, alternative, suggerimenti, feedback e collegamenti scientifici.

Pacchetto normalizzato `d0217236774b3acc83d7e29bf2ae4f97538b61feb6e52e19d808e46d534e7f91`; binding `2a179eee046c8a3a819fd3140dd225614e01daaf61624c069f7d462c683f1f73`. Le impronte delle singole fonti, dei candidati e delle figure sono congelate solo dopo la lettura delle edizioni finali. Competenze C2 reali controllate sulle lezioni: L004 per galleggiamento/pesata, L005 per portate e continuità. Il profilo assegnato nel 091-03 è autonomo e ora include esplicitamente A=πR²; il procedimento manuale usa la media areale esatta.

Questa è una revisione scientifica di un reviewer AI distinto. Approvazione umana NOT_RUN; stato DRAFT; publicationAction NONE. Nessuna pubblicazione, nessuna modifica del reviewer ai candidati.

## Modello e figure

Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

XML e rendering completo letti. Grafico area×lunghezza: 100 × 150 px, assi 50 px/cm² e 50 px/cm, rappresenta 2 cm²·3 cm=6 cm³ in 1 s. Non è il diametro del tubo. Il terzo pannello usa u=s²/R²: quadrato 200 × 200 px per unità pure e triangolo(0, 1)→(1, 0) di area 1/2. È il grafico contro il raggio al quadrato, non il profilo contro il raggio. Assi e frecce separati, scala e pesatura areale dichiarate.

## Edizione finale riletta

Nel record 03 è stata riletta la definizione A=πR² aggiunta autonomamente dall’autore nel commit finale indicato. La derivazione indipendente integra le corone e può essere eseguita manualmente attraverso il triangolo nel parametro u=s²/R². Non richiede trigonometria o approssimazioni decimali.

## AR-u3-volume-flow-01

Procedimento indipendente: Per un moto uniforme Δ V=A v Δ t; con v media normale vale la stessa definizione integrata. Q=Av=2·3=6 cm³/s, cioè 6 m L in 1 s.

Alternative e distrattori: 2 copia area, 3 copia velocità; prodotto 6 è volume per tempo, non area o velocità.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `6`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `69012e0526094960f4a58f3e473c2b9e22935aa3222b46bcc250a85857ff9209`; candidato `ba4f917db2c3a86c040f73c33bc8dd9ca9bb5d43d94d8e12a00cc243de2e40a8`; firma individuale `0574a7ac236baab076efa6d34a857b74e3117753b31805b7c7ed9fdbde403b76`.

## AR-u3-volume-flow-02

Procedimento indipendente: La portata volumetrica ha dimensione L³/T e unità cm³/s. La portata massica richiederebbe la densità.

Alternative e distrattori: cm/s velocità, cm²/s dimensione incompleta, cm³ volume, kg/s portata massica.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `cm³/s`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `6214a616f37fc5057e511ec9c6d2f615c99c215be177e524d18e440add505742`; candidato `95e45cddbb8343ca3c7e999a4349f23cccf01074aaa1e332591bd5c8db217838`; firma individuale `22de4461e84e7b29cbe299922e9b9428d04f8c91a532eaef8e3260177eab7047`.

## AR-u3-volume-flow-03

Procedimento indipendente: Integrale delle corone: Q=2π∫₀ᴿ v_max(1−s²/R²)s ds=πR² v_max/2. Con u=s²/R² il peso areale è uniforme; il triangolo sotto 1−u ha area 1/2. Media d’area v_max/2, senza valutazioni trigonometriche o decimali.

Alternative e distrattori: A v_max attribuisce il massimo a tutta la sezione; 2 A v_max peggiora il doppio; un quarto non è media d’area; zero vale solo alla parete.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `No: Q = A v_max / 2`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `b460d0fc4e7ab904a3a37005acf001a14cf0eb98e38c20a58bb23f5adc9deba2`; candidato `bd76772a07a796bdeca4be410ac7fa34ae1b35f0b0bce8c4e4e59f272d5a20ea`; firma individuale `b9912ce8b71aa16eef76fdf525463a89ce0d260e19854e78e52992fcabbf4927`.

## AR-u3-volume-flow-04

Procedimento indipendente: Area 2→3 cm² a v 3 cm/s dà Q 6→9 cm³/s; prove diverse, non due sezioni con Q già fissata.

Alternative e distrattori: 4 usa effetto inverso, 6 impone una Q non assegnata, 12 raddoppia anziché 3/2, zero viola positività.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `Da 6 a 9 cm³/s`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `2fdfb0ec08d6c227c7956c5be33e08526f53f35b7527e8de17ac70fee2a9d17a`; candidato `440e422deacd13e0680cc0e0a58d89c38c39c2ef04dd26af9e6e17e37eb74df9`; firma individuale `0ace19b98048e50d9f1300239be005eb86323720a9980a7b9b6e5c17206876bd`.

## AR-u3-volume-flow-05

Procedimento indipendente: A=Q/v=6/3=2 cm²; il tempo si cancella.

Alternative e distrattori: Qv ha L⁴/T²; v/Q è area inversa. Non si ricava un raggio senza forma.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `8cd80f5c78a066ba03fe2af7f4aefb750553a56df5a3e2083fa5a8c6e1f6dbf5`; candidato `d58684dee457c0104d68882a5462e958025089c669cf3da4be69b8cb3d2cd852`; firma individuale `6657253fc20396b8ccdc324d7f29ed00420d7a42eb40d48a56e509832f459107`.

## AR-u3-volume-flow-06

Procedimento indipendente: v=Q/A=6/2=3 cm/s è media normale, non massimo locale.

Alternative e distrattori: QA non velocità, A/Q tempo per lunghezza. Massimo 6 cm/s solo con profilo parabolico aggiuntivo.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `c9a54a7dafacb084a413821248adb89c62b337f7b7149c0022c9e7e57ecd144c`; candidato `3e66d4d58c75c22e9635b8c7a5b2a45d03ac6c8cca51bcbcf92888af20d49611`; firma individuale `5726a719b2392cc7bf4cbf1587e5ef81f71c2939e3e6bad5ec1c592d7fc15ba6`.

## AR-u3-volume-flow-07

Procedimento indipendente: A 2 cm², velocità 3→4 cm/s: Q 6→8 cm³/s, rapporto 4/3.

Alternative e distrattori: 3/4 reciproco, 2 raddoppio falso, 1/3 incremento relativo, 1 invarianza falsa.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `4/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `b09e2b227fdbb13e1ef897ef59de3c8951deabbe56ac134045b3e654581813e0`; candidato `898b0ffb29852a3945e4740e053fca23ae721196d2f6c57a82b0c0e8d181b74f`; firma individuale `3b5c9b9259f089bbdb6ae3cd9f5ca64bb7da1f8893185401954ae2e1a32926a1`.

## AR-u3-volume-flow-08

Procedimento indipendente: Proposta 12 meno corretto 6=+6 cm³/s. v è già media, non serve un altro fattore di profilo.

Alternative e distrattori: −6 ordine invertito, 12 proposta, 0 accetta, 3 doppia metà.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `6`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `bf8adc4adc8d1a58c65ea733bba20bfdf7b040c2b8ac9c0a19db19e846c64bf4`; candidato `0277a4270b1fb9229efa3ca3c82621460b43e3f79cf1878b9fbc91d334164686`; firma individuale `8945a57ae7428a2cffb60b6308b5b4a5052713ec7a53b8b33eb0bfd66512764d`.

## AR-u3-volume-flow-09

Procedimento indipendente: Dividere Q=Av per v>0 dà A=Q/v, unità di area.

Alternative e distrattori: Prodotto e reciproco sbagliano unità; doppio/metà applicano una correzione a v già media.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `A = Q / v`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `bc0c6beda0b9580f7d2f1ae32c323d380409795a20cf0c140c3ec67124a7e6a6`; candidato `1095a4f5b3a9397ae22596d4a4b3f3b06b566a0a703810d0c30be593cc93a869`; firma individuale `56830ee1dc93a7c1c7351413b1c0409eeb92a11040d9e963a19a92087b13ac4c`.

## AR-u3-volume-flow-10

Procedimento indipendente: Area scala κ₁ e media scala κ₂: Q scala κ₁ κ₂, senza quadrato aggiuntivo dell’area.

Alternative e distrattori: Quozienti invertono dipendenze, κ₁² duplica area, somma dà 2 per prove identiche.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `κ₁ κ₂`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `7a848fbd4e0a8059c10172a96dc7d2e6858cf5a92f32f5bec4ad2d885ae5347b`; candidato `7fc6074dd50a7317fd55d01bfabb2725a77bb881259c86e977f4279efdd325b9`; firma individuale `c92aaed06c74538af6c6163d39510011b706e5f49760324e4e87b1cda4b4d23f`.

## AR-u3-volume-flow-11

Procedimento indipendente: A 6 e B 12 cm³/s: rapporto 2=(3/2)(4/3).

Alternative e distrattori: 1/2 reciproco, 3/2 solo area, 4/3 solo velocità, 12 uscita B non rapporto.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `f0a472fdd74edf44433af7eeb25f2bb19bb9d5adfd57d9f9e40cb9031f440f6f`; candidato `a7720332491936b44a2db9e63f9f7b419e0cd093e13722be8d192280e7425137`; firma individuale `353a8ba4cf4bdc69d441a7e334215ebcc88bef4dd36e6540787a3f092c1ac94a`.

## AR-u3-volume-flow-12

Procedimento indipendente: Media(6+12)/2=9 cm³/s. Ingressi medi 5/2 cm² e 7/2 cm/s danno 35/4, inferiore di 1/4.

Alternative e distrattori: 18 somma, 9/2 doppia metà, 35/4 ingressi medi, 6 solo A.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `9`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `c9997c81355553c5feddfba8fd4e1a284c484c8aac47ba99dddeecbca65efcf2`; candidato `9b4f379582ba2791aec0dd5940c9254f377ae734829ef14e1929ba2f0f23fe34`; firma individuale `fa846fd7d05a847c709161824096b36ac0319fde2e664342c8c7aaf0bf6eebdb`.

## AR-u3-volume-flow-13

Procedimento indipendente: Target 12 cm³/s, A_B 3 cm²→v_B 4 cm/s, rapporto 4/3 rispetto a 3.

Alternative e distrattori: Raddoppiare v insieme ad area 3/2 triplica Q; 4 è numero velocità, 3/4 reciproco, 3/2 non realizza target.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `4/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `c94e86ec7cb61e7768ce304c8dae43a5f5215c49a62315e6b5d78f0be57d6fc8`; candidato `34e13c6479c06a2396765d1dd2db4f7b71abad2b8ae3b59189c06b150e70d275`; firma individuale `9b7d0bfa944a502b40aeed88414b9e56c8c884d7d232a8f59c189706b87ff850`.

## AR-u3-volume-flow-14

Procedimento indipendente: q = 18/(6 cm³/s)=3 s/cm³. S 36→Q 12 cm³/s, v 4→A 3 cm².

Alternative e distrattori: S 36 come Q darebbe A 9 cm²; solo A 3 ricostruisce S 36 con q 3.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `a418b4fbdf5d22c75fe6a85cd29dbf70a30e19d39d625fc7cfe54785b6665ae3`; candidato `6939d167b6ca00c8f8715f08600d8134bb49cebac244e84c56133bebc3accef6`; firma individuale `683907ba4bbdd774e41b7a6e0766b20095c47c502ceb35512b2580556a43a68e`.

## AR-u3-volume-flow-15

Procedimento indipendente: Δ S 12/Δ Q 6 cm³/s→q = 2 s/cm³, offset 1. S 19→Q 9, v 3→A 3 cm².

Alternative e distrattori: Aree 2, 4, 1, 6 cm² a v 3 danno S 13, 25, 7, 37; solo 3 dà 19.

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `44c5d50ea0f270717abef3b3361b0f838c27c2f5e4b624deadf19f5ce1d01abf`; candidato `e84c06b3336d68cae8014f4ac3488e95b079da22cd00d8324b546148965779b5`; firma individuale `93756db4164e17b6d9c330f3951cc710567ff5ba6a97f480ac50107e4be6d730`.

## AR-u3-volume-flow-16

Procedimento indipendente: A=cv, c 2/3 cm·s tra apparati: Q=cv²6→v²9 cm²/s². Rami±3 cm/s; solo positivo ammesso, con A 2 cm².

Alternative e distrattori: Radice negativa implica v e A negative; 9 è quadrato velocità, non velocità. Il vincolo non è A(t).

Ipotesi e dominio: Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una prova fisica specifica e non sono promosse a oracoli numerici.

Fonte `14fa0324f6d261ffa8895101ad6ffd96d0dcc7b31ef9124ea4eff94c5bf0d1cf`; candidato `bc4d8992eb132490f76664180ad98b981c5631fac7b0ab8517cee7f58e06e3a9`; firma individuale `f92c71b8b5cd0fccce0ac13434854c594dd5e48da8f99eeb78fa08acf7ce2299`.

## Controprove, identità e limiti

24 controprove riproducibili per questo lotto. Le 16 chiavi errate sono ricalcolate con binding e tutte le guardie di edizione rinnovate in memoria: il rifiuto deriva dall’oracolo matematico o dalla distinta prova concettuale, non dal solo hash. Sono inoltre respinti fonte falsa con guardie rinnovate, numero corretto con unità fisica errata, prova fisica falsa con chiave corretta, pacchetto vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Il rifiuto della falsa spiegazione conserva invece esplicitamente il confine della lettura individuale congelata.

Il test comune verifica assert_record_identity sui report fresh e saved usando pacchetti e binding reali: sono ammesse solo EXACT_ORACLE e AI_CONCEPTUAL. Controlla inoltre 35 configurazioni Hypothesis per ciascuna di cinque proprietà fisiche: densità convessa e stratificazione; pesata idrostatica e scala; media areale del profilo; massa trasportata; continuità entro un apparato distinta dal cambiamento di apparato. Sono 175 configurazioni complessive, senza sostituire le 80 letture individuali.

L’integratore esegue separatamente i controlli di importazione e interfaccia. Nessuna prova con studenti o approvazione umana è stata eseguita.
