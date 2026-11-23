(function prototipi(){
  'use strict';
  const $ = selector => document.querySelector(selector);
  const main = $('#lavoro'), bar = $('#top');
  const titles = {index:'Il ritorno basta? · Officina di Fisica',passo:'Passo',campo:'Campo',margine:'Margine'};
  const sourceText='Un sensore registra +3 m/s per 4 s e poi −2 m/s per 5 s, con inversione idealizzata istantanea. Calcola lo spostamento complessivo.';
  const situation='Cammini a +3 m/s per 4 s, poi a −2 m/s per 5 s.';
  const choices=[['avanti','Più avanti'],['zero','Alla partenza'],['indietro','Più indietro']];
  const initial = () => ({
    passo:{stage:'start',choice:'',hint:false,transfer:'',done:false},
    campo:{stage:'start',duration:5,t:0,choice:'',view:'pista',angle:-30,transfer:'',done:false},
    margine:{stage:'start',parts:['','',''],transfer:'',done:false}
  });
  const state = initial();
  const memory = 'ardesia:studio-concept:1.0';
  // Persist only whitelisted lesson states and short numeric strings on this tab.
  function draft(v){return typeof v==='string'&&v.length<=12&&/^[\d\s+,.−-]*$/.test(v)?v:''}
  try {
    const saved = JSON.parse(sessionStorage.getItem(memory) || '{}');
    for(const key of Object.keys(state)){
      const a = saved?.[key], b=state[key];
      if(!a||typeof a!=='object')continue;
      if(['start','worked','transfer',...(key==='campo'?['predict']:[])].includes(a.stage))b.stage=a.stage;
      if('choice' in b && choices.some(([v])=>v===a.choice)) b.choice=a.choice;
      if(key==='passo')b.hint=a.hint===true;
      if(key==='campo'){
        if(Number.isInteger(a.duration)&&a.duration>=0&&a.duration<=8)b.duration=a.duration;
        if(Number.isInteger(a.t)&&a.t>=0&&a.t<=4+b.duration)b.t=a.t;
        if(['pista','chart','table'].includes(a.view))b.view=a.view;
        if(a.space===true || (a.space===false && a.stage==='start' && a.view==='chart'))b.view='pista';
        if([-30,0,30].includes(a.angle))b.angle=a.angle;
      }
      if(key==='margine'&&Array.isArray(a.parts)&&a.parts.length===3)b.parts=a.parts.map(draft);
      b.transfer=draft(a.transfer);b.done=b.stage==='transfer'&&a.done===true&&moto.numero(b.transfer)===-2;
    }
  } catch { /* La sessione funziona in memoria anche con storage disattivato. */ }
  function save(){try{sessionStorage.setItem(memory,JSON.stringify(state))}catch{/* disponibilità facoltativa */}}
  const name = () => Object.hasOwn(state, location.hash.slice(1)) ? location.hash.slice(1) : 'index';
  function graph(duration,mode,{time=null,cells=false}={}) {
    const obs=moto.osserva(duration), instrument=mode==='campo';
    const W=400,H=181,left=42,right=368,base=99,unit=16;
    const span=instrument?12:Math.max(9,obs.totale);
    const x=t=>left+(right-left)*t/span,y=v=>base-v*unit, split=x(4),end=x(obs.totale);
    const label=(a,b,s,anchor='middle')=>`<text class="svg-text charttext" x="${a}" y="${b}" text-anchor="${anchor}">${s}</text>`;
    const line=(a,b,c,d,cl,extra='')=>`<line class="${cl}" x1="${a}" y1="${b}" x2="${c}" y2="${d}" ${extra}/>`;
    const hatch=(id,angle,color)=>`<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="0" x2="0" y2="8" stroke="${color}" stroke-opacity=".43" stroke-width="2"/></pattern>`;
    const ticks=[...new Set([0,4,obs.totale,...(instrument?[12]:[])])];
    const cell=(id,ink)=>`<pattern id="${id}" x="${left}" y="${base}" width="${x(1)-left}" height="${unit}" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="${ink}" opacity=".12"/><path d="M0 ${unit}V0H${x(1)-left}" fill="none" stroke="${ink}" stroke-width="1.5"/></pattern>`;
    const description='Velocità in funzione del tempo. Da zero a quattro secondi, più tre metri al secondo. '+(duration===0?'Il ritorno dura zero secondi.':`Per i successivi ${duration} secondi, meno due metri al secondo.`);
    return `<figure class="chart"><svg role="img" aria-label="${description}${cells?' Ogni casella corrisponde a un metro.':''}${time===null?'':` Cursore al secondo ${time}.`}" viewBox="0 0 ${W} ${H}">
      <defs>${cells?cell('out','var(--plus)')+cell('back','var(--minus)'):hatch('out',42,'var(--plus)')+hatch('back',-42,'var(--minus)')}</defs>
      ${instrument?[3,1,-2].map(v=>line(left,y(v),right,y(v),'grid')).join(''):''}
      ${ticks.map(t=>line(x(t),base-4,x(t),base+4,'axes')).join('')}
      <rect x="${left}" y="${y(3)}" width="${split-left}" height="${3*unit}" fill="url(#out)"/>
      ${duration?`<rect x="${split}" y="${base}" width="${end-split}" height="${2*unit}" fill="url(#back)"/>`:''}
      ${line(left,base,right+9,base,'axes','stroke-width="1.6"')}${line(left,y(4)-7,left,y(-3)-1,'axes','stroke-width="1.6"')}
      <path d="M${right+9} ${base}l-7 -3v6z M${left} ${y(4)-8}l-3 7h6z" fill="var(--ink)"/>
      ${line(left,y(3),split,y(3),'outbound','stroke-width="4"')}${duration?line(split,y(-2),end,y(-2),'inbound','stroke-width="4"'):''}
      ${line(split,y(3),split,duration?y(-2):base,'axes','stroke-dasharray="3 4" opacity=".65"')}
      ${duration?line(end,base,end,y(-2),'axes','stroke-dasharray="3 4" opacity=".65"'):''}
      ${label(left,19,'v (m/s)','start')}${label(right+12,174,'t (s)','end')}
      ${[3,0,-2].map(v=>label(left-8,y(v)+5,moto.firma(v),'end')).join('')}
      ${ticks.map(t=>label(x(t),159,t)).join('')}
      ${cells?'':`<text x="${(left+split)/2}" y="${base-14}" class="symbol" fill="var(--plus)" text-anchor="middle">+</text>`}
      ${!cells&&duration>=2?`<text x="${(split+end)/2}" y="${base+24}" class="symbol" fill="var(--minus)" text-anchor="middle">−</text>`:''}
      ${time===null?'':`<g class="clock-cursor"><path d="M${x(time)} 38V139" stroke="var(--ink)" stroke-width="2" stroke-dasharray="2 3"/><path d="M${x(time)-4} 33h8l-4 6z" fill="var(--ink)"/></g>`}
      </svg></figure>`;
  }
  function dataTable(duration,time) {
    const frame=moto.osserva(duration,time);
    return `<table class="graph-data"><caption>Metri accumulati al secondo ${time}</caption>
      <thead><tr><th scope="col">Tratto</th><th scope="col">Tempo trascorso (s)</th><th scope="col">v (m/s)</th><th scope="col">Δx (m)</th></tr></thead>
      <tbody><tr><th scope="row">Andata</th><td>${Math.min(time,moto.andata)}</td><td>+3</td><td>${moto.firma(frame.prima)}</td></tr><tr><th scope="row">Ritorno</th><td>${Math.max(0,time-moto.andata)}</td><td>−2</td><td>${moto.firma(frame.seconda)}</td></tr></tbody></table>`;
  }

  function spatial(duration, time, degrees) {
    const frame=moto.osserva(duration,time), position=frame.x;
    const angle=degrees*Math.PI/180;
    // Orthographic camera. The track's longitudinal coordinate is in metres.
    function project(x,y,z) {
      const offset=x-4;
      return [258+24*(offset*Math.cos(angle)+z*Math.sin(angle)),
              91+5.6*(-offset*Math.sin(angle)+z*Math.cos(angle))-22*y];
    }
    function line(p,q,stroke,width=1) {
      const [x1,y1]=project(...p), [x2,y2]=project(...q);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
    }
    function face(corners,fill) {
      return `<polygon points="${corners.map(p=>project(...p).join(',')).join(' ')}" fill="${fill}"/>`;
    }
    function textAt(x,z,text,offset=0) {
      const [px,py]=project(x,0,z);
      return `<text class="ruler-label" x="${px}" y="${py+offset}" text-anchor="middle">${text}</text>`;
    }
    function displacement(start,end,z,ink,part) {
      if(start===end)return '';
      const head=end-Math.sign(end-start)*.48;
      return `<g data-tratto="${part}">${line([start,.04,z],[head,.04,z],ink,3.5)}
        ${face([[end,.04,z],[head,.04,z-.48],[head,.04,z+.48]],ink)}</g>`;
    }
    const near=2.6, far=-near, left=-5, right=13;
    const deck=face([[left,0,near],[right,0,near],[right,-.38,near],[left,-.38,near]],'#536471')
      +face([[left,0,far],[right,0,far],[right,0,near],[left,0,near]],'#273b48');
    const graduations=[];
    for(let x=-4;x<=12;x++) {
      const major=x%4===0;
      graduations.push(line([x,0,major ? 0.4 : 1.7],[x,0,near],major?'#dce6e7':'#91a6ab',major?1.8:1));
      if(major)graduations.push(textAt(x,near,moto.firma(x),27));
    }
    const index=face([[position-.38,.02,-.6],[position+.38,.02,-.6],[position+.38,.02,.6],[position-.38,.02,.6]],'#83e4da');
    const [cx,cy]=project(position,1.35,0), [footX,footY]=project(position,0,0);
    return `<svg viewBox="0 14 516 170" role="img" aria-label="Pista in 3D. Il segnalino è a ${moto.firma(position)} metri al secondo ${time}. Ogni tacca vale un metro. Andata ${moto.firma(frame.prima)} metri, ritorno ${moto.firma(frame.seconda)} metri.">
      ${deck}${line([left,0,far],[right,0,far],'#779098')}${line([left,0,near],[right,0,near],'#d0dbdc')}
      ${graduations.join('')}${line([0,.01,far],[0,.01,near],'#dce6e7',2)}
      ${displacement(0,frame.prima,-1.5,'var(--plus)','andata')}${displacement(frame.prima,position,-.1,'var(--minus)','ritorno')}
      ${index}${line([position,0,0],[position,1.35,0],'var(--plus)',3)}
      <circle cx="${footX}" cy="${footY}" r="3" fill="var(--ground)" stroke="var(--plus)" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="var(--plus)" stroke="var(--ground)" stroke-width="2"/>
      <text x="506" y="178" class="ruler-unit" text-anchor="end">x (m)</text></svg>`;
  }
  function home() {
    return `<div class="wrap content case-index">
      <div class="case-intro"><h1>Il ritorno basta?</h1>
        <p class="lead">Avanzi per quattro secondi, poi torni indietro per cinque. Alla fine da che parte della tacca di partenza ti trovi?</p></div>
      <section class="sensor" aria-labelledby="sensor-title"><h2 id="sensor-title">La traccia del sensore</h2>${graph(5,'indice')}</section>
      <nav class="routes" aria-label="Tre modi di risolvere il problema">
        <h2>Risolvi il problema</h2>
        <a href="#passo"><strong>Passo</strong><span>Confronta le due aree del grafico.</span><b aria-hidden="true">→</b></a>
        <a href="#campo"><strong>Campo</strong><span>Apri la pista in 3D e cambia la durata del ritorno.</span><b aria-hidden="true">→</b></a>
        <a href="#margine"><strong>Margine</strong><span>Scrivi i tre passaggi, qui o su carta.</span><b aria-hidden="true">→</b></a>
      </nav></div>`;
  }
  function radios(value){return `<fieldset><legend>Rispetto alla partenza ti trovi…</legend><div class="choices">${choices.map(([v,label])=>`<label class="choice"><input type="radio" name="previsione" value="${v}" ${v===value?'checked':''}>${label}</label>`).join('')}</div></fieldset>`}
  function calculation(d){
    const m=moto.osserva(d);
    return `<p class="eq">Andata &nbsp; +3 m/s × 4 s = +12 m</p><p class="eq">Ritorno &nbsp; −2 m/s × ${d} s = ${moto.firma(m.seconda)} m</p><p class="eq">Spostamento &nbsp; +12 m + (${moto.firma(m.seconda)} m) = ${moto.firma(m.x)} m</p>`;
  }
  function interpretation(choice,x){
    const expected=x>0?'avanti':x<0?'indietro':'zero';
    return `${choice===expected?'La tua previsione coincide con la misura.':'Rivedi la previsione confrontando le due aree.'} ${x>0?'Ti trovi oltre la partenza.':x<0?'Sei tornato oltre il punto di partenza, nel verso negativo.':'Torni esattamente alla partenza.'}`;
  }
  function transfer(s){
    return `<div class="stack"><h2 tabindex="-1" id="phase">Prova con 7 s</h2><p>Cammini ancora a +3 m/s per 4 s. Questa volta torni a −2 m/s per 7 s. Quanto vale lo spostamento finale?</p>
      <form id="transfer" novalidate class="stack"><label class="input-label">Spostamento finale (m)<input type="text" inputmode="text" maxlength="12" autocomplete="off" id="tx" aria-describedby="tx-message"></label>
      <button class="primary">Controlla il risultato</button><p class="notice" id="tx-message" role="status">${s.done?'Hai ottenuto −2 m. Il ritorno vale −14 m e supera i 12 m di andata.':''}</p></form><div class="actions"><button type="button" id="restart">Ricomincia la prova</button><a class="compare-link" href="#index">Torna al confronto</a></div></div>`;
  }
  function bindTransfer(s){
    const field=$('#tx');field.value=s.transfer;
    field.oninput=()=>{s.transfer=draft(field.value);s.done=false;$('#tx-message').textContent='';field.removeAttribute('aria-invalid');save()};
    $('#transfer').onsubmit=e=>{e.preventDefault();const v=moto.numero(field.value);const ok=v===moto.osserva(7).x;s.done=ok;save();
      $('#tx-message').textContent=ok?'Hai ottenuto −2 m. Il ritorno vale −14 m e supera i 12 m di andata.':!Number.isFinite(v)?'Scrivi lo spostamento in metri. Puoi usare il segno meno.':v===26?'26 m è la distanza totale. Sottrai i 14 m di ritorno dai 12 m di andata.':v===2?'Due metri è lo scarto giusto. Pensa da che parte dello zero arrivi dopo 14 m di ritorno.':'Calcola prima il ritorno con (−2 m/s) × 7 s. Poi aggiungilo ai 12 m di andata.';
      field.setAttribute('aria-invalid',String(!ok));if(!ok)field.focus()};
    $('#restart').onclick=()=>{state[name()]=initial()[name()];show('h1')};
  }
  function prediction(s,onSubmit){
    $('form#prediction').onchange=e=>{s.choice=e.target.value;$('#prediction-message').textContent='';save()};
    $('#prediction').onsubmit=e=>{e.preventDefault();if(!s.choice){$('#prediction-message').textContent='Scegli una previsione per controllarla.';$('input[name=previsione]').focus();return}onSubmit()};
  }
  function stepLink(s){$('#to-transfer').onclick=()=>{s.stage='transfer';show('#phase')}}
  function pass(){
    const s=state.passo,n=['start','worked','transfer'].indexOf(s.stage)+1;
    const rail=`<aside class="rail" aria-label="Avanzamento"><h2>In questo esercizio</h2><ol>${['Fai una previsione','Leggi le due aree','Prova con 7 s'].map((v,i)=>`<li ${n===i+1?'aria-current="step"':''}>${v}</li>`).join('')}</ol><span class="mobile-step">Passo ${n} di 3</span></aside>`;
    let body=`<h1 tabindex="-1">Dove ti fermi?</h1><p class="lead">${situation}</p>`;
    if(s.stage==='start') {
      body+=`<div class="plot">${graph(5,'passo',{cells:s.hint})}</div>
        <details id="hint" ${s.hint?'open':''}><summary>Mi serve un indizio</summary>
          <p>Ora il grafico è diviso in caselle. Una casella vale 1 s × 1 m/s, cioè 1 m. Conta le caselle sopra lo zero, poi quelle sotto. Quale gruppo è più numeroso?</p></details>
        <form id="prediction" novalidate>${radios(s.choice)}<p class="notice" id="prediction-message" role="status"></p><button class="primary">Controlla la previsione</button></form>`;
    }
    else if(s.stage==='worked'){
      const feedback={avanti:'Hai previsto il verso giusto. Conta i metri che restano dopo il ritorno.',indietro:'Hai scelto «Più indietro». Il ritorno dura un secondo in più, ma in ciascun secondo percorri solo 2 m.',zero:'Hai scelto «Alla partenza». Per tornare sullo zero dovresti cancellare tutte le caselle dell’andata.'};
      body=`<h1 id="phase" tabindex="-1">Restano due metri</h1><p class="lead">${feedback[s.choice]||feedback.avanti}</p>
        <div class="plot">${graph(5,'passo',{cells:true})}</div><div class="stack follow"><h2>Conta un metro per casella</h2>
        <p>Sopra lo zero ci sono 4 colonne da 3 caselle. Sotto ce ne sono 5 da 2. Ogni casella del ritorno cancella un metro di andata.</p>${calculation(5)}
        <p>In tutto hai camminato per 22 m. Ti fermi 2 m oltre la tacca di partenza.</p><button class="primary" id="to-transfer">Prova con 7 s</button></div>`;
    } else body='<h1 tabindex="-1">Un altro ritorno</h1><div class="follow">'+transfer(s)+'</div>';
    main.innerHTML=`<div class="wrap lesson-grid">${rail}<article class="session content">${body}</article></div>`;
    if(s.stage==='start'){
      prediction(s,()=>{s.stage='worked';show('#phase')});
      $('#hint').ontoggle=e=>{s.hint=e.target.open;$('.session .plot').innerHTML=graph(5,'passo',{cells:s.hint});save()};
    }
    else if(s.stage==='worked')stepLink(s);else bindTransfer(s);
  }
  function fieldLab() {
    const s=state.campo;
    const heading=`<h1 tabindex="-1">La pista del ritorno</h1>`;
    if(s.stage==='transfer') {
      main.innerHTML=`<div class="wrap content">${heading}<div class="detail-panel">${transfer(s)}</div></div>`;
      bindTransfer(s);
      return;
    }
    const measured=s.stage==='worked';
    const total=moto.osserva(s.duration).totale;
    const lastTime=measured?total:moto.andata;
    s.t=Math.min(s.t,lastTime);
    const views=[['pista','Pista 3D'],['chart','Grafico'],['table','Tabella']];
    const durations=`<div class="stepper"><button id="less" aria-label="− Riduci di un secondo">−</button>
      <select id="duration" aria-labelledby="dur">${Array.from({length:9},(_,seconds)=>`<option value="${seconds}" ${seconds===s.duration?'selected':''}>${seconds} s</option>`).join('')}</select><button id="more" aria-label="+ Aumenta di un secondo">+</button></div>`;
    main.innerHTML=`<div class="wrap content">${heading}
      <p class="lead">Parti dallo zero. Per 4 s avanzi a 3 m/s. Poi torni a 2 m/s.</p>
      <div class="instrument"><section class="bench" aria-label="Banco di misura">
        <div class="switcher" role="group" aria-label="Rappresentazione">${views.map(([id,text])=>`<button id="${id}" aria-pressed="${s.view===id}">${text}</button>`).join('')}</div>
        <div id="plot" class="bench-view"></div>
        <div id="viewpoint"><label for="angle">Vista</label><select id="angle"><option value="-30">Da sinistra</option><option value="0">Frontale</option><option value="30">Da destra</option></select></div>
        <div class="bench-clock"><div class="readings"><label for="timeline">Tempo <output id="time" for="timeline"></output></label>
          <span>Posizione <output id="instant" for="timeline"></output></span></div>
          <input id="timeline" type="range" class="range" min="0" max="${lastTime}" value="${s.t}" step="1" aria-label="Istante sulla pista">
        </div></section>
        <section class="console"><h2 id="dur">Durata del ritorno</h2>${durations}
        <div id="start-action" ${s.stage==='start'?'':'hidden'}><p>Sposta il tempo fino a 4 s. Poi prevedi dove ti fermerai.</p><button class="primary" id="predict">Fissa la previsione</button></div>
        <div id="below"></div></section></div></div>`;

    function updateView() {
      const {x}=moto.osserva(s.duration,s.t);
      const plot=$('#plot');
      // Preserve focus on the camera and slider while their figure is redrawn.
      if(s.view==='pista')plot.innerHTML=spatial(s.duration,s.t,s.angle);
      else if(s.view==='chart')plot.innerHTML=graph(s.duration,'campo',{time:s.t});
      else plot.innerHTML=dataTable(s.duration,s.t);
      $('#viewpoint').hidden=s.view!=='pista';
      $('#time').textContent=s.t+' s';
      $('#instant').textContent=moto.firma(x)+' m';
      $('#timeline').setAttribute('aria-valuetext',s.t+' secondi, posizione '+moto.firma(x)+' metri');
      save();
    }
    for(const [id] of views)$('#'+id).onclick=()=>{
      s.view=id;
      for(const [key] of views)$('#'+key).setAttribute('aria-pressed',String(id===key));
      updateView();
    };
    $('#angle').value=String(s.angle);
    $('#angle').onchange=e=>{s.angle=Number(e.target.value);updateView()};
    $('#timeline').oninput=e=>{s.t=Number(e.target.value);updateView()};

    const duration=$('#duration');
    function changeDuration(value) {
      s.duration=Math.min(8,Math.max(0,value));
      s.t=0;s.stage='start';s.choice='';
      $('#below').replaceChildren();
      $('#start-action').hidden=false;
      $('#timeline').max=moto.andata;
      duration.value=s.duration;
      $('#less').disabled=s.duration===0;
      $('#more').disabled=s.duration===8;
      $('#timeline').value=0;
      updateView();
    }
    $('#less').disabled=s.duration===0;
    $('#more').disabled=s.duration===8;
    duration.onchange=e=>changeDuration(Number(e.target.value));
    $('#less').onclick=()=>{changeDuration(s.duration-1);if(s.duration===0)duration.focus()};
    $('#more').onclick=()=>{changeDuration(s.duration+1);if(s.duration===8)duration.focus()};
    const below=$('#below');
    $('#predict').onclick=()=>{s.stage='predict';show('#phase')};
    if(s.stage==='predict') {
      below.innerHTML=`<form novalidate id="prediction" class="stack"><h2 id="phase" tabindex="-1">Dopo ${total} secondi</h2>
        ${radios(s.choice)}<p class="notice" id="prediction-message" role="status"></p><button class="primary">Misura la posizione</button></form>`;
      prediction(s,()=>{s.stage='worked';s.t=total;show('#timeline')});
    } else if(measured) {
      const m=moto.osserva(s.duration);
      below.innerHTML=`<div class="stack"><h2 id="phase" tabindex="-1">Posizione finale ${moto.firma(m.x)} m</h2>
        <p>${interpretation(s.choice,m.x)}</p>${calculation(s.duration)}<button id="to-transfer" class="primary">Prova con 7 s</button></div>`;
      stepLink(s);
    }
    updateView();
  }
  const sources=`<details><summary>Leggi la fonte</summary><p>Officina di Fisica · C1-Q027, versione 2 · «Aree di segno opposto».</p><p>${sourceText}</p></details>`;
  function notebook(){
    const s=state.margine;
    const labels=['Andata','Ritorno','Spostamento'];
    const operations=['(+3 m/s) × 4 s','(−2 m/s) × 5 s','Andata + ritorno'];
    const rows=labels.map((label,i)=>`<div class="book-row"><label for="n${i}">${label}<span class="sr"> (m)</span></label>
      <div class="book-sum"><span id="formula${i}">${operations[i]}</span><span aria-hidden="true">=</span>
      <input type="text" id="n${i}" inputmode="text" maxlength="12" autocomplete="off" aria-describedby="formula${i} note${i}"><span aria-hidden="true">m</span></div>
      <p id="note${i}" class="notice" role="status"></p></div>`).join('');
    main.innerHTML=`<div class="wrap content"><h1 tabindex="-1">Il segno del ritorno</h1><div class="spread"><section><h2>I dati del sensore</h2><p class="lead">${situation}</p><div class="plot">${graph(5,'margine')}</div></section>
    <section><h2>I tuoi conti</h2><div class="print-only"><p>Completa i tre passaggi. Mantieni il segno di ogni spostamento.</p>${labels.map((l,i)=>`<p class="ruled">${l} &nbsp; ${operations[i]} = __________ m</p>`).join('')}<p class="ruled">Controllo · Quanti secondi di ritorno servirebbero per arrivare allo zero?</p><p>C1-Q027 · v2 · Officina di Fisica</p></div>
    <div class="screen-only">${s.stage==='transfer'?transfer(s):`<form class="notebook-form" id="notebook" novalidate>${rows}<button class="primary">Verifica i passaggi</button></form><div id="book-result" class="follow"></div>`}</div></section></div><div class="book-tools"><button class="print-button" id="print">Scheda da stampare</button>${sources}</div></div>`;
    $('#print').onclick=()=>window.print();
    if(s.stage==='transfer'){bindTransfer(s);return}
    function result(){const el=$('#book-result');el.innerHTML=s.stage==='worked'?`<div class="stack"><h3 tabindex="-1" id="phase">I tre passaggi tornano</h3><p>Ti fermi a +2 m. Per tornare alla partenza a −2 m/s sarebbero serviti 6 s.</p><button id="to-transfer">Prova con 7 s</button></div>`:'';if(s.stage==='worked')stepLink(s)}
    const m=moto.osserva(5),expected=[m.prima,m.seconda,m.x];
    function addends(){
      const [out,back]=s.parts.map(moto.numero);
      $('#formula2').textContent=Number.isFinite(out)&&Number.isFinite(back)?
        moto.firma(out)+' m + ('+moto.firma(back)+' m)':operations[2];
    }
    for(let i=0;i<3;i++){
      const field=$('#n'+i);field.value=s.parts[i];field.oninput=()=>{s.stage='start';s.parts[i]=draft(field.value);for(let n=0;n<3;n++){$('#note'+n).textContent='';$('#n'+n).removeAttribute('aria-invalid')}addends();result();save()};
    }
    addends();
    $('#notebook').onsubmit=e=>{
      e.preventDefault();const inputs=labels.map((_,n)=>$('#n'+n));
      const wrong=inputs.findIndex((input,i)=>moto.numero(input.value)!==expected[i]);
      if(wrong<0){s.stage='worked';result();$('#phase').focus();save();return}
      const f=inputs[wrong],val=moto.numero(f.value);
      const hints=['Per quattro secondi aggiungi 3 m ogni secondo. Quanto fa 3 + 3 + 3 + 3?',val===10?'Hai scritto +10 m. Sono dieci metri percorsi nel verso negativo. Quale segno va davanti al 10?':'Per cinque secondi perdi 2 m ogni secondo. Conta quei metri nel verso negativo.',val===22?'22 m è la distanza camminata. Per lo spostamento togli i 10 m di ritorno dai 12 m di andata.':'Guarda gli addendi sulla riga. Parti da +12 m e spostati di 10 m verso lo zero.'];
      $('#note'+wrong).textContent=Number.isFinite(val)?hints[wrong]:'Scrivi un numero in metri, con il segno quando serve.';f.setAttribute('aria-invalid','true');f.focus()
    };result();
  }
  function show(focus){
    const key=name();save();document.documentElement.className=key;document.body.className=key;
    document.title=(key==='index'?titles.index:titles[key]+' · Laboratorio di progetto');
    bar.innerHTML=`<div class="wrap head"><span class="word">${key==='index'?'Officina di Fisica':titles[key]}</span>${key==='index'?'<span class="edition">C1 · Moto e forze</span>':'<a class="compare-link" href="#index">Confronto</a>'}</div>`;
    if(key==='passo')pass();else if(key==='campo')fieldLab();else if(key==='margine')notebook();else main.innerHTML=home();
    if(focus){const target=$(focus);if(target){target.focus();target.scrollIntoView({block:'nearest'})}}
  }
  // The native skip link must not be interpreted as a route.
  $('.skip').onclick=e=>{e.preventDefault();main.focus();main.scrollIntoView()};
  window.addEventListener('hashchange',()=>{show();window.scrollTo(0,0);main.focus({preventScroll:true})});
  show();
})();
