# plane-capacitance-217 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json. Raw SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Letti tutti 80 prompt B215–219 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 6f21e8d88c966e09e17ddf7f9e98a0819ac43b54858970010a588d6c2705fe10.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, commit e1c789beca7a747ab375993f49bc8ea85f4e5b0f. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A210–214 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L06 include nodi, P=VI=I²R=V²/R ed energia E=PΔt per potenza costante. C4-L07 definisce capacità, condensatore piano ed energia immagazzinata; C4-L04 equilibrio nei conduttori e polarizzazione. Per216 è stato riletto anche C3-L04 sul calore latente. Lezioni reali rilette integralmente, senza competenze inventate.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/plane-capacitance-217-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Quattro pannelli autonomi. Primo: quote fisiche con rapporto laterale/separazione schematico esplicito, non scala geometrica comune. Secondo: materiale conduttore e campi esterni orientati destra, caricaindotta negativa a sinistra e positiva a destra, nessuna freccia all’interno. Terzo: piastre40V/0V separate2cm, frecce tutteversodestra di205coordinate, uniformità qualitativa e campo numerico derivato daΔV/d, non lunghezza della freccia. Quarto: barre100/200/150pF lunghe160/320/240, scala8/5unità/pF. Speciali03C4-L04 e08C4-L03 con prerequisite effettivi; ε10pF/m assegnata, non approssimazione diε0.

## 01 — Prima le unità geometriche

La legge è C=εA/d. Cento cm² valgono 1/100 m², mentre un mm vale 1/1000 m. Il loro rapporto è 10 m. Moltiplicando per 10 pF/m si ottengono 100 pF. L’area richiede il quadrato del fattore di conversione del centimetro; non è una lunghezza di cento centimetri.

Passaggi: `A=\frac1{100}\,\mathrm m^2\qquad d=\frac1{1000}\,\mathrm m\qquad A/d=10\,\mathrm m\qquad C=100\,\mathrm{pF}`

Distrattori: Dieci pF perderebbero un fattore dieci nel rapporto A/d. Un pF confonde area 100 cm² con 1 cm². Centomila pF usa d come 1/1000000 m, invece di 1/1000 m; la capacità non si misura in metri.

## 02 — L’unità della capacità

Per definizione C=Q/V e l’unità è il farad, F=C/V. I pF sono 10⁻¹² F e hanno la stessa dimensione. La lettera C usata come simbolo della capacità non va confusa con C come simbolo dell’unità coulomb.

Passaggi: `[C]=\mathrm{C/V}\qquad [C]=\mathrm F`

Distrattori: Il coulomb misura la carica e il volt la tensione. Il joule è energia, l’ohm resistenza. Nessuna di queste unità da sola esprime carica per tensione.

## 03 — Dentro il materiale conduttore

Se all’interno rimanesse un campo elettrico, le cariche mobili continuerebbero a ridistribuirsi: non sarebbe equilibrio elettrostatico. La ridistribuzione annulla il campo nel materiale. Il potenziale è quindi uniforme, ma il suo valore dipende dal riferimento e dalla carica del conduttore; non deve essere zero.

Passaggi: `\vec E_{\rm materiale}=\vec0\qquad \Delta V_{\rm interno}=0`

Distrattori: Potenziale uniforme non significa potenziale nullo. Un campo interno uguale a quello esterno non è in generale compatibile con l’equilibrio. Corrente continua e mobilità in atto non descrivono questo stato. Anche un conduttore carico può avere campo interno nullo.

## 04 — Area cento volte più piccola

A parità di separazione e permittività, la capacità è lineare nell’area. Il fattore d’area è 1/100, quindi C_B=(1/100)100 pF=1 pF. Non si prende una radice: il dato cambiato è già un’area, non il lato di un quadrato.

Passaggi: `C_B/C_A=A_B/A_A\qquad C_B/C_A=\frac1{100}\qquad C_B=1\,\mathrm{pF}`

Distrattori: Dieci pF tratta la variazione di area come variazione del lato. Diecimila pF inverte la dipendenza. Cento pF ignora A nuova; 1/100 pF divide per cento due volte.

## 05 — Ricostruire l’area

