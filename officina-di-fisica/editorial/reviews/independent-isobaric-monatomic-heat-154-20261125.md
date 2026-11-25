# Revisione scientifica indipendente — isobaric-monatomic-heat-154

Autore B, revisore A distinto. Tutti gli 80 prompt originali B153–157 sono stati letti integralmente prima di aprire candidate, risposte o moduli autore. Derivazioni primarie per ID persistite in /private/tmp/cric-a153-157-primary-before-keys.md, SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641. Le comunicazioni preliminari contenevano soltanto SHA, file e ipotesi generali, nessuna chiave o risultato. L’esperienza del revisore nelle altre famiglie termodinamiche è dichiarata; non si pretende ignoranza delle leggi fisiche.

Fonte Ardesia: 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json, SHA256 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Hash canonici individuali confrontati con le fonti; non sono state utilizzate le chiavi originali per costruire gli oracoli. Lezioni Cric reali C3-L01, L02, L03, L06 e L07 rilette dal pin 5d1dc8dc7b601aef959d10d564c75462be74708d. Skill primaria C3-L03 pertinente alle capacità e agli scambi; i prerequisiti reali includono misure, gas ideale, primo principio e percorso termodinamico.

Edizione finale autore dfc34fd8b11d7caa2ad82fdbe504091afa936143; package e binding ROOT confrontati byte per byte col pin autore, asset compreso. Package canonico SHA256 79564c9a929233f79b7d0fce1357b0a8e362f66152a66ad01c51af9ea9d2b941; binding canonico SHA256 85ce7ae6214f038bf254e71067149a7b7c838fb8f80627da46c1da0acd3a7534; verificatore SHA256 4ed651dfbb34bdb0744275fe27432dbcb00a23bec7d8b45714bf25dddb187c30. Tutti i 16 record sono stati letti integralmente, inclusi opzioni, passaggi, hint, feedback, metadati e didascalie. XML e rendering SVG completo visionati; nessun candidato, asset, registro o codice prodotto modificato dal revisore.

Gli oracoli derivano leggi, inverse, rapporti, tarature e rami fisici con SymPy, Fraction e Pint. Il parser aritmetico usa un AST limitato senza eval o sympify di input libero. Le risposte qualitative e le stringhe simboliche restano dichiarate AI_CONCEPTUAL con prove fisiche specifiche; gli esiti numerici sono EXACT_ORACLE. Identità del contratto canonico verificata sia sul report fresh sia sul file salvato e confronto fresh=saved. Venticinque controprove effettivamente eseguite per famiglia: 16 chiavi errate con binding e tutti i token di edizione rinnovati solo in memoria; inoltre falso testo con chiave corretta, fonte falsa, unità errata, corso errato, batch vuoto/parziale/duplicato, SVG incorporato e SVG locale modificati. Il rifiuto delle chiavi resta nell’oracolo matematico/concettuale, mentre il testo fisico falso è rifiutato dalla lettura individuale congelata: questi ruoli non vengono confusi.

Nessun nuovo ID né pubblicazione. Bozze DRAFT; approvazione scientifica umana NOT_RUN; publicationAction NONE. Questa review AI e i test non attestano apprendimento o accessibilità osservata con studenti.

## Figura scientifica

XML e rendering nativo intero letti. Capacità totali C_V=3 J/K e C_p=5 J/K con nR=2 J/K: barre 150/250 px alla scala 50 px per J/K. Pannello energetico Q=50 J in 400 px, ΔU=30 J in 240 px e W=20 J in 160 px: somma esatta e stessa scala 8 px/J. Caso 03 distinto a ΔT=2 K: Q=10, ΔU=6, W=4 J hanno barre 250/150/100 px a 25 px/J. Non si confrontano lunghezze di pannelli con scale diverse.

## Esito della lettura

Nessun finding residuo. Il caso 03 conserva la domanda su ΔU e non viene sostituito dal calcolo di Q: il calore isobaro include anche il lavoro uscente. I differenti fattori di scala dei tre pannelli SVG sono espliciti.

## AR-u5-isobaric-monatomic-heat-01 — Il calore alimenta due contributi

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Tre gradi traslazionali classici danno C_V=(3/2)nR. Per isobara lenta pΔV=nRΔT, quindi W=nRΔT e Q=ΔU+W=(5/2)nRΔT. Con nR=2 J/K e ΔT=10 K: ΔU=30 J,W=20 J,Q=50 J.

