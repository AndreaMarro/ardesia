# C2 L007 — primaria indipendente di cinque consegne

Autore Root; reviewer author_vectors_b. Fonte installata1b72b71a68a6023ab1c9fa189733947b03029914, soli id/prompt/dati/controlli/metadati e punti neutrali. Nessun blocco, reference/chiave, package, binding o receipt della bozza0c538bad aperto. Conoscenze generali di fluidodinamica e lavoro storico sui banchi sono dichiarati. Le vecchie occlusioni delle lastre L007-03/04 rimangono visuali aperte; la presente derivazione non le risolve. Nessuna attività accredita da questa preparazione.

## SIM-C2-L007-01

Re=ρvD/η è adimensionale: (kg/m³)(m/s)m/(Pa·s), con Pa·s=kg/(m·s). La fonte assegna acqua, D=1cm=.01m ed η=.001Pa·s; la densità non è numericamente dichiarata nei campi prompt-only. Prima derivazione condizionale: Re=(10m²s/kg)ρv. Con il dato nominale di modello per acquaρ=1000kg/m³, da verificare esplicito nella bozza, Re=10000v quando v è il numero in m/s. A.15m/s→1500; a.40m/s→4000. Inversa v=Re/10000 m/s:1500→.15m/s,4000→.40m/s. Il confronto con circa2300 è diagnostico del limite laminare nel tubo diritto, non una legge universale deterministica della turbolenza. A4000 non si deve estendere automaticamente il profilo parabolico; il banco dichiara di ritirarlo. Zero velocità→Re0. I compiti richiedono un prodotto per10000, quindi manuali senza calcolatrice.

## SIM-C2-L007-02

Stazionario significa che a una sezione e posizione fisse la velocità locale non cambia nel tempo; non significa che ogni particella sia ferma o che la velocità sia uniforme nello spazio. Per ottenere il valore numerico da v_max=8cm/s e r=R/2 occorre inoltre il profilo parabolico laminare pienamente sviluppato: v(r)=v_max[1−(r/R)²]. Questa condizione va verificata nella bozza perché la sola stazionarietà non la implica. Allora v(R/2)=8(1−1/4)=6cm/s. A1s e2s la stessa sonda legge6cm/s. La misura non permette di ricavare un istante unico: funzione costante, inversa temporale non identificabile. Spostamento di una particella non va confuso col controllo del tempo della lettura euleriana.

## SIM-C2-L007-03

Fluido newtoniano con η>0, stesso gradiente dv/dy=4s⁻¹ imposto. Lo sforzo tangenziale vale τ=η dv/dy=4η; Pa·s×s⁻¹=Pa=N/m². Aη=.5Pa·s→2Pa; aη=1.5Pa·s→6Pa. Inversa η=τ/(4s⁻¹):2Pa→.5Pa·s e6Pa→1.5Pa·s. Una lastra può imporre il gradiente; per attribuire il profilo al Couette puro occorrono pressione costante lungo lo scorrimento, assenza di contributo di pressione e bordi trascurati. Non occorre confondere la forza F=τA con lo sforzo: il numero richiesto non dipende dall'area non assegnata. Vecchia freccia coperta resta un problema visivo distinto.

## SIM-C2-L007-04

Due lastre differiscono in velocità di40mm/s. Nel profilo lineare il gradiente è Δv/h. Se h viene letto in millimetri, il quoziente40/h ha unità(mm/s)/mm=s⁻¹. A2mm→20s⁻¹; a5mm→8s⁻¹. Equivalentemente.04m/s diviso.002m dà20s⁻¹, e.04/.005 dà8s⁻¹. Inversa h=40mm/s diviso gradiente:20s⁻¹→2mm;8s⁻¹→5mm. Resta h>0 nel dominio1…8mm. A salto di velocità fissato una distanza maggiore diminuisce il gradiente. Ipotesi di profilo lineare/Couette vanno rese esplicite, senza estenderlo a un arbitrario flusso con gradiente di pressione. Nessuna inferenza di visibilità.

## SIM-C2-L007-05

Tubo circolare con flusso laminare newtoniano pienamente sviluppato, simmetria assiale e aderenza alla parete: v(r)=v_max[1−(r/R)²], con v_max=12cm/s. Il controllo x=r/R è puro e0≤x≤1. A x=1/2:12(1−1/4)=9cm/s; a x=1:12(1−1)=0cm/s. Al centro x=0 si ha12cm/s. Inversa sul raggio non negativo: x=√(1−v/12);9cm/s→√(1/4)=1/2,0→1. Il risultato alla parete viene da no-slip e non da inesistenza del fluido. A x=.5 il quadrato resta1/4; usare1−x darebbe6, non9. Tutti i due compiti sono aritmetica esatta breve. La media di sezione del profilo è metà del massimo ma non è ciò che chiede questa sonda locale.

Le cinque consegne appartengono al quadro teorico C2-L007; unità e condizioni non sono dedotte da una figura. Prima delle chiavi, modello numerico in un nuovo processo senza moduli consumer. Griglia nominale razionale e rappresentazione IEEE dei passi decimali verranno tenute distinte senza epsilon.
