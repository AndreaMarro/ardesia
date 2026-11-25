# Revisione indipendente — horizontal-jet-range-104

Autore e reviewer distinti. Edizione autore finale `76cb7deccd2651e4f0687f2fb4a576e910eaca1b`; fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json`. Tutti gli 80 prompt originali delle cinque famiglie sono stati letti e risolti prima di aprire i pacchetti candidati. Trasparenza: il messaggio di consegna dell’autore aveva già anticipato l’esito del record 104-06 (gittate uguali e velocità A doppia), oltre a indicazioni qualitative sui radicali, sul quartico e sul cambio dei nomi h/H. Quell’esito è stato comunque derivato dai due modelli fisici, ma non viene presentato come lettura completamente cieca della chiave. Nessun modulo autore importato.

Sono poi stati letti tutti i 16 candidati finali di questo lotto, con consegne, passaggi, formule, alternative, suggerimenti, feedback e metadati. C2-L005 e C2-L006 reali rilette per portate, energia per volume, Bernoulli e ipotesi. Tutti i cinque SVG delle famiglie sono stati letti in XML e nel rendering nativo completo, incluse geometrie, scale e traiettoria quadratica.

Pacchetto normalizzato `37266e4111fb94b50f6e4cdc0e999ba73136d06d82c2091021af8815b2230296`; binding `cd51de44532aad3755c7bc09adb0872ecac8b40e68666dbfe5bc842d4e1a0fdc`. Impronte congelate solo dopo lettura delle edizioni finali. Revisione AI distinta, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Nessuna pubblicazione o modifica del reviewer ai candidati.

## Modello e figura

Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

XML e rendering completo letti. g=2 m/s²; superficie y=300, foro (200,350), suolo y=550, scala 50 px/m: h=1 m,H=4 m. Bezier quadratica P0=(200,350),P1=(300,350),P2=(400,550): in coordinate fisiche x=4s,y=4−4s²,t=2s, cioè x=2t,y=4−t². Tutta la curva, non solo tre punti, rispetta gravità g=2 e tangente iniziale orizzontale. Freccia 60 px a 30 px/(m/s). Caso separato Z=10 m e fori a 2/8 m: due barre uguali 240 px a 30 px/m per R=8 m, non due velocità uguali. Limite geometrico indipendente R²=Z²−(2H−Z)²≤Z² per 0<H<Z, massimo R=Z al mezzo.

## Ruoli geometrici e trasparenza

La fonte usa H per il battente e h per la quota del foro. La nuova edizione dichiara esplicitamente h battente e H quota in tutti i record: è stata controllata la corrispondenza delle grandezze fisiche, non solo dei nomi. Il record 06 ha consegna autonoma con Z=10 m. L’esposizione iniziale della sua chiave nel messaggio autore è conservata qui e nel report. La prova indipendente usa v₀=√(2gh), t=√(2H/g) e confronta separatamente velocità e tempi.

## AR-u3-horizontal-jet-range-01

Procedimento indipendente: Nel candidato h è battente e H quota del foro; ruoli trasposti esplicitamente rispetto alla fonte. v₀=√(2gh), t=√(2H/g), quindi R=2√(hH)=2√4=4 m. Esempio SVG g=2 dà v₀=2 m/s e t=2 s.

Alternative e distrattori: h e H non si sommano per ottenere R; la somma è quota della superficie. g non numerica non impedisce il calcolo, perché è la stessa in efflusso e caduta.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `cdd1213224b06a7fb02e8be1951a8aadf2b182acf52a9a41460232e0a4c7d11f`; candidato `286808c5956599294405d2833ac1dadb014997bb335026916f84055a7d8b7189`; firma `490563310950b83f651bbed1414d392fbb5fe57b77d0a15494449a4f45905c2d`.

## AR-u3-horizontal-jet-range-02

Procedimento indipendente: R=v₀t ha dimensione L. Anche √(hH) è lunghezza; g si cancella ma non si cancella la dimensione. La scelta m richiede il solo riconoscimento dimensionale.

Alternative e distrattori: m/s velocità, s tempo, m² area e 1 puro. Cancellazione di g non rende R adimensionale.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `m`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `3ef34c71e0253420a4454f8bc459a8e2ef1f84951ea86240a35f2b2d3357bd31`; candidato `ebca5b41ff25176b15b914278888781912649afb84a1858dfb781b996b2b5125`; firma `4d069152ec700a23ec233855646d385b4cdc2cf3ac21a4ce222a1c2e2ce5711e`.

## AR-u3-horizontal-jet-range-03

Procedimento indipendente: Moto verticale con velocità iniziale nulla: y(t)=H−gt²/2. Il primo impatto ha t=√(2H/g)>0; x=v₀t e Torricelli danno R=2√(hH). La stessa g governa entrambe le fasi.

Alternative e distrattori: √(2gh) è velocità, fattore g residuo cambia dimensioni, 2hH area e √(hH) manca del fattore 2.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `R = 2√(hH)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `6f2bc78c974405909b309ece92d55dacb80baad39bd0bbed0a403f99048c8c9b`; candidato `3db82cfca847a7d726e7aa95f889662e4ba7ecd8294f1eb303ddc1d671489e29`; firma `b6766755bcc842d055508a2adeec918323195078e5919cc6ba23e4cf2ed19ac3`.

