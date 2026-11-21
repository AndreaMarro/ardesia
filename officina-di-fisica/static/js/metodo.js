/* Percorsi metodologici originali: leggibili anche in una installazione già avviata.
 * I grafici SVG sono costruiti localmente, senza chiamate esterne.
 */
import { esc, crumb, head, link } from "./ui.js";

const methods = {
  C1: {
    name: "Meccanica e misure",
    topic: "Dalla distanza al tempo",
    opening: "Prima di cercare una formula, distingui la distanza percorsa, la velocità costante e il tempo trascorso. Una velocità di 5 m/s significa che in ogni secondo si percorrono 5 metri.",
    steps: [
      ["Traduci il testo in grandezze", "La domanda è: quanto tempo serve per percorrere 20 m alla velocità costante di 5 m/s? Individuo la grandezza cercata, t. Scrivo i dati con la loro unità, senza iniziare a calcolare.", "s=20\\,\\mathrm{m},\\quad v=5\\,\\mathrm{m/s},\\quad t=?"],
      ["Parti dalla relazione corretta", "Per un movimento a velocità costante, lo spazio percorso è velocità moltiplicata per tempo. Non uso questa formula per un moto che accelera.", "s=vt"],
      ["Isola la grandezza richiesta", "Il tempo è moltiplicato per v. Per lasciarlo da solo, divido entrambi i membri per v. Il fattore v si semplifica soltanto a destra.", "\\frac{s}{v}=\\frac{vt}{v}\\quad\\Rightarrow\\quad t=\\frac{s}{v}"],
      ["Sostituisci solo dopo aver isolato", "Divido 20 per 5 a mente. Anche le unità si dividono: m diviso m/s restituisce s.", "t=\\frac{20\\,\\mathrm m}{5\\,\\mathrm{m/s}}=4\\,\\mathrm s"],
      ["Controlla la plausibilità", "Se si percorrono 5 m in un secondo, in quattro secondi se ne percorrono 20. Moltiplicando t per v riottengo lo spazio del testo.", "5\\cdot4=20"]
    ],
    graph: {
      x: "tempo t (s)", y: "spazio s (m)", xmax: 4, ymin: 0, ymax: 20,
      samples: [[0, 0], [2, 10], [4, 20]], type: "line",
      captions: [
        "Guarda prima gli assi. L'asse orizzontale misura il tempo in secondi; quello verticale lo spazio in metri. Non sono grandezze intercambiabili.",
        "Segna i dati: dopo 2 s si trovano 10 m e dopo 4 s si trovano 20 m. Proietta ciascun punto sui due assi e leggi la coppia ordinata.",
        "Unisci i punti con la retta. La pendenza è variazione di spazio divisa per variazione di tempo: 10 m in 2 s significano 5 m/s. Non leggere 10 m come una velocità."
      ],
      trick: "La pendenza del grafico spazio-tempo è la velocità. Nel grafico velocità-tempo, invece, la pendenza è l'accelerazione: cambia l'asse verticale, cambia la grandezza ricavata."
    },
    check: {
      prompt: "Un carrello percorre 12 m in 3 s a velocità costante. Qual è la velocità?",
      steps: ["La grandezza cercata è v, non t.", "Parto da s = vt e divido entrambi i membri per t.", "Ottengo v = s/t = 12/3 = 4 m/s.", "Verifico: 4 m/s per 3 s produce 12 m."]
    },
    focus: [["C1-L003", "Leggere il movimento nel tempo"], ["C1-L005", "Disegnare tutte le forze"], ["C1-L008", "Bilanci energetici"]]
  },
  C2: {
    name: "Fluidi",
    topic: "Isolare una pressione nella legge di Poiseuille",
    opening: "In un condotto cilindrico ideale, con flusso laminare stazionario, la portata dipende dalla differenza di pressione, dalla viscosità, dalla lunghezza e soprattutto dal raggio. Non usare la relazione fuori dalle sue ipotesi.",
    steps: [
      ["Riconosci il modello e i simboli", "Q è volume al secondo; Δp è la differenza di pressione; r è il raggio; η è la viscosità dinamica; L è la lunghezza. Il simbolo r alla quarta significa r moltiplicato per sé stesso quattro volte.", "Q=\\frac{\\pi r^4\\Delta p}{8\\eta L}"],
      ["Indica ciò che devi trovare", "Voglio Δp. Non comincio spostando simboli a memoria: prima elimino il denominatore intero, che divide il numeratore.", "\\mathrm{incognita}=\\Delta p"],
      ["Moltiplica entrambi i membri", "Moltiplico a sinistra e a destra per 8ηL. A destra il denominatore si semplifica esattamente.", "8\\eta LQ=\\pi r^4\\Delta p"],
      ["Dividi per il fattore residuo", "La grandezza Δp è ancora moltiplicata per πr⁴. Divido entrambi i membri per quel fattore, non per la sola π.", "\\Delta p=\\frac{8\\eta LQ}{\\pi r^4}"],
      ["Fai un controllo di dipendenza", "Se il raggio raddoppia ma la portata desiderata resta uguale, r⁴ aumenta sedici volte. La differenza di pressione necessaria diventa un sedicesimo di prima, a parità di tutti gli altri parametri.", "(2r)^4=16r^4"]
    ],
    graph: {
      x: "raggio relativo r/r₀", y: "portata relativa Q/Q₀", xmax: 2, ymin: 0, ymax: 16,
      samples: [[1, 1], [2, 16]], type: "fourth",
      captions: [
        "Gli assi riportano rapporti adimensionali: 1 indica il valore di riferimento. Questo consente confronti senza calcolare π o usare una calcolatrice.",
        "Quando il raggio vale una volta quello di riferimento, la portata relativa è 1. Quando il raggio vale due volte, la portata relativa è 16.",
        "La curva non è una retta: il raggio compare alla quarta potenza. Raddoppiare r non raddoppia Q, la moltiplica per 16."
      ],
      trick: "Leggi sempre che cosa rimane costante. Se tieni costante la differenza di pressione, Q cresce come r⁴. Se tieni costante Q, è la pressione richiesta che diminuisce come 1/r⁴."
    },
    check: {
      prompt: "A pressione, viscosità e lunghezza invariati, il raggio di un condotto si dimezza. Quale frazione della portata iniziale rimane?",
      steps: ["In questo confronto Q è proporzionale a r⁴.", "Il nuovo raggio è r/2: il fattore moltiplicativo è (1/2)⁴.", "Moltiplico 2 per sé stesso quattro volte: 2⁴ = 16.", "La nuova portata è Q/16; non Q/2 e non Q/4."]
    },
    focus: [["C2-L002", "Pressione e profondità"], ["C2-L006", "Continuità e Bernoulli"], ["C2-L008", "Poiseuille e raggio"]]
  },
  C3: {
    name: "Termodinamica",
    topic: "Isolare il calore nel primo principio",
    opening: "Per non sbagliare i segni, decido prima una convenzione: Q positivo se entra calore nel gas; W positivo se il gas compie lavoro sull'esterno. La variazione di energia interna è il calore ricevuto meno il lavoro compiuto.",
    steps: [
      ["Scrivi dati, incognita e convenzione", "Un gas aumenta la propria energia interna di 40 J e compie 20 J di lavoro. Entrambe le grandezze sono positive secondo la convenzione scelta. Voglio trovare il calore Q ricevuto.", "\\Delta U=40\\,\\mathrm J,\\quad W=20\\,\\mathrm J,\\quad Q=?"],
      ["Scrivi il primo principio", "L'energia che entra come calore può restare nel sistema come energia interna oppure uscire come lavoro. Nella nostra convenzione la relazione è:", "\\Delta U=Q-W"],
      ["Porta il lavoro dalla parte giusta", "Aggiungo W a entrambi i membri. A destra il termine meno W e il termine più W si cancellano.", "\\Delta U+W=Q-W+W"],
      ["Lascia Q isolato e sostituisci", "Resta Q = ΔU + W. Sommo 40 e 20 a mente perché le unità coincidono.", "Q=\\Delta U+W=40+20=60\\,\\mathrm J"],
      ["Verifica usando la formula iniziale", "Ricalcolo ΔU dal risultato: 60 − 20 = 40 J. Il bilancio torna. Se avessi trovato 20 J, non avrebbe rispettato la relazione iniziale.", "60-20=40"]
    ],
    graph: {
      x: "volume V (L)", y: "pressione p (kPa)", xmax: 4, ymin: 0, ymax: 4,
      samples: [[1, 2], [4, 2]], type: "isobaric", shade: [1, 4, 2],
      captions: [
        "Nel diagramma p–V l'asse orizzontale è il volume in litri e quello verticale è la pressione in kPa. Il lavoro si legge dall'area sotto il tratto, non dalla sua pendenza.",
        "Il gas parte da 1 L e arriva a 4 L mantenendo una pressione di 2 kPa. Il volume aumenta di 3 L: è un'espansione.",
        "L'area del rettangolo sotto la linea vale 2 kPa × 3 L = 6 J, perché 1 kPa·L = 1 J. È un lavoro positivo secondo la convenzione scelta."
      ],
      trick: "Nel grafico p–V devi trovare un'area per ricavare lavoro; nel grafico temperatura-tempo la pendenza non è automaticamente il calore."
    },
    check: {
      prompt: "Un sistema riceve 50 J di calore e compie 20 J di lavoro. Quanto varia la sua energia interna?",
      steps: ["Scrivo la convenzione: calore entrante e lavoro uscente positivi.", "Uso ΔU = Q − W, senza invertire il segno a caso.", "Sostituisco: ΔU = 50 − 20 = 30 J.", "Controllo: 30 J restano nel sistema e 20 J sono ceduti come lavoro; la somma è 50 J."]
    },
    focus: [["C3-L03", "Capacità termica e calore"], ["C3-L06", "Primo principio e segni"], ["C3-L07", "Diagrammi p–V"]]
  },
  C4: {
    name: "Elettricità e magnetismo",
    topic: "Ricavare la resistenza dalla legge di Ohm",
    opening: "La differenza di potenziale ai capi di un resistore, la corrente che lo attraversa e la resistenza sono collegate. La stessa formula può rispondere a domande diverse, ma bisogna isolare la grandezza giusta.",
    steps: [
      ["Traduci le informazioni", "Una differenza di potenziale di 12 V fa passare una corrente di 3 A in un resistore ohmico. Cerco la resistenza R.", "\\Delta V=12\\,\\mathrm V,\\quad I=3\\,\\mathrm A,\\quad R=?"],
      ["Scrivi la relazione", "Per il resistore ohmico, a temperatura costante, la tensione è resistenza moltiplicata per corrente.", "\\Delta V=RI"],
      ["Isola R senza saltare passaggi", "R è moltiplicata per I. Divido entrambi i membri per I, supponendo I diversa da zero.", "\\frac{\\Delta V}{I}=\\frac{RI}{I}=R"],
      ["Sostituisci e controlla l'unità", "Dodici diviso tre fa quattro. Il rapporto V/A si chiama ohm e si indica con Ω.", "R=\\frac{12\\,\\mathrm V}{3\\,\\mathrm A}=4\\,\\Omega"],
      ["Controlla il risultato", "Moltiplico la resistenza trovata per la corrente: 4 Ω × 3 A = 12 V. Se non ritrovassi il dato iniziale, ricontrollerei il calcolo.", "RI=4\\cdot3=12\\,\\mathrm V"]
    ],
    graph: {
      x: "differenza di potenziale ΔV (V)", y: "corrente I (A)", xmax: 12, ymin: 0, ymax: 3,
      samples: [[0, 0], [4, 1], [8, 2], [12, 3]], type: "line",
      captions: [
        "Il grafico ha la tensione in orizzontale e la corrente in verticale. Questa scelta è essenziale: non confondere I(ΔV) con ΔV(I).",
        "Quando la tensione è 4 V la corrente è 1 A; a 8 V è 2 A e a 12 V è 3 A. I punti sono allineati.",
        "La pendenza è ΔI/ΔV = 1 A/4 V = 1/R. Quindi la resistenza vale 4 Ω: la pendenza non è R, ma il suo reciproco."
      ],
      trick: "Prima di interpretare la pendenza guarda gli assi. Se metti V in verticale e I in orizzontale la pendenza è R; se li scambi, è 1/R."
    },
    check: {
      prompt: "Un resistore da 5 Ω è attraversato da una corrente se ai suoi capi applichi 10 V. Quanto vale I?",
      steps: ["La grandezza richiesta è I.", "Da ΔV = RI divido entrambi i membri per R.", "Ottengo I = ΔV/R = 10/5 = 2 A.", "Controllo: 5 Ω × 2 A = 10 V."]
    },
    focus: [["C4-L02", "Linee di campo"], ["C4-L06", "Reti e nodi"], ["C4-L10", "Induzione elettromagnetica"]]
  },
  C5: {
    name: "Onde, ottica e radiazioni",
    topic: "Ricavare la lunghezza d'onda",
    opening: "Un'onda trasporta una perturbazione. La velocità di propagazione v, la lunghezza d'onda λ e la frequenza f descrivono aspetti diversi. La frequenza conta quanti cicli passano in un secondo.",
    steps: [
      ["Individua le grandezze", "Un'onda si propaga a 12 m/s e ha frequenza 3 Hz. Cerco la distanza spaziale fra due creste successive: λ.", "v=12\\,\\mathrm{m/s},\\quad f=3\\,\\mathrm{Hz},\\quad \\lambda=?"],
      ["Scrivi la relazione fisica", "In un periodo l'onda percorre una lunghezza d'onda. Siccome f = 1/T, la velocità si può scrivere come lunghezza d'onda moltiplicata per frequenza.", "v=\\lambda f"],
      ["Isola λ con una divisione", "La lunghezza d'onda è moltiplicata per f. Divido entrambi i membri per f, senza spostare i simboli a intuito.", "\\frac{v}{f}=\\frac{\\lambda f}{f}=\\lambda"],
      ["Sostituisci senza calcolatrice", "Tre hertz significano 3 cicli al secondo. Divido 12 m/s per 3/s: restano 4 m.", "\\lambda=\\frac{12}{3}=4\\,\\mathrm m"],
      ["Verifica il risultato", "Se passano 3 creste ogni secondo e la distanza fra creste è 4 m, in un secondo la perturbazione avanza di 12 m. Il controllo restituisce la velocità del testo.", "4\\cdot3=12"]
    ],
    graph: {
      x: "posizione x (m)", y: "spostamento (unità arbitrarie)", xmax: 8, ymin: -1, ymax: 1,
      samples: [[1, 1], [5, 1]], type: "wave",
      captions: [
        "Questo grafico è una fotografia dell'onda nello spazio, non un andamento nel tempo. L'asse orizzontale misura metri.",
        "Individua due creste successive: una è a x = 1 m e la successiva è a x = 5 m. Non misurare l'altezza della cresta.",
        "La distanza orizzontale fra le creste è 5 − 1 = 4 m. Questa è λ. Per trovare f usa v/λ = 12/4 = 3 Hz."
      ],
      trick: "Fra due creste su un grafico posizione-spostamento leggi λ; fra due massimi su un grafico tempo-spostamento leggi il periodo T. Stessa forma, unità diverse."
    },
    check: {
      prompt: "Un'onda si muove a 18 m/s e la distanza fra due creste è 6 m. Qual è la frequenza?",
      steps: ["La distanza fra creste è λ = 6 m.", "Da v = λ f divido entrambi i membri per λ.", "Ottengo f = v/λ = 18/6 = 3 Hz.", "Controllo: 3 cicli/s × 6 m/ciclo = 18 m/s."]
    },
    focus: [["C5-L02", "Periodo e lunghezza d'onda"], ["C5-L04", "Intensità e distanza"], ["C5-L10", "Lenti e immagini"]]
  }
};