Alternative e feedback: 30 J è ΔU,20 J è W; usare capacità isocora per Q omette il lavoro uscente. Il prodotto nR include già la quantità.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 010b198d514776c05fad7011f40c57e7ada60b24bfc2f114d8ef43041a448f3d; candidato SHA256 822fa35d8e15fb6742435bc20919ae010e647047612bcf468c8b9a759f33b0b3; firma della lettura 0714e202e74d6652ed6288d627d7c16c66f06bf596c501fe1f4e800d662a8f3a. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-02 — L’unità del calore isobaro

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: (5/2) è puro; (J/K)×K dà J. Le moli sono già comprese in nR e non si moltiplica ancora per n.

Alternative e feedback: J/K capacità totale,K temperatura,W potenza,J/(mol·K) capacità molare. Nessuna durata compare nella legge.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION. Source SHA256 ddb8cee7cc9de4c343ef27cdb6fec3b8bf76f7cfb10615b16198f7c2445be2d3; candidato SHA256 46ba00bdb57471c27d1f3b834705701ffc50436594e5d9dadf9dbb161aba9467; firma della lettura 0351fb06312fdd87da23ed9077f8eb1ad390a216013bcbde8a9d43c7beb73e15. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-03 — L’energia interna non coincide con il calore

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso. Il caso 03 domanda ΔU, non Q, e fornisce la capacità totale C_V.

Derivazione e procedura manuale: Domanda speciale su ΔU: C_V=(3/2)(2 J/K)=3 J/K. ΔU=(3 J/K)(2 K)=6 J. Per controllo, W=4 J e Q=10 J. U dipende solo da T nel modello, quindi C_VΔT si usa anche sul percorso isobaro.

Alternative e feedback: 10 J risponde a Q,4 J a W;0 confonde isobara con isoterma,12 raddoppia ΔU. Il fatto che C_V sia definita a volume costante non vincola il percorso della differenza di U ideale.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 7a0a1e84cde4ef0ee795c54233399b992f987c64447c4bc7eee6e61e392bcee9; candidato SHA256 fcdf9687b5a598be681b233a55587aa87972210897e177a45d74620ca029565f; firma della lettura 315516271be7fb943804e79e4b14a18faa2bfe34fba0e708289fc57cf83281f6. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-04 — Cambiare la quantità di gas fra prove

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Campioni distinti nR=2 e 4 J/K, stessa ΔT=10 K: Q_A=50 J, Q_B=100 J. R universale resta uguale; cambia n fra preparazioni, mai durante una singola prova chiusa.

Alternative e feedback: 50 J ignora n diverso,25 inverte dipendenza,200 aggiunge un raddoppio di ΔT,0 viola il riscaldamento.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION. Source SHA256 f53353e25e732c057eebb01de447f15d21f08396b20d2cdd2363355b0d8349a1; candidato SHA256 9a323aed62dcb123f2d246d043e240922e165b048f02625dc58f6d0ed32ff899; firma della lettura 1d9cad2dcd9a1efadaedc6060b1acb435b6852962dd4a08526e41e8e77d0f4b8. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-05 — Ricostruire il prodotto nR

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: nR=2Q/(5ΔT)=100 J/(50 K)=2 J/K. Q/ΔT=5 J/K sarebbe C_p totale, non nR.

Alternative e feedback: Q/ΔT=5 J/K è C_p. Coefficiente tre mezzi tratterebbe Q come variazione interna; non è il dato chiesto.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 2867a31afef01c852b768e8c6e2249507015683084b96e0718876d1a7af0a2d1; candidato SHA256 6ffadbc51a363ef6679f448f47b5b763902a2fbcab76046652a530c01add8564; firma della lettura caa839b16cefe2c413f176297e5c4ddd29aeca6d6837145733ec04703725e902. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-06 — Il riscaldamento dal calore

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: C_p=(5/2)(2 J/K)=5 J/K. ΔT=50 J/(5 J/K)=10 K. Non si determina T finale senza T iniziale, né si applica un offset alla differenza.