Isolo A=Cd/ε. Nelle unità del modello si può prima verificare C[pF]=A[cm²]/d[mm], perché 10·10⁻⁴/10⁻³=1. Perciò il valore numerico dell’area è 100·1=100 cm². La semplificazione numerica dipende dalle unità dichiarate.

Passaggi: `A=\frac{Cd}{\varepsilon}\qquad \frac{A}{1\,\mathrm{cm}^2}=100\cdot1\qquad A=100\,\mathrm{cm}^2`

Distrattori: Dieci cm² dividerebbe ancora per il dieci diε dopo aver già usato la formula numerica ridotta. Cento m² perderebbe la conversione di area. Invertire C darebbe una dipendenza opposta a quella fisica.

## 06 — La separazione dalle altre misure

Da C=εA/d segue d=εA/C. Con area 1/100 m², il prodotto εA è 1/10 pF·m. Diviso 100 pF si ottiene 1/1000 m=1 mm. La distanza è positiva e resta piccola rispetto ai dieci cm del lato se l’armatura fosse quadrata.

Passaggi: `d=\frac{\varepsilon A}{C}\qquad d=\frac1{1000}\,\mathrm m\qquad d=1\,\mathrm{mm}`

Distrattori: Cento mm copia l’area numerica; 1/100 mm omette parte delle conversioni. Un m confonde la distanza in mm con quella SI; d=0 renderebbe il modello non definito.

## 07 — Distanziare le armature

L’area e il dielettrico sono uguali, mentre il denominatore raddoppia. A ha 100 pF, B 50 pF: il rapporto è 1/2. Non è necessario sapere se il generatore è collegato per la sola capacità geometrica; quella condizione servirebbe per decidere carica e tensione dopo lo spostamento.

Passaggi: `C_A=100\,\mathrm{pF}\qquad C_B=50\,\mathrm{pF}\qquad C_B/C_A=\frac12`

Distrattori: Due rende diretta la dipendenza da d.1/4 e quattro introducono un quadrato assente; uno ignora la separazione nuova. Il campo non va sostituito alla capacità.

## 08 — Il campo fra due potenziali

Con x verso destra il potenziale diminuisce di 40 V in 2 cm=1/50 m. E_x=−ΔV/Δx=−(−40)/(1/50) V/m=2000 V/m, diretto verso destra. È il campo nello spazio tra le piastre; non il campo all’interno del metallo, che in equilibrio è nullo.

Passaggi: `\Delta x=\frac1{50}\,\mathrm m\qquad \Delta V=-40\,\mathrm V\qquad E_x=2000\,\mathrm{V/m}`

Distrattori: La sinistra inverte il verso dalla quota di potenziale maggiore a quella minore. Venti V/m divide per 2 trattando i cm come m. Zero confonde spazio tra le armature con materiale conduttore. Quaranta V/m copia la differenza senza dividere per la distanza.

## 09 — L’area nell’inversa simbolica

Moltiplico per d e divido perε: A=Cd/ε. In SI le unità sono F·m/(F/m)=m². La formula fisica conservaε anche quando una particolare scelta delle unità semplifica il coefficiente numerico.

Passaggi: `Cd=\varepsilon A\qquad A=\frac{Cd}{\varepsilon}\qquad [A]=\mathrm m^2`

Distrattori: εd/C è adimensionale; C/(εd) è anch’esso puro. ε/(Cd) ha unità m⁻², area inversa. Il prodotto Cεd ha unità F², non area.

## 10 — Due cambiamenti geometrici

La permittività non cambia. Inserendo entrambi i fattori inεA/d si ottieneκ₁/κ₂. κ₁ è già un fattore d’area, non un fattore della lunghezza laterale, quindi non va elevato di nuovo al quadrato.

Passaggi: `\frac{C_B}{C_A}=\frac{\varepsilon\kappa_1A}{\kappa_2d}\frac{d}{\varepsilon A}\qquad C_B/C_A=\frac{\kappa_1}{\kappa_2}`

Distrattori: Il prodotto rende diretta la separazione. Il reciproco inverte B/A. I due quadrati inventano dipendenze ulteriori: area e distanza sono già le grandezze effettive del modello.

## 11 — Area maggiore e distanza maggiore

