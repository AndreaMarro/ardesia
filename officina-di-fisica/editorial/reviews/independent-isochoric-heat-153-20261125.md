# Revisione scientifica indipendente — isochoric-heat-153

Autore B, revisore A distinto. Tutti gli 80 prompt originali B153–157 sono stati letti integralmente prima di aprire candidate, risposte o moduli autore. Derivazioni primarie per ID persistite in /private/tmp/cric-a153-157-primary-before-keys.md, SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641. Le comunicazioni preliminari contenevano soltanto SHA, file e ipotesi generali, nessuna chiave o risultato. L’esperienza del revisore nelle altre famiglie termodinamiche è dichiarata; non si pretende ignoranza delle leggi fisiche.

Fonte Ardesia: 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json, SHA256 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Hash canonici individuali confrontati con le fonti; non sono state utilizzate le chiavi originali per costruire gli oracoli. Lezioni Cric reali C3-L01, L02, L03, L06 e L07 rilette dal pin 5d1dc8dc7b601aef959d10d564c75462be74708d. Skill primaria C3-L03 pertinente alle capacità e agli scambi; i prerequisiti reali includono misure, gas ideale, primo principio e percorso termodinamico.

Edizione finale autore bb12f47ed21dce65ad25df47f847a70af4507ab5; package e binding ROOT confrontati byte per byte col pin autore, asset compreso. Package canonico SHA256 3ff584c615dcbece5fd8ccabaf923eaf4dbdb6bd03889d61a45d734c09de7e23; binding canonico SHA256 79d3957597b173a6bbda9f8c3c02547c26530822a0d5dcc34f8c5389ee0c8ced; verificatore SHA256 066aeec6bca2a36261a6a140a5d1fa78eb820c3fd517a2c0d8593299050db0a4. Tutti i 16 record sono stati letti integralmente, inclusi opzioni, passaggi, hint, feedback, metadati e didascalie. XML e rendering SVG completo visionati; nessun candidato, asset, registro o codice prodotto modificato dal revisore.

Gli oracoli derivano leggi, inverse, rapporti, tarature e rami fisici con SymPy, Fraction e Pint. Il parser aritmetico usa un AST limitato senza eval o sympify di input libero. Le risposte qualitative e le stringhe simboliche restano dichiarate AI_CONCEPTUAL con prove fisiche specifiche; gli esiti numerici sono EXACT_ORACLE. Identità del contratto canonico verificata sia sul report fresh sia sul file salvato e confronto fresh=saved. Venticinque controprove effettivamente eseguite per famiglia: 16 chiavi errate con binding e tutti i token di edizione rinnovati solo in memoria; inoltre falso testo con chiave corretta, fonte falsa, unità errata, corso errato, batch vuoto/parziale/duplicato, SVG incorporato e SVG locale modificati. Il rifiuto delle chiavi resta nell’oracolo matematico/concettuale, mentre il testo fisico falso è rifiutato dalla lettura individuale congelata: questi ruoli non vengono confusi.

Nessun nuovo ID né pubblicazione. Bozze DRAFT; approvazione scientifica umana NOT_RUN; publicationAction NONE. Questa review AI e i test non attestano apprendimento o accessibilità osservata con studenti.

## Figura scientifica

XML e rendering nativo completo letti: recipiente rigido con freccia Q schematica, non vettore metrico; nessuno spostamento del confine. Retta Q=2ΔT con origine (100,640), 15 px/K e 5 px/J: punti (250,540) e (400,440) corrispondono a 10 K/20 J e 20 K/40 J. Barre da zero larghe 100,400,250 px alla medesima scala 5 px/J danno 20,80,50 J. La media non rappresenta calore immagazzinato.

## Rilievo corretto e riletto

Il feedback originale del record 03 diceva che Q=0 descriverebbe isolamento termico, invertendo un’implicazione. Un trasferimento netto nullo può anche derivare da scambi opposti: non prova isolamento. L’autore ha corretto soltanto quel feedback/error e binding03 in bb12f47: isolamento implica Q=0, mentre chiusura alla materia non lo impone; nel modello dato Q=0 contraddirebbe il riscaldamento senza lavoro. Riletto il testo finale e confrontati i byte: altre 15 schede, chiavi, formule e SVG identici. Nessun finding residuo.

