# Revisione indipendente — plane-mirror-ray-direction-261

Tutti i 32 prompt originali derivati nella primaria d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d congelata 46b0e987 prima di opzioni/chiavi/candidati. Modelli propri scritti da quella primaria prima dell’esposizione incidentale beta60 via ps argv, ma eseguiti/congelati bbda8bd4 dopo il frammento; non si attribuisce piena cecità a quell’esecuzione. Primaria immutata, modello non modificato dal frammento e disclosure completa conservata.

Successivamente tutti32 record letti integralmente:prompt,alternative,blocchi,formule,hint,error/feedback e metadata. Il262 passa da altezze originali in cm a nuova parametrizzazione in mm e da vincolo p/4 a p/40 con stesse unità: ho ricalcolato individualmente tutti16, senza trattare il nuovo coefficiente come una semplice conversione dell’originale. I risultati numerici coincidono ma le grandezze fisiche differiscono; unità ricontrollate con Pint/Fraction. Le lezioni reali C5-L09/L10 sono state lette integralmente; nessun modulo autore né primaria B sono stati aperti.

Entrambi gli SVG XML e due nuovi PNG nativi indipendenti completi 640×1740 effettivamente letti dopo due child 0. Geometrie,semipiani dei raggi,scala delle altezze e limiti delle curve controllati. Nessun finding candidato emerso,nessuna mia modifica ai candidati. UI prodotto NOT_RUN,human NOT_RUN,DRAFT,publicationAction NONE e integrazione ROOT PENDING.

## AR-u7-plane-mirror-ray-direction-01

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Con φ=45° e α=30°, quanto vale β in gradi?

Derivazione e conti manuali: Le direzioni α e β sono quelle dei vettori di propagazione rispetto allo stesso asse, non gli angoli dalla normale. Riflettere il vettore (cosα, sinα) rispetto alla retta di direzione φ dà (cos(2 φ−α), sin(2 φ−α)); con φ 45° e α 30° risulta β 90°−30°=60°. I raggi fisici incidente e riflesso rimangono dallo stesso lato dello specchio: il segmento incidente prima del punto ha verso opposto al suo vettore di propagazione. L’angolo d’incidenza dalla normale è 75°, non 15°.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 60°=90°−30°.30 confonde azimut e angolo normale, 15 èφ−α, 75 angolo normale, 120 falsa simmetria.

Figura: XML letto integralmente e nuovo native completo 640 × 1740 effettivamente letto dopo child 0. Incidente delta(90√3, −90) e riflesso(90, −90√3) in coordinate schermo, lunghezze 180:direzioni 30° e 60° da+x. Specchio slope−1 schermo/45° cartesiano, normale ortogonale slope+1; i raggi fisici stanno nello stesso semipiano, incidenza/riflessione 75°. Label finale beta 60 letta interamente, non assunta dal frammento argv. Barre 180/315/247.5 per 60°, 105°, 165/2° alla scala 3 comune. Grafico soloα 30°:x 150+4 φ, y 1530−2 β; punti(45, 60), (60, 90), bordi(30, 30), (90, 150) aperti. Non attribuisce 105° diα 15° alla curva diα 30°.

Esito indipendente: 60. Fonte SHA256 afc116ba11f31aff4874a8fe2933d023e050ec88e494cad1d3d2a754d3879044. Candidato SHA256 5cf053333342021f39bee25f63e65868200bb089e0da3e0902076e63ceb7e533. Firma sulla sola edizione letta: 5feb502f4f2c72f20e4f4bf6ed961532c7f8e467a7b1e625c54a086d14845463.

## AR-u7-plane-mirror-ray-direction-02

Quale indicazione può esprimere l’angolo direzionale β di un raggio rispetto a un asse?

Derivazione e conti manuali: β è un angolo direzionale: si può esprimere in gradi, o in radianti con conversione coerente. È distinto da un seno, che è puro. Nessuna alternativa è stata aperta in questa primaria; il confronto con le cinque opzioni sarà successivo. Dopo la freeze tutte le cinque opzioni sono state effettivamente lette; la prima derivazione rimane immutata.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: Gradi è scala angolare; cm lunghezza, s tempo, J energia, Bq attività. Radiani sarebbero compatibili ma non offerti come alternativa.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: gradi. Fonte SHA256 981cbc35e7c01981939e09888e68e9529ddb06274b1aae03f541d58a79065389. Candidato SHA256 8714256ac31b54c3c98b40334a2cbd6286dc5cc635bf376f3afc860ff6d8ce42. Firma sulla sola edizione letta: 22c701769fbcc7664cf0f5d35e1ab631d2c282032db1571b184f4da3f622e555.

