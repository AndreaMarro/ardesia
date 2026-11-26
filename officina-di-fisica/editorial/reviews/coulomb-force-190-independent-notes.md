# coulomb-force-190 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 190–194 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-electrostatics-190-194-primary-source-only.md, SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG ROOT confrontati con i byte finali dell’autore alla SHA 1713e2030d2b037bea9d1664d156e277fca2b4fb. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico entropy_state_review.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

Finding190-02/05: il lavoro è riferito a uno spostamento mentre non si richiede un percorso per definire l’energia potenziale di interazione; nell’inversa il valore errato1/3 μC viene da fρ/90, non dividendo perρ. Riletto il finale autore1713e2030d2b037bea9d1664d156e277fca2b4fb: soli blocchi02 e blocchi/error05 con binding corrispondenti; altri14, chiavi/formule/SVG identici. Nessun finding residuo.

## AR-u6-coulomb-force-01

Derivazione e calcolo manuale: Legge di Coulomb nel vuoto: F=kₑQq/r², modulo positivo e repulsivo per entrambe le cariche positive. Q=1 μC=10⁻⁶ C, q=10⁻⁶ C, r=3 cm=3·10⁻² m. Il numeratore è 9·10⁻³ N·m² e r²=9·10⁻⁴ m²: F=10 N. Il valore kₑ è quello assegnato dal modello, senza attribuirgli esattezza sperimentale universale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 90 perde r²; 30 usa una sola potenza; un campo N/C non è una forza. 1 N non ricostruisce il valore con i prefissi assegnati.

Didattica: Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.

Figura: Letti XML e immagine integrale: sorgenti separate240 unità intrinseche per3 cm; sola freccia repulsiva sulla Q destra. Confronto10 e5/2 N con barre320 e80; confronto10/180/95 N con barre20/360/190, origini comuni e scala distinta per pannello. Zero esterno agli assi, simboli puntiformi schematici.

Modalità EXACT_ORACLE. Risultato indipendente: `10`. Firma: `c9348f937ea15f8abd82cb0985ffdaa658faccba2a8fdfd94e083d016a3d3153`.

## AR-u6-coulomb-force-02

Derivazione e calcolo manuale: La forza ha unità N=kg·m/s². Nella legge, (N·m²/C²)·C·C/m² lascia N. Senza le alternative non si sceglie una stringa, ma questa è la dimensione necessaria. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: N/C campo, J energia, C carica e V potenziale. Il lavoro è associato a uno spostamento; energia potenziale e forza non sono identiche.

Didattica: Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `N`. Firma: `4b2fd87e5f28f285193dd21e0d1e921f66bbf4b5adb3123b5740c774fef6281a`.

## AR-u6-coulomb-force-03

Derivazione e calcolo manuale: Con x=Q/(1 μC)>0 e y=r/(1 cm)>0, F=(90 N)x/y²: 9·10⁹·10⁻⁶·10⁻⁶/10⁻⁴=90. Si conserva la distinzione fra grandezze dimensionali e i loro valori numerici. In SI resta F=kₑQq/r², non una formula che perde i prefissi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: Una potenza sola di ρ perde il quadrato; prodotto cresce con r, reciproco inverte Q; 1/90 inverte il coefficiente.

Didattica: Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.

Figura: Letti XML e immagine integrale: sorgenti separate240 unità intrinseche per3 cm; sola freccia repulsiva sulla Q destra. Confronto10 e5/2 N con barre320 e80; confronto10/180/95 N con barre20/360/190, origini comuni e scala distinta per pannello. Zero esterno agli assi, simboli puntiformi schematici.

Modalità AI_CONCEPTUAL. Risultato indipendente: `f = 90 u / ρ²`. Firma: `a82cbff7e0496f2db5d1d759192134d15afa2331080a2334d2e8f00f6c1aa1e9`.

## AR-u6-coulomb-force-04

Derivazione e calcolo manuale: A: F=90·1/3²=10 N. B: F=90·2/3²=20 N. A distanza uguale e q fisso la dipendenza da Q è lineare: la forza raddoppia e resta repulsiva. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 5 N rende inverso Q; 40 usa Q²; 10 ignora il cambio; zero non rispetta cariche positive finite.

