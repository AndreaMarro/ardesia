# Riesame indipendente · metadati e metodo

Revisore AI: integratore del corpus, distinto dall’autore dei contenuti originali.
Sono stati letti integralmente i sei record di catalogo e i dieci record di metodo
del commit `5d1dc8dc7b601aef959d10d564c75462be74708d`. Nessun testo di questi record
è stato generato o riscritto dal revisore. I sedici digest della lettura sono
congelati nel verificatore; un cambiamento del testo invalida il giudizio anche
se la risposta originaria rimane uguale. Non si tratta di approvazione umana.

| ID | Risoluzione e controllo indipendenti |
|---|---|
| C1 | Solo titolo, riassunto e nomi dei banchi. Nessun compito quantitativo; il giudizio non si estende alle risorse collegate. |
| C2 | Solo metadati su fluidi e condotti. Nessun calcolo, pressione o raggio numerico richiesto. |
| C3 | Solo metadati su calore, gas e macchine. Nessuna attività di calcolo incorporata nel record. |
| C4 | Solo metadati su campi e reti. Nessuna chiave o formula da applicare. |
| C5 | Solo metadati su onde, ottica e nuclei. Nessun dato quantitativo da elaborare. |
| C6 | Contenitore dei cinque corsi: riferimenti C1–C5 controllati, nessun esercizio incorporato. Non equivale a certificare il corso completo. |
| C1-M-formula | F risultante=ma in riferimento inerziale; a≠0. Dividere per a dà m=12/3=4 kg. La verifica 4·3=12 e N/(m/s²)=kg esclude le operazioni proposte errate. |
| C1-M-graph | Retta da v=2 a6 m/s in4 s. Ordinata finale6; pendenza4/4=1 m/s². Area: rettangolo8 più triangolo8=16 m. L’area è spostamento e qui anche distanza perché v≥0. |
| C2-M-formula | Equilibrio idrostatico, rho e g costanti. Sottrarre100 kPa da130 kPa prima di dividere:30000/10000=3 m. L’inversa (p−p0)/(rho·g) e Pa/(Pa/m)=m sono verificate separatamente. |
| C2-M-graph | Il grafico è della pressione relativa:30/3=10 kPa/m. A4 m si aggiungono40 kPa; solo dopo si somma p0=100, ottenendo140 kPa assoluti. |
| C3-M-formula | Modello dichiarato di gas ideale, p e T assolute. pV=nRT⇒T=pV/(nR). kPa·L=J. Cancellare8,31 tra numeratore e denominatore riduce il calcolo a200/2=100 K. Non serve una moltiplicazione decimale. |
| C3-M-graph | Segmento isobarico a3 kPa da2 a6 L, nel modello quasistatico del diagramma. ΔV=4 L; lavoro positivo del gas=3·4=12 J. Usare l’area da V=0 darebbe un risultato diverso e scorretto. |
| C4-M-formula | Resistore ohmico e I≠0: IR=U⇒R=U/I. 0,30=3/10, dunque6/(3/10)=20 Ω. La conduttanza A/V è distinta dalla resistenza V/A. |
| C4-M-graph | U è ascissa e I ordinata. Il punto(6,3) dà pendenza3/6=1/2 S. Scambiando gli assi si ottiene6/3=2 Ω. Le due pendenze non hanno la stessa unità. |
| C5-M-formula | Tre creste al secondo danno frequenza3 Hz. Ogni ciclo occupa12/3=4 m. (m/s)/(1/s)=m; l’inversa è λ=v/f con f>0. |
| C5-M-graph | Fotografia spaziale: ampiezza2 cm e λ=5−1=4 m. Misura temporale: T=2,5−0,5=2 s. La propagazione valeλ/T=2 m/s; l’ampiezza non entra nel rapporto. |

Tutte le operazioni richieste sono eseguibili a mano; i passaggi del verificatore
controllano anche le risposte intermedie, non soltanto quella finale. SymPy risolve
le cinque inverse da equazioni indipendenti; Pint verifica unità e conversioni;
Fraction evita approssimazioni numeriche. I test alterano un testo lasciando la
chiave invariata, una risposta numerica e una formula, e richiedono il rifiuto.

La sequenza didattica esistente separa scelta dell’incognita, operazioni inverse,
sostituzione e unità; nei grafici distingue lettura, pendenza e area. Non sono
emersi difetti concreti che richiedano una nuova edizione di questi sedici record.
Le lezioni, gli esempi e i laboratori collegati restano da esaminare individualmente.

Il consumer canonico dei dieci percorsi è già esercitato in `tests/browser-metodo.mjs`,
invocato dal journey esistente, con errore, suggerimento, risposta equivalente,
stadi dei diagrammi, conclusione e ripartenza. La CI post-merge di `b0642d87`
(run Officina `45459580658`) è terminata con successo. Questo è collaudo tecnico
dell’applicazione invariata, distinto dal riesame scientifico qui documentato.

Stati: `humanApproval=NOT_RUN`, `publicationAction=NONE`, edizioni originali
conservate. Non è rivendicata certificazione WCAG completa o validazione UDL/DSA/ADHD
con studenti. Il riesame dei sei contenitori è esplicitamente privo di calcoli e
non incrementa il numero dei quesiti scientifici riscritti.
