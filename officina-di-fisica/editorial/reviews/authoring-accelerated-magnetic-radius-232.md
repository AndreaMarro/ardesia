# Authoring DRAFT — accelerated-magnetic-radius-232

Tutti gli 80 prompt originali A230–234 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U6-05. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-05 SHA256 383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Compiti e casi autonomi preservati: cariche opposte 23103, elettrone parallelo 23303 e linee magnetiche 23403 non sono assorbiti nei rispettivi modelli numerici. Inverse e rapporti mantengono domini e coefficienti dimensionali.

Prima di candidature entrambi i revisori avevano congelato la primaria: B per A230–234 SHA 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d su 4fcc49cee05f35b838084471fe41bf5babc83f8f (mai aperta dall’autore); A per B235–239 SHA c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc su bc4da66c96cc57f8629b8252a24ce2f1943f7f5e. Nessuna chiave, soluzione, hint, opzione o candidata B235–239 letta durante l’autoria A.

Rilette integralmente le lezioni reali C4-L09 e C4-L10: forza di Lorentz su particella e filo, moto circolare, componente parallela e flusso orientato. Mappatura primaria L09 per 230–233 e L10 per il flusso 234, con eventuale override autonomo 23403 a L09; prerequisiti selezionati sul catalogo reale, senza confondere C1-L006 elasticità/gravitazione con il moto curvo di C1-L004. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Importatore canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Queste sono prove strutturali e di preservazione, senza accredito di integrazione o approvazione scientifica.

Figura SVG-only realmente renderizzata in browser nativo a piena altezza sotto mutex condiviso e guardia ≥2 GiB; XML e PNG completo effettivamente letti. Il processo è terminato exit 0, non si è dedotta la riuscita dalla sola comparsa del PNG. Nessuna pagina del prodotto, nessun server o dato studenti usato. UI prodotto e responsività 320px NOT_RUN, riservate al runner canonico dell’integratore. I testi visibili non mostrano metriche ingegneristiche e non confrontano scale di pannelli indipendenti.

## AR-u6-accelerated-magnetic-radius-01 — Due leggi in due regioni separate

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Con U=2 V e B=1 T, quanto vale r in m?

Procedimento d’autore: Nella prima regione il lavoro elettrico diventa energia cinetica: mv²/2=|q|U, quindi v²=2αU. Con α=1 C/kg e U=2 V, v=2 m/s sul ramo positivo. Nella seconda regione il campo non compie lavoro: il modulo della velocità resta due e la forza centripeta dà r=v/(αB)=2 m.

Formule: v^2=2\alpha U;  v=2\,\mathrm{m/s};  r=\frac v{\alpha B};  r=2\,\mathrm m.

Distrattori e controprove: Quattro m tratterebbe v² come v. Un m richiederebbe v=1 m/s e U=1/2 V a B=1 T, non la tensione assegnata di 2 V. Un campo magnetico uniforme da solo non fornisce l’energia acquistata nella prima regione.

Hint: Calcola la rapidità con il lavoro elettrico prima di usare il raggio.

Fonte canonica SHA256 1ee1b9bf8e78c6f97b2ae7a14137e73c0734c4a15bfd14f85538818c9130421e. Candidato SHA256 c3fe266232efa85620dc1ad79cdf387d043424b56812697d5afe2e1a1468d856. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-02 — L’unità del risultato finale

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Quale unità misura r?

Procedimento d’autore: Il risultato cercato è una lunghezza. Il prodotto αB ha unità s⁻¹ e v/(αB) ha unità metro. U e v sono passaggi intermedi, non la grandezza richiesta.

Formule: [\alpha B]=\mathrm s^{-1};  [r]=\mathrm m.

Distrattori e controprove: V misura la differenza di potenziale, m/s la rapidità, T il campo e J l’energia. Il fatto di partire da una tensione non assegna al raggio l’unità volt.

Hint: Segui le unità fino alla seconda regione.

Fonte canonica SHA256 2b7f46cd8c900e32806134ce13977d8eb652dde940805de23f00ec9d4e4f4c4b. Candidato SHA256 009cc79c74f828f4f7621386ca74a2ac976b2cd71a01d052667fa7debe4e2f2e. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-03 — Una formula per il raggio dopo l’accelerazione

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Quale espressione fisica fornisce r?

