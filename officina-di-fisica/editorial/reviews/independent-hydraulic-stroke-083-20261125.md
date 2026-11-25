# Revisione indipendente — hydraulic-stroke-083

Autore e reviewer distinti; candidato finale `85d93ec`. Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json`. Nessun import del modulo autore. Fonte e derivazioni proprie lette prima delle candidate; eccezione di esposizione iniziale dichiarata in source.reference: primo07901 mostrato accidentalmente come intero record, inclusa chiave, poi comunque risolto dal bilancio fisico. Nessuna approvazione umana: NOT_RUN. Pubblicazione NONE, tutte DRAFT.

Edizione normalizzata `68e212f3521a5ff681741c94ec457c62da2c37c697869054735d08be8f0ba501`, binding `29e73b3b5fee7c3c522358ebf505ce2746a2a3e5b9b0721f072d7db42f3a3d53`. Le impronte sono congelate solo dopo lettura delle edizioni finali, figure XML/rendering compresi.

## Modello e asset

Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

XML e rendering completo letti. I grafici area × corsa hanno scala orizzontale 10 px/cm² e verticale 20 px/cm. Il rettangolo d’ingresso di 20 × 200 px rappresenta 2 cm² × 10 cm; quello d’uscita di 200 × 20 px rappresenta 20 cm² × 1 cm. Entrambi hanno area grafica 4000 px² e rappresentano 20 cm³. Le barre del volume sono entrambe lunghe 200 px alla scala di 10 px/cm³. Nel pannello delle quote, il livello iniziale è y = 1250; quello finale d’ingresso y = 1450, dopo una discesa di 10 cm, e quello d’uscita y = 1230, dopo una salita di 1 cm. Il dislivello finale è quindi 220 px / (20 px/cm) = 11 cm. Ogni freccia ha un proprio path. Non viene affermata un’uguaglianza dei lavori finiti.

## AR-u3-hydraulic-stroke-01

Procedimento indipendente: VolumeuscitaAo do=20cm²·1cm=20cm³. Areaingresso2cm²→di20/2=10cm. Nessunbisognodipressione ocarico.

Controllo alternative: di1cmcederebbe2cm³non20;corseugualisoloseareeuguali. Continuitànondetermina lavoro.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `10`. Sorgente `fb6136573f6429678b6d6fdefe58116f87a63c17f3b02529d11ea3d827fcd9ef`; candidato `4c7fe1d2a5e2908328f094d7beb3e97386b37bc4ad40ecaa215f6886638ac636`; firma `f7f6bf7e55c5b4bb5af006cc455da5f4f7b6a429c3d36194de683a0bec8d49fb`.

## AR-u3-hydraulic-stroke-02

Procedimento indipendente: Volume/area=L³/L²=L. cm³/cm²=cm;distanza diversa daarea/volume/pressioneforza.

Controllo alternative: cm²area,cm³volume,Papressione,Nforza;solocmlunghezza.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `cm`. Sorgente `3bab67644704721d7760501df831d5d430f010cb0ef2ef2eb406c420a0f7c8bb`; candidato `330b0c9e84fb8a0c0038efa6750b382b5fe479d25f9f77b0f996d990e6a6aaf0`; firma `5c8c85966bedcfff4ebf55df299a63c9cb86f1a80bba920a2c89b18b36f36a64`.

## AR-u3-hydraulic-stroke-03

Procedimento indipendente: Integrandoareecostantisullecorsefinite:Ai di=Ao do→di=Ao do/Ai. Valido conrigidità,assenzaaccumuli/perdite egas,entrocorse disponibili.

Controllo alternative: Rapportoinversovolumeingressotroppopiccolo;2e1/2violanouguaglianza;Ao/Aisenzacorsaèpuro.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `d_i=A_o d_o/A_i`. Sorgente `1f0d62a9c84926c6ab2d489799c9522c869538b01f0d8887a754e97bec94009d`; candidato `7462c7a129bd9139f69139488a779df17089ba6196830806214527802f79e158`; firma `917fbee84bb47d73d4cefc60987f0a6a5a1daa6fc22397aced6440489ad5da6f`.

## AR-u3-hydraulic-stroke-04

Procedimento indipendente: Volumeuscitafisso20cm³. Ai2→4cm²→di10→5cm,inversamentel’area.

Controllo alternative: 20effettodirettoinveceinverso,10ignoracambio,5/2dimezzaduevolte,zeronontrasferiscevolume.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `Da 10 a 5 cm`. Sorgente `688658d0f6e3db39e5ac9b0a7474693fb8de838c77301c56a989456cfafebed6`; candidato `fc37c96cae6fed89d6c4915f49126519a9fa4a4b4f2b289fa32e566fbf0bcaf6`; firma `fb83c2e69c74fadba1fdb88f6168b5ca845ae2dcc981df420ce640997534fdc5`.

## AR-u3-hydraulic-stroke-05

Procedimento indipendente: Ai=Ao do/di=20cm³/10cm=2cm²,nessunaradice inun’area giàincognitalineare.

Controllo alternative: do/dièpuro,mancaAo;nessunraggiosenzaformaaspecificata.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `2`. Sorgente `24f8211373f9129912a8be85864aca0f18edc5d9f7c93c348c7f2d341cb041f3`; candidato `a4a3f96cf7032a4e9e0307bc8264d5b0ae0e3f3b1acdd854d7db0f44763f13f4`; firma `7c43d5e15d7c3c949cf0ab35fe557ecf57952c9fa5037e90af85cf12101a41ad`.

## AR-u3-hydraulic-stroke-06

Procedimento indipendente: IngressoAi di2·10=20cm³;do=20cm³/20cm²=1cm. Forzedisollevamentononassegnate.

Controllo alternative: do10cmrichiede200cm³;1/10inverteunasecondavolta,datovero1cm.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `1`. Sorgente `97eceda69200c6ab114b8fc7ea305643ee6021e2612c1b63497abc5dfbcdf26d`; candidato `8be927dd04e58f03289eb6d64f04005e7cfe8dfd2f336694b1661d64eb6ce8d0`; firma `2fb7885e335497b08edf887e0d185efa9bd5341a273fd40f60916e2bce1a5a93`.

## AR-u3-hydraulic-stroke-07

Procedimento indipendente: Aido2cm,raddoppiavolume20→40cm³ aAifissa2cm²;di10→20cm,rapporto2.

Controllo alternative: 1/2reciproco,4quadratoassente,1ignora,−2nonmodulopositivo.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `2`. Sorgente `193329d94278125b7ffb7e78a2a74c7de13e305578284c073c33357765ca69b2`; candidato `0d814c62c8f2f988724e7032b33eb8ace1def7a728a32a09a368bce35cc944da`; firma `e91b8f0ea65c08fc94f2d2dfba586527a0bde09ed131190cc85de429fe0d3411`.

## AR-u3-hydraulic-stroke-08

Procedimento indipendente: Proposta20cm−corretta10cm=+10cm;volumeeccedente20cm³nonhaaccumulo previstonelcircuito.

Controllo alternative: −10ordineinvertito,20proposta,0accetta,5doppia metà.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `10`. Sorgente `280c57453f2a9b263bbfea7a1be0535c24e6eafba00468c9f109dda363b738ef`; candidato `0b3c3624bac81a90e1b63451f0fbe73b0a49ae358fcf90336191518106cad3b6`; firma `0ddb2890313f4845f3c2cf9992359aa60433d8e2b71c82a41561497c4be5445b`.

## AR-u3-hydraulic-stroke-09

Procedimento indipendente: Dividerecontinuitàperdi>0→Ai=Ao do/di. Numerovolume20nonpuòsostituireunitàareaAo20cm².

Controllo alternative: Ao di/doinverterapporto,do/disoloèpuro,2e1/2alteranovolume.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `A_i=A_o d_o/d_i`. Sorgente `72037d8a14221dd5644ef2a6e2d531f1c1a165d788ffdaf7504a04c615a73aa5`; candidato `947537cffe7d76b94c5a56ebb77c004224e7b14d47f78c9182ddc528215e13c7`; firma `ec98e420d387069b06e2e056ab38d9c8533b8b1c72dc4eedf146673540eb640e`.

## AR-u3-hydraulic-stroke-10

Procedimento indipendente: Aoscostante,diB=Aοκ2doA/(κ1AiA);rapportoκ2/κ1. I fattoripositive ecorseammesse.

Controllo alternative: Prodottoareaeffettodiretto,κ1/κ2inversione,κ2²quadratoassente,somma2peridentici.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `κ₂ / κ₁`. Sorgente `7460e4bdf12725c1071cd1bed3d8b8dde23abb32b1cbc594f67ebf73df02ec78`; candidato `3fdac2be4a09d8b37af4fc216175c099bfdaae5aeb8f9da2d6461ce6871cefc1`; firma `1428b37e3a9dfabce3f00975eb7cf1da1dc215c6fd96b2981adaeaf03c90f0ca`.

## AR-u3-hydraulic-stroke-11

Procedimento indipendente: Adi20/2=10cm;Bdi20·3/4=15cm;rapporto15/10=3/2.

Controllo alternative: 2/3reciproco,3solodo,1/2soloAi,15numerocorsaBnonrapporto.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `3/2`. Sorgente `8d4186e03bac0aeba8edecd6767425710a9220782451cb2c81f1d32741c4d5bf`; candidato `972457415ffa6b0c873d47bbe04607d685633728606b846340d34ff9a5268425`; firma `f0effaae9c9921175beb95e6fbb1ca4818fe521221ba3583ef036148b6215c33`.

## AR-u3-hydraulic-stroke-12

Procedimento indipendente: (10+15)/2=25/2cm. IngressimediAi3cm²,do2cm→40/3cm;differenza40/3−25/2=5/6cm.

Controllo alternative: 25somma,25/4doppia metà,40/3ingressimedi,5differenza.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `25/2`. Sorgente `b031eaebd314ea52aada5348e092e6d3ee407ecad2a86bf0796cb5f7f043e383`; candidato `01d928a49ef6c26d2074ec908e4f1c0d561d418824b4a960b782e92be6f0a2d6`; firma `39c81df1fbd9bb488c4f0ec77726c72b67cff3409f782123e25564553afa9d89`.

## AR-u3-hydraulic-stroke-13

Procedimento indipendente: TargetdiB15cm,AiB4cm²→volume60cm³;Ao20cm²→doB3cm,rapportoa1cm=3.

Controllo alternative: Fattore3/2solo do noncompensaAisecondadoppia;3ricostruiscevolumerichiesto60cm³.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `3`. Sorgente `09352050c02bd917be6329670b78bd504a3a2efc5196dc9918128ce614acb332`; candidato `227f14b4f94d4d5464ef4fe50eb611ab008331a493e94d3b36a6c7ecc124bd7d`; firma `d4392752754a56a0639e9281162f6ee390d917df2c5badcc78f3c284593ca9fb`.

## AR-u3-hydraulic-stroke-14

Procedimento indipendente: c30/(10cm)=3cm⁻¹;S45→di15cm;volumeuscita20·3=60cm³→Ai60/15=4cm².

Controllo alternative: S45comecm→Ai4/3cm²;corretto4cm²·15cm=60cm³.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `4`. Sorgente `f44549c2d8658791a621ab0502ab3f608b1ca18d9f7c56a56301eb2dad65266d`; candidato `c40847b0ad76b4dae5a3217e46e31bae0f5f1a80ef5978807b4cd19db19dde35`; firma `bfb0d792c50d909f797497bdc3d78be628cc29e34a6bf7ba9b5030d35656a00f`.

## AR-u3-hydraulic-stroke-15

Procedimento indipendente: ΔS10/Δdi5cm→c2cm⁻¹,d1. C(11−1)/2=5cm;volume20cm³→Ai4cm².

Controllo alternative: Ai2,3,5,8cm²con do1dannoS21,43/3,9,6;solo4dà11.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare.

Esito esatto: `4`. Sorgente `ba0786c342905b1f0316aeaa4f657b1e6c80916b787bfc19e22e20c1f2a6be33`; candidato `3a3f46a4dbe029c39e95ea9aa597a61f055b1590a17e0ef85d51ac0c68bd2bfa`; firma `ff6e8d4e470672560bdc036c3793d83069c7687c047e95ed260ab91535c26c0d`.

## AR-u3-hydraulic-stroke-16

Procedimento indipendente: Ai=c do,c2cm:di=Ao do/(c do)=Ao/c=10cm perognido>0ammesso. Infinitecoppiecontinue: (2cm²,1cm),(4cm²,2cm);zeroescluso,coeffcientelunghezza.

Controllo alternative: Unica/due finite ignoranoscalacontinua;nessuna contraddiceesempi;coppi nullaesclusadadominio. Finitaampiezza dicorsa puòlasciareintervallopositivocontinuoinfinito.

Ipotesi: Circuito rigido completamente pieno di liquido incomprimibile. Non vi sono perdite, gas intrappolato o deformazioni che accumulino volume. Le aree dei pistoni sono costanti: Aₒ = 20 cm² e Aᵢ > 0. Le corse finite sono positive ed entro gli spazi disponibili: l’ingresso avanza verso il liquido e l’uscita si solleva. Tutto il volume ceduto dall’ingresso viene ricevuto dall’uscita. Pressioni e carichi non sono assegnati; le quote possono cambiare. Il vincolo Aᵢ = (2 cm) dₒ collega apparati distinti: non descrive un’area variabile durante la corsa del medesimo pistone. Si ammettono intervalli positivi di corse disponibili.

Esito esatto: `Infinite`. Sorgente `dd3de2558fe218106f8ccad9ab5f69b047577828310f12931a7488d1044ddb84`; candidato `0de1a5ddf7e7de84eab4afd2799f807edbb4513cdc261bbab22bd4f7e2535339`; firma `8b82630a3b35a31e13ca7c8f9ff930bd89fa15f14997665aaa42c3c866cb0f36`.

## Controprove e limiti

24 controprove riproducibili:16 chiavi errate con binding e tutte le guardie di edizione rinnovate in memoria,respinte dagli oracoli matematici o dalla prova concettuale separata; falsa fonte anch’essa retokenizzata; unità numerica errata; prova fisica falsa con chiave corretta respinta dalla lettura congelata; pacchetti vuoto/parziale/duplicato; byteSVG allegato e locale cambiati. Si distingue il rifiuto matematico dal solo congelamento. Test comune include35esempi Hypothesis per ciascuna di4proprietà fisiche (140 configurazioni) su stabilità/scala delle colonne,segno del manometro,integrale triangolare e Pascal/volume locale. Non certifica persone reali o approvazione umana.

## Correzione del contratto di report

Il campo verificationMode usava un valore descrittivo non ammesso dal contratto canonico. Il nuovo test assert_record_identity su tutti gli 80 risultati reali ha prodotto RED con cinque errori, uno per famiglia. Corretto esclusivamente l’enum dei record concettuali in AI_CONCEPTUAL, mantenendo invariati tutti i procedimenti, le prove fisiche e dimensionali, i risultati, le firme congelate e i byte dei candidati. Nessun risultato concettuale è stato promosso a EXACT_ORACLE. Rigenerato il report con il nuovo SHA del verificatore; il test confronta sia report fresh sia report salvato con package e binding reali.

Esito post-correzione: test comune GREEN, 6/6 in 2,481 s, comprese identità canoniche di tutti gli 80 report, 120 controprove e quattro proprietà Hypothesis. Nessuna modifica ai contratti o ai candidati.
