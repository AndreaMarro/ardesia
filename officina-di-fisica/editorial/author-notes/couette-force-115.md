# couette-force-115 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-04.json. Letti individualmente tutti gli 80 originali 112–116 prima della scrittura, comprese le varianti concettuali 114-03, 115-03, 116-03 e l’analisi dimensionale 116-08. Riletti i testi reali delle lezioni C2-L007/L008/L009 e le loro dipendenze. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Queste sono note di calcolo per un revisore distinto.

Profilo di Couette newtoniano laminare stazionario sviluppato, aderenza alle due piastre e gradiente di pressione assente. F è il modulo della forza esterna sulla piastra superiore, opposta a quella del liquido sulla stessa piastra; non è una coppia di azione e reazione né la risultante. A/d = 10 m da conversioni SI esplicite. Il quesito 03 distingue deformazione da tasso di deformazione, con G modulo elastico di taglio definito. 12: media 50 N distinta da 45 N agli ingressi medi. 16: c = 1/2 Pa·s²/m nel vincolo η = cv, con radice positiva. SVG: distanza 180 px/mm separata dalla scala di velocità 50 px/(m/s); diagramma di forze con 5 px/N e grafico F−v a η fissata.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata; le grandezze con unità diverse non vengono confrontate con la stessa scala. Frecce su path separati, formule suddivise con law_steps. Nessun CSS, renderer o gate modificato.

## 01 — La forza che mantiene il moto della piastra

L’aderenza impone velocità nulla in basso e due m/s in alto. Il profilo lineare ha gradiente v/d. Lo sforzo viscoso vale ηv/d; moltiplicandolo per l’area si ottiene la forza. Il rapporto A/d è dieci metri, perché 0,01 diviso 0,001 vale dieci: F=20 N.

Passaggi: `d=10^{-3}\,\mathrm m\qquad A=10^{-2}\,\mathrm{m^2}\qquad \frac{A}{d}=10\,\mathrm m\qquad F=\eta\frac{Av}{d}\qquad F=20\,\mathrm N`

Errori e controllo: La forza applicata è +20 N lungo x e il liquido esercita −20 N sulla piastra, così la risultante tangenziale sulla piastra è nulla. Venti newton non sono una risultante accelerante: mantengono il moto contro il liquido.

## 02 — Dallo sforzo viscoso ai newton

η moltiplicata per il gradiente di velocità dà uno sforzo in pascal. La forza si ricava moltiplicandolo per l’area. Il tempo della viscosità si cancella con quello della velocità e la distanza fra le piastre elimina il metro del gradiente.

Passaggi: `\left[\frac{v}{d}\right]=T^{-1}\qquad [\eta v/d]=\mathrm{Pa}\qquad [F]=\mathrm{Pa}\,\mathrm{m^2}\qquad [F]=\mathrm N`

Errori e controllo: Pa è l’unità dello sforzo tangenziale, Pa·s la viscosità, m/s una velocità e N/m una forza per lunghezza. Non si deve omettere l’area per passare da sforzo a forza.

## 03 — Una forza tangenziale mantenuta nel tempo

Nel fluido newtoniano lo sforzo è proporzionale alla velocità di deformazione, non alla sola deformazione. Uno sforzo costante non nullo con η finita impone quindi un tasso non nullo: la deformazione continua a crescere. In un solido elastico ideale è invece la deformazione a essere proporzionale allo sforzo, e può restare finita in equilibrio. G>0 è il modulo elastico di taglio, in Pa.

Passaggi: `\tau=\eta\dot\gamma\qquad \dot\gamma=\tau/\eta\qquad \tau=G\gamma\qquad \gamma=\tau/G`

Errori e controllo: γ è la deformazione di taglio pura; nel fluido γ̇ ha unità s⁻¹. Un fluido può sostenere pressioni normali e può muoversi con viscosità non nulla. Qui si confrontano sforzo tangenziale e risposta nel tempo, senza attribuire scorrimento permanente al solido elastico ideale.

## 04 — Viscosità doppia allo stesso gradiente

Geometria e velocità delle piastre fissano lo stesso gradiente in entrambe le prove. Uno sforzo proporzionale a η raddoppia insieme a essa; moltiplicando per l’area invariata anche la forza esterna passa da venti a quaranta newton. La forza viscosa sulla piastra cambia di uguale modulo e verso opposto.

Passaggi: `F_A=20\,\mathrm N\qquad F_B=\frac{\eta_B}{\eta_A}F_A\qquad F_B=40\,\mathrm N`

