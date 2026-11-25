# fuse-latent-heating-216 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json. Raw SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Letti tutti 80 prompt B215–219 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 6f21e8d88c966e09e17ddf7f9e98a0819ac43b54858970010a588d6c2705fe10.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, commit e1c789beca7a747ab375993f49bc8ea85f4e5b0f. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A210–214 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L06 include nodi, P=VI=I²R=V²/R ed energia E=PΔt per potenza costante. C4-L07 definisce capacità, condensatore piano ed energia immagazzinata; C4-L04 equilibrio nei conduttori e polarizzazione. Per216 è stato riletto anche C3-L04 sul calore latente. Lezioni reali rilette integralmente, senza competenze inventate.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/fuse-latent-heating-216-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Barre energetiche2/16J lunghe40/320 dal comune x150, scala20unità/J. Grafico elettrico della sola provaA: t0..1s edE0..2J, segmento M150850L450650, scale300unità/s e100unità/J, termina al completamento della fusione e non prosegue come fase latente dopo. Barre durate1/2/3/2s lunghe160/320/240, scala160unità/s, distinta dal grafico. Temperature e frazioni fuse non sono codificate dalla lunghezza di un simbolo resistivo.

## 01 — Dall’energia al tempo

Converto anzitutto 10 mg in 1/100 g. L’energia necessaria è mL_f=(1/100)200 J=2 J. La potenza elettrica vale I²R=2 W, costante. Dunque t=2 J/(2 J/s)=1 s. Durante il cambiamento di fase l’energia modifica la frazione fusa, pur senza aumento della temperatura nel modello.

Passaggi: `m=\frac1{100}\,\mathrm g\qquad E_f=mL_f=2\,\mathrm J\qquad P=I^2R=2\,\mathrm W\qquad t=\frac{E_f}{P}=1\,\mathrm s`

Distrattori: Mille s tratterebbero 10 mg come 10 g. Due s copierebbero il numero dell’energia senza dividere per 2 W. Mezzo s dimezzerebbe ancora il rapporto corretto; non serve aggiungere mcΔT perché il filamento è già alla temperatura assegnata.

## 02 — Quale dimensione per il tempo?

mL_f è un’energia in joule; I²R è una potenza in watt. Il loro quoziente ha unità J/(J/s)=s. L’energia e la potenza sono passaggi del calcolo, mentre il risultato richiesto è una durata.

Passaggi: `[t]=\frac{\mathrm J}{\mathrm W}\qquad [t]=\mathrm s`

Distrattori: J misura energia e W=J/s potenza. A misura corrente. Ripetere J/s nel risultato darebbe una potenza, non il tempo necessario per trasferire l’energia.

## 03 — Il bilancio della sola fusione

La potenza costante trasferisce I²Rt. La fusione completa richiede mL_f, quindi t=mL_f/(I²R). Ogni mg richiede 1/5 J, mentre la potenza è 2 i² W. Il tempo numerico in secondi è perciò x/(10 i²). Il coefficiente dieci vale con le unità e i dati di questo modello.

Passaggi: `mL_f=I^2Rt\qquad t=\frac{mL_f}{I^2R}\qquad \frac{t}{1\,\mathrm s}=\frac{x}{10i^2}`

Distrattori: 10 x/i² perde il fattore cento della conversione complessiva. Il prodotto con i² renderebbe più lenta la fusione a potenza maggiore. La prima potenza i ignora Joule; l’inverso in x attribuirebbe tempi minori a più massa.

## 04 — Massa raddoppiata

L’energia di fusione raddoppia da 2 a 4 J, mentre la potenza resta 2 W. B richiede 4/2=2 s. Il tempo è lineare nella massa trasformata, perché non cambia la potenza che trasferisce l’energia.

Passaggi: `E_{f,B}=4\,\mathrm J\qquad P_B=2\,\mathrm W\qquad t_B=2\,\mathrm s`

Distrattori: Mezzo s inverte la dipendenza dalla massa. Un s ignora il cambiamento e quattro s introduce un quadrato della massa. Venti s copia il numero dei mg senza il bilancio energetico.

## 05 — La massa da una durata

Riorganizzo il bilancio in m=I²Rt/L_f. L’energia fornita è 2 J; divisa per 200 J/g dà 1/100 g, cioè 10 mg. Prima trovo una massa in grammi, poi esprimo il risultato nell’unità richiesta.

Passaggi: `m=\frac{I^2Rt}{L_f}\qquad m=\frac1{100}\,\mathrm g\qquad m=10\,\mathrm{mg}`

