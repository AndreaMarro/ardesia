# projected-image-height-262 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-03.json`, SHA `6db63e941006bc0ceed36d502c46b1d48d814a82c12874e6121e37c3d25a904e`. Tutti i 32 prompt B261–262 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B261–262 commit 46b0e987, SHA d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d, ricevuta solo come hash/percorso e mai aperta; B per A260 commit 41d26dcb, SHA 91220f73e8017e5d93177938133c038760e8f8a53a1521decfe907b72d089f55.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L09 riflessione, rifrazione e angolo limite (prereq L06) e L10 lenti (prereq L09), letti integralmente.

Riferimenti primari consultati per le leggi: [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello geometrico didattico con ipotesi dichiarate.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Nuova parametrizzazione rispetto al fonte: h_o1/2mm invece1/2cm, H inmm; vincolo16 h_o=p/40 con grandezze coerenti, equivalente a h_o/(mm)= [p/(cm)]/4, non rapporto fisico1/4. Disegno lente: f2cm,p4cm,q4cm, assex40 coordinate/cm, altezze400 coordinate/cm (amplificate10× dichiarato), oggetto(160,280),O(320,320),immagine(480,360),foci240/400. Due raggi si incrociano480,360 e m−1. Barre scala80/mm:80/320/200 per1/4/2.5mm. Grafico orig150,1510, scale60/cm e120/mm, H=2/(p/cm−2)mm, p2asintoto escluso.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-projected-image-height-01 — Altezza sullo schermo

Ipotesi e percorso manuale d’autore: La legge dei coniugati dà q=fp/(p−f). Il modulo dell’ingrandimento è q/p=f/(p−f), così H=h_of/(p−f). Qui il rapporto vale 2 cm/(4 cm−2 cm)=1: l’immagine ha modulo 1 mm, ma è capovolta. Un segno negativo di h_i non rende negativo il modulo richiesto.

Passaggi: H=h_o\frac f{p-f};  H=(1\,\mathrm{mm})\frac{2\,\mathrm{cm}}{2\,\mathrm{cm}};  H=1\,\mathrm{mm};  h_i=-1\,\mathrm{mm}

Risposta proposta: 1 mm.

Distrattori: Due mm raddoppierebbe l’immagine senza cambiare i dati. Mezzo mm userebbe f/p invece di f/(p−f); meno uno mm è l’altezza orientata, non il modulo. Un centimetro perderebbe un fattore dieci nella conversione.

## AR-u7-projected-image-height-02 — Altezza e ingrandimento hanno unità diverse

Ipotesi e percorso manuale d’autore: H è una lunghezza e si può esprimere in millimetri. Il rapporto H/h_o è invece adimensionale. Moltiplicare h_o per il numero puro f/(p−f) conserva l’unità di lunghezza dell’oggetto.

Passaggi: [H]=L;  M=\frac H{h_o};  [M]=1

Risposta proposta: mm.

Distrattori: Uno è adatto a M, mm⁻¹ a un inverso di lunghezza, gradi a un angolo e secondi a una durata. Non si attribuisce a H l’unità del rapporto che la collega a h_o.

## AR-u7-projected-image-height-03 — Due leggi per eliminare q

Ipotesi e percorso manuale d’autore: Dal modello della lente ricavo q=fp/(p−f). Inserendolo in H=h_o q/p il fattore p si cancella: H=h_o f/(p−f). La positività dipende dal ramo p>f; l’altezza orientata avrebbe un segno meno, che il modulo elimina.

Passaggi: q=\frac{fp}{p-f};  H=h_o\frac qp;  H=h_o\frac f{p-f}

Risposta proposta: H = h_o f / (p − f).

Distrattori: p/f non è q/p, mentre f/p dimentica il termine−f. Il rapporto invertito scambia ingrandimento e suo reciproco. Il segno negativo descrive h_i, non H.

## AR-u7-projected-image-height-04 — Oggetto doppio alla stessa distanza

Ipotesi e percorso manuale d’autore: La lente e la posizione non cambiano, quindi l’ingrandimento resta uno in modulo. Raddoppiare l’altezza dell’oggetto raddoppia quella dell’immagine: da 1 a 2 mm. Entrambe le altezze orientate dell’immagine sono negative rispetto all’oggetto, ma i moduli sono positivi.

Passaggi: M=1;  H_A=1\,\mathrm{mm};  H_B=2\,\mathrm{mm}

Risposta proposta: Da 1 a 2 mm.

Distrattori: Mezzo mm inverte la dipendenza dall’altezza; quattro mm introduce un quadrato. Uno ignora il nuovo oggetto; due centimetri scambia mm e cm e vale dieci volte l’uscita corretta.

## AR-u7-projected-image-height-05 — L’altezza prima della lente

Ipotesi e percorso manuale d’autore: Divido per l’ingrandimento f/(p−f), oppure moltiplico H per(p−f)/f. Per p=4 cm il rapporto è uno: l’oggetto è alto 1 mm. Il controllo in avanti dà ancora H=1 mm.

Passaggi: h_o=H\frac{p-f}{f};  h_o=(1\,\mathrm{mm})\frac{2\,\mathrm{cm}}{2\,\mathrm{cm}};  h_o=1\,\mathrm{mm}

Risposta proposta: 1 mm.

Distrattori: Due mm predirebbe H=2 mm e mezzo mm H=1/2 mm. Un centimetro equivale a 10 mm e darebbe un’immagine di 10 mm, non quella osservata.

## AR-u7-projected-image-height-06 — La distanza da due altezze

Ipotesi e percorso manuale d’autore: Il rapporto delle altezze vale uno. Riordinando H(p−f)=h_o f trovo p=f(1+h_o/H). Le due altezze nella stessa unità danno h_o/H=1: p=2 cm·2=4 cm, nel ramo reale p>f.

Passaggi: p=f\left(1+\frac{h_o}{H}\right);  p=(2\,\mathrm{cm})(1+1);  p=4\,\mathrm{cm}

Risposta proposta: 4 cm.

Distrattori: Due cm è il fuoco, dove l’immagine reale finita non esiste. Un cm sarebbe il ramo virtuale escluso; tre cm con lo stesso oggetto darebbe H=2 mm.

## AR-u7-projected-image-height-07 — Allontanare lo stesso oggetto

Ipotesi e percorso manuale d’autore: Il denominatore p−f passa da 2 a 4 cm. L’altezza d’immagine passa da 1 a 1/2 mm; il rapporto B/A è un mezzo. Con focale fissata il fattore che conta è la distanza dal fuoco p−f, non il semplice rapporto p_B/p_A.

Passaggi: H_A=1\,\mathrm{mm};  H_B=(1\,\mathrm{mm})\frac24;  H_B=\frac12\,\mathrm{mm};  H_B/H_A=\frac12

Risposta proposta: 1/2.

Distrattori: Due inverte il rapporto, un terzo implicherebbe H_B=1/3 mm e richiederebbe p_B=8 cm, non 6 cm e 3/2 copia p_B/p_A. Uno trascura il cambiamento di distanza.

## AR-u7-projected-image-height-08 — Scarto fra moduli

Ipotesi e percorso manuale d’autore: L’ingrandimento corretto è uno, quindi H=1 mm. Il proposto 2 mm supera l’uscita corretta di 1 mm. Il risultato riguarda i moduli; non si sottrae l’altezza orientata−1 mm alla proposta.

Passaggi: H=1\,\mathrm{mm};  \delta H=(2-1)\,\mathrm{mm};  \delta H=1\,\mathrm{mm}

Risposta proposta: 1.

Distrattori: −1 inverte la sottrazione; due ripete la proposta e un mezzo è il rapporto corretto/proposto. Zero accetterebbe un modulo incompatibile con i dati.

## AR-u7-projected-image-height-09 — L’inversa simbolica per l’oggetto

Ipotesi e percorso manuale d’autore: Moltiplico H=h_o f/(p−f) per(p−f)/f, positivo. L’inversa restituisce h_o=H(p−f)/f: un’altezza moltiplicata per un rapporto puro. Tutti i valori rimangono positivi perché si lavora sui moduli e nel ramo reale.

Passaggi: H=h_o\frac f{p-f};  h_o=H\frac{p-f}{f}

Risposta proposta: h_o = H (p − f) / f.

Distrattori: Ripetere f/(p−f) non è l’inversa, sebbene coincida al dato particolare p=2 f. Il segno più modifica la legge, il reciproco di H ha dimensione L⁻¹ e il meno violerebbe h_o>0.

## AR-u7-projected-image-height-10 — Altezza e posizione cambiano

Ipotesi e percorso manuale d’autore: Il nuovo ingrandimento usa il denominatore κ₂p−f, non κ₂(p−f), perché la focale non cambia. Divido le due leggi e ottengo κ₁(p−f)/(κ₂p−f). Oltre ai fattori positivi serve κ₂p>f, per evitare il fuoco e il ramo virtuale.

Passaggi: H_B=\frac{\kappa_1 h_o f}{\kappa_2p-f};  R=\frac{\kappa_1(p-f)}{\kappa_2p-f}

Risposta proposta: κ₁ (p − f) / (κ₂ p − f).

Distrattori: κ₁/κ₂ trascura il termine fisso f. Il prodotto rende diretta anche la distanza, l’altro rapporto inverte i denominatori e la somma dà due per prove identiche.

## AR-u7-projected-image-height-11 — Più alto e più vicino al fuoco

Ipotesi e percorso manuale d’autore: A ha ingrandimento uno e immagine di 1 mm. B ha ingrandimento 2 cm/(3 cm−2 cm)=2 e oggetto di 2 mm, quindi H_B=4 mm. Raddoppiano sia l’altezza dell’oggetto sia il modulo dell’ingrandimento: l’effetto complessivo è quattro.

Passaggi: H_A=1\,\mathrm{mm};  H_B=(2\,\mathrm{mm})\frac21;  H_B=4\,\mathrm{mm};  H_B/H_A=4

Risposta proposta: 4.

Distrattori: Un quarto inverte il confronto. Due considera uno solo dei due fattori;3/4 confronta le distanze p e uno ignora entrambi gli effetti.

## AR-u7-projected-image-height-12 — Media delle altezze proiettate

Ipotesi e percorso manuale d’autore: Le altezze delle due immagini hanno moduli 1 e 4 mm. La media è 5/2 mm. Gli ingressi medi h_o=3/2 mm e p=7/2 cm darebbero invece H=2 mm. La differenza è 1/2 mm: mediare due uscite non equivale a proiettare un solo oggetto con dati medi.

Passaggi: \overline H=\frac{1+4}{2}\,\mathrm{mm};  \overline H=\frac52\,\mathrm{mm};  H_{\rm dati\ medi}=2\,\mathrm{mm}

Risposta proposta: 5/2.

Distrattori: Due usa i parametri medi, cinque somma senza dimezzare e 3/2 è la semidifferenza. Quattro ripete soltanto B. La media delle altezze non impone un unico piano di schermo per entrambe le configurazioni.

## AR-u7-projected-image-height-13 — La nuova posizione per un target

Ipotesi e percorso manuale d’autore: Il target è 4 mm. La formula inversa p=f(1+h_o/H) dà p_B=2 cm·(1+2/4)=3 cm. La distanza resta sopra il fuoco; rispetto ai 4 cm di A il rapporto è tre quarti.

Passaggi: H_B=4\,\mathrm{mm};  p_B=(2\,\mathrm{cm})\left(1+\frac24\right);  p_B=3\,\mathrm{cm};  p_B/p_A=\frac34

Risposta proposta: 3/4.

Distrattori: 4/3 inverte le distanze, quattro copia il target delle uscite e due il fattore delle altezze. Una distanza invariata darebbe soltanto H_B=2 mm.

## AR-u7-projected-image-height-14 — Un display dell’altezza

Ipotesi e percorso manuale d’autore: Il riferimento ha H=1 mm, perciò g=3 mm⁻¹. La nuova lettura 12 indica H=4 mm. A p=3 cm l’ingrandimento vale due, così l’oggetto cercato è alto 2 mm.

Passaggi: g=3\,\mathrm{mm^{-1}};  H=4\,\mathrm{mm};  h_o=H\frac{p-f}{f};  h_o=(4\,\mathrm{mm})\frac12;  h_o=2\,\mathrm{mm}

Risposta proposta: 2 mm.

Distrattori: Sei mm tratterebbe il display 12 come altezza e predirebbe D=36. Quattro mm si fermerebbe al modulo dell’immagine invece dell’oggetto; uno mm darebbe D=6.

## AR-u7-projected-image-height-15 — Separare offset e ingrandimento

Ipotesi e percorso manuale d’autore: Le altezze d’immagine di riferimento sono 1 e 4 mm. Dalle differenze ricavo g=(9−3)/(4−1)=2 mm⁻¹ e b=1. La lettura 5 corrisponde a H=2 mm; a p=4 cm il modulo dell’ingrandimento è uno e quindi h_o=2 mm.

Passaggi: g=2\,\mathrm{mm^{-1}};  b=1;  H_C=\frac{5-1}{2}\,\mathrm{mm};  H_C=2\,\mathrm{mm};  h_{o,C}=2\,\mathrm{mm}

Risposta proposta: 2 mm.

Distrattori: 5/2 mm ometterebbe l’offset e predirebbe D=6. Quattro mm ometterebbe il guadagno dopo b e darebbe D=9; uno mm ripete soltanto A.

## AR-u7-projected-image-height-16 — Un vincolo compatibile con altezze piccole

Ipotesi e percorso manuale d’autore: Il fattore 1/40 è scelto per conservare altezze piccole rispetto alla focale. Pongo x=p/(1 cm)>2: siccome 1 cm=10 mm, h_o=(x/4) mm. La legge dà H/(1 mm)=x/[2(x−2)]. Impongo la misura uno, moltiplico per il denominatore positivo e ricavo x=4. Ne seguono p=4 cm e h_o=1 mm.

Passaggi: x=\frac p{1\,\mathrm{cm}};  h_o=\frac x4\,\mathrm{mm};  \frac H{1\,\mathrm{mm}}=\frac{x}{2(x-2)};  2(x-2)=x;  x=4;  p=4\,\mathrm{cm}

Risposta proposta: 4 cm.

Distrattori: Due cm è il fuoco escluso e rende il denominatore nullo. Otto cm darebbe H=2/3 mm, non 1 mm. Il nuovo vincolo non è h_o=p/4 con grandezze nella stessa unità: cambiare unità senza cambiare il coefficiente altererebbe la fisica.