## AR-u3-horizontal-jet-range-04

Procedimento indipendente: h da 1 a 4 m a H=4 m raddoppia v₀, lascia t costante e porta R da 4 a 8 m. Le superfici sono a quote H+h=5 e 8 m, non a una quota totale comune.

Alternative e distrattori: 16 linearità falsa in h, 4 ignora, 2 inverte, 4√2 corrisponde a h soltanto doppio.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `Da4 a8 m`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `0a1548d749f355d253096e98383b4529e43dc0891cdef3e68e76cd63b5c59160`; candidato `10630df9a08e444beccc59b5c0aa901ef1f2f508218466ef6869ec5ca6a0e56b`; firma `412618eed903651f1d3537e95a7c69469bf9899dd83c742780d5153b2766cc83`.

## AR-u3-horizontal-jet-range-05

Procedimento indipendente: R²=4hH, quindi h=R²/(4H)=16/(4·4)=1 m. Superficie ricostruita 5 m sul suolo.

Alternative e distrattori: R/(4H) puro; senza 4 si avrebbe h=4 m e R=8 m. Quote ricostruite entrambe positive.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `1`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `950da15d164bfe544bf854c30c759fde4abe539f85f35f093655adb54d2ef07d`; candidato `65b71cf9974f3e7a7ead3ee9d6147627baa5e1800c8b356027226e6ac0ebe78f`; firma `81315ca78d540b68771823a7aa9d46ad606f028da0428422491863b2e97c3d78`.

## AR-u3-horizontal-jet-range-06

Procedimento indipendente: Con superficie Z=10 m, foro A a H_A=2 ha h_A=8; foro B a H_B=8 ha h_B=2. Prodotti entrambi 16 m² e gittate 8 m. v_A/v_B=√(8/2)=2, t_A/t_B=√(2/8)=1/2. Questa chiave era anticipata nel messaggio autore e viene qui ricalcolata dalle leggi.

Alternative e distrattori: Gittate uguali non implicano velocità uguali: tempi diversi. Guardare soltanto un’altezza ignora l’altra; entrambe le quote di foro restano fra 0 e Z.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse. Nel solo record 06 la superficie è mantenuta a quota totale Z=10 m e i fori sono rispettivamente a 2 e 8 m. La gittata comune non impone v uguali.

Esito esatto: `Gittate uguali; velocità maggiore da A`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `096123760e3c76e06b83d3718a4ef501871b857c909be3f5603128ae18e726a3`; candidato `b4ba652ca854f277da4e24a288bf9512da5c12c8f099fbc27b67e351e51ce8b8`; firma `a65324bf7b9f62d88a171c7f57be5c4f9d4892d7bb6a81e5766e8a93b832d465`.

## AR-u3-horizontal-jet-range-07

Procedimento indipendente: h=1 m fisso, H da 4 a 1 m lascia v₀ costante, dimezza t e R: 4→2 m, rapporto 1/2. Anche la superficie si abbassa per mantenere il battente.