## AR-u7-plane-mirror-ray-direction-03

Caso autonomo: un raggio si riflette su uno specchio piano ideale. θ_i e θ_r sono gli angoli non orientati fra i raggi e la normale nel punto d’incidenza, nello stesso piano. Quale relazione è corretta?

Derivazione e conti manuali: Gli angoli di incidenza e riflessione sono uguali se entrambi misurati dalla stessa normale al piano nel punto di contatto. Il raggio incidente va verso il piano e quello riflesso se ne allontana. Uguaglianza degli angoli dalla normale non equivale a uguaglianza delle direzioni orientate rispetto a un asse esterno.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: θ_r=θ_i dalla stessa normale. Raddoppio e metà non leggi generali; somma 90° solo se entrambi 45°; superficie non normale richiesta.

Figura: XML letto integralmente e nuovo native completo 640 × 1740 effettivamente letto dopo child 0. Incidente delta(90√3, −90) e riflesso(90, −90√3) in coordinate schermo, lunghezze 180:direzioni 30° e 60° da+x. Specchio slope−1 schermo/45° cartesiano, normale ortogonale slope+1; i raggi fisici stanno nello stesso semipiano, incidenza/riflessione 75°. Label finale beta 60 letta interamente, non assunta dal frammento argv. Barre 180/315/247.5 per 60°, 105°, 165/2° alla scala 3 comune. Grafico soloα 30°:x 150+4 φ, y 1530−2 β; punti(45, 60), (60, 90), bordi(30, 30), (90, 150) aperti. Non attribuisce 105° diα 15° alla curva diα 30°.

Esito indipendente: θ_r = θ_i. Fonte SHA256 26e64a89d399d341b2f519cf017b93ad848c0b5bf1a630c427c3b328efdfe7a0. Candidato SHA256 9743a595648298a3990c098d0c424f5bc6b2e1ef31b1f84f7781a09cdb788970. Firma sulla sola edizione letta: 7b31465fde338104262c9efb2f12e0c9014b486a26893fe972b9636f2f489e69.

## AR-u7-plane-mirror-ray-direction-04

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. A usa φ=45°,α=30°; B usa φ=60° e lo stesso α. Come cambia β?

Derivazione e conti manuali: A:2·45°−30°=60°. B:2·60°−30°=90°. Ruotare la retta dello specchio di 15° a α fisso ruota il raggio riflesso di 30°; non si moltiplica automaticamente β per il rapporto 60/45.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 60→90°.75 aggiunge solo 15°, 120 ometteα, 60 ignora rotazione, 45 verso opposto.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: Da 60° a 90°. Fonte SHA256 df52fbe7e1e2027de3e1fe029913e976e32feb9a86401de39c6db11272c387a2. Candidato SHA256 561f74c9d2762f51ff42073fe02a06fa1139adca9bc33eea8049cba4bd0ae12c. Firma sulla sola edizione letta: 1cba9c0fb07d96d6d69e023120bc67c9460b45b73e40987ac404fc384ad1e30a.

## AR-u7-plane-mirror-ray-direction-05

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Si conoscono β=60° e α=30°. Quanto vale φ in gradi?

Derivazione e conti manuali: β+α=2 φ, dunque φ=(60°+30°)/2=45°. Controllo 0<30°<45°<90° e 2·45°−30°=60°.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: φ(60+30)/2=45°.15 semidifferenza, 90 somma non dimezzata/bordo escluso, 30 copialettura radente.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 45. Fonte SHA256 2cbf37283cf9ab31d86b827a0d4f2ad74f9f76a18e817aac6e8987bf44788623. Candidato SHA256 788527f27374a7a757bb1d84e92b0345036238826d7a06d81630fa970327c35a. Firma sulla sola edizione letta: 251100486d9deaa0e41180246b195d390f23298eb6fd9da668cd2f7e569f97e8.