## AR-u5-isochoric-heat-01 — Riscaldare senza spostare il confine

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Parete rigida, nessun altro lavoro: W=0. Q=ΔU=C_V ΔT=(2 J/K)(10 K)=20 J. C_V è totale e non va moltiplicata ancora per massa o moli.

Alternative e feedback: 40 J richiederebbe capacità o incremento doppi; introdurre massa o moli conterebbe due volte la quantità. Pressione fissa non segue da volume fisso.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 6acdf79b13e67e7daa2c035c8c96151534e407480a375733572a7439b1cb7a51; candidato SHA256 90561f158c0dfce75d1cfa81c24361b5df8b812693d714891af8b85e4db1ca19; firma della lettura 1d58a5b04326611d9ac5df6bfb57aff3667f976cd8da8dba87997d33383f9abd. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-02 — L’unità del calore trasferito

Ipotesi e dominio: Calore Q=C_V ΔT è energia trasferita; C_V totale in J/K e incremento in K. Unità confrontate dimensionalmente senza supporre una massa.

Derivazione e procedura manuale: Il prodotto (J/K)×K cancella K e dà J. Il calore è trasferimento energetico, non temperatura o proprietà immagazzinata.

Alternative e feedback: K è temperatura, J/K capacità, J/(kg·K) capacità specifica, W potenza con un tempo al denominatore.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION. Source SHA256 26a344a2e0e789a28fcfb1c3e77dcc7c0308813fc89e11a2202c5b172cae5d2d; candidato SHA256 b6d4d9a8132d6d9d53abcb9e8a130b0330bb8a1c5b2769cf990aafa9bde7ae22; firma della lettura c9d5800bbdd1b842f959a30ae5107c91b518c310f74e4bdcedc8003406ad925d. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-03 — Un recipiente rigido può aumentare la pressione

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: ΔV=0 annulla il lavoro di frontiera. Con Q>0 e nessun altro lavoro ΔU=Q>0. Per n,V costanti, p=nRT/V cresce con T: derivata nR/V positiva. Maggiore agitazione non produce lavoro senza spostamento della parete.

Alternative e feedback: Volume fisso non fissa p; chiusura alla materia non impone isolamento. Gli urti senza spostamento della parete non danno lavoro di frontiera. U aumenta perché Q entra.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION. Source SHA256 a3786a222098b6ef3cdb8c8562b207f7663b605bbea0047b5b65714f77c50e2e; candidato SHA256 6250824f9059f879d48b8515ca367d879bd85bdae0dffeec3f7fe35afba87221; firma della lettura 9a9491d2f9dfbd73d91777ff365af079f6c9083a937b962a09bc23d71bff42f4. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-04 — Due campioni con capacità diversa

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Due preparazioni: C_V,A=2 J/K e C_V,B=4 J/K, entrambe con ΔT=10 K. Q_A=20 J, Q_B=40 J; rapporto 2. Non si apre il campione entro una prova.

Alternative e feedback: 20 J ignora capacità B,10 J inverte dipendenza,80 J raddoppia anche ΔT,0 J contraddice entrambi gli ingressi positivi.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION. Source SHA256 037e04739e9776075e937e4d9cad90c079ee59804d9c43b490ec563cf9169644; candidato SHA256 c23604ce812fcfb13e49c330226a8edf8cba15549965bb8143a5a622bde7c096; firma della lettura 3e8b128eeac9da0e9f7783b3dd2698bb69db974fd5aefcb6f83e7bc97a358312. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-05 — La capacità dall’energia entrata

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: C_V=20 J/(10 K)=2 J/K. La sostituzione 2×10=20 ricostruisce il dato, senza conoscere una massa.

Alternative e feedback: QΔT ha J·K e ΔT/Q ha K/J, entrambi diversi da J/K. Non occorre una massa per la capacità totale.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 74178086e2362bb5e64bbac711aef4f5dc423b6c1111f9c6604308442666b57e; candidato SHA256 e3769c8f7a6a866f095696c013b9a3d77af713f33b48082a4e05f79e6b4a989d; firma della lettura c1ae38a057b3b47c23f22c4c4d0cfb6196693104326833e5ee4ac5e855a8dce9. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-06 — Un aumento, non la temperatura finale

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: ΔT=20 J/(2 J/K)=10 K. È incremento, non T finale; non si aggiunge 273,15. T_i serve soltanto per ricostruire la temperatura finale.