Didattica: Confronto controllato con distinzione fra sorgente variata e totale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 10 a 20 N`. Firma: `c47bd890622e04abe59435b7552a64dd9d0513de4abc614717216cf2da3e82b9`.

## AR-u6-coulomb-force-05

Derivazione e calcolo manuale: Isolo Q=Fr²/(kₑq) in SI. Nelle unità assegnate x=(F/N)y²/90=10·9/90=1; quindi Q=1 μC. Tutti i fattori divisori sono positivi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 1/3 μC usa fρ/90 anziché fρ²/90 e predice 10/3 N; 3 μC predice30 N. Non si divide invece per ρ in questa attribuzione.

Didattica: Inversa derivata prima di sostituire; controllo del dominio positivo.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `5912ce84eb421e9e2b93c1912d50e28f762b0f61e3da37d5c9e7b9b76dcbfecf`.

## AR-u6-coulomb-force-06

Derivazione e calcolo manuale: Isolo r=√(kₑQq/F)>0. In centimetri y²=90·1/10=9, quindi y=3 e r=3 cm. La radice negativa non è una distanza; il punto r=0 è escluso dalla legge puntiforme. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 9 cm omette la radice e produce10/9 N; −3 cm non è distanza; 1/3 cm dà810 N.

Didattica: Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `29a822df4508b1754e71f57b2c696750a28ee0abaf68afe364f10fd22f991ee0`.

## AR-u6-coulomb-force-07

Derivazione e calcolo manuale: A dà 10 N; B a 6 cm dà 90/36=5/2 N. Il rapporto F_B/F_A=(5/2)/10=1/4. Raddoppiare la distanza divide per quattro, non per due. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 1/2 perde quadrato,4 inverte rapporto,1 ignora distanza e−1/4 contraddice moduli positivi.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/4`. Firma: `908b9457cb7dafc756babbc00c6f6d7a1c17ad8122ec7a6fce2bce14754820be`.

## AR-u6-coulomb-force-08

Derivazione e calcolo manuale: Il valore corretto è 10 N. Proposta meno corretto: 20−10=+10 N. Il rapporto due è una quantità diversa dallo scarto richiesto. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: −10 scambia ordine,20 copia proposta,0 la accetta e2 è rapporto privo di N.

Didattica: Ordine della differenza distinto dal rapporto e unità mantenute.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `10`. Firma: `7dfe572626f027673ae1baa574ea7a4e3390d2876e521334455ef9e55ba7dec3`.

## AR-u6-coulomb-force-09

Derivazione e calcolo manuale: Da F=kₑQq/r² segue Q=Fr²/(kₑq). Se si usano valori numerici nelle unità dichiarate, Q/(1 μC)=(F/N)[r/(1 cm)]²/90. Il risultato è positivo per F,r,q positivi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: Una sola potenza r cambia unità; reciproco ha C⁻¹; r² al denominatore non inverte legge; fattore2 è arbitrario.

Didattica: Inversa simbolica con cancellazione dimensionale e divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Q = F r² / (k_e q)`. Firma: `32ad441ca629519427dc7d5821845ee5ef317c9104e31f821f1780e7d1b0d484`.

## AR-u6-coulomb-force-10

Derivazione e calcolo manuale: Sostituisco Q_B=κ₁Q_A e r_B=κ₂r_A: F_B/F_A=κ₁/κ₂². Se le due cariche e le distanze restano nel dominio positivo, non cambia il carattere repulsivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: Quoziente senza quadrato perde una potenza, prodotto rende diretta distanza; reciproco scambia C/A; Q² non appartiene a Coulomb con q fisso.

Didattica: Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁/κ₂²`. Firma: `adabdcbe6734374056d01bfb549ea6743b2a26dadc282f9336bdb5702dc6dea8`.

## AR-u6-coulomb-force-11

