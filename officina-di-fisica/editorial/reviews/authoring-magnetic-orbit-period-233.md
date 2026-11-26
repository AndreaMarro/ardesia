# Authoring DRAFT — magnetic-orbit-period-233

Tutti gli 80 prompt originali A230–234 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U6-05. Fonte Git immutabile5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-05 SHA256383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Compiti e casi autonomi preservati: cariche opposte23103, elettrone parallelo23303 e linee magnetiche23403 non sono assorbiti nei rispettivi modelli numerici. Inverse e rapporti mantengono domini e coefficienti dimensionali.

Prima di candidature entrambi i revisori avevano congelato la primaria: B per A230–234 SHA51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d su4fcc49cee05f35b838084471fe41bf5babc83f8f (mai aperta dall’autore); A per B235–239 SHAc0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc subc4da66c96cc57f8629b8252a24ce2f1943f7f5e. Nessuna chiave, soluzione, hint, opzione o candidata B235–239 letta durante l’autoria A.

Rilette integralmente le lezioni reali C4-L09 e C4-L10: forza di Lorentz su particella e filo, moto circolare, componente parallela e flusso orientato. Mappatura primaria L09 per230–233 e L10 per il flusso234, con eventuale override autonomo23403 a L09; prerequisiti selezionati sul catalogo reale, senza confondere C1-L006 elasticità/gravitazione con il moto curvo di C1-L004. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Importatore canonico ROOT in sola lettura su SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e storico conservati. Queste sono prove strutturali e di preservazione, senza accredito di integrazione o approvazione scientifica.

Figura SVG-only realmente renderizzata in browser nativo a piena altezza sotto mutex condiviso e guardia≥2 GiB; XML e PNG completo effettivamente letti. Il processo è terminato exit0, non si è dedotta la riuscita dalla sola comparsa del PNG. Nessuna pagina del prodotto, nessun server o dato studenti usato. UI prodotto e responsività320px NOT_RUN, riservate al runner canonico dell’integratore. I testi visibili non mostrano metriche ingegneristiche e non confrontano scale di pannelli indipendenti.

## AR-u6-magnetic-orbit-period-01 — Un tempo ridotto che mantiene π esatto

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Con m=1 mg e B=2 T, quanto vale τ?

Procedimento d’autore: Per un giro, T_orbita=2πr/v. Sostituendo r=mv/(|q|B), v>0 si cancella e τ=m/(|q|B). Un mg è 10⁻⁶ kg e un μC è 10⁻⁶ C: i prefissi si compensano, lasciando τ=1/2 s. Il periodo completo è invece π s e resta esatto.

Formule: T_{\rm orbita}=\frac{2\pi r}{v};  \tau=\frac m{|q|B};  \tau=\frac12\,\mathrm s;  T_{\rm orbita}=\pi\,\mathrm s.

Distrattori e controprove: Un s ignora il campo da 2 T; due s moltiplica per B invece di dividerlo. Un quarto s aggiunge un altro fattore due. Zero non segue da massa e campo finiti positivi. Non bisogna chiamare 1/2 s il periodo completo.

Hint: Calcola τ e ricostruisci T_orbita solo alla fine.

Fonte canonica SHA256 63f59a06b5c3ff90de1de9bb7015113d72dd03ee33b623a5ea5f2c82dd220e03. Candidato SHA256 9d5a9c83141a49e855e0bf8fddf0e429938c4e5b2f9e9bb4b3a35424373e634e. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-02 — Dividere per 2π non cambia dimensione

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Quale unità esprime τ?

Procedimento d’autore: Il periodo ha unità secondo e 2π è un numero puro. Anche τ è un tempo. Dal rapporto m/(|q|B), kg diviso kg/s restituisce s.

Formule: [|q|B]=\mathrm{kg/s};  [\tau]=\mathrm s.

Distrattori e controprove: Hz è frequenza, inversa di un tempo; m è lunghezza e T campo. Il simbolo 1 indica un numero puro, mentre τ conserva la dimensione del periodo.

Hint: Non scambiare il tempo ridotto con la frequenza angolare.

Fonte canonica SHA256 dd4c45b45d3c7ea856fa7ca6187afa96b142181876a7a90dba4d0cfe6ac6ede7. Candidato SHA256 0c51b80935bb6bb914d1b531035ac5351679991276a4bbbcbd00f9e4c39851fc. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-03 — Il caso parallelo non ha un’orbita circolare