## AR-u7-plane-mirror-ray-direction-06

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Sono assegnati φ=45° e β=60°. Quanto vale α in gradi?

Derivazione e conti manuali: α=2 φ−β=2·45°−60°=30°. Il risultato rispetta 0<α<φ; invertire l’ordine delle sottrazioni produrrebbe il ramo errato.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: α 90−60=30°.150 somma, −30 ordine, 15 dimezzamento extra, 210 vettore di propagazione invertito.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 30. Fonte SHA256 a43ed37d24fe3bec417561328dc317764ee7dc203358b0c92704d7918d22fe18. Candidato SHA256 8305325a7d9a7f4a2cd11abb9c6527edcb92b31085ebd0c3782812dc31119224. Firma sulla sola edizione letta: 9292589f6d2bfe31913dc1c7811eda2b80148b1351eb18d70e68bd054b98ba62.

## AR-u7-plane-mirror-ray-direction-07

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. A ha φ=45°,α=30°; B mantiene φ e usa α=15°. Quanto vale β_B/β_A?

Derivazione e conti manuali: A:β 60°. B:β 2·45°−15°=75°. Rapporto 75/60=5/4, puro. Dimezzare α non dimezza β perché 2 φ resta un contributo additivo.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 75/60=5/4.4/5 reciproco, 1/2 soloα, 2 inverso fattore diα, 1 ignora.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 5/4. Fonte SHA256 aa9fe0045a2ae29b21fabc0382924da2d4a4cbe954686092a0954477d11c1591. Candidato SHA256 33032f1ff309d7ac90cb3ba43d54e7511e06f38260b9ad7872355fd2a6ae6219. Firma sulla sola edizione letta: 0c4328112873258df4cd11228f1f01441a77a5b8ced88edab50624fb2b9568eb.

## AR-u7-plane-mirror-ray-direction-08

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Per φ=45°,α=30° viene proposto β=120°. Quanto vale proposto meno corretto, in gradi?

Derivazione e conti manuali: β corretto 60°, proposta 120°: proposta meno corretto+60°. Il rapporto 2 non risponde alla domanda sullo scarto angolare.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 120−60=60°.−60 ordine, 120 proposta, 2 rapporto puro, 0 simmetria non controllata.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 60. Fonte SHA256 eab573621acd94a1b398ebb9e44bc05e6524511838dd76cdc0861426413a5bdc. Candidato SHA256 fef7411d97a844952e0fece24274df3fa3eae0c9da5d69ad4c2005b7cf51fac9. Firma sulla sola edizione letta: c64998c260d7f869baa582b035286cef147f1a65803be43db2820f2791a16dd0.

## AR-u7-plane-mirror-ray-direction-09

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Con α e β note, quale formula ricostruisce φ?

Derivazione e conti manuali: β=2 φ−α→β+α=2 φ→φ=(β+α)/2. Inversa fisica:0<α<(β+α)/2<90°, equivalente nel ramo a β>α e β+α<180°. La positività da sola non basta.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: (β+α)/2 conβ>α eβ+α<180°. Differenza non inversa, somma non dimezzata, 2 β−α altra legge, α/β puro.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: φ = (β + α) / 2. Fonte SHA256 ced5af2e6df38c04c75bca945df914e5517fb942d3080116f1845623a6a7aec2. Candidato SHA256 bef5c7e3da37454169664c227ff3238ea54051273f138fcb337cba910931f65a. Firma sulla sola edizione letta: 11c70694d6e41f7fef6a12965a9a89f9e5eb23648b81838d9f704897ac6f3cfb.

## AR-u7-plane-mirror-ray-direction-10

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Fra A e B:φ_B=κ₁φ_A e α_B=κ₂α_A; entrambe le prove mantengono 0<α<φ<90°. Qual è β_B/β_A?

