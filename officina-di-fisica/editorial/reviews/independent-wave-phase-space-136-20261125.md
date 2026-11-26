# Revisione indipendente — wave-phase-space-136

Revisore distinto dall’autore. Tutti gli 80 prompt originali B135–139 di U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Le derivazioni per ID sono state salvate prima di aprire qualsiasi pacchetto B; nessuna chiave originale consultata. Gli handoff contenevano soltanto SHA, file e ipotesi generali, senza risultati numerici o chiavi. Il revisore ha scritto altre famiglie A130–134 e conosce le leggi dell’oscillatore da quel lavoro: non rivendica ignoranza della fisica, ma separazione dell’autoria e derivazione prima della lettura di queste candidate. Nessun modulo autore importato e nessun candidato modificato.

Successivamente letti tutti i 16 record del lotto: ogni consegna, opzione, blocco, formula, hint, feedback, didascalia e metadato. Cinque SVG controllati in XML e rendering nativo completo. Mapping al vero corso C5: competenze C5-L01/L02/L04 e prerequisiti esistenti; lezioni C5-L01/L02/L03/L04/L05 e C1-L003/L005/L006/L008 rilette durante il lavoro U4. I trasferimenti C1 nelle schede energetiche sono espliciti.

Edizione finale riletta: b0631eac235f0e61d325503f2570baa8c5b6a5c1. Package SHA256 e885ffae22e0d2f35efcbb9202552f4e5f61596c0e29baf7c53b0f29f1fce1df; binding SHA256 11e78d07b5124633b0074e70f31fac845b56e53135388da7d219770dd964aaf0. Modello SymPy separato dal calcolo autore, unità esatte con Pint e Fraction, risposte interpretate con AST aritmetico limitato e senza eval o sympify del testo candidato. Le sole enum usate sono EXACT_ORACLE e AI_CONCEPTUAL. I casi qualitativi conservano una prova fisica specifica anche quando non richiedono un calcolo numerico autonomo.

Ipotesi generali: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Figura: XML e rendering completo letti. Profilo coseno illustrativo con creste a 80/400 px, λ320 px=4 m a 80 px/m; punto 160 px a un metro è al passaggio per lo zero, fase 1/4 giro. Segmenti 80/320 px danno rapporto 1/4. Grafico ν contro Δs da(80, 1330) a(560, 1090): 80 px/m e 160 px/giro, punti(1, 1/4), (4, 1), (6, 3/2); nessuna riduzione modulo uno.

## AR-u4-wave-phase-space-01

Δs=1 m, λ=4 m dà ν=1/4 giri e |Δφ|=π/2 rad.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 1/2 richiede 2 m; 4 inverte il rapporto; 1 giro richiede 4 m; 2π è conversione angolare non valore di ν.

Esito AI: PASS_AI. Risultato esatto: 1/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e1a66aa5bc4bfa392e5f5dd0469680d473771a75837e791823b53c513f8245e1; candidato SHA256 026053f63e0b0198364b33cc21e35de018e3d3ccc42c6837ff7cc152ae50f0a2; firma di lettura 45314f4d2f02d301bd1ca6b4bea3e3f89b2aebf9798483934905ff50b4fb4d0f.

## AR-u4-wave-phase-space-02

fase in giri è adimensionale, ricavata come rapporto di lunghezze; il radiante è pure un’etichetta adimensionale ma il valore numerico cambia per 2π.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: m, s, Hz, m/s sono dimensioni spaziali o temporali diverse dal rapporto puro. Un giro vale 2π radianti e può essere frazionario.

Esito AI: PASS_AI. Risultato esatto: numero puro (giri). Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 3922455e27cf5756c99d6acfb5bc160ee81bbff709502ce315f77831144d6ad7; candidato SHA256 b0c0c124b0d568ac3156fc02eb4310e9fbaf2c00c841185fc1e4af79c2b8d08e; firma di lettura b48cba9de2d3c48257dedc9ffa83224da66e535b413b1c6014e7eaad3ff3ab4d.

## AR-u4-wave-phase-space-03

ν=Δs/λ, non 2πΔs/λ quando l’uscita è in giri.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 2πΔs/λ è fase in radianti; reciproco inverte; prodotto è area e differenza lunghezza.

Esito AI: PASS_AI. Risultato esatto: ν = Δs / λ. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 41be0787ebfc315ba776925ac1712ecdb31609cb3ed02af64594cba781b42e54; candidato SHA256 62701039fe182c39458c543c77fc36769e5b0ac29f3212df06120e556d4acb64; firma di lettura f3abea29ee8a5657f5e242c6060b664ca7f718a954646a8ec480b64070edb9b6.

## AR-u4-wave-phase-space-04

Δs=6 a λ=4 dà ν=3/2 giri, non 1/2 dopo una riduzione non richiesta; da 1/4 è fattore 6.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 1/2 perde il giro intero; 1/24 inverte dipendenza; 6 copia metri e invariata ignora distanza nuova.