Caso autonomo: un elettrone è lanciato con velocità iniziale non nulla esattamente parallela a un campo magnetico uniforme e statico. Non ci sono campo elettrico o altre forze; si trascura la radiazione. Che cosa accade?

Procedimento d’autore: Il prodotto vettoriale v×B è nullo per vettori paralleli. La forza magnetica resta zero anche se la carica dell’elettrone è negativa: non c’è accelerazione e la velocità iniziale si conserva. Qui non si può attribuire al moto un periodo di un’orbita circolare che non esiste.

Formule: \vec v\times\vec B=0;  \vec F_B=0;  \vec v=\vec v_0.

Distrattori e controprove: Un cerchio o un’elica con raggio non nullo richiederebbero una componente perpendicolare. La forza nulla non ferma una particella già lanciata e non ne aumenta la rapidità. Questo caso non soddisfa l’ipotesi perpendicolare degli altri quesiti.

Hint: Valuta il prodotto vettoriale prima di cercare una formula di periodo.

Fonte canonica SHA256 ef3d55a889f5ac2b6d88a64ffc0af9dfab269d73fb05328f17c445acfe4f59ed. Candidato SHA256 f437b309394ad260a23f12c46759fa3f799e2928d7d5ef339120ab986e53c5d2. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-04 — Una massa tripla a parità di campo

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Fra prove m passa da 1 a 3 mg mentre B resta 2 T e le altre condizioni restano fissate. Come cambia τ?

Procedimento d’autore: τ è lineare in m a modulo della carica e campo fissati. Il fattore tre porta τ da 1/2 a 3/2 s. Il periodo completo passa da π a 3π s; non si sta aumentando nel tempo la massa della stessa particella.

Formule: \tau_A=\frac12\,\mathrm s;  \tau_B=\frac32\,\mathrm s;  \tau_B/\tau_A=3.

Distrattori e controprove: 1/6 s inverte l’effetto di m, 9/2 s introduce il quadrato del fattore tre. Un mezzo s ignora la massa diversa; tre s omette il divisore B=2 T nella seconda prova.

Hint: La massa compare al primo grado.

Fonte canonica SHA256 0ab9e53f5e0ec0a827f9e74622720b1fc83a117a69f9cf31f640a7a79377c865. Candidato SHA256 ff49541f4c7400d223e8b4156c4667c917ae209d583a2747764bdbb2fb637940. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-05 — La massa dal tempo ridotto

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. τ=1/2 s e B=2 T. Quanto vale m in mg?

Procedimento d’autore: Isolo m=|q|Bτ. Con 1 μC, 2 T e 1/2 s il prodotto è 10⁻⁶ kg, cioè 1 mg. Non serve una rapidità numerica perché si è cancellata nel rapporto circonferenza/rapidità.

Formule: m=|q|B\tau;  m=10^{-6}\,\mathrm{kg};  m=1\,\mathrm{mg}.

Distrattori e controprove: Un mezzo mg copia il valore numerico di τ e darebbe τ=1/4 s. Due mg omette il fattore 1/2 s del dato e darebbe τ=1 s. Dimenticare micro nella carica produce un errore di un milione.

Hint: Ripristina la carica anche se i numeri in mg e μC si compensano.

Fonte canonica SHA256 672e96fff8957b3172ef9a17030df8d690dd58e32d098861975c79c3deb3a482. Candidato SHA256 81d60e72c4e61fc5ee48c48d4878446ad99b6090e24fc30c586f912767773ae0. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-06 — Il campo dal tempo ridotto

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. τ=1/2 s e m=1 mg. Quanto vale B in T?

Procedimento d’autore: L’inversa B=m/(|q|τ) dà 1/(1/2)=2 T nelle unità numeriche assegnate. Il denominatore contiene la carica e τ, non il periodo completo T_orbita.

Formule: B=\frac m{|q|\tau};  B=2\,\mathrm T.

Distrattori e controprove: Un mezzo T moltiplica il numero della massa per τ invece di dividerlo; un T ignora il dato di tempo. Inserire T_orbita al posto di τ senza 2π cambierebbe la legge.

Hint: Dividere per un mezzo raddoppia il valore numerico.

Fonte canonica SHA256 2986e17043568d3165ad43ec787125adedcedcdb9099f7c78cde0ea450c97965. Candidato SHA256 0a8fa5aeec8191aee994119859b83e6d9f08a90d62abb8bec1f198f612d78310. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-07 — Campo dimezzato e tempo maggiore

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. A usa m=1 mg,B=2 T. B usa la stessa massa e campo di 1 T. Quanto vale τ_B/τ_A?