const names = { C1:"Strumenti e meccanica", C2:"Fluidi", C3:"Termodinamica", C4:"Elettricità e magnetismo", C5:"Onde, ottica e radiazioni" };
const order = ["C1", "C2", "C3", "C4", "C5"];
const fmt = (n) => String(Math.round(n*100)/100).replace(".", ",");
const ktex = (tex) => '<div class="math" data-tex="' + esc(tex) + '">' + esc(tex) + '</div>';

function plot(g, stage) {
  const left=61, right=390, top=20, bottom=221;
  const sx=(n)=>left+((n)/(g.xmax))*(right-left);
  const sy=(n)=>bottom-((n-g.ymin)/(g.ymax-g.ymin))*(bottom-top);
  const n=(v)=>String(Math.round(v*10)/10);
  const p=(x,y)=>n(sx(x))+","+n(sy(y));
  const lines=[];
  for(let i=0;i<=4;i++){
    const x=sx(g.xmax*i/4), y=sy(g.ymin+(g.ymax-g.ymin)*i/4);
    lines.push('<line class="method-grid" x1="'+n(x)+'" y1="'+top+'" x2="'+n(x)+'" y2="'+bottom+'"/>');
    lines.push('<line class="method-grid" x1="'+left+'" y1="'+n(y)+'" x2="'+right+'" y2="'+n(y)+'"/>');
    lines.push('<text class="method-tick" x="'+n(x)+'" y="'+(bottom+16)+'" text-anchor="middle">'+esc(fmt(g.xmax*i/4))+'</text>');
    lines.push('<text class="method-tick" x="'+(left-10)+'" y="'+n(y+3)+'" text-anchor="end">'+esc(fmt(g.ymin+(g.ymax-g.ymin)*i/4))+'</text>');
  }
  const coords = g.type==="fourth"
    ? Array.from({length:81},(_,i)=>[2*i/80,Math.pow(2*i/80,4)])
    : g.type==="wave"
      ? Array.from({length:161},(_,i)=>[8*i/160,Math.sin(Math.PI*(8*i/160)/2)])
      : g.samples;
  const highlights = g.samples.filter((a)=>a[0]!==0 || a[1]!==0);
  let svg = '<svg class="method-plot" viewBox="0 0 420 270" role="img" aria-label="'+esc('Grafico: '+g.y+' in funzione di '+g.x)+ '">';
  svg += '<rect x="0" y="0" width="420" height="270" fill="transparent"/>'+lines.join("");
  svg += '<line class="method-axis" x1="'+left+'" y1="'+bottom+'" x2="'+right+'" y2="'+bottom+'"/>';
  svg += '<line class="method-axis" x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+bottom+'"/>';
  svg += '<text class="method-axis-label" x="390" y="259" text-anchor="end">'+esc(g.x)+'</text>';
  svg += '<text class="method-axis-label" x="65" y="12" text-anchor="start">'+esc(g.y)+'</text>';
  if(stage>=2){
    for(const a of highlights){
      svg += '<line class="method-guide" x1="'+n(sx(a[0]))+'" y1="'+n(sy(a[1]))+'" x2="'+n(sx(a[0]))+'" y2="'+bottom+'"/>';
      svg += '<line class="method-guide" x1="'+left+'" y1="'+n(sy(a[1]))+'" x2="'+n(sx(a[0]))+'" y2="'+n(sy(a[1]))+'"/>';
      svg += '<circle class="method-dot" cx="'+n(sx(a[0]))+'" cy="'+n(sy(a[1]))+'" r="4.5"/>';
    }
  }
  if(stage>=3){
    if(g.shade){
      const s=g.shade, x=sx(s[0]), width=sx(s[1])-x, y=sy(s[2]);
      svg += '<rect class="method-area" x="'+n(x)+'" y="'+n(y)+'" width="'+n(width)+'" height="'+n(bottom-y)+'"/>';
    }
    svg += '<polyline class="method-curve" points="'+coords.map((a)=>p(a[0],a[1])).join(" ")+'"/>';
    for(const a of highlights) svg += '<circle class="method-dot" cx="'+n(sx(a[0]))+'" cy="'+n(sy(a[1]))+'" r="4.5"/>';
  }
  return svg+'</svg>';
}