Alternative e feedback: 20 copia Q e40 moltiplica invece di dividere; offset Celsius non si applica a una differenza. Nessuno ricostruisce Q=20 J.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 9ec70de5763eedbe725b88c002986cb7b942effa9a85e424e9e71ceca4be0696; candidato SHA256 ec9ef31c9ac3a09e29c40a716138e9059aa7f942af3904000720337a430cc91f; firma della lettura 023b872f14a75007495a3c3ec81b643812aa794dfa434d04a3e8e3c55697567e. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-07 — Raddoppiare l’intervallo termico

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Q_A=2×10=20 J e Q_B=2×20=40 J; 40/20=2. Capacità comune cancellata.

Alternative e feedback: 1/2 reciproco,4 quadrato,1 ignora aumento,−2 viola il segno dei due calori positivi.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 220dbc26329942e470e16d07e6c276c9619e13dd9326d5cbabf49342ee5b4109; candidato SHA256 6551ad30ec46fda0bfc28d98fe8dec393a8cb91bb07494dcb364f537a484eb35; firma della lettura 8fa4046bd590bc1281c1c2b603498f7dd12f0ea3ea4488ffbd6c95f273990f0c. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-08 — Lo scarto di una proposta troppo alta

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Q corretto 20 J. Scarto ordinato 40−20=+20 J, non cambio di convenzione termodinamica.

Alternative e feedback: −20 sottrae al contrario,40 copia proposta,0 la accetta,10 dimezza ulteriormente lo scarto.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 ec0ff65b64848f1589c0df350f9b87a787f5379d8cc1900231ecf820b32f524a; candidato SHA256 2316735f7969f5c3b14edda64f464cc3cad5d49c48c3ded1f8a9dd37ddf541e3; firma della lettura bab917ac9342c7d568daf66329b2bbfc8cc48a6fefeee8b7d527395f774061fc. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-09 — La formula inversa per la capacità

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Dividendo Q=C_V ΔT per ΔT>0 si isola C_V=Q/ΔT, unità J/K. Le cinque formule sono confrontate anche simbolicamente, non soltanto con un esempio.

Alternative e feedback: QΔT unità J·K, reciproco K/J. 2Q/ΔT e Q/(2ΔT) hanno unità corrette ma restituiscono 2Q e Q/2 nella legge diretta.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 1a5dc57203130b80b9260bcfb2a80a70a5260a4ea1f5a9bf0913dbc3afa0d34d; candidato SHA256 ed88ab120cd3ad88ec90c4ca1dddc1318635a34d80cac167babee98746dacc45; firma della lettura 768f8246500529d602d74cb0f370790aa9b5d6c1e0aa8ddbe8d329f5fa7762b0. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-10 — Due fattori fra prove diverse

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Inserimento di C_V,B=κ₁C_V,A e ΔT_B=κ₂ΔT_A dà Q_B/Q_A=κ₁κ₂. Il denominatore è positivo. Unicità controllata come legge generale.

Alternative e feedback: Quozienti invertono un effetto diretto, somma dà 2 per prove uguali, κ₁κ₂² aggiunge un quadrato assente.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 477882d0ff7665e126d8e083743ad4e7b20df59d7235dd6a96cb68fa292082d4; candidato SHA256 fe9f3d402041bc3ce52e69e5a4acc49f094cb230a3e683894f8040e3db98b81b; firma della lettura 7da3820e6ed7cf7fc71a6bdedf5e69a2e4c591804ee056e33c27609c2d117e6e. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-11 — Capacità e intervallo aumentano insieme

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: A: 2×10=20 J; B: 4×20=80 J. Rapporto 80/20=4. Entrambi i fattori due contribuiscono.

Alternative e feedback: 2 considera un solo raddoppio;80 è energia e non rapporto;1/4 scambia le prove.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 07575332cd6c6095a6c689a02387311d54e9eb94b2a24e479b13178a58addfbf; candidato SHA256 c0096476ca753ebfc080df3fff31f914342f889ac7cd122917a502dafc6af85d; firma della lettura 250c87592d0a4115e0102dab7f68820af7c7fb7ef4b02e6ea59785c6c64a9e92. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-12 — La media delle energie nelle due prove

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Media richiesta (20+80)/2=50 J. Prodotto degli ingressi medi (3 J/K)(15 K)=45 J, 5 J in meno: relazione bilineare, nessuna falsa commutazione.