Procedimento d’autore: A dà τ_A=1/2 s; B dà τ_B=1 s. Il rapporto è due. Il campo dimezzato riduce la frequenza angolare e raddoppia sia τ sia il periodo completo.

Formule: \tau_A=\frac12\,\mathrm s;  \tau_B=1\,\mathrm s;  \tau_B/\tau_A=2.

Distrattori e controprove: Mezzo rende diretto il rapporto con B; quattro introduce un quadrato. Uno ignora il cambio e zero confonde un limite assente con un tempo positivo.

Hint: Confronta i tempi, non le frequenze.

Fonte canonica SHA256 1293bf8e40116c32098f018ad99b4855fc900d8f8489c4c152d8a15927458e67. Candidato SHA256 d3682483c690b5b3ae7c64c2a35280c8391c501764324a7ee8e7392d42e566bf. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-08 — La differenza fra proposta e risultato

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Con m=1 mg,B=2 T si propone τ=1 s. Quanto vale proposta meno corretto?

Procedimento d’autore: La legge dà τ=1/2 s. La proposta supera il corretto di 1−1/2=1/2 s. Due è invece il rapporto puro fra proposta e corretto.

Formule: \tau=\frac12\,\mathrm s;  e=\left(1-\frac12\right)\mathrm s;  e=\frac12\,\mathrm s.

Distrattori e controprove: −1/2 inverte l’ordine; un s copia la proposta; zero l’accetta senza verifica. Un numero puro non ha l’unità dello scarto.

Hint: Mantieni il secondo nella sottrazione.

Fonte canonica SHA256 cd642c86e083687da50d02aa0ee8c74093538d1ef6aa3184b49c7224b8541d48. Candidato SHA256 749d64e33033360b58e17dbfea49dab8fac9069a5765312b1be9ea7e532de1bb. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-09 — L’inversa della massa senza perdere la carica

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. τ e B sono noti. Quale formula isola m?

Procedimento d’autore: Moltiplico τ=m/(|q|B) per il prodotto positivo |q|B. Ne segue m=|q|Bτ. Il prodotto ha unità kg: il fattore 2π è già stato eliminato nella definizione di τ.

Formule: m=|q|B\tau;  [m]=\mathrm{kg}.

Distrattori e controprove: τ/(|q|B) ha s²/kg, |q|B/τ ha kg/s² e Bτ/|q| ha kg/C². L’ultima espressione mantiene la massa come dimensione ma aggiunge erroneamente 2π e non restituisce il dato di riferimento.

Hint: Nell’inversa devi moltiplicare per l’intero denominatore.

Fonte canonica SHA256 f0efccd3e9a574830220243410cda362d755d8a7175d865806a3d4725dbfd0c1. Candidato SHA256 f32cc16eddabf1f28642cf1b83fbbf064ee327ad0c6983cf5fb6979deb4ad4a3. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-10 — Scalare massa e campo

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Fra preparazioni m_B=κ₁m_A e B_B=κ₂B_A. |q| resta uguale e i moti sono non relativistici. Quanto vale τ_B/τ_A?

Procedimento d’autore: La carica e 2π si cancellano nel confronto: τ_B=κ₁m_A/(|q|κ₂B_A). Il rapporto è κ₁/κ₂. Un eventuale cambiamento di rapidità non entra nel periodo classico, ma deve rispettare le ipotesi del modello.

Formule: \tau_B=\frac{\kappa_1m_A}{|q|\kappa_2B_A};  \tau_B/\tau_A=\kappa_1/\kappa_2.

Distrattori e controprove: Il prodotto rende diretto B, il reciproco scambia i ruoli e il quadrato della massa non appartiene alla legge. La somma dà due per fattori unitari.

Hint: Usa il rapporto m/B a carica invariata.

Fonte canonica SHA256 84db7697773b49e37799ec6a581ad1c0f7f61217b2cf8950c6648a8a39ff4e4b. Candidato SHA256 2c79abc82c5b748f97e715799b37be976473d6ce4be5ca093e86855829dc9f27. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-11 — Massa doppia e campo dimezzato

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. A ha m=1 mg,B=2 T. B ha m=2 mg,B=1 T. Quanto vale τ_B/τ_A?

Procedimento d’autore: A dà 1/2 s; B dà 2 s. Il rapporto è quattro: la massa doppia e l’inverso del campo dimezzato forniscono entrambi un fattore due.

Formule: \tau_A=\frac12\,\mathrm s;  \tau_B=2\,\mathrm s;  \tau_B/\tau_A=4.