export function metodoContent(id){
  if(id==="C6"){
    return '<section class="method-intro"><h2>Strumenti comuni a tutte le unità</h2><p>Ogni argomento ha una formula da ricavare, un grafico da interpretare e un esercizio con controllo finale. Non imparare soltanto la risposta: ricostruisci il motivo di ogni operazione.</p><div class="method-cards">'+order.map((c)=>'<article class="method-card"><span class="meta">'+c+'</span><h3>'+esc(names[c])+'</h3><p>'+esc(methods[c].topic)+'</p>'+link('Apri formule, grafici e passaggi','corso/'+c+'/metodo',true)+'</article>').join("")+'</div></section>';
  }
  const m=methods[id];
  if(!m) return '<p>Questo percorso non dispone ancora di una scheda di metodo.</p>';
  const formula=m.steps.map((s,i)=>'<details class="method-step" '+(i===0?'open':'')+'><summary><span class="method-number">'+(i+1)+'</span><strong>'+esc(s[0])+'</strong></summary><p>'+esc(s[1])+'</p>'+ktex(s[2])+'</details>').join("");
  const graphs=m.graph.captions.map((description,i)=>'<figure class="method-figure"><div class="method-stage"><span>Disegno '+(i+1)+' di 3</span><strong>'+esc(["Leggo gli assi","Individuo i dati","Interpreto il fenomeno"][i])+'</strong></div>'+plot(m.graph,i+1)+'<figcaption>'+esc(description)+'</figcaption></figure>').join("");
  const solved=m.check.steps.map((s,i)=>'<li>'+esc(s)+'</li>').join("");
  return '<section class="method-intro"><div class="meta">Metodo di studio · '+id+'</div><h2>Formule inverse e lettura dei grafici</h2><p>'+esc(m.opening)+'</p><p class="method-rule">Regola comune: dati e unità → scelta della legge → isolamento dell’incognita → calcolo semplice → controllo fisico.</p></section>'+
   '<section class="method-part"><h2>1. Ricavare una formula senza indovinare</h2><p class="deck">'+esc(m.topic)+'. Apri un passaggio alla volta e prova a rifarlo su carta prima di guardare il successivo.</p><div class="method-steps">'+formula+'</div></section>'+
   '<section class="method-part"><h2>2. Capire davvero un grafico</h2><p class="deck">Tre disegni progressivi: prima gli assi, poi i punti importanti, infine la relazione fisica.</p><div class="method-graphs">'+graphs+'</div><aside class="method-tip"><h3>Trucco che evita errori</h3><p>'+esc(m.graph.trick)+'</p></aside></section>'+
   '<section class="method-part"><h2>3. Prova senza calcolatrice</h2><div class="method-card"><p class="exercise-prompt">'+esc(m.check.prompt)+'</p><details class="method-answer"><summary>Mostra la soluzione commentata, un passaggio alla volta</summary><ol>'+solved+'</ol></details></div></section>'+
   '<section class="method-part"><h2>4. Applica il metodo a problemi veri del microcorso</h2><p class="deck">Queste sono priorità editoriali, non statistiche sulle frequenze della prova ministeriale.</p><div class="method-links">'+m.focus.map((f)=>link(f[1],'materiale/'+f[0]+'/'+id)).join("")+link('Allenamento del modulo','allenamento/'+id,true)+link('Preparazione rapida','sprint')+'</div></section>';
}

