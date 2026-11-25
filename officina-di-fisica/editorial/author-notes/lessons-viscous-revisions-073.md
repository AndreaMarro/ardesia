# C2-L007: ipotesi del profilo nel tubo

Autore root, fonte Cric5d1dc8dc/C2.json v1, letta integralmente; nuova v2/base1.
Il revisore distinto ha fornito un controesempio a profilo parabolico/media centrale
senza stazionarietà. Ho verificato direttamente l'equazione e la pagina43 delle
[note University of Iowa](https://stern.lab.uiowa.edu/sites/stern.lab.uiowa.edu/files/2024-12/Chapter%203%20%285%29_2024_final-fs-cm__pagenumber.pdf#page=43),
che considera il moto non stazionario pienamente sviluppato. Non si trasferisce
la soluzione avanzata con funzioni di Bessel nel compito dello studente.

Controesempio costruito dal reviewer: v=a(t)(R²−r²)+b(R⁴−r⁴),a0,b>0,
a'=16ηb/ρ e gradiente motore G=4ηa+16ηbR². Il laplaciano radiale è−4a−16br²;
la governante rho·dtv=G+eta·lapv dà residuo esattamente zero, no-slip v(R)=0,
derivata radiale regolare all'asse e nessuna dipendenza assiale. La media d'area
èaR²/2+2bR⁴/3, il valore centrale dimezzato aR²/2+bR⁴/2: scarto bR⁴/6 non nullo.
Coefficienti e intervallo finito possono essere scelti con piccolo Reynolds.
Questo è un controllo scientifico privato, non un calcolo richiesto allo studente.

La nuova lezione dichiara stazionarietà, pieno sviluppo, fluido Newtoniano
incomprimibile con eta/rho costanti, tubo circolare orizzontale, pareti ferme,
aderenza e assenza di effetti d'ingresso. L'asse segue il moto e vmax>0.
Laminare non diventa sinonimo di stazionario: il transitorio d'avviamento rimane
fuori dal modello parabolico stabilito. Si preserva il testo originale sulle
transizioni, senza imporre una soglia universale di Reynolds.

Conti manuali nuovi: Couette4mm/s su2mm dà2s⁻¹,con2Pa·s dà4Pa; r/R=1/2 produce
3vmax/4. L'integrale delle corone pesa2πrdr, eliminaπ e dàvmax/2; non si media
lungo un solo diametro. Tutte le uguaglianze sono blocchi espliciti, non liste
passate allo splitter. La figura storica C2-profilo è stata lettaXML/render e
copiata da Git byte per byte, registrata come asset con checksum; fonte statica
pubblicata immutata. Nessuna figura nuova è necessaria per cambiare l'ipotesi.

Controlli autore: import1, ripetizione0/1,991pubblicati/storia/live invariati su
SQLite temporaneo;3anteprime1440/768/320 PASS con asset guest403 e protocollo
b77d9036, nessuna formula fuori misura. Revisione scientifica distinta assegnata;
nessuna approvazione propria/umana o pubblicazione.