Distrattori e controprove: Un quarto inverte il confronto. Due segue un solo fattore; un mezzo copia il fattore del campo senza invertirlo. Uno presume una compensazione invece del rinforzo dei due effetti.

Hint: Non moltiplicare direttamente i rapporti m_B/m_A e B_B/B_A.

Fonte canonica SHA256 4c1e95173208837449f4f5bd960ce2d2a4a98da6e1c8e7c5a16b0c48576cfcab. Candidato SHA256 05e4a9a3789843671639f5d5a51bf85d08dce97a482fe81ac4cecf1572558c84. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-12 — Media di due tempi ridotti

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Si mediano con uguale peso A:m=1 mg,B=2 T e B:m=2 mg,B=1 T. Qual è la media di τ?

Procedimento d’autore: Le letture sono 1/2 s e 2 s. La media è (1/2+2)/2=5/4 s. Agli ingressi medi m=3/2 mg e B=3/2 T il modello darebbe 1 s, inferiore di 1/4 s. La media non è un periodo completo: per mediare T_orbita si moltiplicherebbe il risultato per 2π.

Formule: \overline\tau=\frac54\,\mathrm s;  \tau_{\rm dati\ medi}=1\,\mathrm s.

Distrattori e controprove: Un s usa gli ingressi medi; 5/2 s è la somma e 3/4 s la semidifferenza. Zero non è una media di questi tempi positivi.

Hint: Dimezza la somma delle uscite già ricavate.

Fonte canonica SHA256 2d6cacd14f33d57879952d44261a2c53e56d26aed9ae0d813d07ed9bb832ad9c. Candidato SHA256 7940dd751f1f3b69e44738d2623eece53c8bb394d9caeca494315b94b8edfc91. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-13 — Il campo necessario per quadruplicare τ

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. A ha m_A=1 mg,B_A=2 T. B usa m_B=2 mg e deve dare τ_B=4τ_A. Quanto vale B_B/B_A?

Procedimento d’autore: Il bersaglio è 2 s. Con m_B=2 mg e |q|=1 μC serve B_B=1 T. Rispetto ai 2 T iniziali, il rapporto è 1/2: la massa doppia da sola darebbe solo un raddoppio del tempo.

Formule: \tau_B=2\,\mathrm s;  B_B=1\,\mathrm T;  B_B/B_A=\frac12.

Distrattori e controprove: Due inverte il confronto e ridurrebbe il tempo rispetto al bersaglio. Quattro copia il rapporto dei tempi, uno non modifica il campo, un quarto darebbe τ_B=4 s.

Hint: Usa prima il bersaglio espresso in secondi.

Fonte canonica SHA256 0033d86276af5cff0262a1dd7af585a9d9bed76522490814a152f46e1b237187. Candidato SHA256 d20653f3773f9cbb3476c8b36c3a525bdaae0676886e4184f3c9a15a5a3575da. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-14 — Taratura proporzionale di un tempo

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Il display continuo adimensionale segue D=a_cal τ senza offset. A:m=1 mg,B=2 T,D=3/2. B:B=1 T,D=6. Quanto vale m_B in mg?

Procedimento d’autore: A ha τ_A=1/2 s e il guadagno è (3/2)/(1/2)=3 s⁻¹. La lettura sei indica τ_B=2 s. Il prodotto |q|B_Bτ_B dà m_B=2 mg.

Formule: a_{\rm cal}=3\,\mathrm s^{-1};  \tau_B=2\,\mathrm s;  m_B=2\,\mathrm{mg}.

Distrattori e controprove: Sei mg tratterebbe il display come un tempo e predirebbe D=18. Un mezzo mg copia il tempo del riferimento e darebbe D=3/2 con B_B=1 T. Un mg ignora la preparazione nuova.

Hint: La lettura frazionaria è continua, non un conteggio intero.

Fonte canonica SHA256 07cfbae1589beedf339ccdb3f345f321a0911e5ef00c817f9ba9dce51cc00fd5. Candidato SHA256 e7f6800e8d494618f049ed1cef139fdbd8bfc525ac2de13a80a5f2701569668b. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-15 — Offset prima di ricostruire la massa

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Il display continuo adimensionale segue D=a_cal τ+b_cal. A:m=1 mg,B=2 T,D=2. B:m=2 mg,B=1 T,D=5. C:B=2 T,D=4. Quanto vale m_C in mg?

