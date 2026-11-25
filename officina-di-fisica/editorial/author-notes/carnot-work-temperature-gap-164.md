# carnot-work-temperature-gap-164 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-02.json; SHA256 del file sorgente 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 163–167 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06, L07, L08 e L09. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Il lavoro è la differenza dei calori

Sul ciclo l’energia interna torna al valore iniziale. Entrano quattrocento joule sull’isoterma calda e ne escono duecento sulla fredda: restano duecento joule di lavoro netto. Non occorre approssimare ln 2, già incluso nel fattore assegnato c. Le adiabatiche non scambiano calore, ma ciascuna può compiere lavoro.

Passaggi: `\Delta U_{\rm ciclo}=0\qquad W=Q_h-Q_c\qquad W=c(T_h-T_c)\qquad W=(1\,\mathrm{J/K})(200\,\mathrm K)\qquad W=200\,\mathrm J`

Errori e controllo: Quattrocento J è il calore ricevuto sulla sola isoterma calda, non il lavoro netto. Sottrarre duecento kelvin da quattrocento joule sarebbe dimensionalmente scorretto: il fattore c converte il salto termico in energia.

## 02 — Un fattore in joule per kelvin

c ha unità J/K e moltiplica una differenza in K. Rimangono joule, come richiesto per un lavoro. Il simbolo W del lavoro non va confuso con l’unità watt: il watt misura potenza, ossia joule al secondo.

Passaggi: `[W]=[c][T_h-T_c]\qquad [W]=\mathrm{(J/K)K}=\mathrm J`

Errori e controllo: K misura il salto prima della moltiplicazione; J/K è l’unità del coefficiente. Pa è pressione e il watt richiederebbe dividere il lavoro per una durata, qui non assegnata.

## 03 — La legge viene dal ciclo completo

Per l’isoterma calda reversibile il calore assorbito è nRT_h ln 2. Nel ciclo di Carnot le adiabatiche collegano le due isoterme in modo che il rapporto dei volumi sull’isoterma fredda abbia lo stesso modulo logaritmico. Il calore ceduto ha quindi modulo nRT_c ln 2. Il primo principio sul ciclo ne impone la differenza, non la somma.

Passaggi: `Q_h=nRT_h\ln2\qquad Q_c=nRT_c\ln2\qquad W=Q_h-Q_c\qquad W=nR\ln2\,(T_h-T_c)`

Errori e controllo: I termini isolati descrivono un solo scambio termico. La somma attribuisce al gas anche il calore che esso cede. L’ultima espressione ha unità J/K, non J. Le adiabatiche hanno Q=0, non necessariamente W=0: il bilancio ciclico evita di confondere questi due fatti.

## 04 — Aumentare il salto, non solo T_h

La temperatura calda viene moltiplicata per tre mezzi, ma il salto cresce da duecento a quattrocento kelvin. Essendo c invariato, è il salto a controllare il lavoro: duecento e quattrocento joule. Non si applica il fattore di T_h al lavoro senza tenere conto di T_c.

Passaggi: `W_A=c(400-200)\,\mathrm K\qquad W_A=200\,\mathrm J\qquad W_B=c(600-200)\,\mathrm K\qquad W_B=400\,\mathrm J`

Errori e controllo: Trecento J moltiplica impropriamente W per 600/400. Ottocento introduce un ulteriore raddoppio; il segno negativo sarebbe incompatibile con un ciclo motore fra sorgenti ordinate come dichiarato.

## 05 — Dalla misura del lavoro alla sorgente calda

Dividendo duecento joule per un joule al kelvin otteniamo un salto di duecento kelvin. La temperatura calda è la fredda più quel salto, dunque quattrocento kelvin. La sostituzione produce nuovamente W=200 J.

Passaggi: `T_h-T_c=W/c\qquad W/c=200\,\mathrm K\qquad T_h=T_c+W/c\qquad T_h=400\,\mathrm K`

Errori e controllo: Il solo W/c è una differenza, non T_h. La somma è lecita perché prima si è convertito W in kelvin; non si sommano direttamente joule e kelvin.