Alternative e feedback: 25 K usa nR invece di C_p;50/3 K usa C_V e confonde Q con ΔU. Offset Celsius non cambia intervalli.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 31a27afef2a119844745e078f3d2cda9bd875d8a500f129f7659cd66bf47e334; candidato SHA256 2e87ffa8dc6e7c6fa8b0d4b33715fa8cf3b8559908260de3353f1ef95ad0978b; firma della lettura e688c4dd071d7f478ced8d8f7d9ee95b9b4e5b0c43796a90d12e906612fabd54. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-07 — Stesso campione, intervallo doppio

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: A:50 J,B:100 J. Rapporto 100/50=2; il coefficiente cinque mezzi e nR si cancellano.

Alternative e feedback: 1/2 reciproco,4 quadrato,1 nessun cambiamento,−2 incompatibile con entrambi i calori positivi.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 fda0aaea6cfd9b0b320b8fbe7028ea3731742bb359fac4e09810f4fa0f5ba6e3; candidato SHA256 2cb7ef1829e67dac6199a58fad1cd326aaa5d3131745ea393fbc252a7f0199c6; firma della lettura b2b3c4c68852e914cceb7ef614efd23b1bcaa0524fbd76d71919dad112c93bbd. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-08 — Correggere una proposta di 100 J

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Q corretto 50 J, proposta 100 J. Scarto ordinato 100−50=+50 J, distinto da ΔU e già comprensivo del lavoro di espansione.

Alternative e feedback: −50 ordine inverso,100 proposta,0 la accetta,25 metà dello scarto.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 1877c61d979a8e82793e155e855c75bbd51a5a28efaefbf2727195b8e97bde2f; candidato SHA256 cb3664f01992bebb9bd659962b8dfa3e710911b54d0449876d60e1c4ea1a318b; firma della lettura d0ea34ec464df8c941e615b342a0585e9f43a59cddfa3c706a6762df7f9d2a43. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-09 — L’inversa che conserva il coefficiente

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Dalla legge Q=(5/2)nRΔT si moltiplica per 2/5 e si divide per ΔT>0: nR=2Q/(5ΔT), unità J/K. Tutte le alternative sono confrontate simbolicamente.

Alternative e feedback: 2Q/(3ΔT) usa C_V, Q/ΔT dà C_p;5Q/(2ΔT) non inverte 5/2, Q/(5ΔT) perde 2.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 04b4ecd1bbfba0744e214dac8cd50a7d7fdd4a43f7cc15cae5ce4209acfd7604; candidato SHA256 fc4746fd45829bf3657e04d6ee7da2c0e8095a6510117c5d95440fddd9743a05; firma della lettura c8df264283ca1c426dba6478408339a082ffcdc795f4996e752868acd76127c8. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-10 — Scalare due ingressi del calore

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Sostituzioni nR_B=κ₁nR_A, ΔT_B=κ₂ΔT_A: rapporto κ₁κ₂. Il cinque mezzi compare sopra e sotto e si cancella.

Alternative e feedback: Quozienti invertono dipendenze; somma dà 2 per prove identiche; residuo 5/2 ignora la cancellazione del coefficiente comune.

Esito AI indipendente positivo; modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION. Source SHA256 82f000cb01dc69ca2262e0f3322865bf64aba7473421ac7e98d0f2d5338293c1; candidato SHA256 b408ce8aab52f13047ec9271b5c64eb4a4b6e1613148aae829476c1f0f9f3b45; firma della lettura a5306a6ec365e55db826b2e83d76ce1b7181dd551193073c01881ad79bea0790. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-11 — Due raddoppi, un rapporto energetico

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Q_A=(5/2)2×10=50 J e Q_B=(5/2)4×20=200 J; rapporto4, prodotto dei due raddoppi.

Alternative e feedback: 2 considera un solo raddoppio,200 J è uscita B e non rapporto,1/4 inverte A e B.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 a5c55bdba4e455ab65e462f1ce73c462f4172795a9e75690007b9586fdfdc28a; candidato SHA256 402dda76f4eefacfa7d72ab1f521a23c1caf30af57b0c035d9212d5988742018; firma della lettura 877e5f550b4d76bc082d3091f96071aaf962d136a1392bfe0aedd978f40f83dd. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-12 — Mediare due apporti di calore

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Media(50+200)/2=125 J. Modello agli ingressi medi nR=3 J/K e ΔT=15 K dà (5/2)3×15=225/2 J, inferiore di 25/2 J.

