# Esempi di rifrazione — due nuove edizioni candidate

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore scientifico dell’autore, nessuna nuova pubblicazione.

Fonte Cric: commit `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C5.json`. Letti individualmente i due originali e i riferimenti reali C5-L06 e C5-L09. Restano identici ID, course C5, skill C5-L09, prerequisito C5-L06, famiglia, ordine e tipo example. Le candidate hanno version 2 e baseVersion 1. I vecchi testi e gli SVG storici non sono modificati.

L’assembler riusa `pipeline`, `units_authoring.law_steps` e l’importatore editoriale canonico. Le firme dei binding identificano fonte, candidata, provenienza e nuovi asset. I controlli di schema, importazione e interfaccia non sono giudizi scientifici.

## C5-E017

Si conserva il dato di 45° alla superficie e si rende esplicito il modello con indici aria 1 e vetro 3/2. La normale è perpendicolare alla superficie: l’incidenza vale 90° − 45° = 45° e il riflesso ha lo stesso angolo. La coincidenza numerica dei due complementari è specifica di 45°, non una ragione per confondere i riferimenti.

Snell dà sin θ₂ = (2/3)(√2/2) = √2/3, per cancellazione del fattore due. La direzione esatta è θ₂ = arcsin(√2/3), nel primo quadrante. Il confronto manuale non richiede l’inversa in gradi: entrambi i seni sono positivi, 2/9 < 1/4 perché 8 < 9, dunque 0° < θ₂ < 30°. Nell’inversa n₂ = n₁ sin θ₁/sin θ₂ il fattore √2 si cancella e si ritrova 3/2. Indici e seni sono adimensionali, angoli espressi in gradi.

Gli errori discussi sono rapporto degli indici invertito, uguaglianza impropria degli angoli, attribuzione arbitraria di 60° e seno arrotondato trattato come esatto. Il rapporto invertito produrrebbe 3√2/4, il cui quadrato 9/8 supera uno: in questo verso aria–vetro segnala una formula invertita, non riflessione totale.

SVG nuovo `example-refraction-exact.svg`: normale verticale e superficie orizzontale, incidenza/riflessione geometricamente a 45°. Il trasmesso ha componenti proporzionali a √2 e √7 e modulo proporzionale a 3, quindi il seno corretto. Il triangolo successivo usa scala unica 50 px per unità del rapporto. Le lunghezze dei raggi non esprimono intensità. Tutte le frecce sono path separati con marker; letti XML e rendering completo. Le coordinate irrazionali sono serializzate con precisione subpixel esclusivamente per il disegno, senza introdurre approssimazioni nelle risposte.

## C5-E018

La nuova edizione dichiara una parametrizzazione differente: n_acqua = 4/3 e n_aria = 1 sono dati esatti del modello, non una misura esatta dell’acqua reale. Le incidenze diventano 30° e 60°. La vecchia edizione con 1,33 e 40°/55° rimane conservata e non riceve retroattivamente alcuna prova della candidata.

Poiché il passaggio avviene verso indice minore, al limite il trasmesso forma 90° con la normale. Snell dà sin θc = 3/4 e θc = arcsin(3/4). I quadrati dei seni a 45°, θc e 60° sono 8/16, 9/16, 12/16: quindi 45° < θc < 60°. Il caso radente è il limite; la riflessione totale richiede incidenza strettamente superiore.

A 30°, sin θ₂ = (4/3)(1/2) = 2/3. È un seno ammesso; θ₂ = arcsin(2/3). Il confronto 2/3 > 1/2 e 4/9 < 1/2 colloca θ₂ strettamente fra 30° e 45°. Il riflesso rimane nell’acqua a 30°. A 60° il prodotto 2√3/3 è positivo e ha quadrato 4/3 > 1: non esiste un raggio trasmesso propagante nell’aria e il riflesso resta nell’acqua a 60°.

L’inversa n_acqua = n_aria/sin θc restituisce 4/3; anche n_acqua = n_aria sin θ₂/sin 30° dà lo stesso valore. Si discutono rapporto invertito, confusione fra angolo critico e angolo trasmesso limite, piegamento nel verso sbagliato e seno impossibile troncato a uno. Non si deducono frazioni d’intensità o fenomeni di campo vicino dal solo diagramma dei raggi.

SVG nuovo `example-total-reflection-exact.svg`: acqua sotto e aria sopra in tre pannelli. I raggi critici usano sin θc = 3/4; quelli della seconda prova sin θ₁ = 1/2 e sin θ₂ = 2/3. Nella terza prova l’incidente e il riflesso sono a 60° e non è disegnato alcun trasmesso propagante. Normali, archi e versi sono espliciti; etichette spostate dalle linee durante la rilettura visiva. Nessuna lunghezza confronta intensità. Letti XML e rendering completo; ogni freccia ha un path proprio.

## Riferimenti fisici consultati

- [OpenStax, College Physics 2e, 25.3: legge di rifrazione](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction): legge di Snell, angoli alla perpendicolare e isolamento dell’indice.
- [OpenStax, College Physics 2e, 25.4: riflessione totale interna](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection): direzione da indice maggiore a minore, limite radente e condizione stretta oltre l’angolo critico.

I risultati e le figure sono redatti autonomamente; i riferimenti sostengono le leggi e le ipotesi, senza riprodurre le approssimazioni numeriche degli esempi della fonte.