Distrattori: 1/100 mg confonde grammi e milligrammi. Due mg copia il numero dei joule. Duecento mg copia L_f, che è energia per massa e non massa; una massa negativa è esclusa.

## 06 — La corrente richiede la radice

La fusione richiede 2 J. Isolo I²=mL_f/(Rt)=2/(2·1) A²=1 A². Il dominio dichiara corrente positiva, quindi I=1 A. Un segno opposto potrebbe dissipare la stessa potenza, ma non soddisfa il verso positivo assegnato qui.

Passaggi: `I^2=\frac{mL_f}{Rt}\qquad I^2=1\,\mathrm A^2\qquad I=1\,\mathrm A`

Distrattori: Due A fornirebbero 8 W e fonderebbero il filamento in 1/4 s. Mezzo A darebbe 1/2 W e quattro s. Zero non trasferirebbe energia per effetto Joule; −1 viola il ramo dichiarato.

## 07 — Più corrente, meno tempo

La massa e l’energia necessaria restano uguali. Raddoppiare la corrente quadruplica la potenza, perciò il tempo diventa un quarto. A richiede un s, B 1/4 s: il rapporto è 1/4.

Passaggi: `P_B=4P_A\qquad t_B=\frac{t_A}{4}\qquad t_B/t_A=\frac14`

Distrattori: 1/2 usa una dipendenza solo lineare dalla corrente. Due e quattro rendono diretto il tempo alla corrente o alla potenza, anziché inverso. Uno ignora il cambiamento.

## 08 — Scarto di una proposta

Il tempo corretto è 1 s; la proposta lo supera di 2−1=1 s. Il numero due, senza unità, è invece il rapporto delle durate. Un processo di due s alla potenza assegnata trasferirebbe 4 J, più dei 2 J necessari alla sola fusione.

Passaggi: `t_{\rm corretto}=1\,\mathrm s\qquad \delta t=(2-1)\,\mathrm s\qquad \delta t=1\,\mathrm s`

Distrattori: −1 s inverte l’ordine. Due puro confonde rapporto e differenza, due s copia la proposta e zero non rileva l’errore. Dopo la fusione completa il modello del solo calore latente non descrive ulteriore riscaldamento.

## 09 — Isolare la massa senza perdere le unità

Parto dall’energia fornita I²Rt e la divido per l’energia necessaria per unità di massa. Si ottiene m=I²Rt/L_f. W·s diviso J/g dà grammi; se il risultato serve in mg, moltiplico la massa numerica in grammi per mille.

Passaggi: `m=\frac{I^2Rt}{L_f}\qquad [m]=\frac{\mathrm J}{\mathrm{J/g}}\qquad [m]=\mathrm g`

Distrattori: Invertire potenza e L_f non ricostruisce una massa. I al primo grado altera la dimensione; dividere per t farebbe diminuire la massa trasformata all’aumentare della durata, a potenza fissata. Il reciproco finale avrebbe dimensione di massa inversa.

## 10 — Due fattori di preparazione

La massa moltiplica l’energia richiesta per κ₁. La corrente entra nella potenza al quadrato, quindi il fattore della potenza èκ₂². Il rapporto dei tempi èκ₁/κ₂². L_f e R si cancellano perché sono gli stessi nelle due preparazioni.

Passaggi: `\frac{t_B}{t_A}=\frac{m_B}{m_A}\frac{I_A^2}{I_B^2}\qquad \frac{t_B}{t_A}=\frac{\kappa_1}{\kappa_2^2}`

Distrattori: Il prodotto rende diretto il tempo alla potenza. Una sola potenzaκ₂ perde Joule; il reciproco scambia B/A. Il quadrato della massa non nasce dal bilancio di fase, che è lineare in m.

## 11 — Entrambi i dati cambiano

B richiede otto volte l’energia di A, ma riceve quattro volte la potenza. Il rapporto dei tempi è 8/4=2: in B servono 2 s rispetto a 1 s. La corrente maggiore non basta, da sola, a concludere un tempo minore quando cresce anche la massa.

Passaggi: `t_A=1\,\mathrm s\qquad t_B=\frac{80}{10\cdot4}\,\mathrm s\qquad t_B/t_A=2`

Distrattori: Otto considera solo la massa e quattro copia il fattore della potenza.1/2 inverte il confronto; 1/4 tiene soltanto l’effetto della corrente e trascura gli ottanta mg.

## 12 — Mediare durate già calcolate

I tempi sono 1 e 2 s, perciò la media vale 3/2 s. Inserendo invece m_media 45 mg e I_media 3/2 A si otterrebbero 45/[10·(9/4)]=2 s. Il quadrato al denominatore impedisce di scambiare le due operazioni.