Procedimento d’autore: La prima legge determina v=√(2αU). La seconda dà r=v/(αB), perciò r=√(2αU)/(αB). α porta unità: il suo valore numerico uno non permette di cancellarlo dalla relazione dimensionale. Le due leggi non descrivono un unico campo elettrico e magnetico sovrapposto.

Formule: v=\sqrt{2\alpha U};  r=\frac{\sqrt{2\alpha U}}{\alpha B}.

Distrattori e controprove: 2αU al numeratore è una rapidità al quadrato. √(αU) perde il due energetico; dividere solo per B omette α e altera le dimensioni. Il reciproco non ha unità di lunghezza.

Hint: Conserva il coefficiente α anche se vale numericamente uno.

Fonte canonica SHA256 30d43532c13d730d40bac559cf255441d02a500faf7197e70dc73b325d7adf2f. Candidato SHA256 94a38228db75fda2d4d240bcf2049ff96e2274c87869b3690f6cab6be850ebfa. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-04 — Tensione quadrupla, non raggio quadruplo

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. B resta 1 T e U passa da 2 a 8 V. Come cambia r?

Procedimento d’autore: La tensione quadrupla rende v² quattro volte maggiore, dunque raddoppia v. Con lo stesso B raddoppia anche r: si passa da 2 a 4 m. È una dipendenza dalla radice di U, non da U al primo grado.

Formule: v_A=2\,\mathrm{m/s};  v_B=4\,\mathrm{m/s};  r_B=4\,\mathrm m.

Distrattori e controprove: Otto m segue direttamente il fattore quattro della tensione. Un m inverte il raddoppio; due ignora U e sedici introduce un’altra potenza senza legge fisica.

Hint: Applica la radice al fattore della tensione.

Fonte canonica SHA256 46bf0a7ae94d19b076c14d071552b99bd8ba1129654afcdbc04e33d63de672b1. Candidato SHA256 bf9eebde6a45e23fedd15dd5ec943d970b9e48d5ffcbb80332309bab8baaa0bd. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-05 — L’inversa torna all’energia elettrica

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Si misurano r=2 m e B=1 T. Quanto vale U in V?

Procedimento d’autore: Dalla regione magnetica ricavo v=αBr. Inserisco nell’energia v²=2αU e ottengo U=αB²r²/2. Con i dati, la rapidità è 2 m/s e la tensione è 2 V. Il quadrato riguarda sia B sia r.

Formule: v=\alpha Br;  U=\frac{\alpha B^2r^2}{2};  U=2\,\mathrm V.

Distrattori e controprove: Quattro V omette il fattore 1/2. Un V omette numericamente il quadrato di r e darebbe r=√2 m; otto V darebbe r=4 m. Nessuna inversa autorizza a uscire dal regime non relativistico.

Hint: Risolvi prima v=αBr, poi ricava la tensione dall’energia.

Fonte canonica SHA256 d96d253d2662c43259796bab420c5ca205844adfb66c4283758fcd540740d8f1. Candidato SHA256 a861ece8048099aea0b33f2dd26fda19f0acc1ed13209d62b200b951e7f84ea5. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-06 — Il modulo del campo della seconda regione

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Si misurano U=2 V e r=2 m. Quanto vale B in T?

Procedimento d’autore: La tensione dà v=2 m/s. L’inversa B=v/(αr) restituisce 1 T. Il ramo B>0 esprime un modulo: il segno della carica stabilirebbe il verso di curvatura e non un campo negativo da questa misura scalare.

Formule: v=2\,\mathrm{m/s};  B=\frac v{\alpha r};  B=1\,\mathrm T.

Distrattori e controprove: Due T copia il numero del raggio e darebbe r=1 m. Quattro T moltiplica la rapidità per il raggio invece di dividerla; −1 T non è un secondo modulo ammesso.

Hint: Decodifica la rapidità dalla tensione prima dell’inversa magnetica.

Fonte canonica SHA256 1a3b458d761d36d109cc37fca7c46a5bf1b304a7a706a36fc67bc953b50f738c. Candidato SHA256 805df53d9c3e072273ff93ab15b8eb4620a8b93ca09f6832c2b687c8720e5f91. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-07 — La stessa energia, campo doppio

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. A usa U=2 V,B=1 T. B mantiene U=2 V e usa campo di 2 T. Quanto vale r_B/r_A?

Procedimento d’autore: La tensione identica dà la stessa rapidità di 2 m/s. Il campo doppio dimezza il raggio, da 2 a 1 m: rapporto 1/2. Il campo magnetico non ha ridotto l’energia cinetica.