Alternative e distrattori: 2 reciproco, 1/4 linearità falsa nel tempo, 1 ignora caduta più breve; segno negativo incompatibile con distanze.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `1/2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `1f3c1128d9801f497bdcd0559911319991d9739cdafbc16fcd1ac684f206bf73`; candidato `c3fd010004daf2b7468868aaa2ee1d8fd64bbc66c62c53a76ce7dffa2b5dc55a`; firma `82bea5a2ce06942d0bc1d1ff42ce51fd758e147b9bdd1121ec595467334d4278`.

## AR-u3-horizontal-jet-range-08

Procedimento indipendente: Corretto 4 m; proposta meno corretto 8−4=+4 m. Con H=4 m, una gittata 8 m richiederebbe h=4 m anziché 1.

Alternative e distrattori: −4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza; tempo non può raddoppiare a H e g fissi.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `5d91fe4be2536ac8966107f8bb2c095ff27da84d643c6f3f549619f7b1625331`; candidato `fedcf4e1607a406c79b8848f9bdcfab4fcd877797098bbfb1559a331bea51a89`; firma `82981e4b3c8cb00b1a0c116b191a5dfce3fa9fde032a6ba4a33b134e2adcd046`.

## AR-u3-horizontal-jet-range-09

Procedimento indipendente: Quadrare R positivo dà R²=4hH; dividere per 4H positivo isola h=R²/(4H), dimensione L²/L=L.

Alternative e distrattori: R/(4H) puro; 4R²/H fattore 16; 4H/R² lunghezza inversa; R²H/4 volume. Nessuna g residua.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `h = R²/(4H)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `d736b7acb8138c8830e6e0e5ae9d358f8a5ef7a7b46e07aa1d346535851b5192`; candidato `1e32b83dcbc0a57f3cd27d7f9436bbe137fa888d4f2b3857739b3126edf2404f`; firma `c6a998c72704431361ecc8924751239e38f28c73064d0dcbd1cae93530798300`.

## AR-u3-horizontal-jet-range-10

Procedimento indipendente: h e H scalano separatamente: R_B²/R_A²=κ₁κ₂. Per le distanze positive il rapporto è √(κ₁κ₂).

Alternative e distrattori: Prodotto senza radice riguarda R²; quozienti rendono inverso un fattore geometrico; somma dà 2 per prove identiche.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `√(κ₁ κ₂)`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `0af1a4c0dc456e7e0c65e8458a095b5fd7bc2177280dc287523a04d2fd12cf9b`; candidato `e3925d164e77ae460189e620d489b3915027a9c3b1f12c595cf2b435dcb3a4a1`; firma `1f9aa9f47ab2b4a43a7189e61274425003760a9108e910f28ba9549cfc7c9c3c`.

## AR-u3-horizontal-jet-range-11

Procedimento indipendente: A R=4 m; B hH=32 m²→R=2√32=8√2 m. Rapporto a 4: 2√2, il cui quadrato è 8.

Alternative e distrattori: 8 rapporto dei quadrati; √2 sola caduta; reciproco inverte; 4 non combina i fattori 4 e 2 con la radice.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `2*sqrt(2)`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `8be9430b1e776178f474840bb21c8a2ee81c9b61ca707db3e304c19ab1aaf345`; candidato `abb08e67426970155851266f5f6d8955a0144f683915c5932aee2f6c71657a7b`; firma `ef8a618360b7d7401b78aadbdf2fce5259e7bdb72c18165455bf0db2f31eaf94`.

## AR-u3-horizontal-jet-range-12

Procedimento indipendente: Media (4+8√2)/2=2+4√2 m. Ingressi medi h=5/2 m,H=6 m danno 2√15. Quadrato della media corretta 36+16√2<60 perché √2<3/2 (8<9); non serve un decimale.

Alternative e distrattori: 4+8√2 somma; 1+2√2 metà aggiuntiva; 2√15 ingressi medi; 2√2 rapporto invece di media in metri.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `2 + 4*sqrt(2)`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `b8b15e4291346f592eaa3893aed5f209f5a8c0d34ca9230508d2f60c1c08773c`; candidato `2d4ad0e49bf227a60a1d43ed8e0b9f3c103c869cbe228b3e8a55eb47868d6f7e`; firma `7f85ad082f8efb84c4e5051f60cd222399d368390d73c04f63c42c6d7ea5bfb4`.

## AR-u3-horizontal-jet-range-13

Procedimento indipendente: Target 2√2·4=8√2 m, quadrato 128 m². h_B=4 m richiede H_B=128/(4·4)=8 m, rapporto a 4 uguale 2; superficie B a 12 m.