## 06 — Dalla misura del lavoro alla sorgente fredda

Il lavoro fissa il salto W/c=200 K. Lo sottraiamo ai quattrocento kelvin della sorgente calda. Si ottengono duecento kelvin, positivi: per questa inversa deve sempre valere 0<W<cT_h.

Passaggi: `T_c=T_h-W/c\qquad T_c=(400-200)\,\mathrm K\qquad T_c=200\,\mathrm K`

Errori e controllo: Aggiungere il salto darebbe una sorgente detta fredda più calda della calda. W≥cT_h condurrebbe invece a T_c≤0, fuori dal dominio del modello.

## 07 — Una sorgente fredda più calda riduce W

I salti sono rispettivamente duecento e cento kelvin. Il fattore c comune si cancella: il rapporto è cento su duecento, un mezzo. Il lavoro diminuisce anche se la temperatura fredda aumenta, perché conta la distanza fra le sorgenti.

Passaggi: `W_A=200\,\mathrm J\qquad W_B=100\,\mathrm J\qquad W_B/W_A=1/2`

Errori e controllo: Tre mezzi confronta le temperature fredde anziché i salti; due scambia il numeratore col denominatore. Tre quarti usa 300/400, rapporto termico che entra nel rendimento ma non è questo rapporto di lavori.

## 08 — La proposta confonde calore e lavoro

Il valore corretto è duecento joule, perché metà dei quattrocento joule assorbiti viene ceduta alla sorgente fredda. La proposta supera il lavoro netto di duecento joule. Il segno positivo identifica la sovrastima.

Passaggi: `W=200\,\mathrm J\qquad e=W_{\rm proposto}-W\qquad e=(400-200)\,\mathrm J\qquad e=200\,\mathrm J`

Errori e controllo: Meno duecento inverte l’ordine della sottrazione. Quattrocento ripete il dato proposto, zero lo accetta e cento dimezza indebitamente lo scarto.

## 09 — Isolare T_h con un coefficiente dimensionato

Dividiamo W=c(T_h−T_c) per c>0, poi sommiamo T_c. L’unità di W/c è K, perciò la somma è omogenea. È essenziale conservare il coefficiente anche quando il suo valore numerico nelle unità dichiarate è uno.

Passaggi: `W/c=T_h-T_c\qquad T_h=T_c+W/c\qquad [W/c]=\mathrm K`

Errori e controllo: Il segno meno darebbe T_h<T_c per W>0. W/c da solo omette T_c. cW ha unità J²/K e W ha unità J: non possono essere sommati a una temperatura.

## 10 — Riscrivere entrambi i salti

Il coefficiente c è identico e si cancella. Nel numeratore rimane il nuovo salto, nel denominatore quello iniziale. Non si può separare un rapporto di differenze in una differenza di rapporti. Se κ₁=κ₂=κ, tutto il salto è moltiplicato per κ e anche il lavoro cresce dello stesso fattore.

Passaggi: `W_B=c(\kappa_1T_h-\kappa_2T_c)\qquad W_A=c(T_h-T_c)\qquad \frac{W_B}{W_A}=\frac{\kappa_1T_h-\kappa_2T_c}{T_h-T_c}`

Errori e controllo: κ₁/κ₂ darebbe uno sotto riscalamento comune e perderebbe la crescita del lavoro. κ₁−κ₂ darebbe zero per prove identiche. L’ultima formula scambia B e A; il prodotto dei fattori non rappresenta una differenza termica.

## 11 — Due sorgenti riscalate insieme

Il salto di A è duecento kelvin, quello di B trecento kelvin. I lavori sono quindi duecento e trecento joule: il rapporto è tre mezzi. Entrambe le temperature sono state riscalate dello stesso fattore; il rendimento resta uguale, ma il lavoro per questo campione aumenta.

Passaggi: `W_A=200\,\mathrm J\qquad W_B=300\,\mathrm J\qquad W_B/W_A=3/2`