Formule: r_A=2\,\mathrm m;  r_B=1\,\mathrm m;  r_B/r_A=\frac12.

Distrattori e controprove: Due inverte la dipendenza dal campo. Un quarto introduce un quadrato nel confronto diretto; uno ignora B. Zero non segue da un campo finito e da una rapidità positiva.

Hint: La radice di U è la stessa e si cancella.

Fonte canonica SHA256 23c8bc6afd56237df77b9d1e7fea6188ca5597592ded6832cb6ea12ad64b03bf. Candidato SHA256 8f043630b1cbf5c39409ace6beb6abe2fb86ca017b593dc7ddaefe8fffc452ec. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-08 — Una proposta di raggio troppo grande

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Con U=2 V,B=1 T si propone r=4 m. Quanto vale proposta meno corretto?

Procedimento d’autore: Le due leggi danno r=2 m. La differenza proposta meno corretto è 4−2=+2 m. Il rapporto puro due e la differenza di energia non sono la grandezza richiesta.

Formule: r=2\,\mathrm m;  e=(4-2)\,\mathrm m;  e=2\,\mathrm m.

Distrattori e controprove: −2 cambia l’ordine; quattro copia la proposta e zero l’accetta senza controllo. Due senza unità è il rapporto fra i due raggi, non lo scarto.

Hint: Conserva il metro dopo la sottrazione.

Fonte canonica SHA256 f296fcbd1a039e64342e0e176df86861f60086b8d95b6005d82d1b4d24d17d46. Candidato SHA256 68a7b9875538bde325c3f5d397d18bfc5da8b0252a12cbf109c2a27879854a84. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-09 — L’inversa simbolica con unità coerenti

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. r e B sono noti. Quale relazione isola U?

Procedimento d’autore: Il vincolo magnetico dà v²=α²B²r². U=v²/(2α) cancella una sola α: U=αB²r²/2. Con α in C/kg questa espressione ha unità volt; il fattore due deriva dal lavoro convertito in energia cinetica.

Formule: v^2=\alpha^2B^2r^2;  U=\frac{\alpha B^2r^2}{2}.

Distrattori e controprove: αBr/2 non contiene i quadrati richiesti dall’energia. Omettere il due raddoppia U. Il reciproco ha dimensione di tensione inversa; r²/(2αB²) scambia il ruolo del campo e non isola U.

Hint: Eleva al quadrato la relazione magnetica prima di sostituire nell’energia.

Fonte canonica SHA256 b66e83fdd7b8052988e94a06d655061a6255c39b3a16952a2ad394e0e5277814. Candidato SHA256 234e50a2eb01b58d67806a9627cfaae6cb7a54b1e026941dc96a48d3396126ec. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-10 — Due fattori con una radice

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Fra prove U_B=κ₁U_A e B_B=κ₂B_A. I fattori sono positivi e i moti restano non relativistici. Quanto vale r_B/r_A?

Procedimento d’autore: La radice della tensione porta √κ₁. Il campo rimane al primo grado al denominatore e porta 1/κ₂. Il rapporto è √κ₁/κ₂. I fattori sono fra preparazioni, non campi variabili nel tempo durante una stessa orbita.

Formule: r_B/r_A=\frac{\sqrt{\kappa_1}}{\kappa_2}.

Distrattori e controprove: κ₁/κ₂ perde la radice energetica. Il prodotto rende diretto l’effetto di B; il reciproco inverte il confronto. Mettere κ₂ dentro la radice dimezza impropriamente l’esponente del campo.

Hint: Applica la radice soltanto al fattore della tensione.

Fonte canonica SHA256 def61e052dbda742a15ac821401188be11f0726476d45d427a0aed9286231c2d. Candidato SHA256 f6745135cad5c99f0bcdaa670212074ed566778df53a59c0d816db35ab5c7347. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-11 — Due cambiamenti, risultato esatto con radice

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. A ha U=2 V,B=1 T. B ha U=1 V,B=2 T. Quanto vale r_B/r_A?

Procedimento d’autore: A ha r_A=2 m. B ha v_B=√2 m/s e r_B=√2/2 m. Dividendo r_B per i 2 m iniziali si ottiene √2/4. La radice resta esatta: non serve cercarne un valore decimale.

Formule: r_A=2\,\mathrm m;  r_B=\frac{\sqrt2}{2}\,\mathrm m;  r_B/r_A=\frac{\sqrt2}{4}.