Nelle unità assegnate A ha 100/1=100 pF e B 400/2=200 pF. Il rapporto è due: il fattore quattro dell’area supera il fattore due della separazione. Non si decide dal solo fatto che le piastre siano più lontane.

Passaggi: `C_A=100\,\mathrm{pF}\qquad C_B=200\,\mathrm{pF}\qquad C_B/C_A=2`

Distrattori: Quattro segue soltanto l’area e mezzo segue soltanto d.1/2 inverte il risultato; uno presume una compensazione completa che richiederebbe fattori uguali.

## 12 — Due misure, uguale peso

Le capacità sono 100 e 200 pF. La media delle uscite è 150 pF. Gli ingressi medi sarebbero 250 cm² e 3/2 mm, per i quali la capacità sarebbe 500/3 pF, diversa. La capacità non è lineare congiuntamente in area e separazione.

Passaggi: `\overline C=\frac{100+200}{2}\,\mathrm{pF}\qquad \overline C=150\,\mathrm{pF}\qquad C_{\rm dati\ medi}=\frac{500}{3}\,\mathrm{pF}`

Distrattori: 500/3 pF usa gli ingressi medi. Trecento pF somma le letture, cinquanta pF è semidifferenza e duecento pF ripete soltanto B.

## 13 — La distanza per il bersaglio

Il bersaglio è 200 pF. L’inversa nelle unità dichiarate dà d_B=400/200 mm=2 mm. Il rapporto con il millimetro iniziale vale due: il fattore quattro dell’area è parzialmente compensato dalla distanza doppia.

Passaggi: `C_B=200\,\mathrm{pF}\qquad d_B=2\,\mathrm{mm}\qquad d_B/d_A=2`

Distrattori: Mezzo inverte il rapporto. Quattro compenserebbe del tutto l’aumento d’area lasciando C invariata; uno darebbe 400 pF. Otto darebbe 50 pF, non il bersaglio.

## 14 — Taratura della capacità

A corrisponde a 100 pF, dunque a_cal=3 pF⁻¹. B indica 200 pF e non 600 pF. Con d 2 mm l’inversa numerica dà A_B=200·2 cm²=400 cm². La scala strumentale si rimuove prima dell’inversa geometrica.

Passaggi: `a_{\rm cal}=3\,\mathrm{pF}^{-1}\qquad C_B=200\,\mathrm{pF}\qquad A_B=400\,\mathrm{cm}^2`

Distrattori: Milleduecento cm² tratterebbe D come capacità. Cento cm² divide per la distanza invece di moltiplicare e darebbe 50 pF. Duecento cm² copia il numero della capacità senza il fattore d.

## 15 — Offset e una piccola area

I riferimenti sono 100 e 200 pF. La pendenza è(401−201)/(200−100)=2 pF⁻¹ e l’offset uno. D_C 3 decodifica C_C=(3−1)/2=1 pF. Con un mm di separazione l’area richiesta è 1 cm²; reinserendo si ritrova D 3.

Passaggi: `a_{\rm cal}=2\,\mathrm{pF}^{-1}\qquad b_{\rm cal}=1\qquad C_C=1\,\mathrm{pF}\qquad A_C=1\,\mathrm{cm}^2`

Distrattori: 3/2 cm² omette l’offset e predice D 4. Due cm² non divide per il guadagno dopo aver sottratto uno e predice D 5. Tre cm² usa direttamente D come area e predice D 7.

## 16 — Una misura ridondante

Il vincolo fissa A/d e quindi fissa C. Per esempio(100 cm², 1 mm) e(200 cm², 2 mm) danno entrambe 100 pF. Restano infinite coppie continue nel regime ideale; il requisito geometrico d piccolo rispetto ai lati va mantenuto e non autorizza separazioni arbitrariamente grandi a parità del vincolo.

Passaggi: `\frac{A}{1\,\mathrm{cm}^2}=100\frac{d}{1\,\mathrm{mm}}\qquad C=100\,\mathrm{pF}`

Distrattori: Una o due coppie confondono esempi con l’insieme continuo. Nessuna contraddirebbe gli esempi. I due ingressi non sono indipendenti: il rapporto è vincolato. Il limite d 0 non è una geometria fisica ammessa.
