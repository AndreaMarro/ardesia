# Poiseuille C2 L008 — primaria indipendente quattro ID

Autore Root; reviewer author_vectors_b. Fonte1b72b71a68a6023ab1c9fa189733947b03029914: soli id/prompt/dati/controlli/metadati e punti neutrali. Nessun package, chiave/references, blocco, binding o receipt autore7d4e9d5e aperto. Conoscenze pregresse generali di fluidodinamica e attività storiche sui banchi sono dichiarate. La precedente revisione L007 è separata; nessuna nuova evidenza visiva, nessun Chrome o credito.

Le ipotesi di Poiseuille vanno mantenute: tubo rigido circolare rettilineo, fluido newtoniano incomprimibile in moto laminare stazionario pienamente sviluppato, aderenza alla parete; η>0,L>0,r>0. Per rapporti Q/Q₀ occorre Q₀ non nullo, per il ramo di portata positiva un salto Δp>0 comune. L'uso del modello non certifica la laminarità di ogni possibile vaso fisiologico né di un raggio aumentato a pressioni arbitrarie.

## SIM-C2-L008-01

Q=πr⁴Δp/(8ηL). Con salto di pressione, viscosità e lunghezza fissi, Q/Q₀=(r/r₀)⁴, supponendo riferimento non nullo ed entrambi i flussi nel dominio laminare. Al raggio doppio il rapporto è2⁴=16. Al raggio dimezzato è(1/2)⁴=1/16=.0625. L'area cresce come r² e la velocità media cresce anch'essa come r², perciò i fattori si moltiplicano. Inversa sul ramo positivo: r/r₀=(Q/Q₀)^(1/4),16→2 e1/16→1/2. Sono numeri puri, non mL/s né una variazione percentuale. Controllo0.5…2positivo a passi.25.

## SIM-C2-L008-02

Ogni configurazione riparte dal medesimo riferimento e cambia un solo parametro; non sono trasformazioni cumulative. Q/Q₀=(r/r₀)⁴(Δp/Δp₀)(η₀/η)(L₀/L). Raggio doppio→16;lunghezza doppia→1/2=.5, le due consegne assegnate. Gli altri controlli danno viscosità doppia→1/2 e salto di pressione doppio→2. La scelta chiamata «Pressione doppia» deve indicare il salto Δp, non pressione assoluta del fluido o due estremi raddoppiati con differenza non dichiarata. Ridurre la lunghezza non è ciò che chiede la seconda scelta. Sono rapporti puri; stesso riferimento positivo e ipotesi laminari in ciascuna prova.

## SIM-C2-L008-03

Per il capillare passivo con resistenza idraulicaR=3kPa·s/mL vale Δp=RQ. Portata2.5mL/s→7.5kPa;6mL/s→18kPa. Le unità mL/s si cancellano con s/mL. In SI R=3×10⁹Pa·s/m³;2.5mL/s=2.5×10⁻⁶m³/s e il prodotto vale7500Pa=7.5kPa.6mL/s→18000Pa=18kPa. InversaQ=Δp/R:7.5/3=2.5mL/s e18/3=6mL/s. Il banco assegna R costante, perciò basta una moltiplicazione per3 anche senza conoscere separatamente r,η,L. A Q=0 il salto resistivo è0. Non confondere salto monte−valle con pressione assoluta.

## SIM-C2-L008-04

Se δ è la variazione percentuale del raggio, r/r₀=1+δ/100. A pariΔp,η,L e riferimento positivo, Q/Q₀=(1+δ/100)⁴. Conδ−20% il fattore di raggio è4/5: quadrato16/25, quadrato successivo256/625. Moltiplica numeratore e denominatore per16 per avere4096/10000=.4096esatto. Conδ+20% il fattore è6/5:36/25, poi1296/625=20736/10000=2.0736esatto. Il secondo rapporto non è il reciproco del primo. La portata diminuisce del59.04% o aumenta del107.36%, ma il campo richiesto è il rapporto.4096/2.0736, non queste percentuali. Inversa δ=100[(Q/Q₀)^(1/4)−1] sul ramo r>0 dà−20/+20. Ripetere due quadrati e convertire il denominatore625 permette un conto manuale esatto senza calcolatrice. È sensibilità del modello rigido: non prevede direttamente una variazione emodinamica reale in vaso elastico, pulsatile o fluido non newtoniano.

La fonte e le quattro nuove consegne rimangono nel quadro C2-L008; le nuove uscite manuali frazionarie/decimali sono tenute distinte dalla sola valutazione IEEE. Il modello indipendente sarà eseguito senza alcun modulo consumer prima delle chiavi. Nessuna conclusione UI da questa primaria.