Distrattori e controprove: √2/2 è il solo fattore della rapidità e ignora B doppio. Un quarto segue direttamente la tensione invece della sua radice. 2√2 è il reciproco del rapporto corretto; uno ignora entrambi gli effetti.

Hint: Mantieni √2 simbolico fino alla fine.

Fonte canonica SHA256 205cb3b0e371b55f682f9887c8aea987ae879a94e81855dbef5dba7b6d590390. Candidato SHA256 e666624d755968de2f2a6fb95d5f8f4afaad6bfa7430d440385cf03434a3b168. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-12 — Una media con radicali esatti

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. A usa U=2 V,B=1 T; B usa U=1 V,B=2 T. Qual è la media aritmetica dei due raggi con uguale peso?

Procedimento d’autore: Le uscite sono 2 m e √2/2 m. La semisomma è (1+√2/4) m. Ai dati medi U=3/2 V e B=3/2 T si otterrebbe invece (2√3/3) m: non è la media richiesta. Nessuna approssimazione di √2 o √3 è necessaria.

Formule: \overline r=\frac{2+\sqrt2/2}{2}\,\mathrm m;  \overline r=\left(1+\frac{\sqrt2}{4}\right)\mathrm m.

Distrattori e controprove: (2+√2/2) m è la somma senza dimezzare. (1+√2/2) m dimezza solo il primo addendo. (2√3/3) m usa gli ingressi medi; zero non è la media di due lunghezze positive.

Hint: Dimezza entrambi gli addendi della somma.

Fonte canonica SHA256 1a10767b7df9d112e27bb27c9b5ccaaf6614294efbf14f2a8b6ee54d40894bd9. Candidato SHA256 8c0a0bc7a7ebf5732e6723cfd7b814d4384bf85499eb7acaeb5a090ed1d63ba8. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-13 — Il campo per il raggio bersaglio

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. A ha U_A=2 V,B_A=1 T. B usa U_B=1 V e deve dare r_B=(√2/4)r_A. Quanto vale B_B/B_A?

Procedimento d’autore: Il bersaglio è r_B=√2/2 m e la tensione nuova dà v_B=√2 m/s. Nell’inversa B=v/(αr) le due radici si cancellano: B_B=2 T, rapporto due rispetto a B_A. Non occorre calcolare √2 in decimali.

Formule: r_B=\frac{\sqrt2}{2}\,\mathrm m;  B_B=2\,\mathrm T;  B_B/B_A=2.

Distrattori e controprove: Mezzo inverte il confronto. √2/2 copia il rapporto delle rapidità, √2/4 quello dei raggi. Quattro T darebbe r_B=√2/4 m, metà del bersaglio.

Hint: Usa la stessa radice in numeratore e denominatore.

Fonte canonica SHA256 af15a83378fe7b4794837e1983490f07c71d5d7ad14e6b7957d27b90196cba89. Candidato SHA256 af40e738119f0f918f23bd393acdcefa721bc7a173b67dc192b58180362a0627. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-14 — Un display continuo può leggere un radicale

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Il display continuo adimensionale segue D=a_cal r senza offset. A:U=2 V,B=1 T,D=6. B:B=2 T,D=3√2/2. Quanto vale U_B in V?

Procedimento d’autore: Il riferimento ha r_A=2 m e fissa a_cal=3 m⁻¹. La lettura continua 3√2/2 decodifica r_B=√2/2 m, non un numero di tacche intere. Poiché r_B²=1/2 m², U_B=αB_B²r_B²/2=1 V.

Formule: a_{\rm cal}=3\,\mathrm m^{-1};  r_B=\frac{\sqrt2}{2}\,\mathrm m;  r_B^2=\frac12\,\mathrm m^2;  U_B=1\,\mathrm V.

Distrattori e controprove: Nove V userebbe D direttamente come r: il quadrato amplifica il fattore tre. Due V omette il fattore 1/2 nell’energia; mezzo V darebbe r=1/2 m, diverso dal raggio decodificato. Il radicale si elimina con un quadrato esatto.

Hint: Decodifica il raggio prima di elevarlo al quadrato.

Fonte canonica SHA256 11c3c530b2ed40fa0af9419133be18d058e8625893b329ae69611d46e3a9b259. Candidato SHA256 adf6ce1c6ced443ea6a18117fb3e55189824c38d671105b4406a791e29cf0dfa. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-15 — Due riferimenti con offset e radicale

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Il display continuo adimensionale segue D=a_cal r+b_cal. A:U=2 V,B=1 T,D=5. B:U=1 V,B=2 T,D=1+√2. C:B=1 T,D=9. Quanto vale U_C in V?