Derivazione e conti manuali: β_A=2 φ−α e β_B=2 κ₁φ−κ₂α. Rapporto(2 κ₁φ−κ₂α)/(2 φ−α), denominatore positivo. Occorre ancora 0<κ₂α<κ₁φ<90°; una trasformazione dei dati non cambia φ durante una singola prova.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: (2 κ₁φ−κ₂α)/(2 φ−α). Rapporti/prodotti soli fattori perdono pesi; segni più cambiano legge, somma fattori 2 per prove identiche.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: (2κ₁φ − κ₂α) / (2φ − α). Fonte SHA256 c9efe7980912d90e116cefefab8d06174cd1b15b74ab7a46a2cda62a7ab84a88. Candidato SHA256 e52956d373f7a116e8265b993617d63bc5b4678cc1403d0ec4d67b4c7e6b169e. Firma sulla sola edizione letta: edad3ce22a492260f84b4ecffb76a4b42fda16541683dab497495297b0c3cd18.

## AR-u7-plane-mirror-ray-direction-11

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. A ha φ=45°,α=30°; B ha φ=60°,α=15°. Quanto vale β_B/β_A?

Derivazione e conti manuali: A:β 60°. B:β 120°−15°=105°. Rapporto 105/60=7/4. Non è né il rapporto degli specchi 60/45 né quello delle incidenze 15/30.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 105/60=7/4.4/7 reciproco, 4/3 soloφ, 1/2 soloα, 2 non dà 105°.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 7/4. Fonte SHA256 decba823b3e464cd62a838b0a959712f91d89318756bd1bf63477a2608aec3e9. Candidato SHA256 18f0b43edb5a1963cea5f4b768cef7e8a5519f4102fff1766f7f84ef16233fe4. Firma sulla sola edizione letta: f60ac9effc1da7e8da544e4e198c2dee7151ee0f22ccfafa6215aa1e867f8292.

## AR-u7-plane-mirror-ray-direction-12

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. A ha φ=45°,α=30°; B ha φ=60°,α=15°. Qual è la media aritmetica delle due β, in gradi?

Derivazione e conti manuali: Media delle letture(60°+105°)/2=165°/2. Qui coincide con la risposta agli ingressi mediφ 105°/2, α 45°/2:2·105°/2−45°/2=165°/2. La coincidenza dipende dall’affinità della legge nelle direzioni srotolate. Non si applica senza convenzioni a una media circolare che attraversi 360°.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: 165/2°; 165 somma, 45/2 semidifferenza, 60 e 105 singole letture. Affinità spiega coincidenza con medie degli ingressi.

Figura: XML letto integralmente e nuovo native completo 640 × 1740 effettivamente letto dopo child 0. Incidente delta(90√3, −90) e riflesso(90, −90√3) in coordinate schermo, lunghezze 180:direzioni 30° e 60° da+x. Specchio slope−1 schermo/45° cartesiano, normale ortogonale slope+1; i raggi fisici stanno nello stesso semipiano, incidenza/riflessione 75°. Label finale beta 60 letta interamente, non assunta dal frammento argv. Barre 180/315/247.5 per 60°, 105°, 165/2° alla scala 3 comune. Grafico soloα 30°:x 150+4 φ, y 1530−2 β; punti(45, 60), (60, 90), bordi(30, 30), (90, 150) aperti. Non attribuisce 105° diα 15° alla curva diα 30°.

Esito indipendente: 165/2. Fonte SHA256 c48b97775454954ba617897446582e250ba7acb21706daf0b4cc2c52e721c9c2. Candidato SHA256 d6c3a3fd006c2941956a74266381669882d22c9eddf1b15516214e559e044e3d. Firma sulla sola edizione letta: 78a7d3fcb736481fb803effda82da643e6dd5167b11414657862b1cea505e37c.

## AR-u7-plane-mirror-ray-direction-13

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. A usa φ=45°,α_A=30°. In B si fissa φ=60° e si vuole β_B=(7/4)β_A. Quanto vale α_B/α_A?

Derivazione e conti manuali: Targetβ_B=(7/4)60°=105°. Fissatoφ_B 60°, α_B 120°−105°=15°. Rapportoα_B/α_A 15/30=1/2; α_B resta tra zero eφ_B.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: Target 105°, α_B 120−105=15°, rapporto 1/2.2 reciproco, 7/4 e 4/7 uscite, 1 darebbeβ 90°.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 1/2. Fonte SHA256 2073eb74b864da637144a405ab7db79f75f7a575c9e50b252fa4240e01f845a5. Candidato SHA256 f02e9d7ff8881b93580b4ab5ac4e89b6cbfaa97e12358f0eab9f80c409e316e3. Firma sulla sola edizione letta: 6d318f1c1c861022b75141e8bde02694134eb68b1e30158fe1f148bc4d89c0e5.

