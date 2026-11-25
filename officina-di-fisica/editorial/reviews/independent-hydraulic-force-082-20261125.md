# Revisione indipendente — hydraulic-force-082

Autore e reviewer distinti; candidato finale `ac70cc8`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json`. Nessun import del modulo autore. Fonte e derivazioni proprie lette prima delle candidate; eccezione di esposizione iniziale dichiarata in source.reference: primo07901 mostrato accidentalmente come intero record, inclusa chiave, poi comunque risolto dal bilancio fisico. Nessuna approvazione umana: NOT_RUN. Pubblicazione NONE, tutte DRAFT.

Edizione normalizzata `d4a97dcd0645d16ff0bb7809ae447c623f01543c26fca8cc4ed1ad8a71a6a1a7`, binding `02b7006ecc1bdf17cfa0d06ec8c999cd25b1cf8c708463c4ca3fd6fa7e579608`. Le impronte sono congelate solo dopo lettura delle edizioni finali, figure XML/rendering compresi.

## Modello e asset

Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

XML e rendering completo letti. I rettangoli di 40 × 40 e 200 × 40 px, alla scala di 40 px/cm, rappresentano aree di 1 e 5 cm². I contatti liquido-pistone sono alla stessa quota y = 820. La forza d’ingresso è lunga 40 px per 2 N; quella d’uscita 200 px per 10 N, alla scala comune di 20 px/N. I versi di ingresso e di erogazione sono opposti. Il circuito è schematico; le aree sono dichiarate nel pannello superiore. L’ultimo pannello è un altro esempio con rapporto 10: dsᵢ = 10δ occupa 200 px e dsₒ = δ occupa 20 px alla scala di 20 px/δ. Ogni freccia ha un proprio path. Non si deduce l’uguaglianza dei lavori finiti dalla sola continuità.

## AR-u3-hydraulic-force-01

Procedimento indipendente: Sovrapressionecomune p=Fi/Ai,pari quota e atmosfera comune. Fi2N/Ai1cm²20kPa;Fo=pAo=10N conAo5cm². Risultantepistonefermozero,nonFo.

Controllo alternative: Fi=Fo nonseguepressioniuguali;20Nfattoredueextra;Foècaricoequilibrabile,nonrisultantesulfermo.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `10`. Sorgente `7d158c9a509f56cd70110e3bba31f7c0fb3d8d86c4a1bfd3278de41e4e842e50`; candidato `661158cca1d7246ecb94929e94be35e1cc9766744b0734c7e56db6de28f973a7`; firma `bdd4a51afc557921274b6321eb9598eb9949cdc6d066887175352db257d9c59c`.

## AR-u3-hydraulic-force-02

Procedimento indipendente: Fo=Fi(Ao/Ai):rapportodiareepuro,unitàN. cm²si converteinm²confattore1/10000che si cancellafraaree.

Controllo alternative: Papressione,cm²area,kgmassa,Jlavoro;Nforza.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `N`. Sorgente `bda903fa8052ea1c6f3cb218bb055ebc78a6a1afd5bf361e837d8fbf23738823`; candidato `acb6dbf3248d6ee9a6bba4304f977c3c8e1df2feee83db84d9dd4286dd183704`; firma `33a42675eaa5a5276ee7fe52b7f09bc2f804153fee235f928fad79581adba4cc`.

## AR-u3-hydraulic-force-03

Procedimento indipendente: All’istantedipariquota Fo/Fi=Ao/Ai=10. Continuitàinfinitesima Aidsi=Aodso→dso=dsi/10. Lavori localiFi dsi=Fo dso allo stessoistante,non uguaglianza di dueprodottiforza-costante sucorseverticalifinite.

Controllo alternative: dso10dsi,uguale,100dsi genererebberovolume,zerononricevequelloceduto. Non confonderecontinuitàlocalecorlavorofinito inquotevariabili.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune. Gli spostamenti sono infinitesimi e positivi nell’istante di pari quota. Corse verticali finite possono cambiare le quote e l’energia potenziale del liquido.

Esito esatto: `ds_o=ds_i/10`. Sorgente `856adfc023ba6fb6598b0efe4012092dd51997e9ad07293fb8c45baa0635c6b4`; candidato `99c6085b3b419936757c4044683a9cf4e080c0adec35e122aa6afa85587ee4f4`; firma `6ce3a1f23204a3599088fecbf75cbe66733f3c8bd3260c3930aff86475d83c51`.

## AR-u3-hydraulic-force-04

Procedimento indipendente: Rapportoareefisso5:Fi2→3NproduceFo10→15N,statiequilibratidistinti.

Controllo alternative: 20raddoppioarbitrario,20/3effettoinverso,10ignoraFi,zeroconflittopressione.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `Da 10 a 15 N`. Sorgente `4455320ba1e3ca26a495f18512521fd62a46d6ac54f992492a0708d6ee4acdb5`; candidato `892744b8c7f329dabb1f511f14a49819526f477e21fef87d390468b6361fce3c`; firma `952c7b284a8b6787a8eb1d5bd4171c7481234e5725493e0138c80d1407b8feab`.

## AR-u3-hydraulic-force-05

Procedimento indipendente: Fi=FoAi/Ao=10·1/5=2N;areafisicaAi resta anche se numerouno.

Controllo alternative: 50Nmoltiplirapportoareeinverso;Fo/Ao da solo nondàFi.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `2`. Sorgente `1d3933ed27db9386cd71648d55ad065fae380a86d0872ec5299233277c576f9b`; candidato `db09ac7b3e256919a5f83ec37d9157ab9923b72aaabef7271ff35fa157c923e0`; firma `23c16448631d9d0a169e653f1a9e17281305eb46b2c3468fd72270afac65b408`.

## AR-u3-hydraulic-force-06

Procedimento indipendente: Ao=AiFo/Fi=1cm²·10/2=5cm²>Ai;nonunraggio.

Controllo alternative: 5cm²area non5cm,rapportoaree nonrapporto diraggi;formequalunque.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `5`. Sorgente `40b8e7c899ecaf53d0c092626714ebf7a04a357a1a072546cd3b4c6175e8d524`; candidato `676d462db11583232363dc748fb69a61327a6a3f5e8ad0e707689b4a72202a50`; firma `ebae64c5ed5eb88b913212489a0a1086ac9be341f9a4be0e8dbbf79b506a1a06`.

## AR-u3-hydraulic-force-07

Procedimento indipendente: StessaFi2N,stessaAi1cm²→p20kPa. Ao5→4cm²produceFo10→8N,rapporto4/5.

Controllo alternative: 5/4reciproco,2fattoreassente,1pressioneinvariante scambiata perforzainvariante,negativononmodulopositivo.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `4/5`. Sorgente `3fa0a1aebcc1442811374a02eb294cb676af3a65872e1e704732dd7e6f9dc337`; candidato `532a559bfa71091d602e12c7b5b1b40bafe7dce34fda83def147d49b2636c451`; firma `12c307b371ae9e136c406f38f8db53e7ae5f65f2957fa36f11036371c09268b5`.

## AR-u3-hydraulic-force-08

Procedimento indipendente: Proposta20−corretta10=+10N.20Nsu5cm²darebbe40kPaincompatibilecon20kPaall’ingresso.

Controllo alternative: −10ordineinvertito,20proposta,0accetta,5doppia metà.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `10`. Sorgente `e4f65c16cc66331f3b5e3b774ba8dec3abe41d6bf43ddef31394dc7195de0098`; candidato `1c95c4dcb95b8c20dbff33b35e3b63b9c136ebe1d025be3ee35eb11ebaf80e2e`; firma `9b5e746a4b22d7fceb8797ed898d9bae1df71b36a2eeb9161bfbf355b7bb7fee`.

## AR-u3-hydraulic-force-09

Procedimento indipendente: FoAi=FiAo→Fi=FoAi/Ao,rapportoareepuro;Fo/Aoèpressionenonforza.

Controllo alternative: RapportoAo/Aiinverso,soloFo/Ao unitàpressione,doppio/metànonbilanciano.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `F_i=F_o A_i/A_o`. Sorgente `868908ffa6c7aa8263237b2ffde918482768e4da2ae2a6dd4c5315fffe262c14`; candidato `83b1341f12ac57c43b266edc353bb98b4a20b180843fc65180180cb27a6af9be`; firma `2eb2f54c0500bb4ad59208769b9b6baa8a4c6f4a48b240820670781f6056dca2`.

## AR-u3-hydraulic-force-10

Procedimento indipendente: Fi scalaκ1,Aoscalaκ2,Aifissa→rapportoprodottoκ1κ2;nonquadratoextra diun’area.

Controllo alternative: Quozientiinvertono dipendenze,sommadà2perstatidentici,κ2²duplicaareacomeraggio.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `κ₁ κ₂`. Sorgente `e8e22410007460d0f356d62f513358e2f0770d0c99685050b15d713cac1c9ef0`; candidato `c71266a97c1046c5cdfaeba1b0cf50593e20fbbbe062125b4599831e82dc32e5`; firma `491b1ac81144d1f2ce07b17508213e16de503da3fab998c4bcb2e821a11df717`.

## AR-u3-hydraulic-force-11

Procedimento indipendente: A2·5=10N,B3·4=12N,rapporto12/10=6/5.

Controllo alternative: 5/6reciproco,3/2soloFi,4/5soloAo,12numeroForzaBnonrapporto.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `6/5`. Sorgente `fd306f19b38cdb682eb1a3d2ec603139662e3c2fced4b9d1e2b9e12bb8eaf1a5`; candidato `e795e32e82c0f3d6ff716979f14fc447c9e490ae94059008f66391900e44fa94`; firma `0b6e63e7a1e155e460ec8a3348e6e4a2481f9a7d55199d9ac2bd7b18307351c5`.

## AR-u3-hydraulic-force-12

Procedimento indipendente: (10+12)/2=11N. Ingressimedi5/2N e9/2cm²danno45/4N,scarto1/4N,prodottocongiunto noncommutaconmedia.

Controllo alternative: 22somma,11/2doppia metà,45/4ingressimedi,12singolaB.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `11`. Sorgente `def1e85a0a0e331df66fd03f333744749d9f599560c4a3d60820a096b1fcbc2b`; candidato `34c0cc34972e170b906f85450f1c0c19f80c7973968f3872a3d4de402ed54cf1`; firma `756645972cbf55a4288936756a8ec289201fa9c2aeff4d738e11d7be1c27158f`.

## AR-u3-hydraulic-force-13

Procedimento indipendente: Target(6/5)10=12N,FiB3N→AoB4cm²,rapporto4/5rispettoA5cm².

Controllo alternative: 5/4inverso,6/5targetforza,3/2fattoreFi,4areaincm²nonrapportoa5.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `4/5`. Sorgente `5837350f69817bd932313b03059a908c9771823c40bc6987184d23676c630c3c`; candidato `a0a1f0015e39d1ef6f3d32c9df9bc56bae500423cb56b21035e1b0e15a7e27d7`; firma `b063fce22944f67f4044317e2bcc5dcb9e29fb64c9337cefea43064377af30b4`.

## AR-u3-hydraulic-force-14

Procedimento indipendente: c30/(10N)=3N⁻¹,S36→Fo12N;Ai/Ao1/4→Fi3N.

Controllo alternative: S36comeforzadàFi9N;solo3Nricostruisce36conguadagno3.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `3`. Sorgente `8005c388e12f9a9ffe7e60fce4bf970822cab220166e8115827762505d06f1a3`; candidato `f9b11576087ae8899e3b9f65f31a0af2f59c462394d11ef2cccc15279aab0479`; firma `9f11a3a037c3d03cbb2ee34e051480007eb8cee37fcc5da2a015a3e691d831ba`.

## AR-u3-hydraulic-force-15

Procedimento indipendente: ΔS4/ΔFo2N→c2N⁻¹,d1. SC31→Fo15N,Ao5cm²→Fi3N.

Controllo alternative: Fi6,3/2,4,2NconAo5produconoS61,16,41,21;solo3dà31.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune.

Esito esatto: `3`. Sorgente `fa5063aab2dbcd85bf59938d6e03517f1198719ddca407df63feb94a25c83a11`; candidato `4cd15e303bdb69d01270f8ccfa1bf6e9d727ddd88bb21488ef7f604cd97257f3`; firma `71ac39166bff0edd56570f320ebc975e8b89862585d3facdf7ce3590c165eb89`.

## AR-u3-hydraulic-force-16

Procedimento indipendente: Fi=cAo,c2/5N/cm² tra stati→Fo=cAo²/Ai. Ao²FoAi/c25cm⁴→±5cm²;solo5area eFi2Npositive,maggioredell’ingresso.

Controllo alternative: −5area ecariconegativi;25èquadratoarea,unitàcm⁴noncm²;nessunaradiceperraggio.

Ipotesi: Circuito pieno di liquido incomprimibile e senza perdite. I pistoni ideali non hanno peso né attrito. Si confrontano stati di equilibrio nel laboratorio inerziale, con contatti alla stessa quota e medesima atmosfera esterna. Fᵢ e Fₒ sono carichi netti equilibrati e positivi; Aᵢ = 1 cm² e Aₒ > Aᵢ. L’area maggiore aumenta la forza equilibrabile, non la sovrapressione comune. Il vincolo Fᵢ = (2/5 N/cm²) Aₒ collega stati di equilibrio distinti. L’area di ogni pistone resta costante durante ciascuno stato.

Esito esatto: `5`. Sorgente `6861df989ac05e2e825151f8131d82b8b825ac7999b55e9dbff7c6fabb1c9bd1`; candidato `a03e7887ab4493a766d5e00e7073574a089439efae89c8dba9459fd630d2f20d`; firma `e3e3e665848fcee52124eaa0ab71afca4d4efec31d7c21426367caa58f11b96f`.

## Controprove e limiti

24 controprove riproducibili:16 chiavi errate con binding e tutte le guardie di edizione rinnovate in memoria,respinte dagli oracoli matematici o dalla prova concettuale separata; falsa fonte anch’essa retokenizzata; unità numerica errata; prova fisica falsa con chiave corretta respinta dalla lettura congelata; pacchetti vuoto/parziale/duplicato; byteSVG allegato e locale cambiati. Si distingue il rifiuto matematico dal solo congelamento. Test comune include35esempi Hypothesis per ciascuna di4proprietà fisiche (140 configurazioni) su stabilità/scala delle colonne,segno del manometro,integrale triangolare e Pascal/volume locale. Non certifica persone reali o approvazione umana.

## Correzione del contratto di report

Il campo verificationMode usava un valore descrittivo non ammesso dal contratto canonico. Il nuovo test assert_record_identity su tutti gli 80 risultati reali ha prodotto RED con cinque errori, uno per famiglia. Corretto esclusivamente l’enum dei record concettuali in AI_CONCEPTUAL, mantenendo invariati tutti i procedimenti, le prove fisiche e dimensionali, i risultati, le firme congelate e i byte dei candidati. Nessun risultato concettuale è stato promosso a EXACT_ORACLE. Rigenerato il report con il nuovo SHA del verificatore; il test confronta sia report fresh sia report salvato con package e binding reali.

Esito post-correzione: test comune GREEN, 6/6 in 2,481 s, comprese identità canoniche di tutti gli 80 report, 120 controprove e quattro proprietà Hypothesis. Nessuna modifica ai contratti o ai candidati.