Alternative e distrattori: 8 quota finale numerica, 2√2 target di R, 4 solo battente, 1/2 reciproco.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `5690097a49c097510e021e293bd4b4c72d5d66c5710a973b1389d10175b41d2f`; candidato `3339046040c69d007a2d8eb6df5bcdb20a96dd742b2e34553b5e0e4b63ffe82d`; firma `bc2572d9a4a729d7e6ca4e6106d3665d7d2fcdde0de4a90381bc89bed228b6b4`.

## AR-u3-horizontal-jet-range-14

Procedimento indipendente: q=12/(4 m)=3 m⁻¹. S_B=24√2→R_B=8√2 m, quadrato 128; H_B=8 m→h_B=128/32=4 m.

Alternative e distrattori: Usare S_B direttamente come R triplica R e moltiplica h per 9: 36 m. Rimuovere q prima di quadrare.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `242f0346ff889694d82f3f47b2a6184aa85880ba53faf0e642d77125fd815ec9`; candidato `8371af4c3e77a1fdac04e83b10e09f48ada15e9ad9483d6a6ebe415e7a07ce2e`; firma `8634f01bad003aab63d2244dddaa3dfb3c2b84f1070987c26ff09bf4d34fff29`.

## AR-u3-horizontal-jet-range-15

Procedimento indipendente: Differenze ΔS=2(8√2−4) e ΔR=(8√2−4) m, non nulle perché 128≠16. q=2 m⁻¹, offset 1; S_C=17→R_C=8 m, H_C=4 m→h_C=4 m.

Alternative e distrattori: Con H=4 m, h=1,2,8,16 m danno S=9,1+8√2,1+16√2,33, non 17.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `456337c8efd89baec04e0ebc80408439ad428bfc95a038dc8b4bbaf0a59a1d30`; candidato `4fd034c82f79b76d8f8babc7c0942124f41a849e37b6cf10d399b9b737cc1925`; firma `73c35f007b781792e465b6c3e99e869cdc2e557d5ace9c049db672e3faeea90e`.

## AR-u3-horizontal-jet-range-16

Procedimento indipendente: Vincolo h=H/4: R=2√(H²/4)=|H|. Solo nel dominio H>0 si semplifica in H; R=4 m dà H=4 e h=1 m, unica coppia positiva.

Alternative e distrattori: √(H²)=|H| su tutti i reali. H negativa non è foro sopra il suolo. Il dominio positivo è necessario per unica coppia h=1,H=4.

Ipotesi e dominio: Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f3023a88e674bb55c6b81bb57af332da750eb443e818c91b004f8f21e4e0f373`; candidato `f7e575c79d77da2907b74505d02a9a145060e2ad5dcd1d5965e17be4f377b40d`; firma `24f7af43d22b46932b34867e2843ec2e5308886c082bb1214b040d5bc43edc56`.

## Controprove e contratto

24 controprove per lotto: 16 chiavi errate con candidateSha256, binding e tutte le guardie d’edizione rinnovate in memoria, respinte dagli oracoli o dalla prova concettuale separata. Sono respinti anche fonte falsa con guardie rinnovate, numero corretto con unità sbagliata, prova fisica falsa con chiave corretta, pacchetti vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Per la spiegazione falsa resta esplicito il confine della lettura individuale congelata: il rifiuto non viene attribuito a un ricalcolo automatico del linguaggio naturale.

assert_record_identity verifica sia report fresh sia report salvati contro pacchetti e binding reali. Sono usati soltanto EXACT_ORACLE e AI_CONCEPTUAL. I radicali numerici passano da un AST limitato ad aritmetica razionale e radici di interi: nessun eval o sympify dell’input. Sono provati frazioni, somme radicali, reciproci e rigetto di chiamate arbitrarie, divisioni per zero e potenze enormi.

Il test comune genera inoltre 35 configurazioni per ciascuna di cinque proprietà fisiche, 175 in totale: somma dei costi gravitazionale/cinetico, continuità e totale di Bernoulli nel Venturi, ramo positivo e inverse di Torricelli, unità e area nell’efflusso, complementarità e limite geometrico della gittata. Le letture individuali non vengono sostituite da queste configurazioni.

Importazione, browser e conteggi globali restano dell’integratore. Non è stata eseguita una prova con studenti o una revisione umana.