Passaggi: `\overline t=\frac{1+2}{2}\,\mathrm s\qquad \overline t=\frac32\,\mathrm s\qquad t_{\rm dati\ medi}=2\,\mathrm s`

Distrattori: Due s usa gli ingressi medi, tre s somma senza dimezzare e mezzo s è semidifferenza. Un s ripete A. Non si tratta di una singola corrente variabile nel tempo.

## 13 — Scegliere la corrente per un bersaglio

Dal rapporto 2=8/(I_B/I_A)² segue che il quadrato del rapporto di correnti è quattro. Le correnti sono positive, quindi il rapporto è due. In B la potenza deve crescere soltanto quattro volte per lasciare il tempo doppio.

Passaggi: `\left(\frac{I_B}{I_A}\right)^2=\frac82\qquad I_B/I_A=2`

Distrattori: Quattro omette la radice; 1/2 prende il reciproco. Otto copia il rapporto delle masse e√2 deriva dalla radice del rapporto dei tempi ignorando la massa.

## 14 — Taratura proporzionale del tempo

A richiede 1 s, dunque a_cal=3 s⁻¹. B decodifica t_B=2 s. La potenza I²R=8 W trasferisce 16 J; con L_f 200 J/g ciò fonde 16/200 g=80 mg. Il numero dello strumento non va usato come durata prima della taratura.

Passaggi: `a_{\rm cal}=3\,\mathrm s^{-1}\qquad t_B=2\,\mathrm s\qquad m_B=80\,\mathrm{mg}`

Distrattori: Usare D 6 come secondi darebbe 240 mg. Venti mg ignora il quadrato della corrente nuova e darebbe mezzo s. Otto mg perde un fattore dieci nella conversione numerica.

## 15 — Una piccola eccedenza sopra l’offset

I riferimenti hanno tempi 1 e 2 s. La pendenza è 2 s⁻¹ e l’offset uno. D_C 6/5 lascia dopo la sottrazione solo 1/5; dividendo per due si ottiene t_C 1/10 s. Con potenza 2 W occorre 1/5 J, pari a 1/1000 g=1 mg.

Passaggi: `a_{\rm cal}=2\,\mathrm s^{-1}\qquad b_{\rm cal}=1\qquad t_C=\frac1{10}\,\mathrm s\qquad m_C=1\,\mathrm{mg}`

Distrattori: Sei mg omette l’offset e predice D 11/5, non 6/5. Due mg sottrae l’offset ma non divide per il guadagno e darebbe D 7/5.1/10 mg copia il numero dei secondi come massa.

## 16 — Un vincolo fra massa e corrente

Il vincolo non rende il tempo costante, perché la massa cresce con una sola potenza di I mentre la potenza elettrica cresce con I². Ponendo i=I/(1 A), la legge diventa t/(1 s)=1/i. Il dato t 1 s impone i 1, quindi I 1 A e m 10 mg: unica coppia positiva.

Passaggi: `i=\frac{I}{1\,\mathrm A}\qquad \frac{t}{1\,\mathrm s}=\frac1i\qquad I=1\,\mathrm A`

Distrattori: Due A darebbero t 1/2 s, mezzo A darebbe 2 s e dieci A darebbero 1/10 s. Non restano infinite coppie dopo il vincolo e la durata misurata: l’equazione non è ridondante.

## Correzione visiva interna prima del commit

Il primo native mostrava una label attraversata dalla diagonale. Vecchi SVG, PNG, package, binding e structural sono archiviati con checksum in author-evidence/fuse-latent-heating-216-label-superseded-20261125. Spostata soltanto la label da y705 a y620; nuovi assembly/import e nuovo native completo realmente exit0 e riletti. Nessun credito UI prodotto, revisione indipendente NOT_RUN.

## Rilettura distinta prima del freeze

Il revisore A ha individuato due precisazioni testuali: la dipendenza inversa dalla durata va descritta a potenza fissata (09); le barre energetiche appartengono al primo pannello (01). Corretti soltanto questi testi e i binding derivati. Vecchi otto file conservati con checksum in author-evidence/fuse-latent-heating-216-peer-text-superseded-20261125. Assert strutturale: solo 01 e 09 mutati, gli altri 14 record e tutte le risposte, formule, i prompt e SVG identici. Due assembly identici e import canonico reale 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati invariati. Nessun nuovo render su SVG identico. Nuova revisione indipendente, UI prodotto e approvazione umana NOT_RUN.