Alternative e feedback: 250 somma,125/2 metà della media,150 differenza,225/2 uscita sugli ingressi medi. Sono cinque valori esatti distinti.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 92008c53d50b472fc6370e2d4971aff5a34dfe541d25ef5000a5e683cf804ba4; candidato SHA256 c746a7e488beeeae4ddfe1b03783576508548e2cb8424d2a3755fe20200b6ede; firma della lettura e766cd5cda1d8f47efb34f4b9288fa24a36c7628a42025a9e385193300ee0204. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-13 — Il secondo ingresso per il bersaglio

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Target 4×50=200 J, C_p,B=(5/2)4=10 J/K. ΔT_B=200/10=20 K e rapporto 20/10=2.

Alternative e feedback: Fattore 4 nell’intervallo con quantità doppia darebbe 8 volte Q_A; fattore 1 soltanto 2 volte Q_A.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 ba9e663ab20d6c5215b02a90c51053fd053fbc7c597e365a608cd36cd7b1b753; candidato SHA256 802efaf15677f473af15a7a76580119702db426e563b40bfc012db78c2a6d917; firma della lettura d90fb4961433dff58a077e89bff9131d0e6a4caab4566e599d153d73960b6235. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-14 — Dal display al prodotto nR

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: q=150/(50 J)=3 J⁻¹. S_B=600→Q_B=200 J. nR_B=2×200/(5×20)=4 J/K. Il display non è direttamente un’energia.

Alternative e feedback: 600 trattato come J dà nR=12 J/K; Q_B/ΔT_B=10 J/K è C_p,B, non nR_B.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 122b7799181f9de59e6c2e7d6c0e1cddf2f36c919ab36935ba194006569aad10; candidato SHA256 b532eba5c27a86a09fade189d3542d7ef81edc168672b57db6b43b42f63d4eb0; firma della lettura e57257c55cb9764a517aebed3d559d8e5f96d5e1937eabb7a65a8df8e4f5b4c0. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-15 — Guadagno, offset e quantità di gas

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.

Derivazione e procedura manuale: Riferimenti 50 e 200 J: q=(401−101)/(200−50) J⁻¹=2 J⁻¹,b=1. Q_C=(201−1)/2=100 J. nR_C=2×100/(5×10)=4 J/K, ricostruisce S=201.

Alternative e feedback: nR=2, 8, 5 J/K ricostruiscono S=101, 401, 251. nR=201/50 J/K omette offset, Q=100,5 J→S=202. Solo 4 J/K ricostruisce 201.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 cb2e36259eadfbc7c1c38171c32168abf1beecd99902e27905435a41a68e9711; candidato SHA256 b1e9c2c557991832f435c41882e476f035fb7e8f009a86bd42fefc09d2a4c733; firma della lettura bb6442fba4e42adcc379b96f72037a7ff85262ac6db07e2b3d8fb12d64ef7660. Approvazione umana NOT_RUN.

## AR-u5-isobaric-monatomic-heat-16 — Un vincolo fra campioni preparati

Ipotesi e dominio: Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso. c in J/K² collega preparazioni, non una quantità variabile nel tempo entro il campione.

Derivazione e procedura manuale: Vincolo fra preparazioni nR=cΔT con c=(1/5) J/K². Q=(5/2)c(ΔT)²=50 J→(ΔT)²100 K². Radici ±10 K, dominio positivo seleziona 10 K e nR=2 J/K; capacità costanti entro la prova.

Alternative e feedback: −10 K rende ΔT e nR negativi;100 è il quadrato;5 K dà 25/2 J,20 K dà 200 J. Vincolo fra campioni non è n(T) durante il percorso.

Esito AI indipendente positivo; modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION. Source SHA256 a7e130beaa471a0604e28b67774d8ea7fb0c7c67e42696dc5b64aa92ac9e1100; candidato SHA256 c8e33fa612a2e2a84c3fd1ecf16f4f1a9af1b95093b5196e9b3b7ab244a636c6; firma della lettura e8f07608a461822166c8f6a363fa6dcaf02b7a1b5049f6f39e2b991e0e6ea8db. Approvazione umana NOT_RUN.