Alternative e feedback: 100 somma,25 metà della media,60 differenza,45 prodotto degli ingressi medi. Cinque alternative numericamente distinte.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 2d86ddee1974c1bd7b86bfd7683b9fde0507209f759b432bebe34102eb6c7a08; candidato SHA256 3e6731963ad4c9f52e3097b90eae7063406b242d3f5b3c90584454f092c1a50c; firma della lettura 5da5f648a46c0b1402433a55beb9fd2b1d0da8e4bce950162ee94e60c98b78ab. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-13 — L’intervallo per un bersaglio quadruplo

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Target 4×20=80 J con C_V,B=4 J/K: ΔT_B=80/4=20 K e rapporto 20/10=2.

Alternative e feedback: Fattore4 nell’intervallo con capacità doppia dà 8 volte Q_A; fattore1 nell’intervallo dà soltanto 2 volte Q_A.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 6e743fabfed7ff12e91c4cb049f2833fa9da63e9da35931b95a484dde6280e9e; candidato SHA256 bf53274e94b1d818f14030635c7211a8cdd001e7c4ac4f169fa86e8db17dee1d; firma della lettura f637d590b3fda45d394fd703e7c056e2067ec17ecb280c7aeaa5e7ccf9cc8ddc. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-14 — Tarare il display prima dell’inversa

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Riferimento Q_A=20 J; q=60/(20 J)=3 J⁻¹. Q_B=240/q=80 J; C_V,B=80 J/(20 K)=4 J/K.

Alternative e feedback: S/ΔT=240/20=12 confonde display adimensionale con joule, triplicando la capacità; q agisce su Q.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 006a5ce4a3b9a2c38ee439053b2d6d669ad79c2f96f65e5580282f6f6992a3be; candidato SHA256 2b681c71a4e4d174f05757d35f46f02e53c47c57221fe307f32162cf6ea4e8ca; firma della lettura 6318155d98409c2cf49c17943f289cfa09b60c68b08e7f1ff5c54b5828eb4860. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-15 — Separare guadagno e offset

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.

Derivazione e procedura manuale: Q_A=20 J, Q_B=80 J. q=(161−41)/(80−20) J⁻¹=2 J⁻¹; b=1. Q_C=(81−1)/2 J=40 J; C_V,C=40/10=4 J/K. Ricostruisce S=81.

Alternative e feedback: 8 J/K ricostruisce S=161;2 J/K S=41;81/20 J/K dà Q40,5 J e S=82;40 J/K dà S=801. Solo 4 J/K ricostruisce 81.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 b71789286b082cdcbe8ce795e4d0f674d6de4a4b2c014b6537648249d3b2610c; candidato SHA256 acac756e25f053c7317658245cf86eaa3ded97ff6665399cf6dd90229fb6bd61; firma della lettura 9e0722b726c45b01abd217dc0e120365e986d2aa341c0ad577a26ae07483de2f. Approvazione umana NOT_RUN.

## AR-u5-isochoric-heat-16 — Un vincolo fra preparazioni del campione

Ipotesi e dominio: Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse. Il vincolo C_V=cΔT collega prove diverse: c in J/K², non una legge istantanea C_V(T).

Derivazione e procedura manuale: c=(1/5) J/K², vincolo fra preparazioni. Q=c(ΔT)²=20 J implica (ΔT)²=100 K². Radici ±10 K; dominio positivo seleziona +10 K e C_V=2 J/K. Non si integra C_V variabile nel tempo.

Alternative e feedback: −10 K rende negativi ΔT e C_V;100 è il quadrato con unità errate se usato come intervallo.5 e 20 K darebbero 5 e 80 J.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 6cedb8f7b9fdf0dbf237a1655ef4257da561667accae8b5152047477b8183f41; candidato SHA256 a5acfab07126e130c1f45eeb8d45c8d33ed371d89f0485f0b68208c903a1e235; firma della lettura d7748be830969ed3eede9701332c2576d06b3d86119681b49121c02aeb8dca9e. Approvazione umana NOT_RUN.
