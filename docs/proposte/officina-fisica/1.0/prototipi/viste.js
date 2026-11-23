(function prototipi(){
  'use strict';
  const $ = selector => document.querySelector(selector);
  const main = $('#lavoro'), bar = $('#top');
  const titles = {index:'Tre modi di studiare fisica',passo:'Passo',campo:'Campo',margine:'Margine'};
  const marks = {
    passo:'<path d="M2 22h9v-7h9V8h10V3h7"/>',
    campo:'<path d="M1 16h7l4-6 5 12 5-20 5 18 4-9 3 5h5"/>',
    margine:'<path d="M2 5c7-1 12 0 17 5 5-5 10-6 17-5v15c-7-1-13 0-17 4-5-4-11-5-17-4z"/>'
  };
  const sourceText='Un sensore registra +3 m/s per 4 s e poi −2 m/s per 5 s, con inversione idealizzata istantanea. Calcola lo spostamento complessivo.';
  const situation='Cammini a +3 m/s per 4 s, poi a −2 m/s per 5 s.';
  const choices=[['avanti','Più avanti'],['zero','Alla partenza'],['indietro','Più indietro']];
  const initial = () => ({
    passo:{stage:'start',choice:'',hint:false,transfer:'',done:false},
    campo:{stage:'start',duration:5,t:0,choice:'',view:'chart',angle:30,space:false,transfer:'',done:false},
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
        if(a.view==='table')b.view='table';
        if([-30,0,30].includes(a.angle))b.angle=a.angle;
        b.space=a.space===true;
      }
      if(key==='margine'&&Array.isArray(a.parts)&&a.parts.length===3)b.parts=a.parts.map(draft);
      b.transfer=draft(a.transfer);b.done=b.stage==='transfer'&&a.done===true&&moto.numero(b.transfer)===-2;
    }
  } catch { /* La sessione funziona in memoria anche con storage disattivato. */ }
  function save(){try{sessionStorage.setItem(memory,JSON.stringify(state))}catch{/* disponibilità facoltativa */}}
  const name = () => Object.hasOwn(state, location.hash.slice(1)) ? location.hash.slice(1) : 'index';
  function logo(key){return `<svg aria-hidden="true" viewBox="0 0 40 28">${marks[key]}</svg>`}
  function graph(duration,mode) {
    const obs=moto.osserva(duration), instrument=mode==='campo';
    const W=400,H=181,left=42,right=368,base=99,unit=16;
    const span=instrument?12:Math.max(9,obs.totale);
    const x=t=>left+(right-left)*t/span,y=v=>base-v*unit, split=x(4),end=x(obs.totale);
    const label=(a,b,s,anchor='middle')=>`<text class="svg-text charttext" x="${a}" y="${b}" text-anchor="${anchor}">${s}</text>`;
    const line=(a,b,c,d,cl,extra='')=>`<line class="${cl}" x1="${a}" y1="${b}" x2="${c}" y2="${d}" ${extra}/>`;
    const hatch=(id,angle,color)=>`<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="0" x2="0" y2="8" stroke="${color}" stroke-opacity=".43" stroke-width="2"/></pattern>`;
    const ticks=[...new Set([0,4,obs.totale,...(instrument?[12]:[])])];
    return `<figure class="chart"><svg role="img" aria-label="Velocità in funzione del tempo. Da zero a quattro secondi, più tre metri al secondo. ${duration===0?'Il ritorno dura zero secondi.':`Per i successivi ${duration} secondi, meno due metri al secondo.`}" viewBox="0 0 ${W} ${H}">
      <defs>${hatch('out',42,'var(--plus)')}${hatch('back',-42,'var(--minus)')}</defs>
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
      <text x="${(left+split)/2}" y="${base-14}" class="symbol" fill="var(--plus)" text-anchor="middle">+</text>
      ${duration>=2?`<text x="${(split+end)/2}" y="${base+24}" class="symbol" fill="var(--minus)" text-anchor="middle">−</text>`:''}
      </svg></figure>`;
  }
  function dataTable(d){return `<table class="graph-data"><caption>Misure dei due tratti</caption><thead><tr><th scope="col">Tratto</th><th scope="col">Durata (s)</th><th scope="col">Velocità (m/s)</th></tr></thead><tbody><tr><th scope="row">Andata</th><td>4</td><td>+3</td></tr><tr><th scope="row">Ritorno</th><td>${d}</td><td>−2</td></tr></tbody></table>`}
  function ruler(t,d){
    const {x}=moto.osserva(d,t),px=v=>57+(v+4)*20;
    return `<svg viewBox="0 0 450 53" role="img" aria-label="Posizione a ${t} secondi: ${moto.firma(x)} metri.">
      <path class="axes" d="M48 19H401"/><g class="svg-text">${[-4,0,4,8,12].map(v=>`<path class="axes" d="M${px(v)} 14v11"/><text text-anchor="middle" x="${px(v)}" y="44">${v===0?0:moto.firma(v)}</text>`).join('')}<text x="443" y="23" text-anchor="end">x (m)</text></g>
      <circle cx="${px(x)}" cy="19" r="7" fill="var(--plus)" stroke="var(--ink)" stroke-width="2"/></svg>`;
  }
  function spatial(d,t,degrees){
    const pos=moto.osserva(d,t).x, rad=degrees*Math.PI/180;
    function project(x,y,z){const u=(x-4)*Math.cos(rad)+z*Math.sin(rad),depth=-(x-4)*Math.sin(rad)+z*Math.cos(rad);return [250+20*u,90+depth*6-y*21].join(',')}
    function segment(p,q,ink,width=1){return `<line x1="${p.split(',')[0]}" y1="${p.split(',')[1]}" x2="${q.split(',')[0]}" y2="${q.split(',')[1]}" stroke="${ink}" stroke-width="${width}"/>`}
    const lanes=[-2,2].map(z=>segment(project(-5,0,z),project(13,0,z),'var(--edge)',2)).join('');
    const ticks=Array.from({length:19},(_,i)=>segment(project(i-5,0,-2),project(i-5,0,2),'var(--rule)')).join('');
    const face=(pts,fill)=>`<polygon points="${pts.map(p=>project(...p)).join(' ')}" fill="${fill}" stroke="var(--ground)" stroke-width="1.4"/>`;
    const lo=pos-.36,hi=pos+.36;
    const cube=face([[lo,0,.45],[hi,0,.45],[hi,.9,.45],[lo,.9,.45]],'var(--plus)')+
      (degrees===0?'':(degrees>0?face([[lo,0,-.45],[lo,0,.45],[lo,.9,.45],[lo,.9,-.45]],'var(--edge)'):face([[hi,0,.45],[hi,0,-.45],[hi,.9,-.45],[hi,.9,.45]],'var(--edge)'))) +
      face([[lo,.9,-.45],[hi,.9,-.45],[hi,.9,.45],[lo,.9,.45]],'var(--ink)');
    return `<svg role="img" viewBox="0 0 500 170" aria-label="Pista spaziale, il cursore è a ${moto.firma(pos)} metri per t uguale a ${t} secondi.">${lanes}${ticks}${segment(project(0,0,-2),project(0,0,2),'var(--minus)',3)}${cube}${[-4,0,4,8,12].map(v=>{const [x,y]=project(v,0,2).split(',');return `<text class="svg-text" x="${x}" y="${+y+19}" text-anchor="middle">${v}</text>`}).join('')}${'<text class="svg-text" x="470" y="161" text-anchor="end">x (m)</text>'}</svg>`;
  }
  function home(){
    const previews=[
      ['passo','Passo','Una domanda alla volta, con un indizio quando serve.','Prova la sessione','<path d="M8 63h38V46h36V29h36V12h38" fill="none" stroke="currentColor" stroke-width="5"/>'],
      ['campo','Campo','Modifica il moto e confronta la previsione con la misura.','Apri il banco','<path d="M2 40h235" stroke="#8d9ea8"/><path d="M14 19h89" stroke="#79e0db" stroke-width="4"/><path d="M103 55h112" stroke="#f0ba56" stroke-width="4"/><path d="M103 19v36" stroke="#c2cbd1" stroke-dasharray="3 3"/>'],
      ['margine','Margine','Svolgi i passaggi sul foglio e ritrova il primo da rivedere.','Apri il quaderno','<path d="M5 14q52-4 91 12 43-16 91-12v44q-50-4-91 14Q58 55 5 58zM96 26v44" fill="none" stroke="currentColor" stroke-width="2.2"/>']
    ];
    return `<div class="wrap content"><div class="catalog-heading"><h1>Tre modi di studiare fisica</h1><p class="lead">Prova lo stesso esercizio sulle aree con segno. Puoi tornare qui dopo ogni prova per cambiare prospettiva.</p></div>
    <nav class="catalog" aria-label="Prototipi interattivi">${previews.map(([key,n,desc,cta,shape])=>`<a class="specimen ${key==='campo'?'camp':key==='margine'?'marg':''}" href="#${key}"><span class="sample"><svg aria-hidden="true" viewBox="0 0 240 82" preserveAspectRatio="xMinYMid meet">${shape}</svg></span><h2>${n}</h2><p>${desc}</p><span class="go">${cta}</span></a>`).join('')}</nav></div>`;
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
      $('#tx-message').textContent=ok?'Hai ottenuto −2 m. Il ritorno vale −14 m e supera i 12 m di andata.':!Number.isFinite(v)?'Inserisci un numero con il suo eventuale segno.':v===26?'26 m è la distanza totale. Sottrai i 14 m di ritorno dai 12 m di andata.':'Controlla il segno. Il ritorno vale 7 × (−2 m), poi somma i due contributi.';
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
    const rail=`<aside class="rail" aria-label="Avanzamento"><h2>La sessione</h2><ol>${['Prevedi','Controlla','Trasferisci'].map((v,i)=>`<li ${n===i+1?'aria-current="step"':''}>${v}</li>`).join('')}</ol><span class="mobile-step">Passo ${n} di 3</span></aside>`;
    let body=`<h1 tabindex="-1">Dove ti fermi?</h1><p class="lead">${situation}</p>`;
    if(s.stage==='start')body+=`<div class="plot">${graph(5,'passo')}</div><form id="prediction" novalidate>${radios(s.choice)}<p class="notice" id="prediction-message" role="status"></p><button class="primary">Controlla la previsione</button></form><details id="hint" ${s.hint?'open':''}><summary>Mi serve un indizio</summary><p>Sopra lo zero guadagni posizione. Sotto lo zero torni indietro. Confronta le superfici dei due rettangoli.</p></details>`;
    else if(s.stage==='worked')body+=`<div class="plot">${graph(5,'passo')}</div><div class="stack follow"><h2 id="phase" tabindex="-1">Confronta le due aree</h2><p>${interpretation(s.choice,2)}</p>${calculation(5)}<p>Hai camminato per 22 m. Lo spostamento è +2 m perché misura dove finisci rispetto alla partenza.</p><button class="primary" id="to-transfer">Prova con 7 s</button></div>`;
    else body='<h1 tabindex="-1">Trasferisci il metodo</h1><div class="follow">'+transfer(s)+'</div>';
    main.innerHTML=`<div class="wrap lesson-grid">${rail}<article class="session content">${body}</article></div>`;
    if(s.stage==='start'){prediction(s,()=>{s.stage='worked';show('#phase')});$('#hint').ontoggle=e=>{s.hint=e.target.open;save()}}
    else if(s.stage==='worked')stepLink(s);else bindTransfer(s);
  }
  function fieldLab(){
    const s=state.campo;
    const plot=()=>s.view==='chart'?graph(s.duration,'campo'):dataTable(s.duration);
    main.innerHTML=`<div class="wrap content"><h1 tabindex="-1">Banco del moto</h1><p class="lead">Cambia la durata del ritorno e osserva la posizione.</p>
    ${s.stage==='transfer'?`<div class="detail-panel">${transfer(s)}</div>`:`<div class="instrument"><section class="panel"><h2>Velocità v (m/s)</h2><div id="plot">${plot()}</div></section>
    <section class="panel console"><h2 id="dur">Durata del ritorno</h2><div class="stepper"><button id="less" aria-label="− Riduci di un secondo">−</button><output id="seconds" for="duration">${s.duration} s</output><button id="more" aria-label="+ Aumenta di un secondo">+</button></div>
    <div><input class="range" type="range" min="0" max="8" step="1" value="${s.duration}" id="duration" aria-labelledby="dur"><div class="scale" aria-hidden="true"><span>0 s</span><span>8 s</span></div></div>
    <div class="switcher" role="group" aria-label="Rappresentazione"><button id="chart" aria-pressed="${s.view==='chart'}">Grafico</button><button id="table" aria-pressed="${s.view==='table'}">Tabella</button></div>
    <button class="primary" id="predict">Fissa la previsione</button></section></div>
    <div class="track" id="track">${ruler(s.stage==='worked'?s.t:0,s.duration)}</div><div class="detail-panel" id="below"></div>`}</div>`;
    if(s.stage==='transfer'){bindTransfer(s);return}
    const updateBelow=()=>{
      const below=$('#below');
      if(s.stage==='start'){below.innerHTML='';return}
      if(s.stage==='predict'){
        below.innerHTML=`<form novalidate id="prediction" class="stack"><h2 id="phase" tabindex="-1">Dopo ${4+s.duration} secondi</h2>${radios(s.choice)}<p class="notice" id="prediction-message" role="status"></p><button class="primary">Misura la posizione</button></form>`;
        prediction(s,()=>{s.stage='worked';s.t=4+s.duration;show('#phase')});return
      }
      const m=moto.osserva(s.duration);
      below.innerHTML=`<div class="stack"><h2 id="phase" tabindex="-1">Posizione finale ${moto.firma(m.x)} m</h2><p>${interpretation(s.choice,m.x)}</p>${calculation(s.duration)}
      <label class="input-label">Istante sulla pista <output id="time">${s.t} s</output><input id="timeline" type="range" class="range" min="0" max="${m.totale}" value="${s.t}" step="1" aria-label="Istante sulla pista"></label>
      <p class="eq" id="instant"></p><details id="space" ${s.space?'open':''}><summary>Esplora la pista in 3D</summary><div class="space-view" id="spatial"></div><div class="actions"><label for="angle">Vista della pista</label><select id="angle"><option value="-30">Da sinistra</option><option value="0">Frontale</option><option value="30">Da destra</option></select></div></details>
      <button id="to-transfer" class="primary">Prova con 7 s</button></div>`;
      const measure=()=>{const v=moto.osserva(s.duration,s.t);$('#time').textContent=s.t+' s';$('#instant').textContent='Posizione all’istante scelto  '+moto.firma(v.x)+' m';$('#track').innerHTML=ruler(s.t,s.duration);$('#spatial').innerHTML=spatial(s.duration,s.t,s.angle);save()};
      $('#timeline').oninput=e=>{s.t=Number(e.target.value);measure()};
      $('#angle').value=String(s.angle);$('#angle').onchange=e=>{s.angle=Number(e.target.value);measure()};
      $('#space').ontoggle=e=>{s.space=e.target.open;save()};measure();stepLink(s);
    };
    const duration=$('#duration');
    const edges=()=>{$('#less').disabled=s.duration===0;$('#more').disabled=s.duration===8;duration.setAttribute('aria-valuetext',s.duration+' secondi')};
    const setDuration=v=>{s.duration=Math.max(0,Math.min(8,v));s.t=0;s.choice='';s.stage='start';s.space=false;duration.value=s.duration;$('#seconds').textContent=s.duration+' s';$('#plot').innerHTML=plot();$('#track').innerHTML=ruler(0,s.duration);edges();updateBelow();save()};
    duration.oninput=e=>setDuration(+e.target.value);$('#more').onclick=()=>setDuration(s.duration+1);$('#less').onclick=()=>setDuration(s.duration-1);edges();
    for(const view of ['chart','table'])$('#'+view).onclick=()=>{s.view=view;$('#chart').setAttribute('aria-pressed',String(view==='chart'));$('#table').setAttribute('aria-pressed',String(view==='table'));$('#plot').innerHTML=plot();save()};
    $('#predict').onclick=()=>{s.stage='predict';s.t=0;show('#phase')};updateBelow();
  }
  const sources=`<details><summary>Leggi la fonte</summary><p>Officina di Fisica · C1-Q027, versione 2 · «Aree di segno opposto».</p><p>${sourceText}</p></details>`;
  function notebook(){
    const s=state.margine;
    const labels=['Andata (m)','Ritorno (m)','Spostamento (m)'];
    main.innerHTML=`<div class="wrap content"><h1 tabindex="-1">Il segno del ritorno</h1><div class="spread"><section><h2>Consegna</h2><p class="lead">${situation}</p><div class="plot">${graph(5,'margine')}</div></section>
    <section><h2>Il tuo quaderno</h2><div class="print-only"><p>Calcola lo spostamento. Scrivi i segni, le unità e un controllo del risultato.</p>${[...labels,'Controllo'].map(l=>`<p class="ruled">${l}</p>`).join('')}<p>C1-Q027 · v2 · Officina di Fisica</p></div>
    <div class="screen-only">${s.stage==='transfer'?transfer(s):`<form class="notebook-form" id="notebook" novalidate>${labels.map((l,i)=>`<label class="input-label">${l}<input type="text" id="n${i}" inputmode="text" maxlength="12" autocomplete="off" aria-describedby="note${i}"></label><p id="note${i}" class="notice" role="status"></p>`).join('')}<button class="primary">Verifica i passaggi</button></form><div id="book-result" class="follow"></div>`}</div></section></div><div class="book-tools"><button class="print-button" id="print">Scheda da stampare</button>${sources}</div></div>`;
    $('#print').onclick=()=>window.print();
    if(s.stage==='transfer'){bindTransfer(s);return}
    function result(){const el=$('#book-result');el.innerHTML=s.stage==='worked'?`<div class="stack"><h3 tabindex="-1" id="phase">I tre passaggi tornano</h3><p>Ti fermi a +2 m. Per tornare alla partenza a −2 m/s sarebbero serviti 6 s.</p><button id="to-transfer">Prova con 7 s</button></div>`:'';if(s.stage==='worked')stepLink(s)}
    const m=moto.osserva(5),expected=[m.prima,m.seconda,m.x];
    for(let i=0;i<3;i++){
      const field=$('#n'+i);field.value=s.parts[i];field.oninput=()=>{s.stage='start';s.parts[i]=draft(field.value);for(let n=0;n<3;n++){$('#note'+n).textContent='';$('#n'+n).removeAttribute('aria-invalid')}result();save()};
    }
    $('#notebook').onsubmit=e=>{
      e.preventDefault();const inputs=labels.map((_,n)=>$('#n'+n));
      const wrong=inputs.findIndex((input,i)=>moto.numero(input.value)!==expected[i]);
      if(wrong<0){s.stage='worked';result();$('#phase').focus();save();return}
      const f=inputs[wrong],val=moto.numero(f.value);
      const hints=['Moltiplica la velocità positiva per i quattro secondi di andata.','Il ritorno dura cinque secondi. Scrivi il contributo nel verso negativo.','Somma i due spostamenti conservando il segno. 22 m è la distanza camminata.'];
      $('#note'+wrong).textContent=Number.isFinite(val)?hints[wrong]:'Scrivi un numero in metri, con il segno quando serve.';f.setAttribute('aria-invalid','true');f.focus()
    };result();
  }
  function show(focus){
    const key=name();save();document.body.className=key;
    document.title=(key==='index'?titles.index:titles[key]+' · Laboratorio di progetto');
    bar.innerHTML=`<div class="wrap head"><span class="word">${key==='index'?'Officina di Fisica · Studio di progetto':logo(key)+titles[key]}</span>${key==='index'?'<span class="edition">Edizione 1.0</span>':'<a class="compare-link" href="#index">Confronto</a>'}</div>`;
    if(key==='passo')pass();else if(key==='campo')fieldLab();else if(key==='margine')notebook();else main.innerHTML=home();
    if(focus){const target=$(focus);if(target){target.focus();target.scrollIntoView({block:'nearest'})}}
  }
  // The native skip link must not be interpreted as a route.
  $('.skip').onclick=e=>{e.preventDefault();main.focus();main.scrollIntoView()};
  window.addEventListener('hashchange',()=>{show();window.scrollTo(0,0);main.focus({preventScroll:true})});
  show();
})();