Procedimento d’autore: Le letture fisiche di riferimento sono τ_A=1/2 s e τ_B=2 s. Guadagno (5−2)/(2−1/2)=2 s⁻¹, offset uno. D_C=4 decodifica τ_C=3/2 s. Con B_C=2 T si ricava m_C=3 mg.

Formule: a_{\rm cal}=2\,\mathrm s^{-1};  b_{\rm cal}=1;  \tau_C=\frac32\,\mathrm s;  m_C=3\,\mathrm{mg}.

Distrattori e controprove: Quattro mg omette l’offset e predice D=5. Sei mg sottrae b ma salta il guadagno. Un mezzo mg copia il valore numerico di un riferimento invece di usare la lettura C.

Hint: Il periodo completo non va sostituito a τ nella legge dello strumento.

Fonte canonica SHA256 f27485ed52bac5232aceb5cd85e7780cb53d5b0a21fbce8c8630ab7bdc321eec. Candidato SHA256 bfac31e23010fbcd699fdb4081f3f6ff987fb71db27e5a24db79fa7cb8c755ef. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-orbit-period-16 — Una misura ridondante del tempo ridotto

Una particella ideale di massa m>0 e modulo della carica |q|=1 μC si muove con rapidità non nulla perpendicolarmente a un campo magnetico uniforme di modulo B>0. Non ci sono altre forze e si trascura la radiazione. Ogni preparazione resta non relativistica. Si cerca τ=T_orbita/(2π)>0, che ha unità di tempo ma non è il periodo completo. Nei dati numerici m si esprime in mg; masse diverse indicano particelle preparate distintamente, non massa variabile nel tempo di una singola particella. Fra preparazioni m=[(1/2) mg/T]B. Si misura anche τ=1/2 s. Quante coppie positive (m,B) sono determinate?

Procedimento d’autore: Il vincolo inserito in τ=m/(|q|B), con |q|=1 μC, dà sempre 1/2 s. La misura non aggiunge una scala indipendente. Per esempio m=1 mg,B=2 T e m=1/2 mg,B=1 T soddisfano entrambi il dato e possono essere preparati con rapidità non relativistica.

Formule: m=[(1/2)\,\mathrm{mg/T}]B;  \tau=\frac12\,\mathrm s.

Distrattori e controprove: B si cancella: non nasce una quadratica con due radici. Nessuna condizione impone campi interi; scegliere una delle coppie di esempio come unica sarebbe arbitrario.

Hint: Verifica se la lettura indipendente ripete il vincolo.

Fonte canonica SHA256 17be610e86b7cc28a65a3708639d12e499fc1a99592fc8c04713949c1f069a31. Candidato SHA256 61e5cd09c8d98baa29be92fc5c616a016dd7c7b3ee269291888134d181ccd1d4. Skill reale C4-L09. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 c0524ecb264da78f40732f0b7d5df7fbcfaa014b194c3cff5c611c2b736f2845. Package file SHA256 3776b8f0d2ad5514090c5381483d972be09363c364eb9fffc36e9e5432c496c1. Binding file SHA256 5df78fc03beb7ab480fbafbb982a25ca4fee751c4c04b4f83b4572baadd8b017. Prova strutturale SHA256 42cab892870a398b6d56d06337dd7826a5fe10dbc757e494953f58ad295e2b60. Manifest asset-only SHA256 31d02366cb7a0c8e59498d6693d0473ad92adfd8c9e31b3973e9c3bef29e27d1.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B è distinto e deve leggere i finali contro la propria primaria prima di qualsiasi firma. Prodotto UI NOT_RUN, nessun marker inventato o riusato.

Lettura geometrica dell’autore: il cerchio del primo pannello è schematico. La tangente inferiore verso destra e la freccia sulla parte destra verso l’alto rappresentano lo stesso verso di percorrenza. Non si assegna un raggio numerico. Le barre80/320/200 coordinate rappresentano1/2,2,5/4 s, scala comune160 coordinate/s. Nel grafico x=150+80B[T], y=1280−160τ[s], i tre punti esatti dannoτ=1,1/2,1/4 s perB=1,2,4 T. Non è un grafico del periodo completo: ogni ordinata va moltiplicata per2π per ottenere T. Le coordinate intrinseche restano documentazione tecnica.

Prima consegna: l’autore ha intercettato nel WIP una freccia circolare discordante con la tangente. I sette vecchi file e il manifest sono conservati in editorial/author-evidence/magnetic-orbit-period-233-wip-direction-before-first-delivery/. Le due assembly, l’import e il native finali sono stati eseguiti nuovamente sui byte corretti, senza trasferire approvazioni dalla versione WIP.