Esito AI: PASS_AI. Risultato esatto: Da 1/4 a 3/2 giri. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3c895094339dca18e9e10f30525afd0b6a5fe6d2f4c4702d3dc2c78591558fe1; candidato SHA256 2c1b19bb9a5f587b30bf3ed8ab706c04173a6d48d323c65d00519f47292e9b7b; firma di lettura 9f406393a0b9ef4c6ce18eb93f90859ac157a85521241489d4af58da42cd6972.

## AR-u4-wave-phase-space-05

Δs=νλ=(1/4)·4=1 m.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: λ/ν=16 m inverte l’operazione. Con fase non ridotta nota non si aggiungono multipli arbitrari di λ.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3f9f6d50ad4cd3fe8b00ddc7487d8423da441e6a10aed85b640b094df536e3fc; candidato SHA256 0abcbfde5259211142431e3975e1240e3ad62a3d32cea83534343c99f9ddf36a; firma di lettura 63135e0bebfae99ab80f730e888833d4933919c2aeff849d09d261f69b4dc008.

## AR-u4-wave-phase-space-06

λ=Δs/ν=1/(1/4)=4 m.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 1/4 m moltiplica anziché dividere; λ non è l’ampiezza trasversale.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f306c42ded9ba36cd7a9cb8685246c6d7c90d3cfd318bf27474778fd57c4cf28; candidato SHA256 91dd058334134362defd08e8e16143861dde21009a452acfa79a91a501de7fd0; firma di lettura 8c45ec2b0cc58e19a88634b70b4e54c0f0f9b7022337535a99acc5595aefd646.

## AR-u4-wave-phase-space-07

λ=1 a Δs=1 dà ν_B=1, rapporto con 1/4 uguale a 4.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 1/4 segue λ direttamente; 1 ignora variazione; 2 radice indebita; 16 quadrato indebito.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5c0bc12a0cd97f99ba2b2deb070cae4770e10e3747096146c977c25726338398; candidato SHA256 b976eb66e77ee017350799ad27ed30817361b3d658f603fc4aca1fcd86c97951; firma di lettura 2fd161e820fdc69703a4eb5d24628bea8e0aa6f359e93087f6a17d8015275e0c.

## AR-u4-wave-phase-space-08

e=1/2−1/4=+1/4 giri.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: −1/4 ordine inverso; 1/2 proposta; 0 accetta; 3/4 somma.

Esito AI: PASS_AI. Risultato esatto: 1/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 b4b6effbf0a2bc146981f383a14c12f9cd22f41deaf525155b4bee4e3cd88317; candidato SHA256 2d5a14b2f4cd50e66d78f93e348913d4f3b9b5aec13af1c9097eb420b5d5e687; firma di lettura f541b2d4d8e7ba514f41d040a4f360b1a59dd9b440a4b4dcee13629d5b8cdab0.

## AR-u4-wave-phase-space-09

Δs=νλ; se dato |Δφ| in radianti, Δs=|Δφ|λ/(2π).

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: λ/ν non isola Δs; ν/λ lunghezza inversa; νλ² area; 2πνλ riconverte indebitamente i giri.

Esito AI: PASS_AI. Risultato esatto: Δs = ν λ. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 0c8bad78d55095a27e73ac1fef1705819264f28cffa0d0a2c9a61250b0d4a5ee; candidato SHA256 4a7e3bfc3d96b9885801f794a9d493b17fa82b2be3c184d4523de6dc380452d8; firma di lettura 6b85eb8ed3e4fca0dded78565a521861981355e370a560d1a64561b7d4387609.

## AR-u4-wave-phase-space-10

rapporto ν_B/ν_A=κ₁/κ₂.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: Prodotto rende λ diretta; rapporto inverso scambia stati; quadrato aggiunto; somma due per stati identici.

Esito AI: PASS_AI. Risultato esatto: κ₁ / κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 f3ef90254d23ed9fe1e806f195497d3fad56e1c5b30ee28e555d6d09e8789e93; candidato SHA256 01f5a8d587770cb1c6624607337f0fe9aa9873aae24348d7ec4c8b7f425c7011; firma di lettura d673fb1a68c18200b2642a1d2a11a370255b939e06843bba236a3f31f1db341f.

## AR-u4-wave-phase-space-11

Δs_B=3, λ_B=6 dà ν_B=1/2, rapporto 2.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 3 solo separazione, 3/2 solo λ; 1/2 è sia ν_B sia reciproco del rapporto; 6 copia λ_B numerica.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3284c1c1ef774bc71a573f168ae63b1e79e8d64d8b839c649f8bf856418198cb; candidato SHA256 9ed6398a4dbc9fa1c378e2120e83e8f2b6127b4cce8bee1a1ff35dbeb807885a; firma di lettura 1e1ea7021e5d0d772ae2ea779c5be6ffc1b6a75984e44d4cc2665020e6ece131.

## AR-u4-wave-phase-space-12

