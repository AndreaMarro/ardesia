# entropy-hot-cold-187 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json, file SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Letti tutti gli 80 prompt originali 183–187 e relative ipotesi tramite allowlist id/prompt/familyId/lawFamily, senza aprire opzioni, chiavi, solutionSteps o hints sorgente. Snapshot SHA256 f5773c7d6a17f9164992df1208b93984ac156633e0eda86e351275431effc573.

Prima della scrittura dei candidati, il revisore A ha confermato la propria primaria source-only degli 80 ID, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Non ne sono stati letti i risultati dall’autore B. Le risoluzioni qui raccolte sono calcoli dell’autore e non una verifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: rilette integralmente C3-L05 «Tre vie per trasferire energia» e C3-L10 «Seguire il verso dei processi», con formule e prerequisiti reali. Le grandezze energetiche richiamano le fondazioni C3 e la potenza C1-L007 dove pertinente.

Si usa esclusivamente assemble_family e la pipeline canonica esistente, course C3/unit u5, ID AR-<sourceId>. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, nessuna pubblicazione. Le unità e la fattibilità manuale sono esplicitate nel cammino, senza presentare coefficienti di modello come costanti sperimentali esatte.

Controlli tecnici: due assembly identici, binding source/candidate/provenance verificati e import canonico in SQLite temporaneo 16→0 con 16 invariati. I 991 pubblicati restano byte identici; zero nuove teste live. Nessun PASS scientifico è dedotto da tali controlli.

UI del prodotto NOT_RUN: resta attivo lo stop dell’integratore sui nuovi replay. Lo SVG è stato letto in XML. Il rendering completo asset-only è stato letto; non attribuisce credito browser al prodotto o a un runtime. Nessun report o marker sintetico, nessun ritag di prove precedenti.

Geometria per la review, espressa soltanto qui in coordinate intrinseche SVG e non come pixel CSS: Nel secondo pannello lo zero è a x320; le barre lunghe 120 verso sinistra e 240 verso destra rappresentano −3/2 e +3 J/K, mentre il totale positivo è lungo 120: fattore comune 80 unità intrinseche SVG/(J/K). Nel terzo pannello, dalla medesima origine x130, lunghezze 240, 160 e 200 rappresentano 3/2, 1 e 5/4 J/K, al fattore comune 160. Le temperature sono dichiarate come coppie fredda/calda e non come rapporti con unità. Le frecce di calore sono schematiche, non in scala metrica.

## 01 — La sorgente fredda acquista più entropia di quanta ne perda la calda

La calda perde 600/400=3/2 J/K; la fredda acquista 600/200=3 J/K. La somma è −3/2+3=3/2 J/K, positiva. L’energia non aumenta: i 600 J ceduti sono gli stessi ricevuti, ma il loro rapporto con le due temperature assolute è diverso.

Passaggi: `\Delta S_h=-\frac{600}{400}\,\mathrm{J/K}\qquad \Delta S_c=\frac{600}{200}\,\mathrm{J/K}\qquad \Delta S_{\rm tot}=(-3/2+3)\,\mathrm{J/K}\qquad \Delta S_{\rm tot}=3/2\,\mathrm{J/K}`

Distrattori e controllo: −3/2 J/K cambia il verso del bilancio. Zero confonde conservazione dell’energia con reversibilità. 9/2 J/K somma i moduli delle due variazioni anziché i segni; 600 copia il numero dei joule in una grandezza diversa.

## 02 — L’unità del bilancio di entropia

Ogni variazione di entropia è calore con segno diviso per temperatura assoluta costante. Entrambi i termini hanno unità J/K, quindi anche la loro somma. Il fatto che i calori si compensino non cancella le diverse temperature dei denominatori.

Passaggi: `[\Delta S_h]=[\Delta S_c]=\mathrm{J/K}\qquad [\Delta S_{\rm tot}]=\mathrm{J/K}`

Distrattori e controllo: J è energia, K temperatura e W potenza. J·K deriverebbe dal moltiplicare calore e temperatura, operazione diversa dal calcolo dell’entropia. La stessa dimensione J/K di una capacità termica non identifica le due grandezze.

## 03 — Conservazione dell’energia e verso spontaneo