Errori e controllo: Uno confonde l’uguaglianza dei rendimenti con l’uguaglianza dei lavori. Due terzi inverte il rapporto; tre e due non ricostruiscono i due salti assegnati.

## 12 — La media coincide grazie alla linearità

I lavori sono duecento e trecento joule. La loro somma è cinquecento e la metà duecentocinquanta. Qui anche le temperature medie, 500 K e 250 K, danno lo stesso lavoro: con c fisso la legge è lineare nella differenza dei due ingressi.

Passaggi: `\overline W=\frac{200+300}{2}\,\mathrm J\qquad \overline W=250\,\mathrm J\qquad c(500-250)\,\mathrm K=250\,\mathrm J`

Errori e controllo: Cinquecento J è la somma, cento la differenza. Duecento e trecento ripetono un solo riferimento. La coincidenza con il modello agli ingressi medi è motivata dalla linearità, non da una regola universale sulle medie.

## 13 — La sorgente fredda per un lavoro maggiore

Il riferimento produce duecento joule, quindi il bersaglio è trecento joule. Per il campione assegnato occorre un salto di trecento kelvin. Sottratto dai seicento kelvin caldi lascia trecento kelvin freddi; rispetto ai duecento iniziali il rapporto è tre mezzi.

Passaggi: `W_B=300\,\mathrm J\qquad T_{c,B}=T_{h,B}-W_B/c\qquad T_{c,B}=300\,\mathrm K\qquad T_{c,B}/T_{c,A}=3/2`

Errori e controllo: Lasciare T_c a 200 K darebbe W_B=400 J, non 300 J. Un rapporto due porterebbe T_c a 400 K e W_B a 200 J. Due terzi rovescia il confronto richiesto.

## 14 — Tarare il lavoro letto sul display

A produce duecento joule: seicento diviso duecento fissa q=3 J⁻¹. La lettura novecento rappresenta trecento joule, ossia trecento kelvin di salto. Sommando i trecento kelvin freddi otteniamo seicento kelvin caldi.

Passaggi: `W_A=200\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad W_B=900/q=300\,\mathrm J\qquad T_{h,B}=T_{c,B}+W_B/c\qquad T_{h,B}=600\,\mathrm K`

Errori e controllo: Novecento non è un lavoro in joule finché non si usa la taratura; inserirlo direttamente darebbe 1200 K. Trecento K sarebbe il solo salto e annullerebbe il lavoro se usato anche come T_h.

## 15 — Eliminare l’offset prima del lavoro

I riferimenti producono duecento e trecento joule. Duecento unità di lettura su cento joule fissano q=2 J⁻¹; A dà b=1. Per C, (801−1)/2 vale quattrocento joule. Il salto è quattrocento kelvin e, aggiungendo i duecento freddi, si trova 600 K.

Passaggi: `q=\frac{601-401}{(300-200)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad W_C=(801-1)/q\qquad W_C=400\,\mathrm J\qquad T_{h,C}=600\,\mathrm K`

Errori e controllo: 400 K e 500 K riprodurrebbero rispettivamente S=401 e S=601. 1200 K darebbero S=2001. 1201/2 K deriva dall’usare 801/2 senza togliere l’offset: il mezzo kelvin spurio porta S a 802, non 801.

## 16 — Un lavoro fissa una scala termica

Nel salto T_h−T_c rimane una sola T_c. La relazione diventa W=cT_c e determina quindi la scala assoluta: duecento joule divisi per un joule al kelvin danno duecento kelvin. Segue T_h=400 K. Il lavoro dimensionato, diversamente dal solo rendimento, elimina qui la libertà di riscalamento.

Passaggi: `W=c(2T_c-T_c)\qquad W=cT_c\qquad T_c=W/c\qquad T_c=200\,\mathrm K`

Errori e controllo: Cento K produrrebbero cento joule e quattrocento K ne produrrebbero quattrocento. Non ci sono infinite soluzioni perché il valore dimensionato di W e il campione fissato determinano T_c univocamente; la soluzione positiva esiste.