media (1/4+1/2)/2=3/8 giri; ingressi medi Δs=2, λ=5 danno 2/5, maggiore per 1/40.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 3/4 somma; 3/16 doppia metà; 1/4 sola A; 2/5 modello agli ingressi medi con differenza 1/40.

Esito AI: PASS_AI. Risultato esatto: 3/8. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 6fc1196ecc4e620f8bd327568868499fd31ba6c294ab9afc734e76b4921a4776; candidato SHA256 9974a1bbedfc700bd0a9e9137efa826f8b3f879bb756db6b68e164f6845a9b70; firma di lettura 00bd9a1aaa01d69f91e87e70305512ffa138250df5dfb7112d0f135e1a4e5696.

## AR-u4-wave-phase-space-13

target ν_B=1/2 a Δs_B=3 impone λ_B=6 m, rapporto 6/4=3/2.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: 2/3 reciproco, 2 target, 3 solo separazione, 1/2 ignora nuova separazione.

Esito AI: PASS_AI. Risultato esatto: 3/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 58ad8102e49bdd326e0acb44c65634513752b50cd079b1eaa5c490628472ddb8; candidato SHA256 279b1670a7c9ddeccae758dfdac7dd07f1e0edd50fed830dea0b6022dfdc0b91; firma di lettura 1578901f823014141b3eb1ab785a58f10595f6cee998f132acac7dbde1476e39.

## AR-u4-wave-phase-space-14

gain (3/4)/(1/4)=3; S_B=3/2 dà ν_B=1/2. λ_B=6 porta Δs_B=3 m.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: S 3/2 interpretato come ν dà 9 m; gain 3 è da rimuovere prima di moltiplicare per λ6 m.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ae41acb97f35ab2e947aa40880d75816e1a85b46e8c41e0327036920790d900d; candidato SHA256 33ca20dc123a65008f9d9e6213a394f16b34e98f9dffd050c18d748123409925; firma di lettura 6f07a25440e9ff670548813479c377d63bb4b08976dc6015fd630478f380f1b6.

## AR-u4-wave-phase-space-15

gain (2−3/2)/(1/2−1/4)=2, offset 1. S_C=3 dà ν_C=1; λ_C=2 m porta Δs_C=2 m.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: A λ2 m, separazioni 1, 3, 4, 6 danno S 2, 4, 5, 7. La misura ν_C 1 non va cancellata modulo un giro.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 36935ef08cb965223173946d0ad1682c1a44e3854e116973ce5c71db1293eb99; candidato SHA256 8e4a7de228a0b77650f3f9abdc47b61545bed9cd58433453d708659bccefc4a3; firma di lettura e96558d949beef6630bc5c4c1813ca9d37303084932989fab44ead2443301940.

## AR-u4-wave-phase-space-16

Δs=λ/4 rende ν=1/4 per ogni λ>0. La misura è ridondante, infinite coppie positive; non periodicità modulo né scelta di un intero.

Ipotesi applicate: Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.

Alternative e feedback: Infinite scale positive soddisfano Δs=λ/4. Le opzioni una o due coppie contano soltanto esempi; l’opzione nessuna coppia è contraddetta da ogni esempio positivo, e la coppia nulla viola il dominio.

Esito AI: PASS_AI. Risultato esatto: Infinite coppie. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 908bc97d68d968cfa3105566f1c9da2e167a59c8faa257d523ec35f3cdfa9e6c; candidato SHA256 b10e4ad80b6ec08b4173c5de6c8c2bb9046e4dd3f02cf30f11a643ba1ea214be; firma di lettura 9e29c3ec3abd2a9f38b75f4e5fcb24592c1bddf3dcb9c2c436c1aec86e6f5d97.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo il rinnovo del binding, dei token e di tutte le guardie d’edizione esclusivamente in memoria nel test. Resta attivo l’oracolo matematico o la risposta concettuale motivata, non la sola impronta. Altre prove coprono falsa fonte, unità errata, batch vuoto/parziale/duplicato, falsa fisica a chiave corretta e SVG incorporato o locale mutato. Le guardie su testo e figura certificano l’edizione letta e non sono risolutori semantici universali.

assert_record_identity verificato sui report fresh e salvati contro package e binding reali integrati ROOT. Proprietà Hypothesis per ulteriori configurazioni fisiche e test geometrici sui cinque SVG. La suite generale, il replay browser finale e l’integrazione spettano al root. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.

Nota sul test comune: il primo run non era PASS. La mutazione d’unità sceglieva sempre Hz, che in 137 era già l’unità originale e quindi non mutava nulla; ora sceglie sempre una dimensione diversa e lo asserisce. Il lettore XML è stato corretto per ignorare il rettangolo di sfondo senza attributo y, mantenendo tutte le asserzioni sulle sei caselle e sulle coordinate fisiche. Nessun candidato, oracolo matematico o criterio di accettazione è stato indebolito per queste correzioni della fixture.