Errori e controllo: Dieci usa una dipendenza inversa, ottanta eleva al quadrato il raddoppio e venti ignora la viscosità nuova. Zero non può mantenere il moto assegnato contro una viscosità positiva.

## 05 — Ricavare la viscosità dal dinamometro

Invertiamo la relazione mantenendo area e distanza come grandezze. Il rapporto F/v vale dieci N·s/m; moltiplicarlo per d/A=1/(10 m) dà un Pa·s. In forma numerica nelle unità SI è venti diviso il prodotto dieci per due, cioè uno.

Passaggi: `\eta=\frac{Fd}{Av}\qquad \eta=\frac{F}{(A/d)v}\qquad \eta=1\,\mathrm{Pa\,s}`

Errori e controllo: F/v da solo non è una viscosità: manca il rapporto d/A. Moltiplicare ancora per A/d produrrebbe dimensioni differenti e farebbe dipendere l’inversa dalla geometria nel verso sbagliato.

## 06 — La velocità mantenuta dalla forza

La resistenza alla velocità vale ηA/d=10 N·s/m. La forza di venti N, divisa per quel coefficiente, mantiene due m/s. L’inversa riguarda una velocità costante delle piastre, non un’accelerazione calcolata dividendo la forza per una massa.

Passaggi: `v=\frac{Fd}{\eta A}\qquad \frac{\eta A}{d}=10\,\mathrm{N\,s/m}\qquad v=2\,\mathrm{m/s}`

Errori e controllo: Venti è il numero della forza, non quello della velocità. Non si usa F=ma con F intesa come risultante: la forza esterna è bilanciata dal liquido nel regime stazionario.

## 07 — Dimezzare la velocità della piastra

Dimezzando v a distanza invariata si dimezza il gradiente e quindi lo sforzo viscoso. La forza richiesta passa da venti a dieci newton: il rapporto è un mezzo. Il quadrato della velocità comparirebbe nella potenza Fv, non nella forza chiesta qui.

Passaggi: `F_A=20\,\mathrm N\qquad F_B=10\,\mathrm N\qquad F_B/F_A=\frac12`

Errori e controllo: Due è il reciproco, un quarto descrive la scalatura della potenza in questo modello e quattro la sua inversa. Uno ignora la nuova velocità.

## 08 — Una forza applicata sovrastimata

L’area su distanza vale dieci metri e il prodotto ηv vale due nelle unità SI: la forza corretta è venti N. Quaranta meno venti dà più venti N. Se a quel moto si applicassero quaranta N senza altre forze, il bilancio tangenziale della piastra non sarebbe stazionario.

Passaggi: `F=20\,\mathrm N\qquad e=(40-20)\,\mathrm N\qquad e=20\,\mathrm N`

Errori e controllo: Meno venti cambia l’ordine, quaranta copia la proposta, zero la accetta e dieci dimezza lo scarto. Il segno positivo dell’errore non è il verso della forza del liquido sulla piastra.

## 09 — La viscosità nell’inversa simbolica

Moltiplichiamo la legge per d e dividiamo per Av, positivo. Il risultato ha unità N·m/[m²·(m/s)] = N·s/m², cioè Pa·s. Il dato d=1 mm resta una lunghezza: ometterne la conversione quando si usano metri altrove introduce un fattore mille.

Passaggi: `Fd=\eta Av\qquad \eta=\frac{Fd}{Av}\qquad [\eta]=\mathrm{N\,s/m^2}\qquad [\eta]=\mathrm{Pa\,s}`

Errori e controllo: Scambiare A e d capovolge l’effetto della geometria. v al numeratore inverte il passaggio, Av/(Fd) è viscosità inversa e Fd/A omette la velocità, con unità diverse da Pa·s.

## 10 — Due fattori nella forza esterna

La viscosità e la velocità entrano una volta ciascuna. Nel rapporto fra prove il fattore geometrico A/d si cancella, così rimane il prodotto κ₁κ₂. Entrambi i cambiamenti incidono sul modulo della forza applicata, e la forza del liquido si adegua in verso opposto.

Passaggi: `F_B=\kappa_1\eta_A\frac{A\kappa_2v_A}{d}\qquad F_B/F_A=\kappa_1\kappa_2`

Errori e controllo: Le frazioni rendono inversa una dipendenza diretta; κ₂² appartiene alla potenza, non alla forza. La somma darebbe due per prove identiche, mentre il rapporto deve valere uno.