## AR-u7-plane-mirror-ray-direction-14

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. D=gβ senza offset legge 180 quando φ=45°,α=30°. Poi legge 315 con α=15°. Quanto vale il nuovo φ in gradi?

Derivazione e conti manuali: Riferimentoβ 60° e display 180 danno guadagno 3 per grado. Nuovo display 315→β 105°; conα 15° ottengoφ=(105°+15°)/2=60°. La taratura va tolta prima dell’inversa ottica.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: g 3 grado⁻¹, D 315→β 105°, φ 60°.165° usa display comeβ e viola settore, 45 vecchia retta, 105 solaβ.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 60. Fonte SHA256 4edf87ec458dd2a92f7f07320f23eba44f96b9e2ca59e570f1de3730cc949f94. Candidato SHA256 6122aa76d29f0fbe3574f0197c5944755ae2404d2f07fed8d5684488a44f589f. Firma sulla sola edizione letta: a8e4e882fdaba9ee7fa1ffb39b5a6005e8ba0f0f2c2b7dab00dd3ce292015035.

## AR-u7-plane-mirror-ray-direction-15

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. D=gβ+b. A:φ=45°,α=30°,D=121. B:φ=60°,α=15°,D=211. C:α=30°,D=181. Quanto vale φ_C in gradi?

Derivazione e conti manuali: Riferimentiβ_A 60°, β_B 105°: g=(211−121)/(105−60)=90/45=2 per grado; b 121−2·60=1. C:β=(181−1)/2=90°; φ=(90°+30°)/2=60°. I due riferimenti hanno uscite distinte, il guadagno è positivo.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: g 2 grado⁻¹, b 1, D 181→β 90°, φ 60°.241/4° omette b; 105° omette g dopo b e violaφ<90°; 90 copiaβ.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 60. Fonte SHA256 784757988a954f9048253370f1ea3c9271f4799677a94f2996bf837f0b75f796. Candidato SHA256 2e68012ca176a5a2382bddee335ac39a4eac8ee3a79264974003b42cbfa978c7. Firma sulla sola edizione letta: 18cc2f0364d4f07f911b714ca35559459cc4d0273e4324a99399dda6380a5cef.

## AR-u7-plane-mirror-ray-direction-16

Nel piano cartesiano la direzione positiva degli angoli è antioraria dall’asse orizzontale verso destra. La retta di uno specchio piano ha direzione φ; il vettore di propagazione incidente, rivolto verso lo specchio, ha direzione α. Si assume 0<α<φ<90°. La direzione β del vettore riflesso è nello stesso riferimento, nel ramo 0<β<180°, senza riduzioni modulo 360°. Gli angoli dalla normale, invece, si chiamano θ_i e θ_r. Si tratta di riflessione speculare fra configurazioni statiche distinte. Si impone φ=(3/2)α e si misura β=60°. Quanto vale α in gradi?

Derivazione e conti manuali: Vincoloφ=(3/2)α tra angoli nella stessa unità, fattore puro. β=3 α−α=2 α=60°→α 30° eφ 45°. Questa coppia è unica nel ramo 0<α<φ<90°; non esiste libertà di scala dopo il dato assolutoβ.

Ipotesi e dominio: Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore 0<α<φ<90° e 0<β<180° srotolato, nessun modulo 360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.

Alternative e controprove: φ 3 α/2→β 2 α 60°→α 30°.60 dàφ 90° escluso, 15 dàβ 30°, infinite non compatibili con dato assoluto.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 30. Fonte SHA256 ef2d92e8eb548e9188ff310ceeab3ad2358822f41a6b6a18fae22e01936e87b6. Candidato SHA256 c36b21641fc439ebb586a56196a77fa18692c0b3165c2686ef8832bcef7d77be. Firma sulla sola edizione letta: 328da9e69391b8f9c608dd34bae30a3be5eae8864ad181b1353712d79e1feba1.