La fredda riceve la stessa energia che la calda perde. Tuttavia 1/T_c>1/T_h perché le temperature sono positive e ordinate. Quindi Q/T_c>Q/T_h e la differenza è positiva. L’irreversibilità produce entropia senza creare energia; l’entropia del complesso isolato seleziona il verso spontaneo.

Passaggi: `Q_h+Q_c=-Q+Q=0\qquad T_c<T_h\qquad \frac{Q}{T_c}>\frac{Q}{T_h}\qquad \Delta S_{\rm tot}=Q\left(\frac1{T_c}-\frac1{T_h}\right)>0`

Distrattori e controllo: La produzione di entropia non è creazione di energia. La sorgente fredda aumenta, non diminuisce, la propria entropia. Il modulo perso dalla calda è minore del guadagno della fredda; il bilancio del calore nullo non impone un bilancio di entropia nullo.

## 04 — Ridurre la differenza termica cambiando la fredda

La perdita della calda resta 3/2 J/K. La fredda a 300 K acquista 600/300=2 J/K, quindi il totale diventa 2−3/2=1/2 J/K. È ancora positivo perché 300<400 K, ma minore del totale iniziale. A parità di Q, temperature più vicine riducono la produzione di entropia del trasferimento.

Passaggi: `\Delta S_{{\rm tot},A}=3/2\,\mathrm{J/K}\qquad \Delta S_{{\rm tot},B}=(2-3/2)\,\mathrm{J/K}\qquad \Delta S_{{\rm tot},B}=1/2\,\mathrm{J/K}`

Distrattori e controllo: Tre J/K ignora la perdita calda e copia il guadagno freddo iniziale. Zero richiederebbe temperature uguali, non 300 e 400 K. Il segno negativo violerebbe il verso spontaneo caldo-freddo dichiarato.

## 05 — La temperatura fredda dal bilancio totale

Aggiungiamo al totale il modulo perso dalla calda: Q/T_c=ΔS_tot+Q/T_h=3/2+3/2=3 J/K. Dividendo 600 J per 3 J/K si ottiene 200 K, minore dei 400 K caldi come richiesto.

Passaggi: `\frac{Q}{T_c}=\Delta S_{\rm tot}+\frac{Q}{T_h}\qquad \frac{Q}{T_c}=3\,\mathrm{J/K}\qquad T_c=\frac{600\,\mathrm J}{3\,\mathrm{J/K}}\qquad T_c=200\,\mathrm K`

Distrattori e controllo: 400 K darebbe equilibrio e totale zero. Usare soltanto Q/ΔS_tot darebbe ancora 400 K, omettendo la perdita calda. Sottrarre tale perdita dal totale renderebbe qui il denominatore zero e non ricostruirebbe l’inversa.

## 06 — La temperatura calda richiede un denominatore positivo

La fredda acquista Q/T_c=3 J/K. Dal guadagno sottraiamo l’aumento totale: il modulo perso dalla calda è 3−3/2=3/2 J/K. La temperatura calda è 600/(3/2)=400 K. In generale l’inversa richiede 0<ΔS_tot<Q/T_c per ottenere una temperatura calda positiva e finita.

Passaggi: `\frac{Q}{T_h}=\frac{Q}{T_c}-\Delta S_{\rm tot}\qquad T_h=\frac{Q}{Q/T_c-\Delta S_{\rm tot}}\qquad T_h=400\,\mathrm K\qquad 0<\Delta S_{\rm tot}<Q/T_c`

Distrattori e controllo: Se si sommasse il totale al guadagno freddo si otterrebbero 400/3 K, meno della sorgente chiamata fredda. Un totale uguale a Q/T_c annullerebbe il denominatore e non darebbe una sorgente finita. Non si può accettare una temperatura negativa da dati incompatibili.

## 07 — Una sorgente calda ancora più calda

Il guadagno della fredda resta 3 J/K. In B la perdita calda è solo 600/600=1 J/K e il totale è 2 J/K. Dividendo per 3/2 J/K di A otteniamo 2·2/3=4/3. A parità di calore e temperatura fredda, una calda più calda perde meno entropia per joule.