Procedimento d’autore: I raggi dei riferimenti sono 2 m e √2/2 m. La differenza delle letture è 4−√2, due volte il numero 2−√2/2 della differenza dei raggi in metri: a_cal=2 m⁻¹, b_cal=1. La lettura9 dà r_C=4 m. Quindi U_C=αB_C²r_C²/2=8 V.

Formule: a_{\rm cal}=2\,\mathrm m^{-1};  b_{\rm cal}=1;  r_C=4\,\mathrm m;  U_C=8\,\mathrm V.

Distrattori e controprove: 81/8 V omette l’offset e predice D=10. Trentadue V sottrae b ma non divide per il guadagno prima del quadrato. Sedici V omette il fattore 1/2 energetico.

Hint: Riconosci il fattore comune due senza dividere numericamente i radicali.

Fonte canonica SHA256 3006a88a9fa5b8b84b394f9fab7527fdb322f9c75e4cb50ac87f92309d7291ad. Candidato SHA256 81fd133ebf9e063125ba6b0235c0c2b1bf7c09f5bd36a7c2f74c7a242f060a67. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-accelerated-magnetic-radius-16 — Un vincolo fra tensione e campo

Una particella ideale ha rapporto α=|q|/m=1 C/kg. Parte da ferma e attraversa una regione elettrica con differenza di potenziale favorevole di modulo U>0: il lavoro del campo è |q|U. Poi entra perpendicolarmente in una regione separata con solo campo magnetico uniforme di modulo B>0. Si trascurano altre forze e radiazione; ogni preparazione e ogni inversa resta nel regime non relativistico. Si cerca il raggio positivo r nella seconda regione. Fra preparazioni U=[2 V/T]B. Si misura r=2 m. Quanto vale B?

Procedimento d’autore: Pongo u=U/(1 V)>0 e β=B/(1 T)>0. Il vincolo è u=2β; il raggio numerico soddisfa [r/(1 m)]²=2u/β². Con r=2 m ottengo 4=4/β e dunque β=1. Segue B=1 T,U=2 V, compatibili col regime dichiarato.

Formule: u=2\beta;  4=\frac4\beta;  B=1\,\mathrm T;  U=2\,\mathrm V.

Distrattori e controprove: −1 non è un modulo e renderebbe negativa anche U nel vincolo. Due T darebbe r=√2 m; quattro T darebbe r=1 m. La misura fissa il campo e non lascia una scala libera.

Hint: Usa β>0 per semplificare il quadrato al denominatore.

Fonte canonica SHA256 e81a2521219eadb48cabe652236b307ccd6a92efb143f6dcfd6ea2866f01311f. Candidato SHA256 b54afe3e68b15253a681a2d9053c68f38ec6f30e945d8ebbf272e35f5bbe01b1. Skill reale C4-L09. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 bd14886d12e2148abfb99a2cef0c209e4d996733fdd3e9ecb6baab551d6e30cd. Package file SHA256 d9177d6d43a5bd065978533c501397f641041d13e924e73ea20d81c2c2d2351d. Binding file SHA256 665b66489865a078ec120a5be2f1ee51e1d04a03fd4bab3e1002722e9a8c4f10. Prova strutturale SHA256 3fd6d51dc319bca3797c36a3b706cb5146fd8a6460692262fd1cadd5baaac8fb. Manifest asset-only SHA256 bba410756b5ff311f26b2e66e4d67377663de81e7d6378710dcc93d159bca886.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B è distinto e deve leggere i finali contro la propria primaria prima di qualsiasi firma. Prodotto UI NOT_RUN, nessun marker inventato o riusato.

Lettura geometrica dell’autore: il primo pannello è un diagramma di calcolo, non una traiettoria attraverso campi sovrapposti. I cerchi del secondo pannello hanno raggi 50 e 100 coordinate per 2 e 4 m, scala comune 25 coordinate/m. Il grafico ha x=150+80B[T], y=1280−80r[m] a U 2 V e α 1 C/kg: i tre punti esatti danno raggi 2, 1, 1/2 m per campi 1, 2, 4 T. Nessuna approssimazione grafica di radicali, interpolazione lineare o confronto tra scale di pannelli distinti.