export function sprintContent(){
  return crumb([['Inizio','home'],['Preparazione rapida']])+
    head('Preparazione rapida all’esame','Parti dagli esercizi e rientra nella teoria soltanto quando ne hai bisogno. Il percorso è editoriale: il Ministero non assegna frequenze ufficiali ai singoli argomenti.','SEMESTRE APERTO · FISICA 2026/27')+
    '<section class="method-intro"><h2>Due modi diversi di usare l’Officina</h2><div class="method-cards"><article class="method-card"><h3>Studiare un microcorso</h3><p>Spiegazioni complete, esempi, grafici, laboratorio ed esercizi in ordine crescente di difficoltà.</p>'+link('Scegli un microcorso','percorsi')+'</article><article class="method-card"><h3>Prepararsi in fretta</h3><p>Prova subito un quesito; se sbagli, riparti da formula, grafico e ragionamento. Poi affronta un caso diverso.</p>'+link('Apri gli esercizi misti','allenamento/C6',true)+'</article></div></section>'+
    '<section class="method-part"><h2>Sequenza operativa</h2><ol class="method-checklist"><li><strong>Diagnosi.</strong> Entra nel percorso completo C6 e apri la diagnosi per scoprire quali modelli confondi.</li><li><strong>Recupera i fondamentali.</strong> Nei cinque moduli ripeti la stessa routine: formula inversa, grafico, calcolo mentale e verifica delle unità.</li><li><strong>Esercizi a tempo.</strong> Allenati su più famiglie; dopo l’errore rileggi soltanto la spiegazione collegata e riprova un caso diverso.</li><li><strong>Simulazione fedele.</strong> In C6 usa una prova da 31 quesiti e 50 minuti: 21 a scelta, 10 a completamento. Correggi gli errori soltanto dopo la consegna.</li></ol></section>'+
    '<section class="method-part"><h2>Cosa ripassare nei cinque microcorsi</h2><div class="method-cards">'+order.map((id)=>'<article class="method-card"><span class="meta">'+id+' · '+esc(names[id])+'</span><h3>'+esc(methods[id].topic)+'</h3><p>'+esc(methods[id].graph.trick)+'</p><div class="method-links">'+link('Formule, grafici e disegni','corso/'+id+'/metodo')+link('Vai ai quesiti','corso/'+id+'/esercizi')+'</div></article>').join("")+'</div></section>'+
    '<section class="method-part"><h2>Prova ufficiale: non confondere le regole con i nostri esercizi</h2><p>Il D.M. 941/2026 stabilisce 31 quesiti, 50 minuti, +1 per una risposta corretta, −0,1 per una errata e 0 per una omessa. La prova ordinaria si svolge senza calcolatrice; gli eventuali strumenti compensativi sono disciplinati dalle regole applicabili dell’ateneo. Gli esercizi di questa sezione sono originali e servono ad allenare le abilità, non sono domande ufficiali.</p><div class="method-links">'+link('Diagnosi e simulazioni C6','allenamento/C6',true)+link('Fonti MUR','fonti')+'</div></section>';
}

export const metodoModuli = order;