Derivazione e calcolo manuale: A: F_A=10 N. B con 2 μC e 1 cm dà F_B=90·2=180 N. Il rapporto è 180/10=18: un fattore due nella carica e nove nella distanza inversa al quadrato. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 2 segue Q soltanto;9 segue soltanto distanza;6 perde il quadrato;1/18 inverte il rapporto.

Didattica: Entrambi i parametri variati ricostruiti prima del rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `18`. Firma: `df5cb54a31308c50243b7f38044903916c4dc5fd64c79f18aab56babb1a1f1df`.

## AR-u6-coulomb-force-12

Derivazione e calcolo manuale: Le uscite sono 10 e 180 N: media=(10+180)/2=95 N. Ai valori medi Q=3/2 μC e r=2 cm si avrebbe 90(3/2)/4=135/4 N, diverso. La media delle forze non è una forza ai dati medi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 135/4 N è risposta ai dati medi;190 non divide per2;85 è semidifferenza;10 ripete A.

Didattica: Media delle uscite verificata separatamente dai dati medi; prove distinte.

Figura: Letti XML e immagine integrale: sorgenti separate240 unità intrinseche per3 cm; sola freccia repulsiva sulla Q destra. Confronto10 e5/2 N con barre320 e80; confronto10/180/95 N con barre20/360/190, origini comuni e scala distinta per pannello. Zero esterno agli assi, simboli puntiformi schematici.

Modalità EXACT_ORACLE. Risultato indipendente: `95`. Firma: `7000a9d8d165e94fab0b267794e6c8c4b4b5c2f027dbb01d54520043075aa2f3`.

## AR-u6-coulomb-force-13

Derivazione e calcolo manuale: Il bersaglio è 18·10=180 N. Con Q_B=2 μC, y_B²=90·2/180=1; r_B=1 cm. Dividendo per r_A=3 cm ottengo r_B/r_A=1/3. È il ramo positivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 3 inverte1/3;1/9 è rapporto dei quadrati;2 e18 copiano fattori di Q e F.

Didattica: Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1/3`. Firma: `4b6140497aaf624d1e7a05a5cdaa0fc26348e514fd3a82aad9dba72be3c473db`.

## AR-u6-coulomb-force-14

Derivazione e calcolo manuale: Il riferimento dà F_A=10 N e lettura 30, quindi a_cal=3 per N nella stessa unità strumentale. Lettura 540 decodifica F_B=180 N. Con r_B=1 cm, Q_B/(1 μC)=180/90=2: Q_B=2 μC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 6 μC usa540 come N, ignorando gain3;1 torna ad A;18 copia rapporto di forza senza geometria.

Didattica: Display continuo decodificato prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `751e772638da74854d5893869a5059ee3049724f5fb068dcf8335b914a2e02d3`.

## AR-u6-coulomb-force-15

Derivazione e calcolo manuale: I riferimenti danno 10 e 180 N. Il guadagno è (361−21)/(180−10)=340/170=2 per N; offset b_cal=21−2·10=1. Lettura 41 dà F_C=(41−1)/2=20 N. A 3 cm, Q_C/(1 μC)=20·9/90=2: Q_C=2 μC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 41/20 μC omette offset e produce42;1 ripete A;4 rimuove b ma non a e produce81;20 copia N come μC.

Didattica: Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `f0729bf2954fe3c3cb14238288b3a0b32f76bda70463b320d41712c58b23980d`.

## AR-u6-coulomb-force-16

Derivazione e calcolo manuale: Il vincolo dimensionato è Q=γr, γ=(1/3) μC/cm, non un numero senza unità in una relazione SI. Con y=r/(1 cm)>0 si ha x=y/3 e F/N=90(y/3)/y²=30/y. Misura 10 N impone y=3: r=3 cm e Q=1 μC. Una sola distanza positiva; il fattore y cancellato non può essere zero. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.

Ipotesi e dominio: Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.

Distrattori: 1 cm dà30 N;9 cm dà10/3 N;−3 escluso e non infinite perché rimane1/ρ.

Didattica: Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `d8b72d13cb877e432c310d690a949970fc6d07ff03cc7798c800903830d1c203`.