Passaggi: `\Delta S_{{\rm tot},A}=3/2\,\mathrm{J/K}\qquad \Delta S_{{\rm tot},B}=(3-1)\,\mathrm{J/K}\qquad \Delta S_{{\rm tot},B}=2\,\mathrm{J/K}\qquad \Delta S_{{\rm tot},B}/\Delta S_{{\rm tot},A}=4/3`

Distrattori e controllo: 3/4 è il reciproco; 3/2 segue solo T_h. Due copia il numero della nuova entropia senza dividerla per A; uno ignora la perdita calda modificata.

## 08 — Una proposta con totale doppio

Il bilancio corretto è 3−3/2=3/2 J/K. La proposta supera questo valore di altri 3/2 J/K. Il rapporto due, pur essendo il fattore fra proposta e risultato, non è lo scarto con unità richiesto.

Passaggi: `\Delta S_{\rm tot}=3/2\,\mathrm{J/K}\qquad e=(3-3/2)\,\mathrm{J/K}\qquad e=3/2\,\mathrm{J/K}`

Distrattori e controllo: −3/2 J/K rovescia la sottrazione, 3 J/K copia la proposta e zero la accetta. Il numero puro due risponde a un rapporto invece che a una differenza.

## 09 — Isolare T_c senza perdere la perdita calda

Spostiamo il termine −Q/T_h nel membro con ΔS_tot: Q/T_c=ΔS_tot+Q/T_h. Il denominatore positivo è in J/K, quindi Q diviso quel denominatore è in K. Poiché supera Q/T_h, la temperatura ricavata è automaticamente minore di T_h e positiva.

Passaggi: `\Delta S_{\rm tot}+Q/T_h=Q/T_c\qquad T_c=\frac{Q}{\Delta S_{\rm tot}+Q/T_h}\qquad 0<T_c<T_h`

Distrattori e controllo: Q/ΔS_tot omette l’altro serbatoio. Il meno può dare un denominatore nullo o negativo e non è l’inversa del bilancio. Il reciproco ha K⁻¹; la somma finale darebbe T_c>T_h, incompatibile col nome di sorgente fredda nel modello.

## 10 — Riscalare due temperature assolute mantenendone l’ordine

I reciproci delle temperature portano gli inversi dei fattori: il guadagno freddo è Qa/κ₁ e la perdita calda ha modulo Qb/κ₂. Il rapporto con Q(a−b) cancella Q, ma mantiene entrambi i pesi. Se le due temperature sono moltiplicate per lo stesso κ, la variazione totale si divide per κ.

Passaggi: `\Delta S_A=Q(a-b)\qquad \Delta S_B=Q(a/\kappa_1-b/\kappa_2)\qquad \frac{\Delta S_B}{\Delta S_A}=\frac{a/\kappa_1-b/\kappa_2}{a-b}`

Distrattori e controllo: I quozienti semplici perdono i pesi a e b. Moltiplicare i reciproci per κ invece di dividerli tratta in modo errato una temperatura al denominatore. Il prodotto non rispetta la dipendenza inversa da un fattore comune.

## 11 — Due temperature entrambe maggiori nella seconda prova

A dà 3/2 J/K. In B il freddo acquista 2 J/K e il caldo perde 1 J/K, quindi il totale è 1 J/K. Il rapporto è 1/(3/2)=2/3. Entrambe le temperature sono cresciute di 3/2, e la differenza dei loro reciproci è diminuita del fattore inverso.

Passaggi: `\Delta S_A=3/2\,\mathrm{J/K}\qquad \Delta S_B=(2-1)\,\mathrm{J/K}\qquad \Delta S_B=1\,\mathrm{J/K}\qquad \Delta S_B/\Delta S_A=2/3`

Distrattori e controllo: 3/2 è il reciproco del confronto richiesto. Uno ignora il cambiamento delle temperature assolute; due e un mezzo non ricostruiscono i due bilanci con Q fissato.

## 12 — Media delle variazioni totali, non dei serbatoi

Le variazioni totali sono 3/2 e 1 J/K. Sommiamo 3/2+2/2=5/2 e dividiamo per due: la media è 5/4 J/K. Usando invece le temperature medie 250 e 500 K si otterrebbe 600(1/250−1/500)=6/5 J/K, diverso. Non si stanno mettendo in contatto fisico quattro sorgenti.