## 11 — Viscosità e velocità entrambe maggiori

La viscosità raddoppia e anche il gradiente raddoppia. Il loro prodotto cresce di quattro: la forza passa da venti a ottanta newton. L’aumento della forza non implica accelerazione della piastra perché il liquido oppone nel nuovo regime lo stesso modulo.

Passaggi: `F_A=20\,\mathrm N\qquad F_B=80\,\mathrm N\qquad F_B/F_A=4`

Errori e controllo: Un quarto è il reciproco, due segue un solo dato e otto introduce un quadrato della velocità. Ottanta è la forza numerica finale, non il rapporto senza unità.

## 12 — La media di due forze mantenute

Le due forze sono venti e ottanta N. La somma cento, divisa per due, dà cinquanta N. Si tratta della media delle due uscite del modello, non della forza calcolata su viscosità e velocità già mediate.

Passaggi: `\overline F=\frac{20+80}{2}\,\mathrm N\qquad \overline F=50\,\mathrm N`

Errori e controllo: Cento è la somma, venticinque dimezza ancora e sessanta è la differenza. Gli ingressi medi η=3/2 Pa·s e v=3 m/s darebbero F=45 N, cinque N meno della media richiesta: il prodotto non commuta in generale con la media.

## 13 — La velocità per quadruplicare F

Il bersaglio di ottanta N è quattro volte il valore iniziale. La viscosità doppia fornisce un fattore due; ne serve un altro due dalla velocità. Quindi v_B=4 m/s e il rapporto rispetto a due è due.

Passaggi: `4=2\frac{v_B}{v_A}\qquad v_B/v_A=2\qquad v_B=4\,\mathrm{m/s}`

Errori e controllo: Un mezzo rovescia il rapporto, quattro ignora il contributo della viscosità e uno produrrebbe soltanto quaranta N. Otto farebbe crescere F di sedici volte, non quattro.

## 14 — Un display di forza senza offset

A richiede venti N, quindi il display ha guadagno tre per newton. La lettura duecentoquaranta corrisponde a ottanta N. Con A/d=10 m e v=4 m/s, la viscosità è ottanta diviso quaranta, due Pa·s.

Passaggi: `q=3\,\mathrm{N^{-1}}\qquad F_B=80\,\mathrm N\qquad \eta_B=\frac{F_B}{(A/d)v_B}\qquad \eta_B=2\,\mathrm{Pa\,s}`

Errori e controllo: Usare la lettura come forza darebbe η=6 Pa·s. Una lettura quadrupla non implica viscosità quadrupla se anche la velocità è cambiata.

## 15 — Togliere l’offset prima della viscosità

Le forze di riferimento sono venti e ottanta N. Il rapporto fra differenza delle letture e differenza delle forze dà q=2 N⁻¹ e poi z=1. La misura C equivale a quaranta N. A velocità due m/s il coefficiente geometrico dà F=20η nelle unità SI, dunque η=2 Pa·s.

Passaggi: `q=2\,\mathrm{N^{-1}}\qquad z=1\qquad F_C=40\,\mathrm N\qquad \eta_C=2\,\mathrm{Pa\,s}`

Errori e controllo: Con v=2 m/s, le viscosità 1,4,1/2,3 Pa·s produrrebbero letture 41,161,21,121. Solo due restituisce 81. Il rapporto fra letture grezze non rimuove l’offset.

## 16 — Un vincolo fra viscosità e velocità

Il vincolo trasforma la forza in una legge quadratica di v: F=c(A/d)v². Qui il prodotto c(A/d) vale cinque N·s²/m². Venti N diviso quel coefficiente dà quattro m²/s², con radice positiva due m/s. La viscosità risultante è un Pa·s.

Passaggi: `F=c\frac Ad v^2\qquad c\frac Ad=5\,\mathrm{N\,s^2/m^2}\qquad v^2=4\,\mathrm{m^2/s^2}\qquad v=2\,\mathrm{m/s}\qquad \eta=1\,\mathrm{Pa\,s}`

Errori e controllo: Quattro è il numero del quadrato della velocità. Il ramo negativo contraddice v>0 e darebbe anche viscosità negativa nel vincolo assegnato. c ha unità viscosità/velocità; il collegamento è fra prove, non una viscosità che varia nel tempo durante la singola misura stazionaria.

Correzione puntuale dopo rilievo del revisore distinto: soltanto feedback ed error.message del record 2, con binding rigenerato; chiavi, formule, SVG e le altre 15 schede rimangono identici.