Passaggi: `\overline{\Delta S_{\rm tot}}=\frac{3/2+1}{2}\,\mathrm{J/K}\qquad \overline{\Delta S_{\rm tot}}=5/4\,\mathrm{J/K}\qquad \Delta S_{\rm temperature\ medie}=600\left(\frac1{250}-\frac1{500}\right)\,\mathrm{J/K}\qquad \Delta S_{\rm temperature\ medie}=6/5\,\mathrm{J/K}`

Distrattori e controllo: 6/5 J/K applica il modello alle temperature medie. 5/2 J/K non dimezza la somma; 1/4 J/K è metà della differenza e 3/2 J/K copia A.

## 13 — La sorgente calda per un totale bersaglio

Il bersaglio è 1 J/K. La fredda B acquista 600/300=2 J/K, quindi la calda B deve perdere 1 J/K. La sua temperatura è 600 J/(1 J/K)=600 K. Il rapporto con 400 K iniziali è 3/2 e l’ordine 600>300 K è rispettato.

Passaggi: `\Delta S_B=1\,\mathrm{J/K}\qquad Q/T_{h,B}=(2-1)\,\mathrm{J/K}\qquad T_{h,B}=600\,\mathrm K\qquad T_{h,B}/T_{h,A}=3/2`

Distrattori e controllo: 2/3 e 1/2 darebbero temperature calde inferiori ai 300 K freddi. Due darebbe 800 K e totale 5/4 J/K, non 1. Tre darebbe 1200 K e totale 3/2 J/K.

## 14 — Decodificare un display di entropia totale

Il riferimento ha ΔS_tot=3/2 J/K, quindi q=3 K/J. Il display B indica 1 J/K. La perdita della calda B è 1 J/K; la fredda deve acquistarne due. Quindi T_c,B=600 J/(2 J/K)=300 K, inferiore a T_h,B.

Passaggi: `q=3\,\mathrm{K/J}\qquad \Delta S_B=1\,\mathrm{J/K}\qquad Q/T_{c,B}=(1+1)\,\mathrm{J/K}\qquad T_{c,B}=300\,\mathrm K`

Distrattori e controllo: 150 K usa D=3 come se fosse già J/K e dà guadagno freddo 4 J/K. 600 K annulla il saldo totale; 400 K darebbe solo 1/2 J/K e non la lettura D=3.

## 15 — Un offset strumentale non è un termine termodinamico

I riferimenti danno 3/2 e 1 J/K. La differenza delle letture dà q=(4−3)/(3/2−1)=2 K/J; poi b=1. C ha ΔS_tot=(2−1)/q=1/2 J/K. Alla perdita calda 600/400=3/2 J/K aggiungiamo il totale: la fredda acquista 2 J/K e ha T_c=300 K.

Passaggi: `q=2\,\mathrm{K/J}\qquad b=1\qquad \Delta S_C=1/2\,\mathrm{J/K}\qquad Q/T_{c,C}=(1/2+3/2)\,\mathrm{J/K}\qquad T_{c,C}=300\,\mathrm K`

Distrattori e controllo: 240 K omette b e usa totale 1 J/K. 200 K torna al riferimento A e al display 4. 400 K darebbe totale zero e display b=1; 600 K violerebbe T_c<T_h.

## 16 — Un rapporto termico fissa la forma, il totale fissa la scala

Sostituiamo T_c=T_h/2 nella differenza dei reciproci. Il termine freddo diventa 2Q/T_h e quello caldo Q/T_h: il totale è Q/T_h. Il dato richiede T_h=600/(3/2)=400 K. Ne segue T_c=200 K, positiva e minore. La relazione non lascia infinita la scala perché il totale misurato dipende ancora da 1/T_h.

Passaggi: `\Delta S_{\rm tot}=Q\left(\frac2{T_h}-\frac1{T_h}\right)\qquad \Delta S_{\rm tot}=Q/T_h\qquad T_h=\frac{600\,\mathrm J}{3/2\,\mathrm{J/K}}\qquad T_h=400\,\mathrm K`

Distrattori e controllo: −400 K viola le temperature assolute positive. 200 K copia il valore finale della fredda e darebbe totale 3 J/K con il vincolo; 600 K darebbe 1 J/K. La misura è indipendente dal semplice rapporto fra temperature e determina una sola scala positiva.
